# Plan: harden-learning-progress

Podejście: guard-first, Branch by Abstraction dla persistence, forward-only migrations i małe odwracalne fazy. Jedna faza = jeden niezależny review/rollback.

## Opublikowane dowody

- Draft PR: <https://github.com/dudziakm/10xCardsAstro/pull/25>
- Commit Phase 1: [`e5f8c0b`](https://github.com/dudziakm/10xCardsAstro/commit/e5f8c0bbcab05ec02804b054ef7b2f8011dd8689)
- Run CI: <https://github.com/dudziakm/10xCardsAstro/actions/runs/30659996423>
- Zielony job `ReviewScheduler characterization` (24/24):
  <https://github.com/dudziakm/10xCardsAstro/actions/runs/30659996423/job/91253680496>
- Czerwony istniejący `unit-tests` baseline:
  <https://github.com/dudziakm/10xCardsAstro/actions/runs/30659996423/job/91253680419>
- Czerwony istniejący `security` baseline:
  <https://github.com/dudziakm/10xCardsAstro/actions/runs/30659996423/job/91253680543>

Nowy job schedulera jest zielony; cały legacy pipeline nie jest przedstawiany
jako zielony. `unit-tests` zatrzymuje 11 istniejących błędów Prettier w
generowanym `src/db/database.types.ts`, a `security` raportuje 7 advisories
(1 low, 6 high) przy lockfile niezmienionym przez PR. Stare joby używają Node 20,
poniżej wymagania Astro 7 (`>=22.12`). Wszystkie te punkty są baseline'em poza
małą Phase 1, nie sukcesem refaktoru.

## Automated progress

| Faza                             | Status                             | Dowód                                                                                                                                 |
| -------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Research i safety baseline    | partial                            | mapa/research i characterization formuł gotowe; endpoint snapshots oraz testy refresh/retry/card-11 pozostają guardami przyszłych faz |
| 1. Pure ReviewScheduler          | implemented and direct suite green | scheduler + dotknięty `LearningService` mają 24/24; typecheck/build przechodzą; pełne repo ma niezwiązany czerwony baseline           |
| 2. RLS guard + forward migration | pending                            | poza sprintowym refaktorem                                                                                                            |
| 3. Due-card query                | pending                            | poza sprintowym refaktorem                                                                                                            |
| 4. Rating-time progress          | pending                            | poza sprintowym refaktorem                                                                                                            |
| 5. Aggregate + ACL consolidation | pending                            | plan DDD, osobny change                                                                                                               |

## Wyniki weryfikacji Phase 1 (2026-07-31)

| Check                                                                                                                                             | Wynik                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                | PASS                                                                                                                                    |
| standalone TypeScript: `tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict src/lib/services/review-scheduler.ts` | PASS                                                                                                                                    |
| Node smoke: 5 ratingów + expected dates/difficulty + clock immutability                                                                           | PASS                                                                                                                                    |
| `ast-grep` delegacji `reviewScheduler.schedule(...)`                                                                                              | 1 produkcyjne wystąpienie, oczekiwane                                                                                                   |
| diff API/DTO/schema/migrations                                                                                                                    | pusty — kontrakt i SQL nietknięte                                                                                                       |
| targeted Vitest: `review-scheduler.test.ts`                                                                                                       | PASS: 14/14 (`OPENROUTER_API_KEY` usunięty z procesu testowego)                                                                         |
| bezpośrednio dotknięte suites: scheduler + LearningService                                                                                        | PASS: 24/24                                                                                                                             |
| CI scheduler gate                                                                                                                                 | osobny blokujący job `ReviewScheduler characterization` uruchamia 24 bezpośrednie testy; scheduler dodany też do istniejącej listy unit |
| pełny Vitest bez realnego sekretu                                                                                                                 | 88/101 PASS; 13 istniejących failures poza schedulerm: OpenRouter env isolation (10), FlashcardForm/native validation (3)               |
| `npm run astro -- check`                                                                                                                          | PASS: 0 errors, 1 hint w istniejącym `src/test/setup.ts`                                                                                |
| `npm run build`                                                                                                                                   | PASS                                                                                                                                    |
| `npm run lint`                                                                                                                                    | FAIL: 11 istniejących błędów Prettier w generowanym `src/db/database.types.ts`; 2 ostrzeżenia endpointu                                 |

Pierwsza bezsieciowa próba `npm ci --offline --ignore-scripts` zakończyła się
`ENOTCACHED`. Główny audyt następnie wykonał zwykłe `npm ci` (bez zmiany
lockfile'a) i uruchomił pełne bramki. To ujawniło czerwony baseline repo, ale
oba bezpośrednio dotknięte suites są zielone. Pełne failures nie są naprawiane
w Phase 1, ponieważ dotykają innych feature'ów i nie mieszczą się w małym,
odwracalnym refaktorze.

Podczas pierwszego pełnego uruchomienia istniejący test OpenRoutera odziedziczył
realną zmienną środowiskową i wypisał jej wartość w failure diff. Klucz należy
zrotować; kolejne testy muszą używać `env -u OPENROUTER_API_KEY`. Sekret nie
znajduje się w plikach ani w diffie tej zmiany.

## Phase 0 — characterization i baseline

1. Zablokuj publiczne sygnatury obu endpointów i DTO snapshotami/testami kontraktu.
2. Zachowaj istniejące oczekiwane wartości formuł: bazowe 1/2/4/7/14 dni, difficulty adjustment, review multiplier i clamp.
3. Dodaj przypadki: GET refresh nie powinien liczyć, rating liczy raz, retry rating nie liczy drugi raz, due card na pozycji 11.
4. Uruchom unit/typecheck/lint/build przed zmianą.

Stan: istniejące testy formuły były characterization source. Pierwsza próba
baseline bez zależności nie wystartowała; po `npm ci` pełny wynik bez realnego
sekretu to 88/101, a bezpośrednio dotknięte suites przechodzą 24/24. Endpoint
snapshots oraz testy refresh/retry/card-11 nie są oznaczone jako wykonane —
chronią odpowiednio późniejsze fazy 3 i 4, które pozostają poza implementacją.

```text
npm run test:run -- src/lib/services/learning.service.test.ts ...
sh: vitest: command not found
```

Ten historyczny komunikat nie jest końcowym wynikiem bramki; aktualny wynik jest
w tabeli „Wyniki weryfikacji Phase 1”.

## Phase 1 — wydziel czysty ReviewScheduler (wykonana)

Zmiany:

1. Dodaj `ReviewScheduler.schedule(rating, reviewCount, currentDifficulty, now)`.
2. Przenieś wyłącznie istniejące formuły bez korekty algorytmu.
3. Wstrzyknij scheduler do `LearningService` z kompatybilnym defaultem.
4. Przekaż `new Date()` z serwisu; scheduler nie czyta zegara.
5. Przenieś/rozszerz unit tests na pięć ratingów, multipliery, bounds i brak mutacji `now`.

Kryteria: brak zmian endpointów/DTO/SQL; wszystkie bezpośrednie testy Phase 1.
Pełny czerwony baseline pozostaje jawny i nie jest przypisywany schedulerowi.
Rollback opisuje `plan-brief.md`.

## Phase 2 — RLS przed optymalizacją

Guard:

1. Uruchom kontrolowany Supabase z user A/B.
2. Testuj SELECT/INSERT/UPDATE/DELETE dla `learning_sessions` i `flashcard_progress`.
3. Potwierdź remote migration history i policies; unknown blokuje deploy.

Zmiana:

4. Dodaj nową forward-only migration `enable_learning_rls` (nie edytuj historii).
5. Odtwórz idempotentnie wymagane policies i włącz RLS.
6. Usuń testowe obejście z procedury deploymentu, nie z historycznego SQL.

Verify: A działa na swoich danych, A nie widzi/mutuje B, anon nie ma dostępu. Rollback: osobna awaryjna migracja tylko po decyzji security ownera; preferować naprawę policy zamiast disable RLS.

## Phase 3 — query due bez starvation

Guard:

1. Fixture 12 kart: pierwsze 10 future, 11 due, 12 never reviewed.
2. Charakterystyka obecnego failure i kontraktu response.
3. Ustal tie-breaker: overdue first, potem `next_review_date`, potem `created_at/id`.

Zmiana:

4. Wprowadź wąski `LearningRepository.nextDueCard(userId, now)` (Branch by Abstraction).
5. Filtruj due/null w SQL/RPC przed `limit(1)`.
6. Zachowaj mapowanie DTO w application layer.

Verify: karta 11 jest osiągalna; future cards nie są zwracane; query plan używa indeksu. Rollback: feature flag/adapter starego query.

## Phase 4 — presented-before-rated i licznik po ratingu

Guard:

1. Testy refresh/abandon: 0 reviewed.
2. Test reveal/rating: +1.
3. Test retry tego samego ratingu: nadal +1 lub jawny conflict.
4. Test rating karty nieprzedstawionej: named domain error / HTTP 409 lub 422 (decyzja kontraktu przed kodem).

Zmiana:

5. Dodaj presentation id/token lub encję session item z unique constraint.
6. GET rejestruje `CardPresented`, ale nie zwiększa `cards_reviewed`.
7. Rating w jednej transakcji weryfikuje presentation, zapisuje progress, konsumuje presentation i zwiększa licznik.
8. Dodaj idempotency constraint/key.

Verify: invariants, race/retry, session ownership, API compatibility. Rollback: dual-read presentation za flagą; nie usuwaj danych w rollbacku.

## Phase 5 — aggregate i ACL

Wprowadź `LearningSession` aggregate i `LearningProgressRepository` port przez Branch by Abstraction, zgodnie z `context/domain/02...` i `03...`. Usuń Supabase SDK z domeny/aplikacji dopiero po parity tests. To osobny post-MVP change.

## Quality gates każdej fazy

1. plan success criteria;
2. deliberate-break: zmień oczekiwaną formułę/invariant i potwierdź czerwony test;
3. relevant unit/integration;
4. `npm run test:run`;
5. `npm run lint`;
6. `npx astro check`;
7. `npm run build`;
8. dla faz DB: RLS A/B i migration rehearsal;
9. dla user flow: blokujące E2E reveal→rate→next.

## Manual checklist

- [ ] Właściciel potwierdził semantykę `cards_reviewed`.
- [ ] Remote Supabase schema/policies zinwentaryzowane.
- [ ] Query plan sprawdzony na realistycznym wolumenie.
- [ ] Pełny flow sprawdzony w przeglądarce.
- [ ] Rollback/runbook zatwierdzony przed migracją.
