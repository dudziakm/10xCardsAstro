import { c as createAstro, a as createComponent, m as maybeRenderHead, d as renderScript, f as addAttribute, b as renderTemplate, e as renderHead, g as renderSlot, r as renderComponent } from './astro/server_1--A5kBA.mjs';
import 'kleur/colors';
/* empty css                            */
import 'clsx';

const $$Astro$1 = createAstro("https://10x-cards-astro.vercel.app");
const $$Navigation = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Navigation;
  const { currentPath = Astro2.url.pathname } = Astro2.props;
  const { session } = Astro2.locals;
  const navItems = [
    { href: "/", label: "Start", icon: "\u{1F3E0}" },
    { href: "/flashcards", label: "Moje fiszki", icon: "\u{1F4DA}" },
    { href: "/generate", label: "Generuj AI", icon: "\u{1F916}" },
    { href: "/learn", label: "Ucz si\u0119", icon: "\u{1F3AF}" }
  ];
  const isActive = (href) => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(href);
  };
  return renderTemplate`${maybeRenderHead()}<nav class="bg-white shadow-sm border-b border-gray-200"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between h-16"> <div class="flex"> <!-- Logo --> <div class="flex-shrink-0 flex items-center"> <a href="/" class="flex items-center space-x-2 text-xl font-bold text-gray-900" data-testid="nav-logo"> <span class="text-2xl">🧠</span> <span>my10xCards</span> </a> </div> <!-- Navigation Links --> <div class="hidden sm:ml-6 sm:flex sm:space-x-8"> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`nav-${item.href === "/" ? "home" : item.href.slice(1)}`, "data-testid")}${addAttribute(`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${isActive(item.href) ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`, "class")}> <span class="mr-2">${item.icon}</span> ${item.label} </a>`)} </div> </div> <!-- User section --> <div class="hidden sm:flex sm:items-center sm:space-x-4"> ${session ? renderTemplate`<div class="flex items-center space-x-3"> <span class="text-sm text-gray-600">👋 Zalogowany</span> <button onclick="logout()" data-testid="logout-button" class="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
Wyloguj
</button> </div>` : renderTemplate`<div class="flex items-center space-x-2"> <a href="/auth/login" data-testid="login-link" class="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
Zaloguj
</a> <a href="/auth/signup" data-testid="signup-link" class="text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium px-3 py-1 rounded-md transition-colors">
Rejestracja
</a> </div>`} </div> <!-- Mobile menu button --> <div class="sm:hidden flex items-center"> <button type="button" class="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500" aria-expanded="false"> <span class="sr-only">Otwórz menu główne</span> <!-- Hamburger icon --> <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> </div> </div> </div> <!-- Mobile menu --> <div class="mobile-menu hidden sm:hidden"> <div class="pt-2 pb-3 space-y-1"> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`mobile-nav-${item.href === "/" ? "home" : item.href.slice(1)}`, "data-testid")}${addAttribute(`block pl-3 pr-4 py-2 text-base font-medium transition-colors ${isActive(item.href) ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`, "class")}> <span class="mr-2">${item.icon}</span> ${item.label} </a>`)} </div> </div> </nav> ${renderScript($$result, "/mnt/c/10x/10xCardsAstro/src/components/Navigation.astro?astro&type=script&index=0&lang.ts")}`;
}, "/mnt/c/10x/10xCardsAstro/src/components/Navigation.astro", void 0);

const $$Astro = createAstro("https://10x-cards-astro.vercel.app");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "my10xCards", showNavigation = true } = Astro2.props;
  return renderTemplate`<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/png" href="/favicon.png"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body data-astro-cid-sckkx6r4> ${showNavigation && renderTemplate`${renderComponent($$result, "Navigation", $$Navigation, { "data-astro-cid-sckkx6r4": true })}`} <main${addAttribute(showNavigation ? "min-h-screen bg-gray-50" : "", "class")} data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/mnt/c/10x/10xCardsAstro/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
