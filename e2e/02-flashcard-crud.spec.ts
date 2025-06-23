import { test, expect } from "@playwright/test";
import { FlashcardsPage, FlashcardFormPage } from "./page-objects";

test.describe("Flashcard CRUD Operations", () => {
  let flashcardsPage: FlashcardsPage;
  let flashcardFormPage: FlashcardFormPage;

  test.beforeEach(async ({ page }) => {
    flashcardsPage = new FlashcardsPage(page);
    flashcardFormPage = new FlashcardFormPage(page);
    await flashcardsPage.navigate();
  });

  test("should display flashcards list page (US-004)", async ({ page }) => {
    await flashcardsPage.verifyPageLoaded();
    await expect(page.locator('[data-testid="flashcards-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
  });

  test("should create new flashcard manually (US-003)", async () => {
    await flashcardsPage.createFlashcard();
    await flashcardFormPage.verifyFormLoaded();

    const timestamp = Date.now();
    const frontText = `What is React? ${timestamp}`;
    const backText = `A JavaScript library for building user interfaces ${timestamp}`;

    await flashcardFormPage.createFlashcard(frontText, backText);
    await flashcardsPage.verifyFlashcardExists(frontText);
  });

  test("should validate flashcard form inputs (US-003)", async () => {
    await flashcardFormPage.navigateToCreate();
    await flashcardFormPage.verifyFormLoaded();
    await flashcardFormPage.verifyFormValidation();

    // Test with valid input
    await flashcardFormPage.fillForm("Valid front text", "Valid back text");
    await expect(flashcardFormPage.frontInput).toHaveValue("Valid front text");
    await expect(flashcardFormPage.backInput).toHaveValue("Valid back text");
    await expect(flashcardFormPage.submitButton).toBeEnabled();
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
    // First create a flashcard to search for
    const timestamp = Date.now();
    const searchableText = `Searchable Test ${timestamp}`;

    await flashcardsPage.createFlashcard();
    await flashcardFormPage.createFlashcard(searchableText, `Answer for ${searchableText}`);

    // Wait to ensure we're back on flashcards page with the new card
    await flashcardsPage.verifyPageLoaded();

    // Wait for the flashcard to appear in the list
    await expect(page.locator(`text=${searchableText}`).first()).toBeVisible();

    // Now search for the term we just created
    await flashcardsPage.searchFlashcards(searchableText);
    await flashcardsPage.verifySearchResults();

    // Should filter results to contain our search term
    const visibleCard = page.locator('[data-testid="flashcard-item"]:visible');
    await expect(visibleCard).toContainText(searchableText);
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
});
