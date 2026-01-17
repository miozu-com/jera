# @miozu/jera

A minimal, reactive component library for Svelte 5. Designed for elegance, scalability, and ease of application.

## Philosophy

**Jera** (ᛃ) represents harvest and cycles—building on foundations to yield results. This library embodies:

- **Minimal** — Only what you need, nothing more
- **Reactive** — Built on Svelte 5 runes for fine-grained reactivity
- **Composable** — Mix utilities and components freely
- **Accessible** — ARIA patterns and keyboard navigation built-in
- **Themeable** — CSS variables for complete customization

## Installation

```bash
npm install @miozu/jera
# or
pnpm add @miozu/jera
```

## Quick Start

```svelte
<script>
  import { Button, Select, cn, cv } from '@miozu/jera';
  import '@miozu/jera/tokens';

  let selected = $state(null);
  const options = [
    { value: 'svelte', label: 'Svelte' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' }
  ];
</script>

<Select {options} bind:value={selected} />
<Button onclick={() => console.log(selected)}>Submit</Button>
```

## Core Concepts

### 1. Class Variance (`cv`)

Type-safe variant composition inspired by CVA, optimized for Svelte 5:

```javascript
import { cv } from '@miozu/jera';

const badge = cv({
  base: 'inline-flex items-center rounded-full font-medium',
  variants: {
    color: {
      gray: 'bg-muted/10 text-muted',
      blue: 'bg-primary/10 text-primary',
      green: 'bg-success/10 text-success',
      red: 'bg-error/10 text-error'
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    }
  },
  defaults: { color: 'gray', size: 'md' }
});

// Use in template
<span class={badge({ color: 'blue', size: 'lg' })}>New</span>
```

### 2. Reactive Classes

Compose classes that update automatically with state changes:

```svelte
<script>
  import { cn } from '@miozu/jera';

  let isActive = $state(false);
  let size = $state('md');

  // Reactive: recomputes when dependencies change
  const buttonClass = $derived(cn(
    'base-button',
    isActive && 'is-active',
    `size-${size}`
  ));
</script>

<button class={buttonClass}>Click</button>
```

### 3. Actions

Reusable element behaviors:

```svelte
<script>
  import { clickOutside, focusTrap, autoFocus } from '@miozu/jera/actions';

  let isOpen = $state(false);
</script>

<div use:clickOutside={() => isOpen = false}>
  <dialog use:focusTrap={{ enabled: isOpen }}>
    <input use:autoFocus />
  </dialog>
</div>
```

### 4. Theme State

SSR-safe theme management:

```svelte
<script>
  import { ThemeState, createThemeContext } from '@miozu/jera';
  import { onMount } from 'svelte';

  const theme = createThemeContext();

  onMount(() => theme.init());
</script>

<button onclick={() => theme.toggle()}>
  {theme.resolved === 'dark' ? '☀️' : '🌙'}
</button>
```

## Components

### Button

Polymorphic button with variants:

```svelte
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost" size="sm">Small Ghost</Button>
<Button href="/about">Link Button</Button>
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

<!-- With icons -->
<Button>
  {#snippet iconLeft()}<IconPlus size={16} />{/snippet}
  Add Item
</Button>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'ghost'` | `'outline'` | `'danger'` | `'success'`
- `size`: `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'`
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean
- `href`: string (renders as `<a>`)

### Select

Accessible dropdown with keyboard navigation:

```svelte
<Select
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  bind:value={selected}
  placeholder="Choose..."
  onchange={(opt) => console.log(opt)}
/>

<!-- Custom keys -->
<Select
  options={users}
  bind:value={selectedId}
  labelKey="name"
  valueKey="id"
/>
```

**Props:**
- `options`: Array of `{ label, value }` objects
- `value`: Current selected value (bindable)
- `labelKey`: Key for display label (default: `'label'`)
- `valueKey`: Key for value (default: `'value'`)
- `placeholder`: Placeholder text
- `disabled`: boolean
- `error`: boolean

### Toast

Notification system with auto-dismiss:

```svelte
<!-- Provider (in root layout) -->
<script>
  import { Toast, createToastContext } from '@miozu/jera';
  const toast = createToastContext();
</script>

<Toast />
<slot />

<!-- Usage anywhere -->
<script>
  import { getToastContext } from '@miozu/jera';
  const toast = getToastContext();

  function handleSave() {
    toast.success('Saved successfully!');
  }

  function handleError() {
    toast.error('Something went wrong', { duration: 6000 });
  }
</script>
```

## Design Tokens

Import the CSS tokens for consistent styling:

```css
@import '@miozu/jera/tokens';
```

Available CSS variables:

```css
/* Colors */
--color-bg, --color-surface, --color-border
--color-text, --color-text-strong, --color-muted
--color-primary, --color-secondary, --color-accent
--color-success, --color-warning, --color-error, --color-info

/* Spacing */
--space-1 through --space-16

/* Typography */
--font-sans, --font-serif, --font-mono
--text-xs through --text-4xl

/* Shadows */
--shadow-xs through --shadow-xl

/* Radius */
--radius-sm through --radius-full

/* Transitions */
--duration-fast, --duration-base, --duration-slow
--ease-default, --ease-in, --ease-out, --ease-bounce
```

## Dark Mode

The library uses `data-theme` attribute for theming:

```html
<!-- In your app.html -->
<script>
  const theme = document.cookie.match(/jera-theme=(\w+)/)?.[1]
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
</script>
```

## Advanced Patterns

### Compound Components

Create related components that share state:

```svelte
<script>
  import { setContext, getContext } from 'svelte';

  // Parent sets context
  const TABS_KEY = Symbol('tabs');

  export function createTabsContext() {
    let activeTab = $state(0);
    const ctx = { activeTab, setTab: (i) => activeTab = i };
    setContext(TABS_KEY, ctx);
    return ctx;
  }

  export function getTabsContext() {
    return getContext(TABS_KEY);
  }
</script>
```

### Custom Variants

Extend components with custom variants:

```javascript
import { cv, buttonStyles } from '@miozu/jera';

// Extend button with custom variants
const myButton = cv({
  ...buttonStyles.config,
  variants: {
    ...buttonStyles.config.variants,
    variant: {
      ...buttonStyles.config.variants.variant,
      brand: 'bg-brand-500 text-white hover:bg-brand-600'
    }
  }
});
```

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

Requires Svelte 5.0+

## License

MIT © [Miozu](https://miozu.com)
