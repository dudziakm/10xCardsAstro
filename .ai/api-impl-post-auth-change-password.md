# API Endpoint Implementation Plan: Change Password (POST /api/auth/change-password)

## 1. Przegląd punktu końcowego

Endpoint umożliwia zmianę hasła zalogowanego użytkownika. Wymaga podania obecnego hasła dla weryfikacji oraz nowego hasła spełniającego wymogi bezpieczeństwa.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/auth/change-password`
- **Nagłówki**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (lub cookies sesyjne)
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "current_password": "currentPassword123!",
      "new_password": "newSecurePassword456!"
    }
    ```

## 3. Wykorzystywane typy

- **DTOs**:
  - `ChangePasswordRequestDTO` - Struktura danych wejściowych
  - `ChangePasswordResponseDTO` - Struktura odpowiedzi
- **Schematy walidacji**:
  - `changePasswordSchema` - walidacja obecnego i nowego hasła

## 4. Szczegóły odpowiedzi

- **Status 200 OK**:
  ```json
  {
    "message": "Password changed successfully",
    "updated_at": "2024-03-20T12:00:00Z"
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid input data",
    "details": [
      {
        "code": "too_small",
        "path": ["new_password"],
        "message": "Password must be at least 8 characters"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "You must be logged in to change password"
  }
  ```
- **Status 403 Forbidden**:
  ```json
  {
    "error": "Forbidden",
    "message": "Current password is incorrect"
  }
  ```

## 5. Przepływ danych

1. Żądanie POST trafia do endpointu `/api/auth/change-password`
2. Middleware weryfikuje autoryzację użytkownika
3. Handler parsuje i waliduje dane używając `changePasswordSchema`
4. Handler wywołuje `AuthService.changePassword(userId, currentPassword, newPassword)`
5. `AuthService`:
   a. Weryfikuje obecne hasło przez próbę logowania
   b. Jeśli weryfikacja przeszła, wywołuje `supabase.auth.updateUser()`
   c. Zwraca potwierdzenie zmiany
6. Handler formatuje odpowiedź
7. Zwraca odpowiedź z kodem 200 OK

## 6. Względy bezpieczeństwa

- **Weryfikacja obecnego hasła**: Obowiązkowa weryfikacja przed zmianą
- **Walidacja nowego hasła**: Sprawdzenie siły hasła
- **Rate limiting**: Ograniczenie prób zmiany hasła
- **Audit logging**: Logowanie zmian hasła dla bezpieczeństwa
- **Session invalidation**: Opcjonalne wylogowanie ze wszystkich sesji

## 7. Obsługa błędów

- **400 Bad Request**: Błędy walidacji nowego hasła
- **401 Unauthorized**: Brak autoryzacji użytkownika
- **403 Forbidden**: Nieprawidłowe obecne hasło
- **429 Too Many Requests**: Przekroczenie limitów zmian hasła
- **500 Internal Server Error**: Błędy Supabase Auth

## 8. Etapy wdrożenia

### 1. Rozszerzenie schematu walidacji

1. Dodaj do `src/lib/schemas/auth.schema.ts`:

   ```typescript
   export const changePasswordSchema = z
     .object({
       current_password: z.string().min(1, "Current password is required"),
       new_password: z
         .string()
         .min(8, "New password must be at least 8 characters")
         .regex(
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
           "New password must contain at least one lowercase letter, one uppercase letter, and one number"
         ),
     })
     .refine((data) => data.current_password !== data.new_password, {
       message: "New password must be different from current password",
       path: ["new_password"],
     });

   export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
   ```

### 2. Rozszerzenie AuthService

1. Dodaj metodę do `src/lib/services/auth.service.ts`:

   ```typescript
   import type { ChangePasswordInput } from "../schemas/auth.schema";

   export class AuthService {
     // ... existing methods

     async changePassword(userId: string, data: ChangePasswordInput) {
       // First, verify current password by attempting to sign in
       const { data: userData, error: userError } = await this.supabase.auth.getUser();

       if (userError || !userData.user) {
         throw new Error("UNAUTHORIZED");
       }

       // Verify current password
       const { error: signInError } = await this.supabase.auth.signInWithPassword({
         email: userData.user.email!,
         password: data.current_password,
       });

       if (signInError) {
         throw new Error("INVALID_CURRENT_PASSWORD");
       }

       // Update password
       const { data: updateData, error: updateError } = await this.supabase.auth.updateUser({
         password: data.new_password,
       });

       if (updateError) {
         throw new Error(`Password update failed: ${updateError.message}`);
       }

       // Log password change for security audit
       console.log(`Password changed for user ${userId} at ${new Date().toISOString()}`);

       return {
         message: "Password changed successfully",
         updated_at: updateData.user?.updated_at || new Date().toISOString(),
       };
     }
   }
   ```

### 3. Implementacja endpointu

1. Stwórz `src/pages/api/auth/change-password.ts`:

   ```typescript
   import type { APIRoute } from "astro";
   import { ZodError } from "zod";
   import { AuthService } from "../../../lib/services/auth.service";
   import { changePasswordSchema } from "../../../lib/schemas/auth.schema";

   export const POST: APIRoute = async ({ request, locals }) => {
     const { supabase, session } = locals;

     // Check if user is authenticated
     if (!session) {
       return new Response(
         JSON.stringify({
           error: "Unauthorized",
           message: "You must be logged in to change password",
         }),
         { status: 401, headers: { "Content-Type": "application/json" } }
       );
     }

     try {
       const requestData = await request.json();
       const validatedData = changePasswordSchema.parse(requestData);

       const authService = new AuthService(supabase);
       const response = await authService.changePassword(session.user.id, validatedData);

       return new Response(JSON.stringify(response), {
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
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }

       if (error instanceof Error) {
         if (error.message === "UNAUTHORIZED") {
           return new Response(
             JSON.stringify({
               error: "Unauthorized",
               message: "Invalid session",
             }),
             { status: 401, headers: { "Content-Type": "application/json" } }
           );
         }

         if (error.message === "INVALID_CURRENT_PASSWORD") {
           return new Response(
             JSON.stringify({
               error: "Forbidden",
               message: "Current password is incorrect",
             }),
             { status: 403, headers: { "Content-Type": "application/json" } }
           );
         }
       }

       console.error("Change password error:", error);
       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           message: "Password change failed",
         }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   };

   export const prerender = false;
   ```

### 4. Dodatkowe funkcje bezpieczeństwa

1. Implementacja rate limiting dla zmian hasła
2. Email notification o zmianie hasła
3. Opcjonalne wylogowanie ze wszystkich sesji po zmianie hasła

### 5. Testowanie

1. Test prawidłowej zmiany hasła
2. Test nieprawidłowego obecnego hasła
3. Test słabego nowego hasła
4. Test tego samego hasła co obecne
5. Test bez autoryzacji
6. Test rate limiting
