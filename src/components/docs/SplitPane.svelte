<!--
  @component SplitPane

  Two-pane layout component for documentation with description on the left
  and code/examples on the right. Responsive - stacks vertically on mobile.

  @example
  ```svelte
  <SplitPane>
    {#snippet left()}
      <h2>Function Description</h2>
      <p>This function does something amazing...</p>
    {/snippet}
    {#snippet right()}
      <CodeBlock code={exampleCode} lang="javascript" />
    {/snippet}
  </SplitPane>
  ```
-->
<script>
  let {
    /** Left pane content (description, prose) */
    left,
    /** Right pane content (code, examples) */
    right,
    /** Ratio of left:right pane widths (e.g., '1:1', '2:1', '3:2') */
    ratio = '1:1',
    /** Gap between panes */
    gap = '2rem',
    /** Minimum height */
    minHeight = 'auto',
    /** Whether both panes should independently scroll */
    stickyRight = false,
    /** Additional CSS classes */
    class: className = ''
  } = $props();

  // Parse ratio into flex values
  const [leftFlex, rightFlex] = $derived.by(() => {
    const parts = ratio.split(':').map(Number);
    return [parts[0] || 1, parts[1] || 1];
  });
</script>

<div
  class="jera-split-pane {className}"
  class:sticky-right={stickyRight}
  style:--gap={gap}
  style:--left-flex={leftFlex}
  style:--right-flex={rightFlex}
  style:--min-height={minHeight}
>
  <div class="pane pane-left">
    {@render left?.()}
  </div>
  <div class="pane pane-right">
    {@render right?.()}
  </div>
</div>

<style>
  .jera-split-pane {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    min-height: var(--min-height);
    width: 100%;
  }

  @media (min-width: 1024px) {
    .jera-split-pane {
      flex-direction: row;
    }
  }

  .pane {
    min-width: 0;
  }

  .pane-left {
    flex: var(--left-flex);
  }

  .pane-right {
    flex: var(--right-flex);
  }

  /* Sticky right pane for scrollable docs */
  @media (min-width: 1024px) {
    .sticky-right .pane-right {
      position: sticky;
      top: 1rem;
      align-self: flex-start;
      max-height: calc(100vh - 2rem);
      overflow-y: auto;
    }
  }
</style>
