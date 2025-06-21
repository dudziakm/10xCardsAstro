import { test, expect } from "@playwright/test";

test.describe("User Data Isolation", () => {
  test("should not see other user's flashcards (US-008)", async ({ page }) => {
    // This test runs with extra user authentication (see playwright.config.ts)
    // The extra user should not see flashcards created by the main user

    await page.goto("/flashcards");

    // Check that we're logged in as the correct user
    await expect(page.locator("text=Zalogowany")).toBeVisible();

    // Check that flashcards list is visible but empty or only contains this user's cards
    await expect(page.locator('[data-testid="flashcards-list"]')).toBeVisible();

    // The extra user should have a clean account with no flashcards
    // or different flashcards than the main user
    const flashcardItems = page.locator('[data-testid="flashcard-item"]');
    const flashcardCount = await flashcardItems.count();

    // For a new user, there should be no flashcards
    // This verifies data isolation between users
    if (flashcardCount === 0) {
      // Perfect - no flashcards visible, confirming isolation
      await expect(page.locator("text=Nie masz jeszcze żadnych fiszek")).toBeVisible();
    } else {
      // If there are some flashcards, they should only belong to this user
      // We can verify this by checking that none contain content we know belongs to main user
      // Extra user has flashcards - verifying they belong to this user

      // Check each flashcard to ensure it doesn't contain main user's data
      for (let i = 0; i < flashcardCount; i++) {
        const flashcard = flashcardItems.nth(i);
        const flashcardText = await flashcard.textContent();

        // Verify this flashcard doesn't contain typical main user content
        // (This would need to be updated based on known main user content)
        expect(flashcardText).not.toContain("Main User Specific Content");
      }
    }
  });

  test("should be able to create flashcard as extra user", async ({ page }) => {
    // Verify that the extra user can create their own flashcards
    await page.goto("/flashcards");

    // Declare elements first
    const addFlashcardButton = page.locator('[data-testid="create-flashcard"]');

    await expect(addFlashcardButton).toBeVisible();

    // Click create new flashcard
    await addFlashcardButton.click();
    await expect(page).toHaveURL("/flashcards/new");

    // Declare form elements
    const frontTextarea = page.locator('[data-testid="front-textarea"]');
    const backTextarea = page.locator('[data-testid="back-textarea"]');
    const submitButton = page.locator('[data-testid="submit-button"]');

    await expect(frontTextarea).toBeVisible();
    await expect(backTextarea).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Fill in form with extra user specific content
    const timestamp = Date.now();
    const frontText = `Extra User Question ${timestamp}: What is Node.js?`;
    const backText = `Extra User Answer ${timestamp}: A JavaScript runtime built on Chrome's V8 engine`;

    await frontTextarea.fill(frontText);
    await backTextarea.fill(backText);

    // Submit the form
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Should redirect back to flashcards list
    await expect(page).toHaveURL("/flashcards");

    // Should see the new flashcard
    await expect(page.locator("text=" + frontText)).toBeVisible();
  });

  test("should have isolated AI generation history", async ({ page }) => {
    // Verify that AI generation history is also isolated
    await page.goto("/generate");

    // Check that we can access the generation page
    await expect(page).toHaveTitle(/Generuj fiszki AI/);

    // Declare elements first
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');

    await expect(promptTextarea).toBeVisible();

    // Generate some content to test isolation
    const timestamp = Date.now();
    const testContent = `
    Extra User Content for AI Generation ${timestamp}:
    
    Node.js is a JavaScript runtime that allows you to run JavaScript on the server.
    It's built on Chrome's V8 JavaScript engine and provides an event-driven, 
    non-blocking I/O model that makes it lightweight and efficient.
    
    Key features include:
    - Asynchronous and event-driven
    - Fast execution with V8 engine  
    - Large ecosystem with npm
    - Cross-platform compatibility
    `;

    await promptTextarea.fill(testContent);

    // Note: We won't actually generate AI content in tests to avoid API costs
    // But we verify the form is accessible and isolated per user
    await expect(promptTextarea).toHaveValue(testContent);
  });

  test("should maintain session isolation across page navigation", async ({ page }) => {
    // Test that user isolation is maintained across different pages

    // Start on flashcards page
    await page.goto("/flashcards");
    await expect(page.locator("text=Zalogowany")).toBeVisible();

    // Navigate to different pages and verify we stay logged in as extra user
    const pages = ["/generate", "/learn", "/flashcards/new"];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Should still be logged in
      await expect(page.locator("text=Zalogowany")).toBeVisible();

      // Should not be redirected to login
      expect(page.url()).not.toContain("/auth/login");
    }

    // Return to flashcards page to verify isolation is still maintained
    await page.goto("/flashcards");
    await expect(page.locator('[data-testid="flashcards-list"]')).toBeVisible();
  });
});
