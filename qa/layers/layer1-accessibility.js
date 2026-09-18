/*
  layer1-accessibility.js
  ─────────────────────────────────────────────────────────────────────────────
  Layer 1 — Accessibility
  Extracted from component-test-runner.js for modular use.

  Runs per variant × mode:
    1. axe-core scan (wcag2a, wcag2aa, wcag21aa)
    2. Canvas pixel sampling contrast check (catches oklch/color(srgb))
    3. Element-scoped screenshot — ONLY when a violation is found

  Returns:
    {
      violations: [...],    // deduplicated after all variants run
      screenshots: [...],   // paths captured (only for failing variants)
      passed: [...],        // "variant-mode" strings
      failed: [...],        // "variant-mode" strings
      summary: { s1, s2, s3, s4, total }
    }

  Skills:
    axe-core.md · contrast-ratio.md · screenshot-capture.md
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

const { AxeBuilder } = require('@axe-core/playwright');
const path = require('path');
const fs   = require('fs');

// ── Severity helpers ────────────────────────────────────────────────────────

function axeImpactToSeverity(impact) {
  return { critical: 'S1', serious: 'S2', moderate: 'S3', minor: 'S4' }[impact] ?? 'S4';
}

function extractWcagCriteria(tags) {
  return tags
    .filter(t => /^wcag\d/.test(t))
    .map(t => {
      const digits = t.replace('wcag', '');
      if (/^\d{3}$/.test(digits)) return digits.replace(/(\d)(\d)(\d)/, '$1.$2.$3');
      return null;
    })
    .filter(Boolean)
    .join(', ');
}

// ── Screenshot capture ──────────────────────────────────────────────────────

async function captureElement(page, selector, outputPath, padding = 24) {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  const box = await element.boundingBox();
  if (!box) throw new Error(`Cannot get bounding box: ${selector}`);
  await page.screenshot({
    path: outputPath,
    clip: {
      x:      Math.max(0, box.x - padding),
      y:      Math.max(0, box.y - padding),
      width:  box.width  + padding * 2,
      height: box.height + padding * 2,
    },
  });
}

// ── axe-core scan ───────────────────────────────────────────────────────────

async function runAxeScan(page, selector = '.preview-area') {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
  // Only include selector if it actually exists on the page
  const exists = await page.$(selector).then(el => !!el).catch(() => false);
  if (exists) builder.include(selector);
  const results = await builder.analyze();
  return results.violations;
}

// ── Canvas pixel sampling contrast check ────────────────────────────────────

async function runContrastCheck(page, variant, mode, screenshotName, selector = '.preview-area', component = '') {
  const violations = await page.evaluate(([sel, comp]) => {
    function colorToRgba(cssColor) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = cssColor;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    }

    function alphaComposite(fg, fgAlpha, bg) {
      return fg.map((c, i) => Math.round(c * fgAlpha + bg[i] * (1 - fgAlpha)));
    }

    function luminance([r, g, b]) {
      return [r, g, b]
        .map(c => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        })
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    }

    function contrastRatio(l1, l2) {
      const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
      return (light + 0.05) / (dark + 0.05);
    }

    const preview = document.querySelector(sel);
    if (!preview) return [];

    const el = (comp ? preview.querySelector(`[class*=jera-${comp}]`) : null)
      ?? preview.querySelector('[class*=jera-]')
      ?? preview.firstElementChild;
    if (!el) return [];

    const styles  = getComputedStyle(el);
    const fgRgba  = colorToRgba(styles.color);
    const bgRgba  = colorToRgba(styles.backgroundColor);
    let fg = fgRgba.slice(0, 3);
    let bg = bgRgba.slice(0, 3);
    const bgAlpha = bgRgba[3];

    if (bgAlpha < 0.99) {
      const pageBgRgba = colorToRgba(getComputedStyle(document.body).backgroundColor);
      bg = alphaComposite(bg, bgAlpha, pageBgRgba.slice(0, 3));
    }

    const ratio = Math.round(contrastRatio(luminance(fg), luminance(bg)) * 100) / 100;
    const fontSize   = parseFloat(styles.fontSize) || 0;
    const fontWeight = parseInt(styles.fontWeight)  || 400;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
    const threshold   = isLargeText ? 3.0 : 4.5;

    if (ratio >= threshold) return [];

    return [{
      ratio,
      threshold,
      fg: `rgb(${fg})`,
      bg: `rgb(${bg})`,
      fontSize: `${fontSize}px`,
      fontWeight,
      element: el.outerHTML.slice(0, 200),
    }];
  }, [selector, component]);

  if (!violations.length) return [];
  const v = violations[0];
  return [{
    variant,
    mode,
    axe_id:         'color-contrast-manual',
    impact:         'serious',
    severity:       'S2',
    wcag:           '1.4.3',
    contrast_ratio: v.ratio,
    required_ratio: v.threshold,
    fg:             v.fg,
    bg:             v.bg,
    font_size:      v.fontSize,
    element:        v.element,
    fix:            `Contrast ratio ${v.ratio}:1 below WCAG AA minimum of ${v.threshold}:1`,
    screenshot:     screenshotName,
  }];
}

// ── Layer 1 main export ─────────────────────────────────────────────────────

/**
 * Run accessibility layer for a single variant + mode.
 * Page must already be on the component URL with the correct variant selected.
 *
 * @param {object}  opts
 * @param {import('playwright').Page} opts.page
 * @param {string}  opts.component      - component name (e.g. "badge")
 * @param {string}  opts.variant        - variant name (e.g. "warning")
 * @param {string}  opts.mode           - "light" | "dark"
 * @param {string}  opts.screenshotsDir - absolute path to screenshots folder
 * @returns {Promise<object>}
 */
async function runLayer1(opts) {
  const { page, component, variant, mode, screenshotsDir, selector = '.preview-area' } = opts;

  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Screenshot name is defined upfront — captured only when violations are found
  const screenshotName = `${component}-${variant}-${mode}-l1-violation.png`;
  const screenshotPath = path.join(screenshotsDir, screenshotName);

  // axe scan
  const axeViolations = await runAxeScan(page, selector).catch(err => {
    console.warn(`    [L1] axe scan failed: ${err.message}`);
    return [];
  });

  // Contrast check
  const contrastViolations = await runContrastCheck(page, variant, mode, screenshotName, selector, component).catch(err => {
    console.warn(`    [L1] Contrast check failed: ${err.message}`);
    return [];
  });

  const violations = [];

  for (const v of axeViolations) {
    const severity = axeImpactToSeverity(v.impact);
    const wcag = extractWcagCriteria(v.tags);
    for (const node of v.nodes) {
      violations.push({
        layer: 1,
        variant, mode,
        axe_id:    v.id,
        impact:    v.impact,
        severity,
        wcag:      wcag || 'N/A',
        element:   node.html?.slice(0, 200),
        fix:       node.failureSummary?.slice(0, 300),
        screenshot: screenshotName,
      });
    }
  }

  for (const v of contrastViolations) {
    violations.push({ layer: 1, ...v });
  }

  // Screenshot only when violations were found
  let screenshotCaptured = false;
  if (violations.length > 0) {
    await captureElement(page, selector, screenshotPath, 16)
      .then(() => { screenshotCaptured = true; })
      .catch(err => console.warn(`    [L1] Screenshot failed: ${err.message}`));

    if (!screenshotCaptured) {
      for (const v of violations) delete v.screenshot;
    }
  }

  const passed = violations.length === 0;
  const key    = `${variant}-${mode}`;

  return {
    key,
    violations,
    screenshot: screenshotCaptured ? screenshotPath : null,
    passed,
  };
}

/**
 * Run Layer 1 across all variants × modes.
 * Page must be on the component URL; caller manages variant/mode switching.
 *
 * @param {object}   opts
 * @param {import('playwright').Page} opts.page
 * @param {string}   opts.component
 * @param {string[]} opts.variants
 * @param {string[]} opts.modes           - default ["light","dark"]
 * @param {string}   opts.screenshotsDir
 * @param {Function} opts.applyVariant    - async (page, variant) => void
 * @param {Function} opts.ensureMode      - async (page, mode) => void
 * @returns {Promise<object>}             - layer1 block for unified result
 */
async function runLayer1All(opts) {
  const { page, component, variants, modes = ['light', 'dark'], screenshotsDir, applyVariant, ensureMode, selector = '.preview-area' } = opts;

  const allViolations = [];
  const screenshots   = [];
  const passed        = [];
  const failed        = [];

  for (const mode of modes) {
    await ensureMode(page, mode);
    for (const variant of variants) {
      await applyVariant(page, variant);
      const r = await runLayer1({ page, component, variant, mode, screenshotsDir, selector });
      if (r.screenshot) screenshots.push(r.screenshot);
      if (r.passed) {
        passed.push(r.key);
      } else {
        failed.push(r.key);
        allViolations.push(...r.violations);
      }
    }
  }

  // Deduplicate violations by axe_id + element signature
  const seen = new Map();
  for (const v of allViolations) {
    const key = (v.axe_id || '') + '|' + (v.element || '').slice(0, 100);
    if (!seen.has(key)) {
      seen.set(key, { ...v, count: 1 });
    } else {
      const existing = seen.get(key);
      existing.count++;
      existing.note = `deduplicated — same issue in ${existing.count} variant/mode combos`;
    }
  }
  const deduped = Array.from(seen.values());

  const summary = { total: 0, s1: 0, s2: 0, s3: 0, s4: 0 };
  for (const v of deduped) {
    const sev = (v.severity || 'S4').toLowerCase();
    summary[sev] = (summary[sev] || 0) + 1;
    summary.total++;
  }

  return { violations: deduped, screenshots, passed, failed, summary };
}

module.exports = { runLayer1, runLayer1All };
