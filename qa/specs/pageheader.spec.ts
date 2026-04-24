// Auto-generated — always overwritten on next suite run. Do not edit manually.
// Auto-generated from run_id: suite-1777066958479
// Generated at: 2026-04-24 21:48:44
// Source JSON:  /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json
// Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/page-header/`;

test.describe("pageheader", () => {

  test("pageheader / compact / light — L1 axe: color-contrast (WCAG 1.4.3)", async ({ page }) => {
    // axe violation: color-contrast — impact: serious — WCAG 1.4.3
    // Fix: Fix any of the following:
  Element has insufficient color contrast of 4.31 (foreground color: #008a3e, background color: #fafbfd, font size: 13.5pt (18px), font weight: normal). Expected contrast ratio of 4.5:1
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "compact").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "color-contrast");
    expect(violations,
      `axe rule "color-contrast" must not fire on pageheader/compact/light`)
      .toHaveLength(0);
  });
});
