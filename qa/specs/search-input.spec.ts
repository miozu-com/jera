// Auto-generated from run_id: (legacy — no run_id)
// Generated at: 2026-04-19 13:11:44
// Source JSON:  System/Projects/Selify.ai/Reports/suite-test-results.json
// ⚠️  Do not edit manually. Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js System/Projects/Selify.ai/Reports/suite-test-results.json

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/search-input/`;

test.describe("search-input", () => {

  test("search-input / sm / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "sm").catch(() => {});
    await page.waitForTimeout(300);

    // Focus trigger element, press Enter, expect click event fires
    await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      const el = preview?.querySelector('button, a, [role="button"], [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (el) {
        (window as any).__specActivated = false;
        el.addEventListener('click', () => { (window as any).__specActivated = true; }, { once: true });
        el.focus();
      }
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const activated = await page.evaluate(() => (window as any).__specActivated === true);
    expect(activated, 'Enter key must trigger activation (click event) on the interactive element').toBe(true);
  });

  test("search-input / md / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "md").catch(() => {});
    await page.waitForTimeout(300);

    // Focus trigger element, press Enter, expect click event fires
    await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      const el = preview?.querySelector('button, a, [role="button"], [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (el) {
        (window as any).__specActivated = false;
        el.addEventListener('click', () => { (window as any).__specActivated = true; }, { once: true });
        el.focus();
      }
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const activated = await page.evaluate(() => (window as any).__specActivated === true);
    expect(activated, 'Enter key must trigger activation (click event) on the interactive element').toBe(true);
  });

  test("search-input / lg / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "lg").catch(() => {});
    await page.waitForTimeout(300);

    // Focus trigger element, press Enter, expect click event fires
    await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      const el = preview?.querySelector('button, a, [role="button"], [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (el) {
        (window as any).__specActivated = false;
        el.addEventListener('click', () => { (window as any).__specActivated = true; }, { once: true });
        el.focus();
      }
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const activated = await page.evaluate(() => (window as any).__specActivated === true);
    expect(activated, 'Enter key must trigger activation (click event) on the interactive element').toBe(true);
  });
});
