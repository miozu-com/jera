<!--
  @component ScrollStrip

  A horizontal strip for things that can outgrow their row — tabs, chips,
  filters. When they do:

  - no scrollbar, so the row never grows taller and the layout never jumps;
  - each edge fades only while there is more content past it;
  - drag with the mouse to scroll (a click that did not move still clicks; a
    drag never fires the click it ended on);
  - a vertical mouse wheel scrolls it sideways;
  - the item matching `activeSelector` is scrolled into view whenever it
    changes (and on mount), so the selected tab is never off screen.

  Touch and trackpads scroll it natively. Keyboard focus moving onto an item
  scrolls it into view by the browser's own rules. Zero deps; one
  ResizeObserver, disconnected on destroy.

  @example
  <ScrollStrip activeSelector="[aria-selected='true']" role="tablist">
    {#each tabs as tab (tab.id)}<button role="tab" aria-selected={tab.id === active}>{tab.label}</button>{/each}
  </ScrollStrip>
-->
<script>
  /**
   * @type {{
   *   gap?: string,
   *   fade?: string,
   *   activeSelector?: string,
   *   activeKey?: unknown,
   *   class?: string,
   *   children?: import('svelte').Snippet,
   *   [key: string]: unknown
   * }}
   */
  let {
    /** Space between items. */
    gap = '0.25rem',
    /** Width of the edge fade. */
    fade = '1.5rem',
    /** CSS selector of the item to keep in view (e.g. `[aria-selected='true']`). */
    activeSelector = '',
    /** Change this to re-run the scroll-into-view (e.g. the active tab's id). */
    activeKey = undefined,
    class: className = '',
    children,
    ...rest
  } = $props();

  let el = $state(null);
  let atStart = $state(true);
  let atEnd = $state(true);
  let dragging = $state(false);

  function measure() {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    atStart = el.scrollLeft <= 1;
    atEnd = el.scrollLeft >= max - 1;
  }

  $effect(() => {
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  });

  // Keep the active item visible. `activeKey` is read so a change re-runs this.
  $effect(() => {
    void activeKey;
    if (!el || !activeSelector) return;
    const item = el.querySelector(activeSelector);
    if (!item) return;
    const pad = 24;
    const left = item.offsetLeft;
    const right = left + item.offsetWidth;
    if (left - pad < el.scrollLeft) el.scrollTo({left: left - pad, behavior: 'smooth'});
    else if (right + pad > el.scrollLeft + el.clientWidth) {
      el.scrollTo({left: right + pad - el.clientWidth, behavior: 'smooth'});
    }
  });

  // ── drag to scroll (mouse only; touch and pens scroll natively) ──
  const THRESHOLD = 4;
  let startX = 0;
  let startLeft = 0;
  let pointerId = null;
  let moved = false;

  function onpointerdown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (el.scrollWidth <= el.clientWidth) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startLeft = el.scrollLeft;
    moved = false;
  }

  function onpointermove(event) {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    if (!moved) {
      if (Math.abs(dx) < THRESHOLD) return;
      moved = true;
      dragging = true;
      el.setPointerCapture(pointerId);
    }
    el.scrollLeft = startLeft - dx;
  }

  function end(event) {
    if (event.pointerId !== pointerId) return;
    if (el.hasPointerCapture?.(pointerId)) el.releasePointerCapture(pointerId);
    pointerId = null;
    dragging = false;
  }

  // A drag must not click the item it ended on.
  function onclickcapture(event) {
    if (!moved) return;
    moved = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // Links and images start the browser's own drag (a ghost image), which
  // would steal the pointer from drag-to-scroll while the strip overflows.
  function ondragstart(event) {
    if (el.scrollWidth > el.clientWidth && event.target?.closest?.('a, img')) {
      event.preventDefault();
    }
  }

  // A plain vertical wheel scrolls sideways; a trackpad's own horizontal
  // delta is left alone.
  function onwheel(event) {
    if (el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const before = el.scrollLeft;
    el.scrollLeft += event.deltaY;
    if (el.scrollLeft !== before) event.preventDefault();
  }
</script>

<div
  bind:this={el}
  class="jera-scroll-strip {className}"
  class:fade-start={!atStart}
  class:fade-end={!atEnd}
  class:dragging
  style:--strip-gap={gap}
  style:--strip-fade={fade}
  onscroll={measure}
  {onpointerdown}
  {onpointermove}
  onpointerup={end}
  onpointercancel={end}
  onclickcapture={onclickcapture}
  {onwheel}
  {ondragstart}
  {...rest}
>
  {@render children?.()}
</div>

<style>
  .jera-scroll-strip {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: var(--strip-gap);
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    --fade-l: 0px;
    --fade-r: 0px;
    mask-image: linear-gradient(
      to right,
      transparent 0,
      #000 var(--fade-l),
      #000 calc(100% - var(--fade-r)),
      transparent 100%
    );
  }

  .jera-scroll-strip::-webkit-scrollbar {
    display: none;
  }

  .jera-scroll-strip.fade-start {
    --fade-l: var(--strip-fade);
  }

  .jera-scroll-strip.fade-end {
    --fade-r: var(--strip-fade);
  }

  .jera-scroll-strip.dragging {
    cursor: grabbing;
    user-select: none;
  }

  .jera-scroll-strip.dragging :global(*) {
    cursor: grabbing;
  }

  .jera-scroll-strip > :global(*) {
    flex: none;
  }
</style>
