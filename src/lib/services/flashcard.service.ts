import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, FlashcardDTO, FlashcardListResponseDTO } from "../../types";
import { createFlashcardSchema, type ListFlashcardsInput } from "../schemas/flashcard.schema";

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async createFlashcard(userId: string, data: unknown): Promise<FlashcardDTO> {
    // Validate input
    const validatedData = createFlashcardSchema.parse(data);

    // Prepare command
    const command: CreateFlashcardCommand = {
      user_id: userId,
      front: validatedData.front,
      back: validatedData.back,
      source: "manual",
    };
    // Insert into database
    const { data: flashcard, error } = await this.supabase.from("flashcards").insert(command).select().single();

    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    if (!flashcard) {
      throw new Error("No data returned from database after insert");
    }

    // Return as DTO
    return {
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    };
  }

  async listFlashcards(userId: string, params: ListFlashcardsInput): Promise<FlashcardListResponseDTO> {
    const { page, limit, search, source, sort, order } = params;

    // Start building the query
    let query = this.supabase
      .from("flashcards")
      .select("id, front, back, source, created_at, updated_at", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order(sort, { ascending: order === "asc" });

    // Apply source filter if provided
    if (source) {
      query = query.eq("source", source);
    }

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchQuery = search.trim().split(/\s+/).join(" & ");
      query = query.or(`front_tsv.phfts(${searchQuery}),back_tsv.phfts(${searchQuery})`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list flashcards: ${error.message}`);
    }

    // Calculate pagination values
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Return as DTO
    return {
      data: data || [],
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
      },
    };
  }
}
