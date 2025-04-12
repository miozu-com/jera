<script>
  let {
    value = '',
    ref = $bindable(),
    type = 'text',
    placeholder = '',
    disabled = false,
    required = false,
    name = '',
    id = '',
    autocomplete = 'on',
    autocorrect = 'off',
    autocapitalize = 'off',
    spellcheck = 'false',
    maxlength = undefined,
    minlength = undefined,
    inputmode,
    class: className = '',
    unstyled = false,
    disableBrowserFeatures = false,
    oninput = () => {},
    onchange = () => {},
    onkeydown = () => {},
    ...others
  } = $props();

  const finalAutocomplete = disableBrowserFeatures ? 'new-password' : autocomplete;
  const finalClassName = $derived(unstyled ? className : `base-input ${className}`);
</script>

<input
  class={finalClassName}
  bind:this={ref}
  {id}
  {name}
  {type}
  {value}
  {placeholder}
  {disabled}
  {required}
  {inputmode}
  {maxlength}
  {minlength}
  autocomplete={finalAutocomplete}
  autocorrect={disableBrowserFeatures ? 'off' : autocorrect}
  autocapitalize={disableBrowserFeatures ? 'off' : autocapitalize}
  spellcheck={disableBrowserFeatures ? 'false' : spellcheck}
  data-form-type={disableBrowserFeatures ? 'other' : undefined}
  data-lpignore={disableBrowserFeatures ? 'true' : undefined}
  {oninput}
  {onchange}
  {onkeydown}
  {...others}
/>

<style>
  .input-wrapper {
    @apply relative;
  }
  .input-label {
    @apply font-bold inline-block;
  }
</style>
