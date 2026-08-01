# 10xCardsAstro — legacy entry point

This repository is an Astro/Supabase flashcard application. Treat the current
code and versioned migrations as executable evidence; historical plans may
describe intent rather than current behaviour.

## Commands

```bash
npm run dev
npm run test:run
npm run lint
npx astro check
npm run build
npm run test:e2e
```

Use the smallest relevant check first. Never print `.env` values or put
credentials in tests, commits, logs, or documentation.

## Knowledge map

- Historical product, API and database contracts: [`.ai/`](.ai/)
- Repository orientation and active risks: [`context/map/repo-map.md`](context/map/repo-map.md)
- Feature analysis and accepted modernization plan:
  [`context/changes/`](context/changes/)
- Domain map, aggregate plan and ACL plan: [`context/domain/`](context/domain/)
- Detailed legacy stack, architecture and operational reference:
  [`docs/legacy-development.md`](docs/legacy-development.md)

Read the map before a cross-layer change. Read the specific change package
before changing a researched flow. The DDD documents are plans, not permission
to implement RLS, an aggregate, an ACL, or a migration.

## Global rules

- Preserve public API/DTO contracts unless a versioned migration plan says
  otherwise.
- Keep user ownership checks and database authorization separate; application
  filters do not prove RLS.
- Do not make mutating requests appear safe merely because they use `GET`.
- Run the relevant verification before any push; do not represent a scoped
  check as a green full pipeline.
