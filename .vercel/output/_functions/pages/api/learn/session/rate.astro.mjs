import { ZodError } from 'zod';
import { r as rateFlashcardSchema, L as LearningService } from '../../../../chunks/learning.schema_DReZ43as.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to rate flashcards"
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const requestData = await request.json();
    const validatedData = rateFlashcardSchema.parse(requestData);
    const learningService = new LearningService(supabase);
    const response = await learningService.rateFlashcard(
      session.user.id,
      validatedData.session_id,
      validatedData.flashcard_id,
      validatedData.rating
    );
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid input data",
          details: error.errors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: error.message
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to rate flashcard"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
