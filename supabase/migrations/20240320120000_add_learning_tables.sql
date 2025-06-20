-- Migration: Add Learning System Tables
-- Description: Creates tables for learning sessions and flashcard progress tracking
-- Tables: learning_sessions, flashcard_progress
-- Author: Claude Code
-- Date: 2024-03-20

-- Create learning_sessions table
create table public.learning_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    cards_reviewed integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create flashcard_progress table
create table public.flashcard_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    flashcard_id uuid not null references public.flashcards(id) on delete cascade,
    last_reviewed timestamptz,
    review_count integer not null default 0,
    difficulty_rating decimal(3,2) not null default 2.5,
    next_review_date timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_user_flashcard unique(user_id, flashcard_id)
);

-- Add cards_accepted column to generations table
alter table public.generations add column cards_accepted integer default 0;

-- Add generation_id to flashcards table for tracking AI generated cards
alter table public.flashcards add column generation_id uuid references public.generations(id) on delete set null;

-- Add model_used to generations table
alter table public.generations add column model_used varchar(50) default 'unknown';

-- Create indexes for learning tables
create index idx_learning_sessions_user_active on public.learning_sessions(user_id, is_active);
create index idx_flashcard_progress_user_id on public.flashcard_progress(user_id);
create index idx_flashcard_progress_next_review on public.flashcard_progress(user_id, next_review_date);
create index idx_flashcard_progress_flashcard_id on public.flashcard_progress(flashcard_id);
create index idx_flashcards_generation_id on public.flashcards(generation_id);

-- Create updated_at trigger for learning_sessions
create trigger update_learning_sessions_updated_at
    before update on public.learning_sessions
    for each row
    execute function public.handle_updated_at();

-- Create updated_at trigger for flashcard_progress
create trigger update_flashcard_progress_updated_at
    before update on public.flashcard_progress
    for each row
    execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.learning_sessions enable row level security;
alter table public.flashcard_progress enable row level security;

-- RLS Policies for learning_sessions

-- Select policies
create policy "Users can view their own learning sessions"
    on public.learning_sessions
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot view learning sessions"
    on public.learning_sessions
    for select
    to anon
    using (false);

-- Insert policies
create policy "Users can insert their own learning sessions"
    on public.learning_sessions
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anon users cannot insert learning sessions"
    on public.learning_sessions
    for insert
    to anon
    with check (false);

-- Update policies
create policy "Users can update their own learning sessions"
    on public.learning_sessions
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Anon users cannot update learning sessions"
    on public.learning_sessions
    for update
    to anon
    using (false);

-- Delete policies
create policy "Users can delete their own learning sessions"
    on public.learning_sessions
    for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot delete learning sessions"
    on public.learning_sessions
    for delete
    to anon
    using (false);

-- RLS Policies for flashcard_progress

-- Select policies
create policy "Users can view their own flashcard progress"
    on public.flashcard_progress
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot view flashcard progress"
    on public.flashcard_progress
    for select
    to anon
    using (false);

-- Insert policies
create policy "Users can insert their own flashcard progress"
    on public.flashcard_progress
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anon users cannot insert flashcard progress"
    on public.flashcard_progress
    for insert
    to anon
    with check (false);

-- Update policies
create policy "Users can update their own flashcard progress"
    on public.flashcard_progress
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Anon users cannot update flashcard progress"
    on public.flashcard_progress
    for update
    to anon
    using (false);

-- Delete policies
create policy "Users can delete their own flashcard progress"
    on public.flashcard_progress
    for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot delete flashcard progress"
    on public.flashcard_progress
    for delete
    to anon
    using (false);