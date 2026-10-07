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

/* ══════════ Labs built on the shared kit (css/labs.css, js/labs.js) ══════════
   Requirements and implementation practice sets, a weighted decision matrix, a development-approach
   practice set, a backup what-if and the Git sandbox. Everything shown is written with textContent. */
(() => {
  'use strict';
  if (!window.Labs) return;
  const el = Labs.el;
  const seg = (host, label, options, initial, onPick) => {
    const g = el('div', 'lab-seg'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', label);
    const bs = options.map(o => { const b = el('button', null, o[1]); b.type = 'button'; b.addEventListener('click', () => { onPick(o[0]); mark(o[0]); }); g.append(b); return [o[0], b]; });
    const mark = v => bs.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === v)));
    mark(initial); host.append(g);
  };
  const stat = (box, a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); box.append(s); };
  const btn = (text, cls, fn) => { const b = el('button', 'lab-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); return b; };

  /* ---------- 1. Requirements ---------- */
  function buildReqs(host) {
    Labs.sorter(host, {
      cls: 'sep-reqs', title: 'Requirement, constraint or boundary?',
      lead: 'Library Loans statements to classify. A functional requirement says what the system does, a non-functional requirement says how well, a constraint limits how the project is carried out, and a boundary says what is in or out of scope.',
      noun: 'statement', groupLabel: 'Kind of statement',
      choices: [{ key: 'F', label: 'Functional' }, { key: 'N', label: 'Non-functional' }, { key: 'C', label: 'Constraint' }, { key: 'B', label: 'Boundary' }],
      items: [
        { text: 'Staff can record a return, and the book becomes available again.', ans: 'F', why: 'It describes something the system does for a user.' },
        { text: 'Search results appear within 2 seconds for a catalogue of 10,000 titles.', ans: 'N', why: 'It says how well the search must perform. Performance is a quality attribute, and the number makes it testable.' },
        { text: 'The project has seven weeks and no budget, so only free tools can be used.', ans: 'C', why: 'Time and money limit how the project can be carried out.' },
        { text: 'Online payment of fines is not part of this project.', ans: 'B', why: 'It states what the system will not do, which protects the project from scope creep.' },
        { text: 'The fine is 20 cents for each day overdue, up to a maximum of $10.00.', ans: 'F', why: 'It is a rule about what the system calculates, so it is functional.' },
        { text: 'The system must run on the library\'s existing computer with no internet needed at the desk.', ans: 'C', why: 'It limits the technology the solution may use.' },
        { text: 'A new staff member can use the system without training within 15 minutes.', ans: 'N', why: 'It describes usability, which is how well the system can be used.' },
        { text: 'A mobile app for members is outside the scope of this project.', ans: 'B', why: 'It sets the edge of the project. If the client wants it later, it becomes a new project.' },
        { text: 'Only signed-in staff can use the system, and passwords are stored as salted hashes.', ans: 'N', why: 'This is a security requirement, a quality attribute of the whole system.', extra: 'Some statements could be written two ways. "Staff sign in" can be functional, while "only staff can reach the data" is a security quality. Decide what you are describing: an action, or how well the system protects.' }
      ],
      extraLabel: 'Note',
      closing: 'A requirement can be tested. A constraint limits the project. A boundary draws the edge of what you will build.'
    });
  }

  /* ---------- 2. Implementation methods ---------- */
  function buildImpl(host) {
    Labs.sorter(host, {
      cls: 'sep-impl', title: 'Which implementation method?',
      lead: 'Choose the method that best fits each situation, then read the justification. In an exam, justify with the risk, the cost and the number of people affected.',
      noun: 'situation', groupLabel: 'Implementation method',
      choices: [{ key: 'D', label: 'Direct' }, { key: 'PH', label: 'Phased' }, { key: 'PA', label: 'Parallel' }, { key: 'PI', label: 'Pilot' }],
      items: [
        { text: 'A bank replaces the system that holds account balances. A fault must never put customers\' money at risk.', ans: 'PA', why: 'The old system keeps running beside the new one, so there is a safe fallback. It costs more because the work is done twice.' },
        { text: 'A school adds a timetable module this term, a reports module next term and a payments module after that.', ans: 'PH', why: 'The new system arrives in stages (modules), so problems are found and fixed one part at a time.' },
        { text: 'A chain tries its new stock-ordering software in one store for a month, fixes the problems, then installs it in every store.', ans: 'PI', why: 'A small group of real users tries the whole system first, and only then is it rolled out to everyone.', extra: 'A pilot tests the whole system with some users. A phased rollout brings in some parts of the system for everyone.' },
        { text: 'A small cafe replaces its paper order pad with a tablet app that starts on Monday morning.', ans: 'D', why: 'The business is small and the risk is low, so switching straight over is cheapest and avoids running two systems.' },
        { text: 'A payroll system for 5,000 staff is run alongside the old one for two pay cycles so the results can be compared.', ans: 'PA', why: 'Running both and comparing the results is the defining feature of parallel implementation.' },
        { text: 'A university gives its new student portal to the Law faculty first, then to other faculties once the faults are fixed.', ans: 'PI', why: 'One department acts as the trial group before the system is rolled out to the rest.' }
      ],
      extraLabel: 'Note',
      closing: 'Direct is cheap but risky, parallel is safe but costly, phased spreads the change over stages, and pilot proves the whole system with a small group first.'
    });
  }

  /* ---------- 3. Weighted decision matrix ---------- */
  function buildMatrix(host) {
    Labs.shell(host, 'sep-matrix', 'Decision matrix: change what matters', 'The ratings below come from the Library Loans table. The weights say how much each criterion matters to the client. Change the weights and see whether the best approach changes.');
    const CRIT = [['Requirements likely to change', 'Changes', [2, 5, 4]], ['Client can review often', 'Reviews', [2, 5, 4]], ['Fixed deadline and scope', 'Fixed scope', [5, 3, 4]], ['Documents and sign-offs needed', 'Sign-offs', [5, 2, 4]], ['Fit for a solo developer', 'Solo', [4, 3, 3]]];
    const NAMES = ['Waterfall', 'Agile', 'WAgile'];
    const st = { w: [3, 2, 3, 2, 1] };
    const presets = el('div', 'lab-actions');
    const set = w => { st.w = w.slice(); sync(); draw(); };
    [['Library Loans (table above)', [3, 2, 3, 2, 1]], ['A start-up with unclear needs', [5, 4, 1, 0, 2]], ['A regulated payroll upgrade', [1, 1, 5, 5, 1]]].forEach(p => presets.append(btn(p[0], '', () => set(p[1]))));
    host.append(presets);
    const grid = el('div', 'lab-row sep-matrix-sliders'); host.append(grid);
    const outs = [], ins = [];
    CRIT.forEach((c, i) => {
      const f = el('div', 'lab-field'), l = el('label'), o = el('output'), r = el('input');
      l.htmlFor = r.id = 'sep-mx-' + i; l.append(document.createTextNode(c[0] + ': weight '), o);
      r.type = 'range'; r.min = 0; r.max = 5; r.step = 1; r.value = st.w[i];
      r.addEventListener('input', () => { st.w[i] = +r.value; draw(); });
      f.append(l, r); grid.append(f); outs.push(o); ins.push(r);
    });
    const bars = el('div', 'sep-matrix-bars'); host.append(bars);
    const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(out);
    host.append(el('p', 'lab-note', 'Each total is the sum of weight × rating. A matrix does not make the decision for you: the weights are a judgement, which is why you must justify them. If a small change to a weight flips the winner, the options are close and you should say so.'));
    function sync() { ins.forEach((r, i) => { r.value = st.w[i]; }); }
    function draw() {
      bars.replaceChildren();
      const totals = NAMES.map((n, j) => CRIT.reduce((a, c, i) => a + st.w[i] * c[2][j], 0));
      const max = Math.max(1, 5 * st.w.reduce((a, b) => a + b, 0)), top = Math.max.apply(null, totals);
      outs.forEach((o, i) => { o.textContent = String(st.w[i]); });
      NAMES.forEach((n, j) => {
        const line = el('div', 'sep-bar-line'), meter = el('div', 'lab-meter'), fill = el('span', totals[j] === top && top > 0 ? 'is-good' : '');
        fill.style.width = (totals[j] / max * 100) + '%'; meter.append(fill);
        line.append(el('span', 'sep-bar-name', n), meter, el('b', null, String(totals[j]))); bars.append(line);
      });
      const winners = NAMES.filter((n, j) => totals[j] === top);
      const sorted = totals.slice().sort((a, b) => b - a);
      out.className = 'lab-readout';
      out.textContent = top === 0 ? 'Every weight is 0, so no approach scores anything. Give at least one criterion a weight.' : winners.length > 1 ? winners.join(' and ') + ' tie on ' + top + '. When totals tie, look at the criteria with the highest weights, or ask the client what matters most.' : winners[0] + ' scores highest with ' + top + ', ' + (top - sorted[1]) + ' ahead of the next. ' + (top - sorted[1] <= 3 ? 'That is a narrow lead, so say that the choice is close.' : 'That is a clear lead for these weights.');
    }
    draw();
  }

  /* ---------- 4. Development approach practice ---------- */
  function buildMethods(host) {
    Labs.sorter(host, {
      cls: 'sep-methods', title: 'Waterfall, Agile or WAgile?',
      lead: 'Choose the development approach that best fits each project, and give the reason in your own words before you read the feedback.',
      noun: 'project', groupLabel: 'Development approach',
      choices: [{ key: 'W', label: 'Waterfall' }, { key: 'A', label: 'Agile' }, { key: 'H', label: 'WAgile' }],
      items: [
        { text: 'A payroll upgrade has fixed, signed-off requirements, and the regulator needs documented approval at each stage.', ans: 'W', why: 'Requirements are stable and sign-offs are essential, which is the case for Waterfall.' },
        { text: 'A start-up does not yet know what customers want, so it releases a small version every two weeks and adjusts.', ans: 'A', why: 'Unclear, changing requirements and quick feedback suit short sprints.' },
        { text: 'A bank adds a feature to a regulated system. The scope and the security audit are fixed, but the screens will change after user feedback.', ans: 'H', why: 'Planned gates and a final audit are Waterfall features, while building in sprints with feedback is Agile. That mix is WAgile.' },
        { text: 'A student game project has a teacher who needs a plan with milestones for marking, and the student expects to change features after testing with friends.', ans: 'H', why: 'The milestones and documents are planned in advance, and the building between them adapts to feedback.' },
        { text: 'A small team builds a mobile game and wants player feedback after every release.', ans: 'A', why: 'Frequent releases and feedback are the strength of Agile.' },
        { text: 'A control system has safety rules that are fully known before any code is written, and every stage must be reviewed and recorded.', ans: 'W', why: 'Known requirements and formal review at each stage point to Waterfall.' }
      ],
      closing: 'Waterfall plans everything first, Agile plans a little and learns constantly, and WAgile uses planned gates around Agile sprints.'
    });
  }

  /* ---------- 5. Backup what-if ---------- */
  function buildBackup(host) {
    Labs.shell(host, 'sep-backup', 'Backup what-if: will this plan survive?', 'Choose how often the Library Loans database is backed up, where the copies are kept, and how many versions are kept. Then see what happens in each emergency. Times: the backup runs at 4 pm.');
    const st = { freq: 'daily', where: 'usb', keep: 5, ev: 'disk', tested: false };
    const pick = (title, id, opts, key) => { const box = el('div', 'lab-field'); box.append(el('span', 'lab-label', title)); seg(box, title, opts, st[key], v => { st[key] = v; draw(); }); return box; };
    const r1 = el('div', 'lab-row'); r1.append(pick('How often', 'f', [['daily', 'Every weekday'], ['weekly', 'Every Friday'], ['updates', 'Only before updates']], 'freq'), pick('Where the copies are kept', 'w', [['same', 'Another folder on the same disk'], ['usb', 'Another folder and a USB drive in the office'], ['cloud', 'Folder, USB and an approved cloud copy']], 'where'));
    const r2 = el('div', 'lab-row'); r2.append(pick('Versions kept', 'k', [[1, 'Latest 1'], [5, 'Latest 5'], [20, 'Latest 20']], 'keep'), pick('Restore tested', 't', [[false, 'Never tested'], [true, 'Tested each term']], 'tested'));
    const r3 = el('div', 'lab-row'); r3.append(pick('Emergency', 'e', [['disk', 'The disk fails on Thursday at 2 pm'], ['delete', 'A table is deleted on Wednesday at 9 am and noticed on Friday at 9 am'], ['flood', 'A flood in the office after Thursday\'s backup']], 'ev'));
    host.append(r1, r2, r3);
    const stats = el('div', 'lab-stats'), out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(stats, out);
    host.append(el('p', 'lab-note', 'Assumptions: "before updates" means the last backup was three weeks ago. A copy on the same disk goes with the disk, and a USB drive kept in the office goes with the office. A deletion that is backed up becomes part of every later backup, so you need an older version from before the mistake.'));
    const span = h => h < 48 ? 'about ' + h + ' hours' : h < 24 * 14 ? 'about ' + Math.round(h / 24) + ' days' : 'about ' + Math.round(h / 168) + ' weeks';
    function draw() {
      stats.replaceChildren();
      let survives = true, why = '', age = 0, needV = 1;
      if (st.ev === 'disk' && st.where === 'same') { survives = false; why = 'Every copy was on the disk that failed.'; }
      if (st.ev === 'flood' && st.where !== 'cloud') { survives = false; why = st.where === 'same' ? 'Every copy was on the disk in the flooded office.' : 'The USB drive was kept in the office, so it was lost with the computer.'; }
      if (st.ev === 'disk') age = { daily: 22, weekly: 142, updates: 504 }[st.freq];
      else if (st.ev === 'flood') age = { daily: 10, weekly: 154, updates: 504 }[st.freq];
      else { age = { daily: 17, weekly: 113, updates: 456 }[st.freq]; needV = { daily: 3, weekly: 1, updates: 1 }[st.freq]; }
      const enough = st.ev !== 'delete' || st.keep >= needV;
      if (st.ev === 'delete' && !enough) why = 'Every kept version was made after the mistake, so each one already has the table missing. The clean version had been deleted to save space.';
      let kind, msg;
      if (!survives) { kind = 'is-bad'; msg = 'The data cannot be recovered. ' + why + ' Keep at least one copy somewhere the same accident cannot reach.'; }
      else if (!enough) { kind = 'is-bad'; msg = 'The data cannot be recovered from this backup plan. ' + why + ' Keep more versions, so an older clean copy is still there.'; }
      else if (age > 48) { kind = 'is-warn'; msg = 'The data survives, but ' + span(age) + ' of loans would have to be re-entered. The plan needs a more frequent backup if the client cannot accept that loss.'; }
      else { kind = 'is-good'; msg = 'The data survives and ' + span(age) + ' of loans would be lost, which meets the aim of losing at most one day.'; }
      msg += st.tested ? ' You restored a copy on another computer this term, so you know it opens.' : ' The restore has never been tested, so you would only find out that a backup is empty or unreadable when you needed it.';
      stat(stats, 'Copy that survives', survives && enough ? (st.ev === 'delete' ? 'An older version' : st.where === 'same' ? 'Same-disk folder' : st.where === 'usb' ? (st.ev === 'flood' ? '–' : 'USB drive') : 'Cloud copy') : 'None');
      stat(stats, 'Work to re-enter', survives && enough ? span(age) : 'Everything');
      stat(stats, 'Versions needed', st.ev === 'delete' ? String(needV) + (st.keep >= needV ? ' (you keep ' + st.keep + ')' : ' (you keep only ' + st.keep + ')') : 'Latest');
      out.className = 'lab-readout ' + kind; out.textContent = msg;
    }
    draw();
  }

  function init() {
    const builders = { reqs: buildReqs, impl: buildImpl, matrix: buildMatrix, methods: buildMethods, backup: buildBackup };
    document.querySelectorAll('[data-projlab]').forEach(host => {
      const kind = host.getAttribute('data-projlab');
      try {
        if (kind === 'git') GitLab.build(host, { title: 'Git sandbox: branches, merges and conflicts', lead: 'Make commits, create a branch for a feature, switch back and merge. Change the same file on two branches to see a merge conflict, then resolve it by deciding which version is right.', files: ['library.py', 'tests.py', 'README.md'] });
        else if (builders[kind]) builders[kind](host);
      } catch (e) { /* leave the static description in place */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
