/* ==========================================================================
   ATTENLY — Studio Motion, Hero Mode Morph & Gallery Controls
   Pure vanilla JS (zero generated app mockups)
   ========================================================================== */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. FLOATING LIQUID-GLASS NAV (Scroll compact + Scroll-spy + Mobile Drawer)
     ------------------------------------------------------------------------ */
  const nav = document.getElementById('event-nav');
  const hero = document.getElementById('overview');
  const menuBtn = document.getElementById('nav-menu-btn');
  const drawer = document.getElementById('nav-drawer');
  const navLinks = [...document.querySelectorAll('.links-piece a[href^="#"]')];
  const spySections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function updateNavState() {
    const y = window.scrollY;
    const compactThreshold = hero ? Math.max(260, hero.offsetHeight * 0.42) : 340;
    if (nav) {
      nav.classList.toggle('is-compact', y > compactThreshold);
    }

    const anchor = y + 180;
    let activeId = '#overview';
    for (const sec of spySections) {
      if (sec.offsetTop <= anchor) activeId = '#' + sec.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === activeId);
    });
  }

  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', e => {
      if (drawer.classList.contains('open') && nav && !nav.contains(e.target)) {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. HERO PIXEL-TO-CRISP GLYPH INTRO
     ------------------------------------------------------------------------ */
  const glyphTargets = document.querySelectorAll('[data-glyphs]');
  let glyphIndex = 0;

  glyphTargets.forEach(line => {
    if (prefersReduced) return;
    // Preserve child elements like <em class="serif-it"> cleanly by wrapping text nodes only
    const childNodes = [...line.childNodes];
    const frag = document.createDocumentFragment();

    function wrapTextNode(text) {
      const spanFrag = document.createDocumentFragment();
      for (const ch of text) {
        if (ch === ' ') {
          const sp = document.createElement('span');
          sp.className = 'glyph';
          sp.textContent = ' ';
          spanFrag.appendChild(sp);
          continue;
        }
        const wrap = document.createElement('span');
        wrap.className = 'glyph';
        wrap.style.setProperty('--i', String(glyphIndex));

        const px = document.createElement('span');
        px.className = 'glyph-px';
        px.setAttribute('aria-hidden', 'true');
        px.textContent = ch;

        const tx = document.createElement('span');
        tx.className = 'glyph-tx';
        tx.textContent = ch;

        wrap.append(px, tx);
        spanFrag.appendChild(wrap);
        glyphIndex += 1;
      }
      return spanFrag;
    }

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        frag.appendChild(wrapTextNode(node.textContent || ''));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        clone.appendChild(wrapTextNode(node.textContent || ''));
        frag.appendChild(clone);
      }
    });

    line.textContent = '';
    line.appendChild(frag);
  });

  /* ------------------------------------------------------------------------
     3. HERO DUAL-MODE SWITCHER (Planner Lilac <-> Study Mode Eucalyptus Sky)
     ------------------------------------------------------------------------ */
  const modeBtns = [...document.querySelectorAll('[data-hero-mode]')];
  const heroCards = {
    planner: document.getElementById('hero-card-planner'),
    study: document.getElementById('hero-card-study'),
    attendance: document.getElementById('hero-card-attendance')
  };
  let activeHeroMode = 'planner';

  function setHeroMode(mode) {
    activeHeroMode = mode || 'planner';
    modeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-hero-mode') === mode));
    if (hero) {
      hero.classList.toggle('is-study-sky', mode === 'study');
    }

    if (!heroCards.planner || !heroCards.study || !heroCards.attendance) return;
    Object.values(heroCards).forEach(el => {
      el.classList.remove('hero-shot-card--left', 'hero-shot-card--center', 'hero-shot-card--right');
    });

    if (mode === 'study') {
      heroCards.planner.classList.add('hero-shot-card--left');
      heroCards.study.classList.add('hero-shot-card--center');
      heroCards.attendance.classList.add('hero-shot-card--right');
    } else if (mode === 'attendance') {
      heroCards.study.classList.add('hero-shot-card--left');
      heroCards.attendance.classList.add('hero-shot-card--center');
      heroCards.planner.classList.add('hero-shot-card--right');
    } else {
      heroCards.attendance.classList.add('hero-shot-card--left');
      heroCards.planner.classList.add('hero-shot-card--center');
      heroCards.study.classList.add('hero-shot-card--right');
    }
  }

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setHeroMode(btn.getAttribute('data-hero-mode'));
    });
  });

  Object.entries(heroCards).forEach(([key, card]) => {
    if (card) {
      card.addEventListener('click', () => setHeroMode(key));
    }
  });

  /* ------------------------------------------------------------------------
     4. SCROLL-SCRUBBED WORD-BY-WORD STATEMENT REVEAL
     ------------------------------------------------------------------------ */
  const scrubBlocks = [...document.querySelectorAll('[data-scrub]')];
  const scrubData = [];

  scrubBlocks.forEach(block => {
    const words = (block.textContent || '').trim().split(/\s+/);
    block.textContent = '';
    const spans = words.map((word, idx) => {
      const s = document.createElement('span');
      s.setAttribute('data-word', '');
      s.textContent = word;
      if (prefersReduced) {
        s.style.opacity = '1';
      } else {
        s.style.opacity = '0.18';
        s.style.filter = 'blur(4px)';
      }
      block.appendChild(s);
      if (idx < words.length - 1) block.appendChild(document.createTextNode(' '));
      return s;
    });
    scrubData.push({ block, spans });
  });

  function updateScrub() {
    if (prefersReduced || !scrubData.length) return;
    const vh = window.innerHeight || 900;
    for (const { block, spans } of scrubData) {
      const rect = block.getBoundingClientRect();
      const start = vh * 0.88;
      const end = vh * 0.28;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      const total = spans.length;
      for (let i = 0; i < total; i++) {
        const wordStart = (i / total) * 0.72;
        const wordSpan = 0.28;
        const wp = Math.max(0, Math.min(1, (progress - wordStart) / wordSpan));
        const eased = 1 - Math.pow(1 - wp, 2);
        spans[i].style.opacity = String(0.18 + eased * 0.82);
        spans[i].style.filter = wp >= 0.99 ? 'none' : `blur(${(1 - eased) * 4}px)`;
      }
    }
  }

  if (!prefersReduced) {
    window.addEventListener('scroll', updateScrub, { passive: true });
    updateScrub();
  }

  /* ------------------------------------------------------------------------
     5. STUDIO CARDS 3D POINTER TILT & LIGHT SHEEN
     ------------------------------------------------------------------------ */
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.studio-card').forEach(card => {
      const art = card.querySelector('.card-art');
      const sheen = card.querySelector('.card-sheen');
      if (!art) return;

      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        art.style.transform = `perspective(700px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg)`;
        if (sheen) {
          sheen.style.setProperty('--sx', `${x * 100}%`);
          sheen.style.setProperty('--sy', `${y * 100}%`);
        }
      });

      card.addEventListener('pointerleave', () => {
        art.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. SCROLL REVEAL, COUNT-UP NUMBERS & STANDARD/PRO ICON TOGGLE
     ------------------------------------------------------------------------ */
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  function revealInViewport() {
    const vh = window.innerHeight || 900;
    revealEls.forEach(el => {
      if (!el.classList.contains('in')) {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.96) el.classList.add('in');
      }
    });
  }

  if ('IntersectionObserver' in window && !prefersReduced) {
    const revObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: '0px 0px -24px 0px' }
    );
    revealEls.forEach(el => revObs.observe(el));
    window.addEventListener('scroll', revealInViewport, { passive: true });
    window.addEventListener('hashchange', revealInViewport);
    revealInViewport();
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  const countItems = document.querySelectorAll('.stat-item[data-count]');
  function runCountUp(item) {
    const target = Number(item.getAttribute('data-count'));
    const decimals = Number(item.getAttribute('data-decimals') || '0');
    const suffix = item.getAttribute('data-suffix') || '';
    const liveEl = item.querySelector('.stat-live');
    if (!liveEl) return;

    item.classList.add('is-done');
    if (prefersReduced) {
      liveEl.textContent = `${target.toFixed(decimals)}${suffix}`;
      return;
    }

    const dur = 1250;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      liveEl.textContent = `${(eased * target).toFixed(decimals)}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && !prefersReduced) {
    const countObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCountUp(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    countItems.forEach(item => countObs.observe(item));
  } else {
    countItems.forEach(runCountUp);
  }

  const editionBtns = [...document.querySelectorAll('[data-edition]')];
  const editionCopy = document.getElementById('edition-copy');
  editionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      editionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tier = btn.getAttribute('data-edition');
      if (editionCopy) {
        if (tier === 'pro') {
          editionCopy.innerHTML =
            '<strong>Attenly Pro.</strong> Adds Leave Planner simulations to preview future absences around your targets, plus the signature charcoal-and-coral Pro app icon.';
        } else {
          editionCopy.innerHTML =
            '<strong>Standard Core App (Free).</strong> Attendance tracking, weekly timetables, assignments, Study Mode, Course Map, Vault, and Group Projects are all included without paying.';
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     7. 8-SCREEN NOTEBOOK GALLERY + SYNCED CAPTION
     ------------------------------------------------------------------------ */
  const rail = document.getElementById('gallery-rail');
  const slots = rail ? [...rail.querySelectorAll('.gallery-slot')] : [];
  const filterBtns = [...document.querySelectorAll('[data-gallery-filter]')];
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const counterEl = document.getElementById('gallery-counter');
  const captionEl = document.getElementById('gallery-caption-live');

  function visibleSlots() {
    return slots.filter(s => !s.classList.contains('is-hidden'));
  }

  function focusSlot(slot, scrollIntoCenter = false) {
    const vis = visibleSlots();
    if (!vis.length || !slot) return;
    const idx = Math.max(0, vis.indexOf(slot));
    vis.forEach((s, i) => s.classList.toggle('is-featured', i === idx));
    if (counterEl) {
      counterEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(vis.length).padStart(2, '0')}`;
    }
    if (captionEl) {
      captionEl.textContent = slot.getAttribute('data-caption') || '';
    }
    if (scrollIntoCenter && rail) {
      const left = slot.offsetLeft - rail.clientWidth / 2 + slot.clientWidth / 2;
      rail.scrollTo({ left: Math.max(0, left), behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }

  if (rail && slots.length) {
    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        if (!rail.dataset.dragged) {
          focusSlot(slot, true);
        }
      });
    });

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        const vis = visibleSlots();
        const curr = Math.max(0, vis.findIndex(s => s.classList.contains('is-featured')));
        focusSlot(vis[(curr - 1 + vis.length) % vis.length], true);
      });
      nextBtn.addEventListener('click', () => {
        const vis = visibleSlots();
        const curr = Math.max(0, vis.findIndex(s => s.classList.contains('is-featured')));
        focusSlot(vis[(curr + 1) % vis.length], true);
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-gallery-filter');
        slots.forEach(s => {
          const cat = s.getAttribute('data-cat');
          s.classList.toggle('is-hidden', filter !== 'all' && cat !== filter);
        });
        const vis = visibleSlots();
        if (vis.length) focusSlot(vis[0], true);
      });
    });

    let down = false;
    let startX = 0;
    let startLeft = 0;
    rail.addEventListener('mousedown', e => {
      down = true;
      rail.dataset.dragged = '';
      rail.classList.add('dragging');
      startX = e.pageX - rail.offsetLeft;
      startLeft = rail.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      down = false;
      rail.classList.remove('dragging');
      setTimeout(() => {
        delete rail.dataset.dragged;
      }, 40);
    });
    rail.addEventListener('mousemove', e => {
      if (!down) return;
      const x = e.pageX - rail.offsetLeft;
      const delta = x - startX;
      if (Math.abs(delta) > 6) rail.dataset.dragged = '1';
      rail.scrollLeft = startLeft - delta * 1.15;
    });

    // Keep counter and caption synchronized when swiping horizontally on mobile
    let syncTimer;
    rail.addEventListener(
      'scroll',
      () => {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
          const vis = visibleSlots();
          if (!vis.length) return;
          const center = rail.scrollLeft + rail.clientWidth / 2;
          let closest = vis[0];
          let minDist = Infinity;
          for (const s of vis) {
            const dist = Math.abs(s.offsetLeft + s.clientWidth / 2 - center);
            if (dist < minDist) {
              minDist = dist;
              closest = s;
            }
          }
          focusSlot(closest, false);
        }, 70);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------------
     8. FAQ ACCORDION
     ------------------------------------------------------------------------ */
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      faqItems.forEach(other => {
        other.classList.remove('open');
        const ob = other.querySelector('.faq-btn');
        if (ob) ob.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ------------------------------------------------------------------------
     9. DYNAMIC WEBGL ATMOSPHERIC BACKGROUND (Domain-Warped Currents)
     ------------------------------------------------------------------------ */
  (function initAmbientAtmosphere() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
      || canvas.getContext('experimental-webgl');
    if (!gl) return; // Fallback gracefully to static CSS backgrounds

    const vSrc = [
      'attribute vec2 aPos;',
      'void main() {',
      '  gl_Position = vec4(aPos, 0.0, 1.0);',
      '}'
    ].join('\n');

    const fSrc = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform vec2 uRes;',
      'uniform float uTime;',
      'uniform float uScroll;',
      'uniform vec2 uPointer;',
      'uniform float uDarkLine;',
      'uniform float uStrength;',
      'uniform vec3 uBase;',
      'uniform vec3 uColA;',
      'uniform vec3 uColB;',
      'uniform vec3 uColC;',
      '',
      'float hash(vec2 p) {',
      '  p = fract(p * vec2(123.34, 456.21));',
      '  p += dot(p, p + 45.32);',
      '  return fract(p.x * p.y);',
      '}',
      '',
      'float noise(vec2 p) {',
      '  vec2 i = floor(p);',
      '  vec2 f = fract(p);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  float a = hash(i);',
      '  float b = hash(i + vec2(1.0, 0.0));',
      '  float c = hash(i + vec2(0.0, 1.0));',
      '  float d = hash(i + vec2(1.0, 1.0));',
      '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
      '}',
      '',
      'float fbm(vec2 p) {',
      '  float v = 0.0;',
      '  float amp = 0.52;',
      '  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);',
      '  for (int i = 0; i < 3; i++) {',
      '    v += amp * noise(p);',
      '    p = rot * p * 1.92 + vec2(1.7, 9.2);',
      '    amp *= 0.5;',
      '  }',
      '  return v;',
      '}',
      '',
      'void main() {',
      '  vec2 uv = gl_FragCoord.xy / uRes.xy;',
      '  float screenY = 1.0 - uv.y;',
      '  vec2 aspect = vec2(uRes.x / max(1.0, uRes.y), 1.0);',
      '  vec2 p = (uv - 0.5) * aspect;',
      '  vec2 ptrUv = vec2(uPointer.x, 1.0 - uPointer.y);',
      '  vec2 ptrP = (ptrUv - 0.5) * aspect;',
      '  vec2 dPtr = p - ptrP;',
      '  float ptrDist = length(dPtr);',
      '',
      '  // Fluid cursor ripple warp',
      '  vec2 q = p - dPtr * exp(-ptrDist * ptrDist * 4.5) * 0.30;',
      '',
      '  float t = uTime * 0.28;',
      '  float sc = uScroll * 0.52;',
      '  vec2 flow1 = vec2(t * 0.44 + sin(t * 0.27) * 0.20, -t * 0.30 + sc);',
      '  vec2 flow2 = vec2(-t * 0.36, t * 0.24 - sc * 0.65);',
      '',
      '  float f1 = fbm(q * 1.55 + flow1);',
      '  float f2 = fbm(q * 2.05 + vec2(f1 * 1.85, -f1 * 1.35) + flow2);',
      '  float n1 = smoothstep(0.24, 0.68, f1);',
      '  float n2 = smoothstep(0.25, 0.69, f2);',
      '',
      '  // Sweeping chromatic silk ribbons and luminous crests',
      '  float phase1 = q.x * 2.5 - q.y * 1.85 + f1 * 3.8 + f2 * 1.3 - t * 1.15 - sc * 1.35;',
      '  float phase2 = q.x * 1.65 + q.y * 2.55 - f2 * 3.6 + t * 0.90 + sc * 0.90;',
      '  float wave1 = 0.5 + 0.5 * sin(phase1);',
      '  float wave2 = 0.5 + 0.5 * cos(phase2);',
      '  float curtain1 = smoothstep(0.16, 0.88, mix(n1, wave1, 0.64));',
      '  float curtain2 = smoothstep(0.20, 0.90, mix(n2, wave2, 0.66));',
      '  float crest = clamp(pow(wave1 * wave2, 1.35) + 0.42 * exp(-8.0 * abs(sin(phase1 * 0.5 + 0.65))), 0.0, 1.0);',
      '',
      '  vec3 lightCol = mix(uBase, uColA, curtain1 * uStrength);',
      '  lightCol = mix(lightCol, uColB, curtain2 * uStrength * 0.92);',
      '  lightCol = mix(lightCol, uColC, crest * uStrength * 0.86);',
      '',
      '  // Luminous pointer prism halo',
      '  float ptrGlow = exp(-3.1 * ptrDist);',
      '  lightCol = mix(lightCol, mix(uColC, vec3(1.0, 0.93, 0.88), 0.28), ptrGlow * 0.48 * uStrength);',
      '',
      '  // Nocturnal Plum closer region below uDarkLine',
      '  vec3 darkBase = vec3(0.082, 0.032, 0.094);',
      '  vec3 darkOrchid = vec3(0.425, 0.125, 0.480);',
      '  vec3 darkRose = vec3(0.660, 0.175, 0.405);',
      '  vec3 darkCoral = vec3(0.790, 0.270, 0.235);',
      '  vec3 darkCol = mix(darkBase, darkOrchid, curtain1 * 0.88);',
      '  darkCol = mix(darkCol, darkRose, curtain2 * 0.72);',
      '  darkCol = mix(darkCol, darkCoral, crest * 0.76);',
      '  darkCol = mix(darkCol, darkCoral + 0.12, ptrGlow * 0.42);',
      '',
      '  float darkMask = smoothstep(uDarkLine - 0.02, uDarkLine + 0.075, screenY + (wave1 - 0.5) * 0.045 + (n1 - 0.5) * 0.03);',
      '  vec3 col = mix(lightCol, darkCol, darkMask);',
      '',
      '  // Micro dither to keep gradients free of banding',
      '  float dither = (hash(gl_FragCoord.xy + fract(uTime) * 60.0) - 0.5) * (2.0 / 255.0);',
      '  gl_FragColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, vSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fSrc);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      scroll: gl.getUniformLocation(prog, 'uScroll'),
      pointer: gl.getUniformLocation(prog, 'uPointer'),
      darkLine: gl.getUniformLocation(prog, 'uDarkLine'),
      strength: gl.getUniformLocation(prog, 'uStrength'),
      base: gl.getUniformLocation(prog, 'uBase'),
      colA: gl.getUniformLocation(prog, 'uColA'),
      colB: gl.getUniformLocation(prog, 'uColB'),
      colC: gl.getUniformLocation(prog, 'uColC')
    };

    const PALETTES = {
      planner: {
        base: [0.976, 0.945, 0.988],
        a: [0.765, 0.565, 0.925],
        b: [0.976, 0.600, 0.796],
        c: [1.000, 0.665, 0.515],
        strength: 0.94
      },
      studyHero: {
        base: [0.918, 0.968, 0.938],
        a: [0.535, 0.820, 0.665],
        b: [0.710, 0.905, 0.785],
        c: [0.990, 0.795, 0.435],
        strength: 0.95
      },
      attendance: {
        base: [0.980, 0.940, 0.985],
        a: [0.770, 0.560, 0.930],
        b: [0.975, 0.575, 0.755],
        c: [1.000, 0.675, 0.490],
        strength: 0.96
      },
      paperAiry: {
        base: [0.984, 0.968, 0.976],
        a: [0.835, 0.695, 0.945],
        b: [0.975, 0.720, 0.850],
        c: [1.000, 0.760, 0.640],
        strength: 0.86
      },
      featuresBand: {
        base: [0.976, 0.945, 0.982],
        a: [0.775, 0.575, 0.925],
        b: [0.975, 0.620, 0.805],
        c: [1.000, 0.675, 0.535],
        strength: 0.94
      },
      screensBand: {
        base: [0.972, 0.960, 0.988],
        a: [0.790, 0.610, 0.935],
        b: [0.960, 0.660, 0.825],
        c: [1.000, 0.700, 0.575],
        strength: 0.92
      },
      studyBand: {
        base: [0.922, 0.968, 0.942],
        a: [0.545, 0.825, 0.675],
        b: [0.715, 0.905, 0.790],
        c: [0.985, 0.795, 0.455],
        strength: 0.95
      }
    };

    const featuresEl = document.getElementById('features');
    const screensEl = document.getElementById('screens');
    const studyEl = document.getElementById('study-mode');
    const reviewsEl = document.getElementById('reviews');
    const closerEl = document.getElementById('download') || document.querySelector('.closer-sec, .site-footer');

    const curr = {
      base: [...PALETTES.planner.base],
      a: [...PALETTES.planner.a],
      b: [...PALETTES.planner.b],
      c: [...PALETTES.planner.c],
      strength: PALETTES.planner.strength,
      darkLine: 1.5,
      ptrX: 0.5,
      ptrY: 0.35
    };
    const targetPtr = { x: 0.5, y: 0.35 };
    let pointerActive = false;

    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener(
        'pointermove',
        e => {
          pointerActive = true;
          targetPtr.x = Math.max(0, Math.min(1, e.clientX / Math.max(1, window.innerWidth)));
          targetPtr.y = Math.max(0, Math.min(1, e.clientY / Math.max(1, window.innerHeight)));
        },
        { passive: true }
      );
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const scale = dpr * 0.65;
      const w = Math.max(1, Math.floor(window.innerWidth * scale));
      const h = Math.max(1, Math.floor(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    function pickTargetPalette() {
      const vh = window.innerHeight || 800;
      const y = window.scrollY;
      const heroH = hero ? hero.offsetHeight : vh;

      if (y < heroH * 0.72) {
        if (activeHeroMode === 'study') return PALETTES.studyHero;
        if (activeHeroMode === 'attendance') return PALETTES.attendance;
        return PALETTES.planner;
      }

      if (featuresEl) {
        const fr = featuresEl.getBoundingClientRect();
        if (fr.top < vh * 0.72 && fr.bottom > vh * 0.28) return PALETTES.featuresBand;
      }

      if (screensEl) {
        const scr = screensEl.getBoundingClientRect();
        if (scr.top < vh * 0.72 && scr.bottom > vh * 0.28) return PALETTES.screensBand;
      }

      if (studyEl) {
        const sr = studyEl.getBoundingClientRect();
        if (sr.top < vh * 0.72 && sr.bottom > vh * 0.28) return PALETTES.studyBand;
      }

      if (reviewsEl) {
        const rr = reviewsEl.getBoundingClientRect();
        if (rr.top < vh * 0.72 && rr.bottom > vh * 0.28) return PALETTES.featuresBand;
      }

      return PALETTES.paperAiry;
    }

    function lerpVec3(out, target, k) {
      out[0] += (target[0] - out[0]) * k;
      out[1] += (target[1] - out[1]) * k;
      out[2] += (target[2] - out[2]) * k;
    }

    let startMs = performance.now();
    let elapsed = 0;
    let rafId = 0;

    function drawFrame(now, immediate) {
      const dt = Math.min(0.06, Math.max(0, (now - startMs) / 1000));
      startMs = now;
      if (!prefersReduced) elapsed += dt;

      if (!pointerActive) {
        targetPtr.x = 0.5 + Math.sin(elapsed * 0.55) * 0.26;
        targetPtr.y = 0.40 + Math.cos(elapsed * 0.41) * 0.15;
      }

      const pal = pickTargetPalette();
      const k = immediate ? 1 : Math.min(1, dt * 4.2);
      lerpVec3(curr.base, pal.base, k);
      lerpVec3(curr.a, pal.a, k);
      lerpVec3(curr.b, pal.b, k);
      lerpVec3(curr.c, pal.c, k);
      curr.strength += (pal.strength - curr.strength) * k;

      const ptrK = immediate ? 1 : Math.min(1, dt * 4.5);
      curr.ptrX += (targetPtr.x - curr.ptrX) * ptrK;
      curr.ptrY += (targetPtr.y - curr.ptrY) * ptrK;

      let darkTop = 1.5;
      if (closerEl) {
        darkTop = closerEl.getBoundingClientRect().top / Math.max(1, window.innerHeight);
      }

      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.scroll, window.scrollY / Math.max(1, window.innerHeight));
      gl.uniform2f(loc.pointer, curr.ptrX, curr.ptrY);
      gl.uniform1f(loc.darkLine, darkTop);
      gl.uniform1f(loc.strength, curr.strength);
      gl.uniform3fv(loc.base, curr.base);
      gl.uniform3fv(loc.colA, curr.a);
      gl.uniform3fv(loc.colB, curr.b);
      gl.uniform3fv(loc.colC, curr.c);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    document.body.classList.add('has-webgl');
    drawFrame(performance.now(), true);

    if (prefersReduced) {
      window.addEventListener('scroll', () => drawFrame(performance.now(), true), { passive: true });
      modeBtns.forEach(b => b.addEventListener('click', () => drawFrame(performance.now(), true)));
      return;
    }

    function loop(now) {
      drawFrame(now, false);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        startMs = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    });
  })();

  /* ------------------------------------------------------------------------
     10. OUTBOUND CTA TELEMETRY BRIDGE (Zero-cookie event dispatch)
     ------------------------------------------------------------------------ */
  document.addEventListener('click', e => {
    const target = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if (!target) return;
    const name = target.getAttribute('data-track') || '';
    const href = target.getAttribute('href') || '';
    window.dispatchEvent(new CustomEvent('attenly:cta', { detail: { name, href } }));
    if (typeof window.plausible === 'function') {
      window.plausible('CTA Click', { props: { target: name } });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'select_content', { content_type: 'cta', item_id: name });
    }
  });
})();
