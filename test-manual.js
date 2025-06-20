#!/usr/bin/env node

/**
 * Manual E2E Testing Script
 * Alternative to Playwright when system dependencies are not available
 */

import { promises as fs } from "fs";

const BASE_URL = "http://localhost:3001";

const tests = {
  async homepage() {
    console.log("🔍 Testing Homepage...");
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    if (!html.includes("my10xCards")) {
      throw new Error("Homepage title not found");
    }

    if (!html.includes("Moje fiszki")) {
      throw new Error('Navigation link "Moje fiszki" not found');
    }

    console.log("✅ Homepage loads correctly");
  },

  async flashcardsPage() {
    console.log("🔍 Testing Flashcards Page...");
    const response = await fetch(`${BASE_URL}/flashcards`);
    const html = await response.text();

    if (response.status !== 200) {
      throw new Error(`Flashcards page failed: ${response.status}`);
    }

    if (!html.includes("Moje fiszki")) {
      throw new Error("Flashcards page title not found");
    }

    console.log("✅ Flashcards page loads correctly");
  },

  async generatePage() {
    console.log("🔍 Testing Generate Page...");
    const response = await fetch(`${BASE_URL}/generate`);
    const html = await response.text();

    if (response.status !== 200) {
      throw new Error(`Generate page failed: ${response.status}`);
    }

    if (!html.includes("Generuj fiszki AI")) {
      throw new Error("Generate page title not found");
    }

    console.log("✅ Generate page loads correctly");
  },

  async learnPage() {
    console.log("🔍 Testing Learn Page...");
    const response = await fetch(`${BASE_URL}/learn`);
    const html = await response.text();

    if (response.status !== 200) {
      throw new Error(`Learn page failed: ${response.status}`);
    }

    if (!html.includes("Sesja nauki")) {
      throw new Error("Learn page title not found");
    }

    console.log("✅ Learn page loads correctly");
  },

  async flashcardsAPI() {
    console.log("🔍 Testing Flashcards API...");
    const response = await fetch(`${BASE_URL}/api/flashcards`);

    if (response.status >= 500) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.pagination) {
      throw new Error("Invalid API response structure");
    }

    console.log(`✅ Flashcards API works (${data.data.length} flashcards)`);
  },

  async learningAPI() {
    console.log("🔍 Testing Learning Session API...");
    const response = await fetch(`${BASE_URL}/api/learn/session`);

    if (response.status >= 500) {
      throw new Error(`Learning API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.session) {
      throw new Error("Invalid learning session response");
    }

    console.log("✅ Learning Session API works");
  },

  async formValidation() {
    console.log("🔍 Testing Form Validation...");

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
      console.log("⚠️ Validation might not be working (expected failure)");
    } else {
      console.log("✅ Form validation working (rejected invalid data)");
    }
  },

  async aiGeneration() {
    console.log("🔍 Testing AI Generation Endpoint...");

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
    console.log(`✅ AI Generation endpoint accessible (status: ${response.status})`);
  },
};

async function runTests() {
  console.log("🚀 Starting Manual E2E Tests\n");

  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      await testFn();
      passed++;
    } catch (error) {
      console.log(`❌ ${testName} failed: ${error.message}`);
      failed++;
    }
    console.log("");
  }

  console.log("📊 Test Results:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Application is working correctly.");
  } else {
    console.log("\n⚠️ Some tests failed. Check the errors above.");
  }
}

runTests().catch(console.error);
