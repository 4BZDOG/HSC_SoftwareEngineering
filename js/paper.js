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

  function scene(compact) {
    const g = LAYERS.map(l =>
      `<g class="pc-layer" style="--d:${l.d}"><path class="${l.cls}" d="${l.path}"/></g>`
    );
    const glyphs = compact ? '' : GLYPHS.map(([t, x, y, d]) =>
      `<g class="pc-layer" style="--d:${d}"><text class="pc-glyph" x="${x}" y="${y}" filter="url(#pc-cast)">${t}</text></g>`
    ).join('');
    return `<svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs><filter id="pc-cast" x="-10%" y="-40%" width="120%" height="180%">
        <feDropShadow dx="0" dy="-3" stdDeviation="3.5" flood-color="#3b2a12" flood-opacity=".28"/>
      </filter></defs>
      <g class="pc-layer" style="--d:2"><circle class="pc-sun" cx="${compact ? 1260 : 1180}" cy="${compact ? 120 : 96}" r="${compact ? 34 : 46}" filter="url(#pc-cast)"/></g>
      ${glyphs}${g.join('')}
    </svg>`;
  }

  function mount(host, compact) {
    if (host.querySelector('.pc-diorama')) return;
    const d = document.createElement('div');
    d.className = 'pc-diorama';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = scene(compact);
    host.prepend(d);
    if (reduce.matches) return;
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect();
      d.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      d.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3) * 0.4);
    });
    host.addEventListener('pointerleave', () => {
      d.style.setProperty('--px', 0);
      d.style.setProperty('--py', 0);
    });
  }

  function init() {
    document.querySelectorAll('.hero').forEach(h => mount(h, false));
    document.querySelectorAll('.topic-header').forEach(h => mount(h, true));
    const crumb = document.querySelector('.topic-breadcrumb');
    if (crumb && /Year 11/.test(crumb.textContent)) document.documentElement.classList.add('pc-y11');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
