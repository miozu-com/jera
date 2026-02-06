<!--
  @component MemberCard

  A card displaying a team member with avatar, name, role, and actions.
  Supports various layouts and interactive states.

  @example Basic member card
  <MemberCard
    name="John Doe"
    email="john@example.com"
    role="Developer"
  />

  @example With avatar and status
  <MemberCard
    name="Jane Smith"
    email="jane@example.com"
    role="Admin"
    avatarUrl="/avatars/jane.jpg"
    status="online"
  />

  @example With actions
  <MemberCard name="Bob Wilson" email="bob@example.com">
    {#snippet actions()}
      <Button size="sm" variant="ghost">Edit</Button>
      <Button size="sm" variant="danger">Remove</Button>
    {/snippet}
  </MemberCard>

  @example Compact variant
  <MemberCard
    name="Alice Johnson"
    role="Designer"
    variant="compact"
  />
-->
<script>
  let {
    name = '',
    email = '',
    role = '',
    avatarUrl = null,
    status = null,
    timestamp = null,
    variant = 'default',
    class: className = '',
    badge,
    actions,
    onclick
  } = $props();

  const initials = $derived.by(() => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2);
  });

  const statusColors = {
    online: 'status-online',
    offline: 'status-offline',
    away: 'status-away',
    busy: 'status-busy'
  };

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<div
  class="member-card member-card-{variant} {onclick ? 'member-card-clickable' : ''} {className}"
  {onclick}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
>
  <div class="member-avatar">
    {#if avatarUrl}
      <img src={avatarUrl} alt={name} class="avatar-image" />
    {:else}
      <span class="avatar-initials">{initials.toUpperCase()}</span>
    {/if}
    {#if status}
      <span class="avatar-status {statusColors[status] || ''}"></span>
    {/if}
  </div>

  <div class="member-info">
    <div class="member-name">{name}</div>
    {#if variant !== 'compact' && email}
      <div class="member-email">{email}</div>
    {/if}
    {#if role || timestamp}
      <div class="member-meta">
        {#if role}
          <span class="member-role">{role}</span>
        {/if}
        {#if timestamp}
          <span class="member-timestamp">{formatRelativeTime(timestamp)}</span>
        {/if}
      </div>
    {/if}
  </div>

  {#if badge}
    <div class="member-badge">
      {@render badge()}
    </div>
  {/if}

  {#if actions}
    <div class="member-actions" onclick={(e) => e.stopPropagation()}>
      {@render actions()}
    </div>
  {/if}
</div>

<style>
  .member-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: transparent;
    border-radius: var(--radius-lg);
    transition: background 0.15s ease;
  }

  .member-card-default {
    padding: var(--space-4);
  }

  .member-card-compact {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .member-card-clickable {
    cursor: pointer;
  }

  .member-card-clickable:hover {
    background: var(--color-base01);
  }

  .member-card-clickable:focus-visible {
    outline: 2px solid var(--color-base0D);
    outline-offset: 2px;
  }

  .member-avatar {
    position: relative;
    flex-shrink: 0;
    width: var(--space-10);
    height: var(--space-10);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-base0D) 15%, transparent);
    overflow: hidden;
  }

  .member-card-compact .member-avatar {
    width: var(--space-8);
    height: var(--space-8);
    border-radius: var(--radius-md);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-base0D);
  }

  .member-card-compact .avatar-initials {
    font-size: var(--text-xs);
  }

  .avatar-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: var(--space-3);
    height: var(--space-3);
    border-radius: var(--radius-full);
    border: 2px solid var(--color-base00);
  }

  .status-online {
    background: var(--color-base0B);
  }

  .status-offline {
    background: var(--color-base03);
  }

  .status-away {
    background: var(--color-base0A);
  }

  .status-busy {
    background: var(--color-base08);
  }

  .member-info {
    flex: 1;
    min-width: 0;
  }

  .member-name {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-base06);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .member-card-compact .member-name {
    font-size: var(--text-xs);
  }

  .member-email {
    font-size: var(--text-xs);
    color: var(--color-base04);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .member-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .member-role {
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .member-timestamp {
    font-size: var(--text-xs);
    color: var(--color-base03);
  }

  .member-timestamp::before {
    content: '·';
    margin-right: var(--space-2);
    color: var(--color-base03);
  }

  .member-badge {
    flex-shrink: 0;
  }

  .member-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .member-card:hover .member-actions {
    opacity: 1;
  }
</style>
