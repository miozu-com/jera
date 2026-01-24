<!--
  @component SidebarGroup

  Expandable navigation group with subroutes.
  Shows chevron indicator and animates subnav list.
  Triggers hover popover when sidebar is collapsed.

  @example
  <SidebarGroup
    icon={Settings}
    label="Settings"
    items={[
      { href: '/settings/general', label: 'General' },
      { href: '/settings/security', label: 'Security' },
      { href: '/settings/billing', label: 'Billing', badge: 'New' }
    ]}
    activeMatcher={(item) => currentPath.startsWith(item.href)}
  />
-->
<script>
  import { getContext } from 'svelte';
  import { slide, fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    id = null,
    icon: Icon = null,
    label = '',
    expanded = $bindable(false),
    items = [],
    activeMatcher = null,
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Generate unique ID if not provided
  const groupId = $derived(id || label.toLowerCase().replace(/\s+/g, '-'));

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleMouseEnter(event) {
    if (!isCollapsed || !sidebar?.showPopover) return;

    const rect = event.currentTarget.getBoundingClientRect();
    sidebar.showPopover(groupId, {
      top: rect.top,
      left: rect.right + 8
    });
  }

  function handleMouseLeave() {
    if (sidebar?.hidePopover) {
      sidebar.hidePopover();
    }
  }

  function isItemActive(item) {
    if (activeMatcher) return activeMatcher(item);
    return false;
  }
</script>

<li>
  <button
    type="button"
    class="nav-item expandable {isCollapsed ? 'collapsed' : ''} {className}"
    onclick={toggleExpanded}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    title={isCollapsed ? label : null}
    aria-expanded={expanded}
  >
    {#if Icon}
      <Icon size={18} class="nav-icon" />
    {/if}
    {#if !isCollapsed}
      <span class="nav-label" transition:fly={{ x: -20, duration: 200, delay: 50 }}>{label}</span>
      <span class="expand-icon-wrapper" transition:fly={{ x: -15, duration: 200, delay: 75 }}>
        <svg
          class="expand-icon {expanded ? 'rotate-180' : ''}"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    {/if}
  </button>

  {#if expanded && !isCollapsed && items.length > 0}
    <ul class="subnav-list" transition:slide={{ duration: 200, easing: cubicOut }}>
      {#each items as item}
        <li>
          <a
            href={item.href}
            class="subnav-item {isItemActive(item) ? 'active' : ''}"
          >
            {item.label}
            {#if item.badge}
              <span class="subnav-badge">{item.badge}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
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
    color: var(--color-text, var(--color-base06, #F3F4F7));
    cursor: pointer;
    border-radius: 0.375rem;
    margin: 0 0.5rem;
    transition: all 200ms ease;
    overflow: hidden;
    border: none;
    background: transparent;
    font-family: inherit;
    position: relative;
  }

  .nav-item:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
  }

  .nav-item.collapsed {
    justify-content: center;
    padding: 0.5rem;
    margin: 0 0.25rem;
    width: calc(100% - 0.5rem);
  }

  .nav-item:hover .nav-icon,
  .nav-item:hover .expand-icon {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }

  .nav-icon {
    flex-shrink: 0;
    transition: color 150ms ease;
  }

  .nav-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
  }

  .expand-icon-wrapper {
    margin-left: auto;
    flex-shrink: 0;
  }

  .expand-icon {
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    transition: all 200ms ease;
  }

  .expand-icon.rotate-180 {
    transform: rotate(180deg);
  }

  /* Subnav list */
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
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    text-decoration: none;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    cursor: pointer;
    text-align: left;
  }

  .subnav-item:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
  }

  .subnav-item.active {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    font-weight: 500;
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 15%, transparent);
  }

  .subnav-badge {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    border-radius: 9999px;
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }
</style>
