# API Endpoint Implementation Plan: Delete Account (DELETE /api/auth/account)

## 1. Przegląd punktu końcowego
Endpoint umożliwia całkowite usunięcie konta użytkownika wraz z wszystkimi powiązanymi danymi. Jest to operacja nieodwracalna wymagająca potwierdzenia hasłem dla bezpieczeństwa.

## 2. Szczegóły żądania
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/auth/account`
- **Nagłówki**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (lub cookies sesyjne)
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "password": "userPassword123!",
      "confirmation": "DELETE_MY_ACCOUNT"
    }
    ```

## 3. Wykorzystywane typy
- **DTOs**:
  - `DeleteAccountRequestDTO` - Struktura danych wejściowych
  - `DeleteAccountResponseDTO` - Struktura odpowiedzi
- **Schematy walidacji**:
  - `deleteAccountSchema` - walidacja hasła i potwierdzenia

## 4. Szczegóły odpowiedzi
- **Status 200 OK**:
  ```json
  {
    "message": "Account deleted successfully",
    "deleted_at": "2024-03-20T12:00:00Z",
    "data_removed": {
      "flashcards": 42,
      "generations": 8,
      "learning_sessions": 15
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
        "code": "invalid_literal",
        "path": ["confirmation"],
        "message": "Confirmation must be exactly 'DELETE_MY_ACCOUNT'"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to delete account"
  }
  ```
- **Status 403 Forbidden**:
  ```json
  {
    "error": "Forbidden",
    "message": "Password verification failed"
  }
  ```

## 5. Przepływ danych
1. Żądanie DELETE trafia do endpointu `/api/auth/account`
2. Middleware weryfikuje autoryzację użytkownika
3. Handler parsuje i waliduje dane używając `deleteAccountSchema`
4. Handler wywołuje `AuthService.deleteAccount(userId, password)`
5. `AuthService`:
   a. Weryfikuje hasło użytkownika
   b. Usuwa wszystkie dane użytkownika (flashcards, generations, sessions)
   c. Usuwa konto użytkownika z Supabase Auth
   d. Zwraca podsumowanie usuniętych danych
6. Handler czyści cookies sesyjne
7. Handler formatuje odpowiedź
8. Zwraca odpowiedź z kodem 200 OK

## 6. Względy bezpieczeństwa
- **Weryfikacja hasła**: Obowiązkowa weryfikacja przed usunięciem
- **Confirmation phrase**: Dodatkowe potwierdzenie operacji
- **Audit logging**: Logowanie usunięcia konta
- **Data retention**: Opcjonalne zachowanie logów przez określony czas
- **Rate limiting**: Ograniczenie prób usunięcia konta

## 7. Obsługa błędów
- **400 Bad Request**: Błędy walidacji potwierdzenia
- **401 Unauthorized**: Brak autoryzacji użytkownika
- **403 Forbidden**: Nieprawidłowe hasło
- **429 Too Many Requests**: Przekroczenie limitów
- **500 Internal Server Error**: Błędy podczas usuwania danych

## 8. Etapy wdrożenia

### 1. Rozszerzenie schematu walidacji
1. Dodaj do `src/lib/schemas/auth.schema.ts`:
   ```typescript
   export const deleteAccountSchema = z.object({
     password: z.string().min(1, 'Password is required'),
     confirmation: z.literal('DELETE_MY_ACCOUNT', {
       errorMap: () => ({ message: "Confirmation must be exactly 'DELETE_MY_ACCOUNT'" }),
     }),
   });

   export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
   ```

### 2. Rozszerzenie AuthService
1. Dodaj metodę do `src/lib/services/auth.service.ts`:
   ```typescript
   import type { DeleteAccountInput } from "../schemas/auth.schema";

   export class AuthService {
     // ... existing methods

     async deleteAccount(userId: string, data: DeleteAccountInput) {
       // Get current user
       const { data: userData, error: userError } = await this.supabase.auth.getUser();
       
       if (userError || !userData.user) {
         throw new Error('UNAUTHORIZED');
       }

       // Verify password
       const { error: signInError } = await this.supabase.auth.signInWithPassword({
         email: userData.user.email!,
         password: data.password,
       });

       if (signInError) {
         throw new Error('INVALID_PASSWORD');
       }

       // Count data to be deleted
       const [
         { count: flashcardsCount },
         { count: generationsCount },
         { count: sessionsCount }
       ] = await Promise.all([
         this.supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', userId),
         this.supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
         this.supabase.from('learning_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
       ]);

       // Delete user data in correct order (respecting foreign key constraints)
       await this.supabase.from('flashcard_progress').delete().eq('user_id', userId);
       await this.supabase.from('learning_sessions').delete().eq('user_id', userId);
       await this.supabase.from('generation_error_logs').delete().in(
         'generation_id',
         (await this.supabase.from('generations').select('id').eq('user_id', userId)).data?.map(g => g.id) || []
       );
       await this.supabase.from('flashcards').delete().eq('user_id', userId);
       await this.supabase.from('generations').delete().eq('user_id', userId);

       // Delete user account from Auth
       const { error: deleteError } = await this.supabase.auth.admin.deleteUser(userId);
       
       if (deleteError) {
         throw new Error(`Account deletion failed: ${deleteError.message}`);
       }

       // Log account deletion for audit
       console.log(`Account deleted for user ${userId} at ${new Date().toISOString()}`);

       return {
         message: 'Account deleted successfully',
         deleted_at: new Date().toISOString(),
         data_removed: {
           flashcards: flashcardsCount || 0,
           generations: generationsCount || 0,
           learning_sessions: sessionsCount || 0,
         },
       };
     }
   }
   ```

### 3. Implementacja endpointu
1. Stwórz `src/pages/api/auth/account.ts`:
   ```typescript
   import type { APIRoute } from 'astro';
   import { ZodError } from 'zod';
   import { AuthService } from '../../../lib/services/auth.service';
   import { deleteAccountSchema } from '../../../lib/schemas/auth.schema';

   export const DELETE: APIRoute = async ({ request, locals, cookies }) => {
     const { supabase, session } = locals;

     // Check if user is authenticated
     if (!session) {
       return new Response(
         JSON.stringify({
           error: 'Unauthorized',
           message: 'You must be logged in to delete account',
         }),
         { status: 401, headers: { 'Content-Type': 'application/json' } }
       );
     }

     try {
       const requestData = await request.json();
       const validatedData = deleteAccountSchema.parse(requestData);

       const authService = new AuthService(supabase);
       const response = await authService.deleteAccount(session.user.id, validatedData);

       // Clear all session cookies
       cookies.delete('sb-access-token', { path: '/' });
       cookies.delete('sb-refresh-token', { path: '/' });

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
             details: error.errors,
           }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       if (error instanceof Error) {
         if (error.message === 'UNAUTHORIZED') {
           return new Response(
             JSON.stringify({
               error: 'Unauthorized',
               message: 'Invalid session',
             }),
             { status: 401, headers: { 'Content-Type': 'application/json' } }
           );
         }

         if (error.message === 'INVALID_PASSWORD') {
           return new Response(
             JSON.stringify({
               error: 'Forbidden',
               message: 'Password verification failed',
             }),
             { status: 403, headers: { 'Content-Type': 'application/json' } }
           );
         }
       }

       console.error('Delete account error:', error);
       return new Response(
         JSON.stringify({
           error: 'Internal Server Error',
           message: 'Account deletion failed',
         }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };

   export const prerender = false;
   ```

### 4. Konfiguracja uprawnień Supabase
1. Upewnij się że service role key ma uprawnienia do admin.deleteUser()
2. Skonfiguruj RLS policies do kaskadowego usuwania danych

### 5. Dodatkowe funkcje
1. Email confirmation przed usunięciem konta
2. Grace period do odzyskania konta
3. Export danych przed usunięciem

### 6. Testowanie
1. Test prawidłowego usunięcia konta
2. Test nieprawidłowego hasła
3. Test błędnego potwierdzenia
4. Test usunięcia powiązanych danych
5. Test czyszczenia sesji
6. Test bez autoryzacji