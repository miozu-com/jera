# @miozu/jera

A minimal, reactive component library for Svelte 5.

**Jera** (ᛃ) — the rune of harvest and cycles. Build on foundations, yield results.

## Features

- **Miozu Design Tokens** — Base16 color system, spacing, typography, effects
- **Reactive Utilities** — `cn()`, `cv()` for class composition with Svelte 5 runes
- **Accessible Components** — Button, Input, Select, Badge, Checkbox, Switch, Toast
- **Svelte Actions** — clickOutside, focusTrap, portal, escapeKey, and more
- **AI-First Documentation** — Optimized for LLM-assisted development

## Installation

```bash
pnpm add @miozu/jera
```

## Quick Start

```svelte
<script>
  import { Button, Input, Badge } from '@miozu/jera';
  import '@miozu/jera/tokens';

  let email = $state('');
</script>

<Input bind:value={email} type="email" placeholder="Enter email" />
<Button onclick={() => console.log(email)}>Submit</Button>
<Badge variant="success">Active</Badge>
```

## Design Tokens

Import tokens for consistent styling:

```css
/* All tokens */
@import '@miozu/jera/tokens';

/* Individual token sets */
@import '@miozu/jera/tokens/colors';
@import '@miozu/jera/tokens/spacing';
@import '@miozu/jera/tokens/typography';
@import '@miozu/jera/tokens/effects';
```

### Miozu Base16 Color Palette

Standard Base16 naming: `base00`-`base0F` (hex digits).

| Grayscale | Usage | Accents | Usage |
|-----------|-------|---------|-------|
| `base00` | Background | `base08` | Error (Red) |
| `base01` | Surface | `base09` | Warning (Orange) |
| `base02` | Selection | `base0A` | Highlight (Yellow) |
| `base03` | Muted | `base0B` | Success (Green) |
| `base04` | Secondary text | `base0C` | Info (Cyan) |
| `base05` | Primary text | `base0D` | Primary (Blue) |
| `base06` | High emphasis | `base0E` | Accent (Purple) |
| `base07` | Maximum contrast | `base0F` | Secondary accent |

## Components

### Button

```svelte
<Button variant="primary|secondary|ghost|outline|danger|success" size="xs|sm|md|lg|xl">
  Click me
</Button>
<Button href="/about">Link Button</Button>
<Button loading>Loading...</Button>
```

### Input

```svelte
<Input bind:value={text} placeholder="Enter text" />
<Input type="password" disableBrowserFeatures />
<Input error={!isValid} />
```

### Select

```svelte
<Select
  options={[{ value: '1', label: 'Option 1' }]}
  bind:value={selected}
  placeholder="Choose..."
/>
```

### Badge

```svelte
<Badge variant="default|primary|secondary|success|warning|error|info">
  Status
</Badge>
```

### Checkbox & Switch

```svelte
<Checkbox bind:checked={agreed}>I agree</Checkbox>
<Switch bind:checked={enabled}>Enable notifications</Switch>
```

### Toast

```svelte
<!-- Root layout -->
<script>
  import { Toast, createToastContext } from '@miozu/jera';
  createToastContext();
</script>
<Toast />

<!-- Any component -->
<script>
  import { getToastContext } from '@miozu/jera';
  const toast = getToastContext();
  toast.success('Saved!');
</script>
```

## Utilities

### cn() — Class concatenation

```javascript
import { cn } from '@miozu/jera';

cn('base', condition && 'conditional', ['array', 'classes']);
// => "base conditional array classes"
```

### cv() — Class variants

```javascript
import { cv } from '@miozu/jera';

const button = cv({
  base: 'inline-flex items-center',
  variants: {
    variant: { primary: 'bg-primary', secondary: 'bg-surface' },
    size: { sm: 'h-8', md: 'h-10' }
  },
  defaults: { variant: 'primary', size: 'md' }
});

button({ variant: 'secondary' }); // => "inline-flex items-center bg-surface h-10"
```

## Actions

```svelte
<script>
  import { clickOutside, focusTrap, escapeKey, portal } from '@miozu/jera/actions';
</script>

<div use:clickOutside={() => close()}>
  <dialog use:focusTrap={{ enabled: isOpen }}>
    <div use:escapeKey={() => close()}>
      Content
    </div>
  </dialog>
</div>

<div use:portal={'body'}>Renders at body level</div>
```

## Theming

Dark theme is default. Uses singleton pattern with `miozu-theme` storage key.

### Setup

```svelte
<!-- +layout.svelte -->
<script>
  import { getTheme } from '@miozu/jera';
  import { onMount } from 'svelte';

  const theme = getTheme();
  onMount(() => theme.init());
</script>
```

### ThemeToggle

Accessible toggle button with animated sun/moon icons.

```svelte
<script>
  import { ThemeToggle } from '@miozu/jera';
</script>

<ThemeToggle />
<ThemeToggle size="sm" variant="outline" />
<ThemeToggle size="lg" variant="subtle" />
```

Props: `size` (sm|md|lg), `variant` (ghost|outline|subtle), `themeState` (optional)

### ThemeSelect

Three-option selector for light/dark/system preference.

```svelte
<script>
  import { ThemeSelect } from '@miozu/jera';
</script>

<!-- Segmented control (default) -->
<ThemeSelect />

<!-- Dropdown -->
<ThemeSelect variant="dropdown" />

<!-- Custom labels -->
<ThemeSelect labels={{ light: 'Light', dark: 'Dark', system: 'Auto' }} />
```

Props: `variant` (segmented|dropdown), `size` (sm|md|lg), `labels`, `showIcons`

### ThemeState API

```javascript
import { getTheme } from '@miozu/jera';

const theme = getTheme();
theme.toggle();        // Switch between light/dark
theme.set('system');   // Follow system preference
theme.isDark;          // boolean - resolved dark mode
theme.isLight;         // boolean - resolved light mode
theme.current;         // 'light' | 'dark' | 'system'
theme.dataTheme;       // 'miozu-light' | 'miozu-dark'
```

Data-theme values: `miozu-dark` (default) or `miozu-light`.

## AI-First Design

This library includes AI-optimized documentation:

- `llms.txt` — Structured index for LLM consumption
- `CLAUDE.md` — Detailed context for AI assistants
- JSDoc comments throughout the codebase

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

Requires Svelte 5.0+

## License

MIT © [Nicholas Glazer](https://miozu.com)
