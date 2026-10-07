/* page-model.mjs - the PAGE MODEL: for each source page, one plain JSON object the templates render.

   This is the contract between the content pipeline and any theme (the SCAFFOLD theme in templates.mjs /
   home.mjs today; the design templates later). It is documented field by field in docs/BUILD-NOTES.md,
   "Page model contract" (schema rfec/page-model@1). A theme reads ONLY the model: every string in it is the
   source's own (or chrome.json's, itself verified against audit/raw), every URL is already page-relative for
   the page's depth, every image is a shipped file with its native size, and every block type is from a
   closed set. `node src/build.mjs --dump-models` writes each model to tmp/page-models/<slug>.json.

   The model is built from the R content pipeline, unchanged in its rules: mainRegion -> prepare (component
   lifts) -> sanitize -> headings -> sections -> finishSection (figures, dedupe) -> blocks.

   wf5b (DESIGN-SPEC 4.3, COMPONENTS 0.12 and section I), additive within rfec/page-model@1:
   - P1: every image object carries `srcset` [{ url, w }] (ascending, capped at the intrinsic width); the home hero's
     base layer carries `crop` { url, w, h, srcset } (the 4:3 crop, COMPONENTS B.4, gap I.3).
   - P2: `head.scripts` (the fingerprinted site.js, or [] on the scaffold; gap I.12) beside `head.stylesheets`.
   - I.6: a background layer the design supersedes (the home hero's phone file, DESIGN-SPEC Q-6) stays in
     `background[]` with `superseded` (the reason) and is declared `background-dropped`, so audit/clone-removals.json
     lists it and keep-image-parity accepts its absence.
   - P4: `art` { title, inline[], home } from src/content/image-plan.json (built by artOf() after every model exists,
     because a team page's arch can come from another page's team card); every inline anchor is checked against
     the model, and an anchor that matches nothing fails the build. */
import { esc, plain, decodeEntities, findElements, attrOf, up, ownPath } from './util.mjs';
import { TOKEN, TOKEN_RE } from './content.mjs';
import { renderForm } from './forms.mjs';
import { remap } from './restructure.mjs';

export const MODEL_SCHEMA = 'rfec/page-model@1';
export const BLOCK_TYPES = ['prose', 'callout', 'cta', 'badges', 'childpages', 'posts', 'team', 'testimonials', 'reviews', 'visit', 'hours', 'accordion', 'video', 'products', 'equipment', 'gallery', 'logos', 'sitemap', 'docs', 'form', 'cherry'];
/* the other closed vocabularies of the contract (docs/BUILD-NOTES.md section 5); tools/model-check.mjs enforces all
   of them. SECTION_KINDS = 'article' (classic pages) + every value rowKind() returns for a non-empty row; the home's
   row kinds come from audit/architecture-map.json and must be in the same set. */
export const SECTION_KINDS = ['article', 'hero', 'image-band', 'text', 'text-image', 'image', 'cta', 'cards', 'callout', 'form', 'visit', 'team', 'reviews', 'testimonials', 'posts', 'gallery', 'products', 'logos', 'accordion', 'video', 'equipment', 'sitemap', 'cherry'];
export const IMAGE_ROLES = ['photo', 'plate', 'portrait', 'brand', 'diagram', 'logo', 'background', 'inline'];
export const EMBED_KINDS = ['map', 'youtube', 'iframe', 'video', 'cherry'];
/* `declared[].kind` (docs/BUILD-NOTES.md 5.1); 'structured-data' added in fix round 2 (R2-2, additive) */
export const DECLARED_KINDS = ['excerpt', 'toggle', 'shortcode', 'image-dropped', 'background-dropped', 'video-poster', 'pdf-not-harvested', 'structured-data'];

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
export function isoDate(d) {
  const m = /^([A-Z][a-z]{2})\s+(\d{1,2}),\s*(\d{4})$/.exec(String(d || '').trim());
  return m && MONTHS[m[1]] ? m[3] + '-' + MONTHS[m[1]] + '-' + m[2].padStart(2, '0') : '';
}
const hKey = (x) => plain(x).toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const TOKEN_SPLIT = new RegExp('(?:<p>\\s*)?' + TOKEN + 'C(\\d+)' + TOKEN + '(?:\\s*<\\/p>)?');

export function createPageModel(deps) {
  const { C, chrome, origin, seoBy, familyOf, imgUrl, ship, fail, stats, MAP_SRC, rowBackgrounds, mediaFor, seo, parseConditionalLogic, parseGravityForm, logoRec, mobileLogoRec, mobileMedia, ogImageFor, garbageAlt, shortcodes, cherryMode, ui } = deps;
  const pathOf = (url) => { const s = ownPath(url, origin); return s ? '/' + s + '/' : '/'; };
  const newExist = new Set([...deps.willExist].map(remap));

  /* ---------------------------------------------------------------- chrome, per page (page-relative) */
  function chromeFor(depth, curPath, opts) {
    const H = (href) => C.localHref(href, depth);
    const navItem = (it) => {
      const cur = curPath === it.href;
      const section = !cur && it.href !== '/' && curPath.startsWith(it.href);
      return { label: it.label, href: H(it.href), path: it.href, current: cur, inSection: section || it.children.some((c) => curPath === c.href), children: (it.children || []).map(navItem) };
    };
    const t = chrome.topbar;
    const f = chrome.footer;
    return {
      brandName: chrome.brandName,
      skip: { label: chrome.skip, href: '#main' },
      logo: { url: imgUrl(logoRec.rel, depth), w: logoRec.w, h: logoRec.h, alt: chrome.logo.alt, href: H('/'), homeLabel: chrome.logo.homeLabel },
      topbar: {
        address: { label: t.address.label, href: H(t.address.href) },
        appointment: { label: t.appointment.label, href: H(t.appointment.href) },
        call: { label: t.call.label, href: t.call.href },
      },
      /* the source's mobile header row (Beaver Builder fl-visible-mobile: shown only inside `media`, where the desktop
         logo + menu row is hidden): its own logo file (chrome.logo.srcPatternMobile, 988x400, alt altMobile), the
         appointment and call icon links (their labels are aria-labels at source) and the menu toggle labels */
      mobile: {
        media: mobileMedia,
        logo: { url: imgUrl(mobileLogoRec.rel, depth), w: mobileLogoRec.w, h: mobileLogoRec.h, alt: chrome.logo.altMobile, href: H('/') },
        appointment: { label: chrome.mobileHeader.appointment.label, href: H(chrome.mobileHeader.appointment.href), newTab: !!chrome.mobileHeader.appointment.newTab }, call: { label: chrome.mobileHeader.call.label, href: chrome.mobileHeader.call.href }, menuToggle: chrome.mobileHeader.menuToggle, menuOpen: chrome.mobileHeader.menuOpen, menuClose: chrome.mobileHeader.menuClose,
      },
      nav: chrome.nav.map(navItem),
      quickActions: chrome.quickActions.map((q) => ({ label: q.label, href: H(q.href), icon: q.icon })),
      social: f.social.map((s) => ({ network: s.network, label: s.label, href: s.href, rel: s.rel })),
      footer: {
        menu: f.columns.flatMap((c) => c.links.map((l) => ({ label: l.label, href: H(l.href), path: l.href }))),
        columns: f.columns.map((c) => ({ title: c.title || null, links: c.links.map((l) => ({ label: l.label, href: H(l.href), path: l.href })) })),
        button: { label: f.button.label, href: H(f.button.href) },
        nap: { name: f.nap.name, located: f.nap.located, street: f.nap.street, sep: f.nap.sep, locality: f.nap.locality, region: f.nap.region, postalCode: f.nap.postalCode, postalEnd: f.nap.postalEnd, phoneLabel: f.nap.phoneLabel, phone: chrome.phone, phoneHref: 'tel:' + chrome.phone, phoneEnd: f.nap.phoneEnd, site: { label: f.nap.site.label, href: H('/') }, text: f.nap.text },
        copyright: f.copyright,
        util: f.util.map((l) => ({ label: l.label, href: H(l.href), path: l.href })),
      },
      /* CY-1 decision: the site-wide floating Cherry estimator is not reproduced as a third-party script; its
         function is a local link to the Cherry page, labelled with that page's own menu label */
      financing: opts.financing ? { label: opts.financing.label, href: H(opts.financing.href), why: 'replaces the site-wide third-party "floating estimator" (audit/clone-removals.json)' } : null,
    };
  }

  function asideFor(raw, depth) {
    const sb = findElements(raw, /<(div)\b[^>]*class="ecp-secondary\b[^"]*"[^>]*>/i)[0];
    if (!sb) return null;
    const hasLocation = /ecp-posts-wrapper-location/.test(sb.html);
    const H = (href) => C.localHref(href, depth);
    const s = chrome.sidebar.location;
    return {
      variant: hasLocation ? 'standard' : 'location-page',
      quickActions: chrome.quickActions.map((q) => ({ label: q.label, href: H(q.href), icon: q.icon })),
      social: chrome.footer.social.map((x) => ({ network: x.network, label: x.label, href: x.href, rel: x.rel })),
      location: hasLocation ? {
        title: { text: s.title, href: H(s.href) },
        address: chrome.addressLines.slice(),
        contacts: [
          { type: 'Phone', label: s.phoneLabel, value: chrome.phone, href: 'tel:' + chrome.phone, note: null },
          { type: 'Fax', label: s.faxLabel, value: chrome.fax, href: null, note: null },
          { type: 'Email', label: s.emailLabel, value: chrome.email, href: 'mailto:' + chrome.email, note: s.emailNote },
        ],
        hours: chrome.hours.map(([d, v]) => [d, String(v).split('\n')]),
        map: { src: MAP_SRC, title: 'Google map', fallbackLabel: chrome.mapsLinkLabel },
      } : null,
    };
  }

  /* ---------------------------------------------------------------- images */
  function makeImages(page, depth) {
    const list = [];
    const byKey = new Map();
    const placeholders = [];
    const declared = [];
    function register(rec, alt, where, srcUrl) {
      const key = rec.file + '|' + alt + '|' + where;
      if (byKey.has(key)) return byKey.get(key);
      /* role: the COMPONENTS D.3 figure role from the classification and native size, or the slot's own nature */
      const role = where === 'background' ? 'background' : where === 'logo' ? 'logo' : C.imgRole('<img width="' + (rec.w || 0) + '" height="' + (rec.h || 0) + '" data-class="' + (rec.cls || '') + '">');
      const ref = { id: 'i' + (list.length + 1), url: imgUrl(rec.file, depth), file: rec.file, w: rec.w || null, h: rec.h || null, srcset: deps.srcsetOf(rec.file, depth), alt, role, class: rec.cls || null, src: srcUrl || rec.src || null, where };
      list.push(ref);
      byKey.set(key, ref);
      return ref;
    }
    /* a component image: { image: ref } | { placeholder } | { dropped } */
    function resolve(img, where, label) {
      if (!img || !img.src) return { image: null };
      const rec = C.mapImage(img.src, page.url.replace(/\/?$/, '/'));
      if (!rec) { fail('build:img', img.src, 'no mapping for a component image on ' + pathOf(page.url)); return { image: null }; }
      if (rec.drop) { declared.push({ kind: 'image-dropped', src: img.src, why: rec.why || '', where }); return { image: null, dropped: rec.why || 'declared drop' }; }
      if (rec.placeholder) {
        const ph = { kind: rec.placeholder.kind, label: label || img.alt || '', needs: rec.placeholder.needs, src: img.src, where };
        placeholders.push(ph);
        return { image: null, placeholder: ph };
      }
      const alt = img.alt && !garbageAlt(img.alt, img.src) ? img.alt : '';
      /* a file-name / upload-hash alt is blanked: declared (audit/clone-removals.json images.altsBlanked.onPages) */
      if (img.alt && !alt && deps.altBlanks) deps.altBlanks.push({ page: pathOf(page.url), src: img.src, alt: img.alt, where });
      return { image: register(rec, alt, where, img.src) };
    }
    return { list, placeholders, declared, register, resolve };
  }

  /* ---------------------------------------------------------------- rows (Beaver Builder) */
  function splitRows(html) {
    const rows = findElements(html, /<(div)\b[^>]*class="fl-row\b[^"]*"[^>]*>/gi);
    if (!rows.length) return [{ kind: 'flow', html }];
    const out = [];
    let last = 0;
    for (const r of rows) {
      const before = html.slice(last, r.start);
      if (before.replace(/<[^>]+>/g, '').trim() || new RegExp(TOKEN).test(before) || /<(img|iframe)\b/i.test(before)) out.push({ kind: 'flow', html: before });
      const node = attrOf(r.match[0], 'data-node');
      out.push({ kind: 'row', node, html: r.html });
      last = r.end;
    }
    const tail = html.slice(last);
    if (tail.replace(/<[^>]+>/g, '').trim() || new RegExp(TOKEN).test(tail) || /<(img|iframe)\b/i.test(tail)) out.push({ kind: 'flow', html: tail });
    return out;
  }

  /* ---------------------------------------------------------------- the model of one page */
  function build(page, opts = {}) {
    const s = seoBy.get(page.url) || {};
    const as404 = !!opts.as404;
    /* restructure: the page is written at its path in the restructured site (slug); every per-page lookup keeps the
       source path (p) */
    const srcSlug = ownPath(page.url, origin);
    const slug = remap(srcSlug);
    const depth = as404 ? 0 : (opts.depth !== undefined ? opts.depth : slug.split('/').filter(Boolean).length);
    const p = pathOf(page.url);
    const family = familyOf.get(p) || 'page';
    const raw = deps.rawOf(page);
    const isHome = slug === '' && !as404;
    const pageBase = page.url.replace(/\/?$/, '/');
    const imgs = makeImages(page, depth);
    const declared = imgs.declared;
    const embeds = [];
    const forms = [];
    const pageStats = { moved: new Map(stats.moved), dead: new Map(stats.dead) };

    /* ---- h1 (HD-1): the page's own h1; a label only when it has none ---- */
    let h1;
    const srcH1 = plain((page.h1 || [])[0] || '');
    if (srcH1) h1 = { text: srcH1, source: 'source', why: '' };
    else if (opts.h1Label) h1 = { text: opts.h1Label.text, source: 'label', why: opts.h1Label.why };
    else h1 = { text: plain(page.title || ''), source: 'title', why: 'no source h1: the page <title>' };
    h1.placement = isHome ? 'content' : 'band';
    if (h1.source !== 'source' && !as404) deps.seoLog.h1Labels.push({ page: p, h1: h1.text, source: h1.source, why: h1.why });

    /* ---- content ---- */
    const region = C.mainRegion(raw);
    const prep = C.prepare(region.html, { parseForm: parseGravityForm, path: p, shortcodes, rawMain: region.html });
    for (const n of prep.notes) declared.push(n);
    /* fail closed: every lift replaces whole elements, so the prepared markup keeps the source's div balance (the
       Beaver Builder rows are found by nesting below) */
    {
      const bal = (h) => (h.match(/<div\b/gi) || []).length - (h.match(/<\/div>/gi) || []).length;
      const before = bal(region.html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, ''));
      const after = bal(prep.html.replace(/<div>\u0002C\d+\u0002<\/div>/g, ''));
      if (before !== after) fail('build:component', p, 'prepare() changed the div balance (' + before + ' -> ' + after + '): a lift consumed part of an element');
    }
    for (const c of prep.comps) {
      if (c.kind !== 'form' || !c.data) continue;
      const cl = parseConditionalLogic(raw, c.data.id);
      c.data.conditional = cl.rules;
      stats.formShowIfRules = (stats.formShowIfRules || 0) + Object.keys(cl.rules).length;
      for (const u of cl.unsupported) fail('build:form', p, 'source conditional logic not carried: ' + u);
    }

    const H = (href) => C.localHref(href, depth);
    const cta = (b) => { const href = b.href ? H(b.href) : null; return { label: b.label, href, path: C.ownPathOf(b.href), external: !!href && /^https?:/i.test(href), newTab: !!b.newTab, rel: b.rel || '' }; };
    /* every image the sanitiser drops by decision on THIS page (a refused stock photo with no sibling, a platform
       image) is declared here, in processing order, beside the component and background drops */
    const sanitizeOpts = {
      onDrop: (d) => declared.push({ kind: 'image-dropped', src: d.src, why: d.why, where: 'prose' }),
      /* fix round 2: every alt the sanitiser blanks (garbageAlt) is declared per page, so an alt check can tell a
         declared blank from a lost alt */
      onAltBlank: (d) => { if (deps.altBlanks) deps.altBlanks.push({ page: p, src: d.src, alt: d.alt, where: 'prose' }); },
    };
    /* component HTML (raw fragment) -> D-set prose, through the SAME sanitiser and figure pass */
    const proseOf = (rawHtml) => markProse(C.finishSection(C.sanitize(rawHtml || '', depth, pageBase, sanitizeOpts)));
    let h1Removed = isHome;   /* the home keeps its h1 in its own row (live order) */
    const demoteTitle = (t) => {
      if (!t || t.level !== 'h1') return t;
      if (!h1Removed && hKey(t.text) === hKey(h1.text)) { h1Removed = true; stats.titleH1Removed = (stats.titleH1Removed || 0) + 1; return null; }
      return Object.assign({}, t, { level: 'h2', demotedFrom: 'h1' });
    };

    function blockOf(comp) {
      const d = comp.data;
      switch (comp.kind) {
        case 'form': {
          const form = Object.assign({}, d);
          forms.push(form);
          return { type: 'form', form, html: renderForm(form, { localHref: H, notice: chrome.notice, phone: chrome.phone, conditional: d.conditional, labelledBy: 'page-title' }) };
        }
        case 'callout': {
          const r = d.img ? imgs.resolve(d.img, 'callout', d.title ? d.title.text : '') : { image: null };
          const title = demoteTitle(d.title ? Object.assign({}, d.title, { href: d.title.href ? H(d.title.href) : null, path: C.ownPathOf(d.title.href) }) : null);
          const titleIsPageH1 = !!(d.title && !title);
          return { type: 'callout', title, titleIsPageH1, image: r.image, placeholder: r.placeholder || null, imageFirst: d.imageFirst, html: proseOf(d.html), buttons: d.buttons.map(cta) };
        }
        case 'button': return { type: 'cta', buttons: [cta(d)] };
        case 'buttons': return { type: 'cta', buttons: d.map(cta) };
        case 'badges': return { type: 'badges', items: d.items.map((q) => ({ label: q.label, href: H(q.href), path: C.ownPathOf(q.href), icon: (chrome.quickActions.find((x) => x.label === q.label) || {}).icon || null, newTab: !!q.newTab })) };
        /* fix round 2 (R2-1): the thumb keeps the SOURCE alt (blanked only by the declared garbageAlt rule, like every
           image), so the model no longer decides that a card thumb is decorative. A theme renders `alt` as given
           (docs/BUILD-NOTES.md 5.8). Printing a thumb decorative (alt="", as R's COMPONENTS F.1 index card does) blanks
           a source alt: it must be declared like every other blank (audit/clone-removals.json
           images.altsBlanked.onPages), or tools/keep-image-parity.mjs (alt fidelity) reports it */
        case 'childpages': return { type: 'childpages', variant: d.variant, items: d.items.map((it) => { const r = it.thumb ? imgs.resolve(it.thumb, 'childpage-thumb') : { image: null }; return { title: it.title, href: H(it.href), path: C.ownPathOf(it.href), summary: it.summary, thumb: r.image, thumbDropped: r.dropped || null }; }) };
        case 'posts': return { type: 'posts', view: d.view, items: d.items.map((it) => ({ title: it.title, level: it.level, href: H(it.href), path: C.ownPathOf(it.href), date: it.date ? { text: it.date, iso: isoDate(it.date) } : null, html: proseOf(it.html), image: it.img ? imgs.resolve(it.img, 'post-thumb').image : null, more: it.more ? { label: it.more.label, href: H(it.more.href), ariaLabel: it.more.ariaLabel } : null })) };
        case 'team': return { type: 'team', view: d.view, members: d.members.map((m) => { const r = m.img ? imgs.resolve(m.img, 'team-photo', m.img.alt || m.name) : { image: null }; return { name: m.name, level: m.level, href: m.href ? H(m.href) : null, path: C.ownPathOf(m.href), position: m.position, photo: r.image, placeholder: r.placeholder || null, html: proseOf(m.html), categories: m.categories, more: m.more ? { label: m.more.label, href: H(m.more.href), ariaLabel: m.more.ariaLabel } : null }; }) };
        case 'testimonials': return { type: 'testimonials', items: d.items.map((c) => ({ title: c.title ? { text: c.title.text, href: c.title.href ? H(c.title.href) : null, level: c.title.level } : null, html: proseOf(c.html), name: c.name, attribution: c.nameRaw, stars: c.stars })) };
        case 'reviews': return { type: 'reviews', items: d.items.map((r) => ({ html: proseOf(r.html), name: r.name, stars: r.stars, shownAs: r.shownAs, reviewedAt: r.reviewedAt })) };
        case 'visit': {
          if (d.mapSrc) embeds.push({ kind: 'map', src: d.mapSrc, title: 'Google map', where: 'visit' });
          return { type: 'visit', title: d.title ? { text: d.title.text, href: d.title.href ? H(d.title.href) : null, level: d.title.level } : null, subs: d.subs, address: d.address, contacts: d.contacts, hours: d.hours, map: d.mapSrc ? { src: d.mapSrc, title: 'Google map', fallbackLabel: chrome.mapsLinkLabel } : null, order: d.order && d.order.length ? d.order : ['title', 'contacts', 'address', 'map', 'hours'], view: d.view };
        }
        case 'hours': return { type: 'hours', rows: d.rows };
        case 'accordion': return { type: 'accordion', items: d.items.map((it) => ({ q: it.q, html: proseOf(it.html) })) };
        case 'video': {
          if (d.kind === 'iframe') { embeds.push({ kind: 'iframe', src: d.src, where: 'video' }); return { type: 'video', kind: 'iframe', src: d.src, title: 'YouTube video' }; }
          const sources = d.sources.map((x) => { const m = mediaFor(x.src, depth); if (!m) fail('build:media', p, 'video file not harvested: ' + x.src); return m ? { src: m.url, type: x.type || 'video/mp4', file: m.file, bytes: m.bytes } : null; }).filter(Boolean);
          if (d.poster) declared.push({ kind: 'video-poster', src: d.poster, why: 'poster image not in the harvest (audit/image-inventory.json); the video renders without a poster' });
          embeds.push({ kind: 'video', src: sources[0] ? sources[0].src : null, where: 'video' });
          return { type: 'video', kind: 'file', sources, poster: null, controls: d.controls };
        }
        case 'products': return { type: 'products', items: d.items.map((it) => { const r = it.img ? imgs.resolve(Object.assign({}, it.img, { alt: it.img.alt || '' }), 'product', it.title) : { image: null }; return { title: it.title, level: it.level, image: r.image, placeholder: r.placeholder || null, html: proseOf(it.html), more: it.more }; }) };
        case 'equipment': return { type: 'equipment', items: d.items.map((it) => { const r = it.img ? imgs.resolve(it.img, 'equipment', it.title) : { image: null }; return { title: it.title, level: it.level, image: r.image, html: proseOf(it.html) }; }) };
        case 'gallery': return { type: 'gallery', items: d.items.map((it) => { const r = it.img ? imgs.resolve(it.img, 'gallery', it.caption) : { image: null }; return { image: r.image, placeholder: r.placeholder || null, caption: it.caption, href: it.href ? H(it.href) : null }; }) };
        case 'logos': return { type: 'logos', kind: d.kind, items: d.items.map((it) => { const r = it.img ? imgs.resolve(it.img, 'logo', it.name) : { image: null }; return { name: it.name, image: r.image, placeholder: r.placeholder || null, href: it.href ? H(it.href) : null }; }) };
        case 'sitemap': return { type: 'sitemap', items: d.items.map((it) => ({ title: it.title, href: it.href ? H(it.href) : null, path: C.ownPathOf(it.href), depth: it.depth })) };
        case 'docs': return { type: 'docs', items: d.items.map((x) => { const href = deps.pdfFor(x.rawHref, depth); if (!href) declared.push({ kind: 'pdf-not-harvested', src: x.rawHref, why: 'the PDF is not in the harvest (assets/docs/ is empty); its only copy is on the platform CDN' }); return { label: x.label, href, needs: href ? null : 'pdf file', sourceHref: x.rawHref, after: x.after }; }) };
        case 'cherry': {
          embeds.push({ kind: 'cherry', src: d.scriptSrc, where: 'cherry', hosts: ['files.withcherry.com', 'fonts.googleapis.com'] });
          return { type: 'cherry', mode: cherryMode, slug: d.slug, sections: d.sections, scriptSrc: d.scriptSrc, fontsHref: d.fontsHref, snippet: d.snippet, label: h1.text, applyUrl: deps.cherryUrl || null, needs: deps.cherryUrl ? null : 'cherry application url' };
        }
        case 'raw': return { type: 'prose', html: d };
        default:
          fail('build:component', p, 'unknown component kind ' + comp.kind);
          return null;
      }
    }

    /* prose blocks of a cleaned fragment, split at component tokens */
    function blocksOf(html) {
      const out = [];
      const pieces = html.split(TOKEN_SPLIT);
      for (let i = 0; i < pieces.length; i++) {
        if (i % 2 === 1) { const b = blockOf(prep.comps[Number(pieces[i])]); if (b) out.push(b); continue; }
        const chunk = C.balanceFragment(pieces[i]).trim();
        if (!chunk.replace(/<[^>]+>/g, '').trim() && !/<(img|iframe|table|hr)\b/i.test(chunk)) continue;
        out.push({ type: 'prose', html: chunk });
      }
      return out;
    }
    /* D.1: attribution line, link rows, embeds; strip internal data-* */
    function markProse(html) {
      html = html.replace(/<p>(\s*Special thanks to[\s\S]*?)<\/p>/gi, (m, inner) => { stats.attributions = (stats.attributions || 0) + 1; return '<p class="attribution">' + inner + '</p>'; });
      html = html.replace(/<iframe\b([^>]*)><\/iframe>/gi, (m, attrs) => {
        const src = decodeEntities((/src="([^"]*)"/.exec(attrs) || [])[1] || '');
        const kind = /youtube|youtu\.be/.test(src) ? 'youtube' : /google\.com\/maps/.test(src) ? 'map' : 'iframe';
        embeds.push({ kind, src, title: decodeEntities((/title="([^"]*)"/.exec(attrs) || [])[1] || ''), where: 'prose' });
        return '<div class="embed embed--' + (kind === 'youtube' ? 'video' : kind === 'map' ? 'map' : 'other') + '"><iframe' + attrs + '></iframe></div>';
      });
      html = html.replace(/<div class="table-scroll" tabindex="0" role="region" aria-label="Table">/g, () => '<div class="table-scroll" tabindex="0" role="region" aria-label="' + esc(h1.text) + '">');
      /* every image in prose joins model.images (role = its figure class, or "logo" in a logo grid, "inline" in text) */
      html.replace(/<figure class="fig fig--([a-z]+)[^"]*"><span class="fig__media">(?:<a\b[^>]*>)?(<img\b[^>]*>)|<li class="logo-chip[^"]*">(?:<a\b[^>]*>)?(<img\b[^>]*>)|(<img\b[^>]*>)/g, (m, figRole, figImg, logoImg, anyImg) => {
        const tag = figImg || logoImg || anyImg;
        const a = (n) => decodeEntities((new RegExp('\\s' + n + '="([^"]*)"').exec(tag) || [])[1] || '');
        const url = a('src');
        if (!url || imgs.list.some((x) => x.url === url && x.where === 'prose' && x.alt === a('alt'))) return m;
        const file = url.split('/').pop();
        const cls = a('data-class');
        imgs.list.push({ id: 'i' + (imgs.list.length + 1), url, file, w: Number(a('width')) || null, h: Number(a('height')) || null, srcset: deps.srcsetOf(file, depth), alt: a('alt'), role: figRole || (logoImg ? 'logo' : 'inline'), class: cls || null, src: null, where: 'prose' });
        return m;
      });
      html = html.replace(/\s(?:data-generated|data-class)="[^"]*"/g, '');
      return html;
    }

    /* one cleaned fragment -> page-level h1 handling (HD-1): the content's copy of the band h1 is removed once;
       every other h1 becomes h2 (the home keeps its single h1 in place) */
    function cleanOf(html) {
      let clean = C.sanitize(html, depth, pageBase, sanitizeOpts);
      clean = clean.replace(/<(h[1-6])(?:\s[^>]*)?>((?:\s|<img\b[^>]*>|<br>|<a\b[^>]*>|<\/a>)*)<\/\1>/gi, (m, tag, inner) => {
        if (!/<img\b/i.test(inner) || inner.replace(/<[^>]+>/g, '').trim()) return m;
        stats.imageHeadingsUnwrapped = (stats.imageHeadingsUnwrapped || 0) + 1;
        return '<p>' + inner.trim() + '</p>';
      });
      if (!h1Removed) {
        clean = clean.replace(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i, (m, inner) => {
          if (hKey(inner) === hKey(h1.text)) { h1Removed = true; stats.titleH1Removed = (stats.titleH1Removed || 0) + 1; return ''; }
          return m;
        });
      }
      if (!isHome) clean = clean.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, '<h2$1>$2</h2>');
      clean = C.restoreAnchorTargets(clean, raw);
      return groupButtons(clean, prep.comps);
    }

    const chunks = splitRows(prep.html);
    const layout = chunks.some((c) => c.kind === 'row') ? 'builder' : 'classic';
    const sections = [];
    let sid = 0;
    const leadHeading = (blocks) => {
      const b = blocks[0];
      if (!b || b.type !== 'prose') return null;
      const m = /^<(h[1-6])((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/i.exec(b.html);
      if (!m) return null;
      b.html = b.html.slice(m[0].length).trim();
      if (!b.html) blocks.shift();
      return { html: m[3], text: plain(m[3]), level: m[1].toLowerCase(), id: (/\sid="([^"]+)"/.exec(m[2]) || [])[1] || null };
    };
    for (const ch of chunks) {
      const clean = cleanOf(ch.html);
      if (ch.kind === 'flow') {
        for (const sec of C.dedupeSections(C.splitSections(clean))) {
          const blocks = blocksOf(markProse(C.finishSection(sec.body || '')));
          const heading = sec.heading ? { html: sec.heading, text: plain(sec.heading), level: 'h2', id: (/\sid="([^"]+)"/.exec(sec.attrs || '') || [])[1] || null } : null;
          if (!heading && !blocks.length) continue;
          sections.push({ id: 's' + (++sid), kind: 'article', node: null, heading, background: [], blocks });
        }
        continue;
      }
      /* a Beaver Builder row: ONE section, its backgrounds (row + columns, layout CSS + lazy attributes) */
      const blocks = blocksOf(markProse(C.finishSection(clean)));
      const background = [];
      for (const bg of rowBackgrounds(ch.html)) {
        const rec = deps.backgroundRec(bg.url);
        if (!rec) { fail('build:asset', p, 'row background not in the image map: ' + bg.url); continue; }
        if (rec.drop || rec.placeholder) { declared.push({ kind: 'background-dropped', src: bg.url, why: rec.why || 'declared', where: 'background' }); continue; }
        const image = imgs.register(rec, '', 'background', bg.url);
        /* P1 (gap I.3): the page's declared crop of this file, on its base layer only (the home hero: 4:3 of 1920x800) */
        const crop = !as404 && !bg.media && deps.cropOf ? deps.cropOf(p, rec, depth) : null;
        if (crop) image.crop = crop;
        /* I.6: a layer the design supersedes stays in the model, marked and declared (never silently dropped) */
        const sup = !as404 && deps.supersededOf ? deps.supersededOf(p, bg.url) : null;
        if (sup) declared.push({ kind: 'background-dropped', src: bg.url, why: sup, where: 'background' });
        background.push(Object.assign({ image, media: bg.media || null, from: bg.from }, sup ? { superseded: sup } : {}));
      }
      if (!blocks.length && !background.length) { stats.emptyRowsSkipped = (stats.emptyRowsSkipped || 0) + 1; continue; }
      const kind = (isHome && deps.homeRowKind.get(ch.node)) || rowKind(blocks, background, sections.length === 0);
      const heading = leadHeading(blocks);
      sections.push({ id: 's' + (++sid), kind, node: ch.node, heading, background, blocks });
    }

    /* derived per-section views: prose, images, ctas, label */
    for (const sec of sections) {
      sec.label = sec.heading ? sec.heading.text : null;
      if (!sec.label) for (const b of sec.blocks) { const m = b.type === 'prose' && /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(b.html); if (m) { sec.label = plain(m[1]); break; } if (b.type === 'callout' && b.title) { sec.label = b.title.text; break; } }
      sec.prose = sec.blocks.filter((b) => b.type === 'prose').map((b) => b.html).join('\n');
      const ids = new Set(sec.background.map((b) => b.image.id));
      const walkImgs = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) { o.forEach(walkImgs); return; } if (o.id && o.url && o.file) ids.add(o.id); for (const v of Object.values(o)) if (v && typeof v === 'object') walkImgs(v); };
      walkImgs(sec.blocks);
      for (const b of sec.blocks) if (b.type === 'prose') for (const m of b.html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) { const ref = imgs.list.find((x) => x.url === decodeEntities(m[1])); if (ref) ids.add(ref.id); }
      sec.images = [...ids];
      sec.ctas = sec.blocks.flatMap((b) => (b.type === 'cta' || b.type === 'callout' ? b.buttons : []));
    }

    /* ---- breadcrumbs (R-2): the SOURCE trail. Every segment the source links keeps its link; the page's own segment
       (the source's last, unlinked one) has href null and current true. The 17 archives print their own segment
       EMPTY ("Home » " and nothing after it): Home keeps its link to the home, and the own segment stays as
       { label: '' , current: true } so the trail keeps the source's shape (a theme prints the separator before it
       and no label). JSON-LD below uses the non-empty segments only. ---- */
    const trail = (prep.trail || []).map((seg) => ({ text: seg.text, href: seg.href }));
    let breadcrumbs = null;
    if (trail.length && !as404) {
      breadcrumbs = trail.map((seg, i) => {
        const own = !prep.trailOwnEmpty && i === trail.length - 1;
        if (own && seg.href) fail('build:page', p, 'the source trail ends on a LINKED segment ("' + seg.text + '"): the page\'s own segment is not identifiable');
        return { label: seg.text, href: !own && seg.href ? H(seg.href) : null, path: seg.href ? C.ownPathOf(seg.href) : null, current: own && !seg.href };
      });
      if (prep.trailOwnEmpty) breadcrumbs.push({ label: '', href: null, path: null, current: true });
    }

    /* ---- date (DT-1): keyed on the single-post module, not on a family table ---- */
    const date = prep.postDate ? { text: prep.postDate, iso: isoDate(prep.postDate) } : null;

    /* ---- head ---- */
    const willExist = deps.willExist;
    const canonicalSlug = remap(seo.canonicalSlugFor(s, page, srcSlug, willExist, origin, deps.seoLog));
    const canonical = origin + '/' + (canonicalSlug ? canonicalSlug + '/' : '');
    const title = as404 ? (s.title || page.title || '').trim() : seo.pageTitle(s, page, h1.text, slug, deps.seoLog, '');
    let description = (s.metaDescription || '').trim();
    let descSource = description ? 'source' : 'none';
    if (!description && family === 'template') {
      /* fix round 2 (R2-3): a /template/* page is the platform's header or footer template rendered as a page (noindex
         at source). Its text is template copy - social icon labels, a placeholder location line naming another place
         ("Centerville Plaza on Hwy 5") - not a description of a page, so none is derived */
      if (!as404) deps.seoLog.descriptionsNotDerived.push({ page: p, why: 'no source meta description; a /template/* page is the platform\'s header or footer template rendered as a page (noindex) and its text is template copy (social icon labels, a placeholder location line), so no description is derived from it' });
    } else if (!description) {
      description = seo.deriveDescription(sections.map((x) => ({ body: (x.heading ? '<h2>' + x.heading.html + '</h2>' : '') + x.prose })));
      if (description) { descSource = 'derived'; if (!as404) { deps.seoLog.descriptions++; deps.seoLog.derivedDescriptions.push({ page: p, to: description, why: 'no source meta description: derived from ONE block of the page own prose (seo.mjs deriveDescription; link-only blocks never qualify)' }); } }
    }
    const rob = seo.sourceRobots(raw);
    const robots = as404 ? 'noindex' : seo.mergeRobots(rob.tokens);
    const noindex = /noindex/.test(robots);
    const ogSrc = (s.openGraph && s.openGraph['og:image']) || '';
    const og = {
      type: ((s.openGraph && s.openGraph['og:type']) || '').trim() || 'website',
      siteName: chrome.brandName,
      title: ((s.openGraph && s.openGraph['og:title']) || '').trim() || title,
      description: ((s.openGraph && s.openGraph['og:description']) || '').trim() || description || null,
      url: canonical,
      image: ogImageFor(ogSrc),
    };
    /* QA round 1 (CONTENT-3): an archive whose source Open Graph is its first listed post's (og:title, og:description,
       og:image, og:type: the platform copied them) describes itself: its own title, type website, no description, the
       site's share image (the logo). Its <title> and og:url were already the archive's (seo.mjs); declared in
       audit/seo-repairs.json openGraph */
    if (family === 'archive' && !as404 && og.title !== title) {
      const postDescription = og.description;
      if (deps.seoLog.openGraph) deps.seoLog.openGraph.push({ page: p, from: { type: og.type, title: og.title, description: og.description, image: og.image }, to: { type: 'website', title, description: null }, why: 'the archive carried its first listed post\'s Open Graph; it now describes the archive itself (image: the site logo)' });
      Object.assign(og, { type: 'website', title, description: null, image: ogImageFor('') });
      /* QA round 1 (wf6, CONTENT-3): the meta description too, where it is that same post's text (the source printed one
         text as both). Nothing is derived in its place: the archive's own content is a list of links (R2-3: link-only
         blocks never make a description). Declared in audit/seo-repairs.json descriptionsRemoved; tools/seo-parity.mjs
         accepts exactly these */
      if (description && description === postDescription) {
        if (deps.seoLog.descriptionsRemoved) deps.seoLog.descriptionsRemoved.push({ page: p, from: description, why: 'the archive\'s meta description was its first listed post\'s (the same text as the og:description the platform copied); the archive is a list of links, so no description is derived' });
        description = '';
        descSource = 'removed';
      }
    }
    const srcTwitterTitle = ((s.twitter && s.twitter['twitter:title']) || '').trim();
    const srcTitle = (s.title || page.title || '').trim();
    const twitter = { card: ((s.twitter && s.twitter['twitter:card']) || '').trim() || 'summary', title: srcTwitterTitle && !(title !== srcTitle && srcTwitterTitle === srcTitle) ? srcTwitterTitle : null, image: og.image };
    const trailAbs = trail.length >= 2 ? trail.map((seg, i) => {
      let abs = null;
      if (seg.href) { const own = ownPath(seg.href, origin); if (own !== null && (own === '' || willExist.has(own) || newExist.has(own))) { const np = remap(own); abs = origin + '/' + (np ? np + '/' : ''); } }
      /* QA round 1 (CONTENT-12): the trail's last item is the page itself, its own URL (it was the canonical, which on 8
         pages is another page: 7 staff pages -> /the-staff/, the location page -> /hours-location/) */
      return { text: seg.text, abs: i === trail.length - 1 ? origin + '/' + (slug ? slug + '/' : '') : abs };
    }) : null;
    /* ---- the source's own structured data (fix round 2, R2-2): every application/ld+json block of the raw page is
       replaced (the platform's site-wide types), carried (BlogPosting, with declared repairs), or removed and
       declared (an FAQPage the page does not print, a block that does not parse). Any other type fails the build. ---- */
    const ldExtra = [];
    const ldLog = (entry) => { declared.push(Object.assign({ kind: 'structured-data' }, entry, entry.repairs ? { repairs: entry.repairs.map((r) => r.field) } : {})); if (!as404) deps.seoLog.structuredData.push(Object.assign({ page: p }, entry)); };
    for (const blk of seo.sourceStructuredData(raw)) {
      if (blk.error) { ldLog({ type: blk.type, decision: 'REMOVE', why: 'the source block does not parse (JSON.parse: ' + blk.error + '), so no search engine could read it; removed, not repaired (docs/OPEN-DECISIONS.md B)' }); continue; }
      if (seo.LD_PLATFORM_TYPES.includes(blk.type)) continue;   /* replaced by the graph below (audit/clone-removals.json) */
      if (blk.type === 'BlogPosting') {
        const c = seo.carryBlogPosting(blk.data, { canonical, logoUrl: origin + '/img/' + logoRec.rel, logoPattern: chrome.logo.srcPattern, h1: h1.text, dateIso: date ? date.iso : '', brandName: chrome.brandName });
        for (const pr of c.problems) fail('build:seo', p, 'source BlogPosting not carried: ' + pr);
        if (c.problems.length) continue;
        ldExtra.push(c.node);
        ldLog({ type: 'BlogPosting', decision: 'REPAIR', why: 'carried into the page graph; every value is the source\'s except the listed repairs', repairs: c.repairs });
        continue;
      }
      if (blk.type === 'FAQPage') {
        const f = seo.faqShown(blk.data, { pageText: C.textIn(region.html), canonical });
        if (f.shown) {
          const node = Object.assign({}, blk.data);
          delete node['@context'];
          ldExtra.push(node);
          ldLog({ type: 'FAQPage', decision: 'CARRY', why: 'every question and answer is printed on the page' });
          continue;
        }
        const n = ((blk.data && blk.data.mainEntity) || []).length;
        ldLog({ type: 'FAQPage', decision: 'REMOVE', why: 'its ' + n + ' questions and answers are not printed on this page (' + f.missing.length + ' of ' + (2 * n) + ' texts absent)' + (f.ownUrl ? '' : '; its url names another page (' + blk.data.url + ')') + '. Structured data describes what the page shows, so it is removed (docs/OPEN-DECISIONS.md B)' });
        continue;
      }
      fail('build:seo', p, 'source JSON-LD of type "' + blk.type + '" has no rule (replace, carry or remove): a new type needs a decision');
    }
    const ld = seo.jsonLd({ pageUrl: canonical, chrome, origin, logoUrl: origin + '/img/' + logoRec.rel, trail: as404 ? null : trailAbs, extra: ldExtra });

    /* ---- aside (sidebar widgets as data) ---- */
    const aside = isHome || as404 ? null : asideFor(raw, depth);
    if (aside && aside.location) embeds.push({ kind: 'map', src: MAP_SRC, title: 'Google map', where: 'aside' });

    /* ---- page-level derived views ---- */
    const prose = sections.map((x) => (x.heading ? '<' + x.heading.level + '>' + x.heading.html + '</' + x.heading.level + '>\n' : '') + x.prose).filter(Boolean).join('\n');
    const links = { moved: diffMap(stats.moved, pageStats.moved), dead: diffMap(stats.dead, pageStats.dead) };

    return {
      schema: MODEL_SCHEMA,
      path: as404 ? '/404.html' : p,
      sourcePath: p,
      url: page.url.replace(/\/?$/, '/'),
      slug,
      depth,
      family: as404 ? 'not-found' : family,
      layout,
      region: region.region,
      isHome,
      as404,
      title,
      h1,
      metaDescription: { text: description || null, source: descSource },
      canonical,
      robots,
      noindex,
      og,
      twitter,
      jsonLd: ld.obj,
      breadcrumbs,
      date,
      sections,
      prose,
      aside,
      forms,
      images: imgs.list,
      placeholders: imgs.placeholders,
      embeds,
      declared,
      links,
      chrome: chromeFor(depth, as404 ? '' : (slug ? '/' + slug + '/' : '/'), { financing: ui.financing }),
      head: { favicon: deps.favicon(depth), stylesheets: deps.stylesheets(depth), scripts: deps.scripts ? deps.scripts(depth) : [], jsonLdHtml: ld.html, lang: s.lang || page.lang || 'en-US', lcp: null },
    };
  }

  /* the kind of a Beaver Builder row, from what it holds (the home takes the kinds of docs/SITE-ARCHITECTURE.md
     section 5, by row id). The vocabulary is closed: see docs/BUILD-NOTES.md "Page model contract". */
  function rowKind(blocks, background, first) {
    const has = (t) => blocks.some((b) => b.type === t);
    const n = (t) => blocks.filter((b) => b.type === t).length;
    if (!blocks.length) return background.length ? (first ? 'hero' : 'image-band') : 'empty';
    for (const t of ['form', 'visit', 'team', 'reviews', 'testimonials', 'posts', 'gallery', 'products', 'logos', 'accordion', 'video', 'equipment', 'sitemap', 'cherry']) if (has(t)) return t;
    if (n('callout') >= 2) return 'cards';
    if (n('callout') === 1) return 'callout';
    const prose = blocks.filter((b) => b.type === 'prose').map((b) => b.html).join('');
    const text = prose.replace(/<figure\b[\s\S]*?<\/figure>/gi, '').replace(/<[^>]+>/g, '').trim();
    const figures = /<figure\b/i.test(prose);
    if (!text && figures && !has('cta')) return 'image';
    if (!text && has('cta') && !figures) return 'cta';
    if (figures) return 'text-image';
    return has('cta') ? 'cta' : 'text';
  }

  function diffMap(after, before) {
    const out = [];
    for (const [k, v] of after) { const b = before.get(k) || 0; if (v > b) out.push({ path: '/' + k + '/', refs: v - b }); }
    return out;
  }

  /* ---------------------------------------------------------------- P4: model.art (wf5b) */
  /* the model's content in document order: section headings, callout titles, the headings and paragraphs of every
     rendered html field, and child-page items; the anchors of image-plan.json usedFor[] are matched against it */
  const anchorKey = (s) => plain(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
  function contentNodes(model) {
    const out = [];
    model.sections.forEach((sec, si) => {
      if (sec.heading) out.push({ kind: 'heading', text: sec.heading.text, level: sec.heading.level, at: 's' + si });
      sec.blocks.forEach((b, bi) => {
        const at = 's' + si + 'b' + bi;
        if (b.type === 'callout' && b.title) out.push({ kind: 'heading', text: b.title.text, level: b.title.level, at });
        if (typeof b.html === 'string' && b.type !== 'form') for (const m of b.html.matchAll(/<(h[2-6]|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)) out.push({ kind: /^h/i.test(m[1]) ? 'heading' : 'p', text: plain(m[2]), level: m[1].toLowerCase(), at });
        if (b.type === 'childpages') b.items.forEach((it, ii) => out.push({ kind: 'item', text: it.title, item: it, at: at + 'i' + ii }));
      });
    });
    return out;
  }
  /* -> the document position of the node an anchor names, or throws naming what did not match (D.7 transform 5:
     "an anchor that matches nothing fails the build") */
  function anchorIndex(model, anchor, label) {
    const nodes = contentNodes(model);
    const t = anchor && anchor.type;
    let i = -1;
    if (t === 'article-start') {
      const first = nodes.findIndex((n) => n.kind === 'heading');
      if (first !== -1 && (!anchor.before || anchorKey(nodes[first].text) === anchorKey(anchor.before))) i = 0;
      else throw new Error(label + ': article-start anchor: the first heading is "' + (first === -1 ? '(none)' : nodes[first].text) + '", the plan says before "' + anchor.before + '"');
      return i;
    }
    if (t === 'heading') i = nodes.findIndex((n) => n.kind === 'heading' && anchorKey(n.text) === anchorKey(anchor.text) && (!anchor.level || n.level === anchor.level));
    else if (t === 'after-paragraph') i = nodes.findIndex((n) => n.kind === 'p' && anchorKey(n.text).endsWith(anchorKey(anchor.textEndsWith)));
    else if (t === 'hub-item') {
      i = nodes.findIndex((n) => n.kind === 'item' && anchorKey(n.text) === anchorKey(anchor.text));
      /* a stand-in thumb only fills a slot whose own image was dropped (thumb null, thumbDropped set) */
      if (i !== -1 && (nodes[i].item.thumb || !nodes[i].item.thumbDropped)) throw new Error(label + ': hub-item "' + anchor.text + '" has its own thumbnail; a stand-in only fills a dropped one');
    } else throw new Error(label + ': unknown anchor type ' + t);
    if (i === -1) throw new Error(label + ': ' + t + ' anchor "' + (anchor.text || anchor.textEndsWith || '') + '"' + (anchor.level ? ' (' + anchor.level + ')' : '') + ' matches nothing in the model');
    return i;
  }
  /* spec (from src/build.mjs, which owns the image plan and the encodes): { title, inline[], home } where an encoded
     image g = { rel, w, h, variants: [{ rel, w }] }. Returns model.art with page-relative URLs (COMPONENTS 0.12). */
  function artOf(model, spec) {
    const depth = model.depth;
    const pic = (g) => ({ url: deps.relUrl(g.rel, depth), w: g.w, h: g.h, srcset: g.variants.map((v) => ({ url: deps.relUrl(v.rel, depth), w: v.w })) });
    let title = null;
    if (spec.title && spec.title.placeholder) title = { id: spec.title.id, placeholder: { kind: spec.title.placeholder.kind, label: spec.title.placeholder.label, needs: spec.title.placeholder.needs } };
    else if (spec.title) { const g = pic(spec.title.image); title = { id: spec.title.id, url: g.url, w: g.w, h: g.h, alt: spec.title.alt, srcset: g.srcset, ai: spec.title.ai, objectPosition: spec.title.objectPosition || null }; }
    const inline = (spec.inline || []).map((e, k) => ({ e, k, at: anchorIndex(model, e.anchor, model.path + ' ' + e.id) }))
      .sort((a, b) => a.at - b.at || a.k - b.k)
      .map(({ e }) => { const g = pic(e.image); return { id: e.id, image: { url: g.url, w: g.w, h: g.h, alt: e.alt, srcset: g.srcset, ai: e.ai, role: e.role }, anchor: e.anchor, position: e.position || null }; });
    let home = null;
    if (spec.home) {
      home = {};
      for (const [role, e] of Object.entries(spec.home)) { if (!e) { home[role] = null; continue; } const g = pic(e.image); home[role] = { id: e.id, url: g.url, w: g.w, h: g.h, alt: e.alt, srcset: g.srcset, ai: e.ai, role }; }
    }
    return { title, inline, home };
  }

  /* Group adjacent button tokens into one CTA group */
  function groupButtons(html, comps) {
    return html.replace(new RegExp('(?:<p>\\s*' + TOKEN + 'C(\\d+)' + TOKEN + '\\s*<\\/p>\\s*){2,}', 'g'), (run) => {
      const ids = [...run.matchAll(TOKEN_RE)].map((m) => Number(m[1]));
      TOKEN_RE.lastIndex = 0;
      if (!ids.every((i) => comps[i].kind === 'button')) return run;
      comps.push({ kind: 'buttons', data: ids.map((i) => comps[i].data) });
      return '<p>' + TOKEN + 'C' + (comps.length - 1) + TOKEN + '</p>';
    });
  }

  return { build, isoDate, artOf, anchorIndex };
}
