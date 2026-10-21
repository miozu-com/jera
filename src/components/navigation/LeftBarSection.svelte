<!--
  @component LeftBarSection

  A section within LeftBar with optional title.
  Exact 1:1 match with dash.selify.ai WorkspaceSidebar section styles.

  @example
  {#snippet navigation(bar)}
    <LeftBarSection {bar} title="Administration">
      <LeftBarItem {bar} href="/team" icon={Users} label="Team" />
      <LeftBarItem {bar} href="/settings" icon={Settings} label="Settings" />
    </LeftBarSection>
  {/snippet}
-->
<script>
  import { fade } from 'svelte/transition';
  import { requireInstance } from '../../utils/requireInstance.js';

  let {
    /** The LeftBarState from LeftBar's snippet argument (required). */
    bar = null,
    title = '',
    class: className = '',
    children,
    ...rest
  } = $props();

  const wired = $derived(requireInstance(bar, 'LeftBarSection', 'bar', 'LeftBar', 'navigation'));
  const isCollapsed = $derived(bar?.collapsed ?? false);
</script>

{#if wired}
<div class="nav-section {className}" {...rest}>
  {#if title && !isCollapsed}
    <div class="section-header" transition:fade={{ duration: 150 }}>{title}</div>
  {:else if title && isCollapsed}
    <div class="section-divider"></div>
  {/if}
  <ul class="nav-list">
    {@render children?.()}
  </ul>
</div>
{/if}

<style>
  .nav-section {
    padding-top: 0;
    padding-bottom: 0;
  }

  .section-header {
    padding: 0.25rem 0.75rem;
    margin-bottom: 0.25rem;
    font-size: var(--text-xs);
    line-height: 1rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-base05);
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
  }

  .section-divider {
    margin: 0 0.75rem 0.5rem 0.75rem;
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
