<!--
  @component DropdownItem

  An item within a Dropdown menu. Has role="menuitem" for ARIA.

  @example
  <DropdownItem onclick={handleAction}>Action</DropdownItem>

  @example
  <DropdownItem onclick={handleDelete} variant="danger">Delete</DropdownItem>
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    variant = 'default',
    disabled = false,
    icon,
    children,
    onclick,
    class: className = '',
    ...rest
  } = $props();

  function handleClick(e) {
    if (!disabled) onclick?.(e);
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  }
</script>

<button
  type="button"
  role="menuitem"
  class={cn(
    'dropdown-item',
    `dropdown-item-${variant}`,
    disabled && 'dropdown-item-disabled',
    className
  )}
  {disabled}
  onclick={handleClick}
  onkeydown={handleKeydown}
  tabindex={disabled ? -1 : 0}
  {...rest}
>
  {#if icon}
    <span class="dropdown-item-icon">
      {@render icon()}
    </span>
  {/if}
  <span class="dropdown-item-label">
    {@render children?.()}
  </span>
</button>

<style>
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-1-5, 0.375rem) var(--space-2);
    font-size: var(--text-sm);
    text-align: left;
    color: var(--color-base05);
    background: transparent;
    border: none;
    border-radius: var(--radius-default);
    cursor: pointer;
    transition: var(--transition-colors);
    outline: none;
  }

  .dropdown-item:hover:not(:disabled),
  .dropdown-item:focus-visible:not(:disabled) {
    background: color-mix(in srgb, var(--color-base02) 60%, transparent);
    color: var(--color-base06);
  }

  .dropdown-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dropdown-item-danger {
    color: var(--color-base08);
  }

  .dropdown-item-danger:hover:not(:disabled),
  .dropdown-item-danger:focus-visible:not(:disabled) {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
    color: var(--color-base08);
  }

  .dropdown-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .dropdown-item-label {
    flex: 1;
  }
</style>
