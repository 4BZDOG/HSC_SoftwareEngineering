/* ============================================================
   Mermaid diagram initialisation + dark-mode re-rendering.
   Shared across all topic pages. Requires mermaid to be loaded.
   ============================================================ */

(() => {
  if (typeof mermaid === 'undefined') return;

  const DARK_FILL_MAP = {
    '#e3f2fd': '#172340', '#bbdefb': '#172340', '#e1f5ff': '#172340',
    '#b3e5fc': '#172340', '#e1f5fe': '#172340',
    '#e8f5e9': '#17291c', '#c8e6c9': '#17291c', '#f1f8e9': '#17291c',
    '#fff9c4': '#2a2617', '#ffe082': '#2a2617',
    '#ffcdd2': '#2e1a1f', '#fce4ec': '#2e1a1f', '#ffebee': '#2e1a1f',
    '#f3e5f5': '#231730', '#ede7f6': '#231730',
    '#ffccbc': '#2e2217', '#fff3e0': '#2e2217', '#ffab91': '#2e2217',
    '#ffb347': '#2e2217', '#ffe4b5': '#2e2217',
    '#f8bbd0': '#2e1a24',
    '#90ee90': '#1a3a1a',
    '#f0f4c3': '#262917',
    '#87ceeb': '#172a3a',
    '#e0f2f1': '#1e293b', '#eceff1': '#1e293b', '#f5f5f5': '#1e293b',
    '#e0e7ff': '#1e2a4a', '#ddd6fe': '#231740', '#c7d2fe': '#1e2a4a',
    '#f0f4ff': '#1a2340',
    '#dbeafe': '#172340', '#f3e8ff': '#231730', '#dcfce7': '#17291c',
    '#e1f5ff': '#172340', '#01579b': '#60a5fa',
    '#c8e6c9': '#17291c', '#2e7d32': '#4ade80',
    '#fff3e0': '#2e2217', '#e65100': '#fb923c',
    '#e0f0ff': '#172a3a', '#0277bd': '#38bdf8'
  };

  const DIM_STROKES = new Set(['#333', '#333333', '#999', '#999999']);

  function applyDarkTint() {
    document.querySelectorAll('.mermaid svg [fill]').forEach(el => {
      const fill = el.getAttribute('fill');
      if (!fill) return;
      const key = fill.toLowerCase();
      if (DARK_FILL_MAP[key]) el.setAttribute('fill', DARK_FILL_MAP[key]);
    });

    document.querySelectorAll('.mermaid svg text, .mermaid svg tspan').forEach(node => {
      const currentFill = (node.getAttribute('fill') || '').toLowerCase();
      if (currentFill === '#000' || currentFill === '#000000' || currentFill === '#01579b' ||
          currentFill === '#e65100' || currentFill === '#0277bd' ||
          currentFill === '' || currentFill === 'rgb(0, 0, 0)') {
        node.setAttribute('fill', '#e2e8f0');
        node.style.fill = '#e2e8f0';
      }
    });

    document.querySelectorAll('.mermaid svg [stroke]').forEach(el => {
      const s = (el.getAttribute('stroke') || '').toLowerCase();
      if (DIM_STROKES.has(s)) {
        el.setAttribute('stroke', '#64748b');
      }
      if (s === '#01579b') el.setAttribute('stroke', '#60a5fa');
      if (s === '#e65100') el.setAttribute('stroke', '#fb923c');
      if (s === '#2e7d32') el.setAttribute('stroke', '#4ade80');
      if (s === '#f57f17') el.setAttribute('stroke', '#fbbf24');
      if (s === '#0277bd') el.setAttribute('stroke', '#38bdf8');
      if (s === '#c62828') el.setAttribute('stroke', '#f87171');
      if (s === '#1976d2') el.setAttribute('stroke', '#60a5fa');
      if (s === '#6a1b9a') el.setAttribute('stroke', '#d084fc');
      if (s === '#c2185b') el.setAttribute('stroke', '#fb7185');
    });

    document.querySelectorAll('.mermaid svg [fill]').forEach(el => {
      const fill = (el.getAttribute('fill') || '').toLowerCase();
      if (fill === '#01579b') el.setAttribute('fill', '#60a5fa');
      if (fill === '#e65100') el.setAttribute('fill', '#fb923c');
      if (fill === '#0277bd') el.setAttribute('fill', '#38bdf8');
    });
  }

  function getThemeConfig(isDark) {
    return {
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear',
        diagramMarginX: 20,
        diagramMarginY: 20
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 60,
        diagramMarginY: 20,
        actorMargin: 60
      },
      class: { useMaxWidth: true, htmlLabels: true },
      state: { useMaxWidth: true, diagramMarginX: 20, diagramMarginY: 20 },
      themeVariables: {
        fontSize: '14px',
        fontFamily: 'Inter, system-ui, sans-serif',
        primaryColor: isDark ? '#1e293b' : '#e7ebf9',
        primaryBorderColor: isDark ? '#475569' : '#c2cdf0',
        primaryTextColor: isDark ? '#f1f5f9' : '#0f172a',
        secondBkgColor: isDark ? '#334155' : '#f3f2ec',
        secondBorderColor: isDark ? '#475569' : '#aab8ec',
        tertiaryColor: isDark ? '#475569' : '#ece9e0',
        tertiaryBorderColor: isDark ? '#64748b' : '#ccc',
        tertiaryTextColor: isDark ? '#cbd5e1' : '#0f172a',
        noteBkgColor: isDark ? '#1e293b' : '#fff9e6',
        noteBorderColor: isDark ? '#475569' : '#ccc',
        noteTextColor: isDark ? '#f1f5f9' : '#0f172a',
        textColor: isDark ? '#f1f5f9' : '#0f172a',
        lineColor: isDark ? '#475569' : '#ccc',
        signalColor: isDark ? '#cbd5e1' : '#333',
        signalTextColor: isDark ? '#f1f5f9' : '#000'
      }
    };
  }

  function storeOriginalSources() {
    document.querySelectorAll('.mermaid').forEach(el => {
      if (!el.dataset.source) {
        el.dataset.source = el.textContent.trim();
      }
    });
  }

  async function renderAll() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    mermaid.initialize(getThemeConfig(isDark));

    const diagrams = document.querySelectorAll('.mermaid');
    for (const el of diagrams) {
      const source = el.dataset.source;
      if (!source) continue;

      const id = 'mermaid-' + Math.random().toString(36).slice(2, 10);
      try {
        const { svg } = await mermaid.render(id, source);
        el.innerHTML = svg;
      } catch (e) {
        console.warn('Mermaid render error:', e);
      }
    }

    if (isDark) {
      requestAnimationFrame(() => applyDarkTint());
    }
  }

  storeOriginalSources();
  renderAll();

  let themeChangeQueued = false;
  new MutationObserver(() => {
    if (themeChangeQueued) return;
    themeChangeQueued = true;
    requestAnimationFrame(() => {
      themeChangeQueued = false;
      renderAll();
    });
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();
