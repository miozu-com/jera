<!--
  @component ToolPanel

  A toolbar button that opens a small non-modal form panel under it: filters,
  columns, refine, "more" actions. One engine, three faces.

  Engine: the native Popover API (`popover="auto"`): true top layer, the
  browser's auto-popover stack, light dismiss, Escape, and focus back to the
  button for free. Focus is never trapped; on open it moves to the panel's
  first control, or to the panel itself when it holds none (a text-only tip). Placed with CSS anchor positioning where supported, else from
  the button's rectangle when it opens (and on resize/scroll while open only).

  Faces:
  - default: a jera `Button` with an `icon` snippet, the label, an `extra`
    snippet and a `count` pill. `hideLabel` makes it icon-only (the label,
    plus the count and `countLabel` when there is one, becomes its
    `aria-label`: "Filters, 3 active"); `compactLabel` hides the label visually while
    true (drive it from your own pane width).
  - `trigger(attrs)` snippet: your own button. Spread `attrs` onto it
    (`popovertarget`, `aria-expanded`, `aria-controls`, `aria-haspopup`,
    `disabled`, `title`, and `onclick` in sheet mode).
  - `sheet`: the same trigger opens a jera `Sheet` from the bottom (a phone).
    `hideTrigger` drops the button; the host opens it through `bind:open`.

  `footer(close)` is pinned under the scrolling body in every face.

  When to use which overlay:
  - ToolPanel: a toolbar button that opens a form panel (fixed width,
    scrolling body, pinned footer).
  - Popover `trigger="click"`: a small action panel on a trigger you render
    yourself (a badge, an inline status).
  - Dropdown: a `role="menu"` list of actions.

  @example
  <ToolPanel label="Filters" count={active || null} width={320}>
    {#snippet icon()}<FilterIcon size={14} />{/snippet}
    <fieldset>…</fieldset>
    {#snippet footer(close)}<Button size="sm" onclick={close}>Done</Button>{/snippet}
  </ToolPanel>

  @example Your own trigger
  <ToolPanel label="Columns">
    {#snippet trigger(attrs)}<IconButton label="Columns" {...attrs} />{/snippet}
    …
  </ToolPanel>
-->
<script>
  import { untrack } from 'svelte';
  import Button from '../primitives/Button.svelte';
  import Sheet from './Sheet.svelte';

  /**
   * @type {{
   *   label: string, panelLabel?: string|null, title?: string|null,
   *   count?: number|string|null, countLabel?: string,
   *   hideLabel?: boolean, compactLabel?: boolean,
   *   size?: 'xs'|'sm'|'md'|'lg', variant?: string, disabled?: boolean,
   *   width?: number, align?: 'end'|'start', open?: boolean,
   *   sheet?: boolean, hideTrigger?: boolean,
   *   icon?: import('svelte').Snippet, extra?: import('svelte').Snippet,
   *   children?: import('svelte').Snippet,
   *   footer?: import('svelte').Snippet<[() => void]>,
   *   trigger?: import('svelte').Snippet<[Record<string, any>]>,
   *   ontoggle?: (open: boolean) => void,
   *   class?: string, [key: string]: any
   * }}
   */
  let {
    label,
    panelLabel = null,
    title = null,
    count = null,
    /** Screen-reader suffix after the count ("3 active"). */
    countLabel = 'active',
    hideLabel = false,
    compactLabel = false,
    size = 'xs',
    variant = 'ghost',
    disabled = false,
    width = 296,
    /** Which edge of the button the panel lines up with. */
    align = 'end',
    open = $bindable(false),
    sheet = false,
    /** Sheet only: render no button; the host opens it through `open`. */
    hideTrigger = false,
    icon,
    extra,
    children,
    footer,
    trigger,
    ontoggle,
    class: className = '',
    ...rest
  } = $props();

  const uid = $props.id();
  const panelId = `jera-tool-panel-${uid}`;
  const anchorName = `--jera-tool-panel-${uid}`;
  const name = $derived(panelLabel ?? label);

  const FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let anchor = $state(null);
  let panel = $state(null);

  // Detected after mount, not at module scope: the server has no CSS object,
  // and a module constant would differ between SSR and hydration.
  let anchored = $state(false);
  $effect(() => {
    anchored = typeof CSS !== 'undefined' && CSS.supports?.('anchor-name', '--x') === true;
  });

  /** Icon-only face: aria-label replaces the content, so the count goes in it. */
  const iconOnlyName = $derived(count ? `${label}, ${count} ${countLabel}` : label);

  /** The trigger's focusable element (the jera Button or the consumer's own). */
  const triggerEl = () => anchor?.querySelector(FOCUSABLE) ?? null;

  /** JS fallback placement from the trigger's rectangle. */
  function place() {
    const el = triggerEl() ?? anchor;
    if (!el || !panel) return;
    const rect = el.getBoundingClientRect();
    const w = Math.min(width, window.innerWidth - 16);
    const from = align === 'start' ? rect.left : rect.right - w;
    const left = Math.max(8, Math.min(from, window.innerWidth - w - 8));
    panel.style.top = `${Math.round(rect.bottom + 4)}px`;
    panel.style.left = `${Math.round(left)}px`;
  }

  /** The browser toggled the popover (button, light dismiss, Escape, showPopover). */
  function handleToggle(event) {
    open = event.newState === 'open';
    const focused = document.activeElement;
    if (!open) {
      // The browser hands focus back only while it was inside the panel; a
      // control that disabled itself dropped it on <body>.
      if (!focused || focused === document.body) triggerEl()?.focus({ preventScroll: true });
      return;
    }
    if (!anchored) place();
    // `toggle` arrives a task after the click: never pull focus out of the
    // panel when the user is already in it.
    if (panel && !panel.contains(focused)) {
      // No control inside: focus the panel (tabindex -1) so the dialog is entered and announced.
      /** @type {HTMLElement} */ (panel.querySelector(FOCUSABLE) ?? panel).focus({ preventScroll: true });
    }
  }

  // `bind:open` drives the popover; the browser's own toggles write `open`
  // back (handleToggle), so this only acts when the two disagree.
  $effect(() => {
    if (sheet || !panel) return;
    const want = open;
    untrack(() => {
      const shown = panel.matches(':popover-open');
      if (want && !shown) {
        if (!anchored) place();
        panel.showPopover();
      } else if (!want && shown) {
        panel.hidePopover();
      }
    });
  });

  // JS fallback only: follow the trigger while open. Listeners exist only
  // while the panel is open and are removed on close.
  $effect(() => {
    if (sheet || anchored || !open) return;
    // Scrolling inside the panel's own body does not move the trigger.
    const follow = (e) => {
      if (e.type === 'scroll' && e.target instanceof Node && panel?.contains(e.target)) return;
      place();
    };
    window.addEventListener('resize', follow, { passive: true });
    window.addEventListener('scroll', follow, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', follow);
      window.removeEventListener('scroll', follow, { capture: true });
    };
  });

  // `ontoggle(open)` for every change, whoever made it (browser, host, sheet).
  let lastOpen = untrack(() => open);
  $effect(() => {
    const now = open;
    if (now === lastOpen) return;
    lastOpen = now;
    untrack(() => ontoggle?.(now));
  });

  /** Close from inside (a control that ends the task). Focus returns to the trigger. */
  export function close() {
    if (sheet) open = false;
    else if (panel?.matches?.(':popover-open')) panel.hidePopover();
    else open = false;
  }

  const triggerAttrs = $derived(
    sheet ?
      {
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        disabled,
        title: title ?? undefined,
        onclick: () => (open = true)
      }
    : {
        popovertarget: panelId,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': panelId,
        disabled,
        title: title ?? undefined
      }
  );
</script>

{#snippet face()}
  {@render icon?.()}
  {#if !hideLabel}
    <span class="label" class:sr-only={compactLabel}>{label}</span>
    {#if extra}<span class="extra">{@render extra()}</span>{/if}
  {/if}
  {#if count}
    <span class="count">{count}<span class="sr-only">&nbsp;{countLabel}</span></span>
  {/if}
{/snippet}

{#snippet triggerFace()}
  {#if trigger}
    {@render trigger(triggerAttrs)}
  {:else}
    <Button
      {size}
      {variant}
      iconOnly={hideLabel}
      aria-label={hideLabel ? iconOnlyName : undefined}
      {...triggerAttrs}
    >
      {@render face()}
    </Button>
  {/if}
{/snippet}

{#snippet footerBlock()}
  {@render footer?.(close)}
{/snippet}

{#if sheet}
  {#if !hideTrigger}
    <span class="anchor" bind:this={anchor}>{@render triggerFace()}</span>
  {/if}
  <Sheet bind:open ariaLabel={name} footer={footer ? footerBlock : undefined} class={className} {...rest}>
    <div class="sheet-content">
      <h2 class="sheet-title">{name}</h2>
      {@render children?.()}
    </div>
  </Sheet>
{:else}
  <span class="anchor" bind:this={anchor} style:anchor-name={anchorName}>
    {@render triggerFace()}
  </span>

  <div
    id={panelId}
    bind:this={panel}
    popover="auto"
    role="dialog"
    aria-label={name}
    tabindex="-1"
    class="jera-tool-panel {className}"
    class:anchored
    class:start={align === 'start'}
    style:position-anchor={anchorName}
    style:--tool-panel-w="{width}px"
    ontoggle={handleToggle}
    {...rest}
  >
    <div class="body">{@render children?.()}</div>
    {#if footer}<div class="foot">{@render footer(close)}</div>{/if}
  </div>
{/if}

<style>
  .anchor {
    display: inline-flex;
  }

  .extra {
    color: var(--color-base04);
  }

  .count {
    min-width: 1rem;
    padding: 0 var(--space-2);
    border-radius: var(--radius-default);
    background: var(--color-base0D);
    color: var(--color-base00);
    font-size: var(--text-2xs);
    font-variant-numeric: tabular-nums;
    line-height: 1rem;
    text-align: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* Focused only as the fallback target when it holds no control: no ring on the whole panel. */
  .jera-tool-panel:focus {
    outline: none;
  }

  .jera-tool-panel {
    position: fixed;
    inset: auto;
    margin: 0;
    width: min(var(--tool-panel-w), calc(100vw - 16px));
    max-height: min(520px, calc(100vh - 56px));
    overflow: hidden;
    padding: 0;
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
    background: var(--color-base00);
    color: var(--color-base05);
    box-shadow: var(--shadow-lg);
    opacity: 1;
    transition: opacity 120ms ease-out;
  }

  .jera-tool-panel:popover-open {
    display: flex;
    flex-direction: column;
  }

  @starting-style {
    .jera-tool-panel:popover-open {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jera-tool-panel {
      transition: none;
    }
  }

  .jera-tool-panel.anchored {
    top: anchor(bottom);
    right: anchor(right);
    margin-top: var(--space-2);
    position-try-fallbacks: flip-inline, flip-block;
  }

  .jera-tool-panel.anchored.start {
    right: auto;
    left: anchor(left);
  }

  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: var(--space-6);
  }

  .foot {
    display: flex;
    flex: none;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-6);
    border-top: var(--border-width-thin) solid var(--color-base02);
  }

  .sheet-content {
    display: grid;
    gap: var(--space-6);
    padding: 0 var(--space-6) var(--space-6);
  }

  .sheet-title {
    margin: 0;
    font-size: var(--text-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base06);
  }
</style>
