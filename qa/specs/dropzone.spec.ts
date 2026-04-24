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
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/dropzone/`;

test.describe("dropzone", () => {

  test("dropzone / image/* / light — L1 axe: label (WCAG 4.1.2)", async ({ page }) => {
    // axe violation: label — impact: critical — WCAG 4.1.2
    // Fix: Fix any of the following:
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Elem
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "image/*").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "label");
    expect(violations,
      `axe rule "label" must not fire on dropzone/image/*/light`)
      .toHaveLength(0);
  });

  test("dropzone / .pdf / light — L1 axe: label (WCAG 4.1.2)", async ({ page }) => {
    // axe violation: label — impact: critical — WCAG 4.1.2
    // Fix: Fix any of the following:
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Elem
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', ".pdf").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "label");
    expect(violations,
      `axe rule "label" must not fire on dropzone/.pdf/light`)
      .toHaveLength(0);
  });

  test("dropzone / video/* / light — L1 axe: label (WCAG 4.1.2)", async ({ page }) => {
    // axe violation: label — impact: critical — WCAG 4.1.2
    // Fix: Fix any of the following:
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Elem
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "video/*").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "label");
    expect(violations,
      `axe rule "label" must not fire on dropzone/video/*/light`)
      .toHaveLength(0);
  });

  test("dropzone / * / light — L1 axe: label (WCAG 4.1.2)", async ({ page }) => {
    // axe violation: label — impact: critical — WCAG 4.1.2
    // Fix: Fix any of the following:
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Elem
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "*").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "label");
    expect(violations,
      `axe rule "label" must not fire on dropzone/*/light`)
      .toHaveLength(0);
  });

  test("dropzone / image/* / dark — L1 axe: label (WCAG 4.1.2)", async ({ page }) => {
    // axe violation: label — impact: critical — WCAG 4.1.2
    // Fix: Fix any of the following:
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Elem
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "image/*").catch(() => {});
    await page.waitForTimeout(300);
    // Enable dark mode
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.controls-panel .control-row'));
      const darkRow = rows.find((r: Element) => r.textContent?.toLowerCase().includes('dark'));
      (darkRow?.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.click();
    });
    await page.waitForTimeout(400);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "label");
    expect(violations,
      `axe rule "label" must not fire on dropzone/image/*/dark`)
      .toHaveLength(0);
  });

  test("dropzone / image/* / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "image/*").catch(() => {});
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

  test("dropzone / .pdf / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', ".pdf").catch(() => {});
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

  test("dropzone / video/* / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "video/*").catch(() => {});
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

  test("dropzone / * / L2 keyboard: enter-key-no-activate (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — enter-key-no-activate — WCAG 2.1.1
    // Fix: Enter key does not activate component — add keydown handler or use native button element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "*").catch(() => {});
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
