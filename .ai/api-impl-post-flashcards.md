# API Endpoint Implementation Plan: Create Flashcard (POST /api/flashcards)

## 1. Przegląd punktu końcowego
Endpoint ten umożliwia ręczne tworzenie nowych fiszek przez użytkownika. W przeciwieństwie do fiszek generowanych przez AI, te fiszki będą miały źródło (source) oznaczone jako "manual". Endpoint wymaga autoryzacji i walidacji danych wejściowych.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards`
- Parametry:
  - Wymagane: brak parametrów w URL
  - Opcjonalne: brak
- Request Body:
  ```json
  {
    "front": "string (max 200 chars)",
    "back": "string (max 500 chars)"
  }
  ```
- Headers:
  - Authorization: Bearer token (sesja Supabase)
  - Content-Type: application/json

## 3. Wykorzystywane typy
- **DTOs**:
  - `CreateFlashcardRequestDTO`: Do walidacji danych wejściowych
  - `FlashcardDTO`: Do strukturyzacji odpowiedzi
- **Command Models**:
  - `CreateFlashcardCommand`: Do operacji bazodanowych

## 4. Szczegóły odpowiedzi
- Status Code: 201 Created
- Response Body:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "source": "manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Kody błędów:
  - 400 Bad Request: Nieprawidłowe dane wejściowe
  - 401 Unauthorized: Brak autoryzacji
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Otrzymanie żądania POST
2. Autoryzacja użytkownika za pomocą middleware Supabase
3. Walidacja danych wejściowych (front, back) przy użyciu Zod
4. Utworzenie obiektu CreateFlashcardCommand z danymi użytkownika
5. Zapisanie nowej fiszki w bazie danych z parametrem source="manual"
6. Zwrócenie zapisanej fiszki jako FlashcardDTO z kodem 201 Created

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Endpoint wymaga autentykacji użytkownika. Wykorzystać middleware Astro do weryfikacji sesji
- **Walidacja danych**: Wszystkie dane wejściowe muszą być walidowane pod kątem długości i poprawności
- **Sanityzacja danych**: Zapewnić, że dane tekstowe są odpowiednio sanityzowane
- **Row Level Security (RLS)**: 
  - W produkcji: Wykorzystać polityki RLS Supabase, aby użytkownicy mieli dostęp tylko do swoich danych
  - W development: Możliwe jest tymczasowe wyłączenie RLS poprzez użycie `supabaseAdminClient` zamiast standardowego klienta
- **User ID**: Pobierać ID użytkownika z kontekstu sesji, nigdy z danych wejściowych

## 7. Obsługa błędów
- **Walidacja danych wejściowych**:
  - Brakujące pola: 400 Bad Request z informacją o brakujących polach
  - Przekroczenie limitów znaków: 400 Bad Request z informacją o limicie
- **Błędy autoryzacji**:
  - Brak tokenu: 401 Unauthorized
  - Nieprawidłowy token: 401 Unauthorized
- **Błędy bazy danych**:
  - Błąd zapisu: 500 Internal Server Error
  - Timeout: 500 Internal Server Error
- **Nieprzewidziane błędy**:
  - Ogólne błędy: 500 Internal Server Error z ogólnym komunikatem (bez ujawniania szczegółów technicznych)

## 8. Rozważania dotyczące wydajności
- Zastosować cache dla sesji użytkownika
- Optymalizować zapytania do bazy danych przez wykorzystanie indeksów
- Monitorować czas odpowiedzi endpointu i liczbę żądań
- Implementować rate limiting dla dużej liczby żądań od jednego użytkownika

## 9. Etapy wdrożenia

1. **Utworzenie plików i struktury**:
   - Utworzenie katalogu `/src/pages/api/flashcards` jeśli nie istnieje
   - Utworzenie pliku `/src/pages/api/flashcards/index.ts` dla endpointu POST

2. **Utworzenie serwisu**:
   - Utworzenie katalogu `/src/lib/services` jeśli nie istnieje
   - Utworzenie pliku `/src/lib/services/flashcard.service.ts`

3. **Implementacja schematu walidacji**:
   - Utworzenie schematu Zod dla walidacji danych wejściowych

4. **Implementacja serwisu**:
   - Implementacja metody `createFlashcard` w `flashcard.service.ts`
   - Obsługa interakcji z bazą danych Supabase

5. **Implementacja endpointu**:
   - Dodanie obsługi metody POST w `/src/pages/api/flashcards/index.ts`
   - Implementacja logiki biznesowej i obsługi błędów

6. **Testowanie**:
   - Napisanie testów jednostkowych i integracyjnych dla endpointu
   - Manualne testowanie utworzenia fiszki

7. **Dokumentacja**:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia

## 10. Przykładowa implementacja

### 1. Schema walidacji (Zod)

```typescript
// src/lib/schemas/flashcard.schema.ts
import { z } from "zod";

export const createFlashcardSchema = z.object({
  front: z.string().min(1, "Przód fiszki jest wymagany").max(200, "Przód fiszki nie może przekraczać 200 znaków"),
  back: z.string().min(1, "Tył fiszki jest wymagany").max(500, "Tył fiszki nie może przekraczać 500 znaków"),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
```

### 2. Serwis

```typescript
// src/lib/services/flashcard.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, FlashcardDTO } from "../../types";
import { createFlashcardSchema } from "../schemas/flashcard.schema";

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async createFlashcard(userId: string, data: unknown): Promise<FlashcardDTO> {
    // Validate input
    const validatedData = createFlashcardSchema.parse(data);
    
    // Prepare command
    const command: CreateFlashcardCommand = {
      user_id: userId,
      front: validatedData.front,
      back: validatedData.back,
      source: "manual"
    };
    
    // Insert into database
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .insert(command)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }
    
    // Return as DTO
    return {
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at
    };
  }
}
```

### 3. Endpoint

```typescript
// src/pages/api/flashcards/index.ts
import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { ZodError } from "zod";

export const POST: APIRoute = async ({ request, locals }) => {
  // Ensure user is authenticated
  const { supabase, session } = locals;
  
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "You must be logged in to create flashcards" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  
  try {
    // Parse request body
    const requestData = await request.json();
    
    // Create flashcard service
    const flashcardService = new FlashcardService(supabase);
    
    // Create flashcard
    const flashcard = await flashcardService.createFlashcard(session.user.id, requestData);
    
    // Return successful response
    return new Response(
      JSON.stringify(flashcard),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid input data",
          details: error.errors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Handle other errors
    console.error("Error creating flashcard:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Disable prerendering for API routes
export const prerender = false;
``` 