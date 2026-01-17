<!--
  @component Select

  An accessible dropdown select component with keyboard navigation.
  Demonstrates advanced Svelte 5 patterns:

  - $state for local UI state
  - $derived for computed values
  - $effect for side effects with cleanup
  - $bindable for two-way value binding
  - Actions for click-outside behavior
  - Keyboard navigation (ArrowUp/Down, Enter, Escape)
  - ARIA attributes for accessibility

  @example
  <Select
    options={[
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' }
    ]}
    bind:value={selected}
    placeholder="Select an option"
  />

  // With custom keys
  <Select
    options={users}
    bind:value={selectedUserId}
    labelKey="name"
    valueKey="id"
  />
-->
<script>
  import { cn, cv } from '../../utils/cn.svelte.js';
  import { clickOutside } from '../../actions/index.js';
  import { generateId } from '../../utils/reactive.svelte.js';

  /**
   * @typedef {{ [key: string]: any }} Option
   */

  let {
    options = [],
    value = $bindable(null),
    placeholder = 'Select...',
    labelKey = 'label',
    valueKey = 'value',
    disabled = false,
    error = false,
    class: className = '',
    onchange
  } = $props();

  // Generate unique IDs for accessibility
  const triggerId = generateId();
  const listboxId = generateId();

  // Local state
  let isOpen = $state(false);
  let highlightedIndex = $state(-1);
  let triggerRef = $state(null);
  let listRef = $state(null);

  // Derived values
  const selectedOption = $derived(
    options.find(opt => opt[valueKey] === value) ?? null
  );

  const selectedLabel = $derived(
    selectedOption ? selectedOption[labelKey] : placeholder
  );

  const hasValue = $derived(value !== null && value !== undefined);

  // Keyboard navigation effect
  $effect(() => {
    if (!isOpen) {
      highlightedIndex = -1;
      return;
    }

    // Focus the listbox when opened
    listRef?.focus();

    // Set initial highlight to selected option
    const selectedIdx = options.findIndex(opt => opt[valueKey] === value);
    highlightedIndex = selectedIdx >= 0 ? selectedIdx : 0;
  });

  // Scroll highlighted option into view
  $effect(() => {
    if (!isOpen || highlightedIndex < 0) return;

    const listbox = listRef;
    const highlighted = listbox?.querySelector(`[data-index="${highlightedIndex}"]`);
    highlighted?.scrollIntoView({ block: 'nearest' });
  });

  // Handlers
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
        if (!isOpen) {
          isOpen = true;
        } else {
          highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          isOpen = true;
        } else {
          highlightedIndex = Math.max(highlightedIndex - 1, 0);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          select(options[highlightedIndex]);
        } else {
          toggle();
        }
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

  // Styles
  const triggerStyles = cv({
    base: [
      'relative w-full flex items-center justify-between gap-2',
      'h-10 px-3 rounded-lg border',
      'text-sm text-left',
      'transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ].join(' '),

    variants: {
      error: {
        true: 'border-error focus-visible:ring-error/50',
        false: 'border-border hover:border-muted focus-visible:ring-primary/50'
      },
      open: {
        true: 'border-primary ring-2 ring-primary/20',
        false: ''
      },
      hasValue: {
        true: 'text-text-strong',
        false: 'text-muted'
      }
    },

    defaults: {
      error: false,
      open: false,
      hasValue: false
    }
  });
</script>

<div
  class={cn('relative', className)}
  use:clickOutside={close}
>
  <!-- Trigger Button -->
  <button
    bind:this={triggerRef}
    id={triggerId}
    type="button"
    class={triggerStyles({ error, open: isOpen, hasValue })}
    {disabled}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listboxId}
    aria-invalid={error || undefined}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="truncate flex-1">
      {selectedLabel}
    </span>

    <!-- Chevron Icon -->
    <svg
      class={cn(
        'w-4 h-4 shrink-0 text-muted transition-transform duration-200',
        isOpen && 'rotate-180'
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>

  <!-- Dropdown Listbox -->
  {#if isOpen}
    <div
      bind:this={listRef}
      id={listboxId}
      role="listbox"
      tabindex="-1"
      aria-labelledby={triggerId}
      aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
      class={cn(
        'absolute z-50 w-full mt-1',
        'max-h-60 overflow-auto',
        'bg-surface border border-border rounded-lg shadow-lg',
        'py-1',
        'animate-in fade-in slide-in-from-top-2 duration-150'
      )}
      onkeydown={handleKeydown}
    >
      {#if options.length === 0}
        <div class="px-3 py-2 text-sm text-muted text-center">
          No options available
        </div>
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
            class={cn(
              'w-full flex items-center gap-2 px-3 py-2',
              'text-sm text-left',
              'transition-colors duration-75',
              'focus:outline-none',
              isHighlighted && 'bg-hover',
              isSelected && 'text-primary font-medium',
              !isSelected && 'text-text'
            )}
            onclick={() => select(option)}
            onmouseenter={() => highlightedIndex = index}
          >
            <!-- Check Icon for Selected -->
            <span class={cn('w-4 h-4 shrink-0', !isSelected && 'invisible')}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>

            <span class="truncate flex-1">
              {option[labelKey]}
            </span>
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-in-from-top-2 {
    from { transform: translateY(-0.5rem); }
    to { transform: translateY(0); }
  }

  .animate-in {
    animation: fade-in 150ms ease-out, slide-in-from-top-2 150ms ease-out;
  }
</style>
