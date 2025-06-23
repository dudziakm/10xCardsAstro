import { ZodError } from 'zod';
import { g as getLearningSessionSchema, L as LearningService } from '../../../chunks/learning.schema_DReZ43as.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to start a learning session"
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const url = new URL(request.url);
    const reset = url.searchParams.get("reset") === "true";
    const params = {
      session_id: url.searchParams.get("session_id") || void 0
    };
    if (reset) {
      return new Response(JSON.stringify({ message: "Progress reset successfully" }), { status: 200 });
    }
    const validatedParams = getLearningSessionSchema.parse(params);
    const learningService = new LearningService(supabase);
    const response = await learningService.getNextCard(session.user.id, validatedParams.session_id);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid parameters",
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
        message: "Failed to get learning session"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
