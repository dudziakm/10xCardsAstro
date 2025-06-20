// src/types.ts

import type { Database } from "./db/database.types";

// ----------------------------------------------------------------
// Aliases for base database types extracted from the Database model definitions
// ----------------------------------------------------------------
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// ----------------------------------------------------------------
// 1. Flashcard DTO
// ----------------------------------------------------------------
// Represents a flashcard as returned by the API endpoints (GET /flashcards, GET /flashcards/{id})
export type FlashcardDTO = Pick<Flashcard, "id" | "front" | "back" | "source" | "created_at" | "updated_at">;

// Flashcard source type
export type FlashcardSource = "manual" | "ai";

// ----------------------------------------------------------------
// 2. Pagination DTO
// ----------------------------------------------------------------
// Contains pagination details used in list responses
export interface PaginationDTO {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// ----------------------------------------------------------------
// 3. Success Response DTO
// ----------------------------------------------------------------
export interface SuccessResponseDTO {
  success: boolean;
}

// ----------------------------------------------------------------
// 4. Auth DTOs
// ----------------------------------------------------------------
export interface RegisterRequestDTO {
  email: string;
  password: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface ChangePasswordRequestDTO {
  current_password: string;
  new_password: string;
}

// ----------------------------------------------------------------
// 5. Flashcard Request DTOs
// ----------------------------------------------------------------
export interface CreateFlashcardRequestDTO {
  front: string; // max 200 chars
  back: string; // max 500 chars
}

export interface UpdateFlashcardRequestDTO {
  front: string; // max 200 chars
  back: string; // max 500 chars
}

export interface FlashcardListResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

export interface GenerateFlashcardsRequestDTO {
  prompt: string; // Text prompt for AI generation
  count?: number; // Number of flashcards to generate (default: 5)
}

export interface FlashcardCandidateDTO {
  front: string;
  back: string;
}

export interface GenerateFlashcardsResponseDTO {
  candidates: FlashcardCandidateDTO[];
  generation_id: string;
}

export interface SaveBatchFlashcardsRequestDTO {
  flashcards: FlashcardCandidateDTO[];
  generation_id: string;
}

export interface SaveBatchFlashcardsResponseDTO {
  saved_count: number;
  flashcards: FlashcardDTO[];
}

// ----------------------------------------------------------------
// 6. Learning Session DTOs
// ----------------------------------------------------------------
export interface LearningSessionCardDTO {
  id: string;
  front: string;
  back: string;
  last_reviewed?: string;
  review_count: number;
  difficulty_rating: number;
}

export interface SessionProgressDTO {
  session_id: string;
  cards_reviewed: number;
  cards_remaining: number;
  session_start: string;
  message?: string;
}

export interface GetLearningSessionResponseDTO {
  card: LearningSessionCardDTO | null;
  session: SessionProgressDTO;
}

export interface RateFlashcardRequestDTO {
  session_id: string;
  flashcard_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface RateFlashcardResponseDTO {
  flashcard_id: string;
  rating: number;
  next_review_date: string;
  review_count: number;
  difficulty_rating: number;
  session_progress: {
    cards_reviewed: number;
    session_duration_minutes: number;
  };
}

// ----------------------------------------------------------------
// 7. Generation DTOs
// ----------------------------------------------------------------
export type GenerationListItemDTO = Pick<Generation, "id" | "cards_generated" | "successful" | "created_at"> & {
  input_text_preview: string;
};

export interface GenerationListResponseDTO {
  data: GenerationListItemDTO[];
  pagination: PaginationDTO;
}

export type GenerationErrorLogDTO = Pick<GenerationErrorLog, "id" | "error_message" | "error_code" | "timestamp">;

export type GenerationDetailDTO = Pick<
  Generation,
  "id" | "input_text" | "cards_generated" | "successful" | "created_at"
> & {
  error_logs: GenerationErrorLogDTO[];
};

// ----------------------------------------------------------------
// 8. Command Models for database operations
// ----------------------------------------------------------------
export type CreateFlashcardCommand = Omit<FlashcardInsert, "front_tsv" | "back_tsv" | "deleted_at"> & {
  front: string; // max 200 chars
  back: string; // max 500 chars
};

export type UpdateFlashcardCommand = Pick<FlashcardInsert, "front" | "back"> & {
  updated_at?: string;
};

export type CreateGenerationCommand = Omit<Database["public"]["Tables"]["generations"]["Insert"], "deleted_at">;

export type CreateGenerationErrorLogCommand = Database["public"]["Tables"]["generation_error_logs"]["Insert"];
