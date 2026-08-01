---
title: Plan deterministic baseline CI repairs
created: 2026-08-01
updated: 2026-08-01
type: implementation-plan
---

# Plan: architect-baseline-ci

## Phase 1: repair deterministic B1–B3 baseline blockers

### Changes required

1. Read `.nvmrc` and set the CI setup action to the same Node version.
2. Reproduce and correct the actual lint violation without any rule/config
   relaxation.
3. Locate every ambient OpenRouter dependency in tests; reset/restore process
   environment deterministically and add a regression assertion.
4. Update FlashcardForm tests only to the component's current intentional
   native required/disabled/no-save contract. Do not change form behaviour.
5. Record exact results and scope exclusions in evidence/change documentation.

### Automated success criteria

```bash
env -u OPENROUTER_API_KEY -u OPENAI_API_KEY npm run test:run
npm run lint
npx astro check
npm run build
```

### Deliberate break

Temporarily remove the regression assertion for the disabled submit/no-save
contract or the test's environment reset; the selected test must go red, then
restore the worktree before the final gates.

## Progress

#### Automated

- [x] 1.1 Prove initial B1–B3 baseline failures and identify their source.
- [x] 1.2 Align Node CI, lint and deterministic test environment without
  weakening configuration.
- [x] 1.3 Repair only contradictory FlashcardForm test expectations and add
  regression coverage.
- [x] 1.4 Pass deliberate-break, full unit suite, lint, Astro check and build.

#### Manual

- [ ] B4 security/audit remains pending: no audit fix, threshold or allowlist
  change was authorized in this change.
- [ ] Legacy E2E remains outside this deterministic repair; its status is not
  represented as green here.
- [ ] Push, hosted CI, deploy, secrets and external Architect evidence require
  a human-authorized follow-up.
