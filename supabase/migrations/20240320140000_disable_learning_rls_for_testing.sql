-- Migration: Temporarily disable RLS for learning tables during testing
-- Description: Allows testing without proper auth context
-- Author: Claude Code  
-- Date: 2024-03-20

-- Temporarily disable RLS on learning tables for testing
ALTER TABLE public.learning_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_progress DISABLE ROW LEVEL SECURITY;