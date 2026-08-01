# Implementation plan — Architect security remediation

## Phase 1: Safe dependency remediation

### Changes required

1. Record the baseline production-advisory count and apply only npm's
   non-forced resolution.
2. Inspect the post-update audit. If advisories remain, identify the exact
   paths and perform narrowly justified direct upgrades only when they remain
   compatible with the project.
3. Keep the security script fail-closed; do not add vulnerable packages to its
   ignore list.
4. Validate the lockfile and all existing project gates under Node 22.14.0.

### Automated success criteria

- `npm audit --omit=dev` reports no vulnerabilities.
- `npm run security:check`, `npm run lint`, `npx astro check`,
  `npm run test:run`, `npm run analyze:dependencies`, `npm run build`, and
  `git diff --check` pass.
- Deliberate break: the security checker fails when passed a synthetic audit
  result containing a non-ignored high-severity package; then restore it.

### Manual success criteria

- Push the remediation commit and retain the green security CI check on PR
  #25 before merging it.

## Progress

### Phase 1: Safe dependency remediation

#### Automated

- [x] 1.1 Apply and inspect the non-forced remediation — 0 audit findings
- [x] 1.2 Run the fail-closed deliberate-break check and all repository gates
- [x] 1.3 Commit the verified dependency update

#### Manual

- [x] 1.M1 Retain green remote security evidence — run 30715344478; merge PR #25 next
