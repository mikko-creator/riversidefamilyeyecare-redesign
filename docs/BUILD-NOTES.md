# Build notes: the Riverside content pipeline (`src/build.mjs`) and the Riverlight Aurora design theme

Written by the port agent, 2026-10-01. This workflow ports the CONTENT PIPELINE only. The reference rebuild "R"
(another practice on the same EyeCarePro platform, named in `docs/PORT-NOTES.md`) was forked and every item of
`docs/PORT-NOTES.md` was applied. Page assembly is now an explicit **page model** (section 5), which is the contract
the design templates consume. Every page renders on a neutral **SCAFFOLD** theme: `src/lib/templates.mjs`,
`src/lib/home.mjs` and `src/styles/scaffold.css`, each marked SCAFFOLD. The design build replaces those three files
and nothing else. Every number in section 6 comes from the command named beside it, run on the final tree (`dist/`
aggregate sha256 `ef842240bbb54a21...`, after fix round 2, section 10; round 1 is section 9).

**wf5b (2026-10-02), section 11.** The pipeline stage of the design build added the DESIGN-SPEC 4.3 additions the
templates need: P1 width variants and `srcset` on every image object, plus the home hero's 4:3 `crop`; P2 the theme
(one fingerprinted stylesheet from the shipped layers, one fingerprinted script, fonts and stills, the hero loop), with
the SCAFFOLD kept until `src/styles/riverlight.css` exists; P3 byte-identical logos; P4 `model.art` on all 149 models;
P7 the AI label on every generated encode. It also closed COMPONENTS gaps I.3-I.7, I.11, I.12 and I.15 and the three items
the port's last verifier left open (R3-1 to R3-3). P5 and P6 (optional) were not done (section 11). The scaffold build
after wf5b is `dist/` aggregate `3f1fd991bf47f0a3...` (400 files). Every gate number of section 6 is unchanged except
the documented additions of section 11.

**Design build (2026-10-02), section 12.** The styles, script and template stages replaced the SCAFFOLD with the
Riverlight Aurora theme (`docs/COMPONENTS.md` is its binding markup contract), and the integrate stage built the pieces
into one site, looked at it, probed it in a browser and fixed what it found at the source. The SCAFFOLD is retired:
`RFEC_THEME=scaffold` stops the build. Section 12 lists the files, the integrate stage's decisions and every verification
number with its command; `dist/` is now 754 files. The sections before 12 describe the pipeline as the port and wf5b
left it, with their own (scaffold-era) numbers.

## 1. Run it

```
node src/build.mjs                       # -> dist/ (wiped and rebuilt) + the audit/ reports of section 2
node src/build.mjs --dump-models         # the same, plus every page model in tmp/page-models/<slug>.json
RFEC_DIST=tmp/repro/a node src/build.mjs # -> any other directory; no audit/ report is written
RFEC_DIST=tmp/sub/preview RFEC_BASE=/preview/ node src/build.mjs   # a subfolder deploy (D7): only the 3 host-level files change
RFEC_THEME=scaffold node src/build.mjs   # RETIRED (section 12): stops the build with a message
node tools/run-gates.mjs                 # the 12 gates of section 6, one line each; exit 1 if any fails
node tools/write-site-map.mjs            # regenerates src/content/site-map.json from audit/architecture-map.json
node tools/licence-overlap.mjs --ref <R>/audit/raw   # content-licence evidence (docs/OPEN-DECISIONS.md C)
```

Browser checks run one headless Chrome at a time, via `tools/cdp.mjs`:

1. Start the server in the background: `node tools/serve.mjs --root dist --port 8795 --no-open`. Add
   `--not-found 404.html` to answer every miss with that page and status 404, the way static hosts serve it.
2. Run the check: `node tools/render-check.mjs --base http://127.0.0.1:8795 --widths 1280,390 --control --paths /,/contact-us/ --out tmp/render.json`.
3. Stop the server by the PID that listens on that port.

**Requirements.** Node builtins only, plus `cwebp` and `webpmux` on PATH (or `$CWEBP`, `$WEBPMUX`).
- `webpmux` runs for every image that carries an AI-provenance label: since wf5b (P7), every encode of a generated
  image (17 masters, 119 files). A generated image never ships without its label: with no encoder the build throws.
- ffmpeg and ffprobe are not used (P6 was not done). The 3 videos are copied as harvested.

**Image cache.** Every encode lands in `tmp/build-cache/img/` as `<source base name>.<first 10 hex of sha1(bytes +
encode settings)>.webp`. The settings include the max width, the quality, the AI label (P7), the crop rectangle (P1)
and the alpha quality when it is not 90. GIFs are copied as `<name>.<sha1 of bytes>.gif`, and the two logos as
`<name>.<sha1 of bytes>.png` (P3, byte-identical). A rebuild therefore re-encodes nothing, and a changed source or
setting gets a new name. Since wf5b the cache also holds the P1 width variants (they keep their source's base name),
the hero crop and the generated images (`gen-<plan id>.<key>.webp`). A cold-cache build was measured byte-identical
before round 1 (section 6) and again after wf5b, when all 612 files were re-encoded identically (section 11).
A cached file reaches `dist/img/` only when a rendered page names it (section 2, step 4b).

**Exit code.** The exit code is 1 whenever a build failure is recorded (`audit/build-report.json` `failures`). The
build never writes `audit/failures.json`, which is stage evidence (section 7).

**Environment.**

| variable | effect |
|---|---|
| `RFEC_DIST` | output directory; no audit/ writes |
| `RFEC_CHERRY` | `link` (the default) or `embed`; see docs/OPEN-DECISIONS.md A.4 |
| `RFEC_CHERRY_URL` | the Cherry application URL; used only when it starts with `https://` |
| `RFEC_BASE` | the deploy base of the 3 host-level files (`404.html`, `.htaccess`, `_redirects`): `/` (the default, the domain root) or a subfolder such as `/preview/`. It must start and end with `/`, or the build stops. In Git Bash set `MSYS_NO_PATHCONV=1`: a leading-slash value is otherwise rewritten to a Windows path, which the build rejects. `tools/link-check.mjs` reads the same variable |
| `CWEBP`, `WEBPMUX` | encoder paths |
| `RFEC_THEME` | wf5b (P2); since the design build (section 12) only unset or `riverlight`: the design theme, and a theme root without `riverlight.css` fails closed. `scaffold` is RETIRED and stops the build (COMPONENTS I.72): the templates print theme files a scaffold build never shipped |
| `RFEC_THEME_ROOT` | wf5b (P2), tests only: read the theme from `<dir>/styles/` and `<dir>/theme/` instead of `src/` (a fixture theme; section 11) |

**Output (400 files with the SCAFFOLD; section 11 lists the design theme's).**

| output | contents |
|---|---|
| `dist/<path>/index.html` | all 148 crawled pages; the home is `dist/index.html` |
| `dist/404.html` | noindex; its URLs are root-relative under the deploy base (`rootRelative()` in build.mjs, `RFEC_BASE`, default `/`) because hosts serve it at the failing path, at any depth |
| `dist/sitemap.xml` | 117 indexable, self-canonical URLs |
| `dist/robots.txt` | robots file |
| `dist/_redirects` | each of the 16 live aliases, with and without its trailing slash |
| `dist/.htaccess` | `ErrorDocument 404 /404.html` plus the same 16 aliases as `RedirectMatch 301` (every path under the deploy base) |
| `dist/styles/scaffold.css` | the scaffold stylesheet (scaffold mode only; the design theme ships `dist/theme/**` instead, section 11) |
| `dist/img/` | 240 files: 231 WebP, 2 PNG (the two logos, byte-identical, P3), 7 GIF. Only files a rendered page names: the scaffold renders no `srcset` and no `model.art`, so none of their files ship yet |
| `dist/media/` | the 3 harvested mp4 files, 63,238,862 bytes |
| `dist/favicon-32.png`, `dist/favicon-192.png`, `dist/apple-touch-icon.png` | the source's own site icons |

Every internal URL is page-relative (`../` x depth + `path/index.html`), so `dist/` works from any subfolder. The one
exception is `dist/404.html` (36 root-relative URLs). A host serves that file at the failing request's own path, at
any depth, so no page-relative URL can work in it: its URLs must name the deploy base, which is known only at build
time. The default build assumes the domain root. Served from a subfolder, its 404 page loses its stylesheet, favicons
and logo (4 failed requests, section 6 row 16). `RFEC_BASE=/sub/` builds for a subfolder deploy, and only `404.html`,
`.htaccess` and `_redirects` change (section 10, D7). Which base to deploy to is an operator decision
(docs/OPEN-DECISIONS.md B).

## 2. Files

| file | role |
|---|---|
| `src/build.mjs` | Orchestrator: image map (with the refused-file rules), helpers, one model per page, render, static assets, prune, sitemap/robots, redirects, the audit/ reports (incl. `audit/clone-removals.json`). wf5b (section 11): P1 variants and the hero crop, P2 the theme (fingerprinted bundle and script, theme files, the hero loop; the scaffold until `riverlight.css` exists), P3 lossless logos, P4 the image plan (`model.art`, built after every model exists), P7 labels, I.6, `images.added`; pages are built in three passes (models, art, render) |
| `src/lib/page-model.mjs` | NEW. The page model (section 5) and its closed vocabularies: `BLOCK_TYPES`, `SECTION_KINDS`, `IMAGE_ROLES`, `EMBED_KINDS`, `DECLARED_KINDS`. Round 2: the decision for each source JSON-LD block (R2-2), no derived description on `/template/*` pages (R2-3), child-page thumbs keep their source alt (R2-1). wf5b: `srcset` on every image object, `crop`, `superseded`, `head.scripts`, and `artOf()` / `anchorIndex()` (model.art; every plan anchor is checked against the model) |
| `src/lib/content.mjs` | R's sanitiser and helpers (rules unchanged) plus the Riverside `prepare()` lifts (section 3). wf5b R3-1: `sanitize` closes an open `<p>` at a `<p>` start tag, as the HTML parser does (section 11) |
| `src/lib/forms.mjs` | R's Gravity Forms parser plus `select`, `date` and `captcha` branches. Emits inert form markup (`data-needs-backend`) |
| `src/lib/seo.mjs` | R's robots merge, titles, descriptions and canonicals. MOVED comes from the live aliases. Riverside JSON-LD. Round 2: the page's own source JSON-LD (`sourceStructuredData`, `carryBlogPosting`, `faqShown`, R2-2), and a link-only block never qualifies for a derived description (`isLinkOnly`, R2-3) |
| `src/lib/images.mjs` | R's cwebp/webpmux encoder and cache. The code was identical to R's (a `diff` showed 13 changed lines, all comments). wf5b: `crop` (cwebp `-crop`, in the cache key), `variants()` (P1), per-kind counters (`stat`), and a hard error for a crop or an AI label on a file cwebp cannot encode. Every earlier cache key is unchanged |
| `src/lib/util.mjs` | R's helpers, plus the 5 entities PORT-NOTES 2.6 names (`dagger`, `Dagger`, `le`, `sect`, `para`) and `ge`, plus `innerOf`, `attrOf`, `sha256` |
| `src/lib/templates.mjs` | Riverlight templates (the design build; COMPONENTS A-G): page shell, chrome, title band, the article and hub frames, every block type, aside, the river routes. It was the SCAFFOLD until the templates stage |
| `src/lib/home.mjs` | Riverlight home (COMPONENTS B.4-B.18): the model's 16 sections in live order and the home river route table |
| `src/styles/scaffold.css` | the SCAFFOLD stylesheet: RETIRED, never shipped since the design build (section 12) |
| `src/styles/{tokens,fonts,riverlight,motion}.css`, `src/theme/site.js`, `src/theme/fonts/*` | the Riverlight theme (section 12.1) |
| `src/content/site-map.json` | NEW. The 14 template families (from `audit/architecture-map.json`), menus and artefacts. Written by `tools/write-site-map.mjs` |
| `src/content/chrome.json` | Chrome data from the facts stage. Only its documentation fields were reworded here (section 7) |
| `tools/sentence-parity.mjs` | ADAPTED (PT-1): tags stripped before splitting, `<option>` units, per-page occurrence check, page-scoped declarations, declared replacements. 2 controls |
| `tools/short-text-parity.mjs` | NEW. Checks dates, phones/fax, emails, prices, form labels/options/hints, CTA labels, page-menu labels and short headings. Only copies of the site menus are excluded (round 1, D6). 2 controls: a planted deletion and a planted menu-label deletion |
| `tools/keep-image-parity.mjs` | NEW. Every KEEP image of a page is on its rebuilt page or declared. It reads `<img src>`, `<source srcset>` and `poster`. Control. Round 2 (R2-1) adds **alt fidelity**: every `<img>` of `<main>` carries the alt its source page gives that file (a sibling stand-in answers for its original), or `""` when that is a declared blank (`images.altsBlanked.onPages`) or a section background. Control: one readable alt blanked in memory |
| `tools/seo-parity.mjs` | NEW. Title, description, canonical, robots (raw merge) and h1, per page. Control. Round 2 adds **derived-description provenance** (R2-3: a derived description starts one non-link-only block of `<main>`; a `/template/*` page has none) and **structured data** (R2-2: every source JSON-LD block is replaced, carried with every value equal to the source's or to a declared repair, or declared REMOVE and absent). Controls: a link-only and a template-page description; a dropped BlogPosting, a changed headline, a planted FAQPage; each kind of REMOVE declaration withdrawn (a parseable FAQPage, an unparseable VideoObject) |
| `tools/heading-parity.mjs` | NEW (round 2, R2-4). Every heading of each raw content region keeps its level on the rebuilt page; the only documented exception is HD-1 (a source h1 other than the page's own becomes h2). Findings: `level`, `not-a-heading`, `absent`. 2 controls: one h2 demoted to h3, one turned into a `p` |
| `tools/words-added.mjs` | NEW. No visible word or glyph appears from nowhere (fabrication check; glyphs added in round 1, D8). 2 controls: a planted sentence and five planted "★" |
| `tools/model-check.mjs` | NEW. Every page model against section 5: keys and types, closed vocabularies (incl. `DECLARED_KINDS`), family, page-relative URLs, image refs. Round 1 added: no void end tag in any html field (D1), the breadcrumb invariant (D2), `chrome.mobile` with a shipped logo (D4), and every `droppedOnPages` entry declared in its page model (D5). Round 2 added: every `structured-data` declaration agrees with `jsonLd['@graph']`, every graph node other than Organization / Optometric / BreadcrumbList is declared carried, and `head.jsonLdHtml` holds exactly `jsonLd` (R2-2). 4 controls. `--models <dir>` checks another model set |
| `tools/link-parity.mjs` | NEW (round 1, D2/D3/D6). Every link of each raw content region survives in the rebuilt `<main>`: external hrefs verbatim, internal targets by own path. Exempt by rule: `javascript:`, `#`, an empty `tel:`. Exempt if dead or declared. 2 controls |
| `tools/residue-grep.mjs` | NEW. No string of R's practice in src/, dist/, tools/, facts/ or these two docs. 2 controls |
| `tools/hashdir.mjs` | NEW. Aggregate sha256 of directory trees (reproducibility). Control |
| `tools/render-check.mjs` | NEW. Headless Chrome (one browser, via `tools/cdp.mjs`): JS errors, failed requests, horizontal overflow, h1 count, broken images, and the Cherry probe (`--cherry`). Control |
| `tools/licence-overlap.mjs` | NEW. Verbatim overlap with R's crawl, for the content-licence question |
| `tools/run-gates.mjs` | NEW. Runs every gate (12) |
| `tools/tag-balance.mjs`, `tools/link-check.mjs` | R's tools with the env var renamed to `RFEC_DIST`. The link-check 404 control now plants the stylesheet this build ships (wf5b: under `styles/` or `theme/`, so it also fires on a design-theme build). tag-balance also reports an end tag of a void element (`void-close`, round 1, D1), with its own control. Round 2 (D7): link-check reads `RFEC_BASE`; in `404.html` a root-relative URL outside the base is a finding (`outside-base`, with its own control whenever the base is not `/`) |
| `tools/serve.mjs` | The site-reforge static server (`sr-serve`). Round 2 (D7): `--not-found <file>` answers every miss with that page and status 404, as static hosts serve `404.html` |
| `docs/OPEN-DECISIONS.md` | NEW. Every default the operator can change, with its evidence, and the content-licence question |

**Reports from the canonical build:**

| report | contents |
|---|---|
| `audit/build-report.json` | stats, links moved/dead, seo counts (round 2: `descriptionsNotDerived`, `structuredData` by type and decision), the deploy `base`, failures. wf5b: `images.copiedLossless`, `images.variants`, `images.crop`, `images.art` (counters, labelled files, masters), `images.fromCacheAfterRender`, `theme` (mode, stylesheet, script, files, media), `art` (titles by id, inline, home, declared blanks), `content.paragraphsClosedByP` |
| `audit/build-pages.json` | per page: path, family, layout, noindex, robots, title, h1 and its source, description source, canonical, aside variant, section and block counts, images, placeholders, embeds |
| `audit/clone-removals.json` | every declared removal and replacement. Round 2: one `elements` row per source JSON-LD type and decision (R2-2), and `images.altsBlanked.onPages`, every alt actually blanked, per page (R2-1). wf5b: `images.droppedOnPages` gains the superseded hero phone layer (I.6), `altsBlanked.onPages` the TB-contact arch on `/hours-location/`, and `images.added` lists every image `model.art` adds to a page (section 11) |
| `audit/seo-repairs.json` | titles, canonicals, derived descriptions, h1 labels, noindex. Round 2: `descriptionsNotDerived` (the 6 `/template/*` pages, R2-3) and `structuredData` (one row per page and source block: type, decision, why, and every repair with from / to / why, R2-2) |
| `audit/redirects.json` | the 16 alias redirects |
| `audit/dead-links.json` | dead internal targets and re-pointed alias links |

The gates write `audit/{sentence-parity,short-text-parity,heading-parity,keep-image-parity,seo-parity,words-added,tag-balance,link-check,link-parity}.json`.
`licence-overlap.mjs` writes `audit/licence-overlap.json`. `sr-decontaminate` rewrites `audit/decontamination.json` and
`project.json` `stages.decontaminate`.

No other site-reforge stage file is written. Of these report names, only `clone-removals.json` is also written by a
site-reforge script, and its stage (`clone`) never ran here.

## 3. PORT-NOTES items, as applied

| item | what the port does |
|---|---|
| IN-1 | Inputs exist and are read: `audit/image-classification.json` (its classes and subclasses drive image roles and drops). The logo is `chrome.logo.srcPattern` = `Riverside-Family-Eye-Care-Logo-01`, the source file with no derivative. The scaffold has no plate/alpha treatment, so R's logo-alpha step is not needed |
| CH-1 | All chrome comes from `src/content/chrome.json`. **Header:** top bar, logo, the full menu (6 top-level items, 3 of them with children: 9 child links, nested lists). **Footer:** menu (1 column, 4 links), button, 4 social links by network, the NAP line with its periods and site link, "© 2026", 4 utility links (`/sitemap/` is a real page, so no re-point). **Sidebar:** 2 variants. "standard" (quick actions, social, location widget) appears on 131 pages; "location-page" (quick actions and social only) appears on `/location/riverside-family-eyecare/`. The raw sidebar holds only the search widget (removed, declared) and these text widgets; every word of them is in the rendered aside (checked on 3 pages) |
| MP-1 | Every map uses `chrome.mapQuery` (the Riverside NAP) as a keyless `maps?q=...&output=embed`. It resolves to the right listing (screenshot, section 6) |
| FM-1 | `select` keeps its 5 options verbatim. `date` keeps its placeholder and screen-reader format hint. `captcha` is dropped (never visible), as are the honeypot and Akismet. No notice is authored (chrome `notice` is null). Forms carry `data-needs-backend="form endpoint"`. 2 show-if rules are carried (contact form) |
| LD-1 | JSON-LD is built from chrome.json: Organization + Optometric, plus the page's own BreadcrumbList when its trail has 2 or more segments. There is one OpeningHoursSpecification per interval (Friday has 2), plus `faxNumber` and `email`. `sameAs` lists the 4 networks. Round 2 (R2-2): the page's OWN source structured data is accounted for block by block: BlogPosting is carried into the graph (19 posts, declared repairs), FAQPage (2) and the unparseable VideoObject (3) are removed and declared (decision 11) |
| TM-1 | Every card of every team module is lifted, keyed on the module (13 modules, 22 cards): photo or placeholder, name and link, position, bio or excerpt, Read More. All 3 doctors appear on `/our-eye-doctors/` |
| VS-1 | Location modules are keyed on the module (3 pages): title, every contact type (Phone, Fax, Email with its PHI note), address, map, and hours with one line per interval. On `/hours-location/` the map module and the details module are merged in source order (`order`: map, title, address, contacts, hours) |
| DT-1 | The date is lifted from the single-post module, not from a family table. All 21 blog posts carry it in the title band |
| HD-1 | The page's own h1 is always used. A label is used only when no h1 exists: the Cherry page takes its menu label, the 6 templates take their `<title>`. The testimonial single keeps its own h1. The content's copy of the band h1 is removed once, and other h1s become h2. The home keeps its single h1 in its own row |
| TS-1 | Testimonial cards keep their `ecp-post-title` (text and link) |
| CL-1 | Contact-lens products print the FULL text once (53 products). The truncated excerpt is dropped and declared per page (52 excerpts). The 53 `javascript:` "Read More+" toggles are unwrapped to their words. `localHref` unwraps every `javascript:` href |
| VD-1 | The 3 self-hosted videos are lifted before sanitising. The scaffold renders them as `<video controls>` with the harvested mp4 (`dist/media/`); see decision 3 |
| LK-1 | MOVED = the 16 live aliases (`seo.mjs movedFromAliases`; the build asserts 16). 25 references are re-pointed, and the redirect files carry exactly those 16 |
| RB-1 | No artefact robots change: robots are the raw merge on every page |
| CY-1 | Cherry is lifted as data. The default is link mode, because the standalone test failed (decision 4). The floating estimator is replaced by a local link (`chrome.financing`) |
| HM-1 | R's home composer is dropped. The home is the generic page model with its 16 non-empty rows in live order; row kinds come from `audit/architecture-map.json` (SITE-ARCHITECTURE section 5). `home.mjs` renders them |
| IM-1 / rule 4 | Refused files (audit/failures.json) are never fetched. **13 files** become placeholders: 12 portrait files of 5 people, plus the Bajio campaign image. They render as 11 placeholder slots on 7 pages: `ph-portrait` or `ph-brand`, with the name and `data-needs`. **7 files** are replaced by an on-disk sibling size. **17 files** are omitted: 12 visible stock slots (declared per page) and 5 social-only references |
| SC-1 | Both shortcodes are resolved and declared (`replacements`) |
| PT-1 | `tools/sentence-parity.mjs` is fixed (see section 2) |
| 2.1 | Own host comes from `chrome.origin`, www or bare. `goo.gl` is a social host: the Google icon link of `/winter-dry-eyes-2023/` prints its own aria-label, "Visit us on google", as text. `stripVendorClauses` is kept (6 sentences of `/disclaimer/`, declared). `imgRole` reads the Riverside classes. `dedupeWithinCard` is kept and records every drop (0 on this site). Post lists in summary, grid and list view are lifted. Hours split at `<br>`. R's voice-search label rule is dropped (0 hits here) |
| 2.2-2.6 | forms, seo, images and util, as above |
| 2.7 | R's templates are not used, because the design build owns the look. The SCAFFOLD renders the same data. Favicons are the source's own icons |
| 2.8 | These parts of R's build.mjs are not carried: the theme switch, generated layers, the image plan, brand-name exclusions, cut-outs, bands, rails, nobr wrappers and R's DROP list. They are design or later image-plan work. Row backgrounds become `section.background` on EVERY page (layout-CSS `@media` rules and lazy attributes are both read) |
| 3 (new markers) | Accordion becomes `<details>` (35 items). Video. Gallery (4 tiles; Bajio prints its name). Grid post list. Iconsets (decorative icons dropped, social links labelled; 12 icon links labelled). `ecp-image`. list-team. list-locations. Buttons. DesignerFramesModule and InsurancesModule become logo walls with names (49 items). ReviewsModule becomes reviews (6). contactlens. equipment (9). The sitemap tree. The ecp-html Cherry embed. Callouts as data (54) |

**Deviations from R's robust parts (1 and 2 fail closed; 3 keeps the source's heading levels):**
1. **CTA-button regex.** R's regex consumed an optional trailing `</div>` after a BARE `<a class="ecp-button">` (one
   with no wrapper), deleting the close tag of the module around it. Here that unbalanced the Beaver Builder rows of
   the home: everything after row 3 merged into one section. The wrapper and its `</div>` are now consumed together or
   not at all, and `page-model.mjs` fails the build if `prepare()` changes a page's div balance.
2. **`audit/failures.json`.** R merged `build:*` items into this file. Here it is site-reforge stage evidence, so the
   build neither reads nor writes it (section 7): a refused file is known from `audit/image-inventory.json` (no
   `localFile`) and `audit/image-classification.json`, which the imagery stage wrote from that record (wf5b R3-2: the
   `src/build.mjs` header had listed it as an input).
3. **Heading-run merge (fix round 2, R2-4).** R's `dedupeSections` merges a run of heading-only h2 parts into the next
   part that has a body and wrote the later headings as h3. That changed a source heading's level: "The right fit" on
   `/eyeglasses/kids-optical/` follows the h2 "Choosing Eyeglass Frames for Children:" with no body between them. The
   merge still groups the run, but every heading keeps its source level (h2). `build-report.json` `content.headingRunsMerged`
   is 1 (that page). `tools/heading-parity.mjs` now guards every heading level on every page.

Every lift checks that the data it records carries every word of its module (`accounted()` in `content.mjs`). A lift
that cannot is not made. One callout, on `/contact-us/`, holds the location module (an `ecp-posts-wrapper`) and stays
generic prose (`build-report.json` `lists.liftsSkipped`).

## 4. Decisions

Each decision is also in `docs/OPEN-DECISIONS.md`, with its evidence and how to change it.

1. **Robots.** Every robots meta of the raw head is merged. 23 pages are noindex: 17 archives and 6 templates.
   `/404-page-not-found/` stays `index`, as at source (open: Q7). `dist/404.html` is noindex.
2. **Shortcodes.** `[account get='name']` becomes "Riverside Family Eye Care" on `/`, `/sitemap/` and `/whats-new/`.
   `[location get='city']` becomes "Fort Myers" on `/whats-new/`. Both are declared with the reason "unrendered
   platform shortcode, resolved to the account value it requests".
3. **Videos.** The 3 video modules stay video embeds, as self-hosted `<video>`. The source has no YouTube URL for them,
   so this deviates from "YouTube embeds"; the deviation is stated. Posters were not harvested (declared).
4. **Cherry.** The standalone test failed, so link mode is the default, with `data-needs="cherry application url"` until
   the practice supplies the URL. `RFEC_CHERRY=embed` restores the exact source embed, and changes only
   `dist/cherry-payment-plan/index.html` (section 6). The floating estimator becomes a local link.
5. **Forms.** reCAPTCHA is never visible, and the honeypot and Akismet are dropped. Forms are inert
   (`data-needs-backend`; since QA round 1 `method="dialog"` plus a site.js submit cancel, so nothing is sent and nothing
   typed is lost: section 13). No notice is authored (open).
6. **Doctors.** `/our-eye-doctors/` shows all 3 doctor cards with their bios.
7. **Contact-lens products** print once. The "Read More+" toggles are unwrapped to their words.
8. **Alias links.** The 16 alias links stay links, re-pointed page-relative to the alias's final page, as on the live
   site. 8 of the aliases land on one unrelated blog post, so 12 links go there (open: Q4). Only the 16 source
   redirects are emitted.
9. **Content licence.** This is an open question for the practice, with the overlap evidence.
10. **Defaults with no prior decision** (OPEN-DECISIONS B):
    - frozen review times kept, with `<time datetime>`;
    - the "Nothing Found" archive titles;
    - the PDF placeholder;
    - disclaimer vendor sentences removed;
    - search removed;
    - the AlumierMD link kept;
    - fax and email in the JSON-LD;
    - menu dropdowns kept;
    - template pages kept (noindex);
    - the privacy-policy placeholder clause, the home card copy and the brand spelling kept verbatim;
    - the EyeGlass Guide tool link removed;
    - trackers removed.
11. **The page's own structured data (fix round 2, R2-2).** Every `application/ld+json` block of every raw page has a
    decision; any type without a rule fails the build. Source (148 raw pages): the platform's 7 site-wide types on
    every page, BlogPosting on 19, FAQPage on 2, VideoObject on 3.
    - The 7 site-wide types are **replaced** by the graph of LD-1, as before.
    - **BlogPosting (19 posts): carried** into the page graph. Every key and value is the source's, except 7 kinds of
      declared repair (`audit/seo-repairs.json` `structuredData`, each with from / to / why):
      - `mainEntityOfPage.@id`: the platform pointed every post at the home page, so it becomes the page's canonical;
      - `datePublished` / `dateModified`: "January 15, 2026" becomes "2026-01-15" (ISO 8601);
      - `image: [""]`: empty, so it is omitted;
      - `publisher.logo.url`: the platform CDN copy becomes the logo file this build ships;
      - `headline` / `description` (3 posts): HTML entities inside the JSON string are decoded.
      The build fails if a headline is not the page h1, a date does not parse, `datePublished` is not the post date
      the page prints, or the author or publisher is not the practice. The 2 other blog posts have no BlogPosting at
      source and get none.
    - **FAQPage (2 pages): removed.** Its 4 questions and answers are printed on no page of the site. The dry-eye
      page's visible accordion asks 3 other questions ("Does dry eye treatment hurt?", ...), and both copies name the
      dry-eye page as their `url`, including the one on the glaucoma page. Structured data describes what the page
      shows. Open: docs/OPEN-DECISIONS.md B.
    - **VideoObject (3 pages): removed.** It does not parse at source: a raw line break (U+000D) inside its
      `description` string makes `JSON.parse` fail at position 197. Repairing it would publish values the source never
      published validly (`uploadDate` "2004-6-10"; an animated-preview `thumbnailUrl`). The video (YouTube
      `pfAZwGZS-Hk`) is shown only on `/eye-care-services/eye-emergencies-pink-red-eyes/`, not on the 2 tag archives
      that carry the block. Open: docs/OPEN-DECISIONS.md B.
12. **No derived description on the `/template/*` pages (fix round 2, R2-3).** None of the 6 has a meta description at
    source, and their text is platform template copy, so none is derived (`audit/seo-repairs.json`
    `descriptionsNotDerived`). og:description follows, so it is absent too. The rule removed 4 derived descriptions:
    - `/template/footer/` and `/template/footer-2/`: the social-icon labels "Visit us on facebook ...";
    - `/template/header-2/`: the placeholder location line naming another place ("Centerville Plaza on Hwy 5");
    - `/template/header-3/`: "Located at the intersection of Palm Beach Blvd and 31, in the Verandah Publix Plaza".
      This line is a verified practice fact (docs/FACTS-EVIDENCE.md), but the page is a noindex platform template
      with no description at source, so dropping it restores source parity.
    On every page, a block whose every word sits inside links never qualifies for a derived description
    (`seo.mjs isLinkOnly`). The 5 derived descriptions that remain (4 archives, `/team/jhonae-anglin/`) are
    byte-identical to round 1.
13. **Child-page thumbnail alts (fix round 2, R2-1).** The model keeps each thumbnail's source alt: 23 of the 24
    thumbnails keep their readable alt verbatim. The 24th (`/eye-care-services/`, "cataracts optometrist blog.jpg") is a
    file-name alt, blanked by the declared rule like every such alt. A theme renders `alt` as given (5.8). A
    decorative thumb, such as R's COMPONENTS F.1 index card (`alt=""`), blanks a source alt: it must be declared per
    page (`images.altsBlanked.onPages`), or the alt-fidelity check of `tools/keep-image-parity.mjs` fails.
14. **Heading levels are the source's (fix round 2, R2-4).** See deviation 3 in section 3.
15. **Deploy base (fix round 2, D7).** The default build serves the domain root (`/`). `RFEC_BASE=/sub/` builds
    `404.html`, `.htaccess` and `_redirects` for a subfolder; every other file is identical. Open: which base
    (docs/OPEN-DECISIONS.md B).

## 5. Page model contract (schema `rfec/page-model@1`)

`src/lib/page-model.mjs` builds one plain JSON object per source page. `node src/build.mjs --dump-models` writes them
to `tmp/page-models/<slug>.json`:
- `/` becomes `index.json`;
- slashes become `__`, e.g. `eyeglasses__designer-frames.json`;
- the `dist/404.html` variant is `404.json`.

A theme renders a page from its model ALONE. `tools/model-check.mjs` validates all 149 models (148 pages + 404).

**Invariants**

1. **Visible strings.** Every visible string is one of: source copy from `audit/raw` (sanitised, never rewritten), a
   value of `chrome.json` (verified against the raw pages by `tools/write-facts.mjs`), or a declared repair (see
   `declared` and `audit/clone-removals.json`). Authored text exists only in non-visible fields:
   - the iframe `title` fallback "YouTube video", on the one YouTube iframe whose source has no title (R's sanitiser
     rule; the map iframes carry the source's own title "Google map");
   - the table region `aria-label` (the page h1; no table exists on this site);
   - the `why` notes, which are reporting fields and are never rendered.
2. **URLs.** Every internal URL in `href`, `src` and `url`, and inside every `html`, is already page-relative for
   `depth`. `canonical`, `og.*`, `twitter.*`, `jsonLd` and `head.jsonLdHtml` are absolute by design (they assume the
   site is served at the origin root). External links are absolute.
3. **Provenance fields hold SOURCE URLs and are never rendered.** Rendering them would put platform paths (`wp-content`,
   `ecp-samurai`) into the page:
   - `images[].src`;
   - `placeholders[].src`;
   - `declared[].src`;
   - `docs.items[].sourceHref`;
   - `cherry.scriptSrc`, `cherry.fontsHref` and `cherry.snippet`, which are used only in embed mode.
4. **Element set.** Every `html` field is in the prose element set (5.4); the exception is `form.html` (5.5).
5. **Closed sets.** `blocks[].type`, `sections[].kind`, `images[].role` and `embeds[].kind` come from closed sets
   (`BLOCK_TYPES`, `SECTION_KINDS`, `IMAGE_ROLES`, `EMBED_KINDS`, exported by `page-model.mjs` and enforced by
   model-check). `family` is a key of `src/content/site-map.json` `templates`. A new value needs a schema bump.
6. **Order.** Arrays are in SOURCE order.
7. **Ids.** Ids (`s1`, `i1`) are sequential per page and deterministic: the same build produces the same ids.
8. **Compatibility.** Changes within `@1` are additive only, so a theme must ignore keys it does not know.

### 5.1 Top level

| key | type | meaning |
|---|---|---|
| `schema` | string | `rfec/page-model@1` |
| `path` | string | Own path with a trailing slash (`/`, `/eye-care-services/`); `/404.html` for the 404 model |
| `sourcePath` | string | The source path (equal to `path`, except `/404-page-not-found/` for the 404 model) |
| `url` | string | Live URL, with a trailing slash |
| `slug` | string | The path without its leading and trailing slash (`eyeglasses/designer-frames`; `''` for the home) |
| `depth` | number | Directory depth of the output page (0 for the home and the 404 model) |
| `family` | string | One of the 14 families of `src/content/site-map.json`: `home`, `builder-hub`, `interior`, `blog-post`, `blog-index`, `team-member`, `testimonial`, `location`, `form`, `legal`, `sitemap`, `archive`, `not-found`, `template` |
| `layout` | string | `builder` (Beaver Builder rows, one section per row) or `classic` (article flow split at h2) |
| `region` | string | `main`, or `body` on the 6 `/template/*` pages |
| `isHome`, `as404` | boolean | The home; the `dist/404.html` variant |
| `title` | string | `<title>`: the source's own, or a documented repair (`audit/seo-repairs.json`) |
| `h1` | object | `{ text, source: 'source' or 'label' or 'title', why, placement: 'band' or 'content' }`. `content` (home only) means the h1 is the leading heading of its own section (`sections[i].heading.level === 'h1'`) |
| `metaDescription` | object | `{ text or null, source: 'source' or 'derived' or 'none' }`. `none` on every `/template/*` page: no description is derived from template copy (round 2, R2-3) |
| `canonical` | string | Absolute canonical URL |
| `robots` | string | Merged robots value, e.g. `index, follow, max-image-preview:large` |
| `noindex` | boolean | True when `robots` contains `noindex` |
| `og` | object | `{ type, siteName, title, description, url, image }`. `image` is absolute (`<origin>/img/<file>`) |
| `twitter` | object | `{ card, title or null, image }`. `title` is null when the source's twitter title only repeated a source title that was repaired. The template prints `twitter:description` from `og.description` when it is not null (QA round 1, CONTENT-4: the source printed it on 148 pages, always equal to its og:description) |
| `jsonLd` | object | `{ '@context', '@graph': [Organization, Optometric, BreadcrumbList?, BlogPosting?] }`. BlogPosting is the post's own source node, carried with its declared repairs (19 posts; round 2, R2-2; decision 11). `head.jsonLdHtml` holds the same as a ready `<script>` |
| `breadcrumbs` | array or null | `[{ label, href or null, path or null, current }]`: the SOURCE trail. Every segment the source links keeps its link (`href`, page-relative). The last segment is the page's own: `href: null` and `current: true`. On the 17 archives the source prints that segment EMPTY ("Home » " and nothing after it). It stays as `{ label: '', href: null, path: null, current: true }`, so Home keeps its link (round 1, D2). Other empty segments are dropped (none on this crawl). null when the source has no trail |
| `date` | object or null | `{ text: 'Feb 28, 2023', iso: '2023-02-28' }`, on the 21 single posts |
| `sections` | array | See 5.2 |
| `prose` | string | Derived reading view: every section heading and prose block, in order; component blocks are omitted. Not for rendering |
| `aside` | object or null | The source sidebar as data (5.6); null where the source page has no sidebar |
| `forms` | array | Parsed Gravity Forms; each is also present as a `form` block |
| `images` | array | Every image the page shows: `{ id, url, file, w, h, srcset, alt, role, class, src, where }`. **srcset** (P1, wf5b): `[{ url, w }]`, ascending, the widths 360 / 540 / 720 / 1080 / 1440 / 1920 / 2400 each capped at the file's intrinsic width (so the last entry is the intrinsic width; duplicates collapse); one entry, the file itself, for a file that is never re-encoded (the 2 logos, the GIFs). Every other image object carries the same key (`background[].image`, `callout.image`, `members[].photo`, `items[].image`, `items[].thumb`, the `art` images). `url` stays the single encode it was (1600 or 1200 px at most); the variants share its base name. **role** (`IMAGE_ROLES`): `photo`, `plate`, `portrait`, `brand`, `diagram`, `logo`, `background`, `inline`. **where**: `prose`, `background`, `callout`, `team-photo`, `post-thumb`, `childpage-thumb`, `product`, `equipment`, `gallery`, `logo`. `alt` is the source's own, child-page thumbnails included (round 2, R2-1). `''` means one of three things: the source gives none (the 53 product images have no alt attribute), the image is a background, or a declared blank of a file-name / upload-hash alt (`audit/clone-removals.json` `images.altsBlanked.onPages`). `class` is the image-classification class. `src` is provenance |
| `placeholders` | array | Refused real-person and brand images: `{ kind: 'portrait' or 'brand', label (the person's or brand's name), needs, src, where }` |
| `embeds` | array | Inventory, not for rendering (render from blocks and aside): `{ kind, src, where }`. **kind** (`EMBED_KINDS`): `map`, `youtube`, `iframe`, `video`, `cherry`. **where**: `prose`, `visit`, `aside`, `video`, `cherry`. `title` is present on map, youtube and prose iframe embeds. `hosts` is present on cherry |
| `declared` | array | The page's declared removals and repairs, in processing order. Each entry's `kind` (`DECLARED_KINDS`) and keys: `excerpt` `{ kind, text, product }`; `toggle` `{ kind, text }`; `shortcode` `{ kind, from, to }`; `image-dropped` and `background-dropped` `{ kind, src, why, where }`; `video-poster` and `pdf-not-harvested` `{ kind, src, why }`; `structured-data` `{ kind, type, decision, why, repairs? }` (round 2, R2-2). For `structured-data`, `decision` is `REPAIR` or `REMOVE` on this site; `CARRY` (verbatim) is in the rule set, used by no page. `repairs` lists the repaired field names; their from / to are in `audit/seo-repairs.json` `structuredData`. `image-dropped` covers EVERY image the page drops by decision: component slots (`where` = the slot, e.g. `childpage-thumb`) and images in prose (`where: 'prose'`: refused stock photos with no sibling, platform images). So an empty slot can be found from the model alone. Every entry of `audit/clone-removals.json` `images.droppedOnPages` is in its page's model (round 1, D5; model-check enforces it) |
| `links` | object | `{ moved: [{ path, refs }], dead: [{ path, refs }] }` for this page |
| `chrome` | object | See 5.7 |
| `head` | object | `{ favicon: [{ rel, href, sizes, type }], stylesheets: [href], scripts: [href], jsonLdHtml, lang ('en-US'), lcp }`. **stylesheets** (P2, wf5b): exactly one, page-relative: `styles/scaffold.css` on the SCAFFOLD, `theme/riverlight.<8 hex>.css` (the fingerprinted bundle) on the design theme. **scripts** (P2, wf5b; COMPONENTS gap I.12): `[]` on the scaffold, `[theme/site.<8 hex>.js]` on the design theme, page-relative; always present. A theme prints exactly these entries. `lcp` is always null in this build (reserved) |
| `art` | object | wf5b, P4: the images the redesign adds, from `src/content/image-plan.json` (section 5.10). `{ title, inline, home }` on every model |

### 5.2 Sections

Each section is `{ id, kind, node, heading, background, blocks, label, prose, images, ctas }`.

- `kind` (`SECTION_KINDS`):
  - Classic pages: `article`, one per h2 part.
  - Builder rows: `hero`, `image-band`, `text`, `text-image`, `image`, `cta`, `cards` (2 or more callouts),
    `callout`, `form`, `visit`, `team`, `reviews`, `testimonials`, `posts`, `gallery`, `products`, `logos`,
    `accordion`, `video`, `equipment`, `sitemap`, `cherry`.
  - The home's row kinds are read from `audit/architecture-map.json`; empty rows are skipped.
  - `kind` is a layout hint; the blocks are authoritative. For example, a `text` row may hold `childpages`.
- `node`: the Beaver Builder row id (`data-node`), or null for classic pages.
- `heading`: `{ html, text, level, id or null }`, the section's LEADING heading, which is NOT repeated in `blocks`.
  null when the section does not start with one.
  - Classic: always `h2`. Builder: the row's first heading, at its own level. `h1` appears only in the home's h1 row.
  - `html` may hold inline `a`, `b` and `strong`.
  - A run of heading-only h2 parts (classic) is merged into the next part that has a body. The first heading becomes
    the section's `heading`; the later ones open its first prose block at their SOURCE level, h2 (round 2, R2-4; one
    section, on `/eyeglasses/kids-optical/`). Builder rows already hold h2s in their prose (17 sections). A theme must
    not assume that a section's prose holds no h2.
- `label`: the leading heading text; otherwise the first heading inside a prose block; otherwise the first callout
  title. A navigation aid.
- `background`: `[{ image (an images[] entry, role background), media or null, from: 'row' or 'column', superseded? }]`.
  These are the row and column background photos (KEEP images): render them with `alt=""` and honour `media`
  (`(max-width: 768px)` on the home's phone hero).
  - wf5b, I.6: `superseded` (a reason string) marks a layer the design does not render: the home hero's phone layer
    (`sections[0].background[1]`, 1190x496; DESIGN-SPEC Q-6). It stays in the model and is declared `background-dropped`
    (so `audit/clone-removals.json` `images.droppedOnPages` lists it and keep-image-parity accepts its absence); the
    scaffold still renders it.
  - wf5b, P1 (COMPONENTS gap I.3): the home hero's base layer image carries `crop` `{ url, w, h, srcset }`, the 4:3
    crop DESIGN-SPEC 3.4 asks for: 1067x800 cut from the 1920x800 original at x 308 (36%), chosen by eye: the 55% framing COMPONENTS B.4 gave the uncropped fallback (x 469) puts the right edge through the staff member at the reception desk; x 308 ends the frame left of her and of the monitor showing the practice logo (views in
    `tmp/wf5b/pipeline/crop-*.png`). Widths 360 / 540 / 720 / 1067. It is its own object because one `srcset` may list
    one aspect only. No other image has a crop. The home's `images[0]` is the same image object, so the dumped model
    shows `crop` there too.
- `blocks`: see 5.3.
- Derived views: `prose` (this section's prose blocks joined), `images` (ids), `ctas` (every button of its `cta` and
  `callout` blocks).

### 5.3 Blocks (closed set: `type` and fields)

| type | fields |
|---|---|
| `prose` | `html` (5.4) |
| `callout` | `title` or null; `titleIsPageH1` (true when the title was the band h1 and was removed); `image` (an images[] entry or null); `placeholder` (or null); `imageFirst`; `html` (prose); `buttons` [cta button]. **title** = `{ text, html, level, href, path }`, plus `demotedFrom: 'h1'` when demoted. `level` is `'h2'`-`'h6'`, or null when the source had no heading element |
| `cta` | `buttons`: `[{ label, href, path, external, newTab, rel }]` |
| `badges` | `items`: `[{ label, href, path, icon ('calendar' or 'mail'), newTab }]`: the quick actions inside the content |
| `childpages` | `variant` (`plain`, `thumbs` or `archive`); `items`: `[{ title, href, path, summary (string, may be ''), thumb (an images[] entry or null; its `alt` is the source's own, round 2, R2-1), thumbDropped (reason or null) }]` |
| `posts` | `view` (`summary`, `grid` or `list`); `items`: `[{ title, level, href, path, date { text, iso } or null, html, image (where post-thumb; null on all 46 items here), more { label, href, ariaLabel } or null }]` |
| `team` | `view` (`summary` or `complete`); `members`: `[{ name, level, href, path, position (string, may be ''), photo (an images[] entry or null), placeholder, html (may be ''), categories (string), more }]` |
| `testimonials` | `items`: `[{ title { text, href, level } or null, html, name ('Lukas R, Google 2021'), attribution (verbatim: '- Lukas R, Google 2021'), stars (number) }]` |
| `reviews` | `items`: `[{ html, name (verbatim, with its dash: '- Marshall B.'), stars, shownAs ('2 weeks ago'), reviewedAt ('2026-09-15 23:18:33') }]` |
| `visit` | `title { text, href, level }` or null; `subs` (`{}` or the source sub-headings `{ contact, address, hours }`); `address` [lines]; `contacts` `[{ type ('Phone', 'Fax' or 'Email'), label ('Phone:'), value, href (null for Fax), note (the PHI note on Email) }]`; `hours` `[[day, [intervals]]]`; `map { src, title, fallbackLabel }` or null; `order` (the source order of title/contacts/address/map/hours); `view` (`complete`, `summary` or `list`) |
| `hours` | `rows` `[[day, [intervals]]]` (none on this site) |
| `accordion` | `items`: `[{ q, html }]` (render as `<details>`) |
| `video` | `kind: 'file'`: `sources [{ src, type, file, bytes }]`, `poster` (null), `controls`. Or `kind: 'iframe'`: `src`, `title`. All 3 here are `file` |
| `products` | `items`: `[{ title, level, image, placeholder, html (the full text), more ('Read More+': the source's toggle words, no link) }]` |
| `equipment` | `items`: `[{ title, level, image, html }]` |
| `gallery` | `items`: `[{ image or null, placeholder or null, caption, href or null }]` |
| `logos` | `kind` (`frame-brands` or `carriers`); `items`: `[{ name, image, placeholder, href or null }]` |
| `sitemap` | `items`: `[{ title, href, path, depth (0-3) }]` (nest by depth) |
| `docs` | `items`: `[{ label, href or null, needs ('pdf file' or null), sourceHref (provenance), after (text after the link, may be '') }]` |
| `form` | `form`: parsed `{ id, fields, submit, dropped, conditional }`. `fields[].kind` is one of `note`, `text`, `name`, `email`, `tel`, `textarea`, `select`, `radio`, `date`; see `forms.mjs` for each kind's keys. `html`: the inert form markup (5.5) |
| `cherry` | `mode` (`link` or `embed`); `label` (the h1); `applyUrl` or null; `needs`; `slug`; `sections` (the widget mount points); `scriptSrc`, `fontsHref`, `snippet` (the exact source embed; provenance in link mode) |

### 5.4 The prose element set (every `html` field except `form.html`)

**Allowed** (the sanitiser's `KEEP_TAGS` plus the wrappers this pipeline emits):

- Headings and text: `h2`-`h6`. A heading gets an `id` only when an in-page link targets it.
- `p`. `p.attribution` marks a "Special thanks to" line.
- Lists and blocks: `ul`, `ol` (`start`), `li`; `dl`, `dt`, `dd`, `blockquote`, `hr`, `address`, `cite`, `code`,
  `pre`.
- Inline: `strong`, `b`, `em`, `i`, `u`, `sup`, `sub`, `small`, `br`.
- `a` (`href`): an external link keeps the source `target` and the source `rel` (only `nofollow`, `noopener`,
  `noreferrer`, `sponsored`, `ugc`), plus `noopener` when the target is `_blank`. `aria-label` appears only when the
  source has one. An icon link with no text prints its source aria-label as its text.
- Tables appear only inside `div.table-scroll[tabindex=0][role=region][aria-label]`. The first row is promoted to
  `th scope=col` when the table has no `th`, and `colspan`/`rowspan` are kept.
- Figures: `figure.fig.fig--{photo|plate|portrait|brand|diagram} > span.fig__media > (a)? img`, plus `figcaption`
  when the source binds a caption. A run of 2 or more figures is wrapped in `div.fig-grid[data-count]`.
- Logo lists: `ul.logo-grid[data-count] > li.logo-chip > img`, or `li.logo-chip.logo-chip--link > a.logo-chip__link > img`.
- `data-count` (the number of figures or chips, an integer) is the ONLY `data-*` attribute of the set, and it appears only on
  `div.fig-grid` and `ul.logo-grid` (`content.mjs` `groupFigureRuns` and the logo-wall lift). It is grid sizing for CSS
  (COMPONENTS 0.4 and D.2).
- iframes appear only in `div.embed.embed--{video|map|other}`, with `src`, `loading=lazy` and `title`, plus
  `allowfullscreen` on YouTube.
- `img` always has `src alt width height loading="lazy" decoding="async"`.

**Never:** `style`, source classes or ids, any other `data-*` attribute (the pipeline's internal `data-class`,
`data-generated` and `data-src-id` are stripped or turned into an `id` before a model is written), `script`, `form`,
`svg`, `nav`, or any `ecp-`, `fl-`, `gform` or `wp-` token.

**Emitted on this site** (all 149 models; the 756 rendered `html` fields, `form.html` excluded; re-counted after wf5b,
section 11): `a b br div em figcaption figure h2 h3 h4 hr i iframe img li ol p span strong sup ul`. The classes used are
`figure.fig--{photo 41, plate 20, brand 9, diagram 3, portrait 1}`, `span.fig__media` (74), `div.fig-grid` (3),
`div.embed.embed--video` (1), `ul.logo-grid` (1) with `li.logo-chip` (4), and `p.attribution` (7). The `data-*`
attributes are exactly four `data-count`: `div.fig-grid` 7, 4 and 3, and `ul.logo-grid` 4. There are no tables, no
heading ids and no anchor aria-labels.

### 5.5 Form markup (`form` block `html`)

The form block's `html` is ready-made inert markup from `forms.mjs renderForm()`:

- **Form element:** `form.form[method=dialog][aria-labelledby=page-title][data-needs-backend="form endpoint"]`, with no
  `action` (`method=post` until QA round 1, CONTENT-1: a valid submit then posted every field to the page itself and
  the page reloaded empty; a dialog form outside a `<dialog>` validates and sends nothing, and site.js cancels the
  submit as well, section 13).
- **Layout wrappers:** `div.form__intro` (the note paragraphs), `div.form__grid`, `div.field(.field--wide)`,
  `div.field__row`, `div.field__sub`.
- **Choice groups:** `fieldset.field(.field--choice|.field--group) > legend.field__label`.
- **Labels and controls:** `label.field__label[for]`, `label.field__sublabel`, and `.field__control` on `input`,
  `select > option[value]` and `textarea`. Controls carry `id`, `name`, `type`, `autocomplete`, `required`,
  `aria-required`, `aria-describedby` and `placeholder` as applicable, and no `inputmode`: the date branch printed
  `inputmode="numeric"` on the Date of Birth field until the mobile optimisation (15.2, M-TOUCH-2), whose phone keypad has
  no "/" for the `mm/dd/yyyy` the field asks for (the source's datepicker field had no inputmode). Radio choices are
  `div.choice > input.choice__input + label.choice__label`.
- **Helper text:** `span.field__req[aria-hidden]` (`*`), `p.field__help[id]`, and `span.field__hint.sr[id]` (the date
  format hint; `.sr` must be visually hidden).
- **Error slots:** `p.field__error[id][hidden] > span.field__error-text`. The text is EMPTY: the source's error strings
  are server-side and not in the crawl, so any message is authored copy and must be declared.
- **Conditional fields:** `div[data-show-if="<control name>=<value>"]` (2 on the contact form) is shown only while that
  control has that value, as at source. The scaffold has no script and shows them always.
- **Submit row:** `div.form__foot > button.btn.btn--primary[type=submit]`.

### 5.6 Aside

```
{ variant: 'standard' or 'location-page',
  quickActions [{ label, href, icon }],
  social [{ network, label, href, rel }],
  location {
    title { text, href },
    address [lines],
    contacts [Phone, Fax, Email + note],
    hours [[day, [intervals]]],
    map { src, title, fallbackLabel }
  } or null }
```

`location` is null on the location-page variant.

### 5.7 Chrome (per page, page-relative)

```
{ brandName,
  skip { label, href: '#main' },
  logo { url, w, h, alt, href, homeLabel },
  topbar { address { label, href }, appointment { label, href }, call { label, href } },
  mobile { media, logo { url, w, h, alt, href }, appointment { label, href, newTab }, call { label, href },
           menuToggle, menuOpen, menuClose },
  nav [{ label, href, path, current, inSection, children [same shape] }],
  quickActions [{ label, href, icon }],
  social [{ network, label, href, rel }],
  footer {
    menu [{ label, href, path }],
    button { label, href },
    nap { name, located, street, sep, locality, region, postalCode, postalEnd,
          phoneLabel, phone, phoneHref, phoneEnd, site { label, href }, text },
    copyright,
    util [{ label, href, path }]
  },
  financing { label, href, why } }
```

`footer.menu` is flattened from chrome.json's footer columns (1 column, 4 links here). `financing` is the local link
that replaces the floating Cherry estimator (declared); it is set on every page.

`mobile` is the source's mobile header row. `media` is where the source shows it instead of the desktop logo + menu
row: `(max-width: 768px)`, read from the Beaver Builder layout CSS (the `fl-visible-mobile` rule; the build fails if
the query is not unique). `logo` is its own file, `Riverside-Family-Eye-Care-Logo.png` (988x400, alt "Riverside
Family Eyecare Logo"; chrome.json `logo.srcPatternMobile` / `altMobile`), linked to the home (round 1, D4). The
appointment and call items are icon links at source; their labels are aria-labels, not visible text.

**P3 (wf5b).** `logo.url` and `mobile.logo.url` name byte-identical copies of the source PNGs
(`riverside-family-eye-care-logo-01.<10 hex>.png`, 300x121, and `riverside-family-eye-care-logo.<10 hex>.png`, 988x400;
the build compares their sha256 with `assets/source/` and fails on a difference). The same files serve every other use
of the logo: the og/twitter image fallback, the JSON-LD `logo` and the BlogPosting `publisher.logo.url` repair, and the
logo images in the prose of the 4 `/template/*` header pages.

### 5.8 What a theme must do

1. **Exactly one h1.** With `placement: 'band'`, print `h1.text` in the title band with `id="page-title"`; the form
   markup's `aria-labelledby` points at it. With `placement: 'content'` (the home), the h1 is the section's leading
   heading; the home has no form.
2. **Main landmark.** `<main id="main">` is the target of `chrome.skip.href`.
3. **Head.** Print `title`, `metaDescription.text` (when not null), `canonical`, `robots`, `og`, `twitter`,
   `head.favicon` and `head.jsonLdHtml` as given, with `lang` on `<html>`.
4. **Breadcrumbs.** Keep the source's " » " separator as text (the scaffold prints it `aria-hidden`), because sentence
   parity reads the trail as source text. Link every segment that has an `href`. When the current segment's
   `label` is empty (the 17 archives), print the separator before it and nothing else ("Home » ", as at source).
5. **Placeholders.** Render every placeholder as an element with its name and `data-needs` (rule 4: `ph-portrait`,
   `ph-brand`). Render the `docs` and `cherry` needs the same way (`data-needs`, no invented link).
6. **Forms.** Use `form.html`, or rebuild it from `form.form` without authoring copy. Keep `data-needs-backend` until
   an endpoint is decided.
7. **Never render** provenance fields (invariant 3), `declared`, `links`, `embeds` or any `why`.
8. **Images.** Render `url` with `w`/`h` and `alt` exactly as given, child-page thumbnails included (round 2, R2-1).
   A theme that prints a thumbnail as decorative (`alt=""`, as R's COMPONENTS F.1 index card does) blanks a source
   alt. It must declare that blank per page (`audit/clone-removals.json` `images.altsBlanked.onPages`, the build's
   `altBlanks`), or the alt-fidelity check of `tools/keep-image-parity.mjs` reports each one. Background images get
   `alt=""`. Honour every `media`. A `section.background` image with `media` replaces the image of its own layer (same `from`) inside that
   query; the scaffold uses a `<picture>` `<source>`. `chrome.mobile.logo` replaces the desktop logo inside
   `chrome.mobile.media`. Draw ratings (`stars`) as icons, never as text glyphs: the source draws SVG stars, and
   words-added reports any glyph the source does not print.
9. **The 404 model** has depth 0. The build rewrites its URLs root-relative when it writes `dist/404.html`.
10. **Gates.** Run `node tools/run-gates.mjs` after any template change: the parity gates guard the copy,
    model-check guards the model, and link-check guards page-relative URLs.
11. **wf5b additions.** Print `head.stylesheets` and `head.scripts` exactly (one stylesheet; one script on the design
    theme, none on the scaffold). Render `srcset` from an image object's `srcset` with the slot's `sizes` (a prose `img`
    takes the `srcset` of the `images[]` entry whose `url` equals its `src`; COMPONENTS D.7 transform 3). On the home
    hero frame print `crop` (`url`, `w`, `h`, `srcset`) when present. Do not render a background layer marked
    `superseded`. Render `art` by COMPONENTS 0.12, B.4, B.9, B.13, B.21, D.7 transform 5 and F.2, with each image's
    `alt` as given; never hard-code a generated file (section 5.10). A file the model names reaches `dist/img/` only
    when a rendered page names it, so render every URL from the model, never a guessed name.
    **Known gate gap (open, section 11):** the alt-fidelity check of `tools/keep-image-parity.mjs` exits 1 on any
    `<img>` in `<main>` whose file the SOURCE page does not show as an `<img>` ("unmatched"). That covers every `art`
    image, the hero/band posters and a background photo printed as an `<img>` outside `figure.section__bg` (the hero
    frame, the hub arch). `audit/clone-removals.json` `images.added` declares the art per page, but the gate does not
    read it yet.

### 5.9 Values on this site (149 models)

| measure | values |
|---|---|
| layout | builder 34, classic 115 |
| region | main 143, body 6 |
| `h1.source` | source 142, title 6, label 1 |
| `metaDescription.source` | source 135, derived 5, none 9 (round 1: derived 9, none 5; the 4 `/template/*` descriptions of decision 12) |
| `jsonLd['@graph']` nodes | Organization 149, Optometric 149, BreadcrumbList 123, BlogPosting 19 |
| `aside` | standard 131, location-page 1, null 17 |
| `breadcrumbs` | null on 9. 17 trails end on an empty own segment (the archives) |
| `date` | set on 21 |
| sections | 351. Non-home: article 281, text-image 14, callout 9, text 8, cta 5, accordion 3, cards 3, image 3, logos 2, team 2, cherry 1, form 1, reviews 1, video 1, visit 1. Home (16): cards 3, hero 2, team 2, text 2, callout 1, cta 1, gallery 1, image 1, posts 1, reviews 1, text-image 1 |
| blocks | 451: prose 291, callout 54, childpages 30, cta 17, team 13, accordion 9, badges 7, products 7, logos 3, posts 3, video 3, visit 3, form 2, reviews 2, testimonials 2, cherry 1, docs 1, equipment 1, gallery 1, sitemap 1 |
| images | 251 refs. Roles: plate 107, logo 51, photo 48, brand 17, portrait 14, background 11, diagram 3. Where: prose 78, product 53, logo 47, childpage-thumb 24, callout 14, team-photo 12, background 11, equipment 9, gallery 3. `alt` is `''` on 75: the 53 product images (no alt attribute at source), the 11 backgrounds, and 11 declared file-name blanks (prose 9, callout 1, childpage-thumb 1; 2 of them are served by an on-disk sibling size). The other 23 child-page thumbs carry their source alt (round 1: all 24 were `''`). **srcset** (wf5b): 500 entries on the 251 refs (161 refs have one entry: files at or under 360 px, the logos, the GIFs; 3 have all 7), naming 460 distinct files |
| placeholders | 11 slots on 7 pages |
| embeds | map in aside 131, map in visit 2, video 3, youtube 1, cherry 1 |
| declared | toggle 53, excerpt 52, structured-data 24 (BlogPosting REPAIR 19, FAQPage REMOVE 2, VideoObject REMOVE 3), image-dropped 15 (prose 13, childpage-thumb 2: the 14 page/file pairs of `droppedOnPages`, plus the 404.html variant's `404.png`), shortcode 4, video-poster 2, pdf-not-harvested 1, background-dropped 1 (wf5b, I.6: the superseded hero phone layer; `droppedOnPages` is now 15 pairs) |
| `art` (wf5b) | on 149. `title` on 133: TB-eyeglasses 36, TB-utility 30, TB-blog 22, TB-ecs 21, TB-contacts 11, TB-contact 7, TB-insurance 4, TB-team 2 (one portrait, one plate); null on 16 (the home, 9 team pages with a team block, 6 hubs with a header photo). `inline` 11 on 7 pages. `home` 3 (H1, H2, H3). 126 distinct files: 119 generated (17 masters, all AI-labelled) and 7 real (TB-contact 4, TB-team 3) |
| `head.scripts` (wf5b) | `[]` on all 149 with the scaffold |
| `crop` (wf5b) | 1, the home hero base layer: 1067x800, widths 360 / 540 / 720 / 1067 |

### 5.10 Art (`model.art`, wf5b, DESIGN-SPEC 4.3 P4)

`model.art` holds every image the redesign ADDS to a page. `src/build.mjs` builds it from `src/content/image-plan.json`
(IMAGE-PLAN 2-4) after every model exists, and `page-model.mjs` `artOf()` shapes it the way COMPONENTS 0.12 consumes it:

```
{ title: null
       | { id, url, w, h, alt, srcset, ai, objectPosition }
       | { id, placeholder: { kind, label, needs } },
  inline: [{ id, image: { url, w, h, alt, srcset, ai, role }, anchor, position }],
  home: null | { 'hero-cutout': image, 'home-feature': image, 'graft-cutout': image or null } }
     (a home image is { id, url, w, h, alt, srcset, ai, role })
```

- **title.** The title-band arch, set on exactly the 133 band models with no arch of their own (COMPONENTS B.21 order;
  gaps I.4, I.7, I.15):
  - the plan's generated section defaults (124 models; `alt` "", `ai` true; `objectPosition` from
    `usedFor[].objectPosition`, "68% 62%" on TB-ecs, else null);
  - TB-contact (7: `/contact-us/` and its 4 children, `/hours-location/`, `/location/riverside-family-eyecare/`): the
    real practice-interior photo that `image-plan.json` `notPlannedHere.realImages` names, `alt` "", `ai` false.
    `/hours-location/` also shows that photo in its content with its source alt, so its arch blank is declared
    (`images.altsBlanked.onPages`, `where: 'title-arch'`);
  - TB-team (2): a team page with no portrait of its own takes the portrait or plate of the team cards that link to it
    (every such card must agree, or the build fails): Dr. Degler's own 640x640 portrait with its source alt "Dr. Brittany
    Degler, O.D."; Jhonae's plate, `{ placeholder: { kind: 'portrait', label: 'Jhonae', needs: 'practice photo' } }`.

  `null` on the home and on the 15 models whose arch is their own image (9 team pages with a team block, 6 hubs with a
  header photo). A band model left with no arch at all fails the build. `id` is the plan id (TB-ecs, ..., TB-contact,
  TB-team).
- **inline.** The generated stand-ins in the slots of refused stock photos and the added illustration: 11 on 7 pages
  (A1, N1 twice, N2, N3, N4, N5, N7, N8, N9, N10), in the document order of their anchors. `anchor` and `position` are
  the plan's `usedFor[]` values, verbatim (`position` null where the plan gives none: the 2 hub items); `image.alt` is the
  plan's (a literal description for a stand-in, "" for A1); `image.role` is the plan role (`stand-in`, `inline-figure`).
  Every anchor is matched against the model when the build runs (`anchorIndex()`):
  - `article-start`: the article's first heading equals `before` (quotes and case normalised);
  - `heading`: a heading of that text and level;
  - `after-paragraph`: a `p` ending with `textEndsWith`;
  - `hub-item`: the child-page item of that title, whose own thumb was dropped.

  An anchor that matches nothing fails the build (COMPONENTS D.7 transform 5). So does a stand-in whose page does not
  declare the refused image it replaces. N6 is dropped in the plan, and the dry-eye banner slot is declared empty
  (`image-plan.json` `declaredEmpty`): neither has an entry.
- **home** (the home model only; COMPONENTS gap I.11): H1 the hero cut-out, H2 the cataract lens, H3 the kids' glasses
  graft (ACCEPTed in `tmp/wf4/review-R-r3/view-notes.txt`), each `alt` "", `ai` true. `null` on every other model.
- **Files.** Each generated master is encoded once (`gen-<master id>.<key>.webp`; its `url` at 1600 px at most, plus
  the P1 widths), with the P7 label. A reuse entry shares its master's files (TB-contacts = N3, A1 = TB-blog). The
  master's sha256 must equal its `audit/generated-images.json` record, or the build fails. The `hero-video-still` and
  `graft-source` entries never ship.
- **Declared.** `audit/clone-removals.json` `images.added` lists every (page, slot, id, file, alt, ai) the art adds; a
  stand-in also names the declared-dropped image it `replaces`.

## 6. Verification (final tree, after fix round 2)

**After the design build** the numbers of the built site are in section 12.3 (754 files; the content gates unchanged
except where 12.3 says).

**After wf5b** (section 11): every gate number below is unchanged except model-check (`droppedOnPages` 15, `declared`
`background-dropped` 1: the I.6 declaration). residue-grep fails at the start of wf5b and after it on one hit that is
not in the pipeline (section 11.5). The scaffold `dist/` aggregate is now `3f1fd991...`; section 11.4 gives every
command and log.

Rows 3-14 are the 12 gates of `node tools/run-gates.mjs`; the last full run is `tmp/wf3/fix-r2b/72-gates-final.log`
(all PASS, exit 0, run after the last doc edit). The logs of round 2 are in `tmp/wf3/fix-r2b/` (an earlier pass of the
same round left its logs in `tmp/wf3/fix-r2/`). The strengthened gates were also run on the pre-round tree (its HTML in
`tmp/wf3/fix-r2/before/dist`, its models in `.../before/models`; logs in `tmp/wf3/fix-r2/before-gates/`), where they
report each finding. Round 1's numbers are in `tmp/wf3/fix-r1/` and section 9.

| # | check | command | result |
|---|---|---|---|
| 1 | build | `node src/build.mjs --dump-models` (`70-build-final.log`) | Exit 0, 0 failures. 148/148 pages + `dist/404.html`. 244 source images kept, 240 shipped, 237 encodes from the cache (0 new). 3 media. 25 alias references re-pointed, 0 dead links. 23 noindex, 117 sitemap URLs, 16 redirects. 149 models. SEO: 17 titles repaired, 17 canonicals set, 5 descriptions derived, 6 not derived (`/template/*`), structured data BlogPosting REPAIR 19, FAQPage REMOVE 2, VideoObject REMOVE 3. Deploy base `/` |
| 2 | reproducible | `RFEC_DIST=tmp/wf3/fix-r2b/repro-a` and `.../repro-b` builds, then `node tools/hashdir.mjs tmp/wf3/fix-r2b/repro-a tmp/wf3/fix-r2b/repro-b dist --control` (`71-repro.log`) | **IDENTICAL**: 400 files each, aggregate `ef842240bbb54a21aa060c3bf839826b181ff0f7c54424470353014ce7ec41e1`. Control fired. Against round 1's final tree (`9dbf474a...`, `tmp/wf3/fix-r1/repro-a`), `diff -rq` lists 28 files: 27 pages and `styles/scaffold.css` (`32-diff-vs-round1-final.log`). Every image, media file, favicon, `sitemap.xml`, `robots.txt`, `_redirects`, `.htaccess` and `404.html` is byte-identical. `tmp/wf3/fix-r2b/attrib-diff.mjs` neutralises each defect's own spot and finds the rest byte-identical (`33-attrib-diff.log`): 122 pages identical; 19 differ only in the JSON-LD script (R2-2), 4 only in the description metas (R2-3), 3 only in img alts (R2-1) and 1 only in its heading tag (R2-4); 0 unexplained; control fired. Cold cache: measured before round 1 (`tmp/repro-cold.log`), not re-run, because no image input or encode setting changed (0 encodes) |
| 3 | sentence parity | `node tools/sentence-parity.mjs` | 5,617 sentences: **5,426 found, 0 lost**. 146 are source chrome (all "Return to top of menu"). 45 are declared: 37 contact-lens excerpt fragments, 6 disclaimer vendor sentences, 2 honeypot instructions. 0 occurrence shortfalls. 16 were found whitespace-insensitively. Both controls fired. Unchanged by round 2 |
| 4 | short-text parity | `node tools/short-text-parity.mjs` | 815 items (71 dates, 22 phone/fax, 4 emails, 76 prices/rates, 31 form labels/options/hints, 3 page-menu labels, 57 CTA labels, 551 short headings): **813 found, 0 missing**, 2 declared (the Akismet "Δ" label). Both controls fired |
| 5 | heading parity (new, R2-4) | `node tools/heading-parity.mjs` | 148 pages, 743 distinct source headings: **742 at their source level, 1 declared, 0 findings**. The declared one is HD-1: the FAQ post's second source h1 "Introduction" prints as h2. Both controls fired (an h2 demoted to h3 is reported `level`; an h2 turned into a `p` is reported `not-a-heading`). On the pre-round tree: 1 finding, "The right fit" h2 -> h3 on `/eyeglasses/kids-optical/` |
| 6 | tag balance | `node tools/tag-balance.mjs` | 149 pages, **0 findings**. Control fired: planted unclosed div, unclosed and stray main/section, block in p, `</br>` |
| 7 | links | `node tools/link-check.mjs` | 150 files, 6,686 local refs (2,013 external skipped). **0 problems**: missing targets, dead fragments, root-absolute refs and page-relative refs in 404.html are all 0. Controls fired. On the `RFEC_BASE=/preview/` build: `MSYS_NO_PATHCONV=1 RFEC_BASE=/preview/ node tools/link-check.mjs --dir tmp/wf3/fix-r2b/sub/preview`, 0 problems, the `outside-base` control fired (`20-base-linkcheck.log`) |
| 8 | link parity | `node tools/link-parity.mjs` | 148 pages, 1,002 source links: **897 kept, 0 missing**. 103 are exempt by rule (`javascript:`, `#`, an empty `tel:`), 2 are declared (the HIPAA PDF, the EyeGlass Guide badge), 0 are dead. Both controls fired |
| 9 | KEEP images + alt fidelity | `node tools/keep-image-parity.mjs` | 239 (page, KEEP image) pairs: **237 present, 2 declared** (`404.png` and `eyeglass_guide_logo.png`, platform images), 0 missing. Control fired. **Alt fidelity (new, R2-1):** 242 `<img>` in `<main>` on 148 pages: **231 carry their source alt, 11 are declared file-name blanks, 10 are section backgrounds, 0 unmatched, 0 findings**. Control fired (a readable alt blanked in memory). On the pre-round tree: **23 findings**, the 23 blanked child-page thumbnails |
| 10 | SEO parity | `node tools/seo-parity.mjs` (`12-seo-parity.log`) | 148 pages, **0 mismatches**. **Titles:** 131 same, 17 documented repairs. **Descriptions:** 143 same (135 source + 8 with none on either side), 5 derived; derived-description provenance 0 problems. **Canonicals:** 131 same, 17 archives set to self. **Robots:** 148 equal to the raw merge (23 noindex). **h1:** exactly one per page; 141 source, 7 documented labels. **Structured data (new, R2-2):** 148 pages, 0 problems. Controls fired: a wrong title; a link-only and a template-page description; a dropped BlogPosting, a changed headline, a planted FAQPage; each kind of REMOVE declaration withdrawn (the FAQPage of `/eye-care-services/dry-eye-disease-and-treatment/` and the VideoObject of `/eye-care-services/eye-emergencies-pink-red-eyes/` are then reported). On the pre-round tree: the 19 BlogPostings neither carried nor declared, and the 4 template descriptions |
| 11 | words added | `node tools/words-added.mjs` | 148 pages, 100,293 visible words, **0 added**; 1,918 visible glyphs, **0 added**. Both controls fired |
| 12 | decontamination | `node ~/.claude/skills/site-reforge/scripts/sr-decontaminate.mjs --project . --dir dist --strict` | **CLEAN**: 152 files, 0 blocker, 0 major |
| 13 | residue of R's practice | `node tools/residue-grep.mjs` | 212 files (src, dist, tools, facts, this file, OPEN-DECISIONS): **0 hits**. Controls fired: a planted string, and R's raw home |
| 14 | model contract | `node tools/model-check.mjs` | 149/149 models, 351 sections, 451 blocks, **0 violations**; 140 breadcrumb trails; declared `structured-data` 24; 14 `droppedOnPages` entries checked. 4 controls fired; control 4 (new, R2-2) removes a carried BlogPosting from a post's graph and adds an undeclared FAQPage node |
| 15 | render | `node tools/serve.mjs --root dist --port 8891 --no-open --not-found 404.html` (background), then `MSYS_NO_PATHCONV=1 node tools/render-check.mjs --base http://127.0.0.1:8891 --widths 1280,390 --control --paths <20 paths> --out tmp/wf3/fix-r2b/23-render-check.json` | **40/40 ok**: the 20 pages round 2 touched (the 3 hubs, kids-optical, the 6 templates, 3 posts, the 2 FAQPage pages, the video page and its 2 tag archives, the home, `/404.html`) at 2 widths. 0 JS errors, 0 failed requests, no horizontal overflow, exactly one h1. Control fired. **Overflow sweep**, every page: `node tmp/wf3/fix-r2/sweep-overflow.mjs --base http://127.0.0.1:8891 --list tmp/wf3/fix-r2/allpaths.txt --widths 1280,390` (`24-sweep-overflow.log`): 298 loads (149 pages x 2), **0 overflowing**, control fired. Before the scaffold fix of section 10 (R2-X) the same sweep found 1: `/contact-lenses/` at 1280, 1289 > 1280 (`tmp/wf3/fix-r2/18-sweep-before-css.log`) |
| 16 | 404 at any depth (D7) | 3 servers with `--not-found` (8891: `dist`; 8892: the `RFEC_BASE=/preview/` build under `/preview/`; 8893: the default build copied under `/a/`), then `MSYS_NO_PATHCONV=1 node tmp/wf3/fix-r2/probe-404.mjs --cases ...` (one Chrome; `21-probe-404.log`) | Root deploy, a miss at `/no/such/deep/page/` and `/404.html`: status 404 and 200, **0 failed subresources**, stylesheet applied, logo decoded, 1 h1, 31 links all under `/`. `/preview/` build, a miss at `/preview/no/such/deep/page/` and `/preview/404.html`: the same, all 31 links under `/preview/`. Control, the default build served from `/a/`: **4 failed** (`/styles/scaffold.css`, the logo, `favicon-32.png`, `favicon-192.png`), stylesheet not applied, 30 links outside `/a/`, which is finding D7 itself. The verifier's own probe on the `/preview/` build, `node tmp/wf3/verify-r2/c12-render.mjs --base http://127.0.0.1:8892 --prefix /preview --widths 1280,390` (`22-c12-subfolder-base.log`): **34/34 ok**, including `/preview/404.html` at both widths (its run on the default build in `/a/` had `/a/404.html` fail with 4 local 404s). The servers were stopped by their PIDs |
| 17 | verifier probes, re-run | `tmp/wf3/verify-r2/c07-images.mjs`, `c08-seo.mjs`, `c13-extra.mjs`, `c06-links.mjs` on the final tree (`40-43*.log`) | **c07**: alt issues 32 -> 9. The 9 left are all file-name alts, each in `images.altsBlanked.onPages` (that probe does not read declarations); its KEEP, REFUSED and PLACEHOLDERS lines are identical to the verifier's run. **c08**: descriptions derived 9 -> 5, none 5 -> 9, bad 2 -> 0. Its 95 JSON-LD "value issues" are the carried BlogPosting fields on the 19 posts, 5 each (`headline`, `datePublished`, `dateModified`, `description`, the publisher logo's ImageObject `url`): that probe validates only the client-facts keys. Its robots and h1 rows are identical to the verifier's run. **c13**: heading rows 2 -> 1, the HD-1 row only; every other row is identical. **c06**: identical to the verifier's run (`rootAbsoluteIn404` 36, D7 by design for the default root build) |
| 18 | map (Q19) | `node tmp/map-shot.mjs` | Measured before round 1, not re-run: the map embed is unchanged. The keyless map of `/hours-location/` shows the Riverside Family Eye Care listing at 11841 Palm Beach Blvd (`tmp/map-hours-location.png`) |
| 19 | Cherry standalone | The `RFEC_CHERRY=embed` build served on 8795, then `node tools/render-check.mjs --base http://127.0.0.1:8795 --widths 1280 --paths /cherry-payment-plan/ --cherry --out tmp/final-render-cherry.json` | Measured before round 1, not re-run. Only the widget hero draws. The calculator, how-it-works and FAQ mount points stay empty. 5 `gql.withcherry.com` requests fail (`net::ERR_FAILED`), 4 analytics events fail, and 1 uncaught TypeError is thrown. Segment (`cdn.segment.com`) loads. Result: decision 4 |
| 20 | R untouched | `git -C <R> status --porcelain` (`50-r-untouched.log`) | 0 lines (HEAD `5bac030`), re-run after round 2 |
| 21 | evidence and inputs untouched | `sha256sum -c tmp/wf3/fix-r2/before/evidence-files.sha256`, `node tools/hashdir.mjs audit/raw assets/source` (`00-inputs-start.log`), and `node tmp/wf3/fix-r2b/inputs-hash.mjs --compare <snapshot>` at the start and the end of the round | The 11 stage and input files are byte-identical to the pre-round snapshot. `audit/raw` (148 files, `8c416c1c...`) and `assets/source` (269, `0aa693a4...`) are unchanged. Parallel agents wrote to this workspace during the round (`assets/generated/`, `assets/media/hero-river*`, `src/content/image-plan.json`): the build reads none of them. Every build input the snapshot covers is unchanged except the src/ and tools/ files of section 10 (`51-inputs-mid.log`, `73-inputs-end.log`) |

Spot checks (`node -e` probes): from round 1, not re-run in round 2. The pages they cover changed only as row 2 lists.
- 21/21 blog posts carry their date in the band.
- The appointment form shows no "CAPTCHA", its select holds 5 options, and the form has `data-needs-backend`.
- Fax, email and the PHI note are in `<main>` of `/hours-location/`, `/location/riverside-family-eyecare/` and
  `/contact-us/`.
- `/our-eye-doctors/` holds 3 doctor cards with the 3 bios.
- 35 accordion items render as `<details>`.
- There are 3 `<video>` elements and 1 YouTube embed.
- The raw sidebar's words are all in the rendered aside (3 pages).

## 7. Changes outside `src/` and `tools/`

- **`audit/failures.json` (stage evidence).** Until this audit, the canonical build rewrote it (R's merge of `build:*`
  items) as `JSON.stringify(..., null, 2)` without the stage's trailing newline. Its items were unchanged (38: 37 HTTP
  403 + 1 status 404), but its bytes were not. It is restored: `cmp` shows it identical to the stage copy
  `tmp/wf1/verify-imagery/rerun/audit/failures.json` (10,183 bytes, sha256 `ef6903f97ae79641...`). The build no
  longer writes it (`src/build.mjs`, section 3), and it stayed identical through the final builds and gates.
- **`src/content/chrome.json`.** Only its DOCUMENTATION fields were reworded to say "R" instead of naming R's practice:
  `schemaBase`, `authored[0-2].why`, `changes[0-1].what`, `extensions[1]` and `extensions[11]`, 8 leaves (diffed
  against the pre-change copy `tmp/chrome.json.before-reword`). Every value field is byte-identical; the rewording
  script asserted it. `node tools/write-facts.mjs` then re-verified the file against all chrome-bearing raw pages (exit
  0). Its sha256 is now `d1f096daeb16cf18...` (previously `760cea4c83136a07...`).
- **`tools/write-facts.mjs`.** Two comment/note strings were reworded the same way. Its sha256 is now
  `d6b97dd1dde01a3e...` (previously `aec9d66414aae4a4...`). Re-running it rewrote `facts/client-facts.json` with ONLY
  the `note` key changed: sha256 now `a6451ee4757906c8...`, previously `98d2032b94d208c5...`.
- **`docs/FACTS-EVIDENCE.md` (fix round 1, D10).** One paragraph was added after its two sha256 lines. It records the
  current sha256 of the three files and what changed. The evidence was re-produced in round 1:
  - a leaf diff of `chrome.json` against `tmp/chrome.json.before-reword` (8 of 187 leaves, all documentation fields);
  - a leaf diff of `client-facts.json` against `tmp/client-facts.before-note.json` (1 of 274, `note`);
  - `node tools/write-facts.mjs --out <scratch>`, which exits 0 with output byte-identical to `facts/client-facts.json`.

  No copy of the old `write-facts.mjs` survives, so its 2-string diff is marked UNVERIFIED there. Nothing else in that
  file changed.
- **`docs/OPEN-DECISIONS.md` (fix round 1, D7).** One row was added to section B: the deploy base of the host-level
  files (`404.html`, `.htaccess`, `_redirects`).
- **`docs/OPEN-DECISIONS.md` (fix round 2).** In section B, the deploy-base row now names the `RFEC_BASE` switch (D7).
  Two rows were added: the page's own structured data (R2-2: the FAQPage and VideoObject removals, the BlogPosting
  repairs) and the `/template/*` meta descriptions (R2-3). Nothing else in that file changed.
- **No stage or evidence file was written in round 2.** `audit/raw`, `assets/source`, `facts/`, `src/content/` and the
  stage JSON files are byte-identical (section 6 row 21). The `audit/` reports of section 2 are rewritten by every
  canonical build and gate run, as before.
- **`tools/write-architecture.mjs`.** The header comment (lines 4-5) was reworded. It was not re-run.
- **`src/content/site-map.json`.** It was regenerated after `audit/architecture-map.json` changed at 13:31:55, and the
  result is byte-identical.

## 8. Open items

**After the design build**, see section 12.5 first; **after wf5b**, section 11.5: the keep-image-parity "unmatched" rule (COMPONENTS gap I.51), the residue-grep
hit in `tools/ledger-decide.mjs`, P5 and P6 not done. The list below is the port's, as it was.

**Practice inputs** (docs/OPEN-DECISIONS.md):
- the Cherry application URL, or an embed test on the production domain;
- the form endpoint and notice (Q8);
- photos of Dr. Kristin Nelson, Dr. Maivys Longa, Heather, Xaiene and Jhonae, and the Bajio campaign photo;
- the HIPAA acknowledgement PDF (Q9);
- confirmation of the content licence (section C there);
- legal wording: the privacy-policy placeholder clause, and the disclaimer warranty clause after its 6 vendor sentences
  were removed;
- the 63 MB of video: ship it, or move it to YouTube (A.3).

**Behaviour kept as at source, flagged:**
- Q4: 8 aliases land on one unrelated blog post, so 12 links go there.
- Q7: `/404-page-not-found/` is indexable.
- Q3: review times are frozen.
- The 6 `/template/*` pages: recommend 410 or 301 at launch. They carry no meta description, as at source (decision 12).
- The 53 now-functionless "Read More+" words (A.7).

**Structured data (R2-2, decision 11), open in docs/OPEN-DECISIONS.md B:** the FAQPage (2 pages) and VideoObject (3
pages) removals. Each can be reversed only by publishing NEW structured data: an FAQPage of the dry-eye page's visible 3
questions, or a valid VideoObject for the eye-emergency video. The crawl does not hold the values a valid VideoObject
needs (a real upload date and a still thumbnail), so neither is built.

**Generated imagery** is not part of this workflow. The 12 omitted stock photos leave their slots empty. When the
image plan generates stand-ins, they must not show brand names (InMode, Lumecca, AlumierMD, the frame, lens and
carrier names) or named people (Degler, Nelson, Longa), as R's exclusion rules required.

**The scaffold** draws only one part of the mobile header: its logo replaces the desktop logo inside
`chrome.mobile.media` (a `<picture>` source). The model carries the whole header (`chrome.mobile`, section 5.7). The
scaffold has no show-if script. The design build replaces the SCAFFOLD files and must keep consuming the model
(section 5).

**Deploy base (D7, open: an operator decision).** `dist/404.html` is root-relative by necessity, under a base known at
build time. The default build serves the domain root. `RFEC_BASE=/sub/` builds the 3 host-level files for a subfolder,
and a browser probe shows its 404 page complete at any depth there (section 6 row 16). Which base to deploy to is the
operator's decision (docs/OPEN-DECISIONS.md B). A host that serves `404.html` from somewhere other than the base, or
`_redirects` / `.htaccess` that a host reads only at its own root, need checking on the chosen host.

**Not verified here:**
- Safari and Firefox rendering;
- the scaffold at widths other than 1280 and 390;
- screen-reader output;
- the Cherry embed on the practice's own domain.

## 9. Fix round 1 (the 10 verifier findings of `tmp/wf3/verify-r1/`)

Every fix is in `src/` or `tools/`; dist/ was only rebuilt. Each strengthened gate was first run on the pre-round
tree, where it reports the finding (section 6, "On the pre-round tree"), and then on the new tree, where it is clean.

| id | finding | decision and fix | proof (section 6 row) | status |
|---|---|---|---|---|
| D1 | The source's malformed `</br>` reached the home model and dist | `sanitize` reads a void end tag as the HTML parser does: `</br>` becomes `<br>`, and any other void end tag is dropped (1 on the whole crawl). Gates: tag-balance `void-close`; model-check rejects a void end tag in any html field | 5, 13, 15 | FIXED |
| D2 | The 17 archives' breadcrumb "Home" lost its link: the empty own segment was dropped, so Home became the unlinked last crumb | `prepare` reports `trailOwnEmpty`. The model keeps Home linked and appends the own segment `{ label: '', href: null, path: null, current: true }`, so the 5.1 invariant holds. The scaffold prints "Home » " as the source does (no empty item). JSON-LD is unchanged (non-empty segments only). The build fails if a trail ends on a linked segment with no empty segment after it. Gates: model-check (breadcrumb invariant), link-parity | 7, 13, 15 | FIXED |
| D3 | `localHref` returned `new URL(h).href` for external links, turning `https://www.alumiermd.com?code=ATwPQnFl` into `.com/?code=` | An external href is returned verbatim (trimmed; `//host` gets `https:`). It was the only external href on 148 pages that `URL` normalised. Gate: link-parity, external hrefs verbatim | 7, 15 | FIXED |
| D4 | The mobile header's own logo (988x400) was in no model | `chrome.mobile` gains `media` (read from the layout CSS: `(max-width: 768px)`) and `logo { url, w, h, alt, href }` (chrome.json `srcPatternMobile` / `altMobile`, matched by whole file name). The scaffold shows it inside that query (`<picture>` source), so the file is referenced on every page. Gate: model-check | 13, 15 | FIXED |
| D5 | 12 of the 14 `droppedOnPages` image drops were missing from their models' `declared` | `sanitize(..., { onDrop })` reports each image it drops by decision. The page model declares it as `image-dropped` with `where: 'prose'`; component and background drops gain `where`. The `dist/404.html` model no longer adds its own rows to `clone-removals.json` (its source page declares them), so `droppedOnPages` is unchanged (14). Gate: model-check (every `droppedOnPages` entry is declared in its model) | 13 | FIXED |
| D6 | `/template/header-2/`'s phone menu was dropped under a declaration ("site menus") that is untrue for it | `prepare` keeps any platform menu that is not a copy of the site menus. A site menu is one whose every item is a chrome.json menu label; only this menu fails that test. It prints its toggle label "Call Us" and its 3 items once, as a list. The 2 empty `tel:` items are unwrapped to "Call", as everywhere. The declaration now names site-menu copies only, and a new row declares the menu's duplicate hamburger copy. The lift fails the build unless every copy lists the same items and no other text exists. Gates: short-text-parity (page-menu labels), link-parity | 4, 7, 15 | FIXED |
| D7 | `dist/404.html` keeps 35 root-relative URLs (36 now: the mobile logo `srcset`), against "every internal URL page-relative" | No change. A host serves the 404 file at any depth, so page-relative URLs cannot work there. A subfolder deploy needs the base path at build time for `404.html` and for both redirect files. Recorded as an operator decision (docs/OPEN-DECISIONS.md B) | - | OPEN (operator decision) |
| D8 | The scaffold drew ratings as "★★★★★" text (8 cards); the source draws SVG icons | `stars()` draws one SVG star per point (a plain five-point path of the scaffold's own, `aria-hidden`), with no text glyph. Gate: words-added now reports any glyph that the source page, chrome.json and client-facts.json do not contain | 10, 15 | FIXED |
| D9 | The scaffold ignored `section.background[].media`: the home hero showed both photos at every width | `backgrounds()` makes a media image a `<picture>` `<source>` of its layer's base image. The scaffold fails a page whose media image has no base image in its layer (none on this site) | 15 | FIXED |
| D10 | FACTS-EVIDENCE.md recorded stale sha256 values | The current values are recorded, with re-produced evidence that no value changed (section 7) | section 7 | FIXED |

**Verifier scripts re-run on the new tree** (stdout only, logs in `tmp/wf3/fix-r1/verifier-rerun/`):
- `tagbalance.mjs`: 0 files with findings (before: 1).
- `modelcheck.mjs`: 149/149 models re-render byte-identical to dist; part 3 has 0 violations (before: 18).
- `links.mjs`: 0 problems. 142 identical external sets, 6 differing (before: 141 and 7); the `/` difference is gone, and `/template/header-2/` now differs only by its empty `tel:`. `rootAbs404` is 36.
- `tplmenus.mjs`: on `/template/header-2/` only "Return to top of menu" is absent (declared).
- `wordsadded.mjs`: the glyph tally no longer contains "★★★★★".
- `linkparity.mjs`: 3 missing (before: 20). Two are declared removals (the PDF and the EyeGlass Guide badge). The third is the AlumierMD link, which is now verbatim in dist. That script normalises the dist side with `new URL(href).href` but compares the raw side verbatim, so it reports this link before and after the fix.
- `imagescheck.mjs`: lists the home hero's phone photo as missing. It reads `<img src>` only, and that photo is now a `<source srcset>` that the browser shows at 390 px (row 15).

## 10. Fix round 2 (the 5 verifier findings of `tmp/wf3/verify-r2/`)

Every fix is in `src/` or `tools/`; dist/ was only rebuilt. Each new or strengthened gate was run on the pre-round tree,
where it reports the finding, and on the final tree, where it is clean (section 6). The verifier's own probes were
re-run on the final tree (section 6 row 17).

| id | finding | decision and fix | proof (section 6 row) | status |
|---|---|---|---|---|
| R2-1 | `page-model.mjs` set every child-page thumbnail alt to `''` (24 thumbs on `/contact-lenses/`, `/eye-care-services/`, `/eyeglasses/`), and 23 were readable at source. No gate read alts | The thumb keeps its source alt; the declared file-name rule still blanks the 24th. Every alt the build blanks is now declared per page (`images.altsBlanked.onPages`, 11 entries). The contract (5.1, 5.3, 5.8) says a theme renders the alt as given, and a decorative thumb (R's COMPONENTS F.1) is a declared blank (decision 13). Gate: keep-image-parity alt fidelity | 9, 17 | FIXED |
| R2-2 | BlogPosting (19 posts), FAQPage (2) and VideoObject (3, unparseable) source JSON-LD were dropped with no declaration | Every source block has a rule (decision 11). BlogPosting is carried, with 7 kinds of declared repair. FAQPage and VideoObject are removed, each with a reason checked against the raw pages (`tmp/wf3/fix-r2b/r22-ld.mjs`, `02-r22-ld-pre.log`). Any other type fails the build. Declared in `clone-removals.json` (3 new rows), `seo-repairs.json` `structuredData` (24 rows, every repair with from / to / why), the models (`declared` kind `structured-data`) and OPEN-DECISIONS B. Gates: seo-parity structured data and model-check control 4 | 10, 14, 17 | FIXED. The 2 removals are open operator decisions |
| R2-3 | `/template/footer/`, `/template/footer-2/` and `/template/header-2/` carried a derived meta description and og:description made from template copy (icon labels; a placeholder line naming another place) | No description is derived on a `/template/*` page, none of which has one at source. On every page, a link-only block never qualifies. 4 descriptions removed (also header-3's, a verified practice line, by the same rule); the 5 other derived descriptions are unchanged (decision 12). Gate: seo-parity description provenance | 10, 17 | FIXED |
| R2-4 | The heading-run merge inherited from R demoted "The right fit" (h2) to h3 on `/eyeglasses/kids-optical/` | The merge keeps every heading at its source level (section 3, deviation 3). Gate: heading-parity (new) | 5, 17 | FIXED |
| D7 | `dist/404.html` keeps 36 root-relative URLs: served from a subfolder, it loses its stylesheet, logo and favicons | The default (root) build is unchanged and correct for a root deploy. `RFEC_BASE=/sub/` builds `404.html`, `.htaccess` and `_redirects` for a subfolder; every other file is byte-identical. link-check reads the base (`outside-base`), and `serve.mjs --not-found` serves the 404 page at any depth for tests. In a browser, the base build's 404 page is complete at a deep missing path. The default build served from `/a/` still fails, and serves as the control | 7, 16 | OPEN: the operator decides the deploy base. The pipeline now builds for either |

**Found by this round's re-audit and fixed:**
- **R2-X, a horizontal overflow on `/contact-lenses/` at 1280 px.** The scaffold capped `.fig--plate` and
  `.fig--diagram` images at `max-width: 20rem`, which replaced the global `max-width: 100%`. A 300 px plate in a 12rem
  grid cell then pushed the page 9 px past the viewport (1289 > 1280). The round-1 render check never loaded that page;
  the pre-round tree overflows the same way. The fix in `src/styles/scaffold.css` is `max-width: min(20rem, 100%)`, and
  the all-page sweep went from 1 overflowing page to 0 (section 6 row 15). The design build replaces this file; the same
  rule applies to its CSS (a size cap must keep the 100% cap).
- **seo-parity had no control for the R2-2 failure itself**, a removal with no declaration. A control now withdraws each
  kind of REMOVE declaration in memory (a parseable FAQPage, an unparseable VideoObject), and each must be reported.
- **The page-model comment promised an exception no gate allows.** It said a theme "may print alt="" only when the
  thumb sits inside the same link as the card title". The alt gate rejects that, and R's F.1 puts the thumb outside the
  card's one link. The comment now states the rule of 5.8.
- **The BlogPosting row of `clone-removals.json` had two inexact claims.** Its "decoded (3 posts)" was a literal; the
  count is now computed from the repairs (still 3). It also said the build fails if "a date differs from the printed
  post date", but only `datePublished` is compared with it; `dateModified` is only checked to parse. The row now says
  so. Only that report's text changed; dist/ is byte-identical (`70-dist-hash.log`).

**Unchanged by round 2:** the image cache (0 encodes), the copy (sentence, short-text and word parity, the same
numbers), the links (link-check and link-parity, the same numbers), and the default `404.html`, `.htaccess` and
`_redirects`.

## 11. wf5b: the pipeline additions of the design build (DESIGN-SPEC 4.3) and the R3 fixes

Written by the pipeline agent of the design build (wf5b), 2026-10-02. Scratch, probes and logs are in `tmp/wf5b/pipeline/`.
The baseline snapshot (`before/`: dist, models, audit reports, the four sources, this file) was taken first.
`node tools/hashdir.mjs` confirmed that the baseline `dist/` was the recorded `ef842240...` (400 files), and a rebuild
reproduced it and the 149 models byte for byte (`00-base-build.log`).

### 11.1 The three items the port's final verifier left open (`tmp/wf3/verify-r3/`)

| id | finding | fix | proof |
|---|---|---|---|
| R3-1 | `/website-accessibility-policy/` printed "Email us at: ... Phone us at: ... Write to us at: ..." as ONE paragraph: the source opens three `p` and closes none, and the sanitiser dropped a nested `<p>` start tag without closing the open one | `content.mjs` `sanitize` keeps a stack of the open elements it sees and closes an open `p` in button scope at a `<p>` start tag, as the HTML parser does ("close a p element"). The other block start tags that close a `p` only pop it, because this pipeline already breaks at them. Counter `content.paragraphsClosedByP` | An independent tokenizer probe (`p-in-p.mjs --control`, `02-p-in-p-raw.log`) finds exactly 2 such tags on the whole crawl, both on that page. The build counts 2. The page now prints 3 paragraphs. A diff of all 149 models (`model-diff.mjs --control`, `04-r31-model-diff.log`) finds 1 model changed, in 3 leaves: the block html and its 2 derived views. With tags stripped the text is identical. `dist/`: 1 of 400 files differs. The verifier's own probe `tmp/wf3/verify-r3/c03d-pmerge.mjs` (`17-c03d-pmerge-after.log`): merged 2 -> 0, kept separate 0 -> 2. Its 1 "not located" case is a `div` inside the contact form markup, unchanged |
| R3-2 | The `src/build.mjs` header listed `audit/failures.json` as an input; the build never reads it | The header lists exactly what the build reads, and says why it never reads that file (a refused file is known from the inventory and the classification). The two comments that said "only READ here" and section 3 deviation 2 now say the same | `grep` over `src/`: no read of `failures.json`; every `P('...')` read of `build.mjs` is in the header list |
| R3-3 | 5.4 said prose html never carries `data-*`, yet `div.fig-grid[data-count]` and `ul.logo-grid[data-count]` are emitted | 5.4 now states the one attribute, the two elements and the census | A walk of the 756 rendered html fields of the 149 models finds exactly 4 `data-*`: `data-count` 7, 4 and 3 on the 3 fig-grids, and 4 on the 1 logo-grid. COMPONENTS D.2 already said so |

### 11.2 COMPONENTS section I gaps owned by the pipeline (all closed; COMPONENTS updated)

| gap | closed by |
|---|---|
| I.3 | P1: `srcset` on every image object (573 in the 149 models). `sections[0].background[0].image.crop` on the home: the 4:3 crop, 1067x800 cut from the 1920x800 photo at x 308 (36%), chosen by eye: the 55% framing COMPONENTS B.4 gave the uncropped fallback (x 469) puts the right edge through the staff member at the reception desk; x 308 ends the frame left of her and of the monitor showing the practice logo. Widths 360 / 540 / 720 / 1067. Its files keep the source's base name, so keep-image-parity still recognises the KEEP file |
| I.4 | P4: `art` on all 149 models; `art.title` on the 133 band models with no arch of their own; `art.inline` 11 |
| I.5 | P3: both logos ship byte-identical (sha256-equal to `assets/source/`; the build fails otherwise) |
| I.6 | The home's phone layer stays in `background[]` with `superseded` and is declared `background-dropped`. `audit/clone-removals.json` `droppedOnPages` gains it (15 pairs), so keep-image-parity accepts its absence |
| I.7 | `art.title` TB-team: Dr. Degler's own portrait (alt "Dr. Brittany Degler, O.D."), Jhonae's plate. Both are derived from the team cards that link to the page (`/`, `/our-eye-doctors/`, `/the-staff/`), which must agree |
| I.11 | `art.home`: H1 (hero-cutout), H2 (home-feature), H3 (graft-cutout, ACCEPTed in review-R-r3) |
| I.12 | `head.scripts`: always present; `[theme/site.<8 hex>.js]` on the design theme, `[]` on the scaffold |
| I.15 | `art.title` TB-contact on its 7 pages (the file named in `image-plan.json` `notPlannedHere.realImages`) |

### 11.3 DESIGN-SPEC 4.3 P1-P7

| id | what the pipeline does | where |
|---|---|---|
| P1 | `images.mjs` `variants()`: 360 / 540 / 720 / 1080 / 1440 / 1920 / 2400, each capped at the intrinsic width (or the crop's), reusing the main encode where it has that width. Model `srcset` `[{ url, w }]` on every image object (5.1). The crop (5.2). A variant reaches `dist/img/` only when a rendered page names it (step 4b copies it from the cache), so the scaffold build ships none and its `dist/` is unchanged | `build.mjs` 1, 1a, 1b, 4b; `page-model.mjs` `register()`, `markProse()`, the background loop |
| P2 | Theme mode switches on when `src/styles/riverlight.css` exists (`RFEC_THEME` overrides it). Theme mode ships ONE stylesheet: the shipped layers of `tokens.css` (after `/* ===== REDESIGN TOKENS ===== */`), `fonts.css`, `riverlight.css` and `motion.css` (after `/* @redesign-motion */`), concatenated in that order, as `dist/theme/riverlight.<8 hex of sha256>.css`. It also ships `dist/theme/site.<8 hex>.js`, every other `src/theme/**` file byte-identical (dot-files never), and the 5 hero-loop files of `assets/media/` under `dist/theme/media/`. The build fails if any of these holds: a layer or `site.js` is missing, a marker line is missing, a shipped layer holds `@import`, a `url()` of the bundle names no shipped file or another host, or a `src/theme/media/` file differs from the hero file of the same name. `@charset` is hoisted. `head.stylesheets` / `head.scripts` name the fingerprinted files. In scaffold mode nothing changes: `styles/scaffold.css` and no script | `build.mjs` "P2" block and step 4 |
| P3 | The two logo files are copied lossless (`images.mjs` `lossless`), and the same files serve the chrome, the og/twitter fallback, the JSON-LD logo, the BlogPosting publisher logo and the prose logos of the 4 template pages (5.7) | `build.mjs` 1 |
| P4 | `model.art` (5.10), after every model exists: `build.mjs` resolves the plan, the real arches and the team-card portraits, and `page-model.mjs` `artOf()` shapes them and checks every anchor. A band model with no arch, an anchor that matches nothing, a stand-in that replaces nothing declared, a plan page with no model, or a master whose sha256 is not its record's fails the build. `audit/clone-removals.json` `images.added` (146 rows: 132 arches with a file, 11 inline, 3 home) declares every image the art adds, and `altsBlanked.onPages` gains the TB-contact arch on `/hours-location/` (12 rows) | `build.mjs` 1d, 3b; `page-model.mjs` |
| P5 | **Not done** (optional). Carrying `alignleft`/`alignright` would change what the content pipeline extracts (the sanitiser drops source classes; a new figure class changes the model html and COMPONENTS D.2's census), which this stage was told not to do. COMPONENTS D.5's size rule places every figure | - |
| P6 | **Not done** (optional). The source's posters were designed images that were never harvested (declared `video-poster`, 2). COMPONENTS B.22 already draws a poster-less video as a navy CSS poster with "no invented frame". Choosing a frame of a real person from the practice's own video (one is on Jhonae's page, whose portrait is a placeholder) is an editorial call for the operator. To do it: extract a frame (`ffmpeg -ss <t> -i <video> -frames:v 1`), encode it through `images.web` (no AI label: real footage), set `video.poster` `{ url, w, h }` and reword the `video-poster` declaration | - |
| P7 | Every encode of a generated master (main and variants) gets the IPTC `trainedAlgorithmicMedia` XMP packet through webpmux, with `CreatorTool` (provider, model, cut-out model) and a description: "AI-generated illustrative image (Riverlight image plan <id>). Not a photo of this practice, its people, its patients or its results." The label is part of the cache key. A label on a file cwebp cannot encode is a hard error. The hero posters already carry the label and the clips carry it in their container tags; both ship byte-identical | `images.mjs`; `build.mjs` 1d `aiLabelOf` |

### 11.4 Verification (commands run in this stage; logs in `tmp/wf5b/pipeline/`)

| # | check | command (log) | result |
|---|---|---|---|
| 1 | baseline gates | `node tools/run-gates.mjs` (`01-gates-before.log`) | 11 of 12 pass; residue-grep fails on one pre-existing hit (11.5) |
| 2 | build | `node src/build.mjs --dump-models` (`09-canonical-build.log`); final run `RFEC_THEME=scaffold node src/build.mjs --dump-models` (`20-final-build.log`), forced to the scaffold because the parallel stages' theme files appeared during this stage (row 13) | exit 0, 0 failures; 148/148 + 404.html; 149 models; images: 235 source main encodes (237 minus the 2 logos, now lossless), 245 variant encodes (484 variant entries in all), 4 crop encodes, 119 art encodes, all AI-labelled; theme scaffold; art: titles 133, inline 11, home 3, 1 declared arch blank |
| 3 | model diff | `model-diff.mjs before/models <new> --ignore srcset,crop,art,scripts,superseded` (`06-model-diff-additive-ignored.log`, final `25-final-model-diff.log`) | 979 leaves differ on 149 models: 972 are the logo file name (P3), 4 the I.6 declaration, 3 R3-1. Nothing else |
| 4 | dist diff | `hashdir` + a normalising compare (scaffold build) | 249 of 400 files identical; 148 pages differ only by the logo file name; 1 page by R3-1 (plus the logo name); `dist/img`: the 2 WebP logos are replaced by the 2 source PNGs (sha256 equal) |
| 5 | gates after | `node tools/run-gates.mjs` (`10-gates-after.log`, final `21-final-gates.log`) | every number identical to row 1 (sentence 5,617 / 5,426 / 0 lost; short text 815 / 813 / 2; headings 743 / 742 / 1; tags 0; links 6,686 local refs, 0 broken; link parity 897 kept, 0 missing; KEEP 239 / 237 / 2, alt 242 / 231 / 11 / 10 / 0 / 0; SEO 0 mismatches, structured data 0 problems; words 100,293 / 0 added). model-check: `droppedOnPages` 15 (was 14), `declared` `background-dropped` 1. sr-decontaminate CLEAN. residue-grep: the same pre-existing hit (it scans 216 files, up from 215, because a parallel stage added `src/theme/site.js`) |
| 6 | reproducible | 2 `RFEC_DIST` builds, `node tools/hashdir.mjs repro-a repro-b dist --control` (`12-repro.log`, final `22-final-repro.log`) | IDENTICAL, 400 files, `3f1fd991bf47f0a36817b230f4067135242f55398842f88b0c93b7758685279c`; control fired; the models of the encoding build and the canonical build are identical |
| 7 | cold cache | the cache moved aside, a full re-encode (`13-cold-build.log`), then restored | 612 of 612 cache files byte-identical to the warm cache (source mains, variants, crop, 119 AI-labelled art files, logos, GIFs); `dist/` identical; no temp file left. After the crop moved to x 308, its 4 new files were deleted and re-encoded: identical (`26-crop-cold.log`) |
| 8 | model fields | `verify-fields.mjs --control` (`07-verify-fields.log`, final `23-final-verify-fields.log`) | 0 violations: 573 image objects, each `srcset` ascending, page-relative, every file in the cache at its stated width, the capped width set. The crop is 1067x800 with widths 360/540/720/1067. `head.scripts` is an array on 149. `art` is on 149; titles 133 by id; inline 11 with anchors and alts equal to the plan's; home 3. I.6 is marked and declared. Control fired (a reversed srcset, an edited anchor, a missing `head.scripts`) |
| 9 | P7 label | `grep -a -c trainedAlgorithmicMedia` on every generated file the models name (`08-p7-grep.log`, final `24-final-p7-grep.log`) | 119 of 119 files carry it; control: the TB-contact photo has 0. `webpmux -info` on `gen-h1.*`: XMP metadata plus transparency; `CreatorTool` "fal.ai fal-ai/flux-pro/kontext + fal-ai/birefnet/v2 cut-out" |
| 10 | P2 theme (fixture) | `RFEC_THEME_ROOT=tmp/wf5b/pipeline/fixture-theme RFEC_DIST=... node src/build.mjs` (`14-theme-a.log`) and `node tools/run-gates.mjs --dir tmp/wf5b/pipeline/theme-a` (`15-gates-theme-fixture.log`) | Exit 0. The bundle holds only the 4 redesign layers in order (the evidence lines above both markers are absent). Its name and `site.<hash>.js` are the sha256 prefix of their bytes. The script, the theme files and the 5 hero files are byte-identical; the dot-file is not shipped; there is no `dist/styles/`. The stylesheet link is page-relative at depth 0, 1 and 3, and `/theme/...` in `404.html`. Gates on that dist: all pass except the same residue-grep hit. Two theme builds are identical (408 files, `86c6ebda...`) |
| 11 | P2 fail closed | 8 fixture variants | Each fails (exit 1) with its own message: a broken `url()`, a missing tokens marker, `@import`, no `site.js`, no `fonts.css`, `RFEC_THEME=riverlight` without `riverlight.css`. `RFEC_THEME=scaffold` and a root without `riverlight.css` build the scaffold (exit 0) |
| 12 | link-check control | `node tools/link-check.mjs --dir <theme build>` | Before the fix: "control DID NOT FIRE" on a theme build, because its 404 control looked for the shipped stylesheet only under `styles/`. After it: fired on both the theme build and the scaffold build |
| 13 | the real theme (informational) | `RFEC_DIST=tmp/wf5b/pipeline/real-theme node src/build.mjs` in auto mode, with the styles and scripts stages' files as they stood at 02:36-02:45, then `node tools/run-gates.mjs --dir ...` (`18-real-theme-build.log`, `19-gates-real-theme.log`) | Exit 0, 0 failures: `theme/riverlight.0d278052.css` (105,387 bytes; the 4 layers in order; the font `url()`s `../theme/fonts/*.woff2` resolve), `theme/site.d7f5862d.js`, 3 font files, 5 hero files. Gates on it (still the scaffold templates): all pass but the same residue-grep hit; link-check counts 6,689 local refs (+3: the font `url()`s) and 2,022 external (+9: `data:` URIs in the CSS). Those files were still changing, so these numbers are not final |

### 11.5 Open (for the templates and integrate stages, and the operator)

1. **keep-image-parity fails on "unmatched" images (COMPONENTS gap I.51, new).** The alt-fidelity half of
   `tools/keep-image-parity.mjs` exits 1 on any `<img>` in `<main>` whose file the source page does not show as an
   `<img>`. Once the templates render them, these are all unmatched:
   - every `art` image (all but TB-contact on `/hours-location/`);
   - the hero and band posters (`theme/media/hero-river-poster*.webp`);
   - a model `background` photo printed as an `<img>` outside `figure.section__bg` (the hero frame, the hub arch).
   COMPONENTS 0.8 had said these pass; it is corrected. The build declares every art image per page
   (`audit/clone-removals.json` `images.added`). The gate must accept exactly those, the theme posters and model
   `background` images, and keep failing anything else, with a planted undeclared image as its positive control. The
   gate is not a pipeline file of this stage, so it is unchanged.
2. **residue-grep fails at baseline and after** on `tools/ledger-decide.mjs:8`: a comment there names the
   reference rebuild R's own project (the name residue-grep exists to catch). That file was added at 01:55 by another
   stage (wf7a) and is not a pipeline file; the pipeline did not change it.
3. **Deviation from this stage's file list, declared.** `tools/link-check.mjs` (one line, row 12) was changed because
   P2 moved the stylesheet, and the gate's control would otherwise fail on every design-theme build.
   `docs/COMPONENTS.md` was corrected where wf5b made it false: 0.1, 0.8, 0.12, A.1, B.4, the D.2 `p` row, I.3-I.7,
   I.11, I.12, I.15, the new I.51, and I.F (34 edits; its dated verification record is untouched).
   `audit/clone-removals.json` and `audit/build-report.json` are written by the build as before.
4. **Not verified here:** anything rendered. The scaffold prints no `srcset`, `crop` or `art` and no script, so their
   rendering, the A-21 budgets and the browser behaviour belong to the templates and integrate stages. The crop's framing
   WAS judged by eye: the full photo with the crop drawn, the strip at the desk with x markers, and the result
   (`tmp/wf5b/pipeline/crop-framing.png`, `crop-edge-zoom.png`, `crop-candidate-308.png`); that view moved it from x 469 to x 308.
5. **P5 and P6** were not done (11.3).

## 12. The design build (wf5b): Riverlight Aurora on the pipeline

Written by the integrate stage of the design build, 2026-10-02. Five stages built it: the pipeline additions (section
11), the styles, the script and the templates (each against `docs/COMPONENTS.md`, the binding markup contract; their
findings are its register sections I.H, I.I and I.J), and this stage, which built the four pieces into one site, looked
at it, probed it in a browser and fixed what it found at the source (register section I.K). Scratch, probes, screenshots
and logs: `tmp/wf5b/integrate/` (the numbered logs are in run order). `dist/` is never edited by hand.

### 12.1 Files

| file | role | written by (integrate changes) |
|---|---|---|
| `src/styles/tokens.css` | the generated, measured source tokens at the top (evidence, never shipped), then `/* ===== REDESIGN TOKENS ===== */` and the Riverlight tokens (DESIGN-SPEC 2): palette, type, space, radii, elevation, glass, aurora, motion; every colour the theme paints | styles (integrate: `--light-grade`, 12.2 item 4) |
| `src/styles/fonts.css`, `src/theme/fonts/*` | self-hosted `@font-face`: Atkinson Hyperlegible Next roman and italic, the Lexend digits face "RFEC Figures" (Q-1), size-matched `local()` fallbacks | styles |
| `src/styles/riverlight.css` | every component of COMPONENTS B-F and the D prose set; colours only through `var(--token)` | styles (integrate: 12.2 items 3, 4, 5, 6, 7, 8) |
| `src/styles/motion.css` | the 102 source `@keyframes` verbatim at the top (gate C11 evidence, never shipped), then `/* @redesign-motion */` and the Riverlight motion layer (reveals, tilt and glare, sheen, the accordion, the reduced-motion block) | styles |
| `src/theme/site.js` | the one script (COMPONENTS section 1): header metrics, reveals, parallax, aurora field and band `--p`, dropdowns and the `<dialog>` drawer, the carousel, tilt and glare, the river, the hero loop and its toggle, forms | scripts (unchanged here) |
| `src/lib/templates.mjs`, `src/lib/home.mjs` | the Riverlight templates: the page shell, chrome, the title band, the article and hub frames, every block, the home's 16 sections and its river route table | templates (integrate: 12.2 items 1, 2) |
| `src/build.mjs` | the pipeline (section 11): P1-P4, P7, the fingerprinted theme (P2) | pipeline (integrate: 12.2 item 9) |
| `src/styles/scaffold.css` | the port's SCAFFOLD stylesheet: **retired**, never shipped, kept as the pipeline's record | port |
| `tools/keep-image-parity.mjs` | accepts exactly the declared `images.added`, the theme stills and the KEEP CSS-background photos (COMPONENTS I.51) | templates |
| `tools/link-check.mjs` | its 404 control finds the stylesheet under `theme/` too | pipeline |
| `assets/media/hero-river.*` | the hero loop (wf4, Higgsfield, AI-labelled), shipped byte-identical under `dist/theme/media/` | wf4 (unchanged) |

**Output** (`node src/build.mjs`): `dist/`, 754 files:
- the 148 pages and `404.html`;
- `theme/riverlight.<8 hex>.css`: the shipped layers of tokens, fonts, riverlight and motion, in that order; 107,151
  bytes, 22,180 gzipped, against a budget of 22,528;
- `theme/site.<8 hex>.js`: 28,052 bytes, 9,653 gzipped, against a budget of 10,240;
- 3 fonts and the 5 hero-loop files;
- 585 images under `img/`: sources, P1 width variants, the hero crop, and 119 AI-labelled generated encodes;
- the 3 practice videos;
- the favicons, `sitemap.xml`, `robots.txt`, `_redirects` and `.htaccess`.

Both theme file names are the first 8 hex of their sha256, because GitHub Pages caches CSS and JS for 10 minutes.

### 12.2 Decisions of the integrate stage (each a source change; COMPONENTS register I.K)

1. **Hubs keep to the left bank (I.73).** With the article's title-band exit (`t3` at 40%) and the hub anchors on the
   right bank, the river crossed the first hub band and folded back into a hairpin: through the visit block's title and
   address on `/hours-location/` at every width, through the first band's text of the `/template/*` pages, and at p
   within 30 px of every unshielded hub line at the gutter. Hubs now leave the title band along its bottom edge (`t3`
   `d:-4%,112%`), keep to the left bank (`b{n}` `d:L,50% p:-7%,50%`) and enter the footer at the left edge (`z1`
   `-4%,46px`, `z2` `50%`, `z3` `104%`). `src/lib/templates.mjs` (`HUB_TITLE_ROUTE`, `HUB_ROUTE`, `HUB_FOOTER_ROUTE`).
2. **Home insurance anchors (I.74).** The prototype's `v1`/`v2` (`d:4%` / `d:2%`) ran the river's centre line 4 px from
   the insurance title at 1280x585, where the container is full width and its content edge is 48 px. Now `d:CL-80,22%` and
   `d:CL-80,92%` (`src/lib/home.mjs`): 44 px at 1280x585 after the band's reveal, 51 at 1440, 57 at 1024, 79 at 1920.
3. **The visit map (I.75).** On `/hours-location/` the hub band prints the visit block outside any `.rich`, so the map
   iframe kept the browser's 300x150: the 4:3 and radius rules of F.8 were written `.rich .embed--map`. Now
   `:is(.rich, .visit) .embed…`; markup unchanged.
4. **The hero light reads as the logo's teal (I.76).** The accepted clip and its posters render cerulean: 0-0.5 % of the
   rendered ribbon pixels lie in the logo-teal hue band. A static colour matrix on the light,
   `--light-grade: hue-rotate(-32deg) saturate(1.8)` on `.hero__light :is(img, video)` (the home loop, its posters and
   the title-band stills), moves 70-99 % of them into the band (12.3 row 17). No blend mode, never animated (DESIGN-SPEC
   2.8, 7). The clip is not re-encoded, so the make-loop calmness numbers stand. Declared departure from DESIGN-SPEC A3's
   "the grade is baked into the clip": a baked gradient map (teal light over a navy core, which no uniform matrix can
   give) needs a re-encode through `tools/make-loop.mjs`, its calmness numbers and the generated-media record (12.5).
5. **Crossings past the 1 px frost border (I.78).** Child-page thumbnails and team portraits broke `-48px` above the
   card's padding box, so they crossed its visible edge by 47 px at 1024 px and up and 31 px below (D4 asks 48 / 32).
   Now `-49px` / `-33px`.
6. **Focus inside the stuck navbar scrolled the page (I.79).** The navbar sits in `html`'s `scroll-padding-top`, so
   every focused nav control counted as obscured and the browser centred it. Each Tab between nav links, site.js's
   ArrowDown into a dropdown and its Escape back to the toggle moved the page up about 458 px at 1440x900. Now
   `.navbar :is(a, button) { scroll-margin-top: calc(-1 * var(--chrome-h)) }` (a static token, so D1 holds). Content
   focus lands as before, and site.js is unchanged.
7. **Product and device cards by width (I.80).** F.7's "3 / 2 / 1 columns" counted columns by viewport, but all 8 blocks
   sit in the article column. At 1024 px and up the cards were 190-230 px wide, and their long texts ran about 18
   characters a line. Now `repeat(auto-fill, minmax(min(100%, 300px), 1fr))` with the media chip at most 320 px tall:
   2 columns at 1440 and 1 at 1024 and on phones.
8. **The river is sized by its build, not by CSS (I.81).** `.river { width: 100%; height: 100% }` let every `#page`
   height change rescale the stale drawing until the debounced rebuild. Opening one FAQ item moved the river in the
   title band 41 px for about 1 s, and the weave clip moved with it off the arch. The SVGs now take the `width`/`height`
   attributes site.js writes at each build.
9. **The scaffold is retired (I.72).** The templates print the theme's fonts, posters and hero loop unconditionally,
   and a scaffold-mode build shipped none of them. `RFEC_THEME=scaffold` now stops the build with a message, and a
   theme root without `riverlight.css` fails closed in the P2 layer check (`tmp/wf5b/integrate/08-*.log`). For
   model-only comparisons, use `--dump-models` with `RFEC_DIST=<scratch>`.
10. **The protrusion probe hook (I.77).** COMPONENTS 1.2 resolved `data-cross` in "the protrusion's own section
    first". That pointed the second and third doctor photos of the `/our-eye-doctors/` team section at the FIRST
    doctor's plate. The rule is now "the nearest ancestor that holds a match", which gives the same element for every
    other protrusion. This touches probes only; no markup or script changed.
11. **Not changed:** `tools/ledger-decide.mjs`, another stage's file (12.5).

### 12.3 Verification (the final tree; logs in `tmp/wf5b/integrate/`)

`dist/` is served by `node tools/serve.mjs --root dist --port 8835 --no-open --not-found 404.html` (in the background, stopped
by its PID). Every browser check runs ONE headless Chrome (`tools/cdp-realsb.mjs`, a real 15 px scrollbar, at 1024 px and up;
`tools/cdp.mjs`, scrollbars hidden, at 768 and below), closes it in `finally` and exits. Each check fired a planted
positive control before its pass was counted. Rows 1-6 ran on the final build (`dist/` aggregate `f58ea692…`).
Logs 20-47 ran on earlier builds of this stage that differed
from the final one only in `riverlight.<hash>.css` (I.79-I.81) and in the home's two insurance anchors (I.74: `CL-64`,
finally `CL-80`); logs below 20 are the before-and-during evidence of the fixes. Rows 8 and 21 re-ran, on the final build,
the pages those last changes touch.

| # | check | command (log) | result |
|---|---|---|---|
| 1 | build | `node src/build.mjs --dump-models` (`19-build.log`) | Exit 0, 0 failures. 148/148 pages + `404.html`, 149 models. Theme `riverlight · theme/riverlight.679fd6b2.css · theme/site.d9622c39.js · 3 theme files, 5 hero media`. Images: 240 shipped sources, 484 width variants, 4 crop files, 119 AI-labelled art files, 0 new encodes |
| 2 | reproducible | `RFEC_DIST=tmp/wf5b/integrate/repro-a` and `-b` builds, then `node tools/hashdir.mjs tmp/wf5b/integrate/repro-a tmp/wf5b/integrate/repro-b dist --control` (`61-repro.log`) | **IDENTICAL**: 754 files each, aggregate `f58ea6924b03a05b03aa67507e50d0ec698d02443e89287d73153dfa1d830390`. Control fired (one byte appended names the file) |
| 3 | content gates (A-1) and decontamination | `node tools/run-gates.mjs` (`60-gates.log`); it runs `sr-decontaminate.mjs --project . --dir dist --strict` as its last gate | **11 of 12 gates PASS** with the numbers of the templates stage: sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; headings 743 / 742 / 1 declared / 0 findings; tags 0; links 12,913 local refs / 0 broken; link parity 897 kept / 0 missing; KEEP 239 / 236 present / 3 declared, alt fidelity 543 imgs, 0 unmatched, 0 findings; SEO 0 mismatches, structured data 0 problems; words 102,270 visible / 0 added, glyphs 0 added; model-check 149/149, 0 violations. **sr-decontaminate: CLEAN** (153 files, 0 blocker, 0 major). **residue-grep FAILS** on its one known hit, `tools/ledger-decide.mjs:8` (12.5). Every gate's control fired |
| 4 | the site-reforge gate's C11 and C13, replicated read-only | `node tmp/wf5b/integrate/c11c13.mjs` (`62-c11c13.log`; `sr-gate.mjs` itself writes project state, so it was not run) | C11: the 102 source `@keyframes` verbatim in `motion.css` (0 missing, 0 changed; control: a planted name is reported missing). C13: 296 tokens declared, 181 referenced by the other sheets, 12 raw colour literals outside `tokens.css` (3 in the verbatim source keyframes, 9 in the retired `scaffold.css`; 0 in the shipped redesign layers) |
| 5 | markup contract | `node tmp/wf5b/templates/verify-markup.mjs --dist dist` and `--control` (`11-verify-markup-*.log`, re-run on the final tree: `63-verify-markup.log`) | 0 findings on the 149 built pages; every count equal to the contract (link-line 9 on 7, lead 1, checklists 4, treatment runs 18 / 75 / 18, CTA bands 4, art 11); its 10 controls fire |
| 6 | budgets (DESIGN-SPEC 7) | `node -e` with zlib on `dist/theme/*` | CSS one file, 107,151 bytes, **22,180 gzipped** (default level; budget 22,528). JS one file, 28,052 bytes, **9,653 gzipped** (budget 10,240). Two fonts preloaded, the italic on demand. 0 `@import`, 0 `mix-blend-mode`, 0 infinite animations |
| 7 | LOOK | `node tmp/wf5b/integrate/shots.mjs --mode realsb --sizes 1280x585,1440x900` and `--mode hidden --sizes 390x844` on the 13 sample pages (first screen + a viewport-step series each), tiled with `tmp/wf5b/integrate/tile.sh` (ffmpeg) into `sheets/` | Viewed: the 3 first-screen sheets, the step sheets of the home (1280, 390), the dry-eye page (1440, 390), the hubs, `/hours-location/` (1440, 390), CooperVision, and a mix of the blog post, team, form, archive, sitemap and 404 pages. Found and fixed: I.73 (the hub hairpin), I.75 (the 300x150 map), I.76 (the cerulean light), I.80 (the 18-characters-a-line product cards). The rest matched the contract |
| 8 | overflow, cut-off, images, targets, protrusions, river, console, network | `node tmp/wf5b/integrate/probe.mjs --check layout` on the 13 sample pages at 1024x768, 1280x585, 1440x900, 1920x1080 (real scrollbar) and 360x740, 390x844, 768x1024 (`45-layout-*.json`), plus 16 more pages (the other hubs and templates, the brand, devices and location pages, the blog index) at 1280x585, 1440x900 and 390x844 (`46-more-*.json`); control `47-layout-control.log` | 195 page loads (91 + 48, and 56 of the 8 pages the last changes touch, re-run on the final build in `50-layout-*.json`): **0** horizontal overflow (`scrollWidth` against `innerWidth` and `clientWidth`), **0** content cut off by `#page`'s `overflow-x: clip` (the clip-aware pass: `scrollWidth` cannot see what `#page` clips), **0** broken images, **0** controls under 44x44 (the B.0 rule), **0** protrusion boxes over a text line or control (inflated 6 px, grown by the parallax range from the rest pose), **0** unshielded text lines within 40 px of the river's centre line, **0** JS errors, **0** failed requests, 1 h1 and 0 duplicate ids on every page. 654 crossings measured: at least 48 px at 1024 and up and 32 px at 768 and below (the 2nd and 3rd trio photos at p excepted: they sit inside the band by contract, B.11). Third-party requests only on `/hours-location/` and the location page (the declared maps, row 20). Control fired: a planted 3000 px box (in `main`: cut off; in `body`: overflow +1,735), a 5x15 link, a box over the h1 |
| 9 | first screen at 1280x585 and 390x844 (A-10) | from row 8 | Home: h1 494.8-564.6 px (limit 569), CTA 352.9-408.9 px. Interiors and `404.html`: h1 bottom 252-390 px, the first content block starting at 386-561 px. At 390x844 the first content block starts at 460-656 px (G5 asks 700) |
| 10 | first-screen opacity at load | `probe.mjs --check load` at 1280x585, 1440x900 (real scrollbar) and 390x844, the 13 pages (`42-load-*.log`) | 39 page loads: **0 elements below opacity 1** in the first viewport at the load event, at +1 s and at +5 s (decoration, and closed dropdowns that are `visibility: hidden`, excluded). Control: a planted h1 at opacity 0 is reported |
| 11 | stability (A-11, the D1 growth loop) | `probe.mjs --check stability`: header, navbar, hero frame, h1 and title pane at the load event, 0.5 s, 3 s and 15 s, with and without reduced motion (`04-stab-*.log` at 1280x585, 1440x900 and 390x844 on build `2f152af0`; `43-stab-realsb.log` at 1280x585 on the final build) | Every delta **0.00 px** (top and height). Header 136.59 px at 1440 and 1280x585, `--navbar-h` 93px at t0 and 15 s. Control: a planted write-back loop grows the navbar 80 px and is reported |
| 12 | hover on a revealed card, focus twin | `probe.mjs --check hover` (`40-hover.log`; control `20-hover-control.log`) | On `/whats-new/` (a `.rv` card, revealed and released), the home and `/eye-care-services/`: at rest the identity matrix; hover lifts 7 px and tilts 0.95 / 1.2 deg; leaving restores the identity and clears the custom properties; keyboard focus lifts 7 px with a 3 px ring (`:focus-visible`). Control: a card kept `.rv` gets no hover transform (the reveal-outranks-hover trap) |
| 13 | reduced motion | `probe.mjs --check rm` on the 13 pages at 1440x900 and 390x844 (`21-rm-*.log`, build `2f152af0`) | At every scroll step: 0 elements hidden, **0 running animations**, no `rv-ready`, no `.rv` left, no hero video and no toggle, 0 inline parallax, aurora or `--p` writes. The 3 practice videos are `controls preload="none"`; no `autoplay` attribute anywhere in `dist/`. Control: a planted infinite animation and a half-transparent element are reported |
| 14 | hidden while visible (A-12) | `node tmp/wf5b/integrate/a12.mjs` (an in-page rAF tracker of every pending `.rv`; the page scrolls itself 100 px every 100 ms) on the home, the dry-eye page, `/our-eye-doctors/` and `/whats-new/` at 1440x900, 1280x585 and 390x844 (`41-a12-*.log`) | **0 elements over 600 ms**; worst 533 ms (the home service cards, the 480 ms entrance plus the 40 ms stagger). Control: a planted `.rv` that never reveals is reported (700 ms in view). The first probe of this (`probe.mjs --check scroll`, `22-*.log`) read 753 ms on the home: its own opacity scan blocked the page's main thread |
| 15 | keyboard | `node tmp/wf5b/integrate/interact.mjs` (`40-interact.log`; control `30-interact-control.log`) and `header-focus.mjs` (`40-header-focus.log`) | **7 of 7**: the skip link is first and moves focus to `main`; a dropdown opens on Enter, ArrowDown enters it, Escape closes it and refocuses the 44x44 toggle; the carousel never moves in 6 s idle, ArrowRight goes to slide 2, the dots follow and the track takes the slide's height; Enter opens and closes an accordion (56 px summary); the drawer opens as a modal, focus starts on "Close Menu", 20 Tabs stay in it (one stop on the browser UI), Escape closes it, focus returns to the menu button, scroll unchanged; 0 JS errors. Focus inside the stuck navbar never scrolls the page (I.79). Control: without the dialog the drawer check fails |
| 16 | the hero loop (rule 4) | `node tmp/wf5b/integrate/ev.mjs --pre js-video-pre.js` at 1440x900, 390x844 and with reduced motion (`24-video.log`) | No `<video>` in the markup; created after the load event (load 342 ms, insert 425 ms) with `muted loop playsinline preload="none" aria-hidden tabindex=-1`, no `autoplay`, no `src` at insertion (sources appended); plays `hero-river.webm` at 1440 and `hero-river-phone.mp4` at 390, toggle present. Reduced motion: no video, no toggle |
| 17 | the hero light (2b, I.76) | `node tmp/wf5b/integrate/hero/hero-shots.mjs` (the rendered light alone and the visitor's view: the poster and frames seeked to 1, 3, 5, 7 s) and `hero/hue.mjs` | Ribbon pixels in the logo-teal hue band (164-188): **before 0-0.5 %** at 1280x585 and 0 % at 390x844 (94-100 % in 190-217, cerulean); **after 70-97 % at 1280x585 (poster 89 %) and 79-99 % at 390x844 (poster 89 %)**, other hues 0-2.8 %. The clip, its calmness record and its sizes are unchanged |
| 18 | weight (A-21; the local server is uncompressed, so these are upper bounds) | `probe.mjs --check weight` after load and a full scroll, cache off (`25-weight-*.log`, build `2f152af0`) | Home 1440: **890.5 KB** with the loop (295.3 KB), budget 900. Interiors 1440: 295.2 and 262.6 KB (budget 320; the 104.6 KB stylesheet is 22 KB gzipped on a real host). 390 (DPR 1): 773.1 home, 252.3 and 244.8 interiors. 0 third-party bytes, 0 practice-video bytes |
| 19 | rendered contrast (A-5) | `node tmp/wf5b/integrate/contrast-dist.mjs` (the styles stage's method B on the built pages: text hidden, the real background under every line box, river and bands included, reduced motion; `26-contrast-*.log` on the 13 pages at 1440x900, 390x844 and 1280x585 on build `2f152af0`; `44-contrast.log` on the final build) | **0 AA failures**: worst p05 4.68 (the KN plate's name at 1280x585), 4.91-5.51 elsewhere. Control: `#9a9a9a` text reads 2.63 and fails. One first-run "failure" (1.35) was the closed FAQ answer's phantom box over the CTA band; the probe now gates text on `checkVisibility()` |
| 20 | third parties | rows 8 and 18 | 0 third-party requests on every probed page except the declared Google Maps iframes of `/hours-location/` and the location page (COMPONENTS I.50) |
| 21 | the river does not drift (I.81) | `ev.mjs ... --js js-river-drift.js` on the dry-eye page at 1440x900 (`54-river-drift.log`, final build) | Opening the first FAQ item (+82 px) leaves the river's start in the title band at 427.9 px at 0, 60, 120, 300, 600 and 1200 ms (before the fix it moved to 469.0 px until the rebuild). The final-build re-runs of rows 10, 11 and 15 (`51-load.log`, `52-stab.log`, `53-interact.log`): 0 elements below opacity 1, every delta 0.00 px, 7 of 7 |

### 12.4 Not verified here

- Safari and Firefox (every browser number above is headless Chrome on this machine); a real phone at DPR 3 (the phone
  rows ran at DPR 1); real-GPU frame timing and idle cost (A-22, Q-14).
- Screen-reader output; 200 % text zoom (A-4) and the 320 px reflow width.
- The A-13 pixel-step seam scan and the A-15 shadow-order probe were not re-run on `dist/` (the styles stage ran its
  versions on its gallery); this stage's river check is the 40 px clearance of row 8.
- 120 of the 149 outputs (the 148 pages and `404.html`) were built, gated (row 3) and markup-checked (row 5) but not opened
  in a browser: rows 8-21 cover the 13 sample pages and 16 more.

### 12.5 Open (for the operator and the next stage)

1. **residue-grep fails** on `tools/ledger-decide.mjs:8`: its "Adapted from ..." comment names the reference rebuild's
   own workspace (the string the gate exists to catch). The file belongs to another stage (wf7a), and no build stage of
   wf5b changed it. Rewording that one comment (for example to "Adapted from R's tools/ledger-decide.mjs") clears the
   gate; nothing else fails.
2. **The hero light's navy.** The regrade (12.2 item 4) makes the light read as the logo's teal; it cannot also give it
   a navy core. A baked gradient map needs a re-encode through `tools/make-loop.mjs`, its calmness numbers, the sizes, the
   poster's XMP label and the `audit/generated-media.json` record. IMAGE-PLAN's mean-saturation floor (0.2) is still not
   met by the clip itself (0.094); rendered with the filter, the light's ribbon pixels average 0.35-0.57.
3. **Maps on load (COMPONENTS I.50).** The two live Google Maps iframes of `/hours-location/` and the location page are
   the only third-party requests (DESIGN-SPEC Q-11 and 7 sanction them; A-3 reads "0 on every page"). A click-to-load map
   would need a declared label.
4. Everything section 8 and section 11.5 already list for the practice: the 5 portraits and the Bajio photo, the
   content licence, Cherry, the form endpoint and notice (Q8), the HIPAA PDF, the video captions, the deploy base.

## 13. QA round 1 (wf6): fixes, salvage audit and verification

Written by the fix-1 stage of QA round 1 (resumed), 2026-10-02. Input: the 79 findings that independent verifiers
confirmed against the frozen build `tmp/wf6/snapshot/` (aggregate `f58ea692…`; `tmp/wf6/salvage/round1-confirmed.json`).
Two earlier fix runs were paused mid-work and left their edits in the tree with no record; this stage audited both
(13.2), finished the majors and the content findings (13.3) and recorded every contract departure in COMPONENTS register
I.L. The minor and nit findings of the other lanes belong to the next stage (fix-2); 13.5 lists what it inherits, and
13.6-13.10 are fix-2's record (its verdicts, the header group re-tested together, the final gates and build).
Probes, logs and screenshots: `tmp/wf6/fix1r/` (`p/` the probes, `logs-*/` their output, `v/<lane>-old|new/` the
verifiers' own probes cloned to run against both builds). `dist/` is never edited by hand.

### 13.1 Method

- **Baselines.** There is no git history, so each tree was rebuilt and proven by its build hash. B0 (the snapshot's
  source) is `tmp/wf6/fix1/salvage/orig/` (reconstructed by the first paused fix-1 run; it builds to `f58ea692…`, the
  snapshot). B1 (after the first paused fixer) is B0 plus `tmp/wf6/fix1/salvage/fixer.diff`; reversing the second
  paused run's 28 exact edits (`tmp/wf6/fix1r/salvage/reconstruct-b1.mjs`, forward replay byte-equal) gives the same
  files, and B1 builds to `6f09d61c…`, the build that run recorded. B2 (the tree this stage found) builds to
  `31e517d6…`. The final tree builds to `1103fa32…` (13.4).
- **Old and new.** Old = `tmp/wf6/snapshot` served on 127.0.0.1:8871, new = the build under test (a copy of `dist/`)
  on 8872, both by `tools/serve.mjs --no-open --not-found 404.html`; one headless Chrome at a time
  (`tools/cdp-realsb.mjs`, a real 15 px scrollbar, for the desktop views; `tools/cdp.mjs` for phones).
- **Verdicts.** FIXED only when the finding's own probe (the verifier's, re-run) fails on old and passes on new.
  OPEN-OPERATOR when the fix needs the practice's content or decision (OPEN-DECISIONS D). NOT-A-DEFECT with the
  measurement. DEFERRED with the reason.

### 13.2 Salvage audit of the two paused runs

First paused fixer (`tmp/wf6/salvage/fix-agent-transcript.jsonl`; its full diff `tmp/wf6/fix1/salvage/fixer.diff`, 13
files). Every change unit was measured with its own probe (`tmp/wf6/fix1r/p/p01-p22`, adapted from its `tmp/wf6/fix/`
probes; chain `logs-audit1/`) on B2 against the snapshot:

| unit | finding | files | decision | measurement (old → new) |
|---|---|---|---|---|
| sidebar and map-card `minmax(0, 1fr)`, pill above the pin | LAYOUT-1 | riverlight.css | KEEP | `p01-sidebar`: 27 → 0 of 48 font/viewport conditions fail; control (a planted 500 px card) fired |
| promo ring on `.fig__media:has(a:focus-visible)` | A11Y-1, LAYOUT-9 | riverlight.css | KEEP | `p07-rings`: ring share 0 → 0.80 (1280x585 DPR 1.5) and 0.79 (390), weakest side 1.02 → 6.03:1; control fired |
| the top bar sticks while it holds focus | A11Y-2 | riverlight.css | KEEP | `p12-header`: stops at -44..0 → 0..44; scrollY 2500 → 1393 before, 2500 kept after |
| forced colours `Canvas` fills; logo plate; reduced transparency and more contrast | A11Y-3, A11Y-14, A11Y-19 | riverlight.css | KEEP (A11Y-19: the drawer panel keeps its gradient, fix-2) | `p13-misc`: navbar, sub, drawer and glass from transparent + blur to `rgb(255, 255, 255)`, no blur |
| `will-change` on the 7 band overlays and on the river | MOTION-1, PERF-1 | motion.css | KEEP | 13.3 |
| UI font sizes in rem; nav breakpoint `75em` | LAYOUT-11 | riverlight.css, templates.mjs, site.js | KEEP | `p17-fontsize`: no element changes its font size at 16 px (3,371 compared; the 4 "differences" it prints are the location card gaining the `.is-tall` class, which changes its key, at 17 px both times); the UI text scales at 20, 24 and 32 |
| the nav wraps under text spacing | LAYOUT-6 | riverlight.css | KEEP | `p05-spacing`: nav 5 → 0 fails; `p06-nav-default`: 0 rect changes at the default settings |
| Escape dismisses a hovered dropdown; focus handed to the toggle | MOTION-2, MOTION-3 | riverlight.css, site.js | KEEP | `p10-nav`: FAIL → PASS at 1440x900 and 1600x662; the keyboard control is unchanged |
| the drawer's close sends focus to a rendered control | MOTION-9 | site.js | KEEP | `p08-drawer`: `BODY` → `a.mainnav__link` |
| the scroll lock keeps the scrollbar gutter | LAYOUT-12, MOTION-4 | riverlight.css | KEEP (0.2-1.8 px residual, fix-2) | `p08-drawer`: reference heading shift 6.5-23.4 → 0.2-1.8 px |
| the narrow header below 360 px | LAYOUT-3, A11Y-7 | riverlight.css | KEEP | `p03-header-narrow`: 149 → 0 pages overflow at 320 (0 at 316) |
| the statement word may break under text spacing | LAYOUT-7, A11Y-6 | riverlight.css | KEEP | `p05-spacing`: hero 12 → 0 fails; one line at the default spacing |
| short-desktop mode to 820 px tall, glasses offset, hub intro inset | LAYOUT-4, LAYOUT-14, LAYOUT-13 | riverlight.css, tokens.css, home.mjs | KEEP | `p16-smode`: h1 cut 29 → 0 of 144 views, glasses clearance under 12 px 10 → 0, hub first line whole at 1280x585; 1280x585 and 1600x662 identical old and new; looks: `p24-shots` |
| halos under the skip-link and hero-toggle rings; the video's ring on its frame | A11Y-15, A11Y-16, A11Y-5 | riverlight.css | KEEP | `p07-rings`: skip 1.59 → 7.91:1, toggle 3.19 → 5.57:1, video share 0 → 0.93 (4.07:1) |
| dots above the track; track `role=group`, slides `aria-hidden`; refit on a slide resize | MOTION-5, A11Y-10, LAYOUT-5 | home.mjs, riverlight.css, site.js | KEEP (MOTION-5 residual: the CTA still drops below the fold at 1366x657, fix-2) | `p11-carousel`: the dots stay under the pointer at 360-1440 (the probe still prints FAIL for MOTION-5 at 1366x657 and 1440x900: the dots move 9-10 px there, and the CTA drops); LAYOUT-5 FAIL → PASS; the track is a named group |
| idle dot token `.55` | A11Y-9 | tokens.css | KEEP | `p11-carousel`: 1-1.59:1 → 3.81-3.87:1 |
| the sticky card sticks only when it fits (`.is-tall`) | LAYOUT-8 | riverlight.css, site.js | KEEP | `p13-misc`: held below the fold 3 → 0 |
| a lone last card is centred | LAYOUT-16 | riverlight.css | KEEP | `p13-misc`: off-centre 173-409 → 0 px |
| the header unsticks at 480 px tall and below | A11Y-8 | riverlight.css | KEEP | `p12-header`: navbar share of the viewport 19.7-30.7 % → 0 |
| print stylesheet | MOTION-6 | riverlight.css | KEEP (4 of 29 FAQ answers still missing, fix-2) | `p09-print`: page 1 text 83 → 481 characters; FAQ answers printed 0 → 25 of 29 |
| `--dur-fade` 320 ms | MOTION-7 | tokens.css, motion.css | KEEP | `p19-a12`: worst reveal 593-600 → 417 ms (A-12: 600) |
| cut-outs upward only; the loop pauses once faded | MOTION-8, PERF-7 | site.js | KEEP | `p13-misc`: samples below rest 24-31 → 0; frames decoded when faded 72-73 → 0 |
| LCP preloads to the real LCP element; arch eager; the first 4 flow images eager | PERF-4, PERF-5 | home.mjs, templates.mjs | KEEP | `p18-lcp`: hinted LCP 0 → 5 of 5 sample pages at 1440, 1280x585 and 390; lazy images in the first screen 1 → 0 pages |
| YouTube `data-src` loader, `noscript` copy, no-JS CSS rule and the DEPLOY.md claim | PERF-6 | templates.mjs, site.js, riverlight.css, DEPLOY.md | **REVERT** | 0 of 149 pages carry `data-src`: the one embed is emitted by `page-model.mjs markProse`, not by the template that was changed, and the DEPLOY.md line ("no third-party request at page load") was false |
| `autocomplete="bday"` | A11Y-12 | forms.mjs | KEEP | present on `f9-17` only |
| `h1--xlong` from 75 characters | LAYOUT-10 | templates.mjs | KEEP | `p20-firstblock`: the scleral post 724.8 → 671.1 px (`/template/header/`, 732, is unchanged: 13.5) |
| archive Open Graph; breadcrumb item URL; the 404 head; `twitter:description` | CONTENT-3, CONTENT-12, CONTENT-14, CONTENT-4 | page-model.mjs, templates.mjs, build.mjs | KEEP | the verifier's `head-probe` (13.3) |
| CSS minifier, JS comment strip | PERF-12 | util.mjs, build.mjs | KEEP | `p15-cssom`: 950 = 950 rules on B2 and 956 = 956 on the final build, 0 differences, control fired; `js-strip-check`: identical token streams (9,160 tokens), control fired; CSS 22,180 → 19,547 bytes gzipped |
| XML namespace URIs are not connect hosts | CONTENT-11 | tools/csp-hosts.mjs | KEEP | its control fires; the derived policy has no `www.w3.org` |
| alias status wording; the team-arch row; the CSP; caching | CONTENT-15, CONTENT-11, PERF-13 | DEPLOY.md, IMAGE-PLAN.md | KEEP | the text matches the build |
| the Forms section of DEPLOY.md | CONTENT-1 | DEPLOY.md | **REVISE** | it described the old self-post; rewritten for the inert forms |

Second paused run of this stage (`tmp/wf6/salvage/fix1-paused-transcript.jsonl`, 217 tool calls). Its edits are exactly
the 28 operations B1 → B2; on the output they change only 47 pages' og:image, 13 archive descriptions, the 2 form tags,
3 social lines, the CSS and the JS:

| unit | finding | files | decision | measurement |
|---|---|---|---|---|
| `method="dialog"` and the site.js submit cancel | CONTENT-1 | forms.mjs, site.js | KEEP | 13.3 |
| section 12 of the facts writer: the map link, figure texts, claim contexts | CONTENT-2 | tools/write-facts.mjs, facts/client-facts.json | **REVISE** | it declared 12 figure names; the gate reads only figures over 20 characters and traces a figure that CONTAINS a declared quote, so the 6 short names ("Heather", "Precision1®" …) were never needed and widened the gate: with them an invented `<figure><blockquote>Heather was wonderful and kind with my kids.</blockquote></figure>` passed (SOURCED 0/0); now only the 6 read names are declared and the same plant is a blocker (`tmp/wf6/fix1r/content/fab-ctl*.log`). All 12 are still checked against the raw pages, and the writer's planted control (a changed product name) still stops it |
| the social line → icon list, and its focus ring | CONTENT-13 | templates.mjs, riverlight.css | KEEP | 13.3 |
| the archive description removal, `descriptionsRemoved`, the seo-parity rule and its control | CONTENT-3 | page-model.mjs, build.mjs, tools/seo-parity.mjs | KEEP | seo-parity PASS (description 130 same, 18 repaired); its withdrawn-removal control fires |
| og:image as the source's JPEG or PNG | CONTENT-16 | build.mjs | KEEP | 13.3 |
| `--p` non-inherited (`@property`) | MOTION-1, PERF-1 | motion.css | KEEP | all 161 `[data-band]` hosts are hosts of the 7 overlay rules, so the explicit `--p: inherit` reaches every consumer; 13.3 |
| the hours stack under their day below 8.5em; the pill may use the card's end padding | LAYOUT-1 | riverlight.css | KEEP | `p01-sidebar`: 0 of 48 fail; at the default font the card is 13-17em wide, so the query never applies there |

### 13.3 The findings of this stage (the 12 majors and the 17 content findings)

Each row: the verdict, what changed, the probe (the verifier's own, cloned to `tmp/wf6/fix1r/v/<lane>-old|new/`, unless
named otherwise) and its numbers on the frozen snapshot (old) and on the final build (new). Logs: `tmp/wf6/fix1r/logs-final/`.

| id | verdict | change (files) | probe | old → new |
|---|---|---|---|---|
| CONTENT-1 (major) | FIXED | `src/lib/forms.mjs` (`method="dialog"`), `src/theme/site.js` (cancels `submit` on `form[data-needs-backend]`); DEPLOY.md, COMPONENTS 1.10 and E, BUILD-NOTES 5.5, OPEN-DECISIONS A.5 | `probe-forms.mjs` (1280x585 DPR 1.5, real scrollbar, every field filled, a real click on Submit) and `p22-forms-nojs.mjs` (scripts disabled) | valid submit: 1 POST of all 9 (appointment) and 7 (contact) fields, page reloaded, 0 values left → 0 requests, no navigation, 7 and 6 typed values kept, scripts on and off. Controls: an empty submit sends nothing on both; a planted notice still shows on both |
| CONTENT-2 (major) | FIXED | `tools/write-facts.mjs` section 12 (map link, 6 figure texts, 6 claim contexts, each checked against `audit/raw`), `facts/client-facts.json` (written by the tool, two runs byte-identical) | `sr-fabrication.mjs --project . --strict` | FABRICATION, 9 blocker / 137 major of 707 claims (the verifier's run on the snapshot) → SOURCED, 0 / 0 of 707. Control: a page with a planted statistic, rating, volume claim and an invented review gives 4 blockers. No copy was removed |
| CONTENT-3 | FIXED | `src/lib/page-model.mjs`, `src/build.mjs` (`openGraph`, `descriptionsRemoved` in `audit/seo-repairs.json`), `tools/seo-parity.mjs` | `head-probe.mjs` c3 | the 13 noindex archives: og:title = their own title 0 → 13, og:type website 4 → 13, the post's og:description and meta description gone 0 → 13, the logo as og:image 3 → 13 |
| CONTENT-4 | FIXED | `src/lib/templates.mjs` | `head-probe.mjs` c4 | `twitter:description` 0 → 127 of 149 (every page with an og:description, equal to it); the twitter:title rule is unchanged (documented in 5.1) |
| CONTENT-5 | NOT-A-DEFECT | none | `ffprobe` and `grep -a -c trainedAlgorithmicMedia` on `dist/theme/media/*` | the 3 loop files carry the AI label as the container's comment / DESCRIPTION tag and 0 IPTC packets; both posters carry 1 IPTC packet. That is what DESIGN-SPEC R7 and IMAGE-PLAN rule 7 prescribe for the video. An XMP box in the MP4s would need `exiftool` (not installed) and a re-encode record |
| CONTENT-6 | OPEN-OPERATOR | none | `probe-render.mjs` c6 | unchanged ("a week ago" for a 16-day-old review); OPEN-DECISIONS D and Q3 |
| CONTENT-7 | OPEN-OPERATOR | none | `probe-render.mjs` c7 | unchanged; OPEN-DECISIONS D |
| CONTENT-8 | OPEN-OPERATOR | none | `head-probe.mjs` c8, `probe-render.mjs` c8 | unchanged (6 words, the source's title and description); OPEN-DECISIONS D and A.4 |
| CONTENT-9 | OPEN-OPERATOR | none | `head-probe.mjs` c9, `probe-render.mjs` c9 | unchanged; OPEN-DECISIONS D, Q13 |
| CONTENT-10 | OPEN-OPERATOR | none | `head-probe.mjs` c10 | unchanged (`index`, second in the sitemap); OPEN-DECISIONS D, A.1 Q7 |
| CONTENT-12 | FIXED | `src/lib/page-model.mjs` | `head-probe.mjs` c12 | trails whose last item is not the page's own URL 8 → 0 of 123 |
| CONTENT-13 | FIXED | `src/lib/templates.mjs` (D.7), `src/styles/riverlight.css`, `tools/seo-parity.mjs` (its footer control plants its own labels) | `probe-render.mjs` c13; `p24-shots.mjs` | visible label links 4 → 0 on each of the 3 pages; 4 icon links with the labels as `aria-label`, a 3 px focus ring; visible words 102,270 → 102,222 (words-added: 0 added) |
| CONTENT-14 | FIXED | `src/lib/templates.mjs` | `head-probe.mjs` c14 | `404.html` canonical and og:url `/404-page-not-found/` → none |
| CONTENT-15 | FIXED | `docs/DEPLOY.md`, `docs/IMAGE-PLAN.md`, `tmp/evidence/alias-redirects.json` (its note) | reading against `audit/site-inventory.json` and the build | the alias status is UNVERIFIED in all three (the crawl stored no status), and the build serves one 301; the IMAGE-PLAN row lists the 5 team arches with Jhonae's "J" plate |
| CONTENT-16 | FIXED | `src/build.mjs` | `head-probe.mjs` c16 | og:image WebP 57 → 0 pages (png 105, jpg 39, jpeg 5); 36 byte-identical JPEG/PNG copies, every one present |
| CONTENT-17 | OPEN-OPERATOR | none | `probe-render.mjs` c17 | unchanged (53 labels); OPEN-DECISIONS D and A.7 |
| A11Y-1 (major), LAYOUT-9 | FIXED | `src/styles/riverlight.css` | `21-promo.mjs`, `22-promo-ctl.mjs` (a real Tab, 1280x585 DPR 1.5); `v07b-promo-ring.mjs` | ring painted on 0 → 4 of 4 sides, 1.01-1.05 → 5.75-10.44:1; with reduced motion 0 → 4 sides; navy pixels in the ring band 0 → 13,743 (93.6 %, the planted controls' count) |
| A11Y-2 (major) | FIXED | `src/styles/riverlight.css` | `24-topbar.mjs` (scrolled to 2500, Shift+Tab x3 from the logo) | the three top-bar stops at -44..0, out of view, the page jumping to 1393 (1280x585) / 922 (1440x900) / 2001 (390x844) → in view at 0..44 (8..52 at 390), scrollY 2500 kept |
| A11Y-3 (major) | FIXED | `src/styles/riverlight.css` | `25-forced.mjs` (forced colours, dark and light) | Canvas share: dropdown 48.8 / 67.7 % → 99.9 / 99.9 %, drawer 45.6 / 48.7 → 95.6 / 97.5, navbar 79.9 / 80.2 → 98.9 / 98.9; the emulation control fires |
| A11Y-4 (major) | OPEN-OPERATOR | none | 0 `<track>` on both builds; `04-ffprobe.txt` | captions need a transcript of the speech; OPEN-DECISIONS D |
| LAYOUT-1 (major) | FIXED | `src/styles/riverlight.css` | `v01-sidebar-fs.mjs`, `v12b-pill-carousel.mjs` (real scrollbar, Chrome font 16-32) | rows with a card wider than its track, clipped or text past the viewport 40 → 0 of 64; the map pill's label cut by 22.9-66.1 px → 0 (it wraps); the default font unchanged |
| LAYOUT-2 (major) | OPEN-OPERATOR | none | `v02-promo.mjs` | still one image of text at every width (no live text), as at the source; OPEN-DECISIONS D |
| MOTION-1 (major), PERF-1 (major) | FIXED (A-22's scripted scroll passes at all three views, CPU x4 included; residual below) | `src/styles/motion.css` (`will-change` on the 7 band overlays and the river; `--p` registered non-inherited; a view timeline per band where scroll-driven animations exist), `src/theme/site.js` (no `--p` writes where the CSS drives the overlays) | `p14b-jank-cpu.mjs` (CPU x4, rAF-driven scripted scroll and a wheel gesture, 3 runs each, reduced-motion low control, planted 45 ms control); the verifiers' `v11-jank.mjs` (MOTION-1) and `jank.mjs` (PERF-1), unthrottled; `p23-bands.mjs` | **CPU x4, frames over 33 ms, median (range):** 1440x900 rAF 0.9 % (0.21-5.69) → 0 % (0-0), wheel 17.55 % (8.6-25.51) → 1.08 % (0.85-1.79); 1280x585 DPR 1.5 rAF 0.66 % (0.22-0.67) → 0 %, wheel 8.79 % (7.75-10.25) → 0.43 % (0.43-2.29); 390x844 DPR 3 rAF 0.59 % (0.44-0.88) → 0 %, wheel 6.36 % (5.28-6.85) → 0.14 % (0.14-0.29). Reduced motion 0 % everywhere; the planted control 18.8-20.5 %. **`jank.mjs`:** wheel at 1440 4.15 / 3.85 / 2.03 / 4.15 % → 0 / 0 / 0 / 0 %, at 1280x585 2.42 / 0.56 / 2.64 / 2.03 % → 0.27 / 0 / 0 / 0 %, at 390 DPR 3 0.21-0.65 % → 0 %; GPU-process CPU per wheel pass at 1440 3.5-3.9 s → 1.7-1.8 s. **`v11-jank.mjs`:** wheel at 1440 3.17 / 2.97 / 2.01 % → 0 / 0 / 0 %; at 1280x585 and 390 the snapshot passed on its median on this machine (0 % and 0.76 %, one run each over 1 %), the fixed build 0-0.21 %. **`p23-bands`:** the overlay's opacity equals the `--p` formula at every sample (difference 0) with 0 inline `--p` writes; 0 under reduced motion and without JS on both builds. Residual: the wheel gesture at 1440 with CPU x4 (median 1.08 %) is at this method's noise floor (the variant with no band work at all measured 0.42-1.55 %, `p14d-1440`) |
| PERF-2 (major) | FIXED at the budget's stated view (1440, DPR 1); DEFERRED at the higher-density views (operator decision) | `src/build.mjs` + `src/lib/util.mjs` (minified CSS, comment-stripped JS), the LCP and eager-image rules (13.2); `docs/DEPLOY.md` (compression required) | the verifier's `wcrawl.mjs` on the home (cache off, a full scroll, network idle; the local server is uncompressed); `imgaudit.mjs` for the gzip estimate and the per-image density | 1440x900 DPR 1: 910,290 B (910.3 kB: over) → 898,017 B (898.0 kB, 877.0 KiB: within 900); about 760 kB with the text gzipped. 1280x585 DPR 1.5: 1,089,523 → 1,077,250 B (about 939 kB gzipped); 1440x900 DPR 2: 1,168,019 → 1,155,440 B (about 1,018 kB); 390x844 DPR 3: 1,191,936 → 1,179,663 B (about 1,042 kB). Every home image is drawn at its rendered size (the largest `sizes` gap: 7 %, the lavender trio at 1440 DPR 2); the rest of the excess at density 1.5-3 is the 302 KB loop (271 KB on phones) and photos fetched at the screen's density. Closing it needs a decision: a smaller re-encode of the hero loop (`tools/make-loop.mjs`, its calmness record) or a density cap of 2x for content images, or a budget stated per density (OPEN-DECISIONS D) |
| CONTENT-11 | FIXED | `tools/csp-hosts.mjs` (XML namespace URIs are not connect hosts), `docs/DEPLOY.md` (the policy derived from the final build) | `probe-csp.mjs` (the policy DEPLOY.md prints, sent as a real response header on the dry-eye page, 1280x585 DPR 1.5) | the old DEPLOY.md policy: 2 violations (the inline script, the `--obj-pos` style attribute) and the arch at `object-position` 50% 50% → the new one: 0 violations, 68% 62%; the tool-derived control 0 on both builds; `csp-hosts.mjs --dir dist` prints the DEPLOY.md policy word for word |
| PERF-3 (major) | DEFERRED (partly fixed; operator decision) | the minified CSS and JS (13.2); `src/lib/templates.mjs` hub-grid `sizes` (the gaps and the brand tiles' 24 px padding: the designer tiles now fetch 540w instead of 620-720w at 1280x585 DPR 1.5 and 360w instead of 540w at 1440); `docs/DEPLOY.md` (compression required) | `imgaudit.mjs` over all 149 outputs at three views (cache off, a full scroll in 0.85-viewport steps, network idle; its uncompressed bytes are the count of the verifier's `wcrawl.mjs`, plus the transfer with the text gzipped at level 6); the verifier's `w-*.jsonl` for the snapshot | outputs over 320,000 B uncompressed: 1440 22 → 14, 1280x585 DPR 1.5 40 → 25, 390x844 DPR 3 16 → 14. With the text gzipped (the verifier's estimate for the snapshot): 1440 4 → 4, 1280x585 7 → 7, 390 5 → 4. Still over with gzip: at 1440 CooperVision 390.4 kB, hours-location 372.3, contact-lenses 344.9, designer-frames 322.5; at 1280x585 CooperVision 393.5, designer-frames 377.9 (402.2 before), contact-lenses 371.4, the dry-eye-assessment post 343.5, hours-location 337.4, eyeglasses 333.9, the-staff 328.4; at 390 the-staff 394.0, CooperVision 379.3, designer-frames 357.2, contact-lenses 357.1. The median page with the text gzipped: 142, 150 and 138 kB. No image of those pages is fetched above its rendered size because of `sizes` any more (`sizes` waste 0 on the 148 outputs at 1280x585 and 1440; 4.7 kB on the home at 390). What is left is their own photographs and product and brand images (206-328 kB a page), the logo that A-17 keeps byte-identical (20 kB) and the band's poster (26 kB). A finer srcset ladder (180, 270 and 900 w) would bring 1-2 pages per view under (an estimate from the same rows); the rest needs a decision on image density or quality, or a budget exception for the gallery pages (OPEN-DECISIONS D) |

### 13.4 Gates and reproducibility (the final tree)

| check | command (log in `tmp/wf6/fix1r/`) | result |
|---|---|---|
| build | `node src/build.mjs --dump-models` (`final-build.log`) | exit 0, 0 failures; 148 / 148 pages + `404.html`, 149 models; theme `riverlight.7ad31d6b.css` and `site.d9aff8a9.js`; 790 files (754 before: the 36 og:image copies of CONTENT-16) |
| reproducible | `RFEC_DIST=tmp/wf6/fix1r/final-a` and `final-b`, then `node tools/hashdir.mjs tmp/wf6/fix1r/final-a tmp/wf6/fix1r/final-b dist --control` | **IDENTICAL**, aggregate `1103fa329ab087c8b5ec17a8e02c86ecbd431f5dca94e575efc78ecda937942d`; the control fired |
| content gates (A-1) and decontamination | `node tools/run-gates.mjs` (`final-gates.log`) | **12 of 12 PASS**: sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; headings 743 / 742 / 1 declared / 0 findings; tags 0 unbalanced; links 12,233 local refs / 0 broken; link parity 897 kept / 0 missing; KEEP 239 / 236 present / 3 declared, alt fidelity 0 findings; SEO 0 mismatches (description 130 same + 18 repaired: the 13 declared archive removals and the 5 derived), structured data 0 problems; words 102,222 visible / 0 added, glyphs 0 added; residue 0 hits; model-check 149 / 149, 0 violations; sr-decontaminate CLEAN (153 files). Every control fired. The copy numbers equal the snapshot's; the visible-word count is 48 lower because the 4 social labels on 3 pages are now `aria-label`s (CONTENT-13) |
| fabrication | `node ~/.claude/skills/site-reforge/scripts/sr-fabrication.mjs --project . --strict` (`final-fab.log`) | **SOURCED**, 0 / 0 of 707 claims (`project.json` stage `fabrication` done); control on a copy with a planted statistic, rating, volume claim and invented review: FABRICATION, 4 blockers |
| budgets (DESIGN-SPEC 7) | zlib level 6 on `dist/theme/*` | CSS 96,302 bytes, **19,547** gzipped (budget 22,528; 22,180 before); JS 26,551 bytes, **9,354** gzipped (budget 10,240; 9,653 before) |
| CSP | `node tools/csp-hosts.mjs --control` and `--dir dist` | control fired; the derived policy equals the DEPLOY.md text word for word |
| servers | `tools/serve.mjs` on 8871 / 8872 | the first two servers were stopped by the harness at their 2-hour limit after the home weight runs; the last runs (13.3: CONTENT-11, the 1440 sweep) used `tmp/wf6/fix1r/run-chain-served.mjs`, which starts both servers itself and stops them by PID at the end |

### 13.5 Left for the next stage (fix-2) and for the operator

- **Residuals of kept units (fix-2):** MOTION-5 (the CTA still drops below the fold at 1366x657 when the long review
  opens); LAYOUT-12 / MOTION-4 (0.2-1.8 px shift left when the drawer opens); MOTION-6 (4 of 29 FAQ answers still
  missing in print); A11Y-19 (the drawer panel keeps its gradient under reduced transparency and more contrast);
  LAYOUT-10 (`/template/header/` starts its first block at 732 px at 390x844: a template page, see Q-13).
- **PERF-6 (fix-2):** open again (13.2: the earlier change never reached the embed). The one YouTube iframe comes from
  `page-model.mjs markProse`; a lazier load needs a change there or in the D.7 transform, measured with the perf
  verifier's `iframe.mjs`.
- **The other minor and nit findings** of round 1 not named in 13.2 or 13.3 (`tmp/wf6/salvage/round1-confirmed.json`):
  fix-2's scope. The units of 13.2 that already fixed them are measured there; fix-2 re-verifies them on its own build.
- **Operator:** OPEN-DECISIONS D (A11Y-4, LAYOUT-2, CONTENT-6, -7, -8, -9, -10, -17, the PERF-2 and PERF-3 budget
  decision) and the items of 8, 11.5 and 12.5.
- **Closed by fix-2:** the five residuals above and PERF-6 (13.7). The other minor and nit findings are in 13.7;
  what stays open, for the operator, is in 13.10.

### 13.6 fix-2: method and scope

Written by the fix-2 stage of QA round 1, 2026-10-02. Scope: every minor and nit finding of
`tmp/wf6/salvage/round1-confirmed.json` that 13.3 does not close (the layout, motion, a11y and perf lanes), and a
re-measurement of 13.3's content verdicts on the final tree. The working files are in `tmp/wf6/fix2/`.

The builds:
- `base/` holds the source tree fix-1 left, and `b3/` its build (`1103fa32…`, 13.4).
- The builds under test, in order: `new-prehalo/` (`d18c2630…`), `new-c/` (`579929f6…`), `new3/` (`54e5e63e…`) and
  `new/`, the final tree (`64d315c5…`, 13.9). `dev/` held the development builds. `prev-css/` keeps the stylesheet of
  the tree built just before the semicolon pass (`014a4faf…`, measured by no probe).

The probes and their output:
- `v/<lane>-old|new/` are the verifiers' probes, cloned by `clone-probes.mjs`;
- `p/` holds fix-2's own probes, and `p/results/` their output.

The logs, each numbered in run order:
- `logs-base-layout`: the layout probes on fix-1's build.
- `logs-dev1` / `logs-dev2`: the development builds.
- `logs-smoke`, `logs-A` (layout and motion) and `logs-B` (a11y and perf): on `new-prehalo`.
- `logs-C`: the focus re-runs and the glasses font on `new-c`; then the first header matrix, the content probes and the
  sweeps on `new3`.
- `logs-b3`: `fontswap` and `imgprobe` on fix-1's build.
- `logs-D`: CSP, the focus re-runs, the second header matrix and the weight crawls, on `new3`.
- `logs-E`: the weight crawl on the snapshot.
- `logs-F`: the CSSOM check, the focus probes, the card ring, the deferred embed, the D4 re-test, the static probes and
  the home's weight, on the final tree.
- `logs-G`: fix-1's 9 px halos re-measured on `new-prehalo`, for the record (`run-chain2.mjs`).
- `final/`: the gates.

**Old and new.** Old is the frozen snapshot `tmp/wf6/snapshot`, served on 127.0.0.1:8873. New is the build under test,
on 8874. Both are served by `tools/serve.mjs --no-open --not-found 404.html`, which `run-chain.mjs` (or `run-chain2.mjs`,
which takes its roots from the chain file) starts and stops by PID. One headless Chrome runs at a time: each probe
launches and closes its own, and the chain runs them one after another, each on old and then on new.

**The verifiers' probes, unchanged.** `clone-probes.mjs` rewrites only three things in each copy:
- the base URL (the verifiers' ports 8861-8865 become 8873 / 8874);
- the root climb (the copies sit two folders deeper);
- the snapshot path (`tmp/wf6/snapshot`, or `tmp/wf6/fix2/new`).

It reports any port or snapshot name it could not rewrite. fix-1's cloner had left the two static a11y probes pointed at
`tmp/wf6/fix1r/v/snapshot`, a folder that does not exist. `patch-clones.mjs` makes `static.mjs` and `agg.mjs` look up the
theme's fingerprinted CSS and JS by pattern instead of the snapshot's hard-coded names, the same on old and new.

**Verdicts** follow 13.1. In two cases the verifier's probe cannot show the fix by construction:
- LAYOUT-16: it counts cards per row, and a centred lone card does not change that count;
- A11Y-10: it counts text mutations, and showing one slide at a time does not make any.

For these the probe is re-run unchanged, and fix-2 adds one reading with the same code (`p/l16-pos.mjs`,
`p/a11y-live.mjs`) on both builds. Each reading can fire: `l16-pos` finds all 14 lone cards off-centre on the snapshot,
and `a11y-live` plants a control.

**The build under test changed three times during the runs,** each time in the stylesheet only. `p/build-diff.mjs`
shows that, once the fingerprinted names are normalised, consecutive builds differ in one file of 790,
`theme/riverlight.*.css`. `p/css-rule-diff.mjs` names the rules:
- `new-prehalo` → `new-c`: the skip-link and hero-toggle halos went from 9 to 12 px, the card ring gained its halo
  (`--paper`, 4 px outside and 3 px inside), and the video keeps its outline colour (`outline-style: none` instead of
  `outline: none`);
- `new-c` → `new3`: the card ring's `inset` went from -7 to -8 px;
- `new3` → the final tree: the card ring's inner halo went from 3 to 4 px, and the minifier now drops the last
  semicolon of every block (879 bytes; why: 13.10).

These focus rules apply only while a skip link, hero toggle, card or video has focus. Except for the card ring's
absolutely positioned box, they change no layout. The semicolon pass changes no rule: `p/min-check.mjs` shows the final
sheet is the previous one with exactly its 879 `;}` shortened to `}`, and `p/cssom-eq.mjs` shows Chrome parses the
source, the previous sheet and the final sheet into the same rule list (`logs-F`). Every probe that reads a focus ring
was re-run on the final tree (`logs-F`), and `p/card-ring.mjs` measures the card ring's box on every page that has one
(13.7, A11Y-17).

**The header group was re-tested together** (13.8) with `p/header-matrix.mjs`, on old and new:
- sizes 320 (DPR 2, and again with a classic scrollbar), 390, 768, 1024, 1200, 1280x585 DPR 1.5, 1440x900 and 1920x1080,
  with a classic 15 px scrollbar from 768 up;
- Chrome font 16, 20 and 24;
- WCAG 1.4.12 spacing off and on;
- short zoomed views for A11Y-8.

### 13.7 fix-2: the verdicts (minor and nit findings, lane by lane)

Each row gives the verdict, the change and its files, the probe (the verifier's, cloned to `tmp/wf6/fix2/v/`, unless
it is named under `p/`), and its numbers on the snapshot (old) and on the build under test (new). 13.6 lists which
build each log measured, and why its numbers hold for the final tree. "fix-1 unit" means fix-1's change of 13.2 is kept
unchanged, and this is its first measurement with the verifier's own probe.

| id | verdict | change (files) | probe | old → new |
|---|---|---|---|---|
| LAYOUT-3 (minor) | FIXED | fix-1 unit (riverlight.css: tighter header gaps below 360 px) | `v03-header320.mjs` (DPR 2, hidden bar; all 149 pages at 320x568) | pages that scroll sideways at 320: 149 → 0; the menu button's focus ring right edge 327 → 310 px (client width 320). The verifier's own control (a 400 px `div` that can shrink inside the flex navbar) fires on neither build; `p/header-matrix.mjs`'s `flex: none` box does (13.8) |
| LAYOUT-4 (minor) | FIXED | fix-1 unit (riverlight.css, tokens.css: short desktop to 820 px tall) | `v04-home-h1.mjs` (32 window sizes, real bar, t = 0 and 5 s) | the h1 whole at 16, cut at 9 and hidden at 7 of 32 sizes → whole at 32 of 32 |
| LAYOUT-5 (minor) | FIXED | fix-1 unit (site.js: refit the track on a slide resize) | `v05-spacing.mjs` (text spacing after load) | the reviewer's name hidden by 50.5 px (1366x657, 1200x800, 1440x900, 1280x585@1.5) and 67.1 px (390x844) → visible (-3.5 / -3.9 px) |
| LAYOUT-6 (minor) | FIXED | fix-1 unit (riverlight.css: the nav wraps) | `v05-spacing.mjs` NAV; `26c-navspacing.mjs` | with text spacing at 1200-1268 px, scrollWidth 1254 (69 px past the 1185 px client width at 1200) → scrollWidth equals clientWidth at all 12 widths (2 nav rows, 48 px spare); `26c`: the nav past the viewport on 10 of 16 page × width runs (up to 69 px) → 0 of 16 |
| LAYOUT-7 (minor), A11Y-6 (minor) | FIXED | fix-1 unit (riverlight.css: the statement word may break) | `v05b-hero-word.mjs` real and hidden bar; `26-spacing.mjs`, `26b-spacing.mjs` | with text spacing, "Comprehensive" ran past the copy column by 141, 90.4, 78.1, 54.8, 140, 26.2 and 27.8 px (1440, 1200, 1024x768, 1024x600, 1920, 390, 360), and under the photo frame by up to 76.2 px, with the frame image on top at the word's end → at or inside the column at every size (2 lines), the statement on top. `26b`: 76.2 / 68.0 / 36.4 / 71.3 px under the frame (1440, 1920, 1200, 1536) → -102.3 / -109.3 / -62.2 / -106.5 |
| LAYOUT-8 (minor) | FIXED | fix-1 unit (`.is-tall`) + fix-2 (site.js `fitLoc`: the card's exact height) | `v06-sticky.mjs` (58 conditions, `/privacy-policy/` at 30, 50 and 70 % scroll) | stuck with its foot below the fold: 24 conditions (worst 57.9 px at font 20, 1440x900; 53.3 px at 1024-1199 x 860) → 0. fix-1's build still had 3 (0.3 px at 1024, 1100 and 1199 x 913: `offsetHeight` rounded the 796.3 px card down). Cards that fit still stick (27 conditions) |
| LAYOUT-9 (minor) | FIXED (13.3; re-measured) | fix-1 | `v07-misc-real.mjs` L9 | navy pixels in the 5-8 px outline band 0 → 14,863 of 17,464 (85.1 %) |
| LAYOUT-10 (minor) | FIXED | fix-1 unit (`h1--xlong` from 75 characters) | `v09b-first-block.mjs`; `v09-sweep-hidden.mjs` (all 149 at 390x844) | the scleral post's first block 724.8 → 670.9 px at 390x844 DPR 1 (A-10: 700). `/template/header/`'s first block is its button row at 466.6 px (the verifier's corrected reading; fix-1's 732 read the figure after it). `v09-sweep-hidden` (148 pages): first blocks past 700 px on 2 pages → 1. The one left is `/template/header/` at 731.8, which is this walker's reading of the figure; the verifier's corrected `v09b` reads the button row. The other pages sit at 460-690.1 px (460.2-690.3 before). A-2 at 390 and 360 px: 0 pages with overflow on either build |
| LAYOUT-11 (minor) | FIXED | fix-1 unit (UI font sizes in rem, nav breakpoint 75em) | `v07-misc-real.mjs` L11 (Chrome font 16 / 20 / 24 / 32) | the nav 15.5 px at every setting → 15.5 / 19.375 / 23.25 / 31; top bar and pill 14 → 14 / 17.5 / 21 / 28; hours 15 → 15 / 18.75 / 22.5 / 30; breadcrumbs 15 → 15 / 18.75 / 22.5 / 30. At 16 px nothing changes |
| LAYOUT-12 (minor), MOTION-4 (minor) | FIXED | fix-2: the scroll lock pads the root by the removed scrollbar's width (riverlight.css `html:has(dialog[open])`, site.js writes `--sbw`); fix-1's open-state `scrollbar-gutter` removed | `v07-misc-real.mjs` L12; `v05-drawer.mjs` M4 | L12 (`/privacy-policy/` at scrollY 400, classic bar), the menu button on opening: 924 → 939 (1024x768), 1092 → 1107 (1199x800), 678.3 → 693.3 (768x1024), 315 → 330 (390x844). fix-1's build: 924 → 924.6, breadcrumbs 70 → 69.4 (with the gutter reserved, 100vw resolves to 1009 instead of 1024, `p/dev1.mjs`). Final: 924 → 924, 1092 → 1092, 678.3 → 678.3, 315 → 315, breadcrumbs unchanged. M4, the reference heading on opening: +17.5 / +17.4 / +11.9 px down and 7.5 px wider (1024x768, 1100x700, 1199x700) → 0.0 / 0.0 / 0.0 and 0.0. The verifier's permanent-gutter diagnostic G is 0.0 on both builds; M4 at 390x844 (no classic bar) shows no shift on either |
| LAYOUT-13 (nit) | FIXED | fix-1 unit (hub intro inset in the short mode) | `v07-misc-real.mjs` L13 (1280x585@1.5) | the intro's first line whole on 3 of 7 hubs → 7 of 7: eye-care-services, eyeglasses and the-staff 568.8-590.8 → 548.4-570.4; insurance 600.3-627.3 → 518-545 |
| LAYOUT-14 (nit) | FIXED | fix-1 unit (glasses `left: -13%` at 1024-1199 short) + fix-2 (riverlight.css: from 769 px the glasses `translate` by `max(0px, (1rem - 16px) * 5)`, so nothing changes at the default font) | `v10-glasses.mjs` real and hidden bar; `p/glasses-font.mjs` (the same clearance, 13 sizes × Chrome font 16 / 20 / 24 / 32) | clearance to the "Comprehensive" box (spec 12 px), 1024x600 / 640 / 680 / 720: real bar -4.3 / 0.3 / 0.8 / 1.5 → 36.9 / 19 / 19 / 19; hidden bar 1.2 / 2.2 / 2.7 / 3.4 → 43.1 / 25.2 / 25.2 / 25.2. 1024x768 58.6 → 19 and 1100x600 23 → 67.2 (real bar: fix-1's short-desktop mode now reaches 820 px tall); 1280x585@1.5, 1366x657, 1600x662@1.2 and 1440x900 unchanged. Chrome font 32: 1280x585 -52.5 → 27.5 and 1024x600 -9.7 → 75.1. `glasses-font`, worst over the 13 sizes per font: -4.3 / -4.3 / -9.7 / -52.5 → 19 / 39 / 59 / 27.5 px (the CTA and "Eye Care" boxes included); sizes under 12 px 4 / 4 / 5 / 8 of 13 → 0 at every font |
| LAYOUT-15 (nit) | FIXED | fix-2: the article card fills its grid row (riverlight.css `.has-aside .prose-card { align-self: stretch }`, 1024 px up) | `v08-sweep-real.mjs` (132 sidebar pages at 1280x585@1.5) | sidebar pages with more than 400 px of empty left column: 34 of 132 → 0, and with any (more than 0 px) 42 → 0. The worst was 1,111 px (the 4 empty archives) → 0. Long articles are unchanged (the card is already the taller column). A-2 on all 149 pages: no horizontal overflow on either build; both planted controls fire |
| LAYOUT-16 (nit) | FIXED (the lone card is centred; the row count cannot change) | fix-1 unit (riverlight.css: a lone last card centred under the row above) | `v07-misc-real.mjs` L16; `p/l16-pos.mjs` (the same row code, plus the lone card's position) | the row compositions stay the same by construction (3+3+3+1, 3+3+1, 2+2+1, 2+1 at 1024 up; 2+2+2+1, 2+2+2+2+1 at 768). Lone last cards: 14 on both; centred 0 of 14 → 14 of 14 (the centre's offset from the grid's centre -398.2 px at 1280x585 → 0) |
| MOTION-2 (minor) | FIXED | fix-1 unit (Escape marks a hovered item `.is-dismissed`) | `v04-nav.mjs` M2 (1280x585@1.5, 1440x900, 1600x662@1.2; real pointer and keys) | a hover-opened panel after Escape, with focus on `<body>` and with focus on the item's link: still open in 9 + 9 of 9 → closed in 9 + 9 of 9. Control (a keyboard-opened panel) closes on both, with focus on its toggle |
| MOTION-3 (minor) | FIXED | fix-1 unit (a panel closed by the pointer hands focus to its toggle) | `v04-nav.mjs` M3 (y 0), `v04b-nav-scrolled.mjs` (y 2000) | focus on "Pediatric Eye Care", pointer onto "Insurance": the active element `<body>` with no ring in 6 of 6 (and 2 of 2 scrolled) → the panel's toggle with `:focus-visible` in 6 of 6 (2 of 2). The next Tab reaches "Eyeglasses" on both. Control (the pointer onto "Eyeglasses", which has no panel) keeps the panel and focus on both |
| MOTION-5 (minor) | FIXED | fix-1 unit (dots above the track) + fix-2: the CTA shares the dots' bar above the track (home.mjs), the photo and panel are top-aligned, and the carousel has no bottom margin (riverlight.css) | `v06-dots.mjs` (a real click on the long review's dot, read at +60 ms, 1.2 s and 5 s) | 1280x585@1.5: dots 361.8 → 681.7 (below the 585 fold), CTA 427.8 → 747.7, the pointer then on the review text. 1440x900: dots 519.9 → 805.7, CTA 585.9 → 871.7. 390x844: dots 526.2 → 1062.2 (fold 844), CTA 592.2 → 1128.2. On the final build neither the dots nor the CTA move (0.0 px at all 3 sizes) and the pointer stays on the dot. Control (the current dot) moves nothing on both. On fix-1's build the CTA still followed the track down, and an intermediate fix-2 build moved the dots 27.7 px until the grid was top-aligned (`p/dev1.mjs`) |
| MOTION-6 (minor) | FIXED | fix-1 unit (`@media print`) | `v09-print.mjs` + `v09-pdf.py` (`Page.printToPDF`, Letter, no backgrounds); `p/faq-pdf.py` | home page 1: 83 → 481 characters, ink 1.5 → 29.9 %, the statement, the CTA and the h1 page 2 → page 1. The hero toggle in print `grid` 44x44 → `none`. Text nodes at opacity 0 under emulated print without `beforeprint`: 26 → 3 on `/` and 22 → 3 on `/whats-new/` (the closed nav dropdowns). FAQ answers found by the verifier's key: 0 → 25 of 29, the same 25 its all-open control finds on both builds. `faq-pdf.py` checks every `p` and `li` of every answer in the PDF text: 0 → 29 of 29 whole as printed, and 29 of 29 for the all-open control on both. The 4 answers the key misses (7, 14, 21, 27) hold lists: `textContent` glues the list items and the PDF text layer places them after the text that follows, so the key fails even with every answer open. fix-1's "4 of 29 missing" was this key, not missing print |
| MOTION-7 (minor) | FIXED | fix-1 unit (`--dur-fade` 320 ms) | `v02b-a12-precise.mjs` (wheel 100 px / 80 ms; the reveal's end from its transition timeline) | home 1280x585@1.5, worst reveal: 744 / 610 / 593 ms (6 / 2 / 0 over 600) → 567 / 450 / 433 ms (0 / 0 / 0). `/the-staff/`: 693 / 593 (4 / 0 over) → 433 / 417. Home 390x844: 553 / 537 → 377 / 377. 0 reveals over A-12's 600 ms in 7 of 7 runs |
| MOTION-8 (nit) | FIXED | fix-1 unit (site.js: `fore` cut-outs clamp at 0) | `v03-kids.mjs` (9 sizes 360-1920), `v03b-kids-control.mjs` | the kids' glasses offset ran -44 to +44 px (downward in 24-35 of 48-70 samples per size) → -44 to 0 (no downward sample). Overlaps 0 on both; the control's planted text line is reported on both |
| MOTION-9 (nit) | FIXED | fix-1 unit (the drawer's close focuses the first rendered of menu button, nav link, logo) | `v05-drawer.mjs` M9, `v30-loose.mjs` | drawer open at 1024x768 with focus inside, then the viewport widened to 1280x585@1.5: focus `<body>`, and the next Tab still `<body>` → "Hours & Location" (the desktop nav), next Tab "Meet Our Team". Control (Escape at 1024): the menu button on both |
| A11Y-5 (minor) | FIXED (the ring); OPEN-OPERATOR (the name) | fix-1 unit (the frame draws the ring) + fix-2 (the video keeps its outline colour, `outline-style: none` only) | `23b-video-recheck.mjs`, `23-video-order.mjs` | at the video's outline position: 1.00-1.05:1, 0 of 4 sides painted (the verifier's own unclipped control: 4.59-5.52) → 4 of 4 sides at 4.59-5.52:1 at all 4 stops (390x844 stops 9 and 13; 1280x585@1.5 stops 17 and 21). The accessible name stays empty ("Video", 3 of 3 on both): the source names none, and a name would be authored copy (OPEN-DECISIONS D) |
| A11Y-7 (minor) | FIXED | fix-1 unit | `27-reflow.mjs` (16 sample pages) | overflow 1 px at 320x568, 5 px at 316x146 (400 %) and 16 px at 320 with a classic bar, on 16 of 16 each → 0 on all 48. The menu button 277-321 → 260-304. The probe's own control (a 2,000 px box planted in `main`) is clipped by `.page` (`overflow-x: clip`) on both builds, so it does not fire on either (the verifier's `27b-control` noted this). Boxes planted in the body or the navbar do register on both: `v09-sweep-hidden`'s control (scrollWidth 2,000 at 390) and the header matrix's CTL-overflow (13.8) |
| A11Y-8 (minor) | FIXED | fix-1 unit (the header scrolls away at 480 px tall and below) | `27-reflow.mjs` share | the stuck navbar's share of the viewport, scrolled to 1500: 52.8 / 53.5 / 30.6 / 26.9 / 28.1 % (316x146@6, 320x146@4, 320x256@4, 640x293@3, 800x331@2) → 0 at each. 1280x585 stays 15.8 % (sticky) on both |
| A11Y-9 (minor) | FIXED | fix-1 unit (`--dot-idle` .55) | `28-carousel.mjs` | idle dots 1.67-1.75:1 → 3.77-3.96:1 (WCAG 1.4.11: 3); the current dot 4.94-5.02 → 4.88-4.97 |
| A11Y-10 (minor) | FIXED | fix-1 unit (the track `role="group"` named by the heading; site.js hides the slides not shown) | `28-carousel.mjs`; `p/a11y-live.mjs`; `30-sweep.mjs` | the track's role generic and name "" → group "Read Our Patient Reviews" (polite on both). The verifier's text-mutation count stays 0 = 0 by construction; the slides' `aria-hidden` now changes with every key (30 of 36 mutations). `a11y-live`: the slides exposed in the live region change on 0 of 3 key presses (all 5 always exposed) → 3 of 3 (only the shown slide). Control (every slide exposed by a planted script) 0 on both. `30-sweep` (all 149 pages): the unnamed focusables besides `main#main` were 3 videos and the track → the 3 videos (A11Y-5's name, OPEN-OPERATOR); its planted unnamed control is caught on both |
| A11Y-11 (minor) | OPEN-OPERATOR | none | `28-carousel.mjs` (the Alumier card's tree) | the same on both: "Now available at our practice!" and "Learn More", with no brand name. The logo's alt needs the practice's approval (DESIGN-SPEC Q-5; OPEN-DECISIONS D) |
| A11Y-12 (minor) | FIXED | fix-1 unit (forms.mjs) | `11-static-extra.mjs` | `#f9-17` "Date of Birth": no autocomplete → `bday` |
| A11Y-13 (nit) | OPEN-OPERATOR | none | `11-static-extra.mjs` | no "required" wording on the form on either build. The legend would be added copy (OPEN-DECISIONS D) |
| A11Y-14 (nit) | FIXED | fix-1 unit (the logo on a plate in forced colours) | `25-forced.mjs` (dark) | the logo area 75 % black Canvas, its navy 1.58:1 against it → the logo on a light plate (73 % `#f8f8f8`, 19.77:1 against Canvas; the navy on the plate is the light-mode 13.32:1) |
| A11Y-15 (nit) | FIXED | fix-1 unit (a navy halo) + fix-2: the halo widened from 9 to 12 px (riverlight.css `.skip:focus`) | `20-focus.mjs` (stop 1; 1280x585@1.5 and 390x844) | the ring's bottom side over the white navbar: 1.34:1 outside and 1.59 inside (phone 1.61 / 1.61, and its right side 2.94 outside) → 7.91 / 7.91 on all 4 sides at both sizes. On fix-1's 9 px halo the bottom still read 1.19 outside (`logs-G`, re-measured on `new-prehalo`): the halo's anti-aliased edge sat 2.5 px past the ring, where the probe reads |
| A11Y-16 (nit) | FIXED | fix-1 unit (a white halo) + fix-2: 9 → 12 px (`.hero__toggle:focus-visible`) | `21-promo.mjs` toggle (t = 0.3 s and 5 s) | per side: 3.52 / 2.90 / 3.81 / 3.22 → 5.57 on all 4 sides at both times. On fix-1's 9 px halo the right side was still 2.90 at both times (`logs-G`) |
| A11Y-17 (nit) | FIXED | fix-2: `[data-tilt]:has(:focus-visible)::after` draws the card ring above the breakout photo, with a white halo either side (riverlight.css) | `21-promo.mjs` (the top edge sampled every 1 px, 4 service cards) | top edge painted 3.18 / 4.55 / 2.73 / 3.18 %, 3 of 4 sides painted, the other sides 3.17-4.54:1 with single samples down to 1.63 → 100 % on all 4 cards, 4 of 4 sides, 5.52-5.57:1 against the outside pixel (lowest sample 5.52) and 5.57 against the inside one (`logs-F` 02). Where the top edge crosses the photo, the halo carries the contrast: without one (`new-prehalo`, `logs-G`) the copy's top edge read 1.49-5.14:1 against the pixel outside it, and with a 3 px inner halo (`new3`, `logs-D` 03) 2.87-5.35:1 against the pixel inside, hence 4 px. `p/card-ring.mjs`, every card host on the 21 pages that have one: keyboard focus on each of the 133 card hosts at 320x568@2, 390x844@3, 768x1024 and 1280x585@1.5 (532 readings): the ring copy is drawn on 532 of 532 (0 on the snapshot), with 0 readings where the page scrolls sideways and 0 where the ring box runs past the client width or past a clipping ancestor. Its control, a host planted 2 px inside the right edge, reports 6 px of overflow at every size |
| A11Y-18 (nit) | OPEN-OPERATOR | none | `10-static.mjs`, `11-static-extra.mjs` | heading-level skips on 3 pages on both builds (presbyopia h2 → h4, advanced-technology h1 → h3, top-causes h1 → h3). These are the source's outlines, which heading-parity (A-1) enforces; the home's promotion is COMPONENTS I.1 (OPEN-DECISIONS D) |
| A11Y-19 (nit) | FIXED | fix-1 unit (a reduced-transparency and more-contrast block) + fix-2: the drawer panel flat paper, frost cards opaque, the scrim 80 % (riverlight.css) | `11-static-extra.mjs` | `prefers-reduced-transparency` rules 0 → 1 and `prefers-contrast` 0 → 1 (one block). Backdrop-filter declarations 10 (2 `none`) → 16 (8 `none`: the added ones remove blur). The block now also covers the drawer panel, the frost cards and the scrim |
| A11Y-20 (nit) | NOT-A-DEFECT | none | `23-video-order.mjs` (dry-eye page, forward Tab walk) | zones header → main → article → CTA band → aside → footer on both. This is DESIGN-SPEC 8's declared order, and the DOM order equals the one-column order below 1024 px |
| A11Y-21 (nit) | OPEN-OPERATOR | none | `10-static.mjs` | 1,428 `target="_blank"` links on both, 0 with a new-tab hint. The hint would be added copy on every page (OPEN-DECISIONS D) |
| A11Y-22 (nit) | OPEN-OPERATOR | none | `10-static.mjs`, `11-static-extra.mjs` | 4 archives titled "Nothing Found" on both; their source titles are empty. Removing them (CONTENT-9) or a declared title is the operator's call (OPEN-DECISIONS D) |
| PERF-4 (minor) | FIXED | fix-1 unit (the LCP rule) | `lcp.mjs` (home, 3 views); `wcrawl.mjs` + `agg.mjs` (all pages) | home: the LCP is the hero glasses on both. "The LCP image is the preloaded / fetchpriority one" false → true at 1440x900, 1280x585@1.5 and 390x844@3. FCP 1236 → 844 ms, 1452 → 1224 and 772 → 788 (on both builds the LCP lands in the first contentful frame). All 149 pages (`logs-D` 07-12, cache off, a full scroll): the LCP element is the preload or `fetchpriority` image on 0 of 149 pages at each view (the verifier's crawls of the snapshot; fix-2's re-crawl of the snapshot at 1280x585@1.5, `logs-E`: 0 of 149 again) → 149, 149 and 146 of 149 at 1440x900, 1280x585@1.5 and 390x844@3. The other 3 at 390 (`/disclaimer/`, sunglasses-for-kids, `/team/maivys-longa/`) have a paragraph as their LCP on both builds, so no image can be the target. The LCP elements themselves are unchanged (the title-band poster on the 148 interiors, the glasses on the home): the rule now hints the image that wins. CLS 0 on every page at every view, on both |
| PERF-5 (minor) | FIXED | fix-1 unit (the first 4 images eager) | `wcrawl.mjs` + `agg.mjs` `lazyInFold` | pages with a `loading=lazy` image in the first viewport at load: 59, 56 and 60 at 1440x900, 1280x585@1.5 and 390x844@3 (66, 60 and 63 images; the verifier's crawls of the snapshot; fix-2's re-crawl at 1280x585@1.5, `logs-E`: the same 56 pages and 60 images) → 0, 0 and 0 (`logs-D` 07-12) |
| PERF-6 (minor) | FIXED | fix-2: a YouTube iframe of model prose prints `data-src` and a `noscript` copy (templates.mjs D.7.7); site.js sets `src` within 600 px | `iframe.mjs` (eye-emergencies, no scrolling, 9 views × 2 runs) | requested at page load at 1440x900, 1920x1080, 1366x657 and 768x1024 (8 of 18 runs) → 0 of 18. Control (scrolled to the frame): requested at every view on both |
| PERF-7 (minor) | FIXED | fix-1 unit (the loop pauses once faded) | `video.mjs` (1440x900 scrollY 1035; 390x844@3 scrollY 971) | the light at opacity 0 with its box in view: playing (128 → 248 frames in 5 s), renderer + GPU 0.278 / 0.364 s per 5 s → paused (79 → 79 frames), 0.005 / 0.007 s. First paused position 1170 px (1.3 vh) → 1035 (1.15 vh) at 1440, and 1092 → 966 at 390 |
| PERF-8 (minor) | NOT-A-DEFECT (informational) | none | `video.mjs` at the top | renderer + GPU per 5 s, loop / poster: 1440x900 0.741 / 0.123 → 0.968 / 0.264 (this run dropped 15 frames); 390x844@3 0.771 / 0.114 → 0.816 / 0.119. This is the approved loop's decode while it plays on screen. Lowering it is the loop re-encode of OPEN-DECISIONS D |
| PERF-9 (minor) | OPEN-OPERATOR | none | `imgprobe.mjs` | painted density on both: designer-frames 0.41 / 0.29 / 0.40x (1440, 1280x585@1.5, 1920); contact-lenses 0.65 / 0.44 / 0.64x. The shipped files are the largest sources (OPEN-DECISIONS D) |
| PERF-10 (nit) | FIXED | fix-2: an arch whose file the page prints again takes that image's `sizes` (templates.mjs `shareArchFile`) | `imgprobe.mjs`; `p/arch-dups.mjs` (hours-location is the only such page) | 1440x900@1 fetched the photo twice (720 w, 34,913 B transferred, + 1024 w, 68,153 B) → once (1024 w, 68,153 B). 1280x585@1.5 and 390x844@3 fetch once on both |
| PERF-11 (nit) | FIXED | fix-2: a 550-599 fallback face for Verdana Bold (81.67 %) and Arial Bold (94.78 %), sized from measured label widths (fonts.css) | `fontswap.mjs` (woff2 held 2.5 s, 1280x585@1.5); `p/dev1.mjs`, `p/dev2.mjs` | the first nav link 366 → 375.5 px when the font arrives, with a 0.00038 layout shift on `nav.mainnav`, in 3 of 3 held runs → 375.5 in the fallback and the final state, with no shift, in 3 of 3. The six labels at 550: Atkinson 613.47 px against the fallback's 623.02 → 613.31. fix-1's build (`b3`) still moved the first link 366 → 375.5 (CLS 0.00038, 3 of 3). Its flex nav keeps the `nav` box constant, so the calibration is what removed the move |
| PERF-12 (nit) | FIXED | fix-1 unit (minified CSS, comment-stripped JS) + fix-2: the minifier also drops the last semicolon of every block (src/lib/util.mjs `minifyCss`; 13.10) | `static.mjs`; `p/min-check.mjs`, `p/cssom-eq.mjs` | CSS 107,151 B with 79 comments (4,505 B), 22,180 gzipped (348 under the 22,528 budget) → 96,705 B with 0 comments, 19,714 gzipped (2,814 under; `logs-F` 11). JS 28,052 / 9,653 → 27,166 / 9,515 (725 under 10,240): its full-line comments, indentation and blank lines are gone; the 7 comments that follow code on a line (317 B) stay, by fix-1's design (util.mjs `stripJsLineComments`) |
| PERF-13 (minor) | FIXED (the cache advice) | fix-1 (docs/DEPLOY.md, Caching) | `static.mjs` | fonts and loop files carry no fingerprint on either build. DEPLOY.md, when the verifier read it (lines 106-107), cached "images, fonts, video and the fingerprinted CSS and JS" immutably for a year. It now restricts `immutable` to the hashed CSS, JS and `img/` files and gives fonts, the loop, its posters, the practice videos and the favicons revalidation (lines 112-118), so a re-encoded loop or font reaches returning visitors. Fingerprinting those files too remains a possible later change |
| PERF-14 (nit) | FIXED | fix-2: the phone `source` of the header logo lists both files with `sizes="145px"` (templates.mjs) | `imgprobe.mjs` | 768x1024@2 and 390x844@2: the 988 w file (3.41x, 21,098 B transferred) → the 300 w file (1.03x, 20,083 B; the files are 20,900 and 19,885 B). 390x844@3 keeps the 988 w file (2.27x; 300 w would be 0.69x) |
| PERF-15 (nit) | DEFERRED | none | `imgprobe.mjs` | 360 w at 2.32x (1440x900@1) and 1.58x (1280x585@1.5) on both. 360 w is the P1 ladder's smallest rung (DESIGN-SPEC 4.3); a smaller one belongs to the PERF-2 / PERF-3 density decision (OPEN-DECISIONS D) |
| CONTENT-1, -3, -4, -12, -13, -14, -16 (13.3: FIXED) | FIXED (re-measured on the final tree) | none in fix-2 | `head-probe.mjs`, `probe-render.mjs`, `probe-forms.mjs` | `probe-forms`: a valid submit sent 1 POST of all 9 / 7 fields → 0 requests. `head-probe`: the 17 archives' og:title equal to their own title 4 → 17, og:type website 8 → 17, the listed post's description 13 → 0, the logo as og:image 7 → 17; `twitter:description` on 0 → 127 pages; breadcrumb trails whose last item is not the page itself 8 → 0 of 123; `404.html` canonical and og:url → none; WebP og:image 57 → 0 pages. `probe-render`: visible social label links 4 → 0 on each of 3 pages. Every probe's control fires on both builds |
| CONTENT-11 (13.3: FIXED) | FIXED (re-measured) | docs/DEPLOY.md: the YouTube line now describes the deferred embed (PERF-6) | `tools/csp-hosts.mjs --dir` on the final tree; `probe-csp.mjs` | the derived policy for the final tree equals the DEPLOY.md text word for word (the same hosts, the same inline-script hash, 21 style attributes). `probe-csp` on the dry-eye page, 1280x585@1.5: the snapshot-era DEPLOY.md policy gives 2 violations on both builds (the inline script, the `--obj-pos` attribute). The current policy, which equals the tool's, gives 0 violations on the final tree, with the arch at 68% 62% |
| CONTENT-6, -7, -8, -9, -10, -17 (13.3: OPEN-OPERATOR) | OPEN-OPERATOR (unchanged) | none | `probe-render.mjs`, `head-probe.mjs` | unchanged on both builds: "a week ago" / "3 weeks ago" / "2 weeks ago"; the template pages' copy; the Cherry page's 6 words; "Perhaps searching can help."; `/404-page-not-found/` indexable, second in the sitemap; 20 "Read More+" on CooperVision (OPEN-DECISIONS D) |
| CONTENT-2, -5, -15 (13.3) | as 13.3 | none | `sr-fabrication.mjs --strict` (13.9); the docs | fabrication on the final tree: 13.9. CONTENT-5 and CONTENT-15 involve no build output that fix-2 changed |

### 13.8 fix-2: the header, navbar and drawer findings re-tested together

These findings share one header, one script and one stylesheet: MOTION-2, -3, -4 and -9, LAYOUT-3, -6, -11 and -12, and
A11Y-7 and -8. `p/header-matrix.mjs` re-tests them together on the home page, on both builds, in a 9 × 3 × 2 grid:
- sizes 320x568 DPR 2, 320x568 with a classic bar, 390x844, 768x1024, 1024x768, 1200x800, 1280x585 DPR 1.5, 1440x900
  and 1920x1080 (a classic 15 px scrollbar from 768 up);
- Chrome font 16, 20 and 24;
- WCAG 1.4.12 spacing off and on, applied after load.

Each of the 54 conditions runs these tests:

| test | what it does | finding |
|---|---|---|
| H | scrollWidth against clientWidth, and every rendered header control inside 0..clientWidth | LAYOUT-3, LAYOUT-6, A11Y-7 |
| F | the nav and top-bar font sizes scale with the setting | LAYOUT-11 |
| N2 | the pointer opens the first dropdown, then Escape with focus on `<body>` must close it | MOTION-2 |
| N2ctl | a keyboard-opened panel closes on Escape and focus returns to its toggle (control) | |
| N3 | keyboard focus in the first panel, then the pointer onto the next dropdown: focus must stay on a rendered element with `:focus-visible` | MOTION-3 |
| D4 | scrolled to 1500, a reference element's rect before and after a real click on the menu button (no movement allowed); then Escape returns focus to the button | LAYOUT-12, MOTION-4 |
| D9 | the drawer open with focus inside, then the viewport widened past 75em: the drawer must close and focus land on a rendered element | MOTION-9 |
| Z | short zoomed views scrolled to 1500: the stuck navbar's share of the viewport (0 required at 480 px tall and below) | A11Y-8 |

Controls: a planted 400 px `flex: none` box in the navbar must overflow (CTL-overflow), and with the lock's padding and
gutter removed by a planted rule, the drawer must move the page again (CTL-lock). The rows are in
`tmp/wf6/fix2/p/results/header-matrix-<old|new>[-d4].jsonl`, summarised by `p/matrix-sum.mjs` and `p/matrix-detail.mjs`.

Results: old is the snapshot; new is `new3` for the full matrix (r2, `logs-D` 05-06) and the final tree for the D4
re-test (r3, `logs-F`). The conditions per test differ between the builds because the nav breakpoint moved from
1200 px to 75em (LAYOUT-11). At Chrome font 20 and 24 the drawer, not the nav, serves 1200-1440 px, so new has fewer
nav conditions (N2, N3) and more drawer conditions (D4, D9).

| test | finding | old | new |
|---|---|---|---|
| H | LAYOUT-3, LAYOUT-6, A11Y-7 | 39 of 54 pass. 12 of the 15 failures are at 320 px, at every font and spacing: the menu button ends at 321 px, 1 px past the client width at DPR 2 and 16 px past it with the classic bar (client width 305). The other 3 are at 1200 px with spacing, at every font: "Insurance" and its submenu toggle end at 1,253.8 px, 69 px past the 1,185 px client width | 54 of 54: no overflow, no header control past the client width |
| F | LAYOUT-11 | 18 of 54 (font 16 only): the top bar stays 12.5 px and the nav 15.5 px at font 20 and 24 | 54 of 54: both scale with the setting |
| N2 | MOTION-2 | 0 of 24: the hover-opened panel stays open after Escape | 12 of 12: closed |
| N2ctl | control | 24 of 24: a keyboard-opened panel closes, focus on its toggle | 12 of 12 |
| N3 | MOTION-3 | 0 of 24: focus falls to `<body>` | 12 of 12: the panel's toggle, with `:focus-visible` |
| D4 | LAYOUT-12, MOTION-4 | 11 of 30. All 18 conditions with a classic bar move: the reference shifts 3.3-67.4 px and widens 7.5-20.9 px, and at 768 and 1024 the menu button moves 15 px. Without a classic bar (320 at DPR 2, 390) nothing moves (11 conditions; in 1, 320 at font 24 with spacing, no reference was found). Focus returns to the button on all 30 | 42 of 42: a reference in every condition (a heading in 34, a figure or a link in 8), moved 0.0 px and 0.0 px wider; the menu button unmoved; focus back on the button after Escape |
| D9 | MOTION-9 | 0 of 30: focus on `<body>` after the drawer closes | 42 of 42: "Hours & Location", the first link of the desktop nav |
| Z | A11Y-8 | 1 of 5: the stuck navbar covers 52.8 / 30.6 / 26.9 / 28.1 % of 316x146@6, 320x256@4, 640x293@3 and 800x331@2 | 5 of 5: 0 % at those four (the header scrolls away), 15.8 % at 1280x585@1.5 (sticky, as designed) |
| CTL-overflow | control | fires: the planted box overflows (scrollWidth 733 at 360) | fires (733) |
| CTL-lock | control | fires: without the lock's compensation the page moves 17.5 px and the client width goes 1009 → 1024 | fires (17.5 px; 1009 → 1024) |

D4 note: r1 and r2 picked the reference again in each state. At 1024x768, font 24, the snapshot's reflow then swapped one heading for another (a false 427.6 px), and on new 8 conditions (320 at font 20 with spacing and at font 24, 390 and 1440 at font 24 with spacing) had no heading or paragraph wholly in view. The r3 re-test (`header-matrix.mjs <old|new> d4only`, `logs-F` 09-10) marks the reference once, with the drawer closed, and falls back to any heading, paragraph, list item, image, figure or link whose top edge is in view. It reruns H and F too, and the numbers are the same as r2's: old 39 / 54 and 18 / 54, new 54 / 54 and 54 / 54. The full matrix (r2) is `header-matrix-<old|new>.jsonl`, the r3 re-test `header-matrix-<old|new>-d4.jsonl`.

### 13.9 fix-2: gates, budgets and reproducibility (the final tree)

| check | command (log in `tmp/wf6/fix2/final/`) | result |
|---|---|---|
| build | `node src/build.mjs --dump-models` (`build.log`) | exit 0, 0 failures. 148 / 148 pages + `404.html`, 149 models, 790 files; theme `riverlight.129a5bd9.css` and `site.7c88198c.js` |
| reproducible | `RFEC_DIST=tmp/wf6/fix2/final-a` and `final-b`, then `node tools/hashdir.mjs dist tmp/wf6/fix2/final-a tmp/wf6/fix2/final-b --control` (`hashdir.log`) | **IDENTICAL**, aggregate `64d315c52f74a3b335be5647e4e4f8540e1e608448d7215208061c2b5a2936fc`; the control fired |
| content gates and decontamination | `node tools/run-gates.mjs` (`gates.log`) | **12 of 12 PASS**, every control fired. Copy numbers equal fix-1's (13.4): sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; words 102,222 visible / 0 added, glyphs 0 added. Also: headings 743 / 742 / 1 declared / 0 findings; tags 0 unbalanced; KEEP 239 / 236 / 3 declared, alt fidelity 0 findings; SEO 0 mismatches; residue 0 hits; model-check 149 / 149, 0 violations; sr-decontaminate CLEAN (153 files). Link parity is 897 kept / 0 missing. Link check: 12,382 local refs / 0 broken (12,233 before: the phone logo `source` names a second file on 149 pages), external refs 2,324 (2,323: the `noscript` copy of the YouTube frame) |
| fabrication | `sr-fabrication.mjs --project . --strict` (`fab.log`) | **SOURCED**, 0 / 0 of 707 claims |
| budgets (DESIGN-SPEC 7) | `node tmp/wf6/fix2/budgets.mjs dist` (gzip level 6) | CSS 96,705 bytes, **19,714** gzipped (budget 22,528); JS 27,166 bytes, **9,515** gzipped (budget 10,240) |
| CSP | `node tools/csp-hosts.mjs --control` and `--dir dist` | the control fired; the derived policy equals the DEPLOY.md text word for word (the same 2 frame hosts, the inline-script hash, 21 style attributes) |
| the tested builds | `p/build-diff.mjs`, `p/css-rule-diff.mjs`, `p/min-check.mjs`, `p/cssom-eq.mjs` | the probes ran on four builds (13.6). The final tree differs from `new3` (`54e5e63e…`: the weight crawls, both full header matrices, the content probes and the sweeps) only in its stylesheet: the card ring's inner halo (`inset 0 0 0 3px` → `4px`) and the 879 block-final semicolons. It differs from `new-prehalo` (`d18c2630…`: the layout, motion and most a11y and perf probes) in the four focus-state rules of 13.6 as well. Every probe that reads a focus ring, the D4 re-test, the static probes and the home's weight were re-run on the final tree (`logs-F`) |
| servers | `run-chain.mjs` / `run-chain2.mjs` | started and stopped their own servers on 8873 / 8874 by PID; 8790 (the operator's) was never touched. After the last run, only 8790 listens |
| snapshot-fixed | `rm -rf tmp/wf6/snapshot-fixed`, copy `dist`, then `node tools/hashdir.mjs dist tmp/wf6/snapshot-fixed` | **IDENTICAL**: `64d315c52f74a3b335be5647e4e4f8540e1e608448d7215208061c2b5a2936fc`, 790 files (no older copy existed) |

### 13.10 fix-2: what changed beyond the findings, and what stays open

**What fix-2's changes touch beyond their own finding** (each was measured, or is stated here as not measured):
- **Page weight (the PERF-2 and PERF-3 budget lines).** Against fix-1's build, fix-2 added 1,282 B to the minified
  stylesheet, 615 B to the script, 111 B to the home's HTML and 79-90 B to almost every other page's (the logo
  `source`; 258 B on eye-emergencies with the deferred embed, 19 B on hours-location).
  The verifier's `wcrawl.mjs` (cache off, a full scroll, uncompressed) measured the home at 1440x900, DPR 1, at 898,017 B
  on fix-1's build (13.3) and at 900,025 B on `new3` (`logs-D`), exactly 2,008 B more. That is 25 B over 900 kB in the
  verifier's 1000-byte units (878.9 KiB in the 1024-byte units of the CSS and JS budgets). To keep PERF-2's verdict at
  its stated view, the minifier now also drops the last semicolon of every block (879 B, the same rule list:
  `p/min-check.mjs`, `p/cssom-eq.mjs`).
  - The final tree's home: 899,146 B at 1440x900 (899.1 kB, 854 B under; `logs-F` 13); 1,078,379 B at 1280x585@1.5
    and 1,180,792 B at 390x844@3, 1,129 B more than fix-1's 1,077,250 and 1,179,663 (over the budget before and after:
    the PERF-2 density decision of OPEN-DECISIONS D).
  - Interiors (320,000 B): on `new3` two pages crossed a line that fix-1's build kept. `p/boundary-sum.mjs` (`logs-H`)
    measured both on fix-1's build and on the final tree. `/eyeglasses/sunglasses/` at 1280x585@1.5 is 318,899 →
    320,001 B uncompressed, 1 B over (its gzip estimate, 202,742 B, is far under), so the uncompressed count at that view
    is 26, against fix-1's 25. `/eyeglasses/` at 390x844@3 has a gzip estimate of 319,662 → 319,990 B, still under, so
    the gzipped counts stay fix-1's (4, 7 and 4 at 1440, 1280x585@1.5 and 390x844@3). Both lines belong to the open
    PERF-3 decision.
  - DEPLOY.md's Compression paragraph now quotes the final sizes: the stylesheet 96,705 B (19,714 gzipped), the script
    27,166 (9,515), a page's HTML 21-62 KB (5-15 KB gzipped). Its "26-62 KB" was already off on fix-1's build, whose
    smallest page, `404.html`, is 21.1 KB.
- **The phone logo (PERF-14).** At 768 px and below, DPR 1-2 screens now draw the 300 w logo file instead of the
  988 w one. The artwork is the same (both are byte-identical copies of the source's logos, so A-17 holds). The two
  files' ratios differ (300 x 121 against 988 x 400), so the 145 px logo is 0.2 px shorter (58.5 against 58.7 px), and
  so is the navbar. Every reading below the header at those screens moves by 0.2 px: `v09b-first-block.mjs` (390x844,
  DPR 1) put the scleral post's first block at 671.1 px on fix-1's build (`logs-base-layout` 18) and at 670.9 on fix-2's
  (`logs-A` 20). DPR 3 phones keep the 988 w file.
- **The reviews panel (MOTION-5).** "Read Google Reviews" now sits in the bar above the review, with the dots, instead of
  after it. In the markup, and so in the Tab order (no positive `tabindex` on any page, `10-static.mjs`), the order is
  now the dots, the CTA, then the track. On fix-1's build it was the dots, the track, then the CTA, and on the snapshot
  the track, the dots, then the CTA. The print rules hide only the dots, so a printout shows the CTA above the reviews.
  The photo and the panel are top-aligned from 769 px up, where the grid has two columns.
- **The article card (LAYOUT-15)** fills its grid row on all 132 pages with an aside, from 1024 px. The card is taller
  than its text only where the aside was the taller column. The river is unchanged: `p/ra-hosts.mjs` finds none of the
  1,501 river anchors inside a `.prose-card` (the 532 of the layout are hosted by `div.layout`, whose box the stretch
  does not change).
- **The card ring (A11Y-17)** is drawn on every `[data-tilt]` host: service, child-page, team, post and callout cards,
  on 21 pages. Its halo is the page colour (`--paper`), so it shows only where the ring crosses something else: the
  breakout photo, or a photo or tinted band behind the card. `p/card-ring.mjs` focused each of the 133 hosts at 320x568@2, 390x844@3, 768x1024 and 1280x585@1.5: the ring is drawn on 532 of 532 readings, and none makes the page scroll sideways or runs past the client width or a clipping ancestor. A host planted 2 px inside the right edge does register (6 px).
- **The YouTube embed (PERF-6)** has no `src` until it is within 600 px of the viewport. `p/noscript-embed.mjs` (eye-emergencies at 1440x900, no scrolling, `logs-F` 07-08): with scripts off, the `noscript` copy is requested at load (1 request), so the video still loads without JavaScript. With print media emulated and no scrolling, the frame has no `src` and nothing is requested: a page printed before the frame has come within 600 px prints it empty. Scrolled to the frame (the control), it gets its `src` and is requested. The snapshot requests the frame at load in every mode.
- **The glasses at a larger font (LAYOUT-14).** Only at a Chrome font above 16 px: from 769 px wide the hero glasses sit
  `(font - 16) × 5` px further right (20, 40 and 80 px at 20, 24 and 32). At 1024x600 and font 32 their box starts
  13.3 px inside the frame's left edge, so they no longer protrude there (`v10-glasses.mjs` box, `v05b` frame edge).
- **The scroll lock** pads `html` by the scrollbar's width while the drawer is open. The closed page renders as on
  fix-1's build: fix-1's open-state `scrollbar-gutter` rule is gone.
- **The fallback fonts (PERF-11).** Text at weight 550-599 in the Verdana or Arial fallback is 1.5 % and 3.7 % narrower
  than before. Only the main nav uses 550.
- **Reduced transparency or more contrast (A11Y-19):** the drawer panel is flat paper, the frost cards are opaque and
  the drawer's scrim is 80 %.
- **Focus halos (A11Y-15, A11Y-16):** 12 px instead of 9 on the skip link and the hero toggle.
- **The sticky location card (LAYOUT-8)** reads its exact height, so at 913 px tall and 1024-1199 px wide it no longer
  sticks.

**Not verified here:**
- the Roboto fallback faces (Roboto is not installed on this machine, so their 550 width is unmeasured, and those faces
  are unchanged);
- Firefox and Safari (every probe ran in headless Chrome);
- a real GPU and phone (DESIGN-SPEC Q-14).

**Noted without a finding id, unchanged by fix-2** (the same readings on both builds):
- at scroll 0 the top bar's address link paints its ring on 2 of 4 sides and its two pills on 0 of 4 (`21-promo.mjs`):
  the top is off the page and the navbar paints over the bottom; the fill and colour change still show focus (the
  verifier's clean-claims note);
- the Tab walk of `20-focus.mjs` still has single samples under 3:1 at 6 desktop and 4 phone stops (12 and 5 on the
  snapshot): single-pixel readings at four nav items (1.35-2.29), the hero's inline link, the "eye exam" link, the top bar's
  address link and the phone's two round buttons. Every fix-2 element now reads 3:1 or more on all four sides.

**Open for the operator** (OPEN-DECISIONS D, rows added by fix-2): A11Y-5 (the videos' names), A11Y-11, A11Y-13,
A11Y-18, A11Y-21, A11Y-22, PERF-9 and PERF-15 (deferred with the PERF-2 / PERF-3 density decision). PERF-8 is
informational; its option, a smaller loop, is already in the PERF-2 row. fix-1's open items are unchanged: A11Y-4,
LAYOUT-2, CONTENT-6, -7, -8, -9, -10 and -17, and PERF-2 / PERF-3.

## 14. QA round 1, regressions: REG-B1 and R1, and the interrupted run

Written by the closing run of the regressions stage, 2026-10-05. Input: the two regressions the independent re-verifiers
found on fix-2's build (`tmp/wf6/snapshot-fixed/`, `64d315c5…`): **REG-B1** (nit, a side effect of LAYOUT-11's rem
sizes: at Chrome font 24-32 button labels wrap and their text boxes ran 1.2-3 px past the pill, which clips) and **R1**
(minor, a side effect of CONTENT-2: fix-1 declared 6 figure texts in `facts/client-facts.json`, and because
`sr-fabrication` traces a figure whose text CONTAINS a declared string, an invented review embedding one passed C20).
The stage's fixer (workflow `wf_20c995f7-384`) fixed both at the source and passed the rule set on its tree (`a3976355…`,
03:45 on 2026-10-03), then was interrupted at 03:48 before its acceptance sweeps and its records (14.1). The closing run
audited its edits, ran the sweeps, found one residual of REG-B1 and fixed it (14.2), re-ran the rule set on the final
tree (14.4) and wrote this record. Old = `tmp/wf6/snapshot-fixed` throughout. Files: `tmp/wf6/reg/` (the fixer's: `base/`
its pre-edit copy of the files it touched, `p/` the probes, `logs-main/` its chain) and `tmp/wf6/reg/close/` (the closing
run's scripts, `chains*/`, `logs-chain*/`, `logs/`, `final/`, `results/`, `shots/`). `dist/` is never edited by hand.

### 14.1 The interruption, and the audit of the fixer's edits

**What happened.** The terminal closed at 03:48; the probe chain the fixer was running exited `0x40010004` (console
close) during its step 7, the new build's button sweep, after 2 of its 12 conditions. Nothing on disk was damaged.
- **Salvaged and re-verified:** every source, facts and doc edit (the table below); the R1 probe results of chain steps
  1-6 (accessibility names, element boxes and shots, old and new), compared for the first time in this run; the old
  build's results were reused (its tree is unchanged, `64d315c5…`), the new build's were measured again on the final tree.
- **Lost:** the 2 finished conditions of the button sweep (that probe writes only at its end); they were re-measured.
- **Never run before the interruption, run now:** the button sweep on both builds, the verifier's clip sweep on both, the
  forced-colours and print boxes on both, and the comparisons of steps 1-6. Also re-run on the final tree: the planted
  fabrication control (the fixer's ran at 03:18, before its last template edit at 03:40), the build, the 12 gates,
  `sr-fabrication`, the reproducibility check, the CSP and the budgets.
- **How the browser work ran:** the hard rule is one headless Chrome at a time, in the foreground, and a foreground call
  ends at 10 minutes, while one full sweep takes 15-30. So `close/make-chunked.mjs` derived `p/btn-sweep-c.mjs` and
  `p/clip-sweep-c.mjs` from the originals with exact edits: a condition pick, a save after each condition and a chunk
  suffix on the end-of-run file. Every measuring template string is asserted verbatim (the CLIP and BTN walkers among
  them). `close/merge-chunks.mjs` joins the per-condition files into the original's result file and fails closed when a
  condition is missing or a chunk's control did not fire. Each chunk ran as one foreground `run-chain.mjs` call
  (its own servers on 8881 / 8882, stopped by PID; a step timeout of 540 s; leftover Chromes found by their temp folder).
  The operator's 8790 server is gone with the terminal and was not restarted (the Pages preview replaces it).

| unit | regression | files | decision | measurement |
|---|---|---|---|---|
| `.btn` and `.btn--lg` block padding `.34375em` | REG-B1 | `src/styles/riverlight.css` | KEEP | 14.2. At the default font the 50 / 56 px minimum absorbs it for one- and two-line labels: their boxes are identical on old and new at all six default-font views |
| the stylesheet's line endings, CRLF → LF (a side effect of the fixer's edits; the base copy has 1,501 CR) | none | `src/styles/riverlight.css` | KEEP (LF) | `close/crlf-bundle.mjs`: the bundle built the way `src/build.mjs` builds it is the shipped sheet byte for byte with the file's LF and with CRLF restored in memory (96,739 B, `7a1aaaf1`; a one-declaration control changes it). Every other source file is LF. Only `audit/build-report.json`'s per-layer bytes and sha256 see the difference |
| D.7 transform 9, `nameCaptions()`: a model figure whose caption equals its image's alt prints as `div.fig` + `div.fig__caption` | R1 | `src/lib/templates.mjs` | KEEP | `p/html-delta.mjs` (old against the final tree, theme names normalised; control fired): 8 of 149 pages differ, and only in element names: 7 figures on `/contact-lenses/` (`<figcaption>` 19 → 12 site-wide), 3 doctor portraits (home 1, `/our-eye-doctors/` 2), 5 team arches |
| the arch that holds the portrait plate is `div.titleband__frame` | R1 | `src/lib/templates.mjs` | KEEP | the 5 team pages (14.3) |
| the doctor portrait that holds the plate is `div.doctor__portrait` | R1 | `src/lib/templates.mjs` | KEEP | 14.3; a portrait with its photo stays a `figure` |
| `.rich figcaption, .rich .fig__caption` (a selector list) | R1 | `src/styles/riverlight.css` | KEEP | `.tile figcaption` (the only other `figcaption` rule) does not reach the lens grid; boxes and shots identical (14.3) |
| section 12b declares no figure text; the plate and product checks still run | R1 | `tools/write-facts.mjs` | KEEP | the fixer's planted control (one product alt changed on a raw copy) stops the writer, nothing written (`tmp/wf6/reg/logs/facts-ctl.log`) |
| the regenerated facts: `testimonials` 14 → 8 (the 6 figure-text entries removed), `note` and `testimonialsNote` reworded | R1 | `facts/client-facts.json` | KEEP | `node tools/write-facts.mjs --out tmp/wf6/reg/close/facts-regen.json`: equal to the shipped file but for its `generated` date (2026-10-04 against 2026-10-02), so it is the generator's output, not a hand edit |
| B.0, B.10, B.21, D.5, D.7 (9), H.1 `.fig__caption`, the I.L evidence line, I.118, I.119 | both | `docs/COMPONENTS.md` | REVISE | I.118's evidence cell was the placeholder `REG1_EVIDENCE`: filled with this run's numbers; the radius cap of 14.2 added to B.0 and I.118; I.119 said "16 unnamed `figure` nodes gone": it is 15 per view (`p/pair-compare.mjs ax` prints 16 differing page-view rows, not nodes). The rest was checked against the build and the logs and holds |
| section D: the intro, PERF-15, PERF-3, PERF-2 above DPR 1, CONTENT-5, PERF-8 | deferred items | `docs/OPEN-DECISIONS.md` | REVISE | every number was read back from its log (the re-verifier's `agg-*.log`, `video-*.log`, `imgprobe-new.log`; `ffprobe` and `grep -a -c` on the final build's media). PERF-3 and PERF-2 recomputed with the final stylesheet (14.5); PERF-8's paused-loop cost was "0.003-0.004 s", the first run of each view only: 0.003-0.011 s over both runs |
| the stylesheet size in the Compression paragraph | REG-B1 | `docs/DEPLOY.md` | REVISE (numbers only) | 96,705 / 19,714 → the fixer's 96,739 / 19,723 → 96,763 B / 19,734 gzipped (`tmp/wf6/fix2/budgets.mjs dist`). The CSP block was recomputed by the fixer and again here (`tools/csp-hosts.mjs --dir dist`, `close/csp-eq2.mjs`): EQUAL to the build's policy, unchanged |

Not the fixer's: `tools/noindex-live-check.mjs` changed at 03:15 by the main session (the Pages preview publish); it is
not part of this stage and was not touched.

### 14.2 REG-B1: button labels clipped at a larger browser font

**Change.** The fixer gave `.btn` and `.btn--lg` a block padding of `.34375em` (5.5 / 5.84 px at the default font, whole
layout units), so a label that wraps makes the pill taller instead of running past its clip. The closing run found one
residual: the pill's `999px` radius turns a tall pill into an oval, and at Chrome font 32 on a 390 px phone the 6-line
address button of `/template/header/` lost the top of its first letter to the rounded end (192 glyph pixels cut,
`close/shots/dev-a3976355/new-fs32-390-template-header--0-A.png` against `-B.png`). Fix: `border-radius: min(var(--r-pill),
calc(26px + .75em))`. It is paint only. `close/radius-sim.mjs` recomputed every recorded button's corner clearance under
candidate caps, offline. This cap is the one that keeps the round ends of every one- and two-line pill at fonts 16-32
and clears the 3-line address at font 32 on 1024. At the default font it reaches one button, that address at 320 px
(4 lines, radius 38 instead of 42.3). The stylesheet grows 24 B (11 gzipped) over the fixer's, 58 B (20) over old.

**Button sweep** (`p/btn-sweep.mjs`, run as chunks; every `.btn` of the 149 outputs, the drawer's on 3 pages; the CLIP
walker of the verifier and per-button clearances; both planted controls fired in every chunk, 4 per build; final tree):

| Chrome font, view | pages with a clipped label (CLIP) | labels whose text box crosses the top or bottom | text-box corners inside the round end | at font 16: button boxes identical |
|---|---|---|---|---|
| 16, 320x568@2 | 2 → 0 | 2 → 0 | 2 → 0 | 187 of 196 (the 3- and 4-line labels +11 px, and the buttons below them on their page) |
| 16, 390x844@3 | 1 → 0 | 1 → 0 | 1 → 0 | 191 of 196 (the same, `/template/header/`) |
| 16, 800 / 1024 / 1280x585@1.5 / 1440 | 0 → 0 | 0 → 0 | 0 → 0 | 196 / 196 / 190 / 190 of the same |
| 20, 390x844@3 | 2 → 0 | 2 → 0 | 2 → 0 | |
| 24, 390x844@3 | 17 → 0 | 31 → 0 | 31 → 0 | |
| 32, 390x844@3 | 149 → 1 | 192 → 0 | 192 → 10 | |
| 32, 1024x768 | 3 → 0 | 12 → 0 | 12 → 0 | |
| 20 / 24, 1280x585@1.5 | 0 / 1 → 0 / 0 | 0 / 1 → 0 / 0 | 0 / 1 → 0 / 0 | |

The one CLIP page left at font 32 on the phone is `/hours-location/`'s email address, 68.7 px past `div.page`, the same on
old (not a button; 14.5). The 10 corners are two-line pills that keep full round ends (the "SCHEDULE AN APPOINTMENT"
button on 6 pages, 0.39 px; four `btn--lg` pills, 4.94 px): the text box (ascent + descent) is larger than the ink, and the
ink test finds no cut pixel. The smallest block clearance on the final tree is 3.5 px at font 16 and 8 px at font 32. Every
button is at least 50 px tall (`btn--lg` 56) at every condition (`close/pill-check.mjs`). On the fixer's tree (`a3976355`,
the same sweep, `p/results/dev-a3976355/`) the corner column at font 32 read 12 (to -13.94 px) on the phone and 1 at 1024.

**The verifier's clip sweep** (`p/clip-sweep.mjs` unchanged, as chunks; the 149 outputs; the planted control fired in all
6 chunks; `close/clip-compare.mjs`): pages with clipped text, old → new: font 20 at 390x844 / 800x800 / 1024x768 2 / 0 /
0 → 0 / 0 / 0; font 24 17 / 2 / 3 → 0 / 0 / 0; font 32 at 800x800 / 1280x585@1.5 149 / 149 → 0 / 0. New never exceeds
old; no new hit on any page, so the `/template/header/` exception the acceptance allowed is not needed. Every old sample is
a `.btn` cut on its top or bottom. The old counts are the re-verifier's (17 at font 24 on the phone, 2 and 3 at 800 and
1024), so the instrument reproduces.

**Ink** (`close/ink-test.mjs`: each button's label painted black on no fill, screenshotted with the pill clip, a square
clip and no clip; planted controls fire): glyph pixels cut at font 32, every button of the 149 pages (190), 390x844@3 and
1024x768: **0** on the final tree. Before the cap 192 (the `/template/header/` address, 390), old 439 on the same button.

**Forced colours and print** (`p/forced-boxes.mjs`, 6 pages at 390x844@3 and 1280x585@1.5, font 16; the forced-colours
border control fired, and the 2 px print border shows on the 3-line button): 90 of 100 button boxes identical; the
other 10 are that 3-line address (57.17 → 68.17 px) and the 4 buttons below it, in each mode. Two-line labels stay 50 px
with the 1 px border.

**Shots** (`p/shots.mjs`, reduced motion; `p/png-diff.mjs`, its control fired): the 6 default-font button shots (hero,
footer, hub intro, a two-line label, CTA band, form) are byte-identical old and new; the 3-line address and the 4
larger-font shots (font 24 and 32) are the taller pills. The 18 shots of the final tree equal those of the fixer's tree
byte for byte.

### 14.3 R1: the anti-invention gate widened by six figure-text declarations

**Change** (the fixer's, kept: 14.1): the plates and the lens names print without `<figure>`, and `tools/write-facts.mjs`
declares no figure text, so `facts/client-facts.json` `testimonials` holds only the 8 source cards.
- `p/fig-trace.mjs` (the gate's own testimonial rule, re-implemented read-only): figure or blockquote candidates traced
  only by a figure-text declaration, old build with fix-1's facts 9 (4 lens figures, 3 doctor portraits, 2 arches) → the
  final build 0 with either facts file; the 8 review candidates trace to the declared reviews.
- `sr-fabrication --strict` on the final build: **SOURCED**, 0 / 0 of 698 claims (14.4).
- **Planted control** (`p/fab-ctl.mjs`: the re-verifier's plant file `tmp/wf6/reverify-a/fab-plant.html` in a fresh
  sandbox of the inventory, the raw pages and one facts file; re-run on the final tree, logs `tmp/wf6/reg/logs/fab-ctl-*.log`,
  the fixer's 03:18 copies in `logs/fixer-0318/`): blockers with the snapshot's facts **5**, fix-1's **2**, this stage's
  **5**: the statistic "87.6%", the "CTL4 Heather…" control and the 3 name-embedding reviews ("ACUVUE OASYS® 1-Day with
  HydraLuxe made my eyes…", "Dr. Kristin Nelson, O.D., IACMM was so kind…", "DAILIES TOTAL1® Water Gradient lenses…").
  The re-verifier's own logs read 5 and 2.
- **No visible change**, at 1280x585@1.5 and 390x844@3 on the 8 changed pages: `p/layout-boxes.mjs` 0 of 5,428 element
  boxes moved (its 1 px margin control moves 157); `p/ax-names.mjs` every named node the same, 15 unnamed `figure` nodes
  gone per view (its dropped-label control fires); `p/shots.mjs` the plates, the portraits, the arches and the lens grid
  byte-identical.

### 14.4 Gates and reproducibility (the final tree)

| check | command (log in `tmp/wf6/reg/close/final/`) | result |
|---|---|---|
| build | `node src/build.mjs --dump-models` (`build.log`) | exit 0, 0 failures. 148 / 148 pages + `404.html`, 149 models, 790 files; theme `riverlight.76767940.css` and `site.7c88198c.js` |
| reproducible | `RFEC_DIST=tmp/wf6/reg/close/final-a` and `final-b`, then `node tools/hashdir.mjs dist …/final-a …/final-b tmp/wf6/reg/dev2 --control` (`hashdir.log`) | **IDENTICAL**, aggregate `a1de2c09c8ed6b87193c7b7dd7694df1e596677ff65f4ba7ba423087621c9469`; the control fired. `tmp/wf6/reg/dev2` is the tree every sweep of 14.2 and 14.3 measured |
| content gates and decontamination | `node tools/run-gates.mjs` (`gates.log`) | **12 of 12 PASS**, every control fired. Copy numbers unchanged: sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; words 102,222 visible / 0 added, glyphs 0 added. Also headings 743 / 742 / 1 declared / 0 findings; tags 0 unbalanced; links 12,382 local refs / 0 broken; link parity 897 kept / 0 missing; KEEP 239 / 236 / 3 declared, alt fidelity 0 findings; SEO 0 mismatches; residue 0 hits; model-check 149 / 149, 0 violations; sr-decontaminate CLEAN (153 files) |
| fabrication | `sr-fabrication.mjs --project . --strict` (`fab.log`) | **SOURCED**, 0 / 0 of 698 claims (707 before: the 9 figure candidates are no longer read as testimonials); the declared corpus 23,303 characters (25,193 with fix-1's facts) |
| planted fabrication control | `node tmp/wf6/reg/p/fab-ctl.mjs` (`fab-ctl.log`) | snapshot facts 5, fix-1 facts 2, final facts **5** blockers, the 3 name-embedding reviews among them (14.3) |
| budgets (DESIGN-SPEC 7) | `node tmp/wf6/fix2/budgets.mjs dist` (`budgets.log`) | CSS 96,763 bytes, **19,734** gzipped (budget 22,528); JS 27,166 bytes, **9,515** gzipped (budget 10,240) |
| CSP | `node tools/csp-hosts.mjs --control`, `--dir dist` (`csp.log`), `close/csp-eq2.mjs` | the control fired; the derived policy equals the DEPLOY.md block word for word (unchanged by this stage) |
| browsers and servers | `run-chain.mjs` with `close/chains/` (the fixer's tree) and `close/chains-dev2/` (the final tree); logs `close/logs-chain*/` | 24 foreground runs, 29 probe steps, every one exit 0, one headless Chrome at a time; every run started and stopped its own servers on 8881 / 8882 by PID; no run left a Chrome behind |
| snapshot-final | `rm -rf tmp/wf6/snapshot-final`, copy `dist`, `node tools/hashdir.mjs dist tmp/wf6/snapshot-final tmp/mobile/base` | 14.6 |

### 14.5 Deferred items, side effects and what stays open

- **The deferred rows** are in OPEN-DECISIONS D with their numbers and reasons: CONTENT-5 (the loop files carry the AI note
  in their container tags, 0 IPTC packets, both posters 1; files unchanged), PERF-3, PERF-2 above DPR 1, PERF-15 and
  PERF-8 (informational). None was fixed in this stage.
- **This stage's bytes on those lines** (`p/weight-shift.mjs`, computed on the re-verifier's crawl rows of old): +58 B of
  stylesheet on every page (20 B gzipped), -6 B on the home's HTML. The uncompressed counts are unchanged (14, 26, 14 at
  1440, 1280x585@1.5, 390x844@3). With the text gzipped, `/eyeglasses/` at 390x844@3 goes from 10 B under the 320,000 B line
  to 11 B over (319,990 → 320,011 B), so that count is 5 instead of 4. The fixer's own +9 gzipped bytes kept it 1 B
  under; the radius cap's +11 crosses it, and no spelling of the cap costs fewer than 4 gzipped bytes
  (`close/radius-spellings.mjs`). The home at 1440: 899,198 B, 802 B under its 900,000 B budget.
- **Noted, the same on both builds:** at Chrome font 32 on a 390 px phone `/hours-location/`'s email address runs 68.7 px
  past the page's clip (one unbreakable string): a lead for the mobile work, not a button.
- **`/template/header/`**, the page of the only clipped glyph, is one of the 6 template pages whose removal at launch is
  open (CONTENT-7); the cap applies to every button.
- **Not verified here:** Chrome fonts above 32 px (at about 40 px a two-line pill would round its corners rather than its
  ends); Firefox and Safari; a real phone.

### 14.6 The final tree

`dist/` = `tmp/wf6/snapshot-final/` = `a1de2c09c8ed6b87193c7b7dd7694df1e596677ff65f4ba7ba423087621c9469`, 790 files. It
differs from the fixer's tree (`a3976355…`, which `tmp/mobile/base` holds) only in the stylesheet: the `.btn` radius rule
of 14.2 (`close/css-delta.mjs`: one rule; the other 789 files identical once the fingerprinted theme names are
normalised).

## 15. Mobile optimisation

### 15.0 The request, the audit, the rules and the outcome of the stage

Written by fixer A, the first fixer of the stage, 2026-10-05, and completed by fixer C, the closing fixer, with the
outcome of every audit item and the final tree. Each fixer's work, method and evidence is in its own subsection: 15.1
(fixer A), 15.2 (fixer B), 15.3 (fixer C). The decisions left to the operator are OPEN-DECISIONS section E. On 2026-10-05 the
operator chose "1a 2a 3a 4b 5b 6b 7b 8b" on those options: fixer D1 applied 4b, 5b and 6b and closed two items left open
at 769-1023 px (15.4); fixer D2 follows with 7b and 8b and the records.

**The request.** The operator asked to "optimize mobile". A 4-lane audit (layout, look, touch, speed) ran on
`tmp/mobile/base` (`a3976355…`, the regressions fixer's tree, which differs from the final tree of 14.6 only by the `.btn`
radius cap), each lane followed by a refuter that re-ran its evidence:

| lane | findings (`tmp/mobile/<lane>/findings.json`) | refuter (`tmp/mobile/refute-<lane>/verdicts.json`) |
|---|---|---|
| layout | 11: M-LAYOUT-1 major, 2-4 minor, 5 option, 6-11 nit | 9 confirmed, 2 partly (M-LAYOUT-2, M-LAYOUT-9); missed MISS-L1 (minor), MISS-L2 (nit) |
| look | 14: M-LOOK-1 to 7 minor (with 4 and 5), 6 and 8-12 nit, 13-14 option | 12 confirmed, 2 partly (M-LOOK-2, M-LOOK-12); missed RL-MISS-1 (major, = M-LAYOUT-1), RL-MISS-2 (minor) |
| touch | 5: M-TOUCH-1 to 4 minor, 5 option | 3 confirmed, 2 partly (M-TOUCH-3, M-TOUCH-4); missed MT-R1, MT-R2 (minor), MT-R3 (nit) |
| speed | 6: M-SPEED-1 to 4 option, 5 and 6 nit | 6 confirmed; none missed |

Each lane's probes sit in its folder (`tmp/mobile/<lane>/`, `tmp/mobile/refute-<lane>/`). Where a refuter corrected a number,
narrowed a fix or found a side effect, the refuter's verdict is the one acted on.

**Rules of the stage.**
- *Old*, for every comparison, is `tmp/wf6/snapshot-final` (`a1de2c09…`, 14.6), never edited.
- *The desktop lock:* at 1024 px and wider nothing may change: no box, no computed style, no image pick, no behaviour.
  Every CSS change sits in a media query that cannot match at 1024 px and up (`max-width: 1023px` or narrower), every JS
  change behind the same kind of `matchMedia` check, every markup change is inert there (a class only phone CSS reads, a
  `data-on` that names only the `d` and `t` river layouts, a `sizes` entry gated by a phone query).
- Copy is frozen (the words-added gate reads every visible and visually hidden text node); fixes are made at the source
  (`src/`, `tools/`), never in `dist/`; REG-B1 (14.2) stays closed.
- **The desktop-lock probe** is `tmp/mobile/p/desktop-lock.mjs` (shared; its header documents it). It records, for the 20
  template-family pages at 1024x768 (scrollbars hidden), 1024x768 and 1280x585 DPR 1.5 with a real classic scrollbar
  (`tools/cdp-realsb.mjs`) and 1440x900: every element's border box (keyed by its structural path, so a class does not
  change the key), a digest of its full computed style and of its `::before` / `::after` (property names sorted: Chrome
  orders custom properties differently in each browser process), every image's `currentSrc` and the scroll size, under
  reduced motion with every image loaded and the river rebuilt once on the settled layout. Theme file names and the
  page origin are normalised; image names are not (their hash part tells srcset widths apart). `compare` exits 1 on any
  difference. Controls: Old recorded twice = 0 differences; a planted 1 px margin at 1024 px and up and a planted
  `sizes` change must be reported. Fixer C added two opt-in flags (without them a recording is exactly as before):
  `--transparent SEL` (elements matching SEL are not keyed, so a markup change that only wraps text keeps every other key)
  and `--lines SEL` (the text lines of the matching elements, each line the union of its text rects, so a moved line break
  or a glyph-extent change inside a heading that no element box shows is reported). They are what showed that M-LOOK-11's
  markup could not be made inert at 1024 px and up (15.3).

**The outcome.** 43 audit items: the 36 lane findings and the refuters' 7 missed items. Five groups are one defect each
and were fixed together: M-LAYOUT-1 = RL-MISS-1, M-LAYOUT-4 = M-LOOK-7, MISS-L1 + M-LOOK-8, M-LOOK-1 + M-LAYOUT-6 + MISS-L2,
M-LOOK-4 + M-LAYOUT-2. **28 fixed, M-SPEED-1 adopted (an operator option applied by default under "optimize mobile",
revertible), 4 partly fixed, 2 not fixed (each with its reason), 8 left to the operator** as options (OPEN-DECISIONS E,
with their measured numbers, costs and exact changes). Every change is scoped below 1024 px; the desktop lock holds on
the final tree (15.3: 0 differences on the 20 family pages at the four desktop conditions, controls fired).
**Second round (fixer D1, 15.4):** M-LAYOUT-5 (option 4b) applied, **partly** (the h1 fits at 375x667, 320x568 and
844x390; 667x375 cannot fit with its 138.5 px landscape header); M-LOOK-13 (option 5b) applied, **fixed**; M-LOOK-14
(option 6b) applied, **partly** (the first content 33-70 px earlier, not the estimated 100-150, with the h1 never
squeezed); the river over the arch faces at 769-1023 px (M-LAYOUT-1's open part) and the doctor blocks at 769-1023 px
(M-LAYOUT-11's open part) **fixed**; the desktop lock holds on all 149 pages at seven conditions.

**The final tree** (of the first round, fixer C). `dist/` was then = `tmp/mobile/fixed/` (the build the independent verifiers and the preview use) =
`tmp/mobile/fix-c/snapshot/` = aggregate `79ecd3cf0f73271f43dbb69b6da7ed1ee0b95bbf6ac810ece4f8c99480bb6025`, 790 files
(theme `riverlight.a5503aa5.css`, `site.850aac8c.js`). 12 of 12 gates pass with the copy numbers of 14.4 unchanged
(sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; 0 words and 0 glyphs added);
`sr-fabrication --strict` SOURCED (0 / 0 of 698 claims); two `RFEC_DIST` builds byte-identical to it.
**Fixer D1's tree (15.4):** `dist/` = `tmp/mobile/fix-d1/snapshot/` = aggregate
`5f2cf83155e0bc5dad4e326eb42ab9a47b720c8dd618699d4337648c1ec77ae0`, 790 files (theme `riverlight.9de07569.css`,
`site.5fd59f85.js`), the same gate numbers, SOURCED and reproducible; `tmp/mobile/fixed/` (`79ecd3cf…`) was not touched.

**Every audit item.** Severity is the auditor's, then the refuter's verdict where it changed it. Fixer and subsection:
where the work and its evidence are; register: COMPONENTS I.M.

| item | lane, severity | the finding | outcome | fixer, notes, register |
|---|---|---|---|---|
| M-LAYOUT-1 | layout, major | the river's over copy crossed the faces in the portrait and people arches at 320-768 px | **fixed** for the 12 photo arches (and the generated ones); the 5 placeholder plates take the fallback (the river passes behind them); 769-1023 px **fixed** by fixer D1 (layout `m`: face zone 0 on all 143 photo arches; the plates behind there too) | A, 15.1, I.120; D1, 15.4, I.151 |
| M-LAYOUT-2 | layout, minor → partly, nit | CTA pills break onto two lines at 360-375 px | **partly** (with M-LOOK-4): balanced, tighter pill padding; at 320 the longest labels still wrap, balanced | A, 15.1, I.127 |
| M-LAYOUT-3 | layout, minor | `/contact-lenses/` brand cards one column at 560-1023 px | **fixed**: two columns at 560-1023 px | A, 15.1, I.121 |
| M-LAYOUT-4 | layout, minor (= M-LOOK-7) | below 360 px the reviews bar wraps (fifth dot alone, CTA on two lines) | **fixed** | A, 15.1, I.122 |
| M-LAYOUT-5 | layout, option | the home h1 below the first screen on short phones, landscape and 768 | **operator option 4b, applied: partly**: h1 bottom 784 → 656 / 667 (375x667), 731 → 558 / 568 (320x568), 614 → 383 / 390 (844x390); 667x375 991 → 385 / 375 does not fit (the landscape header); taller phones unchanged | D1, 15.4, I.148, I.153 |
| M-LAYOUT-6 | layout, nit (with M-LOOK-1) | a lone tile in the left half of a two-column phone grid | **fixed** | A, 15.1, I.124 |
| M-LAYOUT-7 | layout, nit | Tab lands the next control flush on the fold and cuts its focus ring | **fixed**: walks with a cut ring 9/20 → 0/20 (390), 6/20 → 0/20 (360) | C, 15.3, I.137 |
| M-LAYOUT-8 | layout, nit | `/contact-us/patient-forms/`: the forms list touches the paragraph above it | **fixed**: 0 → 17-18.5 px | C, 15.3, I.138 |
| M-LAYOUT-9 | layout, nit → partly | `/eye-care-services/eye-exams/`: an h4 9 px under its h3 | **fixed** below 1024 px (a refinement of the 0.5em rhythm, the refuter's reading): 9-10 → 18-20 px | C, 15.3, I.139 |
| M-LAYOUT-10 | layout, nit | the two longest post h1s run 6 lines at 320 px | **fixed**: 6 → 5 lines | C, 15.3, I.140 |
| M-LAYOUT-11 | layout, nit | `/our-eye-doctors/`: 191 px of empty band between stacked doctor blocks | **fixed** at 768 px and below: 191 → 111 px (text), 152 → 72 px (box); at 769-1023 px by fixer D1: 175-219 → 79-129 px (box) | C, 15.3, I.141; D1, 15.4, I.152 |
| MISS-L1 | refute-layout, minor | heading-only hub bands leave the heading two paddings above its content | **fixed** (with M-LOOK-8) | A, 15.1, I.123 |
| MISS-L2 | refute-layout, nit | designer-frames fig-grid tiles of unequal heights | **fixed** (with M-LOOK-1) | A, 15.1, I.124 |
| M-LOOK-1 | look, minor | two-column phone grids end on a lone left item; unequal brand chips | **fixed** | A, 15.1, I.124 |
| M-LOOK-2 | look, minor → partly | centred and left headings alternate in one column | **fixed** with the refuter's narrow rule | A, 15.1, I.125 |
| M-LOOK-3 | look, minor | the home cataract card opens with an empty line | **fixed** | A, 15.1, I.126 |
| M-LOOK-4 | look, minor | pill labels end on one word or cramp into two lines | **partly** (with M-LAYOUT-2) | A, 15.1, I.127 |
| M-LOOK-5 | look, minor → nit | treatment paragraphs under 30 characters a line at 320 / 360 px | **partly**: fixed from 360 px (paragraphs under 30: 7/9 → 1/9); at 320 the median goes 24 → 27, still under 30 | C, 15.3, I.142 |
| M-LOOK-6 | look, minor → nit | FAQ questions end on one dangling word | **fixed**: 12 → 1 (320), 13 → 0 (360), 9 → 0 (390) of 29 | C, 15.3, I.143 |
| M-LOOK-7 | look, minor (= M-LAYOUT-4) | the fifth review dot alone on a second row at 320 | **fixed** | A, 15.1, I.122 |
| M-LOOK-8 | look, nit (with MISS-L1) | two stacked wave rules over an empty band on `/contact-lenses/` | **fixed** | A, 15.1, I.123 |
| M-LOOK-9 | look, nit | wrapped sitemap links lose their row spacing | **fixed**, the rule widened to 1023 px (the two-column list crowds the same way at 768 and 844x390): 3.2-3.9 → 16.2-17 px | C, 15.3, I.144 |
| M-LOOK-10 | look, nit | the footer legal links wrap off-centre at 320 px | **fixed**: offsets -28.2 / -102.6 → 0 / 0 px | C, 15.3, I.145 |
| M-LOOK-11 | look, nit | headings split names ('Fort / Myers', 'Co- / Management') and leave lone fragments on narrow phones | **not fixed**: the markup-only no-break was built and passed the 12 gates with no overflow, but it glues words inside the home's two inline-flex heading links at every width and moves heading text by 0.01-0.03 px at 1024 px and up (the desktop lock); withdrawn | C, 15.3, I.146 |
| M-LOOK-12 | look, nit → partly | the practice videos show as plain grey boxes, not the CSS poster | **fixed** in Chromium below 1024 px: the native controls' default-poster grey made transparent, the control bar's scrim kept (grey 49-51 → navy 18 / 29 / 67); unverified on WebKit | C, 15.3, I.147 |
| M-LOOK-13 | look, option | the river strands keep desktop widths on phones | **operator option 5b, applied: fixed** (every strand 0.6 at 768 px and below; face zone, R3, A-13 and B1 as before) | D1, 15.4, I.149 |
| M-LOOK-14 | look, option | the phone title band leaves a large empty area beside the small arch | **operator option 6b, applied: partly**: the arch rises into the pane's corner, the first content 48 px earlier (44.4 at 320; 53.9-69.7 on dated posts, 33 on chip pages), the h1 unchanged on all 148 pages; not the estimated 100-150 px | D1, 15.4, I.150 |
| RL-MISS-1 | refute-look, major (= M-LAYOUT-1) | the river's in-front strands across the staff portraits' eyes | **fixed** (as M-LAYOUT-1) | A, 15.1, I.120 |
| RL-MISS-2 | refute-look, minor | a list item that only wraps a nested list draws a stray bullet and indents twice | **fixed** | A, 15.1, I.128 |
| M-TOUCH-1 | touch, minor | without `<dialog>` (Safari before 15.4) the closed drawer covers every page | **fixed** (simulated; unverified on WebKit) | B, 15.2, I.129 |
| M-TOUCH-2 | touch, minor | the date of birth opens a digits-only keypad for mm/dd/yyyy | **fixed** | B, 15.2, I.130 |
| M-TOUCH-3 | touch, minor → partly, option | the call link at the foot of every page is a 20-21 px inline link | **operator option** (the refuter: not a defect; B.0 rule 1 and WCAG 2.5.8's inline exception) | OPEN-DECISIONS E |
| M-TOUCH-4 | touch, minor → partly, nit | a tap leaves hover and focus looks stuck | **fixed** | B, 15.2, I.133 |
| M-TOUCH-5 | touch, option | landscape phones lose every header control once they scroll | **operator option** | OPEN-DECISIONS E |
| MT-R1 | refute-touch, minor | a second tap on the menu spot navigates away | **fixed** | B, 15.2, I.131 |
| MT-R2 | refute-touch, minor | Back restores a page with the drawer open | **fixed** | B, 15.2, I.132 |
| MT-R3 | refute-touch, nit | one fast swipe can skip a review | **partly**: hand-speed skips 33/64 → 4/64 | B, 15.2, I.134 |
| M-SPEED-1 | speed, option | cap content images at 2x density on phones | **adopted** by default under "optimize mobile" (the operator can revert) | B, 15.2, I.135; OPEN-DECISIONS E |
| M-SPEED-2 | speed, option | the phone hero loop (271 KB): keep, re-encode or poster only on phones | **operator option** | OPEN-DECISIONS E |
| M-SPEED-3 | speed, option | a click-to-load map facade (about 620-749 kB on phones with no tap) | **operator option** | OPEN-DECISIONS E |
| M-SPEED-4 | speed, option | a YouTube facade (about 1.06-1.10 MB when merely scrolled past) | **operator option** | OPEN-DECISIONS E |
| M-SPEED-5 | speed, nit | three phone `sizes` values overstate the painted width | **fixed** | B, 15.2, I.136 |
| M-SPEED-6 | speed, nit | the first-4-eager rule loads images far below the phone's first screen | **not fixed**, as the auditor and the refuter advise: `loading` is one attribute for every viewport, so a change would move desktop loading (PERF-5) | B, 15.2 |

### 15.1 Fixer A: the river, layout and look (9 items)

Items: M-LAYOUT-1 = RL-MISS-1, M-LAYOUT-3, M-LAYOUT-4 = M-LOOK-7, MISS-L1 + M-LOOK-8, M-LOOK-1 + M-LAYOUT-6 + MISS-L2,
M-LOOK-2, M-LOOK-3, M-LOOK-4 + M-LAYOUT-2, RL-MISS-2. Scratch, probes, results, logs and shots: `tmp/mobile/fix-a/`
(`p/` the probes, `results/` and `final/` their output, `reg/` the REG-B1 probes, `shots/` the crops; `base/` the
pre-edit copies of the files changed, with `SHA256SUMS.txt`). Servers: `tools/serve.mjs` on 8921 (the build:
`tmp/mobile/fix-a/dev`, byte-identical to the final `dist/`) and 8922 (Old), stopped by PID. Browser work: one headless
Chrome at a time (`tools/cdp.mjs`, `tools/cdp-realsb.mjs`), foreground, phone emulation from the stage recipe
(`p/lib.mjs`: `setDeviceMetricsOverride` mobile with DPR and orientation, touch, hover none / pointer coarse, an Android UA;
`innerWidth` and `clientWidth` asserted after every load, and from 06:46 every load asserted to be a site page), reduced
motion for geometry. Every measure ran the same code on Old and on the build and has a planted control that fired.

**Files changed.** `src/lib/templates.mjs` (the title route, the plate weave zone, D.7 transform 10);
`src/styles/riverlight.css` (23 rules in 14 media blocks, each block with its comment, every query `max-width` 1023 px or
narrower, plus `.li--wrap` added to the `:is()` of the two base list selectors);
`docs/COMPONENTS.md` (B.0, B.10, B.13, B.15, B.21, B.23, B.24, B.31, C.7, D.4, D.5, D.7, H.1, register I.M rows
I.120-I.128); this section. Built output (`tmp/mobile/fix-a/p/html-delta.mjs`, Old against the final tree, theme names
normalised): 150 of 790 files differ: the stylesheet; 148 pages by the title route's two `p:` values (2 of them also by
`class="li--wrap"`, 5 by the plate zone's `data-on="d t"`); the home by the stylesheet's name only. No other byte.

| item | change (source) | fail on Old → pass on the build (probe; control) | neighbour widths |
|---|---|---|---|
| M-LAYOUT-1 = RL-MISS-1 (major) | `TITLE_ROUTE` `t1` `p:104%,62%` → `p:104%,100%+46px`, `t2` `p:64%,100%` → `p:56%,100%+46px` (`HUB_TITLE_ROUTE` takes them); a plate arch's zone `data-on="d t"` | `p/river.mjs`, the 17 arches: face-zone pixels (the upper 60 % of the arch shape, over copy shown vs hidden, a channel moving by 8 or more, 1.5 px off the edge) Old 7,293-7,557 / 19,076-19,583 / 20,977-21,595 / 23,297-24,076 / 8,743-9,560 at 320 / 360 / 390 / 430 / 768 on every arch → 0; at 412x915@2.625 (pixels at 40+ levels, below) 11,209-15,177 → 0; 375x667 and 667x375 0. The over copy's painted extent (geometry, every strand's round-capped stroke inside the shape) Old 0.01-0.60 of the arch height → 0.70-0.91 on the 12 photo arches; none on the 5 plates. Controls at every size: a 6 px path planted at 0.30 H read 0.22-0.29, a rectangle clip read over copy outside the shape, a half clip read seam columns | the route has only `p` values (768 px and below; `t` and `d` unchanged, 769 px and up), all 149 pages swept at 320-768 (below) |
| M-LAYOUT-3 | `.cards--brand` two columns at 560-1023 px | `p/items.mjs` brand: one column at every width; 667x375 / 844x390 / 768x1024 list 2,070 / 2,559 / 2,349 → 550 / 672 / 620 px, logo 28 / 17 / 21 → 73 / 77 / 76 % of its chip; control: 2 columns planted reads 2 | 560 / 600 / 700 / 820 / 1000 px: 2 columns, the logo 56-77 %; 320-430: one column, unchanged |
| M-LAYOUT-4 = M-LOOK-7 | `.reviews__panel` inline padding 20 px below 360 px | bar 234 → 246 px, dot rows 2 → 1, CTA lines 2 → 1, dots 44x44 (320x568); control: a 200 px bar wraps | 360-1000 px: unchanged (the CTA pill 18 px narrower at 360-412 from the button rule, still one line) |
| MISS-L1 + M-LOOK-8 | below 1024 px a heading-only band drops its bottom padding, the next band's top padding 24 px; a hub-flow holding only an `hr` not drawn | heading to its content 192 → 66 px (`/contact-lenses/`) and 128 → 24 px (designer-frames) at 320-768; the duplicate wave rule drawn 1 → 0 (the `hr` stays in the DOM); 0 hidden elements with words; control: 300 px planted reads +236 | 844x390, 820, 1000: 195-224 → 68-74 and 131-160 → 24 px (the rule was widened from the refuter's 768 to 1023 px because the landscape phone at 844 kept the gap) |
| M-LOOK-1 + M-LAYOUT-6 + MISS-L2 | lone last logo-wall chip centred below 600 px; lone last fig-grid figure centred and brand chips square up to 768 px | last-item offsets -62.5 to -180.5 px → 0 (logo wall at 320-560, fig-grids at 320-768); brand chips 173 / 94 / 80 → 171 / 171 / 171 px at 390, 0 images cropped; control: two figures planted (one cropped) read | 600 / 700 / 768: the logo wall's 4 columns unchanged (the refuter's breakage of a 767 px logo rule avoided by the 599 px scope); 769 px and up every grid unchanged |
| M-LOOK-2 (partly) | the refuter's narrow rule below 1024 px: a hub-flow `h2` right after a centred band title is centred, its wave rule too | 'LIVE BETTER' text centre -65.4 (320) to -355 (1000) px off the column centre → 0; the other band titles stay centred; control: the alignment toggled reads | the only match on 149 pages |
| M-LOOK-3 | `.cataract__copy > p:first-child > br:first-child { display: none }` below 1024 px | heading to the first line 54.4-58.5 → 28-30.9 px at 320-844 (65 → 37 at 1000), the `br` in the DOM; control: two `br` planted read +53 | |
| M-LOOK-4 + M-LAYOUT-2 | labels balanced up to 768 px; up to 420 px the pill padding `clamp(16px, calc(1.5em - 8px), 24px)`, gap `clamp(8px, .5em, 10px)`, `btn--lg` `clamp(18px, calc(1.5em - 7.5px), 30px)`; up to 420 px hub intro 16 px, CTA panel 20 px; below 360 px side card 18, quick action 12, doctor text 20 px | `p/items.mjs` btn, 25 pages: wrapped labels 34 → 14 / 14 → 4 / 13 → 4 / 4 → 2 at 320 / 360 / 375 / 390, ending on one word 30 → 11 / 14 → 0 / 13 → 0 / 3 → 0, at 412 and 430 1 → 0; every pill 50 px or taller, 0 under 44; the CTA band's navy frame 10 px kept (the auditor's `.ctaband { padding: 0 }` dropped, as the refuter asked); control: a 150 px pill wraps | at 320 still wrapped (wider than any pill there, balanced): 'SCHEDULE AN APPOINTMENT' on 6 hubs (2 + 1), 'Schedule Appointment' / 'Request Appointment' in the 4 CTA bands (1 + 1), 'Learn More About Cataract Co-Management' (3 lines), 'Read About Insurance Plans We Accept' (to 375 px) |
| RL-MISS-2 | `li.li--wrap` (D.7 transform 10, `rich()`); below 1024 px no bullet and no indent of its own, its items take the wave bullet; the base selectors list `.li--wrap` so 1024 px and up is unchanged | text 60 → 30 px from the list edge, `::before` none, the nested items' marker the wave bullet, both pages at 320-1000; control: a nested-only item planted is found | 1024 px and up identical (desktop lock, coopervision is a family page) |

**The river decision (M-LAYOUT-1).** The preferred fix held for the photos and the generated arches: with `t1` and `t2`
level 46 px below the band bottom (the arch overhangs the band by half its height) the in-front stretch crosses the arch's
lowest part at every phone width (candidates in `results/cand/`: the auditor's alternative read 0.62 at 430, at the edge
of the face zone; the refuter's `p:104%,96%` / `p:60%,100%+48px` crossed it at 0.39-0.45). It did not hold for the 5
placeholder plates: a plate prints its monogram ring over 0.18-0.62 of the arch and the person's name over its lowest part
(0.61-0.92 at 320, 0.69-0.93 at 768; `p/plates.mjs`, `results/plates.json`), and with the level route the strand band
crossed every plate's name at 320 and Nelson's and Longa's at 390 (`shots/sheet-D-team-plates-320.png`). The window
between the monogram and a three-line name is 13 px at 320 against a 30 px painted band, so no route crosses a plate in
front without crossing its monogram or its name. Plates therefore take the task's fallback, and only they: their weave
zone prints `data-on="d t"` and the river passes behind them on phones. **R3 cost for the operator:** the 5 plate pages
(`/team/dr-kristin-nelson-od/`, `/team/heather/`, `/team/jhonae-anglin/`, `/team/maivys-longa/`,
`/team/xaiene-dos-santos-da-costa/`) show no in-front crossing within their first two phone screens until the practice
supplies the portraits (OPEN-DECISIONS: the 5 portraits); a photo arch takes the moved route automatically. Before and
after crops at 390 (3 team pages, 2 hubs): `shots/sheet-river-before-after-390.png`, the pairs in `shots/river-390/`.

**A-13 and R3 on every page** (`p/river.mjs --pages all --clear`, the 149 outputs at 320 / 360 / 390 / 430 / 768 on the
build, `results/sweep/`, `p/sweep-sum.mjs`; the controls fired at every width, including a planted unshielded line on the
body strand). The 40 px clearance is the integrate stage's riverText code (`tmp/wf5b/integrate/probe.mjs`, 12.3 row 8)
copied verbatim. No seam-scan script survives from the earlier stages (12.4: the styles stage ran its own on its gallery;
`tmp/` holds only the brand judge's three-row sampler), so A-13's seam clause is this probe's: over-copy pixels outside
the arch shape, and arch columns where the geometry puts the body strand but no over-copy pixel changed (controls: a
rectangle clip 40 px larger than the arch, a clip of its right half). Results: face zone 0 of 149 at every width (Old at 320: 148, every arch); over copy outside the arch shape 0 (one
read of 8 pixels at 320 on `/hours-location/`, whose live map can make the river rebuild between the two captures, did
not repeat in 7 runs; the probe now re-takes a pair whose river record changed); seam columns 0; an in-front crossing
within the first two screens on all 143 photo and generated arches (the 5 plates as above); text lines that are not on a
surface within 40 px of the river's centre line: 0 at 360-768, and at 320 the same 10 pages and the same lines as Old
(the home and 9 hub-frame pages, 38-40 px: the left bank at -7% is 22.4 px out at 320; the integrate stage verified 360-768,
12.2 item 1), so no new line.

**REG-B1** (the pill padding is touched, so the closure's probes were re-run: `tmp/mobile/fix-a/reg/`, copies of
`tmp/wf6/reg/p/btn-sweep-c.mjs`, `clip-sweep-c.mjs` and `close/ink-test.mjs` verbatim, the lib on this stage's ports and one
folder deeper; every control fired except the ink test's pushed-up label on Old at font 16 at 320, where the planted label
wraps to two lines and its first line leaves the capture; it fired on the build there and everywhere else):

| condition (phone) | btn-sweep pages with a clipped label, Old → build | corners in the rounded clip | clip-sweep pages | ink: glyph pixels cut |
|---|---|---|---|---|
| font 16, 320x568@2 | 0 → 0 | 0 → 0 (smallest clearance 2.22 → 2.96 px) | | 0 → 0 |
| font 16, 390x844@3 | 0 → 0 | 0 → 0 | | 0 → 0 |
| font 20, 390x844 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| font 24, 390x844 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| font 32, 390x844@3 | 1 → 1 (the `/hours-location/` email, `div.page`, not a button) | 10 → 0 (balanced lines are narrower) | | 0 → 0 |

The ink test lists "faint" differences (no channel above 24, anti-aliasing): Old 0 / 0 / 0 / 3 / 0 and the build
1 / 1 / 1 / 4 / 2 at font 16 (320, 390), 20, 24 and 32. The one that recurs on the build at every condition is
`/eyeglasses/designer-frames/` 'More Google Reviews', where the band behind the label re-rasterises (its A and B
captures are identical by eye: `shots/ink-faint-designer-frames-AB.png`); the others are `/template/*` buttons, faint on
both builds at different conditions.

**Other checks on the build.** No page overflow and no box cut by `#page`'s clip on any of the 149 pages at 320x568,
600x900, 768x1024 and 1000x800 (`p/overflow-sweep.mjs`; control: a box 80 px wider than the viewport is reported).
Before / after crops of every changed component: `shots/items/pair-*.png`.

**Gates and reproducibility (the final tree, logs in `tmp/mobile/fix-a/final/`).**

| check | result |
|---|---|
| build | `node src/build.mjs --dump-models`: exit 0, 0 failures, 790 files, theme `riverlight.48baeb58.css`, `site.7c88198c.js` (unchanged) |
| 12 gates | `node tools/run-gates.mjs`: **12 of 12 PASS**, every control fired; copy numbers unchanged: sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; words 102,222 visible / 0 added, glyphs 0 added |
| fabrication | `sr-fabrication.mjs --project . --strict`: **SOURCED**, 0 / 0 of 698 claims |
| reproducible | `RFEC_DIST=tmp/mobile/fix-a/final-a` and `final-b`, `node tools/hashdir.mjs dist …/final-a …/final-b --control`: **IDENTICAL**, aggregate `dfa9f5beba98c072c8a787246be1049639907caed11aa8a693ac32a51bd1bd31`, the control fired |
| budgets | `node tmp/wf6/fix2/budgets.mjs dist`: CSS 98,989 bytes, **20,070** gzipped (budget 22,528; +2,226 / +336 over Old); JS 27,166 / 9,515 (unchanged) |
| desktop lock | `tmp/mobile/p/desktop-lock.mjs`, Old against the build, 4 conditions x 20 pages, 9,893 elements each: **0** boxes, 0 style digests, 0 pseudo digests, 0 image picks, 0 element-count or scroll-size mismatches. Controls: Old against Old 0; a 1 px margin planted at 1024 px and up: 4,651 boxes and 305 style digests at each 1024 condition; a `sizes` planted on 2 pages at 1440: 2 image picks. With motion on (`--motion`: 1440x900 and 1280x585@1.5, the hero loop paused, `final/dlm-*.json`): Old against Old 2 style digests (the title-band container of the two plate pages at 1440), Old against the build 1-3, every one on those elements or on the home's hero video, whose digest flips between runs of either build (4 runs of each: the same two values on both); 0 boxes, 0 image picks |

**Incidents.** The two servers were started with the 2-hour background limit and were stopped by it at 06:43:54, during
a 4-condition ink run: the build's half had finished at 06:42:00 and was kept; Old's was stopped by its PID (with its
Chrome) and re-run on restarted servers. The `p/lib.mjs` probes and the desktop-lock probe now fail on a page that is not a
site page (an error page is "complete" too); the servers restarted at 06:46:32 served every later run and were stopped by
their PIDs at about 08:10, before their own limit. At 412x915@2.625,
hiding the over layer re-rasterises the whole arch photo (1-7 levels on about 57,000 face-zone pixels, 8-23 on about 300,
none at 40+; `shots/dbg/mask-412-new-rose.png`, `p/dbg-hist.mjs`), so at that DPR the face verdict is read from geometry
and from pixels moving by 40 or more (Old 11,209-15,177, the build 0).

**Left open (for the operator and the next fixers).**
- R3 on the 5 plate pages (above).
- **New, not fixed: the landscape phone and the tablet (769-1023 px).** The river's `t` layout (769-1199 px) takes the
  title anchors' `d` values, so at 844x390 the over copy still crosses the arch at 0.17-0.61 of its height on all 17 arches
  (`results/river-844-new.json`: pixels at 40+ levels in the face zone 19,776-27,934; Rose's chin and cheek, the staff
  group's faces: `shots/sheet-river-844.png`), as on Old. M-LAYOUT-1 was scoped to 768 px and below. A `t:` value would also
  move the river at 1024-1199 px (locked); a fix needs a site.js layout split at 1023 px (for example an `m:` anchor value
  read only below 1024 px, behind a `matchMedia('(max-width: 1023px)')`), with the plate zone and A-13 re-checked there.
- The 320 px left bank: the river's centre line runs 38-40 px from the gutter text of the home and 9 hub-frame pages at 320 (A-13
  asks 40); the same on Old; the hub route's `-7%` would need `-8%` or a px value at that width (not this stage's item).
- At 320 the labels listed in the table still wrap, balanced; only a copy change or a wider pill would put them on one line.
- `cards--brand` at 1024 px and up is one column, against C.7's specified 4 (desktop frozen; I.121).
- Unverified on WebKit / iOS Safari: `text-wrap: balance` (Safari 17.5 and later; older Safari wraps as before), `:has()`
  in the heading-band rule (Safari 15.4 and later; older Safari keeps the gap and the second wave rule).
- The stylesheet grows 336 gzipped bytes on every page; BUILD-NOTES 14.5's gzip-over interiors count (the 320,000 B line
  at 390x844@3) was not recomputed here.

### 15.2 Fixer B: touch and speed (9 items)

Items: M-TOUCH-1, M-TOUCH-2, MT-R1, MT-R2, M-TOUCH-4, MT-R3, M-SPEED-1 (an operator option, adopted by the orchestrator
under "optimize mobile"; the operator can revert it), M-SPEED-5, M-SPEED-6 (kept as is). Built on fixer A's tree
(`dfa9f5be…`); none of fixer A's rules is touched. Scratch, probes, results, logs and shots: `tmp/mobile/fix-b/` (`p/` the
probes, `results/old|new/` the per-build rows, `results/pl/`, `results/dl/`, `results/w/` the phone lock, desktop lock and
weights, `logs/`, `shots/`; `base/` the pre-edit copies of every file changed, with `SHA256SUMS.txt`). Servers:
`tools/serve.mjs` on 8923 (the build, `tmp/mobile/fix-b/dev`, byte-identical to the final `dist/`) and 8924 (Old; fixer A's
tree for the phone lock from 10:26 to 10:42), restarted by PID before their 2-hour limit (10:26, 12:22) and stopped by PID at
the end. Browser work: one headless Chrome at a time (`tools/cdp.mjs`, `tools/cdp-realsb.mjs` through desktop-lock),
foreground; phone emulation from the stage recipe (`p/lib.mjs`, the refute-touch lane's helpers: mobile metrics with DPR
and orientation, touch, hover none / pointer coarse, an Android UA, `innerWidth` asserted, every load asserted to be a site
page; a desktop view also sets a desktop UA). The refuters' probes were copied verbatim into `p/` (`r01`, `r01c`, `r02`,
`r03`, `r03b`, `r04`, `r07`, `r08`, `r09`; only their lib's origin and output folder differ); the speed lane's
`weight.mjs` / `slib.mjs` / `agg-weight.mjs` as `p/weight-fb.mjs` / `slib-fb.mjs` / `agg-weight-fb.mjs` (build root and
port from the environment, plus a double-fetch reading). Every measure ran the same code on Old and the build.

**Files changed.** `src/theme/site.js` (1.5: `--menu-top`, `pagehide`, the no-`<dialog>` branch, all behind
`matchMedia('(max-width: 1023px)')`); `src/styles/riverlight.css` (the hover splits, the drawer padding, the card reset,
`scroll-snap-stop`, the no-modal block: every new query is `max-width: 1023px`, `(hover: none) and (max-width: 1023px)`
or the hover half `(hover: hover), (min-width: 1024px)`); `src/styles/motion.css` (the sheen split, the card's lift and
glare reset); `src/lib/templates.mjs` (`capSizes()`, `img()`'s `cap` option, the D.7.3 cap with the `fig--brand`
exclusion, head()'s `imagesizes`, the team grid's 600-768 px entry); `src/lib/home.mjs` (the service cards' and trio's
phone entries, the Alumier logo excluded); `src/lib/forms.mjs` (no `inputmode`); `docs/COMPONENTS.md` (0.3, 0.8, 1.5,
A.1, B.0, B.2, B.6, B.8, B.11, B.15, B.26, B.27, E.1, E.2, H.1, register I.M rows I.129-I.136); this section and 5.5;
`docs/OPEN-DECISIONS.md` (the PERF-2 and PERF-3 rows: the cap is applied); `docs/DEPLOY.md` (the compression paragraph's
stylesheet, script and HTML sizes). Built output against fixer A's tree: 149 of 790
files differ in content (144 pages by the `sizes` twins, the appointment form also by its date field; 5 pages by the theme
file names only) and the stylesheet and script are renamed (`riverlight.641c4b09.css`, `site.850aac8c.js`).

| item | change (source) | fail on Old → pass on the build (probe; control) | neighbours and side effects |
|---|---|---|---|
| M-TOUCH-1 (minor; simulated, unverified on WebKit) | below 1024 px `dialog.drawer:not([open]) { display: none }`; site.js: where `showModal` is missing, `html.no-modal` follows `(max-width: 1023px)`; under it the no-JS nav rules, with the refuter's amendment (`scroll-padding-top: 16px`, `.navbar :is(a, button) { scroll-margin-top: 0 }`) | `r01-dialog.mjs` (verbatim; `showModal` removed and the UA rule replaced before load, no fix injected) at 390x844@3 and 320x568@2: Old: the closed drawer display block over the whole viewport, 4 of 4 points hit it, a card tap does not navigate, the menu stays closed, 0 nav links → build: display none, the points hit the page, the card tap navigates, 15 nav links, no sideways scroll. `p/fb-nodialog.mjs` at 390 / 320 / 667x375 / 700x1000 / 768 / 820x1180 / 844x390: the 'Insurance' nav link and a card navigate, a `#main` jump lands 16 px down (the refuter measured 717 / 797 px without the amendment), a FAQ question opens by tap (Old: covered). Control: real Chrome (with `<dialog>`) identical on both builds (the menu opens) | the class follows the width (900 px on, 1100 px off, back on); 1024x768 desktop: no class, the drawer as on Old; an old Safari at 1024 px and up keeps today's covering drawer (desktop lock) |
| M-TOUCH-2 (minor) | `forms.mjs` date branch: no `inputmode` | built pages with an `inputmode`: 1 → 0; `r04` (dob) at 390x844@3 and 360x800@3: `inputMode` "numeric" → "", 16 px, a label tap focuses it, "01/01/1990" kept; type, `autocomplete="bday"`, placeholder and hint unchanged. The keypad itself is not drawn by headless Chrome (unverified on WebKit) | none at any width (inputmode picks an on-screen keyboard only: a touch laptop's opens on its text layout) |
| MT-R1 (minor) | site.js open(), below 1024 px: `--menu-top` = the menu button's top less the close button's offset in the head; CSS below 1024 px `.drawer__panel { padding-top: max(16px, var(--menu-top, 16px)) }` | `r08-menu-retap.mjs` (verbatim), 390 / 360 / 320 / 412 / 430 / 375 on `/` and `/eye-care-services/`, top and scrolled, second tap after 700 and 250 ms: navigated away 24 of 48 (every run at the top; 'Hours & Location' under the menu spot) → 0 of 48, the close button's top equal to the menu button's at the top (0.0 px) and 3 px below it scrolled (as before); 844x390, 667x375, 768x1024 at the top 6 of 6 → 0 of 6 | `p/fb-drawer.mjs`: at 320x568 the panel scrolls 36 px (its last action 7.5 px below the fold until a drag, which brings it on screen), 48 / 57 px more at 844x390 / 667x375, nothing more at 360-768 portrait; 1024x768 and 1100x800 with a mouse: padding 16 px, no `--menu-top`, as on Old |
| MT-R2 (minor) | site.js: `pagehide` closes an open drawer without animation below 1024 px | `r07-bfcache-drawer.mjs` (verbatim), 390x844@3 and 360x800@3: runs restored from the bfcache after a drawer link or action: open, `html` overflow hidden, `aria-expanded="true"` 3 of 3 → 0 of 3 (closed, unlocked, `"false"`, focus on the menu button); the page-link control closed on both; the first navigation of a new browser is a fresh load on both builds (not cached, as in the refuter's run) | `p/r07v-bfcache-drawer.mjs` (r07 with the views from the command line) at 700x1000@2, 768x1024@2, 820x1180@2: open after Back 5 of 5 → 0 of 5; 1024-1199 px unchanged (the check is gated) |
| M-TOUCH-4 (nit; refuter: partly) | the hover half of `btn--primary / --secondary / --ghost / --light`, the sheen, `roundbtn--navy / --teal / --ghost`, `.dnav__toggle`, the carousel dot and the FAQ question under `@media (hover: hover), (min-width: 1024px)`, the `:focus-visible` half unchanged (the variants share one block each, as exclusive classes); the card reset (the orchestrator kept it) under `(hover: none) and (max-width: 1023px)` for a card with `:hover` or `:focus-within` and no `:focus-visible` inside | `r02-hover-census.mjs`: hover looks applying on phones 48 → 37 (+6 rest-value resets, read as unguarded), guarded 7 → 18 (control: planted rules classified). `r03-hover-live.mjs` (real taps, 390x844@3): the tapped current dot navy `rgb(30, 44, 112)` → teal `rgb(3, 117, 109)`; hero toggle tint → white; drawer submenu toggle tint → transparent; FAQ question navy-900 → navy-700; Submit teal-800 with a 4 px ring → its rest look; card after tap, navigate, Back (bfcache): lifted −7 px with glare .35 → 0 / 0. The menu and close buttons: not reproduced on either build (as the refuter found) | `p/fb-hover.mjs`, a real mouse hover: 10 controls at 1280x800, the drawer's four and the menu button at 1024x768, three at 800x600 (a mouse-driven 769-1023 px window): 54 readings (rest, hovered, after) equal on both builds but one rest reading, which also differs Old against Old (a reveal in flight); control: a planted hover change is caught in 8 readings. Keyboard focus (Tab) on the phone still shows the Submit's focus look |
| MT-R3 (nit) | `.review { scroll-snap-stop: always }` below 1024 px | **Partly.** `p/fb-fling.mjs` (real touch swipes from slide 1, 16 per speed and width over two runs): swipes whose finger stays under one slide (track 304 px at 390, 274 at 360) skipped 39 of 96 → 18 of 96; at speeds a hand reaches (220 px in 50 ms, 260 px in 24 ms) 33 of 64 → 4 of 64; at 2-4 times Android's maximum fling speed (280 px in 12 ms, 300 px in 8 ms, 390 px) 6 of 32 → 14 of 32. The refuter's `r09` (verbatim) did not reproduce on Old this time (0 of its 18 plain swipes) and read 1 of 36 on the build. Chrome's touch emulation does not hold every very fast fling; unverified on real devices and WebKit | the dots still land on the slide they name (dot 4 → 3.0, dot 1 → 0.0 on both) |
| M-SPEED-1 (option, adopted) | `capSizes()`: before each capped slot's `sizes`, one twin per resolution step (2.2 / 2.52 / 2.88 / 3.29 / 3.76 dppx, length x .8727 / .7619 / .6667 / .5836 / .5106) for each entry that can apply at 768 px or less, each starting `(max-width:768px) and (min-resolution:…)`; the same in head()'s LCP `imagesizes`; excluded: natural-width slots, the fig-grid brand chips (`width: auto` on phones), `fig--brand` art (the Envision promo's two files, the brand banners), the Alumier logo, band backgrounds, one-file srcsets | `p/fb-sizes.mjs` (the browser evaluates each `sizes`, whole and without its twins; 21 pages x 21 views, 54 capped images, 101 excluded): density asked for, DPR x S / S0: 2.2: 1.907-1.923; 2.25: 1.950-1.967; 2.5: 2.167-2.185; 2.625: 1.987-2.005; 2.75: 2.082-2.100; 3: 1.989-2.005; 3.29: 1.908-1.927; 3.5: 2.030-2.050; 3.76: 1.905-1.924; 4: 2.027-2.047 (320 / 360 / 430 / 600 / 768 px at DPR 3 and 412@2.625: 1.987-2.006; the floor 1.92 by design, the rest is the integer rounding of the evaluated width); unchanged at DPR 2.19 and below and at every view from 769 px; excluded images unchanged everywhere. Old: 3.0 at DPR 3 | see the weight tables below; picks at 769 px and up: `p/fb-picks.mjs`, every image of the 149 pages at 1440x900, 1280x585@1.5, 1024x768 and 820x1180@2: 0 of 845 changed (control: the same probe at 390x844@3 reads 189 changed); no double fetch (below); `p/phone-lock.mjs` (below) |
| M-SPEED-5 (nit) | phone entries derived from the CSS boxes: home service cards `min(calc(100vw - 78px), calc(92vw - 46px))` x k (≤ 768 px); trio `min(220px, calc(62vw - 19.84px))` (≤ 768 px; 769-1023 keeps `min(220px, 62vw)`); team grid `calc(46vw - 56px)` x k at 600-768 px (769-1023 keeps `calc(50vw - 40px)`) | `fb-sizes.mjs`, Old S / build S0 against the painted width: cards 368 / 356 for 357.1 px at 375x667@2 (1080 → 720 w, 38,940 B) and 412 / 399 for 399.2 at 412x915@2.625 (1280 → 1080 w, 38,570 B); trio 198 / 178 for 178.5 at 320x568@2 (427 → 360 w, 13,020 B); `/the-staff/` portraits 293 / 250 for 250.8 at 667x375@2 (640 → 540 w, 39,336 B); every corrected slot within 0.3 % of its painted width at 320-768 px (cards 0.996-1.000, trio 0.997-1.000, team 0.997-1.000 at 600-768) | 769 px and up unchanged (picks identical at 820x1180@2, 1024, 1280x585@1.5, 1440) |
| M-SPEED-6 (nit) | **not fixed**, as the auditor and the refuter both advise: `loading` is one attribute for every viewport, so making the first-4 eager images lazy on phones would change desktop loading (the PERF-5 regression); there is no phone-only markup lever | 18 pages still load 805,336 B of eager images below the first phone screen at 390x844@3 (420,506 B beyond 1,250 px; the speed lane's numbers, unchanged by this stage) | none |

**The resolution steps.** The first steps (2.2 / 2.5 / 2.85 / 3.25 / 3.7 dppx, 1.92 / T) asked 2.021x at DPR 3, so a 358 px
slot (`calc(100vw - 32px)` at 390) asked for 723.5 px and kept its 800 / 1080 w file instead of 720 w (the home's Alumier
photo and handshake photo among them). The steps were retuned so DPR 3 and 2.625 ask exactly 2x while every DPR from 2.2 to
4.3 stays inside 1.92-2.2x; every probe that reads images was run again on the retuned build (sizes, weights, phone lock,
desktop lock, picks). The auditor's two steps would have given 1.75x at DPR 2.3 (the refuter); these give 1.92-2.2x.

**Layout on phones** (`p/phone-lock.mjs`: the desktop-lock RECORD walk, verbatim, on the 9 phone views x 20 family pages,
reduced motion, every image loaded; fixer A's tree against the build; same-build control 0, a planted 1 px margin caught on
619 boxes): **0 image width changes** (a capped slot drawn at its natural width would move: none is); the image heights of two
figures change by at most 0.47 px at the DPR-3 and 2.625 views (`/eyeglasses/designer-frames/`'s portrait,
`/hours-location/`'s wide figure: the newly picked file's own rounded height, which `height: auto` follows), moving what
follows them by at most 0.47 px; no element count changes. Style digests differ only on the review slides
(`scroll-snap-stop`) and on the elements whose used size follows those two figures (their ancestors, the river's SVG and
anchors).

**Weight** (`p/weight-fb.mjs`, the speed lane's crawl: wire bytes after a full scroll, uncompressed as the local server
sends them, and a gzip -6 estimate for text; third parties excluded; Old against the build). Image bytes saved per family
page:

| page | 390x844@3 | 360x800@3 | 412x915@2.625 |
|---|---|---|---|
| `/` | 136,030 | 145,795 | 59,464 |
| `eye-care-services/` | 54,637 | 64,012 | 49,229 |
| `eye-care-services/eye-exams/` | 28,312 | 24,840 | 1,524 |
| `eye-care-services/dry-eye-disease-and-treatment/` | 18,896 | 15,424 | 1,524 |
| `eyeglasses/designer-frames/` | 13,840 | 13,840 | 13,840 |
| `contact-lenses/` | 26,480 | 38,904 | 26,480 |
| `contact-lenses/our-featured-brands/coopervision/` | 3,118 | 2,784 | 0 |
| `our-eye-doctors/` | 34,562 | 46,540 | 26,172 |
| `team/dr-kristin-nelson-od/`, `team/heather/` | 0 | 0 | 0 |
| `insurance/` | 21,474 | 30,294 | 21,474 |
| `hours-location/` | 76,288 | 76,288 | 0 |
| `contact-us/appointment-request-form/` | 33,240 | 44,554 | 33,240 |
| `contact-us/testimonials/` | 33,240 | 44,554 | 33,240 |
| `whats-new/` | 13,900 | 13,900 | 0 |
| `top-causes-of-dry-eye-in-fort-myers/` | 13,900 | 13,900 | 0 |
| `eye-care-services/faq/` | 4,996 | 1,524 | 1,524 |
| `cherry-payment-plan/` | 4,913 | 4,913 | 4,913 |
| `sitemap/`, `404.html` | 4,015 each | 4,015 each | 4,015 each |
| **20 pages** | **525,856** | **590,096** | **280,654** |

- **The phone home** against the 900,000 B line (DESIGN-SPEC 7 states it at 1440; no phone home budget is stated):
  390x844@3 1,180,844 → 1,059,983 B uncompressed, **907,884 B** with text gzipped (1,042,341 before; 7,884 B over);
  360x800@3 1,137,755 → 1,007,129, **855,030** gzipped (under); 412x915@2.625 1,176,325 → 1,132,030, **979,931** gzipped.
  What keeps 390x844@3 over: the 271 kB hero loop (M-SPEED-2, not this stage's item), the excluded Envision promo (6,458 B
  at 2x) and header logo (1,015 B), and the stage's text growth (about +1.6 kB gzipped). The auditor's 898,828 B
  projection assumed every image capped and no text growth.
- **All 149 pages at 390x844@3:** image bytes −1,829,967 B; interiors over 320,000 B uncompressed **14 → 11**, with text
  gzipped **5 → 3** (left: `contact-lenses/` 332,023, CooperVision 377,545, designer-frames 344,816).
- **No double fetch:** on the 20 family pages at all three views, 0 image URLs requested twice, 0 images with two of their
  srcset candidates fetched, 0 image requests outside the DOM's picks, on both builds (the preload and the img pick the same
  file). Control (`p/fb-dblfetch-ctl.mjs`): the home served with its preload's `imagesizes` rewritten to `100vw` fetches two
  glasses files and is flagged; unplanted, one. Over all 149 pages only the four `/template/*header*` pages fetch the logo
  in two sizes, on both builds (the header logo and a content copy; pre-existing).
- **Desktop bytes (a side effect; boxes, styles and picks are locked, bytes are not):** the `sizes` twins are in the HTML
  at every width (0.8-9.4 kB a page uncompressed, a few hundred bytes gzipped), and the stylesheet (+2,613 B, +302 gzipped)
  and script (+901, +214) grow. `p/fb-deskweight.mjs` at 1440x900, all 149 pages: the home 899,198 → **914,367 B**
  uncompressed (over the 900,000 B line; fixer A's +2,226 B stylesheet alone made 901,424), **762,268** with text gzipped
  (760,695 before); interiors over 320,000 B uncompressed **14 → 18** (newly over: `autoimmune-disease-and-dry-eye-2023/`
  321,744, `eye-exam-faqs-what-to-expect-at-riverside-family-eye-care/` 322,172, `eyeglasses/sunglasses/` 323,780,
  `glaucoma-awareness-starts-with-an-eye-exam/` 321,370), with text gzipped **4 → 4**. Image bytes at 1440 are equal on
  147 pages; two differ by one 1,823 B favicon request in opposite directions (headless timing). For the operator: read the
  budgets gzipped (DEPLOY.md requires a compressing host and states DESIGN-SPEC 7's budgets as transfer sizes that
  assume it), or revert the cap (`capSizes()` returns its input), which removes
  the HTML part.

**REG-B1** was not re-run: no `.btn` sizing or padding changed (the split moves only the hover half of fills, shadows and
the sheen), so 14.2 and 15.1's numbers stand.

**Gates and reproducibility (the final tree, logs in `tmp/mobile/fix-b/logs/`).**

| check | result |
|---|---|
| build | `node src/build.mjs --dump-models`: exit 0, 0 failures, 790 files, theme `riverlight.641c4b09.css`, `site.850aac8c.js` |
| 12 gates | `node tools/run-gates.mjs`: **12 of 12 PASS**, every control fired; copy numbers unchanged: sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; words 102,222 visible / 0 added, glyphs 0 added |
| fabrication | `sr-fabrication.mjs --project . --strict`: **SOURCED**, 0 / 0 of 698 claims |
| reproducible | `RFEC_DIST=tmp/mobile/fix-b/final-a` and `final-b`, `node tools/hashdir.mjs dist …/final-a …/final-b --control`: **IDENTICAL**, aggregate `e3b4678d454c248210b36f482a23c790361d69b42a5597314b7ebdbedef014db`, the control fired |
| budgets | `node tmp/wf6/fix2/budgets.mjs dist`: CSS 101,602 bytes, **20,372** gzipped (budget 22,528); JS 28,067, **9,729** gzipped (budget 10,240) |
| CSP | `tools/csp-hosts.mjs --dir dist` (control fired) against the DEPLOY.md block (`tmp/wf6/reg/close/csp-eq2.mjs`): EQUAL |
| JS and requests | `tools/render-check.mjs` on the 20 family pages at 390 and 1280: 0 errors, 0 failed requests, no overflow (control fired) |
| desktop lock | `tmp/mobile/p/desktop-lock.mjs`, Old against the build, 4 conditions x 20 pages, 9,893 elements each: **0** boxes, style digests, pseudo digests, image picks, element-count and scroll-size mismatches (run on the first and on the retuned build). Controls: Old against Old 0; a 1 px margin planted at 1024 px and up: 5,094 boxes and 311 style digests at each 1024 condition; a `sizes` planted at 1440: 1 image pick |

**Incidents.** Three foreground calls ran past the tool's 10-minute limit and continued in the background (a 10-repeat fling
run, a sizes chunk, a 1440 crawl); each was ended by its own `timeout` and waited for before the next browser run, and no
headless Chrome was left (checked by command line). Git Bash rewrote a leading-slash page argument once (re-run with
`MSYS_NO_PATHCONV=1`). The first sizes chunk waited on the drawer's lazy logo inside the closed dialog on every page (fixed:
it waits only for rendered images).

**Left open (for the operator and the next fixers).**
- MT-R3 is partly fixed (above).
- The phone home at 390x844@3 is 7,884 B over 900,000 B gzipped; the desktop home at 1440 (914,367 B) and four more
  interiors at 1440 cross their uncompressed lines (above). Operator decision: the gzip reading, or revert M-SPEED-1.
- `sizes` still above the painted width on phones, outside the three slots of M-SPEED-5: the home's lens (`gen-h2`, 628 px
  stated for 575.7 painted at 390: 9 %; 2.38x of its painted width at DPR 2.5) and `/eyeglasses/designer-frames/`'s Guess
  banner at 320x568@2 (the refuter: 288 for 260); `/hours-location/`'s arch shares its figure's `sizes` by design (PERF-10).
  At 769-1023 px the trio's and the team grid's kept entries overstate (163-217 px and 14 % more painted): kept, outside the
  phone range.
- M-TOUCH-1 at 1024 px and up: an old Safari keeps the covering drawer (desktop lock).
- The trio and the promo keep their designed `:focus-within` look after Back on a phone (not in the finding).
- Unverified on WebKit: the no-`<dialog>` browser (simulated), `scroll-snap-stop` under a real fling, resolution features
  inside `sizes` (a browser that cannot read them ignores the twins: no cap, no harm), `:has()` in the card reset (without
  it: no reset).

### 15.3 Fixer C: the remaining nits and the records (11 items)

Items: M-LAYOUT-7, M-LAYOUT-8, M-LAYOUT-9, M-LAYOUT-10, M-LAYOUT-11, M-LOOK-5, M-LOOK-6, M-LOOK-9, M-LOOK-10, M-LOOK-11 (built,
measured and withdrawn), M-LOOK-12; then the operator's decision list (OPEN-DECISIONS E), 15.0's overview and table of
every item, and the register rows I.137-I.147. Built on fixer B's tree (`e3b4678d…`; before any edit an `RFEC_DIST` build of
the unedited source was IDENTICAL to `dist/`, control fired); none of fixer A's or B's rules is touched. Scratch, probes,
results, logs and shots: `tmp/mobile/fix-c/` (`p/` the probes, `results/` their output, `results/dl/` the desktop lock,
`final/` the closing logs, `shots/` the crops, `base/` the pre-edit copies of every file changed or considered, with
`SHA256SUMS.txt`; `dev/` the measured build, byte-identical to the final `dist/`). Servers: `tools/serve.mjs` on 8925 (the
build) and 8926 (Old), started with the 2-hour background limit and restarted by PID at 15:37, before it; from 15:40 to
15:47 port 8926 served fixer B's tree for the phone attribution (as fixer B served fixer A's), then Old again; all stopped
by PID at the end. Browser work: one headless Chrome at a time (`tools/cdp.mjs`, `tools/cdp-realsb.mjs` through
desktop-lock), foreground; phone emulation from the stage recipe (`p/lib.mjs`, fixer A's lib with this fixer's ports: mobile
metrics with DPR and orientation, touch, hover none / pointer coarse, an Android UA, `innerWidth` asserted after every load,
every load asserted to be a site page); reduced motion for geometry, motion on for the Tab walk. Every measure ran the same
code on Old and on the build, with a planted positive control that puts the defect back on the page measured (the fix
reverted in the page, or the defect planted) and fired on both builds. Reused verbatim, and named where used: the look
refuter's in-page kit (`p/inpage-rl.js`), the layout refuter's Tab walk (`p/tab.mjs`: its key press, reading and control),
fixer A's overflow sweep and fixer B's phone lock.

**Files changed.** `src/styles/riverlight.css` only: 11 rules in 10 media blocks, each with its comment, every query
`max-width` 1023 px or narrower (one is a line added to the existing `max-width: 768px` footer block). `src/lib/templates.mjs`
was changed for M-LOOK-11 and restored (identical to its pre-edit copy, `cmp`). Docs: this section and 15.0;
`docs/COMPONENTS.md` (1.1, B.10, B.19, B.21, B.22, B.26, B.31, D.4, D.6, D.7, F.5, register rows I.137-I.147);
`docs/OPEN-DECISIONS.md` (section E); `docs/DEPLOY.md` (the stylesheet's size). Built output against fixer B's tree: the
stylesheet only (`riverlight.641c4b09.css` → `riverlight.a5503aa5.css`, 101,602 → 102,295 bytes, 20,372 → 20,505 gzipped);
the 149 pages differ only by its name (0 other bytes).

| item | change (source: `riverlight.css`) | fail on Old → pass on the build (probe; control) | neighbour widths and side effects |
|---|---|---|---|
| M-LAYOUT-7 (nit) | `@media (max-width: 1023px) { html { scroll-padding-bottom: 12px } }` | `p/tab.mjs` (motion on, 15 real Tab presses per page, 600 ms settle), the 20 family pages: walks with a focus ring cut by the fold 9/20 → 0/20 at 390x844@3 (cuts of 3.5-6.2 px), 6/20 → 0/20 at 360x800@3 (3.9-6.3 px); 0 focused elements under the stuck navbar on both builds; the 15.8 px reading on `/hours-location/` at 360 is focus inside the cross-origin map iframe, on both builds (the refuter's artifact, excluded). Control: a fixed link 2 px above the fold, focused with `preventScroll`, reads a 4 px cut (both builds) | the 8 affected pages: 768x1024 2/8 → 0/8, 844x390 4/8 → 1/8, 600x900 3/8 → 0/8, 1000x800 5/8 → 0/8. The one left at 844x390 is the appointment form's 160 px textarea, which Chrome does not scroll at all on focus because it is already partly in view (52.3 → 46.3 px; the same on Old): scroll padding cannot reach it. Scroll padding moves no box (phone attribution: `html`'s style digest only) |
| M-LAYOUT-8 (nit) | `@media (max-width: 1023px) { .prose > .docs:not(:first-child) { margin-top: 1em } }` | `p/items.mjs` docs: box gap 0 → 17-17.1 px at 320-430, 17.7 (667x375), 18.1 (844x390), 17.9 (768x1024); text gap 6.5-7 → 23.8-24.9 px. Control: `.prose > .docs { margin-top: 0 }` planted reads 0 | 600x900 0 → 17.5, 1000x800 0 → 18.5; the only `.docs` list on the site |
| M-LAYOUT-9 (nit; refuter: partly) | `@media (max-width: 1023px) { .prose > h3:not([class]) + :is(h4, h5, h6):not([class]) { margin-top: 1em } }`: the stacked-heading rule's 1em, extended below 1024 px | h3 to h4 box gap 9.0-9.8 → 18.1-19.7 px at the 9 phone views (text gap 6.4-8.2 → 15.4-18); a paragraph pair is 17-18 px. Control: `.prose > h3 + h4 { margin-top: .5em }` planted reads 9 | 600x900 9.4 → 18.9, 1000x800 10.1 → 20.2; `p/census-h3h4.mjs`: the only classless h3 + h4/h5/h6 pair of the 149 pages. 1024 px and up keep 0.5em, so phone and desktop rhythm differ for this pair (the refuter's note) |
| M-LAYOUT-10 (nit) | `@media (max-width: 359px) { #page-title.h1--xlong { font-size: 1.5rem } }` | at 320x568@2 the two longest titles 6 → 5 lines, their first block 717 → 666 px; the other three xlong titles (`/insurance/`, `/scleral-contact-lenses-…/`, `/top-causes-of-dry-eye-in-fort-myers/`; the template's xlong threshold is 75 code points) 5 → 4 lines (first block 688 → 641, 647 → 600 px). Control: 1.75rem planted reads 6 | 360, 375, 390: lines, text and first-block positions identical on both builds |
| M-LAYOUT-11 (nit) | `@media (max-width: 768px) { .band__inner > .doctor { padding-block: 24px } }` | `/our-eye-doctors/`, one doctor's text pane to the next portrait's painted top: box 152 → 72 px, from the last text line 191.2-191.3 → 111.2-111.3 px at 320-430 and 768x1024 (667x375: 176 → 96 and 214.6 → 134.6); after the third doctor to the next band 256 → 216 px; each doctor photo still clears the pane above by 46 px with its 26 px parallax budget (70 at 667x375). Control: 64 px planted reads 152 | 600x900 152 → 72; 844x390 and 1000x800 unchanged (two-column blocks); the home's doctor sections keep 64 px (80 at 1000). Not widened: at 769-1023 px the blocks sit side by side in the desktop layout (box 204.6 / 211.2 px at 844x390, 202-219 at 900-1023); a 1023 px candidate measured 79-124 px with the photos clearing by 53-98 px, left to the operator |
| M-LOOK-5 (minor; refuter: nit) | `@media (max-width: 767px) { .treatments { padding: 6px } .treatment { padding: 18px 16px } }` | treatment paragraphs on dry-eye / top-causes, width, median characters a line, paragraphs of 2+ lines under 30: 360 252 → 280 px, 28 / 30 → 33 / 33.3, 7/9 → 1/9 and 4/10 → 1/10; 375 267 → 295, 3/9 → 1/9; 390 282 → 310, 33 → 37; 320 212 → 240, 24 → 27, 9/9 → 7/9 and 10/10 → 8/10. **Partly:** at 320 the 240 px column at the prose size holds 27 characters; 30 would need a smaller type or no ground panel, which the item keeps. The ground panel and the 3 px teal border stay. Control: the old paddings planted read 212 px | 600x900 476 → 504 px, 667x375 535 → 566; 768 and 844x390 unchanged |
| M-LOOK-6 (minor; refuter: nit) | `@media (max-width: 1023px) { .faq__item > summary { text-wrap: balance } }` | questions whose last line is one word, `/eye-care-services/faq/` (29): 12 → 1 (320), 13 → 0 (360), 11 → 0 (375), 9 → 0 (390), 7 → 0 (412), 5 → 0 (430), 5 → 0 (667x375), 1 → 0 (844x390), 4 → 0 (768); dry-eye 2-3 → 0 of 3, cataract co-management 1 → 0 of 3. The one left at 320, 'Do you offer blue light lenses or prescription sunglasses?', ends on an 11-character word that balancing cannot pull up (the auditor's own fix check also left 1). Line counts and question heights unchanged. Control: `text-wrap: wrap` planted reads 12 | 600x900 8 → 0, 1000x800 1 → 0 |
| M-LOOK-9 (nit) | `@media (max-width: 1023px) { .sitemap__link { padding-block: 8px } }`, widened from the finding's 767 px | gap between consecutive link texts in a column where one of them wraps, min / median: 3.9 / 11.5 → 16.9 / 19.5 (360), 3.9 / 14.4 → 16.9 / 19.5 (390), 3.9 → 16.9 (320, 375), 11.5 → 19.5 (412, 430), 3.8 → 16.8 (667x375); one-line rows unchanged (gap 20-22 px, 44 px tall); page +130 px at 360. Control: `padding-block: 0` planted reads 3.9 | the two-column list (600-1023 px) crowds the same way where the finding stopped: 768x1024 3.2 → 16.2, 844x390 3.4 → 16.4, 600 3.6 → 16.6, 700 3.9 → 16.9, 900 3.6 → 16.6, 1000 4.0 → 17.0; hence 1023 px. The probe takes gaps within a column (a top-level item never breaks across columns); the refuter's single sort read negative gaps in two columns |
| M-LOOK-10 (nit) | in the existing `@media (max-width: 768px)` footer block: `.legal ul { justify-content: center }` | at 320x568 the wrapped legal rows' centres -28.2 / -102.6 → 0 / 0 px from the centred '© 2026' (`/` and `/sitemap/`; the footer is the same on every page). Control: `flex-start` planted reads -28.2 / -102.6 | 360-768: one row, positions identical on both builds (0, or 34.5-35.2 px where the © line shares the row) |
| M-LOOK-11 (nit) | **none: withdrawn** (below) | | |
| M-LOOK-12 (nit; refuter: partly) | `@media (max-width: 1023px) { .video__frame > video::-webkit-media-controls { background-color: transparent } }` | `p/video-check.mjs`, the 3 videos: the frame's painted colour (top 55 %, inset 12 %, read with ffmpeg) grey 49-51 → navy (18, 28-30, 65-68) at 320, 360, 390, 667x375, 844x390, 768x1024 and 1000x800; a real touch tap on the native play button plays on both builds; with the bar shown over a playing picture the panel keeps its scrim (`linear-gradient`) and the bar strip reads as on Old (42 / 41, 23 / 22, 40 / 39, 34 / 35, 84 / 84, 101 / 101, 132 / 132; at 844x390 170 / 160 and 100 / 90, a different frame at 1.5 s). Controls: the navy legal bar reads (25, 31, 68), a planted #333 box (51, 51, 51) | 1024x768 and 1440x900: 51 → 51 on both builds (the rule cannot match there; the probe paints them too) |

**M-LOOK-11: why the no-break is not shipped.** The task allowed it if it passed the 12 gates and caused no overflow at
320. It was built as a D.7 transform: in every h1-h6 of a page's `<main>`, 'Fort Myers' and 'Co-Management', with any
punctuation attached (a span never ends before a comma: seo-parity reads tags as spaces), wrapped in `span.nb`, read only by
`@media (max-width: 1023px) { .nb { white-space: nowrap } }`: 66 spans in 63 headings on 36 pages. It passed the 12 gates
with the copy numbers unchanged; split names went 12 / 9 / 5 / 4 → 0 at 320 / 360 / 390 / 430 and 1-7 → 0 at 375, 412,
667x375, 844x390, 768, 600 and 1000 (`items.mjs` heads; control: a planted 90 px heading without the span reads split, a 60
px one with a nowrap span reads overflow), with 0 heading text past its box and 0 page overflow. Two defects stopped it:
- inside the home's two inline-flex heading links (`.section-title a`, `.trio__title a`) the span became a flex item and the
  spaces at the edges of the neighbouring text runs were dropped: 'LatestFort MyersEye Care News & Tips' and 'Fort MyersEye
  Exams' at every width (`p/glue-shot.mjs`: the word space before 'Fort' and after 'Myers' 0 px against 6.4-11.6 px on Old,
  at 390 and 1440; `shots/sheet-glue-1440-news.png`). The copy gates read DOM text, which is unchanged, so they pass;
- elsewhere the span is still not inert at 1024 px and up: splitting a heading's text into separate inline items moves its
  line extents and inline link boxes by 0.01-0.03 px on 9 of the 20 family pages (the desktop-lock probe with
  `--transparent span.nb --lines h1,…,h6`; Old against Old 0), and the lock forbids any box change.

The transform and its rule were removed (`templates.mjs` identical to its pre-edit copy). What remains possible: skipping
inline-flex parents (cures the first defect, not the second); a script that wraps the names only below 1024 px behind
`matchMedia` (desktop identical, but the headings reflow after first paint, a layout shift in the first screen, and nothing
changes without JavaScript); or non-breaking characters in the text (U+00A0, U+2011), a copy change for the operator. The
lone fragments the finding also lists ('riversidefamilyeyecar / e' on the author archive, an h1 one word a line at 360) are
an unbreakable token wider than the column and natural short titles: not a no-break case.

**M-LOOK-12: which variant.** `p/video-ua.mjs` walked the video's native control tree (CDP DOM with `pierce`): the grey is the
`-webkit-media-controls` container in its `use-default-poster` state (rgb 51, 51, 51), and the control bar's scrim is a
gradient on the separate `-webkit-media-controls-panel`. Measured on Old by injection (`video-check.mjs --variant`): the
auditor's rule on `video` paints nothing (51, 51, 51); the refuter's variant (1) (container, enclosure and panel
transparent) shows the navy but drops the scrim, so over a white frame the bar strip read 240 against 41 with the scrim
(white icons on white); its variant (2) (a transparent poster attribute) shows the navy and keeps the scrim but is markup
at every width (the desktop lock). The shipped rule is variant (1) narrowed to the container: navy, scrim kept, tap to play
as before (`shots/sheet-video-variants-390.png`). Chromium only: WebKit draws its own controls (unverified).

**Phone attribution** (`p/phone-lock.mjs`, fixer B's probe verbatim; `p/phone-attrib.mjs`): fixer B's tree against the
build, the 20 family pages at the 9 phone views (reduced motion, every image loaded). 128 of the 180 page-views differ only
in `html` (M-LAYOUT-7's scroll padding: a style digest, no box) and the footer's legal list (M-LOOK-10: its style; at 320 the
wrapped rows move). The other 52 differ first at exactly the component of an item on that page, everything above it
identical: the h4 on eye-exams (+9.1-9.8 px), `div.treatment` on dry-eye and top-causes (at 768 and 844x390 only the FAQ
question's style), the FAQ question's style on faq (boxes only at 320), the doctor grid on `/our-eye-doctors/` (40 px up,
at 768 px and below), the sitemap links, and at 320 the title band of `/insurance/` and top-causes (the xlong title). 0
image picks and 0 element counts changed. The river, redrawn when a page's height changes, and its anchors are counted but
not named as the origin.

**No overflow** (`p/overflow-sweep.mjs`, fixer A's, verbatim): all 149 pages at 320x568, 360x800, 390x844, 844x390, 667x375,
600x900, 768x1024 and 1000x800: 0 pages with page overflow or a box cut by `#page`'s clip (control: a box 80 px wider than
the viewport is reported).

**Desktop lock** (`tmp/mobile/p/desktop-lock.mjs` with `--transparent span.nb --lines h1,h2,h3,h4,h5,h6`; `results/dl/`): Old
against the final tree, 4 conditions x 20 pages x 9,893 elements and 211 heading line sets: **0 differences** (the build
compared with both Old recordings). Controls: Old against Old 0; a 1 px margin planted at 1024 px and up: 4,644 boxes, 304
style digests and 188 line sets at each 1024 condition; a larger `sizes` planted on a content image at 1440: 2 image picks;
the `--lines` reading caught M-LOOK-11's 0.01-0.03 px shifts. One earlier recording of the same tree read 1 style digest on
`/contact-lenses/`' title-band grid at 1440; it did not recur in a re-recording nor in 3 + 3 full property dumps of that
element (`p/dbg-style.mjs`), so it is recorded as a one-off. A first `sizes` control (a smaller `sizes` on the first large
image, the hero or arch picture) changed no pick, because Chrome keeps an already-loaded larger file, and it changed that
container's style; it was replaced by the content-image control above.

**Weight** (`p/weight-shift-c.mjs`: this stage's one changed file, the stylesheet, adds 693 B and 133 B gzipped to every page,
applied to fixer B's own crawl rows of its final tree; computed, not re-crawled): the phone home at 390x844@3 1,059,983 →
1,060,676 B uncompressed, 907,884 → 908,017 B gzipped (8,017 B over 900,000); the 1440 home 914,367 → 915,060 B
uncompressed, 762,268 → 762,401 gzipped; interiors over 320,000 B unchanged, 11 uncompressed and 3 gzipped at 390x844@3, 18
and 4 at 1440. No page crosses a line on this stage's bytes.

**REG-B1** was not re-run: no `.btn` sizing or padding changed, so 14.2 and 15.1's numbers stand.

**Gates and reproducibility (the final tree, logs in `tmp/mobile/fix-c/final/`).**

| check | result |
|---|---|
| build | `node src/build.mjs --dump-models` (`build.log`): exit 0, 0 failures, 148 / 148 pages + `404.html`, 790 files, theme `riverlight.a5503aa5.css`, `site.850aac8c.js` (unchanged) |
| 12 gates | `node tools/run-gates.mjs` (`gates.log`): **12 of 12 PASS**, every control fired; sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; words 102,222 visible / 0 added, glyphs 0 added |
| fabrication | `sr-fabrication.mjs --project . --strict` (`fab.log`): **SOURCED**, 0 / 0 of 698 claims |
| reproducible | `RFEC_DIST=tmp/mobile/fix-c/final-a` and `final-b`, `node tools/hashdir.mjs dist …/final-a …/final-b --control` (`hashdir.log`): **IDENTICAL**, `79ecd3cf0f73271f43dbb69b6da7ed1ee0b95bbf6ac810ece4f8c99480bb6025`, the control fired; `dist` also equals `tmp/mobile/fix-c/dev`, the tree every probe measured |
| budgets | `node tmp/wf6/fix2/budgets.mjs dist` (`budgets.log`): CSS 102,295 bytes, **20,505** gzipped (budget 22,528); JS 28,067, **9,729** gzipped (budget 10,240) |
| CSP | `tools/csp-hosts.mjs --control` fired; `--dir dist` against the DEPLOY.md block (`tmp/wf6/reg/close/csp-eq2.mjs`): EQUAL |
| JS and requests | `tools/render-check.mjs` on the 20 family pages, `/contact-us/patient-forms/` and `/team/jhonae-anglin/` at 1280 and 390 (`render-check.json`): 0 errors, 0 failed requests, no overflow, one h1 each; the control fired |
| desktop lock | 0 differences (above) |
| copies | `tmp/mobile/fixed/` and `tmp/mobile/fix-c/snapshot/` (neither existed before; `rm -rf` then `cp -r dist`): IDENTICAL to `dist`, `79ecd3cf…`, 790 files each (`hashdir-copies.log`) |

**Incidents.** (1) One probe run lost its page list to Git Bash's path conversion and, because the probe caught nothing,
wrote an empty result with exit 0; `items.mjs` now reports the error and exits 2, and every later run set
`MSYS_NO_PATHCONV=1`. (2) A heredoc collapsed the backslashes of a first census script; it was rewritten with the editor.
(3) M-LOOK-11 was in the tree from 14:04 to 15:15; every measurement of the other items taken in that window was re-run on
the final tree: 135 of 137 item rows identical, and the two that differ (`/insurance/`'s title at 375 and 390, which held a
span then) now read as on Old.

**Left open (for the operator and any next stage).**
- M-LOOK-5 at 320 px (27 characters a line) and M-LOOK-6's one question at 320 (above).
- M-LOOK-11 (above): non-breaking characters in the text (a copy change) or a script that wraps the names below 1024 px.
- M-LAYOUT-11 at 769-1023 px: the side-by-side doctor blocks keep 202-219 px between them (a measured candidate above).
- M-LAYOUT-7: the appointment form's 160 px textarea at 844x390 (Chrome does not scroll a field already partly in view).
- M-LOOK-12 on WebKit / iOS Safari and Firefox, whose native controls are not these pseudo-elements: unverified.
- The eight operator options and the adopted M-SPEED-1: OPEN-DECISIONS E.
- Not verified here: real devices, WebKit, browser font sizes above the default for these rules.

### 15.4 Fixer D1: the operator's options 4b, 5b and 6b, and two items left open at 769-1023 px

Items (the operator's choices of 2026-10-05 on OPEN-DECISIONS E, "1a 2a 3a 4b 5b 6b 7b 8b"; 7b and 8b are fixer D2's):
M-LAYOUT-5 (option 4b: the home h1 in the first screen on short phones and in landscape), M-LOOK-13 (option 5b: the river's
strands thinner on phones), M-LOOK-14 (option 6b: the phone arch pulled into the title pane's corner), fixer A's open item
(the river's over copy across the arch faces at 769-1023 px, 15.1) and fixer C's open item (the side-by-side doctor blocks at
769-1023 px, 15.3). Old, for every comparison here, is `tmp/mobile/fixed` (`79ecd3cf…`, the published build of 15.3; never
edited), served on 8942; the build on 8941 (`tmp/mobile/fix-d1/dev`, an `RFEC_DIST` build byte-identical to the final `dist/`).
Before any edit an `RFEC_DIST` build of the unedited source was IDENTICAL to `dist/` (`79ecd3cf…`, control fired). Scratch,
probes, results, logs and shots: `tmp/mobile/fix-d1/` (`p/` the probes, `results/` their output, `results/sweep/` the river
sweeps, `results/dl/` the desktop lock, `cand/` the candidate stylesheets tried by injection, `final/` the closing logs, `shots/`
the crops, `base/` the pre-edit copies of every file changed, with `SHA256SUMS.txt`). Browser work: one headless Chrome at a
time (`tools/cdp.mjs`, `tools/cdp-realsb.mjs` through the desktop lock), phone emulation from the stage recipe (`p/lib.mjs`,
fixer A's lib with this fixer's ports: mobile metrics with DPR and orientation, touch, hover none / pointer coarse, an Android
UA, `innerWidth` asserted after every load, every load asserted to be a site page); reduced motion for geometry, motion on for
the hero toggle. Reused and copied (each named where used, its measure verbatim): fixer A's river probe (`p/river.mjs`, with
`--route` widened to any layout key and any host), plate probe and overflow sweep; fixer C's items probe with the look
refuter's kit (`p/items.mjs`, `p/inpage-rl.js`); the layout lane's in-page kit (`tmp/mobile/layout/inpage.js`, read in place,
for A-14); the stage's desktop-lock probe (copied to `p/desktop-lock.mjs` with three conditions added, below). Every measure
ran the same code on Old and on the build, with a planted positive control that fired on both.

**Files changed.** `src/styles/riverlight.css` (three media blocks, each with its comment, every query `max-width` 1023 px
or narrower: the short-portrait and the landscape hero after the intro card's rules, the phone arch rise after the title
band's rules; and the doctor-block rule's query widened from 768 to 1023 px); `src/theme/site.js` (1.8: layout `m`, the zone
default, the phone strand factor); `src/lib/templates.mjs` (`TITLE_ROUTE`: `m` values on `t1` and `t2`; two comments);
`src/lib/home.mjs` (the hero's `h1` anchor at `p`: 66 % → 58 %). Docs: this section and 15.0; `docs/COMPONENTS.md` (0.1,
1.8, B.4, B.5, B.10, B.16, B.21, register rows I.148-I.153, the open owners of I.120 and I.141); `docs/DEPLOY.md` (the theme
sizes). Built output against Old (`p/html-delta.mjs`, theme names normalised; control: a planted one-character edit is
reported): 151 of 790 files differ: the stylesheet (`riverlight.a5503aa5.css` → `riverlight.9de07569.css`, 102,295 →
103,665 bytes, 20,505 → 20,780 gzipped), the script (`site.850aac8c.js` → `site.5fd59f85.js`, 28,067 → 28,196, 9,729 →
9,764), the 148 title-band pages by the two title anchors' `m` values only (+33 bytes each), the home by its `h1` anchor
only (same length). No other byte.

| item | change (source) | fail on Old → pass on the build (probe; control) | neighbour widths and side effects |
|---|---|---|---|
| M-LAYOUT-5 (option 4b) **partly** | `riverlight.css`: short portrait `(max-width: 768px) and (max-height: 740px)`: hero padding-top 14 px, copy padding 0, statement margin 14 px, grid gap 16 px, `--hero-gap` 28 px, intro card padding-top 20 px, the frame capped by `--frame-h: max(110px, calc(100svh - var(--chrome-h) - 1.96 * var(--display) - 3.1vw - 234px))`, the glasses `min(48%, 250px, calc(var(--frame-h) * .95))` wide and at most 22 px below the frame. Landscape `(max-width: 1023px) and (max-height: 480px) and (orientation: landscape)`: the two-column hero (also at 667x375), gap 48 px, the frame stretched to the copy's height and at most 380 px wide, padding-top 8 px, `--hero-gap` 8 px, statement margin 12 px, intro card padding-top 20 px, the glasses across the frame's left edge (104 px, `left: -34px`, `bottom: 22%`). `home.mjs`: `h1` `p:104%,58%` (I.153) | `p/hero.mjs`, scroll 0, every image loaded: h1 bottom (its wave rule included) against the screen height, Old → build: 375x667 784.2 → **655.5 / 667**, 320x568 730.7 → **557.6 / 568**, 844x390 614.0 → **383.3 / 390**, 667x375 990.9 → **384.5 / 375 (not fitted)**; 390x844 799.5, 360x800 769.4, 412x915 820.9, 430x932 831.1 unchanged (fit); the CTA wholly on screen at all 9 sizes (bottom 291-357 px on the build). Crop of the source photo: Old x 0.06-0.95, y 0.05-0.95 (4:3) → every column, rows 0.11-0.89 (375x667, 343x198.6 px), 0.24-0.76 (320x568, 288x112.9; 844x390, 378x146), 0.16-0.84 (667x375, 294x149). A-14 (the layout lane's kit): 0 hits on the hero's devices at every size, 0 on the home's 17 devices at 320x568, 375x667, 667x375, 844x390, 800x1280, 900x900, 1000x700 and 1023x768. Hero toggle (motion on): present, its 12 px halo inside the frame, 0 text or control hits at 320x568, 375x667, 667x375, 844x390, 390x844. Controls at every size: the h1 pushed 900 px down reads below the fold, a planted box over the h1 is a hit, a planted crop reads x0 = y0 = 0 | portrait neighbours: 360x640 628.5 / 640, 412x732 720.5 / 732, 430x740 728.5 / 740, 360x740 699.1 / 740, 600x700 688.4 / 700, 768x740 692.5 / 740 fit with 0 A-14 hits; 320x480 does not (554.7 / 480, the frame at its 110 px floor). Landscape neighbours: 896x414, 915x412, 932x430, 1000x450, 1023x479 fit (384-398 px); 568x320, 740x360, 812x375 do not (the header). 768x1024 is unchanged (1066.4 / 1024; the rules cannot match). No overflow on 149 pages at 320x568, 375x667, 667x375, 844x390, 568x320, 768x1024, 1000x700 |
| M-LOOK-13 (option 5b) **fixed** | `site.js` 1.8 `draw()`: `'stroke-width': lay === 'p' ? +(w * 0.6).toFixed(2) : w`; the over-copy filter keeps the spec width (`if (over && w > 18) return`) | `p/strands.mjs` (every path's drawn width by strand; control: a planted width is read back): at 320 / 390 / 768 glow 150 → 90, glow2 96 → 57.6, mist 56 → 33.6, mist2 34 → 20.4, body 18 → 10.8, core 8 → 4.8, teal 2.4 → 1.44, navy and light 1.6 → 0.96, the over copy the same five strands at 0.6; crops at 390 (`shots/strands/pair-eye-care-services-{arch,bank,footer}-390.png`, `pair-our-eye-doctors-arch-390.png`): the footer entry's stack about 150 → 90 px, the left-bank stripe and the panel under the arch fainter | 844x390 and 1000x700 (layout `m`): the spec widths on both builds; 1024 px and up: the desktop lock (below). The river checks with it: next row |
| River checks at 320-768 (items 5b and 6b) | | `p/river.mjs --clear` on all 149 pages at 320 / 360 / 390 / 430 / 768, Old and build (fixer A's controls fired at every size: a planted path at 0.30 H, a rectangle clip, a half clip, a planted line on the river): face zone 0 on both; the over copy's painted extent 0.70-0.90 of the arch (Old 0.70-0.92); R3 143 of 143 photo and generated arches on both (the 5 plates behind, as before); seams 0; over copy outside the arch shape 0 (one 13-pixel read on `/eyeglasses/` at 320 in the sweep, 0 in 6 re-runs; Old shows such reads too, 4 pixels on `/contact-lenses/` in 2 of 3 runs); A-13 clearance identical to Old page by page (10 pages / 179 lines at 320, the pre-existing left bank of 15.1; 0 at 360-768). B1 / 3.21 (`p/b1-margin.mjs`): the over copy's highest point lies at least 75.2 px below the pane's bottom edge on every page that has one (it paints only inside the arch shape) | 412x915 and 375x667, 667x375 on the 17 arches: face 0 (at 412x915@2.625 read from geometry and pixels moving 40+, fixer A's method) |
| M-LOOK-14 (option 6b) **partly** | `riverlight.css`, at the band's own phone breakpoint (`max-width: 768px`): `.titleband:has(.titleband__frame) { --tb-pad-bottom: 0px }`; `.titleband__frame { margin-top: calc(-14px - min(34px, min(38%, 150px) * .625 - var(--bank-h) + 8px)) }`; 70 px under a date row, 19 px with a position chip (`:has()` on the grid) | `p/tb.mjs` and `p/tb-compare.mjs` on all 148 title-band pages at 320 / 360 / 390 / 412 / 430 / 768 (control: the arch pulled 200 px up covers pane text and is an A-14 hit, on both builds): the h1's line count and width (box and widest line) identical to Old on every page; pane text under the arch 0; A-14 arch hits 0 (Old 0). The arch rises into the pane by 34 px (30.4 at 320, the bank cap), 30.4-55.8 px on dated posts, 19 px on chip pages; the first content (G5's first block and the first content line alike) starts 48 px earlier (44.4 at 320) on the 120 other pages, 44.4 / 53.9 / 61 / 66 / 69.7 / 62 px on the 21 dated posts at 320 / 360 / 390 / 412 / 430 / 768, 33 px on the 7 chip pages; G5's first block at 390x844 460.2-690.3 → 412.2-629.3 px. **Partly:** the auditor's estimate of 100-150 px is not reached | 769 px and up unchanged (the rules sit in a 768 px block). The river's phone anchors needed no re-tuning: the band still ends at the arch's middle, so `t1` / `t2` 46 px below it meet the same part of the arch (face 0, R3 kept, row above). The 5 plates keep `data-on="d t"`: behind at `p` |
| 769-1023 px river (fixer A's open item) **fixed** | `site.js`: `mqM = (max-width: 1023px)`; `lay` = `m` at 769-1023 px; an anchor reads `m`, else `t`, else `d`; a zone without `data-on` draws at `d t m p`. `templates.mjs`: `t1` `m:104%,100%+90px`, `t2` `m:60%,100%+90px` | `p/river.mjs --clear` on all 149 pages at 800x1280@2, 844x390@3, 1000x700@1, 1023x768@1 (controls fired at each): face-zone geometry samples Old 80.6M / 80.1M / 78.8M / 78.7M and pixels 2.25M / 5.03M / 0.56M / 0.56M → **0 / 0 / 0 / 0**; the over copy painted 0.13-0.63 of the arch on Old → 0.82-0.93 (its lowest quarter); R3 143 / 143 photo arches on both; the 5 plates crossed through their monogram on Old → behind on the build (their printed names reach 0.75 of the arch: Nelson 0.752-0.927, Longa 0.811-0.927, one line 0.871-0.927; `p/plates.mjs`, `results/plates-m.json`); seams 0, outside the shape 0; A-13 identical to Old (one line on the home at 844x390, 38 px from the river, the same on Old) | 1024-1199 px read `t` as before: the desktop lock at 1100x800 and 1199x800 on all 149 pages, 0 differences (below) |
| M-LAYOUT-11 at 769-1023 px (fixer C's open item) **fixed** | `riverlight.css`: `@media (max-width: 1023px) { .band__inner > .doctor { padding-block: 24px } }` (was 768 px) | fixer C's `p/items.mjs` doctor on `/our-eye-doctors/` (controls: 64 px planted at 390 reads 152 on both builds; the base padding re-planted on the build at 844x390, 1000x700 and 1023x768 reads Old's gaps exactly), text pane to the next portrait, box: 844x390 204.6 / 211.2 → 117.5 / 124.2, 800x1280 208.5 / 185.9 → 128.5 / 105.9, 900x900 180.3 / 175.1 → 84.3 / 79.1, 1000x700 and 1000x800 202.1 / 214.7 → 90.1 / 102.7, 1023x768 210.3 / 218.8 → 94.7 / 103.1; the photo clears the pane above by 53.1-102.5 px with its 26 px parallax budget; after the third doctor to the next band 256.9-354 → 216.9-296.2 px; A-14 0 hits at the 769-1023 px sizes | 390x844 and 768x1024 unchanged (72 px, the rule of 15.3); 1024x768 (226.9 / 243.3) and 1440x900 (372.9 / 316.8) unchanged; the home's doctor sections keep their padding at every size (64-115.2 px) |

**M-LAYOUT-5: why 667x375 does not fit, and what the crop costs.** In landscape the header is not sticky (A11Y-8) and is
138.5 px tall at scroll 0 at 667x375, 37 % of the screen. Even with the photo beside the copy, the two-line statement
(41.2 px type in its column), the 56 px CTA, the intro card's 20 px padding and the one-line h1 with its wave rule (60.3 px)
need 374 px of the 375 with no spacing at all; fitting it would mean a smaller display type, a smaller CTA or a smaller
header, none of them in this option. The landscape rules still apply there: the h1 ends at 384.5 px instead of 990.9 (its
text line, 324-358 px, is on screen; its wave rule is cut) and the photo is beside the statement instead of below the fold.
With OPEN-DECISIONS E's M-TOUCH-5 header (option 8b, fixer D2's; its exact CSS injected here as a what-if) the h1 ends at
358.4 / 375, and at 343.0 / 390 at 844x390. The short-portrait frame is height-aware like the short desktop's (2.4, U1): it
keeps its width and takes the height the screen leaves (a `100svh` budget with the statement's and the h1's own type sizes
in it, so wherever the cap applies the h1 ends 10-12 px above the fold: 320x568 to 600x700), never under 110 px; the photo is cropped
wider instead of smaller, and the shop's middle band stays in frame (the windows, the shelves of frames, the fitting desks
and chairs, the frame walls and the counter with the sunflowers, rows 0.22-0.75 of the source); the ceiling with its
chandeliers and the floor go first, and at the widest crops (2.6:1) the exit sign at rows 0.23-0.26 is sliced. In
landscape the glasses take the short desktop's placement across the frame's left edge (B.4, the s rule): the corner
placement would reach the h1 card, which now starts 8 px under the frame. A hero this short also moved the phone weave:
from 66 % of the hero the river's over copy met only the frame's rounded corner at 320x568 (49 changed pixels; 2,530 on
Old), so the `h1` anchor enters at 58 % at `p` (I.153; `p/home-r3.mjs`, control: a planted path): 2,530 → 1,960
(320x568), 4,649 → 4,709 (375x667), 9,114 → 11,075 (360x800), 11,228 → 12,608 (390x844), 9,981 → 10,630 (412x915),
13,633 → 14,160 (430x932), 0 → 86 (667x375), 16,403 → 12,685 (768x1024); the home's A-13 lines are unchanged at 12 sizes
(`results/river-home-final.json`: 41 at 320, the left bank, 1 at 844x390, both on Old too). The landscape frame and the
glasses now render narrower than their `sizes` say (the markup is untouched), so a landscape phone fetches the same files
as before.

**M-LOOK-14: why 33-70 px and not 100-150.** G5 keeps the h1 at the pane's full width and its line breaks, so the arch can
only rise into the room the pane leaves free below its text in the arch's columns: the h1's wave rule row and the pane's
bottom padding, 41.5 px below the last text line on 120 pages (35-36 px with A-14's 6 px; `p/tb.mjs` "free", min 34.9-35.9
at the six widths), plus a date row on posts (72 px free) and less on team pages, whose position chip can reach the arch's
columns at 320-390 px (19.8 px free). The gain is that rise plus the 14 px gap the arch left under the pane. More would
cover the h1's last line on some page (or make it wrap around the arch: more lines, a narrower h1), which G5 rules out; a
per-page rise is not expressible in CSS (the free room depends on where each h1 breaks), and a script that measured it
would move the first screen after it paints. The rise is also capped so the band's bank wave keeps its crest below the
pane (at 320 px the cap is 30.4 px).

**The 769-1023 px river.** The `t` layout (769-1199 px) read the title route's `d` values, which were tuned for the desktop
arch beside the pane; at 769-1023 px the arch sits below the pane (3.21), so the route crossed its upper part. A `t` value
would also have moved 1024-1199 px (locked), so site.js now knows a fourth layout, `m`, read only below 1024 px; routes
without `m` values (every anchor but `t1` and `t2`) behave there as before, and 1024-1199 px still reads `t`. The plates
take the phone fallback there too (their name reaches the arch's lowest quarter).

**The rule set and the desktop lock** (logs in `tmp/mobile/fix-d1/final/`):

| check | result |
|---|---|
| build | `node src/build.mjs --dump-models` (`build.log`): exit 0, 0 failures, 148 / 148 pages + `404.html`, 790 files, theme `riverlight.9de07569.css`, `site.5fd59f85.js` |
| 12 gates | `node tools/run-gates.mjs` (`gates.log`): **12 of 12 PASS**, every control fired; sentence parity 5,617 / 5,426 found / 0 lost; short text 815 / 813 / 0 missing; words 102,222 visible / 0 added, glyphs 0 added |
| fabrication | `sr-fabrication.mjs --project . --strict` (`fab.log`): **SOURCED**, 0 / 0 of 698 claims |
| reproducible | `RFEC_DIST=tmp/mobile/fix-d1/final-a` and `final-b`, `node tools/hashdir.mjs dist …/final-a …/final-b --control` (`hashdir.log`): **IDENTICAL**, `5f2cf83155e0bc5dad4e326eb42ab9a47b720c8dd618699d4337648c1ec77ae0`, the control fired; `dist` also equals `tmp/mobile/fix-d1/dev`, the tree every probe measured |
| budgets | `node tmp/wf6/fix2/budgets.mjs dist` (`budgets.log`): CSS 103,665 bytes, **20,780** gzipped (budget 22,528; Old 102,295 / 20,505); JS 28,196, **9,764** gzipped (budget 10,240; Old 28,067 / 9,729) |
| weight | `p/weight-shift-d1.mjs` (fixer C's method: the measured deltas applied to fixer B's crawl rows; computed, not re-crawled): every page +1,499 B uncompressed and +310 B gzipped of theme files, a title-band page +33 / +14 B of HTML; the phone home at 390x844@3 1,060,676 → 1,062,175 B uncompressed, 908,017 → **908,327** gzipped (8,327 over 900,000, as before over); the 1440 home 915,060 → 916,559 uncompressed, 762,401 → **762,711** gzipped; interiors over 320,000 B at 390x844@3: gzipped **3 → 3**, uncompressed 11 → 12 (`/what-happens-during-a-dry-eye-assessment-…/`, 318,469 → 320,001 B); at 1440: 4 → 4 gzipped, 18 → 18 |
| desktop lock | `p/desktop-lock.mjs` (the stage's probe copied, its walk, record, waits and compare verbatim; three conditions added): **all 149 pages** at 1024x768, 1024x768 with a real scrollbar, 1100x800, 1199x800, 1280x585 DPR 1.5 with a real scrollbar, 1440x900 and 1600x662 DPR 1.2, 65,818 elements each, Old against the build: **0** boxes, 0 style digests, 0 pseudo digests, 0 image picks, 0 element-count and 0 scroll-size mismatches (`final/dl-all-old-new.txt`); the 20 family pages, a second Old recording against the build: 0 (`final/dl-fam-old-new.txt`). Controls: Old against Old (the 20 family pages at all seven conditions) 0; a 1 px margin planted at 1024 px and up: 4,471-4,644 boxes and 274-304 style digests at each of the seven conditions; a larger `sizes` planted on a content image (fixer C's control): 2 image picks at 1440x900, 1 at 1600x662 DPR 1.2 |
| overflow | `p/overflow-sweep.mjs` (fixer A's): 0 of 149 pages with page overflow or a box cut by `#page`'s clip at 320x568, 375x667, 667x375, 844x390, 568x320, 768x1024, 1000x700 (control: a box 80 px wider than the viewport is reported) |
| REG-B1 | not re-run: no `.btn` sizing or padding changed (the hero's copy padding is the column's, not the button's) |

**Incidents.** (1) A strand-width probe ran past the 400 s the call allowed and the tool moved it to the background, where it
hung on a crop below a short page (a clip of negative height); it was stopped by its task, and its node (PID 28572) and its
Chrome (PID 3484) were verified gone before any other browser run; the crop now skips a region that is not on the page, and
every later browser call was capped well under the tool's 10 minutes. (2) A desktop-lock recording of three conditions over
149 pages overran the same limit by about 7 s: the shell's `timeout` ended it (exit 124) after two complete conditions were
saved; the third was recorded again alone; no Chrome of this fixer was left (the only headless Chromes then running were the
two verifiers', each with a live parent). (3) The title-band probe's first control (a planted negative margin alone) did not
move the arch far enough to fire at 320-360 px (the grid's end alignment stops a negative margin once the arch's row
collapses); the control now also plants `align-self: start` and fired on both builds at all six widths. (4) The servers were
restarted by PID at 17:48 and 19:34, before their 2-hour limit, and stopped by PID at the end.

**Left open (for the operator and fixer D2).**
- M-LAYOUT-5 at 667x375: the h1 ends 9.5 px below the fold (its text on screen, the wave rule cut) until the landscape header
  shrinks (option 8b, fixer D2: measured as a what-if, 358.4 / 375). Once 8b lands, the landscape hero's 8 px paddings could
  be relaxed (the what-if leaves 32-47 px under the h1). Very short screens (320x480, 568x320, 740x360, 812x375) still miss.
- M-LOOK-14: 33-70 px gained, not 100-150 (above); team pages keep a 19 px rise at every width (their chip reaches the arch's
  columns only at 320-390 px).
- The 5 plate pages: no in-front crossing at 768 px and below (as in 15.1) nor now at 769-1023 px, until their portraits
  arrive (a photo takes the routes automatically).
- In landscape the hero photo and the glasses render narrower than their `sizes` entries; the files fetched are the same as
  before (a `sizes` entry for the landscape rule would be markup at every width).
- Pre-existing, not changed: the A-13 lines at 320 px (15.1) and the home's one line at 844x390 (38 px).
- Not verified: real devices (where `100svh` and the `max-height` queries follow each browser's toolbar model), WebKit /
  iOS Safari (the arch rules use `:has()`, Safari 15.4 and later; without it the band would keep its 48 px bottom padding
  and, by the grid's arithmetic, the arch would rise about 23 px at 390 on every page: computed, not run; the article's arch
  reserve has used `:has()` since the design build), browser font sizes above the default for these rules.

### 15.5 Fixer D2: options 7b and 8b, and the end of the stage

The operator's options 7b (M-TOUCH-3) and 8b (M-TOUCH-5) were applied by fixer D2 (two blocks in `src/styles/riverlight.css`,
COMPONENTS I.154 and I.155). D2 was cut off by an account usage limit and restarted three times; its first run made the two
edits (2026-10-06 15:36) and then measured them, and the later runs made no source edit. On 2026-10-07 the operator stopped
the stage ("the verification and checking process is taking too long. Leave everything as is and continue"). The run was
stopped (no listener, Chrome or workspace node process left), and the orchestrator built and released the tree as it stood:

| check | result |
|---|---|
| source since D1 | `src/styles/riverlight.css` only: D2's two blocks (read from its transcript). `src/styles/tokens.css` carries an orchestrator restore of 2026-10-06 14:50 whose bytes equal the earlier file (sha256 `1ef4d2e0...`; `sr-tokens` had rewritten it, see the memory note on that trap) |
| build | `node src/build.mjs`: exit 0, 148 / 148 pages + 404, 0 failures, theme `riverlight.da04c250.css` + `site.5fd59f85.js`, aggregate `90c8838f6de645c755c3246fece8338dbc95dccd6b94940b1bca30f0365df737` (790 files) = `tmp/mobile/final` |
| scope | `tmp/orch/css-scope.mjs` against D1's build (`tmp/mobile/fix-d1/snapshot`, desktop lock 0 on all 149 pages): 1 file differs after the theme names are normalised (the stylesheet); 2 blocks added, 0 removed, both inside a query with `(max-width: 1023px)` |
| gates | `node tools/run-gates.mjs`: 12 of 12 PASS; sentence 5,617 / 5,426 found / 0 lost; words 102,222 visible / 0 added |
| fabrication | `sr-fabrication --strict`: SOURCED, 0 / 0 of 698 claims |
| preview | gh-pages `335f540` from `tmp/mobile/final`: 149 pages noindex, 0 root-absolute references, secret scan 0 hits |

**Not run (the operator's stop):** D2's targeted checks of I.154 and I.155 (the 44 px hit boxes and their neighbour
spacing, the landscape navbar against the A11Y-8 header matrix, the menu retap and anchor jumps in landscape); the
independent verification of fixers A-C and of D1-D2 (verify-1 and verify-2 had partial results only, in
`tmp/mobile/verify-1/` and `verify-2/`); a re-measure of option 4b at 667x375 now that 8b is applied (D1's what-if: the h1
ends at 358.4 of 375 px).

## 16. Site restructure to the Eye Trends structure (operator, 2026-10-07)

Instruction and open decisions: `docs/OPEN-DECISIONS.md` section F. The operator asked for no long verification, so this
stage ran the build, a repro build, the link check, a main-text comparison, a residue grep and one headless look. The 12
gates, `sr-gate`, the sweep, screens and pixel diff were not run, and the handoff zip (v20261006) predates this stage.

- **Structure:** `src/lib/restructure.mjs` holds `MOVES` (26 source paths to their Eye Trends paths) and `remap()`, a
  longest-prefix rule that moves every page below a moved page with it. `content.mjs` `localHref` / `ownPathOf`,
  `page-model.mjs` (slug, depth, canonical, JSON-LD trail, current-menu path) and the sitemap apply it; every per-page
  lookup (image plan, families, art, forms) keeps the source path. The build fails if two pages share a path, a moved path
  is still a page, or a live alias is now a page.
- **Menus:** `src/content/chrome.json` `nav`, `footer.columns` and `footer.util` are the Eye Trends menus (change R01); the
  source menus stay in `navSource` / `footerSource`, which the build reads for the Cherry page label and the `/template/*`
  menu detection. `templates.mjs` renders a menu item whose children have children as a mega menu (`.sub--mega`, five
  groups) and the drawer as nested groups (`.dnav__grp`), and titled footer columns (`.footer__menu--cols`).
- **Adopted pages:** `src/content/adopted/*.json` (workflow `wf_9d850499-741`, 11 editors, 2 min; the source pages in
  `tmp/restructure/et-raw`, extracted to `et-extract`). The build turns each into an EyeCarePro-shaped raw page (trail Home
  » Services » h1) and an `interior` model with its section's title arch (TB-ecs, TB-utility for `/terms/`). One editor
  aside left in the copy ("We won't invent a turnaround promise") was rewritten by the orchestrator (recorded in the
  file's `edits`).
- **Redirects:** 93 rules (77 moves + 16 aliases); the preview gets 77 redirect pages from `tmp/restructure/stubs/` (never in
  `dist/`, where a file at the old path would shadow a Netlify rule).
- **Evidence:** build exit 0, 159/159 pages + 404, dead refs 0, failures 0; `dist` = `af7b0069…` (801 files), a second
  build to `tmp/restructure/repro` IDENTICAL; `tools/link-check.mjs` 22,719 local refs, 0 broken, control fired; the
  `<main>` text of all 148 pages of the released build (`tmp/mobile/final`, 90c8838f) equals the text at each page's new
  path (`tmp/restructure/content-kept.mjs`; controls: two different pages differ, one dropped word is caught); no Eye
  Trends, Clear Lake, Hyder, (281) or Texas text in `dist/` except Riverside's own "University of Houston" (Dr. Degler's
  degree); headless Chrome (`tmp/restructure/look.mjs`): the header is one row at 1200 and 1280, the open mega menu sits
  inside the viewport (control: shifted 400 px it fails), no sideways overflow on an adopted page at 390, the drawer shows
  5 groups / 21 links. Preview gh-pages `889a4cd`: 9 sampled URLs live 200 and byte-identical, noindex.
