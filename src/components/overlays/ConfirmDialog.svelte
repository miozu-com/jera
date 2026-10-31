<!-- file-size: justified -- one dialog: the question, the type-to-confirm gate and the async states share one open/close lifecycle and one set of styles -->
<!--
  @component ConfirmDialog

  The one confirmation dialog: a question, a consequence, two buttons.
  Uses the native <dialog> element for top-layer rendering (no z-index needed).

  Destructive, irreversible actions (delete or archive a workspace, remove a
  member, delete an account) pass `typeToConfirm`: an input renders under the
  message with "Type <phrase> to confirm." and the confirm button stays
  disabled until the typed text matches the phrase (trimmed, case-insensitive).
  The input is cleared every time the dialog opens; Enter in it confirms once
  it matches. Ordinary confirmations leave it unset.

  Async flows: pass `closeOnConfirm={false}` and drive `loading` / `error`.
  While `loading`, both buttons are disabled, the confirm button shows a
  spinner, and Escape / backdrop / close do nothing; the consumer closes the
  dialog by setting `open = false` when the work succeeds.

  Note: a close, however it happens, calls `oncancel` (a confirm that closes
  the dialog included). Consumers rely on it to clear their target.

  @example Ordinary confirmation
  <ConfirmDialog
    bind:open={showLeave}
    title="Leave workspace?"
    message="You lose access right away. The owner can invite you again."
    variant="warning"
    confirmText="Leave"
    onconfirm={leave}
  />

  @example Type to confirm, async
  <ConfirmDialog
    bind:open={archiveOpen}
    title="Archive workspace?"
    typeToConfirm={workspace.name}
    confirmText="Archive workspace"
    closeOnConfirm={false}
    loading={archiving}
    error={archiveError}
    onconfirm={archive}
  >
    <p>Archiving hides it from everyone. Support can restore it.</p>
  </ConfirmDialog>

  A third, non-destructive way out (e.g. "Archive instead" beside Delete) is
  `altText` + `onalt`; it never needs the typed phrase and follows
  `closeOnConfirm` like the confirm button.

  @example With custom icon
  <ConfirmDialog bind:open={show} title="Confirm">
    {#snippet icon()}
      <CustomIcon size={24} />
    {/snippet}
  </ConfirmDialog>
-->
<script>
  import Button from '../primitives/Button.svelte';
  import Input from '../forms/Input.svelte';

  let {
    open = $bindable(false),
    title = 'Confirm',
    message = 'Do you want to continue?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    /** The exact phrase the user must type before the confirm button enables. */
    typeToConfirm = '',
    /** Accessible name of the type-to-confirm input. */
    typeLabel = 'Confirmation text',
    /** Work in flight: buttons disabled, spinner on confirm, no dismissal. */
    loading = false,
    /** Inline error shown under the body (role="alert"). */
    error = '',
    /** Close after onconfirm (default). Set false for async flows. */
    closeOnConfirm = true,
    /** 'sm' (28rem, default) | 'md' (34rem) */
    size = 'sm',
    /** Optional third, non-destructive way out (e.g. "Archive instead"). Needs `onalt`. */
    altText = '',
    onalt,
    class: className = '',
    icon,
    children,
    onconfirm,
    oncancel
  } = $props();

  let dialogEl = $state(null);
  let typed = $state('');

  // Unique ids so multiple ConfirmDialogs mounted at once don't collide
  // (duplicate ids break aria-labelledby/aria-describedby). Mirrors Modal.svelte.
  const uid = crypto.randomUUID();
  const titleId = `confirm-title-${uid}`;
  const messageId = `confirm-message-${uid}`;
  const typeId = `confirm-type-${uid}`;
  const typeHelpId = `confirm-type-help-${uid}`;

  const phrase = $derived(String(typeToConfirm ?? '').trim());
  const matches = $derived(!phrase || typed.trim().toLowerCase() === phrase.toLowerCase());
  const canConfirm = $derived(matches && !loading);

  const variantConfig = $derived({
    danger: {
      iconColor: 'var(--color-base08)',
      iconBg: 'color-mix(in srgb, var(--color-base08) 10%, transparent)',
      buttonVariant: 'danger'
    },
    warning: {
      iconColor: 'var(--color-base0A)',
      iconBg: 'color-mix(in srgb, var(--color-base0A) 10%, transparent)',
      buttonVariant: 'primary'
    },
    success: {
      iconColor: 'var(--color-base0B)',
      iconBg: 'color-mix(in srgb, var(--color-base0B) 10%, transparent)',
      buttonVariant: 'success'
    },
    info: {
      iconColor: 'var(--color-base0D)',
      iconBg: 'color-mix(in srgb, var(--color-base0D) 10%, transparent)',
      buttonVariant: 'primary'
    }
  }[variant] || {
    iconColor: 'var(--color-base0D)',
    iconBg: 'color-mix(in srgb, var(--color-base0D) 10%, transparent)',
    buttonVariant: 'primary'
  });

  // Sync open state with native dialog; a fresh open starts with an empty
  // type-to-confirm input.
  $effect(() => {
    if (!dialogEl) return;

    if (open && !dialogEl.open) {
      typed = '';
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  });

  function handleClose() {
    open = false;
    oncancel?.();
  }

  function requestClose() {
    if (loading) return;
    handleClose();
  }

  function handleCancel(e) {
    // ESC closes, except while work is in flight.
    if (loading) e.preventDefault();
  }

  function handleBackdropClick(e) {
    if (e.target === dialogEl) {
      requestClose();
    }
  }

  function handleConfirm() {
    if (!canConfirm) return;
    onconfirm?.();
    if (closeOnConfirm) open = false;
  }

  function handleAlt() {
    if (loading) return;
    onalt?.();
    if (closeOnConfirm) open = false;
  }

  function handleTypeKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  }
</script>

<dialog
  bind:this={dialogEl}
  class="confirm-dialog confirm-dialog--{size} {className}"
  aria-labelledby={titleId}
  aria-describedby={messageId}
  aria-modal="true"
  onclose={handleClose}
  oncancel={handleCancel}
  onclick={handleBackdropClick}
>
  <button
    type="button"
    class="confirm-close"
    onclick={requestClose}
    disabled={loading}
    aria-label="Close"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>

  <div class="confirm-content">
    <div class="confirm-header">
      <div
        class="confirm-icon"
        style="background: {variantConfig.iconBg}; color: {variantConfig.iconColor};"
      >
        {#if icon}
          {@render icon()}
        {:else if variant === 'danger'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        {:else if variant === 'warning'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        {:else if variant === 'success'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        {:else}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        {/if}
      </div>

      <div class="confirm-text">
        <h3 id={titleId} class="confirm-title">{title}</h3>
        {#if children}
          <div id={messageId} class="confirm-message">{@render children()}</div>
        {:else}
          <p id={messageId} class="confirm-message">{message}</p>
        {/if}
      </div>
    </div>

    {#if phrase}
      <div class="confirm-type">
        <p id={typeHelpId} class="confirm-type-help">
          Type <code>{phrase}</code> below to confirm.
        </p>
        <Input
          id={typeId}
          bind:value={typed}
          placeholder={phrase}
          aria-label={typeLabel}
          aria-describedby={typeHelpId}
          autocomplete="off"
          disabled={loading}
          onkeydown={handleTypeKeydown}
        />
      </div>
    {/if}

    {#if error}
      <p class="confirm-error" role="alert">{error}</p>
    {/if}

    <div class="confirm-actions">
      <Button variant="ghost" size="sm" onclick={requestClose} disabled={loading}>
        {cancelText}
      </Button>
      {#if altText && onalt}
        <Button variant="secondary" size="sm" onclick={handleAlt} disabled={loading}>
          {altText}
        </Button>
      {/if}
      <Button
        variant={variantConfig.buttonVariant}
        size="sm"
        onclick={handleConfirm}
        disabled={!matches}
        {loading}
      >
        {confirmText}
      </Button>
    </div>
  </div>
</dialog>

<style>
  /* Native dialog element - automatically in top-layer, no z-index needed */
  dialog.confirm-dialog {
    position: fixed;
    border: none;
    border-radius: var(--radius-default);
    background: var(--color-base01);
    border: var(--border-width-default) solid var(--color-base02);
    box-shadow: var(--shadow-2xl);
    padding: 0;
    margin: auto;
    width: 100%;
    max-width: 28rem;
  }

  dialog.confirm-dialog--md {
    max-width: 34rem;
  }

  dialog.confirm-dialog::backdrop {
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
    backdrop-filter: blur(8px);
  }

  /* Entry animation using @starting-style */
  dialog.confirm-dialog[open] {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  @starting-style {
    dialog.confirm-dialog[open] {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
  }

  dialog.confirm-dialog[open]::backdrop {
    opacity: 1;
  }

  @starting-style {
    dialog.confirm-dialog[open]::backdrop {
      opacity: 0;
    }
  }

  dialog.confirm-dialog {
    transition:
      opacity var(--duration-base) ease-out,
      transform var(--duration-base) ease-out,
      overlay var(--duration-base) ease-out allow-discrete,
      display var(--duration-base) ease-out allow-discrete;
  }

  dialog.confirm-dialog::backdrop {
    transition:
      opacity var(--duration-base) ease-out,
      overlay var(--duration-base) ease-out allow-discrete,
      display var(--duration-base) ease-out allow-discrete;
  }

  .confirm-close {
    position: absolute;
    top: var(--space-8);
    right: var(--space-8);
    padding: var(--space-2);
    background: transparent;
    border: none;
    border-radius: var(--radius-lg);
    color: var(--color-base04);
    cursor: pointer;
    transition: background var(--duration-fast) ease, color var(--duration-fast) ease;
    z-index: 1;
  }

  .confirm-close:hover {
    background: var(--color-base02);
    color: var(--color-base05);
  }

  .confirm-content {
    padding: var(--space-12);
  }

  .confirm-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-8);
  }

  .confirm-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-default);
  }

  .confirm-text {
    flex: 1;
    padding-top: var(--space-2);
  }

  .confirm-title {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base07);
  }

  .confirm-message {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-base04);
    line-height: 1.5;
  }

  .confirm-message :global(p) {
    margin: 0 0 var(--space-4);
  }

  .confirm-message :global(p:last-child) {
    margin-bottom: 0;
  }

  .confirm-type {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-10);
  }

  .confirm-type-help {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .confirm-type-help code {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-default);
    background: var(--color-base02);
    color: var(--color-base06);
    font-size: var(--text-xs);
    overflow-wrap: anywhere;
  }

  .confirm-error {
    margin: var(--space-4) 0 0;
    font-size: var(--text-xs);
    color: var(--color-base08);
  }

  .confirm-close:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .confirm-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    justify-content: flex-end;
    margin-top: var(--space-12);
  }
</style>
