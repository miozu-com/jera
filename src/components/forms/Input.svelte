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
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--leading-normal, 1.5);
    color: var(--color-base07);
    background-color: var(--color-base00);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md, 0.375rem);
    transition: border-color 150ms, box-shadow 150ms;
  }

  .input-base::placeholder {
    color: var(--color-base04);
  }

  .input-base:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
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
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base08) 20%, transparent);
  }
</style>
