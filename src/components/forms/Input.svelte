<!--
  @component Input

  A flexible text input component with full browser feature control.

  @example
  <Input bind:value={email} type="email" placeholder="Enter email" />

  @example
  // Disable browser autofill (for sensitive fields)
  <Input bind:value={password} type="password" disableBrowserFeatures />

  @example Prefix / suffix inside the field (units, currency)
  <Input inputmode="numeric" placeholder="Any">{#snippet prefix()}$ {/snippet}</Input>
  <Input inputmode="numeric">{#snippet suffix()}%{/snippet}</Input>
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
    size = 'md',
    class: className = '',
    unstyled = false,
    disableBrowserFeatures = false,
    error = false,
    oninput,
    onchange,
    onkeydown,
    onfocus,
    onblur,
    prefix,
    suffix,
    ...rest
  } = $props();

  const affixed = $derived(!!(prefix || suffix));

  const finalAutocomplete = $derived(
    disableBrowserFeatures ? 'new-password' : autocomplete
  );

  const inputClass = $derived(
    unstyled ? className : cn(
      'input-base',
      `input-${size}`,
      error && 'input-error',
      prefix && 'input-has-prefix',
      suffix && 'input-has-suffix',
      !affixed && className
    )
  );
</script>

{#snippet field()}
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
{/snippet}

{#if affixed}
  <!-- Layout-only wrapper: the affixes sit inside the input's own border. -->
  <span class={cn('input-affix', `input-affix-${size}`, className)}>
    {#if prefix}<span class="input-prefix" aria-hidden="true">{@render prefix()}</span>{/if}
    {@render field()}
    {#if suffix}<span class="input-suffix" aria-hidden="true">{@render suffix()}</span>{/if}
  </span>
{:else}
  {@render field()}
{/if}

<style>
  .input-affix {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 100%;
    min-width: 0;
  }

  .input-prefix,
  .input-suffix {
    position: absolute;
    inset-block: 0;
    display: inline-flex;
    align-items: center;
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-base04);
    pointer-events: none;
  }

  .input-prefix {
    inset-inline-start: 0.5rem;
  }

  .input-suffix {
    inset-inline-end: 0.5rem;
  }

  .input-affix-xs .input-prefix,
  .input-affix-xs .input-suffix,
  .input-affix-sm .input-prefix,
  .input-affix-sm .input-suffix {
    font-size: var(--text-xs, 0.75rem);
  }

  .input-affix .input-has-prefix {
    padding-inline-start: 1.375rem;
  }

  .input-affix .input-has-suffix {
    padding-inline-end: 1.5rem;
  }

  .input-base {
    width: 100%;
    height: 2.5rem;
    padding: var(--space-4, 0.5rem) var(--space-6, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--leading-normal, 1.5);
    color: var(--color-base07);
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md, 0.375rem);
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  }

  /* Size scale (`jera-lifecycle.md`'s size table: xs/sm/md/lg), same heights
     and radii as `Select`/`SearchInput` so a row that mixes an Input with
     either reads as one control height, not three. `md` is the default —
     identical to the unscaled rule above, kept for anyone who passes it
     explicitly. */
  .input-xs {
    height: 1.625rem;
    padding: 0 0.375rem;
    font-size: var(--text-xs, 0.75rem);
    border-radius: var(--radius-default);
  }

  .input-sm {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: var(--text-xs, 0.75rem);
    border-radius: var(--radius-md);
  }

  .input-md {
    height: 2.5rem;
    padding: var(--space-4, 0.5rem) var(--space-6, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    border-radius: var(--radius-md);
  }

  .input-lg {
    height: 3rem;
    padding: 0 1rem;
    font-size: var(--text-base, 1rem);
    border-radius: var(--radius-lg);
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
