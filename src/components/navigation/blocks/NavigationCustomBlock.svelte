<!--
  @component NavigationCustomBlock

  Custom block wrapper for user-defined components.
-->
<script>

  let {
    block,
    /** The NavigationState, handed down by NavigationContainer. */
    navigationState = null,
    /** The surrounding bar is collapsed, handed down by NavigationContainer. */
    collapsed = false,
    onEvent = null
  } = $props();

  const navState = $derived(navigationState);
  const isCollapsed = $derived(!!collapsed);

  // Get the custom component
  const CustomComponent = $derived(block.component);

  // Prepare props for custom component
  const customProps = $derived({
    block,
    navigationState: navState,
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
    border: var(--border-width-thin) dashed var(--color-border, color-mix(in srgb, var(--color-base03) 30%, transparent));
    border-radius: var(--nav-item-border-radius, 0.375rem);
    background: var(--color-surface-alt, var(--color-base02));
  }

  .fallback-text {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--color-base05));
    margin: 0 0 0.5rem 0;
    font-weight: var(--font-weight-medium);
  }

  .fallback-details {
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--color-base04));
    margin: 0;
    font-family: monospace;
  }
</style>