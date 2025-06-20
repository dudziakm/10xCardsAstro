import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { supabase, session } = locals;
  const userId = session?.user?.id || "4d4918b3-fcb8-4ece-93c9-3272e8cbacc0";

  try {
    // Attempt to directly insert a test flashcard
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        front: "Test Front",
        back: "Test Back",
        source: "manual",
      })
      .select();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          details: error,
          table: "flashcards",
          userId,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: "Test flashcard created",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Check tables information
export const POST: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  try {
    // Get list of tables
    const { data: tables, error: tablesError } = await (supabase as any)
      .from("pg_tables")
      .select("schemaname, tablename")
      .eq("schemaname", "public");

    if (tablesError) {
      return new Response(JSON.stringify({ success: false, error: tablesError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try to get columns for flashcards table
    const { data: columns, error: columnsError } = await (supabase as any).rpc("get_table_columns", {
      table_name: "flashcards",
    });

    return new Response(
      JSON.stringify({
        success: true,
        tables,
        flashcardsColumns: columnsError ? `Error: ${columnsError.message}` : columns,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const prerender = false;
