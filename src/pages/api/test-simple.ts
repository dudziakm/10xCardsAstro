import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ message: "API works!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({ received: body }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Parse error", details: error instanceof Error ? error.message : String(error) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const prerender = false;