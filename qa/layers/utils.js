'use strict';

/**
 * Screenshot the preview area (with padding), falling back to full page.
 * Used by layer2-interaction.js and layer3-props.js.
 *
 * @param {import('playwright').Page} page
 * @param {string} outputPath
 * @param {string} [logPrefix]
 * @param {string} [previewSel] - selector for the preview area
 */
async function capturePreview(page, outputPath, logPrefix = 'L?', previewSel = '.preview-area') {
  try {
    const preview = await page.$(previewSel);
    if (!preview) {
      await page.screenshot({ path: outputPath });
      return;
    }
    const box     = await preview.boundingBox();
    const padding = 16;
    await page.screenshot({
      path: outputPath,
      clip: box ? {
        x:      Math.max(0, box.x - padding),
        y:      Math.max(0, box.y - padding),
        width:  box.width  + padding * 2,
        height: box.height + padding * 2,
      } : undefined,
    });
  } catch (err) {
    console.warn(`    [${logPrefix}] Screenshot failed: ${err.message}`);
  }
}

// ── Environment selector sets ─────────────────────────────────────────────────
// Selectors differ between Selify's custom doc pages and standard Storybook.
//
// Selify mode:    uses custom /docs/components/ pages
// Standard Storybook mode: uses /?path=/docs/ with v7/v8 DOM structure

const SELECTORS = {
  selify: {
    previewArea:   '.preview-area',
    controls:      '.controls-panel',
    variantSelect: '.controls-panel select.jera-select',
    // non-null: dark mode toggle exists — L1 runs both light + dark
    modeToggle:    '.dark-light-toggle',
  },
  storybook: {
    // Storybook v7/v8 docs view: first story block is the live preview
    previewArea:   '.docs-story',
    controls:      '.docblock-argstable',
    variantSelect: '.docblock-argstable select',
    // null: no built-in dark/light toggle — L1 runs light mode only
    modeToggle:    null,
  },
};

/**
 * Return the selector set for the given Storybook mode.
 * Falls back to 'selify' for unknown modes.
 *
 * @param {'selify'|'storybook'} mode
 * @returns {{ previewArea: string, controls: string, variantSelect: string, modeToggle: string|null }}
 */
function getSelectors(mode = 'selify') {
  return SELECTORS[mode] || SELECTORS.selify;
}

module.exports = { capturePreview, getSelectors, SELECTORS };
