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

// --------------------------------------------
// COMPONENTS - Primitives
// --------------------------------------------

export { default as Button } from './components/primitives/Button.svelte';
export { default as Badge } from './components/primitives/Badge.svelte';
export { default as StatusBadge } from './components/primitives/StatusBadge.svelte';
export { default as Divider } from './components/primitives/Divider.svelte';
export { default as Avatar } from './components/primitives/Avatar.svelte';
export { default as Card } from './components/primitives/Card.svelte';
export { default as Stat } from './components/primitives/Stat.svelte';
export { default as Link } from './components/primitives/Link.svelte';
export { default as LinkCard } from './components/primitives/LinkCard.svelte';
export { default as LazyImage } from './components/primitives/LazyImage.svelte';
export { default as MetricCard } from './components/primitives/MetricCard.svelte';
export { default as FilterChip } from './components/primitives/FilterChip.svelte';
export { default as StatusLine } from './components/primitives/StatusLine.svelte';
export { default as Tooltip } from './components/primitives/Tooltip.svelte';
export { default as MemberCard } from './components/primitives/MemberCard.svelte';
export { default as DashCard } from './components/primitives/DashCard.svelte';
export { default as DistributionBar } from './components/primitives/DistributionBar.svelte';
export { default as ThemeToggle } from './components/primitives/ThemeToggle.svelte';
export { default as ThemeSelect } from './components/primitives/ThemeSelect.svelte';

// --------------------------------------------
// COMPONENTS - Forms
// --------------------------------------------

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

// --------------------------------------------
// COMPONENTS - Feedback
// --------------------------------------------

export {
  default as Toast,
  ToastController,
  createToastContext,
  getToastContext
} from './components/feedback/Toast.svelte';

export { default as Skeleton } from './components/feedback/Skeleton.svelte';
export { default as ProgressBar } from './components/feedback/ProgressBar.svelte';
export { default as Spinner } from './components/feedback/Spinner.svelte';
export { default as EmptyState } from './components/feedback/EmptyState.svelte';
export { default as Alert } from './components/feedback/Alert.svelte';

// --------------------------------------------
// COMPONENTS - Overlays
// --------------------------------------------

export { default as Modal } from './components/overlays/Modal.svelte';
export { default as Popover } from './components/overlays/Popover.svelte';
export { default as Dropdown } from './components/overlays/Dropdown.svelte';
export { default as DropdownItem } from './components/overlays/DropdownItem.svelte';
export { default as DropdownDivider } from './components/overlays/DropdownDivider.svelte';
export { default as ConfirmDialog } from './components/overlays/ConfirmDialog.svelte';

// --------------------------------------------
// COMPONENTS - Navigation
// --------------------------------------------

export { default as Tabs } from './components/navigation/Tabs.svelte';
export { default as TabNav } from './components/navigation/TabNav.svelte';
export { default as ChipNav } from './components/navigation/ChipNav.svelte';
export { default as ScrollNav } from './components/navigation/ScrollNav.svelte';
export { default as Accordion } from './components/navigation/Accordion.svelte';
export { default as AccordionItem } from './components/navigation/AccordionItem.svelte';

// Sidebar Components (Legacy - Enhanced)
export { default as Sidebar } from './components/navigation/Sidebar.svelte';
export { default as SidebarSection } from './components/navigation/SidebarSection.svelte';
export { default as SidebarItem } from './components/navigation/SidebarItem.svelte';
export { default as SidebarGroup } from './components/navigation/SidebarGroup.svelte';
export { default as SidebarPopover } from './components/navigation/SidebarPopover.svelte';
export { default as SidebarAccountItem } from './components/navigation/SidebarAccountItem.svelte';
export { default as SidebarToggle } from './components/navigation/SidebarToggle.svelte';
export { default as SidebarSearch } from './components/navigation/SidebarSearch.svelte';
export { default as SidebarGroupSwitcher } from './components/navigation/SidebarGroupSwitcher.svelte';
export { default as SidebarAccountGroup } from './components/navigation/SidebarAccountGroup.svelte';

// Enterprise Navigation System
export { default as NavigationContainer } from './components/navigation/NavigationContainer.svelte';
export { default as SidebarNavigationItem } from './components/navigation/SidebarNavigationItem.svelte';

// Navigation Blocks
export { default as NavigationSearch } from './components/navigation/blocks/NavigationSearch.svelte';
export { default as NavigationSection } from './components/navigation/blocks/NavigationSection.svelte';
export { default as NavigationAccountGroup } from './components/navigation/blocks/NavigationAccountGroup.svelte';
export { default as NavigationGroupSwitcher } from './components/navigation/blocks/NavigationGroupSwitcher.svelte';
export { default as NavigationCustomBlock } from './components/navigation/blocks/NavigationCustomBlock.svelte';

// Enterprise Components
export { default as WorkspaceMenu } from './components/navigation/WorkspaceMenu.svelte';

// NavBar (Horizontal mega-menu)
export { default as NavBar } from './components/navigation/NavBar.svelte';

// LeftBar Components (Admin-style sidebar)
export { default as LeftBar } from './components/navigation/LeftBar.svelte';
export { default as LeftBarSection } from './components/navigation/LeftBarSection.svelte';
export { default as LeftBarItem } from './components/navigation/LeftBarItem.svelte';
export { default as LeftBarGroup } from './components/navigation/LeftBarGroup.svelte';
export { default as LeftBarToggle } from './components/navigation/LeftBarToggle.svelte';
export { default as LeftBarPopover } from './components/navigation/LeftBarPopover.svelte';
export { default as DropdownContainer } from './components/navigation/DropdownContainer.svelte';

// --------------------------------------------
// COMPONENTS - Layout
// --------------------------------------------

export { default as PageHeader } from './components/layout/PageHeader.svelte';
export { default as SettingCard } from './components/layout/SettingCard.svelte';
export { default as SettingItem } from './components/layout/SettingItem.svelte';
export { default as BottomPanel } from './components/layout/BottomPanel.svelte';

// --------------------------------------------
// COMPONENTS - Documentation
// --------------------------------------------

export { default as CodeBlock } from './components/docs/CodeBlock.svelte';
export { default as PropsTable } from './components/docs/PropsTable.svelte';
export { default as SplitPane } from './components/docs/SplitPane.svelte';
export { default as DocSection } from './components/docs/DocSection.svelte';

// --------------------------------------------
// UTILITIES - Class Composition
// --------------------------------------------

export { cn, rcn, cv, mergeClasses, when, match } from './utils/cn.svelte.js';

// --------------------------------------------
// UTILITIES - Reactive State
// --------------------------------------------

export {
  createReactive,
  createDerived,
  ThemeState,
  getTheme,
  resetTheme,
  createComponentState,
  createIdGenerator,
  generateId
} from './utils/reactive.svelte.js';

// Sidebar State Management
export {
  createSidebarState,
  SIDEBAR_CONTEXT_KEY
} from './utils/sidebar.svelte.js';

// Enterprise Navigation State Management
export {
  NavigationState,
  createNavigationState,
  createActiveChecker,
  NAVIGATION_CONTEXT_KEY
} from './utils/navigation.svelte.js';

// Code Highlighting
export {
  getHighlighter,
  highlightCode,
  DEFAULT_LANGUAGES
} from './utils/highlighter.js';

// --------------------------------------------
// ACTIONS
// --------------------------------------------

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
