/* Site restructure (operator, 2026-10-07): "copy the site structure of https://eyetrendsclearlake.com/ but retain the text
   copies and content of riverside. For internal pages that is not present in current riverside live site, use the content
   from eye trends clear lake but replace the company name with Riverside Family Eye Care."

   - MOVES: a source page that has an Eye Trends counterpart takes the counterpart's path (Eye Trends' paths, with this
     build's trailing slash); its content stays the source's own. A page BELOW a moved page moves with it (longest-prefix
     rule), so /eyeglasses/lens-treatments/uv-protection/ becomes /products/lens-treatments/uv-protection/. Pages with no
     moved ancestor keep their path (blog posts, team bios, forms, contact, archives, legal, sitemap).
   - ADOPTED: the 11 Eye Trends pages the source site does not have, adapted by tmp/restructure (workflow wf_9d850499-741)
     into src/content/adopted/<name>.json: Eye Trends' text with Riverside's name, town, phone and doctors, and every claim
     that is a fact about Eye Trends removed (each file lists its edits).
   - Every moved path is redirected (301) to its new path (dist/_redirects, dist/.htaccess) and gets a small redirect page
     at the old path for hosts that serve no redirect file (the GitHub Pages preview).
   Paths here are own paths without the leading and trailing slash ('' is the home). */
import fs from 'node:fs';
import path from 'node:path';

export const MOVES = {
  'our-eye-doctors': 'our-doctors',
  'eye-care-services': 'services',
  'eye-care-services/eye-exams': 'services/comprehensive-eye-exams',
  'eye-care-services/eye-exams/pediatric-eye-exams': 'services/pediatric-eye-exams',
  'eye-care-services/nearsighted-myopia': 'services/myopia-management',
  'eye-care-services/management-of-ocular-diseases': 'services/medical-eye-care',
  'eye-care-services/management-of-ocular-diseases/glaucoma': 'services/glaucoma-management',
  'eye-care-services/management-of-ocular-diseases/treating-diabetic-retinopathy': 'services/diabetic-eye-exams',
  'eye-care-services/management-of-ocular-diseases/treating-macular-degeneration': 'services/macular-degeneration',
  'eye-care-services/dry-eye-disease-and-treatment': 'services/dry-eye-treatment',
  'eye-care-services/cataract-surgery-co-management': 'services/cataract-co-management',
  'eye-care-services/lasik-refractive-surgery-co-management': 'services/lasik-co-management',
  'eye-care-services/eye-emergencies-pink-red-eyes': 'services/emergency-eye-care',
  'eye-care-services/contact-lens-exams': 'services/contact-lens-exams',
  'eye-care-services/contact-lens-exams/hard-to-fit': 'services/specialty-contacts',
  'contact-lenses/toric-contact-lenses-for-astigmatism': 'services/toric-contacts',
  'contact-lenses/gas-permeable-gp-contact-lenses': 'services/gas-permeable-contacts',
  'contact-lenses/bifocal-and-multifocal-contact-lenses': 'services/multifocal-contacts',
  'eyeglasses': 'products',
  'eyeglasses/kids-optical': 'products/kids-eyewear',
  'contact-lenses': 'products/contact-lenses',
  'contact-us/testimonials': 'reviews',
  'contact-us/patient-forms': 'patient-forms',
  'hours-location': 'eye-doctor-fort-myers',
  'whats-new': 'eye-health',
  'website-accessibility-policy': 'accessibility',
};

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* own path -> its path in the restructured site (identity for a path with no moved ancestor, and for every new path) */
export function remap(p) {
  if (p === null || p === undefined || p === '') return p;
  if (has(MOVES, p)) return MOVES[p];
  const segs = p.split('/');
  for (let i = segs.length - 1; i > 0; i--) {
    const a = segs.slice(0, i).join('/');
    if (has(MOVES, a)) return MOVES[a] + '/' + segs.slice(i).join('/');
  }
  return p;
}

/* The adopted pages as page records shaped like audit/content-inventory.json rows, each with the EyeCarePro-shaped raw
   document the page model reads (main.ecp-primary > breadcrumb + article > header h1 + entry content), and a seo record
   shaped like audit/seo-inventory.json rows. The trail is Home » Services » <h1> (Home » <h1> for /terms/). */
export function adoptedPages(root, origin) {
  const dir = path.join(root, 'src/content/adopted');
  if (!fs.existsSync(dir)) return [];
  const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const a = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const k of ['path', 'source', 'title', 'metaDescription', 'h1', 'html']) if (!a[k]) throw new Error('restructure: ' + f + ' has no ' + k);
    const own = a.path.replace(/^\/+|\/+$/g, '');
    const url = origin + '/' + own;
    const sep = '<span class="ecp-breadcrumb-separator"> » </span>';
    const trail = '<a href="/">Home</a>' + sep + (own.startsWith('services/') ? '<a href="/services/">Services</a>' + sep : '') + escHtml(a.h1);
    const raw = '<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"><title>' + escHtml(a.title) + '</title>'
      + '<meta name="description" content="' + escHtml(a.metaDescription) + '"></head><body>'
      + '<main id="content" class="ecp-primary"><div class="ecp-breadcrumb ecp-breadcrumb-auto">' + trail + '</div>'
      + '<article class="page type-page status-publish"><header class="ecp-entry-header"><h1 class="ecp-entry-title">' + escHtml(a.h1) + '</h1></header>'
      + '<div class="ecp-entry-content">' + a.html + '</div></article></main></body></html>';
    const headings = [{ level: 1, text: a.h1, id: '' }].concat([...a.html.matchAll(/<h([2-4])>([\s\S]*?)<\/h\1>/g)].map((m) => ({ level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, '').trim(), id: '' })));
    out.push({
      page: { url, savedAs: 'adopted/' + f.replace(/\.json$/, '.html'), pageType: 'article', title: a.title, metaDescription: a.metaDescription, lang: 'en-US', h1: [a.h1], headings, adopted: { source: a.source, file: 'src/content/adopted/' + f }, adoptedRaw: raw },
      seo: { url, finalUrl: url + '/', status: 200, title: a.title, metaDescription: a.metaDescription, metaRobots: '', canonical: url + '/', lang: 'en-US', openGraph: {}, twitter: {}, jsonLd: [], jsonLdTypes: [] },
      path: '/' + own + '/',
    });
  }
  return out;
}

/* a redirect page for hosts with no redirect file: noindex, canonical to the new URL, meta refresh + location.replace */
export function redirectPage(fromOwn, toOwn, origin) {
  const depth = fromOwn.split('/').filter(Boolean).length;
  const rel = '../'.repeat(depth) + (toOwn ? toOwn + '/' : '');
  const abs = origin + '/' + (toOwn ? toOwn + '/' : '');
  return '<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"><title>Moved</title>'
    + '<meta name="robots" content="noindex, follow"><link rel="canonical" href="' + abs + '">'
    + '<meta http-equiv="refresh" content="0; url=' + rel + '">'
    + '<script>location.replace(' + JSON.stringify(rel) + ' + location.hash)</script></head>'
    + '<body><p>This page has moved to <a href="' + rel + '">' + abs + '</a>.</p></body></html>\n';
}
