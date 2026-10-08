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

  @example With leading media and rich body (opt-in, revision 4)
  <LinkCard href="/p/1" label="Leather wallet">
    {#snippet leading()}<img src={photo} alt="" />{/snippet}
    <strong>Leather wallet</strong><span>$25 vs target $18</span>
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
    leading,
    children,
    ...rest
  } = $props();
</script>

{#if disabled}
  <div class="link-card link-card-disabled {className}" {...rest}>
    {#if leading}
      <span class="link-card-leading">{@render leading()}</span>
    {/if}
    {#if children}
      <span class="link-card-body">{@render children()}</span>
    {:else}
      <span class="link-card-label">{label}</span>
    {/if}
    {#if trailing}
      <span class="link-card-trailing">
        {@render trailing()}
      </span>
    {/if}
  </div>
{:else}
  <a {href} class="link-card {className}" {...rest}>
    {#if leading}
      <span class="link-card-leading">{@render leading()}</span>
    {/if}
    {#if children}
      <span class="link-card-body">{@render children()}</span>
    {:else}
      <span class="link-card-label">{label}</span>
    {/if}
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
    padding: var(--space-6) var(--space-8);
    border-radius: var(--radius-lg);
    background: var(--color-base01);
    border: var(--border-width-default) solid var(--color-base02);
    text-decoration: none;
    transition: border-color var(--duration-base) ease, background-color var(--duration-base) ease;
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
    font-weight: var(--font-weight-medium);
    color: var(--color-base05);
  }

  .link-card-leading {
    display: flex;
    flex: none;
    margin-right: var(--space-3, 0.75rem);
  }

  .link-card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    color: var(--color-base05);
  }

  .link-card-trailing {
    color: var(--color-base04);
    transition: color var(--duration-base) ease;
  }
</style>
