<!--
  @component NavigationContainer

  Enterprise-grade navigation container with pluggable block architecture.
  Supports multiple navigation patterns, themes, and enterprise features.

  @example Basic usage
  <NavigationContainer
    navigationState={navState}
    blocks={[
      { type: 'search', id: 'main-search' },
      { type: 'section', id: 'nav', title: 'Navigation', items: navItems },
      { type: 'account-group', id: 'accounts', accounts: accounts },
      { type: 'custom', id: 'footer', component: CustomFooter }
    ]}
  />

  @example Enterprise usage
  <NavigationContainer
    navigationState={navState}
    theme="enterprise-dark"
    blocks={complexBlocks}
    plugins={[searchPlugin, analyticsPlugin]}
    permissions={permissionSystem}
  />
-->
<script>
  import { setContext, getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  import { NAVIGATION_CONTEXT_KEY } from '../../utils/navigation.svelte.js';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  // Block components
  import NavigationSearch from './blocks/NavigationSearch.svelte';
  import NavigationSection from './blocks/NavigationSection.svelte';
  import NavigationAccountGroup from './blocks/NavigationAccountGroup.svelte';
  import NavigationGroupSwitcher from './blocks/NavigationGroupSwitcher.svelte';
  import NavigationCustomBlock from './blocks/NavigationCustomBlock.svelte';

  let {
    navigationState,
    blocks = [],
    theme = 'default',
    plugins = [],
    permissions = null,
    renderCustomBlock = null,
    onBlockEvent = null,
    class: className = ''
  } = $props();

  // Set navigation context for child components
  setContext(NAVIGATION_CONTEXT_KEY, navigationState);

  // Get sidebar context if available
  const sidebarContext = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebarContext?.collapsed ?? false);

  // Built-in block type registry
  const blockComponents = {
    'search': NavigationSearch,
    'section': NavigationSection,
    'account-group': NavigationAccountGroup,
    'group-switcher': NavigationGroupSwitcher,
    'custom': NavigationCustomBlock
  };

  // Computed theme classes
  const themeClass = $derived(`nav-theme-${theme}`);
  const containerClass = $derived([
    'navigation-container',
    themeClass,
    isCollapsed && 'collapsed',
    className
  ].filter(Boolean).join(' '));

  // Initialize plugins
  $effect(() => {
    plugins.forEach(plugin => {
      if (typeof plugin.init === 'function') {
        plugin.init({ navigationState, blocks, theme, permissions });
      }
    });

    return () => {
      plugins.forEach(plugin => {
        if (typeof plugin.destroy === 'function') {
          plugin.destroy();
        }
      });
    };
  });

  // Handle block events
  function handleBlockEvent(blockId, eventType, data) {
    // Call plugin event handlers
    plugins.forEach(plugin => {
      if (typeof plugin.onBlockEvent === 'function') {
        plugin.onBlockEvent(blockId, eventType, data);
      }
    });

    // Call user event handler
    if (onBlockEvent) {
      onBlockEvent(blockId, eventType, data);
    }
  }

  // Get component for block type
  function getBlockComponent(block) {
    if (block.component) {
      return block.component;
    }

    if (block.type && blockComponents[block.type]) {
      return blockComponents[block.type];
    }

    // Fallback to custom block
    return NavigationCustomBlock;
  }

  // Check if block should be visible
  function isBlockVisible(block) {
    // Check permissions
    if (permissions && block.permissions) {
      const hasPermission = Array.isArray(block.permissions)
        ? block.permissions.some(perm => permissions.check(perm))
        : permissions.check(block.permissions);

      if (!hasPermission) return false;
    }

    // Check custom visibility function
    if (typeof block.visible === 'function') {
      return block.visible({ navigationState, isCollapsed });
    }

    // Check boolean visibility
    if (typeof block.visible === 'boolean') {
      return block.visible;
    }

    // Default to visible
    return true;
  }

  // Filter visible blocks
  const visibleBlocks = $derived(blocks.filter(isBlockVisible));
</script>

<nav class={containerClass} data-theme={theme}>
  {#each visibleBlocks as block, index (block.id)}
    <div
      class="nav-block nav-block-{block.type}"
      data-block-id={block.id}
      data-block-type={block.type}
      transition:fade={{ duration: 200, delay: index * 50 }}
    >
      {#if renderCustomBlock && block.type === 'custom'}
        {@render renderCustomBlock(block, { navigationState, isCollapsed, onEvent: (type, data) => handleBlockEvent(block.id, type, data) })}
      {:else}
        {@const BlockComponent = getBlockComponent(block)}
        <BlockComponent
          {block}
          {navigationState}
          onEvent={(type, data) => handleBlockEvent(block.id, type, data)}
          {...(block.props || {})}
        />
      {/if}
    </div>
  {/each}
</nav>

<style>
  .navigation-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    /* CSS Custom Properties for theming */
    --nav-container-bg: var(--color-surface, var(--color-base01, #2C3040));
    --nav-container-border: var(--color-border, color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent));
    --nav-container-text: var(--color-text, var(--color-base06, #F3F4F7));

    /* Spacing */
    --nav-block-spacing: 0.5rem;
    --nav-indent-size: 1rem;

    /* Item styling */
    --nav-item-padding: 0.375rem 0.75rem;
    --nav-item-margin: 0 0.5rem 0.125rem 0.5rem;
    --nav-item-gap: 0.5rem;
    --nav-item-border-radius: 0.375rem;
    --nav-item-font-size: 0.875rem;

    /* Colors */
    --nav-item-color: var(--color-text, var(--color-base06, #F3F4F7));
    --nav-item-background: transparent;
    --nav-item-border: none;

    /* Hover states */
    --nav-hover-opacity: 10%;
    --nav-item-hover-color: var(--color-primary, var(--color-base0D, #83D2FC));
    --nav-item-hover-background: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) var(--nav-hover-opacity), transparent);

    /* Active states */
    --nav-active-opacity: 15%;
    --nav-item-active-color: var(--color-primary, var(--color-base0D, #83D2FC));
    --nav-item-active-background: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) var(--nav-active-opacity), transparent);
    --nav-item-active-weight: 500;

    /* Icons */
    --nav-icon-size: 18px;
    --nav-icon-container-size: 1.5rem;

    /* Badges */
    --nav-badge-padding: 0.125rem 0.375rem;
    --nav-badge-font-size: 0.625rem;
    --nav-badge-weight: 600;
    --nav-badge-opacity: 10%;
    --nav-badge-color: var(--color-primary, var(--color-base0D, #83D2FC));
    --nav-badge-background: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) var(--nav-badge-opacity), transparent);
    --nav-badge-radius: 9999px;
    --nav-badge-min-width: 1rem;
    --nav-badge-height: 1rem;

    /* Expand buttons */
    --nav-expand-icon-size: 14px;
    --nav-expand-button-size: 1.25rem;
    --nav-expand-button-color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    --nav-expand-button-hover-bg: color-mix(in srgb, var(--color-text-muted, var(--color-base05, #D0D2DB)) 10%, transparent);
    --nav-expand-button-hover-color: var(--color-text, var(--color-base06, #F3F4F7));
    --nav-expand-button-radius: 0.25rem;

    /* Transitions */
    --nav-transition-duration: 200ms;
    --nav-transition-easing: ease;

    /* Search */
    --nav-search-highlight-bg: color-mix(in srgb, var(--color-warning, var(--color-base0A, #E8D176)) 10%, transparent);
    --nav-search-highlight-border: 1px solid color-mix(in srgb, var(--color-warning, var(--color-base0A, #E8D176)) 30%, transparent);
    --nav-search-indicator-size: 0.375rem;
    --nav-search-indicator-color: var(--color-warning, var(--color-base0A, #E8D176));
    --nav-search-indicator-offset: 0.25rem;

    /* Children/nesting */
    --nav-children-border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    --nav-children-margin-left: calc(var(--nav-icon-container-size) / 2);
    --nav-children-padding-left: 0.5rem;

    /* Collapsed state */
    --nav-item-collapsed-padding: 0.5rem;
    --nav-item-collapsed-margin: 0 0.25rem 0.125rem 0.25rem;
    --nav-item-collapsed-margin-offset: 0.5rem;

    /* Depth-based styling */
    --nav-depth-0-weight: 500;
    --nav-depth-1-size: 0.8125rem;
    --nav-depth-2-size: 0.75rem;
    --nav-depth-2-opacity: 0.9;

    /* Mobile responsive */
    --nav-item-mobile-padding: 0.5rem 0.75rem;
    --nav-children-mobile-margin: 0.75rem;

    background: var(--nav-container-bg);
    color: var(--nav-container-text);
  }

  .navigation-container.collapsed {
    --nav-item-padding: var(--nav-item-collapsed-padding);
    --nav-item-margin: var(--nav-item-collapsed-margin);
  }

  /* Theme variants */
  .nav-theme-enterprise-dark {
    --nav-container-bg: #1a1b23;
    --nav-item-color: #e4e4e7;
    --nav-item-hover-color: #3b82f6;
    --nav-item-active-color: #3b82f6;
    --nav-hover-opacity: 8%;
    --nav-active-opacity: 12%;
  }

  .nav-theme-enterprise-light {
    --nav-container-bg: #ffffff;
    --nav-item-color: #374151;
    --nav-item-hover-color: #3b82f6;
    --nav-item-active-color: #3b82f6;
    --nav-hover-opacity: 5%;
    --nav-active-opacity: 10%;
  }

  .nav-theme-minimal {
    --nav-item-border-radius: 0;
    --nav-item-padding: 0.25rem 0.5rem;
    --nav-hover-opacity: 5%;
    --nav-active-opacity: 8%;
  }

  .nav-theme-colorful {
    --nav-item-hover-color: #10b981;
    --nav-item-active-color: #059669;
    --nav-badge-color: #f59e0b;
    --nav-hover-opacity: 12%;
    --nav-active-opacity: 18%;
  }

  /* Block containers */
  .nav-block {
    margin-bottom: var(--nav-block-spacing);
  }

  .nav-block:last-child {
    margin-bottom: 0;
  }

  /* Scrollbar styling */
  .navigation-container::-webkit-scrollbar {
    width: 4px;
  }

  .navigation-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .navigation-container::-webkit-scrollbar-thumb {
    background: var(--color-base03, #565E78);
    border-radius: 2px;
  }

  .navigation-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-base04, #737E99);
  }

  /* Firefox scrollbar */
  .navigation-container {
    scrollbar-width: thin;
    scrollbar-color: var(--color-base03, #565E78) transparent;
  }
</style>