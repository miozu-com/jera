<!--
  @component Textarea

  A multi-line text input component.

  @example
  <Textarea bind:value={description} placeholder="Enter description" rows={4} />

  @example
  // Auto-resize based on content
  <Textarea bind:value={notes} autoResize />

  @example
  // Unstyled (opt-in): no border, background, padding or focus ring — the
  // frame around it owns those (a chat composer whose box also holds chips).
  // Keeps the text styles, the placeholder colour and autoResize. Every one of
  // these is a zero-specificity default: a class you pass overrides it.
  <div class="my-frame"><Textarea unstyled autoResize rows={2} /></div>
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
    size = 'md',
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

  // Feature detection: CSS field-sizing eliminates JS auto-resize
  const supportsFieldSizing = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

  const textareaClass = $derived(
    unstyled ? cn('textarea-unstyled', autoResize && 'textarea-auto-resize', className) : cn(
      'textarea-base',
      `textarea-${size}`,
      autoResize && 'textarea-auto-resize',
      error && 'textarea-error',
      className
    )
  );

  function handleInput(e) {
    if (autoResize && !supportsFieldSizing && ref) {
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
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--color-base07);
    background-color: var(--color-base00);
    border: var(--border-width-default) solid var(--color-base02);
    /* radius-md, not radius-lg (breaking, components.json Textarea rev 6):
       a Textarea beside an Input/Select in a form no longer draws a visibly
       larger corner than everything next to it (jera-lifecycle.md's border
       standard). */
    border-radius: var(--radius-md);
    transition: var(--transition-colors);
    resize: vertical;
    font-family: inherit;
  }

  /* Size scale, same padding/font steps as Input's (jera-lifecycle.md). `md`
     matches the unscaled rule above. */
  .textarea-sm {
    padding: 0.375rem 0.5rem;
    font-size: var(--text-xs, 0.75rem);
  }

  .textarea-md {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-sm);
  }

  .textarea-lg {
    padding: 0.75rem 1rem;
    font-size: var(--text-base, 1rem);
    border-radius: var(--radius-lg);
  }

  /* Unstyled (opt-in): the frame owns border, background, padding and the
     focus ring; the text keeps the field's own type and colour. Zero
     specificity (`:where`): these are defaults, and any class the consumer
     puts on the field wins over every one of them — an `unstyled` Textarea
     styled by its consumer before revision 7 (dash's product description
     editor: its own padding, line height and vertical resize) keeps its look. */
  :where(.textarea-unstyled) {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--color-base07);
    font-family: inherit;
    font-size: var(--text-sm);
    line-height: 1.5;
    resize: none;
    outline: none;
    box-shadow: none;
  }

  :where(.textarea-unstyled)::placeholder {
    color: var(--color-base04);
  }

  :where(.textarea-unstyled):disabled {
    cursor: not-allowed;
  }

  .textarea-base::placeholder {
    color: var(--color-base04);
  }

  .textarea-base:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
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

  /* Native auto-resize: Chrome 123+, Safari 26.2+ */
  @supports (field-sizing: content) {
    .textarea-auto-resize {
      field-sizing: content;
    }
  }

  .textarea-error {
    border-color: var(--color-base08);
  }

  .textarea-error:focus {
    border-color: var(--color-base08);
    box-shadow: var(--focus-ring-shadow-error);
  }

  /* Validation styling after user interaction (not on page load) */
  .textarea-base:user-invalid {
    border-color: var(--color-base08);
  }

  .textarea-base:user-invalid:focus {
    box-shadow: var(--focus-ring-shadow-error);
  }

  /* iOS Safari zooms the whole page when a control under 16px takes focus, and
     does not zoom back out — the page is left scrolled and oversized. On a chat
     composer that happens on every message sent from a phone. 16px is the
     documented threshold, so the rule meets it on touch pointers and leaves the
     mouse alone: `--text-sm` stays the design's size everywhere it is safe.
     Keyed on `pointer: coarse` rather than a width breakpoint, because the trap
     belongs to the input method and not to the viewport — a narrow desktop
     window has no zoom behaviour to avoid. */
  @media (pointer: coarse) {
    .textarea-base,
    .textarea-unstyled {
      font-size: max(16px, var(--text-sm));
    }
  }
</style>
