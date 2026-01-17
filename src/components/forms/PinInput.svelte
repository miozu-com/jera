<!--
  @component PinInput

  A PIN/OTP code input with individual digit fields.

  @example
  <PinInput bind:value={code} length={6} />

  @example Masked (password style)
  <PinInput bind:value={pin} length={4} masked />
-->
<script>
  let {
    value = $bindable(''),
    length = 4,
    masked = false,
    disabled = false,
    size = 'md',
    class: className = '',
    oncomplete,
    ...rest
  } = $props();

  let inputs = $state([]);

  // Keep value in sync with inputs
  $effect(() => {
    const chars = value.split('').slice(0, length);
    inputs = Array(length).fill('').map((_, i) => chars[i] || '');
  });

  function updateValue() {
    value = inputs.join('');
    if (value.length === length) {
      oncomplete?.(value);
    }
  }

  function handleInput(index, e) {
    const char = e.target.value.slice(-1);

    if (!/^\d*$/.test(char)) {
      e.target.value = inputs[index];
      return;
    }

    inputs[index] = char;
    updateValue();

    // Move to next input
    if (char && index < length - 1) {
      const nextInput = e.target.parentElement.querySelector(`input:nth-child(${index + 2})`);
      nextInput?.focus();
    }
  }

  function handleKeydown(index, e) {
    if (e.key === 'Backspace' && !inputs[index] && index > 0) {
      const prevInput = e.target.parentElement.querySelector(`input:nth-child(${index})`);
      prevInput?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = e.target.parentElement.querySelector(`input:nth-child(${index})`);
      prevInput?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      const nextInput = e.target.parentElement.querySelector(`input:nth-child(${index + 2})`);
      nextInput?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    for (let i = 0; i < length; i++) {
      inputs[i] = pasted[i] || '';
    }
    updateValue();

    // Focus appropriate input
    const focusIndex = Math.min(pasted.length, length - 1);
    const input = e.target.parentElement.querySelector(`input:nth-child(${focusIndex + 1})`);
    input?.focus();
  }

  function handleFocus(e) {
    e.target.select();
  }
</script>

<div class="pin-input pin-input-{size} {className}" {...rest}>
  {#each inputs as digit, index}
    <input
      type={masked ? 'password' : 'text'}
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      value={digit}
      {disabled}
      class="pin-field"
      class:pin-field-filled={digit}
      oninput={(e) => handleInput(index, e)}
      onkeydown={(e) => handleKeydown(index, e)}
      onpaste={handlePaste}
      onfocus={handleFocus}
      autocomplete="one-time-code"
    />
  {/each}
</div>

<style>
  .pin-input {
    display: inline-flex;
    gap: var(--space-2);
  }

  .pin-field {
    width: 2.75rem;
    height: 3rem;
    padding: 0;
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    color: var(--color-base07);
    background: var(--color-base00);
    border: 2px solid var(--color-base02);
    border-radius: var(--radius-lg);
    transition: var(--transition-colors);
    font-family: inherit;
  }

  .pin-input-sm .pin-field {
    width: 2.25rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .pin-input-lg .pin-field {
    width: 3.25rem;
    height: 3.5rem;
    font-size: 1.5rem;
  }

  .pin-field:focus {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-base0D) 20%, transparent);
  }

  .pin-field-filled {
    border-color: var(--color-base0D);
    background: color-mix(in srgb, var(--color-base0D) 5%, transparent);
  }

  .pin-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pin-field::placeholder {
    color: var(--color-base04);
  }

  /* Hide spin buttons on number input */
  .pin-field::-webkit-outer-spin-button,
  .pin-field::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
