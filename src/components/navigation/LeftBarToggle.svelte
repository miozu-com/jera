<!--
  @component LeftBarToggle

  Collapse/expand toggle button for LeftBar.
  Exact 1:1 match with admin.selify.ai AdminSidebar collapse-toggle styles.

  @example
  {#snippet footer(bar)}
    <LeftBarToggle {bar} />
  {/snippet}
-->
<script>
  import { requireInstance } from '../../utils/requireInstance.js';

  let {
    /** The LeftBarState from LeftBar's snippet argument (required). */
    bar = null,
    class: className = '',
    /** Runs before the toggle; call `event.preventDefault()` to skip it. */
    onclick = undefined,
    ...rest
  } = $props();

  function handleClick(event) {
    onclick?.(event);
    if (!event.defaultPrevented) bar.toggle();
  }

  const wired = $derived(requireInstance(bar, 'LeftBarToggle', 'bar', 'LeftBar', 'footer'));
  const isCollapsed = $derived(bar?.collapsed ?? false);
  const label = $derived(isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
</script>

{#if wired}
<button
  type="button"
  class="collapse-toggle {className}"
  onclick={handleClick}
  title={label}
  aria-label={label}
  {...rest}
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
{/if}

<style>
  .collapse-toggle {
    width: 100%;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base04);
    border-radius: var(--radius-default);
    transition: all var(--duration-fast);
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  .collapse-toggle:hover {
    color: var(--color-base06);
    background-color: var(--color-base01);
  }

  .collapse-toggle :global(svg) {
    flex-shrink: 0;
  }
</style>
