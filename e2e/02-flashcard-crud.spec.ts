import { test, expect } from "@playwright/test";

test.describe("Flashcard CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to flashcards page before each test
    await page.goto("/flashcards");
  });

  test("should display flashcards list page (US-004)", async ({ page }) => {
    // Check page title and heading - use more specific selector to avoid navigation
    await expect(page.locator("main h2")).toContainText("Moje fiszki");

    // Check if flashcards list is visible
    await expect(page.locator('[data-testid="flashcards-list"]')).toBeVisible();

    // Check if "Create New" button exists
    await expect(page.locator('[data-testid="create-flashcard"]')).toBeVisible();

    // Check if search bar exists
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
  });

  test("should create new flashcard manually (US-003)", async ({ page }) => {
    // Click "Create New Flashcard" button
    await page.locator('[data-testid="create-flashcard"]').click();

    // Should navigate to create form
    await expect(page).toHaveURL("/flashcards/new");

    // Fill in the form
    const timestamp = Date.now();
    const frontText = `What is React? ${timestamp}`;
    const backText = `A JavaScript library for building user interfaces ${timestamp}`;

    await page.fill('[data-testid="front-textarea"]', frontText);
    await page.fill('[data-testid="back-textarea"]', backText);

    // Submit the form
    const submitButton = page.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Should redirect back to flashcards list
    await expect(page).toHaveURL("/flashcards");

    // Should see success message or the new flashcard
    await expect(page.locator('[data-testid="flashcard-item"]').first()).toContainText(frontText);
  });

  test("should validate flashcard form inputs (US-003)", async ({ page }) => {
    await page.goto("/flashcards/new");

    // Try to submit empty form - should be disabled
    await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();

    // Check form fields are visible
    const frontField = page.locator('[data-testid="front-textarea"]');
    const backField = page.locator('[data-testid="back-textarea"]');

    // Check required validation
    await expect(frontField).toBeVisible();
    await expect(backField).toBeVisible();

    // Test with valid input
    await page.fill('[data-testid="front-textarea"]', "Valid front text");
    await page.fill('[data-testid="back-textarea"]', "Valid back text");

    // Form should accept valid input and enable submit button
    await expect(frontField).toHaveValue("Valid front text");
    await expect(backField).toHaveValue("Valid back text");
    await expect(page.locator('[data-testid="submit-button"]')).toBeEnabled();
  });

  test("should edit existing flashcard (US-005)", async ({ page }) => {
    // Assume there's at least one flashcard
    await page.goto("/flashcards");

    // Click edit button on first flashcard
    const editButton = page.locator('[data-testid="edit-flashcard"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Should navigate to edit form
      await expect(page.locator("h1")).toContainText("Edytuj fiszkę");

      // Modify the flashcard
      const timestamp = Date.now();
      const newFrontText = `Updated: What is Vue.js? ${timestamp}`;
      await page.fill('[data-testid="front-textarea"]', newFrontText);

      // Save changes
      const submitButton = page.locator('[data-testid="submit-button"]');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Should redirect back to list
      await expect(page).toHaveURL("/flashcards");

      // Should see updated content
      await expect(page.locator('[data-testid="flashcard-item"]').first()).toContainText(newFrontText);
    }
  });

  test("should delete flashcard with confirmation (US-006)", async ({ page }) => {
    await page.goto("/flashcards");

    // Get initial count of flashcards
    const initialCards = await page.locator('[data-testid="flashcard-item"]').count();

    if (initialCards > 0) {
      // Click delete button on first flashcard
      await page.locator('[data-testid="delete-flashcard"]').first().click();

      // Should show confirmation dialog
      await expect(page.locator("text=Czy na pewno chcesz usunąć")).toBeVisible();

      // Confirm deletion
      const deleteButton = page.locator('button:has-text("Usuń")');
      await expect(deleteButton).toBeEnabled();
      await deleteButton.click();

      // Should redirect back to list with one less flashcard
      const finalCards = await page.locator('[data-testid="flashcard-item"]').count();
      expect(finalCards).toBe(initialCards - 1);
    }
  });

  test("should cancel flashcard deletion (US-006)", async ({ page }) => {
    await page.goto("/flashcards");

    const initialCards = await page.locator('[data-testid="flashcard-item"]').count();

    if (initialCards > 0) {
      // Click delete button
      await page.locator('[data-testid="delete-flashcard"]').first().click();

      // Cancel deletion
      const cancelButton = page.locator('button:has-text("Anuluj")');
      await expect(cancelButton).toBeEnabled();
      await cancelButton.click();

      // Should return to list with same number of flashcards
      const finalCards = await page.locator('[data-testid="flashcard-item"]').count();
      expect(finalCards).toBe(initialCards);
    }
  });

  test("should search flashcards (US-004)", async ({ page }) => {
    await page.goto("/flashcards");

    // Type in search box
    const searchQuery = "React";
    await page.fill('[data-testid="search-input"]', searchQuery);

    // Wait for search results
    await page.waitForTimeout(1000); // Debounce

    // Should filter results
    const visibleCards = page.locator('[data-testid="flashcard-item"]:visible');
    const cardCount = await visibleCards.count();

    if (cardCount > 0) {
      // All visible cards should contain the search term
      for (let i = 0; i < cardCount; i++) {
        const cardText = await visibleCards.nth(i).textContent();
        expect(cardText?.toLowerCase()).toContain(searchQuery.toLowerCase());
      }
    }
  });

  test("should paginate flashcards (US-004)", async ({ page }) => {
    await page.goto("/flashcards");

    // Check if pagination exists (only if there are enough flashcards)
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();

    if (paginationExists) {
      // Should show page numbers
      await expect(page.locator('[data-testid="page-number"]')).toBeVisible();

      // Check current page is highlighted
      await expect(page.locator('[data-testid="current-page"]')).toBeVisible();

      // If there's a next page, test navigation
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // Should navigate to page 2
        await expect(page).toHaveURL(/page=2/);
        await expect(page.locator('[data-testid="current-page"]')).toContainText("2");
      }
    }
  });

  test("should handle empty flashcards list", async ({ page }) => {
    // This test assumes no flashcards exist or we can clear them
    await page.goto("/flashcards");

    // If no flashcards, should show appropriate message
    const noFlashcardsMessage = page.locator("text=Nie masz jeszcze żadnych fiszek");
    const flashcardsList = page.locator('[data-testid="flashcard-item"]');

    const hasFlashcards = (await flashcardsList.count()) > 0;

    if (!hasFlashcards) {
      await expect(noFlashcardsMessage).toBeVisible();
      await expect(page.locator('[data-testid="create-first-flashcard"]')).toBeVisible();
    }
  });
});
