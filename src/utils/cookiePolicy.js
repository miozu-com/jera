/**
 * Cookie policy: the app decides whether jera may write a preference cookie.
 *
 * jera writes two cookies of its own, both functional preferences the server
 * reads for the first paint: `miozu-theme` (ThemeState) and the LeftBar
 * `cookieKey` (LeftBarState). An app with a cookie banner registers its rule
 * once at start; with no rule registered every write goes through, as before.
 * A refused write changes nothing else: the preference still applies for the
 * visit and is still kept in localStorage, the cookie is just not set.
 *
 * Module state, not Svelte context: one rule per app, set once. The rule is a
 * plain function, so sharing it between server requests leaks nothing.
 *
 * @example
 * import { setCookiePolicy } from '@miozu/jera/utils';
 * setCookiePolicy(({ category }) => category !== 'functional' || userAcceptedFunctional());
 */

/** @typedef {'functional'} CookieCategory */
/** @typedef {{name: string, category: CookieCategory}} CookieRequest */

/** @type {((cookie: CookieRequest) => boolean) | null} */
let policy = null;

/**
 * Register the rule jera asks before it writes a cookie. Return true to allow.
 * Pass null to drop the rule (every write allowed again).
 * @param {((cookie: CookieRequest) => boolean) | null} fn
 */
export function setCookiePolicy(fn) {
  policy = typeof fn === "function" ? fn : null;
}

/**
 * Whether the registered rule allows writing `name` now. No rule: true. A rule
 * that throws refuses (the visitor's choice could not be read, so nothing is
 * stored on their behalf).
 * @param {string} name
 * @param {CookieCategory} [category]
 */
export function cookieAllowed(name, category = "functional") {
  if (!policy) return true;
  try {
    return Boolean(policy({ name, category }));
  } catch {
    return false;
  }
}

/**
 * Write `name=value` (path=/, SameSite=Lax) when the rule allows it. Deleting
 * (`maxAge: 0`) is always allowed. Browser only; never throws.
 * @param {string} name
 * @param {string} value
 * @param {{maxAge: number, category?: CookieCategory}} options
 * @returns {boolean} true when the cookie was written
 */
export function writeCookie(name, value, { maxAge, category = "functional" }) {
  if (typeof document === "undefined") return false;
  if (maxAge !== 0 && !cookieAllowed(name, category)) return false;
  try {
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}
