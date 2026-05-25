<!--
  @component CardRadioGroup

  A single-choice radio group rendered as a stack of cards. Each option gets
  its own card with a bold title and an optional descriptive paragraph
  explaining what the choice means — much clearer than a native select
  dropdown when picking one of N options with non-obvious consequences
  (roles, plans, permissions, modes).

  Selected card highlights with a primary-color border + tinted background
  + a filled dot indicator. Underneath, real `<input type="radio">` inputs
  keep form semantics, keyboard navigation (Tab + arrow keys + Space), and
  accessibility intact.

  @example Picking a role
  <CardRadioGroup
    name="role"
    bind:value={role}
    options={[
      {value: 'admin', title: 'Admin', description: 'Full access except billing.'},
      {value: 'member', title: 'Member', description: 'Read and edit content.'},
      {value: 'viewer', title: 'Viewer', description: 'Read-only access.'}
    ]}
  />

  @example Without descriptions
  <CardRadioGroup
    name="plan"
    bind:value={plan}
    options={[{value: 'monthly', title: 'Monthly'}, {value: 'annual', title: 'Annual (save 20%)'}]}
  />
-->
<script>
  let {
    value = $bindable(null),
    name = '',
    /** Array of `{value, title, description?}`. value is the form-submitted value. */
    options = [],
    /** Make the entire group read-only / disabled. */
    disabled = false,
    /** Stack direction: 'vertical' (default) or 'horizontal'. */
    orientation = 'vertical',
    /** Visual size: 'sm' | 'md' (default). */
    size = 'md',
    /** Accessible group label for screen readers (set if no <legend>). */
    'aria-label': ariaLabel = '',
    onchange,
    class: className = ''
  } = $props();

  function select(v) {
    if (disabled) return;
    if (v === value) return;
    value = v;
    onchange?.({target: {name, value: v}});
  }
</script>

<div
  class="cardradio-group cardradio-{orientation} cardradio-{size} {className}"
  role="radiogroup"
  aria-label={ariaLabel || undefined}
  aria-disabled={disabled || undefined}
>
  {#each options as opt (opt.value)}
    {@const checked = value === opt.value}
    <label
      class="cardradio-card"
      class:cardradio-selected={checked}
      class:cardradio-disabled={disabled || opt.disabled}
    >
      <input
        type="radio"
        {name}
        value={opt.value}
        {checked}
        disabled={disabled || opt.disabled}
        onchange={() => select(opt.value)}
      />
      <div class="cardradio-body">
        <div class="cardradio-head">
          <span class="cardradio-title">{opt.title}</span>
          {#if checked}
            <span class="cardradio-dot" aria-hidden="true"></span>
          {/if}
        </div>
        {#if opt.description}
          <div class="cardradio-desc">{opt.description}</div>
        {/if}
      </div>
    </label>
  {/each}
</div>

<style>
  .cardradio-group {
    display: grid;
    gap: 6px;
  }
  .cardradio-horizontal {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  .cardradio-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--color-base02);
    background: var(--color-base00);
    border-radius: var(--radius-default);
    cursor: pointer;
    transition:
      border-color 0.12s,
      background-color 0.12s;
    color: var(--color-base06);
  }
  .cardradio-sm .cardradio-card {
    padding: 8px 10px;
  }
  .cardradio-card:hover {
    border-color: var(--color-base03);
    background: color-mix(in srgb, var(--color-base0D) 4%, var(--color-base00));
  }
  .cardradio-card:has(input:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-base0D) 40%, transparent);
  }
  .cardradio-selected {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 8%, var(--color-base00));
  }
  .cardradio-selected:hover {
    background: color-mix(in srgb, var(--color-base0D) 12%, var(--color-base00));
  }
  .cardradio-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Visually hide the native radio; the card itself is the target. */
  .cardradio-card input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    opacity: 0;
    pointer-events: none;
  }

  .cardradio-body {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 4px;
  }
  .cardradio-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .cardradio-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-base06);
  }
  .cardradio-sm .cardradio-title {
    font-size: 12px;
  }
  .cardradio-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-base0D);
    position: relative;
    flex-shrink: 0;
  }
  .cardradio-dot::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: var(--color-base00);
  }
  .cardradio-desc {
    font-size: 12px;
    color: var(--color-base04);
    line-height: 1.45;
  }
</style>
