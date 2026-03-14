<!--
  @component Toast

  Enterprise toast notification system with dual progress styles, pause-on-hover,
  smooth Svelte transitions, and native popover for z-index-free top-layer rendering.

  Uses a singleton reactive state (like all Selify reactive classes) so toasts
  can be triggered from any .js file, reactive state class, or Svelte component.

  @example
  // In your root layout — just mount the component
  <script>
    import { Toast } from '@miozu/jera';
  </script>
  <Toast />

  // In any file (component, reactive state, utility)
  import { getToastState } from '@miozu/jera';
  const toast = getToastState();

  toast.success('Saved', 'Your changes were applied');
  toast.error('Failed', 'Network timeout');
  toast.info('Heads up', { duration: 8000 });
  toast.show({
    title: 'Custom',
    message: 'With linear bar',
    type: 'warning',
    progressStyle: 'bar',
    action: { text: 'Undo', onClick: () => undoOp() }
  });
-->
<script module>
  /**
   * ToastController — singleton reactive state for toast notifications.
   *
   * Manages toast lifecycle: show, dismiss, pause, resume.
   * Progress animation is driven by rAF in the <Toast> component, not here.
   */
  export class ToastController {
    toasts = $state.raw([]);
    position = $state('bottom-right');
    progressStyle = 'ring'; // 'ring' | 'bar'
    defaultDuration = 4000;
    defaultErrorDuration = 6000;
    maxToasts = 5;
    #counter = 0;

    show(options) {
      if (typeof options === 'string') options = {title: options};
      const id = `toast-${++this.#counter}`;
      const type = options.type ?? 'info';
      const toast = {
        id,
        type,
        title: options.title,
        message: options.message,
        duration: options.duration ?? (type === 'error' ? this.defaultErrorDuration : this.defaultDuration),
        action: options.action ?? null,
        secondaryAction: options.secondaryAction ?? null,
        progressStyle: options.progressStyle ?? this.progressStyle,
        paused: false,
        pausedAt: undefined,
        startTime: Date.now()
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
        t.id === id ? {...t, paused: true, pausedAt: Date.now()} : t
      );
    }

    resume(id) {
      this.toasts = this.toasts.map(t => {
        if (t.id !== id || !t.paused) return t;
        const pausedDuration = Date.now() - (t.pausedAt || Date.now());
        return {...t, paused: false, pausedAt: undefined, startTime: t.startTime + pausedDuration};
      });
    }

    /**
     * Convenience methods: (title, messageOrOptions?, options?)
     *
     * toast.success('Saved')
     * toast.success('Saved', 'Changes applied')
     * toast.success('Saved', { duration: 5000 })
     * toast.success('Saved', 'Changes applied', { duration: 5000 })
     */
    #shorthand(type, title, msgOrOpts, opts) {
      if (msgOrOpts === undefined) return this.show({title, type});
      if (typeof msgOrOpts === 'string') return this.show({...(opts || {}), title, message: msgOrOpts, type});
      return this.show({...msgOrOpts, title, type});
    }

    info = (title, msgOrOpts, opts) => this.#shorthand('info', title, msgOrOpts, opts);
    success = (title, msgOrOpts, opts) => this.#shorthand('success', title, msgOrOpts, opts);
    warning = (title, msgOrOpts, opts) => this.#shorthand('warning', title, msgOrOpts, opts);
    error = (title, msgOrOpts, opts) => this.#shorthand('error', title, msgOrOpts, opts);
  }

  // Singleton
  let _instance = null;

  /**
   * Get or create the toast state singleton.
   * @param {Object} [config] - Initial configuration (only applied on first call)
   * @returns {ToastController}
   */
  export function getToastState(config) {
    if (!_instance) {
      _instance = new ToastController();
      if (config) {
        if (config.position) _instance.position = config.position;
        if (config.progressStyle) _instance.progressStyle = config.progressStyle;
        if (config.defaultDuration != null) _instance.defaultDuration = config.defaultDuration;
        if (config.defaultErrorDuration != null) _instance.defaultErrorDuration = config.defaultErrorDuration;
        if (config.maxToasts != null) _instance.maxToasts = config.maxToasts;
      }
    }
    return _instance;
  }

  /** Reset singleton (testing) */
  export function resetToastState() {
    if (_instance) _instance.dismissAll();
    _instance = null;
  }

  // Backward compat — context API still works if preferred
  import {getContext, setContext} from 'svelte';
  const TOAST_KEY = Symbol('jera-toast');

  /** @deprecated Use getToastState() singleton instead */
  export function createToastContext(config) {
    const controller = getToastState(config);
    setContext(TOAST_KEY, controller);
    return controller;
  }

  /** @deprecated Use getToastState() singleton instead */
  export function getToastContext() {
    return getContext(TOAST_KEY) ?? getToastState();
  }
</script>

<script>
  import {fly} from 'svelte/transition';

  const toast = getToastState();

  let containerEl = $state(null);

  const circumference = 2 * Math.PI * 8;

  const icons = {
    info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,
    success: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
    warning: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
    error: `<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>`
  };

  const positionClass = $derived(
    {
      'top-left': 'toast-top-left',
      'top-center': 'toast-top-center',
      'top-right': 'toast-top-right',
      'bottom-left': 'toast-bottom-left',
      'bottom-center': 'toast-bottom-center',
      'bottom-right': 'toast-bottom-right'
    }[toast.position]
  );

  // Fly direction based on position
  const flyParams = $derived.by(() => {
    const p = toast.position;
    if (p.includes('left')) return {x: -20, duration: 250};
    if (p.includes('right')) return {x: 20, duration: 250};
    if (p.includes('top')) return {y: -20, duration: 250};
    return {y: 20, duration: 250};
  });

  // Local progress map — rAF drives this, template reads it
  let progressMap = $state.raw(new Map());

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // rAF-driven progress tracking
  $effect(() => {
    const items = toast.toasts;
    if (items.length === 0) {
      progressMap = new Map();
      return;
    }

    // Reduced motion: setTimeout for dismiss, no visual progress
    if (prefersReducedMotion) {
      const timeouts = [];
      for (const item of items) {
        if (item.duration <= 0 || item.paused) continue;
        const elapsed = Date.now() - item.startTime;
        const remaining = item.duration - elapsed;
        if (remaining > 0) {
          const tid = setTimeout(() => toast.dismiss(item.id), remaining);
          timeouts.push(tid);
        } else {
          toast.dismiss(item.id);
        }
      }
      const newMap = new Map();
      for (const item of items) newMap.set(item.id, 0);
      progressMap = newMap;
      return () => {
        for (const tid of timeouts) clearTimeout(tid);
      };
    }

    let frameId;

    const update = () => {
      const now = Date.now();
      const newMap = new Map();
      let hasActive = false;

      for (const item of items) {
        if (item.duration <= 0) continue;
        if (item.paused) {
          // Preserve last known progress while paused
          newMap.set(item.id, progressMap.get(item.id) ?? 0);
          hasActive = true;
          continue;
        }

        const elapsed = now - item.startTime;
        const progress = Math.min((elapsed / item.duration) * 100, 100);
        newMap.set(item.id, progress);

        if (progress >= 100) {
          toast.dismiss(item.id);
        } else {
          hasActive = true;
        }
      }

      progressMap = newMap;

      if (hasActive) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  });

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

<div
  bind:this={containerEl}
  popover="manual"
  class="toast-container {positionClass}"
  role="region"
  aria-label="Notifications"
>
  {#each toast.toasts as item (item.id)}
    {@const progress = progressMap.get(item.id) ?? 0}
    <div
      class="toast-item toast-{item.type}"
      role="alert"
      aria-live="polite"
      in:fly={prefersReducedMotion ? {duration: 0} : flyParams}
      out:fly={prefersReducedMotion ? {duration: 0} : {...flyParams, duration: 150}}
      onmouseenter={() => toast.pause(item.id)}
      onmouseleave={() => toast.resume(item.id)}
    >
      {#if item.progressStyle === 'bar' && item.duration > 0}
        <div
          class="toast-bar"
          style="transform: scaleX({1 - progress / 100})"
          role="progressbar"
          aria-valuenow={Math.round(100 - progress)}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      {/if}

      <span class="toast-icon">
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

      <div class="toast-body">
        {#if item.title}
          <p class="toast-title">{item.title}</p>
        {/if}
        {#if item.message}
          <p class="toast-message" class:has-title={item.title}>{item.message}</p>
        {/if}

        {#if item.action || item.secondaryAction}
          <div class="toast-actions">
            {#if item.secondaryAction}
              <button
                class="toast-action secondary"
                onclick={() => {
                  item.secondaryAction.onClick?.();
                  toast.dismiss(item.id);
                }}
              >
                {item.secondaryAction.text}
              </button>
            {/if}
            {#if item.action}
              <button
                class="toast-action primary"
                onclick={() => {
                  item.action.onClick?.();
                  toast.dismiss(item.id);
                }}
              >
                {item.action.text}
              </button>
            {/if}
          </div>
        {/if}
      </div>

      {#if item.progressStyle === 'ring'}
        <button
          type="button"
          class="progress-btn"
          onclick={() => toast.dismiss(item.id)}
          aria-label="Dismiss"
        >
          <svg class="progress-ring" width="24" height="24" viewBox="0 0 24 24">
            <circle class="progress-ring-bg" cx="12" cy="12" r="8" stroke-width="1" fill="none" />
            {#if item.duration > 0}
              <circle
                class="progress-ring-fill"
                cx="12"
                cy="12"
                r="8"
                stroke-width="2"
                fill="none"
                style="stroke-dasharray: {circumference}; stroke-dashoffset: {circumference -
                  (circumference * progress) / 100}"
              />
            {/if}
            <path
              class="close-x"
              d="M15 9L9 15M9 9l6 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </button>
      {:else}
        <button
          type="button"
          class="dismiss-btn"
          onclick={() => toast.dismiss(item.id)}
          aria-label="Dismiss"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  {/each}
</div>

<style>
  /* ============================================================
     Container — popover top-layer, no z-index needed
     ============================================================ */
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
    inset: unset;
  }

  /* Position variants */
  .toast-top-left {
    top: 1rem;
    left: 1rem;
    flex-direction: column;
  }
  .toast-top-center {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column;
  }
  .toast-top-right {
    top: 1rem;
    right: 1rem;
    flex-direction: column;
  }
  .toast-bottom-left {
    bottom: 1rem;
    left: 1rem;
    flex-direction: column-reverse;
  }
  .toast-bottom-center {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column-reverse;
  }
  .toast-bottom-right {
    bottom: 1rem;
    right: 1rem;
    flex-direction: column-reverse;
  }

  /* ============================================================
     Toast item — shared base
     ============================================================ */
  .toast-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
    min-width: 280px;
    max-width: 24rem;
    padding: 1rem;
    border-radius: var(--radius-xl, 0.75rem);
    border: var(--border-width-default, 1px) solid;
    box-shadow: var(--shadow-lg);
    pointer-events: auto;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  /* ============================================================
     Variant backgrounds + borders
     ============================================================ */
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

  /* ============================================================
     Linear progress bar (progressStyle: 'bar')
     Shrinks from right to left as time passes.
     ============================================================ */
  .toast-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.125rem;
    transform-origin: left;
  }

  .toast-info .toast-bar {
    background-color: var(--color-base0C);
  }
  .toast-success .toast-bar {
    background-color: var(--color-base0B);
  }
  .toast-warning .toast-bar {
    background-color: var(--color-base0A);
  }
  .toast-error .toast-bar {
    background-color: var(--color-base08);
  }

  /* ============================================================
     Icon
     ============================================================ */
  .toast-icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
  }

  .toast-icon svg {
    width: 100%;
    height: 100%;
  }

  /* ============================================================
     Content
     ============================================================ */
  .toast-body {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: 500;
    font-size: 0.875rem;
    margin: 0;
  }

  /* Variant-colored titles */
  .toast-info .toast-title {
    color: var(--color-base0C);
  }
  .toast-success .toast-title {
    color: var(--color-base0B);
  }
  .toast-warning .toast-title {
    color: var(--color-base0A);
  }
  .toast-error .toast-title {
    color: var(--color-base08);
  }

  .toast-message {
    font-size: 0.875rem;
    margin: 0;
    color: var(--color-base05);
  }

  .toast-message.has-title {
    margin-top: 0.25rem;
    opacity: 0.9;
  }

  /* ============================================================
     Action buttons
     ============================================================ */
  .toast-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .toast-action {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border: none;
    border-radius: var(--radius-md, 0.375rem);
    cursor: pointer;
    transition: background var(--duration-fast, 150ms);
  }

  .toast-action.secondary {
    color: var(--color-base04);
    background: transparent;
  }

  .toast-action.secondary:hover {
    background: color-mix(in srgb, var(--color-base04) 10%, transparent);
  }

  /* Variant-colored primary actions */
  .toast-info .toast-action.primary {
    color: var(--color-base0C);
    background: color-mix(in srgb, var(--color-base0C) 10%, transparent);
  }
  .toast-info .toast-action.primary:hover {
    background: color-mix(in srgb, var(--color-base0C) 20%, transparent);
  }

  .toast-success .toast-action.primary {
    color: var(--color-base0B);
    background: color-mix(in srgb, var(--color-base0B) 10%, transparent);
  }
  .toast-success .toast-action.primary:hover {
    background: color-mix(in srgb, var(--color-base0B) 20%, transparent);
  }

  .toast-warning .toast-action.primary {
    color: var(--color-base0A);
    background: color-mix(in srgb, var(--color-base0A) 10%, transparent);
  }
  .toast-warning .toast-action.primary:hover {
    background: color-mix(in srgb, var(--color-base0A) 20%, transparent);
  }

  .toast-error .toast-action.primary {
    color: var(--color-base08);
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
  }
  .toast-error .toast-action.primary:hover {
    background: color-mix(in srgb, var(--color-base08) 20%, transparent);
  }

  /* ============================================================
     Circular progress ring (progressStyle: 'ring')
     ============================================================ */
  .progress-btn {
    flex-shrink: 0;
    cursor: pointer;
    padding: 0;
    background: transparent;
    border: none;
    transition: opacity var(--duration-fast, 150ms);
  }

  .progress-btn:hover {
    opacity: 0.8;
  }

  .progress-ring {
    transform: rotate(-90deg);
  }

  .progress-ring-bg {
    stroke: var(--color-base03);
    fill: none;
  }

  .progress-ring-fill {
    fill: none;
    stroke: currentColor;
    transition: stroke-dashoffset 50ms linear;
  }

  /* Variant-colored rings */
  .toast-info .progress-ring-fill {
    stroke: var(--color-base0C);
  }
  .toast-success .progress-ring-fill {
    stroke: var(--color-base0B);
  }
  .toast-warning .progress-ring-fill {
    stroke: var(--color-base0A);
  }
  .toast-error .progress-ring-fill {
    stroke: var(--color-base08);
  }

  .close-x {
    stroke: var(--color-base04);
    transition: stroke var(--duration-fast, 150ms);
  }

  .progress-btn:hover .close-x {
    stroke: var(--color-base05);
  }

  /* ============================================================
     Dismiss button (progressStyle: 'bar')
     ============================================================ */
  .dismiss-btn {
    flex-shrink: 0;
    padding: 0.25rem;
    border-radius: var(--radius-default, 0.25rem);
    color: var(--color-base04);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      color var(--duration-fast, 150ms),
      background-color var(--duration-fast, 150ms);
  }

  .dismiss-btn:hover {
    color: var(--color-base05);
    background-color: var(--color-base02);
  }

  /* ============================================================
     Responsive
     ============================================================ */
  @media (max-width: 480px) {
    .toast-container {
      left: 0.75rem;
      right: 0.75rem;
      max-width: none;
      transform: none;
    }

    .toast-item {
      max-width: none;
    }
  }
</style>
