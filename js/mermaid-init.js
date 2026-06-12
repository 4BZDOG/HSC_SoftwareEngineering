/* ============================================================
   Mermaid diagram initialisation + dark-mode tinting.
   Shared across all topic pages. Requires mermaid to be loaded.
   ============================================================ */

(() => {
  if (typeof mermaid === 'undefined') return;

  // Light-fill → tinted-dark-fill replacements applied after render.
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
    '#f0f4ff': '#1a2340'
  };

  const DIM_STROKES = new Set(['#333', '#333333', '#999', '#999999']);

  function applyDarkTint() {
    document.querySelectorAll('.mermaid svg [fill]').forEach(el => {
      const fill = el.getAttribute('fill');
      if (!fill) return;
      const mapped = DARK_FILL_MAP[fill.toLowerCase()];
      if (mapped) el.setAttribute('fill', mapped);
    });

    document.querySelectorAll('.mermaid svg text, .mermaid svg tspan').forEach(node => {
      node.setAttribute('fill', '#e2e8f0');
      node.style.fill = '#e2e8f0';
    });

    document.querySelectorAll('.mermaid svg [stroke]').forEach(el => {
      const s = el.getAttribute('stroke');
      if (s && DIM_STROKES.has(s.toLowerCase())) {
        el.setAttribute('stroke', '#64748b');
      }
    });
  }

  function initMermaid() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    mermaid.initialize({
      startOnLoad: true,
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
      class: {
        useMaxWidth: true,
        htmlLabels: true
      },
      state: {
        useMaxWidth: true,
        diagramMarginX: 20,
        diagramMarginY: 20
      },
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
    });

    mermaid.contentLoaded();

    if (isDark) {
      // Wait for the SVG to render before rewriting fills/strokes.
      setTimeout(applyDarkTint, 150);
    }
  }

  initMermaid();

  // Re-render whenever the theme attribute toggles.
  new MutationObserver(initMermaid).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();
