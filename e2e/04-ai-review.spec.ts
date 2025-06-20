import { test, expect } from "@playwright/test";

test.describe("AI Flashcard Review and Acceptance", () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful AI generation for all tests
    await page.route("/api/flashcards/generate", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          generation_id: "test-generation-123",
          candidates: [
            {
              id: "candidate-1",
              front: "What is React?",
              back: "A JavaScript library for building user interfaces",
            },
            {
              id: "candidate-2",
              front: "What is JSX?",
              back: "JavaScript XML syntax extension for React",
            },
            {
              id: "candidate-3",
              front: "What are React Hooks?",
              back: "Functions that let you use state and lifecycle features in functional components",
            },
          ],
        }),
      });
    });

    await page.goto("/generate");

    // Generate some flashcards first
    const validText = "A".repeat(1500);
    await page.fill('textarea[name="inputText"]', validText);
    await page.click('button[type="submit"]');

    // Wait for generation to complete
    await page.waitForSelector('[data-testid="generated-flashcards"]');
  });

  test("should display generated flashcards for review (US-002)", async ({ page }) => {
    // Should show all generated flashcards
    const generatedCards = page.locator('[data-testid="generated-flashcard"]');
    const cardCount = await generatedCards.count();
    expect(cardCount).toBe(3);

    // Each card should show front and back
    for (let i = 0; i < cardCount; i++) {
      const card = generatedCards.nth(i);
      await expect(card.locator('[data-testid="card-front"]')).toBeVisible();
      await expect(card.locator('[data-testid="card-back"]')).toBeVisible();
    }

    // Should show action buttons for each card
    await expect(page.locator('[data-testid="accept-card"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="edit-card"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="reject-card"]')).toHaveCount(3);

    // Should show "Accept Selected" button
    await expect(page.locator('button:has-text("Zaakceptuj wybrane")')).toBeVisible();
  });

  test("should accept selected flashcards (US-002)", async ({ page }) => {
    // Mock the accept API endpoint
    await page.route("/api/flashcards/accept", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accepted: 2,
          flashcards: [
            { id: "flash-1", front: "What is React?", back: "A JavaScript library" },
            { id: "flash-2", front: "What is JSX?", back: "JavaScript XML syntax" },
          ],
        }),
      });
    });

    // Select first two flashcards
    await page.check('[data-testid="select-card"]:nth-child(1)');
    await page.check('[data-testid="select-card"]:nth-child(2)');

    // Click "Accept Selected"
    await page.click('button:has-text("Zaakceptuj wybrane")');

    // Should show success message
    await expect(page.locator("text=Zaakceptowano 2 fiszki")).toBeVisible();

    // Should redirect to flashcards list or show next step
    await expect(page).toHaveURL(/\/flashcards|\/generate/);
  });

  test("should edit flashcard before acceptance (US-002)", async ({ page }) => {
    // Click edit on first flashcard
    await page.click('[data-testid="edit-card"]:first-child');

    // Should show edit form
    await expect(page.locator('[data-testid="edit-form"]')).toBeVisible();

    // Edit the content
    const newFront = "What is React.js?";
    const newBack = "A JavaScript library for building modern user interfaces";

    await page.fill('[data-testid="edit-front"]', newFront);
    await page.fill('[data-testid="edit-back"]', newBack);

    // Save changes
    await page.click('button:has-text("Zapisz zmiany")');

    // Should show updated content
    await expect(page.locator(`text=${newFront}`)).toBeVisible();
    await expect(page.locator(`text=${newBack}`)).toBeVisible();

    // Should still be able to accept the edited card
    await page.check('[data-testid="select-card"]:first-child');
    await expect(page.locator('button:has-text("Zaakceptuj wybrane")')).toBeEnabled();
  });

  test("should reject flashcards (US-002)", async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="generated-flashcard"]').count();

    // Click reject on first flashcard
    await page.click('[data-testid="reject-card"]:first-child');

    // Should show confirmation
    await expect(page.locator("text=Czy na pewno chcesz odrzucić")).toBeVisible();

    // Confirm rejection
    await page.click('button:has-text("Odrzuć")');

    // Should remove the card from view
    const finalCount = await page.locator('[data-testid="generated-flashcard"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test("should validate edited flashcard content (US-002)", async ({ page }) => {
    // Click edit on first flashcard
    await page.click('[data-testid="edit-card"]:first-child');

    // Try to save with empty front
    await page.fill('[data-testid="edit-front"]', "");
    await page.click('button:has-text("Zapisz zmiany")');

    // Should show validation error
    await expect(page.locator("text=Przód fiszki nie może być pusty")).toBeVisible();

    // Try to save with text too long
    const tooLongFront = "A".repeat(201);
    await page.fill('[data-testid="edit-front"]', tooLongFront);
    await page.click('button:has-text("Zapisz zmiany")');

    // Should show validation error or truncate
    await expect(page.locator("text=Przekroczono limit 200 znaków")).toBeVisible();
  });

  test("should handle select all functionality", async ({ page }) => {
    // Should have "Select All" option
    await expect(page.locator('button:has-text("Zaznacz wszystkie")')).toBeVisible();

    // Click "Select All"
    await page.click('button:has-text("Zaznacz wszystkie")');

    // All checkboxes should be checked
    const checkboxes = page.locator('[data-testid="select-card"]');
    const checkboxCount = await checkboxes.count();

    for (let i = 0; i < checkboxCount; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }

    // Click "Deselect All"
    await page.click('button:has-text("Odznacz wszystkie")');

    // All checkboxes should be unchecked
    for (let i = 0; i < checkboxCount; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test("should prevent acceptance with no cards selected", async ({ page }) => {
    // Make sure no cards are selected
    const checkboxes = page.locator('[data-testid="select-card"]');
    const checkboxCount = await checkboxes.count();

    for (let i = 0; i < checkboxCount; i++) {
      await checkboxes.nth(i).uncheck();
    }

    // Accept button should be disabled
    await expect(page.locator('button:has-text("Zaakceptuj wybrane")')).toBeDisabled();
  });

  test("should show preview mode for flashcards", async ({ page }) => {
    // Click preview on first flashcard
    await page.click('[data-testid="preview-card"]:first-child');

    // Should show preview modal/popup
    await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible();

    // Should show front side first
    await expect(page.locator('[data-testid="preview-front"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-back"]')).toBeHidden();

    // Click to flip
    await page.click('[data-testid="preview-card-content"]');

    // Should show back side
    await expect(page.locator('[data-testid="preview-back"]')).toBeVisible();

    // Close preview
    await page.click('[data-testid="close-preview"]');
    await expect(page.locator('[data-testid="preview-modal"]')).toBeHidden();
  });

  test("should handle API errors during acceptance", async ({ page }) => {
    // Mock API error
    await page.route("/api/flashcards/accept", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to save flashcards" }),
      });
    });

    // Select a card and try to accept
    await page.check('[data-testid="select-card"]:first-child');
    await page.click('button:has-text("Zaakceptuj wybrane")');

    // Should show error message
    await expect(page.locator("text=Nie udało się zapisać fiszek")).toBeVisible();

    // Should allow retry
    await expect(page.locator('button:has-text("Zaakceptuj wybrane")')).toBeEnabled();
  });

  test("should maintain selection state during editing", async ({ page }) => {
    // Select first card
    await page.check('[data-testid="select-card"]:first-child');

    // Edit the card
    await page.click('[data-testid="edit-card"]:first-child');
    await page.fill('[data-testid="edit-front"]', "Updated front");
    await page.click('button:has-text("Zapisz zmiany")');

    // Card should still be selected after editing
    await expect(page.locator('[data-testid="select-card"]:first-child')).toBeChecked();
  });
});
