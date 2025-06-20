# Schema bazy danych my10xCards

## 1. Tabele

### 1.1. users

This table is managed by Supabase Auth.

- id: UUID PRIMARY KEY 
- email: VARCHAR(255) NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ
- last_sign_in_at: TIMESTAMPTZ
- raw_app_meta_data: JSONB
- raw_user_meta_data: JSONB
- is_super_admin: BOOLEAN
- phone: VARCHAR

### 1.2. flashcards

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: VARCHAR(10) NOT NULL CHECK (source IN ('manual', 'ai'))
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- front_tsv: tsvector GENERATED ALWAYS AS (to_tsvector('polish', front)) STORED
- back_tsv: tsvector GENERATED ALWAYS AS (to_tsvector('polish', back)) STORED

### 1.3. generations

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- input_text: TEXT NOT NULL
- cards_generated: INTEGER NOT NULL
- successful: BOOLEAN NOT NULL DEFAULT true
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.4. generation_error_logs

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- generation_id: UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE
- error_message: TEXT NOT NULL
- error_code: VARCHAR(50)
- timestamp: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje między tabelami

1. **auth.users ↔ flashcards**: Jeden-do-wielu. Użytkownik może mieć wiele fiszek, każda fiszka należy do jednego użytkownika.
   - Klucz obcy: `flashcards.user_id` → `auth.users.id`

2. **auth.users ↔ generations**: Jeden-do-wielu. Użytkownik może mieć wiele logów generowania, każdy log należy do jednego użytkownika.
   - Klucz obcy: `generations.user_id` → `auth.users.id`

3. **generations ↔ generation_error_logs**: Jeden-do-wielu. Proces generowania może mieć wiele logów błędów, każdy log błędu dotyczy jednego procesu generowania.
   - Klucz obcy: `generation_error_logs.generation_id` → `generations.id`

## 3. Indeksy

- idx_flashcards_user_id ON public.flashcards(user_id)
- idx_flashcards_source ON public.flashcards(source)
- idx_flashcards_created_at ON public.flashcards(created_at)
- idx_generations_user_id ON public.generations(user_id)
- idx_generations_created_at ON public.generations(created_at)
- idx_generation_error_logs_generation_id ON public.generation_error_logs(generation_id)
- idx_flashcards_front_tsv ON public.flashcards USING GIN (front_tsv)
- idx_flashcards_back_tsv ON public.flashcards USING GIN (back_tsv)

## 4. Triggery

Trigger `update_flashcards_updated_at` na tabeli `flashcards` automatycznie aktualizuje pole `updated_at` przy każdej modyfikacji rekordu.

## 5. RLS (Row Level Security)

- Wszystkie tabele mają włączone Row Level Security (RLS).
- Polityki RLS zapewniają, że użytkownicy mają dostęp tylko do swoich własnych danych.
- Zastosowano polityki SELECT, INSERT, UPDATE i DELETE dla tabeli flashcards.
- Zastosowano polityki SELECT i INSERT dla tabeli generations.
- Zastosowano politykę SELECT dla tabeli generation_error_logs, bazującą na powiązaniu z tabelą generations.

## 6. Uwagi dotyczące decyzji projektowych

1. **Wybór UUID zamiast serial/integer**: Zastosowano UUID jako klucze główne, co jest zalecane dla aplikacji opartych na Supabase i ułatwia potencjalną przyszłą migrację lub sharding danych.

2. **Wykorzystanie Supabase Auth**: Zamiast tworzenia własnej tabeli users, projekt wykorzystuje wbudowaną funkcjonalność Supabase Auth (tabela auth.users).

3. **Przechowywanie fiszek**: Wszystkie fiszki (zarówno ręczne jak i generowane przez AI) są przechowywane w jednej tabeli z polem source określającym ich pochodzenie.

4. **Ograniczenie długości pól**: Zgodnie z wymaganiami PRD, pole front jest ograniczone do 200 znaków, a pole back do 500 znaków.

5. **Logowanie generowania**: System loguje zarówno udane jak i nieudane próby generowania fiszek, wraz z szczegółami błędów w oddzielnej tabeli.

6. **RLS dla bezpieczeństwa danych**: Zastosowano polityki Row Level Security dla wszystkich tabel, aby zapewnić, że użytkownicy mają dostęp tylko do swoich własnych danych.

7. **Pełnotekstowe wyszukiwanie**: Zaimplementowano pełnotekstowe wyszukiwanie dla pól front i back w tabeli flashcards, wykorzystując indeksy GIN dla optymalnej wydajności.

8. **Brak tabeli dla sesji nauki**: Zgodnie z notatkami, tabele dla algorytmu powtórek i sesji nauki zostaną zaimplementowane w późniejszym etapie projektu. 