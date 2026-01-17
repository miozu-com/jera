<!--
  @component LazyImage

  Intersection Observer-based lazy loading image with placeholder support.

  @example Basic
  <LazyImage src="/photo.jpg" alt="Description" />

  @example With placeholder
  <LazyImage
    src="/large-photo.jpg"
    alt="Photo"
    placeholder="/tiny-blur.jpg"
  />

  @example Custom threshold
  <LazyImage
    src="/image.jpg"
    alt="Image"
    threshold={0.5}
    rootMargin="100px"
  />
-->
<script>
  import { onMount } from 'svelte';

  let {
    src,
    alt = '',
    width,
    height,
    loading = 'lazy',
    threshold = 0.01,
    rootMargin = '50px',
    placeholder = null,
    class: className = '',
    onload,
    ...rest
  } = $props();

  let imgElement = $state(null);
  let isLoaded = $state(false);
  let isInView = $state(false);
  let actualSrc = $state(placeholder || '');

  onMount(() => {
    if ('IntersectionObserver' in window && imgElement) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded) {
              isInView = true;
              actualSrc = src;
              observer.unobserve(imgElement);
            }
          });
        },
        { rootMargin, threshold }
      );

      observer.observe(imgElement);

      return () => {
        observer.disconnect();
      };
    } else {
      actualSrc = src;
      isInView = true;
    }
  });

  function handleLoad() {
    isLoaded = true;
    onload?.();
  }
</script>

<img
  bind:this={imgElement}
  src={actualSrc}
  {alt}
  {width}
  {height}
  {loading}
  class="lazy-image {isLoaded ? 'lazy-loaded' : 'lazy-loading'} {className}"
  onload={handleLoad}
  decoding="async"
  {...rest}
/>

<style>
  .lazy-image {
    transition: opacity 0.3s ease;
  }

  .lazy-loading {
    opacity: 0;
    background: var(--color-base01);
  }

  .lazy-loaded {
    opacity: 1;
  }
</style>
