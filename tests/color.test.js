/**
 * Hex normalisation (`src/utils/color.js`) — the whole decision `ColorInput`
 * makes about what the owner typed. Run with `pnpm test`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeHex } from "../src/utils/color.js";

test("six digits, with or without #, any case", () => {
  assert.equal(normalizeHex("#1f3a5f"), "#1F3A5F");
  assert.equal(normalizeHex("1F3A5F"), "#1F3A5F");
  assert.equal(normalizeHex("  #c9a227 "), "#C9A227");
});

test("three digits expand", () => {
  assert.equal(normalizeHex("#fa0"), "#FFAA00");
  assert.equal(normalizeHex("abc"), "#AABBCC");
});

test("everything else is refused", () => {
  for (const bad of [
    "",
    "#",
    "#12",
    "#1234",
    "#12345",
    "#1234567",
    "#12345678",
    "red",
    "rgb(0,0,0)",
    "#ggg",
    null,
    undefined,
    42,
  ]) {
    assert.equal(normalizeHex(bad), null, String(bad));
  }
});
