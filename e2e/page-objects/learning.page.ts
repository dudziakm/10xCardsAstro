import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for Learning Session page
 */
export class LearningPage extends BasePage {
  readonly pageHeading: Locator;
  readonly learningCard: Locator;
  readonly cardFront: Locator;
  readonly cardBack: Locator;
  readonly endSessionButton: Locator;
  readonly sessionStats: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.page.locator("main h1");
    this.learningCard = this.getByTestId("learning-card");
    this.cardFront = this.getByTestId("card-front");
    this.cardBack = this.getByTestId("card-back");
    this.endSessionButton = this.page.locator('button:has-text("Zakończ sesję")');
    this.sessionStats = this.page.locator("text=Przejrzano:");
  }

  /**
   * Navigate to learning session page
   */
  async navigate() {
    await this.goto("/learn");
  }

  /**
   * Verify learning page is loaded
   */
  async verifyPageLoaded() {
    await expect(this.pageHeading).toContainText("Sesja nauki");

    // Wait for either learning card or session ended message
    await this.page.waitForFunction(() => {
      const learningCard = document.querySelector('[data-testid="learning-card"]');
      const h2Element = document.querySelector("h2");
      const sessionEnded = h2Element?.textContent?.includes("Sesja nauki zakończona!") || false;
      return learningCard || sessionEnded;
    });

    // If we have a learning card, that's success
    const hasLearningCard = await this.learningCard.isVisible();
    if (hasLearningCard) {
      return;
    }

    // If we have session ended, that means no cards available
    const hasSessionEnded = await this.page.locator("text=Sesja nauki zakończona!").isVisible();
    if (hasSessionEnded) {
      throw new Error("No cards available for learning session");
    }

    throw new Error("Unexpected state on learning page");
  }

  /**
   * Verify initial card state
   */
  async verifyInitialCardState() {
    await this.waitForElement(this.cardFront);
    await expect(this.cardBack).toBeHidden();
    await expect(this.page.locator("text=Kliknij aby zobaczyć odpowiedź")).toBeVisible();
  }

  /**
   * Flip the card to show back
   */
  async flipCard() {
    await this.clickButton(this.learningCard);
    await this.waitForElement(this.cardBack);
  }

  /**
   * Rate the card with given rating (1-5)
   */
  async rateCard(rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const ratingButton = this.getRatingButton(rating);
    await this.clickButton(ratingButton);
  }

  /**
   * Get rating button by rating value
   */
  getRatingButton(rating: number): Locator {
    return this.getByTestId(`rating-${rating}`);
  }

  /**
   * Verify rating buttons are visible
   */
  async verifyRatingButtons() {
    for (let i = 1; i <= 5; i++) {
      const button = this.getRatingButton(i);
      await this.waitForElement(button);
    }
  }

  /**
   * Verify rating labels and intervals
   */
  async verifyRatingLabels() {
    await expect(this.getRatingButton(1)).toContainText("Nie pamiętam");
    await expect(this.getRatingButton(2)).toContainText("Słabo");
    await expect(this.getRatingButton(3)).toContainText("Przeciętnie");
    await expect(this.getRatingButton(4)).toContainText("Dobrze");
    await expect(this.getRatingButton(5)).toContainText("Bardzo dobrze");
  }

  /**
   * Verify interval information is displayed
   */
  async verifyIntervalInfo() {
    await expect(this.page.locator("text=1 = Następny przegląd za 1 dzień")).toBeVisible();
    await expect(this.page.locator("text=2 = za 2 dni | 3 = za 4 dni | 4 = za 7 dni | 5 = za 14 dni")).toBeVisible();
  }

  /**
   * Verify rating instruction is visible
   */
  async verifyRatingInstruction() {
    await expect(
      this.page.locator('[data-testid="learning-card"] p:has-text("Oceń jak dobrze pamiętałeś odpowiedź")')
    ).toBeVisible();
  }

  /**
   * Verify session stats are displayed
   */
  async verifySessionStats() {
    await expect(this.sessionStats).toBeVisible();
    await expect(this.page.locator("text=Pozostało:")).toBeVisible();
  }

  /**
   * End the learning session
   */
  async endSession() {
    await this.clickButton(this.endSessionButton);
    await this.verifyUrl("/flashcards");
  }

  /**
   * Verify rating confirmation message
   */
  async verifyRatingConfirmation() {
    await expect(this.page.locator("text=Oceniono!")).toBeVisible();
  }

  /**
   * Wait for next card to load
   */
  async waitForNextCard() {
    await this.waitForElement(this.cardFront, 10000);
  }

  /**
   * Verify card metadata (difficulty, review count)
   */
  async verifyCardMetadata() {
    await expect(this.page.locator("text=Przejrzano: ")).toBeVisible();
    await expect(this.page.locator("text=Trudność: 2.5/5.0")).toBeVisible();
  }

  /**
   * Verify session ended state
   */
  async verifySessionEnded() {
    await expect(this.page.locator("text=Sesja nauki zakończona!")).toBeVisible();
    await expect(this.page.locator('button:has-text("Rozpocznij nową sesję")')).toBeVisible();
  }

  /**
   * Verify no cards available message
   */
  async verifyNoCardsAvailable() {
    await expect(this.page.locator("text=No cards available for review")).toBeVisible();
  }

  /**
   * Reset learning progress to make all cards available again
   */
  async resetLearningProgress() {
    const response = await this.page.request.get("/api/learn/session?reset=true");

    if (!response.ok()) {
      const responseText = await response.text();
      throw new Error(`Failed to reset learning progress: ${response.status()} - ${responseText}`);
    }
  }

  /**
   * Mock empty session for testing
   */
  async mockEmptySession() {
    await this.page.route("/api/learn/session", (route) => {
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
  }
}
