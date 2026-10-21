/**
 * Jera Utilities
 *
 * Core utilities for class composition and reactive state management.
 */

export { cn, rcn, cv, mergeClasses, when, match } from './cn.svelte.js';
export {
  createReactive,
  createDerived,
  ThemeState,
  getTheme,
  resetTheme,
  createComponentState,
  createIdGenerator,
  generateId
} from './reactive.svelte.js';

export {
  NavigationState,
  createNavigationState,
  createActiveChecker
} from './navigation.svelte.js';

export {
  getHighlighter,
  highlightCode,
  DEFAULT_LANGUAGES
} from './highlighter.js';

export {
  generateAvatar,
  generateAvatarDataURL,
  generateAvatarBlob
} from './avatar.js';

export { splitSentences, diffSentences, diffSummary } from './diff.js';
export { normalizeHex } from './color.js';

export { BADGE_COLOR_VARIANTS, badgeVariant } from './badge.js';
export { isBrowser } from './env.js';
export { requireInstance } from './requireInstance.js';
