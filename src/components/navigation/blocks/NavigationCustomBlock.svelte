<!--
  @component NavigationCustomBlock

  Custom block wrapper for user-defined components.
-->
<script>
  import { getContext } from 'svelte';
  import { SIDEBAR_CONTEXT_KEY } from '../../../utils/sidebar.svelte.js';
  import { NAVIGATION_CONTEXT_KEY } from '../../../utils/navigation.svelte.js';

  let {
    block,
    navigationState = null,
    onEvent = null
  } = $props();

  const sidebar = getContext(SIDEBAR_CONTEXT_KEY);
  const navContext = getContext(NAVIGATION_CONTEXT_KEY);
  const navState = navigationState || navContext;

  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  // Get the custom component
  const CustomComponent = $derived(block.component);

  // Prepare props for custom component
  const customProps = $derived({
    block,
    navigationState: navState,
    sidebar,
    isCollapsed,
    onEvent,
    ...(block.props || {})
  });
</script>

<div class="nav-custom-block" data-block-type={block.type} data-block-id={block.id}>
  {#if CustomComponent}
    <CustomComponent {...customProps} />
  {:else}
    <div class="custom-block-fallback">
      <p class="fallback-text">Custom component not provided</p>
      <p class="fallback-details">Block ID: {block.id}, Type: {block.type}</p>
    </div>
  {/if}
</div>

<style>
  .nav-custom-block {
    margin-bottom: var(--nav-block-spacing, 0.5rem);
  }

  .custom-block-fallback {
    padding: 1rem 0.75rem;
    text-align: center;
    border: 1px dashed var(--color-border, color-mix(in srgb, var(--color-base03, #565E78) 30%, transparent));
    border-radius: var(--nav-item-border-radius, 0.375rem);
    background: var(--color-surface-alt, var(--color-base02, #3E4359));
  }

  .fallback-text {
    font-size: 0.875rem;
    color: var(--color-text-muted, var(--color-base05, #D0D2DB));
    margin: 0 0 0.5rem 0;
    font-weight: 500;
  }

  .fallback-details {
    font-size: 0.75rem;
    color: var(--color-text-muted, var(--color-base04, #737E99));
    margin: 0;
    font-family: monospace;
  }
</style>