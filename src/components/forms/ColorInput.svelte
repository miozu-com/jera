<!--
  @component ColorInput

  A hex colour field: one bordered box (the form border standard) holding a
  swatch that is a native `<input type="color">` — click it for the OS picker —
  and a hex text field. No picker library: the browser's own picker is the
  native-first answer, and the text field covers exact values.

  `value` is always '' or an uppercase `#RRGGBB`. Typing commits as soon as six
  hex digits are there (`1f3a5f`, `#1F3A5F`); a three-digit shorthand commits on
  Enter or blur. Text that is not a colour shows the error border while typing
  and reverts to the last committed value on blur, so the bound value is never
  invalid.

  @example
  <ColorInput bind:value={primary} id="brand-primary" label="Primary colour" />

  @example
  <ColorInput bind:value={accent} label="Accent" size="sm" onchange={(hex) => save(hex)} />
-->
<script>
  import ColorSwatch from '../primitives/ColorSwatch.svelte';
  import { normalizeHex } from '../../utils/color.js';

  let {
    value = $bindable(''),
    id = '',
    name = '',
    label = 'Colour',
    size = 'md',
    disabled = false,
    required = false,
    error = false,
    placeholder = '#000000',
    onchange,
    class: className = '',
    ...rest
  } = $props();

  const SWATCH_SIZE = { sm: 'xs', md: 'sm', lg: 'md' };

  let editing = $state(false);
  let draft = $state('');

  const draftInvalid = $derived(
    editing && (/[^#0-9a-f\s]/i.test(draft) || draft.replace(/[#\s]/g, '').length > 6)
  );

  function commit(hex) {
    if (hex === value) return;
    value = hex;
    onchange?.(hex);
  }

  function handleFocus() {
    draft = value;
    editing = true;
  }

  function handleInput(e) {
    draft = e.currentTarget.value;
    const digits = draft.replace(/[#\s]/g, '');
    if (digits.length === 6) {
      const hex = normalizeHex(draft);
      if (hex) commit(hex);
    }
  }

  // Enter and blur settle the field: a valid value (shorthand included)
  // commits, an emptied optional field clears, anything else reverts.
  function settle() {
    const text = draft.trim();
    if (text === '' && !required) commit('');
    else {
      const hex = normalizeHex(text);
      if (hex) commit(hex);
    }
    draft = value;
  }

  function handleBlur() {
    settle();
    editing = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      settle();
    } else if (e.key === 'Escape') {
      draft = value;
    }
  }

  function handlePick(e) {
    const hex = normalizeHex(e.currentTarget.value);
    if (hex) commit(hex);
  }
</script>

<div
  class="color-input color-input-{size} {className}"
  class:color-input-error={error || draftInvalid}
  class:color-input-disabled={disabled}
  {...rest}
>
  <span class="color-input-picker">
    <ColorSwatch hex={value} size={SWATCH_SIZE[size] ?? 'sm'} aria-hidden="true" />
    <input
      type="color"
      class="color-input-native"
      value={(value || '#000000').toLowerCase()}
      oninput={handlePick}
      {disabled}
      aria-label="{label}: pick a colour"
    />
  </span>
  <input
    type="text"
    class="color-input-hex"
    id={id || undefined}
    name={name || undefined}
    value={editing ? draft : value}
    {placeholder}
    {disabled}
    {required}
    maxlength="9"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    aria-label={label}
    aria-invalid={error || draftInvalid || undefined}
    onfocus={handleFocus}
    oninput={handleInput}
    onblur={handleBlur}
    onkeydown={handleKeydown}
  />
</div>

<style>
  .color-input {
    display: flex;
    align-items: center;
    gap: var(--space-4, 0.5rem);
    width: 100%;
    height: 2.5rem;
    padding: 0 var(--space-6, 0.75rem) 0 var(--space-4, 0.5rem);
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md, 0.375rem);
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  }

  .color-input:hover:not(.color-input-disabled) {
    border-color: var(--color-base03);
  }

  .color-input:focus-within {
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .color-input-sm {
    height: 2rem;
    padding: 0 0.5rem 0 0.375rem;
  }

  .color-input-lg {
    height: 3rem;
    border-radius: var(--radius-lg);
  }

  .color-input-error,
  .color-input-error:hover:not(.color-input-disabled) {
    border-color: var(--color-base08);
  }

  .color-input-error:focus-within {
    border-color: var(--color-base08);
    box-shadow: var(--focus-ring-shadow-error);
  }

  .color-input-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* The native colour input sits invisibly over the swatch: the swatch is what
     the owner sees, the input is what the click and keyboard reach, so the
     OS picker opens anchored to it. */
  .color-input-picker {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  .color-input-native {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    opacity: 0;
    cursor: pointer;
  }

  .color-input-native:disabled {
    cursor: not-allowed;
  }

  .color-input-picker:has(.color-input-native:focus-visible) {
    border-radius: var(--radius-md);
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }

  .color-input-hex {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-base07);
    text-transform: uppercase; /* type-lint: allow -- codes and initials */
    background: transparent;
    border: none;
    outline: none;
  }

  .color-input-sm .color-input-hex {
    font-size: var(--text-xs, 0.75rem);
  }

  .color-input-lg .color-input-hex {
    font-size: var(--text-base, 1rem);
  }

  .color-input-hex::placeholder {
    color: var(--color-base04);
    text-transform: none;
  }

  .color-input-hex:disabled {
    cursor: not-allowed;
  }

  /* Same iOS focus-zoom guard as Input: 16px on touch pointers. */
  @media (pointer: coarse) {
    .color-input-hex {
      font-size: max(16px, var(--text-sm, 0.875rem));
    }
  }
</style>
