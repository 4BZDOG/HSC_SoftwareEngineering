/* Software Engineering Project: planning and testing lab.
   Small tools that work on the page's running scenario (the Library Loans project), placed where each is used.
   1. Critical path: change task durations and watch the critical path and float update.
   2. Boundary test data: generate the boundary rows and a Python check for a whole-number range.
   3. Path coverage: run inputs through a three-path function and see which paths are covered.
   Vanilla JS. The host element holds a plain-text fallback if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  let uid = 0;
  const nextId = p => 'sep-' + p + '-' + (++uid);

  function field(labelText, control, id) {
    const wrap = el('div', 'sep-field');
    const lab = el('label', null, labelText);
    lab.htmlFor = id;
    wrap.append(lab, control);
    return wrap;
  }
  function button(text, cls, onClick) {
    const b = el('button', cls, text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  function badge(kind, text) {
    return el('span', 'sep-badge sep-' + kind, text);
  }

  /* ================= 1. Critical path ================= */
  const TASKS = [
    { id: 'A', name: 'Requirements', d: 5, pre: [] },
    { id: 'B', name: 'Feasibility and budget', d: 3, pre: ['A'] },
    { id: 'C', name: 'Data dictionary and structure chart', d: 4, pre: ['B'] },
    { id: 'D', name: 'Wireframes and client review', d: 5, pre: ['B'] },
    { id: 'E', name: 'Loan module', d: 8, pre: ['C'] },
    { id: 'F', name: 'Search module', d: 6, pre: ['C'] },
    { id: 'G', name: 'Interface build', d: 7, pre: ['D', 'F'] },
    { id: 'H', name: 'Integration testing', d: 4, pre: ['E', 'G'] },
    { id: 'I', name: 'Documentation and process diary', d: 6, pre: ['C'] },
    { id: 'J', name: 'Client acceptance testing', d: 3, pre: ['H', 'I'] }
  ];

  /* Forward and backward pass. Tasks are listed so that predecessors come first. */
  function schedule(durations) {
    const t = {};
    TASKS.forEach(k => { t[k.id] = { id: k.id, name: k.name, pre: k.pre, d: durations[k.id], succ: [] }; });
    TASKS.forEach(k => k.pre.forEach(p => t[p].succ.push(k.id)));
    TASKS.forEach(k => {
      const x = t[k.id];
      x.es = x.pre.length ? Math.max(...x.pre.map(p => t[p].ef)) : 0;
      x.ef = x.es + x.d;
    });
    const total = Math.max(...TASKS.map(k => t[k.id].ef));
    for (let i = TASKS.length - 1; i >= 0; i--) {
      const x = t[TASKS[i].id];
      x.lf = x.succ.length ? Math.min(...x.succ.map(s => t[s].ls)) : total;
      x.ls = x.lf - x.d;
      x.float = x.ls - x.es;
      x.critical = x.float === 0;
    }
    return { tasks: TASKS.map(k => t[k.id]), total };
  }
  /* One critical path, following critical successors whose start equals this finish. */
  function criticalPath(res) {
    const by = {};
    res.tasks.forEach(x => { by[x.id] = x; });
    const paths = [];
    (function walk(id, trail) {
      const x = by[id];
      const next = x.succ.filter(s => by[s].critical && by[s].es === x.ef);
      if (!next.length) { paths.push(trail.concat(id)); return; }
      next.forEach(s => walk(s, trail.concat(id)));
    })('A', []);
    return paths;
  }
  const baseDurations = () => Object.fromEntries(TASKS.map(k => [k.id, k.d]));
  const BASE = schedule(baseDurations());
  const BASE_PATH = criticalPath(BASE).map(p => p.join(' → ')).join(' and ');

  function buildCritical() {
    const pane = el('div');
    pane.append(el('p', 'sep-lead', 'Ten tasks from the Library Loans project, measured in school days. Change a duration and the critical path, the total and each task\'s float are recalculated. Critical tasks have zero float: delaying any one of them delays the whole project.'));

    const dur = baseDurations();
    const inputs = {};
    const tableWrap = el('div', 'sep-table-wrap');
    tableWrap.tabIndex = 0;
    tableWrap.setAttribute('role', 'region');
    tableWrap.setAttribute('aria-label', 'Task table (scrolls sideways on narrow screens)');
    const table = el('table', 'sep-table');
    const head = el('thead');
    const hr = el('tr');
    ['Task', 'Days', 'After', 'ES', 'EF', 'LS', 'LF', 'Float', 'Critical?'].forEach(h => hr.append(el('th', null, h)));
    head.append(hr);
    const body = el('tbody');
    table.append(head, body);
    tableWrap.append(table);

    const rows = {};
    TASKS.forEach(k => {
      const tr = el('tr');
      const nameCell = el('td');
      nameCell.append(el('strong', null, k.id), document.createTextNode(' ' + k.name));
      const dCell = el('td');
      const inp = el('input', 'sep-input sep-input--num');
      inp.type = 'number'; inp.min = '1'; inp.max = '40'; inp.step = '1'; inp.value = String(k.d);
      inp.id = nextId('dur');
      inp.setAttribute('aria-label', 'Duration in days for task ' + k.id + ', ' + k.name);
      inp.addEventListener('input', () => {
        const v = parseInt(inp.value, 10);
        if (Number.isInteger(v) && v >= 1 && v <= 40) { dur[k.id] = v; update(); }
      });
      inputs[k.id] = inp;
      dCell.append(inp);
      const cells = ['pre', 'es', 'ef', 'ls', 'lf', 'float', 'crit'].map(() => el('td'));
      tr.append(nameCell, dCell, ...cells);
      body.append(tr);
      rows[k.id] = { tr, cells };
    });

    const summary = el('p', 'sep-summary');
    summary.setAttribute('aria-live', 'polite');
    const note = el('p', 'sep-note');
    note.setAttribute('aria-live', 'polite');
    const chart = el('div', 'sep-bars');
    chart.setAttribute('role', 'img');

    const controls = el('div', 'sep-presets');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'What-if scenarios');
    const setDur = changes => {
      Object.assign(dur, baseDurations(), changes);
      TASKS.forEach(k => { inputs[k.id].value = String(dur[k.id]); });
      update();
    };
    controls.append(
      button('Reset', 'sep-chip', () => setDur({})),
      button('Loan module takes 4 days longer', 'sep-chip', () => setDur({ E: 12 })),
      button('Search module takes 4 days longer', 'sep-chip', () => setDur({ F: 10 })),
      button('Loan module takes 8 days longer', 'sep-chip', () => setDur({ E: 16 }))
    );

    function update() {
      const res = schedule(dur);
      const paths = criticalPath(res).map(p => p.join(' → '));
      const pathText = paths.join(' and ');
      res.tasks.forEach(x => {
        const r = rows[x.id];
        const vals = [x.pre.length ? x.pre.join(', ') : 'none', x.es, x.ef, x.ls, x.lf, x.float];
        vals.forEach((v, i) => { r.cells[i].textContent = String(v); });
        r.cells[6].replaceChildren(x.critical ? badge('bad', 'Critical') : document.createTextNode('No'));
        r.tr.classList.toggle('sep-row--crit', x.critical);
      });
      const diff = res.total - BASE.total;
      summary.replaceChildren();
      summary.append(el('strong', null, 'Project duration: ' + res.total + ' days'));
      summary.append(document.createTextNode(diff ? ' (' + (diff > 0 ? '+' : '') + diff + ' from the baseline of ' + BASE.total + ').' : ' (the baseline).'));
      summary.append(document.createElement('br'));
      summary.append(document.createTextNode('Critical path: ' + pathText + '.'));
      if (!diff && pathText === BASE_PATH) {
        const changed = TASKS.some(k => dur[k.id] !== k.d);
        note.textContent = changed
          ? 'The project still finishes on day ' + res.total + '. The tasks you lengthened have float, so the delay is absorbed without moving the finish date.'
          : 'Try a what-if button, or type your own durations.';
      } else if (pathText === BASE_PATH) {
        note.textContent = 'A critical task slipped, so the finish moved by the same amount: there is no float to absorb it. Negotiate scope, add resources, or accept the later date.';
      } else {
        note.textContent = 'The critical path has changed. A task that used to have float has used it all up, so it now controls the finish date.';
      }
      renderBars(res);
    }

    function renderBars(res) {
      chart.replaceChildren();
      const scale = Math.max(res.total, BASE.total);
      chart.setAttribute('aria-label', 'Bar chart of the schedule. Project duration ' + res.total + ' days. Critical tasks: ' + res.tasks.filter(x => x.critical).map(x => x.id).join(', ') + '.');
      res.tasks.forEach(x => {
        const row = el('div', 'sep-bar-row');
        row.append(el('span', 'sep-bar-label', x.id));
        const track = el('div', 'sep-bar-track');
        const bar = el('span', 'sep-bar' + (x.critical ? ' sep-bar--crit' : ''));
        bar.style.left = (x.es / scale * 100) + '%';
        bar.style.width = (x.d / scale * 100) + '%';
        track.append(bar);
        if (x.float > 0) {
          const fl = el('span', 'sep-bar-float');
          fl.style.left = (x.ef / scale * 100) + '%';
          fl.style.width = (x.float / scale * 100) + '%';
          track.append(fl);
        }
        row.append(track);
        chart.append(row);
      });
      const key = el('p', 'sep-key');
      key.append(el('span', 'sep-swatch sep-swatch--crit'), document.createTextNode(' Critical task   '),
        el('span', 'sep-swatch'), document.createTextNode(' Task with float   '),
        el('span', 'sep-swatch sep-swatch--float'), document.createTextNode(' Float (spare days)'));
      chart.append(key);
    }

    pane.append(controls, tableWrap, summary, note, chart);
    update();
    return pane;
  }

  /* ================= 2. Boundary test data ================= */
  const BOUNDARY_PRESETS = [
    ['Active loans (0 to 5)', { label: 'active_loans', min: 0, max: 5 }],
    ['Days overdue (0 to 50)', { label: 'days_overdue', min: 0, max: 50 }],
    ['Name length (1 to 100)', { label: 'name_length', min: 1, max: 100 }],
    ['Ease-of-use rating (1 to 5)', { label: 'rating', min: 1, max: 5 }]
  ];

  function boundaryRows(min, max) {
    const raw = [
      ['Just below the minimum', min - 1, 'Invalid (boundary)', false],
      ['Minimum', min, 'Boundary', true],
      ['Just above the minimum', min + 1, 'Boundary', true],
      ['Typical value', Math.round((min + max) / 2), 'Normal', true],
      ['Just below the maximum', max - 1, 'Boundary', true],
      ['Maximum', max, 'Boundary', true],
      ['Just above the maximum', max + 1, 'Invalid (boundary)', false],
      ['Wrong data type', '"abc"', 'Invalid (erroneous)', false],
      ['Empty input', '""', 'Invalid (erroneous)', false]
    ];
    const seen = new Set();
    const out = [];
    raw.forEach(r => {
      const key = String(r[1]);
      if (seen.has(key)) {
        const prev = out.find(o => String(o[1]) === key);
        if (prev && !prev[0].includes(r[0].toLowerCase())) prev[0] += ' (also ' + r[0].toLowerCase() + ')';
        return;
      }
      seen.add(key);
      out.push(r.slice());
    });
    return out;
  }

  function pythonFor(label, min, max, rows) {
    const lines = [];
    lines.push('def is_valid(value):');
    lines.push('    """Return True if value is a whole number from ' + min + ' to ' + max + ' inclusive."""');
    lines.push('    return isinstance(value, int) and ' + min + ' <= value <= ' + max);
    lines.push('');
    lines.push('');
    lines.push('# Test data for ' + label);
    lines.push('cases = [');
    rows.forEach(r => {
      lines.push('    (' + r[1] + ', ' + (r[3] ? 'True' : 'False') + '),   # ' + r[0].toLowerCase());
    });
    lines.push(']');
    lines.push('');
    lines.push('for value, expected in cases:');
    lines.push('    actual = is_valid(value)');
    lines.push('    print(f"{value!r:>7}  expected {expected!s:<5}  actual {actual!s:<5}  {\'PASS\' if actual == expected else \'FAIL\'}")');
    return lines.join('\n');
  }

  function buildBoundary() {
    const pane = el('div');
    pane.append(el('p', 'sep-lead', 'Enter the valid range for a whole-number field. The tool lists the test data that boundary testing calls for, then writes a Python check you can paste into your own project.'));

    const controls = el('div', 'sep-controls sep-controls--row');
    const idL = nextId('label'), idMin = nextId('min'), idMax = nextId('max');
    const inLabel = el('input', 'sep-input'); inLabel.type = 'text'; inLabel.id = idL; inLabel.value = 'active_loans'; inLabel.maxLength = 40;
    const inMin = el('input', 'sep-input'); inMin.type = 'number'; inMin.id = idMin; inMin.value = '0'; inMin.step = '1';
    const inMax = el('input', 'sep-input'); inMax.type = 'number'; inMax.id = idMax; inMax.value = '5'; inMax.step = '1';
    controls.append(field('Field name', inLabel, idL), field('Smallest valid value', inMin, idMin), field('Largest valid value', inMax, idMax));

    const presets = el('div', 'sep-presets');
    presets.setAttribute('role', 'group');
    presets.setAttribute('aria-label', 'Example ranges');
    BOUNDARY_PRESETS.forEach(([name, v]) => {
      presets.append(button(name, 'sep-chip', () => {
        inLabel.value = v.label; inMin.value = String(v.min); inMax.value = String(v.max); render();
      }));
    });

    const out = el('div', 'sep-out');
    out.setAttribute('aria-live', 'polite');

    function render() {
      out.replaceChildren();
      const min = parseInt(inMin.value, 10), max = parseInt(inMax.value, 10);
      const label = (inLabel.value || 'value').trim().slice(0, 40) || 'value';
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        out.append(badge('info', 'Enter whole numbers for both ends of the range.'));
        return;
      }
      if (min >= max) {
        out.append(badge('info', 'The smallest valid value must be less than the largest.'));
        return;
      }
      const rows = boundaryRows(min, max);
      const wrap = el('div', 'sep-table-wrap');
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Generated test data (scrolls sideways on narrow screens)');
      const t = el('table', 'sep-table');
      const h = el('tr');
      ['#', 'Test', 'Input', 'Category', 'Expected'].forEach(x => h.append(el('th', null, x)));
      const th = el('thead'); th.append(h); t.append(th);
      const tb = el('tbody');
      rows.forEach((r, i) => {
        const tr = el('tr');
        tr.append(el('td', null, String(i + 1)), el('td', null, r[0]));
        const inputCell = el('td'); inputCell.append(el('code', null, String(r[1])));
        tr.append(inputCell, el('td', null, r[2]), el('td', null, r[3] ? 'Accept' : 'Reject'));
        tb.append(tr);
      });
      t.append(tb); wrap.append(t);
      out.append(wrap);
      out.append(el('p', 'sep-note', rows.length + ' test cases. Boundary testing checks the values on and either side of each edge, because off-by-one mistakes (using < where <= was meant) live there. The normal value shows the typical case works, and the last two rows are erroneous data.'));
      const code = pythonFor(label, min, max, rows);
      const pre = el('pre', 'sep-code');
      const c = el('code', null, code);
      pre.append(c);
      out.append(pre);
      const copy = button('Copy Python', 'sep-chip', () => {
        const done = ok => { copy.textContent = ok ? 'Copied' : 'Select the code and copy it'; setTimeout(() => { copy.textContent = 'Copy Python'; }, 2000); };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => done(true), () => done(false));
          else done(false);
        } catch (e) { done(false); }
      });
      out.append(copy);
    }
    [inLabel, inMin, inMax].forEach(i => i.addEventListener('input', render));
    pane.append(presets, controls, out);
    render();
    return pane;
  }

  /* ================= 3. Path coverage ================= */
  const CODE_LINES = [
    'def calculate_fine_cents(days_overdue):',
    '    if days_overdue <= 0:',
    '        return 0                      # path 1: not overdue',
    '    else:',
    '        if days_overdue > 50:',
    '            return 1000               # path 3: fine capped at $10.00',
    '        else:',
    '            return days_overdue * 20  # path 2: 20 cents a day'
  ];
  const PATH_LINES = { 1: [1, 2], 2: [1, 4, 7], 3: [1, 4, 5] };
  function runFine(days) {
    if (days <= 0) return { path: 1, out: 0 };
    if (days > 50) return { path: 3, out: 1000 };
    return { path: 2, out: days * 20 };
  }
  const dollars = c => '$' + (c / 100).toFixed(2);
  const PATH_NAMES = { 1: 'Path 1: not overdue', 2: 'Path 2: overdue, below the cap', 3: 'Path 3: overdue, cap applied' };

  function buildPaths() {
    const pane = el('div');
    pane.append(el('p', 'sep-lead', 'The fine function has one decision inside another, so there are three paths through it. Run inputs and see which paths your test data has covered. Path testing asks for at least one test down every path.'));

    const pre = el('pre', 'sep-code sep-code--lines');
    const lineEls = CODE_LINES.map((text, i) => {
      const s = el('span', 'sep-line', text);
      s.dataset.line = String(i);
      pre.append(s, document.createTextNode('\n'));
      return s;
    });

    const runs = [];
    const idIn = nextId('days');
    const inp = el('input', 'sep-input sep-input--num'); inp.type = 'number'; inp.step = '1'; inp.id = idIn; inp.value = '20';
    const row = el('div', 'sep-controls sep-controls--row');
    const runBtn = button('Run test', 'sep-btn', () => run(parseInt(inp.value, 10)));
    row.append(field('days_overdue', inp, idIn), runBtn);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(parseInt(inp.value, 10)); } });

    const presets = el('div', 'sep-presets');
    presets.setAttribute('role', 'group');
    presets.setAttribute('aria-label', 'Example inputs');
    [-3, 0, 1, 20, 50, 51].forEach(v => presets.append(button('Run ' + v, 'sep-chip', () => { inp.value = String(v); run(v); })));
    presets.append(button('Clear', 'sep-chip', () => { runs.length = 0; render(); }));

    const status = el('p', 'sep-summary');
    status.setAttribute('aria-live', 'polite');
    const pathList = el('ul', 'sep-rules');
    const logWrap = el('div', 'sep-table-wrap');
    logWrap.tabIndex = 0;
    logWrap.setAttribute('role', 'region');
    logWrap.setAttribute('aria-label', 'Test log (scrolls sideways on narrow screens)');
    const note = el('p', 'sep-note');
    note.setAttribute('aria-live', 'polite');

    function run(v) {
      if (!Number.isInteger(v)) { note.textContent = 'Enter a whole number of days.'; return; }
      runs.push(Object.assign({ days: v }, runFine(v)));
      render();
    }
    function render() {
      const covered = new Set(runs.map(r => r.path));
      lineEls.forEach(s => s.classList.remove('sep-line--hit'));
      covered.forEach(p => PATH_LINES[p].forEach(i => lineEls[i].classList.add('sep-line--hit')));
      status.replaceChildren();
      status.append(el('strong', null, 'Paths covered: ' + covered.size + ' of 3'));
      pathList.replaceChildren();
      [1, 2, 3].forEach(p => {
        const li = el('li', 'sep-rule');
        li.append(el('span', 'sep-mark ' + (covered.has(p) ? 'sep-mark--pass' : 'sep-mark--skip'), covered.has(p) ? 'Covered' : 'Not yet'), el('span', 'sep-rule-text', PATH_NAMES[p]));
        pathList.append(li);
      });
      logWrap.replaceChildren();
      if (runs.length) {
        const t = el('table', 'sep-table');
        const th = el('thead'); const h = el('tr');
        ['#', 'days_overdue', 'Path', 'Returned', 'As dollars'].forEach(x => h.append(el('th', null, x)));
        th.append(h); t.append(th);
        const tb = el('tbody');
        runs.slice(-8).forEach((r, i) => {
          const tr = el('tr');
          const n = runs.length - Math.min(runs.length, 8) + i + 1;
          tr.append(el('td', null, String(n)), el('td', null, String(r.days)), el('td', null, String(r.path)), el('td', null, String(r.out)), el('td', null, dollars(r.out)));
          tb.append(tr);
        });
        t.append(tb); logWrap.append(t);
      }
      if (covered.size === 3) {
        const have = new Set(runs.map(r => r.days));
        const edges = [0, 1, 50, 51].filter(x => !have.has(x));
        note.textContent = edges.length
          ? 'All three paths are covered. Now add boundary data: the edges are 0 and 1 (not overdue or overdue) and 50 and 51 (cap not applied or applied). Still to run: ' + edges.join(', ') + '.'
          : 'All three paths and all four boundary values are covered. Notice that 50 and 51 both return 1000, but by different paths, so an output check alone would not tell them apart.';
      } else if (runs.length) {
        note.textContent = 'Keep going: at least one test is needed down every path.';
      } else {
        note.textContent = 'Run a test to begin.';
      }
    }
    pane.append(pre, row, presets, status, pathList, logWrap, note);
    render();
    return pane;
  }

  /* ================= Tabs and start-up ================= */
  const MODES = {
    critical: {
      title: 'Critical path checker',
      intro: 'Change a duration and see which tasks are critical, how much float the others have, and when the project finishes.',
      tabs: [{ label: 'Critical path', build: buildCritical }]
    },
    testing: {
      title: 'Test data lab',
      intro: 'Choose boundary test data for a range, then check that your tests cover every path through a function.',
      tabs: [
        { label: 'Boundary test data', build: buildBoundary },
        { label: 'Path coverage', build: buildPaths }
      ]
    },
    all: {
      title: 'Planning and testing lab',
      intro: 'Three tools that work on the Library Loans project: schedule it, choose test data for it, and check your tests cover every path.',
      tabs: [
        { label: 'Critical path', build: buildCritical },
        { label: 'Boundary test data', build: buildBoundary },
        { label: 'Path coverage', build: buildPaths }
      ]
    }
  };

  function build(host) {
    const mode = MODES[host.getAttribute('data-sep-lab')] || MODES.all;
    host.replaceChildren();
    host.classList.add('sep-lab--ready');
    host.append(el('h4', null, mode.title));
    host.append(el('p', 'sep-intro', mode.intro));

    const tabs = mode.tabs;
    if (tabs.length === 1) {
      host.append(tabs[0].build());
      return;
    }
    const list = el('div', 'sep-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', mode.title);
    const panes = [];
    const buttons = [];
    const base = nextId('tab');

    function select(i, focus) {
      tabs.forEach((t, k) => {
        const on = k === i;
        buttons[k].setAttribute('aria-selected', on ? 'true' : 'false');
        buttons[k].tabIndex = on ? 0 : -1;
        panes[k].hidden = !on;
      });
      if (focus) buttons[i].focus();
    }
    tabs.forEach((t, i) => {
      const b = el('button', 'sep-tab', t.label);
      b.type = 'button';
      b.id = base + '-t' + i;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', base + '-p' + i);
      b.addEventListener('click', () => select(i, false));
      b.addEventListener('keydown', e => {
        let n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n != null) { e.preventDefault(); select(n, true); }
      });
      buttons.push(b);
      list.append(b);
      const pane = el('div', 'sep-tabpanel');
      pane.id = base + '-p' + i;
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', b.id);
      pane.append(t.build());
      panes.push(pane);
    });
    host.append(list);
    panes.forEach(p => host.append(p));
    select(0, false);
  }

  function init() {
    document.querySelectorAll('[data-sep-lab]').forEach(build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
