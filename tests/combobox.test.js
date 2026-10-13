/**
 * Combobox: the ARIA wiring as the server renders it, and the keyboard and
 * debounce decisions the component applies verbatim (`combobox.rules.js`).
 *
 * Run with `pnpm test` (node's built-in runner, no test dependency). There is
 * no DOM here, so events are not dispatched: the key decisions are tested as
 * the pure function the component's keydown handler calls, and the markup is
 * tested through `svelte/server`.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";
import { createRawSnippet } from "svelte";
import {
  comboboxKey,
  createQueryDebouncer,
  queryDelay,
  resultsMessage,
} from "../src/components/forms/combobox.rules.js";

const { default: Combobox } =
  await import("../src/components/forms/Combobox.svelte");

const items = [
  { id: "a", label: "Watches" },
  { id: "b", label: "Wrist Watches" },
  { id: "c", label: "Watch Bands" },
];

function html(props) {
  return render(Combobox, { props }).body;
}

/** Attributes of the first tag matching `pattern` (a regex over the tag). */
function tag(body, pattern) {
  const match = body.match(new RegExp(`<[^>]*${pattern.source}[^>]*>`));
  assert.ok(match, `no tag matching ${pattern}`);
  return match[0];
}

function attr(tagText, name) {
  const match = tagText.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// ARIA wiring
// ---------------------------------------------------------------------------

test("open: input is a combobox that controls the listbox and points at the first option", () => {
  const body = html({
    open: true,
    items,
    value: "b",
    label: "Categories",
    id: "cat",
  });
  const input = tag(body, /role="combobox"/);
  const listbox = tag(body, /role="listbox"/);
  const options = [...body.matchAll(/<li[^>]*role="option"[^>]*>/g)].map(
    (m) => m[0],
  );

  assert.equal(attr(input, "id"), "cat");
  assert.equal(attr(input, "aria-expanded"), "true");
  assert.equal(attr(input, "aria-autocomplete"), "list");
  assert.equal(attr(input, "aria-controls"), attr(listbox, "id"));
  assert.equal(attr(listbox, "aria-label"), "Categories");

  assert.equal(options.length, 3);
  const ids = options.map((o) => attr(o, "id"));
  assert.equal(new Set(ids).size, 3, "option ids are unique");
  assert.equal(
    attr(input, "aria-activedescendant"),
    ids[0],
    "first option is active",
  );
  assert.deepEqual(
    options.map((o) => attr(o, "aria-selected")),
    ["false", "true", "false"],
    "aria-selected marks the `value` item only",
  );
});

test("closed: aria-expanded is false, no options, no active descendant, the listbox still exists", () => {
  const body = html({ open: false, items, value: "b" });
  const input = tag(body, /role="combobox"/);
  assert.equal(attr(input, "aria-expanded"), "false");
  assert.equal(attr(input, "aria-activedescendant"), null);
  assert.equal(body.match(/role="option"/g), null);
  assert.equal(
    attr(tag(body, /role="listbox"/), "id"),
    attr(input, "aria-controls"),
  );
});

test("two instances in one render get distinct listbox and option ids", async () => {
  const { default: TwoComboboxes } = await import("./fixtures/TwoComboboxes.svelte");
  const body = render(TwoComboboxes, { props: { items } }).body;
  const controls = [...body.matchAll(/<input[^>]*>/g)].map((m) => attr(m[0], "aria-controls"));
  const optionIds = [...body.matchAll(/<li[^>]*role="option"[^>]*>/g)].map((m) => attr(m[0], "id"));
  assert.equal(new Set(controls).size, 2, `listbox ids differ: ${controls}`);
  assert.ok(controls.every((id) => body.includes(`id="${id}"`)));
  assert.equal(optionIds.length, 6);
  assert.equal(new Set(optionIds).size, 6, "option ids are unique across instances");
});

test("rest props reach the input; the default row shows label ?? name", () => {
  const body = html({
    open: true,
    items: [{ id: 1, name: "By name" }],
    "data-testid": "category-search",
    "aria-describedby": "hint-1",
  });
  const input = tag(body, /role="combobox"/);
  assert.equal(attr(input, "data-testid"), "category-search");
  assert.equal(attr(input, "aria-describedby"), "hint-1");
  assert.match(body, /By name/);
});

test("item snippet receives the item and whether it is active; getKey picks the key", () => {
  const item = createRawSnippet((entry, active) => ({
    render: () => `<b>${entry().code}${active() ? "*" : ""}</b>`,
  }));
  const body = html({
    open: true,
    items: [{ code: "x1" }, { code: "x2" }],
    getKey: (entry) => entry.code,
    value: "x2",
    item,
  });
  assert.match(body, /<b>x1\*<\/b>/);
  assert.match(body, /<b>x2<\/b>/);
  const options = [...body.matchAll(/<li[^>]*role="option"[^>]*>/g)].map(
    (m) => m[0],
  );
  assert.equal(attr(options[1], "aria-selected"), "true");
});

test("empty: default 'No results' when open and settled; the empty snippet replaces it; hidden while loading", () => {
  assert.match(html({ open: true, items: [] }), /No results/);
  const empty = createRawSnippet(() => ({
    render: () => "<span>Nothing under this branch</span>",
  }));
  const custom = html({ open: true, items: [], empty });
  assert.match(custom, /Nothing under this branch/);
  assert.doesNotMatch(custom, /No results/);
  const loading = html({ open: true, items: [], loading: true });
  assert.doesNotMatch(loading, /No results/);
  assert.equal(attr(tag(loading, /role="combobox"/), "aria-expanded"), "false");
});

test("header snippet renders above the list while open", () => {
  const header = createRawSnippet(() => ({
    render: () => "<div>‹ Back</div>",
  }));
  const body = html({ open: true, items, header });
  assert.ok(body.indexOf("‹ Back") < body.indexOf('role="listbox"'));
  assert.doesNotMatch(html({ open: false, items, header }), /‹ Back/);
});

// ---------------------------------------------------------------------------
// Keyboard decisions
// ---------------------------------------------------------------------------

test("ArrowDown opens a closed list, then moves; Enter picks the active option", () => {
  assert.deepEqual(
    comboboxKey("ArrowDown", { open: false, count: 3, active: -1 }),
    {
      action: "open",
    },
  );
  // Opened: the first option is active (the component's derived default).
  let active = 0;
  const step = comboboxKey("ArrowDown", { open: true, count: 3, active });
  assert.deepEqual(step, { action: "move", active: 1 });
  active = step.active;
  assert.deepEqual(comboboxKey("Enter", { open: true, count: 3, active }), {
    action: "pick",
    active: 1,
  });
});

test("arrows stop at the ends; ArrowUp on a closed list and Home/End stay with the text", () => {
  assert.equal(
    comboboxKey("ArrowDown", { open: true, count: 3, active: 2 }).active,
    2,
  );
  assert.equal(
    comboboxKey("ArrowUp", { open: true, count: 3, active: 0 }).active,
    0,
  );
  assert.equal(
    comboboxKey("ArrowUp", { open: false, count: 3, active: -1 }).action,
    "none",
  );
  assert.equal(
    comboboxKey("Home", { open: true, count: 3, active: 1 }).action,
    "none",
  );
  assert.equal(
    comboboxKey("End", { open: true, count: 3, active: 1 }).action,
    "none",
  );
  assert.equal(
    comboboxKey("ArrowDown", { open: true, count: 0, active: -1 }).action,
    "block",
  );
});

test("Enter with nothing active, or the list closed, is left alone (a form may submit)", () => {
  assert.equal(
    comboboxKey("Enter", { open: true, count: 0, active: -1 }).action,
    "none",
  );
  assert.equal(
    comboboxKey("Enter", { open: false, count: 3, active: -1 }).action,
    "none",
  );
});

test("Escape: the first closes the list and keeps the text, the second is SearchInput's clear", () => {
  // Open → `dismiss`: the component stops the event in the capture phase, so
  // SearchInput's own Escape (which clears) never sees it; the text is untouched.
  assert.deepEqual(comboboxKey("Escape", { open: true, count: 3, active: 0 }), {
    action: "dismiss",
  });
  // Closed → `none`: the key reaches SearchInput, which clears the text.
  assert.deepEqual(
    comboboxKey("Escape", { open: false, count: 3, active: -1 }),
    {
      action: "none",
    },
  );
});

test("keys during IME composition belong to the IME", () => {
  for (const key of ["Enter", "Escape", "ArrowDown"]) {
    assert.equal(
      comboboxKey(key, { open: true, count: 3, active: 0, composing: true })
        .action,
      "none",
    );
  }
});

// ---------------------------------------------------------------------------
// onquery debounce
// ---------------------------------------------------------------------------

test("typing fires onquery once, with the last text, after the debounce", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fired = [];
  const debouncer = createQueryDebouncer(
    (text) => fired.push(text),
    () => 250,
  );
  debouncer.push("w");
  t.mock.timers.tick(100);
  debouncer.push("wa");
  t.mock.timers.tick(100);
  debouncer.push("wat");
  t.mock.timers.tick(249);
  assert.deepEqual(fired, []);
  t.mock.timers.tick(1);
  assert.deepEqual(fired, ["wat"]);
});

test("empty text fires at once and drops the pending query", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fired = [];
  const debouncer = createQueryDebouncer(
    (text) => fired.push(text),
    () => 250,
  );
  debouncer.push("wat");
  debouncer.push("  ");
  assert.deepEqual(fired, ["  "]);
  t.mock.timers.tick(500);
  assert.deepEqual(fired, ["  "], "the earlier text never fires");
});

test("cancel (teardown) drops a pending query; the delay is read on every push", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fired = [];
  let ms = 250;
  const debouncer = createQueryDebouncer(
    (text) => fired.push(text),
    () => ms,
  );
  debouncer.push("a");
  assert.equal(debouncer.pending, true);
  debouncer.cancel();
  t.mock.timers.tick(1000);
  assert.deepEqual(fired, []);
  ms = 0;
  debouncer.push("b");
  assert.deepEqual(fired, ["b"], "debounce 0 fires synchronously");
  assert.equal(queryDelay("x", 300), 300);
  assert.equal(queryDelay("", 300), 0);
});

test("live region sentence", () => {
  assert.equal(resultsMessage(0), "No results");
  assert.equal(resultsMessage(1), "1 result");
  assert.equal(resultsMessage(12), "12 results");
});

