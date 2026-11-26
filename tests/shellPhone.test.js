/**
 * Release QA 2026-11-26 (dash prod check), the shell on a phone and its copy:
 *
 * - NavBar: an empty `center` takes no width (`.navbar-center:empty`), the
 *   tabs give way on a phone only when the sections menu lists every one of
 *   them (`data-subnav-in-menu`), and the grid toggle meets the 32px tap target.
 *   A filled centre keeps its width on a phone; NavBarBrand's label truncates
 *   inside its squeezed wrap (`max-width: min(11rem, 100%)`).
 * - Toast: at <= 480px the container spans the screen between 12px gutters;
 *   `width: auto` beats the popover UA `width: fit-content`. Pausing is for a
 *   mouse only: a tap that paused it left it over the navbar for good.
 * - No long dashes in user-visible copy (ImageDropzone, TagInput's refusal).
 */

import "./helpers/svelte-server.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const src = (rel) => new URL(`../src/components/${rel}`, import.meta.url);
const cssOf = (rel) => {
  const file = src(rel);
  return compile(readFileSync(file, "utf8"), {
    filename: file.pathname,
    css: "external",
  }).css.code;
};
/** The body of the first `@media (max-width: Npx)` block containing `selector`. */
function mediaRule(css, width, selector) {
  const head = `@media (max-width: ${width}px)`;
  for (
    let from = css.indexOf(head);
    from !== -1;
    from = css.indexOf(head, from + 1)
  ) {
    // The block's body, matched brace for brace.
    let end = css.indexOf("{", from);
    const start = end + 1;
    let depth = 0;
    do {
      if (css[end] === "{") depth++;
      else if (css[end] === "}") depth--;
      end++;
    } while (depth > 0 && end < css.length);
    const body = css.slice(start, end - 1);
    const at = body.indexOf(selector);
    if (at === -1) continue;
    return body.slice(at, body.indexOf("}", at) + 1);
  }
  return null;
}

const { default: NavBar } =
  await import("../src/components/navigation/NavBar.svelte");
const { default: Toast } =
  await import("../src/components/feedback/Toast.svelte");
const { default: ImageDropzone } =
  await import("../src/components/forms/ImageDropzone.svelte");
const { tagRejection } =
  await import("../src/components/forms/tagInput.rules.js");

const ORG = [
  { id: "overview", label: "Overview", href: "/w/org/" },
  { id: "members", label: "Members", href: "/w/org/members/" },
];
const SECTIONS = [
  {
    id: "management",
    label: "Management",
    items: [
      {
        title: "Organization",
        href: "/w/org/",
        children: [
          { title: "Overview", href: "/w/org/" },
          { title: "Members", href: "/w/org/members/" },
        ],
      },
    ],
  },
];
const navTag = (props) =>
  render(NavBar, { props }).body.match(/<nav[^>]*class="navbar[^"]*"[^>]*>/)[0];

test("NavBar: more tabs than phoneSubnavMax, all in the sections menu, give way on a phone", () => {
  assert.match(
    navTag({ sections: SECTIONS, subnavItems: ORG, activeSubnav: "members", phoneSubnavMax: 1 }),
    /data-subnav-in-menu/,
  );
  // Up to the default 3 tabs fit beside the brand and the actions: they stay.
  assert.doesNotMatch(
    navTag({ sections: SECTIONS, subnavItems: ORG, activeSubnav: "members" }),
    /data-subnav-in-menu/,
  );
});

test("NavBar: tabs the menu does not list stay (catalog-style), as do tabs without sections", () => {
  const extra = [...ORG, { id: "extra", label: "Extra", href: "/w/extra/" }];
  assert.doesNotMatch(
    navTag({ sections: SECTIONS, subnavItems: extra }),
    /data-subnav-in-menu/,
  );
  assert.doesNotMatch(navTag({ subnavItems: ORG }), /data-subnav-in-menu/);
  // A hidden grid toggle is no way to the pages: the tabs must stay.
  assert.doesNotMatch(
    navTag({ sections: SECTIONS, subnavItems: ORG, phoneSections: "hidden" }),
    /data-subnav-in-menu/,
  );
});

test("NavBar CSS: an empty centre slot takes no room; phone hides only listed tabs", () => {
  const css = cssOf("navigation/NavBar.svelte");
  assert.match(
    css,
    /\.navbar-center\.svelte-[\w-]+:empty\s*\{\s*display: none;/,
  );
  const hide = mediaRule(css, 640, "[data-subnav-in-menu]");
  assert.ok(hide, "a <= 640px rule keyed on data-subnav-in-menu");
  assert.match(hide, /\.chip-nav\s*\{\s*display: none;/);
});

test("NavBar CSS: the grid toggle is at least the 32px tap target on a phone", () => {
  const rule = mediaRule(
    cssOf("navigation/NavBar.svelte"),
    640,
    ".navbar-nav-toggle",
  );
  assert.ok(rule, "a <= 640px rule for .navbar-nav-toggle");
  assert.match(rule, /width: var\(--space-16\)/);
  assert.match(rule, /height: var\(--space-16\)/);
});

test("Toast CSS: at <= 480px the container stretches between the gutters", () => {
  const rule = mediaRule(
    cssOf("feedback/Toast.svelte"),
    480,
    ".toast-container",
  );
  assert.ok(rule, "a <= 480px rule for .toast-container");
  assert.match(rule, /left: 0\.75rem/);
  assert.match(rule, /right: 0\.75rem/);
  assert.match(rule, /width: auto/);
  assert.match(rule, /transform: none/);
});

test("Toast: pause on hover is wired to a mouse pointer only", () => {
  const source = readFileSync(src("feedback/Toast.svelte"), "utf8");
  assert.doesNotMatch(source, /onmouseenter=\{\(\) => toast\.pause/);
  assert.match(
    source,
    /onpointerenter=\{\(e\) => e\.pointerType === 'mouse' && toast\.pause\(item\.id\)\}/,
  );
  assert.match(render(Toast).body, /popover="manual"/);
});

test("ImageDropzone: no long dash in its rendered copy or aria-labels", () => {
  const body = render(ImageDropzone, { props: { files: [] } }).body;
  assert.match(body, /Image upload zone: drop, browse or paste/);
  assert.match(body, /or paste a screenshot \((Ctrl\+V|⌘V)\)/);
  assert.doesNotMatch(body, /[—–]/);
});

test("ImageDropzone: the type refusal is two sentences, not a dash", () => {
  const source = readFileSync(src("forms/ImageDropzone.svelte"), "utf8");
  assert.match(source, /`\. Use \$\{accepted\.join\(', '\)\}\.`/);
  assert.doesNotMatch(source, /` — use /);
});

test("TagInput: the over-long refusal has no long dash", () => {
  const refusal = tagRejection("x".repeat(12), { tags: [], maxTagLength: 10 });
  assert.equal(
    refusal.message,
    "Limit of 10 characters. This one is 12. Shorten it to add it.",
  );
});

test("NavBar CSS: a filled centre keeps its width on a phone; the brand truncates instead", () => {
  const rule = mediaRule(
    cssOf("navigation/NavBar.svelte"),
    640,
    ".navbar-center",
  );
  assert.ok(rule, "a <= 640px rule for .navbar-center");
  assert.match(rule, /flex: none/);
  const brand = mediaRule(
    cssOf("navigation/NavBarBrand.svelte"),
    640,
    ".navbar-brand.",
  );
  assert.ok(brand, "a <= 640px rule for .navbar-brand");
  assert.match(brand, /max-width: min\(11rem, 100%\)/);
});

test("Toast CSS: phone top positions honour --toast-inset-top", () => {
  const rule = mediaRule(
    cssOf("feedback/Toast.svelte"),
    480,
    ".toast-top-center",
  );
  assert.ok(rule, "a <= 480px rule for the top positions");
  assert.match(rule, /top: var\(--toast-inset-top, 1rem\)/);
});
