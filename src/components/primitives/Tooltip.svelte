<!--
  @component Tooltip

  A fast, accessible tooltip that appears on hover.
  Supports multiple positions and custom content.

  @example Basic tooltip
  <Tooltip text="Edit this item">
    <Button>Edit</Button>
  </Tooltip>

  @example Different positions
  <Tooltip text="Top tooltip" position="top">
    <span>Hover me</span>
  </Tooltip>

  <Tooltip text="Right tooltip" position="right">
    <span>Hover me</span>
  </Tooltip>

  @example With custom delay
  <Tooltip text="Delayed tooltip" delay={500}>
    <Button>Hover</Button>
  </Tooltip>

  @example Describing a focusable trigger (keyboard + screen reader)
  The children snippet receives the id of an always-present description, so
  the focusable element itself can carry `aria-describedby`.
  <Tooltip text="Listing price range">
    {#snippet children(describedBy)}
      <button type="button" aria-label="About Price" aria-describedby={describedBy}>ⓘ</button>
    {/snippet}
  </Tooltip>

  Shows on hover, on keyboard focus inside it, and on tap (touch toggles);
  Escape hides it. The bubble renders in the top layer (`popover="manual"`),
  so a scrolling pane never clips it, and stays inside the visible box — the
  viewport cut by every clipping ancestor of the trigger: it flips to the
  opposite side when the asked one has no room and shifts along the other
  axis, the arrow kept on the trigger (`utils/tooltipPlacement.js`).

  Theming (inherited custom properties, set on any ancestor):
  `--tooltip-max-width` (default `min(20rem, 100vw - 1rem)`), `--tooltip-color`
  (base06), `--tooltip-bg` (base01), `--tooltip-border` (base02),
  `--tooltip-radius` (radius-md), `--tooltip-weight` (medium).

  @example Rich content
  <Tooltip>
    {#snippet content()}
      <div class="tooltip-rich">
        <strong>Title</strong>
        <p>Description text here</p>
      </div>
    {/snippet}
    <Button>Info</Button>
  </Tooltip>
-->
<script>
  import { clipBounds, placeTooltip } from '../../utils/tooltipPlacement.js';

  let {
    text = '',
    position = 'top',
    delay = 50,
    disabled = false,
    class: className = '',
    content,
    children,
    ...rest
  } = $props();

  const uid = $props.id();
  const tooltipId = `tooltip-${uid}`;
  const descId = `tooltip-desc-${uid}`;

  let visible = $state(false);
  /** Where the bubble sits (`placeTooltip`), null until measured. */
  let pos = $state.raw(null);
  let tipEl = $state(null);
  let wrapEl = $state(null);
  let timeout = null;
  /** A touch opened it: the following mouse/click events from that tap are ignored. */
  let touched = false;

  function show() {
    if (disabled) return;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      visible = true;
    }, delay);
  }

  function hide() {
    clearTimeout(timeout);
    timeout = null;
    visible = false;
  }

  function onpointerdown(event) {
    if (event.pointerType !== 'touch' || disabled) return;
    touched = true;
    clearTimeout(timeout);
    visible = !visible;
  }

  function onmouseenter() {
    if (touched) return;
    show();
  }

  function onmouseleave() {
    if (touched) return;
    hide();
  }

  function onfocusin() {
    if (touched) return;
    show();
  }

  function onfocusout(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    touched = false;
    hide();
  }

  function onkeydown(event) {
    if (event.key === 'Escape' && visible) {
      event.stopPropagation();
      hide();
    }
  }

  /** Measure the trigger and the bubble, then place it inside the visible box. */
  function place() {
    if (!tipEl || !wrapEl) return;
    const anchor = wrapEl.getBoundingClientRect();
    const size = { width: tipEl.offsetWidth, height: tipEl.offsetHeight };
    const bounds = clipBounds(wrapEl, 8, size);
    pos = placeTooltip({
      anchor,
      size,
      bounds,
      side: position,
    });
  }

  // Into the top layer (no pane clips it), placed once it has a size, and
  // kept on its trigger while anything scrolls or the window resizes.
  $effect(() => {
    if (!visible || !tipEl) {
      pos = null;
      return;
    }
    try {
      tipEl.showPopover?.();
    } catch {
      // Already open, or no popover support: it still renders in place.
    }
    place();
    window.addEventListener('scroll', place, { capture: true, passive: true });
    window.addEventListener('resize', place, { passive: true });
    return () => {
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
    };
  });

  // Escape closes it even when it opened on hover (focus elsewhere).
  $effect(() => {
    if (!visible) return;
    function onEscape(event) {
      if (event.key === 'Escape') hide();
    }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  });

  // A tap outside closes a touch-opened tooltip.
  $effect(() => {
    if (!visible || !touched) return;
    function away(event) {
      if (wrapEl && !wrapEl.contains(event.target)) {
        touched = false;
        hide();
      }
    }
    document.addEventListener('pointerdown', away, true);
    return () => document.removeEventListener('pointerdown', away, true);
  });

  $effect(() => {
    return () => clearTimeout(timeout);
  });
</script>

<div
  bind:this={wrapEl}
  class="tooltip-wrapper {className}"
  {onmouseenter}
  {onmouseleave}
  {onfocusin}
  {onfocusout}
  {onkeydown}
  {onpointerdown}
  {...rest}
>
  {#if children}
    {@render children(text ? descId : undefined)}
  {/if}
  {#if text}
    <span id={descId} class="tooltip-sr">{text}</span>
  {/if}

  {#if visible && (text || content)}
    <div
      id={tooltipId}
      bind:this={tipEl}
      popover="manual"
      data-side={pos?.side ?? position}
      style:left={pos ? `${pos.x}px` : null}
      style:top={pos ? `${pos.y}px` : null}
      style:--tooltip-arrow="{pos?.arrow ?? 0}px"
      style:visibility={pos ? null : 'hidden'}
      aria-hidden={text ? 'true' : undefined}
      class="tooltip {content ? 'tooltip-interactive' : ''}"
      role="tooltip"
      onmouseenter={content ? show : undefined}
      onmouseleave={content ? hide : undefined}
    >
      <div class="tooltip-content">
        {#if content}
          {@render content()}
        {:else}
          {text}
        {/if}
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-flex;
  }

  /* The always-present description `aria-describedby` points at. */
  .tooltip-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* Top layer (popover): the UA's centred, bordered box reset; placed in px. */
  .tooltip {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    overflow: visible;
    z-index: var(--z-tooltip);
    pointer-events: none;
  }

  .tooltip-interactive {
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: no-preference) {
    .tooltip {
      animation: tooltip-enter 0.15s ease-out;

      @starting-style {
        opacity: 0;
      }
    }

    @keyframes tooltip-enter {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }

  .tooltip-content {
    box-sizing: border-box;
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-xs);
    font-weight: var(--tooltip-weight, var(--font-weight-medium));
    line-height: 1.45;
    color: var(--tooltip-color, var(--color-base06));
    background: var(--tooltip-bg, var(--color-base01));
    border: var(--border-width-thin) solid var(--tooltip-border, var(--color-base02));
    border-radius: var(--tooltip-radius, var(--radius-md));
    box-shadow: var(--shadow-md);
    white-space: normal;
    overflow-wrap: break-word;
    max-width: min(var(--tooltip-max-width, 20rem), calc(100vw - 1rem));
    width: max-content;
  }

  /* The arrow points at the trigger: `--tooltip-arrow` is its centre along the bubble's edge. */
  .tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--tooltip-bg, var(--color-base01));
    border: var(--border-width-thin) solid var(--tooltip-border, var(--color-base02));
    transform: rotate(45deg);
  }

  [data-side='top'] .tooltip-arrow {
    bottom: -4px;
    left: calc(var(--tooltip-arrow) - 4px);
    border-top: none;
    border-left: none;
  }

  [data-side='bottom'] .tooltip-arrow {
    top: -4px;
    left: calc(var(--tooltip-arrow) - 4px);
    border-bottom: none;
    border-right: none;
  }

  [data-side='left'] .tooltip-arrow {
    right: -4px;
    top: calc(var(--tooltip-arrow) - 4px);
    border-left: none;
    border-bottom: none;
  }

  [data-side='right'] .tooltip-arrow {
    left: -4px;
    top: calc(var(--tooltip-arrow) - 4px);
    border-right: none;
    border-top: none;
  }
</style>
