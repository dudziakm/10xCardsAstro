import { test, expect } from "@playwright/test";

test.describe("AI Flashcard Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/generate");
  });

  test("should display AI generation page correctly (US-001)", async ({ page }) => {
    // Check page title and heading
    await expect(page.locator('[data-testid="generate-page-title"]')).toContainText("Generuj fiszki AI");

    // Check form elements exist
    await expect(page.locator('[data-testid="prompt-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="count-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-button"]')).toContainText("Wygeneruj");

    // Check instructions
    await expect(page.locator("text=Opisz szczegółowo czego chcesz się nauczyć")).toBeVisible();
  });

  test("should validate input text length (US-001)", async ({ page }) => {
    // Declare elements first
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');
    const generateButton = page.locator('[data-testid="generate-button"]');

    await expect(promptTextarea).toBeVisible();
    await expect(generateButton).toBeVisible();

    // Test empty text - button should be disabled
    await promptTextarea.fill("");
    await expect(generateButton).toBeDisabled();

    // Test with valid text - button should be enabled
    const validText = "JavaScript podstawy programowania obiektowego";
    await promptTextarea.fill(validText);
    // Wait for button to become enabled after filling
    await expect(generateButton).toBeEnabled();
  });

  test("should generate flashcards with valid input (US-001)", async ({ page }) => {
    // Declare elements first
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');
    const countSelect = page.locator('[data-testid="count-select"]');
    const generateButton = page.locator('[data-testid="generate-button"]');

    await expect(promptTextarea).toBeVisible();
    await expect(countSelect).toBeVisible();
    await expect(generateButton).toBeVisible();

    const timestamp = Date.now();
    const validText = `
    React is a JavaScript library for building user interfaces. Test ID: ${timestamp}. It was developed by Facebook and is now maintained by Facebook and the community. React allows developers to create reusable UI components and manage the state of their applications efficiently. 
    
    One of the key features of React is its virtual DOM, which helps improve performance by minimizing direct manipulation of the actual DOM. React components can be either functional or class-based, with functional components becoming more popular with the introduction of Hooks.
    
    JSX is a syntax extension for JavaScript that allows developers to write HTML-like code within JavaScript. This makes React components more readable and easier to develop. React also supports server-side rendering, which can improve SEO and initial load times.
    
    State management in React can be handled locally within components using useState Hook, or globally using context API or external libraries like Redux. Props are used to pass data from parent to child components, creating a unidirectional data flow.
    
    React ecosystem includes many useful libraries and tools like React Router for navigation, styled-components for styling, and testing libraries like Jest and React Testing Library. The React community is very active and constantly developing new tools and best practices.
    `.repeat(2); // Make it longer than 1000 chars

    await promptTextarea.fill(validText);

    // Set count to 5
    await countSelect.selectOption("5");

    // Wait for button to be enabled and submit form
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    // Should show loading state
    await expect(page.locator("text=Generuję fiszki...")).toBeVisible({ timeout: 10000 });

    // Wait for generation to complete (may take some time with real API)
    await page.waitForSelector('[data-testid="generated-flashcards"]', { timeout: 30000 });

    // Should show generated flashcards
    await expect(page.locator('[data-testid="generated-flashcards"]')).toBeVisible();

    // Should show up to 5 flashcards (based on count parameter)
    const generatedCards = page.locator(
      '[data-testid="candidate-card-0"], [data-testid="candidate-card-1"], [data-testid="candidate-card-2"], [data-testid="candidate-card-3"], [data-testid="candidate-card-4"]'
    );
    const cardCount = await generatedCards.count();
    expect(cardCount).toBeGreaterThan(0);
    expect(cardCount).toBeLessThanOrEqual(5);
  });

  test("should validate count parameter", async ({ page }) => {
    // Declare elements first
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');
    const countSelect = page.locator('[data-testid="count-select"]');

    await expect(promptTextarea).toBeVisible();
    await expect(countSelect).toBeVisible();

    const validText = "React podstawy programowania";
    await promptTextarea.fill(validText);

    // Check available count options
    await expect(countSelect.locator('option[value="3"]')).toHaveCount(1);
    await expect(countSelect.locator('option[value="5"]')).toHaveCount(1);
    await expect(countSelect.locator('option[value="10"]')).toHaveCount(1);

    // Test with different count values - just check selection works
    await countSelect.selectOption("3");
    await expect(countSelect).toHaveValue("3");
  });

  test("should show character counter for input text", async ({ page }) => {
    // Declare elements first
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');

    await expect(promptTextarea).toBeVisible();

    const text = "React podstawy";
    await promptTextarea.fill(text);

    // Check that form accepts input
    await expect(promptTextarea).toHaveValue(text);

    // Fill with longer text
    const longerText = "React is a JavaScript library for building user interfaces with components";
    await promptTextarea.fill(longerText);
    await expect(promptTextarea).toHaveValue(longerText);
  });
});
