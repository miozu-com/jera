<!--
  @component Popover

  A tooltip/popover component with CSS Anchor Positioning (with JS fallback).
  Uses native popover API for top-layer rendering.

  @example
  <Popover content="This is helpful information" position="top">
    <Button>Hover me</Button>
  </Popover>

  @example Tap on a phone, focus from the keyboard (opt-in)
  <Popover content="Excludes storage fees" tap>
    <button type="button" aria-label="Excludes storage fees">ⓘ</button>
  </Popover>

  @example Wider rich content (opt-in; the default cap is 18rem)
  <Popover maxWidth="24rem">…</Popover>
  @example Click to open (opt-in) — a status badge whose rows carry actions
  The trigger toggles `open`; Escape and a press outside close it. The panel
  is a `role="dialog"` named by `label`, aligned to the trigger's start edge
  with `align="start"`. The content snippet receives `close`. Opening moves
  focus into the panel; every close but a press outside hands it back to the
  trigger. Escape closes the innermost panel only (a dialog opened from the
  panel keeps its own Escape).
  <Popover trigger="click" bind:open label="Needs you" position="top" align="start">
    <Badge onclick={() => (open = !open)} aria-haspopup="dialog" aria-expanded={open}>1 needs you</Badge>
    {#snippet content(close)}<Button onclick={close}>Review</Button>{/snippet}
  </Popover>

  @example With custom content
  <Popover position="bottom">
    {#snippet content()}
      <div>Custom <strong>HTML</strong> content</div>
    {/snippet}
    <Button>Hover for details</Button>
  </Popover>
-->
<script>
  import { fly } from 'svelte/transition';

  let {
    children,
    content = '',
    position = 'top',
    delay = { show: 100, hide: 100 },
    offset = 8,
    maxWidth = null,
    /** Opt-in: a finger's tap toggles it and keyboard focus shows it (hover alone never reaches a phone). */
    tap = false,
    /** Opt-in: 'click' — the consumer's trigger toggles `open`; hover does nothing; a dialog, not a tooltip. */
    trigger = 'hover',
    /** Click mode only: whether the panel is open (bindable). */
    open = $bindable(false),
    /** Click mode only: the dialog's accessible name. */
    label = '',
    /** Opt-in: 'start' lines the panel up with the trigger's start edge instead of centring it. */
    align = 'center',
    class: className = ''
  } = $props();

  const clickMode = $derived(trigger === 'click');
  let wrapperEl = $state(null);

  const FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function close() {
    open = false;
  }

  /** The consumer's trigger: the first focusable element of the wrapper outside the panel. */
  function triggerTarget() {
    for (const el of wrapperEl?.querySelectorAll(FOCUSABLE) ?? []) {
      if (!popoverEl?.contains(el)) return el;
    }
    return null;
  }

  /**
   * Escape closes the innermost click panel only. Not this one when the key
   * was already handled, when it came from a dialog that is not this panel and
   * does not hold it (a dialog opened from the panel, a nested popover, a modal
   * elsewhere), or when this panel holds an open nested panel (that one closes).
   */
  function handleKeydown(event) {
    if (event.key !== 'Escape' || !open || event.defaultPrevented) return;
    const from = event.target instanceof Element ? event.target : null;
    const host = from?.closest('[role="dialog"], dialog');
    if (host && host !== popoverEl && !host.contains(wrapperEl)) return;
    if (popoverEl?.querySelector('[role="dialog"], dialog[open]')) return;
    event.preventDefault();
    open = false;
  }

  /** A press anywhere outside the trigger and the panel closes it; focus stays where it was pressed. */
  let pressedOutside = false;
  function handleOutside(event) {
    if (open && wrapperEl && !wrapperEl.contains(event.target)) {
      pressedOutside = true;
      open = false;
    }
  }

  // Focus follows the panel (click mode): into it when it opens — its first
  // control, else the panel itself — and back to the trigger on every close
  // (Escape, the content's `close`, the consumer setting `open = false`) when
  // focus was in the panel or would be lost with it. A press outside leaves
  // focus where the press put it.
  let wasOpen = false;
  $effect(() => {
    if (!clickMode) return;
    if (open && !wasOpen) {
      wasOpen = true;
      const id = requestAnimationFrame(() => {
        const first = popoverEl?.querySelector(FOCUSABLE) ?? popoverEl;
        first?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(id);
    }
    if (!open && wasOpen) {
      wasOpen = false;
      const outside = pressedOutside;
      pressedOutside = false;
      if (outside || typeof document === 'undefined') return;
      const active = document.activeElement;
      if (!active || active === document.body || popoverEl?.contains(active)) {
        triggerTarget()?.focus({ preventScroll: true });
      }
    }
  });

  // The JS fallback positions a click panel once it is drawn.
  $effect(() => {
    if (!clickMode || !open || supportsAnchor) return;
    triggerEl = wrapperEl?.firstElementChild ?? wrapperEl;
    const id = requestAnimationFrame(() => requestAnimationFrame(positionPopover));
    return () => cancelAnimationFrame(id);
  });

  const shown = $derived(clickMode ? open : visible);

  // Feature detection for CSS Anchor Positioning, decided in the browser after
  // mount: `CSS` is undefined on the server, so a module-level constant would
  // differ between the server render and hydration.
  let supportsAnchor = $state(false);
  $effect(() => {
    supportsAnchor = typeof CSS !== 'undefined' && CSS.supports('anchor-name', '--test');
  });

  let visible = $state(false);
  let timeoutId = $state(null);
  let popoverEl = $state(null);
  let triggerEl = $state(null);
  let isHoveringPopover = $state(false);

  // Only needed for JS fallback
  let windowWidth = $state(0);
  let windowHeight = $state(0);

  // Generate unique anchor name for this instance
  const anchorName = `--popover-anchor-${Math.random().toString(36).slice(2, 9)}`;

  // Animation configs based on position
  const animations = {
    top: { in: { y: 8, duration: 200 }, out: { y: -8, duration: 150 } },
    bottom: { in: { y: -8, duration: 200 }, out: { y: 8, duration: 150 } },
    left: { in: { x: 8, duration: 200 }, out: { x: -8, duration: 150 } },
    right: { in: { x: -8, duration: 200 }, out: { x: 8, duration: 150 } }
  };

  const anim = $derived(animations[position] || animations.top);

  function handleMouseEnter(event) {
    clearTimeout(timeoutId);
    triggerEl = event.currentTarget;
    timeoutId = setTimeout(() => {
      visible = true;
      // For JS fallback, position after render
      if (!supportsAnchor) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            positionPopover();
          });
        });
      }
    }, delay.show);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!isHoveringPopover) {
        visible = false;
      }
    }, delay.hide);
  }

  // A tap focuses the button too; that focus must not open what the tap toggles.
  let touching = false;

  function handleFocusIn(event) {
    if (!touching) handleMouseEnter(event);
  }

  function handleTap(event) {
    touching = false;
    if (event.pointerType !== 'touch') return;
    if (visible) {
      clearTimeout(timeoutId);
      visible = false;
    } else {
      handleMouseEnter(event);
    }
  }

  function handleFocusOut(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) handleMouseLeave();
  }

  function handlePopoverEnter() {
    clearTimeout(timeoutId);
    isHoveringPopover = true;
  }

  function handlePopoverLeave() {
    isHoveringPopover = false;
    handleMouseLeave();
  }

  // JS fallback positioning (only used when CSS Anchor not supported)
  function positionPopover() {
    if (!popoverEl || !triggerEl || supportsAnchor) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const popoverWidth = popoverEl.offsetWidth;
    const popoverHeight = popoverEl.offsetHeight;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    let left = 0;
    let top = 0;

    switch (position) {
      case 'top':
        left = align === 'start' ? triggerRect.left : triggerCenterX - popoverWidth / 2;
        top = triggerRect.top - popoverHeight - offset;
        break;
      case 'bottom':
        left = align === 'start' ? triggerRect.left : triggerCenterX - popoverWidth / 2;
        top = triggerRect.bottom + offset;
        break;
      case 'left':
        left = triggerRect.left - popoverWidth - offset;
        top = triggerCenterY - popoverHeight / 2;
        break;
      case 'right':
        left = triggerRect.right + offset;
        top = triggerCenterY - popoverHeight / 2;
        break;
    }

    // Viewport boundary detection
    const margin = 8;

    if (left < margin) {
      left = margin;
    } else if (left + popoverWidth > windowWidth - margin) {
      left = windowWidth - popoverWidth - margin;
    }

    if (top < margin) {
      if (position === 'top') {
        top = triggerRect.bottom + offset;
      } else {
        top = margin;
      }
    } else if (top + popoverHeight > windowHeight - margin) {
      if (position === 'bottom') {
        top = triggerRect.top - popoverHeight - offset;
      } else {
        top = windowHeight - popoverHeight - margin;
      }
    }

    popoverEl.style.left = `${left}px`;
    popoverEl.style.top = `${top}px`;
  }

  function handleScroll() {
    if (shown && triggerEl && popoverEl && !supportsAnchor) {
      requestAnimationFrame(positionPopover);
    }
  }
</script>

<!-- Window bindings for JS fallback (always rendered, handlers conditional) -->
<svelte:window
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  onscroll={!supportsAnchor && shown ? handleScroll : undefined}
  onresize={!supportsAnchor && shown ? handleScroll : undefined}
  onkeydown={clickMode && open ? handleKeydown : undefined}
  onpointerdown={clickMode && open ? handleOutside : undefined}
/>

<div
  class="popover-wrapper {className}"
  bind:this={wrapperEl}
  style={supportsAnchor ? `anchor-name: ${anchorName};` : ''}
  onmouseenter={tap || clickMode ? undefined : handleMouseEnter}
  onmouseleave={tap || clickMode ? undefined : handleMouseLeave}
  onpointerenter={tap ? e => e.pointerType !== 'touch' && handleMouseEnter(e) : undefined}
  onpointerleave={tap ? e => e.pointerType !== 'touch' && handleMouseLeave() : undefined}
  onclick={tap ? handleTap : undefined}
  onpointerdown={tap ? e => (touching = e.pointerType === 'touch') : undefined}
  onfocusin={tap ? handleFocusIn : undefined}
  onfocusout={tap ? handleFocusOut : undefined}
>
  {@render children?.()}

  {#if shown}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -- -1 in click mode only: a dialog takes programmatic focus when it holds no control -->
    <div
      class="popover"
      class:popover-anchor={supportsAnchor}
      class:popover-js={!supportsAnchor}
      data-position={position}
      data-align={align === 'start' ? 'start' : undefined}
      style="{supportsAnchor ?
        `position-anchor: ${anchorName}; --offset: ${offset}px;`
      : ''}{maxWidth ? ` --popover-max: ${maxWidth};` : ''}"
      role={clickMode ? 'dialog' : 'tooltip'}
      aria-label={clickMode && label ? label : undefined}
      tabindex={clickMode ? -1 : undefined}
      in:fly={anim.in}
      out:fly={anim.out}
      bind:this={popoverEl}
      onmouseenter={clickMode ? undefined : handlePopoverEnter}
      onmouseleave={clickMode ? undefined : handlePopoverLeave}
    >
      {#if typeof content === 'string'}
        {content}
      {:else if typeof content === 'function'}
        {@render content(close)}
      {:else}
        {content}
      {/if}
    </div>
  {/if}
</div>

<style>
  .popover-wrapper {
    position: relative;
    display: inline-block;
  }

  .popover {
    min-width: 8rem;
    max-width: var(--popover-max, 18rem);
    width: max-content;
    padding: 0.5rem 0.75rem;
    background: var(--color-base01);
    color: var(--color-base07);
    font-size: var(--text-sm);
    line-height: 1.5;
    border-radius: var(--radius-default);
    box-shadow: var(--shadow-lg);
    border: var(--border-width-default) solid var(--color-base03);
    pointer-events: auto;
    word-wrap: break-word;
    hyphens: auto;
  }

  /* Click mode: the panel takes focus only when it holds no control of its own. */
  .popover[role='dialog']:focus {
    outline: none;
  }

  /* CSS Anchor Positioning (Chrome 125+) */
  /* Fixed, not absolute: an absolutely positioned popover's containing block
     is .popover-wrapper (position: relative), which is also its anchor, and
     an element cannot be anchored to its own containing block — anchor()
     fell back and the popover sat on its trigger, past the viewport edge
     (dash Rows score popover, 2026-10-07). Fixed resolves against the
     viewport and is not clipped by scroll containers. */
  .popover-anchor {
    position: fixed;
    z-index: var(--z-popover);
    inset: unset;

    /* Position based on data-position attribute */
    &[data-position='top'] {
      bottom: calc(anchor(top) + var(--offset));
      left: anchor(center);
      translate: -50% 0;
    }

    &[data-position='bottom'] {
      top: calc(anchor(bottom) + var(--offset));
      left: anchor(center);
      translate: -50% 0;
    }

    &[data-position='left'] {
      right: calc(anchor(left) + var(--offset));
      top: anchor(center);
      translate: 0 -50%;
    }

    &[data-position='right'] {
      left: calc(anchor(right) + var(--offset));
      top: anchor(center);
      translate: 0 -50%;
    }

    /* Start-aligned (opt-in): the panel's start edge on the trigger's. */
    &[data-align='start'][data-position='top'],
    &[data-align='start'][data-position='bottom'] {
      left: anchor(left);
      translate: 0 0;
    }

    /* Auto-flip when near viewport edges */
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  }

  /* JS Fallback positioning */
  .popover-js {
    position: fixed;
    z-index: var(--z-popover);
  }
</style>
