import { test, expect } from "@playwright/test";

test.describe("Homepage and Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display homepage correctly", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/my10xCards/);

    // Check main heading
    await expect(page.locator('[data-testid="homepage-title"]')).toContainText("my10xCards");

    // Check homepage cards exist
    await expect(page.locator('[data-testid="action-my-flashcards"]')).toContainText("Moje fiszki");
    await expect(page.locator('[data-testid="action-add-flashcard"]')).toContainText("Dodaj fiszkę");
    await expect(page.locator('[data-testid="action-generate-ai"]')).toContainText("Generuj AI");
    await expect(page.locator('[data-testid="action-learn"]')).toContainText("Ucz się");

    // Check key navigation links from homepage cards
    await expect(page.locator('[data-testid="action-my-flashcards"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-learn"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-generate-ai"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-add-flashcard"]')).toBeVisible();
  });

  test("should navigate to flashcards page", async ({ page }) => {
    // Click on flashcards link
    await page.click('[data-testid="action-my-flashcards"]');

    // Should be on flashcards page
    await expect(page).toHaveURL("/flashcards");
    // Check that we're on the flashcards page by looking for the title
    await expect(page).toHaveTitle(/Moje fiszki/);
  });

  test("should navigate to learning page", async ({ page }) => {
    // Click on learn link
    await page.click('[data-testid="action-learn"]');

    // Should be on learn page
    await expect(page).toHaveURL("/learn");
    await expect(page).toHaveTitle(/Sesja nauki/);
  });

  test("should navigate to AI generation page", async ({ page }) => {
    // Click on generate link
    await page.click('[data-testid="action-generate-ai"]');

    // Should be on generate page
    await expect(page).toHaveURL("/generate");
    await expect(page).toHaveTitle(/Generuj fiszki AI/);
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still accessible
    await expect(page.locator('[data-testid="homepage-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-my-flashcards"]')).toContainText("Moje fiszki");

    // Check mobile navigation works
    await page.click('[data-testid="action-my-flashcards"]');
    await expect(page).toHaveURL("/flashcards");
  });

  test("should navigate to My Flashcards from hero section", async ({ page }) => {
    // Click button to go to flashcards
    await page.locator('[data-testid="nav-flashcards"]').click();

    // Verify redirection to flashcards page
    await expect(page).toHaveURL("/flashcards");
  });

  test("should navigate to Learn Session from hero section", async ({ page }) => {
    // Click button to go to learning session
    await page.locator('[data-testid="nav-learn"]').click();

    // Verify redirection to learning page
    await expect(page).toHaveURL("/learn");
  });

  test("should navigate to AI Generation from hero section", async ({ page }) => {
    // Click button to go to AI generation
    await page.locator('[data-testid="nav-generate"]').click();

    // Verify redirection to generation page
    await expect(page).toHaveURL("/generate");
  });
});
