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

### Miozu Color Palette

| Base | Hex | Accent | Hex |
|------|-----|--------|-----|
| base0 | `#232733` | magenta | `#C974E6` |
| base1 | `#2C3040` | blue | `#83D2FC` |
| base2 | `#3E4359` | green | `#6DD672` |
| base3 | `#565E78` | yellow | `#E8D176` |
| base4 | `#737E99` | red | `#EB3137` |
| base5 | `#D0D2DB` | cyan | `#40FFE2` |
| base6 | `#F3F4F7` | orange | `#FF9837` |
| base7 | `#FAFDFB` | peach | `#FF9982` |

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

Dark theme is default. Switch themes with `data-theme` attribute:

```html
<html data-theme="dark">  <!-- Dark (default) -->
<html data-theme="light"> <!-- Light -->
```

Or use ThemeState:

```javascript
import { createThemeContext } from '@miozu/jera';

const theme = createThemeContext();
theme.init();    // Reads from localStorage/system preference
theme.toggle();  // Switch between light/dark
```

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
