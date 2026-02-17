<!--
  @component Select

  An accessible dropdown select component with keyboard navigation.

  @example
  <Select
    options={[
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' }
    ]}
    bind:value={selected}
    placeholder="Select an option"
  />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { clickOutside } from '../../actions/index.js';
  import { generateId } from '../../utils/reactive.svelte.js';

  let {
    options = [],
    value = $bindable(null),
    placeholder = 'Select...',
    labelKey = 'label',
    valueKey = 'value',
    size = 'md',
    disabled = false,
    error = false,
    class: className = '',
    onchange
  } = $props();

  const triggerId = generateId();
  const listboxId = generateId();

  let isOpen = $state(false);
  let highlightedIndex = $state(-1);
  let triggerRef = $state(null);
  let listRef = $state(null);

  const selectedOption = $derived(
    options.find(opt => opt[valueKey] === value) ?? null
  );
  const selectedLabel = $derived(
    selectedOption ? selectedOption[labelKey] : placeholder
  );
  const hasValue = $derived(value !== null && value !== undefined);

  $effect(() => {
    if (!isOpen) {
      highlightedIndex = -1;
      return;
    }
    listRef?.focus();
    const selectedIdx = options.findIndex(opt => opt[valueKey] === value);
    highlightedIndex = selectedIdx >= 0 ? selectedIdx : 0;
  });

  $effect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const highlighted = listRef?.querySelector(`[data-index="${highlightedIndex}"]`);
    highlighted?.scrollIntoView({ block: 'nearest' });
  });

  function toggle() {
    if (disabled) return;
    isOpen = !isOpen;
  }

  function close() {
    isOpen = false;
  }

  function select(option) {
    value = option[valueKey];
    onchange?.(option);
    close();
    triggerRef?.focus();
  }

  function handleKeydown(event) {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) isOpen = true;
        else highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) isOpen = true;
        else highlightedIndex = Math.max(highlightedIndex - 1, 0);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) select(options[highlightedIndex]);
        else toggle();
        break;
      case 'Escape':
        event.preventDefault();
        close();
        triggerRef?.focus();
        break;
      case 'Home':
        event.preventDefault();
        highlightedIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        highlightedIndex = options.length - 1;
        break;
      case 'Tab':
        close();
        break;
    }
  }
</script>

<div class={cn('select-wrapper', className)} use:clickOutside={close}>
  <button
    bind:this={triggerRef}
    id={triggerId}
    type="button"
    class={cn('select-trigger', `select-${size}`, isOpen && 'select-open', error && 'select-error', hasValue && 'has-value')}
    {disabled}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listboxId}
    aria-invalid={error || undefined}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="select-value">{selectedLabel}</span>
    <svg class={cn('select-chevron', isOpen && 'rotated')} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>

  {#if isOpen}
    <div
      bind:this={listRef}
      id={listboxId}
      role="listbox"
      tabindex="-1"
      aria-labelledby={triggerId}
      class={cn('select-dropdown', `select-dropdown-${size}`)}
      onkeydown={handleKeydown}
    >
      {#if options.length === 0}
        <div class="select-empty">No options available</div>
      {:else}
        {#each options as option, index (option[valueKey])}
          {@const isSelected = option[valueKey] === value}
          {@const isHighlighted = index === highlightedIndex}
          <button
            id="{listboxId}-option-{index}"
            type="button"
            role="option"
            data-index={index}
            aria-selected={isSelected}
            class={cn('select-option', isHighlighted && 'highlighted', isSelected && 'selected')}
            onclick={() => select(option)}
            onmouseenter={() => highlightedIndex = index}
          >
            <span class={cn('select-check', !isSelected && 'invisible')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span class="select-option-label">{option[labelKey]}</span>
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .select-wrapper {
    position: relative;
  }

  .select-trigger {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    height: 2.5rem;
    padding: 0 0.75rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-base02);
    background-color: var(--color-base00);
    color: var(--color-base04);
    font-size: 0.875rem;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 150ms, box-shadow 150ms;
  }

  .select-trigger:hover:not(:disabled) {
    border-color: var(--color-base03);
  }

  .select-trigger:focus-visible {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .select-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-trigger.has-value {
    color: var(--color-base07);
  }

  .select-trigger.select-open {
    border-color: var(--color-base0D);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .select-trigger.select-error {
    border-color: var(--color-base08);
  }

  /* Size variants — match Button/SearchInput scale */
  .select-xs {
    height: 1.625rem;
    padding: 0 0.375rem;
    font-size: 0.75rem;
    border-radius: var(--radius-default);
    gap: 0.25rem;
  }

  .select-xs .select-chevron {
    width: 0.75rem;
    height: 0.75rem;
  }

  .select-sm {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.75rem;
    border-radius: var(--radius-md);
    gap: 0.25rem;
  }

  .select-sm .select-chevron {
    width: 0.75rem;
    height: 0.75rem;
  }

  .select-lg {
    height: 3rem;
    padding: 0 1rem;
    font-size: 1rem;
    border-radius: var(--radius-lg);
  }

  .select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-chevron {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: var(--color-base04);
    transition: transform 200ms;
  }

  .select-chevron.rotated {
    transform: rotate(180deg);
  }

  .select-dropdown {
    position: absolute;
    z-index: var(--z-dropdown);
    width: 100%;
    margin-top: 0.25rem;
    max-height: 15rem;
    overflow: auto;
    background-color: var(--color-base01);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3);
    padding: 0.25rem 0;
    animation: dropdown-in 150ms ease-out;
  }

  .select-empty {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--color-base04);
    text-align: center;
  }

  .select-option {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-family: inherit;
    text-align: left;
    color: var(--color-base05);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 75ms;
  }

  .select-option.highlighted {
    background-color: var(--color-base02);
  }

  .select-option.selected {
    color: var(--color-base0D);
    font-weight: 500;
  }

  .select-check {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .select-check.invisible {
    visibility: hidden;
  }

  .select-option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Dropdown size variants */
  .select-dropdown-xs {
    border-radius: var(--radius-default);
  }

  .select-dropdown-xs .select-option {
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  .select-dropdown-xs .select-check {
    width: 0.75rem;
    height: 0.75rem;
  }

  .select-dropdown-xs .select-empty {
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
  }

  .select-dropdown-sm {
    border-radius: var(--radius-default);
  }

  .select-dropdown-sm .select-option {
    padding: 0.3125rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  .select-dropdown-sm .select-check {
    width: 0.75rem;
    height: 0.75rem;
  }

  .select-dropdown-sm .select-empty {
    padding: 0.3125rem 0.5rem;
    font-size: 0.75rem;
  }

  @keyframes dropdown-in {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
