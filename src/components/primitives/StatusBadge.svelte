<!--
  @component StatusBadge

  A status indicator badge with semantic color variants.

  @example Status variants
  <StatusBadge variant="pending">Pending</StatusBadge>
  <StatusBadge variant="approved">Approved</StatusBadge>
  <StatusBadge variant="rejected">Rejected</StatusBadge>

  @example Role variants
  <StatusBadge variant="owner">Owner</StatusBadge>
  <StatusBadge variant="admin">Admin</StatusBadge>
  <StatusBadge variant="member">Member</StatusBadge>

  @example Connection status
  <StatusBadge variant="connected">Connected</StatusBadge>
  <StatusBadge variant="disconnected">Disconnected</StatusBadge>
-->
<script>
  let {
    variant = 'default',
    size = 'md',
    class: className = '',
    children
  } = $props();
</script>

<span class="status-badge status-badge-{variant} status-badge-{size} {className}">
  {#if children}
    {@render children()}
  {:else}
    {variant}
  {/if}
</span>

<style>
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: var(--radius-md);
    border: 1px solid;
    font-weight: 500;
    transition: background 0.2s ease;
  }

  /* Sizes */
  .status-badge-sm {
    padding: 0.125rem 0.5rem;
    font-size: var(--text-xs);
  }

  .status-badge-md {
    padding: 0.25rem 0.5rem;
    font-size: var(--text-xs);
  }

  .status-badge-lg {
    padding: 0.375rem 0.75rem;
    font-size: var(--text-sm);
  }

  /* Default */
  .status-badge-default {
    background: color-mix(in srgb, var(--color-base04) 10%, transparent);
    color: var(--color-base04);
    border-color: color-mix(in srgb, var(--color-base04) 30%, transparent);
  }

  /* Status variants */
  .status-badge-pending {
    background: color-mix(in srgb, var(--color-base0A) 10%, transparent);
    color: var(--color-base0A);
    border-color: color-mix(in srgb, var(--color-base0A) 30%, transparent);
  }

  .status-badge-approved,
  .status-badge-success,
  .status-badge-connected {
    background: color-mix(in srgb, var(--color-base0B) 10%, transparent);
    color: var(--color-base0B);
    border-color: color-mix(in srgb, var(--color-base0B) 30%, transparent);
  }

  .status-badge-rejected,
  .status-badge-error,
  .status-badge-disconnected {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    color: var(--color-base08);
    border-color: color-mix(in srgb, var(--color-base08) 30%, transparent);
  }

  /* Role variants */
  .status-badge-owner,
  .status-badge-primary,
  .status-badge-public {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }

  .status-badge-admin {
    background: color-mix(in srgb, var(--color-base0C) 10%, transparent);
    color: var(--color-base0C);
    border-color: color-mix(in srgb, var(--color-base0C) 30%, transparent);
  }

  .status-badge-member,
  .status-badge-private {
    background: color-mix(in srgb, var(--color-base04) 10%, transparent);
    color: var(--color-base04);
    border-color: color-mix(in srgb, var(--color-base04) 30%, transparent);
  }

  /* Info variant */
  .status-badge-info {
    background: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    color: var(--color-base0D);
    border-color: color-mix(in srgb, var(--color-base0D) 30%, transparent);
  }
</style>
