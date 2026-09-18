/*
  layer4-responsive.js
  ─────────────────────────────────────────────────────────────────────────────
  Layer 4 — Responsive Testing
  Tests component rendering at 3 standard viewport sizes.

  Viewports:
    Mobile:  375×812   (iPhone 14)
    Tablet:  768×1024  (iPad)
    Desktop: 1440×900  (standard laptop)

  For each viewport:
    1. Resize browser to viewport
    2. Navigate to component (or just resize if same page)
    3. Check: component renders correctly (no missing element)
    4. Check: no overflow/clipping (bounding box within viewport)
    5. Check: text readable (font-size >= 12px after zoom)
    6. Check: layout intact (no zero-height, no negative positions)
    7. Screenshot — ONLY when a check fails at this viewport

  Returns:
    {
      mobile:  { viewport: "375×812",  render: "pass|fail", overflow: "none|detected", text_readable: "pass|fail", layout: "pass|fail", screenshot: "..." },
      tablet:  { ... },
      desktop: { ... },
      violations: [...],
      summary: { total, s1, s2, s3, s4 }
    }

  Skills: responsive-testing.md
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

const path = require('path');
const fs   = require('fs');

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812  },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900  },
];

// ── Checks ───────────────────────────────────────────────────────────────────

/**
 * Check that the component element exists and has non-zero dimensions.
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function checkRenders(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return 'not-checked';
    const el = preview.querySelector('[class*=jera-]') ?? preview.firstElementChild;
    if (!el) return 'fail: no component element found';
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return 'fail: element has zero dimensions';
    return 'pass';
  }, previewSel);
}

/**
 * Check that the component doesn't overflow the viewport horizontally.
 *
 * @param {import('playwright').Page} page
 * @param {number} viewportWidth
 * @param {string} previewSel - selector for the preview area
 */
async function checkOverflow(page, viewportWidth, previewSel = '.preview-area') {
  return page.evaluate(([vw, sel]) => {
    const preview = document.querySelector(sel);
    if (!preview) return 'not-checked';
    const box = preview.getBoundingClientRect();
    if (box.right > vw + 4) return `detected: right edge at ${Math.round(box.right)}px (viewport ${vw}px)`;
    if (document.body.scrollWidth > vw + 4) {
      return `detected: body scrollWidth ${document.body.scrollWidth}px (viewport ${vw}px)`;
    }
    return 'none';
  }, [viewportWidth, previewSel]);
}

/**
 * Check that text in the component is readable (font-size >= 12px).
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function checkTextReadable(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return 'not-checked';
    const textEls = Array.from(preview.querySelectorAll('*')).filter(el => {
      return el.childElementCount === 0 && el.textContent.trim().length > 0;
    });
    if (textEls.length === 0) return 'n/a';

    for (const el of textEls) {
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      if (fontSize < 12) return `fail: font-size ${fontSize}px on "${el.textContent.trim().slice(0, 30)}"`;
    }
    return 'pass';
  }, previewSel);
}

/**
 * Check layout integrity: no element at negative top position,
 * no element with near-zero height.
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function checkLayout(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return 'not-checked';
    const box = preview.getBoundingClientRect();
    if (box.top < -10) return `fail: preview area at negative top: ${Math.round(box.top)}px`;
    if (box.height < 4) return `fail: preview area height too small: ${Math.round(box.height)}px`;
    return 'pass';
  }, previewSel);
}

// ── Layer 4 main export ─────────────────────────────────────────────────────

/**
 * Run responsive layer (single viewport test call, not per variant).
 * Reuses auth — navigates to componentUrl at each viewport size.
 *
 * @param {object}   opts
 * @param {import('playwright').BrowserContext} opts.context - Playwright context
 * @param {string}   opts.componentUrl
 * @param {string}   opts.component
 * @param {string[]} opts.variants          - apply first variant only
 * @param {string}   opts.screenshotsDir
 * @param {Function} opts.applyVariant      - async (page, variant) => void
 * @param {Function} opts.ensureAuthenticated - async (page) => void
 * @returns {Promise<object>}
 */
async function runLayer4All(opts) {
  const { context, componentUrl, component, variants, screenshotsDir, applyVariant, ensureAuthenticated, selectors = {} } = opts;
  // Selify mode:    .preview-area / Standard Storybook mode: .docs-story
  const previewSel = selectors.previewArea || '.preview-area';

  fs.mkdirSync(screenshotsDir, { recursive: true });

  const results    = {};
  const violations = [];

  for (const viewport of VIEWPORTS) {
    const { name, width, height } = viewport;
    console.log(`  [L4] Testing ${name} (${width}×${height})...`);

    const vpage = await context.newPage();
    await vpage.setViewportSize({ width, height });

    try {
      // Auth
      await ensureAuthenticated(vpage);

      // Navigate to component
      await vpage.goto(componentUrl, { waitUntil: 'networkidle', timeout: 30000 });
      // Selify mode:    wait for .preview-area
      // Standard Storybook mode: wait for .docs-story
      await vpage.waitForSelector(previewSel, { timeout: 15000 }).catch(() => {});
      await vpage.waitForTimeout(500);

      // Apply first variant
      if (variants[0]) {
        await applyVariant(vpage, variants[0]).catch(() => {});
      }

      // Run checks first — screenshot only on failure
      const renderResult   = await checkRenders(vpage, previewSel);
      const overflowResult = await checkOverflow(vpage, width, previewSel);
      const textResult     = await checkTextReadable(vpage, previewSel);
      const layoutResult   = await checkLayout(vpage, previewSel);

      // Determine which checks failed
      const failures = [];
      if (renderResult !== 'pass' && renderResult !== 'not-checked') failures.push('render');
      if (overflowResult !== 'none' && overflowResult !== 'not-checked') failures.push('overflow');
      if (textResult !== 'pass' && textResult !== 'n/a' && textResult !== 'not-checked') failures.push('text-readable');
      if (layoutResult !== 'pass' && layoutResult !== 'not-checked') failures.push('layout');

      // Screenshot only when a failure was detected
      let screenshotCaptured = false;
      let screenshotPath = null;
      let screenshotName = null;
      if (failures.length > 0) {
        screenshotName = `${component}-${name}-l4-${failures[0]}.png`;
        screenshotPath = path.join(screenshotsDir, screenshotName);
        await vpage.screenshot({ path: screenshotPath, fullPage: false })
          .then(() => { screenshotCaptured = true; })
          .catch(err => console.warn(`    [L4] Screenshot failed: ${err.message}`));
      }

      results[name] = {
        viewport:      `${width}×${height}`,
        render:        renderResult,
        overflow:      overflowResult,
        text_readable: textResult,
        layout:        layoutResult,
        screenshot:    screenshotCaptured ? screenshotPath : null,
      };

      // Build violations — attach screenshot if captured
      if (renderResult !== 'pass' && renderResult !== 'not-checked') {
        violations.push({ layer: 4, viewport: name, check: 'render', severity: 'S2', fix: renderResult, ...(screenshotCaptured && { screenshot: screenshotName }) });
      }
      if (overflowResult !== 'none' && overflowResult !== 'not-checked') {
        violations.push({ layer: 4, viewport: name, check: 'overflow', severity: 'S3', fix: `Overflow at ${name}: ${overflowResult}`, ...(screenshotCaptured && { screenshot: screenshotName }) });
      }
      if (textResult !== 'pass' && textResult !== 'n/a' && textResult !== 'not-checked') {
        violations.push({ layer: 4, viewport: name, check: 'text_readable', severity: 'S3', fix: textResult, ...(screenshotCaptured && { screenshot: screenshotName }) });
      }
      if (layoutResult !== 'pass' && layoutResult !== 'not-checked') {
        violations.push({ layer: 4, viewport: name, check: 'layout', severity: 'S2', fix: layoutResult, ...(screenshotCaptured && { screenshot: screenshotName }) });
      }

    } catch (err) {
      console.warn(`  [L4] Error testing ${name}: ${err.message}`);
      results[name] = {
        viewport:      `${width}×${height}`,
        render:        `error: ${err.message.slice(0, 100)}`,
        overflow:      'not-checked',
        text_readable: 'not-checked',
        layout:        'not-checked',
        screenshot:    null,
      };
      violations.push({ layer: 4, viewport: name, check: 'all', severity: 'S3', fix: `Layer 4 error at ${name}: ${err.message.slice(0, 100)}` });
    } finally {
      await vpage.close();
    }
  }

  const summary = { total: 0, s1: 0, s2: 0, s3: 0, s4: 0 };
  for (const v of violations) {
    const sev = (v.severity || 'S3').toLowerCase();
    summary[sev] = (summary[sev] || 0) + 1;
    summary.total++;
  }

  return {
    mobile:  results['mobile']  ?? null,
    tablet:  results['tablet']  ?? null,
    desktop: results['desktop'] ?? null,
    violations,
    summary,
  };
}

module.exports = { runLayer4All, VIEWPORTS };
