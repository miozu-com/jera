<!--
  @component Input

  A flexible text input component with full browser feature control.

  @example
  <Input bind:value={email} type="email" placeholder="Enter email" />

  @example
  // Disable browser autofill (for sensitive fields)
  <Input bind:value={password} type="password" disableBrowserFeatures />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    value = $bindable(''),
    ref = $bindable(),
    type = 'text',
    placeholder = '',
    disabled = false,
    required = false,
    name = '',
    id = '',
    autocomplete = 'on',
    autocorrect = 'off',
    autocapitalize = 'off',
    spellcheck = 'false',
    maxlength,
    minlength,
    inputmode,
    class: className = '',
    unstyled = false,
    disableBrowserFeatures = false,
    error = false,
    oninput,
    onchange,
    onkeydown,
    onfocus,
    onblur,
    ...rest
  } = $props();

  const finalAutocomplete = $derived(
    disableBrowserFeatures ? 'new-password' : autocomplete
  );

  const inputClass = $derived(
    unstyled ? className : cn(
      'input-base',
      error && 'input-error',
      className
    )
  );
</script>

<input
  class={inputClass}
  bind:this={ref}
  bind:value
  {id}
  {name}
  {type}
  {placeholder}
  {disabled}
  {required}
  {inputmode}
  {maxlength}
  {minlength}
  autocomplete={finalAutocomplete}
  autocorrect={disableBrowserFeatures ? 'off' : autocorrect}
  autocapitalize={disableBrowserFeatures ? 'off' : autocapitalize}
  spellcheck={disableBrowserFeatures ? 'false' : spellcheck}
  data-form-type={disableBrowserFeatures ? 'other' : undefined}
  data-lpignore={disableBrowserFeatures ? 'true' : undefined}
  aria-invalid={error || undefined}
  {oninput}
  {onchange}
  {onkeydown}
  {onfocus}
  {onblur}
  {...rest}
/>

<style>
  .input-base {
    width: 100%;
    padding: var(--space-4, 0.5rem) var(--space-6, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--leading-normal, 1.5);
    color: var(--color-base07);
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md, 0.375rem);
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  }

  .input-base::placeholder {
    color: var(--color-base04);
  }

  .input-base:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .input-base:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-error {
    border-color: var(--color-base08);
  }

  .input-error:focus {
    border-color: var(--color-base08);
    box-shadow: var(--focus-ring-shadow-error);
  }

  /* Validation styling after user interaction (not on page load) */
  .input-base:user-invalid {
    border-color: var(--color-base08);
  }

  .input-base:user-invalid:focus {
    box-shadow: var(--focus-ring-shadow-error);
  }

  /* iOS Safari zooms the whole page when a control under 16px takes focus, and
     does not zoom back out — the page is left scrolled and oversized. On a chat
     composer that happens on every message sent from a phone. 16px is the
     documented threshold, so the rule meets it on touch pointers and leaves the
     mouse alone: `--text-sm` stays the design's size everywhere it is safe.
     Keyed on `pointer: coarse` rather than a width breakpoint, because the trap
     belongs to the input method and not to the viewport — a narrow desktop
     window has no zoom behaviour to avoid. */
  @media (pointer: coarse) {
    .input-base {
      font-size: max(16px, var(--text-sm, 0.875rem));
    }
  }
</style>
