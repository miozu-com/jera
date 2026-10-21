/**
 * AccordionState — which items of one Accordion are open.
 *
 * Accordion creates one and hands it to its children snippet
 * (`{#snippet children(accordion)}`); each AccordionItem takes it as the
 * `accordion` prop. `expanded` is an array of item ids; `toggle`, `open` and
 * `close` are its only writers. Single mode (default) keeps at most one open.
 */
export class AccordionState {
  expanded = $state.raw([]);
  multiple = $state(false);
  #onchange = null;

  /**
   * @param {{expanded?: string[], multiple?: boolean, onchange?: (expanded: string[]) => void}} [init]
   */
  constructor({ expanded = [], multiple = false, onchange = null } = {}) {
    this.expanded = expanded;
    this.multiple = multiple;
    this.#onchange = onchange;
  }

  isExpanded(id) {
    return this.expanded.includes(id);
  }

  toggle(id) {
    if (this.isExpanded(id)) this.close(id);
    else this.open(id);
  }

  open(id) {
    if (this.isExpanded(id)) return;
    this.#set(this.multiple ? [...this.expanded, id] : [id]);
  }

  close(id) {
    if (!this.isExpanded(id)) return;
    this.#set(this.expanded.filter((i) => i !== id));
  }

  /** Mirror the owner's props into the state (only the fields that differ are written). */
  sync({ expanded, multiple }) {
    if (this.expanded !== expanded) this.expanded = expanded;
    if (this.multiple !== multiple) this.multiple = multiple;
  }

  #set(next) {
    this.expanded = next;
    this.#onchange?.(next);
  }
}
