<!--
  @component ThemeSelect

  A dropdown/segmented selector for theme preference with light/dark/system options.
  Uses the Jera ThemeState singleton for theme management.

  @example Basic dropdown
  <ThemeSelect />

  @example Segmented control style
  <ThemeSelect variant="segmented" />

  @example With custom theme state
  <ThemeSelect themeState={myThemeState} />

  @example Custom labels
  <ThemeSelect
    labels={{ light: 'Light', dark: 'Dark', system: 'Auto' }}
  />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { getTheme, generateId } from '../../utils/reactive.svelte.js';

  let {
    themeState,
    variant = 'segmented',
    size = 'md',
    labels = { light: 'Light', dark: 'Dark', system: 'System' },
    showIcons = true,
    class: className = '',
    ...rest
  } = $props();

  // Use provided themeState or fall back to singleton
  const theme = themeState ?? getTheme();
  const groupId = generateId();

  // Current preference (not resolved)
  const current = $derived(theme.current);

  // Size mappings
  const sizes = {
    sm: { wrapper: 'theme-select-sm', icon: 14 },
    md: { wrapper: 'theme-select-md', icon: 16 },
    lg: { wrapper: 'theme-select-lg', icon: 18 }
  };

  const currentSize = $derived(sizes[size] || sizes.md);

  const options = [
    { value: 'light', label: labels.light, icon: 'sun' },
    { value: 'dark', label: labels.dark, icon: 'moon' },
    { value: 'system', label: labels.system, icon: 'monitor' }
  ];

  function handleChange(value) {
    theme.set(value);
  }
</script>

{#if variant === 'segmented'}
  <div
    class={cn('theme-select-segmented', currentSize.wrapper, className)}
    role="radiogroup"
    aria-label="Theme preference"
    {...rest}
  >
    {#each options as option (option.value)}
      {@const isActive = current === option.value}
      <button
        type="button"
        role="radio"
        aria-checked={isActive}
        class={cn('theme-select-option', isActive && 'theme-select-option-active')}
        onclick={() => handleChange(option.value)}
      >
        {#if showIcons}
          <span class="theme-select-icon" aria-hidden="true">
            {#if option.icon === 'sun'}
              <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            {:else if option.icon === 'moon'}
              <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            {:else if option.icon === 'monitor'}
              <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            {/if}
          </span>
        {/if}
        <span class="theme-select-label">{option.label}</span>
      </button>
    {/each}
  </div>
{:else}
  <!-- Dropdown variant -->
  <div class={cn('theme-select-dropdown', currentSize.wrapper, className)} {...rest}>
    <select
      id={groupId}
      value={current}
      onchange={(e) => handleChange(e.target.value)}
      aria-label="Theme preference"
      class="theme-select-native"
    >
      {#each options as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <span class="theme-select-dropdown-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  </div>
{/if}

<style>
  /* --------------------------------------------
     SEGMENTED CONTROL
     -------------------------------------------- */
  .theme-select-segmented {
    display: inline-flex;
    align-items: center;
    background-color: var(--color-base01, #282828);
    border-radius: var(--radius-md, 0.375rem);
    padding: 2px;
    gap: 2px;
  }

  .theme-select-option {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border: none;
    border-radius: calc(var(--radius-md, 0.375rem) - 2px);
    background-color: transparent;
    color: var(--color-base04, #665c54);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color var(--duration-fast, 150ms) var(--ease-out, ease-out),
      color var(--duration-fast, 150ms) var(--ease-out, ease-out);
  }

  .theme-select-option:hover:not(.theme-select-option-active) {
    color: var(--color-base05, #a89984);
  }

  .theme-select-option:focus-visible {
    outline: 2px solid var(--color-base0D, #83a598);
    outline-offset: -2px;
  }

  .theme-select-option-active {
    background-color: var(--color-base02, #3c3836);
    color: var(--color-base06, #d5c4a1);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .theme-select-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-select-label {
    white-space: nowrap;
  }

  /* --------------------------------------------
     SIZES - SEGMENTED
     -------------------------------------------- */
  .theme-select-sm .theme-select-option {
    padding: 2px var(--space-2, 0.5rem);
    font-size: var(--text-xs, 0.75rem);
  }

  .theme-select-md .theme-select-option {
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
  }

  .theme-select-lg .theme-select-option {
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    font-size: var(--text-base, 1rem);
  }

  /* --------------------------------------------
     DROPDOWN
     -------------------------------------------- */
  .theme-select-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .theme-select-native {
    appearance: none;
    background-color: var(--color-base01, #282828);
    border: 1px solid var(--color-base03, #504945);
    border-radius: var(--radius-md, 0.375rem);
    color: var(--color-base06, #d5c4a1);
    font-size: var(--text-sm, 0.875rem);
    padding: var(--space-2, 0.5rem) var(--space-8, 2rem) var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    cursor: pointer;
    transition:
      border-color var(--duration-fast, 150ms) var(--ease-out, ease-out),
      background-color var(--duration-fast, 150ms) var(--ease-out, ease-out);
  }

  .theme-select-native:hover {
    border-color: var(--color-base04, #665c54);
  }

  .theme-select-native:focus {
    outline: none;
    border-color: var(--color-base0D, #83a598);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-base0D, #83a598) 20%, transparent);
  }

  .theme-select-dropdown-icon {
    position: absolute;
    right: var(--space-2, 0.5rem);
    pointer-events: none;
    color: var(--color-base04, #665c54);
  }

  /* --------------------------------------------
     SIZES - DROPDOWN
     -------------------------------------------- */
  .theme-select-dropdown.theme-select-sm .theme-select-native {
    padding: var(--space-1, 0.25rem) var(--space-6, 1.5rem) var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    font-size: var(--text-xs, 0.75rem);
  }

  .theme-select-dropdown.theme-select-lg .theme-select-native {
    padding: var(--space-3, 0.75rem) var(--space-10, 2.5rem) var(--space-3, 0.75rem) var(--space-4, 1rem);
    font-size: var(--text-base, 1rem);
  }

  /* --------------------------------------------
     REDUCED MOTION
     -------------------------------------------- */
  @media (prefers-reduced-motion: reduce) {
    .theme-select-option,
    .theme-select-native {
      transition: none;
    }
  }
</style>
