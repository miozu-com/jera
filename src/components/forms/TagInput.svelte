<!--
  @component TagInput

  Tag/chip input with add/remove, deduplication, and variant colors.

  The field inside the chip row is a real text input with its own accessible
  name (`inputLabel`, falling back to `placeholder`), so a screen reader
  announces the group and the field separately. Adds, removals and rejected
  duplicates are announced through a polite live region.

  @example Basic usage
  <TagInput bind:tags={keywords} placeholder="Add keyword..." />

  @example Named for the surrounding setting
  <TagInput bind:tags={questions} label="Suggested questions" placeholder="Add a suggested question" />

  @example With variant and max
  <TagInput bind:tags={labels} variant="accent" maxTags={5} />

  @example Bounded per tag — an over-long tag is refused, never shortened
  <TagInput bind:tags={claims} maxTagLength={200} />

  @example With transform
  <TagInput bind:tags={tags} transform={t => t.toLowerCase().trim()} />
-->
<script>
  import { tagRejection } from './tagInput.rules.js';

  let {
    tags = $bindable([]),
    placeholder = 'Add tag...',
    label = 'Tag input',
    inputLabel = null,
    variant = 'default',
    maxTags = Infinity,
    maxTagLength = Infinity,
    disabled = false,
    duplicates = false,
    transform = null,
    onchange,
    class: className = '',
    ...rest
  } = $props();

  let inputValue = $state('');
  let inputRef = $state();
  /** Unique so two bounded TagInputs on one page don't share a description. */
  const lengthId = `tag-length-${crypto.randomUUID()}`;
  /** Polite announcement for add / remove / a refused tag. */
  let announcement = $state('');

  const atLimit = $derived(tags.length >= maxTags);
  const fieldLabel = $derived(inputLabel || placeholder || 'Add tag');

  /**
   * The length of what the field is holding, measured as `addTag` measures it.
   *
   * Advisory. `addTag` asks `tagRejection` about the value *after* `transform`,
   * which is the one that would be stored and the one a server bound applies
   * to; a transform that changes length makes this counter and that refusal
   * disagree by exactly that much, and the refusal is the authority.
   */
  const typedLength = $derived(inputValue.trim().length);
  /**
   * A value the control would refuse for its length.
   *
   * Drawn, not enforced: there is no `maxlength` on the field below, because a
   * native one truncates pasted text to fit and says nothing, which would put
   * a silently shortened claim in the list — the exact outcome this prop was
   * added to prevent. The person can type or paste anything; the control says
   * plainly that it is past the bound, and refuses it at Enter with the two
   * numbers in the announcement.
   */
  const overLength = $derived(typedLength > maxTagLength);

  const variantColor = $derived({
    default: 'var(--color-base04)',
    accent: 'var(--color-base0E)',
    success: 'var(--color-base0B)',
    warning: 'var(--color-base0A)',
    error: 'var(--color-base08)'
  }[variant] || 'var(--color-base04)');

  function addTag() {
    let value = inputValue.trim();
    if (!value) return;
    if (transform) value = transform(value);
    if (!value) return;
    const refusal = tagRejection(value, { tags, maxTags, maxTagLength, duplicates });
    if (refusal) {
      if (refusal.clearsField) inputValue = '';
      announcement = refusal.message;
      return;
    }
    tags = [...tags, value];
    inputValue = '';
    announcement =
      tags.length >= maxTags ? `${value} added. Limit of ${maxTags} reached.` : `${value} added`;
    onchange?.(tags);
  }

  function removeTag(index) {
    const removed = tags[index];
    tags = tags.filter((_, i) => i !== index);
    announcement = `${removed} removed`;
    onchange?.(tags);
    inputRef?.focus();
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }
</script>

<div
  class="tag-input-container {className}"
  class:tag-input-disabled={disabled}
  class:tag-input-invalid={overLength}
  style="--_variant-color: {variantColor}"
  role="group"
  aria-label={label}
  onclick={() => inputRef?.focus()}
  {...rest}
>
  {#each tags as tag, i (tag + '-' + i)}
    <span class="tag-chip">
      <span class="tag-chip-text">{tag}</span>
      {#if !disabled}
        <button
          type="button"
          class="tag-remove"
          onclick={(e) => { e.stopPropagation(); removeTag(i); }}
          aria-label="Remove {tag}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </span>
  {/each}

  {#if !disabled}
    <!-- The field stays mounted at the limit (readonly, not unmounted) so the
         caret does not fall back to <body> the moment the last tag is added —
         Backspace from here frees a slot. -->
    <input
      type="text"
      class="tag-field"
      bind:this={inputRef}
      bind:value={inputValue}
      onkeydown={handleKeydown}
      placeholder={atLimit ? '' : placeholder}
      readonly={atLimit}
      aria-label={fieldLabel}
      aria-invalid={overLength || undefined}
      aria-describedby={overLength ? lengthId : undefined}
    />
  {/if}

  {#if atLimit}
    <span class="tag-limit">{tags.length}/{maxTags}</span>
  {:else if overLength}
    <!-- Shown only past the bound, and showing the person's own number: they
         learn the limit at the moment it starts to matter, before they press
         Enter, and nothing was cut to produce the count. -->
    <span id={lengthId} class="tag-limit tag-limit--over">{typedLength}/{maxTagLength}</span>
  {/if}

  <span class="tag-status" role="status" aria-live="polite">{announcement}</span>
</div>

<style>
  .tag-input-container {
    display: flex;
    position: relative;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.5rem;
    min-height: 2.5rem;
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
    cursor: text;
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  }

  .tag-input-container:focus-within {
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  /* A value the control will refuse, marked the way every other jera form
     control marks one — base08 border, error focus ring. The value itself is
     untouched; only the chrome says so. */
  .tag-input-container.tag-input-invalid,
  .tag-input-container.tag-input-invalid:focus-within {
    border-color: var(--color-base08);
  }

  .tag-input-container.tag-input-invalid:focus-within {
    box-shadow: var(--focus-ring-shadow-error);
  }

  .tag-input-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    background: color-mix(in srgb, var(--_variant-color) 15%, transparent);
    color: var(--_variant-color);
    /* A pasted URL or a long unbroken string must not push the chip past the
       row it shares with other chips — the row wraps, not this one chip. */
    min-width: 0;
    max-width: 100%;
  }

  .tag-chip-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.0625rem;
    border: 0;
    border-radius: var(--radius-full, 9999px);
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--duration-fast);
    flex-shrink: 0;
  }

  .tag-remove:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--_variant-color) 20%, transparent);
  }

  .tag-remove svg {
    width: 0.625rem;
    height: 0.625rem;
  }

  .tag-field {
    flex: 1;
    min-width: 80px;
    padding: 0.125rem 0.25rem;
    border: 0;
    background: transparent;
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-base07);
    outline: none;
  }

  .tag-field:read-only {
    cursor: default;
  }

  .tag-field::placeholder {
    color: var(--color-base04);
  }

  .tag-limit {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base04);
    padding: 0.125rem 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  .tag-limit--over {
    color: var(--color-base08);
  }

  /* Announcements are for assistive tech only — the chips themselves are the
     visible feedback. */
  .tag-status {
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
</style>
