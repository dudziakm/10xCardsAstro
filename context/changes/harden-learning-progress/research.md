---
title: Research: harden-learning-progress
created: 2026-07-31
last_updated: 2026-08-01
tags: [verified]
verification_commit: e5f8c0b
---

# Research: harden-learning-progress

## Metoda rankingu

Każdy kandydat oceniono na skali 1–5 dla impactu (security/correctness), częstotliwości ścieżki, confidence dowodów, kosztu i ryzyka migracji. Wynik orientacyjny: `(impact + frequency + confidence) - (cost + migration risk)`. Liczby pomagają porównać; nie zastępują decyzji.

Weryfikacja strukturalna poniżej dotyczy kodu z commitu `e5f8c0b`; późniejszy
`1ef62c0` dodał wyłącznie odnośniki dokumentacyjne. Remote Supabase,
telemetria i biznesowa semantyka sesji pozostają `unknown`.

## Kandydat A — przywrócić RLS tabel nauki

**Klasyfikacja:** structural/security candidate.

**Evidence:** migracja tworząca tabele włącza RLS (`supabase/migrations/20240320120000_add_learning_tables.sql:61-63`) i zawiera policies (`supabase/migrations/20240320120000_add_learning_tables.sql:67-99`), a późniejsza jawnie wyłącza go dla obu tabel (`supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql:7-8`). `rg` znalazł jeden wersjonowany plik wyłączający obie tabele; remote state pozostaje `unknown`.

**Historia/intencjonalność:** nazwa i komentarz mówią „temporarily ... during testing”. Nie ma późniejszego rollbacku. Jest to świadomy test workaround, lecz jego obecność w liniowym łańcuchu migracji produkcyjnych wygląda na przypadkowy trwały efekt. Remote state: unknown.

**Migracja:** wymaga forward-only migration, inwentaryzacji remote policies, testów A/B oraz sprawdzenia, czy requestowy klient ma sesję auth. Pierwszy prerequisite: test integracyjny dwóch użytkowników na kontrolowanym Supabase.

| Impact | Frequency | Confidence | Cost | Migration risk | Wynik |
|---:|---:|---:|---:|---:|---:|
| 5 | 5 | 5 | 3 | 5 | 7 |

## Kandydat B — przenieść selekcję due do query/repozytorium

**Klasyfikacja:** structural/correctness candidate.

**Evidence:** AST potwierdza jedno `.limit(10)` na query kart i osobny `cards.filter(...)` później. `rg` potwierdza kolejność linii 60 i 66. Indeks `(user_id, next_review_date)` istnieje w migracji.

**Historia/intencjonalność:** implementacja powstała jako „simple spaced repetition”; dokument endpointu opisuje wybór z uwzględnieniem daty przeglądu (`.ai/api-impl-get-learn-session.md:70-85`), więc bieżące `created_at + limit + JS filter` nie jest wiernym wykonaniem planu. Nie wiadomo, czy join ordering Supabase sprawiał problemy.

**Migracja:** potrzebne fixtures >10 kart, przypadki null/due/future, decyzja o tie-breaker i adapter query. Można zachować DTO. Pierwszy prerequisite: characterization test udowadniający starvation na obecnym algorytmie.

| Impact | Frequency | Confidence | Cost | Migration risk | Wynik |
|---:|---:|---:|---:|---:|---:|
| 4 | 5 | 5 | 3 | 3 | 8 |

## Kandydat C — naliczać postęp po ratingu

**Klasyfikacja:** domain/correctness candidate.

**Evidence:** GET wykonuje update `cards_reviewed + 1` (`src/lib/services/learning.service.ts:91-100`); rate nie wykonuje update sesji (`src/lib/services/learning.service.ts:159-208`). Plan POST twierdzi, że statystyki sesji są aktualizowane w kroku ratingu (`.ai/api-impl-post-learn-session-rate.md:90-101`). Brak tabeli/kolumny presented-card w wersjonowanych migracjach.

**Historia/intencjonalność:** zachowanie pochodzi z pierwotnej implementacji i było kopiowane w planie GET jako „zapisuje informację o wyświetleniu”. Nazwa `cards_reviewed` i plan POST wskazują inną semantykę. Intencja domenowa wymaga potwierdzenia przez właściciela.

**Migracja:** prosty move update nie wystarczy, bo retry POST może podwójnie naliczać i nie ma dowodu przedstawienia. Wymaga tokenu/rekordu presentation i transakcji lub idempotency key. Pierwszy prerequisite: zdefiniować semantykę i dodać characterization tests refresh/abandon/rate/retry.

| Impact | Frequency | Confidence | Cost | Migration risk | Wynik |
|---:|---:|---:|---:|---:|---:|
| 4 | 5 | 5 | 4 | 4 | 6 |

## Non-candidates i prerequisites

Poniższe problemy są kosztami lub osłonami kandydatów, ale same nie zmieniają
struktury feature'u nauki. Nie są więc kandydatami tego rankingu:

| Problem | Klasyfikacja | Dowód | Rola przed zmianą |
|---|---|---|---|
| Brak pełnego E2E ratingu | non-candidate: test gap | `e2e/05-learning-session.spec.ts:11-34`; `context/changes/learning-progress-analysis/research.md:62-76` | osłona przed fazą ratingu |
| CI wyklucza `getNextCard` i toleruje E2E | non-candidate: quality gate | `.github/workflows/ci.yml:55-74` | osobny maintenance change, nie refaktor domenowy |
| Drift README/Node/Astro | non-candidate: documentation/runtime drift | `README.md:22-28`, `.nvmrc:1`, `package.json:34`, `.github/workflows/ci.yml:40-44` | osobny maintenance change |

Żaden z powyższych punktów nie jest odrzuconym refaktorem: są prerequisite'ami
lub niezależnym kosztem. Nie wykryto dodatkowego strukturalnego kandydata,
który można by uczciwie oznaczyć jako odrzucony bez nowego researchu.

## Kontekst kosztu — testy i dokumentacja

- E2E nauki nie wykonuje pełnego ratingu; to luka osłony, nie osobny refaktor strukturalny.
- CI wyklucza `getNextCard` i toleruje E2E failures; to zwiększa ryzyko każdego kandydata.
- Drift README/Node/Astro utrudnia reprodukcję; powinien być osobnym maintenance change.

## Refactor opportunities (ranked)

| Priorytet | Kandydat: obecny → docelowy kształt | Uzasadnienie i blast radius | Inkrementalna ścieżka / prerequisite |
|---:|---|---|---|
| 1 | learning tables z RLS wyłączonym → forward-only policy restore | bezpieczeństwo danych; `supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql:7-8`; request client, migracja i testy A/B | najpierw inwentaryzacja remote schema/policies oraz kontrolowany test A/B; potem nowa migracja |
| 2 | `limit(10)` + JS filter → wąski query/repository seam filtrujący due przed limitem | correctness w gorącym flow; `src/lib/services/learning.service.ts:45-76`; API/service/tests współzmieniały się historycznie | fixture 12 kart i decyzja tie-breaker, potem branch by abstraction |
| 3 | increment przy GET bez presentation → rating-time aggregate/transaction | semantyka postępu i retry; `src/lib/services/learning.service.ts:91-100,159-189`; dotyka modelu, API, SQL i testów | potwierdzić semantykę z właścicielem, dodać characterization refresh/abandon/retry, potem presentation model |

Kandydaci 1–3 pozostają propozycją do decyzji planowania. Brak dodatkowego
odrzuconego kandydata jest jawny w sekcji non-candidates: pozostałe znalezione
problemy są prerequisite'ami albo osobnymi change'ami, a nie refaktorami tej
granicy.

## Ranking decyzji

| Priorytet | Kandydat | Uzasadnienie |
|---:|---|---|
| 1 | RLS | najwyższy potencjalny wpływ bezpieczeństwa; musi być rozwiązany przed twierdzeniem o izolacji danych |
| 2 | selekcja due | najwyższy stosunek correctness do lokalności zmiany; łatwa do demonstracji fixture'em 11+ |
| 3 | moment naliczania | ważny domenowo, lecz wymaga przedstawienia/idempotency, nie prostego przeniesienia jednej linii |

Ranking biznesowego ryzyka różni się od kolejności implementacji. Phase 1 schedulera jest prerequisite'em o małym ryzyku, nie najwyższym findingiem. Tworzy testowalny seam przed zmianami 2–3.

## Weryfikacja twierdzeń (ast-grep)

| Twierdzenie | Werdykt | Dowód | Metoda |
|---|---|---|---|
| Query wybiera najwyżej 10 kart przed filtrem due | potwierdzone | `src/lib/services/learning.service.ts:45-76` | `ast-grep '$QUERY.limit(10)'` + `ast-grep '$CARDS.filter($CALLBACK)'` + `rg` kolejności linii |
| Learning flow ma cztery wywołania `from("learning_sessions")`, wszystkie w `LearningService` | potwierdzone | `src/lib/services/learning.service.ts:16,30,94,136` | `ast-grep '$DB.from("learning_sessions")' src` + `rg` |
| Ostatnia wersjonowana migracja wyłącza RLS obu tabel nauki | potwierdzone | `supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql:7-8` | `rg 'DISABLE ROW LEVEL SECURITY' supabase/migrations` |
| Indeks due istnieje, lecz bieżące query go nie wykorzystuje do filtrowania | potwierdzone dla wersjonowanego SQL/kodu; remote unknown | `supabase/migrations/20240320120000_add_learning_tables.sql:43-46`; `src/lib/services/learning.service.ts:58-76` | `rg 'idx_flashcard_progress_next_review'` + AST/rg query |

Żadne zero z `ast-grep` nie jest tu użyte jako dowód. Weryfikacja nie zmienia
rankingu: ewentualna rozbieżność z remote stanem pozostaje decyzją na etapie
planowania.

```bash
ast-grep run --lang ts --pattern '$QUERY.limit(10)' src/lib/services/learning.service.ts
# dokładnie 1
ast-grep run --lang ts --pattern '$CARDS.filter($CALLBACK)' src/lib/services/learning.service.ts
# dokładnie 1
ast-grep run --lang ts --pattern '$DB.from("learning_sessions")' src
# 4, wszystkie LearningService
rg -n 'cards_reviewed|DISABLE ROW LEVEL SECURITY|ENABLE ROW LEVEL SECURITY' src supabase/migrations
# kontrola literalna, zero wyników nie wystąpiło
```

## Decyzja do planu

Zastosować guard-first + Mikado ordering. Najpierw czysty scheduler i stałe testy bez zmiany API. Dalej osobne fazy: test RLS → forward migration; starvation fixture → query adapter; tests semantyki → presentation/idempotent rating. Każda faza ma osobny rollback i nie łączy migracji danych z refaktorem domenowym.

## Podsumowanie

Trzy rankowane kandydatury są propozycjami opartymi na wersjonowanym kodzie i
migracjach, nie potwierdzeniem stanu hostowanego Supabase. RLS ma najwyższy
potencjalny wpływ, ale wymaga osobnego discovery i decyzji security ownera.
Przeniesienie selekcji due przed limit jest najwęższym findingiem correctness,
który można najpierw scharakteryzować fixture'em z co najmniej jedenastoma
kartami. Semantyka `cards_reviewed` wymaga modelu presentation i atomowego,
idempotentnego zapisu, więc nie może być traktowana jak przesunięcie jednej
instrukcji. Luki E2E, CI i dokumentacji są jawnie sklasyfikowane jako osłony
lub niezależne maintenance work, a nie ukryte „odrzucone” refaktory.
