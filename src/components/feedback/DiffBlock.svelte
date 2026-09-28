<!--
  @component DiffBlock

  Before/after of one block of prose, sentence by sentence: removed sentences
  as `−` rows (base08 tint), added as `+` rows (base0B tint), unchanged rows in
  base04. Inside each change the removed rows come first, so a rewritten
  sentence reads old-then-new. When nothing changed the block collapses to its
  label and "(unchanged)".

  Sentence-level on purpose — word diffs of rewritten prose are unreadable. The
  algorithm is `diffSentences` in `@miozu/jera/utils/diff`, so a page can
  summarise the same ops (`diffSummary`) that this block draws.

  @example
  <DiffBlock label="Hook" before={current.hook} after={draft.hook} />

  @example Already-split lines, long unchanged runs folded
  <DiffBlock label="Key specs" before={current.specs} after={draft.specs} context={1} />
-->
<script>
  import { diffSentences } from '../../utils/diff.js';

  let {
    before = '',
    after = '',
    label = '',
    context = Infinity,
    unchangedText = 'unchanged',
    class: className = '',
    ...rest
  } = $props();

  const ops = $derived(diffSentences(before, after));
  const changed = $derived(ops.some((op) => op.type !== 'equal'));

  // Unchanged runs longer than `context` on each side of a change fold into
  // one "N unchanged sentences" row, so a one-sentence edit in a long block
  // stays readable.
  const rows = $derived.by(() => {
    if (!Number.isFinite(context)) return ops;
    const keep = Math.max(0, Math.floor(context));
    const out = [];
    let i = 0;
    while (i < ops.length) {
      if (ops[i].type !== 'equal') {
        out.push(ops[i++]);
        continue;
      }
      let j = i;
      while (j < ops.length && ops[j].type === 'equal') j++;
      const run = ops.slice(i, j);
      const head = i === 0 ? 0 : keep;
      const tail = j === ops.length ? 0 : keep;
      if (run.length > head + tail) {
        out.push(...run.slice(0, head));
        out.push({ type: 'fold', count: run.length - head - tail });
        out.push(...run.slice(run.length - tail));
      } else {
        out.push(...run);
      }
      i = j;
    }
    return out;
  });
</script>

<section class="diff-block {className}" aria-label={label || undefined} {...rest}>
  {#if label || !changed}
    <header class="diff-block-header">
      {#if label}<span class="diff-block-label">{label}</span>{/if}
      {#if !changed}<span class="diff-block-unchanged">({unchangedText})</span>{/if}
    </header>
  {/if}

  {#if changed}
    <ul class="diff-block-rows">
      {#each rows as row, i (i)}
        {#if row.type === 'removed'}
          <li class="diff-row diff-row-removed">
            <span class="diff-row-mark" aria-hidden="true">−</span>
            <del><span class="diff-sr">{'Removed: '}</span>{row.text}</del>
          </li>
        {:else if row.type === 'added'}
          <li class="diff-row diff-row-added">
            <span class="diff-row-mark" aria-hidden="true">+</span>
            <ins><span class="diff-sr">{'Added: '}</span>{row.text}</ins>
          </li>
        {:else if row.type === 'fold'}
          <li class="diff-row diff-row-fold">
            {row.count} unchanged {row.count === 1 ? 'sentence' : 'sentences'}
          </li>
        {:else}
          <li class="diff-row diff-row-equal">
            <span class="diff-row-mark" aria-hidden="true"></span>
            <span>{row.text}</span>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</section>

<style>
  .diff-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.375rem);
    min-width: 0;
  }

  .diff-block-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-4, 0.5rem);
  }

  .diff-block-label {
    font-size: var(--text-xs, 0.75rem);
    font-weight: 600;
    color: var(--color-base05);
  }

  .diff-block-unchanged {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-base04);
  }

  .diff-block-rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .diff-row {
    display: grid;
    grid-template-columns: 1rem minmax(0, 1fr);
    gap: var(--space-2, 0.25rem);
    padding: var(--space-2, 0.25rem) var(--space-4, 0.5rem);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.5;
    color: var(--color-base05);
    border-radius: var(--radius-default);
    overflow-wrap: anywhere;
  }

  .diff-row-mark {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-weight: 600;
    text-align: center;
    user-select: none;
  }

  .diff-row del,
  .diff-row ins {
    text-decoration: none;
  }

  .diff-row-removed {
    background: color-mix(in srgb, var(--color-base08) 10%, transparent);

    .diff-row-mark {
      color: var(--color-base08);
    }
  }

  .diff-row-added {
    background: color-mix(in srgb, var(--color-base0B) 10%, transparent);

    .diff-row-mark {
      color: var(--color-base0B);
    }
  }

  .diff-row-equal {
    color: var(--color-base04);
  }

  .diff-row-fold {
    display: block;
    padding-left: calc(1rem + var(--space-2, 0.25rem) + var(--space-4, 0.5rem));
    font-size: var(--text-xs, 0.75rem);
    font-style: italic;
    color: var(--color-base04);
  }

  .diff-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
