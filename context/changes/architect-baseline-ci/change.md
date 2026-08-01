---
title: Architect baseline CI deterministic repairs
created: 2026-08-01
updated: 2026-08-01
type: code-change
status: implemented
---

# Change: architect-baseline-ci

## Goal

Repair only deterministic blockers in the legacy Architect baseline: Node
runtime parity in CI, a real lint error, deterministic isolation from
`OPENROUTER_API_KEY`, and tests whose assertions contradict the currently
intentional native form behaviour.

## In scope

- align GitHub Actions Node version with `.nvmrc`;
- correct linting in source without disabling rules or adding ignores;
- make tests independent of ambient `OPENROUTER_API_KEY`;
- make `FlashcardForm` tests assert native required, disabled and no-save
  behaviour already intended by the component;
- add regression coverage and factual evidence for the resulting gates.

## Out of scope

- dependency upgrades, `npm audit fix`, audit thresholds, security allowlists
  or any B4 security work;
- remote GitHub, deploy, Supabase, secrets, push or status changes;
- legacy E2E repair, feature behaviour, migrations, RLS and API changes.

## Definition of done

- `npm run test:run`, lint, Astro typecheck and build pass without API keys;
- a deliberate break proves the changed test protects disabled/no-save or
  environment-reset behaviour;
- CI uses the exact Node runtime from `.nvmrc`;
- evidence distinguishes the green deterministic gates from pending B4 audit
  and legacy E2E work.
