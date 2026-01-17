<!--
  @component Spinner

  Loading spinner indicator.

  @example Basic usage
  <Spinner />

  @example With size
  <Spinner size="lg" />

  @example Custom color
  <Spinner color="var(--color-base0B)" />
-->
<script>
  let {
    size = 'md',
    color = 'currentColor',
    label = 'Loading...',
    class: className = ''
  } = $props();

  const sizes = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const sizeValue = $derived(sizes[size] || sizes.md);
</script>

<svg
  class="spinner {className}"
  width={sizeValue}
  height={sizeValue}
  viewBox="0 0 24 24"
  fill="none"
  aria-label={label}
  role="status"
>
  <circle
    class="spinner-track"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    stroke-width="3"
    opacity="0.2"
  />
  <circle
    class="spinner-indicator"
    cx="12"
    cy="12"
    r="10"
    stroke={color}
    stroke-width="3"
    stroke-linecap="round"
    stroke-dasharray="60 200"
  />
</svg>

<style>
  .spinner {
    animation: spin 1s linear infinite;
  }

  .spinner-track {
    opacity: 0.2;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
