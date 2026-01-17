<!--
  @component Link

  A minimal link component with optional trailing icon.
  Renders as <a> with href, or <button> without.

  @example Basic link
  <Link href="/about">Learn more</Link>

  @example Button mode
  <Link onclick={handleClick}>View details</Link>

  @example Without icon
  <Link href="/docs" showIcon={false}>Documentation</Link>

  @example Custom icon
  <Link href="/external" external>
    {#snippet icon()}
      <ExternalIcon size={14} />
    {/snippet}
    External Link
  </Link>
-->
<script>
  let {
    href = null,
    external = false,
    showIcon = true,
    class: className = '',
    onclick,
    children,
    icon,
    ...rest
  } = $props();

  const target = external ? '_blank' : undefined;
  const rel = external ? 'noopener noreferrer' : undefined;
</script>

{#if href}
  <a {href} {target} {rel} class="link {className}" {...rest}>
    {#if children}
      {@render children()}
    {/if}
    {#if showIcon}
      {#if icon}
        {@render icon()}
      {:else}
        <svg
          class="link-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      {/if}
    {/if}
  </a>
{:else}
  <button type="button" class="link {className}" {onclick} {...rest}>
    {#if children}
      {@render children()}
    {/if}
    {#if showIcon}
      {#if icon}
        {@render icon()}
      {:else}
        <svg
          class="link-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      {/if}
    {/if}
  </button>
{/if}

<style>
  .link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-base0D);
    text-decoration: none;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .link:hover {
    color: color-mix(in srgb, var(--color-base0D) 80%, transparent);
  }

  .link-icon {
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .link:hover .link-icon {
    transform: translate(2px, -2px);
  }
</style>
