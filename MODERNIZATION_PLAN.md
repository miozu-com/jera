# jera Modernization Plan - Native Browser APIs (2026)

**Created:** February 2026
**Status:** Planning
**Goal:** Replace JS-heavy implementations with native browser APIs for better performance, smaller bundle size, and improved accessibility

---

## Executive Summary

Modern browsers (2025+) now provide native APIs that can replace ~70% of the JavaScript in our overlay components. This plan outlines a phased approach to modernize jera while maintaining backwards compatibility.

### Expected Benefits

| Metric | Current | After Modernization |
|--------|---------|---------------------|
| Modal.svelte | ~233 lines, custom focus trap | ~150 lines, native `<dialog>` |
| Popover.svelte | ~207 lines, JS positioning | ~80 lines, CSS Anchor Positioning |
| Toast.svelte | ~262 lines, JS portal | ~180 lines, popover + top-layer |
| Bundle overhead | ~4KB for overlay utilities | ~1KB (native APIs) |
| Time to Interactive | JS must load first | Instant (CSS-first) |

---

## Phase 1: Native `<dialog>` for Modal (HIGH PRIORITY)

### Current Implementation Issues
- Custom `focusTrap` action (JS-based)
- Custom `escapeKey` action
- Custom `portal` action to move to body
- Manual backdrop click handling
- z-index management

### Native Solution

```html
<dialog>
  <!-- Content automatically gets focus trap, ESC handling, backdrop -->
</dialog>
```

### Performance Comparison

| Feature | Current (JS) | Native `<dialog>` |
|---------|--------------|-------------------|
| Focus trap | Custom JS action (~50 lines) | **Built-in** |
| ESC to close | Custom JS action (~20 lines) | **Built-in** |
| Backdrop | CSS `::backdrop` pseudo | CSS `::backdrop` (same) |
| Top-layer | `portal` action + z-index | **Built-in top-layer** |
| Inert background | Not implemented | **Built-in `inert`** |
| Accessibility | Manual ARIA | **Built-in roles** |

### Migration Path

```svelte
<!-- NEW: Modal.svelte using native <dialog> -->
<script>
  let {
    open = $bindable(false),
    title = '',
    // ... same props
  } = $props();

  let dialogEl = $state(null);

  // Sync open state with dialog
  $effect(() => {
    if (!dialogEl) return;
    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  });

  // Handle native close event (ESC, form[method=dialog])
  function handleClose() {
    open = false;
    onclose?.();
  }
</script>

<dialog
  bind:this={dialogEl}
  onclose={handleClose}
  onclick={(e) => closeOnBackdrop && e.target === dialogEl && dialogEl.close()}
>
  <!-- Same content structure -->
</dialog>

<style>
  dialog {
    /* Native dialog styles */
    border: none;
    border-radius: 0.75rem;
    background: var(--color-base01);
    box-shadow: var(--shadow-2xl);
    max-width: 28rem;
    width: 100%;
    padding: 0;
  }

  dialog::backdrop {
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
    backdrop-filter: blur(4px);
  }

  /* Entry animation with @starting-style */
  dialog[open] {
    opacity: 1;
    transform: scale(1);
  }

  @starting-style {
    dialog[open] {
      opacity: 0;
      transform: scale(0.95);
    }
  }

  dialog {
    transition: opacity 0.2s, transform 0.2s, overlay 0.2s allow-discrete, display 0.2s allow-discrete;
  }
</style>
```

### What We Can Remove
- `focusTrap` action (for modals)
- `escapeKey` action (for modals)
- `portal` action (for modals)
- ~100 lines of JS

### Browser Support
- **Baseline:** March 2022 (100% support)
- **Invoker Commands:** January 2026 (Chrome 135, Firefox 144, Safari 26.2)

### Recommendation: **MIGRATE NOW**

---

## Phase 2: Popover API + Anchor Positioning (MEDIUM PRIORITY)

### Current Implementation Issues
- Complex JS positioning logic (~60 lines)
- Window resize/scroll listeners
- `requestAnimationFrame` for positioning
- Manual viewport boundary detection

### Native Solution

```html
<button popovertarget="tooltip">Hover me</button>
<div id="tooltip" popover>Tooltip content</div>
```

With CSS Anchor Positioning:
```css
[popover] {
  position-anchor: --trigger;
  position: absolute;
  top: anchor(bottom);
  left: anchor(center);
  position-try-fallbacks: flip-block, flip-inline;
}
```

### Performance Comparison

| Feature | Current (JS) | Native Popover + Anchor |
|---------|--------------|-------------------------|
| Positioning | JS getBoundingClientRect | **CSS anchor()** |
| Flip on overflow | Manual JS detection | **position-try-fallbacks** |
| Scroll handling | JS scroll listeners | **Automatic** |
| Bundle size | ~2KB | **0KB** |
| Frame rate | JS-dependent | **Compositor thread** |

### Browser Support Status

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Popover API | 114+ ✅ | 125+ ✅ | 17+ ✅ |
| Anchor Positioning | 125+ ✅ | ❌ (flag) | ❌ |

### Recommendation: **PROGRESSIVE ENHANCEMENT**

Create new `PopoverNative.svelte` that uses native APIs with JS fallback:

```svelte
<script>
  const supportsAnchor = CSS.supports('position-anchor', '--test');
</script>

{#if supportsAnchor}
  <!-- Native implementation -->
{:else}
  <!-- Current JS implementation -->
{/if}
```

---

## Phase 3: Toast with Popover API (MEDIUM PRIORITY)

### Current Implementation
- Custom `portal` action
- Fixed positioning with JS
- Manual z-index (9999)
- Timer management in component

### Native Approach

Toasts can use `popover="manual"` for:
- Automatic top-layer placement (no z-index wars)
- No portal needed
- Native show/hide methods

```html
<div popover="manual" id="toast-container">
  <!-- Toasts render here -->
</div>
```

### Key Insight

> "Popovers create a new stacking context in the top layer, above all other content."

This means toasts will **always** appear above modals, dialogs, and other content without z-index hacks.

### Performance Benefits

| Aspect | Current | Native Popover |
|--------|---------|----------------|
| Rendering layer | Main thread | **Top layer (compositor)** |
| z-index conflicts | Possible | **Impossible** |
| Portal overhead | JS action | **None** |

### Recommendation: **MIGRATE** (Popover API is Baseline)

---

## Phase 4: View Transitions (LOW PRIORITY - Future)

### Use Cases in jera
- Tab switching animations
- Accordion expand/collapse
- Modal open/close transitions
- List item reordering

### Current State
- Using Svelte transitions (`fly`, `fade`)
- Works well but doesn't persist across DOM changes

### Native Approach

```javascript
document.startViewTransition(() => {
  // Update DOM
  activeTab = newTab;
});
```

```css
::view-transition-old(tab-content) {
  animation: fade-out 0.2s ease-out;
}
::view-transition-new(tab-content) {
  animation: fade-in 0.2s ease-in;
}
```

### Browser Support
- **Baseline Newly Available:** October 2025
- All major browsers now support same-document transitions

### Recommendation: **OPTIONAL ENHANCEMENT**
- Keep Svelte transitions as default
- Add opt-in View Transitions for apps that want them

---

## Phase 5: CSS Scroll-Driven Animations (LOW PRIORITY)

### Potential Uses
- Progress indicators tied to scroll
- Parallax effects in docs
- Reveal animations

### Not Needed For
- Current jera components don't have scroll-dependent animations

### Recommendation: **DOCUMENT ONLY**
- Add to ARCHITECTURE.md as available feature
- Let consumers use it in their apps

---

## Implementation Priority Matrix

| Component | Priority | Effort | Impact | Native API |
|-----------|----------|--------|--------|------------|
| Modal → `<dialog>` | 🔴 HIGH | Low | High | `<dialog>` + Invoker |
| Toast → popover | 🟡 MEDIUM | Low | Medium | `popover="manual"` |
| Popover → anchor | 🟡 MEDIUM | Medium | High | Anchor Positioning |
| Dropdown → popover | 🟡 MEDIUM | Low | Medium | `popover` + Invoker |
| View Transitions | 🟢 LOW | Medium | Low | View Transitions API |

---

## Migration Strategy

### Step 1: Create Native Variants (Non-Breaking)
```
components/
├── overlays/
│   ├── Modal.svelte          # Current (keep)
│   ├── ModalNative.svelte    # New native version
│   ├── Popover.svelte        # Current (keep)
│   └── PopoverNative.svelte  # New native version
```

### Step 2: Feature Detection Wrapper
```javascript
// Auto-select best implementation
export { default as Modal } from supportsDialog
  ? './ModalNative.svelte'
  : './Modal.svelte';
```

### Step 3: Deprecation Path
- v0.6.0: Add native variants
- v0.7.0: Native becomes default, legacy available
- v1.0.0: Remove legacy implementations

---

## Performance Benchmarks Needed

Before implementation, we should measure:

1. **Bundle size reduction**
   - Current overlay components total size
   - Size after removing portal/focusTrap/escapeKey actions

2. **Runtime performance**
   - Modal open/close time (current vs native)
   - Memory usage with multiple toasts
   - Frame rate during popover positioning

3. **Lighthouse scores**
   - Time to Interactive improvement
   - Total Blocking Time reduction

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Browser compat issues | Low | Medium | Feature detection + fallbacks |
| Breaking changes | Medium | High | Phased rollout, dual implementations |
| Missing features | Low | Low | Native APIs are well-specified |
| Animation differences | Medium | Low | CSS `@starting-style` for consistency |

---

## Decision Summary

### Immediate Actions (v0.6.0)
1. ✅ Migrate Modal to native `<dialog>` - **HIGH VALUE, LOW RISK**
2. ✅ Migrate Toast container to `popover="manual"` - **MEDIUM VALUE, LOW RISK**

### Future Consideration (v0.7.0+)
3. ⏳ Popover with CSS Anchor Positioning - **Wait for Firefox/Safari support**
4. ⏳ View Transitions integration - **Optional, app-level concern**

### Not Recommended
- ❌ Scroll-driven animations in components - **App-level, not library-level**

---

## References

- [MDN: `<dialog>` Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [Chrome: Anchor Positioning](https://developer.chrome.com/blog/anchor-positioning-api)
- [Chrome: View Transitions 2025](https://developer.chrome.com/blog/view-transitions-in-2025)
- [web.dev: Dialog and Popover](https://web.dev/learn/css/popover-and-dialog)
- [Smashing: Transitioning Top-Layer](https://www.smashingmagazine.com/2025/01/transitioning-top-layer-entries-display-property-css/)
- [LogRocket: Native Web APIs 2025](https://blog.logrocket.com/can-native-web-apis-replace-custom-components-2025/)
