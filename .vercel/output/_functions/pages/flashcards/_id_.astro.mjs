import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BNVo9Nwc.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_DtnxgX_q.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { B as Button } from '../../chunks/button_tbmfKED-.mjs';
import { L as LoadingSpinner } from '../../chunks/LoadingSpinner_Bmtnd6YC.mjs';
export { renderers } from '../../renderers.mjs';

function FlashcardViewer({
  flashcard,
  flashcardId,
  onEdit,
  onDelete,
  onBack,
  showActions = true
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadedFlashcard, setLoadedFlashcard] = useState(flashcard || null);
  const [loading, setLoading] = useState(!flashcard);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!flashcard && !loadedFlashcard && flashcardId) {
      loadFlashcard(flashcardId);
    }
  }, [flashcard, loadedFlashcard, flashcardId]);
  const loadFlashcard = async (id) => {
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
        method: "DELETE"
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
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-8", children: /* @__PURE__ */ jsx(LoadingSpinner, { text: "Ładowanie fiszki..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-red-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Błąd:" }),
        " ",
        error
      ] }),
      error === "Fiszka nie została znaleziona" && /* @__PURE__ */ jsx(
        "a",
        {
          href: "/flashcards",
          className: "mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded",
          children: "Powrót do listy"
        }
      )
    ] });
  }
  if (!currentFlashcard) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-yellow-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Informacja:" }),
        " Nie udało się załadować fiszki."
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/flashcards", className: "mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded", children: "Powrót do listy" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    showActions && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx(Button, { onClick: handleBack, variant: "outline", children: "← Powrót do listy" }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsx(Button, { onClick: handleEdit, variant: "outline", children: "Edytuj" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleDelete, variant: "outline", className: "text-red-600 border-red-600 hover:bg-red-50", children: "Usuń" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "relative bg-white border-2 border-gray-200 rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105",
          style: { minHeight: "300px" },
          onClick: () => setIsFlipped(!isFlipped),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped(!isFlipped);
            }
          },
          role: "button",
          tabIndex: 0,
          "aria-label": isFlipped ? "Kliknij aby zobaczyć przód fiszki" : "Kliknij aby zobaczyć tył fiszki",
          children: /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 p-6 flex flex-col", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `px-3 py-1 rounded-full text-sm font-medium ${isFlipped ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`,
                  children: isFlipped ? "Tył" : "Przód"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Kliknij aby przewrócić" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("div", { className: "text-lg leading-relaxed", children: isFlipped ? currentFlashcard.back : currentFlashcard.front }) }) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-4", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `px-3 py-1 rounded-full text-xs font-medium ${currentFlashcard.source === "ai" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`,
                children: currentFlashcard.source === "ai" ? "🤖 AI" : "✍️ Manualna"
              }
            ) })
          ] })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
        "Kliknij na fiszkę aby zobaczyć ",
        isFlipped ? "przód" : "tył"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto bg-gray-50 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Informacje o fiszce" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Utworzona:" }),
          " ",
          formatDate(currentFlashcard.created_at)
        ] }),
        currentFlashcard.updated_at !== currentFlashcard.created_at && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Ostatnia modyfikacja:" }),
          " ",
          formatDate(currentFlashcard.updated_at)
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Źródło:" }),
          " ",
          currentFlashcard.source === "ai" ? "Wygenerowana przez AI" : "Utworzona ręcznie"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "ID:" }),
          " ",
          currentFlashcard.id
        ] })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro("https://10x-cards-astro.vercel.app");
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/flashcards");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Szczeg\xF3\u0142y fiszki" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> ${renderComponent($$result2, "FlashcardViewer", FlashcardViewer, { "client:load": true, "flashcardId": id, "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/flashcards/FlashcardViewer", "client:component-export": "FlashcardViewer" })} </div> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/flashcards/[id].astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/flashcards/[id].astro";
const $$url = "/flashcards/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
