/**
 * @miozu/jera
 *
 * A minimal, reactive component library for Svelte 5.
 * Designed for elegance, scalability, and AI-assisted development.
 *
 * @author Nicholas Glazer <glazer.nicholas@gmail.com>
 * @license MIT
 *
 * @example
 * // Import components
 * import { Button, Input, Badge, Select, Toast } from '@miozu/jera';
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
// COMPONENTS - Primitives
// ============================================

export { default as Button, buttonStyles } from './components/primitives/Button.svelte';
export { default as Badge, badgeStyles } from './components/primitives/Badge.svelte';

// ============================================
// COMPONENTS - Forms
// ============================================

export { default as Input } from './components/forms/Input.svelte';
export { default as Select } from './components/forms/Select.svelte';
export { default as Checkbox } from './components/forms/Checkbox.svelte';
export { default as Switch } from './components/forms/Switch.svelte';

// ============================================
// COMPONENTS - Feedback
// ============================================

export {
  default as Toast,
  ToastController,
  createToastContext,
  getToastContext,
  toastStyles,
  positionStyles
} from './components/feedback/Toast.svelte';

// ============================================
// UTILITIES - Class Composition
// ============================================

export { cn, rcn, cv, mergeClasses, when, match } from './utils/cn.svelte.js';

// ============================================
// UTILITIES - Reactive State
// ============================================

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
