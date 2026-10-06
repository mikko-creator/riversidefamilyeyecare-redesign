// write-facts.mjs - facts/client-facts.json, written FROM THE EVIDENCE, never typed by hand.
// Adapted from the reference build's (R, docs/PORT-NOTES.md) tools/write-facts.mjs (another site on the same EyeCarePro
// WordPress + Beaver Builder platform) to Riverside Family Eye Care. Every entry carries a `source` pointer into
// audit/raw/ (the untouched 2026-10-01 crawl) or src/content/chrome.json, which this script re-verifies string by
// string against EVERY chrome-bearing raw page before it writes anything. sr-fabrication reads the output as the
// list of claims the rebuild may make beyond the extractor's text capture (it walks every value of every key).
//   node tools/write-facts.mjs                      (writes facts/client-facts.json)
//   node tools/write-facts.mjs --raw <dir> --chrome <file> --out <file>   (alternate inputs/output; positive controls)
// Fails closed - exit 1, nothing written - unless ALL of these hold:
//   - every raw page matches its sha256 in audit/site-inventory.json (the evidence is the untouched crawl);
//   - chrome.json's top bar, logos, menus (all four copies per page), mobile header, skip link, footer menu, social
//     icons, footer button, NAP line, copyright and utility links match the 142 header+footer pages, and its quick
//     actions, social icons, location widget, address, phone, fax, email and hours match the 132 sidebar pages;
//   - every hours widget anywhere prints chrome.hours (sources that disagree must be recorded by hand, not merged);
//   - every tel: link is the one phone, every map embed the one place_id, the head JSON-LD NAP is chrome's NAP;
//   - the testimonial parse finds exactly the 8 cards on 4 pages counted on 2026-10-01 (6 distinct reviews);
//   - /our-eye-doctors/ lists 3 doctors and /the-staff/ 8 staff, each name the h1 of its /team/ page;
//   - /insurance/ lists 16 vision and 6 medical plans; the Cherry and CareCredit pages say what the menu says;
//   - no legal-entity suffix (LLC, PLLC, Inc., P.A., P.C. ...) stands next to the practice or a doctor in visible text, and
//     the only suffixes printed are the 2 third-party names counted on 2026-10-01 (verify-facts stage addition);
//   - QA round 1 (wf6, CONTENT-2), section 12: the refused team photos are exactly the 5 placeholders of OPEN-DECISIONS
//     Q15; /contact-lenses/ shows 7 recommended products, each name equal to its image alt; every declared claim
//     context's source text is verbatim on its raw page and every word of its rebuild context is on that page.
//     (QA round 1, regressions R1: the plates and product names are checked but no longer declared as figure text.)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined; };
const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.resolve(opt('raw') || path.join(PROJ, 'audit/raw'));
const CHROME_FILE = path.resolve(opt('chrome') || path.join(PROJ, 'src/content/chrome.json'));
const OUT = path.resolve(opt('out') || path.join(PROJ, 'facts/client-facts.json'));
const rel = (p) => path.relative(PROJ, p).split(path.sep).join('/');
const R = rel(RAW);
const ORIGIN = 'https://www.riversidefamilyeyecare.com';
const CRAWL = '2026-10-01';

/* ---------- failure collection: every problem is reported, then nothing is written ---------- */
const problems = [];
const grouped = new Map();
const bad = (msg) => problems.push(msg);
const badAt = (check, file, detail) => { const k = check + ': ' + detail; if (!grouped.has(k)) grouped.set(k, []); grouped.get(k).push(file); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const show = (v) => { const s = JSON.stringify(v); return s && s.length > 300 ? s.slice(0, 300) + '...' : s; };
const expectAt = (check, file, got, want) => { if (!eq(got, want)) badAt(check, file, 'raw ' + show(got) + ' != chrome.json ' + show(want)); };

/* ---------- raw HTML helpers (same as tmp/wf1/facts/lib-raw.mjs) ---------- */
const NAMED = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', copy: '©', reg: '®', trade: '™', raquo: '»', laquo: '«', bull: '•', middot: '·' };
const decode = (s) => String(s == null ? '' : s)
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m));
const INLINE = new Set(['a', 'span', 'strong', 'b', 'em', 'i', 'u', 'small', 'sup', 'sub', 'abbr', 'time', 'font', 'mark', 's']);
/* visible text: inline tags vanish (as a browser renders them), block tags become a space, <br> a line break when keepBr */
function text(html, keepBr = false) {
  let s = String(html || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\u0001')
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, t) => (INLINE.has(t.toLowerCase()) ? '' : ' '));
  s = decode(s);
  if (keepBr) return s.split('\u0001').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
  return s.replace(/\u0001/g, ' ').replace(/\s+/g, ' ').trim();
}
function attrs(tag) {
  const o = {};
  for (const m of String(tag).matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) o[m[1].toLowerCase()] = decode(m[2] !== undefined ? m[2] : m[3]);
  return o;
}
const ownPath = (href) => { const h = String(href || '').trim(); return h.startsWith(ORIGIN) ? h.slice(ORIGIN.length) || '/' : h; };
function regions(raw) {
  const r = {};
  const hS = raw.indexOf('<header class="ecp-header">');
  if (hS >= 0) r.header = raw.slice(hS, raw.indexOf('</header>', hS) + 9);
  const mS = raw.search(/<main\b/);
  if (mS >= 0) r.main = raw.slice(mS, raw.indexOf('</main>', mS) + 7);
  const sS = raw.indexOf('<div class="ecp-secondary ecp-widget-area"');
  const fS = raw.indexOf('<footer class="ecp-footer">');
  if (sS >= 0) r.sidebar = raw.slice(sS, fS > sS ? fS : undefined);
  if (fS >= 0) r.footer = raw.slice(fS, raw.indexOf('</footer>', fS) + 9);
  const bS = raw.search(/<body\b/);
  if (bS >= 0 && hS > bS) r.preHeader = raw.slice(bS, hS);
  r.head = raw.slice(0, bS < 0 ? raw.length : bS);
  return r;
}
const fragments = (html, openRe, close) => [...String(html || '').matchAll(openRe)].map((m) => { const e = html.indexOf(close, m.index); return html.slice(m.index, e < 0 ? undefined : e + close.length); });
function menuTree(fragment) {
  const root = { children: [] };
  const stack = [root];
  let current = null;
  let depth = 0;
  for (const m of String(fragment).matchAll(/<ul\b[^>]*>|<\/ul>|<li\b[^>]*>|<\/li>|<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const t = m[0];
    if (/^<ul/i.test(t)) { depth++; if (depth > 1) { if (!current) throw new Error('sub-menu without a parent item'); stack.push(current); } }
    else if (/^<\/ul/i.test(t)) { if (depth > 1) current = stack.pop(); depth--; }
    else if (/^<li/i.test(t)) { const node = { label: null, href: null, children: [] }; stack[stack.length - 1].children.push(node); current = node; }
    else if (/^<\/li/i.test(t)) current = null;
    else if (current && current.label === null) { current.href = attrs(m[1]).href; current.label = text(m[2]); }
  }
  const norm = (n) => ({ label: n.label, href: ownPath(n.href), children: n.children.map(norm) });
  return root.children.map(norm);
}
const flat = (tree) => tree.map((n) => (n.children.length ? { label: n.label, href: n.href, children: n.children.length } : { label: n.label, href: n.href }));
const socialOf = (html) => [...String(html || '').matchAll(/<a class="ecp-icon\b[^"]*ecp-network-([a-z]+)"[^>]*>/g)].map((m) => { const a = attrs(m[0]); return { network: m[1], label: a['aria-label'], href: a.href, rel: a.rel }; });
const buttonsOf = (html) => [...String(html || '').matchAll(/(<a class="ecp-button\b[^>]*>)([\s\S]*?)<\/a>/g)].map((m) => ({ label: text((m[2].match(/<span class="ecp-button-label">([\s\S]*?)<\/span>/) || [])[1]), href: ownPath(attrs(m[1]).href) }));
const SUBHEAD = /<div class="ecp-post-subheading">\s*<div class="heading-h3">[\s\S]*?<\/div>\s*<\/div>/g;
const hoursOf = (html) => [...String(html || '').matchAll(/<li class="ecp-post-hours-item[^"]*">\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/g)].map((m) => [text(m[1]).replace(/:$/, ''), text(m[2], true)]);
/* every div.ecp-post.ecp-posttype-location (the practice's location post) inside one region */
function locationWidgets(html) {
  const starts = [...String(html || '').matchAll(/<div class="ecp-post ecp-post-(\d+) ecp-posttype-location\b[^"]*"[^>]*>/g)];
  return starts.map((s, i) => {
    const chunk = html.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : undefined).replace(SUBHEAD, ' ');
    const w = { post: s[1] };
    const t = chunk.match(/<div class="ecp-post-title[^"]*">[\s\S]*?<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    if (t) w.title = { title: text(t[2]), href: ownPath(t[1]) };
    const a = chunk.match(/<div class="ecp-post-address[^"]*">([\s\S]*?)<\/div>/);
    if (a) w.addressLines = text(a[1], true).split('\n');
    for (const m of chunk.matchAll(/<li class="ecp-post-contactdetails-contacttype-([A-Za-z]+)">([\s\S]*?)<\/li>/g)) {
      const body = m[2];
      const warn = (body.match(/<span class="ecp-post-contactdetails-email-warningmessage">([\s\S]*?)<\/span>/) || [])[1];
      const data = (body.match(/<span class="ecp-post-data"[^>]*>([\s\S]*)<\/span>/) || [])[1] || '';
      const link = data.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/);
      (w.contact = w.contact || {})[m[1]] = {
        label: text((body.match(/<strong class="ecp-post-label">([\s\S]*?)<\/strong>/) || [])[1]),
        value: link ? text(link[2]) : text(data.replace(/<span class="ecp-post-contactdetails-email-warningmessage">[\s\S]*?<\/span>/, '')),
        href: link ? attrs('<a ' + link[1]).href : null,
        note: warn ? text(warn) : null,
      };
    }
    const h = hoursOf(chunk);
    if (h.length) w.hours = h;
    const map = chunk.match(/<iframe\b[^>]*src="([^"]*google\.com\/maps[^"]*)"/);
    if (map) w.placeId = (map[1].match(/q=place_id:([A-Za-z0-9_-]+)/) || [])[1] || 'NO-PLACE-ID ' + map[1].replace(/key=[^&]+/, 'key=...');
    return w;
  });
}
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const pathOf = (u) => { const p = new URL(u).pathname; return p.endsWith('/') ? p : p + '/'; };
/* Google place ids of the form ChIJ... are a protobuf holding the listing's two 64-bit feature ids */
function featureIdOf(placeId) {
  const b = Buffer.from(String(placeId).replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (placeId.length % 4)) % 4), 'base64');
  if (b.length !== 20 || b[0] !== 0x0a || b[1] !== 0x12 || b[2] !== 0x09 || b[11] !== 0x11) return null;
  return '0x' + b.readBigUInt64LE(3).toString(16) + ':0x' + b.readBigUInt64LE(12).toString(16);
}

function main() {
  /* ---- 0. inputs and evidence integrity ---- */
  let chrome;
  try { chrome = JSON.parse(fs.readFileSync(CHROME_FILE, 'utf8')); } catch (e) { bad('cannot read ' + rel(CHROME_FILE) + ': ' + e.message); return null; }
  const inv = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/site-inventory.json'), 'utf8'));
  const imgInv = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/image-inventory.json'), 'utf8'));
  if (inv.origin !== ORIGIN || chrome.origin !== ORIGIN) bad('origin: inventory ' + inv.origin + ' / chrome.json ' + chrome.origin + ' != ' + ORIGIN);
  const files = fs.readdirSync(RAW).filter((f) => f.endsWith('.html')).sort();
  const listed = new Map(inv.pages.map((p) => [p.savedAs, p]));
  for (const p of inv.pages) if (!files.includes(p.savedAs)) bad('evidence: ' + p.savedAs + ' (in audit/site-inventory.json) is missing from ' + R);
  for (const f of files) {
    const rec = listed.get(f);
    if (!rec) { bad('evidence: ' + R + '/' + f + ' is not a crawled page (not in audit/site-inventory.json)'); continue; }
    if (sha256(fs.readFileSync(path.join(RAW, f))) !== rec.sha256) bad('evidence: ' + R + '/' + f + ' does not match its crawl sha256 in audit/site-inventory.json - the raw evidence was edited');
  }
  const pages = files.map((f) => { const raw = fs.readFileSync(path.join(RAW, f), 'utf8'); return { f, raw, r: regions(raw) }; });
  const byFile = new Map(pages.map((p) => [p.f, p]));
  const byPath = new Map();
  for (const p of inv.pages) {
    byPath.set(pathOf(p.url), p.savedAs);
    for (const a of p.aliases || []) byPath.set(pathOf(a), p.savedAs);
  }
  const page = (f) => { const p = byFile.get(f); if (!p) throw new Error('raw page missing: ' + f); return p; };
  const pathByFile = new Map(inv.pages.map((p) => [p.savedAs, pathOf(p.url)]));

  /* ---- 1. chrome.json internal consistency ---- */
  const c = chrome;
  const n = c.footer.nap;
  if (c.topbar.call.href !== 'tel:' + c.phone || c.mobileHeader.call.href !== 'tel:' + c.phone) bad('chrome.json: call hrefs are not tel:' + c.phone);
  if (c.topbar.call.sourceHref.replace(/\s+/g, '') !== c.topbar.call.href) bad('chrome.json: topbar.call.sourceHref does not normalise to topbar.call.href');
  if (c.addressLines.join(' ') !== c.address.street + ' ' + c.address.locality + ', ' + c.address.region + ' ' + c.address.postalCode) bad('chrome.json: addressLines ' + show(c.addressLines) + ' != address ' + show(c.address));
  if (c.mapQuery !== c.brandName + ', ' + c.address.street + ', ' + c.address.locality + ', ' + c.address.region + ' ' + c.address.postalCode) bad('chrome.json: mapQuery is not composed from brandName + address');
  const napComposed = n.name + n.located + n.street + n.sep + n.locality + ', ' + n.region + ' ' + n.postalCode + n.postalEnd + ' ' + n.phoneLabel + ' ' + c.phone + n.phoneEnd + ' ' + n.site.label;
  if (napComposed !== n.text) bad('chrome.json: footer.nap parts compose to ' + show(napComposed) + ', not footer.nap.text');
  if (n.name !== c.brandName || n.street !== c.address.street || n.locality !== c.address.locality || n.region !== c.address.region || n.postalCode !== c.address.postalCode) bad('chrome.json: footer.nap differs from brandName/address');
  if ((c.footerLinks && !eq(c.footerLinks, c.footer.columns[0].links)) || (c.utilLinks && !eq(c.utilLinks, c.footer.util))) bad('chrome.json: footerLinks/utilLinks, when present, must be copies of footer.columns[0].links / footer.util');
  /* every own-origin chrome link must be a crawled page (or a crawl alias) */
  const chromeLinks = [];
  const walkNav = (items, where) => items.forEach((it, i) => { chromeLinks.push([where + '[' + i + ']', it.href]); walkNav(it.children || [], where + '[' + i + '].children'); });
  walkNav(c.nav, 'nav');
  c.quickActions.forEach((q, i) => chromeLinks.push(['quickActions[' + i + ']', q.href]));
  c.footer.columns[0].links.forEach((l, i) => chromeLinks.push(['footer.columns[0].links[' + i + ']', l.href]));
  c.footer.util.forEach((l, i) => chromeLinks.push(['footer.util[' + i + ']', l.href]));
  chromeLinks.push(['topbar.address', c.topbar.address.href], ['topbar.appointment', c.topbar.appointment.href], ['mobileHeader.appointment', c.mobileHeader.appointment.href], ['sidebar.location', c.sidebar.location.href], ['footer.button', c.footer.button.href]);
  for (const [where, href] of chromeLinks) if (!byPath.has(href)) bad('chrome.json ' + where + ': ' + href + ' is not a crawled page or alias');

  /* ---- 2. header + footer on every chrome-bearing page ---- */
  const chromePages = pages.filter((p) => p.r.header);
  const noHeader = pages.filter((p) => !p.r.header).map((p) => p.f);
  if (noHeader.some((f) => !/^template-/.test(f))) bad('pages without the site header that are not /template/ plumbing: ' + noHeader.filter((f) => !/^template-/.test(f)).join(' '));
  if (chromePages.length !== 142) bad('expected the header on 142 pages (2026-10-01), found ' + chromePages.length + ' - the source changed; re-verify before declaring');
  const wantButtons = [{ label: c.topbar.appointment.label, href: c.topbar.appointment.href }, { label: c.topbar.call.label, href: c.topbar.call.sourceHref }];
  for (const p of chromePages) {
    const h = p.r.header;
    const f = p.f;
    const rich = (h.match(/<div class="ecp-richtext[^"]*">([\s\S]*?)<\/div>/) || [])[1] || '';
    const ta = rich.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/);
    expectAt('top bar address callout (header div.ecp-richtext a)', f, ta ? { label: text(ta[2]), href: ownPath(attrs('<a ' + ta[1]).href) } : null, c.topbar.address);
    expectAt('top bar buttons (header a.ecp-button)', f, buttonsOf(h), wantButtons);
    const lg = attrs((h.match(/<div class="ecp-logo[^"]*">[\s\S]*?(<img\b[^>]*>)/) || [])[1] || '');
    if (!String(lg.src || '').includes(c.logo.srcPattern) || lg.alt !== c.logo.alt) badAt('desktop logo (div.ecp-logo img)', f, 'raw src ' + show(lg.src) + ' alt ' + show(lg.alt));
    const lm = attrs((h.match(/<div class="ecp-mobile-header__logo">[\s\S]*?(<img\b[^>]*>)/) || [])[1] || '');
    if (!String(lm.src || '').includes(c.logo.srcPatternMobile) || lm.alt !== c.logo.altMobile) badAt('mobile logo (div.ecp-mobile-header__logo img)', f, 'raw src ' + show(lm.src) + ' alt ' + show(lm.alt));
    const ma = attrs((h.match(/<a\b[^>]*class="ecp-mobile-header__button_appointment"[^>]*>/) || [])[0] || '');
    expectAt('mobile header appointment (a.ecp-mobile-header__button_appointment)', f, { label: ma['aria-label'], href: ownPath(ma.href), newTab: ma.target === '_blank' }, c.mobileHeader.appointment);
    const mc = attrs((h.match(/<a\b[^>]*class="ecp-mobile-header__button_call"[^>]*>/) || [])[0] || '');
    expectAt('mobile header call (a.ecp-mobile-header__button_call)', f, { label: mc['aria-label'], href: mc.href }, c.mobileHeader.call);
    const navs = [...fragments(h, /<nav class="menu- 2 ecp-menu\b[^"]*">/g, '</nav>'), ...fragments(h, /<nav class="ecp-menu-hamburger-content\b[^"]*">/g, '</nav>')];
    if (navs.length !== 4) badAt('primary menu copies (2 x nav.ecp-menu + 2 x hamburger)', f, 'found ' + navs.length);
    navs.forEach((nv, i) => expectAt('primary menu tree, copy ' + (i + 1) + ' of 4 (labels + hrefs, all levels)', f, menuTree(nv), c.nav));
    const toggles = [...h.matchAll(/<a class="ecp-menu-hamburger-trigger-button"[^>]*>/g)].map((m) => attrs(m[0])['aria-label']);
    if (toggles.length !== 2 || toggles.some((t) => t !== c.mobileHeader.menuToggle)) badAt('hamburger aria-label', f, show(toggles));
    if (!h.includes('<title>' + c.mobileHeader.menuOpen + '</title>') || !h.includes('<title>' + c.mobileHeader.menuClose + '</title>')) badAt('hamburger svg titles', f, 'no <title>' + c.mobileHeader.menuOpen + '/' + c.mobileHeader.menuClose + '</title>');
    const sk = (String(p.r.preHeader || '').match(/<a href="#content" class="ecp-skip-to-content"[^>]*>([\s\S]*?)<\/a>/) || [])[1];
    expectAt('skip link (a.ecp-skip-to-content)', f, text(sk), c.skip);
    /* footer */
    const ft = p.r.footer || '';
    const fm = [...fragments(ft, /<nav class="menu- 3 ecp-menu\b[^"]*">/g, '</nav>'), ...fragments(ft, /<nav class="ecp-menu-vertical-content\b[^"]*">/g, '</nav>')];
    if (fm.length !== 2) badAt('footer menu copies (nav.ecp-menu menu 3 + vertical mobile copy)', f, 'found ' + fm.length);
    fm.forEach((nv, i) => expectAt('footer menu, copy ' + (i + 1) + ' of 2', f, flat(menuTree(nv)), c.footer.columns[0].links));
    expectAt('footer social icons (a.ecp-icon.ecp-network-*)', f, socialOf(ft), c.footer.social);
    expectAt('footer button (a.ecp-button)', f, buttonsOf(ft), [c.footer.button]);
    const napHtml = (ft.match(/<div class="ecp-footer-address\b[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    expectAt('footer NAP line (div.ecp-footer-address)', f, text(napHtml), n.text);
    const napA = [...napHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => { const a = attrs('<a ' + m[1]); return { label: text(m[2]), href: a.href, newTab: a.target === '_blank' }; });
    expectAt('footer NAP links (tel + site)', f, napA, [{ label: c.phone, href: 'tel:' + c.phone, newTab: false }, n.site]);
    expectAt('footer NAP name (strong)', f, text((napHtml.match(/<strong>([\s\S]*?)<\/strong>/) || [])[1]), n.name);
    const powered = text((ft.match(/<a\b[^>]*class="ecp-powered-by"[^>]*>([\s\S]*?)<\/a>/) || [])[1]);
    if (!powered.startsWith(c.footer.copyright + ' ')) badAt('copyright (a.ecp-powered-by)', f, 'raw ' + show(powered));
    const ul = [...(((ft.match(/<div class="ecp-global-footer__end">([\s\S]*?)<\/div>/) || [])[1]) || '').matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({ a: attrs('<a ' + m[1]), label: text(m[2]) }));
    expectAt('utility links (div.ecp-global-footer__end, Login excluded)', f, ul.filter((u) => u.a.id !== 'ecp-footer-login-link').map((u) => ({ label: u.label, href: u.a.href })), c.footer.util);
  }

  /* ---- 3. sidebar on every sidebar page ---- */
  const sidePages = pages.filter((p) => p.r.sidebar);
  if (sidePages.length !== 132) bad('expected the sidebar on 132 pages (2026-10-01), found ' + sidePages.length + ' - the source changed; re-verify before declaring');
  const L = c.sidebar.location;
  const wantContact = {
    Phone: { label: L.phoneLabel, value: c.phone, href: 'tel:' + c.phone, note: null },
    Fax: { label: L.faxLabel, value: c.fax, href: null, note: null },
    Email: { label: L.emailLabel, value: c.email, href: 'mailto:' + c.email, note: L.emailNote },
  };
  /* the location post's own page prints the post in <main> and omits the sidebar widget (EyeCarePro); every other
     sidebar carries it. That page must show the complete post in <main> instead. */
  const locFile = byPath.get(L.href);
  let sideWidgets = 0;
  for (const p of sidePages) {
    const s = p.r.sidebar;
    const badges = [...s.matchAll(/(<a class="ecp-badge\b[^>]*>)([\s\S]*?)<\/a>/g)].map((m) => { const a = attrs(m[1]); return { label: text((m[2].match(/<div class="ecp-badge-title">([\s\S]*?)<\/div>/) || [])[1]), aria: a['aria-label'], href: ownPath(a.href), newTab: a.target === '_blank', sourceIcon: (m[2].match(/data-icon="([^"]*)"/) || [])[1] || '' }; });
    expectAt('sidebar badges = quickActions (a.ecp-badge)', p.f, badges, c.quickActions.map((q) => ({ label: q.label, aria: q.label, href: q.href, newTab: q.newTab, sourceIcon: q.sourceIcon })));
    expectAt('sidebar social icons (div.ecp-iconset)', p.f, socialOf(s), c.footer.social);
    const w = locationWidgets(s);
    if (p.f === locFile && w.length === 0) {
      const mw = locationWidgets(p.r.main);
      if (mw.length !== 1 || !mw[0].addressLines || !mw[0].contact || !mw[0].hours || !mw[0].placeId) badAt('location page ' + L.href + ': no sidebar widget, so <main> must carry the complete location post', p.f, 'found ' + show(mw.map((x) => Object.keys(x))));
      continue;
    }
    if (w.length !== 1) { badAt('sidebar location widget (div.ecp-posttype-location)', p.f, 'found ' + w.length); continue; }
    sideWidgets++;
    expectAt('sidebar location title (div.ecp-post-title a)', p.f, w[0].title, { title: L.title, href: L.href });
    expectAt('sidebar address (div.ecp-post-address)', p.f, w[0].addressLines, c.addressLines);
    expectAt('sidebar contact details (li.ecp-post-contactdetails-contacttype-*)', p.f, w[0].contact, wantContact);
    expectAt('sidebar hours (li.ecp-post-hours-item)', p.f, w[0].hours, c.hours);
    expectAt('sidebar map place_id (div.ecp-post-map iframe)', p.f, w[0].placeId, c.mapPlaceId);
  }

  /* ---- 4. every location widget, hours widget, tel:, mailto: and map embed anywhere ---- */
  const hoursWidgets = { main: [], sidebar: [] };
  const telHrefs = new Map();
  const mailtos = new Map();
  const placeIds = new Map();
  const faxPages = { main: new Set(), sidebar: new Set() };   /* pages whose location widget prints the fax, per region */
  for (const p of pages) {
    if (/^template-/.test(p.f)) continue;   /* WordPress plumbing pages: placeholder data (e.g. "555-555-5555") */
    for (const reg of ['main', 'sidebar']) {
      for (const w of locationWidgets(p.r[reg])) {
        if (w.contact && w.contact.Fax) faxPages[reg].add(p.f);
        if (w.title) expectAt('location widget title (' + reg + ')', p.f, w.title, { title: L.title, href: L.href });
        if (w.addressLines) expectAt('location widget address (' + reg + ')', p.f, w.addressLines, c.addressLines);
        if (w.contact) for (const [k, v] of Object.entries(w.contact)) expectAt('location widget ' + k + ' (' + reg + ')', p.f, { value: v.value, href: v.href, note: v.note }, { value: wantContact[k] ? wantContact[k].value : '(unexpected contact type ' + k + ')', href: wantContact[k] ? wantContact[k].href : null, note: wantContact[k] ? wantContact[k].note : null });
        if (w.placeId) expectAt('location widget map (' + reg + ')', p.f, w.placeId, c.mapPlaceId);
      }
      const hs = [...String(p.r[reg] || '').matchAll(/<div class="ecp-post-hours clear">([\s\S]*?)<\/ul>/g)].map((m) => hoursOf(m[1]));
      for (const h of hs) { hoursWidgets[reg].push(p.f); expectAt('hours widget (' + reg + ': div.ecp-post-hours) - sources disagree: record both by hand, do not merge', p.f, h, c.hours); }
    }
    const body = p.raw.slice(p.raw.search(/<body\b/));
    for (const m of body.matchAll(/href=["'](tel:[^"']*)["']/gi)) telHrefs.set(m[1], (telHrefs.get(m[1]) || 0) + 1);
    for (const m of body.matchAll(/href=["']mailto:([^"'?]*)/gi)) { if (!mailtos.has(m[1])) mailtos.set(m[1], new Set()); mailtos.get(m[1]).add(p.f); }
    for (const m of body.matchAll(/<iframe\b[^>]*src="([^"]*google\.com\/maps[^"]*)"/g)) { const id = (m[1].match(/q=place_id:([A-Za-z0-9_-]+)/) || [])[1] || 'none'; if (!placeIds.has(id)) placeIds.set(id, new Set()); placeIds.get(id).add(p.f); }
  }
  if (!hoursWidgets.main.includes('hours-location.html')) bad('/hours-location/ (hours-location.html) carries no hours widget in <main>');
  for (const [href, k] of telHrefs) if (href.replace(/\s+/g, '') !== 'tel:' + c.phone) bad('a tel: link that is not the practice phone: ' + href + ' (' + k + ' links)');
  const telTotal = [...telHrefs.values()].reduce((a, b) => a + b, 0);
  for (const id of placeIds.keys()) if (id !== c.mapPlaceId) bad('a map embed with another query: ' + id + ' on ' + [...placeIds.get(id)].join(' '));
  if (!mailtos.has(c.email)) bad('no mailto:' + c.email + ' anywhere');
  const otherMail = [...mailtos.keys()].filter((m) => m !== c.email);
  if (otherMail.length !== 1 || otherMail[0] !== 'optician@riversidefamilyeyecare.com' || !eq([...mailtos.get(otherMail[0])], ['website-accessibility-policy.html'])) bad('unexpected mailto set: ' + show([...mailtos].map(([k, v]) => [k, [...v].slice(0, 3)])));

  /* ---- 5. head JSON-LD: the business nodes repeat chrome's NAP ---- */
  const BUSINESS = ['LocalBusiness', 'MedicalBusiness', 'Optician', 'MedicalSpecialty :: Optometric'];
  const typeCount = new Map();
  let ldDescription = null;
  for (const p of pages) {
    for (const m of p.raw.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      let j;
      try { j = JSON.parse(m[1]); } catch { continue; }   /* 3 pages carry an unparseable VideoObject block; not NAP */
      const t = j['@type'];
      typeCount.set(t, (typeCount.get(t) || 0) + 1);
      if (BUSINESS.includes(t)) {
        const a = j.address || {};
        expectAt('JSON-LD ' + t + ' NAP', p.f, { name: j.name, telephone: j.telephone, street: a.streetAddress, locality: a.addressLocality, region: a.addressRegion, postalCode: a.postalCode, country: a.addressCountry, geo: j.geo || null, openingHours: j.openingHours || j.openingHoursSpecification || null },
          { name: c.brandName, telephone: c.phone, street: c.address.street, locality: c.address.locality, region: c.address.region, postalCode: c.address.postalCode, country: 'US', geo: null, openingHours: null });
        if (ldDescription === null) ldDescription = j.description;
        else if (j.description !== ldDescription) badAt('JSON-LD description', p.f, 'differs: ' + show(j.description));
      }
      if (t === 'Organization' && j.name !== c.brandName) badAt('JSON-LD Organization name', p.f, show(j.name));
    }
  }
  for (const t of [...BUSINESS, 'Organization']) if (typeCount.get(t) !== pages.length) bad('JSON-LD ' + t + ' on ' + (typeCount.get(t) || 0) + ' of ' + pages.length + ' pages');

  /* ---- 6. testimonials: both EyeCarePro markups, in every page's <main> ---- */
  const testimonials = [];
  const perPage = {};
  for (const p of pages) {
    const main = String(p.r.main || '').replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
    const starts = [...main.matchAll(/<div class="([^"]*\becp-posttype-testimonial\b[^"]*)"[^>]*>/g)];
    starts.forEach((s, i) => {
      let chunk = main.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : main.length);
      const widget = /\becp-review\b/.test(s[1]);
      const nameRe = widget ? /<div class="ecp-review-name">([\s\S]*?)<\/div>/ : /<div class="ecp-post-attribute"[^>]*>([\s\S]*?)<\/div>/;
      const nm = chunk.match(nameRe);
      if (!nm) { bad('testimonial card without a name element in ' + p.f); return; }
      chunk = chunk.slice(0, nm.index + nm[0].length);   /* the name closes every card in both markups */
      const quote = text((chunk.match(widget ? /<div class="ecp-review-comment ecp-post-content">([\s\S]*?)<\/div>/ : /<div class="ecp-post-content[^"]*">([\s\S]*?)<\/div>/) || [])[1]);
      const name = text(nm[1]).replace(/^-\s*/, '');
      const rating = (chunk.match(/ecp-rating-star-full/g) || []).length;
      const itemprop = (chunk.match(/itemprop="ratingValue">(\d+)</) || [])[1];
      if (!quote || !name || rating < 1 || rating > 5) bad('incomplete testimonial card in ' + p.f + ': ' + show({ quote: quote.slice(0, 60), name, rating }));
      if (itemprop && Number(itemprop) !== rating) bad('testimonial in ' + p.f + ': ' + rating + ' star icons but ratingValue ' + itemprop);
      const post = (s[1].match(/\becp-post-(\d+)\b/) || [])[1] || null;
      const reviewedAt = (chunk.match(/data-reviewed-at="([^"]*)"/) || [])[1] || null;
      const title = text((chunk.match(/<div class="ecp-post-title[^"]*">[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/) || [])[1]) || null;
      const t = { quote, name, rating, post: post ? 'testimonial post ' + post : null };
      if (title) t.title = title;
      if (reviewedAt) { t.reviewedAt = reviewedAt; t.shownAs = text((chunk.match(/<div class="ecp-rating-time"[^>]*>([\s\S]*?)<\/div>/) || [])[1]); }
      t.source = R + '/' + p.f + (widget
        ? ' <main> div.ecp-reviews-wrapper' + (/\bsplide__slide\b/.test(s[1]) ? ' (carousel)' : '') + ' > div.ecp-review: .ecp-review-comment / .ecp-review-name strong / count of .ecp-rating-star-full / .ecp-rating-time[data-reviewed-at]'
        : ' <main> div.ecp-post.ecp-posttype-testimonial: .ecp-post-content / .ecp-post-attribute / count of .ecp-rating-star-full') + ', live site ' + CRAWL;
      testimonials.push(t);
      perPage[p.f] = (perPage[p.f] || 0) + 1;
    });
  }
  const WANT_T = { 'contact-us-testimonials.html': 1, 'eyeglasses-designer-frames.html': 1, 'index.html': 5, 'testimonial-this-was-a-great-experience.html': 1 };
  if (!eq(perPage, WANT_T)) bad('expected the 8 testimonial cards on 4 pages counted on ' + CRAWL + ' ' + show(WANT_T) + ', found ' + show(perPage) + ' - the source changed; re-verify before declaring');
  const distinct = new Set(testimonials.map((t) => t.name + '\u0000' + t.quote));
  if (distinct.size !== 6) bad('expected 6 distinct reviews among the cards, found ' + distinct.size);

  /* ---- 7. people: /our-eye-doctors/ and /the-staff/ team cards, each name = its /team/ page h1 ---- */
  function teamCards(f) {
    const main = page(f).r.main;
    const starts = [...main.matchAll(/<div class="ecp-post ecp-post-(\d+) ecp-posttype-team\b[^"]*"([^>]*)>/g)];
    return starts.map((s, i) => {
      const chunk = main.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : undefined);
      const t = chunk.match(/<div class="ecp-post-title[^"]*">[\s\S]*?<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
      const pos = chunk.match(/<div class="ecp-post-position[^"]*">([\s\S]*?)<\/div>/);
      const im = attrs((chunk.match(/<img\b[^>]*>/) || [''])[0]);
      return { post: s[1], category: (s[2].match(/data-categories="([^"]*)"/) || [])[1] || '', name: t ? text(t[2]) : '', href: t ? ownPath(t[1]) : '', position: pos ? text(pos[1]) : '', alt: im.alt || '', src: im.src || '' };
    });
  }
  const h1Of = (f) => text((page(f).raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) || [])[1]);
  const mainText = (f) => text(page(f).r.main);
  const doctors = teamCards('our-eye-doctors.html');
  const staff = teamCards('the-staff.html');
  if (doctors.length !== 3 || doctors.some((d) => d.category !== 'Our Doctors')) bad('expected 3 "Our Doctors" cards on /our-eye-doctors/ (' + CRAWL + '), found ' + show(doctors.map((d) => [d.category, d.name])));
  if (staff.length !== 8 || staff.some((d) => d.category !== 'Our Staff')) bad('expected 8 "Our Staff" cards on /the-staff/ (' + CRAWL + '), found ' + show(staff.map((d) => [d.category, d.name])));
  /* the doctors' roles are their bios' own words; each phrase must be on the team page */
  const BIO = {
    'Dr. Brittany Degler, O.D.': 'Founder of Riverside Family Eyecare',
    'Dr. Kristin Nelson, O.D., IACMM': 'Doctor of Optometry specializing in pediatrics and myopia management',
    'Dr. Maivys Longa, O.D.': 'Dr. Longa draws from the experience she has running her own practice, Longa Family Eyecare.',
  };
  const people = [];
  for (const d of [...doctors, ...staff]) {
    const tf = byPath.get(d.href);
    if (!tf) { bad('team card ' + show(d.name) + ' links to ' + d.href + ', not a crawled page'); continue; }
    if (h1Of(tf) !== d.name) bad('team card name ' + show(d.name) + ' != h1 ' + show(h1Of(tf)) + ' of ' + tf);
    if (d.alt !== d.name) bad('team card ' + show(d.name) + ' photo alt is ' + show(d.alt));
    const tpos = (page(tf).r.main.match(/<div class="ecp-post-position[^"]*">([\s\S]*?)<\/div>/) || [])[1];
    if (tpos && text(tpos) && text(tpos) !== d.position) bad('position of ' + d.name + ' differs: card ' + show(d.position) + ' / ' + tf + ' ' + show(text(tpos)));
    if (d.category === 'Our Doctors') {
      const phrase = BIO[d.name];
      if (!phrase) { bad('no verified bio phrase for doctor ' + show(d.name) + ' - a new doctor; record their role by hand'); continue; }
      if (!mainText(tf).includes(phrase)) { bad('bio phrase ' + show(phrase) + ' not on ' + tf); continue; }
      people.push({ name: d.name, credentials: d.name.split(', ').slice(1).join(', '), role: 'optometrist; her bio: "' + phrase + '"', group: 'Our Doctors', page: d.href, source: R + '/our-eye-doctors.html div.ecp-post.ecp-post-' + d.post + '[data-categories="Our Doctors"] .ecp-post-title a; ' + R + '/' + tf + ' h1 and bio' });
    } else {
      if (!d.position) { bad('staff card ' + show(d.name) + ' has no position'); continue; }
      people.push({ name: d.name, role: d.position, group: 'Our Staff', page: d.href, source: R + '/the-staff.html div.ecp-post.ecp-post-' + d.post + '[data-categories="Our Staff"] .ecp-post-title a + .ecp-post-position; ' + R + '/' + tf + ' h1' });
    }
  }
  const onHome = teamCards('index.html').map((d) => d.name);
  /* certifications / awards: the bios' sentences, verbatim */
  const nelsonF = byPath.get('/team/dr-kristin-nelson-od/');
  const longaF = byPath.get('/team/maivys-longa/');
  const pick = (f, re, what) => { const m = mainText(f).match(re); if (!m) bad(what + ' not found on ' + f); return m ? m[0] : ''; };
  const certifications = [
    { value: pick(nelsonF, /Dr\. Nelson is an IACMM certified optometrist[^.]*\./, 'Nelson IACMM sentence'), holder: 'Dr. Kristin Nelson, O.D., IACMM', source: R + '/' + nelsonF + ' bio' },
    { value: pick(longaF, /Certifications: [^.]*\./, 'Longa certifications line'), holder: 'Dr. Maivys Longa, O.D.', source: R + '/' + longaF + ' bio (Education & Training list)' },
  ];
  const awards = [
    { value: pick(nelsonF, /she was inducted into the Gold Key International Optometric Honor Society[^.]*\./, 'Nelson Gold Key sentence'), holder: 'Dr. Kristin Nelson, O.D., IACMM', source: R + '/' + nelsonF + ' bio' },
  ];

  /* ---- 8. insurance: the two logo lists on /insurance/ (names exist only as img alt) ---- */
  const insMain = page('insurance.html').r.main;
  const imgByUrl = new Map(imgInv.images.map((x) => [x.src, x]));
  const lists = [...insMain.matchAll(/insurance_logo_items\b[^"]*">\s*<ul>([\s\S]*?)<\/ul>/g)].map((m) => {
    const h2s = [...insMain.slice(0, m.index).matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)];
    return { heading: h2s.length ? text(h2s[h2s.length - 1][1]) : '', plans: [...m[1].matchAll(/<img\b[^>]*>/g)].map((x) => { const a = attrs(x[0]); const rec = imgByUrl.get(a.src); return { name: a.alt, logo: a.src, logoFile: rec && rec.localFile && fs.existsSync(path.join(PROJ, rec.localFile)) ? rec.localFile : null }; }) };
  });
  if (lists.length !== 2 || lists[0].heading !== 'Vision Plans We Accept' || lists[1].heading !== 'Medical Plans We Accept' || lists[0].plans.length !== 16 || lists[1].plans.length !== 6) bad('expected /insurance/ "Vision Plans We Accept" (16) + "Medical Plans We Accept" (6) (' + CRAWL + '), found ' + show(lists.map((l) => [l.heading, l.plans.length])));
  for (const l of lists) for (const pl of l.plans) if (!pl.name) bad('an insurance logo without alt text under ' + show(l.heading));
  /* which plan names the extractor text capture (audit/content-inventory.json, the corpus sr-fabrication reads) already
     holds through other pages' text; the rest exist only as the /insurance/ logo alt text (case-sensitive match) */
  const ci = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/content-inventory.json'), 'utf8'));
  const capText = (pg) => [pg.title, pg.metaDescription, pg.bodyText, pg.footerText, (pg.headings || []).map((h) => h.text).join(' '), (pg.ctas || []).map((x) => x.text).join(' ')].join(' \n ');
  const capture = (ci.pages || []).map(capText).join(' \n ');
  const insCapture = (ci.pages || []).filter((pg) => pathOf(pg.url) === '/insurance/').map(capText).join(' \n ');
  if (!insCapture) bad('no /insurance/ record in audit/content-inventory.json');
  const planNames = [...new Set(lists.flatMap((l) => l.plans.map((x) => x.name)))];
  const inCapture = planNames.filter((nm) => capture.includes(nm));
  if (inCapture.some((nm) => insCapture.includes(nm))) bad('an insurance plan name is in the /insurance/ text capture itself: ' + show(inCapture.filter((nm) => insCapture.includes(nm))) + ' - re-word the insurance note');
  const inBoth = lists.length === 2 ? lists[0].plans.map((x) => x.name).filter((nm) => lists[1].plans.some((y) => y.name === nm)) : [];
  const callLine = 'If you do not see your plan listed here, please give us a call';
  if (!mainText('insurance.html').includes(callLine)) bad('/insurance/ no longer prints ' + show(callLine));
  const insurance = {
    vision: lists[0] ? lists[0].plans : [],
    medical: lists[1] ? lists[1].plans : [],
    source: R + '/insurance.html <main> div.insurance_logo_items ul li img[alt], under h2 "Vision Plans We Accept" and h2 "Medical Plans We Accept"',
    note: 'On /insurance/ the plan names are printed ONLY as logo alt text: ' + (planNames.length - inCapture.length) + ' of the ' + planNames.length + ' distinct names are absent from the extractor text capture (audit/content-inventory.json)' + (inCapture.length ? '; ' + inCapture.map((x) => '"' + x + '"').join(' and ') + ' occur there only in other pages\' text' : '') + '. ' + inBoth.map((x) => '"' + x + '"').join(' and ') + ' are in both lists. The page also says: "' + callLine + '".',
  };

  /* ---- 9. payment: Cherry (menu + widget page) and CareCredit (/insurance/carecredit/) ---- */
  const cherryNav = c.nav.flatMap((x) => [x, ...x.children]).find((x) => x.href === '/cherry-payment-plan/');
  const cherryRaw = page('cherry-payment-plan.html').r.main;
  const slug = (cherryRaw.match(/files\.withcherry\.com\/widgets\/widget\.js[\s\S]*?slug:\s*'([^']+)'/) || [])[1];
  const sections = ((cherryRaw.match(/_hw\("init",[\s\S]*?\},\s*\[([^\]]*)\]\);/) || [])[1] || '').replace(/['\s]/g, '').split(',').filter(Boolean);
  const floating = pages.filter((p) => /_hw\("init",[\s\S]{0,1200}?\['floatingEstimator'\]\);/.test(p.raw)).length;
  if (!cherryNav || cherryNav.label !== 'Cherry Payment Plan' || !slug || !sections.length) bad('Cherry: menu item ' + show(cherryNav) + ' / widget slug ' + show(slug) + ' / sections ' + show(sections));
  const cc = page('insurance-carecredit.html');
  const apply = [...cc.r.main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({ label: text(m[2]), href: attrs('<a ' + m[1]).href })).find((a) => a.label === 'Apply now');
  if (h1Of('insurance-carecredit.html') !== 'CareCredit' || !apply) bad('CareCredit page: h1 ' + show(h1Of('insurance-carecredit.html')) + ' / Apply now link ' + show(apply));
  const payment = [
    { name: cherryNav ? cherryNav.label : '', page: '/cherry-payment-plan/', provider: 'Cherry (files.withcherry.com/widgets/widget.js)', slug, widgetSections: sections, floatingEstimatorPages: floating, source: 'chrome.json nav Insurance > Cherry Payment Plan; ' + R + '/cherry-payment-plan.html <main> div.ecp-html _hw("init") script', note: 'The page body and the site-wide floating estimator are drawn in the browser by Cherry\'s script; none of their wording is in ' + R + '. Cherry terms are not declared here.' },
    { name: 'CareCredit', page: '/insurance/carecredit/', applyUrl: apply ? apply.href : '', source: R + '/insurance-carecredit.html h1.ecp-entry-title + the "Apply now" link; "Care Credit" logo in both /insurance/ lists', note: 'The page\'s plan terms (APRs, minimum purchases) are in its own text; they are the source\'s words and may be stale.' },
  ];

  /* ---- 10. Google reviews links: same listing as the map embed ---- */
  const fid = featureIdOf(c.mapPlaceId);
  if (!fid) bad('mapPlaceId ' + c.mapPlaceId + ' does not decode to a feature id');
  const reviewLinks = [];
  for (const [f, label] of [['index.html', 'Read Google Reviews'], ['eyeglasses-designer-frames.html', 'More Google Reviews']]) {
    const a = buttonsOf(page(f).r.main).find((b) => b.label === label);
    const srcHref = a ? ((page(f).r.main.match(new RegExp('<a class="ecp-button\\b[^>]*href="([^"]*)"[^>]*>(?:(?!</a>)[\\s\\S])*' + label)) || [])[1]) : null;
    const lrd = a ? (a.href.match(/#lrd=(0x[0-9a-f]+:0x[0-9a-f]+)/) || [])[1] : null;
    if (!a || !lrd) { bad(label + ' link not found on ' + f); continue; }
    if (lrd !== fid) bad(label + ' (' + f + ') lrd ' + lrd + ' is not the map place_id listing ' + fid);
    reviewLinks.push({ label, href: a.href.trim(), sourceHref: srcHref, page: f === 'index.html' ? '/' : '/eyeglasses/designer-frames/', googleListing: lrd, source: R + '/' + f + ' <main> a.ecp-button; its #lrd= feature id equals the one encoded in the map embed place_id ' + c.mapPlaceId });
  }

  /* ---- 11. legal name: no entity suffix on the practice; the suffixes printed belong to third parties ---- */
  const ENTITY = /\b(?:L\.?L\.?C\.?|P\.?L\.?L\.?C\.?|Inc\.|Incorporated|P\.A\.|P\.C\.|LLP|Ltd\.?|Corp\.|Corporation)(?=[\s,.<"')]|$)/;
  const entityHits = [];
  for (const p of pages) {
    const bS = p.raw.search(/<body\b/);
    for (const m of text(bS >= 0 ? p.raw.slice(bS) : p.raw).matchAll(new RegExp('.{0,60}' + ENTITY.source, 'g'))) entityHits.push({ f: p.f, ctx: m[0] });
  }
  const nearPractice = entityHits.filter((h) => /Riverside|Degler|Nelson|Longa/i.test(h.ctx));
  if (nearPractice.length) bad('a legal-entity suffix next to the practice or a doctor (record the legal name by hand): ' + show(nearPractice));
  const THIRD_PARTY = { 'eye-care-services-eye-exams-pediatric-eye-exams-infantsee.html': 'Johnson & Johnson Vision Care, Inc.', 'eyeglasses.html': 'Transitions® Lenses Optical, Inc.' };
  if (!eq(entityHits.map((h) => h.f).sort(), Object.keys(THIRD_PARTY).sort()) || entityHits.some((h) => !h.ctx.includes(THIRD_PARTY[h.f]))) bad('expected entity suffixes only in the 2 third-party names counted on ' + CRAWL + ' ' + show(THIRD_PARTY) + ', found ' + show(entityHits) + ' - the source changed; re-verify before declaring');

  /* ---- 12. QA round 1 (wf6, CONTENT-2): text the rebuild prints that sr-fabrication --strict reads as a claim although
     every word of it is the source's. Each entry below is checked against the evidence; a failed check writes nothing.
     sr-fabrication traces a claim through the text of audit/content-inventory.json plus every value of this file, a
     <figure>/<blockquote> through the source pages' own figures plus `testimonials[].quote`, and a google.com/maps link
     through its URL or link text. ---- */
  /* 12a. The map link. The rebuild's static map card (the sidebar of 131 pages) links the keyless query URL that
     src/build.mjs composes from chrome.json mapQuery (MAP_SRC without &output=embed); section 1 checks that mapQuery is
     brandName + address, and section 3 that both match the source on every sidebar page. The source's own map embeds
     show the same listing by place_id. */
  const mapUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(c.mapQuery);
  const mapLinks = [{
    url: mapUrl, query: c.mapQuery, placeId: c.mapPlaceId,
    source: 'composed from chrome.json mapQuery (brandName + address, verified on ' + sidePages.length + ' sidebar pages); ' + R + '/*.html div.ecp-post-map iframe shows the same listing (place_id ' + c.mapPlaceId + ', ' + [...placeIds.values()].reduce((a, s) => a + s.size, 0) + ' pages)',
    note: 'A location link, not a review or credential profile. sr-fabrication reads every google.com/maps link as a proof link. Its link text is chrome.json mapsLinkLabel, an authored UI label (chrome.json authored[]).',
  }];
  /* 12b. Figure text that is not a review: none is declared (QA round 1, regressions R1). sr-fabrication reads every
     <figure>/<blockquote> holding more than 20 characters of text as a testimonial, and traces one when its text CONTAINS
     a declared quote (its key.includes(s.slice(0, 60))). fix-1 (CONTENT-2) declared here the 6 such names the rebuild
     printed inside a <figure>: the placeholder plates of the 2 doctors whose photos the CDN refused, and 4 of the 7
     recommended contact lenses. With them an invented review that embeds one of those names passed the gate. The rebuild
     now prints the plates and the name captions without <figure> markup (COMPONENTS B.10, B.21, D.7.9), so
     testimonials[] holds only the source's reviews. The evidence that markup rests on is still checked, and a failed
     check still writes nothing: the refused team photos are exactly the 5 placeholders of OPEN-DECISIONS Q15 (each plate
     prints the person's name, the photo's alt), and /contact-lenses/ shows 7 recommended products, each name equal to its
     image alt (the name captions). */
  const plates = [];
  for (const d of [...doctors, ...staff]) {
    const rec = imgByUrl.get(d.src);
    if (rec && rec.localFile && fs.existsSync(path.join(PROJ, rec.localFile))) continue;
    plates.push(d.name);
  }
  const WANT_PLATES = ['Dr. Kristin Nelson, O.D., IACMM', 'Dr. Maivys Longa, O.D.', 'Heather', 'Xaiene', 'Jhonae'];
  if (!eq([...plates].sort(), [...WANT_PLATES].sort())) bad('expected the refused team photos of ' + show(WANT_PLATES) + ' (OPEN-DECISIONS Q15), found ' + show(plates) + ' - re-verify before declaring');
  const clProducts = [...page('contact-lenses.html').r.main.matchAll(/<div class="cl-content">\s*<div class="cl-prod-image">\s*(<img\b[^>]*>)\s*<\/div>\s*<div class="cl-prod-name">([\s\S]*?)<\/div>/g)].map((m) => ({ alt: attrs(m[1]).alt, name: text(m[2]) }));
  if (clProducts.length !== 7 || clProducts.some((p) => !p.name || p.alt !== p.name)) bad('expected 7 recommended products on /contact-lenses/ (' + CRAWL + '), each name equal to its image alt, found ' + show(clProducts));
  /* 12c. Claim contexts. The superlative detector reads its matched word plus the next 50 characters across element
     boundaries. Where the rebuild's neighbouring text differs from the capture (a removed search widget, the post card's
     date order, a word the source split into two spans), the window no longer matches. Each sourceText must be verbatim on
     its raw page; every word of each rebuildContext must be on that raw page too (no word is new). */
  const ASIDE = 'Request An Appointment Email Us Riverside Family Eye Care 11841 Palm Beach Blvd, Unit 117 Fort Myers, FL 33905';
  const DRY = 'This Winter, Don’t Let Dry Eyes Get the Best of You';
  const CLAIMS = [
    { page: '/eye-care-services/cataract-surgery-co-management/', file: 'eye-care-services-cataract-surgery-co-management.html', sourceText: 'determine if surgery is the best option for your clouded lens.', rebuildContext: 'the best option for your clouded lens.', why: 'The source sets "your" as two spans ("you" + "r"); the extractor capture stored "you r", so the matched window differs by one space.', where: '<main> .ecp-richtext (Word-pasted spans)' },
    { page: '/eyeglasses/eyeglass-basics/', file: 'eyeglasses-eyeglass-basics.html', sourceText: 'How can you narrow down your options and choose the style of frames that are best for you?', rebuildContext: 'best for you? ' + ASIDE, why: 'The last sentence of the page is followed on the source by the sidebar search widget ("Search: Search", removed: OPEN-DECISIONS Q13) and then the sidebar quick actions and location; on the rebuild the quick actions follow it directly.', where: '<main> last paragraph; the sidebar (div.ecp-secondary)' },
    { page: '/sitemap/', file: 'sitemap.html', sourceText: DRY, rebuildContext: 'the Best of You The struggle against dry eye every winter is real.', why: 'The post card prints its date before its title (DESIGN-SPEC 3.28); the source printed it between the title and the excerpt, so on the rebuild the title runs into the excerpt.', where: '<main> post list: title, date, excerpt' },
    { page: '/whats-new/', file: 'whats-new.html', sourceText: DRY, rebuildContext: 'the Best of You The struggle against dry eye every winter is real.', why: 'The post card prints its date before its title (DESIGN-SPEC 3.28); the source printed it between the title and the excerpt, so on the rebuild the title runs into the excerpt.', where: '<main> post list: title, date, excerpt' },
    { page: '/tag/dry-eye/', file: 'tag-dry-eye.html', sourceText: DRY, rebuildContext: 'the Best of You ' + ASIDE, why: 'The archive\'s last post title is followed on the source by the sidebar search widget ("Search: Search", removed: OPEN-DECISIONS Q13) and then the sidebar quick actions and location; on the rebuild the quick actions follow it directly.', where: '<main> archive list; the sidebar (div.ecp-secondary)' },
    { page: '/tag/dry-eyes/', file: 'tag-dry-eyes.html', sourceText: DRY, rebuildContext: 'the Best of You ' + ASIDE, why: 'The archive\'s only post title is followed on the source by the sidebar search widget ("Search: Search", removed: OPEN-DECISIONS Q13) and then the sidebar quick actions and location; on the rebuild the quick actions follow it directly.', where: '<main> archive list; the sidebar (div.ecp-secondary)' },
  ];
  const nrm = (s) => String(s || '').replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
  const sourcedClaimContexts = [];
  for (const k of CLAIMS) {
    if (pathByFile.get(k.file) !== k.page) { bad('claim context ' + show(k.page) + ': ' + k.file + ' is the raw page of ' + show(pathByFile.get(k.file))); continue; }
    const bS = page(k.file).raw.search(/<body\b/);
    const vis = nrm(text(page(k.file).raw.slice(bS)));
    if (!vis.includes(nrm(k.sourceText))) bad('claim context ' + k.page + ': the source text ' + show(k.sourceText) + ' is not verbatim on ' + k.file);
    const words = new Set(vis.split(/[^\p{L}\p{N}']+/u).filter(Boolean));
    const newWords = nrm(k.rebuildContext).split(/[^\p{L}\p{N}']+/u).filter((w) => w && !words.has(w));
    if (newWords.length) bad('claim context ' + k.page + ': words of the rebuild context not on ' + k.file + ': ' + show(newWords));
    sourcedClaimContexts.push({ page: k.page, sourceText: k.sourceText, rebuildContext: k.rebuildContext, why: k.why + ' No word of the claim is new.', source: R + '/' + k.file + ' (' + k.where + ')' });
  }

  /* ---- report grouped per-page differences ---- */
  for (const [k, list] of grouped) bad(k + ' (' + list.length + ' page' + (list.length > 1 ? 's' : '') + ': ' + list.slice(0, 4).join(' ') + (list.length > 4 ? ' ...' : '') + ')');
  if (problems.length) return null;

  const accessibility = text((page('website-accessibility-policy.html').r.main.match(/Write to us at:[\s\S]{0,200}/) || [''])[0]);
  return {
    stats: { chromePages: chromePages.length, sidePages: sidePages.length, sideWidgets, hoursMain: hoursWidgets.main.length, hoursSide: hoursWidgets.sidebar.length, tel: telTotal, telPages: pages.filter((p) => /href=["']tel:/i.test(p.raw)).length, maps: [...placeIds.values()].reduce((a, s) => a + s.size, 0), cards: testimonials.length, cardPages: Object.keys(perPage).length },
    facts: {
      schema: 'site-reforge/client-facts@1',
      note: 'Declared facts for Riverside Family Eye Care. ONLY facts recorded here or present in audit/content-inventory.json may appear as claims on the rebuild. Written by tools/write-facts.mjs from the evidence; every entry names its source. Nothing here is supplied by the client or invented - it is what the LIVE SITE says (crawl of ' + CRAWL + '), including places the extractor text capture did not reach (insurance plan names printed only as logo alt text, testimonial cards, icon-only social links). Every key of the reference build (R) schema is kept. Added: the top-level keys insurance, payment, reviewLinks, mapLinks, legalNameNote, peopleNote, addressNote and testimonialsNote; credentials/group/page on people; title/reviewedAt/shownAs on testimonials; rel on socialProfiles; value/holder/source entries in certifications and awards (R\'s were empty). post is null on review-widget cards, which carry no post id. sr-fabrication reads every value of every key. QA round 1 (wf6, CONTENT-2) added mapLinks and the sourcedClaimContexts entries: text sr-fabrication --strict reads as a claim although every word of it is the source\'s (tools/write-facts.mjs section 12 checks each against the evidence). It also added 6 figure-text entries to testimonials, which QA round 1 (regressions, R1) removed: testimonials holds only the source\'s reviews.',
      generatedBy: 'tools/write-facts.mjs',
      generated: new Date().toISOString().slice(0, 10),
      legalName: '',
      legalNameNote: 'No legal-entity name of the practice (LLC, PLLC, Inc., P.A., P.C.) is printed on any of the ' + pages.length + ' pages. The only entity suffixes in visible text belong to third-party names: ' + entityHits.map((h) => '"' + THIRD_PARTY[h.f] + '" (' + pathByFile.get(h.f) + ')').join(' and ') + '.',
      brand: c.brandName,
      people,
      peopleNote: 'The home page features ' + onHome.join(' and ') + ' (team cards in ' + R + '/index.html <main>). Staff names are the cards\' and h1s\' first names; some bios add surnames (see docs/FACTS-EVIDENCE.md).',
      phone: [{ value: c.phone, source: R + '/*.html top bar (printed as tel: ' + c.phone + '), mobile header, sidebar location widget, footer NAP, in-content links and the head JSON-LD telephone; all ' + telTotal + ' tel: links on non-template pages resolve to it' }],
      fax: [{ value: c.fax, source: R + '/*.html location widget li.ecp-post-contactdetails-contacttype-Fax (the sidebar of ' + faxPages.sidebar.size + ' pages; <main> of ' + [...faxPages.main].map((f) => pathByFile.get(f)).join(', ') + '; ' + new Set([...faxPages.sidebar, ...faxPages.main]).size + ' pages in all)' }],
      faxNote: 'Printed as text only (no fax: link).',
      email: [
        { value: c.email, source: R + '/*.html location widget li.ecp-post-contactdetails-contacttype-Email (mailto:), printed with "' + L.emailNote + '"' },
        { value: otherMail[0], source: R + '/website-accessibility-policy.html <main> "Email us at:" (mailto:) - the only page that prints it' },
      ],
      addresses: [
        { value: c.topbar.address.label, source: R + '/*.html header top bar (div.ecp-richtext a[href="/hours-location/"]), ' + chromePages.length + ' pages' },
        { value: c.addressLines.join(', '), source: R + '/*.html location widget div.ecp-post-address (two lines split by <br>)' },
        { value: n.text, source: R + '/*.html footer div.ecp-footer-address, ' + chromePages.length + ' pages' },
        { value: c.address.street + ', ' + c.address.locality + ', ' + c.address.region + ' ' + c.address.postalCode + ', US', source: R + '/*.html head JSON-LD PostalAddress (LocalBusiness, MedicalBusiness, Optician, "MedicalSpecialty :: Optometric"), ' + pages.length + ' pages' },
      ],
      addressNote: 'One street, unit and ZIP everywhere: no Suite or other unit form, no other ZIP. /website-accessibility-policy/ prints "' + accessibility.replace(/ Search:.*$/, '') + '" (no ZIP).',
      geo: null,
      geoNote: 'No latitude/longitude anywhere in ' + R + ' (0 of ' + pages.length + ' pages; no geo in the JSON-LD). The map embeds Google place_id ' + c.mapPlaceId + ' (' + [...placeIds.values()].reduce((a, s) => a + s.size, 0) + ' pages); its feature id ' + fid + ' is the one in the "Read Google Reviews" link.',
      hours: c.hours.map(([d, h]) => d + ': ' + h).join('; '),
      hoursSource: R + '/*.html hours widget li.ecp-post-hours-item: identical in the sidebar of ' + hoursWidgets.sidebar.length + ' pages and in <main> of ' + hoursWidgets.main.join(', ') + '. Friday prints two ranges split by <br> (the "\\n"). No other hours statement on the site; the head JSON-LD carries no opening hours.',
      licences: [],
      certifications,
      awards,
      statistics: [],
      clients: [],
      guarantees: [],
      pricing: [],
      services: [],
      insurance,
      payment,
      reviewLinks,
      mapLinks,
      testimonials,
      testimonialsNote: testimonials.length + ' cards on ' + Object.keys(perPage).length + ' pages, ' + distinct.size + ' distinct reviews: the home carousel (5), /eyeglasses/designer-frames/ (1, the Marshall B. card again), /contact-us/testimonials/ and /testimonial/this-was-a-great-experience/ (testimonial post 5569 twice). shownAs is the relative time the widget printed at crawl time; it goes stale and must not be shipped as static text. No other entry is declared (QA round 1, R1): the placeholder plates and the contact-lens product names are printed without <figure>, so sr-fabrication does not read them as testimonials.',
      socialProfiles: c.footer.social.map((s) => ({ network: s.network, label: s.label, url: s.href, rel: s.rel, source: 'aria-label + href of the icon-only footer link on every chrome page and the sidebar icon set (' + R + '/*.html a.ecp-icon.ecp-network-' + s.network + '); the glyph is an inline <svg>' })),
      sourcedClaimContexts,
    },
  };
}

let result = null;
try { result = main(); } catch (e) { problems.push('exception: ' + ((e && e.stack) || e)); }
if (problems.length || !result) {
  console.error('write-facts: FAILED - ' + problems.length + ' problem' + (problems.length === 1 ? '' : 's') + '; nothing written');
  for (const p of problems.slice(0, 80)) console.error('  - ' + p);
  if (problems.length > 80) console.error('  ... ' + (problems.length - 80) + ' more');
  process.exit(1);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result.facts, null, 2) + '\n');
const s = result.stats;
console.log('client-facts written: ' + rel(OUT) + ' | chrome verified on ' + s.chromePages + ' header/footer pages + ' + s.sidePages + ' sidebar pages (' + s.sideWidgets + ' with the location widget) | hours widgets ' + s.hoursSide + ' sidebar + ' + s.hoursMain + ' main | tel: links ' + s.tel + ' | map embeds ' + s.maps + ' | testimonials ' + s.cards + ' on ' + s.cardPages + ' pages | people ' + result.facts.people.length + ' | insurance ' + result.facts.insurance.vision.length + '+' + result.facts.insurance.medical.length + ' | social ' + result.facts.socialProfiles.length);
