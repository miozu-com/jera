<!-- file-size: justified -- one navigation bar: the mega-menu, its sections row and their phone layouts share one set of styles -->
<!--
  @component NavBar
  Reusable horizontal mega-menu navigation bar with hover dropdowns.

  The brand item (see NavBarBrand) shows the current page context: click, tap or
  Enter opens a panel with the breadcrumb trail, page facts, the area's sibling
  pages and page actions. Pass `onBrandClick` to take over the tap entirely,
  e.g. to open a workspace switcher on mobile.

  Props:
    brand     - Current page context: {label, icon, badge?, description?,
                breadcrumbs?, info?, links?, linksLabel?, actions?} (see NavBarBrand)
    brandPanelHeader / brandPanelFooter - Snippets forwarded to the brand panel
    onBrandClick - Optional: called on brand tap/click instead of opening the
                   context panel. Receives no args.
    sections  - Dropdown menu sections: {id, label, items: [{title, href, icon?,
                desc?, badge?, badgeColor?, isNew?, children?: [{title, href}]}]}.
                An item with `children` shows a chevron; hovering, focusing or
                ArrowRight opens its pages in a flyout beside the row.
    subnavItems - Array of {id, label, href, badge?, icon?} for route-specific ChipNav
    activeSubnav - ID of the currently active subnav item
    sticky    - Pin to top on scroll with frosted-glass backdrop (default: false)
    subnav    - Snippet slot: fallback for custom subnav content
    actions   - Snippet slot: right-side action buttons
    renderIcon - Snippet: (name, size) => renders an icon component
    isActive  - Function: (href) => boolean for active state
    phoneSections - Where the sections go at <= 640px (default 'inline'):
                    'inline' expands them in the bar as on desktop; 'row' drops
                    them to a full-width row under the bar (panels span the
                    screen); 'hidden' removes the toggle, for apps whose phone
                    menu already lists the sections.

  @example With subnav data props (replaces dropdown sections)
  <NavBar brand={...} subnavItems={[{id:'specs', label:'Specs', href:'/tests/specs'}]} activeSubnav="specs" />

  @example With dropdown sections
  <NavBar
    brand={{ label: 'Wardrobe', description: 'Product catalog & garment library', breadcrumbs: [{label: 'Home', href: '/'}, {label: 'Wardrobe'}] }}
    sections={[
      { id: 'commerce', label: 'Commerce', items: [
        { title: 'Wardrobe', href: '/wardrobe', desc: 'Product catalog',
          children: [{ title: 'Garments', href: '/wardrobe/garments' }] }
      ]}
    ]}
  >
    {#snippet renderIcon(name, size)}
      <Icon {name} {size} />
    {/snippet}
    {#snippet actions()}
      <button class="nav-action-btn">Search</button>
    {/snippet}
  </NavBar>
-->
<script>
  import ChipNav from './ChipNav.svelte';
  import NavBarBrand from './NavBarBrand.svelte';
  import Badge from '../primitives/Badge.svelte';
  import {badgeVariant} from '../../utils/badge.js';

  let {
    brand = { label: 'Home', description: '', breadcrumbs: [] },
    sections = [],
    subnavItems = [],
    activeSubnav = null,
    sticky = false,
    onBrandClick = null,
    actions,
    center,
    subnav,
    renderIcon,
    isActive = () => false,
    phoneSections = 'inline',
    brandPanelHeader,
    brandPanelFooter
  } = $props();

  let activeDropdown = $state(null);
  // The href of the nested item whose flyout is showing, in the open section.
  let activeItem = $state(null);
  // Owned here (not inside NavBarBrand) purely so opening a section dropdown can
  // close the brand panel and vice versa — the two are mutually exclusive.
  let brandOpen = $state(false);
  let sectionsExpanded = $state(false);
  let closeTimer = null;

  function toggleSections() {
    sectionsExpanded = !sectionsExpanded;
    if (!sectionsExpanded) {
      activeDropdown = null;
    }
  }

  function openDropdown(id) {
    clearTimer();
    brandOpen = false;
    if (activeDropdown !== id) activeItem = null;
    activeDropdown = id;
  }

  const flyoutId = (href) => `navbar-flyout-${href.replace(/[^a-z0-9]+/gi, '-')}`;

  // The child the current page sits under: the longest matching href, so a
  // section root (Overview) does not light up beside its own sub-page.
  function activeChild(children) {
    let best = null;
    for (const child of children) {
      if (isActive(child.href) && (!best || child.href.length > best.length)) best = child.href;
    }
    return best;
  }

  function onItemKey(e, href) {
    if (e.key !== 'ArrowRight') return;
    e.preventDefault();
    activeItem = href;
    requestAnimationFrame(() => document.getElementById(flyoutId(href))?.querySelector('a')?.focus());
  }

  function onChildKey(e, parentHref) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const li = e.currentTarget.parentElement;
      const next = e.key === 'ArrowDown' ? li.nextElementSibling : li.previousElementSibling;
      next?.querySelector('a')?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById(flyoutId(parentHref))?.closest('.dropdown-row')?.querySelector('.dropdown-item')?.focus();
    }
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => {
      activeDropdown = null;
      activeItem = null;
      brandOpen = false;
    }, 120);
  }

  function clearTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function sectionIsActive(section) {
    return section.items?.some((item) => isActive(item.href));
  }
</script>

<nav class="navbar" class:navbar--sticky={sticky} data-phone-sections={phoneSections}>
  <div class="navbar-inner">
    <NavBarBrand
      {brand}
      {renderIcon}
      {onBrandClick}
      panelHeader={brandPanelHeader}
      panelFooter={brandPanelFooter}
      bind:open={brandOpen}
      onopen={() => (activeDropdown = null)}
    />

    <!-- Section toggle — always visible when sections exist -->
    {#if sections.length}
      <button
        class="navbar-nav-toggle"
        class:expanded={sectionsExpanded}
        onclick={toggleSections}
        aria-expanded={sectionsExpanded}
        aria-label={sectionsExpanded ? 'Collapse navigation' : 'Expand navigation'}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4.5" cy="4.5" r="1.6" />
          <circle cx="11.5" cy="4.5" r="1.6" />
          <circle cx="4.5" cy="11.5" r="1.6" />
          <circle cx="11.5" cy="11.5" r="1.6" />
        </svg>
      </button>
    {/if}

    <!-- Section triggers (expanded via toggle) -->
    {#if sectionsExpanded && sections.length}
      <div class="navbar-sections">
        {#each sections as section}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="navbar-dropdown"
            onmouseenter={() => openDropdown(section.id)}
            onmouseleave={scheduleClose}
            onfocusin={() => openDropdown(section.id)}
            onfocusout={(e) => !e.currentTarget.contains(e.relatedTarget) && scheduleClose()}
            onkeydown={(e) => e.key === 'Escape' && (activeDropdown = null)}
          >
            <button
              class="navbar-trigger"
              class:active={activeDropdown === section.id || sectionIsActive(section)}
              aria-expanded={activeDropdown === section.id}
              aria-haspopup="true"
            >
              <span>{section.label}</span>
              <svg
                class="trigger-chevron"
                class:rotated={activeDropdown === section.id}
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"><path d="M6 9l6 6 6-6" /></svg
              >
            </button>

            {#if activeDropdown === section.id}
              <div class="dropdown-panel">
                <ul class="dropdown-list" role="menu" aria-label={section.label}>
                  {#each section.items as item (item.href)}
                    {@const hasChildren = item.children?.length > 0}
                    {@const flyoutOpen = hasChildren && activeItem === item.href}
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <li
                      class="dropdown-row"
                      role="none"
                      onmouseenter={() => (activeItem = hasChildren ? item.href : null)}
                    >
                      <a
                        href={item.href}
                        role="menuitem"
                        class="dropdown-item"
                        class:active={isActive(item.href)}
                        class:open={flyoutOpen}
                        aria-haspopup={hasChildren ? 'menu' : undefined}
                        aria-expanded={hasChildren ? flyoutOpen : undefined}
                        onfocus={() => (activeItem = hasChildren ? item.href : null)}
                        onkeydown={(e) => hasChildren && onItemKey(e, item.href)}
                      >
                        <span class="item-icon">
                          {#if renderIcon}{@render renderIcon(item.icon, 14)}{/if}
                        </span>
                        <span class="item-body">
                          <span class="item-title">
                            {item.title}
                            {#if item.isNew}<span class="badge-new">new</span>{/if}
                            {#if item.badge}
                              <Badge size="xs" variant={badgeVariant(item.badgeColor, 'warning')}>{item.badge}</Badge>
                            {/if}
                          </span>
                          {#if item.desc}<span class="item-desc">{item.desc}</span>{/if}
                        </span>
                        {#if hasChildren}
                          <svg class="item-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                        {/if}
                      </a>
                      {#if flyoutOpen}
                        {@const current = activeChild(item.children)}
                        <div class="flyout">
                          <ul class="flyout-list" role="menu" aria-label={item.title} id={flyoutId(item.href)}>
                            {#each item.children as child (child.href)}
                              <li role="none">
                                <a
                                  href={child.href}
                                  role="menuitem"
                                  class="flyout-link"
                                  class:active={child.href === current}
                                  aria-current={child.href === current ? 'page' : undefined}
                                  onkeydown={(e) => onChildKey(e, item.href)}
                                >{child.title}</a>
                              </li>
                            {/each}
                          </ul>
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Route-specific subnav (coexists with section toggle) -->
    {#if subnavItems.length > 0}
      <ChipNav items={subnavItems} active={activeSubnav} {renderIcon} />
    {:else if subnav}
      <div class="navbar-subnav-slot">
        {@render subnav()}
      </div>
    {/if}

    <!-- Center slot (contextual info chips, stats, etc.) -->
    {#if center}
      <div class="navbar-center">
        {@render center()}
      </div>
    {/if}

    <!-- Right side actions -->
    <div class="navbar-actions">
      {@render actions?.()}
    </div>
  </div>
</nav>

<style>
  /* ── Navbar container ────────────────── */
  .navbar {
    background: var(--color-base01);
    border-bottom: var(--border-width-thin) solid var(--color-base02);
  }

  .navbar--sticky {
    position: sticky;
    top: 0;
    z-index: var(--z-fixed);
    background: color-mix(in srgb, var(--color-base01) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .navbar-inner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0 var(--space-8);
    height: var(--navbar-height); /* 44px — the token consumers pin to */
  }

  /* ── Section toggle trigger ─────────────── */
  .navbar-nav-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: var(--border-width-thin) solid transparent;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-base04);
    cursor: pointer;
    flex-shrink: 0;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default),
                border-color var(--duration-fast) var(--ease-default);
  }

  .navbar-nav-toggle:hover {
    color: var(--color-base06);
    background-color: var(--color-base02);
  }

  .navbar-nav-toggle.expanded {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  /* ── Subnav (ChipNav or snippet slot) ─── */
  .navbar :global(.chip-nav) {
    flex: 1;
  }

  .navbar :global(.chip-nav .chip) {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-dense);
  }

  .navbar-subnav-slot {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }


  /* ── Section triggers row ────────────── */
  .navbar-sections {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .navbar-dropdown {
    position: relative;
  }

  .navbar-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-base04);
    font-family: inherit;
    font-size: var(--text-dense);
    font-weight: var(--font-weight-medium);
    line-height: 1.2;
    cursor: pointer;
    white-space: nowrap;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  .navbar-trigger:hover,
  .navbar-trigger.active {
    color: var(--color-base06);
    background-color: var(--color-base02);
  }

  .trigger-chevron {
    opacity: 0.5;
    transition: transform var(--duration-base) ease;
  }

  .trigger-chevron.rotated {
    transform: rotate(180deg);
  }

  /* ── Dropdown panel ──────────────────────
     Same surface as the brand panel and the /workforce overlays (ToolPanel,
     HoverCard, Dropdown): base00, base02 hairline, radius-md, shadow-lg. */
  .dropdown-panel {
    position: absolute;
    top: calc(100% + var(--space-2));
    left: 0;
    z-index: var(--z-popover);
    min-width: 248px;
    max-width: 320px;
    background: var(--color-base00);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  @media (prefers-reduced-motion: no-preference) {
    .dropdown-panel {
      animation: navDropIn 140ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .flyout-list {
      animation: navFlyIn 120ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .navbar-sections {
      animation: navSectionsIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes navDropIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes navFlyIn {
      from { opacity: 0; transform: translateX(-4px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes navSectionsIn {
      from { opacity: 0; transform: translateX(-6px); }
      to { opacity: 1; transform: translateX(0); }
    }
  }

  .dropdown-list,
  .flyout-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    padding: var(--space-2);
    list-style: none;
  }

  .dropdown-row {
    position: relative;
  }

  /* ── Rows: icon, title over a one-line description, chevron when it nests ── */
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-default);
    color: var(--color-base05);
    text-decoration: none;
    transition: background-color var(--duration-fast) var(--ease-default),
                color var(--duration-fast) var(--ease-default);
  }

  .dropdown-item:hover,
  .dropdown-item:focus-visible,
  .dropdown-item.open {
    color: var(--color-base06);
    background-color: var(--color-base01);
    outline: none;
  }

  /* Current page: the account menu's selected row (base01) with the accent
     carried by the icon only. */
  .dropdown-item.active {
    color: var(--color-base07);
    background-color: var(--color-base01);
  }

  .item-icon {
    display: flex;
    flex-shrink: 0;
    color: var(--color-base04);
  }

  .dropdown-item.active .item-icon {
    color: var(--color-base0D);
  }

  .item-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .item-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-dense);
    font-weight: var(--font-weight-medium);
    line-height: 1.3;
  }

  .item-desc {
    font-size: var(--text-xs);
    line-height: 1.3;
    color: var(--color-base04);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-chevron {
    flex-shrink: 0;
    color: var(--color-base04);
  }

  .badge-new {
    padding: 0 4px;
    border-radius: var(--radius-sm);
    background-color: color-mix(in srgb, var(--color-base0B) 18%, transparent);
    color: var(--color-base0B);
    font-size: var(--text-2xs);
    font-weight: var(--font-weight-semibold);
  }

  /* ── Flyout: a nested item's pages, beside its row. The left padding is a
     transparent bridge so the pointer can cross the gap without closing it. */
  .flyout {
    position: absolute;
    top: calc(var(--space-2) * -1 - var(--border-width-thin));
    left: 100%;
    z-index: 1;
    padding-left: var(--space-2);
  }

  .flyout-list {
    min-width: 168px;
    background: var(--color-base00);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  .flyout-link {
    display: block;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-default);
    font-size: var(--text-xs);
    color: var(--color-base05);
    text-decoration: none;
    white-space: nowrap;
    transition: background-color var(--duration-fast) var(--ease-default),
                color var(--duration-fast) var(--ease-default);
  }

  .flyout-link:hover,
  .flyout-link:focus-visible {
    color: var(--color-base06);
    background-color: var(--color-base01);
    outline: none;
  }

  .flyout-link.active {
    color: var(--color-base07);
    font-weight: var(--font-weight-medium);
    background-color: var(--color-base01);
  }

  /* No room beside the panel on a phone: the pages open under their row. */
  @media (max-width: 640px) {
    .flyout {
      position: static;
      padding: 0 0 0 var(--space-6);
    }

    .flyout-list {
      min-width: 0;
      border: none;
      box-shadow: none;
      padding: 0;
    }
  }

  /* ── Phone placement of the sections (opt-in, `phoneSections`) ── */
  @media (max-width: 640px) {
    .navbar[data-phone-sections='hidden'] .navbar-nav-toggle,
    .navbar[data-phone-sections='hidden'] .navbar-sections {
      display: none;
    }

    /* Sticky already positions the bar; only a static one needs relative. */
    .navbar[data-phone-sections='row']:not(.navbar--sticky) {
      position: relative;
    }

    .navbar[data-phone-sections='row'] .navbar-sections {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: var(--z-popover);
      flex-wrap: wrap;
      padding: var(--space-2) var(--space-4);
      background: var(--color-base01);
      border-bottom: var(--border-width-thin) solid var(--color-base02);
    }

    .navbar[data-phone-sections='row'] .dropdown-panel {
      position: fixed;
      left: var(--space-4);
      right: var(--space-4);
      top: calc(var(--navbar-height) + 2.75rem);
      min-width: 0;
      max-width: none;
    }
  }

  /* ── Center slot ────────────────────── */
  .navbar-center {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    justify-content: center;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }


  /* ── Right side actions ──────────────── */
  .navbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-left: auto;
  }

  .navbar :global(.nav-action-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    font-family: inherit;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    line-height: 1.2;
    color: var(--color-base04);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  .navbar :global(.nav-action-btn:hover) {
    color: var(--color-base06);
    background-color: var(--color-base02);
  }

  .navbar :global(.nav-action-btn.primary) {
    color: var(--color-base0D);
  }

  .navbar :global(.nav-action-btn.primary:hover) {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }
</style>
