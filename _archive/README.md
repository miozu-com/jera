# _archive

Code removed from the published `@miozu/jera` package but kept in git with its
history (moved with `git mv`). Nothing here is exported, built, or covered by
`components.json`, the audit, or the tests. `package.json` `"files"` publishes
`src/` only, so this folder never ships.

## 2026-10-21 — 0.11.0: the Sidebar family

**What:** `Sidebar`, `SidebarItem`, `SidebarGroup`, `SidebarSection`,
`SidebarToggle`, `SidebarPopover`, `SidebarSearch`, `SidebarAccountGroup`,
`SidebarAccountItem`, `SidebarGroupSwitcher` (`components/navigation/`) and the
dead `createSidebarState` / `SIDEBAR_CONTEXT_KEY` util (`utils/sidebar.svelte.js`,
zero users).

**Why:** owner decisions of 2026-10-21 for the no-context release. (1) jera has
no Svelte context any more: state lives in reactive classes handed to children
as props. (2) dash's current components are the standard: `components.json` had
marked the whole Sidebar family "replaced by LeftBar" since April, so it was
archived instead of migrated. The 0.11.0 replacement is the LeftBar family with
`LeftBarState` (`src/components/navigation/LeftBar.svelte`,
`leftBar.svelte.js`).

**Not archived:** `SidebarNavigationItem` was the recursive item that the live
`NavigationSection` block renders, so it moved to
`src/components/navigation/blocks/NavigationItem.svelte` (context removed)
rather than here.

**Migrating a consumer:** `Sidebar` → `LeftBar`, `SidebarSection` →
`LeftBarSection`, `SidebarItem` → `LeftBarItem`, `SidebarGroup` →
`LeftBarGroup`, `SidebarToggle` → `LeftBarToggle`, `SidebarPopover` →
`LeftBarPopover` (LeftBar renders it from `popoverMap`). Each child takes the
`bar` prop from LeftBar's snippet argument (`{#snippet navigation(bar)}`). The
files here import paths relative to their old `src/` location and do not build
as-is.
