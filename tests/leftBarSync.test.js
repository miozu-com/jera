/**
 * LeftBar's parent <-> bar `collapsed` sync (syncCollapsed), run on the CLIENT
 * runtime: effects never run under svelte/server, so this file compiles the
 * rune module for the client and drives it inside `$effect.root` + flushSync.
 * No DOM is needed: syncCollapsed only creates effects.
 */

import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { compileModule } from "svelte/compiler";
import { test } from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const svelteDir = require.resolve("svelte/package.json").replace(/package\.json$/, "");
const clientIndex = pathToFileURL(`${svelteDir}src/index-client.js`).href;

registerHooks({
  // `untrack` must come from the client runtime the compiled module uses.
  resolve(specifier, context, nextResolve) {
    if (specifier === "svelte") return { url: clientIndex, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.endsWith(".svelte.js")) return nextLoad(url, context);
    const filename = fileURLToPath(url);
    const { js } = compileModule(readFileSync(filename, "utf8"), { filename, generate: "client" });
    return { format: "module", source: js.code, shortCircuit: true };
  },
});

const { LeftBarState, syncCollapsed } = await import("../src/components/navigation/leftBar.svelte.js");
const { flushSync } = await import("svelte");
const { effect_root } = await import("svelte/internal/client");

/**
 * Mount the sync the way LeftBar does. The parent's bindable `collapsed` prop
 * is stood in for by a second LeftBarState's `$state` field (any reactive cell
 * would do; undefined = the prop was not passed).
 */
function mountSync({ seed, collapsed, skipFirst, bar }) {
  const parent = new LeftBarState();
  parent.collapsed = collapsed;
  const state = bar ?? new LeftBarState({ collapsed: seed ?? collapsed ?? false });
  const stop = effect_root(() =>
    syncCollapsed(
      state,
      () => parent.collapsed,
      (value) => (parent.collapsed = value),
      { skipFirst }
    )
  );
  flushSync();
  return { bar: state, parent, setFromParent: (value) => (parent.collapsed = value), stop };
}

test("seeded bar (initialCollapsed): the seed wins the first run over a stale bound value", () => {
  const s = mountSync({ seed: true, collapsed: false, skipFirst: true });
  assert.equal(s.bar.collapsed, true);
  assert.equal(s.parent.collapsed, true, "bar -> parent reflects the seed");
  s.stop();
});

test("seeded bar: a later parent write to collapsed reaches the bar (skip is first-run only)", () => {
  const s = mountSync({ seed: true, collapsed: false, skipFirst: true });
  s.setFromParent(false);
  flushSync();
  assert.equal(s.bar.collapsed, false);
  s.setFromParent(true);
  flushSync();
  assert.equal(s.bar.collapsed, true);
  s.stop();
});

test("seeded bar: a toggle through the bar reaches the parent", () => {
  const s = mountSync({ seed: true, collapsed: false, skipFirst: true });
  s.bar.collapse();
  s.bar.expand();
  flushSync();
  assert.equal(s.parent.collapsed, false);
  s.stop();
});

test("unseeded bar: the passed collapsed value drives the bar from the first run", () => {
  const s = mountSync({ collapsed: true, skipFirst: false, bar: new LeftBarState({ collapsed: false }) });
  assert.equal(s.bar.collapsed, true);
  s.setFromParent(false);
  flushSync();
  assert.equal(s.bar.collapsed, false);
  s.stop();
});

test("external bar without collapsed: never written by the parent side", () => {
  const bar = new LeftBarState({ collapsed: true });
  const s = mountSync({ collapsed: undefined, skipFirst: false, bar });
  assert.equal(bar.collapsed, true);
  s.stop();
});
