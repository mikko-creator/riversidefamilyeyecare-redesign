// run-gates.mjs - run every content-pipeline gate on dist/ (or --dir) and print one summary line per gate.
// Each gate is its own script with its own positive control; this runner only runs them in order and reports
// exit codes plus the gate's last summary lines. Exit 1 if any gate fails.
//   node tools/run-gates.mjs [--dir <dir>] [--skip-decontaminate]
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirArg = process.argv.includes('--dir') ? ['--dir', process.argv[process.argv.indexOf('--dir') + 1]] : [];
const dist = dirArg.length ? path.resolve(dirArg[1]) : path.join(ROOT, 'dist');
const decon = path.join(os.homedir(), '.claude', 'skills', 'site-reforge', 'scripts', 'sr-decontaminate.mjs');
const gates = [
  ['sentence-parity', ['tools/sentence-parity.mjs', ...dirArg]],
  ['short-text-parity', ['tools/short-text-parity.mjs', ...dirArg]],
  ['heading-parity', ['tools/heading-parity.mjs', ...dirArg]],
  ['tag-balance', ['tools/tag-balance.mjs', ...dirArg]],
  ['link-check', ['tools/link-check.mjs', ...dirArg]],
  ['link-parity', ['tools/link-parity.mjs', ...dirArg]],
  ['keep-image-parity', ['tools/keep-image-parity.mjs', ...dirArg]],
  ['seo-parity', ['tools/seo-parity.mjs', ...dirArg]],
  ['words-added', ['tools/words-added.mjs', ...dirArg]],
  ['residue-grep', ['tools/residue-grep.mjs']],
];
/* the page-model contract check reads tmp/page-models/ (node src/build.mjs --dump-models) */
if (fs.existsSync(path.join(ROOT, 'tmp/page-models'))) gates.push(['model-check', ['tools/model-check.mjs', ...dirArg]]);
if (!process.argv.includes('--skip-decontaminate') && fs.existsSync(decon)) gates.push(['sr-decontaminate', [decon, '--project', '.', '--dir', path.relative(ROOT, dist) || 'dist', '--strict']]);
let failed = 0;
for (const [name, argv] of gates) {
  const r = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
  const lines = (String(r.stdout || '') + String(r.stderr || '')).trim().split(/\r?\n/).filter(Boolean);
  const summary = lines.filter((l) => !/^\s+-\s|^\s{2}\[/.test(l)).slice(0, 4).join(' | ');
  if (r.status !== 0) failed++;
  console.log((r.status === 0 ? 'PASS ' : 'FAIL ') + name.padEnd(18) + summary.slice(0, 600));
}
console.log(failed ? failed + ' gate(s) FAILED' : 'all ' + gates.length + ' gates PASS');
process.exit(failed ? 1 : 0);
