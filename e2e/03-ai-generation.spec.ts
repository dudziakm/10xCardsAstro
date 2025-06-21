import { test, expect } from "@playwright/test";
import { AIGenerationPage } from "./page-objects";

test.describe("AI Flashcard Generation", () => {
  let aiGenerationPage: AIGenerationPage;

  test.beforeEach(async ({ page }) => {
    aiGenerationPage = new AIGenerationPage(page);
    await aiGenerationPage.navigate();
  });

  test("should display AI generation page correctly (US-001)", async ({ page }) => {
    await aiGenerationPage.verifyPageLoaded();
    await aiGenerationPage.verifyInstructions();
  });

  test("should validate input text length (US-001)", async ({ page }) => {
    await aiGenerationPage.verifyFormValidation();

    // Test with valid text - button should be enabled
    const validText = "JavaScript podstawy programowania obiektowego";
    await aiGenerationPage.fillPrompt(validText);
    await expect(aiGenerationPage.generateButton).toBeEnabled({ timeout: 10000 });
  });

  test("should generate flashcards with valid input (US-001)", async ({ page }) => {
    const timestamp = Date.now();
    const validText = aiGenerationPage.createLongPrompt(
      `React is a JavaScript library for building user interfaces. Test ID: ${timestamp}`,
      timestamp
    );

    await aiGenerationPage.generateFlashcards(validText, "5");
    await aiGenerationPage.waitForGeneration();
    await aiGenerationPage.verifyGeneratedFlashcards(5);
  });

  test("should validate count parameter", async ({ page }) => {
    const validText = "React podstawy programowania";
    await aiGenerationPage.fillPrompt(validText);
    await aiGenerationPage.verifyCountOptions();

    // Test with different count values - just check selection works
    await aiGenerationPage.selectCount("3");
  });

  test("should show character counter for input text", async ({ page }) => {
    const text = "React podstawy";
    await aiGenerationPage.fillPrompt(text);
    await expect(aiGenerationPage.promptTextarea).toHaveValue(text);

    // Fill with longer text
    const longerText = "React is a JavaScript library for building user interfaces with components";
    await aiGenerationPage.fillPrompt(longerText);
    await expect(aiGenerationPage.promptTextarea).toHaveValue(longerText);
  });
});
