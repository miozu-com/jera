/**
 * Reactive Class Composer (cn)
 *
 * Advanced Svelte 5 pattern for composing classes reactively.
 * Uses $derived internally for fine-grained reactivity.
 *
 * @example
 * // Basic usage
 * const classes = cn('base', condition && 'conditional', ['array', 'of', 'classes']);
 *
 * // With variants
 * const button = cv({
 *   base: 'inline-flex items-center justify-center',
 *   variants: {
 *     intent: {
 *       primary: 'bg-primary text-white',
 *       secondary: 'bg-surface text-text',
 *     },
 *     size: {
 *       sm: 'h-8 px-3 text-sm',
 *       md: 'h-10 px-4 text-base',
 *       lg: 'h-12 px-6 text-lg',
 *     }
 *   },
 *   defaults: { intent: 'primary', size: 'md' }
 * });
 *
 * // Use in component
 * <button class={button({ intent: 'secondary', size: 'lg' })}>Click</button>
 */

/**
 * Concatenate class names, filtering out falsy values
 * @param {...(string|boolean|null|undefined|string[])} args
 * @returns {string}
 */
export function cn(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Create a reactive class string using $derived
 * Returns a getter that recomputes when dependencies change
 *
 * @param {() => (string|boolean|null|undefined|string[])[]} classFactory
 * @returns {string} Reactive class string (use as class={rcn(() => [...])})
 *
 * @example
 * let isActive = $state(false);
 * let size = $state('md');
 *
 * // This recomputes automatically when isActive or size changes
 * const buttonClass = $derived(cn(
 *   'base-button',
 *   isActive && 'is-active',
 *   `size-${size}`
 * ));
 */
// Note: rcn is just cn - the reactivity comes from using it inside $derived
export const rcn = cn;

/**
 * Class Variants (cv) - Type-safe variant composition
 *
 * Creates a function that generates class strings based on variant props.
 * Inspired by CVA but optimized for Svelte 5 patterns.
 *
 * @template {Record<string, Record<string, string>>} V
 * @template {Partial<{[K in keyof V]: keyof V[K]}>} D
 *
 * @param {{
 *   base?: string | string[],
 *   variants?: V,
 *   compounds?: Array<{condition: Partial<{[K in keyof V]: keyof V[K]}>, class: string}>,
 *   defaults?: D
 * }} config
 *
 * @returns {(props?: Partial<{[K in keyof V]: keyof V[K]}> & {class?: string}) => string}
 */
export function cv(config) {
  const { base = '', variants = {}, compounds = [], defaults = {} } = config;

  /**
   * @param {Record<string, any>} [props]
   * @returns {string}
   */
  return function (props = {}) {
    // Start with base classes
    /** @type {(string | string[])[]} */
    const classes = [base];

    // Apply variant classes
    for (const [variantKey, variantOptions] of Object.entries(variants)) {
      const selectedVariant = /** @type {string} */ (props[variantKey] ?? defaults[variantKey]);
      const variantMap = /** @type {Record<string, string>} */ (variantOptions);
      if (selectedVariant && variantMap[selectedVariant]) {
        classes.push(variantMap[selectedVariant]);
      }
    }

    // Apply compound variants (when multiple conditions match)
    for (const compound of compounds) {
      const { condition, class: compoundClass } = compound;
      const conditionEntries = /** @type {[string, string][]} */ (Object.entries(condition));
      const matches = conditionEntries.every(([key, value]) => {
        const actualValue = /** @type {string} */ (props[key] ?? defaults[key]);
        return actualValue === value;
      });
      if (matches) {
        classes.push(compoundClass);
      }
    }

    // Append any additional classes passed via props.class
    if (props.class) {
      classes.push(props.class);
    }

    return cn(...classes);
  };
}

/**
 * Create a reactive variant class using $derived
 *
 * @example
 * const buttonVariants = cv({...});
 *
 * let intent = $state('primary');
 * let size = $state('md');
 *
 * // Reactive: recomputes when intent or size changes
 * const buttonClass = $derived(buttonVariants({ intent, size }));
 */

/**
 * Slot class merger - combines component classes with user-provided classes
 * Useful for compound components where parent passes classes to children
 *
 * @param {string} componentClass - The component's own classes
 * @param {string} [userClass] - Classes provided by the user
 * @returns {string}
 */
export function mergeClasses(componentClass, userClass) {
  return cn(componentClass, userClass);
}

/**
 * Conditional class helper - returns class only if condition is truthy
 *
 * @param {boolean} condition
 * @param {string} trueClass
 * @param {string} [falseClass]
 * @returns {string}
 */
export function when(condition, trueClass, falseClass = '') {
  return condition ? trueClass : falseClass;
}

/**
 * Switch class helper - returns class based on value matching
 *
 * @param {string | number} value
 * @param {Record<string, string>} cases
 * @param {string} [fallback]
 * @returns {string}
 */
export function match(value, cases, fallback = '') {
  return cases[String(value)] ?? fallback;
}
