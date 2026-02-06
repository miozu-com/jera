<!--
  @component ScrollNav

  A horizontally scrollable navigation container with gradient indicators.
  Perfect for tab navigation that overflows on mobile.

  @example Basic scroll nav
  <ScrollNav>
    <TabNav tabs={tabs} bind:active={activeTab} />
  </ScrollNav>

  @example With custom gradient size
  <ScrollNav gradientSize={80}>
    <div class="nav-items">
      {#each items as item}
        <a href={item.href}>{item.label}</a>
      {/each}
    </div>
  </ScrollNav>
-->
<script>
  import { onMount } from 'svelte';

  let {
    gradientSize = 60,
    scrollAmount = 200,
    class: className = '',
    children
  } = $props();

  let containerRef = $state(null);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function checkScroll() {
    if (!containerRef) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef;
    canScrollLeft = scrollLeft > 0;
    canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
  }

  function scrollTo(direction) {
    if (!containerRef) return;
    const amount = direction === 'left' ? -scrollAmount : scrollAmount;
    containerRef.scrollBy({ left: amount, behavior: 'smooth' });
  }

  onMount(() => {
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    if (containerRef) {
      observer.observe(containerRef);
    }
    return () => observer.disconnect();
  });
</script>

<div class="scroll-nav {className}">
  {#if canScrollLeft}
    <div class="scroll-gradient scroll-gradient-left" style="width: {gradientSize}px">
      <button
        type="button"
        class="scroll-btn scroll-btn-left"
        onclick={() => scrollTo('left')}
        aria-label="Scroll left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>
  {/if}

  <div
    class="scroll-container"
    bind:this={containerRef}
    onscroll={checkScroll}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if canScrollRight}
    <div class="scroll-gradient scroll-gradient-right" style="width: {gradientSize}px">
      <button
        type="button"
        class="scroll-btn scroll-btn-right"
        onclick={() => scrollTo('right')}
        aria-label="Scroll right"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  {/if}
</div>

<style>
  .scroll-nav {
    position: relative;
    display: flex;
    align-items: center;
  }

  .scroll-container {
    display: flex;
    align-items: center;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scroll-container::-webkit-scrollbar {
    display: none;
  }

  .scroll-gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    pointer-events: none;
    z-index: 1;
  }

  .scroll-gradient-left {
    left: 0;
    background: linear-gradient(to right, var(--color-base00), transparent);
    justify-content: flex-start;
    padding-left: var(--space-1);
  }

  .scroll-gradient-right {
    right: 0;
    background: linear-gradient(to left, var(--color-base00), transparent);
    justify-content: flex-end;
    padding-right: var(--space-1);
  }

  .scroll-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--space-8);
    height: var(--space-8);
    padding: 0;
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-full);
    color: var(--color-base05);
    cursor: pointer;
    pointer-events: all;
    transition: all 0.15s ease;
    box-shadow: var(--shadow-sm);
  }

  .scroll-btn:hover {
    background: var(--color-base02);
    color: var(--color-base06);
  }

  .scroll-btn:focus-visible {
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }

  .scroll-btn:active {
    transform: scale(0.95);
  }
</style>
