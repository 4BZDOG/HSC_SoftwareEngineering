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

/* Programming for the Web: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Which protocol? A practice set pairing a job with its protocol and port.
   2. IPv4 explorer: an address as four octets, in binary, with its network and host parts.
   3. Page load explorer: a waterfall of the requests a page makes, and how compression, caching, a CDN and lazy loading change it.
   4. Responsive layout explorer: change the screen width and see which CSS media queries apply.
   5. Git sandbox: commit, branch and merge (see js/gitlab.js).
   All numbers are illustrative. */
(() => {
  'use strict';
  const el = Labs.el;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- 1. Which protocol? ---------- */
  function buildProtocols(host) {
    Labs.sorter(host, {
      cls: 'web-protosort', keepCase: true,
      title: 'Which protocol?',
      lead: 'Read each job and choose the protocol that does it. The reason names the port as well, so learn each protocol as a pair: its job and its port.',
      noun: 'job', groupLabel: 'Protocol',
      choices: ['HTTP', 'HTTPS', 'FTP', 'SFTP', 'SMTP', 'POP3', 'IMAP', 'DNS'].map(k => ({ key: k, label: k })),
      items: [
        { text: 'A browser needs the IP address that belongs to the name example.com.', ans: 'DNS', why: 'The Domain Name System turns names into addresses. It uses port 53.' },
        { text: 'A developer uploads site files to a server and wants the login and the files encrypted on the way.', ans: 'SFTP', why: 'SFTP is file transfer inside an encrypted SSH connection, on port 22. It is not FTP with TLS added.' },
        { text: 'A phone and a laptop must both show the same inbox, with messages kept on the mail server.', ans: 'IMAP', why: 'IMAP leaves messages on the server and synchronises each device with it. Port 143, or 993 inside TLS.' },
        { text: 'A mail program downloads new messages to one computer and removes them from the server afterwards.', ans: 'POP3', why: 'POP3 collects mail rather than synchronising it. Port 110, or 995 inside TLS.' },
        { text: 'A mail server hands an outgoing message on to another mail server.', ans: 'SMTP', why: 'SMTP sends and relays mail; it does not collect it for a user. Port 25 between servers.' },
        { text: 'A shop\'s checkout page needs to protect card details while they cross the internet.', ans: 'HTTPS', why: 'HTTPS is HTTP inside a TLS-encrypted connection, on port 443, and the certificate lets the browser check who it is talking to.' },
        { text: 'A browser requests an ordinary web page that carries nothing private.', ans: 'HTTP', why: 'HTTP is the request and response protocol of the web, on port 80. Everything in it travels as readable text, so it suits only non-sensitive content.' },
        { text: 'An old tool moves files to a server and sends the password and the files as readable text.', ans: 'FTP', why: 'FTP moves files but does not encrypt anything. Port 21 for commands. Prefer SFTP.' }
      ],
      closing: 'Remember the common slips: SMTP sends but does not retrieve, POP3 downloads while IMAP synchronises, and TLS is a protocol that secures another protocol, not a port.'
    });
  }

  /* ---------- 2. IPv4 explorer ---------- */
  function buildIp(host) {
    Labs.shell(host, 'web-ip', 'IPv4 address explorer', 'An IPv4 address is 32 bits, written as four numbers from 0 to 255 called octets. Type one, see its bits, and move the slider to see which bits name the network and which name the device.');
    let prefix = 24;
    const row = el('div', 'lab-row');
    const f = el('div', 'lab-field'), l = el('label', null, 'IPv4 address'), inp = el('input'); l.htmlFor = inp.id = 'web-ip-in'; inp.type = 'text'; inp.value = '192.168.1.20'; inp.maxLength = 15; inp.inputMode = 'decimal'; inp.autocomplete = 'off'; f.append(l, inp);
    const f2 = el('div', 'lab-field'), l2 = el('label'), o2 = el('output'), r2 = el('input'); l2.htmlFor = r2.id = 'web-ip-pre'; l2.append(document.createTextNode('Network part: '), o2); r2.type = 'range'; r2.min = 8; r2.max = 30; r2.value = prefix; f2.append(l2, r2);
    const presets = el('div', 'lab-chips'); [['Home router', '192.168.1.20'], ['A public address', '203.0.113.45'], ['This computer', '127.0.0.1'], ['An invalid one', '300.1.2']].forEach(p => { const b = el('button', 'lab-chip', p[0]); b.type = 'button'; b.addEventListener('click', () => { inp.value = p[1]; update(); }); presets.append(b); });
    row.append(f, f2); host.append(row, presets);
    const bits = el('div', 'web-ip-bits'); bits.setAttribute('role', 'img');
    const out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    const stats = el('div', 'lab-stats');
    host.append(bits, stats, out);
    host.append(el('p', 'lab-note', 'The documentation range 203.0.113.0 to 203.0.113.255 is reserved for examples, so it is safe to use here. Real networks may split an address differently from the slider, which stands for a subnet mask written as a prefix such as /24.'));

    function parse(s) {
      const p = s.trim().split('.');
      if (p.length !== 4) return { err: 'An IPv4 address has exactly four numbers separated by dots, for example 192.168.1.20. This has ' + p.length + '.' };
      for (const x of p) { if (!/^\d{1,3}$/.test(x)) return { err: '"' + x + '" is not a whole number. Each part must be digits only.' }; if (+x > 255) return { err: x + ' is too large. Each part (octet) must be from 0 to 255, because it is stored in 8 bits.' }; }
      return { oct: p.map(Number) };
    }
    function kind(o) {
      if (o[0] === 10) return ['Private', 'Used inside homes and organisations (10.0.0.0 to 10.255.255.255). Not routed on the public internet.'];
      if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return ['Private', 'Used inside homes and organisations (172.16.0.0 to 172.31.255.255).'];
      if (o[0] === 192 && o[1] === 168) return ['Private', 'Used inside homes and organisations (192.168.0.0 to 192.168.255.255). A home router usually hands these out with DHCP.'];
      if (o[0] === 127) return ['Loopback', 'Always means "this computer". Traffic sent here never leaves the machine.'];
      if (o[0] === 169 && o[1] === 254) return ['Link-local', 'A device gives itself one of these when it cannot get an address from DHCP.'];
      if (o[0] >= 224) return ['Reserved', 'Used for multicast and other special purposes, not for ordinary devices.'];
      return ['Public', 'Can be reached over the internet, so it must be unique on the internet. It is assigned by an internet service provider.'];
    }
    function update() {
      o2.textContent = '/' + prefix + ' (' + prefix + ' network bits, ' + (32 - prefix) + ' host bits)';
      const r = parse(inp.value);
      bits.replaceChildren(); stats.replaceChildren();
      if (r.err) { out.className = 'lab-readout is-bad'; out.textContent = r.err; bits.setAttribute('aria-label', 'No valid address entered.'); return; }
      const o = r.oct;
      let n = 0;
      o.forEach((v, i) => {
        const g = el('div', 'web-ip-oct'); g.append(el('b', null, String(v)));
        const b = el('div', 'web-ip-b');
        v.toString(2).padStart(8, '0').split('').forEach(c => { const s = el('span', 'web-ip-bit ' + (n < prefix ? 'is-net' : 'is-host'), c); b.append(s); n++; });
        g.append(b); bits.append(g);
        if (i < 3) bits.append(el('span', 'web-ip-dot', '.'));
      });
      bits.setAttribute('aria-label', 'The address in binary: ' + o.map(v => v.toString(2).padStart(8, '0')).join('.') + '. The first ' + prefix + ' bits are the network part.');
      const num = o.reduce((a, v) => a * 256 + v, 0), mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0, net = (num & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
      const dot = x => [x >>> 24, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join('.');
      const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); stats.append(s); };
      stat('Network address', dot(net)); stat('Broadcast address', dot(bc)); stat('Usable device addresses', (Math.pow(2, 32 - prefix) - 2).toLocaleString('en-AU')); stat('Total possible IPv4 addresses', '2³² = 4,294,967,296');
      const k = kind(o);
      out.className = 'lab-readout'; out.replaceChildren(el('p', null, k[0] + ': ' + k[1]));
      out.append(el('p', null, 'The coloured bits (the first ' + prefix + ') identify the network and are the same for every device on it. The remaining bits identify one device within that network.'));
    }
    inp.addEventListener('input', update); r2.addEventListener('input', () => { prefix = +r2.value; update(); });
    update();
  }

  /* ---------- 3. Page load explorer ---------- */
  const RES = [
    { n: 'index.html', kb: 30, type: 'text', first: true },
    { n: 'styles.css', kb: 120, type: 'text', block: true },
    { n: 'app.js', kb: 450, type: 'text', block: true },
    { n: 'fonts.woff2', kb: 90, type: 'font', block: true },
    { n: 'hero.jpg', kb: 1800, type: 'img', block: true },
    { n: 'photo-1.jpg', kb: 600, type: 'img' }, { n: 'photo-2.jpg', kb: 600, type: 'img' }, { n: 'photo-3.jpg', kb: 600, type: 'img' }, { n: 'photo-4.jpg', kb: 600, type: 'img' }
  ];
  const FIXES = [
    ['minify', 'Minify the CSS and JavaScript (remove spaces and comments)'], ['compress', 'Compress text with gzip or Brotli'], ['images', 'Resize and compress the images'],
    ['lazy', 'Lazy-load the photos below the fold'], ['cdn', 'Serve from a CDN near the user (shorter round trip)'], ['cache', 'Repeat visit: files already cached by the browser']
  ];
  function buildPerf(host) {
    Labs.shell(host, 'web-perf', 'Page load explorer', 'A page makes nine requests. Each one costs a round trip plus the time to download its bytes. Turn on the techniques one at a time and watch the waterfall shrink. The page is "usable" when everything that blocks display has arrived.');
    const st = { mbps: 8, rtt: 100, fixes: {} };
    const row = el('div', 'lab-row');
    const f1 = el('div', 'lab-field'), l1 = el('label'), o1 = el('output'), i1 = el('input'); l1.htmlFor = i1.id = 'web-pf-bw'; l1.append(document.createTextNode('Connection speed: '), o1); i1.type = 'range'; i1.min = 2; i1.max = 100; i1.step = 1; i1.value = st.mbps; f1.append(l1, i1);
    const f2 = el('div', 'lab-field'), l2 = el('label'), o2 = el('output'), i2 = el('input'); l2.htmlFor = i2.id = 'web-pf-rtt'; l2.append(document.createTextNode('Round-trip time to the server: '), o2); i2.type = 'range'; i2.min = 10; i2.max = 300; i2.step = 10; i2.value = st.rtt; f2.append(l2, i2);
    row.append(f1, f2); host.append(row);
    const checks = el('div', 'web-pf-checks');
    FIXES.forEach(f => { const lb = el('label', 'lab-check'), c = el('input'); c.type = 'checkbox'; c.addEventListener('change', () => { st.fixes[f[0]] = c.checked; update(); }); lb.append(c, document.createTextNode(f[1])); checks.append(lb); });
    host.append(checks);
    const chart = el('div', 'web-pf-chart'); chart.setAttribute('role', 'img');
    const stats = el('div', 'lab-stats'); const out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    host.append(chart, stats, out);
    host.append(el('p', 'lab-note', 'A simple model: the browser asks for the HTML first, then opens up to six connections at once. Each file takes one round trip plus its size divided by the speed. Compression is assumed to shrink text by about two thirds, minifying by about a quarter, and image work by about half. Real pages and networks behave less neatly, and your own measurements (for example with the browser\'s Network tab) are what count.'));

    function model() {
      // One shared pipe: transfers take turns, and up to six requests can be waiting at once, each paying one round trip first
      const rtt = (st.fixes.cdn ? st.rtt * 0.3 : st.rtt) / 1000;
      const speed = st.mbps * 1e6 / 8;                                  // bytes per second
      const items = RES.map(r => {
        let kb = r.kb;
        if (r.type === 'text') { if (st.fixes.minify && r.n !== 'index.html') kb *= 0.75; if (st.fixes.compress) kb *= 0.35; }
        if (r.type === 'img' && st.fixes.images) kb *= 0.5;
        return { r, kb, cached: !!st.fixes.cache && r.n !== 'index.html', lazy: !!st.fixes.lazy && r.type === 'img' && !r.block && !r.first };
      });
      const html = items[0];
      html.start = 0; html.end = rtt + html.kb * 1000 / speed;
      let pipe = html.end;
      const slots = new Array(6).fill(html.end);
      function fetchItem(it, notBefore) {
        const k = slots.indexOf(Math.min.apply(null, slots)), reqAt = Math.max(slots[k], notBefore || 0);
        it.start = reqAt;
        if (it.cached) { it.end = reqAt + 0.005; }
        else { const begin = Math.max(reqAt + rtt, pipe); it.end = begin + it.kb * 1000 / speed; pipe = it.end; }
        slots[k] = it.end;
      }
      items.slice(1).filter(i => !i.lazy).forEach(i => fetchItem(i));
      const usable = Math.max.apply(null, items.filter(i => i.r.first || i.r.block).map(i => i.end));
      items.filter(i => i.lazy).forEach(i => fetchItem(i, usable));
      const total = Math.max.apply(null, items.map(i => i.end));
      return { items, usable, total, bytes: items.reduce((a, i) => a + (i.cached ? 0 : i.kb), 0) };
    }
    function update() {
      o1.textContent = st.mbps + ' Mbit/s'; o2.textContent = st.rtt + ' ms';
      const m = model(); const end = m.total;
      chart.replaceChildren();
      m.items.forEach(it => {
        const rw = el('div', 'web-pf-row'); rw.append(el('span', 'web-pf-name', it.r.n + (it.cached ? ' (cached)' : it.lazy ? ' (lazy)' : '')));
        const tr = el('div', 'web-pf-track'); const bar = el('span', 'web-pf-bar ' + (it.r.first || it.r.block ? 'is-block' : 'is-late') + (it.cached ? ' is-cached' : ''));
        bar.style.left = (it.start / end * 100) + '%'; bar.style.width = Math.max(0.8, (it.end - it.start) / end * 100) + '%'; tr.append(bar);
        rw.append(tr, el('span', 'web-pf-kb', it.cached ? '0 kB' : Math.round(it.kb) + ' kB')); chart.append(rw);
      });
      const ux = el('div', 'web-pf-row'); ux.append(el('span', 'web-pf-name', 'Page usable')); const tr2 = el('div', 'web-pf-track'); const mk = el('span', 'web-pf-mark'); mk.style.left = (m.usable / end * 100) + '%'; tr2.append(mk); ux.append(tr2, el('span', 'web-pf-kb', m.usable.toFixed(1) + ' s')); chart.append(ux);
      chart.setAttribute('aria-label', 'Waterfall chart of nine requests. The page becomes usable after ' + m.usable.toFixed(1) + ' seconds and everything has finished after ' + end.toFixed(1) + ' seconds.');
      stats.replaceChildren();
      const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); stats.append(s); };
      stat('Page usable after', m.usable.toFixed(1) + ' s'); stat('Everything finished after', m.total.toFixed(1) + ' s'); stat('Data downloaded', m.bytes >= 1000 ? (m.bytes / 1000).toFixed(1) + ' MB' : Math.round(m.bytes) + ' kB'); stat('Requests that went to the network', String(m.items.filter(i => !i.cached).length));
      const on = Object.keys(st.fixes).filter(k => st.fixes[k]).length;
      out.className = 'lab-readout ' + (m.usable < 1 ? 'is-good' : m.usable < 3 ? 'is-warn' : 'is-bad');
      out.textContent = !on ? 'With no techniques, the large images and scripts hold the page back for ' + m.usable.toFixed(1) + ' seconds before it is usable' + (m.usable > 3 ? ', which feels slow, especially on a phone. ' : '. ') + 'Try compression and image work first: they remove the most bytes.' : on < 3 ? 'The page is usable after ' + m.usable.toFixed(1) + ' s. Keep going: each technique attacks a different part of the delay (bytes, requests or distance).' : 'The page is usable after ' + m.usable.toFixed(1) + ' s. Fewer bytes, shorter trips and files already cached all help, and lazy loading keeps non-essential images out of the critical path.';
    }
    i1.addEventListener('input', () => { st.mbps = +i1.value; update(); }); i2.addEventListener('input', () => { st.rtt = +i2.value; update(); });
    update();
  }

  /* ---------- 4. Responsive layout explorer ---------- */
  const CSS_LINES = [
    ['base', '.cards { grid-template-columns: 1fr; }\n.page  { grid-template-columns: 1fr; }\n.menu  { display: none; }'],
    ['mid', '@media (min-width: 600px) {\n  .cards { grid-template-columns: repeat(2, 1fr); }\n  .menu  { display: flex; }\n}'],
    ['wide', '@media (min-width: 900px) {\n  .cards { grid-template-columns: repeat(3, 1fr); }\n  .page  { grid-template-columns: 1fr 12rem; }\n}']
  ];
  function buildResponsive(host) {
    Labs.shell(host, 'web-resp', 'Responsive layout explorer', 'Change the width of the screen. The page uses a mobile-first style sheet: the base rules fit a phone, and each media query adds changes once the screen is wide enough. The rules that apply light up.');
    let w = 400;
    const f = el('div', 'lab-field'), l = el('label'), o = el('output'), i = el('input'); l.htmlFor = i.id = 'web-resp-w'; l.append(document.createTextNode('Screen width: '), o); i.type = 'range'; i.min = 320; i.max = 1100; i.step = 10; i.value = w; f.append(l, i);
    const chips = el('div', 'lab-chips'); [['Phone', 360], ['Large phone', 430], ['Tablet', 768], ['Laptop', 1024]].forEach(p => { const b = el('button', 'lab-chip', p[0] + ' (' + p[1] + ' px)'); b.type = 'button'; b.addEventListener('click', () => { w = p[1]; i.value = w; update(); }); chips.append(b); });
    host.append(f, chips);
    const split = el('div', 'lab-split lab-split--wide-left'); host.append(split);
    const frameWrap = el('div', 'web-resp-wrap');
    const frame = el('div', 'web-resp-frame');
    const head = el('div', 'web-resp-head'); head.append(el('b', null, 'Riverside Library'), el('span', 'web-resp-menu', 'Home  Events  Catalogue'), el('span', 'web-resp-burger', 'Menu'));
    const page = el('div', 'web-resp-page'); const cards = el('div', 'web-resp-cards'); ['Book club', 'Coding night', 'Story time', 'Chess', 'Craft', 'Film'].forEach(n => cards.append(el('div', 'web-resp-card', n)));
    const side = el('div', 'web-resp-side', 'Opening hours'); page.append(cards, side); frame.append(head, page); frameWrap.append(frame);
    const code = el('div', 'lab-stack'); const blocks = {};
    CSS_LINES.forEach(c => { const pre = el('pre', 'lab-code web-resp-code', c[1]); blocks[c[0]] = pre; code.append(pre); });
    split.append(frameWrap, code);
    const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(out);
    host.append(el('p', 'lab-note', 'Mobile-first means the base rules describe the smallest screen and media queries use min-width to add layout as space allows. The page also needs <meta name="viewport" content="width=device-width, initial-scale=1"> so a phone does not pretend to be a wide screen.'));
    function update() {
      o.textContent = w + ' px';
      frame.style.width = Math.min(100, w / 1100 * 100) + '%'; frame.style.minWidth = '14rem';
      frame.classList.toggle('is-mid', w >= 600); frame.classList.toggle('is-wide', w >= 900);
      blocks.base.classList.add('is-on'); blocks.mid.classList.toggle('is-on', w >= 600); blocks.wide.classList.toggle('is-on', w >= 900);
      const cols = w >= 900 ? 3 : w >= 600 ? 2 : 1;
      out.className = 'lab-readout'; out.textContent = 'At ' + w + ' px: ' + cols + (cols === 1 ? ' column' : ' columns') + ' of cards' + (w >= 900 ? ', a sidebar and the full menu.' : w >= 600 ? ', and the full menu.' : ', a menu button instead of a menu, and no sidebar.') + ' ' + (w >= 900 ? 'Both media queries apply.' : w >= 600 ? 'Only the 600 px media query applies on top of the base rules.' : 'No media query applies, so only the base rules are in use.');
    }
    i.addEventListener('input', () => { w = +i.value; update(); });
    update();
  }

  function init() {
    document.querySelectorAll('[data-weblab="protocols"]').forEach(buildProtocols);
    document.querySelectorAll('[data-weblab="ip"]').forEach(buildIp);
    document.querySelectorAll('[data-weblab="perf"]').forEach(buildPerf);
    document.querySelectorAll('[data-weblab="responsive"]').forEach(buildResponsive);
    document.querySelectorAll('[data-weblab="git"]').forEach(h => GitLab.build(h, { files: ['index.html', 'style.css', 'app.py'] }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
