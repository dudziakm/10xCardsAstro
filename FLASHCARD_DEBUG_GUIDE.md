# Flashcard Data Debugging Guide

## Issue Summary
User reports seeing only 10 flashcards when they should have many more, and new flashcards don't seem to increase the visible count.

## Investigation Results

### ✅ Database Status: HEALTHY
- **Total flashcards in database**: 254 flashcards
- **Active flashcards**: 237 (17 soft-deleted)
- **User with most cards**: 166 active flashcards
- **Second user**: 71 active flashcards

### ✅ Pagination Logic: WORKING CORRECTLY
- API returns 10 items per page (correct)
- User with 166 cards should see **17 pages** of results
- Database queries work properly
- Soft delete filtering works correctly

### 🔍 Root Cause Analysis
The issue is **NOT** in the database or backend. All data is present and pagination works correctly.

## Likely Causes (Frontend Issues)

### 1. **Pagination Controls Not Visible**
The most likely issue is that the pagination component is not showing up in the UI.

**Check:**
- Look at the bottom of the flashcards list
- Pagination should appear when there are more than 10 items
- Component only shows if `pagination.total_pages > 1`

### 2. **CSS/Styling Issues**
Pagination controls might be hidden by CSS.

**Check:**
- Use browser dev tools to inspect the page
- Look for elements with `data-testid="pagination"` or similar
- Check if pagination component is rendered but hidden

### 3. **JavaScript Errors**
Frontend errors might prevent pagination from working.

**Check:**
- Open browser console (F12)
- Look for JavaScript errors
- Check network tab for failed API requests

### 4. **User Session Issues**
User might be looking at the wrong account.

**Check:**
- Verify user is logged into the correct account
- Check if session is properly authenticated
- Try logging out and logging back in

## Debugging Steps

### Step 1: Check Browser Console
1. Open the flashcards page
2. Press F12 to open developer tools
3. Check Console tab for errors
4. Check Network tab for API requests to `/api/flashcards`

### Step 2: Inspect UI Elements
1. Right-click at the bottom of the flashcards list
2. Choose "Inspect Element"
3. Look for pagination components
4. Check if `pagination.total_pages > 1` in the component

### Step 3: Verify API Response
1. Open Network tab in browser dev tools
2. Refresh the flashcards page
3. Look for request to `/api/flashcards?page=1&limit=10`
4. Check the response:
   ```json
   {
     "data": [...10 items...],
     "pagination": {
       "current_page": 1,
       "total_pages": 17,  // Should be > 1
       "total_items": 166, // Should be > 10
       "items_per_page": 10
     }
   }
   ```

### Step 4: Manual Database Check
Run this SQL in your Supabase SQL Editor:

```sql
-- Check your flashcards count
SELECT 
  COUNT(*) as total_flashcards,
  user_id
FROM flashcards 
WHERE deleted_at IS NULL 
  AND user_id = auth.uid()  -- This will show YOUR flashcards
GROUP BY user_id;
```

## Quick Fixes to Try

### Fix 1: Hard Refresh
- Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- This clears browser cache

### Fix 2: Clear Browser Storage
1. Open dev tools (F12)
2. Go to Application tab
3. Clear Local Storage and Session Storage
4. Refresh page

### Fix 3: Try Different Browser
- Test in incognito/private browsing mode
- Try a different browser entirely

### Fix 4: Check Mobile/Desktop
- If using mobile, try desktop
- Responsive design might hide pagination on mobile

## Files to Check

If the issue persists, check these files for problems:

1. **Frontend Component**: `/src/components/flashcards/FlashcardList.tsx`
   - Line 238: `{pagination.total_pages > 1 && ...}`
   - This controls when pagination shows

2. **Pagination Component**: `/src/components/ui/Pagination.tsx`
   - Line 19: `if (totalPages <= 1) return null;`
   - This hides pagination if only 1 page

3. **API Endpoint**: `/src/pages/api/flashcards/index.ts`
   - Line 113: Default limit is "10"
   - Line 135: Calls FlashcardService

4. **Service Layer**: `/src/lib/services/flashcard.service.ts`
   - Line 64-66: Pagination calculation
   - Line 76-88: Return format

## Expected Behavior

When working correctly:
- User with 166 flashcards should see:
  - "Znaleziono 166 fiszek" (Found 166 flashcards)
  - 10 flashcard items displayed
  - Pagination controls at bottom showing "Strona 1 z 17" (Page 1 of 17)
  - "Następna" (Next) button should be enabled

## Next Steps

1. **First**: Check browser console for errors
2. **Second**: Verify pagination component exists in DOM
3. **Third**: Check API response in network tab
4. **Fourth**: Verify user session/account

The data is definitely there - this is a frontend display issue!