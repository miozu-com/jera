/**
 * Tooltip placement (`src/utils/tooltipPlacement.js`): flip when the asked
 * side has no room, shift to stay inside the pane, arrow on the trigger.
 * Run with `pnpm test`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { clipBounds, placeTooltip } from "../src/utils/tooltipPlacement.js";

const pane = { top: 8, left: 108, right: 492, bottom: 792 };
const at = (left, top, w = 32, h = 32) => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
});

test("bottom with room: centred under the trigger", () => {
  const p = placeTooltip({
    anchor: at(284, 100),
    size: { width: 100, height: 40 },
    bounds: pane,
    side: "bottom",
  });
  assert.deepEqual(p, { side: "bottom", x: 250, y: 140, arrow: 50 });
});

test("near the pane's left edge: shifted inside, arrow still on the trigger", () => {
  // The owner's screenshot 2026-10-22: the ⓘ beside "Words" at the pane's edge.
  const p = placeTooltip({
    anchor: at(120, 100),
    size: { width: 256, height: 60 },
    bounds: pane,
    side: "bottom",
  });
  assert.equal(p.x, 108);
  assert.equal(p.arrow, 120 + 16 - 108);
});

test("near the right edge: shifted left", () => {
  const p = placeTooltip({
    anchor: at(470, 100, 16, 16),
    size: { width: 200, height: 40 },
    bounds: pane,
    side: "top",
  });
  assert.equal(p.x, 492 - 200);
  assert.equal(p.side, "top");
});

test("no room below, room above: flips to top", () => {
  const p = placeTooltip({
    anchor: at(284, 760),
    size: { width: 100, height: 60 },
    bounds: pane,
    side: "bottom",
  });
  assert.equal(p.side, "top");
  assert.equal(p.y, 760 - 8 - 60);
});

test("no room on either side: keeps the side with more room", () => {
  const p = placeTooltip({
    anchor: at(284, 20),
    size: { width: 100, height: 900 },
    bounds: pane,
    side: "top",
  });
  assert.equal(p.side, "bottom");
});

test("arrow stays off the bubble's corners", () => {
  const p = placeTooltip({
    anchor: at(100, 100, 8, 8),
    size: { width: 200, height: 40 },
    bounds: { top: 0, left: 0, right: 1000, bottom: 1000 },
    side: "bottom",
  });
  assert.equal(p.x, 4);
  assert.ok(p.arrow >= 10);
});

test("left / right: vertical shift inside the box", () => {
  const p = placeTooltip({
    anchor: at(300, 10, 20, 20),
    size: { width: 120, height: 80 },
    bounds: pane,
    side: "right",
  });
  assert.equal(p.side, "right");
  assert.equal(p.x, 328);
  assert.equal(p.y, 8);
});

/** A trigger inside `chain` (innermost first), each `{rect, overflow}`, in a 1000×800 viewport. */
function fakeTrigger(chain) {
  const body = { tag: "body" };
  const styles = new Map();
  const doc = {
    body,
    documentElement: { clientWidth: 1000, clientHeight: 800 },
    defaultView: { getComputedStyle: (n) => styles.get(n) },
  };
  let parent = body;
  for (const { rect, overflow } of [...chain].reverse()) {
    const node = {
      parentElement: parent,
      getBoundingClientRect: () => rect,
    };
    styles.set(node, { overflowX: overflow, overflowY: overflow });
    parent = node;
  }
  return { ownerDocument: doc, parentElement: parent };
}

const box = (left, top, right, bottom) => ({
  left,
  top,
  right,
  bottom,
  width: right - left,
  height: bottom - top,
});

test("clipBounds: a scrolling pane bounds the bubble", () => {
  const el = fakeTrigger([{ rect: box(100, 0, 500, 800), overflow: "auto" }]);
  assert.deepEqual(clipBounds(el, 8, { width: 256, height: 60 }), {
    top: 8,
    left: 108,
    right: 492,
    bottom: 792,
  });
});

test("clipBounds: a clipping cell too small for the bubble does not bound it", () => {
  const el = fakeTrigger([
    { rect: box(300, 200, 380, 224), overflow: "hidden" },
    { rect: box(100, 0, 900, 800), overflow: "auto" },
  ]);
  assert.deepEqual(clipBounds(el, 8, { width: 200, height: 40 }), {
    top: 8,
    left: 108,
    right: 892,
    bottom: 792,
  });
});
