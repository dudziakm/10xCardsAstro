-- Migration: Disable All Policies
-- Description: Drops all policies from flashcards, generations, and generation_error_logs tables
-- Author: AI Assistant
-- Date: 2024-03-19

-- Drop flashcards policies
drop policy if exists "Users can view their own flashcards" on public.flashcards;
drop policy if exists "Anon users cannot view flashcards" on public.flashcards;
drop policy if exists "Users can insert their own flashcards" on public.flashcards;
drop policy if exists "Anon users cannot insert flashcards" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;
drop policy if exists "Anon users cannot update flashcards" on public.flashcards;
drop policy if exists "Users can delete their own flashcards" on public.flashcards;
drop policy if exists "Anon users cannot delete flashcards" on public.flashcards;

-- Drop generations policies
drop policy if exists "Users can view their own generations" on public.generations;
drop policy if exists "Anon users cannot view generations" on public.generations;
drop policy if exists "Users can insert their own generations" on public.generations;
drop policy if exists "Anon users cannot insert generations" on public.generations;
drop policy if exists "Users can update their own generations" on public.generations;
drop policy if exists "Anon users cannot update generations" on public.generations;
drop policy if exists "Users can delete their own generations" on public.generations;
drop policy if exists "Anon users cannot delete generations" on public.generations;

-- Drop generation_error_logs policies
drop policy if exists "Users can view their own generation error logs" on public.generation_error_logs;
drop policy if exists "Anon users cannot view generation error logs" on public.generation_error_logs;
drop policy if exists "Users can insert error logs for their generations" on public.generation_error_logs;
drop policy if exists "Anon users cannot insert generation error logs" on public.generation_error_logs;
drop policy if exists "Users can update their own generation error logs" on public.generation_error_logs;
drop policy if exists "Anon users cannot update generation error logs" on public.generation_error_logs;
drop policy if exists "Users can delete their own generation error logs" on public.generation_error_logs;
drop policy if exists "Anon users cannot delete generation error logs" on public.generation_error_logs;

-- Disable RLS on all tables
alter table public.flashcards disable row level security;
alter table public.generations disable row level security;
alter table public.generation_error_logs disable row level security; 