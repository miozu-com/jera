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
│   ├── layouts/              # Optional layout utilities
│   │   └── index.css         # Page, metric, card, table patterns
│   ├── utils/
│   │   ├── cn.svelte.js      # cn(), cv() class utilities
│   │   └── reactive.svelte.js # ThemeState, reactive helpers
│   ├── actions/
│   │   └── index.js          # Svelte actions
│   └── components/
│       ├── primitives/       # Button, Badge, Divider, Avatar
│       ├── forms/            # Input, Select, Checkbox, Switch
│       ├── feedback/         # Toast, Skeleton, ProgressBar, Spinner
│       ├── overlays/         # Modal, Popover
│       └── navigation/       # Tabs, Accordion, AccordionItem
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

### Modal
```svelte
<script>
  import { Modal, Button } from '@miozu/jera';
  let showModal = $state(false);
</script>

<Button onclick={() => showModal = true}>Open Modal</Button>

<Modal bind:open={showModal} title="Confirm Action" variant="danger">
  <p>Are you sure you want to proceed?</p>
  {#snippet footer()}
    <Button variant="ghost" onclick={() => showModal = false}>Cancel</Button>
    <Button variant="danger" onclick={handleConfirm}>Confirm</Button>
  {/snippet}
</Modal>
```

Props: `open`, `title`, `size` (sm/md/lg/xl), `variant` (default/danger/warning/success/info), `closeOnBackdrop`, `closeOnEscape`, `showClose`, `children`, `footer`, `icon`, `onclose`

### Popover
```svelte
<script>
  import { Popover, Button } from '@miozu/jera';
</script>

<Popover content="Helpful tooltip text" position="top">
  <Button>Hover me</Button>
</Popover>
```

Props: `content`, `position` (top/bottom/left/right), `delay` ({show, hide}), `offset`

### Divider
```svelte
<Divider />
<Divider orientation="vertical" />
<Divider>or continue with</Divider>
```

Props: `orientation` (horizontal/vertical), `thickness`, `spacing`, `children`

### Avatar
```svelte
<Avatar src="/user.jpg" alt="John Doe" />
<Avatar name="John Doe" />
<Avatar src="/user.jpg" status="online" size="lg" />
```

Props: `src`, `alt`, `name`, `size` (xs/sm/md/lg/xl/2xl), `status` (online/offline/busy/away)

### Skeleton
```svelte
<Skeleton width="80%" />
<Skeleton variant="circle" size="48px" />
<Skeleton variant="rect" width="100%" height="200px" />
<Skeleton lines={3} />
```

Props: `variant` (text/heading/circle/rect), `width`, `height`, `size`, `lines`, `animate`

### ProgressBar
```svelte
<ProgressBar value={65} />
<ProgressBar value={80} showLabel variant="success" />
<ProgressBar indeterminate />
```

Props: `value`, `max`, `size` (sm/md/lg), `variant` (primary/success/warning/error/info), `showLabel`, `label`, `indeterminate`

### Spinner
```svelte
<Spinner />
<Spinner size="lg" color="var(--color-base11)" />
```

Props: `size` (xs/sm/md/lg/xl), `color`, `label`

### Tabs
```svelte
<script>
  import { Tabs } from '@miozu/jera';
  let activeTab = $state('tab1');
</script>

<Tabs
  tabs={[
    { id: 'tab1', label: 'Overview' },
    { id: 'tab2', label: 'Settings', badge: 3 },
    { id: 'tab3', label: 'Analytics', disabled: true }
  ]}
  bind:active={activeTab}
  variant="underline"
/>
```

Props: `tabs` (array), `active`, `variant` (default/underline/pills), `size` (sm/md/lg), `fullWidth`, `onchange`

### Accordion
```svelte
<script>
  import { Accordion, AccordionItem } from '@miozu/jera';
</script>

<Accordion multiple>
  <AccordionItem id="section1" title="Section 1">
    Content for section 1
  </AccordionItem>
  <AccordionItem id="section2" title="Section 2">
    Content for section 2
  </AccordionItem>
</Accordion>
```

Accordion props: `expanded` (array of ids), `multiple`
AccordionItem props: `id`, `title`, `disabled`

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

## Layout Utilities (Optional CSS)

jera provides optional CSS layout utilities for common dashboard/app patterns.
These are **pure CSS** (no Tailwind required) and use `@layer jera-layouts` for specificity control.

### Import
```css
/* In your app.css - import after theme/tokens */
@import '@miozu/jera/layouts';
```

### Available Classes

| Category | Classes |
|----------|---------|
| **Page** | `.page`, `.page-flex`, `.page-header`, `.page-header-row`, `.page-title`, `.page-subtitle` |
| **Section** | `.section-header`, `.section-header-count` |
| **Metrics** | `.metric-strip`, `.metric-strip-bordered`, `.metric`, `.metric-value`, `.metric-label`, `.metric-dim`, `.metric-bar`, `.metric-bar-fill`, `.metric.alert` |
| **Status** | `.status-dot`, `.status-dot-ok`, `.status-dot-warn`, `.status-dot-err` |
| **Cards** | `.card`, `.card-hover`, `.card-interactive` |
| **Tables** | `.data-table`, `.table-wrap` |
| **Tags** | `.tag`, `.tag-ok`, `.tag-warn`, `.tag-err`, `.tag-info` |
| **Tabs** | `.tab-nav`, `.tab-btn`, `.tab-btn.active` |
| **Buttons** | `.btn-primary`, `.btn-secondary`, `.btn-ghost` |
| **Links** | `.link`, `.link-arrow` |
| **Empty** | `.empty-state`, `.empty-state-large` |
| **Forms** | `.filter-select` |

### Usage Example
```svelte
<div class="page">
  <header class="page-header">
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Overview of system metrics</p>
  </header>

  <div class="metric-strip">
    <div class="metric">
      <span class="metric-value">42<span class="metric-dim">%</span></span>
      <span class="metric-label">CPU Usage</span>
    </div>
    <div class="metric" class:alert={errors > 0}>
      <span class="metric-value">{errors}</span>
      <span class="metric-label">Errors</span>
    </div>
  </div>

  <section>
    <h2 class="section-header">Services</h2>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Status</th></tr></thead>
      <tbody>
        <tr>
          <td>API</td>
          <td><span class="tag tag-ok">Healthy</span></td>
        </tr>
      </tbody>
    </table>
  </section>
</div>
```

### Philosophy
- **Opt-in**: Only import if you need these patterns
- **Pure CSS**: No Tailwind/preprocessor required
- **Token-based**: Uses jera `--color-*` and `--space-*` variables
- **Layered**: Uses `@layer jera-layouts` so won't fight your styles
- **Composable**: Mix with Tailwind utilities or custom CSS

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

### Supported Theme Selectors
jera supports multiple theme attribute values for flexibility:

| Theme | Selectors |
|-------|-----------|
| Dark | `[data-theme="dark"]`, `[data-theme="miozu-dark"]`, `.dark` |
| Light | `[data-theme="light"]`, `[data-theme="miozu-light"]`, `.light` |
| High Contrast | `[data-theme="high-contrast"]` |

This allows jera to integrate with any theming system. For example:
- Selify apps use `miozu-dark` / `miozu-light`
- Generic apps can use `dark` / `light`
- Class-based theming via `.dark` / `.light`

---

## Integration with dash.selify.ai

jera components work out-of-the-box with dash.selify.ai. The semantic tokens are already configured in both systems.

### Required: Import jera tokens
```css
/* In your app.css or layout */
@import '@miozu/jera/tokens/colors.css';
```

### Semantic Token Mapping
| jera Token | dash.selify.ai Equivalent |
|------------|---------------------------|
| `--color-bg` | `--color-base00` |
| `--color-surface` | `--color-base01` |
| `--color-surface-alt` | `--color-base02` |
| `--color-text` | `--color-base05` |
| `--color-text-strong` | `--color-base07` |
| `--color-text-muted` | `--color-base04` |
| `--color-primary` | `--color-base0D` |
| `--color-success` | `--color-base0B` |
| `--color-warning` | `--color-base0A` |
| `--color-error` | `--color-base08` |
| `--color-info` | `--color-base0C` |

### Using jera Components in dash.selify.ai
```svelte
<script>
  import { Button, Modal, Input } from '@miozu/jera';

  let showModal = $state(false);
</script>

<!-- Works with existing dash.selify.ai theme system -->
<Button variant="primary" onclick={() => showModal = true}>
  Open Modal
</Button>

<Modal bind:open={showModal} title="Example">
  <Input placeholder="Type here..." />
</Modal>
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
