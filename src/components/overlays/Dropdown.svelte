<!--
  @component Dropdown

  Portaled action menu with viewport-aware positioning, keyboard navigation,
  and ARIA attributes. Content renders at body level to avoid clipping.

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
  import { clickOutside, escapeKey } from '../../actions/index.js';
  import { cn } from '../../utils/cn.svelte.js';

  let {
    open = $bindable(false),
    position = 'bottom-start',
    trigger,
    children,
    class: className = ''
  } = $props();

  let triggerEl = $state(null);
  let contentEl = $state(null);
  let floatingStyle = $state('');
  let resolvedPosition = $state(position);

  function toggle(e) {
    e.stopPropagation();
    open = !open;
  }

  function close() {
    open = false;
  }

  function updatePosition() {
    if (!triggerEl || !contentEl) return;

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

  // Keyboard navigation within items
  function handleContentKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
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
      // Wait for content to mount, then position
      requestAnimationFrame(() => {
        updatePosition();
        // Focus first item
        const firstItem = contentEl?.querySelector('[role="menuitem"]:not([disabled])');
        firstItem?.focus();
      });
    }
  });
</script>

<div
  class={cn('dropdown', className)}
  bind:this={triggerEl}
>
  <div
    class="dropdown-trigger"
    onclick={toggle}
    aria-haspopup="true"
    aria-expanded={open}
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
      class:dropdown-enter-up={resolvedPosition.startsWith('top')}
      bind:this={contentEl}
      style={floatingStyle}
      role="menu"
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
    padding: var(--space-1);
    background: var(--color-base01);
    border: 1px solid color-mix(in srgb, var(--color-base03) 50%, transparent);
    border-radius: var(--radius-md);
    box-shadow:
      0 4px 12px -4px rgb(0 0 0 / 0.15),
      0 1px 3px -1px rgb(0 0 0 / 0.08);
    animation: dropdown-enter 0.12s var(--ease-out);
  }

  .dropdown-enter-up {
    animation-name: dropdown-enter-up;
  }

  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes dropdown-enter-up {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
