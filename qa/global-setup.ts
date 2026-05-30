import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

export default async function globalSetup(_config: FullConfig) {
  const EMAIL    = process.env.SELIFY_EMAIL;
  const PASSWORD = process.env.SELIFY_PASSWORD;

  if (!EMAIL || !PASSWORD) {
    throw new Error('SELIFY_EMAIL / SELIFY_PASSWORD not set. Run: source load-credentials.sh');
  }

  const AUTH_DIR  = path.join(__dirname, '.auth');
  const AUTH_FILE = path.join(AUTH_DIR, 'state.json');
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  const baseURL = process.env.STORYBOOK_URL || 'https://admin.selify.ai';

  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });

  const url = page.url();
  if (!url.includes('/auth') && !url.includes('/login') && !url.includes('/sign')) {
    console.log('[global-setup] Already authenticated');
    await page.context().storageState({ path: AUTH_FILE });
    await browser.close();
    return;
  }

  console.log('[global-setup] Logging in...');
  const emailField = page.locator('input[type="email"], input[name="email"]').first();
  await emailField.waitFor({ state: 'visible', timeout: 10000 });
  await emailField.fill(EMAIL);
  await page.waitForTimeout(300);

  const passwordField = page.locator('input[type="password"]').first();
  let passwordVisible = await passwordField.isVisible().catch(() => false);
  if (!passwordVisible) {
    const pwdBtn = page.locator('button:has-text("Sign in with password")').first();
    if (await pwdBtn.isVisible().catch(() => false)) {
      await pwdBtn.click();
      await page.waitForTimeout(800);
    }
    passwordVisible = await passwordField.isVisible().catch(() => false);
  }

  if (passwordVisible) {
    await passwordField.fill(PASSWORD);
    await page.waitForTimeout(300);
    await passwordField.press('Enter');
  }

  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  const finalUrl = page.url();
  if (finalUrl.includes('/auth') || finalUrl.includes('/login')) {
    throw new Error(`Login failed — still on auth page: ${finalUrl}`);
  }

  console.log('[global-setup] Login successful — saving auth state');
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}
