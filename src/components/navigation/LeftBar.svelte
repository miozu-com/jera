<!--
  @component LeftBar

  A collapsible left sidebar with navigation sections, expandable groups, and hover popovers.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar styles.

  State lives in a LeftBarState (no Svelte context). LeftBar creates one, or
  uses yours from the `bar` prop, and hands it to every snippet as the snippet
  argument; each LeftBar child takes it as the `bar` prop. One LeftBarState
  per LeftBar: never share an instance between two bars.

  `initialCollapsed` (SSR cookie seed) wins the first paint over a stale
  `collapsed`; only that first parent -> bar sync is skipped, so later parent
  writes to `collapsed` still reach the bar.

  @example Basic usage
  <LeftBar bind:collapsed persistKey="my-sidebar">
    {#snippet header(bar)}
      <DropdownContainer {themeState} user={me} isCollapsed={bar.collapsed} />
    {/snippet}

    {#snippet navigation(bar)}
      <LeftBarSection {bar}>
        <LeftBarItem {bar} href="/" icon={Home} label="Dashboard" active={isActive('/')} />
        <LeftBarItem {bar} href="/settings" icon={Settings} label="Settings" />
      </LeftBarSection>
    {/snippet}

    {#snippet footer(bar)}
      <LeftBarToggle {bar} />
    {/snippet}
  </LeftBar>

  @example Own the state (read or drive it from outside the bar)
  // script: import LeftBar, { LeftBarState } from '@miozu/jera/components/navigation/LeftBar';
  //         const bar = new LeftBarState({ collapsed: data.sidebarCollapsed, persistKey: 'nav' });
  <LeftBar {bar}>…</LeftBar>

  When you pass `bar`, the bar is the source of truth: LeftBar never writes
  `collapsed` into it unless you also pass `collapsed` (bind:collapsed), it
  does not call `bar.restore()` on mount (call it yourself if you want the
  localStorage value), and `initialCollapsed`/`persistKey`/`cookieKey` on
  LeftBar are ignored (give them to the LeftBarState). The instance is read
  once; swapping `bar` later is ignored — key the LeftBar to replace it.
-->
<script module>
  export { LeftBarState } from './leftBar.svelte.js';
</script>

<script>
  import { onMount, untrack } from 'svelte';
  import { LeftBarState, syncCollapsed } from './leftBar.svelte.js';
  import LeftBarPopover from './LeftBarPopover.svelte';

  let {
    /** Optional LeftBarState; created from collapsed/initialCollapsed/persistKey/cookieKey when absent. */
    bar: barProp = null,
    /** undefined = not passed (an external `bar` then keeps its own value). */
    collapsed = $bindable(),
    initialCollapsed = undefined,
    persistKey = null,
    cookieKey = null,
    popoverMap = {},
    class: className = '',
    /** Snippets `(bar: LeftBarState)`: pass `bar` to every LeftBar child. */
    header,
    navigation,
    footer,
    children
  } = $props();

  // Prefer SSR-provided initialCollapsed (cookie-based) over the bound value.
  const bar = untrack(
    () =>
      barProp ??
      new LeftBarState({
        collapsed: initialCollapsed ?? collapsed ?? false,
        persistKey,
        cookieKey
      })
  );

  // parent <-> state. Parent -> state applies only a value the consumer passed
  // (an external bar keeps its own value without `collapsed`); with an SSR
  // seed (initialCollapsed) the first run is skipped so the seed wins the
  // first paint, and later parent writes to `collapsed` still apply.
  syncCollapsed(
    bar,
    () => collapsed,
    (value) => (collapsed = value),
    { skipFirst: untrack(() => initialCollapsed !== undefined && !barProp) }
  );

  // Load saved state from localStorage on mount (fallback for non-cookie
  // scenarios). An external bar belongs to its owner: they call restore().
  onMount(() => {
    if (!barProp && initialCollapsed === undefined) bar.restore();
    return () => bar.destroy();
  });
</script>

<div class="workspace-sidebar {className}" class:collapsed={bar.collapsed}>
  <!-- Header slot (typically DropdownContainer) -->
  {#if header}
    {@render header(bar)}
  {/if}

  <!-- Main Navigation -->
  {#if navigation}
    <nav class="main-nav">
      {@render navigation(bar)}
    </nav>
  {:else if children}
    <nav class="main-nav">
      {@render children(bar)}
    </nav>
  {/if}

  <!-- Footer with collapse toggle -->
  {#if footer}
    <div class="sidebar-footer">
      {@render footer(bar)}
    </div>
  {/if}
</div>

<!-- Hover popover — rendered outside sidebar to avoid overflow:hidden + will-change clipping -->
{#if bar.collapsed && bar.hoverPopover.item && popoverMap[bar.hoverPopover.item]}
  <LeftBarPopover
    {bar}
    visible={true}
    position={bar.hoverPopover.position}
    title={bar.hoverPopover.item}
    items={popoverMap[bar.hoverPopover.item]}
  />
{/if}

<style>
  .workspace-sidebar {
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface, var(--color-base01));
    border-right: 1px solid color-mix(in srgb, var(--color-base03) 30%, transparent);
    height: 100vh;
    height: 100dvh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 40;
    width: 240px;
    transition: width var(--duration-base) cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
    overflow: hidden;
    user-select: none;
  }

  .workspace-sidebar.collapsed {
    width: 60px;
  }

  .main-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
    overflow-y: auto;
    /* Never a sideways scrollbar: a row that is too wide truncates or wraps,
       it does not scroll the bar (owner 2026-10-18, zoomed in with More open). */
    overflow-x: hidden;
    padding-top: 0;
    padding-bottom: 0;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
