<!--
  @component Card

  A flexible card container with optional title and variants.

  @example Basic
  <Card>
    <p>Card content here</p>
  </Card>

  @example With title
  <Card title="Settings">
    <p>Your settings content</p>
  </Card>

  @example Danger variant
  <Card title="Danger Zone" variant="danger">
    <Button variant="danger">Delete Account</Button>
  </Card>

  @example Compact (opt-in) — a dense record in a feed: head row, body, actions
  <Card density="compact" as="article">
    {#snippet head()}<strong>Human handoff</strong>{/snippet}
    {#snippet status()}<Badge tone="label" variant="primary" size="sm">Needs you</Badge>{/snippet}
    <p>Off → On</p>
    {#snippet actions()}<Button size="sm">Approve</Button>{/snippet}
  </Card>

  @example Compact with a summary line (2px under the head)
  <Card density="compact">
    {#snippet head()}Add supplier: Jaipur Textile Works{/snippet}
    {#snippet summary()}Reads the brand's site · nothing is added yet{/snippet}
  </Card>

  @example Compact + collapsible — the head row is the toggle; `status` stays clickable beside it
  <Card density="compact" collapsible bind:collapsed>
    {#snippet head(isCollapsed)}{isCollapsed ? 'Human handoff · Off → On' : 'Human handoff'}{/snippet}
    {#snippet status()}<a href="/settings/">Open settings</a>{/snippet}
    <p>Body</p>
  </Card>

  @example Compact + fixed — the folded row of a record with nothing to open: no toggle, no chevron
  <Card density="compact" fixed collapsed>
    {#snippet head(isCollapsed)}Publish a product · Expired{/snippet}
  </Card>
-->
<script>
  let {
    title = '',
    variant = 'default',
    /** 'default' | 'compact' — compact: 10×12 padding, radius-md, base01 fill, base02 border, no hover border, head/status/actions snippets (opt-in). */
    density = 'default',
    /** Compact only: the element the card renders as ('div' | 'article' | 'section'). */
    as = 'div',
    /** Compact only: the head row is a `<button aria-expanded>` that folds the body and actions away. */
    collapsible = false,
    /** Compact + collapsible: whether only the head row shows (bindable). */
    collapsed = $bindable(false),
    /** Compact + collapsible: called with the new collapsed value after a toggle. */
    ontoggle = null,
    /** Compact: draw the folded row (`collapsed`) with no toggle and no chevron — a record with nothing under its head (opt-in). */
    fixed = false,
    /** Compact: accessible label for the toggle button when the head text alone is not enough. */
    toggleLabel = null,
    class: className = '',
    head,
    status,
    summary,
    actions,
    children,
    ...rest
  } = $props();

  const tag = $derived(['article', 'section', 'div'].includes(as) ? as : 'div');
  const toggles = $derived(collapsible && !fixed);
  const folded = $derived((collapsible || fixed) && collapsed);

  function toggle() {
    collapsed = !collapsed;
    ontoggle?.(collapsed);
  }
</script>

{#if density === 'compact'}
  <svelte:element
    this={tag}
    class="card-compact {className}"
    class:card-compact-collapsed={folded}
    data-collapsed={collapsible || fixed ? String(folded) : undefined}
    {...rest}
  >
    {#if head || status}
      <div class="card-compact-head" class:card-compact-head-toggle={toggles}>
        {#if toggles}
          <button
            type="button"
            class="card-compact-toggle"
            aria-expanded={!folded}
            aria-label={toggleLabel || undefined}
            onclick={toggle}
          >
            {@render head?.(folded)}
          </button>
        {:else}
          <div class="card-compact-lead">{@render head?.(folded)}</div>
        {/if}
        {#if status}
          <div class="card-compact-status">{@render status(folded)}</div>
        {/if}
        {#if toggles}
          <span class="card-compact-chevron" class:card-compact-chevron-open={!folded} aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        {/if}
      </div>
    {/if}
    {#if !folded}
      {#if summary}
        <div class="card-compact-summary">{@render summary()}</div>
      {/if}
      {#if children}
        <div class="card-compact-body">{@render children()}</div>
      {/if}
      {#if actions}
        <div class="card-compact-actions">{@render actions()}</div>
      {/if}
    {/if}
  </svelte:element>
{:else}
<div class="card card-{variant} {className}">
  {#if title}
    <h3 class="card-title">{@html title}</h3>
  {/if}
  <div class="card-content">
    {@render children?.()}
  </div>
</div>
{/if}

<style>
  .card {
    background: transparent;
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-xl);
    padding: var(--space-12);
    transition: border-color var(--duration-base) ease;
  }

  .card:hover {
    border-color: var(--color-base03);
  }

  .card-danger {
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
    background: color-mix(in srgb, var(--color-base08) 3%, transparent);
  }

  .card-danger:hover {
    border-color: color-mix(in srgb, var(--color-base08) 40%, transparent);
  }

  .card-warning {
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
    background: color-mix(in srgb, var(--color-base0A) 3%, transparent);
  }

  .card-warning:hover {
    border-color: color-mix(in srgb, var(--color-base0A) 40%, transparent);
  }

  .card-success {
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
    background: color-mix(in srgb, var(--color-base0B) 3%, transparent);
  }

  .card-success:hover {
    border-color: color-mix(in srgb, var(--color-base0B) 40%, transparent);
  }

  .card-title {
    margin: 0 0 var(--space-10) 0;
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-base07);
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .card-danger .card-title {
    color: var(--color-base08);
  }

  .card-warning .card-title {
    color: var(--color-base0A);
  }

  .card-success .card-title {
    color: var(--color-base0B);
  }

  .card-content {
    /* Allow child components to handle their own spacing */
  }

  /* ── Compact (opt-in): one neutral frame for dense records in a feed ── */
  .card-compact {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: var(--space-5) var(--space-6);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    background: var(--color-base01);
  }

  /* Collapsed: one 32px row, the same frame. */
  .card-compact-collapsed {
    padding-block: 0;
  }

  .card-compact-head {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  /* 32px outside the frame: the row is 2rem minus its two borders. */
  .card-compact-collapsed .card-compact-head {
    min-height: calc(2rem - 2 * var(--border-width-thin, 1px));
  }

  .card-compact-lead,
  .card-compact-toggle {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  /* The toggle is the head's left part; its ::after stretches over the whole
     row so a click anywhere on the row folds it, while the status snippet
     (links, small buttons) sits above that layer and keeps its own clicks. */
  .card-compact-toggle {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    text-align: start;
    cursor: pointer;
  }

  .card-compact-toggle::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .card-compact-toggle:focus-visible {
    outline: none;
  }

  .card-compact-toggle:focus-visible::after {
    border-radius: var(--radius-sm);
    box-shadow: var(--focus-ring-shadow, 0 0 0 2px var(--color-base0D));
  }

  .card-compact-status {
    position: relative;
    z-index: 1;
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .card-compact-chevron {
    display: inline-flex;
    flex: none;
    color: var(--color-base04);
    transform: rotate(-90deg);
    transition: transform var(--duration-fast) ease;
    pointer-events: none;
  }

  .card-compact-chevron-open {
    transform: none;
  }

  .card-compact-head-toggle:hover .card-compact-chevron {
    color: var(--color-base06);
  }

  .card-compact-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
    margin-top: var(--space-1);
  }

  .card-compact-head + .card-compact-body,
  .card-compact-summary + .card-compact-body {
    margin-top: var(--space-4);
  }

  /* One line under the head, close to it (2px): it belongs to the title. */
  .card-compact-summary {
    min-width: 0;
    margin-top: var(--space-1);
  }

  .card-compact-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-5);
  }
</style>
