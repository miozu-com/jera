<!-- A LeftBar wired the 0.11.0 way: every snippet takes the bar as its argument
     and every child gets it as the `bar` prop. -->
<script>
  import LeftBar from '../../src/components/navigation/LeftBar.svelte';
  import LeftBarSection from '../../src/components/navigation/LeftBarSection.svelte';
  import LeftBarItem from '../../src/components/navigation/LeftBarItem.svelte';
  import LeftBarGroup from '../../src/components/navigation/LeftBarGroup.svelte';
  import LeftBarToggle from '../../src/components/navigation/LeftBarToggle.svelte';

  let { bar = null, collapsed = false, initialCollapsed = undefined } = $props();
</script>

<LeftBar {bar} {collapsed} {initialCollapsed}>
  {#snippet header(b)}
    <span data-header data-collapsed={String(b.collapsed)}></span>
  {/snippet}

  {#snippet navigation(b)}
    <LeftBarSection bar={b} title="Main">
      <LeftBarItem
        bar={b}
        href="/a/"
        label="Atlas"
        expandable
        expanded
        subroutes={[{ label: 'Needs fixing', href: '/a/fix/' }]}
      />
      <LeftBarItem bar={b} href="/home/" label="Home" />
    </LeftBarSection>
    <LeftBarGroup bar={b} title="Accounts" items={[{ id: 'shop-1', name: 'Shop' }]} expanded />
  {/snippet}

  {#snippet footer(b)}
    <LeftBarToggle bar={b} />
  {/snippet}
</LeftBar>
