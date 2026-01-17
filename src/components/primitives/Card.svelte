<!--
  @component Card

  A flexible card container with optional title and variants.

  @example Basic
  <Card>
    <p>Card content here</p>
  </Card>

  @example With title
  <Card title="Settings">
    <p>Your settings content</p>
  </Card>

  @example Danger variant
  <Card title="Danger Zone" variant="danger">
    <Button variant="danger">Delete Account</Button>
  </Card>
-->
<script>
  let {
    title = '',
    variant = 'default',
    class: className = '',
    children
  } = $props();
</script>

<div class="card card-{variant} {className}">
  {#if title}
    <h3 class="card-title">{@html title}</h3>
  {/if}
  <div class="card-content">
    {@render children?.()}
  </div>
</div>

<style>
  .card {
    background: transparent;
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    transition: border-color 0.2s ease;
  }

  .card:hover {
    border-color: var(--color-base03);
  }

  .card-danger {
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
    background: color-mix(in srgb, var(--color-base08) 3%, transparent);
  }

  .card-danger:hover {
    border-color: color-mix(in srgb, var(--color-base08) 40%, transparent);
  }

  .card-warning {
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
    background: color-mix(in srgb, var(--color-base0A) 3%, transparent);
  }

  .card-warning:hover {
    border-color: color-mix(in srgb, var(--color-base0A) 40%, transparent);
  }

  .card-success {
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
    background: color-mix(in srgb, var(--color-base0B) 3%, transparent);
  }

  .card-success:hover {
    border-color: color-mix(in srgb, var(--color-base0B) 40%, transparent);
  }

  .card-title {
    margin: 0 0 var(--space-5) 0;
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--color-base07);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .card-danger .card-title {
    color: var(--color-base08);
  }

  .card-warning .card-title {
    color: var(--color-base0A);
  }

  .card-success .card-title {
    color: var(--color-base0B);
  }

  .card-content {
    /* Allow child components to handle their own spacing */
  }
</style>
