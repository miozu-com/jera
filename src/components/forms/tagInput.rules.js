/**
 * Why a tag cannot be added — the one place TagInput decides a refusal.
 *
 * Extracted from `addTag` so the three refusals (count, length, duplicate) are
 * written next to each other and answer in the same shape, and so they can be
 * tested without a DOM. The component holds the state; this holds the rule.
 *
 * **A refusal never returns a value.** There is deliberately no way for this
 * function to hand back a shortened or otherwise rewritten tag: a bound is
 * either met by what the person typed or the tag is not added, and they are
 * told which. Silently storing something other than what was typed is the
 * failure mode this shape exists to make unrepresentable.
 *
 * Zero dependencies — plain JS, no runes, importable from a test.
 */

/**
 * @typedef {object} TagRejection
 * @property {string} message   Sentence for the live region, naming the bound.
 * @property {boolean} clearsField
 *   Whether the field should be emptied. True only for a duplicate: the tag is
 *   already in the list, so the text has served its purpose. A bound refusal
 *   leaves the text in place — it is the thing that needs editing.
 */

/**
 * @param {string} value  The value that would be stored (post-trim, post-transform).
 * @param {object} limits
 * @param {string[]} limits.tags
 * @param {number} [limits.maxTags]
 * @param {number} [limits.maxTagLength]
 * @param {boolean} [limits.duplicates]  Whether duplicates are allowed.
 * @returns {TagRejection|null}  Null when the tag can be added.
 */
export function tagRejection(
  value,
  { tags, maxTags = Infinity, maxTagLength = Infinity, duplicates = false }
) {
  // Bounds first, identity second: "there is no room" and "it is too long" are
  // facts about the list and the value, and hold whether or not the same text
  // is already present.
  if (tags.length >= maxTags) {
    return { message: `Limit of ${maxTags} reached. Remove a tag first.`, clearsField: false };
  }
  if (value.length > maxTagLength) {
    return {
      message: `Limit of ${maxTagLength} characters. This one is ${value.length} — shorten it to add it.`,
      clearsField: false
    };
  }
  if (!duplicates && tags.includes(value)) {
    return { message: `${value} is already added`, clearsField: true };
  }
  return null;
}
