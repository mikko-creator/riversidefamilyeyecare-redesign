// write-docs.mjs - docs/README.md and docs/CHANGE-LOG.md, generated from the evidence on disk (never typed).
// Every number and table comes from a file named beside it: audit/change-control.json (+ audit/ledger-rules.json when
// tools/ledger-decide.mjs has run), audit/clone-removals.json, audit/seo-repairs.json, audit/generated-images.json,
// audit/generated-media.json, audit/sentence-parity.json, audit/short-text-parity.json, audit/words-added.json,
// audit/tag-balance.json, audit/link-check.json, audit/keep-image-parity.json, audit/seo-parity.json, audit/gate.json
// (when present) and dist/. Only the prose is authored. DEPLOY.md and BRAND-SYSTEM.md are written elsewhere.
//   node tools/write-docs.mjs
// Exit 1 (files still written) while any ledger row is UNSET or a required input is missing, so a chain that runs it
// before the ledger is decided cannot read as finished.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const J = (f, d) => { try { return JSON.parse(fs.readFileSync(P(f), 'utf8')); } catch { if (d !== undefined) return d; throw new Error('missing or unreadable: ' + f); } };
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
const row = (...c) => '| ' + c.map(esc).join(' | ') + ' |';
const ORIGIN = 'https://www.riversidefamilyeyecare.com';
const rel = (u) => String(u || '').replace(ORIGIN, '') || '/';
const problems = [];

const ledger = J('audit/change-control.json');
const rules = J('audit/ledger-rules.json', null);
const removals = J('audit/clone-removals.json');
const repairs = J('audit/seo-repairs.json');
const gen = J('audit/generated-images.json');
const media = J('audit/generated-media.json');
const gate = J('audit/gate.json', null);
const num = (f) => J(f, null);
const sp = num('audit/sentence-parity.json'), st = num('audit/short-text-parity.json'), wa = num('audit/words-added.json');
const tb = num('audit/tag-balance.json'), lc = num('audit/link-check.json'), ki = num('audit/keep-image-parity.json'), so = num('audit/seo-parity.json');

const pages = [];
(function walk(d, r) { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const x = r ? r + '/' + e.name : e.name; if (e.isDirectory()) walk(path.join(d, e.name), x); else if (e.name.endsWith('.html')) pages.push(x); } }(P('dist'), ''));
if (!pages.length) problems.push('dist/ has no HTML (build first)');

const rows = ledger.rows || [];
const tally = rows.reduce((a, r) => { a[r.decision] = (a[r.decision] || 0) + 1; return a; }, {});
const unset = tally.UNSET || 0;
if (unset) problems.push(unset + ' ledger rows are still UNSET (run tools/ledger-decide.mjs)');
const pick = (o, ...ks) => { for (const k of ks) { const v = k.split('.').reduce((a, b) => (a == null ? a : a[b]), o); if (v != null) return v; } return null; };

const gateLine = gate
  ? (() => { const rs = gate.results || gate.checks || []; const c = (s) => rs.filter((x) => x.status === s).length; return `${c('PASS')} PASS · ${c('FAIL')} FAIL · ${c('UNPROVEN')} UNPROVEN (\`audit/gate.json\`, ${gate.generated || gate.at || 'undated'})`; })()
  : 'not run yet (`audit/gate.json` absent)';
const gateOpen = gate ? (gate.results || gate.checks || []).filter((x) => x.status !== 'PASS').map((x) => row(x.id, x.status, x.label || '', x.evidence || '')) : [];

const genImgs = gen.images || [];
const clips = media.clips || [];
const opened = fs.existsSync(P('docs/OPEN-DECISIONS.md')) ? fs.readFileSync(P('docs/OPEN-DECISIONS.md'), 'utf8') : '';

// ================================ README =========================================================
const README = `# Riverside Family Eye Care, "Riverlight" redesign: developer README

A total visual redesign of \`${ORIGIN}/\`, the site of Riverside Family Eye Care (Fort Myers, FL), which runs on
WordPress through the EyeCarePro platform. It was produced with the site-reforge skill in its **REFORGE lane**: the
site's structure, every page at its live URL and every word of copy are kept; the design is new.

## At a glance

- **Pages:** ${pages.length} HTML files in \`dist/\` (the crawled pages at their live paths, plus \`404.html\`).
- **Design:** "Riverlight Aurora" (\`docs/DESIGN-SPEC.md\`): the logo's teal-over-navy wave grown into a river of
  light that runs through every page, with layered depth, images that break their frames and cross section edges,
  scroll-driven motion and hover effects, all honouring \`prefers-reduced-motion\`.
- **Copy:** every word kept (see the verification record below).
- **Imagery:** every real photograph of the practice is kept. ${genImgs.length} generated stills (fal.ai) and
  ${clips.length} generated motion clip (Higgsfield) were added as illustrative industry imagery, each AI-labelled;
  none depicts the practice's people, patients, office or results (\`docs/CHANGE-LOG.md\`, Imagery).
- **Gate:** ${gateLine}.

## Verification record

Each number is read from the report file named beside it, produced by \`node tools/run-gates.mjs\` on the current
\`dist/\`; every one of those tools proves it can fire on a planted defect before it reports a zero.

| check | result | report |
|---|---|---|
${[
  sp && sp.totals ? row('Sentence parity (every source sentence of 5+ words, verbatim)', `${sp.totals.found} of ${sp.totals.sentences} found on their rebuilt pages; ${sp.totals.sourceChromeOnly ?? sp.sourceChromeCount ?? '?'} only in the source's own chrome; ${sp.totals.declaredRemovals ?? '?'} declared removals; ${sp.totals.lost} lost`, 'audit/sentence-parity.json') : null,
  st && st.totals ? row('Short text (dates, phones, emails, prices, form labels and options, CTAs, short headings)', `${st.totals.found} of ${st.totals.items} found; ${st.totals.declared} declared; ${st.totals.missing} missing`, 'audit/short-text-parity.json') : null,
  wa ? row('Words added (anything visible that is not source copy, chrome or a declared label)', `${Array.isArray(wa.added) ? wa.added.length : wa.added} added words and ${Array.isArray(wa.addedGlyphs) ? wa.addedGlyphs.length : wa.addedGlyphs} added glyphs across ${wa.pages} pages (${wa.visibleWords} visible words)`, 'audit/words-added.json') : null,
  tb ? row('Tag balance (every element closed in order)', `${tb.unbalancedPages} unbalanced of ${tb.pages} pages`, 'audit/tag-balance.json') : null,
  lc ? row('Links (every local href/src/srcset resolves; no root-absolute URL outside 404.html)', `${lc.broken} broken of ${lc.localRefs} local references in ${lc.filesChecked} files`, 'audit/link-check.json') : null,
  ki && ki.totals ? row('Images kept (every source image of a page is on its rebuilt page)', `${ki.totals.present} of ${ki.totals.checked} present; ${ki.totals.declared} declared; ${ki.totals.missing} missing`, 'audit/keep-image-parity.json') : null,
  so && so.tally ? row('SEO head vs the source (title, description, canonical, robots, h1)', Object.entries(so.tally).filter(([, v]) => v && typeof v === 'object' && 'mismatch' in v).map(([k, v]) => `${k} ${v.same} same / ${v.repaired} repaired / ${v.mismatch} mismatch`).join('; ') + `; ${so.noindexPages} noindex pages`, 'audit/seo-parity.json') : null,
].filter(Boolean).join('\n')}

## Run it locally

\`\`\`bash
node tools/serve.mjs --root dist --port 8795 --no-open
# then open http://127.0.0.1:8795/
\`\`\`

Every internal URL is page-relative, so the folder also works from a subfolder (except \`404.html\`, by design:
\`docs/DEPLOY.md\`). Opening \`dist/index.html\` straight from disk does not work for the video and fonts; serve it.

## Build

\`\`\`bash
node src/build.mjs                 # wipes and rebuilds dist/ (and the audit/ build reports)
RFEC_DIST=<dir> node src/build.mjs # build elsewhere, no audit/ writes
node tools/run-gates.mjs           # content, links, images, SEO, decontamination (exit 1 on any FAIL)
sh tmp/final-chain.sh              # the full verification chain, about 30-40 minutes
\`\`\`

Needs Node 24 (built-ins only), \`cwebp\` + \`webpmux\` and \`ffmpeg\` + \`ffprobe\`. Two builds are byte-identical.

## Structure

| path | what |
|---|---|
| \`src/build.mjs\` | the build orchestrator (pages, head/SEO, images, sitemap, redirects, audit reports) |
| \`src/lib/\` | \`content.mjs\` (sanitiser, extractors), \`page-model.mjs\` (one JSON model per page), \`forms.mjs\`, \`seo.mjs\`, \`images.mjs\`, \`templates.mjs\` + \`home.mjs\` (the Riverlight theme) |
| \`src/styles/tokens.css\` | measured source tokens (evidence), then the Riverlight tokens below the REDESIGN TOKENS marker; change values here, never at a call site |
| \`src/styles/riverlight.css\`, \`fonts.css\`, \`motion.css\` | the theme; \`motion.css\` keeps the source keyframes verbatim as evidence and ships only its redesign layer |
| \`src/theme/\` | the theme script, self-hosted fonts and theme images |
| \`src/content/\` | \`chrome.json\` (menus, NAP, hours), \`site-map.json\`, \`image-plan.json\`, \`motion-plan.json\` |
| \`assets/source/\` | the original images downloaded from the live site |
| \`assets/generated/\`, \`assets/media/\` | the accepted generated images and the hero motion; rejected versions are archived, never deleted |
| \`dist/\` | the built site that ships |
| \`docs/\` | this directory |
| \`audit/\` | inventories, reports and the gate record |
| \`tools/\` | the verification tools (each with its own positive control) |

## Before you change anything

Read \`docs/CHANGE-LOG.md\` (every section of the old site has a recorded decision), \`docs/COMPONENTS.md\` (the
markup and script contract), \`docs/DESIGN-SPEC.md\` (the design) and \`docs/BUILD-NOTES.md\` (the pipeline, the page
model contract and the verification record). After any change run \`node tools/run-gates.mjs\`.

## Known open items

${gateOpen.length ? '**Gate checks that are not PASS:**\n\n| check | status | label | evidence |\n|---|---|---|---|\n' + gateOpen.join('\n') + '\n\n' : ''}**Decisions for the practice:** \`docs/OPEN-DECISIONS.md\` (${(opened.match(/^\d+\. \*\*/gm) || []).length} numbered decisions and ${(opened.match(/^\| /gm) || []).length} table rows), including the five
staff portraits the CDN refused (honest placeholders until the practice supplies the photos), the licence of the
syndicated library articles, the form endpoint, the Cherry application URL and the video captions.
`;

// ================================ CHANGE-LOG =====================================================
const byRule = new Map();
if (rules && Array.isArray(rules.plan)) for (const p of rules.plan) { if (!byRule.has(p.rule)) byRule.set(p.rule, []); byRule.get(p.rule).push(p); }
const CHANGELOG = `# Change log

One row per section of the source site, from \`audit/change-control.json\` (${rows.length} rows on
${new Set(rows.map((r) => r.url)).size} pages). ${rules ? 'Each decision was applied with `sr-plan --set` by the rule in `tools/ledger-decide.mjs` that matched the row; `audit/ledger-rules.json` records which rule decided which row.' : '**The ledger has not been decided yet** (`tools/ledger-decide.mjs` has not run): this file is a draft.'}

## Legend

- **PRESERVE**: kept as-is; content and function unchanged
- **IMPROVE**: same content and meaning, better structure, hierarchy or design
- **REPLACE**: superseded by a better structure (reason required)
- **REMOVE**: deliberately dropped (reason required)
- **ADD**: new section that did not exist on the source

Tally: ${Object.entries(tally).map(([k, v]) => k + ' ' + v).join(' · ')}.

${byRule.size ? `## Decisions by rule

| rule | rows | decision | narrative slot | rebuilt as | why |
|---|---|---|---|---|---|
${[...byRule].map(([id, ps]) => row(id, ps.length, ps[0].decision, ps[0].slot || ps[0].narrativeSlot || '-', ps[0].rebuiltAs || '-', ps[0].why || '')).join('\n')}

` : ''}## Decisions

| page | section | decision | narrative slot | rebuilt as | why |
|---|---|---|---|---|---|
${rows.map((r) => row(rel(r.url), '#' + r.index + ' ' + (r.label || (r.sourceClass || '').split(' ')[0] || ''), r.decision, r.narrativeSlot || '-', r.rebuiltAs || '-', r.why || '')).join('\n')}

## Copy that changed

No sentence of source copy was rewritten. These are the only text changes, each declared:

| where | original | now | reason |
|---|---|---|---|
${(removals.replacements || []).map((x) => row((x.pages || []).join(', '), x.from, x.to, x.reason)).join('\n')}
${(repairs.titles || []).map((x) => row('title ' + x.page, x.from, x.to, x.why)).join('\n')}
${(repairs.h1 || []).map((x) => row('h1 ' + x.page, '(none at source)', x.h1, x.why)).join('\n')}
${(repairs.descriptions || []).map((x) => row('meta description ' + x.page, '(none at source)', x.to, x.why)).join('\n')}

Canonicals: ${(repairs.canonicals || []).length} pages had none declared and now point at themselves (\`audit/seo-repairs.json\`). Structured
data: ${(repairs.structuredData || []).length} decisions (\`audit/seo-repairs.json\` structuredData).

## Removed (declared in \`audit/clone-removals.json\`)

| what | decision | reason |
|---|---|---|
${(removals.elements || []).map((x) => row(x.selector, x.decision, x.reason)).join('\n')}
${(removals.strings || []).map((x) => row('"' + x.value + '"', x.decision, x.reason)).join('\n')}
${(removals.documents || []).map((x) => row(x.page + ' ' + rel(x.src), 'REMOVE', x.why)).join('\n')}
${(removals.videoPosters || []).map((x) => row('video poster on ' + x.page, 'REMOVE', x.why)).join('\n')}

Sentences removed: ${(removals.sentences || []).length}, on ${new Set((removals.sentences || []).map((s) => s.page)).size} pages (the repeated contact-lens product excerpts and similar; each listed with
its page in the file). Vendor clauses: ${removals.vendorClauses ? esc(removals.vendorClauses.count + ' (' + removals.vendorClauses.scope + ')') : '0'}.

## Imagery

Every photograph of the practice, its doctors and staff, its office and the brands it carries is the practice's own,
downloaded from the live site (\`audit/image-inventory.json\`, \`audit/image-classification.json\`). The five staff
portraits the CDN refused (HTTP 403) are shown as honest placeholders with the person's name; no person was generated.

Generated, illustrative industry imagery (fal.ai), each with an IPTC \`trainedAlgorithmicMedia\` XMP label in the
shipped file. None depicts a real person, this practice's office, a brand or a treatment result:

| id | role | model | depicts (the prompt's first sentence) | cut-out | slots |
|---|---|---|---|---|---|
${genImgs.map((i) => row(i.id, i.role, i.model, String(i.prompt || '').split(/(?<=\.)\s/)[0].slice(0, 160), i.cutout ? 'yes' : 'no', (i.usedFor || []).reduce((a, u) => a + (u.count || 1), 0))).join('\n')}

Dropped: ${(gen.dropped || []).map((d) => d.id + ' (' + String(d.reason).split('.')[0] + ')').join('; ') || 'none'}. Rejected and archived versions:
${(gen.rejected || []).length} (\`assets/generated/rejected/\`, kept as evidence).

Generated motion (Higgsfield), muted, looping, loaded only after the page has loaded and never under reduced motion:

| id | endpoint | calmness | status |
|---|---|---|---|
${clips.map((c) => row(c.id, c.endpoint || (c.input && c.input.endpoint) || '-', c.calmness ? JSON.stringify(c.calmness).slice(0, 120) : '-', c.status)).join('\n')}
`;

fs.writeFileSync(P('docs/README.md'), README);
fs.writeFileSync(P('docs/CHANGE-LOG.md'), CHANGELOG);
for (const f of ['README.md', 'CHANGE-LOG.md']) console.log(f.padEnd(14), fs.statSync(P('docs', f)).size, 'bytes', /<FILL[:>]/.test(fs.readFileSync(P('docs', f), 'utf8')) ? 'HAS <FILL>' : 'no <FILL>');
if (problems.length) { console.log('NOT FINAL:', problems.join('; ')); process.exitCode = 1; } else console.log('final: ledger decided, inputs present');
