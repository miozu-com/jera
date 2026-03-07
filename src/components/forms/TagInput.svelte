<!--
  @component TagInput

  Tag/chip input with add/remove, deduplication, and variant colors.

  @example Basic usage
  <TagInput bind:tags={keywords} placeholder="Add keyword..." />

  @example With variant and max
  <TagInput bind:tags={labels} variant="accent" maxTags={5} />

  @example With transform
  <TagInput bind:tags={tags} transform={t => t.toLowerCase().trim()} />
-->
<script>
  let {
    tags = $bindable([]),
    placeholder = 'Add tag...',
    variant = 'default',
    maxTags = Infinity,
    disabled = false,
    duplicates = false,
    transform = null,
    onchange,
    class: className = '',
    ...rest
  } = $props();

  let inputValue = $state('');
  let inputRef = $state();

  const atLimit = $derived(tags.length >= maxTags);

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
    if (!duplicates && tags.includes(value)) {
      inputValue = '';
      return;
    }
    if (atLimit) return;
    tags = [...tags, value];
    inputValue = '';
    onchange?.(tags);
  }

  function removeTag(index) {
    tags = tags.filter((_, i) => i !== index);
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
  style="--_variant-color: {variantColor}"
  role="group"
  aria-label="Tag input"
  onclick={() => inputRef?.focus()}
  {...rest}
>
  {#each tags as tag, i (tag + '-' + i)}
    <span class="tag-chip">
      {tag}
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

  {#if !atLimit && !disabled}
    <input
      type="text"
      class="tag-field"
      bind:this={inputRef}
      bind:value={inputValue}
      onkeydown={handleKeydown}
      {placeholder}
      {disabled}
    />
  {:else if atLimit}
    <span class="tag-limit">{tags.length}/{maxTags}</span>
  {/if}
</div>

<style>
  .tag-input-container {
    display: flex;
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

  .tag-field::placeholder {
    color: var(--color-base04);
  }

  .tag-limit {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base04);
    padding: 0.125rem 0.25rem;
  }
</style>
