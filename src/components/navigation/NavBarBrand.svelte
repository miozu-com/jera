<!-- file-size: justified -- one control: the brand trigger and the context panel it discloses share open state, keyboard handling and one set of styles -->
<!--
  @component NavBarBrand

  The NavBar's current-page context control: label + icon, and an optional
  panel that tells you where you are and where you can go from here. Every
  section is data, rendered only when it has something in it:

    breadcrumbs  the route trail; every crumb but the last is a link
    description  one line, only when it says something the label does not
    info         dense facts about this page (numbers, not sentences)
    links        the sibling pages of the current area, the current one marked
    actions      1 to 3 page actions (extra entries are dropped)

  Opens on click/tap, Enter or Space only. There is no hover-open: a panel
  that carries links and actions must not open by accident when the cursor
  crosses the top bar. ArrowDown on the trigger opens it and moves focus in;
  ArrowUp/ArrowDown/Home/End rove between the panel's links and buttons;
  Escape and a pointerdown outside close it. Following a link closes it.

  Pass `onBrandClick` to take over the tap entirely (e.g. open a workspace
  switcher on phones): the context panel is then never shown, so on such a
  consumer the panel is a desktop/tablet surface.

  Props:
    brand        - {icon, label, badge?, badgeColor?, description?,
                    breadcrumbs?: [{label, href?, icon?}],
                    info?: [{label, value, href?, tone?: 'default'|'warning'|'success'}],
                    links?: [{id, label, href, icon?, active?, badge?, badgeLabel?}],
                    linksLabel?: string (default 'In this area'),
                    actions?: [{id, label, href?, onclick?, icon?, variant?: 'primary'|'ghost'}]}
                   badge/badgeColor render a status chip after the label.
    onBrandClick - Optional: called on tap/click instead of opening the panel
    renderIcon   - Snippet: (name, size) => renders an icon component
    panelHeader  - Snippet: custom content at the top of the panel
    panelFooter  - Snippet: custom content at the bottom of the panel
    open         - Bindable: whether the context panel is showing
    onopen       - Called when the panel opens, so the parent can close its own menus
-->
<script>
  import { tick } from 'svelte';
  import Badge from '../primitives/Badge.svelte';
  import Button from '../primitives/Button.svelte';
  import { badgeVariant } from '../../utils/badge.js';

  let {
    brand = { label: 'Home', description: '', breadcrumbs: [] },
    onBrandClick = null,
    renderIcon,
    panelHeader,
    panelFooter,
    open = $bindable(false),
    onopen = () => {}
  } = $props();

  // Same color map as LeftBarItem. A brand badge is always a status marker,
  // so no color falls back to 'warning' rather than LeftBarItem's 'info'.
  const variant = $derived(badgeVariant(brand.badgeColor, 'warning'));

  const panelId = `brand-panel-${crypto.randomUUID()}`;

  let wrapEl = $state(null);
  let triggerEl = $state(null);
  let panelEl = $state(null);

  const crumbs = $derived(Array.isArray(brand.breadcrumbs) ? brand.breadcrumbs : []);
  const info = $derived(
    (Array.isArray(brand.info) ? brand.info : []).filter(
      (row) => row && row.value !== null && row.value !== undefined && row.value !== ''
    )
  );
  const links = $derived(Array.isArray(brand.links) ? brand.links : []);
  const actions = $derived((Array.isArray(brand.actions) ? brand.actions : []).slice(0, 3));

  // The brand only earns a chevron, and interactivity, when there is a panel
  // to reveal or when the consumer has claimed the tap via onBrandClick. A
  // lone current crumb restates the label, so it does not count.
  const hasPanel = $derived(
    !!(
      crumbs.length > 1 ||
      brand.description ||
      info.length ||
      links.length ||
      actions.length ||
      panelHeader ||
      panelFooter
    )
  );
  const interactive = $derived(!!onBrandClick || hasPanel);
  const showPanel = $derived(open && hasPanel && !onBrandClick);

  function focusables() {
    if (!panelEl) return [];
    return [...panelEl.querySelectorAll('a[href], button:not([disabled])')];
  }

  async function focusFirst() {
    await tick();
    focusables()[0]?.focus();
  }

  function setOpen(next) {
    open = next;
    if (next) onopen();
  }

  function handleClick() {
    // Consumer owns the tap: hand it over and never show the context panel.
    if (onBrandClick) {
      open = false;
      onBrandClick();
      return;
    }
    setOpen(!open);
  }

  function handleTriggerKeydown(e) {
    if (onBrandClick || !hasPanel) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      focusFirst();
    }
  }

  function handlePanelKeydown(e) {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const items = focusables();
    if (!items.length) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    let next = 0;
    if (e.key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % items.length;
    else if (e.key === 'ArrowUp') next = i <= 0 ? items.length - 1 : i - 1;
    else if (e.key === 'End') next = items.length - 1;
    items[next].focus();
  }

  // A followed link is a navigation: the panel has done its job.
  function handlePanelClick(e) {
    if (e.target instanceof Element && e.target.closest('a[href]')) open = false;
  }

  function runAction(action) {
    open = false;
    action.onclick?.();
  }

  // Escape and a tap elsewhere close the panel. Only listens while it is
  // open, and tears down on close.
  $effect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapEl && !wrapEl.contains(e.target)) open = false;
    };
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      const inside = wrapEl?.contains(document.activeElement);
      open = false;
      if (inside) triggerEl?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

{#snippet inner()}
  {#if renderIcon && brand.icon}
    {@render renderIcon(brand.icon, 16)}
  {/if}
  <span class="brand-label">{brand.label}</span>
  {#if brand.badge}
    <Badge size="xs" {variant}>{brand.badge}</Badge>
  {/if}
  {#if interactive}
    <svg
      class="brand-chevron"
      class:rotated={open}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg
    >
  {/if}
{/snippet}

<div bind:this={wrapEl} class="navbar-brand-wrap">
  {#if interactive}
    <button
      bind:this={triggerEl}
      type="button"
      class="navbar-brand"
      class:open
      onclick={handleClick}
      onkeydown={handleTriggerKeydown}
      aria-expanded={onBrandClick ? undefined : open}
      aria-controls={onBrandClick || !showPanel ? undefined : panelId}
    >
      {@render inner()}
    </button>
  {:else}
    <span class="navbar-brand">{@render inner()}</span>
  {/if}

  {#if showPanel}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
    <nav
      bind:this={panelEl}
      id={panelId}
      class="brand-panel"
      aria-label="Page context"
      onkeydown={handlePanelKeydown}
      onclick={handlePanelClick}
    >
      {#if panelHeader}{@render panelHeader()}{/if}

      {#if crumbs.length > 1}
        <ol class="brand-breadcrumbs">
          {#each crumbs as crumb, i (i)}
            <li class="crumb">
              {#if i > 0}
                <svg class="crumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
              {/if}
              {#if crumb.href && i < crumbs.length - 1}
                <a href={crumb.href} class="crumb-link">{crumb.label}</a>
              {:else}
                <span class="crumb-current" aria-current="page">{crumb.label}</span>
              {/if}
            </li>
          {/each}
        </ol>
      {/if}

      {#if brand.description}
        <p class="brand-desc">{brand.description}</p>
      {/if}

      {#if info.length}
        <dl class="brand-info">
          {#each info as row, i (row.label ?? i)}
            <div class="info-cell" data-tone={row.tone ?? 'default'}>
              <dt class="info-label">{row.label}</dt>
              <dd class="info-value">
                {#if row.href}
                  <a href={row.href} class="info-link">{row.value}</a>
                {:else}
                  {row.value}
                {/if}
              </dd>
            </div>
          {/each}
        </dl>
      {/if}

      {#if links.length}
        <div class="brand-links">
          <p class="links-label">{brand.linksLabel || 'In this area'}</p>
          <ul class="links-list">
            {#each links as link (link.id ?? link.href)}
              <li>
                <a
                  href={link.href}
                  class="panel-link"
                  class:active={link.active}
                  aria-current={link.active ? 'page' : undefined}
                >
                  {#if renderIcon && link.icon}
                    <span class="link-icon">{@render renderIcon(link.icon, 14)}</span>
                  {/if}
                  <span class="link-label">{link.label}</span>
                  {#if link.badge}
                    <Badge
                      size="xs"
                      variant={link.badgeVariant ?? 'default'}
                      title={link.badgeLabel}
                      aria-label={link.badgeLabel}
                    >{link.badge}</Badge>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if actions.length}
        <div class="brand-actions">
          {#each actions as action (action.id ?? action.label)}
            {#if action.href}
              <Button size="xs" variant={action.variant ?? 'ghost'} href={action.href}>
                {#if renderIcon && action.icon}{@render renderIcon(action.icon, 12)}{/if}
                {action.label}
              </Button>
            {:else}
              <Button size="xs" variant={action.variant ?? 'ghost'} onclick={() => runAction(action)}>
                {#if renderIcon && action.icon}{@render renderIcon(action.icon, 12)}{/if}
                {action.label}
              </Button>
            {/if}
          {/each}
        </div>
      {/if}

      {#if panelFooter}{@render panelFooter()}{/if}
    </nav>
  {/if}
</div>

<style>
  .navbar-brand-wrap {
    position: relative;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-sm);
    line-height: 1.2;
    color: var(--color-base05);
    white-space: nowrap;
    cursor: default;
    /* Reset native button chrome: the brand is styled entirely by the rules
       above whether it renders as a <button> or a <span>. */
    appearance: none;
    background: none;
    border: none;
    margin: 0;
    font-family: inherit;
    text-align: left;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  button.navbar-brand {
    cursor: pointer;
  }

  button.navbar-brand:focus-visible {
    outline: var(--border-width-default) solid var(--color-base0D);
    outline-offset: 2px;
  }

  /* Only the interactive brand gets hover feedback: a plain label lighting up
     under the cursor is a false affordance. */
  button.navbar-brand:hover,
  .navbar-brand.open {
    color: var(--color-base07);
    background-color: color-mix(in srgb, var(--color-base0D) 8%, transparent);
  }

  /* Touch pointers and narrow viewports: meet the 44px minimum tap target. */
  @media (pointer: coarse), (max-width: 768px) {
    button.navbar-brand {
      min-height: var(--space-22); /* 44px */
    }
  }

  /* Phone: a long label (an agent's name) truncates instead of pushing the
     bar's actions off screen. */
  @media (max-width: 640px) {
    .navbar-brand-wrap {
      min-width: 0;
    }

    .navbar-brand {
      min-width: 0;
      max-width: 11rem;
    }

    .brand-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .brand-chevron {
      flex-shrink: 0;
    }
  }

  .brand-chevron {
    opacity: 0.5;
    transition: transform var(--duration-base) ease;
  }

  .brand-chevron.rotated {
    transform: rotate(180deg);
  }

  /* ── Context panel ── */
  .brand-panel {
    position: absolute;
    top: calc(100% + var(--space-4));
    left: 0;
    z-index: var(--z-popover);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    width: max-content;
    min-width: 300px;
    max-width: 380px;
    background: var(--color-base01);
    border: var(--border-width-thin) solid var(--color-base03);
    border-radius: var(--radius-xl);
    box-shadow: 0 20px 40px color-mix(in srgb, var(--color-base00) 50%, transparent),
                0 2px 8px color-mix(in srgb, var(--color-base00) 25%, transparent);
    padding: var(--space-6);
  }

  /* A 300px min-width anchored 16px from the left overflows a 390px screen. */
  @media (max-width: 480px) {
    .brand-panel {
      min-width: 0;
      max-width: calc(100vw - var(--space-8) * 2);
    }
  }

  .brand-breadcrumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .crumb {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
  }

  .crumb-sep {
    flex-shrink: 0;
    color: var(--color-base03);
  }

  .crumb-link,
  .crumb-current {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-default);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 14rem;
  }

  .crumb-link {
    color: var(--color-base04);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  .crumb-link:hover,
  .crumb-link:focus-visible {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 8%, transparent);
    outline: none;
  }

  .crumb-current {
    font-weight: var(--font-weight-semibold);
    color: var(--color-base07);
  }

  .brand-desc {
    font-size: var(--text-xs);
    line-height: 1.5;
    color: var(--color-base04);
    margin: 0;
  }

  /* ── Info: two dense columns of label over value ── */
  .brand-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4) var(--space-6);
    margin: 0;
  }

  .info-cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .info-label {
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .info-value {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
    font-variant-numeric: tabular-nums;
    color: var(--color-base07);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .info-cell[data-tone='warning'] .info-value {
    color: var(--color-base0A);
  }

  .info-cell[data-tone='success'] .info-value {
    color: var(--color-base0B);
  }

  .info-link {
    color: inherit;
    text-decoration: none;
  }

  .info-link:hover,
  .info-link:focus-visible {
    color: var(--color-base0D);
    outline: none;
  }

  /* ── Links: the area's sibling pages ── */
  .brand-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .links-label {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .links-list {
    display: flex;
    flex-direction: column;
    margin: 0 calc(var(--space-3) * -1);
    padding: 0;
    list-style: none;
  }

  .panel-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-default);
    font-size: var(--text-sm);
    color: var(--color-base05);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-default),
                background-color var(--duration-fast) var(--ease-default);
  }

  .panel-link:hover,
  .panel-link:focus-visible {
    color: var(--color-base07);
    background-color: var(--color-base02);
    outline: none;
  }

  .panel-link.active {
    color: var(--color-base0D);
    font-weight: var(--font-weight-semibold);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .link-icon {
    display: flex;
    flex-shrink: 0;
    color: var(--color-base04);
  }

  .panel-link.active .link-icon {
    color: inherit;
  }

  .link-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Actions ── */
  .brand-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding-top: var(--space-4);
    border-top: var(--border-width-thin) solid var(--color-base02);
  }

  /* Entrance animation: matches the navbar's dropdown panels. Compositor-only
     properties, finite iteration count. */
  @media (prefers-reduced-motion: no-preference) {
    .brand-panel {
      transition: opacity 160ms cubic-bezier(0.16, 1, 0.3, 1),
                  transform 160ms cubic-bezier(0.16, 1, 0.3, 1);

      @starting-style {
        opacity: 0;
        transform: translateY(-6px);
      }
    }
  }
</style>
