/**
 * Svelte Actions Library
 *
 * Reusable element behaviors that can be composed onto any element.
 * Actions are the Svelte way to add imperative logic to elements.
 *
 * @example
 * <div use:clickOutside={handleClose}>...</div>
 * <input use:focus />
 * <button use:longPress={{ duration: 500, onLongPress: handler }}>...</button>
 */

/**
 * Click Outside Action
 *
 * Fires callback when clicking outside the element.
 * Useful for dropdowns, modals, popovers.
 *
 * @param {HTMLElement} node
 * @param {() => void} callback
 * @returns {{ destroy: () => void, update: (cb: () => void) => void }}
 *
 * @example
 * <div use:clickOutside={() => isOpen = false}>Dropdown</div>
 */
export function clickOutside(node, callback) {
  let handler = callback;

  function handleClick(event) {
    if (!node.contains(event.target) && !event.defaultPrevented) {
      handler?.();
    }
  }

  // Use mousedown in bubble phase so trigger buttons can stopPropagation
  document.addEventListener('mousedown', handleClick, false);

  return {
    update(newCallback) {
      handler = newCallback;
    },
    destroy() {
      document.removeEventListener('mousedown', handleClick, false);
    }
  };
}

/**
 * Focus Trap Action
 *
 * Traps focus within an element. Essential for accessible modals.
 *
 * @param {HTMLElement} node
 * @param {{ enabled?: boolean, initialFocus?: string }} [options]
 * @returns {{ destroy: () => void, update: (opts: { enabled?: boolean }) => void }}
 *
 * @example
 * <dialog use:focusTrap={{ enabled: isOpen }}>...</dialog>
 */
export function focusTrap(node, options = {}) {
  let { enabled = true, initialFocus } = options;

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function getFocusable() {
    return Array.from(node.querySelectorAll(focusableSelectors));
  }

  function handleKeydown(event) {
    if (!enabled || event.key !== 'Tab') return;

    const focusable = getFocusable();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function setInitialFocus() {
    if (!enabled) return;

    const target = initialFocus
      ? node.querySelector(initialFocus)
      : getFocusable()[0];

    target?.focus();
  }

  node.addEventListener('keydown', handleKeydown);
  // Delay initial focus to allow transitions
  requestAnimationFrame(setInitialFocus);

  return {
    update(newOptions) {
      enabled = newOptions.enabled ?? true;
      initialFocus = newOptions.initialFocus;
      if (enabled) setInitialFocus();
    },
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    }
  };
}

/**
 * Auto-focus Action
 *
 * Focuses element on mount.
 *
 * @param {HTMLElement} node
 * @param {{ delay?: number, select?: boolean }} [options]
 *
 * @example
 * <input use:autoFocus />
 * <input use:autoFocus={{ delay: 100, select: true }} />
 */
export function autoFocus(node, options = {}) {
  const { delay = 0, select = false } = options;

  const timeout = setTimeout(() => {
    node.focus();
    if (select && 'select' in node) {
      node.select();
    }
  }, delay);

  return {
    destroy() {
      clearTimeout(timeout);
    }
  };
}

/**
 * Long Press Action
 *
 * Detects long press/hold gesture.
 *
 * @param {HTMLElement} node
 * @param {{ duration?: number, onLongPress: () => void }} options
 *
 * @example
 * <button use:longPress={{ duration: 500, onLongPress: handleLongPress }}>
 *   Hold me
 * </button>
 */
export function longPress(node, options) {
  let { duration = 500, onLongPress } = options;
  let timeout = null;

  function handleStart() {
    timeout = setTimeout(() => {
      onLongPress?.();
    }, duration);
  }

  function handleEnd() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  node.addEventListener('mousedown', handleStart);
  node.addEventListener('touchstart', handleStart, { passive: true });
  node.addEventListener('mouseup', handleEnd);
  node.addEventListener('mouseleave', handleEnd);
  node.addEventListener('touchend', handleEnd);
  node.addEventListener('touchcancel', handleEnd);

  return {
    update(newOptions) {
      duration = newOptions.duration ?? 500;
      onLongPress = newOptions.onLongPress;
    },
    destroy() {
      handleEnd();
      node.removeEventListener('mousedown', handleStart);
      node.removeEventListener('touchstart', handleStart);
      node.removeEventListener('mouseup', handleEnd);
      node.removeEventListener('mouseleave', handleEnd);
      node.removeEventListener('touchend', handleEnd);
      node.removeEventListener('touchcancel', handleEnd);
    }
  };
}

/**
 * Escape Key Action
 *
 * Fires callback when Escape is pressed while element or children have focus.
 *
 * @param {HTMLElement} node
 * @param {() => void} callback
 *
 * @example
 * <dialog use:escapeKey={handleClose}>...</dialog>
 */
export function escapeKey(node, callback) {
  let handler = callback;

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      handler?.();
    }
  }

  // Listen on document for global escape handling
  document.addEventListener('keydown', handleKeydown);

  return {
    update(newCallback) {
      handler = newCallback;
    },
    destroy() {
      document.removeEventListener('keydown', handleKeydown);
    }
  };
}

/**
 * Portal Action
 *
 * Moves element to a different location in the DOM.
 * Useful for modals, toasts, tooltips.
 *
 * @param {HTMLElement} node
 * @param {string | HTMLElement} [target] - CSS selector or element (default: document.body)
 *
 * @example
 * <div use:portal>Portaled to body</div>
 * <div use:portal="#modal-root">Portaled to #modal-root</div>
 */
export function portal(node, target = 'body') {
  let targetEl;

  function update(newTarget) {
    targetEl = typeof newTarget === 'string'
      ? document.querySelector(newTarget)
      : newTarget;

    if (targetEl) {
      targetEl.appendChild(node);
    }
  }

  update(target);

  return {
    update,
    destroy() {
      node.remove();
    }
  };
}

/**
 * Intersection Observer Action
 *
 * Observes element visibility in viewport.
 *
 * @param {HTMLElement} node
 * @param {{ onIntersect: (entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit }} config
 *
 * @example
 * <div use:intersect={{ onIntersect: (e) => isVisible = e.isIntersecting }}>
 *   Lazy loaded content
 * </div>
 */
export function intersect(node, config) {
  let { onIntersect, options = {} } = config;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => onIntersect?.(entry));
  }, options);

  observer.observe(node);

  return {
    update(newConfig) {
      onIntersect = newConfig.onIntersect;
    },
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Resize Observer Action
 *
 * Observes element size changes.
 *
 * @param {HTMLElement} node
 * @param {(entry: ResizeObserverEntry) => void} callback
 *
 * @example
 * <div use:resize={(entry) => width = entry.contentRect.width}>
 *   Responsive content
 * </div>
 */
export function resize(node, callback) {
  let handler = callback;

  const observer = new ResizeObserver((entries) => {
    entries.forEach(entry => handler?.(entry));
  });

  observer.observe(node);

  return {
    update(newCallback) {
      handler = newCallback;
    },
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Copy to Clipboard Action
 *
 * Copies element's text content or provided value on click.
 *
 * @param {HTMLElement} node
 * @param {{ value?: string, onCopy?: () => void, onError?: (err: Error) => void }} [options]
 *
 * @example
 * <button use:copy={{ value: 'Text to copy', onCopy: () => showToast('Copied!') }}>
 *   Copy
 * </button>
 */
export function copy(node, options = {}) {
  let { value, onCopy, onError } = options;

  async function handleClick() {
    try {
      const text = value ?? node.textContent ?? '';
      await navigator.clipboard.writeText(text);
      onCopy?.();
    } catch (err) {
      onError?.(err);
    }
  }

  node.addEventListener('click', handleClick);

  return {
    update(newOptions) {
      value = newOptions.value;
      onCopy = newOptions.onCopy;
      onError = newOptions.onError;
    },
    destroy() {
      node.removeEventListener('click', handleClick);
    }
  };
}
