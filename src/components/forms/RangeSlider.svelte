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
    formatValue = val => (val ?? 0).toString(),
    size = 'md',
    class: className = '',
    id,
    name = undefined,
    oninput,
    onchange,
    ...rest
  } = $props();

  // Guard a null/undefined initial value (e.g. a consumer's state not yet
  // populated) — normalise once at init, never mirror props via $effect.
  if (value == null) value = min ?? 0;

  const inputId = id || `slider-${Math.random().toString(36).slice(2, 9)}`;
  const safeValue = $derived(value ?? min ?? 0);
  const percentage = $derived(((safeValue - min) / (max - min)) * 100);
</script>

<div class="slider-container slider-{size} {className}">
  {#if label}
    <label class="slider-label" for={inputId}>{label}</label>
  {/if}

  <div class="slider-wrapper" style="--percentage: {percentage}%">
    <input
      type="range"
      id={inputId}
      bind:value
      {min}
      {max}
      {step}
      {disabled}
      {name}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      class="slider"
      {oninput}
      {onchange}
      {...rest}
    />
    <div class="slider-track" aria-hidden="true"></div>
  </div>

  {#if showValues}
    <div class="slider-values">
      <span class="slider-min">{formatValue(min)}</span>
      {#if showCurrentValue}
        <span class="slider-current">{formatValue(safeValue)}</span>
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
    margin-bottom: var(--space-4);
  }

  .slider-wrapper {
    position: relative;
    width: 100%;
    height: 0.5rem;
  }

  .slider-sm .slider-wrapper {
    height: 0.375rem;
  }
  .slider-lg .slider-wrapper {
    height: 0.625rem;
  }

  .slider {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    cursor: pointer;
    z-index: 10;
    outline: none;
  }

  .slider:disabled {
    cursor: not-allowed;
  }

  .slider-wrapper:has(.slider:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Track: flat base02, filled portion base0D — driven entirely by the
     --percentage custom property (no JS layout/measurement). */
  .slider-track {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-default);
    background-image: linear-gradient(
      to right,
      var(--color-base0D) var(--percentage),
      var(--color-base02) var(--percentage)
    );
    pointer-events: none;
  }

  /* Webkit (Chrome, Safari, Edge) */
  .slider::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: var(--color-base0D);
    border: var(--border-width-default) solid var(--color-base00);
    box-shadow: 0 0 0 1px var(--color-base0D);
    cursor: pointer;
    transition:
      transform var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
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
  }

  .slider:active::-webkit-slider-thumb {
    transform: scale(0.95);
  }

  .slider:focus-visible::-webkit-slider-thumb {
    box-shadow: var(--focus-ring-shadow);
  }

  .slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  /* Firefox */
  .slider::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: var(--color-base0D);
    border: var(--border-width-default) solid var(--color-base00);
    box-shadow: 0 0 0 1px var(--color-base0D);
    cursor: pointer;
    transition:
      transform var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .slider-sm .slider::-moz-range-thumb {
    width: 1rem;
    height: 1rem;
  }

  .slider-lg .slider::-moz-range-thumb {
    width: 1.5rem;
    height: 1.5rem;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }

  .slider:active::-moz-range-thumb {
    transform: scale(0.95);
  }

  .slider:focus-visible::-moz-range-thumb {
    box-shadow: var(--focus-ring-shadow);
  }

  .slider:disabled::-moz-range-thumb {
    cursor: not-allowed;
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
    margin-top: var(--space-4);
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .slider-current {
    font-weight: 500;
    color: var(--color-base05);
  }
</style>
