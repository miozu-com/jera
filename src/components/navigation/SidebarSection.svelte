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
  import { fade } from 'svelte/transition';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    title = '',
    class: className = '',
    children
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);
</script>

<div class="sidebar-section {className}">
  {#if title}
    {#if !isCollapsed}
      <div class="section-header" transition:fade={{ duration: 150 }}>
        {title}
      </div>
    {:else}
      <div class="section-divider"></div>
    {/if}
  {/if}

  <ul class="nav-list">
    {@render children?.()}
  </ul>
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
