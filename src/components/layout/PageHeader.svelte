<!--
  @component PageHeader

  A flexible page header with icon, title, description, stats, and action slots.
  Designed for data-heavy pages with search and filtering capabilities.

  @example Basic
  <PageHeader title="Dashboard" description="Overview of your system" />

  @example With icon and stats
  <PageHeader
    title="Team Members"
    description="Manage your workspace team"
    stats={[
      {label: "Members", value: 12},
      {label: "Active", value: 11, variant: "success"}
    ]}
  >
    {#snippet icon()}
      <Users size={20} />
    {/snippet}
  </PageHeader>

  @example With actions and search
  <PageHeader title="Products">
    {#snippet actions()}
      <Button>Add Product</Button>
    {/snippet}
    {#snippet search()}
      <input placeholder="Search..." />
    {/snippet}
  </PageHeader>
-->
<script>
  let {
    title = '',
    description = '',
    stats = [],
    size = 'default',
    class: className = '',
    icon,
    actions,
    search,
    filters
  } = $props();
</script>

<header class="page-header page-header-{size} {className}">
  <div class="header-main">
    <div class="header-title-section">
      {#if icon}
        <div class="title-icon">
          {@render icon()}
        </div>
      {/if}
      <div class="title-text">
        <h1 class="page-title">{title}</h1>
        {#if description}
          <p class="page-description">{description}</p>
        {/if}
      </div>
    </div>

    {#if stats.length > 0}
      <div class="header-stats">
        {#each stats as stat}
          <div class="header-stat">
            {#if stat.icon}
              <span class="stat-icon" class:stat-icon-success={stat.variant === 'success'} class:stat-icon-warning={stat.variant === 'warning'} class:stat-icon-error={stat.variant === 'error'}>
                {@render stat.icon()}
              </span>
            {/if}
            <span class="stat-label">{stat.label}</span>
            <span class="stat-value" class:stat-value-success={stat.variant === 'success'} class:stat-value-warning={stat.variant === 'warning'} class:stat-value-error={stat.variant === 'error'}>
              {stat.value}
            </span>
          </div>
        {/each}
      </div>
    {/if}

    {#if actions}
      <div class="header-actions">
        {@render actions()}
      </div>
    {/if}
  </div>

  {#if search || filters}
    <div class="header-toolbar">
      {#if search}
        <div class="toolbar-search">
          {@render search()}
        </div>
      {/if}
      {#if filters}
        <div class="toolbar-filters">
          {@render filters()}
        </div>
      {/if}
    </div>
  {/if}
</header>

<style>
  .page-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--color-base00);
    border-bottom: 1px solid var(--color-base02);
  }

  .page-header-compact {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .page-header-large {
    padding: var(--space-8);
    gap: var(--space-6);
  }

  .header-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
    flex-wrap: wrap;
  }

  .header-title-section {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    flex: 1;
    min-width: 0;
  }

  .title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--space-10);
    height: var(--space-10);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    flex-shrink: 0;
  }

  .title-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .page-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--color-base06);
    line-height: 1.2;
  }

  .page-header-compact .page-title {
    font-size: var(--text-xl);
  }

  .page-header-large .page-title {
    font-size: var(--text-3xl);
  }

  .page-description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-base04);
    line-height: 1.5;
  }

  .header-stats {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    flex-shrink: 0;
  }

  .header-stat {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .stat-icon {
    color: var(--color-base04);
  }

  .stat-icon-success {
    color: var(--color-base0B);
  }

  .stat-icon-warning {
    color: var(--color-base0A);
  }

  .stat-icon-error {
    color: var(--color-base08);
  }

  .stat-label {
    font-size: var(--text-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-base04);
  }

  .stat-value {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-base06);
  }

  .stat-value-success {
    color: var(--color-base0B);
  }

  .stat-value-warning {
    color: var(--color-base0A);
  }

  .stat-value-error {
    color: var(--color-base08);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .header-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--color-base01);
    border-radius: var(--radius-lg);
  }

  .toolbar-search {
    flex: 1;
    min-width: 0;
    max-width: var(--page-header-search-max-width, 24rem);
  }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-main {
      flex-direction: column;
      align-items: stretch;
    }

    .header-stats {
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .header-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar-search {
      max-width: none;
    }
  }
</style>
