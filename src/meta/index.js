/**
 * @miozu/jera/meta — Component metadata exports
 *
 * Single source of truth for component props, categories, and descriptions.
 * Consumers import structured data instead of maintaining separate copies.
 *
 * Usage:
 *   import { categories, getComponent, getPropsTable } from '@miozu/jera/meta';
 */

import data from '../../components.json';

/** All components from components.json */
export const components = data.components;

/** Utilities metadata */
export const utilities = data.utilities;

/** Actions metadata */
export const actions = data.actions;

/**
 * Documented categories with their components.
 * Only includes components with status "active" that have props.
 * Grouped by category, ordered as: primitives, forms, feedback, overlays, navigation, layout.
 */
export const categories = (() => {
  const order = ['primitives', 'forms', 'feedback', 'overlays', 'navigation', 'layout'];
  const labels = {
    primitives: 'Primitives',
    forms: 'Forms',
    feedback: 'Feedback',
    overlays: 'Overlays',
    navigation: 'Navigation',
    layout: 'Layout'
  };

  const grouped = {};
  for (const comp of data.components) {
    if (comp.status !== 'active') continue;
    if (!grouped[comp.category]) grouped[comp.category] = [];
    grouped[comp.category].push({
      name: comp.name,
      slug: comp.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      description: comp.description
    });
  }

  return order
    .filter((id) => grouped[id])
    .map((id) => ({
      id,
      label: labels[id] || id,
      components: grouped[id]
    }));
})();

/**
 * Look up a component by name.
 * @param {string} name - Component name (e.g., "Button", "LeftBarItem")
 * @returns {object|undefined}
 */
export function getComponent(name) {
  return data.components.find((c) => c.name === name);
}

/**
 * Get props in PropsTable format for a component.
 * Returns array of { name, type, default, description, required } objects.
 * Includes events as additional entries with type "function".
 *
 * @param {string} name - Component name
 * @returns {Array<{name: string, type: string, default?: string, description?: string, required?: boolean}>}
 */
export function getPropsTable(name) {
  const comp = getComponent(name);
  if (!comp?.props) return [];

  const rows = Object.entries(comp.props).map(([propName, meta]) => ({
    name: propName,
    type: meta.type,
    default: meta.default,
    description: meta.description || '',
    ...(meta.required ? {required: true} : {}),
    ...(meta.bindable ? {bindable: true} : {})
  }));

  // Append events as function props
  if (comp.events) {
    for (const evt of comp.events) {
      rows.push({name: evt, type: 'function', description: `${evt.replace('on', '')} handler`});
    }
  }

  return rows;
}
