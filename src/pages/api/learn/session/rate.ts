import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { LearningService } from "../../../../lib/services/learning.service";
import { rateFlashcardSchema } from "../../../../lib/schemas/learning.schema";

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to rate flashcards",
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
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid input data",
          details: error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: error.message,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to rate flashcard",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const prerender = false;
