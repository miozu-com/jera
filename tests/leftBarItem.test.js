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

const { default: Glyph } = await import("./fixtures/Glyph.svelte");

test("split: a segmented pair — the link and the chevron are siblings in one frame", () => {
  const body = html({ href: "/a/", label: "Atlas", expandable: true, subroutes });
  // One frame holds exactly the two segments: the link, then the toggle.
  assert.match(
    body,
    /<div[^>]*class="nav-item split[^"]*"[^>]*>\s*(?:<!--[^>]*-->\s*)*<a[^>]*class="nav-link[\s\S]*?<\/a>\s*(?:<!--[^>]*-->\s*)*<button[^>]*class="nav-toggle/
  );
});

test("subroutes: icon, badge, variant and divider render on the sub-row", () => {
  const body = html({
    href: "/a/",
    label: "Genji",
    expandable: true,
    expanded: true,
    subroutes: [
      { label: "Pipeline", href: "/a/pipeline/", icon: Glyph },
      { label: "Needs you", href: "/a/needs/", icon: Glyph, badge: 3, variant: "warning", divider: true },
    ],
  });
  const glyphs = body.match(/<svg[^>]*class="subnav-icon[^"]*"[^>]*data-glyph/g) ?? [];
  assert.equal(glyphs.length, 2);
  assert.match(body, /width="16"/);
  const needs = tag(body, /href="\/a\/needs\/"/);
  assert.equal(attr(needs, "data-variant"), "warning");
  assert.equal(attr(tag(body, /href="\/a\/pipeline\/"/), "data-variant"), null);
  assert.match(body, /<li class="[^"]*\bdivided\b[^"]*">\s*(?:<!--[^>]*-->\s*)*<a[^>]*href="\/a\/needs\/"/);
  assert.match(body, /<span class="subnav-badge[^"]*">3<\/span>/);
  // Plain sub-routes keep a bare label and no badge.
  assert.equal((body.match(/subnav-badge/g) ?? []).length, 1);
});

test("subroutes without the new fields render as before (label only)", () => {
  const body = html({ href: "/a/", label: "Atlas", expandable: true, expanded: true, subroutes });
  assert.doesNotMatch(body, /subnav-icon|subnav-badge|data-variant="warning"|\bdivided\b/);
  assert.match(body, /<span class="subnav-label[^"]*">Needs fixing<\/span>/);
});
