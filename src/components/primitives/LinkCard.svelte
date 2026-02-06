<!--
  @component LinkCard

  A clickable card for navigation, commonly used in dashboards for quick-nav sections.

  @example Basic
  <LinkCard href="/services" label="Ops Hub" />

  @example With trailing icon
  <LinkCard href="/pm" label="PM Board">
    {#snippet trailing()}
      <ArrowRight size={14} />
    {/snippet}
  </LinkCard>

  @example Disabled
  <LinkCard href="/admin" label="Admin Panel" disabled />
-->
<script>
  let {
    href,
    label,
    disabled = false,
    class: className = '',
    trailing,
    ...rest
  } = $props();
</script>

{#if disabled}
  <div class="link-card link-card-disabled {className}" {...rest}>
    <span class="link-card-label">{label}</span>
    {#if trailing}
      <span class="link-card-trailing">
        {@render trailing()}
      </span>
    {/if}
  </div>
{:else}
  <a {href} class="link-card {className}" {...rest}>
    <span class="link-card-label">{label}</span>
    {#if trailing}
      <span class="link-card-trailing">
        {@render trailing()}
      </span>
    {/if}
  </a>
{/if}

<style>
  .link-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--color-base01);
    border: 1px solid var(--color-base02);
    text-decoration: none;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .link-card:hover {
    border-color: var(--color-base03);
    background: var(--color-base02);
  }

  .link-card:hover .link-card-trailing {
    color: var(--color-base06);
  }

  .link-card-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .link-card-disabled:hover {
    border-color: var(--color-base02);
    background: var(--color-base01);
  }

  .link-card-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base05);
  }

  .link-card-trailing {
    color: var(--color-base04);
    transition: color 0.2s ease;
  }
</style>
