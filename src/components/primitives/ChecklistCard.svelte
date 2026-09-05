<!--
  @component ChecklistCard

  Sequential onboarding/setup checklist. Shows steps with done/current/future states.
  The "current" step (first incomplete) is visually highlighted; when it has an href or
  onclick the WHOLE row is the click target and the action chip sits right after the
  label — never right-aligned, so it stays next to its label on wide viewports.
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
  let {title = 'Quick setup', steps = [], class: className = '', ...rest} = $props();

  const doneCount = $derived(steps.filter(s => s.done).length);
  const currentIndex = $derived(steps.findIndex(s => !s.done));
  const allDone = $derived(doneCount === steps.length && steps.length > 0);
</script>

{#snippet icon(isDone, isCurrent)}
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
{/snippet}

{#snippet row(step, isDone, isCurrent, withAction)}
  {@render icon(isDone, isCurrent)}
  <span class="step-label">{step.label}</span>
  {#if withAction}
    <span class="step-action">{step.actionLabel ?? 'Set up →'}</span>
  {/if}
{/snippet}

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
        {@const interactive = isCurrent && (step.href || step.onclick)}
        <li
          class="step"
          class:step--done={isDone}
          class:step--current={isCurrent}
          class:step--future={isFuture}
        >
          <!-- The whole current row is the target: a right-aligned link is
               unfindable on a wide card, and the row is what the eye lands on. -->
          {#if interactive && step.href}
            <a class="step-row step-row--interactive" href={step.href}>
              {@render row(step, isDone, isCurrent, true)}
            </a>
          {:else if interactive}
            <button class="step-row step-row--interactive" type="button" onclick={step.onclick}>
              {@render row(step, isDone, isCurrent, true)}
            </button>
          {:else}
            <div class="step-row">
              {@render row(step, isDone, isCurrent, false)}
            </div>
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

  .step + .step {
    border-top: 1px solid color-mix(in srgb, var(--color-base02) 40%, transparent);
  }

  .step-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.5rem 0;
  }

  /* Interactive row: reset the a/button chrome, then bleed the hover surface
     0.5rem past the text column so the highlight has visible inset. */
  .step-row--interactive {
    margin-inline: -0.5rem;
    width: calc(100% + 1rem);
    padding-inline: 0.5rem;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background 120ms;

    &:hover {
      background: color-mix(in srgb, var(--color-base0D) 6%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--color-base0D);
      outline-offset: 2px;
    }
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

  /* Label — deliberately NOT flex: 1. Letting it grow would push the action
     chip to the far edge of a wide card, away from the label it belongs to. */
  .step-label {
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

  /* Action chip — sits right after the label inside the interactive row. It is
     presentational (the row is the control), styled as a small outlined chip so
     it reads as an action rather than a footnote. */
  .step-action {
    flex-shrink: 0;
    margin-inline-start: 0.25rem;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-base0D) 30%, transparent);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    transition:
      background 120ms,
      border-color 120ms;
  }

  .step-row--interactive:hover .step-action {
    background: color-mix(in srgb, var(--color-base0D) 14%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D) 45%, transparent);
  }
</style>
