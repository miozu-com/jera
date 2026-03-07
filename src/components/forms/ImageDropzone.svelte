<!--
  @component ImageDropzone

  A drag-and-drop image upload zone with thumbnail previews, file validation,
  and multi-file support. Files are stored as objects with preview URLs.

  @example Basic
  <ImageDropzone bind:files={myFiles} />

  @example Single image, custom max size
  <ImageDropzone
    bind:files={avatar}
    multiple={false}
    maxFiles={1}
    maxSize={2 * 1024 * 1024}
    onchange={(files) => console.log(files)}
  />

  @example With error state and remove callback
  <ImageDropzone
    bind:files={productImages}
    maxFiles={5}
    error={uploadError}
    onchange={handleChange}
    onremove={handleRemove}
  />

  @example With numbered previews and minimum count
  <ImageDropzone
    bind:files={productImages}
    maxFiles={8}
    minFiles={3}
    showNumbers
    onchange={handleChange}
  />
-->
<script>
  let {
    files = $bindable([]),
    accept = 'image/*',
    multiple = true,
    maxFiles = 10,
    minFiles = 0,
    maxSize = 10 * 1024 * 1024,
    disabled = false,
    error = '',
    previews = true,
    showNumbers = false,
    onchange = null,
    onremove = null,
    class: className = ''
  } = $props();

  let isDragging = $state(false);
  let fileInput = $state(null);
  let sizeError = $state('');

  const displayError = $derived(error || sizeError);

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function isFileTypeAccepted(file) {
    if (!accept || accept === '*' || accept === '*/*') return true;
    const acceptTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    return acceptTypes.some(type => {
      if (type.startsWith('.')) return fileExt === type.toLowerCase();
      if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -2) + '/');
      return fileType === type;
    });
  }

  function addFiles(newFiles) {
    sizeError = '';
    const remaining = maxFiles - files.length;
    if (remaining <= 0) return;

    const filtered = [];
    const oversized = [];

    for (const file of newFiles) {
      if (!isFileTypeAccepted(file)) continue;
      if (file.size > maxSize) {
        oversized.push(file.name);
        continue;
      }
      filtered.push(file);
    }

    if (oversized.length > 0) {
      sizeError = `${oversized.length === 1 ? `"${oversized[0]}"` : `${oversized.length} files`} exceed${oversized.length === 1 ? 's' : ''} the ${formatSize(maxSize)} limit`;
    }

    const filesToAdd = filtered.slice(0, remaining);
    if (filesToAdd.length === 0) return;

    const newImages = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    files = [...files, ...newImages];
    onchange?.(files);
  }

  function removeImage(index) {
    URL.revokeObjectURL(files[index].preview);
    files = files.filter((_, i) => i !== index);
    onremove?.(index);
    onchange?.(files);
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragging = false;
    if (disabled) return;
    const dropped = event.dataTransfer?.files;
    if (!dropped?.length) return;
    addFiles(Array.from(dropped));
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!disabled) isDragging = true;
  }

  function handleDragLeave(event) {
    // Only clear if leaving the dropzone itself, not a child
    if (!event.currentTarget.contains(event.relatedTarget)) {
      isDragging = false;
    }
  }

  function handleInputChange(event) {
    const picked = event.target?.files;
    if (!picked?.length) return;
    addFiles(Array.from(picked));
    // Reset input so the same file can be re-added if removed
    event.target.value = '';
  }

  function openPicker() {
    if (!disabled) fileInput?.click();
  }

  // Revoke all object URLs on unmount
  $effect(() => {
    return () => {
      files.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  });
</script>

<div
  class="image-dropzone {className}"
  class:image-dropzone-error={displayError}
  class:image-dropzone-disabled={disabled}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="region"
  aria-label="Image upload zone"
>
  {#if files.length === 0}
    <!-- Empty state: full clickable zone -->
    <button
      type="button"
      class="dropzone-empty"
      class:dropzone-dragging={isDragging}
      onclick={openPicker}
      {disabled}
      aria-label="Click or drag images to upload"
    >
      <!-- Upload cloud icon -->
      <svg class="upload-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="16 16 12 12 8 16"></polyline>
        <line x1="12" y1="12" x2="12" y2="21"></line>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
      </svg>
      <span class="upload-label">
        {isDragging ? 'Drop images here' : 'Drag & drop images, or click to browse'}
      </span>
      <span class="upload-hint">
        Up to {maxFiles} {maxFiles === 1 ? 'image' : 'images'} · Max {formatSize(maxSize)} each
      </span>
    </button>
  {:else}
    <!-- Filled state: preview grid + add more -->
    <div class="preview-area" class:preview-area-dragging={isDragging}>
      {#if previews}
        <div class="preview-grid">
          {#each files as img, index}
            <div class="preview-item">
              <img
                src={img.preview}
                alt={img.name}
                class="preview-thumb"
              />
              {#if showNumbers}
                <span class="preview-number">{index + 1}</span>
              {/if}
              <button
                type="button"
                class="preview-remove"
                onclick={() => removeImage(index)}
                aria-label="Remove {img.name}"
              >
                <!-- X icon -->
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          {/each}
          {#if files.length < maxFiles}
            <button
              type="button"
              class="add-tile"
              onclick={openPicker}
              {disabled}
              aria-label="Add more images"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add more</span>
            </button>
          {/if}
        </div>
      {/if}

      <div class="preview-footer">
        <span class="file-count">{files.length} / {maxFiles}</span>
      </div>
    </div>
  {/if}

  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    {accept}
    multiple={multiple}
    {disabled}
    class="dropzone-input"
    onchange={handleInputChange}
    tabindex="-1"
    aria-hidden="true"
  />
</div>

{#if minFiles > 0}
  <div class="count-row">
    <span class="count-status" class:count-met={files.length >= minFiles}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      {files.length} / {minFiles} minimum
    </span>
    {#if files.length > 0 && files.length < minFiles}
      <span class="count-hint">Add {minFiles - files.length} more</span>
    {:else if files.length >= minFiles}
      <span class="count-hint count-hint-success">Ready</span>
    {/if}
  </div>
{/if}

{#if displayError}
  <p class="dropzone-error-text" role="alert">{displayError}</p>
{/if}

<style>
  .image-dropzone {
    position: relative;
    width: 100%;
    border: var(--border-width-default) dashed var(--color-base02);
    border-radius: var(--radius-lg);
    background: var(--color-base01);
    transition:
      border-color var(--duration-base) var(--ease-out),
      background var(--duration-base) var(--ease-out);
  }

  .image-dropzone-error {
    border-color: var(--color-base08);
  }

  .image-dropzone-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ---- Empty state ---- */

  .dropzone-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    width: 100%;
    min-height: 10rem;
    padding: var(--space-12) var(--space-8);
    background: transparent;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    color: inherit;
    transition:
      background var(--duration-fast) var(--ease-out);
  }

  .dropzone-empty:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .dropzone-empty:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  .dropzone-dragging {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .image-dropzone:has(.dropzone-dragging),
  .image-dropzone:has(.preview-area-dragging) {
    border-color: var(--color-base0D);
  }

  .upload-icon {
    color: var(--color-base04);
    flex-shrink: 0;
  }

  .upload-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base05);
    text-align: center;
  }

  .upload-hint {
    font-size: var(--text-xs);
    color: var(--color-base04);
    text-align: center;
  }

  /* ---- Filled state: preview area ---- */

  .preview-area {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    transition: background var(--duration-fast) var(--ease-out);
    border-radius: var(--radius-lg);
  }

  .preview-area-dragging {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
    gap: var(--space-4);
  }

  .preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: var(--border-width-thin) solid var(--color-base02);
    box-shadow: var(--shadow-xs);
    background: var(--color-base00);
  }

  .preview-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .preview-remove {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    background: color-mix(in srgb, var(--color-base00) 85%, transparent);
    border: none;
    border-radius: var(--radius-full);
    color: var(--color-base05);
    cursor: pointer;
    opacity: 0;
    transition:
      opacity var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
    z-index: 1;
  }

  .preview-item:hover .preview-remove,
  .preview-remove:focus-visible {
    opacity: 1;
  }

  .preview-remove:hover {
    background: var(--color-base08);
    color: var(--color-base07);
  }

  .preview-remove:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  /* ---- Footer row ---- */

  .preview-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .file-count {
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .preview-number {
    position: absolute;
    bottom: var(--space-2);
    left: var(--space-2);
    padding: 0.125rem 0.375rem;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-base07);
    background: color-mix(in srgb, black 60%, transparent);
    border-radius: var(--radius-md);
  }

  .add-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    border: var(--border-width-default) dashed var(--color-base02);
    color: var(--color-base04);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    transition: border-color var(--duration-fast), background var(--duration-fast), color var(--duration-fast);
  }

  .add-tile:hover:not(:disabled) {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 5%, transparent);
    color: var(--color-base0D);
  }

  .add-tile:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  /* ---- Count status row ---- */

  .count-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--space-3);
  }

  .count-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base09);
  }

  .count-status.count-met {
    color: var(--color-base0B);
  }

  .count-hint {
    font-size: var(--text-sm);
    color: var(--color-base04);
  }

  .count-hint-success {
    color: var(--color-base0B);
  }

  /* ---- Hidden input ---- */

  .dropzone-input {
    display: none;
  }

  /* ---- Error text ---- */

  .dropzone-error-text {
    margin: var(--space-2) 0 0;
    font-size: var(--text-xs);
    color: var(--color-base08);
  }
</style>
