<!--
  @component IconInput

  An input wrapper that supports left/right icons, loading states, and clearable functionality.

  @example Basic with icon
  <IconInput bind:value={email} placeholder="Email">
    {#snippet leftIcon()}
      <MailIcon size={16} />
    {/snippet}
  </IconInput>

  @example With loading and clearable
  <IconInput
    bind:value={search}
    placeholder="Search..."
    loading
    clearable
    onclear={() => search = ''}
  >
    {#snippet leftIcon()}
      <SearchIcon size={16} />
    {/snippet}
  </IconInput>
-->
<script>
  import Input from './Input.svelte';

  let {
    value = $bindable(''),
    type = 'text',
    placeholder = '',
    disabled = false,
    size = 'md',
    loading = false,
    clearable = false,
    class: className = '',
    leftIcon,
    rightIcon,
    oninput,
    onchange,
    onclear,
    ...rest
  } = $props();

  function handleClear() {
    value = '';
    onclear?.();
  }

  const showClearButton = $derived(clearable && value && !loading);
  const hasLeftIcon = $derived(!!leftIcon);
  const hasRightIcon = $derived(!!rightIcon || loading || showClearButton);
</script>

<div class="icon-input icon-input-{size} {className}">
  {#if leftIcon}
    <span class="icon-left">
      {#if loading}
        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
        </svg>
      {:else}
        {@render leftIcon()}
      {/if}
    </span>
  {/if}

  <Input
    {type}
    bind:value
    {placeholder}
    {disabled}
    {size}
    class="icon-input-field"
    style="padding-left: {hasLeftIcon ? '2.5rem' : ''}; padding-right: {hasRightIcon ? '2.5rem' : ''};"
    {oninput}
    {onchange}
    {...rest}
  />

  {#if showClearButton}
    <button
      type="button"
      class="icon-clear"
      onclick={handleClear}
      aria-label="Clear input"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  {:else if rightIcon && !loading}
    <span class="icon-right">
      {@render rightIcon()}
    </span>
  {:else if loading && !leftIcon}
    <span class="icon-right">
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
      </svg>
    </span>
  {/if}
</div>

<style>
  .icon-input {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 100%;
  }

  .icon-input :global(.icon-input-field) {
    width: 100%;
  }

  .icon-left,
  .icon-right {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base04);
    pointer-events: none;
  }

  .icon-left {
    left: 0.75rem;
  }

  .icon-right {
    right: 0.75rem;
  }

  .icon-input-sm .icon-left,
  .icon-input-sm .icon-right {
    left: 0.625rem;
  }

  .icon-input-sm .icon-right {
    right: 0.625rem;
  }

  .icon-input-lg .icon-left {
    left: 1rem;
  }

  .icon-input-lg .icon-right {
    right: 1rem;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .icon-clear {
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

  .icon-clear:hover {
    color: var(--color-base05);
    background: var(--color-base02);
  }
</style>
