import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for User Isolation testing
 */
export class UserIsolationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Sign out current user (mock implementation)
   */
  async signOut() {
    // Mock signout by clearing storage and reloading
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
  }

  /**
   * Sign in as different user (mock implementation)
   */
  async signInAsUser(userId: string) {
    // Mock signin by setting user ID in storage
    await this.page.evaluate((id) => {
      localStorage.setItem('mock-user-id', id);
    }, userId);
    await this.page.reload();
  }

  /**
   * Verify user cannot see other user's data
   */
  async verifyUserIsolation(expectedEmpty = true) {
    await this.goto("/flashcards");
    
    if (expectedEmpty) {
      await expect(this.getByTestId("empty-state")).toBeVisible();
    } else {
      await expect(this.getByTestId("flashcards-list")).toBeVisible();
    }
  }

  /**
   * Create test flashcard for current user
   */
  async createTestFlashcard(front: string, back: string) {
    await this.goto("/flashcards/new");
    
    const frontInput = this.getByTestId("front-textarea");
    const backInput = this.getByTestId("back-textarea");
    const submitButton = this.getByTestId("submit-button");
    
    await this.fillInput(frontInput, front);
    await this.fillInput(backInput, back);
    await this.clickButton(submitButton);
    
    await this.verifyUrl("/flashcards");
  }

  /**
   * Verify flashcard exists in list
   */
  async verifyFlashcardExists(frontText: string) {
    await expect(this.page.locator(`text=${frontText}`)).toBeVisible();
  }

  /**
   * Verify flashcard does not exist in list
   */
  async verifyFlashcardNotExists(frontText: string) {
    await expect(this.page.locator(`text=${frontText}`)).not.toBeVisible();
  }

  /**
   * Mock API responses for user isolation
   */
  async mockUserIsolationAPI(userId: string) {
    // Mock API to return different data based on user
    await this.page.route("/api/flashcards", (route) => {
      const url = new URL(route.request().url());
      
      // Return empty data for isolated user
      if (userId === "isolated-user") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            flashcards: [],
            total: 0,
            page: 1,
            limit: 10
          })
        });
      } else {
        route.continue();
      }
    });
  }
}