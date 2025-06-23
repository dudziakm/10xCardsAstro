import { z } from 'zod';

const createFlashcardSchema = z.object({
  front: z.string().min(1, "Przód fiszki jest wymagany").max(200, "Przód fiszki nie może przekraczać 200 znaków"),
  back: z.string().min(1, "Tył fiszki jest wymagany").max(500, "Tył fiszki nie może przekraczać 500 znaków")
});
const listFlashcardsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  source: z.enum(["manual", "ai"]).optional(),
  sort: z.enum(["created_at", "updated_at"]).default("updated_at"),
  order: z.enum(["asc", "desc"]).default("desc")
}).transform((data) => ({
  ...data,
  source: data.source || void 0
  // Ensure undefined instead of empty string
}));
const updateFlashcardSchema = z.object({
  front: z.string().min(1, "Front content is required").max(200, "Front content cannot exceed 200 characters"),
  back: z.string().min(1, "Back content is required").max(500, "Back content cannot exceed 500 characters")
});

export { createFlashcardSchema as c, listFlashcardsSchema as l, updateFlashcardSchema as u };
