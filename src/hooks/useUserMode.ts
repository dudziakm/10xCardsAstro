import { useState, useEffect } from 'react';
import { GuestFlashcardService, type GuestFlashcard } from '../lib/services/GuestFlashcardService';
import type { FlashcardDTO } from '../types';

export type UserMode = 'authenticated' | 'guest';

export function useUserMode() {
  const [mode, setMode] = useState<UserMode>('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated using the test-auth endpoint
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/test-auth');
        if (response.ok) {
          const data = await response.json();
          setMode(data.isAuthenticated ? 'authenticated' : 'guest');
        } else {
          setMode('guest');
        }
      } catch {
        setMode('guest');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return { mode, isLoading };
}

// Hook for flashcard operations that works in both modes
export function useFlashcards() {
  const { mode } = useUserMode();
  const [flashcards, setFlashcards] = useState<(FlashcardDTO | GuestFlashcard)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 10,
  });

  const fetchFlashcards = async (search?: string, source?: 'manual' | 'ai', page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'guest') {
        const guestFlashcards = GuestFlashcardService.searchFlashcards(search || '', source);
        setFlashcards(guestFlashcards);
        // Update pagination for guest mode
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_count: guestFlashcards.length,
          per_page: guestFlashcards.length,
        });
      } else {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (source) params.append('source', source);
        params.append('page', page.toString());
        
        const response = await fetch(`/api/flashcards?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        
        const data = await response.json();
        setFlashcards(data.data || []);
        // Update pagination from API response
        setPagination({
          current_page: data.current_page || 1,
          total_pages: data.total_pages || 1,
          total_count: data.total_count || 0,
          per_page: data.per_page || 10,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async (front: string, back: string, source: 'manual' | 'ai' = 'manual') => {
    if (mode === 'guest') {
      const newFlashcard = GuestFlashcardService.createFlashcard(front, back, source);
      setFlashcards(prev => [newFlashcard, ...prev]);
      return newFlashcard;
    } else {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front, back, source }),
      });
      
      if (!response.ok) throw new Error('Failed to create flashcard');
      
      const newFlashcard = await response.json();
      setFlashcards(prev => [newFlashcard, ...prev]);
      return newFlashcard;
    }
  };

  const updateFlashcard = async (id: string, updates: { front?: string; back?: string }) => {
    if (mode === 'guest') {
      const updated = GuestFlashcardService.updateFlashcard(id, updates);
      if (updated) {
        setFlashcards(prev => prev.map(f => f.id === id ? updated : f));
      }
      return updated;
    } else {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update flashcard');
      
      const updated = await response.json();
      setFlashcards(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    }
  };

  const deleteFlashcard = async (id: string) => {
    if (mode === 'guest') {
      const success = GuestFlashcardService.deleteFlashcard(id);
      if (success) {
        setFlashcards(prev => prev.filter(f => f.id !== id));
      }
      return success;
    } else {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete flashcard');
      
      setFlashcards(prev => prev.filter(f => f.id !== id));
      return true;
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [mode]);

  return {
    flashcards,
    loading,
    error,
    mode,
    pagination,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  };
}