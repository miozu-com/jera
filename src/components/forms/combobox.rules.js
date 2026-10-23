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
 * `stale`: the list on screen answers an older query (typed text still in the
 * debounce, or its answer still loading). Enter then picks nothing (`block`):
 * the first option is the previous list's, not what the text asks for.
 *
 * @param {string} key  KeyboardEvent.key
 * @param {{ open: boolean, count: number, active: number, composing?: boolean, stale?: boolean }} state
 * @returns {{ action: 'none'|'open'|'move'|'pick'|'dismiss'|'block', active?: number }}
 */
export function comboboxKey(
  key,
  { open, count, active, composing = false, stale = false },
) {
  // An IME is still composing: Enter/Escape/arrows belong to it.
  if (composing) return { action: "none" };
  if (key === "Enter" && stale) return { action: "block" };

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

/**
 * What a keydown does in `multiple` (chip) mode. Decides only what chips add
 * on top of `comboboxKey`; every other key is delegated to it unchanged.
 *
 * Extra actions:
 * - `remove-last`  Backspace in an empty field removes the last chip (APG /
 *                  TagInput parity; Delete does nothing).
 * - `custom`       Enter with typed text, `allowCustom`, and no option to pick
 *                  (nothing active, an empty list, or a `stale` list that
 *                  answers an older query): the caller asks `oncustom(text)`
 *                  for an entry. A stale list without `allowCustom` blocks.
 * - `refuse`       a pick or a custom entry at `max` (`onrefuse('max')`).
 *                  Picking an option that is already a chip removes it, so
 *                  that pick is allowed at `max` (`activeSelected`).
 *
 * @param {string} key  KeyboardEvent.key
 * @param {{ open: boolean, count: number, active: number, query?: string,
 *   values?: unknown[], max?: number, allowCustom?: boolean,
 *   activeSelected?: boolean, composing?: boolean, stale?: boolean }} state
 * @returns {{ action: 'none'|'open'|'move'|'pick'|'dismiss'|'block'|'remove-last'|'custom'|'refuse', active?: number, reason?: 'max' }}
 */
export function multipleKey(
  key,
  {
    open,
    count,
    active,
    query = "",
    values = [],
    max = Infinity,
    allowCustom = false,
    activeSelected = false,
    composing = false,
    stale = false,
  },
) {
  if (composing) return { action: "none" };
  const text = String(query ?? "");
  // Only typed text makes a list stale: an empty field's list is the default one.
  const behind = stale && text.trim() !== "";
  const full = values.length >= max;

  if (key === "Backspace") {
    return text === "" && values.length > 0
      ? { action: "remove-last" }
      : { action: "none" };
  }

  const base = comboboxKey(key, { open, count, active, stale: behind });
  if (base.action === "pick") {
    return full && !activeSelected ? { action: "refuse", reason: "max" } : base;
  }
  if (
    key === "Enter" &&
    allowCustom &&
    text.trim() !== "" &&
    (!open || active < 0 || count === 0 || behind)
  ) {
    return full ? { action: "refuse", reason: "max" } : { action: "custom" };
  }
  return base;
}

/**
 * Whether `entry` is among `values` by `getKey` (multiple mode's selected test).
 * @param {unknown[]} values
 * @param {unknown} entry
 * @param {(item: any) => unknown} getKey
 */
export function hasEntry(values, entry, getKey) {
  const key = getKey(entry);
  return values.some((v) => getKey(v) === key);
}
