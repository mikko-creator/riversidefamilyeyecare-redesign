/* Riverlight Aurora site.js. Contract: docs/COMPONENTS.md section 1 (reads the 0.4 hooks, writes the 0.3 states).
   Accordions are native <details>, CSS only (1.11): never touched here. */
(() => {
  'use strict';
  const W = window, D = document, doc = D.documentElement;
  doc.classList.add('js');
  const $ = (s, r = D) => r.querySelector(s);
  const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
  const mq = (q) => W.matchMedia(q);
  const onMQ = (m, fn) => (m.addEventListener ? m.addEventListener('change', fn) : m.addListener(fn));
  const mqReduce = mq('(prefers-reduced-motion: reduce)');
  const reduced = () => mqReduce.matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const debounce = (fn, ms) => { let t = 0; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
  const hasIO = 'IntersectionObserver' in W;
  const fontsReady = D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve();
  const onLoad = (fn) => (D.readyState === 'complete' ? setTimeout(fn, 0) : W.addEventListener('load', fn, { once: true }));
  const idle = (fn) => (W.requestIdleCallback ? W.requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 200));
  const page = $('#page');

  /* 1.1 header metrics: sticky offset and scroll padding only, never a size (D1, I.14a); rounded up */
  const topbar = $('.topbar'), navbar = $('.navbar');
  const hpx = (el) => Math.ceil(el.getBoundingClientRect().height) + 'px';
  /* QA round 1 (LAYOUT-8): the sticky location card sticks only when it fits under the stuck navbar (.is-tall: it does not).
     fix-2: the card's exact height, not offsetHeight (rounded down: a 796.3 px card at 913 px tall stuck 0.3 px past the fold) */
  const locCard = $('.side-card--loc');
  const fitLoc = () => { if (locCard) locCard.classList.toggle('is-tall', locCard.getBoundingClientRect().height + (navbar ? Math.ceil(navbar.getBoundingClientRect().height) : 0) + 24 > innerHeight); };
  const setHeader = () => {
    if (topbar) doc.style.setProperty('--topbar-h', hpx(topbar));
    if (navbar) doc.style.setProperty('--navbar-h', hpx(navbar));
    fitLoc();
  };
  setHeader();
  /* QA round 1 (LAYOUT-6, LAYOUT-8): re-measure when the header or the card changes size without a resize (user text
     spacing, a larger font): offsets only, never a size, so this cannot loop (D1) */
  if ('ResizeObserver' in W) { const ro = new ResizeObserver(setHeader); [topbar, navbar, locCard].forEach((el) => { if (el) ro.observe(el); }); }

  // layout box in #page: offsets ignore transform and translate (I.43)
  const boxIn = (el) => {
    let x = 0, y = 0, e = el;
    while (e && e !== page) {
      x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent;
      if (e && e !== page) { x += e.clientLeft; y += e.clientTop; }
    }
    if (!e) { const r = el.getBoundingClientRect(), p = page.getBoundingClientRect(); x = r.left - p.left; y = r.top - p.top; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };

  /* 1.3 reveals */
  const DUR = 480, pending = new Set();
  let rio = null;
  const release = (el) => { el.classList.remove('rv', 'is-in'); el.style.removeProperty('--d'); };
  const reveal = (el, i) => {
    if (!pending.delete(el)) return;
    if (rio) rio.unobserve(el);
    const d = Math.min(i, 2) * 40;
    el.style.setProperty('--d', d + 'ms');
    el.classList.add('is-in');
    setTimeout(() => release(el), DUR + d + 50);
  };
  const unveilAll = () => { if (rio) rio.disconnect(); pending.clear(); $$('.rv').forEach(release); };
  const inView = (r) => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const sweep = () => { Array.from(pending).filter((el) => inView(el.getBoundingClientRect())).forEach(reveal); };
  const decide = () => {
    if (reduced()) return unveilAll();
    const rv = $$('.rv'), seen = rv.map((el) => inView(el.getBoundingClientRect()));
    rv.forEach((el, i) => { if (seen[i]) el.classList.remove('rv'); });
    doc.classList.add('rv-ready');
    // step 3, second look: one the hidden offset moves into view (it ended just above the viewport) is on screen too
    const rest = rv.filter((el, i) => !seen[i]), moved = rest.map((el) => inView(el.getBoundingClientRect()));
    rest.forEach((el, i) => { if (moved[i]) el.classList.remove('rv'); else pending.add(el); });
    if (!pending.size) return;
    let delivered = false;
    rio = new IntersectionObserver((ents) => {
      delivered = true;
      let i = 0;
      ents.forEach((en) => { if (en.isIntersecting && pending.has(en.target)) reveal(en.target, i++); });
    }, { threshold: 0, rootMargin: '0px' });
    pending.forEach((el) => rio.observe(el));
    // step 8: no delivery 1000 ms (visible) after observe() = a broken observer: fail open
    const check = () => setTimeout(() => { if (!delivered) { unveilAll(); doc.classList.remove('rv-ready'); } }, 1000);
    if (D.visibilityState !== 'hidden') check();
    else D.addEventListener('visibilitychange', function v() { if (D.visibilityState !== 'hidden') { D.removeEventListener('visibilitychange', v); check(); } });
  };
  if (reduced() || !hasIO) $$('.rv').forEach((el) => el.classList.remove('rv'));
  else { let once = false; const go = () => { if (!once) { once = true; decide(); } }; fontsReady.then(go, go); setTimeout(go, 300); }
  W.addEventListener('beforeprint', unveilAll);

  /* 1.4 parallax, aurora field, band --p: one scroll listener, one rAF per scrolled frame */
  const RATES = { inner: [0.08, 22], 'fore-soft': [0.06, 26], fore: [0.12, 44] };
  const field = ['dawn', 'day', 'dusk'].map((k) => $('.aurora-field__layer--' + k));
  const lights = $$('.hero__light').map((el) => { const o = parseFloat(getComputedStyle(el).opacity); return { el, base: isNaN(o) ? 1 : o }; });
  const depth = $$('[data-depth]').filter((el) => RATES[el.dataset.depth]).map((el) => ({ el, k: el.dataset.depth, r: RATES[el.dataset.depth], top: 0, h: 0, first: false, on: !hasIO, last: '' }));
  /* QA round 1 (MOTION-1, PERF-1): where CSS view timelines drive the band overlays (motion.css, the same @supports
     test), no --p is written; elsewhere --p stays the fallback */
  const bandsByCss = !!(W.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
  const bands = bandsByCss ? [] : $$('[data-band]').map((el) => ({ el, top: 0, h: 0, last: '' }));
  let maxScroll = 1, motionOn = false, ticking = false;
  let lightFaded = false, syncVideo = () => {};   /* PERF-7: set by frame(); syncVideo is defined with the loop (1.9) */
  const measure = () => {
    if (!page) return;
    maxScroll = Math.max(1, doc.scrollHeight - innerHeight);
    const top0 = page.getBoundingClientRect().top + scrollY + page.clientTop;
    depth.concat(bands).forEach((o) => { const b = boxIn(o.el); o.top = top0 + b.y; o.h = b.h; });
    depth.forEach((d) => { d.first = d.top < innerHeight; });
  };
  const frame = () => {
    ticking = false;
    if (pending.size) sweep();
    if (!motionOn) return;
    const y = scrollY, vh = innerHeight;
    const p = clamp(y / maxScroll, 0, 1), dawn = 1 - smooth(0.08, 0.42, p), dusk = smooth(0.55, 0.9, p);
    const drift = 'translate3d(0,' + (-6 * p).toFixed(3) + 'vh,0)';
    [dawn, clamp(1 - dawn - dusk, 0, 1), dusk].forEach((o, i) => { const l = field[i]; if (l) { l.style.opacity = o.toFixed(3); l.style.transform = drift; } });
    if (y < 1.6 * vh) lights.forEach((l) => { l.el.style.transform = 'translate3d(0,' + (0.3 * y).toFixed(1) + 'px,0)'; l.el.style.opacity = (l.base * (1 - smooth(0, 1.1 * vh, y))).toFixed(3); });
    /* QA round 1 (PERF-7): the light is fully faded from 1.1 vh: the loop pauses there, not only when its box leaves */
    const faded = y >= 1.1 * vh;
    if (faded !== lightFaded) { lightFaded = faded; syncVideo(); }
    depth.forEach((d) => {
      if (!d.on) return;
      const [rate, max] = d.r;
      /* QA round 1 (MOTION-8): cut-outs ('fore', DESIGN-SPEC 2.9) move upward only from rest, below the first screen too */
      const off = d.k === 'inner' ? clamp(y * rate, 0, max) : d.first ? clamp(-y * rate, -max, 0) : clamp((d.top + d.h / 2 - (y + vh / 2)) * rate, -max, d.k === 'fore' ? 0 : max);
      const t = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      if (t !== d.last) d.el.style.transform = d.last = t;
    });
    bands.forEach((b) => {
      const top = b.top - y;
      if (top >= vh || top + b.h <= 0) return;
      const v = clamp((vh - top) / (vh + b.h), 0, 1).toFixed(3);
      if (v !== b.last) b.el.style.setProperty('--p', b.last = v);
    });
  };
  const onScroll = () => { if (!ticking && (motionOn || pending.size)) { ticking = true; requestAnimationFrame(frame); } };
  W.addEventListener('scroll', onScroll, { passive: true });
  if (hasIO && depth.length) {
    const dmap = new Map(depth.map((d) => [d.el, d]));
    const dio = new IntersectionObserver((ents) => {
      let back = false;
      ents.forEach((en) => { const d = dmap.get(en.target); if (en.isIntersecting && !d.on) back = true; d.on = en.isIntersecting; });
      if (back) onScroll();
    }, { rootMargin: '200px 0px' });
    depth.forEach((d) => dio.observe(d.el));
  }
  const relayout = () => { if (motionOn) { measure(); frame(); } };
  const motion = () => {
    motionOn = !reduced();
    if (motionOn) return relayout();
    depth.forEach((d) => { d.el.style.removeProperty('transform'); d.last = ''; });
    field.concat(lights.map((l) => l.el)).forEach((el) => { if (el) { el.style.removeProperty('transform'); el.style.removeProperty('opacity'); } });
    bands.forEach((b) => { b.el.style.removeProperty('--p'); b.last = ''; });
  };
  motion();

  /* 1.5 dropdowns (hover is CSS, mirrored into aria-expanded) and the drawer dialog */
  const items = $$('.mainnav__item.has-sub').map((li) => ({ li, btn: $('.mainnav__toggle', li), hover: false }));
  const setItem = (it, open) => {
    it.li.classList.toggle('is-open', open);
    if (it.btn) it.btn.setAttribute('aria-expanded', String(open || it.hover));
  };
  const openItem = (it) => { items.forEach((o) => { if (o !== it && o.li.classList.contains('is-open')) setItem(o, false); }); setItem(it, true); };
  items.forEach((it) => {
    const { li, btn } = it;
    if (!btn) return;
    btn.addEventListener('click', () => (li.classList.contains('is-open') ? setItem(it, false) : openItem(it)));
    li.addEventListener('keydown', (e) => {
      const t = e.target, links = $$('.sub a', li), inSub = !!t.closest('.sub');
      if (e.key === 'Escape' && (li.classList.contains('is-open') || inSub)) { setItem(it, false); btn.focus(); }
      else if (e.key === 'ArrowDown' && (t === btn || t.classList.contains('mainnav__link'))) { e.preventDefault(); openItem(it); if (links[0]) links[0].focus(); }
      else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && inSub && links.length) {
        e.preventDefault();
        links[(links.indexOf(t) + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
      }
    });
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) setItem(it, false); });
    /* QA round 1 (MOTION-3): a panel closed by the pointer moving to another item hands its keyboard focus to its own
       toggle (still on screen); before, the focused link was hidden with the panel and focus fell to <body> */
    li.addEventListener('mouseenter', () => {
      it.hover = true;
      items.forEach((o) => {
        if (o === it || !o.li.classList.contains('is-open')) return;
        const sub = $('.sub', o.li), had = !!(sub && sub.contains(D.activeElement));
        setItem(o, false);
        if (had && o.btn) o.btn.focus({ preventScroll: true });
      });
      setItem(it, li.classList.contains('is-open'));
    });
    li.addEventListener('mouseleave', () => { it.hover = false; li.classList.remove('is-dismissed'); setItem(it, li.classList.contains('is-open')); });
  });
  if (items.length) D.addEventListener('click', (e) => { if (!(e.target instanceof Element && e.target.closest('.mainnav'))) items.forEach((it) => setItem(it, false)); });
  /* QA round 1 (MOTION-2, WCAG 1.4.13 dismissible): Escape also closes a panel the pointer holds open, wherever focus is;
     it stays closed until the pointer leaves the item (CSS: :hover:not(.is-dismissed)) */
  if (items.length) D.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    items.forEach((it) => { if (it.hover && !it.li.classList.contains('is-dismissed')) { it.li.classList.add('is-dismissed'); it.hover = false; setItem(it, it.li.classList.contains('is-open')); } });
  });

  /* navglass (2026-10-07): the mega menu's images load on the first intent - the pointer over the menu bar, focus inside
     it - never with the page; each fades in once decoded (CSS .mega__img.is-loaded) */
  const mainnav = $('.mainnav');
  if (mainnav) {
    const hydrate = () => {
      $$('img[data-src]', mainnav).forEach((img) => {
        const done = () => img.classList.add('is-loaded');
        img.addEventListener('load', done, { once: true });
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        if (img.complete && img.naturalWidth) done();
      });
    };
    mainnav.addEventListener('pointerenter', hydrate, { once: true });
    mainnav.addEventListener('focusin', hydrate, { once: true });
  }

  const drawer = $('#drawer'), menuBtn = $('.menu-toggle');
  /* Mobile optimisation (MT-R1, MT-R2, M-TOUCH-1): the drawer's phone-only behaviour applies below 1024 px; 1024-1199 px
     (the drawer's desktop range) is unchanged */
  const mqPhone = mq('(max-width: 1023px)');
  if (drawer && menuBtn && typeof drawer.showModal === 'function') {
    const panel = $('.drawer__panel', drawer) || drawer;
    const closeBtn = $('.drawer__close', panel);
    let closeT = 0, downOnSelf = false;
    const open = () => {
      clearTimeout(closeT);
      /* fix-2 (LAYOUT-12, MOTION-4): the scroll lock pads the root by the classic scrollbar it removes (CSS --sbw), so the
         page behind the scrim keeps its width; 0 for an overlay bar or when a gutter is already reserved */
      if (!drawer.open) doc.style.setProperty('--sbw', (getComputedStyle(doc).scrollbarGutter.indexOf('stable') === 0 ? 0 : Math.max(0, innerWidth - doc.clientWidth)) + 'px');
      const menuTop = mqPhone.matches && closeBtn ? menuBtn.getBoundingClientRect().top : null;
      if (!drawer.open) drawer.showModal();
      /* Mobile optimisation (MT-R1): the close button opens over the menu button, so a second tap on the same spot
         closes the drawer instead of following its first row (riverlight.css .drawer__panel, --menu-top). The close
         button's offset in the head is read with the panel's own 16 px padding, then the panel is padded down to it */
      if (menuTop !== null) {
        panel.style.removeProperty('--menu-top');
        const off = closeBtn.getBoundingClientRect().top - panel.getBoundingClientRect().top - parseFloat(getComputedStyle(panel).paddingTop);
        panel.style.setProperty('--menu-top', (menuTop - off).toFixed(2) + 'px');
      } else if (panel.style.getPropertyValue('--menu-top')) panel.style.removeProperty('--menu-top');
      void panel.offsetWidth; // style the closed pose first
      requestAnimationFrame(() => { if (drawer.open) drawer.classList.add('is-open'); });
      menuBtn.setAttribute('aria-expanded', 'true');
      const first = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', panel).find((el) => el.getClientRects().length);
      if (first) first.focus({ preventScroll: true });
    };
    const close = () => {
      if (!drawer.open) return;
      drawer.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      clearTimeout(closeT);
      closeT = setTimeout(() => { if (drawer.open) drawer.close(); }, reduced() ? 0 : 380);
    };
    drawer.addEventListener('close', () => {
      clearTimeout(closeT);
      drawer.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      /* QA round 1 (MOTION-9): closed by the viewport growing past the breakpoint, the menu button is no longer rendered;
         focus then goes to the desktop nav that replaced it (or the logo), not to <body> */
      const back = [menuBtn, $('.mainnav__link'), $('.brand')].find((el) => el && el.getClientRects().length);
      if (back) back.focus({ preventScroll: true });
    });
    menuBtn.addEventListener('click', () => (drawer.open ? close() : open()));
    drawer.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    drawer.addEventListener('pointerdown', (e) => { downOnSelf = e.target === drawer; });
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) { if (downOnSelf) close(); }
      else if (e.target instanceof Element && e.target.closest('[data-close]')) close();
      downOnSelf = false;
    });
    $$('.dnav__toggle', drawer).forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-expanded') !== 'true', sub = D.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', String(on));
      if (sub) sub.hidden = !on;
    }));
    onMQ(mq(drawer.getAttribute('data-close-at') || '(min-width: 75em)'), (e) => { if (e.matches) close(); });
    /* Mobile optimisation (MT-R2): a page left from inside the drawer came back from the back-forward cache with the
       drawer open, the page scroll-locked and aria-expanded "true"; below 1024 px the drawer closes, without its
       animation, as the page is hidden (the 'close' listener above restores focus) */
    W.addEventListener('pagehide', () => {
      if (!drawer.open || !mqPhone.matches) return;
      clearTimeout(closeT);
      drawer.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      drawer.close();
    });
  } else if (drawer && menuBtn) {
    /* Mobile optimisation (M-TOUCH-1; simulated, unverified on WebKit): without <dialog> (Safari before 15.4) the menu
       button cannot open the drawer; below 1024 px html.no-modal shows the nav as the wrapped list it is without
       JavaScript (riverlight.css). The class follows the width, so 1024 px and up is untouched */
    const noModal = () => doc.classList.toggle('no-modal', mqPhone.matches);
    noModal();
    onMQ(mqPhone, noModal);
  }

  /* 1.6 carousel: manual only, no auto-advance (I.14b) */
  const carousels = [];
  $$('[data-carousel]').forEach((car) => {
    const track = $('.carousel__track', car), dotsBox = $('.carousel__dots', car);
    const slides = track ? Array.from(track.children) : [], N = slides.length;
    if (!N) return;
    let idx = 0, st = 0;
    const fit = () => { track.style.height = slides[idx].offsetHeight + 'px'; };
    /* QA round 1 (LAYOUT-5): a slide that changes height without a resize (user text spacing, a font change) refits the
       track; the track's height never changes a slide's, so this cannot loop */
    if ('ResizeObserver' in W) { const sro = new ResizeObserver(() => fit()); slides.forEach((s) => sro.observe(s)); }
    /* QA round 1 (A11Y-10): only the shown slide is exposed, so the track's live region has a change to announce */
    const mark = () => {
      dots.forEach((b, i) => b.setAttribute('aria-current', i === idx ? 'true' : 'false'));
      slides.forEach((s, i) => { if (i === idx) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
      fit();
    };
    const go = (i) => { idx = ((i % N) + N) % N; track.scrollTo({ left: idx * track.clientWidth, behavior: reduced() ? 'auto' : 'smooth' }); mark(); };
    const dots = dotsBox ? slides.map((s, i) => {
      const b = D.createElement('button');
      b.type = 'button'; b.className = 'carousel__dot';
      b.setAttribute('aria-label', 'Show review ' + (i + 1) + ' of ' + N);
      b.addEventListener('click', () => go(i));
      dotsBox.append(b);
      return b;
    }) : [];
    track.addEventListener('scroll', () => {
      clearTimeout(st);
      st = setTimeout(() => {
        const w = track.clientWidth;
        const i = w ? clamp(Math.round(track.scrollLeft / w), 0, N - 1) : idx;
        if (i !== idx) { idx = i; mark(); }
      }, 90);
    }, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(idx + (e.key === 'ArrowRight' ? 1 : -1)); }
    });
    carousels.push({ fit, snap: () => { track.scrollLeft = idx * track.clientWidth; fit(); } });
    mark();
  });

  /* 1.7 tilt and glare */
  const fine = mq('(hover: hover) and (pointer: fine)');
  const TILT = ['--rx', '--ry', '--mx', '--my'];
  const tilts = $$('[data-tilt]');
  const untilt = (el) => TILT.forEach((v) => el.style.removeProperty(v));
  tilts.forEach((el) => {
    let raf = 0, ev = null;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !fine.matches || reduced() || el.classList.contains('rv')) return;
      ev = e;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x = clamp((ev.clientX - r.left) / r.width, 0, 1) - 0.5, y = clamp((ev.clientY - r.top) / r.height, 0, 1) - 0.5;
        const s = el.style;
        s.setProperty('--rx', (-y * 5).toFixed(2) + 'deg'); s.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
        s.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%'); s.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
      });
    });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); raf = 0; untilt(el); });
  });

  /* 1.8 the river: under copy, and per weave zone an over copy clipped to the occluder's own shape (B1) */
  const svgU = page && $('.river--under', page), svgO = page && $('.river--over', page);
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const n = D.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  /* Mobile optimisation (fixer D1, BUILD-NOTES 15.4): the t layout (769-1199 px) also served the locked 1024-1199 px, so
     769-1023 px is its own layout m: an anchor reads m, else t, else d (unchanged where a route has no m value); a zone
     with no data-on draws at d, t, m and p, and a data-on list names the layouts it draws at */
  const mqD = mq('(min-width: 1200px)'), mqT = mq('(min-width: 769px)'), mqM = mq('(max-width: 1023px)');
  const STRANDS = [ // name, paint, width, opacity, offset(s, nx, ny)
    ['glow', 'glow', 150, 0.16, () => 0],
    ['glow2', 'glow', 96, 0.2, (s) => 3 * Math.sin(s / 300)],
    ['mist', 'mid', 56, 0.13, (s) => 5 * Math.sin(s / 260)],
    ['mist2', 'mid', 34, 0.15, (s) => 4 * Math.sin(s / 220)],
    ['body', 'body', 18, 0.24, () => 0],
    ['core', 'body', 8, 0.3, (s) => 2 * Math.sin(s / 150)],
    ['teal', '#13a89e', 2.4, 0.85, (s) => -9 + 5 * Math.sin(s / 170)],
    ['navy', '#1e2c70', 1.6, 0.5, (s) => 9 + 5 * Math.sin(s / 170 + Math.PI)],
    ['light', '#ffffff', 1.6, 0.9, (s, nx, ny) => 5 * (nx * -0.6 + ny * -0.8)],
  ];
  const GRADS = {
    glow: [[0, '#b3e3e0'], [0.28, '#bee0ee'], [0.5, '#ddd8f0'], [0.72, '#b3e3e0'], [0.9, '#bee0ee'], [1, '#95d8d3']],
    mid: [[0, '#13a89e'], [0.3, '#349fc9'], [0.52, '#9485d1'], [0.74, '#13a89e'], [0.9, '#349fc9'], [1, '#95d8d3']],
    body: [[0, '#13a89e'], [0.3, '#2fa6c4'], [0.52, '#8f8fd3'], [0.74, '#13a89e'], [0.9, '#349fc9'], [1, '#95d8d3']],
  };
  const parseAt = (s) => { const m = {}; (s || '').trim().split(/\s+/).forEach((tok) => { const i = tok.indexOf(':'); if (i > 0) m[tok.slice(0, i)] = tok.slice(i + 1); }); return m; };
  const resolveX = (v, hb, host) => {
    if (v === 'L') return hb.x - 0.016 * hb.w;
    if (v === 'R') return hb.x + 1.016 * hb.w;
    let m = /^(-?[\d.]+)%$/.exec(v);
    if (m) return hb.x + (m[1] / 100) * hb.w;
    m = /^C([LR])([+-][\d.]+)?$/.exec(v);
    const c = m && host.querySelector(':scope > .container');
    if (!c) return null;
    const cb = boxIn(c), cs = getComputedStyle(c), n = m[2] ? +m[2] : 0;
    return (m[1] === 'L' ? cb.x + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) : cb.x + cb.w - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight)) + n;
  };
  const resolveY = (v, hb) => {
    let m = /^(-?[\d.]+)%(?:([+-][\d.]+)px)?$/.exec(v);
    if (m) return hb.y + (m[1] / 100) * hb.h + (m[2] ? +m[2] : 0);
    m = /^(-?[\d.]+)px$/.exec(v);
    return m ? hb.y + +m[1] : null;
  };
  const spline = (P) => { // centripetal Catmull-Rom; at[j] = anchor j's sample
    const S = [], at = [], n0 = P.length;
    if (n0 < 2) { P.forEach((p, j) => { at[j] = S.length; S.push(p); }); return { S, at }; }
    const ext = [{ x: 2 * P[0].x - P[1].x, y: 2 * P[0].y - P[1].y }, ...P, { x: 2 * P[n0 - 1].x - P[n0 - 2].x, y: 2 * P[n0 - 1].y - P[n0 - 2].y }];
    const tj = (ti, a, b) => ti + Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y)) + 1e-6;
    for (let i = 0; i < n0 - 1; i++) {
      const p0 = ext[i], p1 = ext[i + 1], p2 = ext[i + 2], p3 = ext[i + 3];
      const t0 = 0, t1 = tj(t0, p0, p1), t2 = tj(t1, p1, p2), t3 = tj(t2, p2, p3);
      const n = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 10));
      at[i] = S.length;
      for (let k = 0; k < n; k++) {
        const t = t1 + ((t2 - t1) * k) / n;
        const L = (a, b, ta, tb) => ({ x: ((tb - t) * a.x + (t - ta) * b.x) / (tb - ta), y: ((tb - t) * a.y + (t - ta) * b.y) / (tb - ta) });
        const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
        S.push(L(L(A1, A2, t0, t2), L(A2, A3, t1, t3), t1, t2));
      }
    }
    at[n0 - 1] = S.length;
    S.push(P[n0 - 1]);
    return { S, at };
  };
  const offsetPath = (S, f) => {
    let s = 0;
    return S.map((p, i) => {
      const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
      if (i) s += Math.hypot(p.x - S[i - 1].x, p.y - S[i - 1].y);
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l, o = f(s, nx, ny);
      return { x: p.x + nx * o, y: p.y + ny * o };
    });
  };
  const toD = (S) => S.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join('');
  const shape = (el, x, y, w, h) => { // border box + computed radii, scaled as CSS does
    const cs = getComputedStyle(el), r2 = (v) => +v.toFixed(2);
    const rad = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((k) => {
      const [a, b = a] = (cs['border' + k + 'Radius'] || '0px').split(' ');
      const len = (s, ref) => (s.endsWith('%') ? (parseFloat(s) / 100) * ref : parseFloat(s) || 0);
      return [len(a, w), len(b, h)];
    });
    const [tl, tr, br, bl] = rad, q = (len, sum) => (sum > 0 ? len / sum : 1 / 0);
    const f = Math.min(1, q(w, tl[0] + tr[0]), q(w, bl[0] + br[0]), q(h, tl[1] + bl[1]), q(h, tr[1] + br[1]));
    rad.forEach((c) => { c[0] *= f; c[1] *= f; });
    const A = (c, ex, ey) => 'A' + r2(c[0]) + ' ' + r2(c[1]) + ' 0 0 1 ' + r2(ex) + ' ' + r2(ey);
    return 'M' + r2(x + tl[0]) + ' ' + r2(y) + 'H' + r2(x + w - tr[0]) + A(tr, x + w, y + tr[1]) + 'V' + r2(y + h - br[1]) + A(br, x + w - br[0], y + h) +
      'H' + r2(x + bl[0]) + A(bl, x, y + h - bl[1]) + 'V' + r2(y + tl[1]) + A(tl, x + tl[0], y) + 'Z';
  };
  let bw = 0, bh = 0;
  const buildRiver = () => {
    if (!svgU || !svgO) return;
    const t0 = performance.now(), Wp = page.clientWidth, H = page.offsetHeight;
    const lay = mqD.matches ? 'd' : mqT.matches ? (mqM.matches ? 'm' : 't') : 'p';
    const P = [], key = {};
    $$('.ra', page).forEach((a) => {
      const host = a.parentElement, m = parseAt(a.dataset.at);
      const v = lay === 'd' ? m.d : lay === 't' ? m.t || m.d : lay === 'm' ? m.m || m.t || m.d : m.p || m.t || m.d;
      if (!host || !v || v === 'off' || !host.getClientRects().length) return;
      const [vx, vy] = v.split(','), hb = boxIn(host);
      const x = vy == null ? null : resolveX(vx, hb, host), y = vy == null ? null : resolveY(vy, hb);
      if (x == null || y == null || !isFinite(x) || !isFinite(y)) return;
      key[a.dataset.ra] = P.length;
      P.push({ x, y });
    });
    const { S, at } = spline(P), lines = STRANDS.map((st) => offsetPath(S, st[4]));
    const pr = page.getBoundingClientRect(), zones = [];
    $$('.rz', page).forEach((z) => {
      const a = key[z.dataset.from], b = key[z.dataset.to];
      if (!(z.dataset.on || 'd t m p').split(/\s+/).includes(lay) || a == null || b == null || a === b) return;
      let occ = null;
      try { occ = z.parentElement.querySelector(z.dataset.occluder); } catch (e) { /* not a selector */ }
      const r = occ && occ.getBoundingClientRect();
      if (r && r.width && r.height) zones.push({ i0: at[Math.min(a, b)], i1: at[Math.max(a, b)], d: shape(occ, r.left - pr.left - page.clientLeft, r.top - pr.top - page.clientTop, r.width, r.height) });
    });
    [svgU, svgO].forEach((svg, over) => {
      const pre = over ? 'ro-' : 'ru-';
      svg.replaceChildren();
      svg.setAttribute('viewBox', '0 0 ' + Wp + ' ' + H);
      svg.setAttribute('width', Wp); svg.setAttribute('height', H);
      const defs = mk('defs', {}, svg);
      Object.keys(GRADS).forEach((g) => { const lg = mk('linearGradient', { id: pre + g, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: H }, defs); GRADS[g].forEach(([o, c]) => mk('stop', { offset: o, 'stop-color': c }, lg)); });
      /* Mobile optimisation (M-LOOK-13, fixer D1): on phones (p, 768 px and below) every strand is drawn at 0.6 of its
         width, so the river keeps its desktop proportion; the over copy still takes the strands of 18 px or less by their
         spec width (B1) */
      const draw = (g, i0, i1) => STRANDS.forEach(([name, paint, w, op], j) => {
        if (over && w > 18) return;
        mk('path', { d: toD(lines[j].slice(i0, i1 + 1)), fill: 'none', stroke: paint[0] === '#' ? paint : 'url(#' + pre + paint + ')', 'stroke-width': lay === 'p' ? +(w * 0.6).toFixed(2) : w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op, 'data-strand': name }, g);
      });
      if (S.length < 2) return;
      if (!over) return draw(mk('g', {}, svg), 0, S.length - 1);
      zones.forEach((zn, n) => {
        const id = 'ro-clip-' + (n + 1);
        mk('path', { d: zn.d }, mk('clipPath', { id, clipPathUnits: 'userSpaceOnUse' }, defs));
        draw(mk('g', { 'clip-path': 'url(#' + id + ')' }, svg), zn.i0, zn.i1);
      });
    });
    page.dataset.river = JSON.stringify({ anchors: P.length, zones: zones.length, samples: S.length, ms: Math.round(performance.now() - t0) });
    bw = Wp; bh = H;
  };

  /* 1.9 hero loop (after load; no autoplay; preload none, I.14g) and its toggle (I.9, I.44) */
  const light = $('.hero__light[data-video]');
  const heroFrame = light && light.parentElement && $('.hero__frame', light.parentElement);
  const mqData = mq('(prefers-reduced-data: reduce)');
  let video = null, toggle = null, vio = null, loaded = false, userPaused = false, heroIn = false;
  const videoOK = () => {
    const c = navigator.connection;
    return !reduced() && !mqData.matches && !(c && (c.saveData || /^(slow-2g|2g|3g)$/.test(c.effectiveType || '')));
  };
  const phone = light && mq(light.dataset.mediaPhone || '(max-width: 768px)');
  const sources = () => {
    video.replaceChildren();
    const list = phone.matches ? [[light.dataset.srcPhone, 'video/mp4']] : [[light.dataset.srcWebm, 'video/webm'], [light.dataset.srcMp4, 'video/mp4']];
    list.forEach(([src, type]) => { if (src) { const s = D.createElement('source'); s.src = src; s.type = type; video.append(s); } });
  };
  const stopVideo = () => {
    if (!video) return;
    if (vio) vio.disconnect();
    video.pause(); video.replaceChildren(); video.load(); video.remove();
    if (toggle) toggle.remove();
    light.classList.remove('is-paused');
    video = toggle = vio = null;
  };
  const play = () => {
    if (!video || userPaused) return;
    const pr = video.play();
    if (pr && pr.catch) pr.catch((err) => { if (err && err.name === 'NotAllowedError') stopVideo(); });
  };
  const setToggle = () => {
    toggle.setAttribute('aria-label', userPaused ? 'Play background video' : 'Pause background video');
    toggle.querySelector('use').setAttribute('href', userPaused ? '#i-play' : '#i-pause');
  };
  const startVideo = () => {
    if (video || !heroFrame || !loaded || userPaused || !videoOK()) return; // no toggle host: no video (WCAG 2.2.2)
    video = D.createElement('video');
    video.muted = video.defaultMuted = true; video.loop = true; video.playsInline = true;
    ['muted', 'loop', 'playsinline'].forEach((a) => video.setAttribute(a, ''));
    video.setAttribute('preload', 'none'); video.setAttribute('aria-hidden', 'true'); video.setAttribute('tabindex', '-1');
    sources();
    video.addEventListener('playing', function () { this.classList.add('is-playing'); });
    light.append(video);
    toggle = D.createElement('button');
    toggle.type = 'button'; toggle.className = 'roundbtn roundbtn--ghost hero__toggle';
    mk('use', { href: '#i-pause' }, mk('svg', { class: 'ico', 'aria-hidden': 'true', focusable: 'false' }, toggle));
    setToggle();
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      light.classList.toggle('is-paused', userPaused);
      setToggle();
      if (userPaused) video.pause(); else syncVideo();
    });
    heroFrame.append(toggle);
    if (hasIO) {
      vio = new IntersectionObserver((ents) => { heroIn = ents[ents.length - 1].isIntersecting; syncVideo(); }, { threshold: 0 });
      vio.observe(light);
    } else { heroIn = true; syncVideo(); }
  };
  /* QA round 1 (PERF-7): plays only while its box is in view AND the light is not faded out (frame() sets lightFaded) */
  syncVideo = () => { if (!video) return; if (heroIn && !lightFaded) play(); else if (!video.paused) video.pause(); };
  if (phone) onMQ(phone, () => { if (video) { video.classList.remove('is-playing'); sources(); video.load(); syncVideo(); } });

  /* 1.10 forms; the notice hook stays dormant until Q8 (I.14e) */
  $$('[data-show-if]').forEach((el) => {
    const form = el.closest('form'), rule = el.getAttribute('data-show-if'), i = rule.indexOf('=');
    if (!form || i < 1) return;
    const name = rule.slice(0, i), want = rule.slice(i + 1);
    const sync = () => {
      const c = form.elements[name];
      if (!c) return;
      const v = c instanceof Element && (c.type === 'radio' || c.type === 'checkbox') ? (c.checked ? c.value : '') : c.value || '';
      el.hidden = v !== want;
    };
    sync();
    form.addEventListener('change', sync);
  });
  /* QA round 1 (CONTENT-1): a form with no endpoint never submits. Its method="dialog" already sends nothing; this also
     cancels the submit where a browser reads that method as GET. The browser's validation has run before the submit
     event; a decided notice (none today, Q8) is shown when the card holds one */
  $$('form[data-needs-backend]').forEach((form) => {
    const card = form.closest('.form-card'), note = card && $('p.form__notice[hidden]', card);
    form.addEventListener('submit', (e) => { e.preventDefault(); if (note) note.hidden = false; });
  });

  /* QA round 1 (PERF-6, fix-2): a deferred YouTube embed (data-src, COMPONENTS D.7.7) loads once it comes within 600 px
     of the viewport; Chrome's own lazy distance for iframes fetched it at page load (A-3). Without an observer it loads now */
  const frames = $$('iframe[data-src]');
  if (frames.length) {
    const setSrc = (f) => { if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src')); };
    if (hasIO) {
      const fio = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { setSrc(en.target); fio.unobserve(en.target); } }), { rootMargin: '600px 0px' });
      frames.forEach((f) => fio.observe(f));
    } else frames.forEach(setSrc);
  }

  /* timing: resize, fonts, load, #page size, reduced motion both ways */
  W.addEventListener('resize', debounce(() => { setHeader(); relayout(); carousels.forEach((c) => c.snap()); }, 150));
  fontsReady.then(() => { setHeader(); relayout(); carousels.forEach((c) => c.fit()); });
  onLoad(() => {
    loaded = true;
    relayout();
    startVideo();
    if (svgU && svgO) idle(() => {
      buildRiver();
      if ('ResizeObserver' in W) new ResizeObserver(debounce(() => {
        if (page.clientWidth !== bw || Math.abs(page.offsetHeight - bh) > 2) { buildRiver(); relayout(); }
      }, 150)).observe(page);
    });
  });
  onMQ(mqReduce, () => {
    if (reduced()) { unveilAll(); doc.classList.remove('rv-ready'); tilts.forEach(untilt); stopVideo(); }
    else startVideo();
    motion();
  });
})();
