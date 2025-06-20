# API Endpoint Implementation Plan: User Registration (POST /api/auth/register)

## 1. Przegląd punktu końcowego
Endpoint umożliwia rejestrację nowego użytkownika w systemie. Wykorzystuje Supabase Auth do bezpiecznego zarządzania kontami użytkowników z weryfikacją email i automatycznym wysyłaniem emaila potwierdzającego.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/auth/register`
- **Nagłówki**:
  - `Content-Type: application/json`
- **Request Body**:
  - **Wymagane**:
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123!"
    }
    ```

## 3. Wykorzystywane typy
- **DTOs**:
  - `RegisterRequestDTO` - Struktura danych wejściowych
  - `RegisterResponseDTO` - Struktura odpowiedzi
- **Schematy walidacji**:
  - `registerSchema` - walidacja email i hasła

## 4. Szczegóły odpowiedzi
- **Status 201 Created**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "email_confirmed_at": null,
      "created_at": "2024-03-20T10:00:00Z"
    },
    "message": "Registration successful. Please check your email for confirmation link."
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
- **Status 409 Conflict**:
  ```json
  {
    "error": "Conflict",
    "message": "User with this email already exists"
  }
  ```

## 5. Przepływ danych
1. Żądanie POST trafia do endpointu `/api/auth/register`
2. Handler parsuje i waliduje dane używając `registerSchema`
3. Handler wywołuje `AuthService.registerUser(email, password)`
4. `AuthService`:
   a. Wywołuje `supabase.auth.signUp()` z danymi użytkownika
   b. Supabase automatycznie wysyła email weryfikacyjny
   c. Zwraca informacje o utworzonym użytkowniku
5. Handler formatuje odpowiedź
6. Zwraca odpowiedź z kodem 201 Created

## 6. Względy bezpieczeństwa
- **Walidacja hasła**: Minimum 8 znaków, wymagana złożoność
- **Walidacja email**: Sprawdzenie poprawnego formatu
- **Rate limiting**: Ograniczenie liczby prób rejestracji z tego samego IP
- **Email verification**: Obowiązkowa weryfikacja przez email

## 7. Obsługa błędów
- **400 Bad Request**: Błędy walidacji (nieprawidłowy email, za słabe hasło)
- **409 Conflict**: Email już istnieje w systemie
- **429 Too Many Requests**: Przekroczenie rate limitów
- **500 Internal Server Error**: Błędy Supabase Auth

## 8. Etapy wdrożenia

### 1. Utworzenie schematu walidacji
1. Stwórz `src/lib/schemas/auth.schema.ts`:
   ```typescript
   import { z } from 'zod';

   export const registerSchema = z.object({
     email: z.string().email('Invalid email format'),
     password: z
       .string()
       .min(8, 'Password must be at least 8 characters')
       .regex(
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
         'Password must contain at least one lowercase letter, one uppercase letter, and one number'
       ),
   });

   export type RegisterInput = z.infer<typeof registerSchema>;
   ```

### 2. Implementacja AuthService
1. Stwórz `src/lib/services/auth.service.ts`:
   ```typescript
   import type { SupabaseClient } from "../../db/supabase.client";
   import type { RegisterInput } from "../schemas/auth.schema";

   export class AuthService {
     constructor(private supabase: SupabaseClient) {}

     async registerUser(data: RegisterInput) {
       const { data: authData, error } = await this.supabase.auth.signUp({
         email: data.email,
         password: data.password,
         options: {
           emailRedirectTo: `${import.meta.env.SITE}/auth/confirm`,
         },
       });

       if (error) {
         if (error.message.includes('already registered')) {
           throw new Error('USER_EXISTS');
         }
         throw new Error(`Registration failed: ${error.message}`);
       }

       if (!authData.user) {
         throw new Error('Failed to create user');
       }

       return {
         user: {
           id: authData.user.id,
           email: authData.user.email!,
           email_confirmed_at: authData.user.email_confirmed_at,
           created_at: authData.user.created_at,
         },
         message: 'Registration successful. Please check your email for confirmation link.',
       };
     }
   }
   ```

### 3. Implementacja endpointu
1. Stwórz `src/pages/api/auth/register.ts`:
   ```typescript
   import type { APIRoute } from 'astro';
   import { ZodError } from 'zod';
   import { AuthService } from '../../../lib/services/auth.service';
   import { registerSchema } from '../../../lib/schemas/auth.schema';

   export const POST: APIRoute = async ({ request, locals }) => {
     try {
       const requestData = await request.json();
       const validatedData = registerSchema.parse(requestData);

       const authService = new AuthService(locals.supabase);
       const response = await authService.registerUser(validatedData);

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
             details: error.errors,
           }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       if (error instanceof Error) {
         if (error.message === 'USER_EXISTS') {
           return new Response(
             JSON.stringify({
               error: 'Conflict',
               message: 'User with this email already exists',
             }),
             { status: 409, headers: { 'Content-Type': 'application/json' } }
           );
         }
       }

       console.error('Registration error:', error);
       return new Response(
         JSON.stringify({
           error: 'Internal Server Error',
           message: 'Registration failed',
         }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };

   export const prerender = false;
   ```

### 4. Konfiguracja Supabase Auth
1. Skonfiguruj redirect URLs w Supabase Dashboard
2. Ustaw email templates dla weryfikacji
3. Skonfiguruj SMTP lub użyj built-in email service

### 5. Testowanie
1. Test prawidłowej rejestracji
2. Test duplikatu email
3. Test słabego hasła
4. Test nieprawidłowego formatu email
5. Test weryfikacji email flow