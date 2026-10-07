/* content.mjs - turns a source page's HTML into clean, platform-free content fragments + component data.

   Forked from the reference build (R) src/lib/content.mjs. The generic sanitiser and its helpers
   (wrapLooseText, balanceFragment, dedupe*, figures, sections) are carried UNCHANGED (PORT-NOTES 2.1: KEEP).
   Riverside changes (docs/PORT-NOTES.md sections 1-3; each tagged with its PORT-NOTES id):
   - 2.1  localHref: the own host comes from chrome.origin only (www and bare host); `javascript:` hrefs are
          unwrapped to their words (CL-1); MOVED = the site's own 16 live redirect aliases (LK-1, seo.mjs); an
          external href is returned as the source wrote it, not as the URL parser normalises it (fix round 1, D3).
   - sanitize: an end tag of a void element is read as the HTML parser reads it ("</br>" is <br>, others are
          ignored; fix round 1, D1); opts.onDrop reports every image dropped by decision to the page model (D5).
   - prepare: a /template/* platform menu that is not a copy of the site menus is kept as page content (D6); the
          breadcrumb reports an EMPTY own segment (`trailOwnEmpty`, the 17 archives; D2).
   - fix round 2: sanitize reports every alt it blanks (opts.onAltBlank, declared per page); the heading-run merge
          of dedupeSections keeps each heading at its source level (R2-4: R demoted the later ones to h3).
   - wf5b R3-1: sanitize closes an open <p> at a <p> start tag, as the HTML parser does (the nested start tag used to be
          dropped, merging the paragraphs; 2 such tags on the whole crawl, both on /website-accessibility-policy/).
   - 2.1  SOCIAL_HOSTS knows goo.gl (the Google icon link in /winter-dry-eyes-2023/ points at maps.app.goo.gl).
   - 2.1  imgRole reads the Riverside image classes (audit/image-classification.json class/subclass).
   - SC-1 the two unrendered platform shortcodes are resolved to the account values they request (a declared
          repair: audit/clone-removals.json `replacements`).
   - prepare() lifts every platform module that needs more than the generic sanitiser, as DATA, and leaves a
          token the page model turns into a typed block (docs/BUILD-NOTES.md, "Page model contract"):
          VS-1 location modules (every contact type + PHI note, hours split per interval), TM-1 every card of
          every team module, TS-1 testimonial cards with their title, CL-1 contact-lens products (full text
          once, the platform's truncated excerpt dropped and declared, the javascript toggle unwrapped), VD-1
          self-hosted videos, the Q&A accordions, the review widget, post lists in summary/grid/list view,
          callouts, equipment items, the frame-brand gallery, logo walls, the HTML sitemap and the Cherry widget.
          A lift that cannot account for every word of its module is NOT made (the module stays generic prose).
   Copy is never rewritten: text comes out of the source HTML and goes into the rebuild unchanged. */
import { esc, decodeEntities, plain, findElements, attrOf, innerOf } from './util.mjs';
import { remap } from './restructure.mjs';

export const PARA_BREAK = String.fromCharCode(1);
export const TOKEN = String.fromCharCode(2);
export const tokenOf = (n) => TOKEN + 'C' + n + TOKEN;
export const TOKEN_RE = new RegExp(TOKEN + 'C(\\d+)' + TOKEN, 'g');

const KEEP_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','ul','ol','li','a','strong','b','em','i','u','br','hr','img','blockquote','table','thead','tbody','tfoot','tr','th','td','figure','figcaption','sup','sub','small','iframe','dl','dt','dd','address','cite','code','pre']);
/* Unwrapping one of these leaves no separator: they sit inside a word or phrase. */
const INLINE_UNWRAP = new Set(['span','font','abbr','acronym','bdi','bdo','mark','ins','del','s','strike','big','tt','var','samp','kbd','q','time','wbr','nobr','center']);
const DROP_WHOLE = /<(script|style|noscript|svg|form|select|button|textarea|nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi;
const SELF_DROP = /<(input|meta|link|source|track)\b[^>]*\/?>/gi;
const BLOCK_LEVEL = new Set(['ul','ol','li','h1','h2','h3','h4','h5','h6','table','thead','tbody','tfoot','tr','td','th','blockquote','figure','figcaption','hr','iframe','img','form','section','div','dl','dt','dd','pre','address']);
const VOID_LEVEL = new Set(['hr','img','br','input','source']);
const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
/* wf5b R3-1: the HTML parser's p rules ("in body" insertion mode): these start tags close a p that is in button scope;
   the scope ends at these elements (a p outside a table cell is not closed from inside it) */
const CLOSES_P = new Set(['address','article','aside','blockquote','center','details','dialog','dir','div','dl','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','header','hgroup','hr','li','dd','dt','main','menu','nav','ol','p','pre','listing','search','section','summary','table','ul','xmp','plaintext']);
const P_SCOPE_STOP = new Set(['applet','caption','html','table','td','th','marquee','object','template','button']);
/* link types an external <a> keeps from the source; anything else (WordPress "attachment wp-att-N") is dropped */
const REL_KEEP = new Set(['nofollow', 'noopener', 'noreferrer', 'sponsored', 'ugc']);

const SOCIAL_HOSTS = [
  [/(^|\.)facebook\.com$/i, 'Facebook'], [/(^|\.)yelp\.com$/i, 'Yelp'], [/(^|\.)google\.com$/i, 'Google'], [/(^|\.)goo\.gl$/i, 'Google'],
  [/(^|\.)instagram\.com$/i, 'Instagram'], [/(^|\.)linkedin\.com$/i, 'LinkedIn'], [/(^|\.)youtube\.com$/i, 'YouTube'],
  [/(^|\.)(twitter|x)\.com$/i, 'Twitter'],
];

const textIn = (html) => plain(String(html || '').replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' '));
/* every word of a fragment, whitespace removed: the self-check of each lift compares these */
const squashText = (html) => textIn(html).replace(/\s+/g, '');
const firstEl = (html, re) => (findElements(html, re)[0] || null);
const linkOf = (html) => {
  const a = /<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(html || '');
  return a ? { href: decodeEntities(attrOf(a[1], 'href') || '').trim() || null, html: a[2], newTab: /target=["']_blank/i.test(a[1]), rel: decodeEntities(attrOf(a[1], 'rel') || ''), ariaLabel: decodeEntities(attrOf(a[1], 'aria-label') || '') } : null;
};
const imgOf = (html) => {
  const m = /<img\b([^>]*)>/i.exec(html || '');
  return m ? { src: decodeEntities(attrOf(m[1], 'src') || attrOf(m[1], 'data-src') || '').trim(), alt: decodeEntities(attrOf(m[1], 'alt') || '').trim(), hasAlt: attrOf(m[1], 'alt') !== null } : null;
};

export function createContent(ctx) {
  const { origin, imageMap, willExist, moved, fail, stats, imgUrl } = ctx;
  /* restructure (src/lib/restructure.mjs): every own link resolves to the page's path in the restructured site */
  const newExist = new Set([...willExist].map(remap));
  const OLD_VENDOR = /eyecarepro/i;
  const bump = (k, n = 1) => { stats[k] = (stats[k] || 0) + n; };
  /* 2.1: the own host is chrome.origin's host, with or without www (the source prints most internal links as
     absolute https://www.riversidefamilyeyecare.com/... URLs). No other host is own. */
  const ownHost = new URL(origin).hostname.replace(/^www\./i, '');
  const ownHostRe = new RegExp('^(?:www\\.)?' + ownHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  /* the labels of the site menus (chrome.json primary menu + children, footer menu, utility links): a platform menu
     on a /template/* page whose items are all of these is a copy of the chrome (see prepare) */
  const siteMenuLabels = new Set((ctx.siteMenuLabels || []).map((l) => plain(l).toLowerCase()));

  /* mod_pagespeed rewrites one image into many URLs that differ only by a cache hash. */
  function baseKey(u) {
    return String(u || '')
      .replace(/\.pagespeed\.[a-z]{2}\.[A-Za-z0-9_-]+(\.[a-z0-9]+)$/i, '$1')
      .replace(/\/x([^/]+)$/, '/$1');
  }

  /* Architecture is preserved: /a/b/ on the source is /a/b/ in the rebuild. Every internal URL is
     page-relative (../ x depth + path/index.html) so dist/ works from any directory or subpath.
     Returns null for an internal target this build does not produce (the anchor is unwrapped: words
     stay, dead href goes). An alias the live site redirects is re-pointed to its final page (MOVED). */
  function localHref(href, depth) {
    if (href === null || href === undefined) return null;
    let h = String(href).trim();
    if (/^tel:/i.test(h)) return 'tel:' + h.slice(4).replace(/\s+/g, '');   // C01: "tel: 239-500-2020"
    if (/^javascript:/i.test(h)) { bump('scriptLinksUnwrapped'); return null; }   // CL-1: script-only toggles keep their words
    if (/^(mailto:|#)/i.test(h)) return h;
    if (/^\/\//.test(h)) h = 'https:' + h;
    let u;
    try { u = new URL(h, origin + '/'); } catch { return null; }
    const own = u.origin === origin || (/^https?:$/.test(u.protocol) && ownHostRe.test(u.hostname));
    /* an external link is the SOURCE string (trimmed; "//host" gets https:), never the URL parser's normalisation:
       u.href turned the home's referral link "https://www.alumiermd.com?code=ATwPQnFl" into ".com/?code=" (Q14 keeps
       it verbatim) */
    if (!own) return h;
    const p = decodeURIComponent(u.pathname).replace(/^\/+|\/+$/g, '');
    const rel = depth === 0 ? '' : '../'.repeat(depth);
    if (/\.(xml|txt|pdf)$/i.test(p)) return rel + p;
    if (!p) return rel + 'index.html' + (u.hash || '');
    if (!willExist.has(p)) {
      /* restructure: a path of the restructured site (chrome.json menus, adopted pages) is already final */
      if (newExist.has(p)) return rel + p + '/index.html' + (u.hash || '');
      const m = moved.get(p);
      if (m !== undefined && (m === '' || willExist.has(m))) { stats.moved.set(p, (stats.moved.get(p) || 0) + 1); return rel + (m ? remap(m) + '/index.html' : 'index.html') + (u.hash || ''); }
      stats.dead.set(p, (stats.dead.get(p) || 0) + 1);
      return null;
    }
    return rel + remap(p) + '/index.html' + (u.hash || '');
  }

  /* own path ('/a/b/') of an internal href, or null (external / not a page) */
  function ownPathOf(href) {
    if (!href) return null;
    let h = String(href).trim();
    if (/^(tel:|mailto:|javascript:|#)/i.test(h)) return null;
    if (/^\/\//.test(h)) h = 'https:' + h;
    let u;
    try { u = new URL(h, origin + '/'); } catch { return null; }
    if (!(u.origin === origin || ownHostRe.test(u.hostname))) return null;
    let p = decodeURIComponent(u.pathname).replace(/^\/+|\/+$/g, '');
    if (!willExist.has(p) && !newExist.has(p) && moved.has(p)) p = moved.get(p);
    p = remap(p);
    return p ? '/' + p + '/' : '/';
  }

  function socialBrand(href) {
    let host;
    try { host = new URL(href, origin + '/').hostname; } catch { return null; }
    for (const [re, name] of SOCIAL_HOSTS) if (re.test(host)) return name;
    return null;
  }

  /* An icon-only anchor (its glyph was an inline <svg>, dropped with the platform markup) keeps a
     visible label only when the SOURCE gave it one: its own aria-label ("Visit us on facebook").
     Any other empty anchor is dropped. */
  function fillIconLinks(html) {
    return html.replace(/<a\b([^>]*)><\/a>/gi, (full, attrs) => {
      const m = /href\s*=\s*"([^"]*)"/i.exec(attrs);
      if (!m || !socialBrand(decodeEntities(m[1]))) return '';
      const label = /aria-label="([^"]*)"/i.exec(attrs);
      if (!label) { bump('iconLinksDropped'); return ''; }
      bump('iconLinksLabelled');
      return '<a' + attrs.replace(/\s*aria-label="[^"]*"/i, '') + '>' + label[1] + '</a>';
    });
  }

  /* R-1: <main> whenever it exists (142/148); <body> only for the 6 /template/* pages. */
  function mainRegion(html) {
    const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (m) return { html: m[1], region: 'main' };
    const b = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    return { html: b ? b[1] : html, region: 'body' };
  }

  function stripVendorClauses(html) {
    return html.replace(/<p>([\s\S]*?)<\/p>/gi, (full, inner) => {
      if (!OLD_VENDOR.test(inner)) return full;
      const kept = inner.split(/(?<=\.)\s+/).filter((s) => {
        if (!OLD_VENDOR.test(s)) return true;
        bump('vendorClauses');
        (stats.vendorSentences = stats.vendorSentences || new Set()).add(decodeEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim());
        return false;
      });
      const out = kept.join(' ').replace(/\s+/g, ' ').trim();
      if (!out) { bump('vendorParas'); return ''; }
      return '<p>' + out + '</p>';
    });
  }

  /* MP-1: the source's map embed carries the platform's Google Maps API key and a place_id the keyless
     endpoint cannot resolve; the keyless maps?q=<chrome.mapQuery>&output=embed form is used. */
  function dekeyMapEmbed(src) {
    let u;
    try { u = new URL(src, origin + '/'); } catch { return src; }
    if (!/(^|\.)google\.com$/i.test(u.hostname)) return src;
    if (!/^\/maps\/embed\/v1\//.test(u.pathname)) return src;
    let q = u.searchParams.get('q') || u.searchParams.get('center');
    if (!q) { bump('mapKeysLeft'); return 'https://www.google.com/maps?q=' + encodeURIComponent(ctx.mapQuery) + '&output=embed'; }
    if (/^place_id:/i.test(q) && ctx.mapQuery) { q = ctx.mapQuery; bump('mapPlaceIdsResolved'); }
    bump('mapKeysStripped');
    return 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
  }

  function wrapLooseText(html) {
    html = html.replace(/<\/p>\s*<p\b[^>]*>/gi, PARA_BREAK).replace(/<p\b[^>]*>/gi, '').replace(/<\/p>/gi, PARA_BREAK);
    const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let out = '', buf = '', depth = 0, last = 0, m;
    const flush = () => {
      for (const part of buf.split(PARA_BREAK)) {
        const text = part.replace(/<[^>]+>/g, '').replace(/&nbsp;|\s/g, '');
        if (text) { out += '<p>' + part.trim() + '</p>'; bump('looseRunsWrapped'); }
      }
      buf = '';
    };
    while ((m = tagRe.exec(html))) {
      const chunk = html.slice(last, m.index);
      last = tagRe.lastIndex;
      const closing = !!m[1], tag = m[2].toLowerCase();
      /* a link around nothing but image(s) is ONE block unit (wrapContentFigures puts it in a figure) */
      if (depth === 0 && !closing && tag === 'a') {
        const linked = /^(?:\s*<img\b[^>]*>)+\s*<\/a>/i.exec(html.slice(last));
        if (linked) { buf += chunk; flush(); out += m[0] + linked[0].trim(); last = tagRe.lastIndex = last + linked[0].length; bump('linkedImagesKept'); continue; }
      }
      const isBlock = BLOCK_LEVEL.has(tag), isVoid = VOID_LEVEL.has(tag);
      if (depth > 0) { out += chunk + m[0]; }
      else if (isBlock) { buf += chunk; flush(); out += m[0]; }
      else { buf += chunk + m[0]; continue; }
      if (isBlock && !isVoid) depth += closing ? -1 : 1;
      if (depth < 0) depth = 0;
    }
    buf += html.slice(last);
    flush();
    return out;
  }

  function mapImage(rawSrc, imgBase) {
    let abs = rawSrc;
    try { abs = new URL(rawSrc, imgBase || origin + '/').href; } catch { /* keep raw */ }
    if (/^\/\//.test(rawSrc)) abs = 'https:' + rawSrc;
    return imageMap.get(abs) || imageMap.get(rawSrc) || imageMap.get(baseKey(abs)) || (ctx.byFileName ? ctx.byFileName(abs) : null) || null;
  }

  /* base: the page's own URL with its trailing slash (WordPress serves every page there), which is
     what a RELATIVE <img src> resolves against in a browser - not the site root.
     opts.onDrop({ src, why }): called for every image this call drops by decision, so the page model can declare it
     on its own page (docs/BUILD-NOTES.md 5.1 `declared`). */
  function sanitize(html, depth, base, opts = {}) {
    const imgBase = base ? String(base).replace(/\/?$/, '/') : origin + '/';
    let s = html;
    s = s.replace(/<!--[\s\S]*?-->/g, '');
    s = s.replace(/<a\b[^>]*>\s*Skip to (?:main )?content\s*<\/a>/gi, '');
    s = s.replace(/<a\b[^>]*href\s*=\s*["']#["'][^>]*>\s*(?:[xX×✕✖+−^]|&times;)\s*<\/a>/g, '');
    /* an anchor with BLOCK children keeps its own label: flatten the blocks before unwrapping */
    s = s.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (anchor) => {
      if (!/<(div|p|h[1-6]|section|article|header|footer|ul|ol|li|figure)\b/i.test(anchor)) return anchor;
      bump('anchorsFlattened');
      return anchor.replace(/<\/?(div|p|h[1-6]|section|article|header|footer|ul|ol|li|figure)\b[^>]*>/gi, ' ');
    });
    let prev;
    do { prev = s; s = s.replace(DROP_WHOLE, ''); } while (s !== prev);
    s = s.replace(SELF_DROP, '');

    /* wf5b R3-1: the open elements this pass has seen, so a <p> start tag can close an open p the way the HTML parser
       does ("close a p element" whenever a p is in button scope). Before, the nested start tag was simply dropped, so
       "<p>Email us at: ... <p>Phone us at: ... <p>Write to us at: ..." (/website-accessibility-policy/) printed as ONE
       paragraph. Block start tags that close a p only pop it here: this pipeline already breaks at them. */
    const open = [];
    const pInButtonScope = () => { for (let k = open.length - 1; k >= 0; k--) { if (open[k] === 'p') return k; if (P_SCOPE_STOP.has(open[k])) return -1; } return -1; };
    s = s.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, close, tagRaw, attrs) => {
      const tag = tagRaw.toLowerCase();
      let closesOpenP = false;
      if (!VOID_TAGS.has(tag)) {
        if (close) { const at = open.lastIndexOf(tag); if (at !== -1) open.length = at; }
        else {   /* "<x/>" of a non-void element is a start tag to the parser (the slash is ignored) */
          if (CLOSES_P.has(tag)) { const at = pInButtonScope(); if (at !== -1) { open.length = at; closesOpenP = tag === 'p'; } }
          open.push(tag);
        }
      }
      /* an end tag of a void element is a source error; read it the way the HTML parser does: "</br>" is a <br>
         (the home's "Meet Our Optometrist, </br> Dr. Brittany Degler"), any other one is ignored */
      if (close && VOID_TAGS.has(tag)) { bump('voidEndTagsRepaired'); return tag === 'br' ? '<br>' : ''; }
      if (closesOpenP) { bump('paragraphsClosedByP'); return '</p><p>'; }
      if (!KEEP_TAGS.has(tag)) return INLINE_UNWRAP.has(tag) ? '' : PARA_BREAK;
      if (close) return '</' + tag + '>';
      const out = [];
      const pick = (name) => attrOf(attrs, name);
      if (tag === 'a') {
        const rawHref = decodeEntities(pick('href') || '').trim();
        if (!rawHref || rawHref === '#') return '';
        if (/^tel:\s*$/i.test(rawHref)) { bump('emptyTelUnwrapped'); return ''; }   // href="tel:" with no number (template pages)
        const pdf = ctx.pdfFor ? ctx.pdfFor(rawHref, depth) : null;
        const href = pdf || localHref(rawHref, depth);
        if (!href) return '';
        out.push('href="' + esc(href) + '"');
        /* an external link keeps its SOURCE rel and target; link types kept: nofollow noopener noreferrer sponsored ugc */
        if (/^https?:/i.test(href)) {
          const target = decodeEntities(pick('target') || '').trim();
          const rel = [...new Set(decodeEntities(pick('rel') || '').toLowerCase().split(/\s+/).filter((t) => REL_KEEP.has(t)))];
          if (target.toLowerCase() === '_blank' && !rel.includes('noopener')) rel.push('noopener');
          if (rel.length) out.push('rel="' + esc(rel.join(' ')) + '"');
          if (target) out.push('target="' + esc(target) + '"');
        }
        const ariaLabel = decodeEntities(pick('aria-label') || '').trim();
        if (ariaLabel) out.push('aria-label="' + esc(ariaLabel) + '"');
      } else if (tag === 'img') {
        const rawSrc = decodeEntities(pick('src') || pick('data-src') || '');
        const mapped = mapImage(rawSrc, imgBase);
        if (!mapped) { fail('build:img', rawSrc, 'no mapping for image referenced in content'); return ''; }
        if (mapped.drop) {
          bump('imagesDroppedByDecision');
          (stats.decidedImageDrops = stats.decidedImageDrops || []).push({ page: base, src: rawSrc, why: mapped.why || '' });
          if (opts.onDrop) opts.onDrop({ src: rawSrc, why: mapped.why || '' });
          return '';
        }
        if (mapped.placeholder) { fail('build:img', rawSrc, 'a refused ' + mapped.placeholder.kind + ' image sits in generic prose (needs a component placeholder): ' + base); return ''; }
        /* the alt is this page's OWN source alt; a file-name / upload-hash alt is blanked (garbageAlt) */
        const altAttr = decodeEntities(pick('alt') || '').trim();
        const ownAlt = altAttr && !(ctx.garbageAlt && ctx.garbageAlt(altAttr, rawSrc)) ? altAttr : '';
        if (altAttr && !ownAlt && opts.onAltBlank) opts.onAltBlank({ src: rawSrc, alt: altAttr });
        if (!altAttr && mapped.kind !== 'generated' && mapped.alt) bump('altsNotBorrowedFromOtherPages');
        const alt = mapped.kind === 'generated' ? mapped.alt : ownAlt;
        out.push('src="' + esc(imgUrl(mapped.file, depth)) + '"', 'alt="' + esc(alt) + '"');
        if (mapped.w && mapped.h) out.push('width="' + mapped.w + '"', 'height="' + mapped.h + '"');
        out.push('loading="lazy"', 'decoding="async"');
        if (mapped.kind === 'generated') out.push('data-generated="' + esc(mapped.genId || '') + '"');
        if (mapped.cls) out.push('data-class="' + esc(mapped.cls) + '"');
        if (ctx.onImage) ctx.onImage(mapped, rawSrc, base);
      } else if (tag === 'iframe') {
        let src = decodeEntities(pick('src') || pick('data-src') || '');
        if (!src) return '';
        if (/^\/\//.test(src)) src = 'https:' + src;
        src = dekeyMapEmbed(src);
        const t = decodeEntities(pick('title') || '')
          || (/google\.com\/maps/.test(src) ? 'Google map'
            : /youtube(-nocookie)?\.com|youtu\.be/.test(src) ? 'YouTube video'
            : 'Embedded content');
        out.push('src="' + esc(src) + '"', 'loading="lazy"', 'title="' + esc(t) + '"');
        if (/youtube/.test(src)) out.push('allowfullscreen');
      } else if (tag === 'td' || tag === 'th') {
        for (const n of ['colspan', 'rowspan']) { const v = pick(n); if (v) out.push(n + '="' + esc(v) + '"'); }
      } else if (/^h[1-6]$/.test(tag)) {
        const id = pick('id');
        if (id && /^[A-Za-z][\w:.-]*$/.test(id)) out.push('data-src-id="' + esc(id) + '"');
      } else if (tag === 'ol') {
        const st = pick('start'); if (st && /^\d+$/.test(st)) out.push('start="' + st + '"');
      }
      return '<' + tag + (out.length ? ' ' + out.join(' ') : '') + '>';
    });

    s = fillIconLinks(s);
    s = stripVendorClauses(s);
    s = s.replace(/<(strong|em|b|i|u|small|sup|sub|a|span)\b[^>]*>(\s+)<\/\1>/gi, ' ');
    do { prev = s; s = s.replace(/<(p|li|h[1-6]|blockquote|figcaption|td|th|strong|em|a|b|i|u)(?:\s[^>]*)?>\s*<\/\1>/gi, ''); } while (s !== prev);
    s = s.replace(/(<br>\s*){3,}/gi, '<br><br>');
    s = wrapLooseText(s);
    s = s.split(PARA_BREAK).join(' ');
    const BLOCKS = 'p|ul|ol|h[1-6]|div|table|blockquote|figure|figcaption|hr|iframe|section|form';
    s = s.replace(new RegExp('(</(?:' + BLOCKS + ')>)\\s*(?:<br>\\s*)+', 'gi'), '$1');
    s = s.replace(new RegExp('(?:<br>\\s*)+(<(?:' + BLOCKS + ')\\b)', 'gi'), '$1');
    s = s.replace(/<p>(?:\s|&nbsp;| )*<\/p>/gi, '');
    s = s.replace(/<(h[1-6])(?:\s[^>]*)?>(?:\s|&nbsp;| )*<\/\1>/gi, () => { bump('emptyHeadingsDropped'); return ''; });
    s = s.replace(/(?:<hr>\s*){2,}/gi, '<hr>');
    /* every table scrolls inside itself rather than overflowing the page */
    s = s.replace(/<table>([\s\S]*?)<\/table>/gi, (full, inner) => {
      if (/<th[\s>]/i.test(inner)) return full;
      let promoted = false;
      const out = inner.replace(/<tr>([\s\S]*?)<\/tr>/i, (row, cells) => {
        if (promoted) return row;
        promoted = true;
        return '<tr>' + cells.replace(/<td(\s[^>]*)?>([\s\S]*?)<\/td>/gi, (c, attrs, body) => '<th scope="col"' + (attrs || '') + '>' + body + '</th>') + '</tr>';
      });
      return '<table>' + out + '</table>';
    });
    s = s.replace(/<table>[\s\S]*?<\/table>/gi, (t) => { bump('tablesWrapped'); return '<div class="table-scroll" tabindex="0" role="region" aria-label="Table">' + t + '</div>'; });
    s = s.replace(/[ \t]*[\r\n]+[ \t\r\n]*/g, ' ');   /* no <pre> in any source main (C35 0): newlines are layout whitespace */
    s = s.replace(/[ \t ]{2,}/g, ' ');
    /* block elements: trim; inline elements: move the edge space OUTSIDE (never glue two words) */
    s = s.replace(/<(h[1-6]|li|p|figcaption|td|th)((?:\s[^>]*)?)>\s+/gi, '<$1$2>').replace(/\s+<\/(h[1-6]|li|p|figcaption|td|th)>/gi, '</$1>');
    s = s.replace(/<(strong|b|em|i|a)((?:\s[^>]*)?)>\s+/gi, ' <$1$2>').replace(/\s+<\/(strong|b|em|i|a)>/gi, '</$1> ');
    s = s.replace(/ {2,}/g, ' ').replace(/(<(?:h[1-6]|li|p|figcaption|td|th)(?:\s[^>]*)?>) /gi, '$1').replace(/ (<\/(?:h[1-6]|li|p|figcaption|td|th)>)/gi, '$1');
    return s.trim();
  }

  /* Restore ONLY heading ids the cleaned page links to, onto the heading whose text matches the
     source element that held the id. */
  function restoreAnchorTargets(clean, raw) {
    const wanted = new Set();
    for (const m of clean.matchAll(/href="#([A-Za-z][\w:.-]*)"/g)) wanted.add(m[1]);
    clean = clean.replace(/ data-src-id="([^"]*)"/g, (full, id) => (wanted.has(id) ? ' id="' + id + '"' : ''));
    const norm = (t) => decodeEntities(String(t).replace(/<[^>]+>/g, ' ')).replace(/[\s:：]+/g, ' ').trim().toLowerCase();
    for (const id of wanted) {
      if (new RegExp('id="' + id + '"').test(clean)) continue;
      const src = new RegExp('<([a-z][a-z0-9]*)\\b[^>]*\\bid=["\']' + id + '["\'][^>]*>([\\s\\S]*?)<\\/\\1>', 'i').exec(raw);
      if (!src) continue;
      const label = norm(src[2]);
      if (!label) continue;
      let done = false;
      clean = clean.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/gi, (full, tag, inner) => {
        if (done || norm(inner) !== label) return full;
        done = true; bump('anchorsRestored');
        return '<' + tag + ' id="' + id + '">' + inner + '</' + tag + '>';
      });
    }
    return clean;
  }

  function balanceFragment(frag) {
    const stack = [];
    const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*?)?(\/?)>/g;
    let out = '', last = 0, m;
    while ((m = re.exec(frag))) {
      const tag = m[2].toLowerCase();
      if (VOID_TAGS.has(tag) || m[3] === '/') continue;
      if (m[1] !== '/') { stack.push(tag); continue; }
      const at = stack.lastIndexOf(tag);
      if (at === -1) { out += frag.slice(last, m.index); last = m.index + m[0].length; bump('balanceStray'); continue; }
      if (at < stack.length - 1) {
        out += frag.slice(last, m.index) + stack.slice(at + 1).reverse().map((t) => '</' + t + '>').join('');
        last = m.index;
        bump('balanceClosed', stack.length - 1 - at);
      }
      stack.length = at;
    }
    out += frag.slice(last);
    while (stack.length) { out += '</' + stack.pop() + '>'; bump('balanceClosed'); }
    return out;
  }

  function dropEmptyShells(frag) {
    let prev;
    do {
      prev = frag;
      frag = frag.replace(/<(li|ul|ol|p|strong|em|span)(?:\s[^>]*)?>(?:\s|&nbsp;)*<\/\1>/gi, () => { bump('emptyShellsDropped'); return ''; });
    } while (frag !== prev);
    return frag;
  }

  function stripBogusComments(frag) {
    const out = frag
      .replace(/&lt;!\s*(?:&#8211;|&#8212;|&ndash;|&mdash;|[–—])\s*/gi, '')
      .replace(/\s*(?:&#8211;|&#8212;|&ndash;|&mdash;|[–—])\s*&gt;/gi, '')
      .replace(/<!\s*[–—]\s*/g, '')
      .replace(/\s*[–—]\s*>/g, '');
    if (out !== frag) bump('bogusCommentsStripped');
    return out;
  }

  function blockKey(block) {
    return decodeEntities(String(block).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?)\]])/g, '$1').replace(/([(\[])\s+/g, '$1').trim().toLowerCase();
  }

  /* A block repeated inside ONE section (>= 80 characters) prints once. Every drop is recorded with its text
     so the occurrence check of tools/sentence-parity.mjs can tell a duplicate from a loss (CL-1: on the
     contact-lens pages the repeats were platform excerpts, now handled per product by the products lift). */
  function dedupeWithinCard(html) {
    const seen = new Set();
    return html.replace(/<(p|h[2-6]|ul|ol|blockquote)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi, (block) => {
      const key = blockKey(block);
      if (key.length < 80) return block;
      if (seen.has(key)) { bump('withinCardDupes'); (stats.withinCardDupeTexts = stats.withinCardDupeTexts || []).push(key.slice(0, 160)); return ''; }
      seen.add(key);
      return block;
    });
  }

  function dedupeAdjacentRuns(html) {
    const blocks = [...html.matchAll(/<(h[1-6]|p|ul|ol|figure|table|blockquote)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi)]
      .map((m) => ({ text: m[0], start: m.index, end: m.index + m[0].length }));
    if (blocks.length < 4) return html;
    const keys = blocks.map((b) => blockKey(b.text));
    for (let len = Math.floor(blocks.length / 2); len >= 2; len--) {
      for (let i = 0; i + 2 * len <= blocks.length; i++) {
        let same = true, runChars = 0;
        for (let k = 0; k < len && same; k++) { if (keys[i + k] !== keys[i + len + k]) same = false; runChars += keys[i + k].length; }
        if (!same || runChars < 60) continue;
        if (html.slice(blocks[i + len - 1].end, blocks[i + len].start).trim() !== '') continue;
        bump('adjacentRunsDropped'); bump('adjacentBlocksDropped', len);
        return dedupeAdjacentRuns(html.slice(0, blocks[i + len].start) + html.slice(blocks[i + 2 * len - 1].end));
      }
    }
    return html;
  }

  /* COMPONENTS D.3 role classes, decided in this order from audit/image-classification.json (class/subclass,
     carried as data-class) and the native size: diagram, brand, portrait, photo (>= 480px), plate. */
  function imgRole(tag) {
    const num = (n) => { const m = new RegExp(n + '="(\\d+)"').exec(tag); return m ? Number(m[1]) : 0; };
    const cls = (/data-class="([^"]*)"/.exec(tag) || [])[1] || '';
    const w = num('width'), h = num('height');
    if (/\/educational-diagram$/.test(cls)) return 'diagram';
    if (/\/(frame-brand-campaign|lens-brand-campaign|treatment-brand-ad|skincare-brand|contact-lens-brand-tile)$/.test(cls)) return 'brand';
    if (/\/(doctor-portrait|staff-portrait)$/.test(cls)) return 'portrait';
    if (/data-generated=/.test(tag)) return 'plate';
    if (/^functional\/|-logo$|\/platform-404-illustration$|\/contact-lens-product$|\/device-product$/.test(cls)) return 'plate';
    if (w && h && h > w && w >= 400) return 'portrait';
    if (w >= 480) return 'photo';
    return 'plate';
  }

  function bindFigureCaptions(html) {
    return html.replace(/(<figure class="fig fig--[a-z]+"><span class="fig__media"><img[^>]*><\/span><\/figure>)\s*<p>\s*([\s\S]{1,80}?)\s*<\/p>/gi, (full, fig, para) => {
      const alt = (/alt="([^"]*)"/.exec(fig) || [])[1] || '';
      const p = para.replace(/<[^>]+>/g, '').trim();
      const norm = (s) => decodeEntities(s).replace(/[×x]\s*\d+/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!p || !alt || norm(alt) !== norm(p)) return full;
      bump('captionsBound');
      return fig.replace(/<\/figure>$/, '<figcaption>' + para + '</figcaption></figure>');
    });
  }

  function groupFigureRuns(html) {
    return html.replace(/(?:<figure class="fig[^"]*">[\s\S]*?<\/figure>\s*){2,}/gi, (run) => {
      const n = (run.match(/<figure class="fig/gi) || []).length;
      if (n < 2) return run;
      bump('figureGrids'); bump('figureGridItems', n);
      return '<div class="fig-grid" data-count="' + n + '">' + run.trim() + '</div>';
    });
  }

  function wrapContentFigures(html) {
    html = html.replace(/<h[1-6]>\s*(<img[^>]*>)\s*<\/h[1-6]>/gi, (full, img) => { bump('headingImagesUnwrapped'); return img; });
    /* a list whose every item is a lone image (optionally linked) is a logo wall (COMPONENTS B.21) */
    html = html.replace(/<(ul|ol)>([\s\S]*?)<\/\1>/gi, (full, listTag, inner) => {
      const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((x) => x[1]);
      if (items.length < 1 || inner.replace(/<li>[\s\S]*?<\/li>/gi, '').trim()) return full;
      const allImg = items.every((it) => (it.match(/<img[^>]*>/gi) || []).length === 1 && it.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').trim() === '');
      if (!allImg) return full;
      bump('logoGrids'); bump('logoGridItems', items.length);
      return '<ul class="logo-grid" data-count="' + items.length + '">' + items.map((it) => {
        const img = (it.match(/<img[^>]*>/i) || [''])[0];
        const a = /<a\b([^>]*)>/i.exec(it);
        if (a) return '<li class="logo-chip logo-chip--link"><a class="logo-chip__link"' + a[1] + '>' + img + '</a></li>';
        return '<li class="logo-chip">' + img + '</li>';
      }).join('') + '</ul>';
    });
    let depth = 0, out = '', last = 0, m;
    const token = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*?)?(\/?)>/g;
    while ((m = token.exec(html))) {
      const tag = m[2].toLowerCase();
      /* a top-level link around one image becomes the figure, the link kept inside fig__media */
      if (tag === 'a' && depth === 0 && !m[1]) {
        const la = /^\s*(<img\b[^>]*>)\s*<\/a>/i.exec(html.slice(token.lastIndex));
        if (la) {
          const role = imgRole(la[1]);
          bump('figuresWrapped'); bump('linkedFigures');
          stats.figureRoles[role] = (stats.figureRoles[role] || 0) + 1;
          const inner = m[0] + la[1] + '</a>';
          out += html.slice(last, m.index) + '<figure class="fig fig--' + role + '"><span class="fig__media">' + inner + '</span></figure>';
          last = token.lastIndex = token.lastIndex + la[0].length;
          continue;
        }
      }
      if (tag === 'img') {
        if (depth === 0) {
          const role = imgRole(m[0]);
          bump('figuresWrapped');
          stats.figureRoles[role] = (stats.figureRoles[role] || 0) + 1;
          out += html.slice(last, m.index) + '<figure class="fig fig--' + role + '"><span class="fig__media">' + m[0] + '</span></figure>';
          last = m.index + m[0].length;
        }
        continue;
      }
      if (!/^(li|p|a|td|th|figure|table|blockquote|ul|ol|dl|dd)$/.test(tag)) continue;
      if (m[3] === '/') continue;
      depth += m[1] === '/' ? -1 : 1;
      if (depth < 0) depth = 0;
    }
    out += html.slice(last);
    return groupFigureRuns(bindFigureCaptions(out));
  }

  /* An <img> left inside a <p> (the source's right-floated post picture) is lifted out as a figure. */
  function liftParagraphImages(html) {
    return html.replace(/<p>((?:\s*<img\b[^>]*>\s*)+)<\/p>/gi, (full, imgs) => { bump('paraImagesLifted'); return imgs.trim(); });
  }

  function splitSections(html) {
    const parts = [];
    const re = /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/gi;
    let last = 0, m, pendingHeading = null, pendingAttrs = '';
    while ((m = re.exec(html))) {
      const body = html.slice(last, m.index).trim();
      if (body || pendingHeading) parts.push({ heading: pendingHeading, attrs: pendingAttrs, body });
      pendingHeading = m[1].trim();
      pendingAttrs = (/<h2(\s[^>]*)?>/i.exec(m[0]) || [])[1] || '';
      last = m.index + m[0].length;
    }
    const tail = html.slice(last).trim();
    if (tail || pendingHeading) parts.push({ heading: pendingHeading, attrs: pendingAttrs, body: tail });
    return parts.filter((p) => String(p.heading || '').replace(/<[^>]+>/g, '').trim() || String(p.body || '').replace(/<[^>]+>/g, '').trim() || /<(img|iframe)\b/i.test(p.body || '') || TOKEN_RE.test(p.body || ''));
  }

  function dedupeSections(parts) {
    const sigOf = (s) => decodeEntities(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().toLowerCase();
    const seen = new Set(), kept = [], out = [];
    for (const p of parts) {
      const body = p.body || '';
      const hasMedia = /<(img|iframe|table|ul|ol|form)\b/i.test(body) || TOKEN_RE.test(body);
      TOKEN_RE.lastIndex = 0;
      const headText = sigOf(p.heading), bodyText = sigOf(body);
      if (!bodyText && !hasMedia) { if (headText) { bump('headingOnlySections'); out.push({ heading: p.heading, attrs: p.attrs, body: '', headingOnly: true }); } continue; }
      const sig = headText + '|' + bodyText;
      if (seen.has(sig)) { bump('dupSectionsDropped'); (stats.dupSections = stats.dupSections || []).push(sig.slice(0, 120)); continue; }
      const words = bodyText.split(' ').filter(Boolean);
      if (words.length >= 25) {
        let dup = false;
        for (const prev of kept) {
          if (prev.words.length < words.length * 0.8) continue;
          const bag = new Map();
          for (const w of prev.words) bag.set(w, (bag.get(w) || 0) + 1);
          let hit = 0;
          for (const w of words) { const n = bag.get(w) || 0; if (n > 0) { bag.set(w, n - 1); hit++; } }
          if (hit / words.length >= 0.9) { dup = true; break; }
        }
        if (dup) { bump('dupSectionsDropped'); (stats.dupSections = stats.dupSections || []).push(sig.slice(0, 120)); continue; }
      }
      seen.add(sig);
      kept.push({ words });
      out.push({ heading: p.heading, attrs: p.attrs, body });
    }
    /* A run of heading-only sections is merged with the NEXT section that has a body, in source
       order: the first heading stays the section's h2, the later ones (including that section's own
       heading) open its body AT THEIR SOURCE LEVEL. splitSections cuts only at h2, so every heading of the
       run is an h2. Fix round 2 (R2-4): R wrote the later ones as h3, which changed a source heading's level
       ("The right fit" on /eyeglasses/kids-optical/); the merge now groups the headings and changes none. */
    const merged = [];
    let pending = [];
    for (const s of out) {
      if (s.headingOnly) { pending.push(s); continue; }
      if (pending.length) {
        const first = pending[0];
        const subs = pending.slice(1).map((x) => ({ heading: x.heading, attrs: x.attrs }));
        if (s.heading) subs.push({ heading: s.heading, attrs: s.attrs });
        merged.push({ heading: first.heading, attrs: first.attrs, body: subs.map((t) => '<h2' + (/\sid="/.test(t.attrs || '') ? ' ' + (/\sid="[^"]*"/.exec(t.attrs)[0]).trim() : '') + '>' + t.heading + '</h2>').join('') + s.body });
        bump('headingRunsMerged');
        pending = [];
        continue;
      }
      merged.push(s);
    }
    for (const s of pending) merged.push({ heading: s.heading, attrs: s.attrs, body: '' });
    return merged.filter((s) => s.heading || s.body);
  }

  function finishSection(body) {
    return wrapContentFigures(liftParagraphImages(dedupeWithinCard(dedupeAdjacentRuns(stripBogusComments(dropEmptyShells(balanceFragment(body)))))));
  }

  /* ----------------------------------------------------------------------------------------------
     RAW-LEVEL PREPARATION (before sanitising). Each extractor lifts a platform module out of the raw
     <main>, records its source strings as data (raw HTML fragments are sanitised later, by the page
     model, through sanitize() + finishSection()), and leaves a token (wrapped in a <div> so it becomes its
     own paragraph) that the page model turns into a typed block. */
  function prepare(mainHtml, opts = {}) {
    const comps = [];
    const notes = [];   /* per-page declarations the lifts make (dropped excerpts, unwrapped toggles, refused files) */
    const add = (kind, data) => { comps.push({ kind, data }); return '<div>' + tokenOf(comps.length - 1) + '</div>'; };
    let h = mainHtml.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, '');
    /* a lift is made only when the data it records carries every word of its module (else: generic prose).
       `parts` are raw fragments of the module; they are compared in the order they appear in it. */
    const accounted = (moduleHtml, ...parts) => {
      const at = (p) => { const i = moduleHtml.indexOf(p); return i < 0 ? Infinity : i; };
      const ordered = parts.filter((p) => p).sort((a, b) => at(a) - at(b));
      return squashText(moduleHtml) === ordered.map((p) => squashText(p)).join('');
    };
    /* the same check for a list of plain texts in module order */
    const textsAccounted = (moduleHtml, texts) => squashText(moduleHtml) === texts.map((t) => String(t || '').replace(/\s+/g, '')).join('');
    const liftFailed = (kind, why) => { bump('liftsSkipped'); (stats.liftsSkipped_ = stats.liftsSkipped_ || []).push(kind + ': ' + why); };

    /* SC-1: unrendered platform shortcodes, resolved to the account value they request (declared repair) */
    if (opts.shortcodes) {
      for (const sc of opts.shortcodes) {
        h = h.replace(sc.re, () => { bump('shortcodesResolved'); notes.push({ kind: 'shortcode', from: sc.from, to: sc.to }); return esc(sc.to); });
      }
    }

    /* R-2: the source trail, from the RAW markup (hrefs not yet relativised). An empty segment is dropped; when the
       LAST segment (the page's own, after the final separator) is the empty one - the 17 archives print
       "<a href="/">Home</a> » " and nothing after it - `trailOwnEmpty` says so, so the page model keeps Home linked
       and the page's own segment current (docs/BUILD-NOTES.md 5.1) */
    let trail = null;
    let trailOwnEmpty = false;
    h = h.replace(/<div class="ecp-breadcrumb\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i, (m, inner) => {
      const parts = inner.split(/<span[^>]*ecp-breadcrumb-separator[^>]*>[\s\S]*?<\/span>/i);
      const segs = [];
      parts.forEach((part, i) => {
        const a = /<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(part);
        const text = plain(part);
        if (!text) { bump('crumbSegmentsEmptyDropped'); if (i === parts.length - 1 && i > 0) trailOwnEmpty = true; return; }
        segs.push({ text, href: a ? decodeEntities(attrOf(a[1], 'href') || '') || null : null });
      });
      trail = segs;
      bump('sourceCrumbsTaken');
      return '';
    });

    /* X-1: the hidden schema.org rating value */
    h = h.replace(/<span\b[^>]*itemprop=["']reviewRating["'][^>]*>\s*<span\b[^>]*itemprop=["']ratingValue["'][^>]*>[^<]*<\/span>\s*<\/span>/gi, () => { bump('hiddenRatingValuesRemoved'); return ''; });

    /* the post date of a single post (ecp-view-complete): rendered in the title band (DT-1) */
    let postDate = null;
    if (/ecp-posts-wrapper-post\b[^"]*ecp-view-complete/.test(h)) {
      h = h.replace(/<div class="ecp-post-date\b[^"]*">\s*([^<]*?)\s*<\/div>/i, (m, d) => { postDate = plain(d); return ''; });
    }

    /* Gravity Forms: only a gform_wrapper INSIDE <main>; parsed from this script-stripped markup */
    if (opts.parseForm) {
      for (const el of findElements(h, /<(div)\b[^>]*class=['"][^'"]*\bgform_wrapper\b[^>]*>/i)) {
        const form = opts.parseForm(el.html);
        h = h.slice(0, el.start) + (form ? add('form', form) : '') + h.slice(el.end);
        bump('formsParsed');
        break;
      }
    }
    /* any other form in main (search modules, the voice search, the "Nothing Found" prompts): removed (declared) */
    h = h.replace(/<form\b[\s\S]*?<\/form>/gi, (m) => { if (/role=["']search|ecp-search|voice_search/i.test(m)) bump('searchFormsRemoved'); else bump('otherFormsRemoved'); return ''; });

    /* platform menus (div.ecp-menu-wrapper; only the six /template/* pages, whose region is <body>, hold any). A copy of
       a SITE menu - every item is a chrome.json menu label - is chrome: the sanitiser drops its <nav> and the copy is
       declared (audit/clone-removals.json). Any other menu is page content: /template/header-2/ carries a phone menu
       ("Call Fort Myers 239-500-2020" + two "Call" items whose href is an empty tel:) that the platform shows at every
       width as a hamburger labelled "Call Us" (ecp-menu-convert-at-desktop). Its label and its items print once, as a
       list; the platform's second (hamburger) copy of the same items and its focus-trap link go (declared). The lift is
       made only when the module holds nothing else: every copy lists the same items and no other text exists. */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-menu-wrapper\b[^"]*"[^>]*>/gi).reverse()) {
      const navs = findElements(el.html, /<(nav)\b[^>]*>/gi);
      const itemsOf = (navHtml) => [...navHtml.matchAll(/<li\b[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ attrs: m[1], html: m[2], label: plain(m[2]) }));
      const items = navs.length ? itemsOf(navs[0].html) : [];
      if (!items.length || items.every((it) => siteMenuLabels.has(it.label.toLowerCase()))) continue;
      const trigger = /<div class="ecp-menu-hamburger-trigger-label">([\s\S]*?)<\/div>/i.exec(el.html);
      const itemsText = items.map((it) => squashText(it.html)).join('');
      const copiesSame = navs.every((n) => squashText(n.html.replace(/<a\b[^>]*class="ecp-menu-mobile-focus-trap"[^>]*>[\s\S]*?<\/a>/i, ' ')) === itemsText);
      const outside = el.html.replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ').replace(/<div class="ecp-menu-hamburger-trigger-label">[\s\S]*?<\/div>/i, ' ');
      if (!copiesSame || squashText(outside)) { fail('build:component', opts.path || '', 'page menu not fully carried: ' + textIn(el.html).slice(0, 160)); continue; }
      h = h.slice(0, el.start) + (trigger && plain(trigger[1]) ? '<p>' + trigger[1].trim() + '</p>' : '') + '<ul>' + items.map((it) => '<li><a' + it.attrs + '>' + it.html + '</a></li>').join('') + '</ul>' + h.slice(el.end);
      bump('pageMenusKept'); bump('pageMenuItems', items.length);
    }

    /* VS-1: location modules (map, title, address, every contact type with its note, hours). Every location
       module of one Beaver Builder column group / callout is merged into ONE visit block at the first
       module's position (/hours-location/ prints the map and the details as two modules). */
    {
      const locs = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-location\b[^"]*"[^>]*>/gi);
      if (locs.length) {
        const subOf = (x) => { const m = /<div class="ecp-post-subheading">([\s\S]*?)<\/div>\s*(?=<|$)/i.exec(x); return m ? plain(m[1]) : ''; };
        const visits = [];
        for (const el of locs) {
          const x = el.html;
          const v = { mapSrc: null, title: null, subs: {}, address: [], contacts: [], hours: [], view: (/ecp-view-([a-z]+)/.exec(el.match[0]) || [])[1] || '' };
          const ifr = /<iframe\b[^>]*\ssrc=["']([^"']+)["']/i.exec(x);
          if (ifr) { let src = decodeEntities(ifr[1]); if (/^\/\//.test(src)) src = 'https:' + src; v.mapSrc = dekeyMapEmbed(src); }
          const tEl = firstEl(x, /<(div)\b[^>]*class="ecp-post-title\b[^"]*"[^>]*>/i);
          if (tEl) {
            const tIn = innerOf(tEl.html);
            const lvl = (/<(h[1-6])\b/i.exec(tIn) || [])[1] || null;
            const a = linkOf(tIn);
            v.title = { text: plain(tIn), href: a ? a.href : null, level: lvl ? lvl.toLowerCase() : null };
          }
          const cd = firstEl(x, /<(div)\b[^>]*class="ecp-post-contactdetails\b[^"]*"[^>]*>/i);
          if (cd) {
            if (subOf(cd.html)) v.subs.contact = subOf(cd.html);
            for (const li of findElements(cd.html, /<(li)\b[^>]*class="[^"]*ecp-post-contactdetails-contacttype-([A-Za-z]+)[^"]*"[^>]*>/gi)) {
              const type = /ecp-post-contactdetails-contacttype-([A-Za-z]+)/.exec(li.match[0])[1];
              const label = plain((/<strong class="ecp-post-label">([\s\S]*?)<\/strong>/i.exec(li.html) || [])[1] || '');
              const dataHtml = (/<span class="ecp-post-data"[^>]*>([\s\S]*?)<\/span>\s*(?:<span class="ecp-post-contactdetails|<\/li>|$)/i.exec(li.html) || [])[1] || '';
              const warn = plain((/<span class="ecp-post-contactdetails-email-warningmessage">([\s\S]*?)<\/span>/i.exec(li.html) || [])[1] || '');
              const a = linkOf(dataHtml);
              const value = plain(dataHtml.replace(/<span class="ecp-post-contactdetails-email-warningmessage">[\s\S]*?<\/span>/i, ''));
              v.contacts.push({ type, label, value, href: a && a.href ? (/^tel:/i.test(a.href) ? 'tel:' + a.href.slice(4).replace(/\s+/g, '') : a.href) : null, note: warn || null });
            }
          }
          const ad = firstEl(x, /<(div)\b[^>]*class="ecp-post-address\b[^"]*"[^>]*>/i);
          if (ad) {
            if (subOf(ad.html)) v.subs.address = subOf(ad.html);
            const body = innerOf(ad.html).replace(/<div class="ecp-post-subheading">[\s\S]*?<\/div>/i, '');
            v.address = body.split(/<br\s*\/?>/i).map((l) => plain(l)).filter(Boolean);
          }
          const hr = firstEl(x, /<(div)\b[^>]*class="ecp-post-hours\b[^"]*"[^>]*>/i);
          if (hr) {
            if (subOf(hr.html)) v.subs.hours = subOf(hr.html);
            /* one entry per interval: Friday prints two, split by <br> (VS-1, LD-1) */
            v.hours = [...hr.html.matchAll(/<li\b[^>]*ecp-post-hours-item[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)]
              .map((m) => [plain(m[1]).replace(/:$/, ''), m[2].split(/<br\s*\/?>/i).map(plain).filter(Boolean)]);
          }
          if (firstEl(x, /<(div)\b[^>]*class="ecp-post-paymentinfo\b[^"]*"[^>]*>/i)) fail('build:component', opts.path || '', 'payment-info module in a location post: not carried by this pipeline (0 on the Riverside crawl)');
          /* self-check: every word of the module is in the data */
          const pieces = [
            { name: 'title', at: tEl ? x.indexOf(tEl.html) : -1, words: [v.title ? v.title.text : ''] },
            { name: 'contacts', at: cd ? x.indexOf(cd.html) : -1, words: [v.subs.contact || '', ...v.contacts.flatMap((c) => [c.label, c.value, c.note || ''])] },
            { name: 'address', at: ad ? x.indexOf(ad.html) : -1, words: [v.subs.address || '', ...v.address] },
            { name: 'map', at: ifr ? ifr.index : -1, words: [] },
            { name: 'hours', at: hr ? x.indexOf(hr.html) : -1, words: [v.subs.hours || '', ...v.hours.flatMap(([d, iv]) => [d + ':', ...iv])] },
          ].filter((pc) => pc.at >= 0).sort((a, b) => a.at - b.at);
          v.order = pieces.map((pc) => pc.name);
          const words = pieces.flatMap((pc) => pc.words).join('');
          if (squashText(x) !== words.replace(/\s+/g, '')) fail('build:component', opts.path || '', 'location module text not fully carried: ' + textIn(x).slice(0, 200));
          visits.push({ el, v });
        }
        /* merge modules that sit in the same column group (the map module + the details module) */
        const merged = [];
        for (const { el, v } of visits) {
          const prevM = merged[merged.length - 1];
          const between = prevM ? h.slice(prevM.end, el.start) : '';
          if (prevM && !squashText(between) && !/<img\b|<iframe\b/i.test(between) && (!prevM.v.title || !v.title) && (!prevM.v.mapSrc || !v.mapSrc)) {
            const a = prevM.v;
            prevM.v = { mapSrc: a.mapSrc || v.mapSrc, title: a.title || v.title, subs: Object.assign({}, a.subs, v.subs), address: a.address.length ? a.address : v.address, contacts: a.contacts.concat(v.contacts), hours: a.hours.length ? a.hours : v.hours, view: a.view || v.view, order: [...new Set(a.order.concat(v.order))] };
            prevM.parts.push({ start: el.start, end: el.end });
            prevM.end = el.end;
            continue;
          }
          merged.push({ v, parts: [{ start: el.start, end: el.end }], start: el.start, end: el.end });
        }
        const cuts = [];
        for (const mg of merged) mg.parts.forEach((pt, i) => cuts.push({ start: pt.start, end: pt.end, token: i === 0 ? mg.v : null }));
        cuts.sort((a, b) => b.start - a.start);
        for (const c of cuts) h = h.slice(0, c.start) + (c.token ? add('visit', c.token) : '') + h.slice(c.end);
        bump('visitBlocks', merged.length);
      }
    }

    /* the review widget (fl-module-ReviewsModule: home carousel, designer frames): comment, stars, the platform's
       relative time + its data-reviewed-at timestamp, name (the "- " prefix is the source's) */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-reviews-wrapper\b[^"]*"[^>]*>/i);
      if (!el) break;
      const items = [];
      for (const r of findElements(el.html, /<(div)\b[^>]*class="ecp-review\b[^"]*"[^>]*>/gi)) {
        const comment = firstEl(r.html, /<(div)\b[^>]*class="ecp-review-comment\b[^"]*"[^>]*>/i);
        const time = /<div class="ecp-rating-time"([^>]*)>([\s\S]*?)<\/div>/i.exec(r.html);
        const name = firstEl(r.html, /<(div)\b[^>]*class="ecp-review-name\b[^"]*"[^>]*>/i);
        items.push({
          html: comment ? innerOf(comment.html) : '', name: name ? plain(innerOf(name.html)) : '',
          stars: (r.html.match(/ecp-rating-star-full/g) || []).length,
          shownAs: time ? plain(time[2]) : null, reviewedAt: time ? decodeEntities(attrOf(time[1], 'data-reviewed-at') || '') || null : null,
        });
        if (!accounted(r.html, time ? time[2] : '', comment ? comment.html : '', name ? name.html : '')) fail('build:component', opts.path || '', 'review card text not fully carried');
      }
      h = h.slice(0, el.start) + add('reviews', { items }) + h.slice(el.end);
      bump('reviewCards', items.length);
    }

    /* TS-1: testimonial cards (the posts wrapper with ecp-posttype-testimonial cards); the card title (h2 + link
       to the single) is kept */
    for (;;) {
      const el = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*"[^>]*>/i).find((e) => /ecp-posttype-testimonial/.test(e.html));
      if (!el) break;
      const cards = [];
      for (const post of findElements(el.html, /<(div)\b[^>]*class="ecp-post ecp-post-\d+ ecp-posttype-testimonial\b[^"]*"[^>]*>/i)) {
        const content = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-content\b[^"]*"[^>]*>/i);
        const attr = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-attribute"[^>]*>/i);
        const titleEl = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-title\b[^"]*"[^>]*>/i);
        const title = titleEl ? [titleEl.html, innerOf(titleEl.html)] : null;
        const tl = title ? linkOf(title[1]) : null;
        cards.push({
          html: content ? innerOf(content.html) : '', name: attr ? textIn(attr.html).replace(/^-\s*/, '') : '', nameRaw: attr ? textIn(attr.html) : '',
          stars: (post.html.match(/ecp-rating-star-full/g) || []).length,
          title: title ? { text: plain(title[1]), href: tl ? tl.href : null, level: ((/<(h[1-6])\b/i.exec(title[1]) || [])[1] || 'h2').toLowerCase() } : null,
        });
      }
      h = h.slice(0, el.start) + add('testimonials', { items: cards }) + h.slice(el.end);
      bump('testimonialCards', cards.length);
    }

    /* TM-1: EVERY card of EVERY team module (keyed on the module, not the path): photo, name + link, position,
       bio or excerpt, Read More. Single /team/* pages carry one card whose bio is the page body. */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-team\b[^"]*"[^>]*>/i);
      if (!el) break;
      const view = (/ecp-view-([a-z]+)/.exec(el.match[0]) || [])[1] || '';
      const members = [];
      for (const post of findElements(el.html, /<(div)\b[^>]*class="ecp-post ecp-post-\d+ ecp-posttype-team\b[^"]*"[^>]*>/gi)) {
        const img = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-image\b[^"]*"[^>]*>/i);
        const titleEl = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-title\b[^"]*"[^>]*>/i);
        const titleHtml = titleEl ? innerOf(titleEl.html) : '';
        const tl = titleHtml ? linkOf(titleHtml) : null;
        const pos = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-position\b[^"]*"[^>]*>/i);
        const content = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-content\b[^"]*"[^>]*>/i);
        const more = /<span class="ecp-post-meta-readmore">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(post.html);
        const m = {
          name: plain(titleHtml), href: tl ? tl.href : null, level: titleHtml ? ((/<(h[1-6])\b/i.exec(titleHtml) || [])[1] || null) : null,
          img: img ? imgOf(img.html) : null, position: pos ? plain(innerOf(pos.html)) : '',
          html: content ? innerOf(content.html) : '', categories: decodeEntities(attrOf(post.match[0], 'data-categories') || ''),
          more: more ? { label: plain(more[2]), href: decodeEntities(attrOf(more[1], 'href') || ''), ariaLabel: decodeEntities(attrOf(more[1], 'aria-label') || '') } : null,
        };
        if (!accounted(post.html, titleHtml, pos ? pos.html : '', content ? content.html : '', more ? more[2] : '')) fail('build:component', opts.path || '', 'team card text not fully carried: ' + m.name);
        members.push(m);
      }
      h = h.slice(0, el.start) + (members.length ? add('team', { view, members }) : '') + h.slice(el.end);
      if (!members.length) bump('emptyTeamModules');
      bump('teamCards', members.length);
    }

    /* F.4 doc cards: a paragraph whose only link is a PDF (patient forms) */
    h = h.replace(/(?:<p>\s*(?:<strong>)?\s*<a\b[^>]*href="[^"]*\.pdf"[^>]*>[\s\S]*?<\/a>[^<]*(?:<\/strong>)?\s*<\/p>\s*)+/gi, (run) => {
      const items = [...run.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>([^<]*)/gi)].map((m) => ({ rawHref: decodeEntities(attrOf(m[1], 'href') || ''), label: plain(m[2]), after: decodeEntities(m[3]).replace(/\s+/g, ' ').replace(/\s+$/, '') }));
      bump('docCards', items.length);
      return add('docs', { items });
    });

    /* post lists in summary (/whats-new/), grid (home) and list (/sitemap/) view; a single post's own complete
       view is the article itself and is NOT lifted */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-post\b[^"]*ecp-view-(?:summary|grid|list)\b[^"]*"[^>]*>/i);
      if (!el) break;
      const view = (/ecp-view-(summary|grid|list)/.exec(el.match[0]) || [])[1];
      const items = [];
      for (const post of findElements(el.html, /<(div)\b[^>]*class="ecp-post ecp-post-\d+ ecp-posttype-post\b[^"]*"[^>]*>/gi)) {
        const tEl = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-title\b[^"]*"[^>]*>/i);
        const t = tEl ? [tEl.html, innerOf(tEl.html)] : null;
        const tl = t ? linkOf(t[1]) : null;
        const d = /<div class="ecp-post-date[^"]*">\s*([\s\S]*?)\s*<\/div>/i.exec(post.html);
        const c = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-content\b[^"]*"[^>]*>/i);
        const more = /<span class="ecp-post-meta-readmore">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(post.html);
        const im = firstEl(post.html, /<(div)\b[^>]*class="ecp-post-image\b[^"]*"[^>]*>/i);
        items.push({
          title: t ? plain(t[1]) : '', href: tl ? tl.href : '', level: t ? ((/<(h[1-6])\b/i.exec(t[1]) || [])[1] || 'h2').toLowerCase() : 'h2',
          date: d ? plain(d[1]) : '', html: c ? innerOf(c.html) : '', img: im ? imgOf(im.html) : null,
          more: more ? { label: plain(more[2]), href: decodeEntities(attrOf(more[1], 'href') || ''), ariaLabel: decodeEntities(attrOf(more[1], 'aria-label') || '') } : null,
        });
        if (!accounted(post.html, t ? t[1] : '', d ? d[1] : '', c ? c.html : '', more ? more[2] : '')) fail('build:component', opts.path || '', 'post card text not fully carried');
      }
      h = h.slice(0, el.start) + add('posts', { view, items }) + h.slice(el.end);
      bump('postSummaries', items.length);
    }

    /* child-page listings (17 lists, 74 items; 26 thumbnails) */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-childpages\b[^"]*"[^>]*>/gi).reverse()) {
      const items = [];
      for (const li of findElements(el.html, /<(li)\b[^>]*class="ecp-childpages-link\b[^"]*"[^>]*>/gi)) {
        const link = /<div class="ecp-childpages-link">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(li.html);
        const sum = /<div class="ecp-childpages-summary">([\s\S]*?)<\/div>/i.exec(li.html);
        const img = /<div class="ecp-childpages-image">[\s\S]*?<img\b([^>]*)>/i.exec(li.html);
        items.push({
          title: link ? plain(link[2]) : '', href: link ? decodeEntities(attrOf(link[1], 'href') || '') : '',
          summary: sum ? plain(sum[1]) : '',
          thumb: img ? { src: decodeEntities(attrOf(img[1], 'src') || ''), alt: decodeEntities(attrOf(img[1], 'alt') || '') } : null,
        });
      }
      h = h.slice(0, el.start) + add('childpages', { items, variant: items.some((i) => i.thumb) ? 'thumbs' : 'plain' }) + h.slice(el.end);
      bump('childpageLists'); bump('childpageItems', items.length);
    }

    /* archive title lists (/category/*, /tag/*, /author/*): runs of div.ecp-entry-title > a */
    h = h.replace(/(?:<div class="ecp-entry-title">\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/div>\s*)+/gi, (run) => {
      const items = [...run.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ title: plain(m[2]), href: decodeEntities(attrOf(m[1], 'href') || ''), summary: '', thumb: null }));
      bump('archiveLists'); bump('archiveItems', items.length);
      return add('childpages', { items, variant: 'archive' });
    });

    /* CL-1: contact-lens brand modules. One product per row: image, title, the FULL text from
       #ecp-contactlens-full-N printed once; the platform's truncated excerpt (#ecp-contactlens-summary-N, one of
       them cut inside an entity) is dropped and declared; the javascript "Read More+" toggle is unwrapped to its
       words. The module heading stays in the prose, before the product list. */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-contactlens-wrap\b[^"]*"[^>]*>/i);
      if (!el) break;
      const head = /<(h[1-6])\b[^>]*class="ecp-contactlens-heading"[^>]*>([\s\S]*?)<\/\1>/i.exec(el.html);
      const items = [];
      for (const row of findElements(el.html, /<(div)\b[^>]*class="ecp-contactlens-row\b[^"]*"[^>]*>/gi)) {
        const title = /<(h[1-6])\b[^>]*class="ecp-contactlens-title"[^>]*>([\s\S]*?)<\/\1>/i.exec(row.html);
        const desc = firstEl(row.html, /<(div)\b[^>]*class="ecp-contactlens-desc\b[^"]*"[^>]*>/i);
        const full = desc ? firstEl(desc.html, /<(div)\b[^>]*id="ecp-contactlens-full-\d+"[^>]*>/i) : null;
        const summary = desc ? firstEl(desc.html, /<(div)\b[^>]*id="ecp-contactlens-summary-\d+"[^>]*>/i) : null;
        const more = /<div class="ecp-contactlens-readmore">\s*<a\b[^>]*>([\s\S]*?)<\/a>/i.exec(row.html);
        const img = firstEl(row.html, /<(div)\b[^>]*class="ecp-contactlens-img\b[^"]*"[^>]*>/i);
        const textHtml = full ? innerOf(full.html) : summary ? innerOf(summary.html) : desc ? innerOf(desc.html) : '';
        if (full && summary) notes.push({ kind: 'excerpt', text: plain(innerOf(summary.html)), product: plain(title ? title[2] : '') });
        if (more) notes.push({ kind: 'toggle', text: plain(more[1]) });
        items.push({ title: title ? plain(title[2]) : '', level: title ? title[1].toLowerCase() : 'h3', img: img ? imgOf(img.html) : null, html: textHtml, more: more ? plain(more[1]) : null, excerptDropped: !!(full && summary) });
      }
      h = h.slice(0, el.start) + (head ? '<' + head[1] + '>' + head[2] + '</' + head[1] + '>' : '') + add('products', { items }) + h.slice(el.end);
      bump('contactLensProducts', items.length);
    }

    /* ecp-equipment (advanced technology): one item per device: image, title, description */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-equipment\b[^"]*"[^>]*>/i);
      if (!el) break;
      const items = [];
      for (const it of findElements(el.html, /<(div)\b[^>]*class="ecp-equipment-item\b[^"]*"[^>]*>/gi)) {
        const title = /<(h[1-6])\b[^>]*class="ecp-equipment-title"[^>]*>([\s\S]*?)<\/\1>/i.exec(it.html);
        const desc = firstEl(it.html, /<(div)\b[^>]*class="ecp-equipment-description\b[^"]*"[^>]*>/i);
        const img = firstEl(it.html, /<(div)\b[^>]*class="ecp-equipment-image\b[^"]*"[^>]*>/i);
        items.push({ title: title ? plain(title[2]) : '', level: title ? title[1].toLowerCase() : 'h3', img: img ? imgOf(img.html) : null, html: desc ? innerOf(desc.html) : '' });
        if (!accounted(it.html, title ? title[2] : '', desc ? desc.html : '')) fail('build:component', opts.path || '', 'equipment item text not fully carried');
      }
      h = h.slice(0, el.start) + add('equipment', { items }) + h.slice(el.end);
      bump('equipmentItems', items.length);
    }

    /* ecp-gallery (home "Our Designer Frames"): photo + caption per tile */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-gallery\b[^"]*"[^>]*>/i);
      if (!el) break;
      const items = [];
      for (const it of findElements(el.html, /<(div)\b[^>]*class="ecp-gallery-item\b[^"]*"[^>]*>/gi)) {
        const cap = firstEl(it.html, /<(div)\b[^>]*class="ecp-gallery-item-caption\b[^"]*"[^>]*>/i);
        const ph = firstEl(it.html, /<(div)\b[^>]*class="ecp-gallery-item-photo\b[^"]*"[^>]*>/i);
        const a = ph ? linkOf(ph.html) : null;
        items.push({ img: ph ? imgOf(ph.html) : null, caption: cap ? plain(innerOf(cap.html)) : '', href: a ? a.href : null });
      }
      if (!textsAccounted(el.html, items.map((i) => i.caption))) fail('build:component', opts.path || '', 'gallery text not fully carried');
      h = h.slice(0, el.start) + add('gallery', { items }) + h.slice(el.end);
      bump('galleryItems', items.length);
    }

    /* logo walls: DesignerFramesModule (27 frame brands) and InsurancesModule (carriers); the alt is the name */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="[^"]*\b(?:frame_logo_items|insurance_logo_items)\b[^"]*"[^>]*>/i);
      if (!el) break;
      const kind = /insurance_logo_items/.test(el.match[0]) ? 'carriers' : 'frame-brands';
      const items = [...el.html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => { const im = imgOf(li[1]); const a = linkOf(li[1]); return { name: im ? im.alt : plain(li[1]), img: im, href: a ? a.href : null }; });
      if (squashText(el.html)) fail('build:component', opts.path || '', 'logo wall carries visible text');
      h = h.slice(0, el.start) + add('logos', { kind, items }) + h.slice(el.end);
      bump('logoWallItems', items.length);
    }

    /* the HTML sitemap (/sitemap/): one link per page with its depth (li.ecp-sitemap-link-depth-N) */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-sitemap\b[^"]*"[^>]*>/i);
      if (!el) break;
      const items = [...el.html.matchAll(/<li\b[^>]*class="ecp-sitemap-link-depth-(\d+)"[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => { const a = linkOf(m[2]); return { title: plain(m[2]), href: a ? a.href : null, depth: Number(m[1]) }; });
      if (!textsAccounted(el.html, items.map((i) => i.title))) fail('build:component', opts.path || '', 'sitemap text not fully carried');
      h = h.slice(0, el.start) + add('sitemap', { items }) + h.slice(el.end);
      bump('sitemapLinks', items.length);
    }

    /* Q&A accordions (FAQ, cataract co-management, dry eye): question = span.ecp-accordion-trigger-label,
       answer = div.ecp-accordion-content (the [hidden] panel); the href="#" toggle goes */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-accordion\b[^"]*"[^>]*>/i);
      if (!el) break;
      const items = [];
      for (const it of findElements(el.html, /<(div)\b[^>]*class="ecp-accordion-item\b[^"]*"[^>]*>/gi)) {
        const q = /<span class="ecp-accordion-trigger-label">([\s\S]*?)<\/span>/i.exec(it.html);
        const a = firstEl(it.html, /<(div)\b[^>]*class="ecp-accordion-content\b[^"]*"[^>]*>/i);
        items.push({ q: q ? plain(q[1]) : '', html: a ? innerOf(a.html) : '' });
        if (!accounted(it.html, q ? q[1] : '', a ? a.html : '')) fail('build:component', opts.path || '', 'accordion item text not fully carried');
      }
      h = h.slice(0, el.start) + add('accordion', { items }) + h.slice(el.end);
      bump('accordionItems', items.length);
    }

    /* VD-1: self-hosted videos (ecp-video-type-media_manager): <video controls> with the harvested mp4 */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-video\b[^"]*"[^>]*>/i);
      if (!el) break;
      const v = /<video\b([^>]*)>([\s\S]*?)<\/video>/i.exec(el.html);
      const yt = /<iframe\b[^>]*\ssrc=["']([^"']+)["']/i.exec(el.html);
      const data = v ? {
        kind: 'file', poster: decodeEntities(attrOf(v[1], 'poster') || '') || null,
        sources: [...v[2].matchAll(/<source\b([^>]*)>/gi)].map((s) => ({ src: decodeEntities(attrOf(s[1], 'src') || ''), type: decodeEntities(attrOf(s[1], 'type') || '') })),
        controls: /\scontrols\b/i.test(v[1]),
      } : yt ? { kind: 'iframe', src: decodeEntities(yt[1]) } : null;
      if (!data) fail('build:component', opts.path || '', 'ecp-video module without a <video> or iframe');
      h = h.slice(0, el.start) + (data ? add('video', data) : '') + h.slice(el.end);
      bump('videos');
    }

    /* CY-1: the Cherry patient-financing widget (fl-module-ecp-html on /cherry-payment-plan/), kept as data:
       the exact embed snippet the source loads (fonts link + loader + init + mount points) */
    for (;;) {
      const el = firstEl(h, /<(div)\b[^>]*class="ecp-html\b[^"]*"[^>]*>/i);
      if (!el) break;
      const rawEl = opts.rawMain ? findElements(opts.rawMain, /<(div)\b[^>]*class="ecp-html\b[^"]*"[^>]*>/i)[0] : null;
      const snippet = rawEl ? innerOf(rawEl.html).trim() : '';
      if (/withcherry\.com/.test(snippet)) {
        const slug = (/slug:\s*'([^']+)'/.exec(snippet) || [])[1] || null;
        const sections = ((/\},\s*\[([^\]]*)\]\s*\)\s*;/.exec(snippet) || [])[1] || '').split(',').map((x) => x.replace(/['"\s]/g, '')).filter(Boolean);
        h = h.slice(0, el.start) + add('cherry', { slug, sections, snippet, scriptSrc: (/"(https:\/\/files\.withcherry\.com\/[^"]+)"/.exec(snippet) || [])[1] || null, fontsHref: decodeEntities((/<link href="([^"]+)"/.exec(snippet) || [])[1] || '') || null }) + h.slice(el.end);
        bump('cherryWidgets');
      } else {
        if (squashText(el.html)) { liftFailed('html', 'ecp-html module with text: left as prose'); break; }
        h = h.slice(0, el.start) + h.slice(el.end);
      }
    }

    /* callouts: title (+ level + link), image (before or after the text), content, buttons. Lifted only when
       the module holds no other component token and every word is in the data (else generic prose). */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-callout\b[^"]*"[^>]*>/gi).reverse()) {
      const x = el.html;
      if (new RegExp(TOKEN).test(x)) { liftFailed('callout', 'holds a component'); continue; }
      const titleWrap = firstEl(x, /<(div)\b[^>]*class="ecp-callout-title(?=[\s"])[^"]*"[^>]*>/i);
      const titleHtml = titleWrap ? innerOf(titleWrap.html).replace(/<div class="ecp-callout-title-divider"[^>]*>\s*<\/div>/i, '') : '';
      const lvl = titleHtml ? ((/<(h[1-6])\b/i.exec(titleHtml) || [])[1] || null) : null;
      const tl = titleHtml ? linkOf(titleHtml) : null;
      const content = firstEl(x, /<(div)\b[^>]*class="ecp-callout-content\b[^"]*"[^>]*>/i);
      const imgBox = firstEl(x, /<(div)\b[^>]*class="ecp-callout-image\b[^"]*"[^>]*>/i);
      const buttons = [...x.matchAll(/<a\b([^>]*class="ecp-button\b[^"]*"[^>]*)>\s*(?:<span\b[^>]*>[\s\S]*?<\/span>\s*)*?<span class="ecp-button-label">([\s\S]*?)<\/span>[\s\S]*?<\/a>/gi)]
        .map((m) => ({ label: plain(m[2]), raw: m[2], href: decodeEntities(attrOf(m[1], 'href') || '').trim(), newTab: /target=["']_blank/i.test(m[1]), rel: decodeEntities(attrOf(m[1], 'rel') || '') }));
      const plainButtons = [...x.matchAll(/<div class="ecp-callout-button-wrapper[^"]*">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter((m) => !/ecp-button/.test(m[1]));
      for (const m of plainButtons) buttons.push({ label: plain(m[2]), raw: m[2], href: decodeEntities(attrOf(m[1], 'href') || '').trim(), newTab: /target=["']_blank/i.test(m[1]), rel: decodeEntities(attrOf(m[1], 'rel') || '') });
      if (!accounted(x, titleHtml, content ? content.html : '', ...buttons.map((b) => b.raw))) { liftFailed('callout', 'text not fully carried: ' + textIn(x).slice(0, 80)); continue; }
      const imgAt = imgBox ? x.indexOf(imgBox.html) : -1, textAt = titleWrap ? x.indexOf(titleWrap.html) : content ? x.indexOf(content.html) : -1;
      const data = {
        title: titleHtml && plain(titleHtml) ? { text: plain(titleHtml), html: esc(plain(titleHtml)), level: lvl ? lvl.toLowerCase() : null, href: tl ? tl.href : null } : null,
        img: imgBox ? imgOf(imgBox.html) : null, imageFirst: imgBox ? (textAt < 0 || imgAt < textAt) : false,
        html: content ? innerOf(content.html) : '', buttons,
      };
      h = h.slice(0, el.start) + add('callout', data) + h.slice(el.end);
      bump('callouts');
    }

    /* quick-action badges inside main (7 builder pages): the dock row */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-badges\b[^"]*"[^>]*>/gi).reverse()) {
      const items = [...el.html.matchAll(/<a\b([^>]*class="ecp-badge\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
        label: plain((/<div class="ecp-badge-title">([\s\S]*?)<\/div>/i.exec(m[2]) || [])[1] || attrOf(m[1], 'aria-label') || ''),
        href: decodeEntities(attrOf(m[1], 'href') || ''), newTab: /target=["']_blank/i.test(m[1]), rel: decodeEntities(attrOf(m[1], 'rel') || ''),
      }));
      h = h.slice(0, el.start) + add('badges', { items }) + h.slice(el.end);
      bump('badgeRowsInMain');
    }

    /* hours lists outside a location module (none on this crawl; kept for safety): one entry per interval */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-post-hours clear"[^>]*>/gi).reverse()) {
      const rows = [...el.html.matchAll(/<li\b[^>]*ecp-post-hours-item[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)].map((m) => [plain(m[1]).replace(/:$/, ''), m[2].split(/<br\s*\/?>/i).map(plain).filter(Boolean)]);
      h = h.slice(0, el.start) + add('hours', { rows }) + h.slice(el.end);
      bump('hoursListsInMain');
    }

    /* ecp-button CTAs (any button left after the lifts above): label, href, new-tab, rel */
    /* the wrapper div and its close tag are consumed together, or not at all: the reference regex took an optional
       trailing </div> after a BARE button too, which removed the close tag of the module around it */
    const buttonOf = (m, attrs, inner) => {
      const label = /<span class="ecp-button-label">([\s\S]*?)<\/span>/i.exec(inner);
      if (!label) return m;
      bump('ctaButtons');
      return add('button', { label: plain(label[1]), href: decodeEntities(attrOf(attrs, 'href') || '').trim(), newTab: /target=["']_blank/i.test(attrs), rel: decodeEntities(attrOf(attrs, 'rel') || '') });
    };
    h = h.replace(/<div class="ecp-button-wrapper[^"]*">\s*<a\b([^>]*class="ecp-button\b[^"]*"[^>]*)>([\s\S]*?)<\/a>\s*<\/div>/gi, buttonOf);
    h = h.replace(/<a\b([^>]*class="ecp-button\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi, buttonOf);
    /* a button rendered as a <span> with no href (template pages): its label stays as text */
    h = h.replace(/<span class="ecp-button\b[^"]*"[^>]*>([\s\S]*?)<\/span>\s*(?=<\/div>)/gi, (m, inner) => { bump('deadButtonsAsText'); return '<p>' + plain(inner) + '</p>'; });

    /* heading accordions: the heading keeps its level; the collapsible wrapper goes */
    h = h.replace(/<(h[1-6]|div)\b([^>]*class="[^"]*\becp-heading-accordion\b[^"]*"[^>]*)>([\s\S]*?<span class="ecp-heading-text">([\s\S]*?)<\/span>[\s\S]*?)<\/\1>/gi, (m, tag, attrs, inner, text) => {
      bump('headingAccordions');
      const lvl = /^h[1-6]$/i.test(tag) ? tag.toLowerCase() : 'h2';
      return '<' + lvl + '>' + text.trim() + '</' + lvl + '>';
    });
    /* div.ecp-heading visual headings -> h2 */
    h = h.replace(/<div\b([^>]*class="ecp-heading\b[^"]*\becp-heading-tag\b[^"]*"[^>]*)>\s*<span class="ecp-heading-text">([\s\S]*?)<\/span>\s*<\/div>/gi, (m, attrs, text) => {
      bump('divHeadingsPromoted');
      return '<h2>' + text.trim() + '</h2>';
    });

    return { html: h, trail, trailOwnEmpty, comps, postDate, notes };
  }

  return { baseKey, localHref, ownPathOf, mainRegion, sanitize, restoreAnchorTargets, splitSections, dedupeSections, finishSection, balanceFragment, blockKey, prepare, mapImage, dekeyMapEmbed, imgRole, textIn };
}
