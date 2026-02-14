<!--
  @component ProgressBar

  Visual progress indicator with optional label.

  @example Basic usage
  <ProgressBar value={65} />

  @example With label
  <ProgressBar value={65} showLabel />

  @example Custom color
  <ProgressBar value={80} variant="success" />
-->
<script>
  let {
    value = 0,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    label = null,
    indeterminate = false,
    class: className = ''
  } = $props();

  const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

  const variantColors = {
    primary: 'var(--color-base0D)',
    success: 'var(--color-base0B)',
    warning: 'var(--color-base0A)',
    error: 'var(--color-base08)',
    info: 'var(--color-base0D)'
  };

  const barColor = $derived(variantColors[variant] || variantColors.primary);
</script>

<div class="progress-container {className}">
  {#if showLabel || label}
    <div class="progress-header">
      {#if label}
        <span class="progress-label">{label}</span>
      {/if}
      {#if showLabel && !indeterminate}
        <span class="progress-value">{Math.round(percentage)}%</span>
      {/if}
    </div>
  {/if}

  <div
    class="progress progress-{size}"
    role="progressbar"
    aria-label={label || 'Progress'}
    aria-valuenow={indeterminate ? undefined : value}
    aria-valuemin="0"
    aria-valuemax={max}
  >
    <div
      class="progress-bar"
      class:progress-indeterminate={indeterminate}
      style="width: {indeterminate ? '100%' : percentage + '%'}; background: {barColor};"
    ></div>
  </div>
</div>

<style>
  .progress-container {
    width: 100%;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.375rem;
  }

  .progress-label {
    font-size: 0.875rem;
    color: var(--color-base05);
  }

  .progress-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-base07);
  }

  .progress {
    width: 100%;
    background: var(--color-base02);
    border-radius: var(--radius-default);
    overflow: hidden;
  }

  .progress-sm { height: 0.25rem; }
  .progress-md { height: 0.5rem; }
  .progress-lg { height: 0.75rem; }

  .progress-bar {
    height: 100%;
    border-radius: var(--radius-default);
    transition: width 0.3s ease-out;
  }

  .progress-indeterminate {
    width: 30% !important;
    animation: indeterminate 1.5s ease-in-out infinite;
  }

  @keyframes indeterminate {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
</style>
