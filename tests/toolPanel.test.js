/**
 * ToolPanel and HoverCard: the markup and ARIA wiring as the server renders
 * them. There is no DOM here, so the popover toggling, focus moves and
 * delegated pointer handling are not exercised; these tests pin the contract
 * a screen reader and a consumer's snippet rely on.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";
import { createRawSnippet } from "svelte";

const { default: ToolPanel } =
  await import("../src/components/overlays/ToolPanel.svelte");
const { default: HoverCard } =
  await import("../src/components/overlays/HoverCard.svelte");

const html = (Component, props) => render(Component, { props }).body;
const snippet = (markup) => createRawSnippet(() => ({ render: () => markup }));
const footer = createRawSnippet(() => ({
  render: () => '<button type="button" class="done">Done</button>',
}));

function tag(body, pattern) {
  const match = body.match(new RegExp(`<[^>]*${pattern.source}[^>]*>`));
  assert.ok(match, `no tag matching ${pattern}`);
  return match[0];
}

function attr(tagText, name) {
  const match = tagText.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : null;
}

test("ToolPanel: the trigger controls a popover=auto dialog named by the label", () => {
  const body = html(ToolPanel, { label: "Filters", children: snippet("<p>body</p>") });
  const panel = tag(body, /role="dialog"/);
  assert.equal(attr(panel, "popover"), "auto");
  assert.equal(attr(panel, "aria-label"), "Filters");
  const id = attr(panel, "id");
  assert.ok(id);
  const button = tag(body, /popovertarget=/);
  assert.equal(attr(button, "popovertarget"), id);
  assert.equal(attr(button, "aria-controls"), id);
  assert.equal(attr(button, "aria-expanded"), "false");
  assert.equal(attr(button, "aria-haspopup"), "dialog");
  assert.match(body, /<p>body<\/p>/);
});

test("ToolPanel: panelLabel names the dialog; hideLabel makes an icon-only button", () => {
  const body = html(ToolPanel, {
    label: "Columns",
    panelLabel: "Columns and density",
    hideLabel: true,
  });
  assert.equal(attr(tag(body, /role="dialog"/), "aria-label"), "Columns and density");
  const button = tag(body, /popovertarget=/);
  assert.equal(attr(button, "aria-label"), "Columns");
  assert.doesNotMatch(body, /class="label/);
});

test("ToolPanel: count renders with its screen-reader suffix", () => {
  const body = html(ToolPanel, { label: "Filters", count: 3, countLabel: "on" });
  assert.match(body, /class="count[^"]*">3<span class="sr-only[^"]*">\u00a0on<\/span>/);
  assert.doesNotMatch(html(ToolPanel, { label: "Filters", count: null }), /class="count/);
});

test("ToolPanel: footer renders on the default face, pinned after the body", () => {
  const body = html(ToolPanel, { label: "Refine", footer });
  assert.match(body, /class="body[^"]*">.*<\/div>\s*(<!--[^>]*-->)*\s*<div class="foot[^"]*">.*class="done"/s);
});

test("ToolPanel: a custom trigger snippet receives the wiring", () => {
  let received = null;
  const trigger = createRawSnippet((attrs) => {
    received = attrs();
    return { render: () => '<button type="button" class="mine">x</button>' };
  });
  const body = html(ToolPanel, { label: "Columns", trigger });
  const id = attr(tag(body, /role="dialog"/), "id");
  assert.match(body, /class="mine"/);
  assert.equal(received.popovertarget, id);
  assert.equal(received["aria-controls"], id);
  assert.equal(received["aria-expanded"], false);
});

test("ToolPanel: align start and rest props reach the panel", () => {
  const body = html(ToolPanel, { label: "Refine", align: "start", "data-x": "1", class: "mine" });
  const panel = tag(body, /role="dialog"/);
  assert.match(attr(panel, "class"), /jera-tool-panel mine/);
  assert.match(attr(panel, "class"), /\bstart\b/);
  assert.equal(attr(panel, "data-x"), "1");
});

test("ToolPanel sheet: a Sheet dialog with a title, no popover; hideTrigger drops the button", () => {
  const body = html(ToolPanel, { label: "Refine", sheet: true, footer });
  assert.doesNotMatch(body, /popover="auto"/);
  assert.match(body, /<dialog[^>]*aria-label="Refine"/);
  assert.match(body, /<h2 class="sheet-title[^"]*">Refine<\/h2>/);
  assert.match(body, /aria-haspopup="dialog"/);
  const hidden = html(ToolPanel, { label: "Refine", sheet: true, hideTrigger: true });
  assert.doesNotMatch(hidden, /aria-haspopup/);
});

test("HoverCard: a manual-popover tooltip, empty until a target resolves", () => {
  const body = html(HoverCard, {
    frame: null,
    resolve: () => null,
    body: snippet("<p>never</p>"),
    width: 300,
    class: "mine",
  });
  const card = tag(body, /role="tooltip"/);
  assert.equal(attr(card, "popover"), "manual");
  assert.ok(attr(card, "id"));
  assert.match(attr(card, "class"), /jera-hover-card mine/);
  assert.match(attr(card, "style"), /--hover-card-w: 300px/);
  assert.doesNotMatch(body, /never/);
});

test("ToolPanel: an icon-only face with a count names both (aria-label replaces the pill)", () => {
  const body = html(ToolPanel, { label: "Filters", hideLabel: true, count: 3 });
  assert.equal(attr(tag(body, /popovertarget=/), "aria-label"), "Filters, 3 active");
  const none = html(ToolPanel, { label: "Filters", hideLabel: true, count: 0 });
  assert.equal(attr(tag(none, /popovertarget=/), "aria-label"), "Filters");
});

test("ToolPanel: the panel can take focus itself when it holds no control", () => {
  const body = html(ToolPanel, { label: "About", children: snippet("<p>text only</p>") });
  assert.equal(attr(tag(body, /role="dialog"/), "tabindex"), "-1");
});

test("HoverCard: a caller id never replaces the card id aria-describedby points at", () => {
  const body = html(HoverCard, {
    frame: null,
    resolve: () => null,
    body: snippet(""),
    id: "theirs",
  });
  const card = tag(body, /role="tooltip"/);
  assert.match(attr(card, "id"), /^jera-hover-card-/);
});
