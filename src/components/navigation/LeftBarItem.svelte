<!--
  @component LeftBarItem

  A navigation item within LeftBar.
  Exact 1:1 match with admin.selify.ai AdminSidebar nav-item styles.

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

  let {
    href = null,
    label = '',
    icon: Icon = null,
    active = false,
    expandable = false,
    expanded = $bindable(false),
    subroutes = [],
    onclick = null,
    isActiveRoute = () => false,
    class: className = '',
    children
  } = $props();

  const leftbar = getContext('leftbar');
  const isCollapsed = $derived(leftbar?.collapsed ?? false);

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

<li>
  {#if href && !expandable}
    <a
      {href}
      class="nav-item {className}"
      class:active
      class:collapsed={isCollapsed}
      title={isCollapsed ? label : null}
    >
      {#if Icon}
        <Icon size={18} class="nav-icon" />
      {/if}
      {#if !isCollapsed}
        <span class="nav-label" transition:fade={{ duration: 150 }}>{label}</span>
      {/if}
      {@render children?.()}
    </a>
  {:else if expandable}
    <button
      class="nav-item expandable {className}"
      class:collapsed={isCollapsed}
      onclick={handleClick}
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
      title={isCollapsed ? label : null}
    >
      {#if Icon}
        <Icon size={18} class="nav-icon" />
      {/if}
      {#if !isCollapsed}
        <span class="nav-label" transition:fade={{ duration: 150 }}>{label}</span>
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
      onclick={handleClick}
      title={isCollapsed ? label : null}
    >
      {#if Icon}
        <Icon size={18} class="nav-icon" />
      {/if}
      {#if !isCollapsed}
        <span class="nav-label" transition:fade={{ duration: 150 }}>{label}</span>
      {/if}
      {@render children?.()}
    </button>
  {/if}
</li>

<style>
  li {
    list-style: none;
  }

  .nav-item {
    width: calc(100% - 1rem);
    padding: 0.375rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-base06);
    cursor: pointer;
    border-radius: 0.375rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    transition: all 150ms;
    text-decoration: none;
    overflow: hidden;
    background: transparent;
    border: none;
    font: inherit;
    text-align: left;
  }

  .nav-item:hover {
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
  }

  .nav-item.active {
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    color: var(--color-base0D);
    font-weight: 500;
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
    transition: color 150ms;
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

  .expand-icon {
    color: var(--color-base04);
    flex-shrink: 0;
    margin-left: auto;
    transition: all 200ms;
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
    font-size: 0.875rem;
    color: var(--color-base04);
    transition: color 150ms;
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
    font-weight: 500;
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
  }
</style>
