<!--
  @component Select

  A native select component styled with base16 design tokens.
  Uses the browser's built-in `<select>` element for accessibility,
  keyboard navigation, and mobile-friendly dropdowns.

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

  let {
    options = [],
    value = $bindable(null),
    placeholder = 'Select...',
    labelKey = 'label',
    valueKey = 'value',
    size = 'md',
    disabled = false,
    error = false,
    id = undefined,
    name = undefined,
    required = false,
    class: className = '',
    onchange,
    ...rest
  } = $props();

  const hasValue = $derived(value !== null && value !== undefined && value !== '');

  function handleChange(event) {
    const selectedValue = event.target.value;
    const option = options.find((opt) => String(opt[valueKey]) === selectedValue);
    if (option) {
      value = option[valueKey];
      onchange?.(option);
    }
  }
</script>

<div class={cn('jera-select-wrapper', `jera-select-${size}`, error && 'jera-select-error', className)}>
  <select
    {id}
    {name}
    {disabled}
    {required}
    class={cn('jera-select', !hasValue && 'jera-select-placeholder')}
    value={value ?? ''}
    onchange={handleChange}
    aria-invalid={error || undefined}
    {...rest}
  >
    <option value="" disabled hidden>{placeholder}</option>
    {#each options as option (option[valueKey])}
      <option value={option[valueKey]}>{option[labelKey]}</option>
    {/each}
  </select>
  <svg class="jera-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</div>

<style>
  .jera-select-wrapper {
    position: relative;
    display: inline-flex;
    width: 100%;
  }

  .jera-select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    height: 2.5rem;
    padding: 0 2rem 0 0.75rem;
    border-radius: var(--radius-md);
    border: var(--border-width-default) solid var(--color-base02);
    background-color: var(--color-base00);
    color: var(--color-base07);
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  }

  .jera-select.jera-select-placeholder {
    color: var(--color-base04);
  }

  .jera-select:hover:not(:disabled) {
    border-color: var(--color-base03);
  }

  .jera-select:focus-visible {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .jera-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .jera-select-error .jera-select {
    border-color: var(--color-base08);
  }

  .jera-select-error .jera-select:focus-visible {
    box-shadow: var(--focus-ring-shadow-error);
  }

  .jera-select-chevron {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    color: var(--color-base04);
    pointer-events: none;
  }

  /* Size: xs */
  .jera-select-xs .jera-select {
    height: 1.625rem;
    padding: 0 1.5rem 0 0.375rem;
    font-size: 0.75rem;
    border-radius: var(--radius-default);
  }

  .jera-select-xs .jera-select-chevron {
    right: 0.25rem;
    width: 0.75rem;
    height: 0.75rem;
  }

  /* Size: sm */
  .jera-select-sm .jera-select {
    height: 2rem;
    padding: 0 1.75rem 0 0.5rem;
    font-size: 0.75rem;
    border-radius: var(--radius-md);
  }

  .jera-select-sm .jera-select-chevron {
    right: 0.375rem;
    width: 0.75rem;
    height: 0.75rem;
  }

  /* Size: md is the default — no overrides needed */

  /* Size: lg */
  .jera-select-lg .jera-select {
    height: 3rem;
    padding: 0 2.5rem 0 1rem;
    font-size: 1rem;
    border-radius: var(--radius-lg);
  }

  .jera-select-lg .jera-select-chevron {
    right: 0.75rem;
  }
</style>
