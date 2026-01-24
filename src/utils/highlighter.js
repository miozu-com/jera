/**
 * Syntax highlighting utility using Shiki v3 with CSS variables theme.
 * Provides cached highlighter instance for performance.
 * Handles the case when shiki is not installed as an optional dependency.
 *
 * @module @miozu/jera/utils/highlighter
 */

// Cache the highlighter to avoid recreating it for each request
let highlighterPromise = null;
let shikiAvailable = null;

/**
 * Default languages supported by the highlighter
 */
export const DEFAULT_LANGUAGES = [
  'javascript',
  'typescript',
  'svelte',
  'jsx',
  'tsx',
  'html',
  'css',
  'json',
  'bash',
  'shell',
  'markdown',
  'python',
  'sql',
  'yaml',
  'toml'
];

/**
 * Check if shiki is available
 * @returns {Promise<boolean>}
 */
async function isShikiAvailable() {
  if (shikiAvailable !== null) return shikiAvailable;

  try {
    await import('shiki');
    shikiAvailable = true;
  } catch {
    shikiAvailable = false;
  }
  return shikiAvailable;
}

/**
 * Get or create the Shiki highlighter with CSS variables theme.
 * The highlighter is cached and reused for performance.
 *
 * @returns {Promise<import('shiki').Highlighter|null>}
 */
export async function getHighlighter() {
  if (!await isShikiAvailable()) {
    return null;
  }

  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const shiki = await import('shiki');

      // Create a CSS variables theme that uses CSS custom properties
      const cssVarsTheme = shiki.createCssVariablesTheme({
        name: 'css-variables',
        variablePrefix: '--shiki-',
        variableDefaults: {},
        fontStyle: true
      });

      return shiki.createHighlighter({
        themes: [cssVarsTheme],
        langs: DEFAULT_LANGUAGES
      });
    })();
  }

  return highlighterPromise;
}

/**
 * Highlight code using Shiki with CSS variables theme.
 *
 * @param {string} code - The code to highlight
 * @param {string} [lang='text'] - The language for syntax highlighting
 * @returns {Promise<string>} HTML string with highlighted code
 */
export async function highlightCode(code, lang = 'text') {
  try {
    const highlighter = await getHighlighter();

    if (!highlighter) {
      // Shiki not available, return basic escaped code
      return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
    }

    const html = highlighter.codeToHtml(code.trim(), {
      lang: lang || 'text',
      theme: 'css-variables'
    });

    return html;
  } catch (err) {
    console.error('Highlighting error:', err);
    // Fallback to basic escaping
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}

/**
 * Escape HTML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
