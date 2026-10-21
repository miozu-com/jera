<!--
  @component AccordionItem

  Collapsible content section. Works in two modes:

  **Group** — pass the `accordion` prop (the AccordionState from Accordion's
  `children(accordion)` snippet); the group decides which items are open.
  **Solo** — no `accordion` prop: manages its own state via bind:expanded.

  @example Group (inside Accordion)
  <Accordion>
    {#snippet children(accordion)}
      <AccordionItem {accordion} title="Section 1">Content</AccordionItem>
      <AccordionItem {accordion} title="Section 2" badge="5">Content</AccordionItem>
    {/snippet}
  </Accordion>

  @example Solo (standalone)
  <AccordionItem title="Settings" bind:expanded={open}>
    Content here
  </AccordionItem>

  @example Custom indicator icon
  <AccordionItem title="Details">
    {#snippet indicator(open)}<Plus size={14} class={open ? 'rotate-45' : ''} />{/snippet}
    Content here
  </AccordionItem>

  @example With leading/trailing snippets
  <AccordionItem title="Infrastructure">
    {#snippet leading()}<Activity size={14} />{/snippet}
    {#snippet trailing()}<Badge variant="success">OK</Badge>{/snippet}
    Content here
  </AccordionItem>

  @example Quiet secondary disclosure (opt-in)
  <AccordionItem title="Edit attributes" size="sm" tone="quiet">…</AccordionItem>

  @example Meta line (opt-in) — a reply's folded lookups
  <AccordionItem title="Thought 4 s · 3 lookups" size="sm" tone="meta" flush>…</AccordionItem>

  @example Flush (opt-in) — the trigger and body keep the parent's left reading line, no fill
  <AccordionItem title="Filters · 3 set" size="sm" tone="quiet" flush>…</AccordionItem>

  @example Meta (interactive content right of the title, outside the trigger button) + small
  <AccordionItem title="Competition" size="sm">
    {#snippet meta()}<Badge onremove={clear}>≤ 20 sellers</Badge>{/snippet}
    Content here
  </AccordionItem>
-->
<script>
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let {
    /** AccordionState from Accordion's `children(accordion)` snippet; omit for a solo item. */
    accordion = null,
    id,
    title = '',
    expanded: expandedProp = $bindable(false),
    disabled = false,
    badge = null,
    ontoggle = null,
    leading,
    trailing,
    indicator,
    meta,
    size = 'md',
    /** 'default' | 'quiet' | 'meta' — quiet: a secondary disclosure, dense 500-weight base05 title, 12px chevron; meta: a 12px/400 meta line (`--accordion-meta-color`, else base04) that reads as a note, not a heading (opt-in). */
    tone = 'default',
    /** Flush (opt-in): no inline padding and no fill on trigger and body — the item keeps its container's left edge. */
    flush = false,
    children,
    class: className = '',
    ...rest
  } = $props();

  const uid = $props.id();
  const itemId = $derived(id || `acc-${uid}`);
  const inGroup = $derived(!!accordion);

  const isOpen = $derived(inGroup ? accordion.isExpanded(itemId) : expandedProp);

  function handleClick() {
    if (disabled) return;
    const wasOpen = isOpen;
    if (inGroup) {
      accordion.toggle(itemId);
    } else {
      expandedProp = !expandedProp;
    }
    ontoggle?.(!wasOpen);
  }
</script>

{#snippet trigger()}
  <button
    type="button"
    id="trigger-{itemId}"
    class="accordion-trigger"
    class:accordion-trigger-open={isOpen}
    aria-expanded={isOpen}
    aria-controls="content-{itemId}"
    {disabled}
    onclick={handleClick}
  >
    {#if leading}{@render leading()}{/if}
    <span class="accordion-title">{title}</span>
    {#if badge != null}
      <span class="accordion-badge">{badge}</span>
    {/if}
    {#if trailing}{@render trailing()}{/if}
    <span class="accordion-indicator" class:accordion-indicator-open={isOpen}>
      {#if indicator}
        {@render indicator(isOpen)}
      {:else}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      {/if}
    </span>
  </button>
{/snippet}

<div
  class="accordion-item {className}"
  class:accordion-item-solo={!inGroup}
  class:accordion-item-disabled={disabled}
  class:accordion-item-sm={size === 'sm'}
  class:accordion-item-quiet={tone === 'quiet' || tone === 'meta'}
  class:accordion-item-meta={tone === 'meta'}
  class:accordion-item-flush={flush}
  {...rest}
>
  {#if meta}
    <div class="accordion-header">
      {@render trigger()}
      <div class="accordion-meta">{@render meta()}</div>
    </div>
  {:else}
    {@render trigger()}
  {/if}

  {#if isOpen}
    <div
      id="content-{itemId}"
      class="accordion-content"
      role="region"
      aria-labelledby="trigger-{itemId}"
      transition:slide={{ duration: 200, easing: cubicOut }}
    >
      <div class="accordion-body">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Header with meta: the trigger and the meta side by side; meta is never inside the button. */
  .accordion-header {
    display: flex;
    align-items: center;
    gap: var(--space-4, 0.5rem);
    min-width: 0;
  }

  .accordion-header > .accordion-trigger {
    flex: 1 1 auto;
    min-width: 0;
    width: auto;
  }

  .accordion-meta {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    gap: var(--space-2, 0.25rem);
    min-width: 0;
    overflow: hidden;
  }

  /* Small: a 32px transparent row, chevron first, no fill, no clipping (tooltips may overhang). */
  .accordion-item-sm,
  .accordion-item-sm.accordion-item-solo {
    overflow: visible;
    background: transparent;
    border-bottom: none;
  }

  .accordion-item-sm .accordion-trigger {
    height: 2rem;
    padding: 0;
    gap: var(--space-2, 0.25rem);
    background: transparent;
    font-size: var(--text-sm);
  }

  .accordion-item-sm .accordion-trigger:hover:not(:disabled),
  .accordion-item-sm .accordion-trigger-open {
    background: transparent;
  }

  .accordion-item-sm .accordion-indicator {
    order: -1;
    transform: rotate(-90deg);
  }

  .accordion-item-sm .accordion-trigger:hover:not(:disabled) .accordion-indicator {
    transform: rotate(-90deg);
  }

  .accordion-item-sm .accordion-indicator-open,
  .accordion-item-sm .accordion-trigger:hover:not(:disabled) .accordion-indicator-open {
    transform: none;
  }

  .accordion-item-sm > .accordion-content {
    background: transparent;
    border-bottom: none;
  }

  .accordion-item-sm .accordion-body {
    padding: var(--space-2, 0.25rem) 0 0;
    font-size: inherit;
    color: inherit;
    line-height: inherit;
  }

  /* Quiet tone (opt-in): a secondary disclosure that never outweighs a card title. */
  .accordion-item-quiet .accordion-trigger {
    height: auto;
    padding: var(--space-1) 0;
    font-size: var(--text-dense, var(--text-xs));
    font-weight: var(--font-weight-medium);
    color: var(--color-base05);
  }

  /* Meta tone (opt-in): the fold is a note line — 12px, regular, meta colour. */
  .accordion-item-meta .accordion-trigger,
  .accordion-item-meta .accordion-trigger:hover:not(:disabled) {
    font-size: var(--text-xs);
    font-weight: var(--font-weight-normal);
    color: var(--accordion-meta-color, var(--color-base04));
  }

  .accordion-item-meta .accordion-trigger:hover:not(:disabled) .accordion-title {
    color: var(--color-base06);
  }

  .accordion-item-meta .accordion-indicator {
    color: inherit;
  }

  .accordion-item-quiet .accordion-indicator :global(svg) {
    width: 12px;
    height: 12px;
  }

  /* Flush (opt-in): the container's reading line, no fill, no inline inset. */
  .accordion-item-flush,
  .accordion-item-flush.accordion-item-solo,
  .accordion-item-flush > .accordion-content {
    background: transparent;
    border-bottom: none;
    border-radius: 0;
    overflow: visible;
  }

  .accordion-item-flush .accordion-trigger,
  .accordion-item-flush .accordion-trigger:hover:not(:disabled),
  .accordion-item-flush .accordion-trigger-open {
    padding-inline: 0;
    background: transparent;
  }

  .accordion-item-flush .accordion-body {
    padding: var(--space-2, 0.25rem) 0 0;
  }

  /* Item container */
  .accordion-item {
    border-bottom: 1px solid var(--color-base02);
  }

  .accordion-item:last-child {
    border-bottom: none;
  }

  .accordion-item-solo {
    border-radius: var(--radius-default);
    overflow: hidden;
    background: color-mix(in srgb, var(--color-base01) 60%, transparent);
    border-bottom: none;
  }

  .accordion-item-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Trigger / header */
  .accordion-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    height: 2.75rem;
    padding: 0 1rem;
    background: color-mix(in srgb, var(--color-base00) 50%, transparent);
    border: none;
    font-family: inherit;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base06);
    cursor: pointer;
    text-align: left;
    transition: background var(--duration-fast) ease;
  }

  .accordion-trigger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
  }

  .accordion-trigger-open {
    background: color-mix(in srgb, var(--color-base00) 90%, transparent);
  }

  .accordion-trigger:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  /* Title */
  .accordion-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Badge */
  .accordion-badge {
    flex-shrink: 0;
    padding: 0.0625rem 0.375rem;
    font-size: var(--text-2xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base04);
    background: color-mix(in srgb, var(--color-base04) 10%, transparent);
    border-radius: var(--radius-default);
  }

  /* Indicator (chevron wrapper) */
  .accordion-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-base05);
    transition: transform var(--duration-base) ease;
  }

  .accordion-trigger:hover:not(:disabled) .accordion-indicator {
    color: var(--color-base06);
    transform: scale(1.125);
  }

  .accordion-indicator-open {
    transform: rotate(180deg);
  }

  .accordion-trigger:hover:not(:disabled) .accordion-indicator-open {
    transform: rotate(180deg) scale(1.125);
  }

  /* Content */
  .accordion-content {
    background: var(--color-base01);
    border-bottom: 1px solid var(--color-base02);
  }

  .accordion-item:last-child .accordion-content {
    border-bottom: none;
  }

  .accordion-body {
    padding: 1rem;
    font-size: var(--text-sm);
    color: var(--color-base05);
    line-height: 1.6;
  }
</style>
