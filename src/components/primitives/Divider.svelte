<!--
  @component Divider

  A visual separator for content sections.

  @example Horizontal divider
  <Divider />

  @example Vertical divider
  <Divider orientation="vertical" />

  @example With label
  <Divider>
    or continue with
  </Divider>
-->
<script>
  let {
    orientation = 'horizontal',
    thickness = '1px',
    spacing = '1rem',
    children,
    class: className = ''
  } = $props();

  const isHorizontal = $derived(orientation === 'horizontal');
</script>

{#if children}
  <div
    class="divider divider-{orientation} divider-labeled {className}"
    style="--divider-spacing: {spacing};"
    role="separator"
    aria-orientation={orientation}
  >
    <span class="divider-line" style="--divider-thickness: {thickness};"></span>
    <span class="divider-label">
      {@render children()}
    </span>
    <span class="divider-line" style="--divider-thickness: {thickness};"></span>
  </div>
{:else}
  <div
    class="divider divider-{orientation} {className}"
    style="--divider-thickness: {thickness}; --divider-spacing: {spacing};"
    role="separator"
    aria-orientation={orientation}
  ></div>
{/if}

<style>
  .divider {
    background: color-mix(in srgb, var(--color-base04) 30%, transparent);
    flex-shrink: 0;
  }

  .divider-horizontal {
    width: 100%;
    height: var(--divider-thickness, 1px);
    margin: var(--divider-spacing, 1rem) 0;
  }

  .divider-vertical {
    width: var(--divider-thickness, 1px);
    height: 100%;
    margin: 0 var(--divider-spacing, 1rem);
  }

  .divider-labeled {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: transparent;
  }

  .divider-labeled.divider-horizontal {
    height: auto;
  }

  .divider-labeled.divider-vertical {
    flex-direction: column;
    width: auto;
  }

  .divider-line {
    flex: 1;
    background: color-mix(in srgb, var(--color-base04) 30%, transparent);
  }

  .divider-horizontal .divider-line {
    height: var(--divider-thickness, 1px);
  }

  .divider-vertical .divider-line {
    width: var(--divider-thickness, 1px);
  }

  .divider-label {
    font-size: 0.75rem;
    color: var(--color-base04);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
</style>
