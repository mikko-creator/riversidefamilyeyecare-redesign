// keep-image-parity.mjs - every image the source shows on a page and the inventory decided to KEEP is on the
// rebuilt page, or its absence is declared (audit/clone-removals.json images: vendor / platform drops, refused-file
// placeholders, siblings, refused drops, per-page drops).
// Source of truth: audit/image-classification.json (inventoryDecision, onDisk, visibleOn = the pages whose <main>
// shows the file, layout-CSS backgrounds included) - written by the imagery stage, never by the build.
// A rebuilt page "has" a file when one of its <img src> / <source srcset> / poster references a shipped image whose
// name is the encoder's name for that file: <file base, lowercased and dash-safe>.<10 hex>.<ext> (src/lib/images.mjs).
// Positive control: one KEEP image is removed from one rebuilt page IN MEMORY and must be reported missing.
// ALT FIDELITY (fix round 2, R2-1: the build had blanked 23 readable child-page thumbnail alts and no gate read alts):
// every <img> in each rebuilt page's <main> carries the alt its SOURCE page gives that file (read from every <img> of
// the raw page: src, data-src, srcset, data-srcset; a sibling stand-in answers for its original), or "" when that is
// a declared blank (audit/clone-removals.json images.altsBlanked.onPages: a file-name or upload-hash alt) or the image
// is a section background (figure.section__bg: a CSS background has no alt at source; BUILD-NOTES 5.8). Anything else
// is an alt finding (blanked or changed). Positive control: one readable alt blanked in memory must be reported.
// ADDED IMAGES (wf5b templates stage, docs/COMPONENTS.md gap I.51): an <img> of <main> whose file no source <img> of
// the page carries ("unmatched") is accepted in exactly three cases, each with its alt checked, and stays a finding
// otherwise: (1) a declared addition - audit/clone-removals.json images.added names this page and this file (the
// model.art images), alt equal to the declared alt; (2) the theme's hero / band still, theme/media/hero-river-poster
// (-phone).webp (audit/generated-media.json), alt ""; (3) a model background photo printed as an <img> (the home hero
// crop, the Alumier banner, a hub header photo in the title arch): a KEEP file that audit/image-classification.json
// shows on this page (visibleOn, layout-CSS backgrounds included) while no source <img> of the page carries it, alt "".
// Positive controls: an undeclared image planted in <main>, and a declared addition planted on a page that does not
// declare it, must each stay unmatched.
//   node tools/keep-image-parity.mjs [--dir <dir>]   ($RFEC_DIST or --dir: no audit/ report)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_OPT = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : null;
const DIST = path.resolve(DIR_OPT || process.env.RFEC_DIST || path.join(PROJ, 'dist'));
const WRITE_AUDIT = !process.env.RFEC_DIST && !DIR_OPT;
const cls = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/image-classification.json'), 'utf8'));
const removals = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/clone-removals.json'), 'utf8'));
const fileOf = (src) => { try { return decodeURIComponent(String(src).split('/').pop().split('?')[0]); } catch { return String(src).split('/').pop().split('?')[0]; } };
const baseOf = (src) => fileOf(src).replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const im = removals.images || {};
const declaredFiles = new Map();
const declare = (list, why) => { for (const f of list || []) declaredFiles.set(String(f).split(' -> ')[0], why); };
declare(im.vendorAssets, 'vendor asset (declared drop)');
declare(im.platformUi, 'platform image (declared drop)');
declare(im.refusedPlaceholders && im.refusedPlaceholders.files, 'refused file: placeholder');
declare(im.refusedDropped && im.refusedDropped.files, 'refused file: declared drop');
const pageDrops = new Map();
for (const d of im.droppedOnPages || []) { const k = d.page + '|' + fileOf(d.src); pageDrops.set(k, d.why); }

function pageFile(p) { const slug = p.replace(/^\/+|\/+$/g, ''); return slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html'); }
function refsOf(html) {
  const out = new Set();
  for (const m of html.matchAll(/\s(?:src|poster)="([^"]+)"|\ssrcset="([^"]+)"/g)) for (const u of (m[1] || m[2]).split(',')) { const f = u.trim().split(/\s+/)[0].split('/').pop(); if (f) out.add(f); }
  return out;
}
const has = (refs, src) => { const b = baseOf(src) + '.'; for (const r of refs) if (r.startsWith(b) && /^\.[0-9a-f]{10}\.(webp|png|jpe?g|gif|svg)$/i.test(r.slice(b.length - 1))) return true; return false; };

function score(override) {
  const res = { checked: 0, present: 0, declared: 0, missing: 0 };
  const missing = [], declared = [];
  for (const rec of cls.images) {
    if (rec.inventoryDecision !== 'KEEP' || !rec.onDisk) continue;
    for (const v of rec.visibleOn || []) {
      const p = v.replace(/\/?$/, '/');
      res.checked++;
      const file = pageFile(p);
      const html = override && override.has(p) ? override.get(p) : fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
      if (html === null) { res.missing++; missing.push({ page: p, file: fileOf(rec.src), why: 'page missing' }); continue; }
      if (has(refsOf(html), rec.src)) { res.present++; continue; }
      const why = declaredFiles.get(fileOf(rec.src)) || pageDrops.get(p + '|' + fileOf(rec.src));
      if (why) { res.declared++; declared.push({ page: p, file: fileOf(rec.src), why }); continue; }
      res.missing++; missing.push({ page: p, file: fileOf(rec.src), class: rec.class + '/' + rec.subclass });
    }
  }
  return { res, missing, declared };
}
const out = score(null);
/* positive control: strip one present KEEP image from its page, in memory */
let control = { fired: false };
for (const rec of cls.images) {
  if (rec.inventoryDecision !== 'KEEP' || !rec.onDisk || !(rec.visibleOn || []).length) continue;
  const p = rec.visibleOn[0].replace(/\/?$/, '/');
  if (!fs.existsSync(pageFile(p))) continue;
  const html = fs.readFileSync(pageFile(p), 'utf8');
  if (!has(refsOf(html), rec.src)) continue;
  const b = baseOf(rec.src) + '.';
  const mutated = html.replace(new RegExp('<img\\b[^>]*src="[^"]*/' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[0-9a-f]{10}\\.[a-z]+"[^>]*>', 'g'), '');
  const r2 = score(new Map([[p, mutated]]));
  control = { page: p, file: fileOf(rec.src), fired: r2.missing.some((m) => m.page === p && m.file === fileOf(rec.src)) };
  break;
}
/* ---------------------------------------------------------------- alt fidelity (fix round 2, R2-1) */
const content = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/content-inventory.json'), 'utf8'));
const decodeAlt = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const attrIn = (tag, n) => { const m = new RegExp('\\s' + n + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag); return m ? (m[1] !== undefined ? m[1] : m[2]) : null; };
const distBaseOf = (file) => file.replace(/\.[0-9a-f]{10}\.(webp|png|jpe?g|gif|svg)$/i, '');
/* a sibling stand-in ("orig.jpg -> sibling.jpg") answers for its original's alt */
const originalsOf = new Map();
/* the sibling side is the assets/source file name, which carries the store's 8-hex prefix ("696a266e-...") */
for (const s of im.refusedSiblings || []) { const [a, b] = String(s).split(' -> '); if (!a || !b) continue; const k = baseOf(b.replace(/^[0-9a-f]{8}-/i, '')); if (!originalsOf.has(k)) originalsOf.set(k, []); originalsOf.get(k).push(baseOf(a)); }
const blankedOn = new Map();   /* page -> Set(file base) declared blank */
for (const x of (im.altsBlanked && im.altsBlanked.onPages) || []) { if (!blankedOn.has(x.page)) blankedOn.set(x.page, new Set()); blankedOn.get(x.page).add(baseOf(x.file)); }
/* I.51: the declared additions (page -> file -> alt), the theme stills, the KEEP files each page shows (CSS backgrounds included) */
const addedOn = new Map();
for (const a of (im.added && im.added.onPages) || []) { if (!addedOn.has(a.page)) addedOn.set(a.page, new Map()); addedOn.get(a.page).set(a.file, a.alt); }
const THEME_STILL = /(?:^|\/)theme\/media\/hero-river-poster(?:-phone)?\.webp$/;
const keepOn = new Map();
for (const rec of cls.images) { if (rec.inventoryDecision !== 'KEEP' || !rec.onDisk) continue; for (const v of rec.visibleOn || []) { const p = v.replace(/\/?$/, '/'); if (!keepOn.has(p)) keepOn.set(p, new Set()); keepOn.get(p).add(baseOf(rec.src)); } }
function sourceAlts(raw) {
  const out = new Map();
  for (const m of raw.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const alt = decodeAlt(attrIn(tag, 'alt') || '');
    for (const a of ['src', 'data-src', 'srcset', 'data-srcset']) {
      const v = attrIn(tag, a);
      if (!v) continue;
      for (const part of decodeAlt(v).split(',')) { const u = part.trim().split(/\s+/)[0]; if (!u) continue; const b = baseOf(u); if (!out.has(b)) out.set(b, new Set()); out.get(b).add(alt); }
    }
  }
  return out;
}
function altScore(override) {
  const res = { pages: 0, imgs: 0, kept: 0, declared: 0, background: 0, added: 0, themeStill: 0, backgroundImg: 0, unmatched: 0, findings: 0 };
  const findings = [], unmatched = [];
  for (const page of content.pages) {
    const p = new URL(page.url).pathname.replace(/^\/*/, '/').replace(/\/?$/, '/');
    const file = pageFile(p);
    const html = override && override.has(p) ? override.get(p) : fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (html === null) continue;
    res.pages++;
    const src = sourceAlts(fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8'));
    let main = (html.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0];
    main = main.replace(/<figure class="section__bg">[\s\S]*?<\/figure>/gi, (bg) => { res.background += (bg.match(/<img\b/gi) || []).length; return ' '; });
    for (const m of main.matchAll(/<img\b[^>]*>/gi)) {
      res.imgs++;
      const f = String(attrIn(m[0], 'src') || '').split('/').pop();
      const alt = decodeAlt(attrIn(m[0], 'alt') || '');
      const own = distBaseOf(f);   /* already the encoder's name: the source base, lowercased and dash-safe */
      const bases = [own, ...(originalsOf.get(own) || [])];
      const alts = new Set(bases.flatMap((b) => [...(src.get(b) || [])]));
      if (!alts.size) {
        /* I.51: a declared addition with its declared alt; the theme still; a source CSS-background photo, alt "" */
        const declaredAlt = (addedOn.get(p) || new Map()).get(f);
        if (declaredAlt !== undefined && decodeAlt(declaredAlt) === alt) { res.added++; continue; }
        if (THEME_STILL.test(String(attrIn(m[0], 'src') || '')) && !alt) { res.themeStill++; continue; }
        if (!alt && (keepOn.get(p) || new Set()).has(own)) { res.backgroundImg++; continue; }
        res.unmatched++; unmatched.push({ page: p, file: f, alt }); continue;
      }
      if (alts.has(alt)) { res.kept++; continue; }
      if (!alt && bases.some((b) => (blankedOn.get(p) || new Set()).has(b))) { res.declared++; continue; }
      res.findings++;
      findings.push({ page: p, file: f, kind: alt ? 'changed' : 'blanked', dist: alt, source: [...alts] });
    }
  }
  return { res, findings, unmatched };
}
const alts = altScore(null);
/* positive control: blank one readable source alt on one rebuilt page, in memory */
let altControl = { fired: false };
for (const page of content.pages) {
  const p = new URL(page.url).pathname.replace(/^\/*/, '/').replace(/\/?$/, '/');
  if (!fs.existsSync(pageFile(p))) continue;
  const html = fs.readFileSync(pageFile(p), 'utf8');
  const main = (html.match(/<main\b[\s\S]*?<\/main>/i) || [''])[0];
  const hit = /<img\b[^>]*\salt="([^"]+)"[^>]*>/i.exec(main.replace(/<figure class="section__bg">[\s\S]*?<\/figure>/gi, ' '));
  if (!hit) continue;
  const mutated = html.replace(hit[0], hit[0].replace(/\salt="[^"]*"/, ' alt=""'));
  const r2 = altScore(new Map([[p, mutated]]));
  altControl = { page: p, alt: decodeAlt(hit[1]), fired: r2.findings.some((x) => x.page === p && x.kind === 'blanked') };
  break;
}
/* I.51 positive controls (in memory): an undeclared image planted in <main>, and a declared addition planted on a
   page that does not declare it, must each be reported unmatched */
let addControl = { fired: false };
{
  const pagesOk = content.pages.map((pg) => new URL(pg.url).pathname.replace(/^\/*/, '/').replace(/\/?$/, '/')).filter((p) => fs.existsSync(pageFile(p)));
  const p1 = pagesOk[0];
  const row = ((im.added && im.added.onPages) || []).find((a) => pagesOk.includes(a.page));
  const p2 = row && pagesOk.find((p) => p !== row.page && !(addedOn.get(p) || new Map()).has(row.file));
  if (p1 && row && p2) {
    const plant = (p, tag) => fs.readFileSync(pageFile(p), 'utf8').replace('</main>', tag + '</main>');
    const undeclared = 'planted-undeclared.0123456789.webp';
    const r1 = altScore(new Map([[p1, plant(p1, '<img src="img/' + undeclared + '" alt="" width="10" height="10">')]]));
    const r2 = altScore(new Map([[p2, plant(p2, '<img src="img/' + row.file + '" alt="' + row.alt + '" width="10" height="10">')]]));
    const a = r1.unmatched.some((x) => x.page === p1 && x.file === undeclared);
    const b = r2.unmatched.some((x) => x.page === p2 && x.file === row.file);
    addControl = { undeclared: p1, misplaced: p2 + ' ' + row.file, firedUndeclared: a, firedMisplaced: b, fired: a && b };
  }
}
const report = { schema: 'rfec/keep-image-parity@1', dist: path.relative(PROJ, DIST).split(path.sep).join('/') || '.', totals: out.res, control, missing: out.missing, declared: out.declared, alt: { totals: alts.res, control: altControl, addedControl: addControl, findings: alts.findings, unmatched: alts.unmatched } };
if (WRITE_AUDIT) fs.writeFileSync(path.join(PROJ, 'audit/keep-image-parity.json'), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify(out.res));
console.log('control:', control.fired ? 'fired (' + control.page + ' ' + control.file + ')' : 'DID NOT FIRE');
console.log('alt fidelity', JSON.stringify(alts.res), '· control', altControl.fired ? 'fired (' + altControl.page + ' "' + altControl.alt + '" blanked)' : 'DID NOT FIRE', '· added-image control', addControl.fired ? 'fired (undeclared on ' + addControl.undeclared + '; misplaced ' + addControl.misplaced + ')' : 'DID NOT FIRE ' + JSON.stringify(addControl));
for (const m of out.missing.slice(0, 40)) console.log(' - missing', m.page, m.file, m.class || m.why || '');
for (const x of alts.findings.slice(0, 40)) console.log(' - alt ' + x.kind, x.page, x.file, 'dist=' + JSON.stringify(x.dist), 'source=' + JSON.stringify(x.source).slice(0, 120));
for (const x of alts.unmatched.slice(0, 20)) console.log(' - alt unmatched (no source <img> for this file)', x.page, x.file, JSON.stringify(x.alt));
if (out.res.missing || !control.fired || alts.res.findings || alts.res.unmatched || !altControl.fired || !addControl.fired) process.exit(1);
