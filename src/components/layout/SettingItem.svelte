<!--
  @component SettingItem

  A structured setting row for use inside SettingCard.
  Replaces magic class names with a composable component API.

  @example Basic setting
  <SettingItem label="Display Name" description="Your public display name">
    {#snippet action()}
      <Input value={name} />
    {/snippet}
  </SettingItem>

  @example With icon
  <SettingItem label="Active Sessions" description="Manage your devices">
    {#snippet leading()}
      <Monitor size={16} />
    {/snippet}
    {#snippet action()}
      <Button size="sm">Manage</Button>
    {/snippet}
  </SettingItem>
-->
<script>
  let {
    label = '',
    description = '',
    leading,
    action,
    class: className = ''
  } = $props();
</script>

<div class="setting-item {className}" class:has-leading={leading}>
  {#if leading}
    <div class="setting-leading">
      {@render leading()}
    </div>
  {/if}
  <div class="setting-content">
    {#if label}
      <h4 class="setting-label">{label}</h4>
    {/if}
    {#if description}
      <p class="setting-description">{description}</p>
    {/if}
  </div>
  {#if action}
    <div class="setting-action">
      {@render action()}
    </div>
  {/if}
</div>

<style>
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) 0;
    border-bottom: 1px solid var(--color-base02);
  }

  .setting-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .setting-item:first-child {
    padding-top: 0;
  }

  .has-leading {
    justify-content: flex-start;
  }

  .setting-leading {
    display: flex;
    align-items: center;
    color: color-mix(in srgb, var(--color-base04) 80%, transparent);
    flex-shrink: 0;
  }

  .setting-content {
    flex: 1;
    min-width: 0;
  }

  .setting-label {
    margin: 0 0 var(--space-1);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base06);
  }

  .setting-description {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
    line-height: 1.5;
  }

  .setting-action {
    flex-shrink: 0;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .setting-item:not(.has-leading) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
  }
</style>
