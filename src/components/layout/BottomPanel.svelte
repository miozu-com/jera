<script>
  let {
    open = $bindable(false),
    minimized = $bindable(false),
    height = $bindable(280),
    minHeight = 120,
    maxHeight = undefined,
    minimizedHeight = 28,
    offsetLeft = 0,
    resizable = true,
    class: className = '',
    onresize,
    header,
    sidebar,
    children
  } = $props();

  // ─── Viewport-aware clamping ─────────────────────────────────────
  // Without this, a height restored from localStorage (e.g. 733px on a
  // desktop session) could exceed a smaller viewport's height and push
  // the panel header (with the close button) above the top of the screen,
  // making the panel impossible to close.
  let viewportHeight = $state(typeof globalThis !== 'undefined' && globalThis.innerHeight ? globalThis.innerHeight : 800);

  $effect(() => {
    if (typeof globalThis === 'undefined' || !globalThis.addEventListener) return;
    const onResize = () => {
      viewportHeight = globalThis.innerHeight;
    };
    globalThis.addEventListener('resize', onResize, {passive: true});
    globalThis.addEventListener('orientationchange', onResize, {passive: true});
    return () => {
      globalThis.removeEventListener('resize', onResize);
      globalThis.removeEventListener('orientationchange', onResize);
    };
  });

  // Always leave at least 60px above the panel so the header / close button
  // remains tappable. Mobile viewports (<= 600px high) get a tighter cap.
  const effectiveMax = $derived(
    maxHeight ??
      (viewportHeight <= 600 ? Math.max(minHeight + 40, viewportHeight - 48) : viewportHeight - 60)
  );
  const clampedHeight = $derived(Math.max(minHeight, Math.min(height, effectiveMax)));
  const renderedHeight = $derived(minimized ? minimizedHeight : clampedHeight);

  // If a restored height was over budget on first render, push the clamped
  // value back to the bound prop so consumers (and localStorage persisters)
  // converge to a sane value. Skipped while the user is mid-resize so we
  // don't fight their drag.
  let isResizing = $state(false);
  $effect(() => {
    if (isResizing) return;
    if (clampedHeight !== height && Number.isFinite(clampedHeight)) {
      height = clampedHeight;
    }
  });

  // ─── Resize ──────────────────────────────────────────────────────
  let startY = 0;
  let startHeight = 0;

  function handleResizeStart(e) {
    e.preventDefault();
    isResizing = true;
    startY = e.clientY;
    startHeight = height;

    const onMove = (me) => {
      const delta = startY - me.clientY;
      const min = minimized ? minimizedHeight : minHeight;
      const clamped = Math.max(min, Math.min(startHeight + delta, effectiveMax));

      if (minimized && clamped > minimizedHeight + 20) {
        minimized = false;
      }

      height = clamped;
    };

    const onUp = () => {
      isResizing = false;
      globalThis.removeEventListener('mousemove', onMove);
      globalThis.removeEventListener('mouseup', onUp);
      onresize?.(height);
    };

    globalThis.addEventListener('mousemove', onMove);
    globalThis.addEventListener('mouseup', onUp);
  }

  // Touch equivalent — same resize behavior on mobile/tablet.
  function handleResizeStartTouch(e) {
    if (!e.touches?.[0]) return;
    e.preventDefault();
    isResizing = true;
    startY = e.touches[0].clientY;
    startHeight = height;

    const onMove = (te) => {
      if (!te.touches?.[0]) return;
      const delta = startY - te.touches[0].clientY;
      const min = minimized ? minimizedHeight : minHeight;
      const clamped = Math.max(min, Math.min(startHeight + delta, effectiveMax));

      if (minimized && clamped > minimizedHeight + 20) {
        minimized = false;
      }

      height = clamped;
    };

    const onEnd = () => {
      isResizing = false;
      globalThis.removeEventListener('touchmove', onMove);
      globalThis.removeEventListener('touchend', onEnd);
      globalThis.removeEventListener('touchcancel', onEnd);
      onresize?.(height);
    };

    globalThis.addEventListener('touchmove', onMove, {passive: false});
    globalThis.addEventListener('touchend', onEnd);
    globalThis.addEventListener('touchcancel', onEnd);
  }
</script>

<div
  class="bottom-panel {className}"
  class:is-open={open}
  class:is-minimized={minimized}
  inert={!open}
  style="height: {renderedHeight}px; left: {offsetLeft}px"
>
  {#if resizable}
    <div
      class="bottom-panel-resize"
      class:bottom-panel-resize--active={isResizing}
      onmousedown={handleResizeStart}
      ontouchstart={handleResizeStartTouch}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize panel"
      tabindex="-1"
    ></div>
  {/if}

  <div class="bottom-panel-body">
    {#if sidebar}
      <div class="bottom-panel-sidebar">
        {@render sidebar()}
      </div>
    {/if}

    <div class="bottom-panel-main">
      {#if header}
        <div class="bottom-panel-header">
          {@render header()}
        </div>
      {/if}

      {#if children}
        <div class="bottom-panel-content">
          {@render children()}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* ── Panel Shell ──────────────────────────────────────────────── */

  .bottom-panel {
    display: flex;
    flex-direction: column;
    background: var(--color-base00);
    border-top: var(--border-width-thin) solid
      color-mix(in srgb, var(--color-base03) 30%, transparent);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /* CSS backstop in case JS hasn't computed the clamp yet (SSR, race) —
       never let the panel exceed the visible viewport. Uses dvh so it
       follows mobile browser chrome show/hide correctly. */
    max-height: calc(100dvh - 48px);
    z-index: var(--z-popover);
    overflow: hidden;
    box-shadow: 0 -4px 24px color-mix(in srgb, var(--color-base00) 40%, transparent);

    transform: translateY(100%);
    will-change: transform;
    transition:
      transform var(--duration-200) var(--ease-in),
      left var(--duration-200) var(--ease-in-out);
  }

  .bottom-panel.is-open {
    transform: translateY(0);
    transition:
      transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
      left var(--duration-200) var(--ease-in-out);
  }

  @starting-style {
    .bottom-panel.is-open {
      transform: translateY(100%);
    }
  }

  /* Mobile: ignore desktop sidebar offset so the panel always spans the
     full viewport width, AND give it a touch-friendly minimum. */
  @media (max-width: 768px) {
    .bottom-panel {
      left: 0 !important;
      right: 0 !important;
    }
  }

  /* ── Minimized ─────────────────────────────────────────────── */

  .bottom-panel.is-minimized .bottom-panel-content {
    display: none;
  }

  .bottom-panel.is-minimized .bottom-panel-sidebar {
    display: none;
  }

  .bottom-panel.is-minimized .bottom-panel-resize {
    display: none;
  }

  /* ── Resize Handle ─────────────────────────────────────────── */

  .bottom-panel-resize {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: row-resize;
    /* Touch target — was 6px (below the iOS 44px guideline). 16px gives a
       reasonable touch zone without visually dominating the header.
       The visual handle (::after) stays at 3px. */
    height: 16px;
    flex-shrink: 0;
    touch-action: none;
    transition: background var(--duration-100) var(--ease-default);
  }

  .bottom-panel-resize::after {
    content: '';
    width: 32px;
    height: 3px;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--color-base04) 40%, transparent);
    transition: background var(--duration-100) var(--ease-default);
  }

  .bottom-panel-resize:hover,
  .bottom-panel-resize--active {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .bottom-panel-resize:hover::after,
  .bottom-panel-resize--active::after {
    background: color-mix(in srgb, var(--color-base0D) 60%, transparent);
  }

  /* ── Body ──────────────────────────────────────────────────── */

  .bottom-panel-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  /* ── Sidebar ───────────────────────────────────────────────── */

  .bottom-panel-sidebar {
    display: flex;
    flex-direction: column;
    border-right: var(--border-width-thin) solid
      color-mix(in srgb, var(--color-base03) 20%, transparent);
    background: var(--color-base00);
    flex-shrink: 0;
    overflow: hidden;
  }

  /* On narrow screens the worker chip sidebar competes with the chat body
     for horizontal space — hide it and let users access workers via the
     toolbar instead. */
  @media (max-width: 600px) {
    .bottom-panel-sidebar {
      display: none;
    }
  }

  /* ── Main ──────────────────────────────────────────────────── */

  .bottom-panel-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .bottom-panel-header {
    flex-shrink: 0;
  }

  .bottom-panel-content {
    flex: 1;
    overflow: auto;
  }
</style>
