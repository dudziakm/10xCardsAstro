import { test, expect } from "@playwright/test";

test.describe("Homepage and Navigation", () => {
  test("should display homepage correctly", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/my10xCards/);

    // Check main heading
    await expect(page.locator("h1")).toContainText("my10xCards");

    // Check homepage cards exist (use more specific selectors to avoid navigation duplicates)
    await expect(page.locator("a[href='/flashcards'] .font-semibold")).toContainText("Moje fiszki");
    await expect(page.locator("a[href='/flashcards/new'] .font-semibold")).toContainText("Dodaj fiszkę");
    await expect(page.locator("a[href='/generate'] .font-semibold")).toContainText("Generuj AI");
    await expect(page.locator("a[href='/learn'] .font-semibold")).toContainText("Ucz się");

    // Check key navigation links from homepage cards
    await expect(page.locator('a[href="/flashcards"]')).toBeVisible();
    await expect(page.locator('a[href="/learn"]')).toBeVisible();
    await expect(page.locator('a[href="/generate"]')).toBeVisible();
    await expect(page.locator('a[href="/flashcards/new"]')).toBeVisible();
  });

  test("should navigate to flashcards page", async ({ page }) => {
    await page.goto("/");

    // Click on flashcards link
    await page.click('a[href="/flashcards"]');

    // Should be on flashcards page
    await expect(page).toHaveURL("/flashcards");
    // Check that we're on the flashcards page by looking for the title
    await expect(page).toHaveTitle(/Moje fiszki/);
  });

  test("should navigate to learning page", async ({ page }) => {
    await page.goto("/");

    // Click on learn link
    await page.click('a[href="/learn"]');

    // Should be on learn page
    await expect(page).toHaveURL("/learn");
    await expect(page).toHaveTitle(/Sesja nauki/);
  });

  test("should navigate to AI generation page", async ({ page }) => {
    await page.goto("/");

    // Click on generate link
    await page.click('a[href="/generate"]');

    // Should be on generate page
    await expect(page).toHaveURL("/generate");
    await expect(page).toHaveTitle(/Generuj fiszki AI/);
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that content is still accessible
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("a[href='/flashcards'] .font-semibold")).toContainText("Moje fiszki");

    // Check mobile navigation works
    await page.click('a[href="/flashcards"]');
    await expect(page).toHaveURL("/flashcards");
  });
});
