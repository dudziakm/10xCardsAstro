import { z } from "zod";

export const createFlashcardSchema = z.object({
  front: z.string().min(1, "Przód fiszki jest wymagany").max(200, "Przód fiszki nie może przekraczać 200 znaków"),
  back: z.string().min(1, "Tył fiszki jest wymagany").max(500, "Tył fiszki nie może przekraczać 500 znaków"),
});

export const listFlashcardsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  source: z.enum(['manual', 'ai']).optional(),
  sort: z.enum(['created_at', 'updated_at']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const updateFlashcardSchema = z.object({
  front: z
    .string()
    .min(1, 'Front content is required')
    .max(200, 'Front content cannot exceed 200 characters'),
  back: z
    .string()
    .min(1, 'Back content is required')
    .max(500, 'Back content cannot exceed 500 characters'),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type ListFlashcardsInput = z.infer<typeof listFlashcardsSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
