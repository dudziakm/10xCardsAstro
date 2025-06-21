import { test, expect } from "@playwright/test";
import { LearningPage } from "./page-objects";

test.describe("Learning Session with Spaced Repetition", () => {
  let learningPage: LearningPage;

  test.beforeEach(async ({ page }) => {
    learningPage = new LearningPage(page);
  });
  test("should display learning session page correctly (US-008)", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await expect(page.locator("text=Kliknij aby zobaczyć odpowiedź")).toBeVisible();
  });

  test("should start learning session and display first card (US-008)", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.verifyInitialCardState();
  });

  test("should show back of the card after clicking (US-007)", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.flipCard();
    await learningPage.verifyRatingButtons();
    await learningPage.verifyRatingInstruction();
  });

  test("should load next card after rating", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.flipCard();
    await learningPage.rateCard(4);
    await learningPage.waitForNextCard();
  });

  test("should update session stats after rating", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.verifySessionStats();
    await learningPage.flipCard();
    await learningPage.rateCard(3);
    await learningPage.verifyRatingConfirmation();
  });

  test("should show summary when session ends", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.endSession();
  });

  test("should show rating labels and intervals (US-008)", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.flipCard();
    await learningPage.verifyRatingLabels();
    await learningPage.verifyIntervalInfo();
  });

  test("should handle no cards available scenario (US-008)", async ({ page }) => {
    await learningPage.mockEmptySession();
    await learningPage.navigate();
    await learningPage.verifySessionEnded();
    await learningPage.verifyNoCardsAvailable();
  });

  test("should show card metadata (difficulty, review count)", async ({ page }) => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.verifyCardMetadata();
  });
});
