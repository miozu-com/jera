# @miozu/jera - Component Library

Zero-dependency, AI-first component library for Svelte 5.

## Architecture

5-layer design for portability and AI-assisted development:

1. **W3C Design Tokens (DTCG)** - `tokens.json` as single source of truth
2. **CSS Custom Properties** - Generated from tokens
3. **Pure Modern CSS** - Framework-agnostic component styles
4. **Svelte 5 Wrappers** - Thin components using native runes
5. **AI Documentation** - llms.txt standard

**Key Principles:** CSS is the library | Zero dependencies | Theme-agnostic | AI-first

## Project Structure

```
jera/
├── src/
│   ├── tokens/           # colors.css, spacing.css, typography.css
│   ├── utils/            # cn.svelte.js, reactive.svelte.js (ThemeState)
│   ├── actions/          # clickOutside, focusTrap, portal, escapeKey
│   └── components/       # primitives/, forms/, feedback/, overlays/, navigation/
└── llms.txt
```

## Color System

Uses Base16 naming: `base00`-`base0F` (hex digits).

**Full reference:** `knowledge/curated/ai-context/base16-colors.md`

## Component API Quick Reference

**Button:** `variant` (primary|secondary|ghost|outline|danger|success|warning|info), `size` (xs|sm|md|lg), `disabled`, `loading`, `href`, `fullWidth`

- **primary** — Tinted blue (10% bg), main CTAs (Create, Save, Publish)
- **secondary** — Tinted gray, neutral actions
- **outline** — Bordered, secondary actions (Edit, View)
- **ghost** — Transparent, no border, minimal
- **success** — Tinted green, confirm actions
- **danger** — Tinted red, destructive actions
- **warning** — Tinted yellow, caution actions

**Input:** `bind:value`, `type`, `placeholder`, `disabled`, `required`

**Select:** `options=[{value, label}]`, `bind:value`, `placeholder`, `size` (xs|sm|md|lg), `onchange(option)`

**Badge:** `variant` (default|primary|success|warning|error), `size` (sm|md|lg)

**Modal:** `bind:open`, `title`, `size` (sm-xl), `variant`, `fill`, `footer` (snippet)
- **fill** — Anchors dialog to stable height (80dvh). Prevents collapse when content changes (empty states, search results). Uses flex column: header/footer pinned, body stretches + scrolls.

**Toast:** Use `createToastContext()` in root, `getToastContext()` anywhere

**Tabs:** `tabs=[{id, label, badge?, icon?, panelId?}]`, `bind:active`, `variant` (default|segment|underline|pills), `size` (sm|md|lg), `fullWidth`, `onchange`
- **default** — Pill bg indicator slides between tabs
- **segment** — iOS-style segmented control with capsule shadow (use for compact sidebar tabs)
- **underline** — Bottom border slides between tabs
- **pills** — Outlined pills, no sliding indicator
- Sliding indicator animates via CSS transitions + ResizeObserver; respects `prefers-reduced-motion`

**Checkbox:** `bind:checked`, `disabled`, `error`, `name`, `onchange`, children snippet for label

**LeftBar:** `bind:collapsed`, `persistKey`, snippets: `header`, `navigation`, `footer`

**LeftBarItem:** `href`, `label`, `icon`, `active`, `badge`, `expandable`, `subroutes`

## Form Component Border Standard (CRITICAL)

All form components (Input, Select, SearchInput, Checkbox) share identical border rendering:

| Property | Value | Token |
|----------|-------|-------|
| Border width | `1px` | — |
| Border color | `var(--color-base02)` | base02 |
| Border radius | `var(--radius-md)` (6px) | radius-md |
| Background | `var(--color-base00)` | base00 |
| Hover border | `var(--color-base03)` | base03 |
| Focus ring | `box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent)` | base0D |
| Error border | `var(--color-base08)` | base08 |
| Checkbox box | `1.125rem` (18px), `var(--radius-default)` (4px) | — |

**Size scale** (Select, SearchInput):
| Size | Height | Font | Radius |
|------|--------|------|--------|
| xs | 1.625rem (26px) | 0.75rem | radius-default (4px) |
| sm | 2rem (32px) | 0.75rem | radius-md (6px) |
| md | 2.5rem (40px) | 0.875rem | radius-md (6px) |
| lg | 3rem (48px) | 1rem | radius-lg (8px) |

**Anti-pattern:** Never wrap jera form components in a div that has its own `border`, `background`, or `padding`. This creates double borders. Jera components handle their own chrome.

## Theme Management

Singleton pattern with `miozu-theme` storage key.

**Full reference:** `knowledge/curated/ai-context/theme-management.md`

**ThemeToggle:** Accessible toggle with animated sun/moon icons
```svelte
import { ThemeToggle } from '@miozu/jera';
<ThemeToggle />
<ThemeToggle size="sm" variant="outline" />
```

**ThemeSelect:** Three-option selector (light/dark/system)
```svelte
import { ThemeSelect } from '@miozu/jera';
<ThemeSelect />
<ThemeSelect variant="dropdown" />
```

**ThemeState API:**
```javascript
import { getTheme } from '@miozu/jera';
const theme = getTheme();
theme.init();        // Call once in root onMount
theme.toggle();      // Switch dark/light
theme.set('system'); // Follow OS preference
theme.isDark;        // boolean reactive property
```

## Svelte 5 Patterns

**Full reference:** `knowledge/curated/ai-context/svelte5-patterns.md`

```svelte
<script>
  let { variant = 'default', class: className = '', ...rest } = $props();
  const classes = $derived(/* ... */);
</script>

<div class={classes} {...rest}>
  {@render children?.()}
</div>
```

## Class Variants (cv)

```javascript
export const buttonStyles = cv({
  base: 'inline-flex items-center justify-center rounded-lg font-medium',
  variants: {
    variant: {
      primary: 'bg-base0D text-base07',
      ghost: 'bg-transparent text-base05 hover:bg-base02'
    },
    size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' }
  },
  defaults: { variant: 'primary', size: 'md' }
});
```

## Actions

```svelte
<div use:clickOutside={() => isOpen = false}>
<dialog use:focusTrap={{ enabled: isOpen }}>
<div use:portal={'body'}>
<div use:escapeKey={() => close()}>
```

## Rules for AI

1. Svelte 5 runes only - no legacy syntax
2. Single `$props()` call per component
3. Use `cv()` for variants
4. Semantic colors from Base16
5. Accessibility first (ARIA, keyboard)
6. Pure JavaScript (no TypeScript)
