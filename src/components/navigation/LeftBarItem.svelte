<!-- file-size: justified -- one nav item in four element shapes (link, split link + toggle, expandable, button) sharing one badge/dot/variant style sheet; the CSS is the long part. -->
<!--
  @component LeftBarItem

  A navigation item within LeftBar.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar nav-item styles.

  Takes the owning LeftBarState as the `bar` prop (required) — LeftBar hands
  it to its snippets: `{#snippet navigation(bar)} <LeftBarItem {bar} … />`.
  Every example below omits `{bar}` for brevity.

  @example Basic
  <LeftBarItem href="/dashboard" icon={Home} label="Dashboard" active={isActive('/dashboard')} />

  @example Expandable with subroutes
  <LeftBarItem
    label="Services"
    icon={Server}
    expandable
    bind:expanded={servicesExpanded}
    subroutes={[
      { label: 'Overview', href: '/services' },
      { label: 'Errors', href: '/errors' }
    ]}
  />

  @example Split: the name is a link, the chevron folds (expandable + href)
  <LeftBarItem
    href="/agents/atlas"
    label="Atlas"
    expandable
    bind:expanded={atlasExpanded}
    active={onAtlas && !onAtlasChild}
    subroutes={[{ label: 'Needs fixing', href: '/agents/atlas/fix' }]}
  />
  Renders a segmented pair: an <a> (leading/icon, label, badge) and a
  sibling chevron <button aria-expanded aria-controls> that never navigates,
  both full row height, sharing the row's outer radius, no visible separator
  between them (spacing only). Hover and active tint the whole row as one
  shape (r12); colour and focus ring are per segment. `expandable`
  without `href` keeps the button-only shape.

  @example Sub-route icons, counts and an attention row (r9)
  <LeftBarItem
    href="/agents/genji"
    label="Genji"
    expandable
    subroutes={[
      { label: 'Pipeline', href: '/agents/genji/pipeline', icon: Workflow },
      { label: 'Needs you', href: '/agents/genji/console', icon: BellRing,
        badge: 3, variant: 'warning', divider: true }
    ]}
  />
  A sub-route takes an optional `icon` (component, 16px, base04), `badge`
  (a count, in the row's colour), `badgeLabel` (what the count means, e.g.
  "17 products need fixing": the row's hover title and part of its accessible
  name, so focus reads it too), `variant` ('warning' | 'danger' | 'success',
  the item variants' colours) and `divider` (marks the attention row with a
  `divided` class; since r11 it adds no space and no rule — the row keeps the
  same gap as its siblings and stands out by colour and icon only).
  Without a `variant` the count is quiet: a muted number, not a chip — a data
  count on the row it describes; a `variant` row is a call to act.

  @example A quiet data count and a decisions row (r13)
  <LeftBarItem
    href="/agents/atlas"
    label="Atlas"
    expandable
    badge={expanded ? null : 7}
    badgeColor="yellow"
    badgeLabel="7 decisions waiting"
    subroutes={[
      { label: 'Catalog', href: '/agents/atlas/catalog', badge: 17,
        badgeLabel: '17 products need fixing' },
      { label: 'Needs you', href: '/agents/atlas?needs=1', badge: 7,
        badgeLabel: '7 decisions waiting', variant: 'warning', divider: true }
    ]}
  />
  `badgeLabel` on the item names its own `badge` the same way (title +
  accessible name of the link).
-->
<script>
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Badge from '../primitives/Badge.svelte';
  import { badgeVariant as variantFor } from '../../utils/badge.js';
  import { requireInstance } from '../../utils/requireInstance.js';

  let {
    /** The LeftBarState from LeftBar's snippet argument (required). */
    bar = null,
    href = null,
    label = '',
    icon: Icon = null,
    active = false,
    expandable = false,
    expanded = $bindable(false),
    subroutes = [],
    badge = null,
    // blue|green|yellow|purple|red. A colored badge is a status marker: it
    // also earns a dot on the icon when the bar is collapsed.
    badgeColor = null,
    // What the badge means ("7 decisions waiting"): hover title + accessible name.
    badgeLabel = null,
    preload = true,
    variant = 'default',
    onclick = null,
    isActiveRoute = () => false,
    // Split rows only: the chevron's accessible name.
    toggleLabel = null,
    class: className = '',
    leading,
    trailing,
    children
  } = $props();

  // Preload attribute for SvelteKit
  const preloadAttr = $derived(preload ? 'hover' : undefined);

  // expandable + href: the name navigates, a sibling button folds.
  const split = $derived(expandable && !!href);
  const uid = $props.id();
  const subnavId = `${uid}-subnav`;

  const wired = $derived(requireInstance(bar, 'LeftBarItem', 'bar', 'LeftBar', 'navigation'));
  const isCollapsed = $derived(bar?.collapsed ?? false);

  // No color = plain count badge → neutral info chip.
  const badgeVariant = $derived(variantFor(badgeColor));
  const statusDot = $derived(isCollapsed && badge != null && !!badgeColor);
  // Collapsed, the item has no visible text: name it explicitly (tooltip + AT),
  // status included. Expanded, the label and badge text name it.
  const collapsedTitle = $derived(
    isCollapsed ? (statusDot ? `${label} (${badgeLabel ?? badge})` : label) : null
  );
  // Expanded, a badge with a meaning names it: the hover title, and the link's
  // accessible name (label + meaning, instead of a bare number).
  const badgeHint = $derived(!isCollapsed && badge != null && badgeLabel ? badgeLabel : null);
  const itemTitle = $derived(collapsedTitle ?? badgeHint);
  const itemName = $derived(collapsedTitle ?? (badgeHint ? `${label}, ${badgeHint}` : null));

  /** A sub-route's hint, when its count is drawn and says what it counts. */
  const routeHint = route =>
    route.badge != null && route.badge !== '' && route.badgeLabel ? route.badgeLabel : null;

  function handleClick(e) {
    if (expandable) {
      e.preventDefault();
      expanded = !expanded;
    }
    onclick?.(e);
  }

  function toggle() {
    expanded = !expanded;
  }

  function handleMouseEnter(e) {
    if (expandable) {
      bar.showPopover(label, e);
    }
  }

  function handleMouseLeave() {
    bar.hidePopover();
  }
</script>

<!-- Shared by the three element shapes below: icon (+ collapsed status dot),
     then label, badge and the consumer's trailing snippet. -->
{#snippet head()}
  {@render leading?.()}
  {#if Icon}
    <Icon size={18} class="nav-icon" />
  {/if}
  {#if statusDot}
    <span class="nav-status-dot" data-color={badgeColor} aria-hidden="true"></span>
  {/if}
{/snippet}

{#snippet tail()}
  {#if !isCollapsed}
    <span class="nav-label" transition:fade={{ duration: 150 }}>{label}</span>
    {#if badge != null}
      <span class="nav-badge-wrap" transition:fade={{ duration: 150 }}>
        <Badge size="xs" variant={badgeVariant}>{badge}</Badge>
      </span>
    {/if}
    {@render trailing?.()}
  {/if}
{/snippet}

{#snippet chevron()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="expand-icon"
    class:rotate-180={expanded}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
{/snippet}

{#snippet subnav(id)}
  {#if expanded && !isCollapsed && subroutes.length > 0}
    <ul {id} class="subnav-list" transition:slide={{ duration: 200, easing: cubicOut }}>
      {#each subroutes as route}
        {@const routeActive = isActiveRoute(route.href)}
        {@const RouteIcon = route.icon ?? null}
        {@const hint = routeHint(route)}
        <li class:divided={route.divider}>
          <a
            href={route.href}
            class="subnav-item"
            class:active={routeActive}
            data-variant={route.variant ?? undefined}
            aria-current={routeActive ? 'page' : undefined}
            title={hint ?? undefined}
            aria-label={hint ? `${route.label}, ${hint}` : undefined}
            data-sveltekit-preload-data={preloadAttr}
          >
            {#if RouteIcon}
              <RouteIcon size={16} class="subnav-icon" />
            {/if}
            <span class="subnav-label">{route.label}</span>
            {#if route.badge != null && route.badge !== ''}
              <span class="subnav-badge">{route.badge}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

{#if wired}
<li>
  {#if split}
    <div
      class="nav-item split {className}"
      class:active
      class:collapsed={isCollapsed}
      data-variant={variant}
    >
      <a
        {href}
        class="nav-link"
        aria-current={active ? 'page' : undefined}
        title={itemTitle}
        aria-label={itemName}
        data-sveltekit-preload-data={preloadAttr}
        onclick={e => onclick?.(e)}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
      >
        {@render head()}
        {@render tail()}
        {@render children?.()}
      </a>
      {#if !isCollapsed}
        <button
          type="button"
          class="nav-toggle"
          aria-expanded={expanded}
          aria-controls={subnavId}
          aria-label={toggleLabel ?? `Show ${label} pages`}
          onclick={toggle}
          transition:fade={{ duration: 150 }}
        >
          {@render chevron()}
        </button>
      {/if}
    </div>
    {@render subnav(subnavId)}
  {:else if href && !expandable}
    <a
      {href}
      class="nav-item {className}"
      class:active
      class:collapsed={isCollapsed}
      data-variant={variant}
      title={itemTitle}
      aria-label={itemName}
      data-sveltekit-preload-data={preloadAttr}
    >
      {@render head()}
      {@render tail()}
      {@render children?.()}
    </a>
  {:else if expandable}
    <button
      class="nav-item expandable {className}"
      class:collapsed={isCollapsed}
      data-variant={variant}
      onclick={handleClick}
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
      title={collapsedTitle}
      aria-label={collapsedTitle}
    >
      {@render head()}
      {@render tail()}
      {#if !isCollapsed}
        <span transition:fade={{ duration: 150 }}>
          {@render chevron()}
        </span>
      {/if}
      {@render children?.()}
    </button>
    {@render subnav(undefined)}
  {:else}
    <button
      class="nav-item {className}"
      class:active
      class:collapsed={isCollapsed}
      data-variant={variant}
      onclick={handleClick}
      title={collapsedTitle}
      aria-label={collapsedTitle}
    >
      {@render head()}
      {@render tail()}
      {@render children?.()}
    </button>
  {/if}
</li>
{/if}

<style>
  li {
    list-style: none;
  }

  .nav-item {
    /* What the item sits on — LeftBar's background, tinted on hover/active —
       so the collapsed status dot's cut-out ring matches it. */
    --nav-surface: var(--color-surface, var(--color-base01));
    --nav-ring: var(--nav-surface);
    width: calc(100% - 1rem);
    padding: 0.375rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    /* font-size and line-height MUST come after font-family to not be overwritten */
    font-family: inherit;
    font-size: var(--text-sm);
    line-height: 1.25rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-base06);
    cursor: pointer;
    border-radius: var(--radius-default);
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    transition: all var(--duration-fast);
    text-decoration: none;
    overflow: hidden;
    background: transparent;
    border: none;
    text-align: left;
    white-space: nowrap;
  }

  .nav-item:hover {
    --nav-ring: color-mix(in srgb, var(--color-base0D) 5%, var(--nav-surface));
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .nav-item.collapsed {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    width: calc(100% - 0.5rem);
    /* Anchor for the collapsed status dot. */
    position: relative;
  }

  .nav-item.active {
    --nav-ring: color-mix(in srgb, var(--color-base0D) 15%, var(--nav-surface));
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    color: var(--color-base0D);
    font-weight: var(--font-weight-medium);
  }

  /* Light mode: darken active text to meet WCAG AA 4.5:1 contrast */
  :global([data-theme="miozu-light"]) .nav-item.active {
    color: color-mix(in srgb, var(--color-base0D) 60%, black);
  }

  .nav-item.expandable {
    position: relative;
  }

  .nav-item.expandable:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  /* Split row: a segmented pair that reads as ONE row. The item is the frame
     (outer radius, clip) and carries the hover and active tints itself, so
     the name and the chevron are one --radius-default shape in every state —
     never a tinted name segment with a square edge beside a bare chevron,
     which read as a different radius from the plain rows (owner 2026-10-18).
     A segment only takes the accent colour on its own hover; its focus ring
     follows the frame's outer corners. No visible separator. */
  .nav-item.split {
    padding: 0;
    gap: 0;
    align-items: stretch;
    cursor: default;
  }

  .nav-item.split:hover {
    color: var(--color-base06);
  }

  /* The name segment's hover tints the whole row; the chevron's hover tints
     only its own segment (owner 2026-10-18). */
  .nav-item.split:has(.nav-link:hover) {
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .nav-item.split.active {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
  }

  .nav-item.split .nav-link:hover {
    color: var(--color-base0D);
  }

  .nav-link {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    color: inherit;
    text-decoration: none;
    position: relative;
    border-radius: var(--radius-default) 0 0 var(--radius-default);
    transition: color var(--duration-fast);
  }

  .nav-item.split.collapsed .nav-link {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .nav-link:focus-visible,
  .nav-toggle:focus-visible {
    outline: var(--border-width-default) solid var(--color-base0D);
    outline-offset: calc(-1 * var(--border-width-default));
  }

  .nav-toggle {
    flex-shrink: 0;
    align-self: stretch;
    display: grid;
    place-items: center;
    width: 1.75rem;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0 var(--radius-default) var(--radius-default) 0;
    background: transparent;
    color: var(--color-base05);
    cursor: pointer;
    transition: color var(--duration-fast);
  }

  .nav-toggle:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 8%, transparent);
  }

  .nav-toggle:hover .expand-icon {
    color: var(--color-base0D);
  }

  .nav-toggle .expand-icon {
    margin-left: 0;
  }

  .nav-item :global(svg.nav-icon) {
    flex-shrink: 0;
    transition: color var(--duration-fast);
  }

  .nav-item.expandable:hover :global(svg.nav-icon) {
    color: var(--color-base0D);
  }

  .nav-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Layout-only wrapper so the fade transition has an element to own; the
     chip itself is jera Badge (xs) — same radius/typography as every other
     badge in the app. */
  .nav-badge-wrap {
    display: inline-flex;
    flex-shrink: 0;
  }

  /* A nav count is a compact square chip: 1rem tall, at least as wide, one
     step smaller type than Badge xs (owner 2026-10-18). */
  .nav-badge-wrap :global(.jera-badge.jera-badge-xs) {
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.1875rem;
    justify-content: center;
    font-size: 0.625rem;
    line-height: 1;
  }

  /* Collapsed-bar status dot on the icon's top-right corner (18px icon). The
     ring is the item's own surface, so it cuts the dot out of the icon edge
     on a plain, hovered or active item alike. Count badges get no dot. */
  .nav-status-dot {
    position: absolute;
    top: calc(50% - 11px);
    left: calc(50% + 5px);
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background-color: var(--color-base0A);
    box-shadow: 0 0 0 2px var(--nav-ring);
    pointer-events: none;
  }

  .nav-status-dot[data-color='blue'] {
    background-color: var(--color-base0D);
  }

  .nav-status-dot[data-color='green'] {
    background-color: var(--color-base0B);
  }

  .nav-status-dot[data-color='purple'] {
    background-color: var(--color-base0E);
  }

  .nav-status-dot[data-color='red'] {
    background-color: var(--color-base08);
  }

  .expand-icon {
    color: var(--color-base05);
    flex-shrink: 0;
    margin-left: auto;
    transition: all var(--duration-base);
  }

  .nav-item.expandable:hover .expand-icon {
    color: var(--color-base0D);
  }

  .rotate-180 {
    transform: rotate(180deg);
  }

  /* Subnav */
  .subnav-list {
    margin-left: 1.75rem;
    margin-right: 0.5rem;
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
  }

  .subnav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--text-sm);
    line-height: 1.25rem;
    color: var(--color-base05);
    transition: all var(--duration-fast);
    width: 100%;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-default);
    text-decoration: none;
    white-space: nowrap;
  }

  .subnav-item :global(svg.subnav-icon) {
    flex-shrink: 0;
    color: var(--color-base04);
    transition: color var(--duration-fast);
  }

  .subnav-item:hover :global(svg.subnav-icon),
  .subnav-item.active :global(svg.subnav-icon) {
    color: currentColor;
  }

  .subnav-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subnav-badge {
    flex-shrink: 0;
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color-base04);
  }

  .subnav-item:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .subnav-item.active {
    color: var(--color-base0D);
    font-weight: var(--font-weight-medium);
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
  }

  /* Not on a variant row: a lit Needs you keeps its warning colour. */
  :global([data-theme="miozu-light"]) .subnav-item.active:not([data-variant]) {
    color: color-mix(in srgb, var(--color-base0D) 60%, black);
  }

  /* Sub-route variants: the item variants' colours, icon and count included. */
  .subnav-item[data-variant="warning"],
  .subnav-item[data-variant="warning"] .subnav-badge,
  .subnav-item[data-variant="warning"] :global(svg.subnav-icon) {
    color: var(--color-base0A);
  }

  .subnav-item[data-variant="warning"]:hover,
  .subnav-item[data-variant="warning"].active {
    background-color: color-mix(in srgb, var(--color-base0A) 10%, transparent);
  }

  .subnav-item[data-variant="danger"],
  .subnav-item[data-variant="danger"] .subnav-badge,
  .subnav-item[data-variant="danger"] :global(svg.subnav-icon) {
    color: var(--color-base08);
  }

  .subnav-item[data-variant="danger"]:hover,
  .subnav-item[data-variant="danger"].active {
    background-color: color-mix(in srgb, var(--color-base08) 10%, transparent);
  }

  .subnav-item[data-variant="success"],
  .subnav-item[data-variant="success"] .subnav-badge,
  .subnav-item[data-variant="success"] :global(svg.subnav-icon) {
    color: var(--color-base0B);
  }

  .subnav-item[data-variant="success"]:hover,
  .subnav-item[data-variant="success"].active {
    background-color: color-mix(in srgb, var(--color-base0B) 10%, transparent);
  }

  /* Variants */
  .nav-item[data-variant="warning"] {
    color: var(--color-base0A);
  }

  .nav-item[data-variant="warning"]:hover {
    color: var(--color-base0A);
    background-color: color-mix(in srgb, var(--color-base0A) 10%, transparent);
  }

  .nav-item[data-variant="warning"] :global(svg) {
    color: var(--color-base0A);
  }

  .nav-item[data-variant="danger"] {
    color: var(--color-base08);
  }

  .nav-item[data-variant="danger"]:hover {
    color: var(--color-base08);
    background-color: color-mix(in srgb, var(--color-base08) 10%, transparent);
  }

  .nav-item[data-variant="danger"] :global(svg) {
    color: var(--color-base08);
  }

  .nav-item[data-variant="success"] {
    color: var(--color-base0B);
  }

  .nav-item[data-variant="success"]:hover {
    color: var(--color-base0B);
    background-color: color-mix(in srgb, var(--color-base0B) 10%, transparent);
  }

  .nav-item[data-variant="success"] :global(svg) {
    color: var(--color-base0B);
  }
</style>
