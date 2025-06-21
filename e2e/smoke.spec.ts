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

  test("should navigate to flashcards page", async ({ page }) => {
    await page.goto("/");
    
    // Declare elements first
    const flashcardsLink = page.locator('[data-testid="action-my-flashcards"]');
    
    await expect(flashcardsLink).toBeVisible();
    
    // Navigate to flashcards
    await flashcardsLink.click();

    // Check for correct URL and title
    await expect(page).toHaveURL("/flashcards");
    await expect(page.locator("main h2")).toContainText("Moje fiszki");
  });

  test("should navigate to AI generation page", async ({ page }) => {
    await page.goto("/");
    
    // Declare elements first
    const generateLink = page.locator('[data-testid="action-generate-ai"]');
    
    await expect(generateLink).toBeVisible();
    
    // Navigate to generate page
    await generateLink.click();

    // Check for correct URL and title
    await expect(page).toHaveURL("/generate");
    await expect(page.locator("main h1, main h2")).toContainText("Generuj fiszki AI");
  });

  test("should navigate to learning session page", async ({ page }) => {
    await page.goto("/");
    
    // Declare elements first
    const learnLink = page.locator('[data-testid="action-learn"]');
    
    await expect(learnLink).toBeVisible();
    
    // Navigate to learn page
    await learnLink.click();

    // Check for correct URL and title
    await expect(page).toHaveURL("/learn");
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
