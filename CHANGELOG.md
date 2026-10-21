# Changelog

All notable changes to `@miozu/jera` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project is pre-1.0: breaking changes bump the **minor** version.

## [Unreleased]

## [0.11.0] - 2026-10-21

### BREAKING — no Svelte context

jera no longer calls `setContext`, `getContext`, `hasContext` or
`createContext` anywhere. State lives in reactive classes (`.svelte.js`,
`$state` fields, methods as the only writers). A parent hands its instance to
the children you place through a **snippet argument**
(`{#snippet children(x)}`), and each child takes it as an explicit **prop**.
There are no fallbacks: a child that needs an instance and does not get one
throws a clear error in dev (`import.meta.env.DEV`) and renders nothing in
production.

- **LeftBar family.** New `LeftBarState` class (`collapsed`, `hoverPopover`,
  `toggle()`, `expand()`, `collapse()`, `persist()`, `restore()`,
  `showPopover()`, `hidePopover()`, `keepPopoverOpen()`, `destroy()`),
  exported from `LeftBar.svelte` and the root barrel. LeftBar passes it to
  every snippet: `header(bar)`, `navigation(bar)`, `footer(bar)`,
  `children(bar)`. `LeftBarItem`, `LeftBarSection`, `LeftBarGroup`,
  `LeftBarToggle` and `LeftBarPopover` take the required `bar` prop. LeftBar
  takes an optional `bar` (it builds one from `initialCollapsed ?? collapsed`,
  `persistKey`, `cookieKey` when absent); `bind:collapsed`, `initialCollapsed`
  SSR seeding and localStorage/cookie persistence are unchanged. LeftBar
  renders the collapsed hover flyout from `popoverMap` itself.
  `LeftBarToggle` is now `type="button"` with an `aria-label` and forwards
  `...rest`; `LeftBarSection` forwards `...rest`.
- **RadioGroup / Radio.** New `RadioGroupState` (`value`, `name`, `disabled`,
  `variant`, `isChecked(v)`, `change(v)`), exported from `RadioGroup.svelte`
  and the root barrel. `children` is a snippet with one argument; `Radio`
  takes the required `group` prop. `bind:value`, `onchange`, native
  `input[name]` grouping and keyboard behaviour are unchanged; ids come from
  `$props.id()` (server and client match).
- **Accordion / AccordionItem.** New `AccordionState` (`expanded`,
  `multiple`, `isExpanded`, `toggle`, `open`, `close`), exported from
  `Accordion.svelte` and the barrels. `children` is a snippet with one
  argument; `AccordionItem` takes the `accordion` prop. Without it an item is
  a standalone section with its own `bind:expanded` (as before outside an
  Accordion); an item left without it **inside** an Accordion throws in dev
  after mount. Accordion forwards `...rest`. ids/ARIA wiring unchanged.
- **Toast.** `createToastContext()` and `getToastContext()` are removed. Use
  `getToastState(config?)`: one shared instance in the browser; on the server
  a fresh, never-cached instance per call (no state leaks between requests).
  Config passed on the server is not kept.
- **NavigationContainer and blocks** (deprecated family). No navigation or
  Sidebar context: NavigationContainer takes a new `collapsed` prop and passes
  `navigationState` and `collapsed` to every block (and to a block's own
  `component`) as props. `NavigationCustomBlock` passes `navigationState` and
  `isCollapsed` to its component (no `sidebar` object). `NAVIGATION_CONTEXT_KEY`
  is removed.
- **WorkspaceMenu** takes a `collapsed` prop (was read from the Sidebar
  context); the unused `in-sidebar` class is gone.
- **DropdownContainer**: no API change (dropped an unused `getContext`
  import); pass `isCollapsed={bar.collapsed}` inside a LeftBar header.

### Removed — Sidebar family archived

`Sidebar`, `SidebarItem`, `SidebarGroup`, `SidebarSection`, `SidebarToggle`,
`SidebarPopover`, `SidebarSearch`, `SidebarAccountGroup`, `SidebarAccountItem`
and `SidebarGroupSwitcher` (marked "replaced by LeftBar" since April) moved to
`_archive/` with their git history and are no longer exported or published.
`createSidebarState` / `SIDEBAR_CONTEXT_KEY` (`utils/sidebar.svelte.js`, no
users) are archived with them. Use the LeftBar family.
`SidebarNavigationItem` was still rendered by `NavigationSection`, so it moved
to `components/navigation/blocks/NavigationItem.svelte` (context removed).

### Fixed

- `utils/navigation.svelte.js` no longer imports `$app/environment`, so
  NavigationState works outside SvelteKit (and under `node --test`).

### Migration

Apply per family. Every child that used to find its parent through context now
gets the instance from the parent's snippet argument.

**LeftBar**

```svelte
<!-- before (0.10) -->
<LeftBar bind:collapsed initialCollapsed={data.sidebarCollapsed} persistKey="sidebarCollapsed" {popoverMap}>
  {#snippet header()}<UserDropdown isCollapsed={collapsed} />{/snippet}
  {#snippet navigation()}
    <LeftBarSection title="Misc"><LeftBarItem href="/a/" label="Atlas" /></LeftBarSection>
  {/snippet}
  {#snippet footer()}<LeftBarToggle />{/snippet}
</LeftBar>

<!-- after (0.11) -->
<LeftBar bind:collapsed initialCollapsed={data.sidebarCollapsed} persistKey="sidebarCollapsed" {popoverMap}>
  {#snippet header(bar)}<UserDropdown isCollapsed={bar.collapsed} />{/snippet}
  {#snippet navigation(bar)}
    <LeftBarSection {bar} title="Misc"><LeftBarItem {bar} href="/a/" label="Atlas" /></LeftBarSection>
  {/snippet}
  {#snippet footer(bar)}<LeftBarToggle {bar} />{/snippet}
</LeftBar>
```

A component of your own that rendered LeftBar children and read
`getContext('leftbar')` must take `bar` as a prop and pass it on:

```svelte
<!-- before -->
<script>const leftbar = getContext('leftbar');</script>
<LeftBarItem href="/x/" label="X" />
<!-- after -->
<script>let { bar } = $props();</script>
<LeftBarItem {bar} href="/x/" label="X" />
<!-- caller: {#snippet navigation(bar)}<MyRows {bar} />{/snippet} -->
```

**RadioGroup**

```svelte
<!-- before -->
<RadioGroup bind:value={plan} name="plan">
  <Radio value="monthly" label="Monthly" />
  <Radio value="yearly" label="Yearly" />
</RadioGroup>
<!-- after -->
<RadioGroup bind:value={plan} name="plan">
  {#snippet children(group)}
    <Radio {group} value="monthly" label="Monthly" />
    <Radio {group} value="yearly" label="Yearly" />
  {/snippet}
</RadioGroup>
```

**Accordion** (standalone `AccordionItem` with no `Accordion` needs no change)

```svelte
<!-- before -->
<Accordion bind:expanded multiple>
  <AccordionItem id="a" title="A">…</AccordionItem>
</Accordion>
<!-- after -->
<Accordion bind:expanded multiple>
  {#snippet children(accordion)}
    <AccordionItem {accordion} id="a" title="A">…</AccordionItem>
  {/snippet}
</Accordion>
```

**Toast**

```js
// before
import { createToastContext, getToastContext } from '@miozu/jera';
const toast = createToastContext(); // or getToastContext()
// after
import { getToastState } from '@miozu/jera/components/feedback/Toast';
const toast = getToastState();
```

**Sidebar → LeftBar** (archived family)

| 0.10 | 0.11 |
| --- | --- |
| `Sidebar` | `LeftBar` |
| `SidebarSection` | `LeftBarSection {bar}` |
| `SidebarItem` | `LeftBarItem {bar}` |
| `SidebarGroup` | `LeftBarGroup {bar}` |
| `SidebarToggle` | `LeftBarToggle {bar}` |
| `SidebarPopover` | rendered by LeftBar from `popoverMap` |
| `createSidebarState()` | `new LeftBarState({ collapsed, persistKey, cookieKey })` |

**NavigationContainer / WorkspaceMenu / DropdownContainer** (inside a LeftBar)

```svelte
<!-- before -->
<Sidebar>
  {#snippet header()}<WorkspaceMenu … />{/snippet}
  <NavigationContainer navigationState={s} blocks={b} />
</Sidebar>
<!-- after -->
<LeftBar>
  {#snippet header(bar)}<WorkspaceMenu collapsed={bar.collapsed} … />{/snippet}
  {#snippet navigation(bar)}
    <NavigationContainer navigationState={s} collapsed={bar.collapsed} blocks={b} />
  {/snippet}
</LeftBar>
<!-- DropdownContainer: isCollapsed={bar.collapsed} -->
```

### Added

- `requireInstance()` (the dev-throw / prod-nothing guard the children use)
  and `isBrowser()` in `@miozu/jera/utils`.
- **LeftBarItem** sub-route icons and attention rows (r9): a `subroutes[]`
  entry takes optional `icon` (a component, drawn at 16px in base04),
  `badge` (a count in the row's colour), `variant` (`warning` | `danger` |
  `success`, the item variants' colours on text, icon and count) and
  `divider` (a thin border-token rule above it). Entries without them render
  as before. **LeftBarPopover** (r3) items take the same fields, so the
  collapsed bar's hover flyout matches.

- **LeftBarItem** split row (r8): `expandable` with `href` renders the name as
  an `<a>` (leading/icon, label, badge; `aria-current="page"` when `active`)
  and a sibling chevron `<button aria-expanded aria-controls>` that folds the
  subroutes and never navigates — middle-click, prefetch and screen readers
  keep working on the name. New `toggleLabel` names the chevron (default
  `Show {label} pages`); the lit subroute carries `aria-current="page"`.
  `expandable` without `href` keeps the single-button shape. Not breaking.
- **DropdownSub** (beta, `@miozu/jera/components/overlays/DropdownSub`): a
  cascading submenu inside a Dropdown ("Views ▸", "Sort ▸"). The item is a
  `menuitem` with `aria-haspopup="menu"` / `aria-expanded`; the nested
  `role="menu"` is named by it. ArrowRight, Enter or Space opens and focuses
  the first item; ArrowLeft or Escape closes back to the item. Hover opens
  after `openDelay` (150ms); leaving starts a `closeDelay` grace (300ms) that a
  pointer reaching the submenu cancels, and a transparent bridge spans the gap.
  Flips left near the viewport edge and shifts up near the bottom. Timers are
  cleared on unmount.
- **DropdownItem** `checked` / `checkType` (r5): `checked` true or false makes
  the item a `menuitemradio` (or `menuitemcheckbox`) with `aria-checked` and a
  fixed leading check-mark slot. Items without `checked` render as before.
- **Dropdown** (r10): ArrowUp/ArrowDown move within the menu that holds focus
  (the panel or a submenu, never across levels), Home/End jump to the ends, and
  radio/checkbox item roles take part in navigation and first-item focus.

- **Combobox** (beta, `@miozu/jera/components/forms/Combobox`): a search field
  with a listbox of results the consumer fetches (`onquery`, debounced; empty
  text fires at once) and passes back as `items`. WAI-ARIA APG list-autocomplete
  combobox: focus stays in the input, `aria-activedescendant` tracks the active
  option, ArrowDown opens (`onopen`) and moves, Enter picks (`onpick`; return
  `false` to keep the list open and browse into a branch), Escape closes and
  keeps the text before SearchInput's own Escape clears it, Tab away and a
  press outside close (`ondismiss`), a polite live region reads the result
  count. Snippets `item(item, active)`, `empty`, `header`. Rows are 44px on
  coarse pointers. Key and debounce decisions live in `combobox.rules.js`.
- **ToolPanel** (beta, `@miozu/jera/components/overlays/ToolPanel`): a toolbar
  button that opens a non-modal form panel (filters, columns, refine). Native
  `popover="auto"` (top layer, light dismiss, Escape, focus return), CSS anchor
  positioning with a JS fallback, fixed width, scrolling body, pinned
  `footer(close)`, `count` pill, a custom `trigger(attrs)` face, or a bottom
  `Sheet` on phones. The icon-only face names itself with the count ("Filters,
  3 active"); a panel with no control takes focus itself.
- **HoverCard** (beta, `@miozu/jera/components/overlays/HoverCard`): one
  explanatory card for a whole container (a data table), wired by event
  delegation, drawn in the top layer, with open/next/close delays. Opens on
  keyboard focus of headers (`:focus-visible` only), closes on scrolls that
  move the target, consumes Escape. `body` must be non-interactive.
- **ChoiceGrid** (beta, `@miozu/jera/components/forms/ChoiceGrid`): square
  tiles picked as a multi (checkbox group) or single (radio group) choice,
  2-D roving arrows, `min`/`max`, `onselect` veto, optional add tile.
- **ChoiceList** (beta, `@miozu/jera/components/forms/ChoiceList`): a titled
  card of rows, ticked (multi) or carrying actions only (none), on the same
  selection model (`choice.rules.js`) as ChoiceGrid.
- Tests can render components: `tests/helpers/svelte-server.js` compiles
  `.svelte` / `.svelte.js` on import for `svelte/server` (no new dependency).

### Changed

- **LeftBarItem** (r9): the split row (`expandable` + `href`) is a segmented
  pair — the name link and the chevron button are both full row height and
  share the row's outer radius, with a `--border-width-thin` / base02
  separator between them; hover, active and focus ring are per segment (the
  chevron is no longer an inset 24px button with margins). Item and sub-row
  radius is `--radius-default` (was a literal 0.375rem). Sub-rows are flex
  rows (icon, label, count). Not breaking for props; the split row's look
  changes in dash.

## [0.10.0] - 2026-08-23

First release since `0.8.9` (published 2026-02-09). `0.9.0` was bumped in the
repo on 2026-03-07 but never published to npm, so everything that landed under
that version is included below.

### Fixed — accessibility

- **Dropdown: Escape now closes the menu and returns focus to the trigger.**
  The component imported the `clickOutside` and `escapeKey` actions but never
  applied either, so an open menu could not be dismissed from the keyboard —
  an ARIA APG menu-button violation. Escape is handled on the open menu's own
  subtree rather than on `document`, so a Dropdown that opens a Modal from a
  menu item no longer risks swallowing that Modal's Escape.
- **Dropdown: the menu container is focusable** (`tabindex="-1"`) and is used as
  the focus fallback when a menu has no enabled items, so keyboard dismissal
  works even for an empty menu. This also clears the `a11y_interactive_supports_focus`
  compiler warning on `role="menu"`.
- **Dropdown: `aria-haspopup` / `aria-expanded` moved to the real focusable
  trigger** instead of the wrapper `<div>`, so screen readers announce menu
  state on the actual control (WCAG 4.1.2).
- **ConfirmDialog: unique element ids per instance** — multiple dialogs on one
  page previously collided.
- **Sheet: the drag handle is keyboard-operable** (`role="button"`, Enter/Space
  to close) and releases pointer capture on drag end.
- **Theme: `init()` no longer crashes** with an `UNINITIALIZED` Symbol error on
  the first call.

### Added

- **Sheet** — bottom-sheet overlay built on native `<dialog>` (top layer) with
  drag-to-dismiss. Stage: beta.
- **CardRadioGroup** — card-style radio group with title + description per
  option; clearer than a `Select` for 2–6 high-stakes choices.
- **ChecklistCard** — sequential onboarding checklist that auto-hides when all
  steps complete.
- **NavBar**, **DashCard**, **DistributionBar**, **BottomPanel**,
  **ImageDropzone**, **ButtonInput**, **OptionCard**, **TagInput**.
- **DatePicker** (draft) — see _Known issues_ below.
- **Component lifecycle system** — `components.json` schema v2 (stage,
  revision, lastReviewed, breaking, docLevel) plus `scripts/audit.js` for
  schema/drift/docs/staleness checks.
- **`./meta` export** with enriched component descriptions for AI consumers.
- **SearchInput**: bindable `inputEl` reference for programmatic focus.
- **LeftBar**: SSR-safe collapsed-state persistence.

### Changed

- **Toast is now a singleton reactive class** — `getToastState()` replaces the
  context API, with dual progress display (ring or bar), pause-on-hover, Svelte
  transitions and top-layer `popover` rendering. `createToastContext()` is kept
  as a deprecated wrapper that delegates to the singleton.
- **Dropdown rewritten** to render portaled at body level with CSS Anchor
  Positioning (and a JS fallback), viewport auto-flip, ARIA and arrow-key
  navigation. Consumers overriding `:global(.dropdown-content)` positioning
  should drop those overrides.
- **ConfirmDialog rewritten** on native `<dialog>`; **Modal** gained
  close-on-Escape and a `fill` mode that pins dialog height.
- **DatePicker migrated to the Temporal API** via `@js-temporal/polyfill`.
- **Design-token consistency passes** across every component: borders, focus
  rings, shadows, transitions, border-radius and z-index all read from tokens;
  Badge and Avatar are pure CSS on base16 tokens.
- **Tabs**: added the `segment` variant and a tinted sliding indicator.
- **Deep-path imports are the documented default**; dead barrel re-exports and
  legacy `svelte:self` usage removed for Svelte 5 compatibility.
- **Avatar**: skips generated-avatar URL fetches and renders initials locally.
- Peer `svelte` development target bumped to 5.56.3.

### Removed

- **StatusBadge** — use `Badge` with a semantic variant.
- **Drawer**, **Stepper**, **ValidatedInput**, **MultiUrlInput** — unused, no
  consumers.
- WebKit scrollbar hacks and dead barrel exports.

### Known issues

- `@js-temporal/polyfill` is still listed under runtime `dependencies`, which
  breaks the library's zero-runtime-dependency claim for npm and GitHub
  installs. It is imported only by `DatePicker.svelte` (stage: draft, no
  consumers), but the barrel `src/index.js` re-exports DatePicker and
  `Toast.svelte` imports from that barrel, so the ~214 KB polyfill is pulled
  into a consumer's dev module graph even when DatePicker is never used.
  Planned fix: move it to an optional `peerDependency`, matching how `shiki`
  is already handled for the syntax-highlighting components.

## [0.8.9] - 2026-02-09

Last version published to npm before this release.
