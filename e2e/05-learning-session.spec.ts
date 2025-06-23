import { test } from "@playwright/test";
import { LearningPage } from "./page-objects";

test.describe("Learning Session with Spaced Repetition", () => {
  let learningPage: LearningPage;

  test.beforeEach(async ({ page }) => {
    learningPage = new LearningPage(page);
  });

  test("should navigate to learning session page (US-008)", async () => {
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
  });

  test("should display learning page title and UI elements", async () => {
    await learningPage.navigate();
    await expect(learningPage.pageHeading).toContainText("Sesja nauki");
  });

  test("should handle no cards available scenario (US-008)", async () => {
    // This test should mock empty session instead of relying on actual empty state
    await learningPage.mockEmptySession();
    await learningPage.navigate();
    await learningPage.verifySessionEnded();
    await learningPage.verifyNoCardsAvailable();
  });

  test("should show card metadata (difficulty, review count)", async () => {
    await learningPage.resetLearningProgress();
    await learningPage.navigate();
    await learningPage.verifyPageLoaded();
    await learningPage.verifyCardMetadata();
  });
});
