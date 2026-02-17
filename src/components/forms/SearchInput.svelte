<!--
  @component SearchInput

  A search input with icon and clearable functionality.

  @example
  <SearchInput bind:value={query} placeholder="Search..." />

  @example With loading state
  <SearchInput bind:value={query} loading={isSearching} />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    value = $bindable(''),
    placeholder = 'Search...',
    disabled = false,
    loading = false,
    size = 'md',
    class: className = '',
    oninput,
    onchange,
    onclear,
    ...rest
  } = $props();

  function handleClear() {
    value = '';
    onclear?.();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && value) {
      handleClear();
    }
  }
</script>

<div class={cn('search-input', `search-input-${size}`, className)}>
  <span class="search-icon">
    {#if loading}
      <svg class="search-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
      </svg>
    {:else}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    {/if}
  </span>

  <input
    type="search"
    bind:value
    {placeholder}
    {disabled}
    class="search-field"
    onkeydown={handleKeydown}
    {oninput}
    {onchange}
    {...rest}
  />

  {#if value && !loading}
    <button
      type="button"
      class="search-clear"
      onclick={handleClear}
      aria-label="Clear search"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  {/if}
</div>

<style>
  .search-input {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base04);
    pointer-events: none;
  }

  .search-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .search-field {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    padding-left: 2.5rem;
    padding-right: 2.25rem;
    font-size: var(--text-sm);
    color: var(--color-base07);
    background: var(--color-base00);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md);
    transition: var(--transition-colors);
  }

  .search-input-sm .search-field {
    height: 2rem;
    padding: 0 var(--space-2);
    padding-left: 1.75rem;
    padding-right: 1.75rem;
    font-size: var(--text-xs);
  }

  .search-input-sm .search-icon {
    left: 0.5rem;
  }

  .search-input-sm .search-icon svg {
    width: 14px;
    height: 14px;
  }

  .search-input-sm .search-clear {
    right: 0.25rem;
  }

  .search-input-lg .search-field {
    padding: var(--space-3) var(--space-4);
    padding-left: 3rem;
    padding-right: 2.75rem;
    font-size: var(--text-base);
  }

  .search-field::placeholder {
    color: var(--color-base04);
  }

  .search-field:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .search-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Hide native search clear button */
  .search-field::-webkit-search-cancel-button {
    display: none;
  }

  .search-clear {
    position: absolute;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-base04);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .search-clear:hover {
    color: var(--color-base05);
    background: var(--color-base02);
  }
</style>
