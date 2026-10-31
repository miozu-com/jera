<!--
  @component LeftBarPopover

  Hover popover for collapsed LeftBar showing subroutes.
  Same surface and row metrics as NavBar's menus.

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
  <!-- svelte-ignore a11y_no_static_element_interactions -->
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
              <ItemIcon size={14} class="popover-icon" />
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
  /* Same surface and rows as the top bar's menus and the account menu:
     base00, base02 hairline, radius-md, shadow-lg; xs rows on base01 hover. */
  .hover-popover {
    position: fixed;
    z-index: 50;
    background-color: var(--color-base00);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    max-width: 280px;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: no-preference) {
    .hover-popover {
      animation: popover-appear 120ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popover-appear {
      from { opacity: 0; transform: translateX(-4px); }
      to { opacity: 1; transform: translateX(0); }
    }
  }

  .popover-header {
    padding: var(--space-3) var(--space-6) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-base04);
    border-bottom: var(--border-width-thin) solid var(--color-base02);
  }

  .popover-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-2);
    list-style: none;
    margin: 0;
  }

  .popover-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-default);
    font-size: var(--text-xs);
    color: var(--color-base05);
    transition: var(--transition-colors);
    cursor: pointer;
    text-decoration: none;
  }

  .popover-item:hover,
  .popover-item:focus-visible {
    background-color: var(--color-base01);
    color: var(--color-base06);
    outline: none;
  }

  .popover-item :global(svg.popover-icon) {
    flex-shrink: 0;
    color: var(--color-base04);
  }

  .popover-item:hover :global(svg.popover-icon) {
    color: var(--color-base05);
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
