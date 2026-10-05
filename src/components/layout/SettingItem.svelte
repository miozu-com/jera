<!--
  @component SettingItem
  One setting: its label, what it does, and the control that changes it.

  `stacked` puts the control on a full-width row under the text. A Select,
  Input or Textarea cannot share a ~430px row with a description — the panel
  they are mostly rendered in is 369–480px wide on a desktop — so the choice is
  the row's, not the viewport's.

  Inside a SettingCard the row also asks the CARD's width (a container query),
  not the viewport's: a card in a narrow pane on a wide screen used to stay
  side-by-side because only `@media` decided.
-->
<script>
  let {
    label = '',
    description = '',
    stacked = false,
    leading,
    action,
    class: className = ''
  } = $props();
</script>

<div
  class="setting-item {className}"
  class:has-leading={leading}
  class:setting-item-stacked={stacked}
>
  {#if leading}
    <div class="setting-leading">
      {@render leading()}
    </div>
  {/if}
  <div class="setting-content">
    {#if label}
      <h4 class="setting-label">{label}</h4>
    {/if}
    {#if description}
      <p class="setting-description">{description}</p>
    {/if}
  </div>
  {#if action}
    <div class="setting-action">
      {@render action()}
    </div>
  {/if}
</div>

<style>
  /* Wraps: a wide action (chips + badge + switch) drops onto its own line
     instead of crushing the label to one word per line. The content column
     asks for 14rem before it gives way; below that the action wraps. */
  .setting-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3) var(--space-8);
    padding: var(--space-8) 0;
    border-bottom: 1px solid var(--color-base02);
  }

  .setting-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .setting-item:first-child {
    padding-top: 0;
  }

  /* With an icon: a grid, so the icon centres on the label + description
     block (row 1) and a stacked control takes the full row below it — the
     icon never lines up with a two-line text block's first line only, nor
     with the middle of a tall control. */
  .has-leading {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--space-4);
    row-gap: var(--space-4);
  }

  .has-leading > .setting-leading {
    grid-column: 1;
    grid-row: 1;
  }

  .has-leading > .setting-content {
    grid-column: 2;
    grid-row: 1;
  }

  .has-leading > .setting-action {
    grid-column: 3;
    grid-row: 1;
    margin-left: 0;
  }

  .has-leading.setting-item-stacked > .setting-action {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  /* One mark app-wide: a soft accent tile sized to the label + description
     (2.25rem), the icon 18px inside it. Colour from the theme, so it reads in
     both light and dark. */
  .setting-leading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-md);
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    flex-shrink: 0;
  }

  .setting-leading :global(svg) {
    width: 1.125rem;
    height: 1.125rem;
  }

  .setting-content {
    flex: 1 1 14rem;
    min-width: 0;
  }

  .setting-label {
    margin: 0 0 0.125rem;
    font-size: var(--text-sm);
    line-height: 1.25rem;
    font-weight: 600;
    color: var(--color-base06);
  }

  .setting-description {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
    line-height: 1.5;
  }

  /* `margin-left: auto` keeps a wrapped action on the right, where it sits
     when the row fits on one line. */
  .setting-action {
    flex-shrink: 0;
    margin-left: auto;
  }

  /* Stacked: the control wraps onto a row of its own and takes all of it. */
  .setting-item-stacked {
    flex-wrap: wrap;
  }

  .setting-item-stacked .setting-action {
    flex: 1 1 100%;
    min-width: 0;
  }

  .setting-item-stacked .setting-action > :global(*) {
    width: 100%;
  }

  /* Narrow viewport (consumers outside a card). */
  @media (max-width: 640px) {
    .setting-item:not(.has-leading):not(.setting-item-stacked) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-6);
    }
  }

  /* Narrow CARD (SettingCard's content is a size container). 360px, not 640:
     the row is asked about its own box, and a 400px card holds a label, a
     description and a switch side by side without trouble. */
  @container (max-width: 360px) {
    .setting-item:not(.has-leading):not(.setting-item-stacked) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-6);
    }
  }
</style>
