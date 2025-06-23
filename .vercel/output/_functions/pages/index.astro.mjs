import { c as createAstro, a as createComponent, b as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_1--A5kBA.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BS3VogJm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { B as Button } from '../chunks/button_tbmfKED-.mjs';
export { renderers } from '../renderers.mjs';

function LoginPrompt() {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8", children: [
    /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4", children: "🔒" }),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Zaloguj się aby rozpocząć naukę" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-6", children: "Utwórz konto lub zaloguj się, aby rozpocząć tworzenie fiszek i efektywną naukę z algorytmem spaced repetition." }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
      /* @__PURE__ */ jsx(Button, { onClick: () => window.location.href = "/auth/login", className: "bg-blue-600 hover:bg-blue-700", children: "🚀 Zaloguj się" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => window.location.href = "/auth/signup",
          variant: "outline",
          className: "border-blue-300 text-blue-600 hover:bg-blue-50",
          children: "✨ Utwórz konto"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-sm text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "✅ Bezpłatne • ✅ Bez reklam • ✅ Twoje dane są bezpieczne" }) })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://10x-cards-astro.vercel.app");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { session } = Astro2.locals;
  return renderTemplate(_a || (_a = __template(["", ' <script type="module">\n  /* eslint-disable */\n  // Load dashboard stats\n  async function loadStats() {\n    try {\n      const response = await fetch("/api/flashcards?limit=1");\n      if (response.ok) {\n        const data = await response.json();\n        const totalCardsEl = document.getElementById("total-cards");\n        if (totalCardsEl) totalCardsEl.textContent = data.pagination.total_items.toString();\n\n        // Load manual cards\n        const manualResponse = await fetch("/api/flashcards?limit=1&source=manual");\n        if (manualResponse.ok) {\n          const manualData = await manualResponse.json();\n          const manualCardsEl = document.getElementById("manual-cards");\n          if (manualCardsEl) manualCardsEl.textContent = manualData.pagination.total_items.toString();\n        }\n\n        // Load AI cards\n        const aiResponse = await fetch("/api/flashcards?limit=1&source=ai");\n        if (aiResponse.ok) {\n          const aiData = await aiResponse.json();\n          const aiCardsEl = document.getElementById("ai-cards");\n          if (aiCardsEl) aiCardsEl.textContent = aiData.pagination.total_items.toString();\n        }\n      }\n    } catch {\n      const totalCardsEl = document.getElementById("total-cards");\n      const manualCardsEl = document.getElementById("manual-cards");\n      const aiCardsEl = document.getElementById("ai-cards");\n      if (totalCardsEl) totalCardsEl.textContent = "0";\n      if (manualCardsEl) manualCardsEl.textContent = "0";\n      if (aiCardsEl) aiCardsEl.textContent = "0";\n    }\n  }\n\n  // Only load stats if user is logged in\n  const isLoggedIn = document.querySelector("nav").textContent.includes("Wyloguj");\n  if (isLoggedIn) {\n    loadStats();\n  }\n<\/script>'])), renderComponent($$result, "Layout", $$Layout, { "title": "my10xCards - Twoje fiszki do nauki" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-8"> <div class="text-center mb-12"> <h1 class="text-4xl font-bold text-gray-900 mb-4" data-testid="homepage-title">my10xCards</h1> <p class="text-xl text-gray-600 mb-8" data-testid="homepage-subtitle">Efektywna nauka z AI-powered fiszkami</p> </div> <div class="grid md:grid-cols-3 gap-6 mb-8"> <a href="/flashcards?filter=all" data-testid="stats-all-cards" class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"> <div class="text-center"> <div class="text-3xl font-bold text-blue-600 mb-2" id="total-cards">-</div> <div class="text-gray-600">Wszystkich fiszek</div> <div class="text-xs text-blue-500 mt-1">Kliknij aby zobaczyć wszystkie</div> </div> </a> <a href="/flashcards?filter=manual" data-testid="stats-manual-cards" class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer transform hover:scale-105"> <div class="text-center"> <div class="text-3xl font-bold text-green-600 mb-2" id="manual-cards">-</div> <div class="text-gray-600">Fiszek manualnych</div> <div class="text-xs text-green-500 mt-1">Kliknij aby zobaczyć manualne</div> </div> </a> <a href="/flashcards?filter=ai" data-testid="stats-ai-cards" class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer transform hover:scale-105"> <div class="text-center"> <div class="text-3xl font-bold text-purple-600 mb-2" id="ai-cards">-</div> <div class="text-gray-600">Fiszek AI</div> <div class="text-xs text-purple-500 mt-1">Kliknij aby zobaczyć AI</div> </div> </a> </div> <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4"> <a href="/flashcards" data-testid="action-my-flashcards" class="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-center transition-colors"> <div class="text-2xl mb-2">📚</div> <div class="font-semibold">Moje fiszki</div> </a> <a href="/flashcards/new" data-testid="action-add-flashcard" class="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-center transition-colors"> <div class="text-2xl mb-2">➕</div> <div class="font-semibold">Dodaj fiszkę</div> </a> <a href="/generate" data-testid="action-generate-ai" class="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-center transition-colors"> <div class="text-2xl mb-2">🤖</div> <div class="font-semibold">Generuj AI</div> </a> <a href="/learn" data-testid="action-learn" class="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-6 text-center transition-colors"> <div class="text-2xl mb-2">🧠</div> <div class="font-semibold">Ucz się</div> </a> </div> ${!session && renderTemplate`<div class="mt-12"> ${renderComponent($$result2, "LoginPrompt", LoginPrompt, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/auth/LoginPrompt", "client:component-export": "LoginPrompt" })} </div>`} ${session && renderTemplate`<div class="mt-8 text-center"> <p class="text-green-600 font-medium">👋 Witaj z powrotem! Gotowy na naukę?</p> </div>`} </main> ` }));
}, "/mnt/c/10x/10xCardsAstro/src/pages/index.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
