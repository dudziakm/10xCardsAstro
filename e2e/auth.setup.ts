import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Mock authentication for testing since we're using Supabase Auth
  // In a real test environment, you might need to set up a test database
  
  // Go to homepage
  await page.goto('/');
  
  // Check if we can access the application
  await expect(page).toHaveTitle(/my10xCards/);
  
  // For now, we'll mock the auth state since we're testing locally
  // In production, this would involve actual login flow
  await page.addInitScript(() => {
    // Mock Supabase session
    window.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh',
      user: {
        id: '4d4918b3-fcb8-4ece-93c9-3272e8cbacc0',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      }
    }));
  });
  
  // Save signed-in state to 'authFile'.
  await page.context().storageState({ path: authFile });
});