<!--
  @component WorkspaceMenu

  Enterprise workspace/organization switcher with dropdown menu.
  Works in sidebar headers, top navbars, or standalone.
  Auto-detects Sidebar context for collapse-aware behavior.

  @example Basic usage in Sidebar
  <Sidebar>
    {#snippet header()}
      <WorkspaceMenu
        workspace={{ name: 'Acme Corp', logo: '/acme.png' }}
        user={{ name: 'John Doe', email: 'john@acme.com', avatar: '/john.jpg' }}
      >
        {#snippet menu()}
          <DropdownItem onclick={switchWorkspace}>Switch Workspace</DropdownItem>
          <DropdownItem href="/settings">Settings</DropdownItem>
          <DropdownDivider />
          <DropdownItem onclick={signOut} variant="danger">Sign Out</DropdownItem>
        {/snippet}
      </WorkspaceMenu>
    {/snippet}
  </Sidebar>

  @example In top navbar (standalone)
  <nav class="top-nav">
    <WorkspaceMenu
      workspace={{ name: 'Acme Corp' }}
      user={{ name: 'John Doe' }}
      position="bottom-start"
    />
  </nav>

  @example Minimal (workspace only)
  <WorkspaceMenu workspace={{ name: 'My Workspace', initials: 'MW' }} />
-->
<script>
  import { getContext, onMount } from 'svelte';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';
  import { clickOutside } from '../../actions/index.js';

  let {
    workspace = null,
    user = null,
    badge = null,
    showChevron = true,
    position = 'bottom-start',
    class: className = '',
    menu
  } = $props();

  // Try to get sidebar context (may be null if used outside sidebar)
  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);
  const isInSidebar = $derived(sidebar !== undefined);

  // Dropdown state
  let isOpen = $state(false);
  let triggerRef = $state(null);
  let dropdownRef = $state(null);

  function toggle() {
    isOpen = !isOpen;
  }

  function close() {
    isOpen = false;
  }

  // Get workspace display info
  const workspaceLogo = $derived(workspace?.logo || workspace?.avatar);
  const workspaceInitials = $derived(
    workspace?.initials ||
    workspace?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ||
    'W'
  );

  // Get user display info
  const userAvatar = $derived(user?.avatar || user?.image);
  const userInitials = $derived(
    user?.initials ||
    user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ||
    'U'
  );

  // Handle escape key
  function handleKeydown(event) {
    if (event.key === 'Escape' && isOpen) {
      close();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

<div
  class="workspace-menu {className}"
  class:collapsed={isCollapsed}
  class:in-sidebar={isInSidebar}
  use:clickOutside={close}
>
  <button
    bind:this={triggerRef}
    type="button"
    class="workspace-trigger"
    class:open={isOpen}
    onclick={toggle}
    aria-expanded={isOpen}
    aria-haspopup="menu"
  >
    <!-- Workspace/Org Avatar -->
    <div class="workspace-avatar">
      {#if workspaceLogo}
        <img src={workspaceLogo} alt={workspace?.name || 'Workspace'} />
      {:else}
        <span class="avatar-initials">{workspaceInitials}</span>
      {/if}
    </div>

    {#if !isCollapsed}
      <div class="workspace-info">
        <div class="workspace-name">
          {workspace?.name || 'Workspace'}
          {#if badge}
            <span class="workspace-badge badge-{badge.variant || 'default'}">
              {badge.text}
            </span>
          {/if}
        </div>
        {#if user}
          <div class="user-subtitle">
            {user.email || user.name}
          </div>
        {/if}
      </div>

      {#if showChevron}
        <svg
          class="chevron"
          class:open={isOpen}
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
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      {/if}
    {/if}
  </button>

  {#if isOpen && menu}
    <div
      bind:this={dropdownRef}
      class="workspace-dropdown"
      class:position-bottom-start={position === 'bottom-start'}
      class:position-bottom-end={position === 'bottom-end'}
      class:position-right-start={position === 'right-start'}
      class:collapsed-position={isCollapsed}
      role="menu"
    >
      <!-- User header in dropdown -->
      {#if user}
        <div class="dropdown-header">
          <div class="user-avatar">
            {#if userAvatar}
              <img src={userAvatar} alt={user.name || 'User'} />
            {:else}
              <span class="avatar-initials">{userInitials}</span>
            {/if}
          </div>
          <div class="user-info">
            <div class="user-name">{user.name || 'User'}</div>
            {#if user.email}
              <div class="user-email">{user.email}</div>
            {/if}
          </div>
        </div>
      {/if}

      <div class="dropdown-content">
        {@render menu()}
      </div>
    </div>
  {/if}
</div>

<style>
  .workspace-menu {
    position: relative;
    width: 100%;
  }

  .workspace-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    text-align: left;
    transition: background-color 150ms ease;
    font-family: inherit;
  }

  .workspace-trigger:hover {
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
  }

  .workspace-trigger.open {
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
  }

  .collapsed .workspace-trigger {
    justify-content: center;
    padding: 0.5rem;
  }

  /* Workspace Avatar */
  .workspace-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, var(--color-primary, #83D2FC), var(--color-info, #40FFE2));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .workspace-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-initials {
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
  }

  /* Workspace Info */
  .workspace-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .workspace-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-strong, var(--color-base07, #FAFDFB));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .workspace-badge {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    border-radius: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .workspace-badge.badge-default {
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
  }

  .workspace-badge.badge-primary {
    background-color: color-mix(in srgb, var(--color-primary, #83D2FC) 20%, transparent);
    color: var(--color-primary, #83D2FC);
  }

  .workspace-badge.badge-success {
    background-color: color-mix(in srgb, var(--color-success, #6DD672) 20%, transparent);
    color: var(--color-success, #6DD672);
  }

  .user-subtitle {
    font-size: 0.75rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Chevron */
  .chevron {
    flex-shrink: 0;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    transition: transform 200ms ease;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  /* Dropdown */
  .workspace-dropdown {
    position: absolute;
    z-index: 50;
    min-width: 280px;
    max-width: 320px;
    background-color: var(--color-surface, var(--color-base01, #2C3040));
    border: 1px solid var(--color-border, color-mix(in srgb, var(--color-base03, #565E78) 40%, transparent));
    border-radius: 0.75rem;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.3),
      0 8px 10px -6px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: dropdown-appear 150ms ease-out;
  }

  @keyframes dropdown-appear {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .workspace-dropdown.position-bottom-start {
    top: calc(100% + 0.5rem);
    left: 0;
  }

  .workspace-dropdown.position-bottom-end {
    top: calc(100% + 0.5rem);
    right: 0;
  }

  .workspace-dropdown.position-right-start {
    top: 0;
    left: calc(100% + 0.5rem);
  }

  .workspace-dropdown.collapsed-position {
    top: 0;
    left: calc(100% + 0.5rem);
  }

  /* Dropdown Header */
  .dropdown-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border, color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent));
    background-color: color-mix(in srgb, var(--color-surface-alt, var(--color-base02, #3E4359)) 50%, transparent);
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary, #83D2FC), var(--color-info, #40FFE2));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-strong, var(--color-base07, #FAFDFB));
  }

  .user-email {
    font-size: 0.75rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Dropdown Content */
  .dropdown-content {
    padding: 0.5rem;
  }
</style>
