<!--
  @component Radio

  A radio button input. Use within RadioGroup for proper grouping.

  @example
  <Radio value="option1" label="Option 1" />
-->
<script>
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn.svelte.js';

  let {
    value,
    label = '',
    description = '',
    disabled = false,
    id,
    class: className = '',
    ...rest
  } = $props();

  const group = getContext('radioGroup');

  const radioId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;
  const isChecked = $derived(group?.value === value);
  const isDisabled = $derived(disabled || group?.disabled);
  const name = $derived(group?.name || '');

  function handleChange() {
    if (!isDisabled && group) {
      group.setValue(value);
    }
  }
</script>

<label
  class={cn('radio-label', isDisabled && 'radio-disabled', className)}
  for={radioId}
>
  <input
    type="radio"
    id={radioId}
    {name}
    {value}
    checked={isChecked}
    disabled={isDisabled}
    onchange={handleChange}
    class="radio-input"
    {...rest}
  />
  <span class="radio-control"></span>
  {#if label || description}
    <span class="radio-content">
      {#if label}
        <span class="radio-text">{label}</span>
      {/if}
      {#if description}
        <span class="radio-description">{description}</span>
      {/if}
    </span>
  {/if}
</label>

<style>
  .radio-label {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-2);
    cursor: pointer;
    user-select: none;
  }

  .radio-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .radio-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-control {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    margin-top: 0.125rem;
    border: 2px solid var(--color-base03);
    border-radius: 50%;
    background: var(--color-base00);
    transition: var(--transition-colors);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .radio-control::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-base0D);
    transform: scale(0);
    transition: transform 0.15s ease-out;
  }

  .radio-input:checked + .radio-control {
    border-color: var(--color-base0D);
  }

  .radio-input:checked + .radio-control::after {
    transform: scale(1);
  }

  .radio-input:focus-visible + .radio-control {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .radio-label:hover:not(.radio-disabled) .radio-control {
    border-color: var(--color-base0D);
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .radio-text {
    font-size: var(--text-sm);
    color: var(--color-base07);
    line-height: 1.4;
  }

  .radio-description {
    font-size: var(--text-xs);
    color: var(--color-base04);
    line-height: 1.4;
  }
</style>
