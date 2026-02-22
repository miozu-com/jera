/**
 * @miozu/jera/meta — Component metadata exports
 *
 * Single source of truth for component props, categories, and descriptions.
 * Consumers import structured data instead of maintaining separate copies.
 *
 * Usage:
 *   import { categories, getComponent, getPropsTable } from '@miozu/jera/meta';
 *   import { getByStage, getStale, getBySlug } from '@miozu/jera/meta';
 */

import data from '../../components.json';

/** Schema version from components.json */
export const schemaVersion = data.schemaVersion;

/** Stage definitions */
export const stageDefinitions = data.stageDefinitions;

/** Doc level definitions */
export const docLevelDefinitions = data.docLevelDefinitions;

/** All components from components.json */
export const components = data.components;

/** Utilities metadata */
export const utilities = data.utilities;

/** Actions metadata */
export const actions = data.actions;

/**
 * Resolve a component's effective stage.
 * Backward-compatible: uses comp.stage if present, falls back to comp.status mapping.
 */
function resolveStage(comp) {
  if (comp.stage) return comp.stage;
  // v1 backward compat
  const map = {active: 'stable', ready: 'beta', legacy: 'deprecated'};
  return map[comp.status] || 'draft';
}

/**
 * Documented categories with their components.
 * Excludes deprecated components. Includes stable + beta + draft.
 * Grouped by category, ordered as: primitives, forms, feedback, overlays, navigation, layout, docs.
 */
export const categories = (() => {
  const order = ['primitives', 'forms', 'feedback', 'overlays', 'navigation', 'layout', 'docs'];
  const labels = {
    primitives: 'Primitives',
    forms: 'Forms',
    feedback: 'Feedback',
    overlays: 'Overlays',
    navigation: 'Navigation',
    layout: 'Layout',
    docs: 'Docs'
  };

  const grouped = {};
  for (const comp of data.components) {
    const stage = resolveStage(comp);
    if (stage === 'deprecated') continue;
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
 * Look up a component by its URL slug.
 * @param {string} slug - Kebab-case slug (e.g., "left-bar-item")
 * @returns {object|undefined}
 */
export function getBySlug(slug) {
  return data.components.find(
    (c) => c.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() === slug
  );
}

/**
 * Get all components at a given lifecycle stage.
 * @param {'draft'|'beta'|'stable'|'deprecated'} stage
 * @returns {object[]}
 */
export function getByStage(stage) {
  return data.components.filter((c) => resolveStage(c) === stage);
}

/**
 * Get components whose lastReviewed is older than `days` ago.
 * @param {number} [days=30] - Staleness threshold in days
 * @returns {object[]}
 */
export function getStale(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.components.filter((c) => {
    if (!c.lastReviewed) return true;
    return new Date(c.lastReviewed) < cutoff;
  });
}

/**
 * Get component metadata summary for a specific component.
 * Includes stage, revision, docLevel, breaking changes.
 * @param {string} name - Component name
 * @returns {object|null}
 */
export function getComponentMeta(name) {
  const comp = getComponent(name);
  if (!comp) return null;
  return {
    name: comp.name,
    category: comp.category,
    stage: resolveStage(comp),
    revision: comp.revision || 1,
    lastReviewed: comp.lastReviewed || null,
    docLevel: comp.docLevel || 'none',
    breaking: comp.breaking || [],
    replacedBy: comp.replacedBy || null
  };
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
