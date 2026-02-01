<!--
  @component Toast

  A toast notification system using native popover for top-layer rendering.
  Provides stacking, auto-dismiss, and animations without z-index conflicts.

  @example
  // In your root layout
  <script>
    import { Toast, createToastContext } from '@miozu/jera';
    const toast = createToastContext();
  </script>
  <Toast />

  // In any component
  import { getToastContext } from '@miozu/jera';
  const toast = getToastContext();
  toast.success('Saved successfully!');
-->
<script module>
  import { getContext, setContext } from 'svelte';

  const TOAST_KEY = Symbol('jera-toast');

  /**
   * Toast Controller Class
   */
  export class ToastController {
    toasts = $state.raw([]);
    position = $state('bottom-right');
    defaultDuration = 4000;
    maxToasts = 5;
    #counter = 0;

    show(options) {
      const id = `toast-${++this.#counter}`;
      const toast = {
        id,
        type: options.type ?? 'info',
        title: options.title,
        message: options.message,
        duration: options.duration ?? this.defaultDuration,
        createdAt: Date.now()
      };
      this.toasts = [toast, ...this.toasts].slice(0, this.maxToasts);
      return id;
    }

    dismiss(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }

    dismissAll() {
      this.toasts = [];
    }

    pause(id) {
      this.toasts = this.toasts.map(t =>
        t.id === id ? { ...t, pausedAt: Date.now() } : t
      );
    }

    resume(id) {
      this.toasts = this.toasts.map(t => {
        if (t.id !== id || !t.pausedAt) return t;
        const pausedDuration = Date.now() - t.pausedAt;
        return { ...t, createdAt: t.createdAt + pausedDuration, pausedAt: undefined };
      });
    }

    info = (message, options = {}) => this.show({ ...options, message, type: 'info' });
    success = (message, options = {}) => this.show({ ...options, message, type: 'success' });
    warning = (message, options = {}) => this.show({ ...options, message, type: 'warning' });
    error = (message, options = {}) => this.show({ ...options, message, type: 'error' });
  }

  export function createToastContext() {
    const controller = new ToastController();
    setContext(TOAST_KEY, controller);
    return controller;
  }

  export function getToastContext() {
    return getContext(TOAST_KEY);
  }
</script>

<script>
  import { cn } from '../../utils/cn.svelte.js';

  const toast = getToastContext();

  let containerEl = $state(null);

  const icons = {
    info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,
    success: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
    warning: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
    error: `<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>`
  };

  const positionClass = $derived({
    'top-left': 'toast-top-left',
    'top-center': 'toast-top-center',
    'top-right': 'toast-top-right',
    'bottom-left': 'toast-bottom-left',
    'bottom-center': 'toast-bottom-center',
    'bottom-right': 'toast-bottom-right'
  }[toast.position]);

  // Show/hide popover based on toast count
  $effect(() => {
    if (!containerEl) return;

    if (toast.toasts.length > 0 && !containerEl.matches(':popover-open')) {
      containerEl.showPopover();
    } else if (toast.toasts.length === 0 && containerEl.matches(':popover-open')) {
      containerEl.hidePopover();
    }
  });
</script>

<!--
  Using popover="manual" for:
  - Automatic top-layer placement (no z-index wars)
  - No portal action needed
  - Native browser rendering optimization
-->
<div
  bind:this={containerEl}
  popover="manual"
  class={cn('toast-container', positionClass)}
  role="region"
  aria-label="Notifications"
>
  {#each toast.toasts as item (item.id)}
    {@const remaining = item.duration - (Date.now() - item.createdAt)}
    <div
      class={cn('toast-item', `toast-${item.type}`)}
      role="alert"
      aria-live="polite"
      onmouseenter={() => toast.pause(item.id)}
      onmouseleave={() => toast.resume(item.id)}
    >
      <span class="toast-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {@html icons[item.type]}
        </svg>
      </span>
      <div class="toast-content">
        {#if item.title}
          <p class="toast-title">{item.title}</p>
        {/if}
        <p class={cn('toast-message', item.title && 'has-title')}>{item.message}</p>
      </div>
      <button type="button" class="toast-close" onclick={() => toast.dismiss(item.id)} aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
      {#if item.duration > 0 && !item.pausedAt}
        {@const _ = setTimeout(() => toast.dismiss(item.id), remaining)}
      {/if}
    </div>
  {/each}
</div>

<style>
  /* Popover container - in top-layer, no z-index needed */
  .toast-container {
    position: fixed;
    display: flex;
    gap: 0.5rem;
    pointer-events: none;
    /* Reset popover defaults */
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    overflow: visible;
    /* Remove default popover positioning */
    inset: unset;
  }

  /* Position variants */
  .toast-top-left { top: 1rem; left: 1rem; flex-direction: column; }
  .toast-top-center { top: 1rem; left: 50%; transform: translateX(-50%); flex-direction: column; }
  .toast-top-right { top: 1rem; right: 1rem; flex-direction: column; }
  .toast-bottom-left { bottom: 1rem; left: 1rem; flex-direction: column-reverse; }
  .toast-bottom-center { bottom: 1rem; left: 50%; transform: translateX(-50%); flex-direction: column-reverse; }
  .toast-bottom-right { bottom: 1rem; right: 1rem; flex-direction: column-reverse; }

  .toast-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
    max-width: 24rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3);
    pointer-events: auto;
    animation: toast-in 200ms ease-out;
  }

  .toast-info {
    background-color: var(--color-base01);
    border-color: var(--color-base03);
    color: var(--color-base05);
  }

  .toast-success {
    background-color: color-mix(in srgb, var(--color-base0B) 10%, var(--color-base00));
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
    color: var(--color-base0B);
  }

  .toast-warning {
    background-color: color-mix(in srgb, var(--color-base0A) 10%, var(--color-base00));
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
    color: var(--color-base0A);
  }

  .toast-error {
    background-color: color-mix(in srgb, var(--color-base08) 10%, var(--color-base00));
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
    color: var(--color-base08);
  }

  .toast-icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
  }

  .toast-icon svg {
    width: 100%;
    height: 100%;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: 500;
    font-size: 0.875rem;
    margin: 0;
  }

  .toast-message {
    font-size: 0.875rem;
    margin: 0;
  }

  .toast-message.has-title {
    margin-top: 0.25rem;
    opacity: 0.9;
  }

  .toast-close {
    flex-shrink: 0;
    padding: 0.25rem;
    border-radius: 0.375rem;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 150ms;
  }

  .toast-close:hover {
    opacity: 1;
  }

  .toast-close svg {
    width: 1rem;
    height: 1rem;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
