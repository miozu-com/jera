<!--
  @component Drawer

  A slide-out panel overlay using native <dialog> element.
  Supports 4 positions (left, right, top, bottom), 5 sizes, and optional header/footer snippets.
  Provides built-in focus trap, ESC handling, backdrop, and accessibility.

  @prop open — Controls visibility. Use bind:open for two-way binding.
  @prop position — Which edge the drawer slides from: 'left' | 'right' | 'top' | 'bottom'
  @prop size — Panel size: 'sm' (320px) | 'md' (480px) | 'lg' (640px) | 'xl' (800px) | 'full'
  @prop title — Heading text shown in default header (ignored if header snippet provided)
  @prop closable — Whether to show the close button in the default header
  @prop closeOnOverlay — Whether clicking the backdrop closes the drawer
  @prop closeOnEscape — Whether pressing Escape closes the drawer
  @prop header — Optional snippet to replace the default header entirely
  @prop footer — Optional snippet rendered at the bottom of the drawer
  @prop children — Main scrollable body content

  @example Basic right drawer
  <Drawer bind:open={show} title="Settings">
    <p>Drawer content here</p>
  </Drawer>

  @example Left drawer with custom header and footer
  <Drawer bind:open={show} position="left" size="lg">
    {#snippet header()}
      <div class="my-header">Custom Header</div>
    {/snippet}
    <p>Content</p>
    {#snippet footer()}
      <Button onclick={() => show = false}>Close</Button>
    {/snippet}
  </Drawer>
-->
<script>
  import { focusTrap, escapeKey } from '../../actions/index.js';

  let {
    open = $bindable(false),
    position = 'right',
    size = 'md',
    title = '',
    closable = true,
    closeOnOverlay = true,
    closeOnEscape = true,
    class: className = '',
    header,
    footer,
    children
  } = $props();

  let dialogEl = $state(null);

  // Sync open prop with native dialog state
  $effect(() => {
    if (!dialogEl) return;

    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  });

  // Handle native close event (ESC key, form[method=dialog], programmatic close)
  function handleClose() {
    open = false;
  }

  // Handle cancel event (ESC key) — always prevent default so the browser
  // doesn't close the dialog immediately; we control open state ourselves.
  function handleCancel(e) {
    e.preventDefault();
    // Actual ESC close logic is handled by the escapeKey action below,
    // which respects the closeOnEscape prop.
  }

  // Called by the escapeKey action — respects closeOnEscape prop
  function handleEscapeKey() {
    if (closeOnEscape) {
      open = false;
    }
  }

  // Handle backdrop click — the <dialog> element itself is the backdrop
  function handleBackdropClick(e) {
    if (closeOnOverlay && e.target === dialogEl) {
      open = false;
    }
  }

  function close() {
    if (dialogEl?.open) {
      open = false;
    }
  }
</script>

<dialog
  bind:this={dialogEl}
  class="jera-drawer jera-drawer--{position} jera-drawer--{size} {className}"
  aria-labelledby={title ? 'drawer-title' : undefined}
  aria-modal="true"
  onclose={handleClose}
  oncancel={handleCancel}
  onclick={handleBackdropClick}
  use:focusTrap={{ enabled: open }}
  use:escapeKey={handleEscapeKey}
>
  <div
    class="jera-drawer__panel"
    role="presentation"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header: custom snippet takes priority, then default title header -->
    {#if header}
      <div class="jera-drawer__header">
        {@render header()}
      </div>
    {:else if title || closable}
      <div class="jera-drawer__header">
        {#if title}
          <h2 id="drawer-title" class="jera-drawer__title">{title}</h2>
        {:else}
          <span></span>
        {/if}
        {#if closable}
          <button
            class="jera-drawer__close"
            onclick={close}
            aria-label="Close drawer"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        {/if}
      </div>
    {/if}

    <!-- Body -->
    <div class="jera-drawer__body">
      {@render children?.()}
    </div>

    <!-- Footer -->
    {#if footer}
      <div class="jera-drawer__footer">
        {@render footer()}
      </div>
    {/if}
  </div>
</dialog>

<style>
  /* ---
   *Native <dialog> — automatically in top-layer
   * The dialog element itself acts as the backdrop surface.
   * --- */
  dialog.jera-drawer {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    overflow: visible;
  }

  /* Backdrop */
  dialog.jera-drawer::backdrop {
    background: color-mix(in srgb, var(--color-base00) 75%, transparent);
    backdrop-filter: blur(2px);
  }

  /* ---
   *Panel — the sliding surface
   * --- */
  .jera-drawer__panel {
    position: fixed;
    background: var(--color-base01);
    box-shadow: var(--shadow-2xl);
    border: var(--border-width-default) solid var(--color-base02);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ---
   *Position variants — panel placement and slide direction
   * --- */

  /* RIGHT (default) */
  dialog.jera-drawer--right .jera-drawer__panel {
    top: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-radius: var(--radius-xl) 0 0 var(--radius-xl);
  }

  /* LEFT */
  dialog.jera-drawer--left .jera-drawer__panel {
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    border-top: none;
    border-left: none;
    border-bottom: none;
    border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
  }

  /* TOP */
  dialog.jera-drawer--top .jera-drawer__panel {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }

  /* BOTTOM */
  dialog.jera-drawer--bottom .jera-drawer__panel {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-bottom: none;
    border-left: none;
    border-right: none;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  /* ---
   *Size variants
   * right/left drawers: control width
   * top/bottom drawers: control height
   * --- */

  /* sm — 320px */
  dialog.jera-drawer--right.jera-drawer--sm .jera-drawer__panel,
  dialog.jera-drawer--left.jera-drawer--sm .jera-drawer__panel {
    width: 320px;
  }
  dialog.jera-drawer--top.jera-drawer--sm .jera-drawer__panel,
  dialog.jera-drawer--bottom.jera-drawer--sm .jera-drawer__panel {
    height: 320px;
  }

  /* md — 480px */
  dialog.jera-drawer--right.jera-drawer--md .jera-drawer__panel,
  dialog.jera-drawer--left.jera-drawer--md .jera-drawer__panel {
    width: 480px;
  }
  dialog.jera-drawer--top.jera-drawer--md .jera-drawer__panel,
  dialog.jera-drawer--bottom.jera-drawer--md .jera-drawer__panel {
    height: 480px;
  }

  /* lg — 640px */
  dialog.jera-drawer--right.jera-drawer--lg .jera-drawer__panel,
  dialog.jera-drawer--left.jera-drawer--lg .jera-drawer__panel {
    width: 640px;
  }
  dialog.jera-drawer--top.jera-drawer--lg .jera-drawer__panel,
  dialog.jera-drawer--bottom.jera-drawer--lg .jera-drawer__panel {
    height: 640px;
  }

  /* xl — 800px */
  dialog.jera-drawer--right.jera-drawer--xl .jera-drawer__panel,
  dialog.jera-drawer--left.jera-drawer--xl .jera-drawer__panel {
    width: 800px;
  }
  dialog.jera-drawer--top.jera-drawer--xl .jera-drawer__panel,
  dialog.jera-drawer--bottom.jera-drawer--xl .jera-drawer__panel {
    height: 800px;
  }

  /* full — 100% */
  dialog.jera-drawer--right.jera-drawer--full .jera-drawer__panel,
  dialog.jera-drawer--left.jera-drawer--full .jera-drawer__panel {
    width: 100%;
  }
  dialog.jera-drawer--top.jera-drawer--full .jera-drawer__panel,
  dialog.jera-drawer--bottom.jera-drawer--full .jera-drawer__panel {
    height: 100%;
  }

  /* ---
   *Entry / Exit animations using @starting-style
   * Each position gets its own translate axis
   * --- */

  /* Backdrop fade */
  dialog.jera-drawer[open]::backdrop {
    opacity: 1;
  }

  @starting-style {
    dialog.jera-drawer[open]::backdrop {
      opacity: 0;
    }
  }

  dialog.jera-drawer::backdrop {
    transition:
      opacity var(--duration-base) var(--ease-out),
      overlay var(--duration-base) var(--ease-out) allow-discrete,
      display var(--duration-base) var(--ease-out) allow-discrete;
  }

  /* Panel transitions — compositor-only (transform + opacity) */
  .jera-drawer__panel {
    transition:
      transform var(--duration-base) var(--ease-out),
      opacity var(--duration-fast) var(--ease-out);
  }

  /* RIGHT: slide from right */
  dialog.jera-drawer--right[open] .jera-drawer__panel {
    transform: translateX(0);
    opacity: 1;
  }

  @starting-style {
    dialog.jera-drawer--right[open] .jera-drawer__panel {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  /* LEFT: slide from left */
  dialog.jera-drawer--left[open] .jera-drawer__panel {
    transform: translateX(0);
    opacity: 1;
  }

  @starting-style {
    dialog.jera-drawer--left[open] .jera-drawer__panel {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  /* TOP: slide from top */
  dialog.jera-drawer--top[open] .jera-drawer__panel {
    transform: translateY(0);
    opacity: 1;
  }

  @starting-style {
    dialog.jera-drawer--top[open] .jera-drawer__panel {
      transform: translateY(-100%);
      opacity: 0;
    }
  }

  /* BOTTOM: slide from bottom */
  dialog.jera-drawer--bottom[open] .jera-drawer__panel {
    transform: translateY(0);
    opacity: 1;
  }

  @starting-style {
    dialog.jera-drawer--bottom[open] .jera-drawer__panel {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  /* Dialog-level allow-discrete for display/overlay transitions */
  dialog.jera-drawer {
    transition:
      overlay var(--duration-base) var(--ease-out) allow-discrete,
      display var(--duration-base) var(--ease-out) allow-discrete;
  }

  /* ---
   *Inner layout
   * --- */

  .jera-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: var(--border-width-thin) solid var(--color-base02);
    flex-shrink: 0;
  }

  .jera-drawer__title {
    margin: 0;
    font-size: var(--text-lg, 1.125rem);
    font-weight: 600;
    color: var(--color-base07);
    line-height: 1.4;
  }

  .jera-drawer__close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0.25rem;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-base05);
    cursor: pointer;
    transition:
      background var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);

    &:hover {
      background: var(--color-base02);
      color: var(--color-base07);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-shadow);
    }
  }

  .jera-drawer__body {
    flex: 1 1 0%;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem;
  }

  .jera-drawer__footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1rem 1.25rem;
    border-top: var(--border-width-thin) solid var(--color-base02);
    flex-shrink: 0;
  }
</style>
