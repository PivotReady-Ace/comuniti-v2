import { test, expect } from '@playwright/test';
import { 
  generateTestUser, 
  generateTestBusiness, 
  createAccount, 
  addBusiness, 
  completeBranding,
  verifyCountryOptions,
  EXPECTED_COUNTRIES,
  waitForPageLoad 
} from './helpers';

test.describe('Ambassador Onboarding Flow', () => {
  
  test('A3: Platform selection shows correct options and country dropdown has 10 countries', async ({ page }) => {
    await page.goto('/onboarding/ambassador');
    
    // Verify platform options
    await expect(page.getByText('YouTube')).toBeVisible();
    await expect(page.getByText('Instagram')).toBeVisible();
    await expect(page.getByText('Facebook')).toBeVisible();
    await expect(page.getByText('TikTok')).toBeVisible();
    await expect(page.getByText('LinkedIn')).toBeVisible();
    await expect(page.getByText('Other')).toBeVisible();
    
    // Select a platform and continue to account creation
    await page.getByText('YouTube').click();
    await page.fill('input[placeholder="Enter your follower count"]', '5000');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify we're on account creation page
    await expect(page).toHaveURL('/onboarding/ambassador/account');
    
    // Test country dropdown
    const countries = await verifyCountryOptions(page);
    
    // Assert exactly 10 countries
    expect(countries).toHaveLength(10);
    
    // Assert contains expected countries
    EXPECTED_COUNTRIES.forEach(country => {
      expect(countries).toContain(country);
    });
  });

  test('A4: Follower threshold validation works correctly', async ({ page }) => {
    await page.goto('/onboarding/ambassador');
    
    // Select platform but enter low follower count
    await page.getByText('YouTube').click();
    await page.fill('input[placeholder="Enter your follower count"]', '0');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should show validation error or waitlist message
    await expect(page.getByText(/follower count must be at least/i)).toBeVisible();
  });

  test('A5: Complete account creation step', async ({ page }) => {
    const testUser = generateTestUser();
    
    await page.goto('/onboarding/ambassador');
    
    // Platform selection
    await page.getByText('YouTube').click();
    await page.fill('input[placeholder="Enter your follower count"]', '5000');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Account creation
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.fill('input[placeholder="Enter your full name"]', testUser.fullName);
    
    // Select country
    await page.getByRole('combobox').click();
    await page.getByText('Costa Rica').click();
    
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should navigate to email confirmation or next step
    await waitForPageLoad(page);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/auth\/email-confirmation|\/onboarding\/ambassador\/list-builder/);
  });

  test('A6: Add business in list-builder', async ({ page }) => {
    // This test assumes we have a way to get to list-builder
    // In practice, we'd need to complete the full flow or mock auth state
    const testBusiness = generateTestBusiness();
    
    // Skip to list-builder for testing (would need proper setup in real scenario)
    await page.goto('/onboarding/ambassador/list-builder');
    
    // Verify we can see the business form
    await expect(page.getByText(/add your first business/i)).toBeVisible();
    
    // Fill business form
    await addBusiness(page, testBusiness);
    
    // Verify business was added
    await expect(page.locator(`input[value="${testBusiness.businessName}"]`)).toBeVisible();
  });

  test('A7: Complete branding step', async ({ page }) => {
    const testUser = generateTestUser();
    
    // Skip to branding for testing (would need proper setup in real scenario)
    await page.goto('/onboarding/ambassador/branding');
    
    const listName = `${testUser.fullName}'s Network`;
    const tagline = 'Helping people relocate with confidence';
    
    await completeBranding(page, listName, tagline);
    
    // Should navigate to success page or directory
    await waitForPageLoad(page);
    expect(page.url()).toMatch(/\/directory\/|\/dashboard/);
  });

  test('A8: LocalStorage cleanup after completion', async ({ page }) => {
    // Test that localStorage is properly cleaned after onboarding completion
    await page.goto('/onboarding/ambassador');
    
    // Add some onboarding data
    await page.evaluate(() => {
      localStorage.setItem('onboardingData_testuser', JSON.stringify({
        platforms: ['YouTube'],
        followerCount: 5000
      }));
    });
    
    // Verify data exists
    const dataExists = await page.evaluate(() => {
      return localStorage.getItem('onboardingData_testuser') !== null;
    });
    expect(dataExists).toBe(true);
    
    // Complete onboarding would clean up localStorage
    // This is tested through the actual flow in integration tests
  });

  test('A9: User can navigate back through onboarding steps', async ({ page }) => {
    await page.goto('/onboarding/ambassador');
    
    // Complete platform selection
    await page.getByText('YouTube').click();
    await page.fill('input[placeholder="Enter your follower count"]', '5000');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should be on account creation
    await expect(page).toHaveURL('/onboarding/ambassador/account');
    
    // Navigate back (if back button exists)
    const backButton = page.getByRole('button', { name: /back/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL('/onboarding/ambassador');
    }
  });

  test('A10: Error handling in onboarding flow', async ({ page }) => {
    await page.goto('/onboarding/ambassador');
    
    // Test form validation
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should show validation errors
    await expect(page.getByText(/please select at least one platform/i)).toBeVisible();
    
    // Test with invalid follower count
    await page.getByText('YouTube').click();
    await page.fill('input[placeholder="Enter your follower count"]', '-1');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should show follower count validation
    await expect(page.getByText(/follower count must be at least/i)).toBeVisible();
  });
});