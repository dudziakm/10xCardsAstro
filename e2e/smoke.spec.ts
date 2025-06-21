import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects";

test.describe("Smoke Tests - Basic Functionality", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test("homepage loads successfully", async ({ page }) => {
    await homePage.navigate();
    await homePage.verifyPageLoaded();
    await homePage.verifyActionCards();
  });

  test("should navigate to flashcards page", async ({ page }) => {
    await homePage.navigate();
    await homePage.goToFlashcards();
    await expect(page.locator("main h2")).toContainText("Moje fiszki");
  });

  test("should navigate to AI generation page", async ({ page }) => {
    await homePage.navigate();
    await homePage.goToGenerateAI();
    await expect(page.locator("main h1, main h2")).toContainText("Generuj fiszki AI");
  });

  test("should navigate to learning session page", async ({ page }) => {
    await homePage.navigate();
    await homePage.goToLearn();
    await expect(page.locator("h1")).toContainText("Sesja nauki");
  });

  test("API endpoints are accessible", async ({ page }) => {
    // Test flashcards API
    const response = await page.request.get("/api/flashcards");
    expect(response.status()).toBeLessThan(500); // Should not be server error

    // Test learn API
    const learnResponse = await page.request.get("/api/learn/session");
    expect(learnResponse.status()).toBeLessThan(500);
  });
});
