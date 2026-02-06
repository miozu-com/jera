<!--
  @component Tooltip

  A fast, accessible tooltip that appears on hover.
  Supports multiple positions and custom content.

  @example Basic tooltip
  <Tooltip text="Edit this item">
    <Button>Edit</Button>
  </Tooltip>

  @example Different positions
  <Tooltip text="Top tooltip" position="top">
    <span>Hover me</span>
  </Tooltip>

  <Tooltip text="Right tooltip" position="right">
    <span>Hover me</span>
  </Tooltip>

  @example With custom delay
  <Tooltip text="Delayed tooltip" delay={500}>
    <Button>Hover</Button>
  </Tooltip>

  @example Rich content
  <Tooltip>
    {#snippet content()}
      <div class="tooltip-rich">
        <strong>Title</strong>
        <p>Description text here</p>
      </div>
    {/snippet}
    <Button>Info</Button>
  </Tooltip>
-->
<script>
  let {
    text = '',
    position = 'top',
    delay = 50,
    disabled = false,
    class: className = '',
    content,
    children
  } = $props();

  let visible = $state(false);
  let timeout = null;

  function show() {
    if (disabled) return;
    timeout = setTimeout(() => {
      visible = true;
    }, delay);
  }

  function hide() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    visible = false;
  }
</script>

<div
  class="tooltip-wrapper {className}"
  onmouseenter={show}
  onmouseleave={hide}
  onfocus={show}
  onblur={hide}
>
  {#if children}
    {@render children()}
  {/if}

  {#if visible && (text || content)}
    <div
      class="tooltip tooltip-{position} {content ? 'tooltip-interactive' : ''}"
      role="tooltip"
      onmouseenter={content ? show : undefined}
      onmouseleave={content ? hide : undefined}
    >
      <div class="tooltip-content">
        {#if content}
          {@render content()}
        {:else}
          {text}
        {/if}
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-flex;
  }

  .tooltip {
    position: absolute;
    z-index: 50;
    pointer-events: none;
    animation: tooltip-enter 0.15s ease-out;
  }

  .tooltip-interactive {
    pointer-events: auto;
  }

  @keyframes tooltip-enter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .tooltip-content {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-base06);
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    white-space: nowrap;
    max-width: 20rem;
  }

  .tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    transform: rotate(45deg);
  }

  /* Position: Top */
  .tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--space-2);
  }

  .tooltip-top .tooltip-arrow {
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-top: none;
    border-left: none;
  }

  /* Position: Bottom */
  .tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--space-2);
  }

  .tooltip-bottom .tooltip-arrow {
    top: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-bottom: none;
    border-right: none;
  }

  /* Position: Left */
  .tooltip-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: var(--space-2);
  }

  .tooltip-left .tooltip-arrow {
    right: -5px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    border-left: none;
    border-bottom: none;
  }

  /* Position: Right */
  .tooltip-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: var(--space-2);
  }

  .tooltip-right .tooltip-arrow {
    left: -5px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    border-right: none;
    border-top: none;
  }
</style>
