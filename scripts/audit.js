/**
 * @miozu/jera component library audit
 *
 * Validates components.json against the filesystem, admin docs,
 * and llms.txt. Zero dependencies — uses only node:fs, node:path, node:url.
 *
 * Usage:
 *   node scripts/audit.js            # human-readable summary
 *   node scripts/audit.js --json     # machine-readable JSON
 *   node scripts/audit.js --verbose  # full details per check
 *   node scripts/audit.js --fix      # auto-regenerate llms.txt component sections
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const JERA_ROOT = resolve(__dirname, '..');
const COMPONENTS_JSON = resolve(JERA_ROOT, 'components.json');
const LLMS_TXT = resolve(JERA_ROOT, 'llms.txt');
const ADMIN_DOCS_DIR = resolve(
  JERA_ROOT,
  '..',
  'admin.selify.ai',
  'src',
  'routes',
  '(docs)',
  'docs',
  'components',
);

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const FLAG_JSON = args.includes('--json');
const FLAG_VERBOSE = args.includes('--verbose');
const FLAG_FIX = args.includes('--fix');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_STAGES = ['draft', 'beta', 'stable', 'deprecated'];
const VALID_DOC_LEVELS = ['none', 'minimal', 'standard', 'complete'];
const REQUIRED_FIELDS = [
  'name',
  'category',
  'path',
  'stage',
  'revision',
  'lastReviewed',
  'docLevel',
  'breaking',
];
const STALENESS_DAYS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert PascalCase component name to kebab-case slug. */
function toSlug(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Number of calendar days between two ISO date strings. */
function daysBetween(dateStr, now) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

/** Detect the actual docLevel from a docs page file content. */
function detectDocLevel(content) {
  const hasPlayground = content.includes('ComponentPlayground');
  const hasVariantGrid = content.includes('variant-grid');
  const hasExampleCard = content.includes('example-card');
  const hasSectionDesc = content.includes('section-description');

  if (hasPlayground && hasVariantGrid && hasExampleCard && hasSectionDesc) {
    return 'complete';
  }
  if (hasPlayground && hasVariantGrid && hasExampleCard) {
    return 'standard';
  }
  if (hasPlayground) {
    return 'minimal';
  }
  return 'none';
}

/** Collect all .svelte files under src/components/ recursively. */
function collectSvelteFiles(dir, base) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSvelteFiles(full, base));
    } else if (entry.isFile() && entry.name.endsWith('.svelte')) {
      results.push(relative(base, full));
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------

const manifest = JSON.parse(readFileSync(COMPONENTS_JSON, 'utf-8'));
const components = manifest.components;
const llmsTxtContent = existsSync(LLMS_TXT) ? readFileSync(LLMS_TXT, 'utf-8') : '';
const now = new Date();

// Map component paths from manifest (normalised to forward slashes)
const manifestPaths = new Set(components.map((c) => c.path.replace(/\\/g, '/')));

// All .svelte files on disk under src/components/
const diskFiles = collectSvelteFiles(
  resolve(JERA_ROOT, 'src', 'components'),
  JERA_ROOT,
).map((p) => p.replace(/\\/g, '/'));
// Filter out non-component files (index.js etc are already excluded by .svelte filter)
const diskSvelteSet = new Set(diskFiles);

// Admin docs slugs on disk
const adminDocSlugs = new Set();
if (existsSync(ADMIN_DOCS_DIR)) {
  for (const entry of readdirSync(ADMIN_DOCS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const pagePath = resolve(ADMIN_DOCS_DIR, entry.name, '+page.svelte');
      if (existsSync(pagePath)) {
        adminDocSlugs.add(entry.name);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Schema validation
// ---------------------------------------------------------------------------

const schemaErrors = [];

for (const comp of components) {
  const prefix = `[${comp.name || 'UNNAMED'}]`;

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (comp[field] === undefined || comp[field] === null) {
      schemaErrors.push(`${prefix} missing required field: ${field}`);
    }
  }

  // Stage enum
  if (comp.stage && !VALID_STAGES.includes(comp.stage)) {
    schemaErrors.push(`${prefix} invalid stage: "${comp.stage}"`);
  }

  // DocLevel enum
  if (comp.docLevel && !VALID_DOC_LEVELS.includes(comp.docLevel)) {
    schemaErrors.push(`${prefix} invalid docLevel: "${comp.docLevel}"`);
  }

  // Breaking must be array
  if (comp.breaking !== undefined && !Array.isArray(comp.breaking)) {
    schemaErrors.push(`${prefix} breaking must be an array`);
  }

  // Revision must be integer
  if (comp.revision !== undefined && (!Number.isInteger(comp.revision) || comp.revision < 0)) {
    schemaErrors.push(`${prefix} revision must be a non-negative integer`);
  }

  // File existence
  if (comp.path) {
    const absPath = resolve(JERA_ROOT, comp.path);
    if (!existsSync(absPath)) {
      schemaErrors.push(`${prefix} file not found: ${comp.path}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Drift detection
// ---------------------------------------------------------------------------

const driftOrphanFiles = []; // on disk but not in manifest
const driftMissingFiles = []; // in manifest but not on disk

for (const file of diskFiles) {
  if (!manifestPaths.has(file)) {
    driftOrphanFiles.push(file);
  }
}

for (const comp of components) {
  const normPath = comp.path?.replace(/\\/g, '/');
  if (normPath && !diskSvelteSet.has(normPath)) {
    driftMissingFiles.push({ name: comp.name, path: normPath });
  }
}

// ---------------------------------------------------------------------------
// 3. Docs coverage
// ---------------------------------------------------------------------------

const docsPresent = [];
const docsMissing = [];

for (const comp of components) {
  if (comp.stage === 'deprecated') continue;
  const slug = toSlug(comp.name);
  if (adminDocSlugs.has(slug)) {
    docsPresent.push({ name: comp.name, slug });
  } else {
    docsMissing.push({ name: comp.name, slug });
  }
}

// ---------------------------------------------------------------------------
// 4. llms.txt sync
// ---------------------------------------------------------------------------

const llmsMissing = [];

for (const comp of components) {
  if (comp.stage === 'deprecated') continue;
  if (!llmsTxtContent.includes(comp.name)) {
    llmsMissing.push(comp.name);
  }
}

// ---------------------------------------------------------------------------
// 5. Staleness
// ---------------------------------------------------------------------------

const staleComponents = [];

for (const comp of components) {
  if (!comp.lastReviewed) continue;
  const age = daysBetween(comp.lastReviewed, now);
  if (age > STALENESS_DAYS) {
    staleComponents.push({ name: comp.name, lastReviewed: comp.lastReviewed, daysAgo: age });
  }
}

// ---------------------------------------------------------------------------
// 6. docLevel drift
// ---------------------------------------------------------------------------

const docLevelDrifts = [];

for (const comp of components) {
  if (comp.stage === 'deprecated') continue;
  const slug = toSlug(comp.name);
  const pagePath = resolve(ADMIN_DOCS_DIR, slug, '+page.svelte');
  if (!existsSync(pagePath)) continue;

  const content = readFileSync(pagePath, 'utf-8');
  const actual = detectDocLevel(content);
  const declared = comp.docLevel;

  if (actual !== declared) {
    docLevelDrifts.push({
      name: comp.name,
      slug,
      declared,
      actual,
    });
  }
}

// ---------------------------------------------------------------------------
// --fix: regenerate llms.txt component sections
// ---------------------------------------------------------------------------

if (FLAG_FIX) {
  const stableComps = components.filter((c) => c.stage === 'stable');
  const betaComps = components.filter((c) => c.stage === 'beta');
  const deprecatedComps = components.filter((c) => c.stage === 'deprecated');

  // Group by category
  function groupByCategory(list) {
    const groups = {};
    for (const c of list) {
      const cat = c.category || 'uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    }
    return groups;
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function formatComponent(c) {
    const desc = c.description || 'No description';
    return `- [${c.name}](./${c.path}): ${desc}`;
  }

  function renderCategoryBlock(groups, suffix) {
    const lines = [];
    const categoryOrder = [
      'primitives',
      'forms',
      'feedback',
      'overlays',
      'navigation',
      'layout',
      'docs',
    ];
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const ai = categoryOrder.indexOf(a);
      const bi = categoryOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    for (const cat of sortedCategories) {
      const comps = groups[cat].sort((a, b) => a.name.localeCompare(b.name));
      lines.push(`### ${capitalize(cat)}${suffix ? ` ${suffix}` : ''}`);
      for (const c of comps) {
        lines.push(formatComponent(c));
      }
      lines.push('');
    }
    return lines;
  }

  // Parse existing llms.txt to preserve non-component sections
  const existingLines = llmsTxtContent.split('\n');

  // Find section boundaries
  const sectionMarkers = [
    { header: '## Active Components', data: stableComps },
    { header: '## Ready Components', data: betaComps },
    { header: '## Legacy Components', data: deprecatedComps },
  ];

  // Identify the range of lines that belong to component sections
  let firstSectionStart = -1;
  let lastSectionEnd = -1;

  for (const marker of sectionMarkers) {
    const idx = existingLines.findIndex((line) => line.trim() === marker.header);
    if (idx !== -1) {
      if (firstSectionStart === -1 || idx < firstSectionStart) {
        firstSectionStart = idx;
      }
      // Find end: next ## heading or end of file
      let endIdx = idx + 1;
      while (endIdx < existingLines.length) {
        if (
          existingLines[endIdx].startsWith('## ') &&
          !sectionMarkers.some((m) => existingLines[endIdx].trim() === m.header)
        ) {
          break;
        }
        endIdx++;
      }
      if (endIdx > lastSectionEnd) {
        lastSectionEnd = endIdx;
      }
    }
  }

  // Build replacement component sections
  const newSections = [];

  // Active Components (stable)
  if (stableComps.length > 0) {
    newSections.push('## Active Components');
    newSections.push('');
    newSections.push(
      'Used in production across dash.selify.ai, admin.selify.ai, and miozu.com.',
    );
    newSections.push('');
    const groups = groupByCategory(stableComps);
    newSections.push(...renderCategoryBlock(groups, ''));
  }

  // Ready Components (beta)
  if (betaComps.length > 0) {
    newSections.push('## Ready Components');
    newSections.push('');
    newSections.push(
      'Built and tested but not yet used in production. Available for immediate adoption.',
    );
    newSections.push('');
    const groups = groupByCategory(betaComps);
    newSections.push(...renderCategoryBlock(groups, '(Ready)'));
  }

  // Legacy Components (deprecated)
  if (deprecatedComps.length > 0) {
    newSections.push('## Legacy Components');
    newSections.push('');
    newSections.push(
      'Previous implementations replaced by newer versions. Kept for backward compatibility.',
    );
    newSections.push('');

    // Group deprecated by replacement pattern
    const navLegacy = deprecatedComps.filter((c) => c.category === 'navigation');
    if (navLegacy.length > 0) {
      const leftBarReplacements = navLegacy.filter((c) => c.replacedBy);
      const unused = navLegacy.filter((c) => !c.replacedBy);

      if (leftBarReplacements.length > 0) {
        newSections.push('### Navigation (Legacy -- replaced by LeftBar)');
        newSections.push(
          `- ${leftBarReplacements.map((c) => c.name).join(', ')}`,
        );
        newSections.push('');
      }
      if (unused.length > 0) {
        newSections.push('### Navigation (Legacy)');
        newSections.push(`- ${unused.map((c) => c.name).join(', ')}`);
        newSections.push('');
      }
    }

    const otherDeprecated = deprecatedComps.filter((c) => c.category !== 'navigation');
    if (otherDeprecated.length > 0) {
      const groups = groupByCategory(otherDeprecated);
      newSections.push(...renderCategoryBlock(groups, '(Legacy)'));
    }
  }

  // Splice into existing file
  if (firstSectionStart !== -1 && lastSectionEnd !== -1) {
    const before = existingLines.slice(0, firstSectionStart);
    const after = existingLines.slice(lastSectionEnd);
    const result = [...before, ...newSections, ...after].join('\n');
    writeFileSync(LLMS_TXT, result, 'utf-8');
  } else {
    // No existing sections found -- append
    const result = llmsTxtContent.trimEnd() + '\n\n' + newSections.join('\n') + '\n';
    writeFileSync(LLMS_TXT, result, 'utf-8');
  }

  if (!FLAG_JSON) {
    console.log('Fixed: llms.txt component sections regenerated from components.json');
  }
}

// ---------------------------------------------------------------------------
// Aggregate results
// ---------------------------------------------------------------------------

const hasSchemaErrors = schemaErrors.length > 0;
const hasDrift = driftOrphanFiles.length > 0 || driftMissingFiles.length > 0;
const hasFailures = hasSchemaErrors || hasDrift;

const report = {
  timestamp: now.toISOString(),
  totalComponents: components.length,
  byStage: {
    stable: components.filter((c) => c.stage === 'stable').length,
    beta: components.filter((c) => c.stage === 'beta').length,
    draft: components.filter((c) => c.stage === 'draft').length,
    deprecated: components.filter((c) => c.stage === 'deprecated').length,
  },
  schema: {
    pass: !hasSchemaErrors,
    errors: schemaErrors,
  },
  drift: {
    pass: !hasDrift,
    orphanFiles: driftOrphanFiles,
    missingFiles: driftMissingFiles,
  },
  docsCoverage: {
    withDocs: docsPresent.length,
    withoutDocs: docsMissing.length,
    missing: docsMissing,
  },
  llmsSync: {
    missing: llmsMissing,
  },
  staleness: {
    stale: staleComponents,
  },
  docLevelDrift: {
    drifts: docLevelDrifts,
  },
  exitCode: hasFailures ? 1 : 0,
};

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (FLAG_JSON) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.exitCode);
}

// Human-readable output
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';

function icon(pass) {
  return pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
}

function warn(label) {
  return `${YELLOW}WARN${RESET}`;
}

console.log('');
console.log(`${BOLD}@miozu/jera audit${RESET}`);
console.log(`${DIM}${now.toISOString()}${RESET}`);
console.log('');

// Summary bar
const { stable, beta, draft, deprecated } = report.byStage;
console.log(
  `${BOLD}Components:${RESET} ${components.length} total | ` +
    `${GREEN}${stable} stable${RESET} | ${CYAN}${beta} beta${RESET} | ` +
    `${YELLOW}${draft} draft${RESET} | ${DIM}${deprecated} deprecated${RESET}`,
);
console.log('');

// 1. Schema
console.log(`${BOLD}1. Schema validation${RESET}  ${icon(report.schema.pass)}`);
if (schemaErrors.length > 0) {
  for (const err of schemaErrors) {
    console.log(`   ${RED}- ${err}${RESET}`);
  }
} else {
  console.log(`   ${DIM}All ${components.length} components pass schema checks${RESET}`);
}
console.log('');

// 2. Drift
console.log(`${BOLD}2. Drift detection${RESET}  ${icon(report.drift.pass)}`);
if (driftOrphanFiles.length > 0) {
  console.log(`   ${YELLOW}Orphan files (on disk, not in manifest):${RESET}`);
  for (const f of driftOrphanFiles) {
    console.log(`   ${YELLOW}- ${f}${RESET}`);
  }
}
if (driftMissingFiles.length > 0) {
  console.log(`   ${RED}Missing files (in manifest, not on disk):${RESET}`);
  for (const { name, path } of driftMissingFiles) {
    console.log(`   ${RED}- ${name} -> ${path}${RESET}`);
  }
}
if (report.drift.pass) {
  console.log(`   ${DIM}Manifest and filesystem in sync${RESET}`);
}
console.log('');

// 3. Docs coverage
const nonDeprecated = components.filter((c) => c.stage !== 'deprecated').length;
const coveragePct =
  nonDeprecated > 0 ? Math.round((docsPresent.length / nonDeprecated) * 100) : 0;
console.log(
  `${BOLD}3. Docs coverage${RESET}  ${docsPresent.length}/${nonDeprecated} (${coveragePct}%)`,
);
if (docsMissing.length > 0 && FLAG_VERBOSE) {
  console.log(`   ${YELLOW}Missing docs pages:${RESET}`);
  for (const { name, slug } of docsMissing) {
    console.log(`   ${YELLOW}- ${name} (expected slug: ${slug})${RESET}`);
  }
} else if (docsMissing.length > 0) {
  console.log(
    `   ${DIM}${docsMissing.length} components without docs (use --verbose to list)${RESET}`,
  );
}
console.log('');

// 4. llms.txt sync
const llmsSyncPass = llmsMissing.length === 0;
console.log(
  `${BOLD}4. llms.txt sync${RESET}  ${llmsSyncPass ? icon(true) : warn()}  ${llmsMissing.length} missing`,
);
if (llmsMissing.length > 0 && FLAG_VERBOSE) {
  for (const name of llmsMissing) {
    console.log(`   ${YELLOW}- ${name}${RESET}`);
  }
} else if (llmsMissing.length > 0 && !FLAG_VERBOSE) {
  console.log(
    `   ${DIM}Run with --verbose to list, or --fix to auto-regenerate${RESET}`,
  );
}
console.log('');

// 5. Staleness
const stalenessPass = staleComponents.length === 0;
console.log(
  `${BOLD}5. Staleness (>${STALENESS_DAYS}d)${RESET}  ${stalenessPass ? icon(true) : warn()}  ${staleComponents.length} stale`,
);
if (staleComponents.length > 0 && FLAG_VERBOSE) {
  for (const { name, lastReviewed, daysAgo } of staleComponents) {
    console.log(`   ${YELLOW}- ${name}: ${lastReviewed} (${daysAgo}d ago)${RESET}`);
  }
} else if (staleComponents.length > 0) {
  console.log(`   ${DIM}Use --verbose to list stale components${RESET}`);
}
console.log('');

// 6. docLevel drift
const docDriftPass = docLevelDrifts.length === 0;
console.log(
  `${BOLD}6. docLevel drift${RESET}  ${docDriftPass ? icon(true) : warn()}  ${docLevelDrifts.length} mismatches`,
);
if (docLevelDrifts.length > 0) {
  for (const { name, declared, actual } of docLevelDrifts) {
    console.log(
      `   ${YELLOW}- ${name}: declared "${declared}", actual "${actual}"${RESET}`,
    );
  }
}
console.log('');

// Final verdict
if (hasFailures) {
  console.log(`${RED}${BOLD}Audit failed${RESET} -- schema or drift errors detected`);
} else {
  console.log(`${GREEN}${BOLD}Audit passed${RESET}`);
}
console.log('');

process.exit(report.exitCode);
