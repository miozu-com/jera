<!--
  @component DistributionBar

  Horizontal segmented bar with auto-calculated percentages and legend.

  @example Basic
  <DistributionBar entries={[
    {label: 'Model', value: 1, color: 'var(--color-base0E)'},
    {label: 'Chat Support', value: 1, color: 'var(--color-base0D)'},
  ]} />

  @example Without legend
  <DistributionBar entries={entries} showLegend={false} />

  @example Legend on hover
  <DistributionBar entries={entries} showLegend="hover" />

  @example Small
  <DistributionBar entries={entries} height="sm" />
-->
<script>
  let {
    entries = [],
    height = 'md',
    showLegend = true,
    class: className = ''
  } = $props();

  const total = $derived(entries.reduce((sum, e) => sum + (e.value || 0), 0));
  const visible = $derived(entries.filter(e => e.value > 0));
</script>

{#if visible.length > 0}
  <div class="dist-wrap {showLegend === 'hover' ? 'dist-wrap--hover-legend' : ''} {className}">
    <div class="dist-bar {height === 'sm' ? 'dist-bar--sm' : ''}">
      {#each visible as entry}
        {@const pct = total > 0 ? (entry.value / total) * 100 : 0}
        <div
          class="dist-segment"
          style="width: {pct}%; background-color: {entry.color || 'var(--color-base04)'}"
          title="{entry.label}: {entry.value}"
        ></div>
      {/each}
    </div>
    {#if showLegend}
      <div class="dist-legend-reveal">
        <div class="dist-legend">
          {#each visible as entry}
            <span class="dist-legend-item">
              <span class="dist-dot" style="background-color: {entry.color || 'var(--color-base04)'}"></span>
              {entry.label}
              <span class="dist-count">{entry.value}</span>
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .dist-wrap {
    margin-top: 0.75rem;
  }

  .dist-bar {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: var(--color-base02);
  }

  .dist-bar--sm {
    height: 5px;
    border-radius: 2.5px;
  }

  .dist-segment {
    transition: width 400ms ease;
  }

  .dist-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    margin-top: 0.5rem;
  }

  .dist-legend-item {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: 0.625rem;
    color: var(--color-base04);
    text-transform: capitalize;
  }

  .dist-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dist-count {
    font-family: var(--font-mono, monospace);
    color: var(--color-base05);
    text-box-trim: both;
    text-box-edge: cap alphabetic;
  }

  /* Hover-reveal legend — absolute, no layout shift */
  .dist-wrap--hover-legend {
    position: relative;
  }

  .dist-wrap--hover-legend .dist-legend-reveal {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    padding-top: 0.375rem;
  }

  .dist-wrap--hover-legend .dist-legend-reveal > .dist-legend {
    margin-top: 0;
    opacity: 0;
    transform: translateY(-2px);
    transition: opacity 200ms ease, transform 200ms ease;
  }

  .dist-wrap--hover-legend:hover .dist-legend-reveal > .dist-legend {
    opacity: 1;
    transform: translateY(0);
  }
</style>
