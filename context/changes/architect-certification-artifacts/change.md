---
title: Architect certification artifacts
created: 2026-08-01
type: documentation-change
status: implemented
---

# Change: architect-certification-artifacts

## Cel

Domknąć formalne dowody pracy z Modułu 4 bez zmiany zachowania aplikacji.
Zmiana ma uczynić instrukcje nawigacyjne, research refaktoru, trzy artefakty
DDD i tabelę dowodów audytowalnymi względem lokalnych promptów M4.

## In scope

- lean `CLAUDE.md` oraz przeniesione referencje operacyjne;
- `context/changes/harden-learning-progress/research.md`;
- trzy pliki w `context/domain/`;
- `context/evidence/architect.md`;
- tylko dokumentacyjna decyzja o braku `dependency-cruiser` w tym change.

## Out of scope

- kod w `src/`, testy aplikacji, konfiguracja CI i zależności;
- RLS, migracje, due-card query, aggregate, ACL i RPC;
- push, deploy, hosted Supabase, sekrety, GitHub statusy i formularz odznaki.

## Definition of done

- root prowadzi do rzeczywistych źródeł wiedzy bez kopiowania referencji;
- research i plany DDD mają wymagane metadata, ślady dowodów i podsumowania;
- dowody Architecta rozróżniają local/remote, zielony scoped check i czerwony
  baseline;
- wszystkie cytaty plik:linia i relative links są sprawdzone;
- finalny diff nie dotyka kodu aplikacji, dependency ani workflow.

## Completion boundary

Status `implemented` oznacza wyłącznie ukończenie automatyzowalnego,
dokumentacyjnego zakresu tego change. Nie oznacza zielonego pełnego CI,
zweryfikowanego remote RLS, publicznego permalinku ani wysłanego formularza;
te niezależne bramki pozostają manual pending w planie i evidence ledgerze.
