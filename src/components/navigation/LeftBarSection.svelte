<!--
  @component LeftBarSection

  A section within LeftBar with optional title.
  Exact 1:1 match with admin.selify.ai AdminSidebar section styles.

  @example
  <LeftBarSection title="Administration">
    <LeftBarItem href="/team" icon={Users} label="Team" />
    <LeftBarItem href="/settings" icon={Settings} label="Settings" />
  </LeftBarSection>
-->
<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';

  let {
    title = '',
    class: className = '',
    children
  } = $props();

  const leftbar = getContext('leftbar');
  const isCollapsed = $derived(leftbar?.collapsed ?? false);
</script>

<div class="nav-section {className}">
  {#if title && !isCollapsed}
    <div class="section-header" transition:fade={{ duration: 150 }}>{title}</div>
  {/if}
  <ul class="nav-list">
    {@render children?.()}
  </ul>
</div>

<style>
  .nav-section {
    padding-top: 0;
    padding-bottom: 0;
  }

  .section-header {
    padding: 0.75rem 0.75rem 0.25rem 0.75rem;
    margin-bottom: 0.25rem;
    margin-top: 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-base04);
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
