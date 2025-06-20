import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  try {
    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

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
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('count')
      .limit(1);

    const { data: generations, error: generationsError } = await supabase
      .from('generations')
      .select('count')
      .limit(1);

    return new Response(
      JSON.stringify({
        status: "connected",
        tables: tables?.map(t => t.table_name) || [],
        flashcards_accessible: !flashcardsError,
        generations_accessible: !generationsError,
        errors: {
          flashcards: flashcardsError?.message,
          generations: generationsError?.message,
        }
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