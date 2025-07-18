# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

my10xCards is an AI-powered flashcard learning application built with Astro 5, React 19, and Supabase. It helps users create educational flashcards either manually or through AI generation, with a focus on spaced repetition learning.

**Note**: This application is currently being built from scratch with AI assistance as part of the 10xdevs training program. The `.ai/` folder contains various planning documents including business requirements (`prd.md`), database plans, API specifications, tech stack details, and implementation notes for individual endpoints.

### Development Process Flow

1. **Business Requirements** (`prd.md`) - Written in Polish, defines all business requirements
2. **Project Planning** - Created project structure, AI rules, and project bootstrap
3. **Database Design** (`db-plan.md`) - Defined database schema and relationships
4. **API Contracts** - Generated REST API endpoints and contracts
5. **UI Planning** (`ui-plan.md`) - Started UI/UX planning and component structure
6. **Implementation Notes** - Individual endpoint implementation details in `.ai/api-impl-*.md` files

All documentation is in Polish, but code implementation is in English.

## Essential Development Commands

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI interface
npm run test:coverage # Run tests with coverage report

# E2E Testing
npm run test:e2e       # Run all E2E tests with Playwright
npm run test:e2e:ui    # Run E2E tests with Playwright UI mode
npm run test:e2e:headed # Run E2E tests in headed browser mode
npm run test:e2e:debug  # Run E2E tests in debug mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier

# IMPORTANT: Always run linting after major changes
# Run `npm run lint:fix && npm run format` after any significant code changes
# to ensure code quality and prevent CI/CD failures
```

## 🚨 CRITICAL PRE-PUSH WORKFLOW RULES 🚨

**BEFORE EVERY PUSH TO GITHUB, CLAUDE MUST EXECUTE THESE STEPS IN ORDER:**

### 1. Build Check
```bash
npm run build
```
- Must complete without errors
- If fails, fix issues before proceeding

### 2. Security Audit
```bash
npm audit
```
- Check for vulnerabilities
- If high/critical issues in YOUR code, fix them
- Known issues in external dependencies (like @astrojs/vercel) can be ignored

### 3. Linting Check
```bash
npm run lint
```
- Must pass without errors
- Run `npm run lint:fix` first if needed

### 4. TypeScript Validation
```bash
npx astro check
```
- Ensure no TypeScript errors
- Especially check config files after modifications

### 5. Development Server Test
```bash
npm run dev
```
- Server must start without errors
- No deprecation warnings or critical errors in console

### 6. Unit Tests (if business logic changed)
```bash
npm run test:run
```

**ONLY after ALL checks pass locally, then push to GitHub!**

### Common Failure Patterns to Watch For:
- TypeScript errors in astro.config.mjs after changes
- Missing environment variables causing build failures
- Import errors after adding new dependencies
- Security vulnerabilities in project dependencies vs external libraries

## High-Level Architecture

### Technology Stack

- **Frontend**: Astro 5 (SSR) with React 19 islands for interactivity
- **Styling**: Tailwind CSS 4 with Shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenRouter.ai with Claude 3 Haiku for flashcard generation
- **TypeScript**: Strict mode with Zod validation
- **Testing**: Vitest with React Testing Library and jsdom
- **E2E Testing**: Playwright with Page Object Model pattern
- **CI/CD**: GitHub Actions with automated testing and security audits

### Key Architectural Patterns

1. **Server-Side Rendering with Islands**

   - Astro handles static content and layouts
   - React components only for interactive elements
   - Minimal JavaScript sent to client

2. **API Structure**

   - REST endpoints in `/src/pages/api/`
   - Uppercase HTTP method exports (POST, GET)
   - Zod validation for all inputs
   - Service layer pattern for business logic

3. **Authentication Flow**

   - Supabase auth handled via middleware
   - Session available in `locals` for API routes
   - Row Level Security (RLS) enforces data isolation

4. **Database Schema**

   - `flashcards`: User flashcards with full-text search
   - `generations`: AI generation logs with acceptance tracking
   - `generation_error_logs`: Error tracking
   - `learning_sessions`: Learning session management
   - `flashcard_progress`: Spaced repetition progress tracking
   - All tables use soft deletes and audit fields

5. **AI Flashcard Generation Flow**

   - **Step 1**: POST `/api/flashcards/generate` - generates candidates and creates generation log
   - **Step 2**: POST `/api/flashcards/accept` - user reviews and accepts selected candidates
   - Only accepted candidates are saved as actual flashcards with `source: 'ai'`
   - Generation tracking enables analytics and user experience improvements

6. **Spaced Repetition Learning System**

   - Algorithm based on intervals: 1, 2, 4, 7, 14 days for ratings 1-5
   - Dynamic difficulty adjustment based on user performance
   - Learning sessions track progress and provide personalized card selection
   - Real-time feedback and progress visualization

7. **Testing Strategy**
   - Unit tests for business logic (spaced repetition algorithm, AI integration)
   - Integration tests for API endpoints and database operations
   - Component tests for React UI with user interaction simulation
   - E2E tests with Playwright covering all user workflows
   - Automated CI/CD pipeline with security auditing

### Project Structure

```
/src
├── components/      # UI components (Astro & React)
│   ├── ui/         # Shadcn/ui components (buttons, pagination, spinners)
│   ├── flashcards/ # Flashcard-specific components (list, viewer, search)
│   ├── forms/      # Form components (flashcard creation/editing)
│   ├── ai/         # AI generation components
│   └── learning/   # Learning system components (cards, sessions)
├── db/             # Supabase client and types
├── layouts/        # Astro layouts
├── lib/
│   ├── ai/         # AI integration (OpenRouter service)
│   ├── schemas/    # Zod validation schemas (flashcard, learning)
│   ├── services/   # Business logic (FlashcardService, LearningService, GenerationService)
│   └── types/      # TypeScript types
├── middleware/     # Auth middleware
├── pages/
│   ├── api/        # REST API endpoints
│   │   ├── flashcards/  # CRUD + generate + accept
│   │   └── learn/       # Learning session endpoints
│   └── *.astro     # Page routes (home, flashcards, learn, generate)
├── test/           # Test configuration and utilities
└── types.ts        # Shared DTOs and entities

/e2e
├── page-objects/   # Page Object Model pattern
├── auth.setup.ts   # Authentication setup for test users
└── *.spec.ts       # E2E test specifications
```

### API Pattern Example

```typescript
// API route pattern (uppercase exports)
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, session } = locals;

  // Auth check
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Validation with Zod
  const data = await request.json();
  const validated = schema.parse(data);

  // Service layer
  const service = new FlashcardService(supabase);
  const result = await service.create(session.user.id, validated);

  return new Response(JSON.stringify(result), { status: 201 });
};
```

### Key Development Guidelines

1. **Error Handling**: Use early returns and guard clauses
2. **Type Safety**: Always use TypeScript types and Zod validation
3. **Component Choice**: Astro for static, React only when interactive
4. **Auth Context**: Access Supabase via `locals` in API routes, not direct imports
5. **Service Layer**: Extract business logic to `/src/lib/services/`
6. **Testing**: Write tests for all business logic and user interactions
7. **AI Integration**: Use OpenRouter with Claude 3 Haiku for optimal cost/performance balance
8. **E2E Testing**: Use `data-testid` attributes for reliable test selectors

### E2E Testing with Playwright

The project includes comprehensive E2E tests using Playwright with Page Object Model pattern:

#### Test Structure

- **Page Objects** (`/e2e/page-objects/`): Encapsulate page-specific logic
  - `BasePage`: Common functionality (navigation, element selection, waits)
  - Individual pages: Homepage, Flashcards, AI Generation, Learning, etc.
- **Test Specs** (`/e2e/*.spec.ts`): Cover all major user workflows
  - Homepage navigation and responsiveness
  - Full CRUD operations for flashcards
  - AI generation and candidate review flow
  - Spaced repetition learning sessions
  - User data isolation and security

#### Configuration

- **Parallel execution** with retry logic for CI stability
- **Authentication setup** with multiple test users
- **Automatic dev server** startup before tests
- **Failure artifacts**: Screenshots, videos, and traces on test failures

#### Best Practices

- Use `data-testid` attributes for reliable element selection
- Implement proper waits and assertions
- Maintain test isolation between users
- Keep page objects focused and reusable

### Database Migrations

Supabase migrations are in `/supabase/migrations/`. The schema includes:

- User isolation via RLS policies
- Soft deletes on all tables
- Full-text search on flashcards
- Audit fields (created_at, updated_at)

### Environment Variables

A `.env` file exists with the following keys configured:

- `SUPABASE_URL` - Local Supabase instance URL
- `SUPABASE_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key
- `OPENROUTER_API_KEY` - OpenRouter API key (primary AI provider)
- `COURSE_API_BASE_URL` - Course API base URL
- `COURSE_API_KEY` - Course API key
- `MISTRAL_API_KEY` - Mistral AI API key
- `GROK_API_KEY` - Grok AI API key
- `GROQ_API_KEY` - Groq API key
- `ANTROPIC_API_KEY` - Anthropic API key

See `.env.example` for the template structure.

### Current Status

The application is **fully functional** with:

✅ **Complete CRUD Operations** - Create, read, update, delete flashcards  
✅ **AI-Powered Generation** - Generate flashcards using OpenRouter/Claude 3 Haiku  
✅ **Spaced Repetition Learning** - Scientifically-backed learning algorithm  
✅ **User Interface** - Modern, responsive UI with React components  
✅ **Authentication** - Supabase auth with Row Level Security  
✅ **Testing Infrastructure** - Comprehensive unit, integration, and E2E tests  
✅ **E2E Testing** - Playwright tests with Page Object Model covering all workflows  
✅ **CI/CD Pipeline** - GitHub Actions with automated testing and deployment

**Recent Fixes (v1.0.0):**

- Fixed AI generation flow with candidate review system (`/api/flashcards/accept`)
- Added `CandidateReview` component for selecting generated flashcards
- Implemented global navigation with mobile support (`Navigation.astro`)
- Simplified CI/CD configuration for faster builds (Chrome only, Node.js 20)
- Improved development server stability and error handling

The application is ready for production use with a complete learning workflow from AI generation to spaced repetition learning.
