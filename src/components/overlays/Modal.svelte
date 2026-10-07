<!--
  @component Modal

  A flexible modal dialog component using native <dialog> element.
  Provides built-in focus trap, ESC handling, backdrop, and accessibility.

  @prop fill — Anchors the dialog to a stable height so content changes
    (empty states, search results) don't cause layout jumps. Uses flex
    column internally: header/footer stay pinned, body stretches and scrolls.

  @prop fullscreen — `false` (default) always framed; `true` always fills the
    viewport; `'mobile'` fills it below `md` and stays framed above, so a dialog
    that is wide by design reads as a page on a phone. Fullscreen keeps the
    dialog chrome the size classes do not provide: the whole viewport, no
    border, no radius. It is still a modal — top layer, focus trap, close
    button — and its content scrolls internally so the close button stays put.

  @example
  <Modal bind:open={showModal} title="Confirm Action">
    <p>Are you sure you want to proceed?</p>
    {#snippet footer()}
      <Button variant="ghost" onclick={() => showModal = false}>Cancel</Button>
      <Button variant="primary" onclick={handleConfirm}>Confirm</Button>
    {/snippet}
  </Modal>

  @example fill mode (stable height, internal scroll)
  <Modal bind:open={show} title="Select Item" size="xl" fill>
    <div class="scrollable-content">...</div>
    {#snippet footer()}
      <Button onclick={() => show = false}>Done</Button>
    {/snippet}
  </Modal>
-->

<!-- file-size: justified -- one component (the modal dialog). The style block is
     the frame, five width steps, fill mode, fullscreen, the top-layer
     transitions and the close button: all of it styles this one element and its
     three internal parts, and none of it is usable apart from the rest. The two
     fullscreen blocks are deliberately identical — the mobile variant has to be
     applied under a media query, not un-applied outside one (see the note there). -->
<script>
  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    variant = 'default',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showClose = true,
    fill = false,
    /**
     * `false` — always framed. `true` — always fills the viewport.
     * `'mobile'` — fills the viewport below `md`, framed above it, so a dialog
     * that is wide by design reads as a page on a phone instead of a card
     * floating in a margin.
     */
    fullscreen = false,
    children,
    footer,
    icon,
    onclose = () => {},
    class: className = ''
  } = $props();

  let dialogEl = $state(null);

  // Two class names, not one flag: the mobile variant has to be scoped by a
  // media query, and a query cannot be OR'd with a plain selector on the same
  // rule — so they stay separate rather than being merged into one class the
  // stylesheet then has to un-apply.
  const fullscreenClass = $derived(
    fullscreen === true
      ? 'modal-fullscreen'
      : fullscreen === 'mobile'
        ? 'modal-fullscreen-mobile'
        : ''
  );
  const titleId = `modal-title-${crypto.randomUUID()}`;

  // Variant styles for the icon container
  const iconVariants = {
    default: { bg: 'var(--color-base02)', color: 'var(--color-base05)' },
    danger: { bg: 'color-mix(in srgb, var(--color-base08) 10%, transparent)', color: 'var(--color-base08)' },
    warning: { bg: 'color-mix(in srgb, var(--color-base0A) 10%, transparent)', color: 'var(--color-base0A)' },
    success: { bg: 'color-mix(in srgb, var(--color-base0B) 10%, transparent)', color: 'var(--color-base0B)' },
    info: { bg: 'color-mix(in srgb, var(--color-base0D) 10%, transparent)', color: 'var(--color-base0D)' }
  };

  const iconStyle = $derived(iconVariants[variant] || iconVariants.default);

  // Sync open state with native dialog
  $effect(() => {
    if (!dialogEl) return;

    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  });

  // Handle native close event (ESC key, form[method=dialog], etc.)
  function handleClose() {
    open = false;
    onclose();
  }

  // Handle cancel event (ESC key) - can be prevented
  function handleCancel(e) {
    if (!closeOnEscape) {
      e.preventDefault();
    }
  }

  // Handle backdrop click (click on dialog element itself, not content)
  function handleBackdropClick(e) {
    if (closeOnBackdrop && e.target === dialogEl) {
      dialogEl.close();
    }
  }

  function close() {
    if (dialogEl?.open) {
      dialogEl.close();
    }
  }
</script>

<dialog
  bind:this={dialogEl}
  class="modal modal-{size} {fill ? 'modal-fill' : ''} {fullscreenClass} {className}"
  aria-labelledby={title ? titleId : undefined}
  aria-modal="true"
  onclose={handleClose}
  oncancel={handleCancel}
  onclick={handleBackdropClick}
>
  <!-- Close button -->
  {#if showClose}
    <button
      class="modal-close"
      onclick={close}
      aria-label="Close modal"
      type="button"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  {/if}

  <!-- Content -->
  <div class="modal-content">
    {#if icon || title}
      <div class="modal-header">
        {#if icon}
          <div class="modal-icon" style="background: {iconStyle.bg}; color: {iconStyle.color};">
            {@render icon()}
          </div>
        {/if}

        {#if title || children}
          <div class="modal-text">
            {#if title}
              <h3 id={titleId} class="modal-title">{title}</h3>
            {/if}
            {#if children}
              <div class="modal-body">
                {@render children()}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {:else if children}
      <div class="modal-body">
        {@render children()}
      </div>
    {/if}

    {#if footer}
      <div class="modal-footer">
        {@render footer()}
      </div>
    {/if}
  </div>
</dialog>

<style>
  /* Native dialog element - automatically in top-layer */
  dialog.modal {
    position: fixed;
    border-radius: var(--radius-default);
    background: var(--color-base01);
    box-shadow: var(--shadow-2xl);
    border: var(--border-width-default) solid var(--color-base03);
    padding: 0;
    margin: auto;
    max-height: calc(100vh - 2rem);
    max-height: calc(100dvh - 2rem);
    overflow: auto;
  }

  /* Size variants */
  dialog.modal-sm { width: 100%; max-width: 20rem; }
  dialog.modal-md { width: 100%; max-width: 28rem; }
  dialog.modal-lg { width: 100%; max-width: 36rem; }
  dialog.modal-xl { width: 100%; max-width: 48rem; }
  dialog.modal-xxl { width: 100%; max-width: 56rem; }
  dialog.modal-full {
    width: calc(100vw - 2rem);
    width: calc(100dvw - 2rem);
    max-width: calc(100vw - 2rem);
    max-width: calc(100dvw - 2rem);
  }

  /*
   * Fullscreen — the dialog fills the viewport and drops its frame. It stays a
   * modal, on the same top layer with the same focus trap and close button; it
   * just stops reading as a card floating in a margin.
   *
   * `inset: 0` with `width/height: auto` rather than `100dvw/100dvh`: this is
   * fixed-positioned, and its containing block already excludes the scrollbar,
   * whereas `100dvw` includes it and would hang the dialog over the document
   * scrollbar wherever one is showing.
   *
   * `overflow: hidden` on the dialog with the scrolling moved to `.modal-content`
   * is the point of the whole thing. The close button is an absolutely
   * positioned *sibling* of the content, so if the dialog itself scrolled, the X
   * would ride off the top and a full-height modal would have no visible way out.
   *
   * The declarations are written twice deliberately. The mobile variant has to
   * be applied *under* a media query rather than un-applied outside one: it
   * shares its specificity with `.modal-{size}`, so a reset could not restore
   * the max-width the size class asked for. Keep the two blocks identical.
   */
  dialog.modal-fullscreen {
    inset: 0;
    width: auto;
    max-width: none;
    height: auto;
    max-height: none;
    margin: 0;
    border: none;
    border-radius: 0;
    overflow: hidden;
  }
  dialog.modal-fullscreen .modal-content {
    height: 100%;
    overflow: auto;
    /* Clear the home indicator on a phone; zero where there isn't one. */
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 767px) {
    dialog.modal-fullscreen-mobile {
      inset: 0;
      width: auto;
      max-width: none;
      height: auto;
      max-height: none;
      margin: 0;
      border: none;
      border-radius: 0;
      overflow: hidden;
    }
    dialog.modal-fullscreen-mobile .modal-content {
      height: 100%;
      overflow: auto;
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    }
  }

  /*
   * Fill mode — stable height frame.
   * Dialog anchors to a fixed height so content changes (empty states,
   * filtered results) don't cause the modal to collapse or jump.
   * Uses dvh with vh fallback for mobile address bar stability.
   * Internally: flex column → header/footer pinned, body stretches + scrolls.
   */
  /* The frame is keyed to "is displayed", not to [open].
   *
   * `close()` drops the open attribute in the tick it is called, while
   * `display` stays flex for the whole exit — the allow-discrete transition
   * below defers the change to `none` until the end. Gating the height on
   * [open] therefore collapsed the dialog to its content on the first frame of
   * the exit, and the still-painting modal grew and re-centred on its way out:
   * measured 1177px → 1439px in a single frame on a 1471px viewport
   * (2026-09-21). Nothing else was ever gated — the .modal-body and
   * .modal-header flex rules below already apply whenever .modal-fill is
   * present, so the frame must be present for exactly as long as they are. */
  dialog.modal-fill {
    height: min(80vh, calc(100vh - 2rem));
    height: min(80dvh, calc(100dvh - 2rem));
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Still what hides a closed fill modal: takes over from the `display: flex`
     above until `open` is set, and from `display` it transitions. */
  dialog.modal-fill:not([open]) {
    display: none;
  }

  /* Fullscreen wins over fill: the 80dvh frame is for a framed dialog. Same
     specificity as the fullscreen rules above plus one class, so it holds
     whatever order they come in; `height: auto` with `inset: 0` fills the
     viewport. Without it `fill` + `fullscreen="mobile"` was a 681px dialog on
     an 851px phone with the page showing beneath (QA 2026-10-06), and
     `fill` + `fullscreen` 720px on a 900px desktop. */
  dialog.modal-fill.modal-fullscreen {
    height: auto;
  }

  @media (max-width: 767px) {
    dialog.modal-fill.modal-fullscreen-mobile {
      height: auto;
    }
  }

  dialog.modal-fill > .modal-content {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* When title+icon are present: header is a row (icon | text).
     Make it stretch in the column, and make text a column so body fills. */
  dialog.modal-fill .modal-header {
    flex: 1 1 0%;
    min-height: 0;
    align-items: stretch;
  }

  dialog.modal-fill .modal-text {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding-top: 0;
  }

  dialog.modal-fill .modal-title {
    flex-shrink: 0;
  }

  dialog.modal-fill .modal-body {
    flex: 1 1 0%;
    min-height: 0;
    overflow: auto;
  }

  dialog.modal-fill .modal-footer {
    flex-shrink: 0;
  }

  /* Native backdrop - automatically handled by browser */
  dialog.modal::backdrop {
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
    backdrop-filter: blur(4px);
  }

  /* Entry/exit animations using @starting-style */
  dialog.modal[open] {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  @starting-style {
    dialog.modal[open] {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
  }

  dialog.modal[open]::backdrop {
    opacity: 1;
  }

  @starting-style {
    dialog.modal[open]::backdrop {
      opacity: 0;
    }
  }

  /* Transitions for smooth open/close */
  dialog.modal {
    transition:
      opacity var(--duration-base) ease-out,
      transform var(--duration-base) ease-out,
      overlay var(--duration-base) ease-out allow-discrete,
      display var(--duration-base) ease-out allow-discrete;
  }

  dialog.modal::backdrop {
    transition:
      opacity var(--duration-base) ease-out,
      overlay var(--duration-base) ease-out allow-discrete,
      display var(--duration-base) ease-out allow-discrete;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    color: var(--color-base05);
    cursor: pointer;
    transition: background var(--duration-fast), color var(--duration-fast);
    z-index: 1;
  }

  .modal-close:hover {
    background: var(--color-base02);
    color: var(--color-base07);
  }

  /* A 40px tap target where the dialog is a phone's whole screen (the 20px
     icon in 4px padding was 28px — under the 40px every other control on a
     phone gets). */
  @media (max-width: 767px) {
    .modal-close {
      display: grid;
      place-items: center;
      min-width: 2.5rem;
      min-height: 2.5rem;
    }

    /* A long title wraps before the larger button instead of running under it. */
    .modal-title {
      padding-right: 2.5rem;
    }
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .modal-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-default);
  }

  .modal-text {
    flex: 1;
    /* A flex item defaults to min-width:auto, so wide children (two-column
       NumberInput rows, tables) would push past the dialog instead of
       shrinking into it. */
    min-width: 0;
    padding-top: 0.25rem;
  }

  .modal-title {
    margin: 0 0 0.5rem 0;
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base07);
    line-height: 1.4;
  }

  .modal-body {
    font-size: var(--text-sm);
    color: var(--color-base05);
    line-height: 1.5;
  }

  .modal-footer {
    display: flex;
    flex-wrap: wrap; /* more actions than fit a small dialog wrap; they never clip */
    gap: 0.75rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }
</style>
