<!--
  @component NavigationSearch

  Enterprise search block with advanced filtering and customization.
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly } from 'svelte/transition';
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

  // Block configuration with defaults
  const config = $derived({
    placeholder: 'Search navigation...',
    expandable: true,
    showClearButton: true,
    debounceMs: 300,
    caseSensitive: false,
    ...block.config
  });

  let searchInput;
  let searchExpanded = $state(false);
  let debounceTimer;

  // Reactive search query from navigation state
  const searchQuery = $derived(navState?.searchQuery ?? '');

  function expandSearch() {
    searchExpanded = true;
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 50);

    if (onEvent) onEvent('search_expanded', {});
  }

  function collapseSearch() {
    searchExpanded = false;
    if (navState) {
      navState.clearSearch();
    }

    if (onEvent) onEvent('search_collapsed', {});
  }

  function handleInput(event) {
    const query = event.target.value;

    // Clear previous debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce search
    debounceTimer = setTimeout(() => {
      if (navState) {
        navState.search(query);
      }

      if (onEvent) {
        onEvent('search_query_changed', { query });
      }
    }, config.debounceMs);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      collapseSearch();
    }

    if (onEvent) {
      onEvent('search_keydown', { key: event.key, query: searchQuery });
    }
  }

  function handleBlur() {
    setTimeout(() => {
      if (!searchQuery?.trim()) {
        searchExpanded = false;
      }
    }, 200);
  }

  function clearSearch() {
    if (navState) {
      navState.clearSearch();
    }
    collapseSearch();

    if (onEvent) onEvent('search_cleared', {});
  }
</script>

<div class="nav-search-block">
  {#if searchExpanded || !config.expandable}
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
        value={searchQuery}
        placeholder={config.placeholder}
        class="search-input"
        oninput={handleInput}
        onblur={handleBlur}
        onkeydown={handleKeydown}
      />

      {#if config.showClearButton && searchQuery}
        <button
          class="search-clear"
          onclick={clearSearch}
          title="Clear search"
          transition:fade={{ duration: 150 }}
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
      {/if}
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

  <!-- Search results summary -->
  {#if searchQuery && navState?.visibleItemCount !== navState?.totalItemCount}
    <div class="search-results-summary" transition:fade={{ duration: 200 }}>
      <span class="results-text">
        {navState.visibleItemCount} of {navState.totalItemCount} items
      </span>
    </div>
  {/if}
</div>

<style>
  .nav-search-block {
    padding: var(--nav-search-block-padding, 0.5rem);
    border-bottom: var(--nav-search-border, 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent));
  }

  .search-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
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

  .search-toggle:hover {
    color: var(--nav-item-hover-color);
    background: var(--nav-item-hover-background);
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
    padding: 0.5rem 2.25rem 0.5rem 2.25rem;
    background: var(--color-surface-alt, var(--color-base02, #3E4359));
    border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 40%, transparent);
    border-radius: var(--nav-item-border-radius);
    font-size: 0.875rem;
    color: var(--nav-item-color);
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--color-text-muted, var(--color-base04, #737E99));
  }

  .search-input:focus {
    outline: none;
    border-color: var(--nav-item-active-color);
    background: var(--nav-container-bg);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--nav-item-active-color) 20%, transparent);
  }

  .search-clear {
    position: absolute;
    right: 1.25rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
  }

  .search-clear:hover {
    background: color-mix(in srgb, var(--color-base03, #565E78) 50%, transparent);
    color: var(--nav-item-color);
  }

  .search-results-summary {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    text-align: center;
  }

  .results-text {
    font-weight: 500;
  }
</style>