import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for Homepage
 */
export class HomePage extends BasePage {
  readonly heading: Locator;
  readonly flashcardsActionCard: Locator;
  readonly generateAiActionCard: Locator;
  readonly learnActionCard: Locator;
  readonly navFlashcards: Locator;
  readonly navGenerate: Locator;
  readonly navLearn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.locator("h1").first();
    this.flashcardsActionCard = this.getByTestId("action-my-flashcards");
    this.generateAiActionCard = this.getByTestId("action-generate-ai");
    this.learnActionCard = this.getByTestId("action-learn");
    this.navFlashcards = this.getByTestId("nav-flashcards");
    this.navGenerate = this.getByTestId("nav-generate");
    this.navLearn = this.getByTestId("nav-learn");
  }

  /**
   * Navigate to homepage
   */
  async navigate() {
    await this.goto("/");
  }

  /**
   * Verify homepage is loaded correctly
   */
  async verifyPageLoaded() {
    await this.verifyTitle("my10xCards");
    await expect(this.heading).toContainText("my10xCards");
    await this.waitForElement(this.flashcardsActionCard);
    await this.waitForElement(this.generateAiActionCard);
    await this.waitForElement(this.learnActionCard);
  }

  /**
   * Navigate to flashcards page
   */
  async goToFlashcards() {
    await this.clickButton(this.flashcardsActionCard);
    await this.verifyUrl("/flashcards");
  }

  /**
   * Navigate to AI generation page
   */
  async goToGenerateAI() {
    await this.clickButton(this.generateAiActionCard);
    await this.verifyUrl("/generate");
  }

  /**
   * Navigate to learning session page
   */
  async goToLearn() {
    await this.clickButton(this.learnActionCard);
    await this.verifyUrl("/learn");
  }

  /**
   * Verify action cards content
   */
  async verifyActionCards() {
    await expect(this.page.locator("text=Moje fiszki").first()).toBeVisible();
    await expect(this.page.locator("text=Generuj AI").first()).toBeVisible();
    await expect(this.page.locator("text=Ucz się").first()).toBeVisible();
  }

  /**
   * Navigate via navigation header links
   */
  async goToFlashcardsViaNav() {
    await this.clickButton(this.navFlashcards);
    await this.verifyUrl("/flashcards");
  }

  async goToGenerateViaNav() {
    await this.clickButton(this.navGenerate);
    await this.verifyUrl("/generate");
  }

  async goToLearnViaNav() {
    await this.clickButton(this.navLearn);
    await this.verifyUrl("/learn");
  }
}