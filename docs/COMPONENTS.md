# Components: the markup contract (Riverside Family Eye Care, "Riverlight Aurora")

Status: binding markup contract, written 2026-10-01/02 by the contract stage for the three implementers who work in
parallel: **templates** (`src/lib/templates.mjs`, `src/lib/home.mjs`), **styles** (`src/styles/tokens.css`,
`riverlight.css`, `fonts.css`, `motion.css`) and **script** (`src/theme/site.js`). It implements `docs/DESIGN-SPEC.md`
on the page model `rfec/page-model@1` (`docs/BUILD-NOTES.md` section 5).

**Inputs read in full this session:** `docs/DESIGN-SPEC.md`, `docs/DESIGN-BRIEF.md`, `docs/BUILD-NOTES.md`,
`docs/IMAGE-PLAN.md`, `docs/SITE-ARCHITECTURE.md` sections 1-7, `src/content/chrome.json`, `src/content/image-plan.json`,
`src/content/motion-plan.json`, the prototype `tmp/panel/riverlight/{index.html, interior.html, styles.css, script.js,
CONCEPT.md}`, the scaffold `src/lib/templates.mjs` and `home.mjs` (the current, gate-calibrated consumer of the model),
the gates `tools/heading-parity.mjs`, `tools/words-added.mjs`, `tools/keep-image-parity.mjs` (alt fidelity) and the
headers of the other parity gates, and all 149 models in `tmp/page-models/`: first as dumped at 2026-10-01 17:23, then as
re-dumped by the pipeline's final fix-round-2 build at 2026-10-02 00:25 (+08:00), on which `facts.mjs`, `schema.mjs`,
`digest.mjs` and `census.mjs --json` print byte-identical output. `docs/BUILD-NOTES.md` changed after the first read
(its fix-round-2 update, 2026-10-02 00:18); the change was re-read by diff and its section 5.9 recomputed from the models
(`bn59.mjs`, gap I.26). Structure after `cliftoneyecenter-reforge/docs/COMPONENTS.md` (structure only).

**Precedence.** DESIGN-SPEC owns visual values (sizes, colours, offsets, timings) and behaviour; this file owns markup
(elements, classes, attributes, ARIA, hooks, DOM order) and which model field feeds which element. Where this file
departs from DESIGN-SPEC or the prototype it says **Departure** and why; every departure and gap is also in the register
(section I). Where DESIGN-SPEC and a content gate of `node tools/run-gates.mjs` disagree, this file follows the gate
(DESIGN-SPEC A-1 requires every gate to pass) and records the conflict in section I.

**Evidence.** Every count below was computed this session from `tmp/page-models/*.json` by scripts under
`tmp/wf5a/contract/` (read-only): `census.mjs` (the tag+class census of every model HTML string, and the proof that
sections D and E cover it), `facts.mjs` (every other count), `schema.mjs` (every model path and type), `digest.mjs` (a
per-page digest), `proto-inventory.mjs` (every prototype class, id and `data-*`). Nothing in `src/`, `dist/` or `audit/`
was run or written. Counts are of the current models; a later model change makes `census.mjs` fail until this file is
updated (by design).

---

## 0. Conventions

### 0.1 Notation

- `{field}` is a page-model value, named exactly as in BUILD-NOTES 5 and the models (`{chrome.topbar.call.label}`,
  `{sections[i].heading.html}`). Plain fields print HTML-escaped. Fields named `html` (`heading.html`, `title.html`,
  `items[].html`, `members[].html`, `blocks[].html`) print raw: the pipeline already sanitised them to the prose element
  set (section D) or the form markup (section E).
- `{up}` = `'../'.repeat(model.depth)`: the page-relative prefix for theme assets the model does not carry (fonts, the
  hero loop and its posters). Empty at depth 0. The `dist/404.html` model has depth 0 and the build rewrites its URLs
  root-relative under the deploy base (`RFEC_BASE`, default `/`) after rendering (BUILD-NOTES 5.8.9; `rootRelative()` in
  src/build.mjs); templates do nothing special for it.
- `<!-- ? cond -->` after an element: render it only when `cond` holds (or, without a condition, when its field is
  non-null and non-empty). `<!-- … -->` repeats per item.
- **[P1]** marks the `srcset: [{url, w}]` that DESIGN-SPEC 4.3 P1 adds to every image entry. **In the models since wf5b**
  (every image object of all 149 models; BUILD-NOTES 5.1 and 11). Render `srcset="{url} {w}w, …"` in ascending `w` plus
  the slot's `sizes` (`src` stays the model `url`); a one-entry `srcset` (the logos, the GIFs, files of 360 px or less) is printed as given.
- **[P2]** marks theme files (`dist/theme/**`) and `head.stylesheets`/`head.scripts` (`head.scripts` is a model field since wf5b, see
  A.1). **[P3]** the byte-identical logo files. **[P4]** marks `model.art` (on all 149 models since wf5b; BUILD-NOTES 5.10); its shape
  as this contract consumes it is in 0.12. **[P5]**, **[P6]**, **[P7]** are the other DESIGN-SPEC 4.3 additions.
- "Layouts": **d** = 1200 px and up (main nav, `--side-w` 340), **t** = 769-1199 (drawer; two-column grids), **p** =
  768 and below (mobile header, one column), **n** = 420 and below (full-width statement and buttons), **s** = the
  short-desktop mode `(min-width: 1024px) and (max-height: 720px)` (1280x585 is in it), **a** = 1024 px and up (the aside
  column). Responsive notes use the sweep sizes 360 / 390 / 768 / 1024 / 1280x585 / 1440 / 1920. **m** = 769-1023 px, a
  river layout only (1.8; mobile optimisation, I.151): the river's `t` also served the locked 1024-1199 px, so 769-1023 px
  reads its own anchor values.

### 0.2 Class naming

- BEM as in the prototype: `block`, `block__element`, `block--modifier`. **Every prototype class is kept where the spec
  keeps the thing it names** (H.1 lists each with its origin; H.2 lists every prototype name not kept, with the spec
  reason). Spec names win where the spec renamed a thing: `section.ctaband` (prototype `ctarow`), `div.layout`
  (prototype `article-wrap` + `article-grid`), `article.prose-card` (prototype `article.prose`), `dialog.drawer`
  (prototype `div.drawer[role=dialog]`), `ph-portrait` / `ph-brand` (prototype `placeholder`; the names BUILD-NOTES 5.8.5
  and the scaffold already use).
- **Renamed for a collision: `div.aurora-field`.** DESIGN-SPEC 2.8 A1 / 4.2 and the prototype name the fixed aurora layer
  `div.field` with `field__layer--dawn|day|dusk`; the model's form markup uses `div.field` for every form field
  (BUILD-NOTES 5.5; census: 14 elements with the class `field`). One class cannot be both a fixed full-viewport layer and a
  form row, and the model cannot change, so the aurora layer is `div.aurora-field` with
  `aurora-field__layer aurora-field__layer--{dawn|day|dusk}` (gap I.32).
- **Surfaces** carry `surface` plus exactly one recipe modifier (DESIGN-SPEC 2.7):

  | DESIGN-SPEC 2.7 recipe | classes | used on |
  |---|---|---|
  | `glass-card` | `surface surface--glass` | intro card, service cards, title pane, quick-actions card |
  | `glass-card` over a photo (links `--teal-800`) | `surface surface--image` | Alumier panel, review panel |
  | `glass-navy` | `surface surface--navy` | CTA band panel |
  | `paper` | `surface surface--paper` | article card, doctor text, callout cards, cataract text, location card, form card, archive rows |
  | `frost-solid` | `surface surface--frost` | news and blog-index cards, child-page cards, team cards, product, device and testimonial cards |
  | `tint-panel` | `surface surface--tint` | untitled callouts (`div.panel`), checklist panels (`div.checklist`); `blockquote` in prose takes the recipe by element (D.3) |
  | `glass-nav` | the component classes `navbar`, `sub` (no `surface`) | sticky navbar, dropdown panels |
  | `.aurora-deep` (BRAND-SYSTEM 5.3, DESIGN-SPEC A5) | `aurora-deep` | `footer.site-footer`, `section.ctaband` |

- **Model-HTML containers.** Every element that holds model HTML carries `rich` (the base element rules of D for
  classless model elements: links, lists, strong/em, figures). The long-form article flow carries `prose rich`
  (`prose` adds the 3.22 size, measure, rhythm and heading rules). A component's own elements always carry a class, so the
  classless-scoped rules of D never style them (D.1).
- **Heading signature.** `.wave-rule` is a class on a template-rendered heading whose `::after` draws the 74x12 rule
  (DESIGN-SPEC 3.3: "drawn with `::after` on the heading so the model's HTML is not touched"). Modifiers:
  `wave-rule--center`, `wave-rule--navy` (on `--lav-300`), `wave-rule--light` (on navy, teal-200 over navy-100, no
  filter). Classless headings inside `prose`/`rich` get the same drawing from D's element rules, never from a class.
  **Departure** from the prototype, whose rule was a separate empty `span.wave-rule` (gap I.19).
- Template classes on `<body>` (A.2): `page-{family}` (the family key verbatim; the prototype's `page-home` and
  `page-interior` are two of them), one frame class `tpl-home` / `tpl-article` / `tpl-hub`, plus `has-aside` when
  `model.aside` is not null.
- Utilities: `vh` (visually hidden, prototype), `sr` (visually hidden, emitted by the form markup: same rule as `vh`),
  `ico` (inline icon), `container` (max width + gutters), `chip` (G18 pill), the `btn` family (B.0), `rich`/`prose` (D).

### 0.3 State classes and build-time states

| state | on | set by | meaning |
|---|---|---|---|
| `js` | `<html>` | inline head one-liner (A.1); site.js re-asserts it | JavaScript runs: enables the drawer button and the JS layout of the nav |
| `no-modal` | `<html>` | site.js (1.5), only while `(max-width: 1023px)` matches and only where `dialog.showModal` is missing | the browser has no `<dialog>` (Safari before 15.4): below 1024 px the nav shows as the no-JS wrapped list and the menu button is hidden (B.2; mobile optimisation, M-TOUCH-1, I.129). Never set in a browser with `<dialog>` |
| `rv-ready` | `<html>` | site.js (1.3) | the reveal decision was taken; remaining `.rv` elements are hidden until revealed |
| `rv` | block groups | **template** | reveal candidate (6.1); removed by site.js at the decision or at release |
| `is-in` | a `.rv` element | site.js | its entrance is playing; removed at release |
| `is-open` | `li.mainnav__item.has-sub`; `dialog.drawer` | site.js | dropdown open from keyboard or click; drawer slid in (after `showModal()`) |
| `is-playing` | the hero `video` | site.js | the loop is playing (CSS fades it in over the poster) |
| `is-paused` | `div.hero__light` | site.js | the visitor paused the loop with the hero toggle (1.9) |
| `is-section` | `li.mainnav__item`, `ul.sub > li`, `ul.dnav > li`, `ul.dnav__sub > li` | **template** | the item's `inSection` is true (same visual state as current; scaffold precedent: on the `li`) |
| `aria-current="page"` | nav links (top level and children, main nav and drawer), the breadcrumb's last segment | **template** | `chrome.nav[].current`, `children[].current`, `breadcrumbs[].current` |
| `aria-current="true"` / `"false"` | carousel dot buttons | site.js | the active slide |
| `aria-expanded` | `.mainnav__toggle`, `.menu-toggle`, `.dnav__toggle` | template writes `"false"`; site.js toggles | disclosure state |
| `aria-label` (state) | `button.hero__toggle` | site.js | "Pause background video" while playing, "Play background video" while paused (1.9) |
| `hidden` | `ul.dnav__sub`, `[data-show-if]` fields (script), `p.field__error` (model) | template / site.js / model | not rendered |
| `h1--long`, `h1--xlong` | `h1#page-title` | **template** | `h1.text` has 56-74 / 75 or more characters (DESIGN-SPEC 2.3 says 80; QA round 1, LAYOUT-10, moved xlong to 75 in the template): 9 and 5 pages in the build (B.21; this row said 80 and 12 / 2 until the mobile optimisation, I.140) |

No other state class exists. There is **no scroll-state class on the header**: the spec defines none (the top bar
scrolls away by its sticky offset and nothing is written per frame for the header).

### 0.4 `data-*` hooks (the complete list; section 1 says who reads and writes each)

`data-ra`, `data-at` (river anchors) · `data-occluder`, `data-from`, `data-to`, `data-on` (river weave zones) ·
`data-depth` (parallax plane) · `data-protrude`, `data-cross` (protrusion probe hooks; site.js never reads them) ·
`data-band` (per-band progress `--p`) · `data-tilt` (tilt and glare) · `data-carousel` (reviews carousel) ·
`data-close` (drawer close button) · `data-close-at` (drawer breakpoint) · `data-video`, `data-src-webm`,
`data-src-mp4`, `data-src-phone`, `data-media-phone` (hero loop loader) · `data-initials` (placeholder initials, CSS
only, B.10) · `data-show-if` (form condition, from the model) · `data-needs`, `data-needs-backend` (missing-input
markers, from the model or printed from model values; CSS and gates only) · `data-count` (grid sizing, from the
model; CSS only) · `data-strand` (written by site.js on river paths; probes read it) · `data-river` (written by site.js
on `#page`: debug JSON for probes) · `data-src` on an `iframe` (a deferred YouTube embed, D.7 item 7; site.js 1.13;
QA round 1, PERF-6). Any other `data-*` attribute in the output is a defect.

### 0.5 Z-planes (the stacking contract)

DESIGN-SPEC 2.9 gives the planes. Their `z-index` values only order elements **inside one stacking context**, so this
contract fixes the contexts too. `div#page` is the page context (`position: relative; isolation: isolate`). Inside it:

| class | z-index (in `#page`) | what carries it | plane (2.9) |
|---|---|---|---|
| `.aurora-field` | -1 (root context; `position: fixed`, outside `#page`) | the three aurora layers | 0 field |
| band pseudo-layers | -1 (in `#page`, which is isolated, so still above the field) | the `::before` / `::after` of `section.lavender`, `.insurance`, `.emergency`, `.band--sky`, `.band--lav` and `footer.site-footer`: the band ground and its `--p` overlay (styles stage, gap I.58) | 0 |
| `pl-band` | 0 | band layers: `div.services__band`, `svg.bank`, `div.hero__light`, `figure.section__bg` | 0 |
| `.river--under` | 1 | the under SVG | 1 |
| `pl-surface` | 2 | every `.container` (it is the surfaces plane: `position: relative; z-index: 2`) | 2 |
| `pl-surface pl-raise` | 3 | a container whose protrusion crosses **down or across** into a later container's box: the hero (glasses over the intro card), the title band (arch over `div.layout`), the cataract container, and the two-callouts container when H3 ships | 2 (raised) |
| `.river--over` | **4** | the over SVG (drawn only inside occluder clips) | 3 |

Inside a container (itself a stacking context), local z-indexes order the third plane above its surfaces: surfaces
`auto`, `pl-break` **4** (breakouts: doctor photo or plate, cataract lens, handshake photo, arch frame, review panel,
promo, service photos, trio photos, thumbnail and team portraits, intro and Alumier cards), `pl-cut` **5** (cut-outs:
hero glasses, kids' glasses). Chrome sits outside `#page`: `.site-header` 50 (`.sub` 60 inside it), `dialog.drawer` (the
top layer when modal; 100 as a fallback), `.skip` 200.

**Departure (z numbers; gap I.13).** DESIGN-SPEC 2.9 lists the over copy at 3 and breakouts at 4 in one list. Read at page level
that puts the arch (a breakout, and the occluder the over copy must paint **on**) above the over copy, which hides the
weave; and it lets a later container's surface paint over a protrusion that crosses down into it (the phone arch over
the article card). The prototype avoided both only because every `.container` was its own z-2 context. This table keeps
that working order, names the contexts and adds `pl-raise` (an integer between surfaces and the over copy, which is
why the over copy moves to 4). Rule that keeps it safe: **a weave stretch never crosses a breakout or a cut-out other
than its own occluder** (checked by A-13/A-14), because the over SVG is above every container.

Rules every implementer keeps:
- No `z-index`, `transform`, `filter`, `opacity < 1`, `isolation`, `contain: paint` or `backdrop-filter` on `main`, on
  `div.layout`, on the footer or on a `section` that is a direct child of `main` (they would trap that section's band layers
  in a context above the under river). `.container` is the only z-indexed wrapper. Elements inside a container (the CTA
  band, cards, panes) may reveal and transform freely.
- Band pseudo-layers paint at -1, below the banks (gap I.58): at equal z the `::after` overlay comes after `svg.bank` in tree
  order and would dim the bank's strokes by up to 55 % as `--p` rises. A `bank--up` band (the lavender bands, the footer)
  draws its own fill: its two pseudo-layers start `--bank-h` above the band and are masked by the bank curve
  (`--img-bank-up`, the svg's path mirrored), so the ground, the aurora and the `--p` overlay continue into the bank with no
  seam; the svg's `bank__fill` path is not painted there, only its two strokes. The footer's deep aurora therefore lives on
  its `::before`, not on the element (`.site-footer.aurora-deep { background: none }`); the markup is unchanged.
- `.rv` creates a context only while revealing; protrusions are never inside a `.rv` (D3), so this never traps one.
- An element with `data-depth` carries no CSS `transform` of its own: site.js owns its `transform`. A resting rotation
  (the glasses' -7 deg) uses the individual `rotate` property. The reveal (1.3) owns the individual `translate` property
  of `.rv` elements; hover, tilt and resting offsets (the even designer tiles) use `transform`.
- **An occluder never moves.** The over copy's clip is computed once per river build; a parallaxed occluder would drift
  away from its clip and re-create the B1 seam. So occluders (`.frame__clip`, `.alumier__card`, `.titleband__frame`)
  carry no `data-depth`; the image inside the hero frame and inside the arch sinks instead (`data-depth="inner"`).
  **Departure** for the arch, which DESIGN-SPEC 2.9/3.21 move at 1.06: the arch frame is static, its image sinks at 0.92 (gap I.10).

### 0.6 Tokens consumed per component

Token names are DESIGN-SPEC 2 (all on `:root`, in the redesign layer of `src/styles/tokens.css`). "type" = the step
tokens; colour tokens are listed where the component uses them directly.

| component | tokens |
|---|---|
| base (`body`, links, focus) | `--font`, `--step-0`, `--ink-700`, `--ground`, `--aqua-50`, `--paper`, `--teal-700`, `--teal-800`, `--navy-700`, `--teal-200` (focus on navy), `--navbar-h` (scroll padding) |
| aurora field (A1) | the rgb values of `--field-teal`, `--field-sky`, `--field-violet`, `--field-lav` (2.8 A1 literals) |
| top bar (B.1) | `--navy-700`, `--teal-700`, `--teal-200`, `--topbar-h` (sticky offset only), `--gutter`, `--maxw`, `--r-pill`, `--dur-fast` |
| header, nav, dropdowns (B.2) | `--chrome-h` (static), `--navy-700`, `--navy-900`, `--tint-lav`, `--tint-teal`, `--teal-700`, `--teal-800`, `--shade`, `--sh-3`, `--ease-out`, `--dur-fast`, `--step-0` |
| drawer (B.2) | `--paper`, `--aqua-50`, `--shade`, `--teal-200`, `--navy-700`, `--ease-out`, `--r-s` |
| buttons (B.0) | `--teal-700`, `--teal-800`, `--navy-700`, `--navy-900`, `--teal-200`, `--sky-500`, `--tint-teal`, `--r-pill`, `--dur-slow` (sheen), `--ease-out`, `--lift` |
| section header (B.3) | `--step-3`, `--navy-700`, `--navy-900`, `--teal-700`, `--navy-100`, `--teal-200` |
| hero (B.4) | `--display`, `--chrome-h`, `--hero-tuck`, `--r-xl`, `--sh-3`, `--sh-fore`, `--navy-700`, `--paper` (bank fill), `--teal-500` (bank stroke), `--tint-teal` |
| intro card (B.5) | `--hero-tuck`, `--step-3`, `--step-1`, `--ink-700`, `--r-l`, `--sh-2` |
| promo, services (B.6) | `--r-l`, `--r-m`, `--sh-2`, `--sh-3`, `--svc-break`, `--step-1`, `--navy-700`, `--teal-700`, `--lift`, `--promo-w`/`--promo-h` (component tokens from container units, Riverlight's maths) |
| Alumier (B.7) | `--al-overlap`, `--r-xl`, `--r-l`, `--sh-3`, `--step-1`, `--ink-900` |
| cards (B.8) | `--r-l`, `--r-m`, `--sh-2`, `--sh-3`, `--lift`, `--teal-700`, `--rx`, `--ry`, `--mx`, `--my` (site.js) |
| two callouts (B.9) | `--step-2`, `--r-l`, `--r-m`, `--sh-1`, `--sh-fore` (kids' glasses) |
| doctor blocks, placeholder (B.10) | `--r-xl`, `--field-teal`, `--field-sky`, `--field-violet`, `--teal-500`, `--violet-500`, `--navy-700`, `--sh-4`, `--teal-700`, `--tint-teal`, `--teal-800`, `--navbar-h` (sticky top) |
| lavender trio (B.11) | `--lav-300`, `--ink-900`, `--navy-700`, `--step-2`, `--sh-3`, `--teal-500` and `--navy-700` (bank strokes) |
| designer frames (B.12) | `--r-l`, `--tint-sky`, `--field-teal`, `--navy-700`, `--step-1` |
| cataract (B.13) | `--r-xl`, `--sh-4`, `--r-l` |
| Eye Emergencies (B.14) | `--tint-sky`, `--r-xl`, `--sh-4` |
| reviews (B.15) | `--teal-700`, `--ink-900`, `--navy-700`, `--step-1`, `--step--1`, `--r-xl`, `--shade` |
| insurance band (B.17) | `--lav-300`, `--ink-900`, `--navy-700` |
| news cards (B.18) | `--teal-500`, `--violet-500`, `--teal-700`, `--step--1`, `--r-l`, `--sh-2` |
| footer (B.19) | `--navy-950`, `--glow-teal`, `--glow-sky`, `--glow-violet`, `--navy-700`, `--navy-100`, `--teal-200`, `--teal-700`, `--p` (site.js) |
| breadcrumbs (B.20) | `--teal-700`, `--ink-900`, `--ink-600` |
| title band (B.21) | `--h1-band`, `--arch-w`, `--arch-cross`, `--chrome-h`, `--r-xl`, `--sh-4`, `--step--1`, `--teal-700`, `--obj-pos` (the arch image's object-position, set inline from P4) |
| prose (B.22, D) | `--step-prose`, `--measure`, `--step-3`, `--step-2`, `--step-1`, `--step-0`, `--step--1`, `--ink-700`, `--ink-900`, `--ink-600`, `--navy-700`, `--teal-700`, `--teal-800`, `--tint-lav`, `--tint-teal`, `--tint-sky`, `--ground`, `--r-s`, `--r-m`, `--r-l`, `--sh-2`, `--navy-950` (video frame), `--gutter` |
| aside (B.23) | `--side-w`, `--teal-700`, `--navy-700`, `--navy-900`, `--teal-800`, `--tint-sky`, `--r-m`, `--navbar-h` (sticky top) |
| CTA band (B.24) | `--navy-950`, `--navy-100`, `--teal-200`, `--r-xl`, `--step-3`, `--step-1` |
| forms (B.25, E) | `--line-input`, `--alert-700`, `--teal-700`, `--ink-600`, `--ink-700`, `--navy-700`, `--step--1`, `--r-s` |
| accordion (B.26) | `--tint-lav`, `--r-m`, `--sh-1`, `--step-1`, `--teal-700`, `--ease-out`, `--dur` |
| team cards (B.27) | `--r-l`, `--tint-teal`, `--teal-800`, `--sh-4` |
| blog cards, archive rows (B.28) | `--teal-500`, `--violet-500` (G8 rule), `--teal-700`, `--step--1`, `--r-l`, `--sh-2`, `--sh-1`, `--navy-700` |
| enhancers (D.6) | `--tint-teal`, `--tint-sky` (checklist panel), `--teal-700` (treatment border), `--paper`, `--ground`, `--r-l` |
| child-page cards (F.2) | `--r-l`, `--r-m`, `--sh-2`, `--sh-4` (thumbnail break-out), `--navy-700`, `--ink-700`, `--lift` |
| testimonial, static review (F.6) | `--teal-700` (stars), `--ink-900`, `--navy-700`, `--step-1`, `--step--1`, `--r-l` |
| products, devices (F.7) | `--paper` (white chip), `--r-s`, `--r-l`, `--ink-600` (the "Read More+" text), `--step-0`, `--step-1` |
| visit, sitemap (F.8, F.5) | `--r-l`, `--teal-200` (nested-list rule), `--navy-700`, `--step-1` |
| hub bands (C.7) | `--lav-300` (`band--lav`), the A4 gradient stops (`band--sky`), `--teal-500` and `--navy-700` (bank strokes), `--space-section`, `--arch-cross` (the first section's reserve) |
| motion (6) | `--ease-out`, `--dur-fast`, `--dur`, `--dur-slow`, `--lift`, `--d` (site.js), `--p` (site.js) |

### 0.7 Icons

One inline sprite per page, first child of `<body>`: `<svg class="sprite" aria-hidden="true" focusable="false">` holding
one `<symbol id="i-{name}" viewBox="…">` per icon **the page uses** (DESIGN-SPEC 3). Names and paths are the prototype's
(`index.html` lines 16-28): `calendar`, `phone`, `mail`, `chev`, `arrow`, `menu`, `close`, `star`, `pin`, `facebook`,
`yelp`, `google`, `youtube`; plus `play` and `pause` (24x24, stroke 2.2, same style), printed on the home only, for the
hero toggle (1.9). Every use is exactly `<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>`
(social icons drop the `ico` class and size by their own rule). Social icons map by `network` (`i-{network}`).

### 0.8 Images (every `<img>` the templates print)

- Attributes, always: `src`, `alt`, `width` and `height` (the model's `w`/`h`), `decoding="async"`; `loading="lazy"`
  unless the image is in the first screen (the home hero frame image, the arch image: `fetchpriority="high"` and no
  `loading`); `srcset` + `sizes` [P1] with the slot's `sizes` given in its subsection.
- **Alt rule:** exactly the model's `alt` (`""` when the model gives `""`), never forced. `keep-image-parity` (alt
  fidelity) compares every `<img>` in `<main>` with the alt its source page gives that file; a file the source shows
  only as a CSS background, or never shows (generated images, theme posters), is "unmatched". **Correction (wf5b
  pipeline):** this file said an unmatched image passes; it does not. `tools/keep-image-parity.mjs` exits 1 on any
  unmatched `<img>` in `<main>` (fix round 2), so every `art` image, the hero and band posters and a background photo
  printed as an `<img>` outside `figure.section__bg` fail A-1 once rendered, until the gate accepts the declared
  additions (gap I.51; the build writes them to `audit/clone-removals.json` `images.added`). **Closed by the templates
  stage (I.51):** the gate now accepts exactly the declared `images.added` rows (page and file, with the declared alt),
  the theme stills `theme/media/hero-river-poster(-phone).webp` (alt `""`) and a KEEP photo the source page shows only as
  a CSS background (alt `""`); any other unmatched image still fails it. A team portrait in the arch
  keeps the model's `photo.alt` (it is not decorative).
- **Natural-width slots (templates stage, gap I.68).** Where the CSS sizes an image by its natural width (`width: auto`:
  logo walls, logo-grid chips, product and device chips, hub brand cards), the selected `srcset` candidate's density
  sets that natural width, so these slots print `sizes="{w}px"` (the file's own width: density 1, the rendering the CSS
  was tested with). Every other slot's `sizes` describes its rendered width (I.67).
- **Phone density cap (mobile optimisation, M-SPEED-1, I.135; an operator option, revertible).** Below 769 px a screen
  denser than 2.2 dppx asks a slot's `srcset` for about twice the slot's width, not its full density: `capSizes()`
  (templates.mjs) puts, before the slot's own `sizes`, one twin per resolution step (2.2 / 2.52 / 2.88 / 3.29 / 3.76 dppx,
  the slot's length times .8727 / .7619 / .6667 / .5836 / .5106) for each of the slot's entries that can apply at 768 px
  or less, each starting `(max-width:768px) and (min-resolution:{T}dppx)`; at 769 px and up the slot's own entries decide
  exactly as before. The density asked for is 1.92x-2.2x at every DPR from 2.2 to 4.3 and exactly 2x at 2.625 and 3.
  A changed density changes an image's intrinsic width, so a slot drawn at its natural width never takes the cap: the
  natural-width slots above, the fig-grid brand chips (`width: auto` up to 768 px, D.5), the brand art whose wordmark or
  copy is the point (`fig--brand`: the Envision promo, the brand banners; the Alumier logo), the band backgrounds
  (`figure.section__bg`, which ask for the largest file) and a one-file `srcset` (nothing to pick); every other slot gives
  the img its `width` attribute or 100% of a frame, so only the picked file changes (verified: no image width moved on 9
  phone views x 20 pages; BUILD-NOTES 15.2). The LCP preload's `imagesizes` takes the same step (A.1).
- **Real-image rule:** a slot that names a person or a brand shows only that person's or brand's own file, or its
  placeholder (B.10, B.12). Real images are never cropped through a brand mark, recoloured, cut out or filtered.
- **Generated images** (IMAGE-PLAN 2-3) reach the templates only through `model.art` [P4] (0.12) with their `alt`
  (`""` for ambient ones, the literal IMAGE-PLAN description for stand-ins), AI-labelled by P7. Templates never
  hard-code a generated file and never read `src/content/image-plan.json` (BUILD-NOTES 5: render from the model alone).
- `section.background` images: `alt=""` (the model gives `""`), honour `media` (BUILD-NOTES 5.8.8) except the declared
  hero case (B.4).

### 0.9 Non-visible authored strings (declared; every other string is model or chrome)

`aria-label`: "Main" (main nav), "Breadcrumb", "Footer" (footer nav), "Mobile" (drawer nav), "Menu" (drawer dialog),
"Reviews" (dot group), "{n} out of 5 stars" (ratings), "Show review {n} of {N}" (dot buttons), "{n} of {N}" (slides),
"Pause background video" / "Play background video" (hero toggle, written by site.js), "{label} submenu" (each dropdown
and drawer toggle: an `aria-label`, never a text node; DESIGN-SPEC 3.2 asks for visually hidden text, but
`tools/words-added.mjs` counts every text node of `<body>`, visually hidden ones included, and "submenu" occurs in none of
the 148 source pages, `chrome.json` or `client-facts.json`: gap I.41). None of the strings in this paragraph is a text
node, visible or visually hidden. `aria-roledescription`: "carousel", "slide". The chrome strings
`logo.homeLabel` and `mapsLinkLabel` are declared in `chrome.json` `authored`. The only **visible** non-model strings
are the two DESIGN-SPEC declarations: the placeholder initials (Q-7; drawn by CSS from `data-initials`, B.10) and the CTA
band's chrome call action (Q-2, a repeat of `chrome.topbar.call`), plus the `:` after each hours day label, which is the
source's own punctuation (`strong.ecp-post-label` "Monday:" in the raw pages; the model drops it; the scaffold prints it).

### 0.10 Fixed ids

`main`, `page`, `drawer`, `page-title` (band h1; the forms' `aria-labelledby` points at it), `sub-{n}` (dropdown panel
of top-level nav item n, 1-based in `chrome.nav`: here 2, 3, 6), `dsub-{n}` (its drawer twin), `loc-title` (aside location
heading), `cta-title` (CTA band heading), `reviews-title` (home reviews heading), `i-{name}` (sprite),
`ru-glow`/`ru-mid`/`ru-body`/`ro-glow`/`ro-mid`/`ro-body` (river gradients), `ro-clip-{n}` (weave clips). Form ids come
from `form.html` (`f9-*`, `f10-*`). Ids from model HTML: none on this site (0 heading ids). Every id is unique per page
(A-8).

### 0.11 URLs and links

Every `href`/`src` comes from the model (already page-relative) except the `{up}` theme assets and the map-card link
(B.23). External links print the model's `rel`; a link the model marks `newTab` gets `target="_blank"` and `rel` with
`noopener` added (the scaffold's `extLink` rule, which only applies to `http(s)` hrefs). Social links (`chrome.social`,
`aside.social`) always open in a new tab with the model `rel` (scaffold and source). `tel:` hrefs print as given
(`tel:239-500-2020`, chrome change C01).

### 0.12 The model additions this contract consumes (DESIGN-SPEC 4.3)

| id | field | shape consumed here | status |
|---|---|---|---|
| P1 | `images[].srcset` and the same key on every image object (`background[].image`, `callout.image`, `members[].photo`, `items[].image`, `items[].thumb`, `art.*`) | `[{ url, w }]`, ascending `w`, capped at the intrinsic width | in the models since wf5b: all 573 image objects of the 149 models (BUILD-NOTES 5.1) |
| P1 | `sections[0].background[0].image.crop` (home hero only) | `{ url, w, h, srcset }`: the 4:3 crop DESIGN-SPEC 3.4 asks for (1067x800 of the 1920x800 original), as its own object because one `srcset` may list one aspect only (B.4) | in the home model since wf5b: 1067x800 cut at x 308, widths 360 / 540 / 720 / 1067 (gap I.3 closed). Not at the 55% of the fallback below: that edge (x 1536) cuts through the staff member at the reception desk; x 308 ends left of her and of the monitor (BUILD-NOTES 5.2) |
| P2 | `head.stylesheets[0]` | the fingerprinted `theme/riverlight.<hash>.css`, page-relative | since wf5b: `theme/riverlight.<8 hex>.css` once `src/styles/riverlight.css` exists, `styles/scaffold.css` until then (BUILD-NOTES 11); since the integrate stage always the theme (the scaffold is retired, I.72) |
| P2 | `head.scripts[0]` | the fingerprinted `theme/site.<hash>.js`, page-relative | **not in DESIGN-SPEC 4.3**: declared here (gap I.12); a model field since wf5b (BUILD-NOTES 5.1), always present: `[theme/site.<8 hex>.js]` on the design theme, `[]` on the scaffold; print exactly its entries |
| P3 | `chrome.logo.url`, `chrome.mobile.logo.url` | the byte-identical PNG copies | since wf5b: `…logo-01.737365bec0.png` (300x121) and `…logo.f90c8d47ff.png` (988x400), sha256-equal to the source files (gap I.5 closed) |
| P4 | `art.title` | `{ id, url, w, h, alt, srcset, ai, objectPosition }` (`objectPosition` from `image-plan.json` `usedFor[].objectPosition`, e.g. TB-ecs `68% 62%`; `null` otherwise) or `{ placeholder: { kind, label, needs } }` for a team page whose own model has no portrait (B.21) | in the models since wf5b: on the 133 band models without an arch of their own, `null` on the other 16 (BUILD-NOTES 5.10; gaps I.4, I.7, I.15 closed) |
| P4 | `art.inline[]` | `{ id, image: { url, w, h, alt, srcset, ai, role }, anchor: { type: 'article-start' \| 'heading' \| 'after-paragraph' \| 'hub-item', text?, level?, before?, paragraphIndex?, textEndsWith? }, position }` (the anchor object of `image-plan.json` `usedFor[]`, verbatim) | in the models since wf5b: 11 entries on 7 pages; every anchor is matched at build time, and a miss fails the build |
| P4 | `art.home` (home model only) | `{ 'hero-cutout': image, 'home-feature': image, 'graft-cutout': image or null }`, keyed by the `image-plan.json` role (H1, H2, H3) | **not in DESIGN-SPEC 4.3** (which names only `title` and `inline[]`): declared here (gap I.11); in the home model since wf5b (H1, H2, H3), `null` on every other model |
| P5 | model figure classes `fig--left`/`fig--right`/`fig--center` | optional; override the placement of D.5 | not in the models (not done in wf5b: it would change what the content pipeline extracts) |
| P6 | `video.poster` | `{ url, w, h }` or null | null on all 3 (optional; not done in wf5b, BUILD-NOTES 11) |
| P7 | the AI XMP label | file-level, no markup | done in wf5b: all 119 generated files carry the IPTC `trainedAlgorithmicMedia` XMP (the hero posters already did) |

A theme ignores keys it does not know (BUILD-NOTES 5 invariant 8). Every field above is optional for the templates:
each subsection says what renders while it is absent.

---

## 1. The site.js hook and state contract

`src/theme/site.js` (one deferred file, 10 KB gzipped or less, no dependency, no framework) reads **only** the hooks
below and writes **only** the states below. "No JS" is what the page does when the script is absent (CSS keys these
on `html:not(.js)`); "reduced" is `prefers-reduced-motion: reduce`. The script listens to that media query's `change`
event and switches modes at runtime in both directions.

### 1.0 Who writes what, when (summary)

| hook or state | written by | read by | when |
|---|---|---|---|
| `html.js` | inline head one-liner (A.1), then site.js | CSS | before first paint |
| `--topbar-h`, `--navbar-h` on `<html>` | site.js | CSS (sticky offset, scroll padding, sticky tops only) | start; resize (150 ms debounce); `document.fonts.ready` |
| `html.rv-ready`; `.rv`, `.is-in`, `--d` on elements | template writes `.rv`; site.js the rest | CSS | decision after fonts or 300 ms; entrance on intersection; release after `--dur` + delay + 50 ms |
| `transform` on `[data-depth]`, `.hero__light`, `.aurora-field__layer--*`; `opacity` on `.aurora-field__layer--*`, `.hero__light` | site.js | browser | one rAF per scroll frame, only while scrolling |
| `--p` on `[data-band]` | site.js | CSS (`::after` opacity) | per scroll frame, bands in view only; only in browsers without scroll-driven animations (elsewhere a CSS view timeline drives the `::after`, 1.4) |
| `--rx`, `--ry`, `--mx`, `--my` on `[data-tilt]` | site.js | CSS | pointermove (one rAF); removed on pointerleave |
| `is-open`, `aria-expanded` (nav) | template writes `aria-expanded="false"`; site.js toggles | CSS, AT | click, keyboard, hover mirror |
| `dialog.drawer` open state, `is-open` | site.js (`showModal()`/`close()`) | browser, CSS | menu button, close button, backdrop click, Escape, breakpoint |
| `--sbw` on `<html>` (QA round 1, I.106) | site.js | CSS (the scroll lock's `padding-right`, 1.5) | right before `showModal()` |
| `.is-tall` on `.side-card--loc` (QA round 1, I.96, I.114) | site.js | CSS (the card sticks only without it) | start, resize, fonts, a ResizeObserver on the header and the card |
| `src` on `iframe[data-src]` (QA round 1, I.111) | site.js | browser | the frame within 600 px of the viewport (1.13) |
| `hidden` on `ul.dnav__sub` | template writes it; site.js toggles | browser | drawer toggle click |
| carousel dots (`button.carousel__dot`), `aria-current`, track `height` | site.js | AT, CSS | init, slide change, resize, fonts |
| river SVG contents, `#page[data-river]`, `path[data-strand]` | site.js | browser, probes | after `load` + idle; on size change |
| hero `video`, `is-playing`, `button.hero__toggle`, `div.hero__light.is-paused` | site.js | CSS, AT | after `load`, when allowed (1.9) |
| `hidden` on `[data-show-if]` fields | site.js | browser | start, every `change` of the named control |

### 1.1 Boot and header metrics

| hook | on | set by | site.js does | when | no JS / reduced |
|---|---|---|---|---|---|
| `js` class | `<html>` | inline head one-liner `document.documentElement.classList.add('js')` (A.1), then site.js again (idempotent) | nothing else | before first paint | absent: the no-JS layout (DESIGN-SPEC 8) / unchanged |
| `--topbar-h` | `<html>` style | site.js | writes the `.topbar` height, `getBoundingClientRect().height` rounded **up**, + `px` (gap I.54) | start, resize (150 ms debounce), `document.fonts.ready` | CSS static default per layout (`44px` at d; the QA-frozen values at t and p) / same |
| `--navbar-h` | `<html>` style | site.js | writes the `.navbar` height the same way | same | CSS static default (93 px d and t, 79 px p) / same |

**D1 guard (DESIGN-SPEC D1).** `--topbar-h` may appear only in `.site-header { top: calc(-1 * var(--topbar-h)) }`;
`--navbar-h` only in `html { scroll-padding-top }` and in the sticky `top` of `.side-card--loc` (B.23) and
`.doctor__portrait` (B.10). Neither may appear in any `height`, `min-height`, `max-height`, `padding`, `margin`, `width`
or `inset` declaration, and no ResizeObserver writes either. The navbar's height comes from its content (the logo plus
10 px padding). `--chrome-h` is a static per-layout token, never written by script. Measuring is allowed by D1 for
exactly these two uses: the top bar's height at t and p depends on how the address sentence wraps, which no static
value can follow. **Gap I.14a:** the build workflow's brief says "header states without runtime measurement of chrome
heights"; this contract measures for the sticky offset and scroll padding only, as DESIGN-SPEC D1 permits, and never
feeds a measured value into a size. **Bottom scroll padding (mobile optimisation, M-LAYOUT-7, I.137):** below 1024 px
`html { scroll-padding-bottom: 12px }` (a static value, no measurement), so a control that Tab scrolls onto the fold shows its
whole 6 px focus ring; it moves no box.

### 1.2 Hooks only the build sets (site.js reads none of them)

`aria-current="page"`, `is-section`, `h1--long`/`h1--xlong`, `data-needs`, `data-needs-backend`, `data-count`,
`data-initials`, `data-protrude`, `data-cross`. The last two serve the protrusion probe (DESIGN-SPEC 5.3 item 5, a port of
`tmp/panel/riverlight/work/probe.mjs`): `data-protrude="{name}"` marks every protruding box (the probe grows it by the
parallax range of the element or of its nearest `[data-depth]` ancestor), and `data-cross="{selector}"` names the edge it
must cross. Resolution: the selector is looked up in the protrusion's nearest ancestor that holds a match (its parent,
then each ancestor up to the document; integrate stage, gap I.77: the "own `section` first" rule resolved the second and
third doctor photos of a hub `team` section to the FIRST doctor's plate, since all three share one section; for every other
protrusion the two rules give the same element); the keyword `parent` means the protrusion's parent element; the keyword `next` means the next `section` sibling of the
protrusion's own section.

### 1.3 Reveals (DESIGN-SPEC 6.1)

| hook | on | set by | site.js does |
|---|---|---|---|
| `.rv` | block groups listed per component in B and F ("Reveal") | template | candidate |
| `html.rv-ready` | `<html>` | site.js | set once, at the decision |
| `.is-in` + `--d` | the revealing element | site.js | entrance, then release |

Algorithm (exact):
1. If `prefers-reduced-motion: reduce` matches or `IntersectionObserver` is missing: remove `.rv` from every element;
   never set `rv-ready`; stop.
2. Wait for `document.fonts.ready` or 300 ms, whichever comes first. Nothing is hidden before this: CSS hides only under
   `html.rv-ready`.
3. For every `.rv`: if its painted rect (`getBoundingClientRect()`) intersects the viewport, remove `.rv` (no entrance).
   **Second look**, right after step 4 and in the same task (nothing is painted in between): every remaining `.rv` whose
   painted rect now intersects the viewport loses `.rv` too. The hidden offset moves an element that ended less than
   26 px above the viewport (a restored scroll, an anchor jump) into it, and that slice would be painted hidden (gap I.52).
   The second look reads whatever offset the CSS applies; site.js holds no copy of it.
4. Set `html.rv-ready`. CSS: `html.rv-ready .rv { opacity: 0; translate: 0 26px }`.
5. One `IntersectionObserver` with `{ threshold: 0, rootMargin: '0px' }` observes every remaining `.rv`. Per callback
   batch, the intersecting entries in delivery order get an index `i`; each gets `--d: {min(i, 2) * 40}ms` and `is-in`
   (CSS transitions `opacity` and `translate` over `--dur` with delay `--d`) and is unobserved. **Departure** from
   DESIGN-SPEC 2.10 / 6.1 ("stagger 70 ms capped at 3 steps"): with the 480 ms entrance, a 70 ms x 3 stagger keeps the
   third and fourth element of a batch below opacity 1 for 620 and 690 ms while it is in view, and A-12 fails any element
   below opacity 1 in view for more than 600 ms. 40 ms x 2 keeps three cascade steps (0 / 40 / 80 ms) and ends every
   entrance within 560 ms of the element entering the viewport (gap I.42; the acceptance check binds, DESIGN-SPEC preamble).
6. **Release:** `setTimeout(480 + d + 50)` removes `rv`, `is-in` and `--d`. Hover and tilt CSS applies only to
   `[data-tilt]:not(.rv)`, so hover works from the release on; the reveal animates `translate`, hover and tilt animate
   `transform`, so neither outranks the other.
7. **Sweep:** while any element is pending, the single scroll handler (1.4) also reveals every pending element whose rect
   intersects the viewport (fast jumps, anchor jumps, restored scroll). No timer ever reveals in-view or off-screen
   content on its own.
8. **Observer health check (the only fail-safe):** if the observer has delivered **no callback at all** 1000 ms after
   `observe()` (an observer always delivers one initial entry per target when it works), treat `IntersectionObserver` as
   broken: remove `.rv` from every pending element and remove `rv-ready`. This never fires while the observer works, so
   it is not the "unconditional fail-safe timer" trap of DESIGN-SPEC 6.1; it fails open (content visible). Declared
   refinement (the build brief asks for "fail-safe only when the observer never delivered"; gap I.14c). The 1000 ms run
   while the document is visible: a hidden tab (a link opened in the background, a prerender) renders no frames, so no
   observer delivers there; the count starts at the first `visibilitychange` to visible (gap I.53).
9. `beforeprint`: reveal and release everything pending.

An element whose resting pose is offset (the even designer tiles, B.12) keeps that offset in `transform`; the entrance
animates only `translate`, so it ends at the resting pose.

### 1.4 Parallax, scroll-linked aurora and band progress (DESIGN-SPEC 2.8, 2.9, 6.2, 6.3)

One passive `scroll` listener and one rAF per frame drive everything here plus the reveal sweep; nothing runs when the
page is not scrolling. Element geometry is measured on `load`, on resize (150 ms debounce), after
`document.fonts.ready` and when the river's ResizeObserver (1.8) rebuilds for a `#page` size change (an accordion opening,
the carousel height), never per frame; the writes it feeds (`transform`, `opacity`, `--p`) never size anything, so no
loop can form. An IntersectionObserver with `rootMargin: '200px 0px'` marks `[data-depth]`
elements on or off screen; off-screen ones are skipped.

| hook | on | values | site.js writes (per frame) |
|---|---|---|---|
| `data-depth` | parallax elements (per component in B) | `inner` (rate 0.08, max 22 px), `fore-soft` (0.06, 26), `fore` (0.12, 44) | `style.transform = translate3d(0, {off}px, 0)`. `inner`: `off = clamp(scrollY * 0.08, 0, 22)` (sinks; screen speed 0.92). `fore` / `fore-soft` whose rest top was above `innerHeight` at load: `off = clamp(-scrollY * rate, -max, 0)` (upward only: CLS 0). Others: `off = clamp((restCentreY - (scrollY + innerHeight / 2)) * rate, -max, max)` (1.12x / 1.06x around the viewport centre), except `fore`, whose upper bound is 0: a cut-out moves upward only from rest everywhere (DESIGN-SPEC 2.9; QA round 1, MOTION-8, register I.L) |
| `.aurora-field__layer--dawn`, `--day`, `--dusk` | the three field layers | | with `p = scrollY / (scrollHeight - innerHeight)`: `dawn = 1 - smooth(.08, .42, p)`, `dusk = smooth(.55, .9, p)`, `day = clamp(1 - dawn - dusk, 0, 1)` as `style.opacity`; all three `style.transform = translate3d(0, {-6p}vh, 0)` (`smooth` = smoothstep) |
| `.hero__light` | the home hero and every title band | | while `scrollY < 1.6 * innerHeight`: `style.transform = translate3d(0, {0.3 * scrollY}px, 0)`, `style.opacity = base * (1 - smooth(0, 1.1 * innerHeight, scrollY))`, `base` = its computed CSS opacity read once at start (1 on the home, 0.42 in title bands) |
| `data-band` | band elements (listed in B and C) | | for bands in view only: `--p = clamp((innerHeight - rect.top) / (innerHeight + rect.height), 0, 1)` (0 entering, 1 leaving) via `style.setProperty('--p', …)`; CSS: the band's `::after` opacity `calc(var(--p) * .55)`, with `--p` registered non-inherited (`@property`) and taken by the `::after` (`--p: inherit`). **Where `CSS.supports('animation-timeline: view()')`** (QA round 1, MOTION-1 / PERF-1, register I.L) site.js writes nothing here: motion.css gives each `html.js [data-band]` a view timeline (`--rfec-band`, inset 0) and its `::after` the animation `rfec-band-dusk` (opacity 0 to .55, range `cover 0%` to `cover 100%`), the same progress without a write per frame; only under `prefers-reduced-motion: no-preference` |

Reduced motion: nothing above is written; inline `transform`, `opacity` and `--p` are removed when the preference turns
on at runtime; CSS defaults show the dawn field and `--p: 0`. No JS: the same static state.

### 1.5 Navigation: dropdowns and drawer (DESIGN-SPEC 3.2, G2, G3)

| hook | on | site.js does |
|---|---|---|
| `li.mainnav__item.has-sub` | top-level item with children | toggles `is-open` |
| `button.mainnav__toggle[aria-expanded][aria-controls="sub-{n}"]` | the 44x44 toggle after the link | click (Enter and Space are native): toggle `is-open` + `aria-expanded`; opening one closes the others |
| `a.mainnav__link`, `ul.sub a` | links | ArrowDown on the link or the toggle: open and focus the first `ul.sub a`; ArrowDown / ArrowUp inside `ul.sub`: next / previous link, wrapping; Escape inside the item: close and focus the toggle; `focusout` leaving the `li`: close; a click outside `nav.mainnav`: close all |
| hover | the `li` | CSS opens the panel on `:hover` (10 px bridge `ul.sub::before`); site.js mirrors it into `aria-expanded` on `mouseenter` / `mouseleave` (it stays `true` while `is-open`) |
| `button.menu-toggle[aria-controls="drawer"][aria-expanded]` | header menu circle | `drawer.showModal()`; next frame add `is-open` (the slide-in); `aria-expanded="true"`; focus the first focusable element of `.drawer__panel`. Below 1024 px (mobile optimisation, MT-R1, I.131) it first reads the menu button's top and, after `showModal()`, writes it less the close button's offset in `.drawer__head` as `--menu-top` on `.drawer__panel`, so the close button opens over the menu button (B.2); at 1024 px and up it writes nothing (and removes a value left from a narrower open) |
| `dialog#drawer.drawer[data-close-at]` | the drawer | **close** = remove `is-open`; after 380 ms (0 under reduced motion) `drawer.close()`; `aria-expanded="false"`; `menuToggle.focus({ preventScroll: true })`. Close triggers: a `[data-close]` button; a click whose `target` is the `dialog` itself (the backdrop area); the `cancel` event (Escape: `preventDefault()`, then the same animated close); `matchMedia(data-close-at)` turning true (`(min-width: 1200px)`, the main-nav breakpoint) |
| `button.dnav__toggle[aria-expanded][aria-controls="dsub-{n}"]` | drawer accordion toggles (48x48) | toggles `aria-expanded` and the `hidden` attribute of `ul#dsub-{n}` |
| `pagehide` | `window` | mobile optimisation (MT-R2, I.132): below 1024 px an open drawer closes at once (no animation: `is-open` removed, `aria-expanded="false"`, `drawer.close()`), so a page left from inside the drawer comes back from the back-forward cache closed and unlocked; 1024-1199 px is unchanged |
| no `showModal` | `<html>` | mobile optimisation (M-TOUCH-1, I.129): where `dialog.showModal` is not a function the menu button is not wired (as before) and `html.no-modal` follows `matchMedia('(max-width: 1023px)')` (set, removed on the change event); CSS shows the nav as the no-JS list (B.2) |

The modal dialog makes the rest of the page inert and contains focus natively (no script trap). Scroll lock is CSS:
`html:has(dialog[open]) { overflow: hidden; padding-right: var(--sbw, 0px) }`. QA round 1 (LAYOUT-12, MOTION-4, I.106):
before `showModal()` site.js writes the classic scrollbar's width (`innerWidth - documentElement.clientWidth`, measured
in the closed state; 0 for an overlay bar or when `scrollbar-gutter` is already `stable`) as `--sbw` on `html`, so the
page behind the scrim keeps its width (the value does not depend on anything it pads: D1 holds). No JS: the menu button is hidden, the drawer never opens, and the main
nav shows at every width as a wrapped list with each dropdown's children as a nested list (DESIGN-SPEC 8).

### 1.6 Carousel (DESIGN-SPEC 3.15)

| hook | on | site.js does |
|---|---|---|
| `section.carousel[data-carousel]` | the home reviews (the only carousel) | init |
| `div.carousel__track[tabindex="0"]` | the scroll-snap track | `go(i)`: `track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' })`; the index wraps (loop by index); ArrowRight / ArrowLeft on the track: `go(i ± 1)`; on scroll end (90 ms debounce) the index becomes `round(scrollLeft / clientWidth)`; **the height follows the active slide**: `track.style.height = slide.offsetHeight + 'px'` on change, resize and `fonts.ready` (the slide's height does not depend on the track's, so D1 holds) |
| `div.carousel__dots[role="group"][aria-label="Reviews"]` | empty in the markup (in `.carousel__bar`, above the track, with the CTA: B.15) | appends one `button.carousel__dot[type="button"][aria-label="Show review {n} of {N}"]` per slide; `aria-current="true"` on the active one, `"false"` on the others |
| `figure.review` (each slide) | QA round 1 (A11Y-10, I.98) | `aria-hidden="true"` on every slide but the shown one, so the track's polite live region gains the slide that becomes current (the APG pattern: the shown slide joins the accessibility tree); a ResizeObserver on the slides refits the track when a slide changes height without a resize (LAYOUT-5) |

**No autoplay, no auto-advance, ever** (as at source; DESIGN-SPEC 3.15). There is therefore nothing to pause on hover
or focus and no visibility gate to write. **Gap I.14b:** the build brief's "pause on hover/focus, gate auto-advance on
`intersectionRatio`" describes an auto-advancing carousel that DESIGN-SPEC forbids; nothing of it is implemented. No JS:
the track scrolls natively (scroll-snap), no dots are created, the track's height is the tallest slide's.

### 1.7 Tilt and glare (DESIGN-SPEC 6.4, G16)

`[data-tilt]` cards, only when `(hover: hover) and (pointer: fine)` matches, motion is allowed and the element has no
`.rv`: on `pointermove` (one rAF) write `--rx: {-y * 5}deg`, `--ry: {x * 6}deg`, `--mx: {(x + 0.5) * 100}%`,
`--my: {(y + 0.5) * 100}%` (`x`, `y` = the pointer position inside the card, -0.5 to 0.5); on `pointerleave` remove all
four. Focus feedback is CSS only (`:focus-within`: the lift, glare fixed at the centre at .35, the 3 px ring on
`:has(:focus-visible)`; no tilt).

### 1.8 The river (DESIGN-SPEC 2.8 A2, U4, B1, B5)

Markup hooks (templates):
- `svg.river.river--under` and `svg.river.river--over`, empty, `aria-hidden="true" focusable="false"`, the first two
  children of `div#page`.
- **Anchors** `<i class="ra" aria-hidden="true" data-ra="{key}" data-at="{layout}:{x},{y} …"></i>`, direct children of
  their host (a `section`, `div.layout`, `section.ctaband` or `footer`), placed after the host's band layers
  (`div.hero__light`, `div.services__band`, `svg.bank--up`, `figure.section__bg`, which stay its first children, A.3) and
  before its `.container`. site.js takes the host as `anchor.parentElement`. Route order = document order; `key` is unique
  per page. This splits DESIGN-SPEC's single `data-ra="…"` payload into a key (weave zones name their anchors by it) and
  the coordinates (declared refinement).
  - `layout`: `d`, `t`, `m`, `p` (0.1). A missing layout uses the next wider one (`p` falls back to `t`, `t` to `d`).
    `{layout}:off` removes the anchor at that layout. **`m` (769-1023 px; mobile optimisation, fixer D1, I.151):** site.js
    reads `m`, else `t`, else `d` there, so an anchor without an `m` value behaves at 769-1023 px exactly as when that range
    was part of `t`; `p` never reads `m`, and 1024-1199 px reads `t` as before. Only the title route carries `m` values
    (B.21).
  - `x`: `{n}%` of the host width (may be negative or above 100), `L` (= -1.6%), `R` (= 101.6%), `CL{+|-}{n}` /
    `CR{+|-}{n}` (the left / right content edge of the host's first `:scope > .container`, plus or minus n px).
    **Departure:** DESIGN-SPEC writes `C+n`/`C-n`; the edge is named so the grammar is unambiguous (gap I.17).
  - `y`: `{n}%` of the host height, `{n}px` from the host top, or `{n}%{+|-}{m}px` (declared extension: bottom-relative
    anchors such as `100%-148px` need it).
- **Weave zones** `<i class="rz" aria-hidden="true" data-occluder="{selector}" data-from="{key}" data-to="{key}" data-on="{layouts}"></i>`,
  direct children of the occluder's section, beside its anchors. The occluder is
  `zone.parentElement.querySelector(sel)` (the first match inside that section); it must be a frame or a plate (never a
  text surface) and it never moves (0.5); both anchors lie outside it at every layout in `data-on` (space-separated;
  default `d t m p`; a list names exactly the layouts it draws at, so the hero frame's `p` and a plate's `d t` do not
  draw at `m`, I.151).

site.js:
- Builds after `load` plus one `requestIdleCallback` (fallback: a 200 ms timeout); rebuilds only when `#page`'s width
  changes or its height changes by more than 2 px (ResizeObserver, 150 ms debounce). Never per scroll frame; never
  animated, in any mode (reduced motion draws it as usual).
- Geometry: a centripetal Catmull-Rom spline through the resolved anchor points (coordinates relative to `#page`),
  sampled every 10 px. **Anchor hosts and their `.container` edges are measured as layout boxes**: `offsetLeft` /
  `offsetTop` summed up the `offsetParent` chain to `#page`, and `offsetWidth` / `offsetHeight`, never
  `getBoundingClientRect()`. Layout boxes ignore `transform` and the individual `translate` property, so the state of a
  reveal, a parallax or a tilt at build time cannot move an anchor. This matters because the river is built once, after
  `load`, and is not rebuilt when a reveal ends: the CTA band hosts anchor `q1` and is itself `.rv` (B.24), so it sits at
  `translate: 0 26px` when the river is built, and a client-rect reading would leave the river 26 px off near the band
  for the life of the page (gap I.43). **Occluders** are measured with `getBoundingClientRect()`, minus `#page`'s own
  client rect (fractional, so the clip meets the frame's real edge, B1): an occluder never moves (0.5), and no ancestor of an
  occluder is transformed or `.rv` (true of all three: `.frame__clip`, `.alumier__card`, `.titleband__frame`; keep it
  so). Corner radii come from `getComputedStyle(occluder)`.
- Horizontal containment: anchors resolve outside their host (`R` = 101.6%, 103.5-104%, -7%) and the glow strand is 150
  px wide, so `div#page` carries `overflow-x: clip` (A.3). The SVGs may keep `overflow: visible`.
- Under SVG: every strand (glow 150 px @ .16, glow2 96 @ .20, mist 56 @ .13, mist2 34 @ .15, body 18 @ .24, core 8 @ .30,
  teal 2.4 `#13a89e` @ .85 and navy 1.6 `#1e2c70` @ .50 braided by a sine at -9 / +9 px, amplitude 5, period 170, white
  light 1.6 @ .90 offset toward the upper left), each `<path data-strand="{name}">`; gradients `ru-glow`, `ru-mid`,
  `ru-body` in user space over the page height (teal, sky, violet, teal, sky, ending `#95d8d3`). **At `p` every strand is
  drawn at 0.6 of these widths** (glow 90, glow2 57.6, mist 33.6, mist2 20.4, body 10.8, core 4.8, teal 1.44, navy and
  light 0.96; mobile optimisation, M-LOOK-13 = operator option 5b, I.149): the river keeps its desktop proportion on a
  phone screen; `m`, `t` and `d` draw the spec widths.
- Over SVG: per zone, only the arc-length stretch between `data-from` and `data-to`, only the strands of 18 px or less
  by their spec width (body, core, teal, navy, light; at `p` drawn at 0.6 like the under copy), inside `<clipPath id="ro-clip-{n}">` = the occluder's border box with its four
  computed corner radii (an arch, whose top radii are 999 px, becomes a path); gradients `ro-*`. No rectangle clip exists
  anywhere (B1).
- Writes `#page[data-river]` = `{"anchors":n,"zones":n,"samples":n,"ms":n}` after each build (debug, read by probes).
- Sizes each SVG with `width`/`height` = `#page`'s box (and the matching `viewBox`) at every build; the CSS gives them no
  percentage size. **Integrate stage (gap I.81):** with `.river { width: 100%; height: 100% }` every `#page` height change
  (an accordion opening, the carousel's height) rescaled the stale drawing (`xMidYMid meet` centring) until the 150 ms
  debounced rebuild: opening one FAQ item on the dry-eye page moved the river in the title band down 41 px for about
  1 s, and the over copy's clip with it, away from the arch it must meet (B1). Sized by the attributes, it stays put.
- No JS: no river, nothing else changes. `forced-colors: active`: CSS hides both SVGs and the field.

### 1.9 Hero loop loader and its toggle (DESIGN-SPEC A3, U3, G17, 7; IMAGE-PLAN 7; motion-plan.json)

Hook: `div.hero__light[data-video]` (home only) with `data-src-webm`, `data-src-mp4` (769 px and up), `data-src-phone`
(the phone MP4) and `data-media-phone="(max-width: 768px)"`. Title bands carry `div.hero__light` **without**
`data-video`: the still only, never a video (U3).

After the window `load` event and only if none of these hold: reduced motion,
`navigator.connection.saveData`, `navigator.connection.effectiveType` in `slow-2g` / `2g` / `3g`,
`matchMedia('(prefers-reduced-data: reduce)')`, or no `figure.hero__frame` to hold the toggle (no moving video without
its pause control, WCAG 2.2.2). Then create `<video muted loop playsinline preload="none"
aria-hidden="true" tabindex="-1">` (never `autoplay`; `preload="none"` because `play()` starts the download anyway, and a
`play()` the browser refuses then fetches nothing: gap I.14g), append `<source>`s for the current media (WebM then MP4
at 769 px and up; the phone MP4 below), append it to `div.hero__light`, call `play()` when the IntersectionObserver
(threshold 0) reports it on screen (its first delivery included) and `pause()` when it reports it off screen, catch the
rejection (a `NotAllowedError`, the browser refusing, e.g. a low-power mode, removes the video and the toggle, so the
poster stays: gap I.55), add `is-playing` on the first `playing` event (CSS fades it in over the poster), and on a
`matchMedia(data-media-phone)` change swap the sources and `load()` (removing `is-playing` until it plays again).
Reduced motion turning on at runtime pauses and removes the video and the toggle; turning off creates them again unless
the visitor had paused the loop.

**The toggle (declared addition, WCAG 2.2.2; DESIGN-SPEC has no pause control: gap I.9).** When, and only when, the
video element is created, site.js appends it to `figure.hero__frame` as its last child. It is **out of flow**
(`position: absolute; top: 12px; right: 12px; z-index: 1` inside the figure, which is `position: relative`), over the frame's photo at its top-right
corner: away from the glasses (the lower-left corner) and from the phone weave stretch (it enters the frame through its
right edge at about two thirds of the frame's height, B.4); A-13 and A-14 check both. Because it is created after `load`,
an in-flow toggle would push the phone frame and the intro card's h1 down by its height plus a gap (about 56 px) when the
video starts, which A-11 (the h1's top equal at 0.5, 3 and 15 s at 390x844) and the CLS budget forbid (gap I.44). Out of
flow, it moves nothing. DOM order keeps it after the CTA, so the focus order is statement, CTA, toggle:

```html
<button class="roundbtn roundbtn--ghost hero__toggle" type="button" aria-label="Pause background video">
  <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-pause"/></svg>
</button>
```

A click on the pause state: `video.pause()`, `div.hero__light.is-paused`, `aria-label="Play background video"`, icon
`#i-play`; a click on the play state does the reverse. The button always shows and names the action it performs (it acts
on the state it shows). While `is-paused`, the IntersectionObserver never resumes the video. No JS, reduced motion,
Save-Data or a slow connection: no video, no toggle.

### 1.10 Forms (DESIGN-SPEC 3.25; BUILD-NOTES 5.5)

| hook | on | site.js does |
|---|---|---|
| `[data-show-if="{name}={value}"]` | 2 fields of the contact form (`f10-4=Email`, `f10-4=Call`) | on start and on every `change` inside the form: `el.hidden = (form.elements[name].value !== value)` (`RadioNodeList.value` is the checked radio's value, `""` when none) |
| `form.form[data-needs-backend]` | both forms | **cancels every submit** (QA round 1, CONTENT-1, register I.L): native constraint validation runs first, then site.js calls `preventDefault()` on the `submit` event, so nothing is sent and every typed value stays. The form's own `method="dialog"` (E) already sends nothing without JavaScript; the cancel also covers a browser that reads an unknown method as GET. **Dormant notice hook:** if the enclosing `div.form-card` holds a `p.form__notice[hidden]` (E.4: printed before the form, only when the model carries a decided notice), the same handler removes its `hidden` (gaps I.14e, I.24). Before QA round 1 the forms were `method="post"` and a valid submit posted every field to the page itself |
| `p.field__error[hidden]` | every field | never un-hidden (its text is empty; any message would be authored copy) |

No JS: conditional fields show (the markup carries no `hidden` on them).

### 1.11 Behaviours that are CSS only (no script)

The sticky location card (G1: `(min-width: 1024px) and (min-height: 860px)`), the sticky doctor portrait (R5),
the top bar scrolling away (sticky header with a negative `top`), dropdown hover opening, accordion open and close
(`<details>` with `::details-content` / `interpolate-size`, DESIGN-SPEC 3.26), the scroll lock of the open drawer, and
every focus ring. The build brief lists "the sticky hours card" among script behaviours (gap I.14d): it needs no script.

### 1.12 What site.js never does

Write a measured value into a size property of the measured element or of anything that sizes it (D1); start a timer
that reveals content while the observer works; run an infinite animation or animate `filter`; add a second scroll
listener; touch `<details>`; create a button, a dot or text that this section does not declare (the dots, the hero
toggle); read any `data-*` not listed in 0.4; read `src/content/*.json` or any model file (it only reads the DOM).

### 1.13 Deferred embeds (QA round 1, PERF-6; D.7 item 7)

| hook | on | site.js does |
|---|---|---|
| `iframe[data-src]` | a YouTube embed of model prose (the eye-emergencies page) | an IntersectionObserver with `rootMargin: '600px 0px'`: the first time the frame is within 600 px of the viewport, `src` is set to `data-src` and the frame is unobserved; without IntersectionObserver `src` is set at once. Without JS the `<noscript>` copy (the plain `loading="lazy"` iframe) loads |

Why: Chrome's own `loading="lazy"` distance for iframes (about 2,500 px below the fold, measured by the perf verifier)
fetched the embed at page load, with no scrolling, at 1440x900, 1920x1080, 1366x657 and 768x1024 (A-3, DESIGN-SPEC 7
"third parties").

---

## A. Page shell

### A.1 Head, in this order

```html
<!doctype html>
<html lang="{head.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{metaDescription.text}">                       <!-- ? text not null (127 of 149; 140 before QA round 1, CONTENT-3: the 13 archives no longer carry their first post's) -->
<link rel="canonical" href="{canonical}">                                          <!-- ? not on 404.html (148 of 149; QA round 1, CONTENT-14) -->
<meta name="robots" content="{robots}">
<meta property="og:type" content="{og.type}">
<meta property="og:site_name" content="{og.siteName}">
<meta property="og:title" content="{og.title}">
<meta property="og:description" content="{og.description}">                      <!-- ? not null (127 of 149; CONTENT-3) -->
<meta property="og:url" content="{og.url}">                                        <!-- ? not on 404.html (CONTENT-14) -->
<meta property="og:image" content="{og.image}">                                    <!-- the source's own JPEG or PNG, as a byte-identical copy (QA round 1, CONTENT-16), else the logo -->
<meta name="twitter:card" content="{twitter.card}">
<meta name="twitter:title" content="{twitter.title}">                            <!-- ? not null (132 of 149) -->
<meta name="twitter:description" content="{og.description}">                    <!-- ? og.description not null (127 of 149; QA round 1, CONTENT-4: the source printed it on 148 pages, equal to its og:description) -->
<meta name="twitter:image" content="{twitter.image}">
<link rel="{f.rel}" href="{f.href}" sizes="{f.sizes}" type="{f.type}">             <!-- … each head.favicon[] (3 on every model) -->
{head.jsonLdHtml}
<link rel="preload" href="{up}theme/fonts/atkinson-next-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{up}theme/fonts/rfec-figures.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="{lcp.url}" imagesrcset="{lcp srcset [P1]}" imagesizes="{lcp sizes}" media="{lcp.media}" fetchpriority="high">   <!-- … one per ctx.lcp entry, each with its own media (the LCP rule below) -->
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="{head.stylesheets[0]}">
<script src="{head.scripts[0]}" defer></script>
</head>
```

- Every value prints exactly as the model gives it (BUILD-NOTES 5.8.3); `head.jsonLdHtml` is already one complete
  `<script type="application/ld+json">` (149 of 149; census: `script[type]` 149) and prints verbatim, never rebuilt.
  `robots` is always set (149); `og.image` and `twitter.image` are always set (149).
- `{head.stylesheets[0]}` [P2]: the one fingerprinted, concatenated stylesheet (the shipped layers of
  `src/styles/{tokens,fonts,riverlight,motion}.css`). The models list `theme/riverlight.<8 hex>.css` (wf5b, BUILD-NOTES 11; the
  scaffold's `styles/scaffold.css` is retired, I.72). One stylesheet, one script; nothing else is linked.
- `{head.scripts[0]}` [P2]: the fingerprinted `site.js`, page-relative. A model field since wf5b (gap I.12): print every entry
  of `head.scripts` (one on the design theme, none on the scaffold), never a guessed name.
- Fonts [P2]: `dist/theme/fonts/`; two faces only, Atkinson Hyperlegible Next and RFEC Figures, no display face (DESIGN-SPEC 2.2; gap I.14f). The italic file is not preloaded (fetched on the first `em`/`i`/`cite`).
- **Inline `js` one-liner. Departure** from "the script adds `js` first thing" (DESIGN-SPEC 8): site.js is deferred, so
  a first paint can happen before it runs, and the no-JS layout (the main nav as a wrapped list on phones) would then
  snap to the JS layout, a shift A-11 forbids (gap I.16). The one-liner sets the class before first paint; site.js sets it again.
  It is not a file, so the one-deferred-file budget (DESIGN-SPEC 7) holds; it is the page's only executable inline script.
- **LCP rule** (`head.lcp` is always null, "reserved"; the template decides). Since QA round 1 (PERF-4, register I.L),
  measured: the preload and `fetchpriority="high"` go to the element that IS the LCP. The home preloads its glasses
  cut-out (`hero-cutout`, `gen-h1`; the hero frame photo stays eager without priority); every page with a title band
  preloads the band's poster, twice with `media` (`hero-river-poster.webp` from 769 px, `hero-river-poster-phone.webp` to
  768), and the poster `img` carries `fetchpriority="high"`; the arch image stays eager without priority. Before: the
  hero frame photo and the arch image, which were never the LCP element. `imagesizes` equals the `sizes` of that `<img>`
  where a srcset exists, including the phone density cap's twins (0.8; mobile optimisation, M-SPEED-1, I.135): head()
  runs the same `capSizes()` on the same srcset and slot sizes, so the preload and the img pick one file (no double
  fetch on the 20 family pages at 390x844@3, 360x800@3 and 412x915@2.625, BUILD-NOTES 15.2). `dist/404.html`: the build's `rootRelative()` rewrites `href`, `src`, `poster`, `srcset` and `imagesrcset`
  to root-relative URLs under the deploy base (`RFEC_BASE`, default `/`; src/build.mjs; BUILD-NOTES 1 and 10, D7), so
  the preload needs nothing special; it does **not** rewrite `data-*` URLs, and there are none on that
  page (the hero loop exists only on the home).
- Nothing else goes in the head: no `theme-color`, no third-party tag, no `preconnect`.

### A.2 Body classes per family

`<body class="page-{family} {tpl} [has-aside]">` (computed from `model.family` and `model.aside`; 149 models)

| family (`model.family`) | models | `{tpl}` | `has-aside` |
|---|---|---|---|
| `home` | 1 | `tpl-home` | no |
| `interior` | 73 | `tpl-article` | yes (73) |
| `blog-post` | 21 | `tpl-article` | yes (21) |
| `blog-index` | 1 | `tpl-article` | yes |
| `archive` | 17 | `tpl-article` | yes (17) |
| `team-member` | 11 | `tpl-article` | yes (11) |
| `testimonial` | 1 | `tpl-article` | yes |
| `location` | 1 | `tpl-article` | yes (`aside.variant` `location-page`) |
| `form` | 2 | `tpl-article` | yes (2) |
| `legal` | 3 | `tpl-article` | yes (3) |
| `sitemap` | 1 | `tpl-article` | yes |
| `not-found` | 2 (`/404-page-not-found/` and `404.html`) | `tpl-article` | `/404-page-not-found/` yes; `404.html` **no** (its model has `aside: null`, gap I.8) |
| `builder-hub` | 9 | `tpl-hub` | no |
| `template` | 6 | `tpl-hub` | no |

`has-aside` follows `model.aside !== null` alone (132 models), never the family.

### A.3 Body order, skip link, landmarks, decorative layers

```html
<body class="page-interior tpl-article has-aside">
<svg class="sprite" aria-hidden="true" focusable="false">{the symbols the page uses}</svg>
<a class="skip" href="{chrome.skip.href}">{chrome.skip.label}</a>
<div class="aurora-field" aria-hidden="true">
  <div class="aurora-field__layer aurora-field__layer--dawn"></div>
  <div class="aurora-field__layer aurora-field__layer--day"></div>
  <div class="aurora-field__layer aurora-field__layer--dusk"></div>
</div>
<header class="site-header">{B.1 top bar}{B.2 navbar}</header>
<div class="page" id="page">
  <svg class="river river--under" aria-hidden="true" focusable="false"></svg>
  <svg class="river river--over" aria-hidden="true" focusable="false"></svg>
  <main id="main" tabindex="-1">
    {tpl-home: the home sections, B.16}
    {tpl-article: section.titleband (B.21) + div.layout (C.1)}
    {tpl-hub: section.titleband (B.21) + the hub sections (C.7)}
  </main>
  <footer class="site-footer aurora-deep" data-band>{B.19}</footer>
</div>
<dialog class="drawer" id="drawer" aria-label="Menu" data-close-at="(min-width: 1200px)">{B.2 drawer}</dialog>
</body>
```

- **Skip link** (`a.skip`): the first focusable element (the sprite before it is not focusable); text and target from
  `chrome.skip` ("Skip to main content", `#main`); shown on focus as a navy pill at the top left (z 200). `main` carries
  `tabindex="-1"` so the skip target takes focus (scaffold precedent). The prototype's `#content` target is not used (the
  model says `#main`).
- **Landmarks** (DESIGN-SPEC 8): `header.site-header` (banner) holding `nav.mainnav[aria-label="Main"]`; `main#main`;
  inside it, on `tpl-article` pages, `aside.sidebar` (complementary, labelled by `#loc-title`; unlabelled on the location
  page); `footer.site-footer` (contentinfo) holding `nav.footer__menu[aria-label="Footer"]`; inner navs
  `nav.crumbs[aria-label="Breadcrumb"]` and, inside the dialog, `nav[aria-label="Mobile"]`. No `section` carries an
  accessible name (so none becomes a region landmark), except the reviews carousel `section.carousel` (APG carousel
  pattern, B.15). The prototype's `aria-labelledby` on its sections and title band is not kept.
- **Aside inside main.** DESIGN-SPEC 4.2 places the `aside` in `div.layout` inside `main`, so the grid can place it
  beside the article and the CTA band across row 2 without subgrid. This contract follows the spec. Gates: none is
  affected (the sidebar is chrome in every gate's source region, and extra links, headings and words in the rebuilt
  `<main>` are never findings). Known consequence: axe's best-practice rule `landmark-complementary-is-top-level` flags
  it; it is not a WCAG failure (gap I.21).
- **Exactly one `h1`**: `h1#page-title` in the title band, or the home's s3 heading in the intro card (BUILD-NOTES
  5.8.1). Model HTML holds no `h1` in any rendered field (census: `h1` 0 rendered; its 1 occurrence is the derived
  home `prose` view, which is never rendered).
- **Decorative layers and `aria-hidden`:**

  | layer | element | placement | hidden from AT |
  |---|---|---|---|
  | icon sprite | `svg.sprite` | first child of `body` | `aria-hidden="true" focusable="false"` |
  | aurora field | `div.aurora-field` + 3 `div.aurora-field__layer` | after the skip link, before the header; `position: fixed`, `z-index: -1` | `aria-hidden="true"` |
  | river | `svg.river--under`, `svg.river--over` | the first two children of `div#page`, absolutely positioned at its top-left; each build sizes them to `#page`'s box with the `width`/`height` attributes, and CSS never sizes them (I.81) | `aria-hidden="true" focusable="false"` |
  | route anchors, weave zones | `i.ra`, `i.rz` | direct children of their host, after its band layers and before its `.container` (1.8) | `aria-hidden="true"` (zero-size, `visibility: hidden`) |
  | hero light, band still | `div.hero__light` | first child of `section.hero` / `section.titleband` | `aria-hidden="true"`; its `img` `alt=""` |
  | banks | `svg.bank` | last child of the hero and the title band; first child of the lavender band and the footer | `aria-hidden="true" focusable="false"` |
  | band layers | `div.services__band`; `figure.section__bg` (a row background that stays a band background, C.7) | first children of their section | `div.services__band[aria-hidden="true"]`; `figure.section__bg` holds only an `alt=""` image (no attribute on the `figure`: the alt-fidelity gate matches `<figure class="section__bg">` exactly) |
  | doctor plate | `div.doctor__plate` | inside `figure.doctor__portrait` | `aria-hidden="true"` |
  | cut-outs, cataract lens, added ambient art | `img.protrude`, the `img` in `figure.cataract__lens`, ambient `art` images | in their container | `alt=""` (decorative) |

- **No-JS** (DESIGN-SPEC 8): the shell is identical; CSS keys the no-JS layout on `html:not(.js)` (the main nav wrapped,
  every `ul.sub` shown as a nested list, `.menu-toggle` hidden, nothing reveal-gated, no river, no video, no toggle).
- **Forced colours** (`@media (forced-colors: active)`): CSS hides `.aurora-field`, both rivers, `div.hero__light` and every
  `svg.bank`; the markup is unchanged.
- **Horizontal containment (A-2, A-4).** The design draws on purpose past its boxes: river anchors resolve at -7% to 104%
  of their hosts with a 150 px glow strand (1.8), cut-outs and breakouts cross frame and band edges, and tilted cards
  transform near the container edge. `div#page` therefore carries `overflow-x: clip` (with `overflow-y` left visible), so
  none of it can widen the page (A-2: `scrollWidth <= clientWidth`). It is `clip`, never `hidden` or `auto`: those make
  `#page` a scroll container, and the sticky location card (B.23) and doctor portrait (B.10) inside it would stop
  sticking. The rule sits on `#page`, not on `body` or `html`, because an `overflow` value set there propagates to the
  viewport (CSS Overflow 3), where `clip` is treated as `hidden`. The prototype used `body { overflow-x: clip }`; this is
  the declared refinement (gap I.45). Nothing outside `#page` overflows: the header, the skip link and the
  `position: fixed` aurora field (`inset: -12vh 0`) are viewport-wide at most, and the drawer is in the top layer.

### A.4 What the shell never prints

The `prose`, `embeds`, `declared`, `links`, `images` (as a list), `placeholders` (as a list), `forms` (as a list), any
`why`, `node`, `label` (a section navigation aid), `ctas`, `images[].src`, `placeholders[].src`, `declared[].src`,
`docs.items[].sourceHref`, `cherry.scriptSrc`/`fontsHref`/`snippet` (link mode), `class` of image entries,
`chrome.financing.why`, `jsonLd` (the object; `head.jsonLdHtml` is the printed form). BUILD-NOTES 5 invariant 3 and 5.8.7.

---

## B. Components (DESIGN-SPEC section 3)

Coverage: every spec component 3.1-3.31 is one subsection B.1-B.31 below, same number; B.0 holds the shared controls.
Each subsection gives: **Model** (fields by their model names; [P1] [P4] marked), **Markup**, **Images**, **Depth** (the
z-plane classes of 0.5 and the `data-depth` rate of 1.4), **Reveal / hover**, **Responsive** (the sweep sizes; "s" = the
short-desktop mode, which 1280x585 is in), and for every protrusion **No-occlusion** (crossing token, reservation with
the same token, parallax budget, probe hooks).

**`sizes` rule for every image slot (DESIGN-SPEC 7).** Each slot below states its frame width per layout (`Wd`, `Wt`,
`Wp`) and its frame aspect `fh/fw`. The template computes, per image, `k = max(1, (fh / fw) * (w / h))` (the cover
factor; 1 for `contain` slots) and prints `sizes="(min-width: 1200px) {k*Wd}, (min-width: 769px) {k*Wt}, {k*Wp}"`
(numbers rounded to whole px or two decimals of vw; `calc()` where a width mixes units). A slot whose image is never
cropped uses `k = 1`.

### B.0 Shared controls (DESIGN-SPEC 3.31 `cta`, 6.4)

```html
<a class="btn btn--primary" href="{href}">{icon calendar}<span>{label}</span></a>                              <!-- appointment form -->
<a class="btn btn--primary" href="{href}">{icon phone}<span>{label}</span></a>                                 <!-- tel: -->
<a class="btn btn--primary" href="{href}" target="_blank" rel="{rel}"><span>{label}</span>{icon arrow}</a>   <!-- external; target only when newTab -->
<a class="btn btn--secondary" href="{href}"><span>{label}</span>{icon arrow}</a>                              <!-- any other -->
<div class="btn-row">{buttons}</div>                                                                         <!-- a cta block; a callout's buttons -->
<p class="chip">{text}</p>                                                                                   <!-- G18 position / name chip -->
<a class="more" href="{more.href}" aria-label="{more.ariaLabel}">{more.label}</a>                              <!-- "Read More"; aria-label only when given -->
```

- **Model button** `{ label, href, path, external, newTab, rel }` (`cta.buttons[]`, `callout.buttons[]`: 21 cta buttons
  and 14 callout buttons on 149 models). Variant by target, exactly DESIGN-SPEC 3.31: `path` =
  `/contact-us/appointment-request-form/` (20 here) or `href` starting `tel:` (3) → `btn--primary` with the calendar /
  phone icon before the label; `external` (3) → `btn--primary` with the arrow after the label, `target="_blank"` only when
  `newTab` (2), `rel` = the model `rel` plus `noopener` when `newTab`; any other (9) → `btn--secondary` with the arrow. A
  component may fix the variant (its subsection says so). Label and target are never changed.
- `btn` is 50 px tall, `btn--lg` 56 px; every button is 44x44 or larger (A-9); full width at n (`btn--lg` and the form
  submit).
- **A label that wraps grows the pill (QA round 1, regressions REG-B1, I.118):** the block padding is `.34375em` (11/32
  em: 5.5 px at the default 16 px, 5.84 px for `btn--lg`), the inline padding stays 24 / 30 px (above 420 px; the phone
  values are the next item), the line height 1.15 and
  the overflow clip (the sheen needs it). At the default font the 50 / 56 px minimum absorbs the padding for a one- or
  two-line label, so those render exactly as before; a label of three lines or more, or any label at a larger browser
  font, makes the pill taller instead of letting its text box (the font's ascent + descent, about 1.3em, taller than the
  1.15 line) run past the clip. The radius is `min(var(--r-pill), calc(26px + .75em))` (38 px at the default font,
  paint only): a one- or two-line pill keeps its round ends at every Chrome font size swept (16-32 px: its half height
  is under the cap), and a pill of three lines or more rounds its corners, so its ends never cut the first or last line
  (the 6-line address button of `/template/header/` at font 32 on a 390 px phone lost the top of its first letter with
  plain `--r-pill`). At the default font the cap reaches one button, that address at 320 px (4 lines, radius 38, was
  42.3). Measured: `tmp/wf6/reg/p/btn-sweep.mjs`, the verifier's `clip-sweep.mjs` and `tmp/wf6/reg/close/ink-test.mjs`
  (BUILD-NOTES 14).
- **Phone labels (mobile optimisation, M-LOOK-4 + M-LAYOUT-2, I.127):** up to 768 px a label that wraps is balanced
  (`.btn > span, .qa > span { text-wrap: balance }`), so a two-line label no longer ends on one word ('Read About
  Insurance Plans We / Accept' → 3 + 3 words). Up to 420 px the inline padding is `clamp(16px, calc(1.5em - 8px), 24px)`
  and the icon gap `clamp(8px, .5em, 10px)` (`btn--lg`: `clamp(18px, calc(1.5em - 7.5px), 30px)`): 16 / 8 / 18 px at the
  default font, back to 24 / 10 / 30 px by a Chrome font of 24 px, so the large-font pills REG-B1 verified keep their
  padding. With the tighter phone insets of the hub intro (C.7), the CTA panel (B.24), the sidebar quick actions (B.23),
  the doctor text (B.10) and the reviews panel (B.15), the labels hold one line wherever the width allows: wrapped labels
  14 → 4 at 360, 13 → 4 at 375, 4 → 2 at 390 on the 25 checked pages, none ending on one word from 360 px; at 320
  'SCHEDULE AN APPOINTMENT', 'Schedule Appointment' and 'Learn More About Cataract Co-Management' still wrap (wider than
  the widest pill there), balanced. Heights, the 44 px minimum and the block padding are unchanged (BUILD-NOTES 15.1).
- **`div.btn-row`** (a `cta` block, a callout's buttons): `display: flex; flex-wrap: wrap; gap: 12px; align-items: center`
  (the prototype's 12 px action gap). **Responsive:** button heights are the same at every sweep size; at 360 / 390 (n)
  `btn--lg` and the form submit fill their row and every other button keeps its content width, wrapping to a new line
  when the row is full; at 768 / 1024 / 1280x585 / 1440 / 1920 every button keeps its content width, side by side.
- Hover: the sheen band (`::after`, `translateX(-110%)` to `110%`, `--dur-slow`), lift 2 px, a glow ring (teal 4 px .22 on
  primary, sky on secondary, teal-200 on light), darker fill. Focus: the same plus a 3 px ring offset 3 px (`--navy-700`
  around teal buttons, `--teal-200` on navy). Reduced motion: no sheen, no lift.
- **Hover on touch phones (mobile optimisation, M-TOUCH-4, I.133).** A phone applies `:hover` to what it taps and keeps
  it until the next tap elsewhere, so the controls that stay on the page after a tap kept their hover look. The hover
  half of the `btn--primary / --secondary / --ghost / --light` fills and rings, the sheen (`.btn::after`, motion.css),
  `roundbtn--navy / --teal / --ghost` (menu, close and hero-video buttons, the round call and appointment links),
  `.dnav__toggle`, the carousel dot (B.15) and the FAQ question (B.26) is applied under `@media (hover: hover),
  (min-width: 1024px)`; the `:focus-visible` half applies everywhere as before. That media query is true on every screen
  1024 px and wider and on any mouse-driven one, so desktop renders exactly as before (a real mouse hover at 1280x800,
  1024x768 and 800x600 reads the same computed styles on both builds); a touch phone keeps the rest look after a tap.
  The lifts (`@media (hover: hover)`) were guarded already. Links that navigate keep their unguarded hover (the tap leaves
  the page).
- `{icon x}` = the 0.7 sprite use; the label is always in a `span` (the icon never carries the name).
- Fixed variants used by components: `btn--light` (footer, CTA band appointment), `btn--ghost` (drawer phone action),
  `btn--lg` (hero CTA, CTA band).
- **Targets (A-9, U2): the rule, binding for templates, styles and the A-9 probe.**
  1. *Inline text link (exempt):* an `a` that is `display: inline` and whose nearest block (`p`, `li`, `td`, `dd`,
     `address`, `blockquote`, `figcaption`, `h1`-`h6`; else its parent) holds other text besides the link, not counting
     `aria-hidden` text (so a crumb link, whose `li` holds only the hidden " » ", is not exempt). Its size is set
     by the line-height of that text (the WCAG 2.5.8 inline exception), e.g. a link in a model sentence, or the location
     card's "Phone:" / "Email:" rows (`ul.contact`, B.23, F.8).
  2. *Stretched link:* an `a.card__link` is measured by its card (`closest('.card, .callout, .post, .member,
     .childcard')`), because its `::before` makes the whole card the hit area (B.8); every such card is at least 44x44 at
     every width. A radio or checkbox is measured by its row (`closest('.choice, label')`, 44 px tall: the label is
     clickable, E.3, D.8).
  3. *Every other link and control is at least 44x44 CSS px at every width.* Controls: `btn` 50 px and `btn--lg` 56 px,
     `pill` 44 px, `roundbtn` and `mainnav__toggle` 44x44, `dnav__toggle` 48x48, `social__link` 44x44, `qa` 52 px, carousel
     dots 44x44, `summary` 56 px, form controls 48 px, `a.skip` 44 px or more when shown, `a.mapcard` 150 px (the
     prototype's). Nav rows keep the prototype's sizes (`mainnav__link` and `ul.sub a` 44 px, `ul.dnav a` 50 px,
     `ul.dnav__sub a` 44 px), `archive-row__link` 56 px. Standalone links get `display: inline-flex;
     align-items: center; min-height: 44px`: `a.more`, `.footer__financing a`, `.doctor__tag a`, `.loc__title a`,
     `.visit__title a`, `.testimonial__title a`, `.sitemap__link`, the crumb links, the footer menu and legal links, and,
     added by this verification (gap I.46): `.topbar__where a` (the address sentence is the whole paragraph; the usability
     judge measured the prototype's at 375x38), `.section-title a` (a model heading whose whole text is a link: the home's
     s11, s13 and s16 headings, about 31 px tall at 390), `.trio__title a`, `p.callout-title a`, the title link of a hub
     callout (C.7), and `.rich .link-line > a` (a model `p` or `li` whose whole text is one link, marked by the D.6
     link-line enhancer: 9 on 7 models).

### B.1 Top bar (3.1)

**Model:** `chrome.topbar.address` `{label, href}`, `chrome.topbar.appointment` `{label, href}`, `chrome.topbar.call`
`{label, href}`.

```html
<div class="topbar">
  <div class="container topbar__inner">
    <p class="topbar__where"><a href="{chrome.topbar.address.href}">{chrome.topbar.address.label}</a></p>
    <div class="topbar__actions">
      <a class="pill pill--ghost" href="{chrome.topbar.appointment.href}">{icon calendar}<span>{chrome.topbar.appointment.label}</span></a>
      <a class="pill pill--ghost" href="{chrome.topbar.call.href}">{icon phone}<span>{chrome.topbar.call.label}</span></a>
    </div>
  </div>
</div>
```

- First child of `header.site-header`. It is not sticky itself: `.site-header { position: sticky; top: calc(-1 *
  var(--topbar-h)) }` lets it scroll away while the navbar sticks (1.1).
- **Depth:** chrome (header z 50). **Reveal:** never. **Hover/focus:** the address link is underlined and turns
  `--teal-200` on hover; pills fill `--teal-700` on hover and focus; 3 px `--teal-200` focus ring.
- **Responsive:** 360 / 390: centred, the sentence wraps to 2-3 lines at 13 px, pills hidden. 768: centred, 2 lines,
  pills hidden. 1024: the sentence left, the two pills right (44 px tall), the sentence may wrap. 1280x585 / 1440 / 1920:
  one line, 44 px (`--topbar-h` 44 px), no `max-width` on the sentence (the prototype's `46ch` cap is not kept).

### B.2 Header, nav, dropdowns, drawer (3.2)

**Model:** `chrome.logo` `{url, w, h, alt, href, homeLabel}`; `chrome.mobile` `{media, logo {url, w, h, alt, href},
appointment {label, href, newTab}, call {label, href}, menuToggle, menuOpen, menuClose}`; `chrome.nav[]`
`{label, href, path, current, inSection, children[]}` (6 items, 3 with children, 9 children; `current` and `inSection`
both occur on top-level items and on children: top `inSection` 74, top `current` 6, child `current` 9, child
`inSection` 6 across the models); `chrome.topbar.appointment`, `chrome.topbar.call` (drawer actions).

```html
<div class="navbar">
  <div class="container navbar__inner">
    <a class="brand" href="{chrome.logo.href}" aria-label="{chrome.logo.homeLabel}">
      <picture>
        <source media="{chrome.mobile.media}" srcset="{chrome.logo.url} {chrome.logo.w}w, {chrome.mobile.logo.url} {chrome.mobile.logo.w}w" sizes="145px" width="{chrome.mobile.logo.w}" height="{chrome.mobile.logo.h}">   <!-- QA round 1 (PERF-14, I.110) -->
        <img src="{chrome.logo.url}" srcset="{chrome.logo.url} {chrome.logo.w}w, {chrome.mobile.logo.url} {chrome.mobile.logo.w}w" sizes="180px"
             alt="{chrome.logo.alt}" width="{chrome.logo.w}" height="{chrome.logo.h}" decoding="async">
      </picture>
    </a>
    <nav class="mainnav" aria-label="Main">
      <ul class="mainnav__list">
        <li class="mainnav__item [is-section]"><a class="mainnav__link" href="{item.href}" [aria-current="page"]>{item.label}</a></li>       <!-- … item without children -->
        <li class="mainnav__item has-sub [is-section]">                                                                                     <!-- … item with children -->
          <a class="mainnav__link" href="{item.href}" [aria-current="page"]>{item.label}</a><button class="mainnav__toggle" type="button" aria-expanded="false" aria-controls="sub-{n}" aria-label="{item.label} submenu">{icon chev}</button>
          <ul class="sub [sub--end]" id="sub-{n}">
            <li [class="is-section"]><a href="{child.href}" [aria-current="page"]>{child.label}</a></li>                                 <!-- … -->
          </ul>
        </li>
      </ul>
    </nav>
    <div class="mobilebar">
      <a class="roundbtn roundbtn--navy" href="{chrome.mobile.appointment.href}" target="_blank" rel="noopener" aria-label="{chrome.mobile.appointment.label}">{icon calendar}</a>
      <a class="roundbtn roundbtn--teal" href="{chrome.mobile.call.href}" aria-label="{chrome.mobile.call.label}">{icon phone}</a>
      <button class="roundbtn roundbtn--ghost menu-toggle" type="button" aria-label="{chrome.mobile.menuToggle}" aria-expanded="false" aria-controls="drawer">{icon menu}</button>
    </div>
  </div>
</div>
```

- **State from the model:** `current: true` → `aria-current="page"` on that link (top level or child); `inSection: true`
  → class `is-section` on its `li` (no ARIA). Both get the same visual state (lavender pill + underline, G15).
  **Departure** from the prototype, which put `aria-current="page"` on the parent too (gap I.28).
- **Toggle names.** Both toggles (`mainnav__toggle`, `dnav__toggle`) are named by `aria-label="{item.label} submenu"`,
  with no text inside but the icon. **Departure** from DESIGN-SPEC 3.2 (and the prototype), which name them with visually
  hidden text: words-added counts visually hidden text nodes, and the word "submenu" is in no source page, so a
  `span.vh` would add a finding on each of the 148 pages words-added reads and fail A-1 (gap I.41). The button has no visible label, so the
  `aria-label` cannot break label-in-name (WCAG 2.5.3); the accessible name is unchanged.
- `n` = the 1-based index of the item in `chrome.nav` (here 2, 3, 6). The **last** item with children gets `sub--end`
  (right-aligned panel: Insurance).
- `target="_blank" rel="noopener"` on the round appointment link because `chrome.mobile.appointment.newTab` is true
  (print `target`/`rel` only when it is). `chrome.mobile.menuOpen` ("Open Menu") is not printed (the toggle's name is
  `menuToggle`; the dialog's close button uses `menuClose`).
- **Logo (B4, G13, P3):** `{chrome.logo.url}` and `{chrome.mobile.logo.url}` become the byte-identical PNG copies [P3];
  the models still point at WebP encodes. Both files show the same artwork (both viewed this session: wordmark, wave and
  eye at the same layout), so the `988w` candidate of the desktop `srcset` is the mobile file, as DESIGN-SPEC 3.2 writes it.
  Rendered 180 px wide (73 px tall) from 769 px up, 145 px (59 px tall) at 768 and below; no filter, opacity or blend.

**Drawer** (G2), after `div#page` (A.3):

```html
<dialog class="drawer" id="drawer" aria-label="Menu" data-close-at="(min-width: 1200px)">
  <div class="drawer__panel">
    <div class="drawer__head">
      <img class="drawer__logo" src="{chrome.mobile.logo.url}" alt="" width="{chrome.mobile.logo.w}" height="{chrome.mobile.logo.h}" loading="lazy" decoding="async">
      <button class="roundbtn roundbtn--ghost drawer__close" type="button" data-close aria-label="{chrome.mobile.menuClose}">{icon close}</button>
    </div>
    <nav aria-label="Mobile">
      <ul class="dnav">
        <li [class="is-section"]><a href="{item.href}" [aria-current="page"]>{item.label}</a></li>                                  <!-- … item without children -->
        <li class="dnav__group [is-section]">
          <div class="dnav__row"><a href="{item.href}" [aria-current="page"]>{item.label}</a><button class="dnav__toggle" type="button" aria-expanded="false" aria-controls="dsub-{n}" aria-label="{item.label} submenu">{icon chev}</button></div>
          <ul class="dnav__sub" id="dsub-{n}" hidden><li [class="is-section"]><a href="{child.href}" [aria-current="page"]>{child.label}</a></li></ul>
        </li>
      </ul>
    </nav>
    <div class="drawer__actions">
      <a class="btn btn--primary" href="{chrome.topbar.appointment.href}">{icon calendar}<span>{chrome.topbar.appointment.label}</span></a>
      <a class="btn btn--ghost" href="{chrome.topbar.call.href}">{icon phone}<span>{chrome.topbar.call.label}</span></a>
    </div>
  </div>
</dialog>
```

- The drawer repeats the main nav tree with the same `aria-current` / `is-section` states. The `dialog` is full-viewport
  and transparent; the scrim is its `::backdrop` (`rgb(var(--shade) / .45)`); `.drawer__panel` slides in from the right
  (`min(380px, 88vw)`, white to `--aqua-50`, 380 ms). The drawer logo is decorative (`alt=""`): the dialog is named "Menu"
  and the header logo stays the home link. The prototype's `div.drawer__scrim[data-close]` is replaced by `::backdrop`
  (G2). The close button's name is `chrome.mobile.menuClose` ("Close Menu", a source string), not the prototype's
  "Toggle mobile menu" (gap I.23).
- **Phones (mobile optimisation; everything below 1024 px, the drawer at 1024-1199 px as before):**
  - *The close button opens over the menu button* (MT-R1, I.131): `.drawer__panel { padding-top: max(16px,
    var(--menu-top, 16px)) }`, `--menu-top` written by site.js at open (1.5). At the top of a page the menu button sits
    below the top bar (77 px at 390), so the panel's first row ('Hours & Location') used to open where the menu button
    was and a second tap there navigated away; now the second tap closes. Scrolled (navbar stuck) the value is 16 px or
    less, as before. At 320x568 the panel then scrolls 36 px (its last action 7.5 px below the fold until scrolled); in
    landscape 48-57 px more.
  - *Back after leaving from the drawer* (MT-R2, I.132): the drawer closes on `pagehide`, so the back-forward cache
    restores the page closed and unlocked.
  - *No `<dialog>`* (M-TOUCH-1, I.129; simulated, unverified on WebKit): `dialog.drawer:not([open]) { display: none }`
    repeats the UA rule (a browser without it, Safari 14.1-15.3, laid the closed transparent drawer over every page), and
    under `html.no-modal` (0.3) the nav shows as the no-JS wrapped list with the no-JS rules below the main nav's (menu
    button hidden, header not sticky, `scroll-padding-top: 16px`, `.navbar :is(a, button) { scroll-margin-top: 0 }`).
- **Depth:** chrome (header 50, `.sub` 60, the drawer in the top layer). **Reveal:** never. **Focus never scrolls the page
  from inside the stuck navbar** (integrate stage, gap I.79): `.navbar :is(a, button) { scroll-margin-top: calc(-1 *
  var(--chrome-h)) }`. Without it the stuck navbar sits inside html's `scroll-padding-top`, so each Tab between nav controls,
  site.js's ArrowDown into a panel and its Escape back to the toggle scrolled the page up about 458 px at 1440x900.
- **Hover/focus:** nav links: the `--tint-lav` pill + a 2 px teal-to-navy underline drawn from the left, on hover, focus,
  `aria-current` and `is-section`; dropdown rows `--tint-teal` fill, `--teal-800` text; focus adds the ring.
- **Responsive:** 360 / 390 / 768: the mobile header (145 px logo from `chrome.mobile.logo`, the three round buttons,
  navbar 79 px); the main nav hidden behind the drawer (`html.js`; a wrapped list without JS). 1024: the 180 px logo, the
  menu circle only (the top bar carries the two actions), drawer navigation. 1280x585 / 1440 / 1920: the 180 px logo, six
  items on one row at 15.5 px / 550 with 44x44 toggles, navbar 93 px. If the row does not fit at 1200 the nav breakpoint
  rises to the smallest width that fits, never above 1280, and `data-close-at` changes with it (one constant in
  `templates.mjs`, one media query in CSS).

### B.3 Section header (3.3)

**Model:** `sections[i].heading` `{html, text, level, id}` (195 non-null headings: h2 191, h3 3, h1 1; `id` is null on all
195; `html` holds `a` 3, `b` 7 and `strong` 7 times), or the first heading inside a block's `html` (styled by context,
never re-marked).

```html
<{level} class="section-title wave-rule wave-rule--center" id="{fixed id}">{heading.html}</{level}>   <!-- centred: section intros -->
<{level} class="section-title section-title--left wave-rule">{heading.html}</{level}>                <!-- left: split layouts -->
```

- `{level}` = `heading.level`, **always** (and `title.level`, `members[].level`, `items[].level` for other headings).
  **Departure** from DESIGN-SPEC 3.17, 3.18 and 8, which promote the home's insurance and news headings to h2 and the
  post titles to h3: `tools/heading-parity.mjs` (fix round 2) requires every source heading at its source level in the
  rebuilt `<main>` and has no declaration list (its only exception is HD-1, h1 → h2), so a promotion fails A-1. The source
  levels already give the home a gap-free outline (B.16), which is what A-7 checks. The visual size comes from the class
  (`section-title`), not the level. Gap I.1.
- A null `level` (a source title that was not a heading element) prints as the scaffold does: a `p` with the
  component's title class (`p.callout-title`, `p.visit__title`, …), never a heading.
- `id` only where a fixed id is listed (0.10) or `heading.id` is set (never on this site).
- The rule is the heading's `::after` (0.2): teal-700 2.2 px over navy-700 1.6 px at .75, 74x12. `wave-rule--navy` on the
  lavender band, `wave-rule--light` on navy.
- A heading whose `html` holds an `a`: the link gets the drawn 2 px underline on hover and focus (`.section-title a`).
- **Responsive:** `--step-3` (26.4 px at 390, 38.4 at 1280, 39.2 at 1440, capped 2.45rem at 1920), `text-wrap: balance`,
  650, -0.012em. The same markup at every width.

### B.4 Home hero (3.4; model s1 and s2)

**Model:** `s1.background[]`: the base layer `{image, media: null, from: 'row'}` (1600x667, role `background`,
`alt: ""`) and its phone layer `{image, media: '(max-width: 768px)'}` (1190x496); `s2.heading` (h2 "Comprehensive Eye
Care"; the source is a `div.ecp-heading`, not a heading element); `s2.blocks[0]` (`cta`, one button "Request
Appointment" → the appointment form). Theme: the hero loop and posters [P2]; the cut-out `art.home['hero-cutout']`
(H1) [P4].

```html
<section class="hero">
  <div class="hero__light pl-band" aria-hidden="true" data-video data-src-webm="{up}theme/media/hero-river.webm" data-src-mp4="{up}theme/media/hero-river.mp4" data-src-phone="{up}theme/media/hero-river-phone.mp4" data-media-phone="(max-width: 768px)">
    <picture>
      <source media="(max-width: 768px)" srcset="{up}theme/media/hero-river-poster-phone.webp" width="720" height="1282">
      <img class="hero__poster" src="{up}theme/media/hero-river-poster.webp" alt="" width="1920" height="1068" decoding="async">
    </picture>
  </div>
  <i class="ra" aria-hidden="true" data-ra="h1" data-at="…"></i>{… h2 h3: the B.16 route}
  <i class="rz" aria-hidden="true" data-occluder=".frame__clip" data-from="h1" data-to="h2" data-on="p"></i>
  <div class="container pl-surface pl-raise hero__grid">
    <div class="hero__copy">
      <p class="hero__statement">{first word of s2.heading.text} <span>{the rest of s2.heading.text}</span></p>
      <a class="btn btn--primary btn--lg" href="{s2.blocks[0].buttons[0].href}">{icon calendar}<span>{s2.blocks[0].buttons[0].label}</span></a>
    </div>
    <figure class="hero__frame">
      <div class="frame__clip">
        <img class="frame__img" data-depth="inner" src="{image.url}" srcset="{[P1]}" sizes="{B.4 sizes}" alt="{image.alt}" width="{image.w}" height="{image.h}" fetchpriority="high" decoding="async">
      </div>
      <img class="protrude protrude--glasses pl-cut" data-protrude="hero-glasses" data-cross=".frame__clip" data-depth="fore"
           src="{art.home['hero-cutout'].url}" srcset="{[P1]}" sizes="(min-width: 1024px) and (max-height: 720px) min(260px, 17vw), (min-width: 792px) min(370px, 24vw), (min-width: 769px) 190px, min(48vw, 250px)" alt="" width="{w}" height="{h}" decoding="async">  <!-- ? art.home present -->
      <!-- site.js appends button.hero__toggle here, as the figure's last child, out of flow at its top-right corner (1.9) -->
    </figure>
  </div>
  <svg class="bank bank--down bank--hero pl-band" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">{the three bank paths}</svg>
</section>
```

- **Statement:** `s2.heading` rendered as `p.hero__statement` (declared: the h1 stays first in the outline; the source is
  not a heading element, so heading-parity is unaffected). Split rule: the first whitespace-delimited word, one space,
  the rest in a `span` (display block; weights 340 / 720). The text content stays "Comprehensive Eye Care".
- **Frame image** (`{image}` = `s1.background[0].image`): `alt=""` (the model's). DESIGN-SPEC wants a 4:3 crop of the
  1920x800 original at 1067x800 from P1 (since wf5b: cut at x 308, which keeps the staff member at the desk out of the
  frame edge; 0.12). Because a `srcset` may only list one aspect, P1 must expose the crop as its own
  object, `image.crop = { url, w, h, srcset }` (declared P1 detail, gap I.3); when present, print `crop.url`,
  `crop.srcset`, `crop.w`, `crop.h`. Until then the frame shows `image.url` (1600x667) with `object-fit: cover;
  object-position: 55% 50%`. Frame widths (measured by the templates stage, I.67: the `1fr / 1.08fr` grid): `Wd` `min(589px, 45.5vw)`, `Wt` 45.5vw, `Wp` `calc(100vw - 32px)`; printed for the crop (`k` 1.12) as `(min-width: 1200px) min(660px, 50.98vw), (min-width: 769px) 50.98vw, calc(112.04vw - 36px)`; the image is 112% of the frame
  height (it sinks 22 px), so `fh/fw` = 0.84.
- **The phone layer** (`s1.background[1]`, `media (max-width: 768px)`) is **not rendered** (DESIGN-SPEC Q-6: superseded
  by the same scene at higher resolution). keep-image-parity counted it present only through the scaffold's
  `<source>`; since wf5b the layer carries `superseded` and is declared `background-dropped`
  (`audit/clone-removals.json` `images.droppedOnPages`), so its absence passes (gap I.6 closed).
- **Light:** A3, poster first (1.9). Files [P2] from `assets/media/` (wf4 output, present on disk at 2026-10-01 23:51):
  `hero-river.webm`, `hero-river.mp4`, `hero-river-phone.mp4`, `hero-river-poster.webp` (1920x1068, 26,204 bytes) and
  `hero-river-poster-phone.webp` (720x1282, 10,954 bytes), shipped under `dist/theme/media/`. `width`/`height` are read
  from the shipped poster files at build time (the values above are today's).
- **Light regrade (integrate stage, gap I.76):** `.hero__light :is(img, video) { filter: var(--light-grade) }`,
  `--light-grade: hue-rotate(-32deg) saturate(1.8)` (tokens.css): a static colour matrix (no blend mode, never animated)
  that turns the accepted clip's cerulean ribbon to the logo teal, on the home loop, its posters and the title-band stills
  alike. **Departure** from DESIGN-SPEC A3 ("the grade is baked into the clip"): the clip is shipped as accepted.
- **Banks** (2.8, G6): every `svg.bank` holds three paths: `path.bank__fill` (`M0 90V52C180 22 360 8 560 26s420 58 620
  44c110-8 190-26 260-42V90Z`, the prototype's), `path.bank__teal` (the same curve without the closing segments,
  `--teal-500` 2 px) and `path.bank__navy` (the same curve with `transform="translate(0 6)"`, `--navy-700` 1.2 px at .75);
  strokes use `vector-effect="non-scaling-stroke"`. `bank--down` sits at a band's bottom (fill = the next surface: `--paper`
  here); `bank--up` is flipped at a band's top (fill = the band's own colour).
- **Depth:** `hero__light` plane 0 (0.7x, 1.4); `frame__img` plane 2 `data-depth="inner"` (sinks up to 22 px); glasses
  `pl-cut`, `data-depth="fore"` (1.12x, upward only: first screen). The container is `pl-raise` so the glasses paint
  above the intro card.
- **Reveal:** none (first screen). **Hover:** the button only.
- **Responsive:** 360 / 390: one column: statement (`--display` phone clamp, 41 px at 390; `n`: statement and CTA full
  width), CTA, frame 4:3 full width, glasses at the frame's lower-left at `min(48%, 250px)`; `--hero-tuck` 70 px; the phone
  weave zone is active (R3). 768: the same one-column layout. 1024: two columns (copy, frame); padding
  `clamp(26px, 5vh, 64px) 0 clamp(150px, 18vh, 210px)`; frame `max-height: max(300px, calc(100svh - var(--chrome-h) - 96px))`.
  1280x585 (s): padding-bottom 120 px, frame `max-height: calc(100svh - var(--chrome-h) - 150px)`, `--hero-tuck: 120px`;
  acceptance: statement, CTA and the whole h1 visible at load (h1 bottom 569 px or less) and the glasses 12 px from every
  text box, else the glasses move to cross the frame's left edge at 55-70% of its height. In s the corner placement
  cannot hold (with `--hero-gap` 0 the intro card starts at the frame's bottom, under the glasses), so the left-edge
  placement is the s rule (measured at 1280x585 with a real scrollbar: h1 bottom 564.6 px, glasses centred at 55 % of the
  frame, 17 px from the statement; gap I.60). 1440 / 1920: two columns, the 1024 maths, the container capped at 1200.
  The statement is capped by its own column (`.hero__copy` is an inline-size container; `min(var(--display), 100cqi /
  6.6)`): "Comprehensive" is 6.355 em at weight 340, so the bare `--display` (89.6 px at 1920) overflowed its 542 px
  column by 27 px into the glasses (gap I.59). Outside the s rule the glasses' box stays 12 px inside the column gap
  (`left: calc(28px - <gap>)`) and crosses the frame's bottom edge by 52 px or more.
- **Short screens (mobile optimisation, M-LAYOUT-5 = operator option 4b, I.148):** the home h1 ended below the first
  screen at 375x667 (bottom 784 px), 320x568 (731), 844x390 (614) and 667x375 (991). *Short portrait*
  (`(max-width: 768px) and (max-height: 740px)`): padding-top 14 px, `.hero__copy` padding 0, statement margin 14 px, grid
  gap 16 px, `--hero-gap` 28 px, the intro card's top padding 20 px (B.5), and the frame capped by
  `--frame-h: max(110px, calc(100svh - var(--chrome-h) - 1.96 * var(--display) - 3.1vw - 234px))` (the height the screen
  leaves after the chrome, the two-line statement, the two-line h1 card and the rest of the stack, 10 px to spare; the
  height-aware hero of the s rule, on a phone). The frame keeps its width, so the photo is cropped wider (cover; 343x198.6
  at 375x667 and 288x112.9 at 320x568: every column of the source, rows 0.11-0.89 and 0.24-0.76, the shop's windows, frame
  walls, desks and counter; the ceiling and the floor go first). The glasses scale with it
  (`width: min(48%, 250px, calc(var(--frame-h) * .95))`) and drop at most 22 px below it (`bottom: max(-11%, -22px)`).
  *Landscape* (`(max-width: 1023px) and (max-height: 480px) and (orientation: landscape)`, 667x375 included): the
  two-column hero of 769-1023 px, gap 48 px, the frame stretched to the copy's height (`.hero__frame { align-self:
  stretch; width: 100%; max-width: 380px; justify-self: end }`, `.frame__clip { aspect-ratio: auto; height: 100%;
  max-height: none }`: 378x146 at 844x390, never wider than about 2.6:1), padding-top 8 px, `--hero-gap` 8 px, statement
  margin 12 px, the intro card's top padding 20 px, and the glasses across the frame's left edge at 22 % from its bottom
  (`width: 104px; left: -34px`), the s rule's placement. Acceptance, the h1's bottom against the screen height: 375x667
  655.5 / 667, 320x568 557.6 / 568, 844x390 383.3 / 390; **667x375 384.5 / 375 does not fit** (the 138.5 px landscape
  header, not sticky since A11Y-8, leaves 236.5 px, and the two-line statement, the CTA, the card's padding and the
  one-line h1 with its wave rule need 374 px with no spacing at all; with OPEN-DECISIONS E's compact landscape header,
  injected as a what-if, it ends at 358.4); the CTA is on screen at every size; 360x800, 390x844, 412x915 and 430x932 never
  match the rules. The phone weave enters at `h1` `p:104%,58%` (B.16), so its over copy still crosses the shorter frame.
- **No-occlusion (protrusion 1, glasses):** crossing = the frame's lower-left corner into the column gap of
  `.hero__grid` (`clamp(24px, 4.5vw, 72px)`) and the frame's own area; reservation = that gap plus the hero's bottom
  padding (derived from `--hero-tuck`); parallax budget 44 px upward (the probe grows the box 44 px up); never over the
  statement, the CTA, the toggle or the h1 (12 px clearance, A-14); `pointer-events: none`. The phone weave stretch
  (`h1` → `h2`) enters through the frame's right edge and never reaches the glasses (A-13). On short screens (above) the
  glasses' box, grown by 6 px and its 44 px, keeps clear of the CTA and of the h1 at every size measured (0 A-14 hits;
  its crossing of the frame's bottom edge 19-32 px in short portrait, its crossing of the frame's left edge 42 px in
  landscape).

### B.5 Intro card (3.5; model s3)

**Model:** `s3.heading` (`level: 'h1'`, `h1.placement: 'content'`), `s3.blocks[0].html` (one `p` with one `a`).

```html
<section class="intro">
  <i class="ra" aria-hidden="true" data-ra="i1" data-at="…"></i><i class="ra" aria-hidden="true" data-ra="i2" data-at="…"></i>
  <div class="container pl-surface">
    <div class="intro__card surface surface--glass pl-break" data-protrude="intro-card" data-cross=".bank--hero">
      <h1 class="intro__title wave-rule">{s3.heading.html}</h1>
      <div class="intro__text rich">{s3.blocks[0].html}</div>
    </div>
  </div>
</section>
```

- `data-cross` resolves inside the section first, then in the document (the bank is in the hero).
- **Depth:** a plane-2 surface crossing a bank (protrusion 2); no parallax. **Reveal:** never (a protrusion, and on the
  first screen). **Hover:** the inline link's underline only.
- **Responsive:** 360 / 390 / 768: full container width, straddling the bank by 70 px; text left; h1 `--step-3`, paragraph
  `--step-0` at p, `--step-1` above. 1024: `max-width: 980px`, centred, tuck `--hero-tuck`. 1280x585 (s): tuck 120 px; the
  whole h1 within 569 px. 1440 / 1920: 980 px centred, tuck `clamp(84px, 11vh, 124px)`. Text is left-aligned at every width
  (U7: the prototype's centred paragraph is not kept). Short portrait phones and landscape phones (B.4, I.148): top
  padding 20 px.
- **No-occlusion (protrusion 2):** crossing = `--hero-tuck`; reservation = the hero's bottom padding, derived from the
  same token; the river passes behind it (the glass blurs it); the glasses keep 12 px from its text.

### B.6 Envision promo (s4) and services (s5) (3.6)

**Model:** `s4.blocks[0].html` (one `figure.fig.fig--brand` holding `span.fig__media > a > img`, 1366x512, linked to the
Envision page); `s5.heading` (h2 "Our Eye Care Services"); `s5.blocks[0..3]` (`callout`: `title {html, level 'h3', href}`,
`image` (photo 1280x853, portrait 559x560, photo 639x639, photo 1280x853), `imageFirst: true`, `html`, no buttons).

s4 and s5 render in **one** `section.services` (the promo straddles the band of s5):

```html
<section class="services">
  <div class="services__band pl-band" aria-hidden="true" data-band></div>
  <i class="ra" …></i>{… s1 s2 s3 s4: the B.16 route}
  <div class="container pl-surface">
    <div class="promo pl-break" data-protrude="envision" data-cross=".services__band">{s4.blocks[0].html}</div>
    <h2 class="section-title wave-rule wave-rule--center">{s5.heading.html}</h2>
    <ul class="cards cards--4" role="list">
      <li class="card card--svc surface surface--glass" data-tilt>                                                  <!-- … each s5 callout -->
        <div class="card__media frame pl-break" data-protrude="svc-{n}" data-cross="parent">
          <img src="{callout.image.url}" srcset="{[P1]}" sizes="{B.6 sizes}" alt="{callout.image.alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
        </div>
        <div class="card__body rv">
          <h3 class="card__title"><a class="card__link" href="{callout.title.href}">{callout.title.html}</a></h3>
          <div class="card__text rich rich--compact">{callout.html}</div>
        </div>
      </li>
    </ul>
  </div>
</section>
```

- The promo is the model's figure untouched (B2: never hand-copy source HTML); `.promo` styles its `figure`, `a` and
  `img`. The brand image is never cropped (`object-fit: contain`, its own 1366:512 ratio).
- Card copy stays as the model has it (the Dry Eye Treatment and Patient Forms texts are mismatched; OPEN-DECISIONS B).
- The card text's own links sit above the stretched link (`.card__text a { position: relative; z-index: 2 }`; the
  prototype's `.inline-link` class cannot be put on model HTML and is not used).
- **Images:** card photos in a 5:4 frame (`fh/fw` 0.8): `Wd` 230px, `Wt` `calc(50vw - 64px)`, `Wp` `min(calc(100vw - 78px),
  calc(92vw - 46px))` (mobile optimisation, M-SPEED-5, I.136: the one-column card's media box, 100vw less 2 x the gutter
  `max(16px, 4vw)`, 2 x 22 px card padding and the 2 px border; the earlier `calc(100vw - 68px)` said 3-6 % more and crossed a
  srcset step at 375x667 DPR 2 and 412x915 DPR 2.625), each times `k`;
  the promo `k = 1`, `Wd` 1040px, `Wt`/`Wp` `calc(100vw - 2 * gutter)`, printed `(min-width: 1131px) 1040px, (min-width: 401px) 92vw, calc(100vw - 32px)` (I.67; the model img carries no `srcset`; D.7 adds it
  [P1]).
- **Depth:** `div.services__band` plane 0 (`data-band`: a violet `::after` at `--p * .55`); cards plane 2 glass (the
  river passes behind them); service photos `pl-break` inside the card (no parallax); the promo `pl-break` (no
  parallax).
- **Reveal:** `.card__body.rv` only (the card holds a protrusion, so the card itself is never gated, D3); the promo and
  the heading are not gated. **Hover/focus:** cards: tilt, glare, lift 7 px, `--sh-3`, media zoom 1.06, the title's
  underline; `:focus-within`: the lift, the centred glare, zoom, underline and a 3 px ring via `:has(:focus-visible)`.
  Promo (D5): lift 6 px, `--sh-3`, a 4 px teal glow ring and image zoom 1.04 on `:hover` and `:focus-within`, plus a 3 px
  navy ring on its focused link.
- **Responsive:** 360 / 390: one column; photos break 32 px or more above their cards (the row gap reserves it); the promo
  full container width. 768: one column, break 32 px. 1024: two columns (`cards--4` is 4/2/1 at d/t/p); row gap =
  `--svc-break` + 16 px. 1280x585 / 1440 / 1920: four columns, break `--svc-break` (48-64 px); the promo
  `min(100cqw - 2 * gutter, 1040px)` (`.services` is the size container).
- **No-occlusion (protrusions 3 and 4):** promo crossing = half its height (`--promo-h * .5`; the band's `top` uses the
  same expression); service photos cross `--svc-break` above their card, reserved by the grid's top margin and row gap
  (`--svc-break + 16px`); no parallax on either.

### B.7 Alumier band (3.7; model s6)

**Model:** `s6.background[0].image` (1440x675 sunscreen banner, role `background`, `alt: ""`); `s6.blocks[0]` (`callout`,
`title: null`, `image` = the AlumierMD logo 600x112 with `alt: ""` (a declared file-name blank of the source alt
"AlumierMD_Logo_Gry": `audit/clone-removals.json` `images.altsBlanked.onPages`), `html` "Now available
at our practice!", one external button "Learn More" → `https://www.alumiermd.com?code=ATwPQnFl`, `newTab: false`).

```html
<section class="alumier">
  <i class="ra" …></i>{… a1 a2}
  <i class="rz" aria-hidden="true" data-occluder=".alumier__card" data-from="s4" data-to="a2"></i>
  <div class="container pl-surface">
    <div class="alumier__card pl-break" data-protrude="alumier-card" data-cross=".services__band">
      <img class="alumier__bg" src="{s6.background[0].image.url}" srcset="{[P1]}" sizes="{B.7 sizes}" alt="" width="1440" height="675" loading="lazy" decoding="async">
      <div class="alumier__panel surface surface--image">
        <img class="alumier__logo" src="{callout.image.url}" alt="{callout.image.alt}" width="600" height="112" loading="lazy" decoding="async">
        <div class="alumier__line rich">{callout.html}</div>
        <a class="btn btn--primary" href="{callout.buttons[0].href}"><span>{callout.buttons[0].label}</span>{icon arrow}</a>
      </div>
    </div>
  </div>
</section>
```

- The logo's `alt` stays the model's `""` (DESIGN-SPEC Q-5 recommends "AlumierMD" as a declared repair; not applied:
  alt fidelity accepts `""` only because the blank is declared).
- **Weave:** the over copy crosses the card's top-right corner: occluder `.alumier__card` (its rounded box, `--r-xl`),
  stretch `s4` → `a2`, both outside the card at every layout; the panel's content starts 86-104 px below the card top.
- **Band-edge rule (B5):** `.services__band` ends under this card or fades to transparent over at least 80 px.
- **Images:** the banner `cover` in the card at d/t (`fh/fw` from the card: `clamp(320px, 31vw, 420px)` over the
  container width; measured `k` 1: the card is wider than the banner's ratio at d and t), `Wd` 1200px, `Wt` `calc(100vw - 2 * gutter)`, printed `(min-width: 1296px) 1200px, (min-width: 401px) 92vw, calc(100vw - 32px)`; the logo `250px` (its CSS width, `min(250px, 80%)`; I.67); at p it is its own 1440:675 ratio (`k = 1`), `Wp`
  `calc(100vw - 32px)`.
- **Depth:** the card is a plane-2 surface crossing the band (protrusion 5); no parallax. **Reveal:** none (a protrusion).
  **Hover:** the button only.
- **Responsive:** 360 / 390 / 768: the banner on top at its own ratio, the panel below, white, full width; the weave stays
  on the card's top-right corner. 1024: the banner fills the card (`cover`, `50% 50%`), the panel right (380 px), the card
  climbs `--al-overlap`. 1280x585 / 1440 / 1920: panel 430 px, card min-height `clamp(320px, 31vw, 420px)`. Verify at 1440,
  1024, 768 and 390 that no product mark is cut.
- **No-occlusion (protrusion 5):** crossing = `--al-overlap` (76-96 px); reservation = the services section's bottom
  padding (196-250 px of open band under the cards) and this section's negative top margin, both from `--al-overlap`; no
  parallax.

### B.8 Generic cards (3.8)

Every card in B and F that is a link target shares:

```html
<li class="{block} surface surface--{glass|paper|frost}" data-tilt>
  <div class="{block}__media frame">{img}</div>                                          <!-- ? -->
  <div class="{block}__body">
    <{level} class="{block}__title"><a class="card__link" href="{href}">{title}</a></{level}>
    …
  </div>
</li>
```

- `card__link` is the shared stretched-link class (its `::before` covers the card); inline links in the body sit above it.
  `[data-tilt]` is present **only** on cards with a stretched link (the card is interactive): service cards, the linked
  callout, news and blog-index cards, child-page cards, team cards. Static cards (products, devices, testimonials, the
  unlinked Back-to-School callout, designer tiles) carry neither (D5: a hover effect needs a focus twin, and a card
  without a focusable element has none).
- Glare: the card's own `::before` (radial highlight at `--mx`/`--my`, opacity .5; .35 at the centre on
  `:focus-within`).
- `.frame`: radius `--r-m` (cards) or as stated per slot, an inset 1 px white highlight (`::after`), `object-fit: cover`,
  `overflow: hidden`. Card padding `clamp(22px, 2.2vw, 30px)`, radius `--r-l`, the ring `:has(:focus-visible)` 3 px
  `--teal-700`. QA round 1 (A11Y-17, I.108): the card's `::after` draws the same ring again, exactly on the outline
  (inset -8 px from the padding box, inside the 1 px border; 3 px border; radius `--r-l` + 7 px; z-index 6), so a
  breakout photo (`.pl-break`, z-index 4, painted after the card's own outline) no longer covers its top edge. A white
  halo either side (4 px outside, the 4 px gap inside) keeps it readable where it crosses the photo. The outline stays
  (its geometry; `Highlight` in forced colours, as the `::after`).
- **Media zoom (1.06) comes only from an interactive ancestor**, never from the frame's own hover:
  `[data-tilt]:not(.rv):is(:hover, :focus-within) .frame img` (the cards above) and
  `.trio__item:is(:hover, :focus-within) .trio__photo img` (B.11); the promo has its own 1.04 rule (B.6). The zoom uses
  the individual `scale` property, never `transform`. A `.frame` with no focusable ancestor never zooms: the arch
  (`.titleband__frame`, whose `img` also carries `data-depth`, so site.js owns its `transform`, 1.4), the doctor photos and
  plates, the designer tiles and the unlinked Back-to-School callout's media. A zoom there would be a hover effect with no
  focus twin, which DESIGN-SPEC D5 forbids and A-16 fails (gap I.47).
- Tilt CSS applies only to `[data-tilt]:not(.rv)` and only for `(hover: hover) and (pointer: fine)`; reduced motion turns
  tilt, glare and lift off.
- **The card after Back on a touch phone (mobile optimisation, M-TOUCH-4, I.133):** under `(hover: none) and
  (max-width: 1023px)` a card that keeps `:hover` or `:focus-within` from a tap, with no `:focus-visible` inside, rests:
  no lift (`--lift: 0px`) and no glare (motion.css), the title link, photo and surface shadow at their rest values
  (`.card__link` `background-size: 0 2px` and `--navy-700`, `.frame img` `scale: none`, glass `inset 0 1px 0
  var(--glass-highlight), var(--sh-2)`, paper and frost `--sh-1`). Before, tap, navigate and Back (the back-forward cache)
  showed the card lifted 7 px with its .35 glare. Keyboard focus keeps the designed focus state (DESIGN-SPEC 6.4); a mouse
  and 1024 px and up are unchanged.
- **Responsive:** these shared rules hold at every sweep size. The card padding `clamp(22px, 2.2vw, 30px)` is 22 px at
  360 / 390 / 768, 22.5 px at 1024, 28.2 px at 1280x585 and 30 px at 1440 / 1920. Column counts belong to each card
  family (F.1 says where each is defined). Touch phones get no tilt and no glare (the pointer query).

### B.9 Two callouts (3.9; model s7)

**Model:** `s7.blocks[0..1]` (`callout`: `title {html, level 'h3', href}` (the first `href: null`, the second linked),
`html`, `image` 640x240 photo, `imageFirst: false`). Optional cut-out `art.home['graft-cutout']` (H3) [P4].

```html
<section class="callouts">
  <i class="ra" …></i>{c1}
  <div class="container pl-surface callouts__grid">                                       <!-- + pl-raise when art.home['graft-cutout'] is present -->
    <div class="callouts__cell">                                                           <!-- … each callout -->
      <article class="callout surface surface--paper rv" [data-tilt]>
        <h3 class="callout__title wave-rule">[<a class="card__link" href="{title.href}">]{title.html}[</a>]</h3>
        <div class="callout__text rich">{callout.html}</div>
        <div class="callout__media frame"><img src="{image.url}" srcset="{[P1]}" sizes="{B.9 sizes}" alt="{image.alt}" width="640" height="240" loading="lazy" decoding="async"></div>
      </article>
      <img class="protrude protrude--kids pl-cut" data-protrude="kids-glasses" data-cross="parent" data-depth="fore" src="{art.home['graft-cutout'].url}" srcset="{[P1]}" sizes="(min-width: 1400px) 210px, (min-width: 1000px) 15vw, 150px" alt="" width="{w}" height="{h}" loading="lazy" decoding="async">   <!-- ? G19: the first cell only, only when art.home['graft-cutout'] is present -->
    </div>
  </div>
</section>
```

- `data-tilt` and the stretched link only on the linked callout (Glaucoma). The kids' glasses are a **sibling** of the
  revealed card (D3), resting on the image's lower-right corner. IMAGE-PLAN 3.4 ships H3 only if it passes review
  (`assets/generated/H3.png` exists on disk; its review status is not recorded in the models).
- **Images:** 640x240 photos in their own ratio (`k = 1`): `Wd` 520px, `Wt` `calc(50vw - 90px)`, `Wp` `calc(100vw - 80px)`.
- **Depth:** plane-2 paper; the optional cut-out `pl-cut`, `fore`. **Reveal:** the `article.callout`. **Hover:** the linked
  card as B.8.
- **Responsive:** 360 / 390 / 768: one column; the cut-out (if shipped) hangs 32 px or more below its card and clears the
  Glaucoma card (A-14). 1024 / 1280x585 / 1440 / 1920: two columns, gap `clamp(20px, 3vw, 40px)`, hang 48 px or more.
- **No-occlusion (optional protrusion 11):** crossing = the cell's bottom edge by 48 px (32 px at p); reservation = the
  section's bottom padding plus the one-column row gap; parallax 44 px; never in or next to the designer-frames section
  (four sections apart).

### B.10 Doctor blocks and the portrait placeholder (3.10; model s8, s9; also /our-eye-doctors/)

**Model:** the section's `team` block (`view: 'summary'`, `members[0]`: `name`, `href`, `level: null`, `position: ""`,
`photo` or `placeholder`, `html: ""`), the section's `prose` block (an `h2` and paragraphs; the s8 `h2` holds a `br`), the
section's `cta` block ("Meet Our Optometrist" → `/our-eye-doctors/`).

```html
<section class="doctor">
  <i class="ra" …></i>{… d1 d2 d3 (s8) / n1 n2 (s9)}
  <div class="container pl-surface doctor__grid [doctor__grid--flip]">
    <figure class="doctor__portrait">                    <!-- div.doctor__portrait when it holds the placeholder plate (I.119) -->
      <div class="doctor__plate" aria-hidden="true"></div>
      <div class="doctor__photo frame pl-break" data-protrude="doctor-photo-{n}" data-cross=".doctor__plate" data-depth="fore-soft">
        <img src="{member.photo.url}" srcset="{[P1]}" sizes="(min-width: 1200px) 395px, (min-width: 769px) 33vw, min(303px, calc(72vw - 23px))" alt="{member.photo.alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
      </div>
      <!-- or, when member.placeholder: the placeholder plate below, in place of div.doctor__photo -->
    </figure>
    <div class="doctor__text surface surface--paper rv">
      <p class="doctor__tag"><a href="{member.href}">{member.name}</a></p>
      <div class="doctor__prose rich">{the section's prose block html}</div>
      <a class="btn btn--secondary" href="{cta.buttons[0].href}"><span>{cta.buttons[0].label}</span>{icon arrow}</a>
    </div>
  </div>
</section>
```

- The second consecutive doctor section on the page gets `doctor__grid--flip` (s9; DESIGN-SPEC: Nelson's block mirrors
  Degler's). The prototype's person-named modifiers `doctor--degler` / `doctor--nelson` are not kept.
- The member's name prints as `p.doctor__tag` with its link (`level: null`; the source is a `div.ecp-heading-tag`). The
  prose's `h2` (model HTML) takes the wave rule from the `rich` heading rule (D.4).

**Placeholder plate (G9; the refused portraits: 10 portrait slots on 7 pages; the 11th placeholder is the Bajio brand
cell of B.12):**

```html
<div class="doctor__photo frame ph-portrait pl-break" role="img" aria-label="{placeholder.label}" data-needs="{placeholder.needs}"
     data-protrude="doctor-photo-{n}" data-cross=".doctor__plate" data-depth="fore-soft">
  <span class="ph-portrait__ring" aria-hidden="true"></span>
  <span class="ph-portrait__mono" aria-hidden="true" data-initials="{initials}"></span>
  <span class="ph-portrait__name" aria-hidden="true">{placeholder.label}</span>
</div>
```

- Outside the doctor block the plate keeps its attributes and its three spans; only its host changes. On a team card the
  plate **is** the photo host, `div.member__photo.frame.ph-portrait.pl-break` with the card's `data-protrude` and
  `data-cross` (B.27). In the arch it is a `div.ph-portrait` (`role`, `aria-label`, `data-needs`, the three spans; no
  `data-protrude`, no `data-depth`) that **replaces the `img` inside** the title band's frame, which is then
  `div.titleband__frame` (I.119) and keeps the arch's `data-protrude`, `data-cross` and occluder role (B.21).
- **No `<figure>` around a plate (QA round 1, regressions R1; I.119).** A portrait that holds the plate is
  `div.doctor__portrait`, and an arch that holds it is `div.titleband__frame`; a portrait or arch that holds the photo
  stays a `figure`. The plate prints the person's name (as `ph-portrait__name`, and its `aria-label` is the same string),
  and a name is not a quotation: `sr-fabrication` reads every `<figure>` or `<blockquote>` holding more than 20
  characters of text as a testimonial, and fix-1 had declared the two doctors' names as "figure text" to pass it, which
  let an invented review that embeds a declared name pass too. The plate's markup, its `role="img"` name, its visible name
  and every box are unchanged (`tmp/wf6/reg/p/layout-boxes.mjs`: 0 of 5,428 element boxes moved on the 8 changed pages
  at 1280x585@1.5 and 390x844@3; `ax-names.mjs`: the named nodes are the same, only the unnamed `figure` node is gone).
- **Initials (DESIGN-SPEC Q-7, declared):** split `placeholder.label` on whitespace; drop a leading `Dr.` token; take the
  first two remaining tokens; from each take its first letter (`\p{L}`), upper-cased. On this site: "KN" (Dr. Kristin
  Nelson, O.D., IACMM: 3 slots), "ML" (Dr. Maivys Longa, O.D.: 2), "H" (Heather: 2), "X" (Xaiene: 2), "J" (Jhonae: 1),
  the five values of Q-7, checked against the 10 portrait entries of `placeholders[]` (`facts.mjs`).
- **The initials are drawn by CSS from `data-initials`** (`.ph-portrait__mono::before { content: attr(data-initials) }`),
  not printed as text. **Departure** from the prototype's text node: `tools/words-added.mjs` reads every visible text node
  of `<body>` (including `aria-hidden` ones), has no declaration list, and "kn" / "ml" are in no source vocabulary
  (checked this session for `/`, `/our-eye-doctors/`, `/team/dr-kristin-nelson-od/`, `/team/maivys-longa/`), so text
  initials fail A-1 with 5 findings. Q-7 is the declaration; the attribute keeps the derived string out of the DOM text.
  To print them as text instead, words-added first needs a declared-additions list (gap I.2).
- `ph-portrait__ring`: the segmented iris ring (two concentric rings, `--teal-500` to `--violet-500` segments), CSS only.
  The plate never shows a generated face; the practice's photo replaces it (`data-needs` stays the hook for that).
- **Depth:** the plate plane 2; the photo or placeholder `pl-break`, `fore-soft` (1.06x, 26 px). **Reveal:** `doctor__text`
  only (the portrait is never gated, D3). **Hover:** buttons and links.
- **Sticky portrait (R5):** at 1024 px and up the portrait column is `position: sticky; top: calc(var(--navbar-h) + 24px)`
  with the grid aligned to start (it only moves while the text pane is taller than the viewport).
- **Responsive:** 360 / 390 / 768: one column, the portrait first (`width: 86%`, max 360 px), the text pane below (gap
  34 px). 1024: two columns 5fr / 6fr, sticky portrait. 1280x585: two columns; the Nelson pane is taller than the
  viewport, so the portrait sticks (R5). 1440 / 1920: two columns, gap up to 96 px; s9 mirrored. Below 360 px the text
  pane's inline padding is 20 px (mobile optimisation, I.127: 'Meet Our Optometrist' held one line, not two, at 320). Up to
  768 px a doctor block inside a hub band (`.band__inner > .doctor`, the three on `/our-eye-doctors/`) pads 24 px top and
  bottom instead of the section's 64 (mobile optimisation, M-LAYOUT-11, I.141): stacked, one doctor's text pane is 72 px
  above the next portrait (152 before) and each photo still clears it by 46 px with its 26 px parallax budget; the home's
  doctor sections are not band children and keep theirs. Since fixer D1 (I.152) the rule reaches 1023 px: at 769-1023 px
  the blocks sit side by side, and the next portrait is 79-129 px below a text pane (175-219 px before), clearing it by
  53-103 px with the parallax budget; 1024 px and up keep the section padding.
- **No-occlusion (protrusions 6 and 7):** the photo (84% of the square) breaks out of the plate (76%) within
  `figure.doctor__portrait`'s own box, a grid cell with no text; parallax budget 26 px each way, inside the grid gap
  (`clamp(32px, 6vw, 96px)`; 34 px at p).

### B.11 Lavender trio (3.11; model s10)

**Model:** `s10.blocks[0..2]` (`callout`: `title {html, level 'h3', href}`, `image` 427x427 role `plate`,
`imageFirst: true`, `html`).

```html
<section class="lavender" data-band>
  <svg class="bank bank--up bank--lav pl-band" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">{the three bank paths}</svg>
  <i class="ra" …></i>{… l1 l2 l3 l4}
  <div class="container pl-surface">
    <ul class="trio" role="list">
      <li class="trio__item">                                                                  <!-- … each callout -->
        <figure class="trio__photo frame pl-break" data-protrude="trio-{n}" data-cross=".bank--lav">
          <img src="{image.url}" srcset="{[P1]}" sizes="(min-width: 1024px) 236px, (min-width: 769px) min(220px, 62vw), min(220px, calc(62vw - 19.84px))" alt="{image.alt}" width="427" height="427" loading="lazy" decoding="async">   <!-- + the 0.8 phone twins -->
        </figure>
        <div class="trio__text rv">
          <h3 class="trio__title"><a href="{title.href}">{title.html}</a></h3>
          <div class="trio__copy rich">{callout.html}</div>
        </div>
      </li>
    </ul>
  </div>
</section>
```

- Structure is DESIGN-SPEC D3 exactly: `li > figure.trio__photo` (never gated) `+ div.trio__text.rv`. The title link is a
  plain underlined link (no stretched link, no tilt). The prototype's removed source `aria-label`s stay removed (WCAG
  2.5.3; the visible text is unchanged).
- **Depth:** the band (`--lav-300`, plane 0) with the bank on its upper edge (G6) and `--p`; photos `pl-break` (no
  parallax).
- **Hover/focus:** `:hover` and `:focus-within` on `li.trio__item` zoom the photo 1.06; the link's underline thickens;
  the focus ring is `--navy-700` on the lavender band.
- **Images (mobile optimisation, M-SPEED-5, I.136):** up to 768 px the photo is `min(220px, 62%)` of the one-column item
  (the container's content, 100vw - 2 x 16 px where 62 % stays under 220 px): `min(220px, calc(62vw - 19.84px))`, 178.6 px
  at 320 (measured 178.5; the earlier `min(220px, 62vw)` said 198 px and took the 427 w file at 320x568 DPR 2 for 360 w);
  769-1023 px keeps `min(220px, 62vw)`.
- **Responsive:** 360 / 390 / 768: one column; only the first photo straddles the bank, by 32 px or more; photos 2 and 3
  sit inside the band (the spec's phone degradation). 1024 / 1280x585 / 1440 / 1920: three columns, every photo
  (`min(236px, 74%)`, 7 px white ring, `--sh-3`) straddles the bank by 48 px or more.
- **No-occlusion (protrusion 8):** crossing = the negative top margin of `.trio__photo` (at least 48 / 32 px); reservation =
  the band's own top margin above the bank (`clamp(120px, 13vw, 168px)`) and the 24 px between photo and title; no
  parallax.

### B.12 Designer-frames grid (3.12; model s11)

**Model:** `s11.heading` (h2 whose `html` is an `a`), `s11.blocks[0].html` (two `p`), `s11.blocks[1]` (`gallery`, 4 items:
`image` (brand role, 500x500) or `placeholder` (Bajio: `{kind: 'brand', label: 'Bajio', needs: 'brand image'}`),
`caption`, `href: null` on all 4).

```html
<section class="frames">
  <i class="ra" …></i>{… f1 f2}
  <div class="container pl-surface frames__grid">
    <div class="frames__text rv">
      <h2 class="section-title section-title--left wave-rule">{s11.heading.html}</h2>
      <div class="frames__copy rich">{s11.blocks[0].html}</div>
    </div>
    <ul class="tiles" role="list">
      <li class="tile rv">                                                                     <!-- … item with an image -->
        <figure>
          <div class="tile__media frame">[<a href="{item.href}">]<img src="{image.url}" srcset="{[P1]}" sizes="(min-width: 1200px) 315px, (min-width: 769px) 26vw, 44vw" alt="{image.alt}" width="500" height="500" loading="lazy" decoding="async">[</a>]</div>
          <figcaption>{item.caption}</figcaption>
        </figure>
      </li>
      <li class="tile tile--text rv">                                                          <!-- item with a placeholder: the brand-name cell -->
        <figure>
          <div class="tile__media frame ph-brand" data-needs="{placeholder.needs}"><span class="ph-brand__name" aria-hidden="true">{placeholder.label}</span></div>
          <figcaption class="vh">{item.caption}</figcaption>
        </figure>
      </li>
    </ul>
  </div>
</section>
```

- **Brand-name cell:** an equal square; the name is set in type (`clamp(2.2rem, 1.6rem + 2.2vw, 3.4rem)`, weight 300 navy
  on a `--tint-sky` to `--field-teal` gradient) and is `aria-hidden`; the source caption stays in the DOM, visually hidden
  for this tile only, so it is heard once and seen once. "Bajio" is source text (the caption), so words-added is
  unaffected. No image ever fills a brand slot. The prototype's `tile__name` class is replaced by `ph-brand` (the
  BUILD-NOTES 5.8.5 name).
- Campaign images are shown whole (500x500 in a square frame: no crop, `k = 1`). Tiles are static: the model gives no
  link (`href: null` on all 4), so no tilt (B.8).
- No generated eyewear in or next to this section (DESIGN-SPEC 3.9).
- **Depth:** plane-2 frames; no protrusion. **Reveal:** `frames__text` and each `tile`; the even tiles rest 42 px lower (24
  px at p) through `transform: translateY(var(--base))`; the entrance animates the separate `translate` property, so it
  composes with the resting offset and ends at it with no special rule (the prototype's extra pair of `.tile.rv` rules is
  not needed).
- **Responsive:** 360 / 390 / 768: text first, then the 2x2 grid (even tiles 24 px lower). 1024 / 1280x585 / 1440 /
  1920: split 5fr text / 7fr tiles, 2x2, even tiles 42 px lower.

### B.13 Cataract (3.13; model s12)

**Model:** `s12.heading` (h2, `html` = `<strong>Cataract Co-Management in Fort Myers</strong>`), `s12.blocks[0].html` (two
`p`, the first holding a `br`, one link). Image: `art.home['home-feature']` (H2, the generated lens) [P4], `alt=""`.

```html
<section class="cataract">
  <i class="ra" …></i>{… k1 k2}
  <div class="container pl-surface pl-raise cataract__grid">
    <div class="cataract__text surface surface--paper rv">
      <h2 class="section-title section-title--left wave-rule">{s12.heading.html}</h2>
      <div class="cataract__copy rich">{s12.blocks[0].html}</div>
    </div>
    <figure class="cataract__lens frame pl-break" data-protrude="lens" data-cross="next" data-depth="fore-soft">   <!-- ? art.home['home-feature'] present -->
      <img src="{art.home['home-feature'].url}" srcset="{[P1]}" sizes="{B.13 sizes}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async">
    </figure>
  </div>
</section>
```

- Arch-top 4:5 frame (`999px 999px var(--r-xl) var(--r-xl)`, `fh/fw` 1.25: the 16:9 master renders `k` = 2.22), `--sh-4`.
  `Wd` 410px (the 4fr column: 410x513 at 1440, measured by the styles stage, I.56; 360px was low, I.67), `Wt` 33vw, `Wp` `min(300px, 72vw)`. The container is `pl-raise` so the lens paints over the next section's
  container. `data-cross="next"` = the Eye Emergencies section (1.2).
- Until `art.home` exists the figure is omitted and the text card spans the grid (gap I.11); protrusion 9 then waits for
  P4.
- **Responsive:** 360 / 390 / 768: one column, the lens `min(300px, 72%)`, right-aligned under the text, crossing 32 px or
  more. 1024 / 1280x585 / 1440 / 1920: 7fr text / 4fr lens, crossing 64 px or more. **The leading `<br>` (mobile
  optimisation, M-LOOK-3, I.126):** the model's first paragraph opens with a `<br>` (kept in the DOM, DESIGN-SPEC 3.22);
  below 1024 px `.cataract__copy > p:first-child > br:first-child` is `display: none`, so the heading-to-text gap is 28 px
  at 320-430 (54.4-54.7 px before; the sibling callouts' 18 px plus the section title's own 10 px larger margin).
- **No-occlusion (protrusion 9):** crossing = the lens's negative bottom margin (at least 64 px, 32 px at p); reservation =
  the Eye Emergencies band's top padding = the crossing + 48 px + the 26 px parallax budget; `pointer-events: none`. The
  lens aligns to the end of its grid row (`align-self: end`): aligned to the start, a text card taller than the lens
  absorbs the negative margin (measured: -10 px at 1440 with the real s12 copy; 101 px with the alignment; gap I.61).

### B.14 Eye Emergencies (3.14; model s13)

**Model:** `s13.heading` (h2 whose `html` is an `a`), `s13.blocks[0].html` (two `p`, the second holding `a[href^="tel:"]`,
then one `figure.fig.fig--photo`: the handshake, 800x800).

```html
<section class="emergency" data-band>
  <i class="ra" …></i>{… e1 e2}
  <div class="container pl-surface emergency__grid">
    <div class="emergency__text rv">
      <h2 class="section-title section-title--left wave-rule">{s13.heading.html}</h2>
      <div class="emergency__copy rich">{the block's top-level nodes except the figure (D.7)}</div>
    </div>
    <div class="emergency__photo pl-break" data-protrude="handshake" data-depth="fore-soft">{the figure node, untouched}</div>
  </div>
</section>
```

- The block's HTML is split by the top-level node splitter of D.7 (nodes untouched, order kept within each part). The
  figure's `span.fig__media` is styled as the square frame (`--r-xl`, `--sh-4`) by `.emergency__photo`; `k = 1`, `Wd`
  410px (the 4fr column at 1440; 380px was low, I.67), `Wt` 33vw, `Wp` `min(420px, calc(100vw - 32px))` (D.7 adds `srcset`/`sizes` [P1]).
- The phone link is bold and `white-space: nowrap` through `.emergency__copy a[href^="tel:"]` (the prototype's
  `.tel-link` class cannot be put on model HTML and is not kept); its digits come from RFEC Figures (the font stack).
- **Depth:** the A4 band with a rounded top (`::before` plane 0, `--p`); the photo breakout `fore-soft` (1.06x, 26 px).
- **Responsive:** 360 / 390 / 768: one column, text then photo (`width: min(420px, 100%)`), top padding 140 px (the lens
  reservation). 1024 / 1280x585 / 1440 / 1920: the photo left 4fr (`order: -1`), text right 7fr, top padding
  `clamp(150px, 14vw, 200px)`.
- **No-occlusion:** the photo moves 26 px each way inside its grid cell; the cell has no text and the grid gap is at least
  28 px, and 40 px at p, where the photo stacks under the copy: 26 px of parallax plus the probe's 6 px inflation leave 2 px
  of a 28 px gap (measured at 360 and 390: the photo's grown box touched the last copy line; gap I.62).

### B.15 Reviews carousel (3.15; model s14)

**Model:** `s14.blocks[0].html` (`figure.fig.fig--photo` staff 800x800, then `h2` "Read Our Patient Reviews"; the source is
a `div.ecp-heading`), `s14.blocks[1]` (`reviews`, 5 items: `html` (one `p`), `name` (with its dash: "- Becki P."), `stars`
(5), `shownAs` ("a week ago"), `reviewedAt` ("2026-09-16 20:07:48")), `s14.blocks[2]` (`cta`: "Read Google Reviews",
`external: true`, `newTab: true`, `rel: 'nofollow noopener'`).

```html
<section class="reviews">
  <i class="ra" …></i>{… r1 r2}
  <div class="container pl-surface reviews__grid">
    <div class="reviews__photo rv">{the figure node of s14.blocks[0].html}</div>
    <div class="reviews__panel surface surface--image pl-break" data-protrude="review-panel" data-cross=".reviews__photo">
      <h2 class="reviews__title section-title section-title--left wave-rule" id="reviews-title">{the inner HTML of the h2 node}</h2>
      <section class="carousel" data-carousel aria-roledescription="carousel" aria-labelledby="reviews-title">
        <div class="carousel__bar">                                      <!-- QA round 1 (MOTION-5): above the track (I.98, I.109) -->
          <div class="carousel__dots" role="group" aria-label="Reviews"></div>
          <div class="btn-row"><a class="btn btn--primary" href="{cta.buttons[0].href}" target="_blank" rel="{cta.buttons[0].rel}"><span>{cta.buttons[0].label}</span>{icon arrow}</a></div>
        </div>
        <div class="carousel__track" tabindex="0" role="group" aria-labelledby="reviews-title" aria-live="polite">   <!-- A11Y-10 (I.98) -->
          <figure class="review" role="group" aria-roledescription="slide" aria-label="{n} of {N}">                      <!-- … each item -->
            <div class="review__meta">
              <span class="stars" role="img" aria-label="{item.stars} out of 5 stars">{item.stars x <svg aria-hidden="true" focusable="false"><use href="#i-star"/></svg>}</span>
              <time class="review__time" datetime="{item.reviewedAt, space replaced by T}">{item.shownAs}</time>
            </div>
            <blockquote class="review__quote rich rich--compact">{item.html}</blockquote>
            <figcaption class="review__name">{item.name}</figcaption>
          </figure>
        </div>
      </section>
    </div>
  </div>
</section>
```

- The prose block is split (D.7): the figure goes to `.reviews__photo`; the `h2` is re-emitted as the panel heading with
  the classes and the id the carousel needs, its inner HTML verbatim (the one re-emitted model element on the site;
  declared). Its level is the model's (h2).
- Stars are SVG icons (never glyphs, BUILD-NOTES 5.8.8; words-added counts glyphs) in `--teal-700`; `{N}` = the item
  count (5). `datetime` = `reviewedAt` with its space replaced by `T` (the scaffold's form; the visible text is untouched; gap I.29);
  the visible text is `shownAs` verbatim (Q-3: frozen at the crawl date). The name prints verbatim with its dash, bold
  navy by CSS.
- The dots container is empty in the markup; site.js fills it (1.6). `aria-live="polite"` on the track (no autoplay, so
  polite is the APG value). QA round 1: the dots and the CTA share `.carousel__bar` above the track, so a taller slide
  grows below them and nothing the pointer or the reader is on moves (MOTION-5; departs from DESIGN-SPEC 3.15 "the CTA
  below", I.109); the photo and the panel are top-aligned (they were centred on each other, so a taller slide moved
  the panel's top up by half its growth); only the shown slide is exposed to assistive technology (A11Y-10, I.98).
- **Images:** the staff photo, square frame, `k = 1`: `Wd` 500px (5/12 of the 1200 px grid, which has no gap; printed from 1305 px, I.67), `Wt` 39vw, `Wp` `calc(78vw - 25px)` (D.7 adds
  `srcset`/`sizes` [P1]).
- **Depth:** the photo plane 2; the panel `pl-break` over the photo's edge (protrusion 10), glass contrast-tested over
  black.
- **Reveal:** `.reviews__photo` only (the panel is a protrusion). **Hover/focus:** the dot buttons (44x44, 10 px dots), the
  track's focus ring, the CTA. The dot's navy hover applies under `@media (hover: hover), (min-width: 1024px)` (mobile
  optimisation, M-TOUCH-4, I.133; B.0): a tapped dot on a phone shows the current teal, not the hover navy; focus-visible
  unchanged.
- **Swipes (mobile optimisation, MT-R3, I.134):** below 1024 px `.review { scroll-snap-stop: always }`, so a swipe stops at
  the next review instead of flying past it. In Chrome's touch emulation it removed most skips at swipe speeds a hand
  reaches (finger under one slide: 33 → 4 of 64 swipes) but not every skip of much faster synthetic flings (BUILD-NOTES
  15.2); the dots still land on the slide they name. Unverified on WebKit and real devices.
- **Responsive:** 360 / 390 / 768: one column; the photo at 78% width; the panel overlaps the photo's lower edge by
  90 px; the bar wraps (the dots, then the CTA). Below 360 px the panel's inline padding is 20 px (mobile optimisation,
  M-LAYOUT-4 = M-LOOK-7, I.122): the bar is 246 px wide, so the five 44x44 dots (236 px) keep one row and the CTA one
  line (at 320 the fifth dot sat alone on a second row and the label broke). 1024 / 1280x585 / 1440 / 1920: the photo 5fr left, the panel 7fr
  overlapping the photo's right edge by `clamp(56px, 8vw, 132px)`, both top-aligned; the dots and the CTA on one row;
  one review per view; the track height follows the active slide at every width.
- **No-occlusion (protrusion 10):** the panel covers only the photo (an image, never text); crossing =
  `clamp(56px, 8vw, 132px)` (90 px at p), reserved by the grid (the photo column is wide enough that its frame stays
  visible); no parallax.

### B.16 Home section order (3.16)

`home.mjs` renders the 16 model sections in model order, composed as follows (the source's empty rows 1, 17 and 19 are not
in the model):

```html
<body class="page-home tpl-home">
  … (A.3: sprite, skip link, aurora field, header) …
  <div class="page" id="page">
    <svg class="river river--under" aria-hidden="true" focusable="false"></svg><svg class="river river--over" aria-hidden="true" focusable="false"></svg>
    <main id="main" tabindex="-1">
      <section class="hero">…</section>            <!-- s1 + s2, B.4 -->
      <section class="intro">…</section>           <!-- s3, B.5 -->
      <section class="services">…</section>        <!-- s4 + s5, B.6 -->
      <section class="alumier">…</section>         <!-- s6, B.7 -->
      <section class="callouts">…</section>        <!-- s7, B.9 -->
      <section class="doctor">…</section>          <!-- s8, B.10 -->
      <section class="doctor">…</section>          <!-- s9, B.10, doctor__grid--flip -->
      <section class="lavender" data-band>…</section>   <!-- s10, B.11 -->
      <section class="frames">…</section>          <!-- s11, B.12 -->
      <section class="cataract">…</section>        <!-- s12, B.13 -->
      <section class="emergency" data-band>…</section>  <!-- s13, B.14 -->
      <section class="reviews">…</section>         <!-- s14, B.15 -->
      <section class="insurance" data-band>…</section>  <!-- s15, B.17 -->
      <section class="news">…</section>            <!-- s16, B.18 -->
    </main>
    <footer class="site-footer aurora-deep" data-band>…</footer>   <!-- B.19 -->
  </div>
  <dialog class="drawer" id="drawer" aria-label="Menu" data-close-at="(min-width: 1200px)">…</dialog>
</body>
```

| model section | `kind` | component | wrapper | headings it prints (level = model) | protrusion |
|---|---|---|---|---|---|
| s1 + s2 | hero, hero | B.4 | `section.hero` | none (the statement is a `p`) | 1 glasses |
| s3 | text | B.5 | `section.intro` | h1 | 2 intro card |
| s4 + s5 | image + cards | B.6 | `section.services` | h2, 4 x h3 | 3 promo, 4 service photos |
| s6 | callout | B.7 | `section.alumier` | none | 5 Alumier card |
| s7 | cards | B.9 | `section.callouts` | 2 x h3 | optional kids' glasses |
| s8 | team | B.10 | `section.doctor` | h2 (model HTML) | 6 photo |
| s9 | team | B.10 (`doctor__grid--flip`) | `section.doctor` | h2 (model HTML) | 7 plate |
| s10 | cards | B.11 | `section.lavender` | 3 x h3 | 8 trio photos |
| s11 | gallery | B.12 | `section.frames` | h2 | none |
| s12 | text | B.13 | `section.cataract` | h2 | 9 lens |
| s13 | text-image | B.14 | `section.emergency` | h2 | handshake breakout |
| s14 | reviews | B.15 | `section.reviews` | h2 (`#reviews-title`) | 10 review panel |
| s15 | cta | B.17 | `section.insurance` | **h3** | none |
| s16 | posts | B.18 | `section.news` | **h3**, 4 x **h4** | none |

**Heading outline on the home (A-7, no gaps):** h1 (s3) · h2 services · h3 x 4 cards · h3 x 2 callouts · h2 (s8) · h2 (s9)
· h3 x 3 trio · h2 frames · h2 cataract · h2 emergency · h2 reviews · h3 insurance · h3 news · h4 x 4 posts. No step
skips a level, so the source levels need no promotion (B.3, gap I.1).

**Home route table** (the river, 1.8; one table in `home.mjs`, emitted as `i.ra` direct children of each host, after its band layers). Starting
values are the prototype's tuned anchors (`styles.css` lines 635-802) in the 1.8 grammar; a value that was a CSS
expression of a token is its value at the layout's reference width (1440 for `d`, 390 for `p`). Re-verify with A-13 after
any change.

| host | key: `data-at` |
|---|---|
| `section.hero` | `h1`: `d:103%,64% p:104%,58%` (mobile optimisation, I.153: `p` was `104%,66%`) · `h2`: `d:CR+26,96% p:60%,92%` · `h3`: `d:off p:-3%,104%` |
| `section.intro` | `i1`: `d:CR-76,46% p:-3%,70%` · `i2`: `d:52%,100%-50px p:-3%,96%` |
| `section.services` | `s1`: `d:CL+50,242px p:-3%,161px` · `s2`: `d:15%,57% t:6%,46% p:-3%,40%` · `s3`: `d:50%,73% t:50%,62% p:30%,70%` · `s4`: `d:74%,100%-148px t:86%,93% p:64%,100%-122px` |
| `section.alumier` | `a1`: `d:CR-34,30px p:CR-30,28px` · `a2`: `d:R,62% p:103.5%,60%` |
| `section.callouts` | `c1`: `d:R,70% p:103.5%,60%` |
| `section.doctor` (s8) | `d1`: `d:86%,3% p:103.5%,20%` · `d2`: `d:36%,32% p:103.5%,50%` · `d3`: `d:1%,92% p:103.5%,90%` |
| `section.doctor` (s9) | `n1`: `d:L,60% p:103.5%,40%` · `n2`: `d:8%,103% p:103.5%,104%` |
| `section.lavender` | `l1`: `d:30%,-6px p:80%,-4px` · `l2`: `d:64%,4px p:30%,2px` · `l3`: `d:92%,8% p:-7%,10%` · `l4`: `d:R,70% p:-7%,70%` |
| `section.frames` | `f1`: `d:R,50% p:-7%,40%` · `f2`: `d:98%,100% p:-7%,96%` |
| `section.cataract` | `k1`: `d:84%,40% p:-5%,40%` · `k2`: `d:60%,104% p:-7%,104%` |
| `section.emergency` | `e1`: `d:30%,10% p:-7%,30%` · `e2`: `d:L,62% p:-7%,80%` |
| `section.reviews` | `r1`: `d:L,44% p:-5%,30%` · `r2`: `d:14%,102% t:L,100% p:-7%,96%` |
| `section.insurance` | `v1`: `d:CL-80,22% t:L,24% p:-7%,30%` · `v2`: `d:CL-80,92% t:L,90% p:-7%,90%` (integrate stage, gap I.74: the prototype's `d:4%` / `d:2%` ran the centre line 4 px from the insurance title at 1280x585) |
| `section.news` | `w1`: `d:22%,46% t:4%,64% p:-7%,30%` · `w2`: `d:76%,64% t:97%,74% p:-7%,70%` · `w3`: `d:96%,98% p:20%,99%` |
| `footer.site-footer` | `z1`: `d:72%,36px p:60%,34px` · `z2`: `d:34%,44px p:100%,40px` · `z3`: `d:-4%,46px p:104%,42px` |

37 anchors (36 at `d` and `t`, where `h3` is `off`; the prototype's 37 and DESIGN-SPEC U4's; corrected from "38", gap I.57). Weave zones: the Alumier card (`.alumier__card`, `s4` → `a2`, all layouts; B.7) and the hero frame
(`.frame__clip`, `h1` → `h2`, phone only; B.4: R3's in-front crossing within the first two phone screens, which the
Alumier card, five sections down, cannot give on a phone).

**Responsive:** the section order is the DOM order at every sweep size; each section's behaviour at 360 / 390 / 768 /
1024 / 1280x585 / 1440 / 1920 is in its own subsection (B.4-B.19). Anchors: `d` applies at 1280x585 / 1440 / 1920, `t`
at 1024, `p` at 360 / 390 / 768; a missing layout uses the next wider one (1.8), so an anchor with no `t` value uses its
`d` value at 1024.

### B.17 Insurance band (3.17; model s15)

**Model:** `s15.heading` (`level: 'h3'`, "Insurances We Accept At Riverside Family Eye Care"), `s15.blocks[0].html` (two `p`),
`s15.blocks[1]` (`cta`: "View All Our Insurance Plans" → `/insurance/`).

```html
<section class="insurance" data-band>
  <i class="ra" …></i>{… v1 v2}
  <div class="container pl-surface">
    <div class="insurance__inner rv">
      <h3 class="insurance__title section-title section-title--left wave-rule wave-rule--navy">{s15.heading.html}</h3>
      <div class="insurance__copy rich">{s15.blocks[0].html}</div>
      <div class="insurance__cta"><a class="btn btn--secondary" href="{cta.buttons[0].href}"><span>{cta.buttons[0].label}</span>{icon arrow}</a></div>
    </div>
  </div>
</section>
```

- The heading prints at its model level, **h3** (B.3, gap I.1), styled at the h2 size by `section-title`. The DOM order is
  title, copy, button (the focus order and the phone stack: button last). The editorial split (G12) is grid areas: the
  title and the button in the left 5fr column, the copy in the right 7fr column, left-aligned, `--ink-900` (no centred
  paragraph, U7).
- **Depth:** the `--lav-300` band, plane 0 (`--p`). **Reveal:** `insurance__inner`.
- **Responsive:** 360 / 390 / 768: stacked title, copy, button. 1024 / 1280x585 / 1440 / 1920: the 5fr / 7fr split.

### B.18 News cards (3.18; model s16)

**Model:** `s16.heading` (`level: 'h3'` whose `html` is an `a` to `/whats-new/`), `s16.blocks[0]` (`posts`, `view: 'grid'`,
4 items: `title`, `level: 'h4'`, `href`, `date {text, iso}`, `html` (one `p`: the excerpt, with the shortcode already
resolved, B2), `image: null`, `more: null`).

```html
<section class="news">
  <i class="ra" …></i>{… w1 w2 w3}
  <div class="container pl-surface">
    <h3 class="section-title wave-rule wave-rule--center">{s16.heading.html}</h3>
    <ul class="posts posts--grid" role="list">
      <li class="post surface surface--frost rv" data-tilt>                                   <!-- … each item -->
        <p class="post__date"><time datetime="{item.date.iso}">{item.date.text}</time></p>
        <h4 class="post__title"><a class="card__link" href="{item.href}">{item.title}</a></h4>
        <div class="post__excerpt rich rich--compact">{item.html}</div>
      </li>
    </ul>
  </div>
</section>
```

- Levels are the model's (**h3** heading, **h4** post titles; B.3, gap I.1). Cards are `frost-solid` (opaque, U5): the
  prototype's `surface--glass` with a blur override is replaced by `surface--frost`. The G8 top rule (3 px, `--teal-500`
  to `--violet-500`) is a CSS layer of `.post`.
- **Reveal:** each `li.post`. **Hover/focus:** B.8.
- **Responsive:** 360 / 390 / 768: one column. 1024: two columns. 1280x585 / 1440 / 1920: four columns. Gap
  `clamp(18px, 2vw, 28px)` (the prototype's `.posts`).

### B.19 Footer (3.19)

**Model:** `chrome.footer.menu[]` `{label, href, path}` (4), `chrome.footer.button` `{label, href}`, `chrome.footer.nap`
`{name, located, street, sep, locality, region, postalCode, postalEnd, phoneLabel, phone, phoneHref, phoneEnd,
site {label, href}, text}`, `chrome.footer.copyright`, `chrome.footer.util[]` (4); `chrome.social[]`
`{network, label, href, rel}` (4); `chrome.financing` `{label, href}` (its `why` is never rendered).

```html
<footer class="site-footer aurora-deep" data-band>
  <svg class="bank bank--up bank--footer pl-band" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">{the three bank paths}</svg>
  <i class="ra" …></i>{… z1 z2 z3: the footer horizon}
  <div class="container pl-surface footer__grid">
    <nav class="footer__menu" aria-label="Footer">
      <ul role="list"><li><a href="{m.href}">{m.label}</a></li></ul>                                         <!-- … 4 -->
    </nav>
    <div class="footer__social">
      <ul class="social" role="list">
        <li><a class="social__link" href="{s.href}" target="_blank" rel="{s.rel}" aria-label="{s.label}"><svg aria-hidden="true" focusable="false"><use href="#i-{s.network}"/></svg></a></li>   <!-- … 4 -->
      </ul>
      <a class="btn btn--light" href="{chrome.footer.button.href}">{icon calendar}<span>{chrome.footer.button.label}</span></a>
      <p class="footer__financing"><a href="{chrome.financing.href}">{chrome.financing.label}</a></p>
    </div>
    <p class="footer__nap"><strong>{nap.name}</strong>{nap.located}{nap.street}{nap.sep}{nap.locality}, {nap.region} {nap.postalCode}{nap.postalEnd} {nap.phoneLabel} <a href="{nap.phoneHref}">{nap.phone}</a>{nap.phoneEnd} <a href="{nap.site.href}">{nap.site.label}</a></p>
  </div>
  <div class="legal">
    <div class="container legal__inner">
      <p>{chrome.footer.copyright}</p>
      <ul role="list"><li><a href="{u.href}">{u.label}</a></li></ul>                                         <!-- … 4 -->
    </div>
  </div>
</footer>
```

- **NAP:** the template asserts at build time that `p.footer__nap`'s text content equals `nap.text` exactly (the `", "` and
  `" "` joins are the scaffold's); a mismatch fails the build. `nap.site.href` is page-relative in the model (the own
  site's home), so it gets no `target`.
- No logo, no platform credit, no Login, no voice search (C02). The footer is inside `#page` (the river settles into it as
  a horizon).
- **Depth:** A5 deep aurora (the element's own background), the bank on its upper edge (fill `--navy-950`), the `--p`
  overlay (a glow-violet pool rising); content plane 2. **Reveal:** never (chrome).
- **Hover/focus:** menu links: a `--teal-200` underline draws in; social circles lift 3 px, fill `--navy-700`, a `--teal-200`
  ring; legal links `--teal-200`; focus rings `--teal-200`.
- **Responsive:** 360 / 390 / 768: one column (menu; social, button and financing; NAP); the legal bar centred and
  wrapping. 1024: two columns, the NAP across both. 1280x585 / 1440 / 1920: three columns (menu 3fr, social 4fr, NAP 5fr).
  Menu and legal links are 44 px rows at every width; NAP links `overflow-wrap: anywhere`. Up to 768 px the legal list's
  own rows are centred too (`.legal ul { justify-content: center }`, mobile optimisation, M-LOOK-10, I.145): below about
  340 px the four links wrap, and their rows sat at the list's left edge under the centred '© 2026'.

### B.20 Breadcrumbs (3.20)

**Model:** `breadcrumbs[]` `{label, href, path, current}` (null on 9 models: `/`, `/cherry-payment-plan/`, the 6 templates,
`404.html`). Measured shape (140 trails): every non-last segment has an `href` (291); the last is `current` with
`href: null` (123 with a label, 17 empty: the archives). Lengths: 2 segments 32, 3: 66, 4: 41, 5: 1.

```html
<nav class="crumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="{c.href}">{c.label}</a><span class="crumbs__sep" aria-hidden="true"> » </span></li>    <!-- … every segment but the last -->
    <li><span aria-current="page">{c.label}</span></li>                                                  <!-- the last; omitted when its label is "" -->
  </ol>
</nav>
```

- The separator is the source's " » " as text inside the preceding item (BUILD-NOTES 5.8.4: parity reads it; never CSS
  `content`; the prototype's `li + li::before { content: "»" }` is not kept). An archive prints "Home » " and no empty
  item (the scaffold's rule).
- Links are `inline-flex` with `min-height: 44px` (U2); 15 px; `--teal-700` links, `--ink-900` current; wraps naturally.
- Inside the title-band pane (B.21). **Responsive:** identical markup at every width; at 390 the deepest trail
  (`/eye-care-services/eye-exams/pediatric-eye-exams/infantsee/`: "Home » Eye Care Services » Comprehensive Eye Exams »
  Kid’s Eye Exams in Fort Myers, FL » InfantSEE®") wraps to 3-4 lines.

### B.21 Interior title band (3.21)

**Model:** `h1` (`text`, `placement: 'band'` on 148 models), `breadcrumbs` (B.20), `date` (21 posts), the arch image (the
order below; [P4] `art.title`), the team page's `team` block (`members[0].photo` / `.placeholder` / `.position`), a hub's
`sections[0].background[0].image`. Theme: the band still [P2].

```html
<section class="titleband">
  <div class="hero__light pl-band" aria-hidden="true">
    <picture>
      <source media="(max-width: 768px)" srcset="{up}theme/media/hero-river-poster-phone.webp" width="720" height="1282">
      <img class="hero__poster" src="{up}theme/media/hero-river-poster.webp" alt="" width="1920" height="1068" decoding="async">
    </picture>
  </div>
  <i class="ra" aria-hidden="true" data-ra="t1" data-at="d:104%,58% m:104%,100%+90px p:104%,100%+46px"></i>
  <i class="ra" aria-hidden="true" data-ra="t2" data-at="d:84%,98% m:60%,100%+90px p:56%,100%+46px"></i>
  <i class="ra" aria-hidden="true" data-ra="t3" data-at="d:40%,110% p:-4%,108%"></i>
  <i class="rz" aria-hidden="true" data-occluder=".titleband__frame" data-from="t1" data-to="t3"[ data-on="d t"]></i> <!-- ? an arch is printed; data-on="d t" when it holds a plate -->
  <div class="container pl-surface pl-raise titleband__grid">
    <div class="titleband__pane surface surface--glass">
      {B.20 nav.crumbs}                                                                                    <!-- ? breadcrumbs not null -->
      <h1 id="page-title" class="wave-rule [h1--long|h1--xlong]">{h1.text}</h1>
      <p class="titleband__date"><time datetime="{date.iso}">{date.text}</time></p>                         <!-- ? date (posts) -->
      <p class="chip">{team.members[0].position}</p>                                                      <!-- ? team-member page, position not "" -->
    </div>
    <figure class="titleband__frame frame pl-break" data-protrude="arch" data-cross=".bank--title">         <!-- ? an arch (order below) -->
      <img data-depth="inner" src="{arch.url}" srcset="{[P1]}" sizes="{B.21 sizes}" alt="{arch.alt}" width="{arch.w}" height="{arch.h}" [style="--obj-pos: {objectPosition}"] fetchpriority="high" decoding="async">
      <!-- or, for a placeholder, in place of the img: <div class="ph-portrait" role="img" aria-label="{placeholder.label}" data-needs="{placeholder.needs}"> + the three spans of B.10 </div>,
           and then the frame is a div, not a figure: <div class="titleband__frame frame pl-break" data-protrude="arch" data-cross=".bank--title"> (I.119) -->
    </figure>
  </div>
  <svg class="bank bank--down bank--title pl-band" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">{the three bank paths}</svg>
</section>
```

- **Arch, resolution order (deterministic; DESIGN-SPEC 3.21 with the model as it is):**
  1. `team-member` family: the page's `team` block `members[0].photo` (an image), else its `.placeholder` (the plate of
     B.10). 9 pages resolve here (5 photos: Asma, Erica, Kristina, Nancy, Rose; 4 plates: Nelson, Heather, Longa,
     Xaiene). The two builder team pages carry no `team` block and no image of their person
     (`/team/dr-brittany-degler-od/`, `/team/jhonae-anglin/`: `images` and `placeholders` are empty): they use `art.title`
     when P4 gives it (Degler's own portrait; Jhonae's plate as `{ placeholder }`), else no arch (gap I.7).
  2. `builder-hub` family: `sections[0].background[0].image` when present (6 hubs: `/contact-lenses/`, `/eye-care-services/`,
     `/eyeglasses/`, `/insurance/`, `/our-eye-doctors/`, `/the-staff/`, all `from: 'column'`, 1280x853 or 1600x1200). The
     image is **moved** here: the first hub section no longer draws it (C.7).
  3. `art.title` [P4]: the section defaults of IMAGE-PLAN 4 (TB-ecs, TB-eyeglasses, TB-contacts, TB-insurance, TB-blog,
     TB-utility) and the real TB-contact photo (7 pages; it is in IMAGE-PLAN 4 but not in `image-plan.json` `images[]`, so
     P4 must add it: gap I.15).
  4. Otherwise (today, before P4): **no arch**. The frame, its weave zone and the LCP preload are omitted; the band and
     the pane render as usual, and the sidebar's crossing reserve collapses to its plain gap. Until P4 lands, 133 of the
     148 band models have no I-1 protrusion (124 generated defaults, 7 TB-contact pages, the 2 builder team pages; only
     the 9 team pages with a `team` block and the 6 hubs with a header photo have their arch from the model today; gap I.4).
  A page's own lead figure is **never** moved into the arch (DESIGN-SPEC 3.21; the count, gap I.30).
- **Alt:** the image's own model alt: a team photo's `photo.alt` (alt fidelity: it is not decorative); a hub header photo
  `""` (a background in the model); a generated default `""` (`art.title.alt`). A plate is `role="img"` named by its label.
- **Frame element (QA round 1, regressions R1; I.119):** `figure.titleband__frame` holds an image; the frame that holds a
  plate is `div.titleband__frame` (5 team pages: Nelson, Longa, Heather, Xaiene, Jhonae), the same classes and hooks,
  because the plate prints the person's name and `sr-fabrication` reads a `<figure>` with more than 20 characters of text
  as a testimonial (B.10). The CSS selects the frame by class only, so its box is unchanged (`layout-boxes.mjs`).
- `--obj-pos` (the arch image's `object-position`, default `50% 50%`) is set inline only when `art.title.objectPosition` is
  given (TB-ecs: `68% 62%`).
- **Images:** the frame is 4:5 and clips its image, which is 112% of the frame height (`top: -6%; height: 112%`, as the
  hero frame image, B.4) so it can sink 22 px without showing an edge: `fh/fw` = 1.25 x 1.12 = 1.4. `Wd`: `340px` at
  1417 px and up, `24vw` from 1024 (the `--arch-w` clamp);
  at 769-1023 `200px`; at p `min(150px, calc(38vw - 12px))`; portraits cap the frame at 300 px (`--arch-w` portrait
  maximum). Print `sizes="(min-width: 1417px) {340k}px, (min-width: 1024px) {24k}vw, (min-width: 769px) {200k}px,
  (min-width: 427px) {150k}px, calc({k} * (38vw - 12px))"` (portrait: 300 instead of 340, from 1250 px). The 3:2 hub
  photos give `k` = 2.1 (714 px at 1440; IMAGE-PLAN 4 computed 638 px for a frame without the overscan); the 640x640
  portraits `k` = 1.4.
- **h1 classes (correction, mobile optimisation, I.140):** since QA round 1 (LAYOUT-10, BUILD-NOTES 13) the template
  (`templates.mjs`, the title band) prints `h1--long` at 56-74 code points and `h1--xlong` at 75 or more (DESIGN-SPEC 2.3:
  80), so the build has 9 long and 5 xlong titles: `/insurance/` 75,
  `/scleral-contact-lenses-…/` 78 and `/top-causes-of-dry-eye-in-fort-myers/` 77 are xlong, not long as the census below
  (taken at 80) says. **Below 360 px `h1--xlong` is 1.5rem** (M-LAYOUT-10): at 320 the two 90 / 91-character titles ran
  6 lines at 1.75rem against DESIGN-SPEC 2.3's 5; now 5 (their first block 717 → 666 px), the other three 5 → 4; 360 px and
  up unchanged.
- **h1 classes (as first written):** `h1--long` when `h1.text` has 56-79 characters, `h1--xlong` at 80 or more (code points of the model text):
  12 long (`/cataract-surgery-co-management-your-path-to-clear-vision/` 57, `/contact-lenses/` 57,
  `/eye-care-services/lasik-refractive-surgery-co-management/` 58, `/eye-exam-faqs-what-to-expect-at-riverside-family-eye-care/`
  58, `/how-poor-vision-could-stunt-your-childs-academic-performance/` 61, `/insurance/` 75,
  `/riverside-family-eyecares-guide-to-visual-hygiene-on-electronic-devices/` 73,
  `/scleral-contact-lenses-a-comfortable-and-effective-vision-correction-solution/` 78, `/top-causes-of-dry-eye-in-fort-myers/`
  77, `/why-regular-optometry-visits-are-crucial-for-managing-eye-conditions/` 68,
  `/why-some-dry-eye-treatments-dont-work-what-actually-does/` 59, `/workplace-eye-wellness-tips-for-clearer-easier-workdays/` 56)
  and 2 xlong (`/what-every-mom-needs-to-know-…` 90, `/what-happens-during-a-dry-eye-assessment-…` 91). The 10 longest
  h1s are the A-10 sample. At p, `h1--xlong` is 1.75rem: the caps above never bite on phones, where `--h1-band` floors
  at 2rem, and the 91-character h1 then ran 6 lines at 390 with its first content block at 779 px (targets: 5 lines,
  700 px); with 1.75rem and the tighter phone band (padding 14 px top, pane 18 px, gap 14 px) it is 4 lines and 671 px
  (5 lines at 360; gap I.64).
- **Hub route (integrate stage, gap I.73):** on `tpl-hub` pages `t3` is `d:-4%,112% p:-4%,108%` (C.7); the code above is
  the article's.
- **Weave:** the over copy crosses the arch's lower edge (occluder `.titleband__frame`, the arch path; stretch `t1` → `t3`,
  both outside it), narrow strands only (B1). It never crosses the pane or the article card. The frame never moves (0.5:
  its image sinks at 0.92 instead of the frame moving at 1.06; **departure**, gap I.10). **Phone route (mobile
  optimisation, M-LAYOUT-1 = RL-MISS-1, I.120):** at p the route entered at 62% of the band and fell to the band bottom at
  64%, so the over copy crossed the arch's upper half (0.07-0.52 of its height: the eyes, nose and mouth of the staff
  portraits and the people of the hub photos, the monogram of the plates). `t1` and `t2` now run level at
  `100%+46px` (46 px below the band bottom; the arch overhangs it by half its height), `t2` at 56% so the level stretch
  spans the arch at 320-768: the over copy paints 0.69-0.91 of the arch height (the arch's lowest part, below every face;
  `tmp/mobile/fix-a/p/river.mjs`, geometry and pixels), every photo or generated arch keeps an in-front crossing within
  the first two phone screens (R3), and the `d` and `t` values are unchanged. **A plate is woven at d and t only**
  (`data-on="d t"`): its monogram ring spans 0.18-0.62 of the arch and its printed name 0.61-0.92 at 320 px (0.69-0.93
  at 768), and the 30 px strand band cannot pass between them at 320-360, so on phones the river passes behind the 5
  plates (Nelson, Heather, Jhonae, Longa, Xaiene). R3's phone crossing is given up on those 5 pages until their
  portraits arrive (a photo takes the moved route). At 769-1023 px the `t` layout read the `d` values (and also serves the
  locked 1024-1199 px), so the over copy crossed the arch at 0.13-0.63 of its height, the faces included (BUILD-NOTES 15.1,
  left open). **Route at 769-1023 px (fixer D1, I.151):** site.js's own layout `m` (1.8) reads `t1` `m:104%,100%+90px`
  and `t2` `m:60%,100%+90px`: level 90 px below the band bottom (the 200 px arch overhangs it by 125 px), `t2` left of the
  arch (which starts at 71-76 % of the width there), so the over copy paints 0.82-0.93 of the arch height, its lowest
  quarter (face zone 0 on all 143 photo and generated arches at 800x1280, 844x390, 1000x700 and 1023x768; R3's crossing
  kept); `t3` and 1024 px and up are unchanged. A plate's `data-on="d t"` does not name `m`, so the river passes behind
  the 5 plates at 769-1023 px too: there their printed name reaches 0.75 of the arch (Nelson's three lines 0.752-0.927;
  `tmp/mobile/fix-d1/results/plates-m.json`), so no level route crosses below the monogram without crossing the name.
- **Depth:** the band still plane 0 at 0.42 opacity (A6; the 0.3x translate and fade of 1.4); the pane plane-2 glass; the
  arch `pl-break` in a `pl-raise` container (it crosses into `div.layout`). **Reveal:** none (first screen).
  **Hover:** the crumb links.
- **Responsive:** 1440 / 1920: the pane left (1fr), the arch right (`--arch-w`), crossing the bank by `--arch-cross` into
  the sidebar column; the aside's `margin-top` reserves the crossing plus 32 px (C.1); on hubs (no aside) the first
  section reserves it on the right half with a right float in its `band__inner` (`::before`, `--arch-w` wide, the crossing
  plus 32 px less the band's top padding tall), so the section's lines wrap clear of the arch; the CSS keys every reserve
  on `.titleband:has(.titleband__frame)`, so a band without an arch reserves nothing. 1280x585 (s): band padding 16 px top, 48 px bottom; pane padding
  20 / 28 px; `--h1-band` capped by `8.5vh`; acceptance: the h1 and the start of the first content block visible at load
  for every page whose h1 is 3 lines or less. 1024: the desktop placement with the 300 px aside. 768 (769-1023 uses the
  same): the phone placement with the arch at `min(30%, 200px)`. 360 / 390: the pane full width; the arch
  `min(38%, 150px)`, right-aligned below the pane, overlapping the bank by half its height; the article's top padding
  equals that overlap plus 24 px; acceptance at 390x844: breadcrumb, h1 and the first content block start within 700 px
  (G5). **Phone arch rise (mobile optimisation, M-LOOK-14 = operator option 6b, I.150; 768 px and below, the band's own
  phone breakpoint):** the band has no bottom padding (`--tb-pad-bottom: 0`, only with an arch) and the arch a negative
  top margin, so it rises from 14 px below the pane into the pane's lower-right corner by 34 px; by 70 px where a post's
  date row lies under the h1 (`.titleband__grid:has(> .titleband__pane > .titleband__date)`), by 19 px on a team page
  with a position chip (`:has(> .titleband__pane > .chip)`: a long chip reaches the arch's columns at 320-390 px); never
  so far that the bank's crest (8 px below its top edge) would pass under the pane (`min(…, min(38%, 150px) * .625 -
  var(--bank-h) + 8px)`: 30.4 px at 320). The arch only covers the room the pane leaves free below its text in the
  arch's columns (the h1's wave rule row and the pane's bottom padding, 35-36 px with A-14's 6 px), so the h1 keeps its
  full width and its line breaks (G5: identical on all 148 title-band pages at 320 / 360 / 390 / 412 / 430 / 768). The
  band ends at the arch's middle, so the arch still overhangs the bank by half its height and the article's reserve is
  unchanged: the first content starts 48 px earlier (44.4 at 320), 53.9-69.7 on dated posts, 33 on chip pages.
  769-1023 px keep the specified placement (3.21).
- **No-occlusion (protrusion I-1):** crossing = `--arch-cross` (d) or half the arch height (t, p); reservation = the aside's
  `margin-top` (d) / the first hub section's right-half float (hubs) / the article's top padding (t, p), each from
  the same token; parallax: none on the frame (its image moves inside the clip).

### B.22 Long-form prose (3.22)

**Model:** the sections and blocks of every `tpl-article` page (and of the long-form hub sections, C.7): `sections[].heading`,
`prose` blocks' `html`, `callout` blocks, `video` blocks, every other block type placed in the flow (B.31), the CTA lift
(B.24). The element set and every rule: section D.

```html
<article class="prose-card surface surface--paper">
  <div class="prose rich">
    {the article flow, in model order:}
    <h2>{section.heading.html}</h2>                                                          <!-- ? section heading, at its level -->
    {prose block html, after the D.7 transforms}                                              <!-- prose block -->
    <h2>{callout.title.html}</h2>                                                            <!-- titled callout: the title at its level … -->
    <h2><a href="{callout.title.href}">{callout.title.html}</a></h2>                          <!-- … linked when title.href -->
    <p class="callout-title">{callout.title.html}</p>                                         <!-- … a title with level null -->
    {callout.html}                                                                           <!-- … then its html (image first when imageFirst) -->
    <div class="btn-row">{B.0 buttons}</div>                                                 <!-- … then its buttons -->
    <div class="panel surface surface--tint">{image}{callout.html}<div class="btn-row">…</div></div>   <!-- untitled callout (title null) -->
    <figure class="video"><div class="video__frame"><video controls preload="none" playsinline>…</video></div></figure>   <!-- video block -->
    {component blocks: one top-level classed div per block (B.25, B.26, B.31, F)}
  </div>
</article>
```

- **One flow per article:** every section and block of the page, in model order, inside one `div.prose.rich`; no wrapper per
  section (the h2 parts are the source's own split). A block that is not prose prints as one top-level element with a class
  (a `div`, a `figure` or `ul` with a class): D's classless-scoped rules never style it, and the scoped measure rule
  (D.1) never catches it.
- **Callouts in long-form:** a titled callout is a sub-section: its title at its model level (h2 on all 26 interior titled
  callouts here), its image as a media figure built like a model figure (`figure.fig.fig--{image.role}` >
  `span.fig__media` > `img`, D.5; before the text when `imageFirst`), its `html` inline, its buttons as `div.btn-row`. A
  title whose `level` is null prints as `p.callout-title` (the scaffold's `p`; heading-parity). An untitled callout
  (`title: null`, including `titleIsPageH1` callouts whose title moved to the band) is a `tint-panel`: `div.panel.surface
  .surface--tint`. Counts (interior callouts, 30): titled h2 26 (4 with a button, 7 with empty `html`), untitled 4 (3 with
  a button, 1 `titleIsPageH1`).
- **Video blocks** (`kind: 'file'`, 3: two on `/eye-care-services/dry-eye-disease-and-treatment/`, one on
  `/team/jhonae-anglin/`): `figure.video > div.video__frame > video[controls][preload="none"][playsinline]` with one
  `<source src="{s.src}" type="{s.type}">` per `sources[]` item; `poster="{video.poster.url}"` only when P6 gives one
  (all 3 are null today: the frame shows the CSS poster, navy glass with the native play control, no invented frame).
  The frame is 16:9, radius `--r-l`, `--navy-950`, `--sh-2`, wide placement (D.5). No caption track exists (Q-9).
  **Departure** from DESIGN-SPEC 3.22, which writes `figure.wide > video`: the figure is `figure.video` and takes the D.5
  `fig--wide` placement (one breakout rule written for `:is(figure.fig--wide, figure.video)`), so the site has one name for
  "wide", not two. The
  extra `div.video__frame` carries the 16:9 box, the radius, the clip and the navy CSS poster, independent of the native
  `video` box, which the browser sizes and paints itself before metadata loads (`preload="none"`). The prototype class
  `wide` is not kept (H.2; gap I.48). With no poster, Chromium's native controls paint a #333 default poster over the
  whole frame (their `-webkit-media-controls` container, state `use-default-poster`), which hid the navy CSS poster at
  every width; below 1024 px that container is transparent (`.video__frame > video::-webkit-media-controls
  { background-color: transparent }`, mobile optimisation, M-LOOK-12, I.147): the navy shows, and the control bar keeps its
  own scrim (`-webkit-media-controls-panel`), so the play button and the bar over a playing picture look as before. 1024 px
  and up still show the grey (desktop frozen; a site-wide version is the operator's call). Chromium only; WebKit unverified.
  (`kind: 'iframe'` video blocks: none on this site; they would print `div.embed.embed--video > iframe[src][title]
  [loading="lazy"][allowfullscreen]` as the prose embed does.)
- **The added illustration** (`art.inline[]` [P4], DESIGN-SPEC 3.22): D.6.
- **Article card:** `paper`, radius `--r-l`, padding `clamp(24px, 4vw, 60px)` (top `clamp(40px, 5vw, 70px)`); at 767 px
  and below **full-bleed** (no side margin, radius 0, padding = `--gutter`; U7: a 358 px column at 390). Body
  `--step-prose` / 1.7 `--ink-700`; `.prose { overflow-wrap: break-word }`, `.prose a { overflow-wrap: anywhere }` (U6).
- **Depth:** plane-2 paper (opaque, U5; no backdrop filter). **Reveal:** none (the article is read at once; only the CTA
  band reveals). **Hover:** prose links (D.4), component cards (B.8).
- **Responsive:** 360 / 390: full-bleed card, 358 px column. 768: the card with side margins (the article column is the
  whole container: no aside column yet). 1024: the article column beside the 300 px aside. 1280x585 / 1440 / 1920: beside
  the 340 px aside; the measure (68ch) holds the line length at 60-75 characters (B6).

### B.23 Aside and sidebar widgets (3.23)

**Model:** `aside` `{ variant ('standard' 131, 'location-page' 1), quickActions[] {label, href, icon}, social[]
{network, label, href, rel}, location {title {text, href}, address [lines], contacts [{type, label, value, href, note}],
hours [[day, [intervals]]], map {src, title, fallbackLabel}} or null }` (null `location` on the location-page variant).

```html
<aside class="sidebar" aria-labelledby="loc-title">                                     <!-- location-page variant: no aria-labelledby -->
  <div class="side-card side-card--actions surface surface--glass">
    <ul class="qa-list" role="list">
      <li><a class="qa [qa--navy]" href="{qa.href}">{icon calendar|mail}<span>{qa.label}</span></a></li>    <!-- … 2; qa--navy when icon is 'mail' -->
    </ul>
    <ul class="social" role="list">{the 4 social links of B.19, from aside.social}</ul>
  </div>
  <div class="side-card side-card--loc loc surface surface--paper">                    <!-- ? aside.location not null -->
    <h2 class="loc__title" id="loc-title"><a href="{location.title.href}">{location.title.text}</a></h2>
    <address class="loc__address">{address[0]}<br>{address[1]}</address>
    <ul class="contact" role="list">
      <li><strong>{c.label}</strong> <a href="{c.href}">{c.value}</a></li>                  <!-- … each contact; plain {c.value} when href is null (Fax) -->
    </ul>
    <p class="note">{the Email contact's note}</p>                                          <!-- ? a contact has a note -->
    <table class="hours">
      <tbody>
        <tr><th scope="row">{day}:</th><td>{interval}<br>{interval}</td></tr>               <!-- … 7 rows; one line per interval (Friday has 2) -->
      </tbody>
    </table>
    <a class="mapcard" href="{location.map.src without '&output=embed'}" target="_blank" rel="noopener">{icon pin}<span>{location.map.fallbackLabel}</span></a>
  </div>
</aside>
```

- `{day}:` the colon is the source's label punctuation (raw: `strong.ecp-post-label` "Monday:"; the model drops it; the
  scaffold prints it, 0.9). Digits in the figures face.
- **Map card (Q-11):** a static link (no iframe on 131 pages); its href is `map.src`
  (`https://www.google.com/maps?q=…&output=embed`) with the `&output=embed` parameter removed, which opens the same query
  in Google Maps; its label `map.fallbackLabel` ("Open in Google Maps", chrome `mapsLinkLabel`, declared authored).
  `map.title` ("Google map") is not printed here (it titles the live iframes of B.31 `visit`).
- **Sticky (G1):** at `(min-width: 1024px) and (min-height: 860px)` the aside stretches to the article's height and
  `.side-card--loc` is `position: sticky; top: calc(var(--navbar-h) + 24px)`. Below that height (the operator view) it
  scrolls. CSS only (1.11).
- **River:** the article route runs down the sidebar column below the cards (C.1 anchors `p3`, `p4`).
- **Depth:** plane 2 (glass, paper). **Reveal:** none. **Hover/focus:** quick actions slide 4 px and darken; social circles
  rise 3 px, fill change, ring; links underline (D.4 rules for `a:not([class])`).
- **Responsive:** 1024 and up: the second grid column (`--side-w` 300 / 340), `margin-top` = the arch crossing + 32 px;
  below 1024: after the article and the CTA band, full width, the two cards side by side from 600 px and stacked below.
  Below 360 px the cards' inline padding is 18 px and a quick action's 12 px (mobile optimisation, M-LAYOUT-2, I.127):
  'Request An Appointment' holds one line at 320 (it broke onto two on all 132 sidebar pages); the 52 px row is unchanged.

### B.24 CTA band (3.24)

**Model:** the page's last block when it is a `callout` or `cta` whose buttons include the appointment form or a `tel:`
link. Qualifying on this site (`facts.mjs`, 4 pages): `/eye-care-services/dry-eye-disease-and-treatment/` (callout h2 "Enjoy
Dry Eye Care Beyond the Basics" + "Schedule Appointment"), `/eye-care-services/management-of-ocular-diseases/glaucoma/`
(callout h2 "Ongoing Eye Disease Care in Fort Myers"), `/eye-care-services/nearsighted-myopia/` (callout h2 "Schedule Your
Child's Myopia Evaluation in Southwest Florida"), and `/team/dr-brittany-degler-od/` (a bare `cta`, "Request Appointment",
no title and no text). Not qualifying: `/hours-location/` (cta to `/insurance/`), `/our-eye-doctors/` (a callout with no
button). The home never gets a CTA band (the insurance band closes it).

```html
<section class="ctaband aurora-deep rv">
  <i class="ra" aria-hidden="true" data-ra="q1" data-at="d:64%,56% p:18%,50%"></i>
  <div class="ctaband__panel surface surface--navy">
    <div class="ctaband__text">                                                                 <!-- ? the block has a title or html -->
      <h2 class="wave-rule wave-rule--light" id="cta-title">{title.html}</h2>                   <!-- at title.level -->
      <div class="ctaband__copy rich">{callout.html}</div>
    </div>
    <div class="ctaband__actions">
      <a class="btn btn--light btn--lg" href="{appointment button href}">{icon calendar}<span>{label}</span></a>     <!-- the block's own buttons, in model order -->
      <a class="btn btn--primary btn--lg" href="{chrome.topbar.call.href}">{icon phone}<span>{chrome.topbar.call.label}</span></a>
    </div>
  </div>
</section>
```

- The block is **lifted** out of the article flow into this band, placed in `div.layout` after the article (DOM order:
  article, CTA band, aside; the grid puts the aside in row 1 and the band across row 2). It stays inside `<main>`, so every
  gate sees it where it was (link, heading and sentence parity are unaffected).
- The block's own buttons keep their labels and targets; an appointment button is `btn--light btn--lg` with the calendar
  icon (a fixed variant), a `tel:` button `btn--primary btn--lg`. The chrome call action repeats `chrome.topbar.call` exactly
  (Q-2, declared): it is printed unless the block already has a `tel:` button.
- A bare `cta` (the Degler page) prints no `div.ctaband__text`; the band then has no heading and no `id="cta-title"`, and
  the `section` stays unnamed (gap I.22).
- **Depth:** A5 deep aurora (`aurora-deep`, static) behind the `glass-navy` panel; radius `--r-xl`; split 1.4fr / auto.
  **Reveal:** the band (`.rv`). **Hover:** buttons.
- **Responsive:** 1024 and up: across both layout columns, the split panel. Below 1024: full container width, actions under
  the text, buttons full width at n. Up to 420 px the panel's inline padding is 20 px (mobile optimisation, M-LAYOUT-2 +
  M-LOOK-4, I.127; the band's 10 px navy frame around the panel is kept, the auditor's `.ctaband { padding: 0 }` was not
  taken): with the phone pill padding (B.0) 'Schedule Appointment' holds one line from 360 px; at 320 it breaks 1 + 1.

### B.25 Forms (3.25)

**Model:** the `form` block (2: `/contact-us/appointment-request-form/` gform_9, 9 fields; `/contact-us/contact-form/`
gform_10, 7 fields): `html` (the inert markup, section E) and `form` (parsed data; not printed).

```html
<div class="form-card surface surface--paper">
  {form.html, verbatim}
</div>
```

- The form markup is printed as the model gives it; every element, class and attribute it carries is in section E with its
  rule. The intro prose of the appointment page (a `prose` block before the form, in the same section) stays in the flow
  above the card.
- **Depth:** a paper card in the article flow. **Reveal:** never. **Hover/focus:** E.4.
- **Responsive:** `.form__grid` one column; `.field__row` two columns from 600 px (First / Last); the submit full width at n.

### B.26 Accordion (3.26)

**Model:** the `accordion` block `items[{ q, html }]` (9 blocks, 35 items on 3 pages: `/eye-care-services/faq/` 7 blocks
29 items, `/eye-care-services/cataract-surgery-co-management/` 1 block 3 items, `/eye-care-services/dry-eye-disease-and-treatment/`
1 block 3 items; every `q` is plain text).

```html
<div class="faq">
  <details class="faq__item">                                                             <!-- … each item -->
    <summary><span class="faq__q">{item.q}</span>{icon chev}</summary>
    <div class="faq__a rich">{item.html}</div>
  </details>
</div>
```

- Native `<details>`: keyboard and AT behaviour are the browser's; site.js never touches it (1.12). Closed: `--tint-lav`
  fill, 1 px `rgb(64 77 138 / .16)` border, radius `--r-m`. Open: white, `--sh-1`. `summary`: `min-height: 56px`, padding
  12 / 20, navy 700 `--step-1`, the chevron right (`--teal-700`, rotates 180 deg), no default marker, focus ring. Answer
  padding 0 20 18. Open and close animate with `::details-content`, `interpolate-size: allow-keywords` and a
  `content-visibility` allow-discrete transition (480 ms `--ease-out`) inside `@media (prefers-reduced-motion:
  no-preference)` and `@supports`; other browsers open at once.
- `summary` holds the question as plain text in a `span` (not a heading: the source's questions are not heading elements,
  and the scaffold's `<summary>` passes heading-parity).
- **Reveal:** never. **Responsive:** full flow width, 12 px gaps, at every width. Below 1024 px the question's lines are
  balanced (`.faq__item > summary { text-wrap: balance }`, inherited by `span.faq__q`; mobile optimisation, M-LOOK-6, I.143):
  questions ending on one word alone went 12 → 1 of 29 at 320 px and 13 → 0 at 360; line counts unchanged.
- **Hover:** the question's `--navy-900` hover colour applies under `@media (hover: hover), (min-width: 1024px)` (mobile
  optimisation, M-TOUCH-4, I.133; B.0): on a touch phone a tapped question keeps `--navy-700`.

### B.27 Team cards (3.27; builder hubs and `team` blocks with several members)

**Model:** `team` blocks with `view: 'complete'` and several members: `/the-staff/` (8 members, `level: 'h3'`, all with a
`position`, a `more` link and `categories: "Our Staff"`; 5 photos, 3 placeholders) and `/our-eye-doctors/` (3 members,
h3, `categories: "Our Doctors"`, 1 photo, 2 placeholders). Fields: `name`, `level`, `href`, `position`, `photo` /
`placeholder`, `html` (the excerpt bio), `more {label, href, ariaLabel}`.

```html
<ul class="team-grid" role="list">
  <li class="member surface surface--frost" data-tilt>                                     <!-- … each member -->
    <div class="member__photo frame pl-break" data-protrude="member-{n}" data-cross="parent">
      <img src="{photo.url}" srcset="{[P1]}" sizes="{B.27 sizes}" alt="{photo.alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
      <!-- or the placeholder plate of B.10 with host classes "member__photo frame ph-portrait pl-break" -->
    </div>
    <div class="member__body rv">
      <{level} class="member__name"><a class="card__link" href="{member.href}">{member.name}</a></{level}>
      <p class="chip">{member.position}</p>                                               <!-- ? position not "" -->
      <div class="member__bio rich rich--compact">{member.html}</div>
      <p class="member__more"><a class="more" href="{more.href}" aria-label="{more.ariaLabel}">{more.label}</a></p>   <!-- ? more -->
    </div>
  </li>
</ul>
```

- **Which layout (first match wins):**
  1. **On a `team-member` page** (`view: 'complete'`, one member with `name: ""`, `level: null`, `href: null`; 9 pages):
     the block prints the bio only, `{member.html}` **inline in the article flow** (no wrapper, so its paragraphs and h2s
     take the `.prose >` measure and rhythm); the photo or plate is in the title arch and the position is the band chip
     (B.21). Nothing else of the member prints (DESIGN-SPEC 3.27). This rule wins over 2 for the two doctors' own pages.
  2. **Doctor layout:** a `team` block whose members all have `categories === 'Our Doctors'` renders as stacked doctor
     blocks (B.10 markup, one per member, alternating `doctor__grid--flip`) instead of the grid: `/our-eye-doctors/` (3)
     and the home's s8/s9 (one member each). Where the member has a `level` (h3 on `/our-eye-doctors/`) the name is a
     heading at that level inside `doctor__text` (above the bio) instead of `p.doctor__tag`; the bio is `member.html` in
     `div.doctor__prose.rich`, then `a.more` in `p.member__more`. Inside a hub section each block is
     `div.doctor > div.doctor__grid` (no `section` and no `.container` of its own: the band gives both); on the home it is
     B.10's `section.doctor`.
  3. **Grid** (the markup above): every other `team` block (`/the-staff/`, 8 members).
- **The doctor layout inside a hub section** (rule 2, `/our-eye-doctors/`), written out:

  ```html
  <div class="doctor">                                                                        <!-- … each member, in model order, inside div.band__inner (C.7) -->
    <div class="doctor__grid [doctor__grid--flip]">                                          <!-- flip on the 2nd, 4th, … member -->
      <figure class="doctor__portrait">
        <div class="doctor__plate" aria-hidden="true"></div>
        <div class="doctor__photo frame pl-break" data-protrude="doctor-photo-{n}" data-cross=".doctor__plate" data-depth="fore-soft">
          <img src="{member.photo.url}" srcset="{[P1]}" sizes="(min-width: 1200px) 395px, (min-width: 769px) 33vw, min(303px, calc(72vw - 23px))" alt="{member.photo.alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
        </div>                                                                                <!-- or the B.10 placeholder plate (div.doctor__photo.frame.ph-portrait.pl-break) -->
      </figure>
      <div class="doctor__text surface surface--paper rv">
        <{member.level} class="doctor__tag"><a href="{member.href}">{member.name}</a></{member.level}>   <!-- p.doctor__tag when level is null (the home) -->
        <div class="doctor__prose rich">{member.html}</div>
        <p class="member__more"><a class="more" href="{more.href}" aria-label="{more.ariaLabel}">{more.label}</a></p>   <!-- ? more -->
      </div>
    </div>
  </div>
  ```

  The name heading takes `doctor__tag` (the B.10 tag-link look; its size comes from the class, not the level, B.3) and its
  link is a 44 px standalone link (B.0). `{n}` numbers the members from 1 in the section.
- **Images:** square portraits (640x640; Kristina 607x640) in a square `--r-l` frame breaking 48 px above the card top:
  `k` = 1 (Kristina 1.05); `Wd` 230px, `Wt` `calc(33vw - 50px)`, `Wp` `calc(50vw - 40px)` at 769-1023 px, `calc(46vw -
  56px)` at 600-768 px (mobile optimisation, M-SPEED-5, I.136: two columns, (100vw - 2 x the 4vw gutter - the 20 px gap) / 2
  - 2 x 22 px padding - 2 px border; 251 px at 667, where `calc(50vw - 40px)` said 294 px and took the 640 w file at 667x375
  DPR 2 for 540 w), `calc(100vw - 80px)` below 600 px; each times `k`, plus the 0.8 phone twins.
- **Depth:** frost cards plane 2; portraits `pl-break` (no parallax). **Reveal:** `member__body` (the card holds a
  protrusion). **Hover/focus:** B.8; the `more` link sits above the stretched link.
- **Responsive:** 4 / 3 / 2 / 1 columns at 1200+ / 1024-1199 / 600-1023 / below; the break 48 px at a, 32 px below.
- **No-occlusion:** the portrait crosses its own card's top edge by 48 / 32 px; reservation = the grid's top margin and row
  gap of 48 + 16 px (32 + 16 px).

### B.28 Blog index and archive cards (3.28)

**Model:** `posts` blocks (3): `/whats-new/` `view: 'summary'` (21 items, `level: 'h2'`, `date` on 21, `html` excerpt on
21, `more` "Read More" with `ariaLabel` on 21, `image: null`); `/sitemap/` `view: 'list'` (21 items, h2, date, html, no
more); the home `view: 'grid'` (B.18). `childpages` blocks (30): `archive` 13 (34 items, every `summary` empty), `plain`
14 (48 items: 13 interior listings and the `/insurance/` hub), `thumbs` 3 (26 items on 3 hubs, 24 thumbs, 2
`thumbDropped`).

```html
<ul class="posts posts--{view}" role="list">                                               <!-- summary and list views -->
  <li class="post surface surface--frost rv" data-tilt>                                    <!-- … each item -->
    <p class="post__date"><time datetime="{item.date.iso}">{item.date.text}</time></p>      <!-- ? date -->
    <{item.level} class="post__title"><a class="card__link" href="{item.href}">{item.title}</a></{item.level}>
    <div class="post__excerpt rich rich--compact">{item.html}</div>                                      <!-- ? html -->
    <p class="post__more"><a class="more" href="{more.href}" aria-label="{more.ariaLabel}">{more.label}</a></p>   <!-- ? more -->
  </li>
</ul>

<ul class="archive-list" role="list">                                                      <!-- childpages variant 'archive' -->
  <li class="archive-row surface surface--paper"><a class="archive-row__link" href="{item.href}"><span>{item.title}</span>{icon chev}</a></li>
</ul>
```

- Blog index (`/whats-new/`): `posts--summary`, two columns at 1024 px and up (one below), the G8 top rule, the date
  eyebrow, the title at its model level (h2) with the stretched link, the excerpt and "Read More". No pagination (as at
  source). The sitemap's list view uses the same card in one column (F.5).
- Archives (13 listing pages): a single column of paper rows (the title link, a chevron icon rotated -90 deg, a 4 px
  hover slide; 56 px rows). Every archive summary is empty, so no summary prints. The four "Nothing Found" archives print
  their prose in the article card (F.4).
- Child-page listings (`plain`, `thumbs`): F.2.
- **Reveal:** each `li.post`; archive rows are not gated. **Hover/focus:** B.8 for posts; rows slide and the title
  underlines.
- **Responsive:** `posts--summary`: one column at 360 / 390 / 768, two at 1024 / 1280x585 / 1440 / 1920 (gap
  `clamp(18px, 2vw, 28px)`, the prototype's `.posts` gap, as B.18). `posts--list`: one column at every size. Archive rows: one column, at least 56 px tall at every size;
  a long title wraps beside the chevron, which stays at the row's right edge.

### B.29 Legal pages (3.29)

**Model:** 3 `legal` pages (`/disclaimer/`, `/privacy-policy/`, `/website-accessibility-policy/`), classic, prose only.

```html
<body class="page-legal tpl-article has-aside">
  …
  <main id="main" tabindex="-1">
    <section class="titleband">…</section>                                                <!-- B.21: crumbs, h1, the TB-utility arch [P4] -->
    <div class="layout">
      <i class="ra" …></i>{p1-p4}
      <div class="container pl-surface layout__grid">
        <article class="prose-card surface surface--paper"><div class="prose rich">{the h2 sections and their prose}</div></article>
        <aside class="sidebar" aria-labelledby="loc-title">…</aside>                       <!-- B.23 -->
      </div>
    </div>
  </main>
  …
</body>
```

- The title band with the arch from `art.title` (TB-utility) [P4], the article card with the prose flow only. The body class
  `page-legal` sets `--measure: 66ch` on `.prose`. h2 / h3 in the standard styles, lists with wave bullets, links underlined.
  Of the prose enhancers only the lead rule (and the link-line target marker) applies (D.6); lists stay one column. The privacy policy's placeholder clause
  prints verbatim (Q-12). No extra markup.
- **Responsive:** the article frame (C.1, B.22): 360 / 390 the full-bleed card (a 358 px column at 390); 768 the card
  with side margins, the aside below it; 1024 the 300 px aside beside the article; 1280x585 / 1440 / 1920 the 340 px
  aside. The 66ch measure caps the line wherever the column is wider than it.

### B.30 404 (3.30)

**Model:** `/404-page-not-found/` (`family: 'not-found'`, aside standard) and `404.json` → `dist/404.html` (`as404: true`,
depth 0, `aside: null`, `breadcrumbs: null`, noindex). Both: `h1` "404", 3 article sections (h2 "If you can't read this 404
message," / "The Diagnosis" / "The Treatment", each with an h3 and a paragraph; the last holds a link to the home).

```html
<body class="page-not-found tpl-article">                                                 <!-- 404.html; /404-page-not-found/ adds has-aside -->
  …
  <main id="main" tabindex="-1">
    <section class="titleband">…<h1 id="page-title" class="wave-rule">404</h1>…</section>    <!-- no nav.crumbs on 404.html -->
    <div class="layout">
      <i class="ra" …></i>{p1-p4}
      <div class="container pl-surface layout__grid">
        <article class="prose-card surface surface--paper"><div class="prose rich">{3 x h2 + h3 + p}</div></article>
        <!-- aside.sidebar only on /404-page-not-found/ -->
      </div>
    </div>
  </main>
  …
</body>
```

- The title band (no crumbs on `404.html`) with the utility arch (`art.title`, TB-utility) [P4], the model's prose in the
  article card, and the aside **only where the model has one** (`/404-page-not-found/`). DESIGN-SPEC 3.30 shows the aside on
  both; the `404.html` model carries none, so it renders without (gap I.8). No search (Q13). The build rewrites
  `404.html`'s URLs root-relative under the deploy base (A.1).
- **Responsive:** `/404-page-not-found/` as B.29 (the C.1 frame with its aside). `dist/404.html`: the same band and
  card, one grid column at every sweep size (no aside, C.1), so the card spans the container from 768 px up and is
  full-bleed at 360 / 390.

### B.31 Other blocks (3.31)

Every block type of the closed set, with its markup. Blocks inside the article flow print as one classed top-level element
(B.22); on hubs they sit in hub sections (C.7).

| block | markup | notes |
|---|---|---|
| `prose` | the html in the flow (B.22) or in a `rich` container (home, hubs) | D |
| `callout` | B.22 (long-form), C.7 (hubs), B.6 / B.7 / B.9 / B.11 (home) | |
| `badges` | `<ul class="qa-row" role="list"><li><a class="qa [qa--navy]" href="{i.href}" [target="_blank" rel="noopener"]>{icon i.icon}<span>{i.label}</span></a></li>…</ul>` | the quick-action pills of B.23 in a row; `qa--navy` when `icon` is `mail`; `target` only when `newTab` (false on all 14). 7 blocks, all on hubs |
| `cta` | `<div class="btn-row">{B.0 buttons}</div>` | 17 blocks (11 pages); variants by B.0 |
| `childpages` | F.2 (`plain`, `thumbs`), B.28 (`archive`) | 30 blocks |
| `posts` | B.18 (`grid`), B.28 (`summary`, `list`) | 3 blocks |
| `team` | B.10 (doctors), B.27 (grid), B.27 (team-member bio) | 13 blocks |
| `testimonials` | F.6 | 2 blocks (`/contact-us/testimonials/`, `/testimonial/this-was-a-great-experience/`) |
| `reviews` | B.15 (the home carousel); elsewhere a static card, F.6 | 2 blocks (home 5 items; `/eyeglasses/designer-frames/` 1) |
| `visit` | F.8 | 3 blocks (`/hours-location/` summary, `/location/riverside-family-eyecare/` complete, `/contact-us/` list) |
| `hours` | `<table class="hours">` as in B.23 | none on this site (closed set) |
| `products` | F.7 | 7 blocks, 53 items, 4 contact-lens brand pages |
| `equipment` | F.7 | 1 block, 9 items (`/eye-care-services/eye-exams/advanced-technology/`) |
| `gallery` | B.12 | 1 (home) |
| `logos` | `<ul class="logo-wall logo-wall--{kind}" role="list"><li class="logo-wall__chip">[<a href="{i.href}">]<img src srcset="{[P1]}" sizes="{w}px" alt="{i.image.alt}" width height loading="lazy" decoding="async">[</a>]</li>…</ul>` (a natural-width slot, 0.8, I.68) | `frame-brands` (27, `/eyeglasses/designer-frames/`), `carriers` (16 + 6, `/insurance/`); every `alt` equals the `name`; `href` null on all 49; white chips 133x110 minimum, `contain`, radius `--r-s`, hairline; the grid of D's `ul.logo-grid` (at most 6 columns) |
| `sitemap` | F.5 | 1 block, 92 items, depths 0-3 |
| `docs` | `<ul class="docs" role="list"><li><a href="{d.href}" type="application/pdf">{d.label}</a>{d.after}</li> or <li><span class="doc" data-needs="{d.needs}">{d.label}</span>{d.after}</li></ul>` | 1 item (`/contact-us/patient-forms/`): `href: null`, `needs: 'pdf file'`, so the `span` form (no invented link). `.docs { margin: 0 }` beats the flow's `.prose > * + *` by source order (the I.65 pattern), so the list sat 0 px under the sentence above it; below 1024 px `.prose > .docs:not(:first-child)` takes the flow's 1em (17-18.5 px; mobile optimisation, M-LAYOUT-8, I.138); 1024 px and up keep 0 |
| `form` | B.25, E | 2 |
| `cherry` | link mode: `<p class="cherry-link"><a class="btn btn--primary" href="{applyUrl}"><span>{label}</span>{icon arrow}</a></p>` (B.0: an external target), or `<p class="cherry-link"><span class="cherry-link__pending" data-needs="{needs}">{label}</span></p>` when `applyUrl` is null; embed mode (`RFEC_CHERRY=embed`): `<div class="cherry">{snippet}</div>` unchanged | today link mode, `applyUrl: null`, so the muted pill `span[data-needs="cherry application url"]` "Cherry Payment Plan" |
| `video` | B.22 | 3 (`file`) |
| `accordion` | B.26 | 9 |

- **Responsive** (the blocks whose markup is only here): `badges` (`ul.qa-row`): a flex row, `flex-wrap: wrap`, gap 12 px,
  each pill its content width and at least 44 px tall; at 360 / 390 a pill that does not fit wraps to the next line.
  `cta`: `div.btn-row` (B.0). `logos` (`ul.logo-wall`, in the hub container): 2 columns at 360 / 390, 4 at 768, 6 at
  1024 / 1280x585 / 1440 / 1920; below 600 px (the two-column range) a lone last chip is centred under the row above, one
  column wide (mobile optimisation, I.124: 'Wide Guyz', the 27th frame brand; from 600 px the 4 and 6 columns are
  untouched). `docs`: one column at every size. `cherry`: the B.0 button or the pending pill, content
  width at every size. `hours`: the B.23 table at every size.

---

## C. Interior frame per family (DESIGN-SPEC 4.1, 4.2)

### C.1 The article frame (`tpl-article`: 11 families, 133 models: the 132 with an aside, plus `404.html`)

```html
<main id="main" tabindex="-1">
  {B.21 section.titleband}
  <div class="layout">
    <i class="ra" aria-hidden="true" data-ra="p1" data-at="d:-1.8%,6% p:-3.5%,6%"></i>
    <i class="ra" aria-hidden="true" data-ra="p2" data-at="d:-1.8%,30% p:-3.5%,50%"></i>
    <i class="ra" aria-hidden="true" data-ra="p3" data-at="d:CR-150,42% t:-1.8%,60% p:-3.5%,92%"></i>
    <i class="ra" aria-hidden="true" data-ra="p4" data-at="d:CR-120,97% t:-1.8%,97% p:-3.5%,100%"></i>
    <div class="container pl-surface layout__grid">
      {B.22 article.prose-card}
      {B.24 section.ctaband}                                                              <!-- ? the last block qualifies -->
      {B.23 aside.sidebar}                                                                <!-- ? model.aside not null -->
    </div>
  </div>
</main>
```

- `div.layout` is the full-width host of the article route (the prototype's `div.article-wrap`); `div.layout__grid` is the
  grid (the prototype's `div.article-grid`): at 1024 px and up `minmax(0, 1fr) var(--side-w)` (300 px to 1199, 340 px
  from 1200), gap `clamp(26px, 3.6vw, 56px)`; the aside in column 2, row 1, `align-self: start`, its `margin-top` the arch
  crossing plus 32 px (B.21); the CTA band in row 2 across both columns. QA round 1 (LAYOUT-15, I.107): the article card
  fills row 1 (`align-self: stretch`), so a short article (an empty archive, a short post) ends level with the aside
  instead of leaving up to 1,111 px of empty column (1280x585). Below 1024 px one column in DOM order: article,
  CTA band, aside.
- **The article route** (DESIGN-SPEC 2.8 A2): the left bank at 6% and 30%, then down the sidebar column from 42% to 97%
  at d; at t and p it stays on the left bank (the aside column does not exist below 1024 px, and at 1024-1199 the bank is
  the safe choice for one value per layout). The title route (t1-t3, B.21), the CTA anchor (q1, B.24) and the footer
  horizon (z1-z3, B.19) complete the page's route.
- A page without an aside (`404.html`) keeps the one-column grid at every width (`body:not(.has-aside)`).

### C.2 The title band

B.21 for every family with a band (148 models: every model but the home). The arch per family (B.21 order; IMAGE-PLAN 4;
`art.title` [P4] where marked):

| arch source | families and pages | models |
|---|---|---|
| own portrait or plate (`team` block) | team-member (9 pages) | 9 |
| `art.title` (Degler's portrait, Jhonae's plate) [P4] | team-member `/team/dr-brittany-degler-od/`, `/team/jhonae-anglin/` | 2 |
| hub header photo (`sections[0].background[0].image`) | builder-hub `/contact-lenses/`, `/eye-care-services/`, `/eyeglasses/`, `/insurance/`, `/our-eye-doctors/`, `/the-staff/` | 6 |
| TB-ecs (droplet) [P4] | interior: the 21 pages under `/eye-care-services/` | 21 |
| TB-eyeglasses (prism) [P4] | interior: 35 pages under `/eyeglasses/`; builder-hub `/eyeglasses/designer-frames/` | 36 |
| TB-contacts (N3) [P4] | interior: the 11 pages under `/contact-lenses/` | 11 |
| TB-insurance (plant) [P4] | interior: the 3 pages under `/insurance/`; builder-hub `/cherry-payment-plan/` | 4 |
| TB-contact (real practice interior) [P4] | interior `/contact-us/`, `/contact-us/patient-forms/`, `/contact-us/testimonials/`; form (2); location (1); builder-hub `/hours-location/` | 7 |
| TB-blog (florida light) [P4] | blog-post (21), blog-index (1) | 22 |
| TB-utility (aurora still) [P4] | archive (17), legal (3), sitemap (1), not-found (2), testimonial (1), template (6) | 30 |
| **total** | | **148** |

### C.3 Breadcrumbs

B.20, inside the title-band pane. Printed on 140 models; absent where `breadcrumbs` is null (`/cherry-payment-plan/`, the 6
templates, `404.html`; and the home, which has no band). The 17 archives print "Home » " (empty own segment).

### C.4 The content column

`article.prose-card > div.prose.rich`, one flow in model order (B.22). Per block type: `prose` inline (with the D.7
transforms and the D.6 enhancers); `callout` as a sub-section or a tint panel (B.22); `video` (B.22); `accordion` (B.26);
`childpages` (F.2, B.28); `products`, `equipment` (F.7); `visit` (F.8); `docs`, `cta`, `badges`, `logos`, `cherry`
(B.31); `form` (B.25); `testimonials` (F.6); `posts` (B.28); `sitemap` (F.5); `team` (B.27, team-member bio). The last
block is lifted into the CTA band when it qualifies (B.24). The template-level enhancer budget: the lead (1 page), the
checklist panel (4 sub-sections), the treatment cards (18 runs, 75 sub-sections), the two-column list (0 lists) and the
link line (9 nodes on 7 models, every family) of D.6.

### C.5 The aside

B.23 on every model with `aside` (131 standard, 1 location-page). Below 1024 px it follows the article and the CTA band.

### C.6 The CTA band

B.24 on the 4 qualifying pages (3 interiors, 1 team page).

### C.7 The builder-hub frame (`tpl-hub`: builder-hub 9, template 6)

```html
<main id="main" tabindex="-1">
  {B.21 section.titleband}
  <section class="band band--{plain|sky|lav|photo|intro}" [data-band]>                    <!-- … each model section, in order -->
    <svg class="bank bank--up bank--lav pl-band" …>{the three bank paths}</svg>             <!-- ? band--lav only -->
    <figure class="section__bg"><img src="{bg.image.url}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async"></figure>   <!-- ? band--photo -->
    <i class="ra" aria-hidden="true" data-ra="b{n}" data-at="d:L,50% p:-7%,50%"></i>
    <div class="container pl-surface band__inner">
      <{level} class="section-title wave-rule wave-rule--center">{section.heading.html}</{level}>   <!-- ? heading -->
      {the section's blocks, below}
    </div>
  </section>
</main>
```

- **Band variant** (a contract decision: DESIGN-SPEC 4.1 says "full width, sections in source order" and "banks between
  sections" but assigns no band backgrounds; gap I.38): the hub's first section when its background moved to the arch
  (the 6 header rows) → `band--intro`; a section with a `from: 'row'` background (`/contact-lenses/` s4, 1600x679;
  `/eyeglasses/designer-frames/` s4, 1600x303) → `band--photo` (the image stays a band background in
  `figure.section__bg`, and the section's content sits in `div.band__panel.surface.surface--image` inside `band__inner`: text never sits on a photo without a
  surface); `kind` `cards`, `logos` or `team` → `band--sky` (the A4 services gradient, `data-band`); `kind` `cta` →
  `band--lav` (`--lav-300` with the bank on its upper edge, `data-band`; Q-10 adopts the lavender band beyond the home);
  every other section → `band--plain` (no fill: the field shows through).
- **The header row** (`band--intro`, 6 hubs): its callout (`titleIsPageH1` on 5 hubs; on `/insurance/` a title with
  `level: null`, "WE'VE GOT YOU COVERED") prints as `div.hub-intro.surface.surface--glass` holding `p.callout-title` (only
  when the title has no level), the html (`rich`) and the button row ("SCHEDULE AN APPOINTMENT", appointment →
  `btn--primary`). Its background image is not drawn here (it is the arch). The section's top padding reserves the arch
  crossing on its right half (B.21). Up to 420 px the intro card's inline padding is 16 px (mobile optimisation, I.127:
  with the phone pill padding of B.0 the button holds one line from 360 px; it broke 2 + 1 at 360 and 375).
- **A heading-only band (mobile optimisation, MISS-L1 + M-LOOK-8, I.123):** a band whose `band__inner` holds only the
  section title and a `hub-flow` whose one child is an `hr` or a heading introduces the next band's content (2 bands on
  149 pages: 'Our Contact Lens Services:' + an `hr` on `/contact-lenses/`, 'SEE BETTER' + 'LIVE BETTER' on
  `/eyeglasses/designer-frames/`; both followed by a `band--plain`). Below 1024 px it drops its bottom padding, the next
  band's top padding is 24 px, and a `hub-flow` that holds only an `hr` (a second lone wave rule under the title's own,
  D.4) is not drawn: the heading to its content is 66 / 24 px at 320-768 (192 / 128 before) and 68-74 / 24 px at
  769-1023 (195-224 / 131-160). No element that carries words is hidden; 1024 px and up unchanged.
- **A hub-flow h2 under a centred band title (mobile optimisation, M-LOOK-2, I.125):** below 1024 px
  `.band__inner > .section-title.wave-rule--center + .hub-flow > h2:first-child` is centred, its wave rule too ('LIVE
  BETTER' under 'SEE BETTER', the only such pair on 149 pages), so the two read as one heading. Every band intro title
  keeps DESIGN-SPEC 3.3's centred variant; every other heading keeps its alignment.
- **Blocks inside a hub section:** `prose` → `div.hub-flow.prose.rich` (D applies; wide figures at the band width);
  `callout` → titled: `div.hub-callout.surface.surface--paper` with the title at its level (or `p.callout-title`), the image
  as a figure (brand images `contain`), the html (`rich`) and the button row; untitled: `div.panel.surface.surface--tint`;
  a run of 2 or more consecutive callouts whose titles have `level: null` and whose `html` is empty (the 4 brand callouts
  of `/contact-lenses/` s5) → `ul.cards.cards--brand` of `li.card.card--brand.surface.surface--frost` (the brand image whole
  on a white chip in `div.card__media`, then `p.card__title`; not linked, so no tilt); `badges`, `cta`, `logos`, `cherry`
  (B.31); `childpages` (F.2); `team` (B.10 doctor layout / B.27 grid); `visit` (F.8); `reviews` (F.6 static card).

The hub blocks of the two bullets above, written out (each is one element in `div.band__inner`, after the section heading;
a wrapper that holds model HTML carries `rich`, so D's classless rules style the html, the classless title and the figure,
as in the article flow, B.22):

```html
<div class="hub-intro surface surface--glass rich">                                        <!-- band--intro: the header row's callout -->
  <p class="callout-title">{callout.title.html}</p>                                        <!-- ? a title with level null (/insurance/); none when titleIsPageH1 -->
  {callout.html}
  <div class="btn-row">{B.0 buttons}</div>                                                 <!-- ? buttons -->
</div>

<div class="hub-callout surface surface--paper rich">                                      <!-- a titled callout -->
  <figure class="fig fig--{image.role} {D.5 placement}"><span class="fig__media"><img src="{callout.image.url}" srcset="{[P1]}" sizes="{D.5 sizes}" alt="{callout.image.alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></span></figure>   <!-- ? image: first when imageFirst, else after the html (none on this site) -->
  <{callout.title.level}>[<a href="{callout.title.href}">]{callout.title.html}[</a>]</{callout.title.level}>   <!-- p.callout-title when level is null -->
  {callout.html}
  <div class="btn-row">{B.0 buttons}</div>                                                 <!-- ? buttons -->
</div>

<div class="panel surface surface--tint rich">{image figure as above}{callout.html}<div class="btn-row">…</div></div>   <!-- an untitled callout -->

<ul class="cards cards--brand" role="list">                                                <!-- a run of 2+ callouts with level-null titles and empty html -->
  <li class="card card--brand surface surface--frost rv">                                  <!-- … each callout; the card reveals (F.1; no protrusion inside it, D3) -->
    <div class="card__media"><img src="{callout.image.url}" srcset="{[P1]}" sizes="{w}px" alt="{callout.image.alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></div>
    <p class="card__title">{callout.title.html}</p>
  </li>
</ul>

<div class="hub-flow prose rich">{prose block html, after the D.7 transforms}</div>       <!-- a prose block -->

<div class="container pl-surface band__inner">                                             <!-- band--photo only: everything in one panel over the photo -->
  <div class="band__panel surface surface--image">{the section heading}{the section's blocks}</div>
</div>
```

- `cards--brand` was specified with the `cards--4` grid and card geometry of B.6 (4 / 2 / 1 columns at d / t / p), and its image is a
  natural-width slot (`width: auto` in a white chip, shown whole, `contain`), so it prints `sizes="{w}px"` (0.8, I.68).
  **As built** the markup carries no `cards--4` and the CSS gave `.cards--brand` no column template, so the list was one
  column at every width (gap I.121): from 560 px up each 4:3 chip was as wide as the band (614-777 px around a 325 px
  logo). Mobile optimisation (M-LAYOUT-3): `@media (min-width: 560px) and (max-width: 1023px)` two columns (the logo
  70-77% of its chip at 560-844 px and 56% at 1000, the list 475-781 px instead of 1,773-2,997); below 560 px one column (as before: the logo 73-77% of
  its chip at 320-430); 1024 px and up one column, unchanged (the desktop is frozen; the operator decides whether the
  specified 4 columns should apply there). The title link of a hub callout
  (none on this site has an `href`) is a 44 px standalone link (B.0).
- A `band--photo` background (`figure.section__bg`) covers its whole band; measured on `/contact-lenses/` and
  `/eyeglasses/designer-frames/` it renders 2,133 to 3,989 px wide at 360-1920 (the bands are far taller than the
  photos' ratio), wider than the largest file at every width, so its `sizes` is the largest `srcset` width (I.67). A hub
  grid figure is `(min-width: 1296px) {round((1200 - (columns - 1) x 24) / columns)}px, (min-width: 769px)
  {92 / columns}vw, calc(50vw - 24px)`; a hub column figure is capped by the measure, 790 px (68ch at 1440), not 690.
- **The river:** the title route with the hub's own exit (`t1`, `t2` as B.21; `t3` `d:-4%,112% p:-4%,108%`: along the
  band's bottom edge to the left bank), then one anchor per hub section on the **left** bank (`b{n}`: `d:L,50% p:-7%,50%`),
  then the hub's footer horizon, which enters at the left edge and runs right (`z1` `d:-4%,46px p:-4%,46px`, `z2`
  `d:50%,40px p:50%,38px`, `z3` `d:104%,36px p:104%,34px`). No weave zone besides the arch's. **Changed by the integrate
  stage (gap I.73):** with the article's `t3` (`d:40%,110%`, the exit its card needs) and `b{n}` on the right bank
  (`d:R,50% p:103.5%,50%`), the river crossed the first hub band diagonally and folded back into a hairpin: through the
  visit block's title and address on `/hours-location/` at every width and through the first band's text of the
  `/template/*` pages; at p the 103.5% bank ran about 30 px from every unshielded hub line that reaches the gutter
  (A-13 asks 40). With the river on the left bank, a horizon that starts inside the page (the article's `z1` at 72%, or
  28%, tried first) crosses the last band's lower-left text (`/hours-location/`'s lavender band), so the hub's enters at -4%.
- **Protrusions:** the arch into the first section; child-page thumbnails (F.2) and team portraits (B.27) break 48 px above
  their cards (32 px below 1024 px), measured from the card's visible border edge: the CSS offsets are -49 / -33 px
  because the frost card has a 1 px border (gap I.78); no other device.
- **Templates** (`template` family, 6 `/template/*` pages, noindex): the same frame and band rule; their blocks are
  `prose`, `cta` and one untitled-level linked `callout` (`/template/inner-header/`: `title.level` null with an `href`,
  empty html → `p.callout-title` holding the link). Copy prints verbatim, stale strings included (OPEN-DECISIONS: "Call
  Now! 555-555-5555", "(location description)"); Q-13 recommends dropping these pages at launch.

### C.8 Composition per family (14 families; counts are models, from `facts.mjs`)

| family | models | frame | title band, arch | crumbs | content column (block counts) | aside | CTA band |
|---|---|---|---|---|---|---|---|
| home | 1 | `tpl-home` | none; the h1 in the intro card (B.5) | none | B.16 (16 sections: prose 9, callout 10, cta 5, team 2, gallery 1, reviews 1, posts 1) | none | none |
| interior | 73 (61 classic, 12 builder) | `tpl-article` | B.21; TB-ecs 21, TB-eyeglasses 35, TB-contacts 11, TB-insurance 3, TB-contact 3 | 73 | prose 155, callout 30, childpages 13 (plain), accordion 9, products 7, cta 2, video 2, visit 1, docs 1, testimonials 1, equipment 1 | standard | 3 pages |
| blog-post | 21 (18 classic, 3 builder) | `tpl-article` | B.21 with the date; TB-blog; the post's own lead figure (17 posts) stays first in the article | 21 | prose 85 | standard | none qualifies |
| blog-index | 1 | `tpl-article` | TB-blog | 1 | prose 1, posts 1 (summary, 21 cards) | standard | none |
| archive | 17 | `tpl-article` | TB-utility | 17 (empty own segment) | childpages 13 (archive rows), prose 4 ("Nothing Found") | standard | none |
| team-member | 11 (9 classic, 2 builder) | `tpl-article` | own portrait 5, plate 4, `art.title` 2 [P4]; the position chip on 7 | 11 | team 9 (bio only), prose 2, video 1, cta 1 | standard | 1 page (Degler, bare cta) |
| testimonial | 1 | `tpl-article` | TB-utility | 1 | testimonials 1 | standard | none |
| location | 1 | `tpl-article` | TB-contact | 1 | visit 1 (complete: the lazy map) | location-page (no location card, unlabelled) | none |
| form | 2 (1 builder, 1 classic) | `tpl-article` | TB-contact | 2 | form 2, prose 1 | standard | none |
| legal | 3 | `tpl-article`, measure 66ch | TB-utility | 3 | prose 3 | standard | none |
| sitemap | 1 | `tpl-article` | TB-utility | 1 | sitemap 1, posts 1 (list) | standard | none |
| not-found | 2 (`/404-page-not-found/`, `404.html`) | `tpl-article` | TB-utility | 1 (none on `404.html`) | prose 6 (3 per model) | standard on 1; none on `404.html` | none |
| builder-hub | 9 | `tpl-hub` (C.7) | own header photo 6; TB-eyeglasses 1, TB-contact 1, TB-insurance 1 | 8 (none on `/cherry-payment-plan/`) | callout 13, prose 13, badges 7, childpages 4 (thumbs 3, plain 1), logos 3, team 2, cta 2, visit 1, reviews 1, cherry 1 | none | none qualifies |
| template | 6 | `tpl-hub` (C.7), noindex | TB-utility | none | prose 12, cta 7, callout 1 | none | none |

---

## D. The long-form prose element set (DESIGN-SPEC 3.22; BUILD-NOTES 5.4)

### D.1 Containers and scoping

- **`.rich`**: every container of model HTML (0.2). Its rules style **model elements only**: classless elements
  (`:not([class])`), the model's own classes (`fig`, `fig--*`, `fig__media`, `fig-grid`, `embed`, `embed--*`, `logo-grid`,
  `logo-chip`, `attribution`, `table-scroll`) and the classes the template adds to model nodes (`p.lead`, `ul.cols`, and
  `link-line` on a `p` or `li`, D.6). A `.link-line` node keeps every rule of its classless twin: write those selectors
  `p:is(:not([class]), .link-line)`, `li:is(:not([class]), .link-line)`. Every element a template or component prints carries a class, so no `.rich` rule reaches it (a card title, a
  button, a component list). Write the rules as `.rich :is(h2):not([class])`, `.rich a:not([class])`,
  `.rich ul:is(:not([class]), .cols) > li`; a rule for a descendant goes through its classless ancestor
  (`.rich table:not([class]) th`, `.rich ul:not([class]) > li`), so the cells and items of a component (`table.hours`,
  `ul.contact`) are never matched. A classless `a` inside a component in the flow (the contact links of a visit block)
  takes the prose link rule, which is intended: it is a text link.
- **`.prose`** (the long-form article flow, and the prose of hub sections): `.rich` plus the size (`--step-prose` / 1.7),
  the measure, the rhythm (`.prose > * + * { margin-top: 1em }`, G4) and the heading spacing. The measure is DESIGN-SPEC
  3.22's selector scoped by this section: `.prose > :is(p, ul, ol, dl, blockquote, h2, h3, h4, h5, h6, address,
  pre):not([class]), .prose > :is(p.lead, p.attribution, p.callout-title, p.link-line, ul.cols, .table-scroll) { max-width: var(--measure) }`. The
  spec's bare `ul` would also catch a component list placed directly in the flow (`ul.childlist`, `ul.posts`,
  `ul.products`, `ul.docs`, …) and squeeze it to 68ch; scoped, no component is ever measured.
- **`.rich--compact`**: model HTML inside a card (`card__text`, `post__excerpt`, `member__bio`, `product__text`,
  `device__text`, `testimonial__quote`, `review__quote`): no measure, model headings scaled down (h2 at `--step-1`, h3-h6
  at `--step-0` 700), the same list and link rules; the text size is the component's own (16 px card text, `--step-1`
  review quotes, DESIGN-SPEC 3.6 and 3.15).
- **Template wrappers inside the flow** (`div.panel`, `div.checklist`, `div.treatment`, `div.faq__a`, `div.btn-row`) are
  blocks of the flow: their children take the `.rich` element rules (descendant selectors) and repeat the rhythm
  (`:is(.panel, .checklist, .treatment, .faq__a) > * + * { margin-top: 1em }`); the measure does not apply inside them.
  Model HTML that belongs to the article (a prose block, a titled callout's html, a team-member bio) prints inline, never
  inside a wrapper, so the `.prose >` rules reach it.
- **Scoping departure:** DESIGN-SPEC writes `.prose a`, `ul > li`; this contract scopes them to classless elements so the
  components inside the flow are never restyled (the nightglow double-marker class of defect). Gap I.18.

### D.2 What the content pipeline emits (the census)

`node tmp/wf5a/contract/census.mjs` walks every string field of all 149 models, classifies each field that holds markup
(fail closed: markup in an unknown field fails the run), counts every tag+class combination and attribute, and checks the
two tables below and the E and H tables against the counts. Fields: rendered prose HTML is `sections[].blocks[].html` of
every block but `form` (prose 291, callout 42), `sections[].heading.html` (17 of 195 hold markup),
`blocks[].title.html` (0 of 43 hold markup), `items[].html` (products 53, posts 46, accordion 35, equipment 9, reviews 6,
testimonials 2) and `members[].html` (team 20 non-empty); the derived reading views `sections[].prose` (282) and `prose` (118) are never rendered but are counted in the
"with the derived views" column. Elements emitted on this site: `a b br div em figcaption figure h2 h3 h4 hr i iframe img li
ol p span strong sup ul` (rendered) plus `h1` (derived view only), exactly BUILD-NOTES 5.4's list; the class counts equal
BUILD-NOTES 5.4's (`fig--photo` 41, `fig--plate` 20, `fig--brand` 9, `fig--diagram` 3, `fig--portrait` 1; `fig-grid` 3;
`embed--video` 1; `logo-grid` 1 with 4 `logo-chip`; `attribution` 7). No `style`, no `data-*` besides `data-count`, no
source class or id, no `ecp-` / `fl-` / `gform` / `wp-` token (BUILD-NOTES 5.4 "Never": 0 occurrences).

Every row's rule is binding for the styles implementer; every combination the models emit has a row (census.mjs proves
100% coverage and equal counts). wf5b R3-1 changed one count: the sanitiser now closes an open `p` at a `p` start tag, as
the HTML parser does, so `/website-accessibility-policy/` prints its three contact paragraphs as three (`p` +2 rendered,
+6 with the derived views; recounted with the same field walk, which reproduces the earlier row exactly).

| emitted (tag.classes) | rendered | rendered pages | with the derived views | where it is rendered (field or block: count) | styling rule |
|---|---|---|---|---|---|
| `a` | 216 | 83 | 561 | prose 171, callout 9, accordion 7, heading 3, team 26 | Prose link (D.4): `--teal-700`, a 1 px underline at `rgb(3 117 109 / .55)` offset .18em; hover and focus draw a 2 px `--teal-700` underline (`background-size`) and darken to `--teal-800`, plus the focus ring; underlined everywhere (BRAND 5.4); `overflow-wrap: anywhere` (U6). Selector `.rich a:not([class])`. Inside a heading it takes the heading colour with the drawn underline; `a > img` (6, in figures) gets no underline |
| `b` | 122 | 11 | 359 | prose 115, heading 7 | 700, as `strong` (`.rich b`) |
| `br` | 24 | 9 | 66 | prose 21, products 2, callout 1 | kept as given (in `p`, `li`, headings and products); never styled, never removed |
| `div.embed.embed--video` | 1 | 1 | 3 | prose 1 | 16:9 frame (`aspect-ratio`), radius `--r-l`, `--navy-950` ground, `--sh-2`, the wide placement of D.5; its `iframe` fills it |
| `div.fig-grid` | 3 | 3 | 9 | prose 3 | grid of equal frames, columns from `data-count` (3: 3, 4: 4, 7: 4 + 3), gap `clamp(12px, 2vw, 24px)`, full article width; its figures take no placement class (D.5) |
| `em` | 19 | 5 | 39 | products 9, prose 10 | italic face (Atkinson Hyperlegible Next italic, fetched on first use) |
| `figcaption` | 7 | 1 | 21 | prose 7 | `--step--1` `--ink-600`, 8 px below the media, left-aligned (`/contact-lenses/` product grid: 7) |
| `figure.fig.fig--brand` | 9 | 6 | 27 | prose 9 | placement `fig--chip` (D.5): the image whole on a white chip, `object-fit: contain`, never cropped, never inset, never beside a generated image; hairline border, radius `--r-s` |
| `figure.fig.fig--diagram` | 3 | 3 | 9 | prose 3 | placement by width (D.5; all 3 are under 500 px: `fig--inset`); white ground, no shadow, radius `--r-s` (diagrams carry their own lines) |
| `figure.fig.fig--photo` | 41 | 37 | 123 | prose 41 | placement by width (D.5): 800+ `fig--wide` (18), 500-799 `fig--column` (20), under 500 `fig--inset`; frame radius `--r-l`, `--sh-2` on wide figures |
| `figure.fig.fig--plate` | 20 | 13 | 60 | prose 20 | placement by width (D.5: 11 `fig--inset`, 1 `fig--wide`, 8 in grids); illustrations on white: radius `--r-s`, hairline, no shadow |
| `figure.fig.fig--portrait` | 1 | 1 | 3 | prose 1 | placement `fig--inset-start` (D.5): inset left at 1024 px and up, max 260 px, frame radius `--r-l`; block and centred below |
| `h1` | 0 | 0 | 1 | derived views only | never rendered: its only occurrence is the derived home `prose` view (not a rendered field); the page h1 is the template's (B.5, B.21) |
| `h2` | 84 | 24 | 385 | products 4, prose 55, team 25 | `--step-3` navy 650, -0.012em, `text-wrap: balance`, 2em above (0 as the first child), the next sibling 0.5em; the wave rule as `::after` (`.rich h2:not([class])::after`, 74x12, 10 px above the next line); `clear: both`; max-width `--measure` |
| `h3` | 182 | 46 | 417 | prose 116, products 52, callout 14 | `--step-2` navy 650, 1.6em above, `clear: both`; opens a checklist panel or a treatment card when D.6 triggers |
| `h4` | 18 | 5 | 32 | products 11, prose 7 | `--step-1` navy 700, 1.3em above (also the product titles' level in product text) |
| `hr` | 4 | 3 | 12 | prose 4 | a centred wave rule (the 74x12 drawing as the element's background, no border, height 12 px), 48 px vertical margin |
| `i` | 1 | 1 | 3 | prose 1 | italic face (as `em`) |
| `iframe` | 1 | 1 | 3 | prose 1 | only inside `div.embed`: fills the frame (`width: 100%; height: 100%`), no border; attributes as given |
| `img` | 78 | 57 | 234 | prose 78 | never wider than its file: no `width: 100%` on prose images (the `width` attribute caps it; `max-width: 100%; height: auto`); D.7 adds `srcset`/`sizes` [P1]; zoom only inside linked figures on hover/focus (1.04) |
| `li` | 759 | 57 | 1649 | prose 445, products 208, callout 19, accordion 36, team 51 | `.rich ul:not([class]) > li`: the teal wave bullet (14x8 SVG `::before`, 30 px indent); nested `ul`: a 6 px teal dot; `.rich ol:not([class]) > li`: the native marker via `::marker` (`--teal-700`, 700, the figures face), never a `::before` bullet; 8 px between items |
| `li.logo-chip` | 4 | 1 | 12 | prose 4 | a white chip, min 133x110, the image `contain` and centred, radius `--r-s`, hairline border, no bullet |
| `ol` | 11 | 8 | 33 | prose 11 | native numbering (`start` honoured; none on this site), 30 px indent, `::marker` per `li`; max-width `--measure` |
| `p` | 1393 | 132 | 3189 | prose 898, callout 88, products 241, testimonials 2, accordion 36, equipment 9, reviews 6, posts 46, team 67 | `--step-prose` / 1.7 `--ink-700` in `.prose` (inherited size in `.rich`), `text-wrap: pretty`, 1em rhythm, max-width `--measure` as a direct child of `.prose`; never centred (U7); the first `p` that is one `strong` gets `.lead` (D.6) |
| `p.attribution` | 7 | 7 | 21 | prose 7 | `--step--1` italic `--ink-600`, 1.6em above (the "Special thanks to" line of the library articles) |
| `span.fig__media` | 74 | 56 | 222 | prose 74 | the frame: `display: block; width: fit-content; max-width: 100%`, radius by role, `overflow: hidden`, an inset 1 px white highlight; holds the `img` or `a > img` |
| `strong` | 306 | 46 | 731 | prose 209, products 59, heading 7, team 31 | 700 (`.rich strong`); no other weight, no colour change |
| `sup` | 3 | 1 | 3 | products 3 | 0.75em, `line-height: 0`, `vertical-align: super` (product names: 3) |
| `ul` | 189 | 55 | 389 | prose 100, products 63, callout 3, accordion 7, team 16 | wave bullets (the `li` rule), no list-style, 30 px indent, max-width `--measure`, 1em rhythm; two columns only inside a checklist panel (D.6) |
| `ul.logo-grid` | 1 | 1 | 3 | prose 1 | a chip wall: grid `repeat(auto-fill, minmax(max(133px, calc((100% - 60px) / 6)), 1fr))`, gap 12 px (at most 6 columns; in the article column 2 at 360 / 390, 4 at 768, 3 at 1024, 4 at 1280x585 / 1440 / 1920), no bullets, no padding; `data-count` is informational |

| attribute | rendered | with the derived views | rendered values (top 4) | rule |
|---|---|---|---|---|
| `a[href]` | 216 | 561 | "(text)" 124, "../../our-eye-doctors/index.html" 13, "tel:239-500-2020" 10, "../../contact-lenses/index.html" 10 | printed as given (internal page-relative, external verbatim); never rewritten |
| `a[rel]` | 22 | 64 | "nofollow noopener" 9, "noopener noreferrer" 8, "noopener" 4, "nofollow noopener noreferrer" 1 | printed as given (`nofollow`, `noopener`, `noreferrer` as at source) |
| `a[target]` | 22 | 64 | "_blank" 22 | `_blank` as given; no external-link icon is added |
| `div[data-count]` | 3 | 9 | "3" 1, "4" 1, "7" 1 | the figure count of a `div.fig-grid` (3, 4, 7): CSS picks the columns with attribute selectors |
| `iframe[allowfullscreen]` | 1 | 3 | "(bare)" 1 | as given (YouTube) |
| `iframe[loading]` | 1 | 3 | "lazy" 1 | `lazy` as given (YouTube only on its own page, DESIGN-SPEC 7) |
| `iframe[src]` | 1 | 3 | "(text)" 1 | as given (the one YouTube embed, `/eye-care-services/eye-emergencies-pink-red-eyes/`) |
| `iframe[title]` | 1 | 3 | "YouTube video" 1 | as given ("YouTube video": BUILD-NOTES 5 invariant 1, the one authored non-visible fallback) |
| `img[alt]` | 78 | 234 | "(text)" 16, "" 9, "Riverside Family Eye Care logo" 4, "Dry Eye African American Man" 2 | as given, never changed (alt fidelity, keep-image-parity) |
| `img[decoding]` | 78 | 234 | "async" 78 | `async` as given |
| `img[height]` | 78 | 234 | "110" 4, "121" 4, "200" 5, "240" 3 | as given; with `width` it reserves the box (CLS) |
| `img[loading]` | 78 | 234 | "lazy" 78 | `lazy` as given (a lead figure on the first screen still loads at once: lazy images near the viewport load immediately) |
| `img[src]` | 78 | 234 | "(text)" 65, "../img/cataracts_blog.d441059a86.webp" 1, "../../img/acuvue.dabcdc7f1c.webp" 1, "../../img/bandl.892d8b0566.webp" 1 | as given (page-relative); D.7 looks the URL up in `images[]` to add `srcset`/`sizes` [P1] |
| `img[width]` | 78 | 234 | "133" 4, "200" 2, "300" 20, "551" 1 | as given; caps the rendered width and selects the D.5 placement class |
| `ul[data-count]` | 1 | 3 | "4" 1 | the chip count of a `ul.logo-grid` (4): informational; the wall auto-fills |

### D.3 The allowed element set this site does not emit (styled anyway: A-23)

BUILD-NOTES 5.4 allows these and the sanitiser keeps them; no model emits them today. DESIGN-SPEC U6 and A-23 (the injected
CMS page) require them styled, so each has a binding rule. (`census.mjs` lists them as "declared in the contract but not
emitted"; that is not a failure.)

| element | rendered | rendered pages | with the derived views | where | styling rule |
|---|---|---|---|---|---|
| `h5` | 0 | 0 | 0 | - | `--step-0` 700 uppercase `--ink-900`, letter-spacing .04em, 1.3em above |
| `h6` | 0 | 0 | 0 | - | as `h5` |
| `dl` | 0 | 0 | 0 | - | max-width `--measure`; no indent |
| `dt` | 0 | 0 | 0 | - | navy 700 |
| `dd` | 0 | 0 | 0 | - | margin 0 0 0.8em |
| `blockquote` | 0 | 0 | 0 | - | the `tint-panel` recipe (`linear-gradient(150deg, var(--tint-teal), var(--tint-sky))`), a 3 px `--teal-700` left border, padding 20 / 24, `--step-1` `--ink-900`, radius `--r-m` |
| `cite` | 0 | 0 | 0 | - | `--step--1`, italic face, `--ink-600` |
| `address` | 0 | 0 | 0 | - | normal style (no italic) |
| `code` | 0 | 0 | 0 | - | system monospace, `--tint-lav` background, radius `--r-s`, padding 0 4 px |
| `pre` | 0 | 0 | 0 | - | system monospace, `--tint-lav`, radius `--r-s`, padding 16 px, horizontal scroll (`overflow-x: auto`) |
| `u` | 0 | 0 | 0 | - | underline |
| `sub` | 0 | 0 | 0 | - | 0.75em, `line-height: 0`, `vertical-align: sub` |
| `small` | 0 | 0 | 0 | - | `--step--1` |
| `div.table-scroll` | 0 | 0 | 0 | - | `tabindex="0"`, `role="region"`, `aria-label` as the model gives (the page h1): horizontal scroll, the focus ring on the region, max-width `--measure` |
| `table` | 0 | 0 | 0 | - | `border-collapse: collapse`, `min-width: 100%`, figures face for digits |
| `thead` | 0 | 0 | 0 | - | no style of its own |
| `tbody` | 0 | 0 | 0 | - | zebra rows `--ground` |
| `tr` | 0 | 0 | 0 | - | hairline row borders `rgb(var(--shade) / .07)` |
| `th` | 0 | 0 | 0 | - | `th[scope=col]` on `--tint-lav`, navy 700, padding 12 / 16, left-aligned |
| `td` | 0 | 0 | 0 | - | padding 12 / 16, top-aligned |
| `div.embed.embed--map` | 0 | 0 | 0 | - | 4:3 frame, radius `--r-l`, lazy iframe (the model's `title`) |
| `div.embed.embed--other` | 0 | 0 | 0 | - | block, `max-width: 100%` |
| `li.logo-chip.logo-chip--link` | 0 | 0 | 0 | - | as `li.logo-chip`, the whole chip clickable |
| `a.logo-chip__link` | 0 | 0 | 0 | - | block, fills the chip; focus ring on the chip |
| `figure.fig.fig--left` | 0 | 0 | 0 | - | [P5] the source alignment: as `fig--inset-start` |
| `figure.fig.fig--right` | 0 | 0 | 0 | - | [P5] as `fig--inset` |
| `figure.fig.fig--center` | 0 | 0 | 0 | - | [P5] as `fig--column`, centred |
| `ol[start]` | 0 | 0 | 0 | - | `start` is honoured by native numbering |
| `a[aria-label]` | 0 | 0 | 0 | - | printed as given (source aria-labels only) |
| `h2[id]` | 0 | 0 | 0 | - | a heading id printed as given (only when an in-page link targets it); its scroll offset is `html { scroll-padding-top }` (1.1), with no `scroll-margin` of its own: a `scroll-margin-top` from `--navbar-h` would add to that padding (a double offset) and is outside the D1 guard's list of `--navbar-h` uses (gap I.63) |

### D.4 Element rules (DESIGN-SPEC 3.22, scoped by D.1)

- **Rhythm (G4):** `.prose > * + * { margin-top: 1em }`; `h2` 2em above, `h3` 1.6em, `h4` 1.3em; the first child 0; a
  heading's next sibling 0.5em. A floated inset never sits within 2 lines of a heading's top: `.prose :is(h2, h3):not([class])
  { clear: both }`. Stacked headings: an `h2` or `h3` right under an `h2` or `h3` takes 1em; below 1024 px so does an
  `h4`-`h6` right under an `h3` (`.prose > h3:not([class]) + :is(h4, h5, h6):not([class])`, mobile optimisation, M-LAYOUT-9,
  I.139: the site's one such pair, on `/eye-care-services/eye-exams/`, read as one block at 9 px; now 18-20 px). 1024 px
  and up keep the 0.5em (signed off).
- **Headings:** `h2` `--step-3` navy 650 with the wave rule (`::after`); `h3` `--step-2` navy 650; `h4` `--step-1` navy 700;
  `h5`/`h6` `--step-0` 700 uppercase `--ink-900`. Template-printed headings in the flow (section headings, callout titles)
  are classless and take these rules; `p.callout-title` (a title with no level) is `--step-1` navy 700.
- **Paragraphs and inline:** `strong`/`b` 700, `em`/`i` the italic face, `u` underline, `sup`/`sub` 0.75em, `small`
  `--step--1`, `br` kept. `p.attribution`: `--step--1` italic `--ink-600`. `p.lead` (D.6): `--step-2` / 1.3 navy.
- **Links (`a:not([class])`):** `--teal-700`, a 1 px underline at `rgb(3 117 109 / .55)`, offset .18em; hover and focus draw
  a 2 px `--teal-700` underline (`background-size`) and darken to `--teal-800`; underlined everywhere in prose; focus adds
  the 3 px ring. On navy (`ctaband__copy`): `--teal-200`.
- **Lists:** `ul:is(:not([class]), .cols) > li` the wave bullet (14x8, `::before`, 30 px indent); nested `ul` a 6 px teal dot;
  `ol:not([class])` native markers styled with `::marker` (`--teal-700`, 700, figures face); `ol[start]` honoured; never a
  `::before` bullet on `ol > li`. **A list item that only wraps a nested list** (`li.li--wrap`, D.7 transform 10; mobile
  optimisation, RL-MISS-2, I.128): at 1024 px and up it renders as the classless item it was (the selectors read
  `li:is(:not([class]), .link-line, .li--wrap)`: same specificity, same boxes and styles); below 1024 px it draws no wave
  bullet and no indent of its own, and its nested items take the wave bullet, so the list reads as one list with one
  marker per item and its text 30 px in (it drew a stray wave bullet beside the first dot, text 60 px in).
- **hr:** D.2 (a hub-flow that holds only an `hr` is not drawn below 1024 px: C.7, I.123). **dl, address, code/pre,
  blockquote, tables:** D.3.
- **Digits:** every digit 0-9 comes from "RFEC Figures" (the first face of `--font`, `unicode-range: U+0030-0039`): no
  per-element rule is needed.
- **Overflow:** `.prose { overflow-wrap: break-word }`, `.prose a { overflow-wrap: anywhere }` (U6).

### D.5 Figures, embeds and media placement (template-added classes)

The model gives no source alignment (P5 is optional and absent), so the template adds one **placement class** to every
model `figure.fig` that is not inside a `div.fig-grid` (D.7 transform 2), from its role and the `width` attribute of its
`img`:

| placement class | assigned when | rendering | count (60 figures outside grids) |
|---|---|---|---|
| `fig--wide` | `fig--photo`, `fig--plate` or `fig--diagram`, width 800 or more | breaks out of the measure to the card's full inner width, plus 24 px into each side padding at 768 px and up (the card padding is 30.7 px or more there); at 767 px and below (the full-bleed card with `--gutter` padding, B.22) exactly the inner width, no breakout (one would scroll the page sideways); frame `--r-l`, `--sh-2` | 19 (photo 18, plate 1) |
| `fig--column` | `fig--photo`, `fig--plate` or `fig--diagram`, width 500-799 | the measure width (never wider than the file), centred, frame `--r-l` | 20 |
| `fig--inset` | `fig--photo`, `fig--plate` or `fig--diagram`, width under 500 | inset right at 1024 px and up (`float: right`, max 42% of the measure, never wider than the file, margin 0 0 16 px 28 px); block and centred at native size below | 14 (plate 11, diagram 3) |
| `fig--inset-start` | `fig--portrait` | inset left, max 260 px, frame `--r-l`; block and centred below 1024 px | 1 |
| `fig--chip` | `fig--brand` | whole on a white chip, `object-fit: contain`, never cropped, never inset, never beside a generated image | 6 |

- A [P5] class on the model figure overrides: `fig--left` → `fig--inset-start`, `fig--right` → `fig--inset`, `fig--center`
  → `fig--column`.
- **No figure is drawn wider than its file:** the `img` keeps its `width` attribute and gets `max-width: 100%; height: auto`
  (no `width: 100%`); `span.fig__media` shrink-wraps it. A 640 px lead photo stays 640 px, centred.
- **A size cap never replaces the 100% cap:** every cap X on a figure, frame or image is written `max-width: min(X,
  100%)` (`fig--inset-start` `min(260px, 100%)`, `fig--inset` `min(calc(.42 * var(--measure)), 100%)`; the `img` inside keeps its own `max-width: 100%` and `width`). BUILD-NOTES 10 (R2-X): the scaffold's
  `max-width: 20rem` on plates replaced the global 100% and pushed `/contact-lenses/` 9 px past a 1280 px viewport from a
  grid cell.
- **`div.fig-grid[data-count]`** (3 grids: 7, 4 and 3 figures; 14 figures): equal frames in 2, 3 or 4 columns by count (7
  wraps to 4 + 3); its figures take no placement class. **Up to 768 px (two columns; mobile optimisation, M-LOOK-1 +
  M-LAYOUT-6 + MISS-L2, I.124):** a lone last figure (an odd count) is centred under the row above, one column wide (the
  7 lens plates of `/contact-lenses/`, the 3 brand chips of `/eyeglasses/designer-frames/`: offsets -62.5 to -180.5 px →
  0); a `fig--brand` chip is square (`aspect-ratio: 1`, the image contained at its own painted size, never cropped), so
  the brand chips are equal frames (173 / 94 / 80 px at 390 → 171 / 171 / 171). From 769 px the 3 or 4 columns are
  unchanged.
- **`figcaption`**: `--step--1` `--ink-600`, 8 px below.
- **Name captions (QA round 1, regressions R1; D.7 transform 9, I.119):** a model figure whose caption only repeats its
  image's alt (content.mjs binds the paragraph after a lone image when its text equals the alt: the 7 recommended lenses
  of `/contact-lenses/`, the 7-figure grid) prints as `div.fig` (same classes) with the name as `div.fig__caption`, not
  as `figure` + `figcaption`: a name is not a quotation, and `sr-fabrication` reads every `<figure>` holding more than 20
  characters of text as a testimonial. `.fig__caption` joins the `figcaption` rule as a selector list (`.rich
  figcaption, .rich .fig__caption`, so the figcaption's own specificity is unchanged); it is a `div`, not a `p`, so the
  global `p { text-wrap: pretty }` does not reach it and it wraps as the figcaption did (0 boxes moved,
  `layout-boxes.mjs`; the screenshots are pixel-identical, `shots.mjs`).

```html
<div class="fig fig--plate"><span class="fig__media"><img src="…" srcset="…" sizes="…" alt="{name}" width="300" height="300" loading="lazy" decoding="async"></span><div class="fig__caption">{name}</div></div>
```
- **`ul.logo-grid > li.logo-chip`**: white chips 133x110 minimum, `object-fit: contain`, the D.2 grid (at most 6
  columns; DESIGN-SPEC 3.22's "4-6 columns" cannot hold below a 568 px column with 133 px chips), radius `--r-s`,
  hairline.
- **Embeds:** `div.embed--video` 16:9, radius `--r-l`, `--navy-950`, `--sh-2`, wide; `div.embed--map` 4:3, radius `--r-l`;
  `div.embed--other` block, `max-width: 100%`. Every iframe is `loading="lazy"` (model).
- **`sizes` for model images** (D.7 transform 3, [P1]): `fig--wide`: `(min-width: 1200px) 740px, (min-width: 1024px)
  calc(80.4vw - 252px), (min-width: 768px) calc(84vw + 48px), calc(100vw - 32px)` (this slot's middle query starts at
  768 px, where the card gains its side margins; the two formulas are the article column exactly, from `--gutter`
  `clamp(16px, 4vw, 48px)`, the grid gap `clamp(26px, 3.6vw, 56px)`, `--side-w` 300 px and the card padding
  `clamp(24px, 4vw, 60px)`, C.1 and B.22; at 1200 px and up the column is 673-758 px, printed 740px); `fig--column` and `fig--chip`:
  `(min-width: 769px) {min(w, 690)}px, calc(100vw - 32px)`; `fig--inset` and `fig--inset-start`: `(max-width: {w + 32}px)
  calc(100vw - 32px), {w}px`, and for a file wider than the inset's cap the cap itself (`330px` for `fig--inset`: .42 x
  68ch renders 322-329 px at 1024-1920; `260px` for `fig--inset-start`; the added illustrations N2, N4, N9, N3);
  grid figures: `(min-width: 1200px) {round((693 - (columns - 1) x 24) / columns)}px, (min-width: 1024px)
  calc((80.4vw - 300px) / columns), (min-width: 769px) calc(84vw / columns), calc(50vw - 24px)` (the article column
  without the breakout; `740 / columns` over-fetched 1.66x at 1024). The numbers are the article column at the reference
  widths (1440: 741 px inner width with the breakout; 1024: 571; 768: 693; 390: 358), re-measured in a browser by the
  templates stage (`tmp/wf5b/templates/probe.mjs`: every multi-candidate `srcset` on 26 pages at 7 sizes, the
  browser-resolved `sizes` against the cover-aware rendered width; I.67), and re-checked by A-21's magnification probe.

### D.6 Prose enhancers (DESIGN-SPEC 3.22; applied by the template; text untouched; deterministic)

Every enhancer works **inside one block's HTML** (a `prose` block's `html` or a callout's `html`), on its top-level nodes
(D.7 transform 1). A **sub-section** is an `h3` node and the nodes after it, up to the next `h2` or `h3` node or the end of
the block. Counts are this site's (`node tmp/wf5a/contract/enhancers.mjs`).

| enhancer | trigger | markup | this site |
|---|---|---|---|
| **lead** | the article's first `p` (in flow order across blocks; headings are not `p`) whose entire content is one `strong` | add `class="lead"` to that `p` | 1: `/eye-care-services/dry-eye-disease-and-treatment/` ("Understand the Cause. Find Long-Lasting Relief") |
| **checklist panel** | a sub-section holding a top-level classless `ul` of 6 or more `li`, each 60 characters or fewer (text, whitespace collapsed) | wrap the sub-section's nodes: `<div class="checklist surface surface--tint">{h3}{nodes}</div>`; the `ul` runs in two columns at 768 px and up (`.checklist > ul:not([class])`) | 4: dry-eye "Recognizing the Symptoms"; eye-emergencies "Symptoms that require emergency service…"; eye-exams "Eye Exams for Children"; tap-water post "When to See an Eye Doctor" |
| **treatment cards (G7)** | a run of 3 or more consecutive sub-sections in one block with no `h2` between them, none of them a checklist | wrap the run: `<div class="treatments">` and each sub-section `<div class="treatment surface surface--paper">{h3}{nodes}</div>` (a 3 px `--teal-700` left border, padding 22 / 24, `paper` on `--ground`) | 18 runs, 75 sub-sections, on 18 pages |
| **two-column list** | any other top-level classless `ul` (not in a checklist) of 8 or more `li`, each 40 characters or fewer | add `class="cols"` to that `ul` (two columns at 768 px and up) | 0 (the one 9-item list is the dry-eye checklist's) |
| **added illustration** | each `art.inline[]` entry [P4] for the page | D.7 transform 5 | 0 today (P4 absent); 12 placements planned in `image-plan.json`: 10 in prose (A1, N1-N9) and 2 child-page thumbs (N1, N10) |
| **link line** (A-9; added by this verification, gap I.46) | in **any** model HTML the template prints in a `.rich` container (prose and callout html, accordion answers, bios, product texts, excerpts), a classless `p` or `li` whose text (whitespace collapsed) equals the text of its one child `a`, which holds no `img` | add `class="link-line"` to that `p` / `li`; CSS `.rich .link-line > a { display: inline-flex; align-items: center; min-height: 44px }` (B.0 target rule 3); the link keeps the prose link look | 9 on 7 models: `p` on `/contact-us/patient-forms/` ("Read HIPAA Notice of Privacy Policy"), `/eyeglasses/sunglasses/`, `/top-causes-of-dry-eye-in-fort-myers/`, `/template/header-3/`, `/template/inner-header/` (3); `li` on `/eye-care-services/faq/` (an accordion answer) and `/template/header-2/` |

- Legal pages (B.29) apply the lead rule and the link line only (the link line is a target-size marker, not a
  typographic enhancer, so it also runs outside prose and callout blocks; this site's legal pages have no link line).
- The one difference from a whole-page reading: on `/eye-care-services/management-of-ocular-diseases/glaucoma/` the three
  condition items ("Diabetic Eye Disease", "Macular Degeneration", "Cataracts") are spread over three callouts (one titled,
  two untitled), so no block holds a run of 3; the two untitled callouts are tint panels by the callout rule (B.22), and the
  first item stays a plain sub-section (gap I.31).
- `ul.cols`, `.lead`, `.link-line`, `div.checklist`, `div.treatments` and `div.treatment` are template classes on, or around, model nodes;
  `ul.cols`, `p.lead` and `.link-line` keep their model children untouched.
- **Treatment cards on phones** (mobile optimisation, M-LOOK-5, I.142): below 768 px the ground panel pads 6 px and the card
  18 / 16 px (12 and 22 / 24 above), the `--ground` panel and the 3 px `--teal-700` border kept: a treatment paragraph is 28 px
  wider (280 px at 360, a median of 33 characters a line instead of 28-30; 240 px and 27 at 320, still under the 30-45 band
  there).

### D.7 The template's transforms of model HTML (closed list)

A template may do exactly these things to a model HTML string, and nothing else:

1. **Split** it into top-level nodes (element nodes and non-blank text runs at depth 0; the HTML is well-formed:
   tag-balance 0 findings) to move whole nodes (home s4, s13, s14: B.6, B.14, B.15) and to run D.6. Node HTML is never
   edited by the split.
2. **Add a placement class** to `figure.fig` (D.5) and `class="lead"` / `class="cols"` / `class="link-line"` / the D.6
   wrappers.
3. **Add `srcset` and `sizes`** to a model `img` whose `src` equals the `url` of an `images[]` entry that has a `srcset`
   [P1] (the D.5 `sizes`); the `src`, `alt`, `width`, `height`, `loading` and `decoding` stay as given.
4. **Re-emit one heading**: the home s14 `h2` with classes and `id="reviews-title"`, inner HTML verbatim (B.15).
5. **Insert an added illustration** from `art.inline[]` [P4] as a model-shaped figure, `<figure class="fig fig--photo
   {placement}"><span class="fig__media"><img src alt width height srcset sizes loading="lazy" decoding="async"></span>
   </figure>` (its `alt` is the plan's: `""` for A1, the literal description for stand-ins), placed by its anchor:
   `article-start` → before the article's first node (`position` "inset right at the start of the article" gives
   `fig--inset`, else by width); `heading` (`text`, `level`) → right after that heading when `position` says "at the start
   of the section" (`inset right` → `fig--inset`, `inset left` → `fig--inset-start`), right before it when it says "before
   the heading"; `after-paragraph` (`textEndsWith`) → right after the first `p` whose text ends with it (A1: wide);
   `hub-item` (`text`) → not in prose: it fills the `thumb` of the child-page item whose `title` equals `text` (F.2). An
   anchor that matches nothing fails the build (no silent drop).
6. **Print a social line as icons** (QA round 1, CONTENT-13, I.86): a top-level `p` made only of links to the chrome's
   social profiles prints as `ul.social.social--prose` icon links, the same `href`, `target` and `rel`, each label
   verbatim as the link's `aria-label`.
7. **Defer a YouTube embed** (QA round 1, PERF-6, I.111): an `iframe` whose `src` is a `youtube.com` or
   `youtube-nocookie.com` `/embed/` address prints that address as `data-src` (no `src`), followed by
   `<noscript>` holding the iframe as given; every other attribute stays as given. site.js sets `src` once the frame is
   within 600 px of the viewport (1.13).
8. **Load the first images eagerly** (QA round 1, PERF-5, I.102): the first 4 `img` of an article flow or a hub page's
   bands lose `loading="lazy"`.
9. **Print a name caption without figure markup** (QA round 1, regressions R1, I.119): a `figure.fig` that holds only
   `span.fig__media` with one `img` and a `figcaption` whose text (entities decoded, whitespace collapsed) equals that
   `img`'s `alt` prints as `div` with the figure's classes, and its caption as `div.fig__caption` with the caption's text
   verbatim (D.5). The `img` is untouched. Any other `figcaption` stays as it is, so a real caption still meets the
   fabrication gate. On this site: 7 figures, all on `/contact-lenses/`.
10. **Mark a list item that only wraps a nested list** (mobile optimisation, RL-MISS-2, I.128): a classless `li` whose only
    content (comments and blank text aside) is one `ul` or `ol` gets `class="li--wrap"` (D.4); text and structure
    untouched. On this site: 2 items (`/contact-lenses/our-featured-brands/coopervision/` 'AT A GLANCE',
    `/eyeglasses/transitions-lenses/original-transitions-lenses/`), the source's double-nested lists.

Never: change or drop text, drop or reorder nodes (beyond the moves of 1), change an attribute (beyond 3, 7 and 8), add
an id (beyond 4), add inline `style`, rename an element (beyond 9).

Tried and withdrawn (mobile optimisation, M-LOOK-11, I.146): wrapping 'Fort Myers' and 'Co-Management' in headings in a
`span.nb` that only phone CSS made `nowrap`. Inside an inline-flex heading link (`.section-title a`, `.trio__title a`) such a
span becomes a flex item and the spaces beside it are dropped ('LatestFort MyersEye Care News & Tips'), and any wrapper that
splits a heading's text moves its line extents by 0.01-0.03 px at 1024 px and up. A future transform that wraps heading
text must not put an element inside a flex container's text and is not inert at desktop.

### D.8 The injected CMS block of A-23 (classless content the pipeline never emits)

A-23 appends the usability judge's block (`tmp/panel/_judge-use/make-inject.mjs`) to the interior template. The block is
raw, classless CMS HTML that the pipeline never emits:
- a `section` with headings and a paragraph holding an unbroken URL;
- nested lists, and a blockquote with `cite`;
- a **bare** `table`: `caption`, `thead`, `th[scope=row]`, no `div.table-scroll`;
- a classless `figure > img + figcaption`, with a 1067 px image;
- an `hr`;
- a classless `form`: labels, a `select`, a `textarea`, a `fieldset` of two label-wrapped radios, text, tel and email
  inputs, a label-wrapped checkbox and a `button`;
- a `form[role=search]` holding `input[type=search]` and a `button`.

A-23 passes on: controls 44 px or more, no overflow, 0 contrast failures and 0 occlusions at 1440 and 390. Its control
is that the unstyled scaffold must fail. The judge's own run shows what an unstyled block does: the prototype's
injected controls measured 13x13 (radios) to 177x21 (text inputs) at 390 (`tmp/panel/_judge-use/data/scale.json`).
Sections D.1-D.7 and E style the model's markup only, so they would leave every control of this block unstyled: A-23 was
not satisfiable before this section (gap I.49).

- **Injection point.** The block goes in as the **last child of `div.prose.rich`**, inside `article.prose-card`. The
  judge's script inserts it before `</article>`, which in the prototype was the prose container (`article.prose`). Here
  the container is the inner `div.prose.rich`, and a block placed after it would sit outside every rule of D. A port of
  the A-23 probe inserts at the new point.
- **Rules.** All are scoped to classless elements inside `.rich`, so the model's classed form markup (E) and every
  component are never matched; no model emits these elements today.
  - `label:not([class])`: block, 600 navy 16 px, 8 px above its control (as `.field__label`).
  - A label that wraps a radio or checkbox (`label:not([class]):has(> input:is([type=radio], [type=checkbox]))`): a
    choice row, `display: flex; align-items: center; gap: 12px; min-height: 44px`, weight 400 (as `div.choice` +
    `label.choice__label`).
  - `:is(input:not([type=radio], [type=checkbox], [type=submit], [type=button], [type=reset], [type=hidden]), select,
    textarea):not([class])`: as `.field__control` (E.3: 16 px or more, `min-height: 48px`, padding 12 / 14, radius
    `--r-s`, 1.5 px `--line-input` border, white fill, the focus ring; `select` with the chevron and 44 px right padding;
    `textarea` `min-height: 140px`), plus `max-width: 100%`.
  - `input:is([type=radio], [type=checkbox]):not([class])`: the 24 px custom control of `.choice__input` (a checkbox gets
    a 6 px radius and a teal check). It is measured by its 44 px row (B.0 target rule 2).
  - `:is(button, input[type=submit], input[type=button]):not([class])`: the `btn btn--primary` look (50 px, B.0).
  - `fieldset:not([class])`: no border, no padding, `min-width: 0`; `legend:not([class])` styled as the label.
  - `form:not([class])`: the fields stacked with 20 px gaps (as `.form__grid`). `form[role=search]:not([class])`: one flex
    row, `flex-wrap: wrap`, gap 12 px.
  - **A bare table** (a `table:not([class])` not inside `div.table-scroll`): `display: block; max-width: 100%;
    overflow-x: auto`. It scrolls inside the column and never widens the page: a four-column table with the 12 / 16 px
    cell padding of D.3 can be wider than the 358 px phone column. Cells, rows and `th[scope=col]` are styled as D.3;
    `thead th` without `scope` as `th[scope=col]`; `th[scope=row]` navy 700, left-aligned, no fill; `caption`
    `--step--1` `--ink-600`, left-aligned, 8 px from the table, `caption-side: bottom`.
  - `figure:not([class])`: `margin: 0` (no 40 px UA indent); its `img` and `figcaption` as D.2 (`max-width: 100%;
    height: auto`).
- The rest of the block is already covered: headings, paragraphs, links, lists, `blockquote`, `cite`, `hr` (D.2-D.4),
  and the long URL (`.prose { overflow-wrap: break-word }`, D.4).

---

## E. Forms (DESIGN-SPEC 3.25; BUILD-NOTES 5.5)

### E.1 The two forms and their card

| page | form | fields | required | conditional | intro |
|---|---|---|---|---|---|
| `/contact-us/appointment-request-form/` (form family, builder) | `gform_9` | 9 rendered: Reason for Appointment (`select`, 5 options), Preferred Date & Times (`textarea`, required, help with a link), Patient Type (radio x 2, required, help), Name (First / Last, required), Phone (`tel`, required), Email (`email`, required), Date of Birth (text, no `inputmode` since the mobile optimisation (M-TOUCH-2, I.130), placeholder `mm/dd/yyyy`, a visually hidden format hint), Comments (`textarea`) | 5 | none | 1 `p` in `div.form__intro`; a prose block before the card ("Same-day appointments … call 239-500-2020 …") |
| `/contact-us/contact-form/` (form family, classic) | `gform_10` | 7 rendered: Your Name (First / Last), Subject (required), Message (`textarea`), Should we reply? (radio x 3, required), Email (shown when "Yes, Email Me"), Phone (shown when "Yes, Call Me") | 2 | `data-show-if="f10-4=Email"`, `"f10-4=Call"` | 2 `p` |

Markup (B.25): `<div class="form-card surface surface--paper">{form.html}</div>`, in the article flow. `form.html` is printed
**verbatim**; the template adds nothing inside it. The form's own markup (BUILD-NOTES 5.5) is
`form.form[method=dialog][aria-labelledby=page-title][data-needs-backend="form endpoint"]` (no `action`; `post` until QA round 1, CONTENT-1: a dialog form outside a `<dialog>` validates, fires `submit` and sends nothing) > `div.form__intro` >
`p`… , `div.form__grid` > the fields, `div.form__foot > button.btn.btn--primary[type=submit]` ("Submit").

### E.2 What the form markup emits (the census)

Every combination and attribute the 2 `form.html` strings emit, with its rule (counts over both forms; `census.mjs` proves
the coverage):

| emitted (tag.classes) | occurrences | pages | styling rule |
|---|---|---|---|
| `a` | 1 | 1 | the help link of the appointment form's date field: the prose link rule (D.4) |
| `button.btn.btn--primary` | 2 | 2 | the submit: the B.0 primary button ("Submit"), 50 px, full width at n; lift and sheen as every button |
| `div.choice` | 5 | 2 | one radio row: `min-height: 44px`, flex, gap 12 px, the label clickable across the row |
| `div.field` | 7 | 2 | a field block: label above the control, 20 px above the next field |
| `div.field.field--wide` | 3 | 2 | a textarea field; spans both columns if the grid ever has two (it has one: a block) |
| `div.field__row` | 2 | 2 | First / Last: two columns from 600 px, gap 16 px; one below |
| `div.field__sub` | 4 | 2 | one name part: the control, then its sub-label below |
| `div.form__foot` | 2 | 2 | the submit row, 28 px above, left-aligned |
| `div.form__grid` | 2 | 2 | one column, gap 20 px |
| `div.form__intro` | 2 | 2 | the intro paragraphs, `--ink-700`, 24 px below |
| `fieldset.field.field--choice` | 2 | 2 | no border, no padding, `min-width: 0`; its legend is the label; the choices stacked |
| `fieldset.field.field--group` | 2 | 2 | no border, no padding; its legend is the label; holds `div.field__row` |
| `form.form` | 2 | 2 | no visual of its own (the card is `div.form-card`, B.25); `data-needs-backend` kept |
| `input.choice__input` | 5 | 2 | a 24 px custom radio drawn on the native input with `appearance: none` (navy ring, teal dot when checked), so it stays focusable; 3 px `--teal-700` focus ring |
| `input.field__control` | 10 | 2 | 16 px or more (no iOS zoom), `min-height: 48px`, padding 12 / 14, radius `--r-s`, 1.5 px `--line-input` border, white; focus: 3 px `--teal-700` ring offset 2 px and a `--teal-700` border; `[aria-invalid="true"]`: border `--alert-700` |
| `label.choice__label` | 5 | 2 | `--step-0` `--ink-700`, clickable, fills the row |
| `label.field__label` | 10 | 2 | 600 navy 16 px, 8 px above the control |
| `label.field__sublabel` | 4 | 2 | `--step--1` `--ink-600`, 6 px below its control |
| `legend.field__label` | 4 | 2 | as `label.field__label`; `padding: 0` |
| `option` | 5 | 1 | native options (5, "Reason for Appointment") |
| `p` | 3 | 2 | the intro paragraphs inside `div.form__intro`: `--step-0` `--ink-700` |
| `p.field__error` | 14 | 2 | `hidden` as given and never shown (its text is empty); a future visible state is `--alert-700` `--step--1` |
| `p.field__help` | 4 | 2 | `--step--1` `--ink-600`, 6 px below the control |
| `select.field__control` | 1 | 1 | as `input.field__control`, plus `appearance: none`, a chevron SVG background and 44 px right padding |
| `span.field__error-text` | 14 | 2 | empty; inherits |
| `span.field__hint.sr` | 1 | 1 | visually hidden (`.sr` is the same rule as `.vh`) |
| `span.field__req` | 7 | 2 | the asterisk in `--alert-700`, `aria-hidden` as given, 4 px before it |
| `textarea.field__control` | 3 | 2 | as `input.field__control`, plus `min-height: 140px` and vertical resize |

| attribute | occurrences | values (top 4) | rule |
|---|---|---|---|
| `a[href]` | 1 | "../../hours-location/index.html" 1 | as given |
| `button[type]` | 2 | "submit" 2 | `submit` as given |
| `div[data-show-if]` | 2 | "f10-4=Email" 1, "f10-4=Call" 1 | the condition `f10-4=Email` / `f10-4=Call`: site.js shows the field only while the named control has that value (1.10); without JS it shows |
| `fieldset[aria-describedby]` | 1 | "f9-3-help" 1 | as given (points at the help text) |
| `form[aria-labelledby]` | 2 | "page-title" 2 | `page-title`: requires `h1#page-title` (B.21) |
| `form[data-needs-backend]` | 2 | "form endpoint" 2 | "form endpoint": kept until an endpoint is decided (Q8); no visual |
| `form[method]` | 2 | "dialog" 2 | `dialog` (QA round 1, CONTENT-1; `post` before); no `action`: a valid submit sends nothing and keeps the typed values until an endpoint is decided (Q8), then `post` with its `action` |
| `input[aria-describedby]` | 3 | "f9-17-format" 1, "f10-9-help" 1, "f10-10-help" 1 | as given |
| `input[aria-required]` | 5 | "true" 5 | as given |
| `input[autocomplete]` | 9 | "given-name" 2, "family-name" 2, "tel" 2, "email" 2, "bday" 1 | as given (given-name, family-name, tel, email); `bday` on Date of Birth is added (QA round 1, A11Y-12, WCAG 1.3.5) |
| `input[id]` | 15 | "f9-3-0" 1, "f9-3-1" 1, "f9-11-3" 1, "f9-11-6" 1 | as given (`f9-*`, `f10-*`: unique per page) |
| `input[name]` | 15 | "f10-4" 3, "f9-3" 2, "f9-11-3" 1, "f9-11-6" 1 | as given |
| `input[placeholder]` | 1 | "mm/dd/yyyy" 1 | `mm/dd/yyyy` as given; the placeholder colour is `--ink-600` (6.75 on white) |
| `input[required]` | 10 | "(bare)" 10 | as given (native validation) |
| `input[type]` | 15 | "text" 6, "radio" 5, "tel" 2, "email" 2 | as given (text, radio, tel, email) |
| `input[value]` | 5 | "New patient" 1, "Returning patient" 1, "Email" 1, "Call" 1 | the radio values, as given |
| `label[for]` | 19 | "f9-18" 1, "f9-2" 1, "f9-3-0" 1, "f9-3-1" 1 | as given |
| `option[value]` | 5 | "Comprehensive Eye exam" 1, "Contact Lens Fitting" 1, "Red or Irritated Eyes" 1, "Child's Exam" 1 | as given |
| `p[hidden]` | 14 | "(bare)" 14 | as given; never removed by site.js |
| `p[id]` | 18 | "f9-18-err" 1, "f9-2-help" 1, "f9-2-err" 1, "f9-3-help" 1 | as given (help and error ids) |
| `select[id]` | 1 | "f9-18" 1 | as given |
| `select[name]` | 1 | "f9-18" 1 | as given |
| `span[aria-hidden]` | 7 | "true" 7 | as given (the required asterisk) |
| `span[id]` | 1 | "f9-17-format" 1 | as given (the date format hint) |
| `textarea[aria-describedby]` | 1 | "f9-2-help" 1 | as given |
| `textarea[aria-required]` | 1 | "true" 1 | as given |
| `textarea[id]` | 3 | "f9-2" 1, "f9-9" 1, "f10-3" 1 | as given |
| `textarea[name]` | 3 | "f9-2" 1, "f9-9" 1, "f10-3" 1 | as given |
| `textarea[required]` | 1 | "(bare)" 1 | as given |
| `textarea[rows]` | 3 | "6" 3 | `6` as given; CSS sets the min-height |

Mobile optimisation (M-TOUCH-2, I.130): the census had an `input[inputmode]` row (1, `"numeric"` on the date of birth, "as
given"). The source's field (a Gravity Forms datepicker) carries no inputmode, and the numeric keypad it opened on phones
has no "/" for the `mm/dd/yyyy` the field asks for, so `forms.mjs` prints none; the form markup now emits 30 attributes
(31 before, as the verification record below counted them).

### E.3 Layout

- **Card:** `paper`, padding `clamp(24px, 4vw, 48px)`, radius `--r-l`; `.form__intro` paragraphs in `--ink-700`.
- **Grid:** `.form__grid` one column, gap 20 px; `.field__row` two columns at 600 px and up (First / Last).
- **Labels:** `.field__label` 600 navy 16 px; `.field__sublabel` `--step--1` `--ink-600`; `.field__req` the asterisk in
  `--alert-700` (`aria-hidden` as given; the requirement is announced by `required` / `aria-required`).
- **Controls:** `.field__control` (input, select, textarea): font 16 px or more (no iOS zoom), `min-height: 48px`, padding
  12 / 14, radius `--r-s`, a 1.5 px `--line-input` border (3.37 on white), white fill; textarea `min-height: 140px`,
  vertical resize; select with a chevron SVG and 44 px right padding.
- **Choices:** `div.choice` rows 44 px tall; the custom 24 px radio (navy ring, teal dot) drawn on the native input with
  `appearance: none`, so it stays focusable; the label clickable.
- **Help and hints:** `.field__help` `--step--1` `--ink-600`; `.field__hint.sr` visually hidden (`.sr` = `.vh`);
  `.field__error[hidden]` stays hidden (its text is empty; any message would be authored copy).
- **Submit:** `.form__foot > button.btn.btn--primary` ("Submit"), full width at 420 px and below.

### E.4 States and behaviour

| state | how it shows | who |
|---|---|---|
| focus | 3 px `--teal-700` ring, offset 2 px, `--teal-700` border (controls); the ring on the radio | CSS |
| invalid | `[aria-invalid="true"]` border and message in `--alert-700`; native constraint validation bubbles on submit | browser (no script sets `aria-invalid` today) |
| required | `required` / `aria-required="true"` as given; the asterisk is decorative | model |
| conditional | `[data-show-if]` hidden unless the named radio has the value (1.10); shown without JS | site.js |
| errors | `p.field__error[hidden]` never shown | model |
| backend | `data-needs-backend="form endpoint"` stays until an endpoint is decided (OPEN-DECISIONS Q8) | model |
| submit | inert (QA round 1, CONTENT-1): the browser validates, then nothing is sent (`method="dialog"`, and site.js cancels the `submit` event) and every typed value stays, with or without JavaScript; no message (none is authored, Q8) | browser, site.js |
| notice (dormant) | only if a decided notice exists in the model: the template prints `<p class="form__notice" role="status" hidden>{notice}</p>` as the first child of `div.form-card` (before the form), and site.js shows it on a valid submit (1.10). **No model field carries a notice today** (`chrome.json` `notice` is null and the page model's `chrome` has no `notice` key), so nothing prints (gap I.24) | template, site.js |

- **No visible CAPTCHA.** The source's invisible reCAPTCHA, the honeypot and Akismet are dropped by the pipeline (declared;
  the form's parsed `dropped` lists them: 6 entries over the 2 forms); no badge, no third-party script.
- **No search anywhere.** The sidebar search widget, the in-content `ecp-search` modules (7 hubs), the 4 "Nothing Found"
  search forms, the sitemap's search form and the footer voice search are removed (OPEN-DECISIONS Q13, chrome C02). No
  search markup, class or hook exists in this contract.
- **Not rendered:** the parsed form data `form.fields[].description` (and its copy `forms[].fields[].description`) carries
  one `<a>` (the date-field help link to `/hours-location/`); it is data for a rebuild from `form.form`, which this contract
  does not do. `form.dropped`, `form.conditional`, `form.id`, `form.submit` are data too. The rendered markup is
  `form.html` alone.

---

## F. Cards, accordion, carousel, team, blog index and archives, legal, 404

### F.1 The card family (one table: every card the site prints)

| card | element and classes | surface | link | `data-tilt` | reveal | defined in |
|---|---|---|---|---|---|---|
| service card | `li.card.card--svc` | glass | stretched (`card__link`) | yes | `card__body` | B.6 |
| brand card (hub) | `li.card.card--brand` | frost | none | no | `card` | C.7 |
| callout card (home) | `article.callout` | paper | stretched when titled with `href` | when linked | the card | B.9 |
| hub callout | `div.hub-callout` | paper | the title link when `href` | no | no | C.7 |
| hub intro | `div.hub-intro` | glass | buttons | no | no | C.7 |
| tint panel | `div.panel` | tint | buttons | no | no | B.22 |
| news / blog card | `li.post` | frost | stretched | yes | the card | B.18, B.28 |
| child-page card | `li.childcard` (`childcard--thumb` with a thumbnail) | frost | stretched | yes | `childcard__body` | F.2 |
| archive row | `li.archive-row` | paper | the row link | no | no | B.28 |
| team card | `li.member` | frost | stretched + `a.more` | yes | `member__body` | B.27 |
| doctor block | `div.doctor__text` | paper | name link, buttons | no | `doctor__text` | B.10 |
| product card | `li.product` | frost | none | no | no | F.7 |
| device card | `li.device` | frost | none | no | no | F.7 |
| testimonial / static review | `figure.testimonial`, `figure.review.review--static` | frost | the title link (testimonial) | no | no | F.6 |
| location card | `div.side-card--loc` | paper | links | no | no | B.23 |
| quick-actions card | `div.side-card--actions` | glass | pills | no | no | B.23 |

Shared rules: B.8 (radius `--r-l`, padding, the stretched link, glare, ring, tilt only with a stretched link).

### F.2 Child-page listings (`childpages` `plain` and `thumbs`; 3.28)

```html
<ul class="childlist childlist--{plain|thumbs}" role="list">
  <li class="childcard [childcard--thumb] surface surface--frost" data-tilt>                <!-- … each item -->
    <div class="childcard__media frame pl-break" data-protrude="thumb-{n}" data-cross="parent">   <!-- ? thumbs: item.thumb, or an art.inline hub-item [P4] -->
      <img src="{thumb.url}" srcset="{[P1]}" sizes="{F.2 sizes}" alt="{thumb.alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
    </div>
    <div class="childcard__body rv">
      <p class="childcard__title"><a class="card__link" href="{item.href}">{item.title}</a></p>
      <p class="childcard__summary">{item.summary}</p>                                      <!-- ? summary not "" -->
    </div>
  </li>
</ul>
```

- The title is a `p` (the source's child-page titles are not heading elements; the scaffold's `p.card__title` passes
  heading-parity). The summary is plain text (escaped).
- `plain` (14 blocks, 48 items; 4 empty summaries, all on `/contact-us/`): link cards in two columns at 769 px and up, one
  below; no media. `thumbs` (3 hubs, 26 items): image cards 3 / 2 / 1 columns at 1024+ / 600-1023 / below, the thumbnail
  (325x217 on most; 640x349, 250x167, 1600x1067 on `/eye-care-services/`) in a 3:2 frame breaking 48 px above the card top
  (a hub depth device; 32 px below 1024 px); `k` = max(1, 0.667 × w/h); `Wd` 340px, from 1024 px (3 columns) `calc(25.4vw - 5px)`, from 600 px (2 columns)
  `calc(46vw - 56px)`, `Wp` `calc(100vw - 72px)` (the contract's `calc(50vw - 64px)` from 769 px over-fetched 1.8-2.4x;
  I.67).
- The 2 items with `thumbDropped` (`/eye-care-services/`: "Myopia Management in Southwest Florida", "Dry Eye Treatment in
  Fort Myers, Florida") take the `art.inline[]` entry whose anchor is `hub-item` with that `text` (N1, N10) [P4]; until P4,
  they print with no media and no `childcard--thumb` (the card keeps its place in the grid).
- **No-occlusion:** the thumbnail crosses its own card's top edge by 48 / 32 px; reservation = the grid's top margin and row
  gap of 48 + 16 px (32 + 16 px).

### F.3 Post lists (`posts` `summary`, `list`, `grid`)

B.18 (grid, home) and B.28 (summary, list). `/whats-new/` (summary, 21) in two columns at 1024 px and up; `/sitemap/`
(list, 21) in one column below the sitemap tree (F.5). No pagination anywhere (as at source).

### F.4 Archives (17 pages)

- 13 archives list their posts as `childpages` variant `archive` (34 rows): B.28's `ul.archive-list`.
- 4 archives (`/category/our-doctors/`, `/category/our-staff/`, `/category/testimonials/`, `/tag/licansed-by-adobe-stock/`)
  print their model prose ("It seems we can't find what you're looking for. …") in the article card; the source's search
  form is not printed (E.4).
- Every archive: the title band (the h1 as the model gives it; the `<title>` of all 17 is a documented repair, BUILD-NOTES
  6 row 10: 13 borrowed a post's title, 4 were empty), the breadcrumb "Home » " (empty own segment), the utility arch [P4],
  the standard aside; `noindex` is in `robots`.

### F.5 Sitemap (`/sitemap/`)

```html
<div class="sitemap">
  <ul class="sitemap__list" role="list">
    <li class="sitemap__item"><a class="sitemap__link" href="{item.href}">{item.title}</a>
      <ul class="sitemap__list" role="list">…</ul>                                             <!-- ? deeper items nest by depth -->
    </li>
  </ul>
</div>
```

- The 92 items nest by `depth` (0: 17, 1: 33, 2: 41, 3: 1) exactly as the scaffold's algorithm does (a deeper item opens a
  nested list inside the previous item; a shallower one closes lists). Top-level groups run in 3 / 2 / 1 columns at 1024+
  / 600-1023 / below; links are 44 px rows; nested lists indent 16 px with a 2 px `--teal-200` rule. Below 1024 px a link pads
  8 px top and bottom (mobile optimisation, M-LOOK-9, I.144): a link that wraps grows instead of filling its 44 px row (its
  text came within 3.2-4 px of the next one), a one-line link stays 44 px (`min-height` holds, `box-sizing: border-box`).
- The wrapper is a `div`, not a `nav`: the site already has the Main, Breadcrumb, Footer and Mobile navigation landmarks,
  and naming another one would need an authored label.
- The `posts` list block of the same page follows (F.3).

### F.6 Testimonials and the static review card (3.31)

```html
<figure class="testimonial surface surface--frost">                                           <!-- testimonials: … each item -->
  <{title.level} class="testimonial__title"><a href="{title.href}">{title.text}</a></{title.level}>   <!-- ? title -->
  <span class="stars" role="img" aria-label="{stars} out of 5 stars">{stars x star icon}</span>
  <blockquote class="testimonial__quote rich rich--compact">{item.html}</blockquote>
  <figcaption class="testimonial__name">{item.attribution}</figcaption>
</figure>

<figure class="review review--static surface surface--frost">                               <!-- reviews outside the home: … each item -->
  <div class="review__meta"><span class="stars" role="img" aria-label="{stars} out of 5 stars">…</span><time class="review__time" datetime="{reviewedAt, T}">{shownAs}</time></div>
  <blockquote class="review__quote rich rich--compact">{item.html}</blockquote>
  <figcaption class="review__name">{item.name}</figcaption>
</figure>
```

- `testimonials` (2 pages, 1 item each: "- Lukas R, Google 2021", 5 stars): on `/contact-us/testimonials/` the item has a
  title (`level: 'h2'`, linked to the testimonial page); on `/testimonial/this-was-a-great-experience/` it has none (the h1
  is the title). The attribution prints verbatim with its dash (not `name`). Stars: SVG icons, never glyphs. No carousel.
- `reviews` outside the home: `/eyeglasses/designer-frames/` s4 (1 item, "- Marshall B.") on its `band--photo` (C.7), then
  its `cta` ("More Google Reviews", external, new tab).

### F.7 Products and devices (3.31)

```html
<ul class="products" role="list">                                                            <!-- products: … each block -->
  <li class="product surface surface--frost">
    <div class="product__media"><img src="{image.url}" srcset="{[P1]}" sizes="{w}px" alt="{image.alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></div>
    <{level} class="product__title">{item.title}</{level}>
    <div class="product__text rich rich--compact">{item.html}</div>
    <p class="product__more">{item.more}</p>
  </li>
</ul>

<ul class="devices" role="list">                                                             <!-- equipment -->
  <li class="device surface surface--frost">
    <div class="device__media"><img src srcset="{[P1]}" sizes="{w}px" alt width height loading="lazy" decoding="async"></div>   <!-- natural-width slots, 0.8, I.68 -->
    <{level} class="device__title">{item.title}</{level}>
    <div class="device__text rich rich--compact">{item.html}</div>
  </li>
</ul>
```

- **Products** (7 blocks, 53 items on the 4 brand pages; titles `h3`; packshots 300x300, two 300x287 / 300x242; every `alt`
  is `""` in the model): the packshot whole on a white chip (`object-fit: contain`, never cropped, never cut out); the full
  text (`html`: paragraphs, lists, some h2-h4 sub-headings, which `rich--compact` scales down); "Read More+" (`more`) as
  muted `--ink-600` text with no link (OPEN-DECISIONS A.7: the source toggle's words; not a control). Columns from the
  space, cards 300 px or wider (`repeat(auto-fill, minmax(min(100%, 300px), 1fr))`; the chip at most 320 px tall): 2 in the
  article column at 1440, 1 at 1024 and on phones. **Changed by the integrate stage (gap I.80)** from "3 / 2 / 1 columns" by
  viewport: every products and devices block sits in the article column beside the aside, so 3 columns at 1024 px and up
  gave 190-230 px cards whose long texts ran about 18 characters a line (`/contact-lenses/our-featured-brands/coopervision/`
  was 23,121 px tall at 1440).
  `placeholder` is null on all 53.
- **Devices** (1 block, 9 items on `/eye-care-services/eye-exams/advanced-technology/`; h3; 300x300, 400x400, 320x320): the
  device image whole on a white plate; the title; the html. Columns as products (I.80). No cut-outs (IMAGE-PLAN 5.2).

### F.8 The visit block (3 pages; 3.31)

```html
<div class="visit visit--{view}">
  <div class="embed embed--map visit__map"><iframe src="{map.src}" title="{map.title}" loading="lazy"></iframe></div>   <!-- part 'map', when map not null -->
  <div class="visit__details">
    <{title.level} class="visit__title"><a href="{title.href}">{title.text}</a></{title.level}>   <!-- part 'title'; p.visit__title when level is null -->
    <h2 class="visit__sub">{subs.contact}</h2><ul class="contact" role="list">…</ul>           <!-- part 'contacts' (the B.23 contact rows; the note under Email) -->
    <h2 class="visit__sub">{subs.address}</h2><address class="loc__address">…</address>          <!-- part 'address' -->
    <h2 class="visit__sub">{subs.hours}</h2><table class="hours">…</table>                      <!-- part 'hours' (B.23 rows, with the colon) -->
  </div>
</div>
```

- Parts print in the model's `order`: `/hours-location/` (summary): map, title (`level: null` → `p.visit__title`), address,
  contacts, hours; `/location/riverside-family-eyecare/` (complete): contacts, address, map, hours, with the sub-headings
  "Contact Details", "Address", "Hours" (`subs`); `/contact-us/` (list): title (h2), contacts; no map, no hours.
- `visit__sub` prints a sub-heading only when `subs` has it (only the location page). It is an `h2` (the band holds the
  h1; the location page has no other heading). The source prints them as `div.heading-h3` (not heading elements), so
  heading-parity is unaffected; the scaffold printed `p.visit__sub`. Contract decision (gap I.25).
- **Map:** the live, lazy keyless iframe (Q-11: only on these 2 pages), 4:3, radius `--r-l`, `title` from the model
  ("Google map"). Split at 1024 px and up: map 7fr, details 5fr; stacked below with the map first. The map rules hold
  outside model HTML too (`:is(.rich, .visit) .embed--map`): on `/hours-location/` the hub band prints the visit block
  outside any `.rich`, and the iframe kept the browser's 300x150 until the integrate stage (gap I.75).

### F.9 Accordion, carousel, team (pointers)

The accordion is B.26 (35 items on 3 pages, in the article flow; on `/eye-care-services/faq/` each block follows its h2
callout title). The carousel is B.15 (home only). Team: B.10 (doctor blocks: the home, `/our-eye-doctors/`), B.27 (the
staff grid, team-member bios).

### F.10 Legal and 404 (pointers)

B.29 (3 legal pages: the article card with prose only, measure 66ch, the lead rule and the link line only) and B.30 (`/404-page-not-found/`
and `dist/404.html`: the band, the 3 prose sections, the aside only where the model has one).

---

## G. Template map per family (SITE-ARCHITECTURE section 3; DESIGN-SPEC 4.1)

### G.1 The map

Pages = SITE-ARCHITECTURE section 3 (148 crawled pages, 14 families, first matching rule wins); models = `tmp/page-models/`
(149: the pages plus `404.json`, the `dist/404.html` variant). Every model's `family` equals its page's family.

| family | SA rule (section 3) | pages | models | `<body>` classes | template | layout (models) | title band, arch | aside | CTA band | protrusion devices | river |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `template` | `body.single-template` | 6 | 6 | `page-template tpl-hub` | C.7, noindex | builder 6 | yes; TB-utility [P4] | none | none | arch | title route with the hub exit, left bank (I.73) |
| `home` | `body.home` | 1 | 1 | `page-home tpl-home` | B.16 | builder 1 | none (h1 in the intro card) | none | none (the insurance band closes) | 10 (5.1) + optional kids' glasses | home route table (37 anchors), 2 weave zones, footer horizon |
| `not-found` | path `/404-page-not-found/` | 1 | 2 | `page-not-found tpl-article` (+ `has-aside` on the page, not on `404.html`) | C.1, B.30 | classic 2 | yes; TB-utility [P4] | standard on 1; none on `404.html` | none | arch | template route |
| `archive` | `body.archive` | 17 | 17 | `page-archive tpl-article has-aside` | C.1, F.4 | classic 17 | yes; TB-utility [P4] | standard | none | arch | template route |
| `blog-post` | `body.single-post` | 21 | 21 | `page-blog-post tpl-article has-aside` | C.1 | classic 18, builder 3 | yes, with the date; TB-blog [P4] | standard | none qualifies | arch | template route |
| `team-member` | `body.single-team` | 11 | 11 | `page-team-member tpl-article has-aside` | C.1, B.27 | classic 9, builder 2 | yes; own portrait 5, plate 4, `art.title` 2 [P4]; the position chip on 7 | standard | 1 (Degler, bare) | arch | template route |
| `testimonial` | `body.single-testimonial` | 1 | 1 | `page-testimonial tpl-article has-aside` | C.1, F.6 | classic 1 | yes; TB-utility [P4] | standard | none | arch | template route |
| `location` | `body.single-location` | 1 | 1 | `page-location tpl-article has-aside` | C.1, F.8 | classic 1 | yes; TB-contact [P4] | location-page (no location card, unlabelled) | none | arch | template route |
| `builder-hub` | `body.page` without `div.ecp-secondary` | 9 | 9 | `page-builder-hub tpl-hub` | C.7 | builder 9 | yes; own header photo 6; TB-eyeglasses, TB-contact, TB-insurance 1 each [P4] | none | none qualifies | arch; thumbnails and team portraits (48 px) | title route with the hub exit, left bank between sections (I.73) |
| `sitemap` | path `/sitemap/` | 1 | 1 | `page-sitemap tpl-article has-aside` | C.1, F.5 | classic 1 | yes; TB-utility [P4] | standard | none | arch | template route |
| `legal` | path `/disclaimer/`, `/privacy-policy/`, `/website-accessibility-policy/` | 3 | 3 | `page-legal tpl-article has-aside` | C.1, B.29 (66ch) | classic 3 | yes; TB-utility [P4] | standard | none | arch | template route |
| `form` | a sidebar page whose main holds a Gravity Form | 2 | 2 | `page-form tpl-article has-aside` | C.1, B.25, E | builder 1, classic 1 | yes; TB-contact [P4] | standard | none | arch | template route |
| `blog-index` | a sidebar page listing post summaries | 1 | 1 | `page-blog-index tpl-article has-aside` | C.1, B.28 | classic 1 | yes; TB-blog [P4] | standard | none | arch | template route |
| `interior` | every other `body.page` with `div.ecp-secondary` | 73 | 73 | `page-interior tpl-article has-aside` | C.1 | classic 61, builder 12 | yes; TB-ecs 21, TB-eyeglasses 35, TB-contacts 11, TB-insurance 3, TB-contact 3 [P4] | standard | 3 | arch | template route |
| **total** | | **148** | **149** | | | | | | | | |

"Template route" = the title route (t1-t3, B.21) + the article route (p1-p4, C.1) + the CTA anchor (q1, B.24, when the
band exists) + the footer horizon (z1-z3, B.19).

### G.2 Members of the small families

- `template`: `/template/footer/`, `/template/footer-2/`, `/template/header/`, `/template/header-2/`, `/template/header-3/`,
  `/template/inner-header/`.
- `builder-hub`: `/cherry-payment-plan/`, `/contact-lenses/`, `/eye-care-services/`, `/eyeglasses/`,
  `/eyeglasses/designer-frames/`, `/hours-location/`, `/insurance/`, `/our-eye-doctors/`, `/the-staff/`.
- `form`: `/contact-us/appointment-request-form/`, `/contact-us/contact-form/`. `legal`: `/disclaimer/`,
  `/privacy-policy/`, `/website-accessibility-policy/`. `location`: `/location/riverside-family-eyecare/`. `testimonial`:
  `/testimonial/this-was-a-great-experience/`. `sitemap`: `/sitemap/`. `blog-index`: `/whats-new/`. `not-found`:
  `/404-page-not-found/` (+ `404.html`).
- `team-member`: the 11 `/team/*` pages. `archive`: `/author/riversidefamilyeyecare/`, the 5 `/category/*` and the 11
  `/tag/*` pages. `blog-post`: the 21 root-level posts. `interior`: the rest (73; the 12 builder interiors are the 12
  `/eye-care-services/*` pages SITE-ARCHITECTURE 3 lists).

---

## H. Class-name index

Generated from this document by `tmp/wf5a/contract/build-doc.mjs`: every class printed in a markup example or named in a
selector, every class the models emit (census), and the declared state classes. "Defined in" is the section that
first prints or declares it. "Origin": `prototype` (in `tmp/panel/riverlight/`), `model` (emitted by the content
pipeline), `spec` (named in DESIGN-SPEC), `contract` (new here). 407 classes (406 generated, plus `.link-line`, added by
the verification); 178 of the 252 prototype classes are kept, the other 74 are in H.2, with the prototype ids and
`data-*` names not kept. Three origin labels were corrected by the verification: `.hero__statement`, `.ra` and
`.ph-portrait` are written in DESIGN-SPEC's own markup (3.4, 2.8 A2, 3.10).

### H.1 The index

| class | component (the section that defines it) | defined in | origin |
|---|---|---|---|
| `.alumier` | Alumier band | B.7 | prototype |
| `.alumier__bg` | Alumier band | B.7 | prototype |
| `.alumier__card` | Alumier band | B.7 | prototype |
| `.alumier__line` | Alumier band | B.7 | prototype |
| `.alumier__logo` | Alumier band | B.7 | prototype |
| `.alumier__panel` | Alumier band | B.7 | prototype |
| `.archive-list` | Blog index and archive cards | B.28 | contract |
| `.archive-row` | Blog index and archive cards | B.28 | contract |
| `.archive-row__link` | Blog index and archive cards | B.28 | contract |
| `.attribution` | What the content pipeline emits | D.2 | model, spec |
| `.aurora-deep` | Class naming | 0.2 | spec |
| `.aurora-field` | Body order, skip link, landmarks, decorative layers | A.3 | contract |
| `.aurora-field__layer` | Body order, skip link, landmarks, decorative layers | A.3 | contract |
| `.aurora-field__layer--dawn` | Body order, skip link, landmarks, decorative layers | A.3 | contract |
| `.aurora-field__layer--day` | Body order, skip link, landmarks, decorative layers | A.3 | contract |
| `.aurora-field__layer--dusk` | Body order, skip link, landmarks, decorative layers | A.3 | contract |
| `.band` | The builder-hub frame | C.7 | spec |
| `.band__inner` | The builder-hub frame | C.7 | contract |
| `.band__panel` | The builder-hub frame | C.7 | contract |
| `.band--intro` | The builder-hub frame | C.7 | contract |
| `.band--lav` | The builder-hub frame | C.7 | contract |
| `.band--photo` | The builder-hub frame | C.7 | contract |
| `.band--plain` | The builder-hub frame | C.7 | contract |
| `.band--sky` | The builder-hub frame | C.7 | contract |
| `.bank` | Home hero | B.4 | spec |
| `.bank__fill` | Home hero | B.4 | contract |
| `.bank__navy` | Home hero | B.4 | contract |
| `.bank__teal` | Home hero | B.4 | contract |
| `.bank--down` | Home hero | B.4 | contract |
| `.bank--footer` | Footer | B.19 | contract |
| `.bank--hero` | Home hero | B.4 | contract |
| `.bank--lav` | Lavender trio | B.11 | contract |
| `.bank--title` | Interior title band | B.21 | contract |
| `.bank--up` | Lavender trio | B.11 | contract |
| `.brand` | Header, nav, dropdowns, drawer | B.2 | prototype, spec |
| `.btn` | Shared controls | B.0 | prototype, model, spec |
| `.btn--ghost` | Shared controls | B.0 | prototype, spec |
| `.btn--lg` | Shared controls | B.0 | prototype, spec |
| `.btn--light` | Shared controls | B.0 | prototype, spec |
| `.btn--primary` | Shared controls | B.0 | prototype, model, spec |
| `.btn--secondary` | Shared controls | B.0 | prototype, spec |
| `.btn-row` | Shared controls | B.0 | contract |
| `.callout` | Two callouts | B.9 | prototype, spec |
| `.callout__media` | Two callouts | B.9 | prototype |
| `.callout__text` | Two callouts | B.9 | contract |
| `.callout__title` | Two callouts | B.9 | prototype |
| `.callout-title` | Long-form prose | B.22 | contract |
| `.callouts` | Two callouts | B.9 | prototype, spec |
| `.callouts__cell` | Two callouts | B.9 | contract |
| `.callouts__grid` | Two callouts | B.9 | prototype |
| `.card` | Envision promo | B.6 | prototype, spec |
| `.card__body` | Envision promo | B.6 | contract |
| `.card__link` | Envision promo | B.6 | prototype |
| `.card__media` | Envision promo | B.6 | prototype |
| `.card__text` | Envision promo | B.6 | contract |
| `.card__title` | Envision promo | B.6 | prototype |
| `.card--brand` | The builder-hub frame | C.7 | contract |
| `.card--svc` | Envision promo | B.6 | prototype |
| `.cards` | Envision promo | B.6 | prototype, spec |
| `.cards--4` | Envision promo | B.6 | prototype |
| `.cards--brand` | The builder-hub frame | C.7 | contract |
| `.carousel` | Reviews carousel | B.15 | prototype, spec |
| `.carousel__dot` | Carousel | 1.6 | contract |
| `.carousel__bar` | Reviews carousel: the dots and the CTA, above the track (QA round 1, I.109) | B.15 | QA round 1 |
| `.carousel__dots` | Reviews carousel | B.15 | prototype |
| `.carousel__track` | Reviews carousel | B.15 | prototype |
| `.cataract` | Cataract | B.13 | prototype, spec |
| `.cataract__copy` | Cataract | B.13 | contract |
| `.cataract__grid` | Cataract | B.13 | prototype |
| `.cataract__lens` | Cataract | B.13 | prototype |
| `.cataract__text` | Cataract | B.13 | prototype |
| `.checklist` | Prose enhancers | D.6 | spec |
| `.cherry` | Other blocks | B.31 | spec |
| `.cherry-link` | Other blocks | B.31 | contract |
| `.cherry-link__pending` | Other blocks | B.31 | contract |
| `.childcard` | Child-page listings | F.2 | contract |
| `.childcard__body` | Child-page listings | F.2 | contract |
| `.childcard__media` | Child-page listings | F.2 | contract |
| `.childcard__summary` | Child-page listings | F.2 | contract |
| `.childcard__title` | Child-page listings | F.2 | contract |
| `.childcard--thumb` | Child-page listings | F.2 | contract |
| `.childlist` | Child-page listings | F.2 | contract |
| `.childlist--plain` | Child-page listings | F.2 | contract |
| `.childlist--thumbs` | Child-page listings | F.2 | contract |
| `.chip` | Shared controls | B.0 | spec |
| `.choice` | What the form markup emits | E.2 | model, spec |
| `.choice__input` | What the form markup emits | E.2 | model |
| `.choice__label` | What the form markup emits | E.2 | model |
| `.cols` | Prose enhancers | D.6 | prototype |
| `.contact` | Aside and sidebar widgets | B.23 | prototype, spec |
| `.container` | Z-planes | 0.5 | prototype, spec |
| `.crumbs` | Breadcrumbs | B.20 | prototype |
| `.crumbs__sep` | Breadcrumbs | B.20 | contract |
| `.ctaband` | CTA band | B.24 | spec |
| `.ctaband__actions` | CTA band | B.24 | contract |
| `.ctaband__copy` | CTA band | B.24 | contract |
| `.ctaband__panel` | CTA band | B.24 | contract |
| `.ctaband__text` | CTA band | B.24 | contract |
| `.device` | Products and devices | F.7 | spec |
| `.device__media` | Products and devices | F.7 | contract |
| `.device__text` | Products and devices | F.7 | contract |
| `.device__title` | Products and devices | F.7 | contract |
| `.devices` | Products and devices | F.7 | spec |
| `.dnav` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.dnav__group` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.dnav__row` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.dnav__sub` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.dnav__toggle` | Header, nav, dropdowns, drawer | B.2 | contract |
| `.doc` | Other blocks | B.31 | contract |
| `.docs` | Other blocks | B.31 | spec |
| `.doctor` | Doctor blocks and the portrait placeholder | B.10 | prototype, spec |
| `.doctor__grid` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.doctor__grid--flip` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.doctor__photo` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.doctor__plate` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.doctor__portrait` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.doctor__prose` | Doctor blocks and the portrait placeholder | B.10 | contract |
| `.doctor__tag` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.doctor__text` | Doctor blocks and the portrait placeholder | B.10 | prototype |
| `.drawer` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.drawer__actions` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.drawer__close` | Header, nav, dropdowns, drawer | B.2 | contract |
| `.drawer__head` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.drawer__logo` | Header, nav, dropdowns, drawer | B.2 | contract |
| `.drawer__panel` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.embed` | What the content pipeline emits | D.2 | model, spec |
| `.embed--map` | The visit block | F.8 | spec |
| `.embed--other` | The allowed element set this site does not emit | D.3 | spec |
| `.embed--video` | What the content pipeline emits | D.2 | model, spec |
| `.emergency` | Eye Emergencies | B.14 | prototype |
| `.emergency__copy` | Eye Emergencies | B.14 | contract |
| `.emergency__grid` | Eye Emergencies | B.14 | prototype |
| `.emergency__photo` | Eye Emergencies | B.14 | prototype |
| `.emergency__text` | Eye Emergencies | B.14 | prototype |
| `.faq` | Accordion | B.26 | prototype |
| `.faq__a` | Accordion | B.26 | prototype |
| `.faq__item` | Accordion | B.26 | contract |
| `.faq__q` | Accordion | B.26 | contract |
| `.field` | What the form markup emits (the prototype also used `field` for the aurora layer: renamed `aurora-field`, 0.2) | E.2 | prototype, model, spec |
| `.field__control` | What the form markup emits | E.2 | model, spec |
| `.field__error` | What the form markup emits | E.2 | model, spec |
| `.field__error-text` | What the form markup emits | E.2 | model |
| `.field__help` | What the form markup emits | E.2 | model, spec |
| `.field__hint` | What the form markup emits | E.2 | model, spec |
| `.field__label` | What the form markup emits | E.2 | model, spec |
| `.field__req` | What the form markup emits | E.2 | model, spec |
| `.field__row` | What the form markup emits | E.2 | model, spec |
| `.field__sub` | What the form markup emits | E.2 | model |
| `.field__sublabel` | What the form markup emits | E.2 | model, spec |
| `.field--choice` | What the form markup emits | E.2 | model |
| `.field--group` | What the form markup emits | E.2 | model |
| `.field--wide` | What the form markup emits | E.2 | model |
| `.fig` | What the content pipeline emits | D.2 | model, spec |
| `.fig__caption` | Figures, embeds and media placement (name captions; QA round 1, regressions R1) | D.5, D.7 | contract |
| `.fig__media` | What the content pipeline emits | D.2 | model, spec |
| `.fig--brand` | What the content pipeline emits | D.2 | model, spec |
| `.fig--center` | The allowed element set this site does not emit | D.3 | spec |
| `.fig--chip` | Figures, embeds and media placement | D.5 | contract |
| `.fig--column` | Figures, embeds and media placement | D.5 | contract |
| `.fig--diagram` | What the content pipeline emits | D.2 | model, spec |
| `.fig--inset` | Figures, embeds and media placement | D.5 | contract |
| `.fig--inset-start` | Figures, embeds and media placement | D.5 | contract |
| `.fig--left` | The allowed element set this site does not emit | D.3 | spec |
| `.fig--photo` | What the content pipeline emits | D.2 | model, spec |
| `.fig--plate` | What the content pipeline emits | D.2 | model, spec |
| `.fig--portrait` | What the content pipeline emits | D.2 | model, spec |
| `.fig--right` | The allowed element set this site does not emit | D.3 | spec |
| `.fig--wide` | Figures, embeds and media placement | D.5 | contract |
| `.fig-grid` | What the content pipeline emits | D.2 | model, spec |
| `.footer__financing` | Footer | B.19 | contract |
| `.footer__grid` | Footer | B.19 | prototype |
| `.footer__menu` | Footer | B.19 | prototype |
| `.footer__nap` | Footer | B.19 | prototype |
| `.footer__social` | Footer | B.19 | prototype |
| `.form` | What the form markup emits | E.2 | model, spec |
| `.form__foot` | What the form markup emits | E.2 | model, spec |
| `.form__grid` | What the form markup emits | E.2 | model, spec |
| `.form__intro` | What the form markup emits | E.2 | model, spec |
| `.form__notice` | States and behaviour | E.4 | contract |
| `.form-card` | Forms | B.25 | contract |
| `.frame` | Envision promo | B.6 | prototype, spec |
| `.frame__clip` | Home hero | B.4 | prototype |
| `.frame__img` | Home hero | B.4 | prototype |
| `.frames` | Designer-frames grid | B.12 | prototype, spec |
| `.frames__copy` | Designer-frames grid | B.12 | contract |
| `.frames__grid` | Designer-frames grid | B.12 | prototype |
| `.frames__text` | Designer-frames grid | B.12 | prototype |
| `.h1--long` | State classes and build-time states | 0.3 | spec |
| `.h1--xlong` | State classes and build-time states | 0.3 | spec |
| `.has-aside` | Body classes per family | A.2 | contract |
| `.has-sub` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.hero` | Home hero | B.4 | prototype, spec |
| `.hero__copy` | Home hero | B.4 | prototype |
| `.hero__frame` | Home hero | B.4 | prototype |
| `.hero__grid` | Home hero | B.4 | prototype |
| `.hero__light` | Home hero | B.4 | prototype |
| `.hero__poster` | Home hero | B.4 | prototype |
| `.hero__statement` | Home hero | B.4 | prototype, spec |
| `.hero__toggle` | Hero loop loader and its toggle | 1.9 | contract |
| `.hours` | Aside and sidebar widgets | B.23 | prototype, spec |
| `.hub-callout` | The builder-hub frame | C.7 | contract |
| `.hub-flow` | The builder-hub frame | C.7 | contract |
| `.hub-intro` | The builder-hub frame | C.7 | contract |
| `.ico` | Icons | 0.7 | prototype |
| `.insurance` | Home section order | B.16 | prototype, spec |
| `.insurance__copy` | Insurance band | B.17 | contract |
| `.insurance__cta` | Insurance band | B.17 | contract |
| `.insurance__inner` | Insurance band | B.17 | prototype |
| `.insurance__title` | Insurance band | B.17 | contract |
| `.intro` | Intro card | B.5 | prototype, spec |
| `.intro__card` | Intro card | B.5 | prototype |
| `.intro__text` | Intro card | B.5 | contract |
| `.intro__title` | Intro card | B.5 | prototype |
| `.is-in` | State classes and build-time states | 0.3 | prototype, spec |
| `.is-open` | State classes and build-time states | 0.3 | prototype |
| `.is-paused` | State classes and build-time states | 0.3 | contract |
| `.is-playing` | State classes and build-time states | 0.3 | prototype |
| `.is-section` | State classes and build-time states | 0.3 | contract |
| `.js` | State classes and build-time states | 0.3 | spec |
| `.lavender` | Lavender trio | B.11 | prototype, spec |
| `.layout` | Legal pages | B.29 | spec |
| `.layout__grid` | Legal pages | B.29 | contract |
| `.lead` | Prose enhancers | D.6 | prototype, spec |
| `.legal` | Footer | B.19 | prototype, spec |
| `.legal__inner` | Footer | B.19 | prototype |
| `.li--wrap` | Lists (added by the mobile optimisation, I.128) | D.4, D.7 | contract |
| `.link-line` | Prose enhancers (added by the verification, gap I.46) | D.6 | contract |
| `.loc` | Aside and sidebar widgets | B.23 | prototype |
| `.loc__address` | Aside and sidebar widgets | B.23 | contract |
| `.loc__title` | Aside and sidebar widgets | B.23 | contract |
| `.logo-chip` | What the content pipeline emits | D.2 | model, spec |
| `.logo-chip__link` | The allowed element set this site does not emit | D.3 | contract |
| `.logo-chip--link` | The allowed element set this site does not emit | D.3 | contract |
| `.logo-grid` | What the content pipeline emits | D.2 | model, spec |
| `.logo-wall` | Other blocks | B.31 | contract |
| `.logo-wall__chip` | Other blocks | B.31 | contract |
| `.logo-wall--carriers` | Other blocks | B.31 | contract |
| `.logo-wall--frame-brands` | Other blocks | B.31 | contract |
| `.mainnav` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.mainnav__item` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.mainnav__link` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.mainnav__list` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.mainnav__toggle` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.mapcard` | Aside and sidebar widgets | B.23 | prototype, spec |
| `.member` | Team cards | B.27 | contract |
| `.member__bio` | Team cards | B.27 | contract |
| `.member__body` | Team cards | B.27 | contract |
| `.member__more` | Team cards | B.27 | contract |
| `.member__name` | Team cards | B.27 | contract |
| `.member__photo` | Team cards | B.27 | contract |
| `.menu-toggle` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.mobilebar` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.more` | Shared controls | B.0 | spec |
| `.navbar` | Header, nav, dropdowns, drawer | B.2 | prototype, spec |
| `.navbar__inner` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.news` | Home section order | B.16 | prototype, spec |
| `.no-modal` | State classes (added by the mobile optimisation, I.129) | 0.3, B.2 | contract |
| `.note` | Aside and sidebar widgets | B.23 | prototype, spec |
| `.page` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.page-archive` | Body classes per family | A.2 | contract |
| `.page-blog-index` | Body classes per family | A.2 | contract |
| `.page-blog-post` | Body classes per family | A.2 | contract |
| `.page-builder-hub` | Body classes per family | A.2 | contract |
| `.page-form` | Body classes per family | A.2 | contract |
| `.page-home` | Body classes per family | A.2 | prototype |
| `.page-interior` | Body classes per family | A.2 | prototype |
| `.page-legal` | Body classes per family | A.2 | contract |
| `.page-location` | Body classes per family | A.2 | contract |
| `.page-not-found` | Body classes per family | A.2 | contract |
| `.page-sitemap` | Body classes per family | A.2 | contract |
| `.page-team-member` | Body classes per family | A.2 | contract |
| `.page-template` | Body classes per family | A.2 | contract |
| `.page-testimonial` | Body classes per family | A.2 | contract |
| `.panel` | Long-form prose | B.22 | spec |
| `.ph-brand` | Designer-frames grid | B.12 | contract |
| `.ph-brand__name` | Designer-frames grid | B.12 | contract |
| `.ph-portrait` | Doctor blocks and the portrait placeholder | B.10 | spec |
| `.ph-portrait__mono` | Doctor blocks and the portrait placeholder | B.10 | contract |
| `.ph-portrait__name` | Doctor blocks and the portrait placeholder | B.10 | contract |
| `.ph-portrait__ring` | Doctor blocks and the portrait placeholder | B.10 | contract |
| `.pill` | Top bar | B.1 | prototype, spec |
| `.pill--ghost` | Top bar | B.1 | prototype |
| `.pl-band` | Z-planes | 0.5 | contract |
| `.pl-break` | Z-planes | 0.5 | contract |
| `.pl-cut` | Z-planes | 0.5 | contract |
| `.pl-raise` | Z-planes | 0.5 | contract |
| `.pl-surface` | Z-planes | 0.5 | contract |
| `.post` | News cards | B.18 | prototype, spec |
| `.post__date` | News cards | B.18 | prototype |
| `.post__excerpt` | News cards | B.18 | prototype |
| `.post__more` | Blog index and archive cards | B.28 | contract |
| `.post__title` | News cards | B.18 | prototype |
| `.posts` | News cards | B.18 | prototype, spec |
| `.posts--grid` | News cards | B.18 | contract |
| `.posts--list` | Blog index and archive cards | B.28 | contract |
| `.posts--summary` | Blog index and archive cards | B.28 | contract |
| `.product` | Products and devices | F.7 | spec |
| `.product__media` | Products and devices | F.7 | contract |
| `.product__more` | Products and devices | F.7 | contract |
| `.product__text` | Products and devices | F.7 | contract |
| `.product__title` | Products and devices | F.7 | contract |
| `.products` | Products and devices | F.7 | spec |
| `.promo` | Envision promo | B.6 | prototype, spec |
| `.prose` | Containers and scoping | D.1 | prototype, spec |
| `.prose-card` | Long-form prose | B.22 | spec |
| `.protrude` | Home hero | B.4 | prototype |
| `.protrude--glasses` | Home hero | B.4 | prototype |
| `.protrude--kids` | Two callouts | B.9 | contract |
| `.qa` | Aside and sidebar widgets | B.23 | prototype |
| `.qa--navy` | Aside and sidebar widgets | B.23 | prototype |
| `.qa-list` | Aside and sidebar widgets | B.23 | contract |
| `.qa-row` | Other blocks | B.31 | contract |
| `.ra` | The river | 1.8 | prototype, spec |
| `.review` | Reviews carousel | B.15 | prototype, spec |
| `.review__meta` | Reviews carousel | B.15 | prototype |
| `.review__name` | Reviews carousel | B.15 | contract |
| `.review__quote` | Reviews carousel | B.15 | contract |
| `.review__time` | Reviews carousel | B.15 | prototype |
| `.review--static` | Testimonials and the static review card | F.6 | contract |
| `.reviews` | Reviews carousel | B.15 | prototype, spec |
| `.reviews__grid` | Reviews carousel | B.15 | prototype |
| `.reviews__panel` | Reviews carousel | B.15 | prototype |
| `.reviews__photo` | Reviews carousel | B.15 | prototype |
| `.reviews__title` | Reviews carousel | B.15 | prototype |
| `.rich` | Containers and scoping | D.1 | contract |
| `.rich--compact` | Containers and scoping | D.1 | contract |
| `.river` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.river--over` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.river--under` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.roundbtn` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.roundbtn--ghost` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.roundbtn--navy` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.roundbtn--teal` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.rv` | State classes and build-time states | 0.3 | prototype, spec |
| `.rv-ready` | State classes and build-time states | 0.3 | prototype, spec |
| `.rz` | The river | 1.8 | prototype |
| `.section__bg` | The builder-hub frame | C.7 | contract |
| `.section-title` | Section header | B.3 | prototype |
| `.section-title--left` | Section header | B.3 | prototype |
| `.services` | Envision promo | B.6 | prototype, spec |
| `.services__band` | Envision promo | B.6 | prototype |
| `.side-card` | Aside and sidebar widgets | B.23 | prototype |
| `.side-card--actions` | Aside and sidebar widgets | B.23 | contract |
| `.side-card--loc` | Aside and sidebar widgets | B.23 | contract |
| `.sidebar` | Aside and sidebar widgets | B.23 | prototype, spec |
| `.site-footer` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.site-header` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.sitemap` | Sitemap | F.5 | spec |
| `.sitemap__item` | Sitemap | F.5 | contract |
| `.sitemap__link` | Sitemap | F.5 | contract |
| `.sitemap__list` | Sitemap | F.5 | contract |
| `.skip` | Body order, skip link, landmarks, decorative layers | A.3 | prototype, spec |
| `.social` | Footer | B.19 | prototype, spec |
| `.social__link` | Footer | B.19 | prototype |
| `.sprite` | Icons | 0.7 | prototype |
| `.sr` | Class naming | 0.2 | model, spec |
| `.stars` | Reviews carousel | B.15 | prototype, spec |
| `.sub` | Header, nav, dropdowns, drawer | B.2 | prototype, spec |
| `.sub--end` | Header, nav, dropdowns, drawer | B.2 | prototype |
| `.surface` | Class naming | 0.2 | prototype, spec |
| `.surface--frost` | Class naming | 0.2 | contract |
| `.surface--glass` | Class naming | 0.2 | prototype |
| `.surface--image` | Class naming | 0.2 | prototype |
| `.surface--navy` | Class naming | 0.2 | contract |
| `.surface--paper` | Class naming | 0.2 | prototype |
| `.surface--tint` | Class naming | 0.2 | contract |
| `.table-scroll` | The allowed element set this site does not emit | D.3 | spec |
| `.team-grid` | Team cards | B.27 | contract |
| `.testimonial` | Testimonials and the static review card | F.6 | spec |
| `.testimonial__name` | Testimonials and the static review card | F.6 | contract |
| `.testimonial__quote` | Testimonials and the static review card | F.6 | contract |
| `.testimonial__title` | Testimonials and the static review card | F.6 | contract |
| `.tile` | Designer-frames grid | B.12 | prototype, spec |
| `.tile__media` | Designer-frames grid | B.12 | prototype |
| `.tile--text` | Designer-frames grid | B.12 | prototype |
| `.tiles` | Designer-frames grid | B.12 | prototype, spec |
| `.titleband` | Interior title band | B.21 | prototype, spec |
| `.titleband__date` | Interior title band | B.21 | contract |
| `.titleband__frame` | Interior title band | B.21 | prototype |
| `.titleband__grid` | Interior title band | B.21 | prototype |
| `.titleband__pane` | Interior title band | B.21 | prototype |
| `.topbar` | Top bar | B.1 | prototype, spec |
| `.topbar__actions` | Top bar | B.1 | prototype |
| `.topbar__inner` | Top bar | B.1 | prototype |
| `.topbar__where` | Top bar | B.1 | prototype |
| `.tpl-article` | Body classes per family | A.2 | contract |
| `.tpl-home` | Body classes per family | A.2 | contract |
| `.tpl-hub` | Body classes per family | A.2 | contract |
| `.treatment` | Prose enhancers | D.6 | contract |
| `.treatments` | Prose enhancers | D.6 | contract |
| `.trio` | Lavender trio | B.11 | prototype, spec |
| `.trio__copy` | Lavender trio | B.11 | contract |
| `.trio__item` | Lavender trio | B.11 | prototype |
| `.trio__photo` | Lavender trio | B.11 | prototype, spec |
| `.trio__text` | Lavender trio | B.11 | spec |
| `.trio__title` | Lavender trio | B.11 | prototype |
| `.vh` | Class naming | 0.2 | prototype, spec |
| `.video` | Long-form prose | B.22 | spec |
| `.video__frame` | Long-form prose | B.22 | contract |
| `.visit` | The visit block | F.8 | spec |
| `.visit__details` | The visit block | F.8 | contract |
| `.visit__map` | The visit block | F.8 | contract |
| `.visit__sub` | The visit block | F.8 | contract |
| `.visit__title` | The visit block | F.8 | contract |
| `.visit--complete` | The visit block | F.8 | contract |
| `.visit--list` | The visit block | F.8 | contract |
| `.visit--summary` | The visit block | F.8 | contract |
| `.wave-rule` | Class naming | 0.2 | prototype, spec |
| `.wave-rule--center` | Class naming | 0.2 | prototype |
| `.wave-rule--light` | Class naming | 0.2 | contract |
| `.wave-rule--navy` | Class naming | 0.2 | prototype |

### H.2 Prototype names not kept

Every prototype class, id and `data-*` that this contract does not keep, with the reason. The contract stage's
`proto-inventory.mjs` read the prototype's ids from its HTML only. The verification's `tmp/wf5a/verify/v2-proto.mjs` also
reads the ids `script.js` creates (`rg-*`, `cz{i}`, `co{i}`), adds them below, and reports none unaccounted: 252 classes,
39 ids, 13 `data-*`.

| prototype class | what it was | why it is not kept (the DESIGN-SPEC or contract reason) |
|---|---|---|
| `.ra-a1` `.ra-a2` `.ra-c1` `.ra-d1` `.ra-d2` `.ra-d3` `.ra-e1` `.ra-e2` `.ra-f1` `.ra-f2` `.ra-h1` `.ra-h2` `.ra-h3` `.ra-i1` `.ra-i2` `.ra-k1` `.ra-k2` `.ra-l1` `.ra-l2` `.ra-l3` `.ra-l4` `.ra-n1` `.ra-n2` `.ra-p1` `.ra-p2` `.ra-p3` `.ra-p4` `.ra-q1` `.ra-r1` `.ra-r2` `.ra-s1` `.ra-s2` `.ra-s3` `.ra-s4` `.ra-t1` `.ra-t2` `.ra-t3` `.ra-v1` `.ra-v2` `.ra-w1` `.ra-w2` `.ra-w3` `.ra-z1` `.ra-z2` `.ra-z3` (45) | river anchors placed by CSS rules (99 `.ra-*` rules) | U4: route data lives in the templates as data attributes (`data-ra`, `data-at`; 1.8) |
| `.article-grid` | the article grid | renamed `layout__grid` (DESIGN-SPEC 4.2) |
| `.article-wrap` | the article host | renamed `layout` (DESIGN-SPEC 4.2 `div.layout`) |
| `.ask` | a class on a model paragraph | model HTML takes no class; only the lead enhancer adds one (D.6) |
| `.callout-block` | the symptoms panel | the checklist panel `div.checklist` (D.6) or the tint panel `div.panel` (B.22) |
| `.ctarow` | the CTA row | renamed `ctaband` (DESIGN-SPEC 4.2 `section.ctaband`) |
| `.ctarow__actions` | the CTA actions | renamed `ctaband__actions` |
| `.ctarow__panel` | the CTA panel | renamed `ctaband__panel` |
| `.doctor--degler` | a person-named modifier | the mirror is `doctor__grid--flip` by position (B.10) |
| `.doctor--nelson` | a person-named modifier | the mirror is `doctor__grid--flip` by position (B.10) |
| `.drawer__scrim` | the drawer scrim | the native dialog's `::backdrop` (G2) |
| `.field__layer` | the aurora layer | renamed `aurora-field__layer` (collision with the model's form class `field`, 0.2) |
| `.field__layer--dawn` | the dawn layer | renamed `aurora-field__layer--dawn` (0.2) |
| `.field__layer--day` | the day layer | renamed `aurora-field__layer--day` (0.2) |
| `.field__layer--dusk` | the dusk layer | renamed `aurora-field__layer--dusk` (0.2) |
| `.frame--flat` | the promo frame variant | the promo is the model's own figure (B2), styled by `.promo` (B.6) |
| `.hero__bank` | the wave bank | `svg.bank` with `bank--hero` / `bank--title` and the logo double stroke (B.4, G6) |
| `.hero__poster--tall` | the phone poster | the `<picture>` source of `img.hero__poster` (1.9) |
| `.hero__poster--wide` | the wide poster with its video data | one `img.hero__poster` with a `<picture>` phone source; the sources move to `data-src-*` (1.9, U3) |
| `.inline-link` | a class on a link in the card text | model HTML takes no class; `.card__text a` (B.6) |
| `.inline-photo` | the added photo frame | a model-shaped `figure.fig` with a placement class (D.5, D.7) |
| `.media-frame` | the video frame | `figure.video > div.video__frame` (B.22) |
| `.placeholder` | the portrait placeholder | renamed `ph-portrait` (BUILD-NOTES 5.8.5, the scaffold) |
| `.placeholder__mono` | the initials | renamed `ph-portrait__mono` (drawn from `data-initials`, B.10) |
| `.placeholder__name` | the plate name | renamed `ph-portrait__name` |
| `.rz--alumier` | a seam zone placed as a CSS rectangle | B1/B5: the over copy is clipped to the occluder's own shape (`data-occluder`, 1.8) |
| `.rz--title` | a seam zone placed as a CSS rectangle | B1/B5 (1.8) |
| `.tel-link` | a class on the phone link | model HTML takes no class; `.emergency__copy a[href^="tel:"]` (B.14) |
| `.tile__name` | the brand-name cell | `ph-brand` (BUILD-NOTES 5.8.5) |
| `.wide` | `figure.wide` (DESIGN-SPEC 3.22 names it for video blocks) | a declared departure: `figure.video` with the D.5 `fig--wide` placement (B.22, gap I.48); model figures use `fig--wide` (D.5) |

| prototype id | why it is not kept |
|---|---|
| `#cataract-title` | as `degler-title` |
| `#content` | the skip target and `main` id are `main` (`chrome.skip.href`, A.3) |
| `#d-insurance` | as `d-team` |
| `#d-services` | as `d-team` |
| `#d-team` | drawer sub-menus are `dsub-{n}` (0.10) |
| `#degler-title` | sections carry no accessible name (A.3: no region landmarks) |
| `#emergency-title` | as `degler-title` |
| `#frames-title` | as `degler-title` |
| `#insurance-title` | as `degler-title` |
| `#nelson-title` | as `degler-title` |
| `#news-title` | as `degler-title` |
| `#services-title` | as `degler-title` |
| `#sub-insurance` | as `sub-team` |
| `#sub-services` | as `sub-team` |
| `#sub-team` | dropdown panels are `sub-{n}` by position (0.10) |
| `#top` | no element needs it (the skip link targets `main`) |
| `#rg-glow` `#rg-mid` `#rg-body` | created by the prototype's `script.js` in **both** river SVGs (the duplicate ids of DESIGN-SPEC U4): `ru-*` in the under SVG and `ro-*` in the over SVG (0.10, 1.8). Added by the verification |
| `#cz{i}` `#co{i}` | created by the prototype's `script.js`, per seam zone: a rectangle zone clip and a rounded-rectangle occluder clip. DESIGN-SPEC B1 / B5 remove the rectangle; one clip per zone in the occluder's own shape, `ro-clip-{n}` (1.8). Added by the verification |

| prototype `data-*` | why it is not kept |
|---|---|
| `data-rx` | the clip radius is the occluder's computed corner radii (1.8) |
| `data-video-tall` | `data-src-phone` with `data-media-phone` (1.9) |
| `data-video-wide` | the loader reads `data-src-mp4` on `div.hero__light[data-video]` (1.9) |
| `data-video-wide-webm` | `data-src-webm` (1.9) |

---

## I. Gaps and departures register

Every place where DESIGN-SPEC, the prototype, the page model, the content gates and the build brief disagree, and what this
contract does about it. "Owner" is who must act for the gap to close. Evidence for every model fact: the scripts of the
preamble, run on the models dumped 2026-10-01 17:23 and re-run on the re-dump of 2026-10-02 00:25 (byte-identical output).

### I.A DESIGN-SPEC against the content gates (A-1 requires every gate to pass)

| id | gap | evidence | this contract | owner |
|---|---|---|---|---|
| I.1 | DESIGN-SPEC 3.17, 3.18 and 8 promote the home's insurance and news headings (source h3) to h2 and the post titles (source h4) to h3 | `tools/heading-parity.mjs` (fix round 2) requires each source heading at its source level in `<main>`; its only exception is HD-1 (h1 → h2); no declaration list | headings print at the model level everywhere (B.3, B.16-B.18); the source outline has no gap (A-7 holds) | operator: to adopt the promotion, heading-parity first needs a declared-exception list |
| I.2 | DESIGN-SPEC 3.10 / Q-7 prints placeholder initials as text | `tools/words-added.mjs` reads every visible text node of `<body>` (aria-hidden included) and has no declaration list; "kn" and "ml" are in no vocabulary of `/`, `/our-eye-doctors/`, `/team/dr-kristin-nelson-od/`, `/team/maivys-longa/` (checked this session): 5 findings | the initials are drawn by CSS from `data-initials` (B.10); visually identical; Q-7 is the declaration | operator: to print them as text, words-added first needs declared additions |
| I.6 | DESIGN-SPEC Q-6 supersedes the home hero's phone photo (`s1.background[1]`, 1190x496) | keep-image-parity counts it present only through the scaffold's `<source>` | not rendered (B.4) | pipeline: declare the drop in `audit/clone-removals.json`, or A-1 fails; **closed in wf5b**: declared `background-dropped`, marked `superseded` (BUILD-NOTES 11) |
| I.51 | `tools/keep-image-parity.mjs` (alt fidelity) exits 1 on any `<img>` in `<main>` whose file the source page does not show as an `<img>` ("unmatched"); 0.8 had said such an image passes (found by the wf5b pipeline) | the gate's exit line includes `alts.res.unmatched`; once rendered, every `art` image is unmatched (except TB-contact on `/hours-location/`, whose source shows that photo: its arch blank is declared), and so are the posters `{up}theme/media/hero-river-poster*.webp` in the hero and title band and a model `background` photo printed as an `<img>` outside `figure.section__bg` (the hero frame, the hub arch) | 0.8 corrected; the build declares every art image per page in `audit/clone-removals.json` `images.added` (page, slot, id, file, alt, ai; a stand-in names what it `replaces`). The gate must accept exactly those, the theme posters and model `background` images, and keep failing every other unmatched image (positive control: a planted undeclared image) | the gate (`tools/keep-image-parity.mjs`), before the templates' first full gate run; **closed by the templates stage** (a declared deviation from that stage's file list): the gate accepts a declared `images.added` row of this page and file with its declared alt (144 on the 148 pages), a `theme/media/hero-river-poster(-phone).webp` still with alt `""` (148) and a KEEP file that `audit/image-classification.json` shows on this page while no source `<img>` carries it, with alt `""` (8: the home hero crop, the Alumier banner, 6 hub header photos); 0 unmatched. Two controls fire: an undeclared image planted in `<main>`, and a declared addition planted on a page that does not declare it, both stay unmatched. On the scaffold `dist/` the gate prints its earlier numbers unchanged (242 / 231 / 11 / 10 / 0 / 0) |
| I.41 | DESIGN-SPEC 3.2 names the dropdown and drawer toggles "<label> submenu" in visually hidden text (found by the verification) | `tools/words-added.mjs` reads every text node of `<body>`, visually hidden ones included; "submenu" occurs in 0 of the 148 raw pages, in `chrome.json` and in `client-facts.json` (grep, 2026-10-02), and the scaffold never prints it, so the first build would report it on every page | `aria-label="{label} submenu"` on both toggles, no text node (B.2, 0.9); same accessible name; no visible label exists, so WCAG 2.5.3 holds | none |

### I.B DESIGN-SPEC against the page model (fields the contract needs)

| id | gap | evidence | this contract | owner |
|---|---|---|---|---|
| I.3 | P1 `srcset` is absent; the hero's 4:3 crop has no field | 0 of 149 models carry `srcset` | `srcset`/`sizes` omitted until P1; the crop as `image.crop {url, w, h, srcset}` (B.4) | pipeline (P1); **closed in wf5b**: P1 `srcset` on every image object and `image.crop` on the home hero (BUILD-NOTES 11) |
| I.4 | P4 `model.art` is absent | 0 of 149 models carry `art` | arch only from the model's own images (9 team pages, 6 hubs); 133 band models have no arch and no I-1 protrusion until P4; no added illustration, no hub stand-in thumbs | pipeline (P4); **closed in wf5b**: P4 `model.art` on all 149 models, `art.title` on the 133 band models (BUILD-NOTES 11) |
| I.5 | P3: the logos are still WebP encodes | `chrome.logo.url` `…logo-01.4165c4262e.webp` (300x121), `chrome.mobile.logo.url` `…logo.60e743c951.webp` (988x400) | markup unchanged; the files change | pipeline (P3); **closed in wf5b**: P3: both logos ship byte-identical (PNG) (BUILD-NOTES 11) |
| I.7 | Two team pages carry no image of their person | `/team/dr-brittany-degler-od/` and `/team/jhonae-anglin/`: no `team` block, `images: []`, `placeholders: []` | `art.title` when P4 gives it (Degler's own portrait; Jhonae's plate as `{ placeholder }`), else no arch (B.21) | pipeline (P4); operator for Jhonae (IMAGE-PLAN 6 notes her page shows no portrait at source); the pipeline part **closed in wf5b** (`art.title`: Degler's own portrait, Jhonae's plate; BUILD-NOTES 5.10) |
| I.8 | DESIGN-SPEC 3.30 shows the aside on the 404 | the `404.json` model has `aside: null` (and `breadcrumbs: null`) | `dist/404.html` renders without an aside (one-column grid) | pipeline, if the aside is wanted there |
| I.11 | The home's generated images (H1 glasses, H2 lens, H3 kids' glasses) have no model field | DESIGN-SPEC 4.3 P4 names only `art.title` and `art.inline[]`; BUILD-NOTES 5: render from the model alone | `art.home` keyed by the `image-plan.json` role (0.12); until it exists the glasses, the lens and the kids' glasses are omitted (protrusions 1, 9, 11 wait) | pipeline (P4 extension); **closed in wf5b**: `art.home` H1, H2, H3 (BUILD-NOTES 11) |
| I.12 | The fingerprinted script has no model field | P2 updates `head.stylesheets`; nothing names the script | `head.scripts[0]`, else `{up}theme/site.js` (A.1) | pipeline (P2 extension); **closed in wf5b**: `head.scripts` (BUILD-NOTES 11) |
| I.15 | TB-contact (the real practice-interior photo, 7 pages) is an IMAGE-PLAN 4 default but not an `image-plan.json` image | `image-plan.json` `notPlannedHere.realImages` | expected in `art.title` (C.2) | pipeline (P4); **closed in wf5b**: `art.title` TB-contact on its 7 pages (BUILD-NOTES 11) |
| I.24 | No model field carries a form notice | `chrome.json` `notice` is null; the page model's `chrome` has no `notice` key (OPEN-DECISIONS Q8 open) | no notice; a dormant hook (`p.form__notice`, E.4, 1.10) | operator (Q8), then pipeline |
| I.26 | Closed: BUILD-NOTES 5 changed after this contract's first read (its fix-round-2 update, 2026-10-02 00:18): 5.1 now documents the `structured-data` kind of `declared` and the carried BlogPosting node of `jsonLd`; 5.8.8 says child-page thumbnails keep their source alt (R2-1); 5.9 gives `metaDescription.source` derived 5 / none 9 | the change re-read by diff against the first read; every 5.9 row recomputed from the 149 models and equal (`node tmp/wf5a/contract/bn59.mjs`) | applied: thumbnail `alt` as given (F.2); `head.jsonLdHtml` verbatim, BlogPosting included (A.1); the description metas only when not null (A.1, 140 of 149); the 404 deploy base (0.1, A.1); size caps keep the 100% cap (D.5, R2-X) | none |
| I.27 | `callout.title.demotedFrom` (BUILD-NOTES 5.3) appears in no model; `chrome.mobile.menuOpen` is never printed; the `hours` block type and `video` `kind: 'iframe'` do not occur | schema walk | handled when they appear (B.31, B.22); not relied on | none |

### I.C DESIGN-SPEC or the prototype against this contract (departures, each with its reason)

| id | departure | reason |
|---|---|---|
| I.10 | The arch frame is static; its image sinks at 0.92 (DESIGN-SPEC 2.9 / 3.21: the frame moves at 1.06) | the arch is the weave occluder; the over copy's clip is computed once per river build, so a moving occluder separates from its clip and re-creates the B1 seam (0.5) |
| I.13 | The over SVG at z 4 in `#page`; `pl-raise` containers at 3 (DESIGN-SPEC 2.9: over copy 3, breakouts 4) | 2.9's numbers only work inside per-container stacking contexts; a crossing protrusion must paint above a later container and below the over copy (0.5) |
| I.16 | An inline one-line script sets `html.js` (DESIGN-SPEC 8: "the script adds `js` first thing") | the deferred script runs after first paint; the no-JS to JS nav switch would shift the layout (A-11) |
| I.17 | `data-ra` split into `data-ra` (key) and `data-at` (coordinates); `C+n` written `CL+n` / `CR+n`; bottom-relative `y` (`100%-148px`) | weave zones name anchors by key; the container edge must be named; the prototype's tuned anchors need bottom-relative values (1.8) |
| I.18 | Prose rules scoped to classless elements (`a:not([class])`, `ul:not([class]) > li`), and DESIGN-SPEC 3.22's measure selector scoped the same way (classless elements plus the named model and enhancer classes) | components inside the article flow must never take prose styles or the 68ch measure (D.1) |
| I.19 | The wave rule is a heading `::after` (the prototype printed an empty `span.wave-rule`) | DESIGN-SPEC 3.3 says so; recorded because the prototype differs |
| I.20 | Prototype names not kept | H.2 lists each with the DESIGN-SPEC reason |
| I.21 | The aside sits inside `main` (DESIGN-SPEC 4.2, followed) | axe best practice `landmark-complementary-is-top-level` will flag it; not a WCAG failure; no gate is affected |
| I.22 | The Degler team page's CTA band (a bare `cta`) has no heading and no text | the model's last block has neither; nothing may be authored (B.24) |
| I.23 | The drawer's close button is named `chrome.mobile.menuClose` ("Close Menu"; the prototype reused "Toggle mobile menu"); the drawer logo is `alt=""` | a source string that names the action; the dialog is named "Menu" and the header logo stays the home link |
| I.25 | `visit.subs` print as `h2.visit__sub` (the scaffold printed `p`) | the location page's sub-headings read as headings; the source's `div.heading-h3` are not heading elements, so heading-parity is unaffected |
| I.28 | `aria-current="page"` only on the current link; `inSection` as `li.is-section` (the prototype put `aria-current` on the parent too) | the model separates `current` and `inSection`; a parent is not the current page |
| I.29 | Review `datetime` = `reviewedAt` with the space replaced by `T` (DESIGN-SPEC 3.15 prints the value as is) | the scaffold's form, the normalised local date-time; the visible text is unchanged |
| I.30 | Lead figures: 43 models open with a figure (17 posts, 24 interiors, 2 templates) where DESIGN-SPEC 3.21 says 35 (17 + 18) | counted here as "the first node of the first section, which has no heading, is a figure or a `fig-grid`"; the rule (never moved into the arch) does not depend on the count |
| I.31 | DESIGN-SPEC 3.22's treatment-card trigger is read per block (D.6): 18 runs; a whole-page reading gives 19 (the glaucoma page) | a wrapper must not span blocks; the glaucoma items are tint panels by the callout rule anyway |
| I.32 | The aurora layer `div.field` (DESIGN-SPEC 2.8 A1, 4.2; prototype) is renamed `div.aurora-field` | the model's form markup uses the class `field` on every form field (14 elements); one class cannot serve both (0.2) |
| I.42 | Reveal stagger 40 ms capped at 2 steps (DESIGN-SPEC 2.10 / 6.1: 70 ms capped at 3) (found by the verification) | with the 480 ms entrance, 70 ms x 3 keeps an element below opacity 1 in view for up to 690 ms; A-12 fails anything above 600 ms. 40 ms x 2 ends every entrance within 560 ms (1.3 step 5) |
| I.45 | Horizontal overflow is clipped on `div#page` (`overflow-x: clip`), not on `body` as in the prototype (found by the verification) | river anchors resolve at -7% to 104% of their hosts and protrusions cross edges, so something must clip for A-2. `clip` on `#page` neither propagates to the viewport nor creates a scroll container, so sticky descendants keep working (A.3) |
| I.48 | Video blocks print `figure.video > div.video__frame > video` (DESIGN-SPEC 3.22: `figure.wide > video`) (found by the verification) | one name for the wide placement (`fig--wide`, D.5) instead of two; the frame div carries the 16:9 box, radius and CSS poster independently of the native `video` box (B.22) |

### I.D The build brief (`tmp/wf5b-build.js`) against DESIGN-SPEC

| id | brief says | DESIGN-SPEC says | this contract |
|---|---|---|---|
| I.14a | "header states WITHOUT runtime measurement of chrome heights" | D1: no measured value may size the thing measured; measured values may feed `scroll-padding-top` and sticky offsets | `--topbar-h` / `--navbar-h` measured for the sticky offset and scroll padding only (1.1) |
| I.14b | the carousel "pause on hover/focus … gate auto-advance on intersectionRatio" | 3.15: no autoplay (as at source) | no auto-advance, so nothing to pause (1.6) |
| I.14c | reveals: "fail-safe only when the observer never delivered" | 6.1: no fail-safe timer | the observer health check of 1.3 step 8, which never fires while the observer works |
| I.14d | "the sticky hours card" listed among script behaviours | G1: a CSS media query | CSS only (1.11) |
| I.14e | "inert forms (data-needs-backend notice)" | 3.25: `data-needs-backend` stays; no notice is decided (Q8) | the dormant notice hook (E.4) |
| I.14f | fonts: "whatever display face the spec names" | 2.2: two faces only (Atkinson Hyperlegible Next, RFEC Figures); the wordmark is never set in type | no display face |
| I.14g | hero video: "no autoplay attribute, preload none, src set after window load" (found by the script stage; 1.9 said `preload="auto"`, registered nowhere) | 7: created after `load`, never `autoplay`; silent on `preload` | `preload="none"` (1.9): `play()` starts the download anyway, and a refused `play()` fetches nothing; sources are appended after `load` |

### I.E Contract decisions where DESIGN-SPEC is silent

| id | decision | where |
|---|---|---|
| I.9 | A hero-video pause / play toggle, created by site.js with the video (WCAG 2.2.2: moving content that starts automatically and lasts more than 5 s needs a pause; DESIGN-SPEC has none); two authored non-visible labels; out of flow at the frame's top-right corner (I.44) | 1.9, 0.9 |
| I.33 | The arch resolution when the model has no image (no arch until P4) and the hub header photo moved, not duplicated | B.21, C.7 |
| I.34 | The figure placement classes as a total function of role and width (the spec's table covers photo widths and the under-500 rule only) | D.5 |
| I.35 | `sizes` formulas per slot from the spec's cover-factor rule | B, D.5 |
| I.36 | The map card's href is `map.src` without `&output=embed` | B.23 |
| I.37 | A `team` block whose members are all "Our Doctors" renders as doctor blocks | B.27 |
| I.38 | Hub band variants by section kind (`band--intro`, `--photo`, `--sky`, `--lav`, `--plain`) and the hub route on the left bank (the right bank until the integrate stage, I.73) | C.7 |
| I.39 | Card-level model HTML uses `rich--compact` (product texts carry h2-h4) | D.1, F.7 |
| I.40 | Standalone links get a 44 px hit area | B.0 |
| I.43 | River geometry: anchor hosts and container edges are read as layout boxes (`offset*`), occluders as client rects; anchors and zones are direct children of their host after its band layers; the host is `anchor.parentElement`; the occluder is `zone.parentElement.querySelector(sel)` (found by the verification: the CTA band hosts anchor `q1` and is `.rv`, so a client-rect reading would leave the river 26 px off for the life of the page; and 1.8 had said "first children" where the band layers come first) | 1.8, A.3 |
| I.44 | The hero toggle is appended to `figure.hero__frame`, out of flow (found by the verification: in the flow of `div.hero__copy` it would push the phone frame and the intro h1 down about 56 px when the video starts, after `load`, failing A-11 at 390x844 and the CLS budget) | 1.9, B.4 |
| I.46 | The A-9 target rule: what counts as an inline text link (the block holds other, non-`aria-hidden` text), stretched links measured by their card, radios and checkboxes by their row; 44 px added for `.topbar__where a`, `.section-title a`, `.trio__title a`, `p.callout-title a` and hub callout title links; the D.6 link-line marker for the 9 model `p` / `li` whose whole text is one link (found by the verification: the usability judge's probe measured the prototype's address link at 375x38 and its location contact links at 20 px; the contract's own B.0 rule required 44 px for every link outside running text but gave no means for model link-only paragraphs) | B.0, D.1, D.6, D.7 |
| I.47 | Media zoom only from an interactive ancestor (`[data-tilt]`, `.trio__item`, the promo), with the `scale` property; never on the arch, doctor photos, designer tiles or the unlinked callout (found by the verification: B.8's generic "`.frame` zooms on hover" gave non-focusable frames a hover effect with no focus twin, against DESIGN-SPEC D5 and A-16, and on the arch it would fight site.js's parallax `transform`) | B.8 |
| I.49 | Classless rules for A-23's injected CMS block (labels, text controls, radios, checkboxes, buttons, fieldsets, forms, a bare table, `caption`, `th[scope=row]`, a classless figure) and its injection point, the end of `div.prose.rich` (found by the verification: D and E styled only the model's own markup, so the judge's classless controls, which measured 13x13 to 177x21 on the prototype, would stay unstyled and A-23 could not pass) | D.8 |

### I.F DESIGN-SPEC Appendix A: every check that concerns markup, and the clause that makes it satisfiable

| check | what the markup must give | where this contract gives it |
|---|---|---|
| A-1 content gates | every visible string from the model or chrome; no authored text node, visible or visually hidden; headings at source levels; alts as given; the hours colon; `form.html` verbatim | 0.9, B.2 (I.41), B.3 (I.1), B.10 (I.2), 0.8, B.23, E.1; I.51 closed by the templates stage (the gate accepts exactly the declared additions); I.6 closed in wf5b |
| A-2 overflow, A-4 reflow | no fixed-width text containers; long words wrap; tables and `pre` scroll in their own region; one column at p; deliberate crossings (river anchors at -7% to 104%, protrusions) clipped by `#page` | D.1, D.3, D.4, D.8 (bare tables), B.22 (full-bleed card), A.3 (`#page { overflow-x: clip }`, I.45), every B.x "Responsive" |
| A-3 console and network | no third-party script; iframes only on their own pages and lazy; no runtime fetch | A.1, B.31 (`visit`), D.3/D.5 (embeds), 1.12; open: I.50 (the two live maps are in or next to the first screen, so `loading="lazy"` still loads them at page load; DESIGN-SPEC 7 already exempts them from the weight budget, and the A-3 probe needs the same exemption or the operator a click-to-load map) |
| A-5 contrast | text on a surface, never on a pool, a photo or the river | 0.2 surfaces, C.7 (`band--photo` panel), B.15 (review panel `surface--image`) |
| A-6 keyboard | 44x44 toggles with `aria-expanded`/`aria-controls`; a native `dialog`; a focusable carousel track and dot buttons; native `details` | B.2, 1.5, B.15, 1.6, B.26 |
| A-7 landmarks and headings | one h1; `main`, `aside`, labelled navs; a gap-free home outline | A.3, B.16, B.3 |
| A-8 duplicate ids | fixed ids only, indexed by position | 0.10 |
| A-9 targets | a probe-ready definition of "inline text link"; stretched links and radio rows measured by their card or row; 44 px for every other control and standalone link, model link-only paragraphs included | B.0 target rule (I.46), D.6 link line, B.2, B.15, B.19, B.20, B.23 |
| A-10 first screen, A-12 hidden while visible | no first-screen element gated; no protrusion inside `.rv`; the decision on painted rects after fonts; every entrance done within 560 ms of entering view | 1.3 (stagger 40 ms x 2, I.42), B.4, B.5, B.21, every B.x "Reveal" |
| A-11 stability | no measured value sizes anything; static `--chrome-h`; the hero toggle is out of flow; the only flow changes script makes (the carousel dots and the track height) are inside the home reviews section, far below every first screen | 1.1 (D1 guard), 1.6 (track height from the slide only), 1.9 (the hero toggle out of flow, I.44) |
| A-13 river | anchors and zones as data; occluders are frames or plates and never move; geometry from layout boxes, so no reveal offset reaches the river; unique gradient ids; a phone crossing within two screens | 1.8 (I.43), 0.5, B.4 (hero zone), B.7, B.21; I.4 closed in wf5b (`art.title` on all 133 band models) |
| A-14 protrusions | `data-protrude` / `data-cross` on every protruding box; reservations from the crossing token plus the parallax budget | 1.2, every "No-occlusion" item; I.11 closed in wf5b (`art.home` H1, H2, H3) |
| A-15 shadow order | the plane classes and the elevation tokens | 0.5, 0.6 |
| A-16 hover and focus parity | tilt only on cards with a focusable stretched link; every hover with a `:focus-visible` / `:focus-within` twin; no zoom on a frame without a focusable ancestor | B.8 (I.47), B.6, B.11, every "Hover/focus" item |
| A-17 logo | the P3 files through `chrome.logo.url` / `chrome.mobile.logo.url`; no filter | B.2; I.5 closed in wf5b (byte-identical PNGs) |
| A-18 digits | RFEC Figures first in `--font` | D.4 |
| A-19 measure and phone column | the measure rule on direct prose children; the full-bleed phone card; no centred paragraph | D.1, B.22, B.5, B.17 |
| A-20 shortcodes and fabrication | excerpts from the model; generated images only through `model.art` with the plan's alt | B.18, 0.8, D.7 |
| A-21 budgets | one stylesheet, one script; lazy images; `srcset`/`sizes`; the video on the home only, after `load`; the still in title bands | A.1, 0.8, B.4, B.21, 1.9; I.3 closed in wf5b (`srcset` on every image object; the budget is measured on the rendered pages) |
| A-22 idle and jank | no infinite animation; one scroll listener; opaque cards (at most 6 blurred surfaces in a viewport) | 1.4, 1.12, B.18, F.1 |
| A-23 injected CMS page | a rule for every allowed prose element and form control, including the classless controls, bare table, `caption`, `th[scope=row]` and classless figure of the injected block; the injection point inside `div.prose.rich` | D.2, D.3, D.8 (I.49), E.2, E.3 |

### I.G DESIGN-SPEC against itself (found by the verification)

| id | conflict | evidence | this contract | owner |
|---|---|---|---|---|
| I.50 | A-3 asks for 0 third-party requests on load on every page, while Q-11 and section 7 keep live, lazy Google Maps iframes on `/hours-location/` and `/location/riverside-family-eyecare/` | `loading="lazy"` defers an iframe only while it is far from the viewport, and both maps sit in or just below the first screen: on `/hours-location/` the map is the first part of the visit block (`order`: map, title, address, contacts, hours); on the location page the visit block is the only content (contacts, address, map, hours). DESIGN-SPEC 7's interior-weight row already excludes "the two pages' lazy map iframes", so the spec expects them to load. The YouTube iframe on `/eye-care-services/eye-emergencies-pink-red-eyes/` follows about 2,700 characters of prose (whether it loads at once depends on the browser's lazy distance; not measured here) | keeps Q-11's default (F.8, B.31 `visit`): live lazy maps on those two pages only, the static map card everywhere else | QA: read A-3 with section 7's exemption for these sanctioned iframes on their own pages; operator, if no third-party request may happen before a click: a click-to-load map (its label would be new copy to declare) |

### I.H Found while building and testing site.js (the script stage, 2026-10-02)

Evidence: `tmp/wf5b/scripts/` (fixtures from this file's markup, `run-tests.mjs` in one headless Chrome with real
scrollbars, results under `results/` and the planted-defect controls under `control-results/`).

| id | finding | evidence | this contract | owner |
|---|---|---|---|---|
| I.52 | Step 3 of 1.3 as first written gated an element that ended just above the viewport; the 26 px hidden offset then painted its lower slice inside the viewport at opacity 0 | reload at a restored mid-page scroll, 1440x900: the decision ran at 64 ms with `scrollY` already 5043; three `trio__text` blocks ended 4 px above the viewport and slid 22 px into it while hidden (2 first-screen elements below opacity 1); with the second look: 8 exempt, 0 below opacity 1; the original rule planted back fails the test | the second look of 1.3 step 3 | none |
| I.53 | 1.3 step 8 would fail open in every page opened in a background tab (no frames, so no observer delivery) | stubbed hidden document: working observer, still gated after 2.5 s hidden, normal after visible; broken observer, fails open 1 s after visible | the 1000 ms count while the document is visible (1.3 step 8) | none |
| I.54 | `offsetHeight` rounds; a top bar of 53.39 px gives 53, and the sticky offset `-53px` leaves 0.39 px of the navy bar showing above the stuck navbar | a forced 53.4 px bar at 390x844: with the rounded-up rect height (54 px) the bar's bottom sits at -0.61 px; D1 is unaffected (the values feed only the sticky offset and scroll padding) | rounded-up `getBoundingClientRect().height` (1.1) | none |
| I.55 | A `play()` the browser refuses (`NotAllowedError`) would leave a toggle whose "Pause" names a state that never existed | stubbed refusal: no video, no toggle, `is-paused` unset, the poster shows | refusal removes the video and the toggle; no `figure.hero__frame` means no video (1.9) | none |
| I.56 | DESIGN-SPEC 2.5's arch `999px 999px var(--r-xl) var(--r-xl)` does not render 38 px lower corners: CSS scales **all** radii by `width / 1998` when the top pair overflows the width | hit test on a 300x375 box: the point 4 px inside the lower-left corner is painted (the corner is about 5.7 px, `38 * 300 / 1998`); with `150px 150px 38px 38px` it is not. The river's over-copy clip applies the same scaling to the computed radii, so the weave stays seamless either way | markup unchanged; for the intended 38 px lower corners on the 4:5 frames, e.g. `50% 50% var(--r-xl) var(--r-xl) / 40% 40% var(--r-xl) var(--r-xl)` (B.13 lens, B.21 arch) | styles (DESIGN-SPEC 2.5 value); **closed by the styles stage**: `--r-arch` is that value (on a 4:5 box 40 % of the height is 50 % of the width, so the top stays a semicircle); the same hit test at 4 px inside the lower-left corner misses the arch (340x425) and the lens (410x513), and the old value planted back hits both |
| I.57 | B.16 and G.1 said "38 anchors"; the B.16 route table lists 37 (h1-h3, i1-i2, s1-s4, a1-a2, c1, d1-d3, n1-n2, l1-l4, f1-f2, k1-k2, e1-e2, r1-r2, v1-v2, w1-w3, z1-z3), as the prototype and DESIGN-SPEC U4 have | counted from the table; the river build reports 36 anchors at d and t, 37 at p | corrected to 37 | none |

### I.I Found while building and testing the styles (the styles stage, 2026-10-02)

Evidence: `tmp/wf5b/styles/` (a 17-page gallery from the real models in this file's markup, every one of the 407 H.1 classes
present; `gallery-check.mjs` at 360, 390, 768, 1024, 1440 and 1920 and, with a real 15 px scrollbar, 1280x585 and
1200x800; `contrast.mjs`, `static-check.mjs`; each with planted-defect controls that fire).

| id | finding | evidence | this contract | owner |
|---|---|---|---|---|
| I.58 | With band pseudo-layers at 0, the `--p` overlay (`::after`, after `svg.bank` in tree order) paints over the bank strokes; and a `bank--up` filled by the svg's own path in one flat colour shows a seam wherever the band beneath is a gradient or carries the overlay (the footer's aurora is `--glow-sky` at its top edge, not `--navy-950`) | tree order at equal z; the footer's `.aurora-deep` pools at its top edge | band pseudo-layers at -1; `bank--up` bands draw the fill with their own layers through the mirrored bank mask; the footer's aurora on `::before` (0.5) | none |
| I.59 | "Comprehensive" at the bare `--display` overflows its column from about 1500 px | measured 569 px in a 542 px column at 1920 (6.355 em at weight 340), into the glasses' box | the statement is capped by its column (B.4) | none |
| I.60 | In s the glasses' corner placement reaches the intro card's h1 (`--hero-gap` 0) | box clearance at 1280x585 | the spec's own fallback (left edge, 55-70 %) is the s rule (B.4); measured: h1 bottom 564.6 px, 17 px from the statement | none |
| I.61 | The lens crossing depended on the text card's height | -10 px at 1440 with the real copy | `align-self: end` (B.13): 72 px at 1024, 101 at 1440, 110 at 1920, 40 at 390 | none |
| I.62 | The handshake photo's 26 px parallax reached the last copy line at p | 2 px left of a 28 px gap at 360 and 390 | 40 px at p (B.14) | none |
| I.63 | D.3's `h2[id] { scroll-margin-top }` doubled the html scroll padding and is not in the D1 guard's list | 1.1 vs D.3 | no scroll-margin (D.3) | none |
| I.64 | The 91-character h1 ran 6 lines at 390 | `h1--xlong` caps never bite under the 2rem floor | 1.75rem at p and a tighter phone band (B.21) | none |
| I.65 | A protrusion's reserve can lose to a container's flow rhythm (`.band__inner > * + *`, `.prose > * + *`) at equal specificity | hub thumbnails over the brand cards' titles at 1024 | the reserves of `.childlist--thumbs` and `.team-grid` are written to outrank the rhythm of `.prose`, `.rich` and `.band__inner` | none |
| I.66 | Short standalone links ("Home" in the crumbs, 39x44; "FAQ" in the sitemap, 31x44) met 44 px in height only | the A-9 rule of B.0 on the gallery | `min-width: 44px` on every B.0 standalone link | none |

### I.J Found while building the templates (the templates stage, 2026-10-02)

Evidence: `tmp/wf5b/templates/` (`verify-markup.mjs`: every model rendered and its built page checked against the rules of
this file, with 10 planted-defect controls; `probe.mjs`: one headless Chrome with real scrollbars, 26 pages at 360x740,
390x844, 768x1024, 1024x768, 1280x585, 1440x900 and 1920x1080, with an under-sized image and an overflow box as controls).

| id | finding | evidence | this contract | owner |
|---|---|---|---|---|
| I.67 | Several slot `sizes` of B and D.5 did not describe the rendered width: the hero frame (`41vw` at d, 787 px at 1920 for a 589 px frame), the designer tiles (`250px` for 315 px), the lens and the handshake (`360px` / `380px` for 410 px), the staff photo (`440px` for 500 px), insets (`300px` for 322-329 px), the child-page thumbs (`calc(50vw - 64px)` from 769 px for a 2-column grid from 600 px and 3 columns from 1024 px), grid figures (`740 / columns` at 1024), the glasses in the short-desktop mode, the home doctor photo at 768 (530 for 302 px), and the band backgrounds (`100vw` for a 2,133-3,989 px cover) | the probe resolves each multi-candidate `sizes` the way the browser does and compares it with the layout box (cover-aware: `max(box width, box height x the file's aspect)`); first run: 38 under (< 0.95x) and 29 over (> 1.3x); after the corrections: 0 under, 0 over (the glasses at 360: 1.15x, an upper bound); a discriminating `currentSrc` test shows Chrome honours `min()`, nested `calc()` and compound media conditions inside `sizes` | B.4, B.6, B.7, B.9, B.10, B.12-B.15, C.7, D.5 and F.2 carry the measured values | none |
| I.68 | A `srcset` in a natural-width slot changes the layout: where the CSS sets `width: auto` (logo walls, logo-grid chips, products, devices, hub brand cards) the chosen candidate's density sets the natural width, so F.7's `(min-width: 1024px) 220px, 40vw` would draw a 300 px packshot at 156 px on a 390 px phone | HTML density-corrected natural size; the probe's density check: in every natural-width slot that loaded, `naturalWidth` equals the file width (0 mismatches) | these slots print `sizes="{w}px"` (density 1, the size the styles were tested with); 0.8, B.31, C.7, F.7 | none |
| I.69 | D.5's placement counts (60 figures outside grids) include the three home figures that B.6, B.14 and B.15 move into components "untouched" | rendered: `fig--column` 20, `fig--wide` 17, `fig--chip` 5, `fig--inset` 14, `fig--inset-start` 1 = 57; the promo (`fig--brand`) and the two 800 px home photos keep their model classes only | no placement class on the three moved home figures; D.7.3 still adds their `srcset`/`sizes` | none |
| I.70 | B.10 does not say how `doctor-photo-{n}` numbers the two home doctor blocks | - | `doctor-photo-1` (s8), `doctor-photo-2` (s9): unique on the page; in a hub section `{n}` counts the members (B.27) | none |
| I.71 | F.1 gives the hub brand card a reveal on the card ("`card`"); C.7's written-out markup had no `rv` | F.1 vs C.7 | `li.card.card--brand ... rv` (C.7 corrected; the card holds no protrusion, D3) | none |
| I.72 | With the scaffold templates replaced, `RFEC_THEME=scaffold` (BUILD-NOTES 1, P2) renders the Riverlight markup with `styles/scaffold.css`, and its `{up}theme/` fonts, posters and hero loop are not shipped in that mode | `src/build.mjs` ships `theme/**` only in the design-theme mode | the templates print the theme assets unconditionally (A.1, B.4, B.21); the scaffold mode is superseded for anything but the pipeline's own regression comparisons, whose page markup differs from now on | operator / integrate: retire or re-scope the switch; **closed by the integrate stage (I.K)**: retired. `RFEC_THEME=scaffold` stops the build with a message, and a theme root without `riverlight.css` fails closed in the P2 layer check (`tmp/wf5b/integrate/08-scaffold-retired.log`, `08-empty-theme.log`); `src/styles/scaffold.css` stays on disk as the port's record and never ships |

### I.K Found while integrating (the integrate stage, 2026-10-02)

Evidence: `tmp/wf5b/integrate/` (the built `dist/`, served on 8835; `probe.mjs` in one headless Chrome, with real 15 px
scrollbars at 1024 px and up and hidden ones at 768 and below, each check with a planted control; `a12.mjs`;
`hero/hue.mjs` and `hero/hero-shots.mjs`; `interact.mjs`; `header-focus.mjs`; `contrast-dist.mjs`; logs numbered in run
order). None of these could show in the stage checks, which ran on fixtures and a gallery: only the built pages put the
river's routes, the hub bands, the real models and the sticky chrome together.

| id | finding | evidence | this contract | owner |
|---|---|---|---|---|
| I.73 | The hub route of C.7 (the article's `t3` at 40%, then `b{n}` on the right bank) crossed the first hub band diagonally and folded the river back into a hairpin: through the visit block's title and address on `/hours-location/` at every width, and through the first band's text of the `/template/*` pages; at p the 103.5% bank ran about 30 px from every unshielded hub line that reaches the gutter | river-text probe (the under copy's `body` strand within 40 px of an unshielded text line, A-13): before, `/hours-location/` 1-4 lines at all 7 sweep sizes (minimum distance 0 px) and 2-3 lines on 3 `/template/*` pages at 1024 and 1280; the hairpin is in the 1440 screenshots of `/our-eye-doctors/` and `/insurance/`. After: 0 in the 63 runs of the home and 8 hub and template pages at the 7 sizes (`10-hubs2-*`), in 48 runs of 16 more pages (every other hub and template among them) at 1280x585, 1440x900 and 390x844 (`46-more-*`), and on the final build (`50-layout-*`) | `b{n}` on the left bank (`d:L,50% p:-7%,50%`); on hubs `t3` leaves along the band's bottom edge (`d:-4%,112% p:-4%,108%`, B.21 note) and the footer horizon enters at the left edge (`z1` `d:-4%,46px p:-4%,46px`, `z2` `d:50%,40px p:50%,38px`, `z3` `d:104%,36px p:104%,34px`); C.7 | none |
| I.74 | The home insurance anchors (`v1` `d:4%`, `v2` `d:2%`) ran the river's centre line 4 px from the insurance title at 1280x585, where the container is full width (content edge 48 px; 4% is 51 px) | river-text probe: 4 and 20 px at 1280x585, the home's only finding at the 7 sizes; `CL-48` still left 37 px (the spline's approach from `r2`), and `CL-64` 41 px once the band's reveal had lifted the title 26 px | `v1` `d:CL-80,22%`, `v2` `d:CL-80,92%` (B.16): 44 px at 1280x585 after the reveal, 51 at 1440, 57 at 1024, 79 at 1920; 0 findings at the 7 sizes on the final build (`50-layout-*`) | none |
| I.75 | On `/hours-location/` the hub band prints the visit block outside any `.rich`, so its map iframe kept the browser's 300x150: F.8's 4:3 and radius rules were written `.rich .embed--map` | screenshots at 1440 and 390 | CSS `:is(.rich, .visit) .embed…`; markup unchanged (F.8) | none |
| I.76 | The hero light (`assets/media/hero-river.*`, accepted with mean saturation 0.094 under IMAGE-PLAN's 0.2 floor) renders cerulean, not the logo's teal | `hero/hue.mjs` on the rendered light with every layer above it hidden (`hero/hero-shots.mjs`): the poster and 4 seeked frames at 1280x585 and 390x844; ribbon pixels (HSV saturation 0.12 or more, value 0.98 or less) in the logo-teal hue band 164-188 (`#13a89e`, `#03756d` and `#95d8d3` are all 176): **before 0-0.5 %** (94-100 % in 190-217); the logo itself is 12.8 % teal, 86.3 % navy | `--light-grade: hue-rotate(-32deg) saturate(1.8)` on `.hero__light :is(img, video)` (B.4): **after 70-97 % at 1280x585 and 79-99 % at 390x844** (poster 89 %), other hues 0-2.8 %. A static colour matrix: no blend mode, never animated (DESIGN-SPEC 2.8, 7). **Departure** from A3's "the grade is baked into the clip": the clip ships as accepted, and a uniform matrix cannot also turn the ribbon's dark core navy | operator: a baked gradient map (teal light over a navy core) needs a re-encode through `tools/make-loop.mjs`, its calmness numbers and the `audit/generated-media.json` record |
| I.77 | 1.2's `data-cross` rule ("the protrusion's own `section` first") resolved the second and third doctor photos of the `/our-eye-doctors/` team section to the FIRST doctor's plate (the three share one section) | the probe's crossings for `doctor-photo-2`: -157 to -242 px | the nearest ancestor that holds a match (1.2); the same element for every other protrusion | none |
| I.78 | Child-page thumbnails (F.2) and team portraits (B.27) were offset `-48px` / `-32px` from the card's padding box, so they crossed its visible (border) edge by 47 / 31 px against D4's 48 / 32 | probe crossings on `/contact-lenses/` (7 thumbs) and `/the-staff/` (8 portraits): 47 at 1024-1920, 31 at 360-768 | `-49px` / `-33px` (the frost card's 1 px border; C.7): 48 px at 1280x585 and 1440x900, 32 px at 390x844 on the 4 hubs that carry them (`46-more-*`) | none |
| I.79 | Keyboard focus inside the stuck navbar scrolled the page: the navbar sits in html's `scroll-padding-top`, so the browser scrolled every focused nav control "into view" (centring it): each Tab between nav links, site.js's ArrowDown into a dropdown panel and its Escape back to the toggle (`btn.focus()`) moved the page up about 458 px at 1440x900 (430 px at 390x844) | `header-focus.mjs`, scrolled to 2000: Tab, Tab 2000 → 1542 → 1084; ArrowDown 2000 → 1974; Escape → 1516. After: 2000 at every step; focus moving from the navbar into the content, and Shift+Tab through the content, land as before (`header-focus-css.mjs`, three candidates compared) | `.navbar :is(a, button) { scroll-margin-top: calc(-1 * var(--chrome-h)) }` (B.2; `--chrome-h` is the static token, so D1 holds); site.js unchanged | none |
| I.80 | F.7's "3 / 2 / 1 columns" for products and devices counted columns by viewport, but all 8 blocks (the 4 brand pages, the advanced-technology page) sit in the article column beside the aside: at 1024 px and up each card was 190-230 px wide and its long text ran about 18 characters a line | screenshot of `/contact-lenses/our-featured-brands/coopervision/` at 1440 (s01); page height 23,121 px | columns from the space, cards 300 px or wider, the media chip at most 320 px tall (F.7): 2 columns of 332 px at 1440 (text 282 px), 1 of 506 px at 1024 | none |
| I.81 | `.river { width: 100%; height: 100% }` let every `#page` height change rescale the river's stale drawing (`viewBox` of the old height, `xMidYMid meet`) until the 150 ms debounced rebuild, so the river and its weave clip drifted away from fixed content | `js-river-drift.js`: opening one FAQ item on the dry-eye page (+82 px) moved the river's start in the title band (above the change) 427.9 → 469.0 px for about 1 s, then the rebuild put it back; with no CSS size: 427.9 at every sample | the SVGs take their size from the `width`/`height` attributes site.js writes at each build (A.3, 1.8); no markup or script change | none |

### I.L Found in QA round 1 (wf6, 2026-10-02)

Evidence: the QA round 1 findings `tmp/wf6/salvage/round1-confirmed.json`, and the fix stages' probes and logs in
`tmp/wf6/reg/` (the regressions stage, rows I.118-I.119: the two regressions the re-verifiers found, BUILD-NOTES 14;
the stage was interrupted, and its closing run's probes, results and logs are in `tmp/wf6/reg/close/`),
`tmp/wf6/fix2/` (fix-2, rows I.106-I.117) and `tmp/wf6/fix1r/` (`p/` the probes, `logs-*/` their output, `v/<lane>-old|new/` the verifiers' own probes re-run on the
frozen snapshot `tmp/wf6/snapshot` and on the fixed build). Every row was measured on both builds; `docs/BUILD-NOTES.md`
section 13 holds the per-finding numbers and verdicts. Each row is a departure of this contract (or of DESIGN-SPEC)
taken to fix a confirmed finding.

| id | finding | evidence | this contract | owner |
|---|---|---|---|---|
| I.82 | CONTENT-1: the forms were not inert. `method="post"` with no `action`: a valid submit posted every field to the page's own URL and the page reloaded with every field empty (E, 1.10 documented it; DEPLOY.md claimed the opposite) | verifier `probe-forms.mjs`, snapshot: 1 POST of all 9 / 7 fields, 0 values left; scripts off (`p22-forms-nojs.mjs`): the same. Fixed build: 0 requests, 7 / 6 typed values kept, scripts on and off; the planted-notice control still shows its notice | `form.form[method=dialog]` (E, BUILD-NOTES 5.5); site.js cancels `submit` on every `form[data-needs-backend]` and shows a decided notice if the card holds one (1.10) | operator (Q8: endpoint, notice) |
| I.83 | CONTENT-3: the 13 noindex archives carried their first listed post's meta description, og:title, og:description, og:image and og:type | verifier `head-probe.mjs` c3: snapshot 0 / 4 / 0 / 3 of 13 (og:title = title, og:type website, no post description, logo image); fixed 13 / 13 / 13 / 13 | the archive describes itself: its own title as og:title, og:type website, no description, the logo as og:image; the meta description is dropped where it was the post's (no derivation: the archive is a list of links). Declared in `audit/seo-repairs.json` `openGraph` and `descriptionsRemoved`; `tools/seo-parity.mjs` accepts exactly those | none |
| I.84 | CONTENT-4: no output printed `twitter:description` (the source: 148 pages, always equal to og:description) | `head-probe.mjs` c4: 0 → 127 of 149 (every page with an og:description) | the head prints `twitter:description` from `og.description` (A.1); `twitter:title` keeps its documented rule | none |
| I.85 | CONTENT-12 and CONTENT-14: the last BreadcrumbList item was the canonical URL (8 pages whose canonical is another page); 404.html named the indexable `/404-page-not-found/` as canonical and og:url | `head-probe.mjs` c12: 8 → 0 mismatches of 123 trails; c14: canonical and og:url absent on 404.html | the trail's last item is the page's own URL; `404.html` prints no canonical and no og:url | none |
| I.86 | CONTENT-13: a paragraph of the practice's social links in content printed the 4 icon labels as visible lowercase text links (`/winter-dry-eyes-2023/`, the 2 footer templates) | verifier `probe-render.mjs` c13; words-added: 102,270 → 102,222 visible words (the 4 labels x 4 words x 3 pages, now `aria-label`s), 0 added | D.7: a top-level `p` made only of links to the chrome's social profiles prints as `ul.social.social--prose` of icon links (same href, target, rel; the label verbatim as `aria-label`); the focus ring of the footer icons | none |
| I.87 | CONTENT-16: og:image pointed at the WebP encode on 57 pages; the source used only JPEG and PNG | `head-probe.mjs` c16: webp 57 → 0 (png 105, jpg 39, jpeg 5) | og:image and twitter:image point at a byte-identical copy of the harvested JPEG/PNG (`<name>.<sha256 10 hex>.<ext>` in `img/`, 36 new files), never re-encoded | none |
| I.88 | MOTION-1 and PERF-1: the band `::after` overlays (opacity from `--p`, written every scrolled frame) were not composited and the river SVG shared their layer, so every scrolled frame re-rasterised; A-22 failed | verifiers `v11-jank.mjs` and `jank.mjs`, and `p14b-jank-cpu.mjs` (CPU x4) at 1440x900, 1280x585 DPR 1.5 and 390x844: BUILD-NOTES 13. `p14d-jank-sda.mjs`: the view-timeline overlay equals the `--p` formula (difference 0); style recalc per pass 0.84-0.96 s → 0.44-0.49 s at 1440 | 1.4: `will-change: opacity` on the 7 overlays and `will-change: transform` on `.river` (motion only); `--p` registered non-inherited (`@property`), taken by the `::after`; where scroll-driven animations exist, a view timeline per band drives the overlay and site.js writes no `--p` | none |
| I.89 | LAYOUT-1: at a larger browser font the sidebar cards grew wider than their track (implicit `auto` column) and were clipped by `#page`'s `overflow-x: clip`; the map pill's label was cut by `.mapcard`'s `overflow: hidden` at 600-900 px | `p01-sidebar.mjs` (Chrome font 16/20/24/32, 600-1600 px): snapshot 27 of 48 conditions fail, fixed 0 of 48; verifiers `v01-sidebar-fs.mjs`, `v12b-pill-carousel.mjs` | B.23: `.sidebar` and `.mapcard` one `minmax(0, 1fr)` column; the pill may use the card's 16 px end padding and wraps beyond that; below 8.5em of card width the hours stack under their day (container query) | none |
| I.90 | A11Y-1 and LAYOUT-9: the promo link's 3 px navy ring was painted inside `.fig__media`'s overflow clip under the 1.04 zoom, so it never showed | `p07-rings.mjs`: ring share 0 → 0.80 (1280x585 DPR 1.5) and 0.79 (390), weakest side 1.02:1 → 6.03:1; verifiers `21-promo.mjs`, `22-promo-ctl.mjs`, `v07b-promo-ring.mjs` | B.6: the ring is drawn by `.fig__media:has(a:focus-visible)` (outside its own clip); the link's own outline is off | none |
| I.91 | A11Y-2: with the page scrolled, Shift+Tab from the stuck logo focused three top-bar controls above the viewport and jumped the page 369-526 px per press | `p12-header.mjs`: snapshot stops at -44..0, scrollY 2500 → 1393; fixed 0..44, scrollY 2500 at every stop (1280x585, 1440x900, 1600x662); verifier `24-topbar.mjs` | B.1: while a top-bar control has `:focus-visible` the header sticks at `top: 0` and html's scroll padding is 0 | none |
| I.92 | A11Y-3, A11Y-14, A11Y-19: in forced colours the glass fills (gradients) dropped, so the navbar, dropdowns and drawer had no fill; the navy logo vanished on a dark Canvas; no reduced-transparency or more-contrast rules | `p13-misc.mjs`: navbar, sub, drawer and glass compute `Canvas` with no blur (were transparent and blurred); the logo sits on a paper plate; verifier `25-forced.mjs` | forced colours: those surfaces `background-color: Canvas`, no backdrop filter, the logo on a plate (`forced-color-adjust: none`); reduced transparency / more contrast: the glass surfaces opaque (DESIGN-SPEC 8 "surfaces Canvas") | none |
| I.93 | LAYOUT-11: header and UI text were set in px, so they ignored the browser's font-size setting | `p17-fontsize.mjs`: at the default 16 px no element changes its font size (3,371 compared; the 4 reported differences are the location card gaining `.is-tall`, 17 px both); at Chrome 20/24/32 the UI text scales and the nav switches to the drawer when it would not fit | UI font sizes in rem (same px at 16); the nav / drawer breakpoint is `75em` (1200 px at 16 px) in the CSS, `NAV_CLOSE_AT` and site.js | none |
| I.94 | LAYOUT-4, LAYOUT-13, LAYOUT-14: from 721 to about 815 px tall the full-size hero pushed the home h1 out of the first screen; the hub intro's first line was cut at 1280x585; the hero glasses came within 0-1.5 px of "Comprehensive" at 1024-1199 short | `p16-smode.mjs` (8 widths x 18 heights): h1 cut 29 → 0 of 144, glasses clearance under 12 px 10 → 0; hub intro first line whole at 1280x585; 1280x585 and 1600x662 unchanged | DESIGN-SPEC 2.4 short desktop is now `(min-width: 1024px) and (max-height: 820px)` (720 before); `--display` there `clamp(2.5rem, min(5.9vw, 9.6vh, 69px), 5.6rem)`; glasses `left: -13%` at 1024-1199; hub intro `padding-top: 18px` in the mode | none |
| I.95 | LAYOUT-3 and A11Y-7: at 320 px the mobile header was 321 px wide (every page scrolled sideways, the menu ring was cut) | `p03-header-narrow.mjs`: 149 → 0 pages with `scrollWidth > clientWidth` at 320 and 316; control fired | below 360 px tighter header gaps; the logo may shrink below A-17's 145 px only when the 305 px client width of a classic scrollbar at 320 leaves no room (131 px there) | none |
| I.96 | LAYOUT-8: the sticky location card was taller than the space under the stuck navbar, so its foot (the map pill) stayed below the fold | `p13-misc.mjs`: held below the fold 3 → 0 where the card does not fit; unchanged where it fits | B.23: site.js marks the card `.is-tall` when card + navbar + 24 px exceeds the viewport (re-measured by a ResizeObserver); only a card that fits sticks | none |
| I.97 | LAYOUT-16: a lone card sat at the left of the last row of the thumbnail and plain child grids | `p13-misc.mjs`: off-centre 173-409 px → 0 at 768, 1280, 1440 | F.2: a lone last card is centred under the row above, one column wide | none |
| I.98 | MOTION-5 and A11Y-10: clicking the long review's dot grew the track and pushed the dots from under the pointer; the focusable track had no role or name and its live region never fired | `p11-carousel.mjs`: the dots stay under the pointer at 360-1440 (they move 9-10 px at 1366 and 1440); the track is a group named "Read Our Patient Reviews", only the shown slide exposed | B.15: the dots come before the track; the track is `role="group"` labelled by the heading; site.js hides the slides not shown (`aria-hidden`) and refits the track on a slide resize (LAYOUT-5) | closed by fix-2 (I.109: the CTA in the bar above the track, the grid top-aligned) |
| I.99 | MOTION-2, MOTION-3, MOTION-9: Escape could not close a hover-opened dropdown; pointing at another item closed the panel holding keyboard focus (focus fell to `<body>`); widening past the breakpoint with the drawer open lost focus | `p10-nav.mjs` M2 / M3 FAIL → PASS at 1440x900 and 1600x662 (control intact); `p08-drawer.mjs`: focus lands on `a.mainnav__link`, not `<body>` | 1.5: Escape marks a hovered item `.is-dismissed` (CSS `:hover:not(.is-dismissed)`) until the pointer leaves; a panel closed by the pointer hands focus to its toggle; the drawer's close sends focus to the first rendered of menu button, nav link, logo | none |
| I.100 | MOTION-6: no print rules (page 1 of the home nearly blank, the video toggle printed, closed FAQ answers never printed, white text on dropped dark backgrounds) | `p09-print.mjs`: home page 1 text 83 → 481 characters with the statement, CTA and h1; FAQ answers printed 0 → 25 of 29; button and footer ink dark | an `@media print` block (riverlight.css end): decoration and motion hidden, every answer and review shown, dark ink on white | none (fix-2: all 29 answers print whole; the 4 "missing" were the probe's text key, BUILD-NOTES 13.7) |
| I.101 | MOTION-7, MOTION-8: A-12's 600 ms had no margin; the kids' glasses moved up to 44 px below rest (DESIGN-SPEC 2.9 says upward only) | `p19-a12.mjs` worst reveal 593-600 → 417 ms; `p13-misc.mjs` samples below rest 24-31 → 0 | `--dur-fade: 320ms` for a reveal's opacity (the slide keeps 480 ms); `fore` cut-outs clamp at 0 (1.4) | none |
| I.102 | PERF-4, PERF-5, PERF-7: the preload and `fetchpriority` went to an image that was never the LCP element; lazy images sat in the first screen; the hero loop kept decoding after its light had faded | `p18-lcp.mjs`: the LCP is the hinted element on 5 of 5 sample pages at 1440, 1280x585 and 390 (0 before), lazy in the first screen 1 page → 0; `p13-misc.mjs`: frames decoded at 1.15 vh 72-73 → 0 | the LCP rule (A.1) as rewritten there; the first 4 images of an article flow or a hub page load eagerly; the loop plays only while in view and not faded | none |
| I.103 | PERF-12 and PERF-3: the stylesheet and script shipped with comments and indentation; the hub grid `sizes` ignored the gaps and the brand tiles' 12 px padding, so the designer tiles fetched the next srcset width | `p15-cssom.mjs`: 956 = 956 CSSOM rules on the final build, 0 differences; `js-strip-check.mjs`: identical token streams; `imgaudit.mjs`: designer tiles painted 350-360 px against 384px / 30.67vw | P2 ships `minifyCss(bundle)` and site.js without its full-line comments (the build fails on a template literal or a script that does not compile); B "sizes rule": the hub grid subtracts the gaps, and a brand tile its padding | none |
| I.104 | A11Y-5, A11Y-15, A11Y-16, A11Y-9, A11Y-12, A11Y-8, LAYOUT-5, LAYOUT-6, LAYOUT-7, LAYOUT-10, LAYOUT-12 and MOTION-4 (smaller fixes) | `p07-rings.mjs`, `p11-carousel.mjs`, `p12-header.mjs`, `p05-spacing.mjs`, `p06-nav-default.mjs`, `p20-firstblock.mjs`, `p08-drawer.mjs`: BUILD-NOTES 13 | the video ring on its frame; navy and white halos under the skip-link and hero-toggle rings; idle dots at `.55`; `autocomplete="bday"`; the header unsticks at 480 px tall and below; the nav wraps instead of running off-screen and the statement word may break under user text spacing; `h1--xlong` from 75 characters; the scroll lock keeps the scrollbar gutter (replaced by I.106) | fix-2: residuals closed (I.106, I.108, I.114, I.115; the halos 9 → 12 px, BUILD-NOTES 13.7) |
| I.105 | PERF-6 (not closed): a site.js loader for the YouTube iframe (data-src, 600 px) was added to the video block template, but the one embed comes from the page model's prose (`page-model.mjs markProse`), so 0 pages used it | `grep data-src` on the built pages: 0; the eye-emergencies iframe kept its `src` | reverted (template, site.js, CSS); DEPLOY.md corrected | closed by fix-2 (I.111) |
| I.106 | LAYOUT-12, MOTION-4 (residual of I.104): with `scrollbar-gutter: stable` on the open state only, opening the drawer still moved the page 0.2-1.8 px at 769-1199 px with a classic scrollbar | `v07-misc-real.mjs` L12 on fix-1's build: the menu button 924 → 924.6 and the breadcrumbs 70 → 69.4 at 1024x768; `p/dev1.mjs`: with a gutter reserved, 100vw resolves to 1009 instead of 1024 at 1024 px, so every vw length changes (a 4vw padding by 0.6 px). Final: 0.0 px (`v07-misc-real.mjs` L12, `v05-drawer.mjs` M4) | 1.5: the lock pads the root by the removed scrollbar's width (`--sbw`, written by site.js before `showModal()`; 0 for an overlay bar or a gutter already reserved); the gutter rule is gone, so the closed page renders as before | none |
| I.107 | LAYOUT-15: a short article beside the long aside left a tall empty column (34 of 132 pages over 400 px at 1280x585, up to 1,111 px) | `v08-sweep-real.mjs` (1280x585@1.5): more than 400 px of empty column 34 of 132 → 0, any 42 → 0 (worst 1,111 → 0) | C.1: from 1024 px the article card fills its grid row (`align-self: stretch`). The river's anchors are hosted by `div.layout`, so its route is unchanged | none |
| I.108 | A11Y-17: on cards whose photo breaks out of the top (service, child-page and team cards), the photo (`.pl-break`, z-index 4) covered the top edge of the card's focus outline (2.7-4.6 % painted), because Chrome paints an element's own outline before its positioned children | `21-promo.mjs` (top edge sampled every 1 px): 2.7-4.6 % painted, 3 of 4 sides → 100 % on the 4 service cards, 4 of 4 sides at 5.52-5.57:1 (final tree); `p/card-ring.mjs`: drawn on all 133 hosts of the 21 pages at 4 sizes, with no sideways scroll and no clipping | B.8: `[data-tilt]:has(:focus-visible)::after` draws the same ring above the photo (inset -8 px from the padding box, 3 px, radius `--r-l` + 7 px, z-index 6), with a white halo either side so it reads where it crosses the photo; the outline stays (forced colours: `Highlight` on both) | none |
| I.109 | MOTION-5 (residual of I.98): with the dots above the track, opening the long review still pushed the CTA (below the track) down by the slide's growth; and because the photo and panel were centred on each other, a taller panel moved its own top, dots included | `v06-dots.mjs`: the CTA 427.8 → 747.7 at 1280x585 on the snapshot; `p/dev1.mjs`: the dots moved 27.7 px on an intermediate build. Final: dots and CTA 0.0 px at 1280x585@1.5, 1440x900 and 390x844, the pointer stays on the dot | B.15: the dots and the CTA share `.carousel__bar` above the track (a departure from DESIGN-SPEC 3.15 "the CTA below"; its label, target and rel unchanged); `.reviews__grid` top-aligned; no bottom margin on `.carousel` | none |
| I.110 | PERF-14: at 768 px and below the header logo's `source` named only the 988 w file, so DPR 1-2 phones fetched it for a 145 px logo (3.41x at DPR 2) | `imgprobe.mjs`: 768x1024@2 and 390x844@2 988 w (21,098 B) → 300 w (1.03x, 20,083 B); 390x844@3 keeps 988 w | B.2: the phone `source` lists both logo files with their widths and `sizes="145px"` (a departure from DESIGN-SPEC 3.2's one-file source). Both are the same artwork, byte-identical copies of the source's logos, so A-17 holds | none |
| I.111 | PERF-6 (closes I.105): the one YouTube iframe (eye-emergencies, from `page-model.mjs markProse`) was fetched at page load, with no scrolling, at 1440x900, 1920x1080, 1366x657 and 768x1024; Chrome's lazy distance for iframes is about 2,500 px | `iframe.mjs`: 8 of 18 runs → 0 of 18; the scrolled control requests it at every view | D.7 item 7: the template prints the address as `data-src` with a `noscript` copy. 1.13: site.js sets `src` within 600 px. 0.4: `data-src` | none |
| I.112 | PERF-10: `/hours-location/` fetched the practice-interior photo twice at 1440x900 (720 w for the arch, 1024 w for the wide figure: the same srcset, two `sizes`) | `imgprobe.mjs`: 34,913 + 68,153 B → 68,153 B; `p/arch-dups.mjs`: the only page where an arch's file recurs | B.21: an arch whose image recurs in the page (same srcset) takes that image's `sizes`, so both resolve to one candidate | none |
| I.113 | PERF-11: the font swap moved the main nav 9.5 px at 1280x585. The nav is set at weight 550, and the bold fallback face was sized for Atkinson 650-700 (the six labels 623.0 px in Verdana Bold at 82.94 %, against 613.5 in Atkinson 550) | `fontswap.mjs`: first link 366 → 375.5 on the swap, CLS 0.00038 → no movement, 0; `p/dev1.mjs`, `p/dev2.mjs` (label widths per face) | fonts.css: a 550-599 face per fallback, Verdana Bold at 81.67 % and Arial Bold at 94.78 %, from the measured ratios. The Roboto faces are unchanged (not installed where measured) | none |
| I.114 | LAYOUT-8 (residual of I.96): `.is-tall` compared the card's `offsetHeight`, which rounds down, so at 913 px tall (1024-1199 px wide) the 796.3 px card still stuck with its foot 0.3 px below the fold | `v06-sticky.mjs` on fix-1's build: 1024, 1100 and 1199 x 913 stuck, 0.3 px below → final 0 of 58 | 1.0, B.23: the card's `getBoundingClientRect().height` | none |
| I.115 | A11Y-19 (residual of I.92): under reduced transparency or more contrast the drawer panel kept its gradient, the frost cards their 94 % white and the scrim its 45 % | the shipped CSS (`11-static-extra.mjs` counts the rules) | the same media block: the drawer panel flat paper, frost cards opaque, the scrim 80 % (departs from DESIGN-SPEC 3.2's white-to-`--aqua-50` panel and its scrim .45, in that mode only) | none |
| I.116 | LAYOUT-14 at a larger browser font: the statement grows with the font setting up to its column, the hero glasses do not. At Chrome font 32 their box overlapped "Comprehensive" by up to 52.5 px (`v10-glasses.mjs`); over 13 sizes the worst clearance was -4.3 / -4.3 / -9.7 / -52.5 px at font 16 / 20 / 24 / 32 | `p/glasses-font.mjs` (the verifier's clearance at 13 sizes × 4 fonts): → 19 / 39 / 59 / 27.5 px | B.4: from 769 px the glasses `translate` right by `max(0px, (1rem - 16px) * 5)`, which is nothing at the default font | none |
| I.117 | A11Y-15, A11Y-16 (residuals of I.104): fix-1's 9 px halos left their anti-aliased edge 2.5 px past the 3 px ring, where the ring's outer neighbour is read (skip link bottom 1.19:1; hero toggle right side 2.90) | `20-focus.mjs`, `21-promo.mjs` on the final tree: 7.91:1 and 5.57:1 on all four sides | the skip link's navy halo and the hero toggle's white halo 12 px (9 before); the video keeps its outline colour with `outline-style: none` (A11Y-5: its computed outline describes the ring the frame draws) | none |
| I.118 | REG-B1 (QA round 1, regressions; a side effect of I.93): with LAYOUT-11's rem sizes a label wraps at a larger browser font, and `.btn` (block padding 0, line height 1.15, `overflow: hidden` for the sheen) was exactly as tall as its line boxes, so each label's text box (ascent + descent, about 1.3em) ran 1.2-3 px past the pill's top and bottom and was cut. The 3-line address button of `/template/header/` (and at 320 px the 3-line "Learn More About Cataract Co-Management" of the glaucoma page) was cut the same way at the default font on phones (2 px) | `tmp/wf6/reg/p/btn-sweep.mjs` (every `.btn` of the 149 outputs at 12 conditions, run as `p/btn-sweep-c.mjs` chunks and merged, both controls fired in every chunk), pages with a clipped label old → new: font 16 at 320x568@2 2 → 0, 390x844@3 1 → 0, 800 / 1024 / 1280x585@1.5 / 1440 0 → 0; font 20 and 24 at 390x844@3 2 → 0 and 17 → 0; font 32 at 390x844@3 149 → 1 (the `/hours-location/` email clipped by `div.page`, the same on old: not a button) and at 1024x768 3 → 0; font 20 and 24 at 1280x585@1.5 0 → 0 and 1 → 0. Labels whose text box crosses the pill's top or bottom: 192 → 0 at font 32 on the phone (smallest clearance 8 px), 31 → 0 at font 24. At font 16 the boxes are identical (187 of 196 at 320, 191 of 196 at 390, all 196 / 196 / 190 / 190 at 800 / 1024 / 1280 / 1440) except the 3- and 4-line labels (+11 px) and what follows them on their page. The verifier's `clip-sweep.mjs` (old `tmp/wf6/snapshot-fixed`): font 20 at 390 / 800 / 1024 2 / 0 / 0 → 0 / 0 / 0, font 24 17 / 2 / 3 → 0 / 0 / 0, font 32 at 800 / 1280x585@1.5 149 / 149 → 0 / 0, no new hit (`close/clip-compare.mjs`). `tmp/wf6/reg/close/ink-test.mjs` (the label painted black on no fill, with the pill clip, a square clip and no clip): glyph pixels cut at font 32, 390x844@3 and 1024x768, every button of the 149 pages: 0 (with plain `--r-pill` 192 on the `/template/header/` address at 390; old 439). `p/forced-boxes.mjs` (forced colours and print): 90 of 100 boxes identical, the others that address (+11 px) and the 4 buttons below it | B.0: `.btn` and `.btn--lg` block padding `.34375em` (5.5 / 5.84 px at the default font, whole layout units); radius `min(var(--r-pill), calc(26px + .75em))` (the closing stage's cap: a one- or two-line pill keeps its round ends at fonts 16-32, a taller one rounds its corners); inline padding, line height 1.15, `min-height` 50 / 56 px and the overflow clip unchanged. At the default font the min-height absorbs the padding for one- and two-line labels (unchanged); three lines or a larger font grow the pill. The classless CMS button of D.8 (`.rich :is(button, input…):not([class])`, never emitted) has no overflow clip and keeps its padding | none |
| I.119 | R1 (QA round 1, regressions; a side effect of fix-1's CONTENT-2 declarations): `sr-fabrication` reads every `<figure>` / `<blockquote>` with more than 20 characters of text as a testimonial and traces it when its text CONTAINS a declared quote; fix-1 had declared the 6 names the rebuild printed inside a `<figure>` (2 doctors' plates, 4 lens names) in `facts/client-facts.json` `testimonials`, so an invented review embedding one of them passed the gate | `tmp/wf6/reg/p/fig-trace.mjs`: testimonial candidates traced only by those declarations 9 → 0 (4 lens figures, 3 doctor portraits, 2 arches); `p/fab-ctl.mjs` (the re-verifier's plant file and sandbox): blockers with the snapshot's facts 5, fix-1's 2, this stage's 5 (the 3 name-embedding reviews are blockers again); `sr-fabrication --strict` on the build SOURCED, 0 / 0 of 698 claims; `p/layout-boxes.mjs`: 0 of 5,428 boxes moved; `p/ax-names.mjs`: every named node unchanged, 15 unnamed `figure` nodes gone per view (the home portrait, 7 lens figures, 2 doctor portraits, 5 arches); `p/shots.mjs`: the plates and the lens grid pixel-identical | B.10, B.21: a portrait or arch that holds the placeholder plate is a `div` (`div.doctor__portrait`, `div.titleband__frame`), the photo variants stay `figure`; D.5, D.7 transform 9: a model figure whose caption only repeats its image's alt prints as `div.fig` + `div.fig__caption`; H.1 `.fig__caption`. `tools/write-facts.mjs` declares no figure text (the plate and product checks still run); `facts/client-facts.json` `testimonials` holds the 8 source cards only | none |

### I.M Found in the mobile optimisation (2026-10-05)

Evidence: the 4-lane mobile audit and its refuters (`tmp/mobile/<lane>/findings.json`, `tmp/mobile/refute-<lane>/verdicts.json`;
lanes layout, look, touch, speed) on `tmp/mobile/base` (`a3976355…`), and each fixer's probes, results and shots under
`tmp/mobile/fix-<x>/` (fixer A, rows I.120-I.128: `tmp/mobile/fix-a/`, BUILD-NOTES 15.1; fixer B, rows I.129-I.136:
`tmp/mobile/fix-b/`, BUILD-NOTES 15.2; fixer C, rows I.137-I.147: `tmp/mobile/fix-c/`, BUILD-NOTES 15.3; fixer D1 (the operator's options 4b, 5b, 6b and two open items), rows I.148-I.153: `tmp/mobile/fix-d1/`, BUILD-NOTES 15.4, Old there = `tmp/mobile/fixed` (`79ecd3cf…`); the outcome of every
audit item: BUILD-NOTES 15.0; the operator's options: OPEN-DECISIONS E). Old = `tmp/wf6/snapshot-final`
(`a1de2c09…`). Every row is scoped to widths below 1024 px (the desktop lock, BUILD-NOTES 15.0), proven by
`tmp/mobile/p/desktop-lock.mjs`.

| id | finding | evidence | this contract | owner |
|---|---|---|---|---|
| I.120 | M-LAYOUT-1 = RL-MISS-1 (major): at 768 px and below the river's over copy crossed the arch's upper half (0.07-0.52 of its height): the eyes, nose and mouth of the 6 staff portraits, the people of the hub photos (`/eye-care-services/` included) and the monogram of the 5 plates, on 17 pages (and the decorative arches of the other 131) | `tmp/mobile/fix-a/p/river.mjs` (painted extent of every over-copy strand inside the arch shape, from geometry and from pixels, over SVG shown vs hidden; controls: a planted path at 0.30 H, a rectangle clip, a half clip): the 17 arches at 320 / 360 / 390 / 430 / 768, face-zone pixels (upper 60 %) old 7,293-24,076 on every arch at every width → new 0 (painted 0.69-0.91 of the height on the 12 photos; the plates carry no over copy); 412x915@2.625 and 375x667, 667x375 also 0. All 149 pages at the 5 widths: face zone 0, over copy outside the shape 0 (1 intermittent read on `/hours-location/` at 320, not reproduced in 7 re-runs), seam 0, in-front crossing within two screens on all 143 photo or generated arches; the A-13 clearance: no new text line within 40 px (the 10 pages at 320 within 38-40 px are the same on old: the hub and home left bank at 320) | B.21: `t1` `p:104%,100%+46px`, `t2` `p:56%,100%+46px` (`d` unchanged); a plate's weave zone `data-on="d t"`. R3's phone crossing is given up on the 5 plate pages until their portraits arrive. Not covered: 769-1023 px (the `t` layout, shared with the locked 1024-1199 px) still crosses the faces at 844x390 | operator (R3 on the 5 plate pages); the 769-1023 px crossing: fixed by the layout split of I.151 (fixer D1) |
| I.121 | M-LAYOUT-3: C.7 specified `cards--brand` on the `cards--4` grid (4 / 2 / 1), but the markup carries no `cards--4` and the CSS gave it no column template: one column at every width, each 4:3 chip 614-777 px wide around a 325 px logo from 560 px up | `p/items.mjs` brand (control: 2 columns planted): 667x375 / 844x390 / 768x1024 list 2,070 / 2,559 / 2,349 → 550 / 672 / 620 px, logo 28 / 17 / 21 → 73 / 77 / 76 % of its chip; 320-430 unchanged (one column, 73-77 %) | C.7: two columns at 560-1023 px; 1024 px and up one column as before (a contract miss on the frozen desktop, left to the operator) | operator (desktop columns) |
| I.122 | M-LAYOUT-4 = M-LOOK-7: below 360 px the reviews bar wrapped (the fifth 44 px dot alone on a second row, 'Read Google Reviews' on two lines) | `p/items.mjs` bar (control: a 200 px bar): 320x568 bar 234 → 246 px, dot rows 2 → 1, CTA lines 2 → 1, dots 44x44; 360 and up unchanged | B.15: the panel's inline padding 20 px below 360 px | none |
| I.123 | MISS-L1 + M-LOOK-8: a heading-only hub band left its heading two section paddings above the content it introduces (192 / 128 px at 390), with a second lone wave rule from an `hr` on `/contact-lenses/` | `p/items.mjs` head (control: 300 px planted): 192 → 66 px and 128 → 24 px at 320-768, 195-224 → 68-74 and 131-160 → 24 at 769-1023; the `hr` kept in the DOM, not drawn; 0 elements with words hidden | C.7: the band drops its bottom padding and the next band's top padding is 24 px below 1024 px; a `hub-flow` holding only an `hr` is not drawn there | none |
| I.124 | M-LOOK-1 + M-LAYOUT-6 + MISS-L2: two-column phone grids ended on a lone left item (the designer-frames logo wall, its 3-brand fig-grid, the 7-plate fig-grid of `/contact-lenses/`), and the brand chips were 173 / 94 / 80 px tall | `p/items.mjs` grid (control: two figures planted, one cropped): last-item offset -62.5 to -180.5 px → 0 at 320-768 (the logo wall at 320-560), chips 171 / 171 / 171 at 390, 0 images cropped; the logo wall's 4 columns at 600-768 and every grid from 769 px unchanged (the refuter's side effect of a 767 px scope avoided) | B.31 logos: the lone chip centred below 600 px; D.5: the lone figure centred and the brand chips square up to 768 px | none |
| I.125 | M-LOOK-2 (partly confirmed): the centred band title 'SEE BETTER' sat over the left-aligned 'LIVE BETTER' on `/eyeglasses/designer-frames/` | `p/items.mjs` see (control: the alignment toggled): 'LIVE BETTER' text centre offset -65 to -355 px → 0 at 320-1000, its wave rule centred; the other band titles stay centred | C.7: the refuter's narrow rule below 1024 px; DESIGN-SPEC 3.3's centred band intro kept | none |
| I.126 | M-LOOK-3: the home cataract card opened with an empty line (a leading `<br>`) | `p/items.mjs` cat (control: two more `<br>` planted): heading to the first line 54.4-58.5 → 28-30.9 px at 320-844 px (65 → 37 at 1000), the `br` in the DOM | B.13: the leading `br` is `display: none` below 1024 px | none |
| I.127 | M-LOOK-4 + M-LAYOUT-2: pill labels ended on one word or broke onto two lines at 320-390 (hub intro, CTA band, sidebar, `/hours-location/`, glaucoma) | `p/items.mjs` btn on 25 pages (control: a 150 px pill): wrapped labels 34 → 14 / 14 → 4 / 13 → 4 / 4 → 2 at 320 / 360 / 375 / 390, labels ending on one word 30 → 11 / 14 → 0 / 13 → 0 / 3 → 0 (at 412 and 430 1 → 0); every pill 50 px or taller, the CTA band frame 10 px kept. REG-B1 (`tmp/mobile/fix-a/reg/`, the closure's probes verbatim on this stage's ports): `btn-sweep-c.mjs` pages with a clipped label 0 → 0 at fonts 16 / 20 / 24 (390) and 16 (320), 1 → 1 at 32 (the `/hours-location/` email, not a button), corners in the rounded clip 10 → 0 at 32; `clip-sweep-c.mjs` fonts 20 / 24 on the phone 0 → 0; `ink-test.mjs` glyph pixels cut 0 → 0 at fonts 16 (320, 390), 20, 24, 32 (390) | B.0: labels balanced up to 768 px; up to 420 px the pill's inline padding `clamp(16px, calc(1.5em - 8px), 24px)`, gap `clamp(8px, .5em, 10px)`, `btn--lg` `clamp(18px, calc(1.5em - 7.5px), 30px)`; C.7 hub intro 16 px, B.24 CTA panel 20 px (frame kept), B.23 side card 18 / quick action 12 px and B.10 doctor text 20 px below 360 px | none |
| I.128 | RL-MISS-2: a list item that only wraps a nested list drew a stray wave bullet and indented its list twice (text 60 px in) | `p/items.mjs` li (control: a nested-only item planted): text 60 → 30 px from the list edge, `::before` none, the nested items take the wave bullet, at 320-1000 px; at 1024 px and up identical (desktop lock) | D.7 transform 10 (`li.li--wrap`), D.4 | none |
| I.129 | M-TOUCH-1 (minor; simulated, unverified on WebKit): without `<dialog>` (Safari before 15.4) the menu button was dead (site.js wired it only where `showModal` exists) and, without the UA rule that hides a closed dialog, the transparent full-viewport drawer covered every page (Safari 14.1-15.3) | the refuter's `r01-dialog.mjs` (copied verbatim, `tmp/mobile/fix-b/p/`), `showModal` removed and the UA rule replaced before load, nothing of the fix injected: 390x844@3 / 320x568@2, old: the drawer display block over the viewport, 4 of 4 points hit it, a card tap does not navigate, the menu stays closed, 0 nav links → build: display none, the points hit the page, the card tap navigates, `html.no-modal`, 15 nav links, no sideways scroll; `fb-nodialog.mjs` at 390 / 320 / 667x375 / 700x1000 / 768 / 820x1180 / 844x390: a nav link and a card navigate, a `#main` jump lands 16 px down, a FAQ question opens by tap (old: covered); the class follows the width (900 on, 1100 off); real Chrome (control) identical on both builds | 0.3 `no-modal`; 1.5 (no `showModal`); B.2: below 1024 px `dialog.drawer:not([open]) { display: none }` and the no-JS nav rules under `html.no-modal`, with the refuter's amendment (`scroll-padding-top: 16px`, `.navbar :is(a, button) { scroll-margin-top: 0 }`) | operator: an old Safari at 1024 px and up keeps the covering drawer (desktop lock) |
| I.130 | M-TOUCH-2 (minor): the Date of Birth field (`input#f9-17`) printed `inputmode="numeric"` although it asks for `mm/dd/yyyy`; the numeric keypad has no "/" (unverified on WebKit); the source's datepicker field had none | built page: `inputmode` on 1 page → 0; the refuter's `r04` (dob) at 390x844@3 and 360x800@3: `inputMode` "numeric" → "", 16 px, a label tap focuses it, "01/01/1990" kept; type, `autocomplete="bday"`, placeholder and hint unchanged | E.1, E.2 (the `input[inputmode]` row removed); BUILD-NOTES 5.5 | none |
| I.131 | MT-R1 (minor): at the top of a page the open drawer put its first row ('Hours & Location') where the menu button was (77 px down, under the top bar; the close button sat at 20 px), so a second tap to close the menu navigated away | the refuter's `r08-menu-retap.mjs` (verbatim) at 390 / 360 / 320 / 412 / 430 / 375, top and scrolled, 700 ms and 250 ms second taps: navigated away 24 of 48 (every top run) → 0 of 48, the close button's top on the menu button's (0.0 px at the top; 3 px scrolled, as before); 844x390, 667x375, 768x1024 at the top 6 of 6 → 0 of 6; `fb-drawer.mjs`: the panel scrolls 36 px at 320x568 (its last action 7.5 px below the fold until a drag), 48-57 px more in landscape, nothing more at 360-768 portrait; 1024x768 and 1100x800 (mouse) identical | 1.5 (`--menu-top`), B.2: `.drawer__panel { padding-top: max(16px, var(--menu-top, 16px)) }` below 1024 px | none |
| I.132 | MT-R2 (minor): a page left from inside the drawer came back from the back-forward cache with the drawer open, the page scroll-locked and `aria-expanded="true"` | the refuter's `r07-bfcache-drawer.mjs` (verbatim), 390x844@3 and 360x800@3: of the runs restored from the bfcache after a drawer link or action, open 3 of 3 → 0 of 3 (closed, unlocked, `aria-expanded="false"`, focus on the menu button); the page-link control closed on both; the first navigation of a new browser is never cached (fresh load on both); at 700x1000@2, 768x1024@2 and 820x1180@2 5 of 5 → 0 of 5 | 1.5 (`pagehide`), B.2 | none |
| I.133 | M-TOUCH-4 (nit; refuter: partly): 48 `:hover` rules applied on phones; on the controls that stay after a tap the tap left a hover look (the current dot navy, the inert Submit's darker fill and ring, tinted toggles, the FAQ question navy-900), and a card came back lifted after tap, navigate and Back | the refuter's `r02-hover-census.mjs`: unguarded hover looks on phones 48 → 37 (+6 rest-value resets under `(hover: none)`, read by the census as unguarded), guarded 7 → 18; `r03-hover-live.mjs` (real taps, 390x844@3): dot `rgb(30, 44, 112)` → `rgb(3, 117, 109)`, hero toggle tint → white, drawer submenu toggle tint → transparent, FAQ question navy-900 → navy-700, Submit teal-800 with a 4 px ring → its rest look, card after Back lifted −7 px with glare .35 → 0 and 0; keyboard focus on the Submit still shows the focus look; `fb-hover.mjs` (real mouse hover at 1280x800, the drawer at 1024x768, 800x600): 54 readings equal on both builds but one rest reading that also differs old against old (a reveal in flight); a planted hover change is caught (8 readings) | B.0, B.8, B.15, B.26: the hover halves of `btn--primary / --secondary / --ghost / --light`, the sheen, `roundbtn--navy / --teal / --ghost`, `.dnav__toggle`, the dot and the FAQ question under `(hover: hover), (min-width: 1024px)`; the card reset under `(hover: none) and (max-width: 1023px)` | none |
| I.134 | MT-R3 (nit): one fast swipe could skip a review (mandatory snapping without `scroll-snap-stop`) | `fb-fling.mjs` (real touch swipes, 16 per speed and width over two runs; the refuter's `r09` too): swipes whose finger stays under one slide skipped 39 of 96 → 18 of 96; at speeds a hand reaches (220 px in 50 ms, 260 px in 24 ms) 33 of 64 → 4 of 64; at 2-4x Android's maximum fling speed (280 px in 12 ms, 300 px in 8 ms, 390 px) 6 of 32 → 14 of 32; the dots still land on their slide. Partly: the emulation does not hold every fast fling; unverified on real devices and WebKit | B.15: `.review { scroll-snap-stop: always }` below 1024 px | none |
| I.135 | M-SPEED-1 (an operator option of PERF-2 / PERF-3, adopted under "optimize mobile"): DPR-3 phones fetched each photo at about 3x its painted width | `fb-sizes.mjs` (the browser evaluates every slot's `sizes`, whole and without the twins; 21 pages, 21 views): density asked for 1.905-2.185 at DPR 2.2-4 (exactly 2.00 ± 0.02 at 2.625 and 3), unchanged at DPR 2.19 and below and at every view from 769 px (0 of 54 capped slots), the 101 excluded images unchanged everywhere; `fb-picks.mjs`: 0 changed picks of 845 on 149 pages at 1440x900, 1280x585@1.5, 1024x768 and 820x1180@2 (189 at 390x844@3: the probe's control); `weight-fb.mjs` (the speed lane's harness): no double fetch on the 20 family pages at 390x844@3, 360x800@3, 412x915@2.625 (a preload planted with another `imagesizes` is caught); image bytes −1,829,967 B over 149 pages at 390x844@3; `phone-lock.mjs`: no image width changed on 9 phone views x 20 pages (heights of two figures ±0.47 px, a different file's rounded height); desktop lock 0 | 0.8, A.1: `capSizes()` twins before every capped slot's `sizes` and the LCP preload's `imagesizes` | operator: revert (capSizes returns its input); the HTML grows 0.8-9.4 kB a page at every width (BUILD-NOTES 15.2) |
| I.136 | M-SPEED-5 (nit): three phone `sizes` values stated more than the painted width and crossed a srcset step | `fb-sizes.mjs`, old `sizes` / build against the painted width: home service cards 368 / 356 px for 357.1 at 375x667@2 (1080 → 720 w, 38,940 B) and 412 / 399 for 399.2 at 412x915@2.625 (1280 → 1080 w, 38,570 B); trio 198 / 178 for 178.5 at 320x568@2 (427 → 360 w, 13,020 B); `/the-staff/` team grid 293 / 250 for 250.8 at 667x375@2 (640 → 540 w, 39,336 B); within 0.3 % of the painted width at 320-768; 769 px and up unchanged (picks identical at 820x1180@2) | B.6, B.11, B.27: the phone entries derived from the CSS boxes (cards `min(calc(100vw - 78px), calc(92vw - 46px))` x k, trio `min(220px, calc(62vw - 19.84px))`, team `calc(46vw - 56px)` x k at 600-768) | none |
| I.137 | M-LAYOUT-7 (nit): Tab scrolled the next control just onto the fold, and with no bottom scroll padding the lower 3.5-6.3 px of its 6 px focus ring (3 px outline, 3 px offset) sat below the screen | `tmp/mobile/fix-c/p/tab.mjs` (the layout refuter's walk verbatim: 15 real Tab presses per page, motion on; control: a link 2 px above the fold reads a 4 px cut, on both builds): walks with a cut ring 9/20 → 0/20 at 390x844@3, 6/20 → 0/20 at 360x800@3 (the 20 family pages); on the 8 affected pages 768x1024 2/8 → 0/8, 844x390 4/8 → 1/8, 600x900 3/8 → 0/8, 1000x800 5/8 → 0/8; 0 elements under the stuck navbar on both builds. The one left: the appointment form's 160 px textarea at 844x390, which Chrome does not scroll on focus while it is partly in view (52.3 → 46.3 px) | 1.1: `html { scroll-padding-bottom: 12px }` below 1024 px (a static value; it moves no box) | none (the textarea case is the browser's focus scrolling) |
| I.138 | M-LAYOUT-8 (nit): on `/contact-us/patient-forms/` the forms list touched the sentence above it (0 px): `.docs { margin: 0 }` beats `.prose > * + *` by source order (the I.65 pattern) | `p/items.mjs` docs (control: `margin-top: 0` planted on the build reads 0): box gap 0 → 17-18.1 px at the 9 phone views, 17.5 at 600x900, 18.5 at 1000x800 | B.31 `docs`: `.prose > .docs:not(:first-child) { margin-top: 1em }` below 1024 px | none (1024 px and up keep 0: the desktop lock) |
| I.139 | M-LAYOUT-9 (nit; refuter: partly, a refinement of G4's 0.5em): the h4 'How Often Do You Need to See the Optometrist…' sat 9 px under the h3 'Eye Care for Everyone in Fort Myers' on `/eye-care-services/eye-exams/`, the site's only classless h3 + h4-h6 pair (`p/census-h3h4.mjs`) | `p/items.mjs` h3h4 (control: 0.5em planted reads 9): 9.0-9.8 → 18.1-19.7 px at the 9 phone views, 9.4 → 18.9 at 600, 10.1 → 20.2 at 1000 | D.4: the stacked-heading 1em extended to an h3 + h4-h6 below 1024 px | none |
| I.140 | M-LAYOUT-10 (nit): the two longest post titles (90 and 91 characters) ran 6 lines at 320 px against DESIGN-SPEC 2.3's 5. Also found: 0.3 and B.21 said `h1--xlong` from 80 characters (12 long, 2 xlong) while the template uses 75 since QA round 1's LAYOUT-10 (9 long, 5 xlong) | `p/items.mjs` xlong (control: 1.75rem planted reads 6): 320x568 6 → 5 lines, first block 717 → 666 px; the other three xlong titles 5 → 4 lines; 360, 375 and 390 identical | B.21: `#page-title.h1--xlong` 1.5rem below 360 px; 0.3 and B.21 corrected (75 code points; 9 and 5 pages) | none |
| I.141 | M-LAYOUT-11 (nit): on `/our-eye-doctors/` each stacked doctor block kept its 64 px section padding inside one band, leaving 152 px between one doctor's text pane and the next portrait (191 px from its last line): three section breaks on one page | `p/items.mjs` doctor (control: 64 px planted reads 152): box 152 → 72 px and text 191.3 → 111.3 px at 320-430 and 768x1024 (667x375 176 → 96); each photo still clears the pane above by 46 px with its 26 px parallax budget; 844x390 and 1000 unchanged (side by side); the home's doctor sections keep 64 px | B.10: `.band__inner > .doctor { padding-block: 24px }` up to 768 px | 769-1023 px: applied by fixer D1 (I.152) |
| I.142 | M-LOOK-5 (minor; refuter: nit): three insets (the ground panel 12 px, the 3 px border, the card 22 / 24 px) left treatment paragraphs 212 / 252 px wide at 320 / 360 px, a median of 24-30 characters a line | `p/items.mjs` treat (control: the old paddings planted read 212 px): 360 252 → 280 px, median 28 → 33, paragraphs of 2+ lines under 30 7/9 → 1/9 (top-causes 4/10 → 1/10); 390 282 → 310; 320 212 → 240, 24 → 27, 9/9 → 7/9; 768 and 844x390 unchanged. **Partly** | D.6: below 768 px `.treatments` pads 6 px and `.treatment` 18 / 16 px (panel and border kept) | operator: 320 px stays under 30 characters a line (a smaller type, or no ground panel) |
| I.143 | M-LOOK-6 (minor; refuter: nit): FAQ questions ended on one word alone ('exam?', 'take?'): 12 / 13 / 9 / 5 of 29 at 320 / 360 / 390 / 430 | `p/items.mjs` faq (control: `text-wrap: wrap` planted reads 12): 12 → 1, 13 → 0, 9 → 0, 5 → 0 of 29 (375 11 → 0, 412 7 → 0, 667x375 5 → 0, 844x390 1 → 0, 768 4 → 0, 600 8 → 0, 1000 1 → 0); dry-eye 2-3 → 0 and cataract co-management 1 → 0 of 3; line counts unchanged. The one left at 320 ends on 'sunglasses?' (too long to pull up) | B.26: the question's lines balanced below 1024 px | none |
| I.144 | M-LOOK-9 (nit): a sitemap link that wraps filled its 44 px row and its text came within 3.9 px of the next (one-line rows sit 22 px apart) | `p/items.mjs` sitemap (gaps within a column; control: `padding-block: 0` planted reads 3.9): smallest wrapped gap 3.9 → 16.9 px at 320-390, 11.5 → 19.5 at 412 and 430, 3.8 → 16.8 at 667x375, and in the two-column list 3.2-4.0 → 16.2-17.0 at 768x1024, 844x390, 600, 700, 900 and 1000; one-line rows unchanged (44 px, 20-22 px apart) | F.5: links pad 8 px top and bottom below 1024 px (widened from the finding's 767 px, where the two-column list kept the defect) | none |
| I.145 | M-LOOK-10 (nit): below about 340 px the four footer legal links wrapped with their rows at the list's left edge, -28.2 / -102.6 px from the centred '© 2026' | `p/items.mjs` legal (control: `flex-start` planted reads the offsets): 320x568 → 0 / 0 px; 360-768 positions identical (one row) | B.19: `.legal ul { justify-content: center }` in the existing 768 px block | none |
| I.146 | M-LOOK-11 (nit): on narrow phones headings split 'Fort / Myers' and 'Cataract Co- / Management' (12 / 9 / 5 / 4 split names on the 36 pages that hold them, at 320 / 360 / 390 / 430) and leave lone fragments | **Not fixed.** The markup-only no-break (a D.7 transform wrapping the two names in `span.nb`, `nowrap` below 1024 px) passed the 12 gates with 0 splits and 0 overflow at 320-1000, but `p/glue-shot.mjs` read 'LatestFort MyersEye Care News & Tips' and 'Fort MyersEye Exams' at every width (inline-flex links: word space 0 px against 6.4-11.6), and `desktop-lock.mjs --lines` read heading text moved by 0.01-0.03 px at 1024 px and up on 9 of the 20 family pages; withdrawn, `templates.mjs` restored (BUILD-NOTES 15.3) | D.7: the withdrawn transform and why recorded | operator: non-breaking characters in the text (a copy change), or a script that wraps the names below 1024 px (a layout shift after first paint) |
| I.147 | M-LOOK-12 (nit; refuter: partly): the three practice videos showed a #333 grey slab, not DESIGN-SPEC 3.22's navy CSS poster: Chromium's native controls paint a default poster over the frame (their `-webkit-media-controls` container in its `use-default-poster` state); the auditor's `video` background paints nothing | `p/video-ua.mjs` (the control tree); `p/video-check.mjs` (controls: the navy legal bar and a planted #333 box read as such): grey 49-51 → navy (18, 28-30, 65-68) at 320, 360, 390, 667x375, 844x390, 768 and 1000; a real tap on the play button plays on both builds; while playing the bar keeps its scrim (bar strip as on Old; the refuter's wider variant read 240 against 41 over a white frame); 1024 and 1440 grey on both builds | B.22: `.video__frame > video::-webkit-media-controls { background-color: transparent }` below 1024 px | operator: 1024 px and up (a site-wide version changes the signed-off desktop); unverified on WebKit |
| I.148 | M-LAYOUT-5 (operator option 4b): the home `h1.intro__title` ended below the first screen at scroll 0 on short phones and in landscape (bottom 784 px at 375x667, 731 at 320x568, 614 at 844x390, 991 at 667x375) | `tmp/mobile/fix-d1/p/hero.mjs` (h1 box with its wave rule against `innerHeight`, the CTA, the painted crop of the source photo, A-14 by the layout lane's kit; controls at every size: the h1 pushed 900 px down reads below the fold, a planted box over the h1 is a hit, a planted crop reads x0 = y0 = 0): h1 bottom / screen 784.2 → 655.5 / 667, 730.7 → 557.6 / 568, 614.0 → 383.3 / 390, 990.9 → 384.5 / 375 (not fitted); 799.5 / 844, 769.4 / 800, 820.9 / 915, 831.1 / 932 unchanged; the CTA on screen at all 9 sizes; crop 4:3 (x 0.06-0.95, y 0.05-0.95 of the source) → every column, rows 0.11-0.89 (375x667), 0.24-0.76 (320x568, 844x390), 0.16-0.84 (667x375); A-14 0 hits on the home's 17 devices at 320x568, 375x667, 667x375, 844x390 and four 769-1023 px sizes; the hero toggle (motion on) inside the frame with its halo, 0 hits; no overflow on 149 pages at 7 sizes | B.4 short portrait `(max-width: 768px) and (max-height: 740px)` and landscape `(max-width: 1023px) and (max-height: 480px) and (orientation: landscape)` rules, B.5 top padding 20 px | operator: 667x375 cannot fit without changing the display type, the CTA or the landscape header (with OPEN-DECISIONS E's M-TOUCH-5 header, injected as a what-if, the h1 ends at 358.4 / 375) |
| I.149 | M-LOOK-13 (operator option 5b): the river's strands kept their desktop widths on phones (the 150 px glow 38 % of a 390 px screen): a pale stripe about 48 px wide on the left bank, a pale panel under the title-band arch, a stepped stack about 150 px wide entering the footer | `tmp/mobile/fix-d1/p/strands.mjs` (every path's drawn width by strand; control: a planted width read back): at 320 / 390 / 768 every strand 0.6 of the spec (glow 150 → 90 … body 18 → 10.8, light 1.6 → 0.96), the over copy the 18 px-or-less strands at 0.6; 844x390 and 1000x700 the spec widths on both builds. `p/river.mjs` (fixer A's, copied) on all 149 pages at 320 / 360 / 390 / 430 / 768: face zone 0, R3 143 of 143 photo and generated arches, seams 0, over copy outside the shape 0 (one 13-pixel read at 320 not repeated in 6 runs), A-13 lines identical to Old (10 pages / 179 lines at 320, the pre-existing left bank; 0 at 360-768); crops `tmp/mobile/fix-d1/shots/strands/pair-*-390.png` | 1.8: at `p` every strand drawn at 0.6 of its width; the over copy still takes the strands of 18 px or less by their spec width (B1) | none |
| I.150 | M-LOOK-14 (operator option 6b): on phones the arch sat 14 px below the full-width pane, leaving an empty band of river beside it (first content at 576 px on `/eye-care-services/` at 390x844) | `tmp/mobile/fix-d1/p/tb.mjs` and `p/tb-compare.mjs` on all 148 title-band pages at 320 / 360 / 390 / 412 / 430 / 768 (control: the arch pulled 200 px up covers pane text and is an A-14 hit): h1 line count and width (box and widest line) identical to Old on every page; pane text under the arch 0; A-14 arch hits 0; the first content (G5's first block and the first content line) earlier by 48 px (44.4 at 320) on 120 pages, 44.4 / 53.9 / 61 / 66 / 69.7 / 62 px on the 21 dated posts, 33 px on the 7 chip pages; face zone 0, R3 143 / 143, the over copy's top at least 75.2 px below the pane's bottom (B1) | B.21: at 768 px and below the band's bottom padding 0 (with an arch) and the arch's top margin `calc(-14px - min(34px, …))`, 70 px with a date row, 19 px with a position chip, capped so the bank's crest stays below the pane | operator: the auditor's estimate of 100-150 px is not reached; the arch can only take the free room under the h1's last line (wave rule row and padding, 35-36 px) without squeezing it (G5) |
| I.151 | Fixer A's open item (I.120): at 769-1023 px the river's `t` layout read the title route's `d` values, so the over copy crossed every arch at 0.13-0.63 of its height, the faces included; `t` also serves the locked 1024-1199 px | `tmp/mobile/fix-d1/p/river.mjs` on all 149 pages at 800x1280@2, 844x390@3, 1000x700@1, 1023x768@1 (fixer A's controls fired at each): face-zone geometry samples Old 80.6M / 80.1M / 78.8M / 78.7M, pixels 2.25M / 5.03M / 0.56M / 0.56M → 0 / 0 / 0 / 0; the over copy painted 0.82-0.93 of the arch (Old 0.13-0.63); R3 143 / 143 photo arches on both; the 5 plates crossed on Old, behind on the build; seams 0, outside the shape 0; A-13 identical to Old (one line at 844x390 on the home, on Old too). The desktop lock at 1100x800 and 1199x800 (and 5 more conditions) on all 149 pages: 0 differences | 1.8: layout `m` (769-1023 px) reads `m`, else `t`, else `d`; zones default `d t m p`. B.21: `t1` `m:104%,100%+90px`, `t2` `m:60%,100%+90px`; a plate's `d t` excludes `m` | none (plates: as I.120, until the portraits arrive) |
| I.152 | M-LAYOUT-11 at 769-1023 px (fixer C's open item, I.141): the side-by-side doctor blocks on `/our-eye-doctors/` kept their section padding, 175-219 px between a text pane and the next portrait | fixer C's `p/items.mjs` doctor (copied; controls: 64 px planted at 390 reads 152; the base padding re-planted on the build at 844x390, 1000x700 and 1023x768 reads Old's gaps): box gaps 204.6 / 211.2 → 117.5 / 124.2 (844x390), 208.5 / 185.9 → 128.5 / 105.9 (800x1280), 180.3 / 175.1 → 84.3 / 79.1 (900x900), 202.1 / 214.7 → 90.1 / 102.7 (1000x700, 1000x800), 210.3 / 218.8 → 94.7 / 103.1 (1023x768); the photo clears the pane above by 53-103 px with its 26 px parallax; 1024x768 and 1440x900, phones and the home's doctor sections unchanged; A-14 0 hits | B.10: `.band__inner > .doctor { padding-block: 24px }` up to 1023 px | none |
| I.153 | Found while fixing I.148: with the short-screen hero the frame's bottom sits at 74 % of a 383 px hero at 320x568, so the phone weave (`h1` `p:104%,66%` → `h2`) met only the frame's rounded lower-right corner: 49 changed pixels (2,530 on Old), R3's in-front crossing on the home's first two screens all but gone | `tmp/mobile/fix-d1/p/home-r3.mjs` (the hero frame and the Alumier card captured with the over copy shown and hidden; control: a planted 6 px path across the frame): hero over-copy pixels Old → build 2,530 → 1,960 (320x568), 4,649 → 4,709 (375x667), 9,114 → 11,075 (360x800), 11,228 → 12,608 (390x844), 9,981 → 10,630 (412x915), 13,633 → 14,160 (430x932), 0 → 86 (667x375), 16,403 → 12,685 (768x1024); the home's A-13 lines unchanged at the 8 phone sizes | B.16: `h1` `p:104%,58%` (the `d` value unchanged) | none |
| I.154 | M-TOUCH-3 (operator option 7b, fixer D2): below 1024 px the phone number of the location card (B.23, 131 pages), the visit block (F.8, 3 pages) and the footer NAP (B.19, 149 pages) was a 20-22 px tall inline link | Not measured one by one: the operator stopped the verification on 2026-10-07 (BUILD-NOTES 15.5). Built (`90c8838f`), 12 gates PASS, SOURCED; the stylesheet diff against D1's build adds exactly this block inside `@media (max-width: 1023px)` | `.contact a[href^="tel:"], .footer__nap a[href^="tel:"]` get `position: relative; white-space: nowrap` and an empty, transparent, absolutely positioned `::after` 44 px tall and as wide as the number (`top: calc(50% - 19px)` in the contact rows, `bottom: -.15em` in the footer), so no line, box or page height moves and the focus ring still outlines the number. A departure from B.0 rule 1 at these widths | the targeted checks (hit box, neighbour spacing, focus ring) are not run |
| I.155 | M-TOUCH-5 (operator option 8b, fixer D2): since A11Y-8 the header stopped sticking at 480 px tall and below, which also caught phones held in landscape: every header control left the screen once the page scrolled | Not measured one by one (BUILD-NOTES 15.5). Built, 12 gates PASS, SOURCED; the stylesheet diff adds exactly this block, whose query includes `(max-width: 1023px)` | `@media (max-height: 480px) and (min-height: 340px) and (orientation: landscape) and (pointer: coarse) and (max-width: 1023px)`: `html.js .site-header { position: sticky; top: calc(-1 * var(--topbar-h)) }` (the top bar scrolls away, the navbar sticks), the scroll padding and the I.79 focus guard restored, and outside `html.no-modal` a compact navbar (`padding-block: 4px`, a 110 px logo; about 52 px tall per the refuter's injection, 13.5-14 % of a 375-390 px screen). Zoomed desktops and mouse-driven short windows keep A11Y-8's rule | the A11Y-8 header matrix, the menu retap and the anchor jumps in landscape are not re-run on the final build |

---

## Verification record

Independent verification, 2026-10-02 01:06-01:55 (+08:00), by the verify stage. It used its own scripts under
`tmp/wf5a/verify/` (`lib.mjs`, a self-written HTML tokenizer and markdown splitter, plus one script per check). It did
not run any script of the contract stage, and it ran or wrote nothing in `src/`, `dist/`, `audit/` or another doc. No
browser was used: every statement below comes from the files, and rendered behaviour is labelled as such.

Inputs as read:
- this file as handed over: 2026-10-02 01:04, 3,377 lines, byte-identical to `tmp/wf5a/contract/COMPONENTS.draft.md`;
- DESIGN-SPEC (2026-10-01 16:53) and BUILD-NOTES section 5 (2026-10-02 00:18);
- the 149 models (00:25);
- the prototype's `index.html`, `interior.html` and `script.js`;
- the gates `tools/words-added.mjs` and `tools/heading-parity.mjs`;
- the usability judge's `make-inject.mjs`, `interact.mjs` and `scale.mjs`, with their data.

### The six checks (final file; each script fails when its planted positive control is applied)

| check | script | result | control |
|---|---|---|---|
| 1. Every component 3.1-3.31 and every 4.1 family has markup | `v1-coverage.mjs` | **PASS.** 31 / 31 components, each in B.n citing 3.n, with its own markup or a pointer to a section with markup. All 19 block rows of 3.31 and all 21 closed-set block types are in B.31. All 14 families have a G.1 and a C.8 row naming their frame (C.1, C.7 or B.16), and every block type each family's models use is named in that frame | B.13's markup deleted in memory: FAIL (1) |
| 2. Prototype class / id / `data-*` against H.1, H.2, 0.4, 0.10 | `v2-proto.mjs` (selectors, `classList` names, `dataset` keys and the ids `script.js` creates are read too) | **PASS** after the fixes: 252 classes (178 in H.1, 74 in H.2), 39 ids (18 kept, 21 in H.2), 13 `data-*` (9 kept, 4 in H.2). It **failed as handed over**: 5 ids created by `script.js` were in neither list (`rg-glow`, `rg-mid`, `rg-body` and the per-zone clips `cz*`, `co*`) | planted class, id and `data-*`: FAIL (3) |
| 3. Every tag+class combination in every model HTML field has a styling rule | `v3-census.mjs` | **PASS.** See the census note below the table | planted `p.planted-x` and `span[data-planted]`: FAIL (3) |
| 4. Every model field the contract names exists or is a declared P1-P7 addition | `v4-fields.mjs` (an alias table per section), `v4b-model-lines.mjs` | **PASS.** See the field note below the table | a renamed field (`chrome.logo.homeLabelX`): FAIL (1) |
| 5. Every Appendix A check that concerns markup is satisfiable | reading, plus `v5a-literal-text.mjs`, `v5b-linkonly.mjs`, `v5c-linkline.mjs` and the gate sources | **Six were not satisfiable as handed over; all six are fixed.** Two more were at risk and are fixed; five depend on a pipeline addition and are now marked open in I.F. See the table below | v5c reproduces D.6's link-line count exactly |
| 6. The site.js hook contract and the markup agree | `v6-hooks.mjs` | **PASS** in both directions. See the hook note below the table | renamed `data-carousel` in B.15: FAIL (3: both directions plus the 0.4 list) |

**Census note (check 3).** 1,081 markup strings sit in 18 model paths:
- 10 rendered paths: prose and callout `html`, `heading.html`, `items[].html` of six block types, `members[].html`;
- 2 derived views;
- `form.html`;
- 7 never-rendered paths: parsed form data (2), head JSON-LD, the Cherry embed snippet, and a `why` note that mentions
  `<title>`.

The rendered markup has 29 combinations and 15 attributes. Every one has a D.2 row whose four counts (rendered, pages,
with the derived views, per field) equal the census. The derived-only `h1` has its row. The form markup's 28
combinations and 31 attributes are all in E.2 with equal counts. No D.3 row is emitted. The census found nothing to
fix.

**Field note (check 4).** 552 brace tokens in sections 0-G:
- 291 field references, each resolved to a typed path of the 149 models' union schema (711 paths);
- 26 shape lists;
- 32 declared or computed values: P1 `srcset` and `image.crop`, P2 `head.scripts`, P4 `art`, P6 `video.poster`, the
  absent `notice` (I.24), the LCP values;
- 229 non-field tokens.

All 75 leftovers in the **Model:** paragraphs are element names, URLs, paths or literal values. Every key on the resolved
paths appears in BUILD-NOTES section 5, so the contract relies on no field that the pipeline's field list leaves out.

**Hook note (check 6).** Every class (69), `data-*` (26) and id (4) that section 1 names is printed by a markup block,
emitted by the model (the D.2 / E.2 rows), or declared as created by site.js. Every `data-*` in the markup is named in
section 1 or 0.4, and every template-set state of 0.3 is printed. A semantic review found two defects that the name match
cannot see; both are fixed (I.43):
- the CTA band hosts river anchor `q1` while it is itself `.rv`;
- 1.8 said "first children" where the band layers come first, and it kept the prototype's `zone.closest(sel)` lookup.

**Check 5, row by row.**

| check | as handed over | now |
|---|---|---|
| A-1 | not satisfiable: the "submenu" text node fails words-added on all 148 pages | fixed, I.41 (B.2, 0.9); open: I.6 (pipeline) |
| A-2, A-4 | no containment for the deliberate crossings (the prototype relied on `body { overflow-x: clip }`) | fixed, I.45 (A.3). The `clip` semantics are from CSS Overflow 3, not rendered here |
| A-3 | the two live maps load at page load | open: I.50 (DESIGN-SPEC against itself); the contract keeps Q-11's default |
| A-9 | not satisfiable: no 44 px rule for the address link (the judge measured 375x38), heading-only links or model link-only paragraphs, and no measurement rule for stretched links or radio rows | fixed, I.46 (B.0 target rule, D.6 link line: 9 on 7 models) |
| A-11 | not satisfiable: the hero toggle, inserted into the flow after `load`, moves the phone h1 | fixed, I.44 (1.9, B.4) |
| A-12 | not satisfiable: the 70 ms x 3 stagger plus the 480 ms entrance runs to 690 ms | fixed, I.42 (1.3) |
| A-13 | at risk: anchor geometry was not specified while the CTA band is `.rv` | fixed, I.43 (1.8); open: I.4 (P4: no arch and no phone crossing on 133 band models) |
| A-14 | satisfiable | open: I.11 (the glasses and the lens wait for `art.home`) |
| A-16 | not satisfiable: `.frame` zoomed on its own hover, with no focus twin (the arch, doctor photos, designer tiles, the unlinked callout) | fixed, I.47 (B.8) |
| A-17 | needs P3 | open: I.5 |
| A-21 | needs P1 | open: I.3 |
| A-23 | not satisfiable: the injected block is classless and was appended outside `div.prose.rich` | fixed, I.49 (D.8) |
| A-5 to A-8, A-10, A-15, A-18 to A-20, A-22 | satisfiable as written (A-7's home outline h1 · h2 · h3 · h2 · h3 · h4 was checked against the model levels; the targets of `aria-controls` and `aria-labelledby` exist; the fixed ids are unique per page) | unchanged |

### Other consistency checks

- `v7-facts.mjs`: 84 numeric claims of A-F recomputed from the models, all 84 equal. The control adds a planted model,
  and 19 then differ.
- `v7b-enhancers.mjs` reimplements D.6: lead 1, checklist panels 4, treatment runs 18 (75 sub-sections, 18 pages),
  two-column lists 0. Equal to D.6.
- **Completeness fixes with no new register id:**
  - C.7's hub blocks (`hub-intro`, `hub-callout`, the untitled panel, `cards--brand`, `hub-flow`, `band__panel`) are
    written out as markup;
  - B.27's hub doctor block is written out (its name heading is `doctor__tag`);
  - B.10 and B.21 now agree on where the placeholder plate sits in the arch: inside the figure, in place of the `img`;
  - 0.12 gains the P1 `image.crop` row;
  - H.1 gains `.link-line` and three corrected origin labels;
  - H.2 gains the 5 script-created ids;
  - the home route table's "first children" wording is aligned with 1.8.
- **Register:** I.1-I.50 with no holes and no duplicates, and every cited id is defined. All 931 table rows of sections 0-I have their
  header's cell count.

### The contract stage's claims

**Confirmed:**
- 31 components (plus B.0), 14 families, 149 models;
- 252 prototype classes, 178 kept and 74 dropped;
- full census coverage (30/30, 15/15, 28/28, 31/31);
- every count recomputed above.

**Corrected:**
- "0 prototype names unaccounted for": 5 ids created by `script.js` were unaccounted for.
- "every check passes": six Appendix A checks were not satisfiable as written (A-1, A-9, A-11, A-12, A-16, A-23).
- I.F named an open item for A-1 only; A-3, A-13, A-14, A-17 and A-21 now carry theirs.

**Not re-verified here:** BUILD-NOTES 5.9's recomputation (I.26).

### Labelled as not rendered

- The hero toggle's clearance from the glasses and from the phone weave stretch comes from B.4's geometry and the route
  table. A-13 and A-14 confirm it.
- The heading-link height of about 31 px at 390 is computed from `--step-3`.
- Whether the YouTube iframe of I.50 loads at page load depends on the browser's lazy distance.

### Upkeep

H.1 is generated by the contract stage's `build-doc.mjs`. Regenerating it would drop `.link-line` and the three origin
corrections unless the generator learns them. To re-run this record: `node tmp/wf5a/verify/<script>.mjs`, where every
check script accepts `--control`.
