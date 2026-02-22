/**
 * Avatar Generator - Base16-Themed Truchet Labyrinth
 *
 * Creates deterministic SVG avatars using the Truchet Labyrinth algorithm
 * with colors picked from the base16 accent palette (Newton color wheel complements).
 *
 * The 8 chromatic base16 colors form 8 complementary pairs:
 *   Pair 0: base08 (Red)     bg + base0C (Cyan)    fg
 *   Pair 1: base09 (Orange)  bg + base0D (Blue)    fg
 *   Pair 2: base0A (Yellow)  bg + base0E (Magenta) fg
 *   Pair 3: base0B (Green)   bg + base0F (Peach)   fg
 *   Pair 4: base0C (Cyan)    bg + base08 (Red)     fg
 *   Pair 5: base0D (Blue)    bg + base09 (Orange)  fg
 *   Pair 6: base0E (Magenta) bg + base0A (Yellow)  fg
 *   Pair 7: base0F (Peach)   bg + base0B (Green)   fg
 *
 * Background is desaturated (20% opacity mix with base01) for card harmony.
 * Foreground strokes use the full accent color.
 */

/**
 * Base16 accent colors — hardcoded from the Miozu theme.
 * These are the canonical values; runtime CSS vars aren't available in SVG generation.
 */
const BASE16_ACCENTS = {
  base08: '#ed8796', // Red
  base09: '#f5a97f', // Orange
  base0A: '#eed49f', // Yellow
  base0B: '#a6da95', // Green
  base0C: '#8bd5ca', // Cyan
  base0D: '#8aadf4', // Blue
  base0E: '#c6a0f6', // Magenta
  base0F: '#f0c6c6', // Peach
  base01: '#1e2030'  // Surface (for bg mixing)
};

/**
 * Complementary pairs — each pair is 180° apart on the Newton color wheel.
 * Index = hash % 8.
 */
const ACCENT_PAIRS = [
  { bg: 'base08', fg: 'base0C' },
  { bg: 'base09', fg: 'base0D' },
  { bg: 'base0A', fg: 'base0E' },
  { bg: 'base0B', fg: 'base0F' },
  { bg: 'base0C', fg: 'base08' },
  { bg: 'base0D', fg: 'base09' },
  { bg: 'base0E', fg: 'base0A' },
  { bg: 'base0F', fg: 'base0B' }
];

/**
 * Parse a hex color to RGB components.
 * @param {string} hex - e.g. '#ed8796'
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

/**
 * Mix two colors at a given ratio (0 = all color1, 1 = all color2).
 * @param {string} hex1
 * @param {string} hex2
 * @param {number} ratio
 * @returns {string} hex color
 */
function mixColors(hex1, hex2, ratio) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Creates a seeded pseudo-random number generator.
 * @param {string} seed - The seed string
 * @returns {function} Returns random numbers between 0 and 1
 */
function createSeededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  let counter = 0;

  return function () {
    counter++;
    const x = Math.sin(hash + counter) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Generates a unique, deterministic SVG avatar using the Truchet Labyrinth algorithm
 * with base16-themed complementary colors.
 *
 * @param {string} seed - A unique string to seed the generator (e.g., user ID).
 * @param {object} [options] - Configuration options.
 * @param {number} [options.size=256] - The width and height of the avatar in pixels.
 * @returns {string} A self-contained SVG string.
 */
export function generateAvatar(seed, options = {}) {
  const { size = 256 } = options;

  const random = createSeededRandom(seed);

  // Pick a complementary pair from the seed hash
  // Use a separate hash (not consuming the PRNG) so the pair is stable
  let pairHash = 0;
  for (let i = 0; i < seed.length; i++) {
    pairHash = seed.charCodeAt(i) + ((pairHash << 5) - pairHash);
  }
  const pairIndex = Math.abs(pairHash) % ACCENT_PAIRS.length;
  const pair = ACCENT_PAIRS[pairIndex];

  // Background: accent color desaturated by mixing 80% base01
  const backgroundColor = mixColors(BASE16_ACCENTS[pair.bg], BASE16_ACCENTS.base01, 0.8);
  // Foreground: full accent color
  const foregroundColor = BASE16_ACCENTS[pair.fg];

  // Grid and tile parameters
  const gridSize = Math.floor(4 + random() * 4); // 4x4 to 7x7
  const tileSize = size / gridSize;
  const strokeWidth = tileSize / 16;
  const tiles = [];

  // Truchet tile: two quarter-circle arcs connecting adjacent edges
  const arcRadius = tileSize / 2;
  const tilePathData =
    `M 0 ${arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${arcRadius} 0 ` +
    `M ${tileSize} ${arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${arcRadius} ${tileSize}`;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const rotation = random() > 0.5 ? 90 : 0;
      const tx = x * tileSize;
      const ty = y * tileSize;

      tiles.push(
        `<path d="${tilePathData}" transform="translate(${tx} ${ty}) rotate(${rotation} ${arcRadius} ${arcRadius})" />`
      );
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${backgroundColor}" />
  <g stroke="${foregroundColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round">
    ${tiles.join('')}
  </g>
</svg>`.trim();
}

/**
 * Creates an avatar data URL for use in img src attributes.
 * @param {string} seed - A unique string to seed the generator
 * @param {object} [options] - Configuration options
 * @returns {string} Data URL of the SVG avatar
 */
export function generateAvatarDataURL(seed, options = {}) {
  const svg = generateAvatar(seed, options);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Creates an avatar blob for upload or caching.
 * @param {string} seed - A unique string to seed the generator
 * @param {object} [options] - Configuration options
 * @returns {Blob} Blob containing the SVG data
 */
export function generateAvatarBlob(seed, options = {}) {
  const svg = generateAvatar(seed, options);
  return new Blob([svg], { type: 'image/svg+xml' });
}
