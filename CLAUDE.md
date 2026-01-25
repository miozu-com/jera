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
│       ├── primitives/       # Button, Badge, Divider, Avatar
│       ├── forms/            # Input, Select, Checkbox, Switch
│       ├── feedback/         # Toast, Skeleton, ProgressBar, Spinner
│       ├── overlays/         # Modal, Popover
│       ├── navigation/       # Tabs, Accordion, Sidebar
│       └── docs/             # CodeBlock, PropsTable, SplitPane, DocSection
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
- Utilities: camelCase (`getTheme`)
- CSS tokens: kebab-case (`--color-primary`)
- Actions: camelCase (`clickOutside`)

---

## Miozu Base16 Color System

Uses standard Base16 naming: `base00`-`base0F` (hex digits, NOT decimal).

### Grayscale (base00-base07)
| Token | Dark Theme | Light Theme | Usage |
|-------|------------|-------------|-------|
| `--color-base00` | #0f1419 | #ffffff | Primary background |
| `--color-base01` | #1a1f26 | #f8f9fa | Surface/card |
| `--color-base02` | #242a33 | #f1f3f5 | Selection/hover |
| `--color-base03` | #4a5568 | #adb5bd | Muted/disabled |
| `--color-base04` | #a0aec0 | #6c757d | Secondary text |
| `--color-base05` | #e2e8f0 | #212529 | Primary text |
| `--color-base06` | #f7fafc | #1a1d20 | High emphasis |
| `--color-base07` | #ffffff | #0d0f10 | Maximum contrast |

### Accents (base08-base0F)
| Token | Color | Usage |
|-------|-------|-------|
| `--color-base08` | Red | Error |
| `--color-base09` | Orange | Warning |
| `--color-base0A` | Yellow | Highlight |
| `--color-base0B` | Green | Success |
| `--color-base0C` | Cyan | Info |
| `--color-base0D` | Blue | Primary |
| `--color-base0E` | Purple | Accent |
| `--color-base0F` | Brown/Orange | Secondary accent |

### Semantic Mappings
```css
--color-bg: var(--color-base00);
--color-surface: var(--color-base01);
--color-text: var(--color-base05);
--color-text-strong: var(--color-base07);
--color-primary: var(--color-base0D);
--color-success: var(--color-base0B);
--color-error: var(--color-base08);
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

### Stat
```svelte
<Stat value="42" label="Users" />
<Stat value="95%" label="Uptime" status="success" />
<Stat value="75" max={100} label="Progress" showBar />
<Stat value="12" unit="/15" label="Tasks" status="warning" />
<Stat value="8" label="Errors" href="/errors" status="error" />
```

Props: `value`, `label`, `unit`, `secondary`, `status` (success/warning/error/info), `size` (sm/md/lg), `showBar`, `barValue`, `max`, `href`

### Alert
```svelte
<Alert variant="info">This is an informational message.</Alert>
<Alert variant="warning" title="Warning">Please review your settings.</Alert>
<Alert variant="error" dismissible onclose={() => showAlert = false}>
  An error occurred.
</Alert>
<Alert variant="success">
  {#snippet icon()}
    <CheckIcon size={16} />
  {/snippet}
  Your changes have been saved.
</Alert>
```

Props: `variant` (info/success/warning/error), `title`, `dismissible`, `size` (sm/md/lg), `onclose`, `icon` (snippet), `actions` (snippet)

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

### CodeBlock
```svelte
<script>
  import { CodeBlock } from '@miozu/jera';
</script>

<CodeBlock
  code={`const greeting = "Hello";`}
  lang="javascript"
  filename="example.js"
  showLineNumbers
/>
```

Props: `code`, `lang` (default: javascript), `filename`, `showLineNumbers`, `class`

**Requires:** `shiki` package for syntax highlighting.

### PropsTable
```svelte
<script>
  import { PropsTable } from '@miozu/jera';
</script>

<PropsTable props={[
  { name: 'variant', type: 'string', default: '"default"', description: 'Visual style' },
  { name: 'onclick', type: 'function', required: true, description: 'Click handler' }
]} />
```

Props: `props` (array of PropDef), `class`

PropDef: `{ name, type, default?, description, required? }`

### SplitPane
```svelte
<script>
  import { SplitPane, CodeBlock } from '@miozu/jera';
</script>

<SplitPane ratio="1:1" gap="2rem" stickyRight>
  {#snippet left()}
    <h2>Description</h2>
    <p>Explanation of the feature...</p>
  {/snippet}
  {#snippet right()}
    <CodeBlock code={exampleCode} lang="javascript" />
  {/snippet}
</SplitPane>
```

Props: `left` (snippet), `right` (snippet), `ratio` (e.g., '1:1', '2:1'), `gap`, `minHeight`, `stickyRight`, `class`

### DocSection
```svelte
<script>
  import { DocSection, CodeBlock } from '@miozu/jera';
</script>

<DocSection id="installation" title="Installation" description="How to install">
  <CodeBlock code="npm install @miozu/jera" lang="bash" />
</DocSection>
```

Props: `id`, `title`, `description`, `level` (2-6), `showAnchor`, `children`, `class`

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

### Theme Switching (Single Source of Truth Pattern)

jera uses a singleton pattern for global theme state. Storage key: `miozu-theme`.

#### SvelteKit Execution Order (from source code analysis)

Understanding when code runs helps choose the right pattern:

| Phase | File | Server | Client | Notes |
|-------|------|--------|--------|-------|
| 1 | +layout.server.js | ✓ | - | Server-only data |
| 2 | +layout.js | ✓ | ✓ | Universal load, runs on EVERY navigation |
| 3 | +layout.svelte `<script>` | ✓ | ✓ | Component script, runs once on mount |
| 4 | +layout.svelte `onMount()` | - | ✓ | Client-only, after hydration |

**Key insight from SvelteKit source (`client.js:684`):**
```javascript
data = { ...data, ...node.data };  // Parent data cascades to children
```

#### Recommended Pattern: +layout.svelte (for singletons like theme)

For global singleton state that doesn't need server context:

```svelte
<!-- +layout.svelte - Initialize ONCE, pass via props -->
<script>
  import { getTheme } from '@miozu/jera';
  import { onMount } from 'svelte';
  import { Sidebar } from '$components';

  // Call singleton once in root layout
  const themeState = getTheme();

  onMount(() => {
    themeState.sync();  // Hydrate from DOM (app.html)
    themeState.init();  // Setup media query listener
  });
</script>

<!-- Pass themeState as prop to children -->
<Sidebar {themeState} />
```

```svelte
<!-- Child component - receives themeState as prop -->
<script>
  // DON'T call getTheme() here - receive as prop instead
  let { themeState } = $props();

  function handleToggle() {
    themeState.toggle();
  }

  let isDark = $derived(themeState.isDark);
</script>
```

#### Alternative Pattern: +layout.js (for data-heavy state)

For state that needs server context or async initialization:

```javascript
// +layout.js - Universal load
export const load = async ({ data, fetch }) => {
  // Can fetch data, access parent(), etc.
  const someData = await fetch('/api/data').then(r => r.json());

  return {
    ...data,
    someData
  };
};
```

**When to use which:**

| Use +layout.svelte | Use +layout.js |
|-------------------|----------------|
| Singletons (theme, toast) | Fetched data |
| Client-only initialization | Async operations |
| No server context needed | Needs `parent()` data |
| Runs once per mount | Needs invalidation support |

**ThemeState API:**
```javascript
themeState.toggle();         // Toggle dark/light
themeState.set('dark');      // Set to dark
themeState.set('light');     // Set to light
themeState.set('system');    // Follow system preference

// Reactive properties
themeState.current;    // 'light' | 'dark' | 'system'
themeState.resolved;   // 'light' | 'dark' (actual resolved value)
themeState.dataTheme;  // 'miozu-light' | 'miozu-dark'
themeState.isDark;     // boolean
themeState.isLight;    // boolean
```

**Why pass as props instead of calling `getTheme()` everywhere?**
1. **Explicit data flow** - You see what state each component depends on
2. **Better testing** - Can inject mock state easily
3. **Single initialization** - Clear where state originates
4. **Efficiency** - Singleton runs once, not on every navigation

### Theme Data Attributes

| Theme | data-theme value |
|-------|------------------|
| Dark | `miozu-dark` |
| Light | `miozu-light` |

CSS selectors should use:
```css
[data-theme='miozu-dark'] { /* dark styles */ }
[data-theme='miozu-light'] { /* light styles */ }
```

### Migration Guide: Custom Theme → Jera Singleton

If you have a custom `theme.svelte.js` or similar, follow these steps:

#### Step 1: Update app.html
Replace custom theme script with unified storage key:
```javascript
// CRITICAL: Prevent FOUC - runs before any CSS
(function () {
  try {
    let pref = localStorage.getItem('miozu-theme');

    // Migrate from old keys if needed
    if (!pref || !['light', 'dark', 'system'].includes(pref)) {
      const oldTheme = localStorage.getItem('theme'); // or your old key
      if (oldTheme === 'miozu-dark' || oldTheme === 'dark') pref = 'dark';
      else if (oldTheme === 'miozu-light' || oldTheme === 'light') pref = 'light';
    }

    // Resolve theme
    let theme;
    if (pref === 'light') theme = 'miozu-light';
    else if (pref === 'dark') theme = 'miozu-dark';
    else {
      theme = window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'miozu-dark' : 'miozu-light';
      pref = 'system';
    }

    // Apply and persist
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme === 'miozu-dark' ? 'dark' : 'light';
    localStorage.setItem('miozu-theme', pref);
    document.cookie = 'miozu-theme=' + pref + '; path=/; max-age=31536000; SameSite=Lax';

    // Clean up old keys
    localStorage.removeItem('theme');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'miozu-dark');
  }
})();
```

#### Step 2: Update +layout.svelte
```svelte
<script>
  import { getTheme } from '@miozu/jera';
  import { onMount } from 'svelte';

  const themeState = getTheme();

  onMount(() => {
    themeState.sync();
    themeState.init();
  });
</script>
```

#### Step 3: Update +layout.js
Remove any theme initialization - it should NOT be in +layout.js:
```javascript
// REMOVE these lines:
// import { ThemeReactiveState } from '$lib/reactiveStates/theme.svelte.js';
// const themeState = new ThemeReactiveState();
// return { themeState, ... };
```

#### Step 4: Update components using theme
```svelte
<script>
  // OLD (remove):
  // import { getThemeState } from '$lib/reactiveStates/theme.svelte.js';
  // const themeState = getThemeState();

  // NEW:
  import { getTheme } from '@miozu/jera';
  const themeState = getTheme();

  let isDark = $derived(themeState.isDark);
</script>
```

#### Step 5: Delete old theme file
```bash
rm src/lib/reactiveStates/theme.svelte.js
```

#### Step 6: Verify no old imports remain
```bash
grep -r "theme.svelte.js\|getThemeState\|ThemeReactiveState" src/
# Should return no matches
```

### Apps Using Jera Theme (Proof of Concept)

| App | Status | Storage Key |
|-----|--------|-------------|
| dash.selify.ai | ✓ Migrated | `miozu-theme` |
| admin.selify.ai | ✓ Migrated | `miozu-theme` |
| miozu.com | ✓ Migrated | `miozu-theme` |

All three apps share the same theme preference via unified `miozu-theme` localStorage key.

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
