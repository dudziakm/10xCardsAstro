import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for AI Generation page
 */
export class AIGenerationPage extends BasePage {
  readonly pageTitle: Locator;
  readonly promptTextarea: Locator;
  readonly countSelect: Locator;
  readonly generateButton: Locator;
  readonly cancelButton: Locator;
  readonly loadingSpinner: Locator;
  readonly generatedFlashcards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.getByTestId("generate-page-title");
    this.promptTextarea = this.getByTestId("prompt-textarea");
    this.countSelect = this.getByTestId("count-select");
    this.generateButton = this.getByTestId("generate-button");
    this.cancelButton = this.getByTestId("cancel-button");
    this.loadingSpinner = this.page.locator("text=Generuję fiszki...");
    this.generatedFlashcards = this.getByTestId("generated-flashcards");
  }

  /**
   * Navigate to AI generation page
   */
  async navigate() {
    await this.goto("/generate");
  }

  /**
   * Verify AI generation page is loaded
   */
  async verifyPageLoaded() {
    await expect(this.pageTitle).toContainText("Generuj fiszki AI");
    await this.waitForElement(this.promptTextarea);
    await this.waitForElement(this.countSelect);
    await this.waitForElement(this.generateButton);
    await expect(this.generateButton).toContainText("Wygeneruj");
  }

  /**
   * Fill the prompt textarea
   */
  async fillPrompt(prompt: string) {
    await this.fillInput(this.promptTextarea, prompt);
  }

  /**
   * Select count of flashcards to generate
   */
  async selectCount(count: string) {
    await this.countSelect.selectOption(count);
    await expect(this.countSelect).toHaveValue(count);
  }

  /**
   * Generate flashcards
   */
  async generateFlashcards(prompt: string, count = "5") {
    await this.fillPrompt(prompt);
    await this.selectCount(count);
    await this.clickButton(this.generateButton);
  }

  /**
   * Wait for generation to complete
   */
  async waitForGeneration() {
    // Wait for loading state
    await expect(this.loadingSpinner).toBeVisible({ timeout: 10000 });

    // Wait for generation to complete
    await this.waitForElement(this.generatedFlashcards, 30000);
  }

  /**
   * Verify form validation
   */
  async verifyFormValidation() {
    // Clear prompt
    await this.promptTextarea.fill("");
    await expect(this.generateButton).toBeDisabled();
  }

  /**
   * Verify generated flashcards are displayed
   */
  async verifyGeneratedFlashcards(expectedCount = 5) {
    await this.waitForElement(this.generatedFlashcards);

    // Count generated cards
    const candidateCards = this.page.locator('[data-testid^="candidate-card-"]');
    const cardCount = await candidateCards.count();
    expect(cardCount).toBeGreaterThan(0);
    expect(cardCount).toBeLessThanOrEqual(expectedCount);
  }

  /**
   * Cancel generation
   */
  async cancel() {
    await this.clickButton(this.cancelButton);
    await this.verifyUrl("/flashcards");
  }

  /**
   * Create a long prompt for testing
   */
  createLongPrompt(baseText: string, timestamp: number): string {
    return `${baseText} ${timestamp}. JavaScript library for building user interfaces. Components and state management. `.repeat(
      20
    );
  }

  /**
   * Verify instructions are visible
   */
  async verifyInstructions() {
    await expect(this.page.locator("text=Opisz szczegółowo czego chcesz się nauczyć")).toBeVisible();
  }

  /**
   * Verify count options are available
   */
  async verifyCountOptions() {
    await expect(this.countSelect.locator('option[value="3"]')).toHaveCount(1);
    await expect(this.countSelect.locator('option[value="5"]')).toHaveCount(1);
    await expect(this.countSelect.locator('option[value="10"]')).toHaveCount(1);
  }
}
