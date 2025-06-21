import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateGenerationCommand,
  CreateGenerationErrorLogCommand,
  FlashcardCandidateDTO,
  CreateFlashcardCommand,
  FlashcardDTO,
} from "../../types";
import { callOpenRouterAI } from "../ai/openrouter";
import type { AcceptCandidatesInput } from "../schemas/generation.schema";

export class GenerationService {
  constructor(private supabase: SupabaseClient) {}

  async generateCandidates(
    userId: string,
    prompt: string,
    count = 5
  ): Promise<{ candidates: FlashcardCandidateDTO[]; generationId: string }> {
    let generationId: string | null = null;

    try {
      // 1. Create initial generation log
      const generationCmd: CreateGenerationCommand = {
        user_id: userId,
        input_text: prompt.substring(0, 500), // Store preview of prompt
        cards_generated: 0,
        successful: false,
        created_at: new Date().toISOString(),
      };

      const { data: generationData, error: generationError } = await this.supabase
        .from("generations")
        .insert(generationCmd)
        .select("id")
        .single();

      if (generationError || !generationData) {
        throw new Error(`Failed to create generation log: ${generationError?.message || "No ID returned"}`);
      }
      generationId = generationData.id;

      // 2. Call OpenRouter AI
      const aiResponse = await callOpenRouterAI(prompt, count);

      // 3. Extract candidates from AI response
      const candidates = aiResponse.candidates;
      const generatedCount = candidates.length;

      // 4. Update generation log (Success)
      const { error: updateError } = await this.supabase
        .from("generations")
        .update({
          successful: true,
          cards_generated: generatedCount,
          model_used: aiResponse.model || "unknown",
        })
        .eq("id", generationId);

      if (updateError) {
        // Continue despite update error, but log it
      }

      if (!generationId) {
        throw new Error("Generation ID not available");
      }
      return { candidates, generationId };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown generation error";
      const errorCode =
        error instanceof Error && "code" in error ? (error as Error & { code: string }).code : "GENERATION_FAILED";

      if (generationId) {
        // 5. Log error and update generation log (Failure)
        const errorCmd: CreateGenerationErrorLogCommand = {
          generation_id: generationId,
          error_message: errorMessage,
          error_code: errorCode,
          timestamp: new Date().toISOString(),
        };

        try {
          await this.supabase.from("generation_error_logs").insert(errorCmd);
          await this.supabase.from("generations").update({ successful: false }).eq("id", generationId);
        } catch {
          // Failed to log generation error
        }
      }

      // Rethrow the error to be handled by the API route
      throw new Error(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async acceptCandidates(
    userId: string,
    data: AcceptCandidatesInput
  ): Promise<{ accepted_count: number; flashcards: FlashcardDTO[] }> {
    const { generation_id, accepted_candidates } = data;

    try {
      // 1. Verify generation exists and belongs to user
      const { data: generation, error: genError } = await this.supabase
        .from("generations")
        .select("id, user_id, successful")
        .eq("id", generation_id)
        .eq("user_id", userId)
        .single();

      if (genError || !generation) {
        throw new Error("Generacja nie została znaleziona lub nie należy do użytkownika");
      }

      if (!generation.successful) {
        throw new Error("Nie można zaakceptować kandydatów z nieudanej generacji");
      }

      // 2. Convert candidates to flashcard commands
      const flashcardCommands: CreateFlashcardCommand[] = accepted_candidates.map((candidate) => ({
        user_id: userId,
        front: candidate.front,
        back: candidate.back,
        source: "ai" as const,
        created_at: new Date().toISOString(),
      }));

      // 3. Insert flashcards in batch
      const { data: insertedFlashcards, error: insertError } = await this.supabase
        .from("flashcards")
        .insert(flashcardCommands)
        .select();

      if (insertError || !insertedFlashcards) {
        throw new Error(`Nie udało się zapisać fiszek: ${insertError?.message || "Brak danych"}`);
      }

      // 4. Update generation log with accepted count
      const { error: updateError } = await this.supabase
        .from("generations")
        .update({
          cards_accepted: accepted_candidates.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", generation_id);

      if (updateError) {
        // Continue despite update error
        // Failed to update generation log - could log in production
      }

      // 5. Return DTOs
      const flashcardDTOs: FlashcardDTO[] = insertedFlashcards.map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }));

      return {
        accepted_count: accepted_candidates.length,
        flashcards: flashcardDTOs,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd podczas akceptowania kandydatów";
      throw new Error(errorMessage);
    }
  }
}
