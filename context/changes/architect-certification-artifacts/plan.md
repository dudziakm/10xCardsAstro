---
title: Plan formalizacji artefaktów Architecta
created: 2026-08-01
type: implementation-plan
---

# Plan: architect-certification-artifacts

Podejście: wyłącznie dokumentacyjne, addytywne i odwracalne. Jeden commit po
zielonej weryfikacji wszystkich faz.

## Automated Progress

| Faza | Status | Kryterium sukcesu |
|---|---|---|
| 0. Baseline i cytaty | completed | `rg`/`ast-grep` potwierdziły każdy nowy cytat strukturalny |
| 1. Lean navigation | completed | root linkuje do `.ai/`, mapy, changes i domain; referencje są przeniesione |
| 2. Research formalization | completed | frontmatter, non-candidates, ranking i tabela AST są kompletne |
| 3. DDD formalization | completed | metadata, cytaty, inventory ACL i summary są kompletne |
| 4. Evidence table | completed | tabela rozróżnia scoped proof, czerwony baseline i manual gates |
| 5. Acceptance | completed | docs checks, deliberate-break, targeted suites i `git diff --check` są green |

## Manual Progress

| Temat | Status | Właściciel / warunek |
|---|---|---|
| `dependency-cruiser` | pending | decyzja człowieka: zaakceptować opisany substytut albo autoryzować dependency change |
| Semantyka `cards_reviewed` i ordering | pending | właściciel produktu przed fazami RLS/due/rating |
| Remote RLS i migracje | pending | osobny discovery + decyzja security ownera |
| Publiczne URL-e i formularz Architect | pending | człowiek po local review i ewentualnym pushu |

## Guardrails

- Nie implementować kodu, testów aplikacji, dependency-cruiser, migracji,
  RLS, aggregate, ACL ani poprawek CI.
- Nie przedstawiać całego CI jako zielonego: green jest wyłącznie scoped job
  `ReviewScheduler characterization`.
- Nie wykonywać push, deploy, hosted operations, auth ani submit formularza.

## Verification

1. Parsowanie YAML frontmatter i sprawdzenie wymaganych kluczy.
2. Walidacja lokalnych cytatów `plik:linia` i relative links.
3. `ast-grep` + `rg` dla tabeli twierdzeń researchu i inventory ACL.
4. Deliberate-break: tymczasowe usunięcie cytatu, celowany checker musi paść,
   następnie przywrócenie pliku.
5. `git diff --check` i targeted testy schedulera/LearningService bez kluczy.
