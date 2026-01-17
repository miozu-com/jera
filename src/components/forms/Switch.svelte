<!--
  @component Switch

  An accessible toggle switch for boolean values.

  @example
  <Switch bind:checked={enabled}>Enable notifications</Switch>

  @example
  <Switch bind:checked={darkMode} size="lg" />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { generateId } from '../../utils/reactive.svelte.js';

  let {
    checked = $bindable(false),
    disabled = false,
    size = 'md',
    name = '',
    id,
    class: className = '',
    children,
    onchange,
    ...rest
  } = $props();

  const inputId = id || generateId();

  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' }
  };

  const sizeConfig = $derived(sizes[size] || sizes.md);
</script>

<label
  class={cn('switch-wrapper', disabled && 'switch-disabled', className)}
  for={inputId}
>
  <input
    type="checkbox"
    role="switch"
    id={inputId}
    {name}
    {disabled}
    bind:checked
    {onchange}
    class="switch-input"
    aria-checked={checked}
    {...rest}
  />

  <span class={cn('switch-track', sizeConfig.track, checked && 'switch-track-checked')}>
    <span class={cn('switch-thumb', sizeConfig.thumb, checked && sizeConfig.translate)} />
  </span>

  {#if children}
    <span class="switch-label">
      {@render children()}
    </span>
  {/if}
</label>

<style>
  .switch-wrapper {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    user-select: none;
  }

  .switch-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .switch-track {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    border-radius: var(--radius-full);
    background-color: var(--color-border);
    transition: var(--transition-colors);
  }

  .switch-track-checked {
    background-color: var(--color-primary);
  }

  .switch-input:focus-visible + .switch-track {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .switch-thumb {
    position: absolute;
    left: 2px;
    border-radius: var(--radius-full);
    background-color: white;
    box-shadow: var(--shadow-sm);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .switch-label {
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  /* Tailwind-like utilities inline */
  .w-8 { width: 2rem; }
  .w-10 { width: 2.5rem; }
  .w-12 { width: 3rem; }
  .h-4 { height: 1rem; }
  .h-5 { height: 1.25rem; }
  .h-6 { height: 1.5rem; }
  .w-3 { width: 0.75rem; }
  .w-4 { width: 1rem; }
  .w-5 { width: 1.25rem; }
  .h-3 { height: 0.75rem; }
  .translate-x-4 { transform: translateX(1rem); }
  .translate-x-5 { transform: translateX(1.25rem); }
  .translate-x-6 { transform: translateX(1.5rem); }
</style>
