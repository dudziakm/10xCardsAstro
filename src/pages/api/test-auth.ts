import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  // Return information about the session
  return new Response(
    JSON.stringify({
      isAuthenticated: !!locals.session,
      userId: locals.session?.user?.id || null,
      sessionInfo: locals.session
        ? {
            hasUser: !!locals.session.user,
            userKeys: locals.session.user ? Object.keys(locals.session.user) : [],
          }
        : null,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Disable prerendering for API routes
export const prerender = false;
