/* ============================================================
   HSC Software Engineering Notes — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

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

  /* ── Mobile Menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      hamburger.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
      hamburger.querySelectorAll('span')[1].style.opacity  = open ? '0' : '1';
      hamburger.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = ''; s.style.opacity = '';
        });
      });
    });
  }

  /* ── Table of Contents — Active Highlight on Scroll ── */
  const tocLinks = document.querySelectorAll('.toc-list a');
  console.log(`[TOC] Found ${tocLinks.length} TOC links`);
  if (tocLinks.length > 0) {
    // Tag part-label list items (those without an anchor child)
    const partLabels = [];
    document.querySelectorAll('.toc-list > li').forEach(li => {
      if (!li.querySelector('a')) {
        li.classList.add('toc-part-label');
        partLabels.push(li);
      }
    });
    console.log(`[TOC] Found ${partLabels.length} part labels`);

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
    console.log(`[TOC] Found ${sections.length} sections to observe`);
    const observer = new IntersectionObserver(entries => {
      console.log(`[TOC] IntersectionObserver triggered with ${entries.length} entries`);
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
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      let any = false;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) any = true;
      });
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

  /* ── Animate elements into view ── */
  const animItems = document.querySelectorAll('.topic-card, .info-card, .def-card');
  if ('IntersectionObserver' in window) {
    const anim = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.animationDelay = `${i * 40}ms`;
          e.target.classList.add('fade-in');
          anim.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    animItems.forEach(el => anim.observe(el));
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

    const blocks = document.querySelectorAll('.part-block');
    console.log(`[Part-Blocks] Found ${blocks.length} part-block elements`);

    blocks.forEach((block, idx) => {
      const stateKey = `${pageKey}::part-${idx}`;
      console.log(`[Part-Blocks] Processing block ${idx}: ${block.textContent.substring(0, 30)}`);

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
      console.log(`[Part-Blocks] Moved ${siblings.length} siblings into part-group-inner`);

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
        console.log(`[Part-Blocks] Toggled block ${idx}: now collapsed = ${nowCollapsed}`);
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

      /* ── Toggle on heading click ── */
      h2.setAttribute('role', 'button');
      h2.setAttribute('aria-expanded', String(!isCollapsed));
      h2.addEventListener('click', () => {
        const nowCollapsed = h2.classList.toggle('section-collapsed');
        body.classList.toggle('section-collapsed', nowCollapsed);
        h2.setAttribute('aria-expanded', String(!nowCollapsed));
        setState(stateKey, nowCollapsed);
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

  /* ── Copy code button ── */
  document.querySelectorAll('.code-block').forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.style.cssText = `
      position:absolute; top:8px; right:10px;
      background:rgba(255,255,255,.1); color:#CBD5E1;
      border:1px solid rgba(255,255,255,.15); border-radius:6px;
      padding:3px 10px; font-size:.72rem; font-weight:600;
      cursor:pointer; transition:all .2s; font-family:inherit;
    `;
    copyBtn.addEventListener('click', () => {
      const code = block.querySelector('code')?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'rgba(16,185,129,.25)';
        copyBtn.style.color = '#6EE7B7';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.background = 'rgba(255,255,255,.1)';
          copyBtn.style.color = '#CBD5E1';
        }, 2000);
      });
    });
    block.style.position = 'relative';
    block.appendChild(copyBtn);
  });

});

/* ── CSS for fade-in animation ── */
const style = document.createElement('style');
style.textContent = `
  .fade-in {
    animation: fadeInUp .4s ease forwards;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
