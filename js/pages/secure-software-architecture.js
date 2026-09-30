/* Secure Software Architecture: input handling lab.
   Three small testers that show why validation, parameterised queries and output encoding work.
   1. SQL query: the same input sent to a string-built query and a parameterised query.
   2. Validate a field: allowlist rules checked one by one.
   3. Encode output: unsafe and safe ways of placing a comment into a page.
   Vanilla JS. The host element contains a plain-text fallback if this file does not run.
   The SQL tester uses a tiny evaluator for WHERE clauses, not a real database. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* ---------- tiny SQL WHERE evaluator (mirrors the sqlite3 example on the page) ---------- */
  const STUDENTS = [
    { surname: 'Nguyen', year: 12, mark: 78 },
    { surname: 'Smith', year: 11, mark: 64 },
    { surname: "O'Brien", year: 12, mark: 91 }
  ];
  const COLUMNS = ['surname', 'year', 'mark'];
  const WORDS = ['AND', 'OR', 'NOT', 'LIKE'];

  function tokenize(src) {
    const toks = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '-' && src[i + 1] === '-') break;              // comment: rest of the line is ignored
      if (c === "'") {
        let j = i + 1, val = '', closed = false;
        while (j < src.length) {
          if (src[j] === "'") {
            if (src[j + 1] === "'") { val += "'"; j += 2; continue; }
            closed = true; j++; break;
          }
          val += src[j++];
        }
        if (!closed) { toks.push({ t: 'err', text: src.slice(i) }); break; }
        toks.push({ t: 'str', v: val, text: src.slice(i, j) });
        i = j; continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        toks.push({ t: 'num', v: parseFloat(src.slice(i, j)), text: src.slice(i, j) });
        i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
        const w = src.slice(i, j), u = w.toUpperCase();
        toks.push(WORDS.includes(u) ? { t: 'kw', v: u, text: w } : { t: 'id', v: w, text: w });
        i = j; continue;
      }
      const two = src.slice(i, i + 2);
      if (['<=', '>=', '<>', '!='].includes(two)) { toks.push({ t: 'op', v: two, text: two }); i += 2; continue; }
      if ('=<>()'.includes(c)) { toks.push({ t: c === '(' || c === ')' ? c : 'op', v: c, text: c }); i++; continue; }
      if (c === ';') { toks.push({ t: ';', text: ';' }); i++; continue; }
      toks.push({ t: 'err', text: src.slice(i) });
      break;
    }
    return toks;
  }

  class SqlError extends Error {}

  function parseWhere(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const fail = tok => {
      if (!tok) throw new SqlError('incomplete input');
      if (tok.t === 'err') throw new SqlError('unrecognized token: "' + tok.text + '"');
      throw new SqlError('near "' + tok.text + '": syntax error');
    };
    const isKw = (tok, v) => tok && tok.t === 'kw' && tok.v === v;

    function operand() {
      const t = peek();
      if (!t) fail(t);
      if (t.t === 'str' || t.t === 'num') { p++; return () => t.v; }
      if (t.t === 'id') {
        p++;
        const name = t.v.toLowerCase();
        if (!COLUMNS.includes(name)) throw new SqlError('no such column: ' + t.v);
        return row => row[name];
      }
      if (t.t === '(') {
        p++;
        const inner = orExpr();
        if (!peek() || peek().t !== ')') fail(peek());
        p++;
        return inner;
      }
      return fail(t);
    }
    const like = (value, pattern) => {
      const re = new RegExp('^' + String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
      return re.test(String(value));
    };
    const equal = (a, b) => {
      const an = typeof a === 'number', bn = typeof b === 'number';
      if (an && !bn && b !== '' && !isNaN(Number(b))) return a === Number(b);
      if (bn && !an && a !== '' && !isNaN(Number(a))) return Number(a) === b;
      return a === b;
    };
    function comparison() {
      const left = operand();
      const t = peek();
      if (t && t.t === 'op') {
        p++;
        const right = operand();
        return row => {
          const a = left(row), b = right(row);
          switch (t.v) {
            case '=': return equal(a, b);
            case '<>': case '!=': return !equal(a, b);
            case '<': return a < b;
            case '>': return a > b;
            case '<=': return a <= b;
            default: return a >= b;
          }
        };
      }
      if (isKw(t, 'LIKE')) { p++; const right = operand(); return row => like(left(row), right(row)); }
      return row => { const v = left(row); return typeof v === 'number' ? v !== 0 : false; };
    }
    function notExpr() {
      if (isKw(peek(), 'NOT')) { p++; const inner = notExpr(); return row => !inner(row); }
      return comparison();
    }
    function andExpr() {
      let left = notExpr();
      while (isKw(peek(), 'AND')) { p++; const l = left, r = notExpr(); left = row => l(row) && r(row); }
      return left;
    }
    function orExpr() {
      let left = andExpr();
      while (isKw(peek(), 'OR')) { p++; const l = left, r = andExpr(); left = row => l(row) || r(row); }
      return left;
    }

    const test = orExpr();
    let extra = false;
    if (peek() && peek().t === ';') {
      p++;
      if (p < toks.length) extra = true;
    } else if (peek()) {
      fail(peek());
    }
    return { test, extra };
  }

  function pyRepr(s) {
    if (s.includes("'") && !s.includes('"')) return '"' + s + '"';
    return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }

  const SQL_PREFIX = "SELECT surname, mark FROM students WHERE surname = '";
  const SQL_PARAM = 'SELECT surname, mark FROM students WHERE surname = ?';

  function runStringBuilt(input) {
    try {
      const { test, extra } = parseWhere("surname = '" + input + "'");
      return { rows: STUDENTS.filter(test), extra };
    } catch (e) {
      if (e instanceof SqlError) return { error: e.message };
      throw e;
    }
  }
  const runParameterised = input => ({ rows: STUDENTS.filter(s => s.surname === input) });

  /* ---------- validation rules ---------- */
  const digits = v => /^[0-9]+$/.test(v);
  const shorten = (v, n) => (v.length > n ? v.slice(0, n - 1) + '…' : v);
  const FIELDS = {
    username: {
      label: 'Username', rule: '3 to 20 characters: letters, digits or underscore',
      presets: [['Valid', 'ava_n'], ['Too short', 'ab'], ['SQL characters', "' OR '1'='1"], ['Script tag', '<script>alert(1)</script>'], ['500 characters', 'x'.repeat(500)]],
      check: v => {
        const bad = v.match(/[^A-Za-z0-9_]/);
        return [
          { label: 'Not empty', ok: v.length > 0 },
          { label: 'Length 3 to 20', ok: v.length >= 3 && v.length <= 20, detail: v.length + ' characters' },
          { label: 'Only letters, digits and underscore', ok: !bad, detail: bad ? 'first bad character: ' + JSON.stringify(bad[0]) : '' }
        ];
      }
    },
    year: {
      label: 'Year group', rule: 'a whole number from 7 to 12',
      presets: [['Valid', '11'], ['Out of range', '13'], ['Decimal', '11.5'], ['Text', 'eleven'], ['Injection', '11; DROP TABLE students']],
      check: v => {
        const whole = digits(v);
        return [
          { label: 'Not empty', ok: v.length > 0 },
          { label: 'Whole number (digits 0 to 9 only)', ok: whole },
          { label: 'Between 7 and 12', ok: whole && +v >= 7 && +v <= 12, skip: !whole }
        ];
      }
    },
    postcode: {
      label: 'Postcode', rule: 'exactly 4 digits',
      presets: [['Valid', '2000'], ['Too long', '20000'], ['Letters', '20a0'], ['Spaces inside', '2 00']],
      check: v => [
        { label: 'Exactly 4 characters', ok: v.length === 4, detail: v.length + ' characters' },
        { label: 'Digits 0 to 9 only', ok: digits(v) }
      ]
    },
    mark: {
      label: 'Mark', rule: 'a whole number from 0 to 100',
      presets: [['Valid', '82'], ['Too high', '250'], ['Negative', '-5'], ['Decimal', '82.5'], ['Script tag', '<b>82</b>']],
      check: v => {
        const whole = digits(v);
        return [
          { label: 'Not empty', ok: v.length > 0 },
          { label: 'Whole number (no sign, point or letters)', ok: whole },
          { label: 'Between 0 and 100', ok: whole && +v >= 0 && +v <= 100, skip: !whole }
        ];
      }
    }
  };

  /* ---------- output encoding ---------- */
  const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  function browserVerdict(raw) {
    if (/<\s*script/i.test(raw)) return 'The browser parses a script element and runs the code.';
    if (/<\s*[a-z][^>]*\son\w+\s*=/i.test(raw)) return 'The browser creates the element and runs the event handler.';
    if (/<\s*[a-z!/]/i.test(raw)) return 'The browser treats this as markup, so the page changes in ways the author did not intend.';
    return 'No markup characters here, so it displays as plain text. The code is still unsafe for other inputs.';
  }

  /* ---------- UI helpers ---------- */
  let uid = 0;
  const nextId = p => 'ssa-' + p + '-' + (++uid);

  function field(labelText, control, id) {
    const wrap = el('div', 'ssa-field');
    const lab = el('label', null, labelText);
    lab.htmlFor = id;
    wrap.append(lab, control);
    return wrap;
  }
  function presetRow(presets, onPick) {
    const row = el('div', 'ssa-presets');
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Example inputs');
    presets.forEach(([name, value]) => {
      const b = el('button', 'ssa-chip', name);
      b.type = 'button';
      b.addEventListener('click', () => onPick(value));
      row.append(b);
    });
    return row;
  }
  function badge(kind, text) {
    return el('span', 'ssa-badge ssa-' + kind, text);
  }
  function codeBox(parts) {
    const pre = el('pre', 'ssa-code');
    const code = el('code');
    parts.forEach(part => {
      if (typeof part === 'string') code.append(document.createTextNode(part));
      else code.append(el('mark', 'ssa-inj', part.mark));
    });
    pre.append(code);
    return pre;
  }
  function rowsTable(rows) {
    if (!rows.length) return el('p', 'ssa-none', 'No rows returned.');
    const wrap = el('div', 'ssa-table-wrap');
    const t = el('table', 'ssa-table');
    const head = el('tr');
    ['surname', 'mark'].forEach(h => head.append(el('th', null, h)));
    const thead = el('thead'); thead.append(head);
    const tbody = el('tbody');
    rows.forEach(r => {
      const tr = el('tr');
      tr.append(el('td', null, r.surname), el('td', null, String(r.mark)));
      tbody.append(tr);
    });
    t.append(thead, tbody);
    wrap.append(t);
    return wrap;
  }

  /* ---------- tab 1: SQL ---------- */
  function buildSql() {
    const root = el('div', 'ssa-pane');
    root.append(el('p', 'ssa-lead', 'The table holds three students: Nguyen (78), Smith (64) and O\'Brien (91). Type a surname to look up, or pick an example. The same text is sent to both versions of the query.'));

    const id = nextId('sql');
    const input = el('input', 'ssa-input');
    input.type = 'text'; input.id = id; input.value = 'Nguyen';
    input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off');
    const validateId = nextId('val');
    const validate = el('input');
    validate.type = 'checkbox'; validate.id = validateId;
    const validateLabel = el('label', 'ssa-check');
    validateLabel.htmlFor = validateId;
    validateLabel.append(validate, document.createTextNode(" Validate first (letters, apostrophes, hyphens and spaces; 1 to 30 characters)"));

    const controls = el('div', 'ssa-controls');
    controls.append(field('Surname to look up', input, id));
    controls.append(presetRow([['Normal', 'Nguyen'], ["Apostrophe (O'Brien)", "O'Brien"], ['Injection', "' OR '1'='1"], ['Two statements', "x'; DROP TABLE students; --"], ['Comment trick', "Smith' --"]], v => { input.value = v; update(); input.focus(); }));
    controls.append(validateLabel);
    root.append(controls);

    const out = el('div', 'ssa-results');
    out.setAttribute('aria-live', 'polite');
    root.append(out);

    root.append(el('p', 'ssa-note', 'Python equivalent. String-built: db.execute("... WHERE surname = \'" + surname + "\'"). Parameterised: db.execute("... WHERE surname = ?", (surname,)).'));

    function panel(title, kind) {
      const box = el('section', 'ssa-panel');
      box.append(el('h5', null, title));
      return box;
    }

    function update() {
      const text = input.value;
      out.replaceChildren();
      const rejected = validate.checked && !/^[A-Za-z' -]{1,30}$/.test(text);

      const a = panel('String-built query (vulnerable)');
      const b = panel('Parameterised query (fixed)');

      if (rejected) {
        const why = text.length === 0 ? 'the field is empty' : text.length > 30 ? 'it is longer than 30 characters' : 'it contains characters that are not letters, apostrophes, hyphens or spaces';
        [a, b].forEach(box => {
          box.append(badge('info', 'Rejected by validation'));
          box.append(el('p', null, 'Rejected before it reaches the database: ' + why + '. The query never runs.'));
        });
        out.append(a, b);
        const p = el('p', 'ssa-note', 'Validation stopped this input, but notice that it would also block a genuine surname if the rule were too tight. Validation reduces what gets in; it does not replace parameterised queries.');
        out.append(p);
        return;
      }

      // string-built
      a.append(el('h6', null, 'SQL sent to the database'));
      a.append(codeBox([SQL_PREFIX, { mark: text }, "'"]));
      const r1 = runStringBuilt(text);
      a.append(el('h6', null, 'Result'));
      const expected = STUDENTS.filter(s => s.surname === text).length;
      if (r1.error) {
        a.append(el('p', 'ssa-error', 'Database error: ' + r1.error));
        a.append(badge('bad', 'Broken: the query fails'));
      } else {
        a.append(rowsTable(r1.rows));
        if (r1.rows.length > expected) a.append(badge('bad', 'Leaked: ' + r1.rows.length + ' rows, but only ' + expected + ' expected'));
        else if (r1.rows.length < expected) a.append(badge('bad', 'Wrong result'));
        else a.append(badge('ok', 'Result is as intended'));
        if (r1.extra) a.append(el('p', 'ssa-note', 'Everything after the semicolon is a second statement. Python\'s sqlite3 refuses to run two statements in one call, but many database drivers run them, so a DROP TABLE could succeed.'));
        if (/--/.test(text) && r1.rows.length) a.append(el('p', 'ssa-note', 'The -- starts an SQL comment, so the closing quote the programmer wrote is ignored.'));
      }

      // parameterised
      b.append(el('h6', null, 'SQL sent, and the value sent separately'));
      b.append(codeBox([SQL_PARAM + '\nparameters: (' + pyRepr(text) + ',)']));
      const r2 = runParameterised(text);
      b.append(el('h6', null, 'Result'));
      b.append(rowsTable(r2.rows));
      b.append(badge('ok', r2.rows.length ? 'Safe: matched a surname exactly' : 'Safe: treated as a surname, nobody has it'));
      b.append(el('p', 'ssa-note', 'The whole input is compared as one value, so quotes and SQL keywords have no special meaning.'));

      out.append(a, b);
    }
    input.addEventListener('input', update);
    validate.addEventListener('change', update);
    update();
    return root;
  }

  /* ---------- tab 2: validation ---------- */
  function buildValidate() {
    const root = el('div', 'ssa-pane');
    root.append(el('p', 'ssa-lead', 'Choose a field, then type a value. Each rule is checked in order and shown as passed or failed. Rules that depend on an earlier one are skipped when it fails.'));

    const selId = nextId('field');
    const select = el('select', 'ssa-input');
    select.id = selId;
    Object.keys(FIELDS).forEach(k => { const o = el('option', null, FIELDS[k].label); o.value = k; select.append(o); });
    const inId = nextId('value');
    const input = el('input', 'ssa-input');
    input.type = 'text'; input.id = inId; input.autocomplete = 'off'; input.spellcheck = false;

    const controls = el('div', 'ssa-controls');
    controls.append(field('Field', select, selId), field('Value the user typed', input, inId));
    const presetHost = el('div');
    controls.append(presetHost);
    root.append(controls);

    const out = el('div', 'ssa-results ssa-results--one');
    out.setAttribute('aria-live', 'polite');
    root.append(out);

    function renderPresets() {
      presetHost.replaceChildren(presetRow(FIELDS[select.value].presets, v => { input.value = v; update(); input.focus(); }));
    }
    function update() {
      const f = FIELDS[select.value];
      const raw = input.value;
      const value = raw.trim();
      out.replaceChildren();
      const box = el('section', 'ssa-panel');
      box.append(el('h5', null, f.label + ': ' + f.rule));
      box.append(el('p', 'ssa-note', 'After trimming spaces: "' + shorten(value, 40) + '"'));
      const list = el('ul', 'ssa-rules');
      const results = f.check(value);
      let firstFail = null;
      results.forEach(r => {
        const li = el('li', 'ssa-rule');
        const state = r.skip ? 'skip' : (r.ok ? 'pass' : 'fail');
        if (state === 'fail' && !firstFail) firstFail = r;
        li.append(el('span', 'ssa-mark ssa-mark--' + state, state === 'pass' ? 'Pass' : state === 'fail' ? 'Fail' : 'Skipped'));
        li.append(el('span', 'ssa-rule-text', r.label + (r.detail && state !== 'skip' ? ' (' + r.detail + ')' : '')));
        list.append(li);
      });
      box.append(list);
      const accepted = results.every(r => r.ok || r.skip) && !results.some(r => !r.ok && !r.skip);
      if (accepted) {
        box.append(badge('ok', 'Accepted: the program stores "' + shorten(value, 40) + '"'));
      } else {
        box.append(badge('bad', 'Rejected: ' + (firstFail ? firstFail.label.toLowerCase() + ' failed' : 'a rule failed')));
        box.append(el('p', 'ssa-note', 'The program shows a clear message and does nothing else with this input. It never reaches a query, a file path or a web page.'));
      }
      out.append(box);
    }
    select.addEventListener('change', () => { input.value = FIELDS[select.value].presets[0][1]; renderPresets(); update(); });
    input.addEventListener('input', update);
    input.value = FIELDS.username.presets[0][1];
    renderPresets();
    update();
    return root;
  }

  /* ---------- tab 3: output encoding ---------- */
  function buildEncode() {
    const root = el('div', 'ssa-pane');
    root.append(el('p', 'ssa-lead', 'A visitor posts a comment. The page must put it into the HTML. Compare pasting it in as it is with encoding it first. Nothing you type here is ever inserted as HTML; the tester only shows what would happen.'));
    const id = nextId('comment');
    const input = el('input', 'ssa-input');
    input.type = 'text'; input.id = id; input.autocomplete = 'off'; input.spellcheck = false;
    input.value = "<script>alert('hi')</script>";
    const controls = el('div', 'ssa-controls');
    controls.append(field('Comment', input, id));
    controls.append(presetRow([['Script tag', "<script>alert('hi')</script>"], ['Image handler', '<img src=x onerror="alert(1)">'], ['Bold text', '<b>hello</b>'], ['Plain text', 'Great class & great teacher!']], v => { input.value = v; update(); input.focus(); }));
    root.append(controls);

    const out = el('div', 'ssa-results');
    out.setAttribute('aria-live', 'polite');
    root.append(out);

    function update() {
      const raw = input.value;
      out.replaceChildren();
      const a = el('section', 'ssa-panel');
      a.append(el('h5', null, 'Unsafe: pasted straight in'));
      a.append(el('h6', null, 'HTML sent to the browser'));
      a.append(codeBox(["<p class='comment'>" + raw + '</p>']));
      a.append(el('h6', null, 'What the browser does'));
      a.append(el('p', null, browserVerdict(raw)));
      a.append(badge(/<\s*[a-z!/]/i.test(raw) ? 'bad' : 'info', /<\s*[a-z!/]/i.test(raw) ? 'Vulnerable to XSS' : 'Looks harmless, but is not safe'));

      const b = el('section', 'ssa-panel');
      b.append(el('h5', null, 'Safe: encoded with html.escape'));
      b.append(el('h6', null, 'HTML sent to the browser'));
      b.append(codeBox(["<p class='comment'>" + escapeHtml(raw) + '</p>']));
      b.append(el('h6', null, 'What visitors see'));
      const view = el('p', 'ssa-preview');
      view.textContent = raw;                         // textContent: always treated as text
      b.append(view);
      b.append(badge('ok', 'Safe: shown as text'));
      out.append(a, b);
    }
    input.addEventListener('input', update);
    update();
    return root;
  }

  /* ---------- assemble ---------- */
  function build(host) {
    host.replaceChildren();
    host.classList.add('ssa-lab--ready');
    host.append(el('h4', null, 'Input handling lab'));
    host.append(el('p', 'ssa-intro', 'Try attacks and awkward but genuine input, and see how each defence responds.'));

    const tabs = [
      { id: 'sql', label: 'SQL query', build: buildSql },
      { id: 'validate', label: 'Validate a field', build: buildValidate },
      { id: 'encode', label: 'Encode output', build: buildEncode }
    ];
    const list = el('div', 'ssa-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Input handling testers');
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
      const b = el('button', 'ssa-tab', t.label);
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
      const pane = el('div', 'ssa-tabpanel');
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
    document.querySelectorAll('[data-ssa-lab]').forEach(build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
