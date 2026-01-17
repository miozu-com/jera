<!--
  @component Sidebar

  Main collapsible sidebar container with smooth width transitions.
  Provides context to child components for collapsed state awareness.

  @example Basic usage
  <script>
    let collapsed = $state(false);
  </script>

  <Sidebar bind:collapsed persistKey="my-sidebar">
    {#snippet header()}
      <MyHeader />
    {/snippet}

    <SidebarSection title="Main">
      <SidebarItem href="/" icon={Home} label="Home" />
    </SidebarSection>

    {#snippet footer()}
      <button onclick={() => collapsed = !collapsed}>Toggle</button>
    {/snippet}
  </Sidebar>
-->
<script>
  import { setContext, onMount } from 'svelte';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    collapsed = $bindable(false),
    width = 240,
    collapsedWidth = 60,
    persistKey = null,
    class: className = '',
    header,
    footer,
    children
  } = $props();

  // Internal collapsed state that syncs with prop
  let isCollapsed = $state(collapsed);

  // Sync internal state with prop
  $effect(() => {
    isCollapsed = collapsed;
  });

  // Update prop when internal state changes
  $effect(() => {
    collapsed = isCollapsed;
  });

  // Hover popover state
  let hoverPopover = $state({
    item: null,
    position: { top: 0, left: 0 }
  });
  let hoverTimeout = null;

  function showPopover(itemId, position) {
    if (!isCollapsed) return;

    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    hoverPopover = { item: itemId, position };
  }

  function hidePopover(delay = 150) {
    if (hoverTimeout) clearTimeout(hoverTimeout);

    hoverTimeout = setTimeout(() => {
      hoverPopover = { item: null, position: { top: 0, left: 0 } };
    }, delay);
  }

  function keepPopoverOpen() {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  }

  // Load from localStorage
  onMount(() => {
    if (persistKey && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved !== null) {
          isCollapsed = saved === 'true';
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  });

  // Save to localStorage when state changes
  $effect(() => {
    if (persistKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(persistKey, String(isCollapsed));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  });

  // Provide context to children
  setContext(SIDEBAR_CONTEXT_KEY, {
    get collapsed() { return isCollapsed; },
    get width() { return width; },
    get collapsedWidth() { return collapsedWidth; },
    toggle() { isCollapsed = !isCollapsed; },
    expand() { isCollapsed = false; },
    collapse() { isCollapsed = true; },
    showPopover,
    hidePopover,
    keepPopoverOpen,
    get hoverPopover() { return hoverPopover; }
  });

  // Computed style for width
  const sidebarStyle = $derived(
    `width: ${isCollapsed ? collapsedWidth : width}px;`
  );
</script>

<div
  class="sidebar {isCollapsed ? 'collapsed' : ''} {className}"
  style={sidebarStyle}
>
  {#if header}
    <div class="sidebar-header">
      {@render header()}
    </div>
  {/if}

  <div class="sidebar-content">
    {@render children?.()}
  </div>

  {#if footer}
    <div class="sidebar-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg, var(--color-base00, #232733));
    border-right: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    height: 100vh;
    transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    will-change: width;
    overflow: hidden;
  }

  .sidebar-header {
    flex-shrink: 0;
    padding-bottom: 0.75rem;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar-footer {
    flex-shrink: 0;
    margin-top: auto;
    padding: 0.5rem;
  }
</style>
