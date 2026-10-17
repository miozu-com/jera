/**
 * Choice decisions shared by ChoiceGrid and ChoiceList, kept out of the
 * components so they can be tested without a DOM (the same split as
 * `combobox.rules.js` / `tagInput.rules.js`). The components call these
 * verbatim: what a pick or a key does is decided here, the components only
 * apply it.
 *
 * The selection is always an array of keys. `single` mode holds 0 or 1 key.
 */

/**
 * The effective minimum: `single` mode defaults to 1 (radio semantics — the
 * pick can be moved but not cleared), `multi` to 0.
 *
 * @param {'single'|'multi'} mode
 * @param {number|undefined} min
 */
export function effectiveMin(mode, min) {
  if (typeof min === "number") return Math.max(0, min);
  return mode === "single" ? 1 : 0;
}

/**
 * What picking `key` does to `selected`.
 *
 * - `single`: picking another key replaces the pick. Re-picking the current
 *   key clears it only when `min` is 0; otherwise nothing changes.
 * - `multi`: toggles, refusing to drop below `min` or rise above `max`.
 *
 * @param {Array<unknown>} selected
 * @param {unknown} key
 * @param {{ mode?: 'single'|'multi', min?: number, max?: number }} [opts]
 * @returns {{ next: Array<unknown>, changed: boolean }}
 */
export function toggleSelection(
  selected,
  key,
  { mode = "multi", min, max = Infinity } = {},
) {
  const current = Array.isArray(selected) ? selected : [];
  const floor = effectiveMin(mode, min);
  const on = current.includes(key);

  if (mode === "single") {
    if (!on) return { next: [key], changed: true };
    if (floor >= 1) return { next: current, changed: false };
    return { next: [], changed: true };
  }

  if (on) {
    if (current.length <= floor) return { next: current, changed: false };
    return { next: current.filter((k) => k !== key), changed: true };
  }
  if (current.length >= max) return { next: current, changed: false };
  return { next: [...current, key], changed: true };
}

/**
 * Whether an unpicked item cannot be picked right now because the selection
 * is full (`multi` mode only — `single` mode always replaces). Picked items
 * are never blocked: they can still be unpicked.
 *
 * @param {Array<unknown>} selected
 * @param {unknown} key
 * @param {{ mode?: 'single'|'multi', max?: number }} [opts]
 */
export function isBlocked(
  selected,
  key,
  { mode = "multi", max = Infinity } = {},
) {
  if (mode !== "multi") return false;
  const current = Array.isArray(selected) ? selected : [];
  return !current.includes(key) && current.length >= max;
}

/**
 * What a keydown on a focused choice does (WAI-ARIA APG radio group for
 * `single`, a grid of checkboxes for `multi`).
 *
 * - ArrowRight / ArrowLeft move ±1, wrapping at the ends.
 * - ArrowDown / ArrowUp move ±`columns`, clamped (a list passes 1).
 * - Home / End move to the first / last choice.
 * - Space and Enter toggle the focused choice.
 *
 * In `single` mode a move also selects (`select: true`), as in a native radio
 * group; in `multi` mode it only moves focus.
 *
 * @param {string} key  KeyboardEvent.key
 * @param {{ index: number, count: number, columns?: number, mode?: 'single'|'multi' }} state
 * @returns {{ action: 'none'|'move'|'toggle', index?: number, select?: boolean }}
 */
export function choiceKey(key, { index, count, columns = 1, mode = "multi" }) {
  if (count <= 0) return { action: "none" };
  const cols = Math.max(1, Math.floor(columns) || 1);
  const at = Math.min(Math.max(index, 0), count - 1);
  const select = mode === "single";
  const move = (to) =>
    to === at ? { action: "none" } : { action: "move", index: to, select };

  switch (key) {
    case "ArrowRight":
      return move((at + 1) % count);
    case "ArrowLeft":
      return move((at - 1 + count) % count);
    case "ArrowDown":
      return move(Math.min(at + cols, count - 1));
    case "ArrowUp":
      return move(Math.max(at - cols, 0));
    case "Home":
      return move(0);
    case "End":
      return move(count - 1);
    case " ":
    case "Enter":
      return { action: "toggle", index: at };
    default:
      return { action: "none" };
  }
}

/**
 * The roving-tabindex holder: the first selected item, else the first item.
 * Returns -1 for an empty list.
 *
 * @template T
 * @param {T[]} items
 * @param {Array<unknown>} selected
 * @param {(item: T) => unknown} keyOf
 */
export function tabbableIndex(items, selected, keyOf) {
  if (!items?.length) return -1;
  const current = Array.isArray(selected) ? selected : [];
  const found = items.findIndex((item) => current.includes(keyOf(item)));
  return found >= 0 ? found : 0;
}

/**
 * Count the choices on the first visual row (the grid's column count),
 * from their offsetTop. Pure over the numbers so it can be tested.
 *
 * @param {number[]} tops  offsetTop of each choice, in order
 */
export function columnsFromTops(tops) {
  if (!tops?.length) return 1;
  const first = tops[0];
  let n = 0;
  while (n < tops.length && tops[n] === first) n++;
  return Math.max(1, n);
}
