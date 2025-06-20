# API Endpoint Implementation Plan: Accept Flashcard Candidates (POST /api/flashcards/accept)

## 1. Przegląd punktu końcowego
Endpoint umożliwia akceptację wybranych kandydatów na fiszki wygenerowanych przez AI. Użytkownik może zaakceptować wszystkie lub wybrane kandydaty, które następnie są zapisywane jako faktyczne fiszki w bazie danych. Endpoint powiązuje zapisane fiszki z wcześniejszym zadaniem generacji.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards/accept`
- **Nagłówki**:
  - `Content-Type: application/json`
  - Autoryzacja: Obsługiwana przez middleware Supabase
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "generation_id": "uuid",
      "accepted_candidates": [
        {
          "front": "string (max 200 znaków)",
          "back": "string (max 500 znaków)"
        }
      ]
    }
    ```

## 3. Wykorzystywane typy
- **DTOs**:
  - `AcceptFlashcardsRequestDTO` - Struktura danych wejściowych
  - `AcceptFlashcardsResponseDTO` - Struktura odpowiedzi
  - `FlashcardDTO` - Reprezentacja zapisanej fiszki
- **Command Models**:
  - `CreateFlashcardCommand` - Do tworzenia fiszek w bazie
- **Schematy walidacji**:
  - Nowy schemat `acceptFlashcardsSchema` do walidacji danych wejściowych

## 4. Szczegóły odpowiedzi
- **Status 201 Created**:
  ```json
  {
    "flashcards": [
      {
        "id": "uuid",
        "front": "Zaakceptowany awers",
        "back": "Zaakceptowany rewers",
        "source": "ai",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "accepted_count": 3,
    "generation_id": "uuid"
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid input data",
    "details": [
      {
        "code": "too_big",
        "maximum": 200,
        "type": "string",
        "inclusive": true,
        "path": ["accepted_candidates", 0, "front"],
        "message": "Front text exceeds 200 characters"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to accept flashcards"
  }
  ```
- **Status 404 Not Found**:
  ```json
  {
    "error": "Not Found",
    "message": "Generation not found or does not belong to the user"
  }
  ```

## 5. Przepływ danych
1. Żądanie POST trafia do endpointu `/api/flashcards/accept`
2. Middleware Supabase weryfikuje sesję użytkownika
3. Handler parsuje i waliduje ciało żądania używając `acceptFlashcardsSchema`
4. Handler weryfikuje, czy `generation_id` istnieje i należy do użytkownika
5. Handler wywołuje `FlashcardService.acceptCandidates(userId, generationId, acceptedCandidates)`
6. `FlashcardService`:
   a. Weryfikuje ponownie `generation_id` i przynależność do użytkownika
   b. Dla każdego kandydata tworzy wpis w tabeli `flashcards` z `source: 'ai'`
   c. Aktualizuje wpis w tabeli `generations` z finalnymi statystykami
   d. Zwraca listę utworzonych fiszek
7. Handler formatuje odpowiedź jako `AcceptFlashcardsResponseDTO`
8. Zwraca odpowiedź z kodem 201 Created

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Weryfikacja sesji użytkownika przez middleware
- **Własność danych**: Sprawdzenie czy `generation_id` należy do zalogowanego użytkownika
- **Walidacja danych**: Rygorystyczne sprawdzanie limitów znaków dla front/back
- **Zapobieganie duplikatom**: Rozważenie mechanizmu zapobiegającego wielokrotnemu zaakceptowaniu tych samych kandydatów

## 7. Obsługa błędów
- **400 Bad Request**: Błędy walidacji (przekroczenie limitów znaków, brak wymaganych pól)
- **401 Unauthorized**: Brak lub nieważna sesja użytkownika
- **404 Not Found**: Nieistniejący lub nieprzynależący do użytkownika `generation_id`
- **500 Internal Server Error**: Błędy bazy danych podczas zapisywania fiszek

## 8. Rozważania dotyczące wydajności
- **Batch insert**: Zapisywanie wszystkich zaakceptowanych fiszek w jednej operacji
- **Transakcyjność**: Użycie transakcji do zapewnienia spójności danych
- **Limit kandydatów**: Maksymalnie 10 kandydatów zgodnie z limitem generacji

## 9. Etapy wdrożenia

### 1. Utworzenie schematu walidacji
1. Dodaj do `src/lib/schemas/flashcard.schema.ts`:
   ```typescript
   export const acceptFlashcardsSchema = z.object({
     generation_id: z.string().uuid(),
     accepted_candidates: z.array(
       z.object({
         front: z.string().min(1).max(200),
         back: z.string().min(1).max(500),
       })
     ).min(1).max(10),
   });
   
   export type AcceptFlashcardsInput = z.infer<typeof acceptFlashcardsSchema>;
   ```

### 2. Rozszerzenie FlashcardService
1. Dodaj metodę `acceptCandidates` do `FlashcardService`:
   ```typescript
   async acceptCandidates(
     userId: string,
     generationId: string,
     candidates: Array<{ front: string; back: string }>
   ): Promise<AcceptFlashcardsResponseDTO> {
     // Verify generation ownership
     const { data: generation, error: genError } = await this.supabase
       .from('generations')
       .select('id, user_id')
       .eq('id', generationId)
       .eq('user_id', userId)
       .single();
     
     if (genError || !generation) {
       throw new Error('Generation not found or does not belong to the user');
     }
     
     // Prepare flashcards for batch insert
     const flashcardsToInsert = candidates.map(candidate => ({
       user_id: userId,
       front: candidate.front,
       back: candidate.back,
       source: 'ai' as const,
       generation_id: generationId,
     }));
     
     // Insert flashcards
     const { data: insertedFlashcards, error: insertError } = await this.supabase
       .from('flashcards')
       .insert(flashcardsToInsert)
       .select();
     
     if (insertError) {
       throw new Error(`Failed to create flashcards: ${insertError.message}`);
     }
     
     // Update generation statistics
     await this.supabase
       .from('generations')
       .update({ 
         cards_accepted: candidates.length,
         updated_at: new Date().toISOString()
       })
       .eq('id', generationId);
     
     return {
       flashcards: insertedFlashcards,
       accepted_count: insertedFlashcards.length,
       generation_id: generationId,
     };
   }
   ```

### 3. Implementacja endpointu
1. Stwórz plik `src/pages/api/flashcards/accept.ts`:
   ```typescript
   import type { APIRoute } from 'astro';
   import { ZodError } from 'zod';
   import { FlashcardService } from '../../../lib/services/flashcard.service';
   import { acceptFlashcardsSchema } from '../../../lib/schemas/flashcard.schema';
   
   export const POST: APIRoute = async ({ request, locals }) => {
     const { supabase, session } = locals;
   
     if (!session) {
       return new Response(
         JSON.stringify({ 
           error: 'Unauthorized', 
           message: 'You must be logged in to accept flashcards' 
         }),
         { status: 401, headers: { 'Content-Type': 'application/json' } }
       );
     }
   
     try {
       const requestData = await request.json();
       const validatedData = acceptFlashcardsSchema.parse(requestData);
       
       const flashcardService = new FlashcardService(supabase);
       const response = await flashcardService.acceptCandidates(
         session.user.id,
         validatedData.generation_id,
         validatedData.accepted_candidates
       );
       
       return new Response(JSON.stringify(response), {
         status: 201,
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
       
       console.error('Error in POST /api/flashcards/accept:', error);
       return new Response(
         JSON.stringify({ 
           error: 'Internal Server Error', 
           message: 'Failed to accept flashcards' 
         }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };
   
   export const prerender = false;
   ```

### 4. Testowanie
1. Test akceptacji wybranych kandydatów
2. Test przekroczenia limitów znaków
3. Test z nieistniejącym `generation_id`
4. Test próby akceptacji cudzego `generation_id`
5. Test pustej listy kandydatów