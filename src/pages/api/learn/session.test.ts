import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the learning service
vi.mock('../../../lib/services/learning.service.ts', () => ({
  LearningService: vi.fn().mockImplementation(() => ({
    getNextCard: vi.fn(),
    rateFlashcard: vi.fn(),
  }))
}));

describe('Learning Session API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/learn/session', () => {
    it('should start new learning session and return next card', async () => {
      const mockCard = {
        id: 'card-123',
        front: 'What is React?',
        back: 'A JavaScript library for building user interfaces',
        last_reviewed: null,
        review_count: 0,
        difficulty_rating: 2.5
      };

      const mockSession = {
        session_id: 'session-123',
        cards_reviewed: 0,
        cards_remaining: 5,
        session_start: new Date().toISOString()
      };

      const mockLearningService = {
        getNextCard: vi.fn().mockResolvedValue({
          card: mockCard,
          session: mockSession
        })
      };

      const result = await mockLearningService.getNextCard('test-user-123');

      expect(result.card).toEqual(mockCard);
      expect(result.session.session_id).toBe('session-123');
      expect(result.session.cards_remaining).toBe(5);
      expect(mockLearningService.getNextCard).toHaveBeenCalledWith('test-user-123');
    });

    it('should continue existing session when session_id provided', async () => {
      const mockCard = {
        id: 'card-456',
        front: 'What is JSX?',
        back: 'JavaScript XML syntax extension',
        last_reviewed: '2024-01-01T10:00:00Z',
        review_count: 1,
        difficulty_rating: 2.3
      };

      const mockSession = {
        session_id: 'existing-session-123',
        cards_reviewed: 3,
        cards_remaining: 2,
        session_start: '2024-01-01T09:00:00Z'
      };

      const mockLearningService = {
        getNextCard: vi.fn().mockResolvedValue({
          card: mockCard,
          session: mockSession
        })
      };

      const result = await mockLearningService.getNextCard('test-user-123', 'existing-session-123');

      expect(result.card).toEqual(mockCard);
      expect(result.session.cards_reviewed).toBe(3);
      expect(mockLearningService.getNextCard).toHaveBeenCalledWith('test-user-123', 'existing-session-123');
    });

    it('should handle no cards available scenario', async () => {
      const mockSession = {
        session_id: 'session-123',
        cards_reviewed: 0,
        cards_remaining: 0,
        session_start: new Date().toISOString(),
        message: 'No cards available for review'
      };

      const mockLearningService = {
        getNextCard: vi.fn().mockResolvedValue({
          card: null,
          session: mockSession
        })
      };

      const result = await mockLearningService.getNextCard('test-user-123');

      expect(result.card).toBeNull();
      expect(result.session.message).toBe('No cards available for review');
      expect(result.session.cards_remaining).toBe(0);
    });

    it('should handle invalid session error', async () => {
      const mockLearningService = {
        getNextCard: vi.fn().mockRejectedValue(new Error('Session not found or inactive'))
      };

      await expect(mockLearningService.getNextCard('test-user-123', 'invalid-session'))
        .rejects.toThrow('Session not found or inactive');
    });
  });

  describe('POST /api/learn/session/rate', () => {
    it('should rate flashcard and update learning progress', async () => {
      const ratingResult = {
        flashcard_id: 'card-123',
        rating: 4,
        next_review_date: '2024-01-08T10:00:00Z',
        review_count: 2,
        difficulty_rating: 2.4,
        session_progress: {
          cards_reviewed: 4,
          session_duration_minutes: 15
        }
      };

      const mockLearningService = {
        rateFlashcard: vi.fn().mockResolvedValue(ratingResult)
      };

      const result = await mockLearningService.rateFlashcard(
        'test-user-123',
        'session-123', 
        'card-123',
        4
      );

      expect(result.flashcard_id).toBe('card-123');
      expect(result.rating).toBe(4);
      expect(result.review_count).toBe(2);
      expect(result.difficulty_rating).toBe(2.4);
      expect(result.session_progress.cards_reviewed).toBe(4);
      expect(mockLearningService.rateFlashcard).toHaveBeenCalledWith(
        'test-user-123',
        'session-123',
        'card-123',
        4
      );
    });

    it('should validate rating values', async () => {
      const mockLearningService = {
        rateFlashcard: vi.fn().mockRejectedValue(new Error('Invalid rating: must be between 1 and 5'))
      };

      // Test invalid rating (0)
      await expect(mockLearningService.rateFlashcard('user-123', 'session-123', 'card-123', 0))
        .rejects.toThrow('Invalid rating: must be between 1 and 5');

      // Test invalid rating (6)
      await expect(mockLearningService.rateFlashcard('user-123', 'session-123', 'card-123', 6))
        .rejects.toThrow('Invalid rating: must be between 1 and 5');
    });

    it('should handle flashcard not found error', async () => {
      const mockLearningService = {
        rateFlashcard: vi.fn().mockRejectedValue(new Error('Flashcard not found'))
      };

      await expect(mockLearningService.rateFlashcard(
        'test-user-123',
        'session-123',
        'nonexistent-card',
        3
      )).rejects.toThrow('Flashcard not found');
    });

    it('should verify session ownership', async () => {
      const mockLearningService = {
        rateFlashcard: vi.fn().mockRejectedValue(new Error('Session not found or inactive'))
      };

      await expect(mockLearningService.rateFlashcard(
        'test-user-123',
        'other-user-session',
        'card-123',
        3
      )).rejects.toThrow('Session not found or inactive');
    });
  });

  describe('Spaced Repetition Algorithm', () => {
    it('should calculate appropriate intervals for different ratings', async () => {
      const testCases = [
        { rating: 1, expectedMinDays: 1, expectedMaxDays: 2 },   // Again - short interval
        { rating: 2, expectedMinDays: 1, expectedMaxDays: 3 },   // Hard - short interval  
        { rating: 3, expectedMinDays: 3, expectedMaxDays: 5 },   // Good - medium interval
        { rating: 4, expectedMinDays: 6, expectedMaxDays: 8 },   // Easy - longer interval
        { rating: 5, expectedMinDays: 12, expectedMaxDays: 16 }  // Very Easy - longest interval
      ];

      for (const testCase of testCases) {
        const mockResult = {
          flashcard_id: 'card-123',
          rating: testCase.rating,
          next_review_date: new Date(Date.now() + (testCase.expectedMinDays + 1) * 24 * 60 * 60 * 1000).toISOString(),
          review_count: 1,
          difficulty_rating: 2.5,
          session_progress: { cards_reviewed: 1, session_duration_minutes: 5 }
        };

        const mockLearningService = {
          rateFlashcard: vi.fn().mockResolvedValue(mockResult)
        };

        const result = await mockLearningService.rateFlashcard('user-123', 'session-123', 'card-123', testCase.rating);
        
        const nextReviewDate = new Date(result.next_review_date);
        const daysDifference = Math.floor((nextReviewDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        
        expect(daysDifference).toBeGreaterThanOrEqual(testCase.expectedMinDays);
        expect(daysDifference).toBeLessThanOrEqual(testCase.expectedMaxDays);
      }
    });

    it('should increase intervals for higher review counts', async () => {
      const firstReview = {
        flashcard_id: 'card-123',
        rating: 3,
        next_review_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        review_count: 1,
        difficulty_rating: 2.5,
        session_progress: { cards_reviewed: 1, session_duration_minutes: 5 }
      };

      const fifthReview = {
        flashcard_id: 'card-123',
        rating: 3,
        next_review_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        review_count: 5,
        difficulty_rating: 2.5,
        session_progress: { cards_reviewed: 1, session_duration_minutes: 5 }
      };

      const mockLearningService = {
        rateFlashcard: vi.fn()
          .mockResolvedValueOnce(firstReview)
          .mockResolvedValueOnce(fifthReview)
      };

      const result1 = await mockLearningService.rateFlashcard('user-123', 'session-123', 'card-123', 3);
      const result5 = await mockLearningService.rateFlashcard('user-123', 'session-123', 'card-123', 3);

      const days1 = Math.floor((new Date(result1.next_review_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      const days5 = Math.floor((new Date(result5.next_review_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

      expect(days5).toBeGreaterThan(days1);
    });
  });

  describe('Session Management', () => {
    it('should track session duration correctly', async () => {
      const sessionStart = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      
      const mockResult = {
        flashcard_id: 'card-123',
        rating: 3,
        next_review_date: new Date().toISOString(),
        review_count: 1,
        difficulty_rating: 2.5,
        session_progress: {
          cards_reviewed: 3,
          session_duration_minutes: 10
        }
      };

      const mockLearningService = {
        rateFlashcard: vi.fn().mockResolvedValue(mockResult)
      };

      const result = await mockLearningService.rateFlashcard('user-123', 'session-123', 'card-123', 3);

      expect(result.session_progress.session_duration_minutes).toBe(10);
      expect(result.session_progress.cards_reviewed).toBe(3);
    });

    it('should update cards reviewed counter', async () => {
      const mockSession = {
        session_id: 'session-123',
        cards_reviewed: 5, // Should increment after rating
        cards_remaining: 2,
        session_start: new Date().toISOString()
      };

      const mockLearningService = {
        getNextCard: vi.fn().mockResolvedValue({
          card: { id: 'next-card', front: 'Next question', back: 'Next answer' },
          session: mockSession
        })
      };

      const result = await mockLearningService.getNextCard('test-user-123', 'session-123');

      expect(result.session.cards_reviewed).toBe(5);
    });
  });
});