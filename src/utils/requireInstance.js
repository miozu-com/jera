/**
 * Guard for compound children that take their parent's state instance as a
 * prop (jera has no Svelte context: a parent hands its instance to the
 * children snippet, and each child receives it explicitly).
 *
 * A child rendered without that instance is a wiring mistake at the call site:
 * in development (`import.meta.env.DEV`) it throws with the fix spelled out; in
 * production it returns false and the child renders nothing.
 *
 * @param {unknown} instance  the prop value
 * @param {string} component  the child's name, e.g. 'LeftBarItem'
 * @param {string} prop       the prop name, e.g. 'bar'
 * @param {string} parent     the parent that owns the instance, e.g. 'LeftBar'
 * @param {string} snippet    the parent's snippet that carries it, e.g. 'navigation'
 * @returns {boolean} true when the instance is present
 */
export function requireInstance(
  instance,
  component,
  prop,
  parent,
  snippet = "children",
) {
  if (instance) return true;
  if (import.meta.env?.DEV) {
    throw new Error(
      `${component}: missing \`${prop}\` prop. Place it inside <${parent}> and pass the instance ` +
        `from the snippet argument: {#snippet ${snippet}(${prop})} <${component} {${prop}} … /> {/snippet}`,
    );
  }
  return false;
}
