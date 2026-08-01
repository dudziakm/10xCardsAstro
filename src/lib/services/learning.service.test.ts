/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LearningService } from "./learning.service";
import { ReviewScheduler } from "./review-scheduler";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
  })),
} as unknown as SupabaseClient;

describe("LearningService", () => {
  let learningService: LearningService;

  beforeEach(() => {
    vi.clearAllMocks();
    learningService = new LearningService(mockSupabase);
  });

  describe("calculateNextReviewDate", () => {
    it("should calculate correct intervals for different ratings", () => {
      const scheduler = new ReviewScheduler();
      const baseDate = new Date("2024-01-01T00:00:00.000Z");

      // Rating 1 (Again) - 1 day
      const nextReview1 = scheduler.calculateNextReviewDate(1, 0, 2.5, baseDate);
      expect(nextReview1.toISOString()).toBe("2024-01-02T00:00:00.000Z");

      // Rating 3 (Good) - 4 days
      const nextReview3 = scheduler.calculateNextReviewDate(3, 0, 2.5, baseDate);
      expect(nextReview3.toISOString()).toBe("2024-01-05T00:00:00.000Z");

      // Rating 5 (Easy) - 14 days
      const nextReview5 = scheduler.calculateNextReviewDate(5, 0, 2.5, baseDate);
      expect(nextReview5.toISOString()).toBe("2024-01-15T00:00:00.000Z");
    });

    it("should apply difficulty multiplier correctly", () => {
      const scheduler = new ReviewScheduler();
      const baseDate = new Date("2024-01-01T00:00:00.000Z");

      // High difficulty (5.0) should increase interval
      const nextReviewHard = scheduler.calculateNextReviewDate(3, 0, 5.0, baseDate);
      // Low difficulty (1.0) should decrease interval
      const nextReviewEasy = scheduler.calculateNextReviewDate(3, 0, 1.0, baseDate);

      expect(nextReviewHard.getDate()).toBeGreaterThan(nextReviewEasy.getDate());
    });

    it("should apply review count multiplier correctly", () => {
      const scheduler = new ReviewScheduler();
      const baseDate = new Date("2024-01-01T00:00:00.000Z");

      // First review
      const firstReview = scheduler.calculateNextReviewDate(3, 1, 2.5, baseDate);
      // Fifth review should have longer interval
      const fifthReview = scheduler.calculateNextReviewDate(3, 5, 2.5, baseDate);

      expect(fifthReview.getDate()).toBeGreaterThan(firstReview.getDate());
    });
  });

  describe("updateDifficultyRating", () => {
    it("should increase difficulty for low ratings", () => {
      const scheduler = new ReviewScheduler();

      // Rating 1 (Again) should increase difficulty
      const newDifficulty1 = scheduler.updateDifficultyRating(2.5, 1);
      expect(newDifficulty1).toBeGreaterThan(2.5);

      // Rating 2 (Hard) should increase difficulty
      const newDifficulty2 = scheduler.updateDifficultyRating(2.5, 2);
      expect(newDifficulty2).toBeGreaterThan(2.5);
    });

    it("should decrease difficulty for high ratings", () => {
      const scheduler = new ReviewScheduler();

      // Rating 4 (Easy) should decrease difficulty
      const newDifficulty4 = scheduler.updateDifficultyRating(2.5, 4);
      expect(newDifficulty4).toBeLessThan(2.5);

      // Rating 5 (Very Easy) should decrease difficulty more
      const newDifficulty5 = scheduler.updateDifficultyRating(2.5, 5);
      expect(newDifficulty5).toBeLessThan(newDifficulty4);
    });

    it("should keep difficulty unchanged for neutral rating", () => {
      const scheduler = new ReviewScheduler();

      // Rating 3 (Good) should keep difficulty same
      const newDifficulty = scheduler.updateDifficultyRating(2.5, 3);
      expect(newDifficulty).toBe(2.5);
    });

    it("should enforce difficulty bounds", () => {
      const scheduler = new ReviewScheduler();

      // Should not go below 1.0
      const minDifficulty = scheduler.updateDifficultyRating(1.1, 1);
      expect(minDifficulty).toBeGreaterThanOrEqual(1.0);

      // Should not go above 5.0
      const maxDifficulty = scheduler.updateDifficultyRating(4.9, 5);
      expect(maxDifficulty).toBeLessThanOrEqual(5.0);
    });
  });

  describe("getNextCard", () => {
    it("should create new session when sessionId not provided", async () => {
      const mockSession = {
        id: "session-123",
        user_id: "user-123",
        cards_reviewed: 0,
        started_at: new Date().toISOString(),
      };

      mockEmptyLearningQueries(mockSession);

      await learningService.getNextCard("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("learning_sessions");
    });

    it("should return no card message when no cards available", async () => {
      const mockSession = {
        id: "session-123",
        user_id: "user-123",
        cards_reviewed: 0,
        started_at: new Date().toISOString(),
      };

      mockEmptyLearningQueries(mockSession);

      const result = await learningService.getNextCard("user-123");

      expect(result.card).toBeNull();
      expect(result.session.message).toBe("No cards available for review");
    });
  });

  describe("rateFlashcard", () => {
    it("should update flashcard progress correctly", async () => {
      const mockSession = {
        id: "session-123",
        user_id: "user-123",
        cards_reviewed: 1,
        started_at: new Date().toISOString(),
      };
      const mockFlashcard = { id: "card-123", user_id: "user-123", front: "Test", back: "Answer" };
      const mockProgress = { difficulty_rating: 2.5, review_count: 1 };

      (mockSupabase.from as any).mockImplementation((table: any) => {
        if (table === "learning_sessions") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "flashcards") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockFlashcard, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "flashcard_progress") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockProgress, error: null }),
                }),
              }),
            }),
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const result = await learningService.rateFlashcard("user-123", "session-123", "card-123", 4);

      expect(result.flashcard_id).toBe("card-123");
      expect(result.rating).toBe(4);
      expect(result.review_count).toBe(2); // incremented from 1
      expect(result.difficulty_rating).toBeLessThan(2.5); // should decrease for rating 4
    });
  });
});

function mockEmptyLearningQueries(mockSession: Record<string, unknown>) {
  (mockSupabase.from as any).mockImplementation((table: string) => {
    if (table === "learning_sessions") {
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
          }),
        }),
      };
    }

    if (table === "flashcards") {
      return {
        select: vi.fn((_query?: string, options?: { count?: string; head?: boolean }) => ({
          eq: vi.fn(() =>
            options?.head
              ? Promise.resolve({ count: 0, error: null })
              : {
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  })),
                }
          ),
        })),
      };
    }

    if (table === "flashcard_progress") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn().mockResolvedValue({ count: 0, error: null }),
          })),
        })),
      };
    }

    throw new Error(`Unexpected table in test: ${table}`);
  });
}
