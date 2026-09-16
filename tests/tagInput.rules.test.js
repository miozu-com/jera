/**
 * TagInput refusals.
 *
 * Run with `pnpm test` (node's built-in runner — no test dependency, which is
 * the point in a zero-dependency library).
 *
 * These cover the rule, not the rendering: `tagRejection` is the whole decision
 * `addTag` makes, so a refusal that is wrong here is wrong on screen.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tagRejection } from "../src/components/forms/tagInput.rules.js";

const long = "x".repeat(250);

test("unbounded by default", () => {
  assert.equal(tagRejection(long, { tags: [] }), null);
});

test("a tag longer than maxTagLength is refused, and the message names both numbers", () => {
  const refusal = tagRejection(long, { tags: [], maxTagLength: 200 });
  assert.ok(refusal, "expected a refusal");
  assert.match(refusal.message, /200 characters/);
  assert.match(refusal.message, /is 250/);
});

test("a length refusal leaves the field alone — the text is what needs editing", () => {
  const refusal = tagRejection(long, { tags: [], maxTagLength: 200 });
  assert.equal(refusal.clearsField, false);
});

test("exactly at the bound is accepted — the limit is inclusive", () => {
  assert.equal(
    tagRejection("x".repeat(200), { tags: [], maxTagLength: 200 }),
    null,
  );
  assert.ok(tagRejection("x".repeat(201), { tags: [], maxTagLength: 200 }));
});

test("a pasted value is refused whole — a refusal cannot hand back a shorter tag", () => {
  // Pasting is not a separate path: whatever arrives in the field is measured
  // as one value. What matters is that refusing it cannot produce a truncated
  // one, so there is no shape in which the list quietly gets the first 200
  // characters of what someone pasted.
  const pasted = `${"a".repeat(199)} ${"b".repeat(199)}`;
  const refusal = tagRejection(pasted, { tags: [], maxTagLength: 200 });
  assert.ok(refusal);
  assert.deepEqual(Object.keys(refusal).sort(), ["clearsField", "message"]);
  assert.ok(
    !refusal.message.includes(pasted.slice(0, 200)),
    "must not echo a truncated value",
  );
});

test("the field carries no native maxlength, which would truncate a paste silently", () => {
  // Guard for a deliberate decision, not a style rule: the browser clamps text
  // inserted into a `maxlength` field and says nothing about it, so forwarding
  // maxTagLength onto the input would store a shortened claim — exactly what
  // this prop exists to refuse.
  //
  // Measured in Chrome 153 on 2026-09-16: inserting 250 characters into
  // `<input maxlength=200>` left 200 in the box, and the same insert into an
  // unbounded field left all 250. No event, no message — the 50 characters are
  // simply gone, which is indistinguishable from never having typed them.
  const source = readFileSync(
    fileURLToPath(
      new URL("../src/components/forms/TagInput.svelte", import.meta.url),
    ),
    "utf-8",
  );
  const attribute = source.match(/^\s*maxlength[=\s]/m);
  assert.equal(attribute, null, "TagInput must not put maxlength on its field");
});

test("maxTags and maxTagLength refuse independently", () => {
  // A count bound says nothing about length…
  assert.equal(tagRejection(long, { tags: ["one"], maxTags: 5 }), null);
  // …and a length bound says nothing about count.
  assert.equal(
    tagRejection("ok", { tags: ["a", "b", "c"], maxTagLength: 200 }),
    null,
  );

  // With both set, each still answers for its own axis.
  const full = tagRejection("ok", {
    tags: ["a", "b"],
    maxTags: 2,
    maxTagLength: 200,
  });
  assert.match(full.message, /Limit of 2 reached/);
  const over = tagRejection(long, {
    tags: ["a"],
    maxTags: 2,
    maxTagLength: 200,
  });
  assert.match(over.message, /200 characters/);
});

test("the count bound is checked before the length bound", () => {
  // Both would refuse; the one about the list wins, because at the count limit
  // the field is read-only and shortening the text cannot help.
  const refusal = tagRejection(long, {
    tags: ["a", "b"],
    maxTags: 2,
    maxTagLength: 200,
  });
  assert.match(refusal.message, /Remove a tag first/);
});

test("duplicates still refuse as they did, and still clear the field", () => {
  const refusal = tagRejection("red", { tags: ["red"] });
  assert.equal(refusal.message, "red is already added");
  assert.equal(refusal.clearsField, true);
  assert.equal(tagRejection("red", { tags: ["red"], duplicates: true }), null);
});

test("the count refusal message is unchanged", () => {
  const refusal = tagRejection("four", { tags: ["a", "b", "c"], maxTags: 3 });
  assert.equal(refusal.message, "Limit of 3 reached. Remove a tag first.");
  assert.equal(refusal.clearsField, false);
});
