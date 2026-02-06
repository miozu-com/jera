<!--
  @component ThemeToggle

  An accessible theme toggle button with animated sun/moon icons.
  Uses the Jera ThemeState singleton for theme management.

  @example Basic usage
  <ThemeToggle />

  @example With custom theme state
  <ThemeToggle themeState={myThemeState} />

  @example Different sizes
  <ThemeToggle size="sm" />
  <ThemeToggle size="lg" />

  @example With label
  <ThemeToggle>
    {#snippet label()}Dark mode{/snippet}
  </ThemeToggle>

  @example Custom icons via snippets
  <ThemeToggle>
    {#snippet sunIcon()}<MyCustomSun />{/snippet}
    {#snippet moonIcon()}<MyCustomMoon />{/snippet}
  </ThemeToggle>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { getTheme } from '../../utils/reactive.svelte.js';

  let {
    themeState,
    size = 'md',
    variant = 'ghost',
    class: className = '',
    sunIcon,
    moonIcon,
    label,
    ...rest
  } = $props();

  // Use provided themeState or fall back to singleton
  const theme = themeState ?? getTheme();

  // Derive current state
  const isDark = $derived(theme.isDark);

  // Size mappings
  const sizes = {
    sm: { button: 'theme-toggle-sm', icon: 16 },
    md: { button: 'theme-toggle-md', icon: 20 },
    lg: { button: 'theme-toggle-lg', icon: 24 }
  };

  const currentSize = $derived(sizes[size] || sizes.md);

  function handleToggle() {
    theme.toggle();
  }
</script>

<button
  type="button"
  onclick={handleToggle}
  aria-pressed={isDark}
  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  class={cn('theme-toggle', `theme-toggle-${variant}`, currentSize.button, className)}
  {...rest}
>
  <span class="theme-toggle-icon-wrapper">
    <!-- Sun icon (visible in dark mode, click to switch to light) -->
    <span class={cn('theme-toggle-icon', 'theme-toggle-sun', isDark && 'theme-toggle-icon-active')}>
      {#if sunIcon}
        {@render sunIcon()}
      {:else}
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      {/if}
    </span>

    <!-- Moon icon (visible in light mode, click to switch to dark) -->
    <span class={cn('theme-toggle-icon', 'theme-toggle-moon', !isDark && 'theme-toggle-icon-active')}>
      {#if moonIcon}
        {@render moonIcon()}
      {:else}
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      {/if}
    </span>
  </span>

  {#if label}
    <span class="theme-toggle-label">
      {@render label()}
    </span>
  {/if}
</button>

<style>
  /* --------------------------------------------
     BASE STYLES
     -------------------------------------------- */
  .theme-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    border: none;
    border-radius: var(--radius-md, 0.375rem);
    cursor: pointer;
    transition: background-color var(--duration-fast, 150ms) var(--ease-out, ease-out);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--color-base0D, #83a598);
    outline-offset: 2px;
  }

  /* --------------------------------------------
     VARIANTS
     -------------------------------------------- */
  .theme-toggle-ghost {
    background-color: transparent;
    color: var(--color-base05, #a89984);
  }

  .theme-toggle-ghost:hover {
    background-color: var(--color-base02, #3c3836);
    color: var(--color-base06, #d5c4a1);
  }

  .theme-toggle-outline {
    background-color: transparent;
    color: var(--color-base05, #a89984);
    border: 1px solid var(--color-base03, #504945);
  }

  .theme-toggle-outline:hover {
    background-color: var(--color-base02, #3c3836);
    border-color: var(--color-base04, #665c54);
    color: var(--color-base06, #d5c4a1);
  }

  .theme-toggle-subtle {
    background-color: var(--color-base01, #282828);
    color: var(--color-base05, #a89984);
  }

  .theme-toggle-subtle:hover {
    background-color: var(--color-base02, #3c3836);
    color: var(--color-base06, #d5c4a1);
  }

  /* --------------------------------------------
     SIZES
     -------------------------------------------- */
  .theme-toggle-sm {
    padding: var(--space-1, 0.25rem);
    min-width: 1.75rem;
    min-height: 1.75rem;
  }

  .theme-toggle-md {
    padding: var(--space-2, 0.5rem);
    min-width: 2.25rem;
    min-height: 2.25rem;
  }

  .theme-toggle-lg {
    padding: var(--space-3, 0.75rem);
    min-width: 2.75rem;
    min-height: 2.75rem;
  }

  /* --------------------------------------------
     ICON ANIMATION
     -------------------------------------------- */
  .theme-toggle-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
    transition:
      opacity var(--duration-normal, 200ms) var(--ease-out, ease-out),
      transform var(--duration-normal, 200ms) var(--ease-out, ease-out);
  }

  .theme-toggle-icon-active {
    position: relative;
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  /* Sun specific - warm color when active */
  .theme-toggle-sun.theme-toggle-icon-active {
    color: var(--color-base0A, #fabd2f);
  }

  /* Moon specific - cool color when active */
  .theme-toggle-moon.theme-toggle-icon-active {
    color: var(--color-base0D, #83a598);
  }

  /* --------------------------------------------
     REDUCED MOTION
     -------------------------------------------- */
  @media (prefers-reduced-motion: reduce) {
    .theme-toggle-icon {
      transition: opacity var(--duration-fast, 150ms) var(--ease-out, ease-out);
      transform: none;
    }

    .theme-toggle-icon-active {
      transform: none;
    }
  }

  /* --------------------------------------------
     LABEL
     -------------------------------------------- */
  .theme-toggle-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-base05, #a89984);
  }

  .theme-toggle:hover .theme-toggle-label {
    color: var(--color-base06, #d5c4a1);
  }
</style>
