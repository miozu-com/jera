/**
 * LeftBarState: the state a LeftBar hands to its children (0.11.0, no context).
 * collapsed + its persistence, and the collapsed bar's hover flyout timers.
 */

import "./helpers/svelte-server.js";
import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

const { LeftBarState, POPOVER_HIDE_DELAY } =
  await import("../src/components/navigation/leftBar.svelte.js");

const rowAt = (top, right) => ({ currentTarget: { getBoundingClientRect: () => ({ top, right }) } });

let store;
beforeEach(() => {
  store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  globalThis.document = { cookie: "" };
});
afterEach(() => {
  delete globalThis.localStorage;
  delete globalThis.document;
  mock.timers.reset();
});

test("defaults: expanded, flyout closed, no persistence keys", () => {
  const bar = new LeftBarState();
  assert.equal(bar.collapsed, false);
  assert.equal(bar.hoverPopover.item, null);
  assert.deepEqual(bar.hoverPopover.position, { top: 0, left: 0 });
  assert.equal(bar.persistKey, null);
});

test("constructor seeds collapsed (the SSR cookie value)", () => {
  assert.equal(new LeftBarState({ collapsed: true }).collapsed, true);
});

test("toggle flips and persists to localStorage and the SSR cookie", () => {
  const bar = new LeftBarState({ persistKey: "nav", cookieKey: "navCookie" });
  bar.toggle();
  assert.equal(bar.collapsed, true);
  assert.equal(store.get("nav"), "true");
  assert.match(document.cookie, /^navCookie=1;path=\/;max-age=2592000;SameSite=Lax$/);
  bar.toggle();
  assert.equal(store.get("nav"), "false");
  assert.match(document.cookie, /^navCookie=0;/);
});

test("toggle without keys persists nothing; cookie falls back to persistKey", () => {
  const plain = new LeftBarState();
  plain.toggle();
  assert.equal(store.size, 0);
  assert.equal(document.cookie, "");
  const keyed = new LeftBarState({ persistKey: "nav" });
  keyed.toggle();
  assert.match(document.cookie, /^nav=1;/);
});

test("expand / collapse set the value without persisting", () => {
  const bar = new LeftBarState({ persistKey: "nav" });
  bar.collapse();
  assert.equal(bar.collapsed, true);
  bar.expand();
  assert.equal(bar.collapsed, false);
  assert.equal(store.size, 0);
});

test("restore reads the saved value; missing key leaves it alone", () => {
  store.set("nav", "true");
  const bar = new LeftBarState({ persistKey: "nav" });
  bar.restore();
  assert.equal(bar.collapsed, true);
  const fresh = new LeftBarState({ persistKey: "other", collapsed: true });
  fresh.restore();
  assert.equal(fresh.collapsed, true);
});

test("showPopover opens beside the row only while collapsed", () => {
  const bar = new LeftBarState();
  bar.showPopover("Atlas", rowAt(120, 60));
  assert.equal(bar.hoverPopover.item, null, "expanded bar has no flyout");
  bar.collapse();
  bar.showPopover("Atlas", rowAt(120, 60));
  assert.deepEqual(bar.hoverPopover, { item: "Atlas", position: { top: 120, left: 68 } });
});

test("hidePopover closes after the grace period; keepPopoverOpen cancels it", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const bar = new LeftBarState({ collapsed: true });
  bar.showPopover("Atlas", rowAt(0, 60));
  bar.hidePopover();
  mock.timers.tick(POPOVER_HIDE_DELAY - 1);
  assert.equal(bar.hoverPopover.item, "Atlas");
  bar.keepPopoverOpen();
  mock.timers.tick(POPOVER_HIDE_DELAY * 2);
  assert.equal(bar.hoverPopover.item, "Atlas", "kept open");
  bar.hidePopover();
  mock.timers.tick(POPOVER_HIDE_DELAY);
  assert.equal(bar.hoverPopover.item, null);
  assert.deepEqual(bar.hoverPopover.position, { top: 0, left: 60 + 8 }, "position kept for the out-transition");
});

test("showPopover cancels a pending close; destroy drops the timer", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const bar = new LeftBarState({ collapsed: true });
  bar.showPopover("A", rowAt(0, 0));
  bar.hidePopover();
  bar.showPopover("B", rowAt(10, 0));
  mock.timers.tick(POPOVER_HIDE_DELAY);
  assert.equal(bar.hoverPopover.item, "B");
  bar.hidePopover();
  bar.destroy();
  mock.timers.tick(POPOVER_HIDE_DELAY);
  assert.equal(bar.hoverPopover.item, "B");
});
