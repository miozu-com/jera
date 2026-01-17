<!--
  @component Toast

  A toast notification system with stacking, auto-dismiss, and animations.
  Demonstrates advanced Svelte 5 patterns:

  - Reactive class with ThemeState pattern
  - $state.raw for non-proxied arrays (performance)
  - $effect with cleanup for timers
  - Context API for global toast access
  - Portal action for DOM placement
  - Compound variant styling

  @example
  // In your root layout
  <ToastProvider>
    <slot />
  </ToastProvider>

  // In any component
  import { toast } from '@miozu/jera';
  toast.success('Saved successfully!');
  toast.error('Something went wrong');
  toast.info('Did you know?');
  toast.custom({ title: 'Custom', message: 'With title', duration: 5000 });
-->
<script module>
  import { getContext, setContext } from 'svelte';
  import { cv } from '../../utils/cn.svelte.js';

  const TOAST_KEY = Symbol('jera-toast');

  /**
   * @typedef {'info' | 'success' | 'warning' | 'error'} ToastType
   * @typedef {'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'} ToastPosition
   *
   * @typedef {{
   *   id: string,
   *   type: ToastType,
   *   title?: string,
   *   message: string,
   *   duration: number,
   *   createdAt: number,
   *   pausedAt?: number
   * }} ToastItem
   */

  /**
   * Toast Controller Class
   *
   * Manages toast state and provides methods for showing toasts.
   * Uses Svelte 5 reactive class pattern.
   */
  export class ToastController {
    /** @type {ToastItem[]} */
    toasts = $state.raw([]);

    /** @type {ToastPosition} */
    position = $state('bottom-right');

    /** @type {number} */
    defaultDuration = 4000;

    /** @type {number} */
    maxToasts = 5;

    #counter = 0;

    /**
     * Show a toast
     * @param {Partial<ToastItem> & { message: string }} options
     * @returns {string} Toast ID
     */
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

      // Add to beginning (newest first for top positions)
      this.toasts = [toast, ...this.toasts].slice(0, this.maxToasts);

      return id;
    }

    /**
     * Dismiss a toast by ID
     * @param {string} id
     */
    dismiss(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
      this.toasts = [];
    }

    /**
     * Pause a toast's auto-dismiss timer
     * @param {string} id
     */
    pause(id) {
      this.toasts = this.toasts.map(t =>
        t.id === id ? { ...t, pausedAt: Date.now() } : t
      );
    }

    /**
     * Resume a toast's auto-dismiss timer
     * @param {string} id
     */
    resume(id) {
      this.toasts = this.toasts.map(t => {
        if (t.id !== id || !t.pausedAt) return t;
        const pausedDuration = Date.now() - t.pausedAt;
        return {
          ...t,
          createdAt: t.createdAt + pausedDuration,
          pausedAt: undefined
        };
      });
    }

    // Convenience methods
    info = (message, options = {}) => this.show({ ...options, message, type: 'info' });
    success = (message, options = {}) => this.show({ ...options, message, type: 'success' });
    warning = (message, options = {}) => this.show({ ...options, message, type: 'warning' });
    error = (message, options = {}) => this.show({ ...options, message, type: 'error' });
  }

  /**
   * Create toast context (call in ToastProvider)
   */
  export function createToastContext() {
    const controller = new ToastController();
    setContext(TOAST_KEY, controller);
    return controller;
  }

  /**
   * Get toast controller from context
   * @returns {ToastController}
   */
  export function getToastContext() {
    return getContext(TOAST_KEY);
  }

  // Toast styles
  export const toastStyles = cv({
    base: [
      'relative flex items-start gap-3 w-full max-w-sm',
      'p-4 rounded-lg shadow-lg',
      'border',
      'animate-in fade-in slide-in-from-right-4 duration-200'
    ].join(' '),

    variants: {
      type: {
        info: 'bg-surface border-border text-text',
        success: 'bg-success/10 border-success/30 text-success',
        warning: 'bg-warning/10 border-warning/30 text-warning',
        error: 'bg-error/10 border-error/30 text-error'
      }
    },

    defaults: { type: 'info' }
  });

  export const positionStyles = {
    'top-left': 'top-4 left-4 flex-col',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col',
    'top-right': 'top-4 right-4 flex-col',
    'bottom-left': 'bottom-4 left-4 flex-col-reverse',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse',
    'bottom-right': 'bottom-4 right-4 flex-col-reverse'
  };
</script>

<script>
  import { cn } from '../../utils/cn.svelte.js';
  import { portal } from '../../actions/index.js';

  // Get toast controller from context
  const toast = getToastContext();

  // Icon components for each type
  const icons = {
    info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,
    success: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
    warning: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
    error: `<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>`
  };
</script>

{#if toast.toasts.length > 0}
  <div
    use:portal
    class={cn(
      'fixed z-[var(--z-toast)] flex gap-2 pointer-events-none',
      positionStyles[toast.position]
    )}
    role="region"
    aria-label="Notifications"
  >
    {#each toast.toasts as item (item.id)}
      {@const remaining = item.duration - (Date.now() - item.createdAt)}

      <div
        class={cn(toastStyles({ type: item.type }), 'pointer-events-auto')}
        role="alert"
        aria-live="polite"
        onmouseenter={() => toast.pause(item.id)}
        onmouseleave={() => toast.resume(item.id)}
      >
        <!-- Icon -->
        <span class="shrink-0 w-5 h-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            {@html icons[item.type]}
          </svg>
        </span>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          {#if item.title}
            <p class="font-medium text-sm">{item.title}</p>
          {/if}
          <p class={cn('text-sm', item.title && 'mt-1 opacity-90')}>
            {item.message}
          </p>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          class={cn(
            'shrink-0 p-1 rounded-md',
            'opacity-60 hover:opacity-100',
            'transition-opacity duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-current/50'
          )}
          onclick={() => toast.dismiss(item.id)}
          aria-label="Dismiss notification"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <!-- Auto-dismiss timer -->
        {#if item.duration > 0 && !item.pausedAt}
          {@const _ = setTimeout(() => toast.dismiss(item.id), remaining)}
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-in-from-right-4 {
    from { transform: translateX(1rem); }
    to { transform: translateX(0); }
  }

  .animate-in {
    animation: fade-in 200ms ease-out, slide-in-from-right-4 200ms ease-out;
  }
</style>
