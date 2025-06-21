import { z } from "zod";

export const generateFlashcardsSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt musi mieć co najmniej 10 znaków")
    .max(5000, "Prompt nie może przekraczać 5000 znaków"),
  count: z
    .number()
    .int()
    .min(1, "Minimalna liczba fiszek to 1")
    .max(20, "Maksymalna liczba fiszek to 20")
    .default(5)
    .optional(),
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

export const acceptCandidatesSchema = z.object({
  generation_id: z.string().uuid("Nieprawidłowy ID generacji"),
  accepted_candidates: z.array(z.object({
    front: z.string().min(1, "Przód fiszki nie może być pusty"),
    back: z.string().min(1, "Tył fiszki nie może być pusty"),
    difficulty: z.number().int().min(1).max(5).default(3).optional(),
  })).min(1, "Musisz wybrać co najmniej jedną fiszkę")
});

export type AcceptCandidatesInput = z.infer<typeof acceptCandidatesSchema>;
