<!--
  @component Dropdown

  An action menu dropdown component.

  @example
  <Dropdown>
    {#snippet trigger()}
      <Button>Options</Button>
    {/snippet}
    <DropdownItem onclick={handleEdit}>Edit</DropdownItem>
    <DropdownItem onclick={handleDelete} variant="danger">Delete</DropdownItem>
  </Dropdown>
-->
<script>
  import { clickOutside, escapeKey } from '../../actions/index.js';
  import { cn } from '../../utils/cn.svelte.js';

  let {
    open = $bindable(false),
    position = 'bottom-start',
    trigger,
    children,
    class: className = ''
  } = $props();

  let dropdownEl = $state(null);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  // Position classes
  const positionMap = {
    'bottom-start': 'dropdown-bottom-start',
    'bottom-end': 'dropdown-bottom-end',
    'bottom-center': 'dropdown-bottom-center',
    'top-start': 'dropdown-top-start',
    'top-end': 'dropdown-top-end',
    'top-center': 'dropdown-top-center'
  };
</script>

<div
  class={cn('dropdown', className)}
  bind:this={dropdownEl}
  use:clickOutside={close}
  use:escapeKey={close}
>
  <div class="dropdown-trigger" onclick={toggle}>
    {@render trigger?.()}
  </div>

  {#if open}
    <div class="dropdown-content {positionMap[position] || positionMap['bottom-start']}">
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    display: inline-flex;
  }

  .dropdown-content {
    position: absolute;
    z-index: 50;
    min-width: 10rem;
    padding: var(--space-1);
    background: var(--color-base00);
    border: 1px solid var(--color-base03);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    animation: dropdown-enter 0.15s ease-out;
  }

  /* Position variants */
  .dropdown-bottom-start {
    top: 100%;
    left: 0;
    margin-top: var(--space-1);
  }

  .dropdown-bottom-end {
    top: 100%;
    right: 0;
    margin-top: var(--space-1);
  }

  .dropdown-bottom-center {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--space-1);
  }

  .dropdown-top-start {
    bottom: 100%;
    left: 0;
    margin-bottom: var(--space-1);
  }

  .dropdown-top-end {
    bottom: 100%;
    right: 0;
    margin-bottom: var(--space-1);
  }

  .dropdown-top-center {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--space-1);
  }

  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-top-start,
  .dropdown-top-end,
  .dropdown-top-center {
    animation-name: dropdown-enter-up;
  }

  @keyframes dropdown-enter-up {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
