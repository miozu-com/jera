<!--
  @component NumberInput

  A number input with increment/decrement buttons.

  @example
  <NumberInput bind:value={quantity} min={1} max={100} />

  @example
  // With step
  <NumberInput bind:value={price} step={0.5} min={0} />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    value = $bindable(0),
    min = -Infinity,
    max = Infinity,
    step = 1,
    placeholder = '',
    disabled = false,
    required = false,
    name = '',
    id = '',
    size = 'md',
    class: className = '',
    error = false,
    oninput,
    onchange,
    ...rest
  } = $props();

  function ensureNumber(val) {
    const num = parseFloat(val);
    return isNaN(num) ? min > -Infinity ? min : 0 : num;
  }

  function increment() {
    if (disabled) return;
    const newValue = Math.min(ensureNumber(value) + step, max);
    if (newValue !== value) {
      value = newValue;
      triggerChange();
    }
  }

  function decrement() {
    if (disabled) return;
    const newValue = Math.max(ensureNumber(value) - step, min);
    if (newValue !== value) {
      value = newValue;
      triggerChange();
    }
  }

  function handleInput(e) {
    const inputValue = e.target.value;
    if (inputValue === '' || inputValue === '-') {
      value = inputValue;
      oninput?.(e);
      return;
    }

    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      value = Math.max(min, Math.min(num, max));
    }
    oninput?.(e);
  }

  function handleBlur(e) {
    const num = ensureNumber(value);
    value = Math.max(min, Math.min(num, max));
    triggerChange();
  }

  function triggerChange() {
    onchange?.({ target: { name, value } });
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  }
</script>

<div class="number-input number-input-{size} {className}" class:number-input-error={error}>
  <button
    type="button"
    class="number-btn number-btn-decrement"
    onclick={decrement}
    disabled={disabled || value <= min}
    aria-label="Decrease value"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>

  <input
    {id}
    {name}
    type="text"
    inputmode="decimal"
    class="number-field"
    value={value}
    {placeholder}
    {disabled}
    {required}
    oninput={handleInput}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    aria-invalid={error || undefined}
    {...rest}
  />

  <button
    type="button"
    class="number-btn number-btn-increment"
    onclick={increment}
    disabled={disabled || value >= max}
    aria-label="Increase value"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>
</div>

<style>
  .number-input {
    display: inline-flex;
    align-items: stretch;
    width: 100%;
  }

  .number-input-sm { height: 2rem; }
  .number-input-md { height: 2.25rem; }
  .number-input-lg { height: 2.75rem; }

  .number-field {
    flex: 1;
    min-width: 0;
    padding: 0 var(--space-3);
    text-align: center;
    font-size: var(--text-sm);
    color: var(--color-base07);
    background: var(--color-base00);
    border-top: 1px solid var(--color-base02);
    border-bottom: 1px solid var(--color-base02);
    border-left: none;
    border-right: none;
    transition: var(--transition-colors);
    font-family: inherit;
  }

  .number-field:focus {
    outline: none;
    border-color: var(--color-base0D);
  }

  .number-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .number-field::placeholder {
    color: var(--color-base04);
  }

  /* Hide native spinners */
  .number-field::-webkit-outer-spin-button,
  .number-field::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .number-field[type="number"] {
    -moz-appearance: textfield;
  }

  .number-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-3);
    color: var(--color-base04);
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .number-btn:hover:not(:disabled) {
    color: var(--color-base07);
    background: var(--color-base02);
  }

  .number-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .number-btn-decrement {
    border-radius: var(--radius-default) 0 0 var(--radius-default);
  }

  .number-btn-increment {
    border-radius: 0 var(--radius-default) var(--radius-default) 0;
  }

  .number-input-error .number-field {
    border-color: var(--color-base08);
  }

  .number-input-error .number-btn {
    border-color: var(--color-base08);
  }
</style>
