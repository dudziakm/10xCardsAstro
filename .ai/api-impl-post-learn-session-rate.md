# API Endpoint Implementation Plan: Rate Flashcard Knowledge (POST /api/learn/session/rate)

## 1. Przegląd punktu końcowego
Endpoint przyjmuje ocenę znajomości fiszki od użytkownika w trakcie sesji nauki. Aktualizuje postęp nauki dla danej fiszki, oblicza następną datę przeglądu według algorytmu spaced repetition i zapisuje statystyki sesji nauki.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/learn/session/rate`
- **Nagłówki**:
  - `Content-Type: application/json`
  - Autoryzacja: Obsługiwana przez middleware Supabase
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "session_id": "uuid",
      "flashcard_id": "uuid",
      "rating": 1 | 2 | 3 | 4 | 5
    }
    ```

## 3. Wykorzystywane typy
- **DTOs**:
  - `RateFlashcardRequestDTO` - Struktura danych wejściowych
  - `RateFlashcardResponseDTO` - Struktura odpowiedzi
- **Command Models**:
  - `UpdateFlashcardProgressCommand` - Do aktualizacji postępu fiszki
- **Schematy walidacji**:
  - `rateFlashcardSchema` - do walidacji danych wejściowych

## 4. Znaczenie ocen
- **1** - Nie pamiętam wcale (następny przegląd za 1 dzień)
- **2** - Pamiętam słabo (następny przegląd za 2 dni)
- **3** - Pamiętam przeciętnie (następny przegląd za 4 dni)
- **4** - Pamiętam dobrze (następny przegląd za 7 dni)
- **5** - Pamiętam bardzo dobrze (następny przegląd za 14 dni)

## 5. Szczegóły odpowiedzi
- **Status 200 OK**:
  ```json
  {
    "flashcard_id": "uuid",
    "rating": 4,
    "next_review_date": "2024-03-26T10:00:00Z",
    "review_count": 6,
    "difficulty_rating": 3.1,
    "session_progress": {
      "cards_reviewed": 13,
      "session_duration_minutes": 25
    }
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid input data",
    "details": [
      {
        "code": "invalid_enum_value",
        "options": [1, 2, 3, 4, 5],
        "path": ["rating"],
        "message": "Rating must be between 1 and 5"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to rate flashcards"
  }
  ```
- **Status 404 Not Found**:
  ```json
  {
    "error": "Not Found",
    "message": "Session or flashcard not found"
  }
  ```

## 6. Przepływ danych
1. Żądanie POST trafia do endpointu `/api/learn/session/rate`
2. Middleware Supabase weryfikuje sesję użytkownika
3. Handler parsuje i waliduje ciało żądania używając `rateFlashcardSchema`
4. Handler wywołuje `LearningService.rateFlashcard(userId, sessionId, flashcardId, rating)`
5. `LearningService`:
   a. Weryfikuje czy sesja i fiszka należą do użytkownika
   b. Pobiera lub tworzy rekord postępu dla fiszki
   c. Aktualizuje statystyki fiszki (review_count, difficulty_rating)
   d. Oblicza następną datę przeglądu według algorytmu spaced repetition
   e. Zapisuje/aktualizuje rekord w `flashcard_progress`
   f. Aktualizuje statystyki sesji nauki
   g. Zwraca zaktualizowane informacje
6. Handler formatuje odpowiedź
7. Zwraca odpowiedź z kodem 200 OK

## 7. Algorytm spaced repetition
```typescript
function calculateNextReviewDate(rating: number, reviewCount: number, currentDifficulty: number): Date {
  const baseIntervals = {
    1: 1,    // 1 dzień
    2: 2,    // 2 dni
    3: 4,    // 4 dni
    4: 7,    // 7 dni
    5: 14    // 14 dni
  };
  
  const difficultyMultiplier = Math.max(0.5, Math.min(2.0, currentDifficulty / 2.5));
  const reviewMultiplier = Math.min(3.0, 1 + (reviewCount * 0.1));
  
  const interval = baseIntervals[rating] * difficultyMultiplier * reviewMultiplier;
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + Math.round(interval));
  
  return nextReview;
}

function updateDifficultyRating(currentRating: number, userRating: number): number {
  const adjustment = (userRating - 3) * 0.1;
  return Math.max(1.0, Math.min(5.0, currentRating + adjustment));
}
```

## 8. Względy bezpieczeństwa
- **Autoryzacja**: Weryfikacja sesji użytkownika
- **Własność danych**: Sprawdzenie czy sesja i fiszka należą do użytkownika
- **Walidacja oceny**: Ograniczenie do wartości 1-5

## 9. Obsługa błędów
- **400 Bad Request**: Nieprawidłowa ocena (poza zakresem 1-5)
- **401 Unauthorized**: Brak lub nieważna sesja użytkownika
- **404 Not Found**: Nieistniejąca sesja lub fiszka
- **500 Internal Server Error**: Błędy bazy danych

## 10. Rozważania dotyczące wydajności
- **Upsert operation**: Efektywne tworzenie/aktualizacja rekordów postępu
- **Indeksy**: Indeksy na często używanych polach
- **Batch updates**: Możliwość grupowania operacji

## 11. Etapy wdrożenia

### 1. Utworzenie schematu walidacji
1. Dodaj do `src/lib/schemas/learning.schema.ts`:
   ```typescript
   export const rateFlashcardSchema = z.object({
     session_id: z.string().uuid(),
     flashcard_id: z.string().uuid(),
     rating: z.number().int().min(1).max(5),
   });
   
   export type RateFlashcardInput = z.infer<typeof rateFlashcardSchema>;
   ```

### 2. Rozszerzenie LearningService
1. Dodaj metodę `rateFlashcard` do `LearningService`:
   ```typescript
   async rateFlashcard(
     userId: string,
     sessionId: string,
     flashcardId: string,
     rating: number
   ): Promise<RateFlashcardResponseDTO> {
     // Verify session belongs to user
     const { data: session, error: sessionError } = await this.supabase
       .from('learning_sessions')
       .select('*')
       .eq('id', sessionId)
       .eq('user_id', userId)
       .eq('is_active', true)
       .single();
     
     if (sessionError || !session) {
       throw new Error('Session not found or inactive');
     }
     
     // Verify flashcard belongs to user
     const { data: flashcard, error: flashcardError } = await this.supabase
       .from('flashcards')
       .select('*')
       .eq('id', flashcardId)
       .eq('user_id', userId)
       .single();
     
     if (flashcardError || !flashcard) {
       throw new Error('Flashcard not found');
     }
     
     // Get or create progress record
     const { data: existingProgress } = await this.supabase
       .from('flashcard_progress')
       .select('*')
       .eq('user_id', userId)
       .eq('flashcard_id', flashcardId)
       .single();
     
     const currentDifficulty = existingProgress?.difficulty_rating || 2.5;
     const reviewCount = (existingProgress?.review_count || 0) + 1;
     
     // Calculate new values
     const newDifficultyRating = this.updateDifficultyRating(currentDifficulty, rating);
     const nextReviewDate = this.calculateNextReviewDate(rating, reviewCount, newDifficultyRating);
     
     // Upsert progress record
     const progressData = {
       user_id: userId,
       flashcard_id: flashcardId,
       last_reviewed: new Date().toISOString(),
       review_count: reviewCount,
       difficulty_rating: newDifficultyRating,
       next_review_date: nextReviewDate.toISOString(),
       updated_at: new Date().toISOString(),
     };
     
     const { error: upsertError } = await this.supabase
       .from('flashcard_progress')
       .upsert(progressData);
     
     if (upsertError) {
       throw new Error(`Failed to update progress: ${upsertError.message}`);
     }
     
     // Update session statistics
     const sessionDuration = Math.round(
       (new Date().getTime() - new Date(session.started_at).getTime()) / (1000 * 60)
     );
     
     return {
       flashcard_id: flashcardId,
       rating,
       next_review_date: nextReviewDate.toISOString(),
       review_count: reviewCount,
       difficulty_rating: newDifficultyRating,
       session_progress: {
         cards_reviewed: session.cards_reviewed,
         session_duration_minutes: sessionDuration,
       },
     };
   }
   
   private calculateNextReviewDate(rating: number, reviewCount: number, currentDifficulty: number): Date {
     const baseIntervals = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 };
     const difficultyMultiplier = Math.max(0.5, Math.min(2.0, currentDifficulty / 2.5));
     const reviewMultiplier = Math.min(3.0, 1 + (reviewCount * 0.1));
     const interval = baseIntervals[rating] * difficultyMultiplier * reviewMultiplier;
     
     const nextReview = new Date();
     nextReview.setDate(nextReview.getDate() + Math.round(interval));
     return nextReview;
   }
   
   private updateDifficultyRating(currentRating: number, userRating: number): number {
     const adjustment = (userRating - 3) * 0.1;
     return Math.max(1.0, Math.min(5.0, currentRating + adjustment));
   }
   ```

### 3. Implementacja endpointu
1. Stwórz `src/pages/api/learn/session/rate.ts`:
   ```typescript
   import type { APIRoute } from 'astro';
   import { ZodError } from 'zod';
   import { LearningService } from '../../../../lib/services/learning.service';
   import { rateFlashcardSchema } from '../../../../lib/schemas/learning.schema';

   export const POST: APIRoute = async ({ request, locals }) => {
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({ 
           error: 'Unauthorized', 
           message: 'You must be logged in to rate flashcards' 
         }),
         { status: 401, headers: { 'Content-Type': 'application/json' } }
       );
     }

     try {
       const requestData = await request.json();
       const validatedData = rateFlashcardSchema.parse(requestData);

       const learningService = new LearningService(supabase);
       const response = await learningService.rateFlashcard(
         session.user.id,
         validatedData.session_id,
         validatedData.flashcard_id,
         validatedData.rating
       );

       return new Response(JSON.stringify(response), {
         status: 200,
         headers: { 'Content-Type': 'application/json' },
       });

     } catch (error) {
       if (error instanceof ZodError) {
         return new Response(
           JSON.stringify({ 
             error: 'Bad Request', 
             message: 'Invalid input data', 
             details: error.errors 
           }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       if (error instanceof Error && error.message.includes('not found')) {
         return new Response(
           JSON.stringify({ 
             error: 'Not Found', 
             message: error.message 
           }),
           { status: 404, headers: { 'Content-Type': 'application/json' } }
         );
       }

       console.error('Error in POST /api/learn/session/rate:', error);
       return new Response(
         JSON.stringify({ 
           error: 'Internal Server Error', 
           message: 'Failed to rate flashcard' 
         }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };

   export const prerender = false;
   ```

### 4. Testowanie
1. Test oceniania fiszki (wszystkie wartości 1-5)
2. Test algorytmu spaced repetition
3. Test aktualizacji difficulty_rating
4. Test z nieistniejącą sesją/fiszką
5. Test obliczania czasu trwania sesji