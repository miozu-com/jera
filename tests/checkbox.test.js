/**
 * Checkbox `indeterminate` + `size` (revision 4) and Button `ref` (revision 13),
 * as the server renders them. The input's `indeterminate` is a DOM property set
 * in an effect, so here only the drawn bar and the classes are asserted; the
 * property itself is covered by the dash table's component tests.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";
import { createRawSnippet } from "svelte";

const { default: Checkbox } =
  await import("../src/components/forms/Checkbox.svelte");
const { default: Button } =
  await import("../src/components/primitives/Button.svelte");

const html = (C, props) => render(C, { props }).body;

test("Checkbox — indeterminate draws the bar, not the tick, and shows the icon", () => {
  const body = html(Checkbox, { indeterminate: true, "aria-label": "Select all" });
  assert.match(body, /d="M5 12h14"/);
  assert.doesNotMatch(body, /d="M20 6 9 17l-5-5"/);
  assert.match(body, /checkbox-icon-visible/);
  assert.match(body, /aria-label="Select all"/);
});

test("Checkbox — default draws the tick, hidden until checked", () => {
  const off = html(Checkbox, {});
  assert.match(off, /d="M20 6 9 17l-5-5"/);
  assert.doesNotMatch(off, /checkbox-icon-visible/);
  assert.match(html(Checkbox, { checked: true }), /checkbox-icon-visible/);
});

test("Checkbox — size sm adds checkbox-sm; md (default) does not", () => {
  assert.match(html(Checkbox, { size: "sm" }), /class="[^"]*checkbox-wrapper[^"]*checkbox-sm/);
  assert.doesNotMatch(html(Checkbox, {}), /checkbox-sm/);
});

test("Button — ref is accepted and rest attributes still land on the button", () => {
  const children = createRawSnippet(() => ({ render: () => "<span>Load 20 more</span>" }));
  const body = html(Button, {
    ref: null,
    variant: "ghost",
    size: "sm",
    popovertarget: "m-1",
    "data-on": true,
    children,
  });
  assert.match(body, /<button[^>]*class="jera-btn ghost sm/);
  assert.match(body, /popovertarget="m-1"/);
  assert.match(body, /data-on/);
});
