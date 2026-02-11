<!--
  @component NavBar
  Reusable horizontal mega-menu navigation bar with hover dropdowns.

  The brand item shows the current page context — click does nothing,
  hover reveals a breadcrumb trail + description panel (distinct from
  the section dropdowns which show navigation links).

  @example
  <NavBar
    brand={{ label: 'Wardrobe', description: 'Product catalog & garment library', breadcrumbs: [{label: 'Home', href: '/'}, {label: 'Wardrobe'}] }}
    sections={[
      { id: 'commerce', label: 'Commerce', badge: 'e-commerce', badgeColor: 'blue', items: [
        { title: 'Wardrobe', href: '/wardrobe', desc: 'Product catalog' }
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
  let {
    brand = { label: 'Home', description: '', breadcrumbs: [] },
    sections = [],
    actions,
    renderIcon,
    isActive = () => false
  } = $props();

  let activeDropdown = $state(null);
  let brandHover = $state(false);
  let closeTimer = null;

  function openDropdown(id) {
    clearTimer();
    brandHover = false;
    activeDropdown = id;
  }

  function openBrand() {
    clearTimer();
    activeDropdown = null;
    brandHover = true;
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => {
      activeDropdown = null;
      brandHover = false;
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

<nav class="navbar">
  <div class="navbar-inner">
    <!-- Brand — current page context, hover for breadcrumbs -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="navbar-brand-wrap"
      onmouseenter={openBrand}
      onmouseleave={scheduleClose}
    >
      <span class="navbar-brand" class:open={brandHover}>
        {#if renderIcon && brand.icon}
          {@render renderIcon(brand.icon, 16)}
        {/if}
        <span>{brand.label}</span>
        {#if brand.breadcrumbs?.length || brand.description}
          <svg
            class="brand-chevron"
            class:rotated={brandHover}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"><path d="M6 9l6 6 6-6" /></svg
          >
        {/if}
      </span>

      {#if brandHover && (brand.breadcrumbs?.length || brand.description)}
        <div class="brand-panel">
          {#if brand.breadcrumbs?.length}
            <div class="brand-breadcrumbs">
              {#each brand.breadcrumbs as crumb, i}
                {#if i > 0}
                  <span class="crumb-sep">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6" /></svg>
                  </span>
                {/if}
                {#if crumb.href}
                  <a href={crumb.href} class="crumb-link">{crumb.label}</a>
                {:else}
                  <span class="crumb-current">{crumb.label}</span>
                {/if}
              {/each}
            </div>
          {/if}
          {#if brand.description}
            <p class="brand-desc">{brand.description}</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Section triggers -->
    <div class="navbar-sections">
      {#each sections as section}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="navbar-dropdown"
          onmouseenter={() => openDropdown(section.id)}
          onmouseleave={scheduleClose}
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
              <div class="dropdown-grid">
                {#each section.items as item}
                  <a href={item.href} class="dropdown-card" class:active={isActive(item.href)}>
                    <span class="card-icon">
                      {#if renderIcon}
                        {@render renderIcon(item.icon, 16)}
                      {/if}
                    </span>
                    <span class="card-body">
                      <span class="card-title">
                        {item.title}
                        {#if item.isNew}
                          <span class="badge-new">new</span>
                        {/if}
                      </span>
                      <span class="card-desc">{item.desc}</span>
                    </span>
                  </a>
                {/each}
              </div>
              {#if section.badge}
                <div class="dropdown-footer">
                  <span class="footer-badge" data-color={section.badgeColor}>{section.badge}</span>
                  <span class="footer-count">{section.items.length} items</span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

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
    position: sticky;
    top: 0;
    z-index: var(--z-fixed);
  }

  .navbar-inner {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0 var(--space-4);
    height: var(--space-11); /* 44px */
  }

  /* ── Brand ───────────────────────────── */
  .navbar-brand-wrap {
    position: relative;
    margin-right: var(--space-2);
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    padding: var(--space-1-5) var(--space-2-5);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
    color: var(--color-base05);
    white-space: nowrap;
    cursor: default;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  .navbar-brand:hover,
  .navbar-brand.open {
    color: var(--color-base07);
    background-color: color-mix(in srgb, var(--color-base0D) 8%, transparent);
  }

  .brand-chevron {
    opacity: 0.5;
    transition: transform 180ms ease;
  }

  .brand-chevron.rotated {
    transform: rotate(180deg);
  }

  /* ── Brand hover panel — breadcrumbs + description ── */
  .brand-panel {
    position: absolute;
    top: calc(100% + var(--space-2));
    left: 0;
    min-width: 280px;
    max-width: 400px;
    background: var(--color-base01);
    border: var(--border-width-thin) solid var(--color-base03);
    border-radius: var(--radius-xl);
    box-shadow: 0 20px 40px color-mix(in srgb, var(--color-base00) 50%, transparent),
                0 2px 8px color-mix(in srgb, var(--color-base00) 25%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: var(--space-4);
    animation: navDropIn 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .brand-breadcrumbs {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-wrap: wrap;
    margin-bottom: var(--space-2-5);
  }

  .crumb-sep {
    display: flex;
    align-items: center;
    color: var(--color-base03);
  }

  .crumb-link {
    font-size: var(--text-xs);
    color: var(--color-base04);
    text-decoration: none;
    padding: var(--space-0-5) var(--space-1-5);
    border-radius: var(--radius-default);
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  .crumb-link:hover {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 8%, transparent);
  }

  .crumb-current {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-base06);
    padding: var(--space-0-5) var(--space-1-5);
  }

  .brand-desc {
    font-size: var(--text-xs);
    line-height: 1.5;
    color: var(--color-base04);
    margin: 0;
  }

  /* ── Section triggers row ────────────── */
  .navbar-sections {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
  }

  .navbar-dropdown {
    position: relative;
  }

  .navbar-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1-5) var(--space-2-5);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-base04);
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
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
    transition: transform 180ms ease;
  }

  .trigger-chevron.rotated {
    transform: rotate(180deg);
  }

  /* ── Dropdown panel ──────────────────── */
  .dropdown-panel {
    position: absolute;
    top: calc(100% + var(--space-2));
    left: 0;
    min-width: 380px;
    max-width: 460px;
    background: var(--color-base01);
    border: var(--border-width-thin) solid var(--color-base03);
    border-radius: var(--radius-xl);
    box-shadow: 0 20px 40px color-mix(in srgb, var(--color-base00) 50%, transparent),
                0 2px 8px color-mix(in srgb, var(--color-base00) 25%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    animation: navDropIn 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes navDropIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-grid {
    display: flex;
    flex-direction: column;
    padding: var(--space-2);
    gap: 2px;
  }

  /* ── Card items ──────────────────────── */
  .dropdown-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2-5);
    padding: var(--space-2) var(--space-2-5);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: background-color var(--duration-100) var(--ease-default);
  }

  .dropdown-card:hover {
    background-color: color-mix(in srgb, var(--color-base02) 60%, transparent);
  }

  .dropdown-card.active {
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--space-8);
    height: var(--space-8);
    flex-shrink: 0;
    border-radius: var(--radius-md);
    background-color: var(--color-base02);
    color: var(--color-base05);
    transition: color var(--duration-100) var(--ease-default),
                background-color var(--duration-100) var(--ease-default);
  }

  .dropdown-card:hover .card-icon {
    background-color: color-mix(in srgb, var(--color-base03) 60%, transparent);
    color: var(--color-base06);
  }

  .dropdown-card.active .card-icon {
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    color: var(--color-base0D);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    padding-top: 2px;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-base06);
  }

  .dropdown-card.active .card-title {
    color: var(--color-base0D);
  }

  .card-desc {
    font-size: 0.6875rem;
    color: var(--color-base04);
    line-height: 1.4;
  }

  .badge-new {
    font-size: 9px;
    padding: 1px 5px;
    border-radius: var(--radius-sm);
    background-color: color-mix(in srgb, var(--color-base0B) 18%, transparent);
    color: var(--color-base0B);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  /* ── Dropdown footer ─────────────────── */
  .dropdown-footer {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-top: var(--border-width-thin) solid var(--color-base02);
    background-color: color-mix(in srgb, var(--color-base02) 30%, transparent);
  }

  .footer-badge {
    font-size: 9px;
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .footer-badge[data-color='blue'] {
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    color: var(--color-base0D);
  }

  .footer-badge[data-color='green'] {
    background-color: color-mix(in srgb, var(--color-base0B) 15%, transparent);
    color: var(--color-base0B);
  }

  .footer-badge[data-color='yellow'] {
    background-color: color-mix(in srgb, var(--color-base0A) 15%, transparent);
    color: var(--color-base0A);
  }

  .footer-badge[data-color='purple'] {
    background-color: color-mix(in srgb, var(--color-base0E) 15%, transparent);
    color: var(--color-base0E);
  }

  .footer-badge[data-color='red'] {
    background-color: color-mix(in srgb, var(--color-base08) 15%, transparent);
    color: var(--color-base08);
  }

  .footer-count {
    font-size: 0.6875rem;
    color: var(--color-base04);
  }

  /* ── Right side actions ──────────────── */
  .navbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    margin-left: auto;
  }

  .navbar :global(.nav-action-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    padding: 5px var(--space-2);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    font-family: inherit;
    font-size: var(--text-xs);
    font-weight: 500;
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
