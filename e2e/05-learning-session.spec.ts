import { test, expect } from '@playwright/test';

test.describe('Learning Session with Spaced Repetition', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock learning session API
    await page.route('/api/learn/session', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            card: {
              id: 'card-123',
              front: 'What is React?',
              back: 'A JavaScript library for building user interfaces',
              last_reviewed: null,
              review_count: 0,
              difficulty_rating: 2.5
            },
            session: {
              session_id: 'session-123',
              cards_reviewed: 0,
              cards_remaining: 5,
              session_start: new Date().toISOString()
            }
          })
        });
      }
    });
    
    await page.route('/api/learn/session/rate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          flashcard_id: 'card-123',
          rating: 4,
          next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          review_count: 1,
          difficulty_rating: 2.4,
          session_progress: {
            cards_reviewed: 1,
            session_duration_minutes: 2
          }
        })
      });
    });
  });

  test('should display learning session page correctly (US-008)', async ({ page }) => {
    await page.goto('/learn');
    
    // Check page title and heading
    await expect(page.locator('h1')).toContainText('Sesja nauki');
    
    // Should show start session button if no active session
    await expect(page.locator('button:has-text("Rozpocznij sesję nauki")')).toBeVisible();
    
    // Check instructions
    await expect(page.locator('text=Kliknij aby rozpocząć naukę')).toBeVisible();
  });

  test('should start learning session and display first card (US-008)', async ({ page }) => {
    await page.goto('/learn');
    
    // Start learning session
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    
    // Should show loading state
    await expect(page.locator('text=Ładowanie następnej fiszki...')).toBeVisible();
    
    // Wait for card to load
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Should display card front only initially
    await expect(page.locator('[data-testid="card-front"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-front"]')).toContainText('What is React?');
    
    // Back should not be visible initially
    await expect(page.locator('[data-testid="card-back"]')).toBeHidden();
    
    // Should show instruction to click for answer
    await expect(page.locator('text=Kliknij aby zobaczyć odpowiedź')).toBeVisible();
  });

  test('should flip card to show back when clicked (US-008)', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Click on the card to flip it
    await page.click('[data-testid="learning-card"]');
    
    // Should show back side
    await expect(page.locator('[data-testid="card-back"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-back"]')).toContainText('A JavaScript library for building user interfaces');
    
    // Should show rating buttons
    await expect(page.locator('[data-testid="rating-buttons"]')).toBeVisible();
    await expect(page.locator('button:has-text("1")')).toBeVisible(); // Again
    await expect(page.locator('button:has-text("2")')).toBeVisible(); // Hard
    await expect(page.locator('button:has-text("3")')).toBeVisible(); // Good
    await expect(page.locator('button:has-text("4")')).toBeVisible(); // Easy
    await expect(page.locator('button:has-text("5")')).toBeVisible(); // Very Easy
    
    // Should show instruction to rate
    await expect(page.locator('text=Oceń jak dobrze pamiętałeś odpowiedź')).toBeVisible();
  });

  test('should rate flashcard and move to next (US-008)', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Flip card
    await page.click('[data-testid="learning-card"]');
    
    // Rate the card (4 = Easy)
    await page.click('button:has-text("4")');
    
    // Should show rating confirmation
    await expect(page.locator('text=Oceniono! Ładowanie następnej fiszki...')).toBeVisible();
    
    // Mock next card
    await page.route('/api/learn/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          card: {
            id: 'card-456',
            front: 'What is JSX?',
            back: 'JavaScript XML syntax extension',
            last_reviewed: null,
            review_count: 0,
            difficulty_rating: 2.5
          },
          session: {
            session_id: 'session-123',
            cards_reviewed: 1,
            cards_remaining: 4,
            session_start: new Date().toISOString()
          }
        })
      });
    });
    
    // Should load next card
    await page.waitForSelector('[data-testid="learning-card"]');
    await expect(page.locator('[data-testid="card-front"]')).toContainText('What is JSX?');
  });

  test('should display session statistics (US-008)', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Should show session progress
    await expect(page.locator('[data-testid="cards-reviewed"]')).toContainText('0');
    await expect(page.locator('[data-testid="cards-remaining"]')).toContainText('5');
    
    // After rating a card, stats should update
    await page.click('[data-testid="learning-card"]');
    await page.click('button:has-text("3")');
    
    // Stats should update (mocked in beforeEach)
    await expect(page.locator('[data-testid="cards-reviewed"]')).toContainText('1');
  });

  test('should show rating labels and intervals (US-008)', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    await page.click('[data-testid="learning-card"]');
    
    // Should show rating labels
    await expect(page.locator('text=Nie pamiętam')).toBeVisible(); // Rating 1
    await expect(page.locator('text=Słabo')).toBeVisible(); // Rating 2
    await expect(page.locator('text=Przeciętnie')).toBeVisible(); // Rating 3
    await expect(page.locator('text=Dobrze')).toBeVisible(); // Rating 4
    await expect(page.locator('text=Bardzo dobrze')).toBeVisible(); // Rating 5
    
    // Should show interval information
    await expect(page.locator('text=1 = Następny przegląd za 1 dzień')).toBeVisible();
    await expect(page.locator('text=2 = za 2 dni | 3 = za 4 dni | 4 = za 7 dni | 5 = za 14 dni')).toBeVisible();
  });

  test('should handle no cards available scenario (US-008)', async ({ page }) => {
    // Mock empty session
    await page.route('/api/learn/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          card: null,
          session: {
            session_id: 'session-123',
            cards_reviewed: 0,
            cards_remaining: 0,
            session_start: new Date().toISOString(),
            message: 'No cards available for review'
          }
        })
      });
    });
    
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    
    // Should show no cards message
    await expect(page.locator('text=Brak fiszek do nauki')).toBeVisible();
    await expect(page.locator('text=Wszystkie fiszki zostały przeglądu')).toBeVisible();
    
    // Should offer to create new flashcards
    await expect(page.locator('a[href="/flashcards/create"]')).toContainText('Utwórz nowe fiszki');
  });

  test('should show card metadata (difficulty, review count)', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Should show card metadata
    await expect(page.locator('[data-testid="review-count"]')).toContainText('Przeglądy: 0');
    await expect(page.locator('[data-testid="difficulty-rating"]')).toContainText('Trudność: 2.5/5.0');
    
    // For new cards, last reviewed should not be shown
    await expect(page.locator('[data-testid="last-reviewed"]')).toBeHidden();
  });

  test('should end learning session', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Should show end session button
    await expect(page.locator('button:has-text("Zakończ sesję")')).toBeVisible();
    
    // Click end session
    await page.click('button:has-text("Zakończ sesję")');
    
    // Should show confirmation
    await expect(page.locator('text=Czy na pewno chcesz zakończyć sesję?')).toBeVisible();
    
    // Confirm
    await page.click('button:has-text("Zakończ")');
    
    // Should show session summary
    await expect(page.locator('[data-testid="session-summary"]')).toBeVisible();
    await expect(page.locator('text=Sesja zakończona')).toBeVisible();
    
    // Should show option to start new session
    await expect(page.locator('button:has-text("Rozpocznij nową sesję")')).toBeVisible();
  });

  test('should handle API errors during learning', async ({ page }) => {
    await page.goto('/learn');
    
    // Mock API error for starting session
    await page.route('/api/learn/session', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to start learning session' })
      });
    });
    
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    
    // Should show error message
    await expect(page.locator('text=Nie udało się rozpocząć sesji nauki')).toBeVisible();
    
    // Should allow retry
    await expect(page.locator('button:has-text("Spróbuj ponownie")')).toBeVisible();
  });

  test('should handle rating API errors', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    await page.click('[data-testid="learning-card"]');
    
    // Mock API error for rating
    await page.route('/api/learn/session/rate', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to save rating' })
      });
    });
    
    await page.click('button:has-text("4")');
    
    // Should show error message
    await expect(page.locator('text=Nie udało się zapisać oceny')).toBeVisible();
    
    // Should allow retry rating
    await expect(page.locator('[data-testid="rating-buttons"]')).toBeVisible();
  });

  test('should persist session across page refreshes', async ({ page }) => {
    await page.goto('/learn');
    await page.click('button:has-text("Rozpocznij sesję nauki")');
    await page.waitForSelector('[data-testid="learning-card"]');
    
    // Mock continuing session
    await page.route('/api/learn/session*', route => {
      const url = route.request().url();
      if (url.includes('session_id=session-123')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            card: {
              id: 'card-123',
              front: 'What is React?',
              back: 'A JavaScript library',
              last_reviewed: null,
              review_count: 0,
              difficulty_rating: 2.5
            },
            session: {
              session_id: 'session-123',
              cards_reviewed: 0,
              cards_remaining: 5,
              session_start: new Date().toISOString()
            }
          })
        });
      }
    });
    
    // Refresh the page
    await page.reload();
    
    // Should continue existing session
    await expect(page.locator('[data-testid="learning-card"]')).toBeVisible();
    await expect(page.locator('text=Kontynuuj sesję')).toBeVisible();
  });
});