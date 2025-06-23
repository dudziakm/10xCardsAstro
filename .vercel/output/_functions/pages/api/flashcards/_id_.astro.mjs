import { ZodError } from 'zod';
import { u as updateFlashcardSchema } from '../../../chunks/flashcard.schema_DH_QwPn2.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to access flashcards"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: flashcard, error } = await supabase.from("flashcards").select("*").eq("id", flashcardId).eq("user_id", session.user.id).is("deleted_at", null).single();
    if (error || !flashcard) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Flashcard not found or access denied"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
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
        updated_at: flashcard.updated_at
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to retrieve flashcard"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const PUT = async ({ params, request, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to update flashcards"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const validatedData = updateFlashcardSchema.parse(requestData);
    const { data: updatedFlashcard, error } = await supabase.from("flashcards").update({
      front: validatedData.front,
      back: validatedData.back,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", flashcardId).eq("user_id", session.user.id).is("deleted_at", null).select().single();
    if (error || !updatedFlashcard) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Flashcard not found or access denied"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
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
        updated_at: updatedFlashcard.updated_at
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid input data",
          details: error.errors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to update flashcard"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const DELETE = async ({ params, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to delete flashcards"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: existingFlashcard, error: checkError } = await supabase.from("flashcards").select("id, deleted_at").eq("id", flashcardId).eq("user_id", session.user.id).single();
    if (checkError || !existingFlashcard) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Flashcard not found or access denied"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (existingFlashcard.deleted_at) {
      return new Response(
        JSON.stringify({
          error: "Already Deleted",
          message: "Flashcard is already deleted"
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", session.user.id);
    if (error) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to delete flashcard"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        message: "Flashcard deleted successfully",
        deleted_id: flashcardId,
        deleted_at: (/* @__PURE__ */ new Date()).toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to delete flashcard"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
