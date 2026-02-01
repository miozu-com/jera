<!--
  @component LeftBarGroup

  A collapsible group within LeftBar for displaying collections of entities.
  Generic component that can represent accounts, projects, workspaces, channels, etc.

  @example Basic usage with items
  <LeftBarGroup
    title="Connected Accounts"
    items={accounts}
    bind:expanded={accountsExpanded}
    onItemClick={(item) => navigateTo(item)}
    onAddClick={() => showConnectModal = true}
    addLabel="Connect account"
  />

  @example With custom item rendering
  <LeftBarGroup title="Projects" bind:expanded>
    {#snippet item(project)}
      <div class="project-item">
        <span class="project-color" style="background: {project.color}"></span>
        <span>{project.name}</span>
      </div>
    {/snippet}
  </LeftBarGroup>

  @example With expandable items and subroutes
  <LeftBarGroup
    title="Accounts"
    items={accounts}
    expandable
    bind:expandedItems={expandedAccounts}
    getSubroutes={(account) => [
      { label: 'Overview', href: `/account/${account.id}` },
      { label: 'Settings', href: `/account/${account.id}/settings` }
    ]}
  />
-->
<script>
  import { getContext } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let {
    title = '',
    items = [],
    expanded = $bindable(false),
    expandedItems = $bindable({}),
    expandable = false,
    searchable = false,
    searchQuery = '',
    addLabel = 'Add item',
    showAdd = true,
    showCount = true,
    onItemClick = null,
    onSubrouteClick = null,
    onAddClick = null,
    getItemId = (item) => item.id,
    getItemName = (item) => item.name || item.label || '',
    getItemAvatar = (item) => item.avatar_url || item.avatar || null,
    getItemInitial = (item) => getItemName(item)?.charAt(0)?.toUpperCase() || '?',
    getItemPlatform = (item) => item.platform || item.type || null,
    getSubroutes = () => [],
    isItemActive = () => false,
    isSubrouteActive = () => false,
    class: className = '',
    item: itemSnippet,
    children
  } = $props();

  const leftbar = getContext('leftbar');
  const isCollapsed = $derived(leftbar?.collapsed ?? false);

  // Filter items based on search
  const filteredItems = $derived(
    items.filter(item =>
      !searchQuery ||
      getItemName(item)?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleItemClick(item) {
    if (expandable) {
      const id = getItemId(item);
      expandedItems = { ...expandedItems, [id]: !expandedItems[id] };
    }
    onItemClick?.(item);
  }

  function handleSubrouteClick(subroute, item) {
    onSubrouteClick?.(subroute, item);
    leftbar?.closeMobileOverlay?.();
  }

  function handleAddClick() {
    onAddClick?.();
  }

  // Platform colors
  const platformColors = {
    instagram: 'linear-gradient(to bottom right, rgb(168, 85, 247), rgb(236, 72, 153))',
    shopify: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(16, 185, 129))',
    tiktok: 'linear-gradient(to bottom right, rgb(0, 0, 0), rgb(37, 244, 238))',
    facebook: 'linear-gradient(to bottom right, rgb(59, 89, 152), rgb(24, 119, 242))',
    twitter: 'linear-gradient(to bottom right, rgb(29, 161, 242), rgb(29, 161, 242))',
    default: 'var(--color-base03)'
  };

  function getAvatarStyle(item) {
    const platform = getItemPlatform(item);
    return platformColors[platform] || platformColors.default;
  }
</script>

<div class="left-bar-group {className}">
  <!-- Section Header -->
  <button
    class="group-header"
    onclick={toggleExpanded}
    aria-expanded={expanded}
  >
    {#if !isCollapsed}
      <span class="group-title" transition:fade={{ duration: 150 }}>{title}</span>
      {#if showCount && items.length > 0}
        <span class="group-count" transition:fade={{ duration: 150 }}>{items.length}</span>
      {/if}
    {/if}
    <svg
      class="group-chevron"
      class:rotate-180={expanded}
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

  <!-- Items List -->
  {#if expanded}
    <div class="group-content" transition:slide={{ duration: 200, easing: cubicOut }}>
      <!-- Custom children content -->
      {#if children}
        {@render children()}
      {:else}
        <!-- Default item rendering -->
        {#each filteredItems as item}
          {@const itemId = getItemId(item)}
          {@const itemName = getItemName(item)}
          {@const itemAvatar = getItemAvatar(item)}
          {@const platform = getItemPlatform(item)}
          {@const subroutes = getSubroutes(item)}
          {@const isExpanded = expandedItems[itemId]}

          <div class="group-item-wrapper">
            <!-- Custom item snippet or default -->
            {#if itemSnippet}
              {@render itemSnippet(item, isExpanded)}
            {:else}
              <button
                class="group-item"
                class:active={isItemActive(item)}
                class:expanded={isExpanded}
                onclick={() => handleItemClick(item)}
                title={isCollapsed ? itemName : null}
              >
                <!-- Avatar -->
                <div class="item-avatar-container">
                  {#if itemAvatar}
                    <div class="item-avatar-wrapper">
                      <img src={itemAvatar} alt={itemName} class="item-avatar-img" />
                    </div>
                  {:else}
                    <div class="item-avatar" style="background: {getAvatarStyle(item)}">
                      {getItemInitial(item)}
                    </div>
                  {/if}
                  {#if platform}
                    <div class="platform-badge {platform}">
                      {#if platform === 'instagram'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      {:else if platform === 'shopify'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                      {/if}
                    </div>
                  {/if}
                </div>

                {#if !isCollapsed}
                  <span class="item-name" transition:fade={{ duration: 150 }}>{itemName}</span>
                  {#if expandable && subroutes.length > 0}
                    <svg
                      class="item-chevron"
                      class:rotate-180={isExpanded}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  {/if}
                {/if}
              </button>

              <!-- Subroutes -->
              {#if isExpanded && !isCollapsed && subroutes.length > 0}
                <div class="item-subroutes" transition:slide={{ duration: 200, easing: cubicOut }}>
                  {#each subroutes as subroute}
                    <a
                      href={subroute.href}
                      class="subroute-item"
                      class:active={isSubrouteActive(subroute)}
                      onclick={() => handleSubrouteClick(subroute, item)}
                    >
                      {subroute.label}
                    </a>
                  {/each}
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      {/if}

      <!-- Add Button -->
      {#if showAdd && onAddClick}
        <button
          class="add-item-btn"
          class:collapsed={isCollapsed}
          onclick={handleAddClick}
          title={addLabel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {#if !isCollapsed}
            <span transition:fade={{ duration: 150 }}>{addLabel}</span>
          {/if}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .left-bar-group {
    padding: 0.125rem 0;
  }

  /* Group Header */
  .group-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-base04);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 200ms ease;
    border: none;
    background: transparent;
    font-family: inherit;
    justify-content: flex-start;
  }

  .group-header:hover {
    color: var(--color-base05);
  }

  .group-title {
    flex: 1;
    text-align: left;
  }

  .group-count {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    background-color: var(--color-base02);
    color: var(--color-base05);
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .group-chevron {
    color: var(--color-base04);
    transition: all 200ms ease;
    flex-shrink: 0;
  }

  .group-chevron.rotate-180 {
    transform: rotate(180deg);
  }

  /* Group Content */
  .group-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0 0.5rem;
  }

  .group-item-wrapper {
    display: flex;
    flex-direction: column;
  }

  /* Item Button */
  .group-item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--color-base06);
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    overflow: hidden;
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
  }

  .group-item:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .group-item.active,
  .group-item.expanded {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  /* Avatar */
  .item-avatar-container {
    position: relative;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
  }

  .item-avatar-wrapper {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-avatar {
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
    border: 1px solid var(--color-base00);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .platform-badge.instagram {
    background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  }

  .platform-badge.shopify {
    background-color: var(--color-base0B);
  }

  .item-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .item-chevron {
    color: var(--color-base05);
    transition: all 200ms ease;
    flex-shrink: 0;
  }

  .item-chevron.rotate-180 {
    transform: rotate(180deg);
  }

  /* Subroutes */
  .item-subroutes {
    margin-left: 2.5rem;
    padding-left: 0.5rem;
    border-left: 2px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .subroute-item {
    padding: 0.375rem 0.75rem;
    display: block;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--color-base05);
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    text-decoration: none;
  }

  .subroute-item:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .subroute-item.active {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    font-weight: 500;
  }

  /* Add Button */
  .add-item-btn {
    width: 100%;
    padding: 0.5rem 0.75rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--color-base0D);
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 200ms ease;
    border: 1px solid color-mix(in srgb, var(--color-base0D) 30%, transparent);
    background: transparent;
    font-family: inherit;
  }

  .add-item-btn:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    border-color: var(--color-base0D);
  }

  .add-item-btn.collapsed {
    width: 2rem;
    height: 2rem;
    padding: 0;
    margin: 0 auto;
    justify-content: center;
  }
</style>
