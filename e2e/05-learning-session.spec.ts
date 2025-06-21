import { test, expect } from "@playwright/test";

test.describe("Learning Session with Spaced Repetition", () => {
  test("should display learning session page correctly (US-008)", async ({ page }) => {
    await page.goto("/learn");

    // Check page title and heading
    await expect(page.locator("h1")).toContainText("Sesja nauki");

    // Should automatically load first card (no start button needed)
    await expect(page.locator('[data-testid="learning-card"]')).toBeVisible();

    // Check instructions
    await expect(page.locator("text=Kliknij aby zobaczyć odpowiedź")).toBeVisible();
  });

  test("should start learning session and display first card (US-008)", async ({ page }) => {
    await page.goto("/learn");

    // Should automatically load first card
    await page.waitForSelector('[data-testid="learning-card"]');

    // Should display card front only initially
    await expect(page.locator('[data-testid="card-front"]')).toBeVisible();

    // Back should not be visible initially
    await expect(page.locator('[data-testid="card-back"]')).toBeHidden();

    // Should show instruction to click for answer
    await expect(page.locator("text=Kliknij aby zobaczyć odpowiedź")).toBeVisible();
  });

  test("should show back of the card after clicking (US-007)", async ({ page }) => {
    // Go to learn page first
    await page.goto("/learn");

    // Declare elements first
    const learningCard = page.locator('[data-testid="learning-card"]');
    const cardBack = page.locator('[data-testid="card-back"]');

    // Wait for the learning card to be visible
    await expect(learningCard).toBeVisible();

    // Click on the card to flip it
    await learningCard.click();

    // Should show back side
    await expect(cardBack).toBeVisible();

    // Should show rating buttons
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator(`[data-testid="rating-${i}"]`)).toBeVisible();
    }

    // Should show instruction to rate (use more specific selector)
    await expect(
      page.locator('[data-testid="learning-card"] p:has-text("Oceń jak dobrze pamiętałeś odpowiedź")')
    ).toBeVisible();
  });

  test("should load next card after rating", async ({ page }) => {
    // Go to learn page first
    await page.goto("/learn");

    // Declare elements first
    const learningCard = page.locator('[data-testid="learning-card"]');
    const ratingButton = page.locator('[data-testid="rating-4"]');
    const cardFront = page.locator('[data-testid="card-front"]');

    // Wait for the learning card to be visible
    await expect(learningCard).toBeVisible();

    // Flip card and rate it
    await learningCard.click();
    await expect(ratingButton).toBeEnabled();
    await ratingButton.click();

    // Should show new card
    await expect(cardFront).toBeVisible({ timeout: 10000 });
  });

  test("should update session stats after rating", async ({ page }) => {
    // Go to learn page first
    await page.goto("/learn");

    // Declare elements first
    const learningCard = page.locator('[data-testid="learning-card"]');
    const ratingButton = page.locator('[data-testid="rating-3"]');

    await expect(learningCard).toBeVisible();

    // Check initial stats
    await expect(page.locator("text=Przejrzano: 1")).toBeVisible();
    await expect(page.locator("text=Pozostało:")).toBeVisible();

    // Rate a card
    await learningCard.click();
    await expect(ratingButton).toBeEnabled();
    await ratingButton.click();

    // Should show rating confirmation
    await expect(page.locator("text=Oceniono!")).toBeVisible();
  });

  test("should show summary when session ends", async ({ page }) => {
    // Go to learn page first
    await page.goto("/learn");

    // Declare elements first
    const learningCard = page.locator('[data-testid="learning-card"]');
    const endSessionButton = page.locator('button:has-text("Zakończ sesję")');

    // Wait for the learning card to be visible
    await expect(learningCard).toBeVisible();

    // End session
    await expect(endSessionButton).toBeEnabled();
    await endSessionButton.click();

    // Should redirect to flashcards page
    await expect(page).toHaveURL("/flashcards");
  });

  test("should show rating labels and intervals (US-008)", async ({ page }) => {
    await page.goto("/learn");

    // Declare elements first
    const learningCard = page.locator('[data-testid="learning-card"]');

    await page.waitForSelector('[data-testid="learning-card"]');
    await learningCard.click();

    // Should show rating labels (use more specific selectors)
    await expect(page.locator('[data-testid="rating-1"]')).toContainText("Nie pamiętam"); // Rating 1
    await expect(page.locator('[data-testid="rating-2"]')).toContainText("Słabo"); // Rating 2
    await expect(page.locator('[data-testid="rating-3"]')).toContainText("Przeciętnie"); // Rating 3
    await expect(page.locator('[data-testid="rating-4"]')).toContainText("Dobrze"); // Rating 4
    await expect(page.locator('[data-testid="rating-5"]')).toContainText("Bardzo dobrze"); // Rating 5

    // Should show interval information
    await expect(page.locator("text=1 = Następny przegląd za 1 dzień")).toBeVisible();
    await expect(page.locator("text=2 = za 2 dni | 3 = za 4 dni | 4 = za 7 dni | 5 = za 14 dni")).toBeVisible();
  });

  test("should handle no cards available scenario (US-008)", async ({ page }) => {
    // Mock empty session
    await page.route("/api/learn/session", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          card: null,
          session: {
            session_id: "session-123",
            cards_reviewed: 0,
            cards_remaining: 0,
            session_start: new Date().toISOString(),
            message: "No cards available for review",
          },
        }),
      });
    });

    await page.goto("/learn");

    // Should show session ended message
    await expect(page.locator("text=Sesja nauki zakończona!")).toBeVisible();

    // Should show completion message - use a more stable selector
    await expect(page.locator("text=No cards available for review")).toBeVisible();

    // Should offer to start new session
    await expect(page.locator('button:has-text("Rozpocznij nową sesję")')).toBeVisible();
  });

  test("should show card metadata (difficulty, review count)", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForSelector('[data-testid="learning-card"]');

    // Should show card metadata in the card header
    await expect(page.locator("text=Przejrzano: ")).toBeVisible();
    await expect(page.locator("text=Trudność: 2.5/5.0")).toBeVisible();
  });
});
