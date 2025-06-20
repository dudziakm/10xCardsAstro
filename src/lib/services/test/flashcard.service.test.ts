import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FlashcardService } from "../flashcard.service";
import { ZodError } from "zod";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe("FlashcardService", () => {
  let service: FlashcardService;
  const userId = "test-user-id";

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Create service with mock
    service = new FlashcardService(mockSupabase as unknown as SupabaseClient);
  });

  it("should create a flashcard successfully", async () => {
    // Mock successful response
    const mockFlashcard = {
      id: "test-id",
      user_id: userId,
      front: "Test Question",
      back: "Test Answer",
      source: "manual",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockFlashcard,
      error: null,
    });

    // Call the service
    const result = await service.createFlashcard(userId, {
      front: "Test Question",
      back: "Test Answer",
    });

    // Verify the result
    expect(result).toEqual({
      id: mockFlashcard.id,
      front: mockFlashcard.front,
      back: mockFlashcard.back,
      source: mockFlashcard.source,
      created_at: mockFlashcard.created_at,
      updated_at: mockFlashcard.updated_at,
    });

    // Verify Supabase was called correctly
    expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: userId,
      front: "Test Question",
      back: "Test Answer",
      source: "manual",
    });
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.single).toHaveBeenCalled();
  });

  it("should throw an error if Supabase operation fails", async () => {
    // Mock error response
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" },
    });

    // Call the service and expect error
    await expect(
      service.createFlashcard(userId, {
        front: "Test Question",
        back: "Test Answer",
      })
    ).rejects.toThrow("Failed to create flashcard: Database error");
  });

  it("should validate input data", async () => {
    // Invalid data (empty front)
    const invalidData = {
      front: "",
      back: "Test Answer",
    };

    // Expect validation error
    await expect(service.createFlashcard(userId, invalidData)).rejects.toThrow(ZodError);
  });
});
