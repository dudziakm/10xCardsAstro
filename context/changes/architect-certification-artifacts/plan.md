---
title: Plan formalizacji artefaktów Architecta
created: 2026-08-01
type: implementation-plan
---

# Plan: architect-certification-artifacts

Podejście: wyłącznie dokumentacyjne, addytywne i odwracalne. Jeden commit po
zielonej weryfikacji wszystkich faz.

## Progress

#### Automated

- [x] Baseline i cytaty — `rg`/`ast-grep` potwierdziły nowe cytaty
  strukturalne.
- [x] Lean navigation — root prowadzi do `.ai/`, map, changes, domain i
  historycznej referencji.
- [x] Research formalization — frontmatter, non-candidates, ranking i tabela
  AST są kompletne.
- [x] DDD formalization — metadata, cytaty, inventory ACL i summary są
  kompletne.
- [x] Evidence table — rozróżnia scoped proof, czerwony baseline i manual
  gates.
- [x] Acceptance — docs checks, deliberate-break, targeted suite i
  `git diff --check` są green.

#### Manual

- [ ] `dependency-cruiser` — człowiek akceptuje opisany substytut albo
  autoryzuje dependency change.
- [ ] Semantyka `cards_reviewed` i ordering — decyzja właściciela produktu
  przed fazami RLS/due/rating.
- [ ] Remote RLS i migracje — osobny discovery oraz decyzja security ownera.
- [ ] Publiczne URL-e i formularz Architect — local review, ewentualny push i
  czynność człowieka.

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
