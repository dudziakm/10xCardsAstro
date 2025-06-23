import { z } from 'zod';

class LearningService {
  constructor(supabase) {
    this.supabase = supabase;
  }
  async getNextCard(userId, sessionId) {
    let session;
    if (sessionId) {
      const { data, error } = await this.supabase.from("learning_sessions").select("*").eq("id", sessionId).eq("user_id", userId).eq("is_active", true).single();
      if (error || !data) {
        throw new Error("Session not found or inactive");
      }
      session = data;
    } else {
      const { data, error } = await this.supabase.from("learning_sessions").insert({ user_id: userId }).select().single();
      if (error || !data) {
        throw new Error(`Failed to create learning session: ${error?.message || "No data returned"}`);
      }
      session = data;
    }
    const currentTime = (/* @__PURE__ */ new Date()).toISOString();
    const { data: cards } = await this.supabase.from("flashcards").select(
      `
        id, front, back,
        flashcard_progress!left (
          last_reviewed,
          review_count,
          difficulty_rating,
          next_review_date
        )
      `
    ).eq("user_id", userId).order("created_at", { ascending: true }).limit(10);
    let card = null;
    if (cards && cards.length > 0) {
      const currentDate = /* @__PURE__ */ new Date();
      const dueCards = cards.filter((c) => {
        const progress = c.flashcard_progress?.[0];
        if (!progress) {
          return true;
        }
        if (!progress.next_review_date) {
          return true;
        }
        const nextReview = new Date(progress.next_review_date);
        return nextReview <= currentDate;
      });
      if (dueCards.length > 0) {
        const selectedCard = dueCards[0];
        card = {
          id: selectedCard.id,
          front: selectedCard.front,
          back: selectedCard.back,
          last_reviewed: selectedCard.flashcard_progress?.[0]?.last_reviewed,
          review_count: selectedCard.flashcard_progress?.[0]?.review_count || 0,
          difficulty_rating: selectedCard.flashcard_progress?.[0]?.difficulty_rating || 2.5
        };
      }
    }
    if (card) {
      await this.supabase.from("learning_sessions").update({
        cards_reviewed: session.cards_reviewed + 1,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", session.id);
    }
    const { count: totalCount } = await this.supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", userId);
    const { count: reviewedCount } = await this.supabase.from("flashcard_progress").select("*", { count: "exact", head: true }).eq("user_id", userId).gt("next_review_date", currentTime);
    const cardsRemaining = Math.max(0, (totalCount || 0) - (reviewedCount || 0));
    return {
      card,
      session: {
        session_id: session.id,
        cards_reviewed: session.cards_reviewed + (card ? 1 : 0),
        cards_remaining: cardsRemaining,
        session_start: session.started_at,
        message: !card ? "No cards available for review" : void 0
      }
    };
  }
  async rateFlashcard(userId, sessionId, flashcardId, rating) {
    const { data: session, error: sessionError } = await this.supabase.from("learning_sessions").select("*").eq("id", sessionId).eq("user_id", userId).eq("is_active", true).single();
    if (sessionError || !session) {
      throw new Error("Session not found or inactive");
    }
    const { data: flashcard, error: flashcardError } = await this.supabase.from("flashcards").select("*").eq("id", flashcardId).eq("user_id", userId).single();
    if (flashcardError || !flashcard) {
      throw new Error("Flashcard not found");
    }
    const { data: existingProgress } = await this.supabase.from("flashcard_progress").select("*").eq("user_id", userId).eq("flashcard_id", flashcardId).single();
    const currentDifficulty = existingProgress?.difficulty_rating || 2.5;
    const reviewCount = (existingProgress?.review_count || 0) + 1;
    const newDifficultyRating = this.updateDifficultyRating(currentDifficulty, rating);
    const nextReviewDate = this.calculateNextReviewDate(rating, reviewCount, newDifficultyRating);
    const progressData = {
      user_id: userId,
      flashcard_id: flashcardId,
      last_reviewed: (/* @__PURE__ */ new Date()).toISOString(),
      review_count: reviewCount,
      difficulty_rating: newDifficultyRating,
      next_review_date: nextReviewDate.toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { error: upsertError } = await this.supabase.from("flashcard_progress").upsert(progressData);
    if (upsertError) {
      throw new Error(`Failed to update progress: ${upsertError.message}`);
    }
    const sessionDuration = Math.round(((/* @__PURE__ */ new Date()).getTime() - new Date(session.started_at).getTime()) / (1e3 * 60));
    return {
      flashcard_id: flashcardId,
      rating,
      next_review_date: nextReviewDate.toISOString(),
      review_count: reviewCount,
      difficulty_rating: newDifficultyRating,
      session_progress: {
        cards_reviewed: session.cards_reviewed,
        session_duration_minutes: sessionDuration
      }
    };
  }
  calculateNextReviewDate(rating, reviewCount, currentDifficulty) {
    const baseIntervals = {
      1: 1,
      // 1 day
      2: 2,
      // 2 days
      3: 4,
      // 4 days
      4: 7,
      // 7 days
      5: 14
      // 14 days
    };
    const difficultyMultiplier = Math.max(0.5, Math.min(2, currentDifficulty / 2.5));
    const reviewMultiplier = Math.min(3, 1 + reviewCount * 0.1);
    const interval = baseIntervals[rating] * difficultyMultiplier * reviewMultiplier;
    const nextReview = /* @__PURE__ */ new Date();
    nextReview.setDate(nextReview.getDate() + Math.round(interval));
    return nextReview;
  }
  updateDifficultyRating(currentRating, userRating) {
    const adjustment = (3 - userRating) * 0.2;
    return Math.max(1, Math.min(5, currentRating + adjustment));
  }
}

const getLearningSessionSchema = z.object({
  session_id: z.string().uuid().optional()
});
const rateFlashcardSchema = z.object({
  session_id: z.string().uuid(),
  flashcard_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5)
});

export { LearningService as L, getLearningSessionSchema as g, rateFlashcardSchema as r };
