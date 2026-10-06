# Image inventory - Riverside Family Eye Care (redesign imagery map)

Generated 2026-10-01 by `tmp/wf1/imagery/report.mjs` from evidence already on disk (crawl of 2026-10-01). No live request was made. Companion data: `audit/image-classification.json` (one record per inventoried image, Clifton schema plus additive fields). Scripts, sheets and notes: `tmp/wf1/imagery/`. Independently verified and corrected in place the same day (scripts in `tmp/wf1/verify-imagery/`); every change is listed in the final section, "Verification record". The main change: the home page was re-captured after this report was first generated, so the home sizes in section 2 now come from that capture instead of the screenshot.

**In one paragraph.** The inventory holds 307 images: 269 files on disk and 38 that were never downloaded. Every one of the 269 files was looked at (257 rasters on 10 contact sheets, 12 SVGs read as text). The practice has its own photography (32 files on disk: team portraits and patient-care scenes in its own exam rooms and optical, uploaded 2024-2025, plus office and equipment photos and a staff event photo), which supplies the home hero and all six page-header backgrounds; none of it may be replaced by generated people. 114 images are third-party marks or products (frame, lens and device makers, InMode, Alumier MD, Transitions) to keep exactly as they are. Stock content (94 images; 57 of the 70 on disk are 640 px wide or less) is where generated imagery can stand in. Twelve of the not-downloaded files are the practice's own people (five team members), so their slots need placeholders and the originals from the practice. 71 of 148 pages show no content image at all.

## 1. Classes

| Class | All 307 | On disk 269 | Not downloaded 38 | Meaning for the redesign |
|---|---|---|---|---|
| logo-brand | 7 | 7 | 0 | The practice's own logo, social logo and site icons. Keep; ask for vector masters. |
| platform-ui-drop | 26 | 25 | 1 | EyeCarePro / Gravity Forms UI: icons, sprites, spinner, seasonal decorations, vendor and tool marks, default 404 art. Drop. |
| background | 1 | 1 | 0 | Stock row/section background with no people. Keep or replace (aurora backgrounds may stand in). |
| content-photo | 94 | 70 | 24 | Stock and library content imagery (models, eye close-ups, banners, thumbnails, clipart diagrams). Candidates for generated stand-ins. |
| content-person-real | 44 | 32 | 12 | The practice's own doctors, staff, patients-at-the-practice and office. Never replaced by a generated person. |
| brand-product | 114 | 113 | 1 | Third-party marks and products: lens packs, frame/lens/device makers, InMode, Alumier MD, Transitions. Keep as is, never regenerate. |
| functional | 21 | 21 | 0 | Insurance carrier and payment/financing logos. Keep as is on neutral chips. |
| decorative | 0 | 0 | 0 | Purely ornamental imagery. None found: every ornamental file belongs to the platform (platform-ui-drop). |

Subclasses (class/subclass: count):

`background/section-background-stock` 1 · `brand-product/contact-lens-brand-logo` 4 · `brand-product/contact-lens-brand-tile` 4 · `brand-product/contact-lens-product` 53 · `brand-product/device-product` 10 · `brand-product/frame-brand-campaign` 9 · `brand-product/frame-brand-logo` 27 · `brand-product/lens-brand-campaign` 3 · `brand-product/skincare-brand` 2 · `brand-product/treatment-brand-ad` 2 · `content-person-real/doctor-portrait` 7 · `content-person-real/patient-care-at-practice` 7 · `content-person-real/practice-office` 10 · `content-person-real/staff-group` 2 · `content-person-real/staff-portrait` 18 · `content-photo/educational-diagram` 3 · `content-photo/stock-banner` 17 · `content-photo/stock-category-thumbnail` 28 · `content-photo/stock-cutout` 1 · `content-photo/stock-photo` 44 · `content-photo/video-poster-third-party` 1 · `functional/insurance-carrier-logo` 19 · `functional/payment-financing-logo` 2 · `logo-brand/practice-logo` 2 · `logo-brand/practice-og-logo` 1 · `logo-brand/site-icon` 4 · `platform-ui-drop/form-plugin-ui` 6 · `platform-ui-drop/platform-404-illustration` 1 · `platform-ui-drop/platform-icon` 8 · `platform-ui-drop/platform-theme-decoration` 9 · `platform-ui-drop/platform-tool-logo` 1 · `platform-ui-drop/platform-vendor-logo` 1

How computed: `classify.mjs` applies ordered rules to each image's URL path and file name (first match wins), then the facts recorded from the views (`view-notes.md`) for depiction, baked-in text, marks and cut-out suitability. Class precedence where two apply: a real person or the practice's office wins over its role, so the six page-header backgrounds and the home hero background are `content-person-real`, not `background`. Origin of each file is in the `provenance` field: practice-uploads (sites/3587) 136, ecp-asset-store (ecp-samurai/contact-lenses) 53, ecp-asset-store (ecp-samurai/designer-frames) 27, ecp-shared-library (uploads/images) 20, ecp-asset-store (ecp-samurai/insurances) 20, ecp-shared-library (clipart) 17, platform-theme 12, ecp-asset-store (ecp-samurai/equipment) 9, platform-plugin (gravityforms) 6, ecp-shared-library (network uploads) 4, other-site-uploads (sites/1775) 1, youtube 1, eyecarepro.net (platform vendor) 1.

## 2. Key images: intrinsic vs rendered size

Rendered sizes are css px at a 1440 px viewport unless a column says otherwise. Sources: the computed-style captures `tmp/capture/baseline/<page>.<width>.json` for 12 pages: the 11 inner pages, mapped to files by `rendered.mjs`, and the home, mapped by `tmp/wf1/verify-imagery/v05-rendered.mjs`. Each `<img>` is matched to its file through its selector's node, instance and post ids in `audit/raw`. For the 240 `object-fit: fill` images with a non-zero height, the drawn box has the same aspect ratio as the file (within 3%). The only exception is the platform's 100x100-declared EyeCarePro SVG.

**Home capture: re-run.** The first home capture recorded `chrome-error://chromewebdata/`: Git Bash mangled the "/" argument into a Git install path. Those files are now in `tmp/capture/invalid-pathconv/` (`C-Program-Files-Git.*.json`, `baseline.index.*`). The home was captured again at 2026-10-01T04:14:50Z to 04:15:01Z, which is after this report was first written (04:12Z). The new files are `tmp/capture/baseline/index.{390,768,1024,1440}.json` and `audit/capture/baseline.index.*.style.json`. They record https://www.riversidefamilyeyecare.com/ with the title "Eye Doctor in Fort Myers \| Riverside Family Eye Care" and 1270 to 1302 of the page's 1698 elements (the capture is marked `truncated: true`).

The first version measured the home from the screenshot `tmp/live/home-1440.png` (`measure-home.mjs`, `refine-home.mjs`). Those values agreed with the capture to within 0 to 8 px. The one exception was the Draper James gallery tile, which was 14 px off. One flag changed: Pediatric-eye-exam.jpg. One slot was added: the Alumier MD logo. The home sizes below are the capture's.

Flags: **LOW-RES-FOR-ROLE** = the file is drawn larger than its own pixels at a captured width (upscaled), or a hero/page-header file is under 1920 px (the minimum for a full-bleed 1440 slot in the redesign). **below 2x** = the file is under twice its drawn width at 1440 (soft on retina screens). For `background-size: cover` the drawn size is the cover-scaled image, not the box.

### 2.1 Home hero

| File | Class | Intrinsic | Rendered at 1440 | File/drawn | Flag |
|---|---|---|---|---|---|
| Riverside-Family-Eyecare-practice-interior-wide-shot.jpg | content-person-real | 1920x800 | 1440x601 box (cover: drawn 1442x601); 1024: 1024x601 box (drawn 1442x601) | 1.33x | below 2x at 1440 |
| Riverside-Family-Eyecare-practice-interior-wide-shot-ne... | content-person-real | 1190x496 | mobile variant (<= 768 px, `background-position: 64% 0%`): 768: 768x202 box (cover: drawn 768x320); 390: 390x202 box (drawn 485x202) | 1.55x at 768, 2.45x at 390 | ok for its <= 768 px role; LOW-RES-FOR-ROLE for any desktop use (< 1920) |

The hero is a full-bleed row background (layout 5845, node `628403d67c08a`) under a 48% white wash (`rgba(255,255,255,0.48)` in the layout CSS). On top sit the navy headline (capture: `rgb(30, 44, 112)`, 65 px) and a teal button (`rgb(3, 117, 109)`). It is the practice's real interior, not stock. At 1440 the 1920x800 file covers the 1440x601 box at scale 0.751: the box is drawn 1442 px wide and 2 px are cropped. That is 1.33x: fine at 1x, short of 2x (2880 px). At 768 and 390 the row is only 202 px tall. The `-new` file is the same scene at 1190x496 (perceptual hash distance 0; 32x32 grey correlation 1.00).

### 2.2 Home sections, top to bottom

| Row | File | Class | Module | Intrinsic | Rendered at 1440 | File/drawn | Flag |
|---|---|---|---|---|---|---|---|
| 1 | Riverside-Family-Eyecare-practice-interior-wide-shot.jpg | content-person-real | row background (layout CSS) | 1920x800 | 1440x601 box (cover: drawn 1442x601) | 1.33x | below 2x at 1440 |
| 1 | Riverside-Family-Eyecare-practice-interior-wide-shot-ne... | content-person-real | row background (layout CSS, (max-width: 768px)) | 1190x496 | not used at 1440 (768: 768x202 box, drawn 768x320) | 1.55x at 768 | ok for its <= 768 px role; LOW-RES-FOR-ROLE for any desktop use (< 1920) |
| 4 | 1-81.png | brand-product | ecp-image | 1366x512 | 1146x430 | 1.19x | below 2x at 1440 |
| 5 | Eye-exam-on-elderly-patient.jpg | content-person-real | ecp-callout | 1280x853 | 636x424 | 2.01x | ok |
| 5 | happy-man-at-computer_560x560px.jpg | content-photo | ecp-callout | 559x560 | 424x424 | 1.32x | below 2x at 1440 |
| 5 | patient-form_639x639px.jpg | content-photo | ecp-callout | 639x639 | 415x415 | 1.54x | below 2x at 1440 |
| 5 | Pediatric-eye-exam.jpg | content-person-real | ecp-callout | 1280x853 | 645x430 | 1.98x | below 2x at 1440 |
| 6 | 1008-100525001-Sunscreen-Reformulation-ShopifyBanners-N... | brand-product | row background (layout CSS) | 1440x675 | 1100x410 box (cover: drawn 1100x516) | 1.31x | LOW-RES-FOR-ROLE (upscaled at 390 and 768: the row is 748-750 px tall there, so the file is drawn about 1597x749, 0.90x); below 2x at 1440 |
| 6 | AlumierMD_Logo_Gry.png | brand-product | ecp-callout | 600x112 | 343x64 | 1.75x | below 2x at 1440 |
| 7 | Child-Serious-Preschool-1280x480-e1541434177535-640x240... | content-photo | ecp-callout | 640x240 | 490x184 | 1.31x | below 2x at 1440 |
| 7 | Dry-Eye-Senior-Woman-1280x480-640x240.jpg | content-photo | ecp-callout | 640x240 | 490x184 | 1.31x | below 2x at 1440 |
| 8 | brittany_GSP_UID_9cde0fdb-5f4b-45df-b8ff-c44fadddc1d5.jpeg | content-person-real | ecp-list-team | 640x640 | 400x400 | 1.60x | LOW-RES-FOR-ROLE (upscaled at 768 on /our-eye-doctors) |
| 9 | kristin_GSP_UID_a1668e7c-baf3-4e92-bfdf-a57139cb8999.jpeg | content-person-real | ecp-list-team | n/a (HTML declares 750x750) | 400x400 |  | NOT ON DISK |
| 10 | aa-woman-with-glasses-01-427x427.jpg | content-photo | ecp-callout | 427x427 | 327x327 | 1.31x | below 2x at 1440 |
| 10 | Man-Wearing-Black-Glasses-01-427x427.jpg | content-photo | ecp-callout | 427x427 | 327x327 | 1.31x | below 2x at 1440 |
| 10 | Happy-three-People-on-the-Beach-with-Sunglasses-01-427x... | content-photo | ecp-callout | 427x427 | 327x327 | 1.31x | below 2x at 1440 |
| 11 | Img_0001_furla-glasses-banner-550-pixels.jpg | brand-product | ecp-gallery | 500x500 | 250 wide (height not recorded) | 2.00x | ok |
| 11 | young-woman-bajio-sunglasses.jpg | brand-product | ecp-gallery | n/a | 250 wide (height not recorded) |  | NOT ON DISK |
| 11 | Img_0003_draper-james-debut.jpg | brand-product | ecp-gallery | 500x500 | 250 wide (height not recorded) | 2.00x | ok |
| 11 | Img_0002_Charmant-CHTP-vintage_man_icons_A1_EN_high.jpg | brand-product | ecp-gallery | 500x500 | 250 wide (height not recorded) | 2.00x | ok |
| 13 | Eye-doctor-shaking-elderly-patients-hand.jpg | content-person-real | ecp-image | 800x800 | 344x344 | 2.33x | ok |
| 14 | Fun-photo-of-Riverside-Family-Eyecare-staff.jpg | content-person-real | ecp-image | 800x800 | 345x345 | 2.32x | ok |

Row = index of the Beaver Builder row inside `<main>` (from `scan.mjs`; it equals nth-of-type minus 1 in the capture selectors). A flag looks at every captured page and width of that file. So Dr. Brittany Degler's portrait is flagged here for its 728 px slot on /our-eye-doctors at 768; on the home it is 350, 360, 354 and 400 px at 390, 768, 1024 and 1440.

Other home widths: no content image other than the Alumier band is upscaled at 390, 768 or 1024. The next-lowest ratios are the three 427 px callouts at 768 (drawn 360 px, 1.19x) and the hero at 1024 (drawn 1442 px, 1.33x). Every other ratio is 1.40x or more. The Alumier band background is listed once although the page sets it twice (layout CSS and a lazy `data-background-image-src`).

The four gallery images had not loaded when the capture ran (box height 0), so only their 250 px width is recorded. The first version's screenshot measurements of them were 236-250 px wide and 248-250 px tall. The two not-on-disk slots (Dr. Kristin Nelson, Bajio) are visible in the screenshot: the live CDN served them to the browser, and only the harvester got HTTP 403.

### 2.3 Page-header backgrounds

All six inner page headers use the same template: the first row in `<main>`, a left column of 50.07% (50% on /insurance) with `min-height: 500px` and `background-size: cover` (the layout-CSS rules of each node are printed by `tmp/wf1/imagery/checks.mjs`). Captured on three pages; the other three have identical rules, so their size is derived, not measured.

| Page | File | Class | Intrinsic | Rendered box at 1440 | Other widths (captured) | Flag |
|---|---|---|---|---|---|---|
| /contact-lenses | Eye-doctor-helping-patient-with-contact-lenses.jpg | content-person-real | 1280x853 | ~721x500 box (derived from identical CSS; cover: drawn ~750x500) | not captured | LOW-RES-FOR-ROLE (< 1920 for a full-bleed redesign hero/header) |
| /eye-care-services | Eye-care-services.jpg | content-person-real | 1280x853 | 721x500 box (cover: drawn 750x500) | 390: 390x500, 768: 768x500, 1024: 513x645 | LOW-RES-FOR-ROLE (< 1920 for a full-bleed redesign hero/header); below 2x at 1440 |
| /eyeglasses | Eyeglass-frames-display-wide-shot.jpg | content-person-real | 1280x853 | ~721x500 box (derived from identical CSS; cover: drawn ~750x500) | not captured | LOW-RES-FOR-ROLE (< 1920 for a full-bleed redesign hero/header) |
| /insurance | Insurance-image.jpg | content-person-real | 1280x853 | 720x500 box (cover: drawn 750x500) | 390: 390x500, 768: 768x500, 1024: 512x500 | LOW-RES-FOR-ROLE (< 1920 for a full-bleed redesign hero/header); below 2x at 1440 |
| /our-eye-doctors | Eye-doctor-performing-eye-exam-on-young-patient.jpg | content-person-real | 1280x853 | 721x500 box (cover: drawn 750x500) | 390: 390x500, 768: 768x500, 1024: 513x560 | LOW-RES-FOR-ROLE (< 1920 for a full-bleed redesign hero/header); below 2x at 1440 |
| /the-staff | IMG_7898-scaled.jpeg | content-person-real | 2560x1920 | ~721x500 box (derived from identical CSS; cover: drawn ~721x541) | not captured | ok |

Other row backgrounds (not page headers):

| Page (row) | File | Class | Intrinsic | Rendered | Note |
|---|---|---|---|---|---|
| / (row 6) | 1008-100525001-Sunscreen-Reformulation-ShopifyBanners-N... | brand-product | 1440x675 | 1100x410 box (cover: drawn 1100x516); 1024: 1024x410 (drawn 1024x480); 768: 768x750 (drawn 1599x750, upscaled 0.90x); 390: 390x748 (drawn 1596x748, upscaled 0.90x) | Alumier MD sunscreen tubes on a pale grey ground (left third); LOW-RES-FOR-ROLE on phones and tablets |
| /contact-lenses (row 3) | BGs-Recovered.jpg | background | 1650x700 | not captured | two contact lenses and a water splash on white |
| /eyeglasses/designer-frames (row 3) | chanel-sunglasses-row-1.jpg | brand-product | 1600x303 | not captured | pale band with pink Chanel sunglasses at the right end |

### 2.4 Doctor and staff portraits

| Person | Role | Files on disk | Not downloaded | Shown in page bodies on | Rendered | Flag |
|---|---|---|---|---|---|---|
| Dr. Brittany Degler, O.D. | doctor | 427x427 (og only), 640x640 | - | /, /our-eye-doctors | / 1440: 400x400; / 1024: 354x354; / 768: 360x360; / 390: 350x350; /our-eye-doctors 1024: 272x272; /our-eye-doctors 1440: 272x272; /our-eye-doctors 390: 350x350; /our-eye-doctors 768: 728x728 | LOW-RES-FOR-ROLE (upscaled at 768) |
| Erica | staff | 427x427 (og only), 640x640 | - | /team/erica-eis, /the-staff | not captured | not measured: see the note under this table |
| Nancy | staff | 427x427 (og only), 640x640 | - | /team/nancy, /the-staff | not captured | not measured: see the note under this table |
| Rose | staff | 427x427 (og only), 640x640 | - | /team/rose-johnson, /the-staff | not captured | not measured: see the note under this table |
| Asma | staff | 427x427 (og only), 640x640 | - | /team/asma-sahees, /the-staff | not captured | not measured: see the note under this table |
| Heather | staff | none | 427x427 (og), full size | /team/heather, /the-staff | not captured | NOT ON DISK: placeholder + ask the practice |
| Kristina | staff | 320x427 (og only), 607x640, 607x809 | - | /team/kristina, /the-staff | not captured | not measured: see the note under this table |
| Xaiene | staff | none | 320x427 (og), 640x640, full size | /team/xaiene-dos-santos-da-costa, /the-staff | not captured | NOT ON DISK: placeholder + ask the practice |
| Dr. Kristin Nelson, O.D., IACMM | doctor | none | 427x427 (og), 640x640, full size (the home HTML declares it 750x750) | /, /our-eye-doctors, /team/dr-kristin-nelson-od | / 1440: 400x400; / 1024: 354x354; / 768: 360x360; / 390: 350x350; /our-eye-doctors 1440: 272x272; /our-eye-doctors 390: 350x350; /our-eye-doctors 768: 728x728 (at 1024 the slot had not loaded: 10x10) | NOT ON DISK: placeholder + ask the practice |
| Dr. Maivys Longa, O.D. | doctor | none | 427x427 (og), full size | /our-eye-doctors, /team/maivys-longa | /our-eye-doctors 1440: 272x272; /our-eye-doctors 390: 350x350; /our-eye-doctors 768: 728x728 (at 1024 the slot had not loaded: 10x10) | NOT ON DISK: placeholder + ask the practice |
| Jhonae | staff | none | 493x427 (og), 640x640 | /the-staff | not captured | NOT ON DISK: placeholder + ask the practice |

Facts behind the table: portraits are square 640x640 JPEGs (Kristina: a 607x809 PNG with 607x640 and 320x427 crops); the small variants (427x427, or 320x427 / 493x427 for Kristina, Xaiene and Jhonae) are og:image crops only. On /our-eye-doctors the team module draws them with `object-fit: cover` at 272x272 (1440), 728x728 (768, so a 640 file is upscaled) and 350x350 (390). Two team pages show no portrait in the body at all on the live site: /team/dr-brittany-degler-od (her 640 file is on disk) and /team/jhonae-anglin (her 640 file was not downloaded); both have only an og:image. Dr. Kristin Nelson's and Dr. Maivys Longa's portraits are missing from disk entirely, and so are three staff (Heather, Xaiene, Jhonae).

Note on the five "not measured" staff rows: the first version flagged them "ok", but neither /the-staff nor any team page was captured. /the-staff uses the same `ecp-list-team` module with square images (11 `ecp-post-image-format-square` in `audit/raw/the-staff.html`) as /our-eye-doctors. On /our-eye-doctors at 768 that module draws a 640 px portrait at 728 px. The same upscaling on /the-staff is likely but UNVERIFIED. For the redesign, plan these files for slots of at most 320 css px at 2x (303 css px for Kristina's 607 px files). Their `lowResForRedesign` already states these limits.

### 2.5 Other measured slots

| Slot | File | Intrinsic | Rendered (width: box) | Flag |
|---|---|---|---|---|
| /eye-care-services service tile | Thumbnail-Emerg.jpg | 325x217 | 1440:300x200 1024:275x183 768:668x446 390:290x194 | LOW-RES-FOR-ROLE (upscaled at 768) |
| /eye-care-services service tile | Thumbnail-EyeDisease.jpg | 325x217 | 1440:300x200 1024:275x183 768:668x446 390:290x194 | LOW-RES-FOR-ROLE (upscaled at 768) |
| /eye-care-services service tile | Thumbnail-contacts.jpg | 325x217 | 1440:300x200 1024:275x183 768:668x446 390:290x194 | LOW-RES-FOR-ROLE (upscaled at 768) |
| /eye-care-services service tile | Thumbnail-lasik.jpg | 325x217 | 1440:300x200 1024:275x183 768:668x446 390:290x194 | LOW-RES-FOR-ROLE (upscaled at 768) |
| /eye-care-services service tile | Thumbnail-phoropter.jpg | 325x217 | 1440:300x200 1024:275x183 768:668x446 390:290x194 | LOW-RES-FOR-ROLE (upscaled at 768) |
| /eye-care-services service tile | Thumbnail-treatments.jpg | 250x167 | 1440:300x200 1024:275x183 768:668x446 390:290x194 | LOW-RES-FOR-ROLE (upscaled at 390/768/1024/1440) |
| /eye-care-services service tile | bruce-mars-559223-unsplash.jpg | 5760x3840 | 1440:300x200 1024:275x183 768:668x445 390:290x193 | ok |
| /eye-care-services service tile | cataracts-optometrist-blog.jpg | 640x349 | 1440:300x164 1024:275x150 768:668x364 390:290x158 | LOW-RES-FOR-ROLE (upscaled at 768) |
| /hours-location (in-page image) | Exterior-shot-of-practice.jpg | 1280x853 | 1440:693x462 1024:616x410 768:728x485 390:350x233 | below 2x at 1440 |
| /hours-location (in-page image) | Interior-shot-of-practice-2-1024x682.jpg | 1024x682 | 1440:693x462 1024:616x410 768:728x485 390:350x233 | below 2x at 1440 |
| /eyeglasses/eyeglass-basics (in-page image) | glasses-tortishell_slide-640x240.jpg | 640x240 | 1440:640x240 1024:640x240 768:640x240 390:350x131 | below 2x at 1440 |
| /top-causes-of-dry-eye-in-fort-myers (in-page image) | Dry-Eye-Girl-640x350.jpg | 640x350 | 1440:640x350 1024:640x350 768:640x350 390:350x191 | below 2x at 1440 |

The 10 service tiles on /eye-care-services render at 300x200 (1440) but stretch to 668x446 at 768: every 325x217 library thumbnail is drawn at about 2x its pixels there (2 of the 10 tile files are not on disk, so they are not in this table). On /insurance, 22 logo-grid slots (20 distinct files; Aetna and CareCredit appear in both grids) render at exactly their file size, 133x110, at 1440.

## 3. The 38 images that are not on disk

`audit/failures.json` lists 38 image failures. By host and reason: 36 x da4e1j5r7gw87.cloudfront.net | refused: HTTP 403; 1 x i.ytimg.com | status 404; 1 x www.eyecarepro.net | refused: HTTP 403. (The task brief said 37 CloudFront 403s: in the evidence it is 36 from the CloudFront CDN plus 1 from www.eyecarepro.net, both HTTP 403.) Nothing was retried. What each file depicts comes from its file name and alt only (not viewed), except two that are visible in the live home screenshot.

| # | File (alt, up to 10 words) | Class | Visible on | og/meta only on | Usable sibling on disk | Consequence |
|---|---|---|---|---|---|---|
| 1 | child-learning-640x350.jpg ("child learning 640×350") | content-photo/stock-photo | /how-poor-vision-could-stunt-your-childs-academic-performance | - | 90ff202a-child-learning-640x350.jpg (640x350; same file name in another upload folder (2024/09)) | Use the on-disk sibling. |
| 2 | AdobeStock_819072843_Regular-Optometry.jpg ("AdobeStock 819072843 Regular Optometry") | content-photo/stock-photo | /why-regular-optometry-visits-are-crucial-for-managing-eye-conditions | /author/riversidefamilyeyecare (the post also uses it as its og:image) | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 3 | Child-Serious-Preschool-1280x480-e1541434177535.jpg ("Child Serious Preschool 1280×480") | content-photo/stock-banner | /eye-care-services/eye-exams/pediatric-eye-exams, /myopia-management-strategies-for-growing-children | - | 696a266e-Child-Serious-Preschool-1280x480-e1541434177535-640x240.jpg (640x240; same upload stem, other size) | Use the on-disk sibling. |
| 4 | teenage-girl-wearing-contact-lenses-640x350-1.jpg | content-photo/stock-photo | - | /myopia-management-strategies-for-growing-children, /tag/myopia-management-solutions | none | Social image only: no visible slot; set a new share image. |
| 5 | skin-model-1.jpg ("skin model") | content-photo/stock-photo | /eye-care-services/dry-eye-disease-and-treatment/envision-inmode | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 6 | Dry-Eye-Treatment_Thumbnail-1.jpg ("Woman covering one eye while experiencing eye discomfort") | content-photo/stock-photo | /eye-care-services | /eye-care-services/dry-eye-disease-and-treatment | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 7 | happy-old-couple-hugging.jpg ("happy old couple hugging") | content-photo/stock-photo | /glaucoma-awareness-starts-with-an-eye-exam | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 8 | family-wearing-eyeglasses-640.jpg | content-photo/stock-photo | - | /tag/family-eye-exams, /what-every-mom-needs-to-know-before-booking-a-family-eye-exam-at-riverside-family-eyecar | possible: 8f8cd594-happy-family-wearing-eyeglasses-640x350-1.jpg (name similarity only) | Social image only: no visible slot; set a new share image. |
| 9 | heather_GSP_UID_9ff3e7ab-e26a-4851-a607-0ec5ee9f2343-42... | content-person-real/staff-portrait | - | /team/heather | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 10 | heather_GSP_UID_9ff3e7ab-e26a-4851-a607-0ec5ee9f2343.jpeg ("Heather") | content-person-real/staff-portrait | /team/heather, /the-staff | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 11 | xaiene_GSP_UID_a011c47d-8625-4cfd-a000-9c70bb01d14f-320... | content-person-real/staff-portrait | - | /team/xaiene-dos-santos-da-costa | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 12 | xaiene_GSP_UID_a011c47d-8625-4cfd-a000-9c70bb01d14f-640... ("Xaiene") | content-person-real/staff-portrait | /the-staff | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 13 | xaiene_GSP_UID_a011c47d-8625-4cfd-a000-9c70bb01d14f.jpeg ("Xaiene") | content-person-real/staff-portrait | /team/xaiene-dos-santos-da-costa | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 14 | Dry-Eye-Africam-American-Man-640x350.jpg | content-photo/stock-photo | - | /why-some-dry-eye-treatments-dont-work-what-actually-does | 66920b80-Dry-Eye-Africam-American-Man-640x350.jpg (640x350; same file name in another upload folder (2019/10)) | Use the on-disk sibling. |
| 15 | happy-family-wearing-eyeglasses-640x350-1.jpg | content-photo/stock-photo | - | /eye-exam-faqs-what-to-expect-at-riverside-family-eye-care | 8f8cd594-happy-family-wearing-eyeglasses-640x350-1.jpg (640x350; same file name in another upload folder (2022/03)) | Use the on-disk sibling. |
| 16 | young-woman-bajio-sunglasses.jpg ("young woman bajio sunglasses") | brand-product/frame-brand-campaign | / | - | none | Third-party campaign: never regenerate; ask or drop the slot. |
| 17 | Dry-Eye-Africam-American-Man-640x350.jpg | content-photo/stock-photo | - | /dry-eyes-driving-you-crazy-heres-how-ipl-could-help | 66920b80-Dry-Eye-Africam-American-Man-640x350.jpg (640x350; same file name in another upload folder (2019/10)) | Use the on-disk sibling. |
| 18 | kristin_GSP_UID_a1668e7c-baf3-4e92-bfdf-a57139cb8999-42... | content-person-real/doctor-portrait | - | /team/dr-kristin-nelson-od | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 19 | kristin_GSP_UID_a1668e7c-baf3-4e92-bfdf-a57139cb8999-64... ("Dr. Kristin Nelson, O.D., IACMM") | content-person-real/doctor-portrait | /our-eye-doctors | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 20 | kristin_GSP_UID_a1668e7c-baf3-4e92-bfdf-a57139cb8999.jpeg ("Dr. Kristin Nelson, O.D., IACMM") | content-person-real/doctor-portrait | /, /team/dr-kristin-nelson-od | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 21 | young-woman-working-on-her-laptop_640x350.jpg | content-photo/stock-photo | - | /workplace-eye-wellness-tips-for-clearer-easier-workdays | 07417529-young-woman-working-on-her-laptop_640x350.jpg (640x350; same file name in another upload folder (2022/06)) | Use the on-disk sibling. |
| 22 | Dry-Eye-Girl-640x350.jpg | content-photo/stock-photo | - | /category/uncategorized, /top-causes-of-dry-eye-in-fort-myers | 123c59b6-Dry-Eye-Girl-640x350.jpg (640x350; same file name in another upload folder (2019/10)) | Use the on-disk sibling. |
| 23 | senior-man-suffering-from-sore-eyes.jpeg ("senior man suffering from sore eyes") | content-photo/stock-photo | /what-happens-during-a-dry-eye-assessment-a-non-invasive-exam-for-gritty-eyes-in-fort-myers | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 24 | maivys_GSP_UID_a1d67446-47bb-4117-a847-9777003a48f1-427... | content-person-real/doctor-portrait | - | /team/maivys-longa | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 25 | maivys_GSP_UID_a1d67446-47bb-4117-a847-9777003a48f1.jpeg ("Dr. Maivys Longa, O.D.") | content-person-real/doctor-portrait | /our-eye-doctors, /team/maivys-longa | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 26 | Cheerful-smiling-child-black-wearing-goggles-scaled.jpeg ("Cheerful smiling child black wearing goggles.") | content-photo/stock-photo | /eye-care-services/nearsighted-myopia | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 27 | jhonae_GSP_UID_a247f574-d8a5-4965-aa00-e8f31bd16562-493... | content-person-real/staff-portrait | - | /team/jhonae-anglin | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 28 | jhonae_GSP_UID_a247f574-d8a5-4965-aa00-e8f31bd16562-640... ("Jhonae") | content-person-real/staff-portrait | /the-staff | - | none | Real person: keep the slot with a neutral placeholder (no generated face); ask the practice for the original. |
| 29 | Close-up-of-the-red-eye-of-a-man-affected-by-an-infecti... ("Close up of the red eye of a man affected ...") | content-photo/stock-banner | /eye-care-services/dry-eye-disease-and-treatment | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 30 | Little-girl-holds-glasses.-Poor-vision-eyesight-concept... ("Little girl holds glasses. Poor vision, eyesight concept") | content-photo/stock-photo | /eye-care-services/nearsighted-myopia | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 31 | Little-girl-practicing-to-insert-ophthalmic-lenses-in-o... ("Little girl practicing to insert ophthalmic lenses in optometry office") | content-photo/stock-photo | /eye-care-services/nearsighted-myopia | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 32 | Vision-optometrist-and-portrait-of-child-with-glasses-t... | content-photo/stock-photo | - | /eye-care-services/nearsighted-myopia | none | Social image only: no visible slot; set a new share image. |
| 33 | Vision-optometrist-and-portrait-of-child-with-glasses-t... ("Vision, optometrist and portrait of child with glasses to test, ...") | content-photo/stock-photo | /eye-care-services | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 34 | atropine.jpg ("Atropine Drops") | content-photo/stock-photo | /eye-care-services/nearsighted-myopia | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 35 | A-ddetailed-depiction-emphasizing-the-importance-of-gla... ("Detailed depiction emphasizing the importance of glaucoma exams") | content-photo/stock-photo | /eye-care-services/management-of-ocular-diseases/glaucoma | - | none | Stock: generated illustrative stand-in (from the alt) or drop. |
| 36 | A-detailed-depiction-emphasizing-the-importance-of-glau... | content-photo/stock-photo | - | /eye-care-services/management-of-ocular-diseases/glaucoma | none | Social image only: no visible slot; set a new share image. |
| 37 | mqdefault_6s.webp | content-photo/video-poster-third-party | - | /eye-care-services/eye-emergencies-pink-red-eyes, /tag/eye-emergencies, /tag/gsp-eye-emergencies | none | YouTube preview frame: use the embed's own poster. |
| 38 | review-quote.png | platform-ui-drop/platform-theme-decoration | - | - (theme CSS only) | none | Platform decoration: dropped anyway. |

Summary: 12 real-person portraits (5 people: Dr. Kristin Nelson 3 files, Dr. Maivys Longa 2, Heather 2, Xaiene 3, Jhonae 2) -> placeholders + ask; 7 have a same-name or same-stem sibling on disk (identity UNVERIFIED: the failed file itself was never seen; only 2 of the 7, child-learning and Child-Serious-Preschool, fill a visible slot, and the other 5 are og/meta references); 12 are visible stock slots with no sibling (generated stand-in candidates); 4 are social-share references only; 1 brand campaign (Bajio), 1 YouTube preview, 1 platform decoration. Note the sibling for Child-Serious-Preschool is 640x240, half the width of the 1280 original it replaces.

Pixels that exist only inside the live screenshot: Dr. Kristin Nelson's portrait and the Bajio gallery photo are rendered in `tmp/live/home-1440.png`. The re-run home capture puts them at 400x400 and 250 px wide at 1440. A crop could serve as a visual reference for the practice, never as the master. The home HTML declares Dr. Nelson's full-size file as 750x750, a useful size to ask the practice for.

## 4. Pages with no content image

A page counts as having a content image when an image other than `platform-ui-drop` or `logo-brand` is visible in its `<main>` (img src/srcset, inline or lazy background, or a layout-CSS row/column background); og:image, JSON-LD and header/footer logos do not count. Family = URL prefix (blog posts = WordPress `type-post` single pages). Computed by `classify.mjs` over `context.json`.

| Family | Pages in family | With no content image | Pages |
|---|---|---|---|
| eyeglasses | 37 | 22 | /eyeglasses/eyeglass-basics/eyeglass-frames, /eyeglasses/eyeglass-basics/lens-options-for-eyeglasses, /eyeglasses/eyeglass-guide, /eyeglasses/lens-treatments/scratch-resistant, /eyeglasses/prescription-eyeglasses/bifocal-lenses, /eyeglasses/prescription-eyeglasses/caring-for-lenses, /eyeglasses/prescription-eyeglasses/eyeglass-frame-materials, /eyeglasses/prescription-eyeglasses/frame-maintenance, /eyeglasses/prescription-eyeglasses/high-index-and-aspheric-lenses, /eyeglasses/prescription-eyeglasses/photochromic-lenses, /eyeglasses/prescription-eyeglasses/polycarbonate-lenses, /eyeglasses/specialty-eyewear/contacts-glasses-that-enhance-performance, /eyeglasses/specialty-eyewear/safety-and-sports-glasses, /eyeglasses/specialty-eyewear/scuba-masks-and-swim-goggles, /eyeglasses/specialty-eyewear/shooting-glasses-and-hunting-eyewear, /eyeglasses/specialty-eyewear/specialty-eyewear-overview, /eyeglasses/sunglasses/nonprescription-sunglasses, /eyeglasses/sunglasses/performance-and-sport-sunglasses, /eyeglasses/sunglasses/prescription-sunglass-treatments, /eyeglasses/sunglasses/prescription-sunglasses, /eyeglasses/sunglasses/sunglasses-for-kids, /eyeglasses/transitions-lenses/original-transitions-lenses |
| blog archives | 18 | 18 | /author/riversidefamilyeyecare, /category/news, /category/our-doctors, /category/our-staff, /category/testimonials, /category/uncategorized, /tag/all-about-vision, /tag/diabetic-retinopathy, /tag/dry-eye, /tag/dry-eyes, /tag/eye-emergencies, /tag/eye-exam, /tag/family-eye-exams, /tag/gsp-contact-lens-exams, /tag/gsp-eye-emergencies, /tag/licansed-by-adobe-stock, /tag/myopia-management-solutions, /whats-new |
| legal & utility | 6 | 6 | /404-page-not-found, /disclaimer, /privacy-policy, /sitemap, /testimonial/this-was-a-great-experience, /website-accessibility-policy |
| contact lenses | 12 | 6 | /contact-lenses/bifocal-and-multifocal-contact-lenses, /contact-lenses/contact-lenses-for-the-hard-to-fit-patient, /contact-lenses/disposable-contacts, /contact-lenses/eye-exams-for-contact-lenses, /contact-lenses/gas-permeable-gp-contact-lenses, /contact-lenses/toric-contact-lenses-for-astigmatism |
| contact & location | 7 | 6 | /contact-us, /contact-us/appointment-request-form, /contact-us/contact-form, /contact-us/patient-forms, /contact-us/testimonials, /location/riverside-family-eyecare |
| builder templates | 6 | 6 | /template/footer, /template/footer-2, /template/header, /template/header-2, /template/header-3, /template/inner-header |
| insurance & payment | 5 | 3 | /cherry-payment-plan, /insurance/faqs-of-vision-insurance-plans, /insurance/whats-in-your-vision-insurance-plan |
| team | 13 | 2 | /team/dr-brittany-degler-od, /team/jhonae-anglin |
| eye-care services | 22 | 1 | /eye-care-services/faq |
| blog posts | 21 | 1 | /what-every-mom-needs-to-know-before-booking-a-family-eye-exam-at-riverside-family-eyecar |

Cross-check (raw HTML grep of `<img>` and background URLs inside `<main>`, the practice's logos excluded): 69 of these pages have no image at all, and 6 of those 69 are builder templates with no `<main>`. Two pages have exactly one image, and both are `platform-ui-drop`, so they do not count:
- /404-page-not-found shows `404.png`, the EyeCarePro default 404 illustration.
- /eyeglasses/eyeglass-guide shows `eyeglass_guide_logo.png`, the EYEGLASS GUIDE tool badge.

The first version said 70 and named only /404. Positive controls: /eyeglasses/eyeglass-basics, /eye-care-services/eye-exams and /team/erica-eis each show one image, and a planted `<main>` with one `<img>` is detected (`tmp/wf1/verify-imagery/v06-pages.mjs`).

Total: 71 of 148. Generated-imagery candidates are the content families above (eyeglasses 22, contact lenses 6, contact & location 6, insurance & payment 3, eye-care services 1, blog posts 1, legal & utility 6); the 18 archives would take their posts' images, the 6 builder templates are not pages to rebuild, and the 2 team pages need the person's real photo, never a generated one.

Pages whose only images are third-party marks or functional logos (no editorial image):

| Family | Page | Images | What they are |
|---|---|---|---|
| contact lenses | /contact-lenses/our-featured-brands | 4 | contact-lens-brand-logo |
| contact lenses | /contact-lenses/our-featured-brands/alcon | 13 | contact-lens-product |
| contact lenses | /contact-lenses/our-featured-brands/bausch-lomb | 9 | contact-lens-product |
| contact lenses | /contact-lenses/our-featured-brands/coopervision | 20 | contact-lens-product |
| contact lenses | /contact-lenses/our-featured-brands/johnson-johnson | 11 | contact-lens-product |
| eyeglasses | /eyeglasses/transitions-lenses/are-transitions-right-for-you | 1 | lens-brand-campaign |
| eyeglasses | /eyeglasses/transitions-lenses/transition-solfx-sunwear-products | 1 | lens-brand-campaign |
| eyeglasses | /eyeglasses/transitions-lenses/transitions-xtractive | 1 | lens-brand-campaign |
| insurance & payment | /insurance/carecredit | 1 | payment-financing-logo |

Pages whose only editorial images are the not-downloaded files (the slot exists, the file does not):

| Family | Page | Missing file(s) |
|---|---|---|
| eye-care services | /eye-care-services/dry-eye-disease-and-treatment | Close-up-of-the-red-eye-of-a-man-affected-by-an-infection-scaled-1-1024x384.jpg |
| eye-care services | /eye-care-services/dry-eye-disease-and-treatment/envision-inmode | skin-model-1.jpg |
| eye-care services | /eye-care-services/eye-exams/pediatric-eye-exams | Child-Serious-Preschool-1280x480-e1541434177535.jpg |
| eye-care services | /eye-care-services/management-of-ocular-diseases/glaucoma | A-ddetailed-depiction-emphasizing-the-importance-of-glaucoma-exams.jpeg |
| eye-care services | /eye-care-services/nearsighted-myopia | Cheerful-smiling-child-black-wearing-goggles-scaled.jpeg, Little-girl-holds-glasses.-Poor-vision-eyesight-concept.jpeg, Little-girl-practicing-to-insert-ophthalmic-lenses-in-optometry-office.jpeg, atropine.jpg |
| blog posts | /glaucoma-awareness-starts-with-an-eye-exam | happy-old-couple-hugging.jpg |
| blog posts | /how-poor-vision-could-stunt-your-childs-academic-performance | child-learning-640x350.jpg |
| blog posts | /myopia-management-strategies-for-growing-children | Child-Serious-Preschool-1280x480-e1541434177535.jpg |
| blog posts | /what-happens-during-a-dry-eye-assessment-a-non-invasive-exam-for-gritty-eyes-in-fort-myers | senior-man-suffering-from-sore-eyes.jpeg |
| blog posts | /why-regular-optometry-visits-are-crucial-for-managing-eye-conditions | AdobeStock_819072843_Regular-Optometry.jpg |
| team | /team/dr-kristin-nelson-od | kristin_GSP_UID_a1668e7c-baf3-4e92-bfdf-a57139cb8999.jpeg |
| team | /team/heather | heather_GSP_UID_9ff3e7ab-e26a-4851-a607-0ec5ee9f2343.jpeg |
| team | /team/maivys-longa | maivys_GSP_UID_a1d67446-47bb-4117-a847-9777003a48f1.jpeg |
| team | /team/xaiene-dos-santos-da-costa | xaiene_GSP_UID_a011c47d-8625-4cfd-a000-9c70bb01d14f.jpeg |

## 5. Duplicates

Exact byte duplicates (sha256 from the inventory): new-blue.png (d3dhq28juvmj53.cloudfront.net) = tag.png (static.ecpbuilder.com).

Same picture in several files (same upload stem after removing WordPress size, `-scaled`, edit and `-1` suffixes; on-disk members confirmed by perceptual hash, dHash 64-bit, max distance shown). How far each group is confirmed:
- 14 of the 26 groups have two or more files on disk, and those are confirmed by pixels. An independent 32x32 grey correlation (`tmp/wf1/verify-imagery/v08-dups.mjs`) is 0.999-1.000 for 13 of them. Kristina's is 0.75 at its lowest pair, because her three files (320x427, 607x640, 607x809) are different crops.
- The other 12 groups have at most one file on disk, so their "same picture" status rests on the file name only (UNVERIFIED).

| Stem | Members (size, folder, on disk?) | dHash max |
|---|---|---|
| cropped-screenshot-2023-10-17-at-15.41.04 | 180x180 2023/10 (meta only); 192x192 2023/10 (meta only); 270x270 2023/10 (meta only); 32x32 2023/10 (meta only) | 1 |
| dry-eye-africam-american-man | 640x350 2019/10; n/a 2025/11 NOT ON DISK (meta only); n/a 2026/01 NOT ON DISK (meta only) | - |
| kristina_gsp_uid_a011c924-fa18-4b25-bac5-e8e99783598d | 320x427 2025/10 (meta only); 607x640 2025/10; 607x809 2025/10 | 8 |
| xaiene_gsp_uid_a011c47d-8625-4cfd-a000-9c70bb01d14f | n/a 2025/10 NOT ON DISK (meta only); n/a 2025/10 NOT ON DISK; n/a 2025/10 NOT ON DISK | - |
| kristin_gsp_uid_a1668e7c-baf3-4e92-bfdf-a57139cb8999 | n/a 2026/03 NOT ON DISK (meta only); n/a 2026/03 NOT ON DISK; n/a 2026/03 NOT ON DISK | - |
| dry-eye-girl | 640x350 2019/10; n/a 2026/04 NOT ON DISK (meta only) | - |
| happy-family-wearing-eyeglasses | 640x350 2022/03; n/a 2025/11 NOT ON DISK (meta only) | - |
| young-woman-working-on-her-laptop | 640x350 2022/06; n/a 2026/03 NOT ON DISK (meta only) | - |
| thumbnail-kids | 300x200 images/new-default-images; 325x217 2019/01 | 0 |
| thumbnail-lens-treatment-2 | 300x200 images/new-default-images; 325x217 2019/01 | 1 |
| thumbnail-specialty | 300x200 images/new-default-images; 325x217 2019/01 | 0 |
| thumbnail-transitions | 300x200 images/new-default-images; 325x217 2019/01 | 0 |
| thumbnail-prescription-2 | 300x200 new-default-images/thumbnails; 325x217 2019/01 | 0 |
| child-learning | n/a 2019/11 NOT ON DISK; 640x350 2024/09 (meta only) | - |
| bruce-mars-559223-unsplash | 640x427 2019/02 (meta only); 5760x3840 2019/02 | 0 |
| child-serious-preschool | 640x240 2022/08; n/a 2024/11 NOT ON DISK | - |
| brittany_gsp_uid_9cde0fdb-5f4b-45df-b8ff-c44fadddc1d5 | 427x427 2024/08 (meta only); 640x640 2024/08 | 0 |
| erica_gsp_uid_9cde26bb-cc5b-459d-a0a3-5baf6e3f7484 | 427x427 2024/08 (meta only); 640x640 2024/08 | 2 |
| nancy_gsp_uid_9cde1117-50ed-402b-bb21-be1bf4abdbd2 | 427x427 2024/08 (meta only); 640x640 2024/08 | 0 |
| rose_gsp_uid_9cde266d-5b4d-49c3-a8e6-9e2bfdf3084f | 427x427 2024/08 (meta only); 640x640 2024/08 | 3 |
| asma_gsp_uid_9cebc37d-664a-40ab-8db8-b329059e85b7 | 427x427 2024/09 (meta only); 640x640 2024/09 | 0 |
| 1-81 | 1280x480 2025/01; 1366x512 2025/01 | 1 |
| heather_gsp_uid_9ff3e7ab-e26a-4851-a607-0ec5ee9f2343 | n/a 2025/09 NOT ON DISK (meta only); n/a 2025/09 NOT ON DISK | - |
| maivys_gsp_uid_a1d67446-47bb-4117-a847-9777003a48f1 | n/a 2026/05 NOT ON DISK (meta only); n/a 2026/05 NOT ON DISK | - |
| jhonae_gsp_uid_a247f574-d8a5-4965-aa00-e8f31bd16562 | n/a 2026/07 NOT ON DISK (meta only); n/a 2026/07 NOT ON DISK | - |
| vision-optometrist-and-portrait-of-child-with-glasses-to-test-check-and-examine-eyesight | n/a 2026/08 NOT ON DISK (meta only); n/a 2026/08 NOT ON DISK | - |

Same file name in two upload folders: Dry-Eye-Africam-American-Man, Dry-Eye-Girl, happy-family-wearing-eyeglasses and young-woman-working-on-her-laptop each exist in a network-root upload folder (`/wp-content/uploads/2019/10`, `/2022/03`, `/2022/06`, on disk) and again in the practice's own `/sites/3587` folder (not downloaded); child-learning exists in another site's folder (`/sites/1775`, not downloaded) and in `/sites/3587` (on disk). In every pair exactly one copy is on disk (rows above marked NOT ON DISK); whether the two copies are the same pixels is UNVERIFIED.

Perceptual near-matches across different names (dHash distance <= 1), with the verdict from the sheets:

| A | B | Distance | Verdict |
|---|---|---|---|
| new-orange.png | new-blue.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| new-orange.png | tag.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| snowflake2.png | snowflake1.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| snowflake2.png | snowflake3.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| Riverside-Family-Eye-Care-Logo-01.png | Riverside-Family-Eye-Care-Logo.png | 0 | same logo, two sizes (true duplicate) |
| biofinity-toric-1585060715-w300.png | biofinity-xr-toric-1585060715-w300.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| clariti-1-day-multifocal-1585060715-w300.png | clariti-1-day-toric-1585060715-w300.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| proclear-multifocal-xr-1585060715-w300.png | proclear-multifocal-toric-1585060715-w300.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| snowflake1.png | snowflake3.png | 0 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| new-blue.png | tag.png | 0 | byte-identical (sha256), the one exact duplicate |
| Riverside-Family-Eyecare-practice-interior-wide-shot-new.jpg | Riverside-Family-Eyecare-practice-interior-wide-shot.jpg | 0 | same interior scene, desktop and mobile files (true duplicate) |
| biotrue-oneday-for-astigmatism-1585060715-w300.png | biotrue-oneday-1585060715-w300.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| biotrue-oneday-for-astigmatism-1585060715-w300.png | biotrue-oneday-for-presbyopia-1585060715-w300.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| paradox.png | humana.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| 965258c8-df59-4471-b688-9f80591b610f.jpg | 69bb2ec1-d025-4408-9d44-b89aa3a021d4.jpg | 1 | BETA 200 vs BETA 200S ophthalmoscopes: two products with near-identical renders (not a duplicate) |
| clariti-1-day-multifocal-1585060715-w300.png | clariti-1-day-sphere-1585060715-w300.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| humana.png | chemistrie.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| humana.png | 4ON2tzqw5GNU7H4U.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| myday-daily-disposable-1585060715-w300.png | myday-daily-toric-1585060715-w300.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |
| clariti-1-day-sphere-1585060715-w300.png | clariti-1-day-toric-1585060715-w300.png | 1 | different items with similar simple shapes (logos, sibling lens packs, badge colours, faint snowflakes): not a duplicate (checked on the sheets) |

## 6. Images with baked-in text or third-party marks

From the views (sheet and tile in `viewedIn`). Logos and lens packs carry their marks by definition and are summarised in one line each; everything else is listed.

| File | Class/subclass | Baked-in text | Third-party marks | Seen in |
|---|---|---|---|---|
| Acuvue.png | brand-product/contact-lens-brand-logo | wordmark | Acuvue mark | logo-walls #35 |
| BandL.png | brand-product/contact-lens-brand-logo | wordmark | Bausch & Lomb mark | logo-walls #44 |
| Cibalogo.png | brand-product/contact-lens-brand-logo | wordmark | Alcon mark | logo-walls #17 |
| CooperVision.png | brand-product/contact-lens-brand-logo | wordmark | CooperVision mark | logo-walls #36 |
| transitions-girlwithbag.jpg | brand-product/lens-brand-campaign | - | brand campaign image (Transitions) | devices-and-brand-campaigns #25 |
| transitions-groupshot.jpg | brand-product/lens-brand-campaign | - | brand campaign image (Transitions) | devices-and-brand-campaigns #27 |
| transitions-ladyreading.jpg | brand-product/lens-brand-campaign | - | brand campaign image (Transitions) | devices-and-brand-campaigns #13 |
| carecredit-transparent.png | functional/payment-financing-logo | wordmark | CareCredit mark | logo-walls #11 |
| low-vision-male-caucasion-senior.jpg | content-photo/stock-banner | labels AMD / Glaucoma / Diabetes and a question headline | - | stock-other #6 |
| Thumbnail-Emerg.jpg | content-photo/stock-category-thumbnail | graphic overlay (no words) | - | stock-thumbnails #21 |
| Thumbnail-contacts-brands.jpg | content-photo/stock-category-thumbnail | "CONTACT LENSES" on the case | - | stock-thumbnails #22 |
| Thumbnail-eyeglass-guide.jpg | content-photo/stock-category-thumbnail | "Q & A" overlay | - | stock-thumbnails #23 |
| Thumbnail-lasik.jpg | content-photo/stock-category-thumbnail | graphic overlay (no words) | - | stock-thumbnails #10 |
| Cooper-Contacts.jpg | brand-product/contact-lens-brand-tile | maker logo | CooperVision logo | devices-and-brand-campaigns #7 |
| Alcon-Contacts-1.jpg | brand-product/contact-lens-brand-tile | maker logo and tagline | Alcon logo | devices-and-brand-campaigns #2 |
| BnL-Contacts.jpg | brand-product/contact-lens-brand-tile | maker logo | Bausch + Lomb logo | devices-and-brand-campaigns #10 |
| JnJ-Contacts.jpg | brand-product/contact-lens-brand-tile | maker logo | Johnson & Johnson Vision logo | devices-and-brand-campaigns #23 |
| Bebe BNS 1280x480.jpg | brand-product/frame-brand-campaign | bebe wordmark | bebe wordmark | devices-and-brand-campaigns #12 |
| Guess.jpg | brand-product/frame-brand-campaign | GUESS wordmark | GUESS wordmark | devices-and-brand-campaigns #21 |
| IMG_5306-1024x768.jpg | content-person-real/practice-office | - | partial designer sign at the top | practice-photos #7 |
| IMG_5312-1024x768.jpg | content-person-real/practice-office | - | device maker marks (small) | practice-photos #4 |
| IMG_5318-640x640.jpg | content-person-real/practice-office | - | device maker mark, wall poster | practice-photos #5 |
| IMG_5320-1-640x640.jpg | content-person-real/practice-office | - | NIDEK on the device | practice-photos #6 |
| Riverside-Family-Eye-Care-Logo.png | logo-brand/practice-logo | wordmark | - | logos-and-platform #18 |
| bg-7.png | brand-product/device-product | - | maker mark on the headset | header-and-section-photos #12 |
| costa.jpg | brand-product/frame-brand-campaign | COSTA logo | COSTA logo baked in | devices-and-brand-campaigns #5 |
| nike2-scaled.jpg | brand-product/frame-brand-campaign | - | Nike swoosh | devices-and-brand-campaigns #20 |
| Riverside-Family-Eye-Care-Logo-01.png | logo-brand/practice-logo | wordmark | - | logos-and-platform #6 |
| Img_0001_furla-glasses-banner-550-pixels.jpg | brand-product/frame-brand-campaign | - | Furla campaign image (no logo visible at sheet size) | devices-and-brand-campaigns #24 |
| Img_0002_Charmant-CHTP-vintage_man_icons_A1_EN_high.jpg | brand-product/frame-brand-campaign | - | Charmant campaign image (no logo visible at sheet size) | devices-and-brand-campaigns #1 |
| Img_0003_draper-james-debut.jpg | brand-product/frame-brand-campaign | - | Draper James campaign image (no logo visible at sheet size) | devices-and-brand-campaigns #16 |
| cataracts_blog.jpg | content-photo/stock-photo | title "Your Path to Clear Vision" and "Cataract Surgery Co-Management" | - | stock-other #2 |
| About-UV-Rays_Blog.jpg | content-photo/stock-photo | "UVA" / "UVB" labels | - | stock-other #1 |
| Exterior-shot-of-practice.jpg | content-person-real/practice-office | building signage "EYE CARE" | Pizza Hut sign in frame (left) | practice-photos #2 |
| Fun-photo-of-Riverside-Family-Eyecare-staff.jpg | content-person-real/staff-group | - | Florida Gators flag on the wall | practice-photos #12 |
| brittany_GSP_UID_9cde0fdb-5f4b-45df-b8ff-c44fadddc1d5-4... | content-person-real/doctor-portrait | name embroidered on the white coat | - | team-portraits #4 |
| brittany_GSP_UID_9cde0fdb-5f4b-45df-b8ff-c44fadddc1d5.jpeg | content-person-real/doctor-portrait | name embroidered on the white coat | - | team-portraits #7 |
| 1-81-1280x480.png | brand-product/treatment-brand-ad | headline, body copy and a Learn More button | ENVISION by InMode mark and device | header-and-section-photos #7 |
| 1-81.png | brand-product/treatment-brand-ad | headline, body copy and a Learn More button | ENVISION by InMode mark and device | header-and-section-photos #11 |
| AlumierMD_Logo_Gry.png | brand-product/skincare-brand | wordmark | Alumier MD wordmark | logos-and-platform #19 |
| Riverside-Family-Eye-Care-OG-Logo.png | logo-brand/practice-og-logo | wordmark | - | logos-and-platform #3 |
| young-woman-bajio-sunglasses.jpg | brand-product/frame-brand-campaign | - | Bajio campaign image (brand per file name and gallery caption) | not on disk; seen rendered in tmp/live/home-1440.png (view 11) |
| 2927158a-a36a-4814-934e-a718db68d3ed.jpg | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #15 |
| 403d018d-e9e7-4560-96fc-e6bed5e0d0a2.png | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #14 |
| 5f5164fa-04cb-474e-aa81-53d556b823e9.png | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #8 |
| 69bb2ec1-d025-4408-9d44-b89aa3a021d4.jpg | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #17 |
| 965258c8-df59-4471-b688-9f80591b610f.jpg | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #11 |
| 9e61ad09-8aa0-490a-ac89-314080aa858c.jpg | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #22 |
| af36d03a-2ee4-4d77-842e-b4a314a5bdc2.png | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #19 |
| cbe5376d-0664-4618-941f-d5898ef09dec.png | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #4 |
| efb0c033-f50d-4e8a-8f40-ee8394fd157c.jpg | brand-product/device-product | - | device maker product | devices-and-brand-campaigns #6 |
| care-credit.png | functional/payment-financing-logo | wordmark | Care Credit mark | logo-walls #33 |
| 1008-100525001-Sunscreen-Reformulation-ShopifyBanners-N... | brand-product/skincare-brand | product text on the tubes | Alumier MD product marks on the tubes | header-and-section-photos #13 |
| Eyeglass-frames-display-wide-shot.jpg | content-person-real/practice-office | - | small frame-brand poster on the wall | practice-photos #3 |
| chanel-sunglasses-row-1.jpg | brand-product/frame-brand-campaign | - | Chanel product | devices-and-brand-campaigns #18 |

Plus: 53 contact-lens pack shots (maker brand and packaging text on every box), 27 frame-brand logos and 19 insurance-carrier logos (each is a wordmark). The 26 platform-ui-drop images (including the "new" and "NEW ARRIVALS" badges, the EYEGLASS GUIDE badge and the EyeCarePro credit) are dropped, so their text does not carry over. Practical rule for the build: none of these may be regenerated, recoloured, cropped through the mark or imitated, and no generated eyewear or packaging may be placed beside them.

## 7. Protrusion candidates (cut-out, break-out-of-frame depth)

A candidate is a subject that can be separated from a plain ground (background removal) and allowed to overlap its card or the next section. Products and devices stay pixel-identical apart from the removed background.

### 7.1 Products, devices, eyewear (no approval needed beyond keeping marks intact)

| Kind | Count | Files (size) | Where now | Note |
|---|---|---|---|---|
| contact-lens-product | 53 | dailies-aquacomfort-plus-toric (300x300), dailies-total1 (300x300), dailies-total1-multifocal (300x300), freshlook-colorblends (300x300), precision1 (300x300), bausch-lomb-ultra (300x300), ... (47 more) | /contact-lenses/our-featured-brands/alcon, /contact-lenses, /contact-lenses/our-featured-brands/bausch-lomb, /contact-lenses/our-featured-brands/coopervision, ... | lens pack |
| device-product | 9 | 2927158a-a36a-4814-934e-a718db68d3ed.jpg (320x320), 403d018d-e9e7-4560-96fc-e6bed5e0d0a2.png (400x400), 5f5164fa-04cb-474e-aa81-53d556b823e9.png (400x400), 69bb2ec1-d025-4408-9d44-b89aa3a021d4.jpg (320x320), 965258c8-df59-4471-b688-9f80591b610f.jpg (320x320), 9e61ad09-8aa0-490a-ac89-314080aa858c.jpg (320x320), ... (3 more) | /eye-care-services/eye-exams/advanced-technology | device on white |
| stock-category-thumbnail | 4 | Thumbnail-Glasses.jpg (325x217), Thumbnail-contacts-3.jpg (325x217), Thumbnail-contacts.jpg (325x217), Thumbnail-eyeglass-basics.jpg (325x217) | /contact-lenses, /eye-care-services, /eyeglasses | stock eyewear; stock lens case; stock lenses |
| stock-banner | 1 | glasses-tortishell_slide-640x240.jpg (640x240) | /eyeglasses/eyeglass-basics | stock eyewear |
| stock-cutout | 1 | caucasian-family-pyramid-300x278.png (300x278) | /eye-care-services/eye-emergencies-pink-red-eyes | already transparent; stock people |
| stock-photo | 1 | patient-form_639x639px.jpg (639x639) | / | device: laptop |
| treatment-brand-ad | 1 | 1-81.png (1366x512) | / | device render, only if a separate asset exists |
| skincare-brand | 1 | 1008-100525001-Sunscreen-Reformulation-ShopifyBanners-N... (1440x675) | / | brand product, keep as is |
| section-background-stock | 1 | BGs-Recovered.jpg (1650x700) | /contact-lenses | stock lenses + splash |
| frame-brand-campaign | 1 | chanel-sunglasses-row-1.jpg (1600x303) | /eyeglasses/designer-frames | brand sunglasses, keep as is |

Best fits for the depth effect: the nine device shots on white (advanced-technology page) and the 53 lens packs are already isolated on white or transparency; the clearest unbranded eyewear/device subjects are the stock eyewear shots (Thumbnail-Glasses, glasses-tortishell_slide, Thumbnail-eyeglass-basics) and the patient-form laptop. The family pyramid PNG is already transparent. 69 of the 73 candidates are 640 px wide or less (only 1-81.png 1366x512, 1008-100525001-Sunscreen-Reformulation-ShopifyBanners-N... 1440x675, BGs-Recovered.jpg 1650x700, chanel-sunglasses-row-1.jpg 1600x303 are larger), so break-outs must stay near native size. The InMode device render sits inside a flat ad (text baked in); a separate device asset is not on disk (UNVERIFIED that one exists). Weaker option: the practice's own equipment photos (IMG_5320-1 NIDEK close-up, IMG_5312 pre-test bench) show real devices but on busy room backgrounds; they are the practice's photos, so ask before cutting them out.

### 7.2 Real people - need the practice's approval before any cut-out

| Person / photo | Files on disk | Not on disk | Note |
|---|---|---|---|
| Dr. Brittany Degler, O.D. | 427x427, 640x640 | - | clean studio-style portrait in the showroom, soft background: cut-out friendly |
| Erica | 427x427, 640x640 | - | clean studio-style portrait in the showroom, soft background: cut-out friendly |
| Nancy | 427x427, 640x640 | - | clean studio-style portrait in the showroom, soft background: cut-out friendly |
| Rose | 427x427, 640x640 | - | clean studio-style portrait in the showroom, soft background: cut-out friendly |
| Asma | 427x427, 640x640 | - | clean studio-style portrait in the showroom, soft background: cut-out friendly |
| Heather | none | 2 | cannot be cut out until the practice supplies the file |
| Kristina | 320x427, 607x640, 607x809 | - | clean studio-style portrait in the showroom, soft background: cut-out friendly |
| Xaiene | none | 3 | cannot be cut out until the practice supplies the file |
| Dr. Kristin Nelson, O.D., IACMM | none | 3 | cannot be cut out until the practice supplies the file |
| Dr. Maivys Longa, O.D. | none | 2 | cannot be cut out until the practice supplies the file |
| Jhonae | none | 2 | cannot be cut out until the practice supplies the file |
| Fun-photo-of-Riverside-Family-Eyecare-staff.jpg | 800x800 | - | staff waving from doorways along a hallway |
| IMG_7898-scaled.jpeg | 2560x1920 | - | staff group at a paint-night event with eye paintings |

Brand campaign photos with models (Furla, Draper James, Charmant, Costa, bebe, GUESS, Nike, Transitions) are third-party property: no cut-outs of the models.

## 8. Open questions

1. Practice: original files for Dr. Kristin Nelson, Dr. Maivys Longa, Heather, Xaiene and Jhonae (12 portrait files refused by the CDN), and approval to use cut-out portraits for depth effects.
2. Practice: vector or high-resolution masters of the logo and eye mark. The site icon is cropped from a 2023 screenshot. The largest raster logos are two:
   - the 988x400 transparent PNG, with logo pixels spanning 978x367;
   - the 1200x628 OG card, where the logo spans 1068x401 on a white panel.

   Neither reaches 2x for a logo wider than about 530 css px.
3. Practice: higher-resolution exports of the 2024 photo shoot. The page-header photos are 1280x853 (below 1920 for a full-bleed header) and the portraits 640x640 (upscaled at 768 on the live site).
4. Practice: whether the "Untitled-2" bearded-man portrait and the cataracts-optometrist-blog clinician are stock (they do not match the practice's rooms or staff in the views; marked UNVERIFIED).
5. Build: keep or drop the InMode, Alumier MD and frame-brand campaign blocks (all third-party, most below 640 px).
6. Pipeline: the home capture HAS been re-run with the leading-slash path fix (04:14 to 04:15Z), and the home sizes here now come from it. Two follow-ups remain:
   - `tmp/wf1/imagery/checks.mjs` still reads the moved `tmp/capture/baseline/C-Program-Files-Git.1440.json` and stops with ENOENT at its check 3.
   - Re-running `classify.mjs` and `report.mjs` regenerates both outputs from the old screenshot data. After such a re-run, re-apply `tmp/wf1/verify-imagery/v05-rendered.mjs` and `v13-apply.mjs`, and the Markdown corrections listed in the Verification record, or port them into the author's scripts.

## 9. Method, evidence and limits

- Where images sit: `scan.mjs` tokenises all 148 raw pages into element trees and finds each inventory URL path (host-independent; JSON-escaped variants included) in its tag, recording landmark, Beaver Builder module, row and list item; layout-CSS backgrounds are tied to pages through their `fl-node` ids. Cross-check: the pages it finds match the inventory's `usedOn` for 300 of 307 images. The other 7 are CSS backgrounds that also appear as a lazy `data-background-image-src` on their page (the scan adds that page).

  Correction from the verification: 9 CSS backgrounds carry that lazy attribute, not 7. `scan.mjs` missed the attribute for BGs-Recovered.jpg (/contact-lenses) and chanel-sunglasses-row-1.jpg (/eyeglasses/designer-frames). Their inventory URLs are on `s3.amazonaws.com/ecp-uploads/wp-content/...`, and that path prefix did not pair with the CloudFront attribute. An independent scan that keys on the path from `/wp-content/` gives 298 identical plus those 9 (`tmp/wf1/verify-imagery/v07-misc.mjs`). This has no effect on any output, because both files reach `visibleOn` through their layout-CSS rule.
- Sizes: ffprobe decoded 257 of 257 raster files at exactly the inventory's intrinsic size (positive check of `audit/image-inventory.json`); ffmpeg here has no SVG decoder, so the 12 SVG sizes are the inventory's. One file is mislabelled: Cibalogo.png holds GIF data.
- Looking: 11 image views of the 25 allowed (10 contact sheets under `tmp/wf1/imagery/sheets/` with numbered `*.index.json` beside each, plus one tiled view of the six live home slices). Notes were written after each view: `tmp/wf1/imagery/view-notes.md`. The 38 not-downloaded files were not seen (two are visible in the live screenshot).
- Home measurements: now taken from the re-run home capture (`tmp/capture/baseline/index.<w>.json`, mapped by `tmp/wf1/verify-imagery/v05-rendered.mjs` and written into the JSON by `v13-apply.mjs`). The first version measured the screenshot with `measure-home.mjs` (boxes, about +-4 px) and `refine-home.mjs` (template matches, 1-2 px; normalised cross-correlation 0.80-1.00, the hero 0.69 because of its white wash). Those screenshot values were within 0-8 px of the capture, except Draper James at 14 px.
- Classification rules, view facts, sibling search, low-res verdicts and treatments: `classify.mjs`. Duplicates: inventory sha256 + `phash.mjs`. Spot checks quoted in the text (page-header CSS rules, the two team pages without a body portrait, the chrome-error home capture, usedOn agreement, ffprobe agreement, schema keys): `checks.mjs`. This document: `report.mjs`. Re-run order: scan, sheets, phash, measure-home, refine-home, rendered, classify, report, checks (cwd = project root).

  Since the home capture was re-run, `checks.mjs` passes its first 9 checks and then stops with ENOENT at check 3 (`tmp/capture/baseline/C-Program-Files-Git.1440.json` moved to `tmp/capture/invalid-pathconv/`). A re-run of classify and report also drops the corrections made by the verification. The verification scripts (`tmp/wf1/verify-imagery/v01`-`v13`, any cwd) run in this order: v01, v02, v03, v04, v05, v06, v07, v08, v11, then v13 to re-apply the JSON corrections, then v12, which must pass. v09 and v10 only rebuild the verifier's contact sheets.
- UNVERIFIED: identity of every same-name sibling with its failed twin; what the failed files depict beyond their names and alts; rendered sizes on pages without a capture (marked "derived" or "not captured"); stock status of Untitled-2 and cataracts-optometrist-blog.

## Verification record

**Who and how.** Verified on 2026-10-01 by the verify-imagery agent, which did not author this report. Every claim was re-derived from the evidence with its own scripts in `tmp/wf1/verify-imagery/`. The author's intermediate files were only compared, never trusted, and the author's prose was not reviewed.
- Scripts: v01 schema/counts, v02 disk/sha256/ffprobe, v03 page scan, v04 failures, v05 capture mapping, v06 pages, v07 CSS/usedOn/portraits/protrusion, v08 duplicates, v11 positive controls, v12 JSON-vs-capture, v13 JSON corrections, v14 Markdown tables-vs-capture, v15 sandbox re-run.
- Contact sheets: v09 and v10 built 5 sheets (`sheets/`), and each was viewed once. The notes are in `view-notes-verify.md`.
- Final run log: `verify-run.log`, all PASS.
- Pre-verification copies of both outputs: `image-classification.before-verify.json` and `IMAGE-INVENTORY.before-verify.md`.

**What changed.**
- The home capture was re-run at 04:14 to 04:15Z, after this report was written (04:12Z). Every home size now comes from that capture: sections 2, 2.1, 2.2, 2.3, 2.4 and 3, and the JSON `rendered1440` (20 entries replaced, 2 added).
- Three low-res verdicts changed, in the Markdown and in the JSON `lowResForRedesign`: Pediatric-eye-exam.jpg is now below 2x; the Alumier MD logo is now below 2x; the Alumier band is now LOW-RES-FOR-ROLE, upscaled at 390 and 768.
- Five staff portrait flags changed from "ok" to "not measured".
- One cross-check count was corrected: 69 pages, not 70.
- The scan-agreement note now says 9, not 7.
- Open questions 2 and 6 were updated.
- Classes, counts, provenance, the 38-failure analysis, the no-image page list, duplicates, marks and protrusion candidates all re-derived identically.

Positive controls, so that every "none", "zero" or "only" result is shown able to fire:
- planted GIF-in-.png (magic-byte probe);
- planted duplicate file (sha256 grouping);
- planted orphan file name;
- planted unknown image URL (scan matcher);
- mutated record (field comparison);
- planted `<main>` with one `<img>`, plus three known pages with one image each;
- /team/erica-eis with one portrait;
- the ornament probe firing on the 12 known ornament files;
- the InMode name probe finding both `1-81` files;
- a wrong size rejected by the Markdown-table check;
- a file's dHash distance to itself = 0.

| # | Claim (as first written) | Method / evidence | Verdict |
|---|---|---|---|
| 1 | One record per inventory entry, in inventory order; every Clifton top-level and per-image key present | v01 against `cliftoneyecenter-reforge/audit/image-classification.json`. The additive keys also include `downloadError`. `file`, `w`, `h` and `format` are null for the 38 (never null in Clifton). That is harmless for Clifton `build.mjs`, which looks up `classByFile.get(im.localFile)`, and the inventory has no `localFile` key on those 38 | CONFIRMED |
| 2 | Copied fields (file, w, h, format, alts, usedOn, inventoryRole, inventoryDecision, onDisk, downloadError) equal the inventory | v01, 0 mismatches over 307; mutated-record control in v11 | CONFIRMED |
| 3 | Class counts, all 307: 7 / 26 / 1 / 94 / 44 / 114 / 21 / 0 | v01, recomputed from the records | CONFIRMED |
| 4 | On disk 7 / 25 / 1 / 70 / 32 / 113 / 21 / 0; not downloaded 0 / 1 / 0 / 24 / 12 / 1 / 0 / 0 | v01 | CONFIRMED |
| 5 | 32 subclass counts (section 1 line and `countsBySubclass`) | v01 | CONFIRMED |
| 6 | Provenance: 13 origins, 136 / 53 / 27 / 20 / 20 / 17 / 12 / 9 / 6 / 4 / 1 / 1 / 1 | v01, an independent host/path rule; 0 of 307 differ | CONFIRMED |
| 7 | Class assignments (sample of 44 spread over the list: idx 0, 7, ..., 301) | View 1 for 38 on-disk rasters; name and alt for 1 SVG and 5 missing files. The depiction of skin-model-1.jpg was never seen | CONFIRMED |
| 8 | The 32 on-disk content-person-real files are the practice's own photos; no practice photo sits in the stock classes | Views 2 and 5: the same rooms, floors and staff recur across the 2024 shoot. Views 1 and 2 cover the stock sample | CONFIRMED |
| 9 | 269 files on disk, 38 not; every `localFile` exists; sha256 and bytes equal the inventory | v02; orphan-name control in v11 | CONFIRMED |
| 10 | ffprobe reads 257 of 257 rasters at the inventory size; 12 SVGs | v02 (codecs: mjpeg 119, png 131, gif 7) | CONFIRMED |
| 11 | Exactly one mislabelled file: Cibalogo.png holds GIF data | v02 magic bytes; planted GIF-in-.png control | CONFIRMED |
| 12 | Every on-disk file was looked at (257 rasters on 10 sheets, 12 SVGs as text) | The author's sheet index JSONs cover 269 of 269 files, and all 257 `viewedIn` tile references resolve to the right file | CONFIRMED |
| 13 | "11 of the 25 image views used" | `view-notes.md` has 11 view sections and 11 sheet PNGs exist; the act of viewing cannot be re-run | UNVERIFIABLE |
| 14 | 57 of the 70 on-disk content photos are 640 px wide or less | v02 | CONFIRMED |
| 15 | The practice's photos: 32 on disk; portraits and care scenes 2024-2025, plus office/equipment photos and an event photo | v02 upload folders: 5 from 2021 (IMG_53xx office/equipment), 22 from 2024, 5 from 2025 | CONFIRMED |
| 16 | "The home capture is unusable" (section 2, open question 6, section 9, summary) | `tmp/capture/baseline/index.*.json` was written at 04:14:50-04:15:01Z with a valid URL and title. The chrome-error files moved to `tmp/capture/invalid-pathconv/`. True when written, stale now | CORRECTED |
| 17 | Hero 1920x800 drawn 1440x600 at 1440, 1.33x | Capture: 1440x601 box, cover-drawn 1442x601, 1.33x | CONFIRMED |
| 18 | Hero mobile file "not measured", "1.55x at 768" | Capture: at 768 a 768x202 box, drawn 768x320 (1.55x); at 390 a 390x202 box, drawn 485x202 (2.45x) | CONFIRMED |
| 19 | Hero wash `rgba(255,255,255,0.48)` on node 628403d67c08a (layout 5845); mobile file at `background-position: 64% 0%` under `max-width: 768px` | v07 on `audit/css` | CONFIRMED |
| 20 | Navy headline and a teal button on the hero | Capture colours `rgb(30, 44, 112)` and `rgb(3, 117, 109)` | CONFIRMED |
| 21 | 20 home rendered sizes (screenshot-based) | v05 and v12: 17 of 20 differ from the capture by more than 2 px (8 px at most, Draper James 14 px). Replaced in sections 2.1-2.4 and in JSON `rendered1440` (v13) | CORRECTED |
| 22 | Pediatric-eye-exam.jpg 640x428 at 1440, 2.00x, "ok" | Capture 645x430: 1.98x, so below 2x at 1440 (Markdown and JSON) | CORRECTED |
| 23 | AlumierMD_Logo_Gry.png "not measured", "ok" | Capture 343x64: 1.75x, so below 2x at 1440. JSON entry added and verdict updated | CORRECTED |
| 24 | Alumier band 1092x408 box, 1.32x, "below 2x" only | Capture: 1100x410 box (drawn 1100x516), 1.31x. At 390 and 768 the row is 748-750 px tall, so the file is drawn about 1597 px wide (0.90x, upscaled): LOW-RES-FOR-ROLE | CORRECTED |
| 25 | Gallery tiles 250 / 248 / 236 / 248 px; Draper James "2.12x" | Capture: all 250 px wide, height 0 (not loaded at capture time), so 2.00x | CORRECTED |
| 26 | Dr. Nelson's and the Bajio photo "about 396 px and 248 px" | Capture: 400x400 and 250 px wide. Added: the home HTML declares Dr. Nelson's full-size file as 750x750 | CORRECTED |
| 27 | Home 1440 slots without a `rendered1440` entry | The header logo (Logo-01, 180x73) and the Alumier logo were missing; both added (v13) | CORRECTED |
| 28 | The 64 non-home `rendered1440` entries | v12: all within 2 px of my own capture mapping. 328 of 328 img elements were mapped; 240 fill images pass the aspect check | CONFIRMED |
| 29 | `lowResForRedesign` for the other 266 on-disk records | v12, re-deriving the report's own rule over every captured width: unchanged | CONFIRMED |
| 30 | The six page headers: first row of `<main>`, column 50.07% (50% on /insurance), min-height 500px, cover | v07, own regexes over `audit/css` and `audit/raw` | CONFIRMED |
| 31 | Captured page-header sizes at 4 widths on /eye-care-services, /insurance and /our-eye-doctors | v14 against the capture | CONFIRMED |
| 32 | Five headers are 1280x853 (below 1920, LOW-RES-FOR-ROLE); /the-staff is 2560x1920 (ok); derived cover sizes 750x500 and 721x541 | v07 plus arithmetic | CONFIRMED |
| 33 | /our-eye-doctors portraits: 272 px (1440, 1024), 728 px (768; a 640 file upscaled 0.88x), 350 px (390), object-fit cover | v05 and v14 | CONFIRMED |
| 34 | Erica, Nancy, Rose, Asma, Kristina flagged "ok" | No capture of /the-staff or of any team page, and /the-staff uses the same `ecp-list-team` square module. Now "not measured", likely upscaled at 768 (UNVERIFIED) | CORRECTED |
| 35 | /team/dr-brittany-degler-od and /team/jhonae-anglin show no body portrait (og:image only) | v07: 0 `<img>` in `<main>`, 1 og:image each; control /team/erica-eis has 1 | CONFIRMED |
| 36 | The 427x427, 320x427 and 493x427 portrait variants are og:image crops only | 11 crops: 0 visible, 11 in meta | CONFIRMED |
| 37 | /eye-care-services tiles: 10 tiles, 2 not on disk; 300x200 / 275x183 / 668x446 / 290x194; 325 px files drawn about 2x at 768; Thumbnail-treatments upscaled at all widths | v05 and v14 | CONFIRMED |
| 38 | /insurance: 22 slots, 20 files (Aetna and Care Credit twice), all 133x110 = file size at 1440 | v05 and inventory alts | CONFIRMED |
| 39 | /hours-location, /eyeglasses/eyeglass-basics and /top-causes-of-dry-eye-in-fort-myers sizes at 4 widths | v14 | CONFIRMED |
| 40 | failures.json: 36 CloudFront 403, 1 www.eyecarepro.net 403, 1 YouTube 404; the brief's "37 CloudFront 403s" is wrong | v04 | CONFIRMED |
| 41 | The 38 not-downloaded entries are exactly the failures, each listed once | v04 | CONFIRMED |
| 42 | 12 real-person files of 5 people (3, 2, 2, 3, 2); 7 with a sibling; 12 visible stock without one; 4 social-only; Bajio, YouTube, platform | v04 with my own sibling search and my own scan | CONFIRMED |
| 43 | Section 3 table, 38 rows | v04: file, class, visible-on and sibling columns match. In rows 2 and 6, "og/meta only on" gave a count that included the visible page; those pages are now named. Added: only 2 of the 7 sibling rows fill a visible slot | CORRECTED |
| 44 | A same-name sibling has the same pixels as its failed twin | The failed files were never downloaded | UNVERIFIABLE |
| 45 | What the unseen failed files depict beyond their name and alt | Not on disk (2 visible only in the screenshot) | UNVERIFIABLE |
| 46 | 71 of 148 pages show no content image; same page list; by family 22 / 18 / 6 / 6 / 6 / 6 / 3 / 2 / 1 / 1 | v06: my own scan, my own platform/logo URL rule, planted-`<main>` control | CONFIRMED |
| 47 | Family totals 37 / 18 / 6 / 12 / 7 / 6 / 5 / 13 / 22 / 21, plus the home | v06, with my own `type-post` detection | CONFIRMED |
| 48 | Cross-check: "70 have no image at all; only /404 has one" | v06 raw grep: 69 have none; /404-page-not-found (404.png) and /eyeglasses/eyeglass-guide (eyeglass_guide_logo.png) have one platform image each | CORRECTED |
| 49 | 9 pages with only third-party marks; 14 pages whose only editorial images are missing files | v06, same pages, counts and files | CONFIRMED |
| 50 | One exact byte duplicate: tag.png = new-blue.png | v02 own sha256; planted-copy control | CONFIRMED |
| 51 | 26 same-picture stem groups (members, sizes, folders, NOT ON DISK flags, dHash max) | v08 with my own stem function and dHash. Added: 14 groups confirmed by pixels, 12 by name only | CONFIRMED |
| 52 | 20 cross-name near-matches (dHash 0-1) and their distances | v08 | CONFIRMED |
| 53 | Near-match verdicts: lens-pack pairs, badges, snowflakes, ophthalmoscopes and Humana/Chemistrie are not duplicates; the logo pair and the hero pair are | Views 3 and 4; 32x32 correlation 0.99-1.00 for both true pairs | CONFIRMED |
| 54 | Section 6 baked-in text and third-party marks | Views 1, 2 and 5 on about 30 of the listed files | CONFIRMED |
| 55 | "Plus" counts: 53 lens packs, 27 frame-brand logos, 19 insurance logos, 26 platform images | v01 | CONFIRMED |
| 56 | 73 cut-out candidates (53 lens packs, 9 devices, 4 thumbnails, 7 single files); 69 are 640 px or less; the 4 larger ones as named | v07 | CONFIRMED |
| 57 | "Where now" pages of each candidate kind | `scan.json` | CONFIRMED |
| 58 | No separate InMode/Envision device asset on disk | v11 name probe; the control finds both `1-81` files. Whether the practice holds such an asset is unknown | CONFIRMED |
| 59 | Real-person cut-out list: 6 team members on disk, 2 staff group photos, 5 people not on disk | v07 | CONFIRMED |
| 60 | decorative = 0 | v11 ornament probe. It fires on 12 files: 9 platform decorations, the form arrow, bg-7.png (a device photo) and BGs-Recovered.jpg (a stock background). None is decorative-only | CONFIRMED |
| 61 | Inventory completeness: every image URL in the 148 raw pages is an inventory entry | v03: 0 unmatched; planted-URL control in v11 | CONFIRMED |
| 62 | Scan cross-check: `usedOn` agrees for 300 of 307; the other 7 are lazy-background CSS images | v07 plus a replay of the author's check on `context.json`. 9 such backgrounds exist; `scan.mjs` missed the 2 on s3 paths. Independent result: 298 + 9. No effect on any output | CORRECTED |
| 63 | `visibleOn` / `metaOn` of all 307 records | v03 independent scan: identical for 307 of 307. The first run of my JSON-LD regex missed the YouTube `thumbnailUrl`; the author's value served as the control | CONFIRMED |
| 64 | "The 23 spot checks in checks.mjs all pass" | Read-only re-run: 9 PASS, then ENOENT at check 3, because its input moved with the home re-capture | CORRECTED |
| 65 | Re-running classify.mjs and report.mjs gives byte-identical outputs once the timestamp is removed | v15 sandbox re-run from the saved intermediates: identical to the pre-verification files | CONFIRMED |
| 66 | Re-running the upstream chain (scan, sheets, phash, home measurement, rendered) gives identical outputs | Cannot be re-run to the same result: `tmp/capture/baseline` has changed since | UNVERIFIABLE |
| 67 | Open question 2: "the largest raster logo is 988x400" | Pixel bounding box: the 1200x628 OG card holds the logo at 1068x401, larger than the 988x400 PNG's 978x367 | CORRECTED |
| 68 | Open question 6: the home capture "must be re-run" | It has been (row 16); the question was rewritten into the remaining follow-ups | CORRECTED |
| 69 | Stock status of Untitled-2 and cataracts-optometrist-blog | View 2 is consistent with stock but cannot prove it | UNVERIFIABLE |
| 70 | "No live request was made" | A process claim; nothing on disk records requests | UNVERIFIABLE |

**Tally:** 70 claims checked: 49 CONFIRMED, 15 CORRECTED, 6 UNVERIFIABLE.

**Re-run caution.** `tmp/wf1/imagery/classify.mjs` and `report.mjs` still read the screenshot-based `rendered.json`. Re-running them overwrites these corrections, so afterwards run `tmp/wf1/verify-imagery/v05-rendered.mjs`, `v13-apply.mjs` and `v12-rendered-compare.mjs`, and restore the Markdown edits listed above.
