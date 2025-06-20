import { test, expect } from '@playwright/test';

test.describe('Flashcard CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to flashcards page before each test
    await page.goto('/flashcards');
  });

  test('should display flashcards list page (US-004)', async ({ page }) => {
    // Check page title and heading
    await expect(page.locator('h1')).toContainText('Moje fiszki');
    
    // Check if flashcards list is visible
    await expect(page.locator('[data-testid="flashcards-list"]')).toBeVisible();
    
    // Check if "Create New" button exists
    await expect(page.locator('text=Utwórz nową fiszkę')).toBeVisible();
    
    // Check if search bar exists
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
  });

  test('should create new flashcard manually (US-003)', async ({ page }) => {
    // Click "Create New Flashcard" button
    await page.click('text=Utwórz nową fiszkę');
    
    // Should navigate to create form
    await expect(page).toHaveURL('/flashcards/create');
    await expect(page.locator('h1')).toContainText('Utwórz fiszkę');
    
    // Fill in the form
    const frontText = 'What is React?';
    const backText = 'A JavaScript library for building user interfaces';
    
    await page.fill('textarea[name="front"]', frontText);
    await page.fill('textarea[name="back"]', backText);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should redirect back to flashcards list
    await expect(page).toHaveURL('/flashcards');
    
    // Should see success message or the new flashcard
    await expect(page.locator('text=' + frontText)).toBeVisible();
  });

  test('should validate flashcard form inputs (US-003)', async ({ page }) => {
    await page.goto('/flashcards/create');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should see validation errors
    await expect(page.locator('text=Proszę wypełnić oba pola')).toBeVisible();
    
    // Test front field length validation (>200 chars)
    const longFront = 'A'.repeat(201);
    await page.fill('textarea[name="front"]', longFront);
    await page.fill('textarea[name="back"]', 'Valid back text');
    
    // Should show character count or validation error
    await expect(page.locator('textarea[name="front"]')).toHaveValue(longFront.substring(0, 200));
    
    // Test back field length validation (>500 chars)  
    const longBack = 'B'.repeat(501);
    await page.fill('textarea[name="front"]', 'Valid front');
    await page.fill('textarea[name="back"]', longBack);
    
    // Should truncate or show validation error
    await expect(page.locator('textarea[name="back"]')).toHaveValue(longBack.substring(0, 500));
  });

  test('should edit existing flashcard (US-005)', async ({ page }) => {
    // Assume there's at least one flashcard
    await page.goto('/flashcards');
    
    // Click edit button on first flashcard
    const editButton = page.locator('[data-testid="edit-flashcard"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Should navigate to edit form
      await expect(page.locator('h1')).toContainText('Edytuj fiszkę');
      
      // Modify the flashcard
      const newFrontText = 'Updated: What is Vue.js?';
      await page.fill('textarea[name="front"]', newFrontText);
      
      // Save changes
      await page.click('button[type="submit"]');
      
      // Should redirect back to list
      await expect(page).toHaveURL('/flashcards');
      
      // Should see updated content
      await expect(page.locator('text=' + newFrontText)).toBeVisible();
    }
  });

  test('should delete flashcard with confirmation (US-006)', async ({ page }) => {
    await page.goto('/flashcards');
    
    // Get initial count of flashcards
    const initialCards = await page.locator('[data-testid="flashcard-item"]').count();
    
    if (initialCards > 0) {
      // Click delete button on first flashcard
      await page.locator('[data-testid="delete-flashcard"]').first().click();
      
      // Should show confirmation dialog
      await expect(page.locator('text=Czy na pewno chcesz usunąć')).toBeVisible();
      
      // Confirm deletion
      await page.click('button:has-text("Usuń")');
      
      // Should redirect back to list with one less flashcard
      const finalCards = await page.locator('[data-testid="flashcard-item"]').count();
      expect(finalCards).toBe(initialCards - 1);
    }
  });

  test('should cancel flashcard deletion (US-006)', async ({ page }) => {
    await page.goto('/flashcards');
    
    const initialCards = await page.locator('[data-testid="flashcard-item"]').count();
    
    if (initialCards > 0) {
      // Click delete button
      await page.locator('[data-testid="delete-flashcard"]').first().click();
      
      // Cancel deletion
      await page.click('button:has-text("Anuluj")');
      
      // Should return to list with same number of flashcards
      const finalCards = await page.locator('[data-testid="flashcard-item"]').count();
      expect(finalCards).toBe(initialCards);
    }
  });

  test('should search flashcards (US-004)', async ({ page }) => {
    await page.goto('/flashcards');
    
    // Type in search box
    const searchQuery = 'React';
    await page.fill('[data-testid="search-input"]', searchQuery);
    
    // Wait for search results
    await page.waitForTimeout(1000); // Debounce
    
    // Should filter results
    const visibleCards = page.locator('[data-testid="flashcard-item"]:visible');
    const cardCount = await visibleCards.count();
    
    if (cardCount > 0) {
      // All visible cards should contain the search term
      for (let i = 0; i < cardCount; i++) {
        const cardText = await visibleCards.nth(i).textContent();
        expect(cardText?.toLowerCase()).toContain(searchQuery.toLowerCase());
      }
    }
  });

  test('should paginate flashcards (US-004)', async ({ page }) => {
    await page.goto('/flashcards');
    
    // Check if pagination exists (only if there are enough flashcards)
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
    
    if (paginationExists) {
      // Should show page numbers
      await expect(page.locator('[data-testid="page-number"]')).toBeVisible();
      
      // Check current page is highlighted
      await expect(page.locator('[data-testid="current-page"]')).toBeVisible();
      
      // If there's a next page, test navigation
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // Should navigate to page 2
        await expect(page).toHaveURL(/page=2/);
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
      }
    }
  });

  test('should handle empty flashcards list', async ({ page }) => {
    // This test assumes no flashcards exist or we can clear them
    await page.goto('/flashcards');
    
    // If no flashcards, should show appropriate message
    const noFlashcardsMessage = page.locator('text=Nie masz jeszcze żadnych fiszek');
    const flashcardsList = page.locator('[data-testid="flashcard-item"]');
    
    const hasFlashcards = await flashcardsList.count() > 0;
    
    if (!hasFlashcards) {
      await expect(noFlashcardsMessage).toBeVisible();
      await expect(page.locator('text=Utwórz nową fiszkę')).toBeVisible();
    }
  });
});