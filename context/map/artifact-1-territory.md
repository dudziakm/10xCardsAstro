# Artefakt 1: terytorium repozytorium

Data analizy: 2026-07-31. Repozytorium: `dudziakm/10xCardsAstro`, gałąź `master`.

## Metoda i filtry

Pierwsze okno obejmowało ostatnie 12 miesięcy (`2025-07-31..2026-07-31`). Zawiera ono tylko 10 commitów: 8 aktualizacji Dependabot i 2 ręczne aktualizacje zależności. Nie daje więc wiarygodnej mapy feature'ów. Dla kodu aplikacji użyto dodatkowo pełnej historii `2025-04..2026-07` (119 commitów), jawnie oznaczając tę zmianę okna.

Z zestawień wyłączono `package-lock.json`, snapshoty, `dist/`, `coverage/` i `.astro/`. Historyczne wyniki zawierające `playwright-report/`, `test-results/` i `.vercel/` potraktowano jako szum generowany, nie aktywne źródła. Istnienie ścieżek sprawdzono przez `rg --files`.

Komendy bazowe:

```bash
git log --all --since='2025-07-31T00:00:00' --format='%h %ad %an %s' --date=short
git log --all --name-only --format='' | awk 'NF' | sort | uniq -c | sort -nr
git log --all --format='===%H' --name-only # wejście do analizy co-change
git log --all --format='%an%x09%ae' | sort | uniq -c | sort -nr
```

## Aktywność w czasie

| Okres (author date) | Commity | Interpretacja                                         |
| ------------------- | ------: | ----------------------------------------------------- |
| 2025-04             |      17 | PRD, baza, kontrakty API i początek UI                |
| 2025-06             |      92 | większość implementacji, testów i serii napraw CI/E2E |
| 2025-07..2026-04    |       0 | brak rozwoju produktu                                 |
| 2026-05             |       1 | ręczna aktualizacja Astro 5→6 i zależności            |
| 2026-06             |       1 | Dependabot                                            |
| 2026-07             |       8 | zależności; jeden ręczny fix audytu                   |

Wniosek: aktywność produktowa jest skoncentrowana w krótkim okresie czerwca 2025. Bieżący stack był później aktualizowany bez równoległej aktualizacji dokumentacji produktu.

## Najczęściej zmieniane aktywne pliki

Pełna historia, po usunięciu lockfile'ów i plików generowanych:

| Zmiany | Plik                                          | Sygnał                                                                                                                 |
| -----: | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
|     19 | `package.json`                                | najwyższy churn pliku aktywnego; aktualizacje zależności potwierdzają ryzyko rozjazdu stacku, nie zachowania feature'u |
|     15 | `e2e/05-learning-session.spec.ts`             | najwyższa churn w analizowanym flow; liczne naprawy testów                                                             |
|     14 | `.github/workflows/ci.yml`                    | pipeline był wielokrotnie korygowany                                                                                   |
|     13 | `src/pages/api/learn/session.ts`              | hotspot wyboru karty i statystyk sesji                                                                                 |
|     12 | `playwright.config.ts`                        | niestabilność konfiguracji E2E                                                                                         |
|     11 | `src/middleware/index.ts`                     | auth/Supabase jako przekrojowa granica                                                                                 |
|      9 | `src/components/learning/LearningCard.tsx`    | interakcja reveal/rating                                                                                               |
|      7 | `src/lib/services/learning.service.test.ts`   | osłona części logiki, lecz z mockami bazy                                                                              |
|      6 | `src/lib/services/learning.service.ts`        | centralna implementacja feature'u                                                                                      |
|      6 | `e2e/page-objects/learning.page.ts`           | page object flow nauki                                                                                                 |
|      5 | `src/types.ts`                                | współdzielone DTO, duży blast radius                                                                                   |
|      4 | `src/pages/api/learn/session/rate.ts`         | wejście ratingu                                                                                                        |
|      4 | `src/components/learning/LearningSession.tsx` | orkiestracja UI i obu endpointów                                                                                       |

`e2e/05-learning-session.spec.ts` ma 15 zmian, ale aktualnie tylko cztery testy i nie wykonuje pełnego ratingu. Historia potwierdza redukcję zakresu (`e07ee73`, `7828ec2`, `51e11a8`), więc sam churn nie jest dowodem dobrego pokrycia.

## Co-change

Analiza grupowała ścieżki w: `API`, `service`, `UI-learning`, `E2E`, `migrations`. Dla 30 commitów dotykających feature'u:

| Para/trójka                 | Liczba commitów | Znaczenie                                           |
| --------------------------- | --------------: | --------------------------------------------------- |
| API + service               |               5 | kontrakt endpoint–serwis często zmieniał się razem  |
| API + UI-learning           |               5 | UI jest sprzężone z odpowiedzią endpointu           |
| API + E2E                   |               5 | poprawki endpointu zwykle wymagały korekt E2E       |
| UI-learning + service       |               4 | zachowanie sesji przechodzi przez obie warstwy      |
| API + service + UI-learning |               4 | główny blast radius zachowania                      |
| E2E + UI-learning           |               4 | testy opierają się na widocznych stanach komponentu |
| migrations + service        |               1 | model bazy został wprowadzony razem z serwisem      |

Co-change pokazuje korelację commitów, nie import. Importy i call-site'y są opisane osobno w `artifact-2-structure.md`.

## Hotspoty i ryzyko

1. `src/lib/services/learning.service.ts` łączy wybór karty, statystyki sesji, harmonogram i bezpośredni Supabase.
2. `src/pages/api/learn/session.ts` łączy GET sesji z mutującym resetem postępu.
3. `supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql` jest ostatnią migracją dotyczącą tabel nauki i wyłącza RLS.
4. `.github/workflows/ci.yml` wyłącza testy `getNextCard` przez `--testNamePattern` i nie blokuje merge'a E2E.
5. Dokumenty `README.md`, `.nvmrc`, `package.json` i CI podają odpowiednio Astro 5/Node 22, Astro 7 i Node 20.

## Ograniczenia

- Autor `Claude Code` dominuje historyczne zmiany feature'u; jest automatyzacją, a nie osobą do eskalacji.
- Historia nie dowodzi, że obecne zachowanie jest zamierzone.
- Brak telemetryki produkcyjnej i informacji o użyciu sesji nauki.
- Brak współczesnych commitów produktowych oznacza, że pełna historia była konieczna, ale zwiększa ryzyko analizy nieaktualnych ścieżek; każda wskazana ścieżka została ponownie sprawdzona w HEAD.
