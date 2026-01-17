<!--
  @component Dropzone

  A drag-and-drop file upload zone.

  @example Basic
  <Dropzone ondrop={handleFile} />

  @example Custom accept types
  <Dropzone
    accept="image/*"
    placeholder="Drop an image here"
    ondrop={handleImage}
  />

  @example With file info display
  <Dropzone
    accept=".pdf"
    placeholder="Drop a PDF document"
    ondrop={(file) => console.log(file.name)}
  />
-->
<script>
  let {
    accept = '*/*',
    placeholder = 'Drag & drop a file here, or click to upload',
    disabled = false,
    class: className = '',
    ondrop
  } = $props();

  let isDragging = $state(false);
  let file = $state(null);

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragging = false;

    if (disabled) return;

    const files = event.dataTransfer?.files;
    if (!files?.length) return;

    const droppedFile = files[0];

    // Validate file type if accept is specified
    if (accept !== '*/*') {
      const acceptTypes = accept.split(',').map(t => t.trim());
      const fileType = droppedFile.type;
      const fileExt = '.' + droppedFile.name.split('.').pop().toLowerCase();

      const isValid = acceptTypes.some(type => {
        if (type.startsWith('.')) return fileExt === type.toLowerCase();
        if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -1));
        return fileType === type;
      });

      if (!isValid) {
        return;
      }
    }

    file = droppedFile;
    ondrop?.(droppedFile);
  }

  function handleFileInput(event) {
    const files = event.target?.files;
    if (!files?.length) return;

    file = files[0];
    ondrop?.(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!disabled) isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function clearFile() {
    file = null;
  }
</script>

<!-- Note: To prevent browser's default file handling, add these to your root layout:
     ondragover={(e) => e.preventDefault()}
     ondrop={(e) => e.preventDefault()}
-->

<div
  class="dropzone {isDragging ? 'dropzone-dragging' : ''} {disabled ? 'dropzone-disabled' : ''} {className}"
  ondragenter={() => !disabled && (isDragging = true)}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  role="region"
  aria-label="File drop zone"
>
  {#if isDragging}
    <p class="dropzone-message">Release to drop the file</p>
  {:else if file}
    <div class="dropzone-file">
      <div class="dropzone-file-info">
        <p class="dropzone-file-name">{file.name}</p>
        <p class="dropzone-file-meta">
          {formatBytes(file.size)} &middot; {file.type || 'Unknown type'}
        </p>
      </div>
      <button
        type="button"
        class="dropzone-clear"
        onclick={clearFile}
        aria-label="Remove file"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  {:else}
    <p class="dropzone-message">{placeholder}</p>
  {/if}

  <input
    type="file"
    {accept}
    {disabled}
    class="dropzone-input"
    onchange={handleFileInput}
  />
</div>

<style>
  .dropzone {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 8rem;
    padding: var(--space-4);
    border: 2px dashed var(--color-base02);
    border-radius: var(--radius-lg);
    background: var(--color-base01);
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .dropzone:hover:not(.dropzone-disabled) {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .dropzone-dragging {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
  }

  .dropzone-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dropzone-message {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-base04);
    text-align: center;
    pointer-events: none;
  }

  .dropzone-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .dropzone-disabled .dropzone-input {
    cursor: not-allowed;
  }

  .dropzone-file {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3);
    background: var(--color-base00);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md);
  }

  .dropzone-file-info {
    flex: 1;
    min-width: 0;
  }

  .dropzone-file-name {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base07);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropzone-file-meta {
    margin: var(--space-1) 0 0 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .dropzone-clear {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-base04);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    z-index: 1;
  }

  .dropzone-clear:hover {
    background: var(--color-base02);
    color: var(--color-base05);
  }
</style>
