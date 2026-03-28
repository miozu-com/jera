<!--
  @component ButtonInput

  An input with an attached button, joined at a shared edge with no gap.
  Supports button on left or right, icon in button, icon overlay in input,
  form submit via button type, and Enter key submission.

  @example Basic (right button)
  <ButtonInput bind:value={query} buttonLabel="Search" onsubmit={handleSearch} />

  @example Left button with icon
  <ButtonInput
    bind:value={name}
    buttonPosition="left"
    buttonIcon={{icon: PlusIcon, position: 'left'}}
    buttonType="submit"
    buttonVariant="primary"
  >
    Create
  </ButtonInput>

  @example Loading state
  <ButtonInput bind:value={email} buttonLabel="Subscribe" loading onsubmit={handleSubscribe} />

  @example Input icon overlay
  <ButtonInput
    bind:value={query}
    inputIcon={{icon: SearchIcon, position: 'right'}}
    buttonLabel="Go"
  />

  @example Custom button content via children snippet
  <ButtonInput bind:value={query} onsubmit={handleSearch}>
    {#snippet children()}<SearchIcon size={14} /> Search{/snippet}
  </ButtonInput>
-->
<script>
  import Input from './Input.svelte';
  import Button from '../primitives/Button.svelte';

  let {
    // Input value
    value = $bindable(''),
    ref = $bindable(),

    // Button configuration
    buttonLabel = 'Submit',
    buttonVariant = 'primary',
    buttonSize = 'md',
    buttonType = 'button',
    buttonPosition = 'right',
    buttonIcon = null,
    buttonDisabled = false,
    buttonLoading = false,

    // Input configuration (forwarded via rest)
    inputDisabled = false,
    inputIcon = null,

    // Shared
    loading = false,
    disabled = false,
    onsubmit = null,
    wrapperClass = '',
    class: className = '',
    children,
    ...inputProps
  } = $props();

  // Resolve loading/disabled: component-level OR individual overrides
  const isLoading = $derived(loading || buttonLoading);
  const isBtnDisabled = $derived(disabled || buttonDisabled || isLoading);
  const isInputDisabled = $derived(disabled || inputDisabled || isLoading);

  const rightIcon = $derived(inputIcon?.position === 'right' ? inputIcon : null);

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
  class="jera-button-input button-input-{buttonPosition} {wrapperClass}"
  class:is-disabled={isBtnDisabled && isInputDisabled}
>
  {#if buttonPosition === 'left'}
    <Button
      type={buttonType}
      variant={buttonVariant}
      size={buttonSize}
      loading={isLoading}
      disabled={isBtnDisabled}
      onclick={handleClick}
      class="attached-btn btn-left"
    >
      {#if buttonIcon?.icon && buttonIcon.position !== 'right'}
        {@const Icon = buttonIcon.icon}
        <Icon size={14} />
      {/if}
      {#if children}
        {@render children()}
      {:else}
        {buttonLabel}
      {/if}
      {#if buttonIcon?.icon && buttonIcon.position === 'right'}
        {@const Icon = buttonIcon.icon}
        <Icon size={14} />
      {/if}
    </Button>
  {/if}

  <div class="input-part">
    <Input
      bind:value
      bind:ref
      disabled={isInputDisabled}
      onkeydown={handleKeydown}
      class="attached-input {className}"
      style={rightIcon
        ? 'padding-right: 2.5rem;'
        : undefined}
      {...inputProps}
    />
    {#if rightIcon?.icon}
      {@const Icon = rightIcon.icon}
      <span class="input-icon-overlay">
        <Icon size={14} />
      </span>
    {/if}
  </div>

  {#if buttonPosition === 'right'}
    <Button
      type={buttonType}
      variant={buttonVariant}
      size={buttonSize}
      loading={isLoading}
      disabled={isBtnDisabled}
      onclick={handleClick}
      class="attached-btn btn-right"
    >
      {#if buttonIcon?.icon && buttonIcon.position !== 'right'}
        {@const Icon = buttonIcon.icon}
        <Icon size={14} />
      {/if}
      {#if children}
        {@render children()}
      {:else}
        {buttonLabel}
      {/if}
      {#if buttonIcon?.icon && buttonIcon.position === 'right'}
        {@const Icon = buttonIcon.icon}
        <Icon size={14} />
      {/if}
    </Button>
  {/if}
</div>

<style>
  .jera-button-input {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  .jera-button-input.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Input container ── */

  .input-part {
    position: relative;
    display: flex;
    flex: 1 1 0%;
    min-width: 0;
  }

  .input-icon-overlay {
    position: absolute;
    inset-block: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding-right: 0.5rem;
    pointer-events: none;
    color: var(--color-base04);
  }

  /* ── Input: remove border on the button side ── */

  .button-input-right :global(.attached-input) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  .button-input-left :global(.attached-input) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }

  /* ── Button: flatten radius on the input side, match height ── */

  .button-input-right :global(.attached-btn) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: var(--border-width-default) solid color-mix(in srgb, var(--color-base02) 80%, transparent);
    align-self: stretch;
    height: auto;
  }

  .button-input-left :global(.attached-btn) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: var(--border-width-default) solid color-mix(in srgb, var(--color-base02) 80%, transparent);
    align-self: stretch;
    height: auto;
  }
</style>
