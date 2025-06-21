# API Endpoint Implementation Plan: User Login (POST /api/auth/login)

## 1. Przegląd punktu końcowego

Endpoint umożliwia logowanie użytkownika do systemu. Wykorzystuje Supabase Auth do weryfikacji poświadczeń i zwrócenia JWT tokena oraz informacji o sesji użytkownika.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/auth/login`
- **Nagłówki**:
  - `Content-Type: application/json`
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "email": "user@example.com",
      "password": "userPassword123!"
    }
    ```

## 3. Wykorzystywane typy

- **DTOs**:
  - `LoginRequestDTO` - Struktura danych wejściowych
  - `LoginResponseDTO` - Struktura odpowiedzi
- **Schematy walidacji**:
  - `loginSchema` - walidacja email i hasła

## 4. Szczegóły odpowiedzi

- **Status 200 OK**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "email_confirmed_at": "2024-03-20T10:00:00Z",
      "last_sign_in_at": "2024-03-20T12:00:00Z"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_at": 1710936000,
      "expires_in": 3600
    },
    "message": "Login successful"
  }
  ```
- **Status 400 Bad Request**:
  ```json
  {
    "error": "Bad Request",
    "message": "Invalid input data",
    "details": [
      {
        "code": "invalid_string",
        "path": ["email"],
        "message": "Invalid email format"
      }
    ]
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Unauthorized",
    "message": "Invalid email or password"
  }
  ```
- **Status 403 Forbidden**:
  ```json
  {
    "error": "Forbidden",
    "message": "Email not confirmed. Please check your email for confirmation link."
  }
  ```

## 5. Przepływ danych

1. Żądanie POST trafia do endpointu `/api/auth/login`
2. Handler parsuje i waliduje dane używając `loginSchema`
3. Handler wywołuje `AuthService.loginUser(email, password)`
4. `AuthService`:
   a. Wywołuje `supabase.auth.signInWithPassword()` z poświadczeniami
   b. Sprawdza czy email jest potwierdzony
   c. Zwraca informacje o użytkowniku i sesji
5. Handler ustawia cookies sesyjne (opcjonalnie)
6. Handler formatuje odpowiedź
7. Zwraca odpowiedź z kodem 200 OK

## 6. Względy bezpieczeństwa

- **Rate limiting**: Ograniczenie prób logowania z tego samego IP
- **Account lockout**: Blokada konta po zbyt wielu nieudanych próbach
- **Secure cookies**: HttpOnly, Secure, SameSite cookies dla tokenów
- **Email verification**: Wymaganie potwierdzenia email przed logowaniem

## 7. Obsługa błędów

- **400 Bad Request**: Błędy walidacji formatu danych
- **401 Unauthorized**: Nieprawidłowe poświadczenia
- **403 Forbidden**: Email niepotwierdzony
- **429 Too Many Requests**: Przekroczenie rate limitów
- **500 Internal Server Error**: Błędy Supabase Auth

## 8. Etapy wdrożenia

### 1. Rozszerzenie schematu walidacji

1. Dodaj do `src/lib/schemas/auth.schema.ts`:

   ```typescript
   export const loginSchema = z.object({
     email: z.string().email("Invalid email format"),
     password: z.string().min(1, "Password is required"),
   });

   export type LoginInput = z.infer<typeof loginSchema>;
   ```

### 2. Rozszerzenie AuthService

1. Dodaj metodę do `src/lib/services/auth.service.ts`:

   ```typescript
   import type { LoginInput } from "../schemas/auth.schema";

   export class AuthService {
     // ... existing methods

     async loginUser(data: LoginInput) {
       const { data: authData, error } = await this.supabase.auth.signInWithPassword({
         email: data.email,
         password: data.password,
       });

       if (error) {
         if (error.message.includes("Invalid login credentials")) {
           throw new Error("INVALID_CREDENTIALS");
         }
         if (error.message.includes("Email not confirmed")) {
           throw new Error("EMAIL_NOT_CONFIRMED");
         }
         throw new Error(`Login failed: ${error.message}`);
       }

       if (!authData.user || !authData.session) {
         throw new Error("Login failed: No user data returned");
       }

       // Check if email is confirmed
       if (!authData.user.email_confirmed_at) {
         throw new Error("EMAIL_NOT_CONFIRMED");
       }

       return {
         user: {
           id: authData.user.id,
           email: authData.user.email!,
           email_confirmed_at: authData.user.email_confirmed_at,
           last_sign_in_at: authData.user.last_sign_in_at,
         },
         session: {
           access_token: authData.session.access_token,
           refresh_token: authData.session.refresh_token,
           expires_at: authData.session.expires_at,
           expires_in: authData.session.expires_in,
         },
         message: "Login successful",
       };
     }
   }
   ```

### 3. Implementacja endpointu

1. Stwórz `src/pages/api/auth/login.ts`:

   ```typescript
   import type { APIRoute } from "astro";
   import { ZodError } from "zod";
   import { AuthService } from "../../../lib/services/auth.service";
   import { loginSchema } from "../../../lib/schemas/auth.schema";

   export const POST: APIRoute = async ({ request, locals, cookies }) => {
     try {
       const requestData = await request.json();
       const validatedData = loginSchema.parse(requestData);

       const authService = new AuthService(locals.supabase);
       const response = await authService.loginUser(validatedData);

       // Set secure cookies for session management
       cookies.set("sb-access-token", response.session.access_token, {
         httpOnly: true,
         secure: true,
         sameSite: "lax",
         maxAge: response.session.expires_in,
         path: "/",
       });

       cookies.set("sb-refresh-token", response.session.refresh_token, {
         httpOnly: true,
         secure: true,
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 30, // 30 days
         path: "/",
       });

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
         if (error.message === "INVALID_CREDENTIALS") {
           return new Response(
             JSON.stringify({
               error: "Unauthorized",
               message: "Invalid email or password",
             }),
             { status: 401, headers: { "Content-Type": "application/json" } }
           );
         }

         if (error.message === "EMAIL_NOT_CONFIRMED") {
           return new Response(
             JSON.stringify({
               error: "Forbidden",
               message: "Email not confirmed. Please check your email for confirmation link.",
             }),
             { status: 403, headers: { "Content-Type": "application/json" } }
           );
         }
       }

       console.error("Login error:", error);
       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           message: "Login failed",
         }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   };

   export const prerender = false;
   ```

### 4. Middleware update

1. Zaktualizuj middleware do obsługi sesji z cookies
2. Dodaj automatyczne odświeżanie tokenów

### 5. Testowanie

1. Test prawidłowego logowania
2. Test nieprawidłowych poświadczeń
3. Test niepotwierdznego email
4. Test cookies sesyjnych
5. Test rate limiting
