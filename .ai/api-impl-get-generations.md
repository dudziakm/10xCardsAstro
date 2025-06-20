# API Endpoint Implementation Plan: List Generations (GET /api/generations)

## 1. Przegląd punktu końcowego
Endpoint `/api/generations` umożliwia uwierzytelnionym użytkownikom pobieranie paginowanej listy ich historii generacji fiszek wraz z podstawowymi informacjami o każdej generacji. Odpowiedź zawiera zarówno dane generacji, jak i informacje o paginacji.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/generations`
- Parametry:
  - Opcjonalne:
    - `page`: number (domyślnie: 1) - Numer strony wyników
    - `limit`: number (domyślnie: 10) - Liczba elementów na stronę
    - `sort`: string (domyślnie: 'created_at') - Pole, według którego sortowane są wyniki
    - `order`: 'asc' | 'desc' (domyślnie: 'desc') - Kolejność sortowania

## 3. Wykorzystywane typy
```typescript
// Typy z src/types.ts
import type { 
  GenerationListItemDTO, 
  GenerationListResponseDTO, 
  PaginationDTO 
} from "../types";

// Schemat walidacji parametrów zapytania
import { z } from "zod";

const queryParamsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
  sort: z.enum(['created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

type QueryParams = z.infer<typeof queryParamsSchema>;
```

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
  ```typescript
  {
    data: GenerationListItemDTO[]; // Lista generacji
    pagination: PaginationDTO; // Informacje o paginacji
  }
  ```
- Błąd (401 Unauthorized):
  ```typescript
  {
    error: string; // Komunikat o błędzie
  }
  ```

## 5. Przepływ danych
1. Walidacja parametrów zapytania za pomocą Zod
2. Pobranie ID użytkownika z kontekstu sesji Supabase
3. Wywołanie serwisu `generationService.listGenerations()` z parametrami zapytania
4. Tworzenie odpowiedzi zawierającej dane generacji i informacje o paginacji
5. Zwrócenie odpowiedzi JSON z kodem statusu 200 (OK)

### Szczegóły implementacji serwisu
1. Pobranie liczby wszystkich generacji użytkownika (dla paginacji)
2. Obliczenie offsetu na podstawie parametrów page i limit
3. Wykonanie zapytania do tabeli generations z:
   - Filtrowaniem według user_id
   - Ograniczeniem liczby zwracanych rekordów (limit)
   - Przesunięciem rekordów (offset)
   - Sortowaniem według wybranego pola i kierunku
4. Przetworzenie danych do formatu DTO, w tym:
   - Skrócenie input_text do input_text_preview (np. pierwsze 50 znaków)
   - Formatowanie dat w spójny format
5. Utworzenie obiektu paginacji z informacjami o całkowitej liczbie elementów, stronach, itp.

## 6. Względy bezpieczeństwa
- Wymagane uwierzytelnienie użytkownika (sprawdzenie sesji Supabase)
- Wykorzystanie Row Level Security (RLS) Supabase do zapewnienia, że użytkownik ma dostęp tylko do własnych danych
- Walidacja i sanityzacja wszystkich parametrów wejściowych za pomocą Zod
- Bezpieczne wykorzystanie supabase z context.locals zgodnie z wytycznymi

## 7. Obsługa błędów
- 401 Unauthorized: Brak ważnej sesji użytkownika
- 400 Bad Request: Nieprawidłowe parametry zapytania (obsługiwane przez walidację Zod)
- 500 Internal Server Error: Nieoczekiwany błąd serwera lub problem z bazą danych

### Szczegółowa strategia obsługi błędów:
- Użycie early return pattern dla warunków błędów
- Logowanie błędów serwera do logów aplikacji
- Zwracanie użytkownikowi przyjaznych komunikatów o błędach bez ujawniania szczegółów technicznych

## 8. Rozważania dotyczące wydajności
- Wykorzystanie indeksu `idx_generations_user_id` dla szybkiego filtrowania według user_id
- Wykorzystanie indeksu `idx_generations_created_at` dla efektywnego sortowania
- Ograniczenie liczby zwracanych rekordów poprzez paginację (domyślnie 10)
- Zwracanie tylko niezbędnych pól z bazy danych
- Ograniczenie input_text_preview do krótkiego fragmentu zamiast pełnej treści

## 9. Etapy wdrożenia

### 1. Utworzenie serwisu generacji
Utwórz plik `src/lib/services/generation.service.ts`:
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  GenerationListItemDTO, 
  GenerationListResponseDTO, 
  PaginationDTO 
} from '../../types';

interface ListGenerationsOptions {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  userId: string;
}

export async function listGenerations(
  supabase: SupabaseClient,
  options: ListGenerationsOptions
): Promise<GenerationListResponseDTO> {
  const { page, limit, sort, order, userId } = options;
  const offset = (page - 1) * limit;
  
  // Pobierz całkowitą liczbę rekordów dla paginacji
  const { count, error: countError } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
    
  if (countError) {
    throw new Error(`Błąd podczas liczenia generacji: ${countError.message}`);
  }
  
  // Pobierz dane z paginacją i sortowaniem
  const { data, error } = await supabase
    .from('generations')
    .select('id, input_text, cards_generated, successful, created_at')
    .eq('user_id', userId)
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);
    
  if (error) {
    throw new Error(`Błąd podczas pobierania generacji: ${error.message}`);
  }
  
  // Przekształć dane do formatu DTO
  const generationItems: GenerationListItemDTO[] = data.map(item => ({
    id: item.id,
    input_text_preview: item.input_text.substring(0, 50) + (item.input_text.length > 50 ? '...' : ''),
    cards_generated: item.cards_generated,
    successful: item.successful,
    created_at: item.created_at
  }));
  
  // Utwórz obiekt paginacji
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  const pagination: PaginationDTO = {
    current_page: page,
    total_pages: totalPages,
    total_items: totalItems,
    items_per_page: limit
  };
  
  return {
    data: generationItems,
    pagination
  };
}
```

### 2. Implementacja endpointu API
Utwórz plik `src/pages/api/generations.ts`:
```typescript
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { listGenerations } from '../../lib/services/generation.service';

export const prerender = false;

const queryParamsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
  sort: z.enum(['created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

export const GET: APIRoute = async ({ request, locals }) => {
  // Sprawdź uwierzytelnienie
  const { supabase, session } = locals;
  
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Parsuj i waliduj parametry zapytania
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const result = queryParamsSchema.safeParse(rawParams);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters', details: result.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const params = result.data;
    
    // Pobierz dane z serwisu
    const generationsData = await listGenerations(supabase, {
      ...params,
      userId: session.user.id
    });
    
    // Zwróć odpowiedź
    return new Response(
      JSON.stringify(generationsData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching generations:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

### 3. Testowanie
1. Utwórz zapytania testowe dla różnych przypadków:
   - Podstawowe zapytanie bez parametrów
   - Zapytanie z różnymi parametrami paginacji
   - Zapytanie z różnymi parametrami sortowania
   - Zapytanie bez uwierzytelnienia (powinno zwrócić 401)
   - Zapytanie z nieprawidłowymi parametrami (powinno zwrócić 400)

2. Weryfikuj poprawność odpowiedzi, w tym:
   - Struktura danych zgodna z DTO
   - Poprawna paginacja
   - Poprawne sortowanie
   - Odpowiednie skrócenie input_text do input_text_preview

### 4. Dokumentacja
Zaktualizuj dokumentację API, aby odzwierciedlić nowo zaimplementowany endpoint, z przykładami zapytań i odpowiedzi. 