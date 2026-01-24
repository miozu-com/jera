<!--
  @component SidebarAccountItem

  Connected account item with avatar and platform badge.
  Supports different platforms with their brand gradients.

  @example Account item
  <SidebarAccountItem
    avatar={{ src: '/user.jpg', alt: 'John' }}
    platform="instagram"
    label="@johndoe"
    active={currentAccount === 'johndoe'}
    onclick={() => selectAccount('johndoe')}
  />

  @example Add account button
  <SidebarAccountItem
    variant="add"
    label="Connect account"
    onclick={() => showConnectModal = true}
  />

  @example Custom platform
  <SidebarAccountItem
    avatar={{ fallback: 'T' }}
    platform="custom"
    platformIcon={TwitterIcon}
    label="@mytwitter"
  />
-->
<script>
  import { getContext } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SIDEBAR_CONTEXT_KEY } from '../../utils/sidebar.svelte.js';

  let {
    href = null,
    onclick = null,
    avatar = null,
    platform = null,
    platformIcon: PlatformIcon = null,
    label = '',
    active = false,
    variant = 'default',
    expandable = false,
    expanded = $bindable(false),
    subroutes = [],
    onSubrouteClick = null,
    class: className = ''
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Handle expand/collapse for expandable accounts
  function toggleExpanded() {
    if (expandable) {
      expanded = !expanded;
    }
  }

  // Handle subroute navigation
  function handleSubrouteClick(subroute) {
    if (onSubrouteClick) {
      onSubrouteClick(subroute);
    }
  }

  const isLink = $derived(href !== null);
  const isAddVariant = $derived(variant === 'add');

  const itemClass = $derived([
    'account-item',
    active && 'active',
    isAddVariant && 'connect-account',
    isCollapsed && isAddVariant && 'collapsed-add',
    isCollapsed && 'collapsed',
    expandable && 'expandable',
    className
  ].filter(Boolean).join(' '));

  // Get fallback initial for avatar
  const avatarFallback = $derived(
    avatar?.fallback ||
    label?.charAt(0)?.toUpperCase() ||
    (platform === 'shopify' ? 'S' : platform === 'instagram' ? 'I' : '?')
  );
</script>

<li>
  {#if isLink}
    <a
      href={expandable ? null : href}
      class={itemClass}
      onclick={expandable ? toggleExpanded : null}
      title={isCollapsed ? label : null}
      aria-expanded={expandable ? expanded : undefined}
    >
      {#if isAddVariant}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      {:else}
        <div class="account-avatar-container">
          {#if avatar?.src}
            <div class="account-avatar-wrapper">
              <img
                src={avatar.src}
                alt={avatar.alt || label}
                class="account-avatar-img"
              />
            </div>
          {:else}
            <div class="account-avatar {platform || ''}">
              {avatarFallback}
            </div>
          {/if}
          {#if platform && !isAddVariant}
            <div class="platform-badge {platform}">
              {#if PlatformIcon}
                <PlatformIcon size={10} />
              {:else if platform === 'shopify'}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              {:else if platform === 'instagram'}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
      {#if !isCollapsed}
        <span class="account-label" transition:fly={{ x: -20, duration: 200, delay: 50 }}>{label}</span>
        {#if expandable}
          <svg
            class="account-chevron {expanded ? 'rotate-180' : ''}"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            transition:fly={{ x: -10, duration: 200, delay: 100 }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        {/if}
      {/if}
    </a>
  {:else}
    <button
      type="button"
      class={itemClass}
      onclick={expandable ? toggleExpanded : onclick}
      title={isCollapsed ? label : null}
      aria-expanded={expandable ? expanded : undefined}
    >
      {#if isAddVariant}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      {:else}
        <div class="account-avatar-container">
          {#if avatar?.src}
            <div class="account-avatar-wrapper">
              <img
                src={avatar.src}
                alt={avatar.alt || label}
                class="account-avatar-img"
              />
            </div>
          {:else}
            <div class="account-avatar {platform || ''}">
              {avatarFallback}
            </div>
          {/if}
          {#if platform && !isAddVariant}
            <div class="platform-badge {platform}">
              {#if PlatformIcon}
                <PlatformIcon size={10} />
              {:else if platform === 'shopify'}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              {:else if platform === 'instagram'}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
      {#if !isCollapsed}
        <span class="account-label" transition:fly={{ x: -20, duration: 200, delay: 50 }}>{label}</span>
        {#if expandable}
          <svg
            class="account-chevron {expanded ? 'rotate-180' : ''}"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            transition:fly={{ x: -10, duration: 200, delay: 100 }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        {/if}
      {/if}
    </button>
  {/if}

  {#if expandable && expanded && !isCollapsed && subroutes.length > 0}
    <div class="account-subroutes" transition:slide={{ duration: 200, easing: cubicOut }}>
      {#each subroutes as subroute}
        <button
          class="subroute-item {subroute.active ? 'active' : ''}"
          onclick={() => handleSubrouteClick(subroute)}
          title={subroute.label}
        >
          {#if subroute.icon}
            <subroute.icon size={14} />
          {/if}
          <span>{subroute.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</li>

<style>
  li {
    list-style: none;
  }

  .account-item {
    width: calc(100% - 1rem);
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text, var(--color-base06, #F3F4F7));
    cursor: pointer;
    border-radius: 0.375rem;
    margin: 0 0.5rem;
    transition: all 200ms ease;
    overflow: hidden;
    text-decoration: none;
    border: none;
    background: transparent;
    font-family: inherit;
  }

  .account-item:hover {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
  }

  .account-item.collapsed {
    justify-content: center;
    padding: 0.5rem;
    margin: 0 0.25rem;
    width: calc(100% - 0.5rem);
  }

  .account-item.active {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 15%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
    font-weight: 500;
  }

  /* Connect account variant */
  .account-item.connect-account {
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }

  .account-item.connect-account:hover {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    color: var(--color-primary, var(--color-base0D, #83D2FC));
  }

  .account-item.collapsed-add {
    background-color: color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-primary, var(--color-base0D, #83D2FC)) 30%, transparent);
    width: 2rem;
    height: 2rem;
    margin: 0 auto;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 200ms ease;
  }

  .account-item.collapsed-add:hover {
    background-color: var(--color-primary, var(--color-base0D, #83D2FC));
    border-color: var(--color-primary, var(--color-base0D, #83D2FC));
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .account-item.collapsed-add:active {
    transform: scale(0.95);
  }

  /* Avatar container */
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

  /* Platform gradients */
  .account-avatar.instagram {
    background: linear-gradient(to bottom right, rgb(168, 85, 247), rgb(236, 72, 153));
  }

  .account-avatar.shopify {
    background: linear-gradient(to bottom right, rgb(34, 197, 94), rgb(16, 185, 129));
  }

  .account-avatar.twitter {
    background: linear-gradient(to bottom right, rgb(29, 155, 240), rgb(0, 111, 186));
  }

  .account-avatar.tiktok {
    background: linear-gradient(to bottom right, rgb(0, 0, 0), rgb(37, 244, 238));
  }

  /* Platform badge */
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

  .platform-badge.twitter {
    background-color: #1da1f2;
  }

  .platform-badge.tiktok {
    background: linear-gradient(135deg, #ff0050, #00f2ea);
  }

  .account-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Expandable account chevron */
  .account-chevron {
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    transition: all 200ms ease;
    flex-shrink: 0;
    margin-left: auto;
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
</style>
