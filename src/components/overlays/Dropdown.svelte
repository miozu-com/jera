<!--
  @component Dropdown

  Portaled action menu with viewport-aware positioning, keyboard navigation,
  and ARIA attributes. Content renders at body level to avoid clipping.

  Dismissal follows the ARIA APG menu-button pattern: Escape closes the menu
  and returns focus to the trigger, Tab closes it, and a click anywhere outside
  closes it (the open menu is backed by a full-viewport click layer).

  @example
  <Dropdown>
    {#snippet trigger()}
      <Button>Options</Button>
    {/snippet}
    <DropdownItem onclick={handleEdit}>Edit</DropdownItem>
    <DropdownItem onclick={handleDelete} variant="danger">Delete</DropdownItem>
  </Dropdown>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    open = $bindable(false),
    position = 'bottom-start',
    trigger,
    children,
    class: className = ''
  } = $props();

  // Feature detection for CSS Anchor Positioning
  const supportsAnchor = typeof CSS !== 'undefined' && CSS.supports('anchor-name', '--test');

  // Generate unique anchor name for this instance
  const anchorName = `--dropdown-anchor-${Math.random().toString(36).slice(2, 9)}`;

  let triggerEl = $state(null);
  let triggerWrapEl = $state(null);
  let contentEl = $state(null);
  let floatingStyle = $state('');
  let resolvedPosition = $state(position);

  // The caller passes the real control (a <button>) via the `trigger` snippet,
  // so ARIA state must live on that focusable element — not the wrapper div, or
  // screen readers announce the menu state on a non-interactive node (WCAG 4.1.2).
  // Resolve the focusable child and keep aria-haspopup/aria-expanded synced to it.
  function focusableTrigger() {
    if (!triggerWrapEl) return null;
    return (
      triggerWrapEl.querySelector(
        'button, [href], [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || triggerWrapEl.firstElementChild
    );
  }

  $effect(() => {
    const el = focusableTrigger();
    if (!el) return;
    el.setAttribute('aria-haspopup', 'menu');
    el.setAttribute('aria-expanded', String(open));
  });

  function toggle(e) {
    e.stopPropagation();
    open = !open;
  }

  function close() {
    open = false;
  }

  // APG menu-button pattern: Escape dismisses and returns focus to the button.
  function closeAndFocusTrigger() {
    const el = focusableTrigger();
    open = false;
    el?.focus();
  }

  // JS fallback positioning (only used when CSS Anchor not supported)
  function updatePosition() {
    if (!triggerEl || !contentEl || supportsAnchor) return;

    const rect = triggerEl.getBoundingClientRect();
    const contentRect = contentEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const gap = 4;

    // Determine vertical placement
    let preferBottom = position.startsWith('bottom');
    const spaceBelow = viewportH - rect.bottom - gap;
    const spaceAbove = rect.top - gap;

    // Auto-flip if not enough space
    if (preferBottom && spaceBelow < contentRect.height && spaceAbove > spaceBelow) {
      preferBottom = false;
    } else if (!preferBottom && spaceAbove < contentRect.height && spaceBelow > spaceAbove) {
      preferBottom = true;
    }

    let top;
    if (preferBottom) {
      top = rect.bottom + gap;
      resolvedPosition = position.replace('top', 'bottom');
    } else {
      top = rect.top - contentRect.height - gap;
      resolvedPosition = position.replace('bottom', 'top');
    }

    // Determine horizontal placement
    let left;
    const align = position.split('-')[1] || 'start';

    if (align === 'end') {
      left = rect.right - contentRect.width;
    } else if (align === 'center') {
      left = rect.left + (rect.width - contentRect.width) / 2;
    } else {
      left = rect.left;
    }

    // Clamp to viewport edges
    if (left + contentRect.width > viewportW - 8) {
      left = viewportW - contentRect.width - 8;
    }
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    floatingStyle = `top:${top}px;left:${left}px`;
  }

  // Keyboard navigation within items.
  // Escape is handled here — on the open menu's subtree — rather than with a
  // document-level listener, because consumers open a Modal from a menu item
  // while leaving the menu open; a global handler would swallow the Modal's
  // own Escape. Focus always lands inside the menu on open, so this fires.
  function handleContentKeydown(e) {
    if (e.key === 'Escape') {
      // preventDefault stops an ancestor <dialog> from also treating this as a
      // close request; stopPropagation keeps consumer-level handlers out of it.
      e.preventDefault();
      e.stopPropagation();
      closeAndFocusTrigger();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = Array.from(contentEl.querySelectorAll('[role="menuitem"]:not([disabled])'));
      if (items.length === 0) return;

      const current = items.indexOf(document.activeElement);
      let next;

      if (e.key === 'ArrowDown') {
        next = current < items.length - 1 ? current + 1 : 0;
      } else {
        next = current > 0 ? current - 1 : items.length - 1;
      }

      items[next]?.focus();
    } else if (e.key === 'Tab') {
      close();
    }
  }

  $effect(() => {
    if (open && triggerEl) {
      requestAnimationFrame(() => {
        if (!supportsAnchor) updatePosition();
        // Focus first item (always, regardless of positioning method).
        // Fall back to the menu container so an item-less menu still holds
        // focus — otherwise Escape would never reach handleContentKeydown.
        const firstItem = contentEl?.querySelector('[role="menuitem"]:not([disabled])');
        (firstItem ?? contentEl)?.focus();
      });
    }
  });
</script>

<div
  class={cn('dropdown', className)}
  style={supportsAnchor ? `anchor-name: ${anchorName};` : ''}
  bind:this={triggerEl}
>
  <!-- ARIA (haspopup/expanded) is set on the focusable child trigger via $effect,
       not on this wrapper, so screen readers announce state on the real control. -->
  <div
    class="dropdown-trigger"
    onclick={toggle}
    bind:this={triggerWrapEl}
  >
    {@render trigger?.()}
  </div>
</div>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="dropdown-portal-backdrop"
    onclick={close}
    onkeydown={handleContentKeydown}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="dropdown-content"
      class:dropdown-anchor={supportsAnchor}
      class:dropdown-enter-up={!supportsAnchor && resolvedPosition.startsWith('top')}
      data-position={position}
      bind:this={contentEl}
      style={supportsAnchor ? `position-anchor: ${anchorName};` : floatingStyle}
      role="menu"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
    >
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    display: inline-flex;
  }

  .dropdown-portal-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-popover);
  }

  .dropdown-content {
    position: fixed;
    z-index: var(--z-popover);
    min-width: 8rem;
    padding: var(--space-2);
    background: var(--color-base01);
    border: var(--border-width-thin) solid color-mix(in srgb, var(--color-base03) 50%, transparent);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    opacity: 1;
    transform: translateY(0) scale(1);
    outline: none;

    /* @starting-style prevents flash of final state before animation starts */
    @starting-style {
      opacity: 0;
      transform: translateY(-4px) scale(0.97);
    }
  }

  /* Container is focusable (tabindex="-1") as a fallback focus target, so give
     it the themed ring instead of the UA outline when focus is keyboard-driven. */
  .dropdown-content:focus-visible {
    box-shadow: var(--shadow-lg), var(--focus-ring-shadow);
  }

  /* CSS Anchor Positioning (Chrome 125+) */
  .dropdown-anchor {
    inset: unset;

    /* Default: bottom-start */
    top: calc(anchor(bottom) + 4px);
    left: anchor(left);

    /* Auto-flip when near viewport edges */
    position-try-fallbacks: flip-block;

    &[data-position="bottom-end"] {
      left: unset;
      right: anchor(right);
    }

    &[data-position="bottom-center"] {
      left: anchor(center);
      translate: -50% 0;
    }

    &[data-position="top-start"] {
      top: unset;
      bottom: calc(anchor(top) + 4px);
      left: anchor(left);
    }

    &[data-position="top-end"] {
      top: unset;
      bottom: calc(anchor(top) + 4px);
      left: unset;
      right: anchor(right);
    }

    &[data-position="top-center"] {
      top: unset;
      bottom: calc(anchor(top) + 4px);
      left: anchor(center);
      translate: -50% 0;
    }
  }

  /* JS fallback: animation for top-positioned */
  .dropdown-enter-up {
    @starting-style {
      opacity: 0;
      transform: translateY(4px) scale(0.97);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .dropdown-content {
      animation: dropdown-enter 0.12s var(--ease-out);
      transition: opacity 0.12s var(--ease-out), transform 0.12s var(--ease-out);
    }

    .dropdown-enter-up {
      animation-name: dropdown-enter-up;
    }

    @keyframes dropdown-enter {
      from { opacity: 0; transform: translateY(-4px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes dropdown-enter-up {
      from { opacity: 0; transform: translateY(4px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  }
</style>
