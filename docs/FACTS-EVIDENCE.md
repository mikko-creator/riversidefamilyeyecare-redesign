# Practice facts: evidence map (Riverside Family Eye Care)

Stage wf1 / facts of the site-reforge redesign of https://www.riversidefamilyeyecare.com/. Inputs: the untouched crawl of 2026-10-01 (148 pages in `audit/raw/`). Outputs: `src/content/chrome.json`, `facts/client-facts.json`, `tools/write-facts.mjs` and this file. No live request was made. Every value below is read from `audit/raw/`, and anything that could not be checked on disk is marked UNVERIFIED.

## How each value was obtained

| step | command | what it establishes |
|---|---|---|
| evidence integrity | `node tools/write-facts.mjs` (check 0) | all 148 `audit/raw/*.html` files match their sha256 in `audit/site-inventory.json` |
| chrome extraction | `node tmp/wf1/facts/extract-chrome.mjs` | writes `src/content/chrome.json` by copying each value out of `audit/raw/index.html` (header, menus, footer) and `audit/raw/contact-lenses-disposable-contacts.html` (sidebar). No source value is typed. Written by hand: the prose fields `note`, `changes`, `extensions` and `authored`; the values that `authored` names (`logo.homeLabel` = brandName + " home", `mapsLinkLabel`, the composed `mapQuery`); and the `quickActions[].icon` names, mapped from the source `data-icon` into R's icon vocabulary (`sourceIcon` keeps the source value). *(Wording corrected by verify-facts.)* |
| verification + facts | `node tools/write-facts.mjs` | re-checks every chrome value on every chrome-bearing page, then writes `facts/client-facts.json`. Any difference means exit 1 and nothing is written |
| positive control | `node tmp/wf1/facts/positive-control.mjs` | a planted wrong phone digit makes write-facts exit 1 and write nothing; the same override flags with unmodified copies exit 0 |
| this file | `node tmp/wf1/facts/evidence-lines.mjs` | fills the tables from the two JSON files. "first occurrence" is the line of the value's needle in the named raw file, searched from the region marker (header / main / sidebar / footer). Many raw lines are very long, so the selector is the precise pointer. The last column counts the 148 raw files whose whitespace-normalised HTML contains the needle in any of its entity spellings; each row's needle (a markup string, e.g. `<strong>Riverside Family Eye Care</strong>`) is defined in that script. It counts markup, not regions, so template pages and other modules can raise it above the region counts; the per-page, per-region check is write-facts |
| surveys | `tmp/wf1/facts/survey-nap.mjs`, `survey-jsonld.mjs`, `survey-team.mjs`, `survey-ctas.mjs`, `survey-address.mjs`, `brand-variants.mjs`, `corpus-coverage.mjs`, `schema-diff.mjs` | the site-wide distinct values and counts quoted in the notes; their JSON outputs are saved next to them |

**write-facts, re-run while this file was generated** (output to `tmp/wf1/facts/control/out-evidence-check.json`): exit 0.

> client-facts written: tmp/wf1/facts/control/out-evidence-check.json | chrome verified on 142 header/footer pages + 132 sidebar pages (131 with the location widget) | hours widgets 131 sidebar + 2 main | tel: links 566 | map embeds 133 | testimonials 8 on 4 pages | people 11 | insurance 16+6 | social 4

That output is byte-identical to `facts/client-facts.json`.

sha256 when this file was generated: `src/content/chrome.json` 760cea4c83136a07..., `facts/client-facts.json` b7a15c4f9fcdcd68..., `tools/write-facts.mjs` 2fd9362a15d2af05...

sha256 after the verify-facts corrections (see "Verification record"): `src/content/chrome.json` 760cea4c83136a07... (unchanged), `facts/client-facts.json` 98d2032b94d208c5..., `tools/write-facts.mjs` aec9d66414aae4a4.... The re-run of the corrected `tools/write-facts.mjs` (output `tmp/wf1/verify-facts/runs/out-final.json`) printed the same counts as above (exit 0), and its output is byte-identical to `facts/client-facts.json`. This file was edited in place after `tmp/wf1/facts/evidence-lines.mjs` generated it: re-running that script would drop the corrections and the verification record.

sha256 now (the current values; updated in the content-pipeline fix round 1, 2026-10-01): `src/content/chrome.json` d1f096daeb16cf18..., `facts/client-facts.json` a6451ee4757906c8..., `tools/write-facts.mjs` d6b97dd1dde01a3e.... The content-pipeline port reworded documentation strings to say "R" instead of naming the reference practice (`docs/BUILD-NOTES.md` section 7); no value changed:
- `src/content/chrome.json`: a leaf diff against the 760cea4c... copy kept as `tmp/chrome.json.before-reword` finds 8 of 187 leaves changed, all documentation fields (`schemaBase`, `authored[0-2].why`, `changes[0-1].what`, `extensions[1]`, `extensions[11]`). The other 179 leaves, every value field among them, are identical.
- `facts/client-facts.json`: a leaf diff against the 98d2032b... copy kept as `tmp/client-facts.before-note.json` finds 1 of 274 leaves changed, `note`.
- `tools/write-facts.mjs`: two comment/note strings were reworded, as the port reports. No copy of the aec9d664... file survives, so that diff is UNVERIFIED. Its behaviour is checked: `node tools/write-facts.mjs --out <scratch file>` exits 0 ("chrome verified on 142 header/footer pages + 132 sidebar pages (131 with the location widget)", the counts quoted above), and its output is byte-identical to `facts/client-facts.json`.

**Positive control** (`tmp/wf1/facts/positive-control.mjs`, results in `tmp/wf1/facts/positive-control.json`, run 2026-10-01T03:59:42Z; the inputs are in `tmp/wf1/facts/control/`):

| run | input | exit | output written | as required |
|---|---|---|---|---|
| chrome-unmodified | unmodified copy of chrome.json via `--chrome` | 0 | yes | yes |
| chrome-wrong-phone | chrome.json copy with every 239-500-2020 changed to 239-500-2021 (consistent, so only the raw comparison can catch it) | 1 | no | yes |
| raw-unmodified | unmodified copy of audit/raw via `--raw` | 0 | yes | yes |
| raw-wrong-phone | audit/raw copy whose index.html footer NAP phone (link + text) says 239-500-2021 | 1 | no | yes |

The failure messages name the planted value: `chromeWrongPhoneNamesPhone` yes, `rawWrongPhoneNamesHash` yes, `rawWrongPhoneNamesNap` yes, `factsUntouched` yes. The raw-dir control fails on the content checks (footer NAP, `tel:` link) as well as the sha256 check, so the value checks fire on their own. `facts/client-facts.json` was byte-identical before and after the control runs.

## 1. Practice identity and NAP

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Riverside Family Eye Care | `index.html:746` | footer div.ecp-footer-address strong | 144 |
| Riverside Family Eye Care (JSON-LD name) | `index.html:676` | head script[type="application/ld+json"] LocalBusiness.name | 148 |
| Riverside Family Eye Care (location post h1) | `location-riverside-family-eyecare.html:2023` | main h1.ecp-entry-title | 1 |
| 239-500-2020 (top bar, printed "tel: ") | `index.html:733` | header a.ecp-button (top bar) | 143 |
| 239-500-2020 (mobile header) | `index.html:733` | header a.ecp-mobile-header__button_call | 143 |
| 239-500-2020 (footer NAP) | `index.html:746` | footer div.ecp-footer-address a[href^="tel:"] | 144 |
| 239-500-2020 (JSON-LD) | `index.html:676` | head ld+json telephone | 148 |
| 239-500-2020 (sidebar) | `contact-lenses-disposable-contacts.html:2126` | aside li.ecp-post-contactdetails-contacttype-Phone a | 148 |
| 239-500-2030 (fax) | `contact-lenses-disposable-contacts.html:2134` | aside li.ecp-post-contactdetails-contacttype-Fax span.ecp-post-data | 133 |
| info@riversidefamilyeyecare.com | `contact-lenses-disposable-contacts.html:2140` | aside li.ecp-post-contactdetails-contacttype-Email a | 133 |
| (Do not send personal health information by email.) | `contact-lenses-disposable-contacts.html:2142` | aside span.ecp-post-contactdetails-email-warningmessage | 133 |
| optician@riversidefamilyeyecare.com | `website-accessibility-policy.html:638` | main a[href^="mailto:"] ("Email us at:") | 1 |
| 11841 Palm Beach Blvd, Unit 117 / Fort Myers, FL 33905 (sidebar) | `contact-lenses-disposable-contacts.html:2118` | aside div.ecp-post-address (2 lines split by <br>) | 133 |
| 11841 Palm Beach Blvd, Unit 117 (JSON-LD) | `index.html:676` | head ld+json PostalAddress.streetAddress | 148 |
| ZIP 33905 (JSON-LD) | `index.html:676` | head ld+json PostalAddress.postalCode | 148 |
| Riverside Family Eye Care - Located at 11841 Palm Beach Blvd, Unit 117, Fort Myers, FL 33… | `index.html:746` | footer div.ecp-footer-address span.ecp-auto_LRS | 143 |
| Write to us at: (no ZIP) | `website-accessibility-policy.html:638` | main (accessibility contact block) | 1 |
| Located at the intersection of Palm Beach Blvd and 31, in the Verandah Publix Plaza | `index.html:733` | header div.ecp-richtext a[href="/hours-location/"] | 144 |
| place_id ChIJM8_tjQZv24gRxjCaxQqyGLU (sidebar map) | `contact-lenses-disposable-contacts.html:2208` | aside div.ecp-post-map iframe (keyed maps/embed/v1/place) | 133 |
| place_id (hours page map) | `hours-location.html:638` | main div.ecp-post-map iframe | 133 |

- **Name.** The visible name is "Riverside Family Eye Care": the footer NAP (142 pages), the sidebar location title (131), the location post h1 and every JSON-LD `name`. "Riverside Family Eyecare", the domain's spelling, shows in visible text on only 4 pages (the link text on `insurance.html` and the Degler, Erica and Longa bios). It also appears in the mobile-logo alt on 142 pages (143 files counting `template-header-3.html`), and in the `<title>` of /location/riverside-family-eyecare/ ("Riverside Family Eyecare \| Optometrist in Fort Myers, FL"; added by verify-facts). "Riverside Optical" appears once, inside a review (home and /eyeglasses/designer-frames/). Counts come from `brand-variants.mjs` (re-counted by `tmp/wf1/verify-facts/brand-variants.mjs`).
- **Address.** There is one form everywhere: street "11841 Palm Beach Blvd", unit "Unit 117" (visible text of 144 files: the 142 footers plus 2 footer templates), ZIP 33905 (visible text of the same 144 files). Counting markup, the head JSON-LD repeats the same street, unit and ZIP on all 148 files (clarified by verify-facts, `tmp/wf1/verify-facts/address-survey.mjs`). No "Suite" form and no other ZIP appear anywhere (`survey-address.mjs`). The only variant is the "Write to us at:" block on /website-accessibility-policy/, which omits the ZIP.
- **Location descriptor.** The top bar of every chrome page prints a line giving the intersection and the Publix plaza, linked to /hours-location/.
- **Phone.** 239-500-2020 is the only phone. All 566 `tel:` links on non-template pages resolve to it: 142 are the top-bar button, printed `tel: 239-500-2020` with a space, and 424 are `tel:239-500-2020`.
- **Fax and email.** The fax, 239-500-2030, is text only (no link). The email info@riversidefamilyeyecare.com is in the location widget with a warning not to send health information. Both are printed on 133 pages: the 131 sidebar widgets and the `<main>` location widgets of /hours-location/ and /location/riverside-family-eyecare/. /contact-us/ also prints a location widget in `<main>` (title, Phone, Fax and Email; no address, hours or map) besides its sidebar one (added by verify-facts). optician@riversidefamilyeyecare.com appears only on /website-accessibility-policy/.
- **Legal name.** No legal-entity name of the practice (LLC, PLLC, Inc., P.A., P.C.) appears on any page. The only entity suffixes in visible text are third-party names: "Johnson & Johnson Vision Care, Inc." (/eye-care-services/eye-exams/pediatric-eye-exams/infantsee/) and "Transitions® Lenses Optical, Inc." (/eyeglasses/). *(Corrected by verify-facts: the earlier wording said no such suffix appears on any page; write-facts now checks both facts and fails closed.)*
- **Excluded.** The 6 `/template/*` pages (WordPress global-template posts) carry placeholder data, such as a "Call Now!" button labelled 555-555-5555 and an empty `tel:`. They are not facts and are excluded from every count above.

## 2. Hours

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Monday: 9:00 AM - 5:00 PM | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| Tuesday: 9:00 AM - 5:00 PM | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| Wednesday: 9:00 AM - 6:00 PM | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| Thursday: 11:00 AM - 7:00 PM | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| Friday: 8:00 AM - 12:00 PM ⏎ 1:00 PM - 4:00 PM | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| Saturday: Closed | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| Sunday: Closed | `hours-location.html:638` | main li.ecp-post-hours-item (the /hours-location/ page) | 133 |
| location post page: same 7 rows | `location-riverside-family-eyecare.html:2089` | main div.ecp-post-hours | 133 |
| Friday second range "1:00 PM - 4:00 PM" | `hours-location.html:638` | main li.ecp-post-hours-friday span.ecp-post-data (after <br>) | 133 |

- **The sources agree.** The hours widget (`li.ecp-post-hours-item`) appears 133 times: in 131 sidebars and in `<main>` of /hours-location/ and /location/riverside-family-eyecare/. Every copy is identical (write-facts check 4 fails closed on any difference).
- There is no footer hours widget, and the home page carries no hours. Outside the widget, the only clock times on the site are inside a review. The head JSON-LD has no opening hours.
- **Friday has two ranges** separated by `<br>`. chrome.json stores them as `"8:00 AM - 12:00 PM\n1:00 PM - 4:00 PM"`, where the `\n` is that `<br>`.

## 3. Header: top bar, logos, mobile header

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Skip to main content | `index.html:733` | body > a.ecp-skip-to-content (before the header) | 148 |
| Request Appointment → /contact-us/appointment-request-form/ | `index.html:733` | header top bar a.ecp-button (fl-visible-desktop/large/medium: hidden on mobile) | 145 |
| 239-500-2020 → tel: 239-500-2020 | `index.html:733` | header top bar a.ecp-button (hidden on mobile) | 143 |
| desktop logo Riverside-Family-Eye-Care-Logo-01 / alt "Riverside Family Eye Care logo" | `index.html:733` | header div.ecp-logo a[href="/"] img | 146 |
| mobile logo Riverside-Family-Eye-Care-Logo.png / alt "Riverside Family Eyecare Logo" | `index.html:733` | header div.ecp-mobile-header__logo img (988x400) | 143 |
| Make an appointment → /contact-us/appointment-request-form/ (target=_blank) | `index.html:733` | header a.ecp-mobile-header__button_appointment | 143 |
| Call → tel:239-500-2020 | `index.html:733` | header a.ecp-mobile-header__button_call | 143 |
| Toggle mobile menu | `index.html:733` | header a.ecp-menu-hamburger-trigger-button | 146 |
| Open Menu | `index.html:733` | header .ecp-menu-hamburger-trigger-open svg title | 146 |
| Close Menu | `index.html:733` | header a.ecp-menu-hamburger-trigger-close svg title | 146 |
| Return to top of menu (removed, C02) | `index.html:733` | header nav.ecp-menu-hamburger-content a.ecp-menu-mobile-focus-trap | 148 |
| hamburger menu = same tree (copy 2 of 4) | `index.html:733` | header nav.ecp-menu-hamburger-content (desktop header, converts at tablet) | 146 |
| mobile header menu (copies 3-4 of 4) | `index.html:733` | header div.ecp-mobile-header__menu nav.ecp-menu + hamburger | 148 |

**Visibility.** This comes from the Beaver Builder row/module classes and is confirmed by `tmp/live/home-1440-s0.png` and `tmp/wf1/facts/home-390-top.png` (an ffmpeg crop of `tmp/live/home-390.png`):
- The top-bar row shows at every width.
- Its two buttons, and the logo + menu row, are `fl-visible-desktop fl-visible-large fl-visible-medium`, so they are hidden on phones.
- The mobile header row is `fl-visible-mobile sticky-header`: logo, calendar icon, phone icon and hamburger.

## 4. Primary menu (all levels) and the mobile menu

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Hours & Location → /hours-location/ | `index.html:733` | header nav.ecp-menu (menu 2) > ul > li > a | 145 |
| Meet Our Team → /our-eye-doctors/ | `index.html:733` | header nav.ecp-menu (menu 2) > ul > li > a | 145 |
|  └ Our Eye Doctors → /our-eye-doctors/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
|  └ The Staff → /the-staff/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
| Eye Care Services → /eye-care-services/ | `index.html:733` | header nav.ecp-menu (menu 2) > ul > li > a | 145 |
|  └ Comprehensive Eye Exams → /eye-care-services/eye-exams/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
|  └ Pediatric Eye Care → /eye-care-services/eye-exams/pediatric-eye-exams/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
|  └ Dry Eye Treatment → /eye-care-services/dry-eye-disease-and-treatment/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
|  └ Myopia Management → /eye-care-services/nearsighted-myopia/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
|  └ Emergency Eye Care → /eye-care-services/eye-emergencies-pink-red-eyes/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
|  └ Lasik → /eye-care-services/lasik-refractive-surgery-co-management/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |
| Eyeglasses → /eyeglasses/ | `index.html:733` | header nav.ecp-menu (menu 2) > ul > li > a | 145 |
| Contact Lenses → /contact-lenses/ | `index.html:733` | header nav.ecp-menu (menu 2) > ul > li > a | 145 |
| Insurance → /insurance/ | `index.html:733` | header nav.ecp-menu (menu 2) > ul > li > a | 145 |
|  └ Cherry Payment Plan → /cherry-payment-plan/ | `index.html:733` | header nav.ecp-menu (menu 2) ul.sub-menu li a | 145 |

- The menu has 6 top items, 9 children and no third level. "Meet Our Team" (a custom link) and its first child "Our Eye Doctors" both point to /our-eye-doctors/.
- **Four copies per page.** Every chrome page prints the tree 4 times:
  - the desktop `nav.ecp-menu`;
  - its hamburger copy (the desktop header converts at tablet width);
  - the mobile header's `nav.ecp-menu`;
  - the mobile header's hamburger copy.
- write-facts compares all 4 copies on all 142 pages against `chrome.json` `nav`, including labels, hrefs and sub-menus, and they are identical. The mobile menu is therefore the same tree; chrome.json records it as `mobileHeader.menu = "nav"`.
- The source prints menu hrefs as absolute `https://www.riversidefamilyeyecare.com/...` URLs. chrome.json stores own-origin paths, which is R's convention.

## 5. Footer

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Home → / | `index.html:746` | footer nav.ecp-menu (menu 3) li a | 144 |
| Contact Us → /contact-us/ | `index.html:746` | footer nav.ecp-menu (menu 3) li a | 143 |
| What’s New → /whats-new/ | `index.html:746` | footer nav.ecp-menu (menu 3) li a | 143 |
| Disclaimer → /disclaimer/ | `index.html:746` | footer nav.ecp-menu (menu 3) li a | 144 |
| facebook: https://www.facebook.com/RiversideFamilyEyeCareFortMyers/ (rel nofollow noopene… | `index.html:746` | footer div.ecp-iconset a.ecp-icon.ecp-network-facebook | 144 |
| yelp: https://www.yelp.com/biz/riverside-family-eye-care-fort-myers?osq=riverside+family+… | `index.html:746` | footer div.ecp-iconset a.ecp-icon.ecp-network-yelp | 144 |
| google: https://maps.app.goo.gl/FxcqgwsKhM8qZqoFA (rel nofollow noopener) | `index.html:746` | footer div.ecp-iconset a.ecp-icon.ecp-network-google | 144 |
| youtube: https://www.youtube.com/@RiversideFamilyEyecare (rel noopener) | `index.html:746` | footer div.ecp-iconset a.ecp-icon.ecp-network-youtube | 144 |
| Request Appointment → /contact-us/appointment-request-form/ | `index.html:746` | footer a.ecp-button | 144 |
| Speak Field voice search (removed, C02) | `index.html:746` | footer form.ecp-voice-search | 144 |
| © 2026 Powered by (EyeCarePro removed, C02) | `index.html:746` | footer a.ecp-powered-by | 142 |
| Accessibility → /website-accessibility-policy/ | `index.html:746` | footer div.ecp-global-footer__end li a | 142 |
| Sitemap → /sitemap/ | `index.html:746` | footer div.ecp-global-footer__end li a | 142 |
| Privacy → /privacy-policy/ | `index.html:746` | footer div.ecp-global-footer__end li a | 142 |
| Disclaimer → /disclaimer/ | `index.html:746` | footer div.ecp-global-footer__end li a | 142 |
| Login (removed, C02) | `index.html:746` | footer a#ecp-footer-login-link | 142 |

- **Menu.** There is one footer menu (WordPress menu 3) and it has no heading. Clifton had two titled columns.
- **Social links.** facebook, yelp and google carry `rel="nofollow noopener"`; youtube carries `rel="noopener"`. The google icon links to a `maps.app.goo.gl` short link. Where it resolves is UNVERIFIED, because checking needs a live request.
- **Sitemap.** /sitemap/ is a crawled page (`audit/raw/sitemap.html`), so Clifton's sitemap fix (L10) does not apply.

## 6. Sidebar (`div.ecp-secondary`)

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| search widget (removed, C02) | `contact-lenses-disposable-contacts.html:2071` | aside div.widget_search form.ecp-search | 148 |
| Request An Appointment → /contact-us/appointment-request-form/ (fa-calendar-check-o) | `contact-lenses-disposable-contacts.html:2082` | aside div.ecp-badges a.ecp-badge | 139 |
| Email Us → /contact-us/contact-form/ (fa-envelope-o) | `contact-lenses-disposable-contacts.html:2089` | aside div.ecp-badges a.ecp-badge | 139 |
| social icon set (same 4 as the footer) | `contact-lenses-disposable-contacts.html:2100` | aside div.ecp-iconset a.ecp-icon | 148 |
| Riverside Family Eye Care → /location/riverside-family-eyecare/ | `contact-lenses-disposable-contacts.html:2114` | aside div.ecp-posttype-location div.ecp-post-title a | 132 |
| Phone: / Fax: / Email: | `contact-lenses-disposable-contacts.html:2123` | aside li.ecp-post-contactdetails-contacttype-* strong.ecp-post-label | 133 |
| Monday: 9:00 AM - 5:00 PM | `contact-lenses-disposable-contacts.html:2152` | aside li.ecp-post-hours-item.ecp-post-hours-monday | 133 |
| Tuesday: 9:00 AM - 5:00 PM | `contact-lenses-disposable-contacts.html:2159` | aside li.ecp-post-hours-item.ecp-post-hours-tuesday | 133 |
| Wednesday: 9:00 AM - 6:00 PM | `contact-lenses-disposable-contacts.html:2166` | aside li.ecp-post-hours-item.ecp-post-hours-wednesday | 133 |
| Thursday: 11:00 AM - 7:00 PM | `contact-lenses-disposable-contacts.html:2173` | aside li.ecp-post-hours-item.ecp-post-hours-thursday | 133 |
| Friday: 8:00 AM - 12:00 PM ⏎ 1:00 PM - 4:00 PM | `contact-lenses-disposable-contacts.html:2180` | aside li.ecp-post-hours-item.ecp-post-hours-friday | 133 |
| Saturday: Closed | `contact-lenses-disposable-contacts.html:2187` | aside li.ecp-post-hours-item.ecp-post-hours-saturday | 133 |
| Sunday: Closed | `contact-lenses-disposable-contacts.html:2194` | aside li.ecp-post-hours-item.ecp-post-hours-sunday | 133 |

132 pages carry the sidebar, and 131 of them include the location widget. /location/riverside-family-eyecare/ omits the widget because it prints the location post in `<main>`; write-facts checks that page for the complete post instead. There is no insurance text widget, which Clifton had.

## 7. JSON-LD in the source head

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| WebPage | `index.html:18` | script[type="application/ld+json"] | 148 |
| LocalBusiness | `index.html:676` | script[type="application/ld+json"] | 148 |
| MedicalBusiness | `index.html:678` | script[type="application/ld+json"] | 148 |
| Optician | `index.html:680` | script[type="application/ld+json"] | 148 |
| MedicalSpecialty :: Optometric | `index.html:682` | script[type="application/ld+json"] | 148 |
| Organization | `index.html:684` | script[type="application/ld+json"] | 148 |
| BreadcrumbList | `index.html:749` | script[type="application/ld+json"] | 148 |

- **Business nodes.** Five nodes are identical on all 148 pages: LocalBusiness, MedicalBusiness, Optician, "MedicalSpecialty :: Optometric" (not a valid schema.org type) and Organization.
  - The first four share the same name, telephone, PostalAddress, logo and description; the description is in the head script of any page.
  - None has `geo` or opening hours.
- **Other node types:**
  - WebPage varies per page.
  - BreadcrumbList is one static 5-item list repeated on all 148 pages, not a per-page trail. Three of its items are crawled pages. Item 4 (`/eye-care-services/management-of-ocular-diseases/cataract-surgery-co-management/`) is a crawl alias that the live site redirects to the visual-hygiene blog post. Item 5 (`/eye-care-services/your-eye-health/eye-conditions-info/nearsighted-myopia/`) is not in the crawl record; its status is UNVERIFIED.
  - BlogPosting appears on the posts, FAQPage on 2 pages, and 3 VideoObject blocks do not parse (`survey-jsonld.mjs`).

## 8. Map embed

- **The embed.** It is a keyed Google Maps Embed API v1 `place` iframe, `q=place_id:ChIJM8_tjQZv24gRxjCaxQqyGLU`, on 133 pages: the sidebar (200px), /hours-location/ (427px) and the location page (300px). The source's API key is not carried into any output.
- **No coordinates** exist anywhere in `audit/raw`: no `geo`, latitude or longitude.
- **Same listing as the reviews.** The place_id is a protobuf that decodes to the feature id `0x88db6f068dedcf33:0xb518b20ac59a30c6`. That is exactly the `#lrd=` id in both Google-reviews links, so the map and the reviews point at one Google listing (write-facts check 10).
- **mapQuery.** chrome.json `mapQuery` is composed from the verified NAP, following the Clifton precedent that the keyless `maps?q=` endpoint cannot resolve a place_id. Whether the keyless query lands on this listing is UNVERIFIED and needs a browser check.

## 9. Doctors and staff

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Dr. Brittany Degler, O.D. → /team/dr-brittany-degler-od/ | `our-eye-doctors.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Doctors"] .ecp-post-title a | 2 |
| Dr. Brittany Degler, O.D. (team page h1) | `team-dr-brittany-degler-od.html:638` | main h1 | 1 |
| Dr. Kristin Nelson, O.D., IACMM → /team/dr-kristin-nelson-od/ | `our-eye-doctors.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Doctors"] .ecp-post-title a | 2 |
| Dr. Kristin Nelson, O.D., IACMM (team page h1) | `team-dr-kristin-nelson-od.html:638` | main h1 | 1 |
| Dr. Maivys Longa, O.D. → /team/maivys-longa/ | `our-eye-doctors.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Doctors"] .ecp-post-title a | 1 |
| Dr. Maivys Longa, O.D. (team page h1) | `team-maivys-longa.html:638` | main h1 | 1 |
| Heather — Office Manager, Optician → /team/heather/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Office Manager, Optician (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Erica — Office Administrator → /team/erica-eis/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Office Administrator (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Nancy — Lead Optometric Technician → /team/nancy/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Lead Optometric Technician (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Rose — Optometric Technician → /team/rose-johnson/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Optometric Technician (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Asma — Lab Technician → /team/asma-sahees/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Lab Technician (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Xaiene — Remote Medical Scribe → /team/xaiene-dos-santos-da-costa/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Remote Medical Scribe (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Kristina — Optician & Front Desk → /team/kristina/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Optician & Front Desk (position) | `the-staff.html:638` | main div.ecp-post-position | 2 |
| Jhonae — Optical Technician → /team/jhonae-anglin/ | `the-staff.html:638` | main div.ecp-post.ecp-posttype-team[data-categories="Our Staff"] .ecp-post-title a | 1 |
| Optical Technician (position) | `the-staff.html:638` | main div.ecp-post-position | 1 |
| home: Dr. Brittany Degler card | `index.html:733` | main div.ecp-posts-wrapper-team (2 cards; Dr. Longa is not on the home) | 2 |
| home: Dr. Kristin Nelson card | `index.html:733` | main div.ecp-posts-wrapper-team | 3 |

- **Doctors.** /our-eye-doctors/ (category "Our Doctors") lists Dr. Brittany Degler, O.D.; Dr. Kristin Nelson, O.D., IACMM; and Dr. Maivys Longa, O.D. Each name is the h1 of its /team/ page and the alt of its photo. `credentials` is the printed post-nominal part of the name.
- **Bio facts** declared in `client-facts.json`, each matched verbatim on the team page:
  - Degler is "Founder of Riverside Family Eyecare".
  - Nelson is IACMM certified and was inducted into the Gold Key International Optometric Honor Society.
  - Longa lists LipiFlow and MiSight, and runs her own practice, Longa Family Eyecare.
- The home page features only Degler and Nelson.
- **Staff.** /the-staff/ (category "Our Staff") lists 8 people. The cards and the team-page h1s give first names only, and each card prints a position.
- **Surnames** exist only inside the bios: Erica Eis, Nancy Bardin, Rose Johnson, Asma Saheed, Xaiene dos Santos da Costa and Kristina Riddle. Heather and Jhonae have none. The slug `asma-sahees` does not match the bio's "Saheed", and the slug `jhonae-anglin` implies a surname the page never prints.

## 10. Insurance carriers

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| h2 "Vision Plans We Accept" | `insurance.html:2233` | main h2 | 1 |
| Aetna | `insurance.html:2245` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| AlwaysCare | `insurance.html:2248` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Avesis | `insurance.html:2251` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Care Credit | `insurance.html:2254` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Eye Med | `insurance.html:2257` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| FEP Blue Vision | `insurance.html:2260` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Guardian | `insurance.html:2263` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Humana | `insurance.html:2266` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Humana Medicare | `insurance.html:2269` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| National Vision Administration (NVA) | `insurance.html:2272` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Premier Eye Care | `insurance.html:2275` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Spectera | `insurance.html:2278` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Unum Vision | `insurance.html:2281` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| VBA | `insurance.html:2284` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| VSP | `insurance.html:2287` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| Well Care Health Plans | `insurance.html:2290` | main div.insurance_logo_items (1st) li img[alt] | 1 |
| h2 "Medical Plans We Accept" | `insurance.html:2362` | main h2 | 1 |
| Aetna | `insurance.html:2376` | main div.insurance_logo_items (2nd) li img[alt] | 1 |
| Care Credit | `insurance.html:2379` | main div.insurance_logo_items (2nd) li img[alt] | 1 |
| Cigna | `insurance.html:2382` | main div.insurance_logo_items (2nd) li img[alt] | 1 |
| Medicare | `insurance.html:2385` | main div.insurance_logo_items (2nd) li img[alt] | 1 |
| Railroad Medicare Beneficiaries | `insurance.html:2388` | main div.insurance_logo_items (2nd) li img[alt] | 1 |
| Tricare | `insurance.html:2391` | main div.insurance_logo_items (2nd) li img[alt] | 1 |

- **Plans.** /insurance/ shows 16 vision plans and 6 medical plans as logos.
  - On /insurance/ the plan names exist only as alt text. Of the 20 distinct names, 18 are absent from the extractor's text capture (`audit/content-inventory.json`), for example Aetna, Spectera and Tricare. "VSP" (/eye-care-services/eye-exams/pediatric-eye-exams/) and "Medicare" (home, /insurance/faqs-of-vision-insurance-plans/, /privacy-policy/) occur in other pages' text. `client-facts.json` declares all 22 entries for that reason. *(Corrected by verify-facts: the earlier wording implied none of the names is in the capture; `tmp/wf1/verify-facts/check-facts.mjs`.)*
  - Aetna and Care Credit appear in both lists, and all 20 distinct logo files are on disk (`logoFile` in client-facts).
- **Care Credit** is a patient-financing card, but the source lists it among the plans.
- The page tells patients to call if their plan is not listed.

## 11. Payment options

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Cherry Payment Plan → /cherry-payment-plan/ (menu) | `index.html:733` | header nav.ecp-menu Insurance > ul.sub-menu li a | 145 |
| Cherry widget slug riverside-family-eyecare (page) | `cherry-payment-plan.html:1981` | main div.ecp-html script _hw("init", ..., [hero,calculator,howitworks,faq]) | 148 |
| Cherry floating estimator (every page) | `index.html:732` | body script _hw("init", ..., ["floatingEstimator"]) + div#floatingEstimator | 148 |
| CareCredit (h1) | `insurance-carecredit.html:2044` | main h1.ecp-entry-title | 1 |
| Apply now → http://www.carecredit.com/apply/?dtc=DS5V | `insurance-carecredit.html:2065` | main a (Apply now) | 1 |
| CareCredit plan terms (14.9% / 16.9% APR) | `insurance-carecredit.html:2061` | main ul li (Payment Plans) | 1 |

- **Cherry.** It is a menu item under Insurance.
  - /cherry-payment-plan/ is an empty shell that Cherry's script (`files.withcherry.com/widgets/widget.js`, slug `riverside-family-eyecare`) fills in the browser, with the sections hero, calculator, howitworks and faq.
  - A floating estimator is initialised on all 148 pages. Its wording ("Pay over time", "No hard credit checks • 0% APR options") exists only in the rendered capture `audit/rendered/contact-us-appointment-request-form.json` and the screenshot `tmp/live/home-1440-s5.png`, not in `audit/raw`. It is third-party copy and is **not** declared as a claim.
- **CareCredit.** /insurance/carecredit/ carries the program's terms in its own text (APRs and minimum purchases) and an "Apply now" link.

## 12. Reviews and testimonials

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Lukas R, Google 2021 (5★, testimonial post 5569) | `contact-us-testimonials.html:638` | main div.ecp-post.ecp-posttype-testimonial | 2 |
| Marshall B. (5★, 2026-09-15 23:18:33, shown "2 weeks ago") | `eyeglasses-designer-frames.html:2448` | main div.ecp-review .ecp-rating-time[data-reviewed-at] | 2 |
| Becki P. (5★, 2026-09-16 20:07:48, shown "a week ago") | `index.html:733` | main div.ecp-review .ecp-rating-time[data-reviewed-at] | 1 |
| Marshall B. (5★, 2026-09-15 23:18:33, shown "2 weeks ago") | `index.html:733` | main div.ecp-review .ecp-rating-time[data-reviewed-at] | 2 |
| Randy (5★, 2026-09-15 21:52:23, shown "2 weeks ago") | `index.html:733` | main div.ecp-review .ecp-rating-time[data-reviewed-at] | 1 |
| Kristi B. (5★, 2026-09-03 21:52:19, shown "3 weeks ago") | `index.html:733` | main div.ecp-review .ecp-rating-time[data-reviewed-at] | 1 |
| Melissa C. (5★, 2026-08-27 13:09:00, shown "a month ago") | `index.html:733` | main div.ecp-review .ecp-rating-time[data-reviewed-at] | 1 |
| Lukas R, Google 2021 (5★, testimonial post 5569) | `testimonial-this-was-a-great-experience.html:2057` | main div.ecp-post.ecp-posttype-testimonial | 2 |

- **Count.** There are 8 cards on 4 pages, which come to 6 distinct reviews. All are 5 stars, counted from `.ecp-rating-star-full`; post 5569 also carries `itemprop="ratingValue"` 5.
- **Two markups:**
  - The home carousel (5 cards) and /eyeglasses/designer-frames/ (1 card, Marshall B. again) use `div.ecp-reviews-wrapper > div.ecp-review` cards, which carry a `data-reviewed-at` timestamp and a relative time such as "a week ago".
  - /contact-us/testimonials/ and /testimonial/this-was-a-great-experience/ both show testimonial post 5569, attributed "Lukas R, Google 2021".
- /category/testimonials/ prints "Nothing Found".
- **Source platform.** The widget cards do not name their platform. A "Read Google Reviews" button sits under the carousel, and its listing id matches the map. That the cards are Google reviews is still UNVERIFIED.
- The relative times were true only at crawl time; `client-facts.json` keeps them as `shownAs` with the absolute `reviewedAt`.

## 13. CTAs and links

| value | first occurrence (audit/raw/file:line) | selector | raw pages with the needle |
|---|---|---|---|
| Read Google Reviews (#lrd=0x88db6f068dedcf33:0xb518b20ac59a30c6) | `index.html:746` | main a.ecp-button (href has a leading space) | 1 |
| More Google Reviews (#lrd=0x88db6f068dedcf33:0xb518b20ac59a30c6) | `eyeglasses-designer-frames.html:2493` | main a.ecp-button | 1 |
| Book Online → /appointment-request-form/ (an alias of /contact-us/appointment-request-for… | `index.html:733` | main div.ecp-callout h3 a.ecp-callout-title-text | 1 |
| Patient Forms → /contact-us/patient-forms/ (home callout) | `index.html:733` | main div.ecp-callout h3 a | 1 |
| HIPAA Acknowledgement (PDF) - not harvested | `contact-us-patient-forms.html:2049` | main p strong a[href$=".pdf"] (CloudFront) | 1 |
| "Online Forms" heading with nothing under it | `contact-us-patient-forms.html:2051` | main h2 | 1 |
| AlumierMD "Learn More" → alumiermd.com?code=ATwPQnFl | `index.html:733` | main div.ecp-callout a.ecp-button | 1 |
| SCHEDULE AN APPOINTMENT (in-page callouts) | `our-eye-doctors.html:638` | main div.ecp-callout a.ecp-button | 6 |

**Appointment CTAs** (`survey-ctas.mjs`, output `tmp/wf1/facts/survey-ctas.json`). Every appointment CTA on the site points to /contact-us/appointment-request-form/:
- the top-bar "Request Appointment" button (142 pages);
- the mobile header calendar icon "Make an appointment" (142 pages; it alone opens a new tab);
- the footer button (142 pages);
- the sidebar badge "Request An Appointment" (132 pages);
- the in-page buttons and links, such as "SCHEDULE AN APPOINTMENT" on 6 pages.

The one exception is the home "Book Online" callout. It points to /appointment-request-form/, a crawl alias of the same form.

**Other links:**
- "Email Us" goes to /contact-us/contact-form/ (the sidebar on 132 pages).
- /contact-us/patient-forms/ prints one PDF link, a HIPAA acknowledgement on the CloudFront CDN, followed by an "Online Forms" heading with nothing under it. The PDF is not on disk (`assets/docs/` is empty), and `audit/failures.json` does not list it either.

## 14. chrome.json against the source and against Clifton's schema

**Departures from the source markup** (`changes`; the ids are proposals for the design ledger):
- **C01:** the top-bar `tel: ` space is removed.
- **C02:** these source items are not carried into the chrome:
  - the voice search;
  - the sidebar search;
  - "Powered by" with the EyeCarePro logo;
  - the Login link;
  - the "Return to top of menu" focus traps;
  - the GTM noscript.

**Authored strings** (`authored`, not from the source):
- `logo.homeLabel` (Clifton COMPONENTS H.2 precedent);
- `mapsLinkLabel` (Clifton BUILD-DECISIONS #10 precedent);
- `mapQuery`, composed from the NAP.

**Schema** (`tmp/wf1/facts/schema-diff.mjs` against `cliftoneyecenter-reforge/src/content/chrome.json`): R has 104 key paths and this file has 124.

- **Missing here (9):** `topbar.appointment.sourceHref (string)`, `topbar.appointment.change (string)`, `sidebar.insurance.title (string)`, `sidebar.insurance.paras (array)`, `sidebar.insurance.paras[] (string)`, `sidebar.insurance.sourceNote (string)`, `notice.before (string)`, `notice.after (string)`, `notice.decision (string)`. topbar.appointment.sourceHref/change recorded Clifton's dead top-bar link (L01); Riverside's link works. `sidebar.insurance` and `notice` are null.
- **Type changed (3):** `sidebar.insurance: R object -> P null`, `footer.columns[].title: R string -> P null`, `notice: R object -> P null`.
- **Added (29):** every path is explained in chrome.json `extensions`, `authored` or `schemaBase`.
- **Method note (added by verify-facts, `tmp/wf1/verify-facts/schema-diff.mjs`):** the counts above read each array through its FIRST element only, which hides 6 paths. With every array element merged, R has 106 paths and this file 128: missing 11, type changed 3 (the same 3), added 33.
  - The 2 extra missing paths are `footer.util[].sourceHref (string)` and `footer.util[].change (string)`, which R carries on its Sitemap item (L10: /sitemap/ was a 404 on Clifton, remapped to /sitemap.xml). Riverside's /sitemap/ is a crawled page (§5), so there is no remap. R's `footer()` tests `l.href` for `.xml` and never reads these keys, so nothing breaks.
  - The 4 extra added paths are the sub-menu items, `nav[].children[] (object)` with `.label`, `.href` and `.children`, covered by the `nav[].children` entry in `extensions`.

## 15. Consumer impact: what Clifton's code would do with this chrome.json unchanged

These paths are verified by reading `cliftoneyecenter-reforge/src/lib/templates.mjs`, `seo.mjs`, `forms.mjs` and `src/build.mjs`. Each one is something the build stage must adapt.

| R consumer | what happens | needed |
|---|---|---|
| `templates.mjs:126,154` header() / drawer() `chrome.nav.map` | renders only the 6 top items; the 9 sub-items (Our Eye Doctors, The Staff, the 6 services, Cherry Payment Plan) are lost | render `nav[].children` |
| `templates.mjs:187-188` footer() `col(f.columns[1], ...)` | `columns[1]` is undefined, so it throws a TypeError | one untitled column (`title: null`) |
| `templates.mjs:177` footer social `icon('fb')` | yelp, google and youtube all draw the facebook glyph | an icon per `network` |
| `templates.mjs:184` footer NAP | prints "... FL 33905 Phone: 239-500-2020" without the source's two periods and URL | use `nap.postalEnd`, `nap.phoneEnd`, `nap.site` (oracle: `nap.text`) |
| `templates.mjs:237-238` aside() `s.insurance.paras` | `sidebar.insurance` is null, so it throws a TypeError | skip the insurance card |
| `templates.mjs:200-206` dock() | `DOCK_ICONS` and `/Schedule An Appointment/` are Clifton labels; "Request An Appointment" gets the arrow icon and is not marked primary | key the icon by `quickActions[].icon` |
| `templates.mjs:215` hours() | Friday's `\n` collapses to a space in HTML | render the two ranges on two lines |
| `seo.mjs:143,169-171` jsonLd(): line 143 filters out the Closed rows; lines 169-171 split each row on " - " and keep parts[0] and parts[1] (pointer corrected by verify-facts; it was `seo.mjs:143` alone) | Friday becomes 08:00-12:00 and the 1:00-4:00 PM range is dropped | one OpeningHoursSpecification per range |
| `forms.mjs:168` renderForm `notice.before` | `notice` is null, so it throws a TypeError | a Riverside decision on form handling first |
| `build.mjs:279` logo lookup `chrome.logo.srcPattern` | works: `Riverside-Family-Eye-Care-Logo-01` matches exactly 1 image-inventory record, which is on disk | none |
| `build.mjs:328` keyless map from `mapQuery` | works as in Clifton | browser-check that it resolves |

## 16. Open questions (decisions for the operator; nothing below was guessed)

1. **Brand spelling.** The visible name is "Riverside Family Eye Care" and chrome.json uses it. Should the 4 visible "Riverside Family Eyecare" mentions, the mobile-logo alt "Riverside Family Eyecare Logo" and the `<title>` of /location/riverside-family-eyecare/ be kept verbatim or normalised?
2. **Form notice.** `notice` is null because no Riverside decision exists. Clifton's static forms show a "not connected yet, please call" sentence (BUILD-DECISIONS #4).
3. **Cherry.** Should the rebuild embed Cherry's third-party widget, both the floating estimator and the /cherry-payment-plan/ page, or link out, or drop it? Its terms cannot be stated as static text without the client's confirmation.
4. **CareCredit terms.** The APRs and minimum purchases on /insurance/carecredit/ are the source's words and possibly stale. Confirm them with the client before restating them outside that page.
5. **Patient-forms PDF.** The PDF was never harvested. Should the rebuild link to the CDN file or ask the client for it? The "Online Forms" heading has nothing under it: keep it or drop it?
6. **Review cards.** Which platform the review-widget cards come from is UNVERIFIED, as is whether they may be shown as dated, static quotes (`reviewedAt`) instead of the live widget's relative times.
7. **Staff names.** Should cards show surnames from the bios? Note the slug/bio mismatch for Asma ("sahees" vs "Saheed") and that Jhonae and Heather have no printed surname.
8. **Source JSON-LD.** It has the invalid "MedicalSpecialty :: Optometric" type, the static BreadcrumbList with a redirected item and an uncrawled item, and no opening hours. Should the rebuild emit its own structured data from chrome.json, as Clifton did?
9. **Maps.** The keyless `mapQuery` embed and the `maps.app.goo.gl` short link both resolve to targets that are UNVERIFIED.
10. **Menu duplicate.** "Meet Our Team" and its first child "Our Eye Doctors" share /our-eye-doctors/. Keep the duplicate in the rebuilt menu?
11. **Book Online.** The home "Book Online" callout uses the alias /appointment-request-form/. Use the canonical form URL in the rebuild? This is a design-ledger change.
12. **Care Credit in the plan lists.** It is listed among insurance "plans" on /insurance/. Keep it as the source shows it?
13. **AlumierMD.** The home promotes AlumierMD with a referral-coded external link. Keep the promotion?
14. **Mobile appointment icon.** It alone opens the form in a new tab. Keep that behaviour?

## Verification record

**Stage:** verify-facts, 2026-10-01. Every claim below was re-run from `audit/raw` and the audit JSON, not reviewed as prose, and no live request was made. The scripts and their saved outputs are in `tmp/wf1/verify-facts/`; each re-runs with `node tmp/wf1/verify-facts/<script>`.

| script | what it does |
|---|---|
| `dom.mjs`, `parser-selftest.mjs` | An HTML tree parser written independently of the author's regex slicing (void, raw-text and implied end tags). Self-test: on 148/148 pages the parsed element count per tag equals a regex start-tag count, and planted `<li>` / `<p>` / `<br>` snippets parse as a browser would |
| `extract.mjs` → `extract.json` | Every chrome and fact value on all 148 pages, read by structural selector |
| `check-chrome.mjs` → `check-chrome.json` | 37 checks of `src/content/chrome.json`, each against every page that carries the region |
| `check-facts.mjs` → `check-facts.json` | 81 checks of `facts/client-facts.json` |
| `doc-rows.mjs` → `doc-rows.json` | Re-checks all 163 evidence rows of this file (cited line, page count, value on the line) |
| `controls.mjs` → `controls.json` | A positive control for every absence claim: the probe returns 0 on Riverside and fires on a planted or known Clifton case (26/26 pass) |
| `rerun-write-facts.mjs` → `rerun-write-facts.json` | Runs `tools/write-facts.mjs` twice on the real evidence plus 13 planted runs (9 bad chrome.json copies, 3 bad audit/raw copies, 1 unmodified copy of each kind) |
| `brand-variants.mjs`, `address-survey.mjs`, `cta-survey.mjs`, `schema-diff.mjs`, `source-selectors.mjs` | Site-wide counts, the schema diff by both methods, and the selectors named in `source` strings |

**Totals:** 59 claims checked: 46 CONFIRMED, 9 CORRECTED, 4 UNVERIFIABLE.

**Changed by this stage:**
- `tools/write-facts.mjs` now generates 3 strings from the evidence: `legalNameNote`, `fax[0].source` and `insurance.note`. It also adds 2 fail-closed checks: the legal-entity suffix check, and that no plan name is in the /insurance/ capture itself.
- `facts/client-facts.json` was regenerated by that tool (exit 0; only those 3 fields differ).
- `src/content/chrome.json` is unchanged: every value was confirmed.
- This file was edited in place; the corrections are marked "verify-facts".

| # | claim | method | verdict |
|---|---|---|---|
| 1 | All 148 raw files match their crawl sha256 | `extract.mjs` against `audit/site-inventory.json` | CONFIRMED (148/148) |
| 2 | write-facts exits 0 on the real crawl; two runs are byte-identical and equal `facts/client-facts.json` | `rerun-write-facts.mjs` (final run after the corrections) | CONFIRMED |
| 3 | A chrome.json copy with 239-500-2021 makes write-facts exit 1 with 13 problems and write nothing | own plant | CONFIRMED (13 problems, no output file) |
| 4 | A planted raw value fails on the content checks, not only on sha256 | own raw plants: the fax in one sidebar (/eyeglasses/lens-treatments/uv-protection/), one hamburger sub-label (/disclaimer/), ", LLC" after the name in a post | CONFIRMED (each fires its own check besides sha256) |
| 5 | Any single wrong chrome value fails closed | 9 chrome.json plants: phone, fax, email, Friday hours, a sub-menu label, ZIP, YouTube href, an extra utility link, place_id | CONFIRMED (all exit 1, nothing written) |
| 6 | The same override flags with unmodified copies exit 0, and the control runs leave `facts/client-facts.json` untouched | sha256 before and after | CONFIRMED |
| 7 | The sha256 prefixes printed at generation | `sha256sum` | CONFIRMED (they matched the files before this stage changed two of them) |
| 8 | Header and footer on 142 pages (all but the 6 `/template/` pages); sidebar on 132; location widget on 131; the location post's page prints it in `<main>` | `check-chrome.mjs` | CONFIRMED |
| 9 | Top bar: address callout, Request Appointment, call button printed `tel: 239-500-2020` (C01) | `check-chrome.mjs` | CONFIRMED (142/142) |
| 10 | Logos: desktop and mobile src pattern + alt; mobile 988x400; the source logo link has no aria-label | `check-chrome.mjs` | CONFIRMED (142/142) |
| 11 | Mobile header: appointment (aria-label, href, `_blank`), call, 2 toggles, Open/Close Menu titles | `check-chrome.mjs` | CONFIRMED (142/142) |
| 12 | Menu: 6 top items, 9 children, no third level, 4 identical copies per page; "Meet Our Team" is a custom link | `check-chrome.mjs`; `controls.mjs` (the depth probe fires on a planted 3-level menu) | CONFIRMED (142/142) |
| 13 | Skip link text, before the header | `check-chrome.mjs` | CONFIRMED (148/148) |
| 14 | Footer: one untitled menu (2 copies, 4 links), 4 social links with their rel, button, NAP text/strong/links, © 2026, 4 utility links (Login excluded) | `check-chrome.mjs` | CONFIRMED (142/142) |
| 15 | Sidebar: badges = `quickActions`; social = `footer.social`; location title, labels, email note, address, hours, place_id; no insurance text widget | `check-chrome.mjs`; `controls.mjs` (the widget probe fires on Clifton's "Insurance Plans" sidebar) | CONFIRMED |
| 16 | Hours: 133 widgets (131 sidebars + `<main>` of /hours-location/ and the location page) all equal `chrome.hours`; Friday has two ranges; none in the footer or on the home; no other hours statement | `check-chrome.mjs`, `controls.mjs` | CONFIRMED (no conflict to flag) |
| 17 | Visibility classes of the top bar, its buttons, the logo + menu row and the mobile row | row and module classes (identical on 142 pages); crops `home-390-top.png` and `home-1440-top.png` of `tmp/live` | CONFIRMED |
| 18 | C02 items exist: voice search 142, sidebar search 132, Powered by + EyeCarePro logo 142, Login 142, focus traps 142, GTM noscript iframe 148 | `extract.mjs` + raw counts | CONFIRMED |
| 19 | "No value is typed" (how-obtained table) | read of `tmp/wf1/facts/extract-chrome.mjs` | CORRECTED (homeLabel, mapsLinkLabel, mapQuery and the icon names are hand-made) |
| 20 | Schema: R 104 / P 124 key paths, 9 missing, 3 retyped, 29 added | `schema-diff.mjs`, both methods | CORRECTED (true only when arrays are read through their first element; with all elements: 106 / 128 / 11 / 3 / 33; §14 names the 6 hidden paths) |
| 21 | R consumer pointers and their effects: `templates.mjs:126,154`, `:177`, `:184`, `:187-188`, `:200-206`, `:215`, `:237-238`; `forms.mjs:168`; `build.mjs:279` (one image record, on disk); `build.mjs:328` | read of R `src/`, `audit/image-inventory.json` | CONFIRMED |
| 22 | The `seo.mjs:143` hours-split pointer | read of R `src/lib/seo.mjs` | CORRECTED (143 filters out Closed; the split that drops 1:00-4:00 PM is at 169-171) |
| 23 | Every R key is kept; the added keys and sub-fields are the ones the `note` lists | `schema-diff.mjs` | CONFIRMED (`sourcedClaimContexts` is empty: Riverside's forms have no label like Clifton's) |
| 24 | People: 3 "Our Doctors" + 8 "Our Staff"; each name = /team/ h1 = photo alt; pages, post ids, positions, credentials, bio phrases verbatim; the home shows Degler and Nelson only | `check-facts.mjs`, `controls.mjs` | CONFIRMED |
| 25 | Surnames only in bios (6); none for Heather or Jhonae; "Sahees" and "Anglin" are slug-only | `check-facts.mjs`, `controls.mjs` (the probe finds "Eis" on Erica's page) | CONFIRMED |
| 26 | Certifications and award sentences verbatim | `check-facts.mjs`, `source-selectors.mjs` | CONFIRMED |
| 27 | Phone: 566 `tel:` links on non-template pages (142 `tel: ` + 424 `tel:`), one number | DOM anchors and raw regex, both 566 (header 284, footer 142, sidebar 131, main 9); only 239-500-2020 and -2030 are phone-shaped in visible text | CONFIRMED |
| 28 | Fax 239-500-2030, text only | `check-facts.mjs`; the `fax:` probe fires on a plant | CONFIRMED |
| 29 | Fax source: "the sidebar of 131 pages; `<main>` of /hours-location/ and the location page" | `extract.mjs` (`<main>` location widgets) | CORRECTED (/contact-us/ `<main>` prints it too; 133 pages in all; now generated) |
| 30 | Email: info@ in every location widget (133 pages) with its warning; optician@ only on /website-accessibility-policy/ | `check-facts.mjs` | CONFIRMED |
| 31 | The 4 address values (top bar 142, location widget, footer NAP 142, JSON-LD 148) and the accessibility page's line without a ZIP | `check-facts.mjs` | CONFIRMED |
| 32 | "Unit 117 (144 files), ZIP 33905 (144 files)"; no Suite form; no other ZIP | `address-survey.mjs`; the probes fire on "Suite 302" and "FL 33901" | CORRECTED (144 is the visible-text count; the head JSON-LD has both on 148) |
| 33 | No coordinates anywhere; JSON-LD has no geo and no opening hours | `controls.mjs` (fires on Clifton's footer latitude and on a planted block) | CONFIRMED |
| 34 | Map: 133 embeds, one place_id (200 / 427 / 300 px); the API key is in none of the 4 outputs | `check-facts.mjs`; the key probe fires on 133 raw pages | CONFIRMED |
| 35 | The map and both review links point at one Google listing | own protobuf decoder of the place_id | CONFIRMED (0x88db6f068dedcf33:0xb518b20ac59a30c6) |
| 36 | Insurance: 16 + 6 logos, names, logo URLs, 20 logo files on disk, Aetna and Care Credit in both lists, the call line | `check-facts.mjs` | CONFIRMED |
| 37 | `insurance.note`: "the extractor text capture lacks them" | `check-facts.mjs` (content-inventory corpus) | CORRECTED (18 of 20 names absent; VSP and Medicare occur on other pages) |
| 38 | Cherry: menu item, slug + 4 sections, floating estimator on 148 pages; its wording only in `audit/rendered` and the s5 screenshot | `check-facts.mjs`, `controls.mjs`; `tmp/live/home-1440-s5.png` viewed | CONFIRMED |
| 39 | CareCredit: h1, Apply now URL, 14.9% / 16.9% APR text; the page calls it a card | `check-facts.mjs`, `source-selectors.mjs` | CONFIRMED |
| 40 | Review links: labels, raw href (leading space on the home one), trimmed href | `check-facts.mjs` | CONFIRMED |
| 41 | Testimonials: 8 cards on 4 pages, 6 distinct, all 5 stars, every field; /category/testimonials/ "Nothing Found"; one /testimonial/ page | `check-facts.mjs` | CONFIRMED |
| 42 | `socialProfiles` = the footer social links | `check-facts.mjs` | CONFIRMED |
| 43 | `legalNameNote`: no LLC/PLLC/Inc./P.A./P.C. on any page | suffix probe over every page's visible text | CORRECTED ("Inc." appears twice, in third-party names; now a fail-closed check, which fired on a planted ", LLC") |
| 44 | JSON-LD: 5 business nodes on 148 pages; 4 identical NAP nodes; one Organization; WebPage per page (132 distinct); static 5-item BreadcrumbList; FAQPage on 2; BlogPosting on 19; 3 unparseable VideoObject blocks | `check-facts.mjs` | CONFIRMED |
| 45 | Breadcrumb item 4 is a crawl alias of the visual-hygiene post; item 5 is not in the crawl record | `site-inventory.json` `aliases` (sr-crawl.mjs: "redirect URL(s) folded into the page they land on") | CONFIRMED |
| 46 | 163 evidence rows: each file:line is the first occurrence of the row's needle after its region marker, each page count, and the value on the cited line; 86 value cells match the JSON | `doc-rows.mjs` | CONFIRMED (163/163) |
| 47 | "Eyecare" in visible text on 4 pages; mobile-logo alt on 142; "Riverside Optical" in one review on 2 pages | `brand-variants.mjs` | CONFIRMED |
| 48 | Completeness of the brand-spelling list | `brand-variants.mjs` | CORRECTED (the location page `<title>` also says "Eyecare"; added to §1 and open question 1) |
| 49 | Every appointment CTA targets the form (top bar 142, mobile 142, footer 142, sidebar 132, in-page incl. SCHEDULE AN APPOINTMENT on 6); only the mobile icon opens a new tab; Book Online uses the alias; Email Us on 132 sidebars | `cta-survey.mjs` | CONFIRMED |
| 50 | Patient forms: one HIPAA PDF link and an empty "Online Forms" heading; the PDF is not on disk or in `failures.json` | `cta-survey.mjs`, `controls.mjs` | CONFIRMED |
| 51 | `/template/` placeholders ("Call Now!" labelled 555-555-5555, an empty `tel:`) are excluded from the counts | `check-facts.mjs` | CONFIRMED |
| 52 | /sitemap/ is a crawled page | `site-inventory.json` | CONFIRMED |
| 53 | The home AlumierMD "Learn More" referral link | `cta-survey.mjs` | CONFIRMED |
| 54 | The author's note that `write-architecture.mjs` no longer reads chrome.json | grep of `tools/` and `src/`: only write-facts reads it; `sentence-parity.mjs` derives chrome text from raw | CONFIRMED |
| 55 | The author's relayed note that the home computed-style captures are a Chrome error page (not in an output) | `url` of `tmp/capture/baseline/index.*.json` | CORRECTED here only: stale. All 6 home captures record the home URL, and no `C-Program-Files-Git.*.json` remain |
| 56 | Where the `maps.app.goo.gl` short link resolves | needs a live request | UNVERIFIABLE |
| 57 | Whether the keyless `mapQuery` embed lands on this listing | needs a browser | UNVERIFIABLE |
| 58 | The live status of breadcrumb item 5 | not in the crawl record | UNVERIFIABLE |
| 59 | Which platform the review-widget cards come from | the cards print none | UNVERIFIABLE |

**Open for the orchestrator:**
- This file now differs from what `tmp/wf1/facts/evidence-lines.mjs` generates; that script and its template are outside this stage's write scope. Re-running the script would remove the corrections and this record, so carry the changes into the template first.
- The author's needle definitions for the evidence-table counts exist only in that script.
