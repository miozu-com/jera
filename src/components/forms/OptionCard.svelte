<!--
  @component OptionCard

  Selectable option card for multi-choice layouts.

  @example Basic usage
  <OptionCard selected={choice === 'a'} onclick={() => choice = 'a'}>Option A</OptionCard>

  @example Compact variant
  <OptionCard variant="compact" selected={active} onclick={toggle}>Small</OptionCard>
-->
<script>
  let {
    selected = false,
    disabled = false,
    variant = 'default',
    class: className = '',
    onclick,
    children,
    ...rest
  } = $props();
</script>

<button
  type="button"
  class="option-card option-card-{variant} {className}"
  class:option-card-selected={selected}
  class:option-card-disabled={disabled}
  aria-pressed={selected}
  {disabled}
  {onclick}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .option-card {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-lg, 0.5rem);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    color: var(--color-base05);
    transition: border-color var(--duration-fast), background-color var(--duration-fast), color var(--duration-fast);
  }

  .option-card:hover:not(:disabled) {
    background-color: var(--color-base01);
    border-color: var(--color-base03);
    color: var(--color-base06);
  }

  .option-card:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  .option-card-selected {
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D) 50%, transparent);
    color: var(--color-base0D);
  }

  .option-card-selected:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    border-color: var(--color-base0D);
    color: var(--color-base0D);
  }

  .option-card-compact {
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-md, 0.375rem);
    font-size: var(--text-xs, 0.75rem);
  }

  .option-card-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
