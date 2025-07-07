import { test, expect, Page } from '@playwright/test';
import fs from 'fs';

const consoleMessages: {type: string; text: string}[] = [];

async function captureConsole(page: Page) {
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
}

async function clickAllButtons(page: Page) {
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    if (await btn.isVisible()) {
      try {
        await btn.click({ timeout: 1000 });
      } catch (e) {
        // ignore errors from hidden/disabled buttons
      }
    }
  }
}

test('navigate pages and click buttons', async ({ page }) => {
  await captureConsole(page);
  await page.goto('http://localhost:8080/');

  const navSelectors = ['[href="/"]', '[href="/rats"]', '[href="/logs"]', '[href="/library"]', '[href="/community"]'];

  for (const sel of navSelectors) {
    await page.click(sel);
    await page.waitForLoadState('networkidle');
    await clickAllButtons(page);
  }

  fs.writeFileSync('playwright-console.json', JSON.stringify(consoleMessages, null, 2));
});
