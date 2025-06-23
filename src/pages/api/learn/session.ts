import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { LearningService } from "../../../lib/services/learning.service";
import { getLearningSessionSchema } from "../../../lib/schemas/learning.schema";

export const GET: APIRoute = async ({ request, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to start a learning session",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(request.url);
    const reset = url.searchParams.get("reset") === "true";
    const params = {
      session_id: url.searchParams.get("session_id") || undefined,
    };

    // Handle reset request
    if (reset) {
      try {
        // Reset all learning progress for this user
        const { error: resetError } = await supabase
          .from("flashcard_progress")
          .delete()
          .eq("user_id", session.user.id);

        if (resetError) {
          console.error("Reset error:", resetError);
          return new Response(
            JSON.stringify({ 
              error: "Reset failed", 
              message: "Could not reset learning progress",
              details: resetError.message 
            }), 
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            message: "Learning progress reset successfully",
            resetCards: "All progress cleared" 
          }), 
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Reset exception:", error);
        return new Response(
          JSON.stringify({ 
            error: "Reset failed", 
            message: "Unexpected error during reset" 
          }), 
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const validatedParams = getLearningSessionSchema.parse(params);

    const learningService = new LearningService(supabase);
    const response = await learningService.getNextCard(session.user.id, validatedParams.session_id);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid parameters",
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
        message: "Failed to get learning session",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const prerender = false;
