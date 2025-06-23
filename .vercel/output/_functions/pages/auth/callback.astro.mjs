import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, F as Fragment } from '../../chunks/astro/server_BNVo9Nwc.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_DtnxgX_q.mjs';
import { a as supabaseClient } from '../../chunks/supabase.client_AiE9_edo.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://10x-cards-astro.vercel.app");
const $$Callback = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Callback;
  const { searchParams } = Astro2.url;
  const code = searchParams.get("code");
  let message = "";
  let isError = false;
  if (code) {
    try {
      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
      if (error) {
        message = "Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktywacji konta. Spr\xF3buj ponownie.";
        isError = true;
      } else if (data.session) {
        Astro2.cookies.set("supabase-access-token", data.session.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          // 1 week
          httpOnly: true,
          secure: true,
          sameSite: "lax"
        });
        Astro2.cookies.set("supabase-refresh-token", data.session.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          // 30 days
          httpOnly: true,
          secure: true,
          sameSite: "lax"
        });
        return Astro2.redirect("/flashcards");
      }
    } catch {
      message = "Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktywacji konta.";
      isError = true;
    }
  } else {
    message = "Brakuje kodu aktywacyjnego.";
    isError = true;
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Aktywacja konta - my10xCards" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md mx-auto"> <!-- Header --> <div class="text-center mb-8"> <a href="/" class="text-3xl font-bold text-blue-600">🧠 my10xCards</a> <p class="mt-2 text-gray-600">Aktywacja konta</p> </div> <!-- Message --> <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200"> <div class="text-center"> ${isError ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="text-6xl mb-4">❌</div> <h2 class="text-2xl font-bold text-red-600 mb-4">Błąd aktywacji</h2> <p class="text-gray-600 mb-6">${message}</p> <a href="/auth/login" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
Spróbuj zalogować się
</a> ` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="text-6xl mb-4">⏳</div> <h2 class="text-2xl font-bold text-gray-900 mb-4">Aktywacja...</h2> <p class="text-gray-600">Trwa aktywacja konta. Zostaniesz przekierowany automatycznie.</p> ` })}`} </div> </div> </div> </div> ` })}`;
}, "/mnt/c/10x/10xCardsAstro/src/pages/auth/callback.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/auth/callback.astro";
const $$url = "/auth/callback";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Callback,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
