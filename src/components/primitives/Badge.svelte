<!--
  @component Badge

  A versatile badge/tag component for status, labels, and counts.

  @example
  <Badge>Default</Badge>
  <Badge variant="success">Active</Badge>
  <Badge variant="error" size="sm">Error</Badge>

  @example With icon
  <Badge variant="primary">
    {#snippet iconLeft()}<CheckIcon size={12} />{/snippet}
    Verified
  </Badge>

  @example Clickable
  <Badge onclick={() => filter('active')} clickable>Active</Badge>
-->
<script>
  let {
    children,
    iconLeft,
    iconRight,
    variant = 'default',
    size = 'md',
    clickable = false,
    class: className = '',
    onclick,
    ...rest
  } = $props();

  const isClickable = $derived(clickable || !!onclick);
</script>

{#if isClickable}
  <button
    type="button"
    class="jera-badge {variant} size-{size} clickable {className}"
    {onclick}
    {...rest}
  >
    {#if iconLeft}
      <span class="badge-icon">{@render iconLeft()}</span>
    {/if}
    {#if children}
      {@render children()}
    {/if}
    {#if iconRight}
      <span class="badge-icon">{@render iconRight()}</span>
    {/if}
  </button>
{:else}
  <span class="jera-badge {variant} size-{size} {className}" {...rest}>
    {#if iconLeft}
      <span class="badge-icon">{@render iconLeft()}</span>
    {/if}
    {#if children}
      {@render children()}
    {/if}
    {#if iconRight}
      <span class="badge-icon">{@render iconRight()}</span>
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
    border-radius: 9999px;
    border: none;
    transition: background 0.15s, color 0.15s;
  }

  .badge-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  /* Sizes */
  .size-sm {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .size-md {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
  }

  .size-lg {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Variants */
  .default {
    background: var(--color-base02);
    color: var(--color-base05);
  }

  .primary {
    background: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    color: var(--color-base0D);
  }

  .secondary {
    background: color-mix(in srgb, var(--color-base0C) 15%, transparent);
    color: var(--color-base0C);
  }

  .success {
    background: color-mix(in srgb, var(--color-base0B) 15%, transparent);
    color: var(--color-base0B);
  }

  .warning {
    background: color-mix(in srgb, var(--color-base0A) 15%, transparent);
    color: var(--color-base0A);
  }

  .error {
    background: color-mix(in srgb, var(--color-base08) 15%, transparent);
    color: var(--color-base08);
  }

  .info {
    background: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    color: var(--color-base0D);
  }

  /* Clickable */
  .clickable {
    cursor: pointer;
    background: inherit;
    font: inherit;
  }

  .clickable:hover {
    opacity: 0.8;
  }
</style>
