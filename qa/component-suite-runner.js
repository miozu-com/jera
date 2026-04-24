/*
  component-suite-runner.js
  ─────────────────────────────────────────────────────────────────────────────
  Full component library test suite. Loads components from Jera src/index.js
  (source of truth), cross-references components.json for stage metadata, and
  runs component-test-runner.js for each stable/beta component.

  Skills used (via component-test-runner.js):
    - component-props-parser.md  → variant discovery
    - axe-core.md                → accessibility scan
    - screenshot-capture.md      → evidence capture
    - dark-light-toggle.md       → theme switching

  Usage:
    source load-credentials.sh
    node component-suite-runner.js

  Optional flags:
    --dry-run                    Discover components but do not run tests
    --no-specs                   Skip automatic .spec.ts generation after run
    --ci                         CI mode (set via CI=true env var or this flag)
    --components button,badge    Run only these components (comma-separated, case-insensitive)

  Environment:
    STORYBOOK_URL                Base URL for Storybook (default: http://localhost:6006)

  Output:
    Per-component JSONs → qa/reports/
    Suite report        → qa/reports/suite-test-results.json
  ─────────────────────────────────────────────────────────────────────────────
*/

'use strict';

const { execSync }  = require('child_process');
const { chromium }  = require('playwright');
const path          = require('path');
const fs            = require('fs');

const { testComponent, ensureAuthenticated } = require('./component-test-runner');

// ── Paths ──────────────────────────────────────────────────────────────────
const REPORTS_DIR    = path.join(__dirname, 'reports');
const STORYBOOK_URL  = (process.env.STORYBOOK_URL || 'http://localhost:6006').replace(/\/$/, '');
// Selify mode:    uses custom /docs/components/ pages
// Standard Storybook mode: uses /?path=/docs/ with v7/v8 DOM structure
const STORYBOOK_MODE = process.env.STORYBOOK_MODE || 'selify';

// src/index.js — local path works when running from Jera repo (qa/ dir);
// falls back to GitHub raw if not present (QA-System standalone context).
const JERA_INDEX_LOCAL  = path.join(__dirname, '../src/index.js');
const JERA_INDEX_REMOTE = 'https://raw.githubusercontent.com/miozu-com/jera/main/src/index.js';

// components.json — stage metadata.
const COMPONENTS_JSON_LOCAL  = path.join(__dirname, 'components.json');

// ── Load components from Jera src/index.js ────────────────────────────────
// Source of truth: miozu-com/jera/src/index.js
// Cross-references components.json for stage (stable/beta only).
// Returns: [{ component: 'ButtonGroup', slug: 'button-group', storyUrl, stage }]
function loadComponents() {
  // Step 1: Read src/index.js (local first, then GitHub fallback)
  let indexContent;
  if (fs.existsSync(JERA_INDEX_LOCAL)) {
    indexContent = fs.readFileSync(JERA_INDEX_LOCAL, 'utf8');
    console.log('[Components] Using local src/index.js');
  } else {
    console.log('[Components] Local src/index.js not found — fetching from GitHub...');
    try {
      indexContent = execSync(`curl -sf "${JERA_INDEX_REMOTE}"`, { encoding: 'utf8', timeout: 15000 });
    } catch (err) {
      throw new Error(`Could not fetch Jera src/index.js from GitHub: ${err.message}`);
    }
  }

  // Extract PascalCase names: `export { default as ComponentName } from ...`
  const componentNames = [];
  const re = /export\s*\{\s*default\s+as\s+(\w+)\s*\}/g;
  let m;
  while ((m = re.exec(indexContent)) !== null) {
    componentNames.push(m[1]);
  }
  console.log(`[Components] Found ${componentNames.length} component(s) in src/index.js`);

  // Step 2: Load stage metadata from components.json
  const stageMap = {};
  for (const p of [COMPONENTS_JSON_LOCAL]) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        for (const c of data.components) {
          stageMap[c.name] = c.stage;
        }
        console.log(`[Components] Loaded stage metadata from ${p}`);
        break;
      } catch (err) {
        console.warn(`[Components] Could not read ${p}: ${err.message}`);
      }
    }
  }

  // Step 3: Build list — stable + beta only
  const components = [];
  const skipped    = [];

  for (const name of componentNames) {
    const stage = stageMap[name] ?? 'draft';
    // PascalCase → kebab-case
    const slug = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    // Selify mode:    uses custom /docs/components/ pages
    // Standard Storybook mode: uses /?path=/docs/ with v7/v8 DOM structure
    const storyUrl = STORYBOOK_MODE === 'storybook'
      ? `${STORYBOOK_URL}/?path=/docs/${slug}--docs`
      : `${STORYBOOK_URL}/docs/components/${slug}/`;

    if (stage === 'stable' || stage === 'beta') {
      components.push({ component: name, slug, storyUrl, stage });
    } else {
      skipped.push({ component: name, stage });
    }
  }

  if (skipped.length) {
    console.log(`[Components] Skipped ${skipped.length} component(s) (not stable/beta):`);
    for (const s of skipped) {
      console.log(`     ✗ ${s.component} — ${s.stage}`);
    }
  }

  return components;
}

// ── CLI args ───────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const dryRun     = args.includes('--dry-run');
const noSpecs    = args.includes('--no-specs');
const CI_MODE    = process.env.CI === 'true' || args.includes('--ci');

const componentsFlag = (() => {
  const idx = args.indexOf('--components');
  if (idx === -1) return null;
  return new Set(args[idx + 1].toLowerCase().split(',').map(s => s.trim()));
})();

// ── Aggregate results into suite report ───────────────────────────────────

function buildSuiteReport(componentResults, startTime) {
  const suite = {
    date: new Date().toISOString().slice(0, 10),
    duration_ms: Date.now() - startTime,
    components_tested: componentResults.length,
    summary: {
      total_variants:    0,
      total_violations:  0,
      s1: 0, s2: 0, s3: 0, s4: 0,
      components_clean:  0,
      components_failed: 0,
      components_error:  0,
    },
    components: [],
  };

  for (const r of componentResults) {
    const totalViolations = r.summary.total ?? r.summary.total_violations ?? 0;
    const hasViolations   = totalViolations > 0;
    suite.summary.total_variants   += r.variants_tested?.length ?? r.summary.total_variants ?? 0;
    suite.summary.total_violations += totalViolations;
    suite.summary.s1 += r.summary.s1 ?? 0;
    suite.summary.s2 += r.summary.s2 ?? 0;
    suite.summary.s3 += r.summary.s3 ?? 0;
    suite.summary.s4 += r.summary.s4 ?? 0;
    if (r.error)            suite.summary.components_error++;
    else if (hasViolations) suite.summary.components_failed++;
    else                    suite.summary.components_clean++;

    suite.components.push({
      component:        r.component,
      variants_tested:  r.summary.total_variants,
      total_violations: (r.summary.s1 ?? 0) + (r.summary.s2 ?? 0) + (r.summary.s3 ?? 0) + (r.summary.s4 ?? 0),
      s1: r.summary.s1,
      s2: r.summary.s2,
      s3: r.summary.s3,
      s4: r.summary.s4,
      light_failed: r.layer1?.failed ?? r.light_mode?.failed ?? [],
      dark_failed:  r.layer1?.failed ?? r.dark_mode?.failed  ?? [],
      error:  r.error ?? null,
      status: r.error ? 'ERROR' : hasViolations ? 'FAIL' : 'PASS',
    });
  }

  return suite;
}

// ── CI: commit reports to qa-reports branch ───────────────────────────────

/**
 * In CI mode: stash reports onto a dedicated `qa-reports` branch, then return
 * to the original working branch. This keeps report artifacts out of feature
 * branches while still versioning them in git.
 *
 */
function commitReportsToQaBranch() {
  const QA_BRANCH  = 'qa-reports';
  const reportsDir = REPORTS_DIR;

  let originalBranch;
  try {
    originalBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (_) {
    console.warn('[qa-reports] Not inside a git repo — skipping branch commit.');
    return;
  }

  console.log(`\n[qa-reports] Committing reports (current branch: ${originalBranch})...`);

  try {
    // Create qa-reports branch if it doesn't exist; otherwise just check it out
    const branches = execSync('git branch --list', { encoding: 'utf8' });
    if (branches.split('\n').some(b => b.trim().replace(/^\* /, '') === QA_BRANCH)) {
      execSync(`git checkout ${QA_BRANCH}`, { stdio: 'pipe' });
    } else {
      execSync(`git checkout -b ${QA_BRANCH}`, { stdio: 'pipe' });
    }

    // Stage all JSON reports in the reports dir
    execSync(`git add "${reportsDir}"/*.json`, { stdio: 'pipe' });

    const date    = new Date().toISOString().slice(0, 10);
    const message = `qa-reports: suite run ${date}`;
    execSync(`git commit -m "${message}" --allow-empty`, { stdio: 'pipe' });

    // Push to remote (best-effort — CI runner may not have push rights)
    try {
      execSync(`git push origin ${QA_BRANCH} --force-with-lease`, { stdio: 'pipe' });
      console.log(`[qa-reports] Pushed to origin/${QA_BRANCH}`);
    } catch (_) {
      console.warn(`[qa-reports] Push skipped (no remote write access or offline)`);
    }

  } catch (err) {
    console.error(`[qa-reports] Branch commit failed: ${err.message}`);
  } finally {
    // Always return to original branch
    try {
      execSync(`git checkout ${originalBranch}`, { stdio: 'pipe' });
      console.log(`[qa-reports] Returned to ${originalBranch}`);
    } catch (switchErr) {
      console.error(`[qa-reports] Could not return to ${originalBranch}: ${switchErr.message}`);
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  const run_id    = `suite-${startTime}`;

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Component Suite Runner — Selify.ai');
  console.log(`  STORYBOOK_URL  : ${STORYBOOK_URL}`);
  console.log(`  STORYBOOK_MODE : ${STORYBOOK_MODE}`);
  console.log(`  CI mode        : ${CI_MODE}`);
  console.log(`  Dry run       : ${dryRun}`);
  if (componentsFlag) console.log(`  Filter        : ${[...componentsFlag].join(', ')}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Load components from Jera src/index.js
  console.log('[Discovery] Loading components from Jera src/index.js...');
  let components = loadComponents();

  if (!components.length) {
    console.error('No stable/beta components found. Check src/index.js and components.json.');
    process.exit(1);
  }

  // Step 2: Apply --components filter if provided
  if (componentsFlag) {
    components = components.filter(c => componentsFlag.has(c.component.toLowerCase()));
  }

  console.log(`\n  → Running tests on ${components.length} component(s):`);
  for (const c of components) {
    console.log(`     [${c.stage}] ${c.component} — ${c.storyUrl}`);
  }

  if (dryRun) {
    console.log('\n[Dry Run] Discovery complete — skipping tests.');
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  try {
    // Step 3: Auth — single login for the whole suite
    console.log('\n[Auth] Checking authentication...');
    await ensureAuthenticated(page);

    // Step 4: Run tests for each component
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const componentResults = [];

    for (let i = 0; i < components.length; i++) {
      const { component, storyUrl } = components[i];
      console.log(`\n[${i + 1}/${components.length}] Testing: ${component}`);

      try {
        const result = await testComponent(page, context, component, storyUrl, run_id);
        componentResults.push(result);

        const reportPath = path.join(REPORTS_DIR, `${component}-test-results.json`);
        fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf8');
        console.log(`  → Saved: ${reportPath}`);
      } catch (err) {
        console.error(`  → ERROR testing ${component}: ${err.message}`);
        componentResults.push({
          component,
          url: storyUrl,
          error: err.message,
          variants_tested: [],
          light_mode: { passed: [], failed: [] },
          dark_mode:  { passed: [], failed: [] },
          violations: [],
          summary: { total_variants: 0, total_violations: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
        });
      }
    }

    // Step 5: Build and save suite report
    const suite          = buildSuiteReport(componentResults, startTime);
    const suiteReportPath = path.join(REPORTS_DIR, 'suite-test-results.json');
    fs.writeFileSync(suiteReportPath, JSON.stringify(suite, null, 2), 'utf8');

    // Step 6: Print summary
    const durationSec = (suite.duration_ms / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  SUITE COMPLETE');
    console.log(`  Duration        : ${durationSec}s`);
    console.log(`  Components      : ${suite.components_tested}`);
    console.log(`  Variants tested : ${suite.summary.total_variants}`);
    console.log(`  Total violations: ${suite.summary.total_violations}`);
    console.log(`  S1: ${suite.summary.s1}  S2: ${suite.summary.s2}  S3: ${suite.summary.s3}  S4: ${suite.summary.s4}`);
    console.log(`  Clean: ${suite.summary.components_clean}  Failed: ${suite.summary.components_failed}  Error: ${suite.summary.components_error}`);
    console.log('');

    if (suite.summary.components_failed > 0) {
      console.log('  Failed components:');
      for (const c of suite.components.filter(c => c.status === 'FAIL')) {
        console.log(`    ✗ ${c.component} — ${c.total_violations} violation(s) (S1:${c.s1} S2:${c.s2} S3:${c.s3} S4:${c.s4})`);
      }
      console.log('');
    }

    console.log(`  Suite report: ${suiteReportPath}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Step 7: Auto-generate .spec.ts files for failed components
    if (!noSpecs && suite.summary.components_failed > 0) {
      try {
        const { generateSpecs } = require('./spec-generator');
        generateSpecs(suiteReportPath);
      } catch (err) {
        console.warn(`[spec-generator] Could not generate specs: ${err.message}`);
      }
    }

    // Step 8: CI — commit reports to qa-reports branch, then return to original branch
    if (CI_MODE) {
      commitReportsToQaBranch();
    }

    // Exit with non-zero if any S1/S2 violations found
    if (suite.summary.s1 > 0 || suite.summary.s2 > 0) {
      console.error('S1/S2 violations found — review immediately.');
      process.exit(1);
    }

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('FATAL ERROR:', err.message);
  process.exit(1);
});
