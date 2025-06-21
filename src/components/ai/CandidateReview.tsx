import { useState } from "react";
import type { FlashcardCandidateDTO } from "../../types";

interface CandidateReviewProps {
  candidates: FlashcardCandidateDTO[];
  generationId: string;
  onAccept: (generationId: string, selectedCandidates: FlashcardCandidateDTO[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CandidateReview({
  candidates,
  generationId,
  onAccept,
  onCancel,
  isLoading = false,
}: CandidateReviewProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());

  const toggleCandidate = (index: number) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCandidates(newSelected);
  };

  const selectAll = () => {
    setSelectedCandidates(new Set(candidates.map((_, index) => index)));
  };

  const selectNone = () => {
    setSelectedCandidates(new Set());
  };

  const handleAccept = async () => {
    const selected = candidates.filter((_, index) => selectedCandidates.has(index));
    if (selected.length === 0) {
      alert("Musisz wybrać co najmniej jedną fiszkę");
      return;
    }
    await onAccept(generationId, selected);
  };

  const selectedCount = selectedCandidates.size;
  const totalCount = candidates.length;

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid="generated-flashcards">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Przejrzyj wygenerowane fiszki</h2>
          <p className="text-sm text-gray-600 mt-1">
            Wybierz fiszki, które chcesz dodać do swojej kolekcji ({selectedCount}/{totalCount} wybrane)
          </p>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <button
              onClick={selectAll}
              data-testid="select-all-button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Zaznacz wszystkie
            </button>
            <button
              onClick={selectNone}
              data-testid="select-none-button"
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              disabled={isLoading}
            >
              Odznacz wszystkie
            </button>
            <span className="text-sm text-gray-500 ml-auto">
              {selectedCount} z {totalCount} fiszek wybranych
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {candidates.map((candidate, index) => (
            <div
              key={index}
              data-testid={`candidate-card-${index}`}
              className={`p-6 cursor-pointer transition-colors ${
                selectedCandidates.has(index) ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"
              }`}
              onClick={() => !isLoading && toggleCandidate(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isLoading) toggleCandidate(index);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  data-testid={`candidate-checkbox-${index}`}
                  checked={selectedCandidates.has(index)}
                  onChange={() => toggleCandidate(index)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Przód fiszki</h3>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border">{candidate.front}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Tył fiszki</h3>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border">{candidate.back}</p>
                    </div>
                  </div>
                  {candidate.difficulty && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Trudność: {candidate.difficulty}/5
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedCount > 0 && (
              <>
                Dodasz {selectedCount} {selectedCount === 1 ? "fiszkę" : "fiszek"} do swojej kolekcji
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              data-testid="cancel-review-button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleAccept}
              disabled={isLoading || selectedCount === 0}
              data-testid="accept-candidates-button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Dodawanie..." : `Dodaj wybrane (${selectedCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
