import { a as supabaseClient } from '../../../chunks/supabase.client_CY6bbIc_.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Hasło musi mieć co najmniej 6 znaków" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
      }
    });
    if (error) {
      let errorMessage = "Wystąpił błąd podczas rejestracji";
      if (error.message.includes("already registered")) {
        errorMessage = "Ten email jest już zarejestrowany";
      } else if (error.message.includes("password")) {
        errorMessage = "Hasło jest zbyt słabe";
      } else if (error.message.includes("email")) {
        errorMessage = "Nieprawidłowy format email";
      }
      return new Response(JSON.stringify({ error: errorMessage, debug: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(
      JSON.stringify({
        message: "Konto utworzone! Sprawdź email aby aktywować konto.",
        user: data.user ? {
          id: data.user.id,
          email: data.user.email
        } : null
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
