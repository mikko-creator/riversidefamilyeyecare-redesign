// heading-parity.mjs - every heading of each source page's CONTENT keeps its level on the rebuilt page (fix round 2,
// R2-4: the heading-run merge inherited from R had turned the source h2 "The right fit" into an h3, and no gate
// read heading levels).
// Source: the raw <main> (the <body> on the 6 /template/* pages), without comments, scripts, styles, svg, and
// without the chrome the build renders from chrome.json instead: nav, header (except the post's own
// header.ecp-entry-header), footer, aside, div.ecp-secondary, and copies of the site menus. Every h1-h6 with text.
// Rebuilt: every h1-h6 of <main> (the title band's h1 included).
// Each distinct (level, text) of the source must be in the rebuilt <main> at the same level. The one documented
// exception is HD-1 (docs/BUILD-NOTES.md section 3): the page's own h1 prints in the title band, every OTHER h1
// becomes an h2 (a source h1 found as an h2 is reported "declared"). Any other difference is a finding:
//   level          the text is a heading at another level
//   not-a-heading  the text is in <main>, but not as a heading
//   absent         the text is not in <main> at all
// Text: entities decoded, <br> and whitespace runs as one space.
// Positive controls (in memory): one source h2 demoted to h3 on its rebuilt page must be reported "level", and
// one turned into a <p> must be reported "not-a-heading".
//   node tools/heading-parity.mjs [--dir <dir>]   ($RFEC_DIST or --dir: no audit/ report)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(PROJ, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const J = (f) => JSON.parse(fs.readFileSync(path.join(PROJ, f), 'utf8'));
const content = J('audit/content-inventory.json');
const chrome = J('src/content/chrome.json');

const NAMED = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™', copy: '©', raquo: '»', laquo: '«', deg: '°', times: '×' };
const decode = (s) => String(s || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m));
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim();
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const SITE_MENU = new Set([...chrome.nav.flatMap((n) => [n, ...(n.children || [])]), ...chrome.footer.columns.flatMap((c) => c.links), ...chrome.footer.util].map((x) => norm(x.label).toLowerCase()));

/* the element that starts at `at` (an opening tag), as [start, end) of the whole element; same-name nesting counted */
function elementEnd(html, at, tag) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = at;
  let depth = 0, m;
  while ((m = re.exec(html))) { depth += m[1] ? -1 : 1; if (depth === 0) return m.index + m[0].length; }
  return html.length;
}
/* drop every element whose opening tag passes test(tag, openTag, start, endOf) (outermost first); endOf() finds the
   element's end only when a test needs it */
function dropElements(html, test) {
  let out = '', i = 0;
  const re = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    if (VOID.has(tag)) continue;
    let end = -1;
    const at = m.index, name = m[1];
    const endOf = () => (end < 0 ? (end = elementEnd(html, at, name)) : end);
    if (!test(tag, m[0], at, endOf)) continue;
    endOf();
    out += html.slice(i, m.index) + ' ';
    i = re.lastIndex = end;
  }
  return out + html.slice(i);
}
const menuLabels = (html) => [...html.matchAll(/<li\b[^>]*>\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => norm(m[1].replace(/<[^>]+>/g, ' ')).toLowerCase());
const isSiteMenu = (html) => { const l = menuLabels(html); return l.length > 0 && l.every((x) => SITE_MENU.has(x)); };

function sourceRegion(raw) {
  let r = (raw.match(/<main\b[\s\S]*?<\/main>/i) || raw.match(/<body\b[\s\S]*?<\/body>/i) || [raw])[0];
  r = r.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ');
  return dropElements(r, (tag, open) => {
    if (tag === 'nav' || tag === 'aside' || tag === 'footer') return true;
    if (tag === 'header') return !/class="[^"]*\becp-entry-header\b/.test(open);
    if (tag === 'div' && /class="[^"]*\becp-secondary\b/.test(open)) return true;
    return false;
  });
}
function headingsOf(html) {
  const out = [];
  for (const m of html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const text = norm(m[2].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' '));
    if (text) out.push({ level: m[1].toLowerCase(), text });
  }
  return out;
}
/* site-menu copies (the /template/* pages) carry no headings, but their wrapper is excluded the same way the build
   and tools/short-text-parity.mjs exclude it, so a menu heading could never count twice */
function withoutSiteMenus(r) {
  return dropElements(r, (tag, open, start, endOf) => tag === 'div' && /class="ecp-menu-wrapper\b/.test(open) && isSiteMenu(r.slice(start, endOf())));
}
const pathOf = (url) => { const p = new URL(url).pathname.replace(/^\/+|\/+$/g, ''); return p ? '/' + p + '/' : '/'; };
const fileOf = (p) => { const s = p.replace(/^\/|\/$/g, ''); return s ? path.join(DIST, s, 'index.html') : path.join(DIST, 'index.html'); };
const mainOf = (html) => (html.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0];

function judgePage(p, raw, html) {
  const src = headingsOf(withoutSiteMenus(sourceRegion(raw)));
  const main = mainOf(html);
  const got = headingsOf(main);
  const have = new Set(got.map((h) => h.level + '|' + h.text));
  const mainText = ' ' + norm(main.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')) + ' ';
  const res = { headings: 0, same: 0, declared: 0, findings: [] };
  const seen = new Set();
  for (const h of src) {
    const key = h.level + '|' + h.text;
    if (seen.has(key)) continue;
    seen.add(key);
    res.headings++;
    if (have.has(key)) { res.same++; continue; }
    if (h.level === 'h1' && have.has('h2|' + h.text)) { res.declared++; continue; }   /* HD-1 */
    const other = got.find((g) => g.text === h.text);
    if (other) res.findings.push({ page: p, kind: 'level', text: h.text, source: h.level, rebuilt: other.level });
    else if (mainText.includes(' ' + h.text + ' ') || mainText.includes(h.text)) res.findings.push({ page: p, kind: 'not-a-heading', text: h.text, source: h.level });
    else res.findings.push({ page: p, kind: 'absent', text: h.text, source: h.level });
  }
  return res;
}

function score(override) {
  const tot = { pages: 0, headings: 0, same: 0, declared: 0, findings: 0 };
  const findings = [];
  for (const page of content.pages) {
    const p = pathOf(page.url);
    const html = override && override.has(p) ? override.get(p) : fs.existsSync(fileOf(p)) ? fs.readFileSync(fileOf(p), 'utf8') : null;
    if (html === null) { findings.push({ page: p, kind: 'page-missing' }); tot.findings++; continue; }
    tot.pages++;
    const r = judgePage(p, fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8'), html);
    tot.headings += r.headings; tot.same += r.same; tot.declared += r.declared; tot.findings += r.findings.length;
    findings.push(...r.findings);
  }
  return { tot, findings };
}

const out = score(null);
/* positive controls: the first source h2 found unchanged on its rebuilt page is demoted to h3, then turned into a p */
let control = { fired: false };
for (const page of content.pages) {
  const p = pathOf(page.url);
  if (!fs.existsSync(fileOf(p))) continue;
  const html = fs.readFileSync(fileOf(p), 'utf8');
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
  const h2 = headingsOf(withoutSiteMenus(sourceRegion(raw))).find((h) => h.level === 'h2');
  if (!h2) continue;
  const tag = [...mainOf(html).matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].find((m) => norm(m[1].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')) === h2.text);
  if (!tag) continue;
  const asH3 = html.replace(tag[0], '<h3>' + tag[1] + '</h3>');
  const asP = html.replace(tag[0], '<p>' + tag[1] + '</p>');
  const r1 = score(new Map([[p, asH3]])).findings.some((f) => f.page === p && f.kind === 'level' && f.text === h2.text && f.rebuilt === 'h3');
  const r2 = score(new Map([[p, asP]])).findings.some((f) => f.page === p && f.kind === 'not-a-heading' && f.text === h2.text);
  control = { page: p, heading: h2.text, level: r1, notAHeading: r2, fired: r1 && r2 };
  break;
}
const report = { schema: 'rfec/heading-parity@1', dist: path.relative(PROJ, DIST).split(path.sep).join('/') || '.', totals: out.tot, control, findings: out.findings };
if (WRITE_AUDIT) fs.writeFileSync(path.join(PROJ, 'audit/heading-parity.json'), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify(out.tot));
console.log('control', control.fired ? 'fired (' + control.page + ' "' + control.heading + '": h2 -> h3 reported as level, h2 -> p as not-a-heading)' : 'DID NOT FIRE ' + JSON.stringify(control));
for (const f of out.findings.slice(0, 40)) console.log(' - ' + f.kind, f.page, JSON.stringify(f.text || ''), f.source || '', f.rebuilt ? '-> ' + f.rebuilt : '');
if (out.tot.findings || !control.fired) process.exit(1);
