import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BNVo9Nwc.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DtnxgX_q.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { B as Button } from '../chunks/button_tbmfKED-.mjs';
import { L as LoadingSpinner } from '../chunks/LoadingSpinner_Bmtnd6YC.mjs';
export { renderers } from '../renderers.mjs';

function LearningCard({ card, onRate, isLoading = false }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  useEffect(() => {
    setIsFlipped(false);
    setHasRated(false);
  }, [card.id]);
  const handleRate = (rating) => {
    setHasRated(true);
    onRate(rating);
  };
  const handleFlip = () => {
    if (!hasRated) {
      setIsFlipped(true);
    }
  };
  const getRatingLabel = (rating) => {
    const labels = {
      1: "Nie pamiętam",
      2: "Słabo",
      3: "Przeciętnie",
      4: "Dobrze",
      5: "Bardzo dobrze"
    };
    return labels[rating];
  };
  const getRatingColor = (rating) => {
    const colors = {
      1: "bg-red-500 hover:bg-red-600",
      2: "bg-orange-500 hover:bg-orange-600",
      3: "bg-yellow-500 hover:bg-yellow-600",
      4: "bg-green-500 hover:bg-green-600",
      5: "bg-emerald-500 hover:bg-emerald-600"
    };
    return colors[rating];
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `relative bg-white border-2 border-gray-200 rounded-xl shadow-lg transition-all duration-300 ${!isFlipped && !hasRated ? "cursor-pointer hover:scale-105" : ""}`,
        style: { minHeight: "400px" },
        onClick: handleFlip,
        "data-testid": "learning-card",
        onKeyDown: (e) => {
          if (!isFlipped && !hasRated && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleFlip();
          }
        },
        role: !isFlipped && !hasRated ? "button" : void 0,
        tabIndex: !isFlipped && !hasRated ? 0 : void 0,
        "aria-label": !isFlipped && !hasRated ? "Kliknij aby zobaczyć odpowiedź" : void 0,
        children: /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 p-8 flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `px-4 py-2 rounded-full text-sm font-medium ${isFlipped ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`,
                children: isFlipped ? "Odpowiedź" : "Pytanie"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 space-y-1", children: [
              card.review_count > 0 && /* @__PURE__ */ jsxs("div", { children: [
                "Przeglądy: ",
                card.review_count
              ] }),
              card.last_reviewed && /* @__PURE__ */ jsxs("div", { children: [
                "Ostatnio: ",
                new Date(card.last_reviewed).toLocaleDateString("pl-PL")
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Trudność: ",
                card.difficulty_rating.toFixed(1),
                "/5.0"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("div", { className: "text-xl leading-relaxed mb-4", "data-testid": isFlipped ? "card-back" : "card-front", children: isFlipped ? card.back : card.front }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-center mt-6", children: [
            !isFlipped && !hasRated && /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Kliknij aby zobaczyć odpowiedź" }),
            isFlipped && !hasRated && /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Oceń jak dobrze pamiętałeś odpowiedź" }),
            hasRated && /* @__PURE__ */ jsx("p", { className: "text-green-600 font-medium", children: "✓ Oceniono! Ładowanie następnej fiszki..." })
          ] })
        ] })
      }
    ),
    isFlipped && !hasRated && /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-center text-gray-700 font-medium", children: "Jak dobrze pamiętałeś odpowiedź?" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-5 gap-2", children: [1, 2, 3, 4, 5].map((rating) => /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => handleRate(rating),
          disabled: isLoading,
          className: `${getRatingColor(rating)} text-white border-0 py-4 px-3 text-sm h-auto min-h-[60px] flex flex-col items-center justify-center`,
          "data-testid": `rating-${rating}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold text-lg leading-tight", children: rating }),
            /* @__PURE__ */ jsx("div", { className: "text-xs leading-tight mt-1 whitespace-normal text-center", children: getRatingLabel(rating) })
          ]
        },
        rating
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 text-center space-y-1", children: [
        /* @__PURE__ */ jsx("div", { children: "1 = Następny przegląd za 1 dzień" }),
        /* @__PURE__ */ jsx("div", { children: "2 = za 2 dni | 3 = za 4 dni | 4 = za 7 dni | 5 = za 14 dni" })
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center space-x-2 text-gray-600", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" }),
      /* @__PURE__ */ jsx("span", { children: "Zapisywanie oceny..." })
    ] }) })
  ] });
}

function LearningSession({ onEnd }) {
  const [currentCard, setCurrentCard] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);
  const [error, setError] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  useEffect(() => {
    loadNextCard();
  }, []);
  const loadNextCard = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL("/api/learn/session", window.location.origin);
      if (sessionId) {
        url.searchParams.set("session_id", sessionId);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load learning session");
      }
      const data = await response.json();
      setCurrentCard(data.card);
      setSessionInfo(data.session);
      if (!data.card) {
        setSessionEnded(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  const handleRateCard = async (rating2) => {
    if (!currentCard || !sessionInfo) return;
    try {
      setRating(true);
      setError(null);
      const response = await fetch("/api/learn/session/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: sessionInfo.session_id,
          flashcard_id: currentCard.id,
          rating: rating2
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rate flashcard");
      }
      setTimeout(() => {
        loadNextCard(sessionInfo.session_id);
        setRating(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rate flashcard");
      setRating(false);
    }
  };
  const handleEndSession = async () => {
    if (onEnd) {
      onEnd();
    } else {
      window.location.href = "/flashcards";
    }
  };
  const formatSessionTime = () => {
    if (!sessionInfo) return "";
    const startTime = new Date(sessionInfo.session_start);
    const now = /* @__PURE__ */ new Date();
    const minutes = Math.round((now.getTime() - startTime.getTime()) / (1e3 * 60));
    return `${minutes} min`;
  };
  if (loading && !currentCard) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center min-h-[400px]", children: /* @__PURE__ */ jsx(LoadingSpinner, { text: "Ładowanie sesji nauki..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-red-800 mb-4", children: [
        /* @__PURE__ */ jsx("strong", { children: "Błąd:" }),
        " ",
        error
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-x-3", children: [
        /* @__PURE__ */ jsx(Button, { onClick: () => loadNextCard(), variant: "outline", children: "Spróbuj ponownie" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleEndSession, variant: "outline", children: "Zakończ sesję" })
      ] })
    ] }) });
  }
  if (sessionEnded || !currentCard) {
    return /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto text-center", children: /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4", children: "🎉" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-green-800 mb-4", children: "Sesja nauki zakończona!" }),
      sessionInfo && /* @__PURE__ */ jsxs("div", { className: "text-green-700 mb-6 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          "Przejrzano fiszek: ",
          /* @__PURE__ */ jsx("strong", { children: sessionInfo.cards_reviewed })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Czas sesji: ",
          /* @__PURE__ */ jsx("strong", { children: formatSessionTime() })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-green-600", children: sessionInfo.message || "Wszystkie dostępne fiszki zostały przejrzane" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-x-3", children: [
        /* @__PURE__ */ jsx(Button, { onClick: () => loadNextCard(), children: "Rozpocznij nową sesję" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleEndSession, variant: "outline", children: "Powrót do fiszek" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    sessionInfo && /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm text-gray-600", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Przejrzano:" }),
          " ",
          sessionInfo.cards_reviewed
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Pozostało:" }),
          " ",
          sessionInfo.cards_remaining
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Czas:" }),
          " ",
          formatSessionTime()
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: handleEndSession, variant: "outline", size: "sm", children: "Zakończ sesję" })
    ] }) }) }),
    /* @__PURE__ */ jsx(LearningCard, { card: currentCard, onRate: handleRateCard, isLoading: rating })
  ] });
}

const $$Learn = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sesja nauki" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <div class="mb-6 text-center"> <h1 class="text-3xl font-bold text-gray-900 mb-2">Sesja nauki</h1> <p class="text-gray-600">Ucz się efektywnie z algorytmem spaced repetition</p> </div> ${renderComponent($$result2, "LearningSession", LearningSession, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/learning/LearningSession", "client:component-export": "LearningSession" })} <div class="mt-8 max-w-2xl mx-auto bg-blue-50 rounded-lg p-4"> <h3 class="font-semibold text-blue-900 mb-2">💡 Jak działa nauka?</h3> <ul class="text-sm text-blue-800 space-y-1"> <li>• Przeczytaj pytanie i spróbuj odpowiedzieć w myślach</li> <li>• Kliknij aby zobaczyć prawidłową odpowiedź</li> <li>• Oceń jak dobrze pamiętałeś odpowiedź (1-5)</li> <li>• Algorytm automatycznie ustali kiedy ponownie pokazać fiszkę</li> <li>• Im wyższa ocena, tym rzadziej fiszka będzie się pojawiać</li> </ul> </div> </div> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/learn.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/learn.astro";
const $$url = "/learn";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Learn,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
