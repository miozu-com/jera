import { test } from "node:test";
import assert from "node:assert/strict";
import { badgeVariant, BADGE_COLOR_VARIANTS } from "../src/utils/badge.js";

test("badgeVariant — palette names map to Badge variants", () => {
  assert.equal(badgeVariant("yellow"), "warning");
  assert.equal(badgeVariant("red"), "error");
  assert.equal(Object.keys(BADGE_COLOR_VARIANTS).length, 5);
});

test("badgeVariant — no or unknown color falls back (info unless told otherwise)", () => {
  assert.equal(badgeVariant(null), "info");
  assert.equal(badgeVariant("teal"), "info");
  assert.equal(badgeVariant(undefined, "warning"), "warning");
});
