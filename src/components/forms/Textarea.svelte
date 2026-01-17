<!--
  @component Textarea

  A multi-line text input component.

  @example
  <Textarea bind:value={description} placeholder="Enter description" rows={4} />

  @example
  // Auto-resize based on content
  <Textarea bind:value={notes} autoResize />
-->
<script>
  import { cn } from '../../utils/cn.svelte.js';

  let {
    value = $bindable(''),
    ref = $bindable(),
    placeholder = '',
    disabled = false,
    required = false,
    name = '',
    id = '',
    rows = 3,
    maxlength,
    minlength,
    autoResize = false,
    class: className = '',
    unstyled = false,
    error = false,
    oninput,
    onchange,
    onkeydown,
    onfocus,
    onblur,
    ...rest
  } = $props();

  const textareaClass = $derived(
    unstyled ? className : cn(
      'textarea-base',
      autoResize && 'textarea-auto-resize',
      error && 'textarea-error',
      className
    )
  );

  function handleInput(e) {
    if (autoResize && ref) {
      ref.style.height = 'auto';
      ref.style.height = ref.scrollHeight + 'px';
    }
    oninput?.(e);
  }
</script>

<textarea
  class={textareaClass}
  bind:this={ref}
  bind:value
  {id}
  {name}
  {rows}
  {placeholder}
  {disabled}
  {required}
  {maxlength}
  {minlength}
  aria-invalid={error || undefined}
  oninput={handleInput}
  {onchange}
  {onkeydown}
  {onfocus}
  {onblur}
  {...rest}
></textarea>

<style>
  .textarea-base {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--color-base07);
    background-color: var(--color-base00);
    border: 1px solid var(--color-base02);
    border-radius: var(--radius-lg);
    transition: var(--transition-colors);
    resize: vertical;
    font-family: inherit;
  }

  .textarea-base::placeholder {
    color: var(--color-base04);
  }

  .textarea-base:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .textarea-base:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    resize: none;
  }

  .textarea-auto-resize {
    resize: none;
    overflow: hidden;
  }

  .textarea-error {
    border-color: var(--color-base08);
  }

  .textarea-error:focus {
    border-color: var(--color-base08);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base08) 20%, transparent);
  }
</style>
