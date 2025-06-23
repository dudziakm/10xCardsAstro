import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects";

test.describe("Homepage and Navigation", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test("should display homepage correctly", async ({ page }) => {
    await homePage.verifyPageLoaded();
    await homePage.verifyActionCards();

    // Check additional homepage cards
    await expect(page.locator('[data-testid="action-add-flashcard"]')).toContainText("Dodaj fiszkę");
    await expect(page.locator('[data-testid="action-add-flashcard"]')).toBeVisible();
  });

  test("should navigate to flashcards page", async () => {
    await homePage.goToFlashcards();
    await expect(homePage.page).toHaveTitle(/Moje fiszki/);
  });

  test("should navigate to learning page", async () => {
    await homePage.goToLearn();
    await expect(homePage.page).toHaveTitle(/Sesja nauki/);
  });

  test("should navigate to AI generation page", async () => {
    await homePage.goToGenerateAI();
    await expect(homePage.page).toHaveTitle(/Generuj fiszki AI/);
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still accessible
    await homePage.verifyPageLoaded();

    // Check mobile navigation works
    await homePage.goToFlashcards();
  });

  test("should navigate to My Flashcards from hero section", async () => {
    await homePage.goToFlashcardsViaNav();
  });

  test("should navigate to Learn Session from hero section", async () => {
    await homePage.goToLearnViaNav();
  });

  test("should navigate to AI Generation from hero section", async () => {
    await homePage.goToGenerateViaNav();
  });
});
