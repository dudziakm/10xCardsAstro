import type { FlashcardDTO } from "../../types";
import { Button } from "../ui/button";

interface FlashcardCardProps {
  flashcard: FlashcardDTO;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  showActions?: boolean;
}

export function FlashcardCard({ flashcard, onEdit, onDelete, onView, showActions = true }: FlashcardCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header z source badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              flashcard.source === "ai" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {flashcard.source === "ai" ? "AI" : "Manual"}
          </span>
          <span className="text-xs text-gray-500">
            {flashcard.updated_at !== flashcard.created_at ? 
              `Edytowano: ${formatDate(flashcard.updated_at)}` : 
              `Utworzono: ${formatDate(flashcard.created_at)}`
            }
          </span>
        </div>
      </div>

      {/* Zawartość fiszki */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Przód:</div>
          <div className="text-gray-900" title={flashcard.front}>
            {truncateText(flashcard.front, 100)}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Tył:</div>
          <div className="text-gray-700" title={flashcard.back}>
            {truncateText(flashcard.back, 150)}
          </div>
        </div>
      </div>

      {/* Akcje na dole */}
      {showActions && (
        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(flashcard.id)}>
              Podgląd
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(flashcard.id)}>
              Edytuj
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(flashcard.id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              Usuń
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
