import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_1--A5kBA.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../../chunks/Layout_BS3VogJm.mjs';
import { F as FlashcardForm } from '../../../chunks/FlashcardForm_D_TLmMUX.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://10x-cards-astro.vercel.app");
const $$Edit = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Edit;
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/flashcards");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Edytuj fiszk\u0119" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-8"> <div class="max-w-2xl mx-auto"> <div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900 mb-2">Edytuj fiszkę</h1> <p class="text-gray-600">Modyfikuj zawartość swojej fiszki</p> </div> <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"> ${renderComponent($$result2, "FlashcardForm", FlashcardForm, { "client:load": true, "data-flashcard-id": id, "data-mode": "edit", "client:component-hydration": "load", "client:component-path": "/mnt/c/10x/10xCardsAstro/src/components/forms/FlashcardForm", "client:component-export": "FlashcardForm" })} </div> </div> </main> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/flashcards/[id]/edit.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/flashcards/[id]/edit.astro";
const $$url = "/flashcards/[id]/edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Edit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
