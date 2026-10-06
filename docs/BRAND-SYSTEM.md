# Brand system — Riverside Family Eye Care redesign

Status: **measured** (sections 1-4, 6, 7) plus a clearly labelled **PROPOSAL** (section 5), brand stage of
workflow wf1, 2026-10-01. Nothing here is in `src/styles/` yet. Every figure comes from files already on disk
(the live site was not requested) and was produced by a script in `tmp/wf1/brand/`, named in each row.
Anything that could not be verified is marked **UNVERIFIED**. The verify-brand stage (same day) recomputed every
figure with independent scripts in `tmp/wf1/verify-brand/`, corrected errors in place, and lists each check in
the closing **Verification record**.

The practice's identity is a **navy + teal pair taken from its own logo** (logo ink `#1d2b70` and `#13a89e`).
On the site it appears as navy `#1e2c70` (top bar, nav links, hero statement) and a deeper teal `#03756d`
(buttons, badges, icons, the short underline under the home's section headings), on white. Section bands
are grey `#efefef` and lavender `#bec2d7`, body ink is a violet-grey `#464451`, and text is set in Verdana
throughout (exceptions: the 11px search buttons in Arial, the third-party payment widget in Montserrat, and one
pasted home callout in a system-ui stack). The proposal keeps all of those as anchors. It adds an aurora layer: four equal-lightness light
pools (teal, sky, the source lavender, violet) under light glass, and a deep version on near-black navy for
the CTA band and footer. Its two new hues are derived from hues the brand already uses.

## 1. Evidence used (all from disk)

| source | what it gave | read with |
|---|---|---|
| `tmp/capture/baseline/<page>.<w>.json`, 11 interior pages x 390/768/1024/1440 (44 captures; every capture count in this document is over these). The home's own 4 captures (`index.<w>.json`) were written at 12:14-12:15, after this document; the verification record uses them to check the home facts | computed colour, background, border and font of every recorded (visible) element, by region and role (section 3, 6); logo boxes, shapes, loaded fonts | `palette.mjs` -> `palette.json`, `bands.mjs`, `typo.mjs`, `captureinfo.mjs`, `dump.mjs` |
| `audit/raw/index.html` + the sheets the home actually applies (`5845-layout.css`, `5861-layout-partial.css`, 57 inline `<style>` blocks) | the home's bands, hero, heading sizes and underlines, hover rules, header/footer markup (the home had no valid capture when this was written, see below) | `homebands.mjs` -> `homebands.{content,header,footer}.txt`, `underlines.mjs` |
| `audit/raw/*.html` (148 pages) | site-wide counts of colour literals, invalid CSS, config blocks, logo references | `sitecolors.mjs` -> `sitecolors.txt`, `commands.sh` |
| `tmp/live/home-1440.png` (1440x9776), `home-390.png` (390x14901) | exact band colours and their y-ranges on the live home, from pixels (not viewed) | `shotbands.mjs` |
| `tmp/live/home-1440-s0.png`, `-s3.png`, `-s5.png` | **viewed** (3 of the 4 image views): header, hero, lavender band, footer | eyes |
| `assets/source/` logo, icon and photo files | logo bytes and pixels (section 2), imagery (section 7) | `png.mjs`, `logopx.mjs` -> `logopx.json`, `ascii.mjs`, `logoholes.mjs`, `photostats.mjs`, `contactsheet.mjs`, `checksheet.mjs` |
| `audit/image-inventory.json` (307 entries, 269 on disk), `audit/failures.json` (37 x HTTP 403, 1 x 404) | logo roles and reuse, JSON-LD logo use, image origins, refused files, the promo image's colours | `imageinv.mjs` |
| `audit/css/*.css` (46 sheets), `assets/fonts/` (85 files), `audit/font-inventory.json` (86 entries) | `@font-face` families (section 6) | `fontfaces.mjs` -> `fontfaces.json` |
| `audit/content-inventory.json` (148 pages) | tone counts; every quote checked verbatim (section 4) | `tone.mjs` + `quotes.json` |
| proposal maths | every token, composite and contrast ratio in section 5 | `aurora.mjs` -> `aurora.json`, `aurora.md`; `oklch.mjs`, `oklch-fields.mjs`; `splice.mjs` inserts the generated blocks |

**When this document was written (12:03), the home page had no computed-style capture.** Its four files were
named `C-Program-Files-Git.*.json` and recorded `chrome-error://chromewebdata/` (the `skipped` list that
`palette.mjs` wrote to `palette.json` at 12:02 shows all four). The capture was given the path `/`, which Git
Bash rewrote to `C:/Program Files/Git/` (`tmp/capture-run.log`). Home facts were therefore taken from its raw
HTML, the stylesheets it applies, and pixel sampling of the two live screenshots; the 11 valid pages share the
header, footer and sidebar templates with the home, so those are measured there. **A valid home capture was
written at 12:14-12:15**, after this document: `tmp/capture/baseline/index.{390,768,1024,1440}.json` (the same
data is merged into `audit/capture/baseline.index.*.style.json`, which replaced the error-page versions). It
records 1,270-1,302 of 1,698 elements (flag `truncated: true`) but includes the footer, legal bar and widget.
The capture counts below stay over the 11 interior pages. Every home colour and size taken from CSS or pixels
was checked against the home capture and holds (verification record, H rows), and the capture measures the
review stars. Band heights agree with the screenshot too, but below the first lavender band the capture's
bands sit 250 px higher, because its page is 250 px shorter (9,526 vs 9,776); the pixel y-ranges quoted in
section 3 describe the screenshot. A capture
records rendered elements only: none with `display:none`, `visibility:hidden` or opacity 0, though 426 of the
22,000 elements recorded across the 48 captures have a zero-size box (contact-us at 1440, for example,
records 337 of its 669 elements). It omits `background-color` only when it is the default `rgba(0, 0, 0, 0)`
(76 `rgba(255, 255, 255, 0)` values are recorded), and it does record `background-image` where one is set
(12 interior elements, the 500 px opening bands of the three hub pages, plus 2 rows in each home capture).

**Two theme sheets are not linked as stylesheets on 146 of 148 pages, but their rules are applied.**
`themes/_default/css/public.css` and `themes/flex/style.css` are linked as `rel='UNUSEDstylesheet'` on 146 of
148 pages (`commands.sh`), yet their rules are inlined there. All 60 rules of `flex/style.css` and 534-781 of
the 2,353 rules of `public.css` (22.7-33.2%) appear verbatim in those pages' inline `<style>` blocks
(`tmp/wf1/verify-brand/v-inlined.mjs`). On the other 2 pages, `/contact-us/appointment-request-form` (one of
the 11 captured pages) and `/contact-us/contact-form`, both sheets are linked as `rel='stylesheet'` and applied
in full. The platform defaults cited below (`a,body{color:#464451}`, `html{font-size:14px}`, the heading em
sizes) are `flex/style.css` rules, and the dropdown hover fill and the breakpoint rules are `public.css` rules.
The two files were not read on their own as evidence here; their effect reaches this document through the
inline CSS and the captures.

**Image views (4 in total):** `home-1440-s0.png`, `-s3.png`, `-s5.png`, and `tmp/wf1/brand/contactsheet.png`.
The slices are the 1440 page scaled to 1100 px wide (factor 0.764), so s0, s3 and s5 cover page y 0-1649,
4948-6598 and 8247-9776. The contact sheet was defective on its first build. Cell 07 was the only RGBA cell,
and the build lost cells 01-07, so the viewed image shows only cells 08-20. Forcing `rgb24` on every cell
fixed it. The rebuild was verified cell by cell (`checksheet.mjs`: 20/20 cells match their sources; the
defective build fails 20/20, which is the positive control). The author did **not** view the rebuilt sheet,
so cells 03-07 (staff photo, four staff portraits) went unseen at writing time; cells 01-02 (practice
interior) were seen as the hero background in s0. The verifier viewed the rebuilt sheet and the 988 px logo
(2 further image views; section 7 and the verification record).

## 2. The logo

Every practice brand file on disk, read from the bytes (`logopx.mjs`, PNG chunks decoded with Node `zlib`):

| file (`assets/source/`) | format | intrinsic | transparency | ink colours (opaque pixels) | where used |
|---|---|---|---|---|---|
| `5569c741-Riverside-Family-Eye-Care-Logo-01.png` | PNG, 8-bit RGBA (colour type 6), chunks IHDR, sRGB, gAMA, pHYs; 19,885 bytes; sha256 `bedcf407...c35c59` | **300 x 121** | **transparent ground**: all four corners alpha 0; 28,085 px fully transparent, 4,753 partial (anti-aliasing), 3,462 opaque of 36,300 | navy family 3,100 px, mean `#1e2d75`, most frequent exact `#1d2b70` (726 px); teal family 362 px, mean `#14b0a6` | **desktop header** (`.ecp-logo`, CSS `max-width:180px`, rendered 179.98 x 72.59 CSS px at 1024 and 1440); JSON-LD: 5 of the home's 7 `ld+json` blocks name it (LocalBusiness, MedicalBusiness, Optician, "MedicalSpecialty :: Optometric", Organization). Referenced on 148 of 148 pages |
| `c7424d19-Riverside-Family-Eye-Care-Logo.png` | PNG, 8-bit palette (197 colours) + tRNS; 20,900 bytes; sha256 `93b13ab7...37a092` | **988 x 400** | **transparent ground**: corners alpha 0; 325,847 px transparent, 13,629 partial, 55,724 opaque of 395,200 | exact `#1d2b70` 49,252 px and `#13a89e` 6,001 px: the two inks. The other 471 opaque pixels are near variants such as `#0f1f68` and `#12afa1` | **mobile header** (`.ecp-mobile-header__logo`, `width:145px`, rendered 145 x 58.7 at 390 and 768). On 143 pages: every page except the 5 crawled `template-*` pages |
| `1fcd3523-Riverside-Family-Eye-Care-OG-Logo.png` | PNG, 8-bit RGB, **no alpha** (colour type 2), chunks IHDR, pHYs, iTXt; 109,134 bytes; sha256 `a67bb2a6...ccdc9a` | 1200 x 628 | **white ground** (corners `#ffffff`, 662,312 px exact white) | `#1d2b70` 51,992 px, `#13a89e` 6,077 px; ink box 1068 x 402 at (71, 95) | `og:image` and `twitter:image` on the home only (1 of 148 pages; every page has some `og:image`) |
| `9f9fe19d-, a87e194e-, 6a877997-, 86fc78b5-cropped-Screenshot-2023-10-17-at-15.41.04-{32x32,180x180,192x192,270x270}.png` | PNG RGBA, but **alpha 255 on every pixel**; 1,626 / 25,447 / 25,681 / 52,424 bytes | 32, 180, 192, 270 square | **opaque**, white square corners `#fefefe` | the eye mark on a grey-lavender disc inside a teal ring. The disc's most frequent colour is `#b8bbc9` in the 32, 180 and 192 files and `#b8bcca` in the 270 file (14,071 px); teal `#51a89b`, navy `#292c57`, the most frequent teal and dark-navy pixels of the 180 and 270 files (not the master inks: a screenshot crop, as the file name says) | head of the home: `<link rel="icon">` 32x32 and 192x192, `apple-touch-icon` 180x180, `msapplication-TileImage` 270x270 |

The inventory's other five `LOGO/BRAND` entries are not the practice's (`imageinv.mjs`):

- `Cibalogo.png` (alt "Alcon")
- `eyeglass_guide_logo.png`
- `AlumierMD_Logo_Gry.png`
- `Thumbnail-contacts-brands.jpg`, a lens-case photo given the wrong role
- the platform's `eyecarepro-logo.svg`, in the legal bar of 142 pages

The inventory labels the four site icons `BACKGROUND`.

Desktop shows `Logo-01.png` at 1.67 image pixels per CSS pixel. On a 2x screen it is upscaled, so it will
look soft; the visual effect is UNVERIFIED (a dpr-1 capture cannot show it). The mobile header uses the 988 px
file at 6.8 image px per CSS px. **The footer carries no practice logo.** Its only image is the platform's
`eyecarepro-logo.svg` (90 x 25) in the legal bar.

**The mark (eye + wave)**, read from ASCII colour maps of the 988 and 300 px files (`ascii.mjs`) and seen in
s0. The wordmark is "Riverside" above "Family Eye Care", in navy. To its right is an almond eye outline with
lashes fanning above it and a solid navy iris. **The iris highlight is a transparent hole**, not white
(`logoholes.mjs`). A row through the iris of the 300 px file reads navy ring, 12-15 fully transparent pixels
(rows y33-y41; 15-17 with the anti-aliased edge), navy ring. The file has 1,396 enclosed see-through pixels
(alpha < 128) in all, counting letter counters, so whatever
sits behind the logo shows through the pupil. Two parallel sweeping strokes, teal above navy, start above
the wordmark and run down to and beneath the eye. They read as a river wave (the "Riverside" idea). The
site icons repeat the eye, lashes and teal sweep on a grey-lavender disc. The wordmark typeface is **not
identified (UNVERIFIED)**.

**Logo inks vs site colours.** Logo navy `#1d2b70` and site navy `#1e2c70` differ by 1 unit in R and G, so
they are one colour. The site's UI teal `#03756d` has the same OKLCH hue as the logo teal `#13a89e` (186.5
deg vs 187.2 deg, `oklch.mjs`) but is darker (L 0.507 vs 0.660). The UI teal is therefore the logo teal
deepened until it can carry white text (5.57 on white; the logo teal gives 2.95).

Usage rules for the redesign:

- Use the files as they are. Never redraw, recolour, trace or AI-upscale them.
- Use the **988 x 400 `Logo.png` at every width**. It stays sharp up to 494 CSS px on a 2x screen; the
  300 px desktop file does not.
- The transparent ground sits cleanly on white, `--ground`, the aurora tints and light glass. The navy ink
  disappears on navy or dark surfaces, and **no reversed (light) version is on disk** (open item, section 8).
  The deep-aurora footer of section 5 needs that decision before it can carry the logo.
- og:image and JSON-LD keep their current files. Favicons stay as they are unless the practice supplies a
  master (section 8).

## 3. Source palette — measured, by element

Counts are elements that own direct text (text colour), or visible elements with a painted background or
border, summed over the 11 captured pages (`palette.mjs`; "11/11" = on every captured page). Home-only
facts are marked *home CSS* (`homebands.mjs`) or *pixels* (`shotbands.mjs`, exact screenshot colours).

| colour | role on the live site | evidence |
|---|---|---|
| `#1e2c70` **navy** | top bar background; main nav link text; home hero statement; hover fill of teal buttons and social circles | top bar `div.fl-row-content-wrap` 1440 x 88 and 390 x 104, 11/11; *pixels*: home y 0-87 at 1440 and 0-103 at 390. Nav link text: 66 elements at 1440 (6 per page, 14px/400). *Home CSS*: "Comprehensive Eye Care" 65px/700. `:hover{background-color:#1e2c70}` on 144 pages. Third party: the Cherry "Pay over time" button (11/11) and its widget config `primaryColor`/`ctaColor` |
| `#03756d` **teal (UI)** | button fill, sidebar badges, footer social circles, icon glyphs, the 2 px underline under section headings, dropdown links, top-bar button hover | theme config block `.ecp-icon ... {color:#03756d} .ecp-badges .ecp-badge{background-color:#03756d} .ecp-button{background-color:#03756d}` on 148/148 pages. Footer social circles 44 (4 per page, 39 x 39, radius 50%); footer button 11 (radius 5px at every width); sidebar badges 14 on 7 pages (290 x 46, radius 0); content badges 8 on 4 pages (`captureinfo.mjs` for radii). *Home CSS*: 12 visible 2px underlines, under 9 section headings and the 3 lavender-band callout titles (`underlines.mjs`). Dropdown links on 144 pages; ghost-button hover fill + border on 143 pages |
| `#13a89e` **teal (logo)** | the logo's teal stroke; band colour on one page | logo pixel mode (section 2). `/eyeglasses/designer-frames` bands `#13a9a0`, `rgba(19,169,160,.6)`, `rgba(129,198,188,.97)` (layout 57, 1 of 148 pages). The Envision promo image's button is `#15aca1` |
| `#464451` **body ink** | body copy, links, breadcrumb, interior headings, home section headings | platform default `a,body{color:#464451}`. At 1440: 167 body-text elements in the main column, 126 in the sidebar, 72 links in the main column and 14 in the sidebar (its phone and e-mail links). Headings: 73 of 76 heading text elements; the exceptions are one white (on a dark band), one `#424242` and one `#941221` (`typo.mjs`). Home section headings set only size and underline, so they inherit it (seen in s0, s3, s5; the home capture confirms every home heading computes `#464451` except the news heading) |
| `#bec2d7` **lavender band** | 2 full-width home bands: "Unique Optical / Fort Myers Eye Exams / Contact Us" and "Insurances We Accept..." | *home CSS* `rgba(64,77,138,0.34)` (rows 11 and 16), which over white is exactly `#bec2d7` (control in `aurora.mjs`). *Pixels*: exactly `#bec2d7` at 1440 y 5523-6240 (718 px) and 8434-8940 (507 px); at 390 y 7371-9263 and 12632-13277. *Home capture*: both rows compute `rgba(64, 77, 138, 0.34)` (1440 x 718 and 1440 x 507). Also the panel colour of the Envision promo PNG (580,471 px). Home only (1 of 148 pages) |
| `#efefef` **grey band** | home bands (services, Dr. Degler, emergencies); 500 px opening band of the hub pages | *pixels* at 1440: y 1621-3165, 4078-4733, 7265-7808. Captures: 5 bands on 4 pages at 1440 (eye-care-services, insurance, our-eye-doctors x2, hours-location; `bands.mjs`). In the inline CSS of 146 pages (the other 2 apply `public.css`, which also contains it) |
| `#000000` **black** | footer band; mobile-header icon buttons | footer `fl-row-content-wrap` on 11/11 pages: 1440 x 339 (390 x 561) on 6 pages (the appointment form, FAQ, eye-care-services, hours-location, insurance, our-eye-doctors) and 1440 x 318 (390 x 540) on 5 (contact-us, eyeglass-basics, the Dr. Degler page, the dry-eye post, whats-new); the home capture's is 1440 x 339. *Pixels* at 1440: y 9356-9694. Mobile buttons: 2 per page at 390 (42 x 42); the config leaves `background-color:` empty, so the platform's `background:#000` stays |
| `#ffffff` **white** | page ground, header main bar, legal bar; text on navy, teal and black | `html` 11/11; main bar 1440 x 99 and 390 x 79; legal bar 1440 x 81 and 390 x 131. Text on dark at 1440: 44 footer menu links, 22 footer text, 22 footer links, 22 top-bar button labels, 11 footer button labels, 11 top-bar links |
| `#757575` grey | legal-bar text and rules | 55 link elements at 1440 (5 per page, 13px); 44 `li` left dividers; legal bar top border 11/11 |
| `#424242` dark grey | outlined hub-page buttons ("SCHEDULE AN APPOINTMENT", 1px border, radius 0); 2 px rules; gallery captions | 3 buttons on 3 pages; `hr` 3 on 3 pages; *home CSS* gallery captions `#424242` 20px |
| `#595959` dark grey band | 2 bands on `/hours-location` (address block, emergency callout), white text | 25 white text elements on them (`bands.mjs`) |
| `#263e4a` slate | home news heading (40px/400) | *home CSS*; seen in s5; home capture: 40px/400 at 1024/1440, 34px at 390/768 |
| `#941221` dark red | one 28px/700 heading on `/our-eye-doctors`, on `#efefef` | 1 element |
| `#e1e1e1`, `#cccccc`, `#f5f5f5`, `#767676` | FAQ accordion borders (29 on the FAQ page, fill 3% black); search field borders (11 pages); dropdown hover fill (inline CSS); browser-default form borders | `palette.mjs` border and background tallies |
| `#ff0000` | required-field asterisks | 5 on the appointment form |

The mobile hamburger computes to `#464451` at 390. The desktop menu instance's `#333f47` hamburger rule
renders at neither 1024 nor 1440, where the six nav links show (`captureinfo.mjs`). **The top-level nav has
no hover rule** (only dropdown items get a `#f5f5f5` fill). **Links are the same colour as body text**
(`#464451`). In the main column 70 of the 72 links at 1440 are underlined (69 compute it, one bold run sits
inside an underlined link), and that underline is all that distinguishes them. A phone and an e-mail link in
the main column and the sidebar's 14 phone and e-mail links carry no underline, so nothing does.

**Invalid source CSS** (browsers drop these declarations; `sitecolors.mjs`): `color:##000000!important` on
145 pages (top-bar buttons and callout buttons; the computed text is white or inherited instead). On the
home, `##888888` (review dates, `.ecp-rating-time`) and `#rgb(0,53,96)` (review stars, `.ecp-rating-star`).
The home capture written after this document resolves the stars: they compute to `#ffd700` (gold) at 20px,
and the review dates to `#464451` (the `##888888` declaration is dropped).

### Collapsed to the brand colours

| brand colour | hex | basis |
|---|---|---|
| **Navy** | `#1e2c70` | site navy; the logo ink measures `#1d2b70` (same colour). OKLCH H 269.8 |
| **Teal, UI** | `#03756d` | button/badge/icon/underline teal; the logo hue (186.5 vs 187.2) at lower lightness |
| **Teal, logo** | `#13a89e` | logo stroke only; 2.95 on white, so decorative |
| **Lavender band** | `#bec2d7` (= `#404d8a` at 34% on white) | navy family: OKLCH H 277.1 (base `#404d8a` 272.5); the favicon disc `#b8bbc9` is 276.3 |
| **Body ink** | `#464451` | violet-grey, OKLCH H 292.4, C 0.022 |
| **Neutrals** | `#ffffff` ground, `#efefef` band, `#757575` legal, `#424242`, `#595959`, `#000000` footer | as above |

So the brand has two hue families: a **blue-violet family** (navy 269.8, lavender 272-277, ink 292) and a
**teal family** (186.5-187.2). Section 5 builds on exactly that.

## 4. Tone of voice

Quotes are verbatim and checked as exact substrings of `audit/content-inventory.json` by `tone.mjs --quotes`.
A deliberately absent control phrase returns NOT FOUND, so the check can fail.

| phrase | page |
|---|---|
| "treat every patient like a member of our own family" | `/` (Dr. Nelson section) |
| "all with personalized attention and a smile" | `/` and `/our-eye-doctors` |
| "the ultimate customer service experience" | `/` (welcome copy) |
| "helps our Fort Myers community thrive" | `/` |
| "WE'VE GOT YOU COVERED" | `/insurance` (opening band title) |
| "quality eye care to our patients is a two-way street" | `/contact-us` |

Measured markers over all 148 pages (`tone.mjs`, after removing the practice name and the address line, so
"Riverside **Family** Eye Care" does not count as "family"):

| marker | pages | occurrences |
|---|---|---|
| you / your | 123 | 2,287 |
| we / our / us | 120 | 1,197 |
| "Fort Myers" (outside the address) | 77 | 230 |
| personal / personalized / individualized / "individual attention" (bare "individual" not counted) | 66 | 87 |
| comfort / comfortable | 62 | 297 |
| family (outside the name) | 31 | 58 |
| community | 12 | 25 |
| exclamation marks | 43 | 97 |

**How the practice speaks: warm, family-centred, local and service-proud.** It speaks as "we" to "you",
almost twice as much "you". It names its town constantly, promises personal attention and a smile,
introduces a new doctor to the Fort Myers community, and ends lines with exclamation marks. It also leans
on clinical confidence: the hero statement is "Comprehensive Eye Care", with technology and
disease-management claims. The home's review band adds patients' own words: 5 signed reviews (`tone.mjs`
counts the signatures) and a "Read Google Reviews" button. The design should read **friendly,
calm and trustworthy, clean rather than luxurious**: soft light, rounded shapes, generous space, navy for
trust and teal for care. That means a soft, luminous aurora, not a neon or cosmic one. All copy stays word
for word.

## 5. PROPOSAL — aurora extension (not yet approved)

> Everything in this section is a **proposal** for the operator's chosen direction: aurora, clean and
> modern, layered depth, existing branding and tone kept. None of it is measured from the live site, except
> the anchors it names as SOURCE.

### 5.1 What it keeps, what it adds

- **Kept exactly:** navy `#1e2c70`, UI teal `#03756d` (buttons, links, the signature heading underline),
  logo teal `#13a89e` (decorative only), the lavender band `#bec2d7`, body ink `#464451`, white ground.
- **Added:** two supporting hues (sky, violet), light aurora tints and pools, deep aurora glows, four glass
  recipes and navy-tinted shadows.
- **Layers** (the "not flat" brief): layer 0 is the aurora field (`.aurora-light` on white sections,
  `.aurora-deep` on the CTA band and footer). Layer 1 is photography, which may cross section edges and
  frame edges. Layer 2 is glass panels (cards, nav bar, CTA panel). Layer 3 is text. Text never sits
  directly on a layer-0 pool; it sits on paper, ground, a tint, the lavender band, or glass.

### 5.2 The two supporting hues (derived, not picked)

- **S1 sky `#349fc9` = `oklch(0.6602 0.1124 228.5)`:** the logo teal's OKLCH lightness and chroma at the hue
  midway between the logo teal (187.2) and the navy (269.8). The source already has a colour on that hue:
  the home news heading `#263e4a` (230.9). (L and C need 4 decimals here: `oklch(0.660 0.112 228.5)` rounds
  to `#359fc8`, not `#349fc9`.)
- **S2 violet `#9485d1` = `oklch(0.6602 0.1124 292.4)`:** the same lightness and chroma at the hue of the
  source body ink `#464451` (292.4). A first pass placed it at navy + half-step (311 deg, `#a87ec5`). It
  drifted toward orchid and was dropped.
- Both stay inside sRGB at full chroma (no gamut reduction was needed, `aurora.json`). Rounded to 8-bit
  hex, they measure hue 228.7 and 292.1 (`oklch-fields.mjs`). Both are **decorative only** (3.02 and 3.21
  on white).
- The aurora therefore runs teal -> sky -> lavender (navy hue) -> violet: one analogous sweep of about 105
  OKLCH degrees.
  - The three hue anchors share one lightness: `--teal-500`, `--sky-500`, `--violet-500` at L 0.660-0.661
    after hex rounding.
  - Their pools also sit close together: `--field-teal` 0.881, `--field-sky` 0.887, `--field-violet`
    0.893. The evenness is meant to keep the field luminous rather than patchy (a design intent, not a
    measurement).
  - The lavender pool is the source band itself and is deliberately the darkest (0.817). It is the
    worst-case backdrop for light glass.

### 5.3 Tokens, aurora layers and glass (generated)

Every value below is printed by `node tmp/wf1/brand/aurora.mjs --md` and inserted by `splice.mjs`. Do not
hand-edit; change the script and re-run.

<!-- TOKENS-CSS:BEGIN (generated by tmp/wf1/brand/aurora.mjs --md; do not hand-edit) -->
```css
:root {
  --navy-700: #1e2c70;    /* SOURCE navy (top bar, nav links, hero heading, button hover; logo ink #1d2b70) | brand anchor */
  --teal-700: #03756d;    /* SOURCE theme accent (buttons, badges, icons, heading underlines) | brand anchor */
  --teal-500: #13a89e;    /* SOURCE logo teal (pixel mode of the 988x400 logo) | brand anchor, decorative only */
  --lav-300: #bec2d7;     /* SOURCE band: rgba(64,77,138,.34) over white = color-mix(in srgb, #404d8a 34%, #fff) | brand anchor */
  --ink-700: #464451;     /* SOURCE body ink | brand anchor */
  --sky-500: #349fc9;     /* oklch(0.6602 0.1124 228.5) = logo-teal L/C at the teal-navy midpoint hue | supporting hue S1, decorative only */
  --violet-500: #9485d1;  /* oklch(0.6602 0.1124 292.4) = logo-teal L/C at the hue of the source body ink #464451 | supporting hue S2, decorative only */
  --navy-950: #11183e;    /* color-mix(in srgb, #1e2c70 55%, #000) | dark aurora ground */
  --navy-900: #172257;    /* color-mix(in srgb, #1e2c70 78%, #000) | hover on navy buttons, deep text */
  --navy-100: #e9eaf1;    /* color-mix(in srgb, #1e2c70 10%, #fff) | secondary text on dark */
  --teal-800: #025b55;    /* color-mix(in srgb, #03756d 78%, #000) | link hover, button hover */
  --teal-200: #95d8d3;    /* color-mix(in srgb, #13a89e 45%, #fff) | accent text / icons / focus on navy */
  --ink-600: #5c5a66;     /* color-mix(in srgb, #464451 88%, #fff) | secondary text on light */
  --ink-900: #313039;     /* color-mix(in srgb, #464451 70%, #000) | strong text */
  --paper: #ffffff;       /* white | surface */
  --ground: #f9fafb;      /* color-mix(in srgb, #404d8a 3%, #fff) | page ground */
  --tint-teal: #e7f6f5;   /* color-mix(in srgb, #13a89e 10%, #fff) | aurora tint (text allowed) */
  --tint-sky: #ebf5fa;    /* color-mix(in srgb, sky-500 10%, #fff) | aurora tint (text allowed) */
  --tint-lav: #ecedf3;    /* color-mix(in srgb, #404d8a 10%, #fff) | aurora tint (text allowed) */
  --tint-violet: #f4f3fa; /* color-mix(in srgb, violet-500 10%, #fff) | aurora tint (text allowed) */
  --field-teal: #b3e3e0;  /* color-mix(in srgb, #13a89e 32%, #fff) | aurora pool (no direct text) */
  --field-sky: #bee0ee;   /* color-mix(in srgb, sky-500 32%, #fff) | aurora pool (no direct text) */
  --field-lav: #bec2d7;   /* lav-300 (= the source band) | aurora pool (no direct text) */
  --field-violet: #ddd8f0; /* color-mix(in srgb, violet-500 32%, #fff) | aurora pool (no direct text) */
  --glow-teal: #124a60;   /* color-mix(in srgb, #13a89e 35%, navy-950) | deep aurora pool (on navy-950) */
  --glow-sky: #1d476f;    /* color-mix(in srgb, sky-500 35%, navy-950) | deep aurora pool (on navy-950) */
  --glow-violet: #3f3e71; /* color-mix(in srgb, violet-500 35%, navy-950) | deep aurora pool (on navy-950) */
  --shade: 17 24 62;      /* navy-950 as an rgb triplet: every shadow is navy-tinted, rgb(var(--shade) / a) */
}

/* Light aurora: four pools, each an OPAQUE token fading to transparent (painting rule A), on --ground */
.aurora-light {
  background:
    radial-gradient(60% 55% at 10% 15%, var(--field-teal), transparent 70%),
    radial-gradient(55% 50% at 38% 0%, var(--field-sky), transparent 70%),
    radial-gradient(55% 55% at 70% 20%, var(--field-lav), transparent 70%),
    radial-gradient(45% 45% at 95% 5%, var(--field-violet), transparent 70%),
    var(--ground);
}
/* Deep aurora: the same rule on --navy-950 (CTA band, footer) */
.aurora-deep {
  background:
    radial-gradient(60% 70% at 15% 100%, var(--glow-teal), transparent 70%),
    radial-gradient(55% 60% at 50% 0%, var(--glow-sky), transparent 70%),
    radial-gradient(45% 55% at 62% 55%, var(--navy-700), transparent 70%),
    radial-gradient(50% 60% at 85% 90%, var(--glow-violet), transparent 70%),
    var(--navy-950);
}

/* glass-light: cards, nav bar, panels over the light aurora field (not over photos). Worst case tested: darkest point of the light aurora (pool overlap) */
.glass--light {
  background: linear-gradient(160deg, rgb(255 255 255 / 0.76), rgb(255 255 255 / 0.66));
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
          backdrop-filter: blur(18px) saturate(1.5);
  border: 1px solid rgb(255 255 255 / .70);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .9), 0 1px 2px rgb(var(--shade) / .08), 0 14px 36px -14px rgb(var(--shade) / .24);
}
@supports not (backdrop-filter: blur(1px)) { .glass--light { background: rgb(255 255 255 / 0.92); } }

/* glass-image: panels that overlap photography (protruding images). Worst case tested: pure black (darkest photo pixel) */
.glass--image {
  background: linear-gradient(160deg, rgb(255 255 255 / 0.86), rgb(255 255 255 / 0.8));
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
          backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgb(255 255 255 / .62);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .9), 0 1px 2px rgb(var(--shade) / .08), 0 14px 36px -14px rgb(var(--shade) / .24);
}
@supports not (backdrop-filter: blur(1px)) { .glass--image { background: rgb(255 255 255 / 0.95); } }

/* glass-lav: chips, active nav pill, FAQ items. Worst case tested: pure black (darkest photo pixel) */
.glass--lav {
  background: linear-gradient(160deg, rgb(236 237 243 / 0.88), rgb(236 237 243 / 0.8));
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
          backdrop-filter: blur(16px) saturate(1.6);
  border: 1px solid rgb(64 77 138 / .22);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .9), 0 1px 2px rgb(var(--shade) / .08), 0 14px 36px -14px rgb(var(--shade) / .24);
}
@supports not (backdrop-filter: blur(1px)) { .glass--lav { background: rgb(236 237 243 / 1); } }

/* glass-navy: appointment CTA panel, floating action dock. Worst case tested: pure white (lightest backdrop) */
.glass--navy {
  background: linear-gradient(160deg, rgb(30 44 112 / 0.92), rgb(30 44 112 / 0.86));
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
          backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid rgb(190 194 215 / .22);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .16), 0 1px 2px rgb(var(--shade) / .08), 0 14px 36px -14px rgb(var(--shade) / .5);
}
@supports not (backdrop-filter: blur(1px)) { .glass--navy { background: rgb(30 44 112 / 1); } }
```
<!-- TOKENS-CSS:END -->

### 5.4 Role map: where each source colour goes

| element | live site (measured) | proposal |
|---|---|---|
| top bar | `#1e2c70` band, white 14px text, ghost buttons (2px white border, radius 10px, hover fill `#03756d`) | keep the navy strip (`--navy-700`, white text 12.73); ghost pills keep the white border; hover fill `--teal-700` (white 5.57) |
| header bar + nav | white bar; logo 180 px; nav `#1e2c70` 14px/400; no hover state | `.glass--light` sticky bar over the light aurora; nav `--navy-700` (10.61 worst on glass); hover and current item = `.glass--lav` pill (6.86 worst) with a `--teal-700` underline |
| hero | practice-interior photo under a 48% white wash; 65px/700 navy statement; teal button | `.aurora-light` field; the practice-interior photo as a framed, protruding image (layer 1); statement `--navy-700`; primary button `--teal-700` |
| section headings | `#464451`, 40px on the home, with a 2px `#03756d` underline | `--navy-700`; keep the short `--teal-700` underline as the brand's signature rule |
| body, links | `#464451`; links the same colour, underlined | body `--ink-700`; links `--teal-700` **and** underlined (hover `--teal-800`); on the lavender band, links `--navy-700`, underlined |
| grey bands `#efefef` | services, doctors, emergencies | `--ground` or a `--tint-*` with glass cards |
| lavender bands `#bec2d7` | 2 home bands | kept as `--lav-300` band (text `--ink-700`, `--ink-900`, `--navy-700` only) and as the `--field-lav` pool |
| buttons | `#03756d` with white text, radius 5px (one square one, on `/hours-location`), hover `#1e2c70`; the 10px radius belongs to the top bar's transparent ghost buttons | primary `--teal-700` (hover `--teal-800`); secondary `--navy-700` (hover `--navy-900`); ghost `--navy-700` text |
| sidebar badges | `#03756d` square tiles, white 15.4px | `.glass--lav` chips with `--navy-700` text, or `--teal-700` tiles with white text |
| footer | `#000000`, white text, teal social circles | `.aurora-deep` on `--navy-950`: white body (9.58 worst), `--lav-300` muted (5.42), `--teal-200` accents (5.95); social glyphs white on `--teal-700` circles (5.57). Needs a light logo version (section 8) |
| legal bar | white, `#757575` 13px | continues the footer: `--navy-100` text on `--navy-950` (14.30) |
| mobile header buttons | black circles (config gap) | `--teal-700` (call) and `--navy-700` (appointment) circles, white glyphs |
| focus ring | not measured | `--teal-700` on light (4.64 worst), `--navy-700` on the lavender band (7.21), `--teal-200` on navy (5.18 worst); 2px offset |

### 5.5 Rules the build must keep

- **Painting rule A:** every pool, light or deep, is an opaque resolved token fading to `transparent` (as in
  `.aurora-light` and `.aurora-deep`). Overlaps are then convex mixes of the pool colours and the ground. A
  scan of that whole simplex on a 1/20 grid (`aurora.mjs`) finds no grid point darker than `--field-lav` on
  the light field. On the deep field, no grid point is lighter than `#184968` (a 50/50 teal-sky glow mix,
  fractionally lighter than any single glow). Those two extremes are the worst-case backdrops in the tables.
- **Never** paint pools as translucent base colours stacked on white, or with blend modes. Teal 32% then
  lavender 34% compounds to `#8cb0c3`, and links on light glass over it fall to 4.30 (rejected row below).
- `--teal-500`, `--sky-500` and `--violet-500` are decorative: pools, glows, strokes, illustration. Never
  text or icons on white. White text never goes on `--teal-500`. `--teal-700` is never text on navy (2.29).
- `.glass--light` only over the aurora field. Where a panel may overlap a photo (protruding images), use
  `.glass--image`, which was tested over pure black.
- Logo teal display words on navy only at 24px or larger (4.32, large-text pass).

### 5.6 Contrast (WCAG 2.x), every proposed pair

Generated by `aurora.mjs`, which exits 1 if any proposed pair misses its threshold. It did on the first run,
with five failures:

- teal links on the lavender band (3.15);
- `--ink-600` on the lavender band (3.82);
- `--lav-300` muted text on a 45% deep glow (4.47);
- the first light accent on that glow (4.15);
- the same accent on navy glass (3.67; UNVERIFIED: the first-pass navy-glass opacities were not recorded, so
  this value cannot be recomputed; the other four are recomputed in the verification record).

Each was fixed by a rule or a token change: band text rules, `--teal-200`, the glow at 35%, and denser navy
glass. Light glass was then raised to 76/66% for margin (links 4.51 -> 4.64).

Thresholds: **body 4.5**, **large 3.0** (24px, or 18.66px bold), **ui 3.0**. Each glass row composites the
fill over its worst-case backdrop at both gradient stops, plus the `@supports not` fallback (corrected by the
verification: the first version composited the fallback over white, which showed the 92% and 95% white
fallbacks as `#ffffff`; over the worst-case backdrops they are `#fafafc` and `#f2f2f2`, which lowers 8 fallback
cells but no row's worst value). As requested, the light rows include white and the
lightest aurora tint; they also include the darkest tint. The navy rows include `--navy-700`, `--navy-950`
and the lightest point of the deep aurora. "Source" rows record the live site; "rejected" rows are
alternatives that were tried or are forbidden. Neither gates.

<!-- CONTRAST-TABLE:BEGIN (generated by tmp/wf1/brand/aurora.mjs --md; do not hand-edit) -->
#### Source site as measured (record only)

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| top bar text + ghost buttons (white on #1e2c70) | `#ffffff` #ffffff | #1e2c70 #1e2c70 **12.73** | 12.73 | 4.5 body | PASS |
| main nav links (#1e2c70 14px on white) | `#1e2c70` #1e2c70 | white #ffffff **12.73** | 12.73 | 4.5 body | PASS |
| body copy, h1-h3 (#464451 on white) | `#464451` #464451 | white #ffffff **9.52** | 9.52 | 4.5 body | PASS |
| body copy on grey band (#464451 on #efefef) | `#464451` #464451 | #efefef #efefef **8.28** | 8.28 | 4.5 body | PASS |
| body copy on lavender band (#464451 on #bec2d7) | `#464451` #464451 | #bec2d7 #bec2d7 **5.39** | 5.39 | 4.5 body | PASS |
| button labels (white on #03756d) | `#ffffff` #ffffff | #03756d #03756d **5.57** | 5.57 | 4.5 body | PASS |
| interior hero button label (#424242 14px bold on #efefef) | `#424242` #424242 | #efefef #efefef **8.74** | 8.74 | 4.5 body | PASS |
| hours-location dark band (white on #595959) | `#ffffff` #ffffff | #595959 #595959 **7.00** | 7.00 | 4.5 body | PASS |
| red heading on grey band (#941221 28px bold on #efefef) | `#941221` #941221 | #efefef #efefef **7.71** | 7.71 | 3 large | PASS |
| news heading (#263e4a 40px on white) | `#263e4a` #263e4a | white #ffffff **11.23** | 11.23 | 3 large | PASS |
| legal bar links (#757575 13px on white) | `#757575` #757575 | white #ffffff **4.61** | 4.61 | 4.5 body | PASS |
| footer text (white on #000000) | `#ffffff` #ffffff | #000000 #000000 **21.00** | 21.00 | 4.5 body | PASS |
| heading underline / icons (#03756d on white, non-text) | `#03756d` #03756d | white #ffffff **5.57** | 5.57 | 3 ui | PASS |
| mobile header icon buttons (white glyph on #000000) | `#ffffff` #ffffff | #000000 #000000 **21.00** | 21.00 | 3 ui | PASS |

#### Proposed: text on light grounds (white, page ground, lightest and darkest aurora tint)

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| display + headings (navy-700) | `navy-700` #1e2c70 | white #ffffff **12.73**<br>ground #f9fafb **12.18**<br>lightest aurora tint (tint-violet) #f4f3fa **11.55**<br>darkest aurora tint (tint-lav) #ecedf3 **10.90** | 10.90 | 4.5 body | PASS |
| body text (ink-700) | `ink-700` #464451 | white #ffffff **9.52**<br>ground #f9fafb **9.11**<br>lightest aurora tint (tint-violet) #f4f3fa **8.63**<br>darkest aurora tint (tint-lav) #ecedf3 **8.15** | 8.15 | 4.5 body | PASS |
| strong text (ink-900) | `ink-900` #313039 | white #ffffff **13.02**<br>ground #f9fafb **12.46**<br>lightest aurora tint (tint-violet) #f4f3fa **11.81**<br>darkest aurora tint (tint-lav) #ecedf3 **11.15** | 11.15 | 4.5 body | PASS |
| secondary text (ink-600) | `ink-600` #5c5a66 | white #ffffff **6.75**<br>ground #f9fafb **6.46**<br>lightest aurora tint (tint-violet) #f4f3fa **6.13**<br>darkest aurora tint (tint-lav) #ecedf3 **5.78** | 5.78 | 4.5 body | PASS |
| links, eyebrows (teal-700) | `teal-700` #03756d | white #ffffff **5.57**<br>ground #f9fafb **5.33**<br>lightest aurora tint (tint-violet) #f4f3fa **5.05**<br>darkest aurora tint (tint-lav) #ecedf3 **4.77** | 4.77 | 4.5 body | PASS |
| link hover (teal-800) | `teal-800` #025b55 | white #ffffff **7.98**<br>ground #f9fafb **7.64**<br>lightest aurora tint (tint-violet) #f4f3fa **7.24**<br>darkest aurora tint (tint-lav) #ecedf3 **6.83** | 6.83 | 4.5 body | PASS |

#### Proposed: text on the retained lavender band

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| body text on the band (ink-700) | `ink-700` #464451 | lav-300 band #bec2d7 **5.39** | 5.39 | 4.5 body | PASS |
| strong text on the band (ink-900) | `ink-900` #313039 | lav-300 band #bec2d7 **7.37** | 7.37 | 4.5 body | PASS |
| headings and links on the band (navy-700, links underlined) | `navy-700` #1e2c70 | lav-300 band #bec2d7 **7.21** | 7.21 | 4.5 body | PASS |

#### Proposed: buttons

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| primary button label (white on teal-700; hover teal-800) | `#ffffff` #ffffff | teal-700 #03756d **5.57**<br>teal-800 (hover) #025b55 **7.98** | 5.57 | 4.5 body | PASS |
| secondary button label (white on navy-700; hover navy-900) | `#ffffff` #ffffff | navy-700 #1e2c70 **12.73**<br>navy-900 (hover) #172257 **14.97** | 12.73 | 4.5 body | PASS |
| ghost button label (navy-700 on white / ground) | `navy-700` #1e2c70 | white #ffffff **12.73**<br>ground #f9fafb **12.18** | 12.18 | 4.5 body | PASS |

#### Proposed: text on navy and on the deep aurora

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| body text (white) | `#ffffff` #ffffff | navy-700 #1e2c70 **12.73**<br>navy-950 #11183e **17.16**<br>lightest point of the deep aurora (pool overlap) #184968 **9.58** | 9.58 | 4.5 body | PASS |
| secondary text (navy-100) | `navy-100` #e9eaf1 | navy-700 #1e2c70 **10.61**<br>navy-950 #11183e **14.30**<br>lightest point of the deep aurora (pool overlap) #184968 **7.99** | 7.99 | 4.5 body | PASS |
| muted text (lav-300) | `lav-300` #bec2d7 | navy-700 #1e2c70 **7.21**<br>navy-950 #11183e **9.71**<br>lightest point of the deep aurora (pool overlap) #184968 **5.42** | 5.42 | 4.5 body | PASS |
| accent text / eyebrows (teal-200) | `teal-200` #95d8d3 | navy-700 #1e2c70 **7.91**<br>navy-950 #11183e **10.65**<br>lightest point of the deep aurora (pool overlap) #184968 **5.95** | 5.95 | 4.5 body | PASS |
| logo-teal display words on navy, >= 24px only (teal-500) | `teal-500` #13a89e | navy-700 #1e2c70 **4.32**<br>navy-950 #11183e **5.82** | 4.32 | 3 large | PASS |

#### Proposed: text on glass (fill composited over the stated worst-case backdrop, every stop + fallback)

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| glass-light: body (ink-700) | `ink-700` #464451 | glass-light[stop 1] over darkest point of the light aurora (pool overlap) #eff0f5 **8.36**<br>glass-light[stop 2] over darkest point of the light aurora (pool overlap) #e9eaf1 **7.93**<br>glass-light fallback (@supports not) #fafafc **9.13** | 7.93 | 4.5 body | PASS |
| glass-light: headings (navy-700) | `navy-700` #1e2c70 | glass-light[stop 1] over darkest point of the light aurora (pool overlap) #eff0f5 **11.19**<br>glass-light[stop 2] over darkest point of the light aurora (pool overlap) #e9eaf1 **10.61**<br>glass-light fallback (@supports not) #fafafc **12.21** | 10.61 | 4.5 body | PASS |
| glass-light: links (teal-700) | `teal-700` #03756d | glass-light[stop 1] over darkest point of the light aurora (pool overlap) #eff0f5 **4.90**<br>glass-light[stop 2] over darkest point of the light aurora (pool overlap) #e9eaf1 **4.64**<br>glass-light fallback (@supports not) #fafafc **5.34** | 4.64 | 4.5 body | PASS |
| glass-light: secondary (ink-600) | `ink-600` #5c5a66 | glass-light[stop 1] over darkest point of the light aurora (pool overlap) #eff0f5 **5.93**<br>glass-light[stop 2] over darkest point of the light aurora (pool overlap) #e9eaf1 **5.63**<br>glass-light fallback (@supports not) #fafafc **6.48** | 5.63 | 4.5 body | PASS |
| glass-image: body (ink-700) | `ink-700` #464451 | glass-image[stop 1] over pure black (darkest photo pixel) #dbdbdb **6.88**<br>glass-image[stop 2] over pure black (darkest photo pixel) #cccccc **5.93**<br>glass-image fallback (@supports not) #f2f2f2 **8.50** | 5.93 | 4.5 body | PASS |
| glass-image: headings (navy-700) | `navy-700` #1e2c70 | glass-image[stop 1] over pure black (darkest photo pixel) #dbdbdb **9.20**<br>glass-image[stop 2] over pure black (darkest photo pixel) #cccccc **7.93**<br>glass-image fallback (@supports not) #f2f2f2 **11.37** | 7.93 | 4.5 body | PASS |
| glass-image: links (teal-800) | `teal-800` #025b55 | glass-image[stop 1] over pure black (darkest photo pixel) #dbdbdb **5.77**<br>glass-image[stop 2] over pure black (darkest photo pixel) #cccccc **4.97**<br>glass-image fallback (@supports not) #f2f2f2 **7.13** | 4.97 | 4.5 body | PASS |
| glass-lav: chip / nav pill text (navy-700) | `navy-700` #1e2c70 | glass-lav[stop 1] over pure black (darkest photo pixel) #d0d1d6 **8.35**<br>glass-lav[stop 2] over pure black (darkest photo pixel) #bdbec2 **6.86**<br>glass-lav fallback (@supports not) #ecedf3 **10.90** | 6.86 | 4.5 body | PASS |
| glass-lav: body (ink-900) | `ink-900` #313039 | glass-lav[stop 1] over pure black (darkest photo pixel) #d0d1d6 **8.54**<br>glass-lav[stop 2] over pure black (darkest photo pixel) #bdbec2 **7.01**<br>glass-lav fallback (@supports not) #ecedf3 **11.15** | 7.01 | 4.5 body | PASS |
| glass-navy: text (white) | `#ffffff` #ffffff | glass-navy[stop 1] over pure white (lightest backdrop) #303d7b **10.10**<br>glass-navy[stop 2] over pure white (lightest backdrop) #3e4a84 **8.34**<br>glass-navy fallback (@supports not) #1e2c70 **12.73** | 8.34 | 4.5 body | PASS |
| glass-navy: accent (teal-200) | `teal-200` #95d8d3 | glass-navy[stop 1] over pure white (lightest backdrop) #303d7b **6.27**<br>glass-navy[stop 2] over pure white (lightest backdrop) #3e4a84 **5.18**<br>glass-navy fallback (@supports not) #1e2c70 **7.91** | 5.18 | 4.5 body | PASS |

#### Proposed: non-text (icons, rules, focus rings)

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| icons, rules, focus ring on light (teal-700) | `teal-700` #03756d | white #ffffff **5.57**<br>ground #f9fafb **5.33**<br>lightest aurora tint (tint-violet) #f4f3fa **5.05**<br>darkest aurora tint (tint-lav) #ecedf3 **4.77**<br>glass-light[stop 1] over darkest point of the light aurora (pool overlap) #eff0f5 **4.90**<br>glass-light[stop 2] over darkest point of the light aurora (pool overlap) #e9eaf1 **4.64**<br>glass-light fallback (@supports not) #fafafc **5.34** | 4.64 | 3 ui | PASS |
| focus ring / icons on the lavender band (navy-700) | `navy-700` #1e2c70 | lav-300 band #bec2d7 **7.21** | 7.21 | 3 ui | PASS |
| focus ring / icons on navy (teal-200) | `teal-200` #95d8d3 | navy-700 #1e2c70 **7.91**<br>navy-950 #11183e **10.65**<br>lightest point of the deep aurora (pool overlap) #184968 **5.95**<br>glass-navy[stop 1] over pure white (lightest backdrop) #303d7b **6.27**<br>glass-navy[stop 2] over pure white (lightest backdrop) #3e4a84 **5.18**<br>glass-navy fallback (@supports not) #1e2c70 **7.91** | 5.18 | 3 ui | PASS |

#### Rejected or restricted uses (record only)

| use | text | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| logo teal as text on white (teal-500) -> decorative only | `teal-500` #13a89e | white #ffffff **2.95** | 2.95 | 4.5 body | FAIL |
| logo teal as icon on white (teal-500) -> decorative only | `teal-500` #13a89e | white #ffffff **2.95** | 2.95 | 3 ui | FAIL |
| white text on logo teal (teal-500) -> never | `#ffffff` #ffffff | teal-500 #13a89e **2.95** | 2.95 | 4.5 body | FAIL |
| logo teal as text on navy (teal-500) -> large text only | `teal-500` #13a89e | navy-700 #1e2c70 **4.32** | 4.32 | 4.5 body | FAIL |
| sky-500 as text on white -> decorative only | `sky-500` #349fc9 | white #ffffff **3.02** | 3.02 | 4.5 body | FAIL |
| violet-500 as text on white -> decorative only | `violet-500` #9485d1 | white #ffffff **3.21** | 3.21 | 4.5 body | FAIL |
| teal-700 text on navy -> never | `teal-700` #03756d | navy-700 #1e2c70 **2.29** | 2.29 | 4.5 body | FAIL |
| teal-700 links on the lavender band -> use navy-700 there | `teal-700` #03756d | lav-300 band #bec2d7 **3.15** | 3.15 | 4.5 body | FAIL |
| ink-600 secondary text on the lavender band -> use ink-700 there | `ink-600` #5c5a66 | lav-300 band #bec2d7 **3.82** | 3.82 | 4.5 body | FAIL |
| first-pass accent color-mix(#13a89e 60%, #fff) on the deep glow at 45% (replaced by teal-200, glow 35%) | `teal-300 (v1)` #71cbc5 | sky-500 45% over navy-950 #21557d **4.15** | 4.15 | 4.5 body | FAIL |
| first-pass glass-light (white 72% / 60%) links over field-lav (thin margin; raised to 76% / 66%) | `teal-700` #03756d | white 60% over field-lav #e5e7ef **4.51** | 4.51 | 4.5 body | PASS |
| pools painted as stacked translucent base colours (teal 32% then lavender 34%): links on glass-light stop 2 | `teal-700` #03756d | white 66% over stacked pools #d8e4eb **4.30** | 4.30 | 4.5 body | FAIL |

proposed pairs: 31, failing: 0  
source pairs: 14, failing: 0  
positive controls: white/black 21.00, #767676/white 4.54, color-mix(#404d8a 34%, #fff) = #bec2d7
<!-- CONTRAST-TABLE:END -->

### 5.7 Not modelled (UNVERIFIED until the build's pixel check)

- `backdrop-filter: saturate()` may shift the luminance of what sits behind glass. The model uses the
  unfiltered backdrop.
- Text set directly on photographs (without glass) is not covered; the rules above forbid it.
- Real rendered composites on the busiest backdrops still need a pixel-level check on the built page.

## 6. Typography

**Measured: Verdana is the only text face.** `body{font-family:Verdana;}` is set inline on 148 of 148 pages,
with no fallback list. At 1440, 803 of 836 on-screen text-bearing elements compute to Verdana (11 "Skip to
main content" links parked at x = -10000 are not counted); Arial appears only on the 11px search buttons (11
elements); Montserrat only inside the third-party "Pay over time" widget (22 elements). All 48 valid captures
(the 44 interior ones and the home's 4) list only `Montserrat 100 900 normal` under `loadedFonts`
(`captureinfo.mjs`). The home capture adds one exception: the 18px "Unique Optical" callout text in the
lavender band carries a pasted `system-ui, -apple-system, ... "Open Sans", ...` stack (1 element per width;
the only such stack in the 148 raw pages), so it renders in the operating system's UI face. On devices
without Verdana, the rendered face is **UNVERIFIED** (the captures ran where Verdana exists).

Per role at 390 and 1440 (11 captured pages; `typo.mjs` merges identical combinations across regions and
lists at most the 4 most frequent per cell; body copy has 9 combinations at each width, links 6, content
buttons 5 at 1440):

<!-- TYPO-TABLE:BEGIN (generated by tmp/wf1/brand/typo.mjs; do not hand-edit) -->
| role | 390 (family size/weight/line-height, elements, pages) | 1440 |
|---|---|---|
| body copy (content) | Verdana 14px/400/21px (240 el, 11 pg)<br>Verdana 14px/700/21px (40 el, 8 pg)<br>Verdana 12.6px/700/18.9px (22 el, 2 pg)<br>Verdana 18px/400/27px (12 el, 4 pg) | Verdana 14px/400/21px (240 el, 11 pg)<br>Verdana 14px/700/21px (40 el, 8 pg)<br>Verdana 12.6px/700/18.9px (22 el, 2 pg)<br>Verdana 18px/400/27px (12 el, 4 pg) |
| links (content) | Verdana 14px/400/21px (63 el, 11 pg)<br>Verdana 14px/700/21px (10 el, 4 pg)<br>Verdana 17px/700/25.5px (10 el, 1 pg)<br>Verdana 18px/400/27px (8 el, 3 pg) | Verdana 14px/400/21px (63 el, 11 pg)<br>Verdana 14px/700/21px (10 el, 4 pg)<br>Verdana 17px/700/25.5px (10 el, 1 pg)<br>Verdana 18px/400/27px (8 el, 3 pg) |
| h1 | Verdana 31.5px/400/34.65px (7 el, 7 pg)<br>Verdana 28px/700/30.8px (3 el, 3 pg)<br>Verdana 22px/700/24.2px (1 el, 1 pg) | Verdana 31.5px/400/34.65px (7 el, 7 pg)<br>Verdana 28px/700/30.8px (4 el, 4 pg) |
| h2 | Verdana 28px/400/30.8px (45 el, 8 pg)<br>Verdana 28px/700/30.8px (3 el, 3 pg)<br>Verdana 14px/700/15.4px (1 el, 1 pg) | Verdana 28px/400/30.8px (45 el, 8 pg)<br>Verdana 28px/700/30.8px (3 el, 3 pg)<br>Verdana 14px/700/15.4px (1 el, 1 pg) |
| h3 | Verdana 21px/700/23.1px (9 el, 1 pg)<br>Verdana 28px/700/30.8px (3 el, 2 pg)<br>Verdana 20px/700/22px (3 el, 1 pg)<br>Verdana 24px/400/26.4px (1 el, 1 pg) | Verdana 21px/700/23.1px (9 el, 1 pg)<br>Verdana 28px/700/30.8px (3 el, 2 pg)<br>Verdana 20px/700/22px (3 el, 1 pg)<br>Verdana 24px/400/26.4px (1 el, 1 pg) |
| main nav links | not rendered | Verdana 14px/400/16.8px (66 el, 11 pg) |
| top-bar text + buttons | Verdana 14px/400/21px (11 el, 11 pg) | Verdana 14px/400/14px (22 el, 11 pg)<br>Verdana 14px/400/21px (11 el, 11 pg) |
| content buttons + badges | Verdana 15.4px/400/16.94px (22 el, 11 pg)<br>Arial 11px/400/13.2px (11 el, 11 pg)<br>Verdana 14px/700/14px (3 el, 3 pg)<br>Verdana 14px/400/14px (2 el, 2 pg) | Verdana 15.4px/400/16.94px (22 el, 11 pg)<br>Arial 11px/400/13.2px (11 el, 11 pg)<br>Verdana 14px/700/14px (3 el, 3 pg)<br>Verdana 14px/400/14px (1 el, 1 pg) |
| footer menu | Verdana 14px/400/21px (44 el, 11 pg) | Verdana 14px/700/16.8px (44 el, 11 pg) |
| footer text + links | Verdana 14px/400/21px (33 el, 11 pg)<br>Verdana 14px/700/21px (11 el, 11 pg) | Verdana 14px/400/21px (33 el, 11 pg)<br>Verdana 14px/700/21px (11 el, 11 pg) |
| footer button | Verdana 14px/700/14px (11 el, 11 pg) | Verdana 14px/700/14px (11 el, 11 pg) |
| legal bar | Verdana 13px/400/13px (44 el, 11 pg) | Verdana 13px/400/13px (55 el, 11 pg) |
| third-party "Pay over time" widget | Montserrat 14px/700/20px (11 el, 11 pg) | Montserrat 14px/700/20px (11 el, 11 pg)<br>Montserrat 12px/400/16px (11 el, 11 pg) |
<!-- TYPO-TABLE:END -->

Text sizes are the same at 390 and 1440, with three exceptions. The `/hours-location` h1 is 28px/700 at 1440
and 22px/700 at 390. The footer menu is 700 weight with a 16.8px line-height at 1440, and 400 with 21px at
390, where it converts to its mobile form. The "Request Appointment" button label on
`/team/dr-brittany-degler-od` (instance `RX0by6Jjco`) is 16px at 1024 and 1440 and 14px at 390 and 768. The
nav and top-bar buttons do not render at 390. The platform base explains the interior sizes:
`html{font-size:14px}`, `h1 2.25em` (31.5), `h2 2em` (28), `h3 1.5em` (21), `h4 1.25em` (17.5), headings
line-height 1.1, body 1.5. **Home** (*home CSS*; the home capture written after this document confirms every
large and small value below, while the medium values are CSS only):

- hero statement 65px/700 navy (35px at `ecp-breakpoint-small`, 30px at `-medium`)
- section headings and the services callout titles 40px (34px small; the insurance heading 30px small); the
  home h1 "Your Eye Doctor in Fort Myers, Florida" is the same 40px/400 (34px small)
- the lavender-band callout titles are 21px/400 at large but 34px small (home capture)
- news heading 40px/400 `#263e4a` (34px small); its four post titles are h4 16px/400
- "Cataract Co-Management in Fort Myers" is an h2 at 28px/700 at both widths (home capture)
- callout text 16px (services) and 18px (lavender band)
- post excerpts 15px, line-height 1.3; gallery captions 20px
- hero button 16px (15 medium, 14 small)

The breakpoint classes come from the `content` of `body:before`, set by `public.css` media rules (inlined on
the pages): `small` for 1-768 px, `medium` for 769-992 px, `large` from 993 px. The captures show `small` at
390 and 768 and `large` at 1024 and 1440 on all 12 pages; no captured width falls in `medium`.

**Harvested webfonts** (`fontfaces.mjs`, 78 `@font-face` rules in `audit/css`; 85 files in `assets/fonts`).
The inventory's 86 entries include `foundation-icons.eot` saved twice, once marked `cached`.

| family | files | weights / styles | declared by |
|---|---|---|---|
| Open Sans | 12 | 300-800, normal + italic | one Google Fonts `css2` request, linked on 148 of 148 pages |
| Montserrat, Poppins, Raleway, Roboto | 9 each | 100-900 | same request |
| Source Sans 3 | 8 | 200-900 | same request |
| Playfair Display | 6 | 400-900 | same request |
| Oswald | 6 | 200-700 | same request |
| Lato | 5 | 100, 300, 400, 700, 900 | same request |
| PT Sans | 2 | 400, 700 | same request |
| Slabo 27px | 1 | 400 | same request |
| EyeCarePro-Icons | 4 (eot, svg, ttf, woff) | icon font | bb-plugin icon stylesheet |
| foundation-icons | 4 (eot, svg, ttf, woff) | icon font | foundicons 3.0.0 stylesheet |
| fa-regular-400.woff2 | 1 | Font Awesome regular | a `<link rel="preload">` on the home only; no `@font-face` for it in `audit/css` (its declaring sheet is UNVERIFIED) |

The 11 Google families (76 files) are the page builder's font menu, requested on every page. Apart from
Montserrat in the widget, **none is used by the captured pages**, and only one page sets Open Sans, in
pasted vendor copy (`/contact-lenses/our-featured-brands/alcon`). They are not the brand's typography.
Choosing a typeface for the redesign is open (section 8); this document proposes none.

## 7. Imagery character

What was looked at: the hero, the lavender band and the footer in s0, s3 and s5; cells 08-20 of the first
contact sheet; pixel statistics (`photostats.mjs`) for the photos never viewed. The verifier then viewed the
rebuilt sheet (all 20 cells), which confirms the descriptions below and fills in cells 03-07.

- **The practice's own photos:**
  - The bright, white practice interior: wood-look floor, frame walls, reception desk. It is the hero at
    1920 x 800, or 1190 x 496 at 768 px and below, under a 48% white wash. Pixel stats: mean saturation
    0.17, 54% near-neutral pixels.
  - Staff and doctor portraits: 13 `GSP_UID` files on disk. Ten are square (427 or 640 px); three are
    Kristina's in other sizes (320 x 427, 607 x 640, 607 x 809) (`imageinv.mjs`).
  - A "fun" staff photo (800 x 800; alt "Friendly clinic staff smiling and waving in a hallway").
  - The author did not view the portraits or the staff photo. The luma spread of their top strips is 25-55
    over all 13 portrait files and the staff photo (`tmp/wf1/verify-brand/v-photostats.mjs`; the author's
    27-55 covered 5 of those 14 files). Viewed by the verifier (rebuilt sheet, cells 03-07), they are
    on-location photos inside the practice, not studio portraits. The staff photo shows the team leaning out
    of hallway doorways, smiling and waving. Dr. Brittany Degler wears an embroidered white coat; the other
    three wear a teal blouse, a dark top and blue scrubs with a name badge. All smile at the camera, two in
    front of the office and two in front of the frame wall, so the backdrops do differ from portrait to
    portrait.
  - Dr. Kristin Nelson's portrait (white coat, grey backdrop) was seen in s3, but all three of her files
    were refused (403) and are not on disk.
- **Stock photography, the bulk** (the licence status of each file is not recorded on disk):
  - Exam scenes at the slit lamp (a senior woman, a smiling boy); lifestyle eyewear portraits on light grey
    (a woman in oversized black frames, an older man in black frames); friends on a beach in sunglasses;
    children; a senior with dry eye; a handshake with a senior patient.
  - Bright and high-key, with soft light and white or pale-grey grounds. People smile and span every age
    and several ethnicities. Clinical equipment is shown in friendly use.
  - Common platform formats: 1280 x 480 banners, 640 x 350, 325 x 217 thumbnails, 427 x 427 squares.
- **Vendor and product images:** designer-frame campaigns (Furla's clear frames, Draper James, Charmant;
  the Bajio file was refused); contact-lens packs at 300 x 300; insurer logos; the Envision by InMode
  device promo (1366 x 512, drawn in the site's own lavender, navy and teal); the AlumierMD sunscreen banner
  (1440 x 675 background).
- **Origins** of the 254 content and background files on disk (`imageinv.mjs`):
  - 95 from the practice's upload folder (`sites/3587`; this also holds stock)
  - 109 from the platform's shared `ecp-samurai` library (53 lenses, 27 frames, 20 insurers, 9 equipment)
  - 19 platform stock defaults; 15 clipart; 16 theme, plugin and other files
- **Presentation on the live site is flat.** Lavender-band photos are square-cut with no radius; some
  callout images get a 5px radius and a drop shadow (`11px 15px 36px -13px rgba(0,0,0,.75)`). In the
  viewed slices, nothing overlaps or breaks a frame.
- 37 images were refused (HTTP 403), among them 12 portrait files of five people: Dr. Kristin Nelson,
  Dr. Maivys Longa, Heather, Xaiene and Jhonae.

## 8. Open items and UNVERIFIED

1. **Home computed styles: resolved after this document was written.** The home capture was re-run at
   12:14-12:15 (`tmp/capture/baseline/index.*.json`, merged into `audit/capture/baseline.index.*.style.json`).
   The verification record checks every home fact against it; all hold. It is flagged `truncated` (1,270-1,302
   of 1,698 elements recorded), so a fact about an unrecorded element would still need the CSS. The files in
   `audit/capture/sweeps/baseline/index.*.json` hold a QA sweep (`site-reforge/sweep@1`: missing image
   dimensions, oversized images, dead links, `noopener`, overflow), not computed styles.
2. **No reversed or vector logo.** The deep-aurora footer and any navy surface need a light version. Deriving
   one from `Logo.png` would be a new brand asset (operator or practice decision). Ask the practice for an
   SVG master.
3. **Favicons** are an opaque screenshot crop with shifted inks (teal `#51a89b`, navy `#292c57`). Keep them,
   or replace them from a master: practice decision.
4. **Wordmark typeface** not identified.
5. **Redesign typeface** not chosen. Verdana is the only measured text face; the 11 builder families
   requested on every page are unused.
6. **Home review-star colour: resolved.** Its source value is invalid CSS; the home capture shows the stars
   compute to `#ffd700` (gold, 20px).
7. **Glass `saturate()`** effect on contrast, and real-page composites, need a pixel check after the build.
8. **Photos not viewed:** the author never saw the staff photo and four portraits (cells 03-07); the
   verifier viewed all 20 sheet cells (section 7). Most of the 269 files on disk were not viewed
   individually. Imagery is characterised from 3 slices, the 20 sheet cells, alt text and pixel statistics.
9. **Refused images:** 37, including portraits of five people (Dr. Kristin Nelson, Dr. Maivys Longa,
   Heather, Xaiene, Jhonae). The redesign cannot reuse them unless the practice supplies them.
10. **Promotions to sign off** (proposal, not source):
    - the lavender band goes site-wide (today it is on 1 of 148 pages);
    - the black footer becomes `--navy-950` aurora;
    - links change from body colour to `--teal-700` (they stay underlined);
    - the top-level nav gains a hover state (the source has none).
11. The **third-party "Pay over time" widget** (Montserrat, navy) is outside the brand system. Whether it
    stays is decided elsewhere.
12. **The capture evidence changed during this stage.** The `C-Program-Files-Git.*` files were replaced by the
    home capture at 12:14-12:15. `palette.mjs` (which feeds the typography table) now excludes `index.*`
    explicitly, so it still reproduces the 11-page tallies and `typo.md` byte for byte. `bands.mjs` now also
    prints the home's 5 bands and `captureinfo.mjs` reports 48 valid captures, so read their interior lines
    when checking this document. Re-running `palette.mjs` would also rewrite the
    `skipped` list in `palette.json`, which is the only remaining record of the error-page URLs.

## Verification record

Verifier: verify-brand stage, 2026-10-01, 12:05-12:50 local. Every value was recomputed from the files on disk
with new scripts in `tmp/wf1/verify-brand/` (each `v-*.mjs` prints or writes the `*.out.txt` beside it); none
of the author's code was reused for a check. The building blocks were validated first. `vpng.mjs` is a new PNG
decoder that round-trips a planted image through all five filter types, detects a 1-byte change, and matches
ffmpeg pixel for pixel on 4 logo and icon files. `colour.mjs` implements WCAG luminance, OKLab/OKLCH,
`color-mix(in srgb)` and alpha compositing; it reproduces white/black 21.00, `#767676` on white 4.54,
`color-mix(#404d8a 34%, #fff)` = `#bec2d7`, and the CSS Color 4 reference `oklch(#ff0000)` = 0.6280 0.2577
29.23. `capload.mjs` assigns capture elements to regions by box containment (the author used document order);
roles use the element's own tag plus its selector path, because inline children of headings and links have
taller boxes than their parents (strict containment found 29 of the 76 heading texts). Fingerprints of the
home captures used (sha256 prefix): `index.390` 16b588ef845a, `index.768` b926fc104a69, `index.1024`
852423989b5d, `index.1440` 81c0f42a644c; `contact-us.1440` ac9c2ccf8ce9. The document as found is kept at
`tmp/wf1/verify-brand/BRAND-SYSTEM.before-verify.md`.

**Totals: 113 claims checked; 83 CONFIRMED, 25 CORRECTED (fixed in place above), 5 UNVERIFIABLE.** Every
"none / zero / absent" claim was paired with a positive control, named in its row.

**Changed outside this file:** `tmp/wf1/brand/aurora.mjs` (fallback composited over the row's backdrop; L/C
printed to 4 decimals; `aurora.json` and `aurora.md` regenerated and re-spliced with `splice.mjs`, which
changed exactly 10 lines of this file: 2 token comments and 8 table rows) and `tmp/wf1/brand/palette.mjs`
(home capture excluded explicitly). Before the fix, an untouched copy of `aurora.mjs` regenerated both blocks
byte for byte, twice, so every changed cell is attributable to the fix (`regen/compare-blocks.mjs`).

### Section 1: evidence

| id | claim | method | verdict |
|---|---|---|---|
| E1 | At writing, the home's 4 captures were `C-Program-Files-Git.*` recording `chrome-error://chromewebdata/`; Git Bash rewrote `/` | `palette.json` `skipped` list (written 12:02); `tmp/capture-run.log` lines `capture C:/Program Files/Git/ ... 28KB` | CONFIRMED |
| E2 | `audit/capture/baseline.index.*` recorded the same error page | those files were overwritten at 12:15 by a valid capture; no earlier copy exists | UNVERIFIABLE |
| E3 | "The home page has no computed-style capture" | `v-capmeta.mjs`: `index.<w>.json` now valid (real URL, asserted viewport, footer + widget present, `truncated: true`) | CORRECTED (superseded; text updated) |
| E4 | The home applies `5845-layout.css` + `5861-layout-partial.css` + 57 inline `<style>` blocks | link-tag listing of `audit/raw/index.html` | CONFIRMED |
| E5 | 148 pages, 46 sheets, 85 font files, 86 font entries, 307 image entries / 269 on disk, 37 x 403 + 1 x 404, 148 content pages | `v-images.mjs`, `v-fonts.mjs`, `v-raw.mjs` | CONFIRMED |
| E6 | Screens 1440x9776 and 390x14901; slices 1100 px wide (0.764); s0/s3/s5 = page y 0-1649 / 4948-6598 / 8247-9776 | IHDR reads; `v-slices.mjs` maps every slice band back to within 3 px of the full-page band | CONFIRMED |
| E7 | A capture records "visible elements only" (337 of 669 on contact-us) | `v-capmeta.mjs`: no hidden/`display:none`/opacity-0 element is recorded, but 426 of 22,000 have a zero-size box; 337/669 exact | CORRECTED (wording) |
| E8 | `background-color` recorded "only when not transparent" | 76 `rgba(255, 255, 255, 0)` values are recorded; `rgba(0, 0, 0, 0)` never is | CORRECTED |
| E9 | `background-image` is not recorded | 20 elements carry it (12 interior hub bands, 8 home rows); control: the same key probe finds `background-size` (116) and `background-position` (22,000) | CORRECTED |
| E10 | `public.css` + `flex/style.css` linked `rel='UNUSEDstylesheet'` on 146 of 148 pages | `v-raw.mjs` (control: planted link fires) | CONFIRMED |
| E11 | Those two sheets are "not applied on the live site" and "not used as evidence" | `v-raw.mjs`: linked `rel='stylesheet'` on the 2 Gravity Forms pages (one is captured); `v-inlined.mjs`: all 60 `flex/style.css` rules and 534-781 of 2,353 `public.css` rules inlined verbatim on the other 146 (controls: self 100%, planted rule 0%) | CORRECTED |
| E12 | Contact sheet: cell 07 the only RGBA cell; first build lost cells 01-07; rebuild 20/20; defective build fails 20/20 | `v-sheet.mjs`: cells regenerated from the ORIGINAL sources; ffprobe pixel formats; rebuilt sheet MAD 0.00 on 20/20; defective sheet 0/20, its positions 1-13 hold cells 08-20 exactly (13/13), 14-20 black | CONFIRMED |

### Section 2: logo

| id | claim | method | verdict |
|---|---|---|---|
| L1 | `Logo-01.png`: 19,885 bytes, sha256 `bedcf407...c35c59`, 300x121, 8-bit RGBA type 6, chunks IHDR sRGB gAMA pHYs | `v-logo.mjs` (own decoder, cross-checked with ffmpeg) | CONFIRMED |
| L2 | Its corners alpha 0; 28,085 transparent / 4,753 partial / 3,462 opaque of 36,300 | `v-logo.mjs` | CONFIRMED |
| L3 | Navy family 3,100 px mean `#1e2d75`, mode `#1d2b70` (726); teal family 362 mean `#14b0a6` | HSL hue bands as stated; a second rule (nearest of the two inks) gives the same 3,100 / 362 | CONFIRMED |
| L4 | `Logo.png`: 20,900 bytes, sha256 `93b13ab7...37a092`, 988x400, palette 197 + tRNS | `v-logo.mjs` | CONFIRMED |
| L5 | 325,847 / 13,629 / 55,724 of 395,200; `#1d2b70` 49,252, `#13a89e` 6,001; 471 near variants incl. `#0f1f68` (55), `#12afa1` (45) | `v-logo.mjs` | CONFIRMED |
| L6 | OG logo: 109,134 bytes, sha256 `a67bb2a6...ccdc9a`, RGB type 2, IHDR pHYs iTXt, 1200x628, white corners, 662,312 white, 51,992 / 6,077 inks, ink box 1068x402 at (71,95) | `v-logo.mjs` (box = pixels not near-white; 1069 wide if any non-`#ffffff` counts) | CONFIRMED |
| L7 | Favicons opaque (alpha 255 everywhere), 1,626 / 25,447 / 25,681 / 52,424 bytes, corners `#fefefe`, disc mode `#b8bbc9` (32/180/192) and `#b8bcca` 14,071 (270) | `v-logo.mjs` | CONFIRMED |
| L8 | Favicon teal `#51a89b`, navy `#292c57` | `v-logo.mjs`: these are the most frequent teal and dark-navy pixels of the 180 and 270 files (the 192 file's top teal is `#50a89a`) | CORRECTED (qualified) |
| L9 | Favicon motif: eye on a grey-lavender disc inside a teal ring | `v-iris-favicon.mjs` colour map of the 270 file | CONFIRMED |
| L10 | Home head: icon 32 + 192, apple-touch 180, TileImage 270 | `v-misc.mjs` | CONFIRMED |
| L11 | `.ecp-logo img{max-width:180px}` rendered 179.98x72.59 at 1024/1440; mobile `width:145px`, 145x58.7 at 390/768; 1.67 and 6.8 image px per CSS px; sharp to 494 CSS px at 2x | `v-raw.mjs`, `v-palette.mjs` (11/11 pages each width), arithmetic | CONFIRMED |
| L12 | 5 of the home's 7 JSON-LD blocks name `Logo-01.png` (LocalBusiness, MedicalBusiness, Optician, "MedicalSpecialty :: Optometric", Organization) | `v-misc.mjs` (the other two: WebPage, BreadcrumbList) | CONFIRMED |
| L13 | `Logo-01` on 148/148; `Logo.png` on 143 (not the 5 `template-*`); OG logo home only; `og:image` on 148; `twitter:image` OG home | `v-raw.mjs` (controls fire) | CONFIRMED |
| L14 | The other 5 LOGO/BRAND entries; site icons labelled BACKGROUND; platform logo on 142 pages | `v-images.mjs`, `v-raw.mjs` | CONFIRMED |
| L15 | The footer carries no practice logo; only the 90x25 platform SVG in the legal bar | footer/legal `img` elements in 44 interior captures and the home captures; control: the probe finds the 90x25 SVG | CONFIRMED |
| L16 | The iris highlight is a see-through hole; 1,396 enclosed pixels | `v-holes.mjs` flood fill (alpha < 128; 1,548 at alpha 0); the iris hole is the 189 px component x241-256, y30-44; control: planted 3x3 hole gives 9, opened hole 0 | CONFIRMED |
| L17 | A row through the iris shows "about 12" transparent pixels | `v-iris-favicon.mjs`: 12-15 alpha-0 pixels on rows y33-y41 (15-17 with anti-aliased edges) | CORRECTED |
| L18 | No reversed (light) or vector practice logo on disk | 12 SVGs on disk are icons plus the platform logo; no logo file name says white/reverse/light; control: the same name probe finds the 3 known practice logos | CONFIRMED |
| L19 | Mark: "Riverside" over "Family Eye Care" in navy; almond eye, fanned lashes, solid navy iris; teal stroke above a navy stroke sweeping under the eye | viewed `Logo.png` once | CONFIRMED |
| L20 | Logo navy vs site navy differ by 1 in R and G; UI teal H 186.5 L 0.507 vs logo teal H 187.2 L 0.660; 5.57 and 2.95 on white | `v-proposal.mjs` | CONFIRMED |
| L21 | Wordmark typeface not identified | no font metadata in a raster file | UNVERIFIABLE (stays open) |

### Section 3: palette (11 interior pages at 1440 unless stated)

| id | claim | method | verdict |
|---|---|---|---|
| P1 | Top bar 1440x88 / 390x104 on 11/11; navy pixels y 0-87 (1440) and 0-103 (390) | `v-palette.mjs`, `v-shots.mjs` (all-pixel edge-strip rule) | CONFIRMED |
| P2 | 66 nav link texts, 6 per page, `#1e2c70` 14px/400; six links also at 1024 | `v-palette.mjs`, `v-misc.mjs` | CONFIRMED |
| P3 | Navy `:hover` fill on 144 pages; Cherry button navy 11/11; widget config `primaryColor`/`ctaColor` `#1e2c70` | `v-raw.mjs` (148 pages carry the config), `v-palette.mjs` | CONFIRMED |
| P4 | Theme accent block on 148/148 | `v-raw.mjs`, each of its 3 declarations | CONFIRMED |
| P5 | 44 social circles 39x39 r50%; 11 footer buttons r5px at all 4 widths; 14 sidebar badges on 7 pages 290x46 r0; 8 content badges on 4 pages | `v-palette.mjs` | CONFIRMED |
| P6 | Dropdown teal links on 144 pages; ghost-button teal hover on 143 | `v-raw.mjs` | CONFIRMED |
| P7 | Layout 57 bands `#13a9a0`, `rgba(19,169,160,.6)`, `rgba(129,198,188,.97)` on 1 page; promo button `#15aca1` | `v-misc.mjs`, `v-photostats.mjs` (4,596 px) | CONFIRMED |
| P8 | Body ink: 167 main-column and 126 sidebar body texts; 73 of 76 heading texts, exceptions white / `#424242` / `#941221` | `v-roles.mjs` (selector-path roles, box regions) | CONFIRMED |
| P9 | "72 links" | `v-roles.mjs`: 72 in the main column plus 14 `#464451` sidebar links | CORRECTED (completed) |
| P10 | Lavender: `rgba(64,77,138,.34)` = `#bec2d7`, rows 11 and 16 (of 19); pixel ranges at 1440 and 390; promo panel 580,471 px; home only | `v-misc.mjs`, `v-proposal.mjs`, `v-shots.mjs`, `v-photostats.mjs`, `v-raw.mjs` (1 of 148) | CONFIRMED |
| P11 | Grey pixels y 1621-3165, 4078-4733, 7265-7808; 5 bands on 4 pages; 500 px hub opening bands | `v-shots.mjs`, `v-palette.mjs` | CONFIRMED |
| P12 | `#efefef` "in the CSS of 146 pages" | `v-raw.mjs`: inline CSS of 146; all 148 once the 2 pages' linked `public.css` counts | CORRECTED (wording) |
| P13 | Footer row 1440x339 and 390x561 on 11/11 | `v-palette.mjs`: 339/561 on 6 pages, 318/540 on 5 (same split at both widths) | CORRECTED |
| P14 | Black footer pixels y 9356-9694; mobile buttons 2 per page 42x42 black (r100px); empty `background-color:` leaves `background:#000` | `v-shots.mjs`, `v-palette.mjs`, `v-misc.mjs` (both in the same rule) | CONFIRMED |
| P15 | `html` white 11/11; main bar 99/79; legal bar 81/131; white text: 44 footer menu, 22 footer text, 22 footer links, 22 top-bar labels, 11 footer button labels, 11 top-bar links | `v-palette.mjs` (the 22 footer texts exclude 11 form labels) | CONFIRMED |
| P16 | `#757575`: 55 legal links (5/page, 13px), 44 `li` dividers, top border 11/11 | `v-palette.mjs` | CONFIRMED |
| P17 | `#424242`: 3 outlined "SCHEDULE AN APPOINTMENT" buttons (1px, r0) on 3 pages; 3 `hr` 2px | `v-palette.mjs` | CONFIRMED |
| P18 | `#595959`: 2 bands on `/hours-location`, 25 white texts on them | `v-palette.mjs` | CONFIRMED |
| P19 | `#941221`: 1 element, 28px/700, `/our-eye-doctors`, inside a `#efefef` band | `v-palette.mjs` | CONFIRMED |
| P20 | `#e1e1e1` 29 FAQ triggers with 3% black fill; `#cccccc` search borders on 11 pages; `#767676` form borders; 5 red asterisks | `v-palette.mjs` | CONFIRMED |
| P21 | Hamburger `#464451` at 390; none rendered at 1024/1440 | `v-palette.mjs` | CONFIRMED |
| P22 | The top-level nav has no hover rule; only dropdown items get `#f5f5f5` | `v-raw.mjs`: 0 of 148 (inline + applied CSS); control: the probe fires on a planted top-level rule, and the dropdown rule is found on 148 | CONFIRMED |
| P23 | Links are distinguished only by their underline | `v-roles.mjs` + `text-decoration-line`: 70 of 72 main-column links underlined; 2 + 14 phone/e-mail links are not | CORRECTED |
| P24 | `##000000` on 145 pages (top-bar and callout buttons); home `##888888` (review dates), `#rgb(0,53,96)` (stars) | `v-raw.mjs`, `v-misc.mjs` (selectors `.ecp-rating-time`, `.ecp-rating-star`) | CONFIRMED |
| P25 | OKLCH hues: navy 269.8, lavender 277.1, base 272.5, favicon disc 276.3, ink 292.4 / C 0.022 | `v-proposal.mjs` | CONFIRMED |

### Home facts against the home capture (written 12:14-12:15)

| id | claim | method | verdict |
|---|---|---|---|
| H1 | Hero statement 65px/700 navy (35px small); hero button 16px (14 small), teal, r5px | `v-home.mjs` by instance (`fFSp5Pv729`, `xFHN81Czny`) at all 4 widths | CONFIRMED |
| H2 | Section headings 40px (34 small; insurance 30 small); news heading 40px/400 `#263e4a` | `v-home.mjs` | CONFIRMED |
| H3 | Callout text 16px / 18px; post excerpts 15px, line-height 1.3; gallery captions 20px `#424242` | `v-home.mjs` (19.5px line-height) | CONFIRMED |
| H4 | 12 visible 2px `#03756d` underlines (9 headings + 3 lavender callout titles) | `v-home.mjs` at 390, 768 and 1440 | CONFIRMED |
| H5 | Lavender rows compute `rgba(64, 77, 138, 0.34)`; grey rows are services, Dr. Degler, emergencies | `v-home.mjs` row contents; heights match the screenshot bands (718, 507, 544, 339), positions below y 6241 are 250 px higher in the shorter capture page | CONFIRMED |
| H6 | Home headings inherit `#464451` | every home heading computes it except the `#263e4a` news heading | CONFIRMED |
| H7 | Review-star colour UNVERIFIED | stars compute `#ffd700` at 20px; dates `#464451` | CORRECTED (filled) |
| H8 | Lavender-band photos square with no radius; some callout images r5px with `11px 15px 36px -13px rgba(0,0,0,.75)` | `v-misc.mjs` (3 images 327x327 r0 at 1440), `v-home.mjs` (2 shadowed images) | CONFIRMED |
| H9 | Hero 1920x800, or 1190x496 at 768 and below; 48% white wash | capture `background-image` (2024/12 file at 1024/1440, 2025/05 file at 390/768); inventory sizes; `5845-layout.css` `:after` rule | CONFIRMED |
| H10 | Home size list complete | added the omitted computed sizes (h1 40/34, lavender titles 21/34, Cataract h2 28/700, post titles 16px) | CORRECTED (completed) |
| H11 | Verdana everywhere on the home | one pasted `system-ui` stack (18px "Unique Optical" text), the only one in 148 raw pages | CORRECTED (completed) |

### Section 4: tone

| id | claim | method | verdict |
|---|---|---|---|
| T1 | The 6 quotes are verbatim, under 12 words, on the pages named | `v-tone.mjs` exact substring per page; control phrase NOT FOUND | CONFIRMED |
| T2 | Contexts: Dr. Nelson section, welcome copy, the `/insurance` opening band title | `v-tone.mjs`, `v-misc.mjs` (28px/700 title in the 1440x500 grey band) | CONFIRMED |
| T3 | Marker table: 123/2,287, 120/1,197, 77/230, 66/87, 62/297, 31/58, 12/25, 43/97 | `v-tone.mjs` (own regexes; control: unscrubbed "family" rises to 102/296) | CONFIRMED |
| T4 | "personal / personalized / individual(ized)" label | bare "individual" is not counted (counting it gives 81/135) | CORRECTED (label) |
| T5 | 5 signed reviews; "Read Google Reviews" button | `v-tone.mjs` | CONFIRMED |
| T6 | "almost twice as much you" | 2,287 / 1,197 = 1.91 | CONFIRMED |

### Section 5: proposal maths

| id | claim | method | verdict |
|---|---|---|---|
| A1 | 27 colour tokens and `--shade` equal their stated formulas | `v-proposal.mjs` re-evaluates every `color-mix`/`oklch` comment | CONFIRMED |
| A2 | sky `#349fc9` = `oklch(0.660 0.112 228.5)` | that value rounds to `#359fc8`; the logo teal is L 0.6602 C 0.1124, which gives `#349fc9` | CORRECTED (generator prints 4 decimals) |
| A3 | Violet `#9485d1`; first pass 311 deg = `#a87ec5`; both in gamut; hex hues 228.7 / 292.1; 3.02 / 3.21 on white; sweep about 105 deg; L 0.660-0.661; field L 0.881 / 0.887 / 0.893 / 0.817; news heading hue 230.9 | `v-proposal.mjs` | CONFIRMED |
| A4 | Light field darkest = `--field-lav`; deep field lightest = `#184968` (50/50 teal-sky), fractionally lighter than any glow | own 1/20 simplex scans over the 5 colours of each field; luminance 0.05959 vs 0.05915 | CONFIRMED |
| A5 | Stacked pools give `#8cb0c3`; links on glass over it 4.30 | `v-proposal.mjs` | CONFIRMED |
| A6 | First-run failures 3.15, 3.82, 4.47, 4.15 | recomputed from their stated colours | CONFIRMED |
| A7 | First-run failure 3.67 (accent on navy glass) | first-pass navy-glass opacities are not recorded anywhere | UNVERIFIABLE |
| A8 | Light glass raised to 76/66% (links 4.51 -> 4.64) | `v-proposal.mjs` | CONFIRMED |
| A9 | Every contrast cell: ratio matches its hexes, worst = minimum, PASS/FAIL vs threshold | `v-proposal.mjs` parses all 7 tables | CONFIRMED |
| A10 | Glass fallbacks composited over the worst-case backdrop | the 92% and 95% white fallbacks were composited over white; 8 cells corrected (9.52 -> 9.13, 12.73 -> 12.21, 5.57 -> 5.34 twice, 6.75 -> 6.48, 9.52 -> 8.50, 12.73 -> 11.37, 7.98 -> 7.13); no worst value or verdict changes | CORRECTED |
| A11 | 31 proposed pairs / 0 failing; 14 source / 0 failing; 12 restricted rows | row counts (the restricted table has 11 FAIL + 1 PASS) | CONFIRMED |
| A12 | Role-map figures (12.73, 5.57, 10.61, 6.86, 9.58, 5.42, 5.95, 14.30, 4.64, 7.21, 5.18) and the live column (ghost buttons 2px white r10px, hover teal; hero teal button) | table cells; captures | CONFIRMED |
| A13 | Live buttons "`#03756d` ... radius 5-10px" | teal-filled buttons are 5px (one square); 10px is the transparent top-bar ghost buttons | CORRECTED |
| A14 | Controls line: white/black 21.00, `#767676` 4.54, `#bec2d7` | `colour.mjs` | CONFIRMED |

### Section 6: typography

| id | claim | method | verdict |
|---|---|---|---|
| F1 | `body{font-family:Verdana;}` on 148/148; 803 of 836 at 1440; Arial 11 (search buttons); Montserrat 22 | `v-raw.mjs`, `v-roles.mjs` (836 excludes 11 off-screen skip links) | CONFIRMED |
| F2 | "All 44 valid captures" list only Montserrat | true for all 48 valid captures now | CORRECTED (count updated) |
| F3 | Typography table cells | `v-roles.mjs` rebuilds every cell independently; each cell's top 4 match | CONFIRMED |
| F4 | The table is the full set of combinations | each cell is the top 4 (body copy has 9) | CORRECTED (stated) |
| F5 | "Two exceptions" to equal sizes at 390 and 1440 | a third: the team page's `RX0by6Jjco` button, 16px vs 14px | CORRECTED |
| F6 | Platform base: `html` 14px, h1-h4 2.25/2/1.5/1.25em, line-heights 1.1 / 1.5 | inline CSS (`flex/style.css` rules) | CONFIRMED |
| F7 | Breakpoint widths UNVERIFIED | `body:before` content rules: small 1-768, medium 769-992, large 993+; captures: small at 390/768, large at 1024/1440 | CORRECTED (filled) |
| F8 | 78 `@font-face` rules; 85 files; 86 inventory entries incl. `foundation-icons.eot` twice, one `cached` | `v-fonts.mjs` | CONFIRMED |
| F9 | Family table (files, weights, declaring sheets) | `v-fonts.mjs`; icon fonts eot/svg/ttf/woff each | CONFIRMED |
| F10 | `fa-regular-400.woff2`: home-only preload, no `@font-face` | `v-fonts.mjs`, `v-raw.mjs`; control: the same probe finds the Lato faces | CONFIRMED |
| F11 | 11 Google families = 76 files, unused in the captures except Montserrat; only `/contact-lenses/our-featured-brands/alcon` sets Open Sans | `v-fonts.mjs` (the home names Open Sans only as a fallback inside its pasted stack) | CONFIRMED |

### Section 7: imagery

| id | claim | method | verdict |
|---|---|---|---|
| I1 | Hero photo: saturation 0.17, 54% near-neutral | `v-photostats.mjs` | CONFIRMED |
| I2 | 13 portrait files (10 square 427/640; Kristina 320x427, 607x640, 607x809); staff photo 800x800 with its alt | `v-images.mjs` (ffprobe) | CONFIRMED |
| I3 | Top-strip luma spread 27-55 | 25-55 over all 13 portrait files and the staff photo | CORRECTED |
| I4 | Cells 03-07 never seen | viewed the rebuilt sheet; description added | CORRECTED (filled) |
| I5 | Stock scenes (slit lamp senior and boy, eyewear portraits on grey, beach friends, children, dry-eye senior, handshake) | viewed the rebuilt sheet | CONFIRMED |
| I6 | Vendor images (Furla, Draper James, Charmant on disk; Bajio refused); lens packs 300x300; promo 1366x512 in brand colours; sunscreen banner 1440x675; platform formats | `v-images.mjs`, `v-photostats.mjs` | CONFIRMED |
| I7 | 254 files = 95 + 109 (53/27/20/9) + 19 + 15 + 16 | `v-images.mjs` | CONFIRMED |
| I8 | All three of Dr. Kristin Nelson's files refused | `v-images.mjs` (`kristin` x3) | CONFIRMED |
| I9 | Her portrait in s3 shows a white coat on a grey backdrop | s3 not re-viewed; the file is not on disk | UNVERIFIABLE |
| I10 | In the viewed slices nothing overlaps or breaks a frame | slices not re-viewed | UNVERIFIABLE |
| I11 | 37 refused, incl. 12 portrait files of 5 people (Kristin, Maivys, Heather, Xaiene, Jhonae) | `v-images.mjs`; doctors' full names from the `/our-eye-doctors` headings | CONFIRMED |

### Scripts

| id | claim | method | verdict |
|---|---|---|---|
| X1 | The token CSS and contrast tables are generated by `aurora.mjs`, not hand-typed | an untouched copy regenerated both blocks byte for byte, twice, and matched `aurora.md` | CONFIRMED |
| X2 | All scripts in `tmp/wf1/brand/` can be re-run to the same figures | after the home capture arrived, `palette.mjs` counted 12 pages; patched to exclude `index.*`, it reproduces the saved tallies and `typo.md` byte for byte | CORRECTED |
