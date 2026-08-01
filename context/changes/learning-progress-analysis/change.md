# Change: learning-progress-analysis

Status: research complete. Typ: analiza read-only poprzedzająca modernizację.

## Cel

Zbudować sprawdzalny model feature'u „sesja nauki → wybór karty → rating → aktualizacja harmonogramu”, bez projektowania docelowej architektury i bez zmian zachowania.

## Pytania

1. Jak żądanie przechodzi od UI do Supabase i wraca do UI?
2. Kiedy karta jest uznawana za przejrzaną?
3. Jak wybierana jest kolejna karta i czy wszystkie due cards są osiągalne?
4. Które niezmienniki wymusza kod, baza i RLS?
5. Które zachowania mają realną osłonę testową?
6. Jaki jest blast radius bezpiecznej modernizacji?

## In scope

- `src/pages/learn.astro`
- `src/components/learning/**`
- `src/pages/api/learn/**`
- `src/lib/schemas/learning.schema.ts`
- `src/lib/services/learning.service.ts`
- DTO nauki w `src/types.ts`
- migracje `learning_sessions` i `flashcard_progress`
- testy unit/API/E2E oraz CI dotyczące flow
- historyczne `.ai` jako źródło intencji, nie prawdy wykonawczej

## Out of scope

- naprawa RLS i migracji,
- zmiana algorytmu wyboru kart,
- zmiana semantyki `cards_reviewed`,
- wdrożenie agregatu `LearningSession`,
- zmiany publicznego kontraktu endpointów,
- deployment.

## Definition of done

- trace E2E z `plik:linia` i diagramem;
- Feature overview i Technical debt jako osobne sekcje;
- macierz test gaps i blast radius;
- lista strukturalnych twierdzeń z audytem `ast-grep` + `rg`;
- wyraźne oddzielenie evidence, inference i unknown;
- brak zmian kodu w ramach samej analizy.

## Źródła

`context/map/repo-map.md`, `.ai/prd.md`, oba plany endpointów nauki, aktualny kod i migracje, testy, `.github/workflows/ci.yml`, historia git.
