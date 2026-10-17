/**
 * ChoiceGrid and ChoiceList as the server renders them: roles, the roving
 * tab stop, checked/blocked state and the optional pieces.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";
import { createRawSnippet } from "svelte";

const { default: ChoiceGrid } = await import("../src/components/forms/ChoiceGrid.svelte");
const { default: ChoiceList } = await import("../src/components/forms/ChoiceList.svelte");

const html = (C, props) => render(C, { props }).body;
const raw = (markup) => createRawSnippet(() => ({ render: () => markup }));
const count = (body, re) => (body.match(re) || []).length;

const urls = ["/a.jpg", "/b.jpg", "/c.jpg"];

test("ChoiceGrid multi — group of checkboxes, one tab stop on the first pick", () => {
  const body = html(ChoiceGrid, { items: urls, selected: ["/b.jpg"], "aria-label": "Photos" });
  assert.match(body, /role="group"[^>]*aria-label="Photos"|aria-label="Photos"[^>]*role="group"/);
  assert.equal(count(body, /role="checkbox"/g), 3);
  assert.equal(count(body, /tabindex="0"/g), 1);
  assert.match(body, /aria-checked="true"[^>]*aria-label="Option 2"[^>]*tabindex="0"/);
  assert.equal(count(body, /<img src="\/[abc]\.jpg"/g), 3);
});

test("ChoiceGrid single — radiogroup of radios, first tile tabbable when none picked", () => {
  const body = html(ChoiceGrid, { items: urls, mode: "single", label: () => null });
  assert.match(body, /role="radiogroup"/);
  assert.equal(count(body, /role="radio"/g), 3);
  assert.doesNotMatch(body, /aria-label="Option/);
  assert.match(body, /aria-checked="false"[^>]*tabindex="0"/);
});

test("ChoiceGrid — max blocks unpicked tiles, disabled(item) blocks any unpicked", () => {
  const full = html(ChoiceGrid, { items: urls, selected: ["/a.jpg"], max: 1 });
  assert.equal(count(full, /aria-disabled="true"/g), 2);
  const one = html(ChoiceGrid, { items: urls, disabled: (u) => u === "/c.jpg" });
  assert.equal(count(one, /aria-disabled="true"/g), 1);
});

test("ChoiceGrid — tile and addTile snippets replace the image and add a dashed tile", () => {
  const body = html(ChoiceGrid, {
    items: urls,
    tile: createRawSnippet((item) => ({ render: () => `<b>${item()}</b>` })),
    addTile: raw("<span>Add</span>"),
    addDisabled: true,
  });
  assert.doesNotMatch(body, /<img/);
  assert.match(body, /<b>\/a\.jpg<\/b>/);
  assert.match(body, /class="choice-tile choice-add[^"]*"[^>]*disabled/);
});

test("ChoiceList multi — checkbox rows labelled by the title, footer gets the count", () => {
  const items = [
    { key: "x", label: "Front", src: "/x.jpg" },
    { key: "y", label: "Back" },
  ];
  const body = html(ChoiceList, {
    title: "Choose",
    subtitle: "Pick any",
    items,
    selected: ["x"],
    footer: createRawSnippet((s) => ({ render: () => `<i>${s().count}</i>` })),
  });
  assert.match(body, /<h2[^>]*id="([^"]+)-title"/);
  assert.match(body, /<ul[^>]*aria-labelledby="[^"]+-title"/);
  assert.equal(count(body, /type="checkbox"/g), 2);
  assert.equal(count(body, /<img/g), 1);
  assert.match(body, /<i>1<\/i>/);
});

test("ChoiceList none — no checkboxes, actions per row, bare drops the chrome", () => {
  const body = html(ChoiceList, {
    mode: "none",
    bare: true,
    items: [{ key: "x", label: "One" }],
    actions: raw("<button>Use</button>"),
  });
  assert.doesNotMatch(body, /type="checkbox"/);
  assert.match(body, /choice-list--bare/);
  assert.match(body, /<button>Use<\/button>/);
});

test("ChoiceList — max disables unpicked rows' checkboxes", () => {
  const body = html(ChoiceList, {
    items: [{ key: "a", label: "A" }, { key: "b", label: "B" }],
    selected: ["a"],
    max: 1,
  });
  assert.equal(count(body, /<input[^>]*disabled/g), 1);
});
