import React, { useState, useEffect } from 'react';
import { useFlashcards, useUserMode } from '../../hooks/useUserMode';
import { useTranslation } from '../../hooks/useTranslation';
import { GuestModeBanner } from '../GuestModeBanner';
import { FlashcardCard } from './FlashcardCard';
import { SearchBar } from './SearchBar';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';

interface UniversalFlashcardListProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onCreateNew?: () => void;
  onGenerateAI?: () => void;
}

export function UniversalFlashcardList({ 
  onEdit, 
  onDelete, 
  onView, 
  onCreateNew, 
  onGenerateAI 
}: UniversalFlashcardListProps = {}) {
  const { mode } = useUserMode();
  const { flashcards, loading, error, pagination, fetchFlashcards, deleteFlashcard } = useFlashcards();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'manual' | 'ai'>('all');
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Default navigation handlers
  const defaultHandlers = {
    onEdit: onEdit || ((id: string) => (window.location.href = `/flashcards/${id}/edit`)),
    onView: onView || ((id: string) => (window.location.href = `/flashcards/${id}`)),
    onCreateNew: onCreateNew || (() => (window.location.href = '/flashcards/new')),
    onGenerateAI: onGenerateAI || (() => (window.location.href = '/generate')),
  };

  // Check URL parameters for initial filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter');
      if (filter === 'manual' || filter === 'ai' || filter === 'all') {
        setSourceFilter(filter);
      }
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    const source = sourceFilter === 'all' ? undefined : sourceFilter;
    fetchFlashcards(query || undefined, source, 1);
  };

  const handleSourceFilter = (source: 'all' | 'manual' | 'ai') => {
    setSourceFilter(source);
    setCurrentPage(1); // Reset to first page when filtering
    const searchTerm = searchQuery || undefined;
    const sourceParam = source === 'all' ? undefined : source;
    fetchFlashcards(searchTerm, sourceParam, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const searchTerm = searchQuery || undefined;
    const sourceParam = sourceFilter === 'all' ? undefined : sourceFilter;
    fetchFlashcards(searchTerm, sourceParam, page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('flashcards.deleteConfirm'))) {
      try {
        await deleteFlashcard(id);
      } catch (err) {
        console.error('Failed to delete flashcard:', err);
        alert(t('flashcards.deleteError', { error: 'Delete failed' }));
      }
    }
  };

  // For authenticated users, use pagination metadata from API
  // For guest users, do client-side filtering since all data is local
  const filteredFlashcards = mode === 'guest' 
    ? flashcards.filter(flashcard => {
        const matchesSearch = !searchQuery || 
          flashcard.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flashcard.back.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSource = sourceFilter === 'all' || flashcard.source === sourceFilter;
        
        return matchesSearch && matchesSource;
      })
    : flashcards; // API already filtered

  const stats = {
    total: mode === 'guest' ? flashcards.length : pagination.total_count,
    manual: flashcards.filter(f => f.source === 'manual').length,
    ai: flashcards.filter(f => f.source === 'ai').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{t('common.error')} {error}</div>
        <Button onClick={() => fetchFlashcards()}>{t('common.tryAgain')}</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Guest Mode Banner */}
      {mode === 'guest' && showGuestBanner && (
        <GuestModeBanner onDismiss={() => setShowGuestBanner(false)} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="flashcards-title">
          {t('flashcards.title')}
        </h1>
        <div className="flex space-x-3">
          <Button onClick={defaultHandlers.onCreateNew} data-testid="add-flashcard-button">
            {t('flashcards.actions.add')}
          </Button>
          <Button 
            onClick={defaultHandlers.onGenerateAI} 
            variant="outline"
            data-testid="generate-ai-button"
          >
            {t('flashcards.actions.generate')}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder={t('flashcards.searchPlaceholder')}
          data-testid="flashcard-search"
        />
        
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => handleSourceFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sourceFilter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="filter-all"
          >
            {t('flashcards.filters.all')} ({stats.total})
          </button>
          <button
            onClick={() => handleSourceFilter('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sourceFilter === 'manual'
                ? 'bg-green-100 text-green-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="filter-manual"
          >
            {t('flashcards.filters.manual')} ({stats.manual})
          </button>
          <button
            onClick={() => handleSourceFilter('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sourceFilter === 'ai'
                ? 'bg-purple-100 text-purple-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="filter-ai"
          >
            {t('flashcards.filters.ai')} ({stats.ai})
          </button>
        </div>
      </div>

      {/* Results */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          {t('flashcards.results.found', { count: filteredFlashcards.length })}
          {searchQuery && <span> {t('flashcards.results.forQuery')} "{searchQuery}"</span>}
        </div>
      )}

      {/* Flashcards Grid */}
      {filteredFlashcards.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div>
              <p className="text-gray-500 mb-4">
                {t('flashcards.results.noResults')}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">{t('flashcards.results.empty')}</p>
              <Button onClick={defaultHandlers.onCreateNew}>
                {t('flashcards.results.createFirst')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFlashcards.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onEdit={() => defaultHandlers.onEdit(flashcard.id)}
              onDelete={() => handleDelete(flashcard.id)}
              onView={() => defaultHandlers.onView(flashcard.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination - only show for authenticated users with server-side pagination */}
      {mode === 'authenticated' && pagination.total_pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}