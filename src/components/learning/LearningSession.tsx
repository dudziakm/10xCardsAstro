import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { LearningCard } from './LearningCard';
import type { 
  GetLearningSessionResponseDTO, 
  LearningSessionCardDTO,
  SessionProgressDTO
} from '../../types';

interface LearningSessionProps {
  onEnd?: () => void;
}

export function LearningSession({ onEnd }: LearningSessionProps) {
  const [currentCard, setCurrentCard] = useState<LearningSessionCardDTO | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionProgressDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    loadNextCard();
  }, []);

  const loadNextCard = async (sessionId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/learn/session', window.location.origin);
      if (sessionId) {
        url.searchParams.set('session_id', sessionId);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load learning session');
      }

      const data: GetLearningSessionResponseDTO = await response.json();
      
      setCurrentCard(data.card);
      setSessionInfo(data.session);
      
      if (!data.card) {
        setSessionEnded(true);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRateCard = async (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!currentCard || !sessionInfo) return;

    try {
      setRating(true);
      setError(null);

      const response = await fetch('/api/learn/session/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionInfo.session_id,
          flashcard_id: currentCard.id,
          rating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rate flashcard');
      }

      // Load next card after successful rating
      setTimeout(() => {
        loadNextCard(sessionInfo.session_id);
        setRating(false);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate flashcard');
      setRating(false);
    }
  };

  const handleEndSession = async () => {
    if (onEnd) {
      onEnd();
    } else {
      window.location.href = '/flashcards';
    }
  };

  const formatSessionTime = () => {
    if (!sessionInfo) return '';
    const startTime = new Date(sessionInfo.session_start);
    const now = new Date();
    const minutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));
    return `${minutes} min`;
  };

  if (loading && !currentCard) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner text="Ładowanie sesji nauki..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 mb-4">
            <strong>Błąd:</strong> {error}
          </div>
          <div className="space-x-3">
            <Button onClick={() => loadNextCard()} variant="outline">
              Spróbuj ponownie
            </Button>
            <Button onClick={handleEndSession} variant="outline">
              Zakończ sesję
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionEnded || !currentCard) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Sesja nauki zakończona!
          </h2>
          
          {sessionInfo && (
            <div className="text-green-700 mb-6 space-y-2">
              <div>Przejrzano fiszek: <strong>{sessionInfo.cards_reviewed}</strong></div>
              <div>Czas sesji: <strong>{formatSessionTime()}</strong></div>
              <div className="text-sm text-green-600">
                {sessionInfo.message || 'Wszystkie dostępne fiszki zostały przejrzane'}
              </div>
            </div>
          )}
          
          <div className="space-x-3">
            <Button onClick={() => loadNextCard()}>
              Rozpocznij nową sesję
            </Button>
            <Button onClick={handleEndSession} variant="outline">
              Powrót do fiszek
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session stats */}
      {sessionInfo && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex space-x-6">
                <div>
                  <span className="font-medium">Przejrzano:</span> {sessionInfo.cards_reviewed}
                </div>
                <div>
                  <span className="font-medium">Pozostało:</span> {sessionInfo.cards_remaining}
                </div>
                <div>
                  <span className="font-medium">Czas:</span> {formatSessionTime()}
                </div>
              </div>
              <Button onClick={handleEndSession} variant="outline" size="sm">
                Zakończ sesję
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Learning card */}
      <LearningCard 
        card={currentCard} 
        onRate={handleRateCard}
        isLoading={rating}
      />
    </div>
  );
}