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

  @example Small meta link (opt-in) — a quiet trailing link in a dense row
  <Link href="/settings/" size="sm" tone="meta">Open settings</Link>

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
    /** 'md' (default) | 'sm' — sm: 12px/500, a 12px icon, tighter gap (opt-in). */
    size = 'md',
    /** 'link' (default) | 'meta' — meta: quiet text (`--link-meta-color`, else base04) that darkens on hover (opt-in). */
    tone = 'link',
    class: className = '',
    onclick,
    children,
    icon,
    ...rest
  } = $props();

  const target = external ? '_blank' : undefined;
  const rel = external ? 'noopener noreferrer' : undefined;
  const optIn = $derived(
    `${size === 'sm' ? ' link-sm' : ''}${tone === 'meta' ? ' link-meta' : ''}`
  );
  const iconSize = $derived(size === 'sm' ? 12 : 14);
</script>

{#if href}
  <a {href} {target} {rel} class="link{optIn} {className}" {onclick} {...rest}>
    {#if children}
      {@render children()}
    {/if}
    {#if showIcon}
      {#if icon}
        {@render icon()}
      {:else}
        <svg
          class="link-icon"
          width={iconSize}
          height={iconSize}
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
  <button type="button" class="link{optIn} {className}" {onclick} {...rest}>
    {#if children}
      {@render children()}
    {/if}
    {#if showIcon}
      {#if icon}
        {@render icon()}
      {:else}
        <svg
          class="link-icon"
          width={iconSize}
          height={iconSize}
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
    font-weight: var(--font-weight-medium);
    color: var(--color-base0D);
    text-decoration: none;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: color var(--duration-fast) ease;
  }

  .link:hover {
    color: color-mix(in srgb, var(--color-base0D) 80%, transparent);
  }

  /* Small + meta (opt-in): a quiet trailing link in a dense row. */
  .link-sm {
    gap: 0.25rem;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }

  .link-meta {
    color: var(--link-meta-color, var(--color-base04));
  }

  .link-meta:hover {
    color: var(--color-base06);
  }

  .link-meta:focus-visible {
    outline: none;
    border-radius: var(--radius-sm);
    box-shadow: var(--focus-ring-shadow, 0 0 0 2px var(--color-base0D));
  }

  .link-icon {
    flex-shrink: 0;
    transition: transform var(--duration-fast) ease;
  }

  .link:hover .link-icon {
    transform: translate(2px, -2px);
  }
</style>
