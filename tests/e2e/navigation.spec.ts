import { expect, test } from '@playwright/test';

// CI must never contact production Supabase or other third-party services.
// These smoke tests verify rendering and client-side routing only.
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$)|localhost(?::\d+)?(?:\/|$))/, route => route.abort());
});

test('unknown route displays a useful 404 and returns to the home screen', async ({ page }) => {
  await page.goto('/non-existent-smoke-route');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  const home = page.getByRole('link', { name: 'Return to Home' });
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'RatTracker' })).toBeVisible();
});

test('home screen exposes reports navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'RatTracker' })).toBeVisible();
  await page.getByRole('button', { name: 'Reports' }).click();
  await expect(page).toHaveURL('/reports');
});
