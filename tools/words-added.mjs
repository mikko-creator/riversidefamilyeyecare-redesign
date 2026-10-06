// words-added.mjs - the reverse of the parity checks: no visible word on a rebuilt page may come from nowhere.
// Allowed vocabulary per page = every word of the SOURCE page (raw <body> text plus its alt/aria-label/title/
// placeholder/value attributes: a refused photo's placeholder prints the person's name from its alt), every string
// value of src/content/chrome.json (the chrome) and of facts/client-facts.json (the resolved shortcodes print the
// account values from it). Visible text of the rebuild = the text of <body> without <script>/<style>.
// A word is [letters/digits]+ lowercased; one-character tokens are ignored. Any word outside the vocabulary is
// reported. Glyphs too (fix round 1, D8: the scaffold drew a rating as "★★★★★" text, which no word check sees): every
// visible character that is not a letter, digit, mark, whitespace or ASCII punctuation (★ © ® † » …) must occur in
// the source page's text, attributes or <title>, or in chrome.json / client-facts.json; any other is reported.
// Positive controls: a planted invented sentence, and a planted "★", on one page must each be reported.
//   node tools/words-added.mjs [--dir <dir>] [--show 30]   -> exit 1 on any added word or glyph, or a silent control
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(ROOT, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const show = Number(process.argv[process.argv.indexOf('--show') + 1]) || 30;
const J = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const content = J('audit/content-inventory.json');
const decode = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&[a-z]+;/gi, ' ');
const wordsOf = (t) => (decode(t).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[\p{L}\p{N}]+/gu) || []).filter((w) => w.length > 1);
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach((x) => strings(x, out)); else if (o && typeof o === 'object') Object.values(o).forEach((x) => strings(x, out)); return out; };
/* glyphs: a full entity decode (the word decoder above blanks named entities, which would hide "&copy;" -> "©") */
const NAMED = { nbsp: '\u00a0', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', sbquo: '‚', bdquo: '„', ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™', copy: '©', raquo: '»', laquo: '«', rsaquo: '›', lsaquo: '‹', times: '×', deg: '°', middot: '·', bull: '•', dagger: '†', Dagger: '‡', le: '≤', ge: '≥', sect: '§', para: '¶', frac12: '½', frac14: '¼', frac34: '¾', cent: '¢', pound: '£', euro: '€', plusmn: '±', micro: 'µ', prime: '′', Prime: '″', starf: '★', star: '☆', check: '✓', hearts: '♥', rarr: '→', larr: '←' };
const decodeFull = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : m));
const GLYPH = /[^\p{L}\p{N}\p{M}\s!-\/:-@\[-`{-~]/gu;
const glyphsOf = (t) => decodeFull(t).match(GLYPH) || [];
const baseStrings = [...strings(J('src/content/chrome.json')), ...strings(J('facts/client-facts.json'))];
const base = new Set(baseStrings.flatMap(wordsOf));
const baseGlyphs = new Set(baseStrings.flatMap(glyphsOf));

function vocabOf(raw) {
  const body = ((raw.match(/<body\b[\s\S]*<\/body>/i) || [raw])[0]).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  const attrs = [...body.matchAll(/\s(?:alt|aria-label|title|placeholder|value)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] || m[2] || '');
  /* the source <title> too: a page with no h1 (the 6 /template/* pages) takes it as its h1 (documented in audit/seo-repairs.json h1) */
  const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(raw) || [])[1] || '';
  const text = body.replace(/<[^>]+>/g, ' ');
  const words = new Set([...wordsOf(text), ...attrs.flatMap(wordsOf), ...wordsOf(title)]);
  words.glyphs = new Set([...glyphsOf(text), ...attrs.flatMap(glyphsOf), ...glyphsOf(title)]);
  return words;
}
function visibleOf(html) {
  const body = ((html.match(/<body\b[\s\S]*<\/body>/i) || [''])[0]).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  return wordsOf(body.replace(/<[^>]+>/g, ' '));
}
function visibleGlyphsOf(html) {
  const body = ((html.match(/<body\b[\s\S]*<\/body>/i) || [''])[0]).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  return glyphsOf(body.replace(/<[^>]+>/g, ' '));
}
function score(override) {
  const added = [];
  const addedGlyphs = [];
  let pages = 0, words = 0, glyphs = 0;
  for (const page of content.pages) {
    const slug = new URL(page.url).pathname.replace(/^\/+|\/+$/g, '');
    const file = slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html');
    const html = override && override.has(page.url) ? override.get(page.url) : fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (html === null) { added.push({ page: '/' + slug, word: '(page missing)' }); continue; }
    pages++;
    const vocab = vocabOf(fs.readFileSync(path.join(ROOT, 'audit/raw', page.savedAs), 'utf8'));
    const seen = new Set();
    for (const w of visibleOf(html)) {
      words++;
      if (vocab.has(w) || base.has(w) || seen.has(w)) continue;
      seen.add(w);
      added.push({ page: '/' + (slug ? slug + '/' : ''), word: w });
    }
    const counts = new Map();
    for (const g of visibleGlyphsOf(html)) { glyphs++; if (!vocab.glyphs.has(g) && !baseGlyphs.has(g)) counts.set(g, (counts.get(g) || 0) + 1); }
    for (const [g, n] of counts) addedGlyphs.push({ page: '/' + (slug ? slug + '/' : ''), glyph: g, code: 'U+' + g.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'), count: n });
  }
  return { pages, words, added, glyphs, addedGlyphs };
}
const out = score(null);
const home = content.pages.find((p) => new URL(p.url).pathname === '/');
const homeHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').replace('</main>', '<p>Voted best optometrist zanzibarian quokka</p></main>');
const ctl = score(new Map([[home.url, homeHtml]]));
const firedWords = ctl.added.some((a) => a.word === 'zanzibarian') && ctl.added.some((a) => a.word === 'quokka');
const ctlG = score(new Map([[home.url, fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').replace('</main>', '<p><span aria-hidden="true">★★★★★</span></p></main>')]]));
const starsBefore = (out.addedGlyphs.find((a) => a.page === '/' && a.glyph === '★') || { count: 0 }).count;
const firedGlyphs = ctlG.addedGlyphs.some((a) => a.page === '/' && a.glyph === '★' && a.count === starsBefore + 5);
const fired = firedWords && firedGlyphs;
const report = { schema: 'rfec/words-added@1', dist: path.relative(ROOT, DIST).split(path.sep).join('/') || '.', pages: out.pages, visibleWords: out.words, added: out.added, visibleGlyphs: out.glyphs, addedGlyphs: out.addedGlyphs, control: { planted: 'an invented sentence on /; five "★" on /', firedWords, firedGlyphs, fired } };
if (WRITE_AUDIT) fs.writeFileSync(path.join(ROOT, 'audit/words-added.json'), JSON.stringify(report, null, 1) + '\n');
console.log('pages', out.pages, '· visible words', out.words, '· added words', out.added.length, '· visible glyphs', out.glyphs, '· added glyphs', out.addedGlyphs.length, '· control', fired ? 'fired (words + glyphs)' : 'DID NOT FIRE ' + JSON.stringify({ firedWords, firedGlyphs }));
for (const a of out.added.slice(0, show)) console.log('  ' + a.page + '  ' + a.word);
for (const a of out.addedGlyphs.slice(0, show)) console.log('  ' + a.page + '  glyph ' + a.glyph + ' ' + a.code + ' x' + a.count);
if (out.added.length || out.addedGlyphs.length || !fired) process.exit(1);
