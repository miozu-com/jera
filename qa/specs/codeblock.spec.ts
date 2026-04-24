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
const COMPONENT_URL = `${STORYBOOK_URL}/docs/components/code-block/`;

test.describe("codeblock", () => {

  test("codeblock / javascript / light — L1 axe: color-contrast (WCAG 1.4.3)", async ({ page }) => {
    // axe violation: color-contrast — impact: serious — WCAG 1.4.3
    // Fix: Fix any of the following:
  Element has insufficient color contrast of 4.31 (foreground color: #008a3e, background color: #fafbfd, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "javascript").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "color-contrast");
    expect(violations,
      `axe rule "color-contrast" must not fire on codeblock/javascript/light`)
      .toHaveLength(0);
  });

  test("codeblock / javascript / light — L1 axe: color-contrast (WCAG 1.4.3)", async ({ page }) => {
    // axe violation: color-contrast — impact: serious — WCAG 1.4.3
    // Fix: Fix any of the following:
  Element has insufficient color contrast of 4.31 (foreground color: #008a3e, background color: #fafbfd, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "javascript").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "color-contrast");
    expect(violations,
      `axe rule "color-contrast" must not fire on codeblock/javascript/light`)
      .toHaveLength(0);
  });

  test("codeblock / javascript / light — L1 axe: color-contrast (WCAG 1.4.3)", async ({ page }) => {
    // axe violation: color-contrast — impact: serious — WCAG 1.4.3
    // Fix: Fix any of the following:
  Element has insufficient color contrast of 4.31 (foreground color: #008a3e, background color: #fafbfd, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "javascript").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "color-contrast");
    expect(violations,
      `axe rule "color-contrast" must not fire on codeblock/javascript/light`)
      .toHaveLength(0);
  });

  test("codeblock / L4 mobile (375×812) — text_readable", async ({ page }) => {
    // L4 Responsive — mobile 375×812 — check: text_readable
    // Fix: fail: font-size 10px on "javascript"
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

  test("codeblock / L4 tablet (768×1024) — overflow", async ({ page }) => {
    // L4 Responsive — tablet 768×1024 — check: overflow
    // Fix: Overflow at tablet: detected: right edge at 827px (viewport 768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);

    const overflows = await page.evaluate((vw: number) => {
      const preview = document.querySelector('.preview-area');
      if (!preview) return false;
      return preview.getBoundingClientRect().right > vw + 4 || document.body.scrollWidth > vw + 4;
    }, 768);
    expect(overflows, `No horizontal overflow at tablet (viewport: 768px wide)`).toBe(false);
  });

  test("codeblock / L4 tablet (768×1024) — text_readable", async ({ page }) => {
    // L4 Responsive — tablet 768×1024 — check: text_readable
    // Fix: fail: font-size 10px on "javascript"
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

  test("codeblock / L4 desktop (1440×900) — text_readable", async ({ page }) => {
    // L4 Responsive — desktop 1440×900 — check: text_readable
    // Fix: fail: font-size 10px on "javascript"
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
