<!--
  @component Sidebar

  Flexible, collapsible sidebar container with smooth width transitions.
  Provides context to child components for collapsed state awareness.

  @example Basic usage (admin style)
  <Sidebar bind:collapsed persistKey="admin-sidebar">
    {#snippet header()}
      <div class="p-4 border-b border-base02">
        <span class="logo">Selify</span>
      </div>
    {/snippet}

    <SidebarSection title="Navigation">
      <SidebarItem href="/" icon={Home} label="Home" />
    </SidebarSection>

    {#snippet footer()}
      <div class="p-4">
        <SidebarToggle />
      </div>
    {/snippet}
  </Sidebar>

  @example Complex usage (dashboard style with custom header component)
  <Sidebar bind:collapsed persistKey="dash-sidebar">
    {#snippet header()}
      <UserDropdown {collapsed} />
    {/snippet}

    <SidebarSection title="Main">
      <SidebarItem href="/" icon={Home} label="Home" />
    </SidebarSection>

    <SidebarSection title="Accounts">
      <SidebarAccountItem platform="instagram" label="@myaccount" />
    </SidebarSection>

    {#snippet footer()}
      <SidebarToggle />
    {/snippet}
  </Sidebar>
-->
<script>
  import { setContext, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    collapsed = $bindable(false),
    width = 240,
    collapsedWidth = 64,
    headerHeight = 60,
    persistKey = null,
    mobileOverlay = false,
    overlayOpen = $bindable(false),
    position = 'left',
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

  // Toggle function
  function toggle() {
    isCollapsed = !isCollapsed;
  }

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

  // Mobile functionality
  function closeMobileOverlay() {
    if (mobileOverlay) {
      overlayOpen = false;
    }
  }

  // Provide context to children
  setContext(SIDEBAR_CONTEXT_KEY, {
    get collapsed() { return isCollapsed; },
    get width() { return width; },
    get collapsedWidth() { return collapsedWidth; },
    get mobileOverlay() { return mobileOverlay; },
    toggle,
    expand() { isCollapsed = false; },
    collapse() { isCollapsed = true; },
    closeMobileOverlay,
    showPopover,
    hidePopover,
    keepPopoverOpen,
    get hoverPopover() { return hoverPopover; }
  });

  // Computed styles
  const sidebarStyle = $derived(
    `--sidebar-width: ${width}px; --sidebar-collapsed-width: ${collapsedWidth}px; --sidebar-header-height: ${headerHeight}px;`
  );
</script>

{#if mobileOverlay}
  <!-- Mobile overlay mode -->
  {#if overlayOpen}
    <div class="sidebar-overlay" onclick={closeMobileOverlay}></div>
    <aside
      class="sidebar mobile-overlay {className} {position}"
      class:collapsed={isCollapsed}
      style={sidebarStyle}
      transition:fly={{x: position === 'left' ? -300 : 300, duration: 200}}
    >
      {#if header}
        <div class="sidebar-header">
          {@render header()}
          <button class="mobile-close-btn" onclick={closeMobileOverlay}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      {/if}

      <nav class="sidebar-content">
        {@render children?.()}
      </nav>

      {#if footer}
        <div class="sidebar-footer">
          {@render footer()}
        </div>
      {/if}
    </aside>
  {/if}
{:else}
  <!-- Default desktop mode -->
  <aside
    class="sidebar {className}"
    class:collapsed={isCollapsed}
    style={sidebarStyle}
  >
    {#if header}
      <div class="sidebar-header">
        {@render header()}
      </div>
    {/if}

    <nav class="sidebar-content">
      {@render children?.()}
    </nav>

    {#if footer}
      <div class="sidebar-footer">
        {@render footer()}
      </div>
    {/if}
  </aside>
{/if}

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface, var(--color-base01, #2C3040));
    border-right: 1px solid var(--color-border, color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent));
    height: 100vh;
    width: var(--sidebar-width);
    transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
    position: sticky;
    top: 0;
    will-change: width;
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: var(--sidebar-collapsed-width);
  }

  .sidebar-header {
    flex-shrink: 0;
    min-height: var(--sidebar-header-height);
    display: flex;
    align-items: center;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem 0;
  }

  .sidebar-footer {
    flex-shrink: 0;
    margin-top: auto;
  }

  /* Scrollbar styling */
  .sidebar-content::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-content::-webkit-scrollbar-thumb {
    background: var(--color-base03, #565E78);
    border-radius: 2px;
  }

  .sidebar-content::-webkit-scrollbar-thumb:hover {
    background: var(--color-base04, #737E99);
  }

  /* Mobile overlay styles */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }

  .sidebar.mobile-overlay {
    position: fixed;
    z-index: 50;
    height: 100vh;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .sidebar.mobile-overlay.left {
    left: 0;
    top: 0;
  }

  .sidebar.mobile-overlay.right {
    right: 0;
    top: 0;
  }

  .mobile-close-btn {
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all 200ms ease;
    margin-left: auto;
  }

  .mobile-close-btn:hover {
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
    color: var(--color-text, var(--color-base06, #F3F4F7));
  }
</style>
