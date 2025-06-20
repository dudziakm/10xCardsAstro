import React, { useState } from "react";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { FlashcardDTO } from "../../types";

interface FlashcardFormProps {
  flashcard?: FlashcardDTO;
  onSave?: (flashcard: FlashcardDTO) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

interface FormData {
  front: string;
  back: string;
}

export function FlashcardForm({ flashcard, onSave, onCancel, mode = "create" }: FlashcardFormProps) {
  // Load flashcard data if in edit mode and no flashcard provided
  const [loadedFlashcard, setLoadedFlashcard] = useState<FlashcardDTO | null>(flashcard || null);
  const [initialLoading, setInitialLoading] = useState(mode === "edit" && !flashcard);
  const [formData, setFormData] = useState<FormData>({
    front: (flashcard || loadedFlashcard)?.front || "",
    back: (flashcard || loadedFlashcard)?.back || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load flashcard for edit mode
  React.useEffect(() => {
    if (mode === "edit" && !flashcard && !loadedFlashcard) {
      const flashcardId = document.querySelector("[data-flashcard-id]")?.getAttribute("data-flashcard-id");
      if (flashcardId) {
        loadFlashcard(flashcardId);
      }
    }
  }, [mode, flashcard, loadedFlashcard]);

  const loadFlashcard = async (id: string) => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/flashcards/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Fiszka nie została znaleziona");
          return;
        }
        throw new Error("Failed to load flashcard");
      }

      const flashcardData = await response.json();
      setLoadedFlashcard(flashcardData);
      setFormData({
        front: flashcardData.front,
        back: flashcardData.back,
      });
    } catch (err) {
      setError("Nie udało się załadować fiszki");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.front.trim() || !formData.back.trim()) {
      setError("Proszę wypełnić oba pola");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      if (mode === "edit" && (flashcard || loadedFlashcard)) {
        const currentFlashcard = flashcard || loadedFlashcard!;
        response = await fetch(`/api/flashcards/${currentFlashcard.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się zapisać fiszki");
      }

      const savedFlashcard = await response.json();

      if (onSave) {
        onSave(savedFlashcard);
      } else {
        window.location.href = "/flashcards";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/flashcards";
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner text="Ładowanie fiszki..." />
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
          {error === "Fiszka nie została znaleziona" && (
            <a
              href="/flashcards"
              className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Powrót do listy
            </a>
          )}
        </div>
      )}

      <div>
        <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
          Przód fiszki *
        </label>
        <textarea
          id="front"
          value={formData.front}
          onChange={(e) => setFormData((prev) => ({ ...prev, front: e.target.value }))}
          placeholder="Wprowadź pytanie lub pojęcie..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
          Tył fiszki *
        </label>
        <textarea
          id="back"
          value={formData.back}
          onChange={(e) => setFormData((prev) => ({ ...prev, back: e.target.value }))}
          placeholder="Wprowadź odpowiedź lub wyjaśnienie..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
          disabled={loading}
        />
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={loading || !formData.front.trim() || !formData.back.trim()}
          className="flex-1 sm:flex-none"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" color="white" />
              <span>Zapisywanie...</span>
            </div>
          ) : mode === "edit" ? (
            "Zaktualizuj fiszkę"
          ) : (
            "Utwórz fiszkę"
          )}
        </Button>

        <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
          Anuluj
        </Button>
      </div>

      <div className="text-sm text-gray-500">* Pola wymagane</div>
    </form>
  );
}
