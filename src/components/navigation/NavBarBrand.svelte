<!--
  @component NavBarBrand

  The NavBar's current-page-context control: label + icon, and an optional panel
  showing a breadcrumb trail and description.

  Opens on hover for mouse users and on click/tap for everyone, so it is reachable
  on touch. Pass `onBrandClick` to take over the tap entirely (e.g. open a
  workspace switcher on mobile) — the context panel is then never shown.

  Extracted from NavBar so the brand's interaction logic, markup, and styles live
  together instead of bloating the navbar shell.

  Props:
    brand        - {icon, label, description, breadcrumbs}
    onBrandClick - Optional: called on tap/click instead of opening the panel
    renderIcon   - Snippet: (name, size) => renders an icon component
    open         - Bindable: whether the context panel is showing
    onopen       - Called when the panel opens, so the parent can close its own menus
-->
<script>
  let {
    brand = { label: 'Home', description: '', breadcrumbs: [] },
    onBrandClick = null,
    renderIcon,
    open = $bindable(false),
    onopen = () => {}
  } = $props();

  let wrapEl = $state(null);
  let closeTimer = null;

  // The brand only earns a chevron — and interactivity — when there is a panel
  // to reveal, or when the consumer has claimed the tap via onBrandClick.
  // Otherwise it stays a plain, non-focusable label with no false affordance.
  const hasPanel = $derived(!!(brand.breadcrumbs?.length || brand.description));
  const interactive = $derived(!!onBrandClick || hasPanel);
  const showPanel = $derived(open && hasPanel && !onBrandClick);

  function clearTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  // Hover-open is restricted to an actual mouse. Touch browsers fire a synthetic
  // mouseenter just before click; left ungated, that enter opens the panel and
  // the click immediately toggles it shut, so a tap appears to do nothing — the
  // sticky-hover dead tap. Keyed off pointerType rather than a (hover: hover)
  // media query because headless and some embedded browsers report no pointer
  // capability at all, which would silently kill hover for real mouse users.
  function isMousePointer(e) {
    return !e?.pointerType || e.pointerType === 'mouse';
  }

  function handleEnter(e) {
    if (!isMousePointer(e)) return;
    clearTimer();
    open = true;
    onopen();
  }

  function handleLeave(e) {
    if (!isMousePointer(e)) return;
    closeTimer = setTimeout(() => (open = false), 120);
  }

  function handleClick() {
    // Consumer owns the tap — hand it over and never show the context panel.
    if (onBrandClick) {
      open = false;
      onBrandClick();
      return;
    }
    clearTimer();
    open = !open;
    if (open) onopen();
  }

  // A click-opened panel needs a tap-elsewhere escape hatch: hover panels close
  // on mouseleave, but a touch user never generates one. Only listens while the
  // panel is actually open, and tears down on close.
  $effect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapEl && !wrapEl.contains(e.target)) open = false;
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') open = false;
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  // Never let a pending close timer outlive the component.
  $effect(() => () => clearTimer());
</script>

{#snippet inner()}
  {#if renderIcon && brand.icon}
    {@render renderIcon(brand.icon, 16)}
  {/if}
  <span>{brand.label}</span>
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={wrapEl}
  class="navbar-brand-wrap"
  onpointerenter={handleEnter}
  onpointerleave={handleLeave}
>
  {#if interactive}
    <button
      type="button"
      class="navbar-brand"
      class:open
      onclick={handleClick}
      aria-haspopup={onBrandClick ? undefined : 'true'}
      aria-expanded={onBrandClick ? undefined : open}
    >
      {@render inner()}
    </button>
  {:else}
    <span class="navbar-brand">{@render inner()}</span>
  {/if}

  {#if showPanel}
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
    font-weight: 600;
    font-size: var(--text-sm);
    line-height: 1.2;
    color: var(--color-base05);
    white-space: nowrap;
    cursor: default;
    /* Reset native button chrome — the brand is styled entirely by the rules
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

  /* Only the interactive brand gets hover feedback — a plain label lighting up
     under the cursor is the same false affordance as the bare chevron was. */
  button.navbar-brand:hover,
  .navbar-brand.open {
    color: var(--color-base07);
    background-color: color-mix(in srgb, var(--color-base0D) 8%, transparent);
  }

  /* Touch pointers and narrow viewports: meet the 44px minimum tap target. The
     navbar row is already 44px tall, so this grows the hit area without changing
     the bar's height. Width is included as a second signal because a few
     browsers misreport pointer capability. */
  @media (pointer: coarse), (max-width: 768px) {
    button.navbar-brand {
      min-height: var(--space-22); /* 44px */
    }
  }

  .brand-chevron {
    opacity: 0.5;
    transition: transform var(--duration-base) ease;
  }

  .brand-chevron.rotated {
    transform: rotate(180deg);
  }

  /* ── Context panel — breadcrumbs + description ── */
  .brand-panel {
    position: absolute;
    top: calc(100% + var(--space-4));
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
    padding: var(--space-8);
  }

  /* Now that the panel opens on tap, it has to fit a phone. 280px of min-width
     anchored 16px from the left overflows the right edge on a 390px screen. */
  @media (max-width: 480px) {
    .brand-panel {
      min-width: 0;
      width: max-content;
      /* Panel is anchored at the navbar's 16px left gutter — leave the same
         gutter on the right so it never runs off the edge. */
      max-width: calc(100vw - var(--space-8) * 2);
    }
  }

  .brand-breadcrumbs {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-bottom: var(--space-5);
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
    padding: var(--space-1) var(--space-3);
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
    padding: var(--space-1) var(--space-3);
  }

  .brand-desc {
    font-size: var(--text-xs);
    line-height: 1.5;
    color: var(--color-base04);
    margin: 0;
  }

  /* Entrance animation — matches the navbar's dropdown panels. Compositor-only
     properties, finite iteration count. Keyframes are redeclared here because
     Svelte scopes keyframe names per component. */
  @media (prefers-reduced-motion: no-preference) {
    .brand-panel {
      animation: brandPanelIn 160ms cubic-bezier(0.16, 1, 0.3, 1);

      @starting-style {
        opacity: 0;
        transform: translateY(-6px);
      }
    }

    @keyframes brandPanelIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
</style>
