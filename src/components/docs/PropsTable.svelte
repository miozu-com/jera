<!--
  @component PropsTable

  Display component/function props in a clean, readable table.
  Commonly used for API documentation.

  @example
  ```svelte
  <PropsTable props={[
    { name: 'variant', type: 'string', default: '"default"', description: 'Visual style' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interactions' },
    { name: 'onclick', type: 'function', required: true, description: 'Click handler' }
  ]} />
  ```
-->
<script>
  /**
   * @typedef {Object} PropDef
   * @property {string} name - Property name
   * @property {string} type - Type annotation
   * @property {string} [default] - Default value
   * @property {string} description - Description
   * @property {boolean} [required] - Whether prop is required
   */

  /** @type {{ props: PropDef[], class?: string }} */
  let {
    props = [],
    class: className = ''
  } = $props();
</script>

<div class="jera-props-table {className}">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {#each props as prop}
        <tr>
          <td class="prop-name">
            <code>{prop.name}</code>
            {#if prop.required}
              <span class="required" title="Required">*</span>
            {/if}
          </td>
          <td class="prop-type">
            <code>{prop.type}</code>
          </td>
          <td class="prop-default">
            {#if prop.default !== undefined}
              <code>{prop.default}</code>
            {:else}
              <span class="muted">-</span>
            {/if}
          </td>
          <td class="prop-desc">{prop.description}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .jera-props-table {
    overflow-x: auto;
    border: 1px solid var(--color-base02, #2d3748);
    border-radius: var(--radius-md, 0.5rem);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    background: var(--color-base01, #1a1f26);
    border-bottom: 1px solid var(--color-base02, #2d3748);
    font-weight: 500;
    color: var(--color-base05, #e2e8f0);
    white-space: nowrap;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-base02, #2d3748);
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .prop-name code {
    font-family: var(--font-mono, monospace);
    font-weight: 500;
    color: var(--color-base0E, #c974e6);
  }

  .required {
    color: var(--color-base08, #eb3137);
    margin-left: 0.25rem;
  }

  .prop-type code {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: var(--color-base04, #a0aec0);
    background: var(--color-base01, #1a1f26);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .prop-default code {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: var(--color-base0B, #6dd672);
  }

  .muted {
    color: var(--color-base03, #4a5568);
  }

  .prop-desc {
    color: var(--color-base04, #a0aec0);
    line-height: 1.5;
  }
</style>
