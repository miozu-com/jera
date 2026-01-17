<!--
  @component DropdownItem

  An item within a Dropdown menu.

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
</script>

<button
  type="button"
  class={cn(
    'dropdown-item',
    `dropdown-item-${variant}`,
    disabled && 'dropdown-item-disabled',
    className
  )}
  {disabled}
  {onclick}
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
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    text-align: left;
    color: var(--color-base05);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .dropdown-item:hover:not(:disabled) {
    background: var(--color-base02);
  }

  .dropdown-item:focus-visible {
    outline: none;
    background: var(--color-base02);
  }

  .dropdown-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dropdown-item-danger {
    color: var(--color-base08);
  }

  .dropdown-item-danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);
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
