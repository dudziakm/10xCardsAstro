-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema for my10xCards application
-- Tables: flashcards, generations, generation_error_logs
-- Author: AI Assistant
-- Date: 2024-03-19

-- Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- Create flashcards table
create table public.flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar(10) not null check (source in ('manual', 'ai')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    front_tsv tsvector generated always as (to_tsvector('english', front)) stored,
    back_tsv tsvector generated always as (to_tsvector('english', back)) stored
);

-- Create generations table
create table public.generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    input_text text not null,
    cards_generated integer not null,
    successful boolean not null default true,
    created_at timestamptz not null default now()
);

-- Create generation_error_logs table
create table public.generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    generation_id uuid not null references public.generations(id) on delete cascade,
    error_message text not null,
    error_code varchar(50),
    timestamp timestamptz not null default now()
);

-- Create indexes
create index idx_flashcards_user_id on public.flashcards(user_id);
create index idx_flashcards_source on public.flashcards(source);
create index idx_flashcards_created_at on public.flashcards(created_at);
create index idx_generations_user_id on public.generations(user_id);
create index idx_generations_created_at on public.generations(created_at);
create index idx_generation_error_logs_generation_id on public.generation_error_logs(generation_id);
create index idx_flashcards_front_tsv on public.flashcards using gin(front_tsv);
create index idx_flashcards_back_tsv on public.flashcards using gin(back_tsv);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards
create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.flashcards enable row level security;
alter table public.generations enable row level security;
alter table public.generation_error_logs enable row level security;

-- RLS Policies for flashcards

-- Select policies
create policy "Users can view their own flashcards"
    on public.flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot view flashcards"
    on public.flashcards
    for select
    to anon
    using (false);

-- Insert policies
create policy "Users can insert their own flashcards"
    on public.flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anon users cannot insert flashcards"
    on public.flashcards
    for insert
    to anon
    with check (false);

-- Update policies
create policy "Users can update their own flashcards"
    on public.flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Anon users cannot update flashcards"
    on public.flashcards
    for update
    to anon
    using (false);

-- Delete policies
create policy "Users can delete their own flashcards"
    on public.flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot delete flashcards"
    on public.flashcards
    for delete
    to anon
    using (false);

-- RLS Policies for generations

-- Select policies
create policy "Users can view their own generations"
    on public.generations
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot view generations"
    on public.generations
    for select
    to anon
    using (false);

-- Insert policies
create policy "Users can insert their own generations"
    on public.generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anon users cannot insert generations"
    on public.generations
    for insert
    to anon
    with check (false);

-- RLS Policies for generation_error_logs

-- Select policies
create policy "Users can view their own generation error logs"
    on public.generation_error_logs
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.generations g
            where g.id = generation_id
            and g.user_id = auth.uid()
        )
    );

create policy "Anon users cannot view generation error logs"
    on public.generation_error_logs
    for select
    to anon
    using (false);

-- Insert policies
create policy "Users can insert error logs for their generations"
    on public.generation_error_logs
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.generations g
            where g.id = generation_id
            and g.user_id = auth.uid()
        )
    );

create policy "Anon users cannot insert generation error logs"
    on public.generation_error_logs
    for insert
    to anon
    with check (false); 