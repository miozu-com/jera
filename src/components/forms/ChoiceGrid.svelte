<!--
  @component ChoiceGrid

  A grid of square choice tiles (photos, swatches, layouts) — pick one
  (`mode="single"`, an APG radio group) or several (`mode="multi"`, a group of
  checkboxes). Keyboard: one tab stop for the whole grid (roving tabindex),
  arrow keys move between tiles (Up/Down by a visual row), Home/End jump,
  Space/Enter toggle; in single mode an arrow also picks, as in a native radio
  group. Blocked tiles (`disabled(item)`, or unpicked once `max` is reached)
  stay focusable and announce as `aria-disabled`.

  The selection is an array of keys (`key(item)`). The rules live in
  `choice.rules.js` and are shared with ChoiceList. A consumer with a bespoke
  rule returns `false` from `onselect` to veto a pick.

  Name the group through rest props: `aria-labelledby` / `aria-label`.

  @example Image URLs, multi-pick up to 4, the last pick kept
  <ChoiceGrid items={urls} bind:selected={picked} min={1} max={4} aria-labelledby="refs-h" />

  @example One pick, a custom tile, and an add tile
  <ChoiceGrid mode="single" {items} key={(p) => p.id} bind:selected onadd={upload}>
    {#snippet tile(p)}<img src={p.thumb} alt="" />{/snippet}
    {#snippet addTile()}Upload{/snippet}
  </ChoiceGrid>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';
  import {
    toggleSelection,
    isBlocked,
    choiceKey,
    tabbableIndex,
    columnsFromTops,
  } from './choice.rules.js';

  let {
    /** The choices, one tile each (keep the array `$state.raw` in the consumer). */
    items = [],
    /** (item) => unique key; strings are their own key. */
    key = (item) => item,
    /** (item, index) => accessible name of a tile, or null for none. */
    label = (_item, index) => `Option ${index + 1}`,
    /** (item) => true renders the tile as not pickable (aria-disabled). */
    disabled = () => false,
    /** 'multi' (checkboxes) or 'single' (radio group). */
    mode = 'multi',
    /** Picked keys (bindable); single mode holds 0 or 1. */
    selected = $bindable([]),
    /** Fewest picks that may remain; defaults to 1 in single mode, 0 in multi. */
    min = undefined,
    /** Most picks allowed (multi mode). */
    max = Infinity,
    /** Floor of the tile track in the auto-fill grid. */
    tileMin = '4.5rem',
    /** Disable the add tile. */
    addDisabled = false,
    /** Accessible name of the add tile when its content is not text. */
    addLabel = undefined,
    /** (item, next) — before the write; return false to veto. */
    onselect,
    /** (next) — after the write. */
    onchange,
    /** () — the add tile was pressed. */
    onadd,
    /** snippet(item, {selected, disabled, index}) — tile content; default: <img src={item}>. */
    tile,
    /** snippet() — content of a dashed action tile after the choices. */
    addTile,
    class: className = '',
    ...rest
  } = $props();

  let group = $state(null);
  /** Index of the tile focus last landed on while inside the grid; -1 = none. */
  let active = $state(-1);

  const single = $derived(mode === 'single');
  const keys = $derived(items.map((item) => key(item)));
  const holder = $derived(
    active >= 0 && active < items.length ? active : tabbableIndex(items, selected, key)
  );

  function isOn(k) {
    return selected.includes(k);
  }

  function blockedAt(item, k) {
    return !isOn(k) && (disabled(item) || isBlocked(selected, k, { mode, max }));
  }

  function pick(index) {
    const item = items[index];
    if (item === undefined) return;
    const k = keys[index];
    if (blockedAt(item, k)) return;
    const { next, changed } = toggleSelection(selected, k, { mode, min, max });
    if (!changed) return;
    if (onselect?.(item, next) === false) return;
    selected = next;
    onchange?.(next);
  }

  function tiles() {
    return group ? [...group.querySelectorAll(':scope > [data-choice]')] : [];
  }

  function onkeydown(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const els = tiles();
    const columns = columnsFromTops(els.map((el) => el.offsetTop));
    const result = choiceKey(event.key, { index, count: items.length, columns, mode });
    if (result.action === 'none') return;
    event.preventDefault();
    if (result.action === 'toggle') {
      pick(index);
      return;
    }
    active = result.index;
    els[result.index]?.focus();
    if (result.select && !isOn(keys[result.index])) pick(result.index);
  }

  function onfocusout(event) {
    if (!group?.contains(event.relatedTarget)) active = -1;
  }
</script>

<div
  bind:this={group}
  class={cn('choice-grid', className)}
  style:--choice-tile-min={tileMin}
  role={single ? 'radiogroup' : 'group'}
  onfocusout={onfocusout}
  {...rest}
>
  {#each items as item, index (keys[index])}
    {@const on = isOn(keys[index])}
    {@const off = blockedAt(item, keys[index])}
    <button
      type="button"
      class="choice-tile"
      class:choice-tile--on={on}
      data-choice
      role={single ? 'radio' : 'checkbox'}
      aria-checked={on}
      aria-disabled={off ? 'true' : undefined}
      aria-label={label(item, index) ?? undefined}
      tabindex={index === holder ? 0 : -1}
      onclick={() => pick(index)}
      onfocus={() => (active = index)}
      onkeydown={(event) => onkeydown(event, index)}
    >
      {#if tile}
        {@render tile(item, { selected: on, disabled: off, index })}
      {:else}
        <img src={String(item)} alt="" loading="lazy" decoding="async" />
      {/if}
      {#if on}
        <span class="choice-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
      {/if}
    </button>
  {/each}
  {#if addTile}
    <button
      type="button"
      class="choice-tile choice-add"
      disabled={addDisabled}
      aria-label={addLabel}
      onclick={() => onadd?.()}
    >
      {@render addTile()}
    </button>
  {/if}
</div>

<style>
  .choice-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--choice-tile-min), 1fr));
    gap: var(--space-4);
  }

  .choice-tile {
    position: relative;
    aspect-ratio: 1 / 1;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    font: inherit;
    color: inherit;
    background-color: var(--color-base01);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
    outline: var(--focus-ring-width, 2px) solid transparent;
    outline-offset: var(--focus-ring-offset, 2px);
    cursor: pointer;
  }

  .choice-tile:hover:not([aria-disabled='true']):not(:disabled) {
    border-color: var(--color-base03);
  }

  .choice-tile:focus-visible,
  .choice-tile--on {
    outline-color: var(--color-base0D);
  }

  .choice-tile[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .choice-tile :global(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .choice-check {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    display: inline-flex;
    width: 1.125rem;
    height: 1.125rem;
    padding: var(--space-1);
    color: var(--color-base00);
    background-color: var(--color-base0D);
    border-radius: var(--radius-full);
    /* A ring in the page colour keeps the badge readable on any tile. */
    box-shadow: 0 0 0 var(--focus-ring-width, 2px) var(--color-base00);
  }

  .choice-check svg {
    width: 100%;
    height: 100%;
  }

  .choice-add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3);
    font-size: var(--text-xs);
    line-height: var(--leading-tight);
    text-align: center;
    color: var(--color-base04);
    background-color: transparent;
    border-style: dashed;
    border-color: var(--color-base03);
  }

  .choice-add:hover:not(:disabled) {
    color: var(--color-base05);
    border-color: var(--color-base04);
  }

  .choice-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
