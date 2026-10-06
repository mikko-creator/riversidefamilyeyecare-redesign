// link-parity.mjs - every link of each page's CONTENT region survives in the rebuilt <main> (fix round 1, D2/D3: a
// breadcrumb "Home" link lost on 17 archives and an external referral URL re-normalised passed every other gate).
// Source links = every <a href> of the raw content region (<main>, or <body> on the 6 /template/* pages), minus the
// copies of the site menus (their items are all chrome.json menu labels; rendered from chrome.json) and the removed
// search / voice-search forms. Each must have a twin in the rebuilt <main>:
//   external  http(s) hrefs VERBATIM (trimmed; "//host" counts as "https://host"), mailto: as written, tel: with the
//             documented space removal ("tel: 239-..." -> "tel:239-...", chrome.json change C01)
//   internal  the same own path (a page-relative "../x/index.html" resolved against the page; a live alias resolved
//             to its page through audit/site-inventory.json, as the build's MOVED map does)
// Exempt by rule (reported as counts, never as missing): javascript: and "#" hrefs and an empty tel: (unwrapped to
// their words: CL-1, the accordion toggles, the template phone menu); internal targets the build reports dead
// (audit/dead-links.json); and declared removals in audit/clone-removals.json - `documents` (an unharvested PDF, by
// page) and every `elements` selector of the form a[href^="..."] (by URL prefix).
// Positive controls: the home's external referral link re-normalised, and one archive's breadcrumb Home link
// removed, each in memory, must be reported.
//   node tools/link-parity.mjs [--dir <dir>] [--show 30]   ($RFEC_DIST or --dir: no audit/ report) -> exit 1 on any miss
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(PROJ, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const show = Number(process.argv[process.argv.indexOf('--show') + 1]) || 30;
const J = (f) => JSON.parse(fs.readFileSync(path.join(PROJ, f), 'utf8'));
const content = J('audit/content-inventory.json');
const chrome = J('src/content/chrome.json');
const removals = J('audit/clone-removals.json');
const deadLinks = J('audit/dead-links.json');
const siteInv = J('audit/site-inventory.json');
const ORIGIN = chrome.origin;
const OWN = new RegExp('^(?:www\\.)?' + new URL(ORIGIN).hostname.replace(/^www\./i, '').replace(/\./g, '[.]') + '$', 'i');

const NAMED = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…' };
const decode = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&([a-z]+);/gi, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : m));
const text = (h) => decode(String(h || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const ownPath = (u) => decodeURIComponent(u.pathname).replace(/index\.html$/, '').replace(/\/?$/, '/');

/* pages and live aliases (as the build reads them) */
const pagePaths = new Set(content.pages.map((p) => ownPath(new URL(p.url))));
const alias = new Map();
for (const pg of siteInv.pages || []) for (const a of pg.aliases || []) { try { alias.set(ownPath(new URL(a)), ownPath(new URL(pg.finalUrl || pg.url))); } catch { /* not a URL */ } }
const dead = new Set((deadLinks.targets || []).map((t) => t.path));

/* site-menu copies (template pages): every item label is a chrome.json menu label */
const SITE_MENU = new Set([...chrome.nav.flatMap((n) => [n, ...(n.children || [])]), ...chrome.footer.columns.flatMap((c) => c.links), ...chrome.footer.util].map((x) => text(x.label).toLowerCase()));
const isSiteMenu = (html) => [...html.matchAll(/<li\b[^>]*>\s*<a\b[^>]*>([\s\S]*?)<\/a>/gi)].every((m) => SITE_MENU.has(text(m[1]).toLowerCase()));
function divEnd(html, at) {
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = at;
  let depth = 0, m;
  while ((m = re.exec(html))) { depth += m[1] ? -1 : 1; if (depth === 0) return m.index + m[0].length; }
  return html.length;
}
function contentRegion(raw) {
  let r = (raw.match(/<main\b[\s\S]*?<\/main>/i) || raw.match(/<body\b[\s\S]*?<\/body>/i) || [raw])[0];
  r = r.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ');
  let out = '', last = 0, m;
  const re = /<div\b[^>]*class="ecp-menu-wrapper\b[^"]*"[^>]*>/gi;
  while ((m = re.exec(r))) { const end = divEnd(r, m.index); const el = r.slice(m.index, end); out += r.slice(last, m.index) + (isSiteMenu(el) ? ' ' : el); last = re.lastIndex = end; }
  r = (out + r.slice(last)).replace(/<nav\b[\s\S]*?<\/nav>/gi, (nav) => (isSiteMenu(nav) ? ' ' : nav));
  return r.replace(/<form\b[^>]*(?:role=["']search|ecp-search|voice_search)[\s\S]*?<\/form>/gi, ' ');
}

/* a link target: { kind: 'rule' | 'external' | 'scheme' | 'internal', v } */
function target(href, base) {
  const h = decode(href).trim();
  if (!h || /^javascript:/i.test(h) || h.startsWith('#') || /^tel:\s*$/i.test(h)) return { kind: 'rule', v: h || '(empty)' };
  if (/^tel:/i.test(h)) return { kind: 'scheme', v: 'tel:' + h.slice(4).replace(/\s+/g, '') };
  if (/^mailto:/i.test(h)) return { kind: 'scheme', v: h };
  let u;
  try { u = new URL(h.startsWith('//') ? 'https:' + h : h, base); } catch { return { kind: 'external', v: h }; }
  if (!/^https?:$/.test(u.protocol) || !OWN.test(u.hostname)) return { kind: 'external', v: h.startsWith('//') ? 'https:' + h : h };
  let p = ownPath(u);
  if (!pagePaths.has(p) && alias.has(p)) p = alias.get(p);
  return { kind: 'internal', v: p + (u.hash || '') };
}
const linksOf = (html) => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ href: (/\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(' ' + m[1]) || []), text: text(m[2]) })).filter((l) => l.href.length).map((l) => ({ href: l.href[1] !== undefined ? l.href[1] : l.href[2], text: l.text }));

/* declared exemptions */
const declaredPrefixes = (removals.elements || []).flatMap((e) => [...String(e.selector || '').matchAll(/a\[href\^="([^"]+)"\]/g)].map((m) => m[1]));
const declaredDocs = new Set((removals.documents || []).map((d) => d.page + '|' + decode(d.src).trim()));

function rebuiltMain(page) {
  const slug = new URL(page.url).pathname.replace(/^\/+|\/+$/g, '');
  const file = slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html');
  if (!fs.existsSync(file)) return null;
  return (fs.readFileSync(file, 'utf8').match(/<main\b[\s\S]*?<\/main>/i) || [''])[0];
}

function score(pages, override) {
  const res = { pages: 0, sourceLinks: 0, kept: 0, exemptByRule: 0, exemptDeclared: 0, exemptDead: 0, missing: 0 };
  const missing = [];
  for (const page of pages) {
    const p = ownPath(new URL(page.url));
    const base = ORIGIN + p;
    const main = override && override.has(page.url) ? override.get(page.url) : rebuiltMain(page);
    if (main === null) { missing.push({ page: p, kind: 'page', target: '(page missing)' }); res.missing++; continue; }
    res.pages++;
    const have = new Set(linksOf(main).map((l) => { const t = target(l.href, base); return t.kind + '|' + t.v; }));
    const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
    for (const l of linksOf(contentRegion(raw))) {
      res.sourceLinks++;
      const t = target(l.href, base);
      if (t.kind === 'rule') { res.exemptByRule++; continue; }
      if (have.has(t.kind + '|' + t.v)) { res.kept++; continue; }
      if (t.kind === 'internal' && dead.has(t.v.replace(/#.*$/, ''))) { res.exemptDead++; continue; }
      if (declaredDocs.has(p + '|' + decode(l.href).trim()) || declaredPrefixes.some((pre) => decode(l.href).trim().startsWith(pre))) { res.exemptDeclared++; continue; }
      res.missing++;
      missing.push({ page: p, kind: t.kind, target: t.v, text: l.text.slice(0, 80) });
    }
  }
  return { res, missing };
}

const out = score(content.pages);
/* positive controls, in memory */
const home = content.pages.find((pg) => ownPath(new URL(pg.url)) === '/');
const homeMain = rebuiltMain(home) || '';
const ctlA = score([home], new Map([[home.url, homeMain.replace(/href="https:\/\/www\.alumiermd\.com\?code=/g, 'href="https://www.alumiermd.com/?code=')]]));
const firedA = homeMain.includes('https://www.alumiermd.com?code=') && ctlA.missing.some((m) => m.kind === 'external' && /alumiermd/.test(m.target));
const archive = content.pages.find((pg) => ownPath(new URL(pg.url)) === '/tag/dry-eye/');
const archiveMain = archive ? rebuiltMain(archive) || '' : '';
const ctlB = archive ? score([archive], new Map([[archive.url, archiveMain.replace(/<nav class="crumbs"[\s\S]*?<\/nav>/, '<nav class="crumbs"><ol><li>Home</li></ol></nav>')]])) : { missing: [] };
const firedB = ctlB.missing.some((m) => m.kind === 'internal' && m.target === '/');
const fired = firedA && firedB;
const report = { schema: 'rfec/link-parity@1', dist: path.relative(PROJ, DIST).split(path.sep).join('/') || '.', totals: out.res, declaredPrefixes, control: { externalRenormalised: firedA, breadcrumbHomeUnlinked: firedB, fired }, missing: out.missing };
if (WRITE_AUDIT) fs.writeFileSync(path.join(PROJ, 'audit/link-parity.json'), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify(out.res));
console.log('control (home referral link re-normalised; archive Home link removed):', fired ? 'fired' : 'DID NOT FIRE ' + JSON.stringify({ firedA, firedB }));
for (const m of out.missing.slice(0, show)) console.log(' - missing', m.page, '|', m.kind, '|', m.target, '|', JSON.stringify(m.text || ''));
if (out.res.missing || !fired) process.exit(1);
