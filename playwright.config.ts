import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for my10xCards E2E testing
 * Tests all functionality defined in PRD.md
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 5,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["json", { outputFile: "test-results/results.json" }], process.env.CI ? ["github"] : ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global timeout for each action */
    actionTimeout: 10000,

    /* Global timeout for expect assertions */
    // Note: expect timeout is configured globally below
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup projects - run first to create auth states
    {
      name: "setup-main",
      testMatch: /.*\.setup\.ts/,
      testNamePattern: /.*main user.*/,
    },
    {
      name: "setup-extra",
      testMatch: /.*\.setup\.ts/,
      testNamePattern: /.*extra user.*/,
    },

    // Main user tests
    {
      name: "chromium-main-user",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user-main.json",
      },
      dependencies: ["setup-main"],
      testIgnore: ["**/06-user-isolation.spec.ts"], // Skip isolation test for main user
    },

    // Extra user tests (for isolation testing)
    {
      name: "chromium-extra-user",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user-extra.json",
      },
      dependencies: ["setup-extra"],
      testMatch: ["**/06-user-isolation.spec.ts"], // Only run isolation test
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes to start (CI can be slow)
  },

  /* Global test timeout */
  timeout: 30 * 1000, // 30 seconds per test

  /* Expect timeout */
  expect: {
    timeout: 5 * 1000, // 5 seconds for assertions
  },

  /* Test result directory */
  outputDir: "test-results/",
});
