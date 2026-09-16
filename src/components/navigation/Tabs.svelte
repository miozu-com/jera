<!--
  @component Tabs

  Tabbed navigation component following the WAI-ARIA Tabs pattern with
  automatic activation: Arrow keys move focus *and* selection, Home/End jump to
  the first/last enabled tab, disabled tabs are skipped, and Tab leaves the
  tablist (roving tabindex).

  When the tabs are wider than their container they scroll horizontally and the
  active tab is kept in view.

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

  @example Wired to a single tabpanel
  <Tabs {tabs} active={activeTab} idPrefix="worker-tab" panelId="worker-panel" label="Worker sections" />
  <div id="worker-panel" role="tabpanel" aria-labelledby="worker-tab-{activeTab}">…</div>

  @example With icons (component reference)
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
    color = 'primary',
    fullWidth = false,
    scrollable = true,
    panelId = '',
    idPrefix = '',
    label = '',
    onchange = () => {},
    class: className = ''
  } = $props();

  const accentMap = {
    primary: 'var(--color-base0E)',
    danger: 'var(--color-base08)',
    warning: 'var(--color-base09)',
    success: 'var(--color-base0B)',
    info: 'var(--color-base0D)'
  };
  const accent = $derived(accentMap[color] || accentMap.primary);

  let tablistEl = $state(null);
  let scrollerEl = $state(null);
  let indicatorStyle = $state('');
  let hasMeasured = false;

  function tabButtonId(id) {
    return idPrefix ? `${idPrefix}-${id}` : undefined;
  }

  /** The rendered button for the active tab, or null. */
  function activeButton() {
    if (!tablistEl || active === null || active === undefined) return null;
    const key = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(active)) : active;
    return tablistEl.querySelector(`[data-tab-id="${key}"]`);
  }

  function prefersReducedMotion() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    );
  }

  // Initialize active to first tab if not set
  $effect(() => {
    if (active === null && tabs.length > 0) {
      active = tabs[0].id;
    }
  });

  // Sliding indicator: measure active tab position and animate
  $effect(() => {
    if (!tablistEl || !active) return;

    const measure = () => {
      const btn = activeButton();
      if (!btn) {
        indicatorStyle = 'opacity: 0;';
        return;
      }
      indicatorStyle = `--indicator-left: ${btn.offsetLeft}px; --indicator-width: ${btn.offsetWidth}px; opacity: 1;`;
    };

    measure();

    // Observe layout changes (resize, font load, etc.)
    const ro = new ResizeObserver(measure);
    ro.observe(tablistEl);

    return () => ro.disconnect();
  });

  // Keep the active tab inside the horizontal scroll viewport.
  $effect(() => {
    // Re-run whenever the selection, the tab set, or the binding changes.
    void active;
    void tabs.length;
    void scrollerEl;
    if (!scrollable) return;
    const smooth = hasMeasured;
    hasMeasured = true;
    scrollActiveIntoView(smooth);
  });

  function scrollActiveIntoView(smooth) {
    if (!scrollerEl) return;
    const btn = activeButton();
    if (!btn) return;

    const b = btn.getBoundingClientRect();
    const s = scrollerEl.getBoundingClientRect();
    if (s.width === 0) return;

    const pad = 8;
    let delta = 0;
    if (b.left < s.left + pad) delta = b.left - s.left - pad;
    else if (b.right > s.right - pad) delta = b.right - s.right + pad;
    if (delta === 0) return;

    scrollerEl.scrollBy({
      left: delta,
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto'
    });
  }

  function selectTab(tab) {
    if (tab.disabled) return;
    active = tab.id;
    onchange(tab);
  }

  /** Index of the next enabled tab `step` places away, wrapping. -1 if none. */
  function nextEnabledIndex(from, step) {
    const n = tabs.length;
    for (let i = 1; i <= n; i++) {
      const idx = (((from + step * i) % n) + n) % n;
      if (!tabs[idx]?.disabled) return idx;
    }
    return -1;
  }

  /** First enabled index scanning forwards (step 1) or backwards (step -1). */
  function edgeEnabledIndex(step) {
    const n = tabs.length;
    for (let i = 0; i < n; i++) {
      const idx = step === 1 ? i : n - 1 - i;
      if (!tabs[idx]?.disabled) return idx;
    }
    return -1;
  }

  function focusTabAt(index) {
    const buttons = tablistEl?.querySelectorAll('[role="tab"]');
    buttons?.[index]?.focus();
  }

  function handleKeydown(e, index) {
    if (tabs.length === 0) return;

    let nextIndex;
    if (e.key === 'ArrowRight') nextIndex = nextEnabledIndex(index, 1);
    else if (e.key === 'ArrowLeft') nextIndex = nextEnabledIndex(index, -1);
    else if (e.key === 'Home') nextIndex = edgeEnabledIndex(1);
    else if (e.key === 'End') nextIndex = edgeEnabledIndex(-1);
    else return;

    e.preventDefault();
    if (nextIndex < 0) return;

    // Automatic activation: move focus AND selection together.
    if (nextIndex !== index) selectTab(tabs[nextIndex]);
    focusTabAt(nextIndex);
  }

  const showIndicator = $derived(variant !== 'pills');

  // Roving tabindex. If `active` matches no tab — a consumer whose selection is
  // derived from a URL alias can land there — the first enabled tab stays
  // tabbable so the tablist never drops out of the Tab order entirely.
  const tabbableIndex = $derived.by(() => {
    const selected = tabs.findIndex(t => t.id === active);
    if (selected >= 0) return selected;
    const firstEnabled = tabs.findIndex(t => !t.disabled);
    return firstEnabled >= 0 ? firstEnabled : -1;
  });
</script>

<div class="tabs-scroll" class:tabs-scroll-on={scrollable} bind:this={scrollerEl}>
  <div
    class="tabs tabs-{variant} tabs-{size} {className}"
    class:tabs-full-width={fullWidth}
    role="tablist"
    aria-label={label || undefined}
    bind:this={tablistEl}
    style="--tabs-accent: {accent}"
  >
    {#if showIndicator}
      <span
        class="tabs-indicator"
        class:tabs-indicator-underline={variant === 'underline'}
        style={indicatorStyle}
        aria-hidden="true"
      ></span>
    {/if}

    {#each tabs as tab, index (tab.id)}
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={active === tab.id}
        class:tab-disabled={tab.disabled}
        id={tabButtonId(tab.id)}
        aria-selected={active === tab.id}
        aria-disabled={tab.disabled}
        aria-controls={tab.panelId || panelId || undefined}
        tabindex={index === tabbableIndex ? 0 : -1}
        data-tab-id={tab.id}
        onclick={() => selectTab(tab)}
        onkeydown={e => handleKeydown(e, index)}
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
</div>

<style>
  /* ---- Horizontal scroll wrapper ----
     `display: contents` when disabled, so the tablist stays the flex/inline
     item it has always been and no consumer layout shifts. When enabled the
     wrapper becomes the scroll container; the 3px padding (cancelled by the
     matching negative margin) keeps the focus ring from being clipped by the
     scroll container's overflow. */
  .tabs-scroll {
    display: contents;
  }

  .tabs-scroll-on {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    padding: 3px;
    margin: -3px;
    scrollbar-width: none;
  }

  .tabs-scroll-on::-webkit-scrollbar {
    display: none;
  }

  .tabs {
    display: inline-flex;
    position: relative;
    gap: var(--space-1);
    background: transparent;
    border-radius: 0;
    padding: 0;
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
    top: 0;
    bottom: 0;
    background: var(--color-base02);
    border-radius: var(--radius-sm);
    pointer-events: none;
    z-index: 0;
    transition: left var(--duration-base) var(--ease-out),
                width var(--duration-base) var(--ease-out),
                opacity var(--duration-fast) var(--ease-out);
    opacity: 0;
  }

  /* Segment variant indicator */
  .tabs-segment .tabs-indicator {
    top: 1px;
    bottom: 1px;
    background: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
  }

  /* Underline variant indicator — sits ON the rule (hence the -1px), at 2px so
     it reads as a mark rather than as a thicker piece of the same line. */
  .tabs-indicator-underline {
    top: auto;
    bottom: calc(-1 * var(--border-width-thin));
    height: 2px;
    background: var(--tabs-accent);
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
    padding: var(--space-2) var(--space-6);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base04);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
    white-space: nowrap;
  }

  /* Size variants */
  .tabs-sm .tab {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
  }

  .tabs-lg .tab {
    padding: var(--space-4) var(--space-8);
    font-size: var(--text-base);
  }

  .tab:hover:not(.tab-disabled) {
    color: var(--color-base05);
  }

  .tab-active,
  .tab-active:hover {
    color: var(--color-base06);
  }

  .tab:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
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
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-base04);
  }

  .tab-active .tab-badge {
    color: inherit;
  }

  /* ---- Segment variant ---- */
  .tabs-segment {
    background: var(--color-base01);
    border-radius: var(--radius-sm);
    padding: 1px;
    gap: 0;
    border: var(--border-width-default) solid var(--color-base02);
  }

  .tabs-segment .tab {
    color: var(--color-base04);
  }

  .tabs-segment .tab-active {
    background: transparent;
    box-shadow: none;
    color: var(--color-base05);
  }

  .tabs-segment .tab-active:focus-visible {
    box-shadow: var(--focus-ring-shadow);
  }

  /* ---- Underline variant ----
     The rule is the point of this variant: it spans the full width of whatever
     holds the tabs, so the strip reads as the page's own edge rather than as a
     row of links that happens to have a line under it. `inline-flex` (the base
     `.tabs` display) shrank the rule to the width of the labels, which left it
     stopping in mid-air on a wide screen. */
  .tabs-underline {
    display: flex;
    width: 100%;
    background: transparent;
    padding: 0;
    gap: 0;
    border-bottom: var(--border-width-thin) solid
      color-mix(in srgb, var(--color-base03) 60%, transparent);
  }

  .tabs-underline .tab {
    border-radius: 0;
    margin-bottom: -1px;
    padding-block: var(--space-3);
    padding-inline: var(--space-4);
    font-weight: 500;
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .tabs-underline .tab-active {
    background: transparent;
    box-shadow: none;
    color: var(--color-base06);
  }

  .tabs-underline .tab:hover:not(.tab-disabled) {
    background: transparent;
    color: var(--color-base06);
  }

  /* ---- Pills variant ---- */
  .tabs-pills {
    background: transparent;
    padding: 0;
    gap: var(--space-4);
  }

  .tabs-pills .tab {
    border: var(--border-width-default) solid var(--color-base03);
  }

  .tabs-pills .tab-active {
    background: var(--color-base02);
    border-color: var(--color-base03);
    color: var(--color-base06);
  }
</style>
