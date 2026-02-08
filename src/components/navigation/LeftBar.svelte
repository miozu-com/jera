<!--
  @component LeftBar

  A collapsible left sidebar with navigation sections, expandable groups, and hover popovers.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar styles.

  @example Basic usage
  <LeftBar
    bind:collapsed
    persistKey="my-sidebar"
  >
    {#snippet header()}
      <DropdownContainer {themeState} {teamMember} {isCollapsed} />
    {/snippet}

    {#snippet navigation()}
      <LeftBarSection>
        <LeftBarItem href="/" icon={Home} label="Dashboard" active={isActive('/')} />
        <LeftBarItem href="/settings" icon={Settings} label="Settings" />
      </LeftBarSection>
    {/snippet}

    {#snippet footer()}
      <LeftBarToggle />
    {/snippet}
  </LeftBar>
-->
<script>
  import { setContext, onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import LeftBarPopover from './LeftBarPopover.svelte';

  let {
    collapsed = $bindable(false),
    persistKey = null,
    popoverMap = {},
    class: className = '',
    header,
    navigation,
    footer,
    children
  } = $props();

  // Internal collapsed state
  let isCollapsed = $state(collapsed);

  // Sync states
  $effect(() => {
    isCollapsed = collapsed;
  });

  $effect(() => {
    collapsed = isCollapsed;
  });

  // Toggle sidebar
  function toggle() {
    isCollapsed = !isCollapsed;
    if (persistKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(persistKey, String(isCollapsed));
      } catch (e) {}
    }
  }

  // Load saved state
  onMount(() => {
    if (persistKey && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved !== null) {
          isCollapsed = saved === 'true';
        }
      } catch (e) {}
    }
  });

  // Hover popover state for collapsed sidebar
  let hoverPopover = $state({
    item: null,
    position: { top: 0, left: 0 }
  });
  let hoverTimeout = null;

  function showPopover(itemId, event) {
    if (!isCollapsed) return;

    if (hoverTimeout) clearTimeout(hoverTimeout);

    const rect = event.currentTarget.getBoundingClientRect();
    hoverPopover = {
      item: itemId,
      position: {
        top: rect.top,
        left: rect.right + 8
      }
    };
  }

  function hidePopover() {
    hoverTimeout = setTimeout(() => {
      hoverPopover.item = null;
    }, 150);
  }

  function keepPopoverOpen() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
  }

  // Provide context to children
  setContext('leftbar', {
    get collapsed() { return isCollapsed; },
    toggle,
    expand() { isCollapsed = false; },
    collapse() { isCollapsed = true; },
    showPopover,
    hidePopover,
    keepPopoverOpen,
    get hoverPopover() { return hoverPopover; }
  });
</script>

<div class="workspace-sidebar {className}" class:collapsed={isCollapsed}>
  <!-- Header slot (typically DropdownContainer) -->
  {#if header}
    {@render header()}
  {/if}

  <!-- Main Navigation -->
  {#if navigation}
    <nav class="main-nav">
      {@render navigation()}
    </nav>
  {:else if children}
    <nav class="main-nav">
      {@render children()}
    </nav>
  {/if}

  <!-- Footer with collapse toggle -->
  {#if footer}
    <div class="sidebar-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<!-- Hover popover — rendered outside sidebar to avoid overflow:hidden + will-change clipping -->
{#if isCollapsed && hoverPopover.item && popoverMap[hoverPopover.item]}
  <LeftBarPopover
    visible={true}
    position={hoverPopover.position}
    title={hoverPopover.item}
    items={popoverMap[hoverPopover.item]}
  />
{/if}

<style>
  .workspace-sidebar {
    display: flex;
    flex-direction: column;
    background-color: var(--color-base00);
    border-right: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 40;
    width: 240px;
    transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
    overflow: hidden;
  }

  .workspace-sidebar.collapsed {
    width: 60px;
  }

  .main-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
    overflow-y: auto;
    padding-top: 0;
    padding-bottom: 0;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
