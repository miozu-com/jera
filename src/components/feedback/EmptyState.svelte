<!--
  @component EmptyState

  A complete empty state UI with icon, title, description, and action buttons.

  @example Basic
  <EmptyState
    title="No items found"
    description="Try adjusting your search or filters"
  />

  @example With icon and action
  <EmptyState
    title="No messages"
    description="Start a conversation to see messages here"
  >
    {#snippet icon()}
      <MessageIcon size={32} />
    {/snippet}
    {#snippet actions()}
      <Button variant="primary" onclick={startChat}>New Message</Button>
    {/snippet}
  </EmptyState>

  @example Compact size
  <EmptyState size="compact" title="No results" />

  @example With an illustration instead of an icon
  The `art` snippet is a wide, unstyled well for a drawing (no tinted square, no
  hover transform), so a wide scene is not letterboxed into the 4rem `icon` box.
  `art` wins when both are passed, and `size="compact"` never renders it.

  <EmptyState title="Your customers" description="Everyone who messages you lands here.">
    {#snippet art()}
      <Illustration scene="channels" />
    {/snippet}
  </EmptyState>
-->
<script>
  let {
    title = 'No data found',
    description = '',
    size = 'default',
    class: className = '',
    art,
    icon,
    actions
  } = $props();
</script>

<div class="empty-state empty-state-{size} {className}">
  <div class="empty-state-content">
    {#if art}
      <div class="empty-state-art">
        {@render art()}
      </div>
    {:else if icon}
      <div class="empty-state-icon">
        {@render icon()}
      </div>
    {/if}

    <div class="empty-state-text">
      <h3 class="empty-state-title">{title}</h3>
      {#if description}
        <p class="empty-state-description">{description}</p>
      {/if}
    </div>

    {#if actions}
      <div class="empty-state-actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: var(--space-32) var(--space-12);
  }

  .empty-state-compact {
    padding: var(--space-16) var(--space-8);
  }

  .empty-state-large {
    padding: var(--space-48) var(--space-12);
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 24rem;
  }

  .empty-state-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    margin-bottom: var(--space-12);
    border-radius: var(--radius-default);
    background: var(--color-base01);
    color: var(--color-base04);
    transition: background var(--duration-slow) ease, color var(--duration-slow) ease, transform var(--duration-slow) ease;
  }

  .empty-state-compact .empty-state-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-8);
  }

  .empty-state-large .empty-state-icon {
    width: 5rem;
    height: 5rem;
    margin-bottom: var(--space-16);
  }

  .empty-state:hover .empty-state-icon {
    background: var(--color-base02);
    color: var(--color-base05);
    transform: scale(1.05);
  }

  /* The art well is deliberately bare: no background, no radius, no hover
     transform. A scene paints its own surfaces, so a tinted well behind it
     double-tints, and a wide drawing cannot live in the 4rem icon square. */
  .empty-state-art {
    width: 100%;
    max-width: 15rem;
    margin-bottom: var(--space-16);
  }

  .empty-state-large .empty-state-art {
    max-width: 18rem;
  }

  /* Compact is for a narrowed list or a table cell — it never carries art. */
  .empty-state-compact .empty-state-art {
    display: none;
  }

  .empty-state-text {
    margin-bottom: var(--space-12);
  }

  .empty-state-compact .empty-state-text {
    margin-bottom: var(--space-8);
  }

  .empty-state-large .empty-state-text {
    margin-bottom: var(--space-16);
  }

  .empty-state-title {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-base07);
    line-height: 1.3;
  }

  .empty-state-compact .empty-state-title {
    font-size: var(--text-base);
    font-weight: 500;
  }

  .empty-state-large .empty-state-title {
    font-size: var(--text-xl);
  }

  .empty-state-description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-base04);
    line-height: 1.5;
    max-width: 20rem;
  }

  .empty-state-compact .empty-state-description {
    font-size: var(--text-xs);
  }

  .empty-state-large .empty-state-description {
    font-size: var(--text-base);
    max-width: 24rem;
  }

  .empty-state-actions {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    flex-wrap: wrap;
    justify-content: center;
  }

  .empty-state-compact .empty-state-actions {
    gap: var(--space-4);
  }

  .empty-state-large .empty-state-actions {
    gap: var(--space-8);
  }
</style>
