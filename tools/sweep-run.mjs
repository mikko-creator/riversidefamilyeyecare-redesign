// sweep-run.mjs — drives sr-sweep's IIFE (sr-sweep.mjs --emit) through headless Chrome, one page per
// template at every configured breakpoint, and merges each result with sr-sweep --merge.
//   node tools/sweep-run.mjs --side rebuild   [--base http://127.0.0.1:8795]
//   node tools/sweep-run.mjs --side baseline  (the live site, sequential, 1.5 s apart)
// Guards: the document must answer 200, innerWidth must equal the breakpoint (mobile:false), and the
// page is scrolled top->bottom->top first so lazy images load and scroll reveals have run. The
// rebuild is measured with transitions and animations disabled AFTER the reveals have fired, so no
// reading is taken mid-flight (memory: sweep majors from motion state).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(os.homedir(), '.claude', 'skills', 'site-reforge', 'scripts');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SIDE = arg('side', 'rebuild');
if (!/^(rebuild|baseline)$/.test(SIDE)) throw new Error('--side rebuild|baseline');
const BASE = SIDE === 'baseline' ? 'https://www.riversidefamilyeyecare.com' : arg('base', 'http://127.0.0.1:8795');
const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project.json'), 'utf8'));
const WIDTHS = arg('widths', '') ? arg('widths').split(',').map(Number) : project.config.breakpoints;
const PATHS = arg('paths', '') ? arg('paths').split(',') : [
  '/', '/hours-location/', '/our-eye-doctors/', '/eye-care-services/', '/eye-care-services/eye-exams/',
  '/eyeglasses/designer-frames/', '/contact-lenses/', '/insurance/', '/contact-us/appointment-request-form/',
  '/top-causes-of-dry-eye-in-fort-myers/', '/whats-new/', '/disclaimer/', '/team/dr-brittany-degler-od/', '/eye-care-services/faq/',
];
const SWEEP = execFileSync(process.execPath, [path.join(SKILL, 'sr-sweep.mjs'), '--emit'], { encoding: 'utf8' });
const OUT = path.join(ROOT, 'tmp', 'sweeps', SIDE);
fs.mkdirSync(OUT, { recursive: true });
const slug = (p) => (p.replace(/^\/+|\/+$/g, '').replace(/[^A-Za-z0-9]+/g, '-') || 'index');
const urlFor = (p) => (SIDE === 'rebuild' ? BASE + p + (p.endsWith('/') ? 'index.html' : '') : BASE + p);

const b = await launch({ port: 0 });
const log = [];
try {
  for (const w of WIDTHS) {
    const pg = await b.newPage({ width: w, height: 900, mobile: false });
    await pg.send('Network.setBlockedURLs', { urls: ['*google-analytics.com*', '*googletagmanager.com*', '*doubleclick.net*', '*facebook.net*', '*hotjar*', '*clarity.ms*'] });
    let status = 0;
    const onResp = (m) => { if (m.sessionId === pg.sessionId && m.method === 'Network.responseReceived' && m.params.type === 'Document') status = m.params.response.status; };
    b.on(onResp);
    for (const p of PATHS) {
      status = 0;
      const href = await pg.goto(urlFor(p), { settle: SIDE === 'baseline' ? 3500 : 900, timeout: 60000 });
      if (status !== 200) throw new Error(`document status ${status} for ${href}`);
      const iw = await pg.eval('window.innerWidth');
      if (iw !== w) throw new Error(`viewport not applied: wanted ${w} got ${iw} on ${p}`);
      await pg.eval(`(async () => { document.documentElement.style.scrollBehavior = 'auto'; const H = () => document.documentElement.scrollHeight; for (let y = 0; y < H(); y += Math.round(innerHeight * 0.8)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); } scrollTo(0, H()); await new Promise(r => setTimeout(r, 400)); scrollTo(0, 0); for (let i = 0; i < 40 && scrollY !== 0; i++) await new Promise(r => setTimeout(r, 50)); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); if (scrollY !== 0) throw new Error('did not return to top: ' + scrollY); return true; })()`, { timeout: 120000 });
      if (SIDE === 'rebuild') {
        // settle every reveal, then freeze motion so geometry is read at rest, not mid-transition
        await pg.eval(`(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in')); const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(s); return true; })()`);
        await sleep(150);
      }
      const res = await pg.eval(SWEEP, { timeout: 120000 });
      if (!res || res.schema !== 'site-reforge/sweep@1') throw new Error('sweep returned no result on ' + p);
      if (res.viewport.w !== w) throw new Error(`sweep viewport ${res.viewport.w} != ${w} on ${p}`);
      const label = slug(p) + '.' + w;
      const file = path.join(OUT, label + '.json');
      fs.writeFileSync(file, JSON.stringify(res));
      execFileSync(process.execPath, [path.join(SKILL, 'sr-sweep.mjs'), '--project', ROOT, '--merge', file, '--label', label, ...(SIDE === 'baseline' ? ['--side', 'baseline'] : [])], { stdio: 'pipe' });
      log.push({ path: p, w, counts: res.counts, docW: res.documentScrollWidth });
      console.log(SIDE, String(w).padStart(4), p.padEnd(48).slice(0, 48), JSON.stringify(res.counts), res.documentScrollWidth > w ? 'OVERFLOW ' + res.documentScrollWidth : '');
      if (SIDE === 'baseline') await sleep(1500);
    }
    await b.send('Target.closeTarget', { targetId: pg.targetId }).catch(() => {});
  }
} finally {
  fs.writeFileSync(path.join(OUT, '_run.json'), JSON.stringify({ side: SIDE, base: BASE, widths: WIDTHS, paths: PATHS, results: log }, null, 1));
  await b.close();
  process.exit(0);
}
