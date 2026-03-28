<!--
  @component ChecklistCard

  Sequential onboarding/setup checklist. Shows steps with done/current/future states.
  The "current" step (first incomplete) is visually highlighted with an optional action.
  Hides itself entirely when all steps are complete.

  @example Basic setup checklist
  <ChecklistCard
    title="Quick setup"
    steps={[
      { id: 'connect', label: 'Connect your store', done: true },
      { id: 'products', label: 'Sync products', done: false, href: '/catalog/', actionLabel: 'Import →' },
      { id: 'worker', label: 'Hire your first AI worker', done: false },
    ]}
  />

  @example With click handler
  <ChecklistCard
    title="Get started"
    steps={[
      { id: 'step1', label: 'Step one', done: true },
      { id: 'step2', label: 'Step two', done: false, onclick: handleStep, actionLabel: 'Do it →' },
    ]}
  />
-->
<script>
  let {
    title = 'Quick setup',
    steps = [],
    class: className = '',
    ...rest
  } = $props();

  const doneCount = $derived(steps.filter(s => s.done).length);
  const currentIndex = $derived(steps.findIndex(s => !s.done));
  const allDone = $derived(doneCount === steps.length && steps.length > 0);
</script>

{#if !allDone}
  <div class="checklist-card {className}" {...rest}>
    <div class="checklist-header">
      <span class="checklist-title">{title}</span>
      <span class="checklist-progress">{doneCount} of {steps.length} complete</span>
    </div>

    <ul class="checklist-steps" role="list">
      {#each steps as step, i (step.id)}
        {@const isDone = step.done}
        {@const isCurrent = i === currentIndex}
        {@const isFuture = !isDone && !isCurrent}
        <li
          class="step"
          class:step--done={isDone}
          class:step--current={isCurrent}
          class:step--future={isFuture}
        >
          <span class="step-icon" aria-hidden="true">
            {#if isDone}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" fill="currentColor" fill-opacity="0.15" />
                <path
                  d="M5 8.5l2.2 2.2L11 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            {:else if isCurrent}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="currentColor" stroke-width="1.5" />
                <circle cx="8" cy="8" r="2.75" fill="currentColor" />
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="currentColor" stroke-width="1.5" />
              </svg>
            {/if}
          </span>

          <span class="step-label">{step.label}</span>

          {#if isCurrent && step.href}
            <a class="step-action" href={step.href}>{step.actionLabel ?? 'Set up →'}</a>
          {:else if isCurrent && step.onclick}
            <button class="step-action" onclick={step.onclick}
              >{step.actionLabel ?? 'Set up →'}</button
            >
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .checklist-card {
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-sm);
    background: var(--color-base01);
  }

  /* ── Header ───────────────────────────────────────────────────────────── */
  .checklist-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-base02) 60%, transparent);
  }

  .checklist-title {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-base06);
  }

  .checklist-progress {
    font-size: var(--text-xs);
    color: var(--color-base04);
    font-variant-numeric: tabular-nums;
  }

  /* ── Steps ────────────────────────────────────────────────────────────── */
  .checklist-steps {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0;
  }

  .step + .step {
    border-top: 1px solid color-mix(in srgb, var(--color-base02) 40%, transparent);
  }

  /* Icon colors */
  .step--done .step-icon {
    color: var(--color-base0B);
  }
  .step--current .step-icon {
    color: var(--color-base0D);
  }
  .step--future .step-icon {
    color: var(--color-base03);
  }

  /* Label */
  .step-label {
    flex: 1;
    font-size: var(--text-sm);
    line-height: 1.4;
  }

  .step--done .step-label {
    color: var(--color-base04);
    text-decoration: line-through;
    text-decoration-color: var(--color-base03);
  }

  .step--current .step-label {
    color: var(--color-base06);
    font-weight: var(--font-weight-medium);
  }

  .step--future .step-label {
    color: var(--color-base03);
  }

  /* Action (link or button for current step) */
  .step-action {
    flex-shrink: 0;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-base0D);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius-sm);
    text-decoration: none;
    white-space: nowrap;
    transition: background 120ms;

    &:hover {
      background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    }
  }
</style>
