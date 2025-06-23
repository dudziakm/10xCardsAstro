import { s as supabaseClient } from '../../../chunks/supabase.client_C9p6CXIX.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy email lub hasło", debug: error.message }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (data.session) {
      cookies.set("supabase-access-token", data.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        // 1 week
        httpOnly: true,
        secure: false,
        // Allow for localhost
        sameSite: "lax"
      });
      cookies.set("supabase-refresh-token", data.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        // 30 days
        httpOnly: true,
        secure: false,
        // Allow for localhost
        sameSite: "lax"
      });
    }
    return new Response(
      JSON.stringify({
        message: "Zalogowano pomyślnie",
        user: {
          id: data.user.id,
          email: data.user.email
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Wystąpił błąd serwera", debug: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
