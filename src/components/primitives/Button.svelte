<!--
  @component Button

  A polymorphic button component with variants, sizes, and loading states.
  Demonstrates advanced Svelte 5 patterns:

  - Polymorphic rendering (as button, a, or custom element)
  - Reactive class composition with cv()
  - Snippets for icon slots
  - $derived for computed properties
  - TypeScript-style prop definitions

  @example
  <Button>Click me</Button>
  <Button variant="secondary" size="lg">Large Secondary</Button>
  <Button href="/about">Link Button</Button>
  <Button loading>Loading...</Button>
  <Button disabled>Disabled</Button>
  <Button>
    {#snippet iconLeft()}<IconPlus />{/snippet}
    Add Item
  </Button>
-->
<script module>
  import { cv } from '../../utils/cn.svelte.js';

  /**
   * Button style variants using cv() for type-safe composition
   */
  export const buttonStyles = cv({
    base: [
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg',
      'transition-all duration-150 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'select-none'
    ].join(' '),

    variants: {
      variant: {
        primary: [
          'bg-primary text-white',
          'hover:brightness-110 active:brightness-95',
          'focus-visible:ring-primary/50'
        ].join(' '),

        secondary: [
          'bg-surface-alt text-text-strong border border-border',
          'hover:bg-hover hover:border-muted',
          'focus-visible:ring-border'
        ].join(' '),

        ghost: [
          'bg-transparent text-text',
          'hover:bg-hover',
          'focus-visible:ring-border'
        ].join(' '),

        outline: [
          'bg-transparent text-primary border border-primary/40',
          'hover:bg-primary/5 hover:border-primary',
          'focus-visible:ring-primary/50'
        ].join(' '),

        danger: [
          'bg-error text-white',
          'hover:brightness-110 active:brightness-95',
          'focus-visible:ring-error/50'
        ].join(' '),

        success: [
          'bg-success text-white',
          'hover:brightness-110 active:brightness-95',
          'focus-visible:ring-success/50'
        ].join(' ')
      },

      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg'
      },

      fullWidth: {
        true: 'w-full',
        false: ''
      },

      iconOnly: {
        true: 'aspect-square p-0',
        false: ''
      }
    },

    compounds: [
      // Icon-only buttons need adjusted padding
      { condition: { iconOnly: 'true', size: 'xs' }, class: 'w-7' },
      { condition: { iconOnly: 'true', size: 'sm' }, class: 'w-8' },
      { condition: { iconOnly: 'true', size: 'md' }, class: 'w-10' },
      { condition: { iconOnly: 'true', size: 'lg' }, class: 'w-12' },
      { condition: { iconOnly: 'true', size: 'xl' }, class: 'w-14' }
    ],

    defaults: {
      variant: 'primary',
      size: 'md',
      fullWidth: 'false',
      iconOnly: 'false'
    }
  });
</script>

<script>
  import { cn } from '../../utils/cn.svelte.js';

  /**
   * @typedef {import('svelte').Snippet} Snippet
   * @typedef {'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'} Variant
   * @typedef {'xs' | 'sm' | 'md' | 'lg' | 'xl'} Size
   */

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

  // Derived state
  const isLink = $derived(!!href);
  const isIconOnly = $derived(!children && (!!iconLeft || !!iconRight));
  const isDisabled = $derived(disabled || loading);

  // Reactive class composition
  const buttonClass = $derived(
    buttonStyles({
      variant,
      size,
      fullWidth: fullWidth ? 'true' : 'false',
      iconOnly: isIconOnly ? 'true' : 'false',
      class: className
    })
  );

  // Loading spinner
  const spinnerSize = $derived({
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
  }[size]);
</script>

<!--
  Polymorphic rendering: renders as <a> if href provided, otherwise <button>
  Uses Svelte 5's element binding with spread props
-->
{#if isLink}
  <a
    {href}
    class={buttonClass}
    aria-disabled={isDisabled || undefined}
    role="button"
    {...restProps}
  >
    {#if loading}
      <svg
        class="animate-spin"
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
    {:else if iconLeft}
      <span class="inline-flex shrink-0">
        {@render iconLeft()}
      </span>
    {/if}

    {#if children}
      <span class={cn(loading && 'opacity-0')}>
        {@render children()}
      </span>
    {/if}

    {#if iconRight && !loading}
      <span class="inline-flex shrink-0">
        {@render iconRight()}
      </span>
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
      <svg
        class="animate-spin"
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
    {:else if iconLeft}
      <span class="inline-flex shrink-0">
        {@render iconLeft()}
      </span>
    {/if}

    {#if children}
      <span class={cn(loading && 'opacity-70')}>
        {@render children()}
      </span>
    {/if}

    {#if iconRight && !loading}
      <span class="inline-flex shrink-0">
        {@render iconRight()}
      </span>
    {/if}
  </button>
{/if}

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
