import { z } from "zod";

export const createFlashcardSchema = z.object({
  front: z.string().min(1, "Przód fiszki jest wymagany").max(200, "Przód fiszki nie może przekraczać 200 znaków"),
  back: z.string().min(1, "Tył fiszki jest wymagany").max(500, "Tył fiszki nie może przekraczać 500 znaków"),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
