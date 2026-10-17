<!--
  @component HoverCard

  One explanatory card for a whole container (a data table, a grid of
  figures), not a popover per cell. It listens on `frame` by event delegation
  for elements matching `selector`, asks `resolve(el)` what to show, and
  renders the answer through the `body` snippet in the top layer
  (`popover="manual"`), so a scroll frame never clips it.

  - Opens after `delays.open` (400 ms) on a resting pointer, `delays.next`
    (120 ms) when hopping from one target to the next; closes `delays.close`
    (200 ms) after the pointer leaves, unless it moved onto the card.
  - Elements matching `focusSelector` (default `th`: a sortable header's
    button) also open on keyboard focus (`:focus-visible` only, so a mouse
    click on a header does not pop it), so definitions are reachable without
    a mouse. While open the target is described by the card
    (`aria-describedby`).
  - A scroll that moves the target (the page, the frame, any ancestor) closes
    it; scrolling an unrelated region does not. Escape closes it and is
    consumed (capture phase, `preventDefault` + `stopPropagation`), so the
    same press does not also close an enclosing Modal or popover. Never opens
    on touch.
  - `body` must be non-interactive: the card is `role="tooltip"`, lives in
    the top layer outside the tab order, and closes when focus leaves the
    target, so a keyboard user can never reach a link or button inside it.
    Put actions on the row or cell itself, or use a Popover / ToolPanel.
  - `align`: `start` hangs the card from the target's left edge, `end` from its
    right edge (right-aligned figure columns); a function decides per element.
  - Opacity-only motion, none under `prefers-reduced-motion`. Every listener,
    timer and frame is removed when `frame` changes or the card unmounts.

  `resolve(el)` returns your detail object, or null for nothing to show.

  @example
  <div class="table-frame" bind:this={frame}>
    <table>… <td data-hover-card data-col="price">…</td> …</table>
  </div>
  <HoverCard {frame} resolve={(el) => details[el.dataset.col] ?? null}>
    {#snippet body({ detail })}<p>{detail.text}</p>{/snippet}
  </HoverCard>
-->
<script>
  /**
   * @type {{
   *   frame: HTMLElement|null,
   *   resolve: (el: HTMLElement) => any,
   *   selector?: string,
   *   focusSelector?: string|null,
   *   width?: number,
   *   align?: 'start'|'end'|((el: HTMLElement) => 'start'|'end'),
   *   delays?: {open?: number, next?: number, close?: number},
   *   gap?: number,
   *   body: import('svelte').Snippet<[{detail: any, width: number, close: () => void}]>,
   *   onopen?: (el: HTMLElement, detail: any) => void,
   *   onclose?: () => void,
   *   class?: string, [key: string]: any
   * }}
   */
  let {
    frame = null,
    resolve,
    selector = '[data-hover-card]',
    focusSelector = 'th',
    width = 288,
    align = 'start',
    delays = {},
    gap = 6,
    body,
    onopen,
    onclose,
    class: className = '',
    ...rest
  } = $props();

  const uid = $props.id();
  const cardId = `jera-hover-card-${uid}`;

  const openMs = $derived(delays.open ?? 400);
  const nextMs = $derived(delays.next ?? 120);
  const closeMs = $derived(delays.close ?? 200);

  let card = $state(null);
  let detail = $state.raw(null);
  /** The element the card is showing for (not reactive: no markup reads it). */
  let current = null;
  /** Its aria-describedby before we added ours, to restore exactly. */
  let describedBefore = null;
  let openTimer = 0;
  let closeTimer = 0;
  let placeFrame = 0;

  /** `:focus-visible` is keyboard focus; older engines without it count all focus. */
  const keyboardFocus = (el) => {
    try {
      return el.matches(':focus-visible');
    } catch {
      return true;
    }
  };

  const targetOf = (node) => (node instanceof Element ? node.closest(selector) : null);
  const alignFor = (el) => (typeof align === 'function' ? align(el) : align);
  const opensOnFocus = (el) => !!focusSelector && el.matches(focusSelector);

  function place(el) {
    if (!card) return;
    const r = el.getBoundingClientRect();
    const h = card.offsetHeight;
    // The rendered width: CSS clamps the card to the viewport, the prop does not.
    const w = card.offsetWidth || width;
    const from = alignFor(el) === 'end' ? r.right - w : r.left;
    const left = Math.max(8, Math.min(from, window.innerWidth - w - 8));
    const below = r.bottom + gap;
    const top = below + h <= window.innerHeight - 8 ? below : Math.max(8, r.top - gap - h);
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
  }

  function describe(el) {
    describedBefore = el.getAttribute('aria-describedby');
    el.setAttribute('aria-describedby', describedBefore ? `${describedBefore} ${cardId}` : cardId);
  }

  function undescribe(el) {
    if (describedBefore === null) el.removeAttribute('aria-describedby');
    else el.setAttribute('aria-describedby', describedBefore);
    describedBefore = null;
  }

  function show(el) {
    const d = resolve(el);
    if (d == null || !card) return close();
    if (current && current !== el) undescribe(current);
    if (current !== el) describe(el);
    current = el;
    detail = d;
    cancelAnimationFrame(placeFrame);
    if (card.matches(':popover-open')) {
      // Hopping: move to the new target now (old size), refine once it laid out.
      place(el);
    } else {
      // First open: hidden until placed, so no frame renders at a stale spot.
      card.style.visibility = 'hidden';
      card.showPopover();
    }
    // Measure once the new content has laid out.
    placeFrame = requestAnimationFrame(() => {
      if (current === el) place(el);
      if (card) card.style.visibility = '';
    });
    onopen?.(el, d);
  }

  function close() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    cancelAnimationFrame(placeFrame);
    if (card) card.style.visibility = '';
    const was = current;
    if (was) undescribe(was);
    current = null;
    if (card?.matches(':popover-open')) card.hidePopover();
    detail = null;
    if (was) onclose?.();
  }

  function closeSoon() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, closeMs);
  }

  $effect(() => {
    const host = frame;
    if (!host) return;

    const over = (e) => {
      if (e.pointerType === 'touch') return;
      const el = targetOf(e.target);
      if (!el || !host.contains(el)) return;
      if (el === current) {
        clearTimeout(closeTimer);
        return;
      }
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      openTimer = setTimeout(() => show(el), current ? nextMs : openMs);
    };
    const out = (e) => {
      const to = e.relatedTarget;
      if (to instanceof Node && (current?.contains(to) || card?.contains(to))) return;
      if (to instanceof Node && targetOf(to) && host.contains(to)) return;
      clearTimeout(openTimer);
      if (current) closeSoon();
    };
    const focus = (e) => {
      const el = targetOf(e.target);
      if (el && host.contains(el) && opensOnFocus(el) && keyboardFocus(e.target)) show(el);
    };
    const blur = () => {
      if (current && opensOnFocus(current)) close();
    };
    const key = (e) => {
      if (e.key !== 'Escape' || !current) return;
      // Consumed: one press closes the card, not also the dialog around it.
      e.preventDefault();
      e.stopPropagation();
      close();
    };
    const scrolled = (e) => {
      if (!current) return;
      const t = e.target;
      // Only a scroll that moves the target: the document, or an ancestor of it.
      if (t === document || (t instanceof Node && t.contains(current))) close();
    };

    host.addEventListener('pointerover', over);
    host.addEventListener('pointerout', out);
    host.addEventListener('focusin', focus);
    host.addEventListener('focusout', blur);
    // Capture: runs before a Modal's or popover's own Escape handling.
    document.addEventListener('keydown', key, { capture: true });
    // Capture: scroll does not bubble; filtered to scrollers that move the target.
    document.addEventListener('scroll', scrolled, { passive: true, capture: true });
    return () => {
      host.removeEventListener('pointerover', over);
      host.removeEventListener('pointerout', out);
      host.removeEventListener('focusin', focus);
      host.removeEventListener('focusout', blur);
      document.removeEventListener('keydown', key, { capture: true });
      document.removeEventListener('scroll', scrolled, { capture: true });
      close();
    };
  });
</script>

<div
  {...rest}
  id={cardId}
  bind:this={card}
  popover="manual"
  role="tooltip"
  class="jera-hover-card {className}"
  style:--hover-card-w="{width}px"
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={closeSoon}
>
  {#if detail != null}{@render body({ detail, width, close })}{/if}
</div>

<style>
  .jera-hover-card {
    position: fixed;
    inset: auto;
    margin: 0;
    inline-size: min(var(--hover-card-w), calc(100vw - 16px));
    padding: var(--space-5) var(--space-6);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    background-color: var(--color-base00);
    box-shadow: var(--shadow-lg);
    color: var(--color-base05);
    font-size: var(--text-xs);
    line-height: 1.4;
    text-align: start;
    white-space: normal;
    opacity: 1;
    transition: opacity 120ms ease-out;
  }

  @starting-style {
    .jera-hover-card:popover-open {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jera-hover-card {
      transition: none;
    }
  }
</style>
