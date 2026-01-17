<!--
  @component RadioGroup

  A group container for Radio buttons.

  @example
  <RadioGroup bind:value={selected} name="options">
    <Radio value="a" label="Option A" />
    <Radio value="b" label="Option B" />
    <Radio value="c" label="Option C" />
  </RadioGroup>
-->
<script>
  import { setContext } from 'svelte';

  let {
    value = $bindable(null),
    name = '',
    disabled = false,
    orientation = 'vertical',
    children,
    onchange,
    class: className = ''
  } = $props();

  function setValue(newValue) {
    value = newValue;
    onchange?.({ target: { name, value: newValue } });
  }

  setContext('radioGroup', {
    get value() { return value; },
    get name() { return name; },
    get disabled() { return disabled; },
    setValue
  });
</script>

<div
  class="radio-group radio-group-{orientation} {className}"
  role="radiogroup"
  aria-disabled={disabled}
>
  {@render children?.()}
</div>

<style>
  .radio-group {
    display: flex;
  }

  .radio-group-vertical {
    flex-direction: column;
    gap: var(--space-2);
  }

  .radio-group-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
</style>
