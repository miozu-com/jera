<!-- Rendered by NavigationContainer as a block's own component (gets `collapsed`)
     or through NavigationCustomBlock (gets `isCollapsed`). -->
<script>
  let { collapsed = false, isCollapsed = false, navigationState = null } = $props();
</script>

<span data-custom data-collapsed={String(collapsed || isCollapsed)} data-has-nav={String(!!navigationState)}></span>
