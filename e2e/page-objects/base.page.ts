import { expect, Locator, Page } from "@playwright/test";

/**
 * Base page object with common functionality for all pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Wait for page to be loaded
   */
  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get element by data-testid
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 10000) {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Fill input field and ensure it's properly filled
   */
  async fillInput(locator: Locator, value: string) {
    await locator.click();
    await locator.clear();
    await locator.fill(value);
    await expect(locator).toHaveValue(value);
  }

  /**
   * Click button and wait for it to be enabled first
   */
  async clickButton(locator: Locator) {
    await expect(locator).toBeEnabled();
    await locator.click();
  }

  /**
   * Verify page URL
   */
  async verifyUrl(expectedUrl: string) {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Verify page title contains text
   */
  async verifyTitle(expectedText: string) {
    await expect(this.page).toHaveTitle(new RegExp(expectedText));
  }
}