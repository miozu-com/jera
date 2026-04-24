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
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/accordion/`;

test.describe("accordion", () => {

  test("accordion / L4 mobile (375×812) — text_readable", async ({ page }) => {
    // L4 Responsive — mobile 375×812 — check: text_readable
    // Fix: fail: font-size 11px on "3"
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);

    const smallText = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      for (const el of Array.from(preview.querySelectorAll('*')) as HTMLElement[]) {
        if (el.childElementCount === 0 && el.textContent!.trim().length > 0) {
          const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
          if (fs < 12) return `font-size ${fs}px on "${el.textContent!.trim().slice(0, 30)}"`;
        }
      }
      return null;
    });
    expect(smallText, `All text must be >= 12px at mobile`).toBeNull();
  });

  test("accordion / L4 tablet (768×1024) — text_readable", async ({ page }) => {
    // L4 Responsive — tablet 768×1024 — check: text_readable
    // Fix: fail: font-size 11px on "3"
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);

    const smallText = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      for (const el of Array.from(preview.querySelectorAll('*')) as HTMLElement[]) {
        if (el.childElementCount === 0 && el.textContent!.trim().length > 0) {
          const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
          if (fs < 12) return `font-size ${fs}px on "${el.textContent!.trim().slice(0, 30)}"`;
        }
      }
      return null;
    });
    expect(smallText, `All text must be >= 12px at tablet`).toBeNull();
  });

  test("accordion / L4 desktop (1440×900) — text_readable", async ({ page }) => {
    // L4 Responsive — desktop 1440×900 — check: text_readable
    // Fix: fail: font-size 11px on "3"
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);

    const smallText = await page.evaluate(() => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return null;
      for (const el of Array.from(preview.querySelectorAll('*')) as HTMLElement[]) {
        if (el.childElementCount === 0 && el.textContent!.trim().length > 0) {
          const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
          if (fs < 12) return `font-size ${fs}px on "${el.textContent!.trim().slice(0, 30)}"`;
        }
      }
      return null;
    });
    expect(smallText, `All text must be >= 12px at desktop`).toBeNull();
  });
});
