<!--
  @component LeftBarPopover

  Hover popover for collapsed LeftBar showing subroutes.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar hover-popover styles.

  LeftBar renders it itself (from `popoverMap`) and passes its `bar`; the
  flyout uses it to stay open while hovered.

  @example
  <LeftBarPopover
    {bar}
    visible={hoverPopover.item === 'services'}
    position={hoverPopover.position}
    title="Services"
    items={[
      { label: 'Overview', href: '/services' },
      { label: 'Errors', href: '/errors' }
    ]}
  />

  Items take the same optional fields as LeftBarItem's subroutes: `icon`
  (component, 16px, base04), `badge` (a count), `badgeLabel` (what it counts:
  the item's title and part of its accessible name, r6), `variant` ('warning' |
  'danger' | 'success') and `divider` (marks the attention item; since r5 no extra space, no rule).
-->
<script>
  import { requireInstance } from '../../utils/requireInstance.js';

  let {
    /** The owning LeftBarState (required): hovering the flyout keeps it open. */
    bar = null,
    visible = false,
    position = { top: 0, left: 0 },
    title = '',
    items = [],
    class: className = ''
  } = $props();

  const wired = $derived(requireInstance(bar, 'LeftBarPopover', 'bar', 'LeftBar', 'navigation'));

  function handleMouseEnter() {
    bar.keepPopoverOpen();
  }

  function handleMouseLeave() {
    bar.hidePopover();
  }
</script>

{#if wired && visible && items.length > 0}
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
        {@const ItemIcon = item.icon ?? null}
        {@const hint = item.badge != null && item.badge !== '' && item.badgeLabel ? item.badgeLabel : null}
        <li class:divided={item.divider}>
          <a
            href={item.href}
            class="popover-item"
            data-variant={item.variant ?? undefined}
            title={hint ?? undefined}
            aria-label={hint ? `${item.label}, ${hint}` : undefined}
          >
            {#if ItemIcon}
              <ItemIcon size={16} class="popover-icon" />
            {/if}
            <span class="popover-label">{item.label}</span>
            {#if item.badge != null && item.badge !== ''}
              <span class="popover-badge">{item.badge}</span>
            {/if}
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
    border: var(--border-width-default) solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    border-radius: var(--radius-default);
    box-shadow: var(--shadow-2xl);
    min-width: 200px;
    max-width: 280px;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: no-preference) {
    .popover-content {
      animation: popover-appear 0.15s ease-out;
    }

    @keyframes popover-appear {
      from { opacity: 0; transform: translateX(-8px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
  }

  .popover-header {
    padding: 0.5rem 1rem;
    font-size: var(--text-xs);
    line-height: 1rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-base06);
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03) 20%, transparent);
    background-color: color-mix(in srgb, var(--color-base01) 50%, transparent);
  }

  .popover-list {
    padding: 0.25rem 0;
    list-style: none;
    margin: 0;
  }

  .popover-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: var(--text-sm);
    line-height: 1.25rem;
    color: var(--color-base06);
    transition: all var(--duration-fast);
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

  .popover-item :global(svg.popover-icon) {
    flex-shrink: 0;
    color: var(--color-base04);
  }

  .popover-item:hover :global(svg.popover-icon) {
    color: currentColor;
  }

  .popover-label {
    flex: 1;
    min-width: 0;
  }

  .popover-badge {
    flex-shrink: 0;
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color-base04);
  }

  .popover-item[data-variant="warning"],
  .popover-item[data-variant="warning"] .popover-badge,
  .popover-item[data-variant="warning"] :global(svg.popover-icon) {
    color: var(--color-base0A);
  }

  .popover-item[data-variant="warning"]:hover {
    background-color: color-mix(in srgb, var(--color-base0A) 10%, transparent);
  }

  .popover-item[data-variant="danger"],
  .popover-item[data-variant="danger"] .popover-badge,
  .popover-item[data-variant="danger"] :global(svg.popover-icon) {
    color: var(--color-base08);
  }

  .popover-item[data-variant="danger"]:hover {
    background-color: color-mix(in srgb, var(--color-base08) 10%, transparent);
  }

  .popover-item[data-variant="success"],
  .popover-item[data-variant="success"] .popover-badge,
  .popover-item[data-variant="success"] :global(svg.popover-icon) {
    color: var(--color-base0B);
  }

  .popover-item[data-variant="success"]:hover {
    background-color: color-mix(in srgb, var(--color-base0B) 10%, transparent);
  }
</style>
