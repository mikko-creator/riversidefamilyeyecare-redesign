# Image plan: Riverside Family Eye Care redesign ("Riverlight")

Written 2026-10-01 by the design-panel synthesis stage, as the companion of `docs/DESIGN-SPEC.md`. It lists every slot that
needs a generated image, which real images fill which slots, the placeholders, and the one Higgsfield motion asset. The
entries of section 3 map one to one onto `src/content/image-plan.json`, the plan file `tools/fal-gen.mjs` reads
(`defaults` plus `images[]` with `id`, `prompt`, `input`, `cutout`, `editFrom`, `role`, `alt`, `usedFor`).

**Evidence used:** `docs/IMAGE-INVENTORY.md`, `audit/image-classification.json`, `audit/image-inventory.json`,
`audit/clone-removals.json` (`images.droppedOnPages`: the 12 refused stock slots), the page models in `tmp/page-models/`,
the raw pages around each refused image (to place each stand-in where the source had it), `tmp/toolcheck/NOTES.md` and the
panel's generated masters with their sidecars (`tmp/panel/riverlight/img/gen/*.json`).

## 0. Summary

| category | slots | new fal calls (planned) | reserve | Higgsfield |
|---|---|---|---|---|
| Reused generated assets (section 2) | 6 masters feeding the home, 73 title arches and 1 inline figure | 0 | 2 (re-review fixes) | |
| Title-band section defaults, new (3.2) | 2 masters for 40 arches (plus the shared contact-lens image for 11) | 2 | 2 | |
| Stock stand-ins for refused images (3.3) | 10 new images filling 11 of the 12 refused slots (8 pages; the stand-ins appear on 7) | 10 | 6 | |
| Optional graft: kids' glasses cut-out (3.4) | 1 | 3 (generate, Kontext clean, cut-out) | 1 | |
| Hero clip still (7) | 1 | 1 | 1 | |
| Hero motion loop (7) | 1 | | | 1 clip (+1 retry) |
| **Total** | | **16** | **12** | **1-2 clips** |

Planned 16 fal calls, 28 with every reserve used; stop at 34 and never exceed 40 (section 9). Estimated fal cost at the
rates recorded in `tmp/toolcheck/NOTES.md` and the panel's CONCEPT files (flux ultra about $0.06, Kontext about $0.04,
birefnet about $0.01): about $0.90 planned, about $1.50 with every reserve. Higgsfield: about $0.77 per 10 s 1080p clip
(estimate endpoint, NOTES), $1.54 with the retry. All prices are estimates, not checked against billing.

## 1. Rules (binding)

1. **Generated images are illustrative industry imagery only:** optical still life, light and lenses, calm Gulf-coast
   lifestyle without people, abstract aurora light, cut-outs for protrusion. They never depict this practice's people,
   patients, office or results, and never show a brand (DESIGN-BRIEF 2 and 6).
2. **No generated person.** No faces, no eyes, no skin close-ups. Hands appear only in the contact-lens image (one
   fingertip). A slot that names a person (the five refused portraits) or a brand (Bajio) never takes a generated image.
3. **Text-prone subjects** (eyewear, instruments, packaging, books, signs, screens) are avoided where possible. Where one
   is used (N2, N4, N7, H3), the prompt forbids printing and the review looks for pseudo-text at 400% (memory:
   fal flux draws garbled words on temples and dials even when told not to). No phoropter, trial frame, eye chart, dial or
   screen appears in any prompt.
4. **Anatomy:** a contact lens is a thin, clear, flexible dome on a fingertip, never a glass dish or a bead (rejected
   before on this project: `tmp/panel/riverlight/img/gen/lens.jpg`).
5. **No generated eyewear beside brand imagery:** never in or next to the designer-frames gallery, the frame-brand logo
   walls, the Transitions campaigns or any product grid.
6. **Palette:** navy, logo teal, aqua, pale sky, a little lilac, white. No neon, no rainbow, no night sky. Review checks
   the mean saturation (about 0.2-0.35 for ambient images) and that saturated pixels sit in the teal-to-violet hues.
7. **AI label:** every shipped generated file carries an IPTC `trainedAlgorithmicMedia` XMP packet, written after the
   WebP encode with webpmux (`images.mjs aiLabel`, DESIGN-SPEC P7); fal's own C2PA manifest does not survive a re-encode.
   The video carries the label in its container metadata and is recorded in `audit/generated-images.json`.
8. **Alt text:** ambient images (arches, cut-outs, the hero light, added illustrations) are `alt=""`. A stand-in in a
   content slot gets a literal description of what it shows (section 3.3), never the refused photo's alt ("Little girl
   holds glasses" would be false). The fabrication detector (DESIGN-SPEC A-20) checks that every generated `img` has
   either `""` or its plan alt.
9. **Records:** every call, retry, rejection and cost goes into `audit/generated-images.json`; a rejected image is
   archived under `assets/generated/rejected/`, never deleted.

## 2. Reused generated assets (no new calls)

| id | master | made by | used for | review before shipping | alt |
|---|---|---|---|---|---|
| H1 | `tmp/panel/riverlight/img/gen/glasses-norivet.cut.fixed.png` (1184x880, transparent) | fal Kontext edit of `tmp/toolcheck/eyeglasses.jpg` removing the gold rivets (request `01a0f5b9-dd90-76c3-ab92-f98cde06c308`) + birefnet cut-out (`01a0f5ba-071f-7331-9a51-88866c959895`); a detached shadow sliver erased locally | home hero cut-out (DESIGN-SPEC 3.4), displayed 190-370 px wide | 400% crops of both temples, the bridge and the front corners: no rivets, no print (another Kontext pass of the same source left faint temple print in the nightglow panel); alpha edge on magenta. Reserve: 1 Kontext call | `""` |
| H2 | `tmp/panel/riverlight/img/gen/lens-beam.jpg` (2752x1536) | flux ultra 16:9 (`01a0f5bc-118e-7460-b6d5-245b83dd62a6`) | home cataract lens, 4:5 crop (DESIGN-SPEC 3.13) | 400% crops of the rim: the designer judged the glints refraction and asked for a second reviewer (DESIGN-SPEC R6). Reserve: 1 Kontext call | `""` |
| TB-ecs | `tmp/panel/riverlight/img/gen/droplet.jpg` (2368x1792) | flux ultra 4:3 (`01a0f5bb-42d6-72f2-9b14-d26d0b5d2b6d`) | title arch of the 21 eye-care-services pages (4.1); `object-position: 68% 62%` | the brand judge measured it 100% teal hue, high-key | `""` |
| TB-blog, A1 | `tmp/panel/riverlight/img/gen/florida-light.jpg` (2752x1536) | flux ultra 16:9 (`01a0f5c5-3cba-7262-8ca8-86400705d680`) | title arch of the 21 posts and `/whats-new/`; A1: a wide figure on `/eye-care-services/dry-eye-disease-and-treatment/` after the paragraph that ends "...can worsen dry eye symptoms." (the prototype's placement) | crops of the window and the glass: no text, no logo | `""` |
| TB-utility | `tmp/toolcheck/hf-aurora.png` (2048x1152) | Higgsfield `z-image/turbo` 16:9 2k (`404b92f9-bb6e-4501-8be3-fe1aad9a80aa`) | title arch of 30 utility pages (archives, legal, sitemap, 404, testimonial, templates) | calm teal/navy wave on white, no text (NOTES); confirm at 100% | `""` |
| (fallback) | `tmp/panel/riverlight/img/video/river-loop.{mp4,webm}`, `river-poster*.webp` | the panel's regrade of `tmp/toolcheck/hfvid/loop.mp4` | the hero loop only if the new clip (section 7) fails review | as section 7 | `""` |

Not reused: `tmp/panel/riverlight/img/gen/lens.jpg` (rejected: a glass dish with a peeling-film artefact),
`tmp/toolcheck/aurora-navy-teal.jpg` (reads as a night aurora, slightly neon), `tmp/toolcheck/eyeglasses.jpg` and
`.cut.png` (gold rivets; superseded by H1), Irisbloom's kids' glasses (a blurred patch on one temple and jagged rims,
`sheets/cutouts-2x.png`).

## 3. New fal generations

### 3.1 Plan defaults (`src/content/image-plan.json`)

```json
{
  "defaults": {
    "model": "fal-ai/flux-pro/v1.1-ultra",
    "input": { "output_format": "jpeg", "safety_tolerance": "2" },
    "style": "soft diffused morning daylight from the upper left, high-key, airy and calm, clean minimal composition with generous empty space, white and pale aqua tones with gentle teal reflections and small deep navy accents, natural photographic realism, no text, no letters, no numbers, no logos, no labels, no watermarks, no brand marks",
    "cutoutModel": "fal-ai/birefnet/v2",
    "cutoutInput": {}
  }
}
```

`fal-gen.mjs` appends `style` to every prompt that is not an edit; an edit (`editFrom`) sends only the change. Each item
below sets `input.aspect_ratio`. Every new image uses the default model, `fal-ai/flux-pro/v1.1-ultra`; every fix and H3's
clean pass is an edit item with `model: "fal-ai/flux-pro/kontext"` and `editFrom` the master to fix; cut-outs use
`fal-ai/birefnet/v2` through `cutout: true`. Masters land in `assets/generated/<id>.jpg` (or `.png` for cut-outs).

### 3.2 Title-band section defaults

| id | used for | aspect | prompt (`style` is appended) | cut-out | alt | calls |
|---|---|---|---|---|---|---|
| TB-eyeglasses | title arch of the 36 eyeglasses pages (including `/eyeglasses/designer-frames/`, which has no header photo) | 3:4 | "A clear triangular glass prism standing on a smooth white seamless surface, a soft beam of morning light passes through it and spreads into a gentle band of teal, aqua and pale lilac light across the white surface, crisp minimal scientific still life, only teal and lilac light, no rainbow, no people" | no | `""` | 1 (+1) |
| TB-insurance | title arch of `/insurance/carecredit/`, `/insurance/faqs-of-vision-insurance-plans/`, `/insurance/whats-in-your-vision-insurance-plan/`, `/cherry-payment-plan/` | 3:4 | "A small green leafy plant in a plain white ceramic pot on a clean white desk beside a closed plain white notebook, soft morning window light casting long gentle shadows, pale aqua wall, calm and reassuring still life, no writing on anything, no people" | no | `""` | 1 (+1) |

The contact-lens default (11 pages) is N3 below; the contact family (7 pages) uses the practice's own interior photo
(section 5).

### 3.3 Stand-ins for the refused stock images

The 12 visible stock slots with no file on disk (`audit/clone-removals.json`) take 10 new images, N1 filling two of them;
the dry-eye page's banner slot stays empty. Placement data goes to `model.art.inline` (DESIGN-SPEC P4) with the anchor
shown; each anchor was read from the raw page around the refused `<img>`.

| id | page and slot (source image, declared size) | anchor | aspect | prompt (`style` is appended) | alt (literal) | calls |
|---|---|---|---|---|---|---|
| N1 | `/eye-care-services/nearsighted-myopia/` lead ("Cheerful smiling child … goggles", 2560x1274); also the "Myopia Management in Southwest Florida" child-page thumb on `/eye-care-services/` (2000x1333) | start of the article; the hub item's `thumb` | 16:9 | "A single teal and white diamond-shaped kite flying high in a clear pale-blue morning sky with a few soft white clouds, the kite small and sharp in the upper right third, its string curving down out of frame, bright Florida daylight, nothing printed on the kite, no people, no ground" | "A teal and white kite high in a clear morning sky" | 1 (+1 shared) |
| N2 | myopia page, "What Is Myopia?" inset ("Little girl holds glasses…", 230x153, alignright) | inset right at the start of that section | 3:2 | "A pair of small children's eyeglasses with soft teal translucent frames resting folded on a plain white table, a softly blurred bright window behind, shallow depth of field, smooth plain temple arms with no printing, no stickers, no rivets, no people" | "Small children's eyeglasses with teal frames on a white table" | 1 (+1 Kontext) |
| N3 | myopia page, "How Myopia Management Can Help" inset ("Little girl practicing to insert ophthalmic lenses…", 230x153, alignleft); also the title arch of the 11 contact-lens pages | inset left at the start of that section; arch | 1:1 | "Close-up of a single soft contact lens balanced on the tip of an index finger, the lens is a thin clear flexible dome with a faint aqua edge catching the light, clean pale aqua background, macro photography, only one fingertip visible, no face, no eyes" | inset: "A soft contact lens balanced on a fingertip"; arch: `""` | 1 (+1) |
| N4 | myopia page, "Is Myopia Management Right for Your Child?" inset ("Atropine Drops", 230x153, alignright) | inset right at the start of that section | 3:2 | "A small plain amber glass dropper bottle with a white rubber bulb standing on a smooth white surface, one clear drop forming at the glass tip of the dropper beside the bottle, minimal clinical still life, the bottle has no label, no printing, no stickers, no cap text" | "An unlabelled amber dropper bottle with a drop at its tip" | 1 (+1 Kontext) |
| N5 | `/eye-care-services/management-of-ocular-diseases/glaucoma/` lead ("Detailed depiction emphasizing the importance of glaucoma exams", 2000x1067) | start of the article | 16:9 | "Abstract image: many fine rays of soft teal and aqua light converging gently toward one small bright glowing point on the right, pale white-to-aqua background, calm, luminous, minimal, smooth gradients, no anatomy, no shapes, no people" | "Soft teal rays of light converging on a bright point" | 1 |
| N6 | `/eye-care-services/dry-eye-disease-and-treatment/envision-inmode/` inline ("skin model", 600x350) | before the heading "How IPL and RF Work Together for Eye and Skin Health" | 16:9 | "Two soft overlapping beams of light on a smooth pale surface, one warm golden beam from the left and one cool teal beam from the right, blending gently where they meet, calm minimal abstract still life, no devices, no skin, no people" | "A warm beam and a teal beam of light overlapping on a pale surface" | 1 |
| N7 | `/glaucoma-awareness-starts-with-an-eye-exam/` ("happy old couple hugging", 600x350) | before the heading "What is Glaucoma and Why Should You Be Concerned?" | 16:9 | "Two pairs of reading glasses resting side by side on a sunny wooden porch table beside two white coffee cups, warm morning light, a soft green garden blurred behind, a calm feeling of companionship, plain frames with no printing, no people" | "Two pairs of reading glasses and two coffee cups on a sunny porch table" | 1 (+1 Kontext) |
| N8 | `/what-happens-during-a-dry-eye-assessment-a-non-invasive-exam-for-gritty-eyes-in-fort-myers/` lead ("senior man suffering from sore eyes", 640x350) | start of the article | 16:9 | "Sunlit sea oats on a pale sand dune under a clear soft morning sky on the Gulf coast of Florida, a gentle sea breeze, hazy light, wide composition with open sky, no people, no buildings, no signs" | "Sea oats on a sunlit dune under a clear morning sky" | 1 |
| N9 | `/why-regular-optometry-visits-are-crucial-for-managing-eye-conditions/` ("AdobeStock 819072843 Regular Optometry", 450x246, alignright) | inset right at the start of the article | 16:9 | "A small glass hourglass with pale aqua sand on a clean white desk, a green leaf in soft focus at the edge, calm minimal still life, no clocks, no writing, no people" | "A small hourglass with pale aqua sand on a sunlit desk" | 1 |
| N10 | `/eye-care-services/` child-page thumb "Dry Eye Treatment in Fort Myers, Florida" ("Woman covering one eye…", 325x217) | the hub item's `thumb` | 3:2 | "A folded soft white cotton cloth resting in a shallow white ceramic bowl of warm water with a few wisps of steam, pale aqua background, calm spa-like still life, no text, no people" | "A folded white cloth in a bowl of warm water with wisps of steam" | 1 |
| (none) | `/eye-care-services/dry-eye-disease-and-treatment/` banner ("Close up of the red eye…", 1024x384) | omitted, declared; the page has the arch (TB-ecs) and A1 | | | | 0 |

Reserve pool for this table: 6 calls (the three Kontext fixes, one N3 anatomy retry, two for any other rejection).

### 3.4 Optional graft: kids' glasses cut-out (DESIGN-SPEC G19, 3.9)

| id | slot | aspect | prompt | cut-out | alt | calls |
|---|---|---|---|---|---|---|
| H3 | home, Back-to-School callout (s7), resting on its photo's lower-right corner | 4:3 | "Product photo of a small pair of children's eyeglasses with translucent aqua-teal acetate frames and clear lenses, three-quarter view, centred on a plain light grey seamless background, soft studio light from the upper left, smooth plain temple arms with no printing, no rivets, no logos" (style appended) | yes (birefnet) | `""` | 1 generate + 1 Kontext ("Remove any printed lettering or marks from both temple arms and the bridge; keep everything else exactly the same") + 1 cut-out (+1) |

Ship it only if the 400% review finds no print on either temple and the cut-out has clean rims (Irisbloom's attempt
needed a local blur and still showed jagged rims). Otherwise drop the graft; nothing else depends on it.

## 4. Title-band image map

Resolution order (DESIGN-SPEC 3.21): team portrait or placeholder, then a hub's own header photo, then a page-specific
image (none in this set), then the section default. Counts are page models (147 pages besides the home, plus
`dist/404.html`), computed from `tmp/page-models/`.

| default | source | models |
|---|---|---|
| TB-ecs (droplet, reused) | generated | 21 eye-care-services pages (the hub uses its own photo) |
| TB-eyeglasses (prism, new) | generated | 36 eyeglasses pages including `/eyeglasses/designer-frames/` |
| TB-contacts (N3, new) | generated | 11 contact-lens pages |
| TB-insurance (plant, new) | generated | 4 (`/insurance/` children and `/cherry-payment-plan/`) |
| TB-contact | real: `assets/source/1340b76a-Interior-shot-of-practice-2-1024x682.jpg` (reception and showroom, no marks) | 7: `/contact-us/` and its 4 children, `/hours-location/`, `/location/riverside-family-eyecare/` |
| TB-blog (florida-light, reused) | generated | 22: the 21 posts and `/whats-new/` |
| TB-utility (hf-aurora still, reused) | generated | 30: 17 archives, 3 legal, sitemap, `/404-page-not-found/`, `404.html`, the testimonial, 6 templates |
| TB-hub | real: each hub's header photo | 6: `/contact-lenses/`, `/eye-care-services/`, `/eyeglasses/`, `/insurance/`, `/our-eye-doctors/`, `/the-staff/` |
| TB-team | real portrait or the placeholder plate | 11 team-member pages |
| **total** | | **148** |

Arch crops: the frame is 4:5 (`--arch-w` up to 340 px, 300 px for portraits). `sizes` uses the rendered cover width
(DESIGN-SPEC 7): a 3:2 photo in a 340x425 arch renders 638 px wide, so the 1280 px hub photos are needed at 1.5x and
the 640 px portraits stay within 1.17x at 2x.

## 5. Real images and their slots

Every real image is kept, resized only, encoded to WebP with `srcset` (P1). Brand and product images are never cropped
through a mark, recoloured, cut out or regenerated. Real people are shown only in their own photographs, never cut out
(cut-outs of the practice's people need its approval, IMAGE-INVENTORY 7.2).

### 5.1 Home (model sections; DESIGN-SPEC 3.16)

| slot | file in `assets/source/` | treatment |
|---|---|---|
| hero frame (s1) | `f51aa942-Riverside-Family-Eyecare-practice-interior-wide-shot.jpg` (1920x800) | 4:3 crop at 1067x800, `alt=""` (a background in the model); the phone file `acf352ff-Riverside-Family-Eyecare-practice-interior-wide-shot-new.jpg` (1190x496, the same scene) is superseded (DESIGN-SPEC Q-6) |
| Envision promo (s4) | `bf544e21-1-81.png` (1366x512) | whole, never cropped (text and mark baked in) |
| service cards (s5) | `0d35a466-Eye-exam-on-elderly-patient.jpg`, `dc83e2b3-happy-man-at-computer_560x560px.jpg`, `58dc80d2-patient-form_639x639px.jpg`, `535ae448-Pediatric-eye-exam.jpg` | 5:4 frames, cover |
| Alumier band (s6) | `fa654f12-1008-100525001-Sunscreen-Reformulation-ShopifyBanners-NA.jpg`, `d1b24a9f-AlumierMD_Logo_Gry.png` | banner as the card background (`object-position: 50% 50%`, no mark cut); logo whole |
| callouts (s7) | `696a266e-Child-Serious-Preschool-1280x480-e1541434177535-640x240.jpg`, `71dd43cc-Dry-Eye-Senior-Woman-1280x480-640x240.jpg` | 640x240 frames at native aspect |
| Dr. Degler (s8) | `66110ac0-brittany_GSP_UID_9cde0fdb-5f4b-45df-b8ff-c44fadddc1d5.jpeg` (640x640) | square, larger than its plate; not cut out |
| lavender trio (s10) | `5d71d537-aa-woman-with-glasses-01-427x427.jpg`, `c882d2df-Man-Wearing-Black-Glasses-01-427x427.jpg`, `92a18273-Happy-three-People-on-the-Beach-with-Sunglasses-01-427x427.jpg` | round frames, max 236 px (427 px files) |
| designer frames (s11) | `f4789a9f-Img_0001_furla-glasses-banner-550-pixels.jpg`, `96298e1f-Img_0003_draper-james-debut.jpg`, `04c7d0c3-Img_0002_Charmant-CHTP-vintage_man_icons_A1_EN_high.jpg` (500x500) | square, whole |
| Eye Emergencies (s13) | `4d458411-Eye-doctor-shaking-elderly-patients-hand.jpg` (800x800) | square frame, breakout |
| reviews (s14) | `f678ebe5-Fun-photo-of-Riverside-Family-Eyecare-staff.jpg` (800x800) | square frame under the panel |
| logo (chrome) | `5569c741-Riverside-Family-Eye-Care-Logo-01.png`, `c7424d19-Riverside-Family-Eye-Care-Logo.png` | byte-identical copies (P3) |

### 5.2 The rest of the site

| image group | files | treatment |
|---|---|---|
| hub header photos | `91b8d1df-Eye-doctor-helping-patient-with-contact-lenses.jpg`, `1a1d8d65-Eye-care-services.jpg`, `2dc55e46-Eyeglass-frames-display-wide-shot.jpg` (crop away from the small wall poster), `9e1e782e-Insurance-image.jpg`, `45691f4c-Eye-doctor-performing-eye-exam-on-young-patient.jpg`, `ac79d27c-IMG_7898-scaled.jpeg` | title arches of their hubs, `alt=""` (backgrounds in the model) |
| contact family arch | `1340b76a-Interior-shot-of-practice-2-1024x682.jpg` | arch on 7 pages; it also stays in `/hours-location/`'s content |
| portraits | Degler, Erica, Nancy, Rose, Asma (640x640), Kristina (607x640, 607x809) | team cards, doctor blocks, team-page arches at 300 px or less |
| lead figures | 17 blog posts and 18 interiors open with a figure | stay first in the article (DESIGN-SPEC 3.21), drawn at no more than intrinsic width |
| prose photos, plates, diagrams | 109 images in interior mains, 20 in posts | DESIGN-SPEC 3.22 figure rules |
| child-page thumbnails | 24 on hubs | image cards with a 48 px break-out |
| contact-lens packs | 53 product images | white chips, `contain`, whole (they carry maker text) |
| devices | 9 equipment images | white plates, whole; no cut-outs (they would need 9 birefnet calls; not in budget) |
| frame-brand and lens-brand logos and campaigns | 27 logos, 9 campaigns, 3 Transitions campaigns | logo chips and frames, whole |
| insurance and payment logos | 20 distinct files, 22 slots | white chips at native 133x110, `contain` |
| practice office photos with marks | `IMG_5306`, `IMG_5312`, `IMG_5318`, `IMG_5320-1`, the exterior shot | stay in their pages' content; not used as arches (designer sign, device marks, a Pizza Hut sign) |
| social share images | 4 refused share-only references | the OG logo card, as the build does today |

## 6. Placeholders

| slot | page(s) | person or brand | element |
|---|---|---|---|
| doctor block | `/` | Dr. Kristin Nelson, O.D., IACMM | iris-ring plate with "KN" and the full name (DESIGN-SPEC 3.10) |
| doctor cards | `/our-eye-doctors/` | Dr. Kristin Nelson; Dr. Maivys Longa, O.D. | plates with "KN" and "ML" |
| staff cards | `/the-staff/` | Heather, Xaiene, Jhonae | plates with "H", "X", "J" |
| team-page arches | `/team/dr-kristin-nelson-od/`, `/team/maivys-longa/`, `/team/heather/`, `/team/xaiene-dos-santos-da-costa/`, `/team/jhonae-anglin/` | the page's person | the plate in the arch. Jhonae's page shows no portrait at source; the build adds her "J" plate to the arch from the staff list (BUILD-NOTES 5.10, TB-team; QA round 1, CONTENT-15: this row used to list 4 pages) |
| gallery cell | `/` | Bajio | the brand name set in type in an equal square (DESIGN-SPEC 3.12) |

Every plate is `role="img"` with the person's name as its label and `data-needs="practice photo"` (the Bajio cell
`data-needs="brand image"`). The practice's photos replace them as delivered; the home HTML declares Dr. Nelson's file as
750x750, a useful size to request. No placeholder ever shows a generated face or a generated brand image.

## 7. Higgsfield motion asset: the hero river loop

| item | value |
|---|---|
| purpose | DESIGN-SPEC A3: the slow river of brand-coloured light behind the home hero. Home only (U3) |
| still (first frame) | V1, a new fal flux ultra 16:9 still (1 call, +1 reserve): "A wide, calm, luminous ribbon of soft light flowing like a slow river across a pure white background, entering from the right edge and curving gently down toward the lower left, made of two fine parallel strands, a luminous teal strand above a thinner deep navy strand, wrapped in a soft translucent aqua and pale sky-blue glow with a faint lilac haze at the far left, the upper left third left empty and white, smooth seamless gradients, minimal abstract, no objects, no people" (style appended). Fallback still: `tmp/toolcheck/hf-aurora.png` |
| endpoint | `kling-video/v3.0-turbo/image-to-video`, 10 s, 1080p, about $0.77 (validated on this project, NOTES); price check first with `tools/hf-run.mjs --estimate`. Alternative only if Kling fails twice: `alibaba/wan-3.0/image-to-video` at $0.20/s (10 s = about $2.00) |
| call | `node tools/hf-run.mjs --key-file <scratchpad hf.key> --endpoint kling-video/v3.0-turbo/image-to-video --upload assets/generated/V1.jpg --upload-field image_url --input '{"prompt":"…","duration":10,"resolution":"1080p"}' --out tmp/hf/hero-river.mp4` |
| motion prompt | "Locked-off static camera. The soft luminous ribbon of light drifts and undulates very slowly, like a calm river current, a gentle shimmer travelling from right to left along the teal and navy strands. Smooth continuous ambient motion. No camera movement, no zoom, no new objects, no text, no flashes, no cuts, no brightness changes." |
| duration and loop | 10 s clip; `node tools/make-loop.mjs --in tmp/hf/hero-river.mp4 --out src/theme/media/hero-river --fade 1.5 --width 1920 --phone-width 720 --phone-aspect 9:16 --crf 26 --label "Higgsfield kling-video/v3.0-turbo/image-to-video"`: the clip from 1.5 s crossfaded back into its own start, about 8.5 s, the seam measured like any other frame. Width 1920 so the phone crop (a centre crop of the full 1080 px height, 607 px wide) is scaled up only 1.19x to 720 |
| outputs | `hero-river.mp4` (H.264 yuv420p, high profile, `+faststart`, no audio), `hero-river.webm` (VP9, CRF 36), `hero-river-phone.mp4` (720x1280 centre crop), `hero-river-poster.webp` (frame 0, quality 82), `hero-river.json` (sizes, durations, calmness) |
| size caps | WebM 350 KB or less and MP4 850 KB or less at 1920x1080 for about 8.5 s (the toolcheck loop at these settings: 228 KB and 815 KB); phone MP4 400 KB or less; poster 30 KB or less (also the A6 title-band still, re-encoded to 1600 px); phone poster 15 KB or less. Raise the CRF by 2 until a cap holds |
| loading rule | no `<video>` in the markup and never `autoplay`: the poster `img` is what loads. After the window `load` event the script creates `video` (muted, `playsinline`, `loop`, `aria-hidden`, `tabindex=-1`), adds the sources for the current media (WebM then MP4 at 769 px and up, the phone MP4 below), plays it and fades it in on `playing`. Skipped for `prefers-reduced-motion: reduce`, Save-Data, `effectiveType` slow-2g/2g/3g and `prefers-reduced-data: reduce`. Paused by an IntersectionObserver when off screen; the source swaps on a `matchMedia` change |
| calmness rule (WCAG 2.3.1) | make-loop's `signalstats` YDIF over two plays: max 3.0 or less, p95 1.5 or less, 0 frames over 20 (a flash), seam change no larger than 1.5x the p95. The toolcheck loop measured max 1.12 / p95 0.84 / 0 over 20; the control (a 2 Hz black/white flash) read max 219 and 51 frames over 20. No luminance pumping: the per-frame mean luma stays within 6 levels across the loop |
| brand check | on 12 sampled frames: 70% or more of saturated pixels in the teal-to-navy hues (OKLCH hue 180-280), 0% neon (S and V above 0.85), mean saturation 0.2-0.35, upper-left third near white (the statement sits there; text contrast is judged on rendered pixels with the video seeked, DESIGN-SPEC A-5) |
| review | a frame strip (`ffmpeg -i src/theme/media/hero-river.mp4 -vf "fps=1,scale=320:-1,tile=9x1" -frames:v 1 tmp/hf/strip.jpg`) viewed: no watermark, no artefact, no new object, steady camera |
| AI label | make-loop writes "AI-generated illustrative motion (Higgsfield …). Not footage of this practice, its people, its patients or its results." into the comment and description tags; the posters get the XMP label; the clip and its still are recorded in `audit/generated-images.json` |
| fallback | if two clips fail the calmness or brand check: the panel's regraded loop (section 2) |

No other motion asset is planned: interiors use the poster still (U3), and every other movement is CSS or the static
river.

## 8. Process, review and records

1. Write `src/content/image-plan.json` from sections 3.1-3.4 (ids, prompts, `input.aspect_ratio`, `cutout`, `role`, `alt`,
   `usedFor` with page paths and anchors) and add the reused masters as `reuse` entries.
2. Dry run: `node tools/fal-gen.mjs --plan src/content/image-plan.json --key-file <scratchpad fal.key> --dry`.
3. Generate in this order, reviewing each before the next: V1, TB-eyeglasses, TB-insurance, N1-N10, then H3 only if the
   budget allows. One call at a time; the tool resumes and never regenerates a file already on disk.
4. **Review every image** (one view of the full frame plus 100% and 400% crops of every text-prone area: temples, bridges,
   bottle surfaces, kite cloth, notebook covers): no pseudo-text, emblem, cross, watermark or brand-like mark; correct
   anatomy (N3); no person (all but N3's fingertip); palette within rule 6; no seam or artefact. Write the verdict into
   the record before moving on.
5. **Fix:** a Kontext edit (`editFrom` the rejected master; the prompt names only the change), else regenerate; archive
   every rejected version.
6. **Cut-outs:** check the alpha on a magenta composite and scan alpha runs for detached slivers; erase them locally.
7. **Encode** through `images.mjs` with `aiLabel` (P7) and the variants of P1; verify with `webpmux -info` (XMP present)
   and `grep -c trainedAlgorithmicMedia` on every shipped generated file.
8. **Place** through `model.art` (P4) and run the content gates: `words-added` must stay at 0 (stand-ins add no visible
   text), `keep-image-parity` unchanged, and the fabrication detector (DESIGN-SPEC A-20).

## 9. Budget ledger and stop rules

| line | calls |
|---|---|
| V1 hero still | 1 (+1) |
| TB-eyeglasses, TB-insurance | 2 (+2) |
| N1-N10 | 10 (+6) |
| H3 kids' glasses (optional) | 3 (+1) |
| H1, H2 re-review fixes | 0 (+2) |
| **planned / with reserves** | **16 / 28** |

- Stop generating at 34 calls and report what is unresolved; never exceed 40.
- If an item fails three times, drop it: an empty slot stays declared (as the build does today), and an arch falls back
  to TB-utility.
- Higgsfield: at most 2 clips; then the fallback loop.

## 10. Review log

Kept by the wf4 fix stages; the rest of this document is the plan as written. Round 1 reviews: `tmp/wf4/review-A-r1/`,
`tmp/wf4/review-B-r1/`, `tmp/wf4/review-M-r1/` (2026-10-02). Fix round 1 (`wf4 fix-r1`, scratch `tmp/wf4/fix-r1/`, notes in
`notes.txt` there) applied every non-ACCEPT verdict it received. Every archived file is listed in `audit/generated-images.json`
`rejected[]` with its sha256, request id and reason; the round's paid calls are in that file's `ledgers[]` (`wf4 fix-r1`).

Round 2 review: `tmp/wf4/review-R-r2/` (2026-10-02). It covered H3, N1, N2, N4, N6, N7 and TB-eyeglasses; its verdicts are on
the `VERDICTS` line of `view-notes.txt` there. Fix round 2 (`wf4 fix-r2`, scratch `tmp/wf4/fix-r2/`, notes in `notes.txt` there)
applied its non-ACCEPT verdicts: H3 KONTEXT and N6 DROP (given twice). Its ledger is `wf4 fix-r2` in the same file.

**Round 1 spend:** 8 fal calls (5 flux ultra, 3 Kontext), 0 Higgsfield. **Round 2 spend:** 0 fal calls, 0 Higgsfield; both
round-2 verdicts named a 0-call route. **Running total:** 24 fal calls (stop at 34, cap 40), about $1.31 fal plus $0.77
Higgsfield (1 clip) = about $2.08 (plan-rate estimates, not billing). Zero-cost local fixes: H3 (rounds 1 and 2), N2 (round 1).
Dropped: N6 (round 1; confirmed in round 2).

### Verdicts by asset

| asset | round 1 | round 2 (review-R-r2) | live file (sha256) | status |
|---|---|---|---|---|
| H3 | review-A-r1 KONTEXT (shadow wedge); fixed locally | KONTEXT (transparent triangle in the right lens); fixed locally | `H3.png` (35939151...) | fixed; not yet re-reviewed |
| N1 | review-A-r1 REGENERATE; regeneration 1a failed the fixer's check; retry 1b live | ACCEPT | `N1.jpg` (bd7e89b6...) | accepted |
| N2 | review-A-r1 KONTEXT; Kontext edit plus a local inpaint | ACCEPT | `N2.jpg` (f7c689e7...) | accepted |
| N4 | review-A-r1 REGENERATE | ACCEPT | `N4.jpg` (1349f802...) | accepted |
| N6 | review-A-r1 and review-B-r1 REGENERATE; 1a and 1b failed | DROP (twice) | none | dropped; slot declared empty |
| N7 | review-B-r1 KONTEXT | ACCEPT | `N7.jpg` (d2e014a4...) | accepted |
| TB-eyeglasses | review-B-r1 KONTEXT | ACCEPT | `TB-eyeglasses.jpg` (222e3d36...) | accepted |
| H1, H2, H3-src, N3, N5 | no non-ACCEPT verdict (review-A-r1 lane; notes only) | not in scope | unchanged | no change |
| N8, N9, N10, TB-blog, TB-ecs, TB-insurance, TB-utility, V1, hero-river loop | review-B-r1 ACCEPT | not in scope | unchanged | accepted |

### H3 (kids' glasses cut-out)
- Verdicts: round 1 review-A-r1 **KONTEXT**: the cut-out kept the grey cast shadow under the right earpiece tip (about 786 opaque px with S<0.2 at x 912-958, y 525-557). Text removal, rims and halo passed.
- Fix: the verdict's own zero-cost route (its issue 5; section 8.6 "erase them locally") instead of the 2-call Kontext + birefnet reserve, which stays unused. The shadow wedge was erased from the alpha channel with a sub-pixel soft edge (`tmp/wf4/fix-r1/h3_erase5.py`). RGB is untouched. 1,219 alpha px changed, all inside x 879-958, y 522-557. Opaque grey px in the review zone went from 783 to 0, and the cut-out is still one alpha component. Checked at 400% on magenta and on the photo tone.
- Paid calls: 0 this round. The file still comes from Kontext `01a0f827-5580-7551-8421-21d4d03be71d` + birefnet `01a0f827-8017-7570-a090-a7c1fc107b72`.
- Archived: `assets/generated/rejected/H3.1790872644981.png` (the round-0 cut-out). Live: `assets/generated/H3.png` (sha256 0fea82c1...).
- Open: the lens interiors are still opaque white-grey (the reviewer's optional refinement; not done). A `fal-gen --force H3` re-run would drop the erase (plan entry `postProcess`).
- Round 2, review-R-r2 **KONTEXT**: a missing part in the matte, there since round 0 and missed in round 1. A transparent triangle sat inside the right lens, between the horizontal temple bar, the diagonal temple bar and the rim: x 794-880, y 418-472, 2,384 px, mean alpha 3.5; 2,916 px with its soft rim. It showed black over the Back-to-School photo and would show a teal or lilac tint over the A1 aurora field. The reviewer re-checked the round-1 erase independently (0 RGB px changed; 1,219 alpha px, none raised; one component) and passed text and anatomy.
- Fix (round 2): the verdict's own 0-call route. No fal call can repair an alpha hole: Kontext returns RGB only, birefnet would likely cut the same hole, and `fal-gen --force H3` would undo the round-1 erase.
  - The edit, describing only the change: "Fill the transparent triangle inside the right lens, between the two temple bars and the rim, with the same light lens fill as the rest of that lens; keep everything else exactly the same."
  - `tmp/wf4/fix-r2/h3_holefill.py` takes the largest component of (the hole-filled alpha>=128 mask eroded by 4 px) & alpha<255. That is 2,916 px at x 789-881, y 413-475; cross, square, disk and distance erosions all give the same region. It copies RGB there from `raw/H3.edit.jpg` (the RGB stored under the hole was dark) and sets alpha to 255.
  - Exactly those 2,916 px changed, and alpha was only raised. Enclosed holes went from 1 to 0, and the cut-out is still one alpha component at alpha >= 1, 8, 32 and 128.
  - The seam is within 1 level of raw: the opaque ring around the region, and every step across its boundary. The result equals the reviewer's scratch test in every pixel.
  - 22 interior px stay at alpha 254 (five specks that were already there; visually opaque).
  - Re-checked at 200% on magenta, over the photo's dark lower-right corner, on #f9fafb and over a teal-lilac field, and the seam at 400% (`tmp/wf4/fix-r2/v01-H3-holefill-sheet.png`). The right lens now matches the left.
- Paid calls (round 2): 0. The file still comes from the same Kontext and birefnet requests. The plan entry's `postProcess` now lists both local steps in order, and a forced re-run must re-apply both.
- Archived (round 2): `assets/generated/rejected/H3.1790875551645.png` (the round-1 file, sha256 0fea82c1...). Live: `assets/generated/H3.png` (sha256 35939151...).
- Open after round 2: the lens fills stay opaque light grey. The verdict's optional refinement (lens-fill alpha about 0.5) was not done. The accepted H1 has the same opaque fill, and the change would touch about 55,000 px and need a new edge review. Where a lens overlaps the photo it reads as frosted (review-R-r2 v03), so placement can keep the lenses off the photo.

### N1 (myopia lead figure and hub thumb)
- Verdicts: round 1 review-A-r1 **REGENERATE**: the kite string ends in mid-air with a dark hook.
- Fix 1a: the verdict's prompt. flux ultra `01a0f855-a462-7dd2-a7b1-05e400fc75b5` failed the fixer's check: the line again ended in mid-air, as a wavy ribbon with a loop at about (305, 1275). Archived as `rejected/N1.1790873244323.jpg`.
- Fix 1b: the prompt now anchors the string at the bottom-left corner and forbids a tail, ribbons and bows. flux ultra `01a0f85c-e5b7-73e2-bae6-6bcc67bf4a8e` produced live `assets/generated/N1.jpg` (2752x1536, sha256 bd7e89b6...).
  - The line runs unbroken from the kite to the bottom edge, exiting at x about 594 on row 1535.
  - The kite sits at x 2000-2158, y 374-499, inside the centred 3:2 and 2:1 crops. Its cloth is plain at 400%.
  - A short twisted teal/white ribbon hangs where the line leaves the kite (the prompt said no tail; it reads as a normal kite tail).
  - meanS 0.249, 100% of saturated px at hue 180-280, no neon.
- Archived: `rejected/N1.1790872768311.jpg` (round 0), `rejected/N1.1790873244323.jpg` (1a). Failed generations: 2 of 3.
- Sync for 3.3: the N1 prompt is now the 1b prompt in `src/content/image-plan.json`. The alt is unchanged.
- Round 2, review-R-r2 **ACCEPT**: the line is continuous to the bottom edge at 200%; the kite cloth is plain at 400%. The short tail runs down along the line, a physics quirk and not a mark. The kite stays inside the 3:2 and 2:1 crops, and the alt is literal. No fix, no calls.

### N2 (myopia inset, "What Is Myopia?")
- Verdicts: round 1 review-A-r1 **KONTEXT**: a dark plate with "cn" marks on the left temple, studs on both end pieces, and an alt that is not literal.
- Fix: Kontext edit of `raw/N2.jpg` (`01a0f855-d538-7520-8616-25a3491f269d`, output 1248x832). It removed the plate and both studs. It left one round grey rivet-like dot on the defocused left temple at about (310, 420).
- The dot was filled locally by harmonic inpaint at no cost (`tmp/wf4/fix-r1/n2_inpaint.py`; 466 px; re-saved with the source JPEG tables, max difference 4 elsewhere). Both end pieces, the bridge and the temples are plain at 260-400%.
- Live: `assets/generated/N2.jpg` (sha256 f7c689e7...). Archived: `rejected/N2.1790872777193.jpg` (round 0), `rejected/N2.1790873396886.jpg` (Kontext output before the retouch, identical to `raw/N2.edit.jpg`).
- **Alt changed, sync 3.3:** "Teal eyeglasses resting on a folded cloth on a white table" (was "Small children's eyeglasses with teal frames on a white table"). The entry is now a Kontext edit of `raw/N2.jpg`.
- Note: 31% of saturated px are warm (the blurred window frame), as in round 0.
- Round 2, review-R-r2 **ACCEPT**: the retouch is confined to one 437 px blob and is invisible at 400%. There is no plate, stud or mark. The glasses have two temples and one bridge, the new alt is literal, and the blurred window carries no text. No fix, no calls.

### N4 (myopia inset, "Is Myopia Management Right for Your Child?")
- Verdicts: round 1 review-A-r1 **REGENERATE**: the bottle is not amber, the drop floats, the subject is about 5% of the width, and the alt is false twice.
- Fix: the verdict's prompt. flux ultra `01a0f855-f70b-7ed1-abc1-43849dee56a1` produced live `assets/generated/N4.jpg` (2496x1664, sha256 1349f802...).
  - A pale aqua glass bottle with a white bulb, a ribbed collar and an inner pipette fills about 60% of the frame height.
  - One clear drop rests on the surface just in front of the bottle.
  - No label, print or graduation marks at 100-300%. The light comes from the left.
  - Note: an unrequested soft green leaf sits at the upper right. It is 14% of the saturated px, but saturated px are only 1.9% of the image.
- Archived: `rejected/N4.1790872787665.jpg`.
- **Prompt and alt changed, sync 3.3:** the alt is "An unlabelled aqua glass dropper bottle with a drop beside it" (was "...amber dropper bottle with a drop at its tip"). Round 2 must confirm the alt is literal.
- Round 2, review-R-r2 **ACCEPT**: no label, print or graduation marks at 200-400%, and the drop reads as a drop on the surface. The alt is literal, which settles the round-1 open point. Notes: a refraction jog in the pipette at the shoulder (about 3 px at the inset) and the unrequested leaf. No fix, no calls.

### N6 (envision-inmode inline figure): DROPPED
- Verdicts: round 1 review-A-r1 **REGENERATE** (empty room corner, no legible beams, light from the right) and review-B-r1 **REGENERATE** (two full-height seams, no beams, false alt). They were merged into one regeneration: B's prompt plus A's "no room, no window".
- Fix 1a: flux ultra `01a0f856-1ff8-77d2-958e-070eeacede73` failed the fixer's check. It showed one teal beam on a grey wall with a floor line (a room corner again) and no warm light (warm OKLCH chroma max 0.0067).
- Fix 1b: an overhead flat-lay prompt, with a warm pool and a teal pool overlapping. flux ultra `01a0f85d-17d2-7f20-aed4-952a030cc681` failed: two separate hard-edged discs (teal and warm cream) that do not overlap and read as paper discs, not beams. It had no seams.
- Outcome: **dropped** under section 9 after three failed generations (rounds 0, 1a, 1b). The entry moved to `dropped[]` in `src/content/image-plan.json` and the slot was added to `declaredEmpty`. The audit record moved from `images[]` to `rejected[]` and `dropped[]`.
- **What fills the slot:** nothing. The inline slot before "How IPL and RF Work Together for Eye and Skin Health" on `/eye-care-services/dry-eye-disease-and-treatment/envision-inmode/` stays omitted and declared, as the build does today. The page keeps its TB-ecs title arch. Sync 3.3: the N6 row becomes "(none), dropped".
- Archived: `rejected/N6.1790872800398.jpg` (round 0), `rejected/N6.1790873257140.jpg` (1a), `rejected/N6.1790873396892.jpg` (1b).
- Round 2, review-R-r2 **DROP**, given twice (one answer to each round-1 REGENERATE): the reviewer viewed both rejects and confirmed three failed generations. Neither reject may come back with a rewritten alt. 1b reads as two paper coasters next to IPL/RF copy. 1a is an empty room interior that could be read as the practice's office (rule 1).
- Fix (round 2): none needed, 0 calls. The wiring was re-checked:
  - The plan has no N6 in `images[]`; N6 is in `dropped[]` and its slot is in `declaredEmpty`.
  - The audit has no live N6 record, three archives in `rejected[]` and the `dropped[]` record.
  - There is no live `assets/generated/N6.*` file.
  - Nothing in `dist` references N6. `dist` references no generated file yet; the envision-inmode page there has no image for the refused `skin-model-1.jpg`.
  - Both round-2 verdicts are now in the plan's `dropped[]` entry (`reviewLog`) and the audit's `dropped[]` record (`confirmed`).
- **What fills the slot after round 2:** still nothing. The inline figure stays omitted and declared (`declaredEmpty`), the page keeps its TB-ecs title arch, and there are no further calls for N6.

### N7 (glaucoma-awareness inline figure)
- Verdicts: round 1 review-B-r1 **KONTEXT**: one pair of glasses, but the alt counts two.
- Fix: Kontext edit of `raw/N7.jpg` adding a second pair (`01a0f856-51e8-7af0-a636-0aafc8ec270e`). Live `assets/generated/N7.jpg` is 1392x752 (sha256 d2e014a4...), which covers the 600x350 slot at 2.3x.
  - The image shows exactly two pairs and two cups.
  - All four temples, both bridges and the hinges at 250-400% show no letters, numbers or emblems. The right pair's hinge blocks are plain rectangular hardware.
  - The new pair is navy, not the teal the prompt asked for. The alt names no colour, so it is unchanged.
  - The palette is unchanged: warm, teal-violet 0.042, meanS 0.287. As in round 1 this is a note only.
- Archived: `rejected/N7.1790872811404.jpg`. Sync 3.3: the entry is now a Kontext edit of `raw/N7.jpg`.
- Round 2, review-R-r2 **ACCEPT**: exactly two pairs and two cups, and no hands or people. All four temples, both bridges and the hinges are plain at 300-600%. Watch item: at 100-120% the right pair's right hinge block looks letter-like, but at 600% it is slotted hinge hardware. No fix, no calls.

### TB-eyeglasses (title arch of 36 eyeglasses pages)
- Verdicts: round 1 review-B-r1 **KONTEXT**: rainbow bands on the right face, in the base and in the floor streak.
- Fix: Kontext recolour of `raw/TB-eyeglasses.jpg` (`01a0f855-7b5c-7ad3-826c-55f76c591d96`). Live `assets/generated/TB-eyeglasses.jpg` is 880x1184 (sha256 222e3d36...); it covers the 340x425 arch at 2x by width.
  - All saturated px sit at hue 180-270: 0 warm and 0 green (round 0 had 3% warm).
  - At low chroma, yellow and green at C>=0.04 are 0% (yellow was 0.74%). A faint cream on the central face and a pale pink-lilac floor streak remain at C<=0.06.
  - The star glints are gone. The apex, faces and base show no etched marks at 100-200%. The prism is still a pyramid, which B accepted.
- Archived: `rejected/TB-eyeglasses.1790872755987.jpg`. Sync 3.2: the entry is now a Kontext recolour of the round-0 master.
- Round 2, review-R-r2 **ACCEPT**: no red, orange, yellow or green band (the warm share at C>=0.04 is 0), and no etched marks at 300%. The 340 px arch and the 150 px phone arch keep the prism and the floor streak. Notes: still a square-based pyramid, and the apex is slightly soft at 300%. No fix, no calls.

### Other assets, round 1
- **ACCEPT** (review-B-r1 notes): N8, N9, N10, TB-blog (B recommends `object-position: 72% 50%`), TB-ecs, TB-insurance, TB-utility, V1, and the hero-river loop (flags: a crossfade double ribbon and the meanS floor).
- **No non-ACCEPT verdict reached this fix round:** H1, H2, H3-src, N3, N5 (review-A-r1 lane). A's notes record observations that were not acted on here:
  - H1: a small attached grey stub at the bottom of the left rim (x 336-351, y 564-570).
  - H2: a faint rainbow tint in the floor caustic, below the saturation floor.
  - N5: the starburst is centred rather than "on the right".
- Round 2: review-R-r2 covered none of these assets, so their round-1 status stands. No motion asset was in round-2 scope: the hero loop files predate fix-r1, and no motion verdict was given.

### Sync list for sections 3.2, 3.3, 3.4 and 9
This stage may only write this section. The tables above it still show round-0 values:
- N1 prompt; N2 alt and edit; N4 prompt and alt; N6 dropped; N7 edit; TB-eyeglasses recolour.
- 3.4 (round 2): the shipped H3 cut-out now has two local post-process steps (shadow erase, then the lens-hole fill). Neither costs a call, so the calls column is unchanged.
- Section 9: 24 of 34 calls used (unchanged by round 2).
