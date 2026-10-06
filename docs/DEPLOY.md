# Deployment: Riverside Family Eye Care, "Riverlight" redesign

Everything here is derived from files in this workspace. When a number below changes, re-run the command that
produced it; do not edit the number by hand. Open decisions that block a launch are in `docs/OPEN-DECISIONS.md`.

## Target

`dist/` is a static site: HTML, CSS, JS, images, fonts and video files only. There is no server code, no database and
no runtime dependency, so any static host works. Use one that applies redirect rules and response headers:
- Netlify or Cloudflare Pages: the build writes `dist/_redirects`, which both read natively.
- Apache: the build writes `dist/.htaccess` (`ErrorDocument 404` plus `RedirectMatch 301` lines).
- nginx: translate `audit/redirects.json` into `return 301` locations, and set `error_page 404 /404.html`.
- GitHub Pages works for previews only. It ignores `_redirects` and headers, and the preview must stay
  `noindex, nofollow` (see Post-deploy verification).

The site belongs at the domain root, `https://www.riversidefamilyeyecare.com/`. Every internal URL in the pages is
page-relative, so the build also works from a subfolder. The exception is `dist/404.html`, whose 36 URLs are
root-relative, because a host serves the 404 page at any missing depth. For a subfolder deploy, build with `RFEC_BASE`
(see Build). Leaving the root default is an operator decision (OPEN-DECISIONS, item D7).

## Build

```bash
node src/build.mjs                          # wipes and rebuilds dist/ and the audit/ build reports
RFEC_DIST=<dir> node src/build.mjs          # builds into another directory and writes no audit/ reports
MSYS_NO_PATHCONV=1 RFEC_BASE=/sub/ node src/build.mjs   # a build whose 404 page works under /sub/ (Git Bash needs the prefix)
node tools/run-gates.mjs                    # the content, link, image, SEO and decontamination gates (exit 1 on any FAIL)
```

**Requirements**
- Node 24 with built-in modules only; `cwebp` and `webpmux` (libwebp); `ffmpeg` and `ffprobe`.
- Encoded images are cached in `tmp/build-cache/`, so a rebuild re-encodes nothing. Two builds are byte-identical.

**Inputs**
- `audit/raw/` (the untouched crawl), `audit/*.json`, `assets/` and `src/`.
- `assets/` is 131 MB (`du -sm assets`, 2026-10-02). Most of it is the three practice videos (63,238,862 bytes, about
  63.2 MB) and the source images.

## DNS and redirects

The source answered 16 old alias URLs with a redirect to a live page. The crawl recorded each alias and its target
(`audit/site-inventory.json` stores the aliases as bare strings, summarised in `tmp/evidence/alias-redirects.json`) but
not the status code of those redirects: SITE-ARCHITECTURE.md marks the 301 as UNVERIFIED, and the only recorded chains are
the landing pages' own trailing-slash 301s (QA round 1, CONTENT-15). The build serves every alias as a single 301 to the
same target, in `dist/_redirects`, `dist/.htaccess` and `audit/redirects.json`. Nothing else is redirected. The status
column below is what this build serves.

| from (with or without trailing slash) | to | status |
|---|---|---|
| /appointment-request-form/ | /contact-us/appointment-request-form/ | 301 |
| /new-patient-information/ | /contact-us/appointment-request-form/ | 301 |
| /eyeglasses-contacts/contact-lenses/ | /contact-lenses/ | 301 |
| /eyeglasses-contacts/eyeglasses/ | /eyeglasses/ | 301 |
| /eye-emergencies-pink-red-eyes/ | /eye-care-services/eye-emergencies-pink-red-eyes/ | 301 |
| /pediatric-eye-exams/ | /eye-care-services/eye-exams/pediatric-eye-exams/ | 301 |
| /your-eye-health/protecting-your-eyes/ | /eye-care-services/ | 301 |
| /eye-care-services/management-of-ocular-diseases/glaucoma-testing-treatment/ | /eye-care-services/management-of-ocular-diseases/glaucoma/ | 301 |
| /eyeglasses-contacts/eyeglasses/designer-frames/ | /riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/ | 301 |
| /eyeglasses-contacts/eyeglasses/prescription-eyeglasses/ | (same visual-hygiene post) | 301 |
| /eyeglasses-contacts/eyeglasses/specialty-eyewear/ | (same visual-hygiene post) | 301 |
| /eyeglasses-contacts/eyeglasses/lens-treatments/uv-protection/ | (same visual-hygiene post) | 301 |
| /eye-care-services/eye-conditions/dry-eye-disease-and-treatment/ | (same visual-hygiene post) | 301 |
| /eye-care-services/management-of-ocular-diseases/cataract-surgery-co-management/ | (same visual-hygiene post) | 301 |
| /your-eye-health/protecting-your-eyes/protecting-your-eyes-from-glare/ | (same visual-hygiene post) | 301 |
| /contact-us/patient-forms/new-patient-information/ | (same visual-hygiene post) | 301 |

The last 8 rows send old library URLs to one unrelated blog post, exactly as the live site does. Closer targets exist
for several of them; for example, `/eyeglasses/designer-frames/` exists. Retargeting them is the practice's decision
(OPEN-DECISIONS). Until then, the build reproduces the live behaviour.

**DNS:** point the apex and `www` at the new host, and keep `www` canonical. Every page's `rel=canonical` uses
`https://www.riversidefamilyeyecare.com/...`, as on the live site. Issue HTTPS before the switch.

## Headers

Recommended for production; none is optional:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: (computed, see below)
```

The Content-Security-Policy is computed from what the built site actually loads: `node tools/csp-hosts.mjs --dir dist
--json audit/csp.json`. The tool's own control (`--control`) proves that it reports an external script, a frame, an
inline style and an inline script.

On the Riverlight build (QA round 1, 2026-10-02; CONTENT-11: the pre-theme policy printed here before blocked the
theme's inline script on 149 pages and its style attributes on 21) it reports:
- third-party frames from `https://www.google.com` (the keyless Maps embed, 2 pages) and
  `https://www.youtube-nocookie.com` (one video, 1 page);
- no third-party script, style, font, image or connection;
- one inline script on every page, `document.documentElement.classList.add('js')` (allowed by its hash), and 21 `style`
  attributes (`--obj-pos` on the eye-care-services title arches), which need 'unsafe-inline' in `style-src`.

The policy (the tool's output for this build; `connect-src` no longer lists `http://www.w3.org`, the SVG namespace
name in site.js, which is never fetched: the tool skips XML namespace URIs since QA round 1):

```
default-src 'self'; script-src 'self' 'sha256-Du+OJKJSbdUgz5nrHeWWINvez6XKDDU/tyj/5c2uvwo='; style-src 'self' 'unsafe-inline';
img-src 'self' data:; media-src 'self'; font-src 'self'; frame-src https://www.google.com https://www.youtube-nocookie.com;
connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self';
upgrade-insecure-requests
```

Re-run the tool on the final build and paste its output here before launch: a change to the inline script changes its
hash, and every theme change can add an inline style attribute or a host.

**Caching** (QA round 1, PERF-13: only files whose name carries a content hash can be cached immutably; a re-encoded
loop or font under the same name would never reach a returning visitor)
- The fingerprinted CSS and JS (`theme/riverlight.<hash>.css`, `theme/site.<hash>.js`) and the images under `img/`
  (`<name>.<10 hex>.<ext>`) can be cached for a year with `immutable`.
- The fonts (`theme/fonts/*.woff2`), the hero loop and its posters (`theme/media/*`), the practice videos (`media/*`) and
  the favicons keep fixed names: cache them with revalidation (for example `max-age=86400`, or `no-cache` with an ETag).
- HTML should use a short `max-age`, or `no-cache`.

**Compression** (required; QA round 1, PERF-2 and PERF-3). Serve HTML, CSS, JS, SVG, XML, JSON and TXT compressed
(`Content-Encoding: br` or `gzip`, with `Vary: Accept-Encoding`). The budgets of DESIGN-SPEC 7 are transfer sizes and
assume it: the stylesheet is 103,665 bytes on disk and 20,780 gzipped (level 6), the script 28,196 and 9,764, a page's
HTML 22-68 KB and 5-15 KB (mobile optimisation, BUILD-NOTES 15.2, 15.3 and 15.4). Images, fonts and video are compressed formats already: do not gzip them. The local
`tools/serve.mjs` does not compress, so its byte counts are upper bounds (DESIGN-SPEC 7, Measurement).

## Forms

The source has 2 Gravity Forms, plus a search form on most pages (`audit/architecture.json` `formsByAction`,
`docs/SITE-ARCHITECTURE.md` section 7):
- `/contact-us/appointment-request-form/` (form 9, 5 required fields; "Reason for Appointment" has 5 options);
- `/contact-us/contact-form/` (form 10, 2 required fields).

Both render with every field, label, option and required mark from the source. They are **not connected, and inert**
(`data-needs-backend="form endpoint"`, `method="dialog"`, no `action`; QA round 1, CONTENT-1): the browser still checks
the required fields, and a valid submit then sends nothing and keeps every typed value, with or without JavaScript. A
`dialog` form outside a `<dialog>` ends its submission after the `submit` event, and `src/theme/site.js` also cancels
that event on every form that carries `data-needs-backend`. No notice is shown, because none is authored yet
(`src/content/chrome.json` `notice` is null; OPEN-DECISIONS A.5, Q8). Measured in QA round 1: on the frozen snapshot
(`method="post"`) a valid submit POSTed every field to the page's own URL and the page came back with every field
empty; on this build it sends no request and keeps all 7 (appointment) and 6 (contact) typed values, scripts on or
off. The source's invisible reCAPTCHA and honeypot fields are not reproduced as visible fields.

Before launch, connect them to an endpoint the practice controls: a form service, a serverless function, or the
practice's patient system. Then set `action` and `method="post"` in `src/lib/forms.mjs`, drop `data-needs-backend`
there (site.js cancels the submit of any form that still carries it) and rebuild. If the requests carry health
information, the endpoint must meet the practice's HIPAA obligations (`docs/OPEN-DECISIONS.md`).

## Third parties that remain

- **Google Maps:** a keyless embed only on `/hours-location/` and `/location/riverside-family-eyecare/`. Elsewhere it
  is a static "Open in Google Maps" card (DESIGN-SPEC Q-11).
- **YouTube:** one embed, served from `youtube-nocookie.com`, on the eye-emergencies page. Since QA round 1 (fix-2,
  PERF-6) the page prints its address as `data-src` and site.js sets `src` once the frame is within 600 px of the
  viewport, so nothing is requested from YouTube at page load (measured: 0 of 18 page loads at 9 window sizes, against 8
  of 18 with the browser's own `loading="lazy"`, which reaches about 2,500 px below the fold). Without JavaScript a
  `noscript` copy loads the plain lazy iframe.
- **Practice videos:** three self-hosted MP4 files (63,238,862 bytes in total), loaded with `preload="none"`. They have no captions,
  which WCAG AA requires (OPEN-DECISIONS).
- **Cherry:** not loaded. Outside the platform the widget's mount points stay empty, its API calls fail and it loads
  Segment analytics. `/cherry-payment-plan/` links to Cherry instead, which needs the practice's Cherry application URL
  (OPEN-DECISIONS).
- **No analytics or tag manager is included.** Add the practice's own analytics deliberately, if wanted, and widen the
  CSP for it.

## Indexing

- 23 pages carry `noindex` exactly as on the live site: 17 archives and the 6 `/template/*` platform pages, plus
  `404.html`.
- `sitemap.xml` lists 117 URLs: every indexable page whose canonical is itself. The other 8 indexable pages
  (`/location/riverside-family-eyecare/` and 7 staff pages under `/team/`) declare another page as canonical, as on the
  live site (for example `/team/heather/` points to `/the-staff/`), so they are left out.
- `robots.txt` allows everything and points at the sitemap. The live site's `Disallow` lines covered WordPress admin
  paths (`/wp-admin/`, `/wp-login.php`, ...) that do not exist in this build.
- **Any preview copy must be `noindex, nofollow` on every page, with a disallow-all `robots.txt`, so it never competes
  with the live site.**

## Post-deploy verification

```bash
node ~/.claude/skills/site-reforge/scripts/sr-parity.mjs --project . --new <deployed mirror or dist>
node ~/.claude/skills/site-reforge/scripts/sr-decontaminate.mjs --project . --dir <deployed mirror or dist> --strict
node tools/crawl-preview.mjs --base <deployed URL> --pages-from dist --concurrency 2 --delay 300
node tools/noindex-live-check.mjs --base <preview URL> --from <preview dir>      # previews only
```

Then check by hand:
- Request each of the 16 old URLs and confirm one 301 hop to its target.
- Request a missing URL at depth 3 and confirm a 404 status that renders the styled 404 page.
- Submit both forms to the connected endpoint.
- Watch the hero video start only after load, and never under reduced motion or Save-Data.
