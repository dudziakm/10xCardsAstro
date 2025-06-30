import type { APIRoute } from "astro";

// This endpoint is used by client-side JavaScript to inform about guest operations
// All actual data management happens in localStorage via GuestFlashcardService

export const GET: APIRoute = async () => {
  // Return guest mode capabilities
  return new Response(
    JSON.stringify({
      mode: "guest",
      features: {
        create: true,
        read: true,
        update: true,
        delete: true,
        generate: true,
        learn: true,
      },
      limitations: {
        maxFlashcards: 100,
        dataStorage: "localStorage",
        persistence: "session-only",
        sharing: false,
        export: false,
      },
      message: "You are using my10xCards in guest mode. Your flashcards are stored locally in your browser and will be lost if you clear browser data. Sign up to save your progress permanently!",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

// Disable prerendering for API routes
export const prerender = false;