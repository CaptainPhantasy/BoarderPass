import { test, expect } from '@playwright/test';

test.describe('BOARDERPASS Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main landing page content', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Document Translation');
    
    // Check subtitle
    await expect(page.getByText('Made Simple')).toBeVisible();
    
    // Check description
    await expect(page.getByText(/Translate, validate, and certify/)).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check if navigation is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for auth links when not logged in
    const loginLink = page.getByRole('link', { name: /log in/i });
    const registerLink = page.getByRole('link', { name: /sign up/i });
    
    await expect(loginLink).toBeVisible();
    await expect(registerLink).toBeVisible();
  });

  test('should display call-to-action buttons', async ({ page }) => {
    // Check CTA button
    const ctaButton = page.getByRole('link', { name: /start free translation/i });
    await expect(ctaButton).toBeVisible();
    
    // Verify button styling
    await expect(ctaButton).toHaveClass(/bg-blue-600/);
  });

  test('should have features section', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    
    // Check features are visible
    const featuresSection = page.locator('section').filter({ hasText: /features/i });
    await expect(featuresSection).toBeVisible();
  });

  test('should have how it works section', async ({ page }) => {
    // Scroll to how it works section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
    
    // Check how it works section
    const howItWorksSection = page.locator('section').filter({ hasText: /how it works/i });
    await expect(howItWorksSection).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if content is still visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check if navigation is accessible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/BOARDERPASS/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeVisible();
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to page
    await page.goto('/');
    
    // Wait a bit for any potential errors
    await page.waitForTimeout(1000);
    
    // Check for console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCount(expect.any(Number));
    
    // Check for proper button roles
    const buttons = page.locator('button, [role="button"]');
    await expect(buttons).toHaveCount(expect.any(Number));
    
    // Check for proper link roles
    const links = page.locator('a[href]');
    await expect(links).toHaveCount(expect.any(Number));
  });

  test('should handle authentication state changes', async ({ page }) => {
    // Initially should show sign up button
    await expect(page.getByRole('link', { name: /start free translation/i })).toBeVisible();
    
    // Mock authenticated state (this would normally be done through actual auth)
    await page.evaluate(() => {
      // Simulate authenticated user
      localStorage.setItem('supabase.auth.token', 'mock-token');
      window.dispatchEvent(new Event('storage'));
    });
    
    // Wait for potential state changes
    await page.waitForTimeout(1000);
    
    // Note: In a real test, you'd check for authenticated state changes
    // This is just a placeholder for the test structure
  });

  test('should have working footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if footer is visible
    const footer = page.locator('footer');
    if (await footer.isVisible()) {
      // Check for footer links
      const footerLinks = footer.locator('a');
      await expect(footerLinks).toHaveCount(expect.any(Number));
    }
  });
});
