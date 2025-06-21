import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for Flashcards page
 */
export class FlashcardsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly flashcardsList: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.page.locator("main h2");
    this.createButton = this.getByTestId("create-flashcard");
    this.searchInput = this.getByTestId("search-input");
    this.flashcardsList = this.getByTestId("flashcards-list");
    this.emptyState = this.getByTestId("empty-state");
  }

  /**
   * Navigate to flashcards page
   */
  async navigate() {
    await this.goto("/flashcards");
  }

  /**
   * Verify flashcards page is loaded
   */
  async verifyPageLoaded() {
    await expect(this.pageHeading).toContainText("Moje fiszki");
    await this.waitForElement(this.createButton);
  }

  /**
   * Create new flashcard
   */
  async createFlashcard() {
    await this.clickButton(this.createButton);
    await this.verifyUrl("/flashcards/new");
  }

  /**
   * Search for flashcards
   */
  async searchFlashcards(query: string) {
    await this.fillInput(this.searchInput, query);
    await this.searchInput.press("Enter");
  }

  /**
   * Verify search results - either flashcards list or empty state
   */
  async verifySearchResults() {
    // Wait for either flashcards list or empty state to be visible
    await this.page.waitForFunction(() => {
      const list = document.querySelector('[data-testid="flashcards-list"]');
      const empty = document.querySelector('[data-testid="empty-state"]');
      return list || empty;
    });
  }

  /**
   * Verify empty state is shown
   */
  async verifyEmptyState() {
    await this.waitForElement(this.emptyState);
    await expect(this.emptyState).toContainText("Nie masz jeszcze żadnych fiszek");
  }

  /**
   * Get flashcard by index
   */
  getFlashcardByIndex(index: number): Locator {
    return this.getByTestId(`flashcard-item-${index}`);
  }

  /**
   * Edit flashcard by index
   */
  async editFlashcard(index: number) {
    const editButton = this.getByTestId(`edit-flashcard-${index}`);
    await this.clickButton(editButton);
  }

  /**
   * Delete flashcard by index
   */
  async deleteFlashcard(index: number) {
    const deleteButton = this.getByTestId(`delete-flashcard-${index}`);
    await this.clickButton(deleteButton);
    
    // Confirm deletion
    const confirmButton = this.getByTestId("confirm-delete");
    await this.clickButton(confirmButton);
  }

  /**
   * Verify flashcard exists with front text
   */
  async verifyFlashcardExists(frontText: string) {
    await expect(this.page.locator(`text=${frontText}`)).toBeVisible();
  }
}