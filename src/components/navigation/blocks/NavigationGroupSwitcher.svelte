<!--
  @component NavigationGroupSwitcher

  Enterprise group switcher block for investment groups or similar.
-->
<script>
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../../utils/sidebar.svelte.js';
  import { NAVIGATION_CONTEXT_KEY } from '../../../utils/navigation.svelte.js';

  let {
    block,
    navigationState = null,
    onEvent = null
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const navContext = getContext(NAVIGATION_CONTEXT_KEY);
  const navState = navigationState || navContext;

  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  const config = $derived({
    title: block.title || 'Groups',
    collapsible: block.collapsible ?? true,
    defaultExpanded: block.defaultExpanded ?? false,
    showCount: block.showCount ?? true,
    showCreateButton: block.showCreateButton ?? true,
    ...block.config
  });

  const groups = $derived(block.groups || []);
  const currentGroup = $derived(block.currentGroup || null);

  const filteredGroups = $derived.by(() => {
    if (!navState?.searchQuery) return groups;
    const query = navState.searchQuery.toLowerCase();
    return groups.filter(group => group.name?.toLowerCase().includes(query));
  });

  const sectionId = block.id;
  const isExpanded = $derived(
    config.collapsible
      ? (navState?.isSectionExpanded(sectionId) ?? config.defaultExpanded)
      : true
  );

  function toggleSection() {
    if (navState) navState.toggleSection(sectionId);
    if (onEvent) onEvent('section_toggled', { sectionId, expanded: !isExpanded });
  }

  function handleGroupClick(group) {
    if (onEvent) onEvent('group_selected', { group });
  }

  function handleCreateGroup() {
    if (onEvent) onEvent('create_group_clicked', {});
  }

  function isGroupActive(group) {
    return currentGroup?.id === group.id;
  }
</script>

{#if groups.length > 0}
  <div class="nav-group-switcher-block">
    {#if config.title && !isCollapsed}
      <button
        class="section-header"
        onclick={toggleSection}
        aria-expanded={isExpanded}
      >
        <span class="section-title">{config.title}</span>

        {#if config.showCount}
          <span class="section-count">{groups.length}</span>
        {/if}

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
      </button>
    {:else if config.title && isCollapsed}
      <div class="section-divider"></div>
    {/if}

    {#if isExpanded}
      <div class="groups-list" transition:slide={{ duration: 200, easing: cubicOut }}>
        {#each filteredGroups as group (group.id)}
          <button
            class="group-item {isGroupActive(group) ? 'active' : ''}"
            onclick={() => handleGroupClick(group)}
            title={group.name}
          >
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
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span class="group-name">{group.name}</span>
          </button>
        {/each}

        {#if config.showCreateButton}
          <button class="add-group-btn" onclick={handleCreateGroup}>
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
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create Group</span>
          </button>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .nav-group-switcher-block {
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
    cursor: pointer;
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
    border: none;
    background: transparent;
    font-family: inherit;
    justify-content: flex-start;
  }

  .section-header:hover {
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
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
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

  .groups-list {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0 0.5rem;
  }

  .group-item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--nav-item-color);
    cursor: pointer;
    border-radius: var(--nav-item-border-radius);
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
  }

  .group-item:hover {
    color: var(--nav-item-hover-color);
    background: var(--nav-item-hover-background);
  }

  .group-item.active {
    background: var(--nav-item-active-background);
    color: var(--nav-item-active-color);
    font-weight: var(--nav-item-active-weight);
  }

  .group-name {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .add-group-btn {
    width: 100%;
    padding: 0.5rem 0.75rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.875rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    cursor: pointer;
    border-radius: var(--nav-item-border-radius);
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
    border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    background: transparent;
    font-family: inherit;
  }

  .add-group-btn:hover {
    color: var(--nav-item-hover-color);
    background: color-mix(in srgb, var(--nav-item-hover-color) 5%, transparent);
    border-color: var(--nav-item-hover-color);
  }
</style>