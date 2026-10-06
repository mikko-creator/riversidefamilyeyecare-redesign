// screens-run.mjs — full-document screenshots for sr-pixeldiff, both sides, every configured width.
//   node tools/screens-run.mjs --side baseline|rebuild [--base http://127.0.0.1:8795]
// Writes audit/screens/<side>/<slug>.<width>.png. The FULL document is captured with
// captureBeyondViewport at the real viewport size: resizing the viewport to the document height
// (the usual trick) stretches every vh-sized hero to the whole page and compares a picture nobody
// sees. Asserts innerWidth and a 200 document before each shot.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SIDE = arg('side', 'rebuild');
const BASE = SIDE === 'baseline' ? 'https://www.riversidefamilyeyecare.com' : arg('base', 'http://127.0.0.1:8795');
const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project.json'), 'utf8'));
const WIDTHS = project.config.breakpoints;
const PATHS = arg('paths', '') ? arg('paths').split(',') : [
  '/', '/hours-location/', '/our-eye-doctors/', '/eye-care-services/', '/eye-care-services/eye-exams/',
  '/eyeglasses/designer-frames/', '/contact-lenses/', '/insurance/', '/contact-us/appointment-request-form/',
  '/top-causes-of-dry-eye-in-fort-myers/', '/whats-new/', '/disclaimer/', '/team/dr-brittany-degler-od/', '/eye-care-services/faq/',
];
const OUT = path.join(ROOT, 'audit', 'screens', SIDE);
fs.mkdirSync(OUT, { recursive: true });
const slug = (p) => (p.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-') || 'index');
const urlFor = (p) => (SIDE === 'rebuild' ? BASE + p + (p.endsWith('/') ? 'index.html' : '') : BASE + p);

const b = await launch({ port: 0 });
try {
  for (const w of WIDTHS) {
    const pg = await b.newPage({ width: w, height: 900, mobile: false });
    await pg.send('Network.setBlockedURLs', { urls: ['*google-analytics.com*', '*googletagmanager.com*', '*doubleclick.net*', '*facebook.net*'] });
    let status = 0;
    b.on((m) => { if (m.sessionId === pg.sessionId && m.method === 'Network.responseReceived' && m.params.type === 'Document') status = m.params.response.status; });
    for (const p of PATHS) {
      status = 0;
      await pg.goto(urlFor(p), { settle: SIDE === 'baseline' ? 3000 : 800, timeout: 60000 });
      if (status !== 200) throw new Error('document status ' + status + ' for ' + p);
      const iw = await pg.eval('innerWidth');
      if (iw !== w) throw new Error('viewport not applied: ' + iw + ' != ' + w);
      await pg.eval(`(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.8)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); return true; })()`, { timeout: 120000 });
      if (SIDE === 'rebuild') await pg.eval(`(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in')); const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(s); return true; })()`);
      await pg.eval(`Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 6000); })))`, { timeout: 30000 });
      await sleep(300);
      const H = Math.min(16000, await pg.eval('document.documentElement.scrollHeight'));
      const r = await pg.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: H, scale: 1 } });
      const file = path.join(OUT, slug(p) + '.' + w + '.png');
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
      console.log(SIDE, w, p, H + 'px');
      if (SIDE === 'baseline') await sleep(1200);
    }
    await b.send('Target.closeTarget', { targetId: pg.targetId }).catch(() => {});
  }
} finally { await b.close(); process.exit(0); }
