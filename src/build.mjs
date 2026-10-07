/* ============================================================================
   build.mjs - Riverside Family Eye Care rebuild (site-reforge, REFORGE lane): the CONTENT PIPELINE and the
   "Riverlight Aurora" design theme (the SCAFFOLD theme it was ported on is retired, COMPONENTS I.72). Node builtins
   only. Run from anywhere:
     node src/build.mjs                    -> dist/ (wiped and rebuilt every run) + audit/ reports
     RFEC_DIST=tmp/repro/a node src/build.mjs   -> any other directory; audit/ reports are NOT rewritten
     node src/build.mjs --dump-models      -> also writes every page model to tmp/page-models/<slug>.json
     RFEC_BASE=/preview/ node src/build.mjs -> 404.html, .htaccess and _redirects for a subfolder deploy (default "/")
     (RFEC_THEME=scaffold is retired and stops the build; COMPONENTS I.72, docs/BUILD-NOTES.md section 12)
   Encoded images are cached in tmp/build-cache/ (content-hash keyed) so a rebuild re-encodes nothing and two
   builds produce identical bytes.

   Forked from the reference build (R) src/build.mjs with every item of docs/PORT-NOTES.md applied (the list,
   item by item, is docs/BUILD-NOTES.md section 3). The page assembly moved into src/lib/page-model.mjs: each
   source page becomes a plain JSON model (docs/BUILD-NOTES.md, "Page model contract") that the theme renders.
   Reads (never edits): audit/raw/*.html, audit/{content,seo,image,site,media}-inventory.json,
   audit/image-classification.json, audit/architecture-map.json, audit/css/*, audit/generated-images.json,
   assets/source/*, assets/media/*, assets/generated/*, assets/docs/*, facts/client-facts.json,
   src/content/{chrome,site-map,image-plan}.json, src/styles/*.css and src/theme/** (the theme, P2).
   It never reads audit/failures.json (site-reforge stage evidence): a file the CDN refused is known from the image
   inventory (no localFile) and audit/image-classification.json, which the imagery stage wrote from that record.
   wf5b (DESIGN-SPEC 4.3, docs/BUILD-NOTES.md section 11): P1 width variants + srcset, P2 the fingerprinted theme
   (one stylesheet, one script, fonts, stills, the hero loop), P3 byte-identical logos, P4 model.art from the image
   plan, P7 the AI label on every generated encode; COMPONENTS I.6 (the superseded hero phone file, declared).
   Rules: copy is never rewritten; one output page per source page at the same path; no platform markup
   survives; every kept image ships or its removal/placeholder is declared; every internal URL is
   page-relative (one exception: dist/404.html, root-relative under the deploy base RFEC_BASE, served at any depth).
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { esc, up, ownPath, readJSON, walk, decodeEntities, sha256, imageSize, minifyCss, stripJsLineComments } from './lib/util.mjs';
import vm from 'node:vm';
import { createContent, TOKEN_RE } from './lib/content.mjs';
import { parseGravityForm, parseConditionalLogic } from './lib/forms.mjs';
import * as seo from './lib/seo.mjs';
import { createImages } from './lib/images.mjs';
import { createPageModel } from './lib/page-model.mjs';
import { remap, adoptedPages, redirectPage } from './lib/restructure.mjs';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(PROJ, ...a);
/* THEME: the SCAFFOLD (src/lib/templates.mjs + src/lib/home.mjs + src/styles/scaffold.css). A design theme
   replaces those three files and keeps consuming the same page model. */
const { createTemplates } = await import(pathToFileURL(P('src/lib/templates.mjs')).href);
const { buildHome } = await import(pathToFileURL(P('src/lib/home.mjs')).href);
const DIST = path.resolve(process.env.RFEC_DIST || P('dist'));
const REPORTS = !process.env.RFEC_DIST;   /* audit/ reports are written only by the canonical build */
const DUMP_MODELS = process.argv.includes('--dump-models');
const chrome = readJSON(P('src/content/chrome.json'));
const siteMap = readJSON(P('src/content/site-map.json'));
const facts = readJSON(P('facts/client-facts.json'));
const ORIGIN = chrome.origin;
const content = readJSON(P('audit/content-inventory.json'));
const seoInv = readJSON(P('audit/seo-inventory.json'));
const imgInv = readJSON(P('audit/image-inventory.json'));
const classification = readJSON(P('audit/image-classification.json'));
const siteInv = readJSON(P('audit/site-inventory.json'));
const mediaInv = readJSON(P('audit/media-inventory.json'));
const archMap = readJSON(P('audit/architecture-map.json'));
const seoBy = new Map(seoInv.pages.map((p) => [p.url, p]));
/* restructure (src/lib/restructure.mjs): the 11 adopted pages join the inventory as interior pages */
const ADOPTED = adoptedPages(PROJ, ORIGIN);
for (const a of ADOPTED) { content.pages.push(a.page); seoBy.set(a.page.url, a.seo); }

const failures = [];
const fail = (stage, target, reason) => failures.push({ stage, target, reason });
const stats = { figureRoles: {}, moved: new Map(), dead: new Map() };
const seoLog = { titles: [], canonicals: [], descriptions: 0, derivedDescriptions: [], descriptionsNotDerived: [], structuredData: [], h1Labels: [], noindex: [], robotsChanges: [], openGraph: [], descriptionsRemoved: [] };   /* openGraph, descriptionsRemoved: QA round 1 (CONTENT-3) */
/* fix round 2: every alt blanked on a page (garbageAlt: a file name or upload hash), declared in
   audit/clone-removals.json images.altsBlanked.onPages so tools/keep-image-parity.mjs can tell it from a lost alt */
const altBlanks = [];
/* D7 (fix round 2): the deploy base of the three host-level files - dist/404.html (served at the failing request's
   own path, so its URLs are root-relative), .htaccess and _redirects. '/' = the domain root (the default, docs/
   OPEN-DECISIONS.md B); RFEC_BASE=/preview/ builds them for a subfolder. Every other page is page-relative and
   needs no base. */
const BASE = process.env.RFEC_BASE || '/';
if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(BASE)) throw new Error('RFEC_BASE must be a path that starts and ends with "/" (e.g. /preview/): ' + BASE);
/* P2 (wf5b): which theme ships. The design theme ("riverlight") is on when its component layer
   <theme root>/styles/riverlight.css exists (the design build's FILE LAYOUT); until then the build keeps the
   SCAFFOLD (styles/scaffold.css, no script) exactly as before. RFEC_THEME=scaffold forces the scaffold,
   RFEC_THEME=riverlight requires the design theme. RFEC_THEME_ROOT=<dir> reads <dir>/styles and <dir>/theme instead
   of src/ (tests: a fixture theme, never the files of another workspace stage). */
const THEME_ROOT = path.resolve(process.env.RFEC_THEME_ROOT || P('src'));
const THEME_WANT = process.env.RFEC_THEME || 'auto';
if (!['auto', 'scaffold', 'riverlight'].includes(THEME_WANT)) throw new Error('RFEC_THEME must be riverlight (or unset): ' + THEME_WANT);
/* Integrate stage (COMPONENTS I.72): the scaffold is RETIRED. The scaffold templates were replaced by the Riverlight
   templates, which print the theme's fonts, posters and hero loop unconditionally; a scaffold-mode dist shipped none of
   them (broken references) and was no deliverable. The design theme is now the only theme: RFEC_THEME=scaffold stops
   the build, and a theme root without riverlight.css fails closed in the P2 layer check below. The scaffold branches
   further down stay as the pipeline's record and are unreachable. */
if (THEME_WANT === 'scaffold') throw new Error('RFEC_THEME=scaffold is retired (COMPONENTS I.72): the templates are the Riverlight templates, and a scaffold build shipped none of the theme files they reference. Build the design theme (unset RFEC_THEME); for model-only comparisons use --dump-models with RFEC_DIST=<scratch dir>.');
const THEME = 'riverlight';

/* ---------- 0. fresh output ---------- */
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
for (const d of ['img', 'media', THEME === 'scaffold' ? 'styles' : 'theme']) fs.mkdirSync(path.join(DIST, d), { recursive: true });
const CACHE = P('tmp/build-cache/img');
const images = createImages({ cacheDir: CACHE, stats });
const shipped = new Set();
function ship(rel) {   /* copy a cached web image into dist/img once */
  if (shipped.has(rel)) return;
  fs.copyFileSync(P('tmp/build-cache/img', rel), path.join(DIST, 'img', rel));
  shipped.add(rel);
}
const imgUrl = (rel, depth) => { ship(rel); return up(depth) + 'img/' + rel; };

/* ---------- 1. image map: every real image kept, or its drop / placeholder / sibling declared ---------- */
const OLD_VENDOR = /eyecarepro/i;
const PLATFORM_UI = /spinner\.svg|fas-fa-|chosen-sprite|gf-creditcards|\/arrow\.png|ribbon\.png|snowflake\d|new-(black|orange|blue)\.png|\/tag\.png|pattern-part2|review-quote/i;
const classBySrc = new Map(classification.images.map((c) => [c.src, c]));
const classByFile = new Map(classification.images.filter((c) => c.file).map((c) => [c.file, c]));
const fileOf = (src) => { try { return decodeURIComponent(String(src).split('/').pop().split('?')[0]); } catch { return String(src).split('/').pop().split('?')[0]; } };
const urlPath = (src) => { try { return decodeURIComponent(new URL(src, ORIGIN + '/').pathname); } catch { return null; } };
/* A file-name alt ("woman dabbing eyes in winter coat.jpg", an upload hash) describes nothing; it becomes "". */
const garbageAlt = (alt, src) => {
  const a = String(alt || '').trim();
  if (!a) return false;
  if (/\.(jpe?g|png|gif|webp)\b/i.test(a) || /\b\d{2,4}\s*[x×]\s*\d{2,4}\b/i.test(a) || /^clipart\s*\d+$/i.test(a)) return true;
  if (/(^|\s)20[a-z]{3,}/i.test(a) && /%20/.test(src)) return true;
  if (/[A-Za-z]\d[A-Za-z]|\d[A-Za-z]\d/.test(a) && /^\S{12,}(\s\S+)?$/.test(a)) return true;
  const base = fileOf(src).replace(/\.[a-z0-9]+$/i, '');
  if (!/\s/.test(a) && a === base && /[a-z][A-Z]{2}/.test(a)) return true;
  return false;
};
const imageMap = new Map();
const byBase = new Map();          /* file name -> rec (row background photos use a different host) */
const byPath = new Map();          /* URL path -> rec */
const invBySrc = [];
const decisions = { vendor: [], platformUi: [], refusedPlaceholder: [], refusedSibling: [], refusedDropped: [], altsBlanked: 0 };
let kept = 0;
const pendingSiblings = [];
for (const im of imgInv.images || []) {
  const cl = classBySrc.get(im.src) || (im.localFile && classByFile.get(im.localFile)) || null;
  const cls = cl ? cl.class + '/' + (cl.subclass || '') : '';
  const sig = (im.alts || []).join(' ') + ' ' + im.src;
  if (OLD_VENDOR.test(sig)) { imageMap.set(im.src, { drop: true, why: 'former platform vendor asset (EyeCarePro)' }); decisions.vendor.push(fileOf(im.src)); continue; }
  if (PLATFORM_UI.test(im.src)) { imageMap.set(im.src, { drop: true, why: 'platform UI image (theme / form plugin)' }); decisions.platformUi.push(fileOf(im.src)); continue; }
  if (cl && cl.class === 'platform-ui-drop') { imageMap.set(im.src, { drop: true, why: 'platform image (' + cl.subclass + ', audit/image-classification.json)' }); decisions.platformUi.push(fileOf(im.src)); continue; }
  if (!im.localFile) {
    /* rule 4: a file the CDN refused (recorded in audit/failures.json; here: no localFile in the inventory) is never fetched again */
    const klass = cl ? cl.class : '';
    if (klass === 'content-person-real') { imageMap.set(im.src, { placeholder: { kind: 'portrait', needs: 'practice photo' }, why: 'real-person photo refused by the platform CDN (HTTP 403); never replaced by a generated face' }); decisions.refusedPlaceholder.push(fileOf(im.src)); continue; }
    if (klass === 'brand-product') { imageMap.set(im.src, { placeholder: { kind: 'brand', needs: 'brand image' }, why: 'third-party brand image refused by the platform CDN (HTTP 403); its brand name is printed instead' }); decisions.refusedPlaceholder.push(fileOf(im.src)); continue; }
    if (cl && cl.usableSibling) { pendingSiblings.push({ im, cl }); continue; }
    imageMap.set(im.src, { drop: true, why: 'refused by the platform CDN (HTTP 403) during the harvest' + (klass ? ' (' + klass + ')' : '') + '; no on-disk sibling; omitted (a generated stand-in may come later from the image plan)' });
    decisions.refusedDropped.push(fileOf(im.src));
    continue;
  }
  const abs = P(im.localFile);
  if (!fs.existsSync(abs)) { fail('build:asset', im.src, 'kept asset missing on disk: ' + im.localFile); continue; }
  const big = (im.intrinsicWidth || 0) >= 1000;
  const name = fileOf(im.src).replace(/\.[a-z0-9]+$/i, '');
  /* P3 (wf5b): the practice's two logo files ship byte-identical, never re-encoded (BRAND-SYSTEM 2 "use the files as
     they are"; DESIGN-SPEC A-17): chrome.logo.srcPattern (Riverside-Family-Eye-Care-Logo-01.png) and
     chrome.logo.srcPatternMobile (Riverside-Family-Eye-Care-Logo.png), matched by whole file name */
  const lossless = name === chrome.logo.srcPattern || fileOf(im.src) === chrome.logo.srcPatternMobile;
  const w = lossless ? images.web(abs, { lossless: true, name }) : images.web(abs, { maxW: big ? 1600 : 1200, q: 80, name });
  if (!w) { fail('build:asset', im.src, 'source file is not an image: ' + im.localFile); continue; }
  /* P1 (wf5b): the srcset widths of this file (360 ... 2400, capped at its intrinsic width; a lossless copy or a GIF
     is its own only width) */
  const variants = images.variants(abs, w, { q: 80, name });
  const srcAlt = (im.alts || []).find(Boolean) || '';
  const blank = garbageAlt(srcAlt, im.src);
  if (blank) decisions.altsBlanked++;
  const rec = { file: w.rel, w: w.w, h: w.h, variants, lossless, alt: blank ? '' : srcAlt, kind: 'source', cls, src: im.src, localFile: im.localFile, decision: im.decision };
  imageMap.set(im.src, rec);
  if (!byBase.has(fileOf(im.src))) byBase.set(fileOf(im.src), rec);
  const up_ = urlPath(im.src); if (up_ && !byPath.has(up_)) byPath.set(up_, rec);
  invBySrc.push({ src: im.src, rec });
  kept++;
}
/* refused stock photo with an on-disk sibling size (IMAGE-INVENTORY section 3): the sibling stands in, declared */
for (const { im, cl } of pendingSiblings) {
  const sibFile = cl.usableSibling && cl.usableSibling.file;
  const sibRec = sibFile ? invBySrc.map((x) => x.rec).find((r) => r.localFile === sibFile) : null;
  if (sibRec) { imageMap.set(im.src, Object.assign({}, sibRec, { siblingOf: im.src, why: 'refused by the platform CDN (HTTP 403); the on-disk sibling ' + sibRec.localFile + ' (' + (cl.usableSibling.basis || 'same name') + ') stands in (IMAGE-INVENTORY section 3)' })); decisions.refusedSibling.push(fileOf(im.src) + ' -> ' + path.basename(sibRec.localFile)); }
  else { imageMap.set(im.src, { drop: true, why: 'refused by the platform CDN (HTTP 403); its named sibling ' + (sibFile || '?') + ' is not on disk' }); decisions.refusedDropped.push(fileOf(im.src)); }
}
const byFileName = (abs) => { const p_ = urlPath(abs); return (p_ && byPath.get(p_)) || null; };

/* the practice logo (IN-1): chrome.logo.srcPattern, the source's own file */
const logoHit = invBySrc.find((x) => x.src.includes(chrome.logo.srcPattern));
if (!logoHit) throw new Error('logo not found in the image inventory: ' + chrome.logo.srcPattern);
const logoRec = { rel: logoHit.rec.file, w: logoHit.rec.w, h: logoHit.rec.h };
/* the mobile-header logo: chrome.logo.srcPatternMobile is the source's file name (Riverside-Family-Eye-Care-Logo.png,
   988x400), matched whole so the desktop "...-Logo-01.png" never matches it */
const mobileLogoHit = invBySrc.find((x) => fileOf(x.src) === chrome.logo.srcPatternMobile);
if (!mobileLogoHit) throw new Error('mobile logo not found in the image inventory: ' + chrome.logo.srcPatternMobile);
const mobileLogoRec = { rel: mobileLogoHit.rec.file, w: mobileLogoHit.rec.w, h: mobileLogoHit.rec.h };
/* P3: prove it - the shipped logo bytes ARE the source files */
for (const hit of [logoHit, mobileLogoHit]) {
  const same = hit.rec.lossless && sha256(fs.readFileSync(path.join(CACHE, hit.rec.file))) === sha256(fs.readFileSync(P(hit.rec.localFile)));
  if (!same) fail('build:asset', hit.rec.localFile, 'P3: the shipped logo is not byte-identical to the source file (' + hit.rec.file + ')');
}

/* ---------- 1a. P1 lookups: the srcset of any shipped image, by its file name ---------- */
const variantsByRel = new Map();   /* main rel -> [{ rel, w, h }] */
for (const { rec } of invBySrc) if (!variantsByRel.has(rec.file)) variantsByRel.set(rec.file, rec.variants);
const relUrl = (rel, depth) => up(depth) + 'img/' + rel;   /* page-relative, NOT shipped: a referenced file is copied after rendering (4b) */
const srcsetOf = (rel, depth) => {
  const v = variantsByRel.get(rel);
  if (!v) { fail('build:img', rel, 'P1: no width variants recorded for this shipped file'); return []; }
  return v.map((x) => ({ url: relUrl(x.rel, depth), w: x.w }));
};

/* ---------- 1b. P1 crop: the home hero frame (COMPONENTS B.4, gap I.3) ---------- */
/* DESIGN-SPEC 3.4 / Q-6: the frame is 4:3 and shows "a 4:3 crop of the 1920x800 original at 1067x800" at every width.
   x is chosen by eye (tmp/wf5b/pipeline/crop-*.png): 308 (36%) ends the frame left of the reception monitor (x 1390-
   1475, the practice's logo on its screen) and of the staff member at the desk (x 1445-1640). The 55% framing COMPONENTS
   B.4 gave the uncropped fallback would put the edge at x 1536, through her head; past her the next clean edge (x 1745)
   would end on a third-party brand display. Its files keep the source's base name (only the cache key differs), so
   keep-image-parity still knows them as this KEEP file. */
const CROPS = [{ page: '/', file: 'Riverside-Family-Eyecare-practice-interior-wide-shot.jpg', aspect: [4, 3], x: 308, why: 'DESIGN-SPEC 3.4 / Q-6: the 4:3 hero frame (COMPONENTS B.4, gap I.3)' }];
const cropByPage = new Map();   /* page -> { file (main rel of the source), crop: { rel, w, h, variants, rect } } */
for (const c of CROPS) {
  const hit = invBySrc.find((x) => fileOf(x.src) === c.file);
  if (!hit) { fail('build:asset', c.file, 'P1: crop source not in the image map'); continue; }
  const abs = P(hit.rec.localFile);
  const dim = imageSize(abs);
  const h = dim.h, w = Math.round((dim.h * c.aspect[0]) / c.aspect[1]);
  if (w > dim.w) { fail('build:asset', c.file, 'P1: a ' + c.aspect.join(':') + ' crop does not fit ' + dim.w + 'x' + dim.h); continue; }
  const rect = { x: c.x, y: Math.round((dim.h - h) / 2), w, h };
  if (rect.x < 0 || rect.x + w > dim.w) { fail('build:asset', c.file, 'P1: crop x ' + c.x + ' puts the ' + w + ' px crop outside ' + dim.w + ' px'); continue; }
  const name = c.file.replace(/\.[a-z0-9]+$/i, '');
  const main = images.web(abs, { maxW: w, q: 80, name, crop: rect, stat: 'crop' });
  cropByPage.set(c.page, { file: hit.rec.file, crop: { rel: main.rel, w: main.w, h: main.h, variants: images.variants(abs, main, { q: 80, name, crop: rect, stat: 'crop' }), rect } });
}
const cropOf = (p, rec, depth) => {
  const c = cropByPage.get(p);
  if (!c || c.file !== rec.file) return null;
  return { url: relUrl(c.crop.rel, depth), w: c.crop.w, h: c.crop.h, srcset: c.crop.variants.map((v) => ({ url: relUrl(v.rel, depth), w: v.w })) };
};

/* ---------- 1c. I.6: a background layer the design supersedes (declared, never silently dropped) ---------- */
const SUPERSEDED = [{ page: '/', file: 'Riverside-Family-Eyecare-practice-interior-wide-shot-new.jpg', why: 'superseded by the design (DESIGN-SPEC Q-6 and 3.4; COMPONENTS B.4, gap I.6): the home hero frame shows the 4:3 crop of the 1920x800 photo of the same scene at every width (sections[0].background[0].image.crop), so the design theme does not render this 1190x496 phone layer; it stays in the model, and the scaffold still renders it' }];
const supersededHits = new Map();
const supersededOf = (p, url) => {
  const s = SUPERSEDED.find((x) => x.page === p && fileOf(url) === x.file);
  if (!s) return null;
  supersededHits.set(s.page + '|' + s.file, (supersededHits.get(s.page + '|' + s.file) || 0) + 1);
  return s.why;
};

/* ---------- 1d. P4 + P7: the image plan (model.art) ---------- */
/* src/content/image-plan.json (IMAGE-PLAN 2-4) says which generated image goes where; audit/generated-images.json is
   the record of each master (file, sha256, model, provider). Every generated encode carries the IPTC
   trainedAlgorithmicMedia XMP label (images.mjs aiLabel; the label is in the cache key). Real arches that the plan
   names but does not generate (IMAGE-PLAN 4, image-plan.json notPlannedHere.realImages) are resolved here: TB-contact
   (the practice-interior photo, 7 pages) and TB-team (a team page with no portrait of its own takes the portrait or
   plate of the team card that links to it). */
const plan = readJSON(P('src/content/image-plan.json'));
const genRec = new Map((readJSON(P('audit/generated-images.json')).images || []).map((g) => [g.id, g]));
const SHIPPED_ROLES = new Set(['title-arch', 'inline-figure', 'stand-in', 'hero-cutout', 'home-feature', 'graft-cutout']);
const aiLabelOf = (g) => {
  const provider = g.provider || (/^fal-ai\//.test(g.model || '') ? 'fal.ai' : '');
  const cut = g.cutout && typeof g.cutout === 'object' && g.cutout.model ? ' + ' + g.cutout.model + ' cut-out' : '';
  return { sourceType: 'trainedAlgorithmicMedia', tool: [provider, g.model].filter(Boolean).join(' ') + cut, description: 'AI-generated illustrative image (Riverlight image plan ' + g.id + '). Not a photo of this practice, its people, its patients or its results.' };
};
const genCache = new Map();
function generated(masterId) {   /* -> { rel, w, h, variants, record } (P1 + P7), once per master */
  if (genCache.has(masterId)) return genCache.get(masterId);
  const g = genRec.get(masterId);
  if (!g || !g.file) throw new Error('P4: no audit/generated-images.json record for ' + masterId);
  const abs = P(g.file);
  if (!fs.existsSync(abs)) throw new Error('P4: generated master missing: ' + g.file);
  if (sha256(fs.readFileSync(abs)) !== g.sha256) throw new Error('P4: ' + g.file + ' is not the file its audit record describes (sha256)');
  const dim = imageSize(abs);
  const name = 'gen-' + masterId.toLowerCase();
  const aiLabel = aiLabelOf(g);
  const main = images.web(abs, { maxW: dim && dim.w >= 1000 ? 1600 : 1200, q: 80, name, aiLabel, stat: 'art' });
  const out = { rel: main.rel, w: main.w, h: main.h, variants: images.variants(abs, main, { q: 80, name, aiLabel, stat: 'art' }), record: g, label: aiLabel };
  genCache.set(masterId, out);
  return out;
}
/* navglass (operator, 2026-10-07): a mega-menu group's image is a generated master shipped through the same P1/P7 path as
   model.art (width variants, AI label); the srcset stops at 1080 w (a menu card is about 210 px wide) */
const menuArt = (id, depth) => {
  const g = generated(id);
  const set = g.variants.filter((v) => v.w <= 1080).sort((a, b) => a.w - b.w);
  if (!set.length) throw new Error('navglass: no width variant up to 1080 w for ' + id);
  return { url: relUrl(set[0].rel, depth), w: set[0].w, h: set[0].h, srcset: set.map((v) => relUrl(v.rel, depth) + ' ' + v.w + 'w').join(', ') };
};
const artTitle = new Map();    /* page -> { id, masterId, alt, objectPosition } (generated section defaults) */
const artInline = new Map();   /* page -> [{ id, masterId, alt, role, anchor, position, replaces }] */
const artHome = new Map();     /* role -> { id, masterId, alt } */
const planProblems = [];
for (const e of plan.images || []) {
  if (!SHIPPED_ROLES.has(e.role)) continue;   /* hero-video-still, graft-source: never shipped */
  const masterId = e.reuseOf || e.id;
  for (const u of e.usedFor || []) {
    if (e.role === 'title-arch') {
      for (const pg of u.pages || []) { if (artTitle.has(pg)) planProblems.push('two title arches for ' + pg + ': ' + artTitle.get(pg).id + ', ' + e.id); artTitle.set(pg, { id: e.id, masterId, alt: e.alt, objectPosition: u.objectPosition || null }); }
    } else if (e.role === 'hero-cutout' || e.role === 'home-feature' || e.role === 'graft-cutout') {
      if (u.page !== '/') { planProblems.push(e.id + ': a ' + e.role + ' outside the home (' + u.page + ')'); continue; }
      if (artHome.has(e.role)) planProblems.push('two ' + e.role + ' images: ' + artHome.get(e.role).id + ', ' + e.id);
      artHome.set(e.role, { id: e.id, masterId, alt: e.alt });
    } else {
      if (!u.page || !u.anchor) { planProblems.push(e.id + ': an inline use without page and anchor'); continue; }
      if (!artInline.has(u.page)) artInline.set(u.page, []);
      artInline.get(u.page).push({ id: e.id, masterId, alt: e.alt, role: e.role, anchor: u.anchor, position: u.position || null, replaces: u.replacesDeclared || null });
    }
  }
}
/* restructure: an adopted page takes its section's title arch (Services: TB-ecs, as /eye-care-services/eye-exams/;
   /terms/: TB-utility, as /privacy-policy/) */
for (const a of ADOPTED) {
  const like = a.path.startsWith('/services/') ? '/eye-care-services/eye-exams/' : '/privacy-policy/';
  if (!artTitle.has(like)) planProblems.push('restructure: no title arch on ' + like + ' to share with ' + a.path);
  else if (!artTitle.has(a.path)) artTitle.set(a.path, artTitle.get(like));
}
/* TB-contact (IMAGE-PLAN 4): the real practice-interior photo; the file is the one image-plan.json names */
const TB_CONTACT_FILE = ((/TB-contact \((assets\/source\/[^,)]+)/.exec((plan.notPlannedHere && plan.notPlannedHere.realImages) || '') || [])[1]) || null;
const tbContactHit = TB_CONTACT_FILE ? invBySrc.find((x) => x.rec.localFile === TB_CONTACT_FILE) : null;
if (!tbContactHit) planProblems.push('TB-contact: image-plan.json notPlannedHere.realImages names no shipped file (' + TB_CONTACT_FILE + ')');
const isTbContactPage = (pg) => pg === '/contact-us/' || pg.startsWith('/contact-us/') || pg === '/hours-location/' || pg === '/location/riverside-family-eyecare/';
for (const pr of planProblems) fail('build:art', 'src/content/image-plan.json', pr);

/* ---------- 2. helpers ---------- */
const pathOf = (url) => { const s = ownPath(url, ORIGIN); return s ? '/' + s + '/' : '/'; };
const willExist = new Set(content.pages.map((p) => ownPath(p.url, ORIGIN)).filter((v) => v !== null));
/* LK-1: the site's own live aliases are the only re-points and the only redirects */
const MOVED = seo.movedFromAliases(siteInv, ORIGIN);
if (MOVED.size !== 16) fail('build:plan', 'audit/site-inventory.json', 'expected the 16 live redirect aliases of SITE-ARCHITECTURE section 10, found ' + MOVED.size);
/* Q9: no PDF was harvested (assets/docs/ is empty); a PDF link renders as a labelled placeholder */
const pdfFor = (href, depth) => {
  const name = fileOf(href);
  if (!/\.pdf$/i.test(name) || !fs.existsSync(P('assets/docs', name))) return null;
  fs.mkdirSync(path.join(DIST, 'docs'), { recursive: true });
  fs.copyFileSync(P('assets/docs', name), path.join(DIST, 'docs', name));
  return up(depth) + 'docs/' + name;
};
/* VD-1: the 3 harvested mp4 files (audit/media-inventory.json) ship under dist/media/ */
const mediaShipped = new Set();
const mediaFor = (src, depth) => {
  let key = null;
  for (const k of Object.keys(mediaInv.map || {})) if (k === src || urlPath(k) === urlPath(src)) { key = k; break; }
  if (!key) return null;
  const name = path.basename(mediaInv.map[key]);
  const abs = P('assets/media', name);
  if (!fs.existsSync(abs)) return null;
  if (!mediaShipped.has(name)) { fs.copyFileSync(abs, path.join(DIST, 'media', name)); mediaShipped.add(name); }
  return { url: up(depth) + 'media/' + name, file: 'media/' + name, bytes: fs.statSync(abs).size };
};
/* row/column background photos: Beaver Builder layout CSS (audit/css/*layout*.css, node rules, @media kept)
   plus the lazy data-background-image-src attributes in the row markup */
const cssBackgrounds = new Map();   /* node id -> [{ url, media }] */
for (const f of fs.readdirSync(P('audit/css')).filter((x) => /layout/.test(x)).sort()) {
  const css = fs.readFileSync(P('audit/css', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const stack = [];
  let buf = '';
  for (let k = 0; k < css.length; k++) {
    const ch = css[k];
    if (ch === '{') { stack.push(buf.trim()); buf = ''; continue; }
    if (ch === '}') {
      const sel = stack.pop() || '';
      if (sel && !sel.startsWith('@')) {
        const m = /background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i.exec(buf);
        const node = (/\.fl-node-([a-z0-9]+)/i.exec(sel) || [])[1];
        if (m && node) {
          const media = stack.filter((s) => /^@media/i.test(s)).map((s) => s.replace(/^@media\s*/i, '').trim()).join(' and ') || null;
          const list = cssBackgrounds.get(node) || [];
          if (!list.some((x) => x.url === m[1] && x.media === media)) list.push({ url: m[1], media, from: /fl-col-content/.test(sel) ? 'column' : 'row' });
          cssBackgrounds.set(node, list);
        }
      }
      buf = '';
      continue;
    }
    buf += ch;
  }
}
/* the width range of the source's mobile header row (fl-visible-mobile): the Beaver Builder layout CSS hides every
   desktop-only row inside exactly this media query, which is where the mobile row shows. Read, never assumed. */
const MOBILE_MEDIA = (() => {
  const found = new Set();
  for (const f of fs.readdirSync(P('audit/css')).filter((x) => /layout/.test(x)).sort()) {
    const css = fs.readFileSync(P('audit/css', f), 'utf8');
    for (const m of css.matchAll(/@media\s*(\([^{]*?\))\s*\{\s*html\s+\.fl-visible-desktop:not\(\.fl-visible-mobile\)/g)) found.add(m[1].replace(/\s+/g, ' ').trim());
  }
  if (found.size !== 1) throw new Error('the mobile-row media query of the layout CSS is not unique: ' + JSON.stringify([...found]));
  return [...found][0];
})();
function rowBackgrounds(rowHtml) {
  const out = [];
  const seen = new Set();
  const nodes = [...rowHtml.matchAll(/\sdata-node="([a-z0-9]+)"/gi)].map((m) => m[1]);
  for (const n of nodes) for (const bg of cssBackgrounds.get(n) || []) { const k = fileOf(bg.url) + '|' + bg.media; if (!seen.has(k)) { seen.add(k); out.push(bg); } }
  for (const m of rowHtml.matchAll(/<(div)\b([^>]*)\sdata-background-image-src=["']([^"']+)["']/gi)) {
    const url = decodeEntities(m[3]);
    if (out.some((x) => fileOf(x.url) === fileOf(url))) continue;
    out.push({ url, media: null, from: /fl-col\b/.test(m[2]) ? 'column' : 'row' });
  }
  return out;
}
const backgroundRec = (url) => imageMap.get(url) || byPath.get(urlPath(url)) || byBase.get(fileOf(url)) || null;
/* favicon: the source's own site icons (cropped-Screenshot-2023-10-17-at-15.41.04-{32,192,180}), copied as-is */
const FAVICONS = [];
for (const [size, rel] of [['32x32', 'icon'], ['192x192', 'icon'], ['180x180', 'apple-touch-icon']]) {
  const hit = (imgInv.images || []).find((im) => im.localFile && /cropped-Screenshot-2023-10-17-at-15\.41\.04/.test(im.src) && im.src.includes('-' + size + '.'));
  if (!hit) { fail('build:asset', 'favicon ' + size, 'source site icon not in the harvest'); continue; }
  const name = rel === 'apple-touch-icon' ? 'apple-touch-icon.png' : 'favicon-' + size.split('x')[0] + '.png';
  fs.copyFileSync(P(hit.localFile), path.join(DIST, name));
  FAVICONS.push({ rel, href: name, sizes: size, type: 'image/png' });
}
const favicon = (depth) => FAVICONS.map((f) => Object.assign({}, f, { href: up(depth) + f.href }));
/* ---------- P2 (wf5b): the theme's files. STYLESHEETS / SCRIPTS are dist-relative paths; the model gets them
   page-relative (head.stylesheets, head.scripts). Scaffold: styles/scaffold.css and no script, as before. Design
   theme: ONE stylesheet, the shipped layers of src/styles/{tokens,fonts,riverlight,motion}.css concatenated in that
   order (tokens.css and motion.css ship only what follows their marker line: above it is the measured source,
   evidence that never ships), fingerprinted theme/riverlight.<8 hex of its sha256>.css; ONE script,
   theme/site.<8 hex>.js; every other file of src/theme/** byte-identical under dist/theme/; the hero loop of
   assets/media/ (wf4) under dist/theme/media/. Fingerprints: GitHub Pages caches CSS/JS for 10 minutes. ---------- */
const THEME_LAYERS = [
  { file: 'tokens.css', marker: '/* ===== REDESIGN TOKENS ===== */' },
  { file: 'fonts.css', marker: null },
  { file: 'riverlight.css', marker: null },
  { file: 'motion.css', marker: '/* @redesign-motion */' },
];
const HERO_MEDIA = ['hero-river.webm', 'hero-river.mp4', 'hero-river-phone.mp4', 'hero-river-poster.webp', 'hero-river-poster-phone.webp'];
const theme = { mode: THEME, root: path.relative(PROJ, THEME_ROOT).split(path.sep).join('/') || '.', stylesheet: null, script: null, layers: [], files: [], media: [] };
let STYLESHEETS = ['styles/scaffold.css'];
let SCRIPTS = [];
if (THEME === 'riverlight') {
  const parts = [];
  let charset = false;
  for (const L of THEME_LAYERS) {
    const abs = path.join(THEME_ROOT, 'styles', L.file);
    if (!fs.existsSync(abs)) { fail('build:theme', 'styles/' + L.file, 'P2: a shipped layer of the design theme is missing'); continue; }
    let css = fs.readFileSync(abs, 'utf8').replace(/^﻿/, '');
    if (L.marker) {
      const at = css.indexOf(L.marker);
      if (at === -1) { fail('build:theme', 'styles/' + L.file, 'P2: no marker line ' + L.marker + ' (only what follows it ships)'); continue; }
      css = css.slice(at + L.marker.length);
    }
    if (/@import\b/i.test(css.replace(/\/\*[\s\S]*?\*\//g, ''))) fail('build:theme', 'styles/' + L.file, 'P2: @import in a shipped layer (one self-contained stylesheet; no runtime fetch)');
    css = css.replace(/@charset\s+["'][^"']*["']\s*;/gi, () => { charset = true; return ''; }).trim();
    parts.push('/* ' + L.file + (L.marker ? ' (redesign layer)' : '') + ' */\n' + css + '\n');
    theme.layers.push({ file: L.file, bytes: Buffer.byteLength(css), sha256: sha256(css) });
  }
  /* QA round 1 (PERF-12): the shipped bundle is minified (src/lib/util.mjs minifyCss: comments and insignificant
     whitespace only; the layer sources keep their comments). Unminified it was 107 KB, 22.2 KB gzipped (budget 22.5) */
  const bundle = minifyCss((charset ? '@charset "UTF-8";\n' : '') + parts.join('\n'));
  const css = 'theme/riverlight.' + sha256(bundle).slice(0, 8) + '.css';
  fs.writeFileSync(path.join(DIST, css), bundle);
  theme.stylesheet = { path: css, bytes: Buffer.byteLength(bundle), sha256: sha256(bundle) };
  STYLESHEETS = [css];
  const jsAbs = path.join(THEME_ROOT, 'theme', 'site.js');
  if (!fs.existsSync(jsAbs)) fail('build:theme', 'theme/site.js', 'P2: the design theme has no script (src/theme/site.js)');
  else {
    /* QA round 1 (PERF-12): the script ships without its full-line comments (src/lib/util.mjs stripJsLineComments),
       fail closed: a template literal in the source, or a result that does not compile, stops the build */
    const jsSrc = fs.readFileSync(jsAbs, 'utf8');
    if (jsSrc.includes(String.fromCharCode(96))) fail('build:theme', 'theme/site.js', 'P2: a template literal in site.js: the full-line comment strip is not safe for it');
    const js = Buffer.from(stripJsLineComments(jsSrc));
    try { new vm.Script(js.toString('utf8'), { filename: 'site.js' }); } catch (e) { fail('build:theme', 'theme/site.js', 'P2: the comment-stripped script does not compile: ' + e.message); }
    const name = 'theme/site.' + sha256(js).slice(0, 8) + '.js';
    fs.writeFileSync(path.join(DIST, name), js);
    theme.script = { path: name, bytes: js.length, sha256: sha256(js) };
    SCRIPTS = [name];
  }
  /* every other theme file, byte-identical (fonts, stills, SVG ribbons); dot-files never ship */
  for (const rel of walk(path.join(THEME_ROOT, 'theme'))) {
    if (rel === 'site.js' || rel.split('/').some((seg) => seg.startsWith('.'))) continue;
    const out = path.join(DIST, 'theme', rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(path.join(THEME_ROOT, 'theme', rel), out);
    theme.files.push('theme/' + rel);
  }
  /* the hero loop and its posters (IMAGE-PLAN 7, audit/generated-media.json), byte-identical: the posters already carry
     the XMP label, the clips the label in their container metadata (make-loop) */
  for (const f of HERO_MEDIA) {
    const abs = P('assets/media', f);
    if (!fs.existsSync(abs)) { fail('build:theme', 'assets/media/' + f, 'P2: hero loop file missing'); continue; }
    const out = path.join(DIST, 'theme', 'media', f);
    if (fs.existsSync(out) && sha256(fs.readFileSync(out)) !== sha256(fs.readFileSync(abs))) { fail('build:theme', 'theme/media/' + f, 'P2: src/theme/media/' + f + ' and assets/media/' + f + ' differ'); continue; }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(abs, out);
    theme.media.push('theme/media/' + f);
  }
  /* fail closed: every url() of the bundle resolves to a shipped file (link-check repeats this on the built tree) */
  for (const m of bundle.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'")\s]+))\s*\)/gi)) {
    const u = (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]).trim();
    if (!u || /^(data:|#|https?:|\/\/)/i.test(u)) { if (/^(https?:|\/\/)/i.test(u)) fail('build:theme', css, 'P2: the stylesheet fetches from another host: ' + u); continue; }
    const target = path.resolve(path.join(DIST, 'theme'), u.split(/[?#]/)[0]);
    if (!fs.existsSync(target) || !target.startsWith(DIST)) fail('build:theme', css, 'P2: url(' + u + ') resolves to no shipped file');
  }
}
const stylesheets = (depth) => STYLESHEETS.map((f) => up(depth) + f);
const scripts = (depth) => SCRIPTS.map((f) => up(depth) + f);
/* og:image: the page's own source share image when it maps to a shipped local file; else the practice logo.
   QA round 1 (wf6, CONTENT-16): in the source's own format. The source's share images were JPEG and PNG only, and not
   every share target renders WebP, so og:image (and twitter:image) point at a byte-identical copy of the harvested file
   (named like a P3 lossless copy: <name>.<sha256 10 hex>.<ext>), not at the page's WebP encode. No pixel is re-encoded. */
const ogCopies = new Map();
const ogFileFor = (rec) => {
  if (ogCopies.has(rec.file)) return ogCopies.get(rec.file);
  let rel = rec.file;
  const ext = rec.localFile ? path.extname(rec.localFile).toLowerCase() : '';
  if (/\.webp$/i.test(rec.file) && /^\.(jpe?g|png)$/.test(ext) && fs.existsSync(P(rec.localFile))) {
    const bytes = fs.readFileSync(P(rec.localFile));
    rel = rec.file.replace(/\.[0-9a-f]{10}\.webp$/i, '') + '.' + sha256(bytes).slice(0, 10) + ext;
    if (!fs.existsSync(path.join(CACHE, rel))) fs.writeFileSync(path.join(CACHE, rel), bytes);
  }
  ogCopies.set(rec.file, rel);
  return rel;
};
const ogImageFor = (ogSrc) => {
  const rec = (ogSrc && (imageMap.get(ogSrc) || byPath.get(urlPath(ogSrc)) || byBase.get(fileOf(ogSrc)))) || null;
  const rel = rec && !rec.drop && !rec.placeholder && rec.kind === 'source' ? ogFileFor(rec) : logoRec.rel;
  ship(rel);
  return ORIGIN + '/img/' + rel;
};
/* SC-1 decision: the two unrendered shortcodes print the account value they request (client-facts.json) */
const SHORTCODES = [
  { re: /\[account get=(?:'|&#0?39;|&#8217;|’)name(?:'|&#0?39;|&#8217;|’)\]/g, from: "[account get='name']", to: facts.brand },
  { re: /\[location get=(?:'|&#0?39;|&#8217;|’)city(?:'|&#0?39;|&#8217;|’)\]/g, from: "[location get='city']", to: chrome.address.locality },
];
/* CY-1 decision: reproduce the Cherry widget exactly as the source loads it IF it works standalone, else link to the
   Cherry application URL. Tested (tools/render-check.mjs --cherry, docs/OPEN-DECISIONS.md A.4): from a non-practice
   origin only its static hero draws, its API calls fail and it throws; the source markup holds no application URL. So
   the default is the fallback ("link"): the page's own label, linked to RFEC_CHERRY_URL when the practice supplies
   one, else a labelled data-needs placeholder. RFEC_CHERRY=embed reproduces the source embed (after a test on the
   practice's own domain). */
const CHERRY_MODE = process.env.RFEC_CHERRY === 'embed' ? 'embed' : 'link';
const cherryNav = (chrome.navSource || chrome.nav).flatMap((n) => [n, ...(n.children || [])]).find((n) => n.href === '/cherry-payment-plan/');
const MAP_SRC = 'https://www.google.com/maps?q=' + encodeURIComponent(chrome.mapQuery) + '&output=embed';
const familyOf = new Map();
for (const [fam, paths] of Object.entries(siteMap.templates)) for (const p of paths) familyOf.set(p, fam);
for (const a of ADOPTED) familyOf.set(a.path, 'interior');
const homeRowKind = new Map(((archMap.home && archMap.home.rows) || []).map((r) => [r.node, r.kind]));
const rawOf = (page) => page.adoptedRaw || fs.readFileSync(P('audit/raw', page.savedAs), 'utf8');

/* the site menus' labels (primary menu + children, footer menu, utility links): a /template/* menu made only of these
   is a copy of the chrome; any other menu is page content (content.mjs prepare) */
/* (restructure: the SOURCE menus, kept in chrome.json navSource / footerSource, are what the /template/* pages copy) */
const SRC_NAV = chrome.navSource || chrome.nav, SRC_FOOT = chrome.footerSource || chrome.footer;
const SITE_MENU_LABELS = [...SRC_NAV.flatMap((n) => [n, ...(n.children || [])]), ...SRC_FOOT.columns.flatMap((c) => c.links), ...SRC_FOOT.util].map((x) => x.label);
const C = createContent({ origin: ORIGIN, imageMap, willExist, moved: MOVED, fail, stats, imgUrl, mapQuery: chrome.mapQuery, pdfFor, garbageAlt, byFileName, siteMenuLabels: SITE_MENU_LABELS });
const T = createTemplates();
const M = createPageModel({
  C, chrome, origin: ORIGIN, seoBy, familyOf, imgUrl, ship, fail, stats, MAP_SRC, rowBackgrounds, backgroundRec, mediaFor, pdfFor, seo,
  parseConditionalLogic, parseGravityForm, logoRec, mobileLogoRec, mobileMedia: MOBILE_MEDIA, ogImageFor, garbageAlt, shortcodes: SHORTCODES, cherryMode: CHERRY_MODE, cherryUrl: /^https:\/\//.test(process.env.RFEC_CHERRY_URL || '') ? process.env.RFEC_CHERRY_URL : null,
  rawOf, willExist, seoLog, favicon, stylesheets, scripts, homeRowKind, altBlanks,
  srcsetOf, relUrl, cropOf, supersededOf, menuArt,
  ui: { financing: cherryNav ? { label: cherryNav.label, href: cherryNav.href } : null },
});

/* ---------- 3. pages ---------- */
const MODEL_DIR = P('tmp/page-models');
if (DUMP_MODELS) { fs.rmSync(MODEL_DIR, { recursive: true, force: true }); fs.mkdirSync(MODEL_DIR, { recursive: true }); }
const modelName = (m) => (m.as404 ? '404' : m.slug ? m.slug.replace(/\//g, '__') : 'index') + '.json';
const pageRecords = [];
const canonicalBySlug = new Map();
const declaredByPage = [];
let built = 0;
const H1_LABELS = new Map(cherryNav ? [['/cherry-payment-plan/', { text: cherryNav.label, why: 'no source h1 (the page body is the Cherry widget); the page\'s own primary-menu label (chrome.json nav)' }]] : []);

function rootRelative(html) {
  /* COMPONENTS F.7: hosts serve dist/404.html at the failing request's own path, at ANY depth, so every URL in
     that one file is root-relative ("x/index.html" -> "/x/"), under the deploy base (BASE, D7: "/" by default) */
  const rootRel = (v) => {
    if (!v || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(v)) return v;
    const cut = v.indexOf('#'), pathPart = cut < 0 ? v : v.slice(0, cut), hash = cut < 0 ? '' : v.slice(cut);
    return (BASE + pathPart.replace(/^\.\//, '')).replace(/(^|\/)index\.html$/, '$1') + hash;
  };
  /* (navglass: the mega menu's deferred images, data-src / data-srcset, are URLs too) */
  return html.replace(/(\s(?:href|src|poster|data-src))="([^"]*)"/g, (m, a, v) => a + '="' + rootRel(v) + '"')
    .replace(/(\s(?:srcset|imagesrcset|data-srcset))="([^"]*)"/g, (m, a, v) => a + '="' + v.split(',').map((part) => { const t = part.trim().split(/\s+/); t[0] = rootRel(t[0]); return t.join(' '); }).join(', ') + '"');
}

/* Pages are built in three passes (wf5b): every model first, then model.art (a team page with no portrait of its own
   takes its arch from the team card on ANOTHER page that links to it, so every model must exist), then rendering. The
   models are built in the same order as before, so every counter and report keeps its order. */
function buildModel(page, opts = {}) {
  const p = pathOf(page.url);
  return M.build(page, Object.assign({}, opts, { h1Label: H1_LABELS.get(p) || null }));
}
function emit(model) {
  let html = model.isHome ? T.renderPage(model, buildHome(model, T)) : T.renderPage(model);
  if (model.as404) html = rootRelative(html);
  const out = model.as404 ? path.join(DIST, '404.html') : (model.slug ? path.join(DIST, model.slug, 'index.html') : path.join(DIST, 'index.html'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  if (DUMP_MODELS) fs.writeFileSync(path.join(MODEL_DIR, modelName(model)), JSON.stringify(model, null, 1) + '\n');
  /* the dist/404.html model repeats the declarations of its source page (/404-page-not-found/, built on its own) */
  if (model.declared.length && !model.as404) declaredByPage.push({ page: model.path, items: model.declared });
  if (!model.as404) {
    built++;
    canonicalBySlug.set(model.slug, ownPath(model.canonical, ORIGIN));
    if (model.noindex) seoLog.noindex.push(model.path);
    pageRecords.push({
      path: model.path, family: model.family, layout: model.layout, noindex: model.noindex, robots: model.robots, title: model.title, h1: model.h1.text, h1Source: model.h1.source,
      description: model.metaDescription.source, canonical: model.canonical, aside: model.aside ? model.aside.variant : null, sections: model.sections.length,
      blocks: model.sections.reduce((a, s) => { for (const b of s.blocks) a[b.type] = (a[b.type] || 0) + 1; return a; }, {}),
      images: model.images.length, placeholders: model.placeholders.map((x) => x.kind + ':' + x.label), embeds: model.embeds.map((e) => e.kind),
    });
  }
  return model;
}

const models = [];
for (const page of content.pages) {
  try { models.push(buildModel(page)); } catch (e) { fail('build:page', page.url, String((e && e.stack) || e).slice(0, 800)); }
}
/* dist/404.html: the /404-page-not-found/ content at depth 0 (COMPONENTS F.7) */
{
  const p404 = content.pages.find((p) => pathOf(p.url) === '/404-page-not-found/');
  if (!p404) fail('build:page', '404.html', 'no /404-page-not-found/ page in the inventory');
  else { try { models.push(buildModel(p404, { as404: true, depth: 0 })); } catch (e) { fail('build:page', '404.html', String((e && e.stack) || e).slice(0, 800)); } }
}

/* ---------- 3b. P4: model.art on every model (COMPONENTS 0.12; gaps I.4, I.7, I.11, I.15) ---------- */
/* Arch resolution (COMPONENTS B.21): a team page with its own team block and a hub with its own header photo keep
   their model image (art.title null); every other band model takes art.title: the image plan's section default
   (generated), TB-contact (the real practice interior) or TB-team (a team page with no portrait of its own: the
   portrait or plate of the team card that links to it). A band model with no arch at all fails the build. */
const artLog = { title: {}, inline: 0, home: [], blanksDeclared: 0, added: [] };
{
  const byPath = new Map(models.map((m) => [m.path, m]));
  for (const pg of [...artTitle.keys(), ...artInline.keys()]) if (!byPath.has(pg)) fail('build:art', pg, 'P4: image-plan.json names a page that has no model');
  /* team cards that link to a team page: path -> [{ photo, placeholder }] (the home and the hubs hold them) */
  const cards = new Map();
  for (const m of models) for (const s of m.sections) for (const b of s.blocks) if (b.type === 'team') for (const mem of b.members) if (mem.path && mem.path !== m.path) {
    if (!cards.has(mem.path)) cards.set(mem.path, []);
    cards.get(mem.path).push({ from: m.path, photo: mem.photo, placeholder: mem.placeholder, name: mem.name });
  }
  const recByFile = new Map(invBySrc.map((x) => [x.rec.file, x.rec]));
  const classBySrcFile = new Map(classification.images.map((c) => [fileOf(c.src), c]));
  const realImage = (rec) => ({ rel: rec.file, w: rec.w, h: rec.h, variants: rec.variants });
  for (const m of models) {
    try {
      const own = m.sections.some((s) => s.blocks.some((b) => b.type === 'team' && b.members.length && (b.members[0].photo || b.members[0].placeholder)));
      const hubPhoto = m.family === 'builder-hub' && m.sections[0] && m.sections[0].background && m.sections[0].background[0] ? m.sections[0].background[0].image : null;
      const spec = { title: null, inline: [], home: null };
      const t = artTitle.get(m.path);
      if (m.isHome) { /* no title band */ }
      else if (t) spec.title = { id: t.id, image: generated(t.masterId), alt: t.alt, ai: true, objectPosition: t.objectPosition };
      else if (isTbContactPage(m.path) && tbContactHit) {
        spec.title = { id: 'TB-contact', image: realImage(tbContactHit.rec), alt: '', ai: false, objectPosition: null };
        /* the arch is ambient (alt ""); where the source page shows this photo with an alt, that is a declared blank */
        const cl = classBySrcFile.get(fileOf(tbContactHit.src));
        if (cl && (cl.visibleOn || []).some((v) => v.replace(/\/?$/, '/') === m.path) && tbContactHit.rec.alt) { altBlanks.push({ page: m.path, src: tbContactHit.src, alt: tbContactHit.rec.alt, where: 'title-arch' }); artLog.blanksDeclared++; }
      } else if (m.family === 'team-member' && !own) {
        const cs = cards.get(m.path) || [];
        const keys = [...new Set(cs.map((c) => (c.photo ? 'photo:' + c.photo.file + '|' + c.photo.alt : c.placeholder ? 'plate:' + c.placeholder.label : 'none')))];
        if (keys.length !== 1 || keys[0] === 'none') throw new Error('P4: team page with no portrait of its own: the team cards that link to it give ' + (keys.join(' / ') || 'nothing'));
        const c = cs[0];
        if (c.photo) { const rec = recByFile.get(c.photo.file); if (!rec) throw new Error('P4: team portrait not in the image map: ' + c.photo.file); spec.title = { id: 'TB-team', image: realImage(rec), alt: c.photo.alt, ai: false, objectPosition: null }; }
        else spec.title = { id: 'TB-team', placeholder: { kind: c.placeholder.kind, label: c.placeholder.label, needs: c.placeholder.needs } };
      } else if (!(m.family === 'team-member' && own) && !hubPhoto) throw new Error('P4: band model with no arch: no team portrait, no hub header photo, no image-plan default');
      for (const e of artInline.get(m.path) || []) {
        /* a stand-in fills exactly the slot whose refused image this page declares dropped (IMAGE-PLAN 3.3) */
        if (e.replaces && !m.declared.some((d) => /^(image|background)-dropped$/.test(d.kind) && d.src === e.replaces)) throw new Error('P4: ' + e.id + ' replaces ' + e.replaces + ', which this page does not declare dropped');
        spec.inline.push({ id: e.id, image: generated(e.masterId), alt: e.alt, ai: true, role: e.role, anchor: e.anchor, position: e.position });
      }
      if (m.isHome) {
        spec.home = {};
        for (const role of ['hero-cutout', 'home-feature', 'graft-cutout']) { const h = artHome.get(role); spec.home[role] = h ? { id: h.id, image: generated(h.masterId), alt: h.alt, ai: true } : null; }
        if (!spec.home['hero-cutout'] || !spec.home['home-feature']) throw new Error('P4: the image plan gives the home no hero-cutout / home-feature');
      }
      m.art = M.artOf(m, spec);
      /* the record of every image the redesign ADDS to a page (audit/clone-removals.json images.added) */
      const add = (slot, id, img, alt, ai, replaces) => artLog.added.push(Object.assign({ page: m.path, slot, id, file: img.url.split('/').pop(), alt, ai }, replaces ? { replaces } : {}));
      if (m.art.title) { artLog.title[m.art.title.id] = (artLog.title[m.art.title.id] || 0) + 1; if (m.art.title.url) add('title-arch', m.art.title.id, m.art.title, m.art.title.alt, m.art.title.ai); }
      for (const e of m.art.inline) { artLog.inline++; add('inline', e.id, e.image, e.image.alt, e.image.ai, (artInline.get(m.path).find((x) => x.id === e.id) || {}).replaces || null); }
      if (m.art.home) for (const [role, h] of Object.entries(m.art.home)) if (h) { artLog.home.push(role + ':' + h.id); add('home:' + role, h.id, h, h.alt, h.ai); }
    } catch (e) { m.art = { title: null, inline: [], home: null }; fail('build:art', m.path, String((e && e.message) || e).slice(0, 600)); }
  }
  /* I.6 and the crop landed where the contract says, or the build fails */
  const home = byPath.get('/');
  for (const s of SUPERSEDED) if (!supersededHits.get(s.page + '|' + s.file)) fail('build:art', s.page, 'I.6: the superseded layer ' + s.file + ' is not on that page');
  for (const [pg] of cropByPage) { const m = byPath.get(pg); if (!m || !(m.sections[0] && m.sections[0].background[0] && m.sections[0].background[0].image.crop)) fail('build:art', pg, 'P1: the crop is not on sections[0].background[0].image'); }
  if (!home) fail('build:art', '/', 'no home model');
}

for (const model of models) {
  try { emit(model); } catch (e) { fail('build:page', model.url, String((e && e.stack) || e).slice(0, 800)); }
}

/* ---------- 4. static assets ---------- */
if (THEME === 'scaffold') {
  for (const f of STYLESHEETS) {
    const src = P('src', f);   /* styles/scaffold.css; tokens.css / motion.css are stage evidence, never shipped */
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, f));
    if (!fs.existsSync(path.join(DIST, f))) fail('build:asset', 'src/' + f, 'linked stylesheet not shipped');
  }
}

/* ---------- 4b. ship only images something references ---------- */
/* A file the model references but no page links stays out of dist (P1 variants, the crop and model.art reach dist/img
   only when a rendered page names them: they are copied here from the cache, after rendering). */
{
  const refd = new Set();
  for (const rel of walk(DIST)) {
    if (!/\.(html|css|js)$/i.test(rel)) continue;
    const body = fs.readFileSync(path.join(DIST, rel), 'utf8');
    for (const m of body.matchAll(/img\/([A-Za-z0-9._-]+\.(?:webp|png|jpe?g|gif|svg|ico))/g)) refd.add(m[1]);
  }
  let fromCache = 0;
  for (const rel of [...refd].sort()) {
    const out = path.join(DIST, 'img', rel);
    if (!fs.existsSync(out) && fs.existsSync(path.join(CACHE, rel))) { fs.copyFileSync(path.join(CACHE, rel), out); fromCache++; }
  }
  let pruned = 0;
  for (const rel of walk(path.join(DIST, 'img'))) if (!refd.has(rel)) { fs.unlinkSync(path.join(DIST, 'img', rel)); pruned++; }
  stats.unreferencedImagesPruned = pruned;
  stats.imagesFromCacheAfterRender = fromCache;
}

/* ---------- 5. sitemap + robots (indexable canonical pages only) ---------- */
const sitemapUrls = pageRecords.filter((r) => !r.noindex)
  .map((r) => remap(r.path.replace(/^\/|\/$/g, '')))
  .filter((slug) => (canonicalBySlug.get(slug) ?? slug) === slug)
  .sort()
  .map((slug) => ORIGIN + '/' + (slug ? slug + '/' : ''));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapUrls.map((u) => '  <url><loc>' + esc(u) + '</loc></url>').join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + ORIGIN + '/sitemap.xml\n');

/* ---------- 5b. redirect map: exactly the source's own live aliases (no redirect the source never had) ---------- */
const rLines = [...MOVED].filter(([, to]) => to === '' || willExist.has(to)).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([f, t]) => ['/' + f + '/', t ? '/' + remap(t) + '/' : '/', 'source 301 (live alias, audit/site-inventory.json)']);
/* restructure: every source page that moved is redirected to its new path; the GitHub Pages preview (no redirect file)
   gets a redirect page per old path from tmp/restructure/stubs/ (never in dist/, where a file at the old path would
   shadow the host's redirect rule on Netlify) */
{
  const finalPaths = new Map();
  for (const m of models) if (!m.as404) { if (finalPaths.has(m.slug)) fail('build:plan', 'src/lib/restructure.mjs', 'two pages share the path /' + m.slug + '/: ' + finalPaths.get(m.slug) + ' and ' + m.path); finalPaths.set(m.slug, m.path); }
  for (const [from] of MOVED) if (finalPaths.has(from)) fail('build:plan', 'src/lib/restructure.mjs', 'the live alias /' + from + '/ is now a page of the restructured site; its redirect would hide it');
  const moves = [...willExist].filter((p) => p && remap(p) !== p).sort();
  const STUBS = P('tmp/restructure/stubs');
  fs.rmSync(STUBS, { recursive: true, force: true });
  for (const p of moves) {
    if (finalPaths.has(p)) fail('build:plan', 'src/lib/restructure.mjs', 'the moved path /' + p + '/ is also a page of the restructured site');
    rLines.push(['/' + p + '/', '/' + remap(p) + '/', 'restructure 301 (src/lib/restructure.mjs)']);
    fs.mkdirSync(path.join(STUBS, p), { recursive: true });
    fs.writeFileSync(path.join(STUBS, p, 'index.html'), redirectPage(p, remap(p), ORIGIN));
  }
  stats.restructureMoves = moves.length;
  rLines.sort((a, b) => (a[0] < b[0] ? -1 : 1));
}
/* the host-level files name paths from the deploy base (D7): "/" leaves them exactly as the root deploy needs them */
const atBase = (p) => BASE.replace(/\/$/, '') + p;
fs.writeFileSync(path.join(DIST, '_redirects'), '# Redirects: the live site\'s own aliases, plus every page the restructure moved (see audit/redirects.json)\n' + rLines.flatMap(([f, t]) => [atBase(f) + '  ' + atBase(t) + '  301', atBase(f).replace(/\/$/, '') + '  ' + atBase(t) + '  301']).join('\n') + '\n');
fs.writeFileSync(path.join(DIST, '.htaccess'), '# 404 page (dist/404.html; its URLs are root-relative)\nErrorDocument 404 ' + atBase('/404.html') + '\n\n# Redirects: the live site\'s own aliases, plus every page the restructure moved (see audit/redirects.json)\n' + rLines.map(([f, t]) => 'RedirectMatch 301 ^' + atBase(f).replace(/\/$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/?$ ' + atBase(t)).join('\n') + '\n');
stats.redirects = rLines.length;

/* ---------- 6. reports (canonical build only; RFEC_DIST builds write nothing to audit/) ---------- */
const removals = buildRemovals();
const report = {
  schema: 'rfec/build-report@1', dist: path.relative(PROJ, DIST).split(path.sep).join('/') || '.',
  pages: { built, of: content.pages.length, plus404: fs.existsSync(path.join(DIST, '404.html')) },
  images: { keptSource: kept, shipped: shipped.size, pruned: stats.unreferencedImagesPruned, encoded: stats.encoded || 0, cached: stats.cached || 0, vendorDropped: decisions.vendor.length, platformUiDropped: decisions.platformUi.length, refusedPlaceholders: decisions.refusedPlaceholder.length, refusedSiblings: decisions.refusedSibling.length, refusedDropped: decisions.refusedDropped.length, altsBlanked: decisions.altsBlanked,
    /* wf5b: P3 lossless copies; P1 variant, crop and P4/P7 art encodes (each its own counters, so encoded/cached above
       still count the source images' main encodes); files copied from the cache because a rendered page names them */
    copiedLossless: stats.copiedLossless || 0, variants: { encoded: stats.variantsEncoded || 0, cached: stats.variantsCached || 0, files: [...variantsByRel.values()].reduce((a, v) => a + v.length, 0) }, crop: { encoded: stats.cropEncoded || 0, cached: stats.cropCached || 0 }, art: { encoded: stats.artEncoded || 0, cached: stats.artCached || 0, labelledThisRun: stats.aiLabelled || 0, labelledFiles: new Set([...genCache.values()].flatMap((g) => [g.rel, ...g.variants.map((v) => v.rel)])).size, masters: [...genCache.keys()].sort() }, fromCacheAfterRender: stats.imagesFromCacheAfterRender || 0 },
  theme,
  art: { titleBy: artLog.title, titles: Object.values(artLog.title).reduce((a, n) => a + n, 0), inline: artLog.inline, home: artLog.home, altBlanksDeclared: artLog.blanksDeclared, models: models.filter((m) => m.art).length },
  media: [...mediaShipped].sort(),
  content: Object.fromEntries(Object.entries(stats).filter(([k, v]) => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean')),
  lists: { dupSections: stats.dupSections || [], withinCardDupeTexts: stats.withinCardDupeTexts || [], liftsSkipped: stats.liftsSkipped_ || [] },
  figureRoles: stats.figureRoles,
  links: { moved: [...stats.moved.entries()].sort().map(([p, n]) => ({ from: '/' + p + '/', to: '/' + MOVED.get(p) + '/', references: n })), dead: [...stats.dead.entries()].sort().map(([p, n]) => ({ path: '/' + p + '/', references: n })) },
  seo: { titlesRepaired: seoLog.titles.length, canonicalsChanged: seoLog.canonicals.length, descriptionsDerived: seoLog.descriptions, descriptionsNotDerived: seoLog.descriptionsNotDerived.length, structuredData: seoLog.structuredData.reduce((a, x) => { const k = x.type + ' ' + x.decision; a[k] = (a[k] || 0) + 1; return a; }, {}), noindex: seoLog.noindex.length, sitemapUrls: sitemapUrls.length, redirects: rLines.length },
  base: BASE,
  families: pageRecords.reduce((a, r) => { a[r.family] = (a[r.family] || 0) + 1; return a; }, {}),
  cherry: CHERRY_MODE,
  failures,
};
if (REPORTS) {
  const aud = (f, obj) => fs.writeFileSync(P('audit', f), JSON.stringify(obj, null, 2) + '\n');
  aud('build-report.json', report);
  aud('build-pages.json', { schema: 'rfec/build-pages@1', pages: pageRecords });
  aud('clone-removals.json', removals);
  aud('seo-repairs.json', { schema: 'site-reforge/seo-repairs@1', note: 'Head-level fields: source values carried forward; repairs only from the page own content or a declared decision.', titles: seoLog.titles, openGraph: seoLog.openGraph, canonicals: seoLog.canonicals, descriptionsDerived: seoLog.descriptions, descriptions: seoLog.derivedDescriptions, descriptionsNotDerived: seoLog.descriptionsNotDerived, descriptionsRemoved: seoLog.descriptionsRemoved, h1: seoLog.h1Labels, noindex: seoLog.noindex, structuredDataNote: 'Every application/ld+json block of every raw page that is not one of the platform\'s site-wide types (replaced: audit/clone-removals.json elements): CARRY (verbatim), REPAIR (carried with the listed field repairs, each with from / to / why) or REMOVE (with why). src/lib/seo.mjs sourceStructuredData; tools/seo-parity.mjs checks it.', structuredData: seoLog.structuredData });
  aud('redirects.json', { schema: 'rfec/redirects@1', note: 'Emitted as dist/_redirects and dist/.htaccess: the 16 live aliases of the source (re-pointed to the restructured paths) and one 301 per page the restructure moved (src/lib/restructure.mjs).', redirects: rLines.map(([from, to, why]) => ({ from, to, status: 301, why })) });
  aud('dead-links.json', { schema: 'site-reforge/dead-links@1', note: 'Internal targets the SOURCE links to but no page serves (not an alias). The anchor is unwrapped; the link text is kept. Re-pointed alias links are listed under moved.', targets: report.links.dead, moved: report.links.moved });
  /* audit/failures.json is site-reforge stage evidence (the crawl/assets record): R merged its build:* items into
     that file; this build neither reads nor writes it. Build failures live in build-report.json `failures` and set
     the exit code. */
}

/* audit/clone-removals.json: every deliberate removal with its reason (the parity tools read it) */
function buildRemovals() {
  const pageScoped = [];
  for (const d of declaredByPage) for (const it of d.items) {
    if (it.kind === 'excerpt') pageScoped.push({ page: d.page, value: it.text, decision: 'REMOVE', reason: 'Contact-lens product excerpt: the platform\'s truncated copy of the product text (#ecp-contactlens-summary-N, shown until a script toggle revealed the full text). The FULL text prints once per product instead (decision: each product once); the excerpt is a duplicate, cut mid-sentence (one inside an entity: "&nbs ...").', product: it.product });
  }
  const toggles = declaredByPage.reduce((a, d) => a + d.items.filter((x) => x.kind === 'toggle').length, 0);
  const shortcodeHits = declaredByPage.flatMap((d) => d.items.filter((x) => x.kind === 'shortcode').map((x) => ({ page: d.page, from: x.from, to: x.to })));
  const proseDrops = (stats.decidedImageDrops || []).map((x) => ({ page: pathOf(x.page), src: x.src, why: x.why }));
  const imageDrops = declaredByPage.flatMap((d) => d.items.filter((x) => /image-dropped|background-dropped/.test(x.kind)).map((x) => ({ page: d.page, src: x.src, why: x.why })))
    .concat(proseDrops)
    .filter((x, i, a) => a.findIndex((y) => y.page === x.page && y.src === x.src) === i)
    .sort((a, b) => (a.page + a.src < b.page + b.src ? -1 : 1));
  const pdfs = declaredByPage.flatMap((d) => d.items.filter((x) => x.kind === 'pdf-not-harvested').map((x) => ({ page: d.page, src: x.src, why: x.why })));
  /* fix round 2 (R2-2): the page's own structured data, one row per (type, decision); per-page detail (every repair
     with from / to / why, every removal with its why) is in audit/seo-repairs.json structuredData */
  const LD_REASON = {
    'BlogPosting|REPAIR': 'The post\'s own BlogPosting is carried into the page graph (src/lib/seo.mjs carryBlogPosting); every key and value is the source\'s except these repairs: mainEntityOfPage.@id (the platform pointed every post at the home page) becomes the page\'s canonical; HTML entities inside the headline / description strings are decoded (' + seoLog.structuredData.filter((s) => s.type === 'BlogPosting' && (s.repairs || []).some((r) => r.field === 'headline' || r.field === 'description')).length + ' posts); datePublished and dateModified ("February 26, 2023") become ISO 8601 dates, the same date the page prints; the empty image [""] is omitted; publisher.logo.url (the platform CDN copy) becomes the logo file this build ships. The build fails if a headline is not the page h1, a date does not parse, datePublished differs from the printed post date, or the author / publisher is not the practice. Blog posts with no BlogPosting at source get none: ' + (siteMap.templates['blog-post'] || []).filter((x) => !seoLog.structuredData.some((s) => s.page === x && s.type === 'BlogPosting')).join(', ') + '.',
    'FAQPage|REMOVE': 'The FAQPage block lists 4 questions and answers that no page of the site prints (the visible FAQ accordion of /eye-care-services/dry-eye-disease-and-treatment/ asks 3 other questions with other answers; the copy on the glaucoma page also names the dry-eye page as its url). Structured data describes what the page shows, so it is removed rather than published as page content (per-page why: audit/seo-repairs.json). Open: docs/OPEN-DECISIONS.md B.',
    'VideoObject|REMOVE': 'The VideoObject block (the eye-safety YouTube video) does not parse at source - a raw line break inside its description string (JSON.parse: "Bad control character in string literal") - so no search engine read it. It is removed, not repaired: repairing it would publish values the source never published validly (uploadDate "2004-6-10" is not an ISO 8601 date; thumbnailUrl is a YouTube animated-preview URL, i.ytimg.com/an_webp/... with du / sqp / rs query parameters). The 2 tag archives that carry it do not show the video. Open: docs/OPEN-DECISIONS.md B.',
  };
  const ldRows = () => {
    const groups = new Map();
    for (const x of seoLog.structuredData) { const k = x.type + '|' + x.decision; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
    return [...groups.keys()].sort().map((k) => {
      const list = groups.get(k);
      const unparsed = list.every((x) => /does not parse/.test(x.why || ''));
      return { selector: 'source JSON-LD ' + k.split('|')[0] + (unparsed ? ' (unparseable at source)' : '') + ' on ' + list.length + ' page(s)', decision: k.split('|')[1], count: list.length, pages: list.map((x) => x.page), reason: LD_REASON[k] || list[0].why };
    });
  };
  const posters = declaredByPage.flatMap((d) => d.items.filter((x) => x.kind === 'video-poster').map((x) => ({ page: d.page, src: x.src, why: x.why })));
  return {
    schema: 'site-reforge/clone-removals@1',
    note: 'Deliberate removals and repairs, each a decision with a reason: the source\'s own chrome (rendered instead from src/content/chrome.json), platform runtime and plumbing, former-vendor credits, controls with no backend, duplicated platform copy, and unrendered platform shortcodes. Editorial copy is never removed. Written by src/build.mjs from what the build actually did; tools/sentence-parity.mjs and tools/short-text-parity.mjs read it.',
    elements: [
      { selector: 'header.ecp-header, footer.ecp-footer, div.ecp-global-footer, div.ecp-secondary', decision: 'REPLACE', reason: 'The source chrome (top bar, header, 4 copies of the primary menu, footer, sidebar widgets) is rendered from src/content/chrome.json, whose every value tools/write-facts.mjs verifies against all chrome-bearing raw pages.' },
      { selector: 'footer form#voice_search.ecp-voice-search ("Speak Field")', decision: 'REMOVE', reason: 'Voice search form (144 files): posts to WordPress /?s=, which a static build does not serve; its transcript script cannot even reach the field (SITE-ARCHITECTURE section 7).' },
      { selector: 'div.ecp-secondary .widget_search, main .fl-module-ecp-search, the "Nothing Found" search prompts, the /sitemap/ search form', decision: 'REMOVE', count: stats.searchFormsRemoved || 0, reason: 'WordPress search forms (sidebar on 132 pages; ' + (stats.searchFormsRemoved || 0) + ' inside the content regions): no search backend in a static build. The sentence "Perhaps searching can help." on the four "Nothing Found" archives is source copy and stays.' },
      { selector: 'div.ecp-global-footer a.ecp-powered-by (+ eyecarepro-logo.svg)', decision: 'REMOVE', reason: 'Vendor credit "Powered by" + the EyeCarePro logo of the former platform; the "© 2026" before it stays.' },
      { selector: 'a#ecp-footer-login-link', decision: 'REMOVE', reason: 'Login link to the platform WordPress admin (riversidefamilyeyecare.ecpbuilder.com/wp-admin); no such backend exists in the rebuild.' },
      { selector: 'a.ecp-menu-mobile-focus-trap ("Return to top of menu")', decision: 'REMOVE', reason: 'Focus-trap link of the platform\'s mobile menu (146 files); the scaffold menu needs none.' },
      { selector: 'nav.ecp-menu copies of the SITE menus in the /template/* pages (header, footer and mobile-menu copies)', decision: 'REPLACE', reason: 'The six /template/* pages are the platform\'s global header/footer templates rendered as pages. A menu whose every item is a chrome.json menu label (primary menu with its children, footer menu, utility links) is a copy of the site menus, rendered from chrome.json. Any other menu is page content and is kept (the phone menu of /template/header-2/, next row).' },
      { selector: '/template/header-2/ phone menu (div.ecp-menu-wrapper.ecp-menu-convert-at-desktop): its second, hamburger copy (nav.ecp-menu-hamburger-content) of the same items', decision: 'REMOVE', count: stats.pageMenusKept || 0, reason: 'The platform prints a menu twice, a horizontal nav and its hamburger copy; this one shows at every width only as the hamburger labelled "Call Us". Its label and its ' + (stats.pageMenuItems || 0) + ' items print once, as a list: "Call Fort Myers 239-500-2020" (tel:239-500-2020) and two "Call" items whose href is an empty tel: (unwrapped to the word, as everywhere: a tel: with no number dials nothing). Its focus-trap link is the "Return to top of menu" row.' },
      { selector: 'GTM-P6GSK34 (script + noscript iframe), Google Analytics G-6LTG771EHQ, Google Ads conversion_async.js, Microsoft Clarity', decision: 'REMOVE', reason: 'Trackers of the current accounts: the rebuild must not report its visitors to them; re-add only on the owner\'s instruction.' },
      { selector: '#floatingEstimator + files.withcherry.com/widgets/widget.js init (every page)', decision: 'REPLACE', reason: 'The site-wide floating Cherry estimator is a third-party script on every page; it is not reproduced. Its function stays as a local link to /cherry-payment-plan/ (that page: Cherry mode "' + CHERRY_MODE + '"). Decision CY-1, docs/OPEN-DECISIONS.md.' },
      ...(CHERRY_MODE === 'link' ? [{ selector: '/cherry-payment-plan/ div.ecp-html (the Cherry widget: fonts link, loader, init, mount points)', decision: 'REPLACE', reason: 'The widget does not work standalone (tested from a non-practice origin: only its static hero draws, its gql.withcherry.com API calls fail, it throws, and it loads Segment analytics). Per decision CY-1 the page shows a link instead; the source markup holds no Cherry application URL, so the page\'s own label renders with data-needs="cherry application url" until the practice supplies one (RFEC_CHERRY_URL). RFEC_CHERRY=embed restores the exact source embed. The widget\'s text is drawn by Cherry\'s script and is not in the source HTML.' }] : []),
      { selector: 'li.gfield--type-captcha (forms 9 and 10)', decision: 'REMOVE', reason: 'Invisible Google reCAPTCHA (data-size="invisible") bound to the platform account\'s site key: platform plumbing; never rendered as a visible "CAPTCHA" field. The forms are inert (data-needs-backend) until an endpoint with its own spam protection is wired.' },
      { selector: 'GF honeypot li.gform_validation_container + Akismet block', decision: 'REMOVE', reason: 'Anti-spam plumbing of the WordPress form backend (2 pages); the honeypot labels "Email" (form 9) and "Name" (form 10) would pose as real fields.' },
      { selector: 'span[itemprop=ratingValue] (display:none)', decision: 'REMOVE', count: stats.hiddenRatingValuesRemoved || 0, reason: 'Hidden schema.org rating value "5"; the visible star count is kept.' },
      { selector: 'div.ecp-contactlens-desc > #ecp-contactlens-summary-N + a[href="javascript:void(0)"] toggles', decision: 'REPLACE', count: toggles, reason: 'Contact-lens brand pages: each product prints its FULL text once; the truncated excerpt is a duplicate (page-scoped list in `sentences`). The script-only "Read More+" toggle is unwrapped to its words (no link).' },
      { selector: 'EyeCarePro-Icons, Foundation Icons, Font Awesome (platform icon fonts)', decision: 'REMOVE', reason: 'Platform icon fonts; the scaffold draws no icons.' },
      { selector: 'wp-emoji, jQuery, Gravity Forms and Beaver Builder scripts and stylesheets, the commented-out Mercator SSO script, <meta name="admin_url">, body[data-subdomain]', decision: 'REMOVE', reason: 'WordPress / platform runtime: no trace of the old platform ships.' },
      { selector: 'source JSON-LD of the platform\'s 7 site-wide types (WebPage, LocalBusiness, MedicalBusiness, Optician, "MedicalSpecialty :: Optometric", Organization, static BreadcrumbList)', decision: 'REPLACE', reason: 'Replaced by one valid graph built from the verified facts (Organization + Optometric + the page\'s own BreadcrumbList); the source used an invalid @type and one static breadcrumb list on every page. The page\'s own structured data is carried or removed by the rows below.' },
      ...ldRows(),
      { selector: 'a[href^="https://builder.eyeglassguide.com"] > img eyeglass_guide_logo.png (/eyeglasses/eyeglass-guide/)', decision: 'REMOVE', reason: 'Platform tool badge (classified platform-ui-drop/platform-tool-logo): the EyeGlass Guide is an online tool of the platform; its icon link goes with the image. The page copy stays. Whether the tool survives the move is an open decision (docs/OPEN-DECISIONS.md).' },
      { selector: '404.png (/404-page-not-found/)', decision: 'REMOVE', reason: 'The platform\'s default 404 illustration (platform-ui-drop/platform-404-illustration).' },
    ],
    strings: [
      { value: 'This field is for validation purposes and should be left unchanged.', decision: 'REMOVE', reason: 'Gravity Forms honeypot instruction (2 pages).' },
      { value: 'Δ', decision: 'REMOVE', reason: 'Label (&#916;) of the hidden Akismet honeypot textarea inside both Gravity Forms (p.akismet-fields-container, display:none): anti-spam plumbing.' },
      { value: 'Powered by', decision: 'REMOVE', reason: 'Footer credit to the former platform vendor (EyeCarePro).' },
      { value: 'Login', decision: 'REMOVE', reason: 'Footer link to the platform WordPress admin.' },
      { value: 'Speak Field', decision: 'REMOVE', reason: 'Visually hidden label of the removed voice search input.' },
      { value: 'Search the site', decision: 'REMOVE', reason: 'Placeholder of the removed voice search input.' },
      { value: 'Return to top of menu', decision: 'REMOVE', reason: 'Mobile-menu focus-trap link (146 files).' },
      { value: 'Search:', decision: 'REMOVE', reason: 'Label of the removed WordPress search widget / modules.' },
      { value: 'Search', decision: 'REMOVE', reason: 'Button of the removed WordPress search widget / modules.' },
      { value: 'CAPTCHA', decision: 'REMOVE', reason: 'Label of the invisible reCAPTCHA field (never visible at source either).' },
      { value: 'Toggle accordion', decision: 'REMOVE', reason: 'aria-label of the platform accordion toggle (href="#"); the native <details> needs none.' },
    ],
    replacements: SHORTCODES.map((sc) => ({ from: sc.from, to: sc.to, decision: 'REPAIR', reason: 'unrendered platform shortcode, resolved to the account value it requests', pages: [...new Set(shortcodeHits.filter((h) => h.from === sc.from).map((h) => h.page))] })),
    sentences: pageScoped,
    vendorClauses: {
      decision: 'REMOVED', scope: 'sentences naming EyeCarePro (the practice\'s former website platform), removed at sentence level; no replacement text authored',
      count: stats.vendorSentences ? stats.vendorSentences.size : 0,
      removed: stats.vendorSentences ? [...stats.vendorSentences].sort() : [],
      caveat: 'Those sentences disclaimed on the PLATFORM\'S behalf (/disclaimer/). The practice is left with no warranty clause of its own there; writing one is for the practice\'s counsel (docs/OPEN-DECISIONS.md).',
    },
    images: {
      vendorAssets: decisions.vendor, platformUi: decisions.platformUi,
      refusedPlaceholders: { files: decisions.refusedPlaceholder, why: 'refused by the platform CDN (HTTP 403, audit/failures.json; never fetched again): a real person prints an honest placeholder with the person\'s name (class ph-portrait, data-needs="practice photo"); a brand prints its name (ph-brand)' },
      refusedSiblings: decisions.refusedSibling,
      refusedDropped: { files: decisions.refusedDropped, why: 'refused stock photos with no on-disk sibling: omitted (generated stand-ins may come later from the image plan, not from this workflow)' },
      droppedOnPages: imageDrops,
      altsBlanked: { count: decisions.altsBlanked, why: 'file-name or upload-hash alt text describes nothing; it becomes alt="". Readable alts are kept verbatim, child-page thumbnails included (fix round 2, R2-1). `count`: inventory images whose first alt is such a name; `onPages`: every alt actually blanked, per page. wf5b: a real photo used as an ambient title arch (alt "") on a page whose source shows it with an alt is a declared blank too (where "title-arch": TB-contact on /hours-location/).', onPages: altBlanks.filter((x, i, a) => a.findIndex((y) => y.page === x.page && y.src === x.src && y.alt === x.alt) === i).sort((a, b) => (a.page + '|' + a.src < b.page + '|' + b.src ? -1 : a.page + '|' + a.src > b.page + '|' + b.src ? 1 : 0)).map((x) => ({ page: x.page, file: fileOf(x.src), alt: x.alt, where: x.where })) },
      /* wf5b P4: every image the redesign ADDS to a page through model.art (the source page never showed it there), so a
         check can tell a declared addition from an image that came from nowhere */
      added: { why: 'Images the redesign adds through model.art (DESIGN-SPEC 4.3 P4; src/content/image-plan.json; IMAGE-PLAN 2-4): the generated title-arch defaults, the generated stand-ins in the slots of refused stock photos (`replaces`: the declared-dropped source image they stand in for) and added illustrations (ai: true, AI-labelled files, P7), the home cut-outs and lens, and two real arches (TB-contact: the practice-interior photo; TB-team: Dr. Degler\'s own portrait on her team page). `file` is the model `url` file; its srcset variants share its base name.', count: artLog.added.length, onPages: artLog.added.slice().sort((a, b) => (a.page + '|' + a.slot + '|' + a.id < b.page + '|' + b.slot + '|' + b.id ? -1 : 1)) },
    },
    documents: pdfs,
    videoPosters: posters,
    prosePlatformNames: [],
  };
}

console.log('dist             ', DIST);
console.log('pages built      ', built, '/', content.pages.length, '+ 404.html', fs.existsSync(path.join(DIST, '404.html')));
console.log('images           ', JSON.stringify(report.images));
console.log('media            ', report.media.length, 'files');
console.log('links            ', 'moved refs', report.links.moved.reduce((a, b) => a + b.references, 0), '· dead refs', report.links.dead.reduce((a, b) => a + b.references, 0));
console.log('seo              ', JSON.stringify(report.seo));
console.log('cherry           ', CHERRY_MODE);
console.log('theme            ', THEME, '·', STYLESHEETS.join(' '), '·', SCRIPTS.join(' ') || '(no script)', theme.files.length || theme.media.length ? '· ' + theme.files.length + ' theme files, ' + theme.media.length + ' hero media' : '');
console.log('art              ', JSON.stringify(report.art));
console.log('deploy base      ', BASE, '(404.html, .htaccess, _redirects)');
if (DUMP_MODELS) console.log('page models      ', fs.readdirSync(MODEL_DIR).length, 'files in', path.relative(PROJ, MODEL_DIR));
console.log('build failures   ', failures.length);
const byReason = {};
for (const f of failures) { const k = f.stage + ' | ' + String(f.reason).split('\n')[0].slice(0, 160); byReason[k] = (byReason[k] || 0) + 1; }
for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log('   ', n, r);
process.exitCode = failures.length ? 1 : 0;
