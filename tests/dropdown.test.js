/**
 * DropdownItem checked roles and DropdownSub's trigger, as the server renders
 * them. No DOM here: hover timers, flipping and focus moves are not exercised;
 * these pin the ARIA contract a screen reader relies on.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";
import { createRawSnippet } from "svelte";

const { default: DropdownItem } =
  await import("../src/components/overlays/DropdownItem.svelte");
const { default: DropdownSub } =
  await import("../src/components/overlays/DropdownSub.svelte");

const html = (Component, props) => render(Component, { props }).body;
const snippet = (markup) => createRawSnippet(() => ({ render: () => markup }));

function button(body) {
  const match = body.match(/<button[^>]*>/);
  assert.ok(match, "no button rendered");
  return match[0];
}

function attr(tagText, name) {
  const match = tagText.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : null;
}

test("DropdownItem without checked stays a plain menuitem", () => {
  const body = html(DropdownItem, { children: snippet("<span>Edit</span>") });
  const tag = button(body);
  assert.equal(attr(tag, "role"), "menuitem");
  assert.equal(attr(tag, "aria-checked"), null);
  assert.ok(!body.includes("dropdown-item-check"));
});

test("DropdownItem checked is a menuitemradio with a check mark", () => {
  const on = html(DropdownItem, { checked: true, children: snippet("<span>Rows</span>") });
  assert.equal(attr(button(on), "role"), "menuitemradio");
  assert.equal(attr(button(on), "aria-checked"), "true");
  assert.ok(on.includes("<svg"));

  const off = html(DropdownItem, { checked: false, children: snippet("<span>Grid</span>") });
  assert.equal(attr(button(off), "aria-checked"), "false");
  assert.ok(off.includes("dropdown-item-check"), "unchecked keeps the slot");
  assert.ok(!off.includes("<svg"));
});

test("DropdownItem checkType=checkbox is a menuitemcheckbox", () => {
  const body = html(DropdownItem, {
    checked: true,
    checkType: "checkbox",
    children: snippet("<span>Show sold out</span>"),
  });
  assert.equal(attr(button(body), "role"), "menuitemcheckbox");
});

test("DropdownSub renders a closed menuitem that announces a submenu", () => {
  const body = html(DropdownSub, {
    label: "Views",
    meta: "Rows",
    "data-testid": "views",
    children: snippet('<button role="menuitem">Rows</button>'),
  });
  const tag = button(body);
  assert.equal(attr(tag, "role"), "menuitem");
  assert.equal(attr(tag, "aria-haspopup"), "menu");
  assert.equal(attr(tag, "aria-expanded"), "false");
  assert.equal(attr(tag, "aria-controls"), null);
  assert.equal(attr(tag, "data-testid"), "views", "rest props reach the item");
  assert.ok(body.includes("Views") && body.includes("Rows"));
  assert.ok(!body.includes('role="menu"'), "submenu is not rendered closed");
});

test("DropdownSub disabled is not focusable", () => {
  const tag = button(html(DropdownSub, { label: "Sort", disabled: true }));
  assert.equal(attr(tag, "tabindex"), "-1");
  assert.ok(/\sdisabled/.test(tag));
});
