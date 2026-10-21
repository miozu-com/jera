/**
 * Runtime environment checks.
 *
 * `isBrowser()` is the SSR guard for module singletons: on the server every
 * request shares one module scope, so a singleton cached there would leak
 * state between requests. Callers create a fresh, uncached instance when this
 * returns false.
 */

/** True in a browser (window + document exist), false during SSR and in Node. */
export function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
