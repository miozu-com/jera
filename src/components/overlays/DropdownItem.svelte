<!--
  @component DropdownItem

  An item within a Dropdown menu. Has role="menuitem" for ARIA.

  @example
  <DropdownItem onclick={handleAction}>Action</DropdownItem>

  @example
  <DropdownItem onclick={handleDelete} variant="danger">Delete</DropdownItem>

  @example Right-aligned meta (a price, a shortcut)
  <DropdownItem onclick={shorten} meta="5¢">Make it shorter</DropdownItem>

  `meta` is a string or a snippet, rendered after the label in small base04
  text. It is part of the item's accessible name, so keep it short.

  @example Checked items (a view or sort choice)
  <DropdownItem checked={sort === 'price'} onclick={() => (sort = 'price')}>Price</DropdownItem>

  Setting `checked` (true or false) makes the item a `menuitemradio` with
  `aria-checked` and a leading check mark slot; `checkType="checkbox"` makes it
  a `menuitemcheckbox` for independent toggles. Leave `checked` unset for a
  plain action item.
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    variant = 'default',
    disabled = false,
    icon,
    meta,
    checked = undefined,
    checkType = 'radio',
    children,
    onclick,
    class: className = '',
    ...rest
  } = $props();

  const checkable = $derived(checked !== undefined && checked !== null);
  const role = $derived(
    !checkable ? 'menuitem' : checkType === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio'
  );

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
  {role}
  aria-checked={checkable ? !!checked : undefined}
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
  {#if checkable}
    <span class="dropdown-item-check" aria-hidden="true">
      {#if checked}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      {/if}
    </span>
  {/if}
  {#if icon}
    <span class="dropdown-item-icon">
      {@render icon()}
    </span>
  {/if}
  <span class="dropdown-item-label">
    {@render children?.()}
  </span>
  {#if meta}
    <span class="dropdown-item-meta">
      {#if typeof meta === 'function'}{@render meta()}{:else}{meta}{/if}
    </span>
  {/if}
</button>

<style>
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    padding: var(--space-3, 0.375rem) var(--space-4);
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

  /* Fixed slot so checked and unchecked rows keep one left edge. */
  .dropdown-item-check {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 0.875rem;
    margin-right: calc(var(--space-2) * -1);
    color: var(--color-base0D);
  }

  .dropdown-item-label {
    flex: 1;
  }

  .dropdown-item-meta {
    flex-shrink: 0;
    margin-left: var(--space-4);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color-base04);
  }
</style>
