<!--
  @component SidebarPopover

  Hover popover for collapsed sidebar state.
  Shows navigation items when hovering over collapsed groups.

  @example
  <SidebarPopover
    title="Settings"
    items={[
      { href: '/settings/general', label: 'General' },
      { href: '/settings/security', label: 'Security' }
    ]}
    position={{ top: 100, left: 68 }}
    visible={true}
    onmouseenter={keepOpen}
    onmouseleave={hidePopover}
  />
-->
<script>
  let {
    title = '',
    items = [],
    position = { top: 0, left: 0 },
    visible = false,
    onmouseenter = null,
    onmouseleave = null,
    class: className = ''
  } = $props();
</script>

{#if visible}
  <div
    class="sidebar-popover {className}"
    style="top: {position.top}px; left: {position.left}px;"
    onmouseenter={onmouseenter}
    onmouseleave={onmouseleave}
    role="menu"
    aria-label={title}
  >
    {#if title}
      <div class="popover-header">
        {title}
      </div>
    {/if}
    <ul class="popover-list">
      {#each items as item}
        <li role="menuitem">
          {#if item.href}
            <a href={item.href} class="popover-item">
              {item.label}
            </a>
          {:else if item.onclick}
            <button type="button" class="popover-item" onclick={item.onclick}>
              {item.label}
            </button>
          {:else}
            <span class="popover-item disabled">
              {item.label}
            </span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .sidebar-popover {
    position: fixed;
    z-index: 50;
    background-color: var(--color-bg, var(--color-base00, #232733));
    border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    border-radius: 0.5rem;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
    font-weight: 600;
    color: var(--color-text, var(--color-base06, #F3F4F7));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 20%, transparent);
    background-color: color-mix(in srgb, var(--color-surface, var(--color-base01, #2C3040)) 50%, transparent);
  }

  .popover-list {
    padding: 0.25rem 0;
    margin: 0;
    list-style: none;
  }

  .popover-list li {
    list-style: none;
  }

  .popover-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text, var(--color-base06, #F3F4F7));
    text-decoration: none;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 150ms ease;
    font-family: inherit;
  }

  .popover-item:hover {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }

  .popover-item:active {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 15%, transparent);
  }

  .popover-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
