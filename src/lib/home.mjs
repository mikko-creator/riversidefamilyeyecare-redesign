/* ==========================================================================================================
   home.mjs - the Riverlight Aurora home (replaces the SCAFFOLD). It composes the home model's 16 sections, in model
   (= live) order, into the 14 components of docs/COMPONENTS.md B.16 (B.4-B.18), with the home route table of the
   river (1.8; B.16) and its two weave zones. Every string is the model's; the helpers (images, buttons, the D.7
   transforms of model HTML, the plate, the banks) are templates.mjs's. The composition is structural, so it fails
   closed: a home model whose sections are not the 16 this file was written for stops the build instead of
   printing a half page.
   ========================================================================================================== */
import { esc } from './util.mjs';

/* B.16: the home route table (key, data-at) per host, in document order; 37 anchors */
/* Mobile optimisation (fixer D1, BUILD-NOTES 15.4): h1 at p enters at 58 % of the hero (was 66 %). The short-screen hero
   (M-LAYOUT-5) puts the frame's bottom at 74 % of a 383 px hero at 320x568, so from 66 % the over copy met only the
   frame's rounded lower-right corner (49 changed pixels; R3's in-front crossing on the home's first two screens); from 58 %
   it crosses the frame's right side again (1,960 pixels; 2,530 on the published build) and, with the phone strands at 0.6
   of their width (M-LOOK-13), 4,709-12,685 at 375-768 px (4,649-16,403 before). The d value is unchanged */
const ROUTE = {
  hero: [['h1', 'd:103%,64% p:104%,58%'], ['h2', 'd:CR+26,96% p:60%,92%'], ['h3', 'd:off p:-3%,104%']],
  intro: [['i1', 'd:CR-76,46% p:-3%,70%'], ['i2', 'd:52%,100%-50px p:-3%,96%']],
  services: [['s1', 'd:CL+50,242px p:-3%,161px'], ['s2', 'd:15%,57% t:6%,46% p:-3%,40%'], ['s3', 'd:50%,73% t:50%,62% p:30%,70%'], ['s4', 'd:74%,100%-148px t:86%,93% p:64%,100%-122px']],
  alumier: [['a1', 'd:CR-34,30px p:CR-30,28px'], ['a2', 'd:R,62% p:103.5%,60%']],
  callouts: [['c1', 'd:R,70% p:103.5%,60%']],
  doctor1: [['d1', 'd:86%,3% p:103.5%,20%'], ['d2', 'd:36%,32% p:103.5%,50%'], ['d3', 'd:1%,92% p:103.5%,90%']],
  doctor2: [['n1', 'd:L,60% p:103.5%,40%'], ['n2', 'd:8%,103% p:103.5%,104%']],
  lavender: [['l1', 'd:30%,-6px p:80%,-4px'], ['l2', 'd:64%,4px p:30%,2px'], ['l3', 'd:92%,8% p:-7%,10%'], ['l4', 'd:R,70% p:-7%,70%']],
  frames: [['f1', 'd:R,50% p:-7%,40%'], ['f2', 'd:98%,100% p:-7%,96%']],
  cataract: [['k1', 'd:84%,40% p:-5%,40%'], ['k2', 'd:60%,104% p:-7%,104%']],
  emergency: [['e1', 'd:30%,10% p:-7%,30%'], ['e2', 'd:L,62% p:-7%,80%']],
  reviews: [['r1', 'd:L,44% p:-5%,30%'], ['r2', 'd:14%,102% t:L,100% p:-7%,96%']],
  /* v1, v2 at d: 80 px left of the content edge (integrate stage, gap I.74). The prototype's 4% / 2% put the centre
     line 4 px from the insurance title at 1280x585 (container full width, content edge 48 px; 4% = 51 px); at 1440 they
     sat 55 px left of the edge and at 1920 276 px. CL-48 still let the spline's approach from r2 pass 37 px from the
     title at 1280x585, and CL-64 41 px once the band's reveal had lifted the title 26 px; CL-80 leaves a margin */
  insurance: [['v1', 'd:CL-80,22% t:L,24% p:-7%,30%'], ['v2', 'd:CL-80,92% t:L,90% p:-7%,90%']],
  news: [['w1', 'd:22%,46% t:4%,64% p:-7%,30%'], ['w2', 'd:76%,64% t:97%,74% p:-7%,70%'], ['w3', 'd:96%,98% p:20%,99%']],
};
/* the sections B.16 composes, by model position: kind, and what each must carry */
const SHAPE = ['hero', 'hero', 'text', 'image', 'cards', 'callout', 'cards', 'team', 'team', 'cards', 'gallery', 'text', 'text-image', 'reviews', 'cta', 'posts'];

/* sizes per home slot: the rendered width of each image at the reference layouts (COMPONENTS B.4-B.15; cover slots
   carry their cover factor k). Container 1200 px from 1296 px up; gutter clamp(16px, 4vw, 48px). */
const SIZES = {
  /* clamp(190px, 24vw, 370px); in the short-desktop mode clamp(170px, 17vw, 260px); phone min(48% of the frame, 250px) */
  glasses: '(min-width: 1024px) and (max-height: 820px) min(260px, 17vw), (min-width: 792px) min(370px, 24vw), (min-width: 769px) 190px, min(48vw, 250px)',
  promo: '(min-width: 1131px) 1040px, (min-width: 401px) 92vw, calc(100vw - 32px)',
  alumierBg: '(min-width: 1296px) 1200px, (min-width: 401px) 92vw, calc(100vw - 32px)',
  alumierLogo: '250px',
  callout: '(min-width: 1200px) 520px, (min-width: 769px) calc(50vw - 90px), calc(100vw - 80px)',
  kids: '(min-width: 1400px) 210px, (min-width: 1000px) 15vw, 150px',
  /* Mobile optimisation (M-SPEED-5): up to 768 px the photo is min(220px, 62%) of the one-column item, which is the
     container's content (100vw - 2 x the 16 px gutter where 62% stays under 220 px): 62vw - 19.84px (178.6 px at 320,
     measured 178.5); the old min(220px, 62vw) said 198 px and crossed a srcset step at 320x568 DPR 2 (427 w for 360 w).
     769-1023 px keeps its value as it was */
  trio: '(min-width: 1024px) 236px, (min-width: 769px) min(220px, 62vw), min(220px, calc(62vw - 19.84px))',
  tile: '(min-width: 1200px) 315px, (min-width: 769px) 26vw, 44vw',
  handshake: '(min-width: 1200px) 410px, (min-width: 769px) 33vw, min(420px, calc(100vw - 32px))',
  staff: '(min-width: 1305px) 500px, (min-width: 769px) 39vw, calc(78vw - 25px)',
};

export function buildHome(model, T) {
  if (!model.isHome) throw new Error('buildHome called for ' + model.path);
  const S = model.sections;
  if (S.length !== SHAPE.length || S.some((s, i) => s.kind !== SHAPE[i])) throw new Error('home.mjs: the home model no longer has the 16 sections of COMPONENTS B.16 (' + S.map((s) => s.kind).join(', ') + ')');
  const ctx = T.context(model);
  const art = (model.art && model.art.home) || {};
  const route = (k) => ROUTE[k].map(([key, at]) => T.ra(key, at)).join('');
  const block = (s, type, n = 0) => { const b = s.blocks.filter((x) => x.type === type)[n]; if (!b) throw new Error('home.mjs: ' + s.id + ' has no ' + type + ' block #' + n); return b; };
  const H = (h, cls, extra = '') => '<' + h.level + ' class="' + cls + '"' + extra + '>' + h.html + '</' + h.level + '>';
  const rich = (html, opts) => T.transformHtml(html, ctx, opts);
  const out = [];

  /* ---------------------------------------------------------------- B.4 hero (s1 + s2) */
  {
    const base = S[0].background.find((g) => !g.media && !g.superseded);
    if (!base) throw new Error('home.mjs: s1 has no base background layer');
    const im = base.image, crop = im.crop || null;
    /* the frame is 4:3 and its image 112% of the frame height: fh/fw = 0.84; the crop renders at k = 0.84 x 4/3 */
    const shown = crop ? { url: crop.url, w: crop.w, h: crop.h, srcset: crop.srcset, alt: im.alt } : im;
    const k = T.coverK(shown, 0.84);
    const sizes = '(min-width: 1200px) min(' + T.px(589 * k) + ', ' + T.r2(45.5 * k) + 'vw), (min-width: 769px) ' + T.r2(45.5 * k) + 'vw, calc(' + T.r2(100 * k) + 'vw - ' + Math.round(32 * k) + 'px)';
    const words = S[1].heading.text.trim().split(/\s+/);
    const cta = block(S[1], 'cta').buttons[0];
    const glasses = art['hero-cutout'];
    /* QA round 1 (PERF-4): the glasses cut-out is the measured LCP element of the home (8 of 9 views; its drop-shadow
       widens its painted box): the preload and fetchpriority go to it; the hero photo stays eager */
    ctx.lcp = glasses ? { url: glasses.url, srcset: T.srcsetOf(glasses), sizes: SIZES.glasses } : { url: shown.url, srcset: T.srcsetOf(shown), sizes };
    out.push('<section class="hero">'
      + T.heroLight(ctx.up, true)
      + route('hero')
      + T.rz('.frame__clip', 'h1', 'h2', 'p')
      + '<div class="container pl-surface pl-raise hero__grid">'
      + '<div class="hero__copy"><p class="hero__statement">' + esc(words[0]) + (words.length > 1 ? ' <span>' + esc(words.slice(1).join(' ')) + '</span>' : '') + '</p>'
      + T.btn(cta, { variant: 'btn--primary', lg: true }) + '</div>'
      + '<figure class="hero__frame"><div class="frame__clip">'
      + T.img(shown, { cls: 'frame__img', attrs: ' data-depth="inner"', sizes, lazy: false, priority: !glasses })
      + '</div>'
      + (glasses ? T.img(glasses, { cls: 'protrude protrude--glasses pl-cut', attrs: ' data-protrude="hero-glasses" data-cross=".frame__clip" data-depth="fore"', sizes: SIZES.glasses, priority: true }) : '')
      + '</figure></div>'
      + T.bank('bank--down bank--hero')
      + '</section>');
  }

  /* ---------------------------------------------------------------- B.5 intro card (s3, the h1) */
  {
    const s = S[2];
    if (!s.heading || s.heading.level !== 'h1') throw new Error('home.mjs: s3 does not lead with the h1');
    out.push('<section class="intro">' + route('intro')
      + '<div class="container pl-surface"><div class="intro__card surface surface--glass pl-break" data-protrude="intro-card" data-cross=".bank--hero">'
      + '<h1 class="intro__title wave-rule">' + s.heading.html + '</h1>'
      + '<div class="intro__text rich">' + rich(block(s, 'prose').html) + '</div>'
      + '</div></div></section>');
  }

  /* ---------------------------------------------------------------- B.6 Envision promo (s4) and services (s5) */
  {
    const promo = block(S[3], 'prose');
    const s5 = S[4];
    /* Mobile optimisation (M-SPEED-5): up to 768 px a card's 5:4 media is the one-column card's content box: 100vw - 2 x
       the gutter (max(16px, 4vw)) - 2 x 22 px card padding - 2 px border = min(100vw - 78px, 92vw - 46px) (297 px at 375,
       measured), times the cover factor k; the old k x (100vw - 68px) said 3-6 % more and crossed a srcset step at
       375x667 DPR 2 (1080 w for 720 w) and 412x915 DPR 2.625 (1280 w for 1080 w). The 769 px and 1200 px entries are unchanged */
    const cards = s5.blocks.filter((b) => b.type === 'callout').map((c, i) => {
      const k = T.coverK(c.image, 0.8);
      const sizes = '(min-width: 1200px) ' + T.px(230 * k) + ', (min-width: 769px) calc(' + T.r2(50 * k) + 'vw - ' + Math.round(64 * k) + 'px), min(calc(' + T.r2(100 * k) + 'vw - ' + T.r2(78 * k) + 'px), calc(' + T.r2(92 * k) + 'vw - ' + T.r2(46 * k) + 'px))';
      return '<li class="card card--svc surface surface--glass" data-tilt>'
        + '<div class="card__media frame pl-break" data-protrude="svc-' + (i + 1) + '" data-cross="parent">' + T.img(c.image, { sizes }) + '</div>'
        + '<div class="card__body rv"><' + c.title.level + ' class="card__title"><a class="card__link" href="' + esc(c.title.href) + '">' + c.title.html + '</a></' + c.title.level + '>'
        + '<div class="card__text rich rich--compact">' + rich(c.html) + '</div></div></li>';
    }).join('');
    out.push('<section class="services"><div class="services__band pl-band" aria-hidden="true" data-band></div>' + route('services')
      + '<div class="container pl-surface">'
      + '<div class="promo pl-break" data-protrude="envision" data-cross=".services__band">' + rich(promo.html, { sizes: SIZES.promo }) + '</div>'
      + H(s5.heading, 'section-title wave-rule wave-rule--center')
      + '<ul class="cards cards--4" role="list">' + cards + '</ul>'
      + '</div></section>');
  }

  /* ---------------------------------------------------------------- B.7 Alumier band (s6) */
  {
    const s = S[5];
    const bg = s.background.find((g) => !g.superseded);
    const c = block(s, 'callout');
    out.push('<section class="alumier">' + route('alumier') + T.rz('.alumier__card', 's4', 'a2')
      + '<div class="container pl-surface"><div class="alumier__card pl-break" data-protrude="alumier-card" data-cross=".services__band">'
      + T.img(bg.image, { cls: 'alumier__bg', sizes: SIZES.alumierBg })
      + '<div class="alumier__panel surface surface--image">'
      + T.img(c.image, { cls: 'alumier__logo', sizes: SIZES.alumierLogo, cap: false })
      + '<div class="alumier__line rich">' + rich(c.html) + '</div>'
      + c.buttons.map((b) => T.btn(b, { variant: 'btn--primary' })).join('')
      + '</div></div></div></section>');
  }

  /* ---------------------------------------------------------------- B.9 two callouts (s7) */
  {
    const s = S[6];
    const graft = art['graft-cutout'];
    const cells = s.blocks.filter((b) => b.type === 'callout').map((c, i) => '<div class="callouts__cell">'
      + '<article class="callout surface surface--paper rv"' + (c.title.href ? ' data-tilt' : '') + '>'
      + '<' + c.title.level + ' class="callout__title wave-rule">' + (c.title.href ? '<a class="card__link" href="' + esc(c.title.href) + '">' + c.title.html + '</a>' : c.title.html) + '</' + c.title.level + '>'
      + '<div class="callout__text rich">' + rich(c.html) + '</div>'
      + (c.image ? '<div class="callout__media frame">' + T.img(c.image, { sizes: SIZES.callout }) + '</div>' : '')
      + '</article>'
      /* G19: the kids' glasses rest on the first card's image corner, a sibling of the revealed card (D3) */
      + (i === 0 && graft ? T.img(graft, { cls: 'protrude protrude--kids pl-cut', attrs: ' data-protrude="kids-glasses" data-cross="parent" data-depth="fore"', sizes: SIZES.kids }) : '')
      + '</div>').join('');
    out.push('<section class="callouts">' + route('callouts')
      + '<div class="container pl-surface' + (graft ? ' pl-raise' : '') + ' callouts__grid">' + cells + '</div></section>');
  }

  /* ---------------------------------------------------------------- B.10 doctor blocks (s8, s9) */
  [[S[7], 'doctor1', false, 1], [S[8], 'doctor2', true, 2]].forEach(([s, key, flip, n]) => {
    const mem = block(s, 'team').members[0];
    const prose = block(s, 'prose');
    const cta = block(s, 'cta').buttons[0];
    out.push('<section class="doctor">' + route(key)
      + '<div class="container pl-surface doctor__grid' + (flip ? ' doctor__grid--flip' : '') + '">'
      + T.doctorPortrait(mem, n)
      + '<div class="doctor__text surface surface--paper rv">' + T.doctorTag(mem)
      + '<div class="doctor__prose rich">' + rich(prose.html) + '</div>'
      + T.btn(cta, { variant: 'btn--secondary' })
      + '</div></div></section>');
  });

  /* ---------------------------------------------------------------- B.11 lavender trio (s10) */
  {
    const s = S[9];
    const items = s.blocks.filter((b) => b.type === 'callout').map((c, i) => '<li class="trio__item">'
      + '<figure class="trio__photo frame pl-break" data-protrude="trio-' + (i + 1) + '" data-cross=".bank--lav">' + T.img(c.image, { sizes: SIZES.trio }) + '</figure>'
      + '<div class="trio__text rv"><' + c.title.level + ' class="trio__title">' + (c.title.href ? '<a href="' + esc(c.title.href) + '">' + c.title.html + '</a>' : c.title.html) + '</' + c.title.level + '>'
      + '<div class="trio__copy rich">' + rich(c.html) + '</div></div></li>').join('');
    out.push('<section class="lavender" data-band>' + T.bank('bank--up bank--lav') + route('lavender')
      + '<div class="container pl-surface"><ul class="trio" role="list">' + items + '</ul></div></section>');
  }

  /* ---------------------------------------------------------------- B.12 designer frames (s11) */
  {
    const s = S[10];
    const gal = block(s, 'gallery');
    const tiles = gal.items.map((it) => {
      if (it.image) {
        const im = T.img(it.image, { sizes: SIZES.tile });
        return '<li class="tile rv"><figure><div class="tile__media frame">' + (it.href ? '<a href="' + esc(it.href) + '">' + im + '</a>' : im) + '</div><figcaption>' + esc(it.caption) + '</figcaption></figure></li>';
      }
      const ph = it.placeholder;
      /* the brand-name cell (B.12): the name set in type is aria-hidden; the source caption stays, visually hidden */
      return '<li class="tile tile--text rv"><figure><div class="tile__media frame ph-brand" data-needs="' + esc(ph.needs) + '"><span class="ph-brand__name" aria-hidden="true">' + esc(ph.label) + '</span></div><figcaption class="vh">' + esc(it.caption) + '</figcaption></figure></li>';
    }).join('');
    out.push('<section class="frames">' + route('frames')
      + '<div class="container pl-surface frames__grid">'
      + '<div class="frames__text rv">' + H(s.heading, 'section-title section-title--left wave-rule') + '<div class="frames__copy rich">' + rich(block(s, 'prose').html) + '</div></div>'
      + '<ul class="tiles" role="list">' + tiles + '</ul>'
      + '</div></section>');
  }

  /* ---------------------------------------------------------------- B.13 cataract (s12) */
  {
    const s = S[11];
    const lens = art['home-feature'];
    let fig = '';
    if (lens) {
      /* the arch-top 4:5 frame (fh/fw 1.25) crops the 16:9 master: it renders k = 1.25 x w/h wide */
      const k = T.coverK(lens, 1.25);
      const sizes = '(min-width: 1200px) ' + T.px(410 * k) + ', (min-width: 769px) ' + T.r2(33 * k) + 'vw, min(' + T.px(300 * k) + ', ' + T.r2(72 * k) + 'vw)';
      fig = '<figure class="cataract__lens frame pl-break" data-protrude="lens" data-cross="next" data-depth="fore-soft">' + T.img(lens, { sizes }) + '</figure>';
    }
    out.push('<section class="cataract">' + route('cataract')
      + '<div class="container pl-surface pl-raise cataract__grid">'
      + '<div class="cataract__text surface surface--paper rv">' + H(s.heading, 'section-title section-title--left wave-rule') + '<div class="cataract__copy rich">' + rich(block(s, 'prose').html) + '</div></div>'
      + fig + '</div></section>');
  }

  /* ---------------------------------------------------------------- B.14 Eye Emergencies (s13) */
  {
    const s = S[12];
    const nodes = T.splitTop(block(s, 'prose').html);
    const figs = nodes.filter((n) => n.tag === 'figure');
    if (figs.length !== 1) throw new Error('home.mjs: s13 must hold exactly one figure');
    const rest = nodes.filter((n) => n.tag !== 'figure').map((n) => n.html).join('');
    out.push('<section class="emergency" data-band>' + route('emergency')
      + '<div class="container pl-surface emergency__grid">'
      + '<div class="emergency__text rv">' + H(s.heading, 'section-title section-title--left wave-rule') + '<div class="emergency__copy rich">' + rich(rest) + '</div></div>'
      + '<div class="emergency__photo pl-break" data-protrude="handshake" data-depth="fore-soft">' + rich(figs[0].html, { sizes: SIZES.handshake }) + '</div>'
      + '</div></section>');
  }

  /* ---------------------------------------------------------------- B.15 reviews carousel (s14) */
  {
    const s = S[13];
    const nodes = T.splitTop(block(s, 'prose').html);
    const fig = nodes.find((n) => n.tag === 'figure');
    const h = nodes.find((n) => /^h[2-6]$/.test(n.tag));
    if (!fig || !h || nodes.length !== 2) throw new Error('home.mjs: s14 prose must be one figure and one heading');
    const node = h.node;
    const inner = h.html.slice(node.openEnd - node.start, node.closeStart - node.start);
    const items = block(s, 'reviews').items;
    const cta = block(s, 'cta').buttons;
    const slides = items.map((it, i) => '<figure class="review" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + items.length + '">'
      + '<div class="review__meta">' + T.stars(it.stars) + '<time class="review__time" datetime="' + esc(T.isoT(it.reviewedAt)) + '">' + esc(it.shownAs) + '</time></div>'
      + '<blockquote class="review__quote rich rich--compact">' + rich(it.html) + '</blockquote>'
      + '<figcaption class="review__name">' + esc(it.name) + '</figcaption></figure>').join('');
    out.push('<section class="reviews">' + route('reviews')
      + '<div class="container pl-surface reviews__grid">'
      + '<div class="reviews__photo rv">' + rich(fig.html, { sizes: SIZES.staff }) + '</div>'
      + '<div class="reviews__panel surface surface--image pl-break" data-protrude="review-panel" data-cross=".reviews__photo">'
      /* D.7.4: the one re-emitted model heading: its level and inner HTML verbatim, the classes and id the carousel needs */
      + '<' + h.tag + ' class="reviews__title section-title section-title--left wave-rule" id="reviews-title">' + inner + '</' + h.tag + '>'
      + '<section class="carousel" data-carousel aria-roledescription="carousel" aria-labelledby="reviews-title">'
      /* QA round 1 (MOTION-5): the dots come before the track, so a taller slide grows below them instead of pushing them
         from under the pointer (and they precede the slides in the tab order, as the APG carousel has its controls).
         fix-2: the CTA shares that bar (DESIGN-SPEC 3.15 put it below the track, where opening the long review pushed it
         down by the slide's growth, 320 px at 1280x585 and 536 px at 390x844, below the fold); label, target, rel unchanged */
      + '<div class="carousel__bar"><div class="carousel__dots" role="group" aria-label="Reviews"></div>' + T.btnRow(cta, { variant: 'btn--primary' }) + '</div>'
      /* QA round 1 (A11Y-10): the focusable track is a group named by the visible heading; site.js hides the slides that are
         not shown, so its polite live region announces the slide that becomes current */
      + '<div class="carousel__track" tabindex="0" role="group" aria-labelledby="reviews-title" aria-live="polite">' + slides + '</div>'
      + '</section>'
      + '</div></div></section>');
  }

  /* ---------------------------------------------------------------- B.17 insurance band (s15) */
  {
    const s = S[14];
    const cta = block(s, 'cta').buttons;
    out.push('<section class="insurance" data-band>' + route('insurance')
      + '<div class="container pl-surface"><div class="insurance__inner rv">'
      + H(s.heading, 'insurance__title section-title section-title--left wave-rule wave-rule--navy')
      + '<div class="insurance__copy rich">' + rich(block(s, 'prose').html) + '</div>'
      + '<div class="insurance__cta">' + cta.map((b) => T.btn(b, { variant: 'btn--secondary' })).join('') + '</div>'
      + '</div></div></section>');
  }

  /* ---------------------------------------------------------------- B.18 news cards (s16) */
  {
    const s = S[15];
    out.push('<section class="news">' + route('news')
      + '<div class="container pl-surface">' + H(s.heading, 'section-title wave-rule wave-rule--center')
      + T.posts(block(s, 'posts'), ctx, { view: 'grid' })
      + '</div></section>');
  }

  return out.join('\n');
}
