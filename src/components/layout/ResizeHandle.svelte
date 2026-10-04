<!--
  @component ResizeHandle

  A vertical separator the user drags to resize the pane beside it. It owns the
  rule it sits on: one 1px line, inside an 8px hit area, that thickens and
  takes the accent colour on hover, keyboard focus and while dragging.

  `side` says which side of the handle the resized pane is on, so the drag
  direction is right: `'end'` (the pane is to the right — a right-hand panel)
  grows when dragged left; `'start'` (a left-hand sidebar) grows when dragged
  right. The keyboard follows the same direction.

  Stateless: the consumer owns the width (bind `value`, or listen to
  `onresize`) and its persistence. The handle clamps to `min`/`max`, so the
  consumer never sees an out-of-range value. Dragging past `min` by more than
  `collapseThreshold` ends the drag and fires `oncollapse` instead.

  The consumer positions it (usually `position: absolute` over the pane edge,
  offset by half its width so the line lands on the edge).

  @example
  <ResizeHandle bind:value={width} min={280} max={900} defaultValue={420} side="end" label="Resize panel" />
-->
<script>
  /**
   * @type {{
   *   value?: number,
   *   min?: number,
   *   max?: number,
   *   defaultValue?: number,
   *   side?: 'start' | 'end',
   *   step?: number,
   *   collapseThreshold?: number,
   *   label?: string,
   *   disabled?: boolean,
   *   class?: string,
   *   onresizestart?: (value: number) => void,
   *   onresize?: (value: number) => void,
   *   onresizeend?: (value: number) => void,
   *   oncollapse?: () => void,
   *   onreset?: (value: number) => void,
   *   [key: string]: any
   * }}
   */
  let {
    value = $bindable(0),
    min = 0,
    max = Infinity,
    defaultValue = undefined,
    side = 'end',
    step = 16,
    collapseThreshold = undefined,
    label = 'Resize',
    disabled = false,
    class: className = '',
    onresizestart,
    onresize,
    onresizeend,
    oncollapse,
    onreset,
    ...rest
  } = $props();

  let dragging = $state(false);

  /** +1 when moving the pointer right grows the pane, -1 when it shrinks it. */
  const direction = $derived(side === 'start' ? 1 : -1);
  const upper = $derived(Math.max(min, max));

  // Drag bookkeeping — plain fields, not state: nothing renders from them.
  let startX = 0;
  let startValue = 0;
  let lastX = 0;
  let frame = 0;
  let pointerId = null;
  let handleEl = null;
  /** documentElement styles we overwrite during a drag, restored after. */
  let saved = null;

  const clamp = n => Math.min(upper, Math.max(min, n));

  function set(next) {
    const v = Math.round(clamp(next));
    if (v === value) return v;
    value = v;
    onresize?.(v);
    return v;
  }

  function lockDocument() {
    const s = document.documentElement.style;
    saved = {userSelect: s.userSelect, cursor: s.cursor};
    s.userSelect = 'none';
    s.cursor = 'col-resize';
  }

  function unlockDocument() {
    if (!saved) return;
    const s = document.documentElement.style;
    s.userSelect = saved.userSelect;
    s.cursor = saved.cursor;
    saved = null;
  }

  /** One update per frame, whatever the pointer's event rate. */
  function apply() {
    frame = 0;
    if (!dragging) return;
    const raw = startValue + (lastX - startX) * direction;
    if (collapseThreshold != null && raw < min - collapseThreshold) {
      finish(false);
      oncollapse?.();
      return;
    }
    set(raw);
  }

  function onpointerdown(event) {
    if (disabled || event.button !== 0 || dragging) return;
    event.preventDefault();
    handleEl = event.currentTarget;
    pointerId = event.pointerId;
    handleEl.setPointerCapture(pointerId);
    startX = lastX = event.clientX;
    startValue = value;
    dragging = true;
    lockDocument();
    onresizestart?.(value);
  }

  function onpointermove(event) {
    if (!dragging || event.pointerId !== pointerId) return;
    lastX = event.clientX;
    if (!frame) frame = requestAnimationFrame(apply);
  }

  /** Ends a drag. `flush` applies the last pointer position first. */
  function finish(flush = true) {
    if (!dragging) return;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (flush) {
        const raw = startValue + (lastX - startX) * direction;
        set(raw);
      }
    }
    dragging = false;
    if (handleEl?.hasPointerCapture?.(pointerId)) handleEl.releasePointerCapture(pointerId);
    handleEl = null;
    pointerId = null;
    unlockDocument();
    onresizeend?.(value);
  }

  function onpointerup(event) {
    if (event.pointerId === pointerId) finish();
  }

  function reset() {
    if (disabled || defaultValue == null) return;
    const v = set(defaultValue);
    onreset?.(v);
    onresizeend?.(v);
  }

  function onkeydown(event) {
    if (disabled) return;
    const big = event.shiftKey ? step * 4 : step;
    let next = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = value - big * direction;
        break;
      case 'ArrowRight':
        next = value + big * direction;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        if (Number.isFinite(upper)) next = upper;
        break;
      case 'Enter':
        event.preventDefault();
        reset();
        return;
      default:
        return;
    }
    if (next == null) return;
    event.preventDefault();
    const v = set(next);
    onresizeend?.(v);
  }

  // Unmounted mid-drag (the pane closed under the pointer): nothing may be left
  // behind on the document or in the frame queue.
  $effect(() => () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    unlockDocument();
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -- a focusable separator is the ARIA window-splitter widget: it takes aria-valuenow and arrow keys -->
<div
  role="separator"
  aria-orientation="vertical"
  aria-label={label}
  aria-valuenow={Math.round(value)}
  aria-valuemin={min}
  aria-valuemax={Number.isFinite(upper) ? Math.round(upper) : undefined}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : 0}
  class="jera-resize-handle {className}"
  data-dragging={dragging || undefined}
  data-side={side}
  {onpointerdown}
  {onpointermove}
  {onpointerup}
  onpointercancel={onpointerup}
  onlostpointercapture={onpointerup}
  ondblclick={reset}
  {onkeydown}
  {...rest}
>
  <span class="grip" aria-hidden="true"></span>
</div>

<style>
  .jera-resize-handle {
    --_rule: var(--resize-handle-color, color-mix(in srgb, var(--color-base03) 22%, transparent));
    --_accent: var(--resize-handle-accent, var(--color-base0D));
    position: relative;
    flex: none;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    touch-action: none;
    outline: none;
    background: transparent;
  }

  .jera-resize-handle[aria-disabled='true'] {
    cursor: default;
  }

  /* The resting rule: 1px, centred in the hit area. */
  .jera-resize-handle::before,
  .jera-resize-handle::after {
    content: '';
    position: absolute;
    inset-block: 0;
    left: calc(50% - 0.5px);
    width: 1px;
    pointer-events: none;
  }

  .jera-resize-handle::before {
    background-color: var(--_rule);
  }

  /* The active rule: the accent, laid over the resting one and widened with a
     transform, so the only things that animate are opacity and transform. */
  .jera-resize-handle::after {
    background-color: var(--_accent);
    opacity: 0;
    transform: scaleX(1);
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

  .grip {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 1.75rem;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--_accent);
    opacity: 0;
    transform: translate(-50%, -50%) scaleY(0.6);
    transition:
      opacity 120ms ease,
      transform 120ms ease;
    pointer-events: none;
  }

  .jera-resize-handle:not([aria-disabled='true']):hover::after,
  .jera-resize-handle:focus-visible::after,
  .jera-resize-handle[data-dragging]::after {
    opacity: 1;
    transform: scaleX(2);
  }

  .jera-resize-handle:not([aria-disabled='true']):hover .grip,
  .jera-resize-handle:focus-visible .grip,
  .jera-resize-handle[data-dragging] .grip {
    opacity: 1;
    transform: translate(-50%, -50%) scaleY(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .jera-resize-handle::after,
    .grip {
      transition: none;
    }
  }
</style>
