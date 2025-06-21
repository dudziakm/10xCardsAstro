# API Endpoint Implementation Plan: Generate Flashcards (POST /api/flashcards/generate)

## 1. Przegląd punktu końcowego

Endpoint ten przyjmuje blok tekstu i wykorzystuje zewnętrzną usługę AI (OpenRouter.ai) do wygenerowania propozycji fiszek (front/back). Proces obejmuje logowanie próby generacji w bazie danych oraz zwrócenie wygenerowanych kandydatów wraz z unikalnym identyfikatorem zadania generacji.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards/generate`
- **Nagłówki**:
  - `Content-Type: application/json`
  - Autoryzacja: Obsługiwana przez middleware Supabase
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "input_text": "string (1000-10000 znaków)"
    }
    ```

## 3. Wykorzystywane typy

- **DTOs**:
  - `GenerateFlashcardsRequestDTO` (`src/types.ts`) - Struktura danych wejściowych żądania.
  - `GenerateFlashcardsResponseDTO` (`src/types.ts`) - Struktura danych odpowiedzi.
  - `FlashcardCandidateDTO` (`src/types.ts`) - Reprezentacja pojedynczego kandydata na fiszkę.
- **Command Models**:
  - `CreateGenerationCommand` (`src/types.ts`) - Do zapisu informacji o zadaniu generacji w tabeli `generations`.
  - `CreateGenerationErrorLogCommand` (`src/types.ts`) - Do zapisu błędów w tabeli `generation_error_logs`.
- **Schematy walidacji**:
  - Nowy schemat `generateFlashcardsSchema` do walidacji `GenerateFlashcardsRequestDTO`.

## 4. Szczegóły odpowiedzi

- **Status 200 OK**:
  ```json
  {
    "candidates": [
      {
        "front": "Wygenerowany awers 1",
        "back": "Wygenerowany rewers 1"
      },
      {
        "front": "Wygenerowany awers 2",
        "back": "Wygenerowany rewers 2"
      }
    ],
    "generation_id": "uuid-identyfikator-generacji"
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid input data",
    "details": [
      {
        "code": "too_small" | "too_big",
        "minimum"?: 1000,
        "maximum"?: 10000,
        "type": "string",
        "inclusive"?: true,
        "exact"?: false,
        "path": ["input_text"],
        "message": "Input text must be between 1000 and 10000 characters long"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to generate flashcards"
  }
  ```
- **Status 500 Internal Server Error**:
  ```json
  {
    "error": "Internal Server Error",
    "message": "Failed to generate flashcards due to an internal error.",
    // Opcjonalnie, ID błędu do śledzenia logów
    "error_id": "uuid-identyfikator-bledu-w-logach"
  }
  ```

## 5. Przepływ danych

1. Żądanie POST trafia do endpointu `/api/flashcards/generate`.
2. Middleware Supabase weryfikuje sesję użytkownika.
3. Handler endpointu parsuje i waliduje ciało żądania (`input_text`) używając `generateFlashcardsSchema`.
4. Handler wywołuje nową usługę `GenerationService.generateCandidates(userId, inputText)`.
5. `GenerationService`:
   a. Tworzy wpis w tabeli `generations` (z `successful: false`, `cards_generated: 0`), pobiera `generation_id`.
   b. Łączy się z API OpenRouter.ai, przekazując `inputText` i odpowiedni prompt.
   c. Oczekuje na odpowiedź od AI.
   d. **W przypadku błędu AI/sieci**: Loguje błąd w `generation_error_logs` (z `generation_id`), aktualizuje wpis w `generations` (`successful: false`), rzuca wyjątek.
   e. **W przypadku sukcesu AI**: Parsuje odpowiedź, ekstrahuje kandydatów na fiszki (`FlashcardCandidateDTO`).
   f. **W przypadku błędu parsowania**: Loguje błąd w `generation_error_logs`, aktualizuje wpis w `generations` (`successful: false`), rzuca wyjątek.
   g. Aktualizuje wpis w `generations` (`successful: true`, `cards_generated: <liczba_kandydatow>`).
   h. Zwraca `generation_id` i listę `candidates`.
6. Handler endpointu otrzymuje wynik z `GenerationService`.
7. Handler formatuje odpowiedź jako `GenerateFlashcardsResponseDTO`.
8. Zwraca odpowiedź z kodem 200 OK.
9. **Obsługa błędów w Handlerze**: Jeśli `GenerationService` rzuci wyjątek, handler loguje błąd i zwraca odpowiedź 500 Internal Server Error. Błędy walidacji zwracają 400 Bad Request. Błędy autoryzacji zwracają 401 Unauthorized.

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Tylko zalogowani użytkownicy mogą korzystać z endpointu (zapewnione przez middleware).
- **Walidacja danych wejściowych**: Rygorystyczne sprawdzanie długości `input_text` (1000-10000 znaków) chroni przed nadużyciami i nadmiernymi kosztami AI.
- **Zarządzanie kluczem API**: Klucz do OpenRouter.ai musi być przechowywany bezpiecznie po stronie serwera (zmienne środowiskowe) i nigdy nie być ujawniony klientowi.
- **Kontrola kosztów**: Śledzenie użycia AI za pomocą tabeli `generations`. Rozważenie wprowadzenia limitów (rate limiting, quota per user) w przyszłości, jeśli zajdzie potrzeba.
- **Ochrona przed Prompt Injection**: Standardowy prompt powinien być używany, unikając włączania nieoczyszczonych danych użytkownika do struktury promptu (poza samym `input_text` jako treścią do analizy).

## 7. Obsługa błędów

- **400 Bad Request**: Błędy walidacji Zod dla `input_text` (brak, zły typ, zła długość).
- **401 Unauthorized**: Brak lub nieważna sesja użytkownika.
- **500 Internal Server Error**:
  - Błędy komunikacji z bazą danych (zapis/aktualizacja `generations`, zapis `generation_error_logs`).
  - Błędy komunikacji z API OpenRouter.ai (timeout, błędy sieciowe, błędy API 5xx).
  - Błędy zwrócone przez model AI w OpenRouter.ai.
  - Błędy parsowania odpowiedzi z OpenRouter.ai.
  - Inne nieprzewidziane błędy serwera.
  - Każdy błąd 500 powinien być logowany po stronie serwera z jak największą ilością szczegółów. Błędy związane z AI powinny być dodatkowo logowane w `generation_error_logs`.

## 8. Rozważania dotyczące wydajności

- **Czas odpowiedzi AI**: Generowanie przez AI może zająć kilka/kilkanaście sekund. Endpoint jest synchroniczny, więc klient będzie musiał poczekać. Rozważyć w przyszłości implementację asynchroniczną (np. przez WebSockets lub polling), jeśli czas odpowiedzi będzie zbyt długi dla UX.
- **Rozmiar odpowiedzi AI**: Odpowiedź z AI może być duża. Należy upewnić się, że parsing jest wydajny.
- **Obciążenie bazy danych**: Dwa zapisy (insert `generations`, insert `generation_error_logs`) i jedna aktualizacja (`generations`) na żądanie. Przy dużym ruchu może to stanowić obciążenie. Indeksy na `generation_id` w `generation_error_logs` oraz na `user_id` w `generations` są kluczowe.

## 9. Etapy wdrożenia

### 1. Konfiguracja środowiska

1. Dodaj klucz API OpenRouter.ai do zmiennych środowiskowych serwera (np. `OPENROUTER_API_KEY` w `.env`).
2. Upewnij się, że `import.meta.env.OPENROUTER_API_KEY` jest dostępne w kodzie Astro po stronie serwera.

### 2. Utworzenie schematu walidacji

1. Stwórz lub zaktualizuj plik dla schematów Zod, np. `src/lib/schemas/generation.schema.ts` (lub dodaj do `flashcard.schema.ts`):

   ```typescript
   // src/lib/schemas/generation.schema.ts
   import { z } from "zod";

   export const generateFlashcardsSchema = z.object({
     input_text: z
       .string()
       .min(1000, "Tekst wejściowy musi mieć co najmniej 1000 znaków")
       .max(10000, "Tekst wejściowy nie może przekraczać 10000 znaków"),
   });

   export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;
   ```

### 3. Implementacja usługi GenerationService

1. Stwórz plik `src/lib/services/generation.service.ts`.
2. Zaimplementuj klasę `GenerationService`:

   ```typescript
   import type { SupabaseClient } from "../../db/supabase.client"; // Użyj typu zdefiniowanego w projekcie
   import type { CreateGenerationCommand, CreateGenerationErrorLogCommand, FlashcardCandidateDTO } from "../../types";
   // Załóżmy, że mamy klienta OpenRouter lub funkcję do wywołania API
   import { callOpenRouterAI } from "../ai/openrouter"; // Funkcja do stworzenia

   export class GenerationService {
     constructor(private supabase: SupabaseClient) {}

     async generateCandidates(
       userId: string,
       inputText: string
     ): Promise<{ candidates: FlashcardCandidateDTO[]; generationId: string }> {
       let generationId: string | null = null;
       let generationSuccess = false;
       let candidates: FlashcardCandidateDTO[] = [];
       let generatedCount = 0;

       try {
         // 1. Create initial generation log
         const generationCmd: CreateGenerationCommand = {
           user_id: userId,
           input_text: inputText.substring(0, 200), // Store preview
           cards_generated: 0,
           successful: false,
           model_used: "unknown", // TODO: Fill this based on OpenRouter client response
         };
         const { data: generationData, error: generationError } = await this.supabase
           .from("generations")
           .insert(generationCmd)
           .select("id")
           .single();

         if (generationError || !generationData) {
           throw new Error(`Failed to create generation log: ${generationError?.message || "No ID returned"}`);
         }
         generationId = generationData.id;

         // 2. Call OpenRouter AI
         const aiResponse = await callOpenRouterAI(inputText);

         // 3. Parse AI response (implement robust parsing and validation)
         // Założenie: aiResponse zawiera listę { front: string, back: string }
         // Walidacja struktury odpowiedzi AI
         if (aiResponse && Array.isArray(aiResponse.candidates)) {
           candidates = aiResponse.candidates
             .filter((c: any) => c.front && c.back)
             .map((c: any) => ({
               front: String(c.front).substring(0, 200),
               back: String(c.back).substring(0, 500),
             }));
           generatedCount = candidates.length;
           generationSuccess = true;
         } else {
           throw new Error("Invalid response structure from AI service");
         }

         // 4. Update generation log (Success)
         const { error: updateError } = await this.supabase
           .from("generations")
           .update({ successful: true, cards_generated: generatedCount, model_used: aiResponse?.model || "unknown" })
           .eq("id", generationId);

         if (updateError) {
           console.error(`Failed to update generation log (success) for ID ${generationId}:`, updateError);
           // Kontynuuj mimo błędu aktualizacji, ale zaloguj
         }

         return { candidates, generationId };
       } catch (error: any) {
         console.error("Error during flashcard generation:", error);

         if (generationId) {
           // 5. Log error and Update generation log (Failure)
           const errorCmd: CreateGenerationErrorLogCommand = {
             generation_id: generationId,
             error_message: error.message || "Unknown generation error",
             error_code: error.code || "GENERATION_FAILED",
             // timestamp is auto-generated by db
           };
           await this.supabase.from("generation_error_logs").insert(errorCmd);

           await this.supabase.from("generations").update({ successful: false }).eq("id", generationId);
         }
         // Rethrow the error to be handled by the API route
         throw new Error(`Generation failed: ${error.message}`);
       }
     }
   }
   ```

3. Stwórz funkcję pomocniczą `src/lib/ai/openrouter.ts` do komunikacji z API OpenRouter (obsługa fetch, API key, prompt). Pamiętaj o obsłudze błędów API OpenRouter.

### 4. Implementacja endpointu POST

1. Stwórz plik `src/pages/api/flashcards/generate.ts`:

   ```typescript
   import type { APIRoute } from "astro";
   import { ZodError } from "zod";
   import { GenerationService } from "../../../lib/services/generation.service";
   import { generateFlashcardsSchema } from "../../../lib/schemas/generation.schema";
   import type { GenerateFlashcardsRequestDTO, GenerateFlashcardsResponseDTO } from "../../../types";

   export const POST: APIRoute = async ({ request, locals }) => {
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({ error: "Unauthorized", message: "You must be logged in to generate flashcards" }),
         { status: 401, headers: { "Content-Type": "application/json" } }
       );
     }

     try {
       let requestData: GenerateFlashcardsRequestDTO;
       try {
         requestData = await request.json();
       } catch (e) {
         return new Response(JSON.stringify({ error: "Bad Request", message: "Invalid JSON body" }), {
           status: 400,
           headers: { "Content-Type": "application/json" },
         });
       }

       // Validate input
       const validatedData = generateFlashcardsSchema.parse(requestData);

       // Call Generation Service
       const generationService = new GenerationService(supabase);
       const { candidates, generationId } = await generationService.generateCandidates(
         session.user.id,
         validatedData.input_text
       );

       // Prepare response
       const responseBody: GenerateFlashcardsResponseDTO = {
         candidates,
         generation_id: generationId,
       };

       return new Response(JSON.stringify(responseBody), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error: any) {
       if (error instanceof ZodError) {
         return new Response(
           JSON.stringify({ error: "Bad Request", message: "Invalid input data", details: error.errors }),
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }

       // Log the detailed error server-side
       console.error("Error in POST /api/flashcards/generate:", error);

       // Generic error for the client
       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           message: error.message || "Failed to generate flashcards due to an internal error.",
         }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   };

   export const prerender = false;
   ```

### 5. Testowanie

1. Przygotuj teksty testowe (różne długości, w tym graniczne 1000 i 10000 znaków).
2. Sprawdź poprawność odpowiedzi dla udanych generacji.
3. Sprawdź obsługę błędów:
   - Nieprawidłowy JSON.
   - Brak `input_text`.
   - `input_text` za krótki/za długi.
   - Symuluj błąd API OpenRouter (np. przez błędny klucz API).
   - Sprawdź, czy logi błędów są tworzone w `generation_error_logs`.
   - Sprawdź, czy status w tabeli `generations` jest poprawnie aktualizowany.
4. Sprawdź działanie dla niezalogowanego użytkownika (oczekiwany błąd 401).

### 6. Dokumentacja

1. Dodaj komentarze JSDoc do `GenerationService` i funkcji pomocniczych AI.
2. Zaktualizuj dokumentację API (np. w Postmanie lub Swaggerze) o nowy endpoint.
