/**
 * Sentence diff (`src/utils/diff.js`) — the algorithm `DiffBlock` renders and
 * dash's listing Changes view summarises. Run with `pnpm test`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  splitSentences,
  diffSentences,
  diffSummary,
} from "../src/utils/diff.js";

const types = (ops) => ops.map((o) => o.type[0]).join("");

test("splitSentences: terminators, line breaks, empties", () => {
  assert.deepEqual(splitSentences("One. Two! Three? Four… Five"), [
    "One.",
    "Two!",
    "Three?",
    "Four…",
    "Five",
  ]);
  assert.deepEqual(splitSentences("Metal: 925 sterling\n\n- Weight: 3.2 g\n"), [
    "Metal: 925 sterling",
    "- Weight: 3.2 g",
  ]);
  assert.deepEqual(splitSentences(""), []);
  assert.deepEqual(splitSentences(null), []);
  assert.deepEqual(splitSentences("   \n  "), []);
});

test("splitSentences: decimals, abbreviations and quotes stay whole", () => {
  assert.deepEqual(splitSentences("Weighs 3.2 g. Made in Cusco."), [
    "Weighs 3.2 g.",
    "Made in Cusco.",
  ]);
  assert.deepEqual(
    splitSentences("Hoops approx. 24 mm wide, e.g. for daily wear."),
    ["Hoops approx. 24 mm wide, e.g. for daily wear."],
  );
  assert.deepEqual(splitSentences('She said "made by hand." Then she left.'), [
    'She said "made by hand."',
    "Then she left.",
  ]);
});

test("identical texts are all equal, whitespace-insensitive", () => {
  const ops = diffSentences("A one.  B two.", "A one. B   two.");
  assert.equal(types(ops), "ee");
  assert.equal(diffSummary(ops).changed, false);
});

test("both empty → no ops", () => {
  assert.deepEqual(diffSentences("", []), []);
});

test("pure insertion and pure deletion", () => {
  assert.equal(types(diffSentences("", "New. Text.")), "aa");
  assert.equal(types(diffSentences("Old. Text.", "")), "rr");
});

test("replaced sentence reads as removed then added, context kept", () => {
  const ops = diffSentences(
    "Handcrafted in the Andean tradition. Sterling 925. Store in a pouch away from humidity.",
    "Hand-twisted hoops, made in Cusco. Sterling 925. Store in the pouch.",
  );
  assert.deepEqual(ops, [
    { type: "removed", text: "Handcrafted in the Andean tradition." },
    { type: "added", text: "Hand-twisted hoops, made in Cusco." },
    { type: "equal", text: "Sterling 925." },
    { type: "removed", text: "Store in a pouch away from humidity." },
    { type: "added", text: "Store in the pouch." },
  ]);
});

test("multi-sentence hunk groups every removal before every addition", () => {
  const ops = diffSentences("Keep. X1. X2. Tail.", "Keep. Y1. Y2. Y3. Tail.");
  assert.equal(types(ops), "erraaae");
});

test("reordering keeps the longest common run", () => {
  const ops = diffSentences(["A", "B", "C", "D"], ["B", "C", "D", "A"]);
  assert.equal(types(ops), "reeea");
});

test("array inputs: one row per item, blanks dropped", () => {
  const ops = diffSentences(
    ["Metal: 925", "", "Weight: 3.2 g"],
    ["Metal: 925", "Weight: 3.1 g"],
  );
  assert.equal(types(ops), "era");
});

test("diffSummary counts sentences and words on each side", () => {
  const ops = diffSentences("One two three. Four five.", "One two three. Six.");
  assert.deepEqual(diffSummary(ops), {
    equal: 1,
    added: 1,
    removed: 1,
    changed: true,
    wordsBefore: 5,
    wordsAfter: 4,
  });
  assert.deepEqual(diffSummary([]), {
    equal: 0,
    added: 0,
    removed: 0,
    changed: false,
    wordsBefore: 0,
    wordsAfter: 0,
  });
});

test("equal ops carry the after-side text", () => {
  const ops = diffSentences("Same  text.", "Same text.");
  assert.equal(ops[0].text, "Same text.");
});
