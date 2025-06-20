-- Migration: Fix generations constraint
-- Description: Allow cards_generated to be 0 during initial creation
-- Author: Claude Code  
-- Date: 2024-03-20

-- Drop the problematic constraint that requires cards_generated > 0
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_cards_generated_positive;

-- Add a new constraint that allows 0 or positive values
ALTER TABLE public.generations ADD CONSTRAINT generations_cards_generated_non_negative CHECK (cards_generated >= 0);