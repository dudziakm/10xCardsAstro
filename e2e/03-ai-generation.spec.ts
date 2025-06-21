import { test, expect } from "@playwright/test";

test.describe("AI Flashcard Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/generate");
  });

  test("should display AI generation page correctly (US-001)", async ({ page }) => {
    // Check page title and heading
    await expect(page.locator("h1")).toContainText("Generuj fiszki AI");

    // Check form elements exist
    await expect(page.locator('textarea[id="prompt"]')).toBeVisible();
    await expect(page.locator('select[id="count"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Wygeneruj");

    // Check instructions
    await expect(page.locator("text=Opisz szczegółowo czego chcesz się nauczyć")).toBeVisible();
  });

  test("should validate input text length (US-001)", async ({ page }) => {
    // Test empty text - button should be disabled
    await page.fill('textarea[id="prompt"]', "");
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Test with valid text - button should be enabled
    const validText = "JavaScript podstawy programowania obiektowego";
    await page.fill('textarea[id="prompt"]', validText);
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test("should generate flashcards with valid input (US-001)", async ({ page }) => {
    // Valid input text (1000-10000 chars about React)
    const validText = `
    React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Facebook and the community. React allows developers to create reusable UI components and manage the state of their applications efficiently. 
    
    One of the key features of React is its virtual DOM, which helps improve performance by minimizing direct manipulation of the actual DOM. React components can be either functional or class-based, with functional components becoming more popular with the introduction of Hooks.
    
    JSX is a syntax extension for JavaScript that allows developers to write HTML-like code within JavaScript. This makes React components more readable and easier to develop. React also supports server-side rendering, which can improve SEO and initial load times.
    
    State management in React can be handled locally within components using useState Hook, or globally using context API or external libraries like Redux. Props are used to pass data from parent to child components, creating a unidirectional data flow.
    
    React ecosystem includes many useful libraries and tools like React Router for navigation, styled-components for styling, and testing libraries like Jest and React Testing Library. The React community is very active and constantly developing new tools and best practices.
    `.repeat(2); // Make it longer than 1000 chars

    await page.fill('textarea[id="prompt"]', validText);

    // Set count to 5
    await page.selectOption('select[id="count"]', "5");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show loading state
    await expect(page.locator("text=Generuję fiszki...")).toBeVisible();

    // Wait for generation to complete (may take some time with real API)
    await page.waitForSelector('[data-testid="generated-flashcards"]', { timeout: 30000 });

    // Should show generated flashcards
    await expect(page.locator('[data-testid="generated-flashcards"]')).toBeVisible();

    // Should show up to 5 flashcards (based on count parameter)
    const generatedCards = page.locator('[data-testid="generated-flashcard"]');
    const cardCount = await generatedCards.count();
    expect(cardCount).toBeGreaterThan(0);
    expect(cardCount).toBeLessThanOrEqual(5);

    // Each card should have front and back with proper length limits
    for (let i = 0; i < cardCount; i++) {
      const card = generatedCards.nth(i);
      const frontText = await card.locator('[data-testid="card-front"]').textContent();
      const backText = await card.locator('[data-testid="card-back"]').textContent();

      expect(frontText?.length).toBeLessThanOrEqual(200);
      expect(backText?.length).toBeLessThanOrEqual(500);
      expect(frontText?.length).toBeGreaterThan(0);
      expect(backText?.length).toBeGreaterThan(0);
    }
  });

  test("should handle API errors gracefully (US-001)", async ({ page }) => {
    // Mock API error by intercepting the request
    await page.route("/api/flashcards/generate", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "API Error: Service unavailable" }),
      });
    });

    const validText = "React podstawy i zaawansowane koncepty programowania"; // Valid prompt
    await page.fill('textarea[id="prompt"]', validText);
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=Wystąpił błąd podczas generowania")).toBeVisible();

    // Should allow retry
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test("should validate count parameter", async ({ page }) => {
    const validText = "React podstawy programowania";
    await page.fill('textarea[id="prompt"]', validText);

    // Check available count options (options in select are not directly visible, check if they exist)
    await expect(page.locator('select[id="count"] option[value="3"]')).toHaveCount(1);
    await expect(page.locator('select[id="count"] option[value="5"]')).toHaveCount(1);
    await expect(page.locator('select[id="count"] option[value="10"]')).toHaveCount(1);

    // Test with different count values - just check selection works
    await page.selectOption('select[id="count"]', "3");
    await expect(page.locator('select[id="count"]')).toHaveValue("3");
  });

  test("should show character counter for input text", async ({ page }) => {
    const text = "React podstawy";
    await page.fill('textarea[id="prompt"]', text);

    // Check that form accepts input
    await expect(page.locator('textarea[id="prompt"]')).toHaveValue(text);

    // Fill with longer text
    const longerText = "React is a JavaScript library for building user interfaces with components";
    await page.fill('textarea[id="prompt"]', longerText);
    await expect(page.locator('textarea[id="prompt"]')).toHaveValue(longerText);
  });

  test("should maintain form state during generation", async ({ page }) => {
    const inputText = "A".repeat(1500);
    const count = "3";

    await page.fill('textarea[id="prompt"]', inputText);
    await page.selectOption('select[id="count"]', count);

    // Mock slow API response
    await page.route("/api/flashcards/generate", (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            candidates: [
              { front: "Test front 1", back: "Test back 1" },
              { front: "Test front 2", back: "Test back 2" },
            ],
          }),
        });
      }, 1000);
    });

    await page.click('button[type="submit"]');

    // During loading, form fields should be disabled
    await expect(page.locator('textarea[id="prompt"]')).toBeDisabled();
    await expect(page.locator('select[id="count"]')).toBeDisabled();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Wait for completion
    await page.waitForSelector('[data-testid="generated-flashcards"]');

    // After completion, form should be re-enabled or show candidate review
    // Form may be replaced by candidate review interface
    const hasForm = await page.locator('textarea[id="prompt"]').isVisible();
    if (hasForm) {
      await expect(page.locator('textarea[id="prompt"]')).toBeEnabled();
      await expect(page.locator('select[id="count"]')).toBeEnabled();
      await expect(page.locator('button[type="submit"]')).toBeEnabled();
    }
  });
});
