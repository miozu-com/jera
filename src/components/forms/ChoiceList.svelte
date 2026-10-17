<!--
  @component ChoiceList

  A titled list of choices, one row per item (thumbnail + label), in its own
  card. Two modes, one component:

  - `multi` (default): each row is a jera Checkbox. Tab and Space work
    natively (a list of checkboxes needs no roving focus); the `footer`
    snippet receives the count so a submit button can stay disabled until
    something is picked.
  - `none`: plain rows with the consumer's own per-row `actions` — for a
    one-click decision per row, where a shared checkbox and a submit button
    would add a step between the user and the obvious action.

  The selection is an array of keys (`key(item)`), governed by the same rules
  as ChoiceGrid (`choice.rules.js`): `min`, `max`, `disabled(item)`, and
  `onselect` returning false to veto. A refused pick never flips the box.

  @example Multi-pick with a footer
  <ChoiceList title="Choose files" {items} bind:selected maxHeight="16rem">
    {#snippet footer({ count })}
      <Button variant="ghost" size="sm" onclick={cancel}>Cancel</Button>
      <Button variant="primary" size="sm" disabled={count === 0} onclick={submit}>Use selected</Button>
    {/snippet}
  </ChoiceList>

  @example Per-row actions, no card chrome
  <ChoiceList bare framed mode="none" title="Which group?" {items} thumbSize={48}>
    {#snippet actions(item)}<Button size="sm" onclick={() => choose(item)}>Choose</Button>{/snippet}
  </ChoiceList>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import Checkbox from './Checkbox.svelte';
  import { toggleSelection, isBlocked } from './choice.rules.js';

  let {
    /** Heading of the list (names the list for assistive tech). */
    title = '',
    /** One quiet line under the title. */
    subtitle = '',
    /** Heading level of the title (2–6). */
    headingLevel = 2,
    /** The choices (keep the array `$state.raw` in the consumer). */
    items = [],
    /** (item) => unique key. */
    key = (item) => item?.key ?? item,
    /** (item) => row text. */
    label = (item) => item?.label ?? '',
    /** (item) => true makes the row's checkbox unavailable. */
    disabled = () => false,
    /** 'multi' (checkbox rows) or 'none' (plain rows with actions). */
    mode = 'multi',
    /** Picked keys (bindable). */
    selected = $bindable([]),
    /** Fewest picks that may remain. */
    min = 0,
    /** Most picks allowed; unpicked rows become unavailable once reached. */
    max = Infinity,
    /** Thumbnail square size in px (rendered in rem). */
    thumbSize = 40,
    /** Bordered, padded rows. */
    framed = false,
    /** CSS length — the rows scroll past it instead of growing the card. */
    maxHeight = null,
    /** No card chrome (border, background, padding) — when a host card already draws it. */
    bare = false,
    /** (item, next) — before the write; return false to veto. */
    onselect,
    /** (next) — after the write. */
    onchange,
    /** snippet(item) — the row's leading visual; default: <img src={item.src}> when given. */
    leading,
    /** snippet(item) — replaces the row text. */
    rowLabel,
    /** snippet(item) — per-row actions (mode 'none'). */
    actions,
    /** snippet({selected, count}) — the card's bottom actions row. */
    footer,
    class: className = '',
    ...rest
  } = $props();

  const uid = $props.id();
  const titleId = `${uid}-title`;
  const level = $derived(Math.min(6, Math.max(2, Math.round(headingLevel) || 2)));

  function isOn(item) {
    return selected.includes(key(item));
  }

  function unavailable(item) {
    return disabled(item) || isBlocked(selected, key(item), { mode: 'multi', max });
  }

  /** The checkbox's click: refuse (preventDefault keeps the box as it was) or write. */
  function onrowclick(event, item) {
    const { next, changed } = toggleSelection(selected, key(item), { mode: 'multi', min, max });
    if (!changed || onselect?.(item, next) === false) {
      event.preventDefault();
      return;
    }
    selected = next;
    onchange?.(next);
  }
</script>

{#snippet thumb(item)}
  {#if leading}
    {@render leading(item)}
  {:else if typeof item?.src === 'string'}
    <img class="choice-thumb" src={item.src} alt="" width={thumbSize} height={thumbSize}
      loading="lazy" decoding="async" />
  {/if}
{/snippet}

{#snippet text(item)}
  {#if rowLabel}
    {@render rowLabel(item)}
  {:else if label(item)}
    <span class="choice-label">{label(item)}</span>
  {/if}
{/snippet}

<div
  class={cn('choice-list', bare && 'choice-list--bare', className)}
  style:--choice-thumb="{thumbSize / 16}rem"
  {...rest}
>
  {#if title || subtitle}
    <div class="choice-head">
      {#if title}
        <svelte:element this={`h${level}`} id={titleId} class="choice-title">{title}</svelte:element>
      {/if}
      {#if subtitle}<p class="choice-subtitle">{subtitle}</p>{/if}
    </div>
  {/if}

  <ul
    class="choice-rows"
    class:choice-rows--framed={framed}
    class:choice-rows--scroll={maxHeight}
    style:max-height={maxHeight}
    aria-labelledby={title ? titleId : undefined}
  >
    {#each items as item (key(item))}
      <li class="choice-row" class:choice-row--framed={framed}>
        {#if mode === 'multi'}
          <Checkbox
            class="choice-check"
            checked={isOn(item)}
            disabled={!isOn(item) && unavailable(item)}
            onclick={(event) => onrowclick(event, item)}
          >
            <span class="choice-body">
              {@render thumb(item)}
              {@render text(item)}
            </span>
          </Checkbox>
        {:else}
          {@render thumb(item)}
          <div class="choice-main">
            {@render text(item)}
            {#if actions}
              <div class="choice-actions">{@render actions(item)}</div>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  {#if footer}
    <div class="choice-footer">
      {@render footer({ selected, count: selected.length })}
    </div>
  {/if}
</div>

<style>
  .choice-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-width: 0;
    padding: var(--space-6);
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
  }

  .choice-list--bare {
    padding: 0;
    background: none;
    border: none;
    border-radius: 0;
  }

  .choice-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .choice-title {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    line-height: var(--leading-snug);
    color: var(--color-base05);
  }

  .choice-subtitle {
    margin: 0;
    font-size: var(--text-xs);
    line-height: var(--leading-normal);
    color: var(--color-base04);
  }

  .choice-rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .choice-rows--framed {
    gap: var(--space-5);
  }

  .choice-rows--scroll {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .choice-row {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    min-width: 0;
  }

  .choice-row--framed {
    align-items: flex-start;
    padding: var(--space-4);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
  }

  .choice-row :global(.choice-check) {
    min-width: 0;
    max-width: 100%;
  }

  .choice-row :global(.choice-check .checkbox-label) {
    min-width: 0;
  }

  .choice-body {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    min-width: 0;
  }

  .choice-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .choice-thumb,
  .choice-row :global(.choice-thumb) {
    flex: none;
    width: var(--choice-thumb);
    height: var(--choice-thumb);
    object-fit: cover;
    background-color: var(--color-base01);
    border-radius: var(--radius-default);
  }

  .choice-label {
    font-size: var(--text-dense);
    line-height: var(--leading-snug);
    color: var(--color-base05);
  }

  .choice-body .choice-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .choice-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .choice-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-4);
  }
</style>
