# API Endpoint Implementation Plan: Get Generation by ID (GET /api/generations/{id})

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie szczegółów pojedynczej generacji AI na podstawie jej ID. Zwraca informacje o procesie generowania, wygenerowanych kandydatach, błędach oraz statystykach akceptacji.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/generations/{id}`
- **Parametry URL**:
  - `id`: UUID generacji (wymagane)
- **Nagłówki**:
  - Autoryzacja: automatycznie obsługiwana przez middleware Supabase

## 3. Szczegóły odpowiedzi
- **Status 200 OK**:
  ```json
  {
    "id": "uuid",
    "input_text": "Fragment tekstu źródłowego...",
    "cards_generated": 5,
    "cards_accepted": 3,
    "successful": true,
    "model_used": "gpt-4",
    "created_at": "2024-03-20T10:00:00Z",
    "accepted_flashcards": [
      {
        "id": "uuid",
        "front": "Pytanie",
        "back": "Odpowiedź"
      }
    ],
    "errors": []
  }
  ```

## 4. Etapy wdrożenia

### Implementacja endpointu
```typescript
// src/pages/api/generations/[id].ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const generationId = params.id;
  if (!generationId) {
    return new Response(
      JSON.stringify({ error: 'Generation ID required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data: generation, error } = await supabase
      .from('generations')
      .select(`
        *,
        flashcards(id, front, back),
        generation_error_logs(error_message, error_code, timestamp)
      `)
      .eq('id', generationId)
      .eq('user_id', session.user.id)
      .single();

    if (error || !generation) {
      return new Response(
        JSON.stringify({ error: 'Generation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({
      id: generation.id,
      input_text: generation.input_text,
      cards_generated: generation.cards_generated,
      cards_accepted: generation.cards_accepted || 0,
      successful: generation.successful,
      model_used: generation.model_used,
      created_at: generation.created_at,
      accepted_flashcards: generation.flashcards || [],
      errors: generation.generation_error_logs || [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting generation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const prerender = false;
```