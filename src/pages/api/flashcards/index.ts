import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { ZodError } from "zod";
import { listFlashcardsSchema } from "../../../lib/schemas/flashcard.schema";

export const POST: APIRoute = async ({ request, locals }) => {
  // Ensure user is authenticated
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "You must be logged in to create flashcards" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
      console.log("Request data:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Session user ID:", session.user.id);

    // Create flashcard service
    const flashcardService = new FlashcardService(supabase);

    // Create flashcard
    try {
      const flashcard = await flashcardService.createFlashcard(session.user.id, requestData);

      // Return successful response
      return new Response(JSON.stringify(flashcard), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      console.error("Error in flashcard service:", serviceError);

      // Return detailed error information
      return new Response(
        JSON.stringify({
          error: "Database Error",
          message: serviceError instanceof Error ? serviceError.message : String(serviceError),
          details: serviceError,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    // Handle validation errors
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

    // Handle other errors
    console.error("Error creating flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  // Ensure user is authenticated
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
    // Extract URL parameters
    const url = new URL(request.url);
    const sourceParam = url.searchParams.get("source");
    const params: any = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
      sort: url.searchParams.get("sort") || "updated_at",
      order: url.searchParams.get("order") || "desc",
    };

    // Only add optional params if they exist
    const searchParam = url.searchParams.get("search");
    if (searchParam) {
      params.search = searchParam;
    }

    if (sourceParam && ["manual", "ai"].includes(sourceParam)) {
      params.source = sourceParam;
    }

    // Validate parameters
    console.log("Params before validation:", JSON.stringify(params));
    const validatedParams = listFlashcardsSchema.parse(params);

    // Create flashcard service
    const flashcardService = new FlashcardService(supabase);

    // Get flashcards
    const response = await flashcardService.listFlashcards(session.user.id, validatedParams);

    // Return successful response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid query parameters",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle other errors
    console.error("Error listing flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Disable prerendering for API routes
export const prerender = false;
