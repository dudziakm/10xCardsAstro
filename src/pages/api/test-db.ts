/* eslint-disable @typescript-eslint/no-explicit-any */
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  try {
    // Test database connection - try direct flashcards table instead
    const { data: flashcardsTest, error: tablesError } = await supabase
      .from("flashcards")
      .select("id")
      .limit(1);

    if (tablesError) {
      return new Response(
        JSON.stringify({
          error: "Database Error",
          message: tablesError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Test basic queries
    const { error: flashcardsError } = await supabase.from("flashcards").select("count").limit(1);

    const { error: generationsError } = await supabase.from("generations").select("count").limit(1);

    return new Response(
      JSON.stringify({
        status: "connected",
        flashcards_test: flashcardsTest,
        flashcards_accessible: !flashcardsError,
        generations_accessible: !generationsError,
        errors: {
          flashcards: flashcardsError?.message,
          generations: generationsError?.message,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Connection Error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const prerender = false;
