<!--
  @component Stat

  A metric display component showing a value and label with optional status indicator.

  @example Basic
  <Stat value="42" label="Users" />

  @example With status
  <Stat value="95%" label="Uptime" status="success" />

  @example With bar
  <Stat value="75" max={100} label="Progress" showBar />

  @example With unit and secondary value
  <Stat value="12" unit="/15" label="Tasks" status="warning" />

  @example As link
  <Stat value="8" label="Errors" href="/errors" status="error" />
-->
<script>
  let {
    value,
    label,
    unit = '',
    secondary = '',
    status = '',
    size = 'md',
    showBar = false,
    barValue = 0,
    max = 100,
    href = '',
    class: className = '',
    children
  } = $props();

  const barPercent = $derived(Math.min((barValue || value) / max * 100, 100));
  const Tag = $derived(href ? 'a' : 'div');
</script>

<svelte:element
  this={Tag}
  {href}
  class="stat stat-{size} {status ? `stat-${status}` : ''} {href ? 'stat-link' : ''} {className}"
>
  {#if status}
    <span class="stat-dot stat-dot-{status}"></span>
  {/if}

  <div class="stat-content">
    <div class="stat-value">
      {value}{#if unit}<span class="stat-unit">{unit}</span>{/if}
    </div>

    {#if secondary}
      <div class="stat-secondary">{secondary}</div>
    {/if}

    <div class="stat-label">{label}</div>

    {#if showBar}
      <div class="stat-bar">
        <div
          class="stat-bar-fill {status ? `stat-bar-${status}` : ''}"
          style="width: {barPercent}%"
        ></div>
      </div>
    {/if}

    {#if children}
      <div class="stat-extra">
        {@render children()}
      </div>
    {/if}
  </div>
</svelte:element>

<style>
  .stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    text-decoration: none;
    color: inherit;
  }

  .stat-link {
    cursor: pointer;
  }

  .stat-link:hover .stat-value {
    color: var(--color-base07);
  }

  /* Size variants */
  .stat-sm .stat-value {
    font-size: var(--text-lg);
  }

  .stat-sm .stat-label {
    font-size: 10px;
  }

  .stat-md .stat-value {
    font-size: var(--text-2xl);
  }

  .stat-md .stat-label {
    font-size: var(--text-xs);
  }

  .stat-lg .stat-value {
    font-size: var(--text-3xl);
  }

  .stat-lg .stat-label {
    font-size: var(--text-sm);
  }

  /* Content */
  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-weight: 600;
    color: var(--color-base06);
    letter-spacing: -0.02em;
    line-height: 1.2;
    transition: color 0.2s ease;
  }

  .stat-unit {
    font-size: 0.6em;
    font-weight: 400;
    color: var(--color-base04);
  }

  .stat-secondary {
    font-size: var(--text-sm);
    color: var(--color-base04);
    margin-top: var(--space-1);
  }

  .stat-label {
    color: var(--color-base04);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: var(--space-1);
  }

  .stat-extra {
    margin-top: var(--space-2);
  }

  /* Status dot */
  .stat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
  }

  .stat-dot-success { background: var(--color-base0B); }
  .stat-dot-warning { background: var(--color-base0A); }
  .stat-dot-error { background: var(--color-base08); }
  .stat-dot-info { background: var(--color-base0D); }

  /* Status value colors */
  .stat-error .stat-value { color: var(--color-base08); }
  .stat-warning .stat-value { color: var(--color-base0A); }
  .stat-success .stat-value { color: var(--color-base0B); }

  /* Progress bar */
  .stat-bar {
    height: 4px;
    background: var(--color-base02);
    border-radius: var(--radius-full);
    margin-top: var(--space-3);
    overflow: hidden;
  }

  .stat-bar-fill {
    height: 100%;
    background: var(--color-base0D);
    border-radius: var(--radius-full);
    transition: width 0.3s ease;
  }

  .stat-bar-success { background: var(--color-base0B); }
  .stat-bar-warning { background: var(--color-base0A); }
  .stat-bar-error { background: var(--color-base08); }
</style>
