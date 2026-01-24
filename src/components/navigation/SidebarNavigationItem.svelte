<!--
  @component SidebarNavigationItem

  Enterprise-grade recursive navigation item with unlimited depth nesting.
  Supports sophisticated navigation hierarchies with intelligent expansion,
  search highlighting, and permission-based visibility.

  @example Basic item
  <SidebarNavigationItem
    item={{ id: 'home', label: 'Home', href: '/', icon: HomeIcon }}
    navigationState={navState}
  />

  @example Recursive with children
  <SidebarNavigationItem
    item={{
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      children: [
        { id: 'profile', label: 'Profile', href: '/settings/profile' },
        { id: 'security', label: 'Security', href: '/settings/security' }
      ]
    }}
    navigationState={navState}
  />

  @example With permissions
  <SidebarNavigationItem
    item={{
      id: 'admin',
      label: 'Admin',
      permissions: ['admin.view'],
      children: [...adminItems]
    }}
    navigationState={navState}
  />
-->
<script>
  import { getContext } from 'svelte';
  import { fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';
  import { NAVIGATION_CONTEXT_KEY } from '../../utils/navigation.svelte.js';

  let {
    item,
    navigationState = null,
    depth = 0,
    maxDepth = 10,
    onNavigate = null,
    onToggle = null,
    renderCustomIcon = null,
    renderCustomBadge = null,
    class: className = ''
  } = $props();

  // Get sidebar context for collapse state
  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Get navigation state from context if not provided
  const contextNavState = getContext(NAVIGATION_CONTEXT_KEY);
  const navState = navigationState || contextNavState;

  // Computed properties
  const hasChildren = $derived((item.children?.length || 0) > 0);
  const isExpanded = $derived(navState?.isItemExpanded(item.id) ?? false);
  const isActive = $derived(navState?.isActive(item) ?? false);
  const isInActivePath = $derived(navState?.isInActivePath(item) ?? false);
  const isVisible = $derived(navState?.isVisible(item) ?? true);
  const canExpand = $derived(hasChildren && depth < maxDepth);

  // Check if item matches search
  const matchesSearch = $derived(item._matchesSearch ?? false);

  // Dynamic styling based on depth and state
  const itemStyles = $derived.by(() => {
    const styles = {
      '--nav-item-depth': depth,
      '--nav-item-indent': `${depth * 1}rem`,
      '--nav-item-opacity': isVisible ? 1 : 0.5
    };

    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  });

  // Dynamic CSS classes
  const itemClass = $derived([
    'nav-item',
    'nav-item-recursive',
    `depth-${depth}`,
    isActive && 'active',
    isInActivePath && 'in-active-path',
    hasChildren && 'has-children',
    isExpanded && 'expanded',
    matchesSearch && 'matches-search',
    !isVisible && 'hidden',
    isCollapsed && 'collapsed',
    className
  ].filter(Boolean).join(' '));

  // Handle click events
  function handleClick(event) {
    if (!isVisible) return;

    // If has children and clicked on expand area, toggle
    if (hasChildren && canExpand) {
      event.preventDefault();
      toggleExpansion();
      return;
    }

    // Otherwise navigate
    if (item.href) {
      if (onNavigate) {
        const shouldProceed = onNavigate(item, event);
        if (shouldProceed === false) return;
      }

      // Set as active in navigation state
      if (navState) {
        navState.setActive(item);
      }

      // Close mobile sidebar if applicable
      if (sidebar?.closeMobileOverlay) {
        sidebar.closeMobileOverlay();
      }
    } else if (hasChildren) {
      // If no href but has children, toggle expansion
      toggleExpansion();
    }
  }

  function toggleExpansion() {
    if (!hasChildren || !canExpand) return;

    if (navState) {
      navState.toggleItem(item.id);
    }

    if (onToggle) {
      onToggle(item, !isExpanded);
    }
  }

  // Handle keyboard navigation
  function handleKeydown(event) {
    if (!isVisible) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleClick(event);
        break;
      case 'ArrowRight':
        if (hasChildren && !isExpanded && canExpand) {
          event.preventDefault();
          toggleExpansion();
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && isExpanded) {
          event.preventDefault();
          toggleExpansion();
        }
        break;
    }
  }

  // Icon component resolution
  const IconComponent = $derived(item.icon);

  // Badge rendering
  const badgeValue = $derived(typeof item.badge === 'function' ? item.badge() : item.badge);
</script>

{#if isVisible}
  <li class="nav-item-container" style={itemStyles}>
    <!-- Main navigation item -->
    <div
      class={itemClass}
      role="button"
      tabindex="0"
      onclick={handleClick}
      onkeydown={handleKeydown}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : item.description || null}
    >
      <!-- Expand/collapse indicator -->
      {#if hasChildren && canExpand && !isCollapsed}
        <button
          class="expand-button"
          onclick={(e) => { e.stopPropagation(); toggleExpansion(); }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          transition:fly={{ x: -10, duration: 200, delay: depth * 25 }}
        >
          <svg
            class="expand-icon {isExpanded ? 'expanded' : 'collapsed'}"
            xmlns="http://www.w3.org/2000/svg"
            width="var(--nav-expand-icon-size, 14)"
            height="var(--nav-expand-icon-size, 14)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      {/if}

      <!-- Icon -->
      {#if IconComponent}
        <div class="nav-icon-container">
          {#if renderCustomIcon}
            {@render renderCustomIcon(item, { isActive, isExpanded, depth })}
          {:else}
            <IconComponent size="var(--nav-icon-size, 18)" class="nav-icon" />
          {/if}
        </div>
      {/if}

      <!-- Label -->
      {#if !isCollapsed}
        <span
          class="nav-label"
          transition:fly={{ x: -20, duration: 200, delay: 50 + (depth * 25) }}
        >
          {item.label}
        </span>
      {/if}

      <!-- Badge -->
      {#if badgeValue && !isCollapsed}
        <div class="nav-badge-container">
          {#if renderCustomBadge}
            {@render renderCustomBadge(item, badgeValue, { isActive, isExpanded, depth })}
          {:else}
            <span
              class="nav-badge"
              transition:fly={{ x: -15, duration: 200, delay: 75 + (depth * 25) }}
            >
              {badgeValue}
            </span>
          {/if}
        </div>
      {/if}

      <!-- Search match highlight -->
      {#if matchesSearch}
        <div class="search-match-indicator" title="Matches search"></div>
      {/if}
    </div>

    <!-- Recursive children -->
    {#if hasChildren && isExpanded && canExpand}
      <ul
        class="nav-children"
        transition:slide={{ duration: 200, easing: cubicOut }}
      >
        {#each item.children as child}
          <svelte:self
            item={child}
            {navigationState}
            depth={depth + 1}
            {maxDepth}
            {onNavigate}
            {onToggle}
            {renderCustomIcon}
            {renderCustomBadge}
          />
        {/each}
      </ul>
    {/if}
  </li>
{/if}

<style>
  .nav-item-container {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item-recursive {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--nav-item-gap, 0.5rem);
    padding: var(--nav-item-padding, 0.375rem 0.75rem);
    margin: var(--nav-item-margin, 0 0.5rem 0.125rem 0.5rem);
    padding-left: calc(var(--nav-item-padding-left, 0.75rem) + var(--nav-item-indent, 0px));
    font-size: var(--nav-item-font-size, 0.875rem);
    color: var(--nav-item-color, var(--color-text, var(--color-base06, #F3F4F7)));
    background: var(--nav-item-background, transparent);
    border: var(--nav-item-border, none);
    border-radius: var(--nav-item-border-radius, 0.375rem);
    cursor: pointer;
    transition: all var(--nav-transition-duration, 200ms) var(--nav-transition-easing, ease);
    position: relative;
    text-decoration: none;
    font-family: inherit;
    text-align: left;
    opacity: var(--nav-item-opacity, 1);
  }

  .nav-item-recursive:hover {
    color: var(--nav-item-hover-color, var(--color-primary, var(--color-base0D, #83D2FC)));
    background: var(--nav-item-hover-background, color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) var(--nav-hover-opacity, 10%), transparent));
  }

  .nav-item-recursive.active {
    color: var(--nav-item-active-color, var(--color-primary, var(--color-base0D, #83D2FC)));
    background: var(--nav-item-active-background, color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) var(--nav-active-opacity, 15%), transparent));
    font-weight: var(--nav-item-active-weight, 500);
  }

  .nav-item-recursive.in-active-path {
    color: var(--nav-item-path-color, var(--color-primary, var(--color-base0D, #83D2FC)));
    opacity: var(--nav-item-path-opacity, 0.8);
  }

  .nav-item-recursive.matches-search {
    background: var(--nav-search-highlight-bg, color-mix(in srgb, var(--color-warning, var(--color-base0A, #E8D176)) 10%, transparent));
    border: var(--nav-search-highlight-border, 1px solid color-mix(in srgb, var(--color-warning, var(--color-base0A, #E8D176)) 30%, transparent));
  }

  .nav-item-recursive.collapsed {
    justify-content: center;
    padding: var(--nav-item-collapsed-padding, 0.5rem);
    margin: var(--nav-item-collapsed-margin, 0 0.25rem 0.125rem 0.25rem);
    width: calc(100% - var(--nav-item-collapsed-margin-offset, 0.5rem));
  }

  .nav-item-recursive.hidden {
    display: none;
  }

  /* Depth-based styling */
  .nav-item-recursive.depth-0 {
    font-weight: var(--nav-depth-0-weight, 500);
  }

  .nav-item-recursive.depth-1 {
    font-size: var(--nav-depth-1-size, 0.8125rem);
  }

  .nav-item-recursive.depth-2 {
    font-size: var(--nav-depth-2-size, 0.75rem);
    opacity: var(--nav-depth-2-opacity, 0.9);
  }

  /* Expand button */
  .expand-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nav-expand-button-size, 1.25rem);
    height: var(--nav-expand-button-size, 1.25rem);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--nav-expand-button-color, var(--color-text-muted, var(--color-base05, #D0D2DB)));
    cursor: pointer;
    border-radius: var(--nav-expand-button-radius, 0.25rem);
    transition: all var(--nav-transition-duration, 200ms) var(--nav-transition-easing, ease);
    flex-shrink: 0;
  }

  .expand-button:hover {
    background: var(--nav-expand-button-hover-bg, color-mix(in srgb, var(--color-text-muted, var(--color-base05, #D0D2DB)) 10%, transparent));
    color: var(--nav-expand-button-hover-color, var(--color-text, var(--color-base06, #F3F4F7)));
  }

  .expand-icon {
    transition: transform var(--nav-transition-duration, 200ms) var(--nav-transition-easing, ease);
  }

  .expand-icon.expanded {
    transform: rotate(180deg);
  }

  /* Icon container */
  .nav-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nav-icon-container-size, 1.5rem);
    height: var(--nav-icon-container-size, 1.5rem);
    flex-shrink: 0;
  }

  .nav-icon {
    transition: color var(--nav-transition-duration, 200ms) var(--nav-transition-easing, ease);
  }

  /* Label */
  .nav-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: var(--nav-label-weight, 400);
    min-width: 0;
  }

  /* Badge container */
  .nav-badge-container {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: auto;
  }

  .nav-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--nav-badge-padding, 0.125rem 0.375rem);
    font-size: var(--nav-badge-font-size, 0.625rem);
    font-weight: var(--nav-badge-weight, 600);
    color: var(--nav-badge-color, var(--color-primary, var(--color-base0D, #83D2FC)));
    background: var(--nav-badge-background, color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) var(--nav-badge-opacity, 10%), transparent));
    border-radius: var(--nav-badge-radius, 9999px);
    min-width: var(--nav-badge-min-width, 1rem);
    height: var(--nav-badge-height, 1rem);
  }

  /* Search match indicator */
  .search-match-indicator {
    position: absolute;
    right: var(--nav-search-indicator-offset, 0.25rem);
    top: 50%;
    transform: translateY(-50%);
    width: var(--nav-search-indicator-size, 0.375rem);
    height: var(--nav-search-indicator-size, 0.375rem);
    background: var(--nav-search-indicator-color, var(--color-warning, var(--color-base0A, #E8D176)));
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Children container */
  .nav-children {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: var(--nav-children-border, 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent));
    margin-left: var(--nav-children-margin-left, calc(var(--nav-icon-container-size, 1.5rem) / 2));
    padding-left: var(--nav-children-padding-left, 0.5rem);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .nav-item-recursive {
      padding: var(--nav-item-mobile-padding, 0.5rem 0.75rem);
    }

    .nav-children {
      margin-left: var(--nav-children-mobile-margin, 0.75rem);
    }
  }
</style>