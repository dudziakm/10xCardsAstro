import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - Basic Functionality", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check basic page structure
    await expect(page).toHaveTitle(/my10xCards/);
    await expect(page.locator("h1").first()).toContainText("my10xCards");

    // Check navigation cards
    await expect(page.locator("text=Moje fiszki").first()).toBeVisible();
    await expect(page.locator("text=Generuj AI").first()).toBeVisible();
  });

  test("can navigate to flashcards page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/flashcards"]');
    await expect(page).toHaveURL("/flashcards");
  });

  test("can navigate to generate page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/generate"]');
    await expect(page).toHaveURL("/generate");
  });

  test("can navigate to learn page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/learn"]');
    await expect(page).toHaveURL("/learn");
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
