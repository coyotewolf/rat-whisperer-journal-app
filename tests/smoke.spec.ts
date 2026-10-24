import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // These browser smoke tests must not contact a live backend.
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
});

test('home renders and local navigation works without a signed-in account', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('a[href="/rats"]')).toBeVisible();
  await page.locator('a[href="/rats"]').click();
  await expect(page).toHaveURL(/\/rats$/);
  await expect(page.locator('a[href="/"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('unknown routes show the fallback and return home', async ({ page }) => {
  await page.goto('/security-smoke-not-found');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to Home' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('a[href="/rats"]')).toBeVisible();
});