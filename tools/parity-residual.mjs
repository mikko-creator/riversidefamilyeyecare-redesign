// parity-residual.mjs — what sr-parity's missing words actually ARE.
// sr-parity scores recall of the extractor's page.bodyText (which, where <main> was thin, is the
// whole body: navigation printed 4-6 times, sidebar widgets, footer). This classifies every
// missing token occurrence on each flagged page as CHROME (present in the source's own header /
// nav / footer / aside / menu / widget text) or CONTENT (anything else), by multiset subtraction.
// CONTENT > 0 is a real loss to fix; CHROME-only is navigation the rebuild renders fewer times.
//   node tools/parity-residual.mjs [--all] [--out audit/parity-residual.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const content = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/content-inventory.json'), 'utf8'));
const parity = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/parity-report.json'), 'utf8'));
const tok = (s) => (String(s || '').toLowerCase().match(/[a-z0-9À-ɏ']+/g) || []);
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'").replace(/&#8211;|&ndash;/g, '–').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));
const textOf = (h) => decode(String(h || '').replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');

/* the source's CHROME: every element whose tag or class marks it as navigation / widget / footer */
function chromeText(raw) {
  const body = (raw.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || raw;
  const out = [];
  const openRe = /<(header|nav|footer|aside)\b[^>]*>|<(div|section|ul)\b[^>]*class="[^"]*\b(menu|widget|sidebar|fl-page-header|fl-page-footer|ecp-announcement|announcement|search)[^"]*"[^>]*>/gi;
  let m;
  while ((m = openRe.exec(body))) {
    const tag = (m[1] || m[2]).toLowerCase();
    // walk to the matching close tag
    const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
    re.lastIndex = m.index + m[0].length;
    let depth = 1, mm, end = body.length;
    while ((mm = re.exec(body))) { depth += mm[1] ? -1 : 1; if (depth === 0) { end = mm.index; break; } }
    out.push(body.slice(m.index, end));
    openRe.lastIndex = end;
  }
  return textOf(out.join(' '));
}

const byUrl = new Map(content.pages.map((p) => [p.url, p]));
const rows = [];
for (const r of parity.rows) {
  const flagged = r.findings.some((f) => f.code === 'content-loss' || f.code === 'content-block-missing');
  if (!flagged && !args.includes('--all')) continue;
  const page = byUrl.get(r.url);
  if (!page) continue;
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
  const slug = new URL(r.url).pathname.replace(/^\/+|\/+$/g, '');
  const built = fs.readFileSync(path.join(PROJ, 'dist', slug, 'index.html'), 'utf8');
  const target = new Map();
  for (const w of tok(textOf((built.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || built))) target.set(w, (target.get(w) || 0) + 1);
  const chrome = new Map();
  for (const w of tok(chromeText(raw))) chrome.set(w, (chrome.get(w) || 0) + 1);
  const src = tok(page.bodyText);
  let hit = 0, chromeMiss = 0, contentMiss = 0;
  const contentWords = [];
  for (const w of src) {
    const n = target.get(w) || 0;
    if (n > 0) { target.set(w, n - 1); hit++; continue; }
    const c = chrome.get(w) || 0;
    if (c > 0) { chrome.set(w, c - 1); chromeMiss++; continue; }
    contentMiss++; contentWords.push(w);
  }
  rows.push({ url: r.url, srcTokens: src.length, recall: +(hit / src.length).toFixed(4), chromeMissing: chromeMiss, contentMissing: contentMiss, recallExcludingChrome: +((hit) / Math.max(1, src.length - chromeMiss)).toFixed(4), contentMissingWords: [...new Set(contentWords)].slice(0, 60) });
}
rows.sort((a, b) => b.contentMissing - a.contentMissing);
const out = { schema: 'fes/parity-residual@1', generated: new Date().toISOString(), method: 'multiset subtraction: each missing source token is charged to the source chrome (header/nav/footer/aside/menu/widget text) while the chrome still has an unconsumed occurrence of it; the rest is CONTENT.', pages: rows.length, totals: { chromeMissing: rows.reduce((a, r) => a + r.chromeMissing, 0), contentMissing: rows.reduce((a, r) => a + r.contentMissing, 0) }, rows };
const file = path.join(PROJ, args[args.indexOf('--out') + 1] && args.includes('--out') ? args[args.indexOf('--out') + 1] : 'audit/parity-residual.json');
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log('pages', rows.length, 'chrome-missing', out.totals.chromeMissing, 'content-missing', out.totals.contentMissing);
for (const r of rows.slice(0, 25)) console.log(String(r.contentMissing).padStart(4), r.recall, '->', r.recallExcludingChrome, r.url.replace(/^https?:\/\/[^/]+/, ''), '|', r.contentMissingWords.slice(0, 18).join(' '));
