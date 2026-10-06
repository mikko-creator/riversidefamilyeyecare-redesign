# Design spec: Riverside Family Eye Care redesign ("Riverlight")

Written 2026-10-01 by the design-panel synthesis stage. This is the spec the build follows for all 148 pages and
`dist/404.html`. It is binding where it says "must"; where it gives a recommended approach, the stated acceptance
check is what binds.

**Inputs read:** `docs/DESIGN-BRIEF.md` (binding), `docs/BRAND-SYSTEM.md`, `docs/SITE-ARCHITECTURE.md`,
`docs/IMAGE-INVENTORY.md`, `docs/FACTS-EVIDENCE.md`, `docs/BUILD-NOTES.md` (the page-model contract, section 5),
`docs/OPEN-DECISIONS.md`, `src/content/chrome.json`, the three `tmp/panel/*/CONCEPT.md`, the winner's code
(`tmp/panel/riverlight/{index,interior}.html`, `styles.css`, `script.js`), the three judges' verdicts and their evidence
files under `tmp/panel/_judge-*`, and the page models in `tmp/page-models/` (149 models). Seven screenshots were viewed.

**Where this spec and the evidence documents disagree on a fact, the documents win** (DESIGN-BRIEF rule). Every
copy rule of the brief still holds: words are verbatim, nothing is invented, real people stay real.

Companion: `docs/IMAGE-PLAN.md` (every generated and real image, the placeholders and the Higgsfield clip).

---

## 0. Winner, vote, grafts and defect fixes

### 0.1 The vote

Rule: the concept ranked first by the most judges wins; on a tie, the highest sum of totals across judges.

| judge (lens) | ranking | 1st place | riverlight | nightglow | irisbloom |
|---|---|---|---|---|---|
| Brand and aesthetic (6 criteria, max 60) | riverlight, irisbloom, nightglow | riverlight | 48 | 38 | 46 |
| Depth, motion and hover (5 criteria, max 50) | nightglow, riverlight, irisbloom | nightglow | 38 | 40 | 38 |
| Usability, accessibility, performance, scale (6 criteria, max 60) | riverlight, nightglow, irisbloom | riverlight | 50 | 44 | 41 |
| **first places** | | | **2** | 1 | 0 |
| sum of totals (scales differ; for the record) | | | 136 | 122 | 125 |

**Winner: Riverlight Aurora (`tmp/panel/riverlight/`), first on 2 of 3 judges.** There is no tie, so the tiebreak is
not needed; the sum of totals agrees (136 against 125 and 122).

### 0.2 Grafts from the runners-up

Each graft was flagged as graft-worthy by a judge. "Where" points to the section that specifies it.

| id | graft | from | flagged by | where |
|---|---|---|---|---|
| G1 | Sticky location/hours card on long-form pages, gated by `(min-width: 1024px) and (min-height: 860px)` | nightglow | brand, usability | 3.23 |
| G2 | Phone drawer as a native `<dialog>` opened with `showModal()` (page inert, Escape, focus return) | nightglow | usability | 3.2 |
| G3 | 44x44 dropdown toggles | nightglow | usability | 3.2 |
| G4 | CMS-agnostic flow rhythm `.prose > * + *` | nightglow | usability | 3.22 |
| G5 | Content-forward phone title band (breadcrumb, h1 and the first content block start within the first 700 px at 390x844) | nightglow | usability | 3.21 |
| G6 | Band seams drawn as the logo's teal-over-navy double stroke | nightglow | brand | 2.8, 3.4 |
| G7 | Treatment cards with a teal left border for runs of h3 sub-sections | nightglow | brand | 3.22 |
| G8 | News cards with a thin teal-to-violet top rule | nightglow | brand | 3.18, 3.28 |
| G9 | Iris-ring monogram plate as the portrait placeholder | nightglow | brand | 3.10 |
| G10 | Per-band scroll progress `--p` driving a teal-to-violet cross-fade inside bands | nightglow | depth | 2.8, 6.3 |
| G11 | Protrusion shadows larger than pane shadows | nightglow | depth | 2.6 |
| G12 | Editorial heading-left / copy-right layout for the Insurance band | nightglow | brand | 3.17 |
| G13 | Logo at the live sizes (180 px desktop, 145 px phone) | irisbloom | brand | 3.2 |
| G14 | Numerals set in a second face so the phone, dates and hours avoid the slashed zero | irisbloom | brand | 2.2 |
| G15 | Lavender `--tint-lav` nav pill plus a drawn underline on hover, focus and current | irisbloom | brand | 3.2 |
| G16 | Moving glare highlight on tilting cards, identical feedback on `:focus-within` with a 3 px ring | irisbloom | depth | 6.4 |
| G17 | Reduced motion switches tilt and lift transforms off; the video never receives a source | irisbloom | depth | 6.5 |
| G18 | Name chips under portraits (name plus position) | irisbloom | brand | 3.10, 3.27 |
| G19 | Kids' teal glasses cut-out as a family cue on the Back-to-School callout (optional, budgeted) | irisbloom | brand | 3.9, IMAGE-PLAN |
| G20 | Compact chrome so the operator's 1280x585 first screen holds the hero, its CTA and the h1 | irisbloom | usability | 2.4, 3.4 |
| G21 | WebP with `srcset`/`sizes` for every raster | irisbloom | usability | 4.3 (P1), 7 |

Riverlight's own graft-worthy items stay as the core of the design: the logo-wave heading rule and wave bullets, the one
continuous river drawn under and over the surfaces, the white title card with an arch-framed on-palette image, the
opaque paper article card with breakout figures, the review panel overlapping the staff photo, the navy glass CTA,
the six-tier parallax table, the static SVG decoration (about zero idle CPU), template-level % anchors, the navy
offset focus ring on teal buttons and the drawer focus model.

**Considered and not grafted:**
- Nightglow's alternating night/day bands: they put 24.7% dark pixels on the home against 5.4% live and read cosmic,
  which BRAND-SYSTEM section 4 steers away from. The depth they buy is kept another way: banks drawn with the logo
  double stroke (G6), larger crossings (D4) and deeper foreground shadows (G11).
- Irisbloom's iris-dot heading rule: one heading signature only (the wave rule). The iris ring moves to the
  placeholder plate (G9).
- Irisbloom's round lens hero, almond frames and pastel orbs: the brand judge counted 29 circular elements and
  called the orbs close to generic blobs; Irisbloom also had the highest idle cost (21 infinite animations).
- Irisbloom's pointer-following hero photo: extra pointer work for little gain.
- Nightglow's near plane moving slower than the page (0.91-0.95x): the opposite of what its occlusion says.

### 0.3 Defects found in the winner, and their fixes

Every defect the three judges found in Riverlight, plus the designer's own known weaknesses. Each fix has an
acceptance check; the check list is consolidated in Appendix A.

| id | judge | defect (evidence) | fix | check |
|---|---|---|---|---|
| B1 | brand | Hard 1 px clip edge in the interior title weave: the in-front river zone is a rectangle, so a vertical edge cuts the arch frame between x=1229 and 1230 at 1440x900 (red 191 to 166 at y=560, 186 to 116 at y=600; control row y=640 steps by 1). At 390 a pale rectangular notch sits over the article card's corner (`seam-sample.json`, `view/detail-zoom.png`) | The over copy of the river is no longer clipped by a rectangle. It is drawn only for an **arc-length stretch** of the river (between two named anchors whose points lie outside the occluder) and clipped to the **occluder's own rounded shape**. The over copy draws only the narrow strands (width 18 px or less); the wide glow and mist strands exist only in the under copy. The over copy may only cross an image frame or a plate, never a text-bearing surface (2.8, 5.3) | Seam scan (A-13) |
| B2 | brand | Raw shortcode `[account get='name']` visible in the first news excerpt (prototype `index.html` line 387) | Render the excerpt from the page model, which already resolves it ("Riverside Family Eye Care", `docs/OPEN-DECISIONS.md` A.2). Never hand-copy source HTML into a template | Shortcode grep (A-20) |
| B3 | brand | Atkinson Hyperlegible Next's slashed zero in the top-bar phone pill, footer NAP, post dates and sidebar hours ("239-5Ø0-2Ø2Ø", "339Ø5", "9:ØØ AM"; `probe-digits.json`) | Digits 0-9 come from a second face, **"RFEC Figures"** (Lexend, OFL, subset to the ten digits, `unicode-range: U+0030-0039`), placed first in the site font stack. Checked this session with a WOFF2 parser on the shipped roman file: its GSUB features are only `ccmp frac locl pnum tnum` (no `zero`, `salt`, `ssNN` or `cvNN`), so no plain zero can be selected; among the single, multiple, alternate and ligature lookups only `tnum` touches the zero glyph, and the same parser finds nothing for "a" (the control) | Digit face probe (A-18) |
| B4 | brand | Logo rendered 153 px wide at 1440 and 124 px at 390, against the live 180 and 145 (about 15% less presence) | Logo at **180 px** wide from 769 px up and **145 px** at 768 px and below (G13). The files ship byte-identical (3.2) | Logo probe (A-17) |
| B5 | brand | A faint horizontal seam crosses the Alumier card's top strip (home, `view/detail-zoom2.png`): the rectangular zone cut the over copy's wide glow strands, and the services band's lower edge and its shadow show as a step beside the card | Same fix as B1 for the over copy. Plus the band-edge rule: a band's lower edge must end under the card that overlaps it, or fade to transparent over at least 80 px; no band edge or band shadow may be visible as a straight step within 120 px of an overlapping card (3.7) | Seam scan (A-13) |
| B6 | brand | Long measure: about 91 characters per line at 17 px in the interior article at 1440 | Prose measure **60-75 characters per line**: text children of `.prose` get `max-width: var(--measure)` (68ch) and the prose size rises to 17-19 px (`--step-prose`). Figures and video may break out wider (3.22) | Measure probe (A-19) |
| D1 | depth | 1280x585 feedback loop with no scrolling: `script.js` writes `navbar.offsetHeight` into `--navbar-h`, which sets the navbar's own `min-height` and the hero frame's `max-height`; a ResizeObserver on `#page` re-runs it, so the navbar grows 76 to 133 px over about 13 s, the hero copy creeps 247 to 276 px and the hero frame shrinks 400 to 300 px (`p1c-riverlight-loop.json`, `sheets/riverlight-op-load-vs-24s.png`) | **No measured value may feed the size of the thing measured.** Chrome heights are static tokens per breakpoint (`--chrome-h`, 2.4); the navbar's height comes from its content (logo plus padding), never from a custom property that script writes. Script may write measured values only into properties used for `scroll-padding-top` and sticky offsets. The river's ResizeObserver redraws the river only, debounced 150 ms, and only when `#page` width changes or its height changes by more than 2 px | Stability probe (A-11) |
| D2 | depth | The same loop runs under `prefers-reduced-motion` (navbar 78 to 133 px over 10 s) | Same fix; the stability probe runs with and without reduced motion | Stability probe (A-11) |
| D3 | depth | Trio photos sit 118 px above their own reveal boxes: at 1280x585, y=4680, their reveal parent's top is at 582.5 px, below the observer line at 549.9 (`rootMargin -6%`), so photos visible from 464.5 px stay at opacity 0 | (1) A protruding element is **never inside a reveal-gated element**; the photo is a sibling of the revealed text block. (2) Reveal observers use `rootMargin: '0px'` (a negative bottom margin is a dead band). (3) The first-screen test and the sweep use the painted bounds of the element (6.1) | Hidden-while-visible scan (A-12) |
| D4 | depth | Several crossings are small and low-contrast: service photos break out by 29 px, the cataract lens enters Eye Emergencies by 21 px, most seams are pastel on white | Minimum crossing **48 px at 1024 px and up, 32 px at 768 px and below**, for every listed protrusion; the cataract lens crosses by at least 64 px. Every band edge a protrusion crosses is drawn as a bank with the logo double stroke (G6), so the crossing reads | Crossing probe (A-14) |
| D5 | depth | The Envision promo hover is a 3% zoom only; the trio photo zoom has no keyboard equivalent | Promo: lift 6 px, `--sh-3`, a 4 px teal glow ring and zoom 1.04 on hover and on `:focus-visible`. Rule for every component: each hover effect has a `:focus-visible` or `:focus-within` twin (6.4) | Hover/focus parity (A-16) |
| D6 | depth | Shadow scale does not peak on the nearest plane: the 1.12x cut-out glasses carry a smaller drop shadow (blur 14) than cards (40) and breakout frames (60) | Elevation follows the plane: the largest blur goes to the nearest plane: cut-outs `--sh-fore` blur 88 px, breakouts `--sh-4` 84 px, raised panes `--sh-3` 60 px, cards `--sh-2` 40 px (2.6) | Shadow order probe (A-15) |
| U1 | usability | At 1280x585 the home h1 sits at y 666-710, below the fold; on the interior the first screen is only the title card and prose starts at y 751 | Short-desktop mode `(min-width: 1024px) and (max-height: 720px)`: compact chrome (G20), height-aware hero and title band (2.4, 3.4, 3.21). Targets: the home h1 fully visible at load at 1280x585; on long-form pages the h1 and the start of the first content block visible at load; at 390x844 the first content block starts at y 700 or less (G5) | First-screen probe (A-10) |
| U2 | usability | Undersized desktop targets: submenu toggles 28x44, top-bar pills 205x40 and 161x40, breadcrumb links 39x25 and 118x25 | Toggles 44x44 (G3), pills 44 px tall, breadcrumb links `min-height: 44px` (inline-flex). Every control that is not an inline text link is at least 44x44 at every width | Target probe (A-9) |
| U3 | usability | Every interior page loads the hero light loop in its title band (187 KB at 1440, 249 KB at 390 DPR 3); interiors weigh 491 KB desktop and 590 KB phone against about 290 KB for the other concepts | The loop plays on the **home hero only**. Title bands use a static still (the loop poster, 20-30 KB) with the same parallax and fade (2.8 A6) | Weight budget (A-21) |
| U4 | usability | Largest JS (22.2 KB, 7.2 KB gzipped); the home river hangs on 37 hand-placed anchors driven by 99 `.ra-*` CSS rules; the two river SVGs duplicate the gradient ids `rg-glow`, `rg-mid`, `rg-body` | Route data lives in the templates as data attributes, not CSS rules: the home route is one table in `home.mjs`; every other family uses a template-level route (2.8 A2). Gradient ids are unique per SVG (`ru-*` under, `ro-*` over). JS budget 10 KB gzipped | Duplicate-id check (A-8), JS budget (A-21) |
| U5 | usability | Scroll timing noisy on the 1440 home (3, 4 and 34 frames over 33 ms in three runs; inconclusive, headless) | Fewer backdrop filters: at most 6 blurred surfaces intersect any viewport; post cards and paper panes are opaque; no `mix-blend-mode` on the hero video (the grade is baked into the clip, IMAGE-PLAN 7) | Jank sample (A-22) |
| U6 | usability | Forms, tables and blockquotes unstyled (all three concepts): inputs at 13.3 px Arial 177x21, radios 13x13, table cells padded 1 px; a pasted URL overflows the 308 px phone column by 25 px | Full prose element set and form markup styled (3.22, 3.25); `.prose { overflow-wrap: break-word }` and `.prose a { overflow-wrap: anywhere }` | Injected-CMS page (A-23) |
| U7 | usability | The paper card's margins narrow the phone prose column to 308 px (358 px in the others); 2 long paragraphs are centred on the home (8 lines at 1440) | At 767 px and below the article card is full-bleed (no side margin, radius 0, inner padding = the gutter), giving a 358 px column at 390. No body paragraph longer than 3 lines is centred at any width (intro and insurance blocks are left-aligned) | Phone column and centred-text probe (A-19) |
| R1 | designer | Real-device frame rate unmeasured; rAF fell to 15-20 fps while the video and river started | Perf rules (7); the river is built after `load` plus one idle callback; a real-device check stays an open item (9) | A-22, Q-14 |
| R2 | designer | The river needs JS and about 40 tuned anchors | Template-level routes (2.8 A2); without JS there is no river and nothing else changes | Route gate (A-13) |
| R3 | designer | On phones the over/under weave is subtle | Each template must show at least one in-front crossing within its first two phone screens (home: the hero frame or the Alumier card; interiors: the arch) | Seam scan (A-13) |
| R4 | designer | The hero light is a recoloured stand-in clip with banding in the light greys | A purpose-made Higgsfield clip on the brand ramp (IMAGE-PLAN 7) | IMAGE-PLAN checks |
| R5 | designer | The Nelson text pane is very tall next to its plate at 1280x585, so the plate scrolls in late | At 1024 px and up, when a doctor text pane is taller than the viewport, the portrait column is `position: sticky` (3.10) | First-screen probe on the section (A-10) |
| R6 | designer | Rim glints on the generated lens judged refraction, not marks; a second reviewer should confirm | Re-review at 400% before shipping; Kontext edit if any glint reads as a mark (IMAGE-PLAN 2) | IMAGE-PLAN review |
| R7 | designer | The regraded video carries its AI label only as a container comment | Keep the comment and description tags (make-loop), record it in `audit/generated-images.json`, give the poster an XMP label | IMAGE-PLAN 7 |

---

## 1. Concept

**A daylight site with one river of light.** Morning light falls on a white-to-pale-aqua ground. Through it runs one
river: the logo's teal-over-navy wave grown into a soft aurora ribbon. On the home it starts as a slow film of
brand-coloured light behind the hero, then becomes a drawn ribbon that comes in from the right bank, passes **behind**
the frosted service cards, crosses **in front of** the Alumier card's corner, keeps to the banks past the doctors, flows
along the lavender band under three stepping-stone photos and settles into the navy footer as a horizon line. On every
long-form page it enters the title band, passes in front of the arch-framed image, runs down the empty sidebar column
and settles into the footer.

The design rests on six ideas:
1. **Daylight first.** Dark pixels stay near the live site's level (Riverlight measured 4.7% against 5.4% live). Navy
   carries the type, teal and aqua carry the light. Deep navy appears only in the top bar, the CTA band and the footer.
2. **The brand gives the light its shape.** The river is the logo's double stroke and the practice's name. Headings carry
   the source's short teal underline, redrawn as the logo wave (`.wave-rule`). Lists carry wave bullets.
3. **Depth by occlusion, not blur.** Three planes on every template (field, surfaces, foreground). The river is drawn twice,
   under the surfaces and over chosen frames, so it weaves. Photos break out of plates and cross band edges.
4. **Light has a direction.** The light comes from the upper left: shadows fall down and to the right, the river's white
   highlight thread leans up-left, glass highlights sit on top edges.
5. **Calm motion.** Reveals rise 26 px once and release; planes move at their own rates; the aurora field shifts from dawn
   teal to day sky to dusk lavender as the reader goes down the page.
6. **Every word is the practice's.** The page model is the only source of visible text (BUILD-NOTES 5, invariant 1).

---

## 2. Tokens

All tokens live at the top of the theme stylesheet (`src/styles/riverlight.css`, 4.3). Values in this section are final
unless marked "tune".

### 2.1 Palette

Brand anchors and the aurora extension are BRAND-SYSTEM 5.3, unchanged. Ratios are WCAG 2.x; "BRAND" means the ratio
is in BRAND-SYSTEM 5.6; the others were computed this session (`contrast.mjs`, controls white/black 21.00 and
`#767676` on white 4.54).

| token | hex | role | key contrast pairs |
|---|---|---|---|
| `--navy-700` | `#1e2c70` | headings, nav, statement, secondary buttons, top bar | on white 12.73, on `--ground` 12.18 (BRAND), on `--aqua-50` 12.12, on lavender band 7.21 (BRAND), on `--tint-lav` 10.90 |
| `--navy-900` | `#172257` | nav hover text, secondary button hover | white on it 14.97 (BRAND); on `--tint-lav` 12.81 |
| `--navy-950` | `#11183e` | footer ground, deep aurora base | `--navy-100` on it 14.30, `--teal-200` 10.65 (BRAND) |
| `--navy-100` | `#e9eaf1` | secondary text on navy | on the deep aurora's lightest point 7.99 (BRAND) |
| `--teal-700` | `#03756d` | primary buttons, links, icons, focus ring on light, rules | white on it 5.57; on white 5.57; on `--aqua-50` 5.30; on `--tint-teal` 5.01; on light glass worst 4.64 (BRAND). Never text on navy (2.29) or on the lavender band (3.15) |
| `--teal-800` | `#025b55` | link and button hover; links on glass that may sit over a photo | white on it 7.98; on `--tint-teal` 7.19; on glass-image over black 4.97 (BRAND) |
| `--teal-500` | `#13a89e` | logo teal: river strands, rules, decorative only | 2.95 on white: never text or icons on light |
| `--teal-200` | `#95d8d3` | accents, links and focus ring on navy | on `--navy-950` 10.65, on the navy CTA glass 5.92 |
| `--lav-300` | `#bec2d7` | the source's lavender band | `--ink-700` 5.39, `--ink-900` 7.37, `--navy-700` 7.21 on it (BRAND) |
| `--ink-700` | `#464451` | body text | on white 9.52 (BRAND), on `--aqua-50` 9.06, on `--tint-teal` 8.57 |
| `--ink-600` | `#5c5a66` | secondary text, captions | on white 6.75; never on the lavender band (3.82) |
| `--ink-900` | `#313039` | strong text, text on the lavender band | on white 13.02 (BRAND) |
| `--sky-500`, `--violet-500` | `#349fc9`, `#9485d1` | aurora supports, decorative only | 3.02 and 3.21 on white |
| `--paper` / `--ground` | `#ffffff` / `#f9fafb` | surfaces / page ground | |
| `--aqua-50` | `#f3fbfa` | lower end of the day ground: `color-mix(in srgb, #13a89e 5%, #fff)` (recomputed: `#f3fbfa`) | see above |
| `--tint-teal`, `--tint-sky`, `--tint-lav`, `--tint-violet` | `#e7f6f5`, `#ebf5fa`, `#ecedf3`, `#f4f3fa` | panels and pills (text allowed) | `--ink-700` 8.15 worst, `--teal-700` 4.77 worst (BRAND) |
| `--field-teal`, `--field-sky`, `--field-lav`, `--field-violet` | `#b3e3e0`, `#bee0ee`, `#bec2d7`, `#ddd8f0` | aurora pools; no direct body text | `--navy-700` large text on them 9.08-9.19 (placeholder plates) |
| `--glow-teal`, `--glow-sky`, `--glow-violet` | `#124a60`, `#1d476f`, `#3f3e71` | deep aurora pools on navy | white on the lightest overlap 9.58 (BRAND) |
| `--line-input` | `#8c8b93` = `color-mix(in srgb, #464451 62%, #fff)` | form field borders (non-text) | 3.37 on white, 3.23 on `--ground` |
| `--alert-700` | `#941221` (SOURCE: the one red heading on `/our-eye-doctors/`) | required markers, error text | 8.87 on white, 8.49 on `--ground` |
| `--shade` | `17 24 62` | every shadow colour, `rgb(var(--shade) / a)` | |

Painting rules from BRAND-SYSTEM 5.5 stay in force: pools are opaque tokens fading to transparent, never stacked
translucent base colours or blend modes; text never sits on a pool.

### 2.2 Fonts and files

| family | file (theme folder `src/theme/fonts/`) | source | use |
|---|---|---|---|
| Atkinson Hyperlegible Next, roman, variable 200-800 | `atkinson-next-latin.woff2` (33,996 bytes) | copy from `tmp/panel/riverlight/fonts/` (Google Fonts CSS API, SIL OFL 1.1) | all text; preload |
| Atkinson Hyperlegible Next, italic, variable 200-800 | `atkinson-next-italic-latin.woff2` (37,644 bytes) | same | `em`, `i`, `cite`; no preload (fetched only when used) |
| RFEC Figures (Lexend, variable 300-700) | `rfec-figures.woff2`, digits only, target 8 KB or less | Google Fonts CSS API with `text=0123456789` (OFL); fallback: subset `tmp/panel/irisbloom/fonts/lexend-latin.woff2` | digits 0-9 everywhere (B3, G14); preload |

```css
@font-face { font-family: "RFEC Figures"; src: url("../theme/fonts/rfec-figures.woff2") format("woff2");
  font-weight: 300 700; font-display: swap; unicode-range: U+0030-0039; }
:root { --font: "RFEC Figures", "Atkinson Hyperlegible Next", Verdana, "Segoe UI", system-ui, sans-serif; }
```

Why: Atkinson Hyperlegible Next was drawn by the Braille Institute for low-vision readers, which an eye-care practice
can stand behind, and keeps Verdana's wide, open proportions (Verdana is the only measured face of the live site and stays
the fallback). Lexend digits are open and plain-zeroed, so phone numbers, ZIP codes, hours and dates read as figures, not
code. The wordmark is never set in type: the logo file is the only wordmark.

### 2.3 Type scale (390 to 1440)

px values computed this session (`scale.mjs`). `vw` includes the scrollbar (1280 at the operator view).

| token | definition | 390x844 | 1280x585 | 1440x900 | use |
|---|---|---|---|---|---|
| `--step--1` | `clamp(.84rem, .81rem + .12vw, .9rem)` | 13.4 | 14.4 | 14.4 | captions, dates, legal bar, review meta |
| `--step-0` | `clamp(1rem, .97rem + .15vw, 1.0625rem)` | 16.1 | 17.0 | 17.0 | UI text, cards, sidebar |
| `--step-prose` | `clamp(1.0625rem, 1rem + .25vw, 1.1875rem)` | 17.0 | 19.0 | 19.0 | long-form prose (B6) |
| `--step-1` | `clamp(1.13rem, 1.06rem + .32vw, 1.3rem)` | 18.2 | 20.8 | 20.8 | lead text, card titles, intro paragraph |
| `--step-2` | `clamp(1.32rem, 1.16rem + .7vw, 1.72rem)` | 21.3 | 27.5 | 27.5 | h3, callout titles, lead paragraph |
| `--step-3` | `clamp(1.62rem, 1.32rem + 1.35vw, 2.45rem)` | 26.4 | 38.4 | 39.2 | h2 section titles, home h1 |
| `--h1-band` | `min(clamp(2rem, 1.4rem + 2.6vw, 3.5rem), max(2rem, 8.5vh))` | 32.5 | 49.7 | 56.0 | interior h1 in the title band |
| `--display` | `clamp(2.5rem, min(5.9vw, 9.6vh), 5.6rem)`; at 768 and below `clamp(2.5rem, 10.6vw, 3.6rem)` | 41.3 | 56.2 | 85.0 | home hero statement |

Weights: body 400, UI labels 600, headings 650, strong 700, the hero statement 340 for the first word and 720 for the rest.
Line heights: body 1.65, prose 1.7, headings 1.14, band h1 1.06, statement 0.98. Letter spacing: headings -0.012em,
band h1 -0.025em, statement -0.03em, eyebrows (dates) +0.04em uppercase. `text-wrap: balance` on headings,
`text-wrap: pretty` on paragraphs.

Long-h1 classes (set by the template from the h1's character count, deterministic): `h1--long` at 56 characters or more
caps the band h1 at 2.75rem; `h1--xlong` at 80 or more caps it at 2.3rem. Target: no band h1 above 3 lines at 1280 or
5 lines at 390 (A-10 samples the 10 longest h1s).

### 2.4 Space, layout and breakpoints

| token | value |
|---|---|
| `--gutter` | `clamp(16px, 4vw, 48px)` |
| `--maxw` | `1200px` content width (container = maxw + 2 gutters) |
| `--measure` | `68ch` |
| `--space-section` | `clamp(64px, 8vw, 120px)` vertical section padding (tune per section) |
| `--side-w` | `340px` sidebar at 1200 px and up, `300px` from 1024 to 1199 |
| `--arch-w` | `clamp(240px, 24vw, 340px)`; `300px` maximum when the arch holds a portrait (IMAGE-INVENTORY 2.4) |
| `--arch-cross` | `clamp(160px, 17vw, 240px)` how far the arch crosses the title band's bank |
| `--al-overlap` | `clamp(76px, 7vw, 96px)` Alumier card into the services band (one token feeds both the crossing and the reserve) |
| `--hero-tuck` | `clamp(84px, 11vh, 124px)` how far the intro card climbs over the hero bank (`120px` in short-desktop mode; 70 px at 768 and below); the hero's bottom padding is derived from it |
| `--svc-break` | `clamp(48px, 5vw, 64px)` service photos above their cards (D4) |
| `--topbar-h` | static: `44px` at 1200 px and up; content height below (the address wraps) |
| `--chrome-h` | static per breakpoint, never measured at runtime: `137px` (top bar 44 + navbar 93) at 1200 px and up; from 769 to 1199 and at 768 and below, the rendered chrome height measured once during QA and frozen into the token (tune). Used by the hero and title-band height maths |
| `--navbar-h` | written by script for `scroll-padding-top` and sticky offsets only (D1) |

Breakpoints (viewport width, scrollbar included):

| range | what changes |
|---|---|
| 1200 px and up | full desktop nav on one row (verify it fits with 44 px toggles; if not, raise to the smallest width that fits, never above 1280, A-9) |
| 769 to 1199 | desktop logo (180 px), the top-bar pills (as at source), the menu button and the drawer; two-column hero; card grids at two columns |
| 768 and below | the source's mobile header (145 px logo, two round action buttons, the menu button); top-bar pills hidden as at source; single-column layouts |
| 420 and below | statement and buttons go full width |
| short desktop: `(min-width: 1024px) and (max-height: 720px)` | the operator view (1280x585, real 15 px scrollbar, clientWidth 1265, DPR 1.5): compact hero and title band (3.4, 3.21) |

Sizes the build must sweep: 360x740, 390x844, 768x1024, 1024x768, 1024x600, 1280x585 (real scrollbar), 1280x650,
1366x657, 1440x900, 1536x730, 1920x1080. Width alone misses height-driven faults.

### 2.5 Radii

`--r-s 12px` (chips, inputs, small media), `--r-m 18px` (card media, FAQ items), `--r-l 26px` (cards, panes, frames),
`--r-xl 38px` (hero frame, doctor plates, CTA panel), `--r-pill 999px` (buttons, pills), arch frame
`999px 999px var(--r-xl) var(--r-xl)`.

### 2.6 Elevation

Light from the upper left, so offsets are positive x and y. Elevation follows the plane (D6, G11).

| token | value | plane |
|---|---|---|
| `--sh-1` | `0 1px 2px rgb(var(--shade)/.06), 4px 8px 22px -10px rgb(var(--shade)/.18)` | resting paper (2) |
| `--sh-2` | `0 2px 4px rgb(var(--shade)/.06), 10px 18px 40px -16px rgb(var(--shade)/.26)` | glass cards, frames (2) |
| `--sh-3` | `0 4px 10px rgb(var(--shade)/.08), 18px 30px 60px -20px rgb(var(--shade)/.34)` | hover, raised panes (2) |
| `--sh-4` | `0 6px 14px rgb(var(--shade)/.10), 24px 40px 84px -24px rgb(var(--shade)/.40)` | breakout photos and plates (3) |
| `--sh-fore` | `drop-shadow(24px 44px 88px rgb(var(--shade)/.26)) drop-shadow(4px 8px 8px rgb(var(--shade)/.20))` | transparent cut-outs (3); the largest blur and offset on the page, plus a tight contact shadow |

`filter: drop-shadow` sits on static cut-outs only and is never animated.

### 2.7 Glass and surface recipes

| recipe | fill | blur | border / highlight | used on | text |
|---|---|---|---|---|---|
| `glass-nav` | `linear-gradient(160deg, rgb(255 255 255/.90), rgb(255 255 255/.80))` | `blur(18px) saturate(1.5)` | bottom 1 px `rgb(var(--shade)/.08)` | sticky navbar, dropdown panels (.96/.92) | navy 11.48 worst (80% white over `--field-lav`) |
| `glass-card` | `linear-gradient(160deg, rgb(255 255 255/.88), rgb(255 255 255/.80))` | `blur(20px) saturate(1.4)` | 1 px `rgb(255 255 255/.7)`, inset top highlight | intro card, service cards, title pane, review panel, Alumier panel | body `--ink-700`; links `--teal-700` over the field, `--teal-800` where the pane overlaps a photo |
| `glass-navy` | `linear-gradient(160deg, rgb(30 44 112/.95), rgb(30 44 112/.90))` | `blur(20px) saturate(1.3)` | 1 px `rgb(190 194 215/.22)`, inset `rgb(255 255 255/.16)` | CTA band panel | white 9.53, `--navy-100` 7.94, `--teal-200` 5.92 worst |
| `paper` | `--paper` | none | 1 px `rgb(var(--shade)/.06)`, `--sh-1` | article card, doctor text, callouts, sidebar location card | |
| `frost-solid` | `rgb(255 255 255/.94)` | none | as paper | post cards, child-page cards, team cards | `--ink-700` 9.21, `--teal-700` 5.39 worst |
| `tint-panel` | `linear-gradient(150deg, var(--tint-teal), var(--tint-sky))` | none | none | checklist panels, blockquote | `--ink-700` 8.57, `--teal-700` 5.01 |

Every blurred recipe has `@supports not (backdrop-filter: blur(1px))` fallbacks: white `.96`, navy `1`. At most 6 blurred
surfaces may intersect a viewport at once (U5). Contrast is finally judged on rendered pixels (A-5), because
`saturate()` is not modelled (BRAND-SYSTEM 5.7).

### 2.8 Aurora recipes

Every layer is either static or animated through `transform` and `opacity` only. No animated `filter`, no `blur()` on
large layers, no `mix-blend-mode`, no infinite CSS animation.

**A1. The field (plane 0, every page).** `div.field` fixed at `inset: -12vh 0`, `z-index: -1`, three layers of radial
gradients (Riverlight's values):
- dawn: `radial-gradient(48% 40% at 0% 6%, rgb(179 227 224/.62), transparent 72%), radial-gradient(40% 36% at 100% 26%, rgb(190 224 238/.48), transparent 72%)`;
- day: `radial-gradient(44% 40% at 100% 10%, rgb(190 224 238/.55), transparent 72%), radial-gradient(44% 42% at 0% 88%, rgb(179 227 224/.45), transparent 72%)`;
- dusk: `radial-gradient(44% 40% at 0% 14%, rgb(221 216 240/.62), transparent 72%), radial-gradient(42% 40% at 100% 84%, rgb(190 194 215/.34), transparent 72%)`.

With page progress `p = scrollY / (scrollHeight - innerHeight)`: `dawn = 1 - smooth(.08,.42,p)`,
`dusk = smooth(.55,.9,p)`, `day = clamp(1 - dawn - dusk, 0, 1)`; all three `translate3d(0, -6p vh, 0)`. Written once per
animation frame, only while scrolling. This is the site-wide scroll-linked aurora shift.

**A2. The river (planes 1 and 3).** One ribbon, drawn once into two absolutely positioned SVGs inside `#page`:
`svg.river--under` (`z-index: 1`, between band backgrounds and surfaces) and `svg.river--over` (`z-index: 3`).
- **Geometry:** a centripetal Catmull-Rom spline through the route anchors, sampled every 10 px.
- **Strands** (the softness is a stack of translucent strokes; no blur filter): glow 150 px at .16, glow2 96 px at .20,
  mist 56 px at .13, mist2 34 px at .15, body 18 px at .24, core 8 px at .30, logo teal `#13a89e` 2.4 px at .85 and navy
  `#1e2c70` 1.6 px at .50 braided by a sine (offsets -9 and +9 px, amplitude 5, period 170), and a white highlight thread
  1.6 px at .90 offset toward the upper left.
- **Colour by depth:** the glow, mist and body strokes take vertical gradients (in user space over the page height)
  running teal, sky, violet, teal, sky and ending at `--teal-200` in the footer, so the light changes as the reader goes
  down. Gradient ids are `ru-glow`, `ru-mid`, `ru-body` in the under SVG and `ro-*` in the over SVG (U4).
- **Over copy (the weave):** for each weave zone, the template names an occluder (a frame or a plate, never a text
  surface) and two route anchors `a` and `b` whose points lie outside the occluder. The over SVG draws only the river
  stretch between `a` and `b`, only the strands of 18 px or less, inside a `clipPath` that is the occluder's own
  border-box with its border radius (an arch uses a path). Outside the occluder the under copy shows, so the two copies
  meet exactly at the frame's real edge and no seam can appear (B1, B5).
- **Routes:** the home route is one table in `home.mjs`: per anchor, the host section, and an `x,y` per layout class
  (desktop, tablet, phone), where `x` is a percentage of the section width, `L` (left bank, -1.6%), `R` (right bank,
  101.6%), or `C+n`/`C-n` (container edge plus or minus n px), and `y` is a percentage of the section height or px from
  its top. It is emitted as `<i class="ra" data-ra="…">` and resolved by script per current breakpoint. Every other family
  uses a template route: title band (enter right bank at 58%, cross in front of the arch's lower edge, leave at the band's
  bottom-left), article wrapper (left bank at 6% and 30%, then down the sidebar column from 42% to 97%), CTA band (centre),
  footer horizon (three anchors 36-46 px below the footer top). Builder hubs keep to the banks between their sections.
- **Clearances:** the river's centre line keeps 40 px from any text line that is not on a surface (A-13); routes cross
  sections only in padding gaps of at least 96 px with no text.
- **Redraw:** after `load` plus one idle callback, then only on a width change or a height change above 2 px (debounced
  150 ms). Drawing measured 43 ms on the prototype home and 12 ms on the interior. Under reduced motion the river is drawn
  as usual; it never animates in any mode.

**A3. Hero light (home only, plane 0).** The Higgsfield loop (IMAGE-PLAN 7) behind the hero, poster first. Masked soft on
all sides (`mask-image` gradients), no blend mode: the grade is baked into the clip. Moves `translateY(0.3 * scrollY)`
(screen speed 0.7) and fades to 0 by `1.1 * innerHeight`.

**A4. Light bands.** Static gradients: services band `linear-gradient(180deg, #e3f4f3, #e8f3f8 55%, #eaf1f7)` with a
wide-radius top (`50% 50% 0 0 / clamp(28px, 4vw, 60px)`), Eye Emergencies band
`linear-gradient(180deg, var(--tint-sky), #eef6f9 60%, rgb(238 246 249/0))`, lavender bands `--lav-300` flat. Each band
has one `::after` layer (a violet-leaning version of its gradient) whose opacity is `calc(var(--p) * .55)`, where `--p` is
the band's own progress through the viewport (0 entering, 1 leaving), written per frame only for bands in view (G10).

**A5. Deep aurora.** The footer and the CTA band use BRAND-SYSTEM 5.3 `.aurora-deep` (four glow pools on `--navy-950`),
static. The footer carries the same `--p` overlay as A4 (a glow-violet pool rising).

**A6. Title-band light (all long-form pages).** The loop's poster still (`hero-river-poster.webp`, 30 KB or less) placed
like A3 at 0.42 opacity, same parallax and fade. No video (U3).

**Banks (G6).** The hero's lower edge, the title band's lower edge, the lavender band's upper edge and the footer's upper
edge are drawn as a bank: the SVG wave path filled with the next surface's colour, plus the logo double stroke along its
top: `--teal-500` 2 px over `--navy-700` 1.2 px at .75, 6 px apart (the `.wave-rule` drawing at band scale).

### 2.9 Z-plane model and parallax

Screen speed 1.0 means "moves with the page". Measured on the prototype by the depth judge (`p3-depth-*.json`); the
order of the tiers matches the stacking order, which is the point.

| plane | content | `z-index` | screen speed | shadow |
|---|---|---|---|---|
| 0 field | `div.field` fixed layers | -1 | about 0 (drifts -6vh over the page) | none |
| 0 hero light | loop or still | 0 (inside its section) | 0.70 (`translateY(.3y)`), fades out | none |
| 0 bands | band backgrounds (`::before`) | 0 | 1.00 | inset highlight only |
| 1 river under | `svg.river--under` | 1 | 1.00 | none (light) |
| 2 surfaces | containers, cards, panes, frames | 2 | 1.00 | `--sh-1` to `--sh-3` |
| 2 photo in frame | hero photo inside its clip | 2 | 0.92 (sinks up to 22 px) | none |
| 3 river over | `svg.river--over` | 3 | 1.00 | none |
| 3 breakouts | doctor photo, Nelson plate, cataract lens, handshake, arch frame | 4 | 1.06 around the viewport centre, clamped to 26 px | `--sh-4` |
| 3 cut-outs | hero glasses, kids' glasses | 5 | 1.12, upward only from rest, clamped to 44 px | `--sh-fore` |
| chrome | sticky header 50, dropdowns 60, drawer 100, skip link 200 | | | |

Script rates: `fore: [0.12, 44]`, `fore-soft: [0.06, 26]`, `inner: [0.08, 22]` (rate, max px). Elements on screen at load
move only upward from their rest position, so nothing shifts at load (CLS 0).

### 2.10 Motion tokens

| token | value |
|---|---|
| `--ease-out` | `cubic-bezier(.2, .7, .2, 1)` |
| `--dur-fast` / `--dur` / `--dur-slow` | `200ms` / `480ms` / `800ms` |
| reveal | `opacity 0 to 1`, `translate: 0 26px` to `0 0`, `--dur`, stagger 70 ms capped at 3 steps |
| lift | `--lift: -7px` cards, `-2px` buttons, `-3px` social circles |
| tilt | up to 5 deg about X and 6 deg about Y, `perspective(900px)`, fine pointers only |
| zoom | media `scale(1.06)` in frame, promo `1.04` |
| sheen | button band `translateX(-110% to 110%)`, `--dur-slow` |
| underline | `background-size 0 to 100% 2px` or `scaleX(0 to 1)`, 350-450 ms |

---

## 3. Components

Every component renders from the page model only (`docs/BUILD-NOTES.md` section 5); "model" names the fields it reads.
No component prints a visible string that is not in the model or in `chrome`, except the declared exceptions in 3.10
(initials) and 3.24 (the chrome phone action). Icons are inline SVG symbols (only those the page uses), `aria-hidden`.

### 3.1 Top bar

- **Model:** `chrome.topbar.address`, `.appointment`, `.call`.
- **Anatomy:** navy-700 strip, white 14 px text. Left: the address sentence as one link (underlined, `--teal-200` on
  hover). Right (769 px and up, as at source): two ghost pills "Request Appointment" (calendar icon) and "239-500-2020"
  (phone icon), 44 px tall (U2), 2 px white border, hover and focus fill `--teal-700`.
- **Layout:** one line and 44 px at 1200 px and up (no `max-width` cap on the sentence). Phone: centred, two lines, pills
  hidden. The top bar scrolls away; only the navbar sticks (`.site-header { position: sticky; top: calc(-1 * var(--topbar-h)) }`).
- **Focus:** 3 px `--teal-200` ring.

### 3.2 Header, nav, dropdowns, drawer

- **Model:** `chrome.logo`, `chrome.mobile`, `chrome.nav[]` (with `children`, `current`, `inSection`), `chrome.skip`.
- **Skip link:** first focusable element, "Skip to main content" to `#main`, shown on focus (navy pill, top-left).
- **Logo (B4, G13):** `<a href="{chrome.logo.href}" aria-label="{chrome.logo.homeLabel}">` holding
  `<picture><source media="{chrome.mobile.media}" srcset="{mobile 988x400 file}"><img src="{desktop file}" srcset="{300w file} 300w, {988w file} 988w" sizes="180px" alt="{chrome.logo.alt}" width height></picture>`.
  Rendered 180 px wide (73 px tall) from 769 px up, 145 px (59 px tall) at 768 and below. Both logo files ship
  **byte-identical** to `assets/source` (images.mjs `lossless: true`, A-17); no filter, opacity, blend or recolour. The
  footer carries no logo (as at source).
- **Navbar:** `glass-nav`, sticky. Height from content: logo plus 10 px padding top and bottom (93 px desktop, 79 px phone).
- **Main nav (1200 px and up):** six items, 15.5 px/550 navy. Hover, focus and current (`current` or `inSection`): a
  `--tint-lav` pill behind the label (G15, `--navy-900` text 12.81) plus a 2 px teal-to-navy underline that draws in from
  the left. Items with children get a separate toggle button 44x44 (G3) named "<label> submenu" (visually hidden text),
  `aria-expanded`, `aria-controls`.
- **Dropdowns:** `glass-nav` panel (.96/.92 white), radius 16, `--sh-3`, min-width 250, 44 px rows; open on hover (with a
  10 px hover bridge) and from the keyboard: toggle Enter or Space, ArrowDown on the link or toggle opens and focuses the
  first item, ArrowUp/ArrowDown move, Escape closes and returns focus to the toggle, focus leaving closes. Fade plus 6 px
  slide, 220 ms. The Insurance panel aligns to the right edge.
- **Round actions:** at 768 px and below (the source's mobile header) a navy circle "Make an appointment" (calendar;
  `newTab` as in `chrome.mobile`), a teal circle "Call" (phone) and a white circle with a navy ring "Toggle mobile menu"
  (`aria-expanded`); from 769 to 1199 only the menu circle (the top bar carries the two actions). All 44x44, labels as
  `aria-label` from `chrome.mobile`.
- **Drawer (G2):** `<dialog class="drawer" aria-label="Menu">` opened with `showModal()` (page inert, Escape closes,
  focus returns to the toggle on close). Panel slides in from the right (`min(380px, 88vw)`, white to `--aqua-50`), scrim
  `rgb(var(--shade)/.45)`; `html:has(dialog[open]) { overflow: hidden }`. Content: the logo, a close button, the same
  tree as `chrome.nav` with accordion sub-menus (48x48 toggles, `aria-expanded`), then "Request Appointment"
  (`btn--primary`) and "239-500-2020" (`btn--ghost`). Closes when the viewport grows past the drawer breakpoint.
- **Checks:** A-6 (keyboard), A-9 (targets), A-11 (stability).

### 3.3 Section header

- **Model:** `section.heading` (`html`, `text`, `level`), or the first heading of a block's html.
- **Anatomy:** heading at its model level (exceptions in 3.4, 3.17 and 3.18), `--step-3`/650 navy, then the `.wave-rule`: a
  74x12 inline SVG background of two strokes, teal-700 2.2 px over navy-700 1.6 px at .75 (Riverlight's drawing). Drawn
  with `::after` on the heading so the model's HTML is not touched. Centred variant for section intros, left variant
  in split layouts. A heading with an `href` gets a drawn 2 px underline on hover and focus.

### 3.4 Home hero (model sections s1 and s2)

- **Model:** s1 `background[]` (the practice interior, desktop file and the `(max-width: 768px)` file), s2 `heading`
  ("Comprehensive Eye Care") and its `cta` button ("Request Appointment").
- **Statement:** rendered as `<p class="hero__statement">` (the source is a `div.ecp-heading`; a `p` keeps the h1 first in
  the outline). The first word is weight 340, the rest 720 on its own line (`--display`, navy).
- **CTA:** `btn--primary btn--lg` with the calendar icon.
- **Photo frame:** right column, `aspect-ratio: 4/3`, radius `--r-xl`, `--sh-3`; the photo inside sinks at 0.92 (plane 2,
  `data-depth="inner"`). Image: a 4:3 crop of the 1920x800 original at 1067x800 (P1) with `alt=""` (the model marks it a
  background). The `-new` phone file is superseded by the same scene at higher resolution (declared, Q-6).
- **Cut-out glasses (protrusion 1):** the de-riveted navy glasses (`IMAGE-PLAN` H1), `alt=""`, `pointer-events: none`,
  rotated -7 deg, crossing the frame's lower-left corner into the column gap; plane 3 cut-out.
- **Light:** A3 behind; the bank (2.8) at the bottom, fill `--paper`.
- **Desktop height:** `padding: clamp(26px, 5vh, 64px) 0 clamp(150px, 18vh, 210px)`; frame
  `max-height: max(300px, calc(100svh - var(--chrome-h) - 96px))` (static token, D1).
- **Short desktop (U1):** padding-bottom 120 px, frame `max-height: calc(100svh - var(--chrome-h) - 150px)`, the intro card
  overlaps by `--hero-tuck: 120px`. Acceptance: at 1280x585 (clientWidth 1265) the statement, the CTA and the whole home
  h1 are visible at load (h1 bottom 569 px or less) and the glasses keep 12 px from every text box. If both cannot hold,
  the glasses move to cross the frame's left edge at 55-70% of its height, in the column gap.
- **Phone:** one column: statement, full-width CTA, frame (4:3), glasses at the frame's lower-left (`width: min(48%, 250px)`).

### 3.5 Intro card (s3, the h1)

- **Model:** s3 `heading` (h1, `placement: 'content'`), its prose.
- `glass-card` (the river passes behind it), `max-width: 980px`, centred on the page, straddling the hero bank by
  `--hero-tuck` (protrusion 2). Text left-aligned (U7): h1 at `--step-3`, the wave rule, the paragraph at `--step-1`.
  Never reveal-gated when on screen at load.

### 3.6 Envision promo (s4) and services (s5)

- **Model:** s4 prose (one `figure.fig--brand` linked to the Envision page); s5 heading "Our Eye Care Services" (h2) and
  four `callout` blocks (image, h3 title with link, html).
- **Promo (protrusion 3):** the ad image whole (brand image: never cropped, never regenerated), radius `--r-l`, `--sh-3`,
  straddling the services band's top edge by half its height (`--promo-h` from container units, Riverlight's maths).
  Hover and focus: lift 6 px, `--sh-3` deeper, 4 px teal glow ring, image zoom 1.04 (D5); focus adds a 3 px navy ring.
- **Band:** A4 services band.
- **Cards:** four `glass-card` cards in a 4/2/1-column grid (1200+/769-1199/768-), the river passing behind them. Each:
  photo in a `--r-m` frame breaking `--svc-break` (48-64 px) above the card's top edge (protrusions 4, D4), h3 title link
  (`--step-1`/700 navy, drawn underline), text 16 px. The whole card is the link target through the title link's
  stretched `::before`; inline links in the text sit above it (`position: relative; z-index: 2`). Tilt, glare, lift, zoom
  (6.4). The grid's top margin reserves `--svc-break + 16px`.
- **Copy:** the Dry Eye Treatment and Patient Forms texts stay as the source has them (mismatched; OPEN-DECISIONS B).

### 3.7 Alumier band (s6)

- **Model:** s6 `background[]` (the sunscreen banner), one `callout` (image: the AlumierMD logo with the model's alt,
  html "Now available at our practice!", button "Learn More" to the external referral link).
- **Card (protrusion 5):** radius `--r-xl`, `--sh-3`, climbing `--al-overlap` into the services band. The banner fills the
  card as an image with `alt=""`, `object-fit: cover`, `object-position: 50% 50%` (as the source row); verify at 1440,
  1024, 768 and 390 that no product mark is cut. Panel: `glass-card` at the lower right with the logo (250 px max), the
  line (`--step-1`/600 ink-900) and the button.
- **Weave:** the river's over copy crosses the card's top-right corner (occluder: the card's rounded box; 2.8 A2). The
  panel's content starts 86-104 px below the card top, outside the crossing.
- **Band-edge rule (B5):** the services band ends under the card or fades out over 80 px; no straight band edge or band
  shadow may show beside the card.
- **Phone:** the banner sits above the panel at its own 1440:675 aspect, the panel white and full width.

### 3.8 Generic cards

All cards share: radius `--r-l`, padding `clamp(22px, 2.2vw, 30px)`, a stretched title link, `[data-tilt]` behaviour
(6.4), and a `:has(:focus-visible)` 3 px ring. Variants: `glass-card` (where the river passes behind), `paper`,
`frost-solid`. Card media sit in `.frame` (radius `--r-m`, inset 1 px white highlight, `object-fit: cover`, zoom on hover).

### 3.9 Two callouts (s7)

- **Model:** two `callout` blocks with h3 titles (the second linked), html and a 640x240 image.
- Paper cards in two columns (one below 769 px): title (`--step-2`), wave rule, text, image at the bottom in a frame.
- **Optional kids' glasses (G19):** a teal children's glasses cut-out (IMAGE-PLAN H3) resting on the Back-to-School
  image's lower-right corner and hanging at least 48 px below the card into the section gap, `alt=""`. It must clear the
  Glaucoma card at every width (Irisbloom's version touched it at 768; A-14). No generated eyewear may sit within one
  section of the designer-frames gallery.

### 3.10 Doctor blocks and the portrait placeholder (s8, s9; also team pages)

- **Model:** `team` block (`members[0]`: `name`, `href`, `position`, `photo` or `placeholder`), the section prose (h2 and
  paragraphs), `cta` ("Meet Our Optometrist").
- **Portrait (protrusions 6 and 7):** an aurora plate (radius `--r-xl`, `linear-gradient(150deg, --field-teal, --field-sky 48%, --field-violet)`
  with a white bloom at the upper left) at 76% of the square, and the photo at 84% offset to the opposite corner, so the
  photo is larger than its plate and breaks out of its top and side. Photo `--sh-4`, breakout speed 1.06. Nelson's block
  mirrors Degler's.
- **Text pane:** paper, the name as a tag link (`--teal-700`, 15 px/700) above the h2, the wave rule, prose, the CTA
  (`btn--secondary`). Name chip under the photo on team cards (G18): the name and the position (when not empty) as a
  `--tint-teal` pill, `--teal-800` text (7.19).
- **Sticky portrait (R5):** at 1024 px and up, when the text pane is taller than the viewport, the portrait column is
  `position: sticky; top: calc(var(--navbar-h) + 24px)`.
- **Placeholder plate (G9):** `<div class="ph-portrait" role="img" aria-label="{placeholder.label}" data-needs="{placeholder.needs}">`
  in the photo's place and size: plate gradient, a segmented iris ring (two concentric rings, `--teal-500` to
  `--violet-500` segments, decorative), the initials (declared derivation: first letters of the first two name words after
  "Dr."; "KN" for Dr. Kristin Nelson) at weight 300 navy, and the full name from the label in 14 px/700 uppercase navy
  (9.08-9.19 on the plate). The initials and name spans are `aria-hidden`; the plate's name is the label. It is swapped
  for the practice's photo when supplied. It never shows a generated face.

### 3.11 Lavender trio (s10)

- **Model:** three `callout` blocks (427x427 image, h3 title link, html).
- `--lav-300` band with a bank on its upper edge (G6). Three columns: a round photo (`min(236px, 74%)`, 7 px white ring,
  `--sh-3`) straddling the bank by at least 48 px at 1024 px and up (protrusion 8; at 768 and below only the first photo
  straddles, by at least 32 px), title (navy, underlined link, `--step-2`), text in `--ink-900` (7.37).
- **Structure (D3):** `li > figure.trio__photo` (never reveal-gated) `+ div.trio__text.rv`.
- Hover and focus-within on the item zoom the photo 1.06.

### 3.12 Designer-frames grid (s11)

- **Model:** s11 heading (h2 with link), prose, `gallery` block (four items: Furla, Bajio placeholder, Draper James,
  Charmant Titanium; each `image` or `placeholder`, `caption`).
- Split: text left (5fr: linked h2, wave rule, two paragraphs), tiles right (7fr) in a 2x2 grid, even tiles offset 42 px
  down (24 px on phones). Tiles: square frames (`--r-l`), the brand campaign images whole (500x500 sources, never cropped
  through a mark), caption below in navy 700.
- **Text cell:** the Bajio placeholder is an equal square with the brand name (the placeholder label) set in type,
  `clamp(2.2rem, 1.6rem + 2.2vw, 3.4rem)` weight 300 navy on a `--tint-sky` to `--field-teal` gradient (9.08), with
  `data-needs="brand image"`. The name is shown once: the type in the square is `aria-hidden` and the source caption
  ("Bajio") stays in the DOM as the figure's caption, visually hidden for this tile only, so screen readers hear it once
  and the screen shows it once. No image ever fills a brand slot.
- No generated eyewear in or next to this section.

### 3.13 Cataract (s12)

- **Model:** s12 heading (h2, bold), prose (two paragraphs, one link).
- Paper text card (7fr) and the generated lens (4fr; IMAGE-PLAN H2) in an arch-top frame (`999px 999px --r-xl --r-xl`,
  4:5), crossing down into the Eye Emergencies band by at least 64 px (protrusion 9), breakout speed 1.06, `--sh-4`,
  `alt=""`. The Eye Emergencies band's top padding reserves the crossing plus 48 px. Phone: the lens is
  `min(300px, 72%)` wide, right-aligned, crossing by at least 32 px.

### 3.14 Eye Emergencies (s13)

- **Model:** s13 heading (h2, linked), prose (two paragraphs with a `tel:` link and the handshake `figure.fig--photo`).
- A4 band with a rounded top. Split: the handshake photo left (4fr, square frame, breakout 1.06), text right (7fr). The
  phone link is bold, `white-space: nowrap`, digits in RFEC Figures.

### 3.15 Reviews carousel (s14)

- **Model:** s14 prose (the staff `figure.fig--photo`, h2 "Read Our Patient Reviews"), `reviews` block (five items:
  `html`, `name`, `stars`, `shownAs`, `reviewedAt`), `cta` ("Read Google Reviews", external, new tab).
- Staff photo left (5fr, square frame). The panel (`glass-card`, contrast tested over black) overlaps the photo's right
  edge by `clamp(56px, 8vw, 132px)` (protrusion 10); phone: the panel overlaps the photo's lower edge by 90 px.
- **Carousel:** a horizontal scroll-snap track (`overflow-x: auto`, scrollbar hidden), one review per view, **the track's
  height follows the active slide** (no hole: the nightglow defect), loop by index, **no autoplay** (as at source).
  Each slide: stars as SVG icons in `--teal-700` (`role="img"`, `aria-label` "5 out of 5 stars"; never star glyphs, BUILD
  5.8), the relative time in `<time datetime="{reviewedAt}">{shownAs}</time>` (verbatim; Q-3), the quote (`--step-1`,
  `--ink-900`), the name (bold navy, verbatim with its dash). Dots: 44x44 buttons with 10 px dots, `aria-label` "Show
  review n of 5", `aria-current`. The track is focusable, ArrowLeft/ArrowRight move. `aria-roledescription` "carousel" and
  "slide". Reduced motion: instant scroll.
- The CTA below (`btn--primary`, arrow icon).

### 3.16 Home section order (live order, from the home page model)

| model section | kind (row) | component | protrusion (5.1) |
|---|---|---|---|
| s1 + s2 | hero (rows 2-3) | 3.4 hero: statement, CTA, photo frame, glasses, light, bank | 1 glasses |
| s3 | text (row 4), the h1 | 3.5 intro card | 2 intro card |
| s4 | image (row 5) | 3.6 Envision promo | 3 promo |
| s5 | cards (row 6) | 3.6 services | 4 service photos |
| s6 | callout (row 7) | 3.7 Alumier band | 5 Alumier card |
| s7 | cards (row 8) | 3.9 two callouts | optional kids' glasses |
| s8 | team (row 9) | 3.10 Dr. Degler | 6 photo larger than plate |
| s9 | team (row 10) | 3.10 Dr. Nelson (placeholder plate) | 7 plate |
| s10 | cards (row 11) | 3.11 lavender trio | 8 trio photos |
| s11 | gallery (row 12) | 3.12 designer frames | none (brand images stay in frame) |
| s12 | text (row 13) | 3.13 cataract | 9 lens |
| s13 | text-image (row 14) | 3.14 Eye Emergencies | handshake breakout |
| s14 | reviews (row 15) | 3.15 reviews | 10 review panel |
| s15 | cta (row 16) | 3.17 insurance band | none |
| s16 | posts (row 18) | 3.18 news | none |

The source's empty rows 1, 17 and 19 are not ported (SITE-ARCHITECTURE 5).

### 3.17 Insurance band (s15)

- **Model:** s15 heading ("Insurances We Accept At Riverside Family Eye Care", source h3), prose (two paragraphs), `cta`
  ("View All Our Insurance Plans").
- `--lav-300` band, full width. **Editorial split (G12):** left (5fr) the heading rendered as **h2** (outline fix: it is a
  top-level home section; text unchanged; declared), the wave rule (navy variant) and the button (`btn--secondary`); right
  (7fr) the two paragraphs, left-aligned, `--ink-900`. Phone: stacked, button last.

### 3.18 News cards (s16)

- **Model:** s16 heading ("Latest Fort Myers Eye Care News & Tips", source h3, linked), `posts` block (`view: grid`, four
  items: `title`, `level` h4, `href`, `date`, `html`).
- Heading rendered as **h2** (outline fix), centred, with the wave rule. Four `frost-solid` cards (4/2/1 columns), each with
  a 3 px top rule `linear-gradient(90deg, --teal-500, --violet-500)` (G8), the date as an eyebrow (`<time datetime>`,
  `--step--1`/700 uppercase `--teal-700`), the title as **h3** with the stretched link, the excerpt (15.5 px). The excerpt
  comes from the model (shortcode resolved, B2).

### 3.19 Footer

- **Model:** `chrome.footer` (`menu`, `button`, `nap`, `copyright`, `util`), `chrome.social`, `chrome.financing`.
- A5 deep aurora, top bank where the river settles as a horizon (G6). Grid 3/2/1 columns: menu (four links, 44 px rows,
  white 700, `--teal-200` underline draws in); social circles (44 px, `--teal-700` with white glyphs 5.57; hover lifts 3 px,
  fill `--navy-700`, `--teal-200` ring) above "Request Appointment" (`btn--light`) and the financing link ("Cherry Payment
  Plan", `--teal-200`); the NAP paragraph built from `nap` parts exactly as `nap.text` reads (name bold white, the rest
  `--navy-100`, the phone and site links `--teal-200`, `overflow-wrap: anywhere`).
- Legal bar: `rgb(17 24 62/.55)` over the aurora, "© 2026" and the four utility links (44 px rows, `--navy-100`, hover
  `--teal-200`). No platform credit, no Login (chrome C02). No logo (the source footer has none).

### 3.20 Breadcrumbs

- **Model:** `breadcrumbs[]` (`label`, `href`, `current`).
- `<nav aria-label="Breadcrumb"><ol>`; each linked segment is an inline-flex link with `min-height: 44px` (U2); the
  separator is the source's " » " as text in `<span aria-hidden="true">` (BUILD 5.8.4: parity reads it; never a CSS
  `content`); the current segment is plain text with `aria-current="page"`; an empty current segment (17 archives)
  prints the separator and nothing after it. 15 px, `--teal-700` links, `--ink-900` current. Wraps naturally.

### 3.21 Interior title band

- **Model:** `h1` (`placement: 'band'`), `breadcrumbs`, `date` (posts), the art image (P4, `model.art.title`), team
  pages' `team.members[0].photo` or `placeholder`.
- **Anatomy:** `section.titleband` with A6 light and a bank at the bottom. Left: the pane (`glass-card`): breadcrumbs,
  `h1#page-title` (`--h1-band`, long-h1 classes 2.3), the wave rule, then on posts the date (`<time>`, figures), on team
  pages the position chip (G18). Right: **the arch frame** (`--arch-w`, 4:5, arch radius, `--sh-4`, breakout speed 1.06),
  crossing the bank by `--arch-cross` into the sidebar column (protrusion I-1). The sidebar's `margin-top` reserves the
  crossing plus 32 px; on builder hubs (no sidebar) the first section's top padding reserves it on the right half.
- **Arch image (resolution order, deterministic):** (1) team-member pages: the member's own portrait, else the placeholder
  plate (3.10); (2) builder hubs with a header photo: that photo (`section.background` of the first row, 6 hubs); (3) a
  page-specific image listed in IMAGE-PLAN 4 (none in the first set); (4) the section default of IMAGE-PLAN 4. A page's
  own lead figure is **not** moved into the arch: 35 pages open with one (17 posts, 18 interiors), many of them wide
  1280x480 banners, small 300x200 thumbnails or a brand logo, which an arch crop would cut. It stays first in the article.
  Decorative arches are `alt=""`.
- **Weave:** the river's over copy crosses the arch's lower edge (occluder: the arch path), arc-length stretch, narrow
  strands only (B1). It never crosses the pane or the article card.
- **Short desktop (U1):** band padding 16 px top, 48 px bottom; pane padding 20/28 px; `--h1-band` capped by `8.5vh`.
  Acceptance at 1280x585: the h1 and the start of the first content block (its first prose line, or the top of a lead
  figure) are visible at load for every page whose h1 is 3 lines or less.
- **Phone (G5):** the pane is full width (the h1 is never squeezed); the arch is `min(38%, 150px)` wide, right-aligned
  below the pane, overlapping the bank by half its height; the article's top padding equals that overlap plus 24 px.
  Acceptance at 390x844: breadcrumb, h1 and the first content block start within the first 700 px.
- **769 to 1023 px** (no sidebar column yet): the phone placement, with the arch at `min(30%, 200px)`.

### 3.22 Long-form prose

- **Model:** every `prose` block's `html`, `callout` blocks with titles, `video` blocks, the derived `section.heading`
  (classic pages split at h2). Element set: BUILD-NOTES 5.4.
- **Article card:** `paper`, radius `--r-l`, padding `clamp(24px, 4vw, 60px)` (top `clamp(40px, 5vw, 70px)`); at 767 px and
  below **full-bleed** (no side margin, radius 0, padding = `--gutter`, U7). Body `--step-prose`/1.7 `--ink-700`.
  `.prose { overflow-wrap: break-word }`, `.prose a { overflow-wrap: anywhere }` (U6).
- **Measure (B6):** `.prose > :is(p, ul, ol, dl, blockquote, h2, h3, h4, h5, h6, address, pre, .table-scroll) { max-width: var(--measure) }`.
  Target 60-75 characters per line at 1280, 1440 and 1920.
- **Rhythm (G4):** `.prose > * + * { margin-top: 1em }`; `h2` 2em above, `h3` 1.6em, `h4` 1.3em; the first child 0; a heading's
  next sibling 0.5em.
- **Headings:** h2 `--step-3` navy with the wave rule (`::after`), h3 `--step-2` navy 650, h4 `--step-1` navy 700, h5/h6
  `--step-0` 700 uppercase `--ink-900`.
- **Paragraphs and inline:** `strong`/`b` 700, `em`/`i` italic face, `u` underline, `sup`/`sub` 0.75em, `small` `--step--1`,
  `br` kept. `p.attribution`: `--step--1` italic `--ink-600`.
- **Links:** `--teal-700`, 1 px underline at `rgb(3 117 109/.55)`, offset .18em; hover and focus draw a 2 px `--teal-700`
  underline (background-size) and darken to `--teal-800`. Links stay underlined everywhere in prose (BRAND 5.4).
- **Lists:** `ul > li` with the teal wave bullet (14x8 SVG, `::before`, 30 px indent); nested `ul` uses a 6 px teal dot;
  `ol` keeps native markers styled with `::marker` (`--teal-700`, 700, figures face); `ol[start]` honoured. Never a
  `::before` bullet on `ol > li` (the nightglow double-marker defect).
- **dl:** `dt` navy 700, `dd` margin 0 0 0.8em. **hr:** a centred wave rule, 48 px vertical margin. **address:** normal
  style. **code/pre:** system monospace, `--tint-lav` background, radius `--r-s`, `pre` scrolls horizontally.
- **blockquote:** `tint-panel`, a 3 px `--teal-700` left border, padding 20/24, `--step-1` `--ink-900`; `cite` `--step--1`.
- **Tables:** the model wraps them in `div.table-scroll[tabindex=0][role=region][aria-label]`: horizontal scroll, focus
  ring on the region, `border-collapse: collapse`, `th[scope=col]` on `--tint-lav` navy 700, cells padded 12/16, hairline
  rows, zebra `--ground`, numbers in figures, `min-width: 100%`.
- **Figures** (`figure.fig.fig--{role} > span.fig__media > (a)? img`, optional `figcaption`); the model carries no source
  alignment, so placement follows role and intrinsic width:

  | rule | placement |
  |---|---|
  | `fig--photo`, width 800 or more | **wide**: breaks out of the measure to the card's full inner width plus up to 24 px each side, frame `--r-l`, `--sh-2` |
  | `fig--photo`, 500-799 | column width (the measure), frame `--r-l` |
  | `fig--photo` or `fig--plate` or `fig--diagram` under 500 | **inset right** at 1024 px and up (`float: right`, max 42% of the measure, never wider than intrinsic, margin 0 0 16px 28px); block and centred at native size below |
  | `fig--portrait` | inset left, max 260 px, frame `--r-l` |
  | `fig--brand` | whole on a white chip, `object-fit: contain`, never cropped, never inset beside a generated image |
  | `figcaption` | `--step--1` `--ink-600`, 8 px below |
  | `div.fig-grid[data-count]` | grid of 2, 3 or 4 columns by count (7 wraps to 4+3), equal frames |
  | `ul.logo-grid > li.logo-chip` | white chips 133x110 minimum, `object-fit: contain`, 4-6 columns, radius `--r-s`, hairline |

  No figure is drawn wider than its file (`max-width: min(100%, {w}px)`): a 640 px lead photo stays 640 px, centred.
  A floated inset never sits within 2 lines of a heading's top (clear before h2/h3). The source alignment carry is P5.
- **Embeds:** `div.embed--video`: 16:9 frame, radius `--r-l`, navy-950 background, `--sh-2`, iframe `loading=lazy`;
  `div.embed--map`: 4:3, radius `--r-l`; `div.embed--other`: block, max-width 100%.
- **Video blocks** (`kind: 'file'`): `figure.wide > video[controls][preload=none][playsinline]` in a 16:9 frame; poster from
  P6 when approved, else a CSS poster (navy glass with the native play control) and no invented frame.
- **Prose enhancers** (applied by the template at build time; text untouched; deterministic triggers):
  - *Lead:* the page's first `p` whose entire text is one `strong` gets `.lead` (`--step-2`/1.3 navy).
  - *Checklist panel:* an h3 sub-section (to the next h2/h3) containing a `ul` of 6 or more items, each 60 characters or
    fewer, is wrapped in a `tint-panel` (radius `--r-l`, padding 20-34 px); that list runs in two columns at 768 px and up.
  - *Treatment cards (G7):* a run of 3 or more consecutive h3 sub-sections inside one h2 section, none of them a checklist,
    renders each as a card with a 3 px `--teal-700` left border (5.57 against white), padding 22/24, `paper` on
    `--ground`.
  - *Two-column list:* any other `ul` of 8 or more items each 40 characters or fewer runs in two columns at 768 px and up.
  - *Added illustration:* IMAGE-PLAN art placements (`model.art.inline`) insert a wide figure after the named element.
- **Callouts inside long-form:** a titled `callout` becomes a sub-section: its title at its model level, its html, its
  image as a media figure (before the text when `imageFirst`), its buttons as a button row. An untitled callout is a
  `tint-panel`.

### 3.23 Aside and sidebar widgets

- **Model:** `aside` (`variant`, `quickActions`, `social`, `location`).
- `<aside aria-labelledby="{id of the location title}">` (no authored label; on the location-page variant, which has no
  location card, the single complementary landmark stays unlabelled), a grid with 20 px gaps, in the second column at
  1024 px and up and after the article (and the CTA band) below.
- **Quick actions card** (`glass-card`): "Request An Appointment" (`--teal-700`, calendar) and "Email Us" (`--navy-700`,
  mail) as 52 px pills, white text, hover slides 4 px and darkens; then the four social circles (44 px).
- **Location card** (`paper`): the title as an h2 link (1.3rem navy), the address (`<address>`), contacts (Phone as a
  `tel:` link, Fax as text, Email as a `mailto:` link with the PHI note below in 14 px), the hours as a `table` (`th`
  day, `td` intervals, one line per interval: Friday has two), digits in figures; then the map card: a static `a.mapcard`
  (aqua map pattern, pin icon) labelled with `map.fallbackLabel` ("Open in Google Maps"), linking to Google Maps with the
  `q` value of `map.src` (no iframe in the sidebar; Q-11). Location-page variant: no location card.
- **Sticky (G1):** at `(min-width: 1024px) and (min-height: 860px)` the aside stretches to the article's height and the
  location card is `position: sticky; top: calc(var(--navbar-h) + 24px)`. Below that height (the operator view) it scrolls.
- The river runs down the sidebar column below the cards (template route).

### 3.24 CTA band

- **Model:** the page's last block when it is a `callout` or `cta` whose buttons include the appointment form or a
  `tel:` link (for example the dry-eye page's "Enjoy Dry Eye Care Beyond the Basics" with "Schedule Appointment").
- The block is lifted out of the article card into a band below the article grid (DOM order: article, CTA, aside; the
  grid places the aside in row 1 and the CTA across row 2). `glass-navy` panel on A5, radius `--r-xl`, split 1.4fr/auto:
  the title as its model heading in white (`--step-3`), a light wave rule (teal-200 over navy-100; no filter), the text in
  `--navy-100`, then the actions: the block's own buttons (appointment as `btn--light btn--lg`) and the chrome call action
  "239-500-2020" (`btn--primary btn--lg`, phone icon). The phone action repeats `chrome.topbar.call` exactly (label and
  target): no new words, declared as a chrome repeat (Q-2). Pages without such a closing block get no CTA band; the
  sticky location card and the footer carry the actions.

### 3.25 Forms

- **Model:** `form` block `html` (BUILD-NOTES 5.5), unchanged. `data-needs-backend` stays until an endpoint is decided.
- **Card:** `paper`, padding `clamp(24px, 4vw, 48px)`. `.form__intro` paragraphs in `--ink-700`.
- **Grid:** `.form__grid` one column; `.field__row` two columns at 600 px and up (First/Last name).
- **Labels:** `.field__label` 600 navy 16 px; `.field__sublabel` `--step--1` `--ink-600`; `.field__req` the asterisk in
  `--alert-700` (aria-hidden as given).
- **Controls:** `.field__control` (input, select, textarea): font 16 px or more (no iOS zoom), `min-height: 48px`,
  padding 12/14, radius `--r-s`, 1.5 px `--line-input` border (3.37), white fill; textarea `min-height: 140px`, vertical
  resize; select with a chevron SVG and 44 px right padding. Focus: 3 px `--teal-700` ring, offset 2 px, border
  `--teal-700`. Invalid (`[aria-invalid="true"]`): border and message in `--alert-700`.
- **Choices:** `div.choice` rows 44 px tall; custom 24 px radio (navy ring, teal dot) drawn on the native input with
  `appearance: none` so it stays focusable; label clickable.
- **Help and hints:** `.field__help` `--step--1` `--ink-600`; `.field__hint.sr` visually hidden; `.field__error[hidden]`
  stays hidden (its text is empty; any message would be authored copy).
- **Conditional fields:** the theme script shows `div[data-show-if="name=value"]` only while that control has that value
  (`hidden` otherwise), as at source; without JS they show.
- **Submit:** `.form__foot > button.btn.btn--primary` ("Submit"), full width at 420 px and below.

### 3.26 Accordion

- **Model:** `accordion` block (`items[{q, html}]`).
- `<details>` list, 12 px gaps. Closed: `--tint-lav` fill, 1 px `rgb(64 77 138/.16)` border, radius `--r-m`. Open: white,
  `--sh-1`. `summary`: `min-height: 56px`, padding 12/20, navy 700 `--step-1`, the chevron right (`--teal-700`, rotates
  180 deg), no default marker, focus ring. Answer padding 0 20 18. Open and close animate with `::details-content`,
  `interpolate-size: allow-keywords` and a `content-visibility` allow-discrete transition (480 ms `--ease-out`) inside
  `@media (prefers-reduced-motion: no-preference)` and `@supports`; browsers without support open at once.

### 3.27 Team cards (builder hubs and `team` blocks with several members)

- **Model:** `team.members[]` (`name`, `level`, `href`, `position`, `photo`/`placeholder`, `html`, `more`).
- Grid 4/3/2/1 columns (1200+/1024-1199/600-1023/below). `frost-solid` card: the square portrait in a `--r-l` frame breaking
  48 px above the card top (or the placeholder plate), the name as the model level heading with the stretched link, the
  position chip (G18), the excerpt html, "Read More" (`more.label`, `aria-label` when given). Doctor cards on
  `/our-eye-doctors/` use the doctor block layout (3.10) stacked.
- On a team-member page the `team` block (view `complete`) prints the bio without its photo, which is in the title arch.

### 3.28 Blog index and archive cards

- **Blog index (`/whats-new/`, `posts` view `summary`, 21 items, no images):** `frost-solid` cards in two columns at 1024 px
  and up (one below), each with the G8 top rule, the date eyebrow, the title at its model level with the stretched link,
  the excerpt and "Read More" (`more`). No pagination (as at source).
- **Grid and list views:** the news-card layout (3.18).
- **Archives (`childpages` variant `archive`):** a single-column list of paper rows (title link, chevron icon, hover slide).
  The four "Nothing Found" archives print their h1 and prose in the article card.
- **Child-page listings:** `plain` (title link plus summary) as link cards in two columns; `thumbs` as image cards
  (3/2/1 columns) with the thumbnail breaking 48 px above the card (a depth device on hubs).

### 3.29 Legal pages

- Title band with the utility arch (IMAGE-PLAN 4), the article card with prose only, measure `66ch`, h2/h3 in the standard
  styles, lists with wave bullets, links underlined. Of the prose enhancers only the lead rule applies; lists stay one
  column. The privacy policy's placeholder clause prints verbatim (Q-12).

### 3.30 404

- `dist/404.html` (root-relative URLs, built by `build.mjs`) and `/404-page-not-found/`: the title band (utility arch), the
  model's prose in the article card, the aside. No search (removed, OPEN-DECISIONS Q13).

### 3.31 Other blocks

| block | rendering |
|---|---|
| `badges` | the quick-action pills of 3.23 in a row, inside content |
| `cta` | a button row: appointment form or `tel:` targets as `btn--primary`, external as `btn--primary` with an arrow, others `btn--secondary`; the label and target exactly as the model |
| `childpages` | 3.28 |
| `posts` | 3.18 (grid), 3.28 (summary, list) |
| `team` | 3.10 (single, home), 3.27 (several) |
| `testimonials` | a review card (3.15 slide styling) with stars icons, the html and the attribution verbatim; no carousel |
| `reviews` | carousel on the home; a single static card elsewhere (`/eyeglasses/designer-frames/`) |
| `visit` | split at 1024 px and up: map (lazy iframe from `map.src`, `title` from the model, radius `--r-l`) and the location card content of 3.23 in the model `order`; sub-headings from `subs` |
| `hours` | the hours table of 3.23 |
| `products` | product cards (3/2/1 columns): the packshot whole on a white chip (`contain`, never cropped, never cut out), the title, the full text, "Read More+" printed as muted text (no link; OPEN-DECISIONS A.7) |
| `equipment` | device cards (3/2/1): the device image whole on a white plate, the title, the html |
| `gallery` | 3.12 |
| `logos` | `frame-brands` and `carriers`: the logo chip wall of 3.22, names as alt only, links when `href` |
| `sitemap` | nested lists by `depth`, top-level groups in 3/2/1 columns, links 44 px rows |
| `docs` | a list: a linked label (PDF) or the label in a `span[data-needs]` (no invented link), then `after` text |
| `form` | 3.25 |
| `cherry` | link mode: the label as a `btn--primary` link to `applyUrl`, or a muted pill `span[data-needs]` when there is no URL; embed mode prints the snippet unchanged |
| `video` | 3.22 |
| `accordion` | 3.26 |

---

## 4. Template map

### 4.1 Families (SITE-ARCHITECTURE section 3; counts are pages)

| family | pages | layout | title band and arch | main components | aside | protrusion devices | river | CTA band |
|---|---|---|---|---|---|---|---|---|
| home | 1 | builder (16 rows, live order) | none; h1 in the intro card (3.5) | 3.4-3.18, 3.19 | none | 10 (5.1) plus optional kids' glasses | home route table, 2 weave zones (services cards under, Alumier corner over), footer horizon | none (the insurance band closes) |
| interior | 73 (61 classic, 12 builder in the sidebar frame) | article card; builder sections render inside it | yes; arch by 3.21 order (section defaults: eye-care services, eyeglasses, contact lenses, insurance, contact) | 3.22 prose, callouts, cards, text-image, childpages, products, equipment, video, accordion, docs, testimonials, visit, cta | standard, sticky card | arch (I-1); thumbs and team cards break out where present | template route | when the closing block qualifies (3.24) |
| blog-post | 21 | article card | yes, with the date; arch = the blog default; the post's own lead figure (17 posts) stays first in the article | 3.22 | standard | arch | template route | when it qualifies |
| blog-index | 1 | article card | yes; blog default | 3.28 summary cards | standard | arch | template route | no |
| archive | 17 | article card | yes; utility default | 3.28 archive list; "Nothing Found" prose on 4 | standard | arch | template route | no |
| team-member | 11 | article card | yes; arch = the member's portrait or placeholder; position chip | team block (bio), video (1 page), cta (1 page) | standard | arch | template route | when it qualifies |
| builder-hub | 9 | full width, sections in source order | yes; arch = the hub's header photo (6 hubs); designer-frames, hours-location and cherry use their section defaults | callout cards, badges, childpages thumbs, logos, team grids, visit, reviews, cta, cherry | none | arch into the first section; thumb, team and service-photo break-outs | title route, then banks between sections | when it qualifies |
| form | 2 | article card | yes; contact default | form card (3.25) | standard | arch | template route | no |
| location | 1 | article card | yes; contact default | visit block (lazy map) | location-page variant | arch | template route | no |
| testimonial | 1 | article card | yes; utility default | testimonial card | standard | arch | template route | no |
| legal | 3 | article card, 66ch | yes; utility default | prose (3.29) | standard | arch | template route | no |
| sitemap | 1 | article card | yes; utility default | sitemap tree, posts list | standard | arch | template route | no |
| not-found | 1 (+ `dist/404.html`) | article card | yes; utility default | prose | standard | arch | template route | no |
| template | 6 | builder sections, noindex | utility default | as their blocks | none | arch | title route | no |

The six `/template/*` pages stay as the content pipeline keeps them (noindex); SITE-ARCHITECTURE section 11 recommends
dropping them at launch (Q-13).

### 4.2 Page shell (every family)

```
a.skip
div.field (A1)
header.site-header > .topbar + .navbar (3.1, 3.2)
div#page.page > svg.river--under + svg.river--over
  main#main
    section.titleband (3.21)            | home: sections s1-s16
    div.layout (grid: article | aside; CTA band across row 2)
      article.prose-card (3.22)
      section.ctaband (3.24, optional)
      aside (3.23)                       | builder hubs: sections, no aside
  footer.site-footer (3.19)
dialog.drawer (3.2)
script (deferred)
```

One `h1` per page (`id="page-title"` in the band; the home's in s3). `lang` on `<html>` from the model. Head fields printed
as given (BUILD-NOTES 5.8.3).

### 4.3 Build integration (additive; the theme alone cannot do these)

The theme replaces `src/lib/templates.mjs`, `src/lib/home.mjs` and the stylesheet. These additions are also needed;
each is additive within the `rfec/page-model@1` contract:

| id | addition | why |
|---|---|---|
| P1 | `images.mjs` emits width variants (360, 540, 720, 1080, 1440, 1920, 2400, capped at the intrinsic width) and the model's image entries gain `srcset: [{url, w}]` | `srcset`/`sizes` everywhere (G21, brief 7) |
| P2 | Ship theme assets: `src/theme/**` (fonts, script, still images, the hero loop) to `dist/theme/**`; stylesheet `riverlight.css` replaces `scaffold.css` in `STYLESHEETS` | fonts and script must be self-hosted |
| P3 | Logo files copied byte-identical (`lossless: true`) | BRAND-SYSTEM 2 "use the files as they are" (A-17) |
| P4 | `model.art` from `src/content/image-plan.json`: `title` (arch image: url, w, h, alt, srcset, `ai` flag) and `inline[]` (figure, anchor heading text, position) | arches and added illustrations render from the model alone |
| P5 (optional) | carry source `alignleft`/`alignright`/`aligncenter` as `fig--left`/`fig--right`/`fig--center` | finer figure placement than the size rule |
| P6 (optional) | poster frames for the three self-hosted videos, extracted with ffmpeg (the practice's own media; declared) | posters were never harvested |
| P7 | generated images encoded with the AI XMP label (`aiLabel`, webpmux), the label in the cache key | brief 6 |

Run `node tools/run-gates.mjs` after every template change (BUILD-NOTES 5.8.10); the parity gates guard the copy.

---

## 5. Protrusion rules

### 5.1 Devices

**Home (10 devices, 15 elements; brief minimum 4):** 1 cut-out glasses across the hero frame's corner; 2 intro card
across the hero bank; 3 Envision promo across the services band's top; 4 four service photos above their cards
(`--svc-break`); 5 Alumier card into the services band (`--al-overlap`); 6 Dr. Degler's photo larger than its plate;
7 Dr. Nelson's placeholder plate the same way; 8 three lavender-trio photos across the band's bank; 9 the cataract lens
into the Eye Emergencies band; 10 the review panel over the staff photo's edge. Optional 11: the kids' glasses below the
Back-to-School card.

**Long-form templates:** I-1 the arch frame across the title band's bank (every family with a title band). Builder hubs
add thumbnail and team-portrait break-outs (48 px).

### 5.2 Minimum and maximum crossing

- At least 48 px at 1024 px and up and 32 px at 768 px and below (D4); the cataract lens at least 64 px desktop.
- A crossing reads as depth only across a drawn edge: every crossed edge is a bank (G6), a card edge with `--sh-2` or more,
  or a frame edge.
- A device that cannot keep its crossing and its clearance at some width degrades to an in-frame break-out of at least
  32 px at that width (as the trio does on phones). It never overlaps text to keep a crossing.

### 5.3 The no-occlusion rule and how it is guaranteed

**Rule (brief 4):** no protrusion, no river over-copy and no band edge covers text, a control or a focus ring at any width
from 360 to 1920.

1. **Reservation by shared tokens.** Each crossing is a token (`--al-overlap`, `--svc-break`, `--arch-cross`,
   `--hero-tuck`, the promo's half-height), and the space it needs is reserved with the same token (padding or margin on
   the neighbour), so the two cannot drift apart.
2. **Parallax budget.** Every reservation adds the device's parallax range (26 px breakouts, 44 px cut-outs), so the
   rule holds at every scroll position.
3. **Placement.** Protrusions sit over image areas, gutters or band padding only, and above the surfaces they cross
   (`z-index` 4-5). The over copy crosses frames and plates only (2.8 A2).
4. **Focus rings.** Text and control boxes are inflated by 6 px (a 3 px ring plus a 3 px offset) when checked.
5. **The probe (A-14)**, a port of `tmp/panel/riverlight/work/probe.mjs` into `tools/`: at every size of 2.4 plus a width
   sweep 360-1920 in 40 px steps, and at three scroll positions per protrusion, every `[data-protrude]` box (grown by its
   parallax range) and every over-copy clip box against every text line box (`Range.getClientRects`) and control box;
   it also reports each device's crossing distance and that the device paints topmost across its own box. Positive
   controls: a planted 40x40 box over the h1 and planted text on the river's line must both be reported.
6. **Rendered-pixel contrast (A-5)** catches anything the geometry misses.

---

## 6. Motion and hover

### 6.1 Reveals (and the known traps)

- **What reveals:** block groups (cards, panes, text blocks) marked `.rv` by the templates; never a protrusion, never an
  element that contains one (D3), never the chrome.
- **When it is decided:** after `document.fonts.ready` or 300 ms, whichever comes first, so the layout is final. Until then
  nothing is hidden (`html.rv-ready` is not set). Any `.rv` element whose painted rect intersects the viewport at that moment
  loses `.rv` (no entrance).
- **Hidden state:** `html.rv-ready .rv { opacity: 0; translate: 0 26px }`. Reveals use the individual `translate`
  property while hover and tilt use `transform`, so neither can outrank the other.
- **Entrance:** an IntersectionObserver with `threshold: 0` and `rootMargin: '0px'` adds `.is-in` (transition on
  `opacity` and `translate`, `--dur`, stagger 70 ms by entry order in the batch, capped at 3). While `.rv` is present,
  hover and tilt rules do not apply (`[data-tilt]:not(.rv)`). An element whose resting pose is offset (the even
  designer tiles) ends its entrance at that pose.
- **Release:** after `--dur` plus its delay plus 50 ms, both classes are removed.
- **Sweep:** while elements are pending, one rAF per scroll reveals any pending element whose rect intersects the viewport
  (fast jumps, anchors, restored scroll). `beforeprint` reveals everything.

| trap (brief 5) | how this spec avoids it |
|---|---|
| A reveal rule's `transform: none` outranks the hover transform | reveals never use `transform`; classes are released after the entrance |
| A ratio threshold above 0 never fires on very tall elements | `threshold: 0` |
| An unconditional fail-safe timer reveals everything off-screen | no timer; only the observer, the in-view sweep and `beforeprint` |
| A `cover %` view-timeline range leaves content mid-reveal and the first screen stuck | no scroll-driven reveal timelines; reveals are one-shot transitions |
| Content in the first viewport must be visible at load | on-screen elements are never gated; protrusions are never gated; the decision uses painted rects after fonts |
| (memory) a negative bottom `rootMargin` is a dead band | `rootMargin: '0px'` (D3) |

### 6.2 Parallax

One passive scroll listener, one rAF per frame, `transform` writes only, the rates of 2.9. Element geometry is measured on
`load`, on resize and after fonts, never per frame. An IntersectionObserver (200 px margin) skips off-screen elements.
Nothing parallaxes under reduced motion. Elements in the first screen at load move only upward.

### 6.3 Scroll-linked aurora

- The field cross-fade (A1) on every page.
- The hero light (A3) and the title-band light (A6): 0.3x translate and fade.
- Per-band progress `--p` (A4, A5) for bands in view.
- The river's colour by depth (A2) is static but changes down the page.

### 6.4 Hover and focus inventory

| element | hover | focus |
|---|---|---|
| cards `[data-tilt]` | lift 7 px, tilt up to 5/6 deg toward the pointer, a moving glare (`::before` radial highlight at `--mx`/`--my`, opacity .5) (G16), `--sh-3`, media zoom 1.06, title underline draws in | `:focus-within`: the same lift, glare fixed at the centre (.35), zoom, underline, plus a 3 px `--teal-700` ring on the card (`:has(:focus-visible)`); no tilt |
| buttons | sheen band crosses, lift 2 px, glow ring (teal 4 px at .22 on primary; sky on secondary; teal-200 on light) and darker fill | the same sheen and fill, plus a 3 px offset ring (`--navy-700` around teal buttons, `--teal-200` on navy) stronger than the hover glow |
| promo, trio photos, frames | lift or zoom as listed in 3.6 and 3.11 | identical on `:focus-visible`/`:focus-within` (D5) |
| nav links | `--tint-lav` pill, underline draws in (G15) | the same plus the ring |
| prose and footer links | 2 px underline draws in, colour darkens | the same plus the ring |
| social circles, quick actions | rise 3 px / slide 4 px, fill change | the same plus the ring |
| dropdown items | `--tint-teal` fill, `--teal-800` text | the same plus the ring |

Tilt and glare run only for `(hover: hover) and (pointer: fine)`. Every hover state is released when the pointer leaves.
Focus is never less visible than hover (A-16).

### 6.5 Reduced motion (`prefers-reduced-motion: reduce`)

- Every transition and animation at 0.01 ms; no reveal gating (`.rv` removed at once); no parallax; the field fixed in its
  dawn state; `--p` fixed at 0; the river drawn as usual (it never animates).
- The hero video element is never created and never gets a source (G17); the poster shows.
- Tilt, glare and lift transforms off (colour, outline and underline feedback stay); button sheen off; carousel scroll
  instant; drawer and dropdowns open without slides; `details` open without animation.
- The stability probe (A-11) also runs under reduced motion.

### 6.6 Other motion

Dropdowns fade and slide 6 px (220 ms). The drawer slides 380 ms. Carousel scrolls smoothly. Accordions animate height
(3.26). Nothing moves on its own except the hero loop (calm, IMAGE-PLAN 7) while it is on screen.

---

## 7. Performance rules

| item | budget or rule |
|---|---|
| JavaScript | one deferred file, 10 KB gzipped or less (prototype 7.2 KB); no framework; no third-party script |
| CSS | one file, 22 KB gzipped or less |
| Fonts | Atkinson roman 34 KB (preload), RFEC Figures 8 KB or less (preload), italic 37.6 KB on demand; `font-display: swap` |
| Home weight after a full scroll at 1440 | 900 KB or less including the hero loop (prototype 766 KB with its loop) |
| Interior weight (desktop and phone DPR 3) | 320 KB or less, excluding user-started video and the two pages' lazy map iframes (prototype 491/590 KB) |
| Video | home hero only; created after `load`; never with `autoplay` in the markup; skipped for reduced motion, Save-Data, `effectiveType` slow-2g/2g/3g and `prefers-reduced-data`; paused off-screen; sources swap on a `matchMedia` change; caps in IMAGE-PLAN 7 |
| Animation | `transform` and `opacity` only; 0 infinite CSS animations; no animated `filter`; no `mix-blend-mode`; one rAF loop, idle when not scrolling |
| Idle cost | 0.05 s of renderer plus GPU per 5 s or less sitting mid-page at 1440 (headless method of the usability judge; prototype 0.007-0.021) |
| Backdrop filters | 6 or fewer intersecting any viewport; blur 20 px or less; never on an element whose transform animates continuously |
| Images | every `img` with `width`, `height`, `alt`, `decoding="async"`; `loading="lazy"` below the first screen; the LCP image `fetchpriority="high"` with a preload; `srcset` from P1; `sizes` from the rendered width including cover crops (`k = frameFraction x max(1, (frameH/frameW) x (srcW/srcH))`); painted magnification 1.25x or less at DPR 2 where the source allows |
| Layout shift | CLS 0.02 or less; the first screen does not move at load (A-11) |
| Third parties | 0 runtime third-party requests on load on every page; YouTube and map iframes only on their own pages and lazy |
| River | built after `load` and one idle callback; redraw only on resize (2.8 A2) |
| Measurement | the local server is uncompressed and has no Range support, so its byte and timing numbers are upper bounds; perf A/B needs a warm-up, ABBA order and n of 5 or more; real-GPU numbers are not measurable here (Q-14) |

---

## 8. Accessibility rules

- **Structure:** one `h1` per page; `main#main` (skip target), `header`, `nav` (labelled "Main", "Breadcrumb", "Footer",
  "Mobile"; non-visible authored labels, declared), `aside` labelled by its location title, `footer`. Heading order
  without gaps on the home (statement as `p`; insurance and news headings at h2; post titles at h3; declared).
- **Keyboard:** everything reachable and operable; dropdowns (3.2), drawer (`dialog`, 3.2), carousel (track arrows, dot
  buttons), accordions, tables (focusable scroll region). Focus order follows the DOM (article, CTA, aside).
- **Focus visible:** `:focus-visible` 3 px solid with 3 px offset everywhere; `--teal-700` on light, `--navy-700` around
  teal buttons and on the lavender band, `--teal-200` on navy; cards show the ring on the card. Focus is at least as visible
  as hover. `@media (forced-colors: active)`: outlines `Highlight`, surfaces `Canvas`, the river and the field hidden.
- **Targets:** 44x44 or more for every control that is not an inline text link, at every width (U2).
- **Contrast:** WCAG AA from rendered pixels (text hidden, background sampled per line box, aurora frozen at three phases,
  the hero video seeked): 4.5 body, 3 large text and UI. Measured at 1280x585 (real scrollbar), 390x844, 1440x900 and 768
  (A-5). Text never sits directly on a pool, on the river or on a photo without a surface.
- **Images:** alt exactly as the model gives it; decorative and generated ambient images `alt=""`; generated stand-ins in
  content slots carry a literal description of what is depicted (IMAGE-PLAN), never the refused photo's alt; placeholders
  `role="img"` with the person's or brand's name; no generated person anywhere.
- **Motion:** 6.5; nothing flashes (IMAGE-PLAN 7 calmness rule, WCAG 2.3.1); no autoplaying carousel.
- **Media:** native controls on the practice's videos; captions and transcripts do not exist on disk (WCAG 1.2.2 needs
  captions for prerecorded video with audio; Q-9).
- **Language and labels:** labels in name match visible text (no `aria-label` that drops the visible words, WCAG 2.5.3);
  phone links `tel:239-500-2020` (C01); external links that open a new tab keep `rel="noopener"`.
- **Zoom and reflow:** usable at 200% text zoom and 320 CSS px width with no horizontal scroll (A-4).
- **No-JS:** the script adds `js` to `<html>` first thing. Without it (`html:not(.js)`): nothing is reveal-gated, there is
  no river and no video, the main nav shows at every width as a wrapped list of links below the logo with every dropdown's
  children as a nested list, and the menu button is hidden. All content and every link stay reachable.

---

## 9. Open questions for the operator

Defaults are applied so the build can proceed; each is reversible.

| id | question | default in this spec |
|---|---|---|
| Q-1 | Digits from Lexend ("RFEC Figures") site-wide, or only in chrome and data (phone, hours, dates, NAP)? | site-wide (one rule, no slashed zero anywhere) |
| Q-2 | The CTA band adds the chrome call action "239-500-2020" beside the page's own appointment button (a chrome repeat, no new words) | on, declared |
| Q-3 | Review times ("a week ago") are frozen at the crawl date (OPEN-DECISIONS Q3) | verbatim inside `<time datetime>`; recommend printing the absolute date from `reviewedAt` |
| Q-4 | The Dry Eye Treatment and Patient Forms home cards carry each other's wrong text | verbatim, flagged |
| Q-5 | The AlumierMD logo's alt is empty in the model (its source alt was a file name) | empty; recommend "AlumierMD" as a declared repair |
| Q-6 | The home hero uses a 4:3 crop of the 1920 px practice photo at every width; the 1190 px phone file is the same scene at lower resolution | crop at all widths, phone file declared superseded |
| Q-7 | Initials on portrait placeholders ("KN", "ML", "H", "X", "J") are a derived, declared addition | on |
| Q-8 | Generated illustrative images (title arches on 124 page models, 10 stock stand-ins on 7 pages, the hero loop): practice approval | used, AI-labelled, decorative or literally described |
| Q-9 | The three practice videos (63 MB, no captions): ship as is, add captions, or move to YouTube with captions | shipped as `preload="none"`; captions needed for AA |
| Q-10 | Brand-system promotions adopted by this design: the lavender band beyond the home, the navy aurora footer, teal underlined links, a hover state on the top-level nav (BRAND-SYSTEM 8.10) | adopted; sign-off requested |
| Q-11 | Sidebar map: a static "Open in Google Maps" card (no iframe on 131 pages) instead of the keyless embed | static card; live lazy map only on `/hours-location/` and the location page |
| Q-12 | Legal text: the privacy policy's placeholder clause and the disclaimer after its vendor sentences were removed | verbatim, flagged for counsel |
| Q-13 | The six `/template/*` pages | kept noindex; recommend 410 or 301 at launch |
| Q-14 | A real-device performance pass (GPU, mid-range phone) before launch | required before launch; headless numbers only so far |
| Q-15 | The optional kids' glasses cut-out on the Back-to-School callout (G19) | included if it passes review within budget |
| Q-16 | Pipeline additions P1-P7 (4.3) | P1-P4 and P7 required; P5 and P6 optional |

Still open from earlier stages and unchanged by this spec: the five people's photos and the Bajio photo, the content
licence, Cherry (link mode needs its application URL), the form endpoint and notice, the HIPAA PDF, the 8 soft-broken
aliases (OPEN-DECISIONS A and B).

---

## Appendix A. Acceptance checks

Each check needs a positive control that is shown to fire before its pass counts. Sizes: 2.4's list. Sample pages: the
home and one page of each family (the dry-eye interior, a blog post, a team page, a builder hub, the appointment form, the
location page, a legal page, an archive, the sitemap, `404.html`); the content gates (A-1) run on all 149 outputs.

| id | check | pass | control |
|---|---|---|---|
| A-1 | Content gates `node tools/run-gates.mjs` (sentence and short-text parity, words added, link parity, KEEP images, SEO, tag balance, link check, model check) | all PASS | the gates' own controls |
| A-2 | Horizontal overflow at 360-1920 (40 px sweep) and the size list | `scrollWidth <= clientWidth` | a planted 2000 px box |
| A-3 | Console and network | 0 errors, 0 failed requests, 0 third-party requests on load | a planted 404 |
| A-4 | Reflow at 320 px and 200% text | no horizontal scroll, no clipped text | as A-2 |
| A-5 | Rendered-pixel contrast | 0 AA failures | `#9a9a9a` text must fail |
| A-6 | Keyboard: dropdowns (Enter, ArrowDown, Escape), drawer (trap, Escape, focus return, scroll lock), carousel, accordions | all pass | a planted unfocusable control |
| A-7 | Landmarks and headings | one h1, main, aside, nav labels, no heading gaps on the home | a planted second h1 |
| A-8 | Duplicate ids | 0 | a planted duplicate |
| A-9 | Targets | every non-inline control 44x44 or more; the desktop nav on one row at its breakpoint and at 1280 | a planted 5x15 link |
| A-10 | First screen | home: statement, CTA and the whole h1 visible at load at 1280x585; long-form pages: the h1 and the start of the first content block at 1280x585 (h1 of 3 lines or less), the first content block within 700 px at 390x844; no first-screen text with opacity below 1 | a planted hidden h1 |
| A-11 | Stability | navbar height, hero frame height and the h1's top equal (0 px) at 0.5 s, 3 s and 15 s after load at 1280x585, 1440x900 and 390x844, with and without reduced motion; CLS 0.02 or less | a planted write-back loop |
| A-12 | Hidden while visible | no element with opacity below 1 whose painted rect intersects the viewport for more than 600 ms, at every scroll step of a natural scroll | a planted gated photo |
| A-13 | River | over copy only inside occluder shapes; pixel-step scan along vertical and horizontal lines across every over-copy boundary: no step above 12 per channel except at the occluder's own edge; 0 unshielded text within 40 px of the centre line; unique gradient ids; at least one in-front crossing in the first two phone screens | a planted rectangular clip must fail |
| A-14 | Protrusions | 0 intersections with text or control boxes (inflated 6 px, grown by parallax) at every size and the sweep; crossings at least 48/32 px (lens 64) | a planted box over the h1 |
| A-15 | Shadow order | blur of plane 3 shadows greater than plane 2's | swap two tokens |
| A-16 | Hover and focus parity | for each component, focus produces the same computed deltas as hover (minus tilt) plus a visible ring; nothing remains after leave | remove one focus rule |
| A-17 | Logo | sha256 of the shipped logo files equal to `assets/source`; rendered width 180 px (769 px up) and 145 px (768 down); no filter, opacity or blend | a re-encoded copy |
| A-18 | Digits | `CSS.getPlatformFontsForNode` on the phone pill, NAP, hours, dates: digits from RFEC Figures | a planted Atkinson-only node |
| A-19 | Measure and phone column | 60-75 characters per line on 3 paragraphs per sample page at 1280, 1440, 1920; prose column 358 px at 390; no centred paragraph longer than 3 lines | a planted 900 px paragraph |
| A-20 | Shortcodes and fabrication | no `[a-z]+ get=` in `dist`; no generated image whose alt is not empty or its IMAGE-PLAN alt | a planted shortcode |
| A-21 | Budgets | the numbers of section 7 | a planted 500 KB image |
| A-22 | Idle and jank (headless, 3 runs, report median and range) | idle as section 7; frames over 33 ms 1% or less during a scripted scroll | reduced-motion run as the low control |
| A-23 | Injected CMS page (the usability judge's `tmp/panel/_judge-use/make-inject.mjs` block: lists, table, form, quote, long URL) on the interior template | styled controls 44 px or more, no overflow, 0 contrast failures, 0 occlusions at 1440 and 390 | the unstyled scaffold must fail |
