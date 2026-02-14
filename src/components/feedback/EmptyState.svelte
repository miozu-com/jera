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
-->
<script>
  let {
    title = 'No data found',
    description = '',
    size = 'default',
    class: className = '',
    icon,
    actions
  } = $props();
</script>

<div class="empty-state empty-state-{size} {className}">
  <div class="empty-state-content">
    {#if icon}
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
    padding: var(--space-16) var(--space-6);
  }

  .empty-state-compact {
    padding: var(--space-8) var(--space-4);
  }

  .empty-state-large {
    padding: var(--space-24) var(--space-6);
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
    margin-bottom: var(--space-6);
    border-radius: var(--radius-default);
    background: var(--color-base01);
    color: var(--color-base04);
    transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease;
  }

  .empty-state-compact .empty-state-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-4);
  }

  .empty-state-large .empty-state-icon {
    width: 5rem;
    height: 5rem;
    margin-bottom: var(--space-8);
  }

  .empty-state:hover .empty-state-icon {
    background: var(--color-base02);
    color: var(--color-base05);
    transform: scale(1.05);
  }

  .empty-state-text {
    margin-bottom: var(--space-6);
  }

  .empty-state-compact .empty-state-text {
    margin-bottom: var(--space-4);
  }

  .empty-state-large .empty-state-text {
    margin-bottom: var(--space-8);
  }

  .empty-state-title {
    margin: 0 0 var(--space-2) 0;
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
    gap: var(--space-3);
    flex-wrap: wrap;
    justify-content: center;
  }

  .empty-state-compact .empty-state-actions {
    gap: var(--space-2);
  }

  .empty-state-large .empty-state-actions {
    gap: var(--space-4);
  }
</style>
