/* Programming for the Web: CSS specificity and cascade explorer.
   Part A counts the (IDs, classes, elements) specificity of any selector and compares two.
   Part B resolves the cascade for one element of the Course Specifications' HTML example:
   which declaration wins each property, and why the others lose.
   Vanilla JS; the widget host contains a text fallback if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  let uidCounter = 0;
  const uid = () => 'web-' + (++uidCounter);

  /* ---------- Part A: specificity ---------- */

  /* Split a selector list on commas that are not inside brackets or parentheses. */
  function splitList(sel) {
    const parts = [];
    let depth = 0, cur = '';
    for (const ch of sel) {
      if (ch === '(' || ch === '[') depth++;
      if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
    }
    parts.push(cur);
    return parts.map(p => p.trim()).filter(Boolean);
  }

  const cmp = (x, y) => {
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
    return 0;
  };

  /* Returns { a, b, c, ids, classes, types } for ONE complex selector. */
  function specificity(input) {
    let s = input.replace(/\/\*[\s\S]*?\*\//g, ' ').trim();
    const r = { a: 0, b: 0, c: 0, ids: [], classes: [], types: [] };
    s = s.replace(/\[[^\]]*\]/g, m => { r.b++; r.classes.push(m); return ' '; });
    s = s.replace(/:where\([^)]*\)/g, ' ');
    s = s.replace(/:(not|is|has)\(([^)]*)\)/g, (m, name, inner) => {
      const parts = splitList(inner).map(specificity);
      if (parts.length) {
        const top = parts.reduce((best, p) => (cmp([p.a, p.b, p.c], [best.a, best.b, best.c]) > 0 ? p : best));
        r.a += top.a; r.b += top.b; r.c += top.c;
        r.ids.push(...top.ids); r.classes.push(...top.classes); r.types.push(...top.types);
      }
      return ' ';
    });
    s = s.replace(/#[\w-]+/g, m => { r.a++; r.ids.push(m); return ' '; });
    s = s.replace(/\.[\w-]+/g, m => { r.b++; r.classes.push(m); return ' '; });
    s = s.replace(/::[\w-]+(\([^)]*\))?/g, m => { r.c++; r.types.push(m); return ' '; });
    s = s.replace(/:[\w-]+(\([^)]*\))?/g, m => { r.b++; r.classes.push(m); return ' '; });
    s.replace(/[>+~]/g, ' ').split(/\s+/).forEach(t => {
      if (/^[a-zA-Z][\w-]*$/.test(t)) { r.c++; r.types.push(t); }
    });
    return r;
  }
  const tuple = r => `(${r.a}, ${r.b}, ${r.c})`;

  /* ---------- Part B: the cascade ---------- */

  const FRAGMENT = [
    '<body>',
    '  <h1>Welcome!</h1>',
    '  <p id="welcome">Welcome to my website!</p>',
    '  <p class="red-text">This text should be red</p>',
    '  <p>My website also has <span class="red-text">red text</span> here</p>',
    '</body>'
  ];
  const ELEMENTS = [
    { id: 'h1', label: 'h1', path: 'h1', text: 'Welcome!' },
    { id: 'welcome', label: 'p#welcome', path: 'p#welcome', text: 'Welcome to my website!' },
    { id: 'red-p', label: 'p.red-text', path: 'p.red-text', text: 'This text should be red' },
    { id: 'plain', label: 'p (plain)', path: 'p:not([id]):not([class])', text: 'My website also has ' },
    { id: 'span', label: 'span.red-text', path: 'span.red-text', text: 'red text' }
  ];
  const RULES = [
    { id: 'r1', selector: 'p', decls: [['color', 'black']], on: true },
    { id: 'r2', selector: '.red-text', decls: [['color', 'red']], on: true },
    { id: 'r3', selector: '#welcome', decls: [['font-style', 'italic'], ['color', 'blue']], on: true },
    { id: 'r4', selector: 'h1', decls: [['font-size', '18px']], on: true },
    { id: 'r5', selector: 'body p', decls: [['color', 'gray']], on: false },
    { id: 'r6', selector: 'p.red-text', decls: [['color', 'darkred'], ['font-weight', 'bold']], on: false },
    { id: 'r7', selector: 'p', decls: [['color', 'green', true]], on: false }
  ];
  const INLINE_VALUE = 'purple';

  function buildDom() {
    const doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = FRAGMENT.slice(1, -1).join('\n');
    const found = {};
    ELEMENTS.forEach(e => { found[e.id] = doc.body.querySelector(e.path); });
    return found;
  }

  function build(host) {
    const dom = buildDom();
    const state = { a: '#welcome', b: 'p.red-text', el: 'red-p', on: new Set(RULES.filter(r => r.on).map(r => r.id)), inline: false, reverse: false };
    host.replaceChildren();
    host.append(el('h4', null, 'CSS specificity and cascade explorer'));
    host.append(el('p', 'web-lead', 'Part A counts the specificity of a selector and compares two. Part B applies a small style sheet to the Course Specifications’ HTML example and shows which declaration wins for each property, and why the others lose.'));

    /* ----- Part A ----- */
    const partA = el('section', 'web-part');
    partA.append(el('h5', null, 'A. Specificity calculator'));
    const inputs = el('div', 'web-inputs');
    const mkInput = (key, label) => {
      const id = uid();
      const wrap = el('div', 'web-field');
      const lab = el('label', null, label); lab.htmlFor = id;
      const inp = el('input'); inp.type = 'text'; inp.id = id; inp.value = state[key];
      inp.spellcheck = false; inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'off');
      inp.addEventListener('input', () => { state[key] = inp.value; renderA(); });
      wrap.append(lab, inp);
      inputs.append(wrap);
      return inp;
    };
    const inpA = mkInput('a', 'Selector A');
    const inpB = mkInput('b', 'Selector B');
    partA.append(inputs);

    const presets = el('div', 'web-presets');
    presets.append(el('span', 'web-presets-label', 'Try:'));
    ['p', '.red-text', 'p.red-text', '#welcome', 'body p', 'nav ul li a:hover', '#menu .item:not(.off)', 'a[href^="https"]'].forEach(sel => {
      const b = el('button', 'web-chip', sel); b.type = 'button';
      b.addEventListener('click', () => {
        const active = document.activeElement === inpB ? 'b' : 'a';
        state[active] = sel; (active === 'a' ? inpA : inpB).value = sel; renderA();
      });
      presets.append(b);
    });
    partA.append(presets);
    partA.append(el('p', 'web-hint', 'A preset button fills the box you last typed in (Selector A if neither).'));

    const outA = el('div', 'web-outA');
    outA.setAttribute('aria-live', 'polite');
    partA.append(outA);

    const cell = (label, count, items) => {
      const c = el('div', 'web-count');
      c.append(el('span', 'web-count-n', String(count)), el('span', 'web-count-l', label), el('code', 'web-count-i', items.length ? items.join('  ') : 'none'));
      return c;
    };
    const describe = sel => {
      const list = splitList(sel);
      const box = el('div', 'web-spec');
      if (!list.length) { box.append(el('p', 'web-note', 'Type a selector to count it.')); return { box, value: null }; }
      const results = list.map(specificity);
      const main = results.reduce((best, r) => (cmp([r.a, r.b, r.c], [best.a, best.b, best.c]) > 0 ? r : best));
      const counts = el('div', 'web-counts');
      counts.append(cell('IDs', main.a, main.ids), cell('classes, attributes, pseudo-classes', main.b, main.classes), cell('elements, pseudo-elements', main.c, main.types));
      box.append(counts);
      const line = el('p', 'web-tuple');
      line.append(document.createTextNode('Specificity '), el('strong', null, tuple(main)));
      if (list.length > 1) line.append(document.createTextNode(' (the highest of the ' + list.length + ' selectors in the list; each is scored separately)'));
      box.append(line);
      return { box, value: [main.a, main.b, main.c] };
    };
    function renderA() {
      outA.replaceChildren();
      const cols = el('div', 'web-two');
      const A = describe(state.a), B = describe(state.b);
      const ca = el('div'); ca.append(el('h6', null, 'A: ' + (state.a.trim() || '(empty)')), A.box);
      const cb = el('div'); cb.append(el('h6', null, 'B: ' + (state.b.trim() || '(empty)')), B.box);
      cols.append(ca, cb);
      outA.append(cols);
      if (A.value && B.value) {
        const c = cmp(A.value, B.value);
        const verdict = el('p', 'web-verdict');
        if (c === 0) verdict.textContent = 'Same specificity. If both rules match the same element and set the same property, the one that appears later in the style sheet wins.';
        else {
          const w = c > 0 ? 'A' : 'B', lo = c > 0 ? 'B' : 'A';
          const hi = c > 0 ? A.value : B.value, low = c > 0 ? B.value : A.value;
          const i = hi.findIndex((v, k) => v !== low[k]);
          const cat = ['IDs', 'classes, attributes and pseudo-classes', 'elements'][i];
          verdict.textContent = `${w} wins: it has more ${cat} (${hi[i]} against ${low[i]}). Columns are compared left to right, so no number of lower columns can beat ${lo}’s higher one.`;
        }
        outA.append(verdict);
      }
    }
    host.append(partA);

    /* ----- Part B ----- */
    const partB = el('section', 'web-part');
    partB.append(el('h5', null, 'B. Which declaration wins?'));
    const pre = el('pre', 'web-frag');
    const preCode = el('code'); preCode.textContent = FRAGMENT.join('\n');
    pre.append(preCode);
    partB.append(pre);

    const grid = el('div', 'web-grid');
    const left = el('div');
    const right = el('div');

    /* element choice */
    const fsEl = el('fieldset');
    fsEl.append(el('legend', null, 'Element to inspect'));
    const choices = el('div', 'web-choices');
    const nameEl = 'el-' + uid();
    ELEMENTS.forEach(e => {
      const lab = el('label', 'web-choice');
      const inp = el('input'); inp.type = 'radio'; inp.name = nameEl; inp.value = e.id; inp.checked = e.id === state.el;
      inp.addEventListener('change', () => { state.el = e.id; renderB(); });
      lab.append(inp, el('span', null, e.label));
      choices.append(lab);
    });
    fsEl.append(choices);
    left.append(fsEl);

    /* rule toggles */
    const fsRules = el('fieldset');
    fsRules.append(el('legend', null, 'Style sheet (tick a rule to include it)'));
    const checks = el('div', 'web-checks');
    RULES.forEach(r => {
      const lab = el('label', 'web-check');
      const inp = el('input'); inp.type = 'checkbox'; inp.checked = state.on.has(r.id);
      inp.addEventListener('change', () => { inp.checked ? state.on.add(r.id) : state.on.delete(r.id); renderB(); });
      const code = el('code');
      code.textContent = r.selector + ' { ' + r.decls.map(d => `${d[0]}: ${d[1]}${d[2] ? ' !important' : ''};`).join(' ') + ' }';
      lab.append(inp, code);
      checks.append(lab);
    });
    const labIn = el('label', 'web-check');
    const inpIn = el('input'); inpIn.type = 'checkbox';
    inpIn.addEventListener('change', () => { state.inline = inpIn.checked; renderB(); });
    const codeIn = el('code'); codeIn.textContent = `style="color: ${INLINE_VALUE}" on the inspected element`;
    labIn.append(inpIn, codeIn);
    checks.append(labIn);
    const labRev = el('label', 'web-check');
    const inpRev = el('input'); inpRev.type = 'checkbox';
    inpRev.addEventListener('change', () => { state.reverse = inpRev.checked; renderB(); });
    labRev.append(inpRev, el('span', null, 'Reverse the order of the rules in the style sheet'));
    checks.append(labRev);
    fsRules.append(checks);
    left.append(fsRules);

    /* output */
    const out = el('div');
    out.setAttribute('aria-live', 'polite');
    const heading = el('p', 'web-target');
    const table = el('div', 'web-tables');
    const paint = el('div', 'web-paint');
    const note = el('p', 'web-note');
    out.append(heading, table, el('p', 'web-paint-label', 'What the browser paints (the inspected element has a dashed outline)'), paint, note);
    right.append(out);
    grid.append(left, right);
    partB.append(grid);
    host.append(partB);

    const orderedRules = () => (state.reverse ? RULES.slice().reverse() : RULES.slice());

    /* Candidates for one element: every declaration from an enabled, matching rule. */
    function candidates(id) {
      const node = dom[id];
      const list = [];
      orderedRules().forEach((r, idx) => {
        if (!state.on.has(r.id) || !node.matches(r.selector)) return;
        const s = specificity(r.selector);
        r.decls.forEach(d => list.push({ prop: d[0], value: d[1], important: !!d[2], inline: false, spec: [s.a, s.b, s.c], order: idx, from: r.selector }));
      });
      if (state.inline && id === state.el) list.push({ prop: 'color', value: INLINE_VALUE, important: false, inline: true, spec: [0, 0, 0], order: 99, from: 'inline style' });
      return list;
    }
    /* Higher rank wins: !important, then inline style, then specificity, then later order. */
    const rank = c => [c.important ? 1 : 0, c.inline ? 1 : 0, ...c.spec, c.order];
    const better = (x, y) => cmp(rank(x), rank(y));
    function why(loser, winner) {
      if (winner.important !== loser.important) return 'not marked !important';
      if (winner.inline !== loser.inline) return 'an inline style beats any selector';
      const c = cmp(winner.spec, loser.spec);
      if (c !== 0) return `lower than the winner\u2019s ${tuple({ a: winner.spec[0], b: winner.spec[1], c: winner.spec[2] })}`;
      return 'same specificity, but earlier in the style sheet';
    }
    function resolve(id) {
      const byProp = {};
      candidates(id).forEach(c => { (byProp[c.prop] = byProp[c.prop] || []).push(c); });
      Object.keys(byProp).forEach(p => byProp[p].sort((x, y) => better(y, x)));
      return byProp;
    }

    const specText = c => (c.inline ? 'inline' : tuple({ a: c.spec[0], b: c.spec[1], c: c.spec[2] })) + (c.important ? ' !important' : '');

    function renderB() {
      const cur = ELEMENTS.find(e => e.id === state.el);
      heading.replaceChildren(document.createTextNode('Inspecting '), el('code', null, cur.label));
      const byProp = resolve(state.el);
      table.replaceChildren();
      const props = Object.keys(byProp);
      let winnersWithLosers = 0;
      if (!props.length) {
        table.append(el('p', 'web-note', 'No enabled rule matches this element, so it uses inherited values or the browser’s defaults.'));
      }
      props.forEach(p => {
        const box = el('div', 'web-prop');
        box.append(el('h6', null, p));
        const ul = el('ul', 'web-cands');
        byProp[p].forEach((c, i) => {
          const li = el('li', i === 0 ? 'is-win' : 'is-lose');
          const head = el('span', 'web-cand-head');
          head.append(el('code', null, `${c.from} { ${p}: ${c.value}${c.important ? ' !important' : ''}; }`));
          head.append(el('span', 'web-badge', i === 0 ? 'wins' : 'loses'));
          li.append(head);
          li.append(el('span', 'web-cand-sub', `specificity ${specText(c)}` + (i === 0 ? '' : ': ' + why(c, byProp[p][0]))));
          ul.append(li);
        });
        if (byProp[p].length > 1) winnersWithLosers++;
        box.append(ul);
        table.append(box);
      });

      /* preview of all five elements */
      paint.replaceChildren();
      const styled = {};
      ELEMENTS.forEach(e => {
        const props2 = resolve(e.id);
        const st = {};
        Object.keys(props2).forEach(p => { st[p] = props2[p][0].value; });
        styled[e.id] = st;
      });
      const apply = (node, id) => {
        const st = styled[id];
        Object.keys(st).forEach(p => node.style.setProperty(p, st[p]));
        if (id === state.el) node.classList.add('is-target');
      };
      /* A div with a heading role: the preview is a picture of a page, so it must not add a second <h1> to this one */
      const h1 = el('div', 'web-p-h1', 'Welcome!'); h1.setAttribute('role', 'heading'); h1.setAttribute('aria-level', '4'); apply(h1, 'h1');
      const p1 = el('p', 'web-p', 'Welcome to my website!'); apply(p1, 'welcome');
      const p2 = el('p', 'web-p', 'This text should be red'); apply(p2, 'red-p');
      const p3 = el('p', 'web-p');
      p3.append(document.createTextNode('My website also has '));
      const sp = el('span', null, 'red text'); apply(sp, 'span');
      p3.append(sp, document.createTextNode(' here'));
      /* the plain paragraph's own style goes on p3 (its text is a child of p3) */
      const st3 = styled.plain; Object.keys(st3).forEach(p => p3.style.setProperty(p, st3[p]));
      if (state.el === 'plain') p3.classList.add('is-target');
      paint.append(h1, p1, p2, p3);

      note.textContent = winnersWithLosers
        ? 'Where a property has more than one candidate, the browser ranks them: !important first, then an inline style, then specificity (IDs, then classes, then elements), and finally the later rule. Turn rules on and off to see the order change.'
        : 'Only one declaration matches each property here, so there is no conflict to resolve. Tick more rules to create one.';
    }

    renderA();
    renderB();
  }

  document.querySelectorAll('.web-widget[data-web="css-cascade"]').forEach(host => {
    try { build(host); } catch (e) { /* leave the static fallback in place */ }
  });
})();
