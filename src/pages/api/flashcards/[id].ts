import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { updateFlashcardSchema } from "../../../lib/schemas/flashcard.schema";

export const GET: APIRoute = async ({ params, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to access flashcards",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const flashcardId = params.id;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Simple implementation for now - just get the flashcard
    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", session.user.id)
      .single();

    if (error || !flashcard) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Flashcard not found or access denied",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error getting flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to retrieve flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to update flashcards",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const flashcardId = params.id;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedData = updateFlashcardSchema.parse(requestData);

    // Update the flashcard
    const { data: updatedFlashcard, error } = await supabase
      .from("flashcards")
      .update({
        front: validatedData.front,
        back: validatedData.back,
        updated_at: new Date().toISOString(),
      })
      .eq("id", flashcardId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error || !updatedFlashcard) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Flashcard not found or access denied",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        id: updatedFlashcard.id,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back,
        source: updatedFlashcard.source,
        created_at: updatedFlashcard.created_at,
        updated_at: updatedFlashcard.updated_at,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid input data",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error updating flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to update flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to delete flashcards",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const flashcardId = params.id;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete the flashcard
    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", session.user.id);

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to delete flashcard",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Flashcard deleted successfully",
        deleted_id: flashcardId,
        deleted_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to delete flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const prerender = false;
