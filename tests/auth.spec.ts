import { test, expect } from '@playwright/test';
import { generateTestUser, signIn, waitForPageLoad } from './helpers';

test.describe('Authentication Flow', () => {
  
  test('A1: User can access sign-in page', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    await expect(page).toHaveTitle(/Comuniti/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('A2: User sees validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Test empty form submission
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    
    // Test invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'short');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('A3: User sees error for non-existent account', async ({ page }) => {
    const testUser = generateTestUser();
    
    await page.goto('/auth/sign-in');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show authentication error
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });

  test('A4: User can navigate to home from sign-in', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click logo to go home
    await page.getByRole('img', { name: /comuniti/i }).click();
    await expect(page).toHaveURL('/');
    
    // Verify home page content
    await expect(page.getByRole('heading', { name: /connect/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /join as an influencer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /list your business/i })).toBeVisible();
  });

  test('A5: User can access language selector', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Verify language selector is present
    await expect(page.locator('[role="combobox"]').filter({ hasText: /english|español|português/i })).toBeVisible();
    
    // Test language switching (if implemented)
    const languageSelector = page.locator('[role="combobox"]').filter({ hasText: /english|español|português/i });
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      await expect(page.getByText('English')).toBeVisible();
      await expect(page.getByText('Español')).toBeVisible();
      await expect(page.getByText('Português')).toBeVisible();
    }
  });
});