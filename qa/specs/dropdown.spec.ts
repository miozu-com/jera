// Auto-generated — always overwritten on next suite run. Do not edit manually.
// Auto-generated from run_id: (legacy — no run_id)
// Generated at: 2026-04-24 21:33:33
// Source JSON:  /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json
// Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/dropdown/`;

test.describe("dropdown", () => {

  test("dropdown / bottom-start / light — L1 axe: aria-allowed-attr (WCAG 4.1.2)", async ({ page }) => {
    // axe violation: aria-allowed-attr — impact: critical — WCAG 4.1.2
    // Fix: Fix all of the following:
  ARIA attribute is not allowed: aria-expanded="false"
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "bottom-start").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "aria-allowed-attr");
    expect(violations,
      `axe rule "aria-allowed-attr" must not fire on dropdown/bottom-start/light`)
      .toHaveLength(0);
  });

  test("dropdown / bottom-start / L2 keyboard: keyboard-tab-focus (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — keyboard-tab-focus — WCAG 2.1.1
    // Fix: Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "bottom-start").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the page up to 15 times; expect focus to enter .preview-area
    await page.evaluate(() => document.body.focus());
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      focused = await page.evaluate(() => {
        const preview = document.querySelector('.preview-area');
        return !!preview?.contains(document.activeElement);
      });
      if (focused) break;
    }
    expect(focused, 'Tab key must move focus into .preview-area').toBe(true);
  });

  test("dropdown / bottom-end / L2 keyboard: keyboard-tab-focus (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — keyboard-tab-focus — WCAG 2.1.1
    // Fix: Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "bottom-end").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the page up to 15 times; expect focus to enter .preview-area
    await page.evaluate(() => document.body.focus());
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      focused = await page.evaluate(() => {
        const preview = document.querySelector('.preview-area');
        return !!preview?.contains(document.activeElement);
      });
      if (focused) break;
    }
    expect(focused, 'Tab key must move focus into .preview-area').toBe(true);
  });

  test("dropdown / bottom-center / L2 keyboard: keyboard-tab-focus (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — keyboard-tab-focus — WCAG 2.1.1
    // Fix: Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "bottom-center").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the page up to 15 times; expect focus to enter .preview-area
    await page.evaluate(() => document.body.focus());
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      focused = await page.evaluate(() => {
        const preview = document.querySelector('.preview-area');
        return !!preview?.contains(document.activeElement);
      });
      if (focused) break;
    }
    expect(focused, 'Tab key must move focus into .preview-area').toBe(true);
  });

  test("dropdown / top-start / L2 keyboard: keyboard-tab-focus (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — keyboard-tab-focus — WCAG 2.1.1
    // Fix: Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "top-start").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the page up to 15 times; expect focus to enter .preview-area
    await page.evaluate(() => document.body.focus());
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      focused = await page.evaluate(() => {
        const preview = document.querySelector('.preview-area');
        return !!preview?.contains(document.activeElement);
      });
      if (focused) break;
    }
    expect(focused, 'Tab key must move focus into .preview-area').toBe(true);
  });

  test("dropdown / top-end / L2 keyboard: keyboard-tab-focus (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — keyboard-tab-focus — WCAG 2.1.1
    // Fix: Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "top-end").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the page up to 15 times; expect focus to enter .preview-area
    await page.evaluate(() => document.body.focus());
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      focused = await page.evaluate(() => {
        const preview = document.querySelector('.preview-area');
        return !!preview?.contains(document.activeElement);
      });
      if (focused) break;
    }
    expect(focused, 'Tab key must move focus into .preview-area').toBe(true);
  });

  test("dropdown / top-center / L2 keyboard: keyboard-tab-focus (WCAG 2.1.1)", async ({ page }) => {
    // L2 Interaction — keyboard-tab-focus — WCAG 2.1.1
    // Fix: Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "top-center").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the page up to 15 times; expect focus to enter .preview-area
    await page.evaluate(() => document.body.focus());
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      focused = await page.evaluate(() => {
        const preview = document.querySelector('.preview-area');
        return !!preview?.contains(document.activeElement);
      });
      if (focused) break;
    }
    expect(focused, 'Tab key must move focus into .preview-area').toBe(true);
  });
});
