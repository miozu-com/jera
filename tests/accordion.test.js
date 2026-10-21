/**
 * Accordion / AccordionItem without context: AccordionState unit behaviour,
 * and the server render of an Accordion handing its state to each item
 * through the children snippet argument (open set, aria-expanded,
 * aria-controls -> region id, aria-labelledby -> trigger id). An item without
 * `accordion` is a solo disclosure (its own bind:expanded), as before.
 *
 * The orphan guard (an item inside <Accordion> without the prop throws in dev)
 * runs in a client $effect after mount, so it is not reachable from a server
 * render; it is covered by reading the compiled client output below.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const { AccordionState } = await import("../src/components/navigation/accordion.svelte.js");
const { AccordionState: Reexported } = await import("../src/components/navigation/Accordion.svelte");
const { default: Fixture } = await import("./fixtures/AccordionWired.svelte");
const { default: AccordionItem } = await import("../src/components/navigation/AccordionItem.svelte");

const html = (props) => render(Fixture, { props }).body;

function tag(body, pattern) {
  const match = body.match(new RegExp(`<[^>]*${pattern.source}[^>]*>`));
  assert.ok(match, `no tag matching ${pattern}`);
  return match[0];
}

const attr = (tagText, name) => tagText.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? null;

test("AccordionState single: opening one closes the other; toggle closes", () => {
  const seen = [];
  const acc = new AccordionState({ onchange: (next) => seen.push(next) });
  acc.toggle("a");
  acc.toggle("b");
  assert.deepEqual(acc.expanded, ["b"]);
  acc.toggle("b");
  assert.deepEqual(acc.expanded, []);
  assert.deepEqual(seen, [["a"], ["b"], []]);
});

test("AccordionState multiple: items open independently; open/close are idempotent", () => {
  const seen = [];
  const acc = new AccordionState({ multiple: true, onchange: (next) => seen.push(next) });
  acc.open("a");
  acc.open("b");
  acc.open("b");
  assert.deepEqual(acc.expanded, ["a", "b"]);
  assert.ok(acc.isExpanded("a"));
  acc.close("a");
  acc.close("a");
  assert.deepEqual(acc.expanded, ["b"]);
  assert.equal(seen.length, 3);
});

test("AccordionState: sync() mirrors the owner's props", () => {
  const acc = new AccordionState();
  acc.sync({ expanded: ["x"], multiple: true });
  assert.deepEqual(acc.expanded, ["x"]);
  assert.equal(acc.multiple, true);
});

test("Accordion re-exports AccordionState from its module script", () => {
  assert.equal(Reexported, AccordionState);
});

test("server render: the open item is wired trigger <-> region; closed items have no region", () => {
  const body = html({ expanded: ["b"] });
  const root = tag(body, /class="jera-accordion[^"]*"/);
  assert.match(root, /faq/);
  assert.equal(attr(root, "data-testid"), "acc");

  const a = tag(body, /id="trigger-a"/);
  assert.equal(attr(a, "aria-expanded"), "false");
  assert.equal(attr(a, "aria-controls"), "content-a");
  assert.doesNotMatch(body, /id="content-a"/);

  const b = tag(body, /id="trigger-b"/);
  assert.equal(attr(b, "aria-expanded"), "true");
  assert.equal(attr(b, "aria-controls"), "content-b");
  const region = tag(body, /id="content-b"/);
  assert.equal(attr(region, "role"), "region");
  assert.equal(attr(region, "aria-labelledby"), "trigger-b");
  assert.match(body, /Body B/);
  assert.doesNotMatch(body, /Body A/);
  // Grouped items are not solo.
  assert.doesNotMatch(body, /accordion-item-solo/);
});

test("server render: multiple renders every expanded item", () => {
  const body = html({ expanded: ["a", "b"], multiple: true });
  assert.match(body, /Body A/);
  assert.match(body, /Body B/);
});

test("solo item (no accordion prop): own expanded state, generated ids still pair up", () => {
  const body = render(AccordionItem, { props: { title: "Solo", expanded: true } }).body;
  assert.match(tag(body, /class="accordion-item[^"]*"/), /accordion-item-solo/);
  const trigger = tag(body, /class="accordion-trigger[^"]*"/);
  assert.equal(attr(trigger, "aria-expanded"), "true");
  const id = attr(trigger, "id").replace(/^trigger-/, "");
  assert.equal(attr(trigger, "aria-controls"), `content-${id}`);
  assert.equal(attr(tag(body, /role="region"/), "aria-labelledby"), `trigger-${id}`);
});

test("orphan guard: the client build throws in dev on a solo item inside the Accordion", () => {
  const source = readFileSync(new URL("../src/components/navigation/Accordion.svelte", import.meta.url), "utf8");
  const { js } = compile(source, { generate: "client" });
  assert.match(js.code, /import\.meta\.env\?\.DEV/);
  assert.match(js.code, /accordion-item-solo/);
  assert.match(js.code, /throw new Error\(/);
});
