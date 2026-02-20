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

  // ─── Resize ──────────────────────────────────────────────────────
  let isResizing = $state(false);
  let startY = 0;
  let startHeight = 0;

  function handleResizeStart(e) {
    e.preventDefault();
    isResizing = true;
    startY = e.clientY;
    startHeight = height;

    const onMove = (me) => {
      const delta = startY - me.clientY;
      const max = maxHeight ?? (globalThis.innerHeight - 120);
      const min = minimized ? minimizedHeight : minHeight;
      const clamped = Math.max(min, Math.min(startHeight + delta, max));

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
</script>

<div
  class="bottom-panel {className}"
  class:is-open={open}
  class:is-minimized={minimized}
  inert={!open}
  style="height: {minimized ? minimizedHeight : height}px; left: {offsetLeft}px"
>
  {#if resizable}
    <div
      class="bottom-panel-resize"
      class:bottom-panel-resize--active={isResizing}
      onmousedown={handleResizeStart}
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
    border-top: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
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
    height: 6px;
    flex-shrink: 0;
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
  }

  /* ── Sidebar ───────────────────────────────────────────────── */

  .bottom-panel-sidebar {
    display: flex;
    flex-direction: column;
    border-right: 1px solid color-mix(in srgb, var(--color-base03) 20%, transparent);
    background: var(--color-base00);
    flex-shrink: 0;
    overflow: hidden;
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
