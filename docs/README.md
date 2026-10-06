# Riverside Family Eye Care, "Riverlight" redesign: developer README

A total visual redesign of `https://www.riversidefamilyeyecare.com/`, the site of Riverside Family Eye Care (Fort Myers, FL), which runs on
WordPress through the EyeCarePro platform. It was produced with the site-reforge skill in its **REFORGE lane**: the
site's structure, every page at its live URL and every word of copy are kept; the design is new.

## At a glance

- **Pages:** 149 HTML files in `dist/` (the crawled pages at their live paths, plus `404.html`).
- **Design:** "Riverlight Aurora" (`docs/DESIGN-SPEC.md`): the logo's teal-over-navy wave grown into a river of
  light that runs through every page, with layered depth, images that break their frames and cross section edges,
  scroll-driven motion and hover effects, all honouring `prefers-reduced-motion`.
- **Copy:** every word kept (see the verification record below).
- **Imagery:** every real photograph of the practice is kept. 19 generated stills (fal.ai) and
  1 generated motion clip (Higgsfield) were added as illustrative industry imagery, each AI-labelled;
  none depicts the practice's people, patients, office or results (`docs/CHANGE-LOG.md`, Imagery).
- **Gate:** 16 PASS · 6 FAIL · 7 UNPROVEN (`audit/gate.json`, 2026-10-06T06:51:28.653Z).

## Verification record

Each number is read from the report file named beside it, produced by `node tools/run-gates.mjs` on the current
`dist/`; every one of those tools proves it can fire on a planted defect before it reports a zero.

| check | result | report |
|---|---|---|
| Sentence parity (every source sentence of 5+ words, verbatim) | 5426 of 5617 found on their rebuilt pages; 146 only in the source's own chrome; 45 declared removals; 0 lost | audit/sentence-parity.json |
| Short text (dates, phones, emails, prices, form labels and options, CTAs, short headings) | 813 of 815 found; 2 declared; 0 missing | audit/short-text-parity.json |
| Words added (anything visible that is not source copy, chrome or a declared label) | 0 added words and 0 added glyphs across 148 pages (102222 visible words) | audit/words-added.json |
| Tag balance (every element closed in order) | 0 unbalanced of 149 pages | audit/tag-balance.json |
| Links (every local href/src/srcset resolves; no root-absolute URL outside 404.html) | 0 broken of 12382 local references in 150 files | audit/link-check.json |
| Images kept (every source image of a page is on its rebuilt page) | 236 of 239 present; 3 declared; 0 missing | audit/keep-image-parity.json |
| SEO head vs the source (title, description, canonical, robots, h1) | title 131 same / 17 repaired / 0 mismatch; description 130 same / 18 repaired / 0 mismatch; canonical 131 same / 17 repaired / 0 mismatch; robots 148 same / 0 repaired / 0 mismatch; h1 141 same / 7 repaired / 0 mismatch; 23 noindex pages | audit/seo-parity.json |

## Run it locally

```bash
node tools/serve.mjs --root dist --port 8795 --no-open
# then open http://127.0.0.1:8795/
```

Every internal URL is page-relative, so the folder also works from a subfolder (except `404.html`, by design:
`docs/DEPLOY.md`). Opening `dist/index.html` straight from disk does not work for the video and fonts; serve it.

## Build

```bash
node src/build.mjs                 # wipes and rebuilds dist/ (and the audit/ build reports)
RFEC_DIST=<dir> node src/build.mjs # build elsewhere, no audit/ writes
node tools/run-gates.mjs           # content, links, images, SEO, decontamination (exit 1 on any FAIL)
sh tmp/final-chain.sh              # the full verification chain, about 30-40 minutes
```

Needs Node 24 (built-ins only), `cwebp` + `webpmux` and `ffmpeg` + `ffprobe`. Two builds are byte-identical.

## Structure

| path | what |
|---|---|
| `src/build.mjs` | the build orchestrator (pages, head/SEO, images, sitemap, redirects, audit reports) |
| `src/lib/` | `content.mjs` (sanitiser, extractors), `page-model.mjs` (one JSON model per page), `forms.mjs`, `seo.mjs`, `images.mjs`, `templates.mjs` + `home.mjs` (the Riverlight theme) |
| `src/styles/tokens.css` | measured source tokens (evidence), then the Riverlight tokens below the REDESIGN TOKENS marker; change values here, never at a call site |
| `src/styles/riverlight.css`, `fonts.css`, `motion.css` | the theme; `motion.css` keeps the source keyframes verbatim as evidence and ships only its redesign layer |
| `src/theme/` | the theme script, self-hosted fonts and theme images |
| `src/content/` | `chrome.json` (menus, NAP, hours), `site-map.json`, `image-plan.json`, `motion-plan.json` |
| `assets/source/` | the original images downloaded from the live site |
| `assets/generated/`, `assets/media/` | the accepted generated images and the hero motion; rejected versions are archived, never deleted |
| `dist/` | the built site that ships |
| `docs/` | this directory |
| `audit/` | inventories, reports and the gate record |
| `tools/` | the verification tools (each with its own positive control) |

## Before you change anything

Read `docs/CHANGE-LOG.md` (every section of the old site has a recorded decision), `docs/COMPONENTS.md` (the
markup and script contract), `docs/DESIGN-SPEC.md` (the design) and `docs/BUILD-NOTES.md` (the pipeline, the page
model contract and the verification record). After any change run `node tools/run-gates.mjs`.

## Known open items

**Gate checks that are not PASS:**

| check | status | label | evidence |
|---|---|---|---|
| C06 | FAIL | SEO inventory captured | 4 source page(s) had no title |
| C07 | FAIL | Image inventory completed with real dimensions | 1 same-origin image(s) never downloaded |
| C14 | FAIL | Every source section has a change-control decision | 739 of 739 rows still UNSET |
| C15 | FAIL | Required narrative slots are filled | unmapped: value-proposition, trust-positioning, benefits-solution, strategic-cta, footer |
| C16 | UNPROVEN | Every source page exists in the rebuild | audit/parity-report.json absent — run sr-parity.mjs |
| C17 | UNPROVEN | Content survived the rebuild | audit/parity-report.json absent |
| C18 | UNPROVEN | SEO survived the rebuild | audit/parity-report.json absent |
| C19 | UNPROVEN | Forms and contact details are intact | audit/parity-report.json absent |
| C22 | UNPROVEN | Design matches the source pixel-for-pixel at every breakpoint | audit/pixeldiff-report.json absent — run sr-pixeldiff.mjs |
| C23 | UNPROVEN | Responsive swept at every configured breakpoint | audit/sweep-findings.json absent — run sr-sweep.mjs --collect |
| C24 | FAIL | Recorded failures are all resolved or accepted | 38 unresolved failure(s): assets:image |
| C28 | FAIL | Every rebuilt section names a preset that exists | 464 section(s) the matcher could not decide and nobody answered — see audit/preset-match.json |
| C29 | UNPROVEN | SEO emitted and derivable fields repaired | audit/seo-report.json absent — run sr-seo.mjs |

**Decisions for the practice:** `docs/OPEN-DECISIONS.md` (9 numbered decisions and 62 table rows), including the five
staff portraits the CDN refused (honest placeholders until the practice supplies the photos), the licence of the
syndicated library articles, the form endpoint, the Cherry application URL and the video captions.
