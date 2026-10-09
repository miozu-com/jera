<!--
  @component RadioGroup

  A group container for Radio buttons.

  @example
  <RadioGroup bind:value={selected} name="options">
    <Radio value="a" label="Option A" />
    <Radio value="b" label="Option B" />
    <Radio value="c" label="Option C" />
  </RadioGroup>

  @example Segmented (one compact control, 28px; full width with `block`)
  <RadioGroup bind:value={mode} name="mode" variant="segmented" aria-label="Mode">
    <Radio value="resale" label="Resale" />
    <Radio value="any" label="Any" />
  </RadioGroup>
-->
<script>
  import { setContext } from 'svelte';

  let {
    value = $bindable(null),
    name = '',
    disabled = false,
    orientation = 'vertical',
    variant = 'default',
    block = false,
    children,
    onchange,
    class: className = '',
    ...rest
  } = $props();

  function setValue(newValue) {
    value = newValue;
    onchange?.({ target: { name, value: newValue } });
  }

  setContext('radioGroup', {
    get value() { return value; },
    get name() { return name; },
    get disabled() { return disabled; },
    get variant() { return variant; },
    setValue
  });
</script>

<div
  class="radio-group {variant === 'segmented' ? 'radio-group-segmented' : `radio-group-${orientation}`} {className}"
  class:radio-group-block={block}
  role="radiogroup"
  aria-disabled={disabled}
  {...rest}
>
  {@render children?.()}
</div>

<style>
  .radio-group {
    display: flex;
  }

  .radio-group-vertical {
    flex-direction: column;
    gap: var(--space-4);
  }

  .radio-group-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-8);
  }

  /* Segmented: one bordered control, the options as equal segments. */
  .radio-group-segmented {
    display: inline-flex;
    align-items: stretch;
    height: 1.75rem;
    padding: 0.125rem;
    gap: 0.125rem;
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
    background: var(--color-base00);
    max-width: 100%;
  }

  .radio-group-block {
    display: flex;
    width: 100%;
  }
</style>
