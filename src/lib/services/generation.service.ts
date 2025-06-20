import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateGenerationCommand, CreateGenerationErrorLogCommand, FlashcardCandidateDTO } from "../../types";
import { callOpenRouterAI } from "../ai/openrouter";

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
        model_used: "unknown",
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
      throw new Error(`Generation failed: ${error.message}`);
    }
  }
}
