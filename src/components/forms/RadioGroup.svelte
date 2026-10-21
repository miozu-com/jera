<!--
  @component RadioGroup

  A group container for Radio buttons. It owns one RadioGroupState and hands it
  to the children snippet; every Radio takes it as the `group` prop (no context).

  @example
  <RadioGroup bind:value={selected} name="options">
    {#snippet children(group)}
      <Radio {group} value="a" label="Option A" />
      <Radio {group} value="b" label="Option B" />
      <Radio {group} value="c" label="Option C" />
    {/snippet}
  </RadioGroup>

  @example Segmented (one compact control, 28px; full width with `block`)
  <RadioGroup bind:value={mode} name="mode" variant="segmented" aria-label="Mode">
    {#snippet children(group)}
      <Radio {group} value="resale" label="Resale" />
      <Radio {group} value="any" label="Any" />
    {/snippet}
  </RadioGroup>
-->
<script module>
  export { RadioGroupState } from './radioGroup.svelte.js';
</script>

<script>
  import { untrack } from 'svelte';
  import { RadioGroupState } from './radioGroup.svelte.js';

  let {
    value = $bindable(null),
    name = '',
    disabled = false,
    orientation = 'vertical',
    variant = 'default',
    block = false,
    /** Snippet `(group: RadioGroupState)` — pass `group` to each Radio. */
    children,
    onchange,
    class: className = '',
    ...rest
  } = $props();

  // Created once with the initial props (that is what the server renders);
  // the effect below keeps it in step when the props change.
  const group = untrack(
    () =>
      new RadioGroupState({
        value,
        name,
        disabled,
        variant,
        onchange: (next) => {
          value = next;
          onchange?.({ target: { name: group.name, value: next } });
        }
      })
  );

  $effect.pre(() => {
    group.sync({ value, name, disabled, variant });
  });
</script>

<div
  class="radio-group {variant === 'segmented' ? 'radio-group-segmented' : `radio-group-${orientation}`} {className}"
  class:radio-group-block={block}
  role="radiogroup"
  aria-disabled={disabled}
  {...rest}
>
  {@render children?.(group)}
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
    background: var(--color-base01);
    max-width: 100%;
  }

  .radio-group-block {
    display: flex;
    width: 100%;
  }
</style>
