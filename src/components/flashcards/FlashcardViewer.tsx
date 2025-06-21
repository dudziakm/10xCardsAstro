import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { FlashcardDTO } from "../../types";

interface FlashcardViewerProps {
  flashcard?: FlashcardDTO;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBack?: () => void;
  showActions?: boolean;
}

export function FlashcardViewer({ flashcard, onEdit, onDelete, onBack, showActions = true }: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadedFlashcard, setLoadedFlashcard] = useState<FlashcardDTO | null>(flashcard || null);
  const [loading, setLoading] = useState(!flashcard);
  const [error, setError] = useState<string | null>(null);

  // Load flashcard if not provided
  useEffect(() => {
    if (!flashcard && !loadedFlashcard) {
      const flashcardId = document.querySelector("[data-flashcard-id]")?.getAttribute("data-flashcard-id");
      if (flashcardId) {
        loadFlashcard(flashcardId);
      }
    }
  }, [flashcard, loadedFlashcard]);

  const loadFlashcard = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
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
    } catch {
      setError("Nie udało się załadować fiszki");
    } finally {
      setLoading(false);
    }
  };

  const currentFlashcard = flashcard || loadedFlashcard;

  const handleEdit = () => {
    if (!currentFlashcard) return;
    if (onEdit) {
      onEdit(currentFlashcard.id);
    } else {
      window.location.href = `/flashcards/${currentFlashcard.id}/edit`;
    }
  };

  const handleDelete = async () => {
    if (!currentFlashcard) return;
    if (!confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${currentFlashcard.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete flashcard");
      }

      if (onDelete) {
        onDelete(currentFlashcard.id);
      } else {
        window.location.href = "/flashcards";
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete flashcard");
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = "/flashcards";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner text="Ładowanie fiszki..." />
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!currentFlashcard) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-800">
          <strong>Informacja:</strong> Nie udało się załadować fiszki.
        </div>
        <a href="/flashcards" className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Powrót do listy
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      {showActions && (
        <div className="flex justify-between items-center">
          <Button onClick={handleBack} variant="outline">
            ← Powrót do listy
          </Button>
          <div className="flex space-x-2">
            <Button onClick={handleEdit} variant="outline">
              Edytuj
            </Button>
            <Button onClick={handleDelete} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              Usuń
            </Button>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto">
        <div
          className="relative bg-white border-2 border-gray-200 rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105"
          style={{ minHeight: "300px" }}
          onClick={() => setIsFlipped(!isFlipped)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped(!isFlipped);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={isFlipped ? "Kliknij aby zobaczyć przód fiszki" : "Kliknij aby zobaczyć tył fiszki"}
        >
          <div className="absolute inset-0 p-6 flex flex-col">
            {/* Card side indicator */}
            <div className="flex justify-between items-center mb-4">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isFlipped ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {isFlipped ? "Tył" : "Przód"}
              </div>
              <div className="text-sm text-gray-500">Kliknij aby przewrócić</div>
            </div>

            {/* Card content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg leading-relaxed">
                  {isFlipped ? currentFlashcard.back : currentFlashcard.front}
                </div>
              </div>
            </div>

            {/* Source badge */}
            <div className="flex justify-center mt-4">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentFlashcard.source === "ai" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentFlashcard.source === "ai" ? "🤖 AI" : "✍️ Manualna"}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4">
          <p className="text-gray-600">Kliknij na fiszkę aby zobaczyć {isFlipped ? "przód" : "tył"}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Informacje o fiszce</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            <strong>Utworzona:</strong> {formatDate(currentFlashcard.created_at)}
          </div>
          {currentFlashcard.updated_at !== currentFlashcard.created_at && (
            <div>
              <strong>Ostatnia modyfikacja:</strong> {formatDate(currentFlashcard.updated_at)}
            </div>
          )}
          <div>
            <strong>Źródło:</strong> {currentFlashcard.source === "ai" ? "Wygenerowana przez AI" : "Utworzona ręcznie"}
          </div>
          <div>
            <strong>ID:</strong> {currentFlashcard.id}
          </div>
        </div>
      </div>
    </div>
  );
}
