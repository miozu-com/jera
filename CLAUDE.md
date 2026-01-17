# @miozu/jera - AI Context File

**Package:** @miozu/jera
**Purpose:** Minimal, reactive component library for Svelte 5
**Author:** Nicholas Glazer <glazer.nicholas@gmail.com>

---

## Project Structure

```
jera/
├── src/
│   ├── index.js              # Main exports
│   ├── tokens/               # Design tokens (CSS custom properties)
│   │   ├── index.css         # Bundle all tokens
│   │   ├── colors.css        # Miozu Base16 palette
│   │   ├── spacing.css       # 4px-based scale
│   │   ├── typography.css    # Font system
│   │   └── effects.css       # Shadows, radius, transitions
│   ├── utils/
│   │   ├── cn.svelte.js      # cn(), cv() class utilities
│   │   └── reactive.svelte.js # ThemeState, reactive helpers
│   ├── actions/
│   │   └── index.js          # Svelte actions
│   └── components/
│       ├── primitives/       # Button, Badge
│       ├── forms/            # Input, Select, Checkbox, Switch
│       └── feedback/         # Toast
├── llms.txt                  # AI documentation index
├── CLAUDE.md                 # This file
└── package.json
```

---

## Coding Standards

### Svelte 5 Patterns (REQUIRED)
- Use `$props()` for component props (single call only)
- Use `$state()` for reactive local state
- Use `$derived()` for computed values
- Use `$effect()` sparingly, only for side effects
- Use `$bindable()` for two-way binding props

### Component Template
```svelte
<script>
  let {
    variant = 'default',
    size = 'md',
    disabled = false,
    class: className = '',
    ...rest
  } = $props();

  const computedClass = $derived(/* class logic */);
</script>

<element class={computedClass} {disabled} {...rest}>
  {@render children?.()}
</element>
```

### Class Variants (cv) Pattern
```javascript
export const componentStyles = cv({
  base: 'base-classes here',
  variants: {
    variantName: {
      option1: 'classes-for-option1',
      option2: 'classes-for-option2'
    }
  },
  compounds: [
    { condition: { variant: 'x', size: 'y' }, class: 'compound-classes' }
  ],
  defaults: { variantName: 'option1' }
});
```

### Naming Conventions
- Components: PascalCase (`Button.svelte`)
- Utilities: camelCase (`createThemeContext`)
- CSS tokens: kebab-case (`--color-primary`)
- Actions: camelCase (`clickOutside`)

---

## Miozu Color System

### Base Colors (Grayscale)
| Token | Hex | Usage |
|-------|-----|-------|
| `--base0` | #232733 | Darkest background |
| `--base1` | #2C3040 | Default dark bg |
| `--base2` | #3E4359 | Selection, hover |
| `--base3` | #565E78 | Comments, subtle |
| `--base4` | #737E99 | Muted text |
| `--base5` | #D0D2DB | Default text |
| `--base6` | #F3F4F7 | Light text |
| `--base7` | #FAFDFB | Lightest/white |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--magenta` | #C974E6 | Primary brand |
| `--blue` | #83D2FC | Info, links |
| `--green` | #6DD672 | Success |
| `--yellow` | #E8D176 | Warning |
| `--red` | #EB3137 | Error |
| `--cyan` | #40FFE2 | Accent |
| `--orange` | #FF9837 | Attention |
| `--peach` | #FF9982 | Warm accent |

### Semantic Mappings
```css
--color-bg: var(--base0);
--color-surface: var(--base1);
--color-text: var(--base5);
--color-text-strong: var(--base7);
--color-primary: var(--magenta);
--color-success: var(--green);
--color-error: var(--red);
```

---

## Component API Reference

### Button
```svelte
<Button
  variant="primary|secondary|ghost|outline|danger|success"
  size="xs|sm|md|lg|xl"
  disabled={boolean}
  loading={boolean}
  fullWidth={boolean}
  href={string}        // Renders as <a> if provided
  onclick={function}
>
  Content
</Button>
```

### Input
```svelte
<Input
  bind:value={string}
  type="text|email|password|number|..."
  placeholder={string}
  disabled={boolean}
  required={boolean}
  oninput={function}
  onchange={function}
/>
```

### Select
```svelte
<Select
  options={[{ value, label }]}
  bind:value={any}
  placeholder={string}
  labelKey="label"
  valueKey="value"
  disabled={boolean}
  onchange={function}
/>
```

### Badge
```svelte
<Badge
  variant="default|primary|secondary|success|warning|error"
  size="sm|md|lg"
>
  Text
</Badge>
```

### Toast
```svelte
<!-- In root layout -->
<script>
  import { Toast, createToastContext } from '@miozu/jera';
  const toast = createToastContext();
</script>
<Toast />

<!-- Usage anywhere -->
<script>
  import { getToastContext } from '@miozu/jera';
  const toast = getToastContext();
  toast.success('Message');
  toast.error('Error message');
</script>
```

---

## Actions Reference

### clickOutside
```svelte
<div use:clickOutside={() => isOpen = false}>
```

### focusTrap
```svelte
<dialog use:focusTrap={{ enabled: isOpen }}>
```

### portal
```svelte
<div use:portal={'body'}>
  Renders at body level
</div>
```

### escapeKey
```svelte
<div use:escapeKey={() => close()}>
```

---

## Common Tasks

### Add New Component
1. Create file in appropriate folder (`primitives/`, `forms/`, `feedback/`)
2. Use single `$props()` call
3. Export styles with `cv()` if variants needed
4. Add to `src/index.js` exports
5. Document in this file

### Add New Token
1. Add to appropriate token file in `src/tokens/`
2. Use semantic naming
3. Add light theme variant if applicable

### Theme Switching
```javascript
// System preference detection
const theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', theme);

// Or use ThemeState class
import { createThemeContext } from '@miozu/jera';
const theme = createThemeContext();
theme.init(); // Reads from localStorage/system
theme.toggle();
```

---

## Rules for AI Assistants

1. **Always use Svelte 5 runes** - No legacy `$:`, `export let`, stores
2. **Single $props() call** - Destructure all props in one call
3. **Use cv() for variants** - Don't hardcode conditional classes
4. **Semantic colors** - Use `--color-*` tokens, not raw `--base*`
5. **Accessibility first** - Include ARIA attributes, keyboard support
6. **No TypeScript** - Pure JavaScript with JSDoc for documentation
7. **Mobile-first** - Design for mobile, enhance for desktop
