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
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/left-bar-group/`;

test.describe("leftbargroup", () => {

  test("leftbargroup / L4 tablet (768×1024) — all", async ({ page }) => {
    // L4 Responsive — tablet 768×1024 — check: all
    // Fix: Layer 4 error at tablet: page.goto: net::ERR_NAME_NOT_RESOLVED at https://admin.selify.ai/
Call log:
  - navigating to "https
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);

    const renderResult = await page.evaluate(() => {
      const el = (document.querySelector('.preview-area [class*="jera-"]')
        ?? document.querySelector('.preview-area')?.firstElementChild) as HTMLElement | null;
      if (!el) return 'no-element';
      const b = el.getBoundingClientRect();
      return (b.width === 0 || b.height === 0) ? 'zero-dimensions' : 'pass';
    });
    expect(renderResult, `Component must render at tablet (768×1024)`).toBe('pass');
  });

  test("leftbargroup / L4 desktop (1440×900) — all", async ({ page }) => {
    // L4 Responsive — desktop 1440×900 — check: all
    // Fix: Layer 4 error at desktop: page.goto: net::ERR_INTERNET_DISCONNECTED at https://admin.selify.ai/
Call log:
  - navigating to "h
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);

    const renderResult = await page.evaluate(() => {
      const el = (document.querySelector('.preview-area [class*="jera-"]')
        ?? document.querySelector('.preview-area')?.firstElementChild) as HTMLElement | null;
      if (!el) return 'no-element';
      const b = el.getBoundingClientRect();
      return (b.width === 0 || b.height === 0) ? 'zero-dimensions' : 'pass';
    });
    expect(renderResult, `Component must render at desktop (1440×900)`).toBe('pass');
  });
});
