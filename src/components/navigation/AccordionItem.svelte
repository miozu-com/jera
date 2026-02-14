<!--
  @component AccordionItem

  Collapsible content section. Works in two modes:

  **Group** — inside an <Accordion>, state is managed by the parent context.
  **Solo** — standalone, manages its own state via bind:expanded.

  @example Group (inside Accordion)
  <Accordion>
    <AccordionItem title="Section 1">Content</AccordionItem>
    <AccordionItem title="Section 2" badge="5">Content</AccordionItem>
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
-->
<script>
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let {
    id,
    title = '',
    expanded: expandedProp = $bindable(false),
    disabled = false,
    badge = null,
    leading,
    trailing,
    indicator,
    children,
    class: className = '',
    ...rest
  } = $props();

  const accordion = getContext('accordion');
  const itemId = id || `acc-${Math.random().toString(36).slice(2, 9)}`;
  const inGroup = !!accordion;

  const isOpen = $derived(
    inGroup ? (accordion.isExpanded(itemId) ?? false) : expandedProp
  );

  function handleClick() {
    if (disabled) return;
    if (inGroup) {
      accordion.toggle(itemId);
    } else {
      expandedProp = !expandedProp;
    }
  }
</script>

<div
  class="accordion-item {className}"
  class:accordion-item-solo={!inGroup}
  class:accordion-item-disabled={disabled}
  {...rest}
>
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
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-base06);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;
  }

  .accordion-trigger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
  }

  .accordion-trigger-open {
    background: color-mix(in srgb, var(--color-base00) 90%, transparent);
  }

  .accordion-trigger:focus-visible {
    outline: 2px solid var(--color-base0D);
    outline-offset: -2px;
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
    font-size: 0.6875rem;
    font-weight: 600;
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
    transition: transform 0.2s ease;
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
    font-size: 0.875rem;
    color: var(--color-base05);
    line-height: 1.6;
  }
</style>
