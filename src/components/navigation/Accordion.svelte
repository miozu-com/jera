<!--
  @component Accordion

  Collapsible content sections.

  @example Single item
  <Accordion>
    <AccordionItem title="Section 1">
      Content for section 1
    </AccordionItem>
    <AccordionItem title="Section 2">
      Content for section 2
    </AccordionItem>
  </Accordion>

  @example Controlled
  <Accordion bind:expanded={openSections} multiple>
    ...
  </Accordion>
-->
<script>
  import { setContext } from 'svelte';

  let {
    expanded = $bindable([]),
    multiple = false,
    children,
    class: className = ''
  } = $props();

  function toggle(id) {
    if (multiple) {
      if (expanded.includes(id)) {
        expanded = expanded.filter(i => i !== id);
      } else {
        expanded = [...expanded, id];
      }
    } else {
      expanded = expanded.includes(id) ? [] : [id];
    }
  }

  function isExpanded(id) {
    return expanded.includes(id);
  }

  setContext('accordion', {
    toggle,
    isExpanded: (id) => expanded.includes(id)
  });
</script>

<div class="accordion {className}">
  {@render children?.()}
</div>

<style>
  .accordion {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-base03);
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
