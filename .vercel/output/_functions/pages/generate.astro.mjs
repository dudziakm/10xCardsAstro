import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_1--A5kBA.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BS3VogJm.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { B as Button } from '../chunks/button_tbmfKED-.mjs';
import { L as LoadingSpinner } from '../chunks/LoadingSpinner_Bmtnd6YC.mjs';
export { renderers } from '../renderers.mjs';

function CandidateReview({
  candidates,
  generationId,
  onAccept,
  onCancel,
  isLoading = false
}) {
  const [selectedCandidates, setSelectedCandidates] = useState(/* @__PURE__ */ new Set());
  const toggleCandidate = (index) => {
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
    setSelectedCandidates(/* @__PURE__ */ new Set());
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
  return /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto p-6", "data-testid": "generated-flashcards", children: /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm rounded-lg border border-gray-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Przejrzyj wygenerowane fiszki" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
        "Wybierz fiszki, które chcesz dodać do swojej kolekcji (",
        selectedCount,
        "/",
        totalCount,
        " wybrane)"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200 bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: selectAll,
          "data-testid": "select-all-button",
          className: "text-sm text-blue-600 hover:text-blue-700 font-medium",
          disabled: isLoading,
          children: "Zaznacz wszystkie"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: selectNone,
          "data-testid": "select-none-button",
          className: "text-sm text-gray-600 hover:text-gray-700 font-medium",
          disabled: isLoading,
          children: "Odznacz wszystkie"
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 ml-auto", children: [
        selectedCount,
        " z ",
        totalCount,
        " fiszek wybranych"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200", children: candidates.map((candidate, index) => /* @__PURE__ */ jsx(
      "div",
      {
        "data-testid": `candidate-card-${index}`,
        className: `p-6 cursor-pointer transition-colors ${selectedCandidates.has(index) ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"}`,
        onClick: () => !isLoading && toggleCandidate(index),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isLoading) toggleCandidate(index);
          }
        },
        role: "button",
        tabIndex: 0,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              "data-testid": `candidate-checkbox-${index}`,
              checked: selectedCandidates.has(index),
              onChange: () => toggleCandidate(index),
              className: "mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Przód fiszki" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 bg-white p-3 rounded border", children: candidate.front })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Tył fiszki" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 bg-white p-3 rounded border", children: candidate.back })
              ] })
            ] }),
            candidate.difficulty && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: [
              "Trudność: ",
              candidate.difficulty,
              "/5"
            ] }) })
          ] })
        ] })
      },
      index
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: selectedCount > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        "Dodasz ",
        selectedCount,
        " ",
        selectedCount === 1 ? "fiszkę" : "fiszek",
        " do swojej kolekcji"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onCancel,
            disabled: isLoading,
            "data-testid": "cancel-review-button",
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50",
            children: "Anuluj"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleAccept,
            disabled: isLoading || selectedCount === 0,
            "data-testid": "accept-candidates-button",
            className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
            children: isLoading ? "Dodawanie..." : `Dodaj wybrane (${selectedCount})`
          }
        )
      ] })
    ] })
  ] }) });
}

function GenerateForm({ onGenerated, onCancel }) {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Proszę wprowadzić temat do wygenerowania fiszek");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          count
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się wygenerować fiszek");
      }
      const data = await response.json();
      setCandidates(data.candidates);
      setGenerationId(data.generation_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas generowania");
    } finally {
      setLoading(false);
    }
  };
  const handleAcceptCandidates = async (generationId2, selectedCandidates) => {
    setAcceptLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/flashcards/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          generation_id: generationId2,
          accepted_candidates: selectedCandidates
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się zaakceptować fiszek");
      }
      const data = await response.json();
      if (onGenerated) {
        onGenerated(data.flashcards);
      } else {
        window.location.href = "/flashcards";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas akceptowania fiszek");
    } finally {
      setAcceptLoading(false);
    }
  };
  const handleCancelReview = () => {
    setCandidates(null);
    setGenerationId(null);
    setError(null);
  };
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/flashcards";
    }
  };
  if (candidates && generationId) {
    return /* @__PURE__ */ jsxs("div", { children: [
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "text-red-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Błąd:" }),
        " ",
        error
      ] }) }),
      /* @__PURE__ */ jsx(
        CandidateReview,
        {
          candidates,
          generationId,
          onAccept: handleAcceptCandidates,
          onCancel: handleCancelReview,
          isLoading: acceptLoading
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-red-800", children: [
      /* @__PURE__ */ jsx("strong", { children: "Błąd:" }),
      " ",
      error
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-blue-800", children: [
      /* @__PURE__ */ jsx("strong", { children: "🤖 Generowanie AI:" }),
      " Podaj temat, a AI wygeneruje dla Ciebie fiszki do nauki."
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "prompt", className: "block text-sm font-medium text-gray-700 mb-2", "data-testid": "prompt-label", children: "Temat do nauki *" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "prompt",
          "data-testid": "prompt-textarea",
          value: prompt,
          onChange: (e) => setPrompt(e.target.value),
          placeholder: "Np. podstawy programowania w JavaScript, historia Polski w XX wieku, wzory matematyczne...",
          required: true,
          className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y",
          disabled: loading
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-gray-500", children: "Opisz szczegółowo czego chcesz się nauczyć. Im bardziej konkretny opis, tym lepsze fiszki." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "count", className: "block text-sm font-medium text-gray-700 mb-2", "data-testid": "count-label", children: "Liczba fiszek do wygenerowania" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          id: "count",
          "data-testid": "count-select",
          value: count,
          onChange: (e) => setCount(parseInt(e.target.value)),
          className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled: loading,
          children: [
            /* @__PURE__ */ jsx("option", { value: 3, children: "3 fiszki" }),
            /* @__PURE__ */ jsx("option", { value: 5, children: "5 fiszek" }),
            /* @__PURE__ */ jsx("option", { value: 10, children: "10 fiszek" }),
            /* @__PURE__ */ jsx("option", { value: 15, children: "15 fiszek" }),
            /* @__PURE__ */ jsx("option", { value: 20, children: "20 fiszek" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-gray-500", children: "Rekomendujemy zacząć od mniejszej liczby, aby sprawdzić jakość generowanych fiszek." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex space-x-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: loading || !prompt.trim(),
          className: "flex-1 sm:flex-none",
          "data-testid": "generate-button",
          children: loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(LoadingSpinner, { size: "sm", color: "white" }),
            /* @__PURE__ */ jsx("span", { children: "Generuję fiszki..." })
          ] }) : `Wygeneruj ${count} fiszek`
        }
      ),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: handleCancel, disabled: loading, "data-testid": "cancel-button", children: "Anuluj" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "* Pola wymagane" }),
    loading && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-yellow-800", children: [
      /* @__PURE__ */ jsx("strong", { children: "Generowanie w toku..." }),
      " To może potrwać kilka sekund. Proszę czekać."
    ] }) })
  ] });
}

const $$Generate = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Generuj fiszki AI" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <div class="max-w-2xl mx-auto"> <div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900 mb-2" data-testid="generate-page-title">Generuj fiszki AI</h1> <p class="text-gray-600" data-testid="generate-page-subtitle">
Pozwól sztucznej inteligencji utworzyć dla Ciebie fiszki do nauki
</p> </div> <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"> ${renderComponent($$result2, "GenerateForm", GenerateForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/ai/GenerateForm", "client:component-export": "GenerateForm" })} </div> <div class="mt-6 bg-gray-50 rounded-lg p-4"> <h3 class="font-semibold text-gray-900 mb-2">💡 Wskazówki</h3> <ul class="text-sm text-gray-600 space-y-1"> <li>• Bądź konkretny w opisie tematu - im więcej szczegółów, tym lepsze fiszki</li> <li>• Możesz określić poziom trudności (podstawowy, średnio zaawansowany, zaawansowany)</li> <li>• Przykłady dobrych promptów:</li> <li class="ml-4">- "Podstawy JavaScript: zmienne, funkcje, pętle i warunki"</li> <li class="ml-4">- "Historia Polski 1918-1939: wydarzenia polityczne i społeczne"</li> <li class="ml-4">- "Matematyka: wzory na pole i obwód figur geometrycznych"</li> </ul> </div> </div> </div> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/generate.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/generate.astro";
const $$url = "/generate";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Generate,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
