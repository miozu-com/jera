<!--
  @component Modal

  A flexible modal dialog component with backdrop, focus trap, and escape key support.

  @example
  <Modal bind:open={showModal} title="Confirm Action">
    <p>Are you sure you want to proceed?</p>
    {#snippet footer()}
      <Button variant="ghost" onclick={() => showModal = false}>Cancel</Button>
      <Button variant="primary" onclick={handleConfirm}>Confirm</Button>
    {/snippet}
  </Modal>
-->
<script>
  import { focusTrap, escapeKey, portal } from '../../actions/index.js';
  import { cv } from '../../utils/cn.svelte.js';

  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    variant = 'default',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showClose = true,
    children,
    footer,
    icon,
    onclose = () => {},
    class: className = ''
  } = $props();

  // Variant styles for the icon container
  const iconVariants = {
    default: { bg: 'var(--color-base02)', color: 'var(--color-base05)' },
    danger: { bg: 'color-mix(in srgb, var(--color-base08) 10%, transparent)', color: 'var(--color-base08)' },
    warning: { bg: 'color-mix(in srgb, var(--color-base0A) 10%, transparent)', color: 'var(--color-base0A)' },
    success: { bg: 'color-mix(in srgb, var(--color-base0B) 10%, transparent)', color: 'var(--color-base0B)' },
    info: { bg: 'color-mix(in srgb, var(--color-base0D) 10%, transparent)', color: 'var(--color-base0D)' }
  };

  const iconStyle = $derived(iconVariants[variant] || iconVariants.default);

  function close() {
    open = false;
    onclose();
  }

  function handleBackdropClick(e) {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      close();
    }
  }

  function handleEscape() {
    if (closeOnEscape) {
      close();
    }
  }
</script>

{#if open}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    use:portal={'body'}
    use:focusTrap={{ enabled: open }}
    use:escapeKey={handleEscape}
  >
    <div class="modal modal-{size} {className}">
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
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
    backdrop-filter: blur(4px);
  }

  .modal {
    position: relative;
    background: var(--color-base01);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-2xl);
    border: 1px solid var(--color-base03);
    margin: 1rem;
    animation: modal-enter 0.2s ease-out;
  }

  /* Size variants */
  .modal-sm { width: 100%; max-width: 20rem; }
  .modal-md { width: 100%; max-width: 28rem; }
  .modal-lg { width: 100%; max-width: 36rem; }
  .modal-xl { width: 100%; max-width: 48rem; }
  .modal-full { width: 100%; max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem); }

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
    border-radius: 0.5rem;
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

  @keyframes modal-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
