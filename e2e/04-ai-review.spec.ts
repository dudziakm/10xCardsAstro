import { test } from "@playwright/test";
import { AIGenerationPage, AIReviewPage } from "./page-objects";

test.describe("AI Flashcard Review and Acceptance", () => {
  let aiGenerationPage: AIGenerationPage;
  let aiReviewPage: AIReviewPage;

  test.beforeEach(async ({ page }) => {
    aiGenerationPage = new AIGenerationPage(page);
    aiReviewPage = new AIReviewPage(page);

    await aiGenerationPage.navigate();

    // Generate some flashcards first
    const timestamp = Date.now();
    const validText = aiGenerationPage.createLongPrompt(
      `React learning content ${timestamp}. JavaScript library for building user interfaces. Components and state management.`,
      timestamp
    );

    await aiGenerationPage.generateFlashcards(validText, "5");
    await aiGenerationPage.waitForGeneration();
  });

  test("should display generated flashcards for review (US-002)", async () => {
    await aiReviewPage.verifyReviewInterface();
    await aiReviewPage.verifyCandidatesVisible();
  });

  test("should accept selected flashcards (US-002)", async () => {
    await aiReviewPage.mockAcceptAPI();
    await aiReviewPage.selectCandidate(0);
    await aiReviewPage.verifyAcceptButtonEnabled();
    await aiReviewPage.acceptSelected();
  });

  test("should handle select all functionality", async () => {
    await aiReviewPage.selectAll();
    await aiReviewPage.selectNone();
  });

  test("should prevent acceptance with no cards selected", async () => {
    await aiReviewPage.selectNone();
    await aiReviewPage.verifyAcceptButtonDisabled();
  });
});
