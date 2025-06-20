# API Endpoint Implementation Plan: Update Flashcard (PUT /api/flashcards/{id})

## 1. Przegląd punktu końcowego

Endpoint umożliwia edycję istniejącej fiszki użytkownika. Pozwala na modyfikację treści przodu i tyłu fiszki z pełną walidacją danych i kontrolą dostępu.

## 2. Szczegóły żądania

- **Metoda HTTP**: PUT
- **Struktura URL**: `/api/flashcards/{id}`
- **Parametry URL**:
  - `id`: UUID fiszki (wymagane)
- **Nagłówki**:
  - `Content-Type: application/json`
  - Autoryzacja: automatycznie obsługiwana przez middleware Supabase
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "front": "Zaktualizowany przód fiszki",
      "back": "Zaktualizowany tył fiszki"
    }
    ```

## 3. Wykorzystywane typy

- **DTOs**:
  - `UpdateFlashcardRequestDTO` - Struktura danych wejściowych
  - `FlashcardDTO` - Struktura odpowiedzi (zaktualizowana fiszka)
- **Schematy walidacji**:
  - `updateFlashcardSchema` - walidacja treści przodu i tyłu

## 4. Szczegóły odpowiedzi

- **Status 200 OK**:
  ```json
  {
    "id": "uuid",
    "front": "Zaktualizowany przód fiszki",
    "back": "Zaktualizowany tył fiszki",
    "source": "manual",
    "generation_id": null,
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T15:30:00Z"
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
        "path": ["front"],
        "message": "Front text exceeds 200 characters"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to update flashcards"
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

1. Żądanie PUT trafia do endpointu `/api/flashcards/{id}`
2. Middleware Supabase weryfikuje autoryzację użytkownika
3. Handler ekstrahuje i waliduje ID z parametru URL
4. Handler parsuje i waliduje dane używając `updateFlashcardSchema`
5. Handler wywołuje `FlashcardService.updateFlashcard(userId, flashcardId, data)`
6. `FlashcardService`:
   a. Sprawdza czy fiszka istnieje i należy do użytkownika
   b. Aktualizuje fiszkę w bazie danych
   c. Zwraca zaktualizowaną fiszkę
7. Handler formatuje odpowiedź
8. Zwraca odpowiedź z kodem 200 OK

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Weryfikacja sesji użytkownika
- **Izolacja danych**: Możliwość edycji tylko własnych fiszek
- **Walidacja danych**: Sprawdzenie limitów znaków i formatu
- **UUID validation**: Sprawdzenie poprawności formatu ID

## 7. Obsługa błędów

- **400 Bad Request**: Błędy walidacji danych lub nieprawidłowy UUID
- **401 Unauthorized**: Brak ważnej sesji użytkownika
- **404 Not Found**: Fiszka nie istnieje lub nie należy do użytkownika
- **500 Internal Server Error**: Błędy bazy danych

## 8. Etapy wdrożenia

### 1. Utworzenie schematu walidacji

1. Dodaj do `src/lib/schemas/flashcard.schema.ts`:

   ```typescript
   export const updateFlashcardSchema = z.object({
     front: z.string().min(1, "Front content is required").max(200, "Front content cannot exceed 200 characters"),
     back: z.string().min(1, "Back content is required").max(500, "Back content cannot exceed 500 characters"),
   });

   export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
   ```

### 2. Rozszerzenie FlashcardService

1. Dodaj metodę do `src/lib/services/flashcard.service.ts`:

   ```typescript
   import type { UpdateFlashcardInput } from "../schemas/flashcard.schema";

   export class FlashcardService {
     // ... existing methods

     async updateFlashcard(userId: string, flashcardId: string, data: UpdateFlashcardInput): Promise<FlashcardDTO> {
       // Validate UUID format
       const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
       if (!uuidRegex.test(flashcardId)) {
         throw new Error("INVALID_UUID");
       }

       // First check if flashcard exists and belongs to user
       const { data: existingFlashcard, error: checkError } = await this.supabase
         .from("flashcards")
         .select("id")
         .eq("id", flashcardId)
         .eq("user_id", userId)
         .single();

       if (checkError || !existingFlashcard) {
         throw new Error("FLASHCARD_NOT_FOUND");
       }

       // Update the flashcard
       const { data: updatedFlashcard, error: updateError } = await this.supabase
         .from("flashcards")
         .update({
           front: data.front,
           back: data.back,
           updated_at: new Date().toISOString(),
         })
         .eq("id", flashcardId)
         .eq("user_id", userId)
         .select()
         .single();

       if (updateError) {
         throw new Error(`Failed to update flashcard: ${updateError.message}`);
       }

       if (!updatedFlashcard) {
         throw new Error("Update failed: No data returned");
       }

       return {
         id: updatedFlashcard.id,
         front: updatedFlashcard.front,
         back: updatedFlashcard.back,
         source: updatedFlashcard.source,
         generation_id: updatedFlashcard.generation_id,
         created_at: updatedFlashcard.created_at,
         updated_at: updatedFlashcard.updated_at,
       };
     }
   }
   ```

### 3. Rozszerzenie endpointu

1. Dodaj metodę PUT do `src/pages/api/flashcards/[id].ts`:

   ```typescript
   import { ZodError } from "zod";
   import { updateFlashcardSchema } from "../../../lib/schemas/flashcard.schema";

   // ... existing GET method

   export const PUT: APIRoute = async ({ params, request, locals }) => {
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({
           error: "Unauthorized",
           message: "You must be logged in to update flashcards",
         }),
         {
           status: 401,
           headers: { "Content-Type": "application/json" },
         }
       );
     }

     try {
       const flashcardId = params.id;

       if (!flashcardId) {
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             message: "Flashcard ID is required",
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       // Parse and validate request body
       let requestData;
       try {
         requestData = await request.json();
       } catch (parseError) {
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             message: "Invalid JSON in request body",
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       const validatedData = updateFlashcardSchema.parse(requestData);

       const flashcardService = new FlashcardService(supabase);
       const updatedFlashcard = await flashcardService.updateFlashcard(session.user.id, flashcardId, validatedData);

       return new Response(JSON.stringify(updatedFlashcard), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       if (error instanceof ZodError) {
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             message: "Invalid input data",
             details: error.errors,
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       if (error instanceof Error) {
         if (error.message === "INVALID_UUID") {
           return new Response(
             JSON.stringify({
               error: "Bad Request",
               message: "Invalid flashcard ID format",
             }),
             {
               status: 400,
               headers: { "Content-Type": "application/json" },
             }
           );
         }

         if (error.message === "FLASHCARD_NOT_FOUND") {
           return new Response(
             JSON.stringify({
               error: "Not Found",
               message: "Flashcard not found or access denied",
             }),
             {
               status: 404,
               headers: { "Content-Type": "application/json" },
             }
           );
         }
       }

       console.error("Error updating flashcard:", error);
       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           message: "Failed to update flashcard",
         }),
         {
           status: 500,
           headers: { "Content-Type": "application/json" },
         }
       );
     }
   };
   ```

### 4. Aktualizacja timestamp trigger

1. Upewnij się że trigger `handle_updated_at()` działa poprawnie
2. Przetestuj automatyczne ustawianie `updated_at`

### 5. Testowanie

1. Test prawidłowej aktualizacji fiszki
2. Test przekroczenia limitów znaków
3. Test aktualizacji nieistniejącej fiszki
4. Test aktualizacji cudzej fiszki
5. Test nieprawidłowego UUID
6. Test bez autoryzacji
7. Test pustych pól
8. Test automatycznego ustawiania updated_at
