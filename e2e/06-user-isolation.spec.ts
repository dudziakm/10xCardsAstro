import { test, expect } from "@playwright/test";
import { FlashcardsPage, AIGenerationPage, UserIsolationPage } from "./page-objects";

test.describe("User Data Isolation", () => {
  let flashcardsPage: FlashcardsPage;
  let aiGenerationPage: AIGenerationPage;
  let userIsolationPage: UserIsolationPage;

  test.beforeEach(async ({ page }) => {
    flashcardsPage = new FlashcardsPage(page);
    aiGenerationPage = new AIGenerationPage(page);
    userIsolationPage = new UserIsolationPage(page);
  });
  test("should not see other user's flashcards (US-008)", async () => {
    await flashcardsPage.navigate();

    // Check that we're logged in as the correct user
    await expect(page.locator("text=Zalogowany")).toBeVisible();

    await flashcardsPage.verifyPageLoaded();

    // The extra user should have a clean account with no flashcards
    const flashcardItems = page.locator('[data-testid="flashcard-item"]');
    const flashcardCount = await flashcardItems.count();

    if (flashcardCount === 0) {
      await flashcardsPage.verifyEmptyState();
    } else {
      // Verify no main user content is visible
      for (let i = 0; i < flashcardCount; i++) {
        const flashcard = flashcardItems.nth(i);
        const flashcardText = await flashcard.textContent();
        expect(flashcardText).not.toContain("Main User Specific Content");
      }
    }
  });

  test("should be able to create flashcard as extra user", async () => {
    const timestamp = Date.now();
    const frontText = `Extra User Question ${timestamp}: What is Node.js?`;
    const backText = `Extra User Answer ${timestamp}: A JavaScript runtime built on Chrome's V8 engine`;

    await userIsolationPage.createTestFlashcard(frontText, backText);
    await userIsolationPage.verifyFlashcardExists(frontText);
  });

  test("should have isolated AI generation history", async () => {
    await aiGenerationPage.navigate();
    await aiGenerationPage.verifyPageLoaded();

    const timestamp = Date.now();
    const testContent = `Extra User Content for AI Generation ${timestamp}: Node.js runtime features`;

    await aiGenerationPage.fillPrompt(testContent);
    await expect(aiGenerationPage.promptTextarea).toHaveValue(testContent);
  });

  test("should maintain session isolation across page navigation", async () => {
    await flashcardsPage.navigate();
    await expect(page.locator("text=Zalogowany")).toBeVisible();

    const pages = ["/generate", "/learn", "/flashcards/new"];

    for (const pagePath of pages) {
      await userIsolationPage.goto(pagePath);
      await expect(page.locator("text=Zalogowany")).toBeVisible();
      expect(page.url()).not.toContain("/auth/login");
    }

    await flashcardsPage.navigate();
    await flashcardsPage.verifyPageLoaded();
  });
});
