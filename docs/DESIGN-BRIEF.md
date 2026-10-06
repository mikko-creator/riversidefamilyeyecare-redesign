# Design brief: Riverside Family Eye Care redesign (aurora)

Written 2026-10-01 for the design panel. The measured evidence is in `docs/BRAND-SYSTEM.md`, `docs/SITE-ARCHITECTURE.md`,
`docs/IMAGE-INVENTORY.md`, `docs/FACTS-EVIDENCE.md` and `src/content/chrome.json`. Where this brief and those documents
disagree on a fact, the documents win, because they were verified against the crawl.

## 1. The operator's request

- Clone `https://www.riversidefamilyeyecare.com/` and capture its exact structure and architecture. That is done (the
  crawl, `docs/SITE-ARCHITECTURE.md`).
- Then a **total redesign** that **keeps the existing branding and the brand's tone**.
- **Keep the existing imagery**, and **add fal-generated images** related to the client's industry (optometry). Higgsfield
  may be used for images or **video / motion graphics**.
- **Multiple layers, so the site is not flat**: depth, for a better user experience. **Images protrude into other
  sections or outside their frames**, so the viewer gets an illusion of depth.
- **Experiment with "aurora" as the design style.** It must look **clean and modern**.
- **Scroll-through animations and hover effects.**

## 2. What must not change

- **The brand.** Use the logo file the site uses, unaltered; derived transparent versions are allowed. Keep the navy and
  teal brand colours (exact values are in `BRAND-SYSTEM.md` section 3). The tone stays warm, family-centred and
  community-minded: Fort Myers, "every patient like a member of our own family". Nothing about the redesign should feel
  like a different practice.
- **Every word.** The copy is the practice's, and it is reproduced verbatim. You may restructure, re-order, split into
  cards or tighten the layout around it. You may not rewrite, invent or drop it. Section headings stay as written.
  Calls to action keep their labels and targets.
- **No invented proof.** The only reviews are the ones on the live site, verbatim, with their names as shown. Add no
  statistics, awards, badges, ratings, credentials or prices beyond what the site states.
- **Real people stay real.** Doctors and staff are shown only in their own photographs. Two homepage images were refused
  by the CDN (HTTP 403) and are not on disk:
  - **Dr. Kristin Nelson's portrait**: design an honest placeholder, such as a monogram plate in the brand style with her
    name, which the practice's photo replaces later.
  - **The Bajio frame-brand photo** in "Our Designer Frames": show the brand **name as text** in an equally sized cell.

  Never use a generated person in a slot that names someone, and never use a generated image in a slot that names a
  brand.

## 3. Aurora, for this brand

"Aurora" here means **soft, luminous light in the brand's own hues** (navy, teal, and at most two harmonising supports)
that flows like the northern lights, used as **ambient layers behind and around clean content**. Rules:

- **Clean and modern first.** Use generous whitespace, a calm type scale, crisp edges on content surfaces, and few
  colours at a time. Aurora is atmosphere; it never sits behind body text at a contrast below WCAG AA. Avoid neon, rainbow
  and busy noise.
- **The brand gives aurora its shape.** The logo carries an eye mark with radiating lashes above a teal **wave**, and the
  practice is *Riverside*. Light that flows like a river, blooms like an iris, or arcs like the wave is on-brand. Generic
  blobs are not.
- **Aurora is light, so it has a direction.** Shadows, glows and glass highlights agree with it.
- **Performance is part of clean.** Animate `transform` and `opacity` only. Prefer pre-rendered textures (generated
  aurora images, CSS gradients) over animated `filter: blur()` on large layers, and stop off-screen animation. Under
  `prefers-reduced-motion: reduce` the aurora is still and every reveal is instant.

## 4. Depth: the requirements

- **At least three planes on every template:**
  1. the ambient aurora field;
  2. content surfaces (cards, glass panes, photo frames);
  3. foreground protrusions: cut-out objects, overlapping photos, floating chips.

  Each plane gets its own parallax rate and shadow depth.
- **Protrusion across boundaries.** At least four places on the home page where an image crosses a section edge or breaks
  out of its frame. Examples: a cut-out pair of eyeglasses overlapping the hero edge, a doctor photo whose frame is
  smaller than the photo, a device photo spilling over a band, cards overlapping the next section. Interior pages get at
  least one protrusion device of their own, in the title band.
- **Occlusion must not hide content.** A protrusion never covers text, a control or a focus ring, at any width from 360
  to 1920. Check 1280x585 with a 15px scrollbar (the operator's own window), 390x844 and 1440x900 at least.

## 5. Motion and hover

- **Scroll-through.** Staggered reveals, parallax planes and at least one scroll-linked aurora shift. Something on the
  page should respond as you scroll through it, not only fade in once.
- **Hover.** Card lift or tilt, image zoom inside its frame, a button sheen or glow, link underlines that draw in. Focus
  states are at least as visible as hover states.
- **Known traps from earlier builds, which must not recur:**
  - A reveal rule's `transform: none` outranks the hover transform. Release the reveal state after the entrance plays.
  - A ratio threshold above 0 can never fire on very tall elements. Use `threshold: 0`.
  - An unconditional fail-safe timer reveals everything off-screen.
  - A `cover %` view-timeline range leaves content mid-reveal while it is being read, and leaves the first screen stuck
    at load.
  - Content in the first viewport must be fully visible at load, without scrolling.

## 6. Imagery

- Keep every real image: the office interior, the doctors, the stock photography and the brand imagery (designer frames,
  contact-lens brands, InMode Envision, Alumier MD). They are in `assets/source/`; see `docs/IMAGE-INVENTORY.md`.
- **Generated images (fal)** are illustrative industry imagery, such as optical still life, lenses and light,
  eye-friendly lifestyle scenes, abstract aurora textures, and cut-outs for protrusion. They never depict this practice's
  people, patients, office or results, and they never show a brand.
  - Eyewear, instruments and packaging are **text-prone**: fal flux draws pseudo-text on temples, lenses and dials even
    when the prompt forbids text. Review every generated image at full resolution with zoomed crops.
  - Every generated image keeps an AI label: an IPTC `trainedAlgorithmicMedia` XMP packet, re-attached after any
    re-encode.
- **Higgsfield motion** can supply an ambient loop, for example an aurora sky or flowing light for the hero.
  - It must be calm: no flashes and no rapid cuts (WCAG 2.3.1), and loop seamlessly.
  - Load it after the page's `load` event, never with `autoplay` in the markup, and skip it for reduced motion and
    Save-Data.
  - The panel may stand in for it with CSS motion; the real clip is produced for the winning design.

## 7. Usability and accessibility

- Semantic HTML with one `<h1>` per page, landmarks, a skip link and a keyboard-operable menu and drawer. Tap targets are
  at least 44px. Text contrast meets WCAG AA (4.5:1 body, 3:1 large text and UI). There is no horizontal scroll from 360px
  up.
- Fonts are self-hosted (no runtime CDN). Image sizes match their rendered size (`srcset`/`sizes`), and every image has
  explicit dimensions.
- The site has **148 pages**, and about 140 of them are long-form interior pages: library articles, blog posts, team
  members, forms and legal. The design is judged as much on its interior template as on its home page.

## 8. What each panel designer delivers

All under `tmp/panel/<concept-id>/`, as standalone static files with page-relative paths:

- `index.html`: the full home page, every live section in order (`docs/SITE-ARCHITECTURE.md` section 5), with verbatim
  copy;
- `interior.html`: one long-form interior page, a library article with the site's sidebar content, a title band, prose,
  images, a CTA row and the footer;
- `styles.css` and `script.js`, with images under `img/`;
- `CONCEPT.md`: the idea in one paragraph, the token set, the depth model (planes and parallax rates), the motion and
  hover inventory, the protrusion list, the fonts and why, the generated images used (prompts, cost), known weaknesses;
- screenshots under `shots/`: 1280x585 with a real scrollbar, 1440x900 and 390x844, both the first screen and a
  viewport-step scroll series.
