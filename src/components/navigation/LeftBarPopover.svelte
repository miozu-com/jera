<!--
  @component LeftBarPopover

  Hover popover for collapsed LeftBar showing subroutes.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar hover-popover styles.

  @example
  <LeftBarPopover
    visible={hoverPopover.item === 'services'}
    position={hoverPopover.position}
    title="Services"
    items={[
      { label: 'Overview', href: '/services' },
      { label: 'Errors', href: '/errors' }
    ]}
  />
-->
<script>
  import { getContext } from 'svelte';

  let {
    visible = false,
    position = { top: 0, left: 0 },
    title = '',
    items = [],
    class: className = ''
  } = $props();

  const leftbar = getContext('leftbar');

  function handleMouseEnter() {
    leftbar?.keepPopoverOpen?.();
  }

  function handleMouseLeave() {
    leftbar?.hidePopover?.();
  }
</script>

{#if visible && items.length > 0}
  <div
    class="hover-popover {className}"
    style="top: {position.top}px; left: {position.left}px;"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <div class="popover-header">
      {title}
    </div>
    <ul class="popover-list">
      {#each items as item}
        <li>
          <a href={item.href} class="popover-item">
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .hover-popover {
    position: fixed;
    z-index: 50;
    background-color: var(--color-base00);
    border: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    min-width: 200px;
    max-width: 280px;
    overflow: hidden;
    animation: popover-appear 0.15s ease-out;
  }

  @keyframes popover-appear {
    from {
      opacity: 0;
      transform: translateX(-8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .popover-header {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 600;
    color: var(--color-base06);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03) 20%, transparent);
    background-color: color-mix(in srgb, var(--color-base01) 50%, transparent);
  }

  .popover-list {
    padding: 0.25rem 0;
    list-style: none;
    margin: 0;
  }

  .popover-item {
    display: block;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--color-base06);
    transition: all 150ms;
    cursor: pointer;
    text-decoration: none;
  }

  .popover-item:hover {
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
  }

  .popover-item:active {
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
  }
</style>
