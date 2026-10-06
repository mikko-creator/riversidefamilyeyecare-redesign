#!/usr/bin/env node
// ledger-decide.mjs - one change-control decision per ledger row for the Riverside Family Eye Care
// redesign ("Riverlight"), naming the Riverlight component that renders it exactly as docs/COMPONENTS.md
// names it (its section headings, e.g. "B.22 Long-form prose"), plus the rows the source crawl cannot
// produce: one row per declared removal group of audit/clone-removals.json, one ADD row per
// generated-imagery kind (src/content/image-plan.json roles, docs/IMAGE-PLAN.md), one ADD row for
// dist/404.html, and the design-level rows (DESIGN-SPEC grafts and declared departures).
// Adapted from the reference workspace's ledger tool (named in docs/PORT-NOTES.md; same mechanism, Riverside evidence).
//
// Mechanism (unchanged from the reference):
//   - decision / narrative slot / why / rebuiltAs go through the skill's own CLI `sr-plan --set`;
//   - presets go through `sr-match --answer`, which validates every id against audit/preset-index.json;
//   - the matcher's own verdict (audit/preset-match.json as sr-match wrote it) is kept as
//     audit/preset-match.matcher-verdict.json before the first answer;
//   - the rule that decided each row is written to audit/ledger-rules.json.
//
// Evidence, all read-only: audit/change-control.json (the rows), audit/build-pages.json (family, layout,
// aside per page), tmp/page-models/*.json (what the build renders, section by section: `node src/build.mjs
// --dump-models`; checked against build-pages before use), audit/preset-index.json, audit/preset-match.json,
// audit/clone-removals.json, audit/seo-repairs.json, audit/generated-images.json, audit/generated-media.json,
// src/content/image-plan.json, src/content/chrome.json, docs/COMPONENTS.md (component names, B.16, B.24),
// docs/DESIGN-SPEC.md (3.16 home order, Q-8), docs/IMAGE-PLAN.md (section 4 arch counts), project.json.
//
// How a crawled row is understood (sr-plan made the rows from each page's h2/h3 headings, or from its
// <section>/<article> marks): every row label is aligned, in source order, to an h2/h3 heading event of
// the page model (section headings, callout titles, headings inside block html, item and member titles).
// A row's span runs from its heading to the next row's heading (the first row also owns everything above
// its heading); the blocks in that span decide the components it lists. A page with ONE row is that row
// (the row stands for the whole page). The last row of a page with the standard aside whose label is the
// aside's location title and that matches no heading in main is the sidebar (the location widget's h2).
//
// Usage:
//   node tools/ledger-decide.mjs --dry [--out <file under tmp/>]   plan + validate; writes ONLY the --out
//                                                                    file (default tmp/wf7a/author/dry-run.json)
//   node tools/ledger-decide.mjs [--presets-only]                   apply: inserts the added rows, writes
//                                                                    audit/ledger-rules.json, sets every row
//                                                                    via sr-plan --set, answers every preset
//                                                                    via sr-match --answer, runs sr-plan --check
// Both modes exit 1 BEFORE any write when a row is uncovered or unaligned, a component or preset id is
// unknown, a REMOVE/REPLACE row has no why, a required narrative slot has no crawled row, a social-proof
// row has no review evidence, an objection-handling row has no FAQ evidence, a removal group or an image
// role is unmapped, or an argument would be misread by the skill's argv parser.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(os.homedir(), '.claude', 'skills', 'site-reforge', 'scripts');
const ARGS = process.argv.slice(2);
const DRY = ARGS.includes('--dry');
const PRESETS_ONLY = ARGS.includes('--presets-only');
const OUT_ARG = (() => { const i = ARGS.indexOf('--out'); return i >= 0 ? ARGS[i + 1] : null; })();
const DRY_OUT = path.resolve(ROOT, OUT_ARG || 'tmp/wf7a/author/dry-run.json');   // the wf7a stage's location
const KNOWN_FLAGS = new Set(['--dry', '--presets-only', '--out']);
for (const [i, a] of ARGS.entries()) {
  if (a.startsWith('--')) { if (!KNOWN_FLAGS.has(a)) fatal('unknown flag ' + a); }
  else if (ARGS[i - 1] !== '--out') fatal('unexpected argument ' + a);
}
if (OUT_ARG !== null && (!OUT_ARG || OUT_ARG.startsWith('--'))) fatal('--out needs a file path');
if (DRY && !DRY_OUT.startsWith(path.join(ROOT, 'tmp') + path.sep)) fatal('--out must be a file under ' + path.join(ROOT, 'tmp'));
if (!DRY && OUT_ARG) fatal('--out is a --dry option');

/* ---------------------------------------------------------------- utilities */
function fatal(msg) { process.stderr.write('ledger-decide: FATAL ' + msg + '\n'); process.exit(1); }
const problems = [];
const problem = (kind, detail) => problems.push({ kind, detail });
const abs = (f) => path.join(ROOT, f);
const readText = (f) => { try { return fs.readFileSync(abs(f), 'utf8'); } catch (e) { return fatal('cannot read ' + f + ': ' + e.message); } };
const J = (f) => { const t = readText(f); try { return JSON.parse(t); } catch (e) { return fatal(f + ' is not JSON: ' + e.message); } };
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(abs(f))).digest('hex');
const uniq = (a) => [...new Set(a)];
const tally = (arr, key) => arr.reduce((m, x) => { const k = key(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const pathOf = (u) => { const p = new URL(u).pathname; return p.endsWith('/') ? p : p + '/'; };
// named HTML entities the models use, as code points (ASCII source: no literal curly quotes or NBSP in this file);
// &nbsp; becomes a plain space, &shy; &zwj; &zwnj; become nothing
const NAMED = Object.fromEntries(Object.entries({
  amp: 0x26, lt: 0x3c, gt: 0x3e, quot: 0x22, apos: 0x27, nbsp: 0x20, rsquo: 0x2019, lsquo: 0x2018, rdquo: 0x201d, ldquo: 0x201c,
  sbquo: 0x201a, bdquo: 0x201e, ndash: 0x2013, mdash: 0x2014, hellip: 0x2026, reg: 0xae, trade: 0x2122, copy: 0xa9,
  deg: 0xb0, middot: 0xb7, bull: 0x2022, laquo: 0xab, raquo: 0xbb, times: 0xd7, eacute: 0xe9, egrave: 0xe8,
  aacute: 0xe1, agrave: 0xe0, iacute: 0xed, oacute: 0xf3, uacute: 0xfa, ntilde: 0xf1, ccedil: 0xe7,
  uuml: 0xfc, ouml: 0xf6, auml: 0xe4, frac12: 0xbd, frac14: 0xbc, frac34: 0xbe, shy: null, zwj: null, zwnj: null,
}).map(([k, cp]) => [k, cp === null ? '' : String.fromCodePoint(cp)]));
const decode = (s) => String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
  if (e[0] === '#') { const n = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : Number(e.slice(1)); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return Object.prototype.hasOwnProperty.call(NAMED, e) ? NAMED[e] : m;
});
/** Visible text of an HTML fragment: tags to spaces, entities decoded, whitespace collapsed (the JS whitespace class covers U+00A0, so &nbsp; needs no step of its own). */
const norm = (s) => decode(String(s ?? '').replace(/<[^>]*>/g, ' ')).normalize('NFC').replace(/\s+/g, ' ').trim();
const htmlHeads = (html) => [...String(html || '').matchAll(/<(h[23])\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)].map((m) => norm(m[2]));
const opensWithHeading = (html) => /^\s*(?:<!--[\s\S]*?-->\s*)*<h[23]\b/i.test(String(html || ''));
const isH23 = (lvl) => /^h[23]$/.test(String(lvl || ''));
/** A page-relative model href resolved to a site path ("contact-us/index.html" -> "/contact-us/"). */
const hrefPath = (href, pagePath) => {
  if (!href) return null;
  try { const u = new URL(href, 'https://model.invalid' + pagePath); return u.hostname === 'model.invalid' ? u.pathname.replace(/index\.html$/, '') : null; } catch { return null; }
};

/* ---------------------------------------------------------------- evidence */
const INPUTS = [
  'project.json', 'audit/change-control.json', 'audit/build-pages.json', 'audit/preset-index.json', 'audit/preset-match.json',
  'audit/clone-removals.json', 'audit/seo-repairs.json', 'audit/generated-images.json', 'audit/generated-media.json',
  'src/content/image-plan.json', 'src/content/chrome.json', 'docs/COMPONENTS.md', 'docs/DESIGN-SPEC.md', 'docs/IMAGE-PLAN.md',
  'docs/SITE-ARCHITECTURE.md', 'docs/BUILD-NOTES.md',
];
const inputHashes = Object.fromEntries(INPUTS.map((f) => [f, fs.existsSync(abs(f)) ? sha256(f) : fatal('missing input ' + f)]));
const project = J('project.json');
const ORIGIN = String(project.origin || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(ORIGIN)) fatal('project.json has no origin');
const HOST = new URL(ORIGIN).host;
const ledger0 = J('audit/change-control.json');
const buildPages = new Map(J('audit/build-pages.json').pages.map((p) => [p.path, p]));
const presetIndex = J('audit/preset-index.json');
const KNOWN_PRESETS = new Set((presetIndex.libraries || []).flatMap((l) => (l.presets || []).map((p) => p.id)));
// the matcher's own verdict: the kept copy once an apply has answered rows, else preset-match.json as sr-match wrote it
const MATCHER_FILE = fs.existsSync(abs('audit/preset-match.matcher-verdict.json')) ? 'audit/preset-match.matcher-verdict.json' : 'audit/preset-match.json';
const matcher = J(MATCHER_FILE);
const matcherByRow = new Map((matcher.rows || []).map((r) => [r.rowId, r]));
const removals = J('audit/clone-removals.json');
const seoRepairs = J('audit/seo-repairs.json');
const generatedImages = J('audit/generated-images.json');
const generatedMedia = J('audit/generated-media.json');
const imagePlan = J('src/content/image-plan.json');
const chrome = J('src/content/chrome.json');
const COMPONENTS_MD = readText('docs/COMPONENTS.md');
const DESIGN_SPEC_MD = readText('docs/DESIGN-SPEC.md');
const IMAGE_PLAN_MD = readText('docs/IMAGE-PLAN.md');
const sectionOf = (md, headingStart) => {   // the text of one "### x" section, up to the next ### or ##
  const i = md.indexOf('\n' + headingStart);
  if (i < 0) return null;
  const rest = md.slice(i + 1);
  const end = rest.slice(4).search(/\n#{2,3} /);
  return end < 0 ? rest : rest.slice(0, end + 4);
};

// page models: what the build renders (tmp/page-models/<slug>.json), checked against audit/build-pages.json
const MODEL_DIR = abs('tmp/page-models');
if (!fs.existsSync(MODEL_DIR)) fatal('tmp/page-models/ is missing: run node src/build.mjs --dump-models');
const models = new Map();
let model404 = null;
for (const f of fs.readdirSync(MODEL_DIR).filter((x) => x.endsWith('.json')).sort()) {
  const m = J('tmp/page-models/' + f);
  if (m.as404) { model404 = m; continue; }
  if (models.has(m.path)) fatal('two page models for ' + m.path);
  models.set(m.path, m);
}
for (const [p, bpg] of buildPages) {
  const m = models.get(p);
  if (!m) { fatal('no page model for ' + p + ' (stale tmp/page-models: re-run node src/build.mjs --dump-models)'); }
  if (m.family !== bpg.family || norm(m.h1 && m.h1.text) !== norm(bpg.h1)) fatal('page model of ' + p + ' disagrees with audit/build-pages.json (family or h1): stale models');
}
if (models.size !== buildPages.size) fatal('page models (' + models.size + ') and build pages (' + buildPages.size + ') differ in count');

/* ---------------------------------------------------------------- components (docs/COMPONENTS.md headings) */
function stripTrailingParen(s) {
  s = s.trim();
  if (!s.endsWith(')')) return s;
  let depth = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ')') depth++;
    else if (s[i] === '(' && --depth === 0) return s.slice(0, i).trim();
  }
  return s;
}
const COMP = new Map();
for (const m of COMPONENTS_MD.matchAll(/^###\s+((?:\d+|[A-Z])\.(?:\d+|[A-Z]))\s+(.+?)\s*$/gm)) if (!COMP.has(m[1])) COMP.set(m[1], stripTrailingParen(m[2]));
/** "B.22" -> "B.22 Long-form prose", exactly as the COMPONENTS.md heading names it; unknown -> problem. */
function compName(id) {
  if (!COMP.has(id)) { problem('unknown-component', id); return '?' + id; }
  const s = id + ' ' + COMP.get(id);
  if (!COMPONENTS_MD.includes('### ' + s)) problem('component-name-not-verbatim', s);
  return s;
}

/* ---------------------------------------------------------------- presets: the closest one per component */
const BUTTONS = '00-top12-9-2-way-invert-accent-flip-buttons-fill-ghost';
const COMPONENT_PRESET = {
  'A.1': ['10-sections-13-ground-skeleton', 'document head: the index has no head or metadata preset; the page-skeleton entry is the nearest shell-level one'],
  'A.3': ['00-top12-12-ambient-depth-behind-the-hero-glow-blobs-duotone-wash', 'decorative depth layers behind the surfaces'],
  '0.7': ['12-iconography-1-sgen-living-styleguide-12-iconography-lucide-style-24-24-currentcolor-1-8-1', 'one inline SVG icon sprite'],
  '0.9': ['09-accessibility-d-aria-7-aria-patterns-the-first-rule-of-aria', 'non-visible ARIA strings'],
  '1.8': ['00-top12-12-ambient-depth-behind-the-hero-glow-blobs-duotone-wash', 'the river: ambient depth drawn under and over the surfaces'],
  'B.0': [BUTTONS, 'buttons'],
  'B.1': ['10-sections-1-headers-navs', 'the slim utility bar of the header'],
  'B.2': ['navbar', 'site header: logo, nav, CTA'],
  'B.4': ['hero-section', 'hero: statement, single CTA'],
  'B.5': ['04-signatures-tokens-16-frosted-panel', 'glass card'],
  'B.6': ['card-grid', '4-up card grid'],
  'B.7': ['01-transitions-hero-motion-6-straddles-the-horizon', 'a card straddling a band edge'],
  'B.9': ['11-theming-2-cards-float-on-surface', 'paper cards on the surface'],
  'B.10': ['feature-split', 'portrait and text pane side by side'],
  'B.11': ['10-sections-4-features-services', 'three-up services row'],
  'B.12': ['gallery-row', 'gallery tiles'],
  'B.13': ['feature-split', 'text card and image side by side'],
  'B.14': ['feature-split', 'photo and text side by side'],
  'B.15': ['10-sections-5-proof', 'proof block with a swipe carousel'],
  'B.17': ['cta-banner', 'closing band: heading and CTA'],
  'B.18': ['10-sections-9-content-blog', 'post-card grid'],
  'B.19': ['footer', 'footer'],
  'B.21': ['01-transitions-hero-motion-6-straddles-the-horizon', 'title pane with the arch straddling the band edge'],
  'B.22': ['06-responsive-4-the-band-bleeds-the-words-don-t', 'capped reading column (the measure)'],
  'B.23': ['08-scroll-sticky-d-pin-7-pin-release-sticky-sidebar-within-a-section-css-position-sticky', 'sticky sidebar'],
  'B.24': ['cta-banner', 'closing CTA band'],
  'B.25': ['contact-form-1', 'form section'],
  'B.26': ['accordion-faq', 'FAQ accordion'],
  'B.27': ['10-sections-8-team-gallery', 'team card grid'],
  'B.28': ['10-sections-9-content-blog', 'post cards and editorial index'],
  'B.29': ['06-responsive-4-the-band-bleeds-the-words-don-t', 'capped reading column (66ch)'],
  'B.30': ['13-utility-pages-1-sgen-living-styleguide-13-utility-system-pages-404-500-no-results-maintenance-loading-1', 'utility / 404 page'],
  'B.31': ['card-grid', 'generic blocks; a B.31 row takes its block preset (BLOCK_PRESET)'],
  'C.7': ['00-top12-11-section-rhythm-large-vertical-padding-alternating-grounds', 'full-width bands in source order'],
  'D.6': ['11-theming-2-cards-float-on-surface', 'treatment cards and tint panels on the surface'],
  'E.1': ['contact-form-1', 'form card'],
  'F.2': ['card-grid', 'link and image cards'],
  'F.4': ['10-sections-9-content-blog', 'editorial index'],
  'F.5': ['10-sections-10-footers', 'multi-column link lists'],
  'F.6': ['testimonial-grid', 'testimonials'],
  'F.7': ['card-grid', 'product and device cards'],
  'F.8': ['feature-split', 'map and details side by side'],
};
const BLOCK_PRESET = { logos: 'gallery-row', badges: BUTTONS, cta: BUTTONS, cherry: BUTTONS, docs: 'card-grid' };
for (const [k, [v]] of Object.entries(COMPONENT_PRESET)) if (!KNOWN_PRESETS.has(v)) problem('unknown-preset', k + ' -> ' + v);
for (const [k, v] of Object.entries(BLOCK_PRESET)) if (!KNOWN_PRESETS.has(v)) problem('unknown-preset', 'block ' + k + ' -> ' + v);
function presetFor(comps, primaryBlock, override) {
  if (override) return override;
  const first = comps[0];
  if (first === 'B.31') return BLOCK_PRESET[primaryBlock] || COMPONENT_PRESET['B.31'][0];
  return COMPONENT_PRESET[first] ? COMPONENT_PRESET[first][0] : (problem('no-preset-for-component', first), '');
}

/* ---------------------------------------------------------------- the home order: DESIGN-SPEC 3.16 vs COMPONENTS B.16 */
function parseHomeTable(md, heading, colComp, compRe) {
  const sec = sectionOf(md, heading);
  if (!sec) { problem('home-table-missing', heading); return new Map(); }
  const map = new Map();
  for (const line of sec.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || !/^s\d+(\s*\+\s*s\d+)*$/.test(cells[1])) continue;
    const m = cells[colComp].match(compRe);
    if (!m) { problem('home-table-row', heading + ': ' + line.trim()); continue; }
    for (const s of cells[1].split('+').map((x) => x.trim())) map.set(s, m[1]);
  }
  return map;
}
const HOME_SPEC = parseHomeTable(DESIGN_SPEC_MD, '### 3.16 ', 3, /^3\.(\d+)\b/);       // s -> "N" of 3.N
const HOME_B16 = parseHomeTable(COMPONENTS_MD, '### B.16 ', 3, /^B\.(\d+)\b/);          // s -> "N" of B.N
const HOME316 = new Map();
for (const [s, n] of HOME_SPEC) {
  if (HOME_B16.get(s) !== n) problem('home-order-mismatch', s + ': DESIGN-SPEC 3.16 says 3.' + n + ', COMPONENTS B.16 says B.' + HOME_B16.get(s));
  HOME316.set(s, 'B.' + n);
}
for (const s of HOME_B16.keys()) if (!HOME_SPEC.has(s)) problem('home-order-mismatch', s + ' is in COMPONENTS B.16 but not in DESIGN-SPEC 3.16');
if (HOME316.size === 0) problem('home-order-missing', 'no model section parsed from DESIGN-SPEC 3.16');

/* ---------------------------------------------------------------- page-model events and row alignment */
// the tpl-article families (COMPONENTS A.2, C.1); builder-hub and template use the hub frame (C.7), the home its own (B.16)
const ARTICLE_FAMILIES = new Set(['interior', 'blog-post', 'blog-index', 'archive', 'team-member', 'testimonial', 'location', 'form', 'legal', 'sitemap', 'not-found']);
const doctorsOnly = (b) => (b.members || []).length > 0 && (b.members || []).every((m) => m.categories === 'Our Doctors');

/** Ordered events of a model's main: block markers and h2/h3 heading events. A block whose first content is
 *  one of its own headings (a callout title, a first item or member title, html opening with a heading) is
 *  placed after that heading, so it belongs to the row that heading starts. */
function pageEvents(m) {
  const ev = [];
  for (const s of m.sections || []) {
    if (s.heading && isH23(s.heading.level)) ev.push({ kind: 'h', text: norm(s.heading.text ?? s.heading.html), from: 'section-heading', sec: s.id, key: null });
    if ((s.background || []).some((bg) => bg && bg.image)) ev.push({ kind: 'b', type: 'background', sec: s.id, key: s.id + '.bg', block: { type: 'background', background: s.background } });
    for (const [bi, b] of (s.blocks || []).entries()) {
      const key = s.id + '.' + bi;
      const hs = [];
      let leads = false;
      const add = (t, from) => hs.push({ kind: 'h', text: norm(t), from, sec: s.id, key, block: b });
      if (b.type === 'callout' && b.title && isH23(b.title.level)) { add(b.title.text ?? b.title.html, 'callout-title'); leads = true; }
      if (b.type === 'visit' && b.title && isH23(b.title.level)) { add(b.title.text, 'visit-title'); leads = (b.order || [])[0] === 'title'; }
      htmlHeads(b.html).forEach((t) => add(t, b.type + '-html'));
      if (hs.length && hs[0].from === b.type + '-html') leads = opensWithHeading(b.html) && !(b.type === 'callout' && b.image && b.imageFirst);
      for (const [ii, it] of (b.items || []).entries()) {
        const title = it && it.title;
        const tLevel = title && typeof title === 'object' ? title.level : it && it.level;
        if (title && isH23(tLevel)) { add(typeof title === 'object' ? (title.text ?? title.html) : title, b.type + '-item'); if (ii === 0 && hs.length === 1) leads = true; }
        htmlHeads(it && it.html).forEach((t) => add(t, b.type + '-item-html'));
      }
      for (const [mi, mb] of (b.members || []).entries()) {
        if (isH23(mb.level) && mb.name) { add(mb.name, 'team-member'); if (mi === 0 && hs.length === 1) leads = true; }
        const mh = htmlHeads(mb.html);
        mh.forEach((t) => add(t, 'team-member-html'));
        if (mi === 0 && !isH23(mb.level) && mh.length && hs.length === mh.length && opensWithHeading(mb.html)) leads = true;
      }
      const marker = { kind: 'b', type: b.type, sec: s.id, key, block: b };
      if (leads && hs.length) ev.push(hs[0], marker, ...hs.slice(1));
      else ev.push(marker, ...hs);
    }
  }
  return ev;
}

const ledgerRowsByPage = new Map();
for (const r of ledger0.rows) {
  if (r.sourceTag === 'ledger-added') continue;
  const p = pathOf(r.url);
  if (!ledgerRowsByPage.has(p)) ledgerRowsByPage.set(p, []);
  ledgerRowsByPage.get(p).push(r);
}
const CONVERSION_PATHS = new Set(['/contact-us/appointment-request-form/', '/contact-us/contact-form/', '/contact-us/']);
const ctxById = new Map();
for (const [p, rows] of ledgerRowsByPage) {
  rows.sort((a, b) => a.index - b.index);
  const page = buildPages.get(p);
  const m = models.get(p);
  if (!page || !m) { for (const r of rows) problem('unaligned', r.id + ': no build page or page model for ' + p); continue; }
  const ev = pageEvents(m);
  const blocks = ev.filter((e) => e.kind === 'b');
  const lastSection = (m.sections || [])[(m.sections || []).length - 1];
  const lastBlock = lastSection && lastSection.blocks && lastSection.blocks[lastSection.blocks.length - 1];
  const lifts = ARTICLE_FAMILIES.has(page.family) && lastBlock && (lastBlock.type === 'callout' || lastBlock.type === 'cta') &&
    (lastBlock.buttons || []).some((x) => x.path === '/contact-us/appointment-request-form/' || /^tel:/.test(x.href || ''));
  const liftKey = lifts ? lastSection.id + '.' + (lastSection.blocks.length - 1) : null;
  const asideTitle = m.aside && m.aside.location && m.aside.location.title ? norm(m.aside.location.title.text) : null;
  // align
  let cur = 0;
  const pos = rows.map((r, i) => {
    const want = norm(r.label);
    for (let j = cur; j < ev.length; j++) if (ev[j].kind === 'h' && ev[j].text === want) { cur = j + 1; return { role: 'content', at: j }; }
    if (rows.length === 1) return { role: 'page', at: -1 };
    if (i === rows.length - 1 && page.aside === 'standard' && asideTitle && asideTitle === want) return { role: 'sidebar', at: -1 };
    return { role: 'unaligned', at: -1 };
  });
  if (rows.length === 1) pos[0] = { role: 'page', at: -1, alignedAt: pos[0].at };
  const contentIdx = pos.map((x, i) => (x.role === 'content' ? i : -1)).filter((i) => i >= 0);
  // The home is mapped by MODEL SECTION (DESIGN-SPEC 3.16 is a table of sections; each section is a source builder
  // row): a home row owns the section of its heading plus every following section that holds no row heading
  // (the first row also owns every section above its heading). A block-level span would hand the next doctor's
  // portrait column (it precedes that doctor's h2 in the DOM) to the row before it.
  const secIds = (m.sections || []).map((s) => s.id);
  const homeSections = (i) => {
    const k = contentIdx.indexOf(i);
    const here = secIds.indexOf(ev[pos[i].at].sec);
    const next = k + 1 < contentIdx.length ? secIds.indexOf(ev[pos[contentIdx[k + 1]].at].sec) : secIds.length;
    return secIds.slice(k === 0 ? 0 : here, next > here ? next : here + 1);
  };
  for (const [i, r] of rows.entries()) {
    const x = pos[i];
    const c = {
      r, id: r.id, label: r.label, path: p, page, family: page.family, model: m, pos: i, role: x.role, liftKey,
      headFrom: null, headSec: null, span: [], spanKeys: new Set(), spanTypes: new Set(), spanSections: [],
    };
    if (x.role === 'unaligned') problem('unaligned', r.id + ' label ' + JSON.stringify(r.label) + ' matches no h2/h3 of the page model and is not the sidebar');
    if (x.role === 'page') c.span = blocks;
    if (x.role === 'content') {
      const k = contentIdx.indexOf(i);
      const start = k === 0 ? 0 : x.at;
      const end = k + 1 < contentIdx.length ? pos[contentIdx[k + 1]].at : ev.length;
      const h = ev[x.at];
      c.headFrom = h.from; c.headSec = h.sec;
      const inSpan = ev.slice(start, end).filter((e) => e.kind === 'b');
      const own = h.key && !inSpan.some((e) => e.key === h.key) ? blocks.filter((e) => e.key === h.key) : [];
      c.span = [...own, ...inSpan];
      c.spanSections = uniq([h.sec, ...ev.slice(start, end).filter((e) => e.kind === 'b').map((e) => e.sec)]);
      if (k === 0) c.spanSections = uniq([...ev.slice(0, x.at).filter((e) => e.kind === 'b').map((e) => e.sec), ...c.spanSections]);
      if (page.family === 'home') {
        c.spanSections = homeSections(i);
        const ownSecs = new Set(c.spanSections);
        const sameSecRows = contentIdx.filter((j) => ev[pos[j].at].sec === h.sec);
        // inside a section shared by several rows (the s5 cards, the s7 callouts, the s10 trio) keep the block span
        if (sameSecRows.length === 1) c.span = blocks.filter((e) => ownSecs.has(e.sec));
        else c.span = [...c.span.filter((e) => e.sec === h.sec), ...blocks.filter((e) => ownSecs.has(e.sec) && e.sec !== h.sec)];
      }
      if (h.block && h.block.type === 'callout' && h.block.title) c.titleHrefPath = hrefPath(h.block.title.href, p);
    }
    for (const e of c.span) { c.spanKeys.add(e.key); c.spanTypes.add(e.type); }
    c.ctaLift = !!(liftKey && c.spanKeys.has(liftKey) && x.role === 'content');
    const FAQ_RE = /\bFAQs?\b|Frequently Asked Questions/i;
    // Page-level FAQ evidence (the crawl's pageType, the page h1) counts only for a row whose own content is a question
    // and answer: a question heading or an accordion in its span. The closing "Conclusion" of
    // /eye-exam-faqs-what-to-expect-at-riverside-family-eye-care/ (no question, no accordion: the article's call to book)
    // is not FAQ content, so it is decided by the rules after faq-section.
    const qa = /\?\s*$/.test(norm(r.label)) || c.spanTypes.has('accordion');
    c.faq = FAQ_RE.test(r.label) ? 'row label names an FAQ' : r.pageType === 'faq' && qa ? 'crawl pageType faq' : FAQ_RE.test(page.h1 || '') && qa ? 'page h1 names an FAQ' : c.spanTypes.has('accordion') ? 'accordion (FAQ) block in the span' : null;
    c.reviews = c.spanTypes.has('testimonials') ? 'testimonials block in the span' : c.spanTypes.has('reviews') ? 'reviews block in the span' : page.family === 'testimonial' ? 'testimonial page' : null;
    ctxById.set(r.id, c);
  }
}

// CTA band: the pages the model says qualify must be the pages COMPONENTS B.24 lists
{
  const b24 = sectionOf(COMPONENTS_MD, '### B.24 ') || '';
  const docPaths = new Set([...b24.split('Not qualifying')[0].matchAll(/`(\/[^`\s]*\/)`/g)].map((x) => x[1]));
  const computed = new Set([...ctxById.values()].filter((c) => c.liftKey).map((c) => c.path));
  const a = [...computed].sort().join(' '), b = [...docPaths].sort().join(' ');
  if (a !== b) problem('cta-band-mismatch', 'computed ' + a + ' vs COMPONENTS B.24 ' + b);
}

/* ---------------------------------------------------------------- block -> component (article and hub frames) */
function blockComps(c, frame) {
  const out = [];
  for (const e of c.span) {
    const b = e.block || {};
    const t = e.type;
    if (t === 'background' || t === 'prose' || t === 'callout' || t === 'video') continue;   // inside the frame's own component
    if (t === 'cta' && e.key === c.liftKey) { out.push('B.24'); continue; }
    if (t === 'accordion') out.push('B.26');
    else if (t === 'childpages') out.push(b.variant === 'archive' ? 'B.28' : 'F.2');
    else if (t === 'products' || t === 'equipment') out.push('F.7');
    else if (t === 'visit') out.push('F.8');
    else if (t === 'testimonials' || t === 'reviews') out.push('F.6');
    else if (t === 'docs' || t === 'badges' || t === 'logos' || t === 'cherry' || t === 'cta') out.push('B.31');
    else if (t === 'form') out.push('B.25', 'E.1');
    else if (t === 'team') out.push(frame === 'hub' && doctorsOnly(b) ? 'B.10' : 'B.27');
    else if (t === 'posts') out.push(b.view === 'grid' ? 'B.18' : 'B.28');
    else if (t === 'sitemap') out.push('F.5');
    else if (t === 'gallery') out.push('B.12');
    else problem('unknown-block-type', c.id + ': ' + t);
  }
  return out;
}
const firstBlockOf = (c, types) => (c.span.find((e) => types.includes(e.type)) || {}).type;
const hasProse = (c) => c.span.some((e) => e.type === 'prose' || e.type === 'callout' || e.type === 'video');
const homeComps = (c) => uniq(c.spanSections.map((s) => HOME316.get(s) || (problem('home-section-unmapped', c.id + ': ' + s), null)).filter(Boolean));
const homeExtra = (c) => {
  const extra = c.spanSections.filter((s) => s !== c.headSec && HOME316.has(s) && HOME316.get(s) !== HOME316.get(c.headSec));
  return extra.length ? ' This row\'s span also holds ' + extra.join(', ') + ' (no h2/h3 at source), rebuilt as ' + uniq(extra.map((s) => compName(HOME316.get(s)))).join(' + ') + ' (DESIGN-SPEC 3.16).' : '';
};

/* ---------------------------------------------------------------- RULES for the crawled rows (first match wins) */
const SCHEDULE_RE = /\b(Schedule|Book|Request)\s+(Your|an?)\b/i;
const VERBATIM = ' Copy verbatim.';
const RULES = [
  // ---- single-row pages (the row stands for the whole page) and the sidebar
  { id: 'page-template', test: (c) => c.family === 'template', decision: 'PRESERVE', slot: 'footer', comps: (c) => ['C.7', ...blockComps(c, 'hub')],
    why: 'Platform template page (/template/*: a Beaver Builder global header or footer template rendered as a page; it has no h2/h3, so its one row is the whole page) kept at its own URL with its content verbatim, stale template strings included (COMPONENTS C.7), noindex as at source and out of the sitemap, in the builder-hub frame under a plain title band. Its h1 is its own <title> (audit/seo-repairs.json h1, own ADD row); its copies of the site menus render from chrome.json (clone-removals, own REPLACE row). DESIGN-SPEC Q-13 recommends a 410 or 301 at launch.' },
  { id: 'page-cherry', test: (c) => c.role === 'page' && c.spanTypes.has('cherry'), decision: 'REPLACE', slot: 'strategic-cta', comps: ['B.31', 'C.7'], primaryBlock: 'cherry',
    why: 'REPLACE: /cherry-payment-plan/ has no heading and its whole body is the Cherry financing widget, which does not work standalone (its API calls fail, it throws and it loads Segment analytics: BUILD-NOTES 4 decision 4, CY-1). The page shows link mode instead: its own label "Cherry Payment Plan" as a muted pill with data-needs="cherry application url" until the practice supplies the application URL (COMPONENTS B.31 cherry); RFEC_CHERRY=embed restores the exact source embed. Its h1 is its menu label (own ADD row).' },
  { id: 'page-location', test: (c) => c.family === 'location', decision: 'IMPROVE', slot: 'footer', comps: (c) => ['F.8', ...blockComps(c, 'article'), 'B.23'],
    why: '/location/riverside-family-eyecare/ has no h2/h3 (its sub-headings "Contact Details", "Address", "Hours" are div.heading-h3 at source), so its one row is the whole page: the visit block, complete view, in the model order (contacts, address, the live lazy keyless map, hours; COMPONENTS F.8) in the article frame, with the location-page aside variant (quick actions and social; no location card, which would point at itself). Every value from the source.' },
  { id: 'page-form', test: (c) => c.family === 'form', decision: 'IMPROVE', slot: 'strategic-cta', comps: (c) => ['B.25', 'E.1', ...(hasProse(c) ? ['B.22'] : []), 'B.23'],
    why: 'Form page (one Gravity Form in main; its only h2/h3 is the sidebar location title, so its one row is the whole page): the form rebuilt field for field in the paper form card (every label, sub-label, option and required mark verbatim; the contact form keeps its 2 show-if rules; COMPONENTS B.25, E), any intro prose above it, the standard aside beside it. The form stays inert until an endpoint is decided (own REPLACE row); the invisible reCAPTCHA, the honeypot and Akismet are removed (own REMOVE rows).' },
  { id: 'page-legal', test: (c) => c.family === 'legal', decision: 'IMPROVE', slot: 'footer', comps: ['B.29', 'B.23'],
    why: 'Legal page (its only h2/h3 is the sidebar location title, so its one row is the whole page) rebuilt in the article frame as prose only (COMPONENTS B.29): the 66ch measure, h2/h3 in the standard styles, lists with wave bullets, links underlined, of the prose enhancers only the lead rule; the standard aside. Copy verbatim, the privacy policy\'s placeholder clause included (DESIGN-SPEC Q-12); on /disclaimer/ the 6 sentences naming the former platform vendor are removed at sentence level (own REMOVE row).' },
  { id: 'page-testimonial', test: (c) => c.family === 'testimonial', decision: 'IMPROVE', slot: 'social-proof', comps: ['F.6', 'B.23'],
    why: 'The practice\'s real testimonial page (its one row is the whole page): the review rebuilt as the static testimonial card (COMPONENTS F.6: 5 stars as SVG icons labelled "5 out of 5 stars", the quote and the attribution "- Lukas R, Google 2021" verbatim with its dash; no title, the h1 is the title; no carousel) with the standard aside. The hidden ratingValue microdata is not rendered (own REMOVE row).' },
  { id: 'page-archive', test: (c) => c.family === 'archive', decision: 'IMPROVE', slot: 'footer', comps: (c) => ['F.4', ...blockComps(c, 'article'), ...(c.spanTypes.has('prose') ? ['B.22'] : []), 'B.23'],
    why: 'Archive (category, tag or author listing; titles are div links at source, so its only h2/h3 is the sidebar location title and its one row is the whole page): rebuilt in the article frame (COMPONENTS F.4) under a title band with the utility arch and the source breadcrumb "Home » " (empty own segment): the 13 listing archives as single-column paper archive rows (title links only, as at source), the 4 "Nothing Found" archives with their prose in the article card ("Perhaps searching can help." stays; the search form is removed, own REMOVE row); noindex as at source; the <title> repaired from the page\'s own h1 (audit/seo-repairs.json titles). Standard aside.' },
  { id: 'page-team', test: (c) => c.family === 'team-member' && c.role === 'page', decision: 'IMPROVE', slot: 'trust-positioning', comps: (c) => [...(c.spanTypes.has('team') ? ['B.27'] : []), 'B.22', 'B.23'],
    why: 'Team page whose only h2/h3 is the sidebar location title, so its one row is the whole page: the member\'s bio in the article flow (the team block printed inline, COMPONENTS B.27 rule 1, or the builder page\'s own prose and video), the portrait or the iris-ring placeholder plate in the title arch and the position as the band chip (B.21), the standard aside.' + VERBATIM },
  { id: 'page-hub-visit', test: (c) => c.family === 'builder-hub' && c.role === 'page' && c.spanTypes.has('visit'), decision: 'IMPROVE', slot: 'footer', comps: (c) => ['C.7', ...blockComps(c, 'hub')],
    why: 'Hours & Location hub (no sidebar at source; one h2/h3, so its one row is the whole page) rebuilt in the builder-hub frame (COMPONENTS C.7): the visit block in its summary order (the live lazy keyless map, title, address, contacts, hours; F.8), the source prose and quick-action badges, and the source button to /insurance/ (no CTA band: it targets neither the appointment form nor a phone). Every value from the source.' },
  { id: 'page-interior', test: (c) => c.family === 'interior' && c.role === 'page', decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['B.22', ...blockComps(c, 'article'), 'B.23'],
    why: 'Interior page whose only h2/h3 is the sidebar location title, so its one row is the whole page: rebuilt in the article frame (COMPONENTS C.1) as the long-form prose card (B.22) with its blocks in model order (a child-page listing as link cards, F.2, where the page has one), under the title band with its section\'s arch, beside the standard aside.' + VERBATIM },
  { id: 'sidebar', test: (c) => c.role === 'sidebar', decision: 'IMPROVE', slot: 'footer', comps: ['B.23'],
    why: 'The source sidebar (div.ecp-secondary after main; this row starts at its location widget\'s h2 "Riverside Family Eye Care"): rebuilt as the aside (COMPONENTS B.23): the glass quick-actions card ("Request An Appointment", "Email Us") with the 4 social circles, then the paper location card (the title as an h2 link to /location/riverside-family-eyecare/, the address, Phone as a tel: link, Fax as text, Email with its PHI note, the hours table with the source\'s "Day:" colons). Every value from the source. The search widget is removed, the map iframe becomes a static "Open in Google Maps" card, and the location card is sticky on tall desktops (own REMOVE, REPLACE and ADD rows).' },
  // ---- the home (rows are its 17 h2/h3 headings; components per model section, DESIGN-SPEC 3.16)
  { id: 'home-opening', test: (c) => c.family === 'home' && c.pos === 0, decision: 'IMPROVE', slot: 'value-proposition', comps: homeComps, home: true,
    why: (c) => 'First home row. sr-plan makes home rows from h2/h3 only, so this row (label: the services h2) also stands for everything above it, which has no row of its own: the hero (s1 photo row; s2 "Comprehensive Eye Care", a div.ecp-heading at source, with "Request Appointment"), the h1 "Your Eye Doctor in Fort Myers, Florida" with its paragraph (s3) and the Envision promo image (s4). Rebuilt per DESIGN-SPEC 3.16: the hero (the statement as a p, the primary CTA, the practice photo in a 4:3 frame, the light, the bank), the glass intro card holding the h1, the promo straddling the services band, then the services heading. The value proposition: who it serves, what it offers, the primary CTA. Span: ' + c.spanSections.join(', ') + '.' + VERBATIM },
  { id: 'home-conversion-card', test: (c) => c.family === 'home' && c.headFrom === 'callout-title' && CONVERSION_PATHS.has(c.titleHrefPath), decision: 'IMPROVE', slot: 'strategic-cta', comps: homeComps, home: true,
    why: (c) => 'Home card whose title links to ' + c.titleHrefPath + ' (the appointment form or the contact page): a conversion step in the source journey. Rebuilt in its DESIGN-SPEC 3.16 component (' + compName(HOME316.get(c.headSec)) + '), title, link target and text verbatim.' + homeExtra(c) },
  { id: 'home-services', test: (c) => c.family === 'home' && c.headSec === 's5', expect: 'B.6', decision: 'IMPROVE', slot: 'benefits-solution', comps: homeComps, home: true,
    why: (c) => 'Service card (home s5) rebuilt as a glass card in the 4/2/1 services grid, the photo breaking above the card (protrusion 4), the title an h3 stretched link (source h3), tilt, glare and lift on hover and focus. Title, link and text verbatim; the Dry Eye Treatment and Patient Forms texts stay as the source has them (mismatched, DESIGN-SPEC Q-4).' + homeExtra(c) },
  { id: 'home-callouts', test: (c) => c.family === 'home' && c.headSec === 's7', expect: 'B.9', decision: 'IMPROVE', slot: 'benefits-solution', comps: homeComps, home: true,
    why: (c) => 'Callout (home s7) rebuilt as one of the two paper callout cards: the h3 title (the Glaucoma card linked, with tilt), the wave rule, the text, the 640x240 photo in a frame. The optional kids\' glasses cut-out (G19, H3) is its own imagery ADD row.' + VERBATIM + homeExtra(c) },
  { id: 'home-doctors', test: (c) => c.family === 'home' && (c.headSec === 's8' || c.headSec === 's9'), expect: 'B.10', decision: 'IMPROVE', slot: 'trust-positioning', comps: homeComps, home: true,
    why: (c) => 'Doctor row (home s8/s9) rebuilt as a doctor block: Dr. Degler\'s own photo, or for Dr. Nelson the iris-ring placeholder plate (her photo was refused by the platform CDN; own REPLACE row), larger than its aurora plate; the name tag link, the h2 and the bio in a paper pane, "Meet Our Optometrist"; Nelson\'s block mirrors Degler\'s; the portrait sticks while a tall pane scrolls (R5).' + VERBATIM + homeExtra(c) },
  { id: 'home-trio', test: (c) => c.family === 'home' && c.headSec === 's10', expect: 'B.11', decision: 'IMPROVE', slot: 'benefits-solution', comps: homeComps, home: true,
    why: (c) => 'Lavender trio item (home s10): the round photo straddling the band\'s bank, the h3 title link, the text in ink-900 on the --lav-300 band. Title, link and text verbatim.' + homeExtra(c) },
  { id: 'home-designer-frames', test: (c) => c.family === 'home' && c.headSec === 's11', expect: 'B.12', decision: 'IMPROVE', slot: 'benefits-solution', comps: homeComps, home: true,
    why: (c) => '"Our Designer Frames" (home s11): the linked h2 and its two paragraphs beside the four campaign tiles (Furla, Draper James, Charmant whole at 500x500; Bajio as a brand-name cell, because its image was refused by the platform CDN: own REPLACE row). No generated eyewear in or next to it.' + VERBATIM + homeExtra(c) },
  { id: 'home-cataract', test: (c) => c.family === 'home' && c.headSec === 's12', expect: 'B.13', decision: 'IMPROVE', slot: 'benefits-solution', comps: homeComps, home: true,
    why: (c) => 'Cataract Co-Management (home s12): the bold h2 and its copy in a paper text card beside the generated lens in an arch-top frame crossing into Eye Emergencies (H2, own imagery ADD row).' + VERBATIM + homeExtra(c) },
  { id: 'home-emergency', test: (c) => c.family === 'home' && c.headSec === 's13', expect: 'B.14', decision: 'IMPROVE', slot: 'strategic-cta', comps: homeComps, home: true, needsTel: true,
    why: (c) => 'Eye Emergencies (home s13): its copy holds the tel: call link, so it serves the conversion slot. Rebuilt on the A4 band: the handshake photo breaking out on the left, the linked h2 and copy on the right, the phone link bold and unbroken.' + VERBATIM + homeExtra(c) + ' The reviews in that span are their own row (the carousel REPLACE row, social-proof).' },
  { id: 'home-insurance', test: (c) => c.family === 'home' && c.headSec === 's15', expect: 'B.17', decision: 'IMPROVE', slot: 'strategic-cta', comps: homeComps, home: true,
    why: (c) => 'Insurance band (home s15): the h3 at its source level (COMPONENTS B.3: heading-parity), its two paragraphs and "View All Our Insurance Plans" in the editorial split (G12) on the lavender band. COMPONENTS B.24 and G.1: the home gets no CTA band because this band closes it, so it is the home\'s final ask.' + VERBATIM + homeExtra(c) },
  { id: 'home-news', test: (c) => c.family === 'home' && c.headSec === 's16', expect: 'B.18', decision: 'IMPROVE', slot: 'benefits-solution', comps: homeComps, home: true,
    why: (c) => 'Latest news (home s16): the linked h3 and four frost post cards (date eyebrow, h4 title link, the excerpt; the raw [account get=\'name\'] shortcode resolved to the practice name, own REPLACE row) with the teal-to-violet top rule (G8). Titles and excerpts verbatim.' + homeExtra(c) },
  // ---- builder hubs (no sidebar; full-width bands, COMPONENTS C.7)
  { id: 'hub-opening', test: (c) => c.family === 'builder-hub' && c.pos === 0 && c.spanTypes.has('background') && ((c.model.sections || [])[0] || {}).background && c.spanKeys.has(((c.model.sections || [])[0] || {}).id + '.bg'), decision: 'IMPROVE', slot: 'value-proposition', comps: (c) => ['C.7', ...blockComps(c, 'hub')],
    why: 'First row of a builder hub whose header row (the h1 callout, its intro and "SCHEDULE AN APPOINTMENT") has no h2/h3 of its own, so this row also stands for it: the header row becomes the glass hub intro with its button row, its background photo moves to the title arch (COMPONENTS B.21 order 2), then the first h2/h3 section in its band. The hub\'s headline, support and primary CTA.' + VERBATIM },
  { id: 'hub-doctors', test: (c) => c.family === 'builder-hub' && c.span.some((e) => e.type === 'team' && doctorsOnly(e.block)), decision: 'IMPROVE', slot: 'trust-positioning', comps: (c) => ['B.10', 'C.7', ...blockComps(c, 'hub')],
    why: 'Doctor of the /our-eye-doctors/ team block ("Our Doctors"): rebuilt as stacked doctor blocks (COMPONENTS B.10 markup, alternating), the name an h3 at its source level, the bio and "Read More"; Dr. Degler\'s own photo, Dr. Nelson and Dr. Longa as iris-ring placeholder plates (their photos were refused by the platform CDN; own REPLACE row).' + VERBATIM },
  { id: 'hub-staff', test: (c) => c.family === 'builder-hub' && c.spanTypes.has('team'), decision: 'IMPROVE', slot: 'trust-positioning', comps: (c) => ['B.27', 'C.7', ...blockComps(c, 'hub')],
    why: 'Staff member of the /the-staff/ team block: a frost team card in the 4/3/2/1 grid (COMPONENTS B.27): the portrait or the iris-ring placeholder plate breaking above the card, the name h3 link, the position chip (G18), the excerpt and "Read More".' + VERBATIM },
  { id: 'hub-reviews', test: (c) => c.family === 'builder-hub' && c.spanTypes.has('reviews'), decision: 'IMPROVE', slot: 'social-proof', comps: (c) => ['F.6', 'C.7', ...blockComps(c, 'hub')],
    why: 'The real patient review on /eyeglasses/designer-frames/ (its reviews block): the static review card (COMPONENTS F.6: SVG stars labelled "5 out of 5 stars", the time verbatim inside <time>, the quote and the name verbatim) on its photo band, then "More Google Reviews" (external, new tab). The sections after it in this row\'s span (no h2/h3 at source) stay hub prose.' + VERBATIM },
  { id: 'hub-people', test: (c) => c.family === 'builder-hub' && (c.model.sections || []).some((s) => (s.blocks || []).some((b) => b.type === 'team')), decision: 'IMPROVE', slot: 'trust-positioning', comps: (c) => ['C.7', ...blockComps(c, 'hub')],
    why: 'Section of a people hub (a page whose model holds a team block: /our-eye-doctors/, /the-staff/) rebuilt in its hub band (COMPONENTS C.7): titled callouts as paper hub callouts, prose as hub flow.' + VERBATIM },
  { id: 'hub-insurance', test: (c) => c.family === 'builder-hub' && (c.model.sections || []).some((s) => (s.blocks || []).some((b) => b.type === 'logos' && b.kind === 'carriers')), decision: 'IMPROVE', slot: 'trust-positioning', comps: (c) => ['C.7', ...blockComps(c, 'hub')],
    why: 'Section of /insurance/ (the carrier logo walls) rebuilt in its hub band (COMPONENTS C.7): the vision and medical carrier walls as white chips at native size, names as alt only (B.31 logos), with the source prose, badges and the child-page link cards. The plans accepted are a key supporting benefit.' + VERBATIM },
  { id: 'hub-section', test: (c) => c.family === 'builder-hub', decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['C.7', ...blockComps(c, 'hub')],
    why: 'Builder-hub section rebuilt in its hub band (COMPONENTS C.7; band variant by kind): prose as hub flow, titled callouts as paper hub callouts, untitled ones as tint panels, brand callouts as brand cards, badges as quick-action pills, logo walls as white chips, child pages as image cards with the thumbnail breaking above the card (F.2).' + VERBATIM },
  // ---- the article frame (tpl-article families, COMPONENTS C.1)
  { id: 'cta-band-lift', test: (c) => ARTICLE_FAMILIES.has(c.family) && c.ctaLift, decision: 'IMPROVE', slot: 'strategic-cta', comps: (c) => ['B.24', ...(hasProse(c) ? ['B.22'] : []), ...blockComps(c, 'article')],
    why: 'This row\'s span holds the page\'s last block, a callout or cta whose button targets the appointment form, so it is lifted out of the article into the CTA band (COMPONENTS B.24; computed from the page model and equal to the 4 pages B.24 lists): the title (when there is one) as a white heading with the light wave rule, the copy, the block\'s own button as btn--light, plus the chrome call action (own ADD row). It stays inside main, so every parity gate sees it where it was.' + VERBATIM },
  // FAQ content only on pages that carry it (a post card on /whats-new/ or /sitemap/ whose title says "FAQs" is a link, not FAQ content)
  { id: 'faq-section', test: (c) => (c.family === 'interior' || c.family === 'blog-post') && c.role === 'content' && !!c.faq, decision: 'IMPROVE', slot: 'objection-handling', comps: (c) => ['B.22', ...blockComps(c, 'article')],
    why: (c) => 'FAQ content at source (' + c.faq + '): rebuilt as a sub-section of the long-form prose card (COMPONENTS B.22); accordion items, where the span has them, become native <details>/<summary> (B.26: the question in the summary, the answer in the panel; the platform\'s "Toggle accordion" aria-label is dropped, own REMOVE row). Questions and answers verbatim.' },
  { id: 'testimonial-section', test: (c) => ARTICLE_FAMILIES.has(c.family) && c.spanTypes.has('testimonials'), decision: 'IMPROVE', slot: 'social-proof', comps: (c) => ['F.6', ...(hasProse(c) ? ['B.22'] : []), ...blockComps(c, 'article')],
    why: 'The real testimonial on /contact-us/testimonials/ ("- Lukas R, Google 2021"): the static testimonial card (COMPONENTS F.6) with its linked h2 title, 5 SVG stars labelled "5 out of 5 stars", the quote and the attribution verbatim; no carousel. The hidden ratingValue is not rendered (own REMOVE row).' },
  { id: 'visit-section', test: (c) => ARTICLE_FAMILIES.has(c.family) && c.spanTypes.has('visit'), decision: 'IMPROVE', slot: 'footer', comps: (c) => ['F.8', ...(hasProse(c) ? ['B.22'] : []), ...blockComps(c, 'article')],
    why: 'The location module on /contact-us/ (visit block, list view: the h2 title link "Riverside Family Eye Care" and the contact rows) rebuilt as the visit block (COMPONENTS F.8) in the article flow, followed by the source prose and the child-page link cards (F.2). Every value from the source.' },
  { id: 'contact-section', test: (c) => ARTICLE_FAMILIES.has(c.family) && c.path.startsWith('/contact-us/'), decision: 'IMPROVE', slot: 'footer', comps: (c) => ['B.22', ...blockComps(c, 'article')],
    why: 'Contact-section page rebuilt in the article frame: the prose card with its blocks in model order (on /contact-us/patient-forms/ the HIPAA PDF, which the harvest does not hold, prints as a labelled placeholder: own REPLACE row).' + VERBATIM },
  { id: 'schedule-section', test: (c) => ARTICLE_FAMILIES.has(c.family) && SCHEDULE_RE.test(c.label), decision: 'IMPROVE', slot: 'strategic-cta', comps: (c) => ['B.22', ...blockComps(c, 'article')],
    why: 'Closing section whose own heading asks the reader to schedule or book (the row label is the evidence): a sub-section of the long-form prose card (COMPONENTS B.22) with its links unchanged; it serves the conversion slot.' + VERBATIM },
  { id: 'team-bio-section', test: (c) => c.family === 'team-member', decision: 'IMPROVE', slot: 'trust-positioning', comps: (c) => [...(c.spanTypes.has('team') ? ['B.27'] : []), 'B.22', ...blockComps(c, 'article').filter((x) => x !== 'B.27')],
    why: 'Team-member section: the bio (the team block printed inline, COMPONENTS B.27 rule 1, or the builder page\'s own prose) as a sub-section of the article flow; the portrait or the placeholder plate is in the title arch and the position is the band chip (B.21).' + VERBATIM },
  { id: 'products-section', test: (c) => ARTICLE_FAMILIES.has(c.family) && c.spanTypes.has('products'), decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['F.7', 'B.22', ...blockComps(c, 'article')],
    why: 'Contact-lens brand page section: each product prints its full text once as a frost product card (COMPONENTS F.7: the packshot whole on a white chip, the title, the full text with its own sub-headings, "Read More+" as muted text with no link); the truncated duplicate excerpts are removed (own REPLACE row). Text verbatim.' },
  { id: 'equipment-section', test: (c) => ARTICLE_FAMILIES.has(c.family) && c.spanTypes.has('equipment'), decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['F.7', 'B.22', ...blockComps(c, 'article')],
    why: 'Advanced Technology device (equipment block) rebuilt as a frost device card (COMPONENTS F.7: the device image whole on a white plate, the title, the text) in the article flow.' + VERBATIM },
  { id: 'blog-index-card', test: (c) => c.family === 'blog-index', decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['B.28', ...(hasProse(c) ? ['B.22'] : []), ...blockComps(c, 'article')],
    why: '/whats-new/ post summary rebuilt as a frost post card in the 2-column summary grid (COMPONENTS B.28: date eyebrow, the h2 title as a stretched link, the excerpt with its shortcodes resolved, "Read More"); all 21 posts on the one URL, in source order, no pagination (as at source).' + VERBATIM },
  { id: 'sitemap-section', test: (c) => c.family === 'sitemap', decision: 'IMPROVE', slot: 'footer', comps: (c) => [...(c.spanTypes.has('sitemap') ? ['F.5'] : []), 'B.28', ...blockComps(c, 'article')],
    why: '/sitemap/ rebuilt in the article frame: the sitemap tree (92 links nested by depth, top-level groups in columns; COMPONENTS F.5) followed by the post list (21 cards in one column, F.3); the source search form is removed (own REMOVE row).' + VERBATIM },
  { id: 'not-found-section', test: (c) => c.family === 'not-found', decision: 'IMPROVE', slot: 'footer', comps: ['B.30', 'B.22'],
    why: '/404-page-not-found/ prose section (h2, h3 and paragraph) rebuilt in the article card under the title band with the utility arch (COMPONENTS B.30), with the standard aside; the platform\'s 404.png illustration is removed (own REMOVE row); no search (DESIGN-SPEC 3.30).' + VERBATIM },
  { id: 'blog-post-section', test: (c) => c.family === 'blog-post', decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['B.22', ...blockComps(c, 'article')],
    why: 'Blog post section rebuilt as a sub-section of the long-form prose card (COMPONENTS B.22: a reading measure of 60-75 characters, display headings with the wave rule, figures placed by role and width; a post\'s own lead figure stays first in the article, never moved to the arch) under the title band with the post date and the blog arch.' + VERBATIM },
  { id: 'article-section', test: (c) => c.family === 'interior', decision: 'IMPROVE', slot: 'benefits-solution', comps: (c) => ['B.22', ...blockComps(c, 'article')],
    why: 'Interior section rebuilt as a sub-section of the long-form prose card (COMPONENTS B.22) in the article frame (C.1): the reading measure, display headings with the wave rule, lists with wave bullets, figures by role and width, titled callouts as sub-sections, untitled ones as tint panels, component blocks (accordion, child pages, products, video, docs) as classed elements in the flow, and the prose enhancers (D.6) where their triggers hold.' + VERBATIM },
];
const RULE_IDS = new Set();
for (const r of RULES) { if (RULE_IDS.has(r.id)) fatal('duplicate rule id ' + r.id); RULE_IDS.add(r.id); }
for (const r of RULES) if (r.expect) { const sec = { 'home-services': 's5', 'home-callouts': 's7', 'home-doctors': 's8', 'home-trio': 's10', 'home-designer-frames': 's11', 'home-cataract': 's12', 'home-emergency': 's13', 'home-insurance': 's15', 'home-news': 's16' }[r.id]; if (HOME316.get(sec) !== r.expect) problem('home-order-mismatch', r.id + ' expects ' + sec + ' -> ' + r.expect + ', DESIGN-SPEC 3.16 says ' + HOME316.get(sec)); }
if (HOME316.get('s9') !== 'B.10') problem('home-order-mismatch', 'home-doctors expects s9 -> B.10');

/* ---------------------------------------------------------------- rows the crawl cannot produce */
const ADDED = [];
const addRow = (row) => ADDED.push(row);
const listPages = (arr, n = 10) => arr.length + ' page(s): ' + arr.slice(0, n).join(', ') + (arr.length > n ? ', ...' : '');

// (1) one row per declared removal group of audit/clone-removals.json
const DECISION_OF = { REMOVE: 'REMOVE', REPLACE: 'REPLACE', REPAIR: 'IMPROVE' };   // REPAIR = same content, better structure
const ELEMENT_MAP = [
  { re: /^header\.ecp-header, footer\.ecp-footer/, key: 'chrome', comps: ['B.2', 'B.19', 'B.23'], slot: 'footer' },
  { re: /voice_search/, key: 'voice-search', comps: ['B.19'], slot: 'footer', strings: /^(Speak Field|Search the site)$/ },
  { re: /widget_search/, key: 'search-forms', comps: ['B.23', 'F.4', 'F.5'], slot: 'footer', strings: /^(Search:|Search)$/ },
  { re: /ecp-powered-by/, key: 'powered-by', comps: ['B.19'], slot: 'footer', strings: /^Powered by$/ },
  { re: /ecp-footer-login-link/, key: 'login-link', comps: ['B.19'], slot: 'footer', strings: /^Login$/ },
  { re: /ecp-menu-mobile-focus-trap/, key: 'menu-focus-trap', comps: ['B.2'], slot: 'footer', strings: /^Return to top of menu$/ },
  { re: /^nav\.ecp-menu copies of the SITE menus/, key: 'template-menu-copies', comps: ['C.7'], slot: 'footer' },
  { re: /^\/template\/header-2\/ phone menu/, key: 'template-hamburger-copy', comps: ['C.7'], slot: 'footer' },
  { re: /^GTM-/, key: 'trackers', comps: ['A.1'], slot: 'footer' },
  { re: /#floatingEstimator/, key: 'cherry-estimator', comps: ['B.19'], slot: 'strategic-cta' },
  { re: /^\/cherry-payment-plan\/ div\.ecp-html/, key: 'cherry-widget', comps: ['B.31'], slot: 'strategic-cta', block: 'cherry', url: '/cherry-payment-plan/' },
  { re: /gfield--type-captcha/, key: 'captcha', comps: ['B.25'], slot: 'strategic-cta', strings: /^CAPTCHA$/ },
  { re: /gform_validation_container/, key: 'form-honeypot', comps: ['B.25'], slot: 'strategic-cta', strings: new RegExp('validation purposes|^' + String.fromCodePoint(0x394) + '$') },   // U+0394: the Akismet honeypot label
  { re: /itemprop=ratingValue/, key: 'rating-value', comps: ['F.6'], slot: 'social-proof', reviews: 'the hidden rating value of the practice\'s real testimonial' },
  { re: /ecp-contactlens-desc/, key: 'contactlens-excerpts', comps: ['F.7'], slot: 'benefits-solution', sentences: true },
  { re: /EyeCarePro-Icons, Foundation Icons, Font Awesome/, key: 'icon-fonts', comps: ['0.7'], slot: 'footer' },
  { re: /^wp-emoji, jQuery/, key: 'platform-runtime', comps: ['A.1'], slot: 'footer' },
  { re: /^source JSON-LD of the platform/, key: 'jsonld-sitewide', comps: ['A.1'], slot: 'footer' },
  { re: /^source JSON-LD BlogPosting/, key: 'jsonld-blogposting', comps: ['A.1'], slot: 'footer' },
  { re: /^source JSON-LD FAQPage/, key: 'jsonld-faqpage', comps: ['A.1'], slot: 'footer' },
  { re: /^source JSON-LD VideoObject/, key: 'jsonld-videoobject', comps: ['A.1'], slot: 'footer' },
  { re: /builder\.eyeglassguide\.com/, key: 'eyeglass-guide-badge', comps: ['B.22'], slot: 'benefits-solution', url: '/eyeglasses/eyeglass-guide/' },
  { re: /^404\.png/, key: '404-illustration', comps: ['B.30'], slot: 'footer', url: '/404-page-not-found/' },
];
const STRING_ONLY = [
  { re: /^Toggle accordion$/, key: 'accordion-toggle-label', comps: ['B.26'], slot: 'objection-handling', faq: 'the aria-label of the source FAQ accordions', preset: '09-accessibility-d-acc-5-keyboard-operable-accordion-apg-disclosure' },
];
const removalStrings = removals.strings || [];
const stringOwner = new Map();   // string index -> row key
removalStrings.forEach((s, i) => {
  const owners = [...ELEMENT_MAP.filter((e) => e.strings && e.strings.test(s.value)).map((e) => e.key), ...STRING_ONLY.filter((e) => e.re.test(s.value)).map((e) => e.key)];
  if (owners.length !== 1) problem('removal-string-unmapped', JSON.stringify(s.value) + ' -> ' + (owners.join(', ') || 'no row'));
  else stringOwner.set(i, owners[0]);
});
const elementSeen = new Map();
for (const [i, el] of (removals.elements || []).entries()) {
  const hits = ELEMENT_MAP.filter((e) => e.re.test(el.selector));
  if (hits.length !== 1) { problem('removal-element-unmapped', 'elements[' + i + '] ' + el.selector + ' -> ' + hits.length + ' map entries'); continue; }
  const e = hits[0];
  if (elementSeen.has(e.key)) { problem('removal-element-twice', e.key); continue; }
  elementSeen.set(e.key, i);
  const decision = DECISION_OF[el.decision];
  if (!decision) { problem('removal-decision-unknown', el.selector + ': ' + el.decision); continue; }
  const strs = removalStrings.filter((s, si) => stringOwner.get(si) === e.key).map((s) => JSON.stringify(s.value));
  let extra = '';
  if (e.sentences) {
    const sents = removals.sentences || [];
    const bad = sents.filter((s) => !/^Contact-lens product excerpt/.test(s.reason || '') || !String(s.page || '').startsWith('/contact-lenses/our-featured-brands/'));
    if (bad.length) problem('removal-sentences-unmapped', bad.length + ' sentence(s) are not contact-lens product excerpts');
    const byPage = tally(sents, (s) => s.page);
    extra = ' The ' + sents.length + ' removed excerpts are listed per page in clone-removals "sentences" (' + Object.entries(byPage).map(([p, n]) => p + ' ' + n).join(', ') + ').';
  }
  addRow({ key: 'rm-' + e.key, group: 'removal', decision, slot: e.slot, comps: e.comps, primaryBlock: e.block, url: e.url, reviews: e.reviews,
    label: 'clone-removals elements[' + i + '] ' + el.decision + ': ' + el.selector.slice(0, 120),
    why: decision + ' (audit/clone-removals.json elements[' + i + '], declared ' + el.decision + '): ' + el.reason + (el.count ? ' (count: ' + el.count + ')' : '') + (strs.length ? ' Removed strings: ' + strs.join(', ') + '.' : '') + extra });
}
for (const e of ELEMENT_MAP) if (!elementSeen.has(e.key)) problem('removal-map-entry-unused', e.key + ' matched no element of clone-removals.json');
for (const e of STRING_ONLY) {
  const strs = removalStrings.filter((s, si) => stringOwner.get(si) === e.key);
  if (!strs.length) { problem('removal-map-entry-unused', e.key); continue; }
  addRow({ key: 'rm-' + e.key, group: 'removal', decision: 'REMOVE', slot: e.slot, comps: e.comps, preset: e.preset, faq: e.faq,
    label: 'clone-removals strings: ' + strs.map((s) => s.value).join(', '),
    why: 'REMOVE (audit/clone-removals.json strings): ' + strs.map((s) => JSON.stringify(s.value) + ': ' + s.reason).join(' ') + ' (COMPONENTS B.26: the FAQ accordions are native <details>/<summary>.)' });
}
if ((removals.replacements || []).length) {
  // the declared decision is kept, as for the elements (REPAIR -> IMPROVE, like elements[18] BlogPosting)
  const declared = uniq(removals.replacements.map((x) => x.decision));
  const decision = declared.length === 1 ? DECISION_OF[declared[0]] : undefined;
  if (!decision) problem('removal-decision-unknown', 'clone-removals replacements declare ' + declared.join('/'));
  addRow({ key: 'rm-shortcodes', group: 'removal', decision: decision || 'UNSET', slot: 'benefits-solution', comps: ['B.18', 'B.28'],
    label: 'clone-removals replacements: unrendered platform shortcodes',
    why: (decision || 'UNSET') + ' (audit/clone-removals.json replacements, declared ' + declared.join('/') + ': the same content, rendered; BUILD-NOTES 4 decision 2): the source prints raw platform shortcodes in post excerpts; each becomes the account value it requests: ' + removals.replacements.map((x) => JSON.stringify(x.from) + ' -> ' + JSON.stringify(x.to) + ' on ' + (x.pages || []).join(', ')).join('; ') + '. Reason: ' + uniq(removals.replacements.map((x) => x.reason)).join(' ') });
}
if (removals.vendorClauses && removals.vendorClauses.count) addRow({ key: 'rm-vendor-clauses', group: 'removal', decision: 'REMOVE', slot: 'footer', comps: ['B.29'], url: '/disclaimer/',
  label: 'clone-removals vendorClauses: ' + removals.vendorClauses.count + ' vendor sentences on /disclaimer/',
  why: 'REMOVE (audit/clone-removals.json vendorClauses): ' + removals.vendorClauses.count + ' ' + removals.vendorClauses.scope + '. Caveat: ' + removals.vendorClauses.caveat });
const IMG = removals.images || {};
const imgBase = (src) => decodeURIComponent(String(src).split('/').pop());
// the stand-in figures, computed once for the dropped-images row and the stand-ins row
const STANDINS = (imagePlan.images || []).filter((im) => im.role === 'stand-in');
const standinSlots = STANDINS.reduce((n, im) => n + (im.usedFor || []).filter((u) => typeof (typeof u === 'string' ? u : u.page) === 'string').length, 0);
// droppedOnPages also declares a layer the DESIGN supersedes (src/build.mjs SUPERSEDED, gap I.6: the home hero's phone
// file); it is the dsn-hero-phone-file row's subject, not a refused stock photo, so it is not a refused visible slot
const SUPERSEDED_DROPS = (IMG.droppedOnPages || []).filter((d) => /^superseded by the design\b/.test(String(d.why || '')));
const visibleRefusedSlots = (IMG.droppedOnPages || []).filter((d) => ((IMG.refusedDropped || {}).files || []).includes(imgBase(d.src))).length;
if (visibleRefusedSlots - standinSlots !== (imagePlan.declaredEmpty || []).length) problem('image-slot-count', visibleRefusedSlots + ' refused visible slots - ' + standinSlots + ' stand-in slots != ' + (imagePlan.declaredEmpty || []).length + ' declaredEmpty');
const IMAGE_GROUPS = {
  vendorAssets: { key: 'img-vendor-assets', decision: 'REMOVE', comps: ['B.19'], slot: 'footer', why: (v) => 'REMOVE (audit/clone-removals.json images.vendorAssets): the former platform vendor\'s own image files ' + v.join(', ') + ' (its "Powered by" logo and its theme\'s review-quote.png, served from eyecarepro.net per audit/image-inventory.json); no replacement image.' },
  platformUi: { key: 'img-platform-ui', decision: 'REMOVE', comps: ['0.7', 'B.25', 'B.30'], slot: 'footer', why: (v) => 'REMOVE (audit/clone-removals.json images.platformUi): ' + v.length + ' platform UI images (icon SVGs, form sprites and spinners, ribbons, snowflakes, the platform 404 illustration, the EyeGlass Guide badge: ' + v.slice(0, 8).join(', ') + ', ...); icons come from the one inline sprite (COMPONENTS 0.7), the forms and the 404 need none.' },
  refusedPlaceholders: { key: 'img-refused-placeholders', decision: 'REPLACE', comps: ['B.10', 'B.12', 'B.27'], slot: 'trust-positioning', why: (v) => 'REPLACE (audit/clone-removals.json images.refusedPlaceholders; BUILD-NOTES IM-1): ' + v.files.length + ' files (portraits of 5 people and the Bajio campaign image), ' + v.why + '. They render as 11 placeholder slots on 7 pages (DESIGN-SPEC G9: the iris-ring monogram plate with the person\'s name, role="img", data-needs="practice photo"; the Bajio brand cell sets the brand name in type). The initials on the plates are a declared derived addition drawn by CSS from data-initials (Q-7). No generated face or brand image ever fills a slot; the practice\'s photos replace the plates as delivered.' },
  refusedSiblings: { key: 'img-refused-siblings', decision: 'REPLACE', comps: ['B.22', 'B.9'], slot: 'benefits-solution', why: (v) => 'REPLACE (audit/clone-removals.json images.refusedSiblings; BUILD-NOTES IM-1): ' + v.length + ' refused files are shown through an on-disk sibling size of the same image (' + v.slice(0, 4).join('; ') + ', ...). Same picture, another file.' },
  refusedDropped: { key: 'img-refused-dropped', decision: 'REMOVE', comps: ['B.22', 'F.2'], slot: 'benefits-solution', why: (v) => 'REMOVE (audit/clone-removals.json images.refusedDropped; BUILD-NOTES IM-1): ' + v.files.length + ' files, ' + v.why + '. ' + visibleRefusedSlots + ' of them were visible slots, declared per page in images.droppedOnPages; the other ' + (v.files.length - visibleRefusedSlots) + ' were references with no visible slot (BUILD-NOTES IM-1: social-only). Generated stand-ins fill ' + standinSlots + ' of the ' + visibleRefusedSlots + ' visible slots (their own imagery ADD row); the rest stay omitted and declared (image-plan.json declaredEmpty).' },
  droppedOnPages: null,   // per-page detail of platformUi and refusedDropped (and the superseded hero layer): cross-checked below, no row of its own
  added: null,            // per-page placements (model.art) of the imagery ADD rows: cross-checked with them below, no row of its own
  altsBlanked: { key: 'img-alts-blanked', decision: 'IMPROVE', comps: (v) => ['B.22', 'F.2', 'B.7', ...((v.onPages || []).some((x) => x.where === 'title-arch') ? ['B.21'] : [])], slot: 'benefits-solution', why: (v) =>'IMPROVE (audit/clone-removals.json images.altsBlanked): ' + v.why + ' Blanked on ' + v.onPages.length + ' image slots (' + uniq(v.onPages.map((x) => x.page)).length + ' pages), among them the home AlumierMD logo (DESIGN-SPEC Q-5). No alt text is authored.' },
};
for (const [k, v] of Object.entries(IMG)) {
  if (!(k in IMAGE_GROUPS)) { problem('removal-group-unmapped', 'images.' + k); continue; }
  const g = IMAGE_GROUPS[k];
  if (!g) continue;
  const n = Array.isArray(v) ? v.length : v && (v.files || v.onPages) ? (v.files || v.onPages).length : 0;
  if (!n) continue;
  addRow({ key: 'rm-' + g.key, group: 'removal', decision: g.decision, slot: g.slot, comps: typeof g.comps === 'function' ? g.comps(v) : g.comps, label: 'clone-removals images.' + k + ' (' + n + ')', why: g.why(v) });
}
for (const d of IMG.droppedOnPages || []) {
  const base = imgBase(d.src);
  const inUi = (IMG.platformUi || []).includes(base);
  const inDropped = ((IMG.refusedDropped || {}).files || []).includes(base);
  const superseded = SUPERSEDED_DROPS.includes(d) && d.page === '/' && /\bQ-6\b/.test(d.why);   // the dsn-hero-phone-file row (DESIGN-SPEC Q-6)
  if (!inUi && !inDropped && !superseded) problem('removal-image-unmapped', 'droppedOnPages ' + d.page + ' ' + base + ' is in neither platformUi nor refusedDropped nor a declared Q-6 superseded layer');
}
if ((removals.documents || []).length) addRow({ key: 'rm-documents', group: 'removal', decision: 'REPLACE', slot: 'footer', comps: ['B.31'], primaryBlock: 'docs', url: removals.documents[0].page,
  label: 'clone-removals documents (' + removals.documents.length + ')',
  why: 'REPLACE (audit/clone-removals.json documents): ' + removals.documents.map((d) => d.page + ': ' + d.why).join('; ') + '. The docs item prints its label in a span with data-needs="pdf file" (COMPONENTS B.31 docs): no invented link, until the practice supplies the file.' });
if ((removals.videoPosters || []).length) addRow({ key: 'rm-video-posters', group: 'removal', decision: 'REMOVE', slot: 'benefits-solution', comps: ['B.22'], url: removals.videoPosters[0].page,
  label: 'clone-removals videoPosters (' + removals.videoPosters.length + ')',
  why: 'REMOVE (audit/clone-removals.json videoPosters): ' + removals.videoPosters.length + ' video poster images are not in the harvest (' + uniq(removals.videoPosters.map((d) => d.page)).join(', ') + '); the self-hosted videos render without a poster (a CSS poster, no invented frame; COMPONENTS B.22). Extracting posters with ffmpeg is the optional P6.' });
const HANDLED_KEYS = new Set(['schema', 'note', 'elements', 'strings', 'replacements', 'sentences', 'vendorClauses', 'images', 'documents', 'videoPosters', 'prosePlatformNames']);
for (const [k, v] of Object.entries(removals)) if (!HANDLED_KEYS.has(k) && v && (Array.isArray(v) ? v.length : typeof v === 'object')) problem('removal-group-unmapped', k);
if ((removals.prosePlatformNames || []).length) problem('removal-group-unmapped', 'prosePlatformNames holds ' + removals.prosePlatformNames.length + ' entries and has no row rule');

// (2) one ADD row per generated-imagery kind (image-plan.json roles; IMAGE-PLAN.md)
const ROLE_KIND = { 'title-arch': 'title-arches', 'inline-figure': 'inline-illustrations', 'stand-in': 'stock-stand-ins', 'hero-video-still': 'hero-light', 'hero-cutout': 'home-art', 'home-feature': 'home-art', 'graft-cutout': 'home-art', 'graft-source': 'home-art' };
const byKind = {};
for (const im of imagePlan.images || []) {
  const kind = ROLE_KIND[im.role];
  if (!kind) { problem('image-role-unmapped', im.id + ' role ' + im.role); continue; }
  (byKind[kind] = byKind[kind] || []).push(im);
}
const generatedIds = new Set((generatedImages.images || []).map((x) => x.id));
const usedPages = (ims) => uniq(ims.flatMap((im) => (im.usedFor || []).map((u) => (typeof u === 'string' ? u : u.page || u.path)).filter((p) => typeof p === 'string' && p.startsWith('/'))));
// The model.art placements the build declares (audit/clone-removals.json images.added, wf5b P4): each is an image of an
// imagery ADD row below or a real-photo arch the plan names but does not generate (image-plan.json
// notPlannedHere.realImages). null when the build places no art yet: the rows then say so.
const ADDED_IMG = IMG.added && Array.isArray(IMG.added.onPages) ? IMG.added.onPages : null;
const REAL_ARCHES = ['TB-contact', 'TB-team'];
const placed = {}, placedPages = {}, placedReplacing = {};   // kind -> { id -> n } | [pages] | n with `replaces`
if (ADDED_IMG) {
  for (const id of REAL_ARCHES) if (!String((imagePlan.notPlannedHere || {}).realImages || '').includes(id)) problem('image-real-arch-unknown', id + ' is not named in image-plan.json notPlannedHere.realImages');
  const kindOfId = new Map((imagePlan.images || []).map((im) => [im.id, ROLE_KIND[im.role]]));
  const SLOT_OF = { 'title-arches': /^title-arch$/, 'real-arches': /^title-arch$/, 'inline-illustrations': /^inline$/, 'stock-stand-ins': /^inline$/, 'home-art': /^home:/ };
  for (const a of ADDED_IMG) {
    const kind = REAL_ARCHES.includes(a.id) ? 'real-arches' : kindOfId.get(a.id);
    if (!kind || !SLOT_OF[kind]) { problem('image-added-unmapped', 'images.added ' + a.page + ' ' + a.slot + ' ' + a.id + ' is no image of an imagery row'); continue; }
    if ((kind === 'real-arches') === (a.ai === true)) problem('image-added-ai-flag', 'images.added ' + a.page + ' ' + a.id + ' ai ' + a.ai);
    if (!SLOT_OF[kind].test(String(a.slot))) problem('image-added-slot', 'images.added ' + a.page + ' ' + a.id + ' in slot ' + a.slot);
    (placed[kind] = placed[kind] || {})[a.id] = (placed[kind][a.id] || 0) + 1;
    (placedPages[kind] = placedPages[kind] || []).push(a.page);
    if (a.replaces) placedReplacing[kind] = (placedReplacing[kind] || 0) + 1;
  }
  if (IMG.added.count !== ADDED_IMG.length) problem('image-added-count', 'images.added count ' + IMG.added.count + ' vs ' + ADDED_IMG.length + ' entries');
}
const placedSum = (kind) => Object.values(placed[kind] || {}).reduce((n, x) => n + x, 0);
const placedList = (kind) => Object.entries(placed[kind] || {}).map(([id, n]) => id + ' ' + n).join(', ');
{
  // title arches: IMAGE-PLAN 4 counts; the generated ones must add up to DESIGN-SPEC Q-8's figure
  const sec4 = sectionOf(IMAGE_PLAN_MD, '## 4. ') || '';
  const archRows = [...sec4.matchAll(/^\|\s*(TB-[A-Za-z]+)[^|]*\|\s*(generated|real[^|]*?)\s*\|\s*(\d+)/gm)].map((x) => ({ id: x[1], generated: x[2] === 'generated', what: x[2].replace(/:.*$/, '').trim(), models: Number(x[3]) }));
  const gen = archRows.filter((x) => x.generated), real = archRows.filter((x) => !x.generated);
  const genSum = gen.reduce((n, x) => n + x.models, 0);
  const q8 = (DESIGN_SPEC_MD.match(/title arches on (\d+) page models/) || [])[1];
  if (!archRows.length || String(genSum) !== q8) problem('image-arch-count', 'IMAGE-PLAN 4 generated arches sum ' + genSum + ', DESIGN-SPEC Q-8 says ' + q8);
  if (ADDED_IMG) for (const x of gen) if (((placed['title-arches'] || {})[x.id] || 0) !== x.models) problem('image-arch-count', x.id + ': IMAGE-PLAN 4 says ' + x.models + ' models, images.added places it on ' + ((placed['title-arches'] || {})[x.id] || 0));
  const ids = (byKind['title-arches'] || []).map((x) => x.id);
  addRow({ key: 'img-title-arches', group: 'imagery', decision: 'ADD', slot: 'value-proposition', comps: ['B.21'],
    label: 'Generated title-arch defaults (' + ids.join(', ') + ')',
    why: 'ADD (IMAGE-PLAN 2, 3.2 and 4; DESIGN-SPEC 3.21): generated section-default images in the title-band arch of ' + genSum + ' page models: ' + gen.map((x) => x.id + ' ' + x.models).join(', ') + ' (image-plan.json title-arch ids ' + ids.join(', ') + '; TB-contacts is the N3 image). Decorative, alt="", AI-labelled (IPTC trainedAlgorithmicMedia, P7). The other ' + real.reduce((n, x) => n + x.models, 0) + ' arches are not generated (IMAGE-PLAN 4: ' + real.map((x) => x.id + ' ' + x.models + ', ' + x.what).join('; ') + ').' +
      (ADDED_IMG ? ' Placed through model.art.title (P4): audit/clone-removals.json images.added records ' + placedSum('title-arches') + ' generated arch placements (' + placedList('title-arches') + ') and ' + placedSum('real-arches') + ' real-photo arches (' + placedList('real-arches') + ').'
        : ' Placed through model.art.title (P4), which the models do not carry yet (COMPONENTS 0.12): until then those bands print no arch.') });
}
const IMAGE_FRAME = '00-top12-7-image-zoom-inside-a-clipped-frame-on-hover-mask-caption-rise';   // a figure in its frame
{
  const ims = byKind['inline-illustrations'] || [];
  addRow({ key: 'img-inline-illustrations', group: 'imagery', decision: 'ADD', slot: 'benefits-solution', comps: ['D.6', 'B.22'], url: usedPages(ims)[0], preset: IMAGE_FRAME,
    label: 'Generated inline illustration (' + ims.map((x) => x.id).join(', ') + ')',
    why: 'ADD (IMAGE-PLAN 2 A1; DESIGN-SPEC 3.22 "added illustration"): ' + ims.map((x) => x.id).join(', ') + ', the generated florida-light image (the TB-blog master, reused), as a wide figure on ' + usedPages(ims).join(', ') + ' after the paragraph that ends "...can worsen dry eye symptoms."; decorative, alt="", AI-labelled.' +
      (ADDED_IMG ? ' Placed through model.art.inline (P4): audit/clone-removals.json images.added records ' + placedList('inline-illustrations') + ' on ' + uniq(placedPages['inline-illustrations'] || []).join(', ') + '.' : ' Placed through model.art.inline (P4, not in the models yet).') });
  if (ADDED_IMG && JSON.stringify(uniq(placedPages['inline-illustrations'] || []).sort()) !== JSON.stringify(usedPages(ims).slice().sort())) problem('image-added-pages', 'inline illustrations: images.added pages differ from image-plan.json usedFor');
}
{
  const ims = byKind['stock-stand-ins'] || [];
  const pages = usedPages(ims);
  const dropped = (imagePlan.dropped || []).map((d) => d.id);
  const missing = ims.filter((im) => !generatedIds.has(im.id)).map((x) => x.id);
  if (missing.length) problem('image-not-generated', 'stand-ins in the plan with no generated record: ' + missing.join(', '));
  if (ims.length !== STANDINS.length) problem('image-role-unmapped', 'stand-in count differs');
  addRow({ key: 'img-stock-stand-ins', group: 'imagery', decision: 'ADD', slot: 'benefits-solution', comps: ['B.22', 'F.2'], preset: IMAGE_FRAME,
    label: 'Generated stand-ins for refused stock images (' + ims.map((x) => x.id).join(', ') + ')',
    why: 'ADD (IMAGE-PLAN 3.3; DESIGN-SPEC Q-8): ' + ims.length + ' generated stand-ins (' + ims.map((x) => x.id).join(', ') + ') fill ' + standinSlots + ' of the ' + visibleRefusedSlots + ' refused visible stock slots on ' + listPages(pages) + ', each where the source had its image (inline figures and two hub thumbnails), each with a literal alt describing what it shows (never the refused photo\'s alt), AI-labelled. Dropped after three failed generations: ' + (dropped.join(', ') || 'none') + '; its slot and the dry-eye banner slot stay omitted and declared (image-plan.json declaredEmpty: ' + (imagePlan.declaredEmpty || []).length + ').' +
      (ADDED_IMG ? ' Placed through model.art.inline (P4): audit/clone-removals.json images.added records ' + placedSum('stock-stand-ins') + ' placements (' + placedList('stock-stand-ins') + '), ' + (placedReplacing['stock-stand-ins'] || 0) + ' of them naming the declared-dropped source image they stand in for (`replaces`).' : ' Placed through model.art.inline (P4, not in the models yet).') });
  if (ADDED_IMG && placedSum('stock-stand-ins') !== standinSlots) problem('image-added-count', 'stand-ins: images.added places ' + placedSum('stock-stand-ins') + ', image-plan.json usedFor names ' + standinSlots + ' slots');
}
{
  const ims = byKind['hero-light'] || [];
  const clips = (generatedMedia.clips || []).map((x) => x.id || x.name);
  if (!clips.length) problem('image-not-generated', 'no Higgsfield clip in audit/generated-media.json');
  addRow({ key: 'img-hero-light', group: 'imagery', decision: 'ADD', slot: 'value-proposition', comps: ['B.4', 'B.21'], preset: '00-top12-12-ambient-depth-behind-the-hero-glow-blobs-duotone-wash',
    label: 'Generated hero light (' + ims.map((x) => x.id).join(', ') + ' + clip ' + clips.join(', ') + ')',
    why: 'ADD (IMAGE-PLAN 7; DESIGN-SPEC A3, U3): the hero light behind the home hero: the generated still ' + ims.map((x) => x.id).join(', ') + ' animated by one Higgsfield image-to-video clip (' + clips.join(', ') + ', audit/generated-media.json) into the hero-river loop; poster first, the video created by script after load, never autoplay in the markup, skipped for reduced motion, Save-Data and slow connections, paused off screen. The poster is also the static title-band still (A6) on every band (no loop on interiors, U3). Decorative, alt="", AI label in the container tags and the posters\' XMP.' });
}
{
  const ims = byKind['home-art'] || [];
  const shipped = ims.filter((x) => x.role !== 'graft-source').map((x) => x.id), src = ims.filter((x) => x.role === 'graft-source').map((x) => x.id);
  addRow({ key: 'img-home-art', group: 'imagery', decision: 'ADD', slot: 'value-proposition', comps: ['B.4', 'B.13', 'B.9'], preset: '01-transitions-hero-motion-11-your-product-floating',
    label: 'Generated home art (' + shipped.join(', ') + ')',
    why: 'ADD (IMAGE-PLAN 2 H1, H2; 3.4 H3; DESIGN-SPEC 3.4, 3.9, 3.13): ' + ims.map((x) => x.id + ' (' + x.role + ')').join(', ') + ': the de-riveted navy glasses cut-out crossing the hero frame (protrusion 1), the lens in the cataract arch frame crossing into Eye Emergencies (protrusion 9), and the optional kids\' glasses cut-out on the Back-to-School callout (G19, shipped only if it passes review, Q-15); ' + (src.join(', ') || 'no') + ' is its source and is never shipped. Decorative, alt="", AI-labelled.' +
      (ADDED_IMG ? ' Placed through model.art.home (P4): audit/clone-removals.json images.added records ' + placedList('home-art') + ' on ' + uniq(placedPages['home-art'] || []).join(', ') + '.' : ' Placed through model.art.home (P4 and COMPONENTS gap I.11, not in the models yet).') });
  if (ADDED_IMG && Object.keys(placed['home-art'] || {}).some((id) => !shipped.includes(id))) problem('image-added-unmapped', 'home art: images.added places an id that is not a shipped home image: ' + placedList('home-art'));
}
// (3) dist/404.html
if (!model404) problem('evidence-missing', 'no as404 page model (404.json)');
if (!fs.existsSync(abs('dist/404.html'))) problem('evidence-missing', 'dist/404.html does not exist');
addRow({ key: 'add-404-html', group: '404', decision: 'ADD', slot: 'footer', comps: ['B.30'],
  label: 'dist/404.html',
  why: 'ADD: dist/404.html is a build page with no source page: the /404-page-not-found/ content (h1 "404", its 3 prose sections) at depth 0 for a host\'s not-found handler (model 404.json: as404 ' + !!(model404 && model404.as404) + ', aside ' + JSON.stringify(model404 && model404.aside) + ', breadcrumbs ' + JSON.stringify(model404 && model404.breadcrumbs) + '), noindex (BUILD-NOTES 4 decision 1); no aside (COMPONENTS gap I.8); the build rewrites its URLs root-relative under the deploy base (RFEC_BASE, default /), so it is styled and its links work at any missing path (COMPONENTS A.1, B.30).' });
// (4) design-level rows (DESIGN-SPEC grafts and declared departures that add or replace a component)
const h1Repairs = seoRepairs.h1 || [];
const C01 = (chrome.changes || []).find((x) => x.id === 'C01');
if (!C01) problem('evidence-missing', 'chrome.json changes C01');
const CALL = (chrome.topbar && chrome.topbar.call) || {};
if (!CALL.label || !/^tel:/.test(CALL.href || '')) problem('evidence-missing', 'chrome.json topbar.call');
const LIFT_PAGES = uniq([...ctxById.values()].filter((c) => c.liftKey).map((c) => c.path)).sort();
const HOME_REVIEWS = (() => {
  const home = models.get('/');
  const b = home && (home.sections || []).flatMap((s) => s.blocks || []).find((x) => x.type === 'reviews');
  if (!b || !(b.items || []).length) { problem('evidence-missing', 'no reviews block in the home model'); return 0; }
  return b.items.length;
})();
const DESIGN = [
  { key: 'dsn-title-band', decision: 'ADD', slot: 'value-proposition', comps: ['B.21', 'B.20'],
    label: 'Interior title band (148 page models)',
    why: 'ADD (DESIGN-SPEC 3.21, G5; COMPONENTS B.21, C.2): the source has no title band (SITE-ARCHITECTURE 6.1: the h1 sits at the top of the content column). Every page but the home gets one: the glass pane with the breadcrumbs (B.20, the source trail and its " » " separators), the h1, the post date (21 posts) and the position chip (G18), the arch frame crossing the bank, the light still. The h1, crumbs, dates and positions are the source\'s own values, moved; the arch images are their own imagery ADD row.' },
  { key: 'dsn-sticky-location-card', decision: 'ADD', slot: 'strategic-cta', comps: ['B.23'],
    label: 'Sticky location and hours card (DESIGN-SPEC G1)',
    why: 'ADD (DESIGN-SPEC graft G1, 3.23; COMPONENTS B.23): on tall desktops ((min-width: 1024px) and (min-height: 860px)) the aside stretches to the article\'s height and the location card (phone, hours, address) is position: sticky, so the practice\'s contact actions stay in view on long pages; CSS only, no new words. Pages without a CTA band rely on it and the footer for the actions (DESIGN-SPEC 3.24).' },
  { key: 'dsn-mobile-drawer', decision: 'REPLACE', slot: 'footer', comps: ['B.2'], preset: '09-accessibility-d-modal-6-keyboard-operable-modal-dialog-apg-modal-dialog',
    label: 'Phone menu as a native dialog drawer (DESIGN-SPEC G2, G3, G15)',
    why: 'REPLACE (DESIGN-SPEC grafts G2, G3, G15; 3.2; COMPONENTS B.2): the platform\'s phone menu (its hamburger copy of the menu tree and the "Return to top of menu" focus trap, removed: own REMOVE row) becomes one native <dialog> drawer opened with showModal() (page inert, Escape closes, focus returns to the toggle), with accordion sub-menus and 44x44 toggles (G3), and the main nav gets a lavender pill and a drawn underline on hover, focus and current (G15). Every label and target comes from chrome.json, unchanged; the drawer repeats the chrome "Request Appointment" and phone actions.' },
  { key: 'dsn-decorative-depth', decision: 'ADD', slot: 'value-proposition', comps: ['1.8', 'A.3'],
    label: 'Aurora field, river and banks (DESIGN-SPEC 1, 2.8, G6, G10)',
    why: 'ADD (DESIGN-SPEC 1 and 2.8 A1/A2, grafts G6 and G10; COMPONENTS 1.8, A.3): decorative depth layers the source does not have: the fixed aurora field, the one river of light drawn under and over chosen frames (static SVG built after load, no river without JavaScript), banks drawn with the logo\'s teal-over-navy double stroke at band edges (G6), and per-band scroll progress (G10). All aria-hidden, hidden in forced colours, no words.' },
  { key: 'dsn-prose-enhancers', decision: 'IMPROVE', slot: 'benefits-solution', comps: ['D.6', 'B.22'],
    label: 'Prose enhancers: lead, checklist panels, treatment cards (DESIGN-SPEC G7)',
    why: 'IMPROVE (DESIGN-SPEC graft G7, 3.22; COMPONENTS D.6): deterministic template treatments of existing long-form content, text untouched: the lead paragraph (a first p wholly in strong), checklist panels (an h3 sub-section with a list of 6 or more short items), treatment cards with a teal left border (a run of 3 or more h3 sub-sections inside one h2 section) and two-column short lists.' },
  { key: 'dsn-cta-call-action', decision: 'ADD', slot: 'strategic-cta', comps: ['B.24'],
    label: 'CTA band call action (DESIGN-SPEC Q-2)',
    why: 'ADD (DESIGN-SPEC Q-2, 3.24; COMPONENTS B.24, 0.9): on the ' + LIFT_PAGES.length + ' pages whose closing block becomes the CTA band (' + LIFT_PAGES.join(', ') + '), the band adds the chrome call action "' + CALL.label + '" (' + CALL.href + ') beside the block\'s own appointment button. A repeat of chrome.topbar.call, declared: no new words.' },
  { key: 'dsn-sidebar-map-card', decision: 'REPLACE', slot: 'footer', comps: ['B.23', 'F.8'],
    label: 'Sidebar map as a static "Open in Google Maps" card (DESIGN-SPEC Q-11)',
    why: 'REPLACE (DESIGN-SPEC Q-11, 3.23; COMPONENTS B.23): the sidebar\'s Google map iframe (on every standard-aside page) becomes a static link card to the same Google Maps query (its label "Open in Google Maps" is the chrome mapsLinkLabel, declared authored); the live, lazy, keyless map stays only on /hours-location/ and /location/riverside-family-eyecare/ (F.8). No third-party request on load.' },
  { key: 'dsn-tel-uri', decision: 'REPLACE', slot: 'strategic-cta', comps: ['B.1'],
    label: 'Top-bar call button tel: URI (chrome.json C01)',
    why: 'REPLACE (src/content/chrome.json change C01): ' + (C01 ? C01.what : '') + '. Label unchanged.' },
  { key: 'dsn-nonvisible-labels', decision: 'ADD', slot: 'footer', comps: ['0.9'],
    label: 'Non-visible accessibility labels (COMPONENTS 0.9)',
    why: 'ADD (COMPONENTS 0.9; DESIGN-SPEC 8; chrome.json authored): accessible names with no visible copy: the nav labels "Main", "Breadcrumb", "Footer", "Mobile", the drawer "Menu", the reviews dot group "Reviews", "{n} out of 5 stars", "Show review {n} of {N}", the slide labels "{n} of {N}", the hero video toggle labels, "{label} submenu", and the chrome logo.homeLabel. Declared; no visible text.' },
  { key: 'dsn-hero-phone-file', decision: 'REPLACE', slot: 'value-proposition', comps: ['B.4'],
    label: 'Home hero phone background file superseded (DESIGN-SPEC Q-6)',
    why: 'REPLACE (DESIGN-SPEC Q-6, 3.4; COMPONENTS B.4): the hero row\'s phone-only background file (1190x496) is superseded by a 4:3 crop of the 1920 px desktop photo of the same scene at every width. ' +
      (SUPERSEDED_DROPS.length ? 'Declared in audit/clone-removals.json images.droppedOnPages (COMPONENTS gap I.6): ' + SUPERSEDED_DROPS.map((d) => d.page + ' ' + imgBase(d.src)).join(', ') + ', "' + String(SUPERSEDED_DROPS[0].why).split(':')[0] + '".'
        : 'COMPONENTS B.4 / gap I.6: the pipeline must still declare it in audit/clone-removals.json before keep-image-parity can pass (not declared there yet).') },
  { key: 'dsn-reviews-carousel', decision: 'REPLACE', slot: 'social-proof', comps: ['B.15'], reviews: 'the 5 real patient reviews of the home ReviewsModule (home model s14 reviews block)',
    label: 'Home reviews carousel (source Splide ReviewsModule, 5 real reviews)',
    why: 'REPLACE (DESIGN-SPEC 3.15; COMPONENTS B.15): the home\'s Splide ReviewsModule (source row 15: ' + HOME_REVIEWS + ' real patient reviews, autoplay off; its heading "Read Our Patient Reviews" is a div at source, so it has no ledger row of its own and sits in the Eye Emergencies row\'s span) becomes the Riverlight reviews carousel: the staff photo with the glass panel over its edge, a scroll-snap track with no autoplay, dot buttons, stars as SVG icons labelled "5 out of 5 stars", times verbatim inside <time datetime> (frozen at the crawl date, Q-3), names verbatim with their dashes, then "Read Google Reviews". Every review verbatim; no review added.' },
  { key: 'dsn-inert-forms', decision: 'REPLACE', slot: 'strategic-cta', comps: ['B.25', 'E.1'],
    label: 'Forms without a backend (BUILD-NOTES 4 decision 5)',
    why: 'REPLACE (BUILD-NOTES 4 decision 5, PORT-NOTES FM-1; DESIGN-SPEC 3.25): the 2 Gravity Forms posted to the platform\'s WordPress backend; rebuilt field for field they are inert (data-needs-backend="form endpoint") until an endpoint with its own spam protection is decided; no notice is authored (open decision). Wiring the backend is a launch task.' },
  { key: 'dsn-h1-repairs', decision: 'ADD', slot: 'value-proposition', comps: ['B.21'],
    label: 'h1 on the ' + h1Repairs.length + ' pages with none at source (audit/seo-repairs.json h1)',
    why: 'ADD (audit/seo-repairs.json h1; BUILD-NOTES HD-1): ' + h1Repairs.length + ' pages have no h1 at source; their band h1 is the page\'s own label or <title>, never authored: ' + h1Repairs.map((x) => x.page + ' "' + x.h1 + '" (' + x.source + ')').join(', ') + '.' },
];
for (const d of DESIGN) addRow({ ...d, group: 'design' });

const ADDED_ROWS = ADDED.map((r, i) => ({ ...r, id: HOST + '/#ledger-' + r.key, url: r.url ? ORIGIN + r.url : ORIGIN + '/', index: 1000 + i }));
{
  const seen = new Set(); const crawlIds = new Set(ledger0.rows.filter((r) => r.sourceTag !== 'ledger-added').map((r) => r.id));
  for (const r of ADDED_ROWS) { if (seen.has(r.id)) problem('added-id-duplicate', r.id); if (crawlIds.has(r.id)) problem('added-id-collides', r.id); seen.add(r.id); }
}

/* ---------------------------------------------------------------- the plan */
const DECISIONS = ['PRESERVE', 'IMPROVE', 'REPLACE', 'REMOVE', 'ADD'];
const SLOTS = new Map((ledger0.narrative || []).map((n) => [n.slot, n]));
if (!SLOTS.size) fatal('audit/change-control.json has no narrative list');
const addedById = new Map(ADDED_ROWS.map((r) => [r.id, r]));
const existingIds = new Set(ledger0.rows.map((r) => r.id));
const toInsert = ADDED_ROWS.filter((r) => !existingIds.has(r.id));
const planRows = [...ledger0.rows, ...toInsert.map((r) => ({ id: r.id, sourceTag: 'ledger-added', url: r.url, label: r.label }))];
const plan = [];
for (const row of planRows) {
  const a = addedById.get(row.id);
  if (row.sourceTag === 'ledger-added') {
    if (!a) { problem('stale-added-row', row.id + ' is in the ledger as ledger-added but no rule defines it'); continue; }
    const comps = uniq(a.comps);
    plan.push({ id: row.id, crawl: false, family: 'ledger-added', group: a.group, rule: 'added:' + a.key, decision: a.decision, slot: a.slot,
      comps, rebuiltAs: comps.map(compName).join(' + '), preset: presetFor(comps, a.primaryBlock, a.preset), why: a.why,
      label: a.label, evidence: { group: a.group, reviews: a.reviews || null, faq: a.faq || null } });
    continue;
  }
  const c = ctxById.get(row.id);
  if (!c) { problem('uncovered', row.id + ' (no page context)'); continue; }
  if (c.role === 'unaligned') { problem('uncovered', row.id + ' (unaligned)'); continue; }
  const rule = RULES.find((x) => x.test(c));
  if (!rule) { problem('uncovered', row.id + ' family ' + c.family + ' role ' + c.role + ' label ' + JSON.stringify(c.label)); continue; }
  if (rule.needsTel && !c.span.some((e) => /href="tel:/.test((e.block && e.block.html) || ''))) problem('rule-evidence', rule.id + ' ' + row.id + ': no tel: link in the span');
  const comps = uniq(typeof rule.comps === 'function' ? rule.comps(c) : rule.comps);
  const primaryBlock = rule.primaryBlock || firstBlockOf(c, ['logos', 'badges', 'cta', 'cherry', 'docs']);
  const m = matcherByRow.get(row.id);
  plan.push({
    id: row.id, crawl: true, family: c.family, rule: rule.id, decision: rule.decision,
    slot: typeof rule.slot === 'function' ? rule.slot(c) : rule.slot,
    comps, rebuiltAs: comps.map(compName).join(' + '), preset: presetFor(comps, primaryBlock, rule.preset),
    why: typeof rule.why === 'function' ? rule.why(c) : rule.why, label: c.label,
    evidence: { path: c.path, family: c.family, pageType: c.r.pageType, index: c.r.index, role: c.role, headingFrom: c.headFrom, headingSection: c.headSec,
      span: c.span.map((e) => e.key + ':' + e.type + (e.block && e.block.variant ? '(' + e.block.variant + ')' : '') + (e.block && e.block.view ? '(' + e.block.view + ')' : '')),
      spanSections: c.spanSections, ctaLift: c.ctaLift, faq: c.faq, reviews: c.reviews },
    matcher: m ? { status: m.status, best: m.candidates && m.candidates[0] ? m.candidates[0].presetId : null, rate: m.rate ?? null } : null,
  });
}

/* ---------------------------------------------------------------- validation */
for (const p of plan) {
  if (!DECISIONS.includes(p.decision)) problem('bad-decision', p.id + ' ' + p.decision);
  if (!SLOTS.has(p.slot)) problem('bad-slot', p.id + ' ' + p.slot);
  if ((p.decision === 'REMOVE' || p.decision === 'REPLACE') && !String(p.why || '').trim()) problem('why-missing', p.id);
  if (!String(p.why || '').trim()) problem('why-missing', p.id + ' (every row carries a why)');
  if (!p.comps.length || p.rebuiltAs.includes('?')) problem('component-unknown', p.id + ' ' + p.rebuiltAs);
  if (!KNOWN_PRESETS.has(p.preset)) problem('preset-unknown', p.id + ' ' + p.preset);
  for (const v of [p.id, p.decision, p.why, p.slot, p.rebuiltAs, p.preset]) if (/^--/.test(String(v))) problem('argv-unsafe', p.id + ': a value starts with "--"');
  if (p.slot === 'social-proof' && !p.evidence.reviews) problem('social-proof-without-reviews', p.id);
  if (p.slot === 'objection-handling' && !p.evidence.faq) problem('objection-handling-without-faq', p.id);
}
const mustSlots = {};
for (const n of ledger0.narrative) {
  const crawl = plan.filter((p) => p.crawl && p.slot === n.slot).length, added = plan.filter((p) => !p.crawl && p.slot === n.slot).length;
  mustSlots[n.slot] = { must: !!n.must, crawlRows: crawl, addedRows: added };
  if (n.must && !crawl) problem('must-slot-unfilled', n.slot + ' has no crawled row');
}
const crawlCount = ledger0.rows.filter((r) => r.sourceTag !== 'ledger-added').length;
const crawlPlanned = plan.filter((p) => p.crawl).length;
if (crawlPlanned !== crawlCount) problem('row-count', crawlPlanned + ' of ' + crawlCount + ' crawled rows planned');
// sr-match --answer batches (Windows command line limit ~32k; keep each under 20000 chars like the reference)
const BATCH_CHARS = 20000;
const batches = [];
{
  let cur = [], len = 0;
  for (const p of plan) { const s = p.id + '=' + p.preset; if (cur.length && len + s.length + 12 > BATCH_CHARS) { batches.push(cur); cur = []; len = 0; } cur.push(s); len += s.length + 12; }
  if (cur.length) batches.push(cur);
}

/* ---------------------------------------------------------------- summary */
const famOf = (p) => (p.crawl ? p.family : 'ledger-added:' + p.group);
const perFamily = {};
for (const p of plan) {
  const f = famOf(p);
  const e = perFamily[f] = perFamily[f] || { rows: 0, decisions: {}, slots: {} };
  e.rows++; e.decisions[p.decision] = (e.decisions[p.decision] || 0) + 1; e.slots[p.slot] = (e.slots[p.slot] || 0) + 1;
}
const summary = {
  rows: plan.length, crawlRows: crawlPlanned, addedRows: plan.length - crawlPlanned, addedByGroup: tally(plan.filter((p) => !p.crawl), (p) => p.group),
  wouldInsert: toInsert.length, perDecision: tally(plan, (p) => p.decision), perSlot: tally(plan, (p) => p.slot), mustSlots, perFamily,
  perRule: tally(plan, (p) => p.rule), roles: tally(plan.filter((p) => p.crawl), (p) => p.evidence.role),
  socialProofRows: plan.filter((p) => p.slot === 'social-proof').map((p) => p.id),
  objectionHandlingRows: plan.filter((p) => p.slot === 'objection-handling').map((p) => p.id),
  componentsUsed: tally(plan.flatMap((p) => p.comps), (x) => x), presetsUsed: tally(plan, (p) => p.preset),
  matcher: { file: MATCHER_FILE, verdict: { matched: matcher.matched, undecided: matcher.undecided, unmeasurable: matcher.unmeasurable, rowCount: matcher.rowCount },
    statuses: tally(matcher.rows || [], (r) => r.status), overriddenMatches: plan.filter((p) => p.matcher && p.matcher.status === 'MATCHED' && p.matcher.best !== p.preset).length,
    answersPlanned: plan.length, batches: batches.length },
};
const rulesDoc = {
  schema: 'rfec/ledger-rules@1', tool: 'tools/ledger-decide.mjs',
  componentPresets: Object.fromEntries(Object.entries(COMPONENT_PRESET).map(([k, [v, why]]) => [k, { name: COMP.get(k) || null, preset: v, why }])),
  blockPresets: BLOCK_PRESET,
  rules: RULES.map((r) => ({ id: r.id, decision: r.decision, slot: typeof r.slot === 'function' ? 'computed' : r.slot,
    comps: typeof r.comps === 'function' ? 'computed from the span' : r.comps, why: typeof r.why === 'function' ? '(computed per row)' : r.why, rows: summary.perRule[r.id] || 0 })),
  added: ADDED_ROWS.map(({ id, key, group, decision, slot, label }) => ({ id, key, group, decision, slot, label })),
  summary,
};

if (DRY) {
  const out = {
    schema: 'rfec/ledger-decide-dry-run@1', generated: new Date().toISOString(), mode: 'dry',
    writes: [path.relative(ROOT, DRY_OUT).split(path.sep).join('/')], inputs: inputHashes,
    problems, summary, rules: rulesDoc.rules, componentPresets: rulesDoc.componentPresets, blockPresets: BLOCK_PRESET,
    added: ADDED_ROWS.map(({ id, key, group, decision, slot, label, url }) => ({ id, key, group, decision, slot, label, url })),
    table: plan.map((p) => ({ id: p.id, decision: p.decision, slot: p.slot, rebuiltAs: p.rebuiltAs, preset: p.preset, rule: p.rule, why: p.why, label: p.label, evidence: p.evidence, matcher: p.matcher || null })),
  };
  fs.mkdirSync(path.dirname(DRY_OUT), { recursive: true });
  fs.writeFileSync(DRY_OUT, JSON.stringify(out, null, 1) + '\n');
  const line = (k, o) => console.log(k.padEnd(14) + Object.entries(o).sort((a, b) => b[1] - a[1]).map(([x, n]) => x + ' ' + n).join(' | '));
  console.log('ledger-decide --dry: ' + summary.rows + ' rows (' + summary.crawlRows + ' crawled + ' + summary.addedRows + ' added: ' + Object.entries(summary.addedByGroup).map(([g, n]) => g + ' ' + n).join(', ') + '; ' + summary.wouldInsert + ' would be inserted)');
  line('decisions', summary.perDecision);
  line('slots', summary.perSlot);
  console.log('must slots    ' + Object.entries(mustSlots).filter(([, v]) => v.must).map(([s, v]) => s + ' ' + v.crawlRows + ' crawled + ' + v.addedRows + ' added').join(' | '));
  line('crawl roles', summary.roles);
  console.log('families');
  for (const [f, e] of Object.entries(perFamily).sort((a, b) => b[1].rows - a[1].rows)) console.log('  ' + f.padEnd(28) + String(e.rows).padStart(4) + '  ' + Object.entries(e.decisions).map(([d, n]) => d + ' ' + n).join(', ') + '  |  ' + Object.entries(e.slots).map(([s, n]) => s + ' ' + n).join(', '));
  console.log('rules');
  for (const r of RULES) console.log('  ' + r.id.padEnd(22) + String(summary.perRule[r.id] || 0).padStart(4) + '  ' + r.decision.padEnd(8) + ' ' + (typeof r.slot === 'function' ? 'computed' : r.slot));
  for (const a of ADDED_ROWS) console.log('  ' + ('added:' + a.key).padEnd(40) + ' ' + a.decision.padEnd(8) + ' ' + a.slot);
  console.log('matcher       verdict ' + summary.matcher.verdict.matched + ' matched / ' + summary.matcher.verdict.undecided + ' undecided / ' + summary.matcher.verdict.unmeasurable + ' unmeasurable; ' + summary.matcher.answersPlanned + ' answers in ' + batches.length + ' batches; matcher picks overridden ' + summary.matcher.overriddenMatches);
  console.log('wrote         ' + out.writes[0]);
  if (problems.length) {
    console.log('PROBLEMS (' + problems.length + ')');
    for (const p of problems.slice(0, 60)) console.log('  ' + p.kind + ': ' + p.detail);
    if (problems.length > 60) console.log('  ... ' + (problems.length - 60) + ' more in ' + out.writes[0]);
    process.exit(1);
  }
  console.log('OK            0 problems');
  process.exit(0);
}

/* ---------------------------------------------------------------- apply (writes the ledger; never run with problems) */
if (problems.length) {
  for (const p of problems.slice(0, 60)) process.stderr.write('  ' + p.kind + ': ' + p.detail + '\n');
  fatal(problems.length + ' problem(s); nothing written (run with --dry for the full report)');
}
const ledgerFile = abs('audit/change-control.json');
const matchFile = abs('audit/preset-match.json');
const verdictFile = abs('audit/preset-match.matcher-verdict.json');
const rulesFile = abs('audit/ledger-rules.json');
// 1. keep the matcher's own verdict before the first answer
if (!fs.existsSync(verdictFile)) {
  if (fs.existsSync(matchFile)) {
    const cur = JSON.parse(fs.readFileSync(matchFile, 'utf8'));
    if ((cur.rows || []).some((r) => r.status === 'ANSWERED')) fatal('audit/preset-match.json already holds answers but no matcher verdict was kept: run sr-match.mjs --project . again first');
    fs.copyFileSync(matchFile, verdictFile);
    console.log('matcher verdict kept: audit/preset-match.json -> audit/preset-match.matcher-verdict.json');
  } else {
    const m = spawnSync(process.execPath, [path.join(SKILL, 'sr-match.mjs'), '--project', ROOT], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if (!fs.existsSync(matchFile)) fatal('sr-match wrote no audit/preset-match.json: ' + (m.stderr || m.stdout || '').slice(-800));
    fs.copyFileSync(matchFile, verdictFile);
    console.log('matcher ran: exit ' + m.status + '; verdict kept in audit/preset-match.matcher-verdict.json');
  }
}
// 2. insert the rows the crawl cannot produce (idempotent by id)
if (toInsert.length) {
  const ledger1 = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
  const have = new Set(ledger1.rows.map((r) => r.id));
  for (const r of toInsert) if (!have.has(r.id)) ledger1.rows.push({ id: r.id, url: r.url, pageType: 'site', index: r.index, label: r.label, sourceTag: 'ledger-added', sourceClass: '', decision: 'UNSET', why: '', narrativeSlot: '', presetId: '', rebuiltAs: '' });
  ledger1.rowCount = ledger1.rows.length;
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger1, null, 2) + '\n');
  console.log('inserted ' + toInsert.length + ' added rows');
}
// 3. the deciding rule per row
fs.writeFileSync(rulesFile, JSON.stringify({ ...rulesDoc, generated: new Date().toISOString(), inputs: inputHashes, plan: plan.map(({ id, rule, decision, slot, rebuiltAs, preset, why, evidence }) => ({ id, rule, decision, slot, rebuiltAs, preset, why, evidence })) }, null, 1) + '\n');
// 4. decisions through the skill's own CLI
let nSet = 0;
if (!PRESETS_ONLY) for (const p of plan) {
  try {
    execFileSync(process.execPath, [path.join(SKILL, 'sr-plan.mjs'), '--project', ROOT, '--set', p.id, '--decision', p.decision, '--why', p.why, '--slot', p.slot, '--as', p.rebuiltAs], { stdio: 'pipe' });
  } catch (e) {
    fatal('sr-plan --set failed on ' + p.id + ' after ' + nSet + ' row(s) were set (re-running is idempotent): ' + String((e.stderr || e.message || '')).slice(-600));
  }
  if (++nSet % 100 === 0) console.log('  decisions set ' + nSet);
}
// 5. presets through sr-match --answer. sr-match exits 1 while any matcher row is still UNDECIDED, so every
//    batch but the last exits 1 BY DESIGN: a batch is accepted when its stdout confirms every answer and
//    reports the remaining count; the LAST batch must exit 0.
const baseline = JSON.parse(fs.readFileSync(verdictFile, 'utf8'));
let done = 0, remaining = null;
batches.forEach((b, i) => {
  const r = spawnSync(process.execPath, [path.join(SKILL, 'sr-match.mjs'), '--project', ROOT, ...b.flatMap((x) => ['--answer', x])], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const ok = ((r.stdout || '').match(/^\s*answered /gm) || []).length;
  const m = (r.stdout || '').match(/remaining undecided: (\d+)/);
  if (ok !== b.length || !m) fatal('sr-match batch ' + (i + 1) + ': ' + ok + '/' + b.length + ' answered; ' + (r.stderr || r.stdout || '').slice(-600));
  remaining = Number(m[1]);
  const last = i === batches.length - 1;
  if (last ? r.status !== 0 : r.status > 1) fatal('sr-match batch ' + (i + 1) + ' exit ' + r.status + ' with ' + remaining + ' undecided');
  done += ok;
});
const matcherPick = new Map((baseline.rows || []).filter((r) => r.status === 'MATCHED').map((r) => [r.rowId, r.chosen]));
const overridden = plan.filter((p) => matcherPick.has(p.id) && matcherPick.get(p.id) !== p.preset).map((p) => ({ id: p.id, matcher: matcherPick.get(p.id), answered: p.preset }));
const rulesNow = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
rulesNow.matcherOverrides = { note: 'Rows the layout matcher had MATCHED whose preset was replaced by the one of the component the rebuild renders (verdict kept in audit/preset-match.matcher-verdict.json).', count: overridden.length, rows: overridden };
fs.writeFileSync(rulesFile, JSON.stringify(rulesNow, null, 1) + '\n');
// 6. the skill's own check
const chk = spawnSync(process.execPath, [path.join(SKILL, 'sr-plan.mjs'), '--project', ROOT, '--check'], { encoding: 'utf8' });
process.stdout.write(chk.stdout || '');
console.log('decisions set ' + nSet + ' | presets answered ' + done + ' in ' + batches.length + ' batches | undecided now ' + remaining + ' | matcher picks overridden ' + overridden.length + ' | sr-plan --check exit ' + chk.status);
process.exit(chk.status === 0 ? 0 : 1);
