/* ============================================================
   Mermaid diagram initialisation + dark-mode re-rendering.
   Shared across all topic pages. Requires mermaid to be loaded.
   ============================================================ */

(() => {
  if (typeof mermaid === 'undefined') return;

  /* Paper-cut palette. Hand-written diagram styles use dozens of ad-hoc
     colours; every fill is snapped to the nearest paper tone by hue so all
     diagrams share one palette, and all strokes and text become ink. */
  const PALETTE = {
    light: {
      neutral: '#fbf7ee', good: '#bff0cf', bad: '#ffd2cf', warn: '#fbe3a6',
      info: '#d5e6e4', accent: '#e2dcff', rose: '#f6d3e2',
      ink: '#1c1a17', line: '#4a443b', text: '#1c1a17', cluster: '#f4ecdb'
    },
    dark: {
      neutral: '#2e2a24', good: '#1f3a2a', bad: '#472825', warn: '#43371c',
      info: '#1f3534', accent: '#2d2750', rose: '#44263a',
      ink: '#cfc5b1', line: '#a1978a', text: '#efe7d6', cluster: '#25221d'
    }
  };

  function hexToHsl(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let hue = 0, sat = 0;
    if (max !== min) {
      const d = max - min;
      sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      hue *= 60;
    }
    return { h: hue, s: sat, l };
  }

  function toneFor(hex) {
    const c = hexToHsl(hex);
    if (!c) return null;
    if (c.s < 0.18 || (c.l > 0.93 && c.s < 0.5)) return 'neutral';
    const h = c.h;
    if (h < 18 || h >= 345) return 'bad';
    if (h < 68) return 'warn';
    if (h < 165) return 'good';
    if (h < 250) return 'info';
    if (h < 300) return 'accent';
    return 'rose';
  }

  function recolour(css, pal) {
    return css
      .replace(/(fill\s*:\s*)(#[0-9a-fA-F]{3,6})/g, (m, pre, hex) => {
        const t = toneFor(hex);
        return t ? pre + pal[t] : m;
      })
      .replace(/(stroke\s*:\s*)(#[0-9a-fA-F]{3,6})/g, (m, pre) => pre + pal.ink)
      .replace(/((?:^|[;\s])color\s*:\s*)(#[0-9a-fA-F]{3,6}|white|black)/g, (m, pre) => pre + pal.text)
      .replace(/stroke-width\s*:\s*[\d.]+px/g, 'stroke-width:1.4px');
  }

  // Author styles live in `style X ...` / `classDef` lines; rewrite them in
  // the source so Mermaid lays out and paints with the unified palette.
  function normaliseSource(src, pal) {
    return src.split('\n').map(line => {
      if (/^\s*(style|classDef)\s/.test(line)) return recolour(line, pal);
      return line;
    }).join('\n');
  }

  function getThemeConfig(isDark) {
    const p = isDark ? PALETTE.dark : PALETTE.light;
    return {
      startOnLoad: false,
      theme: 'base',
      htmlLabels: false,
      markdownAutoWrap: false,
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: false,
        curve: 'basis',
        padding: 14,
        nodeSpacing: 42,
        rankSpacing: 48,
        diagramMarginX: 16,
        diagramMarginY: 16
      },
      sequence: { useMaxWidth: true, diagramMarginX: 40, diagramMarginY: 16, actorMargin: 56, mirrorActors: false },
      class: { useMaxWidth: true, htmlLabels: false },
      state: { useMaxWidth: true },
      themeVariables: {
        fontSize: '14px',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'transparent',
        primaryColor: p.neutral,
        primaryBorderColor: p.ink,
        primaryTextColor: p.text,
        secondaryColor: p.info,
        secondaryBorderColor: p.ink,
        secondaryTextColor: p.text,
        tertiaryColor: p.cluster,
        tertiaryBorderColor: p.line,
        tertiaryTextColor: p.text,
        mainBkg: p.neutral,
        nodeBorder: p.ink,
        clusterBkg: p.cluster,
        clusterBorder: p.line,
        titleColor: p.text,
        edgeLabelBackground: isDark ? '#26231e' : '#f4ecdb',
        lineColor: p.line,
        textColor: p.text,
        noteBkgColor: p.warn,
        noteBorderColor: p.ink,
        noteTextColor: p.text,
        actorBkg: p.neutral,
        actorBorder: p.ink,
        actorTextColor: p.text,
        actorLineColor: p.line,
        signalColor: p.line,
        signalTextColor: p.text,
        labelBoxBkgColor: p.neutral,
        labelBoxBorderColor: p.ink,
        labelTextColor: p.text,
        loopTextColor: p.text,
        activationBkgColor: p.accent,
        activationBorderColor: p.ink,
        sequenceNumberColor: isDark ? '#1b1916' : '#fbf7ee',
        // gantt / quadrant / state
        sectionBkgColor: p.info,
        altSectionBkgColor: p.neutral,
        sectionBkgColor2: p.warn,
        taskBkgColor: p.good,
        taskBorderColor: p.ink,
        taskTextColor: p.text,
        taskTextDarkColor: p.text,
        activeTaskBkgColor: p.warn,
        activeTaskBorderColor: p.ink,
        doneTaskBkgColor: p.cluster,
        doneTaskBorderColor: p.line,
        critBkgColor: p.bad,
        critBorderColor: p.ink,
        gridColor: p.line,
        todayLineColor: '#c4553b',
        quadrant1Fill: p.good, quadrant2Fill: p.info, quadrant3Fill: p.neutral, quadrant4Fill: p.warn,
        quadrant1TextFill: p.text, quadrant2TextFill: p.text, quadrant3TextFill: p.text, quadrant4TextFill: p.text,
        quadrantPointFill: '#c4553b', quadrantPointTextFill: p.text,
        quadrantTitleFill: p.text, quadrantXAxisTextFill: p.text, quadrantYAxisTextFill: p.text,
        quadrantInternalBorderStrokeFill: p.line, quadrantExternalBorderStrokeFill: p.ink,
        classText: p.text,
        labelColor: p.text,
        altBackground: p.cluster
      }
    };
  }

  // The diagram source is authored with literal <br/> tags for multi-line node
  // labels. The browser parses those into real <br> elements, and textContent
  // would silently drop them (merging the lines). Convert each <br> back into the
  // literal "<br/>" text Mermaid expects before reading the source.
  function extractSource(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => {
      br.replaceWith(document.createTextNode('<br/>'));
    });
    return clone.textContent.trim();
  }

  function storeOriginalSources() {
    document.querySelectorAll('.mermaid').forEach(el => {
      if (!el.dataset.source) {
        el.dataset.source = extractSource(el);
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
        const pal = isDark ? PALETTE.dark : PALETTE.light;
        const { svg } = await mermaid.render(id, normaliseSource(source, pal));
        el.innerHTML = svg;
      } catch (e) {
        console.warn('Mermaid render error:', e);
      }
    }

  }

  storeOriginalSources();

  // Mermaid measures HTML labels to size nodes. If it runs before the web fonts
  // have loaded, those measurements can be wildly off and the diagram renders
  // with a huge viewBox (microscopic, illegible). Wait for fonts to settle first.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(renderAll, renderAll);
  } else {
    renderAll();
  }

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
