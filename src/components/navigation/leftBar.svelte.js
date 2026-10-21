/**
 * LeftBarState — the state one LeftBar shares with the children placed in it.
 *
 * LeftBar creates one (or takes yours through its `bar` prop) and hands it to
 * its `header`, `navigation`, `footer` and `children` snippets as the snippet
 * argument (`{#snippet navigation(bar)}`); every LeftBarItem, LeftBarSection,
 * LeftBarGroup, LeftBarToggle and LeftBarPopover takes it as the `bar` prop.
 * No Svelte context: the fields are the state, the methods are its writers.
 *
 * - `collapsed`: the bar is the narrow icon rail. `toggle()` persists it
 *   (localStorage under `persistKey`, a 30-day cookie under `cookieKey ??
 *   persistKey` so the server can render the right width next time).
 * - `hoverPopover`: the collapsed bar's flyout — which item it is for and where
 *   (`{item, position: {top, left}}`). `showPopover` opens it next to the
 *   hovered row, `hidePopover` closes it after a grace period that
 *   `keepPopoverOpen` cancels (the pointer moved into the flyout).
 */

import { untrack } from "svelte";

/** Grace period before a flyout closes, so the pointer can cross the gap. */
export const POPOVER_HIDE_DELAY = 150;

const CLOSED = Object.freeze({
  item: null,
  position: Object.freeze({ top: 0, left: 0 }),
});

export class LeftBarState {
  collapsed = $state(false);
  hoverPopover = $state.raw(CLOSED);

  /** @type {string | null} */
  persistKey = null;
  /** @type {string | null} */
  cookieKey = null;

  /** @type {ReturnType<typeof setTimeout> | null} */
  #hideTimer = null;

  /**
   * @param {{collapsed?: boolean, persistKey?: string | null, cookieKey?: string | null}} [init]
   */
  constructor({ collapsed = false, persistKey = null, cookieKey = null } = {}) {
    this.collapsed = collapsed;
    this.persistKey = persistKey;
    this.cookieKey = cookieKey;
  }

  /** Flip collapsed and remember the choice (localStorage + cookie). */
  toggle() {
    this.collapsed = !this.collapsed;
    this.persist();
  }

  expand() {
    this.collapsed = false;
  }

  collapse() {
    this.collapsed = true;
  }

  /** Write `collapsed` to localStorage (`persistKey`) and the SSR cookie. Browser only. */
  persist() {
    if (typeof localStorage === "undefined") return;
    if (this.persistKey) {
      try {
        localStorage.setItem(this.persistKey, String(this.collapsed));
      } catch {}
    }
    const key = this.cookieKey || this.persistKey;
    if (key && typeof document !== "undefined") {
      try {
        document.cookie = `${key}=${this.collapsed ? "1" : "0"};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
      } catch {}
    }
  }

  /** Read `collapsed` back from localStorage (`persistKey`), when saved. Browser only. */
  restore() {
    if (!this.persistKey || typeof localStorage === "undefined") return;
    try {
      const saved = localStorage.getItem(this.persistKey);
      if (saved !== null) this.collapsed = saved === "true";
    } catch {}
  }

  /**
   * Open the flyout for `item` beside the hovered row. Only while collapsed.
   * @param {string} item
   * @param {{currentTarget: Element}} event
   */
  showPopover(item, event) {
    if (!this.collapsed) return;
    this.#clearTimer();
    const rect = event.currentTarget.getBoundingClientRect();
    this.hoverPopover = {
      item,
      position: { top: rect.top, left: rect.right + 8 },
    };
  }

  /** Close the flyout after the grace period. */
  hidePopover() {
    this.#clearTimer();
    this.#hideTimer = setTimeout(() => {
      this.#hideTimer = null;
      this.hoverPopover = { ...this.hoverPopover, item: null };
    }, POPOVER_HIDE_DELAY);
  }

  /** Cancel a pending close (the pointer entered the flyout). */
  keepPopoverOpen() {
    this.#clearTimer();
  }

  /** Drop a pending close timer. LeftBar calls this when it unmounts. */
  destroy() {
    this.#clearTimer();
  }

  #clearTimer() {
    if (this.#hideTimer) clearTimeout(this.#hideTimer);
    this.#hideTimer = null;
  }
}

/**
 * Keep a LeftBarState and LeftBar's bindable `collapsed` prop in step. Call it
 * during component initialisation (it creates two `$effect`s).
 *
 * - parent -> bar: only a value the consumer actually passed (`read()` returns
 *   undefined when `collapsed` was not passed, so an external bar keeps its
 *   own value). With `skipFirst` (an internal bar seeded from
 *   `initialCollapsed`), the FIRST run only subscribes: the seed wins the
 *   first paint over a stale bound value, and every later parent write to
 *   `collapsed` still reaches the bar.
 * - bar -> parent: `write(bar.collapsed)` on every change.
 *
 * @param {LeftBarState} bar
 * @param {() => boolean | undefined} read
 * @param {(collapsed: boolean) => void} write
 * @param {{skipFirst?: boolean}} [options]
 */
export function syncCollapsed(bar, read, write, { skipFirst = false } = {}) {
  let skip = skipFirst;
  $effect(() => {
    const next = read();
    if (skip) {
      skip = false;
      return;
    }
    if (next === undefined) return;
    untrack(() => (bar.collapsed = next));
  });

  $effect(() => {
    write(bar.collapsed);
  });
}
