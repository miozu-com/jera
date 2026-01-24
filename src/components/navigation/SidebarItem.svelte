<!--
  @component SidebarItem

  Navigation link or button item within sidebar.
  Supports icons, badges, and active states.

  @example Link item
  <SidebarItem
    href="/settings"
    icon={Settings}
    label="Settings"
    active={currentPath === '/settings'}
  />

  @example Button item
  <SidebarItem
    onclick={() => doSomething()}
    icon={Plus}
    label="Add New"
  />

  @example With badge
  <SidebarItem
    href="/messages"
    icon={Mail}
    label="Messages"
    badge={5}
    badgeVariant="primary"
  />
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    href = null,
    onclick = null,
    icon: Icon = null,
    label = '',
    badge = null,
    badgeVariant = 'default',
    active = false,
    disabled = false,
    variant = 'default',
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  const isLink = $derived(href !== null);
  const itemClass = $derived([
    'nav-item',
    active && 'active',
    disabled && 'disabled',
    variant !== 'default' && `variant-${variant}`,
    isCollapsed && 'collapsed',
    className
  ].filter(Boolean).join(' '));
</script>

<li>
  {#if isLink}
    <a
      {href}
      class={itemClass}
      title={isCollapsed ? label : null}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled}
    >
      {#if Icon}
        <Icon size={18} class="nav-icon" />
      {/if}
      {#if !isCollapsed}
        <span class="nav-label" transition:fly={{ x: -20, duration: 200, delay: 50 }}>{label}</span>
        {#if badge !== null}
          <span class="nav-badge badge-{badgeVariant}" transition:fly={{ x: -15, duration: 200, delay: 75 }}>
            {badge}
          </span>
        {/if}
      {/if}
    </a>
  {:else}
    <button
      type="button"
      class={itemClass}
      {onclick}
      {disabled}
      title={isCollapsed ? label : null}
    >
      {#if Icon}
        <Icon size={18} class="nav-icon" />
      {/if}
      {#if !isCollapsed}
        <span class="nav-label" transition:fly={{ x: -20, duration: 200, delay: 50 }}>{label}</span>
        {#if badge !== null}
          <span class="nav-badge badge-{badgeVariant}" transition:fly={{ x: -15, duration: 200, delay: 75 }}>
            {badge}
          </span>
        {/if}
      {/if}
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
    color: var(--color-text, var(--color-base06, #F3F4F7));
    cursor: pointer;
    border-radius: 0.375rem;
    margin: 0 0.5rem;
    transition: all 200ms ease;
    overflow: hidden;
    text-decoration: none;
    border: none;
    background: transparent;
    font-family: inherit;
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

  .nav-item.active {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 15%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    font-weight: 500;
  }

  .nav-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Variant: warning */
  .nav-item.variant-warning {
    color: var(--color-warning, var(--color-base0A, #E8D176));
  }

  .nav-item.variant-warning:hover {
    color: var(--color-warning, var(--color-base0A, #E8D176));
    background-color: color-mix(in srgb, var(--color-warning, var(--color-base0A, #E8D176)) 15%, transparent);
  }

  /* Variant: danger */
  .nav-item.variant-danger {
    color: var(--color-error, var(--color-base08, #EB3137));
  }

  .nav-item.variant-danger:hover {
    color: var(--color-error, var(--color-base08, #EB3137));
    background-color: color-mix(in srgb, var(--color-error, var(--color-base08, #EB3137)) 15%, transparent);
  }

  .nav-icon {
    flex-shrink: 0;
    transition: color 200ms ease;
  }

  .nav-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
  }

  .nav-badge {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    border-radius: 9999px;
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }

  .nav-badge.badge-success {
    background-color: color-mix(in srgb, var(--color-success, var(--color-base0B, #6DD672)) 10%, transparent);
    color: var(--color-success, var(--color-base0B, #6DD672));
  }

  .nav-badge.badge-warning {
    background-color: color-mix(in srgb, var(--color-warning, var(--color-base0A, #E8D176)) 10%, transparent);
    color: var(--color-warning, var(--color-base0A, #E8D176));
  }

  .nav-badge.badge-danger {
    background-color: color-mix(in srgb, var(--color-error, var(--color-base08, #EB3137)) 10%, transparent);
    color: var(--color-error, var(--color-base08, #EB3137));
  }
</style>
