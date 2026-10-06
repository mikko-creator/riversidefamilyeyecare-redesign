// capture-run.mjs — run site-reforge's computed-style harvest (and the scroll-delta pass) in a real
// headless Chrome at each breakpoint, and write each result where sr-capture --merge can fold it in.
//   node tools/capture-run.mjs --side baseline --base https://www.riversidefamilyeyecare.com --pages /,/hours-location/ --widths 390,768,1024,1440 [--scroll /]
// Asserts innerWidth === the intended width before every harvest (a silent resize is the classic lie).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = process.env.SR_SKILL_DIR
  ? path.join(process.env.SR_SKILL_DIR, 'scripts', 'sr-capture.mjs')
  : path.join(os.homedir(), '.claude', 'skills', 'site-reforge', 'scripts', 'sr-capture.mjs');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? a.concat([[v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]]) : a), []));
// Only the two real sides; anything else used to fall through to 'baseline' and could overwrite the source evidence.
if (!['baseline', 'rebuild', 'scratch'].includes(args.side)) throw new Error('--side must be baseline, rebuild or scratch (got ' + JSON.stringify(args.side) + ')');
const side = args.side;
const base = String(args.base).replace(/\/$/, '');
const pages = String(args.pages || '/').split(',');
const widths = String(args.widths || '390,768,1024,1440').split(',').map(Number);
const scrollPages = args.scroll ? String(args.scroll).split(',') : [];
const harvest = execFileSync(process.execPath, [SKILL, '--emit'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const scroll = execFileSync(process.execPath, [SKILL, '--emit-scroll'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const OUT = path.join(PROJ, 'tmp/capture', side);
fs.mkdirSync(OUT, { recursive: true });
const slug = (p) => (p.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index');

const b = await launch({ port: 0 });
const written = [];
try {
  const pg = await b.newPage({ width: widths[0], height: 900 });
  await pg.send('Network.setBlockedURLs', { urls: ['*google-analytics.com*', '*googletagmanager.com*', '*doubleclick.net*', '*facebook.net*', '*hotjar*'] });
  for (const p of pages) {
    for (const w of widths) {
      await pg.viewport(w, w < 700 ? 844 : 900, false);
      // Fail closed on a page that did not load from the target origin. A Git Bash "/" argument once became
      // "C:/Program Files/Git/" and this runner saved a chrome-error://chromewebdata/ page as the home's evidence.
      if (!p.startsWith('/')) throw new Error(`page path must start with "/": got ${JSON.stringify(p)} (run with MSYS_NO_PATHCONV=1)`);
      const href = await pg.goto(base + p, { settle: 1500, timeout: 60000 });
      if (new URL(href).origin !== new URL(base).origin) throw new Error(`loaded ${href}, not ${base}${p}: refusing to save a capture from another origin`);
      const iw = await pg.eval('innerWidth');
      if (iw !== w) throw new Error(`viewport not applied at ${p}: wanted ${w} got ${iw}`);
      await pg.eval('document.fonts.ready.then(() => true)');
      const data = await pg.eval(harvest.trim().replace(/;\s*$/, ''), { timeout: 120000 });
      const f = path.join(OUT, `${slug(p)}.${w}.json`);
      fs.writeFileSync(f, JSON.stringify(data));
      written.push(f);
      console.log('capture', p, w, (fs.statSync(f).size / 1024).toFixed(0) + 'KB', 'viewport', JSON.stringify(data.viewport || {}));
      if (scrollPages.includes(p) && (w === 1440 || w === 390)) {
        const sdata = await pg.eval(scroll.trim().replace(/;\s*$/, ''), { timeout: 180000 });
        const sf = path.join(OUT, `${slug(p)}.${w}.scroll.json`);
        fs.writeFileSync(sf, JSON.stringify(sdata));
        written.push(sf);
        console.log('scroll ', p, w, (fs.statSync(sf).size / 1024).toFixed(0) + 'KB');
      }
    }
  }
} finally { await b.close(); }
fs.writeFileSync(path.join(OUT, '_written.json'), JSON.stringify(written, null, 1));
console.log('wrote', written.length, 'captures ->', path.relative(PROJ, OUT));
process.exit(0);
