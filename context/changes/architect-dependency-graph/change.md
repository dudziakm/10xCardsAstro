---
title: Dependency-cruiser evidence and Architect synthesis
created: 2026-08-01
type: implementation-plan
status: implemented
---

# Change: architect-dependency-graph

Replace the documented structural-analysis substitute with a reproducible
dependency-cruiser configuration and evidence for the active learning-session
flow. Add a concise M4 architectural report that links existing evidence rather
than claiming hosted security or CI results that have not passed.

## Boundaries

- Add only the analysis dependency, its configuration, an npm script and
  documentation/evidence.
- Do not change application runtime, migrations, RLS, CI workflow or existing
  security-advisory policy.
- Preserve every unknown and red external gate as an explicit limitation.
