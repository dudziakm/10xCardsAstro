import { useState, useEffect, useCallback } from "react";
import type { FlashcardDTO, FlashcardListResponseDTO, PaginationDTO } from "../../types";
import { FlashcardCard } from "./FlashcardCard";
import { Button } from "../ui/button";
import { SearchBar } from "./SearchBar";
import { Pagination } from "../ui/Pagination";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface FlashcardListProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onCreateNew?: () => void;
  onGenerateAI?: () => void;
}

export function FlashcardList({ onEdit, onDelete, onView, onCreateNew, onGenerateAI }: FlashcardListProps = {}) {
  // Default navigation handlers
  const defaultHandlers = {
    onEdit: onEdit || ((id: string) => (window.location.href = `/flashcards/${id}/edit`)),
    onView: onView || ((id: string) => (window.location.href = `/flashcards/${id}`)),
    onCreateNew: onCreateNew || (() => (window.location.href = "/flashcards/new")),
    onGenerateAI: onGenerateAI || (() => (window.location.href = "/generate")),
  };
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationDTO>({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "ai">(() => {
    // Check URL parameters for initial filter
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get("filter");
      if (filter === "manual" || filter === "ai" || filter === "all") {
        return filter;
      }
    }
    return "all";
  });

  const fetchFlashcards = useCallback(
    async (page = 1, search = searchQuery, source = sourceFilter) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          sort: "updated_at",
          order: "desc",
        });

        if (search.trim()) {
          params.append("search", search.trim());
        }

        if (source !== "all") {
          params.append("source", source);
        }

        const response = await fetch(`/api/flashcards?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch flashcards");
        }

        const data: FlashcardListResponseDTO = await response.json();
        setFlashcards(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, sourceFilter]
  );

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchFlashcards(1, query, sourceFilter);
  };

  const handleSourceFilter = (source: "all" | "manual" | "ai") => {
    setSourceFilter(source);
    fetchFlashcards(1, searchQuery, source);
  };

  const handlePageChange = (page: number) => {
    fetchFlashcards(page, searchQuery, sourceFilter);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete flashcard");
      }

      // Refresh the list
      fetchFlashcards(pagination.current_page, searchQuery, sourceFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete flashcard");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <strong>Błąd:</strong> {error}
        </div>
        <Button onClick={() => fetchFlashcards()} className="mt-2" variant="outline">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="flashcards-list">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Moje fiszki</h2>
        <div className="flex space-x-3">
          <Button onClick={defaultHandlers.onCreateNew} data-testid="create-flashcard">
            Dodaj fiszkę
          </Button>
          <Button onClick={defaultHandlers.onGenerateAI} variant="outline" data-testid="generate-ai-button">
            Generuj AI
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={handleSearch}
            placeholder="Szukaj w fiszkach..."
            data-testid="search-bar"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={sourceFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceFilter("all")}
            data-testid="filter-all"
          >
            Wszystkie
          </Button>
          <Button
            variant={sourceFilter === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceFilter("manual")}
            data-testid="filter-manual"
          >
            Manualne
          </Button>
          <Button
            variant={sourceFilter === "ai" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceFilter("ai")}
            data-testid="filter-ai"
          >
            AI
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Znaleziono {pagination.total_items} fiszek
        {searchQuery && ` dla zapytania "${searchQuery}"`}
        {sourceFilter !== "all" && ` (${sourceFilter})`}
      </div>

      {/* Flashcards grid */}
      {flashcards.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-gray-500 mb-4">
            {searchQuery || sourceFilter !== "all"
              ? "Nie znaleziono fiszek pasujących do kryteriów wyszukiwania."
              : "Nie masz jeszcze żadnych fiszek."}
          </div>
          {!searchQuery && sourceFilter === "all" && (
            <Button onClick={defaultHandlers.onCreateNew} data-testid="create-first-flashcard">
              Utwórz swoją pierwszą fiszkę
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onEdit={defaultHandlers.onEdit}
              onDelete={onDelete || handleDelete}
              onView={defaultHandlers.onView}
              data-testid="flashcard-item"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
