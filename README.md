# my10xCards

## Table of Contents

- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Architecture and Module 4 artifacts](#architecture-and-module-4-artifacts)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Name

**my10xCards** — the application name. The GitHub repository is
[`dudziakm/10xCardsAstro`](https://github.com/dudziakm/10xCardsAstro); the two
names refer to the same project.

## Project Description

my10xCards is an innovative application designed to simplify the creation of high-quality educational flashcards. The system leverages AI to automatically generate flashcard candidates from a provided text input while also supporting manual flashcard creation. The application is tailored for professionals looking for efficient learning tools based on spaced repetition, enabling both automated and manual flashcard management with user-friendly review and editing capabilities.

## Tech Stack

- **Frontend:** Astro 7, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Backend & Database:** Supabase (for authentication and PostgreSQL database)
- **AI Integration:** OpenRouter.ai for generating flashcards
- **Tooling:** Node.js (v22.14.0 as specified in .nvmrc), ESLint, Prettier

## Architecture and Module 4 artifacts

This repository is also the 10xArchitect submission for the 10xDevs 3.0 course:
a legacy modernization worked from a repository map through a ranked risk list to
one small, tested refactor. Start here rather than in `src/`.

| What                                | Where                                                                                     |
|-------------------------------------|-------------------------------------------------------------------------------------------|
| Architectural report                | [`context/evidence/architectural-report-m4.md`](context/evidence/architectural-report-m4.md) |
| Requirement → evidence map          | [`context/evidence/architect.md`](context/evidence/architect.md)                          |
| Repository map and ranked risks     | [`context/map/repo-map.md`](context/map/repo-map.md)                                       |
| Territory, structure, contributors  | [`context/map/`](context/map/)                                                            |
| Domain distillation, aggregate, ACL | [`context/domain/`](context/domain/) — deliberately plans, not implementations             |
| Feature, debt and blast-radius analysis | [`context/changes/learning-progress-analysis/`](context/changes/learning-progress-analysis/) |
| The refactor that shipped           | [PR #25](https://github.com/dudziakm/10xCardsAstro/pull/25), squash `2a2b929`; `src/lib/services/review-scheduler.ts` |
| Dependency rules enforced in CI     | [`.dependency-cruiser.cjs`](.dependency-cruiser.cjs) — `no-circular`, `no-react-island-to-api-import`, `no-api-route-to-react-island`, all `error` |

Reproduce the dependency graph with `npm run analyze:dependencies`; it reports
65 modules and 104 dependencies with no violations. `npm run security:check`
reports no vulnerabilities and is fail-closed.

## Getting Started Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dudziakm/10xCardsAstro.git
   cd 10xCardsAstro
   ```

2. **Use the correct Node.js version:**
   Make sure you are using Node.js version 22.14.0. If you use nvm, run:

   ```bash
   nvm use
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

The project includes the following npm scripts defined in `package.json`:

- **dev:** Starts the Astro development server.
- **build:** Builds the project for production.
- **preview:** Previews the production build locally.
- **astro:** Utility command for Astro.
- **lint:** Runs ESLint to analyze the code for potential issues.
- **lint:fix:** Automatically fixes linting errors where possible.
- **format:** Formats the code using Prettier.

## Project Scope

The project's core features include:

- **AI-Generated Flashcards:**

  - Accepts text input (1000 to 10,000 characters) to generate up to 10 flashcard candidates.
  - Each flashcard candidate's front is limited to 200 characters and back to 500 characters.
  - Generated cards are presented for review, with options for acceptance, editing, or rejection. Only accepted flashcards are stored.

- **Manual Flashcard Creation:**

  - Users can manually create flashcards with validations (front up to 200 characters, back up to 500 characters).

- **Flashcard Management:**

  - Features a searchable and paginated list of saved flashcards (e.g., 10 per page).
  - Allows editing and deletion of flashcards.

- **User Account Management:**

  - Registration, login, password change, and account deletion via Supabase integration.

- **Learning Session:**
  - Dedicated study mode that uses a spaced repetition algorithm to help users review flashcards efficiently.

## Project Status

**Feature-complete (v1.0.0), no live deployment.**

The Vercel target was removed in PR #12, so there is no hosted instance to visit;
run the application locally with the steps above. Row-level security on the
`learning` tables is still disabled by
`supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql` — that
is the repository's own ranked risk 1 and its guard-first remediation plan lives
in [`context/changes/harden-learning-progress/plan.md`](context/changes/harden-learning-progress/plan.md).

The following core features are implemented:

- ✅ **Complete CRUD Operations** - Create, read, update, delete flashcards
- ✅ **AI-Powered Generation** - Two-step process: generate candidates → review → accept
- ✅ **Spaced Repetition Learning** - Scientifically-backed learning algorithm
- ✅ **User Interface** - Modern, responsive UI with global navigation
- ✅ **Authentication** - Supabase auth with Row Level Security
- ✅ **Testing Infrastructure** - Unit, integration, and E2E tests
- ✅ **CI/CD Pipeline** - GitHub Actions with automated testing

**Recent Updates (v1.0.0):**

- Fixed AI flashcard generation flow with candidate review system
- Added global navigation with mobile support
- Simplified CI/CD to a single Chrome target; every `setup-node` step reads the version from `.nvmrc` (22.14.0)
- Improved development experience and error handling
- **Migrated to online Supabase** - Full production-ready database
- **Updated CI/CD for online deployment** - Separated unit/E2E tests, non-blocking E2E

## License

This project is licensed under the MIT License. See the LICENSE file for details.
