<!--
  @component Modal

  A flexible modal dialog component using native <dialog> element.
  Provides built-in focus trap, ESC handling, backdrop, and accessibility.

  @prop fill — Anchors the dialog to a stable height so content changes
    (empty states, search results) don't cause layout jumps. Uses flex
    column internally: header/footer stay pinned, body stretches and scrolls.

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
    children,
    footer,
    icon,
    onclose = () => {},
    class: className = ''
  } = $props();

  let dialogEl = $state(null);

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
  class="modal modal-{size} {fill ? 'modal-fill' : ''} {className}"
  aria-labelledby={title ? 'modal-title' : undefined}
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
              <h3 id="modal-title" class="modal-title">{title}</h3>
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
    border: none;
    border-radius: var(--radius-default);
    background: var(--color-base01);
    box-shadow: var(--shadow-2xl);
    border: 1px solid var(--color-base03);
    padding: 0;
    margin: auto;
    max-height: calc(100vh - 2rem);
    overflow: auto;
  }

  /* Size variants */
  dialog.modal-sm { width: 100%; max-width: 20rem; }
  dialog.modal-md { width: 100%; max-width: 28rem; }
  dialog.modal-lg { width: 100%; max-width: 36rem; }
  dialog.modal-xl { width: 100%; max-width: 48rem; }
  dialog.modal-full { width: calc(100vw - 2rem); max-width: calc(100vw - 2rem); }

  /*
   * Fill mode — stable height frame.
   * Dialog anchors to a fixed height so content changes (empty states,
   * filtered results) don't cause the modal to collapse or jump.
   * Uses dvh with vh fallback for mobile address bar stability.
   * Internally: flex column → header/footer pinned, body stretches + scrolls.
   */
  dialog.modal-fill {
    height: min(80vh, calc(100vh - 2rem));
    height: min(80dvh, calc(100dvh - 2rem));
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
      opacity 0.2s ease-out,
      transform 0.2s ease-out,
      overlay 0.2s ease-out allow-discrete,
      display 0.2s ease-out allow-discrete;
  }

  dialog.modal::backdrop {
    transition:
      opacity 0.2s ease-out,
      overlay 0.2s ease-out allow-discrete,
      display 0.2s ease-out allow-discrete;
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
    transition: background 0.15s, color 0.15s;
    z-index: 1;
  }

  .modal-close:hover {
    background: var(--color-base02);
    color: var(--color-base07);
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
    padding-top: 0.25rem;
  }

  .modal-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-base07);
    line-height: 1.4;
  }

  .modal-body {
    font-size: 0.875rem;
    color: var(--color-base05);
    line-height: 1.5;
  }

  .modal-footer {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }
</style>
