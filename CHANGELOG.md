# Changelog

All notable changes to `@miozu/jera` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project is pre-1.0: breaking changes bump the **minor** version.

## [Unreleased]

### Added

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
