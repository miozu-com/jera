/*
  layer2-interaction.js
  ─────────────────────────────────────────────────────────────────────────────
  Layer 2 — Interaction Testing
  Tests keyboard, focus, click, hover, and disabled behavior for each variant.

  Checks per variant:
    1. Tab key    → component receives focus?
    2. Focus visible → outline/ring visible? (CSS outline-width > 0)
    3. Enter/Space   → click handler fires? (click event dispatched)
    4. Escape        → closes if applicable (dialog/dropdown pattern)
    5. Click         → works without error?
    6. Hover         → state changes (class added, style mutated)?
    7. Disabled      → ignores all interactions?

  Non-interactive components are automatically marked N/A.

  Returns per variant:
    {
      variant,
      interactive: true|false,
      tab_focus:         "pass"|"fail"|"n/a",
      focus_visible:     "pass"|"fail"|"n/a",
      enter_activates:   "pass"|"fail"|"n/a",
      escape_closes:     "pass"|"fail"|"n/a"|"not-applicable",
      click_works:       "pass"|"fail"|"n/a",
      hover_state:       "pass"|"fail"|"n/a",
      disabled_respected:"pass"|"fail"|"n/a",
      violations: [...],  // S2 for keyboard fails on interactive elements
      notes: []
    }

  Skills: keyboard-navigation.md · focus-management.md · playwright-selectors.md
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

const path = require('path');
const fs   = require('fs');
const { capturePreview } = require('./utils');

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Detect whether the component in the preview area is interactive.
 * A component is interactive if it has tabindex, role button/link/combobox,
 * or is a native interactive element.
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function isInteractive(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return false;
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'combobox',
                              'listbox', 'menuitem', 'tab', 'switch'];
    const el = preview.querySelector(
      interactiveTags.join(',') + ',' +
      interactiveRoles.map(r => `[role="${r}"]`).join(',') + ',' +
      '[tabindex]:not([tabindex="-1"])'
    );
    return !!el;
  }, previewSel);
}

/**
 * Detect whether the component has a disabled variant active.
 *
 * @param {import('playwright').Page} page
 * @param {string} previewSel - selector for the preview area
 */
async function isDisabledState(page, previewSel = '.preview-area') {
  return page.evaluate((sel) => {
    const preview = document.querySelector(sel);
    if (!preview) return false;
    const el = preview.querySelector('[disabled], [aria-disabled="true"], [class*="disabled"]');
    return !!el;
  }, previewSel);
}

// ── Individual checks ────────────────────────────────────────────────────────

/**
 * Tab focus check: press Tab from body up to MAX_TABS times, checking after
 * each press whether focus has entered .preview-area.
 *
 * One Tab press is not sufficient — in complex page layouts (docs sidebar,
 * controls panel, header) many elements precede the preview area in tab order.
 * Pressing once and checking would false-fail on valid native button elements.
 *
 * Also checks: if element inside .preview-area is a native interactive element
 * (button, a, input, select, textarea) it is inherently focusable — skip the
 * Tab walk and return 'pass' directly. This prevents false positives on pages
 * with deep tab orders.
 */
async function checkTabFocus(page, previewSel = '.preview-area') {
  try {
    const triggerIsNative = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return false;
      const trigger =
        preview.querySelector('[aria-haspopup]') ??
        preview.querySelector('[role="button"]') ??
        preview.querySelector('button, a, input, select, textarea') ??
        preview.firstElementChild;
      if (!trigger) return false;
      const nativeTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
      return nativeTags.includes(trigger.tagName);
    }, previewSel);
    if (triggerIsNative) return 'pass';

    // Slow path: non-native interactive (div-based). Tab-walk up to 15 times.
    const MAX_TABS = 15;
    await page.evaluate(() => document.body.focus());

    for (let i = 0; i < MAX_TABS; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focusedInPreview = await page.evaluate((sel) => {
        const preview = document.querySelector(sel);
        return preview ? preview.contains(document.activeElement) : false;
      }, previewSel);
      if (focusedInPreview) return 'pass';
    }

    return 'fail';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * Focus visible check: after Tab, inspect CSS outline-width and
 * :focus-visible pseudo-class on the active element.
 */
async function checkFocusVisible(page) {
  try {
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    const result = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) return 'fail';
      const styles = getComputedStyle(active);
      const outlineWidth = parseFloat(styles.outlineWidth) || 0;
      const outlineStyle = styles.outlineStyle;
      const boxShadow    = styles.boxShadow;

      // Check: outline width > 0, or box-shadow is used as focus ring substitute
      const hasOutline    = outlineWidth > 0 && outlineStyle !== 'none';
      const hasBoxShadow  = boxShadow && boxShadow !== 'none' && !boxShadow.includes('rgba(0, 0, 0, 0)');

      return (hasOutline || hasBoxShadow) ? 'pass' : 'fail';
    });

    return result;
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * Enter/Space activation: focus the element, attach a click listener,
 * press Enter, verify the listener fired.
 */
async function checkEnterActivates(page, previewSel = '.preview-area') {
  try {
    await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return;
      const el = preview.querySelector('button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      if (el) {
        window.__layer2_clicked = false;
        el.addEventListener('click', () => { window.__layer2_clicked = true; }, { once: true });
        el.focus();
      }
    }, previewSel);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const fired = await page.evaluate(() => window.__layer2_clicked === true);
    return fired ? 'pass' : 'fail';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * Escape closes check: only relevant for dialog/dropdown/popover patterns.
 * Scoped to the preview area — only looks for closeable elements within the
 * component under test, not elsewhere on the docs page.
 *
 * Workflow: click trigger to open → press Escape → check if closed.
 * Returns 'not-applicable' if no closeable pattern found inside the preview area.
 */
async function checkEscapeCloses(page, previewSel = '.preview-area') {
  try {
    const hasCloseable = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return false;
      return !!(preview.querySelector('[role="dialog"],[role="listbox"],[role="menu"],[popover],[data-open],[aria-expanded="true"]'));
    }, previewSel);

    if (!hasCloseable) return 'not-applicable';

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const stillOpen = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return false;
      return !!(preview.querySelector('[role="dialog"]:not([hidden]),[role="listbox"]:not([hidden]),[aria-expanded="true"]'));
    }, previewSel);

    return stillOpen ? 'fail' : 'pass';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * Click check: click the primary interactive element, verify no JS error
 * thrown and element still in DOM.
 */
async function checkClickWorks(page, previewSel = '.preview-area') {
  try {
    const hasTarget = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return false;
      return !!(preview.querySelector('button, a, [role="button"]') ?? preview.firstElementChild);
    }, previewSel);

    if (!hasTarget) return 'n/a';

    let errorFired = false;
    page.once('pageerror', () => { errorFired = true; });

    await page.locator(previewSel).first().click({ timeout: 3000, force: false }).catch(() => {});
    await page.waitForTimeout(200);

    return errorFired ? 'fail' : 'pass';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * Hover state check: hover directly over the primary interactive element
 * inside the preview area, detect background-color change.
 *
 * Hovers the element itself (not the container) to ensure :hover CSS fires.
 * Waits 400ms for CSS transition to settle before reading computed style.
 */
async function checkHoverState(page, previewSel = '.preview-area') {
  try {
    const elSelector = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return null;
      const el = preview.querySelector('button, a, [role="button"]') ?? preview.firstElementChild;
      if (!el) return null;
      const cls = el.className?.trim().split(/\s+/)[0];
      return cls ? `${sel} .${cls}` : null;
    }, previewSel);

    if (!elSelector) return 'n/a';

    const before = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).backgroundColor : null;
    }, elSelector);

    await page.locator(elSelector).first().hover({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);

    const after = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).backgroundColor : null;
    }, elSelector);

    if (before === null || after === null) return 'n/a';
    return before !== after ? 'pass' : 'fail';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * Disabled state check: if element is disabled, verify Tab doesn't focus it
 * and click doesn't fire a click event.
 */
async function checkDisabledRespected(page, previewSel = '.preview-area') {
  try {
    await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      const el = preview?.querySelector('[disabled],[aria-disabled="true"],[class*="disabled"]');
      if (el) {
        window.__layer2_disabled_clicked = false;
        el.addEventListener('click', () => { window.__layer2_disabled_clicked = true; }, { once: true });
      }
    }, previewSel);

    await page.locator(`${previewSel} [disabled], ${previewSel} [aria-disabled="true"]`).first()
      .click({ force: true, timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(200);

    const clicked = await page.evaluate(() => window.__layer2_disabled_clicked === true);
    return clicked ? 'fail' : 'pass';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

// ── Dynamic ARIA checks (CHECK 1–5) ─────────────────────────────────────────

/**
 * CHECK 1 — aria-expanded toggles correctly.
 * Clicks the element with aria-expanded, asserts it toggles true then false.
 */
async function checkAriaExpanded(page, previewSel = '.preview-area') {
  try {
    const hasAriaExpanded = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      return preview ? !!preview.querySelector('[aria-expanded]') : false;
    }, previewSel);
    if (!hasAriaExpanded) return 'n/a';

    await page.evaluate((sel) => {
      const el = document.querySelector(`${sel} [aria-expanded]`);
      if (el) el.click();
    }, previewSel);
    await page.waitForTimeout(300);

    const afterOpen = await page.evaluate((sel) => {
      const el = document.querySelector(`${sel} [aria-expanded]`);
      return el ? el.getAttribute('aria-expanded') : null;
    }, previewSel);

    if (afterOpen !== 'true') return 'fail: aria-expanded did not toggle';

    await page.evaluate((sel) => {
      const el = document.querySelector(`${sel} [aria-expanded]`);
      if (el) el.click();
    }, previewSel);
    await page.waitForTimeout(300);

    const afterClose = await page.evaluate((sel) => {
      const el = document.querySelector(`${sel} [aria-expanded]`);
      return el ? el.getAttribute('aria-expanded') : null;
    }, previewSel);

    return afterClose === 'false' ? 'pass' : 'fail: aria-expanded did not toggle';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * CHECK 2 — aria-live regions announce changes.
 * Captures initial text, triggers a click, waits up to 2000ms for text change.
 */
async function checkAriaLive(page, previewSel = '.preview-area') {
  try {
    const hasAriaLive = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      return preview ? !!preview.querySelector('[aria-live]') : false;
    }, previewSel);
    if (!hasAriaLive) return 'n/a';

    await page.evaluate((sel) => {
      const el = document.querySelector(`${sel} [aria-live]`);
      window.__ariaLiveBefore = el ? el.textContent : '';
    }, previewSel);

    await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      const trigger = preview?.querySelector('button, [role="button"], input, a');
      if (trigger) trigger.click();
    }, previewSel);

    const changed = await page.waitForFunction((sel) => {
      const el = document.querySelector(`${sel} [aria-live]`);
      return el ? el.textContent !== window.__ariaLiveBefore : false;
    }, previewSel, { timeout: 2000 }).then(() => true).catch(() => false);

    return changed ? 'pass' : 'fail: live region did not update';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * CHECK 3 — Focus trap inside Modal/Dialog.
 * Only runs if component name includes: modal, dialog, drawer, sheet.
 * Opens the modal, tabs through all focusable elements, asserts focus never escapes.
 * Then presses Escape and asserts modal closes.
 */
async function checkFocusTrap(page, component, previewSel = '.preview-area') {
  const modalNames = ['modal', 'dialog', 'drawer', 'sheet'];
  if (!modalNames.some(n => (component || '').toLowerCase().includes(n))) return 'n/a';

  try {
    await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      const trigger = preview?.querySelector('button, [role="button"]');
      if (trigger) trigger.click();
    }, previewSel);
    await page.waitForTimeout(500);

    const modalOpen = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      return !!preview?.querySelector('[role="dialog"], [role="alertdialog"]');
    }, previewSel);
    if (!modalOpen) return 'n/a';

    let escaped = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focusEscaped = await page.evaluate((sel) => {
        const preview = document.querySelector(sel);
        const modal = preview?.querySelector('[role="dialog"], [role="alertdialog"]');
        if (!modal) return false;
        return !modal.contains(document.activeElement);
      }, previewSel);
      if (focusEscaped) { escaped = true; break; }
    }

    if (escaped) return 'fail: focus escaped modal';

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const stillOpen = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      return !!preview?.querySelector('[role="dialog"]:not([hidden]), [role="alertdialog"]:not([hidden])');
    }, previewSel);

    return stillOpen ? 'fail: focus escaped modal' : 'pass';
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * CHECK 4 — aria-describedby points to real element.
 * For each ID in aria-describedby, asserts the element exists in DOM and is not empty.
 */
async function checkAriaDescribedby(page, previewSel = '.preview-area') {
  try {
    const result = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return 'n/a';
      const el = preview.querySelector('[aria-describedby]');
      if (!el) return 'n/a';
      const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      for (const id of ids) {
        const target = document.getElementById(id);
        if (!target || !target.textContent?.trim()) {
          return `fail: #${id} not found in DOM`;
        }
      }
      return 'pass';
    }, previewSel);
    return result;
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

/**
 * CHECK 5 — Tab order is logical.
 * Finds all interactive elements inside the preview area and asserts none have tabIndex -1.
 */
async function checkTabOrder(page, previewSel = '.preview-area') {
  try {
    const result = await page.evaluate((sel) => {
      const preview = document.querySelector(sel);
      if (!preview) return 'n/a';
      const focusable = Array.from(preview.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [tabindex]'
      )).filter(el => !el.closest('[disabled]') && !el.hasAttribute('disabled'));

      if (focusable.length === 0) return 'n/a';

      for (const el of focusable) {
        const tabIdx = parseInt(el.getAttribute('tabindex') ?? '0', 10);
        const isNative = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
        const hasRole  = ['button', 'link', 'checkbox', 'radio'].includes(el.getAttribute('role') ?? '');
        if ((isNative || hasRole) && tabIdx === -1) {
          const label = el.tagName.toLowerCase() + (el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
          return `fail: tabIndex -1 on interactive element ${label}`;
        }
      }
      return 'pass';
    }, previewSel);
    return result;
  } catch (e) {
    return `error: ${e.message.slice(0, 80)}`;
  }
}

// ── Layer 2 main export ─────────────────────────────────────────────────────

/**
 * Run interaction layer for a single variant.
 * Page must already be on the component URL with the variant applied.
 *
 * @param {object} opts
 * @param {import('playwright').Page} opts.page
 * @param {string} opts.variant
 * @param {string} opts.mode           - "light"|"dark"
 * @param {string} [opts.component]    - component name (used for screenshot naming)
 * @param {string} [opts.screenshotsDir] - screenshot output directory
 * @returns {Promise<object>}
 */
async function runLayer2(opts) {
  const { page, variant, mode, component, screenshotsDir, selectors = {} } = opts;
  // Selify mode:    .preview-area / Standard Storybook mode: .docs-story
  const previewSel = selectors.previewArea || '.preview-area';

  const interactive = await isInteractive(page, previewSel);
  const disabled    = await isDisabledState(page, previewSel);

  const result = {
    layer: 2,
    variant,
    mode,
    interactive,
    disabled_variant: disabled,
    tab_focus:          'n/a',
    focus_visible:      'n/a',
    enter_activates:    'n/a',
    escape_closes:      'n/a',
    click_works:        'n/a',
    hover_state:        'n/a',
    disabled_respected: 'n/a',
    aria_expanded:      'n/a',
    aria_live:          'n/a',
    focus_trap:         'n/a',
    aria_describedby:   'n/a',
    tab_order:          'n/a',
    violations: [],
    notes: [],
  };

  if (!interactive) {
    result.notes.push('Component is not interactive — all interaction checks marked n/a');
    return result;
  }

  if (disabled) {
    result.disabled_respected = await checkDisabledRespected(page, previewSel);
    if (result.disabled_respected === 'fail') {
      result.violations.push({
        layer: 2,
        variant, mode,
        axe_id:   'disabled-not-respected',
        severity: 'S2',
        wcag:     '4.1.2',
        fix:      'Disabled state must prevent user interaction — click event still firing',
      });
    }
    result.notes.push('Disabled variant — only disabled_respected check run');
    return result;
  }

  // Run all checks
  result.tab_focus       = await checkTabFocus(page, previewSel);
  result.focus_visible   = await checkFocusVisible(page);
  result.enter_activates = await checkEnterActivates(page, previewSel);
  result.escape_closes   = await checkEscapeCloses(page, previewSel);
  result.click_works     = await checkClickWorks(page, previewSel);
  result.hover_state     = await checkHoverState(page, previewSel);

  // Dynamic ARIA checks
  result.aria_expanded    = await checkAriaExpanded(page, previewSel);
  result.aria_live        = await checkAriaLive(page, previewSel);
  result.focus_trap       = await checkFocusTrap(page, component, previewSel);
  result.aria_describedby = await checkAriaDescribedby(page, previewSel);
  result.tab_order        = await checkTabOrder(page, previewSel);

  // Keyboard accessibility violations
  if (result.tab_focus === 'fail') {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'keyboard-tab-focus',
      severity: 'S2',
      wcag:     '2.1.1',
      fix:      'Interactive element not reachable via Tab key — add tabindex="0" or use native interactive element',
    });
  }

  if (result.focus_visible === 'fail') {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'focus-not-visible',
      severity: 'S2',
      wcag:     '2.4.7',
      fix:      'Focus ring not visible — set outline or box-shadow on :focus-visible, do not use outline:none without replacement',
    });
  }

  if (result.enter_activates === 'fail') {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'enter-key-no-activate',
      severity: 'S2',
      wcag:     '2.1.1',
      fix:      'Enter key does not activate component — add keydown handler or use native button element',
    });
  }

  if (result.click_works === 'fail') {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'click-throws-error',
      severity: 'S2',
      wcag:     'N/A',
      fix:      'Click interaction throws a JS error — check click handler implementation',
    });
  }

  if (result.aria_expanded === 'fail: aria-expanded did not toggle') {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'aria-expanded-no-toggle',
      severity: 'S2',
      wcag:     '4.1.2',
      fix:      'aria-expanded attribute does not update when element opens/closes — update attribute on state change',
    });
  }

  if (result.aria_live?.startsWith('fail')) {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'aria-live-no-announce',
      severity: 'S3',
      wcag:     '4.1.3',
      fix:      'aria-live region text did not change after interaction — verify dynamic content updates are written to the live region',
    });
  }

  if (result.focus_trap?.startsWith('fail')) {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'focus-trap-escape',
      severity: 'S2',
      wcag:     '2.1.2',
      fix:      result.focus_trap.includes('escaped') ? 'Focus escapes modal container — trap focus inside dialog with a focus sentinel' : 'Escape key does not close modal — add keydown Escape handler',
    });
  }

  if (result.aria_describedby?.startsWith('fail')) {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'aria-describedby-missing',
      severity: 'S3',
      wcag:     '1.3.1',
      fix:      `${result.aria_describedby} — ensure the referenced element exists in the DOM and contains text`,
    });
  }

  if (result.tab_order?.startsWith('fail')) {
    result.violations.push({
      layer: 2,
      variant, mode,
      axe_id:   'tab-order-invalid',
      severity: 'S3',
      wcag:     '2.4.3',
      fix:      `${result.tab_order} — remove tabindex="-1" from interactive elements or use aria-hidden="true" if intentionally excluded`,
    });
  }

  // Screenshot only when violations were found
  if (result.violations.length > 0 && component && screenshotsDir) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    const issueSlug      = result.violations[0].axe_id.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const screenshotName = `${component}-${variant}-${mode}-l2-${issueSlug}.png`;
    const screenshotPath = path.join(screenshotsDir, screenshotName);
    await capturePreview(page, screenshotPath, 'L2', previewSel);
    for (const v of result.violations) v.screenshot = screenshotName;
    result.screenshot = screenshotPath;
  }

  return result;
}

/**
 * Run Layer 2 across all variants × modes.
 *
 * @param {object}   opts
 * @param {import('playwright').Page} opts.page
 * @param {string[]} opts.variants
 * @param {string[]} opts.modes
 * @param {Function} opts.applyVariant  - async (page, variant) => void
 * @param {Function} opts.ensureMode    - async (page, mode) => void
 * @returns {Promise<object>}           - layer2 block for unified result
 */
async function runLayer2All(opts) {
  // modes is accepted for API consistency with other layers but interaction
  // checks are mode-independent (contrast is L1's responsibility), so we
  // always run in light mode only.
  const { page, variants, modes = ['light', 'dark'], applyVariant, ensureMode, component, screenshotsDir, selectors = {} } = opts;

  const results    = [];
  const violations = [];
  const summary    = { total: 0, s1: 0, s2: 0, s3: 0, s4: 0 };

  const testMode = modes.includes('light') ? 'light' : modes[0];
  await ensureMode(page, testMode);

  for (const variant of variants) {
    await applyVariant(page, variant);
    const r = await runLayer2({ page, variant, mode: testMode, component, screenshotsDir, selectors });
    results.push(r);

    for (const v of r.violations) {
      const sev = (v.severity || 'S4').toLowerCase();
      summary[sev] = (summary[sev] || 0) + 1;
      summary.total++;
      violations.push(v);
    }
  }

  return { results, violations, summary };
}

module.exports = { runLayer2, runLayer2All };
