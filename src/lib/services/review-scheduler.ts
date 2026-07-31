export interface ReviewSchedule {
  difficultyRating: number;
  nextReviewDate: Date;
}

/**
 * Pure spaced-repetition calculations used after a flashcard is rated.
 *
 * The caller supplies `now`, which keeps the calculation deterministic and
 * leaves persistence and clock ownership in LearningService.
 */
export class ReviewScheduler {
  schedule(rating: number, reviewCount: number, currentDifficulty: number, now: Date): ReviewSchedule {
    const difficultyRating = this.updateDifficultyRating(currentDifficulty, rating);

    return {
      difficultyRating,
      nextReviewDate: this.calculateNextReviewDate(rating, reviewCount, difficultyRating, now),
    };
  }

  calculateNextReviewDate(rating: number, reviewCount: number, currentDifficulty: number, now: Date): Date {
    const baseIntervals: Record<number, number> = {
      1: 1,
      2: 2,
      3: 4,
      4: 7,
      5: 14,
    };

    const difficultyMultiplier = Math.max(0.5, Math.min(2.0, currentDifficulty / 2.5));
    const reviewMultiplier = Math.min(3.0, 1 + reviewCount * 0.1);
    const interval = baseIntervals[rating] * difficultyMultiplier * reviewMultiplier;

    const nextReview = new Date(now.getTime());
    nextReview.setDate(nextReview.getDate() + Math.round(interval));
    return nextReview;
  }

  updateDifficultyRating(currentRating: number, userRating: number): number {
    const adjustment = (3 - userRating) * 0.2;
    return Math.max(1.0, Math.min(5.0, currentRating + adjustment));
  }
}
