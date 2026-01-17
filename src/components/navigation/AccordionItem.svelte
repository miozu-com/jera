<!--
  @component AccordionItem

  Individual accordion section. Must be used inside Accordion.

  @example
  <AccordionItem id="section-1" title="Click to expand">
    Hidden content here
  </AccordionItem>
-->
<script>
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';

  let {
    id,
    title = '',
    disabled = false,
    children,
    class: className = ''
  } = $props();

  const accordion = getContext('accordion');

  // Generate id if not provided
  const itemId = id || `accordion-${Math.random().toString(36).slice(2, 9)}`;

  const isOpen = $derived(accordion?.isExpanded(itemId) ?? false);

  function handleClick() {
    if (!disabled && accordion) {
      accordion.toggle(itemId);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<div class="accordion-item {className}" class:accordion-item-disabled={disabled}>
  <button
    type="button"
    class="accordion-trigger"
    class:accordion-trigger-open={isOpen}
    aria-expanded={isOpen}
    aria-controls="content-{itemId}"
    aria-disabled={disabled}
    onclick={handleClick}
    onkeydown={handleKeydown}
  >
    <span class="accordion-title">{title}</span>
    <svg
      class="accordion-icon"
      class:accordion-icon-open={isOpen}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if isOpen}
    <div
      id="content-{itemId}"
      class="accordion-content"
      transition:slide={{ duration: 200 }}
    >
      <div class="accordion-body">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style>
  .accordion-item {
    border-bottom: 1px solid var(--color-base03);
  }

  .accordion-item:last-child {
    border-bottom: none;
  }

  .accordion-item-disabled {
    opacity: 0.5;
  }

  .accordion-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: none;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-base07);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;
  }

  .accordion-trigger:hover:not([aria-disabled="true"]) {
    background: var(--color-base01);
  }

  .accordion-trigger-open {
    background: var(--color-base01);
  }

  .accordion-title {
    flex: 1;
  }

  .accordion-icon {
    flex-shrink: 0;
    color: var(--color-base05);
    transition: transform 0.2s ease;
  }

  .accordion-icon-open {
    transform: rotate(180deg);
  }

  .accordion-content {
    overflow: hidden;
  }

  .accordion-body {
    padding: 0 1rem 1rem 1rem;
    font-size: 0.875rem;
    color: var(--color-base05);
    line-height: 1.6;
  }
</style>
