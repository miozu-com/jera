<!--
  @component Accordion

  Group container for collapsible sections. It owns one AccordionState and
  hands it to the children snippet; every AccordionItem takes it as the
  `accordion` prop (no context). An AccordionItem without the prop is a solo
  disclosure — inside an Accordion that is a mistake, and dev throws on it.

  The dev guard is a one-time DOM scan after mount (client only, Vite's
  `import.meta.env.DEV`). Blind spots: an item mounted later (async or lazily
  imported content) is never checked, and an item portaled out of the
  Accordion's subtree is invisible to it. Both render as silent solo sections.

  @example Single-open (default)
  <Accordion>
    {#snippet children(accordion)}
      <AccordionItem {accordion} title="Section 1">Content</AccordionItem>
      <AccordionItem {accordion} title="Section 2">Content</AccordionItem>
    {/snippet}
  </Accordion>

  @example Multiple open
  <Accordion bind:expanded={openIds} multiple>
    {#snippet children(accordion)}
      <AccordionItem {accordion} id="a" title="First">Content</AccordionItem>
      <AccordionItem {accordion} id="b" title="Second" badge="3">Content</AccordionItem>
    {/snippet}
  </Accordion>
-->
<script module>
  export { AccordionState } from './accordion.svelte.js';
</script>

<script>
  import { untrack } from 'svelte';
  import { AccordionState } from './accordion.svelte.js';

  let {
    expanded = $bindable([]),
    multiple = false,
    /** Snippet `(accordion: AccordionState)` — pass `accordion` to each AccordionItem. */
    children,
    class: className = '',
    ...rest
  } = $props();

  // Created once with the initial props (that is what the server renders);
  // the effect below keeps it in step when the props change.
  const accordion = untrack(
    () =>
      new AccordionState({
        expanded,
        multiple,
        onchange: (next) => {
          expanded = next;
        }
      })
  );

  $effect.pre(() => {
    accordion.sync({ expanded, multiple });
  });

  let root = $state(null);

  // Dev guard for the 0.11 migration: an item left without {accordion} renders
  // as a solo disclosure and silently leaves the group. Client-only (it runs
  // after mount). Only items in the group's own flow count: a solo item nested
  // inside another item's body (its nearest item/accordion ancestor is that
  // item, not this root) is a deliberate inner disclosure.
  $effect(() => {
    if (!import.meta.env?.DEV || !root) return;
    const orphan = [...root.querySelectorAll('.accordion-item-solo')].find(
      (el) => el.parentElement?.closest('.jera-accordion, .accordion-item') === root
    );
    if (orphan) {
      throw new Error(
        'jera AccordionItem inside <Accordion> is missing the `accordion` prop. Use <Accordion>{#snippet children(accordion)}<AccordionItem {accordion} …/>{/snippet}</Accordion>.'
      );
    }
  });
</script>

<div bind:this={root} class="jera-accordion {className}" {...rest}>
  {@render children?.(accordion)}
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
