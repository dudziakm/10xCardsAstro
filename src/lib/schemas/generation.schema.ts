import { z } from 'zod';

export const generateFlashcardsSchema = z.object({
  prompt: z.string()
    .min(10, "Prompt musi mieć co najmniej 10 znaków")
    .max(5000, "Prompt nie może przekraczać 5000 znaków"),
  count: z.number()
    .int()
    .min(1, "Minimalna liczba fiszek to 1")
    .max(20, "Maksymalna liczba fiszek to 20")
    .default(5)
    .optional()
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;