# QA Component Runner

Automated 4-layer accessibility and interaction test suite for Jera UI components.

---

## Layers

| Layer | What it tests |
|---|---|
| L1 — Accessibility | axe-core (WCAG 2.1 AA) + canvas pixel contrast sampling |
| L2 — Interaction | Tab focus, focus ring, Enter/Space, Escape, click, hover, disabled, 5 ARIA checks |
| L3 — Props edge cases | Empty string, long text, special chars (XSS), all variants, numeric zero, whitespace |
| L4 — Responsive | 375×812 · 768×1024 · 1440×900 — render, overflow, text readability, layout |

---

## Environments

### Selify (default)

Uses `admin.selify.ai` — a custom component documentation system, **not** standard Storybook.
No `STORYBOOK_MODE` configuration needed; `selify` is the default.

**Selectors used:**
- Preview area: `.preview-area`
- Controls panel: `.controls-panel`
- Variant select: `.controls-panel select.jera-select`
- Dark/light toggle: `.dark-light-toggle` (L1 runs both light + dark)

**Run single component:**
```bash
source load-credentials.sh
STORYBOOK_URL=https://admin.selify.ai node component-test-runner.js --component Badge
```

**Run full suite:**
```bash
source load-credentials.sh
STORYBOOK_URL=https://admin.selify.ai node component-suite-runner.js
```

---

### Standard Storybook

Set `STORYBOOK_MODE=storybook` for a standard Storybook v7/v8 instance (e.g. `localhost:6006`).

**Selectors used:**
- Preview area: `.docs-story` (first story block in docs view)
- Controls panel: `.docblock-argstable`
- Variant select: `.docblock-argstable select`
- Dark/light toggle: none (L1 runs light mode only — no built-in toggle)

**URL format:** `{STORYBOOK_URL}/?path=/docs/{slug}--docs`

**Run single component (CI, no auth):**
```bash
STORYBOOK_MODE=storybook STORYBOOK_URL=http://localhost:6006 \
  node component-test-runner.js --component Badge
```

**Run full suite (CI):**
```bash
STORYBOOK_MODE=storybook STORYBOOK_URL=http://localhost:6006 \
  node component-suite-runner.js --ci
```

> **Note:** Selectors are based on Storybook v7/v8 docs view DOM structure.
> If selectors don't match your setup, please open an issue or check your Storybook version.

---

## Flags

| Flag | Description |
|---|---|
| `--component <Name>` | Run a single component by PascalCase name (e.g. `--component Badge`) |
| `--dry-run` | Discover components but skip tests |
| `--ci` | Skip authentication (for CI environments) |
| `--no-specs` | Skip auto-generating `.spec.ts` files after a suite run |
| `--components a,b` | Suite only: run a comma-separated subset of components |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `STORYBOOK_URL` | `http://localhost:6006` | Base URL of the docs/Storybook server |
| `STORYBOOK_MODE` | `selify` | `selify` or `storybook` — controls URL format and DOM selectors |
| `CI` | — | Set to `true` to skip authentication |
| `STORYBOOK_EMAIL` | — | Login email (Selify mode only) |
| `STORYBOOK_PASSWORD` | — | Login password (Selify mode only) |

---

## Output

| File | Location |
|---|---|
| Per-component JSON | `qa/reports/{component}-test-results.json` |
| Suite report | `qa/reports/suite-test-results.json` |
| Playwright specs | `qa/specs/{component}.spec.ts` (auto-generated for failing components) |
| Screenshots | `qa/screenshots/` |
