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

  // Size classes map to CSS classes defined below
  const sizeClass = $derived(`switch-${size}`);
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

  <span class={cn('switch-track', sizeClass, checked && 'switch-track-checked')}>
    <span class={cn('switch-thumb', checked && 'switch-thumb-checked')} />
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
    border-radius: var(--radius-default);
    background-color: var(--color-base03);
    transition: var(--transition-colors);
  }

  .switch-track-checked {
    background-color: var(--color-base0D);
  }

  .switch-input:focus-visible + .switch-track {
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }

  .switch-thumb {
    position: absolute;
    left: 2px;
    border-radius: var(--radius-default);
    background-color: white;
    box-shadow: var(--shadow-sm);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .switch-label {
    font-size: var(--text-sm);
    color: var(--color-base05);
  }

  /* Size variants - Small */
  .switch-sm {
    width: 2rem;
    height: 1rem;
  }
  .switch-sm .switch-thumb {
    width: 0.75rem;
    height: 0.75rem;
  }
  .switch-sm .switch-thumb-checked {
    transform: translateX(1rem);
  }

  /* Size variants - Medium (default) */
  .switch-md {
    width: 2.5rem;
    height: 1.25rem;
  }
  .switch-md .switch-thumb {
    width: 1rem;
    height: 1rem;
  }
  .switch-md .switch-thumb-checked {
    transform: translateX(1.25rem);
  }

  /* Size variants - Large */
  .switch-lg {
    width: 3rem;
    height: 1.5rem;
  }
  .switch-lg .switch-thumb {
    width: 1.25rem;
    height: 1.25rem;
  }
  .switch-lg .switch-thumb-checked {
    transform: translateX(1.5rem);
  }
</style>
