<!--
  @component NavigationAccountGroup

  Enterprise account group block with expandable accounts and subroutes.
-->
<script>
  import { getContext } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../../utils/sidebar.svelte.js';
  import { NAVIGATION_CONTEXT_KEY } from '../../../utils/navigation.svelte.js';

  let {
    block,
    navigationState = null,
    onEvent = null
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const navContext = getContext(NAVIGATION_CONTEXT_KEY);
  const navState = navigationState || navContext;

  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Block configuration
  const config = $derived({
    title: block.title || 'Connected Accounts',
    collapsible: block.collapsible ?? true,
    defaultExpanded: block.defaultExpanded ?? true,
    showCount: block.showCount ?? true,
    showConnectButton: block.showConnectButton ?? true,
    ...block.config
  });

  const accounts = $derived(block.accounts || []);
  const expandedAccounts = $derived(block.expandedAccounts || {});

  // Filter accounts based on search
  const filteredAccounts = $derived.by(() => {
    if (!navState?.searchQuery) return accounts;

    const query = navState.searchQuery.toLowerCase();
    return accounts.filter(account =>
      account.name?.toLowerCase().includes(query) ||
      account.platform?.toLowerCase().includes(query)
    );
  });

  const sectionId = block.id;
  const isExpanded = $derived(
    config.collapsible
      ? (navState?.isSectionExpanded(sectionId) ?? config.defaultExpanded)
      : true
  );

  function toggleSection() {
    if (navState) {
      navState.toggleSection(sectionId);
    }
    if (onEvent) onEvent('section_toggled', { sectionId, expanded: !isExpanded });
  }

  function handleAccountClick(account) {
    if (onEvent) {
      onEvent('account_clicked', { account });
    }
  }

  function handleSubrouteClick(account, subroute) {
    if (onEvent) {
      onEvent('subroute_clicked', { account, subroute });
    }
  }

  function handleConnectAccount() {
    if (onEvent) {
      onEvent('connect_account_clicked', {});
    }
  }

  function getDefaultSubroutes(account) {
    return [
      { id: 'overview', label: 'Overview', path: `/account/${account.id}`, icon: 'Eye' },
      { id: 'chat', label: 'Chat', path: `/account/${account.id}/chat`, icon: 'MessageSquare' },
      { id: 'settings', label: 'Settings', path: `/account/${account.id}/settings`, icon: 'Settings' }
    ];
  }
</script>

<div class="nav-account-group-block">
  {#if config.title && !isCollapsed}
    <button
      class="section-header"
      onclick={toggleSection}
      aria-expanded={isExpanded}
    >
      <span class="section-title">{config.title}</span>

      {#if config.showCount && accounts.length > 0}
        <span class="section-count">{accounts.length}</span>
      {/if}

      <svg
        class="section-chevron {isExpanded ? 'expanded' : 'collapsed'}"
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
  {:else if config.title && isCollapsed}
    <div class="section-divider"></div>
  {/if}

  {#if isExpanded}
    <div class="accounts-list" transition:slide={{ duration: 200, easing: cubicOut }}>
      {#each filteredAccounts as account (account.id)}
        {@const isAccountExpanded = expandedAccounts[account.id] ?? false}
        {@const subroutes = account.subroutes || getDefaultSubroutes(account)}

        <div class="account-wrapper">
          <!-- Main account item -->
          <button
            class="account-item {isAccountExpanded ? 'expanded' : ''}"
            onclick={() => handleAccountClick(account)}
          >
            <!-- Account avatar -->
            <div class="account-avatar-container">
              {#if account.avatar_url}
                <img src={account.avatar_url} alt={account.name} class="account-avatar-img" />
              {:else}
                <div class="account-avatar {account.platform}">
                  {account.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              {/if}

              <!-- Platform badge -->
              <div class="platform-badge {account.platform}">
                {#if account.platform === 'instagram'}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                {/if}
              </div>
            </div>

            {#if !isCollapsed}
              <div class="account-info">
                <span class="account-name">{account.name}</span>
              </div>

              <svg
                class="account-chevron {isAccountExpanded ? 'expanded' : 'collapsed'}"
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
          {#if isAccountExpanded && !isCollapsed}
            <div class="account-subroutes" transition:slide={{ duration: 200, easing: cubicOut }}>
              {#each subroutes as subroute}
                <button
                  class="subroute-item"
                  onclick={() => handleSubrouteClick(account, subroute)}
                >
                  <span>{subroute.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Connect Account Button -->
      {#if config.showConnectButton}
        <button class="add-account-btn" onclick={handleConnectAccount}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Connect account</span>
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Use same styles as NavigationSection with account-specific additions */
  .nav-account-group-block {
    margin-bottom: var(--nav-block-spacing, 0.5rem);
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
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
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

  .section-count,
  .section-chevron {
    /* Same as NavigationSection */
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
    color: var(--nav-item-color);
    cursor: pointer;
    border-radius: var(--nav-item-border-radius);
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
  }

  .account-item:hover {
    color: var(--nav-item-hover-color);
    background: var(--nav-item-hover-background);
  }

  .account-item.expanded {
    background: var(--nav-item-hover-background);
    color: var(--nav-item-hover-color);
  }

  .account-avatar-container {
    position: relative;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  .account-avatar-img,
  .account-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
  }

  .account-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(to bottom right, var(--nav-item-active-color), var(--color-primary));
  }

  .platform-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-success);
    color: white;
  }

  .account-info {
    flex: 1;
    min-width: 0;
  }

  .account-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .account-chevron {
    transition: transform var(--nav-transition-duration) var(--nav-transition-easing);
  }

  .account-chevron.expanded {
    transform: rotate(180deg);
  }

  .account-subroutes {
    margin-left: 2.5rem;
    padding-left: 0.5rem;
    border-left: 2px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .subroute-item {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--nav-item-border-radius);
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
    width: 100%;
  }

  .subroute-item:hover {
    color: var(--nav-item-hover-color);
    background: color-mix(in srgb, var(--nav-item-hover-color) 5%, transparent);
  }

  .add-account-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--nav-item-border-radius);
    border: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    background: transparent;
    font-family: inherit;
    transition: all var(--nav-transition-duration) var(--nav-transition-easing);
  }

  .add-account-btn:hover {
    color: var(--nav-item-hover-color);
    background: color-mix(in srgb, var(--nav-item-hover-color) 5%, transparent);
    border-color: var(--nav-item-hover-color);
  }
</style>