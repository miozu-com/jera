<!--
  @component ConfirmDialog

  A confirmation dialog with semantic variants.

  @example Danger confirmation
  <ConfirmDialog
    bind:open={showDelete}
    title="Delete Item"
    message="Are you sure you want to delete this item? This action cannot be undone."
    variant="danger"
    confirmText="Delete"
    onconfirm={handleDelete}
  />

  @example Warning confirmation
  <ConfirmDialog
    bind:open={showWarning}
    title="Unsaved Changes"
    message="You have unsaved changes. Are you sure you want to leave?"
    variant="warning"
    confirmText="Leave"
    cancelText="Stay"
  />

  @example With custom icon
  <ConfirmDialog bind:open={show} title="Confirm">
    {#snippet icon()}
      <CustomIcon size={24} />
    {/snippet}
  </ConfirmDialog>
-->
<script>
  import Button from '../primitives/Button.svelte';
  import { escapeKey } from '../../actions/index.js';

  let {
    open = $bindable(false),
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    class: className = '',
    icon,
    onconfirm,
    oncancel
  } = $props();

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

  function handleConfirm() {
    onconfirm?.();
    open = false;
  }

  function handleCancel() {
    oncancel?.();
    open = false;
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }
</script>

{#if open}
  <div
    class="confirm-backdrop {className}"
    onclick={handleBackdropClick}
    use:escapeKey={handleCancel}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
  >
    <div class="confirm-dialog">
      <button
        type="button"
        class="confirm-close"
        onclick={handleCancel}
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
            <h3 id="confirm-title" class="confirm-title">{title}</h3>
            <p class="confirm-message">{message}</p>
          </div>
        </div>

        <div class="confirm-actions">
          <Button variant="ghost" size="sm" onclick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant={variantConfig.buttonVariant} size="sm" onclick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .confirm-backdrop::before {
    content: '';
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
    backdrop-filter: blur(8px);
  }

  .confirm-dialog {
    position: relative;
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-2xl);
    width: 100%;
    max-width: 28rem;
    margin: var(--space-4);
    animation: dialog-enter 0.2s ease-out;
  }

  @keyframes dialog-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .confirm-close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    padding: var(--space-1);
    background: transparent;
    border: none;
    border-radius: var(--radius-lg);
    color: var(--color-base04);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .confirm-close:hover {
    background: var(--color-base02);
    color: var(--color-base05);
  }

  .confirm-content {
    padding: var(--space-6);
  }

  .confirm-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .confirm-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-lg);
  }

  .confirm-text {
    flex: 1;
    padding-top: var(--space-1);
  }

  .confirm-title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-base07);
  }

  .confirm-message {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-base04);
    line-height: 1.5;
  }

  .confirm-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
    margin-top: var(--space-6);
  }
</style>
