<!--
  @component Tabs

  Tabbed navigation component with keyboard navigation and sliding indicator.

  @example Basic usage
  <Tabs
    tabs={[
      { id: 'tab1', label: 'Overview' },
      { id: 'tab2', label: 'Settings' },
      { id: 'tab3', label: 'Analytics' }
    ]}
    bind:active={activeTab}
  />

  @example Segment variant (iOS-style)
  <Tabs
    tabs={[...]}
    bind:active={activeTab}
    variant="segment"
    size="sm"
    fullWidth
  />

  @example With icons (component reference)
  <Tabs
    tabs={[
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'settings', label: 'Settings', icon: SettingsIcon }
    ]}
  />
-->
<script>
  import { generateId } from '../../utils/reactive.svelte.js';

  let {
    tabs = [],
    active = $bindable(null),
    variant = 'default',
    size = 'md',
    fullWidth = false,
    onchange = () => {},
    class: className = ''
  } = $props();

  const componentId = generateId();
  let tablistEl = $state(null);
  let indicatorStyle = $state('');

  // Initialize active to first tab if not set
  $effect(() => {
    if (active === null && tabs.length > 0) {
      active = tabs[0].id;
    }
  });

  // Sliding indicator: measure active tab position and animate
  $effect(() => {
    if (!tablistEl || !active) return;

    // Find the active tab button by data attribute
    const activeBtn = tablistEl.querySelector(`[data-tab-id="${active}"]`);
    if (!activeBtn) {
      indicatorStyle = 'opacity: 0;';
      return;
    }

    const left = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;
    indicatorStyle = `--indicator-left: ${left}px; --indicator-width: ${width}px; opacity: 1;`;

    // Observe layout changes (resize, font load, etc.)
    const ro = new ResizeObserver(() => {
      const btn = tablistEl?.querySelector(`[data-tab-id="${active}"]`);
      if (btn) {
        indicatorStyle = `--indicator-left: ${btn.offsetLeft}px; --indicator-width: ${btn.offsetWidth}px; opacity: 1;`;
      }
    });
    ro.observe(tablistEl);

    return () => ro.disconnect();
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
      const buttons = e.currentTarget.parentElement.querySelectorAll('[role="tab"]');
      buttons[nextIndex]?.focus();
    }
  }

  const showIndicator = $derived(variant !== 'pills');
</script>

<div
  class="tabs tabs-{variant} tabs-{size} {className}"
  class:tabs-full-width={fullWidth}
  role="tablist"
  bind:this={tablistEl}
>
  {#if showIndicator}
    <span
      class="tabs-indicator"
      class:tabs-indicator-underline={variant === 'underline'}
      style={indicatorStyle}
      aria-hidden="true"
    ></span>
  {/if}

  {#each tabs as tab, index}
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={active === tab.id}
      class:tab-disabled={tab.disabled}
      aria-selected={active === tab.id}
      aria-disabled={tab.disabled}
      aria-controls={tab.panelId || `${componentId}-panel-${tab.id}`}
      tabindex={active === tab.id ? 0 : -1}
      data-tab-id={tab.id}
      onclick={() => selectTab(tab)}
      onkeydown={(e) => handleKeydown(e, tab, index)}
    >
      {#if tab.icon}
        {@const Icon = tab.icon}
        <span class="tab-icon">
          <Icon size={16} />
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
    position: relative;
    gap: var(--space-1);
    background: var(--color-base01);
    border-radius: var(--radius-lg);
    padding: var(--space-1);
  }

  .tabs-full-width {
    display: flex;
    width: 100%;
  }

  .tabs-full-width .tab {
    flex: 1;
    justify-content: center;
  }

  /* ---- Sliding Indicator ---- */
  .tabs-indicator {
    position: absolute;
    left: var(--indicator-left, 0);
    width: var(--indicator-width, 0);
    top: var(--space-1);
    bottom: var(--space-1);
    background: var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    pointer-events: none;
    z-index: 0;
    transition: left var(--duration-base) var(--ease-out),
                width var(--duration-base) var(--ease-out),
                opacity var(--duration-fast) var(--ease-out);
    opacity: 0;
  }

  /* Segment variant indicator */
  .tabs-segment .tabs-indicator {
    background: var(--color-base00);
    box-shadow: var(--shadow-sm);
    border: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
  }

  /* Underline variant indicator */
  .tabs-indicator-underline {
    top: auto;
    bottom: 0;
    height: 2px;
    background: var(--color-base0D);
    border-radius: var(--radius-full);
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .tabs-indicator {
      transition: none;
    }
  }

  /* ---- Tab button ---- */
  .tab {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base05);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
    white-space: nowrap;
  }

  /* Size variants */
  .tabs-sm .tab {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
  }

  .tabs-lg .tab {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-base);
  }

  .tab:hover:not(.tab-disabled) {
    color: var(--color-base07);
  }

  .tab:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-base0D);
  }

  .tab-active {
    color: var(--color-base07);
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
    min-width: var(--space-5);
    height: var(--space-5);
    padding: 0 var(--space-1);
    background: var(--color-base03);
    border-radius: 9999px;
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .tab-active .tab-badge {
    background: var(--color-base0D);
    color: var(--color-base07);
  }

  /* ---- Segment variant ---- */
  .tabs-segment {
    background: var(--color-base01);
    border-radius: var(--radius-lg);
    padding: var(--space-1);
    border: 1px solid color-mix(in srgb, var(--color-base03) 50%, transparent);
  }

  .tabs-segment .tab-active {
    background: transparent;
    box-shadow: none;
  }

  /* ---- Underline variant ---- */
  .tabs-underline {
    background: transparent;
    padding: 0;
    gap: 0;
    border-bottom: 1px solid var(--color-base03);
  }

  .tabs-underline .tab {
    border-radius: 0;
    margin-bottom: -1px;
  }

  .tabs-underline .tab-active {
    background: transparent;
    box-shadow: none;
    color: var(--color-base0D);
  }

  .tabs-underline .tab:hover:not(.tab-disabled) {
    background: transparent;
  }

  /* ---- Pills variant ---- */
  .tabs-pills {
    background: transparent;
    padding: 0;
    gap: var(--space-2);
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
