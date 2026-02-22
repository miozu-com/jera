<!--
  @component Avatar

  User avatar with image, algorithmic fallback, initials, and status indicator.

  @example With image
  <Avatar src="/user.jpg" name="John Doe" />

  @example With algorithmic fallback
  <Avatar seed="user-uuid" size="lg" />

  @example Custom border radius
  <Avatar seed="user-uuid" radius={12} />

  @example With status
  <Avatar src="/user.jpg" status="online" size="md" />
-->
<script>
  import { generateAvatarDataURL } from '../../utils/avatar.js';

  let {
    src = '',
    seed = '',
    alt = '',
    name = '',
    size = 'md',
    status = null,
    radius = 4,
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

  // Generate consistent base16 bg color from name for initials fallback
  const bgColor = $derived.by(() => {
    if (!name) return 'var(--color-base03)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'var(--color-base08)',
      'var(--color-base09)',
      'var(--color-base0A)',
      'var(--color-base0B)',
      'var(--color-base0C)',
      'var(--color-base0D)',
      'var(--color-base0E)',
      'var(--color-base0F)'
    ];
    return colors[Math.abs(hash) % colors.length];
  });

  // Algorithmic avatar data URL (generated once per seed)
  const algorithmicSrc = $derived(
    seed ? generateAvatarDataURL(seed, { size: 128 }) : ''
  );

  let imgError = $state(false);

  // Reset error state when src changes
  $effect(() => {
    src;
    imgError = false;
  });

  // Rendering chain:
  // 1. src truthy + no error → <img> with src
  // 2. src failed or empty, seed truthy → algorithmic avatar
  // 3. neither → initials from name
  // 4. nothing → placeholder icon
  const showImage = $derived(src && !imgError);
  const showAlgorithmic = $derived(!showImage && !!algorithmicSrc);
  const showInitials = $derived(!showImage && !showAlgorithmic && !!initials);

  // Normalize radius: numbers become px, strings pass through (e.g. '50%')
  const borderRadius = $derived(
    typeof radius === 'number' ? `${radius}px` : radius
  );
</script>

<div class="avatar avatar-{size} {className}" style="border-radius: {borderRadius};">
  {#if showImage}
    <img
      {src}
      alt={alt || name || 'Avatar'}
      class="avatar-image"
      onerror={() => imgError = true}
    />
  {:else if showAlgorithmic}
    <img
      src={algorithmicSrc}
      alt={alt || name || 'Avatar'}
      class="avatar-image"
    />
  {:else if showInitials}
    <span class="avatar-initials" style="background: {bgColor};">
      {initials}
    </span>
  {:else}
    <span class="avatar-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="avatar-placeholder-icon">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
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

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--color-base03, #3b3b3b);
    color: var(--color-base05, #999);
  }

  .avatar-placeholder-icon {
    width: 60%;
    height: 60%;
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
