/**
 * The selection model shared by ChoiceGrid and ChoiceList (choice.rules.js).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  effectiveMin,
  toggleSelection,
  isBlocked,
  choiceKey,
  tabbableIndex,
  columnsFromTops,
} from "../src/components/forms/choice.rules.js";

test("effectiveMin — single defaults to 1, multi to 0, explicit wins", () => {
  assert.equal(effectiveMin("single"), 1);
  assert.equal(effectiveMin("multi"), 0);
  assert.equal(effectiveMin("single", 0), 0);
  assert.equal(effectiveMin("multi", -2), 0);
});

test("toggleSelection single — replaces; re-pick keeps unless min is 0", () => {
  assert.deepEqual(toggleSelection([], "a", { mode: "single" }), { next: ["a"], changed: true });
  assert.deepEqual(toggleSelection(["a"], "b", { mode: "single" }), { next: ["b"], changed: true });
  assert.deepEqual(toggleSelection(["a"], "a", { mode: "single" }), { next: ["a"], changed: false });
  assert.deepEqual(toggleSelection(["a"], "a", { mode: "single", min: 0 }), { next: [], changed: true });
});

test("toggleSelection multi — toggles within min and max", () => {
  assert.deepEqual(toggleSelection(["a"], "b"), { next: ["a", "b"], changed: true });
  assert.deepEqual(toggleSelection(["a", "b"], "a"), { next: ["b"], changed: true });
  assert.equal(toggleSelection(["a"], "a", { min: 1 }).changed, false);
  assert.equal(toggleSelection(["a", "b"], "c", { max: 2 }).changed, false);
  assert.deepEqual(toggleSelection(["a", "b"], "b", { max: 2 }), { next: ["a"], changed: true });
  assert.deepEqual(toggleSelection(undefined, "a"), { next: ["a"], changed: true });
});

test("isBlocked — only unpicked items in a full multi selection", () => {
  assert.equal(isBlocked(["a", "b"], "c", { max: 2 }), true);
  assert.equal(isBlocked(["a", "b"], "a", { max: 2 }), false);
  assert.equal(isBlocked(["a"], "c", { max: 2 }), false);
  assert.equal(isBlocked(["a"], "c", { mode: "single", max: 1 }), false);
});

test("choiceKey — arrows wrap horizontally, clamp vertically by columns", () => {
  const s = { index: 0, count: 7, columns: 3 };
  assert.deepEqual(choiceKey("ArrowRight", s), { action: "move", index: 1, select: false });
  assert.deepEqual(choiceKey("ArrowLeft", s), { action: "move", index: 6, select: false });
  assert.deepEqual(choiceKey("ArrowDown", s), { action: "move", index: 3, select: false });
  assert.deepEqual(choiceKey("ArrowDown", { ...s, index: 5 }), { action: "move", index: 6, select: false });
  assert.deepEqual(choiceKey("ArrowUp", s), { action: "none" });
  assert.deepEqual(choiceKey("ArrowUp", { ...s, index: 4 }), { action: "move", index: 1, select: false });
  assert.deepEqual(choiceKey("End", s), { action: "move", index: 6, select: false });
  assert.deepEqual(choiceKey("Home", { ...s, index: 4 }), { action: "move", index: 0, select: false });
});

test("choiceKey — Space/Enter toggle; single-mode moves also select; others pass", () => {
  assert.deepEqual(choiceKey(" ", { index: 2, count: 3 }), { action: "toggle", index: 2 });
  assert.deepEqual(choiceKey("Enter", { index: 0, count: 3 }), { action: "toggle", index: 0 });
  assert.equal(choiceKey("ArrowRight", { index: 0, count: 3, mode: "single" }).select, true);
  assert.deepEqual(choiceKey("a", { index: 0, count: 3 }), { action: "none" });
  assert.deepEqual(choiceKey("ArrowRight", { index: 0, count: 0 }), { action: "none" });
  assert.deepEqual(choiceKey("ArrowRight", { index: 0, count: 1 }), { action: "none" });
});

test("tabbableIndex — first selected, else 0, -1 when empty", () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const keyOf = (i) => i.id;
  assert.equal(tabbableIndex(items, [3, 2], keyOf), 1);
  assert.equal(tabbableIndex(items, [], keyOf), 0);
  assert.equal(tabbableIndex([], [1], keyOf), -1);
});

test("columnsFromTops — tiles sharing the first row's top", () => {
  assert.equal(columnsFromTops([0, 0, 0, 80, 80]), 3);
  assert.equal(columnsFromTops([0]), 1);
  assert.equal(columnsFromTops([]), 1);
});
