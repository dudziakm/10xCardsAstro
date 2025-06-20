# API Endpoint Implementation Plan: Delete Flashcard (DELETE /api/flashcards/{id})

## 1. Przegląd punktu końcowego
Endpoint umożliwia usunięcie istniejącej fiszki użytkownika wraz z wszystkimi powiązanymi danymi (postęp nauki, historia przeglądów). Operacja jest nieodwracalna i wymaga odpowiednich uprawnień.

## 2. Szczegóły żądania
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/flashcards/{id}`
- **Parametry URL**:
  - `id`: UUID fiszki (wymagane)
- **Nagłówki**:
  - Autoryzacja: automatycznie obsługiwana przez middleware Supabase

## 3. Wykorzystywane typy
- **DTOs**:
  - `DeleteFlashcardResponseDTO` - Struktura odpowiedzi
- **Brak walidacji request body** - endpoint nie przyjmuje danych

## 4. Szczegóły odpowiedzi
- **Status 200 OK**:
  ```json
  {
    "message": "Flashcard deleted successfully",
    "deleted_id": "uuid",
    "deleted_at": "2024-03-20T15:30:00Z",
    "related_data_removed": {
      "progress_records": 1,
      "learning_sessions_affected": 2
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
    "message": "You must be logged in to delete flashcards"
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
1. Żądanie DELETE trafia do endpointu `/api/flashcards/{id}`
2. Middleware Supabase weryfikuje autoryzację użytkownika
3. Handler ekstrahuje i waliduje ID z parametru URL
4. Handler wywołuje `FlashcardService.deleteFlashcard(userId, flashcardId)`
5. `FlashcardService`:
   a. Sprawdza czy fiszka istnieje i należy do użytkownika
   b. Usuwa powiązane dane (flashcard_progress)
   c. Usuwa fiszkę z bazy danych
   d. Zwraca potwierdzenie usunięcia
6. Handler formatuje odpowiedź
7. Zwraca odpowiedź z kodem 200 OK

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Weryfikacja sesji użytkownika
- **Izolacja danych**: Możliwość usunięcia tylko własnych fiszek
- **Kaskadowe usuwanie**: Bezpieczne usuwanie powiązanych danych
- **UUID validation**: Sprawdzenie poprawności formatu ID

## 7. Obsługa błędów
- **400 Bad Request**: Nieprawidłowy format UUID
- **401 Unauthorized**: Brak ważnej sesji użytkownika
- **404 Not Found**: Fiszka nie istnieje lub nie należy do użytkownika
- **500 Internal Server Error**: Błędy bazy danych

## 8. Kaskadowe usuwanie danych
Podczas usuwania fiszki należy usunąć:
1. Rekordy postępu nauki (`flashcard_progress`)
2. Powiązania w sesjach nauki (aktualizacja statystyk)
3. Referencje w generacjach AI (jeśli fiszka była wygenerowana)

## 9. Etapy wdrożenia

### 1. Rozszerzenie typów
1. Dodaj do `src/types.ts`:
   ```typescript
   export interface DeleteFlashcardResponseDTO {
     message: string;
     deleted_id: string;
     deleted_at: string;
     related_data_removed: {
       progress_records: number;
       learning_sessions_affected: number;
     };
   }
   ```

### 2. Rozszerzenie FlashcardService
1. Dodaj metodę do `src/lib/services/flashcard.service.ts`:
   ```typescript
   async deleteFlashcard(userId: string, flashcardId: string): Promise<DeleteFlashcardResponseDTO> {
     // Validate UUID format
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
     if (!uuidRegex.test(flashcardId)) {
       throw new Error('INVALID_UUID');
     }

     // Check if flashcard exists and belongs to user
     const { data: existingFlashcard, error: checkError } = await this.supabase
       .from('flashcards')
       .select('id, source, generation_id')
       .eq('id', flashcardId)
       .eq('user_id', userId)
       .single();

     if (checkError || !existingFlashcard) {
       throw new Error('FLASHCARD_NOT_FOUND');
     }

     // Count related data before deletion
     const [
       { count: progressCount },
       { count: sessionCount }
     ] = await Promise.all([
       this.supabase
         .from('flashcard_progress')
         .select('*', { count: 'exact', head: true })
         .eq('user_id', userId)
         .eq('flashcard_id', flashcardId),
       this.supabase
         .from('learning_sessions')
         .select('*', { count: 'exact', head: true })
         .eq('user_id', userId)
         .eq('is_active', true)
     ]);

     // Delete related data first (respecting foreign key constraints)
     const { error: progressError } = await this.supabase
       .from('flashcard_progress')
       .delete()
       .eq('user_id', userId)
       .eq('flashcard_id', flashcardId);

     if (progressError) {
       throw new Error(`Failed to delete progress data: ${progressError.message}`);
     }

     // Delete the flashcard
     const { error: deleteError } = await this.supabase
       .from('flashcards')
       .delete()
       .eq('id', flashcardId)
       .eq('user_id', userId);

     if (deleteError) {
       throw new Error(`Failed to delete flashcard: ${deleteError.message}`);
     }

     const deletedAt = new Date().toISOString();

     // Log deletion for audit
     console.log(`Flashcard ${flashcardId} deleted by user ${userId} at ${deletedAt}`);

     return {
       message: 'Flashcard deleted successfully',
       deleted_id: flashcardId,
       deleted_at: deletedAt,
       related_data_removed: {
         progress_records: progressCount || 0,
         learning_sessions_affected: sessionCount || 0,
       },
     };
   }
   ```

### 3. Rozszerzenie endpointu
1. Dodaj metodę DELETE do `src/pages/api/flashcards/[id].ts`:
   ```typescript
   // ... existing GET and PUT methods

   export const DELETE: APIRoute = async ({ params, locals }) => {
     const { supabase, session } = locals;

     if (!session) {
       return new Response(
         JSON.stringify({
           error: 'Unauthorized',
           message: 'You must be logged in to delete flashcards',
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
       const response = await flashcardService.deleteFlashcard(session.user.id, flashcardId);

       return new Response(JSON.stringify(response), {
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

       console.error('Error deleting flashcard:', error);
       return new Response(
         JSON.stringify({
           error: 'Internal Server Error',
           message: 'Failed to delete flashcard',
         }),
         {
           status: 500,
           headers: { 'Content-Type': 'application/json' },
         }
       );
     }
   };
   ```

### 4. Konfiguracja bazy danych
1. Upewnij się że foreign key constraints są poprawnie skonfigurowane
2. Sprawdź działanie cascade delete dla powiązanych tabel
3. Skonfiguruj soft delete jeśli wymagane

### 5. Funkcje dodatkowe
1. Opcjonalne soft delete zamiast hard delete
2. Backup/export danych przed usunięciem
3. Undo functionality (przywracanie przez określony czas)

### 6. Testowanie
1. Test prawidłowego usunięcia fiszki
2. Test usunięcia nieistniejącej fiszki
3. Test usunięcia cudzej fiszki
4. Test nieprawidłowego UUID
5. Test bez autoryzacji
6. Test kaskadowego usuwania danych powiązanych
7. Test liczenia usuniętych rekordów
8. Test audit logging