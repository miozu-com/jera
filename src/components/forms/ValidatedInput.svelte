<!--
  @component ValidatedInput

  An Input wrapper with built-in client-side validation and optional server-side error display.

  Supports two rule formats:
  - Object: { test: (value) => boolean, message: string } — test returns true = valid
  - Function: (value) => string | null — returns error string or null if valid

  @example
  <ValidatedInput
    bind:value={email}
    label="Email"
    rules={[
      { test: (v) => v.length > 0, message: 'Email is required' },
      { test: (v) => v.includes('@'), message: 'Must be a valid email' }
    ]}
    validateOn="blur"
  />

  @example
  // Function-style rules + server error
  <ValidatedInput
    bind:value={username}
    bind:error={serverError}
    label="Username"
    rules={[(v) => v.length >= 3 ? null : 'Must be at least 3 characters']}
    showSuccess
  />
-->
<script>
  import Input from './Input.svelte';

  let {
    value = $bindable(''),
    label = '',
    rules = [],
    validateOn = 'blur',
    showSuccess = false,
    error = $bindable(''),
    required = false,
    id = null,
    name = null,
    class: className = '',
    onblur: consumerOnblur,
    oninput: consumerOninput,
    ...inputProps
  } = $props();

  let internalError = $state('');
  let touched = $state(false);

  function runRules(val) {
    for (const rule of rules) {
      if (typeof rule === 'function') {
        const msg = rule(val);
        if (msg) return msg;
      } else if (rule && typeof rule.test === 'function') {
        if (!rule.test(val)) return rule.message;
      }
    }
    return '';
  }

  function validate() {
    internalError = runRules(value);
    touched = true;
    return !internalError;
  }

  function handleBlur(event) {
    if (validateOn === 'blur') {
      validate();
    }
    consumerOnblur?.(event);
  }

  function handleInput(event) {
    // Clear external server error when user starts typing
    if (error) error = '';

    if (validateOn === 'input') {
      internalError = runRules(value);
      touched = true;
    } else if (touched) {
      // Re-validate live once the field has been touched (clears error as user fixes it)
      internalError = runRules(value);
    }

    consumerOninput?.(event);
  }

  const displayError = $derived(error || internalError);
  const isValid = $derived(
    showSuccess &&
    value !== '' &&
    value !== null &&
    value !== undefined &&
    !displayError &&
    rules.length > 0 &&
    touched
  );

  const inputId = $derived(id ?? (label ? `vi-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined));
</script>

<div class="validated-input {className}">
  {#if label}
    <label class="vi-label" for={inputId}>
      {label}
      {#if required}
        <span class="vi-required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}

  <div class="vi-input-wrap">
    <Input
      bind:value
      id={inputId}
      {name}
      {required}
      error={!!displayError}
      onblur={handleBlur}
      oninput={handleInput}
      {...inputProps}
    />

    {#if isValid}
      <span class="vi-success-icon" aria-label="Valid">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8l3.5 3.5L13 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    {/if}
  </div>

  {#if displayError}
    <p class="vi-message vi-message--error" role="alert" aria-live="polite">
      {displayError}
    </p>
  {/if}
</div>

<style>
  .validated-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .vi-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    color: var(--color-base05);
    line-height: var(--leading-tight, 1.25);
  }

  .vi-required {
    color: var(--color-base08);
    font-size: var(--text-sm, 0.875rem);
  }

  .vi-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .vi-input-wrap :global(input) {
    flex: 1;
    min-width: 0;
  }

  .vi-success-icon {
    position: absolute;
    right: var(--space-6, 0.75rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base0B);
    pointer-events: none;
    flex-shrink: 0;
  }

  .vi-message {
    margin: 0;
    font-size: var(--text-xs, 0.75rem);
    line-height: var(--leading-normal, 1.5);
    animation: vi-slide-in var(--duration-fast, 150ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
  }

  .vi-message--error {
    color: var(--color-base08);
  }

  @keyframes vi-slide-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
