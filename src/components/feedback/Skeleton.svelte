<!--
  @component Skeleton

  Loading placeholder with shimmer animation.
  Two modes: variant (primitive shapes) and preset (layout patterns).
  When `preset` is set, `variant` is ignored.

  @example Text lines
  <Skeleton variant="text" lines={3} />

  @example Circle avatar
  <Skeleton variant="circle" size="48px" />

  @example Card preset
  <Skeleton preset="card" />

  @example Content preset
  <Skeleton preset="content" lines={4} />

  @example Table of contents preset
  <Skeleton preset="toc" lines={5} />
-->
<script>
  let {
    variant = 'text',
    preset = null,
    width = '100%',
    height = null,
    size = null,
    lines = 1,
    animate = true,
    class: className = ''
  } = $props();

  const variantHeight = $derived.by(() => {
    if (height) return height;
    if (size) return size;
    switch (variant) {
      case 'heading': return '1.5rem';
      case 'circle': return size || '2.5rem';
      case 'rect': return '4rem';
      default: return '1rem';
    }
  });

  const variantWidth = $derived.by(() => {
    if (size && variant === 'circle') return size;
    return width;
  });

  const variantRadius = $derived(variant === 'circle' ? '50%' : variant === 'rect' ? '0.5rem' : '0.25rem');

  const contentWidths = [100, 95, 90, 85, 75, 80, 70, 65];
  const tocWidths = [80, 70, 75, 60, 65, 55, 50, 45];
</script>

{#if preset === 'card'}
  <div class="jera-skeleton-card {className}">
    <div class="skel card-image" class:skel-animate={animate}></div>
    <div class="card-body">
      <div class="skel card-title" class:skel-animate={animate}></div>
      <div class="skel card-meta" class:skel-animate={animate}></div>
      <div class="skel card-desc" class:skel-animate={animate}></div>
      <div class="skel card-desc-short" class:skel-animate={animate}></div>
    </div>
  </div>
{:else if preset === 'content'}
  <div class="jera-skeleton-content {className}">
    <div class="skel content-title" class:skel-animate={animate}></div>
    {#each Array(lines) as _, i}
      <div
        class="skel content-line"
        class:skel-animate={animate}
        style="width: {contentWidths[i % contentWidths.length]}%;"
      ></div>
    {/each}
  </div>
{:else if preset === 'toc'}
  <div class="jera-skeleton-toc {className}">
    <div class="skel toc-title" class:skel-animate={animate}></div>
    {#each Array(lines) as _, i}
      <div
        class="skel toc-item"
        class:skel-animate={animate}
        style="width: {tocWidths[i % tocWidths.length]}%;"
      ></div>
    {/each}
  </div>
{:else if lines > 1}
  <div class="jera-skeleton-lines {className}">
    {#each Array(lines) as _, i}
      <div
        class="skel"
        class:skel-animate={animate}
        style="width: {i === lines - 1 ? '60%' : variantWidth}; height: {variantHeight}; border-radius: {variantRadius};"
      ></div>
    {/each}
  </div>
{:else}
  <div
    class="skel {className}"
    class:skel-animate={animate}
    style="width: {variantWidth}; height: {variantHeight}; border-radius: {variantRadius};"
  ></div>
{/if}

<style>
  .skel {
    background: var(--color-base02);
    border-radius: 0.25rem;
  }

  .skel-animate {
    opacity: 0.6;
  }

  @media (prefers-reduced-motion: no-preference) {
    .skel-animate {
      opacity: 1;
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
  }

  /* Variant: multi-line */
  .jera-skeleton-lines {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Preset: card */
  .jera-skeleton-card {
    border-radius: 0.5rem;
    overflow: hidden;

    .card-image {
      width: 100%;
      height: 12rem;
      border-radius: 0;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
    }

    .card-title {
      width: 85%;
      height: 1.25rem;
    }

    .card-meta {
      width: 40%;
      height: 0.875rem;
    }

    .card-desc {
      width: 100%;
      height: 0.875rem;
    }

    .card-desc-short {
      width: 85%;
      height: 0.875rem;
    }
  }

  /* Preset: content */
  .jera-skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .content-title {
      width: 60%;
      height: 2rem;
      margin-bottom: 0.5rem;
    }

    .content-line {
      height: 1rem;
    }
  }

  /* Preset: toc */
  .jera-skeleton-toc {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .toc-title {
      width: 80%;
      height: 1.5rem;
      margin-bottom: 0.25rem;
    }

    .toc-item {
      height: 1rem;
      margin-left: 1rem;
    }
  }
</style>
