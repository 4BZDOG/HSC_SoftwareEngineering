/* ============================================================
   Paper-cut theme: diorama scenery for the hero and topic
   headers, with gentle pointer and scroll parallax.
   Purely decorative; everything here is aria-hidden.
   ============================================================ */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Far → near. d is the parallax depth (px of travel at the edge).
  const LAYERS = [
    { cls: 'pc-l1', d: 4,  path: 'M0 170 C160 120 300 150 440 128 S760 90 920 120 1220 96 1440 118 V320 H0Z' },
    { cls: 'pc-l2', d: 8,  path: 'M0 205 C120 180 260 196 380 170 S620 150 760 178 1040 150 1180 172 1380 160 1440 168 V320 H0Z' },
    { cls: 'pc-l3', d: 13, path: 'M0 236 C140 214 240 230 360 210 S600 196 720 222 980 200 1120 216 1340 204 1440 214 V320 H0Z' },
    { cls: 'pc-l4', d: 19, path: 'M0 262 C180 244 300 258 440 244 S700 236 860 254 1300 238 1440 244 V320 H0Z' },
    { cls: 'pc-l5', d: 26, path: 'M0 290 C200 276 340 288 520 278 S820 272 980 284 1260 274 1440 280 V320 H0Z' },
    { cls: 'pc-l6', d: 0,  path: 'M0 312 C240 304 480 314 720 308 S1200 304 1440 310 V320 H0Z' }
  ];

  const GLYPHS = [
    ['{ }', 250, 118, 2], ['</>', 1150, 92, 5], ['01', 520, 150, 9], ['( )', 930, 140, 11]
  ];

  // Each layer is its own <svg> so the browser can rasterise its shadow once
  // and move it on the compositor, instead of re-filtering the scene per frame.
  // Scroll factor: far sheets drift down as the page scrolls, the ground stays put.
  const sd = d => (d ? (26 - d) / 26 * 0.32 : 0).toFixed(3);
  const VIEW = 'viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"';

  function scene(compact) {
    const sun = `<svg class="pc-layer" style="--d:2;--sd:${sd(2)}" ${VIEW}><circle class="pc-sun" cx="${compact ? 1260 : 1180}" cy="${compact ? 120 : 96}" r="${compact ? 34 : 46}"/></svg>`;
    const glyphs = compact ? '' : GLYPHS.map(([t, x, y, d]) =>
      `<svg class="pc-layer" style="--d:${d};--sd:${sd(d)}" ${VIEW}><text class="pc-glyph" x="${x}" y="${y}">${t}</text></svg>`
    ).join('');
    const layers = LAYERS.map(l =>
      `<svg class="pc-layer" style="--d:${l.d};--sd:${sd(l.d)}" ${VIEW}><path class="${l.cls}" d="${l.path}"/></svg>`
    ).join('');
    return sun + glyphs + layers;
  }

  // One rAF loop per diorama: eases towards the pointer target and the
  // scroll offset, then stops once it has settled.
  function mount(host, compact) {
    if (host.querySelector('.pc-diorama')) return;
    const d = document.createElement('div');
    d.className = 'pc-diorama';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = scene(compact);
    host.prepend(d);
    if (reduce.matches) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let tx = 0, ty = 0, x = 0, y = 0, s = 0, ts = 0, raf = 0, rect = null, visible = true;

    const frame = () => {
      raf = 0;
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      s += (ts - s) * 0.2;
      d.style.setProperty('--px', x.toFixed(4));
      d.style.setProperty('--py', y.toFixed(4));
      d.style.setProperty('--sy', s.toFixed(2));
      if (Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005 || Math.abs(ts - s) > 0.05) kick();
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    if (fine) {
      host.addEventListener('pointerenter', () => { rect = host.getBoundingClientRect(); });
      host.addEventListener('pointermove', e => {
        rect = rect || host.getBoundingClientRect();
        tx = (e.clientX - rect.left) / rect.width - 0.5;
        ty = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
        kick();
      }, { passive: true });
      host.addEventListener('pointerleave', () => { tx = 0; ty = 0; rect = null; kick(); });
    }

    // Scroll depth: nearer layers slide faster, so the scene opens up as you read on.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
    }
    const onScroll = () => {
      rect = null;
      if (!visible) return;
      ts = Math.min(window.scrollY, host.offsetHeight);
      kick();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    document.querySelectorAll('.hero').forEach(h => mount(h, false));
    document.querySelectorAll('.topic-header').forEach(h => mount(h, true));
    // Split "4. Title" in the contents lists so the number can be styled on its own.
    document.querySelectorAll('.toc-list a').forEach(a => {
      const m = /^(\d+[a-z]?)\.\s+(.*)$/.exec(a.textContent.trim());
      if (!m || a.querySelector('.toc-num')) return;
      a.textContent = '';
      const num = document.createElement('span');
      num.className = 'toc-num';
      num.textContent = m[1];
      const label = document.createElement('span');
      label.textContent = m[2];
      a.append(num, label);
    });
    const crumb = document.querySelector('.topic-breadcrumb');
    if (crumb && /Year 11/.test(crumb.textContent)) document.documentElement.classList.add('pc-y11');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
