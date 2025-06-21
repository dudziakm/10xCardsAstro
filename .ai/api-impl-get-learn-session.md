# API Endpoint Implementation Plan: Get Learning Session Card (GET /api/learn/session)

## 1. Przegląd punktu końcowego

Endpoint zwraca kolejną fiszkę do nauki w ramach sesji nauki. Wykorzystuje algorytm spaced repetition do wyboru optymalnej fiszki do powtórki. Endpoint zarządza stanem sesji nauki użytkownika i śledzi postępy.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/learn/session`
- **Parametry**:
  - **Opcjonalne**:
    - `session_id`: string - ID bieżącej sesji (jeśli brak, tworzy nową sesję)
- **Nagłówki**:
  - Autoryzacja: automatycznie obsługiwana przez middleware Supabase

## 3. Wykorzystywane typy

- **DTOs**:
  - `LearningSessionCardDTO` - Reprezentacja fiszki w sesji nauki
  - `SessionProgressDTO` - Informacje o postępie sesji
- **Entities**:
  - `LearningSession` - Encja sesji nauki (do utworzenia w bazie)
  - `FlashcardProgress` - Encja postępu nauki fiszki (do utworzenia w bazie)
- **Schematy walidacji**:
  - `getLearningSessionSchema` - do walidacji parametrów zapytania

## 4. Szczegóły odpowiedzi

- **Status 200 OK** (fiszka dostępna):
  ```json
  {
    "card": {
      "id": "uuid",
      "front": "Przód fiszki",
      "back": "Tył fiszki",
      "last_reviewed": "2024-03-19T10:00:00Z",
      "review_count": 5,
      "difficulty_rating": 3.2
    },
    "session": {
      "session_id": "uuid",
      "cards_reviewed": 12,
      "cards_remaining": 8,
      "session_start": "2024-03-19T09:30:00Z"
    }
  }
  ```
- **Status 200 OK** (brak fiszek do nauki):
  ```json
  {
    "card": null,
    "session": {
      "session_id": "uuid",
      "cards_reviewed": 20,
      "cards_remaining": 0,
      "session_start": "2024-03-19T09:30:00Z",
      "message": "No cards available for review"
    }
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to start a learning session"
  }
  ```

## 5. Przepływ danych

1. Żądanie GET trafia do endpointu `/api/learn/session`
2. Middleware Supabase weryfikuje autoryzację użytkownika
3. Endpoint sprawdza czy podano `session_id`:
   - Jeśli tak: weryfikuje czy sesja należy do użytkownika i jest aktywna
   - Jeśli nie: tworzy nową sesję nauki
4. Wywołanie `LearningService.getNextCard(userId, sessionId)`
5. `LearningService`:
   a. Pobiera fiszki użytkownika z uwzględnieniem:
   - Ostatniej daty przeglądu
   - Liczby przeglądów
   - Oceny trudności
     b. Stosuje algorytm spaced repetition do wyboru optymalnej fiszki
     c. Zapisuje informację o wyświetleniu fiszki w sesji
     d. Zwraca fiszkę i informacje o sesji
6. Handler formatuje odpowiedź
7. Zwraca odpowiedź z kodem 200 OK

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Weryfikacja sesji użytkownika
- **Izolacja danych**: Dostęp tylko do fiszek zalogowanego użytkownika
- **Walidacja sesji**: Sprawdzenie czy sesja należy do użytkownika

## 7. Obsługa błędów

- **401 Unauthorized**: Brak ważnej sesji użytkownika
- **400 Bad Request**: Nieprawidłowy format `session_id`
- **404 Not Found**: Nieistniejąca lub nieaktywna sesja
- **500 Internal Server Error**: Błędy bazy danych

## 8. Rozważania dotyczące wydajności

- **Algorytm wyboru**: Optymalizacja zapytania SQL dla algorytmu spaced repetition
- **Caching**: Cachowanie informacji o sesji w pamięci
- **Indeksy**: Indeksy na polach używanych w algorytmie (last_reviewed, difficulty_rating)

## 9. Etapy wdrożenia

### 1. Utworzenie tabel w bazie danych

1. Dodaj migrację dla nowych tabel:

   ```sql
   -- Tabela sesji nauki
   CREATE TABLE learning_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     ended_at TIMESTAMP WITH TIME ZONE,
     cards_reviewed INTEGER DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );

   -- Tabela postępu nauki fiszek
   CREATE TABLE flashcard_progress (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     flashcard_id UUID NOT NULL REFERENCES flashcards(id),
     last_reviewed TIMESTAMP WITH TIME ZONE,
     review_count INTEGER DEFAULT 0,
     difficulty_rating DECIMAL(3,2) DEFAULT 2.5,
     next_review_date TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(user_id, flashcard_id)
   );

   -- Indeksy
   CREATE INDEX idx_learning_sessions_user_active ON learning_sessions(user_id, is_active);
   CREATE INDEX idx_flashcard_progress_next_review ON flashcard_progress(user_id, next_review_date);
   ```

### 2. Utworzenie schematu walidacji

1. Stwórz `src/lib/schemas/learning.schema.ts`:

   ```typescript
   import { z } from "zod";

   export const getLearningSessionSchema = z.object({
     session_id: z.string().uuid().optional(),
   });

   export type GetLearningSessionInput = z.infer<typeof getLearningSessionSchema>;
   ```

### 3. Implementacja LearningService

1. Stwórz `src/lib/services/learning.service.ts`:

   ```typescript
   import type { SupabaseClient } from "../../db/supabase.client";

   export class LearningService {
     constructor(private supabase: SupabaseClient) {}

     async getNextCard(userId: string, sessionId?: string) {
       // Get or create session
       let session;
       if (sessionId) {
         const { data, error } = await this.supabase
           .from("learning_sessions")
           .select("*")
           .eq("id", sessionId)
           .eq("user_id", userId)
           .eq("is_active", true)
           .single();

         if (error || !data) {
           throw new Error("Session not found or inactive");
         }
         session = data;
       } else {
         // Create new session
         const { data, error } = await this.supabase
           .from("learning_sessions")
           .insert({ user_id: userId })
           .select()
           .single();

         if (error || !data) {
           throw new Error("Failed to create learning session");
         }
         session = data;
       }

       // Get next card using spaced repetition algorithm
       const { data: card } = await this.supabase
         .from("flashcards")
         .select(
           `
           *,
           flashcard_progress!left(
             last_reviewed,
             review_count,
             difficulty_rating
           )
         `
         )
         .eq("user_id", userId)
         .order("flashcard_progress.next_review_date", { ascending: true, nullsFirst: true })
         .limit(1)
         .single();

       // Update session stats
       if (card) {
         await this.supabase
           .from("learning_sessions")
           .update({
             cards_reviewed: session.cards_reviewed + 1,
             updated_at: new Date().toISOString(),
           })
           .eq("id", session.id);
       }

       // Get remaining cards count
       const { count } = await this.supabase
         .from("flashcards")
         .select("*", { count: "exact", head: true })
         .eq("user_id", userId);

       return {
         card: card
           ? {
               id: card.id,
               front: card.front,
               back: card.back,
               last_reviewed: card.flashcard_progress?.last_reviewed,
               review_count: card.flashcard_progress?.review_count || 0,
               difficulty_rating: card.flashcard_progress?.difficulty_rating || 2.5,
             }
           : null,
         session: {
           session_id: session.id,
           cards_reviewed: session.cards_reviewed + (card ? 1 : 0),
           cards_remaining: Math.max(0, (count || 0) - session.cards_reviewed - 1),
           session_start: session.started_at,
           message: !card ? "No cards available for review" : undefined,
         },
       };
     }
   }
   ```

### 4. Implementacja endpointu

1. Stwórz `src/pages/api/learn/session.ts`:

   ```typescript
   import type { APIRoute } from "astro";
   import { ZodError } from "zod";
   import { LearningService } from "../../../lib/services/learning.service";
   import { getLearningSessionSchema } from "../../../lib/schemas/learning.schema";

   export const GET: APIRoute = async ({ request, locals }) => {
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({
           error: "Unauthorized",
           message: "You must be logged in to start a learning session",
         }),
         { status: 401, headers: { "Content-Type": "application/json" } }
       );
     }

     try {
       const url = new URL(request.url);
       const params = {
         session_id: url.searchParams.get("session_id") || undefined,
       };

       const validatedParams = getLearningSessionSchema.parse(params);

       const learningService = new LearningService(supabase);
       const response = await learningService.getNextCard(session.user.id, validatedParams.session_id);

       return new Response(JSON.stringify(response), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       if (error instanceof ZodError) {
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             message: "Invalid parameters",
             details: error.errors,
           }),
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }

       if (error instanceof Error && error.message.includes("not found")) {
         return new Response(
           JSON.stringify({
             error: "Not Found",
             message: error.message,
           }),
           { status: 404, headers: { "Content-Type": "application/json" } }
         );
       }

       console.error("Error in GET /api/learn/session:", error);
       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           message: "Failed to get learning session",
         }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   };

   export const prerender = false;
   ```

### 5. Testowanie

1. Test tworzenia nowej sesji
2. Test kontynuacji istniejącej sesji
3. Test gdy brak fiszek do nauki
4. Test algorytmu wyboru kolejnej fiszki
5. Test izolacji danych między użytkownikami
