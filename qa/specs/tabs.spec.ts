// Auto-generated — always overwritten on next suite run. Do not edit manually.
// Auto-generated from run_id: suite-1777064583727
// Generated at: 2026-04-24 21:51:50
// Source JSON:  System/Projects/Selify.ai/Reports/Tabs-test-results.json
// Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js System/Projects/Selify.ai/Reports/Tabs-test-results.json

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/tabs/`;

test.describe("tabs", () => {

  test("tabs / default / L2 keyboard: tab-order-invalid (WCAG 2.4.3)", async ({ page }) => {
    // L2 Interaction — tab-order-invalid — WCAG 2.4.3
    // Fix: fail: tabIndex -1 on interactive element button.tab — remove tabindex="-1" from interactive elements or use aria-hidden="true" if intentionally excluded
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "default").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the component; interactive elements (button.tab, [role="tab"]) must NOT have tabindex="-1"
    const invalidEl = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      const candidates = Array.from(preview.querySelectorAll('button.tab, [role="tab"], button')) as HTMLElement[];
      const bad = candidates.find(el => el.tabIndex === -1);
      return bad ? (bad.tagName.toLowerCase() + (bad.className ? '.' + bad.className.trim().split(' ')[0] : '')) : null;
    });
    expect(invalidEl, `Interactive tab element must not have tabindex="-1" — WCAG 2.4.3 Focus Order`).toBeNull();
  });

  test("tabs / segment / L2 keyboard: tab-order-invalid (WCAG 2.4.3)", async ({ page }) => {
    // L2 Interaction — tab-order-invalid — WCAG 2.4.3
    // Fix: fail: tabIndex -1 on interactive element button.tab — remove tabindex="-1" from interactive elements or use aria-hidden="true" if intentionally excluded
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "segment").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the component; interactive elements (button.tab, [role="tab"]) must NOT have tabindex="-1"
    const invalidEl = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      const candidates = Array.from(preview.querySelectorAll('button.tab, [role="tab"], button')) as HTMLElement[];
      const bad = candidates.find(el => el.tabIndex === -1);
      return bad ? (bad.tagName.toLowerCase() + (bad.className ? '.' + bad.className.trim().split(' ')[0] : '')) : null;
    });
    expect(invalidEl, `Interactive tab element must not have tabindex="-1" — WCAG 2.4.3 Focus Order`).toBeNull();
  });

  test("tabs / underline / L2 keyboard: tab-order-invalid (WCAG 2.4.3)", async ({ page }) => {
    // L2 Interaction — tab-order-invalid — WCAG 2.4.3
    // Fix: fail: tabIndex -1 on interactive element button.tab — remove tabindex="-1" from interactive elements or use aria-hidden="true" if intentionally excluded
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "underline").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the component; interactive elements (button.tab, [role="tab"]) must NOT have tabindex="-1"
    const invalidEl = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      const candidates = Array.from(preview.querySelectorAll('button.tab, [role="tab"], button')) as HTMLElement[];
      const bad = candidates.find(el => el.tabIndex === -1);
      return bad ? (bad.tagName.toLowerCase() + (bad.className ? '.' + bad.className.trim().split(' ')[0] : '')) : null;
    });
    expect(invalidEl, `Interactive tab element must not have tabindex="-1" — WCAG 2.4.3 Focus Order`).toBeNull();
  });

  test("tabs / pills / L2 keyboard: tab-order-invalid (WCAG 2.4.3)", async ({ page }) => {
    // L2 Interaction — tab-order-invalid — WCAG 2.4.3
    // Fix: fail: tabIndex -1 on interactive element button.tab — remove tabindex="-1" from interactive elements or use aria-hidden="true" if intentionally excluded
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "pills").catch(() => {});
    await page.waitForTimeout(300);

    // Tab through the component; interactive elements (button.tab, [role="tab"]) must NOT have tabindex="-1"
    const invalidEl = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      const candidates = Array.from(preview.querySelectorAll('button.tab, [role="tab"], button')) as HTMLElement[];
      const bad = candidates.find(el => el.tabIndex === -1);
      return bad ? (bad.tagName.toLowerCase() + (bad.className ? '.' + bad.className.trim().split(' ')[0] : '')) : null;
    });
    expect(invalidEl, `Interactive tab element must not have tabindex="-1" — WCAG 2.4.3 Focus Order`).toBeNull();
  });
});
