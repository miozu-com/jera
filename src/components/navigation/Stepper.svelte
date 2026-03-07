<!--
  @component Stepper

  Multi-step progress indicator for wizards and multi-stage workflows.
  Shows step status (pending, current, completed) with connectors between steps.

  @example Default horizontal stepper
  <Stepper
    steps={[
      { id: 'details', label: 'Details', description: 'Enter product info' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'publish', label: 'Publish' }
    ]}
    bind:active={currentStep}
    completed={[0]}
  />

  @example Compact horizontal (no descriptions)
  <Stepper
    steps={steps}
    bind:active={currentStep}
    completed={completedSteps}
    variant="compact"
  />

  @example Vertical layout
  <Stepper
    steps={steps}
    bind:active={currentStep}
    completed={completedSteps}
    variant="vertical"
    clickable
    onclick={(i) => (currentStep = i)}
  />
-->
<script>
  let {
    steps = [],
    active = $bindable(0),
    variant = 'default',
    completed = [],
    clickable = false,
    onclick = null,
    class: className = ''
  } = $props();

  function getStatus(index) {
    if (completed.includes(index)) return 'completed';
    if (index === active) return 'current';
    return 'pending';
  }

  function handleClick(index) {
    const status = getStatus(index);
    if (status === 'completed' && clickable) {
      active = index;
      onclick?.(index);
    }
  }

  function isClickable(index) {
    return clickable && getStatus(index) === 'completed';
  }
</script>

<div class="stepper stepper-{variant} {className}" role="list">
  {#each steps as step, index}
    {@const status = getStatus(index)}
    {@const clickableStep = isClickable(index)}

    <div class="stepper-item stepper-item-{status}" role="listitem">
      <!-- Step button -->
      <button
        type="button"
        class="stepper-step"
        disabled={!clickableStep}
        aria-current={status === 'current' ? 'step' : undefined}
        aria-label="{step.label}{status === 'completed' ? ' (completed)' : status === 'current' ? ' (current)' : ' (pending)'}"
        onclick={() => handleClick(index)}
      >
        <!-- Indicator circle -->
        <span class="stepper-indicator" aria-hidden="true">
          {#if status === 'completed'}
            <!-- Checkmark SVG -->
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7L5.5 10L11.5 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {:else if status === 'current'}
            <!-- Clock/progress SVG -->
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 4.5V7L8.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <span class="stepper-number">{index + 1}</span>
          {/if}
        </span>

        <!-- Step content -->
        <span class="stepper-content">
          <span class="stepper-label">{step.label}</span>
          {#if step.description && variant !== 'compact'}
            <span class="stepper-description">{step.description}</span>
          {/if}
        </span>
      </button>

      <!-- Connector (not after last step) -->
      {#if index < steps.length - 1}
        <span
          class="stepper-connector"
          class:stepper-connector-completed={status === 'completed'}
          aria-hidden="true"
        >
          {#if variant !== 'vertical'}
            <!-- Chevron right SVG for horizontal -->
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </span>
      {/if}
    </div>
  {/each}
</div>

<style>
  /* ---- Container ---- */
  .stepper {
    display: flex;
    align-items: center;
    gap: 0;
    width: 100%;
  }

  .stepper-vertical {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    width: auto;
  }

  /* ---- Item ---- */
  .stepper-item {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .stepper-item:last-child {
    flex: 0 0 auto;
  }

  .stepper-vertical .stepper-item {
    flex-direction: column;
    align-items: flex-start;
    flex: 0 0 auto;
  }

  /* ---- Step button ---- */
  .stepper-step {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    cursor: default;
    text-align: left;
    font-family: inherit;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .stepper-step:disabled {
    cursor: default;
  }

  .stepper-vertical .stepper-step {
    width: 100%;
  }

  /* Clickable completed steps */
  .stepper-item-completed .stepper-step:not([disabled]) {
    cursor: pointer;
  }

  .stepper-item-completed .stepper-step:not([disabled]):hover {
    background: color-mix(in srgb, var(--color-base02) 60%, transparent);
  }

  .stepper-step:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  /* ---- Indicator circle ---- */
  .stepper-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-full);
    border: var(--border-width-default) solid var(--color-base03);
    background: var(--color-base00);
    color: var(--color-base04);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium, 500);
    transition:
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .stepper-item-completed .stepper-indicator {
    background: color-mix(in srgb, var(--color-base0B) 20%, transparent);
    border-color: var(--color-base0B);
    color: var(--color-base0B);
  }

  .stepper-item-current .stepper-indicator {
    background: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    border-color: var(--color-base0D);
    color: var(--color-base0D);
  }

  .stepper-number {
    line-height: 1;
  }

  /* ---- Content ---- */
  .stepper-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .stepper-label {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-base04);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .stepper-item-current .stepper-label {
    color: var(--color-base06);
  }

  .stepper-item-completed .stepper-label {
    color: var(--color-base05);
  }

  .stepper-description {
    font-size: var(--text-xs);
    color: var(--color-base03);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: var(--leading-tight);
  }

  /* ---- Connector ---- */
  .stepper-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--color-base03);
    transition: color var(--duration-fast) var(--ease-out);
    padding: 0 var(--space-2);
  }

  .stepper-connector-completed {
    color: var(--color-base0B);
  }

  /* Vertical connector — a line instead of chevron */
  .stepper-vertical .stepper-connector {
    flex: 0 0 auto;
    width: auto;
    justify-content: flex-start;
    padding: 0 0 0 calc(0.875rem + var(--space-3)); /* align with indicator center */
    height: var(--space-8);
    overflow: hidden;
  }

  .stepper-vertical .stepper-connector::before {
    content: '';
    display: block;
    width: var(--border-width-default);
    height: 100%;
    background: var(--color-base03);
    border-radius: var(--radius-full);
    transition: background-color var(--duration-fast) var(--ease-out);
  }

  .stepper-vertical .stepper-connector-completed::before {
    background: var(--color-base0B);
  }

  /* Hide the chevron SVG inside vertical connectors */
  .stepper-vertical .stepper-connector svg {
    display: none;
  }

  /* ---- Compact variant ---- */
  .stepper-compact .stepper-step {
    gap: var(--space-2);
    padding: var(--space-1) var(--space-2);
  }

  .stepper-compact .stepper-indicator {
    width: 1.5rem;
    height: 1.5rem;
    border-width: var(--border-width-thin);
  }

  .stepper-compact .stepper-label {
    font-size: var(--text-xs);
  }

  .stepper-compact .stepper-connector {
    padding: 0 var(--space-1);
  }
</style>
