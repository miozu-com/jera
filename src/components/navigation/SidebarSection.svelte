<!--
  @component SidebarSection

  Grouped section within sidebar with optional title.
  Shows title when expanded, shows divider when collapsed.

  @example
  <SidebarSection title="Management">
    <SidebarItem href="/settings" icon={Settings} label="Settings" />
    <SidebarItem href="/billing" icon={CreditCard} label="Billing" />
  </SidebarSection>
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    title = '',
    count = null,
    expandable = false,
    expanded = $bindable(true),
    class: className = '',
    children
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  function toggleExpanded() {
    if (expandable) {
      expanded = !expanded;
    }
  }
</script>

<div class="sidebar-section {className}">
  {#if title}
    {#if !isCollapsed}
      {#if expandable}
        <button
          class="section-header expandable"
          onclick={toggleExpanded}
          aria-expanded={expanded}
          transition:fade={{ duration: 150 }}
        >
          <span class="section-title">{title}</span>
          {#if count !== null}
            <span class="section-count">{count}</span>
          {/if}
          <svg
            class="section-chevron {expanded ? 'rotate-180' : ''}"
            xmlns="http://www.w3.org/2000/svg"
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
        </button>
      {:else}
        <div class="section-header" transition:fade={{ duration: 150 }}>
          <span class="section-title">{title}</span>
          {#if count !== null}
            <span class="section-count">{count}</span>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="section-divider"></div>
    {/if}
  {/if}

  {#if !expandable || expanded}
    <ul class="nav-list" transition:slide={{ duration: 200, easing: cubicOut }}>
      {@render children?.()}
    </ul>
  {/if}
</div>

<style>
  .sidebar-section {
    padding: 0;
  }

  .section-header {
    padding: 0.25rem 0.75rem;
    margin-bottom: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-header.expandable {
    cursor: pointer;
    transition: all 200ms ease;
    border: none;
    background: transparent;
    font-family: inherit;
    width: 100%;
    justify-content: flex-start;
  }

  .section-header.expandable:hover {
    color: var(--color-text, var(--color-base06, #F3F4F7));
  }

  .section-title {
    flex: 1;
    text-align: left;
  }

  .section-count {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .section-chevron {
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    transition: all 200ms ease;
    flex-shrink: 0;
  }

  .section-chevron.rotate-180 {
    transform: rotate(180deg);
  }

  .section-divider {
    margin: 0.5rem 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
