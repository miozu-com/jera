<!--
  @component SidebarToggle

  Toggle button for collapsing/expanding the sidebar.
  Automatically gets collapsed state from Sidebar context.

  @example
  <Sidebar bind:collapsed>
    ...
    {#snippet footer()}
      <SidebarToggle />
    {/snippet}
  </Sidebar>

  @example With custom styling
  <SidebarToggle class="my-custom-toggle" />
-->
<script>
  import { getContext } from 'svelte';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  function handleClick() {
    sidebar?.toggle?.();
  }
</script>

<button
  type="button"
  class="sidebar-toggle {className}"
  onclick={handleClick}
  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  aria-expanded={!isCollapsed}
>
  <svg
    class="toggle-icon"
    class:collapsed={isCollapsed}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m15 18-6-6 6-6"></path>
  </svg>
</button>

<style>
  .sidebar-toggle {
    width: 100%;
    padding: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .sidebar-toggle:hover {
    color: var(--color-text, var(--color-base06, #F3F4F7));
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
  }

  .toggle-icon {
    transition: transform 200ms ease;
  }

  .toggle-icon.collapsed {
    transform: rotate(180deg);
  }
</style>
