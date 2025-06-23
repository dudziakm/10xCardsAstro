import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_1--A5kBA.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BS3VogJm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import React, { useState, useCallback, useEffect } from 'react';
import { B as Button } from '../chunks/button_tbmfKED-.mjs';
import { L as LoadingSpinner } from '../chunks/LoadingSpinner_Bmtnd6YC.mjs';
export { renderers } from '../renderers.mjs';

function FlashcardCard({
  flashcard,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  "data-testid": testId
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full",
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `px-2 py-1 rounded-full text-xs font-medium ${flashcard.source === "ai" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`,
              children: flashcard.source === "ai" ? "AI" : "Manual"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: flashcard.updated_at !== flashcard.created_at ? `Edytowano: ${formatDate(flashcard.updated_at)}` : `Utworzono: ${formatDate(flashcard.created_at)}` })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-4 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-blue-600 text-sm font-semibold", children: "📄 Przód" }) }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-900 text-sm leading-relaxed", title: flashcard.front, children: truncateText(flashcard.front, 100) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-lg p-3 border-l-4 border-green-400", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-green-600 text-sm font-semibold", children: "📝 Tył" }) }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-800 text-sm leading-relaxed", title: flashcard.back, children: truncateText(flashcard.back, 150) })
          ] })
        ] }),
        showActions && /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 pt-3 border-t border-gray-100", children: [
          onView && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => onView(flashcard.id),
              className: "text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400",
              "data-testid": "view-flashcard",
              children: "👁️ Podgląd"
            }
          ),
          onEdit && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => onEdit(flashcard.id),
              className: "text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400",
              "data-testid": "edit-flashcard",
              children: "✏️ Edytuj"
            }
          ),
          onDelete && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => onDelete(flashcard.id),
              className: "text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400",
              "data-testid": "delete-flashcard",
              children: "🗑️ Usuń"
            }
          )
        ] })
      ]
    }
  );
}

function SearchBar({
  value,
  onSearch,
  placeholder = "Szukaj...",
  className = "",
  "data-testid": testId
}) {
  const [inputValue, setInputValue] = useState(value);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue);
  };
  const handleClear = () => {
    setInputValue("");
    onSearch("");
  };
  return /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: `relative ${className}`, "data-testid": testId, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      }
    ) }) }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: inputValue,
        onChange: (e) => setInputValue(e.target.value),
        placeholder,
        className: "block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        "data-testid": "search-input"
      }
    ),
    inputValue && /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: handleClear,
        className: "text-gray-400 hover:text-gray-600 focus:outline-none",
        children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
      }
    ) })
  ] }) });
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showSummary = true,
  className = ""
}) {
  if (totalPages <= 1) return null;
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }
    rangeWithDots.push(...range);
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    return rangeWithDots;
  };
  const visiblePages = getVisiblePages();
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between ${className}`, children: [
    showSummary && /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700", children: [
      "Strona ",
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: currentPage }),
      " z ",
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: totalPages })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => onPageChange(currentPage - 1), disabled: currentPage <= 1, children: "Poprzednia" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1", children: visiblePages.map((page, index) => /* @__PURE__ */ jsx(React.Fragment, { children: page === "..." ? /* @__PURE__ */ jsx("span", { className: "px-3 py-2 text-gray-500", children: "..." }) : /* @__PURE__ */ jsx(
        Button,
        {
          variant: page === currentPage ? "default" : "outline",
          size: "sm",
          onClick: () => onPageChange(page),
          className: "min-w-[2.5rem]",
          children: page
        }
      ) }, index)) }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => onPageChange(currentPage + 1),
          disabled: currentPage >= totalPages,
          children: "Następna"
        }
      )
    ] })
  ] });
}

function FlashcardList({ onEdit, onDelete, onView, onCreateNew, onGenerateAI } = {}) {
  const defaultHandlers = {
    onEdit: onEdit || ((id) => window.location.href = `/flashcards/${id}/edit`),
    onView: onView || ((id) => window.location.href = `/flashcards/${id}`),
    onCreateNew: onCreateNew || (() => window.location.href = "/flashcards/new"),
    onGenerateAI: onGenerateAI || (() => window.location.href = "/generate")
  };
  const [flashcards, setFlashcards] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState(() => {
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
          order: "desc"
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
        const data = await response.json();
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
  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchFlashcards(1, query, sourceFilter);
  };
  const handleSourceFilter = (source) => {
    setSourceFilter(source);
    fetchFlashcards(1, searchQuery, source);
  };
  const handlePageChange = (page) => {
    fetchFlashcards(page, searchQuery, sourceFilter);
  };
  const handleDelete = async (id) => {
    if (!confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete flashcard");
      }
      fetchFlashcards(pagination.current_page, searchQuery, sourceFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete flashcard");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-8", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-red-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Błąd:" }),
        " ",
        error
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => fetchFlashcards(), className: "mt-2", variant: "outline", children: "Spróbuj ponownie" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", "data-testid": "flashcards-list", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Moje fiszki" }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-3", children: [
        /* @__PURE__ */ jsx(Button, { onClick: defaultHandlers.onCreateNew, "data-testid": "create-flashcard", children: "Dodaj fiszkę" }),
        /* @__PURE__ */ jsx(Button, { onClick: defaultHandlers.onGenerateAI, variant: "outline", "data-testid": "generate-ai-button", children: "Generuj AI" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
        SearchBar,
        {
          value: searchQuery,
          onSearch: handleSearch,
          placeholder: "Szukaj w fiszkach...",
          "data-testid": "search-bar"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: sourceFilter === "all" ? "default" : "outline",
            size: "sm",
            onClick: () => handleSourceFilter("all"),
            "data-testid": "filter-all",
            children: "Wszystkie"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: sourceFilter === "manual" ? "default" : "outline",
            size: "sm",
            onClick: () => handleSourceFilter("manual"),
            "data-testid": "filter-manual",
            children: "Manualne"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: sourceFilter === "ai" ? "default" : "outline",
            size: "sm",
            onClick: () => handleSourceFilter("ai"),
            "data-testid": "filter-ai",
            children: "AI"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
      "Znaleziono ",
      pagination.total_items,
      " fiszek",
      searchQuery && ` dla zapytania "${searchQuery}"`,
      sourceFilter !== "all" && ` (${sourceFilter})`
    ] }),
    flashcards.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", "data-testid": "empty-state", children: [
      /* @__PURE__ */ jsx("div", { className: "text-gray-500 mb-4", children: searchQuery || sourceFilter !== "all" ? "Nie znaleziono fiszek pasujących do kryteriów wyszukiwania." : "Nie masz jeszcze żadnych fiszek." }),
      !searchQuery && sourceFilter === "all" && /* @__PURE__ */ jsx(Button, { onClick: defaultHandlers.onCreateNew, "data-testid": "create-first-flashcard", children: "Utwórz swoją pierwszą fiszkę" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: flashcards.map((flashcard) => /* @__PURE__ */ jsx(
      FlashcardCard,
      {
        flashcard,
        onEdit: defaultHandlers.onEdit,
        onDelete: onDelete || handleDelete,
        onView: defaultHandlers.onView,
        "data-testid": "flashcard-item"
      },
      flashcard.id
    )) }),
    pagination.total_pages > 1 && /* @__PURE__ */ jsx(
      Pagination,
      {
        currentPage: pagination.current_page,
        totalPages: pagination.total_pages,
        onPageChange: handlePageChange
      }
    )
  ] });
}

const $$Flashcards = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Moje fiszki" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> ${renderComponent($$result2, "FlashcardList", FlashcardList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/flashcards/FlashcardList", "client:component-export": "FlashcardList" })} </div> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/flashcards.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/flashcards.astro";
const $$url = "/flashcards";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Flashcards,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
