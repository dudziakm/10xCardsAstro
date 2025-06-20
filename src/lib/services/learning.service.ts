import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  GetLearningSessionResponseDTO, 
  RateFlashcardResponseDTO 
} from '../../types';

export class LearningService {
  constructor(private supabase: SupabaseClient) {}

  async getNextCard(userId: string, sessionId?: string): Promise<GetLearningSessionResponseDTO> {
    console.log('LearningService.getNextCard called with:', { userId, sessionId });
    // Get or create session
    let session;
    if (sessionId) {
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        throw new Error('Session not found or inactive');
      }
      session = data;
    } else {
      // Create new session
      console.log('Creating learning session for userId:', userId);
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (error || !data) {
        console.error('Learning session creation error:', error);
        throw new Error(`Failed to create learning session: ${error?.message || 'No data returned'}`);
      }
      session = data;
    }

    // Get next card using simple spaced repetition algorithm
    // First, try to get cards due for review (or never reviewed)
    const currentTime = new Date().toISOString();
    
    const { data: cards, error: cardsError } = await this.supabase
      .from('flashcards')
      .select(`
        id, front, back,
        flashcard_progress!left (
          last_reviewed,
          review_count,
          difficulty_rating,
          next_review_date
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    console.log('Cards query result:', { 
      cardsCount: cards?.length || 0, 
      cardsError, 
      userId,
      cards: cards?.map(c => ({ 
        id: c.id, 
        front: c.front.substring(0, 20), 
        progress: c.flashcard_progress?.[0] || 'no progress' 
      }))
    });

    let card = null;
    if (cards && cards.length > 0) {
      // Filter cards that are due for review (no progress record or next_review_date <= now)
      const currentDate = new Date();
      const dueCards = cards.filter(c => {
        const progress = c.flashcard_progress?.[0];
        console.log('Checking card:', c.id, 'progress:', progress);
        if (!progress) {
          console.log('Card has no progress - including');
          return true; // Never reviewed
        }
        if (!progress.next_review_date) {
          console.log('Card has no next_review_date - including');
          return true; // No next review date set
        }
        const nextReview = new Date(progress.next_review_date);
        console.log('Card next review:', nextReview, 'vs current:', currentDate);
        return nextReview <= currentDate;
      });
      
      console.log('Due cards count:', dueCards.length);
      
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
        console.log('Selected card for learning:', card.id);
      }
    }

    // Update session stats if card was found
    if (card) {
      await this.supabase
        .from('learning_sessions')
        .update({ 
          cards_reviewed: session.cards_reviewed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    }

    // Get total cards count and calculate remaining
    const { count: totalCount } = await this.supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: reviewedCount } = await this.supabase
      .from('flashcard_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('next_review_date', currentTime);

    const cardsRemaining = Math.max(0, (totalCount || 0) - (reviewedCount || 0));

    return {
      card,
      session: {
        session_id: session.id,
        cards_reviewed: session.cards_reviewed + (card ? 1 : 0),
        cards_remaining: cardsRemaining,
        session_start: session.started_at,
        message: !card ? 'No cards available for review' : undefined
      }
    };
  }

  async rateFlashcard(
    userId: string,
    sessionId: string,
    flashcardId: string,
    rating: number
  ): Promise<RateFlashcardResponseDTO> {
    // Verify session belongs to user
    const { data: session, error: sessionError } = await this.supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (sessionError || !session) {
      throw new Error('Session not found or inactive');
    }
    
    // Verify flashcard belongs to user
    const { data: flashcard, error: flashcardError } = await this.supabase
      .from('flashcards')
      .select('*')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();
    
    if (flashcardError || !flashcard) {
      throw new Error('Flashcard not found');
    }
    
    // Get existing progress record
    const { data: existingProgress } = await this.supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .single();
    
    const currentDifficulty = existingProgress?.difficulty_rating || 2.5;
    const reviewCount = (existingProgress?.review_count || 0) + 1;
    
    // Calculate new values
    const newDifficultyRating = this.updateDifficultyRating(currentDifficulty, rating);
    const nextReviewDate = this.calculateNextReviewDate(rating, reviewCount, newDifficultyRating);
    
    // Upsert progress record
    const progressData = {
      user_id: userId,
      flashcard_id: flashcardId,
      last_reviewed: new Date().toISOString(),
      review_count: reviewCount,
      difficulty_rating: newDifficultyRating,
      next_review_date: nextReviewDate.toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { error: upsertError } = await this.supabase
      .from('flashcard_progress')
      .upsert(progressData);
    
    if (upsertError) {
      throw new Error(`Failed to update progress: ${upsertError.message}`);
    }
    
    // Calculate session duration
    const sessionDuration = Math.round(
      (new Date().getTime() - new Date(session.started_at).getTime()) / (1000 * 60)
    );
    
    return {
      flashcard_id: flashcardId,
      rating,
      next_review_date: nextReviewDate.toISOString(),
      review_count: reviewCount,
      difficulty_rating: newDifficultyRating,
      session_progress: {
        cards_reviewed: session.cards_reviewed,
        session_duration_minutes: sessionDuration,
      },
    };
  }
  
  private calculateNextReviewDate(rating: number, reviewCount: number, currentDifficulty: number): Date {
    const baseIntervals: { [key: number]: number } = { 
      1: 1,    // 1 day
      2: 2,    // 2 days  
      3: 4,    // 4 days
      4: 7,    // 7 days
      5: 14    // 14 days
    };
    
    const difficultyMultiplier = Math.max(0.5, Math.min(2.0, currentDifficulty / 2.5));
    const reviewMultiplier = Math.min(3.0, 1 + (reviewCount * 0.1));
    const interval = baseIntervals[rating] * difficultyMultiplier * reviewMultiplier;
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.round(interval));
    return nextReview;
  }
  
  private updateDifficultyRating(currentRating: number, userRating: number): number {
    const adjustment = (userRating - 3) * 0.1;
    return Math.max(1.0, Math.min(5.0, currentRating + adjustment));
  }
}