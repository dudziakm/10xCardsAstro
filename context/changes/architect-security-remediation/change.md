---
title: Remediate production dependency advisories
created: 2026-08-01
type: implementation-plan
status: implemented
---

# Change: architect-security-remediation

Replace the known vulnerable production dependency resolutions with the
maintainer-provided non-breaking updates, then verify the application and the
CI security gate against the resulting lockfile.

## Boundaries

- Use `npm audit fix` only without `--force`; do not make a major-version
  upgrade or suppress advisories.
- Commit only dependency manifests/lockfile and any compatibility repair that
  is demonstrated by the project gates.
- Do not claim the hosted preview is public or that remote Supabase RLS was
  validated.
