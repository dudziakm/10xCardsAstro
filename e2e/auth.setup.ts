import { test as setup, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env file
const envFile = join(process.cwd(), ".env");
const envVars: Record<string, string> = {};

try {
  const envContent = readFileSync(envFile, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
} catch (error) {
  // Could not load .env file - likely in CI environment
}

const authFileMain = "playwright/.auth/user-main.json";
const authFileExtra = "playwright/.auth/user-extra.json";

// Main user authentication setup
setup("authenticate main user", async ({ page }) => {
  await page.goto("/auth/login");

  // Fill in login form with main user credentials
  const mainEmail = envVars.APP_LOGIN_MAIN || "dudziak.michal@gmail.com";
  const mainPassword = envVars.APP_PASSWORD_MAIN || "Fg937Rq3a!_6wrC";

  await page.fill('input[name="email"]', mainEmail);
  await page.fill('input[name="password"]', mainPassword);

  // Submit form and wait for redirect
  await page.click('button[type="submit"]');
  await page.waitForURL("/flashcards");

  // Verify we're logged in
  await expect(page.locator("text=Zalogowany")).toBeVisible();

  // Save main user authentication state
  await page.context().storageState({ path: authFileMain });
});

// Extra user authentication setup
setup("authenticate extra user", async ({ page }) => {
  await page.goto("/auth/login");

  // Fill in login form with extra user credentials
  const extraEmail = envVars.APP_LOGIN_EXTRA || "testUser@testUser.com";
  const extraPassword = envVars.APP_PASSWORD_EXTRA || "TestUser1234";

  await page.fill('input[name="email"]', extraEmail);
  await page.fill('input[name="password"]', extraPassword);

  // Submit form and wait for redirect
  await page.click('button[type="submit"]');
  await page.waitForURL("/flashcards");

  // Verify we're logged in
  await expect(page.locator("text=Zalogowany")).toBeVisible();

  // Save extra user authentication state
  await page.context().storageState({ path: authFileExtra });
});
