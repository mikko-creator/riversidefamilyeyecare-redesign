// licence-overlap.mjs - evidence for the CONTENT LICENCE question (docs/OPEN-DECISIONS.md): which Riverside pages
// carry text that another EyeCarePro site publishes word for word. Compares every >= 5-word sentence of each
// Riverside page's content region (raw <main>) with every sentence of the reference crawl R (another practice on
// the same platform; pass its audit/raw directory, read only). Also records the platform-library markers on each
// page: the "Special thanks to ..." attribution line, membership of the /tag/all-about-vision/ archive, gsp- tags,
// images from the platform's shared clipart / product libraries.
// Nothing is guessed: a page is "shared" only by verbatim sentence matches; the numbers are what they are.
//   node tools/licence-overlap.mjs --ref <R>/audit/raw   -> audit/licence-overlap.json + a family summary
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ref = process.argv.includes('--ref') ? path.resolve(process.argv[process.argv.indexOf('--ref') + 1]) : null;
if (!ref || !fs.existsSync(ref)) { console.error('pass --ref <reference workspace>/audit/raw (read only)'); process.exit(2); }
const NAMED = { nbsp: ' ', amp: '&', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', ndash: '-', mdash: '-', hellip: '...', quot: '"', reg: '®', trade: '™' };
const decode = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&([a-z]+);/gi, (m, n) => (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m));
const norm = (s) => decode(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ').replace(/…/g, '...').replace(/\s+/g, ' ').trim().toLowerCase();
const BLOCK = /^<\/?(p|li|h[1-6]|td|th|dt|dd|figcaption|blockquote|div|section|article|ul|ol|br|tr|table|main|address)\b/i;
const mainOf = (raw) => ((raw.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0]);
function sentencesOf(html) {
  const flat = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript|svg|form|nav)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<div class="ecp-breadcrumb[\s\S]*?<\/div>/i, ' ').replace(/<[^>]+>/g, (t) => (BLOCK.test(t) ? '\n' : ' '));
  return flat.split('\n').map(norm).flatMap((b) => b.split(/(?<=[.!?])\s+(?=[a-z0-9"(])/)).map((s) => s.trim()).filter((s) => s.split(' ').length >= 5);
}
/* the practice name and the place names of BOTH sites are masked, so a sentence that differs only by them still counts
   as the same library text ("At Riverside Family Eye Care in Fort Myers, we ..." vs the same sentence with the other
   practice's name and city). Each site's names are read from its OWN home page at runtime (og:site_name; the
   "<City>, <ST> <ZIP>" of its footer address; "<City>, <State>" in its text), never typed here. */
const practiceNames = (raw) => { const m = /<meta property="og:site_name" content="([^"]+)"/i.exec(raw); return m ? [norm(m[1])] : []; };
function placesOf(homeRaw) {
  const text = decode(homeRaw.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  const m = /([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,2}),\s*([A-Z]{2})\s+\d{5}/.exec(text);
  if (!m) return [];
  const out = [m[1], m[2]];
  const full = new RegExp(m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ',\\s+([A-Z][a-z]{3,})').exec(text);
  if (full) out.push(full[1]);
  return out.map((x) => norm(x));
}
let PLACES = [];
const maskPlaces = (s) => PLACES.reduce((x, pl) => x.replace(new RegExp('\\b' + pl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), '{place}'), s);
const mask = (s, names) => maskPlaces(names.reduce((x, n) => (n ? x.split(n).join('{practice}') : x), s));

/* reference corpus */
PLACES = [...new Set([...placesOf(fs.readFileSync(path.join(ref, 'index.html'), 'utf8')), ...placesOf(fs.readFileSync(path.join(ROOT, 'audit/raw/index.html'), 'utf8'))])].filter((x) => x.length >= 2);
const refIndex = new Map();
const refFiles = fs.readdirSync(ref).filter((f) => f.endsWith('.html')).sort();
for (const f of refFiles) {
  const raw = fs.readFileSync(path.join(ref, f), 'utf8');
  const names = practiceNames(raw);
  for (const s of new Set(sentencesOf(mainOf(raw)))) {
    const k = mask(s, names);
    if (!refIndex.has(k)) refIndex.set(k, new Set());
    refIndex.get(k).add(f);
  }
}
const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/content-inventory.json'), 'utf8'));
const siteMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/site-map.json'), 'utf8'));
const familyOf = new Map(); for (const [fam, ps] of Object.entries(siteMap.templates)) for (const p of ps) familyOf.set(p, fam);
const pathOf = (url) => { const p = new URL(url).pathname.replace(/^\/+|\/+$/g, ''); return p ? '/' + p + '/' : '/'; };
const allAboutVision = new Set([...fs.readFileSync(path.join(ROOT, 'audit/raw/tag-all-about-vision.html'), 'utf8').matchAll(/<div class="ecp-entry-title">\s*<a\b[^>]*href="([^"]+)"/g)].map((m) => pathOf(m[1])));
const groupOf = (p, fam) => (fam === 'blog-post' ? 'blog posts' : /^\/contact-lenses\/our-featured-brands\/./.test(p) ? 'contact-lens brand pages' : /^\/eyeglasses\//.test(p) ? 'eyeglasses library' : /^\/contact-lenses\//.test(p) ? 'contact-lens library' : /^\/eye-care-services\//.test(p) ? 'eye-care library' : /^\/insurance\//.test(p) ? 'insurance' : 'other pages');
const pages = [];
for (const page of content.pages) {
  const p = pathOf(page.url);
  const fam = familyOf.get(p) || 'page';
  if (['template', 'archive', 'not-found', 'sitemap'].includes(fam)) continue;
  const raw = fs.readFileSync(path.join(ROOT, 'audit/raw', page.savedAs), 'utf8');
  const main = mainOf(raw);
  const names = practiceNames(raw);
  const sents = [...new Set(sentencesOf(main))];
  const shared = sents.filter((s) => refIndex.has(mask(s, names)));
  const refPages = new Map();
  for (const s of shared) for (const f of refIndex.get(mask(s, names))) refPages.set(f, (refPages.get(f) || 0) + 1);
  pages.push({
    path: p, family: fam, group: groupOf(p, fam), sentences: sents.length, shared: shared.length, sharedPct: sents.length ? Math.round((shared.length / sents.length) * 1000) / 10 : 0,
    topReferencePages: [...refPages].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => ({ file: f, shared: n })),
    markers: {
      attribution: /<p>\s*Special thanks to/i.test(main),
      allAboutVisionTag: allAboutVision.has(p),
      gspTag: /\/tag\/gsp-/.test(raw),
      clipartLibrary: /d3dhq28juvmj53\.cloudfront\.net\/clipart/.test(main),
      productLibrary: /storage\.googleapis\.com\/ecp-samurai\/(contact-lenses|designer-frames|equipment)/.test(main),
      contactLensPlugin: /ecp-contactlens-wrap/.test(main),
    },
  });
}
const groups = {};
for (const pg of pages) {
  const g = (groups[pg.group] = groups[pg.group] || { pages: 0, withShared: 0, mostlyShared: 0, sentences: 0, shared: 0, attribution: 0, allAboutVisionTag: 0, clipartLibrary: 0, productLibrary: 0 });
  g.pages++; g.sentences += pg.sentences; g.shared += pg.shared;
  if (pg.shared) g.withShared++;
  if (pg.sharedPct >= 50) g.mostlyShared++;
  for (const k of ['attribution', 'allAboutVisionTag', 'clipartLibrary', 'productLibrary']) if (pg.markers[k]) g[k]++;
}
const out = { schema: 'rfec/licence-overlap@1', reference: { files: refFiles.length, distinctSentences: refIndex.size, placeNamesMasked: PLACES.length }, method: 'verbatim >= 5-word sentences of each Riverside content region found in the reference crawl (practice names and city/state words masked on both sides); markers read from the raw markup', groups, pages: pages.sort((a, b) => b.sharedPct - a.sharedPct || (a.path < b.path ? -1 : 1)) };
fs.writeFileSync(path.join(ROOT, 'audit/licence-overlap.json'), JSON.stringify(out, null, 1) + '\n');
console.log('reference:', refFiles.length, 'files,', refIndex.size, 'distinct sentences');
for (const [g, v] of Object.entries(groups).sort()) console.log(g.padEnd(26), JSON.stringify(v));
