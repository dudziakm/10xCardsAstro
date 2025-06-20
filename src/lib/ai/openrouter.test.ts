import { describe, it, expect, vi, beforeEach } from "vitest";
import { callOpenRouterAI } from "./openrouter";

describe("OpenRouter AI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable is already set in test setup
  });

  describe("callOpenRouterAI", () => {
    it("should throw error when API key is missing", async () => {
      Object.defineProperty(import.meta, "env", {
        value: {},
        writable: true,
      });

      await expect(callOpenRouterAI("test input")).rejects.toThrow("OPENROUTER_API_KEY not configured");
    });

    it("should make correct API request with proper headers", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: JSON.stringify({
                    flashcards: [
                      { front: "Test Front 1", back: "Test Back 1" },
                      { front: "Test Front 2", back: "Test Back 2" },
                    ],
                  }),
                },
              },
            ],
            usage: {
              prompt_tokens: 100,
              completion_tokens: 50,
              total_tokens: 150,
            },
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await callOpenRouterAI("Test input text", 3);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://my10xcards.local",
            "X-Title": "my10xCards AI Flashcard Generator",
          }),
          body: expect.stringContaining("anthropic/claude-3-haiku:beta"),
        })
      );

      expect(result.candidates).toHaveLength(2);
      expect(result.model).toBe("anthropic/claude-3-haiku:beta");
      expect(result.usage?.total_tokens).toBe(150);
    });

    it("should parse AI response correctly", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockFlashcards = [
        { front: "What is React?", back: "A JavaScript library for building user interfaces" },
        { front: "What is JSX?", back: "JavaScript XML syntax extension" },
      ];

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: JSON.stringify({ flashcards: mockFlashcards }),
                },
              },
            ],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await callOpenRouterAI("React concepts");

      expect(result.candidates).toEqual(mockFlashcards);
    });

    it("should filter out invalid flashcards", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockFlashcards = [
        { front: "Valid Front", back: "Valid Back" },
        { front: "", back: "No front" }, // Invalid - empty front
        { front: "No back", back: "" }, // Invalid - empty back
        { front: "Another Valid", back: "Another Valid Back" },
      ];

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: JSON.stringify({ flashcards: mockFlashcards }),
                },
              },
            ],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await callOpenRouterAI("Test input");

      expect(result.candidates).toHaveLength(2);
      expect(result.candidates[0].front).toBe("Valid Front");
      expect(result.candidates[1].front).toBe("Another Valid");
    });

    it("should truncate long content to specified limits", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const longFront = "A".repeat(300); // Exceeds 200 char limit
      const longBack = "B".repeat(600); // Exceeds 500 char limit

      const mockFlashcards = [{ front: longFront, back: longBack }];

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: JSON.stringify({ flashcards: mockFlashcards }),
                },
              },
            ],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await callOpenRouterAI("Test input");

      expect(result.candidates[0].front).toHaveLength(200);
      expect(result.candidates[0].back).toHaveLength(500);
    });

    it("should handle API errors properly", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockResponse = {
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(callOpenRouterAI("Test input")).rejects.toThrow("OpenRouter API error: 401 - Unauthorized");
    });

    it("should handle invalid JSON response", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "Invalid JSON response",
                },
              },
            ],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(callOpenRouterAI("Test input")).rejects.toThrow("Failed to parse AI response");
    });

    it("should handle missing flashcards array in response", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: JSON.stringify({ message: "No flashcards here" }),
                },
              },
            ],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(callOpenRouterAI("Test input")).rejects.toThrow(
        "Invalid AI response format - missing flashcards array"
      );
    });

    it("should handle empty choices array", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(callOpenRouterAI("Test input")).rejects.toThrow("No response from AI model");
    });

    it("should handle network errors", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(callOpenRouterAI("Test input")).rejects.toThrow("Network error");
    });

    it("should use correct default count parameter", async () => {
      // Restore the mock API key for this test
      Object.defineProperty(import.meta, "env", {
        value: {
          OPENROUTER_API_KEY: "test-api-key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test-anon-key",
        },
        writable: true,
      });

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "anthropic/claude-3-haiku:beta",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: JSON.stringify({
                    flashcards: [{ front: "Test Front", back: "Test Back" }],
                  }),
                },
              },
            ],
          }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await callOpenRouterAI("Test input"); // No count specified

      const requestBody = JSON.parse((global.fetch as vi.Mock).mock.calls[0][1].body);
      expect(requestBody.messages[0].content).toContain("stwórz 5 fiszek"); // Default count = 5
    });
  });
});
