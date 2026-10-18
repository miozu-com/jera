/**
 * LeftBarItem: the element shapes as the server renders them. The split row
 * (expandable + href) is a link plus a sibling fold button; the older shapes
 * must render as before (non-breaking for existing consumers).
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";

const { default: LeftBarItem } =
  await import("../src/components/navigation/LeftBarItem.svelte");

const html = (props) => render(LeftBarItem, { props }).body;

function tag(body, pattern) {
  const match = body.match(new RegExp(`<[^>]*${pattern.source}[^>]*>`));
  assert.ok(match, `no tag matching ${pattern}`);
  return match[0];
}

function attr(tagText, name) {
  const match = tagText.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : null;
}

const subroutes = [
  { label: "Needs fixing", href: "/a/fix/" },
  { label: "Collections", href: "/a/collections/" },
];

test("split: expandable + href renders the name as a link and a separate fold button", () => {
  const body = html({ href: "/a/", label: "Atlas", expandable: true, expanded: true, subroutes });
  const link = tag(body, /class="nav-link[^"]*"/);
  assert.equal(attr(link, "href"), "/a/");
  assert.match(body, /<a[^>]*class="nav-link[^"]*"[^>]*>[\s\S]*Atlas[\s\S]*<\/a>/);
  const button = tag(body, /class="nav-toggle[^"]*"/);
  assert.equal(attr(button, "type"), "button");
  assert.equal(attr(button, "aria-expanded"), "true");
  assert.equal(attr(button, "aria-label"), "Show Atlas pages");
  const list = tag(body, /class="subnav-list[^"]*"/);
  assert.ok(attr(list, "id"));
  assert.equal(attr(button, "aria-controls"), attr(list, "id"));
  // The fold button is not inside the link.
  assert.doesNotMatch(body, /<a[^>]*nav-link[^>]*>(?:(?!<\/a>)[\s\S])*<button/);
});

test("split: active marks the link aria-current; folded hides the sub-list", () => {
  const body = html({ href: "/a/", label: "Atlas", expandable: true, active: true, subroutes });
  assert.equal(attr(tag(body, /class="nav-link[^"]*"/), "aria-current"), "page");
  assert.match(tag(body, /class="nav-item split[^"]*"/), /active/);
  assert.equal(attr(tag(body, /class="nav-toggle[^"]*"/), "aria-expanded"), "false");
  assert.doesNotMatch(body, /subnav-list/);
});

test("split: a lit sub-route carries aria-current, toggleLabel names the button", () => {
  const body = html({
    href: "/a/",
    label: "Atlas",
    expandable: true,
    expanded: true,
    subroutes,
    toggleLabel: "Atlas pages",
    isActiveRoute: (href) => href === "/a/fix/",
  });
  assert.equal(attr(tag(body, /href="\/a\/fix\/"/), "aria-current"), "page");
  assert.equal(attr(tag(body, /href="\/a\/collections\/"/), "aria-current"), null);
  assert.equal(attr(tag(body, /class="nav-toggle[^"]*"/), "aria-label"), "Atlas pages");
});

test("expandable without href keeps the single button shape", () => {
  const body = html({ label: "Services", expandable: true, expanded: true, subroutes });
  assert.match(body, /<button[^>]*class="nav-item expandable/);
  assert.doesNotMatch(body, /nav-link|nav-toggle/);
  assert.match(body, /subnav-list/);
});

test("href without expandable stays a plain link", () => {
  const body = html({ href: "/home/", label: "Home", active: true });
  const link = tag(body, /class="nav-item[^"]*"/);
  assert.ok(link.startsWith("<a"));
  assert.equal(attr(link, "href"), "/home/");
  assert.doesNotMatch(body, /<button/);
});
