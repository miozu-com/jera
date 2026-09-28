<!--
  @component ColorSwatch

  Paints one colour value as a small square. The only jera component that takes
  a raw colour: `hex` is data (a merchant's brand colour, a theme value being
  documented), not theme, so it is rendered as given rather than mapped to a
  base16 token. The chrome around it (border, radius, empty state) is tokens.

  An invalid or empty `hex` renders an empty hatched swatch labelled
  "No colour" instead of painting nothing or the wrong thing.

  @example
  <ColorSwatch hex="#1F3A5F" />

  @example Named, larger
  <ColorSwatch hex={brand.primary} size="xl" label="Primary, #1F3A5F" />
-->
<script>
  import { normalizeHex } from '../../utils/color.js';

  let { hex = '', size = 'md', label = '', class: className = '', ...rest } = $props();

  const color = $derived(normalizeHex(hex));
</script>

<span
  role="img"
  aria-label={label || color || 'No colour'}
  class="color-swatch color-swatch-{size} {className}"
  class:color-swatch-empty={!color}
  style:background-color={color}
  {...rest}
></span>

<style>
  .color-swatch {
    display: inline-block;
    flex-shrink: 0;
    width: var(--color-swatch-size);
    height: var(--color-swatch-size);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md);
    /* Keep the edge visible when the colour is close to the page background:
       a white swatch on a white card is otherwise just a border. */
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-base07) 8%, transparent);
    vertical-align: middle;
  }

  .color-swatch-xs {
    --color-swatch-size: 1rem;
    border-radius: var(--radius-default);
  }

  .color-swatch-sm {
    --color-swatch-size: 1.5rem;
  }

  .color-swatch-md {
    --color-swatch-size: 2rem;
  }

  .color-swatch-lg {
    --color-swatch-size: 2.5rem;
  }

  .color-swatch-xl {
    --color-swatch-size: 3rem;
    border-radius: var(--radius-lg);
  }

  .color-swatch-empty {
    background: repeating-linear-gradient(
      -45deg,
      var(--color-base01) 0 4px,
      var(--color-base02) 4px 5px
    );
  }
</style>
