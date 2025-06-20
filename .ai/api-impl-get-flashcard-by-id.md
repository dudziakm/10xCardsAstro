# API Endpoint Implementation Plan: Get Flashcard by ID (GET /api/flashcards/{id})

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie szczegółów pojedynczej fiszki na podstawie jej ID. Zwraca pełne informacje o fiszce z dodatkowymi metadanymi, takimi jak statystyki nauki i historia modyfikacji.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards/{id}`
- **Parametry URL**:
  - `id`: UUID fiszki (wymagane)
- **Nagłówki**:
  - Autoryzacja: automatycznie obsługiwana przez middleware Supabase

## 3. Wykorzystywane typy
- **DTOs**:
  - `FlashcardDetailDTO` - Rozszerzona reprezentacja fiszki
  - `FlashcardProgressDTO` - Informacje o postępie nauki
- **Schematy walidacji**:
  - Walidacja UUID w parametrze URL

## 4. Szczegóły odpowiedzi
- **Status 200 OK**:
  ```json
  {
    "id": "uuid",
    "front": "Przód fiszki",
    "back": "Tył fiszki",
    "source": "manual",
    "generation_id": null,
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T12:00:00Z",
    "progress": {
      "review_count": 5,
      "difficulty_rating": 3.2,
      "last_reviewed": "2024-03-19T15:30:00Z",
      "next_review_date": "2024-03-22T15:30:00Z"
    }
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid flashcard ID format"
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to access flashcards"
  }
  ```
- **Status 404 Not Found**:
  ```json
  {
    "error": "Not Found",
    "message": "Flashcard not found or access denied"
  }
  ```

## 5. Przepływ danych
1. Żądanie GET trafia do endpointu `/api/flashcards/{id}`
2. Middleware Supabase weryfikuje autoryzację użytkownika
3. Handler ekstrahuje i waliduje ID z parametru URL
4. Handler wywołuje `FlashcardService.getFlashcardById(userId, flashcardId)`
5. `FlashcardService`:
   a. Pobiera fiszkę z bazy danych z warunkiem user_id
   b. Pobiera powiązane informacje o postępie nauki
   c. Łączy dane i formatuje odpowiedź
6. Handler zwraca sformatowaną odpowiedź

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Weryfikacja sesji użytkownika
- **Izolacja danych**: Dostęp tylko do fiszek zalogowanego użytkownika
- **UUID validation**: Sprawdzenie poprawności formatu ID

## 7. Obsługa błędów
- **400 Bad Request**: Nieprawidłowy format UUID
- **401 Unauthorized**: Brak ważnej sesji użytkownika
- **404 Not Found**: Fiszka nie istnieje lub nie należy do użytkownika
- **500 Internal Server Error**: Błędy bazy danych

## 8. Etapy wdrożenia

### 1. Rozszerzenie typów
1. Dodaj do `src/types.ts`:
   ```typescript
   export interface FlashcardDetailDTO extends FlashcardDTO {
     progress?: FlashcardProgressDTO;
   }

   export interface FlashcardProgressDTO {
     review_count: number;
     difficulty_rating: number;
     last_reviewed: string | null;
     next_review_date: string | null;
   }
   ```

### 2. Rozszerzenie FlashcardService
1. Dodaj metodę do `src/lib/services/flashcard.service.ts`:
   ```typescript
   async getFlashcardById(userId: string, flashcardId: string): Promise<FlashcardDetailDTO> {
     // Validate UUID format
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
     if (!uuidRegex.test(flashcardId)) {
       throw new Error('INVALID_UUID');
     }

     // Get flashcard with progress data
     const { data: flashcard, error } = await this.supabase
       .from('flashcards')
       .select(`
         id,
         front,
         back,
         source,
         generation_id,
         created_at,
         updated_at,
         flashcard_progress (
           review_count,
           difficulty_rating,
           last_reviewed,
           next_review_date
         )
       `)
       .eq('id', flashcardId)
       .eq('user_id', userId)
       .single();

     if (error) {
       if (error.code === 'PGRST116') {
         throw new Error('FLASHCARD_NOT_FOUND');
       }
       throw new Error(`Database error: ${error.message}`);
     }

     // Format response
     return {
       id: flashcard.id,
       front: flashcard.front,
       back: flashcard.back,
       source: flashcard.source,
       generation_id: flashcard.generation_id,
       created_at: flashcard.created_at,
       updated_at: flashcard.updated_at,
       progress: flashcard.flashcard_progress?.length > 0 ? {
         review_count: flashcard.flashcard_progress[0].review_count,
         difficulty_rating: flashcard.flashcard_progress[0].difficulty_rating,
         last_reviewed: flashcard.flashcard_progress[0].last_reviewed,
         next_review_date: flashcard.flashcard_progress[0].next_review_date,
       } : undefined,
     };
   }
   ```

### 3. Implementacja endpointu
1. Stwórz `src/pages/api/flashcards/[id].ts`:
   ```typescript
   import type { APIRoute } from 'astro';
   import { FlashcardService } from '../../../lib/services/flashcard.service';

   export const GET: APIRoute = async ({ params, locals }) => {
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({
           error: 'Unauthorized',
           message: 'You must be logged in to access flashcards',
         }),
         {
           status: 401,
           headers: { 'Content-Type': 'application/json' },
         }
       );
     }

     try {
       const flashcardId = params.id;
       
       if (!flashcardId) {
         return new Response(
           JSON.stringify({
             error: 'Bad Request',
             message: 'Flashcard ID is required',
           }),
           {
             status: 400,
             headers: { 'Content-Type': 'application/json' },
           }
         );
       }

       const flashcardService = new FlashcardService(supabase);
       const flashcard = await flashcardService.getFlashcardById(session.user.id, flashcardId);

       return new Response(JSON.stringify(flashcard), {
         status: 200,
         headers: { 'Content-Type': 'application/json' },
       });

     } catch (error) {
       if (error instanceof Error) {
         if (error.message === 'INVALID_UUID') {
           return new Response(
             JSON.stringify({
               error: 'Bad Request',
               message: 'Invalid flashcard ID format',
             }),
             {
               status: 400,
               headers: { 'Content-Type': 'application/json' },
             }
           );
         }

         if (error.message === 'FLASHCARD_NOT_FOUND') {
           return new Response(
             JSON.stringify({
               error: 'Not Found',
               message: 'Flashcard not found or access denied',
             }),
             {
               status: 404,
               headers: { 'Content-Type': 'application/json' },
             }
           );
         }
       }

       console.error('Error getting flashcard:', error);
       return new Response(
         JSON.stringify({
           error: 'Internal Server Error',
           message: 'Failed to retrieve flashcard',
         }),
         {
           status: 500,
           headers: { 'Content-Type': 'application/json' },
         }
       );
     }
   };

   export const prerender = false;
   ```

### 4. Testowanie
1. Test pobierania istniejącej fiszki
2. Test pobierania nieistniejącej fiszki
3. Test dostępu do cudzej fiszki
4. Test nieprawidłowego UUID
5. Test bez autoryzacji
6. Test fiszki z danymi postępu nauki