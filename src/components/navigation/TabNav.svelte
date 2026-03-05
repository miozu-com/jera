<!--
  @component TabNav

  A flexible tab navigation component with multiple variants.
  Supports icons, badges, counts, and different visual styles.

  @example Basic tabs
  <TabNav
    tabs={[
      {id: 'overview', label: 'Overview'},
      {id: 'settings', label: 'Settings'}
    ]}
    bind:active={activeTab}
  />

  @example With icons and counts
  <TabNav
    tabs={[
      {id: 'inbox', label: 'Inbox', icon: InboxIcon, count: 12},
      {id: 'sent', label: 'Sent', icon: SendIcon}
    ]}
    bind:active={activeTab}
    variant="pills"
  />

  @example Underline variant
  <TabNav
    tabs={[{id: 'all', label: 'All'}, {id: 'active', label: 'Active'}]}
    bind:active={activeTab}
    variant="underline"
  />
-->
<script>
  let {
    tabs = [],
    active = $bindable(''),
    variant = 'default',
    size = 'md',
    color = 'primary',
    class: className = '',
    onchange
  } = $props();

  const accentMap = {
    primary: 'var(--color-base0E)',
    danger: 'var(--color-base08)',
    warning: 'var(--color-base09)',
    success: 'var(--color-base0B)',
    info: 'var(--color-base0D)'
  };
  const accent = $derived(accentMap[color] || accentMap.primary);

  function handleTabClick(tab) {
    if (tab.disabled) return;
    active = tab.id;
    onchange?.(tab);
  }

  function handleKeydown(e, index) {
    let nextIndex = index;

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (!nextTab.disabled) {
      handleTabClick(nextTab);
      const buttons = e.currentTarget.parentElement.querySelectorAll('[role="tab"]');
      buttons[nextIndex]?.focus();
    }
  }
</script>

<nav class="tab-nav tab-nav-{variant} tab-nav-{size} {className}" role="tablist" style="--tabs-accent: {accent}">
  {#each tabs as tab, index}
    <button
      type="button"
      class="tab-item"
      class:active={active === tab.id}
      class:disabled={tab.disabled}
      role="tab"
      aria-selected={active === tab.id}
      aria-disabled={tab.disabled}
      tabindex={active === tab.id ? 0 : -1}
      onclick={() => handleTabClick(tab)}
      onkeydown={(e) => handleKeydown(e, index)}
    >
      {#if tab.icon}
        <span class="tab-icon">
          {@render tab.icon()}
        </span>
      {/if}
      <span class="tab-label">{tab.label}</span>
      {#if tab.count !== undefined}
        <span class="tab-count">({tab.count})</span>
      {/if}
      {#if tab.badge}
        <span class="tab-badge">{tab.badge}</span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .tab-nav {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  /* Default variant - subtle background */
  .tab-nav-default {
    padding: var(--space-1);
    background: var(--color-base01);
    border-radius: var(--radius-sm);
  }

  .tab-nav-default .tab-item {
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-sm);
    background: transparent;
    border: none;
    color: var(--color-base04);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .tab-nav-default .tab-item:hover:not(.disabled) {
    color: var(--color-base05);
    background: var(--color-base02);
  }

  .tab-nav-default .tab-item.active {
    background: var(--color-base00);
    color: var(--color-base06);
    box-shadow: var(--shadow-xs);
  }

  /* Pills variant */
  .tab-nav-pills {
    gap: var(--space-4);
  }

  .tab-nav-pills .tab-item {
    padding: var(--space-4) var(--space-8);
    border-radius: var(--radius-sm);
    background: transparent;
    border: var(--border-width-default) solid transparent;
    color: var(--color-base04);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .tab-nav-pills .tab-item:hover:not(.disabled) {
    background: var(--color-base01);
    color: var(--color-base05);
  }

  .tab-nav-pills .tab-item.active {
    background: var(--color-base02);
    border-color: var(--color-base03);
    color: var(--color-base06);
  }

  /* Underline variant */
  .tab-nav-underline {
    gap: 0;
    border-bottom: 1px solid var(--color-base02);
  }

  .tab-nav-underline .tab-item {
    padding: var(--space-6) var(--space-8);
    background: transparent;
    border: none;
    border-bottom: var(--border-width-default) solid transparent;
    margin-bottom: -1px;
    color: var(--color-base04);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .tab-nav-underline .tab-item:hover:not(.disabled) {
    color: var(--color-base05);
    border-bottom-color: var(--color-base03);
  }

  .tab-nav-underline .tab-item.active {
    color: var(--color-base06);
    border-bottom-color: var(--tabs-accent);
  }

  /* Sizes */
  .tab-nav-sm .tab-item {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
  }

  .tab-nav-lg .tab-item {
    padding: var(--space-6) var(--space-10);
    font-size: var(--text-base);
  }

  /* Shared styles */
  .tab-item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-4);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tab-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab-item:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  .tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tab-label {
    line-height: 1;
  }

  .tab-count {
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .tab-item.active .tab-count {
    color: inherit;
    opacity: 0.7;
  }

  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 var(--space-2);
    font-size: var(--text-xs);
    font-weight: 600;
    background: var(--color-base09);
    color: var(--color-base00);
    border-radius: var(--radius-full);
  }

  /* Scrollable container */
  @media (max-width: 768px) {
    .tab-nav {
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .tab-nav::-webkit-scrollbar {
      display: none;
    }
  }
</style>
