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
 * import { Button, Input, IconInput, SearchInput, PinInput, RangeSlider, Toast, Modal } from '@miozu/jera';
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
export { default as StatusBadge } from './components/primitives/StatusBadge.svelte';
export { default as Divider } from './components/primitives/Divider.svelte';
export { default as Avatar } from './components/primitives/Avatar.svelte';
export { default as Card } from './components/primitives/Card.svelte';
export { default as Link } from './components/primitives/Link.svelte';
export { default as LazyImage } from './components/primitives/LazyImage.svelte';

// ============================================
// COMPONENTS - Forms
// ============================================

export { default as Input } from './components/forms/Input.svelte';
export { default as IconInput } from './components/forms/IconInput.svelte';
export { default as Textarea } from './components/forms/Textarea.svelte';
export { default as Select } from './components/forms/Select.svelte';
export { default as Checkbox } from './components/forms/Checkbox.svelte';
export { default as Switch } from './components/forms/Switch.svelte';
export { default as NumberInput } from './components/forms/NumberInput.svelte';
export { default as Radio } from './components/forms/Radio.svelte';
export { default as RadioGroup } from './components/forms/RadioGroup.svelte';
export { default as FileUpload } from './components/forms/FileUpload.svelte';
export { default as RangeSlider } from './components/forms/RangeSlider.svelte';
export { default as SearchInput } from './components/forms/SearchInput.svelte';
export { default as PinInput } from './components/forms/PinInput.svelte';
export { default as Dropzone } from './components/forms/Dropzone.svelte';

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

export { default as Skeleton } from './components/feedback/Skeleton.svelte';
export { default as ProgressBar } from './components/feedback/ProgressBar.svelte';
export { default as Spinner } from './components/feedback/Spinner.svelte';
export { default as EmptyState } from './components/feedback/EmptyState.svelte';

// ============================================
// COMPONENTS - Overlays
// ============================================

export { default as Modal } from './components/overlays/Modal.svelte';
export { default as Popover } from './components/overlays/Popover.svelte';
export { default as Dropdown } from './components/overlays/Dropdown.svelte';
export { default as DropdownItem } from './components/overlays/DropdownItem.svelte';
export { default as DropdownDivider } from './components/overlays/DropdownDivider.svelte';
export { default as ConfirmDialog } from './components/overlays/ConfirmDialog.svelte';

// ============================================
// COMPONENTS - Navigation
// ============================================

export { default as Tabs } from './components/navigation/Tabs.svelte';
export { default as Accordion } from './components/navigation/Accordion.svelte';
export { default as AccordionItem } from './components/navigation/AccordionItem.svelte';

// Sidebar Components
export { default as Sidebar } from './components/navigation/Sidebar.svelte';
export { default as SidebarSection } from './components/navigation/SidebarSection.svelte';
export { default as SidebarItem } from './components/navigation/SidebarItem.svelte';
export { default as SidebarGroup } from './components/navigation/SidebarGroup.svelte';
export { default as SidebarPopover } from './components/navigation/SidebarPopover.svelte';
export { default as SidebarAccountItem } from './components/navigation/SidebarAccountItem.svelte';

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

// Sidebar State Management
export {
  createSidebarState,
  SIDEBAR_CONTEXT_KEY
} from './utils/sidebar.svelte.js';

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
