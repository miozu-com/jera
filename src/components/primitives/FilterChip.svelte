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

  @example Compact pill (opt-in): a question chip on a dense card
  <FilterChip size="sm" shape="pill" label="Real size?" title="What are its real dimensions?" />

  @example Dashed (opt-in): an unanswered gap, not a fact
  <FilterChip size="sm" shape="pill" dashed label="Real size?" />

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
  import { cn } from '../../utils/cn.svelte.js';

  let {
    label = '',
    active = false,
    count = null,
    variant = 'default',
    disabled = false,
    /** 'md' (default) | 'sm' — dense-row chip, --text-dense, 24px tall (opt-in). */
    size = 'md',
    /** 'default' (radius-lg) | 'pill' — fully rounded (opt-in). */
    shape = 'default',
    /** Dashed border while inactive — an empty slot to fill (opt-in). */
    dashed = false,
    class: className = '',
    icon,
    onclick,
    ...rest
  } = $props();
</script>

<button
  type="button"
  {...rest}
  class={cn('filter-chip', `filter-chip-${variant}`, className)}
  class:filter-chip-sm={size === 'sm'}
  class:filter-chip-pill={shape === 'pill'}
  class:filter-chip-dashed={dashed}
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
    gap: var(--space-4);
    padding: var(--space-2) var(--space-6);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    background: transparent;
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-lg);
    color: var(--color-base04);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .filter-chip-sm {
    gap: var(--space-2);
    min-height: 1.5rem;
    padding: 0 var(--space-3);
    font-size: var(--text-dense, var(--text-xs));
  }

  .filter-chip-dashed:not(.active) {
    border-style: dashed;
  }

  .filter-chip-pill {
    border-radius: var(--radius-full, 999px);
  }

  .filter-chip:hover:not(.disabled):not(.active) {
    border-color: var(--color-base03);
    color: var(--color-base05);
    background: var(--color-base01);
  }

  .filter-chip:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  .filter-chip.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Active states by variant — each variant only sets the accent token;
     the shared .active rule derives bg/border/text/count from it. */
  .filter-chip-default.active { --chip-accent: var(--color-base0D); }
  .filter-chip-error.active   { --chip-accent: var(--color-base08); }
  .filter-chip-warning.active { --chip-accent: var(--color-base0A); }
  .filter-chip-success.active { --chip-accent: var(--color-base0B); }
  .filter-chip-info.active    { --chip-accent: var(--color-base0C); }
  .filter-chip-accent.active  { --chip-accent: var(--color-base0E); }

  .filter-chip.active {
    background: color-mix(in srgb, var(--chip-accent) 10%, transparent);
    border-color: color-mix(in srgb, var(--chip-accent) 40%, transparent);
    color: var(--chip-accent);
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
    padding: 0 var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    background: var(--color-base02);
    color: var(--color-base05);
    border-radius: var(--radius-default);
    transition: var(--transition-colors);
  }

  /* Inverted count pill: solid accent fill, page-background text.
     NOTE: never use `background: currentColor` here — currentColor resolves
     against this element's own `color`, so fill and text collapse to one value. */
  .filter-chip.active .chip-count {
    background: var(--chip-accent);
    color: var(--color-base00);
  }
</style>
