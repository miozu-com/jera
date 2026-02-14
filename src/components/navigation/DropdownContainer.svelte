<!--
  @component DropdownContainer

  A user/account dropdown with avatar trigger for use in LeftBar header.
  Exact 1:1 match with admin.selify.ai AdminUserDropdown styles.

  @example Basic usage
  <DropdownContainer
    user={{ full_name: 'John Doe', avatar_url: '/avatar.jpg', role_name: 'admin' }}
    title="Admin Dashboard"
    {isCollapsed}
    {themeState}
    onSignOut={handleSignOut}
  >
    {#snippet menuItems()}
      <button class="menu-item" onclick={toggleTheme}>
        <Sun size={16} />
        <span class="menu-label">Light Mode</span>
      </button>
    {/snippet}
  </DropdownContainer>
-->
<script>
  import { onMount, getContext } from 'svelte';

  let {
    user = null,
    title = '',
    isCollapsed = false,
    themeState = null,
    signOutLoading = false,
    signOutAction = '/auth?/signout',
    onSignOut = null,
    roleVariants = {
      super_admin: 'primary',
      admin: 'primary',
      developer: 'primary',
      ops: 'success',
      support: 'default'
    },
    class: className = '',
    // Snippets
    userHeader,
    envSection,
    menuItems,
    footerContent,
    // Icons (optional - defaults to inline SVGs)
    ChevronDownIcon = null,
    ChevronUpIcon = null,
    SunIcon = null,
    MoonIcon = null,
    LogOutIcon = null,
    children
  } = $props();

  // Get initials from name
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  let isOpen = $state(false);
  let dropdownReady = $state(false);
  let dropdownRef = $state(null);
  let triggerRef = $state(null);
  let dropdownPosition = $state({ top: 0, left: 0, right: 0 });
  let isMobileView = $state(false);

  function toggleDropdown() {
    isOpen = !isOpen;

    if (isOpen && triggerRef) {
      isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024;
      dropdownReady = false;

      const calculatePosition = () => {
        if (!triggerRef) return;

        const rect = triggerRef.getBoundingClientRect();

        if (isMobileView) {
          const spaceBelow = window.innerHeight - rect.bottom;
          const dropdownHeight = 400;

          if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
            dropdownPosition = {
              top: rect.top - dropdownHeight - 8,
              left: 16,
              right: 16
            };
          } else {
            dropdownPosition = {
              top: rect.bottom + 8,
              left: 16,
              right: 16
            };
          }
        } else {
          dropdownPosition = {
            top: rect.bottom + 8,
            left: rect.left,
            right: 'auto'
          };
        }

        dropdownReady = true;
      };

      if (isMobileView) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              calculatePosition();
            });
          });
        }, 500);
      } else {
        calculatePosition();
      }
    } else {
      dropdownReady = false;
    }
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleClickOutside(event) {
    if (
      isOpen &&
      dropdownRef &&
      !dropdownRef.contains(event.target) &&
      triggerRef &&
      !triggerRef.contains(event.target)
    ) {
      closeDropdown();
    }
  }

  onMount(() => {
    const handleCloseDropdowns = () => {
      closeDropdown();
    };

    window.addEventListener('closedropdowns', handleCloseDropdowns);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('closedropdowns', handleCloseDropdowns);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  // Handle theme toggle
  function toggleTheme() {
    themeState?.toggle?.();
  }

  // Format role name
  let formatRoleName = $derived.by(() => {
    if (!user?.role_name) return 'Unknown';
    return user.role_name.replace('_', ' ');
  });

  // Get badge variant
  let badgeVariant = $derived(roleVariants[user?.role_name] || 'default');
</script>

<!-- Dropdown Container -->
<div class="dropdown-container {className}">
  <!-- Avatar Trigger Button -->
  <button
    bind:this={triggerRef}
    class="avatar-trigger"
    class:collapsed={isCollapsed}
    onclick={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="true"
    title={isCollapsed ? (user?.full_name || 'User') : 'Account menu'}
  >
    <div class="avatar avatar-sm">
      {#if user?.avatar_url}
        <img src={user.avatar_url} alt={user?.full_name || 'Avatar'} />
      {:else}
        <span class="avatar-initials">{getInitials(user?.full_name)}</span>
      {/if}
    </div>
    {#if !isCollapsed}
      <div class="trigger-info">
        <div class="trigger-workspace">{title}</div>
        <div class="trigger-name">{user?.full_name || 'User'}</div>
      </div>
      <div class="trigger-chevron">
        {#if ChevronUpIcon && ChevronDownIcon}
          {#if isOpen}
            <ChevronUpIcon size={16} />
          {:else}
            <ChevronDownIcon size={16} />
          {/if}
        {:else}
          {#if isOpen}
            <!-- ChevronUp -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          {:else}
            <!-- ChevronDown -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          {/if}
        {/if}
      </div>
    {/if}
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen && dropdownReady}
    <div
      bind:this={dropdownRef}
      class="dropdown-menu"
      class:mobile-dropdown={isMobileView}
      style="top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; {dropdownPosition.right !== 'auto' ? `right: ${dropdownPosition.right}px;` : ''}"
    >
      <!-- User Header -->
      {#if userHeader}
        {@render userHeader()}
      {:else}
        <div class="user-header">
          <div class="avatar avatar-md">
            {#if user?.avatar_url}
              <img src={user.avatar_url} alt={user?.full_name || 'Avatar'} />
            {:else}
              <span class="avatar-initials">{getInitials(user?.full_name)}</span>
            {/if}
          </div>
          <div class="user-info">
            <div class="user-name">{user?.full_name || 'User'}</div>
            <span class="badge badge-{badgeVariant}">{formatRoleName}</span>
          </div>
        </div>
      {/if}

      <!-- Environment Section (optional slot) -->
      {#if envSection}
        {@render envSection()}
      {/if}

      <!-- Menu Items -->
      <div class="menu-list">
        {#if menuItems}
          {@render menuItems()}
        {:else}
          <!-- Default: Theme Toggle -->
          {#if themeState}
            <button class="menu-item" onclick={toggleTheme}>
              {#if SunIcon && MoonIcon}
                {#if themeState.isDark}
                  <SunIcon size={16} />
                  <span class="menu-label">Light Mode</span>
                {:else}
                  <MoonIcon size={16} />
                  <span class="menu-label">Dark Mode</span>
                {/if}
              {:else}
                {#if themeState.isDark}
                  <!-- Sun -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span class="menu-label">Light Mode</span>
                {:else}
                  <!-- Moon -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span class="menu-label">Dark Mode</span>
                {/if}
              {/if}
            </button>
          {/if}

          <!-- Default: Sign Out -->
          <form method="post" action={signOutAction}>
            <button type="submit" class="menu-item signout-item" disabled={signOutLoading}>
              {#if LogOutIcon}
                <LogOutIcon size={16} />
              {:else}
                <!-- LogOut -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              {/if}
              <span class="menu-label">
                {signOutLoading ? 'Signing out...' : 'Sign out'}
              </span>
            </button>
          </form>
        {/if}
      </div>

      <!-- Footer -->
      {#if footerContent}
        <div class="menu-footer">
          {@render footerContent()}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dropdown-container {
    position: relative;
    margin: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .avatar-trigger {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    transition: all 200ms;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    background: transparent;
    border: none;
    font: inherit;
    text-align: left;
  }

  .avatar-trigger:hover {
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .avatar-trigger.collapsed {
    justify-content: center;
    padding: 0.5rem;
  }

  /* Custom squarish avatar - 4px border radius */
  .avatar {
    display: flex;
    flex-shrink: 0;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-default);
    background: linear-gradient(to bottom right, color-mix(in srgb, var(--color-base0D) 20%, transparent), color-mix(in srgb, var(--color-base0E) 20%, transparent));
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-initials {
    font-weight: 600;
    color: var(--color-base0D);
  }

  /* Trigger avatar - 32px */
  .avatar-sm {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  /* Header avatar - 40px */
  .avatar-md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }

  .trigger-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
  }

  .trigger-workspace {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-base06);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    text-align: left;
  }

  .trigger-name {
    font-size: 0.75rem;
    color: var(--color-base05);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    text-align: left;
  }

  .trigger-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base05);
    transition: all 200ms;
  }

  .trigger-chevron :global(svg) {
    flex-shrink: 0;
  }

  .dropdown-menu {
    position: fixed;
    margin-top: 0.5rem;
    width: 18rem;
    background-color: var(--color-base00);
    border: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow-y: auto;
    max-height: calc(100vh - 120px);
    z-index: var(--z-dropdown);
    animation: dropdown-appear 0.15s ease-out;
  }

  .dropdown-menu.mobile-dropdown {
    width: auto;
  }

  @keyframes dropdown-appear {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .user-header {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-base06);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.25rem;
  }

  /* Badge styles */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    font-size: 0.625rem;
    font-weight: 500;
    border-radius: var(--radius-default);
    text-transform: capitalize;
  }

  .badge-default {
    background-color: var(--color-base02);
    color: var(--color-base05);
  }

  .badge-primary {
    background-color: color-mix(in srgb, var(--color-base0D) 20%, transparent);
    color: var(--color-base0D);
  }

  .badge-success {
    background-color: color-mix(in srgb, var(--color-base0B) 20%, transparent);
    color: var(--color-base0B);
  }

  .menu-list {
    padding: 0.5rem;
  }

  .menu-item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-base06);
    transition: all 150ms;
    cursor: pointer;
    border-radius: 0.375rem;
    background: transparent;
    border: none;
    font: inherit;
    text-align: left;
  }

  .menu-item:hover:not(:disabled) {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-label {
    flex: 1;
    text-align: left;
  }

  .signout-item:hover:not(:disabled) {
    color: var(--color-base08);
    background-color: color-mix(in srgb, var(--color-base08) 10%, transparent);
  }

  .menu-item :global(svg) {
    flex-shrink: 0;
    color: var(--color-base05);
    transition: color 150ms;
  }

  .menu-item:hover :global(svg) {
    color: var(--color-base0D);
  }

  .signout-item:hover :global(svg) {
    color: var(--color-base08);
  }

  .menu-footer {
    padding: 0.5rem 1rem;
  }

  form {
    width: 100%;
  }
</style>
