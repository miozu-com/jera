/**
 * Sidebar State Management
 *
 * Provides reactive state management for sidebar components.
 * Uses Svelte 5 runes for fine-grained reactivity.
 *
 * @example
 * const sidebar = createSidebarState({ persistKey: 'my-sidebar' });
 *
 * // In component
 * sidebar.toggle();
 * console.log(sidebar.collapsed); // true/false
 */

/**
 * Create a reactive sidebar state manager
 *
 * @param {Object} options
 * @param {boolean} [options.collapsed=false] - Initial collapsed state
 * @param {string|null} [options.persistKey=null] - localStorage key for persistence
 * @returns {Object} Sidebar state object with reactive properties and methods
 */
export function createSidebarState(options = {}) {
  const { collapsed: initial = false, persistKey = null } = options;

  // Core state
  let _collapsed = $state(initial);
  let _expandedGroups = $state(new Set());
  let _hoverPopover = $state({
    item: null,
    position: { top: 0, left: 0 }
  });
  let _hoverTimeout = null;

  // Load from localStorage on init (client-side only)
  if (persistKey && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved !== null) {
        _collapsed = saved === 'true';
      }

      const savedGroups = localStorage.getItem(`${persistKey}-groups`);
      if (savedGroups) {
        _expandedGroups = new Set(JSON.parse(savedGroups));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Persist to localStorage when state changes
  function persist() {
    if (persistKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(persistKey, String(_collapsed));
        localStorage.setItem(`${persistKey}-groups`, JSON.stringify([..._expandedGroups]));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  return {
    // Collapsed state
    get collapsed() {
      return _collapsed;
    },
    set collapsed(value) {
      _collapsed = value;
      persist();
    },

    /**
     * Toggle collapsed state
     */
    toggle() {
      _collapsed = !_collapsed;
      persist();
    },

    /**
     * Expand the sidebar
     */
    expand() {
      _collapsed = false;
      persist();
    },

    /**
     * Collapse the sidebar
     */
    collapse() {
      _collapsed = true;
      persist();
    },

    // Group expansion
    get expandedGroups() {
      return _expandedGroups;
    },

    /**
     * Check if a group is expanded
     * @param {string} groupId
     * @returns {boolean}
     */
    isGroupExpanded(groupId) {
      return _expandedGroups.has(groupId);
    },

    /**
     * Toggle group expansion
     * @param {string} groupId
     */
    toggleGroup(groupId) {
      if (_expandedGroups.has(groupId)) {
        _expandedGroups = new Set([..._expandedGroups].filter(id => id !== groupId));
      } else {
        _expandedGroups = new Set([..._expandedGroups, groupId]);
      }
      persist();
    },

    /**
     * Expand a group
     * @param {string} groupId
     */
    expandGroup(groupId) {
      if (!_expandedGroups.has(groupId)) {
        _expandedGroups = new Set([..._expandedGroups, groupId]);
        persist();
      }
    },

    /**
     * Collapse a group
     * @param {string} groupId
     */
    collapseGroup(groupId) {
      if (_expandedGroups.has(groupId)) {
        _expandedGroups = new Set([..._expandedGroups].filter(id => id !== groupId));
        persist();
      }
    },

    // Hover popover state
    get hoverPopover() {
      return _hoverPopover;
    },

    /**
     * Show hover popover for an item
     * @param {string} itemId
     * @param {{top: number, left: number}} position
     */
    showPopover(itemId, position) {
      if (!_collapsed) return;

      if (_hoverTimeout) {
        clearTimeout(_hoverTimeout);
        _hoverTimeout = null;
      }

      _hoverPopover = {
        item: itemId,
        position
      };
    },

    /**
     * Hide hover popover with delay
     * @param {number} [delay=150]
     */
    hidePopover(delay = 150) {
      if (_hoverTimeout) {
        clearTimeout(_hoverTimeout);
      }

      _hoverTimeout = setTimeout(() => {
        _hoverPopover = { item: null, position: { top: 0, left: 0 } };
      }, delay);
    },

    /**
     * Cancel pending popover hide
     */
    keepPopoverOpen() {
      if (_hoverTimeout) {
        clearTimeout(_hoverTimeout);
        _hoverTimeout = null;
      }
    },

    /**
     * Immediately hide popover
     */
    hidePopoverImmediate() {
      if (_hoverTimeout) {
        clearTimeout(_hoverTimeout);
        _hoverTimeout = null;
      }
      _hoverPopover = { item: null, position: { top: 0, left: 0 } };
    }
  };
}

/**
 * Sidebar context key for Svelte context API
 */
export const SIDEBAR_CONTEXT_KEY = 'sidebar';
