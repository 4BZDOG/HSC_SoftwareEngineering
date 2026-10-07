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

/* Secure Software Architecture: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Hashing and salting: a hash is a one-way fingerprint; a salt stops two equal passwords looking equal and stops a pre-made table.
   2. Access control: authentication (401) against authorisation (403), and why the server must check.
   3. Practice sets: which security concept, and which vulnerability.
   Hashing here is plain SHA-256 so that the values can be checked; real password storage uses a slow, purpose-built algorithm. */
(() => {
  'use strict';
  const el = Labs.el;
  const code = text => () => el('pre', 'lab-code ssa-snip', text);

// compact synchronous SHA-256 for the teaching lab (UTF-8 input, hex output)
function sha256(msg) {
  const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const bytes = new TextEncoder().encode(msg), l = bytes.length, total = ((l + 9 + 63) >> 6) << 6, buf = new Uint8Array(total);
  buf.set(bytes); buf[l] = 0x80;
  const dv = new DataView(buf.buffer); dv.setUint32(total - 8, Math.floor(l * 8 / 4294967296)); dv.setUint32(total - 4, (l * 8) >>> 0);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64), rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < total; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0; }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) { const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) >>> 0, S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) >>> 0; h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0; }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map(x => x.toString(16).padStart(8, '0')).join('');
}

  /* ---------- 1. Hashing and salting ---------- */
  function buildHash(host) {
    Labs.shell(host, 'ssa-hash', 'Hashing and salting', 'A hash function turns any input into a fixed-length fingerprint. It is one-way: you cannot get the input back from the hash, but the same input always gives the same hash. Type a password, change one letter, then see why a salt matters.');
    const f = el('div', 'lab-field'), l = el('label', null, 'Password'), inp = el('input'); l.htmlFor = inp.id = 'ssa-h-in'; inp.type = 'text'; inp.value = 'sunshine1'; inp.maxLength = 40; inp.autocomplete = 'off'; f.append(l, inp);
    const row = el('div', 'lab-row'); row.append(f); host.append(row);
    const hashBox = el('div', 'ssa-hash-box'); const cmp = el('div', 'ssa-hash-box');
    const stats = el('div', 'lab-stats'); host.append(el('h5', 'lab-sub', 'A. One-way and sensitive to every change'), hashBox, cmp, stats);
    const b = el('div', 'lab-actions'); const bSave = el('button', 'lab-btn', 'Remember this hash to compare'); bSave.type = 'button'; b.append(bSave); host.append(b);
    let saved = null;
    function hexDiffBits(a, c) { let n = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(c[i], 16); while (x) { n += x & 1; x >>= 1; } } return n; }
    function showHash(box, label, hex, other) { box.replaceChildren(el('span', 'ssa-hash-label', label)); const c = el('code', 'ssa-hash-hex'); hex.split('').forEach((ch, i) => c.append(el('span', other && other[i] !== ch ? 'is-diff' : null, ch))); box.append(c); }
    function updateA() {
      const h = sha256(inp.value); showHash(hashBox, 'SHA-256 of "' + inp.value + '" (' + h.length * 4 + ' bits as ' + h.length + ' hex digits)', h, saved);
      cmp.replaceChildren(); stats.replaceChildren();
      const stat = (a, c) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, c)); stats.append(s); };
      stat('Length of input', inp.value.length + ' characters'); stat('Length of hash', '64 hex digits (always)');
      if (saved) { const bits = hexDiffBits(h, saved); stat('Bits different from the saved hash', bits + ' of 256 (' + Math.round(bits / 2.56) + '%)'); showHash(cmp, 'Saved hash, with the digits that differ marked', saved, h); }
      else stat('Try this', 'Press Remember, then change one letter');
    }
    bSave.addEventListener('click', () => { saved = sha256(inp.value); updateA(); });
    inp.addEventListener('input', () => { updateA(); updateB(); });

    // Part B: salting
    host.append(el('h5', 'lab-sub', 'B. Three users choose the same password'));
    const salt = el('label', 'lab-check'), cb = el('input'); cb.type = 'checkbox'; salt.append(cb, document.createTextNode('Add a different random salt to each user\'s password before hashing'));
    host.append(salt);
    const tab = Labs.table(['User', 'Salt (stored)', 'Hash stored in the database'], { stack: true }); host.append(tab.wrap);
    const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(out);
    const bw = el('div', 'lab-actions'); const bAtk = el('button', 'lab-btn', 'Attacker: try a list of common passwords'); bAtk.type = 'button'; bw.append(bAtk); host.append(bw);
    const atk = el('div', 'lab-feedback is-info'); atk.hidden = true; atk.setAttribute('role', 'status'); host.append(atk);
    host.append(el('p', 'lab-note', 'Real systems use a slow algorithm made for passwords (such as bcrypt, scrypt or Argon2), with a unique salt for each user, so that every guess costs an attacker real time. Plain SHA-256 is fast, which is useful for checking files but a weakness for passwords. Passwords must never be stored as plain text, and must never be stored with a reversible encryption either.'));
    const users = ['ava', 'ben', 'cara'], SALTS = ['x7Qa91', 'p3Ld0m', 'k8Zt52'];
    function updateB() {
      tab.clear();
      const hs = users.map((u, i) => sha256((cb.checked ? SALTS[i] : '') + inp.value));
      users.forEach((u, i) => tab.add([u, cb.checked ? SALTS[i] : '(none)', hs[i].slice(0, 24) + '…']).lastElementChild.classList.add('lab-wide'));
      const same = new Set(hs).size === 1;
      out.className = 'lab-readout ' + (same ? 'is-bad' : 'is-good');
      out.textContent = same ? 'All three hashes are identical, so anyone who steals the table can see at once that Ava, Ben and Cara share a password. If one of them is cracked, all three are.' : 'The same password gives three different hashes, because each user\'s salt is different. An attacker cannot tell that the passwords match, and must attack each user separately.';
      atk.hidden = true;
    }
    bAtk.addEventListener('click', () => {
      const words = ['password', '123456', 'qwerty', 'letmein', 'sunshine1', 'iloveyou', 'dragon', 'football'];
      const users3 = users.map((u, i) => ({ u, salt: cb.checked ? SALTS[i] : '', h: sha256((cb.checked ? SALTS[i] : '') + inp.value) }));
      let work = 0, found = [];
      if (!cb.checked) { const table = {}; words.forEach(w => { table[sha256(w)] = w; work++; }); users3.forEach(x => { if (table[x.h]) found.push(x.u + ' = ' + table[x.h]); }); }
      else users3.forEach(x => { words.forEach(w => { work++; if (sha256(x.salt + w) === x.h) found.push(x.u + ' = ' + w); }); });
      atk.hidden = false; atk.className = 'lab-feedback ' + (found.length ? 'is-bad' : 'is-good');
      atk.textContent = (cb.checked ? 'With salts, the attacker must hash every guess once for every user: ' : 'Without salts, one pre-computed table of hashes works against every user at once: ') + work + ' hash calculations for ' + words.length + ' guesses. ' + (found.length ? 'Cracked: ' + found.join(', ') + '.' : 'Nothing matched this small list, but a real attack would try billions of guesses.');
    });
    cb.addEventListener('change', updateB);
    updateA(); updateB();
  }

  /* ---------- 2. Access control ---------- */
  const ROLES = { guest: { n: 'Not signed in', signedIn: false, can: [] }, student: { n: 'Student (Ava)', signedIn: true, can: ['own'] }, teacher: { n: 'Teacher (Mr Lee)', signedIn: true, can: ['own', 'class', 'edit'] }, admin: { n: 'Administrator', signedIn: true, can: ['own', 'class', 'edit', 'delete', 'audit'] } };
  const ACTIONS = { own: 'View my own marks', class: 'View the whole class\'s marks', edit: 'Edit a mark', delete: 'Delete a student record', audit: 'View the audit log' };
  function buildAccess(host) {
    Labs.shell(host, 'ssa-access', 'Who is allowed to do what?', 'A results website receives a request. First it must know who is asking (authentication), then decide whether that person may do this (authorisation). Each request is also written to an audit log (accountability). Choose a user and an action and send the request.');
    const st = { who: 'student', act: 'edit', check: true, log: [] };
    const row = el('div', 'lab-row');
    const f1 = el('div', 'lab-field'), l1 = el('label', null, 'Who is signed in'), s1 = el('select'); l1.htmlFor = s1.id = 'ssa-ac-who'; Object.keys(ROLES).forEach(k => { const o = el('option', null, ROLES[k].n); o.value = k; s1.append(o); }); s1.value = st.who; f1.append(l1, s1);
    const f2 = el('div', 'lab-field'), l2 = el('label', null, 'Action requested'), s2 = el('select'); l2.htmlFor = s2.id = 'ssa-ac-act'; Object.keys(ACTIONS).forEach(k => { const o = el('option', null, ACTIONS[k]); o.value = k; s2.append(o); }); s2.value = st.act; f2.append(l2, s2);
    const send = el('button', 'lab-btn lab-btn--primary', 'Send the request'); send.type = 'button';
    row.append(f1, f2, send); host.append(row);
    const cb = el('input'); cb.type = 'checkbox'; cb.checked = true; const lab = el('label', 'lab-check'); lab.append(cb, document.createTextNode('The server checks permissions on every request (turn off to see a common mistake: the page only hides the buttons)')); host.append(lab);
    const ui = el('div', 'lab-panel'); ui.append(el('h5', null, 'What this user sees in the page')); const btns = el('div', 'lab-chips'); ui.append(btns); host.append(ui);
    const res = el('div', 'lab-feedback is-info'); res.setAttribute('role', 'status'); res.hidden = true; host.append(res);
    const tab = Labs.table(['Time', 'User', 'Request', 'Result'], { stack: true }); host.append(el('h5', 'lab-sub', 'Audit log (accountability)'), tab.wrap);
    host.append(el('p', 'lab-note', '401 Unauthorized really means "not authenticated": the server does not know who you are. 403 Forbidden means "authenticated, but not allowed". Hiding a button is a convenience, not security: anyone can send a request by hand, so the server has to check every time.'));
    let t = 0;
    function drawUi() { btns.replaceChildren(); ROLES[st.who].can.forEach(a => { const c = el('span', 'lab-badge is-info', ACTIONS[a]); btns.append(c); }); if (!ROLES[st.who].can.length) btns.append(el('span', 'lab-note', st.who === 'guest' ? 'A sign-in form only.' : 'Nothing.')); }
    function sendReq() {
      const r = ROLES[st.who]; let code, why;
      if (!r.signedIn) { code = 401; why = 'The server cannot tell who is asking, so it refuses: 401 Unauthorized (authentication failed).'; }
      else if (st.check && !r.can.includes(st.act)) { code = 403; why = 'The server knows who it is (' + r.n + '), but this role may not ' + ACTIONS[st.act].toLowerCase() + ': 403 Forbidden (authorisation failed).'; }
      else if (!st.check && !r.can.includes(st.act)) { code = 200; why = 'The page did not show this button to ' + r.n + ', but nothing on the server stopped the request, so it succeeded. This is broken access control: the permission check must happen on the server.'; }
      else { code = 200; why = 'Signed in and allowed: 200 OK.'; }
      res.hidden = false; res.className = 'lab-feedback ' + (code === 200 ? (!st.check && !r.can.includes(st.act) ? 'is-bad' : 'is-good') : 'is-warn'); res.textContent = code + ': ' + why;
      t += 7; const stamp = '09:' + String(10 + Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
      st.log.unshift([stamp, r.signedIn ? r.n : '(unknown)', ACTIONS[st.act], String(code)]); st.log = st.log.slice(0, 6); tab.clear(); st.log.forEach(x => tab.add(x));
    }
    send.addEventListener('click', sendReq); s1.addEventListener('change', () => { st.who = s1.value; res.hidden = true; drawUi(); }); s2.addEventListener('change', () => { st.act = s2.value; }); cb.addEventListener('change', () => { st.check = cb.checked; });
    drawUi();
  }

  /* ---------- 3. Practice sets ---------- */
  function buildConcepts(host) {
    Labs.sorter(host, {
      cls: 'ssa-conceptsort', keepCase: true, title: 'Which security concept?',
      lead: 'Each situation shows one of the six concepts. Remember: authentication is who you are, authorisation is what you may do, accountability is proof of what you did.',
      noun: 'situation', groupLabel: 'Security concept',
      choices: ['Confidentiality', 'Integrity', 'Availability', 'Authentication', 'Authorisation', 'Accountability'].map(k => ({ key: k, label: k })),
      items: [
        { text: 'A patient\'s record is encrypted, so a stolen laptop reveals nothing.', ans: 'Confidentiality', why: 'Only people who are allowed to read the data can read it.' },
        { text: 'A digital signature shows that a software update has not been altered since it was published.', ans: 'Integrity', why: 'Changes are detected, so the data can be trusted to be accurate and complete.' },
        { text: 'An online ticket shop stays up, using extra servers, when thousands of fans arrive at once.', ans: 'Availability', why: 'The service is usable when it is needed.' },
        { text: 'A banking app asks for a fingerprint before opening.', ans: 'Authentication', why: 'It verifies who the user is before anything else happens.' },
        { text: 'A librarian can add books, but a visitor can only search them.', ans: 'Authorisation', why: 'Once the user is known, what they are allowed to do depends on their role.' },
        { text: 'Every change to a bank balance records who made it and when, in a log that cannot be edited.', ans: 'Accountability', why: 'Actions can be traced back to a person, so misuse can be investigated.' },
        { text: 'A login form shows the same message ("incorrect username or password") whichever one was wrong.', ans: 'Confidentiality', why: 'It avoids revealing which usernames exist, protecting information about accounts.' }
      ],
      closing: 'In a written answer, give each concept a one-line definition and a control that fits the scenario.'
    });
  }
  function buildVulns(host) {
    Labs.sorter(host, {
      cls: 'ssa-vulnsort', keepCase: true, title: 'Which vulnerability is it?',
      lead: 'Each snippet or description shows a weakness in how user actions are handled. Name the vulnerability, then read how to fix it.',
      noun: 'example', groupLabel: 'Vulnerability',
      choices: [{ key: 'SQL injection', label: 'SQL injection' }, { key: 'Cross-site scripting (XSS)', label: 'XSS' }, { key: 'Cross-site request forgery (CSRF)', label: 'CSRF' }, { key: 'Broken authentication', label: 'Broken authentication' }, { key: 'Race condition', label: 'Race condition' }, { key: 'Invalid redirect', label: 'Invalid redirect' }],
      items: [
        { text: 'A search page builds its query from what the user types.', visual: code('db.execute("SELECT * FROM students WHERE surname = \'" + name + "\'")'), ans: 'SQL injection', why: 'The input becomes part of the SQL command, so a value such as \' OR \'1\'=\'1 changes its meaning. Fix: a parameterised query.' },
        { text: 'A comment is shown on a page exactly as it was typed.', visual: code('page = "<p>" + comment + "</p>"'), ans: 'Cross-site scripting (XSS)', why: 'A comment containing a script tag would run in other visitors\' browsers. Fix: encode output (turn < into &lt;) and validate input.' },
        { text: 'A bank site changes an account detail whenever a signed-in user\'s browser sends this request, with no further check. A fake page on another site makes the browser send it.', visual: code('POST /transfer?to=4421&amount=500'), ans: 'Cross-site request forgery (CSRF)', why: 'The browser attaches the user\'s session automatically, so the server cannot tell who really asked. Fix: an anti-CSRF token on every state-changing request, and SameSite cookies.' },
        { text: 'Anyone can try unlimited passwords for an account, and the error message says which part was wrong.', ans: 'Broken authentication', why: 'No lockout or rate limit makes guessing easy, and the detailed message confirms valid usernames. Fix: lock out or slow repeated failures, one general message, and multi-factor authentication.' },
        { text: 'Two requests withdraw money at the same moment. Both read a balance of 100 and both succeed.', visual: code('if balance >= amount:\n    balance = balance - amount'), ans: 'Race condition', why: 'The check and the update are separate steps, and another request slips in between. Fix: make them one atomic step with a lock or a database transaction.' },
        { text: 'After sign-in, the site sends the user wherever the web address says.', visual: code('redirect(request.args["next"])'), ans: 'Invalid redirect', why: 'An attacker can send a link whose next value is a fake site. Fix: only redirect to an allow-list of known destinations.' }
      ],
      closing: 'Most of these come down to the same rule: never trust input, and check on the server every time.'
    });
  }

  function init2() {
    document.querySelectorAll('[data-ssalab="hash"]').forEach(buildHash);
    document.querySelectorAll('[data-ssalab="access"]').forEach(buildAccess);
    document.querySelectorAll('[data-ssalab="concepts"]').forEach(buildConcepts);
    document.querySelectorAll('[data-ssalab="vulns"]').forEach(buildVulns);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init2); else init2();
})();
