import type { FlashcardEntity } from '../types/entities';

const GUEST_FLASHCARDS_KEY = 'my10xCards_guest_flashcards';
const GUEST_PROGRESS_KEY = 'my10xCards_guest_progress';

export interface GuestFlashcard extends Omit<FlashcardEntity, 'user_id'> {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface GuestProgress {
  flashcard_id: string;
  next_review_date: string;
  review_count: number;
  difficulty_rating: number;
  last_reviewed_at: string | null;
}

export class GuestFlashcardService {
  private static generateId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getFlashcards(): GuestFlashcard[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(GUEST_FLASHCARDS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveFlashcards(flashcards: GuestFlashcard[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_FLASHCARDS_KEY, JSON.stringify(flashcards));
  }

  static createFlashcard(front: string, back: string, source: 'manual' | 'ai' = 'manual'): GuestFlashcard {
    const now = new Date().toISOString();
    const newFlashcard: GuestFlashcard = {
      id: this.generateId(),
      front,
      back,
      source,
      difficulty: 'medium',
      created_at: now,
      updated_at: now,
    };

    const flashcards = this.getFlashcards();
    flashcards.push(newFlashcard);
    this.saveFlashcards(flashcards);

    return newFlashcard;
  }

  static updateFlashcard(id: string, updates: Partial<Pick<GuestFlashcard, 'front' | 'back'>>): GuestFlashcard | null {
    const flashcards = this.getFlashcards();
    const index = flashcards.findIndex(f => f.id === id);
    
    if (index === -1) return null;

    flashcards[index] = {
      ...flashcards[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveFlashcards(flashcards);
    return flashcards[index];
  }

  static deleteFlashcard(id: string): boolean {
    const flashcards = this.getFlashcards();
    const filtered = flashcards.filter(f => f.id !== id);
    
    if (filtered.length === flashcards.length) return false;
    
    this.saveFlashcards(filtered);
    this.deleteProgress(id);
    return true;
  }

  static getFlashcard(id: string): GuestFlashcard | null {
    const flashcards = this.getFlashcards();
    return flashcards.find(f => f.id === id) || null;
  }

  static searchFlashcards(query: string, source?: 'manual' | 'ai'): GuestFlashcard[] {
    const flashcards = this.getFlashcards();
    let filtered = flashcards;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(f => 
        f.front.toLowerCase().includes(lowerQuery) || 
        f.back.toLowerCase().includes(lowerQuery)
      );
    }

    if (source) {
      filtered = filtered.filter(f => f.source === source);
    }

    return filtered;
  }

  // Progress management
  static getProgress(): GuestProgress[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(GUEST_PROGRESS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveProgress(progress: GuestProgress[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(progress));
  }

  static updateProgress(flashcardId: string, rating: number): void {
    const progress = this.getProgress();
    const existingIndex = progress.findIndex(p => p.flashcard_id === flashcardId);

    const intervals = [1, 2, 4, 7, 14]; // Days
    const interval = intervals[Math.min(rating - 1, intervals.length - 1)];
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const updatedProgress: GuestProgress = {
      flashcard_id: flashcardId,
      next_review_date: nextReviewDate.toISOString(),
      review_count: existingIndex >= 0 ? progress[existingIndex].review_count + 1 : 1,
      difficulty_rating: rating,
      last_reviewed_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = updatedProgress;
    } else {
      progress.push(updatedProgress);
    }

    this.saveProgress(progress);
  }

  static deleteProgress(flashcardId: string): void {
    const progress = this.getProgress();
    const filtered = progress.filter(p => p.flashcard_id !== flashcardId);
    this.saveProgress(filtered);
  }

  static getFlashcardsForReview(): GuestFlashcard[] {
    const flashcards = this.getFlashcards();
    const progress = this.getProgress();
    const now = new Date();

    // Get flashcards that need review
    const needsReview = flashcards.filter(flashcard => {
      const cardProgress = progress.find(p => p.flashcard_id === flashcard.id);
      
      // If never reviewed, include it
      if (!cardProgress) return true;
      
      // If review date has passed, include it
      return new Date(cardProgress.next_review_date) <= now;
    });

    // Sort by priority (unreviewed first, then by review date)
    return needsReview.sort((a, b) => {
      const progressA = progress.find(p => p.flashcard_id === a.id);
      const progressB = progress.find(p => p.flashcard_id === b.id);
      
      if (!progressA && !progressB) return 0;
      if (!progressA) return -1;
      if (!progressB) return 1;
      
      return new Date(progressA.next_review_date).getTime() - new Date(progressB.next_review_date).getTime();
    });
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_FLASHCARDS_KEY);
    localStorage.removeItem(GUEST_PROGRESS_KEY);
  }

  static importToUser(userId: string): { flashcards: GuestFlashcard[], progress: GuestProgress[] } {
    const flashcards = this.getFlashcards();
    const progress = this.getProgress();
    
    // This would be called from an API endpoint that saves to the database
    // For now, just return the data
    return { flashcards, progress };
  }
}