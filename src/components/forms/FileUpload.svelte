<!--
  @component FileUpload

  A file upload component with drag-and-drop support.

  @example
  <FileUpload onchange={handleFiles} accept="image/*" />

  @example
  // Multiple files
  <FileUpload onchange={handleFiles} multiple />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    accept = '*',
    multiple = false,
    disabled = false,
    maxSize = null,
    label = 'Drop files here or click to upload',
    hint = '',
    class: className = '',
    onchange,
    onerror,
    ...rest
  } = $props();

  let fileInput = $state(null);
  let isDragging = $state(false);
  let files = $state([]);

  function validateFile(file) {
    if (maxSize && file.size > maxSize) {
      return `File "${file.name}" exceeds maximum size of ${formatSize(maxSize)}`;
    }
    return null;
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList);
    const errors = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      onerror?.(errors);
      return;
    }

    files = multiple ? [...files, ...newFiles] : newFiles;
    onchange?.(files);
  }

  function handleInputChange(e) {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;
    if (!disabled && e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) {
      isDragging = true;
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    isDragging = false;
  }

  function openFileDialog() {
    if (!disabled) {
      fileInput?.click();
    }
  }

  function removeFile(index) {
    files = files.filter((_, i) => i !== index);
    onchange?.(files);
  }
</script>

<div class={cn('file-upload', className)}>
  <button
    type="button"
    class="upload-zone"
    class:upload-zone-dragging={isDragging}
    class:upload-zone-disabled={disabled}
    onclick={openFileDialog}
    ondrop={handleDrop}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    {disabled}
  >
    <svg class="upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    <span class="upload-label">{label}</span>
    {#if hint}
      <span class="upload-hint">{hint}</span>
    {/if}
  </button>

  <input
    bind:this={fileInput}
    type="file"
    {accept}
    {multiple}
    {disabled}
    onchange={handleInputChange}
    class="upload-input"
    {...rest}
  />

  {#if files.length > 0}
    <ul class="file-list">
      {#each files as file, index}
        <li class="file-item">
          <span class="file-name">{file.name}</span>
          <span class="file-size">{formatSize(file.size)}</span>
          <button
            type="button"
            class="file-remove"
            onclick={() => removeFile(index)}
            aria-label="Remove file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .file-upload {
    width: 100%;
  }

  .upload-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-6) var(--space-4);
    background: var(--color-base00);
    border: 2px dashed var(--color-base03);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .upload-zone:hover:not(:disabled) {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .upload-zone-dragging {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .upload-zone-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .upload-icon {
    color: var(--color-base04);
  }

  .upload-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base05);
  }

  .upload-hint {
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .upload-input {
    display: none;
  }

  .file-list {
    list-style: none;
    margin: var(--space-3) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md);
  }

  .file-name {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--color-base05);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    font-size: var(--text-xs);
    color: var(--color-base04);
    white-space: nowrap;
  }

  .file-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-base04);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .file-remove:hover {
    color: var(--color-base08);
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
  }
</style>
