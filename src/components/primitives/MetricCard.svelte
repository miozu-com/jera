<!--
  @component MetricCard

  A card displaying a metric value with label, icon, and optional status indicator.
  Ideal for dashboards and overview sections.

  @example Basic metric
  <MetricCard
    label="Total Users"
    value={1234}
  />

  @example With icon and status
  <MetricCard
    label="Services"
    value={4}
    unit="/5"
    status="success"
  >
    {#snippet icon()}
      <ActivityIcon size={16} />
    {/snippet}
  </MetricCard>

  @example Clickable with href
  <MetricCard
    label="Errors"
    value={3}
    status="error"
    href="/errors"
  >
    {#snippet badge()}
      <StatusBadge variant="error">ALERT</StatusBadge>
    {/snippet}
  </MetricCard>

  @example With progress bar
  <MetricCard
    label="Storage"
    value={75}
    unit="%"
    progress={75}
  />
-->
<script>
  let {
    label = '',
    value = 0,
    unit = '',
    sublabel = '',
    subtitle = '',
    trend = '',
    status = '',
    progress = null,
    href = null,
    class: className = '',
    icon,
    badge,
    onclick,
    ...rest
  } = $props();

  const isClickable = $derived(!!href || !!onclick);
  // subtitle takes priority over sublabel for backward compat
  const resolvedSublabel = $derived(subtitle || sublabel);
  // Auto-detect trend direction from leading +/-
  const trendDir = $derived.by(() => {
    if (!trend) return '';
    const s = String(trend).trim();
    if (s.startsWith('+')) return 'up';
    if (s.startsWith('-')) return 'down';
    return 'neutral';
  });

  const progressVariant = $derived.by(() => {
    if (progress === null) return '';
    if (progress > 80) return 'progress-error';
    if (progress > 60) return 'progress-warning';
    return 'progress-primary';
  });
</script>

{#snippet cardContent()}
  <div class="metric-header">
    {#if icon}
      <span class="metric-icon">
        {@render icon()}
      </span>
    {/if}
    <span class="metric-label">{label}</span>
    {#if badge}
      <span class="metric-badge">
        {@render badge()}
      </span>
    {/if}
  </div>

  <div class="metric-body">
    <span class="metric-value {status ? `metric-value-${status}` : ''}">
      {value}{#if unit}<span class="metric-unit">{unit}</span>{/if}
    </span>
    {#if resolvedSublabel}
      <span class="metric-sublabel">{resolvedSublabel}</span>
    {/if}
    {#if trend}
      <span class="metric-trend metric-trend-{trendDir}">{trend}</span>
    {/if}
  </div>

  {#if progress !== null}
    <div class="metric-progress">
      <div class="metric-progress-bar {progressVariant}" style="width: {Math.min(100, Math.max(0, progress))}%"></div>
    </div>
  {/if}
{/snippet}

{#if href}
  <a
    {href}
    class="metric-card {status ? `metric-card-${status}` : ''} metric-card-clickable {className}"
    {...rest}
  >
    {@render cardContent()}
  </a>
{:else}
  <div
    class="metric-card {status ? `metric-card-${status}` : ''} {isClickable ? 'metric-card-clickable' : ''} {className}"
    {onclick}
    role={onclick ? 'button' : undefined}
    tabindex={onclick ? 0 : undefined}
    {...rest}
  >
    {@render cardContent()}
  </div>
{/if}

<style>
  .metric-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-10);
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .metric-card-clickable {
    cursor: pointer;
  }

  .metric-card-clickable:hover {
    border-color: var(--color-base03);
    background: color-mix(in srgb, var(--color-base01) 80%, var(--color-base02));
  }

  .metric-card-error {
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
  }

  .metric-card-warning {
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
  }

  .metric-card-success {
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .metric-icon {
    color: var(--color-base04);
  }

  .metric-label {
    flex: 1;
    font-size: var(--text-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-base04);
  }

  .metric-badge {
    flex-shrink: 0;
  }

  .metric-body {
    display: flex;
    align-items: baseline;
    gap: var(--space-4);
  }

  .metric-value {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--color-base06);
    line-height: 1;
  }

  .metric-value-success {
    color: var(--color-base0B);
  }

  .metric-value-warning {
    color: var(--color-base0A);
  }

  .metric-value-error {
    color: var(--color-base08);
  }

  .metric-unit {
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--color-base04);
  }

  .metric-sublabel {
    font-size: var(--text-sm);
    color: var(--color-base04);
  }

  .metric-trend {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .metric-trend-up { color: var(--color-base0B); }
  .metric-trend-down { color: var(--color-base08); }
  .metric-trend-neutral { color: var(--color-base04); }

  .metric-progress {
    height: 4px;
    background: var(--color-base02);
    border-radius: 2px;
    overflow: hidden;
    margin-top: var(--space-2);
  }

  .metric-progress-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .progress-primary {
    background: var(--color-base0D);
  }

  .progress-warning {
    background: var(--color-base0A);
  }

  .progress-error {
    background: var(--color-base08);
  }

  /* Focus state for clickable */
  .metric-card-clickable:focus-visible {
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }
</style>
