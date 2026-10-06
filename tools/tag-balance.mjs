// tag-balance.mjs — every built page's elements open and close in order. A browser silently
// "repairs" a stray or missing close tag, so no text-parity or overflow check can see one; this
// walks the raw markup with a stack. Void elements and <script>/<style>/<template> bodies are
// skipped; optional end tags (p, li, dt, dd, option, tr, td, th, thead, tbody) are closed the way
// the HTML parser closes them only where the spec allows it — anything else is a finding.
// Also flags block elements nested inside <p> (the parser would close the <p> early), and any end tag of a void
// element (kind void-close: "</br>", which the parser reads as a second <br>; fix round 1, D1).
// Control: the same check run on a planted unclosed <div>, a <div> in a <p> and a "</br>" must report each.
// Ported from the friscoeyesource reference; ROOT fixed (tools/ sits at the project root here) and
// $RFEC_DIST honoured; --dir <dir> (resolved against the current directory) wins over it. Either one skips the audit/ report.
//   node tools/tag-balance.mjs [--dir dist-neo]   -> audit/tag-balance.json (exit 1 on any finding or a failed control)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
if (process.argv.includes('--dir') && !DIR_OPT) throw new Error('--dir needs a directory');
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(ROOT, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const OPTIONAL = new Set(['p', 'li', 'dt', 'dd', 'option', 'tr', 'td', 'th', 'thead', 'tbody']);
const CLOSES_P = new Set(['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul']);

export function check(html) {
  const s = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '<$1></$1>');
  const stack = []; const problems = [];
  for (const m of s.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g)) {
    const close = m[1] === '/'; const tag = m[2].toLowerCase();
    /* an end tag of a void element ("</br>") is never valid; the parser turns </br> into a second <br> */
    if (VOID.has(tag) && close) { problems.push({ kind: 'void-close', tag, at: m.index }); continue; }
    if (VOID.has(tag) || (!close && m[3] === '/' && /^(svg|path|circle|rect|line|polyline|polygon|ellipse|use|stop)$/.test(tag))) continue;
    if (!close) {
      if (CLOSES_P.has(tag) && stack.length && stack[stack.length - 1].tag === 'p') problems.push({ kind: 'block-in-p', tag, at: m.index });
      stack.push({ tag, at: m.index }); continue;
    }
    let i = stack.length - 1;
    while (i >= 0 && stack[i].tag !== tag && OPTIONAL.has(stack[i].tag)) i--;
    if (i >= 0 && stack[i].tag === tag) { stack.length = i; continue; }
    problems.push({ kind: 'stray-close', tag, at: m.index, open: stack.slice(-3).map((x) => x.tag).join('>') });
  }
  for (const x of stack) if (!OPTIONAL.has(x.tag) && !/^(html|body|head)$/.test(x.tag)) problems.push({ kind: 'unclosed', tag: x.tag, at: x.at });
  return problems;
}

const files = [];
(function walk(d, r) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const x = r ? r + '/' + e.name : e.name; if (e.isDirectory()) walk(path.join(d, e.name), x); else if (e.name.endsWith('.html')) files.push(x); } }(DIST, ''));
const findings = [];
const pagesWith = new Set();
for (const f of files) {
  const html = fs.readFileSync(path.join(DIST, f), 'utf8');
  for (const p of check(html)) { findings.push({ file: f, ...p, context: html.slice(Math.max(0, p.at - 60), p.at + 60).replace(/\s+/g, ' ') }); pagesWith.add(f); }
}
const control = check('<main><section><div class="a"><p>x</p></section></main>');
const control2 = check('<p>a<div>b</div></p>');
const control3 = check('<h2>Meet Our Optometrist, </br> Dr. X</h2>');
const fired = control.some((p) => p.tag === 'div' || p.tag === 'section') && control2.some((p) => p.kind === 'block-in-p') && control3.some((p) => p.kind === 'void-close' && p.tag === 'br');
if (WRITE_AUDIT) fs.writeFileSync(path.join(ROOT, 'audit/tag-balance.json'), JSON.stringify({ schema: 'rfec/tag-balance@1', generated: new Date().toISOString(), dist: DIST, pages: files.length, unbalancedPages: pagesWith.size, findings, control: { input: 'unclosed <div> inside <section>; <div> inside <p>; </br> in a heading', reported: [...control, ...control2, ...control3], fired } }, null, 1));
console.log('pages', files.length, '· unbalanced pages', pagesWith.size, '· findings', findings.length, '· control', fired ? 'fired (' + [...control, ...control2, ...control3].map((p) => p.kind + ' ' + p.tag).join(', ') + ')' : 'DID NOT FIRE');
for (const f of findings.slice(0, 12)) console.log('  ' + f.file + ' ' + f.kind + ' <' + f.tag + '> … ' + f.context);
if (findings.length || !fired) process.exit(1);
