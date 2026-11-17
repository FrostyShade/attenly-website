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
      '  float minSide = max(1.0, min(uRes.x, uRes.y));',
      '  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / minSide;',
      '  vec2 ptr = (uPointer - 0.5) * 0.45;',
      '  float t = uTime * 0.085;',
      '',
      '  vec2 flow = vec2(t * 0.7, -t * 0.5 + uScroll * 0.22);',
      '  float n1 = fbm(p * 1.45 + flow - ptr * 0.6);',
      '  float n2 = fbm(p * 1.85 - flow * 0.8 + vec2(n1 * 1.35, -n1 * 0.9) + ptr);',
      '  float n3 = fbm(p * 1.15 + vec2(n2 * 1.1, t * 0.6));',
      '',
      '  vec3 lightCol = uBase;',
      '  lightCol = mix(lightCol, uColA, smoothstep(0.24, 0.82, n1) * uStrength);',
      '  lightCol = mix(lightCol, uColB, smoothstep(0.30, 0.86, n2) * uStrength);',
      '  lightCol = mix(lightCol, uColC, smoothstep(0.38, 0.90, n3) * (uStrength * 0.85));',
      '',
      '  // Subtle pointer warmth highlight on light background',
      '  float ptrGlow = exp(-3.4 * length(uv - vec2(uPointer.x, 1.0 - uPointer.y)));',
      '  lightCol = mix(lightCol, uColC, ptrGlow * 0.18 * uStrength);',
      '',
      '  // Nocturnal Plum closer region below uDarkLine',
      '  vec3 darkBase = vec3(0.082, 0.035, 0.094);',
      '  vec3 darkOrchid = vec3(0.235, 0.075, 0.265);',
      '  vec3 darkCoral = vec3(0.310, 0.112, 0.165);',
      '  vec3 darkCol = mix(darkBase, darkOrchid, smoothstep(0.32, 0.82, n2) * 0.65);',
      '  darkCol = mix(darkCol, darkCoral, smoothstep(0.42, 0.88, n3) * 0.55);',
      '',
      '  float darkMask = smoothstep(uDarkLine, uDarkLine + 0.065, screenY + (n1 - 0.5) * 0.028);',
      '  vec3 col = mix(lightCol, darkCol, darkMask);',
      '',
      '  // Micro dither to keep pastel gradients completely free of banding',
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
        base: [0.980, 0.968, 0.984],
        a: [0.914, 0.835, 0.961],
        b: [0.973, 0.863, 0.914],
        c: [0.988, 0.878, 0.839],
        strength: 0.92
      },
      studyHero: {
        base: [0.957, 0.976, 0.961],
        a: [0.839, 0.918, 0.867],
        b: [0.894, 0.941, 0.906],
        c: [0.980, 0.922, 0.820],
        strength: 0.92
      },
      attendance: {
        base: [0.984, 0.973, 0.984],
        a: [0.929, 0.859, 0.961],
        b: [0.980, 0.863, 0.894],
        c: [0.980, 0.875, 0.843],
        strength: 0.92
      },
      paperAiry: {
        base: [0.984, 0.980, 0.976],
        a: [0.937, 0.894, 0.965],
        b: [0.976, 0.914, 0.937],
        c: [0.984, 0.922, 0.898],
        strength: 0.56
      },
      featuresBand: {
        base: [0.976, 0.965, 0.980],
        a: [0.925, 0.863, 0.961],
        b: [0.973, 0.890, 0.929],
        c: [0.984, 0.902, 0.875],
        strength: 0.82
      },
      studyBand: {
        base: [0.976, 0.984, 0.976],
        a: [0.882, 0.937, 0.902],
        b: [0.929, 0.957, 0.929],
        c: [0.980, 0.937, 0.867],
        strength: 0.62
      }
    };

    const featuresEl = document.getElementById('features');
    const studyEl = document.getElementById('study-mode');
    const closerEl = document.getElementById('download');

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

    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener(
        'pointermove',
        e => {
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

      if (studyEl) {
        const sr = studyEl.getBoundingClientRect();
        if (sr.top < vh * 0.72 && sr.bottom > vh * 0.28) return PALETTES.studyBand;
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

      const pal = pickTargetPalette();
      const k = immediate ? 1 : Math.min(1, dt * 3.8);
      lerpVec3(curr.base, pal.base, k);
      lerpVec3(curr.a, pal.a, k);
      lerpVec3(curr.b, pal.b, k);
      lerpVec3(curr.c, pal.c, k);
      curr.strength += (pal.strength - curr.strength) * k;

      const ptrK = immediate ? 1 : Math.min(1, dt * 3.2);
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
})();
