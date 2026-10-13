<!-- Two Combobox instances in one render: their listbox and option ids must differ. -->
<script>
  import Combobox from '../../src/components/forms/Combobox.svelte';

  let { items = [] } = $props();
</script>

<Combobox open {items} label="First" />
<Combobox open {items} label="Second" />
