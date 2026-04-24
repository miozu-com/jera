// Auto-generated — always overwritten on next suite run. Do not edit manually.
// Auto-generated from run_id: suite-1777064583727
// Generated at: 2026-04-24 21:33:33
// Source JSON:  /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json
// Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/input/`;

test.describe("input", () => {

  test("input / text / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "text").catch(() => {});
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

  test("input / email / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "email").catch(() => {});
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

  test("input / password / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "password").catch(() => {});
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

  test("input / number / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "number").catch(() => {});
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

  test("input / tel / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "tel").catch(() => {});
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

  test("input / url / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "url").catch(() => {});
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

  test("input / search / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "search").catch(() => {});
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
