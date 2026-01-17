<!--
  @component Checkbox

  An accessible checkbox input with custom styling.

  @example
  <Checkbox bind:checked={agreed}>I agree to the terms</Checkbox>

  @example
  <Checkbox bind:checked={enabled} disabled>Disabled option</Checkbox>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { generateId } from '../../utils/reactive.svelte.js';

  let {
    checked = $bindable(false),
    disabled = false,
    required = false,
    name = '',
    id,
    class: className = '',
    children,
    onchange,
    ...rest
  } = $props();

  const inputId = id || generateId();
</script>

<label
  class={cn('checkbox-wrapper', disabled && 'checkbox-disabled', className)}
  for={inputId}
>
  <input
    type="checkbox"
    id={inputId}
    {name}
    {disabled}
    {required}
    bind:checked
    {onchange}
    class="checkbox-input"
    {...rest}
  />

  <span class="checkbox-box">
    {#if checked}
      <svg
        class="checkbox-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    {/if}
  </span>

  {#if children}
    <span class="checkbox-label">
      {@render children()}
    </span>
  {/if}
</label>

<style>
  .checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    user-select: none;
  }

  .checkbox-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-input {
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

  .checkbox-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-default);
    background-color: var(--color-bg);
    transition: var(--transition-all);
  }

  .checkbox-input:checked + .checkbox-box {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkbox-input:focus-visible + .checkbox-box {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .checkbox-icon {
    width: 12px;
    height: 12px;
    color: white;
  }

  .checkbox-label {
    font-size: var(--text-sm);
    color: var(--color-text);
  }
</style>
