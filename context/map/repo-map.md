# Mapa repozytorium — 10xCardsAstro

## TL;DR

To mała aplikacja Astro/Supabase o dużym historycznym churnie testów i deploymentu. Dla feature'u nauki realny rdzeń to jeden komponent-orkiestrator, dwa endpointy i monolityczny `LearningService`. Największe ryzyka to wyłączone RLS, selekcja due dopiero po `limit(10)` oraz naliczanie `cards_reviewed` przy prezentacji, nie ratingu. Brakuje niezależnego dowodu E2E dla algorytmu i niezmienników.

## Teren

| Obszar | Rola | Ryzyko |
|---|---|---|
| `.ai/` | historyczny PRD, kontrakty i plany | dokumenty mogą opisywać zamiar, nie stan |
| `src/components/learning/` | reveal/rating i orkiestracja klienta | ręczny fetch, timeout, UI-centric testy |
| `src/pages/api/learn/` | auth, Zod, statusy HTTP | GET zawiera mutacje |
| `src/lib/services/` | logika i Supabase | mieszane odpowiedzialności |
| `supabase/migrations/` | schemat, constraints, RLS | finalne wyłączenie RLS |
| `e2e/` | Playwright | flow nauki nie testuje ratingu |
| `.github/workflows/ci.yml` | bramka jakości | `getNextCard` wykluczony, E2E non-blocking |

## Realne powiązania

```text
/learn
  → LearningSession
    → GET /api/learn/session
      → getLearningSessionSchema
      → LearningService.getNextCard
    → LearningCard → rating 1..5
    → POST /api/learn/session/rate
      → rateFlashcardSchema
      → LearningService.rateFlashcard
        → ReviewScheduler
        → Supabase: sessions/cards/progress
```

Dowód importów/call-site'ów: `artifact-2-structure.md`. Co-change z gita: `artifact-1-territory.md`. Te dwie relacje nie są utożsamiane.

## Strefy ryzyka

1. **Authorization/data isolation:** migracja `20240320140000...` wyłącza RLS.
2. **Correctness:** `limit(10)` poprzedza filtrowanie due i może zagłodzić kartę 11+.
3. **Domain invariant:** rating nie dowodzi, że karta została przedstawiona w sesji.
4. **Progress accounting:** licznik jest zwiększany przez GET.
5. **Atomicity:** progress upsert i session counter nie są transakcją.
6. **Test gate:** CI pomija część testów i toleruje failure E2E.
7. **Documentation drift:** README/CLAUDE mówią Astro 5, package ma Astro 7; `.nvmrc` Node 22, CI Node 20.

## Pierwsze pliki do czytania

1. `.ai/prd.md:109`
2. `src/components/learning/LearningSession.tsx:23`
3. `src/pages/api/learn/session.ts:6`
4. `src/pages/api/learn/session/rate.ts:6`
5. `src/lib/services/learning.service.ts:11`
6. `src/lib/services/review-scheduler.ts:1`
7. `supabase/migrations/20240320120000_add_learning_tables.sql:7`
8. `supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql:6`

## Kontakty

Jedyny człowiek w historii: Michal Dudziak. `Claude Code` i Dependabot są automatyzacjami. Szczegóły i pytania domenowe: `artifact-3-contributors.md`.

## Known / inference / unknown

| Status | Stwierdzenie |
|---|---|
| evidence | istnieją dokładnie dwa produkcyjne miejsca konstrukcji `LearningService` |
| evidence | endpoint ratingu waliduje 1..5 przez Zod |
| evidence | unikalność `(user_id, flashcard_id)` istnieje w migracji |
| evidence | ostatnia migracja tabel nauki wyłącza RLS |
| inference | karta 11+ może być permanentnie głodzona, jeśli pierwsze 10 nie są due |
| inference | licznik może być zawyżany przez refresh/retry GET |
| unknown | stan polityk w zdalnej bazie |
| unknown | produkcyjny wolumen i telemetryka sesji |
| unknown | zamierzona semantyka losowości z PRD |

## Ograniczenia mapy

Analiza obejmuje aktualny checkout i lokalną historię git. Nie obejmuje zdalnej konfiguracji Supabase, logów produkcyjnych, otwartych PR ani wiedzy organizacyjnej poza historią repo.
