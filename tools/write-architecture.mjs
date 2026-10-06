// write-architecture.mjs - docs/SITE-ARCHITECTURE.md + audit/architecture-map.json, GENERATED from the crawl evidence
// on disk (never typed, never fetched): audit/raw/*.html, audit/css/, and the audit/*.json inventories.
//
// Riverside Family Eye Care adaptation (2026-10-01) of the reference build's (R) copy of this script. R's version read
// src/content/chrome.json (a later-stage file Riverside does not have) and printed prose specific to earlier sites; this
// version parses the raw HTML itself, and every selector in it was checked against Riverside's markup.
//
//   node tools/write-architecture.mjs            write docs/SITE-ARCHITECTURE.md and audit/architecture-map.json
//   node tools/write-architecture.mjs --check    recompute both and compare with the files on disk (exit 1 on drift)
//   node tools/write-architecture.mjs --stdout   print the markdown, write nothing
//
// Output is deterministic (no wall-clock timestamps; the evidence date is the crawl's own `generated` stamp), so two
// runs over the same evidence must produce byte-identical files. Node builtins only.
//
// Independent verification (verify-arch, 2026-10-01): errors found by re-deriving the evidence were fixed HERE, at the
// source, each marked with a "verify-arch fix" comment. The "## Verification record" section at the end of the Markdown is
// carried forward from the file on disk (see section 17), so regenerating does not erase it. Scripts and outputs of that
// verification: tmp/wf1/verify-arch/ (run-all.mjs re-runs every check).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGV = process.argv.slice(2);
const CHECK = ARGV.includes('--check');
const STDOUT = ARGV.includes('--stdout');
const rd = (f) => fs.readFileSync(path.join(PROJ, f), 'utf8');
const J = (f) => JSON.parse(rd(f));
const exists = (f) => fs.existsSync(path.join(PROJ, f));
const OUT_MD = 'docs/SITE-ARCHITECTURE.md';
const OUT_JSON = 'audit/architecture-map.json';

/* =====================================================================================================================
 * 1. A small forgiving HTML tree builder + selector engine (same code as tmp/wf1/arch/lib-dom.mjs, which has its own
 *    test file). Void / raw-text / RCDATA elements, implied end tags (p, li, dt/dd, option, tr/td/th, a), foreign
 *    self-closing (svg/math), stray end tags ignored. Elements keep source offsets s/e (outer) and cs/ce (inner).
 * =================================================================================================================== */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'keygen', 'command', 'basefont', 'bgsound', 'frame']);
const RAW = new Set(['script', 'style', 'noscript', 'xmp', 'iframe', 'noembed', 'noframes']);
const RCDATA = new Set(['textarea', 'title']);
const CLOSES_P = new Set(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dialog', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'ul', 'li', 'dd', 'dt', 'listing', 'plaintext', 'search']);
const SCOPE_BOUND = new Set(['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template', 'button', 'svg', 'math']);
const SPECIAL_STOP = new Set(['applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'link', 'listing', 'main', 'marquee', 'menu', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'param', 'plaintext', 'pre', 'script', 'search', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp', 'svg', 'math']);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', ndash: '\u2013', mdash: '\u2014', rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', hellip: '\u2026', copy: '\u00a9', reg: '\u00ae', trade: '\u2122', bull: '\u2022', middot: '\u00b7', raquo: '\u00bb', laquo: '\u00ab', times: '\u00d7', eacute: '\u00e9', egrave: '\u00e8', aacute: '\u00e1', oacute: '\u00f3', iacute: '\u00ed', uacute: '\u00fa', ntilde: '\u00f1', deg: '\u00b0', frac12: '\u00bd', shy: '\u00ad', zwnj: '\u200c', zwj: '\u200d' };
function decode(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);?/gi, (m, g) => {
    if (g[0] === '#') { const cp = g[1] === 'x' || g[1] === 'X' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10); try { return String.fromCodePoint(cp); } catch { return m; } }
    const v = ENT[g.toLowerCase()]; return v === undefined ? m : v;
  });
}
function mkEl(name, attrs, s, parent) { return { type: 'el', name, attrs, s, e: -1, cs: -1, ce: -1, kids: [], parent }; }
function parse(html) {
  const doc = mkEl('#document', {}, 0, null);
  const stack = [doc];
  const top = () => stack[stack.length - 1];
  const n = html.length;
  let i = 0;
  const pushText = (t, at) => { if (t) top().kids.push({ type: 'text', text: decode(t), raw: t, s: at, parent: top() }); };
  const popTo = (idx, endAt) => { while (stack.length > idx) { const el = stack.pop(); if (el.e < 0) { el.e = endAt; if (el.ce < 0) el.ce = endAt; } } };
  const findOpen = (name, bound) => { for (let k = stack.length - 1; k > 0; k--) { const el = stack[k]; if (el.name === name) return k; if (bound && bound.has(el.name)) return -1; } return -1; };
  const inForeign = () => stack.some((el) => el.name === 'svg' || el.name === 'math');
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { pushText(html.slice(i), i); break; }
    if (lt > i) pushText(html.slice(i, lt), i);
    i = lt;
    if (html.startsWith('<!--', i)) { const end = html.indexOf('-->', i + 4); top().kids.push({ type: 'comment', text: html.slice(i + 4, end < 0 ? n : end), s: i, parent: top() }); i = end < 0 ? n : end + 3; continue; }
    if (html[i + 1] === '!' || html[i + 1] === '?') { const end = html.indexOf('>', i); i = end < 0 ? n : end + 1; continue; }
    if (html[i + 1] === '/') {
      const m = /^<\/([a-zA-Z][^\s/>]*)[^>]*>/.exec(html.slice(i, i + 300));
      if (!m) { pushText('<', i); i += 1; continue; }
      const name = m[1].toLowerCase();
      const endAt = i + m[0].length;
      let k;
      if (name === 'p') k = findOpen('p', SCOPE_BOUND);
      else if (name === 'li') k = findOpen('li', new Set(['ol', 'ul', ...SCOPE_BOUND]));
      else k = findOpen(name, null);
      if (k > 0) { stack[k].ce = i; popTo(k, endAt); }
      i = endAt; continue;
    }
    if (!/[a-zA-Z]/.test(html[i + 1] || '')) { pushText('<', i); i += 1; continue; }
    let j = i + 1;
    while (j < n && !/[\s/>]/.test(html[j])) j++;
    const name = html.slice(i + 1, j).toLowerCase();
    const attrs = {};
    let selfClose = false;
    while (j < n) {
      while (j < n && /\s/.test(html[j])) j++;
      if (html[j] === '>') { j++; break; }
      if (html[j] === '/') { if (html[j + 1] === '>') { selfClose = true; j += 2; break; } j++; continue; }
      let k = j;
      while (k < n && !/[\s"'>/=]/.test(html[k])) k++;
      if (k === j) k++;
      const an = html.slice(j, k).toLowerCase();
      j = k;
      while (j < n && /\s/.test(html[j])) j++;
      let val = '';
      if (html[j] === '=') {
        j++;
        while (j < n && /\s/.test(html[j])) j++;
        const q = html[j];
        if (q === '"' || q === "'") { const end = html.indexOf(q, j + 1); val = html.slice(j + 1, end < 0 ? n : end); j = end < 0 ? n : end + 1; }
        else { let k2 = j; while (k2 < n && !/[\s>]/.test(html[k2])) k2++; val = html.slice(j, k2); j = k2; }
      }
      if (an && !(an in attrs)) attrs[an] = decode(val);
    }
    const tagEnd = j;
    if (CLOSES_P.has(name)) { const k = findOpen('p', SCOPE_BOUND); if (k > 0) popTo(k, i); }
    if (name === 'li') for (let k = stack.length - 1; k > 0; k--) { const el = stack[k]; if (el.name === 'li') { popTo(k, i); break; } if (SPECIAL_STOP.has(el.name) && !['address', 'div', 'p'].includes(el.name)) break; }
    if (name === 'dd' || name === 'dt') for (let k = stack.length - 1; k > 0; k--) { const el = stack[k]; if (el.name === 'dd' || el.name === 'dt') { popTo(k, i); break; } if (SPECIAL_STOP.has(el.name) && !['address', 'div', 'p'].includes(el.name)) break; }
    if (name === 'option' && top().name === 'option') popTo(stack.length - 1, i);
    if (name === 'optgroup') { if (top().name === 'option') popTo(stack.length - 1, i); if (top().name === 'optgroup') popTo(stack.length - 1, i); }
    if (name === 'tr') { const k = findOpen('tr', new Set(['table', 'tbody', 'thead', 'tfoot'])); if (k > 0) popTo(k, i); }
    if (name === 'td' || name === 'th') for (let k = stack.length - 1; k > 0; k--) { const el = stack[k]; if (el.name === 'td' || el.name === 'th') { popTo(k, i); break; } if (['tr', 'table', 'tbody', 'thead', 'tfoot'].includes(el.name)) break; }
    if (name === 'a') { const k = findOpen('a', SCOPE_BOUND); if (k > 0) popTo(k, i); }
    const el = mkEl(name, attrs, i, top());
    el.cs = tagEnd;
    top().kids.push(el);
    if (VOID.has(name) || (selfClose && inForeign()) || (selfClose && (name === 'svg' || name === 'math'))) { el.e = tagEnd; el.ce = tagEnd; i = tagEnd; continue; }
    if (RAW.has(name) || RCDATA.has(name)) {
      const re = new RegExp('</' + name + '[\\s>/]', 'ig');
      re.lastIndex = tagEnd;
      const m = re.exec(html);
      const cend = m ? m.index : n;
      const raw = html.slice(tagEnd, cend);
      if (raw) el.kids.push({ type: 'text', text: RCDATA.has(name) ? decode(raw) : raw, raw, s: tagEnd, parent: el, rawtext: true });
      const close = m ? html.indexOf('>', cend) : n;
      el.ce = cend; el.e = close < 0 ? n : close + 1;
      i = el.e; continue;
    }
    stack.push(el);
    i = tagEnd;
  }
  popTo(1, n);
  doc.e = n;
  return doc;
}
function* walk(node) { const st = [node]; while (st.length) { const x = st.pop(); yield x; if (x.kids) for (let k = x.kids.length - 1; k >= 0; k--) st.push(x.kids[k]); } }
const cls = (el) => (el && el.attrs && el.attrs.class ? el.attrs.class.split(/\s+/).filter(Boolean) : []);
const hasCls = (el, c) => cls(el).includes(c);
const attr = (el, a) => (el && el.attrs ? el.attrs[a] : undefined);
function text(node, { raw = false } = {}) {
  if (!node) return '';
  if (node.type === 'text') return node.rawtext && !raw ? '' : node.text;
  let out = '';
  for (const x of walk(node)) {
    if (x.type === 'text' && !(x.rawtext && !raw)) out += x.text;
    else if (x.type === 'el' && (x.name === 'br' || x.name === 'p' || x.name === 'li' || x.name === 'div' || /^h[1-6]$/.test(x.name))) out += ' ';
  }
  return out;
}
const clean = (s) => String(s == null ? '' : s).replace(/[\s\u00a0]+/g, ' ').trim();
const ttext = (node) => clean(text(node));
function closest(el, pred) { let x = el; while (x) { if (x.type === 'el' && pred(x)) return x; x = x.parent; } return null; }
const rawOf = (html, el) => html.slice(el.s, el.e);
function parseCompound(s) {
  const c = { tag: null, id: null, classes: [], attrs: [], nots: [] };
  const re = /(:not\(([^)]*)\))|(#[\w-]+)|(\.[\w-]+)|(\[([\w-:]+)(?:([~*^$|]?=)("([^"]*)"|'([^']*)'|[^\]]*))?\])|([a-zA-Z*][\w-]*)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) c.nots.push(parseCompound(m[2]));
    else if (m[3]) c.id = m[3].slice(1);
    else if (m[4]) c.classes.push(m[4].slice(1));
    else if (m[5]) c.attrs.push({ name: m[6].toLowerCase(), op: m[7] || null, val: m[9] !== undefined ? m[9] : m[10] !== undefined ? m[10] : (m[8] || '') });
    else if (m[11]) c.tag = m[11] === '*' ? null : m[11].toLowerCase();
  }
  return c;
}
function matchCompound(el, c) {
  if (el.type !== 'el') return false;
  if (c.tag && el.name !== c.tag) return false;
  if (c.id && attr(el, 'id') !== c.id) return false;
  if (c.classes.length) { const k = cls(el); for (const x of c.classes) if (!k.includes(x)) return false; }
  for (const a of c.attrs) {
    const v = attr(el, a.name);
    if (v === undefined) return false;
    if (!a.op) continue;
    if (a.op === '=' && v !== a.val) return false;
    if (a.op === '~=' && !v.split(/\s+/).includes(a.val)) return false;
    if (a.op === '*=' && !v.includes(a.val)) return false;
    if (a.op === '^=' && !v.startsWith(a.val)) return false;
    if (a.op === '$=' && !v.endsWith(a.val)) return false;
  }
  for (const nt of c.nots) if (matchCompound(el, nt)) return false;
  return true;
}
function parseSelector(sel) {
  const parts = [];
  let comb = ' ';
  for (const t of sel.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/)) { if (t === '>') { comb = '>'; continue; } parts.push({ comb, c: parseCompound(t) }); comb = ' '; }
  return parts;
}
function matchesParts(el, parts, root) {
  let k = parts.length - 1;
  if (!matchCompound(el, parts[k].c)) return false;
  let cur = el;
  while (k > 0) {
    const comb = parts[k].comb;
    k--;
    if (comb === '>') { cur = cur.parent; if (!cur || cur === root.parent || !matchCompound(cur, parts[k].c)) return false; }
    else { let x = cur.parent; while (x && x !== root.parent && !matchCompound(x, parts[k].c)) x = x.parent; if (!x || x === root.parent) return false; cur = x; }
  }
  return true;
}
function qsa(root, sel) {
  if (!root) return [];
  const groups = sel.split(',').map((s) => parseSelector(s));
  const out = [];
  for (const x of walk(root)) { if (x === root || x.type !== 'el') continue; if (groups.some((g) => matchesParts(x, g, root))) out.push(x); }
  return out;
}
const qs = (root, sel) => qsa(root, sel)[0] || null;
const kidsEl = (el) => (el ? el.kids.filter((k) => k.type === 'el') : []);

/* =====================================================================================================================
 * 2. A minimal CSS rule reader (comments stripped, @media / @supports nesting tracked, other at-rules skipped).
 * =================================================================================================================== */
function cssRules(css) {
  const out = [];
  const s = String(css).replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  const block = (media) => {
    while (i < s.length) {
      const open = s.indexOf('{', i);
      const close = s.indexOf('}', i);
      if (close >= 0 && (open < 0 || close < open)) { i = close + 1; return; }
      if (open < 0) { i = s.length; return; }
      const prelude = s.slice(i, open).trim();
      i = open + 1;
      if (/^@media\b/i.test(prelude)) { block((media ? media + ' and ' : '') + prelude.replace(/^@media\s*/i, '').trim()); continue; }
      if (/^@(supports|layer|container|document)\b/i.test(prelude)) { block(media); continue; }
      if (prelude.startsWith('@')) { let d = 1; while (i < s.length && d > 0) { const c = s[i++]; if (c === '{') d++; else if (c === '}') d--; } continue; }
      const end = s.indexOf('}', i);
      const body = s.slice(i, end < 0 ? s.length : end);
      i = end < 0 ? s.length : end + 1;
      const decls = [];
      for (const part of body.split(';')) { const k = part.indexOf(':'); if (k < 0) continue; const prop = part.slice(0, k).trim().toLowerCase(); if (prop) decls.push([prop, part.slice(k + 1).trim()]); }
      out.push({ media: media || '', selectors: prelude.split(',').map((x) => x.replace(/\s+/g, ' ').trim()), decls });
    }
  };
  block('');
  return out;
}

/* =====================================================================================================================
 * 3. Positive controls. Every checker below must be able to fire before its silence is reported as evidence.
 * =================================================================================================================== */
function selfTest() {
  const fails = [];
  const t = parse('<div id=a class="x y"><p>one<p>two<ul><li>a<li>b<ul><li>c</ul></ul><img src=1><script>if(a<b){"</div>"}</script><svg><path d="M0"/><g/></svg><span>z</span></div><p>after</p></b></div>');
  if (qsa(t, 'div#a > p').length !== 2) fails.push('implied </p>');
  if (qsa(t, 'div#a > ul > li').length !== 2 || qsa(t, 'li li').length !== 1) fails.push('implied </li>');
  if (!qs(t, 'span') || qs(t, 'span').parent !== qs(t, 'div#a')) fails.push('svg self-closing');
  if (!qs(t, 'script').kids[0].raw.includes('</div>')) fails.push('script raw text');
  if (qsa(t, 'p').length !== 3 || qsa(t, 'p').pop().parent !== t) fails.push('p after div at root');
  const css = cssRules('/*x*/.a{color:red}@media (max-width:768px){.a{color:blue}.b > .c{margin-top:-1px}}@font-face{font-family:x;src:url(a)}.d{x:y}');
  if (css.length !== 4 || css[1].media !== '(max-width:768px)' || css[2].selectors[0] !== '.b > .c' || css[3].selectors[0] !== '.d') fails.push('css reader');
  if (fails.length) throw new Error('self-test failed (fail closed): ' + fails.join(', '));
}
selfTest();

/* =====================================================================================================================
 * 4. Inputs
 * =================================================================================================================== */
const site = J('audit/site-inventory.json');
const content = J('audit/content-inventory.json');
const seoInv = J('audit/seo-inventory.json');
const arch = J('audit/architecture.json');
const imgInv = J('audit/image-inventory.json');
const failures = J('audit/failures.json');
const linkGraph = J('audit/link-graph.json');
const fontInv = J('audit/font-inventory.json');
const mediaInv = J('audit/media-inventory.json');
const sheetInv = J('audit/stylesheets.json');
const cms = J('audit/source-cms.json');
const robotsTxt = exists('audit/robots.txt') ? rd('audit/robots.txt') : '';
const ORIGIN = site.origin;
const HOST = new URL(ORIGIN).host;
const CRAWL_DATE = String(site.generated || '').slice(0, 10);
const SITE_ID = (() => { const m = rd('audit/raw/index.html').match(/\/wp-content\/uploads\/sites\/(\d+)\//); return m ? m[1] : null; })();

/* ---------- small helpers ---------- */
const uniq = (a) => [...new Set(a)];
const countBy = (a, f) => { const m = new Map(); for (const x of a) { const k = f(x); m.set(k, (m.get(k) || 0) + 1); } return m; };
const sortDesc = (m) => [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
const cell = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const code = (s) => '`' + String(s).replace(/`/g, "'") + '`';
const trunc = (s, n) => { s = clean(s); return s.length > n ? s.slice(0, n - 1).trimEnd() + '\u2026' : s; };
const table = (head, rows) => ['| ' + head.map(cell).join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|', ...rows.map((r) => '| ' + r.map(cell).join(' | ') + ' |')].join('\n');
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const normUrl = (u, base) => { try { const x = new URL(String(u).trim(), base); if (!/^https?:$/.test(x.protocol)) return null; x.hash = ''; x.hostname = x.hostname.toLowerCase(); if (x.pathname.length > 1) x.pathname = x.pathname.replace(/\/+$/, ''); return x.toString(); } catch { return null; } };
const livePath = (u) => { const p = new URL(u).pathname; return p.endsWith('/') ? p : p + '/'; };
const isInternal = (abs) => { try { return new URL(abs).host === HOST; } catch { return false; } };
const showHref = (href, base) => {
  const h = String(href == null ? '' : href);
  if (!h.trim()) return '(empty)';
  if (/^(tel|mailto|javascript|sms):/i.test(h.trim()) || h.trim().startsWith('#')) return h;
  const abs = (() => { try { return new URL(h.trim(), base).toString(); } catch { return null; } })();
  if (!abs) return h;
  if (isInternal(abs)) { const u = new URL(abs); return u.pathname + u.search + u.hash; }
  // verify-arch fix: an external href is shown as written (trimmed), not URL-normalised. new URL() inserted a "/" into
  // the raw `https://www.alumiermd.com?code=ATwPQnFl`, so the documents printed a string the source never had.
  return h.trim();
};
const fileOf = (src) => { try { return decodeURIComponent(new URL(src, ORIGIN).pathname.split('/').pop()); } catch { return String(src).split('/').pop(); } };
const plural = (n, w, ws) => n + ' ' + (n === 1 ? w : (ws || w + 's'));
const inOrder = (list) => { const out = []; for (const x of list) { const last = out[out.length - 1]; if (last && last[0] === x) last[1]++; else out.push([x, 1]); } return out.map(([k, n]) => k + (n > 1 ? ' ×' + n : '')).join(', '); };
const words = (t, n) => { const w = clean(t).split(' '); return w.length > n ? w.slice(0, n).join(' ') + ' …' : w.join(' '); }; // site-copy quotes stay under 12 words
const shortHref = (h) => (String(h).length > 100 ? String(h).slice(0, 99) + '…' : String(h));
const seg = (r) => r.path.split('/').filter(Boolean);
const visOf = (el) => { const v = cls(el).filter((c) => /^fl-visible-/.test(c)).map((c) => c.replace('fl-visible-', '')); return v.length ? v.join('/') : 'all'; };
const moduleType = (m) => (cls(m).find((c) => /^fl-module-/.test(c) && c !== 'fl-module-content') || 'fl-module-?').replace(/^fl-module-/, '');
const regionOf = (el) => {
  const r = closest(el, (e) => (e.name === 'header' && hasCls(e, 'ecp-header')) || (e.name === 'footer' && hasCls(e, 'ecp-footer')) || hasCls(e, 'ecp-global-footer') || hasCls(e, 'ecp-secondary') || e.name === 'main' || e.name === 'head');
  if (!r) return 'body';
  if (r.name === 'header') return 'header';
  if (r.name === 'footer') return 'footer';
  if (r.name === 'main') return 'main';
  if (r.name === 'head') return 'head';
  return hasCls(r, 'ecp-secondary') ? 'sidebar' : 'global-footer';
};

/* ---------- stylesheet lookup (link rel=stylesheet only: rel="UNUSEDstylesheet" is not loaded by a browser) ---------- */
const SHEET_FILE = new Map((sheetInv.saved || []).map((s) => [s.url, s.savedAs]));
const sheetCache = new Map();
function pageCssRules(doc, pageUrl) {
  const out = [];
  for (const l of qsa(doc, 'link')) {
    const rel = String(attr(l, 'rel') || '').toLowerCase().split(/\s+/);
    if (!rel.includes('stylesheet')) continue;
    let abs; try { abs = new URL(attr(l, 'href'), pageUrl).toString(); } catch { continue; }
    const f = SHEET_FILE.get(abs);
    if (!f || !exists('audit/css/' + f)) continue;
    if (!sheetCache.has(f)) sheetCache.set(f, cssRules(rd('audit/css/' + f)));
    for (const r of sheetCache.get(f)) out.push({ ...r, src: f });
  }
  for (const st of qsa(doc, 'style')) for (const r of cssRules(text(st, { raw: true }))) out.push({ ...r, src: 'inline' });
  return out;
}
function nodeCss(rules, node) {
  const base = '.fl-node-' + node + ' > .fl-row-content-wrap';
  const base2 = '.fl-node-' + node + '.fl-row > .fl-row-content-wrap'; // the form Beaver Builder uses for responsive overrides
  const res = { base: {}, after: {}, media: {} };
  for (const r of rules) {
    for (const s of r.selectors) {
      let slot = null;
      if (s === base || s === base2) slot = 'base'; else if (s === base + ':after' || s === base2 + ':after') slot = 'after'; else continue;
      for (const [p, v] of r.decls) {
        if (r.media) { (res.media[r.media] = res.media[r.media] || {})[(slot === 'after' ? 'overlay-' : '') + p] = v; }
        else res[slot][p] = v;
      }
    }
  }
  return res;
}
const cssUrlFile = (v) => { const m = /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(v || ''); return m ? fileOf(m[1]) : null; };
const cssUrlHost = (v) => { const m = /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(v || ''); try { return m ? new URL(m[1], ORIGIN).host : null; } catch { return null; } };

/* =====================================================================================================================
 * 5. Per-page census (one parse per raw file)
 * =================================================================================================================== */
const PAGES = site.pages.filter((p) => p.ok && p.savedAs).map((p) => ({ inv: p, key: p.url, url: p.finalUrl || p.url, path: livePath(p.finalUrl || p.url), savedAs: p.savedAs }));
const PAGE_BY_KEY = new Map(PAGES.map((p) => [p.key, p]));
const ALIAS_TO = new Map();
for (const p of PAGES) for (const a of p.inv.aliases || []) ALIAS_TO.set(a, p);
const CONTENT_BY_URL = new Map(content.pages.map((c) => [c.url, c]));
const SEO_BY_URL = new Map(seoInv.pages.map((c) => [c.url, c]));

const SHORTCODE = /\[([a-z_][a-z0-9_-]*)\s+[a-z_][a-z0-9_-]*\s*=\s*['"][^\]]*\]/gi; // [name attr='v'] with an attribute
const BRACKET_INSTR = /\[(specify|insert|enter|add|your|practice|doctor|name of)[^\]]{3,}\]/gi;
const PLACEHOLDERS = [
  [/555-555-5555/, 'placeholder phone 555-555-5555'],
  [/\(location description\)/i, 'placeholder "(location description)"'],
  [/Centerville Plaza/i, 'address text "Centerville Plaza on Hwy 5 ..."'],
  [/name of practice/i, 'placeholder "name of practice"'],
  [/lorem ipsum/i, 'lorem ipsum'],
];
const TEMPLATE_HINT = /tel:\s*$/;

/* ---------- template-family rules (applied per page; the partition is checked in part 6) ---------- */
const LEGAL = new Set(['/disclaimer/', '/privacy-policy/', '/website-accessibility-policy/']);
const FAMILY_RULES = [
  { id: 'template', rule: 'body.single-template: a Beaver Builder global-template post rendered as a page (no header, main, sidebar or footer)', test: (r) => r.postType === 'template' },
  { id: 'home', rule: 'body.home', test: (r) => r.postType === 'home' },
  { id: 'not-found', rule: 'path /404-page-not-found/: a WordPress page holding the 404 body', test: (r) => r.path === '/404-page-not-found/' },
  { id: 'archive', rule: 'body.archive: category, tag and author archives', test: (r) => r.postType.startsWith('archive') },
  { id: 'blog-post', rule: 'body.single-post', test: (r) => r.postType === 'post' },
  { id: 'team-member', rule: 'body.single-team (post type team)', test: (r) => r.postType === 'team' },
  { id: 'testimonial', rule: 'body.single-testimonial (post type testimonial)', test: (r) => r.postType === 'testimonial' },
  { id: 'location', rule: 'body.single-location (post type location)', test: (r) => r.postType === 'location' },
  { id: 'builder-hub', rule: 'body.page with no div.ecp-secondary (body.ecp-sidebar-none, ecp-theme-layout-full): full-width Beaver Builder page', test: (r) => r.postType === 'page' && !r.hasSidebar },
  { id: 'sitemap', rule: 'path /sitemap/: the HTML sitemap page (div.ecp-sitemap)', test: (r) => r.path === '/sitemap/' },
  { id: 'legal', rule: 'path is /disclaimer/, /privacy-policy/ or /website-accessibility-policy/ (sidebar frame, policy copy)', test: (r) => LEGAL.has(r.path) },
  { id: 'form', rule: 'sidebar page whose main holds a Gravity Form (div.gform_wrapper)', test: (r) => r.gforms.length > 0 },
  { id: 'blog-index', rule: 'sidebar page whose main lists post summaries (div.ecp-posts-wrapper-post.ecp-view-summary)', test: (r) => r.postSummaries > 0 },
  { id: 'interior', rule: 'every other body.page that carries the sidebar div.ecp-secondary', test: (r) => r.postType === 'page' && r.hasSidebar },
];
/* ---------- section vocabulary for architecture-map.json pages[].sections ---------- */
const SECTION_KINDS = {
  'hero': 'Beaver Builder row: the first photo-background row, or a row pulled up over it by a negative margin-top',
  'image-band': 'Beaver Builder row with a photo background and no modules (not the first)',
  'empty': 'Beaver Builder row with no modules and no background photo',
  'text': 'Beaver Builder row of heading / rich-text modules only',
  'cta': 'Beaver Builder row whose modules include buttons but no richer module',
  'cards': 'Beaver Builder row with 2+ ecp-callout (photo card) modules', 'callout': 'Beaver Builder row with 1 ecp-callout module',
  'image': 'Beaver Builder row whose richest module is ecp-image', 'text-image': 'Beaver Builder row of heading / rich text beside an ecp-image', 'gallery': 'ecp-gallery module', 'reviews': 'ReviewsModule (testimonial carousel or list)',
  'team': 'ecp-list-team module', 'posts': 'ecp-list-posts module', 'accordion': 'ecp-accordion module', 'video': 'ecp-video module',
  'location': 'ecp-list-locations module, or the location post body', 'brand-logos': 'DesignerFramesModule', 'insurance-logos': 'InsurancesModule',
  'quick-links': 'ecp-badges module', 'search': 'ecp-search module', 'html': 'ecp-html module', 'form': 'Gravity Form',
  'chrome': 'header / footer rows of a /template/* page', 'content': 'classic WordPress content, split at each h2 (one section when there is no h2)',
  'child-pages': 'div.ecp-childpages listing', 'post-list': 'list of posts (blog index summaries or archive title links)', 'no-results': 'article.no-results ("Nothing Found")',
  'profile': 'team member body (portrait + bio)', 'testimonial': 'single testimonial card', 'sitemap-list': 'div.ecp-sitemap listing',
};
const MODULE_KIND = [['ReviewsModule', 'reviews'], ['ecp-list-posts', 'posts'], ['ecp-list-team', 'team'], ['ecp-gallery', 'gallery'], ['DesignerFramesModule', 'brand-logos'], ['InsurancesModule', 'insurance-logos'], ['ecp-list-locations', 'location'], ['ecp-accordion', 'accordion'], ['ecp-video', 'video'], ['ecp-callout', 'callout'], ['ecp-image', 'image'], ['ecp-badges', 'quick-links'], ['ecp-search', 'search'], ['ecp-html', 'html'], ['ecp-button', 'cta'], ['ecp-buttons', 'cta']];
const WIDGET_PATTERNS = { chat: /podium|birdeye|getweave|intercom|tawk\.to|livechatinc|drift\.com|tidio|zendesk/i, consent: /cookieyes|cookiebot|onetrust|termly|iubenda|cookie-law-info|complianz/i, accessibilityOverlay: /userway|accessibe|equalweb/i, reviews: /birdeye|podium|reviewtrackers|trustindex|elfsight|grade\.us|embedsocial|reviewsonmywebsite|yotpo/i };

const PAGE_RECS = [];
const DOCS = new Map(); // savedAs -> {html, doc} kept only for pages the report details
const KEEP_DOCS = new Set(['index.html', 'contact-us-appointment-request-form.html', 'contact-us-contact-form.html', 'disclaimer.html', 'location-riverside-family-eyecare.html', 'sitemap.html']);
let HOME_RULES = null;

for (const pg of PAGES) {
  const html = rd('audit/raw/' + pg.savedAs);
  const doc = parse(html);
  if (KEEP_DOCS.has(pg.savedAs)) DOCS.set(pg.savedAs, { html, doc });
  const body = qs(doc, 'body');
  const bc = cls(body);
  const head = qs(doc, 'head');
  const main = qs(doc, 'main');
  const header = qs(doc, 'header.ecp-header');
  const footer = qs(doc, 'footer.ecp-footer');
  const sidebar = qs(doc, 'div.ecp-secondary');
  const r = { path: pg.path, url: pg.url, key: pg.key, savedAs: pg.savedAs, bytes: pg.inv.bytes };
  r.bodyClasses = bc;
  r.postType = bc.includes('home') ? 'home' : bc.includes('single-template') ? 'template' : bc.includes('single-post') ? 'post' : bc.includes('single-team') ? 'team'
    : bc.includes('single-location') ? 'location' : bc.includes('single-testimonial') ? 'testimonial' : bc.includes('archive') ? 'archive:' + (bc.includes('category') ? 'category' : bc.includes('tag') ? 'tag' : bc.includes('author') ? 'author' : '?')
      : bc.includes('page') ? 'page' : 'other';
  r.layoutClass = bc.find((c) => /^ecp-theme-layout-/.test(c)) || '';
  r.sidebarClass = bc.find((c) => /^ecp-sidebar-/.test(c)) || '';
  r.accent = attr(body, 'data-theme-accent-color') || null;
  r.subdomain = attr(body, 'data-subdomain') || null;
  r.slugClass = bc.find((c) => /^ecp-page-slug-/.test(c)) || null;
  const headTitle = head ? qs(head, 'title') : null;
  r.title = headTitle ? clean(text(headTitle, { raw: true })) : null;
  r.titleRaw = headTitle ? text(headTitle, { raw: true }) : null;
  r.hasHeader = !!header; r.hasFooter = !!footer; r.hasMain = !!main; r.hasSidebar = !!sidebar;
  r.sidebarSig = sidebar ? sha(qsa(sidebar, 'a, img, iframe, h2, h3, li, form').map((x) => x.name + ':' + ttext(x) + '>' + (attr(x, 'href') || attr(x, 'src') || '')).join('\n')) : null;
  r.chromeSig = header && footer ? sha([header, footer].map((x) => qsa(x, 'a, img, form, input').map((y) => y.name + ':' + ttext(y) + '>' + (attr(y, 'href') || attr(y, 'src') || attr(y, 'action') || '')).join('\n')).join('#')) : null;
  // h1
  const h1s = qsa(body || doc, 'h1');
  r.h1 = h1s.map((h) => ttext(h));
  r.h1Empty = r.h1.filter((t) => !t).length;
  r.h1Source = h1s.length ? (hasCls(h1s[0], 'ecp-entry-title') ? 'entry-title' : closest(h1s[0], (e) => hasCls(e, 'fl-module')) ? 'builder-module' : closest(h1s[0], (e) => hasCls(e, 'ecp-post-content') || hasCls(e, 'ecp-entry-content')) ? 'in-content' : 'other') : 'none';
  // verify-arch fix: which builder module holds a builder h1 (the report called all of them `ecp-heading`; 7 of 12 are not)
  r.h1Module = h1s.length && closest(h1s[0], (e) => hasCls(e, 'fl-module')) ? moduleType(closest(h1s[0], (e) => hasCls(e, 'fl-module'))) : null;
  // builder
  const flPrimary = main ? qs(main, '.fl-builder-content-primary') : null;
  const bodyBuilder = !main ? qsa(body || doc, '.fl-builder-content') : [];
  const rowRoot = flPrimary || (bodyBuilder.length ? bodyBuilder[0] : null);
  r.builderInMain = !!flPrimary;
  r.builderBodyLevel = !main && bodyBuilder.length > 0;
  r.rows = rowRoot ? kidsEl(rowRoot).filter((x) => hasCls(x, 'fl-row')) : [];
  r.rowCount = r.rows.length;
  r.rowNodes = main ? qsa(main, '.fl-row').map((x) => attr(x, 'data-node')).filter(Boolean) : [];
  r.modules = (main ? qsa(main, '.fl-module') : rowRoot ? qsa(rowRoot, '.fl-module') : []).map(moduleType);
  // breadcrumb
  const bcAuto = main ? qsa(main, 'div.ecp-breadcrumb.ecp-breadcrumb-auto') : [];
  const bcAny = main ? qsa(main, 'div.ecp-breadcrumb') : [];
  const bcEl = bcAuto[0] || bcAny[0] || null;
  r.breadcrumb = bcAuto.length ? 'auto' : bcAny.length ? 'manual' : 'none';
  r.breadcrumbTrail = bcEl ? qsa(bcEl, 'a').map((a) => ttext(a)) : [];
  // last meaningful child (element, or text node that is not whitespace): the platform prints the current page as a bare text node
  const bcKids = bcEl ? bcEl.kids.filter((k) => k.type === 'el' || (k.type === 'text' && clean(k.text))) : [];
  const bcLast = bcKids[bcKids.length - 1];
  r.breadcrumbEndsWithSep = !!(bcLast && bcLast.type === 'el' && hasCls(bcLast, 'ecp-breadcrumb-separator'));
  r.breadcrumbCurrent = bcLast && bcLast.type === 'text' ? clean(bcLast.text) : null;
  // entry header
  const eh = main ? qs(main, 'header.ecp-entry-header') : null;
  r.entryHeader = !eh ? 'absent' : qs(eh, 'h1') ? 'title' : (ttext(eh) || kidsEl(eh).length) ? 'other' : 'empty';
  r.entryContent = main ? qsa(main, 'div.ecp-entry-content').length > 0 : false;
  r.postComplete = main ? qsa(main, '.ecp-posts-wrapper.ecp-view-complete').length > 0 : false;
  r.postDateEmpty = main ? qsa(main, '.ecp-view-complete .ecp-post-date').filter((d) => !ttext(d)).length : 0;
  // listings
  const cps = main ? qsa(main, 'div.ecp-childpages') : [];
  r.childpages = { lists: cps.length, items: cps.reduce((n, c) => n + qsa(c, 'li.ecp-childpages-link').length, 0), thumbs: cps.reduce((n, c) => n + qsa(c, 'img').length, 0), summariesEmpty: cps.reduce((n, c) => n + qsa(c, '.ecp-childpages-summary').filter((s) => !ttext(s)).length, 0),
    // verify-arch: layout per listing (the photo-grid listings carry a thumbnail per item)
    layouts: cps.map((c) => ({ layout: (cls(c).find((x) => /^ecp-childpages-layout-/.test(x)) || 'ecp-childpages-layout-?').replace('ecp-childpages-layout-', ''), items: qsa(c, 'li.ecp-childpages-link').length, thumbs: qsa(c, 'img').length })) };
  r.postSummaries = main ? qsa(main, '.ecp-posts-wrapper-post.ecp-view-summary .ecp-post').length : 0;
  r.postGrid = main ? qsa(main, '.ecp-posts-wrapper-post.ecp-view-grid .ecp-post').length : 0;
  r.archiveLinks = main && r.postType.startsWith('archive') ? qsa(main, 'div.ecp-entry-title > a').length : 0;
  r.noResults = main ? qsa(main, 'article.no-results').length > 0 : false;
  r.sitemapLinks = main ? qsa(main, '.ecp-sitemap li').length : 0;
  r.testimonialCards = main ? qsa(main, '.ecp-posttype-testimonial').length : 0;
  r.accordions = main ? qsa(main, '.ecp-accordion').length : 0;
  // forms
  r.gforms = main ? qsa(main, '.gform_wrapper').map((w) => attr(qs(w, 'form'), 'id') || attr(w, 'id')) : [];
  r.searchForms = countBy(qsa(doc, 'form.ecp-search'), (f) => regionOf(f));
  r.voiceSearch = qsa(doc, 'form#voice_search').length;
  // media / embeds
  r.iframes = qsa(doc, 'iframe').map((f) => { const src = attr(f, 'src') || attr(f, 'data-src') || ''; let u = null; try { u = new URL(src, pg.url); } catch { } return { src, lazy: !attr(f, 'src') && !!attr(f, 'data-src'), host: u ? u.host : '(bad)', path: u ? u.pathname : '', q: u ? u.searchParams.get('q') : null, region: regionOf(f), title: attr(f, 'title') || null }; });
  r.videos = qsa(doc, 'video').map((v) => ({ src: attr(qs(v, 'source'), 'src') || attr(v, 'src') || '', region: regionOf(v) }));
  r.images = qsa(doc, 'img').map((im) => ({ src: attr(im, 'src') || attr(im, 'data-src') || '', alt: attr(im, 'alt'), region: regionOf(im) }));
  // head SEO
  r.robots = qsa(doc, 'meta[name=robots]').map((m) => attr(m, 'content') || '');
  r.descriptions = qsa(doc, 'meta[name=description]').map((m) => attr(m, 'content') || '');
  r.canonicals = qsa(doc, 'link[rel=canonical]').map((m) => attr(m, 'href') || '');
  r.og = Object.fromEntries(qsa(doc, 'meta[property^=og:]').map((m) => [attr(m, 'property'), attr(m, 'content') || '']));
  r.twitter = Object.fromEntries(qsa(doc, 'meta[name^=twitter:]').map((m) => [attr(m, 'name'), attr(m, 'content') || '']));
  r.hreflang = qsa(doc, 'link[hreflang]').length;
  r.jsonLd = []; r.jsonLdErrors = []; r.breadcrumbListSig = null; r.breadcrumbListItems = [];
  for (const s of qsa(doc, 'script[type="application/ld+json"]')) {
    const raw = text(s, { raw: true });
    try {
      const j = JSON.parse(raw);
      const visit = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) { o.forEach(visit); return; } if (o['@type'] && o['@context']) r.jsonLd.push([].concat(o['@type']).join('+')); if (o['@type'] === 'BreadcrumbList') { r.breadcrumbListSig = sha(JSON.stringify(o)); r.breadcrumbListItems = (o.itemListElement || []).map((it) => ({ name: it.name, item: it.item })); } if (o['@graph']) visit(o['@graph']); };
      visit(j);
    } catch (e) { const t = /"@type"\s*:\s*"([^"]+)"/.exec(raw); r.jsonLdErrors.push({ type: t ? t[1] : '?', error: String(e.message).split(' in JSON')[0] }); }
  }
  // scripts, third parties, platform paths
  r.scriptSrcs = qsa(doc, 'script[src]').map((s) => attr(s, 'src'));
  r.themes = uniq([...html.matchAll(/\/wp-content\/themes\/([A-Za-z0-9_.-]+)\//g)].map((m) => m[1]));
  r.plugins = uniq([...html.matchAll(/\/wp-content\/plugins\/([A-Za-z0-9_.-]+)\//g)].map((m) => m[1]));
  r.styleIds = qsa(doc, 'style[id], link[id]').map((s) => attr(s, 'id'));
  r.gtm = uniq([...html.matchAll(/GTM-[A-Z0-9]{4,}/g)].map((m) => m[0]));
  r.gtmNoscript = /<noscript>\s*<iframe[^>]+googletagmanager\.com\/ns\.html/i.test(html);
  r.gtmHeadLoader = head ? qsa(head, 'script').some((s) => { const t = text(s, { raw: true }); return /GTM-[A-Z0-9]+/.test(t) && /dataLayer/.test(t); }) : false;
  r.ga4 = uniq([...html.matchAll(/\bG-[A-Z0-9]{8,12}\b/g)].map((m) => m[0]));
  r.ga4Where = r.ga4.length ? (qsa(doc, 'script[src]').some((s) => r.ga4.some((id) => (attr(s, 'src') || '').includes(id))) ? 'script src' : qsa(doc, 'script').some((s) => r.ga4.some((id) => text(s, { raw: true }).includes(id))) ? 'inline script' : 'other markup') : null;
  r.preconnect = qsa(doc, 'link[rel=preconnect]').map((l) => { try { return new URL(attr(l, 'href'), pg.url).host; } catch { return '?'; } });
  r.gads = /googleadservices\.com\/pagead\/conversion_async\.js/.test(html);
  r.cherry = /files\.withcherry\.com\/widgets\/widget\.js/.test(html);
  r.floatingEstimator = !!qs(doc, '#floatingEstimator');
  r.recaptcha = /google\.com\/recaptcha\/api\.js/.test(html);
  r.recaptchaFields = qsa(doc, '.ginput_recaptcha').length;
  r.akismet = /ak_hp_textarea/.test(html);
  r.wpEmoji = /wp-emoji/.test(html);
  r.generatedPage = /<!-- GENERATED-PAGE-/.test(html);
  r.unusedStylesheet = qsa(doc, 'link[rel=UNUSEDstylesheet]').length;
  r.googleFonts = qsa(doc, 'link[href*=fonts.googleapis.com]').map((l) => attr(l, 'href'));
  r.iconCss = qsa(doc, 'link[href*=icon-1734360712]').length > 0;
  r.foundicons = /foundicons/.test(html);
  r.splide = qsa(doc, '.splide').length;
  r.reviewsModule = qsa(doc, '.fl-module-ReviewsModule').length;
  r.verdana = /body\{font-family:Verdana;\}/.test(html);
  r.ecpbuilderRefs = (html.match(/ecpbuilder\.com/g) || []).length;
  r.poweredBy = !!qs(doc, 'a.ecp-powered-by');
  r.loginLink = !!qs(doc, 'a#ecp-footer-login-link');
  // links
  r.links = qsa(doc, 'a[href]').map((a) => ({ href: attr(a, 'href'), abs: normUrl(attr(a, 'href'), pg.url), region: regionOf(a), label: ttext(a) || attr(a, 'aria-label') || '' }));
  // leaks (visible text only: text nodes outside head/script/style), attributes
  r.leaks = [];
  for (const x of walk(doc)) {
    if (x.type !== 'text' || x.rawtext) continue;
    const reg = regionOf(x.parent);
    if (reg === 'head') continue;
    const mod = closest(x.parent, (e) => hasCls(e, 'fl-module'));
    const where = reg + (mod ? ' > fl-module-' + moduleType(mod) : '') + ' ' + x.parent.name + (cls(x.parent).length ? '.' + cls(x.parent).slice(0, 2).join('.') : '');
    for (const m of x.text.matchAll(SHORTCODE)) r.leaks.push({ kind: 'shortcode', value: m[0], where });
    for (const m of x.text.matchAll(BRACKET_INSTR)) r.leaks.push({ kind: 'bracket-placeholder', value: m[0], where });
    for (const [re, label] of PLACEHOLDERS) if (re.test(x.text)) r.leaks.push({ kind: 'placeholder', value: label, where });
  }
  for (const a of qsa(doc, 'a[href]')) { const h = attr(a, 'href'); if (/^tel:\s*$/i.test(h)) r.leaks.push({ kind: 'empty-tel', value: 'href="' + h + '"', where: regionOf(a) + ' a "' + ttext(a) + '"' }); }
  r.mainButtons = main ? qsa(main, 'a.ecp-button, span.ecp-button').map((a) => ({ label: ttext(qs(a, '.ecp-button-label') || a), href: a.name === 'a' ? showHref(attr(a, 'href'), pg.url) : null })) : [];
  r.formKinds = qsa(doc, 'form').map((f) => (closest(f, (e) => hasCls(e, 'gform_wrapper')) ? 'gravity-form' : hasCls(f, 'ecp-search') ? 'search' : attr(f, 'id') === 'voice_search' ? 'voice-search' : 'other:' + (attr(f, 'id') || cls(f).join('.') || attr(f, 'action') || '?')));
  r.formTextInScripts = qsa(doc, 'script').reduce((n, s) => n + (text(s, { raw: true }).match(/<form/gi) || []).length, 0);
  r.ecpbuilder = {
    adminUrlMeta: qsa(doc, 'meta[name=admin_url]').some((m) => /ecpbuilder\.com/.test(attr(m, 'content') || '')),
    mercatorSso: r.scriptSrcs.some((s) => /ecpbuilder\.com\/wp-admin\/admin-ajax\.php\?action=mercator/.test(s || '')),
    mercatorCommented: /<!--[\s\S]{0,200}?action=mercator-sso-js/.test(html),
    themeHeaderComment: /Theme URI:\s*http:\/\/www\.ecpbuilder\.com/.test(html),
    dataSubdomain: /ecpbuilder\.com/.test(r.subdomain || ''),
    loginLink: qsa(doc, 'a[href]').some((a) => /ecpbuilder\.com\/wp-admin/.test(attr(a, 'href'))),
    imgOrCssInHtml: /(src="|url\()https?:\/\/[a-z0-9.-]*ecpbuilder\.com/i.test(html.replace(/<!--[\s\S]*?-->/g, '')),
  };
  r.themeName = (/Theme Name:[ \t]*([A-Za-z0-9 _-]+?)(?=\s+(?:Description|Theme URI|Author|Version|Template|Text Domain)\s*:|\s*\*|\r|\n|$)/.exec(html) || [])[1] || null;
  r.themeTemplate = (/Theme Name:[\s\S]{0,600}?Template:[ \t]*([A-Za-z0-9_-]+)/.exec(html) || [])[1] || null;
  r.favicon = qsa(doc, 'link[rel=icon], link[rel="shortcut icon"]').map((l) => { try { return new URL(attr(l, 'href'), pg.url).host; } catch { return '?'; } });
  r.bcSelfLink = bcEl ? qsa(bcEl, 'a').some((a) => normUrl(attr(a, 'href'), pg.url) === pg.key) : false;
  r.bcLooseText = bcEl ? kidsEl(bcEl).filter((k) => k.name !== 'a' && !hasCls(k, 'ecp-breadcrumb-separator')).map((k) => ttext(k)).filter(Boolean).concat(bcEl.kids.filter((k) => k.type === 'text').map((k) => clean(k.text)).filter(Boolean)) : [];
  r.addresses = qsa(doc, '.ecp-post-address').map((a) => ({ region: regionOf(a), text: ttext(a) }));
  r.subheadings = main ? qsa(main, '.ecp-post-subheading').map((s) => ttext(s)) : [];
  r.ecpColumns = main ? qsa(main, '.ecp-column').length : 0;
  r.bodyRowNodes = !main ? qsa(body || doc, '.fl-row').map((x) => attr(x, 'data-node')).filter(Boolean) : [];
  r.mercatorInComment = [...walk(doc)].some((x) => x.type === 'comment' && /action=mercator-sso-js/.test(x.text));
  r.speechInline = qsa(doc, 'script').some((s) => /webkitSpeechRecognition/.test(text(s, { raw: true })));
  r.speechTargetsId = (() => { const s = qsa(doc, 'script').map((x) => text(x, { raw: true })).find((t) => /webkitSpeechRecognition/.test(t)); const m = s ? /getElementById\('([^']+)'\)\.value/.exec(s) : null; return m ? m[1] : null; })();
  r.speechTargetExists = r.speechTargetsId ? !!qs(doc, '#' + r.speechTargetsId) : null;
  r.voiceInputId = (() => { const i = qs(doc, 'form#voice_search input'); return i ? attr(i, 'id') : null; })();
  r.stars = main ? qsa(main, '.ecp-posttype-testimonial').map((t) => qsa(t, '.ecp-rating-star-full').length) : [];
  r.summaryTitleTags = main ? uniq(qsa(main, '.ecp-view-summary .ecp-post-title').map((t) => (kidsEl(t)[0] || { name: '?' }).name)) : [];
  r.postImage = main ? qsa(main, '.ecp-view-complete .ecp-post-image img').length : 0;
  r.videoClickToActivate = qsa(doc, '.ecp-video.ecp-video-click-to-activate').length;
  const fe = qs(doc, '#floatingEstimator');
  r.feEmpty = fe ? !fe.kids.some((k) => k.type === 'el' || (k.type === 'text' && clean(k.text))) : null;
  r.gtmAfterFe = fe ? (() => { const sib = fe.parent.kids.filter((k) => k.type === 'el'); const nx = sib[sib.indexOf(fe) + 1]; return !!(nx && nx.name === 'noscript' && /googletagmanager\.com\/ns\.html/.test(text(nx, { raw: true }))); })() : false;
  r.animMarkers = [...walk(doc)].filter((x) => x.type === 'el' && (cls(x).some((c) => /^(wow|fl-animation|fl-animated|animated|animate__[\w-]+|aos-[\w-]+)$/.test(c)) || Object.keys(x.attrs).some((k) => /^data-(animation|wow-|aos)/.test(k)))).length;
  r.inlineSvgIcons = qsa(doc, 'span.ecp-icon-svg svg').length;
  r.gadsScript = r.scriptSrcs.some((s) => /googleadservices\.com\/pagead\/conversion_async\.js/.test(s || ''));
  r.firstHopFromSelf = (pg.inv.redirectChain || []).length ? normUrl(pg.inv.redirectChain[0].from) === pg.key : null;
  r.leakPosts = r.leaks.filter((l) => l.kind === 'shortcode').length ? uniq(qsa(doc, '.ecp-post').filter((p) => SHORTCODE.test(ttext(p)) && (SHORTCODE.lastIndex = 0, true)).map((p) => { const a = qs(p, '.ecp-post-title a'); return a ? showHref(attr(a, 'href'), pg.url) : null; }).filter(Boolean)) : [];
  r.shortcodeInJsonScript = qsa(doc, 'script[type="application/json"]').some((s) => /\[(account|location)\s+get=/.test(text(s, { raw: true })));
  r.positions = main ? qsa(main, '.ecp-view-complete .ecp-post-position').map((x) => ttext(x)) : [];
  r.postDates = main ? qsa(main, '.ecp-view-complete .ecp-post-date').map((x) => ttext(x)) : [];
  r.summaryDates = main ? qsa(main, '.ecp-view-summary .ecp-post-date').map((x) => ttext(x)) : [];
  r.widgetHits = Object.fromEntries(Object.entries(WIDGET_PATTERNS).map(([k, re]) => [k, re.test(html)]));
  r.content = CONTENT_BY_URL.get(pg.key) || null;
  r.wordCount = r.content ? r.content.wordCount : null;
  r.extractorType = r.content ? r.content.pageType : null;
  if (pg.savedAs === 'index.html') HOME_RULES = pageCssRules(doc, pg.url);
  r.mainRef = main;
  r.family = (FAMILY_RULES.find((f) => f.test(r)) || {}).id || null;
  r.sections = pageSections(r);
  delete r.mainRef; r.rows = undefined; // release the tree (only KEEP_DOCS stay in memory)
  PAGE_RECS.push(r);
}
const REC_BY_PATH = new Map(PAGE_RECS.map((r) => [r.path, r]));
const HOME = PAGE_RECS.find((r) => r.path === '/');

/* =====================================================================================================================
 * 6. Template families (first matching rule wins) + partition check with positive control
 * =================================================================================================================== */
function assignFamilies(recs) { const out = new Map(); for (const r of recs) { const f = FAMILY_RULES.find((x) => x.test(r)); out.set(r, f ? f.id : null); } return out; }
function partitionErrors(recs, famOf, expectedKeys) {
  const errs = [];
  const seen = new Map();
  for (const r of recs) { seen.set(r.key, (seen.get(r.key) || 0) + 1); if (!famOf.get(r)) errs.push('unassigned ' + r.path); }
  for (const k of expectedKeys) if (!seen.has(k)) errs.push('missing ' + k);
  for (const [k, n] of seen) if (n > 1) errs.push('duplicated ' + k);
  return errs;
}
const FAM_OF = assignFamilies(PAGE_RECS);
const EXPECTED_KEYS = site.pages.filter((p) => p.ok && p.savedAs).map((p) => p.url);
const PARTITION_ERRORS = partitionErrors(PAGE_RECS, FAM_OF, EXPECTED_KEYS);
// positive control: a mutated copy (one page dropped, one page doubled, one unknown post type) must trip all three checks
const PARTITION_CONTROL = (() => {
  const mutated = PAGE_RECS.slice(1).concat([PAGE_RECS[5], { ...PAGE_RECS[6], key: 'x:fake', path: '/fake/', postType: 'other', hasSidebar: false }]);
  const errs = partitionErrors(mutated, assignFamilies(mutated), EXPECTED_KEYS);
  const fired = { missing: errs.some((e) => e.startsWith('missing')), duplicated: errs.some((e) => e.startsWith('duplicated')), unassigned: errs.some((e) => e.startsWith('unassigned')) };
  if (!fired.missing || !fired.duplicated || !fired.unassigned) throw new Error('partition positive control did not fire: ' + JSON.stringify(fired));
  return fired;
})();
if (PARTITION_ERRORS.length) throw new Error('family partition broken (fail closed): ' + PARTITION_ERRORS.join('; '));
const FAMILY_IDS = FAMILY_RULES.map((f) => f.id);
const FAM_MEMBERS = new Map(FAMILY_IDS.map((id) => [id, PAGE_RECS.filter((r) => FAM_OF.get(r) === id)]));
for (const r of PAGE_RECS) r.family = FAM_OF.get(r);
const RULE_OVERLAPS = PAGE_RECS.map((r) => ({ r, ids: FAMILY_RULES.filter((f) => f.test(r)).map((f) => f.id) })).filter((x) => x.ids.length > 1);
const NOISE_BODY = /^(page-id-\d+|postid-\d+|parent-pageid-\d+|ecp-page-slug-.*|level\d+|category-[\w-]+|tag-[\w-]+|author-[\w-]+|page-child|page-parent|single-format-standard|has-post-thumbnail)$/;
function familyMarkers(members) {
  const n = members.length;
  const inter = members.reduce((acc, r) => acc.filter((c) => r.bodyClasses.includes(c)), members[0] ? members[0].bodyClasses.filter((c) => !NOISE_BODY.test(c)) : []);
  const c = (f) => members.filter(f).length;
  const m = [];
  m.push('body classes on all ' + n + ': ' + inter.map((x) => '.' + x).join(' '));
  m.push('sidebar div.ecp-secondary: ' + c((r) => r.hasSidebar) + '/' + n);
  m.push('Beaver Builder layout in main: ' + c((r) => r.builderInMain) + '/' + n + (c((r) => r.builderBodyLevel) ? '; builder rows at body level (no main): ' + c((r) => r.builderBodyLevel) : ''));
  const bcs = countBy(members, (r) => r.breadcrumb); m.push('breadcrumb: ' + sortDesc(bcs).map(([k, v]) => k + ' ' + v).join(', '));
  const hs = countBy(members, (r) => r.h1Source + (r.h1.length > 1 ? ' (+' + (r.h1.length - 1) + ' more h1)' : '') + (r.h1Empty ? ' (empty)' : '')); m.push('h1: ' + sortDesc(hs).map(([k, v]) => k + ' ' + v).join(', '));
  if (c((r) => r.childpages.lists)) m.push('child-page listing: ' + c((r) => r.childpages.lists) + ' pages, ' + members.reduce((s, r) => s + r.childpages.items, 0) + ' links');
  if (c((r) => r.gforms.length)) m.push('Gravity Forms: ' + uniq(members.flatMap((r) => r.gforms)).join(', '));
  if (c((r) => r.postSummaries)) m.push('post summaries listed: ' + members.reduce((s, r) => s + r.postSummaries, 0));
  if (c((r) => r.noResults)) m.push('"Nothing Found" (article.no-results): ' + c((r) => r.noResults));
  if (c((r) => r.postComplete)) m.push('div.ecp-posts-wrapper.ecp-view-complete present: ' + c((r) => r.postComplete));
  return m;
}

/* =====================================================================================================================
 * 7. Sections per page (for architecture-map.json pages[].sections). Closed vocabulary, see SECTION_KINDS.
 * =================================================================================================================== */
function headingsIn(el) {
  const out = [];
  for (const x of walk(el)) {
    if (x.type !== 'el') continue;
    if (/^h[1-6]$/.test(x.name)) { const t = ttext(x); if (t) out.push({ tag: x.name, text: t }); continue; }
    if (hasCls(x, 'ecp-heading') && !/^h[1-6]$/.test(x.name)) { const t = ttext(x); if (t) out.push({ tag: x.name + '.ecp-heading', text: t }); continue; }
    if (hasCls(x, 'ecp-heading-tag') && !/^h[1-6]$/.test(x.name) && !closest(x.parent, (e) => hasCls(e, 'ecp-heading'))) { const t = ttext(x); if (t) out.push({ tag: x.name + '.ecp-heading-tag', text: t }); }
  }
  return out;
}
function rowKind(row, idx, rows, rules) {
  const mods = qsa(row, '.fl-module').map(moduleType);
  const bgPhoto = hasCls(row, 'fl-row-bg-photo');
  const css = rules ? nodeCss(rules, attr(row, 'data-node')) : null;
  const mt = css ? parseFloat(css.base['margin-top'] || '0') : 0;
  const firstPhoto = rows.findIndex((x) => hasCls(x, 'fl-row-bg-photo'));
  const prev = rows[idx - 1];
  if (qsa(row, '.gform_wrapper').length) return 'form';
  if (bgPhoto && idx === firstPhoto && rows.slice(0, idx).every((x) => !qsa(x, '.fl-module').length)) return 'hero';
  if (mt < 0 && prev && hasCls(prev, 'fl-row-bg-photo') && rows.indexOf(prev) === firstPhoto) return 'hero';
  if (!mods.length) return bgPhoto ? 'image-band' : 'empty';
  for (const [m, k] of MODULE_KIND) if (mods.includes(m)) {
    if (k === 'callout') return mods.filter((x) => x === 'ecp-callout').length >= 2 ? 'cards' : 'callout';
    if (k === 'image' && mods.some((x) => ['ecp-richtext', 'rich-text', 'ecp-heading'].includes(x))) return 'text-image';
    return k;
  }
  return 'text';
}
function pageSections(r) {
  const main = r.mainRef;
  if (r.family === 'template') return r.rows.map((row) => ({ heading: (headingsIn(row)[0] || {}).text || '', kind: 'chrome' }));
  if (!main) return [];
  const out = [];
  if (r.builderInMain) {
    const rules = r.path === '/' ? HOME_RULES : null;
    r.rows.forEach((row, i) => out.push({ heading: (headingsIn(row)[0] || {}).text || '', kind: rowKind(row, i, r.rows, rules) }));
  } else if (r.family === 'archive') {
    out.push({ heading: r.h1[0] || '', kind: r.noResults ? 'no-results' : 'post-list' });
  } else if (r.family === 'team-member') {
    out.push({ heading: r.h1[0] || '', kind: 'profile' });
  } else if (r.family === 'testimonial') {
    out.push({ heading: r.h1[0] || '', kind: 'testimonial' });
  } else if (r.family === 'location') {
    out.push({ heading: r.h1[0] || '', kind: 'location' });
  } else if (r.family === 'sitemap') {
    out.push({ heading: r.h1[0] || '', kind: 'sitemap-list' });
  } else {
    const box = qs(main, 'div.ecp-entry-content') || qs(main, '.ecp-view-complete .ecp-post-content') || qs(main, 'article');
    if (box) {
      const h2s = qsa(box, 'h2').filter((h) => !closest(h, (e) => hasCls(e, 'ecp-posts-wrapper') && hasCls(e, 'ecp-view-summary')));
      if (h2s.length) for (const h of h2s) out.push({ heading: ttext(h), kind: 'content' });
      else { const h = qs(box, 'h1, h3'); out.push({ heading: h ? ttext(h) : (r.h1[0] || ''), kind: 'content' }); }
      if (r.postSummaries) out.push({ heading: '', kind: 'post-list' });
    }
  }
  if (r.gforms.length && !out.some((s) => s.kind === 'form')) out.push({ heading: r.h1[0] || '', kind: 'form' });
  if (r.childpages.lists) out.push({ heading: '', kind: 'child-pages' });
  return out;
}

/* =====================================================================================================================
 * 8. Home page: CSS index, Beaver Builder rows, header/footer chrome
 * =================================================================================================================== */
const H = DOCS.get('index.html');
function cssSummary(css) {
  const parts = [];
  const b = css.base;
  if (b['background-color']) parts.push('colour ' + b['background-color']);
  const img = cssUrlFile(b['background-image']);
  if (img) parts.push('photo ' + code(img) + (cssUrlHost(b['background-image']) && cssUrlHost(b['background-image']) !== HOST ? ' (served from ' + cssUrlHost(b['background-image']) + ')' : '') + (b['background-position'] ? ' at ' + b['background-position'] : ''));
  if (css.after['background-color']) parts.push('overlay ' + css.after['background-color']);
  // verify-arch fixes: (1) any non-zero node margin is shown (a positive margin-top such as row 7's 62px was dropped);
  // (2) a padding side the node does not set is shown as "default" (it was printed as "0", but the layout's own
  // `.fl-row-content-wrap` rule then applies, see ROW_DEFAULT_PAD); (3) once the base margin-top is negative, every
  // responsive margin-top override is shown, including a reset to 0px (row 3 drops the overlap at max-width 768px).
  for (const k of ['margin-top', 'margin-bottom']) if (b[k] && parseFloat(b[k]) !== 0) parts.push(k + ' ' + b[k]);
  const pad = ['padding-top', 'padding-bottom'].filter((k) => b[k] && b[k] !== '0px').map((k) => b[k]);
  if (pad.length) parts.push('padding ' + (b['padding-top'] || 'default') + '/' + (b['padding-bottom'] || 'default'));
  const baseNeg = b['margin-top'] && parseFloat(b['margin-top']) < 0;
  for (const [mq, d] of Object.entries(css.media)) { const x = []; if (d['background-image']) x.push('photo ' + code(cssUrlFile(d['background-image']))); if (d['margin-top'] && (parseFloat(d['margin-top']) < 0 || baseNeg)) x.push('margin-top ' + d['margin-top']); if (x.length) parts.push('@media ' + mq + ': ' + x.join(', ')); }
  return parts;
}
function ctasIn(el, base) {
  const out = [];
  for (const a of qsa(el, 'a[href]')) {
    const href = attr(a, 'href');
    const kind = hasCls(a, 'ecp-button') ? 'button' : hasCls(a, 'ecp-callout-title-text') ? 'card title' : qs(a, 'img') ? 'image link' : closest(a, (e) => /^h[1-6]$/.test(e.name) || hasCls(e, 'ecp-heading') || hasCls(e, 'ecp-heading-tag')) ? 'heading link' : closest(a, (e) => hasCls(e, 'ecp-post-metabar')) ? 'read more' : 'inline link';
    out.push({ kind, label: (qs(a, '.ecp-button-label') ? ttext(qs(a, '.ecp-button-label')) : ttext(a)) || (qs(a, 'img') ? '[image ' + fileOf(attr(qs(a, 'img'), 'src')) + ']' : attr(a, 'aria-label') || ''), href: showHref(href, base), rawHref: href, target: attr(a, 'target') || null, leadingSpace: /^\s/.test(href || '') });
  }
  return out;
}
function rowDetail(row, idx, rows, rules, base) {
  const node = attr(row, 'data-node');
  const css = nodeCss(rules, node);
  const mods = qsa(row, '.fl-module');
  const dataBg = attr(row, 'data-background-image-src');
  const carousel = qsa(row, '[data-splide]').map((x) => { let parsed = null; try { parsed = JSON.parse(attr(x, 'data-splide')); } catch { } return { raw: clean(attr(x, 'data-splide')), parsed }; });
  return {
    index: idx + 1, node, visibility: visOf(row), width: hasCls(row, 'fl-row-full-width') ? 'full' : 'fixed', bgClass: (cls(row).find((c) => /^fl-row-bg-(none|color|photo|video|slideshow|parallax)$/.test(c)) || '').replace('fl-row-bg-', ''), overlayClass: hasCls(row, 'fl-row-bg-overlay'), customHeight: hasCls(row, 'fl-row-custom-height'),
    background: cssSummary(css).concat(dataBg ? ['data-background-image-src ' + code(fileOf(dataBg))] : []), css,
    modules: mods.map((m) => moduleType(m) + (visOf(m) !== 'all' ? ' [' + visOf(m) + ']' : '')), moduleTypes: mods.map(moduleType),
    headings: headingsIn(row), images: qsa(row, 'img').map((im) => ({ file: fileOf(attr(im, 'src') || attr(im, 'data-src') || ''), alt: attr(im, 'alt') == null ? null : attr(im, 'alt') })),
    ctas: ctasIn(row, base), carousel, words: ttext(row).split(' ').filter(Boolean).length, kind: rowKind(row, idx, rows, rules),
    galleryCaptions: qsa(row, '.ecp-gallery-item-caption').map((c) => ttext(c)), reviewCount: qsa(row, '.ecp-review').length, reviewNames: qsa(row, '.ecp-review-name').map((x) => ttext(x)), reviewTimes: qsa(row, '.ecp-rating-time').map((x) => ttext(x)),
    postTitles: qsa(row, '.ecp-posts-wrapper-post .ecp-post-title').map((x) => ttext(x)), postDates: qsa(row, '.ecp-posts-wrapper-post .ecp-post-date').map((x) => ttext(x)),
    teamNames: qsa(row, '.ecp-posts-wrapper-team .ecp-post-title').map((x) => ttext(x)),
    cards: qsa(row, '.ecp-callout').map((c) => ({ title: ttext(qs(c, '.ecp-callout-title')), text: ttext(qs(c, '.ecp-callout-content')) })),
    cols: qsa(row, '.fl-col').length, emptyCols: qsa(row, '.fl-col').filter((c) => !qsa(c, '.fl-module').length).length,
    reviewStars: qsa(row, '.ecp-review').map((rv) => qsa(rv, '.ecp-rating-star-full').length),
  };
}
const homeMain = qs(H.doc, 'main');
const homeRowsEl = kidsEl(qs(homeMain, '.fl-builder-content-primary')).filter((x) => hasCls(x, 'fl-row'));
const HOME_ROWS = homeRowsEl.map((row, i) => rowDetail(row, i, homeRowsEl, HOME_RULES, HOME.url));
// verify-arch fix: the padding a row inherits when its node rule leaves a side unset (last top-level `.fl-row-content-wrap`
// padding declaration in the home's stylesheets, in cascade order). cssSummary prints such a side as "default".
const ROW_DEFAULT_PAD = (() => {
  let v = null; let src = null;
  for (const r of HOME_RULES || []) {
    if (r.media || !r.selectors.includes('.fl-row-content-wrap')) continue;
    for (const [p, x] of r.decls) {
      if (p === 'padding-bottom') { v = x; src = r.src; } else if (p === 'padding') { const parts = x.split(/\s+/); v = parts.length >= 3 ? parts[2] : parts[0]; src = r.src; }
    }
  }
  return v ? { value: v, src } : null;
})();
const homeEntryHeaderEmpty = HOME.entryHeader === 'empty';

function menuTree(ul) {
  if (!ul) return [];
  return kidsEl(ul).filter((li) => li.name === 'li').map((li) => {
    const a = kidsEl(li).find((x) => x.name === 'a');
    const sub = kidsEl(li).find((x) => x.name === 'ul');
    return { label: a ? ttext(a) : ttext(li), href: a ? showHref(attr(a, 'href'), HOME.url) : null, rawHref: a ? attr(a, 'href') : null, children: menuTree(sub) };
  });
}
const treeSig = (t) => JSON.stringify(t.map((x) => [x.label, x.rawHref, treeSig(x.children)]));
function moduleItems(m, base) {
  const t = moduleType(m);
  const o = { type: t, node: attr(m, 'data-node'), visibility: visOf(m) };
  if (t === 'ecp-richtext') { o.text = ttext(m); o.links = ctasIn(m, base).map((c) => ({ label: c.label, href: c.href })); o.blockTags = uniq(qsa(m, 'p, h1, h2, h3, h4, h5, h6, li').map((x) => x.name)); }
  if (t === 'ecp-button') { const a = qs(m, 'a.ecp-button') || qs(m, '.ecp-button'); o.element = a ? a.name + '.ecp-button' : null; o.label = a ? ttext(qs(a, '.ecp-button-label') || a) : ''; o.href = a && a.name === 'a' ? showHref(attr(a, 'href'), base) : null; o.rawHref = a ? attr(a, 'href') : null; o.icon = a ? hasCls(a, 'ecp-button-withicon') : false; o.target = a ? attr(a, 'target') || null : null; }
  if (t === 'ecp-logo') { const im = qs(m, 'img'); const a = qs(m, 'a'); o.img = im ? fileOf(attr(im, 'src')) : null; o.imgHost = im ? (() => { try { return new URL(attr(im, 'src'), base).host; } catch { return null; } })() : null; o.alt = im ? attr(im, 'alt') : null; o.href = a ? showHref(attr(a, 'href'), base) : null; }
  if (t === 'ecp-menu') { const nav = qs(m, 'nav.ecp-menu'); o.navClass = nav ? cls(nav).join(' ') : null; o.tree = menuTree(nav ? qs(nav, 'ul') : null); o.copies = qsa(m, 'nav').length; o.hamburger = !!qs(m, '.ecp-menu-hamburger-trigger-button'); o.focusTrap = qs(m, '.ecp-menu-mobile-focus-trap') ? ttext(qs(m, '.ecp-menu-mobile-focus-trap')) : null; o.convertAt = (cls(qs(m, '.ecp-menu-wrapper')).find((c) => /^ecp-menu-convert-at-/.test(c)) || '').replace('ecp-menu-convert-at-', ''); }
  if (t === 'ecp-mobile-header') { const im = qs(m, '.ecp-mobile-header__logo img'); o.img = im ? fileOf(attr(im, 'src')) : null; o.alt = im ? attr(im, 'alt') : null; o.buttons = qsa(m, '.ecp-mobile-header__buttons a').map((a) => ({ class: cls(a).join('.'), ariaLabel: attr(a, 'aria-label') || null, href: showHref(attr(a, 'href'), base), text: ttext(a) })); const nav = qs(m, 'nav.ecp-menu'); o.tree = menuTree(nav ? qs(nav, 'ul') : null); o.copies = qsa(m, 'nav').length; o.focusTrap = qs(m, '.ecp-menu-mobile-focus-trap') ? ttext(qs(m, '.ecp-menu-mobile-focus-trap')) : null; o.convertAt = (cls(qs(m, '.ecp-menu-wrapper')).find((c) => /^ecp-menu-convert-at-/.test(c)) || '').replace('ecp-menu-convert-at-', ''); }
  if (t === 'ecp-socialicons') o.icons = qsa(m, 'a').map((a) => ({ network: (cls(a).find((c) => /^ecp-network-/.test(c)) || '').replace('ecp-network-', ''), ariaLabel: attr(a, 'aria-label') || null, href: attr(a, 'href'), shape: (cls(a).find((c) => /^ecp-icon-shape-/.test(c)) || 'ecp-icon-shape-?').replace('ecp-icon-shape-', 'shape '), background: hasCls(a, 'ecp-icon-background') }));
  if (t === 'ecp-voice-search') { const f = qs(m, 'form'); const inp = qs(m, 'input'); o.formId = f ? attr(f, 'id') : null; o.action = f ? attr(f, 'action') : null; o.method = f ? (attr(f, 'method') || 'get') : null; o.label = qs(m, 'label') ? ttext(qs(m, 'label')) : null; o.inputName = inp ? attr(inp, 'name') : null; o.placeholder = inp ? attr(inp, 'placeholder') || null : null; o.labelClass = qs(m, 'label') ? cls(qs(m, 'label')).join('.') : null; }
  return o;
}
function chromeRows(root, base, rules) {
  return qsa(root, '.fl-builder-content > .fl-row').map((row) => ({ node: attr(row, 'data-node'), visibility: visOf(row), background: cssSummary(nodeCss(rules, attr(row, 'data-node'))), modules: qsa(row, '.fl-module').map((m) => moduleItems(m, base)) }));
}
const hHeader = qs(H.doc, 'header.ecp-header');
const hFooter = qs(H.doc, 'footer.ecp-footer');
const HEADER_ROWS = chromeRows(hHeader, HOME.url, HOME_RULES);
const FOOTER_ROWS = chromeRows(hFooter, HOME.url, HOME_RULES);
const navFooterVoice = () => FOOTER_ROWS.flatMap((r) => r.modules).find((m) => m.type === 'ecp-voice-search');
const headerTemplateId = (() => { const c = qs(hHeader, '.fl-builder-content'); return c ? attr(c, 'data-post-id') : null; })();
const footerTemplateId = (() => { const c = qs(hFooter, '.fl-builder-content'); return c ? attr(c, 'data-post-id') : null; })();
const allMenuTrees = qsa(hHeader, 'nav').map((nv) => ({ cls: cls(nv).join(' '), tree: menuTree(qs(nv, 'ul')) }));
const PRIMARY = allMenuTrees[0].tree;
const menuCopiesIdentical = allMenuTrees.filter((m) => treeSig(m.tree) === treeSig(PRIMARY)).length;
const gf = qs(H.doc, 'div.ecp-global-footer');
const GLOBAL_FOOTER = {
  poweredBy: (() => { const a = qs(gf, 'a.ecp-powered-by'); return a ? { text: ttext(a), href: attr(a, 'href'), img: qs(a, 'img') ? attr(qs(a, 'img'), 'src') : null } : null; })(),
  links: qsa(gf, '.ecp-global-footer__end li a').map((a) => ({ label: ttext(a), href: showHref(attr(a, 'href'), HOME.url), id: attr(a, 'id') || null })),
};
const skip = qs(H.doc, 'a.ecp-skip-to-content');
// Beaver Builder visibility breakpoints: rule `html .fl-visible-X:not(.fl-visible-Y){display:none}` inside a media query means Y is the class shown there
const BB_BREAKPOINTS = (() => {
  const m = new Map();
  const scan = (rules) => { for (const r of rules) for (const s of r.selectors) { const x = /^html \.fl-visible-[a-z]+:not\(\.fl-visible-([a-z]+)\)$/.exec(s); if (x && r.media && r.decls.some(([p, v]) => p === 'display' && /none/.test(v)) && !m.has(x[1])) m.set(x[1], r.media); } };
  scan(HOME_RULES);
  return m;
})();
const bpText = ['desktop', 'large', 'medium', 'mobile'].map((k) => k + ' ' + (BB_BREAKPOINTS.get(k) || '?')).join(' · ');
const hamburgerSvgTitles = uniq(qsa(hHeader, 'svg title').map((t) => clean(text(t, { raw: true }))));
const voiceForm = qs(hFooter, 'form#voice_search');
const voiceSvg = voiceForm ? qsa(voiceForm, 'svg').length : 0;
const menuTargets = new Set(); (function addT(t) { for (const x of t) { const k = normUrl(x.rawHref, ORIGIN); if (k) menuTargets.add(k); addT(x.children); } })(PRIMARY);
const footerTargets = new Set(qsa(hFooter, 'a[href]').map((a) => normUrl(attr(a, 'href'), ORIGIN)).concat(qsa(gf, 'a[href]').map((a) => normUrl(attr(a, 'href'), ORIGIN))).filter(Boolean));
const rootPagesNotInMenu = PAGE_RECS.filter((r) => r.postType === 'page' && seg(r).length === 1 && !menuTargets.has(r.key));
const cherryCfg = (() => {
  const s = qsa(H.doc, 'script').map((x) => text(x, { raw: true })).find((t) => /withcherry/.test(t)) || '';
  const g = (re) => { const m = re.exec(s); return m ? m[1] : null; };
  return s ? { loader: g(/"(https:\/\/files\.withcherry\.com\/[^"]+)"/), slug: g(/slug:\s*'([^']+)'/), name: g(/name:\s*"([^"]+)"/), defaultPurchaseAmount: g(/defaultPurchaseAmount:\s*(\d+)/), imageCategory: g(/imageCategory:\s*'([^']+)'/), primaryColor: g(/primaryColor:\s*'([^']+)'/), fontFamily: g(/fontFamily:\s*'([^']+)'/), position: g(/position:\s*'([^']+)'/), zIndex: g(/zIndex:\s*(\d+)/), ctaColor: g(/ctaColor:\s*'([^']+)'/) } : null;
})();
const footerAddress = (() => { const el = qs(hFooter, '.ecp-footer-address'); return el ? { text: ttext(el), links: qsa(el, 'a').map((a) => ({ label: ttext(a), href: attr(a, 'href') })) } : null; })();

/* =====================================================================================================================
 * 9. Interior frame + sidebar widget anatomy (standard sidebar variant)
 * =================================================================================================================== */
const SIDEBAR_PAGES = PAGE_RECS.filter((r) => r.hasSidebar);
const sidebarVariants = sortDesc(countBy(SIDEBAR_PAGES, (r) => r.sidebarSig));
const D = DOCS.get('disclaimer.html');
const sb = qs(D.doc, 'div.ecp-secondary');
const SIDEBAR = {
  role: attr(sb, 'role') || null,
  widgets: kidsEl(sb).map((w) => {
    const o = { class: cls(w).filter((c) => c !== 'ecp-widget').join(' ') };
    const f = qs(w, 'form'); if (f) o.search = { action: attr(f, 'action'), role: attr(f, 'role') || null, method: attr(f, 'method') || 'get', label: ttext(qs(f, 'label')), inputType: attr(qs(f, 'input'), 'type'), inputName: attr(qs(f, 'input'), 'name'), button: ttext(qs(f, 'button')) };
    const badges = qsa(w, 'a.ecp-badge'); if (badges.length) o.badges = badges.map((a) => ({ label: ttext(a), href: showHref(attr(a, 'href'), ORIGIN), target: attr(a, 'target') || null }));
    const icons = qsa(w, '.ecp-iconset a'); if (icons.length) o.social = icons.map((a) => ({ network: (cls(a).find((c) => /^ecp-network-/.test(c)) || '').replace('ecp-network-', ''), href: attr(a, 'href') }));
    const loc = qs(w, '.ecp-posts-wrapper-location'); if (loc) {
      o.location = { title: ttext(qs(loc, '.ecp-post-title')), titleTag: qs(loc, '.ecp-post-title h2') ? 'h2' : null, titleHref: showHref(attr(qs(loc, '.ecp-post-title a'), 'href'), ORIGIN), address: ttext(qs(loc, '.ecp-post-address')), contacts: qsa(loc, '.ecp-post-contactdetails li').map((li) => ({ label: ttext(qs(li, '.ecp-post-label')), value: ttext(qs(li, '.ecp-post-data')) })), hours: qsa(loc, '.ecp-post-hours-item').map((li) => ({ day: ttext(qs(li, '.ecp-post-label')).replace(/:$/, ''), value: ttext(qs(li, '.ecp-post-data')) })), map: qsa(loc, 'iframe').length };
    }
    return o;
  }),
};
const mainCtaButtons = (() => {
  const m = new Map();
  for (const r of PAGE_RECS) for (const b of r.mainButtons) { const k = b.label + ' \u2192 ' + (b.href ? shortHref(b.href) : '(span, no link)'); if (!m.has(k)) m.set(k, new Set()); m.get(k).add(r.path); }
  return [...m].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]));
})();

/* =====================================================================================================================
 * 10. Forms
 * =================================================================================================================== */
function gformDetail(file) {
  const { doc } = DOCS.get(file);
  return qsa(doc, '.gform_wrapper').map((w) => {
    const form = qs(w, 'form');
    const fields = qsa(w, 'li.gfield').map((li) => {
      const lab = qs(li, '.gfield_label');
      const typeCls = (cls(li).find((c) => /^gfield--type-/.test(c) && c !== 'gfield--type-choice') || '').replace('gfield--type-', '');
      const inputs = qsa(li, 'input, select, textarea').filter((x) => attr(x, 'type') !== 'hidden');
      return {
        id: attr(li, 'id'), type: typeCls,
        label: lab ? ttext(lab).replace(/\*$/, '').trim() : null,
        required: cls(li).includes('gfield_contains_required'),
        honeypot: cls(li).includes('gform_validation_container'),
        description: qs(li, '.gfield_description') ? ttext(qs(li, '.gfield_description')) : null,
        inputs: inputs.map((x) => ({ tag: x.name, type: attr(x, 'type') || (x.name === 'select' ? 'select' : x.name === 'textarea' ? 'textarea' : 'text'), name: attr(x, 'name') || null, placeholder: attr(x, 'placeholder') || null, ariaRequired: attr(x, 'aria-required') || null })),
        sublabels: qsa(li, '.ginput_complex label, .gchoice label').map((l) => ttext(l)),
        options: qsa(li, 'option').map((o) => ttext(o)),
        html: typeCls === 'html' ? ttext(li) : null,
        captcha: typeCls === 'captcha' ? { provider: qs(li, '.ginput_recaptcha') ? 'Google reCAPTCHA' : '?', size: attr(qs(li, '.ginput_recaptcha'), 'data-size') || null, badge: attr(qs(li, '.ginput_recaptcha'), 'data-badge') || null } : null,
      };
    });
    return {
      provider: 'Gravity Forms', formId: attr(form, 'id'), wrapperId: attr(w, 'id'), legacyMarkup: cls(w).includes('gform_legacy_markup_wrapper'), theme: attr(w, 'data-form-theme') || null, wrapperStyle: attr(w, 'style') || null,
      method: (attr(form, 'method') || 'get').toUpperCase(), enctype: attr(form, 'enctype') || null, action: attr(form, 'action'), novalidate: attr(form, 'novalidate') !== undefined,
      fields, submit: (() => { const s = qs(w, 'input[type=submit], button[type=submit]'); return s ? (attr(s, 'value') || ttext(s)) : null; })(),
      hiddenInputs: qsa(w, 'input[type=hidden]').length, requiredMarkers: qsa(w, '.gfield_required').length, ariaRequiredTrue: qsa(w, '[aria-required=true]').length,
      akismet: qsa(w, '[name=ak_hp_textarea]').length > 0,
    };
  });
}
const GFORMS = [];
for (const r of PAGE_RECS) if (r.gforms.length) for (const g of gformDetail(r.savedAs)) GFORMS.push({ page: r.path, ...g });

/* =====================================================================================================================
 * 11. Links: aliases, internal targets, malformed hrefs, JSON-LD breadcrumb targets
 * =================================================================================================================== */
const ALIASES = [];
for (const p of PAGES) for (const a of p.inv.aliases || []) {
  const refs = [];
  for (const r of PAGE_RECS) for (const l of r.links) if (l.abs === a) refs.push({ page: r.path, label: l.label, href: l.href, region: l.region });
  ALIASES.push({ from: livePath(a), fromRaw: a, to: p.path, toTitle: (REC_BY_PATH.get(p.path) || {}).h1 ? REC_BY_PATH.get(p.path).h1[0] : '', referrers: refs });
}
const PAGE_KEYS = new Set(PAGES.map((p) => p.key));
const internalTargets = new Map(); // abs -> Set(page)
for (const r of PAGE_RECS) for (const l of r.links) if (l.abs && isInternal(l.abs)) { if (!internalTargets.has(l.abs)) internalTargets.set(l.abs, new Set()); internalTargets.get(l.abs).add(r.path); }
const UNCRAWLED_TARGETS = [...internalTargets].filter(([abs]) => !PAGE_KEYS.has(abs) && !ALIAS_TO.has(abs)).map(([abs, s]) => ({ target: showHref(abs, ORIGIN), pages: [...s] }));
const lgNodes = new Set(linkGraph.nodes.map((n) => n.url));
const LG_DANGLING = linkGraph.edges.filter((e) => !lgNodes.has(e.to));
const malformed = { telSpace: new Map(), telEmpty: new Map(), leadingSpace: new Map(), hashOnly: new Map(), emptyHref: new Map() };
for (const r of PAGE_RECS) for (const l of r.links) {
  const h = l.href;
  const add = (m, k) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(r.path); };
  if (/^tel:\s+\S/i.test(h)) add(malformed.telSpace, '`' + h + '` (' + l.region + ' "' + l.label + '")');
  if (/^tel:\s*$/i.test(h)) add(malformed.telEmpty, '`' + h + '` (' + l.region + ' "' + l.label + '")');
  if (/^\s+\S/.test(h)) add(malformed.leadingSpace, '`' + JSON.stringify(h).slice(0, 70) + '` (' + l.region + ' "' + l.label + '")');
  if (h === '#') add(malformed.hashOnly, l.region + ' "' + (l.label || '(no text)') + '"');
  if (!h.trim()) add(malformed.emptyHref, l.region + ' "' + l.label + '"');
}
const BL_SIGS = countBy(PAGE_RECS, (r) => r.breadcrumbListSig);
const BL_ITEMS = HOME.breadcrumbListItems.map((it) => { const k = normUrl(it.item); return { ...it, status: PAGE_KEYS.has(k) ? 'crawled page' : ALIAS_TO.has(k) ? 'alias \u2192 ' + ALIAS_TO.get(k).path : 'not crawled, status UNVERIFIED' }; });
const inbound = new Map();
for (const e of linkGraph.edges) { inbound.set(e.to, (inbound.get(e.to) || 0) + 1); }
const inboundFromOthers = new Map();
for (const e of linkGraph.edges) if (e.from !== e.to) inboundFromOthers.set(e.to, (inboundFromOthers.get(e.to) || 0) + 1);
const deeperNotInMenu = PAGE_RECS.filter((r) => seg(r).length > 1 && !menuTargets.has(r.key));
const LG_DANGLING_TO_ALIAS = LG_DANGLING.filter((e) => ALIAS_TO.has(e.to)).length;
// candidate real page for an alias: a crawled page (other than where the alias lands) whose last path segment equals the alias's
const candOf = (a) => { const last = a.from.split('/').filter(Boolean).pop(); return PAGE_RECS.filter((r) => r.path !== a.to && seg(r).pop() === last).map((r) => r.path); };

/* =====================================================================================================================
 * 12. Images
 * =================================================================================================================== */
const failSet = new Map((failures.items || []).map((f) => [f.target, f]));
const IMG = imgInv.images;
const pagePathOfUse = (u) => (u.startsWith('(css) ') ? '(css) ' + showHref(u.slice(6), ORIGIN) : (() => { try { return livePath(u); } catch { return u; } })());
const imgFailed = IMG.filter((i) => failSet.has(i.src));
const assetsOnDisk = exists('assets/source') ? fs.readdirSync(path.join(PROJ, 'assets/source')).filter((f) => !f.startsWith('.')).length : null;
// the home computed-style capture (tmp/capture/baseline) - evidence for the Appendix C caveat
const CAP_DIR = 'tmp/capture/baseline';
const capAll = exists(CAP_DIR) ? fs.readdirSync(path.join(PROJ, CAP_DIR)) : [];
const capFiles = capAll.filter((x) => /^C-Program-Files-Git\./.test(x));
const capErr = capFiles.filter((x) => { try { return /^chrome-error:/.test(J(CAP_DIR + '/' + x).url || ''); } catch { return false; } });
const capLogMangled = exists('tmp/capture-run.log') ? (rd('tmp/capture-run.log').match(/C:\/Program Files\/Git\//g) || []).length : 0;
const capIndex = capAll.filter((x) => /^index\./.test(x)).length;
const capIndexValid = capAll.filter((x) => /^index\.\d+\.json$/.test(x)).filter((x) => { try { return J(CAP_DIR + '/' + x).url === ORIGIN + '/'; } catch { return false; } }).length;
const capHomeLogLines = exists('tmp/capture-home.log') ? (rd('tmp/capture-home.log').match(/^capture /gm) || []).length : 0;
const hostOf = (u) => { try { return new URL(u).host; } catch { return '(unparsable)'; } };

/* =====================================================================================================================
 * 14. Aggregates used by several sections
 * =================================================================================================================== */
const N = PAGE_RECS.length;
const cnt = (f) => PAGE_RECS.filter(f).length;
const pathsOf = (f) => PAGE_RECS.filter(f).map((r) => r.path);
const depthHist = sortDesc(countBy(PAGE_RECS, (r) => seg(r).length)).sort((a, b) => a[0] - b[0]);
const effNoindex = (r) => r.robots.some((x) => /noindex/i.test(x));
const titleGroups = new Map(); for (const r of PAGE_RECS) { const t = (r.title || '').toLowerCase(); if (!t) continue; if (!titleGroups.has(t)) titleGroups.set(t, { shown: r.title, pages: [] }); titleGroups.get(t).pages.push(r.path); }
const DUP_TITLES = [...titleGroups.values()].filter((g) => g.pages.length > 1).map((g) => [g.shown, g.pages]);
const descGroups = new Map(); for (const r of PAGE_RECS) { const t = (r.descriptions[0] || '').toLowerCase(); if (!t) continue; if (!descGroups.has(t)) descGroups.set(t, []); descGroups.get(t).push(r.path); }
const DUP_DESCS = [...descGroups].filter(([, v]) => v.length > 1);
const selfCanon = (r) => r.canonicals.length && livePath(r.canonicals[0]) === r.path && new URL(r.canonicals[0]).host === HOST;
const pluginPages = sortDesc(countBy(PAGE_RECS.flatMap((r) => r.plugins.map((p) => p)), (x) => x));
const themePages = sortDesc(countBy(PAGE_RECS.flatMap((r) => r.themes), (x) => x));
const accentVals = sortDesc(countBy(PAGE_RECS, (r) => r.accent || '(none)'));
const subdomainVals = sortDesc(countBy(PAGE_RECS, (r) => r.subdomain || '(none)'));
const chromeVariants = sortDesc(countBy(PAGE_RECS.filter((r) => r.chromeSig), (r) => r.chromeSig));
const styleIdPlugins = sortDesc(countBy(PAGE_RECS.flatMap((r) => uniq(r.styleIds.filter((id) => /-(inline-)?css$/.test(id)).map((id) => id.replace(/-(inline-)?css$/, '')))), (x) => x));
const robotsCombos = sortDesc(countBy(PAGE_RECS, (r) => r.robots.join(' + ')));
const jsonLdTypes = sortDesc(countBy(PAGE_RECS.flatMap((r) => uniq(r.jsonLd)), (x) => x));
const fontFamiliesRequested = (() => { const href = (HOME.googleFonts[0] || ''); try { return new URL(href).searchParams.getAll('family').map((f) => f.split(':')[0].replace(/\+/g, ' ')); } catch { return []; } })();
const fontFilesByFamily = sortDesc(countBy(fontInv.saved || [], (s) => { const u = new URL(s.url); if (u.host === 'fonts.gstatic.com') return 'Google Fonts: ' + u.pathname.split('/')[2]; if (/EyeCarePro-Icons/.test(u.pathname)) return 'EyeCarePro-Icons (' + u.pathname.split('/').slice(0, 6).join('/') + '/)'; if (/foundicons|foundation-icons/.test(u.pathname)) return 'Foundation Icons 3.0.0 (cdnjs.cloudflare.com)'; if (/fontawesome/i.test(u.pathname)) return 'Font Awesome (' + u.pathname.split('/').slice(0, 7).join('/') + '/)'; return u.host + u.pathname; }));
const famCount = (id) => FAM_MEMBERS.get(id).length;

/* =====================================================================================================================
 * 15. Markdown
 * =================================================================================================================== */
const L = [];
const P = (...x) => L.push(...x);
const famLink = (id) => '`families.' + id + '.urls` in `audit/architecture-map.json`';

P('# Site architecture: ' + ORIGIN + '/', '');
P('Generated by `tools/write-architecture.mjs` from the harvest of ' + CRAWL_DATE + ' on disk only. No request went to the live site. Inputs: `audit/raw/*.html` (' + N + ' files), `audit/site-inventory.json`, `content-inventory.json`, `seo-inventory.json`, `architecture.json`, `link-graph.json`, `image-inventory.json`, `failures.json`, `font-inventory.json`, `media-inventory.json`, `stylesheets.json`, `source-cms.json`, `robots.txt` and the stylesheets in `audit/css/`. The script parses every raw page with its own HTML tree builder, so every count below comes from the markup. Re-run it with `node tools/write-architecture.mjs`; `--check` recomputes and fails on drift. The machine-readable companion is `audit/architecture-map.json` (families, every page with its sections, navigation, forms, embeds). The marker rules are in Appendix C. Anything the files cannot settle is marked **UNVERIFIED**.', '');
P('Selectors are written as they appear in the source. Paths are shown in the live form (trailing slash): the live server 301-redirects every slashless URL to it (' + cnt((r) => (PAGE_BY_KEY.get(r.key).inv.redirectChain || []).some((h) => h.status === 301 && h.to === h.from + '/')) + ' of ' + N + ' pages carry that one-hop redirect in `site-inventory.json`).', '');

/* ---- 1 ---- */
P('## 1. At a glance', '');
const disc = site.discovery || {};
const famBodyCounts = sortDesc(countBy(PAGE_RECS, (r) => r.postType));
const seedPages = PAGES.filter((p) => p.inv.discoveredFrom === 'seed').length;
const maxDistinct = N + ALIAS_TO.size;
P(table(['', ''], [
  ['HTML pages crawled', '**' + site.counts.html + '** (' + site.counts.fetchedThisRun + ' fetched this run, ' + site.counts.failed + ' failed, ' + site.counts.nonHtml + ' non-HTML, ' + site.counts.blockedByRobots + ' blocked by robots.txt, truncated: ' + site.truncated + ', queue left: ' + site.queueRemaining + ')'],
  ['How pages were found', seedPages + ' of ' + N + ' pages entered the crawl as seeds (`discoveredFrom: "seed"`, depth 0). The breadth-first link crawl found **' + (N - seedPages) + '** further pages' + (UNCRAWLED_TARGETS.length ? '' : '. Every internal `<a href>` in the raw pages resolves to a crawled page or to one of the ' + ALIAS_TO.size + ' aliases')],
  ['Sitemaps', disc.sitemapsFetched.length + ' sitemap URLs requested (robots.txt names ' + code(disc.robots.sitemaps.join(', ')) + '; the crawler also guesses `/sitemap_index.xml`, `/wp-sitemap.xml`, `/sitemap-index.xml`) and **' + disc.sitemapUrlCount + '** same-site `<loc>` entries counted. See "220 vs 148" below'],
  ['Redirect aliases', ALIAS_TO.size + ' requested URLs that redirect onto ' + new Set([...ALIAS_TO.values()].map((p) => p.path)).size + ' crawled pages (section 10). ' + [...ALIAS_TO.values()].filter((p) => p.path === '/riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/').length + ' of them land on one unrelated blog post'],
  ['robots.txt', 'Disallow ' + disc.robots.disallow.map(code).join(' ') + '; Allow: ' + (disc.robots.allow.length ? disc.robots.allow.map(code).join(' ') : 'none') + '; `Sitemap:` ' + code(disc.robots.sitemaps.join(' '))],
  ['Platform', 'WordPress multisite (uploads under `/wp-content/uploads/sites/' + SITE_ID + '/`; `wp-emoji` on ' + cnt((r) => r.wpEmoji) + ' pages; WordPress core sitemaps `wp-sitemap-*.xml`; a Mercator multisite single-sign-on `<script src="https://ecpbuilder.com/wp-admin/admin-ajax.php?action=mercator-sso-js&\u2026">` commented out on ' + cnt((r) => r.ecpbuilder.mercatorCommented) + ' pages; `<meta name="admin_url">` pointing at the builder host on ' + cnt((r) => r.ecpbuilder.adminUrlMeta) + '). EyeCarePro theme **' + (uniq(PAGE_RECS.map((r) => r.themeName).filter(Boolean)).join(', ') || '?') + '** (`Theme Name:` in the inlined theme header on ' + cnt((r) => r.themeName) + ' pages, `Template:` ' + (uniq(PAGE_RECS.map((r) => r.themeTemplate).filter(Boolean)).map(code).join(', ') || '?') + ', i.e. a child theme of that folder; body class `ecp-theme-flex` on ' + cnt((r) => r.bodyClasses.includes('ecp-theme-flex')) + '/' + N + '); theme folders in the markup: ' + themePages.map(([t, n]) => code('/wp-content/themes/' + t + '/') + ' ' + n).join(', ') + '. Beaver Builder 2.8.6 (`fl-builder-2-8-6` on ' + cnt((r) => r.bodyClasses.includes('fl-builder-2-8-6')) + ' body tags; a builder layout inside main on ' + cnt((r) => r.builderInMain) + ' pages, plus ' + cnt((r) => r.builderBodyLevel) + ' template pages). Builder host `data-subdomain="' + ((subdomainVals.find(([v]) => v !== '(none)') || [''])[0]) + '"` on ' + cnt((r) => r.subdomain) + ' pages. Server header ' + code((PAGES[0].inv.headers || {}).server || '?')],
  ['Plugins seen in the markup', pluginPages.map(([p, n]) => code(p) + ' ' + n).join(', ') + ' (pages whose HTML references `/wp-content/plugins/<name>/`). Style ids that name a plugin or module: ' + styleIdPlugins.filter(([k]) => !/^(global-styles|wp-emoji-styles|wp-img-auto-sizes-contain|classic-theme-styles|public_css|style|fl-builder-layout-\d+)$/.test(k)).map(([k, n]) => code(k) + ' ' + n).join(', ')],
  ['CMS detector false positives', '`source-cms.json` also lists WooCommerce (' + ((cms.detected.find((d) => d.id === 'woocommerce') || {}).pages || 0) + ' pages) and Duda (' + ((cms.detected.find((d) => d.id === 'duda') || {}).pages || 0) + '). Neither runs here. "woocommerce" occurs only inside a Beaver Builder CSS selector (`.single:not(.woocommerce).single-fl-builder-template`), and the Duda pattern `/d-page/i` matches EyeCarePro\'s inlining comments `<!-- GENERATED-PAGE-CSS -->` / `-JS` / `-JQUERY` (present on ' + cnt((r) => r.generatedPage) + ' pages). Do not carry either id into decontamination as a real platform'],
  ['Brand accent the theme declares', accentVals.filter(([v]) => v !== '(none)').map(([v, n]) => code('data-theme-accent-color="' + v + '"') + ' on ' + n + ' `<body>` tags').join(', ') + (cnt((r) => !r.accent) ? '; absent on ' + cnt((r) => !r.accent) + ' (' + sortDesc(countBy(PAGE_RECS.filter((r) => !r.accent), (r) => r.family)).map(([k, n]) => k + ' ' + n).join(', ') + ')' : '') + '. The header top bar background is ' + code(nodeCss(HOME_RULES, HEADER_ROWS[0].node).base['background-color'] || '?') + ' and the Cherry widget is configured with `primaryColor: \'' + cherryCfg.primaryColor + '\'` (section 4)'],
  ['Fonts', 'Inline `body{font-family:Verdana;}` on ' + cnt((r) => r.verdana) + ' pages. One Google Fonts css2 request for ' + fontFamiliesRequested.length + ' families on ' + cnt((r) => r.googleFonts.length) + ' pages (section 8). Icon fonts: EyeCarePro-Icons, Foundation Icons, Font Awesome (section 8). ' + (fontInv.saved || []).length + ' webfont files harvested'],
  ['Chrome', 'Header, primary menu, footer and global footer are identical on **' + (chromeVariants[0] || [0, 0])[1] + '** pages (' + chromeVariants.length + ' variant; checked by script on labels + hrefs). The ' + famCount('template') + ' `/template/*` pages have no chrome of their own, because they *are* the chrome. Sidebar: ' + SIDEBAR_PAGES.length + ' pages, ' + sidebarVariants.length + ' variants (section 6)'],
  ['URL depth (path segments)', depthHist.map(([d, n]) => d + ':' + n).join(' \u00b7 ')],
  ['Post types (body classes)', famBodyCounts.map(([k, n]) => k + ' ' + n).join(' \u00b7 ') + ' (`home` is a page)'],
]), '');
P('### 220 sitemap entries vs 148 pages', '');
P('The crawl log\'s "from sitemap 220" counts `<loc>` **entries**, not distinct URLs. The crawler (`sr-crawl.mjs`) adds one to `sitemapUrlCount` for every same-site `<loc>` in every non-index sitemap file it reads, with no de-duplication, while it seeds the queue from a `Set`. What `site-inventory.json` fixes:', '');
const coreFiles = disc.sitemapsFetched.filter((u) => /wp-sitemap-/.test(u));
const coreTypes = coreFiles.map((u) => { const m = /wp-sitemap-(posts|taxonomies)-([a-z_]+)-\d+\.xml$/.exec(u) || /wp-sitemap-(users)-\d+\.xml$/.exec(u); return m ? (m[1] === 'users' ? 'users' : m[2]) : '?'; });
const wpObj = (r) => ({ home: 'page', page: 'page', post: 'post', team: 'team', location: 'location', testimonial: 'testimonial', template: 'template', 'archive:category': 'category', 'archive:tag': 'post_tag', 'archive:author': 'users' })[r.postType] || '?';
const objCounts = sortDesc(countBy(PAGE_RECS, wpObj));
const typesMatch = coreTypes.length === objCounts.length && coreTypes.every((t) => objCounts.some(([k]) => k === t));
P('- ' + disc.sitemapsFetched.length + ' sitemap URLs were requested: the 4 index guesses plus ' + coreFiles.length + ' WordPress core files (' + coreFiles.map((u) => code(u.replace(ORIGIN + '/', ''))).join(', ') + '). The crawled pages fall into ' + objCounts.length + ' WordPress object types (body class mapped to the sitemap\'s type name: ' + objCounts.map(([k, n]) => k + ' ' + n).join(', ') + '). ' + (typesMatch ? 'That is one core sitemap file per object type, with none left over on either side.' : 'These do NOT match the core files one to one (files: ' + coreTypes.join(', ') + ').'));
P('- All ' + N + ' pages were seeds at depth 0 and none came from link-following. With 0 failed, 0 non-HTML, 0 robots-blocked, no truncation and an empty queue, every distinct seed URL ended as a crawled page or an alias. ' + cnt((r) => r.firstHopFromSelf) + ' of the ' + cnt((r) => r.path !== '/') + ' non-home pages were requested at their own URL (the first hop of their `redirectChain` starts there), so each was in a sitemap. The home is also the start URL.');
P('- So the sitemaps held **at least 147 and at most ' + maxDistinct + '** distinct URLs (' + N + ' pages + ' + ALIAS_TO.size + ' aliases). That means **' + (disc.sitemapUrlCount - maxDistinct) + ' to ' + (disc.sitemapUrlCount - 147) + '** of the ' + disc.sitemapUrlCount + ' entries repeat a URL already counted. ' + ALIASES.filter((a) => a.referrers.length).length + ' of the ' + ALIAS_TO.size + ' aliases are linked from at least one crawled page (section 10), so link-following can explain ' + (ALIASES.every((a) => a.referrers.length) ? 'all of them' : 'those') + '. The inventory does not record which queue entry produced an alias.');
P('- **UNVERIFIED:** which file supplied the repeats. The sitemap bodies were not saved. If the 9 core files list exactly the ' + N + ' objects, the other ' + (disc.sitemapUrlCount - N) + ' entries came from an index-level URL (for example `/sitemap.xml`) that serves a plain `<urlset>` overlapping them. That arithmetic fits, but nothing on disk proves it.', '');

/* ---- 2 ---- */
P('## 2. Page counts by URL section', '');
const top = new Map();
for (const r of PAGE_RECS) { const s = seg(r); const k = s.length === 0 ? '/' : s.length === 1 ? (r.postType === 'post' ? '/<post-slug>/ (root-level blog posts)' : '/<page>/ (root-level, not posts)') : '/' + s[0] + '/*'; if (!top.has(k)) top.set(k, []); top.get(k).push(r); }
const sectRows = [...top].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([k, rs]) => {
  let note = '';
  if (k.startsWith('/<post-slug>')) note = 'body.single-post; breadcrumb ' + uniq(rs.map((r) => r.breadcrumbTrail.join(' \u00bb '))).join(' / ');
  else if (k.startsWith('/<page>')) note = rs.map((r) => code(r.path)).join(' ');
  else if (k === '/') note = 'Beaver Builder home';
  else {
    const sub = countBy(rs, (r) => seg(r)[1]);
    const hubOwn = REC_BY_PATH.get('/' + seg(rs[0])[0] + '/') ? ' (+ the hub ' + code('/' + seg(rs[0])[0] + '/') + ' counted under root-level pages)' : '';
    note = sortDesc(sub).map(([s2, n]) => s2 + ' ' + n).join(' \u00b7 ') + hubOwn;
  }
  return [k, rs.length, note];
});
P(table(['Section', 'Pages', 'Breakdown (second path segment) or members'], sectRows.concat([['**Total**', '**' + N + '**', '']])), '');
P('Root-level pages that are hubs of a section: ' + PAGE_RECS.filter((r) => seg(r).length === 1 && r.postType === 'page' && PAGE_RECS.some((x) => seg(x)[0] === seg(r)[0] && seg(x).length > 1)).map((r) => code(r.path) + ' (' + PAGE_RECS.filter((x) => seg(x)[0] === seg(r)[0] && seg(x).length > 1).length + ' below)').join(', ') + '.', '');

/* ---- 3 ---- */
P('## 3. Template families', '');
P('These ' + FAMILY_IDS.length + ' families partition the site. Rules are tried in the order listed and the first match wins. The partition check in the script found ' + N + ' crawled, ' + N + ' placed, ' + PARTITION_ERRORS.length + ' missing, 0 duplicated, 0 unassigned. A mutated copy (one page dropped, one doubled, one with an unknown post type) is caught on every run (missing: ' + PARTITION_CONTROL.missing + ', duplicated: ' + PARTITION_CONTROL.duplicated + ', unassigned: ' + PARTITION_CONTROL.unassigned + '), so the check can fire. ' + (RULE_OVERLAPS.length ? RULE_OVERLAPS.length + ' pages match more than one rule, and order decides for them (' + sortDesc(countBy(RULE_OVERLAPS, (x) => x.ids.join(' > '))).map(([k, n]) => k + ' ' + n).join(', ') + ').' : 'No page matches two rules.'), '');
P(table(['Family', 'Pages', 'Rule', 'Members'], FAMILY_IDS.map((id) => { const ms = FAM_MEMBERS.get(id); return [id, ms.length, FAMILY_RULES.find((f) => f.id === id).rule, ms.length <= 12 ? ms.map((r) => code(r.path)).join(' ') : ms.slice(0, 4).map((r) => code(r.path)).join(' ') + ' \u2026 all ' + ms.length + ' in ' + famLink(id)]; })), '');
// verify-arch fix: the "body classes on all N" lists drop NOISE_BODY classes; say so, and name the ones that are in fact on
// every member of a family, so the list is not read as exhaustive.
const NOISE_NAMED = ['page-child', 'page-parent', 'single-format-standard', 'has-post-thumbnail'];
const noiseOnAll = FAMILY_IDS.map((id) => { const ms = FAM_MEMBERS.get(id); const all = ms.reduce((acc, r) => acc.filter((c) => r.bodyClasses.includes(c)), ms[0] ? ms[0].bodyClasses.slice() : []); return [id, ms.length > 1 ? all.filter((c) => NOISE_NAMED.includes(c)) : []]; }).filter(([, v]) => v.length);
P('Distinguishing markers per family (computed from the members). The body-class lists leave out per-object ids and slugs (`page-id-*`, `postid-*`, `parent-pageid-*`, `level*`, `ecp-page-slug-*`, `category-*`, `tag-*`, `author-*`) and `page-child`, `page-parent`, `single-format-standard`, `has-post-thumbnail`' + (noiseOnAll.length ? '; of those, ' + noiseOnAll.map(([id, v]) => v.map((c) => '`' + c + '`').join(', ') + ' is on all ' + FAM_MEMBERS.get(id).length + ' ' + id + ' pages').join(', and ') : '') + ':', '');
for (const id of FAMILY_IDS) { const ms = FAM_MEMBERS.get(id); P('- **' + id + '** (' + ms.length + '): ' + familyMarkers(ms).join('; ') + '.'); }
P('');
const interiorBuilder = FAM_MEMBERS.get('interior').filter((r) => r.builderInMain);
P('Inside **interior**, ' + interiorBuilder.length + ' pages carry a Beaver Builder layout inside the sidebar frame (' + interiorBuilder.map((r) => code(r.path)).join(' ') + '). The other ' + (famCount('interior') - interiorBuilder.length) + ' are classic WordPress content. Both sit in the same frame, so they share one family. `architecture-map.json` keeps `builder` per page.', '');

/* ---- 4 ---- */
P('## 4. Navigation (from the raw header and footer of `audit/raw/index.html`)', '');
P('The header is Beaver Builder global template **' + headerTemplateId + '** (`div.fl-builder-content-' + headerTemplateId + '` inside `header.ecp-header`, wrapper `div.ecp-header-wrapper.ecp-header-mode-inline-sticky.ecp-header-sticky-disabled.ecp-header-sticky-mobile-enabled`). The footer is template **' + footerTemplateId + '** inside `footer.ecp-footer`. Both are identical on ' + (chromeVariants[0] || [0, 0])[1] + ' pages.', '');
P('### 4.1 Top bar (row `' + HEADER_ROWS[0].node + '`, shown at: ' + HEADER_ROWS[0].visibility + '; background: ' + (HEADER_ROWS[0].background.join(', ') || 'not set by a node rule') + ')', '');
let tbn = 0;
for (const m of HEADER_ROWS[0].modules) {
  tbn++;
  if (m.type === 'ecp-richtext') P(tbn + '. Rich text (shown at: ' + m.visibility + '): "' + m.text + '". ' + (m.links.length === 1 && m.links[0].label === m.text ? 'The whole sentence is one link to ' + code(m.links[0].href) : 'Links: ' + m.links.map((l) => '"' + l.label + '" → ' + code(l.href)).join(', ')) + '. ' + (m.blockTags.length === 1 && m.blockTags[0] === 'p' ? 'It is a `<p>`, not a heading.' : 'Block tags: ' + m.blockTags.join(', ') + '.'));
  else if (m.type === 'ecp-button') P(tbn + '. **"' + m.label + '"** (shown at: ' + m.visibility + '), which is `' + m.element + '` with `href="' + m.rawHref + '"`' + (m.icon ? ' and an icon' : '') + (/^tel:\s/.test(m.rawHref || '') ? '. Note the space after `tel:`' : '') + '.');
  else P(tbn + '. ' + m.type + ' (shown at: ' + m.visibility + ')');
}
P('');
P('Beaver Builder visibility breakpoints declared in the layout CSS (`html .fl-visible-X:not(.fl-visible-Y){display:none}`): ' + bpText + '. In the top bar ' + HEADER_ROWS[0].modules.map((m) => (m.type === 'ecp-button' ? '"' + m.label + '"' : 'the address sentence') + ' shows at ' + m.visibility).join(', ') + '. So on phones (mobile) only the address sentence remains. There is no announcement bar.', '');
const deskRow = HEADER_ROWS[1];
const logoM = deskRow.modules.find((m) => m.type === 'ecp-logo');
const menuM = deskRow.modules.find((m) => m.type === 'ecp-menu');
P('### 4.2 Desktop header row (row `' + deskRow.node + '`, shown at: ' + deskRow.visibility + ')', '');
P('Logo ' + code(logoM.img) + ' (served from ' + logoM.imgHost + ', alt ' + (logoM.alt == null ? '**missing**' : '"' + logoM.alt + '"') + ') \u2192 ' + code(logoM.href) + ', then the primary menu `nav.' + menuM.navClass.replace(/\s+/g, '.') + '`, class `ecp-menu-convert-at-' + menuM.convertAt + '`.', '');
P('### 4.3 Primary menu (full tree)', '');
const menuRows = [];
PRIMARY.forEach((it, i) => { menuRows.push([String(i + 1), it.label, code(it.href), it.children.length ? plural(it.children.length, 'child', 'children') : '']); it.children.forEach((c, j) => { menuRows.push([(i + 1) + '.' + (j + 1), '\u21b3 ' + c.label, code(c.href), c.children.length ? plural(c.children.length, 'child', 'children') : '']); c.children.forEach((g, k) => menuRows.push([(i + 1) + '.' + (j + 1) + '.' + (k + 1), '\u21b3\u21b3 ' + g.label, code(g.href), ''])); }); });
P(table(['#', 'Label', 'href (as printed)', 'Dropdown'], menuRows), '');
const dupParent = PRIMARY.filter((it) => it.children.some((c) => c.rawHref === it.rawHref));
P(PRIMARY.length + ' top-level items, ' + PRIMARY.reduce((s, x) => s + x.children.length, 0) + ' dropdown children, ' + PRIMARY.reduce((s, x) => s + x.children.reduce((t, c) => t + c.children.length, 0), 0) + ' third-level items. Hrefs are absolute (`' + ORIGIN + '/\u2026/`). ' + (dupParent.length ? dupParent.map((it) => '"' + it.label + '" and its first child "' + it.children.find((c) => c.rawHref === it.rawHref).label + '" point to the same URL') .join('; ') + '. ' : '') + 'The header prints the same tree **' + menuCopiesIdentical + ' times** (' + allMenuTrees.map((m) => '`nav.' + m.cls.replace(/\s+/g, '.') + '`').join(', ') + '); ' + (menuCopiesIdentical === allMenuTrees.length ? 'all ' + menuCopiesIdentical + ' copies are identical (checked by script).' : 'only ' + menuCopiesIdentical + ' of ' + allMenuTrees.length + ' copies are identical (checked by script).') + ' The menu links ' + menuTargets.size + ' distinct pages. Root-level WordPress pages it does **not** link (the ' + PAGE_RECS.filter((r) => r.postType === 'post' && seg(r).length === 1 && !menuTargets.has(r.key)).length + ' root-level blog posts are not in the menu either): ' + rootPagesNotInMenu.map((r) => code(r.path) + (footerTargets.has(r.key) ? ' (footer)' : '')).join(' ') + '. Of the ' + deeperNotInMenu.length + ' deeper pages the menu does not link, ' + deeperNotInMenu.filter((r) => (inboundFromOthers.get(r.key) || 0) > 0).length + ' are linked from other pages (hubs, child listings, breadcrumbs, in-copy links; `link-graph.json`) and ' + deeperNotInMenu.filter((r) => !(inboundFromOthers.get(r.key) || 0)).length + ' have no inbound link at all (' + sortDesc(countBy(deeperNotInMenu.filter((r) => !(inboundFromOthers.get(r.key) || 0)), (r) => r.family)).map(([k, n]) => k + ' ' + n).join(', ') + ').', '');
const mobRow = HEADER_ROWS[2];
const mobM = mobRow.modules.find((m) => m.type === 'ecp-mobile-header');
P('### 4.4 Mobile header (row `' + mobRow.node + '`, shown at: ' + mobRow.visibility + ')', '');
P('`div.fl-module-ecp-mobile-header` > `div.ecp-mobile-header`: logo ' + code(mobM.img) + ' (alt ' + (mobM.alt == null ? 'missing' : '"' + mobM.alt + '"') + ') \u2192 `/`. The ' + mobM.buttons.length + ' buttons' + (mobM.buttons.every((b) => !b.text) ? ' carry no text (icon + aria-label only)' : '') + ': ' + mobM.buttons.map((b) => '`a.' + b.class + '` (aria-label "' + b.ariaLabel + '") \u2192 ' + code(b.href)).join(' and ') + '. The menu module has class `ecp-menu-convert-at-' + mobM.convertAt + '` and its own hamburger copy (' + mobM.copies + ' `nav` elements). The menu tree is ' + (allMenuTrees.slice(2).every((m) => treeSig(m.tree) === treeSig(PRIMARY)) ? 'identical to 4.3' : '**different** from 4.3') + '. The trigger is `a.ecp-menu-hamburger-trigger-button` (aria-label "Toggle mobile menu", inline SVG titles in the header: ' + hamburgerSvgTitles.map((t) => '"' + t + '"').join(', ') + '), and the last link is a focus trap, "' + mobM.focusTrap + '" (`href="#"`). The desktop logo ' + code(logoM.img) + ' and the mobile logo ' + code(mobM.img) + ' are ' + (logoM.img === mobM.img ? 'the same file' : '**different files**') + '.', '');
P('### 4.5 Footer (`footer.ecp-footer`, template ' + footerTemplateId + ')', '');
const fRows = [];
for (const row of FOOTER_ROWS) for (const m of row.modules) {
  if (m.type === 'ecp-menu') fRows.push(['Menu `nav.' + (m.navClass || '').replace(/\s+/g, '.') + '` (row ' + row.node + ')', m.tree.map((t) => t.label + ' \u2192 ' + code(t.href)).join(' \u00b7 ') + ' (' + m.copies + ' copies: vertical + `ecp-menu-mobile-type-vertical`; class `ecp-menu-convert-at-' + m.convertAt + '`)']);
  else if (m.type === 'ecp-socialicons') fRows.push(['Social icons (' + uniq(m.icons.map((i) => i.shape + (i.background ? ', ecp-icon-background' : ''))).join('; ') + ')', m.icons.map((i) => i.network + ' "' + i.ariaLabel + '" \u2192 ' + code(i.href)).join(' \u00b7 ')]);
  else if (m.type === 'ecp-button') fRows.push(['Button', '"' + m.label + '" \u2192 ' + code(m.href)]);
  else if (m.type === 'ecp-voice-search') fRows.push(['Voice search', '`form#' + m.formId + '.ecp-voice-search` ' + m.method.toUpperCase() + ' `action="' + m.action + '"`; `<label>` "' + m.label + '" (not visible in `tmp/live/home-1440-s5.png`); input `name="' + m.inputName + '"`' + (m.placeholder ? ', placeholder "' + m.placeholder + '"' : ', no placeholder') + '; ' + voiceSvg + ' inline SVG (the microphone) inside the form; on ' + cnt((r) => r.voiceSearch) + ' pages']);
  else if (m.type === 'ecp-richtext' && footerAddress) fRows.push(['Address line (`div.ecp-footer-address`, row ' + row.node + ')', '"' + footerAddress.text + '"; links: ' + footerAddress.links.map((l) => code(l.href)).join(', ')]);
}
fRows.push(['Global footer (`div.ecp-global-footer`, outside the template)', '"' + GLOBAL_FOOTER.poweredBy.text + '" + logo ' + code(fileOf(GLOBAL_FOOTER.poweredBy.img)) + ' \u2192 ' + code(GLOBAL_FOOTER.poweredBy.href) + ' (vendor credit, REMOVE) \u00b7 ' + GLOBAL_FOOTER.links.map((l) => l.label + ' \u2192 ' + code(l.href) + (l.id ? ' (`#' + l.id + '`, REMOVE)' : '')).join(' \u00b7 ')]);
P(table(['Block', 'Items (label \u2192 href)'], fRows), '');
P('`/sitemap/` is a crawled page (family sitemap), so the footer "Sitemap" link resolves.', '');
P('### 4.6 Floating and hidden widgets', '');
P('- **Cherry payment widget**: `div#floatingEstimator` on ' + cnt((r) => r.floatingEstimator) + ' pages (empty in the raw HTML on ' + cnt((r) => r.feEmpty) + '), plus an inline loader for ' + code(cherryCfg.loader) + ' on ' + cnt((r) => r.cherry) + ' pages. Config: slug ' + code(cherryCfg.slug) + ', name "' + cherryCfg.name + '", `defaultPurchaseAmount: ' + cherryCfg.defaultPurchaseAmount + '`, `imageCategory: \'' + cherryCfg.imageCategory + '\'`, `primaryColor: \'' + cherryCfg.primaryColor + '\'`, font ' + cherryCfg.fontFamily + ', `floatingEstimator.position: \'' + cherryCfg.position + '\'`, z-index ' + cherryCfg.zIndex + '. Its visible pill ("Pay over time", with a line about no hard credit checks) is **not** in any raw file (0 pages). The widget script injects it. It shows bottom right in the live screenshots `tmp/live/home-1440.png` and `tmp/live/home-1440-s5.png` (with the credit-check line) and `tmp/live/home-390.png` (the pill alone, no second line); the slices `home-1440-s0` to `-s4` do not show it.');
P('- **Skip link**: `a.ecp-skip-to-content` "' + ttext(skip) + '" \u2192 `' + attr(skip, 'href') + '` (main is `main#content.ecp-primary`).');
P('- **GTM noscript iframe** on ' + cnt((r) => r.gtmNoscript) + ' pages, directly after `#floatingEstimator` on ' + cnt((r) => r.gtmAfterFe) + ' (section 8).');
P('- Chat, consent and accessibility-overlay vendors in the raw HTML: ' + Object.entries(WIDGET_PATTERNS).map(([k, re]) => k + ' ' + cnt((r) => r.widgetHits[k]) + ' pages (pattern ' + code(re.source) + ')').join('; ') + '.', '');

/* ---- 5 ---- */
P('## 5. Homepage section order (`audit/raw/index.html`, ' + HOME_ROWS.length + ' Beaver Builder rows in `main`)', '');
P('The rows are the direct children of `div.fl-builder-content.fl-builder-content-5845.fl-builder-content-primary` inside `main#content > article#post-5845 > div.ecp-entry-content`. The entry header (`header.ecp-entry-header`) is ' + (homeEntryHeaderEmpty ? 'empty' : 'present') + '. The page has ' + HOME.h1.length + ' `h1`: "' + HOME.h1.join('", "') + '". Several visual headings are `div.ecp-heading` or `div.ecp-heading-tag`, not h-tags. "Shown at" comes from the row\'s `fl-visible-*` classes (all = no class). Backgrounds are resolved from the node rules in the linked `5845-layout.css` and the inline style blocks.', '');
const homeTable = HOME_ROWS.map((rw) => [
  String(rw.index), code(rw.node), rw.visibility, rw.kind,
  rw.background.join('; ') || (rw.bgClass === 'none' ? 'none' : rw.bgClass),
  rw.headings.map((h) => '"' + words(h.text, 11) + '" (' + h.tag + ')').join('; ') || '(none)',
  rw.modules.length ? inOrder(rw.modules) : '(no modules)',
  rw.images.map((i) => code(i.file) + (i.alt == null ? ' (no alt attr)' : i.alt === '' ? ' (alt="")' : '')).join(', ') || '',
  rw.ctas.filter((c) => c.kind !== 'inline link').map((c) => c.kind + ' "' + trunc(c.label, 40) + '" \u2192 ' + code(shortHref(c.href)) + (c.target ? ' (' + c.target + ')' : '') + (c.leadingSpace ? ' (href starts with a space)' : '')).join('; ') + (rw.ctas.filter((c) => c.kind === 'inline link').length ? (rw.ctas.filter((c) => c.kind !== 'inline link').length ? '; ' : '') + 'inline: ' + rw.ctas.filter((c) => c.kind === 'inline link').map((c) => '"' + trunc(c.label, 30) + '" \u2192 ' + code(shortHref(c.href))).join(', ') : ''),
]);
P(table(['#', 'Row data-node', 'Shown at', 'Kind', 'Background', 'Headings (element)', 'Modules', 'Images', 'CTAs \u2192 targets'], homeTable), '');
if (ROW_DEFAULT_PAD && HOME_ROWS.some((rw) => rw.background.some((b) => /\bdefault\b/.test(b)))) P('"default" in the Background column means the row\'s node rule leaves that side unset, so the layout\'s own `.fl-row-content-wrap` rule applies: padding-bottom ' + ROW_DEFAULT_PAD.value + ' (' + code(ROW_DEFAULT_PAD.src === 'inline' ? 'inline <style>' : ROW_DEFAULT_PAD.src.replace(/^wp-content-uploads-sites-\d+-bb-plugin-cache-/, '').replace(/\.css-ver-.*$/, '.css')) + ').', '');
const heroImgRow = HOME_ROWS.find((x) => x.kind === 'hero' && !x.moduleTypes.length);
const heroTxtRow = HOME_ROWS.find((x) => x.kind === 'hero' && x.moduleTypes.length);
const carouselRow = HOME_ROWS.find((x) => x.carousel.length);
const galleryRow = HOME_ROWS.find((x) => x.galleryCaptions.length);
const postsRow = HOME_ROWS.find((x) => x.postTitles.length);
const emptyRows = HOME_ROWS.filter((x) => x.kind === 'empty');
P('Notes, all read from the same markup:', '');
if (heroImgRow && heroTxtRow) P('- **The hero is two rows.** Row ' + heroImgRow.index + ' (`' + heroImgRow.node + '`) holds only the photo background and ' + heroImgRow.cols + ' column(s), ' + heroImgRow.emptyCols + ' of them empty. Row ' + heroTxtRow.index + ' (`' + heroTxtRow.node + '`) carries the visible "' + heroTxtRow.headings.map((h) => h.text).join(' / ') + '" (' + heroTxtRow.headings.map((h) => h.tag).join(', ') + ', not an h1) and its button. A ' + code('margin-top:' + heroTxtRow.css.base['margin-top']) + ' rule pulls it up over the photo' + (Object.entries(heroTxtRow.css.media).filter(([, d]) => d['margin-top']).length ? ' (responsive overrides: ' + Object.entries(heroTxtRow.css.media).filter(([, d]) => d['margin-top']).map(([mq, d]) => code(mq) + ' ' + d['margin-top']).join(', ') + (Object.values(heroTxtRow.css.media).some((d) => d['margin-top'] && parseFloat(d['margin-top']) === 0) ? '; so on phones the overlap is switched off and the two rows simply stack' : '') + ')' : '') + '. The source already layers content over a background by overlap, which is a depth effect the redesign can keep and push further.');
const imgOnly = HOME_ROWS.filter((x) => x.moduleTypes.length === 1 && x.moduleTypes[0] === 'ecp-image');
if (imgOnly.length) P('- **Promo text baked into images.** ' + imgOnly.map((x) => 'Row ' + x.index + ' is a single `ecp-image` (' + x.images.map((i) => code(i.file)).join(', ') + ')' + (x.ctas.length ? ' linked to ' + x.ctas.map((c) => code(c.href)).join(', ') : '')).join('; ') + '. Compare the live screenshot `tmp/live/home-1440-s0.png` (the "Say Goodbye to Dry Eyes with Envision by InMode!" card): that headline, its sub-line and the "Learn More" button are pixels inside the image. None of it is HTML text.');
if (carouselRow) P('- **Carousel**: row ' + carouselRow.index + ' `fl-module-ReviewsModule` is a Splide carousel of ' + carouselRow.reviewCount + ' testimonial slides (full stars per slide: ' + carouselRow.reviewStars.join(', ') + '; reviewer names ' + carouselRow.reviewNames.map((x) => '"' + x + '"').join(', ') + '; relative times per slide ' + carouselRow.reviewTimes.map((x) => '"' + x + '"').join(', ') + '). `data-splide=\'' + carouselRow.carousel[0].raw + '\'`' + (carouselRow.carousel[0].parsed ? ': autoplay ' + carouselRow.carousel[0].parsed.autoplay + ', perPage ' + carouselRow.carousel[0].parsed.perPage + ', pagination ' + carouselRow.carousel[0].parsed.pagination + ', arrows ' + carouselRow.carousel[0].parsed.arrows + ', type ' + carouselRow.carousel[0].parsed.type + (carouselRow.carousel[0].parsed.autoplay === false ? '. It **does not autoplay**' : '') : '') + '. Splide markup is on ' + plural(cnt((r) => r.splide), 'page') + ' (' + pathsOf((r) => r.splide).map(code).join(' ') + ').');
if (galleryRow) P('- **Designer frames**: row ' + galleryRow.index + ' `ecp-gallery` of ' + galleryRow.images.length + ' photos with captions ' + galleryRow.galleryCaptions.map((c) => '"' + c + '"').join(', ') + '. One of its files (' + galleryRow.images.filter((i) => imgFailed.some((f) => fileOf(f.src) === i.file)).map((i) => code(i.file)).join(', ') + ') failed to download: ' + uniq(imgFailed.filter((f) => galleryRow.images.some((i) => i.file === fileOf(f.src))).map((f) => failSet.get(f.src).reason)).join(', ') + ' (section 12).');
if (postsRow) P('- **Latest posts**: row ' + postsRow.index + ' `ecp-list-posts` (grid, 4 columns) shows ' + postsRow.postTitles.length + ' posts with the date printed in `div.ecp-post-date`: ' + postsRow.postTitles.map((t, i) => '"' + trunc(t, 50) + '" (' + (postsRow.postDates[i] || 'no date text') + ')').join('; ') + '. ' + (HOME.leaks.some((l) => l.kind === 'shortcode') ? 'An excerpt prints the raw shortcode ' + uniq(HOME.leaks.filter((l) => l.kind === 'shortcode').map((l) => code(l.value))).join(', ') + ' (section 11).' : ''));
if (emptyRows.length) P('- **Empty rows**: ' + emptyRows.map((x) => 'row ' + x.index + ' `' + x.node + '`').join(', ') + ' contain no modules. Do not port them.');
const svcRow = HOME_ROWS.find((x) => x.headings.some((h) => h.text === 'Our Eye Care Services'));
const cardOf = (t) => (svcRow ? svcRow.cards.find((c) => c.title === t) : null);
const mismatch = [['Dry Eye Treatment', /glaucoma/i, 'diagnosing and managing glaucoma, macular degeneration, cataracts and diabetic retinopathy'], ['Patient Forms', /contact lenses/i, 'the selection of contact lenses']].filter(([t, re]) => cardOf(t) && re.test(cardOf(t).text));
if (mismatch.length) P('- **Copy that does not match its card** (row ' + svcRow.index + ', `.ecp-callout-content`): ' + mismatch.map(([t, , d]) => 'the "' + t + '" card text is about ' + d).join('; ') + ' (checked by script against the card text). The redesign must not carry the mismatch over silently. Record it as a copy decision.');
P('- **Visibility**: ' + (HOME_ROWS.every((x) => x.visibility === 'all') ? 'every home row is shown at every width (no row carries `fl-visible-*`)' : HOME_ROWS.filter((x) => x.visibility !== 'all').map((x) => 'row ' + x.index + ' ' + x.visibility).join(', ')) + '. ' + HOME_ROWS.reduce((s, x) => s + x.modules.filter((m) => /\[/.test(m)).length, 0) + ' modules carry a module-level visibility class.');
P('- **Motion in the source**: ' + HOME.animMarkers + ' animation markers on the home and ' + cnt((r) => r.animMarkers) + ' pages with any (classes `wow`, `fl-animation`, `animated`, `animate__*`, `aos-*`; attributes `data-animation*`, `data-wow-*`, `data-aos*`). Moving parts on the home: ' + HOME_ROWS.filter((x) => x.carousel.length).length + ' carousel (autoplay ' + HOME_ROWS.filter((x) => x.carousel.length).map((x) => (x.carousel[0].parsed || {}).autoplay).join('/') + ') and ' + HOME.videos.length + ' videos. Scroll animations in the redesign are new behaviour, not parity.', '');

/* ---- 6 ---- */
P('## 6. Interior page anatomy', '');
const sbStd = SIDEBAR_PAGES.filter((r) => r.sidebarSig === sidebarVariants[0][0]);
const sbOther = SIDEBAR_PAGES.filter((r) => r.sidebarSig !== sidebarVariants[0][0]);
const sbc = (f) => SIDEBAR_PAGES.filter(f).length;
const famList = (f, pool) => sortDesc(countBy((pool || SIDEBAR_PAGES).filter(f), (r) => r.family)).map(([k, n]) => k + ' ' + n).join(', ');
const bcAutoN = cnt((r) => r.breadcrumb === 'auto'); const bcManN = cnt((r) => r.breadcrumb === 'manual'); const bcNoneN = cnt((r) => r.breadcrumb === 'none');
const cpPages = PAGE_RECS.filter((r) => r.childpages.lists);
const cpSide = SIDEBAR_PAGES.filter((r) => r.childpages.lists);
const autoAllEndSep = PAGE_RECS.filter((r) => r.breadcrumb === 'auto').every((r) => r.breadcrumbEndsWithSep);
const bcCurrentShown = cnt((r) => r.breadcrumb !== 'none' && r.breadcrumbCurrent);
const bcCurrentMatchesH1 = cnt((r) => r.breadcrumbCurrent && r.h1.some((h) => h.toLowerCase() === r.breadcrumbCurrent.toLowerCase()));
P('### 6.1 Common frame (' + SIDEBAR_PAGES.length + ' pages carry the sidebar; the ' + (N - SIDEBAR_PAGES.length) + ' without it: ' + famList((r) => !r.hasSidebar, PAGE_RECS) + ')', '');
const loc = SIDEBAR.widgets.find((w) => w.location).location;
P('Counts in this block are over the ' + SIDEBAR_PAGES.length + ' sidebar pages.', '');
P('```');
P('header chrome (section 4)');
P('div.ecp-contentarea-wrapper > div.ecp-content-container > div.ecp-contentarea[role=document]');
P('  main#content.ecp-primary                               ' + sbc((r) => r.hasMain));
P('    div.ecp-breadcrumb.ecp-breadcrumb-auto                ' + sbc((r) => r.breadcrumb === 'auto') + '  Home \u00bb ancestors \u00bb current page as bare text (' + sbc((r) => r.breadcrumb === 'auto' && r.breadcrumbCurrent) + ')');
P('      | div.ecp-breadcrumb inside a builder rich-text      ' + sbc((r) => r.breadcrumb === 'manual') + '  (a hand-placed copy of the trail)');
P('    article                                               ' + sbc((r) => r.hasMain));
P('      header.ecp-entry-header > h1.ecp-entry-title        ' + sbc((r) => r.entryHeader === 'title') + '  (header present but empty on ' + sbc((r) => r.entryHeader === 'empty') + ': ' + famList((r) => r.entryHeader === 'empty') + ')');
P('      div.ecp-entry-content                               ' + sbc((r) => r.entryContent) + '  (' + famList((r) => r.entryContent) + ')');
P('        | div.ecp-posts-wrapper.ecp-view-complete         ' + sbc((r) => r.postComplete) + '  (' + famList((r) => r.postComplete) + ')');
P('      div.ecp-childpages > ul > li.ecp-childpages-link     ' + cpSide.length + ' pages, ' + cpSide.reduce((s, r) => s + r.childpages.items, 0) + ' items (title link + summary; ' + cpSide.reduce((s, r) => s + r.childpages.thumbs, 0) + ' thumbnails)');
P('  div.ecp-secondary.ecp-widget-area[role=' + SIDEBAR.role + ']      ' + SIDEBAR_PAGES.length + ', a sibling AFTER main');
SIDEBAR.widgets.forEach((w, i) => {
  if (w.search) P('    ' + (i + 1) + '. ' + w.class + ': form.ecp-search[role=' + w.search.role + '] ' + w.search.method.toUpperCase() + ' ' + w.search.action + ' (label "' + w.search.label + '", input type=' + w.search.inputType + ' name=' + w.search.inputName + ', button "' + w.search.button + '")');
  else if (w.badges) P('    ' + (i + 1) + '. ' + w.class + ': badges ' + w.badges.map((b) => '"' + b.label + '" \u2192 ' + b.href).join(', ') + '; social icons ' + w.social.map((s) => s.network).join(', '));
  else if (w.location) P('    ' + (i + 1) + '. ' + w.class + ': location summary: ' + w.location.titleTag + ' "' + w.location.title + '" \u2192 ' + w.location.titleHref + '; address "' + w.location.address + '"; ' + w.location.contacts.map((c) => c.label + ' ' + c.value).join('; ') + '; hours ' + w.location.hours.map((h) => h.day.slice(0, 3) + ' ' + h.value).join(', ') + '; ' + w.location.map + ' Google map iframe');
  else P('    ' + (i + 1) + '. ' + w.class);
});
P('footer chrome');
P('```', '');
P('- **Sidebar variants**: ' + sidebarVariants.length + '. The standard one is on ' + sbStd.length + ' pages. ' + sbOther.map((r) => code(r.path)).join(', ') + ' drops widget ' + (SIDEBAR.widgets.findIndex((w) => w.location) + 1) + ', the location summary (it would point at itself).');
P('- **Breadcrumbs** (all pages): auto on ' + bcAutoN + ', hand-placed on ' + bcManN + ' (' + pathsOf((r) => r.breadcrumb === 'manual').map(code).join(' ') + '), none on ' + bcNoneN + ' (' + pathsOf((r) => r.breadcrumb === 'none').map(code).join(' ') + '). The current page is printed after the last separator as a bare text node (no link, no element) on ' + bcCurrentShown + ' pages, and that text equals the page h1 on ' + bcCurrentMatchesH1 + '. The trail stops on the separator with no current page on ' + cnt((r) => r.breadcrumbEndsWithSep) + ' (' + famList((r) => r.breadcrumbEndsWithSep, PAGE_RECS) + '). Ancestor trails (the links only) seen: ' + sortDesc(countBy(PAGE_RECS.filter((r) => r.breadcrumb !== 'none'), (r) => r.breadcrumbTrail.join(' \u00bb '))).map(([k, n]) => '"' + k + '" ' + n).join(', ') + '.');
P('- **Page title band**: the source has none. The h1 sits at the top of the content column: `h1.ecp-entry-title` on ' + cnt((r) => r.h1Source === 'entry-title') + ' pages, an h1 inside a Beaver Builder module on ' + cnt((r) => r.h1Source === 'builder-module') + ' (' + sortDesc(countBy(PAGE_RECS.filter((r) => r.h1Source === 'builder-module'), (r) => r.h1Module)).map(([k, v]) => '`' + k + '` ' + v).join(', ') + '), an h1 typed into the post body on ' + cnt((r) => r.h1Source === 'in-content') + ', no h1 at all on ' + cnt((r) => r.h1Source === 'none') + ' (' + pathsOf((r) => r.h1Source === 'none').map(code).join(' ') + '). ' + plural(cnt((r) => r.h1.length > 1), 'page has', 'pages have') + ' more than one h1 (' + pathsOf((r) => r.h1.length > 1).map((p) => code(p) + ': ' + REC_BY_PATH.get(p).h1.map((h) => '"' + trunc(h, 40) + '"').join(', ')).join('; ') + ').');
const repeatedRows = (() => { const m = new Map(); for (const r of PAGE_RECS) for (const id of r.rowNodes) m.set(id, (m.get(id) || 0) + 1); return [...m].filter(([, n]) => n > 1).length; })();
P('- **CTA bands**: there is no template-level CTA band. ' + repeatedRows + ' Beaver Builder rows (by `data-node`) repeat on two or more pages' + (repeatedRows ? '' : ' (no global row)') + '. The CTAs are the ' + (SIDEBAR.widgets.find((w) => w.badges) || { badges: [] }).badges.length + ' sidebar badges on ' + SIDEBAR_PAGES.length + ' pages, closing sentences inside the copy, and these builder buttons inside main (label → target, pages): ' + mainCtaButtons.map(([k, s]) => '"' + k + '" (' + s.size + ')').join(', ') + '.');
P('- **Sub-navigation**: the menu dropdowns (4.3) and `ecp-childpages` listings on ' + cpPages.length + ' pages (' + cpPages.reduce((s, r) => s + r.childpages.items, 0) + ' links, each a title link + `div.ecp-childpages-summary`; ' + (() => { const g = {}; for (const r of cpPages) for (const l of r.childpages.layouts) { const k = l.layout; g[k] = g[k] || { lists: 0, items: 0, thumbs: 0, hub: 0 }; g[k].lists++; g[k].items += l.items; g[k].thumbs += l.thumbs; if (!r.hasSidebar) g[k].hub++; } return sortDesc(Object.entries(g).map(([k, v]) => [k, v.lists])).map(([k]) => '`ecp-childpages-layout-' + k + '` on ' + plural(g[k].lists, 'listing') + (g[k].hub === g[k].lists ? ' (all on builder hubs)' : g[k].hub ? ' (' + g[k].hub + ' on builder hubs)' : '') + ', ' + g[k].items + ' items, ' + (g[k].thumbs ? g[k].thumbs + ' with a thumbnail' : 'no thumbnails')).join('; '); })() + '; ' + cpPages.reduce((s, r) => s + r.childpages.summariesEmpty, 0) + ' summaries are empty in the raw HTML).', '');
P('### 6.2 Per family', '');
const famAnat = (id) => {
  const ms = FAM_MEMBERS.get(id);
  // verify-arch fix: every module type is listed (the list was silently cut to 8 types: the home lost ReviewsModule,
  // the builder hubs lost 8 types, the templates 2)
  const mods = sortDesc(countBy(ms.flatMap((r) => r.modules), (x) => x)).map(([k, n]) => k + ' ' + n).join(', ');
  const imgs = ms.reduce((s, r) => s + r.images.filter((i) => i.region === 'main').length, 0);
  const vids = ms.reduce((s, r) => s + r.videos.length, 0);
  const words = ms.map((r) => r.wordCount || 0); words.sort((a, b) => a - b);
  // verify-arch fix: a true median (mean of the two middle values for an even count); the upper-middle value was used,
  // which gave template 117 (true 110.5) and form 402 (true 267)
  const medW = !words.length ? 0 : words.length % 2 ? words[(words.length - 1) / 2] : (words[words.length / 2 - 1] + words[words.length / 2]) / 2;
  return [id + ' (' + ms.length + ')', [
    'sidebar ' + ms.filter((r) => r.hasSidebar).length, 'builder ' + ms.filter((r) => r.builderInMain || r.builderBodyLevel).length,
    'images in main ' + imgs + (vids ? ', videos ' + vids : ''), 'child listings ' + ms.filter((r) => r.childpages.lists).length,
    'median words (content-inventory) ' + medW, mods ? 'modules: ' + mods : '',
  ].filter(Boolean).join('; ')];
};
P(table(['Family', 'Anatomy beyond the common frame (computed)'], FAMILY_IDS.map(famAnat)), '');
P('Builder hubs, page by page (no sidebar; full-width `ecp-theme-layout-full`):', '');
P(table(['Page', 'h1', 'Rows', 'Modules', 'Buttons in main'], FAM_MEMBERS.get('builder-hub').map((r) => [code(r.path), r.h1.length ? r.h1.map((h) => '"' + trunc(h, 50) + '"').join(', ') : '**none**', r.rowCount, sortDesc(countBy(r.modules, (x) => x)).map(([k, n]) => k + (n > 1 ? ' \u00d7' + n : '')).join(', '), mainCtaButtons.filter(([, s]) => s.has(r.path)).map(([k]) => '"' + k + '"').join(', ')])), '');
P('Other per-family facts:', '');
const bp = FAM_MEMBERS.get('blog-post');
const bpDates = bp.flatMap((r) => r.postDates).filter(Boolean).map((s) => ({ s, t: Date.parse(s) })).filter((d) => !isNaN(d.t)).sort((a, b) => a.t - b.t);
P('- **blog-post** (' + famCount('blog-post') + '): entry header empty on ' + bp.filter((r) => r.entryHeader === 'empty').length + '; the h1 is typed into the post body on ' + bp.filter((r) => r.h1Source === 'in-content').length + '. `div.ecp-post-date` carries a date on ' + bp.filter((r) => r.postDates.some(Boolean)).length + ' (earliest "' + (bpDates[0] || {}).s + '", latest "' + (bpDates[bpDates.length - 1] || {}).s + '"; ' + sortDesc(countBy(bpDates, (d) => new Date(d.t).getFullYear())).sort((a, b) => a[0] - b[0]).map(([y, n]) => y + ': ' + n).join(', ') + '). Breadcrumb ' + uniq(bp.map((r) => '"' + r.breadcrumbTrail.join(' \u00bb ') + ' \u00bb"')).join(', ') + ' followed by the post title as bare text on ' + bp.filter((r) => r.breadcrumbCurrent).length + '. Builder layout on ' + bp.filter((r) => r.builderInMain).length + ' (' + bp.filter((r) => r.builderInMain).map((r) => code(r.path)).join(' ') + ').');
const tm = FAM_MEMBERS.get('team-member');
P('- **team-member** (' + famCount('team-member') + '): `h1.ecp-entry-title` name, portrait in `div.ecp-post-image` (' + tm.filter((r) => r.postImage).length + ' pages), `div.ecp-post-position` filled on ' + tm.filter((r) => r.positions.some(Boolean)).length + ' (' + uniq(tm.flatMap((r) => r.positions).filter(Boolean)).map((x) => '"' + x + '"').join(', ') + '), then bio paragraphs. Breadcrumbs: ' + sortDesc(countBy(tm, (r) => r.breadcrumbTrail.join(' \u00bb '))).map(([k, n]) => '"' + k + '" ' + n).join(', ') + '. ' + tm.filter((r) => r.canonicals[0] && !selfCanon(r)).length + ' of them canonicalise to `/the-staff/` (section 9).');
P('- **archive** (' + famCount('archive') + '): ' + FAM_MEMBERS.get('archive').filter((r) => r.noResults).length + ' are "Nothing Found" + search form (' + FAM_MEMBERS.get('archive').filter((r) => r.noResults).map((r) => code(r.path)).join(' ') + '). The rest list post titles as `div.ecp-entry-title > a` (' + FAM_MEMBERS.get('archive').filter((r) => !r.noResults).map((r) => r.path.split('/').filter(Boolean).pop() + ' ' + r.archiveLinks).join(', ') + '). Breadcrumb: ' + (FAM_MEMBERS.get('archive').filter((r) => r.breadcrumbCurrent).length ? 'the archive name as bare text on ' + FAM_MEMBERS.get('archive').filter((r) => r.breadcrumbCurrent).length + ', ' : '') + 'a bare "Home' + String.fromCharCode(32, 187) + '" that stops on the separator on ' + FAM_MEMBERS.get('archive').filter((r) => r.breadcrumbEndsWithSep).length + ' of ' + famCount('archive') + '.');
P('- **form** (' + famCount('form') + '): one Gravity Form each in main (section 7). ' + FAM_MEMBERS.get('form').map((r) => code(r.path) + (r.builderInMain ? ' is a builder layout in the sidebar frame' : ' is classic content')).join('; ') + '.');
P('- **blog-index** (' + famCount('blog-index') + '): `/whats-new/` prints **all ' + (REC_BY_PATH.get('/whats-new/') || {}).postSummaries + ' post summaries on one page** (' + (REC_BY_PATH.get('/whats-new/') || { summaryTitleTags: [] }).summaryTitleTags.join('/') + ' title link, date in ' + ((REC_BY_PATH.get('/whats-new/') || { summaryDates: [] }).summaryDates.filter(Boolean).length) + ' of them, excerpt, "Read More"), with no pagination.');
P('- **testimonial** (' + famCount('testimonial') + '), **location** (' + famCount('location') + '), **sitemap** (' + famCount('sitemap') + '), **not-found** (' + famCount('not-found') + '), **legal** (' + famCount('legal') + '): sidebar frame. The location body prints contact details, address (' + ((REC_BY_PATH.get('/location/riverside-family-eyecare/') || { addresses: [] }).addresses.filter((a) => a.region === 'main').map((a) => '"' + a.text + '"').join(', ') || 'none') + '), a map and hours; its `div.ecp-post-subheading` labels are ' + ((REC_BY_PATH.get('/location/riverside-family-eyecare/') || { subheadings: [] }).subheadings.map((s) => '"' + s + '"').join(', ') || 'none') + '. The sitemap is `div.ecp-sitemap` with ' + (REC_BY_PATH.get('/sitemap/') || {}).sitemapLinks + ' list items plus a search form. The 404 body is an `ecp-row` of ' + ((REC_BY_PATH.get('/404-page-not-found/') || {}).ecpColumns || 0) + ' `ecp-column`s with ' + ((REC_BY_PATH.get('/404-page-not-found/') || { images: [] }).images.filter((i) => i.region === 'main').map((i) => code(fileOf(i.src)) + ' from ' + hostOf(i.src)).join(', ') || 'no image') + '.', '');

/* ---- 7 ---- */
P('## 7. Forms inventory', '');
for (const g of GFORMS) {
  P('### ' + g.provider + ' `#' + g.formId + '` on `' + g.page + '`', '');
  P('`' + g.method + '` `' + (g.enctype || '') + '` \u2192 ' + code(g.action) + '; wrapper `#' + g.wrapperId + '` legacy markup: ' + g.legacyMarkup + ', theme ' + code(g.theme) + (g.wrapperStyle ? ', wrapper style ' + code(g.wrapperStyle) + ' (hidden until GF script runs)' : '') + '; `novalidate`: ' + g.novalidate + '; submit "' + g.submit + '"; ' + g.hiddenInputs + ' hidden inputs; ' + g.requiredMarkers + ' `.gfield_required` markers on ' + plural(g.fields.filter((f) => f.required).length, 'required field') + ' (' + (g.fields.filter((f) => f.required).length ? (g.requiredMarkers / g.fields.filter((f) => f.required).length) : 0) + ' per field: a wrapper span and the asterisk span) and ' + g.ariaRequiredTrue + ' `aria-required="true"`; Akismet honeypot `ak_hp_textarea`: ' + g.akismet + '.', '');
  P(table(['Field id', 'Type', 'Label', 'Required', 'Inputs (name \u00b7 type)', 'Options / sub-labels', 'Description'], g.fields.map((f) => [f.id, f.type, f.label == null ? (f.html ? '(html) "' + words(f.html, 11) + '"' : '(none)') : f.label + (f.honeypot ? ' (honeypot, hidden)' : ''), f.required ? '**yes**' : 'no', f.inputs.map((i) => (i.name || '?') + ' \u00b7 ' + i.type + (i.placeholder ? ' (placeholder "' + i.placeholder + '")' : '')).join(', ') || (f.captcha ? f.captcha.provider + ' ' + f.captcha.size + ' (badge ' + f.captcha.badge + ')' : ''), f.options.length ? f.options.join(' / ') : f.sublabels.join(' / '), f.description ? '"' + words(f.description, 11) + '"' : ''])), '');
}
const sideSearchPages = cnt((r) => r.searchForms.get('sidebar')); const mainSearchPages = pathsOf((r) => r.searchForms.get('main'));
P('### Search forms', '');
P(table(['Where', 'Form', 'Fields', 'Pages'], [
  ['Sidebar widget `search-3`', '`form.ecp-search[role=search]` GET ' + code(SIDEBAR.widgets[0].search.action), 'label "' + SIDEBAR.widgets[0].search.label + '" + `input[type=search][name=s]` + button "' + SIDEBAR.widgets[0].search.button + '"', sideSearchPages],
  ['Inside main (`ecp-search` module, or the "Nothing Found" archive body)', 'same markup', 'same', mainSearchPages.length + ': ' + mainSearchPages.map(code).join(' ')],
  ['Footer voice search', '`form#voice_search.ecp-voice-search` GET `/?s=`', 'label "Speak Field" + `input[type=text][name=s]` (placeholder "' + ((navFooterVoice() || {}).placeholder || '') + '") + inline microphone SVG. Speech capture: an inline `webkitSpeechRecognition` script on ' + cnt((r) => r.speechInline) + ' pages writes the transcript to `getElementById(\'' + (HOME.speechTargetsId || '?') + '\')`, but the input id is generated per page (`' + (HOME.voiceInputId || '?') + '` on the home; ' + new Set(PAGE_RECS.filter((r) => r.voiceInputId).map((r) => r.voiceInputId)).size + ' distinct `transcript-*` ids on ' + cnt((r) => r.voiceInputId) + ' pages; target present on the home: ' + HOME.speechTargetExists + '); no element in the raw HTML has that id, so as written the transcript cannot reach the field (runtime behaviour UNVERIFIED)', cnt((r) => r.voiceSearch) + ' (' + cnt((r) => r.voiceSearch && r.hasFooter) + ' chrome pages + ' + cnt((r) => r.voiceSearch && !r.hasFooter) + ' footer templates)'],
]), '');
const formKindTotals = sortDesc(countBy(PAGE_RECS.flatMap((r) => r.formKinds), (k) => k));
P('Every `<form>` element in the ' + N + ' raw pages, by kind: ' + formKindTotals.map(([k, n]) => k + ' ' + n).join(', ') + '. ' + (formKindTotals.some(([k]) => k.startsWith('other')) ? 'The "other" forms need a look.' : 'There is no other form: no appointment widget in the sidebar, no newsletter signup.') + ' Gravity Forms markup is on ' + GFORMS.length + ' pages only. Both forms load Google reCAPTCHA (`www.google.com/recaptcha/api.js`, invisible, bottom-right badge) and the Akismet honeypot. The rebuild re-creates each field from the labels, options and required markers above and posts nowhere until a backend is wired.', '');

/* ---- 8 ---- */
P('## 8. Embeds and third parties', '');
const mapPages = PAGE_RECS.filter((r) => r.iframes.some((f) => /google\.com$/.test(f.host) && /\/maps\/embed/.test(f.path)));
const mapWhere = sortDesc(countBy(PAGE_RECS.flatMap((r) => r.iframes.filter((f) => /\/maps\/embed/.test(f.path)).map((f) => f.region)), (x) => x));
const mapQ = uniq(PAGE_RECS.flatMap((r) => r.iframes.filter((f) => /\/maps\/embed/.test(f.path)).map((f) => f.q)));
const ytPages = PAGE_RECS.filter((r) => r.iframes.some((f) => /youtube/.test(f.host)));
const ytLd = PAGE_RECS.filter((r) => r.jsonLdErrors.some((e) => e.type === 'VideoObject') || r.jsonLd.includes('VideoObject'));
const vidPages = PAGE_RECS.filter((r) => r.videos.length);
P(table(['Embed / third party', 'Host / id', 'Pages', 'Where / notes'], [
  ['Google Maps Embed API v1 (keyed: `key=AIza\u2026` belongs to the platform)', '`www.google.com/maps/embed/v1/place`, `q=' + mapQ.join(', ') + '`', mapPages.length + ' pages, ' + PAGE_RECS.reduce((s, r) => s + r.iframes.filter((f) => /\/maps\/embed/.test(f.path)).length, 0) + ' iframes', mapWhere.map(([k, n]) => k + ' ' + n).join(', ') + '; in main on ' + PAGE_RECS.filter((r) => r.iframes.some((f) => /\/maps\/embed/.test(f.path) && f.region === 'main')).map((r) => code(r.path)).join(' ') + '; titles: ' + sortDesc(countBy(PAGE_RECS.flatMap((r) => r.iframes.filter((f) => /\/maps\/embed/.test(f.path))), (f) => f.title || '(none)')).map(([k, n]) => '"' + k + '" ' + n).join(', ')],
  ['YouTube iframe', ytPages.map((r) => r.iframes.filter((f) => /youtube/.test(f.host)).map((f) => code(f.host + f.path))).flat().join(', '), ytPages.length, ytPages.map((r) => code(r.path)).join(' ') + (ytPages.some((r) => r.iframes.some((f) => /youtube/.test(f.host) && f.lazy)) ? ' (lazy-loaded: the iframe has only `data-src`, no `src`, in the raw HTML)' : '') + '. The same video appears as JSON-LD `VideoObject` on ' + ytLd.length + ' pages (' + ytLd.map((r) => code(r.path)).join(' ') + '), and that JSON does not parse (section 9)'],
  ['Self-hosted `<video>` (mp4)', (mediaInv.saved || []).map((m) => code(fileOf(m.url))).join(', '), vidPages.length, vidPages.map((r) => code(r.path) + ' ' + r.videos.length).join(', ') + ' (`.ecp-video.ecp-video-click-to-activate` on ' + cnt((r) => r.videoClickToActivate) + ' pages). ' + (mediaInv.saved || []).length + ' files saved under `assets/media` per `media-inventory.json`'],
  ['Testimonials (`fl-module-ReviewsModule`)', 'platform testimonial posts', cnt((r) => r.reviewsModule), pathsOf((r) => r.reviewsModule).map(code).join(' ') + '; Splide carousel on ' + pathsOf((r) => r.splide).map(code).join(' ') + '. Third-party review widgets: ' + cnt((r) => r.widgetHits.reviews) + ' pages (pattern ' + code(WIDGET_PATTERNS.reviews.source) + ')'],
  ['Mercator SSO (WordPress multisite domain mapping)', '`ecpbuilder.com/wp-admin/admin-ajax.php?action=mercator-sso-js`', cnt((r) => r.ecpbuilder.mercatorCommented), 'a `<script src>` to the builder network that sits **inside an HTML comment**, so it does not load (live script tags: ' + cnt((r) => r.ecpbuilder.mercatorSso) + '); platform plumbing, REMOVE'],
  ['Cherry patient financing', code(cherryCfg.loader), cnt((r) => r.cherry), 'inline loader + `div#floatingEstimator` on every page (4.6); the menu also links `/cherry-payment-plan/`'],
  ['Google Tag Manager', r0(PAGE_RECS.flatMap((r) => r.gtm)), cnt((r) => r.gtm.length), 'inline `dataLayer` loader in `<head>` on ' + cnt((r) => r.gtmHeadLoader) + ' + noscript iframe on ' + cnt((r) => r.gtmNoscript) + '. Tracker, REMOVE (re-add only on owner instruction)'],
  ['Google Analytics 4 / gtag id', r0(PAGE_RECS.flatMap((r) => r.ga4)), cnt((r) => r.ga4.length), 'id found in: ' + sortDesc(countBy(PAGE_RECS.filter((r) => r.ga4Where), (r) => r.ga4Where)).map(([k, n]) => k + ' ' + n).join(', ') + '; `link[rel=preconnect]` hosts: ' + sortDesc(countBy(PAGE_RECS.flatMap((r) => uniq(r.preconnect)), (h) => h)).map(([h, n]) => h + ' ' + n).join(', ')],
  ['Google Ads conversion', '`www.googleadservices.com/pagead/conversion_async.js`', cnt((r) => r.gads), '`<script src>` on ' + cnt((r) => r.gadsScript) + ' pages'],
  ['Google reCAPTCHA', '`www.google.com/recaptcha/api.js`', cnt((r) => r.recaptcha), 'the two Gravity Forms pages (invisible captcha)'],
  ['Akismet', '`/wp-content/plugins/akismet/`', cnt((r) => r.akismet), 'honeypot fields in both forms'],
  ['Google Fonts', '`fonts.googleapis.com/css2` (1 request)', cnt((r) => r.googleFonts.length), fontFamiliesRequested.length + ' families: ' + fontFamiliesRequested.join(', ') + '. Files harvested: ' + fontFilesByFamily.filter(([k]) => k.startsWith('Google')).map(([k, n]) => k.replace('Google Fonts: ', '') + ' ' + n).join(', ')],
  ['Icon font: EyeCarePro-Icons', '`/wp-content/uploads/bb-plugin/icons/icon-1734360712/style.css`', cnt((r) => r.iconCss), 'linked on ' + pathsOf((r) => r.iconCss).map(code).join(' ') + '; ' + (fontInv.saved || []).filter((s) => /EyeCarePro-Icons/.test(s.url)).length + ' files (eot/ttf/woff/svg). Must not ship (platform asset). Inline SVG icons in `span.ecp-icon-svg`: ' + HOME.inlineSvgIcons + ' on the home, present on ' + cnt((r) => r.inlineSvgIcons) + ' pages'],
  ['Icon font: Foundation Icons 3.0.0', '`cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/`', cnt((r) => r.foundicons), pathsOf((r) => r.foundicons).map(code).join(' ') + ' only (a template page)'],
  ['Icon font: Font Awesome 5.15.4', '`/wp-content/plugins/bb-plugin/fonts/fontawesome/5.15.4/`', '\u2014', (fontInv.saved || []).filter((s) => /fontawesome/i.test(s.url)).map((s) => code(fileOf(s.url))).join(', ') + ' harvested from bb-plugin CSS; which pages render FA glyphs is UNVERIFIED'],
  ['WordPress emoji', '`wp-emoji` script + styles', cnt((r) => r.wpEmoji), 'core boilerplate, REMOVE'],
  ['jQuery 3.7.1', (() => { // verify-arch fix: the delivery split (the GENERATED-PAGE-JQUERY comment marks only part of the inlined copies)
    const raws = PAGE_RECS.map((r) => rd('audit/raw/' + r.savedAs));
    const inl = raws.filter((h) => /<script[^>]*>\s*\/\*! jQuery v3\.7\.1/.test(h));
    const gen = inl.filter((h) => /<!--\s*GENERATED-PAGE-JQUERY\s*-->/.test(h));
    const src = raws.filter((h) => /<script[^>]*\bsrc=["'][^"']*\/wp-includes\/js\/jquery\/jquery(\.min)?\.js/.test(h));
    return 'inlined as a `<script>` on ' + inl.length + ' pages (' + gen.length + ' of them inside `<!-- GENERATED-PAGE-JQUERY -->`); `<script src>` from `/wp-includes/js/jquery/` on ' + src.length;
  })(), cnt((r) => /jQuery v3\.7\.1|jquery\.min\.js\?ver=3\.7\.1/.test(rd('audit/raw/' + r.savedAs))), 'same-origin scripts harvested (`script-inventory.json`): ' + uniq(((J('audit/script-inventory.json').saved) || []).map((x) => code(fileOf(x.url)))).join(', ')],
]), '');
P('Outbound brand and partner links on the home are not embeds, but note them: ' + uniq(HOME_ROWS.flatMap((x) => x.ctas).filter((c) => /^https?:/.test(c.href) && !isInternal(c.href)).map((c) => code(c.href.length > 90 ? c.href.slice(0, 89) + '\u2026' : c.href))).join(', ') + '.', '');

/* ---- 9 ---- */
P('## 9. SEO surface (head) per family', '');
const seoRow = (id) => {
  const ms = FAM_MEMBERS.get(id);
  return [id, ms.length,
    ms.filter((r) => !r.title).length + ' empty' + (ms.filter((r) => DUP_TITLES.some(([, v]) => v.includes(r.path))).length ? ', ' + ms.filter((r) => DUP_TITLES.some(([, v]) => v.includes(r.path))).length + ' in duplicate groups' : ''),
    ms.filter((r) => !r.descriptions.length || !r.descriptions[0]).length,
    ms.filter(selfCanon).length + ' / ' + ms.filter((r) => r.canonicals.length && !selfCanon(r)).length + ' / ' + ms.filter((r) => !r.canonicals.length).length,
    ms.filter(effNoindex).length,
    uniq(ms.map((r) => r.robots.filter((x) => x !== 'max-image-preview:large').join(' + ') || '(WP meta only)')).join('; '),
    ms.filter((r) => r.og['og:title'] !== undefined && r.twitter['twitter:card'] !== undefined).length,
    uniq(ms.flatMap((r) => r.jsonLd)).filter((t) => !['WebPage', 'LocalBusiness', 'MedicalBusiness', 'Optician', 'MedicalSpecialty :: Optometric', 'Organization', 'BreadcrumbList'].includes(t)).join(', ') + (ms.some((r) => r.jsonLdErrors.length) ? ' (' + ms.filter((r) => r.jsonLdErrors.length).length + ' with unparsable JSON-LD)' : ''),
  ];
};
P(table(['Family', 'Pages', '`<title>`', 'No description', 'Canonical self / other / missing', 'noindex (effective)', 'EyeCarePro robots meta', 'OG + Twitter', 'JSON-LD beyond the site-wide set'], FAMILY_IDS.map(seoRow)), '');
P('- **Robots**: every page prints WordPress\'s `<meta name=\'robots\' content=\'max-image-preview:large\'>`. ' + cnt((r) => r.robots.length > 1) + ' pages also print an EyeCarePro robots meta **before** it. Combinations: ' + robotsCombos.map(([k, n]) => code(k) + ' ' + n).join(', ') + '. Crawlers apply the most restrictive directive, so **' + cnt(effNoindex) + ' pages are noindex on the live site**: ' + sortDesc(countBy(PAGE_RECS.filter(effNoindex), (r) => r.family)).map(([k, n]) => k + ' ' + n).join(', ') + '. `seo-inventory.json` recorded only one value (`metaRobots` is ' + uniq(seoInv.pages.map((p) => p.metaRobots)).map(code).join(', ') + ' on all ' + seoInv.pages.length + '), so **do not read robots from it**.');
P('- **Canonical**: self-referencing on ' + cnt(selfCanon) + '; missing on ' + cnt((r) => !r.canonicals.length) + ' (all ' + FAM_MEMBERS.get('archive').filter((r) => !r.canonicals.length).length + ' archives). It points elsewhere on ' + cnt((r) => r.canonicals.length && !selfCanon(r)) + ': ' + sortDesc(countBy(PAGE_RECS.filter((r) => r.canonicals.length && !selfCanon(r)), (r) => livePath(r.canonicals[0]))).map(([k, n]) => n + ' \u2192 ' + code(k) + ' (' + PAGE_RECS.filter((r) => r.canonicals.length && !selfCanon(r) && livePath(r.canonicals[0]) === k).map((r) => code(r.path)).join(' ') + ')').join('; ') + '. Those ' + cnt((r) => r.canonicals.length && !selfCanon(r)) + ' pages name another URL as their canonical, which tells search engines they duplicate it.');
P('- **Title**: empty on ' + cnt((r) => !r.title) + ' (' + pathsOf((r) => !r.title).map(code).join(' ') + '). Duplicated across distinct pages (case-insensitive) in ' + DUP_TITLES.length + ' groups covering ' + DUP_TITLES.reduce((s, [, v]) => s + v.length, 0) + ' pages' + (DUP_TITLES.length ? ': ' + DUP_TITLES.map(([t, v]) => '"' + trunc(t, 60) + '" (' + v.map(code).join(' ') + ')').join('; ') : '') + '. ' + plural(cnt((r) => r.titleRaw && /\s{2,}/.test(r.titleRaw)), 'raw title contains', 'raw titles contain') + ' a double space (' + pathsOf((r) => r.titleRaw && /\s{2,}/.test(r.titleRaw)).slice(0, 3).map(code).join(' ') + ').');
P('- **Description**: missing on ' + cnt((r) => !r.descriptions.length || !r.descriptions[0]) + ' (' + sortDesc(countBy(PAGE_RECS.filter((r) => !r.descriptions.length || !r.descriptions[0]), (r) => r.family)).map(([k, n]) => k + ' ' + n).join(', ') + '). Duplicate descriptions: ' + DUP_DESCS.length + ' groups covering ' + DUP_DESCS.reduce((n, [, v]) => n + v.length, 0) + ' pages' + (DUP_DESCS.length ? ' (' + DUP_DESCS.map(([, v]) => v.map(code).join(' ')).join('; ') + ')' : '') + '. ' + (() => { const byFam = sortDesc(countBy(DUP_DESCS.flatMap(([, v]) => v).map((p) => (PAGE_RECS.find((r) => r.path === p) || {}).family), (x) => x)); return 'By family: ' + byFam.map(([k, n]) => k + ' ' + n).join(', ') + '; ' + DUP_DESCS.filter(([, v]) => v.some((p) => /^\/(tag|category|author)\//.test(p))).length + ' of the ' + DUP_DESCS.length + ' groups contain an archive page' + (DUP_DESCS.some(([, v]) => !v.some((p) => /^\/(tag|category|author)\//.test(p))) ? '; the other ' + DUP_DESCS.filter(([, v]) => !v.some((p) => /^\/(tag|category|author)\//.test(p))).map(([, v]) => v.map(code).join(' + ')).join('; ') + ' shares one description between two pages' : '') + '.'; })());
P('- **Open Graph / Twitter**: ' + ['og:site_name', 'og:title', 'og:description', 'og:type', 'og:image', 'og:url'].map((k) => k + ' ' + cnt((r) => r.og[k] !== undefined)).join(', ') + '; `og:featured_image` ' + cnt((r) => r.og['og:featured_image'] !== undefined) + '; ' + ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].map((k) => k + ' ' + cnt((r) => r.twitter[k] !== undefined)).join(', ') + ' (pages where the tag is present). Present but empty: ' + (() => { const e = {}; for (const r of PAGE_RECS) { for (const [k, v] of Object.entries(r.og)) if (!String(v).trim()) (e[k] = e[k] || []).push(r.path); for (const [k, v] of Object.entries(r.twitter)) if (!String(v).trim()) (e[k] = e[k] || []).push(r.path); } const ks = Object.keys(e); return ks.length ? ks.map((k) => k + ' ' + e[k].length).join(', ') + ' (the ' + Math.min(...ks.map((k) => e[k].length)) + '-page sets are the "Nothing Found" archives; the larger sets are the pages without a meta description)' : 'none'; })() + '. `og:url` differs from the page URL on ' + cnt((r) => r.og['og:url'] && normUrl(r.og['og:url']) !== r.key) + ' pages (' + pathsOf((r) => r.og['og:url'] && normUrl(r.og['og:url']) !== r.key).slice(0, 6).map(code).join(' ') + (cnt((r) => r.og['og:url'] && normUrl(r.og['og:url']) !== r.key) > 6 ? ' \u2026' : '') + '); archives borrow the first listed post.');
P('- **JSON-LD** (types per page): ' + jsonLdTypes.map(([k, n]) => code(k) + ' ' + n).join(', ') + '. Site-wide: 4 business blocks with the same NAP (LocalBusiness, MedicalBusiness, Optician, and `"@type": "MedicalSpecialty :: Optometric"`, which is not a schema.org type), Organization and WebPage. The `BreadcrumbList` is **the same on every page** (' + BL_SIGS.size + ' distinct value across ' + N + '). It is a hard-coded list of 5 service URLs, not a breadcrumb: ' + BL_ITEMS.map((it) => code(livePath(it.item)) + ' (' + it.status + ')').join(', ') + '. Unparsable JSON-LD on ' + cnt((r) => r.jsonLdErrors.length) + ' pages (' + PAGE_RECS.filter((r) => r.jsonLdErrors.length).map((r) => code(r.path) + ' ' + r.jsonLdErrors.map((e) => e.type + ': ' + e.error).join(', ')).join('; ') + '). Person schema (`Person`/`Physician`/`Optometrist`): ' + cnt((r) => r.jsonLd.some((t) => /Person|Physician|Optometrist/.test(t))) + ' pages. `FAQPage` is on ' + pathsOf((r) => r.jsonLd.includes('FAQPage')).map(code).join(' ') + (REC_BY_PATH.get('/eye-care-services/faq/') && !REC_BY_PATH.get('/eye-care-services/faq/').jsonLd.includes('FAQPage') ? ', **not** on the FAQ page `/eye-care-services/faq/`' : '') + '. `BlogPosting` is on ' + FAM_MEMBERS.get('blog-post').filter((r) => r.jsonLd.includes('BlogPosting')).length + ' of ' + famCount('blog-post') + ' posts' + (FAM_MEMBERS.get('blog-post').some((r) => !r.jsonLd.includes('BlogPosting')) ? ' (missing on ' + FAM_MEMBERS.get('blog-post').filter((r) => !r.jsonLd.includes('BlogPosting')).map((r) => code(r.path)).join(' ') + ')' : '') + (cnt((r) => r.family !== 'blog-post' && r.jsonLd.includes('BlogPosting')) ? ', plus ' + cnt((r) => r.family !== 'blog-post' && r.jsonLd.includes('BlogPosting')) + ' non-post pages (' + sortDesc(countBy(PAGE_RECS.filter((r) => r.family !== 'blog-post' && r.jsonLd.includes('BlogPosting')), (r) => r.family)).map(([k, n]) => k + ' ' + n).join(', ') + ')' : '') + '.');
P('- **Headings**: 0 h1 on ' + cnt((r) => !r.h1.length) + ', 2+ h1 on ' + cnt((r) => r.h1.length > 1) + ', empty h1 on ' + cnt((r) => r.h1Empty) + '. `hreflang`: ' + cnt((r) => r.hreflang) + ' pages. Favicon host (`link[rel=icon]`): ' + sortDesc(countBy(PAGE_RECS.flatMap((r) => uniq(r.favicon)), (h) => h)).map(([h, n]) => h + ' ' + n).join(', ') + '.', '');

/* ---- 10 ---- */
P('## 10. Redirect aliases and broken internal targets', '');
P('Aliases (`site-inventory.json pages[].aliases`; the crawler requested each URL and the response landed on the page shown. The redirect status of an alias is not stored, so "301" is UNVERIFIED):', '');
P(table(['Old URL (crawler-normalised)', 'Lands on', 'Linked from (page: link text)'], ALIASES.map((a) => [code(a.from), code(a.to) + (a.to === '/riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/' ? ' **(unrelated blog post)**' : ''), uniq(a.referrers.map((x) => code(x.page) + ': "' + trunc(x.label, 40) + '"' + (x.region !== 'main' ? ' (' + x.region + ')' : ''))).join('; ') || '(no referrer in the raw HTML)'])), '');
const softBroken = ALIASES.filter((a) => a.to === '/riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/');
P('**' + softBroken.length + ' aliases are soft-broken.** Old `/eyeglasses-contacts/...`, `/your-eye-health/...`, `/eye-care-services/.../cataract-surgery-co-management` and `/contact-us/patient-forms/new-patient-information` URLs all land on one blog post, "' + (REC_BY_PATH.get('/riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/') || { h1: [''] }).h1[0] + '". A crawled page with the same last path segment exists for ' + softBroken.filter((a) => candOf(a).length).length + ' of them: ' + softBroken.map((a) => code(a.from) + ' \u2192 ' + (candOf(a).length ? candOf(a).map(code).join(' or ') : 'no same-slug page')).join('; ') + ' (string match on the slug, so a candidate, not a verified intent). The rebuild should re-point the in-content links and 301 each old URL to its real counterpart. The redirect map is a decision for later, and the live redirect is evidence of a platform rule, not of intent.', '');
P('Broken internal targets:', '');
P('- **Hard 404s: 0.** The crawl failed on 0 URLs, and every internal `<a href>` in the ' + N + ' raw pages resolves to a crawled page or an alias' + (UNCRAWLED_TARGETS.length ? ', except ' + UNCRAWLED_TARGETS.length + ' non-HTML or skipped targets: ' + UNCRAWLED_TARGETS.map((t) => code(t.target) + ' (' + t.pages.length + ' pages)').join(', ') : '') + '. `link-graph.json` has ' + LG_DANGLING.length + ' edges to a URL that is not a node; ' + LG_DANGLING_TO_ALIAS + ' of them point at the aliases above' + (LG_DANGLING.length === LG_DANGLING_TO_ALIAS ? ' (all of them)' : ', the rest need a look') + '.');
P('- **Malformed hrefs**: ' + [
  ['`tel:` followed by a space', malformed.telSpace], ['empty `tel:`', malformed.telEmpty], ['href starting with a space', malformed.leadingSpace], ['empty href', malformed.emptyHref],
].map(([k, m]) => k + ': ' + (m.size ? [...m].map(([h, s]) => h + ' on ' + (s.size <= 3 ? [...s].map(code).join(' ') : s.size + ' pages')).join(', ') : 'none')).join('; ') + '. `href="#"` (menu toggles, focus traps, accordion triggers): ' + PAGE_RECS.reduce((s, r) => s + r.links.filter((l) => l.href === '#').length, 0) + ' `<a href="#">` elements on ' + cnt((r) => r.links.some((l) => l.href === '#')) + ' pages.');
const ctaMismatch = [];
for (const r of PAGE_RECS) for (const b of r.mainButtons) {
  const m = /^learn more about (.+)$/i.exec(b.label || '');
  if (!m || !b.href || !b.href.startsWith('/')) continue;
  const tgt = REC_BY_PATH.get(livePath(ORIGIN + b.href.split('#')[0]));
  const words = m[1].toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  const hay = tgt ? ((tgt.h1.join(' ') + ' ' + (tgt.title || '')).toLowerCase()) : '';
  if (tgt && !words.some((w) => hay.includes(w))) ctaMismatch.push({ page: r.path, label: b.label, href: b.href, targetH1: tgt.h1[0] || tgt.title });
}
P('- **Button label vs target** ("Learn More About X" buttons whose target page h1/title contains none of the words of X, words of 4+ letters): ' + (ctaMismatch.length ? ctaMismatch.map((x) => code(x.page) + ' "' + x.label + '" → ' + code(x.href) + ' (target h1 "' + x.targetH1 + '")').join('; ') : 'none') + '.');
P('- **JSON-LD BreadcrumbList targets** (on every page): ' + BL_ITEMS.filter((it) => !/crawled page/.test(it.status)).map((it) => code(livePath(it.item)) + ' is ' + it.status).join('; ') + '.', '');

/* ---- 11 ---- */
P('## 11. Platform artefacts and leaks: recommendations', '');
P('Recommendations only. The decisions are made later. "Rebuild" = make a real page in the new site, "redirect" = 301 to the named page, "drop" = do not ship.', '');
const art = [];
const tpl = FAM_MEMBERS.get('template');
const tplLeak = (p) => (REC_BY_PATH.get(p) || { leaks: [] }).leaks.map((l) => l.value);
const tplMatch = (p, rows) => { const t = REC_BY_PATH.get(p); const ids = rows.map((x) => x.node); return t ? ids.filter((n) => t.bodyRowNodes.includes(n)).length + '/' + ids.length : '?'; };
const orphanSet = new Set(arch.orphanPages.map((u) => livePath(u)));
art.push([tpl.map((r) => code(r.path)).join(' '), tpl.length, 'Beaver Builder global-template posts rendered as pages. `/template/header-3/` holds ' + tplMatch('/template/header-3/', HEADER_ROWS) + ' of the live header rows (template ' + headerTemplateId + ', matched by `data-node`); `/template/footer-2/` holds ' + tplMatch('/template/footer-2/', FOOTER_ROWS) + ' of the live footer rows (template ' + footerTemplateId + '); header, header-2, inner-header and footer hold ' + ['/template/header/', '/template/header-2/', '/template/inner-header/', '/template/footer/'].map((p) => tplMatch(p, p.includes('footer') ? FOOTER_ROWS : HEADER_ROWS)).join(', ') + ' respectively (older variants). No chrome, robots ' + uniq(tpl.map((r) => r.robots.join(' + '))).map(code).join(' / ') + ', orphans in `architecture.json`: ' + tpl.filter((r) => orphanSet.has(r.path)).length + '/' + tpl.length + '. They hold stale copy: ' + uniq(tpl.flatMap((r) => r.leaks.map((l) => r.path.replace('/template/', '').replace(/\/$/, '') + ': ' + l.value))).join('; ') + '. "Centerville Plaza" occurs on ' + plural(cnt((r) => r.leaks.some((l) => /Centerville/.test(l.value))), 'page') + ' only, while every chrome page gives the address as Palm Beach Blvd (section 4.5)', '**drop** (each was a sitemap seed; serve 410 or 301 \u2192 `/`)']);
const auth = FAM_MEMBERS.get('archive').filter((r) => r.postType === 'archive:author');
art.push([auth.map((r) => code(r.path)).join(' '), auth.length, 'author archive "' + (auth[0] || { h1: [''] }).h1[0] + '" listing ' + (auth[0] || {}).archiveLinks + ' posts; robots ' + uniq(auth.map((r) => r.robots[0])).map(code).join(', ') + '; canonical: ' + (auth[0] && auth[0].canonicals.length ? 'present' : 'none') + '; the h1 shows the author slug of the WordPress account', '**redirect** \u2192 `/whats-new/`']);
const cats = FAM_MEMBERS.get('archive').filter((r) => r.postType === 'archive:category');
art.push([cats.filter((r) => r.noResults).map((r) => code(r.path)).join(' '), cats.filter((r) => r.noResults).length, '"Nothing Found" category archives: empty `<title>` on ' + cats.filter((r) => r.noResults && !r.title).length + ', h1 ' + uniq(cats.filter((r) => r.noResults).map((r) => '"' + r.h1[0] + '"')).join('/') + ', search form in main on ' + cats.filter((r) => r.noResults && r.searchForms.get('main')).length + ', no canonical on ' + cats.filter((r) => r.noResults && !r.canonicals.length).length + ', noindex on ' + cats.filter((r) => r.noResults && effNoindex(r)).length, '**redirect**: our-doctors \u2192 `/our-eye-doctors/`, our-staff \u2192 `/the-staff/`, testimonials \u2192 `/contact-us/testimonials/` (`/category/testimonials/` is linked from the testimonial breadcrumb)']);
art.push([cats.filter((r) => !r.noResults).map((r) => code(r.path)).join(' '), cats.filter((r) => !r.noResults).length, 'category archives listing ' + cats.filter((r) => !r.noResults).map((r) => r.archiveLinks + ' posts').join(' / ') + '; noindex; borrowed titles', '**redirect** \u2192 `/whats-new/`']);
const tags = FAM_MEMBERS.get('archive').filter((r) => r.postType === 'archive:tag');
art.push([tags.filter((r) => !r.noResults).length + ' tag archives (' + famLink('archive') + ')', tags.filter((r) => !r.noResults).length, 'tag archives, ' + uniq(tags.filter((r) => !r.noResults).map((r) => r.robots[0])).map(code).join(' / ') + ' on all ' + tags.filter((r) => !r.noResults).length + '; ' + tags.filter((r) => !r.noResults).reduce((s, r) => s + r.archiveLinks, 0) + ' post links in total; orphans per `architecture.json`: ' + tags.filter((r) => !r.noResults && orphanSet.has(r.path)).length + '; `gsp-` slugs: ' + tags.filter((r) => /\/gsp-/.test(r.path)).map((r) => code(r.path)).join(' '), '**redirect** \u2192 `/whats-new/` (or the matching service page, decided later)']);
art.push([tags.filter((r) => r.noResults).map((r) => code(r.path)).join(' '), tags.filter((r) => r.noResults).length, '"Nothing Found" tag with a misspelt stock-licence slug', '**drop** (410)']);
art.push(['`/404-page-not-found/`', 1, 'the platform 404 body as an indexable page (robots ' + code(((REC_BY_PATH.get('/404-page-not-found/') || { robots: [] }).robots || []).join(' + ')) + '), image ' + ((REC_BY_PATH.get('/404-page-not-found/') || { images: [] }).images.filter((i) => i.region === 'main').map((i) => code(fileOf(i.src)) + ' from ' + hostOf(i.src)).join(', ') || 'none'), '**rebuild** as the real 404 (`dist/404.html`), noindex']);
art.push(['`/testimonial/this-was-a-great-experience/`', 1, 'single testimonial post (' + ((REC_BY_PATH.get('/testimonial/this-was-a-great-experience/') || { stars: [] }).stars.join('/') || '?') + ' full stars, "' + trunc(((REC_BY_PATH.get('/testimonial/this-was-a-great-experience/') || {}).h1 || [''])[0], 40) + '"); breadcrumb links `/category/testimonials/` (a "Nothing Found" archive)', '**redirect** \u2192 `/contact-us/testimonials/` (keep the review text there)']);
const locRec = REC_BY_PATH.get('/location/riverside-family-eyecare/') || { canonicals: [] };
art.push(['`/location/riverside-family-eyecare/`', 1, 'location post (NAP, map, hours) whose canonical already points to ' + code(locRec.canonicals[0] ? livePath(locRec.canonicals[0]) : '?') + '; the sidebar location widget on ' + sbStd.length + ' pages links to it', '**redirect** \u2192 `/hours-location/`']);
const leakPages = (kind) => PAGE_RECS.filter((r) => r.leaks.some((l) => l.kind === kind) && r.family !== 'template');
const leakSrcPosts = uniq(leakPages('shortcode').flatMap((r) => r.leakPosts));
const leakSrcRecs = leakSrcPosts.map((p) => REC_BY_PATH.get(livePath(ORIGIN + p))).filter(Boolean);
art.push([leakPages('shortcode').map((r) => code(r.path)).join(' '), leakPages('shortcode').length, 'raw shortcodes printed as visible text: ' + uniq(leakPages('shortcode').flatMap((r) => r.leaks.filter((l) => l.kind === 'shortcode').map((l) => l.value))).map((v) => code(v) + ' on ' + leakPages('shortcode').filter((r) => r.leaks.some((l) => l.kind === 'shortcode' && l.value === v)).map((r) => code(r.path)).join(' ')).join('; ') + ', inside the listed excerpt of ' + leakSrcPosts.map(code).join(' ') + '. Where: ' + uniq(leakPages('shortcode').flatMap((r) => r.leaks.filter((l) => l.kind === 'shortcode').map((l) => r.path + ' ' + l.where))).join('; ') + '. On the post itself: ' + leakSrcRecs.map((x) => x.leaks.filter((l) => l.kind === 'shortcode').length + ' visible shortcodes' + (x.shortcodeInJsonScript ? '; the shortcode text survives inside a `<script type="application/json">`' : '')).join('; '), '**rebuild** the excerpt with the resolved values (practice name and city as printed everywhere else), confirmed against the post']);
art.push([leakPages('bracket-placeholder').map((r) => code(r.path)).join(' '), leakPages('bracket-placeholder').length, 'template instruction left in legal copy: ' + uniq(leakPages('bracket-placeholder').flatMap((r) => r.leaks.filter((l) => l.kind === 'bracket-placeholder').map((l) => code(l.value)))).join(', '), '**rebuild**; the owner must supply or approve the clause (legal text is not ours to invent)']);
art.push(['`/` body class', 1, 'home slug is a placeholder: ' + code(HOME.slugClass), '**drop** (not carried)']);
art.push(['`/cherry-payment-plan/`', 1, 'builder hub with **no h1** (`<title>` "' + ((REC_BY_PATH.get('/cherry-payment-plan/') || {}).title || '') + '")', '**rebuild** with a real heading (wording: open question)']);
art.push(['vendor chrome', cnt((r) => r.poweredBy), '"\u00a9 2026 Powered by" EyeCarePro credit, "Login" \u2192 `' + (GLOBAL_FOOTER.links.find((l) => l.id) || {}).href + '`, `data-subdomain`, `rel="UNUSEDstylesheet"` links (' + cnt((r) => r.unusedStylesheet) + ' pages), `<!-- GENERATED-PAGE-* -->` inlining (' + cnt((r) => r.generatedPage) + ' pages), Akismet and GF scripts', '**drop**']);
const ebKinds = [['adminUrlMeta', '`<meta name="admin_url">`'], ['themeHeaderComment', 'theme header comment `Theme URI: http://www.ecpbuilder.com`'], ['dataSubdomain', '`body[data-subdomain]`'], ['loginLink', 'footer "Login" link'], ['mercatorCommented', 'a commented-out Mercator SSO `<script src>`'], ['imgOrCssInHtml', 'an `src=`/`url()` in the HTML itself']];
const homeCssEb = HOME_ROWS.filter((x) => x.background.some((b) => /ecpbuilder\.com/.test(b)));
art.push(['builder-host references', cnt((r) => r.ecpbuilderRefs > 0), '`ecpbuilder.com` appears in the HTML of ' + cnt((r) => r.ecpbuilderRefs > 0) + ' pages: ' + ebKinds.map(([k, label]) => label + ' ' + cnt((r) => r.ecpbuilder[k])).join(', ') + '. The home CSS also serves ' + homeCssEb.length + ' row background photos from the builder host (rows ' + homeCssEb.map((x) => x.index).join(', ') + ', via `5845-layout.css`)', '**drop** the host; re-host the harvested photos']);
art.push(['JSON-LD', N, 'invalid `@type` "MedicalSpecialty :: Optometric", four copies of the business, a hard-coded `BreadcrumbList` including an alias and an uncrawled URL, unparsable `VideoObject` on ' + cnt((r) => r.jsonLdErrors.length), '**rebuild** one valid `Optometric`/`MedicalBusiness` block + real per-page breadcrumbs']);
art.push(['double robots metas', cnt((r) => r.robots.length > 1), 'an EyeCarePro robots meta plus the WordPress one', '**rebuild** one robots meta per page (indexing decisions later)']);
art.push(['soft-broken aliases', softBroken.length, 'section 10', '**redirect** each to its real page']);
art.push(['image from another EyeCarePro site', IMG.filter((i) => /\/sites\/(\d+)\//.test(i.src) && !i.src.includes('/sites/' + SITE_ID + '/')).length, IMG.filter((i) => /\/sites\/(\d+)\//.test(i.src) && !i.src.includes('/sites/' + SITE_ID + '/')).map((i) => code(fileOf(i.src)) + ' from `/wp-content/uploads/sites/' + /\/sites\/(\d+)\//.exec(i.src)[1] + '/` (this site is ' + SITE_ID + ') on ' + i.usedOn.map(pagePathOfUse).map(code).join(' ') + (failSet.has(i.src) ? ', and it failed: ' + failSet.get(i.src).reason : '')).join('; '), '**rebuild** with an own or generated image']);
P(table(['Path / item', 'Pages', 'What it is (evidence)', 'RECOMMENDATION'], art), '');

/* ---- 12 ---- */
P('## 12. Images (summary; details in `audit/image-inventory.json`)', '');
const failByHost = sortDesc(countBy(failures.items || [], (f) => hostOf(f.target) + ' ' + f.reason));
const failPages = uniq(imgFailed.flatMap((i) => i.usedOn.map(pagePathOfUse)));
const teamFail = uniq(imgFailed.flatMap((i) => i.usedOn.map(pagePathOfUse)).filter((p) => /^\/team\//.test(p) || p === '/the-staff/' || p === '/our-eye-doctors/'));
P('- **' + imgInv.counts.total + ' inventoried**, ' + imgInv.counts.downloaded + ' on disk (`assets/source/` holds ' + assetsOnDisk + ' files), ' + imgInv.counts.failed + ' failed, ' + imgInv.counts.duplicates + ' duplicate. Decisions: ' + Object.entries(imgInv.counts.byDecision).map(([k, v]) => k + ' ' + v).join(', ') + '. Formats: ' + Object.entries(imgInv.counts.byFormat).map(([k, v]) => k + ' ' + v).join(', ') + '. ' + (imgInv.counts.totalBytes / 1048576).toFixed(1) + ' MiB on disk.');
P('- **Roles**: ' + sortDesc(countBy(IMG, (i) => i.role)).map(([k, n]) => k + ' ' + n).join(', ') + '. **Flags**: ' + sortDesc(countBy(IMG.flatMap((i) => i.flags || []), (x) => x)).map(([k, n]) => k + ' ' + n).join(', ') + '. **Hosts**: ' + sortDesc(countBy(IMG, (i) => hostOf(i.src))).map(([k, n]) => k + ' ' + n).join(', ') + '. ' + IMG.filter((i) => i.usedOn.some((u) => u.startsWith('(css)'))).length + ' are referenced from CSS.');
P('- **Failures (`failures.json`, ' + (failures.items || []).length + ')**: ' + failByHost.map(([k, n]) => k + ' \u00d7' + n).join(', ') + '. So the CloudFront uploads CDN (`da4e1j5r7gw87.cloudfront.net`) refused **' + (failures.items || []).filter((f) => /cloudfront/.test(hostOf(f.target)) && /403/.test(f.reason)).length + '**. The other ' + (failures.items || []).filter((f) => !/cloudfront/.test(hostOf(f.target))).length + ' are ' + (failures.items || []).filter((f) => !/cloudfront/.test(hostOf(f.target))).map((f) => code(fileOf(f.target)) + ' on ' + hostOf(f.target) + ' (' + f.reason + '; role ' + ((IMG.find((i) => i.src === f.target) || {}).role || '?') + ')').join(' and ') + '. By role: ' + sortDesc(countBy(imgFailed, (i) => i.role)).map(([k, n]) => k + ' ' + n).join(', ') + '. They affect ' + failPages.length + ' pages (incl. ' + failPages.filter((p) => p.startsWith('(css)')).length + ' stylesheet).');
const homeFailed = HOME_ROWS.flatMap((x) => x.images.filter((i) => imgFailed.some((f) => fileOf(f.src) === i.file)).map((i) => 'row ' + x.index + ' (' + ((x.headings[0] || {}).text || x.kind) + '): ' + code(i.file)));
const teamPagesFailed = uniq(imgFailed.flatMap((i) => i.usedOn.map(pagePathOfUse)).filter((p) => /^\/team\//.test(p)));
P('- **Missing portraits**: the failed files include images used on ' + teamFail.map(code).join(' ') + '. That is the team pages of ' + teamPagesFailed.length + ' of the ' + famCount('team-member') + ' team members (' + teamPagesFailed.map((p) => '"' + ((REC_BY_PATH.get(p) || { h1: [''] }).h1[0]) + '"').join(', ') + '). On the home: ' + (homeFailed.join('; ') || 'none') + '. The redesign has no harvested file for those images. Do not substitute a generated face for a named person (open question).');
P('- **Images in main per family**: ' + FAMILY_IDS.map((id) => id + ' ' + FAM_MEMBERS.get(id).reduce((s, r) => s + r.images.filter((i) => i.region === 'main').length, 0)).join(', ') + '. Images without an `alt` attribute in main: ' + PAGE_RECS.reduce((s, r) => s + r.images.filter((i) => i.region === 'main' && i.alt == null).length, 0) + '; with `alt=""`: ' + PAGE_RECS.reduce((s, r) => s + r.images.filter((i) => i.region === 'main' && i.alt === '').length, 0) + '.', '');

/* ---- Appendices ---- */
P('## Appendix A. Extractor page types, URL depth and the full URL tree', '');
P('Page types as classified by `sr-extract` (`audit/architecture.json`; heuristic, so use the families in section 3 instead):', '');
P(table(['type', 'pages'], Object.entries(arch.pageTypes).sort((a, b) => b[1] - a[1]).map(([t, n]) => [t, n])), '');
P('URL depth (`architecture.json urlDepthHistogram`): ' + Object.entries(arch.urlDepthHistogram).map(([d, n]) => d + ':' + n).join(' \u00b7 ') + '.', '');
P('Every page the crawl found, grouped by path. Each line shows the family and the h1 (or the title when there is no h1).', '');
const treeRoot = { name: '/', kids: new Map(), rec: HOME };
for (const r of PAGE_RECS) { if (r.path === '/') continue; let node = treeRoot; seg(r).forEach((s, i, a) => { if (!node.kids.has(s)) node.kids.set(s, { name: s, kids: new Map(), rec: null }); node = node.kids.get(s); if (i === a.length - 1) node.rec = r; }); }
const tl = [];
const desc = (rec) => (rec ? ' \u2014 ' + trunc(rec.h1[0] || rec.title || '(no h1, no title)', 70) + '  `' + rec.family + '`' : '  *(no page at this path, folder only)*');
(function w(node, depth, pre) { const kids = [...node.kids.values()].sort((a, b) => (b.kids.size - a.kids.size) || a.name.localeCompare(b.name)); for (const k of kids) { tl.push('  '.repeat(depth) + '- `' + pre + k.name + '/`' + desc(k.rec)); w(k, depth + 1, pre + k.name + '/'); } })(treeRoot, 0, '/');
P('- `/`' + desc(HOME));
P(...tl, '');
P('## Appendix B. Most-linked pages and orphans', '');
P('Inbound internal links (`link-graph.json`, ' + linkGraph.edges.length + ' edges, chrome links included):', '');
// verify-arch fix: keep every page tied with the 15th row (the cut used to fall inside the 146 tie and drop /the-staff/)
P(table(['page', 'inbound links'], (() => { const s = [...inbound].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])); const cut = s.length > 15 ? s[14][1] : -1; return s.filter((x, i) => i < 15 || x[1] === cut); })().map(([u, n]) => [code(livePath(u)), n])), '');
P('Each count is edges in `link-graph.json` whose target is the page (one edge per linking page); a page\'s link to itself is included (' + linkGraph.edges.filter((e) => e.from === e.to).length + ' self-edges in the graph), so `/` reaches ' + (inbound.get(HOME.key) || 0) + ' = ' + linkGraph.edges.filter((e) => e.to === HOME.key && e.from !== e.to).length + ' other pages + ' + linkGraph.edges.filter((e) => e.to === HOME.key && e.from === e.to).length + ' self-edge.', '');
P('Orphans per `architecture.json` (no inbound link from another page): ' + arch.orphanPages.length + ': ' + arch.orphanPages.map((u) => code(livePath(u))).join(' ') + '. All are archives or templates.', '');
P('`architecture.json formsByAction` (extractor view, kept for reference; section 7 is authoritative): ' + arch.formsByAction.map((f) => code(f.action) + ' on ' + f.pages.length).join(', ') + '. The extractor finds forms by searching the raw text for `<form`, so it also counts that string inside inline scripts: this script finds ' + PAGE_RECS.reduce((s, r) => s + r.formTextInScripts, 0) + ' such occurrences inside `<script>` elements across the ' + N + ' pages, and ' + PAGE_RECS.reduce((s, r) => s + r.formKinds.length, 0) + ' real `<form>` elements (section 7). Treat the "(same page)" bucket as noise.', '');
P('## Appendix C. How this was computed', '');
P('- **Parser**: a dependency-free HTML tree builder (implied end tags, raw-text elements, foreign SVG) inlined in `tools/write-architecture.mjs`. It is a copy of `tmp/wf1/arch/lib-dom.mjs`: `tmp/wf1/arch/parser-equiv.mjs` checks that both build identical trees on all ' + N + ' raw pages, and `tmp/wf1/arch/test-dom.mjs` checks lib-dom on synthetic edge cases and requires its tag counts to equal regex counts for 14 element types on every raw page. The independent re-derivation of the load-bearing counts (regex over the raw bytes, plus positive controls for every zero-result detector) is `tmp/wf1/arch/verify.mjs`. The script also self-tests the parser and its CSS reader on every run and stops if either fails.');
P('- **Families**: `FAMILY_RULES` in the script (body classes `single-template`, `home`, `archive`, `single-post`, `single-team`, `single-testimonial`, `single-location`, `page`; presence of `div.ecp-secondary`, `div.gform_wrapper`, `div.ecp-posts-wrapper-post.ecp-view-summary`; paths for not-found / sitemap / legal). The partition check uses a mutation positive control.');
P('- **Chrome identity**: SHA-1 of the label/href/src sequence of `header.ecp-header` + `footer.ecp-footer` (and of `div.ecp-secondary` for the sidebar) per page.');
P('- **Row backgrounds**: node rules `.fl-node-<id> > .fl-row-content-wrap` (and `:after` overlays) read from `link[rel=stylesheet]` files mapped through `stylesheets.json` to `audit/css/`, plus every inline `<style>`. `rel="UNUSEDstylesheet"` is not loaded by a browser and is ignored.');
P('- **Leaks**: shortcodes `/\\[name attr=\'v\'\\]/` and bracketed template instructions in visible text nodes (outside head/script/style), placeholder phrases (555-555-5555, "(location description)", "Centerville Plaza", "name of practice", lorem ipsum) and empty `tel:` hrefs.');
P('- **Robots**: every `meta[name=robots]` is read, and a page is effectively noindex if any of them says noindex.');
P('- **Home computed-style capture**: ' + (capFiles.length && capErr.length ? capFiles.length + ' files named `tmp/capture/baseline/C-Program-Files-Git.*.json` stand where the home captures should be, and ' + capErr.length + ' of them record `url: chrome-error://chromewebdata/` (a Chrome network-error page), so there is **no valid capture of the home**.' : capIndexValid + ' `index.<width>.json` files in `tmp/capture/baseline` record the home URL' + (capHomeLogLines ? ' (written by the re-capture logged in `tmp/capture-home.log`, ' + capHomeLogLines + ' capture lines)' : '') + '.') + ' The first capture run was given `C:/Program Files/Git/` instead of `/` (' + capLogMangled + ' lines in `tmp/capture-run.log`; Git Bash path conversion, avoid with `MSYS_NO_PATHCONV=1`). This document does not depend on those captures: section 5 is read from `audit/raw/index.html`, the stylesheets and the `tmp/live/` screenshots.', '');
P('## Appendix D. Open questions and UNVERIFIED items', '');
P('1. Which sitemap file supplied the ' + (disc.sitemapUrlCount - N) + ' entries beyond the ' + N + ' objects (section 1). The bodies were not saved.');
P('2. The HTTP status of the 16 alias redirects (301 vs 302) and of the JSON-LD breadcrumb URL that was never crawled.');
P('3. Whether the ' + softBroken.length + ' aliases that land on the visual-hygiene blog post are a deliberate redirect rule or a platform catch-all. Same-slug candidates exist for ' + softBroken.filter((a) => candOf(a).length).length + ' of them (section 10); ' + softBroken.filter((a) => !candOf(a).length).map((a) => code(a.from)).join(' ') + ' have none.');
P('4. Whether to keep the home\'s mismatched card copy (section 5) and how to word the missing h1 of `/cherry-payment-plan/`.');
P('5. Portraits for the ' + teamPagesFailed.length + ' team members whose photos failed (section 12): recommendation is that the owner supplies them rather than generating faces of named people.');
P('6. The privacy-policy placeholder clause (section 11) needs owner or legal input.');
if (!(capIndexValid >= 4)) P('7. A valid home computed-style capture (Appendix C), if a later stage needs the live home\'s computed styles.', '');
else P('');

const MD = L.join('\n').replace(/\n{3,}/g, '\n\n');
function r0(a) { return uniq(a).map(code).join(', ') || '(none)'; }

/* =====================================================================================================================
 * 16. architecture-map.json
 * =================================================================================================================== */
const navOut = {
  topBar: { row: HEADER_ROWS[0].node, visibility: HEADER_ROWS[0].visibility, background: HEADER_ROWS[0].background, items: HEADER_ROWS[0].modules.map((m) => m.type === 'ecp-button' ? { kind: 'button', element: m.element, label: m.label, href: m.href, rawHref: m.rawHref, visibility: m.visibility } : { kind: 'text-link', text: m.text, links: m.links, visibility: m.visibility }) },
  logo: { file: logoM.img, host: logoM.imgHost, alt: logoM.alt, href: logoM.href },
  primary: PRIMARY.map(function strip(x) { return { label: x.label, href: x.href, children: x.children.map(strip) }; }),
  primaryCopiesInHeader: menuCopiesIdentical,
  menuConvertsAt: menuM.convertAt,
  mobile: { row: mobRow.node, visibility: mobRow.visibility, logo: { file: mobM.img, alt: mobM.alt }, buttons: mobM.buttons.map((b) => ({ ariaLabel: b.ariaLabel, href: b.href })), menu: 'same tree as primary', convertsAt: mobM.convertAt, hamburgerTrigger: 'a.ecp-menu-hamburger-trigger-button[aria-label="Toggle mobile menu"]', focusTrap: mobM.focusTrap },
  footer: {
    template: footerTemplateId,
    menus: FOOTER_ROWS.flatMap((r) => r.modules.filter((m) => m.type === 'ecp-menu').map((m) => ({ nav: m.navClass, items: m.tree.map((t) => ({ label: t.label, href: t.href })) }))),
    social: FOOTER_ROWS.flatMap((r) => r.modules.filter((m) => m.type === 'ecp-socialicons').flatMap((m) => m.icons)),
    buttons: FOOTER_ROWS.flatMap((r) => r.modules.filter((m) => m.type === 'ecp-button').map((m) => ({ label: m.label, href: m.href }))),
    voiceSearch: FOOTER_ROWS.flatMap((r) => r.modules.filter((m) => m.type === 'ecp-voice-search').map((m) => ({ formId: m.formId, action: m.action, method: m.method, label: m.label, inputName: m.inputName })))[0] || null,
    address: footerAddress,
    globalFooter: GLOBAL_FOOTER,
  },
  floating: [{ id: 'cherry-floating-estimator', element: 'div#floatingEstimator', pages: cnt((r) => r.floatingEstimator), config: cherryCfg, visibleLabelSource: 'injected by the Cherry script; not in any raw file; visible bottom right in tmp/live/home-1440.png, home-1440-s5.png and home-390.png (no second line at 390), not in slices s0-s4' }],
  skipLink: { label: ttext(skip), href: attr(skip, 'href') },
  identicalOnPages: (chromeVariants[0] || [0, 0])[1],
  sidebar: { pages: SIDEBAR_PAGES.length, variants: sidebarVariants.length, widgets: SIDEBAR.widgets },
};
const formsOut = GFORMS.map((g) => ({ kind: 'gravity-form', ...g, rawFile: 'audit/raw/' + (REC_BY_PATH.get(g.page) || {}).savedAs, fields: g.fields.map((fd) => ({ ...fd, selector: '#' + fd.id, description: fd.description ? words(fd.description, 11) : null, html: fd.html ? words(fd.html, 11) : null })) })).concat([
  { kind: 'search', where: 'sidebar widget search-3', element: 'form.ecp-search[role=search]', method: 'GET', action: SIDEBAR.widgets[0].search.action, fields: [{ label: SIDEBAR.widgets[0].search.label, type: 'search', name: 's' }], submit: SIDEBAR.widgets[0].search.button, pages: sideSearchPages },
  { kind: 'search', where: 'main (ecp-search module or no-results body)', element: 'form.ecp-search[role=search]', method: 'GET', action: SIDEBAR.widgets[0].search.action, pages: mainSearchPages.length, urls: mainSearchPages },
  { kind: 'voice-search', where: 'footer', element: 'form#voice_search.ecp-voice-search', method: 'GET', action: '/?s=', fields: [{ label: 'Speak Field', type: 'text', name: 's' }], pages: cnt((r) => r.voiceSearch) },
]);
const embedsOut = [
  { id: 'google-maps-embed', host: 'www.google.com/maps/embed/v1/place', q: mapQ, pages: mapPages.length, iframes: PAGE_RECS.reduce((s, r) => s + r.iframes.filter((f) => /\/maps\/embed/.test(f.path)).length, 0), where: Object.fromEntries(mapWhere) },
  { id: 'youtube-iframe', host: uniq(ytPages.flatMap((r) => r.iframes.filter((f) => /youtube/.test(f.host)).map((f) => f.host + f.path))), pages: ytPages.length, urls: ytPages.map((r) => r.path) },
  { id: 'self-hosted-video', files: (mediaInv.saved || []).map((m) => fileOf(m.url)), pages: vidPages.length, urls: vidPages.map((r) => r.path) },
  { id: 'reviews-module', pages: cnt((r) => r.reviewsModule), urls: pathsOf((r) => r.reviewsModule), carousel: carouselRow ? carouselRow.carousel[0] : null },
  { id: 'cherry', loader: cherryCfg.loader, pages: cnt((r) => r.cherry) },
  { id: 'google-tag-manager', ids: uniq(PAGE_RECS.flatMap((r) => r.gtm)), pages: cnt((r) => r.gtm.length), noscriptIframePages: cnt((r) => r.gtmNoscript) },
  { id: 'google-analytics-4', ids: uniq(PAGE_RECS.flatMap((r) => r.ga4)), pages: cnt((r) => r.ga4.length) },
  { id: 'google-ads-conversion', src: 'www.googleadservices.com/pagead/conversion_async.js', pages: cnt((r) => r.gads) },
  { id: 'recaptcha', src: 'www.google.com/recaptcha/api.js', pages: cnt((r) => r.recaptcha), urls: pathsOf((r) => r.recaptcha) },
  { id: 'akismet', pages: cnt((r) => r.akismet) },
  { id: 'google-fonts', families: fontFamiliesRequested, pages: cnt((r) => r.googleFonts.length) },
  { id: 'icon-font-eyecarepro-icons', stylesheet: '/wp-content/uploads/bb-plugin/icons/icon-1734360712/style.css', pages: cnt((r) => r.iconCss), urls: pathsOf((r) => r.iconCss) },
  { id: 'icon-font-foundation', pages: cnt((r) => r.foundicons), urls: pathsOf((r) => r.foundicons) },
  { id: 'wp-emoji', pages: cnt((r) => r.wpEmoji) },
];
const MAP = {
  schema: 'riverside/architecture-map@1',
  generator: 'tools/write-architecture.mjs',
  origin: ORIGIN,
  evidenceDate: site.generated,
  sources: ['audit/raw/*.html', 'audit/site-inventory.json', 'audit/content-inventory.json', 'audit/seo-inventory.json', 'audit/architecture.json', 'audit/link-graph.json', 'audit/image-inventory.json', 'audit/failures.json', 'audit/font-inventory.json', 'audit/media-inventory.json', 'audit/stylesheets.json', 'audit/source-cms.json', 'audit/css/'],
  counts: { pages: N, families: FAMILY_IDS.length, aliases: ALIAS_TO.size, sitemapLocEntries: disc.sitemapUrlCount, sidebarPages: SIDEBAR_PAGES.length, builderInMain: cnt((r) => r.builderInMain), effectiveNoindex: cnt(effNoindex) },
  partitionCheck: { crawled: N, placed: N - PARTITION_ERRORS.length, errors: PARTITION_ERRORS, positiveControl: PARTITION_CONTROL },
  sectionKinds: SECTION_KINDS,
  families: Object.fromEntries(FAMILY_IDS.map((id) => [id, { count: famCount(id), rule: FAMILY_RULES.find((f) => f.id === id).rule, markers: familyMarkers(FAM_MEMBERS.get(id)), urls: FAM_MEMBERS.get(id).map((r) => r.path) }])),
  pages: PAGE_RECS.map((r) => ({
    url: r.url, path: r.path, family: r.family, title: r.title, h1: r.h1, hasSidebar: r.hasSidebar,
    sections: r.sections,
    savedAs: r.savedAs, postType: r.postType, builder: r.builderInMain || r.builderBodyLevel, breadcrumb: r.breadcrumb, breadcrumbTrail: r.breadcrumbTrail,
    robots: r.robots, noindex: effNoindex(r), canonical: r.canonicals[0] || null, hasDescription: !!r.descriptions[0], jsonLd: uniq(r.jsonLd), wordCount: r.wordCount,
    aliases: (PAGE_BY_KEY.get(r.key).inv.aliases || []).map((a) => livePath(a)),
  })),
  nav: navOut,
  forms: formsOut,
  embeds: embedsOut,
  home: { rows: HOME_ROWS.map((x) => ({ index: x.index, node: x.node, visibility: x.visibility, kind: x.kind, width: x.width, bgClass: x.bgClass, background: x.background, modules: x.modules, headings: x.headings, images: x.images, ctas: x.ctas.map((c) => ({ kind: c.kind, label: c.label, href: c.href, target: c.target })), carousel: x.carousel[0] || null, galleryCaptions: x.galleryCaptions.length ? x.galleryCaptions : undefined, reviewNames: x.reviewNames.length ? x.reviewNames : undefined, reviewTimes: x.reviewTimes.length ? x.reviewTimes : undefined, postTitles: x.postTitles.length ? x.postTitles : undefined, teamNames: x.teamNames.length ? x.teamNames : undefined })) },
  aliases: ALIASES.map((a) => ({ from: a.from, to: a.to, referrers: uniq(a.referrers.map((x) => x.page)), softBroken: a.to === '/riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/' })),
  artefacts: art.map(([what, pages, evidence, rec]) => ({ what: what.replace(/`/g, ''), pages, evidence: evidence.replace(/`/g, ''), recommendation: rec.replace(/\*\*/g, '').replace(/`/g, '') })),
  seo: { robotsCombos: Object.fromEntries(robotsCombos), effectiveNoindex: pathsOf(effNoindex), canonicalOther: PAGE_RECS.filter((r) => r.canonicals.length && !selfCanon(r)).map((r) => ({ path: r.path, canonical: r.canonicals[0] })), canonicalMissing: pathsOf((r) => !r.canonicals.length), titleEmpty: pathsOf((r) => !r.title), titleDuplicates: DUP_TITLES.map(([t, v]) => ({ title: t, pages: v })), descriptionMissing: pathsOf((r) => !r.descriptions.length || !r.descriptions[0]), descriptionDuplicates: DUP_DESCS.map(([, v]) => v), ogTwitterEmpty: (() => { const e = {}; for (const r of PAGE_RECS) { for (const [k, v] of Object.entries(r.og)) if (!String(v).trim()) (e[k] = e[k] || []).push(r.path); for (const [k, v] of Object.entries(r.twitter)) if (!String(v).trim()) (e[k] = e[k] || []).push(r.path); } return e; })(), jsonLdTypes: Object.fromEntries(jsonLdTypes), jsonLdErrors: PAGE_RECS.filter((r) => r.jsonLdErrors.length).map((r) => ({ path: r.path, errors: r.jsonLdErrors })), breadcrumbList: BL_ITEMS },
  images: { counts: imgInv.counts, assetsSourceFiles: assetsOnDisk, failures: failByHost.map(([k, n]) => ({ key: k, count: n })), failedImagePages: failPages },
};
const JSON_OUT = JSON.stringify(MAP, null, 1) + '\n';

/* =====================================================================================================================
 * 17. Write / check
 * =================================================================================================================== */
// verify-arch: the "## Verification record" section that the independent verifier appends to the Markdown is not
// generated from evidence; it is carried forward verbatim from the file on disk, so a regeneration keeps the audit trail
// and --check still compares the whole file. Everything above that heading is regenerated as before.
const RECORD_HEAD = '\n## Verification record';
const MD_FINAL = (() => { const cur = exists(OUT_MD) ? rd(OUT_MD) : ''; const i = cur.indexOf(RECORD_HEAD); return i >= 0 ? MD.replace(/\n*$/, '\n') + '\n' + cur.slice(i + 1) : MD; })();
if (STDOUT) { process.stdout.write(MD_FINAL); process.exit(0); }
if (CHECK) {
  let drift = 0;
  for (const [f, s] of [[OUT_MD, MD_FINAL], [OUT_JSON, JSON_OUT]]) {
    const cur = exists(f) ? rd(f) : null;
    if (cur === s) { console.log('ok     ' + f + '  sha1 ' + sha(s)); continue; }
    drift++;
    const a = (cur || '').split('\n'); const b = s.split('\n');
    let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++;
    console.log('DRIFT  ' + f + '  first differing line ' + (k + 1) + '\n  disk: ' + (a[k] || '(eof)').slice(0, 160) + '\n  now:  ' + (b[k] || '(eof)').slice(0, 160));
  }
  process.exit(drift ? 1 : 0);
}
fs.mkdirSync(path.join(PROJ, 'docs'), { recursive: true });
fs.writeFileSync(path.join(PROJ, OUT_MD), MD_FINAL);
fs.writeFileSync(path.join(PROJ, OUT_JSON), JSON_OUT);
console.log(OUT_MD + '  ' + MD_FINAL.length + ' chars, sha1 ' + sha(MD_FINAL));
console.log(OUT_JSON + '  ' + JSON_OUT.length + ' chars, sha1 ' + sha(JSON_OUT) + ', ' + MAP.pages.length + ' pages, ' + FAMILY_IDS.length + ' families');
