<!--
  @component MultiUrlInput

  URL list input with validation, deduplication, and domain display.

  @example Basic usage
  <MultiUrlInput bind:urls={siteUrls} label="Website Links" />

  @example With description and limit
  <MultiUrlInput bind:urls={links} label="Sources" description="Add source URLs" maxUrls={5} />
-->
<script>
  let {
    urls = $bindable([]),
    label = '',
    description = '',
    placeholder = 'https://example.com',
    maxUrls = 10,
    disabled = false,
    onchange,
    class: className = '',
    ...rest
  } = $props();

  let newUrl = $state('');
  let validationError = $state('');

  const atLimit = $derived(urls.length >= maxUrls);

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  function getPath(url) {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname + parsed.search;
      return path === '/' ? '' : path;
    } catch {
      return '';
    }
  }

  function handleAdd() {
    validationError = '';
    const trimmed = newUrl.trim();
    if (!trimmed) return;

    if (!isValidUrl(trimmed)) {
      validationError = 'Enter a valid URL (http:// or https://)';
      return;
    }
    if (urls.includes(trimmed)) {
      validationError = 'URL already added';
      return;
    }
    if (atLimit) {
      validationError = `Maximum of ${maxUrls} URLs allowed`;
      return;
    }

    urls = [...urls, trimmed];
    newUrl = '';
    onchange?.(urls);
  }

  function handleRemove(url) {
    urls = urls.filter(u => u !== url);
    validationError = '';
    onchange?.(urls);
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }
</script>

<div class="multi-url-input {className}" class:multi-url-disabled={disabled} {...rest}>
  {#if label || description}
    <div class="url-header">
      <div class="url-header-text">
        {#if label}
          <span class="url-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="url-label-icon">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {label}
          </span>
        {/if}
        {#if description}
          <p class="url-description">{description}</p>
        {/if}
      </div>
      <span class="url-count" class:url-count-limit={atLimit}>
        {urls.length}/{maxUrls}
      </span>
    </div>
  {/if}

  {#if urls.length > 0}
    <div class="url-list">
      {#each urls as url (url)}
        <div class="url-item">
          <div class="url-content">
            <span class="url-domain">{getDomain(url)}</span>
            {#if getPath(url)}
              <span class="url-path">{getPath(url)}</span>
            {/if}
          </div>
          <div class="url-actions">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              class="url-open-btn"
              title="Open in new tab"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>
            {#if !disabled}
              <button
                type="button"
                class="url-remove-btn"
                onclick={() => handleRemove(url)}
                title="Remove URL"
                aria-label="Remove {getDomain(url)}"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if !atLimit && !disabled}
    <div class="url-add-section">
      <div class="url-input-row">
        <input
          type="url"
          class="url-input"
          class:url-input-error={validationError}
          bind:value={newUrl}
          onkeydown={handleKeydown}
          {placeholder}
          {disabled}
        />
        <button
          type="button"
          class="url-add-btn"
          onclick={handleAdd}
          disabled={!newUrl.trim() || disabled}
          title="Add URL"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {#if validationError}
        <p class="url-error-text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="url-error-icon">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {validationError}
        </p>
      {/if}
    </div>
  {:else if atLimit && !disabled}
    <p class="url-limit-msg">Maximum number of URLs reached</p>
  {/if}
</div>

<style>
  .multi-url-input {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .multi-url-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Header */
  .url-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .url-header-text {
    flex: 1;
  }

  .url-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    color: var(--color-base06);
  }

  .url-label-icon {
    width: 1rem;
    height: 1rem;
  }

  .url-description {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base05);
    margin: 0.25rem 0 0;
  }

  .url-count {
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    color: var(--color-base05);
    padding: 0.25rem 0.5rem;
    background: var(--color-base02);
    border-radius: var(--radius-md);
  }

  .url-count-limit {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    color: var(--color-base08);
  }

  /* URL List */
  .url-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .url-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    background: color-mix(in srgb, var(--color-base02) 50%, transparent);
    border-radius: var(--radius-lg, 0.5rem);
    border: var(--border-width-thin, 1px) solid var(--color-base02);
    transition: border-color var(--duration-fast);
  }

  .url-item:hover {
    border-color: var(--color-base03);
  }

  .url-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .url-domain {
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    color: var(--color-base0D);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .url-path {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base05);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  .url-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: 0.5rem;
  }

  .url-open-btn,
  .url-remove-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-base05);
    cursor: pointer;
    transition: color var(--duration-fast), background-color var(--duration-fast);
  }

  .url-open-btn svg,
  .url-remove-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .url-open-btn:hover {
    background: var(--color-base03);
    color: var(--color-base0D);
  }

  .url-remove-btn:hover {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    color: var(--color-base08);
  }

  /* Add Section */
  .url-add-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .url-input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .url-input {
    flex: 1;
    padding: 0.625rem 0.75rem;
    background: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    border-radius: var(--radius-md);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-base07);
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  }

  .url-input::placeholder {
    color: var(--color-base04);
  }

  .url-input:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .url-input-error {
    border-color: var(--color-base08);
  }

  .url-input-error:focus {
    border-color: var(--color-base08);
    box-shadow: var(--focus-ring-shadow-error);
  }

  .url-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.625rem;
    background: var(--color-base0D);
    color: var(--color-base07);
    border: 0;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background-color var(--duration-fast);
  }

  .url-add-btn svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .url-add-btn:hover {
    background: color-mix(in srgb, var(--color-base0D) 85%, transparent);
  }

  .url-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Error & Limit */
  .url-error-text {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base08);
    margin: 0;
  }

  .url-error-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .url-limit-msg {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base05);
    font-style: italic;
    margin: 0;
  }
</style>
