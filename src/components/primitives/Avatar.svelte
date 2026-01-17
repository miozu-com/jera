<!--
  @component Avatar

  User avatar with image, initials fallback, and status indicator.

  @example With image
  <Avatar src="/user.jpg" alt="John Doe" />

  @example With initials fallback
  <Avatar name="John Doe" />

  @example With status
  <Avatar src="/user.jpg" status="online" />
-->
<script>
  import { cv } from '../../utils/cn.svelte.js';

  let {
    src = '',
    alt = '',
    name = '',
    size = 'md',
    status = null,
    class: className = ''
  } = $props();

  // Generate initials from name
  const initials = $derived.by(() => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  });

  // Generate consistent color from name
  const bgColor = $derived.by(() => {
    if (!name) return 'var(--color-base03)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'var(--color-base08)',     // red
      'var(--orange)',          // orange
      'var(--color-base0B)',   // green
      'var(--color-base0A)',   // yellow
      'var(--color-base0D)',      // blue
      'var(--color-base0D)',   // magenta
      'var(--peach)',           // peach
      'var(--color-base0E)'     // cyan
    ];
    return colors[Math.abs(hash) % colors.length];
  });

  let imgError = $state(false);
  const showImage = $derived(src && !imgError);
</script>

<div class="avatar avatar-{size} {className}">
  {#if showImage}
    <img
      {src}
      alt={alt || name}
      class="avatar-image"
      onerror={() => imgError = true}
    />
  {:else}
    <span class="avatar-initials" style="background: {bgColor};">
      {initials}
    </span>
  {/if}

  {#if status}
    <span class="avatar-status avatar-status-{status}"></span>
  {/if}
</div>

<style>
  .avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* Size variants */
  .avatar-xs { width: 1.5rem; height: 1.5rem; font-size: 0.625rem; }
  .avatar-sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
  .avatar-md { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; }
  .avatar-lg { width: 3rem; height: 3rem; font-size: 1rem; }
  .avatar-xl { width: 4rem; height: 4rem; font-size: 1.25rem; }
  .avatar-2xl { width: 5rem; height: 5rem; font-size: 1.5rem; }

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
    color: white;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .avatar-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 25%;
    height: 25%;
    min-width: 8px;
    min-height: 8px;
    border-radius: 50%;
    border: 2px solid var(--color-base00);
  }

  .avatar-status-online { background: var(--color-base0B); }
  .avatar-status-offline { background: var(--color-base04); }
  .avatar-status-busy { background: var(--color-base08); }
  .avatar-status-away { background: var(--color-base0A); }
</style>
