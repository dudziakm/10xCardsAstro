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

    // Declare elements first
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');
    const submitButton = page.locator('[data-testid="generate-button"]');

    await expect(promptTextarea).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Generate some flashcards first
    const timestamp = Date.now();
    const validText =
      `React learning content ${timestamp}. JavaScript library for building user interfaces. Components and state management. `.repeat(
        20
      ); // Make it long enough

    // Clear the field first, then fill
    await promptTextarea.click();
    await promptTextarea.clear();
    await promptTextarea.fill(validText);

    // Wait for button to be enabled after filling
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();

    // Wait for generation to complete
    await page.waitForSelector('[data-testid="generated-flashcards"]');
  });

  test("should display generated flashcards for review (US-002)", async ({ page }) => {
    // Should show candidate review interface
    await expect(page.locator('[data-testid="generated-flashcards"]')).toBeVisible();

    // Should show at least one candidate card
    await expect(page.locator('[data-testid="candidate-card-0"]')).toBeVisible();

    // Should show selection controls
    await expect(page.locator('[data-testid="select-all-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-none-button"]')).toBeVisible();

    // Should show accept button
    await expect(page.locator('[data-testid="accept-candidates-button"]')).toBeVisible();
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

    // Declare elements first
    const firstCheckbox = page.locator('[data-testid="candidate-checkbox-0"]');
    const acceptButton = page.locator('[data-testid="accept-candidates-button"]');

    await expect(firstCheckbox).toBeVisible();
    await expect(acceptButton).toBeVisible();

    // Select first flashcard
    await firstCheckbox.check();

    // Click "Accept Selected"
    await expect(acceptButton).toBeEnabled();
    await acceptButton.click();

    // Should redirect to flashcards list
    await expect(page).toHaveURL("/flashcards");
  });

  test("should handle select all functionality", async ({ page }) => {
    // Declare elements first
    const selectAllButton = page.locator('[data-testid="select-all-button"]');
    const selectNoneButton = page.locator('[data-testid="select-none-button"]');
    const firstCheckbox = page.locator('[data-testid="candidate-checkbox-0"]');

    await expect(selectAllButton).toBeVisible();
    await expect(selectNoneButton).toBeVisible();
    await expect(firstCheckbox).toBeVisible();

    // Click "Select All"
    await selectAllButton.click();

    // First checkbox should be checked
    await expect(firstCheckbox).toBeChecked();

    // Click "Deselect All"
    await selectNoneButton.click();

    // First checkbox should be unchecked
    await expect(firstCheckbox).not.toBeChecked();
  });

  test("should prevent acceptance with no cards selected", async ({ page }) => {
    // Declare elements first
    const selectNoneButton = page.locator('[data-testid="select-none-button"]');
    const acceptButton = page.locator('[data-testid="accept-candidates-button"]');

    await expect(selectNoneButton).toBeVisible();
    await expect(acceptButton).toBeVisible();

    // Make sure no cards are selected
    await selectNoneButton.click();

    // Accept button should be disabled
    await expect(acceptButton).toBeDisabled();
  });
});
