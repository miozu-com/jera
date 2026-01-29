<!--
  @component LeftBarToggle

  Collapse/expand toggle button for LeftBar.
  Exact 1:1 match with admin.selify.ai AdminSidebar collapse-toggle styles.

  @example
  <LeftBarToggle />
-->
<script>
  import { getContext } from 'svelte';

  let {
    class: className = ''
  } = $props();

  const leftbar = getContext('leftbar');
  const isCollapsed = $derived(leftbar?.collapsed ?? false);

  function handleClick() {
    leftbar?.toggle?.();
  }
</script>

<button
  class="collapse-toggle {className}"
  onclick={handleClick}
  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
>
  {#if isCollapsed}
    <!-- ChevronRight -->
    <svg
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
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  {:else}
    <!-- ChevronLeft -->
    <svg
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
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  {/if}
</button>

<style>
  .collapse-toggle {
    width: 100%;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base04);
    border-radius: 0.25rem;
    transition: all 150ms;
    background: transparent;
    border: none;
    cursor: pointer;
    font: inherit;
  }

  .collapse-toggle:hover {
    color: var(--color-base06);
    background-color: var(--color-base01);
  }

  .collapse-toggle :global(svg) {
    flex-shrink: 0;
  }
</style>
