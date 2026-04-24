/*
  layer3-props.js
  ─────────────────────────────────────────────────────────────────────────────
  Layer 3 — Props Edge Cases
  Tests component resilience to edge-case prop values.

  Checks (run once per component, not per variant):
    1. empty_string   — label="" or equivalent empty prop
    2. long_text      — 100+ character string → overflow detected?
    3. special_chars  — !@#$%^&*<>'"/ → rendered or escaped correctly?
    4. all_variants   — all variant options from select render without error
    5. numeric_zero   — prop value "0" (boundary test)
    6. whitespace     — label="   " (spaces only)

  Detection strategy for overflow:
    - scrollWidth > clientWidth OR scrollHeight > clientHeight on the element
    - OR element's bounding box exceeds .preview-area bounding box

  Returns:
    {
      empty_string:      "pass"|"fail"|"n/a"|"error: ...",
      long_text:         "pass"|"fail: overflow detected"|"n/a",
      special_chars:     "pass"|"fail: unescaped HTML"|"n/a",
      all_variants:      "pass"|"fail: [variant] threw error"|"n/a",
      numeric_zero:      "pass"|"fail"|"n/a",
      whitespace:        "pass"|"fail"|"n/a",
      violations: [...],
      notes: []
    }

  Skills: props-edge-cases.md
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

const path = require('path');
const fs   = require('fs');
const { capturePreview } = require('./utils');

const LONG_TEXT     = 'A'.repeat(120);
const SPECIAL_CHARS = '!@#$%^&*()<>\'"/ injection test';
const WHITESPACE    = '   ';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Find the label/text input control in the controls panel.
 * Returns null if no text input found.
 *
 * @param {import('playwright').Page} page
 * @param {string} controlsSel - selector for the controls panel
 */
async function findLabelControl(page, controlsSel = '.controls-panel') {
  return page.evaluate((sel) => {
    const panel = document.querySelector(sel);
    if (!panel) return null;
    // Look for text inputs in control rows (not selects, not checkboxes)
    const inputs = Array.from(panel.querySelectorAll('input[type="text"], input:not([type])'));
    return inputs.length > 0 ? 'input[type="text"]' : null;
  }, controlsSel);
}

/**
 * Set a value in the first text input in the controls panel.
 * Selify mode:    .controls-panel — Svelte-compatible native setter
 * Standard Storybook mode: .docblock-argstable — same setter approach
 *
 * @param {import('playwright').Page} page
 * @param {string} value
 * @param {string} controlsSel - selector for the controls panel
 */
async function setLabelValue(page, value, controlsSel = '.controls-panel') {
  await page.evaluate(([val, sel]) => {
    const panel = document.querySelector(sel);
    const input = panel?.querySelector('input[type="text"], input:not([type="checkbox"]):not([type="radio"])');
    if (!input) return false;
    // React/Svelte-compatible value setting
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, val);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, [value, controlsSel]);
  await page.waitForTimeout(400);
}

/**
 * Check if the component element overflows its container.
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function checkOverflow(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return false;
    const el = preview.querySelector('[class*=jera-]') ?? preview.firstElementChild;
    if (!el) return false;

    const elBox      = el.getBoundingClientRect();
    const previewBox = preview.getBoundingClientRect();

    const overflowsContainer =
      elBox.right > previewBox.right + 4 ||
      elBox.bottom > previewBox.bottom + 4;

    const scrollOverflow =
      el.scrollWidth > el.clientWidth + 4 ||
      el.scrollHeight > el.clientHeight + 4;

    return overflowsContainer || scrollOverflow;
  }, previewSel);
}

/**
 * Check if innerHTML of the preview area contains raw unescaped HTML injected
 * from the special chars test.
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function checkHtmlInjection(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return false;
    return preview.querySelector('script') !== null;
  }, previewSel);
}

/**
 * Check if the component renders without a visible error (red error box,
 * uncaught exception overlay, or component disappears).
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function componentRendered(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return false;
    const errorOverlay = document.querySelector('.vite-error-overlay, [class*="error-overlay"], [class*="ErrorBoundary"]');
    if (errorOverlay) return false;
    return preview.children.length > 0;
  }, previewSel);
}

// ── Individual checks ────────────────────────────────────────────────────────

async function checkEmptyString(page, previewSel, controlsSel) {
  try {
    const hasControl = await findLabelControl(page, controlsSel);
    if (!hasControl) return 'n/a';

    await setLabelValue(page, '', controlsSel);
    const rendered = await componentRendered(page, previewSel);
    await page.waitForTimeout(200);
    return rendered ? 'pass' : 'fail: component disappeared on empty string';
  } catch (e) {
    return `error: ${e.message.slice(0, 100)}`;
  }
}

async function checkLongText(page, previewSel, controlsSel) {
  try {
    const hasControl = await findLabelControl(page, controlsSel);
    if (!hasControl) return 'n/a';

    await setLabelValue(page, LONG_TEXT, controlsSel);
    await page.waitForTimeout(300);
    const overflows = await checkOverflow(page, previewSel);
    return overflows ? `fail: overflow detected (${LONG_TEXT.length} chars)` : 'pass';
  } catch (e) {
    return `error: ${e.message.slice(0, 100)}`;
  }
}

async function checkSpecialChars(page, previewSel, controlsSel) {
  try {
    const hasControl = await findLabelControl(page, controlsSel);
    if (!hasControl) return 'n/a';

    await setLabelValue(page, SPECIAL_CHARS, controlsSel);
    await page.waitForTimeout(300);

    const injected = await checkHtmlInjection(page, previewSel);
    if (injected) return 'fail: unescaped HTML injection possible';

    const rendered = await componentRendered(page, previewSel);
    return rendered ? 'pass' : 'fail: component did not render special chars';
  } catch (e) {
    return `error: ${e.message.slice(0, 100)}`;
  }
}

async function checkAllVariants(page, variants, applyVariant, previewSel) {
  const errors = [];
  for (const variant of variants) {
    try {
      await applyVariant(page, variant);
      const rendered = await componentRendered(page, previewSel);
      if (!rendered) errors.push(`${variant}: did not render`);
    } catch (e) {
      errors.push(`${variant}: ${e.message.slice(0, 60)}`);
    }
  }
  return errors.length > 0 ? `fail: ${errors.join('; ')}` : 'pass';
}

async function checkNumericZero(page, previewSel, controlsSel) {
  try {
    const hasControl = await findLabelControl(page, controlsSel);
    if (!hasControl) return 'n/a';

    await setLabelValue(page, '0', controlsSel);
    await page.waitForTimeout(200);
    const rendered = await componentRendered(page, previewSel);
    return rendered ? 'pass' : 'fail: component disappeared on value "0"';
  } catch (e) {
    return `error: ${e.message.slice(0, 100)}`;
  }
}

async function checkWhitespace(page, previewSel, controlsSel) {
  try {
    const hasControl = await findLabelControl(page, controlsSel);
    if (!hasControl) return 'n/a';

    await setLabelValue(page, WHITESPACE, controlsSel);
    await page.waitForTimeout(200);
    const rendered = await componentRendered(page, previewSel);
    return rendered ? 'pass' : 'fail: component crashed on whitespace-only value';
  } catch (e) {
    return `error: ${e.message.slice(0, 100)}`;
  }
}

// ── Layer 3 main export ─────────────────────────────────────────────────────

/**
 * Run props edge case layer for the component (run once, not per variant).
 * Page must be on the component URL. Variant is reset to default after checks.
 *
 * @param {object}   opts
 * @param {import('playwright').Page} opts.page
 * @param {string}   opts.component
 * @param {string[]} opts.variants        - all variants (for all_variants check)
 * @param {Function} opts.applyVariant    - async (page, variant) => void
 * @param {Function} opts.ensureMode      - async (page, mode) => void
 * @param {string}   [opts.screenshotsDir] - screenshot output directory
 * @returns {Promise<object>}
 */
async function runLayer3All(opts) {
  const { page, component, variants, applyVariant, ensureMode, screenshotsDir, selectors = {} } = opts;
  // Selify mode:    .preview-area / .controls-panel
  // Standard Storybook mode: .docs-story / .docblock-argstable
  const previewSel  = selectors.previewArea || '.preview-area';
  const controlsSel = selectors.controls    || '.controls-panel';

  // Run in light mode, reset to first variant
  await ensureMode(page, 'light');
  if (variants[0]) await applyVariant(page, variants[0]);

  const result = {
    layer: 3,
    component,
    violations: [],
    notes: [],
  };

  if (screenshotsDir) fs.mkdirSync(screenshotsDir, { recursive: true });

  // Run each check sequentially — screenshot immediately on failure while page
  // state still reflects the failing condition
  const checkDefs = [
    { name: 'empty_string', fn: () => checkEmptyString(page, previewSel, controlsSel) },
    { name: 'long_text',    fn: () => checkLongText(page, previewSel, controlsSel) },
    { name: 'special_chars',fn: () => checkSpecialChars(page, previewSel, controlsSel) },
    { name: 'all_variants', fn: () => checkAllVariants(page, variants, applyVariant, previewSel) },
    { name: 'numeric_zero', fn: () => checkNumericZero(page, previewSel, controlsSel) },
    { name: 'whitespace',   fn: () => checkWhitespace(page, previewSel, controlsSel) },
  ];

  for (const { name, fn } of checkDefs) {
    const val = await fn();
    result[name] = val;

    if (typeof val === 'string' && val.startsWith('fail')) {
      let screenshotName = null;
      if (screenshotsDir) {
        screenshotName = `${component}-l3-${name.replace(/_/g, '-')}.png`;
        await capturePreview(page, path.join(screenshotsDir, screenshotName), 'L3', previewSel);
      }
      result.violations.push({
        layer: 3,
        component,
        check: name,
        severity: name === 'special_chars' ? 'S1' : 'S3',
        wcag:     name === 'special_chars' ? 'N/A (XSS risk)' : 'N/A',
        fix:      `Props edge case failure: ${name} → ${val}`,
        ...(screenshotName && { screenshot: screenshotName }),
      });
    }
  }

  // Reset to default state
  if (variants[0]) await applyVariant(page, variants[0]).catch(() => {});

  const summary = { total: 0, s1: 0, s2: 0, s3: 0, s4: 0 };
  for (const v of result.violations) {
    const sev = (v.severity || 'S3').toLowerCase();
    summary[sev] = (summary[sev] || 0) + 1;
    summary.total++;
  }

  result.summary = summary;
  return result;
}

module.exports = { runLayer3All };
