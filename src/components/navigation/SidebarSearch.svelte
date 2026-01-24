<!--
  @component SidebarSearch

  Search functionality for sidebar with expand/collapse behavior.
  Matches dash.selify.ai search with filtering capabilities.

  @example
  <SidebarSearch
    bind:query={searchQuery}
    bind:expanded={searchExpanded}
    placeholder="Search navigation..."
    onSearch={(query) => filterNavigation(query)}
  />
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    query = $bindable(''),
    expanded = $bindable(false),
    placeholder = 'Search...',
    onSearch = null,
    onClear = null,
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  let searchInput;

  function expandSearch() {
    expanded = true;
    // Focus input after transition
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 50);
  }

  function collapseSearch() {
    expanded = false;
    query = '';
    if (onClear) onClear();
  }

  function handleInput(event) {
    query = event.target.value;
    if (onSearch) onSearch(query);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      collapseSearch();
    }
  }

  function handleBlur() {
    // Collapse if query is empty after a delay
    setTimeout(() => {
      if (!query.trim()) {
        expanded = false;
      }
    }, 200);
  }
</script>

<div class="search-section {className}">
  {#if expanded}
    <div class="search-input-wrapper" transition:fly={{ x: -20, duration: 200 }}>
      <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        bind:this={searchInput}
        type="text"
        bind:value={query}
        {placeholder}
        class="search-input"
        oninput={handleInput}
        onblur={handleBlur}
        onkeydown={handleKeydown}
      />
      <button
        class="search-close"
        onclick={collapseSearch}
        title="Clear search"
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
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  {:else}
    <button
      class="search-toggle"
      onclick={expandSearch}
      title="Search navigation"
      transition:fly={{ x: -20, duration: 200, delay: 50 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      {#if !isCollapsed}
        <span class="search-label" transition:fly={{ x: -15, duration: 200, delay: 75 }}>
          Search
        </span>
      {/if}
    </button>
  {/if}
</div>

<style>
  .search-section {
    padding: 0.5rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
  }

  .search-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text, var(--color-base06, #F3F4F7));
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
  }

  .search-toggle:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
  }

  .search-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
  }

  .search-icon {
    position: absolute;
    left: 1.25rem;
    color: var(--color-text-muted, var(--color-base04, #737E99));
    pointer-events: none;
    z-index: 10;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.5rem 0.5rem 2.25rem;
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
    border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 40%, transparent);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: var(--color-text, var(--color-base06, #F3F4F7));
    transition: all 200ms ease;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--color-text-muted, var(--color-base04, #737E99));
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: var(--color-surface, var(--color-base01, #2C3040));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 20%, transparent);
  }

  .search-close {
    position: absolute;
    right: 1.25rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all 200ms ease;
  }

  .search-close:hover {
    background-color: color-mix(in srgb, var(--color-base03, #565E78) 50%, transparent);
    color: var(--color-text, var(--color-base06, #F3F4F7));
  }
</style>