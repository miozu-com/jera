<!-- file-size: justified -- one widget: the APG combobox's input wiring, popup, dismiss handling and the multiple mode's chips share one open/active/values state; the key and debounce decisions are already split into combobox.rules.js, and the rest is CSS. -->
<!--
  @component Combobox

  A search field with a list of results under it, for "search a big remote
  list" (marketplace category trees, suppliers, products): the consumer owns
  the data — it fetches on `onquery` and passes `items` back — and this owns
  the shell: SearchInput, the listbox popup, keyboard, focus and dismiss.

  WAI-ARIA APG combobox with a listbox popup, "list autocomplete": focus never
  leaves the input; the active option is `aria-activedescendant`. ArrowDown
  opens a closed list (`onopen`) or moves down; ArrowUp moves up; Enter picks;
  Escape on an open list closes it and keeps the text (handled in the capture
  phase, before SearchInput's own Escape-clears), a second Escape clears; a
  press outside (jera `clickOutside`) or focus leaving the field closes it.
  The key decisions live in `combobox.rules.js` (tested without a DOM).

  `onpick(item)` closes the list unless it returns `false` synchronously —
  keep it open to browse into a branch (the consumer swaps `items`).

  `multiple` (chips): picks accumulate in the bindable `values` and show as
  chips inside the field's frame (a `role="group"` labelled `chipLabel`); the
  field clears after each pick and the list stays open. Picking an option that
  is already a chip removes it (its row carries the check). Backspace in an
  empty field removes the last chip. At `max` chips a pick is refused
  (`onrefuse('max')`) and the field goes readonly. With `allowCustom`, Enter
  on typed text and no option to pick adds what `oncustom(text)` returns
  (`false` adds nothing). Enter while typed text is still in the debounce or
  `loading` never picks the older list's first option: it adds the text
  (`allowCustom`) or does nothing — so set `loading` while a query is out. `onpick` fires for every pick; in multiple mode
  returning `false` vetoes it. A `chip(entry, remove)` snippet replaces the
  default chip (label + remove button). `value` is ignored in multiple mode.

  @example
  <Combobox bind:query bind:open {items} {loading} value={picked?.id}
    label="Categories" onquery={search} onopen={() => search('')}
    onpick={(node) => (picked = node)}>
    {#snippet item(node, active)}{node.name}{/snippet}
  </Combobox>

  @example Multiple
  <Combobox multiple bind:values bind:query {items} max={4} allowCustom
    getKey={(m) => m.key ?? m.label} label="Material" chipLabel="Materials"
    onquery={search} oncustom={(text) => ({ key: null, label: text })} />
-->
<script>
  import SearchInput from './SearchInput.svelte';
  import { clickOutside } from '../../actions/index.js';
  import { cn } from '../../utils/cn.svelte.js';
  import {
    comboboxKey,
    multipleKey,
    hasEntry,
    createQueryDebouncer,
    resultsMessage
  } from './combobox.rules.js';

  let {
    query = $bindable(''),
    open = $bindable(false),
    items = [],
    getKey = (entry) => entry?.id ?? entry?.value,
    value = null,
    loading = false,
    placeholder = 'Search…',
    size = 'sm',
    disabled = false,
    id = undefined,
    label = undefined,
    debounce = 250,
    inputEl = $bindable(null),
    class: className = '',
    item: itemSnippet = undefined,
    empty = undefined,
    header = undefined,
    onquery = undefined,
    onpick = undefined,
    onopen = undefined,
    ondismiss = undefined,
    multiple = false,
    values = $bindable([]),
    getLabel = (entry) => entry?.label ?? entry?.name ?? '',
    max = Infinity,
    allowCustom = false,
    chipLabel = 'Selected',
    chip: chipSnippet = undefined,
    onadd = undefined,
    onremove = undefined,
    oncustom = undefined,
    onrefuse = undefined,
    ...rest
  } = $props();

  const uid = $props.id();
  const listboxId = `${uid}-listbox`;
  const optionId = (index) => `${uid}-option-${index}`;

  /** @type {HTMLElement | null} */
  let rootEl = $state(null);
  /** @type {HTMLElement | null} */
  let listEl = $state(null);

  // Overridable derived: a new `items` array (or opening/closing) resets the
  // active option to the first; the keyboard and the pointer move it between.
  let active = $derived(open && items.length > 0 ? 0 : -1);

  const showEmpty = $derived(!loading && items.length === 0);
  const popupVisible = $derived(
    open && !disabled && (items.length > 0 || showEmpty || Boolean(header))
  );
  const activeId = $derived(popupVisible && active >= 0 ? optionId(active) : undefined);

  // Multiple mode: `values` is the chip list; `full` refuses further picks.
  const chips = $derived(multiple && Array.isArray(values) ? values : []);
  const full = $derived(multiple && chips.length >= max);
  const isSelected = (entry) =>
    multiple ? hasEntry(chips, entry, getKey) : value != null && getKey(entry) === value;

  const debouncer = createQueryDebouncer(
    (text) => onquery?.(text),
    () => debounce
  );
  $effect(() => () => debouncer.cancel());

  // Polite live region: the count, once the list has settled for a moment —
  // typing toggles `loading` on every keystroke, and an announcement per
  // keystroke is noise. An unchanged sentence is not re-read.
  let announcement = $state('');
  $effect(() => {
    if (!open || disabled) {
      announcement = '';
      return;
    }
    if (loading) return;
    const message = resultsMessage(items.length);
    const timer = setTimeout(() => (announcement = message), 400);
    return () => clearTimeout(timer);
  });

  function openList() {
    if (open || disabled) return;
    open = true;
    onopen?.();
  }

  /** Close without picking (Escape, a press outside, focus leaving). */
  function dismiss() {
    if (!open) return;
    open = false;
    ondismiss?.();
  }

  function pick(entry) {
    if (entry === undefined) return;
    if (multiple) return pickMany(entry);
    const keepOpen = onpick?.(entry) === false;
    if (!keepOpen) open = false;
  }

  /** The field empties after a chip change and the consumer is told at once
      (it swaps in its default list); the list stays open. */
  function resetQuery() {
    query = '';
    debouncer.push('');
  }

  function addEntry(entry) {
    values = [...chips, entry];
    onadd?.(entry);
  }

  function removeEntry(entry) {
    if (entry === undefined) return;
    const key = getKey(entry);
    values = chips.filter((v) => getKey(v) !== key);
    onremove?.(entry);
  }

  /** Multiple mode: a picked chip toggles off; a new one is added under `max`. */
  function pickMany(entry) {
    const selected = hasEntry(chips, entry, getKey);
    if (!selected && full) {
      onrefuse?.('max');
      return;
    }
    if (onpick?.(entry) === false) return;
    if (selected) removeEntry(entry);
    else addEntry(entry);
    resetQuery();
  }

  function addCustom(text) {
    if (full) {
      onrefuse?.('max');
      return;
    }
    const entry = oncustom?.(text.trim());
    if (!entry) return;
    if (!hasEntry(chips, entry, getKey)) addEntry(entry);
    resetQuery();
  }

  /** A chip's remove button: the field keeps focus, the chip goes. */
  function removeChip(entry) {
    removeEntry(entry);
    refocus();
  }

  /** A press on the frame outside the field and the chips' buttons must not
      take focus from the field (a chip is not a control). */
  function onFrameMousedown(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    if (target === inputEl || target.closest?.('button')) return;
    e.preventDefault();
    if (!disabled && inputEl && document.activeElement !== inputEl) inputEl.focus();
  }

  /** Focus back to the field without that focus reading as "open the list". */
  let refocusing = false;
  function refocus() {
    if (!inputEl || document.activeElement === inputEl) return;
    refocusing = true;
    inputEl.focus();
    refocusing = false;
  }

  function scrollActiveIntoView() {
    listEl?.children[active]?.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Capture phase on the wrapper: runs before SearchInput's own keydown, so an
   * open list's Escape closes the list here and never reaches the clear.
   */
  function onKeydownCapture(e) {
    if (disabled) return;
    // Keys from the header's own controls are theirs, except Escape.
    if (e.target !== inputEl && e.key !== 'Escape') return;
    // The list on screen answers an older query while typed text is still in the
    // debounce or loading: Enter must not pick its first option (combobox.rules.js).
    const stale = query.trim() !== '' && (debouncer.pending || loading);
    const decision = multiple
      ? multipleKey(e.key, {
          open,
          count: items.length,
          active,
          query,
          values: chips,
          max,
          allowCustom,
          activeSelected: active >= 0 && active < items.length && isSelected(items[active]),
          composing: e.isComposing,
          stale
        })
      : comboboxKey(e.key, {
          open,
          count: items.length,
          active,
          composing: e.isComposing,
          stale
        });
    switch (decision.action) {
      case 'open':
        e.preventDefault();
        openList();
        break;
      case 'move':
        e.preventDefault();
        active = decision.active;
        scrollActiveIntoView();
        break;
      case 'pick':
        e.preventDefault();
        pick(items[decision.active]);
        break;
      case 'dismiss':
        e.preventDefault();
        e.stopPropagation();
        dismiss();
        refocus();
        break;
      case 'block':
        e.preventDefault();
        break;
      case 'remove-last':
        e.preventDefault();
        removeEntry(chips.at(-1));
        break;
      case 'custom':
        e.preventDefault();
        addCustom(query);
        break;
      case 'refuse':
        e.preventDefault();
        onrefuse?.(decision.reason ?? 'max');
        break;
    }
  }

  /** Focus leaving the whole combobox (Tab away, a programmatic move) closes
      it; focus moving inside (field → a header button) does not. A null
      relatedTarget is a press on something unfocusable — `clickOutside`
      decides that one. */
  function onFocusout(e) {
    const next = e.relatedTarget;
    if (open && next && rootEl && !rootEl.contains(next)) dismiss();
  }

  function onInput(e) {
    rest.oninput?.(e);
    const text = e.target.value;
    if (!open && !disabled) open = true;
    debouncer.push(text);
  }

  function onFocus(e) {
    rest.onfocus?.(e);
    if (!refocusing) openList();
  }

  function onClick(e) {
    rest.onclick?.(e);
    openList();
  }

  /** SearchInput's ✕ or its second Escape: the empty text is reported at once. */
  function onClear() {
    debouncer.push('');
    refocus();
  }

  function optionIndex(e) {
    const option = /** @type {HTMLElement} */ (e.target).closest?.('[role="option"]');
    return option ? Number(option.dataset.index) : -1;
  }

  function onListPointermove(e) {
    const index = optionIndex(e);
    if (index >= 0 && index !== active) active = index;
  }

  function onListClick(e) {
    const index = optionIndex(e);
    if (index >= 0) pick(items[index]);
  }
</script>

<!-- The wrapper only listens: Escape/arrow keys in the capture phase and focus
     leaving the whole widget; it is not itself interactive. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={rootEl}
  class={cn('combobox', `combobox-${size}`, multiple && 'combobox-multiple', className)}
  use:clickOutside={dismiss}
  onkeydowncapture={onKeydownCapture}
  onfocusout={onFocusout}
>
  {#if multiple}
    <!-- The frame owns the one border; a press on it (not on the field or a
         chip's button) keeps focus in the field. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="combobox-frame" class:disabled onmousedown={onFrameMousedown}>
      {#if chips.length > 0}
        <div class="combobox-chips" role="group" aria-label={chipLabel}>
          {#each chips as entry (getKey(entry))}
            {#if chipSnippet}
              {@render chipSnippet(entry, () => removeChip(entry))}
            {:else}
              <span class="combobox-chip">
                <span class="combobox-chip-text">{getLabel(entry)}</span>
                {#if !disabled}
                  <button
                    type="button"
                    class="combobox-chip-remove"
                    aria-label="Remove {getLabel(entry)}"
                    onclick={() => removeChip(entry)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                {/if}
              </span>
            {/if}
          {/each}
        </div>
      {/if}
      <SearchInput
        {...rest}
        {id}
        {size}
        placeholder={full ? '' : placeholder}
        {disabled}
        {loading}
        bind:value={query}
        bind:inputEl
        role="combobox"
        aria-expanded={popupVisible}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        autocomplete="off"
        spellcheck="false"
        readonly={full ? true : rest.readonly}
        oninput={onInput}
        onfocus={onFocus}
        onclick={onClick}
        onclear={onClear}
      />
    </div>
  {:else}
    <SearchInput
      {...rest}
      {id}
      {size}
      {placeholder}
      {disabled}
      {loading}
      bind:value={query}
      bind:inputEl
      role="combobox"
      aria-expanded={popupVisible}
      aria-controls={listboxId}
      aria-autocomplete="list"
      aria-activedescendant={activeId}
      autocomplete="off"
      spellcheck="false"
      oninput={onInput}
      onfocus={onFocus}
      onclick={onClick}
      onclear={onClear}
    />
  {/if}

  <div class="combobox-popup" hidden={!popupVisible}>
    {#if popupVisible && header}
      <div class="combobox-header">{@render header()}</div>
    {/if}
    <!-- Options are never focused (focus stays in the input, aria-activedescendant
         points at the active one); keyboard picking is the input's Enter. Pointer
         handling is delegated here, one listener for any number of rows. The
         mousedown default is cancelled so a press does not blur the input. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_interactive_supports_focus -->
    <ul
      bind:this={listEl}
      id={listboxId}
      role="listbox"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      class="combobox-list"
      onmousedown={(e) => e.preventDefault()}
      onpointermove={onListPointermove}
      onclick={onListClick}
    >
      {#if popupVisible}
        {#each items as entry, index (getKey(entry))}
          {@const selected = isSelected(entry)}
          <li
            id={optionId(index)}
            role="option"
            aria-selected={selected}
            data-index={index}
            class="combobox-option"
            class:active={index === active}
          >
            <span class="combobox-option-content">
              {#if itemSnippet}
                {@render itemSnippet(entry, index === active)}
              {:else}
                {entry?.label ?? entry?.name ?? ''}
              {/if}
            </span>
            {#if selected}
              <svg class="combobox-check" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
    {#if popupVisible && showEmpty}
      <div class="combobox-empty">
        {#if empty}{@render empty()}{:else}No results{/if}
      </div>
    {/if}
  </div>

  <span class="combobox-status" role="status" aria-live="polite">{announcement}</span>
</div>

<style>
  .combobox {
    position: relative;
    width: 100%;
  }

  /* Multiple mode: one bordered frame holds the chips and the field (the
     form-border standard — the wrapper owns the border, the field inside has
     none). The field takes what is left of the row and wraps under the chips
     when the row is full. */
  .combobox-frame {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    min-height: 2rem;
    padding-inline: var(--space-2);
    padding-block: var(--space-1);
    background: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-default);
    cursor: text;
    transition: var(--transition-colors);
  }

  .combobox-xs .combobox-frame {
    min-height: 1.625rem;
    padding-block: 0;
  }

  .combobox-md .combobox-frame {
    min-height: 2.5rem;
  }

  .combobox-frame:focus-within {
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .combobox-frame.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .combobox-frame :global(.search-input) {
    flex: 1 1 6rem;
    min-width: 6rem;
    width: auto;
  }

  /* Specificity above SearchInput's `.search-input-sm .search-field` (hashed),
     whatever order the two stylesheets load in. */
  .combobox-multiple .combobox-frame :global(.search-input .search-field),
  .combobox-multiple .combobox-frame :global(.search-input .search-field:focus-visible) {
    height: 1.5rem;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .combobox-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-2);
    min-width: 0;
  }

  /* Default chip: TagInput's chip sizing, accent tint. */
  .combobox-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
    max-width: 100%;
    height: 1.5rem;
    padding-inline: var(--space-3) var(--space-1);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-base05);
    background: color-mix(in srgb, var(--color-base0D) 12%, var(--color-base00));
    cursor: default;
  }

  .combobox-chip-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .combobox-chip-remove {
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    padding: 0;
    border: 0;
    border-radius: var(--radius-full, 9999px);
    background: transparent;
    color: var(--color-base04);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .combobox-chip-remove:hover {
    color: var(--color-base06);
    background: color-mix(in srgb, var(--color-base0D) 20%, var(--color-base00));
  }

  .combobox-chip-remove:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  .combobox-chip-remove svg {
    width: 0.625rem;
    height: 0.625rem;
  }

  /* Under the field, its full width. A clipping ancestor (overflow: hidden)
     clips it too; on narrow screens a consumer can host the whole combobox
     in a jera Sheet instead. */
  .combobox-popup {
    position: absolute;
    z-index: var(--z-dropdown);
    inset-inline: 0;
    top: calc(100% + var(--space-2));
    display: flex;
    flex-direction: column;
    background: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .combobox-popup[hidden] {
    display: none;
  }

  .combobox-header {
    border-bottom: var(--border-width-thin) solid var(--color-base02);
  }

  .combobox-list {
    margin: 0;
    padding: var(--space-2);
    list-style: none;
    max-height: var(--combobox-max-height, 16rem);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Nothing to list (the empty line or the header stands alone). */
  .combobox-list:not(:has(.combobox-option)) {
    display: none;
  }

  .combobox-option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 2rem;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    color: var(--color-base05);
    cursor: pointer;
    user-select: none;
  }

  .combobox-xs .combobox-option {
    min-height: 1.625rem;
    font-size: var(--text-xs);
  }

  .combobox-md .combobox-option {
    min-height: 2.5rem;
  }

  .combobox-option.active {
    background: color-mix(in srgb, var(--color-base0D) 10%, var(--color-base00));
    color: var(--color-base07);
  }

  .combobox-option[aria-selected='true'] {
    font-weight: var(--font-weight-medium);
  }

  .combobox-option-content {
    flex: 1 1 auto;
    min-width: 0;
  }

  .combobox-check {
    flex: none;
    color: var(--color-base0D);
  }

  .combobox-empty {
    padding: var(--space-4);
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .combobox-status {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  /* Fingers: every row is a 44px target. */
  @media (pointer: coarse) {
    .combobox-option,
    .combobox-xs .combobox-option,
    .combobox-md .combobox-option {
      min-height: 2.75rem;
    }

    /* A 44px hit area around the small remove glyph, without growing the chip. */
    .combobox-chip-remove::after {
      content: '';
      position: absolute;
      inset: -0.8125rem;
    }
  }

  @media (forced-colors: active) {
    .combobox-option.active {
      outline: var(--border-width-default) solid Highlight;
    }
  }
</style>
