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
  Escape hides it. It shifts sideways to stay inside the viewport.

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
  /** Sideways shift (px) that keeps the bubble inside the viewport. */
  let dx = $state(0);
  let tipEl = $state(null);
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

  // Keep the bubble on screen: measure once it renders, shift it sideways.
  $effect(() => {
    if (!visible || !tipEl) {
      dx = 0;
      return;
    }
    const r = tipEl.getBoundingClientRect();
    const margin = 8;
    const vw = document.documentElement.clientWidth;
    let shift = 0;
    if (r.right > vw - margin) shift = vw - margin - r.right;
    if (r.left + shift < margin) shift = margin - r.left;
    dx = Math.round(shift);
  });

  // A tap outside closes a touch-opened tooltip.
  $effect(() => {
    if (!visible || !touched) return;
    const wrapper = tipEl?.parentElement;
    function away(event) {
      if (wrapper && !wrapper.contains(event.target)) {
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
      style:--tooltip-dx="{dx}px"
      aria-hidden={text ? 'true' : undefined}
      class="tooltip tooltip-{position} {content ? 'tooltip-interactive' : ''}"
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

  .tooltip {
    position: absolute;
    translate: var(--tooltip-dx, 0px) 0;
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
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-base06);
    background: var(--color-base01);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    white-space: normal;
    max-width: min(20rem, calc(100vw - 1rem));
    width: max-content;
  }

  .tooltip-arrow {
    position: absolute;
    translate: calc(-1 * var(--tooltip-dx, 0px)) 0;
    width: 8px;
    height: 8px;
    background: var(--color-base01);
    border: var(--border-width-thin) solid var(--color-base02);
    transform: rotate(45deg);
  }

  /* Position: Top */
  .tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--space-4);
  }

  .tooltip-top .tooltip-arrow {
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-top: none;
    border-left: none;
  }

  /* Position: Bottom */
  .tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--space-4);
  }

  .tooltip-bottom .tooltip-arrow {
    top: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-bottom: none;
    border-right: none;
  }

  /* Position: Left */
  .tooltip-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: var(--space-4);
  }

  .tooltip-left .tooltip-arrow {
    right: -5px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    border-left: none;
    border-bottom: none;
  }

  /* Position: Right */
  .tooltip-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: var(--space-4);
  }

  .tooltip-right .tooltip-arrow {
    left: -5px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    border-right: none;
    border-top: none;
  }
</style>
