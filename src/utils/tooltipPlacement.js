/**
 * Where a tooltip bubble goes (`Tooltip.svelte`) — pure, so `node --test`
 * covers it (`tests/tooltipPlacement.test.js`).
 *
 * The bubble sits on the asked side of its trigger; when that side has no
 * room inside `bounds` and the opposite side has more, it flips. Along the
 * other axis it shifts to stay inside `bounds`, and the arrow keeps pointing
 * at the trigger's centre (clamped to the bubble's own edges).
 *
 * `bounds` is the visible box the bubble must stay inside: the viewport
 * intersected with every clipping ancestor of the trigger (a scrolling pane),
 * already inset by the margin (`clipBounds`).
 */

/** @typedef {{top: number, right: number, bottom: number, left: number}} Box */

const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * @param {{
 *   anchor: Box,
 *   size: {width: number, height: number},
 *   bounds: Box,
 *   side?: 'top'|'bottom'|'left'|'right',
 *   gap?: number,
 *   arrowInset?: number
 * }} input
 * @returns {{side: string, x: number, y: number, arrow: number}}
 *   `x`, `y`: the bubble's top-left (viewport px); `arrow`: the arrow's centre
 *   along the bubble's edge, from its start (px).
 */
export function placeTooltip({
  anchor,
  size,
  bounds,
  side = "top",
  gap = 8,
  arrowInset = 10,
}) {
  const want = OPPOSITE[side] ? side : "top";
  const vertical = want === "top" || want === "bottom";
  const need = (vertical ? size.height : size.width) + gap;
  const room = {
    top: anchor.top - bounds.top,
    bottom: bounds.bottom - anchor.bottom,
    left: anchor.left - bounds.left,
    right: bounds.right - anchor.right,
  };
  const other = OPPOSITE[want];
  const placed = room[want] < need && room[other] > room[want] ? other : want;

  const cx = (anchor.left + anchor.right) / 2;
  const cy = (anchor.top + anchor.bottom) / 2;
  let x;
  let y;
  if (vertical) {
    y = placed === "top" ? anchor.top - gap - size.height : anchor.bottom + gap;
    x = clamp(cx - size.width / 2, bounds.left, bounds.right - size.width);
  } else {
    x = placed === "left" ? anchor.left - gap - size.width : anchor.right + gap;
    y = clamp(cy - size.height / 2, bounds.top, bounds.bottom - size.height);
  }
  const span = vertical ? size.width : size.height;
  const pointAt = vertical ? cx - x : cy - y;
  const arrow = clamp(
    pointAt,
    Math.min(arrowInset, span / 2),
    Math.max(span - arrowInset, span / 2),
  );
  return {
    side: placed,
    x: Math.round(x),
    y: Math.round(y),
    arrow: Math.round(arrow),
  };
}

/** `v` inside [lo, hi]; `lo` wins when the range is empty (the bubble is wider than the box). */
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(v, hi));
}

/**
 * The box a bubble anchored on `el` must stay inside: the viewport, cut by
 * every ancestor that clips its overflow, inset by `margin`.
 *
 * With `size` (the bubble's), an ancestor too small on an axis to hold the
 * bubble does not bound that axis: the bubble is in the top layer, so a
 * clipping table cell or a narrow rail never hides it, and keeping it inside
 * one would only push it off its trigger (or off screen, flipped).
 *
 * @param {Element} el
 * @param {number} [margin]
 * @param {{width: number, height: number}|null} [size]
 * @returns {Box}
 */
export function clipBounds(el, margin = 8, size = null) {
  const doc = el.ownerDocument;
  const view = doc.defaultView;
  let box = {
    top: 0,
    left: 0,
    right: doc.documentElement.clientWidth,
    bottom: doc.documentElement.clientHeight,
  };
  for (
    let node = el.parentElement;
    node && node !== doc.body;
    node = node.parentElement
  ) {
    const style = view.getComputedStyle(node);
    if (style.overflowX === "visible" && style.overflowY === "visible")
      continue;
    const r = node.getBoundingClientRect();
    const holdsX = !size || r.width >= size.width + 2 * margin;
    const holdsY = !size || r.height >= size.height + 2 * margin;
    box = {
      top: holdsY ? Math.max(box.top, r.top) : box.top,
      left: holdsX ? Math.max(box.left, r.left) : box.left,
      right: holdsX ? Math.min(box.right, r.right) : box.right,
      bottom: holdsY ? Math.min(box.bottom, r.bottom) : box.bottom,
    };
  }
  return {
    top: box.top + margin,
    left: box.left + margin,
    right: box.right - margin,
    bottom: box.bottom - margin,
  };
}
