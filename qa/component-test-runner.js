/*
  component-test-runner.js  (v2 — 4-layer modular architecture)
  ─────────────────────────────────────────────────────────────────────────────
  Orchestrates all 4 test layers for a single component.

  Layer 1 — Accessibility  (layers/layer1-accessibility.js)
    axe-core + canvas pixel sampling contrast · screenshot on violation only

  Layer 2 — Interaction    (layers/layer2-interaction.js)
    Tab focus · focus visible · Enter/Space · click · hover · disabled

  Layer 3 — Props           (layers/layer3-props.js)
    Empty string · long text · special chars · all variants · numeric zero · whitespace

  Layer 4 — Responsive      (layers/layer4-responsive.js)
    375×812 · 768×1024 · 1440×900 · render / overflow / text / layout

  Usage:
    source load-credentials.sh
    node component-test-runner.js https://admin.selify.ai/docs/components/badge/
    node component-test-runner.js --component Badge

  Environment variables:
    STORYBOOK_URL   Base URL of the Storybook/docs server (default: http://localhost:6006)
    STORYBOOK_MODE  'selify' (default) or 'storybook' — controls URL format and DOM selectors
    CI              Set to 'true' to skip authentication

  STORYBOOK_MODE values:
    selify    → Selify custom /docs/components/ pages with .preview-area + .controls-panel
    storybook → Standard Storybook v7/v8 /?path=/docs/ with .docs-story + .docblock-argstable

  Output:
    Screenshots → qa/screenshots/
    JSON report → qa/reports/[component]-full-test-results.json
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

// ── Config ──────────────────────────────────────────────────────────────────
// CI mode: set CI=true env var (standard). --ci flag is also accepted for
// local overrides (e.g. running a single component against a local server).
const CI_MODE = process.env.CI === 'true' || process.argv.includes('--ci');

// Selify mode:    uses custom /docs/components/ pages
// Standard Storybook mode: uses /?path=/docs/ with v7/v8 DOM structure
const STORYBOOK_MODE = process.env.STORYBOOK_MODE || 'selify';
const STORYBOOK_URL  = (process.env.STORYBOOK_URL || 'http://localhost:6006').replace(/\/$/, '');

const { chromium }    = require('playwright');
const path            = require('path');
const fs              = require('fs');

const { runLayer1All }              = require('./layers/layer1-accessibility');
const { runLayer2All }              = require('./layers/layer2-interaction');
const { runLayer3All }              = require('./layers/layer3-props');
const { runLayer4All }              = require('./layers/layer4-responsive');
const { getSelectors }              = require('./layers/utils');

// ── Paths ──────────────────────────────────────────────────────────────────
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORTS_DIR     = path.join(__dirname, 'reports');

// ── URL builder ─────────────────────────────────────────────────────────────

/**
 * Build the component URL from a PascalCase component name.
 * Selify mode:    uses custom /docs/components/ pages
 * Standard Storybook mode: uses /?path=/docs/ with v7/v8 DOM structure
 */
function buildComponentUrl(componentName) {
  const slug = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  if (STORYBOOK_MODE === 'storybook') {
    return `${STORYBOOK_URL}/?path=/docs/${slug}--docs`;
  }
  return `${STORYBOOK_URL}/docs/components/${slug}/`;
}

// ── Auth ────────────────────────────────────────────────────────────────────

async function ensureAuthenticated(page) {
  if (CI_MODE) {
    console.log('  → CI mode — skipping authentication');
    return;
  }
  const EMAIL    = process.env.STORYBOOK_EMAIL;
  const PASSWORD = process.env.STORYBOOK_PASSWORD;
  if (!EMAIL || !PASSWORD) {
    throw new Error('STORYBOOK_EMAIL / STORYBOOK_PASSWORD not set. Run: source load-credentials.sh');
  }

  const adminUrl = STORYBOOK_URL;
  await page.goto(adminUrl, { waitUntil: 'networkidle', timeout: 30000 });
  const url = page.url();

  if (!url.includes('/auth') && !url.includes('/login') && !url.includes('/sign')) {
    console.log('  → Already authenticated');
    return;
  }

  console.log('  → Not authenticated — logging in...');

  // Step 1: Fill email
  const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first();
  await emailField.waitFor({ state: 'visible', timeout: 10000 });
  await emailField.fill(EMAIL);
  await page.waitForTimeout(300);

  // Step 2: If password is not yet visible, click "Sign in with password" to reveal it
  const passwordField = page.locator('input[type="password"]').first();
  let passwordVisible = await passwordField.isVisible().catch(() => false);
  if (!passwordVisible) {
    const pwdBtn = page.locator('button:has-text("Sign in with password"), a:has-text("Sign in with password")').first();
    if (await pwdBtn.isVisible().catch(() => false)) {
      await pwdBtn.click();
      await page.waitForTimeout(800);
    }
    passwordVisible = await passwordField.isVisible().catch(() => false);
  }

  if (passwordVisible) {
    // Step 3: Fill password
    await passwordField.fill(PASSWORD);
    await page.waitForTimeout(300);

    // Step 4: Submit — press Enter on password field (button click silently fails
    // on dash.selify.ai SvelteKit form; Enter correctly fires the POST)
    await passwordField.press('Enter');
  }

  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  const finalUrl = page.url();
  if (finalUrl.includes('/auth') || finalUrl.includes('/login')) {
    throw new Error(`Login failed — still on auth page: ${finalUrl}`);
  }
  console.log('  → Login successful');
}

// ── Variant parsing ─────────────────────────────────────────────────────────

async function parseVariants(page, componentUrl) {
  const selectors = getSelectors(STORYBOOK_MODE);

  await page.goto(componentUrl, { waitUntil: 'networkidle', timeout: 30000 });

  const hasControls = await page.waitForSelector(selectors.controls, { timeout: 8000 })
    .then(() => true)
    .catch(() => false);

  if (!hasControls) {
    // Selify mode:    .controls-panel not found — no variant switching available
    // Standard Storybook mode: .docblock-argstable not found — same fallback
    console.warn(`    [WARN] Controls not found with selector "${selectors.controls}" in ${STORYBOOK_MODE} mode. Check STORYBOOK_MODE env var.`);
    return null; // signal fallback mode
  }

  await page.waitForTimeout(500);

  const options = await page.evaluate((variantSel) => {
    const select = document.querySelector(variantSel);
    if (!select) return [];
    return Array.from(select.options)
      .map(o => o.value)
      .filter(v => v !== '');
  }, selectors.variantSelect);

  return options.length ? options : null; // null = fallback mode
}

// ── Variant + mode helpers ───────────────────────────────────────────────────

async function applyVariant(page, variant) {
  const selectors = getSelectors(STORYBOOK_MODE);
  await page.selectOption(selectors.variantSelect, variant);
  await page.waitForTimeout(300);
}

async function getCurrentTheme(page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme') ?? 'light');
}

async function toggleTheme(page) {
  // Selify mode: dark/light toggle is a checkbox inside .controls-panel
  // Standard Storybook mode: no built-in toggle — returns null (caller skips dark mode)
  if (STORYBOOK_MODE === 'storybook') return null;

  const toggled = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.controls-panel .control-row'));
    const darkRow = rows.find(r => r.textContent?.toLowerCase().includes('dark'));
    if (!darkRow) return false;
    const input = darkRow.querySelector('input[type="checkbox"]');
    if (!input) return false;
    input.click();
    return true;
  });
  if (!toggled) return null; // non-fatal — caller handles missing toggle
  await page.waitForTimeout(400);
  return await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

async function ensureMode(page, mode) {
  // Standard Storybook mode: no dark/light toggle — always stay in light mode
  if (STORYBOOK_MODE === 'storybook') return;

  const current = await getCurrentTheme(page);
  const isDark   = current === 'dark' || current === 'miozu-dark';
  const wantDark = mode === 'dark';
  if (isDark !== wantDark) {
    const result = await toggleTheme(page);
    if (result === null) {
      console.warn(`    [mode] Dark mode toggle not found — staying in current mode`);
      return; // skip dark mode gracefully
    }
    await page.waitForTimeout(300);
  }
}

// ── Fallback: no controls panel — L1 + L4 only ───────────────────────────────

async function testComponentFallback(page, context, component, storyUrl, runId) {
  const started_at = new Date().toISOString();
  const selectors  = getSelectors(STORYBOOK_MODE);
  console.log(`  → Fallback mode — L1+L4 only (no controls panel)`);

  const noOp = async () => {};

  // L1 — scan preview area if present, otherwise body; light mode only
  // Selify mode: .preview-area is the component container
  // Standard Storybook mode: .docs-story is the component container
  const previewExists = await page.$(selectors.previewArea).then(el => !!el).catch(() => false);
  const l1Selector = previewExists ? selectors.previewArea : 'body';

  const layerOpts = {
    page,
    component,
    variants:       ['default'],
    modes:          ['light'],
    screenshotsDir: SCREENSHOTS_DIR,
    applyVariant:   noOp,
    ensureMode:     noOp,
    selector:       l1Selector,
    selectors,
  };

  console.log(`\n[${component}] Layer 1 — Accessibility (fallback)...`);
  const layer1 = await runLayer1All(layerOpts);
  console.log(`  → L1: ${layer1.violations.length} violation(s) | passed: ${layer1.passed.length} | failed: ${layer1.failed.length}`);

  // L4 — responsive, no variant switching
  console.log(`\n[${component}] Layer 4 — Responsive (fallback)...`);
  const layer4 = await runLayer4All({
    context,
    componentUrl:      storyUrl,
    component,
    variants:          [],
    screenshotsDir:    SCREENSHOTS_DIR,
    applyVariant:      noOp,
    ensureAuthenticated,
  });
  console.log(`  → L4: mobile:${layer4.mobile?.render} | tablet:${layer4.tablet?.render} | desktop:${layer4.desktop?.render}`);

  const allViolations = [...layer1.violations, ...(layer4.violations || [])];

  const summary = {
    overall:       allViolations.length === 0 ? 'pass' : 'fail',
    s1: 0, s2: 0, s3: 0, s4: 0,
    total:         allViolations.length,
    layers_failed: [],
    fallback:      true,
    layers_skipped: ['layer2-interaction', 'layer3-props'],
  };

  for (const v of allViolations) {
    const sev = (v.severity || 'S4').toLowerCase();
    summary[sev] = (summary[sev] || 0) + 1;
  }

  if (layer1.summary.total > 0) summary.layers_failed.push('layer1-accessibility');
  if (layer4.summary?.total > 0) summary.layers_failed.push('layer4-responsive');

  const layer2 = { skipped: true, reason: 'no controls panel', violations: [], summary: { total: 0, s1: 0, s2: 0, s3: 0, s4: 0 } };
  const layer3 = { skipped: true, reason: 'no controls panel', violations: [], summary: { total: 0, s1: 0, s2: 0, s3: 0, s4: 0 } };

  const artifacts = [
    ...(layer1.screenshots || []),
    ...(layer4.violations?.filter(v => v.screenshot).map(v => v.screenshot) || []),
  ].filter(Boolean);

  return {
    run_id:           runId ?? `run-${Date.now()}`,
    pipeline:         'component',
    target:           component,
    layers:           { layer1, layer2, layer3, layer4 },
    status:           summary.overall,
    started_at,
    completed_at:     new Date().toISOString(),
    artifacts,
    violations_found: summary.total,
    // legacy fields — kept for suite runner compatibility
    component,
    url:             storyUrl,
    variants_tested: ['default'],
    fallback_mode:   true,
    layer1, layer2, layer3, layer4,
    summary,
  };
}

// ── Core orchestrator ────────────────────────────────────────────────────────

/**
 * Run all 4 test layers for a single component and return a unified result object.
 *
 * @param {import('playwright').Page}        page          - Playwright page (authenticated)
 * @param {import('playwright').BrowserContext} context    - Browser context (for L4 viewports)
 * @param {string}                           componentName - PascalCase component name
 * @param {string}                           storyUrl      - Full URL to the component doc page
 * @param {string}                           [runId]       - Optional run identifier
 * @returns {Promise<object>}                Unified result with layers, summary, and artifacts
 */
async function testComponent(page, context, componentName, storyUrl, runId) {
  const component  = componentName.toLowerCase();
  const started_at = new Date().toISOString();
  const selectors  = getSelectors(STORYBOOK_MODE);

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // Parse variants — returns null if controls not found (triggers fallback)
  console.log(`\n[${component}] Parsing variants...`);
  const variants = await parseVariants(page, storyUrl);
  if (variants === null) return testComponentFallback(page, context, component, storyUrl, runId);
  console.log(`  → Found ${variants.length} variant(s): ${variants.join(', ')}`);

  // Warn if preview area not found — common misconfiguration signal
  const previewExists = await page.$(selectors.previewArea).then(el => !!el).catch(() => false);
  if (!previewExists) {
    // Selify mode: .preview-area not found — check STORYBOOK_MODE
    // Standard Storybook mode: .docs-story not found — check STORYBOOK_MODE
    console.warn(`    [WARN] Preview area not found with selector "${selectors.previewArea}" in ${STORYBOOK_MODE} mode. Check STORYBOOK_MODE env var.`);
  }

  // Shared helpers passed into each layer.
  // modes: only run dark mode when a toggle exists (Selify only).
  const layerOpts = {
    page,
    component,
    variants,
    modes:          selectors.modeToggle ? ['light', 'dark'] : ['light'],
    screenshotsDir: SCREENSHOTS_DIR,
    applyVariant,
    ensureMode,
    selector:       selectors.previewArea,
    selectors,
  };

  // ── Layer 1 — Accessibility ────────────────────────────────────────────────
  console.log(`\n[${component}] Layer 1 — Accessibility...`);
  const layer1 = await runLayer1All(layerOpts);
  console.log(`  → L1: ${layer1.violations.length} violation(s) | passed: ${layer1.passed.length} | failed: ${layer1.failed.length}`);

  // ── Layer 2 — Interaction ─────────────────────────────────────────────────
  console.log(`\n[${component}] Layer 2 — Interaction...`);
  await ensureMode(page, 'light');
  const layer2 = await runLayer2All(layerOpts);
  console.log(`  → L2: ${layer2.violations.length} violation(s) across ${variants.length} variants`);

  // ── Layer 3 — Props ───────────────────────────────────────────────────────
  console.log(`\n[${component}] Layer 3 — Props edge cases...`);
  await ensureMode(page, 'light');
  const layer3 = await runLayer3All(layerOpts);
  console.log(`  → L3: ${layer3.violations.length} violation(s)`);
  console.log(`     empty_string:${layer3.empty_string} | long_text:${layer3.long_text} | special_chars:${layer3.special_chars}`);

  // ── Layer 4 — Responsive ──────────────────────────────────────────────────
  console.log(`\n[${component}] Layer 4 — Responsive (3 viewports)...`);
  const layer4 = await runLayer4All({
    context,
    componentUrl: storyUrl,
    component,
    variants,
    screenshotsDir: SCREENSHOTS_DIR,
    applyVariant,
    ensureAuthenticated,
  });
  console.log(`  → L4: mobile:${layer4.mobile?.render} | tablet:${layer4.tablet?.render} | desktop:${layer4.desktop?.render}`);

  // ── Unified summary ───────────────────────────────────────────────────────
  const allViolations = [
    ...layer1.violations,
    ...layer2.violations,
    ...(layer3.violations || []),
    ...(layer4.violations || []),
  ];

  const summary = {
    overall:       allViolations.length === 0 ? 'pass' : 'fail',
    s1:            0, s2: 0, s3: 0, s4: 0,
    total:         allViolations.length,
    layers_failed: [],
  };

  for (const v of allViolations) {
    const sev = (v.severity || 'S4').toLowerCase();
    summary[sev] = (summary[sev] || 0) + 1;
  }

  if (layer1.summary.total > 0) summary.layers_failed.push('layer1-accessibility');
  if (layer2.summary.total > 0) summary.layers_failed.push('layer2-interaction');
  if (layer3.summary?.total > 0) summary.layers_failed.push('layer3-props');
  if (layer4.summary?.total > 0) summary.layers_failed.push('layer4-responsive');

  const artifacts = [
    ...(layer1.screenshots || []),
    ...(layer2.results?.flatMap(r => r.screenshot ? [r.screenshot] : []) || []),
    ...(layer3.violations?.filter(v => v.screenshot).map(v => v.screenshot) || []),
    ...(layer4.violations?.filter(v => v.screenshot).map(v => v.screenshot) || []),
  ].filter(Boolean);

  const result = {
    run_id:           runId ?? `run-${Date.now()}`,
    pipeline:         'component',
    target:           component,
    layers:           { layer1, layer2, layer3, layer4 },
    status:           summary.overall,
    started_at,
    completed_at:     new Date().toISOString(),
    artifacts,
    violations_found: summary.total,
    // legacy fields — kept for suite runner compatibility
    component,
    url:             storyUrl,
    variants_tested: variants,
    layer1, layer2, layer3, layer4,
    summary,
  };

  return result;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2).filter(a => a !== '--ci');

  // Support both a full URL and --component <Name>
  // Selify mode:    built URL → ${STORYBOOK_URL}/docs/components/${slug}/
  // Standard Storybook mode: built URL → ${STORYBOOK_URL}/?path=/docs/${slug}--docs
  let componentUrl, componentName;
  const compIdx = args.indexOf('--component');
  if (compIdx !== -1) {
    componentName = args[compIdx + 1];
    if (!componentName) {
      console.error('--component requires a component name (e.g. --component Badge)');
      process.exit(1);
    }
    componentUrl = buildComponentUrl(componentName);
  } else {
    componentUrl = args[0];
    componentName = componentUrl?.replace(/\/$/, '').split('/').pop();
  }

  if (!componentUrl) {
    console.error('Usage:');
    console.error('  node component-test-runner.js <component-url>');
    console.error('  node component-test-runner.js --component <name>');
    console.error('');
    console.error('Examples:');
    console.error('  node component-test-runner.js https://admin.selify.ai/docs/components/badge/');
    console.error('  STORYBOOK_URL=https://admin.selify.ai node component-test-runner.js --component Badge');
    console.error('  STORYBOOK_MODE=storybook STORYBOOK_URL=http://localhost:6006 node component-test-runner.js --component Badge');
    process.exit(1);
  }

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Component Test Runner v2 — ${componentName.toUpperCase()}`);
  console.log(`  URL:  ${componentUrl}`);
  console.log(`  Mode: ${STORYBOOK_MODE}`);
  console.log(`  Layers: 1-Accessibility · 2-Interaction · 3-Props · 4-Responsive`);
  console.log(`═══════════════════════════════════════════════════`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  const run_id = `run-${Date.now()}`;

  try {
    console.log('\n[Auth] Checking authentication...');
    await ensureAuthenticated(page);

    const result = await testComponent(page, context, componentName, componentUrl, run_id);

    // Save JSON report
    const reportPath = path.join(REPORTS_DIR, `${componentName}-full-test-results.json`);
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf8');

    // Print summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  DONE — ${componentName.toUpperCase()}`);
    console.log(`  run_id:          ${result.run_id}`);
    console.log(`  Status:          ${result.status.toUpperCase()}`);
    console.log(`  Variants tested: ${result.variants_tested.length}`);
    console.log(`  Violations:      ${result.violations_found}`);
    console.log(`  S1: ${result.summary.s1}  S2: ${result.summary.s2}  S3: ${result.summary.s3}  S4: ${result.summary.s4}`);
    console.log(`  Layers failed:   ${result.summary.layers_failed.join(', ') || 'none'}`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════\n');

    return result;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
  });
} else {
  module.exports = { testComponent, ensureAuthenticated, applyVariant, ensureMode, parseVariants };
}
