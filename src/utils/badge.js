/**
 * `badgeColor` -> jera Badge `variant`. The nav components (LeftBarItem,
 * NavBarBrand) and consumers' own nav links take a palette name; Badge takes
 * a semantic variant. One map, so the same color means the same chip
 * everywhere.
 */
export const BADGE_COLOR_VARIANTS = Object.freeze({
  blue: "primary",
  green: "success",
  yellow: "warning",
  purple: "accent",
  red: "error",
});

/**
 * @param {string|null|undefined} color  blue|green|yellow|purple|red
 * @param {string} [fallback]  variant for no/unknown color — 'info' for a plain
 *   count badge; a status marker (NavBarBrand) passes 'warning'
 * @returns {string}
 */
export function badgeVariant(color, fallback = "info") {
  return (color && BADGE_COLOR_VARIANTS[color]) || fallback;
}
