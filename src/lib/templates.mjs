/* ==========================================================================================================
   templates.mjs - the Riverlight Aurora theme (replaces the SCAFFOLD). It renders the page model
   (src/lib/page-model.mjs, docs/BUILD-NOTES.md section 5) with EXACTLY the markup of docs/COMPONENTS.md (the binding
   contract; section references below are to that file): the page shell (A), the chrome (B.1, B.2, B.19), the
   interior frames (C.1 article, C.7 hub), every component (B, F), the long-form prose set and its template
   transforms (D.5-D.7) and the forms card (B.25, E). src/lib/home.mjs composes the home rows (B.4-B.18) from the
   helpers this file exports.
   Rules kept here (the content gates and the contract depend on them):
   - every visible string is a model value (source copy or chrome.json); the only non-model strings are the declared
     non-visible labels of 0.9 (aria-label "Main", "Breadcrumb", "Footer", "Mobile", "Menu", "Reviews", "{label}
     submenu", "{n} out of 5 stars", "{n} of {N}", aria-roledescription), the placeholder initials (CSS from
     data-initials, B.10), the CTA band's repeat of chrome.topbar.call (Q-2) and the hours colon (0.9);
   - model HTML is printed as given, changed only by the closed list of D.7 (top-level split and moves, placement /
     enhancer classes and wrappers, srcset + sizes on model images, the re-emitted reviews heading, added illustrations);
   - every URL comes from the model (page-relative) except the theme assets under {up}theme/ (fonts, hero loop,
     posters) and the map card link (B.23);
   - images: width/height from the model, alt exactly as given, srcset from the model (P1) with the slot's sizes
     describing the RENDERED width (a cover crop renders wider than its frame), loading="lazy" below the first screen,
     fetchpriority="high" + one preload on the LCP image only (A.1).
   ========================================================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, imageSize, decodeEntities } from './util.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/* B.2: the main-nav / drawer breakpoint - one constant here, one media query in the CSS */
export const NAV_CLOSE_AT = '(min-width: 75em)';   /* QA round 1 (LAYOUT-11): em, as the CSS nav breakpoint */
const PHONE = '(max-width: 768px)';
const APPOINTMENT_PATH = '/contact-us/appointment-request-form/';

/* ---------------------------------------------------------------- small helpers */
const attr = (name, v) => (v === null || v === undefined || v === false ? '' : v === true ? ' ' + name : ' ' + name + '="' + esc(v) + '"');
const cp = (s) => [...String(s || '')].length;
const plain = (s) => decodeEntities(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
/* the image plan's anchor key (src/lib/page-model.mjs anchorKey): the same normalisation, so an anchor names the same node */
const anchorKey = (s) => plain(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
const isLevel = (l) => /^h[1-6]$/.test(l || '');
const isAppointment = (b) => b && (b.path === APPOINTMENT_PATH);
const isTel = (b) => b && /^tel:/i.test(b.href || '');
const relTokens = (rel, newTab) => [...new Set(String(rel || '').split(/\s+/).filter(Boolean).concat(newTab ? ['noopener'] : []))].join(' ');

/* ---------------------------------------------------------------- icons (0.7) */
const SYMBOLS = {
  calendar: '<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 2.5v4M16 2.5v4M3 10h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17.5h2M11 17.5h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>',
  phone: '<symbol id="i-phone" viewBox="0 0 24 24"><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.6 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>',
  mail: '<symbol id="i-mail" viewBox="0 0 24 24"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6.5 9 6.5 9-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>',
  chev: '<symbol id="i-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>',
  arrow: '<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>',
  menu: '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3.5 7h17M3.5 12h17M3.5 17h17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>',
  close: '<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>',
  star: '<symbol id="i-star" viewBox="0 0 24 24"><path d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5-4.8-4.5 6.5-.8z" fill="currentColor"/></symbol>',
  pin: '<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21.5s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/></symbol>',
  facebook: '<symbol id="i-facebook" viewBox="0 0 320 512"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></symbol>',
  yelp: '<symbol id="i-yelp" viewBox="0 0 384 512"><path fill="currentColor" d="M42.9 240.32l99.62 48.61c19.2 9.4 16.2 37.51-4.5 42.71L30.5 358.45a22.79 22.79 0 0 1-28.21-19.6 197.16 197.16 0 0 1 9-85.32 22.8 22.8 0 0 1 31.61-13.21zm44 239.25a199.45 199.45 0 0 0 79.42 32.11A22.78 22.78 0 0 0 192.94 490l3.9-110.82c.7-21.3-25.5-31.91-39.81-16.1l-74.21 82.4a22.82 22.82 0 0 0 4.09 34.09zm145.34-109.92l58.81 94a22.93 22.93 0 0 0 34 5.5 198.36 198.36 0 0 0 52.71-67.61A23 23 0 0 0 364.17 370l-105.42-34.26c-20.31-6.5-37.81 15.8-26.51 33.91zm148.33-132.23a197.44 197.44 0 0 0-50.41-69.31 22.85 22.85 0 0 0-34 4.4l-62 91.92c-11.9 17.7 4.7 40.61 25.2 34.71L366 268.63a23 23 0 0 0 14.61-31.21zM62.11 30.18a22.86 22.86 0 0 0-9.9 32l104.12 180.44c11.7 20.2 42.61 11.9 42.61-11.4V22.88a22.67 22.67 0 0 0-24.5-22.8 320.37 320.37 0 0 0-112.33 30.1z"/></symbol>',
  google: '<symbol id="i-google" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></symbol>',
  youtube: '<symbol id="i-youtube" viewBox="0 0 576 512"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></symbol>',
  /* the hero toggle (1.9): 24x24, stroke 2.2, the prototype's style; site.js swaps the use between them */
  play: '<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></symbol>',
  pause: '<symbol id="i-pause" viewBox="0 0 24 24"><path d="M8.5 5v14M15.5 5v14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>',
};
const SYMBOL_ORDER = Object.keys(SYMBOLS);
export const ico = (name) => {
  if (!SYMBOLS[name]) throw new Error('templates: no icon "' + name + '" in the sprite (0.7)');
  return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
};
/* the sprite holds exactly the symbols the page uses (0.7): read back from the rendered body, so every use has its
   symbol (link-check reads <use href="#i-..."> as a same-page fragment) and no unused symbol ships */
function sprite(bodyHtml, extra = []) {
  const used = new Set(extra);
  for (const m of bodyHtml.matchAll(/<use href="#i-([a-z]+)"\/>/g)) used.add(m[1]);
  for (const n of used) if (!SYMBOLS[n]) throw new Error('templates: the page uses an unknown icon "' + n + '"');
  return '<svg class="sprite" aria-hidden="true" focusable="false">' + SYMBOL_ORDER.filter((n) => used.has(n)).map((n) => SYMBOLS[n]).join('') + '</svg>';
}

/* ---------------------------------------------------------------- banks, river anchors, weave zones */
const BANK_D = 'M0 52C180 22 360 8 560 26s420 58 620 44c110-8 190-26 260-42';
/* B.4 / G6: the bank's fill (the prototype's path), then the logo double stroke: teal over navy, 6 px apart */
export const bank = (mods) => '<svg class="bank ' + mods + ' pl-band" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
  + '<path class="bank__fill" d="M0 90V52C180 22 360 8 560 26s420 58 620 44c110-8 190-26 260-42V90Z"/>'
  + '<path class="bank__teal" d="' + BANK_D + '" vector-effect="non-scaling-stroke"/>'
  + '<path class="bank__navy" d="' + BANK_D + '" transform="translate(0 6)" vector-effect="non-scaling-stroke"/></svg>';
/* 1.8: a route anchor and a weave zone (direct children of their host, after its band layers, before its .container) */
export const ra = (key, at) => '<i class="ra" aria-hidden="true" data-ra="' + esc(key) + '" data-at="' + esc(at) + '"></i>';
export const rz = (occluder, from, to, on) => '<i class="rz" aria-hidden="true" data-occluder="' + esc(occluder) + '" data-from="' + esc(from) + '" data-to="' + esc(to) + '"' + attr('data-on', on) + '></i>';
const FOOTER_ROUTE = [['z1', 'd:72%,36px p:60%,34px'], ['z2', 'd:34%,44px p:100%,40px'], ['z3', 'd:-4%,46px p:104%,42px']];
/* Mobile optimisation (M-LAYOUT-1 = RL-MISS-1): at p the title route entered at 62% of the band and dropped to the band
   bottom at 64%, so the over copy crossed the arch's upper half: the eyes, nose and mouth of the staff portraits and the
   people in the hub photos (0.07-0.52 of the arch height, 320-768 px). t1 and t2 now run level, 46 px below the band
   bottom (the arch overhangs the band by half its height), so the in-front stretch crosses the arch's lowest part, below
   every face (painted 0.69-0.91 of the arch height at 320-768: tmp/mobile/fix-a/results/river-*.json), and every photo
   arch keeps R3's in-front crossing within the first two phone screens. The d and t values are unchanged (769 px and up
   untouched).
   Mobile optimisation (fixer D1, BUILD-NOTES 15.4): at 769-1023 px (site.js layout m; before, the t layout read the d values
   there) the over copy crossed the arch at 0.17-0.61 of its height, the faces included. m runs t1 and t2 level 90 px below
   the band bottom (the 200 px arch overhangs it by 125 px), t2 at 60% (left of the arch, which starts at 71-76 % there),
   so the over copy paints the arch's lowest quarter. 1024 px and up read d (or t) as before */
const TITLE_ROUTE = [['t1', 'd:104%,58% m:104%,100%+90px p:104%,100%+46px'], ['t2', 'd:84%,98% m:60%,100%+90px p:56%,100%+46px'], ['t3', 'd:40%,110% p:-4%,108%']];
const ARTICLE_ROUTE = [['p1', 'd:-1.8%,6% p:-3.5%,6%'], ['p2', 'd:-1.8%,30% p:-3.5%,50%'], ['p3', 'd:CR-150,42% t:-1.8%,60% p:-3.5%,92%'], ['p4', 'd:CR-120,97% t:-1.8%,97% p:-3.5%,100%']];
/* C.7 (integrate stage, gap I.73): hubs keep to the LEFT bank. The title route leaves its band at the bottom-left (t3:
   40% at d, -4% at p); a right-bank anchor in the first hub band folded the river back into a hairpin across that band
   (through the visit block's text on /hours-location/), and at p the 103.5% bank ran within 40 px of every unshielded
   line that reaches the gutter. -7% at p keeps the centre line 40 px or more from text at 360-768. The river then
   reaches the footer from the left, so a hub's footer horizon runs left to right (the article's runs right to left
   at d; both run left to right at p, where the article also arrives from the left bank). */
const HUB_ROUTE = 'd:L,50% p:-7%,50%';
/* on hubs the title route also leaves along the band's bottom edge to the left bank (t3 -4% at d, as at p), not
   through 40%: the first hub band is not a card, and the 40% exit crossed its top-left text (the /template/* pages); and
   the footer horizon enters at the left edge before it runs right, so the last band (often band--lav prose) is not
   crossed on the way down */
const HUB_TITLE_ROUTE = TITLE_ROUTE.map(([k, a]) => [k, k === 't3' ? 'd:-4%,112% p:-4%,108%' : a]);
const HUB_FOOTER_ROUTE = [['z1', 'd:-4%,46px p:-4%,46px'], ['z2', 'd:50%,40px p:50%,38px'], ['z3', 'd:104%,36px p:104%,34px']];
const isHub = (m) => !m.isHome && (m.family === 'builder-hub' || m.family === 'template');

/* ---------------------------------------------------------------- images */
/* [P1] srcset: the model's [{url, w}], ascending w (a one-entry srcset printed as given) */
export const srcsetOf = (im) => (im && Array.isArray(im.srcset) && im.srcset.length ? im.srcset.slice().sort((a, b) => a.w - b.w).map((s) => s.url + ' ' + s.w + 'w').join(', ') : null);
/* the cover factor of B ("sizes rule"): k = max(1, (fh / fw) * (w / h)); 1 for contain slots */
const coverK = (im, fhfw) => Math.max(1, fhfw * (im.w / im.h));
const r2 = (n) => Math.round(n * 100) / 100;
const px = (n) => Math.ceil(n) + 'px';

/* Mobile optimisation (M-SPEED-1, the 2x density cap for phones: an operator option of PERF-2 / PERF-3, adopted under
   "optimize mobile"; the operator can revert it by making capSizes() return its input). On a phone (768 px and below)
   whose screen is denser than 2.2 dppx, the browser fetched every photo at the screen's full density (3x on most
   phones). These entries, put before the slot's own, ask it for about twice the slot's width instead: for each step T
   the slot's length is scaled by 1.92 / T, so the density asked for stays between 1.92x and 2.2x at every DPR from 2.2 to
   4.3; the steps put the two commonest phone densities at exactly 2x (2.625 and 3: a 358 px slot at DPR 3 asks for 716 px,
   so it takes the 720 w file), and 2.25: 1.96x, 2.5: 2.18x, 2.75: 2.10x, 3.5 and 4: 2.04x; below 2.2 nothing changes. Each entry
   of the slot that can apply at 768 px or less gets its own scaled twin with its condition (the arch's 427 px step, the
   inset's max-width), so the twin that applies is always the one for the slot's own width at that size. Every added
   entry starts with (max-width: 768px): at 769 px and up the slot's own entries decide, as before. The scaled length only
   changes the picked file (and the image's intrinsic width, which these slots never draw by: their CSS gives the img its
   width attribute or 100% of a frame), so callers exclude the slots drawn at their natural width (naturalSizes, the
   fig-grid brand chips that are width: auto on phones), the brand art whose wordmark or copy is the point (fig--brand:
   the Envision promo, the brand banners; the Alumier logo), the band backgrounds (they ask for the largest file) and a
   srcset with one file (nothing to pick). head() applies the same step to the LCP preload, so the preload and the img
   pick the same file (COMPONENTS 0.8, A.1) */
const CAP_STEPS = [[3.76, '.5106'], [3.29, '.5836'], [2.88, '.6667'], [2.52, '.7619'], [2.2, '.8727']];
const CAP_PHONE = '(max-width:768px)';
const splitSizes = (s) => { const out = []; let depth = 0, cur = ''; for (const ch of String(s)) { if (ch === '(') depth++; else if (ch === ')') depth--; if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
/* an entry of a sizes list as [condition, length]: the length is the entry's last component (a dimension or a function) */
const sizesEntry = (e) => {
  if (e.endsWith(')')) { let depth = 0, i = e.length - 1; for (; i >= 0; i--) { if (e[i] === ')') depth++; else if (e[i] === '(') { depth--; if (depth === 0) break; } } let j = i; while (j > 0 && /[a-z-]/i.test(e[j - 1])) j--; return [e.slice(0, j).trim(), e.slice(j)]; }
  const k = e.lastIndexOf(' '); return k < 0 ? ['', e] : [e.slice(0, k).trim(), e.slice(k + 1)];
};
/* can this condition hold at 768 px or less? Only the forms the templates print are understood; anything else stops the build */
const phoneCond = (cond) => {
  if (!cond) return true;
  const parts = cond.split(/\s+and\s+/);
  let ok = true;
  for (const p of parts) {
    const m = /^\((min|max)-(width|height):\s*(\d+(?:\.\d+)?)px\)$/.exec(p.trim());
    if (!m) throw new Error('templates: capSizes cannot read the sizes condition "' + cond + '"');
    if (m[1] === 'min' && m[2] === 'width' && +m[3] > 768) ok = false;
  }
  return ok;
};
const scaleLen = (len, f) => {
  let m = /^(\d+(?:\.\d+)?)(px|vw)$/.exec(len);
  if (m) return r2(+m[1] * +f) + m[2];
  if (/^calc\(.*\)$/.test(len)) return 'calc((' + len.slice(5, -1) + ')*' + f + ')';
  if (/^(min|max)\(.*\)$/.test(len)) return 'calc(' + len + '*' + f + ')';
  throw new Error('templates: capSizes cannot scale the sizes length "' + len + '"');
};
export function capSizes(sizes, srcset) {
  if (!sizes || !srcset || srcset.split(',').length < 2 || sizes.startsWith(CAP_PHONE)) return sizes;
  const phone = splitSizes(sizes).map(sizesEntry).filter(([c]) => phoneCond(c));
  const twins = [];
  for (const [t, f] of CAP_STEPS) for (const [c, len] of phone) twins.push(CAP_PHONE + ' and (min-resolution:' + t + 'dppx)' + (c ? ' and ' + c : '') + ' ' + scaleLen(len, f));
  return twins.join(', ') + ', ' + sizes;
}
/* <img>: src, srcset, sizes, alt, width, height, [loading], [fetchpriority], decoding (0.8). opts.cls / opts.attrs go
   first (the contract prints class and data-* hooks before src). opts.cap false: a slot capSizes() must not touch */
export function img(im, { cls = null, attrs = '', sizes = null, lazy = true, priority = false, style = null, url = null, w = null, h = null, srcset = undefined, cap = true } = {}) {
  if (!im) return '';
  const ss = srcset === undefined ? srcsetOf(im) : srcset;
  if (ss && !sizes) throw new Error('templates: an image with a srcset needs its slot\'s sizes: ' + (url || im.url));
  if (ss && cap) sizes = capSizes(sizes, ss);
  return '<img' + attr('class', cls) + attrs + ' src="' + esc(url || im.url) + '"' + (ss ? ' srcset="' + esc(ss) + '" sizes="' + esc(sizes) + '"' : '')
    + ' alt="' + esc(im.alt || '') + '" width="' + (w || im.w) + '" height="' + (h || im.h) + '"' + (style ? ' style="' + esc(style) + '"' : '')
    + (lazy && !priority ? ' loading="lazy"' : '') + (priority ? ' fetchpriority="high"' : '') + ' decoding="async">';
}
/* sizes for the slots whose CSS sizes the image by its NATURAL width (width: auto: logo walls, logo-grid chips,
   product and device chips, brand cards). A srcset's density sets the natural width, so these print the file's own
   width: density 1, the rendering the CSS was tested with, and the image is never drawn wider than its file */
const naturalSizes = (im) => im.w + 'px';

/* ---------------------------------------------------------------- the hero / band still (B.4, B.21) */
let POSTERS = null;
function posters() {
  if (POSTERS) return POSTERS;
  /* the shipped poster files' own dimensions, read at build time (B.4) */
  const wide = imageSize(path.join(ROOT, 'assets/media/hero-river-poster.webp'));
  const tall = imageSize(path.join(ROOT, 'assets/media/hero-river-poster-phone.webp'));
  if (!wide || !tall) throw new Error('templates: the hero posters (assets/media/hero-river-poster*.webp) are missing or unreadable');
  POSTERS = { wide, tall };
  return POSTERS;
}
export function heroLight(up, video, priority = false) {
  const P = posters();
  return '<div class="hero__light pl-band" aria-hidden="true"'
    + (video ? ' data-video data-src-webm="' + up + 'theme/media/hero-river.webm" data-src-mp4="' + up + 'theme/media/hero-river.mp4" data-src-phone="' + up + 'theme/media/hero-river-phone.mp4" data-media-phone="' + PHONE + '"' : '') + '>'
    + '<picture><source media="' + PHONE + '" srcset="' + up + 'theme/media/hero-river-poster-phone.webp" width="' + P.tall.w + '" height="' + P.tall.h + '">'
    + '<img class="hero__poster" src="' + up + 'theme/media/hero-river-poster.webp" alt="" width="' + P.wide.w + '" height="' + P.wide.h + '"' + (priority ? ' fetchpriority="high"' : '') + ' decoding="async"></picture></div>';
}
/* QA round 1 (PERF-4): the title band's poster is the measured LCP element of the interiors (148 of 148 at 1440 and
   1280x585): it gets the preload (one per poster file, by media) and fetchpriority, not the arch photo */
const posterPreloads = (up) => [{ url: up + 'theme/media/hero-river-poster.webp', media: '(min-width: 769px)' }, { url: up + 'theme/media/hero-river-poster-phone.webp', media: PHONE }];

/* ---------------------------------------------------------------- buttons (B.0) */
/* a model button { label, href, path, external, newTab, rel }: variant by target (DESIGN-SPEC 3.31); `variant` fixes it */
export function btn(b, { variant = null, lg = false } = {}) {
  const appt = isAppointment(b), tel = isTel(b), ext = !!b.external;
  const v = variant || (appt || tel || ext ? 'btn--primary' : 'btn--secondary');
  const lead = appt ? ico('calendar') : tel ? ico('phone') : '';
  const trail = appt || tel ? '' : ico('arrow');
  const rel = relTokens(b.rel, b.newTab);
  return '<a class="btn ' + v + (lg ? ' btn--lg' : '') + '" href="' + esc(b.href) + '"' + (b.newTab ? ' target="_blank"' : '') + (rel ? ' rel="' + esc(rel) + '"' : '') + '>'
    + lead + '<span>' + esc(b.label) + '</span>' + trail + '</a>';
}
export const btnRow = (buttons, opts) => (buttons && buttons.length ? '<div class="btn-row">' + buttons.map((b) => btn(b, opts)).join('') + '</div>' : '');
const more = (mr) => (mr ? '<a class="more" href="' + esc(mr.href) + '"' + attr('aria-label', mr.ariaLabel || null) + '>' + esc(mr.label) + '</a>' : '');
export const stars = (n) => '<span class="stars" role="img" aria-label="' + n + ' out of 5 stars">' + '<svg aria-hidden="true" focusable="false"><use href="#i-star"/></svg>'.repeat(n) + '</span>';
export const isoT = (s) => String(s || '').replace(' ', 'T');

/* ---------------------------------------------------------------- the portrait placeholder plate (B.10) */
/* initials (Q-7, declared): split the label on whitespace, drop a leading "Dr." token, the first letter of each of the
   first two remaining tokens, upper-cased; drawn by CSS from data-initials, never a text node */
export function initialsOf(label) {
  const toks = String(label || '').trim().split(/\s+/).filter(Boolean);
  if (toks.length && /^dr\.?$/i.test(toks[0])) toks.shift();
  return toks.slice(0, 2).map((t) => ((t.match(/\p{L}/u) || [''])[0]).toUpperCase()).join('');
}
export function plate(ph, cls, hooks = '') {
  return '<div class="' + cls + '" role="img" aria-label="' + esc(ph.label) + '" data-needs="' + esc(ph.needs) + '"' + hooks + '>'
    + '<span class="ph-portrait__ring" aria-hidden="true"></span><span class="ph-portrait__mono" aria-hidden="true" data-initials="' + esc(initialsOf(ph.label)) + '"></span>'
    + '<span class="ph-portrait__name" aria-hidden="true">' + esc(ph.label) + '</span></div>';
}

/* ================================================================ model HTML: parse, D.5-D.7 transforms */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
/* A strict parser for the model's sanitised HTML (well formed: tag-balance 0 findings): every element with its
   offsets in the source string, so the transforms edit only open tags and node boundaries (D.7: node HTML is never
   edited by the split). A stray or unclosed tag throws: the template never guesses a repair. */
export function parseHtml(html) {
  const root = { tag: '#root', start: 0, openEnd: 0, end: html.length, attrs: '', children: [], parent: null };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
  let i = 0, m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m.index > i) top.children.push({ tag: '#text', start: i, end: m.index, parent: top });
    i = re.lastIndex;
    if (m[0].startsWith('<!--')) { top.children.push({ tag: '#comment', start: m.index, end: i, parent: top }); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      if (top.tag !== tag) throw new Error('model HTML: </' + tag + '> closes <' + top.tag + '> at ' + m.index + ': ' + html.slice(Math.max(0, m.index - 80), m.index + 20));
      stack.pop(); top.end = i; top.closeStart = m.index;
      continue;
    }
    const node = { tag, start: m.index, openEnd: i, attrs: m[3] || '', children: [], parent: top };
    top.children.push(node);
    if (VOID.has(tag) || m[4]) { node.end = i; continue; }
    stack.push(node);
  }
  if (i < html.length) stack[stack.length - 1].children.push({ tag: '#text', start: i, end: html.length, parent: stack[stack.length - 1] });
  if (stack.length !== 1) throw new Error('model HTML: <' + stack[stack.length - 1].tag + '> is never closed');
  return root;
}
const getAttr = (node, name) => { const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s"\'=<>`]+))', 'i').exec(node.attrs || ''); return m ? (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]) : null; };
const classesOf = (node) => String(getAttr(node, 'class') || '').split(/\s+/).filter(Boolean);
const textOf = (html, node) => (node.tag === '#text' ? html.slice(node.start, node.end) : node.tag === '#comment' ? '' : (node.children || []).map((c) => textOf(html, c)).join(''));
const wsText = (s) => decodeEntities(String(s)).replace(/\s+/g, ' ').trim();
const elements = (node) => (node.children || []).filter((c) => c.tag !== '#text' && c.tag !== '#comment');
function walkEl(node, fn) { for (const c of node.children || []) if (c.tag !== '#text' && c.tag !== '#comment') { if (fn(c) !== false) walkEl(c, fn); } }
const hasDesc = (node, tag) => { let f = false; walkEl(node, (c) => { if (c.tag === tag) f = true; }); return f; };
const insideClass = (node, tag, cls) => { for (let p = node.parent; p; p = p.parent) if (p.tag === tag && classesOf(p).includes(cls)) return true; return false; };

/* D.5: the placement class of a model figure, from its role and its img's width attribute (a P5 class overrides) */
function placementOf(classes, w) {
  if (classes.includes('fig--left')) return 'fig--inset-start';
  if (classes.includes('fig--right')) return 'fig--inset';
  if (classes.includes('fig--center')) return 'fig--column';
  if (classes.includes('fig--brand')) return 'fig--chip';
  if (classes.includes('fig--portrait')) return 'fig--inset-start';
  return w >= 800 ? 'fig--wide' : w >= 500 ? 'fig--column' : 'fig--inset';
}

/* ---------------------------------------------------------------- sizes per slot (B "sizes rule"; D.5) */
/* The numbers are the CSS's rendered widths at the reference sizes (container 1200 at 1296 px and up, gutter
   clamp(16px, 4vw, 48px), the article column of C.1 / B.22): see COMPONENTS B and D.5, re-measured by the templates
   stage in a browser (tmp/wf5b/templates/probe.mjs; COMPONENTS I.67). `hub` = a hub band (C.7), where wide figures span the band. */
const SIZES = {
  /* the article column with the 2 x 24 px breakout (C.1, B.22; D.5) */
  wide: '(min-width: 1200px) 740px, (min-width: 1024px) calc(80.4vw - 252px), (min-width: 768px) calc(84vw + 48px), calc(100vw - 32px)',
  /* a hub band: the container (1200 px from 1296 px up, 92vw between) */
  wideHub: '(min-width: 1296px) 1200px, (min-width: 401px) 92vw, calc(100vw - 32px)',
  /* the measure caps a column figure: in the article the column (693 px at 1440) is narrower than 68ch; in a hub band
     the measure itself, 68ch of --step-prose (790 px at 1440, measured) */
  column: (w, hub) => '(min-width: 769px) ' + Math.min(w, hub ? 790 : 690) + 'px, ' + (w < 358 ? w + 'px' : 'calc(100vw - 32px)'),
  inset: (w, cap) => (w <= cap ? '(max-width: ' + (w + 32) + 'px) calc(100vw - 32px), ' + w + 'px' : cap + 'px'),
  /* fig-grid: 2 columns to 768 px, then 3 (data-count 3) or 4; gap clamp(12px, 2vw, 24px). `pad`: a brand tile's media
     carries 12 px of padding on each side (riverlight.css .fig-grid .fig--brand .fig__media), so its image is 24 px
     narrower than the column. QA round 1 (wf6, fix-1 resumed, PERF-3): the hub rule now takes the gaps out of the column
     (92vw less (cols - 1) x 2vw, the gap from 600 px up) and the padding out of a brand tile; measured on
     /eyeglasses/designer-frames/ (brand tiles, 3 columns), the tiles are painted at 360 px from 1366 px up, 350 at 1280,
     271 at 1024, 202 at 769 and 149 at 390, where the old rule said 384px / 30.67vw / calc(50vw - 24px) and made the
     browser fetch the next srcset width (about 20 KB more at 1440 DPR 1 and 1280x585 DPR 1.5). The article-column
     rule is unchanged when pad is 0. */
  grid: (cols, hub, pad = 0) => (hub
    ? '(min-width: 1296px) ' + (Math.round((1200 - (cols - 1) * 24) / cols) - pad) + 'px, (min-width: 769px) ' + (pad ? 'calc(' + r2((92 - 2 * (cols - 1)) / cols) + 'vw - ' + pad + 'px)' : r2((92 - 2 * (cols - 1)) / cols) + 'vw') + ', calc(50vw - ' + (24 + pad) + 'px)'
    : '(min-width: 1200px) ' + (Math.round((693 - (cols - 1) * 24) / cols) - pad) + 'px, (min-width: 1024px) calc((80.4vw - 300px) / ' + cols + (pad ? ' - ' + pad + 'px' : '') + '), (min-width: 769px) calc(84vw / ' + cols + (pad ? ' - ' + pad + 'px' : '') + '), calc(50vw - ' + (24 + pad) + 'px)'),
};
/* the inset caps of D.5: fig--inset max .42 x the measure (68ch at --step-prose: 322-329 px rendered at 1024-1920,
   measured), fig--inset-start min(260px, 100%) */
const INSET_CAP = 330, INSET_START_CAP = 260;
function figureSizes(place, w, cols, hub, pad = 0) {
  if (place === 'grid') return SIZES.grid(cols, hub, pad);
  if (place === 'fig--wide') return hub ? SIZES.wideHub : SIZES.wide;
  if (place === 'fig--column' || place === 'fig--chip') return SIZES.column(w, hub);
  if (place === 'fig--inset') return SIZES.inset(w, INSET_CAP);
  if (place === 'fig--inset-start') return SIZES.inset(w, INSET_START_CAP);
  return SIZES.column(w, hub);
}

/* ---------------------------------------------------------------- D.6 enhancer predicates */
const isClassless = (n) => !getAttr(n, 'class');
const liTexts = (html, ul) => elements(ul).filter((c) => c.tag === 'li').map((li) => wsText(textOf(html, li)));
const checklistUl = (html, n) => n.tag === 'ul' && isClassless(n) && (() => { const L = liTexts(html, n); return L.length >= 6 && L.every((t) => cp(t) <= 60); })();
const colsUl = (html, n) => n.tag === 'ul' && isClassless(n) && (() => { const L = liTexts(html, n); return L.length >= 8 && L.every((t) => cp(t) <= 40); })();
/* lead: a p whose entire content is one strong */
const oneStrong = (html, p) => { const els = elements(p); if (els.length !== 1 || els[0].tag !== 'strong') return false; return (p.children || []).every((c) => c.tag !== '#text' || !wsText(html.slice(c.start, c.end))); };
/* link line (D.6, I.46): a classless p or li whose text equals the text of its one child a, which holds no img */
const linkLine = (html, n) => {
  if ((n.tag !== 'p' && n.tag !== 'li') || !isClassless(n)) return false;
  const els = elements(n);
  if (els.length !== 1 || els[0].tag !== 'a' || hasDesc(els[0], 'img')) return false;
  const all = wsText(textOf(html, n));
  return !!all && all === wsText(textOf(html, els[0]));
};

/* D.7.7 (QA round 1, PERF-6, fix-2): a YouTube iframe of model prose (page-model.mjs markProse wraps it in
   .embed--video) prints its address as data-src, and site.js sets src once the frame comes within 600 px of the
   viewport. Chrome's own loading="lazy" distance for iframes (about 2,500 px) fetched it at page load, with no scrolling,
   on the eye-emergencies page at 1440x900, 1920x1080, 1366x657 and 768x1024 (A-3, DESIGN-SPEC 7 "third parties"). A
   noscript copy keeps the plain lazy iframe without JavaScript. Attributes, title and order are otherwise unchanged. */
const YT_EMBED = /<iframe\b([^>]*?)\ssrc="(https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[^"]*)"([^>]*)><\/iframe>/gi;
const deferEmbeds = (html) => html.replace(YT_EMBED, (m, a, src, b) => '<iframe' + a + ' data-src="' + src + '"' + b + '></iframe><noscript><iframe' + a + ' src="' + src + '"' + b + '></iframe></noscript>');

/* D.7.9 (QA round 1, regressions R1): a model figure whose caption only repeats its image's alt holds a name, not a
   quotation (content.mjs bindFigureCaptions binds the paragraph after a lone image when its text equals the alt: on this
   site the 7 recommended lenses of /contact-lenses/, each name equal to its product photo's alt). It prints as a div
   with the name as div.fig__caption, because sr-fabrication reads every <figure> or <blockquote> holding more than 20
   characters of text as a testimonial; declaring the names as figure text (fix-1, CONTENT-2) let any invented review
   that embeds one pass. The img (src, srcset, sizes, alt), the classes and the text are unchanged; a figcaption that is
   anything but the image's alt is left as it is, so a real caption still meets the gate. */
const NAME_FIG = /<figure class="(fig\b[^"]*)"><span class="fig__media">(<img\b[^>]*>)<\/span><figcaption>([^<]*)<\/figcaption><\/figure>/g;
const nameCaptions = (html, stats) => html.replace(NAME_FIG, (m, cls, im, cap) => {
  const alt = (/\salt="([^"]*)"/.exec(im) || [])[1];
  if (alt === undefined || !wsText(cap) || wsText(alt) !== wsText(cap)) return m;
  stats.nameCaptions = (stats.nameCaptions || 0) + 1;
  return '<div class="' + cls + '"><span class="fig__media">' + im + '</span><div class="fig__caption">' + cap + '</div></div>';
});

/* Transform one model HTML string (D.7). ctx: the page context; opts:
     enhance  - run the D.6 typographic enhancers (lead, checklist, treatments, cols): prose and callout html of the
                long-form flows (never on the home; legal pages: the lead only)
     legal    - B.29: of the enhancers only the lead (and the link line)
     place    - add the D.5 placement classes to model figures (the long-form flows; the home's moved figures stay untouched)
     hub      - the html sits in a hub band (wide figures span the band)
     sizes    - a fixed sizes value for every model img (the home's moved figures and other component slots)
     inserts  - { before: Map(nodeIndex -> [html]), after: Map(nodeIndex -> [html]) } added illustrations (D.7.5), keyed
                by the index of the top-level node
   Returns the transformed html. ctx.stats counts what was applied (verified against D.6's counts). */
export function transformHtml(html, ctx, opts = {}) {
  if (!html) return '';
  const { enhance = false, legal = false, place = false, hub = false, sizes = null, inserts = null, cap = true } = opts;
  const root = parseHtml(html);
  const openEdits = new Map();   /* node.start -> { node, add: [classes], attrs: string } */
  const edit = (n) => { if (!openEdits.has(n.start)) openEdits.set(n.start, { node: n, add: [], attrs: '' }); return openEdits.get(n.start); };

  /* link line (any depth, every rich container) */
  walkEl(root, (n) => { if (linkLine(html, n)) { edit(n).add.push('link-line'); ctx.stats.linkLine.push(ctx.m.path + ' ' + n.tag); } });
  /* D.7.10 (mobile optimisation, RL-MISS-2): a classless list item whose only content is a nested list (no text of its
     own; the source's double-nested lists on /contact-lenses/our-featured-brands/coopervision/ and
     /eyeglasses/transitions-lenses/original-transitions-lenses/) is marked li--wrap. riverlight.css draws it exactly as
     before at 1024 px and up; below, it draws no wave bullet and no indent of its own. Text and structure untouched */
  walkEl(root, (n) => {
    if (n.tag !== 'li' || !isClassless(n)) return;
    const kids = (n.children || []).filter((c) => c.tag !== '#comment' && (c.tag !== '#text' || wsText(html.slice(c.start, c.end))));
    if (kids.length === 1 && (kids[0].tag === 'ul' || kids[0].tag === 'ol')) { edit(n).add.push('li--wrap'); ctx.stats.liWrap = (ctx.stats.liWrap || 0) + 1; }
  });

  /* D.5 placement (any depth, figures outside a fig-grid) and D.7.3 srcset + sizes on model images */
  walkEl(root, (n) => {
    if (n.tag === 'figure' && place && classesOf(n).includes('fig') && !insideClass(n, 'div', 'fig-grid')) {
      const im = (() => { let f = null; walkEl(n, (c) => { if (!f && c.tag === 'img') f = c; }); return f; })();
      const w = im ? Number(getAttr(im, 'width')) || 0 : 0;
      const p = placementOf(classesOf(n), w);
      edit(n).add.push(p);
      ctx.stats.place[p] = (ctx.stats.place[p] || 0) + 1;
    }
    if (n.tag === 'img') {
      const src = getAttr(n, 'src');
      const rec = src && ctx.imgs.get(src);
      if (rec && rec.srcset && rec.srcset.length && !getAttr(n, 'srcset')) {
        const fig = (() => { for (let p = n.parent; p; p = p.parent) if (p.tag === 'figure') return p; return null; })();
        let s = sizes, capOK = cap;
        if (!s) {
          const grid = fig && insideClass(fig, 'div', 'fig-grid') ? (() => { for (let p = fig.parent; p; p = p.parent) if (p.tag === 'div' && classesOf(p).includes('fig-grid')) return p; return null; })() : null;
          const w = Number(getAttr(n, 'width')) || rec.w;
          if (grid) { const cnt = Number(getAttr(grid, 'data-count')) || 2; s = figureSizes('grid', w, cnt >= 4 ? 4 : cnt === 3 ? 3 : 2, hub, classesOf(fig).includes('fig--brand') ? 24 : 0); }
          else if (fig && classesOf(fig).includes('fig')) s = figureSizes(placementOf(classesOf(fig), w), w, 0, hub);
          else if (n.parent && n.parent.tag === 'li' && classesOf(n.parent).includes('logo-chip')) { s = naturalSizes(rec); capOK = false; }
          else if (n.parent && n.parent.tag === 'a' && classesOf(n.parent).includes('logo-chip__link')) { s = naturalSizes(rec); capOK = false; }
          else s = figureSizes('fig--column', w, 0, hub);
        }
        /* M-SPEED-1 (capSizes): brand art keeps its sizes (a wordmark or the Envision promo's copy; also the fig-grid brand
           chips, drawn at their natural width on phones) */
        if (fig && classesOf(fig).includes('fig--brand')) capOK = false;
        const ss = srcsetOf(rec);
        if (capOK) s = capSizes(s, ss);
        edit(n).attrs += ' srcset="' + esc(ss) + '" sizes="' + esc(s) + '"';
        ctx.stats.srcset++;
      }
    }
  });

  /* the top-level nodes (D.7.1): elements and non-blank text runs at depth 0 */
  const tops = root.children.filter((c) => c.tag !== '#comment' && (c.tag !== '#text' || html.slice(c.start, c.end).trim()));
  const wrapOpen = new Map(), wrapClose = new Map();   /* top index -> [html] */
  /* QA round 1 (wf6, CONTENT-13; D.7.6): a top-level paragraph made only of the practice's social-profile links (the
     source's in-content icon set, which the pipeline lifts as text links labelled with the icons' aria-labels) prints as
     the icon list the footer and the aside print (B.19): the same hrefs, target and rel, each label kept verbatim as the
     link's aria-label. No word is added or changed; the lowercase labels are no longer drawn as visible text */
  const socialBy = new Map(((ctx.m && ctx.m.chrome && ctx.m.chrome.social) || []).map((s) => [s.href, s]));
  const replaceTop = new Map();   /* top index -> html */
  if (socialBy.size) tops.forEach((n, k) => {
    if (n.tag !== 'p') return;
    const kids = (n.children || []).filter((c) => c.tag !== '#comment');
    const links = kids.filter((c) => c.tag === 'a');
    if (links.length < 2 || kids.some((c) => c.tag !== 'a' && !(c.tag === '#text' && !wsText(html.slice(c.start, c.end))))) return;
    const items = links.map((a) => ({ a, s: socialBy.get(decodeEntities(getAttr(a, 'href') || '')), label: wsText(textOf(html, a)) }));
    if (items.some((x) => !x.s || !x.label || (x.a.children || []).some((c) => c.tag !== '#text'))) return;
    replaceTop.set(k, '<ul class="social social--prose" role="list">' + items.map(({ a, s, label }) => '<li><a class="social__link" href="' + esc(s.href) + '"'
      + (getAttr(a, 'target') ? ' target="' + esc(getAttr(a, 'target')) + '"' : '') + (getAttr(a, 'rel') ? ' rel="' + esc(getAttr(a, 'rel')) + '"' : '')
      + ' aria-label="' + esc(label) + '"><svg aria-hidden="true" focusable="false"><use href="#i-' + esc(s.network) + '"/></svg></a></li>').join('') + '</ul>');
    ctx.stats.socialLines = (ctx.stats.socialLines || 0) + 1;
  });
  const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
  if (enhance) {
    /* lead: the article's first p (flow order across blocks), when it is one strong */
    if (!ctx.leadDone) {
      const p = tops.find((n) => n.tag === 'p');
      if (p) { ctx.leadDone = true; if (oneStrong(html, p) && isClassless(p)) { edit(p).add.push('lead'); ctx.stats.lead.push(ctx.m.path); } }
    }
    if (!legal) {
      /* sub-sections: an h3 top node and the nodes after it, up to the next h2 or h3 or the end of the block */
      const subs = [];
      let cur = null;
      tops.forEach((n, k) => {
        if (n.tag === 'h2') { cur = null; subs.push('H2'); return; }
        if (n.tag === 'h3') { cur = { a: k, b: k + 1 }; subs.push(cur); return; }
        if (cur) cur.b = k + 1;
      });
      const isCheck = (s) => s !== 'H2' && tops.slice(s.a + 1, s.b).some((n) => checklistUl(html, n));
      const inCheck = new Set();
      for (const s of subs) if (isCheck(s)) {
        push(wrapOpen, s.a, '<div class="checklist surface surface--tint">');
        push(wrapClose, s.b - 1, '</div>');
        for (let k = s.a; k < s.b; k++) inCheck.add(tops[k]);
        ctx.stats.checklist.push(ctx.m.path + ' :: ' + wsText(textOf(html, tops[s.a])));
      }
      let run = [];
      const flush = () => {
        if (run.length >= 3) {
          push(wrapOpen, run[0].a, '<div class="treatments">');
          for (const s of run) { push(wrapOpen, s.a, '<div class="treatment surface surface--paper">'); push(wrapClose, s.b - 1, '</div>'); }
          push(wrapClose, run[run.length - 1].b - 1, '</div>');
          ctx.stats.treatRuns.push(ctx.m.path + ' x' + run.length);
          ctx.stats.treatSubs += run.length;
        }
        run = [];
      };
      for (const s of subs) { if (s === 'H2' || isCheck(s)) { flush(); continue; } run.push(s); }
      flush();
      for (const n of tops) if (!inCheck.has(n) && colsUl(html, n)) { edit(n).add.push('cols'); ctx.stats.cols.push(ctx.m.path); }
    }
  }

  /* emit: every root child in order (whitespace kept), open-tag edits applied inside each range, wrappers and added
     figures at top-node boundaries */
  const editsIn = [...openEdits.values()].sort((a, b) => a.node.start - b.node.start);
  const emitRange = (s, e) => {
    let out = '', at = s;
    for (const ed of editsIn) {
      if (ed.node.start < s || ed.node.start >= e) continue;
      const n = ed.node;
      let open = html.slice(n.start, n.openEnd);
      if (ed.add.length) {
        const had = getAttr(n, 'class');
        if (had !== null) open = open.replace(/(\sclass\s*=\s*")([^"]*)(")/i, (x, a, v, z) => a + v + ' ' + ed.add.join(' ') + z);
        else open = open.replace(/^<([a-zA-Z][a-zA-Z0-9-]*)/, (x, t) => '<' + t + ' class="' + ed.add.join(' ') + '"');
      }
      if (ed.attrs) open = open.replace(/(\ssrc\s*=\s*"[^"]*")/i, (x) => x + ed.attrs);
      out += html.slice(at, n.start) + open;
      at = n.openEnd;
    }
    return out + html.slice(at, e);
  };
  let out = '';
  let cursor = 0;
  tops.forEach((n, k) => {
    out += emitRange(cursor, n.start);
    for (const f of (inserts && inserts.before.get(k)) || []) out += f;
    for (const w of wrapOpen.get(k) || []) out += w;
    out += replaceTop.has(k) ? replaceTop.get(k) : emitRange(n.start, n.end);
    for (const f of (inserts && inserts.after.get(k)) || []) out += f;
    for (const w of wrapClose.get(k) || []) out += w;
    cursor = n.end;
  });
  out += emitRange(cursor, html.length);
  return nameCaptions(deferEmbeds(out), ctx.stats);
}
/* the top-level nodes of a model HTML string as strings (D.7.1; home s13 / s14 moves), each with its tag */
export function splitTop(html) {
  const root = parseHtml(html);
  return root.children.filter((c) => c.tag !== '#comment' && (c.tag !== '#text' || html.slice(c.start, c.end).trim())).map((c) => ({ tag: c.tag, html: html.slice(c.start, c.end), node: c, classes: c.tag.startsWith('#') ? [] : classesOf(c) }));
}

/* ================================================================ templates */
export function createTemplates() {
  /* ---------------------------------------------------------------- the page context */
  /* home.mjs builds the home's main before build.mjs calls renderPage(model, mainInner): the context it opened (the
     LCP image, the counters) is handed over through this map, keyed by the model object */
  const opened = new WeakMap();
  function context(m) {
    const imgs = new Map();
    for (const im of m.images || []) if (im && im.url && !imgs.has(im.url)) imgs.set(im.url, im);
    const ctx = { m, up: '../'.repeat(m.depth || 0), imgs, leadDone: false, lcp: null, stats: { linkLine: [], place: {}, srcset: 0, lead: [], checklist: [], treatRuns: [], treatSubs: 0, cols: [], art: [], ctaband: 0 } };
    opened.set(m, ctx);
    return ctx;
  }

  /* ---------------------------------------------------------------- A.1 head */
  function head(m, ctx) {
    const h = m.head;
    const lcp = ctx.lcp;
    return [
      '<!doctype html>',
      '<html lang="' + esc(h.lang || 'en-US') + '">',
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<title>' + esc(m.title) + '</title>',
      m.metaDescription && m.metaDescription.text ? '<meta name="description" content="' + esc(m.metaDescription.text) + '">' : '',
      /* QA round 1 (CONTENT-14): 404.html is served at any missing path, so it names no canonical and no og:url (both
         pointed at the indexable /404-page-not-found/) */
      m.as404 ? '' : '<link rel="canonical" href="' + esc(m.canonical) + '">',
      '<meta name="robots" content="' + esc(m.robots) + '">',
      '<meta property="og:type" content="' + esc(m.og.type) + '">',
      '<meta property="og:site_name" content="' + esc(m.og.siteName) + '">',
      '<meta property="og:title" content="' + esc(m.og.title) + '">',
      m.og.description ? '<meta property="og:description" content="' + esc(m.og.description) + '">' : '',
      m.as404 ? '' : '<meta property="og:url" content="' + esc(m.og.url) + '">',
      '<meta property="og:image" content="' + esc(m.og.image) + '">',
      '<meta name="twitter:card" content="' + esc(m.twitter.card) + '">',
      m.twitter.title ? '<meta name="twitter:title" content="' + esc(m.twitter.title) + '">' : '',
      /* QA round 1 (CONTENT-4): the source printed twitter:description on 148 of 148 pages, always equal to its
         og:description; the head now carries it again from the same value */
      m.og.description ? '<meta name="twitter:description" content="' + esc(m.og.description) + '">' : '',
      '<meta name="twitter:image" content="' + esc(m.twitter.image) + '">',
      ...(h.favicon || []).map((f) => '<link rel="' + esc(f.rel) + '" href="' + esc(f.href) + '"' + attr('sizes', f.sizes) + attr('type', f.type) + '>'),
      h.jsonLdHtml || '',
      '<link rel="preload" href="' + ctx.up + 'theme/fonts/atkinson-next-latin.woff2" as="font" type="font/woff2" crossorigin>',
      '<link rel="preload" href="' + ctx.up + 'theme/fonts/rfec-figures.woff2" as="font" type="font/woff2" crossorigin>',
      /* QA round 1 (PERF-4): ctx.lcp may list several preloads, each for its own media (the title-band poster has a wide
         and a phone file). Mobile optimisation (M-SPEED-1): imagesizes takes the img's own capSizes() step (the same
         srcset and slot sizes give the same string), so the preload and the img pick the same file on every screen */
      ...(lcp ? [].concat(lcp) : []).map((l) => '<link rel="preload" as="image" href="' + esc(l.url) + '"' + (l.srcset ? ' imagesrcset="' + esc(l.srcset) + '" imagesizes="' + esc(l.cap === false ? l.sizes : capSizes(l.sizes, l.srcset)) + '"' : '') + (l.media ? ' media="' + esc(l.media) + '"' : '') + ' fetchpriority="high">'),
      '<script>document.documentElement.classList.add(\'js\')</script>',
      ...(h.stylesheets || []).map((href) => '<link rel="stylesheet" href="' + esc(href) + '">'),
      ...(h.scripts || []).map((src) => '<script src="' + esc(src) + '" defer></script>'),
      '</head>',
    ].filter(Boolean).join('\n');
  }

  /* ---------------------------------------------------------------- B.1 top bar, B.2 header and drawer */
  function topbar(c) {
    const t = c.topbar;
    return '<div class="topbar"><div class="container topbar__inner">'
      + '<p class="topbar__where"><a href="' + esc(t.address.href) + '">' + esc(t.address.label) + '</a></p>'
      + '<div class="topbar__actions">'
      + '<a class="pill pill--ghost" href="' + esc(t.appointment.href) + '">' + ico('calendar') + '<span>' + esc(t.appointment.label) + '</span></a>'
      + '<a class="pill pill--ghost" href="' + esc(t.call.href) + '">' + ico('phone') + '<span>' + esc(t.call.label) + '</span></a>'
      + '</div></div></div>';
  }
  const cur = (it) => (it.current ? ' aria-current="page"' : '');
  /* restructure (2026-10-07): a menu item whose children have children of their own (the Services menu of the Eye Trends
     structure) is a mega menu: one group per child, its link as the group head over its own pages */
  const isMega = (it) => (it.children || []).some((k) => (k.children || []).length);
  const subLink = (k) => '<li' + (k.inSection ? ' class="is-section"' : '') + '><a href="' + esc(k.href) + '"' + cur(k) + '>' + esc(k.label) + '</a></li>';
  const subGroup = (k) => (!(k.children || []).length ? subLink(k)
    : '<li class="sub__group' + (k.inSection ? ' is-section' : '') + '"><a class="sub__head" href="' + esc(k.href) + '"' + cur(k) + '>' + esc(k.label) + '</a>'
      + '<ul class="sub__list">' + k.children.map(subLink).join('') + '</ul></li>');
  function navbar(c) {
    const lastWithKids = c.nav.map((x) => (x.children || []).length > 0).lastIndexOf(true);
    const items = c.nav.map((it, i) => {
      const n = i + 1, kids = it.children || [], mega = isMega(it);
      if (!kids.length) return '<li class="mainnav__item' + (it.inSection ? ' is-section' : '') + '"><a class="mainnav__link" href="' + esc(it.href) + '"' + cur(it) + '>' + esc(it.label) + '</a></li>';
      return '<li class="mainnav__item has-sub' + (mega ? ' has-mega' : '') + (it.inSection ? ' is-section' : '') + '">'
        + '<a class="mainnav__link" href="' + esc(it.href) + '"' + cur(it) + '>' + esc(it.label) + '</a>'
        + '<button class="mainnav__toggle" type="button" aria-expanded="false" aria-controls="sub-' + n + '" aria-label="' + esc(it.label) + ' submenu">' + ico('chev') + '</button>'
        + '<ul class="sub' + (mega ? ' sub--mega' : i === lastWithKids ? ' sub--end' : '') + '" id="sub-' + n + '">'
        + kids.map(mega ? subGroup : subLink).join('')
        + '</ul></li>';
    }).join('');
    const mob = c.mobile, logo = c.logo, ml = mob.logo;
    return '<div class="navbar"><div class="container navbar__inner">'
      + '<a class="brand" href="' + esc(logo.href) + '" aria-label="' + esc(logo.homeLabel) + '"><picture>'
      /* QA round 1 (PERF-14, fix-2): the phone header (145 px, A-17) offers both files with their widths, so DPR 1-2
         takes the 300 w logo (2.07x at most) instead of the 988 w file (3.41x at DPR 2); DPR 3 still takes 988 w. The two
         files are the same artwork (byte-identical copies of the source's two logos, P3) */
      + '<source media="' + esc(mob.media) + '" srcset="' + esc(logo.url) + ' ' + logo.w + 'w, ' + esc(ml.url) + ' ' + ml.w + 'w" sizes="145px" width="' + ml.w + '" height="' + ml.h + '">'
      + '<img src="' + esc(logo.url) + '" srcset="' + esc(logo.url) + ' ' + logo.w + 'w, ' + esc(ml.url) + ' ' + ml.w + 'w" sizes="180px" alt="' + esc(logo.alt) + '" width="' + logo.w + '" height="' + logo.h + '" decoding="async">'
      + '</picture></a>'
      + '<nav class="mainnav" aria-label="Main"><ul class="mainnav__list">' + items + '</ul></nav>'
      + '<div class="mobilebar">'
      + '<a class="roundbtn roundbtn--navy" href="' + esc(mob.appointment.href) + '"' + (mob.appointment.newTab ? ' target="_blank" rel="noopener"' : '') + ' aria-label="' + esc(mob.appointment.label) + '">' + ico('calendar') + '</a>'
      + '<a class="roundbtn roundbtn--teal" href="' + esc(mob.call.href) + '" aria-label="' + esc(mob.call.label) + '">' + ico('phone') + '</a>'
      + '<button class="roundbtn roundbtn--ghost menu-toggle" type="button" aria-label="' + esc(mob.menuToggle) + '" aria-expanded="false" aria-controls="drawer">' + ico('menu') + '</button>'
      + '</div></div></div>';
  }
  function drawer(c) {
    const items = c.nav.map((it, i) => {
      const n = i + 1, kids = it.children || [];
      if (!kids.length) return '<li' + (it.inSection ? ' class="is-section"' : '') + '><a href="' + esc(it.href) + '"' + cur(it) + '>' + esc(it.label) + '</a></li>';
      return '<li class="dnav__group' + (it.inSection ? ' is-section' : '') + '">'
        + '<div class="dnav__row"><a href="' + esc(it.href) + '"' + cur(it) + '>' + esc(it.label) + '</a>'
        + '<button class="dnav__toggle" type="button" aria-expanded="false" aria-controls="dsub-' + n + '" aria-label="' + esc(it.label) + ' submenu">' + ico('chev') + '</button></div>'
        + '<ul class="dnav__sub" id="dsub-' + n + '" hidden>' + kids.map((k) => (!(k.children || []).length ? '<li' + (k.inSection ? ' class="is-section"' : '') + '><a href="' + esc(k.href) + '"' + cur(k) + '>' + esc(k.label) + '</a></li>'
          : '<li class="dnav__grp' + (k.inSection ? ' is-section' : '') + '"><a class="dnav__head" href="' + esc(k.href) + '"' + cur(k) + '>' + esc(k.label) + '</a><ul class="dnav__sub2">'
            + k.children.map((g) => '<li' + (g.inSection ? ' class="is-section"' : '') + '><a href="' + esc(g.href) + '"' + cur(g) + '>' + esc(g.label) + '</a></li>').join('') + '</ul></li>')).join('') + '</ul>'
        + '</li>';
    }).join('');
    const ml = c.mobile.logo, t = c.topbar;
    return '<dialog class="drawer" id="drawer" aria-label="Menu" data-close-at="' + NAV_CLOSE_AT + '"><div class="drawer__panel">'
      + '<div class="drawer__head"><img class="drawer__logo" src="' + esc(ml.url) + '" alt="" width="' + ml.w + '" height="' + ml.h + '" loading="lazy" decoding="async">'
      + '<button class="roundbtn roundbtn--ghost drawer__close" type="button" data-close aria-label="' + esc(c.mobile.menuClose) + '">' + ico('close') + '</button></div>'
      + '<nav aria-label="Mobile"><ul class="dnav">' + items + '</ul></nav>'
      + '<div class="drawer__actions">'
      + '<a class="btn btn--primary" href="' + esc(t.appointment.href) + '">' + ico('calendar') + '<span>' + esc(t.appointment.label) + '</span></a>'
      + '<a class="btn btn--ghost" href="' + esc(t.call.href) + '">' + ico('phone') + '<span>' + esc(t.call.label) + '</span></a>'
      + '</div></div></dialog>';
  }

  /* ---------------------------------------------------------------- B.19 footer */
  function social(list) {
    return '<ul class="social" role="list">' + list.map((s) => '<li><a class="social__link" href="' + esc(s.href) + '" target="_blank"' + attr('rel', s.rel || null) + ' aria-label="' + esc(s.label) + '"><svg aria-hidden="true" focusable="false"><use href="#i-' + esc(s.network) + '"/></svg></a></li>').join('') + '</ul>';
  }
  function footer(m) {
    const c = m.chrome, f = c.footer, n = f.nap;
    const napHtml = '<strong>' + esc(n.name) + '</strong>' + esc(n.located) + esc(n.street) + esc(n.sep) + esc(n.locality) + ', ' + esc(n.region) + ' ' + esc(n.postalCode) + esc(n.postalEnd)
      + ' ' + esc(n.phoneLabel) + ' <a href="' + esc(n.phoneHref) + '">' + esc(n.phone) + '</a>' + esc(n.phoneEnd) + ' <a href="' + esc(n.site.href) + '">' + esc(n.site.label) + '</a>';
    /* B.19: the NAP's text content must equal nap.text exactly, or the build fails */
    const napText = decodeEntities(napHtml.replace(/<[^>]+>/g, ''));
    if (napText !== n.text) throw new Error('templates: footer NAP text differs from chrome.footer.nap.text: "' + napText + '" vs "' + n.text + '"');
    return '<footer class="site-footer aurora-deep" data-band>'
      + bank('bank--up bank--footer')
      + (isHub(m) ? HUB_FOOTER_ROUTE : FOOTER_ROUTE).map(([k, a]) => ra(k, a)).join('')
      + '<div class="container pl-surface footer__grid' + (f.columns && f.columns.some((col) => col.title) ? ' footer__grid--cols' : '') + '">'
      /* restructure (2026-10-07): titled footer columns (the Eye Trends footer: Services, Eyewear, Practice, Contact) */
      + (f.columns && f.columns.some((col) => col.title)
        ? '<nav class="footer__menu footer__menu--cols" aria-label="Footer">' + f.columns.map((col) => '<div class="footer__col">' + (col.title ? '<p class="footer__title">' + esc(col.title) + '</p>' : '') + '<ul role="list">' + col.links.map((l) => '<li><a href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>').join('') + '</ul></div>').join('') + '</nav>'
        : '<nav class="footer__menu" aria-label="Footer"><ul role="list">' + f.menu.map((l) => '<li><a href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>').join('') + '</ul></nav>')
      + '<div class="footer__social">' + social(c.social)
      + '<a class="btn btn--light" href="' + esc(f.button.href) + '">' + ico('calendar') + '<span>' + esc(f.button.label) + '</span></a>'
      + (c.financing ? '<p class="footer__financing"><a href="' + esc(c.financing.href) + '">' + esc(c.financing.label) + '</a></p>' : '')
      + '</div>'
      + '<p class="footer__nap">' + napHtml + '</p>'
      + '</div>'
      + '<div class="legal"><div class="container legal__inner"><p>' + esc(f.copyright) + '</p><ul role="list">' + f.util.map((u) => '<li><a href="' + esc(u.href) + '">' + esc(u.label) + '</a></li>').join('') + '</ul></div></div>'
      + '</footer>';
  }

  /* ---------------------------------------------------------------- B.20 breadcrumbs */
  function crumbs(list) {
    if (!list || !list.length) return '';
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + list.map((c, i) => {
      if (i < list.length - 1) return '<li>' + (c.href ? '<a href="' + esc(c.href) + '">' + esc(c.label) + '</a>' : '<span>' + esc(c.label) + '</span>') + '<span class="crumbs__sep" aria-hidden="true"> » </span></li>';
      return c.label ? '<li><span aria-current="page">' + esc(c.label) + '</span></li>' : '';
    }).join('') + '</ol></nav>';
  }

  /* ---------------------------------------------------------------- B.21 title band */
  /* the arch (B.21 resolution order): 1 a team page's own team block photo / plate, else art.title; 2 a builder hub's
     header photo (sections[0].background[0].image, moved here); 3 art.title; 4 none */
  function archOf(m) {
    if (m.family === 'team-member') {
      const team = m.sections.flatMap((s) => s.blocks).find((b) => b.type === 'team' && b.members.length);
      if (team) { const mem = team.members[0]; if (mem.photo) return { kind: 'img', im: mem.photo, portrait: true }; if (mem.placeholder) return { kind: 'plate', ph: mem.placeholder }; }
      if (m.art && m.art.title) return m.art.title.placeholder ? { kind: 'plate', ph: m.art.title.placeholder } : { kind: 'img', im: m.art.title, portrait: true, objectPosition: m.art.title.objectPosition };
      return null;
    }
    if (m.family === 'builder-hub' && m.sections[0] && m.sections[0].background && m.sections[0].background[0] && !m.sections[0].background[0].superseded) return { kind: 'img', im: m.sections[0].background[0].image, hubPhoto: true };
    if (m.art && m.art.title) return m.art.title.placeholder ? { kind: 'plate', ph: m.art.title.placeholder } : { kind: 'img', im: m.art.title, objectPosition: m.art.title.objectPosition };
    return null;
  }
  /* the arch frame is 4:5 and its image 112% of the frame height: fh/fw = 1.4 (B.21) */
  function archSizes(im, portrait) {
    const k = coverK(im, 1.4);
    const top = portrait ? '(min-width: 1250px) ' + px(300 * k) : '(min-width: 1417px) ' + px(340 * k);
    return top + ', (min-width: 1024px) ' + r2(24 * k) + 'vw, (min-width: 769px) ' + px(200 * k) + ', (min-width: 427px) ' + px(150 * k) + ', calc(' + r2(k) + ' * (38vw - 12px))';
  }
  function titleBand(m, ctx) {
    const arch = archOf(m);
    const len = cp(m.h1.text);
    /* QA round 1 (LAYOUT-10): xlong from 75 characters (was 80): the 78-character scleral post's 5-line h1 plus its
       breadcrumb (which repeats the title) started the first block at 725 px at 390x844 (A-10: 700) */
    const h1cls = len >= 75 ? ' h1--xlong' : len >= 56 ? ' h1--long' : '';
    const team = m.family === 'team-member' ? m.sections.flatMap((s) => s.blocks).find((b) => b.type === 'team' && b.members.length) : null;
    const position = team && team.members[0].position ? team.members[0].position : '';
    let frame = '';
    if (arch && arch.kind === 'img') {
      const sizes = archSizes(arch.im, arch.portrait);
      frame = '<figure class="titleband__frame frame pl-break" data-protrude="arch" data-cross=".bank--title">'
        + img(arch.im, { attrs: ' data-depth="inner"', sizes, lazy: false, style: arch.objectPosition ? '--obj-pos: ' + arch.objectPosition : null })
        + '</figure>';
    } else if (arch && arch.kind === 'plate') {
      /* QA round 1, regressions (R1): the arch that holds the portrait placeholder is a div, not a figure. The plate
         prints the person's name (its role=img label is the same string), which is not a quotation: sr-fabrication reads
         every <figure> with more than 20 characters of text as a testimonial (B.21) */
      frame = '<div class="titleband__frame frame pl-break" data-protrude="arch" data-cross=".bank--title">' + plate(arch.ph, 'ph-portrait') + '</div>';
    }
    ctx.lcp = posterPreloads(ctx.up);
    return '<section class="titleband">'
      + heroLight(ctx.up, false, true)
      + (isHub(m) ? HUB_TITLE_ROUTE : TITLE_ROUTE).map(([k, a]) => ra(k, a)).join('')
      /* Mobile optimisation (M-LAYOUT-1): a portrait placeholder plate prints its monogram ring over 0.18-0.62 of the arch
         and the person's name over its lowest part (0.61-0.92 at 320 px), so no phone route can cross it in front without
         crossing one of the two (tmp/mobile/fix-a/results/plates.json): on phones (layout p) the river passes behind the
         plate; the weave is kept at d and t (1024 px and up). Fixer D1: at 769-1023 px (layout m, which this list does not
         name) the plate's name reaches 0.75 of the arch (Nelson's 3 lines; tmp/mobile/fix-d1/results/plates-m.json), so
         the river passes behind it there too. A photo that replaces the plate takes the moved route */
      + (frame ? rz('.titleband__frame', 't1', 't3', arch.kind === 'plate' ? 'd t' : null) : '')
      + '<div class="container pl-surface pl-raise titleband__grid">'
      + '<div class="titleband__pane surface surface--glass">'
      + crumbs(m.breadcrumbs)
      + '<h1 id="page-title" class="wave-rule' + h1cls + '">' + esc(m.h1.text) + '</h1>'
      + (m.date ? '<p class="titleband__date"><time datetime="' + esc(m.date.iso) + '">' + esc(m.date.text) + '</time></p>' : '')
      + (position ? '<p class="chip">' + esc(position) + '</p>' : '')
      + '</div>'
      + frame
      + '</div>'
      + bank('bank--down bank--title')
      + '</section>';
  }

  /* ---------------------------------------------------------------- B.23 aside */
  function hoursTable(rows) {
    return '<table class="hours"><tbody>' + rows.map(([d, iv]) => '<tr><th scope="row">' + esc(d) + ':</th><td>' + (Array.isArray(iv) ? iv : [iv]).map(esc).join('<br>') + '</td></tr>').join('') + '</tbody></table>';
  }
  const contactRows = (list) => '<ul class="contact" role="list">' + list.map((c) => '<li><strong>' + esc(c.label) + '</strong> ' + (c.href ? '<a href="' + esc(c.href) + '">' + esc(c.value) + '</a>' : esc(c.value)) + '</li>').join('') + '</ul>'
    + list.filter((c) => c.note).map((c) => '<p class="note">' + esc(c.note) + '</p>').join('');
  const addressLines = (lines) => '<address class="loc__address">' + lines.map(esc).join('<br>') + '</address>';
  function qaLink(q, extra = '') {
    return '<a class="qa' + (q.icon === 'mail' ? ' qa--navy' : '') + '" href="' + esc(q.href) + '"' + extra + '>' + ico(q.icon === 'mail' ? 'mail' : 'calendar') + '<span>' + esc(q.label) + '</span></a>';
  }
  function aside(a) {
    if (!a) return '';
    const L = a.location;
    const loc = L ? '<div class="side-card side-card--loc loc surface surface--paper">'
      + '<h2 class="loc__title" id="loc-title"><a href="' + esc(L.title.href) + '">' + esc(L.title.text) + '</a></h2>'
      + addressLines(L.address)
      + contactRows(L.contacts)
      + hoursTable(L.hours)
      /* Q-11: a static link to the same query in Google Maps (no iframe on the 131 pages) */
      + '<a class="mapcard" href="' + esc(String(L.map.src).replace(/&output=embed/, '')) + '" target="_blank" rel="noopener">' + ico('pin') + '<span>' + esc(L.map.fallbackLabel) + '</span></a>'
      + '</div>' : '';
    return '<aside class="sidebar"' + (L ? ' aria-labelledby="loc-title"' : '') + '>'
      + '<div class="side-card side-card--actions surface surface--glass"><ul class="qa-list" role="list">' + a.quickActions.map((q) => '<li>' + qaLink(q) + '</li>').join('') + '</ul>' + social(a.social) + '</div>'
      + loc + '</aside>';
  }

  /* ---------------------------------------------------------------- block renderers */
  const rich = (html, ctx, opts) => transformHtml(html, ctx, opts);
  /* a callout image as a model-shaped figure (B.22, C.7) with its D.5 placement */
  function calloutFigure(im, ctx, hub) {
    if (!im) return '';
    const role = im.role || 'photo';
    const p = placementOf(['fig', 'fig--' + role], im.w);
    return '<figure class="fig fig--' + esc(role) + ' ' + p + '"><span class="fig__media">' + img(im, { sizes: figureSizes(p, im.w, 0, hub), cap: role !== 'brand' }) + '</span></figure>';
  }
  const titleInner = (t) => (t.href ? '<a href="' + esc(t.href) + '">' + t.html + '</a>' : t.html);
  function accordion(b, ctx) {
    return '<div class="faq">' + b.items.map((it) => '<details class="faq__item"><summary><span class="faq__q">' + esc(it.q) + '</span>' + ico('chev') + '</summary><div class="faq__a rich">' + rich(it.html, ctx) + '</div></details>').join('') + '</div>';
  }
  function video(b) {
    if (b.kind === 'iframe') return deferEmbeds('<div class="embed embed--video"><iframe src="' + esc(b.src) + '" title="' + esc(b.title) + '" loading="lazy" allowfullscreen></iframe></div>');
    return '<figure class="video"><div class="video__frame"><video' + (b.controls !== false ? ' controls' : '') + ' preload="none" playsinline' + (b.poster && b.poster.url ? ' poster="' + esc(b.poster.url) + '"' : '') + '>'
      + (b.sources || []).map((s) => '<source src="' + esc(s.src) + '" type="' + esc(s.type) + '">').join('') + '</video></div></figure>';
  }
  /* F.2 child-page listings and B.28 archive rows; thumbs may be filled by an art.inline hub-item (P4) */
  function childpages(b, ctx) {
    if (b.variant === 'archive') return '<ul class="archive-list" role="list">' + b.items.map((it) => '<li class="archive-row surface surface--paper"><a class="archive-row__link" href="' + esc(it.href) + '"><span>' + esc(it.title) + '</span>' + ico('chev') + '</a></li>').join('') + '</ul>';
    const variant = b.variant === 'thumbs' ? 'thumbs' : 'plain';
    let n = 0;
    return '<ul class="childlist childlist--' + variant + '" role="list">' + b.items.map((it) => {
      let thumb = it.thumb;
      if (!thumb && it.thumbDropped && ctx.hubThumbs) { const art = ctx.hubThumbs.get(anchorKey(it.title)); if (art) { thumb = art; ctx.stats.art.push(ctx.m.path + ' hub-item ' + it.title); ctx.hubThumbsUsed.add(anchorKey(it.title)); } }
      const media = variant === 'thumbs' && thumb ? (() => {
        n++;
        /* a 3:2 frame (F.2): 3 / 2 / 1 columns at 1024+ / 600-1023 / below, the card padding clamp(20px, 2vw, 26px) */
        const k = coverK(thumb, 2 / 3);
        const sizes = '(min-width: 1200px) ' + px(340 * k) + ', (min-width: 1024px) calc(' + r2(25.4 * k) + 'vw - ' + Math.round(5 * k) + 'px), (min-width: 600px) calc(' + r2(46 * k) + 'vw - ' + Math.round(56 * k) + 'px), calc(' + r2(100 * k) + 'vw - ' + Math.round(72 * k) + 'px)';
        return '<div class="childcard__media frame pl-break" data-protrude="thumb-' + n + '" data-cross="parent">' + img(thumb, { sizes }) + '</div>';
      })() : '';
      return '<li class="childcard' + (media ? ' childcard--thumb' : '') + ' surface surface--frost" data-tilt>' + media
        + '<div class="childcard__body rv"><p class="childcard__title"><a class="card__link" href="' + esc(it.href) + '">' + esc(it.title) + '</a></p>'
        + (it.summary ? '<p class="childcard__summary">' + esc(it.summary) + '</p>' : '') + '</div></li>';
    }).join('') + '</ul>';
  }
  /* B.18 / B.28 post cards */
  function posts(b, ctx, { view = b.view } = {}) {
    return '<ul class="posts posts--' + esc(view) + '" role="list">' + b.items.map((it) => {
      const lvl = isLevel(it.level) ? it.level : null;
      const title = '<a class="card__link" href="' + esc(it.href) + '">' + esc(it.title) + '</a>';
      return '<li class="post surface surface--frost rv" data-tilt>'
        + (it.date ? '<p class="post__date"><time datetime="' + esc(it.date.iso) + '">' + esc(it.date.text) + '</time></p>' : '')
        + (lvl ? '<' + lvl + ' class="post__title">' + title + '</' + lvl + '>' : '<p class="post__title">' + title + '</p>')
        + (it.html ? '<div class="post__excerpt rich rich--compact">' + rich(it.html, ctx) + '</div>' : '')
        + (it.more ? '<p class="post__more">' + more(it.more) + '</p>' : '')
        + '</li>';
    }).join('') + '</ul>';
  }
  /* B.10 doctor block (home: section.doctor with its own container; hub: div.doctor inside the band) */
  /* the photo is 84% of the portrait; the portrait 470 px at most (d), 5/11 of the grid (t), 86% of the column and at
     most 360 px (p) */
  const DOCTOR_SIZES = '(min-width: 1200px) 395px, (min-width: 769px) 33vw, min(303px, calc(72vw - 23px))';
  function doctorPortrait(mem, n) {
    const hooks = ' data-protrude="doctor-photo-' + n + '" data-cross=".doctor__plate" data-depth="fore-soft"';
    const ph = mem.photo
      ? '<div class="doctor__photo frame pl-break"' + hooks + '>' + img(mem.photo, { sizes: DOCTOR_SIZES }) + '</div>'
      : mem.placeholder ? plate(mem.placeholder, 'doctor__photo frame ph-portrait pl-break', hooks) : '';
    /* QA round 1, regressions (R1): a portrait that holds the placeholder plate is a div, not a figure: the plate prints
       the doctor's name, which is not a quotation (sr-fabrication reads every <figure> with more than 20 characters of
       text as a testimonial). A portrait that holds the photo stays a figure (B.10) */
    const tag = !mem.photo && mem.placeholder ? 'div' : 'figure';
    return '<' + tag + ' class="doctor__portrait"><div class="doctor__plate" aria-hidden="true"></div>' + ph + '</' + tag + '>';
  }
  function doctorTag(mem) {
    const inner = mem.href ? '<a href="' + esc(mem.href) + '">' + esc(mem.name) + '</a>' : esc(mem.name);
    return isLevel(mem.level) ? '<' + mem.level + ' class="doctor__tag">' + inner + '</' + mem.level + '>' : '<p class="doctor__tag">' + inner + '</p>';
  }
  function hubDoctors(b, ctx) {
    return b.members.map((mem, i) => '<div class="doctor"><div class="doctor__grid' + (i % 2 ? ' doctor__grid--flip' : '') + '">'
      + doctorPortrait(mem, i + 1)
      + '<div class="doctor__text surface surface--paper rv">' + doctorTag(mem)
      + '<div class="doctor__prose rich">' + rich(mem.html, ctx) + '</div>'
      + (mem.more ? '<p class="member__more">' + more(mem.more) + '</p>' : '')
      + '</div></div></div>').join('');
  }
  /* B.27 team grid. Mobile optimisation (M-SPEED-5): at 600-768 px the grid has two columns and a photo is
     (100vw - 2 x the 4vw gutter - the 20 px column gap) / 2 - 2 x 22 px card padding - 2 px border = 46vw - 56 px wide
     (251 px at 667, measured); the shared 600 px entry said 50vw - 40 px (294 px, 17 % more), which crossed a srcset step at
     667x375 DPR 2 (640 w for 540 w). The phone range takes the measured box; 769-1023 px keeps its entry as it was */
  function teamGrid(b, ctx) {
    return '<ul class="team-grid" role="list">' + b.members.map((mem, i) => {
      const hooks = ' data-protrude="member-' + (i + 1) + '" data-cross="parent"';
      const photo = mem.photo
        ? (() => { const k = coverK(mem.photo, 1); const sizes = '(min-width: 1200px) ' + px(230 * k) + ', (min-width: 1024px) calc(' + r2(33 * k) + 'vw - ' + Math.round(50 * k) + 'px), (min-width: 769px) calc(' + r2(50 * k) + 'vw - ' + Math.round(40 * k) + 'px), (min-width: 600px) calc(' + r2(46 * k) + 'vw - ' + r2(56 * k) + 'px), calc(' + r2(100 * k) + 'vw - ' + Math.round(80 * k) + 'px)'; return '<div class="member__photo frame pl-break"' + hooks + '>' + img(mem.photo, { sizes }) + '</div>'; })()
        : mem.placeholder ? plate(mem.placeholder, 'member__photo frame ph-portrait pl-break', hooks) : '';
      const lvl = isLevel(mem.level) ? mem.level : null;
      const name = mem.href ? '<a class="card__link" href="' + esc(mem.href) + '">' + esc(mem.name) + '</a>' : esc(mem.name);
      return '<li class="member surface surface--frost" data-tilt>' + photo + '<div class="member__body rv">'
        + (lvl ? '<' + lvl + ' class="member__name">' + name + '</' + lvl + '>' : '<p class="member__name">' + name + '</p>')
        + (mem.position ? '<p class="chip">' + esc(mem.position) + '</p>' : '')
        + (mem.html ? '<div class="member__bio rich rich--compact">' + rich(mem.html, ctx) + '</div>' : '')
        + (mem.more ? '<p class="member__more">' + more(mem.more) + '</p>' : '')
        + '</div></li>';
    }).join('') + '</ul>';
  }
  /* B.27 which layout: a team-member page's own block prints the bio inline; all "Our Doctors" -> doctor blocks; else the grid */
  function team(b, ctx, { flow = false } = {}) {
    if (ctx.m.family === 'team-member' && b.view === 'complete' && b.members.length === 1 && !b.members[0].name) return rich(b.members[0].html, ctx, { place: flow });
    if (b.members.length && b.members.every((x) => x.categories === 'Our Doctors')) return hubDoctors(b, ctx);
    return teamGrid(b, ctx);
  }
  /* F.6 */
  function testimonials(b, ctx) {
    return b.items.map((it) => '<figure class="testimonial surface surface--frost">'
      + (it.title ? (isLevel(it.title.level) ? '<' + it.title.level + ' class="testimonial__title">' : '<p class="testimonial__title">') + (it.title.href ? '<a href="' + esc(it.title.href) + '">' + esc(it.title.text) + '</a>' : esc(it.title.text)) + (isLevel(it.title.level) ? '</' + it.title.level + '>' : '</p>') : '')
      + stars(it.stars)
      + '<blockquote class="testimonial__quote rich rich--compact">' + rich(it.html, ctx) + '</blockquote>'
      + '<figcaption class="testimonial__name">' + esc(it.attribution) + '</figcaption></figure>').join('');
  }
  function staticReviews(b, ctx) {
    return b.items.map((it) => '<figure class="review review--static surface surface--frost">'
      + '<div class="review__meta">' + stars(it.stars) + '<time class="review__time" datetime="' + esc(isoT(it.reviewedAt)) + '">' + esc(it.shownAs) + '</time></div>'
      + '<blockquote class="review__quote rich rich--compact">' + rich(it.html, ctx) + '</blockquote>'
      + '<figcaption class="review__name">' + esc(it.name) + '</figcaption></figure>').join('');
  }
  /* F.8 the visit block, parts in the model's order */
  function visit(b) {
    const part = {
      map: b.map ? '<div class="embed embed--map visit__map"><iframe src="' + esc(b.map.src) + '" title="' + esc(b.map.title) + '" loading="lazy"></iframe></div>' : '',
      title: b.title ? (isLevel(b.title.level) ? '<' + b.title.level + ' class="visit__title">' : '<p class="visit__title">') + (b.title.href ? '<a href="' + esc(b.title.href) + '">' + esc(b.title.text) + '</a>' : esc(b.title.text)) + (isLevel(b.title.level) ? '</' + b.title.level + '>' : '</p>') : '',
      contacts: b.contacts.length ? (b.subs.contact ? '<h2 class="visit__sub">' + esc(b.subs.contact) + '</h2>' : '') + contactRows(b.contacts) : '',
      address: b.address.length ? (b.subs.address ? '<h2 class="visit__sub">' + esc(b.subs.address) + '</h2>' : '') + addressLines(b.address) : '',
      hours: b.hours.length ? (b.subs.hours ? '<h2 class="visit__sub">' + esc(b.subs.hours) + '</h2>' : '') + hoursTable(b.hours) : '',
    };
    const details = b.order.filter((k) => k !== 'map').map((k) => part[k] || '').join('');
    return '<div class="visit visit--' + esc(b.view) + '">' + (b.order.includes('map') ? part.map : '') + '<div class="visit__details">' + details + '</div></div>';
  }
  /* F.7 */
  function products(b, ctx) {
    return '<ul class="products" role="list">' + b.items.map((it) => '<li class="product surface surface--frost">'
      + (it.image ? '<div class="product__media">' + img(it.image, { sizes: naturalSizes(it.image), cap: false }) + '</div>' : it.placeholder ? '<div class="product__media">' + plate(it.placeholder, 'ph-portrait') + '</div>' : '')
      + (isLevel(it.level) ? '<' + it.level + ' class="product__title">' + esc(it.title) + '</' + it.level + '>' : '<p class="product__title">' + esc(it.title) + '</p>')
      + '<div class="product__text rich rich--compact">' + rich(it.html, ctx) + '</div>'
      + (it.more ? '<p class="product__more">' + esc(it.more) + '</p>' : '')
      + '</li>').join('') + '</ul>';
  }
  function equipment(b, ctx) {
    return '<ul class="devices" role="list">' + b.items.map((it) => '<li class="device surface surface--frost">'
      + (it.image ? '<div class="device__media">' + img(it.image, { sizes: naturalSizes(it.image), cap: false }) + '</div>' : '')
      + (isLevel(it.level) ? '<' + it.level + ' class="device__title">' + esc(it.title) + '</' + it.level + '>' : '<p class="device__title">' + esc(it.title) + '</p>')
      + '<div class="device__text rich rich--compact">' + rich(it.html, ctx) + '</div>'
      + '</li>').join('') + '</ul>';
  }
  function logos(b) {
    return '<ul class="logo-wall logo-wall--' + esc(b.kind) + '" role="list">' + b.items.map((it) => {
      const im = it.image ? img(it.image, { sizes: naturalSizes(it.image), cap: false }) : it.placeholder ? '<span class="ph-brand" data-needs="' + esc(it.placeholder.needs) + '"><span class="ph-brand__name">' + esc(it.placeholder.label) + '</span></span>' : '';
      return '<li class="logo-wall__chip">' + (it.href ? '<a href="' + esc(it.href) + '">' + im + '</a>' : im) + '</li>';
    }).join('') + '</ul>';
  }
  /* F.5 the sitemap tree: a deeper item opens a nested list inside the previous item, a shallower one closes lists */
  function sitemap(b) {
    let out = '', level = -1;
    for (const it of b.items) {
      const d = Math.max(0, Math.min(it.depth, level + 1));
      if (d > level) out += '<ul class="sitemap__list" role="list">'.repeat(d - level);
      else out += '</li>' + '</ul></li>'.repeat(level - d);
      out += '<li class="sitemap__item"><a class="sitemap__link" href="' + esc(it.href) + '">' + esc(it.title) + '</a>';
      level = d;
    }
    if (level >= 0) out += '</li>' + '</ul></li>'.repeat(level) + '</ul>';
    return '<div class="sitemap">' + out + '</div>';
  }
  function docs(b) {
    return '<ul class="docs" role="list">' + b.items.map((d) => '<li>' + (d.href ? '<a href="' + esc(d.href) + '" type="application/pdf">' + esc(d.label) + '</a>' : '<span class="doc" data-needs="' + esc(d.needs || 'pdf file') + '">' + esc(d.label) + '</span>') + (d.after ? esc(d.after) : '') + '</li>').join('') + '</ul>';
  }
  function cherry(b) {
    if (b.mode === 'embed') return '<div class="cherry">' + b.snippet + '</div>';
    return '<p class="cherry-link">' + (b.applyUrl ? '<a class="btn btn--primary" href="' + esc(b.applyUrl) + '"><span>' + esc(b.label) + '</span>' + ico('arrow') + '</a>' : '<span class="cherry-link__pending" data-needs="' + esc(b.needs) + '">' + esc(b.label) + '</span>') + '</p>';
  }
  const badges = (b) => '<ul class="qa-row" role="list">' + b.items.map((q) => '<li>' + qaLink(q, q.newTab ? ' target="_blank" rel="noopener"' : '') + '</li>').join('') + '</ul>';
  const formCard = (b) => '<div class="form-card surface surface--paper">' + b.html + '</div>';
  const hoursBlock = (b) => hoursTable(b.rows);

  /* the component blocks, the same in the article flow (B.22) and in hub bands (C.7) */
  function component(b, ctx, where) {
    switch (b.type) {
      case 'cta': return btnRow(b.buttons);
      case 'badges': return badges(b);
      case 'childpages': return childpages(b, ctx);
      case 'posts': return posts(b, ctx);
      case 'team': return team(b, ctx, { flow: where === 'flow' });
      case 'testimonials': return testimonials(b, ctx);
      case 'reviews': return staticReviews(b, ctx);
      case 'visit': return visit(b);
      case 'hours': return hoursBlock(b);
      case 'accordion': return accordion(b, ctx);
      case 'video': return video(b);
      case 'products': return products(b, ctx);
      case 'equipment': return equipment(b, ctx);
      case 'logos': return logos(b);
      case 'sitemap': return sitemap(b);
      case 'docs': return docs(b);
      case 'form': return formCard(b);
      case 'cherry': return cherry(b);
      default: throw new Error('templates: no renderer for block type "' + b.type + '" on ' + ctx.m.path);
    }
  }

  /* ---------------------------------------------------------------- D.7.5 added illustrations (art.inline) */
  /* resolve every inline entry of the page to the node it names, the same walk as page-model.mjs anchorIndex():
     section headings, callout titles, and the h2-h6 / p nodes of every non-form block html, in model order */
  function artPlan(m, ctx) {
    const plan = { start: [], sh: new Map(), ct: new Map(), node: new Map() };   /* node key 'si:bi' -> { before: Map, after: Map } */
    ctx.hubThumbs = new Map(); ctx.hubThumbsUsed = new Set();
    const inline = (m.art && m.art.inline) || [];
    if (!inline.length) return plan;
    const nodes = [];
    m.sections.forEach((sec, si) => {
      if (sec.heading) nodes.push({ kind: 'heading', text: sec.heading.text, level: sec.heading.level, where: { t: 'sh', si } });
      sec.blocks.forEach((b, bi) => {
        if (b.type === 'callout' && b.title) nodes.push({ kind: 'heading', text: b.title.text, level: b.title.level, where: { t: 'ct', si, bi } });
        if (typeof b.html === 'string' && b.type !== 'form') {
          const root = parseHtml(b.html);
          const tops = root.children.filter((c) => c.tag !== '#comment' && (c.tag !== '#text' || b.html.slice(c.start, c.end).trim()));
          walkEl(root, (n) => {
            if (/^(h[2-6]|p)$/.test(n.tag)) {
              const top = (() => { let t = n; while (t.parent && t.parent.tag !== '#root') t = t.parent; return t; })();
              nodes.push({ kind: n.tag === 'p' ? 'p' : 'heading', text: plain(textOf(b.html, n)), level: n.tag, where: { t: 'node', si, bi, top: tops.indexOf(top), isTop: top === n } });
              return false;
            }
          });
        }
        if (b.type === 'childpages') b.items.forEach((it) => nodes.push({ kind: 'item', text: it.title, item: it }));
      });
    });
    for (const e of inline) {
      const a = e.anchor || {};
      const im = e.image;
      const pos = String(e.position || '');
      if (a.type === 'hub-item') {
        const n = nodes.find((x) => x.kind === 'item' && anchorKey(x.text) === anchorKey(a.text));
        if (!n || n.item.thumb || !n.item.thumbDropped) throw new Error('templates: art ' + e.id + ' hub-item "' + a.text + '" names no dropped child-page thumb on ' + m.path);
        ctx.hubThumbs.set(anchorKey(a.text), im);
        continue;
      }
      let where = null, side = 'after', place = null;
      if (a.type === 'article-start') { where = { t: 'start' }; side = 'before'; if (/inset right/.test(pos)) place = 'fig--inset'; }
      else if (a.type === 'heading') {
        const n = nodes.find((x) => x.kind === 'heading' && anchorKey(x.text) === anchorKey(a.text) && (!a.level || x.level === a.level));
        if (!n) throw new Error('templates: art ' + e.id + ' heading anchor "' + a.text + '" matches nothing on ' + m.path);
        where = n.where;
        if (/before the heading/.test(pos)) side = 'before';
        else if (/at the start of the section/.test(pos)) side = 'after';
        else throw new Error('templates: art ' + e.id + ' heading anchor with an unknown position "' + pos + '"');
        if (/inset right/.test(pos)) place = 'fig--inset'; else if (/inset left/.test(pos)) place = 'fig--inset-start';
      } else if (a.type === 'after-paragraph') {
        const n = nodes.find((x) => x.kind === 'p' && anchorKey(x.text).endsWith(anchorKey(a.textEndsWith)));
        if (!n) throw new Error('templates: art ' + e.id + ' after-paragraph anchor "' + a.textEndsWith + '" matches nothing on ' + m.path);
        if (!n.where.isTop) throw new Error('templates: art ' + e.id + ' anchors a paragraph that is not a top-level node on ' + m.path);
        where = n.where; side = 'after';
      } else throw new Error('templates: art ' + e.id + ' has an unknown anchor type ' + a.type);
      if (where.t === 'node' && !where.isTop && a.type === 'heading') throw new Error('templates: art ' + e.id + ' anchors a heading that is not a top-level node on ' + m.path);
      place = place || placementOf(['fig', 'fig--photo'], im.w);
      const fig = '<figure class="fig fig--photo ' + place + '"><span class="fig__media">' + img(im, { sizes: figureSizes(place, im.w, 0, ctx.hub) }) + '</span></figure>';
      ctx.stats.art.push(m.path + ' ' + e.id + ' ' + a.type + ' ' + side + ' ' + place);
      if (where.t === 'start') plan.start.push(fig);
      else if (where.t === 'sh') { const k = where.si; if (!plan.sh.has(k)) plan.sh.set(k, { before: [], after: [] }); plan.sh.get(k)[side].push(fig); }
      else if (where.t === 'ct') { const k = where.si + ':' + where.bi; if (!plan.ct.has(k)) plan.ct.set(k, { before: [], after: [] }); plan.ct.get(k)[side].push(fig); }
      else { const k = where.si + ':' + where.bi; if (!plan.node.has(k)) plan.node.set(k, { before: new Map(), after: new Map() }); const mp = plan.node.get(k)[side]; if (!mp.has(where.top)) mp.set(where.top, []); mp.get(where.top).push(fig); }
    }
    return plan;
  }

  /* ---------------------------------------------------------------- B.22 the long-form flow, B.24 the CTA band */
  function ctaQualifies(b) {
    return b && (b.type === 'callout' || b.type === 'cta') && (b.buttons || []).some((x) => isAppointment(x) || isTel(x));
  }
  function ctaBand(b, ctx) {
    const c = ctx.m.chrome;
    const t = b.type === 'callout' ? b.title : null;
    const hasText = !!(t || (b.type === 'callout' && b.html));
    const actions = b.buttons.map((x) => (isAppointment(x) ? btn(x, { variant: 'btn--light', lg: true }) : isTel(x) ? btn(x, { variant: 'btn--primary', lg: true }) : btn(x, { lg: true }))).join('')
      /* Q-2 (declared): the chrome call action, a repeat of chrome.topbar.call, unless the block has its own tel: button */
      + (b.buttons.some(isTel) ? '' : '<a class="btn btn--primary btn--lg" href="' + esc(c.topbar.call.href) + '">' + ico('phone') + '<span>' + esc(c.topbar.call.label) + '</span></a>');
    ctx.stats.ctaband++;
    return '<section class="ctaband aurora-deep rv">' + ra('q1', 'd:64%,56% p:18%,50%')
      + '<div class="ctaband__panel surface surface--navy">'
      + (hasText ? '<div class="ctaband__text">'
        + (t ? (isLevel(t.level) ? '<' + t.level + ' class="wave-rule wave-rule--light" id="cta-title">' + titleInner(t) + '</' + t.level + '>' : '<p class="callout-title">' + titleInner(t) + '</p>') : '')
        + (b.html ? '<div class="ctaband__copy rich">' + rich(b.html, ctx, { enhance: true, place: true }) + '</div>' : '')
        + '</div>' : '')
      + '<div class="ctaband__actions">' + actions + '</div>'
      + '</div></section>';
  }
  /* the article flow: every section and block in model order, one div.prose.rich, the last block lifted when it qualifies */
  function flow(m, ctx) {
    const legal = m.family === 'legal';
    const plan = artPlan(m, ctx);
    const blocks = m.sections.flatMap((s, si) => s.blocks.map((b, bi) => ({ b, si, bi })));
    const last = blocks[blocks.length - 1];
    const lift = last && ctaQualifies(last.b) ? last : null;
    const parts = [...plan.start];
    m.sections.forEach((sec, si) => {
      const sh = plan.sh.get(si);
      if (sec.heading) {
        const h = sec.heading;
        if (sh) parts.push(...sh.before);
        parts.push('<' + h.level + attr('id', h.id || null) + '>' + h.html + '</' + h.level + '>');
        if (sh) parts.push(...sh.after);
      }
      sec.blocks.forEach((b, bi) => {
        if (lift && lift.b === b) return;
        const key = si + ':' + bi;
        const ins = plan.node.get(key) || null;
        if (b.type === 'prose') { parts.push(rich(b.html, ctx, { enhance: true, legal, place: true, inserts: ins })); return; }
        if (b.type === 'callout') {
          const ct = plan.ct.get(key);
          const html = b.html ? rich(b.html, ctx, { enhance: true, legal, place: true, inserts: ins }) : '';
          const fig = calloutFigure(b.image, ctx, false);
          if (b.title) {
            if (ct) parts.push(...ct.before);
            parts.push(isLevel(b.title.level) ? '<' + b.title.level + '>' + titleInner(b.title) + '</' + b.title.level + '>' : '<p class="callout-title">' + titleInner(b.title) + '</p>');
            if (ct) parts.push(...ct.after);
            parts.push((b.imageFirst ? fig : '') + html + (b.imageFirst ? '' : fig) + btnRow(b.buttons));
          } else {
            parts.push('<div class="panel surface surface--tint">' + fig + html + btnRow(b.buttons) + '</div>');
          }
          return;
        }
        parts.push(component(b, ctx, 'flow'));
      });
    });
    return { html: parts.join('\n'), cta: lift ? ctaBand(lift.b, ctx) : '' };
  }

  /* QA round 1 (PERF-5, DESIGN-SPEC 7 "lazy below the first screen"): the first 4 images of the main content load
     eagerly (a lead figure, or the first row of a product / logo grid); on 56-60 pages a lazy image sat inside the first
     screen and was fetched only after the load event */
  const eagerFirst = (html) => { let n = 0; return html.replace(/<img\b[^>]*>/g, (tag) => (n++ < 4 ? tag.replace(/\sloading="lazy"/, '') : tag)); };
  /* ---------------------------------------------------------------- C.1 the article frame */
  function articleMain(m, ctx) {
    const f = flow(m, ctx);
    f.html = eagerFirst(f.html);
    return titleBand(m, ctx)
      + '\n<div class="layout">' + ARTICLE_ROUTE.map(([k, a]) => ra(k, a)).join('')
      + '<div class="container pl-surface layout__grid">'
      + '<article class="prose-card surface surface--paper"><div class="prose rich">\n' + f.html + '\n</div></article>'
      + f.cta
      + aside(m.aside)
      + '</div></div>';
  }

  /* ---------------------------------------------------------------- C.7 the builder-hub frame */
  function bandVariant(m, sec, si) {
    if (si === 0 && m.family === 'builder-hub' && sec.background && sec.background[0] && !sec.background[0].superseded) return 'intro';
    if ((sec.background || []).some((g) => !g.superseded && g.from === 'row')) return 'photo';
    if (['cards', 'logos', 'team'].includes(sec.kind)) return 'sky';
    if (sec.kind === 'cta') return 'lav';
    return 'plain';
  }
  function hubCallout(b, ctx) {
    const html = b.html ? rich(b.html, ctx, { enhance: true, place: true, hub: true }) : '';
    const fig = calloutFigure(b.image, ctx, true);
    if (!b.title) return '<div class="panel surface surface--tint rich">' + fig + html + btnRow(b.buttons) + '</div>';
    const title = isLevel(b.title.level) ? '<' + b.title.level + '>' + titleInner(b.title) + '</' + b.title.level + '>' : '<p class="callout-title">' + titleInner(b.title) + '</p>';
    return '<div class="hub-callout surface surface--paper rich">' + (b.imageFirst ? fig : '') + title + html + (b.imageFirst ? '' : fig) + btnRow(b.buttons) + '</div>';
  }
  function hubBlocks(sec, variant, ctx) {
    const out = [];
    const bl = sec.blocks;
    for (let i = 0; i < bl.length; i++) {
      const b = bl[i];
      if (variant === 'intro' && b.type === 'callout') {
        const t = b.title && !b.titleIsPageH1 ? (isLevel(b.title.level) ? '<' + b.title.level + '>' + titleInner(b.title) + '</' + b.title.level + '>' : '<p class="callout-title">' + titleInner(b.title) + '</p>') : '';
        out.push('<div class="hub-intro surface surface--glass rich">' + t + (b.html ? rich(b.html, ctx, { enhance: true, place: true, hub: true }) : '') + btnRow(b.buttons) + '</div>');
        continue;
      }
      /* a run of 2+ consecutive callouts with level-null titles and empty html: brand cards (C.7) */
      const brandish = (x) => x && x.type === 'callout' && x.title && !x.title.level && !x.html;
      if (brandish(b) && brandish(bl[i + 1])) {
        const run = [];
        while (brandish(bl[i])) run.push(bl[i++]);
        i--;
        out.push('<ul class="cards cards--brand" role="list">' + run.map((x) => '<li class="card card--brand surface surface--frost rv">'
          + (x.image ? '<div class="card__media">' + img(x.image, { sizes: naturalSizes(x.image), cap: false }) + '</div>' : '')
          + '<p class="card__title">' + titleInner(x.title) + '</p></li>').join('') + '</ul>');
        continue;
      }
      if (b.type === 'prose') { out.push('<div class="hub-flow prose rich">' + rich(b.html, ctx, { enhance: true, place: true, hub: true }) + '</div>'); continue; }
      if (b.type === 'callout') { out.push(hubCallout(b, ctx)); continue; }
      out.push(component(b, ctx, 'hub'));
    }
    return out.join('');
  }
  function hubMain(m, ctx) {
    ctx.hub = true;
    artPlanHub(m, ctx);
    const bands = m.sections.map((sec, si) => {
      const v = bandVariant(m, sec, si);
      const heading = sec.heading ? '<' + sec.heading.level + ' class="section-title wave-rule wave-rule--center"' + attr('id', sec.heading.id || null) + '>' + sec.heading.html + '</' + sec.heading.level + '>' : '';
      const bg = v === 'photo' ? sec.background.filter((g) => !g.superseded).map((g) => '<figure class="section__bg">' + img(g.image, { sizes: bandBgSizes(g.image), cap: false }) + '</figure>').join('') : '';
      const inner = hubBlocks(sec, v, ctx);
      return '<section class="band band--' + v + '"' + (v === 'sky' || v === 'lav' ? ' data-band' : '') + '>'
        + (v === 'lav' ? bank('bank--up bank--lav') : '')
        + bg
        + ra('b' + (si + 1), HUB_ROUTE)
        + '<div class="container pl-surface band__inner">'
        + (v === 'photo' ? '<div class="band__panel surface surface--image">' + heading + inner + '</div>' : heading + inner)
        + '</div></section>';
    });
    return titleBand(m, ctx) + '\n' + eagerFirst(bands.join('\n'));
  }
  /* a band background (figure.section__bg, C.7) covers its whole band: it renders at max(band width, band height x
     its aspect). The band's height follows its content, so this is the measured worst case per layout (refined by the
     sizes probe): at most the file itself */
  function bandBgSizes(im) {
    /* measured on /contact-lenses/ and /eyeglasses/designer-frames/: 2,133 to 3,989 px rendered at 360-1920, wider than
       the largest file at every width, so the slot asks for the largest file */
    const max = Math.max(im.w, ...(im.srcset || []).map((s) => s.w));
    return max + 'px';
  }
  /* hubs carry added illustrations only as child-page thumbs (hub-item anchors) */
  function artPlanHub(m, ctx) {
    const plan = artPlan(m, ctx);
    if (plan.start.length || plan.sh.size || plan.ct.size || plan.node.size) throw new Error('templates: a prose-anchored added illustration on a hub page is not placed by C.7: ' + m.path);
  }

  /* ---------------------------------------------------------------- A page */
  function bodyClass(m) {
    const tpl = m.isHome ? 'tpl-home' : (m.family === 'builder-hub' || m.family === 'template') ? 'tpl-hub' : 'tpl-article';
    return 'page-' + m.family + ' ' + tpl + (m.aside ? ' has-aside' : '');
  }
  /* QA round 1 (PERF-10, fix-2): when the title-band arch shows a file that the page prints again in its content (same
     srcset: the practice interior on /hours-location/, the one such page), the arch takes that image's sizes, so both
     resolve to the same srcset candidate and the photo is fetched once at every viewport. Before, 1440x900 DPR 1 fetched
     it twice (720 w for the 715 px arch, 1024 w for the 1200 px wide figure). The arch is drawn the same; where its frame
     needs less, it decodes the file the content image fetches anyway */
  function shareArchFile(main) {
    const a = /<figure class="titleband__frame[^"]*"[^>]*>\s*(<img\b[^>]*>)/.exec(main);
    if (!a) return main;
    const tag = a[1], ss = (/\ssrcset="([^"]+)"/.exec(tag) || [])[1];
    if (!ss || !/\ssizes="[^"]*"/.test(tag)) return main;
    const rest = main.slice(a.index + a[0].length);
    const twin = [...rest.matchAll(/<img\b[^>]*>/g)].map((x) => x[0]).find((t) => (/\ssrcset="([^"]+)"/.exec(t) || [])[1] === ss);
    const sz = twin && (/\ssizes="([^"]+)"/.exec(twin) || [])[1];
    if (!sz) return main;
    return main.slice(0, a.index) + a[0].replace(tag, tag.replace(/\ssizes="[^"]*"/, () => ' sizes="' + sz + '"')) + rest;
  }
  /* renderPage(model) for every page but the home; renderPage(model, mainInner) for the home (home.mjs built the main
     with the context it opened) */
  function renderPage(m, mainInner) {
    const ctx = (mainInner !== undefined && opened.get(m)) || context(m);
    let main;
    if (mainInner !== undefined) main = mainInner;
    else if (m.family === 'builder-hub' || m.family === 'template') main = hubMain(m, ctx);
    else main = articleMain(m, ctx);
    main = shareArchFile(main);
    if (ctx.hubThumbs) for (const k of ctx.hubThumbs.keys()) if (!ctx.hubThumbsUsed.has(k)) throw new Error('templates: the hub-item illustration for "' + k + '" found no child-page card on ' + m.path);
    const c = m.chrome;
    const body = '<a class="skip" href="' + esc(c.skip.href) + '">' + esc(c.skip.label) + '</a>\n'
      + '<div class="aurora-field" aria-hidden="true"><div class="aurora-field__layer aurora-field__layer--dawn"></div><div class="aurora-field__layer aurora-field__layer--day"></div><div class="aurora-field__layer aurora-field__layer--dusk"></div></div>\n'
      + '<header class="site-header">' + topbar(c) + navbar(c) + '</header>\n'
      + '<div class="page" id="page">\n'
      + '<svg class="river river--under" aria-hidden="true" focusable="false"></svg><svg class="river river--over" aria-hidden="true" focusable="false"></svg>\n'
      + '<main id="main" tabindex="-1">\n' + main + '\n</main>\n'
      + footer(m) + '\n'
      + '</div>\n'
      + drawer(c);
    const html = [
      head(m, ctx),
      '<body class="' + esc(bodyClass(m)) + '">',
      sprite(body, m.isHome ? ['play', 'pause'] : []),
      body,
      '</body>',
      '</html>',
      '',
    ].join('\n');
    ctxLog.push({ path: m.path, stats: ctx.stats });
    return html;
  }
  const ctxLog = [];

  return {
    renderPage, context, transformHtml, splitTop, parseHtml, img, srcsetOf, btn, btnRow, ico, bank, ra, rz, heroLight, plate, initialsOf, stars, isoT,
    doctorPortrait, doctorTag, posts, rich, coverK, r2, px, log: ctxLog,
  };
}
