<!--
  @component StatusLine

  A horizontal line of status items with separators.
  Ideal for displaying metadata, timestamps, and badges inline.

  @example Basic status line
  <StatusLine>
    <span>Created by John</span>
    <span>2 hours ago</span>
    <Badge variant="success">Active</Badge>
  </StatusLine>

  @example With custom separator
  <StatusLine separator="|">
    <span>Version 1.2.3</span>
    <span>Released Jan 15</span>
  </StatusLine>

  @example Compact size
  <StatusLine size="sm">
    <span>3 tasks</span>
    <span>2 completed</span>
  </StatusLine>
-->
<script>
  let {
    separator = '·',
    size = 'md',
    class: className = '',
    items,
    children
  } = $props();
</script>

<div class="status-line status-line-{size} {className}">
  {#if items}
    {#each items as item, i}
      {#if i > 0}
        <span class="status-separator">{separator}</span>
      {/if}
      <span class="status-item">
        {#if typeof item === 'string'}
          {item}
        {:else if item.icon}
          <span class="status-icon">
            {@render item.icon()}
          </span>
          {item.text}
        {:else}
          {item.text || item}
        {/if}
      </span>
    {/each}
  {:else if children}
    {@render children()}
  {/if}
</div>

<style>
  .status-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    color: var(--color-base04);
  }

  .status-line-sm {
    font-size: var(--text-xs);
    gap: var(--space-1);
  }

  .status-line-md {
    font-size: var(--text-sm);
  }

  .status-line-lg {
    font-size: var(--text-base);
    gap: var(--space-3);
  }

  .status-separator {
    color: var(--color-base03);
    user-select: none;
  }

  .status-item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Allow children to use these utility classes */
  :global(.status-line .status-highlight) {
    color: var(--color-base06);
    font-weight: 500;
  }

  :global(.status-line .status-success) {
    color: var(--color-base0B);
  }

  :global(.status-line .status-warning) {
    color: var(--color-base0A);
  }

  :global(.status-line .status-error) {
    color: var(--color-base08);
  }

  :global(.status-line .status-muted) {
    color: var(--color-base03);
  }
</style>
