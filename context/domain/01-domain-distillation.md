---
title: Destylacja domeny nauki
created: 2026-07-31
type: domain-distillation
---

# 01 — Destylacja domeny nauki

## Źródła i poziom zaufania

| Źródło | Rola | Zaufanie |
|---|---|---|
| `.ai/prd.md:29-34,109-119` | problem, user story i kryteria | intencja biznesowa |
| `.ai/api-impl-get-learn-session.md:70-87` | plan przepływu prezentacji | intencja techniczna |
| `.ai/api-impl-post-learn-session-rate.md:88-131` | plan ratingu i reguły harmonogramu | intencja techniczna, częściowo niespójna z kodem |
| `src/components/learning/LearningCard.tsx:11-29,111-126` | język UI i faktyczny user flow | zachowanie aktualne |
| `src/lib/services/learning.service.ts:11-125,128-208` | reguły wykonawcze/persistence | zachowanie aktualne |
| `supabase/migrations/20240320120000_add_learning_tables.sql:7-63`; `supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql:7-8` | constraints i authorization | wersjonowany model, remote unknown |

## Ubiquitous Language

| Termin domenowy | Definicja robocza | Obecny odpowiednik i dowód |
|---|---|---|
| Fiszka (`Flashcard`) | treść z przodem i tyłem należąca do użytkownika | `flashcards`: `src/lib/services/learning.service.ts:45-58` |
| Sesja nauki (`Learning Session`) | aktywny okres, w którym użytkownik otrzymuje i ocenia karty | `learning_sessions`: `src/lib/services/learning.service.ts:14-39` |
| Przedstawienie karty (`Card Presentation`) | fakt, że konkretna karta została wydana do konkretnej sesji | **BRAK w kodzie**: rate sprawdza tylko session/card ownership, `src/lib/services/learning.service.ts:134-157` |
| Odsłonięcie (`Reveal`) | lokalna akcja pokazująca tył; warunek UX przed ratingiem | `isFlipped`/`handleFlip`: `src/components/learning/LearningCard.tsx:11-29` |
| Rating | samoocena 1..5 po reveal | Zod + `rateFlashcard`: `src/lib/schemas/learning.schema.ts:7-11`; `src/lib/services/learning.service.ts:128-208` |
| Powtórka (`Review`) | zaakceptowany rating karty przedstawionej w sesji | rozjazd: GET zwiększa licznik, `src/lib/services/learning.service.ts:91-100` |
| Postęp karty (`Flashcard Progress`) | liczba powtórek, trudność i następny termin | schema/query: `supabase/migrations/20240320120000_add_learning_tables.sql:19-31`; `src/lib/services/learning.service.ts:159-189` |
| Termin powtórki (`Due Date`) | moment, od którego karta kwalifikuje się do sesji | `next_review_date`: `src/lib/services/learning.service.ts:64-76` |
| Harmonogram (`Review Schedule`) | wynik ratingu: nowa trudność i termin | `ReviewScheduler`: `src/lib/services/review-scheduler.ts:12-42` |
| Karta należna (`Due Card`) | brak progress/terminu lub termin ≤ now | filtr due: `src/lib/services/learning.service.ts:62-88` |
| Przejrzane karty (`Cards Reviewed`) | liczba zakończonych ratingiem powtórek w sesji | `cards_reviewed` jest zwracane po inkremencie GET: `src/lib/services/learning.service.ts:91-124` |

Zakazane zamienniki w nowym modelu: „pobrana karta” ≠ „powtórzona karta”; „reveal” ≠ „rating”; „progress record” ≠ „learning session”.

## Core / Supporting / Generic

| Subdomena | Klasa | Uzasadnienie |
|---|---|---|
| decyzja co pokazać i kiedy pokazać ponownie | Core | główna wartość skutecznej nauki |
| przebieg sesji i ważność ratingu | Core | chroni znaczenie metryk i harmonogramu |
| authoring/CRUD fiszek | Supporting | dostarcza treść do nauki |
| generowanie AI | Supporting | przyspiesza authoring, nie definiuje review |
| auth/identity | Generic | Supabase Auth |
| persistence/database | Generic | PostgreSQL/Supabase |
| HTTP/UI | Generic delivery | transportuje komendy i widoki |

## Zdarzenia, komendy, reguły

```text
StartLearningSession
  → LearningSessionStarted

RequestNextCard(now)
  → DueCardSelected
  → CardPresented(sessionId, flashcardId, presentationId, at)

RevealCard(presentationId)
  → CardRevealed (opcjonalne zdarzenie UI; serwer może go nie wymagać w MVP)

RatePresentedCard(presentationId, rating, now)
  → CardRated
  → ReviewScheduled
  → SessionProgressIncremented
```

Reguły:

- tylko właściciel sesji może wykonywać komendy;
- sesja musi być aktywna;
- selected card należy do tego samego użytkownika;
- rating dotyczy niezużytego presentation w tej sesji;
- rating 1..5;
- jeden presentation jest konsumowany najwyżej raz;
- progress jest unikalny per user+card;
- clock jest wejściem use case, nie ukrytą zależnością.

## Kandydaci na agregaty

### LearningSession — kandydat priorytetowy

Chroni aktywność sesji, listę/przynajmniej referencje przedstawień, jednokrotne ratingi i licznik zakończonych reviews. Granica transakcji: consume presentation + session reviewed count; aktualizacja progress może być w tej samej transakcji use case/repository.

### FlashcardProgress

Chroni monotoniczny `review_count`, difficulty bounds i schedule wynikający z ratingu. Może być encją/agregatem zależnie od granicy transakcji; unikalność zapewnia DB.

### Flashcard

Istniejący supporting aggregate authoringu. W flow nauki potrzebna jest tylko referencja/snapshot, nie pełna edycja.

## MODEL vs KOD

| Model | Kod | Rozjazd |
|---|---|---|
| review kończy się ratingiem | GET zwiększa `cards_reviewed` | krytyczny |
| rating dotyczy przedstawionej karty | sprawdzana jest tylko własność karty i sesji | krytyczny |
| due selection obejmuje cały zbiór | tylko 10 najstarszych trafia do filtra | wysoki |
| izolacja per user | końcowa migracja wyłącza RLS | krytyczny/security |
| rating aktualizuje sesję i progress spójnie | session update i progress żyją w osobnych requestach | wysoki |
| „losowo” z PRD | kod wybiera pierwszą due | nieustalona semantyka |
| zewnętrzny algorytm z PRD | własna prosta formuła | dokumentacyjny/produktowy |
| zakończenie sesji | `ended_at/is_active` istnieją, UI tylko nawiguje | luka lifecycle |

## Ranking dalszej analizy

1. **LearningSession aggregate / presented-before-rated** — zbiera trzy najważniejsze invariants i naprawia znaczenie licznika.
2. **DueCardPolicy/Repository** — eliminuje starvation i wyjaśnia ordering.
3. **FlashcardProgress** — matematyka ma już czysty scheduler, ale transakcja/idempotency nadal wymaga modelu.

RLS jest findingiem priorytetowym, lecz Generic/security control, nie kandydatem na agregat.

## Hotspoty do Event Stormingu z właścicielem

- Czy samo przedstawienie liczy aktywność, a rating „reviewed”?
- Czy reveal musi być potwierdzony serwerowo?
- Czy użytkownik może ratingować tę samą prezentację ponownie po błędzie sieci?
- Co ma pierwszeństwo: never-reviewed, most overdue czy losowanie?
- Kiedy i jak kończy się sesja?

## Unknown

Telemetryka, SLA, rzeczywisty wolumen, produktowa definicja losowości, remote RLS i oczekiwana obsługa concurrent tabs.

## Podsumowanie

Rdzeniem slice'u nauki jest decyzja o poprawnym przedstawieniu i ocenieniu
fiszki, a nie sam transport HTTP ani przechowywanie w Supabase. W aktualnym
kodzie `LearningSession` i `FlashcardProgress` istnieją przede wszystkim jako
wiersze persistence, dlatego nie chronią jeszcze niezmienników sesji.
Najważniejszy rozjazd dotyczy znaczenia `cards_reviewed`: kod zwiększa licznik
podczas wydania karty, choć model wiąże review z zaakceptowanym ratingiem.
Drugim rozjazdem jest brak trwałego `CardPresentation`, przez co serwis może
ocenić własną kartę, której ta sesja nigdy nie przedstawiła. `ReviewScheduler`
pozostaje użytecznym czystym komponentem supporting, ale nie ustanawia granicy
transakcji. RLS, remote konfiguracja i produktowa definicja losowości są
świadomie oznaczone jako `unknown`, więc nie są przedstawiane jako fakty.
