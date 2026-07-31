import { describe, expect, it } from "vitest";
import { ReviewScheduler } from "./review-scheduler";

const NOW = new Date("2024-01-01T00:00:00.000Z");
const BASE_INTERVAL_CASES: [number, string][] = [
  [1, "2024-01-02T00:00:00.000Z"],
  [2, "2024-01-03T00:00:00.000Z"],
  [3, "2024-01-05T00:00:00.000Z"],
  [4, "2024-01-08T00:00:00.000Z"],
  [5, "2024-01-15T00:00:00.000Z"],
];
const DIFFICULTY_CASES: [number, number][] = [
  [1, 2.9],
  [2, 2.7],
  [3, 2.5],
  [4, 2.3],
  [5, 2.1],
];

describe("ReviewScheduler", () => {
  const scheduler = new ReviewScheduler();

  it.each(BASE_INTERVAL_CASES)("preserves the base interval for rating %i", (rating, expectedDate) => {
    const result = scheduler.calculateNextReviewDate(rating, 0, 2.5, NOW);

    expect(result.toISOString()).toBe(expectedDate);
  });

  it.each(DIFFICULTY_CASES)("preserves the difficulty adjustment for rating %i", (rating, expectedDifficulty) => {
    expect(scheduler.updateDifficultyRating(2.5, rating)).toBeCloseTo(expectedDifficulty);
  });

  it("preserves difficulty and review-count multipliers", () => {
    const difficultCard = scheduler.calculateNextReviewDate(3, 0, 5, NOW);
    const oftenReviewedCard = scheduler.calculateNextReviewDate(3, 5, 2.5, NOW);

    expect(difficultCard.toISOString()).toBe("2024-01-09T00:00:00.000Z");
    expect(oftenReviewedCard.toISOString()).toBe("2024-01-07T00:00:00.000Z");
  });

  it("clamps difficulty to the existing 1-5 bounds", () => {
    expect(scheduler.updateDifficultyRating(4.9, 1)).toBe(5);
    expect(scheduler.updateDifficultyRating(1.1, 5)).toBe(1);
  });

  it("does not mutate the caller-owned clock value", () => {
    const originalTimestamp = NOW.getTime();

    scheduler.calculateNextReviewDate(5, 0, 2.5, NOW);

    expect(NOW.getTime()).toBe(originalTimestamp);
  });

  it("returns one consistent schedule for persistence", () => {
    const schedule = scheduler.schedule(4, 2, 2.5, NOW);

    expect(schedule.difficultyRating).toBeCloseTo(2.3);
    expect(schedule.nextReviewDate.toISOString()).toBe("2024-01-09T00:00:00.000Z");
  });
});
