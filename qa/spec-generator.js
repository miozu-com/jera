/*
  spec-generator.js
  ─────────────────────────────────────────────────────────────────────────────
  Reads a component-test-runner JSON findings file and generates Playwright
  .spec.ts test files for every failing check.

  Handles both output formats:
    Format A (current)  — has run_id, pipeline, target, layers, status
    Format B (legacy)   — has component, layer1/2/3/4 at top level
    Suite report        — has date + components[]. Auto-discovers per-component JSONs.

  Usage:
    node spec-generator.js <path-to-json>           # single component or suite
    node spec-generator.js <path-to-json> --dry-run # preview without writing

  Output:
    qa/specs/[component-name].spec.ts
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Constants ──────────────────────────────────────────────────────────────

const SPECS_DIR = path.join(__dirname, 'specs');

const VIEWPORTS = {
  mobile:  { width: 375,  height: 812  },
  tablet:  { width: 768,  height: 1024 },
  desktop: { width: 1440, height: 900  },
};

const L3_VALUES = {
  empty_string:  '',
  long_text:     'A'.repeat(120),
  special_chars: "<script>alert('xss')</script>",
  numeric_zero:  '0',
  whitespace:    '   ',
};

const L3_DESCS = {
  empty_string:  'empty string ""',
  long_text:     '120-character string (overflow test)',
  special_chars: 'XSS injection string',
  numeric_zero:  '"0" (numeric zero)',
  whitespace:    'whitespace-only "   "',
};

// ── Helpers ────────────────────────────────────────────────────────────────

const I = (n) => '  '.repeat(n);

/**
 * Normalise a raw JSON result into a consistent report shape regardless of format (A/B/legacy).
 * @param {object} raw - Raw parsed JSON from a component test result file
 * @returns {object}   - Normalised report with run_id, component, url, layers, summary
 */
function normalizeReport(raw) {
  return {
    run_id:    raw.run_id  || null,
    component: ((raw.target ?? raw.component) || '').toLowerCase(),
    url:       raw.url     || null,
    status:    raw.status  || raw.summary?.overall || 'unknown',
    fallback:  raw.fallback_mode || false,
    layer1:    raw.layers?.layer1 || raw.layer1 || { violations: [], summary: { total: 0 } },
    layer2:    raw.layers?.layer2 || raw.layer2 || { violations: [], summary: { total: 0 } },
    layer3:    raw.layers?.layer3 || raw.layer3 || { violations: [], summary: { total: 0 } },
    layer4:    raw.layers?.layer4 || raw.layer4 || { violations: [], summary: { total: 0 } },
    summary:   raw.summary || {},
  };
}

function isSuiteReport(raw) {
  return Array.isArray(raw.components) && typeof raw.date === 'string';
}

function getUrlPath(report) {
  if (report.url) {
    try { return new URL(report.url).pathname; } catch (_) {}
  }
  return `/docs/components/${report.component}/`;
}

// ── Variant / mode setup block (inlined into each test) ───────────────────

function variantBlock(variant, mode) {
  const lines = [
    `${I(2)}await page.selectOption('.controls-panel select.jera-select', ${JSON.stringify(variant)}).catch(() => {});`,
    `${I(2)}await page.waitForTimeout(300);`,
  ];
  if (mode === 'dark') {
    lines.push(
      `${I(2)}// Enable dark mode`,
      `${I(2)}await page.evaluate(() => {`,
      `${I(3)}const rows = Array.from(document.querySelectorAll('.controls-panel .control-row'));`,
      `${I(3)}const darkRow = rows.find((r: Element) => r.textContent?.toLowerCase().includes('dark'));`,
      `${I(3)}(darkRow?.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.click();`,
      `${I(2)}});`,
      `${I(2)}await page.waitForTimeout(400);`,
    );
  }
  return lines.join('\n');
}

// ── L1 — Accessibility ─────────────────────────────────────────────────────

function genL1ContrastTest(component, v) {
  const title      = `${component} / ${v.variant} / ${v.mode} — L1 contrast ratio must meet WCAG AA (${v.wcag})`;
  const compSel    = '[class*="jera-' + component + '"]';
  const ctxLabel   = `${component} / ${v.variant} / ${v.mode}`;
  const evalBody   = [
    '  function toRgba(css) {',
    '    const c = document.createElement("canvas"); c.width = c.height = 1;',
    '    const ctx = c.getContext("2d"); ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);',
    '    const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3]];',
    '  }',
    '  function lum(r, g, b) {',
    '    return [r, g, b].map(function(c) { var s = c/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); })',
    '      .reduce(function(sum, c, i) { return sum + c * [0.2126, 0.7152, 0.0722][i]; }, 0);',
    '  }',
    '  function cr(a, b) { var hi = a > b ? a : b, lo = a > b ? b : a; return (hi + 0.05) / (lo + 0.05); }',
    '  var preview = document.querySelector(".preview-area");',
    '  if (!preview) return null;',
    '  var el = preview.querySelector(' + JSON.stringify(compSel) + ')',
    '    || preview.querySelector("[class*=\\"jera-\\"]")',
    '    || preview.firstElementChild;',
    '  if (!el) return null;',
    '  var s = getComputedStyle(el);',
    '  var fgRgba = toRgba(s.color), bgRgba = toRgba(s.backgroundColor);',
    '  var bgAlpha = bgRgba[3] / 255;',
    '  var fg = [fgRgba[0], fgRgba[1], fgRgba[2]];',
    '  var bg;',
    '  if (bgAlpha < 0.99) {',
    '    var p = toRgba(getComputedStyle(document.body).backgroundColor);',
    '    bg = [Math.round(bgRgba[0]*bgAlpha + p[0]*(1-bgAlpha)), Math.round(bgRgba[1]*bgAlpha + p[1]*(1-bgAlpha)), Math.round(bgRgba[2]*bgAlpha + p[2]*(1-bgAlpha))];',
    '  } else {',
    '    bg = [bgRgba[0], bgRgba[1], bgRgba[2]];',
    '  }',
    '  var ratio = Math.round(cr(lum(fg[0],fg[1],fg[2]), lum(bg[0],bg[1],bg[2])) * 100) / 100;',
    '  var fs = parseFloat(s.fontSize) || 0, fw = parseInt(s.fontWeight) || 400;',
    '  var required = (fs >= 18 || (fs >= 14 && fw >= 700)) ? 3.0 : 4.5;',
    '  return { ratio: ratio, required: required, fg: "rgb("+fg+")", bg: "rgb("+bg+")" };',
  ].join('\n');

  return `
${I(1)}test(${JSON.stringify(title)}, async ({ page }) => {
${I(2)}// Canvas-sampled contrast — axe marks oklch tokens as 'incomplete', we detect via pixel sampling
${I(2)}// Measured: ${v.contrast_ratio}:1  Required: ${v.required_ratio}:1  FG: ${v.fg}  BG: ${v.bg}  Font: ${v.font_size}
${I(2)}// Fix: ${v.fix}
${I(2)}await page.goto(COMPONENT_URL);
${I(2)}await page.waitForSelector('.preview-area', { timeout: 15000 });
${I(2)}await page.waitForTimeout(500);
${variantBlock(v.variant, v.mode)}

${I(2)}/* eslint-disable */
${I(2)}const result = await page.evaluate(function() {
${evalBody}
${I(2)}});
${I(2)}/* eslint-enable */

${I(2)}expect(result, 'Could not locate jera element for contrast measurement').not.toBeNull();
${I(2)}expect(result!.ratio,
${I(3)}\`Contrast \${result!.ratio}:1 must meet WCAG AA (\${result!.required}:1) — ${ctxLabel}\`)
${I(3)}.toBeGreaterThanOrEqual(result!.required);
${I(1)}});`;
}

function genL1AxeTest(component, v) {
  const title = `${component} / ${v.variant} / ${v.mode} — L1 axe: ${v.axe_id} (WCAG ${v.wcag})`;
  return `
${I(1)}test(${JSON.stringify(title)}, async ({ page }) => {
${I(2)}// axe violation: ${v.axe_id} — impact: ${v.impact} — WCAG ${v.wcag}
${I(2)}// Fix: ${v.fix || `See axe documentation for rule "${v.axe_id}"`}
${I(2)}await page.goto(COMPONENT_URL);
${I(2)}await page.waitForSelector('.preview-area', { timeout: 15000 });
${I(2)}await page.waitForTimeout(500);
${variantBlock(v.variant, v.mode)}

${I(2)}const results = await new AxeBuilder({ page })
${I(3)}.include('.preview-area')
${I(3)}.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
${I(3)}.analyze();
${I(2)}const violations = results.violations.filter(v => v.id === ${JSON.stringify(v.axe_id)});
${I(2)}expect(violations,
${I(3)}\`axe rule "${v.axe_id}" must not fire on ${component}/${v.variant}/${v.mode}\`)
${I(3)}.toHaveLength(0);
${I(1)}});`;
}

// ── L2 — Interaction ───────────────────────────────────────────────────────

const L2_BODIES = {
  'keyboard-tab-focus': (v) => `
${I(2)}// Tab through the page up to 15 times; expect focus to enter .preview-area
${I(2)}await page.evaluate(() => document.body.focus());
${I(2)}let focused = false;
${I(2)}for (let i = 0; i < 15; i++) {
${I(3)}await page.keyboard.press('Tab');
${I(3)}await page.waitForTimeout(100);
${I(3)}focused = await page.evaluate(() => {
${I(4)}const preview = document.querySelector('.preview-area');
${I(4)}return !!preview?.contains(document.activeElement);
${I(3)}});
${I(3)}if (focused) break;
${I(2)}}
${I(2)}expect(focused, 'Tab key must move focus into .preview-area').toBe(true);`,

  'focus-not-visible': (v) => `
${I(2)}// After Tab, focused element must show a visible focus ring
${I(2)}await page.evaluate(() => document.body.focus());
${I(2)}await page.keyboard.press('Tab');
${I(2)}await page.waitForTimeout(200);
${I(2)}const visible = await page.evaluate(() => {
${I(3)}const el = document.activeElement as HTMLElement;
${I(3)}if (!el || el === document.body) return false;
${I(3)}const s = getComputedStyle(el);
${I(3)}const hasOutline = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none';
${I(3)}const hasShadow  = s.boxShadow !== 'none' && !s.boxShadow.includes('rgba(0, 0, 0, 0)');
${I(3)}return hasOutline || hasShadow;
${I(2)}});
${I(2)}expect(visible, 'Focused element must have a visible focus ring (outline or box-shadow)').toBe(true);`,

  'enter-key-no-activate': (v) => `
${I(2)}// Focus trigger element, press Enter, expect click event fires
${I(2)}await page.evaluate(() => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}const el = preview?.querySelector('button, a, [role="button"], [tabindex]:not([tabindex="-1"])') as HTMLElement;
${I(3)}if (el) {
${I(4)}(window as any).__specActivated = false;
${I(4)}el.addEventListener('click', () => { (window as any).__specActivated = true; }, { once: true });
${I(4)}el.focus();
${I(3)}}
${I(2)}});
${I(2)}await page.keyboard.press('Enter');
${I(2)}await page.waitForTimeout(200);
${I(2)}const activated = await page.evaluate(() => (window as any).__specActivated === true);
${I(2)}expect(activated, 'Enter key must trigger activation (click event) on the interactive element').toBe(true);`,

  'escape-closes': (v) => `
${I(2)}// Click trigger to open overlay, press Escape, expect overlay closes
${I(2)}await page.locator('.preview-area [aria-haspopup], .preview-area [role="button"]').first().click().catch(() => {});
${I(2)}await page.waitForTimeout(300);
${I(2)}await page.keyboard.press('Escape');
${I(2)}await page.waitForTimeout(300);
${I(2)}const stillOpen = await page.evaluate(() => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}return !!preview?.querySelector('[role="dialog"]:not([hidden]),[role="listbox"]:not([hidden]),[aria-expanded="true"]');
${I(2)}});
${I(2)}expect(stillOpen, 'Escape key must close any open overlay or dropdown').toBe(false);`,

  'click-throws-error': (v) => `
${I(2)}// Click primary element; expect no JS page error fires
${I(2)}const errors: string[] = [];
${I(2)}page.on('pageerror', (err) => errors.push(err.message));
${I(2)}await page.locator('.preview-area').first().click({ timeout: 3000, force: false }).catch(() => {});
${I(2)}await page.waitForTimeout(300);
${I(2)}expect(errors, 'Clicking the component must not throw a JS page error').toHaveLength(0);`,

  'tab-order-invalid': (_v) => `
${I(2)}// Tab through the component; interactive elements (button.tab, [role="tab"]) must NOT have tabindex="-1"
${I(2)}const invalidEl = await page.evaluate(() => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}if (!preview) return null;
${I(3)}const candidates = Array.from(preview.querySelectorAll('button.tab, [role="tab"], button')) as HTMLElement[];
${I(3)}const bad = candidates.find(el => el.tabIndex === -1);
${I(3)}return bad ? (bad.tagName.toLowerCase() + (bad.className ? '.' + bad.className.trim().split(' ')[0] : '')) : null;
${I(2)}});
${I(2)}expect(invalidEl, \`Interactive tab element must not have tabindex="-1" — WCAG 2.4.3 Focus Order\`).toBeNull();`,

  'disabled-not-respected': (v) => `
${I(2)}// Force-click a disabled element; expect click event does NOT fire
${I(2)}await page.evaluate(() => {
${I(3)}const el = document.querySelector('.preview-area [disabled], .preview-area [aria-disabled="true"]') as HTMLElement;
${I(3)}if (el) {
${I(4)}(window as any).__specDisabledClicked = false;
${I(4)}el.addEventListener('click', () => { (window as any).__specDisabledClicked = true; }, { once: true });
${I(3)}}
${I(2)}});
${I(2)}await page.locator('.preview-area [disabled], .preview-area [aria-disabled="true"]')
${I(3)}.first().click({ force: true, timeout: 2000 }).catch(() => {});
${I(2)}await page.waitForTimeout(200);
${I(2)}const clicked = await page.evaluate(() => (window as any).__specDisabledClicked === true);
${I(2)}expect(clicked, 'Disabled element must not fire a click event even when force-clicked').toBe(false);`,
};

function genL2Test(component, v) {
  const bodyFn = L2_BODIES[v.axe_id];
  if (!bodyFn) return null;
  const title = `${component} / ${v.variant} / L2 keyboard: ${v.axe_id} (WCAG ${v.wcag})`;
  return `
${I(1)}test(${JSON.stringify(title)}, async ({ page }) => {
${I(2)}// L2 Interaction — ${v.axe_id} — WCAG ${v.wcag}
${I(2)}// Fix: ${v.fix}
${I(2)}await page.goto(COMPONENT_URL);
${I(2)}await page.waitForSelector('.preview-area', { timeout: 15000 });
${I(2)}await page.waitForTimeout(500);
${variantBlock(v.variant, v.mode || 'light')}
${bodyFn(v)}
${I(1)}});`;
}

// ── L3 — Props edge cases ─────────────────────────────────────────────────

function genL3Test(component, v) {
  if (L3_VALUES[v.check] === undefined) return null;

  const val    = L3_VALUES[v.check];
  const desc   = L3_DESCS[v.check] || v.check;
  const isXSS  = v.check === 'special_chars';
  const isOvfl = v.check === 'long_text';
  const title  = `${component} / L3 props: ${v.check} — handles ${desc} without ${isXSS ? 'XSS' : isOvfl ? 'overflow' : 'crash'}`;

  const assertion = isXSS ? `
${I(2)}// XSS check: no <script> tags must appear inside .preview-area
${I(2)}const injected = await page.evaluate(() => !!document.querySelector('.preview-area script'));
${I(2)}expect(injected, 'Special chars must not inject executable <script> tags').toBe(false);`

    : isOvfl ? `
${I(2)}// Overflow check: component must not exceed .preview-area bounds
${I(2)}const overflows = await page.evaluate(() => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}const el = (preview?.querySelector('[class*="jera-"]') ?? preview?.firstElementChild) as HTMLElement | null;
${I(3)}if (!el) return false;
${I(3)}const elBox = el.getBoundingClientRect(), pvBox = preview!.getBoundingClientRect();
${I(3)}return elBox.right > pvBox.right + 4 || el.scrollWidth > el.clientWidth + 4;
${I(2)}});
${I(2)}expect(overflows, 'Component must not overflow its container with a 120-char label').toBe(false);`

    : `
${I(2)}// Render check: component must still be present, no error overlay
${I(2)}const rendered = await page.evaluate(() => {
${I(3)}const errorOverlay = document.querySelector('.vite-error-overlay, [class*="error-overlay"]');
${I(3)}return !errorOverlay && (document.querySelector('.preview-area')?.children.length ?? 0) > 0;
${I(2)}});
${I(2)}expect(rendered, \`Component must remain rendered after receiving: ${desc}\`).toBe(true);`;

  return `
${I(1)}test(${JSON.stringify(title)}, async ({ page }) => {
${I(2)}// L3 Props — check: ${v.check} — severity: ${v.severity}
${I(2)}// Fix: ${v.fix}
${I(2)}await page.goto(COMPONENT_URL);
${I(2)}await page.waitForSelector('.controls-panel', { timeout: 15000 });
${I(2)}await page.waitForTimeout(500);

${I(2)}// Inject value via Svelte-compatible setter: ${desc}
${I(2)}await page.evaluate((val: string) => {
${I(3)}const panel = document.querySelector('.controls-panel');
${I(3)}const input = panel?.querySelector('input[type="text"], input:not([type="checkbox"]):not([type="radio"])') as HTMLInputElement | null;
${I(3)}if (!input) return;
${I(3)}const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
${I(3)}setter.call(input, val);
${I(3)}input.dispatchEvent(new Event('input', { bubbles: true }));
${I(3)}input.dispatchEvent(new Event('change', { bubbles: true }));
${I(2)}}, ${JSON.stringify(val)});
${I(2)}await page.waitForTimeout(400);
${assertion}
${I(1)}});`;
}

// ── L4 — Responsive ───────────────────────────────────────────────────────

function genL4Test(component, v) {
  const vp = VIEWPORTS[v.viewport];
  if (!vp) return null;
  const { width, height } = vp;

  const checks = {
    render: `
${I(2)}const renderResult = await page.evaluate(() => {
${I(3)}const el = (document.querySelector('.preview-area [class*="jera-"]')
${I(4)}?? document.querySelector('.preview-area')?.firstElementChild) as HTMLElement | null;
${I(3)}if (!el) return 'no-element';
${I(3)}const b = el.getBoundingClientRect();
${I(3)}return (b.width === 0 || b.height === 0) ? 'zero-dimensions' : 'pass';
${I(2)}});
${I(2)}expect(renderResult, \`Component must render at ${v.viewport} (${width}×${height})\`).toBe('pass');`,

    overflow: `
${I(2)}const overflows = await page.evaluate((vw: number) => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}if (!preview) return false;
${I(3)}return preview.getBoundingClientRect().right > vw + 4 || document.body.scrollWidth > vw + 4;
${I(2)}}, ${width});
${I(2)}expect(overflows, \`No horizontal overflow at ${v.viewport} (viewport: ${width}px wide)\`).toBe(false);`,

    text_readable: `
${I(2)}const smallText = await page.evaluate(() => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}if (!preview) return null;
${I(3)}for (const el of Array.from(preview.querySelectorAll('*')) as HTMLElement[]) {
${I(4)}if (el.childElementCount === 0 && el.textContent!.trim().length > 0) {
${I(5)}const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
${I(5)}if (fs < 12) return \`font-size \${fs}px on "\${el.textContent!.trim().slice(0, 30)}"\`;
${I(4)}}
${I(3)}}
${I(3)}return null;
${I(2)}});
${I(2)}expect(smallText, \`All text must be >= 12px at ${v.viewport}\`).toBeNull();`,

    layout: `
${I(2)}const issue = await page.evaluate(() => {
${I(3)}const preview = document.querySelector('.preview-area');
${I(3)}if (!preview) return null;
${I(3)}const b = preview.getBoundingClientRect();
${I(3)}if (b.top < -10) return \`negative top: \${Math.round(b.top)}px\`;
${I(3)}if (b.height < 4)  return \`height too small: \${Math.round(b.height)}px\`;
${I(3)}return null;
${I(2)}});
${I(2)}expect(issue, \`Layout must be intact at ${v.viewport} (${width}×${height})\`).toBeNull();`,
  };

  const body = checks[v.check] || checks.render;
  const title = `${component} / L4 ${v.viewport} (${width}×${height}) — ${v.check}`;

  return `
${I(1)}test(${JSON.stringify(title)}, async ({ page }) => {
${I(2)}// L4 Responsive — ${v.viewport} ${width}×${height} — check: ${v.check}
${I(2)}// Fix: ${v.fix}
${I(2)}await page.setViewportSize({ width: ${width}, height: ${height} });
${I(2)}await page.goto(COMPONENT_URL);
${I(2)}await page.waitForSelector('.preview-area', { timeout: 15000 });
${I(2)}await page.waitForTimeout(500);
${body}
${I(1)}});`;
}

// ── Spec file builder ──────────────────────────────────────────────────────

/**
 * Generate a .spec.ts Playwright file from a normalised component report.
 * @param {object} report         - Normalised report (output of normalizeReport)
 * @param {string} sourceJsonPath - Absolute path to the source JSON (used for the file header comment)
 * @returns {string|null}         - Generated spec content, or null if no tests could be generated
 */
function buildSpecFile(report, sourceJsonPath) {
  const { component, run_id } = report;
  const urlPath      = getUrlPath(report);
  const generatedAt  = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const tests = [];

  for (const v of report.layer1?.violations || []) {
    tests.push(v.axe_id === 'color-contrast-manual'
      ? genL1ContrastTest(component, v)
      : genL1AxeTest(component, v));
  }
  for (const v of report.layer2?.violations || []) {
    const t = genL2Test(component, v); if (t) tests.push(t);
  }
  for (const v of report.layer3?.violations || []) {
    const t = genL3Test(component, v); if (t) tests.push(t);
  }
  for (const v of report.layer4?.violations || []) {
    const t = genL4Test(component, v); if (t) tests.push(t);
  }

  if (tests.length === 0) return null;

  return `// Auto-generated — always overwritten on next suite run. Do not edit manually.
// Auto-generated from run_id: ${run_id || '(legacy — no run_id)'}
// Generated at: ${generatedAt}
// Source JSON:  ${sourceJsonPath}
// Re-run spec-generator to regenerate:
//     node System/Agents/Tools/spec-generator.js ${sourceJsonPath}

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// STORYBOOK_URL: set to http://localhost:6006 in CI (no auth required)
//                or https://admin.selify.ai (prod — auth required)
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const COMPONENT_URL = \`\${STORYBOOK_URL}${urlPath}\`;

test.describe(${JSON.stringify(component)}, () => {
${tests.join('\n')}
});
`;
}

// ── Main — loadReports ─────────────────────────────────────────────────────

function loadComponentReports(absPath) {
  const raw        = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  const reportsDir = path.dirname(absPath);
  const reports    = [];

  if (isSuiteReport(raw)) {
    console.log('[spec-generator] Suite report detected — loading per-component JSONs...');
    const seen   = new Set();
    const failed = raw.components.filter(c => c.status === 'FAIL' && !c.error);
    for (const c of failed) {
      if (seen.has(c.component)) continue;
      seen.add(c.component);
      const candidates = [
        path.join(reportsDir, `${c.component}-full-test-results.json`),
        path.join(reportsDir, `${c.component}-test-results.json`),
      ];
      const found = candidates.find(f => fs.existsSync(f));
      if (found) {
        try {
          reports.push(normalizeReport(JSON.parse(fs.readFileSync(found, 'utf8'))));
          console.log(`  [loaded] ${path.basename(found)}`);
        } catch (err) {
          console.warn(`  [warn] Could not parse ${path.basename(found)}: ${err.message}`);
        }
      } else {
        console.warn(`  [warn] No per-component JSON for ${c.component} — skipping`);
      }
    }
  } else {
    reports.push(normalizeReport(raw));
  }

  return reports;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate .spec.ts files from a JSON findings report.
 *
 * @param {string}  reportPath   - Path to JSON (single component or suite)
 * @param {object}  [opts]
 * @param {boolean} [opts.dryRun=false]  - Preview without writing files
 * @param {boolean} [opts.quiet=false]   - Suppress console output
 * @returns {{ totalFiles: number, totalTests: number, generated: Array }}
 */
function generateSpecs(reportPath, { dryRun = false, quiet = false } = {}) {
  const absPath = path.resolve(reportPath);
  if (!fs.existsSync(absPath)) throw new Error(`Report not found: ${absPath}`);

  const log = quiet ? () => {} : console.log;
  log(`\n[spec-generator] Reading: ${absPath}`);

  const allReports = loadComponentReports(absPath);
  const failing    = allReports.filter(r => {
    const s = (r.status || '').toLowerCase();
    return s === 'fail';
  });

  if (failing.length === 0) {
    log('[spec-generator] All components passed — no spec files generated.');
    return { totalFiles: 0, totalTests: 0, generated: [] };
  }

  if (!dryRun) fs.mkdirSync(SPECS_DIR, { recursive: true });

  let totalFiles = 0, totalTests = 0;
  const generated = [];

  for (const report of failing) {
    const content = buildSpecFile(report, reportPath);
    if (!content) {
      log(`  [skip] ${report.component} — no violation details found (suite-summary only?)`);
      continue;
    }
    const testCount = (content.match(/^  test\(/gm) || []).length;
    const specPath  = path.join(SPECS_DIR, `${report.component}.spec.ts`);

    if (!dryRun) fs.writeFileSync(specPath, content, 'utf8');

    log(`  [${dryRun ? 'dry-run' : 'written'}] ${report.component}.spec.ts — ${testCount} test(s)`);
    totalFiles++;
    totalTests += testCount;
    generated.push({ component: report.component, path: specPath, tests: testCount });
  }

  log(`\n[spec-generator] ${dryRun ? 'Dry run complete.' : 'Done.'}`);
  log(`  Spec files : ${totalFiles}`);
  log(`  Tests total: ${totalTests}`);
  if (!dryRun && totalFiles > 0) log(`  Output dir : ${SPECS_DIR}`);

  return { totalFiles, totalTests, generated };
}

module.exports = { generateSpecs, buildSpecFile, normalizeReport };

// ── CLI entry point ────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) {
    console.error('Usage:');
    console.error('  node spec-generator.js <path-to-json> [--dry-run]');
    console.error('');
    console.error('Examples:');
    console.error('  node spec-generator.js System/Projects/Selify.ai/Reports/badge-full-test-results.json');
    console.error('  node spec-generator.js System/Projects/Selify.ai/Reports/suite-test-results.json');
    console.error('  node spec-generator.js System/Projects/Selify.ai/Reports/suite-test-results.json --dry-run');
    process.exit(1);
  }
  const reportPath = args.find(a => !a.startsWith('--'));
  const dryRun     = args.includes('--dry-run');
  try {
    generateSpecs(reportPath, { dryRun });
  } catch (err) {
    console.error('FATAL:', err.message);
    process.exit(1);
  }
}
