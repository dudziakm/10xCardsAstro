import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearningService } from "./learning.service";

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
} as any;

describe("LearningService", () => {
  let learningService: LearningService;

  beforeEach(() => {
    vi.clearAllMocks();
    learningService = new LearningService(mockSupabase);
  });

  describe("calculateNextReviewDate", () => {
    it("should calculate correct intervals for different ratings", () => {
      const service = learningService as any; // Access private method
      const baseDate = new Date("2024-01-01T00:00:00.000Z");
      vi.setSystemTime(baseDate);

      // Rating 1 (Again) - 1 day
      const nextReview1 = service.calculateNextReviewDate(1, 1, 2.5);
      expect(nextReview1.getDate()).toBe(2); // Jan 2

      // Rating 3 (Good) - 4 days
      const nextReview3 = service.calculateNextReviewDate(3, 1, 2.5);
      expect(nextReview3.getDate()).toBe(5); // Jan 5

      // Rating 5 (Easy) - 14 days
      const nextReview5 = service.calculateNextReviewDate(5, 1, 2.5);
      expect(nextReview5.getDate()).toBe(15); // Jan 15
    });

    it("should apply difficulty multiplier correctly", () => {
      const service = learningService as any;
      const baseDate = new Date("2024-01-01T00:00:00.000Z");
      vi.setSystemTime(baseDate);

      // High difficulty (5.0) should increase interval
      const nextReviewHard = service.calculateNextReviewDate(3, 1, 5.0);
      // Low difficulty (1.0) should decrease interval
      const nextReviewEasy = service.calculateNextReviewDate(3, 1, 1.0);

      expect(nextReviewHard.getDate()).toBeGreaterThan(nextReviewEasy.getDate());
    });

    it("should apply review count multiplier correctly", () => {
      const service = learningService as any;
      const baseDate = new Date("2024-01-01T00:00:00.000Z");
      vi.setSystemTime(baseDate);

      // First review
      const firstReview = service.calculateNextReviewDate(3, 1, 2.5);
      // Fifth review should have longer interval
      const fifthReview = service.calculateNextReviewDate(3, 5, 2.5);

      expect(fifthReview.getDate()).toBeGreaterThan(firstReview.getDate());
    });
  });

  describe("updateDifficultyRating", () => {
    it("should increase difficulty for low ratings", () => {
      const service = learningService as any;

      // Rating 1 (Again) should increase difficulty
      const newDifficulty1 = service.updateDifficultyRating(2.5, 1);
      expect(newDifficulty1).toBeGreaterThan(2.5);

      // Rating 2 (Hard) should increase difficulty
      const newDifficulty2 = service.updateDifficultyRating(2.5, 2);
      expect(newDifficulty2).toBeGreaterThan(2.5);
    });

    it("should decrease difficulty for high ratings", () => {
      const service = learningService as any;

      // Rating 4 (Easy) should decrease difficulty
      const newDifficulty4 = service.updateDifficultyRating(2.5, 4);
      expect(newDifficulty4).toBeLessThan(2.5);

      // Rating 5 (Very Easy) should decrease difficulty more
      const newDifficulty5 = service.updateDifficultyRating(2.5, 5);
      expect(newDifficulty5).toBeLessThan(newDifficulty4);
    });

    it("should keep difficulty unchanged for neutral rating", () => {
      const service = learningService as any;

      // Rating 3 (Good) should keep difficulty same
      const newDifficulty = service.updateDifficultyRating(2.5, 3);
      expect(newDifficulty).toBe(2.5);
    });

    it("should enforce difficulty bounds", () => {
      const service = learningService as any;

      // Should not go below 1.0
      const minDifficulty = service.updateDifficultyRating(1.1, 1);
      expect(minDifficulty).toBeGreaterThanOrEqual(1.0);

      // Should not go above 5.0
      const maxDifficulty = service.updateDifficultyRating(4.9, 5);
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

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      });

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

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
          count: vi.fn().mockResolvedValue({ count: 0 }),
          head: vi.fn(),
          gt: vi.fn().mockReturnValue({
            count: vi.fn().mockResolvedValue({ count: 0 }),
          }),
        }),
      });

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

      mockSupabase.from.mockImplementation((table) => {
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
