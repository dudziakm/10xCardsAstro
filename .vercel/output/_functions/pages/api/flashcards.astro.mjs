import { c as createFlashcardSchema, l as listFlashcardsSchema } from '../../chunks/flashcard.schema_DH_QwPn2.mjs';
import { ZodError } from 'zod';
export { renderers } from '../../renderers.mjs';

class FlashcardService {
  constructor(supabase) {
    this.supabase = supabase;
  }
  async createFlashcard(userId, data) {
    const validatedData = createFlashcardSchema.parse(data);
    const command = {
      user_id: userId,
      front: validatedData.front,
      back: validatedData.back,
      source: "manual"
    };
    const { data: flashcard, error } = await this.supabase.from("flashcards").insert(command).select().single();
    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }
    if (!flashcard) {
      throw new Error("No data returned from database after insert");
    }
    return {
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at
    };
  }
  async listFlashcards(userId, params) {
    const { page, limit, search, source, sort, order } = params;
    let query = this.supabase.from("flashcards").select("id, front, back, source, created_at, updated_at", { count: "exact" }).eq("user_id", userId).is("deleted_at", null).order(sort, { ascending: order === "asc" });
    if (source) {
      query = query.eq("source", source);
    }
    if (search && search.trim()) {
      const searchQuery = search.trim().split(/\s+/).join(" & ");
      query = query.or(`front_tsv.fts.${searchQuery},back_tsv.fts.${searchQuery}`);
    }
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    const { data, error, count } = await query;
    if (error) {
      throw new Error(`Failed to list flashcards: ${error.message}`);
    }
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: data || [],
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit
      }
    };
  }
}

const POST = async ({ request, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "You must be logged in to create flashcards" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const flashcardService = new FlashcardService(supabase);
    try {
      const flashcard = await flashcardService.createFlashcard(session.user.id, requestData);
      return new Response(JSON.stringify(flashcard), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (serviceError) {
      return new Response(
        JSON.stringify({
          error: "Database Error",
          message: serviceError instanceof Error ? serviceError.message : String(serviceError),
          details: serviceError
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
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
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const GET = async ({ request, locals }) => {
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
    const url = new URL(request.url);
    const sourceParam = url.searchParams.get("source");
    const params = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
      sort: url.searchParams.get("sort") || "updated_at",
      order: url.searchParams.get("order") || "desc"
    };
    const searchParam = url.searchParams.get("search");
    if (searchParam) {
      params.search = searchParam;
    }
    if (sourceParam && ["manual", "ai"].includes(sourceParam)) {
      params.source = sourceParam;
    }
    const validatedParams = listFlashcardsSchema.parse(params);
    const flashcardService = new FlashcardService(supabase);
    const response = await flashcardService.listFlashcards(session.user.id, validatedParams);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid query parameters",
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
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error)
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
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
