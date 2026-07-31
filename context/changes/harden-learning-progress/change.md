# Change: harden-learning-progress

Status: plan accepted by certification sprint; only Phase 1 implemented.

## Problem

Flow nauki ma trzy potwierdzone klasy ryzyka:

1. wersjonowana baza kończy z wyłączonym RLS dla `learning_sessions` i `flashcard_progress`;
2. wybór karty ogranicza dane do 10 najstarszych przed sprawdzeniem due;
3. `cards_reviewed` rośnie przy pobraniu karty, zanim użytkownik ją oceni.

Logika harmonogramu jest dodatkowo prywatną częścią serwisu sprzężonego z Supabase, co utrudnia zbudowanie osłony przed naprawą wyższych ryzyk.

## Outcome

- bezpieczeństwo danych jest egzekwowane w bazie i testowane dla dwóch użytkowników;
- każda należna karta jest osiągalna niezależnie od pozycji utworzenia;
- karta liczy się jako reviewed dopiero po prawidłowym ratingu;
- rating działa tylko dla karty przedstawionej w aktywnej sesji;
- matematyka harmonogramu jest czysta, deterministyczna i chroniona testami;
- publiczne URL-e, statusy i DTO pozostają stabilne podczas migracji.

## Niezmienniki

1. Karta należy do użytkownika wykonującego operację.
2. Sesja należy do użytkownika i jest aktywna.
3. Karta musi zostać przedstawiona w tej sesji przed ratingiem.
4. Rating jest liczbą całkowitą 1..5.
5. `cards_reviewed` wzrasta po udanym ratingu, nie po GET.
6. Istnieje najwyżej jeden rekord postępu dla `(user_id, flashcard_id)`.
7. Zapis progress i postępu sesji jest atomowy lub odporny na retry.

## In scope całego planu

Test harness, czysty scheduler, forward-only RLS migration, query due w bazie, poprawa momentu naliczania, model presented-card/aggregate oraz port+adapter Supabase.

## Ograniczenie sprintu

Implementowana jest wyłącznie odwracalna Phase 1: `ReviewScheduler` i unit/characterization tests. RLS, query, licznik, migracje i model domeny pozostają planem; nie wolno ich łączyć w jeden refaktor przed osobną weryfikacją środowiska Supabase.

## Kryteria akceptacji Phase 1

- scheduler nie importuje Supabase/Astro i nie czyta czasu globalnie;
- pięć ratingów, multipliery i bounds mają stałe testy;
- `LearningService.rateFlashcard` deleguje obliczenia do schedulera;
- sygnatury endpointów, `LearningService.rateFlashcard` i DTO nie zmieniają się;
- pełny quality gate jest uruchomiony lub blocker jest udokumentowany bez fałszywego „green”.
