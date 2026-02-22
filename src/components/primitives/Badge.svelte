<!--
  @component Badge

  Status tag with semantic color variants, optional indicator dot, and icon support.

  @example Basic
  <Badge>Default</Badge>
  <Badge variant="success">Active</Badge>
  <Badge variant="error" size="sm">3 failed</Badge>

  @example With label shorthand
  <Badge variant="warning" label="Pending" />

  @example With indicator dot
  <Badge variant="success" indicator>Connected</Badge>

  @example With inline icon
  <Badge variant="primary">
    <CheckIcon size={12} /> Verified
  </Badge>
-->
<script>
  let {
    children,
    label = '',
    variant = 'default',
    size = 'md',
    indicator = false,
    class: className = '',
    onclick,
    ...rest
  } = $props();

  const isInteractive = $derived(!!onclick);
</script>

{#if isInteractive}
  <button
    type="button"
    class="jera-badge jera-badge-{variant} jera-badge-{size} {className}"
    {onclick}
    {...rest}
  >
    {#if indicator}
      <span class="badge-indicator"></span>
    {/if}
    {#if children}
      {@render children()}
    {:else if label}
      {label}
    {/if}
  </button>
{:else}
  <span class="jera-badge jera-badge-{variant} jera-badge-{size} {className}" {...rest}>
    {#if indicator}
      <span class="badge-indicator"></span>
    {/if}
    {#if children}
      {@render children()}
    {:else if label}
      {label}
    {/if}
  </span>
{/if}

<style>
  .jera-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-weight: 500;
    border-radius: var(--radius-default);
    border: 1px solid;
    white-space: nowrap;
    line-height: 1;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  /* Sizes */
  .jera-badge-xs {
    padding: 0.0625rem 0.375rem;
    font-size: 0.625rem;
  }

  .jera-badge-sm {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .jera-badge-md {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .jera-badge-lg {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Variants — 10% bg, 30% border */
  .jera-badge-default {
    background: color-mix(in srgb, var(--color-base04) 10%, transparent);
    color: var(--color-base04);
    border-color: color-mix(in srgb, var(--color-base04) 30%, transparent);
  }

  .jera-badge-primary {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }

  .jera-badge-secondary {
    background: color-mix(in srgb, var(--color-base0C) 10%, transparent);
    color: var(--color-base0C);
    border-color: color-mix(in srgb, var(--color-base0C) 30%, transparent);
  }

  .jera-badge-success {
    background: color-mix(in srgb, var(--color-base0B) 10%, transparent);
    color: var(--color-base0B);
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
  }

  .jera-badge-warning {
    background: color-mix(in srgb, var(--color-base0A) 10%, transparent);
    color: var(--color-base0A);
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
  }

  .jera-badge-error {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    color: var(--color-base08);
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
  }

  .jera-badge-info {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }

  /* Indicator dot */
  .badge-indicator {
    display: inline-block;
    flex-shrink: 0;
    border-radius: 9999px;
    background: currentColor;
  }

  .jera-badge-xs .badge-indicator {
    width: 5px;
    height: 5px;
  }

  .jera-badge-sm .badge-indicator {
    width: 6px;
    height: 6px;
  }

  .jera-badge-md .badge-indicator {
    width: 7px;
    height: 7px;
  }

  .jera-badge-lg .badge-indicator {
    width: 8px;
    height: 8px;
  }

  /* Interactive (button) */
  button.jera-badge {
    cursor: pointer;
    font: inherit;
  }

  button.jera-badge:hover {
    opacity: 0.85;
  }

  button.jera-badge:focus-visible {
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }
</style>
