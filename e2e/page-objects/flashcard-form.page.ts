import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for Flashcard Form (Create/Edit)
 */
export class FlashcardFormPage extends BasePage {
  readonly pageHeading: Locator;
  readonly frontInput: Locator;
  readonly backInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.page.locator("main h1");
    this.frontInput = this.getByTestId("front-textarea");
    this.backInput = this.getByTestId("back-textarea");
    this.submitButton = this.getByTestId("submit-button");
    this.cancelButton = this.getByTestId("cancel-button");
    this.deleteButton = this.getByTestId("delete-button");
  }

  /**
   * Navigate to create flashcard page
   */
  async navigateToCreate() {
    await this.goto("/flashcards/new");
  }

  /**
   * Navigate to edit flashcard page
   */
  async navigateToEdit(id: string) {
    await this.goto(`/flashcards/${id}/edit`);
  }

  /**
   * Verify form page is loaded
   */
  async verifyFormLoaded(isEdit = false) {
    const expectedText = isEdit ? "Edytuj fiszkę" : "Dodaj nową fiszkę";
    await expect(this.pageHeading).toContainText(expectedText);
    await this.waitForElement(this.frontInput);
    await this.waitForElement(this.backInput);
    await this.waitForElement(this.submitButton);
    await this.waitForElement(this.cancelButton);
  }

  /**
   * Fill flashcard form
   */
  async fillForm(front: string, back: string) {
    await this.fillInput(this.frontInput, front);
    await this.fillInput(this.backInput, back);
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.clickButton(this.submitButton);
  }

  /**
   * Cancel form editing
   */
  async cancel() {
    await this.clickButton(this.cancelButton);
    await this.verifyUrl("/flashcards");
  }

  /**
   * Delete flashcard (only available in edit mode)
   */
  async deleteFlashcard() {
    await this.clickButton(this.deleteButton);

    // Confirm deletion
    const confirmButton = this.getByTestId("confirm-delete");
    await this.clickButton(confirmButton);
    await this.verifyUrl("/flashcards");
  }

  /**
   * Verify form validation
   */
  async verifyFormValidation() {
    // Submit button should be disabled when form is empty
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Create complete flashcard
   */
  async createFlashcard(front: string, back: string) {
    await this.fillForm(front, back);
    await this.submit();
    await this.verifyUrl("/flashcards");
  }

  /**
   * Edit existing flashcard
   */
  async editFlashcard(front: string, back: string) {
    await this.fillForm(front, back);
    await this.submit();
    await this.verifyUrl("/flashcards");
  }

  /**
   * Verify form is pre-filled with existing data
   */
  async verifyPrefilledData(expectedFront: string, expectedBack: string) {
    await expect(this.frontInput).toHaveValue(expectedFront);
    await expect(this.backInput).toHaveValue(expectedBack);
  }
}
