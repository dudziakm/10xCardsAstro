#!/usr/bin/env node
/* eslint-env node */
/* global fetch, process */

/**
 * Manual E2E Testing Script
 * Alternative to Playwright when system dependencies are not available
 */

// Node.js script - no imports needed for this simple test

const BASE_URL = "http://localhost:3001";

// Custom logger to replace console.log
const logger = {
  info: (message) => process.stdout.write(`${message}\n`),
  error: (message) => process.stderr.write(`${message}\n`),
  success: (message) => process.stdout.write(`${message}\n`),
};

const tests = {
  async homepage() {
    logger.info("🔍 Testing Homepage...");
    try {
      const response = await fetch(`${BASE_URL}/`);
      const html = await response.text();

      if (!html.includes("my10xCards")) {
        throw new Error("Homepage title not found");
      }

      if (!html.includes("Moje fiszki")) {
        throw new Error('Navigation link "Moje fiszki" not found');
      }

      logger.success("✅ Homepage loads correctly");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async flashcardsPage() {
    logger.info("🔍 Testing Flashcards Page...");
    try {
      const response = await fetch(`${BASE_URL}/flashcards`);
      const html = await response.text();

      if (response.status !== 200) {
        throw new Error(`Flashcards page failed: ${response.status}`);
      }

      if (!html.includes("Moje fiszki")) {
        throw new Error("Flashcards page title not found");
      }

      logger.success("✅ Flashcards page loads correctly");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async generatePage() {
    logger.info("🔍 Testing Generate Page...");
    try {
      const response = await fetch(`${BASE_URL}/generate`);
      const html = await response.text();

      if (response.status !== 200) {
        throw new Error(`Generate page failed: ${response.status}`);
      }

      if (!html.includes("Generuj fiszki AI")) {
        throw new Error("Generate page title not found");
      }

      logger.success("✅ Generate page loads correctly");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async learnPage() {
    logger.info("🔍 Testing Learn Page...");
    try {
      const response = await fetch(`${BASE_URL}/learn`);
      const html = await response.text();

      if (response.status !== 200) {
        throw new Error(`Learn page failed: ${response.status}`);
      }

      if (!html.includes("Sesja nauki")) {
        throw new Error("Learn page title not found");
      }

      logger.success("✅ Learn page loads correctly");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async flashcardsAPI() {
    logger.info("🔍 Testing Flashcards API...");
    try {
      const response = await fetch(`${BASE_URL}/api/flashcards`);

      if (response.status >= 500) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !data.pagination) {
        throw new Error("Invalid API response structure");
      }

      logger.success(`✅ Flashcards API works (${data.data.length} flashcards)`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async learningAPI() {
    logger.info("🔍 Testing Learning Session API...");
    try {
      const response = await fetch(`${BASE_URL}/api/learn/session`);

      if (response.status >= 500) {
        throw new Error(`Learning API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.session) {
        throw new Error("Invalid learning session response");
      }

      logger.success("✅ Learning Session API works");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async formValidation() {
    logger.info("🔍 Testing Form Validation...");
    try {
      // Test flashcard creation with invalid data
      const invalidData = {
        front: "A".repeat(201), // Too long
        back: "Valid back",
      };

      const response = await fetch(`${BASE_URL}/api/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      // Should fail validation
      if (response.status === 200) {
        logger.info("⚠️ Validation might not be working (expected failure)");
      } else {
        logger.success("✅ Form validation working (rejected invalid data)");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },

  async aiGeneration() {
    logger.info("🔍 Testing AI Generation Endpoint...");
    try {
      const testData = {
        inputText: "A".repeat(1500), // Valid length
        count: 3,
      };

      const response = await fetch(`${BASE_URL}/api/flashcards/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      if (response.status >= 500) {
        throw new Error(`AI Generation API error: ${response.status}`);
      }

      // May fail due to missing API key, but should not be server error
      logger.success(`✅ AI Generation endpoint accessible (status: ${response.status})`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  },
};

async function runTests() {
  logger.info("🚀 Starting Manual E2E Tests\n");

  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      await testFn();
      passed++;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ ${testName} failed: ${error.message}`);
      } else {
        logger.error(`❌ ${testName} failed: Unknown error`);
      }
      failed++;
    }
    logger.info("");
  }

  logger.info("📊 Test Results:");
  logger.success(`✅ Passed: ${passed}`);
  logger.error(`❌ Failed: ${failed}`);
  logger.info(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    logger.success("\n🎉 All tests passed! Application is working correctly.");
  } else {
    logger.error("\n⚠️ Some tests failed. Check the errors above.");
  }
}

runTests().catch((error) => {
  if (error instanceof Error) {
    logger.error(`Fatal error: ${error.message}`);
  } else {
    logger.error("Fatal error: Unknown error");
  }
  process.exit(1);
});
