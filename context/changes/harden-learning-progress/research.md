# Research: harden-learning-progress

## Metoda rankingu

Każdy kandydat oceniono na skali 1–5 dla impactu (security/correctness), częstotliwości ścieżki, confidence dowodów, kosztu i ryzyka migracji. Wynik orientacyjny: `(impact + frequency + confidence) - (cost + migration risk)`. Liczby pomagają porównać; nie zastępują decyzji.

## Kandydat A — przywrócić RLS tabel nauki

**Klasyfikacja:** structural/security candidate.

**Evidence:** migracja tworząca tabele włącza RLS i policies (`20240320120000...:61-173`), a późniejsza jawnie wyłącza RLS (`20240320140000...:6-8`). `rg` znalazł jeden plik wyłączający obie tabele i brak późniejszej migracji je włączającej.

**Historia/intencjonalność:** nazwa i komentarz mówią „temporarily ... during testing”. Nie ma późniejszego rollbacku. Jest to świadomy test workaround, lecz jego obecność w liniowym łańcuchu migracji produkcyjnych wygląda na przypadkowy trwały efekt. Remote state: unknown.

**Migracja:** wymaga forward-only migration, inwentaryzacji remote policies, testów A/B oraz sprawdzenia, czy requestowy klient ma sesję auth. Pierwszy prerequisite: test integracyjny dwóch użytkowników na kontrolowanym Supabase.

| Impact | Frequency | Confidence | Cost | Migration risk | Wynik |
|---:|---:|---:|---:|---:|---:|
| 5 | 5 | 5 | 3 | 5 | 7 |

## Kandydat B — przenieść selekcję due do query/repozytorium

**Klasyfikacja:** structural/correctness candidate.

**Evidence:** AST potwierdza jedno `.limit(10)` na query kart i osobny `cards.filter(...)` później. `rg` potwierdza kolejność linii 60 i 66. Indeks `(user_id, next_review_date)` istnieje w migracji.

**Historia/intencjonalność:** implementacja powstała jako „simple spaced repetition”; dokument endpointu proponował sortowanie po `flashcard_progress.next_review_date`, więc bieżące `created_at + limit + JS filter` nie jest wiernym wykonaniem planu. Nie wiadomo, czy join ordering Supabase sprawiał problemy.

**Migracja:** potrzebne fixtures >10 kart, przypadki null/due/future, decyzja o tie-breaker i adapter query. Można zachować DTO. Pierwszy prerequisite: characterization test udowadniający starvation na obecnym algorytmie.

| Impact | Frequency | Confidence | Cost | Migration risk | Wynik |
|---:|---:|---:|---:|---:|---:|
| 4 | 5 | 5 | 3 | 3 | 8 |

## Kandydat C — naliczać postęp po ratingu

**Klasyfikacja:** domain/correctness candidate.

**Evidence:** GET wykonuje update `cards_reviewed + 1`; rate nie wykonuje update sesji. Plan POST twierdzi, że statystyki sesji są aktualizowane w kroku ratingu. Brak tabeli/kolumny presented-card.

**Historia/intencjonalność:** zachowanie pochodzi z pierwotnej implementacji i było kopiowane w planie GET jako „zapisuje informację o wyświetleniu”. Nazwa `cards_reviewed` i plan POST wskazują inną semantykę. Intencja domenowa wymaga potwierdzenia przez właściciela.

**Migracja:** prosty move update nie wystarczy, bo retry POST może podwójnie naliczać i nie ma dowodu przedstawienia. Wymaga tokenu/rekordu presentation i transakcji lub idempotency key. Pierwszy prerequisite: zdefiniować semantykę i dodać characterization tests refresh/abandon/rate/retry.

| Impact | Frequency | Confidence | Cost | Migration risk | Wynik |
|---:|---:|---:|---:|---:|---:|
| 4 | 5 | 5 | 4 | 4 | 6 |

## Kontekst kosztu — testy i dokumentacja

- E2E nauki nie wykonuje pełnego ratingu; to luka osłony, nie osobny refaktor strukturalny.
- CI wyklucza `getNextCard` i toleruje E2E failures; to zwiększa ryzyko każdego kandydata.
- Drift README/Node/Astro utrudnia reprodukcję; powinien być osobnym maintenance change.

## Ranking decyzji

| Priorytet | Kandydat | Uzasadnienie |
|---:|---|---|
| 1 | RLS | najwyższy potencjalny wpływ bezpieczeństwa; musi być rozwiązany przed twierdzeniem o izolacji danych |
| 2 | selekcja due | najwyższy stosunek correctness do lokalności zmiany; łatwa do demonstracji fixture'em 11+ |
| 3 | moment naliczania | ważny domenowo, lecz wymaga przedstawienia/idempotency, nie prostego przeniesienia jednej linii |

Ranking biznesowego ryzyka różni się od kolejności implementacji. Phase 1 schedulera jest prerequisite'em o małym ryzyku, nie najwyższym findingiem. Tworzy testowalny seam przed zmianami 2–3.

## Drugi audyt strukturalny

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
