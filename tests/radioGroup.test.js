/**
 * RadioGroup / Radio without context: RadioGroupState unit behaviour, and the
 * server render of a group that hands its state to each Radio through the
 * children snippet argument (shared name, checked option, ids, disabled).
 * A Radio without `group` throws in dev and renders nothing in production
 * (`render()` is lazy: the throw happens on reading `.body`).
 */

import "./helpers/svelte-server.js";
import "./helpers/dev-env.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "svelte/server";

const { RadioGroupState } = await import("../src/components/forms/radioGroup.svelte.js");
const { RadioGroupState: Reexported } = await import("../src/components/forms/RadioGroup.svelte");
const { default: Fixture } = await import("./fixtures/RadioGroupWired.svelte");
const { default: Radio } = await import("../src/components/forms/Radio.svelte");

const html = (props) => render(Fixture, { props }).body;
const inputs = (body) => body.match(/<input[^>]*>/g) ?? [];

test("RadioGroupState: change() selects, reports once, ignores repeats", () => {
  const seen = [];
  const group = new RadioGroupState({ name: "plan", onchange: (v) => seen.push(v) });
  assert.equal(group.value, null);
  group.change("monthly");
  group.change("monthly");
  group.change("yearly");
  assert.equal(group.value, "yearly");
  assert.ok(group.isChecked("yearly"));
  assert.ok(!group.isChecked("monthly"));
  assert.deepEqual(seen, ["monthly", "yearly"]);
});

test("RadioGroupState: a disabled group refuses change()", () => {
  const seen = [];
  const group = new RadioGroupState({ value: "a", disabled: true, onchange: (v) => seen.push(v) });
  group.change("b");
  assert.equal(group.value, "a");
  assert.deepEqual(seen, []);
});

test("RadioGroupState: sync() mirrors the owner's props", () => {
  const group = new RadioGroupState({ value: "a", name: "x" });
  group.sync({ value: "b", name: "y", disabled: true, variant: "segmented" });
  assert.equal(group.value, "b");
  assert.equal(group.name, "y");
  assert.equal(group.disabled, true);
  assert.equal(group.variant, "segmented");
});

test("RadioGroup re-exports RadioGroupState from its module script", () => {
  assert.equal(Reexported, RadioGroupState);
});

test("server render: every Radio gets the group's name; the bound value is checked", () => {
  const body = html({ value: "yearly" });
  assert.match(body, /role="radiogroup"[^>]*aria-label="Plan"|aria-label="Plan"[^>]*role="radiogroup"/);
  const [monthly, yearly] = inputs(body);
  assert.match(monthly, /name="plan"/);
  assert.match(yearly, /name="plan"/);
  assert.doesNotMatch(monthly, /\schecked/);
  assert.match(yearly, /\schecked/);
  assert.match(body, /Two months off/);
});

test("server render: label for= points at the input id (caller id and generated id)", () => {
  const body = html({});
  const ids = inputs(body).map((i) => i.match(/\sid="([^"]+)"/)[1]);
  assert.equal(ids[0], "r-monthly");
  assert.ok(ids[1].startsWith("radio-"));
  for (const id of ids) assert.match(body, new RegExp(`<label[^>]*for="${id}"`));
});

test("server render: a disabled group disables every radio; segmented drops the dot", () => {
  const disabled = html({ disabled: true });
  for (const input of inputs(disabled)) assert.match(input, /\sdisabled/);
  const segmented = html({ variant: "segmented" });
  assert.doesNotMatch(segmented, /radio-control/);
  assert.match(segmented, /radio-segment-text/);
});

test("missing group: throws in dev with the fix, renders nothing in production", () => {
  globalThis.__JERA_DEV__ = true;
  try {
    assert.throws(() => render(Radio, { props: { value: "x", label: "X" } }).body, /Radio: missing `group` prop/);
    assert.throws(() => html({ unwired: true }), /RadioGroup/);
  } finally {
    globalThis.__JERA_DEV__ = false;
  }
  assert.equal(render(Radio, { props: { value: "x", label: "X" } }).body.replace(/<!--[^>]*-->/g, "").trim(), "");
  assert.equal(inputs(html({ unwired: true })).length, 2);
});
