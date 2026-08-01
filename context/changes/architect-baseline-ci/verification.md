---
title: Verification: architect-baseline-ci
created: 2026-08-01
type: local-verification
---

# Verification: architect-baseline-ci

## Before

- `.nvmrc` specifies `22.14.0`, while four GitHub Actions jobs still used
  `node-version: 20.x` (`.github/workflows/ci.yml:40-44,80-84,134-138,166-170`).
- `env -u OPENROUTER_API_KEY -u OPENAI_API_KEY npm run test:run` failed with
  13 tests: 10 OpenRouter cases failed before mocked fetch because the API key
  was absent, and 3 `FlashcardForm` cases expected a synthetic validation error
  even though the submit control was disabled.
- `npm run lint` had 11 `prettier/prettier` errors in
  `src/db/database.types.ts`; no lint rule or ignore was changed.
- `npx astro check` and `npm run build` already exited zero; they are listed
  below again as final gates rather than treated as a fix.

## Changes

- Every `actions/setup-node` invocation reads `.nvmrc`; CI now has one runtime
  authority rather than four `20.x` exceptions.
- `openrouter.test.ts` supplies a test key with `vi.stubEnv` in `beforeEach`
  and unconditionally calls `vi.unstubAllEnvs` in `afterEach`. The global
  `import.meta.env` mutation was removed from test setup.
- `FlashcardForm` regression tests now prove the existing contract: empty
  native-required input is invalid, submit stays disabled, and neither fetch
  nor `onSave` runs. No production form code changed.
- `src/db/database.types.ts` was formatted with the committed Prettier config.

## Final local gates

| Gate | Result |
|---|---|
| `env -u OPENROUTER_API_KEY -u OPENAI_API_KEY npm run test:run` | pass: 10 files, 101 tests |
| `npm run lint` | exit 0; two existing `no-console` warnings and two ESLint v10 migration warnings, zero errors |
| `npx astro check` | exit 0; zero errors/warnings and one existing unused-parameter hint in `src/test/setup.ts` |
| `npm run build` | pass |
| deliberate break | changing the disabled-submit assertion to `.not.toBeDisabled()` made its selected regression test fail; assertion was restored before final gates |

## Scope limits and manual follow-up

`npm audit`, audit thresholds, security allowlists and all B4 security work
were deliberately not run or changed. Legacy E2E was deliberately not run or
repaired; its status remains pending and is not represented as green by this
verification. No push, hosted CI run, deployment, secret, migration or remote
service was changed. The required AGY implementer was invoked with normal
`--print` using `claude-opus-4-6-thinking`, but it wrote no files; the scoped
fallback changes above were reviewed and implemented locally.
