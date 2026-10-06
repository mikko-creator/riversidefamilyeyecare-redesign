# Riverside Family Eye Care: "Riverlight" redesign

A complete visual redesign of <https://www.riversidefamilyeyecare.com/>, the website of Riverside Family Eye Care in
Fort Myers, Florida. The live site runs on the EyeCarePro platform (WordPress with Beaver Builder).

The redesign was made with the site-reforge workflow, in its REFORGE lane. It keeps:
- the site's structure and every page at its live URL;
- every word of copy;
- the practice's real photographs;
- the logo, the navy and teal brand colours and the practice's tone.

The design itself is new. "Riverlight Aurora" turns the logo's teal-over-navy wave into a river of light that runs
through every page. It has layered depth, images that break out of their frames and across section edges,
scroll-driven motion and hover effects. All of the motion respects `prefers-reduced-motion`.

- **Preview:** <https://mikko-creator.github.io/riversidefamilyeyecare-redesign/>. It is a review copy: every page is
  `noindex, nofollow` and `robots.txt` disallows everything, so it never competes with the live site in search.
- **Developer README:** [`docs/README.md`](docs/README.md). It covers the structure, the build and the verification
  record, with every number read from the reports in `audit/`.
- **Design:** [`docs/DESIGN-SPEC.md`](docs/DESIGN-SPEC.md) and the markup and script contract
  [`docs/COMPONENTS.md`](docs/COMPONENTS.md).
- **Decisions still open for the practice:** [`docs/OPEN-DECISIONS.md`](docs/OPEN-DECISIONS.md). They include five staff
  portraits shown as labelled placeholders, the licence of the syndicated library articles, the form endpoint, the
  Cherry application URL and video captions.
- **Deployment:** [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Build and run

```bash
node src/build.mjs                                       # builds dist/ (Node 24; cwebp, webpmux, ffmpeg on PATH)
node tools/run-gates.mjs                                 # content, link, image, SEO and decontamination gates
node tools/serve.mjs --root dist --port 8795 --no-open   # then open http://127.0.0.1:8795/
```

## Generated imagery

Every photograph of the practice, its doctors and staff, its office and the brands it carries is the practice's own.
The redesign adds illustrative industry imagery generated with fal.ai and one ambient motion loop generated with
Higgsfield. Every generated file carries an AI label. None depicts the practice's people, patients, office or results.
The full list is in [`docs/CHANGE-LOG.md`](docs/CHANGE-LOG.md), under Imagery.

## Not in this repository

The raw crawl of the live site (`audit/raw/`) and the computed-style captures, screenshots and harvested source CSS
stay with the project files. They are not published here, because the live site's pages embed a Google Maps API key.
