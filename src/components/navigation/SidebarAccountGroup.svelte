<!--
  @component SidebarAccountGroup

  Connected accounts group with expandable accounts and subroutes.
  Matches dash.selify.ai connected accounts functionality.

  @example
  <SidebarAccountGroup
    accounts={connectedAccounts}
    expanded={accountsExpanded}
    expandedAccounts={expandedAccountsObj}
    onAccountClick={(account) => toggleAccount(account)}
    onSubrouteClick={(subroute) => navigateTo(subroute.path)}
    onConnectAccount={() => showConnectModal = true}
  />
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';
  import SidebarAccountItem from './SidebarAccountItem.svelte';

  let {
    accounts = [],
    expanded = $bindable(false),
    expandedAccounts = $bindable({}),
    onAccountClick = null,
    onSubrouteClick = null,
    onConnectAccount = null,
    searchQuery = '',
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Filter accounts based on search
  const filteredAccounts = $derived(
    accounts.filter(account =>
      !searchQuery ||
      account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.platform?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleAccountClick(account) {
    // Toggle expanded state
    expandedAccounts[account.id] = !expandedAccounts[account.id];

    if (onAccountClick) {
      onAccountClick(account);
    }
  }

  function handleSubrouteClick(subroute) {
    if (onSubrouteClick) {
      onSubrouteClick(subroute);
    }
    // Close mobile overlay if in mobile mode
    if (sidebar?.closeMobileOverlay) {
      sidebar.closeMobileOverlay();
    }
  }

  function handleConnectAccount() {
    if (onConnectAccount) {
      onConnectAccount();
    }
  }

  // Get default subroutes for an account
  function getAccountSubroutes(account) {
    return [
      {
        id: 'overview',
        label: 'Overview',
        path: `/account/${account.id}`,
        icon: 'Eye',
        active: false
      },
      {
        id: 'chat',
        label: 'Chat',
        path: `/account/${account.id}/chat`,
        icon: 'MessageSquare',
        active: false
      },
      {
        id: 'settings',
        label: 'Settings',
        path: `/account/${account.id}/settings`,
        icon: 'Settings',
        active: false
      }
    ];
  }
</script>

<div class="sidebar-section {className}">
  <button
    class="section-header"
    onclick={toggleExpanded}
    aria-expanded={expanded}
  >
    <span class="section-title">Connected Accounts</span>
    {#if accounts.length > 0}
      <span class="section-count">{accounts.length}</span>
    {/if}
    <svg
      class="section-chevron {expanded ? 'rotate-180' : ''}"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if expanded}
    <div class="accounts-list" transition:slide={{ duration: 200, easing: cubicOut }}>
      {#each filteredAccounts as account}
        <div class="account-wrapper">
          <!-- Main account item -->
          <button
            class="account-item {expandedAccounts[account.id] ? 'expanded' : ''}"
            onclick={() => handleAccountClick(account)}
            title={account.name}
          >
            <div class="account-avatar-container">
              {#if account.avatar_url}
                <div class="account-avatar-wrapper">
                  <img
                    src={account.avatar_url}
                    alt={account.name}
                    class="account-avatar-img"
                  />
                </div>
              {:else}
                <div class="account-avatar {account.platform}">
                  {account.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              {/if}
              <div class="platform-badge {account.platform}">
                {#if account.platform === 'instagram'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                {:else if account.platform === 'shopify'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                {/if}
              </div>
            </div>

            {#if !isCollapsed}
              <div class="account-info">
                <span class="account-name">{account.name}</span>
              </div>
              <svg
                class="account-chevron {expandedAccounts[account.id] ? 'rotate-180' : ''}"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            {/if}
          </button>

          <!-- Account subroutes -->
          {#if expandedAccounts[account.id] && !isCollapsed}
            <div class="account-subroutes" transition:slide={{ duration: 200, easing: cubicOut }}>
              {#each getAccountSubroutes(account) as subroute}
                <button
                  class="subroute-item {subroute.active ? 'active' : ''}"
                  onclick={() => handleSubrouteClick(subroute)}
                  title={subroute.label}
                >
                  {#if subroute.icon === 'Eye'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  {:else if subroute.icon === 'MessageSquare'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  {:else if subroute.icon === 'Settings'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="m12 1 1.414 1.414-1.414 1.414v2.828l1.414 1.414h2.828l1.414-1.414L23 12l-1.414 1.414-1.414-1.414h-2.828l-1.414 1.414v2.828l1.414 1.414L12 23l-1.414-1.414 1.414-1.414v-2.828l-1.414-1.414H6.758l-1.414 1.414L1 12l1.414-1.414 1.414 1.414h2.828l1.414-1.414V8.172L5.656 6.758 12 1z"></path>
                    </svg>
                  {/if}
                  <span>{subroute.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Connect Account Button -->
      <button class="add-account-btn" onclick={handleConnectAccount} title="Connect new account">
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
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <span>Connect account</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .sidebar-section {
    padding: 0.125rem 0;
  }

  .section-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted, var(--color-base04, #737E99));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 200ms ease;
    border: none;
    background: transparent;
    font-family: inherit;
    justify-content: flex-start;
  }

  .section-header:hover {
    color: var(--color-text, var(--color-base05, #D0D2DB));
  }

  .section-title {
    flex: 1;
    text-align: left;
  }

  .section-count {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    background-color: var(--color-surface-alt, var(--color-base02, #3E4359));
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .section-chevron {
    color: var(--color-text-muted, var(--color-base04, #737E99));
    transition: all 200ms ease;
    flex-shrink: 0;
  }

  .section-chevron.rotate-180 {
    transform: rotate(180deg);
  }

  .accounts-list {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0 0.5rem;
  }

  .account-wrapper {
    display: flex;
    flex-direction: column;
  }

  .account-item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text, var(--color-base06, #F3F4F7));
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    overflow: hidden;
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
  }

  .account-item:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
  }

  .account-item.expanded {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }

  /* Account avatar styles */
  .account-avatar-container {
    position: relative;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
  }

  .account-avatar-wrapper {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    overflow: hidden;
    background: linear-gradient(to bottom right, rgba(131, 210, 252, 0.2), rgba(201, 116, 230, 0.2));
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .account-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .account-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .account-avatar.instagram {
    background: linear-gradient(to bottom right, rgb(168, 85, 247), rgb(236, 72, 153));
  }

  .account-avatar.shopify {
    background: linear-gradient(to bottom right, rgb(34, 197, 94), rgb(16, 185, 129));
  }

  .platform-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 1rem;
    height: 1rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 1px solid var(--color-bg, var(--color-base00, #232733));
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .platform-badge.instagram {
    background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  }

  .platform-badge.shopify {
    background-color: var(--color-success, var(--color-base0B, #6DD672));
  }

  .account-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .account-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .account-chevron {
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    transition: all 200ms ease;
    flex-shrink: 0;
  }

  .account-chevron.rotate-180 {
    transform: rotate(180deg);
  }

  /* Account subroutes */
  .account-subroutes {
    margin-left: 2.5rem;
    padding-left: 0.5rem;
    border-left: 2px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .subroute-item {
    padding: 0.375rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    overflow: hidden;
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
    width: 100%;
  }

  .subroute-item:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 5%, transparent);
  }

  .subroute-item.active {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    font-weight: 500;
  }

  .add-account-btn {
    width: 100%;
    padding: 0.5rem 0.75rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.875rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    border: 1px solid color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent);
    background: transparent;
    font-family: inherit;
  }

  .add-account-btn:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 5%, transparent);
    border-color: var(--color-primary, var(--color-base0D, #83D2FC));
  }
</style>