# Implementation plan — Architect dependency graph

## Phase 1: Reproducible structural evidence

### Changes required

1. Add a Node-22-compatible `dependency-cruiser` development dependency and a
   project-owned script/configuration that analyses `src` with TypeScript paths.
2. Define and validate a cycle prohibition and a narrow API/component import
   boundary without treating HTTP `fetch` calls as source imports.
3. Run a focused graph analysis for `learn.astro`, `LearningSession`, the two
   learning API routes and `LearningService`; update Artifact 2 with exact
   command output and the resulting cycles, boundaries and testability facts.
4. Add an M4 two-page architectural report synthesizing the territory map,
   graph, feature research/refactor ranking and DDD/ACL documents, with clear
   limits for hosted RLS and unresolved security advisories.

### Automated success criteria

- `npm run analyze:dependencies` exits 0 on Node 22.14.0.
- The recorded focused graph is produced by dependency-cruiser from tracked
  project configuration, and matches the cited active learning modules.
- Artifact 2 distinguishes an import-graph boundary from UI-to-API HTTP calls.
- The report links its four evidence layers and does not state that remote RLS,
  public hosting or security advisories are resolved.
- `npm run lint`, `npm run test:run`, `npx astro check`, `npm run build` and
  `git diff --check` pass.
- Deliberate break: temporarily disable the cycle rule and verify a static
  assertion flags the missing rule before restoring it.

### Manual success criteria

- Push the verified Architect commits and retain immutable PR/CI URLs.
- Make a security-owner decision on seven current advisories before claiming a
  fully green remote pipeline.
- Attach the report and required contextual comment to the additional-badges
  form after public evidence is available.

## Progress

### Phase 1: Reproducible structural evidence

#### Automated

- [x] 1.1 Configure dependency-cruiser and the project command — 951eed0
- [x] 1.2 Record focused graph evidence and the M4 synthesis report — 951eed0
- [x] 1.3 Prove the static guard, pass repository gates and commit — 951eed0

#### Manual

- [ ] 1.M1 Retain remote PR and CI evidence
- [ ] 1.M2 Resolve or formally accept the advisory policy
- [ ] 1.M3 Submit the additional-badges form
