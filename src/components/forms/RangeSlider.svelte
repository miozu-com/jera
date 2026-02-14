<!--
  @component RangeSlider

  A range slider input for selecting numeric values.

  @example
  <RangeSlider bind:value={volume} min={0} max={100} />

  @example With label and formatting
  <RangeSlider
    bind:value={price}
    min={0}
    max={1000}
    label="Price"
    formatValue={(v) => `$${v}`}
  />
-->
<script>
  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    label = '',
    disabled = false,
    showValues = true,
    showCurrentValue = true,
    formatValue = (val) => val.toString(),
    size = 'md',
    class: className = '',
    id,
    oninput,
    onchange,
    ...rest
  } = $props();

  const inputId = id || `slider-${Math.random().toString(36).slice(2, 9)}`;
  const percentage = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="slider-container slider-{size} {className}">
  {#if label}
    <label class="slider-label" for={inputId}>{label}</label>
  {/if}

  <div class="slider-wrapper">
    <input
      type="range"
      id={inputId}
      bind:value
      {min}
      {max}
      {step}
      {disabled}
      class="slider"
      style="--percentage: {percentage}%"
      {oninput}
      {onchange}
      {...rest}
    />
    <div class="slider-track">
      <div class="slider-fill" style="width: {percentage}%"></div>
    </div>
  </div>

  {#if showValues}
    <div class="slider-values">
      <span class="slider-min">{formatValue(min)}</span>
      {#if showCurrentValue}
        <span class="slider-current">{formatValue(value)}</span>
      {/if}
      <span class="slider-max">{formatValue(max)}</span>
    </div>
  {/if}
</div>

<style>
  .slider-container {
    width: 100%;
  }

  .slider-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base05);
    margin-bottom: var(--space-2);
  }

  .slider-wrapper {
    position: relative;
    width: 100%;
    height: 0.5rem;
  }

  .slider-sm .slider-wrapper { height: 0.375rem; }
  .slider-lg .slider-wrapper { height: 0.625rem; }

  .slider {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    appearance: none;
    background: transparent;
    cursor: pointer;
    z-index: 10;
    outline: none;
  }

  .slider:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .slider-track {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: var(--color-base02);
    border-radius: var(--radius-default);
    pointer-events: none;
  }

  .slider-fill {
    height: 100%;
    background: var(--color-base0D);
    border-radius: var(--radius-default);
  }

  /* Webkit (Chrome, Safari, Edge) */
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.375rem;
    background: var(--color-base00);
    border: 2px solid var(--color-base0D);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    margin-top: -0.375rem;
  }

  .slider-sm .slider::-webkit-slider-thumb {
    width: 1rem;
    height: 1rem;
    margin-top: -0.3125rem;
  }

  .slider-lg .slider::-webkit-slider-thumb {
    width: 1.5rem;
    height: 1.5rem;
    margin-top: -0.4375rem;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .slider:active::-webkit-slider-thumb {
    transform: scale(0.95);
  }

  .slider:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }

  /* Firefox */
  .slider::-moz-range-thumb {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.375rem;
    background: var(--color-base00);
    border: 2px solid var(--color-base0D);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .slider::-webkit-slider-runnable-track {
    appearance: none;
    background: transparent;
    height: 100%;
  }

  .slider::-moz-range-track {
    appearance: none;
    background: transparent;
    height: 100%;
  }

  .slider-values {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .slider-current {
    font-weight: 500;
    color: var(--color-base05);
  }
</style>
