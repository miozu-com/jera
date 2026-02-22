# @miozu/jera - Architecture Documentation

**Last Updated:** February 2026
**Version:** 0.5.0+

---

## Overview

jera is a **zero-dependency, AI-first component library** for Svelte 5. It follows a layered architecture that separates design tokens, CSS, and framework-specific code.

### Design Philosophy

1. **CSS is the library** - Pure modern CSS is 100% portable
2. **Framework wrappers are thin** - Svelte components are ~50-100 lines
3. **Zero dependencies** - No external runtime dependencies
4. **AI-first documentation** - llms.txt standard for AI assistants
5. **Browser-native** - Modern CSS features over JS polyfills

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Layer 5: AI Documentation                    │
│              llms.txt, llms-full.txt, CLAUDE.md                │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                  Layer 4: Framework Wrappers                    │
│                    Svelte 5 Components                          │
│            (Native runes: $state, $derived, $props)            │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Layer 3: Pure CSS                            │
│     Component styles using CSS custom properties                │
│   (nesting, :has(), container queries, color-mix())            │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                  Layer 2: CSS Custom Properties                 │
│                 Generated from tokens.json                      │
│              (--color-*, --space-*, --font-*)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│               Layer 1: W3C Design Tokens (DTCG)                 │
│                       tokens.json                               │
│            (Single source of truth for all values)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: W3C Design Tokens (DTCG)

Design tokens are defined following the [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/format/) specification (stable October 2025).

### Token Structure

```json
{
  "$type": "color",
  "color": {
    "base": {
      "00": { "$value": "#0f1419", "$description": "Primary background (dark)" },
      "01": { "$value": "#1a1f26", "$description": "Surface/card" },
      "0D": { "$value": "#61afef", "$description": "Primary/blue" }
    },
    "semantic": {
      "bg": { "$value": "{color.base.00}" },
      "surface": { "$value": "{color.base.01}" },
      "primary": { "$value": "{color.base.0D}" }
    }
  },
  "space": {
    "1": { "$value": "4px", "$type": "dimension" },
    "2": { "$value": "8px", "$type": "dimension" },
    "4": { "$value": "16px", "$type": "dimension" }
  }
}
```

### Base16 Color System (CRITICAL)

jera uses the **Miozu Base16 color system** as its foundation. All 16 colors follow the standard Base16 naming convention.

**Token Naming (hex digits, NOT decimal):**
```
base00, base01, base02, base03, base04, base05, base06, base07
base08, base09, base0A, base0B, base0C, base0D, base0E, base0F
```

**NEVER use:** `base0`, `base1`, `base10`, `base15` (these are incorrect)

**Color Responsibilities:**

| Token | Dark Theme | Light Theme | Usage |
|-------|------------|-------------|-------|
| base00 | #0f1419 | #ffffff | Primary background |
| base01 | #1a1f26 | #f8f9fa | Surface/card |
| base02 | #242a33 | #f1f3f5 | Selection/hover |
| base03 | #4a5568 | #adb5bd | Muted/disabled |
| base04 | #a0aec0 | #6c757d | Secondary text |
| base05 | #e2e8f0 | #212529 | Primary text |
| base06 | #f7fafc | #1a1d20 | High emphasis |
| base07 | #ffffff | #0d0f10 | Maximum contrast |
| base08 | #e06c75 | #dc3545 | Error/red |
| base09 | #d19a66 | #fd7e14 | Warning/orange |
| base0A | #e5c07b | #ffc107 | Highlight/yellow |
| base0B | #98c379 | #28a745 | Success/green |
| base0C | #56b6c2 | #17a2b8 | Info/cyan |
| base0D | #61afef | #007bff | Primary/blue |
| base0E | #c678dd | #6f42c1 | Accent/purple |
| base0F | #be5046 | #e83e8c | Secondary accent |

### Token Build Process

```bash
# tokens.json → CSS custom properties
node tokens/build.js
```

The build script generates `tokens.css` with all CSS custom properties:

```css
:root {
  --color-base00: #0f1419;
  --color-base01: #1a1f26;
  /* ... */
  --space-1: 4px;
  --space-2: 8px;
}

[data-theme='miozu-light'] {
  --color-base00: #ffffff;
  --color-base01: #f8f9fa;
  /* ... grayscale inverts, accents adjust */
}
```

---

## Layer 2: CSS Custom Properties

Generated CSS custom properties serve as the interface between tokens and component styles.

### Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--color-` | Colors | `--color-base0D`, `--color-primary` |
| `--space-` | Spacing | `--space-1`, `--space-4` |
| `--font-` | Typography | `--font-size-sm`, `--font-weight-bold` |
| `--radius-` | Border radius | `--radius-sm`, `--radius-full` |
| `--shadow-` | Box shadows | `--shadow-sm`, `--shadow-lg` |
| `--z-` | Z-index layers | `--z-modal`, `--z-toast` |

### Semantic Color Aliases

Components use semantic aliases that map to Base16:

```css
/* In tokens.css */
:root {
  --color-bg: var(--color-base00);
  --color-surface: var(--color-base01);
  --color-surface-alt: var(--color-base02);
  --color-text: var(--color-base05);
  --color-text-strong: var(--color-base07);
  --color-text-muted: var(--color-base04);
  --color-primary: var(--color-base0D);
  --color-success: var(--color-base0B);
  --color-warning: var(--color-base0A);
  --color-error: var(--color-base08);
  --color-info: var(--color-base0C);
}
```

---

## Layer 3: Pure CSS Components

Component styles use modern CSS features and are framework-agnostic.

### Modern CSS Features Used

| Feature | Usage | Browser Support |
|---------|-------|-----------------|
| CSS Nesting | Scoped styles | 2024+ |
| `:has()` | Parent selection | 2024+ |
| Container Queries | Responsive components | 2023+ |
| `color-mix()` | Dynamic color variants | 2023+ |
| CSS Layers | Specificity management | 2023+ |
| Custom Properties | Design tokens | 2017+ |

### CSS Component Pattern

```css
/* button.css - Pure CSS, no framework */

.jera-button {
  /* Base styles using tokens */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all 150ms ease;
  cursor: pointer;
  border: none;

  /* Variants using CSS nesting */
  &[data-variant="primary"] {
    background: var(--color-primary);
    color: var(--color-base07);

    &:hover {
      background: color-mix(in srgb, var(--color-primary) 85%, black);
    }
  }

  &[data-variant="secondary"] {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-base03);
  }

  /* Size variants */
  &[data-size="sm"] {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-xs);
  }

  &[data-size="lg"] {
    padding: var(--space-3) var(--space-6);
    font-size: var(--font-size-base);
  }

  /* State variants */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &[data-loading] {
    position: relative;
    color: transparent;
  }
}
```

### Container Queries for Responsive Components

```css
.jera-sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

@container sidebar (max-width: 200px) {
  .jera-sidebar-label {
    display: none;
  }

  .jera-sidebar-icon {
    margin: 0 auto;
  }
}
```

---

## Layer 4: Svelte 5 Framework Wrapper

Svelte components are thin wrappers around the CSS. They handle:
- Props and reactivity via native runes
- Event handling
- Accessibility attributes
- State management

### Svelte 5 Runes (Required)

| Rune | Usage |
|------|-------|
| `$props()` | Declare component props (single call only) |
| `$state()` | Reactive local state |
| `$derived()` | Computed values |
| `$bindable()` | Two-way binding props |
| `$effect()` | Side effects (use sparingly) |

### Component Template

```svelte
<!-- Button.svelte -->
<script>
  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    href = null,
    class: className = '',
    children,
    onclick,
    ...rest
  } = $props();

  // Derived class string
  const classes = $derived(
    ['jera-button', className].filter(Boolean).join(' ')
  );
</script>

{#if href && !disabled}
  <a
    {href}
    class={classes}
    data-variant={variant}
    data-size={size}
    data-loading={loading || undefined}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    type="button"
    class={classes}
    data-variant={variant}
    data-size={size}
    data-loading={loading || undefined}
    {disabled}
    {onclick}
    {...rest}
  >
    {@render children?.()}
  </button>
{/if}
```

### Reactive Singleton Pattern (ThemeState)

For global state like theme management, jera uses a **reactive singleton class pattern**:

```javascript
// reactive.svelte.js

export class ThemeState {
  // Reactive state using runes
  current = $state('system');

  // Derived values
  resolved = $derived.by(() => this.#resolveTheme());
  dataTheme = $derived.by(() =>
    this.resolved === 'dark' ? 'miozu-dark' : 'miozu-light'
  );
  isDark = $derived.by(() => this.resolved === 'dark');
  isLight = $derived.by(() => this.resolved === 'light');

  // Private state
  #initialized = false;
  #mediaQuery = null;

  constructor(initial = 'system') {
    this.current = initial;
  }

  #resolveTheme() {
    if (this.current === 'system') {
      if (typeof window === 'undefined') return 'dark';
      return this.#mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.current;
  }

  init() { /* ... */ }
  sync() { /* ... */ }
  toggle() { /* ... */ }
  set(theme) { /* ... */ }
}

// Singleton instance
let themeInstance = null;

export function getTheme(initial = 'system') {
  if (!themeInstance) {
    themeInstance = new ThemeState(initial);
  }
  return themeInstance;
}
```

**Usage in SvelteKit:**

```svelte
<!-- +layout.svelte (root) -->
<script>
  import { getTheme } from '@miozu/jera';
  import { onMount } from 'svelte';

  // Get singleton once
  const themeState = getTheme();

  onMount(() => {
    themeState.sync();  // Hydrate from DOM
    themeState.init();  // Setup listeners
  });
</script>

<!-- Pass to children as props -->
<Sidebar {themeState} />
```

```svelte
<!-- Child component -->
<script>
  // Receive as prop, DON'T call getTheme()
  let { themeState } = $props();

  function handleToggle() {
    themeState.toggle();
  }

  // Reactive access
  let isDark = $derived(themeState.isDark);
</script>
```

---

## Layer 5: AI Documentation

### llms.txt Standard

Following the [llms.txt specification](https://llmstxt.org/), jera provides:

| File | Purpose |
|------|---------|
| `llms.txt` | Quick reference index |
| `llms-full.txt` | Complete documentation |
| `CLAUDE.md` | Detailed AI context |

### llms.txt Structure

```markdown
# @miozu/jera

> Description of the library

## Quick Start
- Installation
- Basic usage

## Components
- [Button](/src/components/Button.svelte): Description
- [Input](/src/components/Input.svelte): Description

## Patterns
- Theme management
- Class variants
```

---

## Directory Structure

```
jera/
├── tokens/
│   ├── tokens.json          # W3C DTCG source of truth
│   ├── tokens.dark.json     # Dark theme overrides
│   ├── tokens.light.json    # Light theme overrides
│   └── build.js             # Token → CSS generator
├── src/
│   ├── tokens/              # Generated CSS
│   │   ├── index.css        # All tokens bundled
│   │   ├── colors.css       # Base16 palette
│   │   ├── spacing.css      # 4px-based scale
│   │   ├── typography.css   # Font system
│   │   └── effects.css      # Shadows, radius, transitions
│   ├── css/                 # Pure CSS components (future)
│   │   ├── button.css
│   │   ├── input.css
│   │   └── modal.css
│   ├── components/
│   │   ├── primitives/      # Button, Badge, Avatar, etc.
│   │   ├── forms/           # Input, Select, Checkbox, etc.
│   │   ├── feedback/        # Toast, Spinner, Alert, etc.
│   │   ├── overlays/        # Modal, Popover, Dropdown
│   │   ├── navigation/      # Tabs, Sidebar, Accordion
│   │   └── docs/            # CodeBlock, PropsTable
│   ├── utils/
│   │   ├── cn.svelte.js     # Class utilities (cn, cv)
│   │   ├── reactive.svelte.js # ThemeState, createReactive
│   │   └── sidebar.svelte.js  # Sidebar state management
│   ├── actions/
│   │   └── index.js         # Svelte actions
│   └── index.js             # Main exports
├── llms.txt                 # AI quick reference
├── llms-full.txt            # AI complete docs
├── CLAUDE.md                # AI detailed context
├── ARCHITECTURE.md          # This file
└── package.json
```

---

## Theming

### Theme Attribute

Themes are applied via `data-theme` attribute on `<html>`:

```html
<html data-theme="miozu-dark">
```

Supported values:
- `miozu-dark` - Dark theme (default)
- `miozu-light` - Light theme

### Theme-Agnostic Components

Components **NEVER** check theme directly. They use semantic tokens:

```svelte
<!-- CORRECT: Works in both themes -->
<div class="bg-base00 text-base05 border-base03">
  <h1 class="text-base07">Title</h1>
  <button class="bg-base0D text-base07">Action</button>
</div>

<!-- WRONG: Don't use theme-specific logic in components -->
{#if theme.isDark}
  <div class="dark-styles">...</div>
{/if}
```

### CSS Theme Switching

Theme switching is handled entirely via CSS custom property values:

```css
/* Dark theme (default) */
:root {
  --color-base00: #0f1419;
  --color-base05: #e2e8f0;
}

/* Light theme - only values change, not usage */
[data-theme='miozu-light'] {
  --color-base00: #ffffff;
  --color-base05: #212529;
}
```

---

## Performance Considerations

1. **CSS-first** - Styles load before JS, preventing FOUC
2. **Tree-shakeable** - Import only what you use
3. **No runtime CSS-in-JS** - Zero overhead
4. **Lazy loading** - Components can be dynamically imported
5. **SSR-safe** - All components work with SvelteKit SSR

---

## Browser Support

jera targets modern browsers (2024+):

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 120+ |
| Firefox | 118+ |
| Safari | 17+ |
| Edge | 120+ |

For older browser support, consider using CSS polyfills or fallbacks.

---

## Migration Guide

### From CSS-in-JS

1. Extract styles to pure CSS files
2. Use CSS custom properties for theming
3. Replace dynamic style props with data attributes

---

## Rules for AI Assistants

1. **Use Svelte 5 runes** - No legacy `$:`, `export let`, stores
2. **Single $props() call** - Destructure all props in one call
3. **Use cv() for variants** - Don't hardcode conditional classes
4. **Semantic colors** - Use `--color-*` tokens, not raw hex values
5. **Pure JavaScript** - No TypeScript
6. **Zero dependencies** - Don't add external packages
7. **Theme-agnostic** - Components work in both themes automatically
8. **Accessibility first** - Include ARIA attributes, keyboard support

---

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - AI context file with API reference
- [llms.txt](./llms.txt) - Quick AI reference
- [README.md](./README.md) - Getting started guide
