<!--
  @component DashCard

  Glassmorphism dashboard card with header (icon + title + link), stagger animation, and content slot.

  @example Basic
  <DashCard title="Your AI Team" href="/workforce" index={0}>
    {#snippet icon()}<Bot size={14} />{/snippet}
    {#snippet linkLabel()}Manage &rarr;{/snippet}
    <p>Card content here</p>
  </DashCard>

  @example Accent variant
  <DashCard title="Revenue" variant="accent" index={1}>
    <Stat value="$12,500" label="Monthly" />
  </DashCard>
-->
<script>
  let {
    title = '',
    subtitle = '',
    href = '',
    icon,
    linkLabel,
    actions,
    index = 0,
    variant = 'default',
    class: className = '',
    children,
    ...rest
  } = $props();
</script>

<div
  class="dash-card {variant !== 'default' ? `dash-card--${variant}` : ''} {className}"
  style="--index: {index}"
  {...rest}
>
  <div class="dash-card-header">
    <div class="dash-card-title">
      {#if icon}
        <span class="dash-card-icon">{@render icon()}</span>
      {/if}
      <div class="dash-card-title-group">
        <h3>{title}</h3>
        {#if subtitle}
          <p class="dash-card-subtitle">{subtitle}</p>
        {/if}
      </div>
    </div>
    {#if actions}
      <div class="dash-card-actions">{@render actions()}</div>
    {:else if href && linkLabel}
      <a {href} class="dash-card-link">{@render linkLabel()}</a>
    {/if}
  </div>
  {#if children}
    <div class="dash-card-body">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .dash-card {
    border-radius: var(--radius-sm);
    padding: 1.25rem;
    border: var(--border-width-default) solid var(--color-base02);
    transition: border-color 200ms ease;
    background: color-mix(in srgb, var(--color-base01) 60%, transparent);
    backdrop-filter: blur(12px);
    opacity: 0;
    animation: fadeSlideUp 400ms ease forwards;
    animation-delay: calc(var(--index, 0) * 80ms);
  }

  .dash-card:hover {
    border-color: var(--color-base03);
  }

  .dash-card--accent {
    border-color: color-mix(in srgb, var(--color-base0D) 30%, var(--color-base02));
  }

  .dash-card--accent:hover {
    border-color: color-mix(in srgb, var(--color-base0D) 50%, var(--color-base02));
  }

  .dash-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .dash-card-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dash-card-title h3 {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-base04);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .dash-card-icon {
    color: var(--color-base04);
    display: flex;
    align-items: center;
  }

  .dash-card-title-group {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .dash-card-subtitle {
    font-size: 0.75rem;
    color: var(--color-base04);
    font-weight: 400;
    letter-spacing: normal;
    text-transform: none;
    margin: 0;
  }

  .dash-card-actions {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-shrink: 0;
  }

  .dash-card-link {
    font-size: 0.6875rem;
    color: var(--color-base04);
    text-decoration: none;
    transition: color 150ms ease;
  }

  .dash-card-link:hover {
    color: var(--color-base05);
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
