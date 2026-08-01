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
| dependency-cruiser graph | [konfiguracja](../../.dependency-cruiser.cjs), `npm run analyze:dependencies`, [Artifact 2](../map/artifact-2-structure.md) | lokalny, reprodukowalny import graph: 65 modules/104 dependencies/no violations; nie dowodzi relacji HTTP ani remote security |
| Research refaktoru | [research](../changes/harden-learning-progress/research.md) z tabelą AST, non-candidates i rankingiem | lokalny; remote RLS oraz telemetryka są jawnie `unknown` |
| DDD / aggregate / ACL | [destylacja](../domain/01-domain-distillation.md), [aggregate](../domain/02-invariant-aggregate-refactor.md), [ACL](../domain/03-anti-corruption-layer.md) | lokalne plany; nie deklarują implementacji agregatu, ACL ani migracji |
| Phase 1 — czysty scheduler | [`e5f8c0b`](https://github.com/dudziakm/10xCardsAstro/commit/e5f8c0bbcab05ec02804b054ef7b2f8011dd8689), `src/lib/services/review-scheduler.ts:12-42`, `src/lib/services/review-scheduler.test.ts:1-60` | historyczny, wersjonowany proof; bieżący scope nie zmienia kodu scheduler'a |
| Scoped characterization | `env -u OPENROUTER_API_KEY -u OPENAI_API_KEY npm run test:run -- src/lib/services/review-scheduler.test.ts src/lib/services/learning.service.test.ts` | **passed 2026-08-01:** 2 files, 24 tests; nie zastępuje pełnego CI |
| Security remediation | `context/changes/architect-security-remediation/`, `npm audit --omit=dev`, `npm run security:check` | **passed locally 2026-08-01:** non-forced lockfile refresh resolves all audit findings; checker remains fail-closed (synthetic high finding exited 1) |
| Remote Architect CI | [run 30715344478](https://github.com/dudziakm/10xCardsAstro/actions/runs/30715344478) | **passed 2026-08-01:** security, unit, scheduler, build and E2E green on `ce157b6`; configured E2E remains a known coverage boundary |
| Baseline projektu | `.github/workflows/ci.yml:55-74` | current CI still excludes `getNextCard` and tolerates E2E, so a green run proves configured gates, not comprehensive product coverage |

## Public / manual gates

| Bramka | Status | Co jest potrzebne |
|---|---|---|
| `dependency-cruiser` | complete | wersjonowana konfiguracja, Artifact 2 i CI w PR #25 |
| Publiczne immutable URL-e dla bieżącego commit | [PR #25](https://github.com/dudziakm/10xCardsAstro/pull/25) | current evidence revision [`ce157b6`](https://github.com/dudziakm/10xCardsAstro/commit/ce157b656eb4c78248c3ee1d99fb1aad6ebbb6d6) and tracked M4 artifacts |
| Remote RLS i migracje | pending — discovery | kontrolowane środowisko, test A/B oraz decyzja security ownera |
| Semantyka `cards_reviewed` i due ordering | pending — product decision | decyzja właściciela produktu przed kolejnymi fazami |
| Formularz 10xArchitect | pending — human action | local review, ewentualny push, wymagane URL-e i samodzielne wysłanie formularza |

## Reading the result

Zielony scoped test po tym change potwierdza tylko istniejący scheduler i testy
serwisu, bez kluczy OpenAI/OpenRouter. Remediacja lockfile'a usuwa obecne
advisory, lecz nie udaje, że skonfigurowany zakres CI równoważy pełne testy
produktu. Zdalny CI URL powyżej jest dowodem aktualnego zielonego pipeline'u,
nie dowodem rozstrzygnięcia product decisions lub zdalnej polityki RLS.
Dokumentacja zawiera executable citations, ale ich poprawność nie potwierdza
zachowania infrastruktury zewnętrznej. Do certyfikacji publicznej potrzebne
są nadal manual gates z tabeli powyżej.
