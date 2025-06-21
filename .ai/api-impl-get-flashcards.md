# API Endpoint Implementation Plan: List Flashcards (GET /api/flashcards)

## 1. Przegląd punktu końcowego

Endpoint umożliwia pobieranie paginowanej listy fiszek użytkownika z możliwością wyszukiwania, filtrowania i sortowania. Endpoint zwraca tylko fiszki przypisane do zalogowanego użytkownika, zapewniając izolację danych między użytkownikami.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards`
- **Parametry**:
  - **Opcjonalne**:
    - `page`: number (domyślnie: 1) - numer strony wyników
    - `limit`: number (domyślnie: 10) - liczba fiszek na stronę
    - `search`: string - tekst do wyszukiwania w polach front i back
    - `source`: 'manual' | 'ai' - filtrowanie po źródle fiszek
    - `sort`: 'created_at' | 'updated_at' (domyślnie: 'updated_at') - pole do sortowania
    - `order`: 'asc' | 'desc' (domyślnie: 'desc') - kolejność sortowania
- **Nagłówki**:
  - Autoryzacja: automatycznie obsługiwana przez middleware Supabase

## 3. Wykorzystywane typy

- **DTOs**:
  - `FlashcardDTO` - reprezentacja fiszki w odpowiedzi
  - `PaginationDTO` - informacje o paginacji
  - `FlashcardListResponseDTO` - struktura pełnej odpowiedzi
- **Schematy walidacji**:
  - Nowy schemat `listFlashcardsSchema` do walidacji parametrów zapytania

## 4. Szczegóły odpowiedzi

- **Status 200 OK**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "source": "manual" | "ai",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 42,
      "items_per_page": 10
    }
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to access flashcards"
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid query parameters",
    "details": [
      {
        "code": "invalid_type",
        "expected": "number",
        "received": "string",
        "path": ["page"],
        "message": "Page must be a number"
      }
    ]
  }
  ```

## 5. Przepływ danych

1. Żądanie trafia do endpointu `GET /api/flashcards`
2. Middleware Supabase weryfikuje autoryzację użytkownika
3. Endpoint ekstrahuje i waliduje parametry zapytania
4. Wywołanie `FlashcardService.listFlashcards()` z przekazaniem walidowanych parametrów
5. Serwis tworzy zapytanie do bazy danych Supabase z odpowiednimi filtrami, sortowaniem i paginacją
6. Serwis pobiera dane i informacje o paginacji (count)
7. Konwersja danych do formatu DTO
8. Zwrócenie odpowiedzi z kodem 200 OK i danymi w formacie JSON

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Weryfikacja sessji użytkownika przez middleware Supabase
- **Izolacja danych**: Filtrowanie wyników tylko do fiszek należących do zalogowanego użytkownika
- **Walidacja danych wejściowych**: Sprawdzanie poprawności parametrów zapytania
- **SQL Injection**: Zapobieganie przez używanie ORM Supabase z parametryzowanymi zapytaniami
- **Rate Limiting**: Rozważenie implementacji ograniczenia liczby żądań na użytkownika

## 7. Obsługa błędów

- **401 Unauthorized**: Brak ważnej sesji użytkownika
- **400 Bad Request**: Nieprawidłowe parametry zapytania (np. nieprawidłowy format strony)
- **500 Internal Server Error**: Nieoczekiwane błędy serwera lub bazy danych

## 8. Rozważania dotyczące wydajności

- **Indeksy bazy danych**: Wykorzystanie istniejących indeksów (`idx_flashcards_user_id`, `idx_flashcards_source`, `idx_flashcards_created_at`, `idx_flashcards_front_tsv`, `idx_flashcards_back_tsv`)
- **Paginacja**: Ograniczenie liczby zwracanych wyników
- **Zapytania wyszukiwania**: Optymalizacja zapytań wyszukiwania pełnotekstowego za pomocą `to_tsquery` dla wyszukiwań tekstowych
- **Caching**: Rozważenie implementacji cachowania odpowiedzi dla często używanych zapytań

## 9. Etapy wdrożenia

### 1. Utworzenie schematu walidacji

1. Rozszerz `src/lib/schemas/flashcard.schema.ts` o schemat walidacji parametrów zapytania:

   ```typescript
   export const listFlashcardsSchema = z.object({
     page: z.coerce.number().int().positive().default(1),
     limit: z.coerce.number().int().positive().max(100).default(10),
     search: z.string().optional(),
     source: z.enum(["manual", "ai"]).optional(),
     sort: z.enum(["created_at", "updated_at"]).default("updated_at"),
     order: z.enum(["asc", "desc"]).default("desc"),
   });

   export type ListFlashcardsInput = z.infer<typeof listFlashcardsSchema>;
   ```

### 2. Rozszerzenie serwisu o metodę listFlashcards

1. Dodaj metodę `listFlashcards` do `FlashcardService` w `src/lib/services/flashcard.service.ts`:
   ```typescript
   async listFlashcards(
     userId: string,
     params: ListFlashcardsInput
   ): Promise<FlashcardListResponseDTO> {
     const { page, limit, search, source, sort, order } = params;

     // Start building the query
     let query = this.supabase
       .from('flashcards')
       .select('id, front, back, source, created_at, updated_at', { count: 'exact' })
       .eq('user_id', userId)
       .order(sort, { ascending: order === 'asc' });

     // Apply source filter if provided
     if (source) {
       query = query.eq('source', source);
     }

     // Apply search filter if provided
     if (search && search.trim()) {
       const searchQuery = search.trim().split(/\s+/).join(' & ');
       query = query.or(`front_tsv.phfts(${searchQuery}),back_tsv.phfts(${searchQuery})`);
     }

     // Apply pagination
     const from = (page - 1) * limit;
     const to = from + limit - 1;
     query = query.range(from, to);

     // Execute the query
     const { data, error, count } = await query;

     if (error) {
       throw new Error(`Failed to list flashcards: ${error.message}`);
     }

     // Calculate pagination values
     const totalItems = count || 0;
     const totalPages = Math.ceil(totalItems / limit);

     // Return as DTO
     return {
       data: data || [],
       pagination: {
         current_page: page,
         total_pages: totalPages,
         total_items: totalItems,
         items_per_page: limit
       }
     };
   }
   ```

### 3. Implementacja endpointu GET

1. Zmodyfikuj `src/pages/api/flashcards/index.ts`, dodając obsługę metody GET:

   ```typescript
   export const GET: APIRoute = async ({ request, locals }) => {
     // Ensure user is authenticated
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({
           error: "Unauthorized",
           message: "You must be logged in to access flashcards",
         }),
         {
           status: 401,
           headers: { "Content-Type": "application/json" },
         }
       );
     }

     try {
       // Extract URL parameters
       const url = new URL(request.url);
       const params = {
         page: url.searchParams.get("page") || "1",
         limit: url.searchParams.get("limit") || "10",
         search: url.searchParams.get("search") || undefined,
         source: url.searchParams.get("source") as "manual" | "ai" | undefined,
         sort: url.searchParams.get("sort") || "updated_at",
         order: url.searchParams.get("order") || "desc",
       };

       // Validate parameters
       const validatedParams = listFlashcardsSchema.parse(params);

       // Create flashcard service
       const flashcardService = new FlashcardService(supabase);

       // Get flashcards
       const response = await flashcardService.listFlashcards(session.user.id, validatedParams);

       // Return successful response
       return new Response(JSON.stringify(response), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       // Handle validation errors
       if (error instanceof ZodError) {
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             message: "Invalid query parameters",
             details: error.errors,
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       // Handle other errors
       console.error("Error listing flashcards:", error);

       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           message: "An unexpected error occurred",
           details: error instanceof Error ? error.message : String(error),
         }),
         {
           status: 500,
           headers: { "Content-Type": "application/json" },
         }
       );
     }
   };
   ```

### 4. Testowanie endpointu

1. Testuj endpoint z różnymi parametrami zapytania, sprawdzając:
   - Poprawne działanie paginacji
   - Filtrowanie po źródle (source)
   - Działanie wyszukiwania
   - Sortowanie i kolejność
   - Obsługę błędów

### 5. Dodanie dokumentacji

1. Dodaj komentarze JSDoc do metod serwisu
2. Stwórz lub zaktualizuj dokumentację API dla tego endpointu
