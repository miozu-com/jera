/**
 * RadioGroupState — the shared state of one RadioGroup.
 *
 * RadioGroup creates one and hands it to its children snippet
 * (`{#snippet children(group)}`); each Radio takes it as the `group` prop.
 * Fields are reactive; `change()` is the only writer of `value`.
 *
 * Native grouping (input[name], arrow keys, one tab stop) still comes from the
 * browser: every Radio renders `name={group.name}`.
 */
export class RadioGroupState {
  value = $state(null);
  name = $state("");
  disabled = $state(false);
  variant = $state("default");
  #onchange = null;

  /**
   * @param {{value?: any, name?: string, disabled?: boolean, variant?: 'default'|'segmented', onchange?: (value: any) => void}} [init]
   */
  constructor({
    value = null,
    name = "",
    disabled = false,
    variant = "default",
    onchange = null,
  } = {}) {
    this.value = value;
    this.name = name;
    this.disabled = disabled;
    this.variant = variant;
    this.#onchange = onchange;
  }

  /** Whether `value` is the selected option. */
  isChecked(value) {
    return this.value === value;
  }

  /** Select `value` (no-op while the group is disabled). Calls `onchange(value)` on a change. */
  change(value) {
    if (this.disabled || this.value === value) return;
    this.value = value;
    this.#onchange?.(value);
  }

  /** Mirror the owner's props into the state (only the fields that differ are written). */
  sync({ value, name, disabled, variant }) {
    if (this.value !== value) this.value = value;
    if (this.name !== name) this.name = name;
    if (this.disabled !== disabled) this.disabled = disabled;
    if (this.variant !== variant) this.variant = variant;
  }
}
