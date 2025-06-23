import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BNVo9Nwc.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_DtnxgX_q.mjs';
import { F as FlashcardForm } from '../../chunks/FlashcardForm_D_TLmMUX.mjs';
export { renderers } from '../../renderers.mjs';

const $$New = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dodaj now\u0105 fiszk\u0119" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-8"> <div class="max-w-2xl mx-auto"> <div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900 mb-2">Dodaj nową fiszkę</h1> <p class="text-gray-600">Utwórz własną fiszkę do nauki</p> </div> <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"> ${renderComponent($$result2, "FlashcardForm", FlashcardForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/forms/FlashcardForm", "client:component-export": "FlashcardForm" })} </div> </div> </main> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/flashcards/new.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/flashcards/new.astro";
const $$url = "/flashcards/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
