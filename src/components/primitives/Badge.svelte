<!--
  @component Badge

  A versatile badge/tag component for status, labels, and counts.
  Consolidates Badge, StatusBadge, and Status patterns into one component.

  @example
  <Badge>Default</Badge>
  <Badge variant="success">Active</Badge>
  <Badge variant="error" size="sm">Error</Badge>

  @example
  // With icon
  <Badge variant="primary">
    {#snippet iconLeft()}<CheckIcon size={12} />{/snippet}
    Verified
  </Badge>

  @example
  // Clickable badge
  <Badge onclick={() => filter('active')} clickable>Active</Badge>
-->
<script module>
  import { cv } from '../../utils/cn.svelte.js';

  export const badgeStyles = cv({
    base: [
      'inline-flex items-center justify-center gap-1',
      'font-medium rounded-full',
      'transition-colors'
    ].join(' '),

    variants: {
      variant: {
        default: 'bg-[var(--color-base02)] text-[var(--color-base05)]',
        primary: 'bg-[color-mix(in_srgb,var(--color-base0D)_15%,transparent)] text-[var(--color-base0D)]',
        secondary: 'bg-[color-mix(in_srgb,var(--color-base0C)_15%,transparent)] text-[var(--color-base0C)]',
        success: 'bg-[color-mix(in_srgb,var(--color-base0B)_15%,transparent)] text-[var(--color-base0B)]',
        warning: 'bg-[color-mix(in_srgb,var(--color-base0A)_15%,transparent)] text-[var(--color-base0A)]',
        error: 'bg-[color-mix(in_srgb,var(--color-base08)_15%,transparent)] text-[var(--color-base08)]',
        info: 'bg-[color-mix(in_srgb,var(--color-base0D)_15%,transparent)] text-[var(--color-base0D)]'
      },

      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
      },

      clickable: {
        true: 'cursor-pointer hover:opacity-80',
        false: ''
      }
    },

    defaults: {
      variant: 'default',
      size: 'md',
      clickable: 'false'
    }
  });
</script>

<script>
  import { cn } from '../../utils/cn.svelte.js';

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

  const badgeClass = $derived(
    badgeStyles({
      variant,
      size,
      clickable: (clickable || onclick) ? 'true' : 'false',
      class: className
    })
  );
</script>

{#if onclick || clickable}
  <button
    type="button"
    class={badgeClass}
    {onclick}
    {...rest}
  >
    {#if iconLeft}
      <span class="shrink-0">{@render iconLeft()}</span>
    {/if}
    {#if children}
      {@render children()}
    {/if}
    {#if iconRight}
      <span class="shrink-0">{@render iconRight()}</span>
    {/if}
  </button>
{:else}
  <span class={badgeClass} {...rest}>
    {#if iconLeft}
      <span class="shrink-0">{@render iconLeft()}</span>
    {/if}
    {#if children}
      {@render children()}
    {/if}
    {#if iconRight}
      <span class="shrink-0">{@render iconRight()}</span>
    {/if}
  </span>
{/if}
