<!--
  @component ButtonInput

  An input with an attached button, joined at a shared edge with no gap.
  Submits on button click or Enter key press in the input.

  @example Basic (right button)
  <ButtonInput bind:value={query} buttonLabel="Search" onsubmit={handleSearch} />

  @example Left button
  <ButtonInput bind:value={url} buttonLabel="Go" buttonPosition="left" onsubmit={handleGo} />

  @example Loading state
  <ButtonInput bind:value={email} buttonLabel="Subscribe" {loading} onsubmit={handleSubscribe} />

  @example Custom button content
  {#snippet icon()}<SearchIcon size={14} />{/snippet}
  <ButtonInput bind:value={query} onsubmit={handleSearch}>
    {#snippet children()}{@render icon()}{/snippet}
  </ButtonInput>
-->
<script>
  import Input from './Input.svelte';
  import Button from '../primitives/Button.svelte';

  let {
    value = $bindable(''),
    buttonLabel = 'Submit',
    buttonVariant = 'primary',
    buttonSize = 'md',
    buttonPosition = 'right',
    onsubmit = null,
    loading = false,
    disabled = false,
    class: className = '',
    children,
    ...inputProps
  } = $props();

  function handleClick() {
    onsubmit?.(value);
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onsubmit?.(value);
    }
    inputProps.onkeydown?.(event);
  }
</script>

<div
  class="button-input-wrapper button-input-{buttonPosition} {className}"
  class:is-disabled={disabled || loading}
>
  {#if buttonPosition === 'left'}
    <Button
      variant={buttonVariant}
      size={buttonSize}
      {loading}
      disabled={disabled || loading}
      onclick={handleClick}
      class="attached-btn btn-left"
    >
      {#if children}
        {@render children()}
      {:else}
        {buttonLabel}
      {/if}
    </Button>
  {/if}

  <Input
    bind:value
    disabled={disabled || loading}
    onkeydown={handleKeydown}
    class="attached-input"
    {...inputProps}
  />

  {#if buttonPosition === 'right'}
    <Button
      variant={buttonVariant}
      size={buttonSize}
      {loading}
      disabled={disabled || loading}
      onclick={handleClick}
      class="attached-btn btn-right"
    >
      {#if children}
        {@render children()}
      {:else}
        {buttonLabel}
      {/if}
    </Button>
  {/if}
</div>

<style>
  .button-input-wrapper {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  /* ── Input: remove the border on the button side ── */

  /* Button on right → flatten input's right edge */
  .button-input-right :global(.attached-input) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  /* Button on left → flatten input's left edge */
  .button-input-left :global(.attached-input) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }

  /* ── Button: flatten radius on the input side, match height, add separator ──
     The input's adjacent border was removed above; restore a single line via
     the button so the join is visually closed. */

  /* Button on right → flatten left edge, add left separator */
  .button-input-right :global(.attached-btn) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: var(--border-width-default) solid color-mix(in srgb, var(--color-base02) 80%, transparent);
    align-self: stretch;
    height: auto;
  }

  /* Button on left → flatten right edge, add right separator */
  .button-input-left :global(.attached-btn) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: var(--border-width-default) solid color-mix(in srgb, var(--color-base02) 80%, transparent);
    align-self: stretch;
    height: auto;
  }
</style>
