// residue-grep.mjs - no string of the reference practice (R, docs/PORT-NOTES.md) survives anywhere in what this
// workspace builds or ships: its name, city, doctor, street, phone, ZIP or domain.
// Scope: src/, dist/, tools/, facts/, docs/BUILD-NOTES.md, docs/OPEN-DECISIONS.md (evidence under audit/ and the
// stage reports docs/PORT-NOTES.md, docs/FACTS-EVIDENCE.md, docs/IMAGE-INVENTORY.md describe R on purpose and are
// not scanned). Binary files are skipped by extension.
// Positive controls: (1) the same patterns run over a planted string must fire; (2) when the reference workspace
// is present beside this one (read only), its raw home page must fire too.
//   node tools/residue-grep.mjs [--dir <extra dir>]   -> exit 1 on any hit or a control that does not fire
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* the needles are assembled from parts so this file does not match itself */
const parts = [['clif', 'ton'], ['boss', 'ier'], ['dea', 'na'], ['chinab', 'erry'], ['318-?550', '-?5815'], ['711', '11'], ['louisi', 'ana']];
const RE = new RegExp(parts.map((p) => p.join('')).join('|'), 'i');
const TEXT = /\.(html?|css|js|mjs|cjs|json|txt|md|xml|svg|htaccess)$|(^|\/)_redirects$/i;
const extra = process.argv.includes('--dir') ? [path.resolve(process.argv[process.argv.indexOf('--dir') + 1])] : [];
const targets = ['src', 'dist', 'tools', 'facts', 'docs/BUILD-NOTES.md', 'docs/OPEN-DECISIONS.md'].map((t) => path.join(ROOT, t)).concat(extra);

function* files(p) {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isFile()) { yield p; return; }
  for (const e of fs.readdirSync(p, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) yield* files(path.join(p, e.name));
}
const hits = [];
let scanned = 0;
for (const t of targets) for (const f of files(t)) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  if (!TEXT.test(rel)) continue;
  scanned++;
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => { const m = RE.exec(line); if (m) hits.push({ file: rel, line: i + 1, match: m[0], excerpt: line.trim().slice(0, 160) }); });
}
const planted = 'Welcome to ' + parts[0].join('') + ' Eye Center';
const control1 = RE.test(planted);
const refRaw = path.resolve(ROOT, '..', parts[0].join('') + 'eyecenter-reforge', 'audit', 'raw', 'index.html');
const control2 = fs.existsSync(refRaw) ? RE.test(fs.readFileSync(refRaw, 'utf8')) : null;
console.log('scanned', scanned, 'files · hits', hits.length, '· control (planted)', control1 ? 'fired' : 'DID NOT FIRE', '· control (reference raw home)', control2 === null ? 'n/a (reference absent)' : control2 ? 'fired' : 'DID NOT FIRE');
for (const h of hits.slice(0, 30)) console.log('  ' + h.file + ':' + h.line + '  ' + JSON.stringify(h.match) + '  ' + h.excerpt);
if (hits.length || !control1 || control2 === false) process.exit(1);
