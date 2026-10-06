/* seo.mjs - head-level fields for the Riverside Family Eye Care rebuild, carried forward from the source and
   repaired ONLY from the page's own content or a declared decision.
   Forked from the reference build (R) src/lib/seo.mjs (PORT-NOTES 2.4). Kept unchanged: sourceRobots /
   mergeRobots (every robots meta of the RAW head, most restrictive wins: the 23 source noindex pages stay
   noindex), pageTitle, deriveDescription, canonicalSlugFor. Riverside changes:
   - LK-1  MOVED is built from the site's own 16 live redirect aliases (audit/site-inventory.json
           pages[].aliases), not a hard-coded table: links to an alias are re-pointed to its final page and
           the same 16 pairs are the only redirects the build emits.
   - LD-1  JSON-LD from the Riverside facts (chrome.json, verified by tools/write-facts.mjs): Organization +
           Optometric (+ BreadcrumbList where the page has a source trail); one OpeningHoursSpecification PER
           INTERVAL (Friday has two); faxNumber and email (both printed in the sidebar of 131 pages; a reversible
           decision, docs/OPEN-DECISIONS.md); sameAs = the 4 social profiles. No geo (none published).
   Fix round 2: R2-2 every source JSON-LD block is accounted for (sourceStructuredData: the platform types are
   replaced, BlogPosting is carried with declared repairs, an FAQPage the page does not print and an unparseable
   block are removed and declared, any other type fails the build); R2-3 deriveDescription never takes a link-only
   block. */
import { decodeEntities, ownPath, plain } from './util.mjs';

/* LK-1: alias path -> final path (own paths without slashes; '' is the home), from the crawl record */
export function movedFromAliases(siteInv, origin) {
  const out = new Map();
  for (const pg of (siteInv && siteInv.pages) || []) {
    for (const al of pg.aliases || []) {
      const from = ownPath(al, origin), to = ownPath(pg.finalUrl || pg.url, origin);
      if (from !== null && to !== null && from !== to) out.set(from, to);
    }
  }
  return out;
}

/* a source title ending on a function word is a truncation (K10: 0 hits here) */
const DANGLING_TAIL = /(?:\b(?:for|the|a|an|and|of|to|in|on|with|your|our|from|at|by|is|are)\s*|[|:,\-–—]\s*)$/i;
const ARCHIVE_PAGE = /^(author|category|tag)\//;

/* every robots meta in the raw <head>, merged. Directives are comma/space separated; the most restrictive of
   each pair wins (noindex over index, nofollow over follow); other directives (max-image-preview:large) are kept
   once, in first-seen order. seo-inventory.metaRobots recorded only one meta per page, so it is never read. */
export function sourceRobots(raw) {
  const head = (String(raw).match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).filter((t) => /\bname\s*=\s*["']?robots["'\s>]/i.test(t));
  const tokens = [];
  for (const t of metas) {
    const c = (/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(t) || []);
    const v = c[1] !== undefined ? c[1] : (c[2] || '');
    for (const tok of v.toLowerCase().split(/[\s,]+/).filter(Boolean)) tokens.push(tok);
  }
  return { metas: metas.length, tokens };
}

export function mergeRobots(tokens, extra = []) {
  const all = [...tokens, ...extra];
  const has = (t) => all.includes(t);
  const out = [];
  if (has('noindex')) out.push('noindex'); else if (has('index')) out.push('index');
  if (has('nofollow')) out.push('nofollow'); else if (has('follow')) out.push('follow');
  for (const t of all) if (!/^(no)?(index|follow)$/.test(t) && !out.includes(t)) out.push(t);
  return out.join(', ');
}

export function pageTitle(s, page, h1Text, slug, log, fallbackLabel) {
  const title = (s.title || page.title || '').trim();
  const og = ((s.openGraph && s.openGraph['og:title']) || '').trim();
  const h1 = (h1Text || '').trim();
  let out = title || og || h1, why = '';
  if (ARCHIVE_PAGE.test(slug) && h1) { out = h1; why = 'WordPress gave this archive the title of the first post it lists (or none); replaced with the page own h1.'; }
  else if (title && DANGLING_TAIL.test(title)) {
    const full = (og.length > title.length && og) || (h1.length > title.length && h1) || '';
    if (full) { out = full; why = 'Source title stops on a dangling function word (truncated); replaced from the page own og:title or h1.'; }
  }
  if (!title && !og && h1 && !why) why = 'Source <title> and og:title are empty; the title follows the page h1.';
  if (!out && fallbackLabel) { out = fallbackLabel; why = 'Source <title>, og:title and h1 are empty; a neutral label.'; }
  if (out !== title) log.titles.push({ page: '/' + (slug ? slug + '/' : ''), from: title, to: out, why });
  return out;
}

/* No meta description at source: take ONE source block of the page's own prose (the first p / li / td / th /
   dd / blockquote / figcaption of 60+ characters; headings and all-bold lead lines never), cut at its last
   sentence end within 155 characters or else on a word with an ellipsis. No qualifying block: no description.
   Fix round 2 (R2-3): a block whose every word sits inside links is navigation, not prose (the footer templates'
   social icon links print their aria-labels "Visit us on facebook Visit us on yelp ..."), so it never qualifies. */
const DESC_BLOCK = /<(p|li|td|th|dd|blockquote|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const NESTED_BLOCK = /<(p|ul|ol|li|table|div|h[1-6]|blockquote|figure|section|dl)\b/i;
const INLINE_TAG = /<\/?(?:a|span|strong|b|em|i|u|sup|sub|small|cite|code|abbr|mark|q|s|time|font)\b[^>]*>/gi;
const NOT_A_SENTENCE_END = /^(?:\d+|[A-Z]|Dr|Mr|Mrs|Ms|St|Jr|Sr|vs|etc|e\.g|i\.e|No|Inc|Co)$/;
function cutDescription(text, max = 155) {
  if (text.length <= max) return text;
  let best = -1;
  for (const m of text.slice(0, max).matchAll(/[.!?](?=["”’)]?\s)/g)) {
    const before = text.slice(0, m.index).split(/\s/).pop().replace(/^["“(]/, '');
    if (NOT_A_SENTENCE_END.test(before)) continue;
    if (m.index + 1 > 80) best = m.index + 1;
  }
  if (best > 0) return text.slice(0, best).replace(/\s+$/, '');
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:–—-]+$/, '') + '…';
}
/* true when no letter or digit of the block is outside an <a> element */
export function isLinkOnly(inner) {
  const rest = decodeEntities(String(inner || '').replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ').replace(/<[^>]+>/g, ' '));
  return /<a\b/i.test(inner) && !/[\p{L}\p{N}]/u.test(rest);
}
export function deriveDescription(sections) {
  for (const sec of sections) {
    for (const m of String(sec.body || '').matchAll(DESC_BLOCK)) {
      if (NESTED_BLOCK.test(m[2])) continue;
      if (/^\s*<(strong|b)\b[^>]*>[\s\S]*<\/\1>\s*$/i.test(m[2]) && !/<\/(strong|b)>[\s\S]*<(strong|b)\b/i.test(m[2])) continue;
      if (isLinkOnly(m[2])) continue;
      const text = decodeEntities(m[2].replace(INLINE_TAG, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
      if (text.length >= 60) return cutDescription(text);
    }
  }
  return '';
}

/* Canonical must name a page this build serves; only the homepage is the homepage; trailing slash. A source
   canonical that points at another page this build serves is kept (8 pages: 7 /team/* -> /the-staff/,
   /location/riverside-family-eyecare/ -> /hours-location/); a missing one (17 archives) becomes self. */
export function canonicalSlugFor(s, page, slug, willExist, origin, log) {
  let out;
  const declared = s.canonical ? ownPath(s.canonical, origin) : null;
  if (declared === null) out = slug;
  else if (declared !== slug && !willExist.has(declared)) out = slug;
  else if (declared === '' && slug !== '') out = slug;
  else out = declared;
  if (!s.canonical || out !== ownPath(s.canonical, origin)) log.canonicals.push({ page: '/' + (slug ? slug + '/' : ''), from: s.canonical || '(none declared)', to: origin + '/' + (out ? out + '/' : '') });
  return out;
}

function to24(t) {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || '');
  if (!m) return '';
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return String(h).padStart(2, '0') + ':' + m[2];
}

/* LD-1: the opening hours as data: one { day, opens, closes, text } per printed interval ("\n" in chrome.json
   is the source's <br>: Friday 8:00 AM - 12:00 PM and 1:00 PM - 4:00 PM) */
export function hoursIntervals(hours) {
  const out = [];
  for (const [day, v] of hours || []) {
    for (const part of String(v).split(/\n/).map((x) => x.trim()).filter(Boolean)) {
      if (/closed/i.test(part)) continue;
      const p = part.split(/\s+-\s+/);
      out.push({ day, opens: to24(p[0]), closes: to24(p[1]), text: part });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- the SOURCE structured data (fix round 2, R2-2)
   Every <script type="application/ld+json"> block of the RAW page, head and body, is accounted for by @type:
   - the platform's 7 site-wide types (LD_PLATFORM_TYPES) are REPLACED by the one graph jsonLd() builds below
     (audit/clone-removals.json);
   - BlogPosting (19 posts) is CARRIED into that graph: every key and value is the source's except the repairs
     carryBlogPosting() returns, each declared (audit/seo-repairs.json `structuredData`);
   - FAQPage is carried only when the page prints every question and answer it holds (faqShown); otherwise it is
     REMOVED, declared (both source copies: their 4 Q&As are printed on no page);
   - a block that does not parse is REMOVED, declared (the 3 VideoObject blocks: a raw line break inside a string);
   - any other type fails the build: a new type needs a decision. */
export const LD_PLATFORM_TYPES = ['WebPage', 'LocalBusiness', 'MedicalBusiness', 'Optician', 'MedicalSpecialty :: Optometric', 'Organization', 'BreadcrumbList'];
export function sourceStructuredData(raw) {
  const out = [];
  for (const m of String(raw).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\btype\s*=\s*["']?application\/ld\+json/i.test(m[1])) continue;
    let data = null, error = null;
    try { data = JSON.parse(m[2]); } catch (e) { error = String((e && e.message) || e); }
    /* one node per block on this crawl; an array or an @graph block is a shape no rule covers (its type is reported
       as such, and the caller fails the build) */
    const t = data && !Array.isArray(data) && !data['@graph'] ? data['@type'] : data ? '(array or @graph)' : (/"@type"\s*:\s*"([^"]+)"/.exec(m[2]) || [])[1] || '(no @type)';
    out.push({ type: typeof t === 'string' ? t : JSON.stringify(t), data: error ? null : data, error });
  }
  return out;
}

const MONTH_NUM = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };
/* "February 26, 2023" -> "2023-02-26"; anything else -> '' */
export function longDateIso(d) {
  const m = /^([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(String(d || '').trim());
  return m && MONTH_NUM[m[1]] ? m[3] + '-' + MONTH_NUM[m[1]] + '-' + m[2].padStart(2, '0') : '';
}

/* BlogPosting, carried. The source keys in source order; the values are the source's except these repairs (each
   returned with from / to / why, and only when it changes something):
   - mainEntityOfPage.@id: the platform points every post at the home page; the post is the main entity of its own
     page (the page's canonical);
   - headline, description: HTML entities inside the JSON strings (&#8217;, &#038;) decoded;
   - datePublished, dateModified: the source's "February 26, 2023" as an ISO 8601 date (schema.org Date);
   - image: [""] at source (empty) is omitted, never invented;
   - publisher.logo.url: the platform CDN copy of the practice logo becomes the same file as this build ships it.
   Fail closed (problems, the caller fails the build): an unknown key, a headline that is not the page's h1, a date
   that does not parse or differs from the post date the page prints, an author or publisher that is not the
   practice, a logo that is not the practice logo. */
export function carryBlogPosting(src, { canonical, logoUrl, logoPattern, h1, dateIso, brandName }) {
  const problems = [];
  const repairs = [];
  const KEYS = ['@context', '@type', 'mainEntityOfPage', 'headline', 'image', 'datePublished', 'dateModified', 'author', 'publisher', 'description'];
  for (const k of Object.keys(src)) if (!KEYS.includes(k)) problems.push('unexpected key ' + k);
  const rep = (field, from, to, why) => { if (JSON.stringify(from) !== JSON.stringify(to)) repairs.push({ field, from, to, why }); };
  const meop = src.mainEntityOfPage && src.mainEntityOfPage['@id'];
  rep('mainEntityOfPage.@id', meop, canonical, 'the platform points every post at the home page; the post is the main entity of its own page (its canonical)');
  const text = (field) => {
    const v = decodeEntities(String(src[field] || ''));
    rep(field, src[field], v, 'HTML entities inside the JSON string (the platform wrote the escaped title) decoded');
    return v;
  };
  const headline = text('headline');
  const description = text('description');
  if (headline !== h1) problems.push('headline "' + headline + '" is not the page h1 "' + h1 + '"');
  const dates = {};
  for (const f of ['datePublished', 'dateModified']) {
    dates[f] = longDateIso(src[f]);
    if (!dates[f]) { problems.push(f + ' "' + src[f] + '" is not a "Month D, YYYY" date'); continue; }
    rep(f, src[f], dates[f], 'the same date as an ISO 8601 date (schema.org Date)');
  }
  if (dates.datePublished && dates.datePublished !== dateIso) problems.push('datePublished ' + dates.datePublished + ' is not the post date the page prints (' + dateIso + ')');
  if (Array.isArray(src.image) ? src.image.some((x) => String(x).trim()) : src.image) problems.push('a non-empty image (no rule carries it)');
  if ('image' in src) repairs.push({ field: 'image', from: src.image, to: null, why: 'empty at source; omitted (no image is invented)' });
  const org = (o, what) => { if (!o || o['@type'] !== 'Organization' || o.name !== brandName) problems.push(what + ' is not the practice Organization: ' + JSON.stringify(o)); };
  org(src.author, 'author');
  org(src.publisher, 'publisher');
  const logoSrc = src.publisher && src.publisher.logo && src.publisher.logo.url;
  if (!logoSrc || !String(logoSrc).includes(logoPattern)) problems.push('publisher.logo is not the practice logo: ' + logoSrc);
  rep('publisher.logo.url', logoSrc, logoUrl, 'the platform CDN copy of the practice logo; the same file as this build ships it');
  const node = {
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    headline,
    datePublished: dates.datePublished,
    dateModified: dates.dateModified,
    author: { '@type': 'Organization', name: src.author && src.author.name },
    publisher: { '@type': 'Organization', name: src.publisher && src.publisher.name, logo: { '@type': 'ImageObject', url: logoUrl } },
    description,
  };
  return { node, repairs, problems };
}

/* FAQPage: carried only when the page itself prints every question and every answer (JSON-LD describes what the page
   shows) and its url, when set, is the page's own. `pageText` is the page's visible text, whitespace-normalised. */
export function faqShown(src, { pageText, canonical }) {
  const norm = (s) => decodeEntities(String(s || '')).replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
  const text = norm(pageText);
  const missing = [];
  for (const q of (src && src.mainEntity) || []) {
    if (!text.includes(norm(q.name))) missing.push('question "' + norm(q.name) + '"');
    if (!text.includes(norm(q.acceptedAnswer && q.acceptedAnswer.text))) missing.push('the answer to "' + norm(q.name) + '"');
  }
  const ownUrl = !src.url || String(src.url).replace(/\/?$/, '/') === canonical;
  return { shown: !missing.length && ownUrl && ((src && src.mainEntity) || []).length > 0, missing, ownUrl };
}

/* Structured data from the published facts only (chrome.json). Optometric is the schema.org MedicalBusiness
   subtype for an optometry practice (the source's "MedicalSpecialty :: Optometric" is not a schema.org type).
   The BreadcrumbList mirrors the SOURCE trail the page renders; pages without a source trail get none.
   `extra`: the page's own carried source nodes (a BlogPosting, fix round 2), appended to the graph in source order.
   Returns { obj, html }: the object for the page model, the <script> for the head. */
export function jsonLd({ pageUrl, chrome, origin, logoUrl, trail, extra = [] }) {
  const orgId = origin + '/#organization';
  const bizId = origin + '/#optometric';
  const social = ((chrome.footer && chrome.footer.social) || []).map((x) => x.href);
  const graph = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: chrome.brandName,
      url: origin + '/',
      ...(logoUrl ? { logo: logoUrl } : {}),
      sameAs: social,
    },
    {
      '@type': 'Optometric',
      '@id': bizId,
      name: chrome.brandName,
      url: origin + '/',
      telephone: chrome.phone,
      ...(chrome.fax ? { faxNumber: chrome.fax } : {}),
      ...(chrome.email ? { email: chrome.email } : {}),
      ...(logoUrl ? { image: logoUrl } : {}),
      parentOrganization: { '@id': orgId },
      address: {
        '@type': 'PostalAddress',
        streetAddress: chrome.address.street,
        addressLocality: chrome.address.locality,
        addressRegion: chrome.address.region,
        postalCode: chrome.address.postalCode,
        addressCountry: 'US',
      },
      openingHoursSpecification: hoursIntervals(chrome.hours).map((iv) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/' + iv.day, opens: iv.opens, closes: iv.closes })),
      sameAs: social,
    },
  ];
  if (trail && trail.length >= 2) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((seg, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: seg.text,
        ...(seg.abs ? { item: seg.abs } : (i === trail.length - 1 ? { item: pageUrl } : {})),
      })),
    });
  }
  graph.push(...extra);
  const obj = { '@context': 'https://schema.org', '@graph': graph };
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return { obj, html: '<script type="application/ld+json">' + json + '</' + 'script>' };
}

export { plain };
