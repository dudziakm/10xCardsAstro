import { a as createComponent, b as renderTemplate, e as renderHead, d as renderScript } from '../chunks/astro/server_1--A5kBA.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$TestApi = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["<html> <head><title>API Test Page</title>", "", '</head> <body> <h1>my10xCards API Test</h1> <div id="results"></div> <h2>Test Flashcards</h2> <button onclick="window.testGetFlashcards()">GET /api/flashcards</button> <button onclick="window.testCreateFlashcard()">POST /api/flashcards</button> <h2>Test Database</h2> <button onclick="window.testDatabase()">Test Database Connection</button> <script type="module">\n      /* eslint-disable */\n      const results = document.getElementById("results");\n\n      function log(message) {\n        if (results) {\n          results.innerHTML += "<p>" + message + "</p>";\n        }\n      }\n\n      // Make functions globally available for onclick handlers\n      window.testGetFlashcards = async function () {\n        try {\n          log("Testing GET /api/flashcards...");\n          const response = await axios.get("/api/flashcards");\n          log("SUCCESS: " + JSON.stringify(response.data, null, 2));\n        } catch (error) {\n          log("ERROR: " + error.response?.data?.message || error.message);\n        }\n      };\n\n      window.testCreateFlashcard = async function () {\n        try {\n          log("Testing POST /api/flashcards...");\n          const response = await axios.post("/api/flashcards", {\n            front: "Test Question",\n            back: "Test Answer",\n          });\n          log("SUCCESS: " + JSON.stringify(response.data, null, 2));\n        } catch (error) {\n          log("ERROR: " + error.response?.data?.message || error.message);\n        }\n      };\n\n      window.testDatabase = async function () {\n        try {\n          log("Testing database connection...");\n          const response = await axios.get("/api/test-db");\n          log("SUCCESS: " + JSON.stringify(response.data, null, 2));\n        } catch (error) {\n          log("ERROR: " + error.response?.data?.message || error.message);\n        }\n      };\n    <\/script> </body> </html>'])), renderScript($$result, "/mnt/c/10x/10xCardsAstro/src/pages/test-api.astro?astro&type=script&index=0&lang.ts"), renderHead());
}, "/mnt/c/10x/10xCardsAstro/src/pages/test-api.astro", void 0);

const $$file = "/mnt/c/10x/10xCardsAstro/src/pages/test-api.astro";
const $$url = "/test-api";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestApi,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
