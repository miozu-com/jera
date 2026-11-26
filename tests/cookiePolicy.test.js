/**
 * cookiePolicy: the app's consent rule gates jera's two preference cookies
 * (ThemeState `miozu-theme`, LeftBarState `cookieKey`). No rule = write, as
 * before; a refused write keeps the preference in memory and localStorage.
 */

import "./helpers/svelte-server.js";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const { setCookiePolicy, cookieAllowed, writeCookie } =
  await import("../src/utils/cookiePolicy.js");
const { LeftBarState } =
  await import("../src/components/navigation/leftBar.svelte.js");
const { ThemeState } = await import("../src/utils/reactive.svelte.js");

let store;
let writes;
beforeEach(() => {
  store = new Map();
  writes = [];
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  globalThis.window = {};
  globalThis.document = {
    get cookie() {
      return writes.at(-1) ?? "";
    },
    set cookie(v) {
      writes.push(v);
    },
    documentElement: { setAttribute() {}, style: {} },
  };
});
afterEach(() => {
  setCookiePolicy(null);
  delete globalThis.localStorage;
  delete globalThis.window;
  delete globalThis.document;
});

test("no rule registered: every cookie is allowed and written", () => {
  assert.equal(cookieAllowed("miozu-theme"), true);
  assert.equal(writeCookie("a", "1", { maxAge: 60 }), true);
  assert.deepEqual(writes, ["a=1;path=/;max-age=60;SameSite=Lax"]);
});

test("the rule gets the name and category; a refusal skips the write", () => {
  const seen = [];
  setCookiePolicy((c) => (seen.push(c), false));
  assert.equal(writeCookie("miozu-theme", "dark", { maxAge: 60 }), false);
  assert.deepEqual(writes, []);
  assert.deepEqual(seen, [{ name: "miozu-theme", category: "functional" }]);
});

test("deleting (maxAge 0) is always allowed", () => {
  setCookiePolicy(() => false);
  assert.equal(writeCookie("a", "", { maxAge: 0 }), true);
  assert.deepEqual(writes, ["a=;path=/;max-age=0;SameSite=Lax"]);
});

test("a rule that throws refuses; null drops the rule", () => {
  setCookiePolicy(() => {
    throw new Error("unreadable");
  });
  assert.equal(cookieAllowed("a"), false);
  setCookiePolicy(null);
  assert.equal(cookieAllowed("a"), true);
});

test("server (no document): nothing is written, no throw", () => {
  delete globalThis.document;
  assert.equal(writeCookie("a", "1", { maxAge: 60 }), false);
});

test("LeftBar collapse: refused cookie, the bar still collapses and localStorage keeps it", () => {
  setCookiePolicy(() => false);
  const bar = new LeftBarState({
    persistKey: "sidebarCollapsed",
    cookieKey: "sidebarCollapsed",
  });
  bar.toggle();
  assert.equal(bar.collapsed, true);
  assert.equal(store.get("sidebarCollapsed"), "true");
  assert.deepEqual(writes, []);
  setCookiePolicy(() => true);
  bar.toggle();
  assert.deepEqual(writes, [
    "sidebarCollapsed=0;path=/;max-age=2592000;SameSite=Lax",
  ]);
});

test("theme: refused cookie, the theme still changes and localStorage keeps it", () => {
  setCookiePolicy(({ category }) => category !== "functional");
  const theme = new ThemeState("dark");
  theme.set("light");
  assert.equal(theme.current, "light");
  assert.equal(store.get("miozu-theme"), "light");
  assert.deepEqual(writes, []);
  setCookiePolicy(null);
  theme.set("dark");
  assert.deepEqual(writes, [
    "miozu-theme=dark;path=/;max-age=31536000;SameSite=Lax",
  ]);
});
