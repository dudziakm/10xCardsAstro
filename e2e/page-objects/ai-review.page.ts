import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for AI Flashcard Review and Acceptance
 */
export class AIReviewPage extends BasePage {
  readonly generatedFlashcards: Locator;
  readonly selectAllButton: Locator;
  readonly selectNoneButton: Locator;
  readonly acceptButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.generatedFlashcards = this.getByTestId("generated-flashcards");
    this.selectAllButton = this.getByTestId("select-all-button");
    this.selectNoneButton = this.getByTestId("select-none-button");
    this.acceptButton = this.getByTestId("accept-candidates-button");
    this.cancelButton = this.getByTestId("cancel-review-button");
  }

  /**
   * Verify review interface is displayed
   */
  async verifyReviewInterface() {
    await this.waitForElement(this.generatedFlashcards);
    await this.waitForElement(this.selectAllButton);
    await this.waitForElement(this.selectNoneButton);
    await this.waitForElement(this.acceptButton);
  }

  /**
   * Get candidate card by index
   */
  getCandidateCard(index: number): Locator {
    return this.getByTestId(`candidate-card-${index}`);
  }

  /**
   * Get candidate checkbox by index
   */
  getCandidateCheckbox(index: number): Locator {
    return this.getByTestId(`candidate-checkbox-${index}`);
  }

  /**
   * Select candidate flashcard by index
   */
  async selectCandidate(index: number) {
    const checkbox = this.getCandidateCheckbox(index);
    await this.waitForElement(checkbox);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  /**
   * Deselect candidate flashcard by index
   */
  async deselectCandidate(index: number) {
    const checkbox = this.getCandidateCheckbox(index);
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  }

  /**
   * Select all candidates
   */
  async selectAll() {
    await this.clickButton(this.selectAllButton);
    
    // Verify first checkbox is checked
    const firstCheckbox = this.getCandidateCheckbox(0);
    await expect(firstCheckbox).toBeChecked();
  }

  /**
   * Deselect all candidates
   */
  async selectNone() {
    await this.clickButton(this.selectNoneButton);
    
    // Verify first checkbox is unchecked
    const firstCheckbox = this.getCandidateCheckbox(0);
    await expect(firstCheckbox).not.toBeChecked();
  }

  /**
   * Accept selected candidates
   */
  async acceptSelected() {
    await this.clickButton(this.acceptButton);
    await this.verifyUrl("/flashcards");
  }

  /**
   * Cancel review process
   */
  async cancelReview() {
    await this.clickButton(this.cancelButton);
  }

  /**
   * Verify accept button state
   */
  async verifyAcceptButtonEnabled() {
    await expect(this.acceptButton).toBeEnabled();
  }

  /**
   * Verify accept button is disabled
   */
  async verifyAcceptButtonDisabled() {
    await expect(this.acceptButton).toBeDisabled();
  }

  /**
   * Verify at least one candidate card is visible
   */
  async verifyCandidatesVisible() {
    const firstCard = this.getCandidateCard(0);
    await this.waitForElement(firstCard);
  }

  /**
   * Count visible candidate cards
   */
  async countCandidates(): Promise<number> {
    const candidateCards = this.page.locator('[data-testid^="candidate-card-"]');
    return await candidateCards.count();
  }

  /**
   * Mock accept API endpoint for testing
   */
  async mockAcceptAPI() {
    await this.page.route("/api/flashcards/accept", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accepted: 2,
          flashcards: [
            { id: "flash-1", front: "What is React?", back: "A JavaScript library" },
            { id: "flash-2", front: "What is JSX?", back: "JavaScript XML syntax" },
          ],
        }),
      });
    });
  }
}