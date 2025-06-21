import { test, expect } from "@playwright/test";

test.describe("Learning Session with Spaced Repetition", () => {
  test.beforeEach(async ({ page }) => {
    // Mock learning session API
    await page.route("/api/learn/session", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            card: {
              id: "card-123",
              front: "What is React?",
              back: "A JavaScript library for building user interfaces",
              last_reviewed: null,
              review_count: 0,
              difficulty_rating: 2.5,
            },
            session: {
              session_id: "session-123",
              cards_reviewed: 0,
              cards_remaining: 5,
              session_start: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await page.route("/api/learn/session/rate", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          flashcard_id: "card-123",
          rating: 4,
          next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          review_count: 1,
          difficulty_rating: 2.4,
          session_progress: {
            cards_reviewed: 1,
            session_duration_minutes: 2,
          },
        }),
      });
    });
  });

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
    await expect(page.locator('[data-testid="card-front"]')).toContainText("What is React?");

    // Back should not be visible initially
    await expect(page.locator('[data-testid="card-back"]')).toBeHidden();

    // Should show instruction to click for answer
    await expect(page.locator("text=Kliknij aby zobaczyć odpowiedź")).toBeVisible();
  });

  test("should show back of the card after clicking (US-007)", async ({ page }) => {
    // Wait for the learning card to be visible
    await expect(page.locator('[data-testid="learning-card"]')).toBeVisible();

    // Click on the card to flip it
    await page.locator('[data-testid="learning-card"]').click();

    // Should show back side
    await expect(page.locator('[data-testid="card-back"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-back"]')).toContainText(
      "A JavaScript library for building user interfaces"
    );

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
    // Wait for the learning card to be visible
    await expect(page.locator('[data-testid="learning-card"]')).toBeVisible();

    // Flip card and rate it
    await page.locator('[data-testid="learning-card"]').click();
    const ratingButton = page.locator('[data-testid="rating-4"]');
    await expect(ratingButton).toBeEnabled();
    await ratingButton.click();

    // Should show new card
    await expect(page.locator('[data-testid="card-front"]')).toBeVisible();
  });

  test("should update session stats after rating", async ({ page }) => {
    // Check initial stats
    await expect(page.locator("text=Przejrzane: 0")).toBeVisible();
    await expect(page.locator("text=Pozostało: 5")).toBeVisible();

    // Rate a card
    await page.locator('[data-testid="learning-card"]').click();
    const ratingButton = page.locator('[data-testid="rating-3"]');
    await expect(ratingButton).toBeEnabled();
    await ratingButton.click();

    // Should show rating confirmation
    await expect(page.locator("text=Oceniono!")).toBeVisible();
  });

  test("should show summary when session ends", async ({ page }) => {
    // Wait for the learning card to be visible
    await expect(page.locator('[data-testid="learning-card"]')).toBeVisible();

    // End session
    const endSessionButton = page.locator('button:has-text("Zakończ sesję")');
    await expect(endSessionButton).toBeEnabled();
    await endSessionButton.click();

    // Should show summary
    await expect(page.locator("text=Sesja nauki zakończona!")).toBeVisible();
  });

  test("should show rating labels and intervals (US-008)", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForSelector('[data-testid="learning-card"]');
    await page.click('[data-testid="learning-card"]');

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
    await expect(page.locator("text=Przeglądy: 0")).toBeVisible();
    await expect(page.locator("text=Trudność: 2.5/5.0")).toBeVisible();
  });

  test("should handle API errors during learning", async ({ page }) => {
    // Mock API error for rating
    await page.route("/api/learn/session/rate", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "API Error" }),
      });
    });

    // Flip card and rate it
    await page.locator('[data-testid="learning-card"]').click();

    // Rate the card
    const ratingButton = page.locator('[data-testid="rating-4"]');
    await expect(ratingButton).toBeEnabled();
    await ratingButton.click();

    // Should show error message
    await expect(page.locator("text=Wystąpił błąd")).toBeVisible();
  });

  test("should handle rating API errors", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForSelector('[data-testid="learning-card"]');
    await page.click('[data-testid="learning-card"]');

    // Mock API error for rating
    await page.route("/api/learn/session/rate", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to save rating" }),
      });
    });

    await page.click('[data-testid="rating-4"]');

    // Should show error message
    await expect(page.locator("text=Failed to rate flashcard")).toBeVisible();

    // Rating buttons should still be available for retry
    await expect(page.locator('[data-testid="rating-1"]')).toBeVisible();
  });

  test("should persist session across page refreshes", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForSelector('[data-testid="learning-card"]');

    // Refresh the page
    await page.reload();

    // Should load card again (session persistence is handled server-side)
    await expect(page.locator('[data-testid="learning-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-front"]')).toContainText("What is React?");
  });
});
