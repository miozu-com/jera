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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
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
    background: var(--color-base00);
    border: 1px solid var(--color-base02);
    border-left: 2px solid color-mix(in srgb, var(--color-base0E) 60%, var(--color-base02));
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--color-base00);
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    font-size: 0.75rem;
  }

  .code-filename {
    color: var(--color-base0E);
    font-family: var(--font-mono, monospace);
  }

  .code-lang {
    color: var(--color-base04);
    text-transform: uppercase;
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    font-weight: 500;
    font-family: var(--font-mono, monospace);
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    background: color-mix(in srgb, var(--color-base03) 20%, transparent);
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
    background: var(--color-base02);
    color: var(--color-base04);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s, color 0.15s;
  }

  .jera-code-block:hover .copy-btn {
    opacity: 1;
  }

  .copy-btn:hover {
    background: var(--color-base03);
    color: var(--color-base06);
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

  /* Shiki CSS variables theme — mapped to base16 tokens */
  .code-content {
    --shiki-color-text: var(--color-base05);
    --shiki-color-background: transparent;
    --shiki-token-constant: var(--color-base0D);
    --shiki-token-string: var(--color-base0B);
    --shiki-token-comment: var(--color-base03);
    --shiki-token-keyword: var(--color-base0E);
    --shiki-token-parameter: var(--color-base09);
    --shiki-token-function: var(--color-base0D);
    --shiki-token-string-expression: var(--color-base0B);
    --shiki-token-punctuation: var(--color-base04);
    --shiki-token-link: var(--color-base0C);
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
    color: var(--color-base03);
    user-select: none;
  }
</style>
