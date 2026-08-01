---
title: Architect certification evidence
created: 2026-08-01
type: evidence-ledger
status: local-review
---

# Architect certification evidence

Ten rejestr rozdziela dowody lokalne od twierdzeń wymagających publicznego
repozytorium lub środowiska hostowanego. Nie jest potwierdzeniem deployu,
statusu GitHub Actions, remote Supabase ani wysłania formularza.

## Local evidence table

| Wymaganie / artefakt | Dowód lokalny | Stan i granica dowodu |
|---|---|---|
| Lean repository navigation | [root `CLAUDE.md`](../../CLAUDE.md), [mapa repo](../map/repo-map.md), [szczegółowa referencja](../../docs/legacy-development.md) | lokalny; linki i frontmatter podlegają acceptance checkowi tego change |
| Research refaktoru | [research](../changes/harden-learning-progress/research.md) z tabelą AST, non-candidates i rankingiem | lokalny; remote RLS oraz telemetryka są jawnie `unknown` |
| DDD / aggregate / ACL | [destylacja](../domain/01-domain-distillation.md), [aggregate](../domain/02-invariant-aggregate-refactor.md), [ACL](../domain/03-anti-corruption-layer.md) | lokalne plany; nie deklarują implementacji agregatu, ACL ani migracji |
| Phase 1 — czysty scheduler | [`e5f8c0b`](https://github.com/dudziakm/10xCardsAstro/commit/e5f8c0bbcab05ec02804b054ef7b2f8011dd8689), `src/lib/services/review-scheduler.ts:12-42`, `src/lib/services/review-scheduler.test.ts:1-60` | historyczny, wersjonowany proof; bieżący scope nie zmienia kodu scheduler'a |
| Scoped characterization | `env -u OPENROUTER_API_KEY -u OPENAI_API_KEY npm run test:run -- src/lib/services/review-scheduler.test.ts src/lib/services/learning.service.test.ts` | **passed 2026-08-01:** 2 files, 24 tests; nie zastępuje pełnego CI |
| Baseline projektu | `.github/workflows/ci.yml:55-74` | baseline z audytu przed tym change jest czerwony; workflow dodatkowo wyklucza `getNextCard` i toleruje E2E, dlatego **nie ma** twierdzenia „CI green” |

## Public / manual gates

| Bramka | Status | Co jest potrzebne |
|---|---|---|
| `dependency-cruiser` | pending — poza zakresem | decyzja człowieka o substytucie albo jawna zgoda na dependency change |
| Publiczne immutable URL-e dla bieżącego commit | pending — po local commit | człowiek wybiera push; po pushu uzupełnia permalink do tego change i jego artefaktów |
| Remote RLS i migracje | pending — discovery | kontrolowane środowisko, test A/B oraz decyzja security ownera |
| Semantyka `cards_reviewed` i due ordering | pending — product decision | decyzja właściciela produktu przed kolejnymi fazami |
| Formularz 10xArchitect | pending — human action | local review, ewentualny push, wymagane URL-e i samodzielne wysłanie formularza |

## Reading the result

Zielony scoped test po tym change potwierdza tylko istniejący scheduler i testy
serwisu, bez kluczy OpenAI/OpenRouter. Czerwony baseline nie jest naprawiany
w tym dokumentacyjnym scope i nie może być ukryty przez wynik scoped checka.
Dokumentacja zawiera executable citations, ale ich poprawność nie potwierdza
zachowania infrastruktury zewnętrznej. Do certyfikacji publicznej potrzebne
są nadal manual gates z tabeli powyżej.
