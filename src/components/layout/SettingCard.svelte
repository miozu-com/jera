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
    children
  } = $props();
</script>

<div class="setting-card setting-card-{variant} {className}">
  {#if title}
    <h3 class="card-title">{title}</h3>
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
    border: 1px solid color-mix(in srgb, var(--color-base02) 60%, transparent);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    transition: border-color 0.15s ease;
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

  .card-title {
    margin: 0 0 var(--space-5);
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--color-base06);
  }

  .setting-card-danger .card-title {
    color: var(--color-base08);
  }

  .card-content {
    display: flex;
    flex-direction: column;
  }
</style>
