<!--
  @component Badge

  Status tag with semantic color variants, optional indicator dot, and icon support.

  @example Basic
  <Badge>Default</Badge>
  <Badge variant="success">Active</Badge>
  <Badge variant="error" size="sm">3 failed</Badge>

  @example With label shorthand
  <Badge variant="warning" label="Pending" />

  @example With indicator dot
  <Badge variant="success" indicator>Connected</Badge>

  @example With inline icon
  <Badge variant="primary">
    <CheckIcon size={12} /> Verified
  </Badge>

  @example Solid, over media
  <Badge variant="success" tone="solid">Shopify</Badge>
  <Badge tone="solid">+2</Badge>
-->
<script>
  let {
    children,
    label = '',
    variant = 'default',
    size = 'md',
    tone = 'tinted',
    indicator = false,
    class: className = '',
    onclick,
    ...rest
  } = $props();

  const isInteractive = $derived(!!onclick);
</script>

{#if isInteractive}
  <button
    type="button"
    class="jera-badge jera-badge-{variant} jera-badge-{size} jera-badge-tone-{tone} {className}"
    {onclick}
    {...rest}
  >
    {#if indicator}
      <span class="badge-indicator"></span>
    {/if}
    {#if children}
      {@render children()}
    {:else if label}
      {label}
    {/if}
  </button>
{:else}
  <span
    class="jera-badge jera-badge-{variant} jera-badge-{size} jera-badge-tone-{tone} {className}"
    {...rest}
  >
    {#if indicator}
      <span class="badge-indicator"></span>
    {/if}
    {#if children}
      {@render children()}
    {:else if label}
      {label}
    {/if}
  </span>
{/if}

<style>
  .jera-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-weight: 500;
    border-radius: var(--radius-sm);
    border: var(--border-width-thin) solid;
    white-space: nowrap;
    line-height: 1;
    transition: background var(--duration-fast) ease, border-color var(--duration-fast) ease;
  }

  /* Sizes */
  .jera-badge-xs {
    padding: 0.0625rem 0.375rem;
    font-size: 0.625rem;
  }

  .jera-badge-sm {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .jera-badge-md {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .jera-badge-lg {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Variants — 10% bg, 30% border */
  .jera-badge-default {
    background: color-mix(in srgb, var(--color-base04) 10%, transparent);
    color: var(--color-base04);
    border-color: color-mix(in srgb, var(--color-base04) 30%, transparent);
  }

  .jera-badge-primary {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }

  .jera-badge-secondary {
    background: color-mix(in srgb, var(--color-base0C) 10%, transparent);
    color: var(--color-base0C);
    border-color: color-mix(in srgb, var(--color-base0C) 30%, transparent);
  }

  .jera-badge-success {
    background: color-mix(in srgb, var(--color-base0B) 10%, transparent);
    color: var(--color-base0B);
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
  }

  .jera-badge-warning {
    background: color-mix(in srgb, var(--color-base0A) 10%, transparent);
    color: var(--color-base0A);
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
  }

  .jera-badge-error {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    color: var(--color-base08);
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
  }

  .jera-badge-info {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }

  .jera-badge-accent {
    background: color-mix(in srgb, var(--color-base0E) 10%, transparent);
    color: var(--color-base0E);
    border-color: color-mix(in srgb, var(--color-base0E) 30%, transparent);
  }

  /* Tone. Appended after the variants so `tinted` — still the default — keeps
     rendering byte-identical for existing consumers. `solid` is the
     over-media tone: on a photo the 10% tint is the photo, so the fill is the
     full accent instead and the text is the app background (the house rule,
     same pairing as FilterChip's count pill). Base07 would be wrong here — it
     is the *darkest* gray in the light theme and lands at 1.7–3.9:1 on the
     cool accents there. The 1px shadow separates the pill from a busy image;
     it rides the tone so no consumer has to re-add it. */
  .jera-badge-tone-solid {
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
  }

  /* Neutral solid = scrim pill: the app background at 80%, primary text, a
     half-strength border and a blur behind, for source + neutral states. */
  .jera-badge-tone-solid.jera-badge-default,
  .jera-badge-tone-solid.jera-badge-secondary {
    background: color-mix(in srgb, var(--color-base00) 80%, transparent);
    color: var(--color-base05);
    border-color: color-mix(in srgb, var(--color-base03) 50%, transparent);
    backdrop-filter: blur(4px);
  }

  .jera-badge-tone-solid.jera-badge-primary,
  .jera-badge-tone-solid.jera-badge-info {
    background: var(--color-base0D);
    color: var(--color-base00);
    border-color: var(--color-base0D);
  }

  .jera-badge-tone-solid.jera-badge-success {
    background: var(--color-base0B);
    color: var(--color-base00);
    border-color: var(--color-base0B);
  }

  .jera-badge-tone-solid.jera-badge-warning {
    background: var(--color-base0A);
    color: var(--color-base00);
    border-color: var(--color-base0A);
  }

  .jera-badge-tone-solid.jera-badge-error {
    background: var(--color-base08);
    color: var(--color-base00);
    border-color: var(--color-base08);
  }

  .jera-badge-tone-solid.jera-badge-accent {
    background: var(--color-base0E);
    color: var(--color-base00);
    border-color: var(--color-base0E);
  }

  /* Light theme, yellow and green only: those two accents sit mid-lightness
     (L 0.62 / 0.55), where app-background text measures 3.6:1 / 4.4:1 — the
     darkest gray measures 5.7:1 / 4.7:1. Verified in Chrome 2026-09-30 against
     the rendered pixels of every variant; red/orange/cyan/indigo/violet all
     clear 4.5:1 with the app background. Same pattern as LeftBarItem's
     light-mode override. */
  :global([data-theme='miozu-light']) .jera-badge-tone-solid.jera-badge-warning,
  :global([data-theme='miozu-light']) .jera-badge-tone-solid.jera-badge-success {
    color: var(--color-base07);
  }

  /* Indicator dot */
  .badge-indicator {
    display: inline-block;
    flex-shrink: 0;
    border-radius: var(--radius-full);
    background: currentColor;
  }

  .jera-badge-xs .badge-indicator {
    width: 5px;
    height: 5px;
  }

  .jera-badge-sm .badge-indicator {
    width: 6px;
    height: 6px;
  }

  .jera-badge-md .badge-indicator {
    width: 7px;
    height: 7px;
  }

  .jera-badge-lg .badge-indicator {
    width: 8px;
    height: 8px;
  }

  /* Interactive (button) */
  button.jera-badge {
    cursor: pointer;
    font: inherit;
  }

  button.jera-badge:hover {
    opacity: 0.85;
  }

  button.jera-badge:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }
</style>
