// render-check.mjs - load built pages in ONE headless Chrome (tools/cdp.mjs) at each width and report, per page:
// uncaught exceptions + console errors, failed requests (network errors and HTTP >= 400, same-origin and third-party
// listed apart), horizontal overflow (scrollWidth > innerWidth), the number of <h1>, and images that did not decode.
// --cherry also probes /cherry-payment-plan/: whether the Cherry widget, loaded exactly as the source loads it,
// renders standalone (its mount points #hero / #calculator / #howitworks / #faq receive content) and which
// third-party hosts it contacted.
// Positive control (--control): a data: page that throws, overflows and has a broken image must be reported.
// The browser is closed in finally; the script always ends with process.exit().
//   node tools/render-check.mjs --base http://127.0.0.1:8795 --paths /,/contact-us/ [--widths 1280,390] [--cherry] [--control] [--out file.json]
import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? a.concat([[v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]]) : a), []));
const base = String(args.base || 'http://127.0.0.1:8795').replace(/\/$/, '');
const paths = String(args.paths || '/').split(',').filter(Boolean);
const widths = String(args.widths || '1280,390').split(',').map(Number);
const results = [];
let b;
async function check(url, width, { cherry = false, settle = 900 } = {}) {
  const pg = await b.newPage({ width, height: 900, mobile: width < 600 });
  const errs = [], failed = [], hosts = new Set();
  b.on((m) => {
    if (m.sessionId !== pg.sessionId) return;
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errs.push('EXCEPTION ' + ((d.exception && d.exception.description) || d.text).split('\n')[0]); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('console.error ' + m.params.args.map((a) => a.value || a.description).join(' ').slice(0, 200));
    if (m.method === 'Network.requestWillBeSent') { try { hosts.add(new URL(m.params.request.url).host); } catch {} }
    if (m.method === 'Network.loadingFailed' && !/net::ERR_ABORTED/.test(m.params.errorText || '')) failed.push({ id: m.params.requestId, why: m.params.errorText });
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) failed.push({ id: m.params.requestId, why: 'HTTP ' + m.params.response.status, url: m.params.response.url });
  });
  const urls = new Map();
  b.on((m) => { if (m.sessionId === pg.sessionId && m.method === 'Network.requestWillBeSent') urls.set(m.params.requestId, m.params.request.url); });
  await pg.goto(url, { settle });
  let probe = await pg.eval(`(() => {
    const imgs = [...document.images];
    return {
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
      brokenImages: imgs.filter((i) => i.complete && i.naturalWidth === 0 && !(i.loading === 'lazy' && !i.currentSrc)).map((i) => i.getAttribute('src')).slice(0, 5),
    };
  })()`);
  let cherryProbe = null;
  if (cherry) {
    for (let i = 0; i < 40; i++) {
      cherryProbe = await pg.eval(`(() => { const ids = ['hero','calculator','howitworks','faq']; const o = {}; for (const id of ids) { const el = document.getElementById(id); o[id] = el ? { children: el.children.length, text: (el.innerText || '').trim().slice(0, 80), height: Math.round(el.getBoundingClientRect().height) } : null; } return o; })()`);
      if (Object.values(cherryProbe).some((x) => x && (x.children > 0 || x.height > 20))) break;
      await sleep(500);
    }
    await sleep(1500);
  }
  const rec = { url, width, ...probe, errors: errs, failed: failed.map((f) => ({ url: f.url || urls.get(f.id) || '', why: f.why })), thirdPartyHosts: [...hosts].filter((h) => !base.includes(h)).sort(), cherry: cherryProbe };
  await b.send('Target.closeTarget', { targetId: pg.targetId }).catch(() => {});
  await sleep(100);
  return rec;
}
let exitCode = 0;
try {
  b = await launch({ port: 0 });
  if (args.control) {
    const html = '<!doctype html><html><body><div style="width:3000px">wide</div><img src="nothing-here.png" alt=""><script>undefinedFunctionCall()</script><h1>a</h1><h1>b</h1></body></html>';
    const r = await check('data:text/html,' + encodeURIComponent(html), 800, { settle: 600 });
    const fired = r.overflow && r.errors.length > 0 && r.h1 === 2;
    console.log('control:', fired ? 'fired (overflow, script error and 2 h1 reported)' : 'DID NOT FIRE ' + JSON.stringify(r).slice(0, 300));
    if (!fired) exitCode = 1;
  }
  for (const p of paths) for (const w of widths) {
    const r = await check(base + p, w, { cherry: !!args.cherry && /cherry-payment-plan/.test(p) });
    results.push(r);
    const sameOriginFails = r.failed.filter((f) => !f.url || f.url.startsWith(base));
    const bad = r.errors.length || sameOriginFails.length || r.overflow || r.h1 !== 1 || r.brokenImages.length;
    if (bad) exitCode = 1;
    console.log((bad ? 'FAIL ' : 'ok   ') + String(w).padStart(4) + ' ' + p + ' · h1 ' + r.h1 + ' · overflow ' + (r.overflow ? r.scrollWidth + '>' + r.innerWidth : 'no') + ' · errors ' + r.errors.length + ' · failed same-origin ' + sameOriginFails.length + ' / third-party ' + (r.failed.length - sameOriginFails.length) + (r.thirdPartyHosts.length ? ' · hosts ' + r.thirdPartyHosts.join(' ') : '') + (r.cherry ? ' · cherry ' + JSON.stringify(r.cherry) : ''));
    for (const e of r.errors.slice(0, 3)) console.log('      ' + e);
    for (const f of r.failed.slice(0, 4)) console.log('      failed ' + f.why + ' ' + f.url.slice(0, 140));
    if (r.brokenImages.length) console.log('      broken images ' + r.brokenImages.join(' '));
  }
} catch (e) {
  console.error('render-check error', e && e.stack || e);
  exitCode = 1;
} finally {
  if (b) await b.close();
}
if (args.out) fs.writeFileSync(String(args.out), JSON.stringify(results, null, 1) + '\n');
process.exit(exitCode);
