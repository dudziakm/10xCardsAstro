import { z } from "zod";

export const getLearningSessionSchema = z.object({
  session_id: z.string().uuid().optional(),
});

export const rateFlashcardSchema = z.object({
  session_id: z.string().uuid(),
  flashcard_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

export type GetLearningSessionInput = z.infer<typeof getLearningSessionSchema>;
export type RateFlashcardInput = z.infer<typeof rateFlashcardSchema>;
