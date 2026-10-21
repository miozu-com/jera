/**
 * Toast singleton without context: getToastState() is one shared instance in
 * the browser and a fresh, never-cached instance on the server (SSR must not
 * carry one request's toasts into the next). The context shims are gone.
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";

const mod = await import("../src/components/feedback/Toast.svelte");
const { default: Toast, getToastState, resetToastState, ToastController } = mod;

function asBrowser(fn) {
  globalThis.window = {};
  globalThis.document = {};
  try {
    return fn();
  } finally {
    delete globalThis.window;
    delete globalThis.document;
    resetToastState();
  }
}

test("server: every call returns a fresh controller, never the cached one", () => {
  const a = getToastState();
  const b = getToastState();
  assert.ok(a instanceof ToastController);
  assert.notEqual(a, b);
  a.success("Leaked?");
  assert.equal(getToastState().toasts.length, 0);
});

test("server: config still applies to the fresh controller", () => {
  const t = getToastState({ position: "top-center", maxToasts: 2 });
  assert.equal(t.position, "top-center");
  assert.equal(t.maxToasts, 2);
});

test("server: a toast pushed during one render never shows in the next", () => {
  getToastState().error("Request A");
  const body = render(Toast).body;
  assert.doesNotMatch(body, /Request A/);
});

test("browser: one shared instance; config only on the first call; reset drops it", () =>
  asBrowser(() => {
    const a = getToastState({ position: "top-left" });
    const b = getToastState({ position: "bottom-center" });
    assert.equal(a, b);
    assert.equal(a.position, "top-left");
    a.info("Hi");
    assert.equal(getToastState().toasts.length, 1);
    resetToastState();
    assert.notEqual(getToastState(), a);
  }));

test("the deprecated context shims are removed", () => {
  assert.equal("createToastContext" in mod, false);
  assert.equal("getToastContext" in mod, false);
});
