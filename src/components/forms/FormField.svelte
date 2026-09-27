<!--
  @component FormField

  The label-pairing wrapper every editable row on a product/settings page
  should use instead of a bare `<dt>/<dd>` or a hand-styled `<label>` beside a
  control (design: `docs/plans/2026-09-26-catalog-quality/e4-product-editor-design.md`
  §2.2 #4, §3.1). It draws the label, the control (via the `children` snippet),
  and — when given one — a hint or error line and a live counter, all in one
  typography scale: `--text-xs` medium base04 for the label, matching size
  across every field on a page regardless of which jera control fills it.

  Layout-only: no border, background or padding of its own (the jera form
  border standard lives on `Input`/`Select`/`Textarea`/`TagInput` themselves —
  wrapping them in a styled container draws a double border).

  `children` is called with the field's hint/error element id, so the control
  can wire its own `aria-describedby` without FormField reaching into it:

  @example
  <FormField label="Type" for="field-type" hint="Shown in Organization">
    {#snippet children(describedBy)}
      <Input id="field-type" aria-describedby={describedBy} bind:value={type} />
    {/snippet}
  </FormField>

  @example With a provenance chip and a live counter
  <FormField label="SEO title" for="field-seo-title" counter={{value: title.length, max: 70, soft: 60}}>
    {#snippet meta()}<Badge size="xs">✦ AI-filled</Badge>{/snippet}
    {#snippet children(describedBy)}
      <Input id="field-seo-title" aria-describedby={describedBy} bind:value={title} />
    {/snippet}
  </FormField>
-->
<script>
  import {cn} from '../../utils/cn.svelte.js';

  /**
   * @type {{
   *   label: string,
   *   for: string,
   *   hint?: string | null,
   *   error?: string | null,
   *   required?: boolean,
   *   counter?: {value: number, max: number, soft?: number} | null,
   *   class?: string,
   *   children?: import('svelte').Snippet<[string]>,
   *   meta?: import('svelte').Snippet
   * }}
   */
  let {
    label,
    for: forId,
    hint = null,
    error = null,
    required = false,
    counter = null,
    class: className = '',
    children,
    meta,
    ...rest
  } = $props();

  const hasFooter = $derived(Boolean(hint || error || counter));
  const describedById = $derived(hasFooter ? `${forId}-hint` : undefined);

  /** base04 under the soft mark (or no soft mark at all), base09 past it,
      base08 past the hard max — the one counter-colour rule every field on
      the page shares (design §3.3). */
  const counterTone = $derived.by(() => {
    if (!counter) return '';
    const {value, max, soft} = counter;
    if (typeof value !== 'number') return '';
    if (value > max) return 'form-field-counter--hard';
    if (typeof soft === 'number' && value > soft) return 'form-field-counter--soft';
    return '';
  });
</script>

<div class={cn('form-field', className)} {...rest}>
  <div class="form-field-head">
    <label for={forId} class="form-field-label">
      {label}
      {#if required}<span class="form-field-required" aria-hidden="true">*</span>{/if}
    </label>
    {#if meta}
      <span class="form-field-meta">{@render meta()}</span>
    {/if}
  </div>

  {@render children?.(describedById)}

  {#if hasFooter}
    <div class="form-field-footer">
      {#if error}
        <p class="form-field-error" id={describedById}>{error}</p>
      {:else if hint}
        <p class="form-field-hint" id={describedById}>{hint}</p>
      {:else}
        <span id={describedById}></span>
      {/if}
      {#if counter}
        <span class={cn('form-field-counter', counterTone)}>{counter.value}/{counter.max}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .form-field-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .form-field-label {
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-base04);
  }

  .form-field-required {
    color: var(--color-base08);
    margin-inline-start: 0.125rem;
  }

  .form-field-meta {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .form-field-footer {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .form-field-hint {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
  }

  .form-field-error {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-base08);
  }

  .form-field-counter {
    flex-shrink: 0;
    font-size: var(--text-xs);
    color: var(--color-base04);
    font-variant-numeric: tabular-nums;
  }

  .form-field-counter--soft {
    color: var(--color-base09);
  }

  .form-field-counter--hard {
    color: var(--color-base08);
  }
</style>
