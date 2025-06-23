import { ZodError } from 'zod';
import { g as generateFlashcardsSchema, G as GenerationService } from '../../../chunks/generation.schema_Cl5lguNF.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to generate flashcards"
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON body"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const validatedData = generateFlashcardsSchema.parse({
      prompt: requestData.prompt,
      count: requestData.count ?? 5
    });
    const generationService = new GenerationService(supabase);
    const { candidates, generationId } = await generationService.generateCandidates(
      session.user.id,
      validatedData.prompt,
      validatedData.count
    );
    const responseBody = {
      candidates,
      generation_id: generationId
    };
    return new Response(JSON.stringify(responseBody), {
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
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to generate flashcards due to an internal error."
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
