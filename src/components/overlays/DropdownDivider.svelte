<!--
  @component DropdownDivider

  A divider within a Dropdown menu.

  @example
  <DropdownItem>Edit</DropdownItem>
  <DropdownDivider />
  <DropdownItem variant="danger">Delete</DropdownItem>
-->
<script>
  let { class: className = '' } = $props();
</script>

<div class="dropdown-divider {className}" role="separator"></div>

<style>
  .dropdown-divider {
    height: 1px;
    margin: var(--space-1) 0;
    background: var(--color-base02);
  }
</style>
