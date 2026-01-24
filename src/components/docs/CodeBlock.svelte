<!--
  @component CodeBlock

  Syntax-highlighted code block with copy-to-clipboard functionality.
  Uses Shiki for highlighting via CSS variables for theme compatibility.

  @example
  ```svelte
  <CodeBlock
    code={`const greeting = "Hello, World!";`}
    lang="javascript"
    filename="example.js"
  />
  ```
-->
<script>
  import {getHighlighter} from '../../utils/highlighter.js';
  import {Copy, Check} from '@lucide/svelte';

  let {
    /** The code to display */
    code = '',
    /** Language for syntax highlighting */
    lang = 'javascript',
    /** Optional filename to display in header */
    filename = '',
    /** Show line numbers */
    showLineNumbers = false,
    /** Additional CSS classes */
    class: className = ''
  } = $props();

  let copied = $state(false);
  let highlightedCode = $state('');

  $effect(() => {
    highlightCodeAsync();
  });

  async function highlightCodeAsync() {
    try {
      const highlighter = await getHighlighter();
      highlightedCode = highlighter.codeToHtml(code.trim(), {
        lang: lang || 'text',
        theme: 'css-variables'
      });
    } catch (e) {
      highlightedCode = `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code.trim());
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }
</script>

<div class="jera-code-block {className}">
  {#if filename}
    <div class="code-header">
      <span class="code-filename">{filename}</span>
      <span class="code-lang">{lang}</span>
    </div>
  {/if}

  <div class="code-container">
    <button
      class="copy-btn"
      onclick={copyCode}
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      {#if copied}
        <Check size={16} />
      {:else}
        <Copy size={16} />
      {/if}
    </button>

    <div class="code-content" class:with-lines={showLineNumbers}>
      {@html highlightedCode}
    </div>
  </div>
</div>

<style>
  .jera-code-block {
    position: relative;
    border-radius: var(--radius-md, 0.5rem);
    overflow: hidden;
    background: var(--color-base1, var(--base1, #1a1f26));
    border: 1px solid var(--color-border, var(--base2, #2d3748));
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--color-base0, var(--base0, #0f1419));
    border-bottom: 1px solid var(--color-border, var(--base2, #2d3748));
    font-size: 0.75rem;
  }

  .code-filename {
    color: var(--color-base5, var(--base5, #e2e8f0));
    font-family: var(--font-mono, monospace);
  }

  .code-lang {
    color: var(--color-base4, var(--base4, #a0aec0));
    text-transform: uppercase;
    font-size: 0.625rem;
    letter-spacing: 0.05em;
  }

  .code-container {
    position: relative;
  }

  .copy-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
    padding: 0.5rem;
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    background: var(--color-base2, var(--base2, #242a33));
    color: var(--color-base4, var(--base4, #a0aec0));
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s, color 0.15s;
  }

  .jera-code-block:hover .copy-btn {
    opacity: 1;
  }

  .copy-btn:hover {
    background: var(--color-base3, var(--base3, #4a5568));
    color: var(--color-base6, var(--base6, #f7fafc));
  }

  .code-content {
    overflow-x: auto;
  }

  .code-content :global(pre) {
    margin: 0;
    padding: 1rem;
    background: transparent !important;
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .code-content :global(code) {
    font-family: inherit;
  }

  /* Shiki CSS variables theme - compatible with both jera and selify themes */
  .code-content {
    --shiki-color-text: var(--color-base5, var(--base5, #e2e8f0));
    --shiki-color-background: transparent;
    --shiki-token-constant: var(--blue, #83d2fc);
    --shiki-token-string: var(--green, #6dd672);
    --shiki-token-comment: var(--base3, #565e78);
    --shiki-token-keyword: var(--magenta, #c974e6);
    --shiki-token-parameter: var(--peach, #ff9982);
    --shiki-token-function: var(--blue, #83d2fc);
    --shiki-token-string-expression: var(--green, #6dd672);
    --shiki-token-punctuation: var(--color-base4, var(--base4, #a0aec0));
    --shiki-token-link: var(--blue, #83d2fc);
  }

  /* Line numbers */
  .with-lines :global(pre) {
    counter-reset: line;
  }

  .with-lines :global(.line::before) {
    counter-increment: line;
    content: counter(line);
    display: inline-block;
    width: 2rem;
    margin-right: 1rem;
    text-align: right;
    color: var(--color-base3, var(--base3, #4a5568));
    user-select: none;
  }
</style>
