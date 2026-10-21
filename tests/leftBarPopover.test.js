/**
 * LeftBarPopover: the collapsed bar's hover flyout takes the same optional
 * item fields as LeftBarItem's subroutes (icon, badge, variant, divider).
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";

const { default: LeftBarPopover } =
  await import("../src/components/navigation/LeftBarPopover.svelte");
const { default: Glyph } = await import("./fixtures/Glyph.svelte");

const { LeftBarState } = await import("../src/components/navigation/leftBar.svelte.js");

// Every LeftBar child takes the bar's state as its `bar` prop (0.11.0, no context).
const html = (props) => render(LeftBarPopover, { props: { bar: new LeftBarState(), ...props } }).body;

test("items carry icon, badge, variant and divider", () => {
  const body = html({
    visible: true,
    title: "Genji",
    items: [
      { label: "Pipeline", href: "/p/", icon: Glyph },
      { label: "Needs you", href: "/n/", icon: Glyph, badge: 2, variant: "warning", divider: true },
    ],
  });
  assert.equal((body.match(/class="popover-icon[^"]*"[^>]*data-glyph/g) ?? []).length, 2);
  assert.match(body, /<a href="\/n\/" class="popover-item[^"]*" data-variant="warning"/);
  assert.match(body, /<span class="popover-badge[^"]*">2<\/span>/);
  assert.match(body, /<li class="[^"]*\bdivided\b[^"]*">/);
});

test("plain items render label only", () => {
  const body = html({ visible: true, title: "More", items: [{ label: "Docs", href: "/d/" }] });
  assert.doesNotMatch(body, /popover-icon|popover-badge|data-variant|divided/);
  assert.match(body, /<span class="popover-label[^"]*">Docs<\/span>/);
});
