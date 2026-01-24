/**
 * NavigationState - Enterprise-grade reactive state management for navigation
 *
 * Provides centralized state management for complex navigation scenarios including:
 * - Multi-level recursive navigation
 * - Search and filtering across all items
 * - Expansion state management
 * - Active state detection
 * - Breadcrumb generation
 * - Permission-based visibility
 *
 * @example
 * const nav = new NavigationState({
 *   items: navigationConfig,
 *   persistKey: 'my-app-nav',
 *   searchable: true,
 *   recursive: true
 * });
 */

import { browser } from '$app/environment';

export class NavigationState {
  // Core reactive state
  items = $state([]);
  searchQuery = $state('');
  expandedSections = $state({});
  expandedItems = $state({});
  activeItem = $state(null);
  activePath = $state([]);

  // Configuration
  config = $state({
    persistKey: null,
    searchable: true,
    recursive: true,
    maxDepth: 10,
    autoExpand: false,
    caseSensitiveSearch: false
  });

  // Computed properties
  filteredItems = $derived.by(() => this.#filterItems(this.items, this.searchQuery));
  breadcrumbs = $derived.by(() => this.#generateBreadcrumbs(this.activeItem));
  totalItemCount = $derived.by(() => this.#countItems(this.items));
  visibleItemCount = $derived.by(() => this.#countItems(this.filteredItems));

  constructor(options = {}) {
    // Apply configuration
    this.config = { ...this.config, ...options };

    if (options.items) {
      this.items = this.#normalizeItems(options.items);
    }

    // Load persisted state
    if (this.config.persistKey && browser) {
      this.#loadPersistedState();
    }

    // Auto-save state when it changes
    if (this.config.persistKey && browser) {
      $effect(() => {
        this.#savePersistedState();
      });
    }
  }

  /**
   * Update navigation items with intelligent merging
   */
  setItems(items) {
    this.items = this.#normalizeItems(items);

    // Auto-expand if configured
    if (this.config.autoExpand) {
      this.#autoExpandItems();
    }
  }

  /**
   * Set active item by ID or path
   */
  setActive(identifier, shouldExpand = true) {
    const item = typeof identifier === 'string'
      ? this.#findItemById(identifier)
      : identifier;

    if (item) {
      this.activeItem = item;
      this.activePath = this.#getItemPath(item);

      if (shouldExpand) {
        this.#expandToItem(item);
      }
    }
  }

  /**
   * Search navigation items
   */
  search(query) {
    this.searchQuery = query;

    // Auto-expand search results
    if (query && this.config.autoExpand) {
      this.#expandSearchResults();
    }
  }

  /**
   * Clear search and collapse expanded results
   */
  clearSearch() {
    this.searchQuery = '';
  }

  /**
   * Toggle section expansion
   */
  toggleSection(sectionId) {
    this.expandedSections[sectionId] = !this.expandedSections[sectionId];
  }

  /**
   * Toggle item expansion (for recursive items)
   */
  toggleItem(itemId) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }

  /**
   * Expand all sections and items
   */
  expandAll() {
    this.#walkItems(this.items, (item) => {
      if (item.children?.length > 0) {
        this.expandedItems[item.id] = true;
      }
    });

    // Expand all sections
    Object.keys(this.expandedSections).forEach(key => {
      this.expandedSections[key] = true;
    });
  }

  /**
   * Collapse all sections and items
   */
  collapseAll() {
    this.expandedItems = {};
    Object.keys(this.expandedSections).forEach(key => {
      this.expandedSections[key] = false;
    });
  }

  /**
   * Get navigation item by ID
   */
  getItem(id) {
    return this.#findItemById(id);
  }

  /**
   * Get all children of an item
   */
  getChildren(itemId) {
    const item = this.#findItemById(itemId);
    return item?.children || [];
  }

  /**
   * Get parent of an item
   */
  getParent(itemId) {
    return this.#findParentItem(itemId);
  }

  /**
   * Get path to root for an item
   */
  getPath(itemId) {
    const item = this.#findItemById(itemId);
    return item ? this.#getItemPath(item) : [];
  }

  /**
   * Check if item is visible based on permissions
   */
  isVisible(item) {
    if (!item.permissions) return true;

    // Override in subclass or provide permissions checker
    return this.config.permissionChecker
      ? this.config.permissionChecker(item.permissions)
      : true;
  }

  /**
   * Check if item is active
   */
  isActive(item) {
    return this.activeItem?.id === item.id;
  }

  /**
   * Check if item is in active path
   */
  isInActivePath(item) {
    return this.activePath.some(pathItem => pathItem.id === item.id);
  }

  /**
   * Check if section is expanded
   */
  isSectionExpanded(sectionId) {
    return this.expandedSections[sectionId] ?? false;
  }

  /**
   * Check if item is expanded
   */
  isItemExpanded(itemId) {
    return this.expandedItems[itemId] ?? false;
  }

  // Private methods
  #normalizeItems(items) {
    const normalized = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const normalizedItem = {
        id: item.id || `item-${i}`,
        label: item.label || '',
        href: item.href || null,
        icon: item.icon || null,
        badge: item.badge || null,
        children: item.children ? this.#normalizeItems(item.children) : [],
        permissions: item.permissions || null,
        metadata: item.metadata || {},
        depth: item.depth || 0,
        parent: item.parent || null,
        ...item
      };

      // Set parent references for children
      normalizedItem.children.forEach(child => {
        child.parent = normalizedItem.id;
        child.depth = normalizedItem.depth + 1;
      });

      normalized.push(normalizedItem);
    }

    return normalized;
  }

  #filterItems(items, query) {
    if (!query) return items;

    const filtered = [];
    const searchLower = this.config.caseSensitiveSearch ? query : query.toLowerCase();

    for (const item of items) {
      const matches = this.#itemMatches(item, searchLower);
      const filteredChildren = this.#filterItems(item.children || [], query);

      if (matches || filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren,
          _matchesSearch: matches
        });
      }
    }

    return filtered;
  }

  #itemMatches(item, searchQuery) {
    const searchFields = [
      item.label,
      item.description,
      item.metadata?.tags?.join(' '),
      item.metadata?.keywords?.join(' ')
    ].filter(Boolean);

    const searchText = this.config.caseSensitiveSearch
      ? searchFields.join(' ')
      : searchFields.join(' ').toLowerCase();

    return searchText.includes(searchQuery);
  }

  #findItemById(id, items = this.items) {
    for (const item of items) {
      if (item.id === id) return item;

      if (item.children) {
        const found = this.#findItemById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }

  #findParentItem(itemId, items = this.items, parent = null) {
    for (const item of items) {
      if (item.id === itemId) return parent;

      if (item.children) {
        const found = this.#findParentItem(itemId, item.children, item);
        if (found) return found;
      }
    }
    return null;
  }

  #getItemPath(item) {
    const path = [];
    let current = item;

    while (current) {
      path.unshift(current);
      current = current.parent ? this.#findItemById(current.parent) : null;
    }

    return path;
  }

  #expandToItem(item) {
    const path = this.#getItemPath(item);

    path.forEach(pathItem => {
      if (pathItem.parent) {
        this.expandedItems[pathItem.parent] = true;
      }
    });
  }

  #expandSearchResults() {
    this.#walkItems(this.filteredItems, (item) => {
      if (item._matchesSearch && item.parent) {
        this.expandedItems[item.parent] = true;
      }
    });
  }

  #autoExpandItems() {
    this.#walkItems(this.items, (item) => {
      if (item.children?.length > 0) {
        this.expandedItems[item.id] = true;
      }
    });
  }

  #walkItems(items, callback) {
    for (const item of items) {
      callback(item);
      if (item.children) {
        this.#walkItems(item.children, callback);
      }
    }
  }

  #countItems(items) {
    let count = 0;
    this.#walkItems(items, () => count++);
    return count;
  }

  #generateBreadcrumbs(activeItem) {
    if (!activeItem) return [];
    return this.#getItemPath(activeItem);
  }

  #loadPersistedState() {
    try {
      const saved = localStorage.getItem(this.config.persistKey);
      if (saved) {
        const state = JSON.parse(saved);
        this.expandedSections = state.expandedSections || {};
        this.expandedItems = state.expandedItems || {};
        this.searchQuery = state.searchQuery || '';
      }
    } catch (error) {
      console.warn('Failed to load navigation state:', error);
    }
  }

  #savePersistedState() {
    try {
      const state = {
        expandedSections: this.expandedSections,
        expandedItems: this.expandedItems,
        searchQuery: this.searchQuery
      };
      localStorage.setItem(this.config.persistKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }
}

/**
 * Create a navigation state instance with common defaults
 */
export function createNavigationState(options = {}) {
  return new NavigationState({
    searchable: true,
    recursive: true,
    maxDepth: 10,
    autoExpand: false,
    ...options
  });
}

/**
 * Navigation context key for Svelte context
 */
export const NAVIGATION_CONTEXT_KEY = 'navigation-state';