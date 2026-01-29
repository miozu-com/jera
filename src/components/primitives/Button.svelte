<!--
  @component Button

  A polymorphic button component with variants, sizes, and loading states.
  Styled with transparent backgrounds and colored borders (Miozu design language).

  @example
  <Button>Click me</Button>
  <Button variant="secondary" size="lg">Large Secondary</Button>
  <Button href="/about">Link Button</Button>
  <Button loading>Loading...</Button>
-->
<script>
  let {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    href,
    type = 'button',
    class: className = '',
    onclick,
    ...restProps
  } = $props();

  const isLink = $derived(!!href);
  const isDisabled = $derived(disabled || loading);

  const spinnerSize = $derived({
    xs: 12, sm: 14, md: 16, lg: 18
  }[size] || 16);
</script>

{#if isLink}
  <a
    {href}
    class="jera-btn {variant} {size} {fullWidth ? 'full-width' : ''} {className}"
    aria-disabled={isDisabled || undefined}
    role="button"
    {...restProps}
  >
    {#if loading}
      <svg class="btn-spinner" width={spinnerSize} height={spinnerSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
    {/if}
    {#if children}
      <span class={loading ? 'btn-content-loading' : ''}>{@render children()}</span>
    {/if}
  </a>
{:else}
  <button
    {type}
    class="jera-btn {variant} {size} {fullWidth ? 'full-width' : ''} {className}"
    disabled={isDisabled}
    aria-busy={loading || undefined}
    {onclick}
    {...restProps}
  >
    {#if loading}
      <svg class="btn-spinner" width={spinnerSize} height={spinnerSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
    {/if}
    {#if children}
      <span class={loading ? 'btn-content-loading' : ''}>{@render children()}</span>
    {/if}
  </button>
{/if}

<style>
  /* Base button styles - matches dash.selify.ai */
  .jera-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;            /* gap-2.5 */
    padding: 0.5rem 1rem;     /* py-2 px-4 default */
    font-size: 0.875rem;      /* text-sm default */
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: all 200ms ease-out;
    background: transparent;
    border-radius: 0.25rem;   /* 4px default */
  }

  .jera-btn:focus-visible {
    outline: 2px solid var(--color-base0D, #83a598);
    outline-offset: 2px;
  }

  .jera-btn:disabled,
  .jera-btn[aria-disabled='true'] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
    filter: saturate(0.5);
  }

  /* ============================================
     VARIANTS - Transparent bg + colored borders
     ============================================ */

  /* Primary - Blue accent, main CTAs */
  .primary {
    background-color: color-mix(in srgb, var(--color-base0D, #83a598) 10%, transparent);
    color: var(--color-base0D, #83a598);
    border: 1px solid color-mix(in srgb, var(--color-base0D, #83a598) 40%, transparent);
  }

  .primary:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base0D, #83a598) 20%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D, #83a598) 60%, transparent);
  }

  .primary:active:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base0D, #83a598) 30%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D, #83a598) 80%, transparent);
    transform: scale(0.98);
  }

  /* Secondary - Gray background, secondary actions */
  .secondary {
    background-color: color-mix(in srgb, var(--color-base02, #504945) 30%, transparent);
    color: var(--color-base06, #ebdbb2);
    border: 1px solid var(--color-base03, #665c54);
  }

  .secondary:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base03, #665c54) 40%, transparent);
    border-color: var(--color-base03, #665c54);
  }

  .secondary:active:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base03, #665c54) 50%, transparent);
    border-color: var(--color-base04, #7c6f64);
    transform: scale(0.98);
  }

  /* Outline - Transparent with visible border */
  .outline {
    background-color: transparent;
    color: var(--color-base06, #ebdbb2);
    border: 1px solid var(--color-base03, #665c54);
  }

  .outline:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base03, #665c54) 20%, transparent);
    border-color: var(--color-base03, #665c54);
  }

  .outline:active:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base03, #665c54) 30%, transparent);
    border-color: var(--color-base04, #7c6f64);
    transform: scale(0.98);
  }

  /* Ghost - Minimal, no border */
  .ghost {
    background-color: transparent;
    color: var(--color-base05, #d5c4a1);
    border: 1px solid transparent;
  }

  .ghost:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base02, #504945) 30%, transparent);
    color: var(--color-base06, #ebdbb2);
  }

  .ghost:active:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base02, #504945) 40%, transparent);
    color: var(--color-base06, #ebdbb2);
    transform: scale(0.98);
  }

  /* Success - Green accent */
  .success {
    background-color: color-mix(in srgb, var(--color-base0B, #b8bb26) 10%, transparent);
    color: var(--color-base0B, #b8bb26);
    border: 1px solid color-mix(in srgb, var(--color-base0B, #b8bb26) 40%, transparent);
  }

  .success:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base0B, #b8bb26) 20%, transparent);
    border-color: color-mix(in srgb, var(--color-base0B, #b8bb26) 60%, transparent);
  }

  .success:active:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base0B, #b8bb26) 30%, transparent);
    border-color: color-mix(in srgb, var(--color-base0B, #b8bb26) 80%, transparent);
    transform: scale(0.98);
  }

  /* Danger - Red accent */
  .danger {
    background-color: color-mix(in srgb, var(--color-base08, #fb4934) 10%, transparent);
    color: var(--color-base08, #fb4934);
    border: 1px solid color-mix(in srgb, var(--color-base08, #fb4934) 20%, transparent);
  }

  .danger:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base08, #fb4934) 20%, transparent);
    border-color: color-mix(in srgb, var(--color-base08, #fb4934) 40%, transparent);
  }

  .danger:active:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base08, #fb4934) 30%, transparent);
    border-color: color-mix(in srgb, var(--color-base08, #fb4934) 60%, transparent);
    transform: scale(0.98);
  }

  /* ============================================
     SIZES - matches dash.selify.ai Button exactly
     ============================================ */
  .xs {
    padding: 0.25rem 0.5rem;   /* py-1 px-2 */
    font-size: 0.75rem;        /* text-xs */
    border-radius: 0.125rem;   /* 2px */
  }

  .sm {
    padding: 0.375rem 0.75rem; /* py-1.5 px-3 */
    font-size: 0.875rem;       /* text-sm */
    border-radius: 0.125rem;   /* 2px */
  }

  .md {
    padding: 0.5rem 1rem;      /* py-2 px-4 */
    font-size: 1rem;           /* text-base */
    border-radius: 0.25rem;    /* 4px */
  }

  .lg {
    padding: 0.75rem 1.25rem;  /* py-3 px-5 */
    font-size: 1.125rem;       /* text-lg */
    border-radius: 0.375rem;   /* 6px */
  }

  /* ============================================
     MODIFIERS
     ============================================ */
  .full-width {
    width: 100%;
  }

  /* Spinner */
  .btn-spinner {
    animation: spin 1s linear infinite;
    flex-shrink: 0;
  }

  .btn-content-loading {
    opacity: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
