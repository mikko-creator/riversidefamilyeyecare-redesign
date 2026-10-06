// render-verify.mjs — answer sr-extract's HIGH render-risk heuristic with browser evidence.
// sr-extract flags a page HIGH ("may be a JS-rendered shell") from static signals only (script bytes
// vs body text). This renders each flagged LIVE page in headless Chrome and moves it to
// renderRisk.browserVerified ONLY when the render has real text (>= 400 chars) AND contains >= 95% of
// the distinct words the static fetch captured — i.e. the static capture was not a shell. Pages that
// fail stay in renderRisk.high. Evidence: audit/rendered/<slug>.json + audit/render-verification.json.
// Re-run after any sr-extract run (it rewrites content-inventory.json).
//   node tools/render-verify.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const invFile = path.join(ROOT, 'audit/content-inventory.json');
const inv = JSON.parse(fs.readFileSync(invFile, 'utf8'));
const words = (s) => (String(s || '').toLowerCase().match(/[a-z0-9$%.]+/g) || []).map((w) => w.replace(/\.+$/, '')).filter((w) => w.length > 1);
const slug = (u) => new URL(u).pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-') || 'index';
// candidates from each page's OWN level (never from renderRisk.high, which this tool rewrites)
const high = inv.pages.filter((p) => p.renderRisk && p.renderRisk.level === 'high');
fs.mkdirSync(path.join(ROOT, 'audit/rendered'), { recursive: true });
const results = [];
const b = await launch({ port: 0 });
try {
  const pg = await b.newPage({ width: 1440, height: 900 });
  await pg.send('Network.setBlockedURLs', { urls: ['*google-analytics.com*', '*googletagmanager.com*', '*doubleclick.net*', '*facebook.net*'] });
  for (const page of high) {
    try {
      await pg.goto(page.url, { settle: 2500, timeout: 60000 });
      const r = await pg.eval(`({ href: location.href, title: document.title, text: document.body ? document.body.innerText : '' })`);
      const rset = new Set(words(r.text));
      // The Gravity Forms honeypot label is display:none by design, so innerText never contains it;
      // it is excluded from the comparison (and the exclusion is recorded) rather than counted as missing.
      const HIDDEN_BY_DESIGN = /This field is for validation purposes and should be left unchanged\.?/gi;
      const staticText = String(page.bodyText || '');
      const excluded = (staticText.match(HIDDEN_BY_DESIGN) || []).length;
      const sw = [...new Set(words(staticText.replace(HIDDEN_BY_DESIGN, ' ')))];
      const found = sw.filter((w) => rset.has(w)).length;
      const rec = { url: page.url, renderedHref: r.href, renderedChars: r.text.length, staticChars: (page.bodyText || '').length, staticDistinctWords: sw.length, staticWordsFoundInRender: sw.length ? +(found / sw.length).toFixed(4) : 0, excludedHiddenByDesign: excluded ? excluded + ' x Gravity Forms honeypot label (display:none)' : null, capturedAt: new Date().toISOString() };
      fs.writeFileSync(path.join(ROOT, 'audit/rendered', slug(page.url) + '.json'), JSON.stringify({ ...rec, title: r.title, bodyText: r.text }, null, 1));
      results.push(rec);
      console.log(rec.renderedChars, rec.staticWordsFoundInRender, page.url);
    } catch (e) { results.push({ url: page.url, error: String(e.message || e) }); console.log('ERROR', page.url, e.message); }
    await sleep(1500);   // polite: one live request at a time
  }
} finally { await b.close(); }

const verified = [], kept = [];
for (const r of results) {
  if (!r.error && r.renderedChars >= 400 && r.staticWordsFoundInRender >= 0.95) verified.push({ ...r, evidence: 'audit/rendered/' + slug(r.url) + '.json', note: 'The static capture is a subset of the rendered page: not a JS shell. The rebuild content comes from the static capture, which the render confirms.' });
  else kept.push(r.url);
}
fs.writeFileSync(path.join(ROOT, 'audit/render-verification.json'), JSON.stringify({ schema: 'fes/render-verification@1', generated: new Date().toISOString(), rule: 'renderedChars >= 400 AND >= 95% of static distinct words present in the render', results }, null, 1));
inv.renderRisk = inv.renderRisk || {};
inv.renderRisk.high = kept;
inv.renderRisk.browserVerified = verified;
inv.renderRisk.amendedBy = 'tools/render-verify.mjs (browser render of each HIGH page; see audit/render-verification.json)';
fs.writeFileSync(invFile, JSON.stringify(inv, null, 2));
console.log('verified', verified.length, 'still high', kept.length);
process.exit(0);
