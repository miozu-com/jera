/**
 * NavigationContainer + blocks, server-rendered: the container hands its
 * NavigationState and `collapsed` to each block as props (0.11.0, no context).
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";

const { default: NavigationContainer } =
  await import("../src/components/navigation/NavigationContainer.svelte");
const { default: WorkspaceMenu } = await import("../src/components/navigation/WorkspaceMenu.svelte");
const { default: NavCustom } = await import("./fixtures/NavCustom.svelte");
const { NavigationState } = await import("../src/utils/navigation.svelte.js");

const items = [
  { id: "home", label: "Home", href: "/home/" },
  { id: "settings", label: "Settings", href: "/settings/" },
];

function page({ collapsed = false, active = null } = {}) {
  const navigationState = new NavigationState({ items });
  // Sections start folded in NavigationState (its expandedSections map wins
  // over the block's defaultExpanded); open "main" to render its items.
  navigationState.toggleSection("main");
  if (active) navigationState.setActive(active);
  return render(NavigationContainer, {
    props: {
      navigationState,
      collapsed,
      blocks: [
        { type: "section", id: "main", title: "Main", items },
        { type: "custom", id: "extra", component: NavCustom },
      ],
    },
  }).body;
}

test("section block renders its items from the state it is handed", () => {
  const body = page({ active: "settings" });
  assert.match(body, /<span class="section-title[^"]*">Main<\/span>/);
  assert.match(body, /class="nav-label[^"]*"[^>]*>\s*Home\s*</);
  // The active item is read from the NavigationState prop (no context).
  assert.equal((body.match(/aria-current="page"/g) ?? []).length, 1);
});

test("collapsed reaches the container, the section and its items", () => {
  const body = page({ collapsed: true });
  assert.match(body, /<nav class="navigation-container[^"]*\bcollapsed\b/);
  assert.doesNotMatch(body, /section-title|nav-label/);
  assert.match(body, /<div class="section-divider[^"]*" title="Main">/);
  assert.match(body, /title="Home"/);
});

test("a block's own component gets navigationState and collapsed as props", () => {
  assert.match(page({ collapsed: true }), /data-custom(="")? data-collapsed="true" data-has-nav="true"/);
  assert.match(page(), /data-custom(="")? data-collapsed="false"/);
});

test("NavigationCustomBlock hands its component navigationState and isCollapsed", async () => {
  const { default: NavigationCustomBlock } =
    await import("../src/components/navigation/blocks/NavigationCustomBlock.svelte");
  const body = render(NavigationCustomBlock, {
    props: { block: { id: "x", component: NavCustom }, navigationState: new NavigationState(), collapsed: true },
  }).body;
  assert.match(body, /data-custom(="")? data-collapsed="true" data-has-nav="true"/);
});

test("WorkspaceMenu: collapsed is a prop (no Sidebar context)", () => {
  const open = render(WorkspaceMenu, { props: { workspace: { name: "Acme" } } }).body;
  const shut = render(WorkspaceMenu, { props: { workspace: { name: "Acme" }, collapsed: true } }).body;
  assert.doesNotMatch(open.match(/<div class="workspace-menu[^"]*"/)[0], /collapsed/);
  assert.match(shut.match(/<div class="workspace-menu[^"]*"/)[0], /\bcollapsed\b/);
  assert.doesNotMatch(shut, /in-sidebar/);
});
