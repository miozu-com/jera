/**
 * Reactive State Utilities for Svelte 5
 *
 * Advanced patterns for creating shareable, reactive state.
 * Uses Svelte 5 runes ($state, $derived, $effect) internally.
 */

/**
 * Create a reactive store-like object with Svelte 5 runes
 * Unlike stores, these work seamlessly with runes and don't need $ prefix
 *
 * @template T
 * @param {T} initial
 * @returns {{ value: T, set: (v: T) => void, update: (fn: (v: T) => T) => void }}
 *
 * @example
 * const count = createReactive(0);
 * count.value; // read
 * count.set(5); // write
 * count.update(n => n + 1); // update
 */
export function createReactive(initial) {
  let value = $state(initial);

  return {
    get value() {
      return value;
    },
    set value(v) {
      value = v;
    },
    set(v) {
      value = v;
    },
    update(fn) {
      value = fn(value);
    }
  };
}

/**
 * Create a derived reactive value
 *
 * @template T
 * @param {() => T} fn
 * @returns {{ readonly value: T }}
 */
export function createDerived(fn) {
  const value = $derived.by(fn);

  return {
    get value() {
      return value;
    }
  };
}

/**
 * Theme Reactive State Class (Singleton Pattern)
 *
 * Manages theme state with persistence and SSR support.
 * Uses singleton pattern for global app-level state.
 *
 * Storage key: 'miozu-theme'
 * Data-theme values: 'miozu-dark' | 'miozu-light'
 *
 * @example
 * import { getTheme } from '@miozu/jera';
 * const theme = getTheme();
 * theme.init(); // Call once in root layout onMount
 * theme.toggle(); // Toggle dark/light
 * theme.set('system'); // Use system preference
 */
export class ThemeState {
  /** @type {'light' | 'dark' | 'system'} */
  current = $state('system');

  /** @type {'light' | 'dark'} */
  resolved = $derived.by(() => this.#resolveTheme());

  /** @type {'miozu-light' | 'miozu-dark'} */
  dataTheme = $derived.by(() => this.resolved === 'dark' ? 'miozu-dark' : 'miozu-light');

  /** @type {boolean} */
  isDark = $derived.by(() => this.resolved === 'dark');

  /** @type {boolean} */
  isLight = $derived.by(() => this.resolved === 'light');

  /** @type {boolean} */
  #initialized = false;

  /** @type {MediaQueryList | null} */
  #mediaQuery = null;

  /** @type {(() => void) | null} */
  #mediaQueryHandler = null;

  constructor(initial = 'system') {
    this.current = initial;
  }

  #resolveTheme() {
    if (this.current === 'system') {
      // SSR-safe: default to dark if no window (miozu default)
      if (typeof window === 'undefined') return 'dark';
      return this.#mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.current;
  }

  /**
   * Initialize theme - call once in root layout onMount
   * Loads from storage and sets up system preference listener
   */
  init() {
    if (typeof window === 'undefined') return;
    if (this.#initialized) return; // Prevent double init

    // Load from storage
    const stored = localStorage.getItem('miozu-theme');
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      this.current = stored;
    }

    // Setup media query listener for system preference
    this.#mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.#mediaQueryHandler = () => {
      // Force re-resolution when system preference changes
      if (this.current === 'system') {
        this.#apply();
      }
    };
    this.#mediaQuery.addEventListener('change', this.#mediaQueryHandler);

    this.#initialized = true;
    this.#apply();
  }

  /**
   * Cleanup media query listener
   * Call in onDestroy if needed (usually not necessary for singleton)
   */
  cleanup() {
    if (this.#mediaQuery && this.#mediaQueryHandler) {
      this.#mediaQuery.removeEventListener('change', this.#mediaQueryHandler);
      this.#mediaQueryHandler = null;
    }
    this.#initialized = false;
  }

  /**
   * Set theme preference and persist
   * @param {'light' | 'dark' | 'system'} theme
   */
  set(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }
    this.current = theme;
    this.#persist();
    this.#apply();
  }

  /**
   * Toggle between light and dark (skips system)
   */
  toggle() {
    this.set(this.resolved === 'light' ? 'dark' : 'light');
  }

  /**
   * Persist to localStorage and cookie
   */
  #persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('miozu-theme', this.current);
    document.cookie = `miozu-theme=${this.current};path=/;max-age=31536000;SameSite=Lax`;
  }

  /**
   * Apply theme to document
   */
  #apply() {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', this.dataTheme);
    document.documentElement.style.colorScheme = this.resolved;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

/** @type {ThemeState | null} */
let themeInstance = null;

/**
 * Get the global theme singleton
 * Creates instance on first call (lazy initialization)
 *
 * @param {'light' | 'dark' | 'system'} [initial] - Initial theme (only used on first call)
 * @returns {ThemeState}
 *
 * @example
 * // In root +layout.svelte
 * import { getTheme } from '@miozu/jera';
 * const theme = getTheme();
 * onMount(() => theme.init());
 *
 * // Anywhere else
 * import { getTheme } from '@miozu/jera';
 * const theme = getTheme();
 * theme.toggle();
 */
export function getTheme(initial = 'system') {
  if (!themeInstance) {
    themeInstance = new ThemeState(initial);
  }
  return themeInstance;
}

/**
 * Reset theme singleton (for testing)
 */
export function resetTheme() {
  if (themeInstance) {
    themeInstance.cleanup();
    themeInstance = null;
  }
}

/**
 * Component State Factory
 *
 * Creates encapsulated component state with derived values.
 * Pattern for complex components like Select, Combobox, etc.
 *
 * @template T
 * @param {T} initialState
 * @param {(state: T) => Record<string, any>} [derivedFn]
 */
export function createComponentState(initialState, derivedFn) {
  const state = $state(initialState);

  // $derived.by tracks dependencies inside the function
  const deriveFn = derivedFn || (() => ({}));
  const derived = $derived.by(() => deriveFn(state));

  return {
    get state() {
      return state;
    },
    set state(v) {
      Object.assign(state, v);
    },
    get derived() {
      return derived;
    },
    /**
     * Patch state partially
     * @param {Partial<T>} patch
     */
    patch(patch) {
      Object.assign(state, patch);
    },
    /**
     * Reset to initial state
     */
    reset() {
      Object.assign(state, initialState);
    }
  };
}

/**
 * Create a unique ID generator for accessibility
 * @param {string} [prefix]
 * @returns {() => string}
 */
export function createIdGenerator(prefix = 'jera') {
  let counter = 0;
  return () => `${prefix}-${++counter}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Shared ID generator instance
 */
export const generateId = createIdGenerator();
