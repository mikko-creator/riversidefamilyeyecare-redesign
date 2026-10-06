// short-text-parity.mjs - the text the sentence check cannot see. tools/sentence-parity.mjs only scores units of
// five words or more, so a lost date, phone number, form option or button label passes it. This tool takes every
// SHORT item from each page's CONTENT region (raw <main>, or <body> on the 6 /template/* pages; copies of the site
// menus, scripts and the removed search / voice-search forms excluded) and requires it on the rebuilt page's <main>:
//   date     "Feb 28, 2023", "May 12, 2026", "September 15, 2026", "04/01/2025"
//   phone    any NNN-NNN-NNNN / (NNN) NNN-NNNN number (phone and fax)
//   email    any address
//   price    "$1,500", "14.9%" (amounts and rates)
//   form     every Gravity Forms label, sub-label, legend, option text and screen-reader hint
//   menu     the toggle label and item labels of a menu that is NOT a copy of the site menus (template pages)
//   cta      every button / badge / Read More / submit label
//   heading  every heading (h1-h6 and the platform's div/span headings) of fewer than 5 words
// Match: exact (case-sensitive) after entity decoding and whitespace / quote / dash normalisation. An item that
// is a declared removal (audit/clone-removals.json: strings, page-scoped sentences, replacements) is reported as
// declared, not missing. Positive controls: one found item (a phone number), and one page-menu label, are each deleted
// from one rebuilt page IN MEMORY and must be reported missing; the run exits 1 when any item is missing or a control
// does not fire.
//   node tools/short-text-parity.mjs [--show 30] [--dir <dir>]   ($RFEC_DIST or --dir: no audit/ report)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(PROJ, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const show = Number(process.argv[process.argv.indexOf('--show') + 1]) || 30;
const content = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/content-inventory.json'), 'utf8'));
const removals = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/clone-removals.json'), 'utf8'));

const NAMED = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™', copy: '©', raquo: '»', deg: '°', dagger: '†', Dagger: '‡', le: '≤', sect: '§', para: '¶', times: '×' };
const decode = (s) => String(s || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m));
const norm = (s) => decode(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ').replace(/…/g, '...').replace(/\s+/g, ' ').trim();
const text = (h) => norm(String(h || '').replace(/<[^>]+>/g, ' '));
const words = (s) => s.split(' ').filter(Boolean).length;
const pathOf = (url) => { const p = new URL(url).pathname.replace(/^\/+|\/+$/g, ''); return p ? '/' + p + '/' : '/'; };

/* menus (the /template/* pages): a copy of the SITE menus - every item label is a chrome.json menu label (primary menu
   and children, footer menu, utility links) - is chrome, rendered from chrome.json, and is excluded with its module;
   any other menu is page content and its toggle label and item labels are checked (category "menu"; fix round 1,
   D6: the phone menu of /template/header-2/ was excluded as if it were the site menu) */
const chromeJson = JSON.parse(fs.readFileSync(path.join(PROJ, 'src/content/chrome.json'), 'utf8'));
const SITE_MENU = new Set([...chromeJson.nav.flatMap((n) => [n, ...(n.children || [])]), ...chromeJson.footer.columns.flatMap((c) => c.links), ...chromeJson.footer.util].map((x) => norm(x.label).toLowerCase()));
const menuLabels = (html) => [...html.matchAll(/<li\b[^>]*>\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => text(m[1]));
const isSiteMenu = (html) => menuLabels(html).every((l) => SITE_MENU.has(l.toLowerCase()));
function divEnd(html, at) {   /* index just past the </div> that closes the <div> opening at `at` */
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = at;
  let depth = 0, m;
  while ((m = re.exec(html))) { depth += m[1] ? -1 : 1; if (depth === 0) return m.index + m[0].length; }
  return html.length;
}
function dropSiteMenus(r) {
  let out = '', last = 0, m;
  const re = /<div\b[^>]*class="ecp-menu-wrapper\b[^"]*"[^>]*>/gi;
  while ((m = re.exec(r))) {
    const end = divEnd(r, m.index);
    const el = r.slice(m.index, end);
    out += r.slice(last, m.index) + (isSiteMenu(el) ? ' ' : el);
    last = re.lastIndex = end;
  }
  out += r.slice(last);
  return out.replace(/<nav\b[\s\S]*?<\/nav>/gi, (nav) => (isSiteMenu(nav) ? ' ' : nav));
}

function contentRegion(raw) {
  let r = (raw.match(/<main\b[\s\S]*?<\/main>/i) || raw.match(/<body\b[\s\S]*?<\/body>/i) || [raw])[0];
  r = r.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ');
  r = dropSiteMenus(r);   /* site-menu copies (template pages): chrome, rendered from chrome.json */
  r = r.replace(/<form\b[^>]*(?:role=["']search|ecp-search|voice_search)[\s\S]*?<\/form>/gi, ' ');   /* declared removals */
  return r;
}

function itemsOf(region) {
  const items = [];
  const add = (cat, v) => { const t = norm(v); if (t) items.push({ cat, text: t }); };
  const t = text(region);
  for (const m of t.matchAll(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.? \d{1,2}, \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g)) add('date', m[0]);
  for (const m of t.matchAll(/(?:\(\d{3}\)\s?|\b\d{3}[-. ])\d{3}[-. ]\d{4}\b/g)) add('phone', m[0]);
  for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) add('email', m[0]);
  for (const m of t.matchAll(/\$\s?\d[\d,]*(?:\.\d+)?|\b\d+(?:\.\d+)?%/g)) add('price', m[0]);
  /* form: GF labels, sub-labels, legends, options, screen-reader hints (the honeypot's own block excluded below) */
  const forms = [...region.matchAll(/<div\b[^>]*class=['"][^'"]*\bgform_wrapper\b[\s\S]*?<\/form>/gi)].map((m) => m[0].replace(/<li\b[^>]*gform_validation_container[\s\S]*?<\/li>/gi, ' ').replace(/<li\b[^>]*gfield--type-captcha[\s\S]*?<\/li>/gi, ' '));
  for (const f of forms) {
    for (const m of f.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)) add('form', text(m[1].replace(/<span class="gfield_required[\s\S]*?<\/span>\s*<\/span>/gi, '')));
    for (const m of f.matchAll(/<legend\b[^>]*>([\s\S]*?)<\/legend>/gi)) add('form', text(m[1].replace(/<span class="gfield_required[\s\S]*?<\/span>\s*<\/span>/gi, '')));
    for (const m of f.matchAll(/<option\b[^>]*>([\s\S]*?)<\/option>/gi)) add('form', text(m[1]));
    for (const m of f.matchAll(/<span\b[^>]*class=['"]screen-reader-text['"][^>]*>([\s\S]*?)<\/span>/gi)) add('form', text(m[1]));
    for (const m of f.matchAll(/<input\b[^>]*type=['"]submit['"][^>]*value=['"]([^'"]*)['"]/gi)) add('cta', m[1]);
  }
  /* page menus (any menu left in the region is not a site-menu copy): the toggle label and every item label */
  for (const m of region.matchAll(/<div class="ecp-menu-hamburger-trigger-label">([\s\S]*?)<\/div>/gi)) add('menu', text(m[1]));
  for (const nav of region.matchAll(/<nav\b[\s\S]*?<\/nav>/gi)) for (const l of menuLabels(nav[0])) add('menu', l);
  /* cta labels */
  for (const m of region.matchAll(/<span class="ecp-button-label">([\s\S]*?)<\/span>/gi)) add('cta', text(m[1]));
  for (const m of region.matchAll(/<div class="ecp-badge-title">([\s\S]*?)<\/div>/gi)) add('cta', text(m[1]));
  for (const m of region.matchAll(/<span class="ecp-post-meta-readmore">\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)) add('cta', text(m[1]));
  for (const m of region.matchAll(/<div class="ecp-contactlens-readmore">\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)) add('cta', text(m[1]));
  /* short headings */
  const heads = [
    ...[...region.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]),
    ...[...region.matchAll(/<span class="ecp-heading-text">([\s\S]*?)<\/span>\s*<\/(?:div|h[1-6])>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<span class="ecp-callout-title-text"[^>]*>([\s\S]*?)<\/span>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-post-title[^"]*">([\s\S]*?)<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-post-position[^"]*">([\s\S]*?)<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-gallery-item-caption">([\s\S]*?)<\/div>\s*<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-review-name">([\s\S]*?)<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-rating-time"[^>]*>([\s\S]*?)<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-post-attribute">([\s\S]*?)<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-childpages-link">\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-entry-title">\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="ecp-post-sitemap-link">\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<span class="ecp-accordion-trigger-label">([\s\S]*?)<\/span>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<div class="heading-h3">([\s\S]*?)<\/div>/gi)].map((m) => m[1]),
    ...[...region.matchAll(/<strong class="ecp-post-label">([\s\S]*?)<\/strong>/gi)].map((m) => m[1]),
  ].map(text).filter((h) => h && words(h) < 5);
  for (const h of heads) add('heading', h);
  return items;
}

const strDeclared = new Set((removals.strings || []).map((s) => norm(s.value)));
const pageSentences = new Map();
for (const s of removals.sentences || []) { const k = s.page || '*'; if (!pageSentences.has(k)) pageSentences.set(k, []); pageSentences.get(k).push(norm(s.value)); }
const replFrom = (removals.replacements || []).map((r) => norm(r.from));
const declaredOf = (it, p) => strDeclared.has(it.text) || replFrom.some((f) => it.text.includes(f)) || (pageSentences.get(p) || []).some((s) => s.includes(it.text) && !it.found);

function rebuiltMain(page) {
  const slug = new URL(page.url).pathname.replace(/^\/+|\/+$/g, '');
  const file = slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html');
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const main = (html.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0].replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  return text(main);
}

function score(pages, override) {
  const res = { pages: 0, items: 0, found: 0, declared: 0, missing: 0, byCat: {} };
  const missing = [], declared = [];
  for (const page of pages) {
    const built = override && override.has(page.url) ? override.get(page.url) : rebuiltMain(page);
    const p = pathOf(page.url);
    if (built === null) { missing.push({ page: p, cat: 'page', text: '(page missing)' }); res.missing++; continue; }
    res.pages++;
    const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
    const seen = new Set();
    for (const it of itemsOf(contentRegion(raw))) {
      const key = it.cat + '|' + it.text;
      if (seen.has(key)) continue;
      seen.add(key);
      res.items++;
      const c = (res.byCat[it.cat] = res.byCat[it.cat] || { items: 0, found: 0, declared: 0, missing: 0 });
      c.items++;
      if (built.includes(it.text)) { res.found++; c.found++; continue; }
      if (declaredOf(it, p)) { res.declared++; c.declared++; declared.push({ page: p, ...it }); continue; }
      res.missing++; c.missing++; missing.push({ page: p, ...it });
    }
  }
  return { res, missing, declared };
}

const out = score(content.pages);
/* positive control: delete one found item (a phone number, else any) from one rebuilt page, in memory */
let control = { fired: false };
for (const page of content.pages) {
  const built = rebuiltMain(page);
  if (!built) continue;
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
  const its = itemsOf(contentRegion(raw)).filter((i) => built.includes(i.text));
  const victim = its.find((i) => i.cat === 'phone') || its.find((i) => i.cat === 'date') || its[0];
  if (!victim) continue;
  const r2 = score([page], new Map([[page.url, built.split(victim.text).join(' ')]]));
  control = { page: pathOf(page.url), item: victim, fired: r2.missing.some((m) => m.text === victim.text && m.cat === victim.cat) };
  break;
}
/* positive control 2 (fix round 1): a page-menu label deleted from its rebuilt page, in memory, must be reported */
let controlMenu = { fired: false };
for (const page of content.pages) {
  const built = rebuiltMain(page);
  if (!built) continue;
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
  const victim = itemsOf(contentRegion(raw)).filter((i) => i.cat === 'menu' && built.includes(i.text)).sort((a, b) => b.text.length - a.text.length)[0];
  if (!victim) continue;
  const r2 = score([page], new Map([[page.url, built.split(victim.text).join(' ')]]));
  controlMenu = { page: pathOf(page.url), item: victim, fired: r2.missing.some((m) => m.text === victim.text && m.cat === 'menu') };
  break;
}
const report = { schema: 'rfec/short-text-parity@1', dist: path.relative(PROJ, DIST).split(path.sep).join('/') || '.', method: 'short items (dates, phone/fax numbers, emails, prices and rates, form labels/options/hints, CTA labels, page-menu labels, headings under 5 words) of each raw content region must appear in the rebuilt <main> (exact, case-sensitive, after entity/whitespace/quote/dash normalisation); copies of the site menus (chrome.json) are excluded; declared removals are listed apart', totals: out.res, control, controlMenu, missing: out.missing, declared: out.declared };
if (WRITE_AUDIT) fs.writeFileSync(path.join(PROJ, 'audit/short-text-parity.json'), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify({ pages: out.res.pages, items: out.res.items, found: out.res.found, declared: out.res.declared, missing: out.res.missing }));
console.log('by category', JSON.stringify(out.res.byCat));
console.log('control (planted deletion):', control.fired ? 'fired (' + control.page + ': ' + control.item.cat + ' "' + control.item.text + '")' : 'DID NOT FIRE');
console.log('control (planted menu-label deletion):', controlMenu.fired ? 'fired (' + controlMenu.page + ': menu "' + controlMenu.item.text + '")' : 'DID NOT FIRE');
for (const m of out.missing.slice(0, show)) console.log(' - missing', m.page, '|', m.cat, '|', m.text);
if (out.res.missing || !control.fired || !controlMenu.fired) process.exit(1);
