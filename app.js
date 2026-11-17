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

  function setHeroMode(mode) {
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
  const revealEls = document.querySelectorAll('[data-reveal]');
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
      { threshold: 0.14 }
    );
    revealEls.forEach(el => revObs.observe(el));
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
})();
