<!--
  @component Sheet

  A bottom-sheet overlay built on the native <dialog> element. Because it uses
  showModal(), the sheet renders in the browser's top layer — it always paints
  above other overlays (menus, mega-menus) with no z-index management, and is
  viewport-anchored so it never overflows the top of the screen. Mobile-first.

  Slides up from the bottom on open, slides down on close. Drag/swipe the grab
  handle down past a threshold to dismiss. ESC + backdrop click also close.
  Stateless — the consumer owns `open` (bind it).

  @example
  <Sheet bind:open={showSheet} ariaLabel="Workspaces">
    <nav>…</nav>
  </Sheet>
-->
<script>
  let {
    open = $bindable(false),
    closeOnBackdrop = true,
    closeOnEscape = true,
    showHandle = true,
    ariaLabel = '',
    children,
    onclose = () => {},
    class: className = '',
    ...rest
  } = $props();

  let dialogEl = $state(null);
  let dragY = $state(0); // px the panel is currently dragged down
  let dragging = $state(false);
  let startY = 0;

  // Sync the bindable `open` with the native dialog's modal state.
  $effect(() => {
    if (!dialogEl) return;
    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  });

  // Native close event (ESC, .close(), backdrop) — reset drag + notify consumer.
  function handleClose() {
    open = false;
    dragY = 0;
    onclose();
  }

  function handleCancel(e) {
    if (!closeOnEscape) e.preventDefault();
  }

  // A click whose target is the dialog itself is a backdrop click (children
  // sit inside .sheet-panel, so they never match).
  function handleBackdropClick(e) {
    if (closeOnBackdrop && e.target === dialogEl) dialogEl.close();
  }

  function close() {
    if (dialogEl?.open) dialogEl.close();
  }

  // ── Drag-to-dismiss on the grab handle ──────────────────────────────────
  const DISMISS_THRESHOLD = 80; // px dragged down before release dismisses

  function onHandleDown(e) {
    dragging = true;
    startY = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onHandleMove(e) {
    if (!dragging) return;
    const dy = e.clientY - startY;
    dragY = dy > 0 ? dy : 0; // downward only; no rubber-band upward
  }
  function onHandleUp() {
    if (!dragging) return;
    dragging = false;
    if (dragY > DISMISS_THRESHOLD) close();
    else dragY = 0; // snap back
  }
</script>

<dialog
  bind:this={dialogEl}
  class={['sheet', className]}
  class:sheet-dragging={dragging}
  style="--sheet-y: {dragY}px"
  aria-label={ariaLabel || undefined}
  aria-modal="true"
  onclose={handleClose}
  oncancel={handleCancel}
  onclick={handleBackdropClick}
  {...rest}
>
  <div class="sheet-panel">
    {#if showHandle}
      <div
        class="sheet-handle-zone"
        role="button"
        tabindex="0"
        aria-label="Close"
        onpointerdown={onHandleDown}
        onpointermove={onHandleMove}
        onpointerup={onHandleUp}
        onpointercancel={onHandleUp}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            close();
          }
        }}
      >
        <span class="sheet-handle"></span>
      </div>
    {/if}
    <div class="sheet-body">
      {@render children?.()}
    </div>
  </div>
</dialog>

<style>
  /* Native dialog → top layer. Full-screen, transparent layer; the visible
     surface is .sheet-panel pinned to the bottom. */
  dialog.sheet {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    max-width: 100%;
    max-height: 100dvh;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    overflow: hidden;
  }

  .sheet-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    max-height: 85dvh;
    background: var(--color-base01);
    border-top: var(--border-width-default) solid var(--color-base03);
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
    box-shadow: var(--shadow-2xl);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    transform: translateY(var(--sheet-y, 0px));
    transition: transform var(--duration-base) ease-out;
  }

  /* Follow the finger 1:1 while dragging (no easing lag). */
  dialog.sheet.sheet-dragging .sheet-panel {
    transition: none;
  }

  /* Slide-up on open, slide-down on close (kept in top layer via allow-discrete). */
  @starting-style {
    dialog.sheet[open] .sheet-panel {
      transform: translateY(100%);
    }
  }
  dialog.sheet:not([open]) .sheet-panel {
    transform: translateY(100%);
  }
  dialog.sheet {
    transition:
      overlay var(--duration-base) ease-out allow-discrete,
      display var(--duration-base) ease-out allow-discrete;
  }

  /* Backdrop */
  dialog.sheet::backdrop {
    background: color-mix(in srgb, var(--color-base00) 70%, transparent);
    backdrop-filter: blur(3px);
    transition:
      opacity var(--duration-base) ease-out,
      overlay var(--duration-base) ease-out allow-discrete,
      display var(--duration-base) ease-out allow-discrete;
  }
  dialog.sheet[open]::backdrop {
    opacity: 1;
  }
  @starting-style {
    dialog.sheet[open]::backdrop {
      opacity: 0;
    }
  }

  .sheet-handle-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0.625rem 0;
    cursor: grab;
    touch-action: none;
  }
  .sheet-handle-zone:active {
    cursor: grabbing;
  }

  .sheet-handle {
    width: 2.25rem;
    height: 0.25rem;
    border-radius: var(--radius-full);
    background: var(--color-base03);
  }

  .sheet-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Honour reduced-motion: no slide, instant show/hide. */
  @media (prefers-reduced-motion: reduce) {
    .sheet-panel,
    dialog.sheet.sheet-dragging .sheet-panel {
      transition: none;
    }
  }
</style>
