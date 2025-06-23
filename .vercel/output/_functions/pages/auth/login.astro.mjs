import { a as createComponent, r as renderComponent, d as renderScript, b as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_1--A5kBA.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BS3VogJm.mjs';
export { renderers } from '../../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Logowanie - my10xCards" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md mx-auto"> <!-- Header --> <div class="text-center mb-8"> <a href="/" class="text-3xl font-bold text-blue-600">🧠 my10xCards</a> <p class="mt-2 text-gray-600">Efektywna nauka z AI-powered fiszkami</p> </div> <!-- Login Form --> <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200"> <div class="text-center mb-6"> <h2 class="text-2xl font-bold text-gray-900">Zaloguj się</h2> <p class="text-gray-600 mt-2">Aby kontynuować naukę z fiszkami</p> </div> <div id="message" class="hidden mb-4"></div> <form id="login-form" class="space-y-4"> <div> <label for="email" class="block text-sm font-medium text-gray-700 mb-2"> Email </label> <input type="email" id="email" name="email" placeholder="twoj@email.com" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> </div> <div> <label for="password" class="block text-sm font-medium text-gray-700 mb-2"> Hasło </label> <input type="password" id="password" name="password" placeholder="••••••••" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> </div> <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
Zaloguj się
</button> </form> <div class="mt-6 text-center"> <a href="/auth/signup" class="text-blue-600 hover:text-blue-700 font-medium">
Nie masz konta? Zarejestruj się
</a> </div> </div> </div> </div> ` })} ${renderScript($$result, "/mnt/c/10x/10xCardsAstro/src/pages/auth/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/auth/login.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/auth/login.astro";
const $$url = "/auth/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
