/**
 * Reactive State Utilities for Svelte 5
 *
 * Advanced patterns for creating shareable, reactive state.
 * Uses Svelte 5 runes ($state, $derived, $effect) internally.
 */

import { getContext, setContext, onMount } from 'svelte';

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
 * Theme Context Key
 */
const THEME_KEY = Symbol('jera-theme');

/**
 * Theme Reactive State Class
 *
 * Manages theme state with persistence and SSR support.
 * Uses class-based reactive state pattern.
 */
export class ThemeState {
  /** @type {'light' | 'dark' | 'system'} */
  current = $state('system');

  /** @type {'light' | 'dark'} */
  resolved = $derived.by(() => this.#resolveTheme());

  /** @type {boolean} */
  #mounted = false;

  /** @type {MediaQueryList | null} */
  #mediaQuery = null;

  /** @type {(() => void) | null} */
  #mediaQueryHandler = null;

  constructor(initial = 'system') {
    this.current = initial;
  }

  #resolveTheme() {
    if (this.current === 'system') {
      // SSR-safe: default to light if no window
      if (typeof window === 'undefined') return 'light';
      return this.#mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.current;
  }

  /**
   * Initialize theme - call in onMount
   */
  init() {
    if (typeof window === 'undefined') return;

    // Load from storage
    const stored = localStorage.getItem('jera-theme');
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      this.current = stored;
    }

    // Setup media query listener
    this.#mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.#mediaQueryHandler = () => {
      // Trigger re-resolution by reassigning
      this.current = this.current;
    };
    this.#mediaQuery.addEventListener('change', this.#mediaQueryHandler);

    this.#mounted = true;
    this.#apply();
  }

  /**
   * Cleanup - call in onDestroy to prevent memory leaks
   */
  cleanup() {
    if (this.#mediaQuery && this.#mediaQueryHandler) {
      this.#mediaQuery.removeEventListener('change', this.#mediaQueryHandler);
      this.#mediaQueryHandler = null;
    }
    this.#mounted = false;
  }

  /**
   * Set theme and persist
   * @param {'light' | 'dark' | 'system'} theme
   */
  set(theme) {
    this.current = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jera-theme', theme);
      document.cookie = `jera-theme=${theme};path=/;max-age=31536000`;
    }
    this.#apply();
  }

  /**
   * Toggle between light and dark
   */
  toggle() {
    this.set(this.resolved === 'light' ? 'dark' : 'light');
  }

  /**
   * Apply theme to document
   */
  #apply() {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', this.resolved);
  }
}

/**
 * Create and provide theme context
 * @param {'light' | 'dark' | 'system'} [initial]
 * @returns {ThemeState}
 */
export function createThemeContext(initial = 'system') {
  const theme = new ThemeState(initial);
  setContext(THEME_KEY, theme);
  return theme;
}

/**
 * Get theme from context
 * @returns {ThemeState}
 */
export function getThemeContext() {
  return getContext(THEME_KEY);
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
