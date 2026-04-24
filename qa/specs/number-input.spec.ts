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
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/number-input/`;

test.describe("number-input", () => {

  test("number-input / sm / light — L1 axe: label (WCAG 4.1.2)", async ({ page }) => {
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
    await page.selectOption('.controls-panel select.jera-select', "sm").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "label");
    expect(violations,
      `axe rule "label" must not fire on number-input/sm/light`)
      .toHaveLength(0);
  });
});
