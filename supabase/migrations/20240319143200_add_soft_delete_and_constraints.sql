-- Migration: Add Soft Delete and Additional Constraints
-- Description: Adds soft delete functionality and improves data integrity with additional constraints
-- Author: AI Assistant
-- Date: 2024-03-19

-- Add soft delete support
alter table public.flashcards
    add column deleted_at timestamptz;

alter table public.generations
    add column deleted_at timestamptz;

-- Add constraint for generations.cards_generated
alter table public.generations
    add constraint generations_cards_generated_positive check (cards_generated > 0),
    add constraint generations_input_text_length check (length(input_text) <= 10000);

-- Add index for error_logs timestamp
create index idx_generation_error_logs_timestamp on public.generation_error_logs(timestamp);

-- Modify existing RLS policies to respect soft delete

-- Flashcards
drop policy if exists "Users can view their own flashcards" on public.flashcards;
create policy "Users can view their own flashcards"
    on public.flashcards
    for select
    to authenticated
    using (auth.uid() = user_id and deleted_at is null);

-- Update instead of real delete
create or replace function public.soft_delete_flashcard()
returns trigger as $$
begin
    update public.flashcards
    set deleted_at = now()
    where id = old.id;
    return null;
end;
$$ language plpgsql;

create trigger trigger_soft_delete_flashcard
    before delete on public.flashcards
    for each row
    when (old.deleted_at is null)
    execute function public.soft_delete_flashcard();

-- Generations
drop policy if exists "Users can view their own generations" on public.generations;
create policy "Users can view their own generations"
    on public.generations
    for select
    to authenticated
    using (auth.uid() = user_id and deleted_at is null);

-- Update instead of real delete
create or replace function public.soft_delete_generation()
returns trigger as $$
begin
    update public.generations
    set deleted_at = now()
    where id = old.id;
    return null;
end;
$$ language plpgsql;

create trigger trigger_soft_delete_generation
    before delete on public.generations
    for each row
    when (old.deleted_at is null)
    execute function public.soft_delete_generation();

-- Add function to cleanup old soft-deleted records
create or replace function public.cleanup_soft_deleted_records(days_to_keep integer)
returns void as $$
begin
    -- Permanently delete old soft-deleted flashcards
    delete from public.flashcards
    where deleted_at < now() - (days_to_keep || ' days')::interval;
    
    -- Permanently delete old soft-deleted generations
    delete from public.generations
    where deleted_at < now() - (days_to_keep || ' days')::interval;
end;
$$ language plpgsql; 