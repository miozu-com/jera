<!--
  @component Accordion

  Group container for collapsible sections. Controls shared expand/collapse state.

  @example Single-open (default)
  <Accordion>
    <AccordionItem title="Section 1">Content</AccordionItem>
    <AccordionItem title="Section 2">Content</AccordionItem>
  </Accordion>

  @example Multiple open
  <Accordion bind:expanded={openIds} multiple>
    <AccordionItem id="a" title="First">Content</AccordionItem>
    <AccordionItem id="b" title="Second" badge="3">Content</AccordionItem>
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
      expanded = expanded.includes(id)
        ? expanded.filter(i => i !== id)
        : [...expanded, id];
    } else {
      expanded = expanded.includes(id) ? [] : [id];
    }
  }

  setContext('accordion', {
    toggle,
    isExpanded: (id) => expanded.includes(id)
  });
</script>

<div class="jera-accordion {className}">
  {@render children?.()}
</div>

<style>
  .jera-accordion {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-default);
    overflow: hidden;
    background: color-mix(in srgb, var(--color-base01) 60%, transparent);
  }
</style>
