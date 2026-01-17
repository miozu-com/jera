/**
 * @miozu/jera
 *
 * A minimal, reactive component library for Svelte 5.
 * Designed for elegance, scalability, and ease of application.
 *
 * @example
 * // Import components
 * import { Button, Select, Toast } from '@miozu/jera';
 *
 * // Import utilities
 * import { cn, cv } from '@miozu/jera';
 *
 * // Import actions
 * import { clickOutside, focusTrap } from '@miozu/jera/actions';
 *
 * // Import tokens (CSS)
 * import '@miozu/jera/tokens';
 */

// ============================================
// COMPONENTS
// ============================================

// Primitives
export { default as Button, buttonStyles } from './components/primitives/Button.svelte';

// Forms
export { default as Select } from './components/forms/Select.svelte';

// Feedback
export {
  default as Toast,
  ToastController,
  createToastContext,
  getToastContext,
  toastStyles,
  positionStyles
} from './components/feedback/Toast.svelte';

// ============================================
// UTILITIES
// ============================================

// Class composition
export { cn, rcn, cv, mergeClasses, when, match } from './utils/cn.svelte.js';

// Reactive state
export {
  createReactive,
  createDerived,
  ThemeState,
  createThemeContext,
  getThemeContext,
  createComponentState,
  createIdGenerator,
  generateId
} from './utils/reactive.svelte.js';

// ============================================
// ACTIONS
// ============================================

export {
  clickOutside,
  focusTrap,
  autoFocus,
  longPress,
  escapeKey,
  portal,
  intersect,
  resize,
  copy
} from './actions/index.js';
