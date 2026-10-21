<!--
  @component Radio

  A radio button input. Takes its group's state as the required `group` prop:
  render it inside RadioGroup's children snippet and pass the snippet argument.
  Without `group` it throws in dev and renders nothing in production.

  @example
  <RadioGroup bind:value name="plan">
    {#snippet children(group)}
      <Radio {group} value="monthly" label="Monthly" />
      <Radio {group} value="yearly" label="Yearly" />
    {/snippet}
  </RadioGroup>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { requireInstance } from '../../utils/requireInstance.js';

  let {
    /** RadioGroupState from RadioGroup's `children(group)` snippet (required). */
    group,
    value,
    label = '',
    description = '',
    disabled = false,
    id,
    class: className = '',
    ...rest
  } = $props();

  // Throws in dev with the fix spelled out; in production the radio renders nothing.
  const wired = $derived(requireInstance(group, 'Radio', 'group', 'RadioGroup'));

  const uid = $props.id();
  const radioId = $derived(id || `radio-${uid}`);
  const isChecked = $derived(group?.isChecked(value) ?? false);
  const isDisabled = $derived(disabled || !!group?.disabled);
  const segmented = $derived(group?.variant === 'segmented');

  function handleChange() {
    if (!isDisabled) group.change(value);
  }
</script>

{#if wired}
<label
  class={cn('radio-label', segmented && 'radio-segment', isDisabled && 'radio-disabled', className)}
  for={radioId}
>
  <input
    type="radio"
    id={radioId}
    name={group.name}
    {value}
    checked={isChecked}
    disabled={isDisabled}
    onchange={handleChange}
    class="radio-input"
    {...rest}
  />
  {#if !segmented}<span class="radio-control"></span>{/if}
  {#if segmented}
    <span class="radio-segment-text">{label}</span>
  {:else if label || description}
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
{/if}

<style>
  .radio-label {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-4);
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
    border: var(--border-width-default) solid var(--color-base03);
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
    transition: transform var(--duration-fast) ease-out;
  }

  .radio-input:checked + .radio-control {
    border-color: var(--color-base0D);
  }

  .radio-input:checked + .radio-control::after {
    transform: scale(1);
  }

  .radio-input:focus-visible + .radio-control {
    box-shadow: var(--focus-ring-shadow);
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

  /* Segmented (inside RadioGroup variant="segmented"). */
  .radio-segment {
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: 0;
    min-width: 0;
    padding: 0 var(--space-4, 0.5rem);
    border-radius: var(--radius-sm);
    color: var(--color-base05);
    transition: var(--transition-colors);
  }

  .radio-segment-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    /* Not --leading-none: with overflow: hidden a 1em line box clips the
       descenders of y/g/p. --leading-normal (18px at text-xs) fits the
       segment's 22px inner height, and the flex parent centres it. */
    line-height: var(--leading-normal);
  }

  .radio-segment:hover:not(.radio-disabled) {
    color: var(--color-base06);
  }

  /* Selected = raised, not tinted: a grey tint reads disabled. */
  .radio-segment:has(.radio-input:checked) {
    color: var(--color-base06);
    background: var(--color-base00);
    box-shadow: var(--shadow-sm);
  }

  .radio-segment:has(.radio-input:focus-visible) {
    box-shadow: var(--focus-ring-shadow);
  }
</style>
