import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy email lub hasło" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Set session cookies
    if (data.session) {
      cookies.set("supabase-access-token", data.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      cookies.set("supabase-refresh-token", data.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }

    return new Response(
      JSON.stringify({
        message: "Zalogowano pomyślnie",
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
