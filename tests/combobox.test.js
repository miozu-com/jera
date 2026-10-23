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
  multipleKey,
  hasEntry,
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
  const { default: TwoComboboxes } =
    await import("./fixtures/TwoComboboxes.svelte");
  const body = render(TwoComboboxes, { props: { items } }).body;
  const controls = [...body.matchAll(/<input[^>]*>/g)].map((m) =>
    attr(m[0], "aria-controls"),
  );
  const optionIds = [...body.matchAll(/<li[^>]*role="option"[^>]*>/g)].map(
    (m) => attr(m[0], "id"),
  );
  assert.equal(new Set(controls).size, 2, `listbox ids differ: ${controls}`);
  assert.ok(controls.every((id) => body.includes(`id="${id}"`)));
  assert.equal(optionIds.length, 6);
  assert.equal(
    new Set(optionIds).size,
    6,
    "option ids are unique across instances",
  );
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

// ---------------------------------------------------------------------------
// Multiple mode (chips)
// ---------------------------------------------------------------------------

const metals = [
  { key: "silver", label: "sterling silver" },
  { key: "gold", label: "gold" },
  { key: "steel", label: "stainless steel" },
];
const byKey = (m) => m.key ?? m.label;

/** Hydration comments and the CSS-hash class differ between builds; the DOM does not. */
function dom(body) {
  return body
    .replace(/<!--[^>]*-->/g, "")
    .replace(/svelte-[a-z0-9]+/g, "svelte-H");
}

// Single-mode markup captured from revision 1 (before `multiple` existed) for
// the props below, normalised with `dom()`.
const SINGLE_MODE_REV1 =
  '<div class="combobox combobox-sm svelte-H"><search class="search-input search-input-sm svelte-H"><span class="search-icon svelte-H"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-H"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span> <input type="search" value="wa" placeholder="Find" class="search-field svelte-H" id="cat" role="combobox" aria-expanded="true" aria-controls="s1-listbox" aria-autocomplete="list" aria-activedescendant="s1-option-0" autocomplete="off" spellcheck="false"/> <button type="button" class="search-clear svelte-H" aria-label="Clear search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></search> <div class="combobox-popup svelte-H">  <ul id="s1-listbox" role="listbox" aria-label="Categories" class="combobox-list svelte-H"><li id="s1-option-0" role="option" aria-selected="false" data-index="0" class="combobox-option svelte-H active"><span class="combobox-option-content svelte-H">Watches</span> </li><li id="s1-option-1" role="option" aria-selected="true" data-index="1" class="combobox-option svelte-H"><span class="combobox-option-content svelte-H">Wrist Watches</span> <svg class="combobox-check svelte-H" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></li></ul> </div> <span class="combobox-status svelte-H" role="status" aria-live="polite"></span></div>';

test("single mode renders the same DOM as revision 1", () => {
  const body = html({
    open: true,
    items: [
      { id: "a", label: "Watches" },
      { id: "b", label: "Wrist Watches" },
    ],
    value: "b",
    label: "Categories",
    id: "cat",
    query: "wa",
    placeholder: "Find",
  });
  assert.equal(dom(body), SINGLE_MODE_REV1);
});

test("multipleKey: Backspace removes the last chip only in an empty field; Delete never", () => {
  const base = { open: true, count: 3, active: 0, values: metals.slice(0, 2) };
  assert.deepEqual(multipleKey("Backspace", { ...base, query: "" }), {
    action: "remove-last",
  });
  assert.deepEqual(multipleKey("Backspace", { ...base, query: "go" }), {
    action: "none",
  });
  assert.deepEqual(
    multipleKey("Backspace", { ...base, query: "", values: [] }),
    { action: "none" },
  );
  assert.deepEqual(multipleKey("Delete", { ...base, query: "" }), {
    action: "none",
  });
});

test("multipleKey: Enter picks the active option, else adds custom text when allowed", () => {
  assert.deepEqual(
    multipleKey("Enter", {
      open: true,
      count: 3,
      active: 1,
      query: "go",
      values: [],
    }),
    { action: "pick", active: 1 },
  );
  const noOption = {
    open: true,
    count: 0,
    active: -1,
    query: "tungsten",
    values: [],
  };
  assert.deepEqual(multipleKey("Enter", { ...noOption, allowCustom: true }), {
    action: "custom",
  });
  assert.deepEqual(multipleKey("Enter", noOption), { action: "none" });
  assert.deepEqual(
    multipleKey("Enter", { ...noOption, query: "   ", allowCustom: true }),
    { action: "none" },
    "blank text adds nothing",
  );
  assert.deepEqual(
    multipleKey("Enter", {
      open: false,
      count: 3,
      active: -1,
      query: "oak",
      values: [],
      allowCustom: true,
    }),
    { action: "custom" },
    "a closed list has no active option",
  );
});

test("Enter on a stale list (typed text still debouncing or loading) never picks its first option", () => {
  // Review 2026-10-23 #4: "gold" + Enter inside the debounce picked the default list's "silver".
  const stale = {
    open: true,
    count: 3,
    active: 0,
    query: "gold",
    values: [],
    stale: true,
  };
  assert.deepEqual(multipleKey("Enter", { ...stale, allowCustom: true }), {
    action: "custom",
  });
  assert.deepEqual(multipleKey("Enter", stale), { action: "block" });
  assert.deepEqual(
    multipleKey("Enter", {
      ...stale,
      allowCustom: true,
      values: [1, 2],
      max: 2,
    }),
    { action: "refuse", reason: "max" },
  );
  assert.deepEqual(
    multipleKey("Enter", { ...stale, query: "", allowCustom: true }),
    { action: "pick", active: 0 },
    "an empty field's list is the default one, never stale",
  );
  assert.deepEqual(
    multipleKey("ArrowDown", stale),
    { action: "move", active: 1 },
    "arrows still move through what is shown",
  );
  assert.deepEqual(
    comboboxKey("Enter", { open: true, count: 3, active: 0, stale: true }),
    { action: "block" },
    "single mode blocks too",
  );
});

test("multipleKey: at max a pick and a custom entry are refused; unpicking a chip is not", () => {
  const atMax = { values: metals.slice(0, 2), max: 2, allowCustom: true };
  assert.deepEqual(
    multipleKey("Enter", {
      ...atMax,
      open: true,
      count: 3,
      active: 2,
      query: "",
    }),
    { action: "refuse", reason: "max" },
  );
  assert.deepEqual(
    multipleKey("Enter", {
      ...atMax,
      open: true,
      count: 0,
      active: -1,
      query: "oak",
    }),
    { action: "refuse", reason: "max" },
  );
  assert.deepEqual(
    multipleKey("Enter", {
      ...atMax,
      open: true,
      count: 3,
      active: 0,
      query: "",
      activeSelected: true,
    }),
    { action: "pick", active: 0 },
  );
});

test("multipleKey: IME composition owns every key; other keys delegate to comboboxKey", () => {
  for (const key of ["Enter", "Backspace", "Escape", "ArrowDown"]) {
    assert.equal(
      multipleKey(key, {
        open: true,
        count: 3,
        active: 0,
        query: "",
        values: metals,
        allowCustom: true,
        composing: true,
      }).action,
      "none",
    );
  }
  const state = { open: true, count: 3, active: 0 };
  for (const key of ["ArrowDown", "ArrowUp", "Escape", "Home"]) {
    assert.deepEqual(
      multipleKey(key, { ...state, query: "", values: [] }),
      comboboxKey(key, state),
    );
  }
});

test("hasEntry compares by getKey", () => {
  assert.equal(hasEntry(metals, { key: "gold", label: "Gold!" }, byKey), true);
  assert.equal(hasEntry(metals, { key: null, label: "oak" }, byKey), false);
});

test("multiple: chips in a labelled group, each with a Remove button; picked options are aria-selected", () => {
  const body = html({
    multiple: true,
    open: true,
    items: metals,
    values: [metals[0], metals[1]],
    getKey: byKey,
    label: "Material",
    chipLabel: "Materials",
  });
  const group = tag(body, /role="group"/);
  assert.equal(attr(group, "aria-label"), "Materials");
  assert.match(body, /class="combobox [^"]*combobox-multiple/);
  assert.equal(
    attr(tag(body, /role="listbox"/), "aria-multiselectable"),
    "true",
  );
  const removes = [...body.matchAll(/aria-label="(Remove [^"]*)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual(removes, ["Remove sterling silver", "Remove gold"]);
  const options = [...body.matchAll(/<li[^>]*role="option"[^>]*>/g)].map(
    (m) => m[0],
  );
  assert.deepEqual(
    options.map((o) => attr(o, "aria-selected")),
    ["true", "true", "false"],
  );
  assert.equal(
    body.indexOf('role="group"') < body.indexOf('role="combobox"'),
    true,
    "chips come before the field",
  );
});

test("multiple: no values renders no chip group; value is ignored", () => {
  const body = html({
    multiple: true,
    open: true,
    items: metals,
    value: "gold",
    getKey: byKey,
  });
  assert.doesNotMatch(body, /role="group"/);
  const options = [...body.matchAll(/<li[^>]*role="option"[^>]*>/g)].map(
    (m) => m[0],
  );
  assert.deepEqual(
    options.map((o) => attr(o, "aria-selected")),
    ["false", "false", "false"],
  );
});

test("multiple: the chip snippet replaces the default chip", () => {
  const chip = createRawSnippet((entry) => ({
    render: () => `<span class="mine">${entry().label} · Must</span>`,
  }));
  const body = html({
    multiple: true,
    values: [metals[1]],
    getKey: byKey,
    chip,
  });
  assert.match(body, /<span class="mine">gold · Must<\/span>/);
  assert.doesNotMatch(body, /Remove gold/);
});

test("multiple: at max the field is readonly with no placeholder", () => {
  const full = tag(
    html({
      multiple: true,
      values: metals.slice(0, 2),
      max: 2,
      getKey: byKey,
      placeholder: "Any",
    }),
    /role="combobox"/,
  );
  assert.notEqual(attr(full, "readonly"), null);
  assert.equal(attr(full, "placeholder"), "");
  const room = tag(
    html({
      multiple: true,
      values: metals.slice(0, 1),
      max: 2,
      getKey: byKey,
      placeholder: "Any",
    }),
    /role="combobox"/,
  );
  assert.equal(attr(room, "readonly"), null);
  assert.equal(attr(room, "placeholder"), "Any");
});
