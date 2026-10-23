<!--
  @component Checkbox

  An accessible checkbox input with custom styling.

  @example
  <Checkbox bind:checked={agreed}>I agree to the terms</Checkbox>

  @example
  <Checkbox bind:checked={enabled} disabled>Disabled option</Checkbox>

  @example A table's select-all: no label, small, mixed while some rows are on
  <Checkbox size="sm" checked={allOn} indeterminate={someOn} aria-label="Select all" />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { generateId } from '../../utils/reactive.svelte.js';

  let {
    checked = $bindable(false),
    disabled = false,
    required = false,
    error = false,
    /** Mixed state (some of a group on): draws a bar and sets the input's own
        `indeterminate`, which assistive tech reads as "mixed". */
    indeterminate = false,
    /** 'md' (1.125rem box) or 'sm' (1rem box, for dense table rows). */
    size = 'md',
    name = '',
    id,
    class: className = '',
    children,
    onchange,
    ...rest
  } = $props();

  const inputId = id || generateId();
  let input = $state(null);

  // The DOM property has no attribute; a click clears it natively, so it is set
  // again whenever the checked state changes too.
  $effect(() => {
    checked;
    if (input) input.indeterminate = indeterminate;
  });
  const checkboxClass = $derived(cn(
    'checkbox-box',
    error && 'checkbox-error'
  ));
</script>

<label
  class={cn('checkbox-wrapper', size === 'sm' && 'checkbox-sm', disabled && 'checkbox-disabled', className)}
  for={inputId}
>
  <input
    type="checkbox"
    id={inputId}
    {name}
    {disabled}
    {required}
    bind:this={input}
    bind:checked
    {onchange}
    class="checkbox-input"
    aria-invalid={error || undefined}
    {...rest}
  />

  <span class={checkboxClass}>
    <svg
      class="checkbox-icon"
      class:checkbox-icon-visible={checked || indeterminate}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {#if indeterminate}
        <path d="M5 12h14" />
      {:else}
        <path d="M20 6 9 17l-5-5" />
      {/if}
    </svg>
  </span>

  {#if children}
    <span class="checkbox-label">
      {@render children()}
    </span>
  {/if}
</label>

<style>
  .checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    gap: var(--space-4);
    min-width: 0;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* A long label never squeezes the box: every row's box is the same size. */
  .checkbox-box {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-default);
    background-color: var(--color-base00);
    transition: var(--transition-all);
  }

  .checkbox-input:checked + .checkbox-box,
  .checkbox-input:indeterminate + .checkbox-box {
    background-color: var(--color-base0D);
    border-color: var(--color-base0D);
  }

  .checkbox-error {
    border-color: var(--color-base08);
  }

  .checkbox-input:checked + .checkbox-error {
    background-color: var(--color-base08);
    border-color: var(--color-base08);
  }

  .checkbox-input:focus-visible + .checkbox-box {
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .checkbox-input:focus-visible + .checkbox-error {
    border-color: var(--color-base08);
    box-shadow: var(--focus-ring-shadow-error);
  }

  .checkbox-icon {
    width: 0.75rem;
    height: 0.75rem;
    color: white;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity var(--duration-fast), transform var(--duration-fast);
  }

  .checkbox-icon-visible {
    opacity: 1;
    transform: scale(1);
  }

  .checkbox-sm .checkbox-box {
    width: 1rem;
    height: 1rem;
  }

  .checkbox-sm .checkbox-icon {
    width: 0.625rem;
    height: 0.625rem;
  }

  .checkbox-label {
    font-size: var(--text-sm);
    color: var(--color-base05);
  }
</style>
