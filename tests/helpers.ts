import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for Comuniti platform
 */

export interface TestUser {
  email: string;
  password: string;
  fullName: string;
}

export interface TestBusiness {
  businessName: string;
  contactPerson: string;
  email: string;
  whatsappNumber: string;
  businessAddress: string;
  categories: string[];
}

/**
 * Generate a unique test user
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `qa+${timestamp}@example.com`,
    password: 'Test1234!',
    fullName: `QA User ${timestamp}`
  };
}

/**
 * Generate test business data
 */
export function generateTestBusiness(): TestBusiness {
  const timestamp = Date.now();
  return {
    businessName: `QA Bistro ${timestamp}`,
    contactPerson: 'Test Manager',
    email: `business+${timestamp}@example.com`,
    whatsappNumber: '50612345678',
    businessAddress: '123 Test Street, Test City, Test Country',
    categories: ['Restaurant', 'Food & Dining']
  };
}

/**
 * Programmatically create account via UI
 */
export async function createAccount(page: Page, user: TestUser, country: string = 'Costa Rica'): Promise<void> {
  // Navigate to onboarding
  await page.goto('/onboarding/ambassador');
  
  // Platform selection step
  await page.getByText('YouTube').click();
  await page.fill('input[placeholder="Enter your follower count"]', '5000');
  await page.getByRole('button', { name: 'Continue' }).click();
  
  // Account creation step  
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.fill('input[placeholder="Enter your full name"]', user.fullName);
  
  // Select country
  await page.getByRole('combobox').click();
  await page.getByText(country).click();
  
  await page.getByRole('button', { name: 'Create Account' }).click();
}

/**
 * Add business via list-builder form
 */
export async function addBusiness(page: Page, business: TestBusiness): Promise<void> {
  // Fill business form
  await page.fill('input[placeholder="Business name"]', business.businessName);
  await page.fill('input[placeholder="Contact person name"]', business.contactPerson);
  await page.fill('input[placeholder="Contact email"]', business.email);
  await page.fill('input[placeholder="WhatsApp number"]', business.whatsappNumber);
  await page.fill('textarea[placeholder="Business address"]', business.businessAddress);
  
  // Select categories
  await page.getByRole('combobox').click();
  for (const category of business.categories) {
    await page.getByText(category, { exact: true }).click();
  }
  await page.keyboard.press('Escape'); // Close dropdown
}

/**
 * Complete branding step with placeholder image
 */
export async function completeBranding(page: Page, listName: string, tagline: string = 'Test Ambassador'): Promise<void> {
  await page.fill('input[placeholder="e.g., Mike\'s Panama Network"]', listName);
  await page.fill('input[placeholder="e.g., Helping families relocate since 2021"]', tagline);
  
  // Upload placeholder image (create a simple SVG)
  const imagePath = './tests/fixtures/test-avatar.png';
  await page.setInputFiles('input[type="file"]', imagePath);
  
  await page.getByRole('button', { name: 'Create Ambassador Page' }).click();
}

/**
 * Wait for navigation and verify page loaded
 */
export async function waitForPageLoad(page: Page, expectedUrl?: string): Promise<void> {
  await page.waitForLoadState('networkidle');
  if (expectedUrl) {
    await expect(page).toHaveURL(expectedUrl);
  }
}

/**
 * Sign in with existing credentials
 */
export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/auth/sign-in');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

/**
 * Verify country dropdown options
 */
export async function verifyCountryOptions(page: Page): Promise<string[]> {
  await page.getByRole('combobox').click();
  
  // Wait for options to load
  await page.waitForSelector('[role="option"]');
  
  const options = await page.$$eval('[role="option"]', elements => 
    elements.map(el => el.textContent?.trim() || '')
  );
  
  return options.filter(option => option.length > 0);
}

/**
 * Get supported countries from the platform
 */
export const EXPECTED_COUNTRIES = [
  'Costa Rica',
  'Panama',
  'Mexico',
  'Portugal',
  'Spain',
  'Colombia',
  'Ecuador',
  'Peru',
  'Argentina',
  'Chile'
];