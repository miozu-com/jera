<!-- file-size: justified -- one widget: the APG combobox's input wiring, popup and dismiss handling share one open/active state; the key and debounce decisions are already split into combobox.rules.js, and the rest is CSS. -->
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

  @example
  <Combobox bind:query bind:open {items} {loading} value={picked?.id}
    label="Categories" onquery={search} onopen={() => search('')}
    onpick={(node) => (picked = node)}>
    {#snippet item(node, active)}{node.name}{/snippet}
  </Combobox>
-->
<script>
  import SearchInput from './SearchInput.svelte';
  import { clickOutside } from '../../actions/index.js';
  import { cn } from '../../utils/cn.svelte.js';
  import { comboboxKey, createQueryDebouncer, resultsMessage } from './combobox.rules.js';

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
    const keepOpen = onpick?.(entry) === false;
    if (!keepOpen) open = false;
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
    const decision = comboboxKey(e.key, {
      open,
      count: items.length,
      active,
      composing: e.isComposing
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
  class={cn('combobox', `combobox-${size}`, className)}
  use:clickOutside={dismiss}
  onkeydowncapture={onKeydownCapture}
  onfocusout={onFocusout}
>
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
      class="combobox-list"
      onmousedown={(e) => e.preventDefault()}
      onpointermove={onListPointermove}
      onclick={onListClick}
    >
      {#if popupVisible}
        {#each items as entry, index (getKey(entry))}
          {@const selected = value != null && getKey(entry) === value}
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
  }

  @media (forced-colors: active) {
    .combobox-option.active {
      outline: var(--border-width-default) solid Highlight;
    }
  }
</style>
