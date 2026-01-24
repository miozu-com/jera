<!--
  @component SidebarGroupSwitcher

  Investment group switcher with create group functionality.
  Matches dash.selify.ai group switching behavior.

  @example
  <SidebarGroupSwitcher
    groups={investmentGroups}
    currentGroup={currentGroup}
    onGroupChange={(group) => switchToGroup(group)}
    onCreateGroup={() => showCreateModal = true}
    bind:expanded={groupsExpanded}
  />
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    groups = [],
    currentGroup = null,
    expanded = $bindable(false),
    onGroupChange = null,
    onCreateGroup = null,
    searchQuery = '',
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Filter groups based on search
  const filteredGroups = $derived(
    groups.filter(group =>
      !searchQuery ||
      group.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleGroupClick(group) {
    if (onGroupChange) {
      onGroupChange(group);
    }
    // Close mobile overlay if in mobile mode
    if (sidebar?.closeMobileOverlay) {
      sidebar.closeMobileOverlay();
    }
  }

  function handleCreateGroup() {
    if (onCreateGroup) {
      onCreateGroup();
    }
  }

  function isGroupActive(group) {
    return currentGroup?.id === group.id;
  }
</script>

{#if groups.length > 0}
  <div class="sidebar-section {className}">
    <button
      class="section-header"
      onclick={toggleExpanded}
      aria-expanded={expanded}
    >
      <span class="section-title">Groups</span>
      <span class="section-count">{groups.length}</span>
      <svg
        class="section-chevron {expanded ? 'rotate-180' : ''}"
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

    {#if expanded}
      <div class="groups-list" transition:slide={{ duration: 200, easing: cubicOut }}>
        {#each filteredGroups as group}
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

        <button class="add-group" onclick={handleCreateGroup} title="Create new group">
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
      </div>
    {/if}
  </div>
{/if}

<style>
  .sidebar-section {
    padding: 0.125rem 0;
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
    transition: all 200ms ease;
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
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .section-chevron {
    color: var(--color-text-muted, var(--color-base04, #737E99));
    transition: all 200ms ease;
    flex-shrink: 0;
  }

  .section-chevron.rotate-180 {
    transform: rotate(180deg);
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
    color: var(--color-text, var(--color-base06, #F3F4F7));
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    overflow: hidden;
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
  }

  .group-item:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
  }

  .group-item.active {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 15%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    font-weight: 500;
  }

  .group-name {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .add-group {
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
    border-radius: 0.375rem;
    transition: all 200ms ease;
    border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    background: transparent;
    font-family: inherit;
  }

  .add-group:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 5%, transparent);
    border-color: var(--color-primary, var(--color-base0D, #83D2FC));
  }
</style>