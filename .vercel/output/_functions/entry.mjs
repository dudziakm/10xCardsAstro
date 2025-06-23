import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DKhzBOzg.mjs';
import { manifest } from './manifest_BE4TuIu6.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/login.astro.mjs');
const _page2 = () => import('./pages/api/auth/logout.astro.mjs');
const _page3 = () => import('./pages/api/auth/signup.astro.mjs');
const _page4 = () => import('./pages/api/flashcards/accept.astro.mjs');
const _page5 = () => import('./pages/api/flashcards/generate.astro.mjs');
const _page6 = () => import('./pages/api/flashcards/index.test.astro.mjs');
const _page7 = () => import('./pages/api/flashcards/_id_.astro.mjs');
const _page8 = () => import('./pages/api/flashcards.astro.mjs');
const _page9 = () => import('./pages/api/learn/session/rate.astro.mjs');
const _page10 = () => import('./pages/api/learn/session.astro.mjs');
const _page11 = () => import('./pages/api/learn/session.test.astro.mjs');
const _page12 = () => import('./pages/api/test-auth.astro.mjs');
const _page13 = () => import('./pages/api/test-flashcard.astro.mjs');
const _page14 = () => import('./pages/auth/callback.astro.mjs');
const _page15 = () => import('./pages/auth/login.astro.mjs');
const _page16 = () => import('./pages/auth/signup.astro.mjs');
const _page17 = () => import('./pages/flashcards/new.astro.mjs');
const _page18 = () => import('./pages/flashcards/_id_/edit.astro.mjs');
const _page19 = () => import('./pages/flashcards/_id_.astro.mjs');
const _page20 = () => import('./pages/flashcards.astro.mjs');
const _page21 = () => import('./pages/generate.astro.mjs');
const _page22 = () => import('./pages/learn.astro.mjs');
const _page23 = () => import('./pages/test-api.astro.mjs');
const _page24 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth/login.ts", _page1],
    ["src/pages/api/auth/logout.ts", _page2],
    ["src/pages/api/auth/signup.ts", _page3],
    ["src/pages/api/flashcards/accept.ts", _page4],
    ["src/pages/api/flashcards/generate.ts", _page5],
    ["src/pages/api/flashcards/index.test.ts", _page6],
    ["src/pages/api/flashcards/[id].ts", _page7],
    ["src/pages/api/flashcards/index.ts", _page8],
    ["src/pages/api/learn/session/rate.ts", _page9],
    ["src/pages/api/learn/session.ts", _page10],
    ["src/pages/api/learn/session.test.ts", _page11],
    ["src/pages/api/test-auth.ts", _page12],
    ["src/pages/api/test-flashcard.ts", _page13],
    ["src/pages/auth/callback.astro", _page14],
    ["src/pages/auth/login.astro", _page15],
    ["src/pages/auth/signup.astro", _page16],
    ["src/pages/flashcards/new.astro", _page17],
    ["src/pages/flashcards/[id]/edit.astro", _page18],
    ["src/pages/flashcards/[id].astro", _page19],
    ["src/pages/flashcards.astro", _page20],
    ["src/pages/generate.astro", _page21],
    ["src/pages/learn.astro", _page22],
    ["src/pages/test-api.astro", _page23],
    ["src/pages/index.astro", _page24]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "809d406d-ca1f-41eb-bc6c-a40b4d031642",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
