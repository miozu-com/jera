<!--
  @component FilterChip

  A toggleable chip for filtering content.
  Supports icons, counts, and multiple selection modes.

  @example Basic filter chip
  <FilterChip
    label="Active"
    active={filters.active}
    onclick={() => toggleFilter('active')}
  />

  @example With icon and count
  <FilterChip
    label="Critical"
    active={showCritical}
    count={criticalCount}
    variant="error"
  >
    {#snippet icon()}
      <AlertIcon size={14} />
    {/snippet}
  </FilterChip>

  @example Group of filters
  <div class="filter-group">
    {#each filters as filter}
      <FilterChip
        label={filter.label}
        active={activeFilters.includes(filter.id)}
        onclick={() => toggleFilter(filter.id)}
      />
    {/each}
  </div>
-->
<script>
  let {
    label = '',
    active = false,
    count = null,
    variant = 'default',
    disabled = false,
    class: className = '',
    icon,
    onclick
  } = $props();
</script>

<button
  type="button"
  class="filter-chip filter-chip-{variant}"
  class:active
  class:disabled
  {disabled}
  {onclick}
  aria-pressed={active}
>
  {#if icon}
    <span class="chip-icon">
      {@render icon()}
    </span>
  {/if}
  <span class="chip-label">{label}</span>
  {#if count !== null}
    <span class="chip-count">{count}</span>
  {/if}
</button>

<style>
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 500;
    background: transparent;
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-lg);
    color: var(--color-base04);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .filter-chip:hover:not(.disabled) {
    border-color: var(--color-base03);
    color: var(--color-base05);
    background: var(--color-base01);
  }

  .filter-chip:focus-visible {
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }

  .filter-chip.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Active states by variant */
  .filter-chip-default.active {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D) 40%, transparent);
    color: var(--color-base0D);
  }

  .filter-chip-error.active {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base08) 40%, transparent);
    color: var(--color-base08);
  }

  .filter-chip-warning.active {
    background: color-mix(in srgb, var(--color-base0A) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base0A) 40%, transparent);
    color: var(--color-base0A);
  }

  .filter-chip-success.active {
    background: color-mix(in srgb, var(--color-base0B) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base0B) 40%, transparent);
    color: var(--color-base0B);
  }

  .filter-chip-info.active {
    background: color-mix(in srgb, var(--color-base0C) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base0C) 40%, transparent);
    color: var(--color-base0C);
  }

  .chip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chip-label {
    line-height: 1;
  }

  .chip-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 var(--space-1);
    font-size: var(--text-xs);
    font-weight: 600;
    background: var(--color-base02);
    color: var(--color-base05);
    border-radius: 9999px;
  }

  .filter-chip.active .chip-count {
    background: currentColor;
    color: var(--color-base00);
    opacity: 0.8;
  }
</style>
