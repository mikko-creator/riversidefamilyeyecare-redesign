// link-check.mjs — every LOCAL reference in the built site resolves to a file.
// Walks $RFEC_DIST (default dist/): every href / src / srcset / poster / action value in each .html
// file, every url(...) and @import in each .css file. External schemes (http:, https:, mailto:,
// tel:, data:, javascript:) are skipped and counted. A local reference is resolved against the
// referring file's directory (page-relative URLs are the contract: the site must work from any
// directory or subpath), its ?query and #fragment are dropped, and the target must be an existing
// file (a directory resolves to its index.html). Root-absolute references ("/x") are findings on
// their own: they break a subpath deploy.
// Exception (COMPONENTS F.7, QA VIB-01): dist/404.html is served by the host at the failing request's own path,
// at any depth, so in THAT file every local reference must be root-relative: "/x" is resolved against the dist
// root, and a page-relative reference is a finding (kind page-relative-in-404).
// Fix round 2 (D7): those root-relative URLs sit under the deploy base the build was given (RFEC_BASE, default "/":
// the domain root); in 404.html a root-relative URL outside that base is a finding (outside-base), and one inside it
// is resolved against the dist root after the base.
// Same-page fragments (href="#id") must name an element id on that page.
// Positive controls: a planted missing file, a planted root-absolute href and a planted dead
// fragment must each be reported; the run exits 1 if any control does not fire.
//   node tools/link-check.mjs [--dir dist-neo]  -> audit/link-check.json (exit 1 on any broken reference)
//   --dir <dir> (resolved against the current directory) wins over $RFEC_DIST; either one skips the audit/ report.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
if (process.argv.includes('--dir') && !DIR_OPT) throw new Error('--dir needs a directory');
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(ROOT, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const EXTERNAL = /^(https?:|mailto:|tel:|data:|javascript:|about:|blob:)/i;
const BASE = process.env.RFEC_BASE || '/';
if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(BASE)) throw new Error('RFEC_BASE must be a path that starts and ends with "/": ' + BASE);

function listFiles(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, base, out); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}
const decodeAttr = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function refsOfHtml(html) {
  const out = [];
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.replace(/>[\s\S]*<\/script>$/i, '></script>'));
  for (const m of body.matchAll(/\s(href|src|poster|action|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) out.push({ attr: m[1].toLowerCase(), value: decodeAttr(m[2] !== undefined ? m[2] : m[3]) });
  for (const m of body.matchAll(/\s(srcset|imagesrcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const part of decodeAttr(m[2] !== undefined ? m[2] : m[3]).split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) out.push({ attr: m[1].toLowerCase(), value: u }); }
  }
  for (const m of body.matchAll(/style\s*=\s*"([^"]*)"/gi)) for (const u of m[1].matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) out.push({ attr: 'style-url', value: decodeAttr(u[1]) });
  return out;
}
function refsOfCss(css) {
  const out = [];
  const c = css.replace(/\/\*[\s\S]*?\*\//g, '');
  /* a quoted url() is ONE token up to its own closing quote (2026-09-29, neo build): the looser pattern stopped at the
     first quote of either kind, so an SVG data URI holding filter='url(%23n)' was read as two references and its
     in-document fragment reported as a missing file. Unquoted values end at whitespace or ')'. */
  for (const m of c.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'")\s]+))\s*\)/gi)) out.push({ attr: 'css-url', value: (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]).trim() });
  for (const m of c.matchAll(/@import\s+['"]([^'"]+)['"]/gi)) out.push({ attr: 'css-import', value: m[1].trim() });
  return out;
}
const idsOf = (html) => new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]));

function checkFile(rel, text, exists) {
  const problems = [];
  const rootOnly = rel === '404.html';   /* F.7: served at any depth */
  let local = 0, external = 0;
  const isHtml = /\.html?$/i.test(rel);
  const refs = isHtml ? refsOfHtml(text) : refsOfCss(text);
  const ids = isHtml ? idsOf(text) : null;
  for (const r of refs) {
    const v = r.value.trim();
    if (!v) { if (r.attr === 'href' || r.attr === 'src') problems.push({ kind: 'empty', attr: r.attr, value: v }); continue; }
    if (EXTERNAL.test(v)) { external++; continue; }
    if (/^\/\//.test(v)) { external++; continue; }
    if (v.startsWith('#')) {
      if (isHtml && r.attr === 'href' && v.length > 1 && !ids.has(decodeURIComponent(v.slice(1)))) problems.push({ kind: 'dead-fragment', attr: r.attr, value: v });
      continue;
    }
    local++;
    if (rootOnly && isHtml && !v.startsWith('/')) { problems.push({ kind: 'page-relative-in-404', attr: r.attr, value: v }); continue; }
    if (v.startsWith('/') && !(rootOnly && isHtml)) { problems.push({ kind: 'root-absolute', attr: r.attr, value: v }); continue; }
    if (v.startsWith('/') && !v.startsWith(BASE)) { problems.push({ kind: 'outside-base', attr: r.attr, value: v }); continue; }
    const clean = decodeURIComponent(v.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = v.startsWith('/') ? path.posix.normalize(clean.slice(BASE.length).replace(/^\/+/, '') || '.') : path.posix.normalize(path.posix.join(path.posix.dirname(rel), clean));
    if (target.startsWith('..')) { problems.push({ kind: 'escapes-root', attr: r.attr, value: v }); continue; }
    const candidates = clean.endsWith('/') ? [(target === '.' ? '' : target.replace(/\/?$/, '/')) + 'index.html'] : [target, target + '/index.html'];
    if (!candidates.some((c) => exists(c))) problems.push({ kind: 'missing', attr: r.attr, value: v, resolved: target });
  }
  return { problems, local, external };
}

const files = listFiles(DIST);
const fileSet = new Set(files);
const exists = (p) => fileSet.has(p.replace(/^\.\//, ''));
let local = 0, external = 0, checked = 0;
const broken = [];
for (const rel of files) {
  if (!/\.(html?|css)$/i.test(rel)) continue;
  checked++;
  const r = checkFile(rel, fs.readFileSync(path.join(DIST, rel), 'utf8'), exists);
  local += r.local; external += r.external;
  for (const p of r.problems) broken.push({ file: rel, ...p });
}

/* positive controls, in memory */
const ctlHtml = '<a href="nope/index.html">x</a><a href="/abs/">y</a><a href="#missing-id">z</a><img src="img/nothing.webp" alt="">';
const ctl = checkFile('ctl/index.html', ctlHtml, exists).problems;
/* the 404 exception: a root-relative link that resolves passes; a missing one and a page-relative one are reported */
/* the planted "existing" stylesheet is whichever one the build shipped (the scaffold ships styles/scaffold.css; the
   design theme ships theme/riverlight.<hash>.css, DESIGN-SPEC 4.3 P2, wf5b) */
const shippedCss = (files.find((f) => /^(?:styles|theme)\/[^/]+\.css$/.test(f)) || 'styles/site.css');
const ctl404Html = '<a href="' + BASE + '">home</a><a href="' + BASE + shippedCss + '">css</a><link href="' + BASE + 'styles/nope.css"><a href="index.html">rel</a>' + (BASE !== '/' ? '<a href="/elsewhere/">out</a>' : '');
const ctl404 = checkFile('404.html', ctl404Html, exists).problems;
const fired404 = !ctl404.some((p) => p.value === BASE || p.value === BASE + shippedCss) && ctl404.some((p) => p.kind === 'missing' && p.value === BASE + 'styles/nope.css') && ctl404.some((p) => p.kind === 'page-relative-in-404' && p.value === 'index.html')
  && (BASE === '/' || ctl404.some((p) => p.kind === 'outside-base' && p.value === '/elsewhere/'));
/* CSS: a missing quoted and unquoted url() are reported; an SVG data URI's own url(%23n) fragment is not a reference */
const ctlCss = checkFile('styles/ctl.css', ".a{background:url(\"../img/none-1.webp\")}.b{background:url(../img/none-2.webp)}.c{--g:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect filter='url(%23n)'/%3E%3C/svg%3E\")}", exists).problems;
const firedCss = ctlCss.length === 2 && ctlCss.some((p) => p.value === '../img/none-1.webp') && ctlCss.some((p) => p.value === '../img/none-2.webp');
const fired = fired404 && firedCss && ctl.some((p) => p.kind === 'missing' && p.value === 'nope/index.html') && ctl.some((p) => p.kind === 'root-absolute') && ctl.some((p) => p.kind === 'dead-fragment') && ctl.some((p) => p.kind === 'missing' && p.attr === 'src');

const byKind = broken.reduce((a, b) => { a[b.kind] = (a[b.kind] || 0) + 1; return a; }, {});
const out = { schema: 'rfec/link-check@1', generated: new Date().toISOString(), dist: DIST, base404: BASE, filesChecked: checked, localRefs: local, externalRefsSkipped: external, broken: broken.length, byKind, control: { planted: ctlHtml, reported: ctl, planted404: ctl404Html, reported404: ctl404, fired }, findings: broken.slice(0, 2000) };
if (WRITE_AUDIT) fs.writeFileSync(path.join(ROOT, 'audit/link-check.json'), JSON.stringify(out, null, 1));
console.log('files', checked, '· local refs', local, '· external skipped', external, '· broken', broken.length, JSON.stringify(byKind), '· control', fired ? 'fired' : 'DID NOT FIRE');
for (const b of broken.slice(0, 15)) console.log('  ' + b.file + '  ' + b.kind + ' ' + b.attr + '=' + b.value);
if (broken.length || !fired) process.exit(1);
