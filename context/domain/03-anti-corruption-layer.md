---
title: Anti-Corruption Layer dla Supabase w domenie nauki
created: 2026-07-31
type: refactor-plan
---

# 03 — Anti-Corruption Layer dla Supabase w domenie nauki

To plan, nie implementacja.

## Przeciek zależności

`LearningService` importuje `SupabaseClient`, buduje fluent queries, zna nazwy
tabel, join string `flashcard_progress!left`, kształt response
`{data,error,count}` i semantykę `.single()/.upsert()`
(`src/lib/services/learning.service.ts:1,5-9,15-21,45-60,159-192`). Reguły
aplikacyjne są więc związane z modelem i błędami SDK.

Wyciek dotyczy slice'u nauki. Globalne middleware/auth i inne feature'y mogą nadal używać Supabase; plan nie proponuje wrappera całego SDK.

## Current SDK inventory

Inwentaryzacja poniżej jest odtwarzalnym stanem bieżącego `src/`, wykonanym
poleceniem `rg -n '@supabase/supabase-js|SupabaseClient|Postgrest' src`; nie
jest twierdzeniem o przyszłej strukturze po migracji.

| Miejsce | Aktualna wiedza o SDK | Granica docelowa / decyzja |
|---|---|---|
| `src/lib/services/learning.service.ts:1,5-9` | produkcyjny slice nauki przyjmuje `SupabaseClient` i wykonuje query | przenieść do adaptera Supabase |
| `src/lib/services/learning.service.test.ts:3,8-20` | test buduje mock w typie `SupabaseClient` | zastąpić fake'em portu w testach use case |
| `src/env.d.ts:3-16`; `src/lib/types/locals.ts:1-8` | typy Astro Locals eksponują klienta SDK | composition może nadal dostarczać adapter, nie klient do application |
| `src/db/supabase.client.ts:1-8` | composition tworzy klienta Supabase | dozwolone miejsce infrastrukturalne |
| `src/lib/services/flashcard.service.ts:1-6`; `src/lib/services/generation.service.ts:1-13`; `src/lib/services/test/flashcard.service.test.ts:2,22` | inne feature'y i ich test także używają SDK | poza zakresem ACL slice'u nauki |

W aktualnym kodzie nie istnieją jeszcze katalogi `src/domain/learning` ani
`src/application/learning`; komendy proof poniżej są kryteriami po utworzeniu
tych granic, nie wynikiem ich obecnego istnienia.

## Granica docelowa

```mermaid
flowchart LR
  API[Astro API] --> App[Learning use cases]
  App --> Domain[LearningSession + ReviewScheduler]
  App --> Port[LearningProgressRepository port]
  Adapter[SupabaseLearningRepository] -. implements .-> Port
  Adapter --> SDK[@supabase/supabase-js]
  Adapter --> DB[(PostgreSQL/RPC)]
```

## Model domenowy bez SDK

```typescript
interface DueCard {
  id: FlashcardId;
  front: string;
  back: string;
  progress: ReviewProgress | null;
}

interface ReviewProgress {
  reviewCount: number;
  difficultyRating: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  version: number;
}

type RepositoryResult<T> = T; // adapter tłumaczy provider errors na named errors
```

Nazwy snake_case, `PostgrestError`, `SupabaseClient`, query builders i nullable-array join nie opuszczają adaptera. DTO HTTP jest mapowane osobno i także nie zna typów SDK.

## Wąskie porty

```typescript
interface LearningReadRepository {
  getOrCreateActiveSession(userId: UserId, sessionId: SessionId | undefined, now: Date): Promise<LearningSession>;
  findNextDueCard(userId: UserId, now: Date): Promise<DueCard | null>;
  countAvailableCards(userId: UserId, now: Date): Promise<number>;
}

interface LearningWriteRepository {
  recordPresentation(sessionId: SessionId, cardId: FlashcardId, now: Date): Promise<CardPresentation>;
  commitRating(command: CommitRating): Promise<CommittedReview>;
}
```

Porty opisują potrzeby use case, nie każdą metodę Supabase. `commitRating` celowo jest coarse-grained, aby adapter mógł zapewnić transakcję przez PostgreSQL function/RPC.

## Adapter Supabase

`src/infrastructure/supabase/supabase-learning.repository.ts`:

- przyjmuje `SupabaseClient<Database>` w konstruktorze;
- mapuje snake_case rows ↔ domenowe value objects;
- wykonuje due filtering przed limit;
- odróżnia not-found od provider failure;
- tłumaczy `23505`/RLS/conflict na named repository/domain errors;
- używa RPC dla atomowego `commitRating`;
- nie zwraca `{data,error}` do application layer.

## Translacja błędów

| Supabase/Postgres | Adapter | Application/API |
|---|---|---|
| PGRST116/no row | `SessionNotFound`/`CardNotFound` | named result → 404 |
| 23505 presentation/rating | `ConcurrentReviewConflict` | idempotent result lub 409 |
| RLS denial | `DataAccessDenied` | 404/403 + security log |
| network/5xx | `LearningRepositoryUnavailable` | 503, retry policy |
| malformed row | `PersistenceContractViolation` | 500 + alert, bez silent defaults |

## Fazy Branch by Abstraction

1. Zdefiniuj port i contract tests na podstawie istniejących success/error DTO.
2. Zbuduj adapter implementujący stare zachowanie; `LearningService` może delegować przez port.
3. Dodaj in-memory fake do unit tests use case/aggregate.
4. Przełącz construction w endpointach, zachowując URLs i DTO.
5. W adapterze popraw due query pod osłoną contract/fixture tests.
6. Dodaj RPC transaction dla ratingu i aggregate.
7. Usuń fluent query z application layer po parity.

## Dowód izolacji

Docelowe komendy:

```bash
rg -n '@supabase/supabase-js|SupabaseClient|Postgrest' \
  src/domain/learning src/application/learning
# expected: 0

rg -n '@supabase/supabase-js|SupabaseClient|Postgrest' \
  src/infrastructure/supabase src/middleware src/db
# SDK dozwolone wyłącznie w composition/infrastructure

ast-grep run --lang ts --pattern '$DB.from($TABLE)' \
  src/domain/learning src/application/learning
# expected: 0; każde zero kontrolowane powyższym rg
```

Dla całego learning slice'u akceptowalne wystąpienia nazw `learning_sessions`, `flashcard_progress` i `flashcards` mają pozostać tylko w adapterze/migracjach/test fixtures, nie w domain/application/API.

## Contract tests

Ten sam suite uruchamiany dla in-memory i Supabase adaptera:

- get/create własnej aktywnej sesji;
- missing/foreign session bez wycieku istnienia;
- next due: null, never reviewed, overdue, future, karta 11+;
- unique progress;
- presentation once-only;
- atomic commit i rollback przy failure;
- retry/idempotency;
- RLS A/B.

## Non-goals

- wrapper 1:1 całego Supabase SDK;
- usunięcie Supabase Auth z middleware;
- event bus/microservice;
- zmiana API DTO tylko dla „czystości” domeny;
- implementacja ACL w bieżącym małym refaktorze.

## Ryzyka i decyzje przed implementacją

RPC vs bezpośredni Postgres client, ownership transakcji, error taxonomy, wersjonowanie progress i mapping remote schema wymagają discovery. Remote policies pozostają `unknown` do inwentaryzacji.

## Podsumowanie

ACL ma odizolować wyłącznie use case'y nauki od szczegółów query buildera i
typów Supabase, a nie zastąpić całe SDK globalnym wrapperem. Bieżąca
inwentaryzacja pokazuje dokładnie, gdzie zależność występuje w production,
testach i composition. Porty pozostają wąskie i opisują komendy domenowe,
dlatego `commitRating` może później ukryć mechanizm RPC oraz transakcji.
Przetłumaczenie błędów na named results ma usunąć zależność API od stringów
provider error. Plan wymaga najpierw contract tests i branch by abstraction;
remote schema, RLS oraz decyzja RPC pozostają `unknown` do discovery.
