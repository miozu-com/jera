<!-- Accordion handing its state to AccordionItem through the children snippet argument. -->
<script>
  import Accordion from '../../src/components/navigation/Accordion.svelte';
  import AccordionItem from '../../src/components/navigation/AccordionItem.svelte';

  let { expanded = [], multiple = false } = $props();
</script>

<Accordion {expanded} {multiple} class="faq" data-testid="acc">
  {#snippet children(accordion)}
    <AccordionItem {accordion} id="a" title="First">Body A</AccordionItem>
    <AccordionItem {accordion} id="b" title="Second" badge="3">Body B</AccordionItem>
  {/snippet}
</Accordion>
