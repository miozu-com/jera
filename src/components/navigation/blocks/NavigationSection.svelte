<!--
  @component NavigationSection

  Enterprise navigation section block with recursive item support.
-->
<script>
  import { getContext } from 'svelte';
  import { slide, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../../utils/sidebar.svelte.js';
  import { NAVIGATION_CONTEXT_KEY } from '../../../utils/navigation.svelte.js';
  import SidebarNavigationItem from '../SidebarNavigationItem.svelte';

  let {
    block,
    navigationState = null,
    onEvent = null
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const navContext = getContext(NAVIGATION_CONTEXT_KEY);
  const navState = navigationState || navContext;

  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Block configuration with defaults
  const config = $derived({
    title: block.title || '',
    collapsible: block.collapsible ?? true,
    defaultExpanded: block.defaultExpanded ?? true,
    showCount: block.showCount ?? true,
    maxDepth: block.maxDepth ?? 10,
    searchable: block.searchable ?? true,
    ...block.config
  });

  // Items from block configuration
  const items = $derived(block.items || []);

  // Filter items if searchable and search is active
  const filteredItems = $derived.by(() => {
    if (!config.searchable || !navState?.searchQuery) return items;
    return navState.filteredItems.filter(item =>
      items.some(blockItem => blockItem.id === item.id)
    );
  });

  // Section expansion state
  const sectionId = block.id;
  const isExpanded = $derived(
    config.collapsible
      ? (navState?.isSectionExpanded(sectionId) ?? config.defaultExpanded)
      : true
  );

  function toggleSection() {
    if (!config.collapsible) return;

    if (navState) {
      navState.toggleSection(sectionId);
    }

    if (onEvent) {
      onEvent('section_toggled', { sectionId, expanded: !isExpanded });
    }
  }

  function handleItemNavigate(item, event) {
    if (onEvent) {
      const result = onEvent('item_navigate', { item, event });
      if (result === false) return false;
    }

    return true; // Continue with default navigation
  }

  function handleItemToggle(item, expanded) {
    if (onEvent) {
      onEvent('item_toggled', { item, expanded });
    }
  }
</script>

<div class="nav-section-block">
  {#if config.title && !isCollapsed}
    <button
      class="section-header"
      class:collapsible={config.collapsible}
      onclick={toggleSection}
      disabled={!config.collapsible}
      aria-expanded={config.collapsible ? isExpanded : undefined}
    >
      <span class="section-title">{config.title}</span>

      {#if config.showCount && filteredItems.length > 0}
        <span class="section-count">{filteredItems.length}</span>
      {/if}

      {#if config.collapsible}
        <svg
          class="section-chevron {isExpanded ? 'expanded' : 'collapsed'}"
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
      {/if}
    </button>
  {:else if config.title && isCollapsed}
    <div class="section-divider" title={config.title}></div>
  {/if}

  {#if isExpanded}
    <ul
      class="section-items"
      transition:slide={{ duration: 200, easing: cubicOut }}
    >
      {#each filteredItems as item (item.id)}
        <SidebarNavigationItem
          {item}
          {navigationState}
          maxDepth={config.maxDepth}
          onNavigate={handleItemNavigate}
          onToggle={handleItemToggle}
        />
      {/each}

      {#if filteredItems.length === 0 && items.length > 0}
        <li class="no-results">
          <div class="no-results-content">
            <span class="no-results-text">No matching items</span>
          </div>
        </li>
      {/if}
    </ul>
  {/if}
</div>

<style>
  .nav-section-block {
    margin-bottom: var(--nav-block-spacing, 0.5rem);
  }

  .section-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted, var(--color-base04, #737E99));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: none;
    background: transparent;
    font-family: inherit;
    justify-content: flex-start;
    transition: all var(--nav-transition-duration, 200ms) var(--nav-transition-easing, ease);
    cursor: default;
  }

  .section-header.collapsible {
    cursor: pointer;
  }

  .section-header.collapsible:hover {
    color: var(--color-text, var(--color-base05, #D0D2DB));
  }

  .section-title {
    flex: 1;
    text-align: left;
  }

  .section-count {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    background: var(--color-surface-alt, var(--color-base02, #3E4359));
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .section-chevron {
    color: var(--color-text-muted, var(--color-base04, #737E99));
    transition: all var(--nav-transition-duration, 200ms) var(--nav-transition-easing, ease);
    flex-shrink: 0;
  }

  .section-chevron.expanded {
    transform: rotate(180deg);
  }

  .section-divider {
    margin: 0.5rem 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    height: 1px;
  }

  .section-items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .no-results {
    list-style: none;
  }

  .no-results-content {
    padding: 1rem 0.75rem;
    text-align: center;
  }

  .no-results-text {
    font-size: 0.875rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    font-style: italic;
  }
</style>