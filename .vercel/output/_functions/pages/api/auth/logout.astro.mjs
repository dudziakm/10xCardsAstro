export { renderers } from '../../../renderers.mjs';

const POST = async ({ cookies }) => {
  try {
    cookies.delete("supabase-access-token", { path: "/" });
    cookies.delete("supabase-refresh-token", { path: "/" });
    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
