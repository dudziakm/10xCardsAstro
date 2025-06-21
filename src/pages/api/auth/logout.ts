import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Clear session cookies
    cookies.delete("supabase-access-token", { path: "/" });
    cookies.delete("supabase-refresh-token", { path: "/" });

    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
