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

  @example Anchored to the start, for a page that has its own column
  Use `align="start"` when the page already has a left edge the empty state
  should share — a list, a toolbar, or a form above it. The whole block moves to
  the start edge and its contents left-align, so anything running to two or more
  lines reads on a stable axis instead of a ragged one.

  <EmptyState align="start" title="No collections yet" description="…" />
-->
<script>
  let {
    title = 'No data found',
    description = '',
    size = 'default',
    align = 'center',
    class: className = '',
    art,
    icon,
    actions
  } = $props();
</script>

<div class="empty-state empty-state-{size} align-{align} {className}">
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
    max-width: 28rem;
  }

  /* `align="start"` — the whole block anchors to the start edge, like
     `text-align: start`. For a page whose content already has a left edge it must
     share: a list, a toolbar, or a form above it. On catalog/collections the
     create form starts at the column's left edge and a centred empty state
     floated in the middle of it, which is what this fixes.
     `center` stays the default because a lone empty state on an otherwise empty
     canvas wants to be centred — pinned to the far left of a 1700px full-bleed
     canvas it reads as abandoned, not deliberate. */
  .align-start {
    justify-content: flex-start;
  }

  .align-start .empty-state-content {
    align-items: flex-start;
    text-align: left;
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

  /* 1.25rem, up from 1.125rem (2026-09-26). At 18px the title read weaker than
     the 14px body under it once the art grew to the full text column — the
     drawing was the loudest element and the heading the quietest. The title is
     the one line the reader actually reads, so it leads. */
  .empty-state-title {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--text-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base07);
    line-height: 1.3;
  }

  .empty-state-compact .empty-state-title {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
  }

  .empty-state-large .empty-state-title {
    font-size: var(--text-2xl);
  }

  /* 20rem rendered a 14px description at ~32 characters a line — under half the
     45–75 the typographers' range calls for, so a two-line sentence broke into
     three cramped ones. Measured 2026-09-25 on the catalog first run: 97 chars
     over 3 lines. 28rem puts the same sentence at ~45, the bottom of the range,
     and 36 of this component's 40 descriptions in dash are long enough to feel
     the difference. Widening further would push a long description past 75. */
  .empty-state-description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-base04);
    line-height: 1.5;
    max-width: 28rem;
  }

  .empty-state-compact .empty-state-description {
    font-size: var(--text-xs);
  }

  .empty-state-large .empty-state-description {
    font-size: var(--text-base);
    /* Scaled with the base rule above — the same 45–75 character target at the
       larger `large` size. */
    max-width: 32rem;
  }

  .empty-state-actions {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    flex-wrap: wrap;
    justify-content: center;
  }

  .align-start .empty-state-actions {
    justify-content: flex-start;
  }

  .empty-state-compact .empty-state-actions {
    gap: var(--space-4);
  }

  .empty-state-large .empty-state-actions {
    gap: var(--space-8);
  }
</style>
