-- Migration: Add Additional Constraints and Policies
-- Description: Adds missing constraints and RLS policies for better data integrity
-- Author: AI Assistant
-- Date: 2024-03-19

-- Add constraints for flashcards
alter table public.flashcards
    add constraint flashcards_front_min_length check (length(front) >= 1),
    add constraint flashcards_back_min_length check (length(back) >= 1);

-- Add constraint for generation_error_logs
alter table public.generation_error_logs
    add constraint generation_error_logs_error_code_length check (length(error_code) <= 50);

-- Add missing RLS policies for generations

-- Update policy
create policy "Users can update their own generations"
    on public.generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Anon users cannot update generations"
    on public.generations
    for update
    to anon
    using (false);

-- Delete policy
create policy "Users can delete their own generations"
    on public.generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anon users cannot delete generations"
    on public.generations
    for delete
    to anon
    using (false);

-- Add missing RLS policies for generation_error_logs

-- Update policy
create policy "Users can update their own generation error logs"
    on public.generation_error_logs
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.generations g
            where g.id = generation_id
            and g.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1
            from public.generations g
            where g.id = generation_id
            and g.user_id = auth.uid()
        )
    );

create policy "Anon users cannot update generation error logs"
    on public.generation_error_logs
    for update
    to anon
    using (false);

-- Delete policy
create policy "Users can delete their own generation error logs"
    on public.generation_error_logs
    for delete
    to authenticated
    using (
        exists (
            select 1
            from public.generations g
            where g.id = generation_id
            and g.user_id = auth.uid()
        )
    );

create policy "Anon users cannot delete generation error logs"
    on public.generation_error_logs
    for delete
    to anon
    using (false); 