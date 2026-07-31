# Plan brief: harden-learning-progress

## Decyzja

Modernizujemy flow inkrementalnie, zachowując `GET /api/learn/session`, `POST /api/learn/session/rate` oraz obecne DTO. Pierwsza implementowana faza wydziela czysty `ReviewScheduler`. Nie naprawia RLS, wyboru kart ani licznika — tworzy seam i safety harness potrzebny przed tymi zmianami.

## Dlaczego ten slice

- nie wymaga migracji ani zdalnego Supabase;
- jest odwracalny jednym małym diffem;
- istniejące prywatne testy wzoru dostarczają characterization values;
- jawny parametr `now` usuwa zależność od globalnego zegara;
- nie zmienia warstwy transportowej ani persistence.

## Mikado prerequisites

```text
Bezpieczna zmiana licznika
  ├─ semantyka "reviewed" potwierdzona
  ├─ presented-card record/token
  ├─ idempotent rating
  └─ transakcja repozytorium

Bezpieczna zmiana wyboru
  ├─ fixture >10 kart
  ├─ tie-breaker zdefiniowany
  └─ port query/repository

Bezpieczne RLS
  ├─ inwentaryzacja remote schema
  ├─ test user A/B
  └─ forward migration + rollback runbook

Wspólny prerequisite
  └─ deterministyczny ReviewScheduler + unit tests
```

## Success Phase 1

- formuły i wartości dla ratingów 1..5 identyczne;
- caller przekazuje zegar;
- `LearningService` zachowuje publiczne metody;
- testy schedulera nie wymagają DB;
- diff nie dotyka API, UI, migracji i `.claude/`/`.agents/`.

## Rollback

Przywrócić dwie prywatne metody w `LearningService`, usunąć injection/default `ReviewScheduler` oraz dwa nowe pliki. Nie ma migracji ani transformacji danych.

## Non-goals tego slice'a

RLS, starvation, counter timing, idempotency, aggregate i ACL pozostają zaplanowane. Ich przypadkowe dołączenie unieważniłoby mały blast radius.

## Evidence do review

- `src/lib/services/review-scheduler.ts`
- `src/lib/services/review-scheduler.test.ts`
- adaptacja characterization tests w `learning.service.test.ts`
- delegacja w `learning.service.ts`
- wyniki quality gate w `plan.md`
