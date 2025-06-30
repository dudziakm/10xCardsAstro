-- SQL Script to check flashcards data directly in Supabase
-- Copy and paste this into your Supabase SQL Editor to diagnose the pagination issue

-- 1. Overall flashcards statistics
SELECT 
  'Total flashcards' as metric,
  COUNT(*) as count
FROM flashcards
UNION ALL
SELECT 
  'Active flashcards',
  COUNT(*) 
FROM flashcards 
WHERE deleted_at IS NULL
UNION ALL
SELECT 
  'Deleted flashcards',
  COUNT(*) 
FROM flashcards 
WHERE deleted_at IS NOT NULL;

-- 2. Flashcards by user (active only)
SELECT 
  user_id,
  COUNT(*) as flashcard_count,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM flashcards 
WHERE deleted_at IS NULL
GROUP BY user_id
ORDER BY flashcard_count DESC;

-- 3. Recent flashcards by user (last 20)
SELECT 
  user_id,
  SUBSTRING(user_id::text, 1, 8) || '...' as short_user_id,
  front,
  source,
  created_at,
  CASE WHEN deleted_at IS NULL THEN '✅ Active' ELSE '🗑️ Deleted' END as status
FROM flashcards 
ORDER BY created_at DESC 
LIMIT 20;

-- 4. Test pagination for user with most flashcards
-- First, let's identify the user with most flashcards
WITH user_counts AS (
  SELECT 
    user_id,
    COUNT(*) as total_count
  FROM flashcards 
  WHERE deleted_at IS NULL
  GROUP BY user_id
  ORDER BY total_count DESC
  LIMIT 1
),
pagination_test AS (
  SELECT 
    f.user_id,
    COUNT(*) OVER() as total_items,
    CEIL(COUNT(*) OVER() / 10.0) as total_pages,
    ROW_NUMBER() OVER(ORDER BY f.updated_at DESC) as row_num,
    f.front,
    f.source,
    f.created_at
  FROM flashcards f
  INNER JOIN user_counts uc ON f.user_id = uc.user_id
  WHERE f.deleted_at IS NULL
)
SELECT 
  '📊 Pagination Test Results' as title,
  SUBSTRING(user_id::text, 1, 8) || '...' as user_id_short,
  total_items,
  total_pages,
  'Should show pagination: ' || 
    CASE WHEN total_pages > 1 THEN '✅ YES' ELSE '❌ NO' END as pagination_should_show
FROM pagination_test
WHERE row_num = 1

UNION ALL

-- Show first 10 items (page 1)
SELECT 
  '📄 Page 1 (items 1-10)',
  '---',
  NULL::bigint,
  NULL::numeric,
  row_num || '. ' || LEFT(front, 40) || 
    (CASE WHEN LENGTH(front) > 40 THEN '...' ELSE '' END) ||
    ' (' || source || ')'
FROM pagination_test
WHERE row_num <= 10

UNION ALL

-- Show items 11-20 (page 2) if they exist
SELECT 
  '📄 Page 2 (items 11-20)',
  '---',
  NULL::bigint,
  NULL::numeric,
  row_num || '. ' || LEFT(front, 40) || 
    (CASE WHEN LENGTH(front) > 40 THEN '...' ELSE '' END) ||
    ' (' || source || ')'
FROM pagination_test
WHERE row_num BETWEEN 11 AND 20;

-- 5. Check if there are any issues with the updated_at field
SELECT 
  'Updated_at field check' as check_name,
  COUNT(*) as total_records,
  COUNT(updated_at) as records_with_updated_at,
  MIN(updated_at) as oldest_updated_at,
  MAX(updated_at) as newest_updated_at
FROM flashcards
WHERE deleted_at IS NULL;