<!--
  @component Button

  A polymorphic button component with variants, sizes, and loading states.

  @example
  <Button>Click me</Button>
  <Button variant="secondary" size="lg">Large Secondary</Button>
  <Button href="/about">Link Button</Button>
  <Button loading>Loading...</Button>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    children,
    iconLeft,
    iconRight,
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
  const isIconOnly = $derived(!children && (!!iconLeft || !!iconRight));
  const isDisabled = $derived(disabled || loading);

  const buttonClass = $derived(
    cn(
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth && 'btn-full',
      isIconOnly && 'btn-icon-only',
      className
    )
  );

  const spinnerSize = $derived({
    xs: 12, sm: 14, md: 16, lg: 18, xl: 20
  }[size]);
</script>

{#if isLink}
  <a
    {href}
    class={buttonClass}
    aria-disabled={isDisabled || undefined}
    role="button"
    {...restProps}
  >
    {#if loading}
      <svg class="btn-spinner" width={spinnerSize} height={spinnerSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
    {:else if iconLeft}
      <span class="btn-icon">{@render iconLeft()}</span>
    {/if}
    {#if children}
      <span class={loading ? 'btn-content-loading' : ''}>{@render children()}</span>
    {/if}
    {#if iconRight && !loading}
      <span class="btn-icon">{@render iconRight()}</span>
    {/if}
  </a>
{:else}
  <button
    {type}
    class={buttonClass}
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
    {:else if iconLeft}
      <span class="btn-icon">{@render iconLeft()}</span>
    {/if}
    {#if children}
      <span class={loading ? 'btn-content-loading' : ''}>{@render children()}</span>
    {/if}
    {#if iconRight && !loading}
      <span class="btn-icon">{@render iconRight()}</span>
    {/if}
  </button>
{/if}

<style>
  /* Base button styles */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
    border-radius: var(--radius-lg, 0.5rem);
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
    transition: all 150ms ease-out;
  }

  .btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-base00), 0 0 0 4px var(--color-base0D);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Variants */
  .btn-primary {
    background-color: var(--color-base0D);
    color: var(--color-base07);
  }
  .btn-primary:hover {
    filter: brightness(1.1);
  }
  .btn-primary:active {
    filter: brightness(0.95);
  }

  .btn-secondary {
    background-color: var(--color-base02);
    color: var(--color-base07);
    border-color: var(--color-base03);
  }
  .btn-secondary:hover {
    background-color: var(--color-base03);
  }

  .btn-ghost {
    background-color: transparent;
    color: var(--color-base05);
  }
  .btn-ghost:hover {
    background-color: var(--color-base02);
  }

  .btn-outline {
    background-color: transparent;
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 40%, transparent);
  }
  .btn-outline:hover {
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
    border-color: var(--color-base0D);
  }

  .btn-danger {
    background-color: var(--color-base08);
    color: var(--color-base07);
  }
  .btn-danger:hover {
    filter: brightness(1.1);
  }

  .btn-success {
    background-color: var(--color-base0B);
    color: var(--color-base07);
  }
  .btn-success:hover {
    filter: brightness(1.1);
  }

  /* Sizes */
  .btn-xs { height: 1.75rem; padding: 0 0.625rem; font-size: 0.75rem; }
  .btn-sm { height: 2rem; padding: 0 0.75rem; font-size: 0.875rem; }
  .btn-md { height: 2.5rem; padding: 0 1rem; font-size: 0.875rem; }
  .btn-lg { height: 3rem; padding: 0 1.5rem; font-size: 1rem; }
  .btn-xl { height: 3.5rem; padding: 0 2rem; font-size: 1.125rem; }

  /* Modifiers */
  .btn-full { width: 100%; }
  .btn-icon-only { aspect-ratio: 1; padding: 0; }
  .btn-icon-only.btn-xs { width: 1.75rem; }
  .btn-icon-only.btn-sm { width: 2rem; }
  .btn-icon-only.btn-md { width: 2.5rem; }
  .btn-icon-only.btn-lg { width: 3rem; }
  .btn-icon-only.btn-xl { width: 3.5rem; }

  /* Icon and spinner */
  .btn-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .btn-spinner {
    animation: spin 1s linear infinite;
  }

  .btn-content-loading {
    opacity: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
