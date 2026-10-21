<!-- RadioGroup handing its state to Radio through the children snippet argument. -->
<script>
  import RadioGroup from '../../src/components/forms/RadioGroup.svelte';
  import Radio from '../../src/components/forms/Radio.svelte';

  let { value = null, name = 'plan', disabled = false, variant = 'default', unwired = false } = $props();
</script>

<RadioGroup {value} {name} {disabled} {variant} aria-label="Plan">
  {#snippet children(group)}
    <Radio {group} value="monthly" label="Monthly" id="r-monthly" />
    <Radio {group} value="yearly" label="Yearly" description="Two months off" />
    {#if unwired}<Radio value="lost" label="Lost" />{/if}
  {/snippet}
</RadioGroup>
