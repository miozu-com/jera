<!-- file-size: justified -- one nav item in three element shapes (link, expandable, button) sharing one badge/dot/variant style sheet; the CSS is the long part. -->
<!--
  @component LeftBarItem

  A navigation item within LeftBar.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar nav-item styles.

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
-->
<script>
  import { getContext } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Badge from '../primitives/Badge.svelte';
  import { badgeVariant as variantFor } from '../../utils/badge.js';

  let {
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
    preload = true,
    variant = 'default',
    onclick = null,
    isActiveRoute = () => false,
    class: className = '',
    leading,
    trailing,
    children
  } = $props();

  // Preload attribute for SvelteKit
  const preloadAttr = preload ? 'hover' : undefined;

  const leftbar = getContext('leftbar');
  const isCollapsed = $derived(leftbar?.collapsed ?? false);

  // No color = plain count badge → neutral info chip.
  const badgeVariant = $derived(variantFor(badgeColor));
  const statusDot = $derived(isCollapsed && badge != null && !!badgeColor);
  // Collapsed, the item has no visible text: name it explicitly (tooltip + AT),
  // status included. Expanded, the label and badge text name it.
  const collapsedTitle = $derived(
    isCollapsed ? (statusDot ? `${label} (${badge})` : label) : null
  );

  function handleClick(e) {
    if (expandable) {
      e.preventDefault();
      expanded = !expanded;
    }
    onclick?.(e);
  }

  function handleMouseEnter(e) {
    if (expandable) {
      leftbar?.showPopover?.(label, e);
    }
  }

  function handleMouseLeave() {
    leftbar?.hidePopover?.();
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

<li>
  {#if href && !expandable}
    <a
      {href}
      class="nav-item {className}"
      class:active
      class:collapsed={isCollapsed}
      data-variant={variant}
      title={collapsedTitle}
      aria-label={collapsedTitle}
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
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      {/if}
      {@render children?.()}
    </button>
    {#if expanded && !isCollapsed && subroutes.length > 0}
      <ul class="subnav-list" transition:slide={{ duration: 200, easing: cubicOut }}>
        {#each subroutes as route}
          <li>
            <a
              href={route.href}
              class="subnav-item"
              class:active={isActiveRoute(route.href)}
            >
              {route.label}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
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
    border-radius: 0.375rem;
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
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
  }

  .subnav-item {
    display: block;
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
    border-radius: 0.375rem;
    text-decoration: none;
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

  :global([data-theme="miozu-light"]) .subnav-item.active {
    color: color-mix(in srgb, var(--color-base0D) 60%, black);
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
