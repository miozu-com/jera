// Auto-generated — always overwritten on next suite run. Do not edit manually.
// Auto-generated from run_id: suite-1777051700925
// Generated at: 2026-04-24 18:37:25
// Source JSON:  /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json
// Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js /Users/timofeyzhivenok/Desktop/QA-System/System/Projects/Selify.ai/Reports/suite-test-results.json

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = `${STORYBOOK_URL}/`;

test.describe("optioncard", () => {

  test("optioncard / default / light — L1 axe: color-contrast (WCAG 1.4.3)", async ({ page }) => {
    // axe violation: color-contrast — impact: serious — WCAG 1.4.3
    // Fix: Fix any of the following:
  Element has insufficient color contrast of 4.29 (foreground color: #007f92, background color: #f3f4f7, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "default").catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('.preview-area')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = results.violations.filter(v => v.id === "color-contrast");
    expect(violations,
      `axe rule "color-contrast" must not fire on optioncard/default/light`)
      .toHaveLength(0);
  });

  test("optioncard / default / light — L1 contrast ratio must meet WCAG AA (1.4.3)", async ({ page }) => {
    // Canvas-sampled contrast — axe marks oklch tokens as 'incomplete', we detect via pixel sampling
    // Measured: 3.18:1  Required: 4.5:1  FG: rgb(172,125,0)  BG: rgb(242,238,227)  Font: 12px
    // Fix: Contrast ratio 3.18:1 below WCAG AA minimum of 4.5:1
    await page.goto(COMPONENT_URL);
    await page.waitForSelector('.preview-area', { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.selectOption('.controls-panel select.jera-select', "default").catch(() => {});
    await page.waitForTimeout(300);

    /* eslint-disable */
    const result = await page.evaluate(function() {
  function toRgba(css) {
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const ctx = c.getContext("2d"); ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3]];
  }
  function lum(r, g, b) {
    return [r, g, b].map(function(c) { var s = c/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); })
      .reduce(function(sum, c, i) { return sum + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function cr(a, b) { var hi = a > b ? a : b, lo = a > b ? b : a; return (hi + 0.05) / (lo + 0.05); }
  var preview = document.querySelector(".preview-area");
  if (!preview) return null;
  var el = preview.querySelector("[class*=\"jera-optioncard\"]")
    || preview.querySelector("[class*=\"jera-\"]")
    || preview.firstElementChild;
  if (!el) return null;
  var s = getComputedStyle(el);
  var fgRgba = toRgba(s.color), bgRgba = toRgba(s.backgroundColor);
  var bgAlpha = bgRgba[3] / 255;
  var fg = [fgRgba[0], fgRgba[1], fgRgba[2]];
  var bg;
  if (bgAlpha < 0.99) {
    var p = toRgba(getComputedStyle(document.body).backgroundColor);
    bg = [Math.round(bgRgba[0]*bgAlpha + p[0]*(1-bgAlpha)), Math.round(bgRgba[1]*bgAlpha + p[1]*(1-bgAlpha)), Math.round(bgRgba[2]*bgAlpha + p[2]*(1-bgAlpha))];
  } else {
    bg = [bgRgba[0], bgRgba[1], bgRgba[2]];
  }
  var ratio = Math.round(cr(lum(fg[0],fg[1],fg[2]), lum(bg[0],bg[1],bg[2])) * 100) / 100;
  var fs = parseFloat(s.fontSize) || 0, fw = parseInt(s.fontWeight) || 400;
  var required = (fs >= 18 || (fs >= 14 && fw >= 700)) ? 3.0 : 4.5;
  return { ratio: ratio, required: required, fg: "rgb("+fg+")", bg: "rgb("+bg+")" };
    });
    /* eslint-enable */

    expect(result, 'Could not locate jera element for contrast measurement').not.toBeNull();
    expect(result!.ratio,
      `Contrast ${result!.ratio}:1 must meet WCAG AA (${result!.required}:1) — optioncard / default / light`)
      .toBeGreaterThanOrEqual(result!.required);
  });
});
