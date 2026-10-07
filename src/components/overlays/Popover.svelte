<!--
  @component Popover

  A tooltip/popover component with CSS Anchor Positioning (with JS fallback).
  Uses native popover API for top-layer rendering.

  @example
  <Popover content="This is helpful information" position="top">
    <Button>Hover me</Button>
  </Popover>

  @example Wider rich content (opt-in; the default cap is 18rem)
  <Popover maxWidth="24rem">…</Popover>
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
    class: className = ''
  } = $props();

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
        left = triggerCenterX - popoverWidth / 2;
        top = triggerRect.top - popoverHeight - offset;
        break;
      case 'bottom':
        left = triggerCenterX - popoverWidth / 2;
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
    if (visible && triggerEl && popoverEl && !supportsAnchor) {
      requestAnimationFrame(positionPopover);
    }
  }
</script>

<!-- Window bindings for JS fallback (always rendered, handlers conditional) -->
<svelte:window
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  onscroll={!supportsAnchor && visible ? handleScroll : undefined}
  onresize={!supportsAnchor && visible ? handleScroll : undefined}
/>

<div
  class="popover-wrapper {className}"
  style={supportsAnchor ? `anchor-name: ${anchorName};` : ''}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  {@render children?.()}

  {#if visible}
    <div
      class="popover"
      class:popover-anchor={supportsAnchor}
      class:popover-js={!supportsAnchor}
      data-position={position}
      style="{supportsAnchor ?
        `position-anchor: ${anchorName}; --offset: ${offset}px;`
      : ''}{maxWidth ? ` --popover-max: ${maxWidth};` : ''}"
      role="tooltip"
      in:fly={anim.in}
      out:fly={anim.out}
      bind:this={popoverEl}
      onmouseenter={handlePopoverEnter}
      onmouseleave={handlePopoverLeave}
    >
      {#if typeof content === 'string'}
        {content}
      {:else if typeof content === 'function'}
        {@render content()}
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

    /* Auto-flip when near viewport edges */
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  }

  /* JS Fallback positioning */
  .popover-js {
    position: fixed;
    z-index: var(--z-popover);
  }
</style>
