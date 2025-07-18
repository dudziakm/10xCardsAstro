import React, { useState } from "react";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import CandidateReview from "./CandidateReview";
import type { FlashcardDTO, FlashcardCandidateDTO } from "../../types";

interface GenerateFormProps {
  onGenerated?: (flashcards: FlashcardDTO[]) => void;
  onCancel?: () => void;
}

export function GenerateForm({ onGenerated, onCancel }: GenerateFormProps) {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<FlashcardCandidateDTO[] | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Proszę wprowadzić temat do wygenerowania fiszek");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          count,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się wygenerować fiszek");
      }

      const data = await response.json();

      // Store candidates for review
      setCandidates(data.candidates);
      setGenerationId(data.generation_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas generowania");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCandidates = async (generationId: string, selectedCandidates: FlashcardCandidateDTO[]) => {
    setAcceptLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generation_id: generationId,
          accepted_candidates: selectedCandidates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się zaakceptować fiszek");
      }

      const data = await response.json();

      if (onGenerated) {
        onGenerated(data.flashcards);
      } else {
        window.location.href = "/flashcards";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas akceptowania fiszek");
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleCancelReview = () => {
    setCandidates(null);
    setGenerationId(null);
    setError(null);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/flashcards";
    }
  };

  // Show candidate review if we have candidates
  if (candidates && generationId) {
    return (
      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Błąd:</strong> {error}
            </div>
          </div>
        )}
        <CandidateReview
          candidates={candidates}
          generationId={generationId}
          onAccept={handleAcceptCandidates}
          onCancel={handleCancelReview}
          isLoading={acceptLoading}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Błąd:</strong> {error}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-blue-800">
          <strong>🤖 Generowanie AI:</strong> Podaj temat, a AI wygeneruje dla Ciebie fiszki do nauki.
        </div>
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2" data-testid="prompt-label">
          Temat do nauki *
        </label>
        <textarea
          id="prompt"
          data-testid="prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Np. podstawy programowania w JavaScript, historia Polski w XX wieku, wzory matematyczne..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
          disabled={loading}
        />
        <div className="mt-1 text-sm text-gray-500">
          Opisz szczegółowo czego chcesz się nauczyć. Im bardziej konkretny opis, tym lepsze fiszki.
        </div>
      </div>

      <div>
        <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-2" data-testid="count-label">
          Liczba fiszek do wygenerowania
        </label>
        <select
          id="count"
          data-testid="count-select"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value={3}>3 fiszki</option>
          <option value={5}>5 fiszek</option>
          <option value={10}>10 fiszek</option>
          <option value={15}>15 fiszek</option>
          <option value={20}>20 fiszek</option>
        </select>
        <div className="mt-1 text-sm text-gray-500">
          Rekomendujemy zacząć od mniejszej liczby, aby sprawdzić jakość generowanych fiszek.
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="flex-1 sm:flex-none"
          data-testid="generate-button"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" color="white" />
              <span>Generuję fiszki...</span>
            </div>
          ) : (
            `Wygeneruj ${count} fiszek`
          )}
        </Button>

        <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} data-testid="cancel-button">
          Anuluj
        </Button>
      </div>

      <div className="text-sm text-gray-500">* Pola wymagane</div>

      {loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            <strong>Generowanie w toku...</strong> To może potrwać kilka sekund. Proszę czekać.
          </div>
        </div>
      )}
    </form>
  );
}
