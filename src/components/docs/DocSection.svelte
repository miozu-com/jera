<!--
  @component DocSection

  A documentation section with optional anchor link, title, description,
  and content area. Useful for organizing documentation into scannable sections.

  @example
  ```svelte
  <DocSection id="installation" title="Installation" description="How to install the package">
    <CodeBlock code="npm install @miozu/jera" lang="bash" />
  </DocSection>
  ```
-->
<script>
  import {Link2} from '@lucide/svelte';

  let {
    /** Unique ID for anchor links */
    id = '',
    /** Section title */
    title = '',
    /** Optional description below title */
    description = '',
    /** Heading level (2-6) */
    level = 2,
    /** Show anchor link on hover */
    showAnchor = true,
    /** Children content */
    children,
    /** Additional CSS classes */
    class: className = ''
  } = $props();

  const Tag = `h${level}`;
</script>

<section class="jera-doc-section {className}" {id}>
  {#if title}
    <div class="section-header">
      <svelte:element this={Tag} class="section-title">
        {title}
        {#if showAnchor && id}
          <a href="#{id}" class="anchor-link" aria-label="Link to {title}">
            <Link2 size={16} />
          </a>
        {/if}
      </svelte:element>
      {#if description}
        <p class="section-description">{description}</p>
      {/if}
    </div>
  {/if}

  <div class="section-content">
    {@render children?.()}
  </div>
</section>

<style>
  .jera-doc-section {
    margin-bottom: 2rem;
    scroll-margin-top: 2rem;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: var(--color-base6, var(--base6, #f3f4f7));
  }

  h2.section-title {
    font-size: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border, var(--base2, #2d3748));
  }

  h3.section-title {
    font-size: 1.25rem;
  }

  h4.section-title {
    font-size: 1.125rem;
  }

  h5.section-title,
  h6.section-title {
    font-size: 1rem;
  }

  .anchor-link {
    opacity: 0;
    color: var(--color-base4, var(--base4, #a0aec0));
    transition: opacity 0.15s, color 0.15s;
  }

  .section-title:hover .anchor-link {
    opacity: 1;
  }

  .anchor-link:hover {
    color: var(--color-primary, var(--magenta, #c974e6));
  }

  .section-description {
    margin: 0;
    color: var(--color-base4, var(--base4, #a0aec0));
    line-height: 1.6;
  }

  .section-content {
    /* Content inherits full width */
  }
</style>
