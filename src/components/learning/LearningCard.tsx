import { useState } from "react";
import { Button } from "../ui/button";
import type { LearningSessionCardDTO } from "../../types";

interface LearningCardProps {
  card: LearningSessionCardDTO;
  onRate: (rating: 1 | 2 | 3 | 4 | 5) => void;
  isLoading?: boolean;
}

export function LearningCard({ card, onRate, isLoading = false }: LearningCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleRate = (rating: 1 | 2 | 3 | 4 | 5) => {
    setHasRated(true);
    onRate(rating);
  };

  const handleFlip = () => {
    if (!hasRated) {
      setIsFlipped(true);
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: "Nie pamiętam",
      2: "Słabo",
      3: "Przeciętnie",
      4: "Dobrze",
      5: "Bardzo dobrze",
    };
    return labels[rating as keyof typeof labels];
  };

  const getRatingColor = (rating: number) => {
    const colors = {
      1: "bg-red-500 hover:bg-red-600",
      2: "bg-orange-500 hover:bg-orange-600",
      3: "bg-yellow-500 hover:bg-yellow-600",
      4: "bg-green-500 hover:bg-green-600",
      5: "bg-emerald-500 hover:bg-emerald-600",
    };
    return colors[rating as keyof typeof colors];
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card */}
      <div
        className={`relative bg-white border-2 border-gray-200 rounded-xl shadow-lg transition-all duration-300 ${
          !isFlipped && !hasRated ? "cursor-pointer hover:scale-105" : ""
        }`}
        style={{ minHeight: "400px" }}
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (!isFlipped && !hasRated && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleFlip();
          }
        }}
        role={!isFlipped && !hasRated ? "button" : undefined}
        tabIndex={!isFlipped && !hasRated ? 0 : undefined}
        aria-label={!isFlipped && !hasRated ? "Kliknij aby zobaczyć odpowiedź" : undefined}
      >
        <div className="absolute inset-0 p-8 flex flex-col">
          {/* Card header */}
          <div className="flex justify-between items-center mb-6">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isFlipped ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {isFlipped ? "Odpowiedź" : "Pytanie"}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              {card.review_count > 0 && <div>Przeglądy: {card.review_count}</div>}
              {card.last_reviewed && <div>Ostatnio: {new Date(card.last_reviewed).toLocaleDateString("pl-PL")}</div>}
              <div>Trudność: {card.difficulty_rating.toFixed(1)}/5.0</div>
            </div>
          </div>

          {/* Card content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl leading-relaxed mb-4">{isFlipped ? card.back : card.front}</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mt-6">
            {!isFlipped && !hasRated && <p className="text-gray-600">Kliknij aby zobaczyć odpowiedź</p>}
            {isFlipped && !hasRated && <p className="text-gray-600">Oceń jak dobrze pamiętałeś odpowiedź</p>}
            {hasRated && <p className="text-green-600 font-medium">✓ Oceniono! Ładowanie następnej fiszki...</p>}
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {isFlipped && !hasRated && (
        <div className="mt-6 space-y-4">
          <div className="text-center text-gray-700 font-medium">Jak dobrze pamiętałeś odpowiedź?</div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                onClick={() => handleRate(rating as 1 | 2 | 3 | 4 | 5)}
                disabled={isLoading}
                className={`${getRatingColor(rating)} text-white border-0 py-4 px-3 text-sm h-auto min-h-[60px] flex flex-col items-center justify-center`}
              >
                <div className="font-bold text-lg leading-tight">{rating}</div>
                <div className="text-xs leading-tight mt-1 whitespace-normal text-center">{getRatingLabel(rating)}</div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>1 = Następny przegląd za 1 dzień</div>
            <div>2 = za 2 dni | 3 = za 4 dni | 4 = za 7 dni | 5 = za 14 dni</div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Zapisywanie oceny...</span>
          </div>
        </div>
      )}
    </div>
  );
}
