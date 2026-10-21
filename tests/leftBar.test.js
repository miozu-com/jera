/**
 * LeftBar family, server-rendered: the bar hands its LeftBarState to every
 * snippet and each child takes it as the `bar` prop (0.11.0, no context).
 * A child without `bar` throws in development and renders nothing in production.
 */

import "./helpers/svelte-server.js";
import "./helpers/dev-env.js";
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";

const { default: Family } = await import("./fixtures/LeftBarFamily.svelte");
const { default: LeftBar, LeftBarState } = await import("../src/components/navigation/LeftBar.svelte");
const children = {
  LeftBarItem: { props: { href: "/a/", label: "Atlas" } },
  LeftBarSection: { props: { title: "Main" } },
  LeftBarGroup: { props: { title: "Accounts", items: [] } },
  LeftBarToggle: { props: {} },
  LeftBarPopover: { props: { visible: true, title: "Atlas", items: [{ label: "A", href: "/a/" }] } },
};
for (const name of Object.keys(children)) {
  children[name].component = (await import(`../src/components/navigation/${name}.svelte`)).default;
}

afterEach(() => {
  delete globalThis.__JERA_DEV__;
});

const html = (props = {}) => render(Family, { props }).body;

function tag(body, pattern) {
  const match = body.match(new RegExp(`<[^>]*${pattern.source}[^>]*>`));
  assert.ok(match, `no tag matching ${pattern}`);
  return match[0];
}
const attr = (tagText, name) => tagText.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? null;

test("LeftBarState is exported from the LeftBar module", () => {
  assert.equal(typeof LeftBarState, "function");
  assert.equal(typeof LeftBar, "function");
});

test("snippets receive the bar: header, items, section, group and toggle all render", () => {
  const body = html();
  assert.equal(attr(tag(body, /data-header/), "data-collapsed"), "false");
  assert.match(body, /<div class="section-header[^"]*"[^>]*>Main<\/div>/);
  assert.match(body, /class="nav-link[^"]*"/);
  assert.match(body, /<a href="\/home\/" class="nav-item/);
  assert.match(body, /class="group-title[^"]*"[^>]*>Accounts</);
  const toggle = tag(body, /class="collapse-toggle[^"]*"/);
  assert.equal(attr(toggle, "aria-label"), "Collapse sidebar");
  assert.equal(attr(toggle, "type"), "button");
});

test("split item wires its fold button to the sub-list id", () => {
  const body = html();
  const button = tag(body, /class="nav-toggle[^"]*"/);
  const list = tag(body, /class="subnav-list[^"]*"/);
  assert.ok(attr(list, "id"));
  assert.equal(attr(button, "aria-controls"), attr(list, "id"));
  assert.equal(attr(button, "aria-expanded"), "true");
});

test("initialCollapsed (SSR cookie) wins over collapsed and reaches every child", () => {
  const body = html({ collapsed: false, initialCollapsed: true });
  assert.match(tag(body, /class="workspace-sidebar[^"]*"/), /\bcollapsed\b/);
  assert.equal(attr(tag(body, /data-header/), "data-collapsed"), "true");
  assert.equal(attr(tag(body, /class="collapse-toggle[^"]*"/), "aria-label"), "Expand sidebar");
  // Collapsed: section title becomes a divider, labels and the sub-list hide,
  // the row is named by its title/aria-label instead.
  assert.doesNotMatch(body, /section-header|nav-label|subnav-list/);
  assert.match(body, /section-divider/);
  assert.equal(attr(tag(body, /href="\/home\/"/), "aria-label"), "Home");
});

test("collapsed without initialCollapsed renders the same as today", () => {
  const body = html({ collapsed: true });
  assert.match(tag(body, /class="workspace-sidebar[^"]*"/), /\bcollapsed\b/);
  assert.equal(attr(tag(body, /data-header/), "data-collapsed"), "true");
});

test("neither collapsed nor initialCollapsed: the bar it builds starts expanded", () => {
  const body = html();
  assert.doesNotMatch(tag(body, /class="workspace-sidebar[^"]*"/), /\bcollapsed\b/);
  assert.equal(attr(tag(body, /data-header/), "data-collapsed"), "false");
});

// Without `collapsed`, LeftBar never writes into an external bar (client effect,
// checked on the client runtime in leftBarSync.test.js): a bar built collapsed stays so.
test("a bar passed in (no collapsed prop) is the one the children see", () => {
  const bar = new LeftBarState({ collapsed: true });
  const body = html({ bar });
  assert.match(tag(body, /class="workspace-sidebar[^"]*"/), /\bcollapsed\b/);
  assert.equal(attr(tag(body, /class="collapse-toggle[^"]*"/), "aria-label"), "Expand sidebar");
  assert.equal(bar.collapsed, true);
});

for (const [name, { component, props }] of Object.entries(children)) {
  test(`${name} without \`bar\`: throws in dev with the fix`, () => {
    globalThis.__JERA_DEV__ = true;
    assert.throws(
      () => render(component, { props }).body,
      (error) => error.message.startsWith(`${name}: missing \`bar\` prop`) && /\{#snippet \w+\(bar\)\}/.test(error.message)
    );
  });

  test(`${name} without \`bar\`: renders nothing in production`, () => {
    const body = render(component, { props }).body;
    assert.doesNotMatch(body, /<(li|div|button|a)\b/);
  });

  test(`${name} with \`bar\`: renders`, () => {
    globalThis.__JERA_DEV__ = true;
    const body = render(component, { props: { bar: new LeftBarState(), ...props } }).body;
    assert.match(body, /<(li|div|button)\b/);
  });
}
