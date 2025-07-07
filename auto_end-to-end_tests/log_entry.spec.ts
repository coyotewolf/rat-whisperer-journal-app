import { test, expect } from '@playwright/test';

/**
 * @file This file contains end-to-end tests for the log entry functionality.
 * @description The tests cover the process of creating new log entries for different types (Health, Behavior)
 * and also test negative paths like submitting without required fields.
 */

test.describe('Log Entry Functionality', () => {
  /**
   * This hook runs before each test in this file.
   * It ensures the user is logged in and on the correct starting page.
   * This approach centralizes the login logic, making tests cleaner and more maintainable.
   */
  test.beforeEach(async ({ page }) => {
    // Listen for any console errors during the test execution.
    // This helps catch unexpected client-side errors that might not fail the test directly.
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser Console Error: ${msg.text()}`);
      }
    });

    // Navigate to the root and handle login if necessary.
    await page.goto('/');
    const signInButton = page.getByRole('button', { name: 'Sign In / Sign Up' });
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.getByLabel('Email').fill(process.env.TEST_USERNAME!);
      await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('/rats'); // Wait for redirection after login.
    }
    // Ensure we start each test from the homepage where "Quick Log" is located.
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Quick Log' })).toBeVisible();
  });

  /**
   * Test Case: Successfully adding a new Health Log entry.
   * This covers the positive path for creating a health log.
   */
  test('should allow adding a new Health Log entry', async ({ page }) => {
    // 1. Open the Quick Log modal and select "Health Check".
    await page.getByRole('button', { name: 'Quick Log' }).click();
    await page.getByRole('button', { name: 'Health Check' }).click();

    // 2. Select a rat.
    await expect(page.getByRole('dialog', { name: /Add .* Log/i })).toBeVisible();
    await page.getByRole('button', { name: /Select rats/i }).click();
    // Wait for the options to be populated by the async fetch by waiting for a specific rat to appear.
    await expect(page.getByLabel('Test Rat')).toBeVisible();
    await page.getByLabel('Test Rat').check();
    // Close the popover by clicking the body.
    await page.locator('body').click();

    // 3. Fill out the form.
    await page.getByLabel('Health Status').click();
    await page.getByRole('option', { name: 'Excellent' }).click();
    await page.getByLabel('Notes').fill('Test health log entry from Playwright.');

    // 4. Submit the form.
    await page.getByRole('button', { name: 'Add Log Entry' }).click();

    // 5. Verify the success toast message.
    await expect(page.getByText('Activity log added successfully')).toBeVisible();
  });

  /**
   * Test Case: Attempting to submit a log without selecting a rat.
   * This covers a negative path to ensure proper validation.
   */
  test('should show an error when submitting without selecting a rat', async ({ page }) => {
    // 1. Open the Quick Log modal and select "Health Check".
    await page.getByRole('button', { name: 'Quick Log' }).click();
    await page.getByRole('button', { name: 'Health Check' }).click();

    // 2. Skip selecting a rat and try to submit.
    await expect(page.getByRole('dialog', { name: /Add .* Log/i })).toBeVisible();
    await page.getByRole('button', { name: 'Add Log Entry' }).click();

    // 3. Verify the error toast message.
    await expect(page.getByText('Please select at least one rat.')).toBeVisible();
  });

  /**
   * Test Case: Successfully adding a new Behavior Log entry.
   * This covers the positive path for creating a behavior log.
   */
  test('should allow adding a new Behavior Log entry', async ({ page }) => {
    // 1. Open the Quick Log modal and select "Behavior".
    await page.getByRole('button', { name: 'Quick Log' }).click();
    await page.getByRole('button', { name: 'Behavior' }).click();

    // 2. Select a rat.
    await expect(page.getByRole('dialog', { name: /Add .* Log/i })).toBeVisible();
    await page.getByRole('button', { name: /Select rats/i }).click();
    await expect(page.getByLabel('Test Rat')).toBeVisible();
    await page.getByLabel('Test Rat').check();
    await page.locator('body').click();

    // 3. Fill out the form.
    await page.getByLabel('Notes').fill('Test behavior log entry from Playwright.');

    // 4. Submit the form.
    await page.getByRole('button', { name: 'Add Log Entry' }).click();

    // 5. Verify the success toast message.
    await expect(page.getByText('Activity log added successfully')).toBeVisible();
  });
});