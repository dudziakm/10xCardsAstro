import type { FlashcardDTO } from "../../types";
import { Button } from "../ui/button";

interface FlashcardCardProps {
  flashcard: FlashcardDTO;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  showActions?: boolean;
  "data-testid"?: string;
}

export function FlashcardCard({
  flashcard,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  "data-testid": testId,
}: FlashcardCardProps) {
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
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
      data-testid={testId}
    >
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
            {flashcard.updated_at !== flashcard.created_at
              ? `Edytowano: ${formatDate(flashcard.updated_at)}`
              : `Utworzono: ${formatDate(flashcard.created_at)}`}
          </span>
        </div>
      </div>

      {/* Zawartość fiszki */}
      <div className="space-y-4 mb-4 flex-1">
        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
          <div className="flex items-center mb-2">
            <span className="text-blue-600 text-sm font-semibold">📄 Przód</span>
          </div>
          <div className="text-gray-900 text-sm leading-relaxed" title={flashcard.front}>
            {truncateText(flashcard.front, 100)}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
          <div className="flex items-center mb-2">
            <span className="text-green-600 text-sm font-semibold">📝 Tył</span>
          </div>
          <div className="text-gray-800 text-sm leading-relaxed" title={flashcard.back}>
            {truncateText(flashcard.back, 150)}
          </div>
        </div>
      </div>

      {/* Akcje na dole */}
      {showActions && (
        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(flashcard.id)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
              data-testid="view-flashcard"
            >
              👁️ Podgląd
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(flashcard.id)}
              className="text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400"
              data-testid="edit-flashcard"
            >
              ✏️ Edytuj
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(flashcard.id)}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
              data-testid="delete-flashcard"
            >
              🗑️ Usuń
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
