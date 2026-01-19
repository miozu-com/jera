<!--
  @component Alert

  An inline alert/notice banner for displaying messages.
  Different from Toast (which is transient) - Alert stays visible in the layout.

  @example Basic
  <Alert variant="info">This is an informational message.</Alert>

  @example With title
  <Alert variant="warning" title="Warning">
    Please review your settings before continuing.
  </Alert>

  @example Dismissible
  <Alert variant="error" dismissible onclose={() => showAlert = false}>
    An error occurred while processing your request.
  </Alert>

  @example With icon snippet
  <Alert variant="success">
    {#snippet icon()}
      <CheckIcon size={16} />
    {/snippet}
    Your changes have been saved successfully.
  </Alert>

  @example With actions
  <Alert variant="info" title="New version available">
    A new version is available for download.
    {#snippet actions()}
      <Button size="sm" variant="primary">Update Now</Button>
      <Button size="sm" variant="ghost">Later</Button>
    {/snippet}
  </Alert>
-->
<script>
  let {
    variant = 'info',
    title = '',
    dismissible = false,
    size = 'md',
    class: className = '',
    onclose,
    icon,
    actions,
    children
  } = $props();

  let visible = $state(true);

  function handleClose() {
    visible = false;
    onclose?.();
  }
</script>

{#if visible}
  <div
    class="alert alert-{variant} alert-{size} {className}"
    role="alert"
  >
    {#if icon}
      <div class="alert-icon">
        {@render icon()}
      </div>
    {:else}
      <div class="alert-icon alert-icon-default">
        {#if variant === 'success'}
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm2.354-7.354a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"/></svg>
        {:else if variant === 'error'}
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM7.25 5v3.5a.75.75 0 0 0 1.5 0V5a.75.75 0 0 0-1.5 0zm.75 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/></svg>
        {:else if variant === 'warning'}
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a.75.75 0 0 1 .65.38l6.25 10.75a.75.75 0 0 1-.65 1.12H1.75a.75.75 0 0 1-.65-1.12L7.35 1.88A.75.75 0 0 1 8 1.5zm0 1.73L2.57 12.25h10.86L8 3.23zM7.25 6v2.5a.75.75 0 0 0 1.5 0V6a.75.75 0 0 0-1.5 0zm.75 5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/></svg>
        {:else}
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM7.25 5a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V5zm.75 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/></svg>
        {/if}
      </div>
    {/if}

    <div class="alert-content">
      {#if title}
        <div class="alert-title">{title}</div>
      {/if}
      <div class="alert-message">
        {@render children?.()}
      </div>
      {#if actions}
        <div class="alert-actions">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if dismissible}
      <button
        type="button"
        class="alert-close"
        onclick={handleClose}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z"/></svg>
      </button>
    {/if}
  </div>
{/if}

<style>
  .alert {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid;
  }

  /* Size variants */
  .alert-sm {
    padding: var(--space-2) var(--space-3);
  }

  .alert-md {
    padding: var(--space-3) var(--space-4);
  }

  .alert-lg {
    padding: var(--space-4) var(--space-5);
  }

  /* Variant colors */
  .alert-info {
    background: color-mix(in srgb, var(--color-base0D) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-base0D) 25%, transparent);
    color: var(--color-base0D);
  }

  .alert-success {
    background: color-mix(in srgb, var(--color-base0B) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-base0B) 25%, transparent);
    color: var(--color-base0B);
  }

  .alert-warning {
    background: color-mix(in srgb, var(--color-base0A) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-base0A) 25%, transparent);
    color: var(--color-base0A);
  }

  .alert-error {
    background: color-mix(in srgb, var(--color-base08) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-base08) 25%, transparent);
    color: var(--color-base08);
  }

  /* Icon */
  .alert-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-icon-default svg {
    width: 16px;
    height: 16px;
  }

  .alert-lg .alert-icon-default svg {
    width: 20px;
    height: 20px;
  }

  /* Content */
  .alert-content {
    flex: 1;
    min-width: 0;
  }

  .alert-title {
    font-weight: 600;
    font-size: var(--text-sm);
    margin-bottom: var(--space-1);
  }

  .alert-info .alert-title { color: var(--color-base0D); }
  .alert-success .alert-title { color: var(--color-base0B); }
  .alert-warning .alert-title { color: var(--color-base0A); }
  .alert-error .alert-title { color: var(--color-base08); }

  .alert-message {
    font-size: var(--text-sm);
    color: var(--color-base05);
    line-height: 1.5;
  }

  .alert-lg .alert-message {
    font-size: var(--text-base);
  }

  .alert-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  /* Close button */
  .alert-close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    margin: calc(var(--space-1) * -1);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: currentColor;
    opacity: 0.6;
    cursor: pointer;
    transition: opacity 0.2s ease, background 0.2s ease;
  }

  .alert-close:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 10%, transparent);
  }

  .alert-close svg {
    width: 14px;
    height: 14px;
  }
</style>
