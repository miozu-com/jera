/**
 * Sentence-level text diff.
 *
 * Pure (no Svelte, no DOM) so it runs under `node --test` and so a consumer can
 * compute a summary ("184 → 96 words") from the same ops `DiffBlock` renders.
 *
 * Sentence-level on purpose: a word diff of rewritten prose is unreadable, and
 * the question an owner asks of a rewrite is "which sentences changed", not
 * "which words moved".
 */

/**
 * Split prose into sentences. Line breaks are always boundaries (a bulleted
 * spec list is one row per line). Inside a line, `.`, `!`, `?` or `…` —
 * optionally followed by closing quotes/brackets — ends a sentence only when
 * whitespace and a capital (optionally after an opening quote/bracket) follow,
 * so `3.2 g`, `e.g. rings` and `approx. 5 mm` stay whole. Under-splitting is
 * the safe error: a merged pair still diffs, just as one row.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  if (!text) return [];
  const out = [];
  for (const line of String(text).split(/\r?\n+/)) {
    for (const part of line.split(/(?<=[.!?…]["'”’)\]]*)\s+(?=["'“‘(\[]?[\p{Lu}\p{Lt}\p{Lo}])/u)) {
      const s = part.trim();
      if (s) out.push(s);
    }
  }
  return out;
}

/** Whitespace-insensitive identity for comparing two sentences. */
function key(s) {
  return s.replace(/\s+/g, " ").trim();
}

function toList(v) {
  if (Array.isArray(v))
    return v.map((s) => String(s ?? "").trim()).filter(Boolean);
  return splitSentences(v ?? "");
}

/**
 * Diff two texts sentence by sentence (LCS). Each side is a string (split
 * with `splitSentences`) or an already-split string array.
 *
 * Inside each changed run the removed sentences come before the added ones,
 * so a replaced sentence reads as − old / + new.
 *
 * @param {string|string[]} before
 * @param {string|string[]} after
 * @returns {{type: 'equal'|'removed'|'added', text: string}[]}
 */
export function diffSentences(before, after) {
  const a = toList(before);
  const b = toList(after);
  const ak = a.map(key);
  const bk = b.map(key);

  // Common prefix/suffix first: most edits touch a few sentences, and this
  // keeps the quadratic table to the part that actually differs.
  let start = 0;
  while (start < a.length && start < b.length && ak[start] === bk[start])
    start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && ak[endA - 1] === bk[endB - 1]) {
    endA--;
    endB--;
  }

  const n = endA - start;
  const m = endB - start;
  // lcs[i][j] = LCS length of a[start+i..endA) and b[start+j..endB)
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        ak[start + i] === bk[start + j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops = [];
  for (let k = 0; k < start; k++) ops.push({ type: "equal", text: b[k] });

  let removed = [];
  let added = [];
  const flush = () => {
    for (const text of removed) ops.push({ type: "removed", text });
    for (const text of added) ops.push({ type: "added", text });
    removed = [];
    added = [];
  };

  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && ak[start + i] === bk[start + j]) {
      flush();
      ops.push({ type: "equal", text: b[start + j] });
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[i + 1][j] >= lcs[i][j + 1])) {
      removed.push(a[start + i]);
      i++;
    } else {
      added.push(b[start + j]);
      j++;
    }
  }
  flush();

  for (let k = endB; k < b.length; k++) ops.push({ type: "equal", text: b[k] });
  return ops;
}

function words(s) {
  const m = s.match(/\S+/g);
  return m ? m.length : 0;
}

/**
 * Count what a diff did. `wordsBefore`/`wordsAfter` are the word counts of the
 * two sides, so a caller can say "184 → 96 words" without re-splitting.
 *
 * @param {{type: string, text: string}[]} ops
 * @returns {{equal: number, added: number, removed: number, changed: boolean, wordsBefore: number, wordsAfter: number}}
 */
export function diffSummary(ops) {
  const s = {
    equal: 0,
    added: 0,
    removed: 0,
    changed: false,
    wordsBefore: 0,
    wordsAfter: 0,
  };
  for (const op of ops ?? []) {
    const w = words(op.text);
    if (op.type === "equal") {
      s.equal++;
      s.wordsBefore += w;
      s.wordsAfter += w;
    } else if (op.type === "removed") {
      s.removed++;
      s.wordsBefore += w;
    } else if (op.type === "added") {
      s.added++;
      s.wordsAfter += w;
    }
  }
  s.changed = s.added > 0 || s.removed > 0;
  return s;
}
