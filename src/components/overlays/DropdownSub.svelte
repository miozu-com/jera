<!--
  @component DropdownSub

  A cascading submenu inside a Dropdown: a menu item that opens a nested
  `role="menu"` to its side ("Views ▸", "Sort ▸", "Move to ▸").

  Keyboard (WAI-ARIA APG menu): ArrowRight, Enter or Space on the item opens
  the submenu and focuses its first item; ArrowLeft or Escape inside it closes
  it and returns focus to the item. ArrowUp/ArrowDown/Home/End move within the
  submenu (handled by the parent Dropdown, scoped to the focused menu). Tab
  closes the whole Dropdown.

  Pointer: hover opens after `openDelay` (150ms). Leaving the item starts a
  safe triangle toward the submenu: while the pointer moves inside it the
  submenu stays open and siblings it crosses do not open; leaving the
  triangle closes it at once, resting for `closeDelay` (300ms) closes it too.
  A transparent bridge covers the gap to the submenu. Touch taps toggle.

  Placement: to the right of the item, flipped to the left when there is not
  room before the viewport edge, and shifted up when it would run off the
  bottom. The submenu is absolutely positioned inside the Dropdown panel, so
  a consumer must not give `.dropdown-content` `overflow` (it would clip it).

  `...rest` goes on the trigger item (the `role="menuitem"` button), like
  DropdownItem.

  @example
  <Dropdown>
    {#snippet trigger()}<Button>View</Button>{/snippet}
    <DropdownSub label="Views">
      <DropdownItem checked={view === 'grid'} onclick={() => (view = 'grid')}>Grid</DropdownItem>
      <DropdownItem checked={view === 'rows'} onclick={() => (view = 'rows')}>Rows</DropdownItem>
    </DropdownSub>
    <DropdownDivider />
    <DropdownItem onclick={exportCsv}>Export CSV</DropdownItem>
  </Dropdown>
-->
<script module>
  /**
   * The submenu the pointer is heading for, shared by every DropdownSub (one
   * pointer, so one aim at a time). While it is set, a sibling the pointer
   * crosses does not open, so a diagonal move to an open submenu is not
   * hijacked by the item under its path.
   * @type {{ owner: symbol } | null}
   */
  let aim = null;

  /** Point-in-triangle by edge signs (inclusive). */
  function inTriangle(px, py, [ax, ay], [bx, by], [cx, cy]) {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const neg = d1 < 0 || d2 < 0 || d3 < 0;
    const pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  }
</script>

<script>
  import { tick } from 'svelte';
  import { cn } from '../../utils/cn.svelte.js';

  let {
    label,
    icon,
    meta,
    disabled = false,
    openDelay = 150,
    closeDelay = 300,
    children,
    class: className = '',
    ...rest
  } = $props();

  const uid = Math.random().toString(36).slice(2, 9);
  const triggerId = `dropdown-sub-trigger-${uid}`;
  const menuId = `dropdown-sub-menu-${uid}`;

  const ITEM_SELECTOR = ['menuitem', 'menuitemradio', 'menuitemcheckbox']
    .map(role => `[role="${role}"]:not([disabled])`)
    .join(', ');

  let open = $state(false);
  let side = $state('right');
  let shift = $state(0);
  let placed = $state(false);
  let triggerEl = $state(null);
  let menuEl = $state(null);

  // Plain (non-reactive) bookkeeping.
  let openTimer = 0;
  let closeTimer = 0;
  let focusOnOpen = false;
  let lastPointerType = 'mouse';
  const self = Symbol('DropdownSub');
  let aimMove = null;

  // Safe triangle: from where the pointer left the item to the submenu's near
  // edge. Moving inside it keeps the submenu open (each move restarts the
  // closeDelay grace, so only a rest closes it); moving out closes it at once.
  function startAim(x, y) {
    stopAim();
    if (!menuEl) return;
    const m = menuEl.getBoundingClientRect();
    const toRight = side === 'right';
    const nearX = toRight ? m.left : m.right;
    const back = toRight ? -4 : 4; // apex a little behind the exit point
    const apex = [x + back, y];
    const top = [nearX, m.top - 4];
    const bottom = [nearX, m.bottom + 4];
    aim = { owner: self };
    aimMove = e => {
      if (!inTriangle(e.clientX, e.clientY, apex, top, bottom)) return hide();
      // Still heading there: restart the grace, so only a rest closes it.
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        closeTimer = 0;
        hide();
      }, closeDelay);
    };
    document.addEventListener('pointermove', aimMove, { passive: true });
  }

  function stopAim() {
    if (aimMove) document.removeEventListener('pointermove', aimMove);
    aimMove = null;
    if (aim?.owner === self) aim = null;
  }

  function clearTimers() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    openTimer = 0;
    closeTimer = 0;
  }

  // Unmount (the parent Dropdown closing) must not leave a timer or a
  // document listener behind.
  $effect(() => () => {
    clearTimers();
    stopAim();
  });

  /** Enabled items that belong to this submenu, not to a deeper one. */
  function ownItems() {
    if (!menuEl) return [];
    return Array.from(menuEl.querySelectorAll(ITEM_SELECTOR)).filter(
      el => el.closest('[role="menu"]') === menuEl
    );
  }

  function focusFirst() {
    (ownItems()[0] ?? menuEl)?.focus();
  }

  function show(withFocus = false) {
    if (disabled) return;
    clearTimers();
    if (open && placed) {
      if (withFocus) focusFirst();
      return;
    }
    focusOnOpen = focusOnOpen || withFocus;
    open = true;
  }

  function hide(returnFocus = false) {
    clearTimers();
    stopAim();
    if (!open) return;
    const hadFocus = !!menuEl?.contains(document.activeElement);
    open = false;
    placed = false;
    focusOnOpen = false;
    if (returnFocus || hadFocus) triggerEl?.focus();
  }

  // Measure once the submenu is in the DOM, then flip / shift it into view.
  $effect(() => {
    if (!open || !menuEl || !triggerEl) return;
    placed = false;
    side = 'right';
    shift = 0;
    const frame = requestAnimationFrame(() => {
      const edge = 8;
      const t = triggerEl.getBoundingClientRect();
      const m = menuEl.getBoundingClientRect();
      const roomRight = window.innerWidth - t.right - edge;
      const roomLeft = t.left - edge;
      side = m.width > roomRight && roomLeft > roomRight ? 'left' : 'right';

      let s = 0;
      const overflow = m.bottom - (window.innerHeight - edge);
      if (overflow > 0) s = -overflow;
      if (m.top + s < edge) s = edge - m.top;
      shift = s;
      placed = true;

      if (focusOnOpen) {
        focusOnOpen = false;
        tick().then(focusFirst);
      }
    });
    return () => cancelAnimationFrame(frame);
  });

  function handleTriggerKeydown(e) {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      show(true);
    } else if (e.key === 'Escape' && open) {
      // Close just this submenu; a second Escape reaches the Dropdown.
      e.preventDefault();
      e.stopPropagation();
      hide(true);
    }
  }

  function handleMenuKeydown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hide(true);
    }
  }

  function handleTriggerClick() {
    if (disabled) return;
    // Touch has no hover, so a tap toggles; a mouse click only opens (the
    // hover may already have opened it, and closing it then is surprising).
    if (open && lastPointerType === 'touch') hide();
    else show();
  }

  function armOpen() {
    openTimer = setTimeout(() => {
      openTimer = 0;
      // The pointer is crossing this item on its way to a sibling's submenu:
      // wait; open once that aim ends (it lands, or leaves the triangle).
      if (aim && aim.owner !== self) armOpen();
      else open = true;
    }, openDelay);
  }

  function handlePointerEnter(e) {
    if (e.pointerType === 'touch' || disabled) return;
    clearTimeout(closeTimer);
    closeTimer = 0;
    stopAim();
    if (open || openTimer) return;
    armOpen();
  }

  function handlePointerLeave(e) {
    if (e.pointerType === 'touch') return;
    clearTimeout(openTimer);
    openTimer = 0;
    if (!open) return;
    clearTimeout(closeTimer);
    startAim(e.clientX, e.clientY);
    closeTimer = setTimeout(() => {
      closeTimer = 0;
      hide();
    }, closeDelay);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dropdown-sub"
  role="none"
  onpointerenter={handlePointerEnter}
  onpointerleave={handlePointerLeave}
>
  <button
    bind:this={triggerEl}
    id={triggerId}
    type="button"
    role="menuitem"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={open ? menuId : undefined}
    class={cn(
      'dropdown-sub-trigger',
      open && 'dropdown-sub-trigger-open',
      disabled && 'dropdown-sub-trigger-disabled',
      className
    )}
    {disabled}
    tabindex={disabled ? -1 : 0}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeydown}
    onpointerdown={e => (lastPointerType = e.pointerType)}
    {...rest}
  >
    {#if icon}
      <span class="dropdown-sub-icon">{@render icon()}</span>
    {/if}
    <span class="dropdown-sub-label">
      {#if typeof label === 'function'}{@render label()}{:else}{label}{/if}
    </span>
    {#if meta}
      <span class="dropdown-sub-meta">
        {#if typeof meta === 'function'}{@render meta()}{:else}{meta}{/if}
      </span>
    {/if}
    <svg
      class="dropdown-sub-chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  </button>

  {#if open}
    <div
      bind:this={menuEl}
      id={menuId}
      class="dropdown-submenu"
      class:dropdown-submenu-placed={placed}
      data-side={side}
      style="--dropdown-sub-shift: {shift}px"
      role="menu"
      tabindex="-1"
      aria-labelledby={triggerId}
      onkeydown={handleMenuKeydown}
    >
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .dropdown-sub {
    position: relative;
  }

  /* Same box as DropdownItem so a submenu row lines up with its siblings. */
  .dropdown-sub-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    padding: var(--space-3, 0.375rem) var(--space-4);
    font-size: var(--text-sm);
    text-align: left;
    color: var(--color-base05);
    background: transparent;
    border: none;
    border-radius: var(--radius-default);
    cursor: pointer;
    transition: var(--transition-colors);
    outline: none;
  }

  .dropdown-sub-trigger:hover:not(:disabled),
  .dropdown-sub-trigger:focus-visible:not(:disabled),
  .dropdown-sub-trigger-open:not(:disabled) {
    background: color-mix(in srgb, var(--color-base02) 60%, transparent);
    color: var(--color-base06);
  }

  .dropdown-sub-trigger-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dropdown-sub-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .dropdown-sub-label {
    flex: 1;
  }

  .dropdown-sub-meta {
    flex-shrink: 0;
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color-base04);
  }

  .dropdown-sub-chevron {
    flex-shrink: 0;
    margin-right: calc(var(--space-2) * -1);
    color: var(--color-base04);
  }

  .dropdown-submenu {
    position: absolute;
    z-index: 1;
    /* Align the first submenu item with the trigger row (offset the padding). */
    top: calc(var(--space-2) * -1 + var(--dropdown-sub-shift, 0px));
    left: calc(100% + var(--space-2));
    min-width: 8rem;
    padding: var(--space-2);
    background: var(--color-base01);
    border: var(--border-width-thin) solid color-mix(in srgb, var(--color-base03) 50%, transparent);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    outline: none;
    /* Hidden until measured, but still focusable (opacity, not visibility). */
    opacity: 0;
    pointer-events: none;
  }

  .dropdown-submenu[data-side='left'] {
    left: auto;
    right: calc(100% + var(--space-2));
  }

  .dropdown-submenu-placed {
    opacity: 1;
    pointer-events: auto;
  }

  /* Pointer bridge over the gap to the trigger: part of the submenu, so the
     pointer never "leaves" the DropdownSub while crossing it. */
  .dropdown-submenu::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 100%;
    width: calc(var(--space-2) + var(--border-width-thin));
  }

  .dropdown-submenu[data-side='left']::before {
    right: auto;
    left: 100%;
  }

  .dropdown-submenu:focus-visible {
    box-shadow: var(--shadow-lg), var(--focus-ring-shadow);
  }

  @media (prefers-reduced-motion: no-preference) {
    .dropdown-submenu {
      transition: opacity 0.1s var(--ease-out);
    }
  }
</style>
