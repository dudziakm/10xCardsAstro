import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, FlashcardDTO } from "../../types";
import { createFlashcardSchema } from "../schemas/flashcard.schema";

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async createFlashcard(userId: string, data: unknown): Promise<FlashcardDTO> {
    console.log("Creating flashcard for user:", userId);
    console.log("Input data:", JSON.stringify(data));

    try {
      // Validate input
      const validatedData = createFlashcardSchema.parse(data);
      console.log("Validated data:", JSON.stringify(validatedData));

      // Prepare command
      const command: CreateFlashcardCommand = {
        user_id: userId,
        front: validatedData.front,
        back: validatedData.back,
        source: "manual",
      };
      console.log("Command to insert:", JSON.stringify(command));

      // Insert into database
      console.log("Making Supabase request...");
      const { data: flashcard, error } = await this.supabase.from("flashcards").insert(command).select().single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to create flashcard: ${error.message}`);
      }

      if (!flashcard) {
        console.error("No flashcard returned from insert");
        throw new Error("No data returned from database after insert");
      }

      console.log("Flashcard created successfully:", flashcard.id);

      // Return as DTO
      return {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      };
    } catch (error) {
      console.error("Error in createFlashcard:", error);
      throw error;
    }
  }
}
