/**
 * E2E tests for document processing flow
 */

import { test, expect } from '@playwright/test';

test.describe('Document Processing Flow', () => {
  test('Indian degree to US format', async ({ page }) => {
    await page.goto('/');
    // Note: Actual file upload would require a sample file
    // For testing, we'll simulate the process
    
    // Select countries
    await page.selectOption('#source-country', 'IN');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'degree');
    
    // Check if requirements are displayed
    await expect(page.locator('.requirements-section')).toBeVisible();
    await expect(page.locator('.requirement-item')).toHaveCount(3);
    
    // Verify specific requirements are shown
    await expect(page.locator('.requirement-must-have')).toContainText('Original degree certificate');
    await expect(page.locator('.requirement-authentication')).toContainText('MEA apostille');
  });
  
  test('Mexican transcript to US format', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'MX');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'transcript');
    
    // Check requirements
    await expect(page.locator('.requirements-section')).toBeVisible();
    await expect(page.locator('.requirement-authentication')).toContainText('Secretary of Education apostille');
  });
  
  test('Chinese degree to Canada format', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'CN');
    await page.selectOption('#target-country', 'CA');
    await page.selectOption('#document-type', 'degree');
    
    // Check requirements
    await expect(page.locator('.requirements-section')).toBeVisible();
    await expect(page.locator('.requirement-authentication')).toContainText('Foreign Affairs Ministry apostille');
  });
  
  test('Brazilian degree to Portugal format', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'BR');
    await page.selectOption('#target-country', 'PT');
    await page.selectOption('#document-type', 'degree');
    
    // Check requirements
    await expect(page.locator('.requirements-section')).toBeVisible();
    await expect(page.locator('.requirement-authentication')).toContainText('Ministry of Foreign Affairs apostille');
  });
  
  test('Nigerian degree to UK format', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'NG');
    await page.selectOption('#target-country', 'GB');
    await page.selectOption('#document-type', 'degree');
    
    // Check requirements
    await expect(page.locator('.requirements-section')).toBeVisible();
    await expect(page.locator('.requirement-must-have')).toContainText('National Youth Service Corps (NYSC) certificate');
  });
  
  test('Validation error display', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'IN');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'degree');
    
    // Simulate validation with missing apostille
    await page.click('#validate-button');
    
    // Check that validation results are displayed
    await expect(page.locator('.validation-results')).toBeVisible();
    await expect(page.locator('.compliance-score')).toBeVisible();
    
    // Check for specific error
    await expect(page.locator('.validation-error')).toContainText('Apostille required');
  });
  
  test('Legal term translation', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'IN');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'degree');
    
    // Check if translation section is available
    await expect(page.locator('.translation-section')).toBeVisible();
    
    // Check specific term translations
    await expect(page.locator('.term-mapping')).toContainText('स्नातक');
    await expect(page.locator('.term-mapping')).toContainText("Bachelor's Degree");
  });
  
  test('Office location information', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'IN');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'degree');
    
    // Check if office information is displayed
    await expect(page.locator('.office-locations')).toBeVisible();
    await expect(page.locator('.office-location')).toContainText('MEA Apostille Division');
    await expect(page.locator('.office-address')).toContainText('Patiala House, Tilak Marg');
  });
  
  test('Fee estimation', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'IN');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'degree');
    
    // Check if fee information is displayed
    await expect(page.locator('.fee-estimation')).toBeVisible();
    await expect(page.locator('.total-estimated-fee')).toContainText('₹1000-3000');
  });
  
  test('Processing time information', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#source-country', 'IN');
    await page.selectOption('#target-country', 'US');
    await page.selectOption('#document-type', 'degree');
    
    // Check if processing time information is displayed
    await expect(page.locator('.processing-time')).toBeVisible();
    await expect(page.locator('.typical-processing-days')).toContainText('15');
  });
});

test.describe('Translation Interface', () => {
  test('Side-by-side view displays correctly', async ({ page }) => {
    await page.goto('/translation');
    
    // Check if both source and target text areas are visible
    await expect(page.locator('.source-text')).toBeVisible();
    await expect(page.locator('.target-text')).toBeVisible();
    
    // Check if language selectors are present
    await expect(page.locator('#source-language')).toBeVisible();
    await expect(page.locator('#target-language')).toBeVisible();
  });
  
  test('Legal term highlighting works', async ({ page }) => {
    await page.goto('/translation');
    
    // Enter some text with legal terms
    await page.fill('.source-text', 'स्नातक प्रमाणपत्र');
    
    // Check if terms are highlighted
    await expect(page.locator('.legal-term')).toBeVisible();
    await expect(page.locator('.legal-term')).toContainText('स्नातक');
  });
});

test.describe('Compliance Guide', () => {
  test('Visual compliance guide displays correctly', async ({ page }) => {
    await page.goto('/compliance');
    
    // Check if document preview is visible
    await expect(page.locator('.document-preview')).toBeVisible();
    
    // Check if compliance checklist is visible
    await expect(page.locator('.compliance-checklist')).toBeVisible();
    
    // Check if score indicator is visible
    await expect(page.locator('.compliance-score')).toBeVisible();
  });
  
  test('Compliance suggestions are displayed', async ({ page }) => {
    await page.goto('/compliance');
    
    // Check if improvement suggestions are visible
    await expect(page.locator('.improvement-suggestions')).toBeVisible();
    
    // Check if specific suggestions appear
    await expect(page.locator('.suggestion-item')).toBeVisible();
  });
});