// seo-parity.mjs - the head of every rebuilt page against the source.
//   title        rebuilt <title> = audit/seo-inventory.json title, or a documented repair (audit/seo-repairs.json titles)
//   description  rebuilt meta description = the source's, or (source has none) a documented derivation, or absent
//   canonical    rebuilt canonical = the source's canonical, or (source has none / names no page) a documented change
//   robots       rebuilt robots meta = EVERY robots meta of the RAW head merged, most restrictive wins (read from
//                audit/raw itself: seo-inventory recorded only one robots meta per page and misses the noindex ones)
//   h1           exactly one <h1> per page, equal to the source's first h1 (content-inventory), or a documented label
// Every field of every page is SAME, REPAIRED (documented) or a MISMATCH; the run exits 1 on any mismatch, any page
// without exactly one h1, or a positive control that does not fire (a planted wrong title must be reported).
// Fix round 2 adds two checks, each with positive controls:
//   derived description (R2-3)  a derived description is the start of ONE block (p, li, td, th, dd, blockquote,
//                figcaption) of the rebuilt <main> that is not link-only, and a /template/* page has none
//                (controls: the footer template's link-only icon labels; a description planted on a template page)
//   structured data (R2-2)  every application/ld+json block of the RAW page is accounted for: the platform's 7
//                site-wide types are replaced (the rebuilt graph holds Organization, Optometric, BreadcrumbList and
//                the carried nodes only); any other source block is carried, every value equal to the source's or to
//                a declared repair (audit/seo-repairs.json structuredData), or declared REMOVE and absent; every
//                rebuilt block parses; no rebuilt node lacks a source (controls: a dropped BlogPosting, a changed
//                headline, a planted FAQPage, and each kind of REMOVE declaration withdrawn - a parseable FAQPage and
//                an unparseable VideoObject removed with no declaration must be reported)
//   node tools/seo-parity.mjs [--dir <dir>]   ($RFEC_DIST or --dir: no audit/ report)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(PROJ, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const J = (f) => JSON.parse(fs.readFileSync(path.join(PROJ, f), 'utf8'));
const content = J('audit/content-inventory.json');
const seoInv = J('audit/seo-inventory.json');
const repairs = J('audit/seo-repairs.json');
const seoBy = new Map(seoInv.pages.map((p) => [p.url, p]));
const decode = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');
const clean = (s) => decode(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const pathOf = (url) => { const p = new URL(url).pathname.replace(/^\/+|\/+$/g, ''); return p ? '/' + p + '/' : '/'; };
const slashUrl = (u) => (u ? String(u).replace(/\/?$/, '/') : u);

function rawRobots(raw) {
  const head = (raw.match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  const toks = [];
  for (const t of [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).filter((t) => /\bname\s*=\s*["']?robots["'\s>]/i.test(t))) {
    const c = /\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(t) || [];
    for (const x of String(c[1] !== undefined ? c[1] : c[2] || '').toLowerCase().split(/[\s,]+/).filter(Boolean)) toks.push(x);
  }
  const out = [];
  if (toks.includes('noindex')) out.push('noindex'); else if (toks.includes('index')) out.push('index');
  if (toks.includes('nofollow')) out.push('nofollow'); else if (toks.includes('follow')) out.push('follow');
  for (const t of toks) if (!/^(no)?(index|follow)$/.test(t) && !out.includes(t)) out.push(t);
  return out.join(', ');
}
const headOf = (html) => {
  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  const meta = (name) => { const m = new RegExp('<meta name="' + name + '" content="([^"]*)"', 'i').exec(head); return m ? decode(m[1]) : null; };
  return {
    title: decode((/<title>([\s\S]*?)<\/title>/i.exec(head) || [])[1] || ''),
    description: meta('description'), robots: meta('robots'),
    canonical: decode((/<link rel="canonical" href="([^"]*)"/i.exec(head) || [])[1] || ''),
    h1s: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => clean(m[1])),
  };
};
/* ---- fix round 2: derived-description provenance (R2-3) ---- */
const siteMap = J('src/content/site-map.json');
const TEMPLATE_PAGES = new Set((siteMap.templates && siteMap.templates.template) || []);
const DESC_BLOCK = /<(p|li|td|th|dd|blockquote|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const linkOnly = (inner) => /<a\b/i.test(inner) && !/[\p{L}\p{N}]/u.test(decode(inner.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ').replace(/<[^>]+>/g, ' ')));
function descProblems(p, html, desc, derived) {
  const out = [];
  if (desc && TEMPLATE_PAGES.has(p) && derived) out.push('a /template/* page carries a derived description');
  if (!desc || !derived) return out;
  const want = desc.replace(/…$/, '').trim();
  const main = (html.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0];
  const blocks = [...main.matchAll(DESC_BLOCK)].filter((m) => clean(m[2]).startsWith(want));
  if (!blocks.length) out.push('derived description is not the start of any block of <main>');
  else if (blocks.every((m) => linkOnly(m[2]))) out.push('derived description comes from a link-only block (navigation, not prose)');
  return out;
}
/* ---- fix round 2: structured data (R2-2) ---- */
const LD_PLATFORM = ['WebPage', 'LocalBusiness', 'MedicalBusiness', 'Optician', 'MedicalSpecialty :: Optometric', 'Organization', 'BreadcrumbList'];
const LD_OWN = ['Organization', 'Optometric', 'BreadcrumbList'];
const ldDecl = new Map();   /* page|type -> declaration */
for (const d of repairs.structuredData || []) ldDecl.set(d.page + '|' + d.type, d);
function ldBlocks(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter((m) => /application\/ld\+json/i.test(m[1])).map((m) => {
    try { const o = JSON.parse(m[2]); return { obj: o, type: o && !Array.isArray(o) && !o['@graph'] ? String(o['@type']) : null }; } catch (e) { return { error: e.message, type: (/"@type"\s*:\s*"([^"]+)"/.exec(m[2]) || [])[1] || '(no @type)' }; }
  });
}
const leaves = (o, at = '', out = new Map()) => {
  if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) { if (at === '' && k === '@context') continue; leaves(v, at ? at + '.' + k : k, out); } return out; }
  out.set(at, o);
  return out;
};
function ldProblems(p, raw, html) {
  const out = [];
  const nodes = [];
  for (const b of ldBlocks(html)) {
    if (b.error) { out.push('a rebuilt JSON-LD block does not parse: ' + b.error); continue; }
    for (const n of b.obj['@graph'] || [b.obj]) nodes.push(n);
  }
  const used = new Set();
  for (const b of ldBlocks(raw)) {
    if (!b.error && LD_PLATFORM.includes(b.type)) continue;   /* replaced (clone-removals REPLACE row) */
    const d = ldDecl.get(p + '|' + b.type);
    const hit = nodes.find((n) => n['@type'] === b.type && !LD_OWN.includes(b.type));
    if (d && d.decision === 'REMOVE') { if (hit) out.push(b.type + ' is declared REMOVE but is in the rebuilt graph'); continue; }
    if (b.error) { out.push(b.type + ' (unparseable at source) has no REMOVE declaration'); continue; }
    if (!hit) { out.push('source ' + b.type + ' is neither carried nor declared removed'); continue; }
    used.add(hit);
    const fixes = (d && d.repairs) || [];
    const fixOf = (leaf) => fixes.find((r) => leaf === r.field || leaf.startsWith(r.field + '.'));
    const src = leaves(b.obj), got = leaves(hit);
    for (const [leaf, v] of src) {
      const r = fixOf(leaf);
      if (r) {
        /* a repair to null omits the field; a scalar repair names its leaf exactly; an object repair covers its leaves */
        const want = r.to === null ? undefined : typeof r.to !== 'object' ? (leaf === r.field ? r.to : Symbol('no such leaf')) : leaves(r.to).get(leaf.slice(r.field.length + 1));
        if (got.get(leaf) !== want) out.push(b.type + ' ' + leaf + ': rebuilt ' + JSON.stringify(got.get(leaf)) + ' is neither the source value nor the declared repair');
        continue;
      }
      if (got.get(leaf) !== v) out.push(b.type + ' ' + leaf + ': rebuilt ' + JSON.stringify(got.get(leaf)) + ' != source ' + JSON.stringify(v));
    }
    for (const leaf of got.keys()) if (!src.has(leaf) && !fixOf(leaf)) out.push(b.type + ' ' + leaf + ': not in the source node');
  }
  for (const n of nodes) if (!LD_OWN.includes(n['@type']) && !used.has(n)) out.push('rebuilt ' + n['@type'] + ' node has no source block');
  const own = nodes.filter((n) => LD_OWN.includes(n['@type'])).map((n) => n['@type']);
  if (own.length !== new Set(own).size) out.push('a site-wide node appears twice: ' + own.join(', '));
  return out;
}
const repairedTitle = new Map((repairs.titles || []).map((t) => [t.page, t]));
const repairedCanon = new Map((repairs.canonicals || []).map((t) => [t.page, t]));
const derivedDesc = new Map((repairs.descriptions || []).map((t) => [t.page, t]));
/* QA round 1 (wf6, CONTENT-3): an archive's source meta description that was its first listed post's text is dropped
   (src/lib/page-model.mjs); accepted only on a declared page, for exactly that source text */
const removedDesc = new Map((repairs.descriptionsRemoved || []).map((t) => [t.page, t]));
const h1Label = new Map((repairs.h1 || []).map((t) => [t.page, t]));

function score(override) {
  const fields = ['title', 'description', 'canonical', 'robots', 'h1'];
  const tally = Object.fromEntries(fields.map((f) => [f, { same: 0, repaired: 0, mismatch: 0 }]));
  const mismatches = [];
  let noindex = 0;
  for (const page of content.pages) {
    const p = pathOf(page.url);
    const slug = p.replace(/^\/|\/$/g, '');
    const file = slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html');
    const html = override && override.has(p) ? override.get(p) : fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (html === null) { mismatches.push({ page: p, field: 'page', got: 'missing' }); continue; }
    const s = seoBy.get(page.url) || {};
    const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
    const h = headOf(html);
    const judge = (field, ok, rep, got, want) => { if (ok) tally[field].same++; else if (rep) tally[field].repaired++; else { tally[field].mismatch++; mismatches.push({ page: p, field, got, want }); } };
    const rt = repairedTitle.get(p);
    judge('title', h.title === (s.title || '').trim(), rt && rt.to === h.title, h.title, s.title);
    const sd = (s.metaDescription || '').trim();
    judge('description', sd ? h.description === sd : h.description === null, (!sd && h.description && derivedDesc.has(p) && derivedDesc.get(p).to === h.description) || (!!sd && h.description === null && removedDesc.has(p) && removedDesc.get(p).from === sd), h.description, sd || '(none)');
    const rc = repairedCanon.get(p);
    judge('canonical', slashUrl(h.canonical) === slashUrl(s.canonical), rc && slashUrl(rc.to) === slashUrl(h.canonical), h.canonical, s.canonical || '(none)');
    const rr = rawRobots(raw);
    judge('robots', (h.robots || '') === rr, false, h.robots, rr);
    if (/noindex/.test(h.robots || '')) noindex++;
    const srcH1 = clean((page.h1 || [])[0] || '');
    const lab = h1Label.get(p);
    const one = h.h1s.length === 1;
    judge('h1', one && srcH1 && h.h1s[0] === srcH1, one && lab && lab.h1 === h.h1s[0], h.h1s.join(' | ') || '(none)', srcH1 || '(none at source)');
    /* fix round 2 */
    const derived = !sd && !!h.description;
    if (derived) tally.descDerived = (tally.descDerived || 0) + 1;
    for (const why of descProblems(p, html, h.description, derived)) mismatches.push({ page: p, field: 'description-provenance', got: h.description, want: why });
    const ld = ldProblems(p, raw, html);
    tally.structuredData = tally.structuredData || { pages: 0, problems: 0 };
    tally.structuredData.pages++;
    tally.structuredData.problems += ld.length;
    for (const why of ld) mismatches.push({ page: p, field: 'structured-data', got: why, want: 'accounted for (carried, repaired as declared, or declared removed)' });
  }
  return { tally, mismatches, noindex };
}
const out = score(null);
/* positive control: a planted wrong title on the home page */
const homeHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const ctl = score(new Map([['/', homeHtml.replace(/<title>[\s\S]*?<\/title>/i, '<title>Planted wrong title</title>')]]));
const firedTitle = ctl.mismatches.some((m) => m.page === '/' && m.field === 'title');
/* fix round 2 controls (in memory, each on its own page) */
const fileOfPage = (p) => { const s = p.replace(/^\/|\/$/g, ''); return s ? path.join(DIST, s, 'index.html') : path.join(DIST, 'index.html'); };
const readPage = (p) => (fs.existsSync(fileOfPage(p)) ? fs.readFileSync(fileOfPage(p), 'utf8') : '');
const tplPage = [...TEMPLATE_PAGES].sort()[0];
/* (a) the footer template's own link-only icon labels as a planted derived description; (b) a planted derived
   description on a template page */
/* QA round 1 (wf6, CONTENT-13): the footer template's social labels now print as icon links (aria-label only), so the
   control plants its own link-only paragraph of the source's labels in <main> instead of reading them from the page */
const footer = readPage('/template/footer/').replace(/<\/main>/i, '<p><a href="#a">Visit us on facebook</a> <a href="#b">Visit us on yelp</a> <a href="#c">Visit us on google</a></p></main>');
const iconText = clean(((footer.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0].match(/<(p|li)\b[^>]*>((?:\s*<a\b[^>]*>[^<]*<\/a>\s*){2,})<\/\1>/i) || [])[2] || '');
const descA = iconText ? descProblems('/template/footer/', footer, iconText, true) : [];
const descB = descProblems(tplPage, readPage(tplPage), 'Planted description of a template page that is long enough.', true);
const firedDesc = descA.some((x) => /link-only/.test(x)) && descB.some((x) => /template/.test(x));
/* (c) a post's BlogPosting dropped, (d) its headline changed, (e) an FAQPage planted on that page */
/* the control needs a rebuilt page that carries a BlogPosting; none (a tree without them) leaves it unfired: exit 1 */
const postPage = (repairs.structuredData || []).find((d) => d.type === 'BlogPosting' && /"@type":"BlogPosting"/.test(readPage(d.page)));
let firedLd = false;
if (postPage) {
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', content.pages.find((x) => pathOf(x.url) === postPage.page).savedAs), 'utf8');
  const html = readPage(postPage.page);
  const mutate = (fn) => html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (m, a, j, z) => { const o = JSON.parse(j); fn(o); return a + JSON.stringify(o) + z; });
  const c1 = ldProblems(postPage.page, raw, mutate((o) => { o['@graph'] = o['@graph'].filter((n) => n['@type'] !== 'BlogPosting'); }));
  const c2 = ldProblems(postPage.page, raw, mutate((o) => { o['@graph'].find((n) => n['@type'] === 'BlogPosting').headline = 'Planted headline'; }));
  const c3 = ldProblems(postPage.page, raw, mutate((o) => { o['@graph'].push({ '@type': 'FAQPage', mainEntity: [] }); }));
  firedLd = c1.some((x) => /neither carried nor declared/.test(x)) && c2.some((x) => /headline/.test(x)) && c3.some((x) => /FAQPage node has no source/.test(x));
}
/* (f) the R2-2 failure mode itself - a source block removed with NO declaration: each REMOVE declaration is withdrawn
   in memory, one at a time (a parseable FAQPage, an unparseable VideoObject), and that page must then be reported.
   No REMOVE declaration of either kind on the tree leaves the control unfired: exit 1. */
const removeCtl = {};
for (const [kind, pickRow, want] of [
  ['parseable', (d) => !/does not parse/.test(d.why || ''), /is neither carried nor declared removed/],
  ['unparseable', (d) => /does not parse/.test(d.why || ''), /\(unparseable at source\) has no REMOVE declaration/],
]) {
  const d = (repairs.structuredData || []).find((x) => x.decision === 'REMOVE' && pickRow(x));
  if (!d) { removeCtl[kind] = false; continue; }
  const key = d.page + '|' + d.type;
  const saved = ldDecl.get(key);
  ldDecl.delete(key);
  try {
    const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', content.pages.find((x) => pathOf(x.url) === d.page).savedAs), 'utf8');
    removeCtl[kind] = ldProblems(d.page, raw, readPage(d.page)).some((x) => x.includes(d.type) && want.test(x)) ? d.page + ' ' + d.type : false;
  } finally { ldDecl.set(key, saved); }
}
const firedRemove = Object.values(removeCtl).every(Boolean);
firedLd = firedLd && firedRemove;
/* (g) QA round 1 (wf6, CONTENT-3): a declared description removal, withdrawn in memory, must be reported as a mismatch */
let firedDescRemoved = null;
const dr = (repairs.descriptionsRemoved || [])[0];
if (dr) {
  const saved = removedDesc.get(dr.page);
  removedDesc.delete(dr.page);
  try { firedDescRemoved = score(null).mismatches.some((m) => m.page === dr.page && m.field === 'description') ? dr.page : false; } finally { removedDesc.set(dr.page, saved); }
}
const fired = firedTitle && firedDesc && firedLd && firedDescRemoved !== false;
const report = { schema: 'rfec/seo-parity@1', dist: path.relative(PROJ, DIST).split(path.sep).join('/') || '.', tally: out.tally, noindexPages: out.noindex, control: { planted: 'wrong <title> on /; a link-only and a template-page derived description; a dropped BlogPosting, a changed headline and a planted FAQPage on ' + (postPage ? postPage.page : '-') + '; each kind of REMOVE declaration withdrawn', title: firedTitle, description: firedDesc, structuredData: firedLd, removeUndeclared: removeCtl, descriptionRemovalWithdrawn: firedDescRemoved, fired }, mismatches: out.mismatches };
if (WRITE_AUDIT) fs.writeFileSync(path.join(PROJ, 'audit/seo-parity.json'), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify(out.tally));
console.log('noindex pages', out.noindex, '· control', fired ? 'fired (title, description, structured data; undeclared removal: ' + Object.values(removeCtl).join(', ') + (firedDescRemoved ? '; withdrawn description removal: ' + firedDescRemoved : '') + ')' : 'DID NOT FIRE ' + JSON.stringify({ title: firedTitle, description: firedDesc, structuredData: firedLd, removeUndeclared: removeCtl, descriptionRemovalWithdrawn: firedDescRemoved }));
for (const m of out.mismatches.slice(0, 30)) console.log(' - mismatch', m.page, m.field, '| got:', String(m.got).slice(0, 90), '| want:', String(m.want).slice(0, 90));
if (out.mismatches.length || !fired) process.exit(1);
