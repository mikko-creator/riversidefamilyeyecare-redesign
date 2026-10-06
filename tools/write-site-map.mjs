// write-site-map.mjs - src/content/site-map.json from the evidence (audit/architecture-map.json families, the
// verified chrome.json menus, the SITE-ARCHITECTURE section 11 artefact list). Deterministic: no clock is read
// (`generated` is the architecture map's own evidence date), so a re-run on the same evidence is byte-identical.
// Partition check: every one of the 148 crawled pages sits in exactly one family; the run exits 1 otherwise,
// and a planted defect (one page dropped) must make the check fire.
//   node tools/write-site-map.mjs [--check]   (--check: recompute and compare with the file on disk, write nothing)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const am = JSON.parse(fs.readFileSync(P('audit/architecture-map.json'), 'utf8'));
const chrome = JSON.parse(fs.readFileSync(P('src/content/chrome.json'), 'utf8'));
const ci = JSON.parse(fs.readFileSync(P('audit/content-inventory.json'), 'utf8'));
const pathOf = (url) => { const p = new URL(url).pathname.replace(/^\/+|\/+$/g, ''); return p ? '/' + p + '/' : '/'; };

const crawled = ci.pages.map((p) => pathOf(p.url)).sort();
const templates = {};
for (const [fam, f] of Object.entries(am.families)) templates[fam] = [...f.urls].sort();

function partition(tpl) {
  const seen = new Map();
  for (const [fam, urls] of Object.entries(tpl)) for (const u of urls) seen.set(u, (seen.get(u) || []).concat(fam));
  const missing = crawled.filter((u) => !seen.has(u));
  const duplicated = [...seen].filter(([, f]) => f.length > 1).map(([u]) => u);
  const unknown = [...seen.keys()].filter((u) => !crawled.includes(u));
  return { missing, duplicated, unknown, ok: !missing.length && !duplicated.length && !unknown.length };
}
const check = partition(templates);
/* positive control: drop one page from a copy; the check must report it missing */
const planted = JSON.parse(JSON.stringify(templates));
planted.interior = planted.interior.slice(1);
const control = partition(planted);
const controlFired = !control.ok && control.missing.length === 1;
if (!check.ok || !controlFired) {
  console.error('partition check failed', JSON.stringify({ check, controlFired }));
  process.exit(1);
}

const nav = (items) => items.map((i) => ({ label: i.label, href: i.href, children: nav(i.children || []) }));
const out = {
  schema: 'rfec/site-map@1',
  generated: am.evidenceDate,
  source: 'audit/architecture-map.json (families: FAMILY_RULES of tools/write-architecture.mjs, partition-checked there and here), src/content/chrome.json (menus, verified by tools/write-facts.mjs), docs/SITE-ARCHITECTURE.md section 11 (artefacts)',
  note: 'href = own-origin path with trailing slash; the build makes every link page-relative. templates = the 14 template families that partition the 148 crawled pages (rules tried in order, first match wins; see docs/SITE-ARCHITECTURE.md section 3). Written by tools/write-site-map.mjs; do not edit by hand.',
  menus: {
    topbar: [
      { label: chrome.topbar.address.label, href: chrome.topbar.address.href, kind: 'text link' },
      { label: chrome.topbar.appointment.label, href: chrome.topbar.appointment.href, kind: 'button' },
      { label: chrome.topbar.call.label, href: chrome.topbar.call.href, kind: 'button', sourceHref: chrome.topbar.call.sourceHref },
    ],
    primary: nav(chrome.nav),
    quickActions: chrome.quickActions.map((q) => ({ label: q.label, href: q.href })),
    footer: chrome.footer.columns.flatMap((c) => c.links.map((l) => ({ label: l.label, href: l.href }))),
    footerButton: { label: chrome.footer.button.label, href: chrome.footer.button.href },
    util: chrome.footer.util.map((l) => ({ label: l.label, href: l.href })),
  },
  templates,
  counts: Object.fromEntries(Object.entries(templates).map(([k, v]) => [k, v.length])),
  partitionCheck: { crawled: crawled.length, placed: Object.values(templates).reduce((a, v) => a + v.length, 0), missing: check.missing, duplicated: check.duplicated, unknown: check.unknown, positiveControl: { planted: 'one interior page dropped from a copy', fired: controlFired } },
  artefacts: [
    ...templates.template.map((p) => ({ path: p, kind: 'builder template post', robots: 'as source (noindex)', build: 'kept at its path (one output page per source page)', recommendation: 'drop (410) or 301 to / after launch: SITE-ARCHITECTURE section 11', why: 'Beaver Builder global-template post rendered as a page; orphan; stale placeholder copy on some.' })),
    { path: '/404-page-not-found/', kind: 'platform 404 body as a page', robots: 'as source (index)', build: 'kept at its path; also rendered as dist/404.html (noindex, root-relative URLs)', recommendation: 'noindex (docs/OPEN-DECISIONS.md)', why: 'The platform 404 body is an indexable page at source.' },
    ...['/category/our-doctors/', '/category/our-staff/', '/category/testimonials/', '/tag/licansed-by-adobe-stock/'].map((p) => ({ path: p, kind: '"Nothing Found" archive', robots: 'as source (noindex)', build: 'kept at its path', recommendation: 'redirect or drop after launch: SITE-ARCHITECTURE section 11', why: 'Empty archive with an empty <title> at source.' })),
  ],
};
const json = JSON.stringify(out, null, 2) + '\n';
const file = P('src/content/site-map.json');
if (process.argv.includes('--check')) {
  const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === json;
  console.log('site-map.json ' + (same ? 'matches the evidence' : 'DIFFERS from the evidence'));
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(file, json);
console.log('site-map.json written: ' + Object.keys(templates).length + ' families, ' + out.partitionCheck.placed + ' / ' + crawled.length + ' pages placed; control ' + (controlFired ? 'fired' : 'DID NOT FIRE'));
console.log(JSON.stringify(out.counts));
