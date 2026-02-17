import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('mock auth and show workspaces', async ({ page, baseURL }, testInfo) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  // Prepare a fake token and user in localStorage before loading the app
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-token-for-tests');
    localStorage.setItem('user', JSON.stringify({ id: 'test-user', username: 'tester' }));
  });

  try {
    // Navigate directly to the workspaces route (skip root redirects)
    await page.goto('/workspaces');

    // Wait for workspaces page to render
    await expect(page.locator('text=Your Workspaces')).toBeVisible({ timeout: 10000 });

    // If no workspaces, ensure empty state shows
    const empty = await page.locator('.workspaces-empty').count();
    if (empty > 0) {
      await expect(page.locator('text=No workspaces yet')).toBeVisible();
    } else {
      // otherwise assert at least workspace cards or loading finished
      await expect(page.locator('.workspace-card').first()).toBeVisible();
    }
  } catch (err) {
    // On failure, dump console logs and page HTML to test-results for inspection
    const outDir = path.join('test-results', testInfo.title.replace(/\s+/g, '-'));
    fs.mkdirSync(outDir, { recursive: true });
    try {
      const html = await page.content();
      fs.writeFileSync(path.join(outDir, 'page.html'), html, 'utf8');
    } catch (e) {
      logs.push(`error: failed to capture page content: ${e}`);
    }
    try {
      fs.writeFileSync(path.join(outDir, 'console.log'), logs.join('\n'), 'utf8');
    } catch (e) {
      // ignore
    }
    throw err;
  }
});
