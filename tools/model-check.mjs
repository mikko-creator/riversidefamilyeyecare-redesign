// model-check.mjs - every page model in tmp/page-models/ (node src/build.mjs --dump-models) against the contract of
// docs/BUILD-NOTES.md "Page model contract" (schema rfec/page-model@1): one model per source page (+ 404.json), the
// required top-level keys with their types, sections with the required keys, blocks only from the closed type set
// (each with its required keys), section kinds / image roles / embed kinds from their closed sets, the family from
// src/content/site-map.json, every internal URL page-relative (no "/x" root-absolute, no source host), and every
// image ref present in model.images. Positive control: a mutated copy (unknown block type, unknown section kind, a
// root-absolute href, a missing key) must fail on all four counts.
// Added in fix round 1 (each with its own control): no end tag of a void element in any html field ("</br>", outside
// the prose element set of 5.4; D1); the breadcrumb invariant of 5.1 (the last segment is the page's own: current,
// href null; a segment the source links keeps an href; D2); `chrome.mobile` carries `media` and the mobile header's
// logo, whose file is shipped (5.7; D4); `declared[].kind` is from DECLARED_KINDS; and every page-level image drop of
// audit/clone-removals.json `images.droppedOnPages` is declared in that page's model (D5).
// Added in fix round 2 (R2-2, with its own control): the page's own structured data - every `structured-data`
// declaration (decision CARRY / REPAIR / REMOVE) agrees with `jsonLd['@graph']` (a carried type is in the graph, a
// removed one is not), every graph node other than Organization / Optometric / BreadcrumbList is declared carried,
// and `head.jsonLdHtml` holds exactly `jsonLd`.
//   node tools/model-check.mjs [--dir <dist>] [--models <dir>]   -> exit 1 on any violation or a silent control
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = process.argv.includes('--models') ? path.resolve(process.argv[process.argv.indexOf('--models') + 1]) : path.join(ROOT, 'tmp/page-models');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(ROOT, 'dist'));
const { BLOCK_TYPES, MODEL_SCHEMA, SECTION_KINDS, IMAGE_ROLES, EMBED_KINDS, DECLARED_KINDS } = await import(pathToFileURL(path.join(ROOT, 'src/lib/page-model.mjs')).href);
const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/content-inventory.json'), 'utf8'));
const removals = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/clone-removals.json'), 'utf8'));
const VOID_END = /<\/(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\s*>/i;
const FAMILIES = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/site-map.json'), 'utf8')).templates);
const ORIGIN_HOST = /riversidefamilyeyecare\.com/i;
const TOP = { schema: 'string', path: 'string', sourcePath: 'string', url: 'string', slug: 'string', depth: 'number', family: 'string', layout: 'string', region: 'string', isHome: 'boolean', as404: 'boolean', title: 'string', h1: 'object', metaDescription: 'object', canonical: 'string', robots: 'string', noindex: 'boolean', og: 'object', twitter: 'object', jsonLd: 'object', breadcrumbs: 'array|null', date: 'object|null', sections: 'array', prose: 'string', aside: 'object|null', forms: 'array', images: 'array', placeholders: 'array', embeds: 'array', declared: 'array', links: 'object', chrome: 'object', head: 'object' };
const SECTION = { id: 'string', kind: 'string', node: 'string|null', heading: 'object|null', background: 'array', blocks: 'array', label: 'string|null', prose: 'string', images: 'array', ctas: 'array' };
const BLOCK_KEYS = {
  prose: ['html'], callout: ['title', 'image', 'html', 'buttons', 'imageFirst'], cta: ['buttons'], badges: ['items'], childpages: ['variant', 'items'], posts: ['view', 'items'],
  team: ['view', 'members'], testimonials: ['items'], reviews: ['items'], visit: ['title', 'subs', 'address', 'contacts', 'hours', 'map', 'order'], hours: ['rows'], accordion: ['items'],
  video: ['kind'], products: ['items'], equipment: ['items'], gallery: ['items'], logos: ['kind', 'items'], sitemap: ['items'], docs: ['items'], form: ['form', 'html'], cherry: ['mode', 'snippet'],
};
const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
function check(m, name) {
  const errs = [];
  for (const [k, t] of Object.entries(TOP)) if (!t.split('|').includes(typeOf(m[k]))) errs.push(name + ': ' + k + ' is ' + typeOf(m[k]) + ', want ' + t);
  if (m.schema !== MODEL_SCHEMA) errs.push(name + ': schema ' + m.schema);
  if (!FAMILIES.includes(m.family)) errs.push(name + ': family ' + m.family + ' is not a family of src/content/site-map.json');
  if (!['builder', 'classic'].includes(m.layout)) errs.push(name + ': layout ' + m.layout);
  for (const im of m.images || []) if (!IMAGE_ROLES.includes(im.role)) errs.push(name + ': image ' + im.id + ' has an unknown role ' + im.role);
  for (const e of m.embeds || []) if (!EMBED_KINDS.includes(e.kind)) errs.push(name + ': unknown embed kind ' + e.kind);
  for (const d of m.declared || []) if (!DECLARED_KINDS.includes(d.kind)) errs.push(name + ': unknown declared kind ' + d.kind);
  /* structured data (fix round 2): declarations <-> graph <-> the head script */
  const graph = (m.jsonLd && Array.isArray(m.jsonLd['@graph'])) ? m.jsonLd['@graph'] : [];
  const sd = (m.declared || []).filter((d) => d.kind === 'structured-data');
  for (const d of sd) {
    if (!['CARRY', 'REPAIR', 'REMOVE'].includes(d.decision) || typeof d.type !== 'string' || typeof d.why !== 'string' || !d.why) errs.push(name + ': structured-data declaration needs type, decision CARRY / REPAIR / REMOVE and why: ' + JSON.stringify(d).slice(0, 120));
    const inGraph = graph.some((n) => n['@type'] === d.type);
    if (d.decision === 'REMOVE' && inGraph && !['Organization', 'Optometric', 'BreadcrumbList'].includes(d.type)) errs.push(name + ': structured data ' + d.type + ' is declared REMOVE but is in jsonLd');
    if (d.decision !== 'REMOVE' && !inGraph) errs.push(name + ': structured data ' + d.type + ' is declared ' + d.decision + ' but is not in jsonLd');
  }
  for (const n of graph) if (!['Organization', 'Optometric', 'BreadcrumbList'].includes(n['@type']) && !sd.some((d) => d.type === n['@type'] && d.decision !== 'REMOVE')) errs.push(name + ': jsonLd node ' + n['@type'] + ' is not declared carried');
  const script = /^<script type="application\/ld\+json">([\s\S]*)<\/script>$/.exec((m.head && m.head.jsonLdHtml) || '');
  let parsed = null;
  try { parsed = script ? JSON.parse(script[1]) : null; } catch { parsed = null; }
  if (!parsed || JSON.stringify(parsed) !== JSON.stringify(m.jsonLd)) errs.push(name + ': head.jsonLdHtml does not hold exactly jsonLd');
  /* breadcrumbs (5.1): the last segment is the page's own (current, href null); no other segment is current; a segment
     the source links (its path is set) keeps an href */
  if (Array.isArray(m.breadcrumbs) && m.breadcrumbs.length) {
    const bc = m.breadcrumbs, last = bc[bc.length - 1];
    if (last.current !== true || last.href !== null) errs.push(name + ': breadcrumbs: the last segment is not the current one with href null');
    bc.slice(0, -1).forEach((b, i) => {
      if (b.current) errs.push(name + ': breadcrumbs: segment ' + i + ' is current but not last');
      if (b.path && !b.href) errs.push(name + ': breadcrumbs: segment ' + i + ' ("' + b.label + '") links ' + b.path + ' at source but has no href');
    });
  }
  /* chrome.mobile (5.7): the mobile header's media query and its own logo, a shipped file */
  const mob = m.chrome && m.chrome.mobile;
  if (!mob || typeof mob.media !== 'string' || !mob.media || !mob.logo || !['url', 'w', 'h', 'alt', 'href'].every((k) => k in mob.logo)) errs.push(name + ': chrome.mobile lacks media + logo { url, w, h, alt, href }');
  else if (!fs.existsSync(path.join(DIST, 'img', String(mob.logo.url).split('/').pop()))) errs.push(name + ': chrome.mobile.logo file not shipped in ' + path.relative(ROOT, DIST) + '/img: ' + mob.logo.url);
  const ids = new Set((m.images || []).map((i) => i.id));
  (m.sections || []).forEach((s, si) => {
    for (const [k, t] of Object.entries(SECTION)) if (!t.split('|').includes(typeOf(s[k]))) errs.push(name + ' s' + si + ': ' + k + ' is ' + typeOf(s[k]));
    if (!SECTION_KINDS.includes(s.kind)) errs.push(name + ' s' + si + ': unknown section kind ' + s.kind);
    for (const id of s.images || []) if (!ids.has(id)) errs.push(name + ' s' + si + ': image ' + id + ' not in model.images');
    (s.blocks || []).forEach((b, bi) => {
      if (!BLOCK_TYPES.includes(b.type)) { errs.push(name + ' s' + si + 'b' + bi + ': unknown block type ' + b.type); return; }
      for (const k of BLOCK_KEYS[b.type] || []) if (!(k in b)) errs.push(name + ' s' + si + 'b' + bi + ' (' + b.type + '): missing ' + k);
    });
  });
  /* every href / src / url value in the model: page-relative or external, never root-absolute, never the source host
     (canonical, og.url, og.image, twitter.image and jsonLd are absolute BY DESIGN and are skipped) */
  const walk = (o, at) => {
    if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) { if (['jsonLd', 'og', 'twitter', 'canonical', 'url', 'sourceHref', 'snippet', 'head', 'scriptSrc', 'fontsHref'].includes(k) && at === '') continue; walk(v, at + '.' + k); } return; }
    if (typeof o !== 'string') return;
    const key = at.split('.').pop();
    if ((key === 'html' || key === 'prose') && VOID_END.test(o)) errs.push(name + at + ': end tag of a void element (' + VOID_END.exec(o)[0] + '), outside the prose element set (5.4)');
    if (['href', 'src', 'url'].includes(key) || key === 'html' || key === 'prose') {
      const vals = key === 'html' || key === 'prose' ? [...o.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((x) => x[1]) : [o];
      for (const v of vals) {
        if (/^\/(?!\/)/.test(v)) errs.push(name + at + ': root-absolute ' + v);
        if (ORIGIN_HOST.test(v) && !/^mailto:/i.test(v)) errs.push(name + at + ': source-host URL ' + v.slice(0, 80));
      }
    }
  };
  walk(m, '');
  return errs;
}
if (!fs.existsSync(DIR)) { console.error('no tmp/page-models: run node src/build.mjs --dump-models'); process.exit(1); }
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const expected = content.pages.map((p) => { const s = new URL(p.url).pathname.replace(/^\/+|\/+$/g, ''); return (s ? s.replace(/\//g, '__') : 'index') + '.json'; }).concat(['404.json']);
const missing = expected.filter((f) => !files.includes(f));
const extra = files.filter((f) => !expected.includes(f));
const errors = [];
const counts = { models: 0, sections: 0, blocks: 0, byType: {}, breadcrumbTrails: 0, declared: {} };
const models = new Map();   /* path -> model (source pages; the 404.html variant under its own path) */
for (const f of files) {
  const m = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  models.set(m.path, m);
  counts.models++;
  if (m.breadcrumbs) counts.breadcrumbTrails++;
  for (const d of m.declared || []) counts.declared[d.kind] = (counts.declared[d.kind] || 0) + 1;
  for (const s of m.sections) { counts.sections++; for (const b of s.blocks) { counts.blocks++; counts.byType[b.type] = (counts.byType[b.type] || 0) + 1; } }
  errors.push(...check(m, f));
}
/* every page-level image drop the build declares in audit/clone-removals.json is also declared in that page's model,
   so a theme or the image plan finds every empty slot from the model alone (5.1 `declared`) */
const dropped = (removals.images && removals.images.droppedOnPages) || [];
function droppedCheck(modelOf) {
  const errs = [];
  for (const d of dropped) {
    const m = modelOf(d.page);
    if (!m) { errs.push('droppedOnPages ' + d.page + ': no model for that page'); continue; }
    if (!(m.declared || []).some((x) => /^(image|background)-dropped$/.test(x.kind) && x.src === d.src)) errs.push('droppedOnPages ' + d.page + ': ' + String(d.src).split('/').pop() + ' is not declared in the page model');
  }
  return errs;
}
errors.push(...droppedCheck((p) => models.get(p)));
/* positive control */
const sample = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
sample.sections[0].blocks.push({ type: 'carousel-of-doom' });
sample.sections[1].kind = 'carousel';
sample.chrome.nav[0].href = '/hours-location/';
delete sample.title;
const ctl = check(sample, 'control');
const fired1 = ctl.some((e) => /unknown block type/.test(e)) && ctl.some((e) => /unknown section kind/.test(e)) && ctl.some((e) => /root-absolute/.test(e)) && ctl.some((e) => /title is undefined/.test(e));
/* control 2 (fix round 1): a trailed page whose first crumb lost its link and whose last crumb is not current, a
   "</br>" in a prose block, no mobile logo, an unknown declared kind */
const trailed = [...models.values()].find((m) => !m.as404 && m.breadcrumbs && m.breadcrumbs.length >= 2 && m.breadcrumbs[0].href && m.sections.some((s) => s.blocks.some((b) => b.type === 'prose')));
const fired2 = !trailed ? false : (() => {
  const c2 = JSON.parse(JSON.stringify(trailed));
  c2.breadcrumbs[0].href = null;
  c2.breadcrumbs[c2.breadcrumbs.length - 1].current = false;
  c2.sections.flatMap((s) => s.blocks).find((b) => b.type === 'prose').html += '<h2>a </br> b</h2>';
  delete c2.chrome.mobile.logo;
  c2.declared.push({ kind: 'mystery' });
  const ctl2 = check(c2, 'control2');
  return ['has no href', 'not the current one', 'end tag of a void element', 'chrome.mobile lacks', 'unknown declared kind'].every((t) => ctl2.some((e) => e.includes(t)));
})();
/* control 3 (fix round 1): one declared image drop removed from its page model must be reported */
const fired3 = !dropped.length ? false : (() => {
  const d = dropped[0];
  const copy = JSON.parse(JSON.stringify(models.get(d.page)));
  copy.declared = copy.declared.filter((x) => x.src !== d.src);
  return droppedCheck((p) => (p === d.page ? copy : models.get(p))).some((e) => e.startsWith('droppedOnPages ' + d.page));
})();
/* control 4 (fix round 2): a post model whose carried BlogPosting left the graph, and one with an undeclared node */
const post = [...models.values()].find((m) => (m.declared || []).some((d) => d.kind === 'structured-data' && d.type === 'BlogPosting'));
const fired4 = !post ? false : (() => {
  const c4 = JSON.parse(JSON.stringify(post));
  c4.jsonLd['@graph'] = c4.jsonLd['@graph'].filter((n) => n['@type'] !== 'BlogPosting');
  const c5 = JSON.parse(JSON.stringify(post));
  c5.jsonLd['@graph'].push({ '@type': 'FAQPage' });
  const e4 = check(c4, 'control4'), e5 = check(c5, 'control5');
  return e4.some((e) => /declared REPAIR but is not in jsonLd/.test(e)) && e4.some((e) => /jsonLdHtml does not hold/.test(e)) && e5.some((e) => /FAQPage is not declared carried/.test(e));
})();
const fired = fired1 && fired2 && fired3 && fired4;
console.log('models', counts.models, '/', expected.length, '· missing', missing.length, '· extra', extra.length, '· sections', counts.sections, '· blocks', counts.blocks, '· violations', errors.length, '· control', fired ? 'fired' : 'DID NOT FIRE (' + JSON.stringify({ contract: fired1, roundOne: fired2, droppedOnPages: fired3, structuredData: fired4 }) + ')');
console.log('breadcrumb trails', counts.breadcrumbTrails, '· declared', JSON.stringify(counts.declared), '· droppedOnPages checked', dropped.length, '· control 2 on', trailed ? trailed.path : '-', '· control 3 on', dropped.length ? dropped[0].page : '-', '· control 4 on', post ? post.path : '-');
console.log('block types', JSON.stringify(counts.byType));
for (const e of [...missing.map((f) => 'missing ' + f), ...extra.map((f) => 'extra ' + f), ...errors].slice(0, Number(process.argv[process.argv.indexOf('--show') + 1]) || 30)) console.log('  ' + e);
if (missing.length || extra.length || errors.length || !fired) process.exit(1);
