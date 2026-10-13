/**
 * Combobox decisions, kept out of the component so they can be tested without
 * a DOM (the same split as `tagInput.rules.js`). The component calls these
 * verbatim: what a key does is decided here, the component only applies it.
 */

/**
 * What a keydown in the combobox's input does (WAI-ARIA APG combobox with a
 * listbox popup, "list autocomplete"). Focus never leaves the input; the
 * active option moves instead.
 *
 * Actions:
 * - `none`     let the key through untouched (typing, caret keys, the closed
 *              list's Escape — SearchInput's own clear gesture).
 * - `open`     open the list (ArrowDown / Alt+ArrowDown on a closed list).
 * - `move`     make option `active` the active one and scroll it into view.
 * - `pick`     pick the active option (Enter).
 * - `dismiss`  close the list and keep the text (Escape on an open list);
 *              the caller stops the event so SearchInput does not also clear.
 * - `block`    swallow the key (an arrow on an open but empty list).
 *
 * Home/End are deliberately `none`: in an editable combobox they move the
 * caret in the text (APG), which is what someone editing a query expects.
 *
 * @param {string} key  KeyboardEvent.key
 * @param {{ open: boolean, count: number, active: number, composing?: boolean }} state
 * @returns {{ action: 'none'|'open'|'move'|'pick'|'dismiss'|'block', active?: number }}
 */
export function comboboxKey(key, { open, count, active, composing = false }) {
  // An IME is still composing: Enter/Escape/arrows belong to it.
  if (composing) return { action: "none" };

  switch (key) {
    case "ArrowDown":
      if (!open) return { action: "open" };
      if (count === 0) return { action: "block" };
      return {
        action: "move",
        active: Math.min(Math.max(active, -1) + 1, count - 1),
      };
    case "ArrowUp":
      if (!open) return { action: "none" };
      if (count === 0) return { action: "block" };
      return { action: "move", active: Math.max(active - 1, 0) };
    case "Enter":
      if (open && active >= 0 && active < count)
        return { action: "pick", active };
      return { action: "none" };
    case "Escape":
      return open ? { action: "dismiss" } : { action: "none" };
    default:
      return { action: "none" };
  }
}

/**
 * How long to wait before reporting typed text: an empty (or blank) field is
 * reported at once — the consumer usually swaps in its default list — and
 * anything else after `ms`.
 *
 * @param {string} text
 * @param {number} ms
 */
export function queryDelay(text, ms) {
  return String(text ?? "").trim() === "" ? 0 : Math.max(0, ms || 0);
}

/**
 * Latest-call-wins debounce for `onquery`. `push(text)` replaces any pending
 * call; a zero delay (see `queryDelay`) fires synchronously. `cancel()` is the
 * component's teardown.
 *
 * @param {(text: string) => void} fire
 * @param {() => number} getMs  read on every push so a changed `debounce` prop applies
 */
export function createQueryDebouncer(fire, getMs) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  return {
    push(text) {
      clearTimeout(timer);
      timer = undefined;
      const delay = queryDelay(text, getMs());
      if (delay === 0) {
        fire(text);
        return;
      }
      timer = setTimeout(() => {
        timer = undefined;
        fire(text);
      }, delay);
    },
    cancel() {
      clearTimeout(timer);
      timer = undefined;
    },
    get pending() {
      return timer !== undefined;
    },
  };
}

/**
 * The live region's sentence for a settled list.
 * @param {number} count
 */
export function resultsMessage(count) {
  if (count === 0) return "No results";
  return count === 1 ? "1 result" : `${count} results`;
}
