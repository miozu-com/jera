/**
 * Tooltip as the server renders it: the ARIA contract a focusable trigger
 * relies on. No DOM here; hover, focus, the delay and the top-layer placement
 * are checked in the browser (dash QA 2026-10-23: the FilterRow ⓘ opens on
 * hover and on keyboard focus) and placement by `tooltipPlacement.test.js`.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";
import { createRawSnippet } from "svelte";

const { default: Tooltip } =
  await import("../src/components/primitives/Tooltip.svelte");

/** A trigger that wires the id the snippet receives into `aria-describedby`. */
const trigger = createRawSnippet((describedBy) => ({
  render: () =>
    `<button type="button" class="info" aria-describedby="${describedBy() ?? ""}">i</button>`,
}));

const html = (props) => render(Tooltip, { props }).body;

test("the trigger is described by the always-present text", () => {
  const body = html({
    text: "Exact words the title must contain",
    children: trigger,
  });
  const describedBy = body.match(/aria-describedby="([^"]*)"/)?.[1];
  assert.ok(describedBy, "the snippet received no description id");
  const sr = body.match(
    new RegExp(`<span id="${describedBy}"[^>]*>([^<]*)</span>`),
  );
  assert.ok(sr, "no element carries the description id");
  assert.equal(sr[1], "Exact words the title must contain");
});

test("the bubble is not rendered until it is shown", () => {
  const body = html({ text: "Some help", children: trigger });
  assert.ok(!body.includes('role="tooltip"'));
  assert.ok(!body.includes("popover"));
});

test("no text: no description id for the trigger", () => {
  const body = html({ children: trigger });
  assert.match(body, /aria-describedby=""/);
  assert.ok(!body.includes("tooltip-sr"));
});

test("the wrapper forwards class and rest props", () => {
  const body = html({
    text: "x",
    class: "tip",
    "data-row": "words",
    children: trigger,
  });
  assert.match(body, /class="tooltip-wrapper tip[^"]*"/);
  assert.match(body, /data-row="words"/);
});
