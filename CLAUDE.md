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

**Full reference:** `docs/ai-context/base16-colors.md`

## Component API Quick Reference

**Button:** `variant` (solid|primary|secondary|ghost|outline|danger|success|warning|info|solid-danger|solid-success), `size` (xs|sm|md|lg), `disabled`, `loading`, `href`, `fullWidth`

- **solid** — Opaque blue background, use for prominent CTAs (Create, Publish, Save)
- **solid-danger** — Opaque red background, use for destructive CTAs (Delete, Remove)
- **solid-success** — Opaque green background, use for confirm CTAs (Approve, Complete)
- **primary** — Tinted blue (10% bg), default for most buttons
- **ghost** — Transparent, no border

**Input:** `bind:value`, `type`, `placeholder`, `disabled`, `required`

**Select:** `options=[{value, label}]`, `bind:value`, `placeholder`

**Badge:** `variant` (default|primary|success|warning|error), `size` (sm|md|lg)

**Modal:** `bind:open`, `title`, `size` (sm-xl), `variant`, `footer` (snippet)

**Toast:** Use `createToastContext()` in root, `getToastContext()` anywhere

**Tabs:** `tabs=[{id, label, badge?, icon?, panelId?}]`, `bind:active`, `variant` (default|segment|underline|pills), `size` (sm|md|lg), `fullWidth`, `onchange`
- **default** — Pill bg indicator slides between tabs
- **segment** — iOS-style segmented control with capsule shadow (use for compact sidebar tabs)
- **underline** — Bottom border slides between tabs
- **pills** — Outlined pills, no sliding indicator
- Sliding indicator animates via CSS transitions + ResizeObserver; respects `prefers-reduced-motion`

**LeftBar:** `bind:collapsed`, `persistKey`, snippets: `header`, `navigation`, `footer`

**LeftBarItem:** `href`, `label`, `icon`, `active`, `badge`, `expandable`, `subroutes`

## Theme Management

Singleton pattern with `miozu-theme` storage key.

**Full reference:** `docs/ai-context/theme-management.md`

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

**Full reference:** `docs/ai-context/svelte5-patterns.md`

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
