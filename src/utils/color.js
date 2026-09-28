/**
 * Colour value helpers. Pure, so `ColorInput`'s parsing is testable under
 * `node --test` and a consumer can validate a stored hex the same way.
 */

/**
 * Normalise a hex colour to uppercase `#RRGGBB`. Accepts `#rgb`, `#rrggbb`,
 * with or without the `#`, surrounding whitespace ignored. Anything else
 * (named colours, alpha, rgb()) returns null.
 *
 * @param {unknown} input
 * @returns {string|null}
 */
export function normalizeHex(input) {
  if (typeof input !== "string") return null;
  const m = input.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  return `#${h.toUpperCase()}`;
}
