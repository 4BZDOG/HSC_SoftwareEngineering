/* ============================================================
   HSC Software Engineering Notes — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Skip Link (Accessibility) ── */
  const mainContent = document.querySelector('.main-content, .content-body, main');
  if (mainContent) {
    if (!mainContent.id) mainContent.id = 'main-content';
    const skipLink = document.createElement('a');
    skipLink.href = '#' + mainContent.id;
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /* ── Theme Toggle ── */
  const THEME_KEY = 'hsc-theme';
  const saved = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);

  document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(btn => {
    updateThemeIcon(btn, saved);
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(b => updateThemeIcon(b, next));
    });
  });

  function updateThemeIcon(btn, theme) {
    if (!btn) return;
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  /* ── Transform Outcome Subtitles to Badges ── */
  document.querySelectorAll('.outcome-subtitle').forEach(el => {
    const content = el.innerHTML.trim();
    const outcomePattern = /\(([^)]+)\)/;
    const match = content.match(outcomePattern);

    if (match) {
      const codes = match[1].split(',').map(code => code.trim());
      let newHTML = '';
      codes.forEach((code, i) => {
        newHTML += `<span class="outcome-badge">${code}</span>`;
        if (i < codes.length - 1) newHTML += ' ';
      });
      el.innerHTML = newHTML;
    }
  });

  /* ── Nav Active State (URL-based, works across all pages) ── */
  (function () {
    const filename = window.location.pathname.split('/').pop() || 'index.html';

    // Mark matching links active and flag parent dropdown
    document.querySelectorAll('.nav-links > li > a, .nav-dropdown-menu a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.split('/').pop() === filename) {
        link.classList.add('active');
        const dropdown = link.closest('.nav-dropdown');
        if (dropdown) dropdown.classList.add('nav-dropdown--has-active');
      }
    });
  })();

  /* ── Nav Dropdowns ── */
  (function () {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns.length) return;

    function openDd(dd) {
      dd.classList.add('open');
      dd.querySelector('.nav-dropdown-btn').setAttribute('aria-expanded', 'true');
    }
    function closeDd(dd) {
      dd.classList.remove('open');
      dd.querySelector('.nav-dropdown-btn').setAttribute('aria-expanded', 'false');
    }
    function closeAll(except) {
      dropdowns.forEach(d => { if (d !== except) closeDd(d); });
    }

    dropdowns.forEach(dd => {
      const btn  = dd.querySelector('.nav-dropdown-btn');
      const menu = dd.querySelector('.nav-dropdown-menu');

      // ── Hover (desktop) ──────────────────────────────────────
      dd.addEventListener('mouseenter', () => { closeAll(dd); openDd(dd); });
      dd.addEventListener('mouseleave', () => closeDd(dd));

      // ── Click / touch toggle ──────────────────────────────────
      btn.addEventListener('click', () => {
        const wasOpen = dd.classList.contains('open');
        closeAll();
        if (!wasOpen) openDd(dd);
      });

      // ── Keyboard: trigger button ──────────────────────────────
      btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDd(dd);
          menu.querySelector('a')?.focus();
        }
        if (e.key === 'Escape') closeDd(dd);
      });

      // ── Keyboard: inside menu ─────────────────────────────────
      menu.addEventListener('keydown', e => {
        const items = [...menu.querySelectorAll('a')];
        const idx   = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[Math.min(idx + 1, items.length - 1)]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx === 0) { btn.focus(); closeDd(dd); }
          else items[Math.max(idx - 1, 0)]?.focus();
        } else if (e.key === 'Escape') {
          btn.focus(); closeDd(dd);
        } else if (e.key === 'Tab') {
          closeDd(dd);
        }
      });
    });

    // ── Click outside ─────────────────────────────────────────
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-dropdown')) closeAll();
    });
  })();

  /* ── Mobile Menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
      hamburger.querySelectorAll('span')[1].style.opacity  = open ? '0' : '1';
      hamburger.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = ''; s.style.opacity = '';
        });
      });
    });
  }

  /* ── Reading Progress Bar ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    navbar.appendChild(progressBar);

    const hasToc = document.querySelector('.toc-list');
    if (hasToc) {
      document.documentElement.classList.add('has-toc');
      const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        progressBar.style.setProperty('--scroll-pct', pct);
        progressBar.style.width = pct + '%';
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }
  }

  /* ── Scroll-to-Top Button ── */
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top-btn';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.innerHTML = '&#8593;'; // ↑ arrow
  document.body.appendChild(scrollBtn);

  const SCROLL_THRESHOLD = 400;
  const updateScrollBtn = () => {
    scrollBtn.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
  };
  window.addEventListener('scroll', updateScrollBtn, { passive: true });
  updateScrollBtn();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Diagram Enhancements ── */
  document.querySelectorAll('.diagram-block').forEach((block, idx) => {
    block.style.setProperty('--diagram-index', idx);

    const mermaid = block.querySelector('.mermaid');
    if (mermaid) {
      const content = mermaid.textContent.toLowerCase();
      let type = 'diagram';
      if (content.includes('flowchart') || content.includes('graph td') || content.includes('graph lr')) {
        type = 'flowchart';
      } else if (content.includes('classDiagram') || content.includes('class ')) {
        type = 'class';
      } else if (content.includes('sequenceDiagram') || content.includes('participant')) {
        type = 'sequence';
      }
      block.setAttribute('data-type', type);
    }
  });

  /* ── Table of Contents — Active Highlight on Scroll ── */
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (tocLinks.length > 0) {
    // Tag part-label list items (those without an anchor child)
    document.querySelectorAll('.toc-list > li').forEach(li => {
      if (!li.querySelector('a')) {
        li.classList.add('toc-part-label');
      }
    });

    const allTocLis = Array.from(document.querySelectorAll('.toc-list > li'));

    function setActivePart(activeLi) {
      document.querySelectorAll('.toc-part-label').forEach(pl => pl.classList.remove('toc-part-active'));
      if (!activeLi) return;
      const idx = allTocLis.indexOf(activeLi);
      for (let i = idx; i >= 0; i--) {
        if (allTocLis[i].classList.contains('toc-part-label')) {
          allTocLis[i].classList.add('toc-part-active');
          break;
        }
      }
    }

    // Observe sections directly (they carry the IDs the TOC hrefs target)
    const sections = Array.from(document.querySelectorAll('.content-body section[id]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));

        const activeLink = document.querySelector(`.toc-list a[href="#${id}"]`);
        if (activeLink) {
          // Scroll sidebar to keep active link visible
          activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          setActivePart(activeLink.closest('li'));
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Search (home page) ── */
  const searchInput = document.getElementById('topic-search');
  if (searchInput) {
    const cards = document.querySelectorAll('.topic-card');

    // Aria-live region for screen-reader feedback
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    searchInput.parentNode.insertBefore(liveRegion, searchInput.nextSibling);

    // No-results message
    const noResults = document.createElement('p');
    noResults.className = 'search-no-results';
    noResults.textContent = 'No topics match your search.';
    noResults.hidden = true;
    searchInput.closest('section, div')?.appendChild(noResults);

    let searchTimer;
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = e.target.value.toLowerCase().trim();
        let visibleCount = 0;
        cards.forEach(card => {
          const show = !q || card.textContent.toLowerCase().includes(q);
          card.style.display = show ? '' : 'none';
          if (show) visibleCount++;
        });
        noResults.hidden = visibleCount > 0 || !q;
        liveRegion.textContent = q
          ? `${visibleCount} topic${visibleCount !== 1 ? 's' : ''} found`
          : '';
      }, 150);
    });
  }

  /* ── Smooth Scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Staggered Card Entrance (transition-based, no animation conflicts) ── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cardGrids = document.querySelectorAll('.topics-grid');
  if (cardGrids.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    cardGrids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.topic-card'));
      // Set hidden state via JS only — cards remain visible if JS is absent
      cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(22px)';
      });
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          const delay = cards.indexOf(card) * 70;
          card.classList.add('card-visible');
          // Double-rAF: first frame commits the hidden inline styles to the renderer,
          // second frame applies the visible state so the transition actually fires.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.transitionDelay = `${delay}ms`;
            card.style.opacity = '1';
            card.style.transform = '';
          }));
          // After entrance completes: clear inline styles AND remove card-visible so the
          // card falls back to `transition: all 200ms` — making hover snappy again.
          card.addEventListener('transitionend', () => {
            card.style.transitionDelay = '';
            card.style.opacity = '';
            card.style.transform = '';
            card.classList.remove('card-visible');
          }, { once: true });
          obs.unobserve(card);
        });
      }, { threshold: 0.08 });
      cards.forEach(card => obs.observe(card));
    });
  }

  /* ── Fallback: show all cards on non-home topic pages ── */
  const nonGridCards = document.querySelectorAll('.info-card, .def-card');
  if (nonGridCards.length && 'IntersectionObserver' in window) {
    const anim = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fade-in'); anim.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    nonGridCards.forEach(el => anim.observe(el));
  }

  /* ── Hero Stat Counter Animation ── */
  const statEls = document.querySelectorAll('.hero-stat-num[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Suppress per-tick SR announcements; final value is already in the DOM
    statEls.forEach(el => el.setAttribute('aria-live', 'off'));
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        el.classList.add('stat-animated');
        if (reducedMotion) {
          el.textContent = end + suffix;
          counterObs.unobserve(el);
          return;
        }
        const duration = 1400;
        const startTime = performance.now();
        function tick(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * end) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => counterObs.observe(el));
  }

  /* ── Collapsible Major Part Blocks ── */
  (function () {
    const PART_KEY = 'hsc-parts';
    const pageKey = window.location.pathname;

    function getState() {
      try { return JSON.parse(localStorage.getItem(PART_KEY) || '{}'); }
      catch { return {}; }
    }
    function setState(key, collapsed) {
      const s = getState();
      if (collapsed) s[key] = 1; else delete s[key];
      try { localStorage.setItem(PART_KEY, JSON.stringify(s)); } catch {}
    }

    document.querySelectorAll('.part-block').forEach((block, idx) => {
      const stateKey = `${pageKey}::part-${idx}`;

      // Inject chevron
      const chevron = document.createElement('span');
      chevron.className = 'part-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`;
      block.appendChild(chevron);

      // Wrap all following siblings until the next .part-block in an animated group
      const group    = document.createElement('div');
      const inner    = document.createElement('div');
      group.className = 'part-group';
      inner.className = 'part-group-inner';
      group.appendChild(inner);

      const siblings = [];
      let el = block.nextElementSibling;
      while (el && !el.classList.contains('part-block')) {
        siblings.push(el);
        el = el.nextElementSibling;
      }
      block.insertAdjacentElement('afterend', group);
      siblings.forEach(s => inner.appendChild(s));

      // Restore saved collapse state
      const isCollapsed = getState()[stateKey] === 1;
      if (isCollapsed) {
        block.classList.add('part-collapsed');
        group.classList.add('part-collapsed');
      }

      block.setAttribute('role', 'button');
      block.setAttribute('aria-expanded', String(!isCollapsed));
      block.setAttribute('tabindex', '0');

      function toggle() {
        const nowCollapsed = block.classList.toggle('part-collapsed');
        group.classList.toggle('part-collapsed', nowCollapsed);
        block.setAttribute('aria-expanded', String(!nowCollapsed));
        setState(stateKey, nowCollapsed);
      }

      block.addEventListener('click', toggle);
      block.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  })();

  /* ── Collapsible Syllabus Sections ── */
  (function () {
    const COLLAPSE_KEY = 'hsc-collapsed';
    const pageKey = window.location.pathname;

    function getState() {
      try { return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}'); }
      catch { return {}; }
    }

    function setState(key, collapsed) {
      const s = getState();
      if (collapsed) s[key] = 1;
      else delete s[key];
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(s)); } catch {}
    }

    document.querySelectorAll('h2.syllabus-phase').forEach((h2, idx) => {
      const section = h2.closest('section');
      if (!section) return;
      const sectionId = section.id || `sec-${idx}`;
      const stateKey = `${pageKey}::${sectionId}`;

      /* ── Move outcome badges into the header ── */
      const nextSib = h2.nextElementSibling;
      if (nextSib && nextSib.classList.contains('outcome-subtitle')) {
        h2.appendChild(nextSib);
      }

      /* ── Move syllabus concept into the header ── */
      const conceptEl = h2.nextElementSibling;
      if (conceptEl && conceptEl.classList.contains('syllabus-concept')) {
        conceptEl.innerHTML = conceptEl.innerHTML.replace(/📌\s*/, '');
        h2.appendChild(conceptEl);
      }

      /* ── Add chevron ── */
      const chevron = document.createElement('span');
      chevron.className = 'section-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = `<svg viewBox="0 0 16 16"><polyline points="4 6 8 10 12 6"/></svg>`;
      h2.appendChild(chevron);

      /* ── Wrap body content ── */
      const body  = document.createElement('div');
      body.className = 'section-body';
      const inner = document.createElement('div');
      inner.className = 'section-body-inner';
      body.appendChild(inner);

      // Move every sibling after h2 into the inner div
      const siblings = [];
      let el = h2.nextElementSibling;
      while (el) { siblings.push(el); el = el.nextElementSibling; }
      siblings.forEach(s => inner.appendChild(s));
      section.appendChild(body);

      /* ── Restore saved collapse state ── */
      const isCollapsed = getState()[stateKey] === 1;
      if (isCollapsed) {
        h2.classList.add('section-collapsed');
        body.classList.add('section-collapsed');
      }

      /* ── Accessibility ── */
      h2.setAttribute('role', 'button');
      h2.setAttribute('tabindex', '0');
      h2.setAttribute('aria-expanded', String(!isCollapsed));

      /* ── Toggle on click or keyboard ── */
      function toggle() {
        const nowCollapsed = h2.classList.toggle('section-collapsed');
        body.classList.toggle('section-collapsed', nowCollapsed);
        h2.setAttribute('aria-expanded', String(!nowCollapsed));
        setState(stateKey, nowCollapsed);
      }

      h2.addEventListener('click', toggle);
      h2.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    /* ── Auto-expand part + section when TOC link is clicked ── */
    document.querySelectorAll('.toc-list a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        // Expand collapsed part-group first
        const partGroup = target.closest('.part-group');
        if (partGroup?.classList.contains('part-collapsed')) {
          partGroup.previousElementSibling?.click();
        }
        // Expand collapsed section
        const h2 = target.tagName === 'SECTION'
          ? target.querySelector('h2.syllabus-phase')
          : target.closest('section')?.querySelector('h2.syllabus-phase');
        if (h2?.classList.contains('section-collapsed')) h2.click();
      });
    });
  })();

  /* ── Diagram Block Collapsibility ── */
  (() => {
    const DIAGRAM_KEY = 'hsc-diagram-collapsed';
    const collapsed = JSON.parse(localStorage.getItem(DIAGRAM_KEY) || '{}');

    // Debounced resize handler
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.querySelectorAll('.diagram-block:not(.diagram-collapsed) .diagram-body').forEach(body => {
          body.style.maxHeight = body.scrollHeight + 'px';
        });
      }, 100);
    };
    window.addEventListener('resize', onResize, { passive: true });

    document.querySelectorAll('.diagram-block').forEach((block, idx) => {
      const h4 = block.querySelector('h4');
      if (!h4) return;

      // Create wrapper for diagram content if not already wrapped
      let body = block.querySelector('.diagram-body');
      if (!body) {
        body = document.createElement('div');
        body.className = 'diagram-body';
        const siblings = Array.from(block.children).filter(el => el !== h4);
        siblings.forEach(el => body.appendChild(el));
        block.appendChild(body);
      }

      // Restore saved collapse state
      if (collapsed[idx]) {
        block.classList.add('diagram-collapsed');
        body.style.maxHeight = '0px';
        body.style.opacity = '0';
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.opacity = '1';
      }

      h4.addEventListener('click', () => {
        const isCollapsing = !block.classList.contains('diagram-collapsed');
        if (isCollapsing) {
          block.classList.add('diagram-collapsed');
          body.style.maxHeight = '0px';
          body.style.opacity = '0';
          collapsed[idx] = true;
        } else {
          block.classList.remove('diagram-collapsed');
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity = '1';
          collapsed[idx] = false;
        }
        try { localStorage.setItem(DIAGRAM_KEY, JSON.stringify(collapsed)); } catch {}
      });
    });
  })();

  /* ── Diagram Lightbox Feature ── */
  (() => {
    class DiagramLightbox {
      constructor() {
        this.modal = document.getElementById('diagram-lightbox');
        this.overlay = document.querySelector('.lightbox-overlay');
        this.container = document.querySelector('.lightbox-container');
        this.content = document.getElementById('lightbox-content');
        this.closeBtn = document.querySelector('.lightbox-close');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.resetBtn = document.getElementById('reset-view');
        this.zoomLevel = document.getElementById('zoom-level');

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.zoomStep = 0.1;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this._triggerEl = null; // element that opened the lightbox

        if (this.modal) this.init();
      }

      init() {
        // Attach click handlers to all diagram blocks
        document.querySelectorAll('.diagram-block').forEach(block => {
          const mermaid = block.querySelector('.mermaid');
          if (mermaid) {
            mermaid.style.cursor = 'pointer';
            mermaid.addEventListener('click', () => {
              const svg = mermaid.querySelector('svg');
              if (svg) this.open(svg, mermaid);
            });
          }
        });

        // Modal controls
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        this.container.addEventListener('click', e => e.stopPropagation());

        this.zoomInBtn.addEventListener('click', () => this.zoom_in());
        this.zoomOutBtn.addEventListener('click', () => this.zoom_out());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Keyboard controls
        document.addEventListener('keydown', e => {
          if (!this.isOpen()) return;
          if (e.key === 'Escape') this.close();
          if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoom_in(); }
          if (e.key === '-' || e.key === '_') { e.preventDefault(); this.zoom_out(); }
          if (e.key === '0') { e.preventDefault(); this.reset(); }
        });

        // Mouse wheel zoom
        this.content.addEventListener('wheel', e => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) this.zoom_in();
            else this.zoom_out();
          }
        }, { passive: false });

        // Pan — mouse
        this.content.addEventListener('mousedown', e => {
          if (e.button !== 0) return;
          this.isDragging = true;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.content.classList.add('panning');
          e.preventDefault();
        });

        document.addEventListener('mousemove', e => {
          if (!this.isDragging || !this.isOpen()) return;
          this.panX += e.clientX - this.lastX;
          this.panY += e.clientY - this.lastY;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.updateTransform();
        });

        document.addEventListener('mouseup', () => {
          this.isDragging = false;
          this.content.classList.remove('panning');
        });

        // Pan / pinch — touch
        let touchDistance = 0;

        this.content.addEventListener('touchstart', e => {
          if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
          } else if (e.touches.length === 2) {
            this.isDragging = false;
            touchDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        });

        this.content.addEventListener('touchmove', e => {
          if (e.touches.length === 1 && this.isDragging) {
            this.panX += e.touches[0].clientX - this.lastX;
            this.panY += e.touches[0].clientY - this.lastY;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            this.updateTransform();
          } else if (e.touches.length === 2) {
            const current = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            if (touchDistance > 0) {
              const ratio = current / touchDistance;
              if (ratio > 1.1) { this.zoom_in(); touchDistance = current; }
              else if (ratio < 0.9) { this.zoom_out(); touchDistance = current; }
            }
          }
        }, { passive: true });

        this.content.addEventListener('touchend', () => {
          this.isDragging = false;
        });
      }

      open(element, trigger = null) {
        this._triggerEl = trigger;
        const clone = element.cloneNode(true);

        // Mermaid renders SVGs with explicit px width/height attributes.
        // Remove them so CSS max-width/max-height can scale the SVG to fit
        // the canvas. Preserve (or synthesise) a viewBox for correct aspect ratio.
        if (!clone.getAttribute('viewBox')) {
          const w = parseFloat(clone.getAttribute('width'))  || 800;
          const h = parseFloat(clone.getAttribute('height')) || 600;
          clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
        }
        clone.removeAttribute('width');
        clone.removeAttribute('height');

        this.content.innerHTML = '';
        this.content.appendChild(clone);

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateZoomLevel();

        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Trigger reflow so the SVG renders at its new dimensions before focus
        void this.content.offsetWidth;
        this.closeBtn.focus();
      }

      close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.content.innerHTML = '';
        // Return focus to the element that opened the lightbox
        if (this._triggerEl) {
          this._triggerEl.focus({ preventScroll: true });
          this._triggerEl = null;
        }
      }

      zoom_in() {
        if (this.zoom < this.maxZoom) {
          this.zoom = Math.min(this.maxZoom, this.zoom + this.zoomStep);
          this.updateTransform();
          this.updateZoomLevel();
        }
      }

      zoom_out() {
        if (this.zoom > this.minZoom) {
          this.zoom = Math.max(this.minZoom, this.zoom - this.zoomStep);
          this.updateTransform();
          this.updateZoomLevel();
        }
      }

      reset() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateZoomLevel();
      }

      updateTransform() {
        this.content.style.transform =
          `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
      }

      updateZoomLevel() {
        if (this.zoomLevel) this.zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
      }

      isOpen() {
        return this.modal?.classList.contains('active') ?? false;
      }
    }

    new DiagramLightbox();
  })();

  /* ── Copy code button ── */
  document.querySelectorAll('.code-block').forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.addEventListener('click', () => {
      const code = block.querySelector('code')?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.setAttribute('aria-label', 'Code copied to clipboard');
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback for environments without clipboard API
        try {
          const ta = document.createElement('textarea');
          ta.value = code;
          ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch {}
      });
    });
    block.appendChild(copyBtn);
  });

});

/* ── CSS for fade-in animation (injected once) ── */
/* NOTE: ideally move to styles.css — kept here as a single-file convenience */
