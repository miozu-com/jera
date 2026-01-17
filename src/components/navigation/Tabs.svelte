<!--
  @component Tabs

  Tabbed navigation component.

  @example Basic usage
  <Tabs
    tabs={[
      { id: 'tab1', label: 'Overview' },
      { id: 'tab2', label: 'Settings' },
      { id: 'tab3', label: 'Analytics' }
    ]}
    bind:active={activeTab}
  />

  @example With icons
  <Tabs
    tabs={[
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'settings', label: 'Settings', icon: SettingsIcon }
    ]}
  />
-->
<script>
  let {
    tabs = [],
    active = $bindable(null),
    variant = 'default',
    size = 'md',
    fullWidth = false,
    onchange = () => {},
    class: className = ''
  } = $props();

  // Initialize active to first tab if not set
  $effect(() => {
    if (active === null && tabs.length > 0) {
      active = tabs[0].id;
    }
  });

  function selectTab(tab) {
    if (tab.disabled) return;
    active = tab.id;
    onchange(tab);
  }

  function handleKeydown(e, tab, index) {
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
      selectTab(nextTab);
      // Focus the next tab button
      const buttons = e.currentTarget.parentElement.querySelectorAll('[role="tab"]');
      buttons[nextIndex]?.focus();
    }
  }
</script>

<div
  class="tabs tabs-{variant} tabs-{size} {className}"
  class:tabs-full-width={fullWidth}
  role="tablist"
>
  {#each tabs as tab, index}
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={active === tab.id}
      class:tab-disabled={tab.disabled}
      aria-selected={active === tab.id}
      aria-disabled={tab.disabled}
      tabindex={active === tab.id ? 0 : -1}
      onclick={() => selectTab(tab)}
      onkeydown={(e) => handleKeydown(e, tab, index)}
    >
      {#if tab.icon}
        <span class="tab-icon">
          <svelte:component this={tab.icon} size={16} />
        </span>
      {/if}
      {#if tab.label}
        <span class="tab-label">{tab.label}</span>
      {/if}
      {#if tab.badge !== undefined}
        <span class="tab-badge">{tab.badge}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: inline-flex;
    gap: 0.25rem;
    background: var(--color-base01);
    border-radius: 0.5rem;
    padding: 0.25rem;
  }

  .tabs-full-width {
    display: flex;
    width: 100%;
  }

  .tabs-full-width .tab {
    flex: 1;
    justify-content: center;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-base05);
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  /* Size variants */
  .tabs-sm .tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .tabs-lg .tab {
    padding: 0.625rem 1.25rem;
    font-size: 1rem;
  }

  .tab:hover:not(.tab-disabled) {
    color: var(--color-base07);
    background: var(--color-base02);
  }

  .tab:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-base0D);
  }

  .tab-active {
    background: var(--color-base02);
    color: var(--color-base07);
    box-shadow: var(--shadow-sm);
  }

  .tab-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab-icon {
    display: flex;
    align-items: center;
  }

  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.375rem;
    background: var(--color-base03);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .tab-active .tab-badge {
    background: var(--color-base0D);
    color: var(--color-base07);
  }

  /* Underline variant */
  .tabs-underline {
    background: transparent;
    padding: 0;
    gap: 0;
    border-bottom: 1px solid var(--color-base03);
  }

  .tabs-underline .tab {
    border-radius: 0;
    margin-bottom: -1px;
    border-bottom: 2px solid transparent;
  }

  .tabs-underline .tab-active {
    background: transparent;
    box-shadow: none;
    border-bottom-color: var(--color-base0D);
    color: var(--color-base0D);
  }

  .tabs-underline .tab:hover:not(.tab-disabled) {
    background: transparent;
    border-bottom-color: var(--color-base03);
  }

  /* Pills variant */
  .tabs-pills {
    background: transparent;
    padding: 0;
    gap: 0.5rem;
  }

  .tabs-pills .tab {
    border: 1px solid var(--color-base03);
  }

  .tabs-pills .tab-active {
    background: var(--color-base0D);
    border-color: var(--color-base0D);
    color: var(--color-base07);
  }
</style>
