import { test, expect } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Ambassador Directory', () => {
  
  test('A1: Public directory page loads correctly', async ({ page }) => {
    // Test with an existing ambassador page (lunas-happy-places from logs)
    await page.goto('/directory/lunas-happy-places');
    
    // Wait for page to load
    await waitForPageLoad(page);
    
    // Verify ambassador profile elements
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByText(/member since/i)).toBeVisible();
    
    // Check for business listings section
    await expect(page.getByText(/recommended businesses/i)).toBeVisible();
  });

  test('A2: Directory shows 404 for non-existent ambassador', async ({ page }) => {
    await page.goto('/directory/non-existent-ambassador');
    
    await waitForPageLoad(page);
    
    // Should show ambassador not found message
    await expect(page.getByText(/ambassador not found/i)).toBeVisible();
  });

  test('A3: Business cards display correctly', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Look for business cards
    const businessCards = page.locator('[role="article"], .business-card, [data-testid="business-card"]').first();
    
    if (await businessCards.isVisible()) {
      // Verify business card elements
      await expect(businessCards.getByRole('heading')).toBeVisible();
      
      // Check for action buttons
      const whatsappButton = businessCards.getByRole('link', { name: /whatsapp/i });
      const mapsButton = businessCards.getByRole('link', { name: /maps|location/i });
      
      if (await whatsappButton.isVisible()) {
        expect(await whatsappButton.getAttribute('href')).toContain('wa.me');
      }
      
      if (await mapsButton.isVisible()) {
        expect(await mapsButton.getAttribute('href')).toContain('maps.google.com');
      }
    }
  });

  test('A4: Language selector works on directory page', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Check if language selector is present
    const languageSelector = page.locator('[role="combobox"]').filter({ hasText: /english|español|português/i });
    
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      await expect(page.getByText('English')).toBeVisible();
      await expect(page.getByText('Español')).toBeVisible();
      await expect(page.getByText('Português')).toBeVisible();
    }
  });

  test('A5: Directory page is responsive', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify layout adjusts for mobile
    await expect(page.getByRole('main')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await expect(page.getByRole('main')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('A6: WhatsApp links work correctly', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Find WhatsApp buttons
    const whatsappLinks = page.getByRole('link', { name: /whatsapp/i });
    const count = await whatsappLinks.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const link = whatsappLinks.nth(i);
        const href = await link.getAttribute('href');
        expect(href).toContain('wa.me');
        expect(href).toMatch(/wa\.me\/\d+/);
      }
    }
  });

  test('A7: Google Maps links work correctly', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Find Maps buttons
    const mapsLinks = page.getByRole('link', { name: /maps|location/i });
    const count = await mapsLinks.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const link = mapsLinks.nth(i);
        const href = await link.getAttribute('href');
        expect(href).toContain('maps.google.com');
      }
    }
  });

  test('A8: Member since date displays correctly', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Check for member since date format
    const memberSince = page.getByText(/member since/i);
    if (await memberSince.isVisible()) {
      const text = await memberSince.textContent();
      // Should be in format "Member since Month Year"
      expect(text).toMatch(/member since \w+ \d{4}/i);
    }
  });

  test('A9: Directory page has proper SEO elements', async ({ page }) => {
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    // Check for title tag
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check meta description if present
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('A10: Directory page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/directory/lunas-happy-places');
    await waitForPageLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check that essential content is visible
    await expect(page.getByRole('main')).toBeVisible();
  });
});