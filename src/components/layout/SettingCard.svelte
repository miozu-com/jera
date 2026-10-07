<!--
  @component SettingCard

  A card container for settings sections with optional danger variant.
  Use with SettingItem for structured setting rows.

  @example Basic settings card
  <SettingCard title="Account Settings">
    <SettingItem label="Display Name" description="Your public display name">
      {#snippet action()}
        <Input value={name} />
      {/snippet}
    </SettingItem>
  </SettingCard>

  @example Title-row actions (right of the title)
  <SettingCard title="Identity">
    {#snippet actions()}
      <Button variant="ghost" size="sm" aria-label="Explain identity">?</Button>
    {/snippet}
    ...
  </SettingCard>

  @example Danger zone
  <SettingCard title="Danger Zone" variant="danger">
    <SettingItem label="Delete Account" description="This cannot be undone">
      {#snippet action()}
        <Button variant="danger">Delete</Button>
      {/snippet}
    </SettingItem>
  </SettingCard>
-->
<script>
  let {
    title = '',
    variant = 'default',
    class: className = '',
    /** Optional snippet rendered at the right of the title row (icon buttons, a badge). */
    actions,
    children,
    ...rest
  } = $props();
</script>

<div class="setting-card setting-card-{variant} {className}" {...rest}>
  {#if title || actions}
    <div class="card-header">
      {#if title}
        <h3 class="card-title">{title}</h3>
      {/if}
      {#if actions}
        <div class="card-actions">{@render actions()}</div>
      {/if}
    </div>
  {/if}
  {#if children}
    <div class="card-content">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .setting-card {
    background: transparent;
    border: var(--border-width-default) solid color-mix(in srgb, var(--color-base02) 60%, transparent);
    border-radius: var(--radius-xl);
    padding: var(--space-12);
    transition: border-color var(--duration-fast) ease;
  }

  .setting-card:hover {
    border-color: var(--color-base02);
  }

  .setting-card-danger {
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
    background: color-mix(in srgb, var(--color-base08) 3%, transparent);
  }

  .setting-card-danger:hover {
    border-color: color-mix(in srgb, var(--color-base08) 50%, transparent);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin: 0 0 var(--space-10);
    min-height: 1.75rem;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-left: auto;
    flex-shrink: 0;
  }

  /* 18px on a 2rem line: the title row also holds the `actions` snippet
     (32px icon buttons), so the title fills that line instead of floating
     small beside it. */
  .card-title {
    margin: 0;
    font-size: var(--text-lg);
    line-height: 2rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-base06);
  }

  .setting-card-danger .card-title {
    color: var(--color-base08);
  }

  /* A size container so SettingItem can ask the card's width — see
     SettingItem's container rule. */
  .card-content {
    display: flex;
    flex-direction: column;
    container-type: inline-size;
  }
</style>
