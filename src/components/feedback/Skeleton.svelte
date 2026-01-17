<!--
  @component Skeleton

  Loading placeholder with shimmer animation.

  @example Text line
  <Skeleton width="80%" />

  @example Circle avatar
  <Skeleton variant="circle" size="48px" />

  @example Rectangle card
  <Skeleton variant="rect" width="100%" height="200px" />
-->
<script>
  let {
    variant = 'text',
    width = '100%',
    height = null,
    size = null,
    lines = 1,
    animate = true,
    class: className = ''
  } = $props();

  // Compute dimensions based on variant
  const computedHeight = $derived.by(() => {
    if (height) return height;
    if (size) return size;
    switch (variant) {
      case 'text': return '1rem';
      case 'heading': return '1.5rem';
      case 'circle': return size || '2.5rem';
      case 'rect': return '4rem';
      default: return '1rem';
    }
  });

  const computedWidth = $derived.by(() => {
    if (width) return width;
    if (size && variant === 'circle') return size;
    return '100%';
  });
</script>

{#if lines > 1}
  <div class="skeleton-lines {className}">
    {#each Array(lines) as _, i}
      <div
        class="skeleton skeleton-{variant}"
        class:skeleton-animate={animate}
        style="width: {i === lines - 1 ? '60%' : computedWidth}; height: {computedHeight};"
      ></div>
    {/each}
  </div>
{:else}
  <div
    class="skeleton skeleton-{variant} {className}"
    class:skeleton-animate={animate}
    style="width: {computedWidth}; height: {computedHeight};"
  ></div>
{/if}

<style>
  .skeleton {
    background: var(--color-base02);
    border-radius: 0.25rem;
  }

  .skeleton-text {
    border-radius: 0.25rem;
  }

  .skeleton-heading {
    border-radius: 0.25rem;
  }

  .skeleton-circle {
    border-radius: 50%;
  }

  .skeleton-rect {
    border-radius: 0.5rem;
  }

  .skeleton-lines {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .skeleton-animate {
    background: linear-gradient(
      90deg,
      var(--color-base02) 0%,
      var(--color-base03) 50%,
      var(--color-base02) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
