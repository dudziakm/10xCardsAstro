# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

my10xCards is an AI-powered flashcard learning application built with Astro 5, React 19, and Supabase. It helps users create educational flashcards either manually or through AI generation, with a focus on spaced repetition learning.

**Note**: This application is currently being built from scratch with AI assistance as part of the 10xdevs training program. The `.ai/` folder contains various planning documents including business requirements (`prd.md`), database plans, API specifications, tech stack details, and implementation notes for individual endpoints.

## Essential Development Commands

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
```

## High-Level Architecture

### Technology Stack
- **Frontend**: Astro 5 (SSR) with React 19 islands for interactivity
- **Styling**: Tailwind CSS 4 with Shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenRouter.ai for flashcard generation
- **TypeScript**: Strict mode with Zod validation

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
   - `generations`: AI generation logs
   - `generation_error_logs`: Error tracking
   - All tables use soft deletes and audit fields

### Project Structure

```
/src
├── components/      # UI components (Astro & React)
│   └── ui/         # Shadcn/ui components
├── db/             # Supabase client and types
├── layouts/        # Astro layouts
├── lib/            
│   ├── schemas/    # Zod validation schemas
│   ├── services/   # Business logic services
│   └── types/      # TypeScript types
├── middleware/     # Auth middleware
├── pages/          
│   ├── api/        # REST API endpoints
│   └── *.astro     # Page routes
└── types.ts        # Shared DTOs and entities
```

### API Pattern Example

```typescript
// API route pattern (uppercase exports)
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, session } = locals;
  
  // Auth check
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401 
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