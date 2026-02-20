<!--
  @component ChipNav

  Horizontal inline navigation using compact chip-style links.
  Same active state colors as LeftBarItem — just compact and horizontal.
  Uses <a> tags with data-sveltekit-preload-data for proper client-side navigation.

  Props:
    items       - Array of {id, label, href, badge?, icon?} navigation items
    active      - ID of the currently active item
    size        - 'sm' (default) or 'md'
    renderIcon  - Snippet: (name, size) => renders an icon component
    class       - Additional CSS class

  @example Basic
  <ChipNav
    items={[
      {id: 'specs', label: 'Specs', href: '/tests/specs'},
      {id: 'runs', label: 'Runs', href: '/tests/runs'}
    ]}
    active="specs"
  />

  @example With badges
  <ChipNav
    items={[
      {id: 'inbox', label: 'Inbox', href: '/mail/inbox', badge: 12},
      {id: 'sent', label: 'Sent', href: '/mail/sent'}
    ]}
    active="inbox"
  />
-->
<script>
  let {
    items = [],
    active = '',
    size = 'sm',
    renderIcon,
    class: className = ''
  } = $props();

  const iconSize = $derived(size === 'sm' ? 12 : 14);
</script>

<nav class="chip-nav chip-nav-{size} {className}">
  {#each items as item}
    <a
      href={item.href}
      class="chip"
      class:active={active === item.id}
      data-sveltekit-preload-data="hover"
    >
      {#if item.icon && renderIcon}
        {@render renderIcon(item.icon, iconSize)}
      {/if}
      {item.label}
      {#if item.badge != null}
        <span class="chip-badge">{item.badge}</span>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .chip-nav {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .chip-nav::-webkit-scrollbar {
    display: none;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0.25rem var(--space-2);
    border-radius: var(--radius-md);
    background: transparent;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.01em;
    color: var(--color-base04);
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
    transition: color 150ms ease, background-color 150ms ease;
  }

  .chip:hover {
    color: var(--color-base06);
    background-color: color-mix(in srgb, var(--color-base02) 50%, transparent);
  }

  .chip.active {
    color: var(--color-base0D);
    background-color: color-mix(in srgb, var(--color-base0D) 15%, transparent);
  }

  /* Sizes */
  .chip-nav-sm .chip {
    font-size: var(--text-xs);
    padding: 0.1875rem var(--space-2);
  }

  .chip-nav-md .chip {
    font-size: var(--text-sm);
    padding: 0.25rem var(--space-2-5);
  }

  /* Badge */
  .chip-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1rem;
    height: 1rem;
    padding: 0 3px;
    font-size: 9px;
    font-weight: 600;
    background: var(--color-base09);
    color: var(--color-base00);
    border-radius: 9999px;
  }

  .chip.active .chip-badge {
    background: var(--color-base0D);
  }
</style>
