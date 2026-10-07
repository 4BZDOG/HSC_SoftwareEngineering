/* Programming Fundamentals: number base and two's complement workbench.
   Type a value in decimal, binary or hexadecimal (or click the bits) and it shows the same
   pattern in all three bases, the unsigned and two's complement values, and the working a
   student would write. A short self-check asks for a two's complement conversion.
   Vanilla JS; every value shown is written with textContent. A static description stays in
   the page if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const MINUS = '−';
  const neg = v => (v < 0 ? MINUS + Math.abs(v) : String(v));
  const pow2 = n => Math.pow(2, n);
  const HEX = '0123456789ABCDEF';

  const pad = (str, n) => str.padStart(n, '0');
  const group4 = s => s.replace(/(.{4})(?=.)/g, '$1 ');
  const toBin = (u, n) => pad(u.toString(2), n);
  const invert = s => s.replace(/[01]/g, c => (c === '0' ? '1' : '0'));

  function build(root) {
    let n = 8;
    let bits = new Array(n).fill(0);
    let base = 'dec';
    let source = { kind: 'start' };   // what produced the current bits: dec, bin, hex, toggle, step
    let note = '';

    /* ── Skeleton ─────────────────────────────────────────── */
    root.replaceChildren();
    root.appendChild(el('h4', null, 'Number base and two’s complement workbench'));
    root.appendChild(el('p', 'nl-lead', 'Enter a number, or click bits to flip them. The working underneath is what you would write in an exam.'));

    const ctl = el('div', 'nl-controls');
    const seg = el('div', 'nl-seg');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Base of the number you type');
    const baseBtns = {};
    [['dec', 'Decimal'], ['bin', 'Binary'], ['hex', 'Hexadecimal']].forEach(([k, label]) => {
      const b = el('button', 'nl-btn', label);
      b.type = 'button';
      b.addEventListener('click', () => { base = k; syncBase(); apply(); });
      baseBtns[k] = b;
      seg.appendChild(b);
    });
    const inWrap = el('div', 'nl-field');
    const inLabel = el('label', null, 'Value');
    const input = el('input', 'nl-input');
    input.type = 'text';
    input.id = 'nl-value-' + Math.random().toString(36).slice(2, 7);
    input.setAttribute('inputmode', 'text');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    inLabel.htmlFor = input.id;
    inWrap.append(inLabel, input);
    const wWrap = el('div', 'nl-field');
    const wLabel = el('label', null, 'Bits');
    const wSel = el('select', 'nl-input');
    wSel.id = input.id + '-w';
    wLabel.htmlFor = wSel.id;
    [4, 8, 16].forEach(w => { const o = el('option', null, w + '-bit'); o.value = String(w); if (w === n) o.selected = true; wSel.appendChild(o); });
    wWrap.append(wLabel, wSel);
    ctl.append(seg, inWrap, wWrap);
    root.appendChild(ctl);

    const msg = el('p', 'nl-msg');
    msg.setAttribute('role', 'status');
    root.appendChild(msg);

    const bitsBox = el('div', 'nl-bits');
    bitsBox.setAttribute('role', 'group');
    bitsBox.setAttribute('aria-label', 'Bits, most significant first. Press a bit to flip it.');
    root.appendChild(bitsBox);

    const nudge = el('div', 'nl-nudge');
    const plus = el('button', 'nl-btn nl-btn-quiet', 'Add 1');
    const minus = el('button', 'nl-btn nl-btn-quiet', 'Subtract 1');
    const zero = el('button', 'nl-btn nl-btn-quiet', 'Clear');
    [plus, minus, zero].forEach(b => { b.type = 'button'; nudge.appendChild(b); });
    root.appendChild(nudge);

    const res = el('dl', 'nl-results');
    const tiles = {};
    [['bin', 'Binary'], ['hex', 'Hexadecimal'], ['uns', 'Unsigned decimal'], ['sig', 'Two’s complement decimal']].forEach(([k, label]) => {
      const d = el('div');
      d.append(el('dt', null, label));
      tiles[k] = el('dd');
      d.appendChild(tiles[k]);
      res.appendChild(d);
    });
    root.appendChild(res);

    root.appendChild(el('h5', 'nl-h', 'Working'));
    const steps = el('ol', 'nl-steps');
    root.appendChild(steps);

    /* Self-check */
    const chk = el('details', 'nl-check');
    chk.appendChild(el('summary', null, 'Self-check: two’s complement challenge'));
    const chkQ = el('p', 'nl-q');
    chkQ.setAttribute('aria-live', 'polite');
    const chkRow = el('div', 'nl-check-row');
    const chkIn = el('input', 'nl-input');
    chkIn.type = 'text';
    chkIn.id = input.id + '-c';
    chkIn.setAttribute('autocomplete', 'off');
    chkIn.setAttribute('spellcheck', 'false');
    chkIn.setAttribute('aria-label', 'Your answer');
    const chkGo = el('button', 'nl-btn', 'Check');
    chkGo.type = 'button';
    const chkNew = el('button', 'nl-btn nl-btn-quiet', 'New question');
    chkNew.type = 'button';
    chkRow.append(chkIn, chkGo, chkNew);
    const chkFb = el('div', 'nl-fb');
    chkFb.setAttribute('aria-live', 'polite');
    chk.append(chkQ, chkRow, chkFb);
    root.appendChild(chk);

    /* ── Maths ────────────────────────────────────────────── */
    const unsignedOf = b => b.reduce((a, x) => a * 2 + x, 0);
    const signedOf = (b, w) => (b[0] ? unsignedOf(b) - pow2(w) : unsignedOf(b));
    const setFrom = u => { u = ((u % pow2(n)) + pow2(n)) % pow2(n); bits = toBin(u, n).split('').map(Number); };
    const range = () => `${n} bits hold ${neg(-pow2(n - 1))} to ${pow2(n - 1) - 1} as two’s complement, or 0 to ${pow2(n) - 1} unsigned`;

    function divisionLines(v) {
      const lines = [];
      let q = v;
      if (q === 0) return ['0 needs no division: every bit is 0'];
      while (q > 0) { lines.push(`${q} ÷ 2 = ${Math.floor(q / 2)} remainder ${q % 2}`); q = Math.floor(q / 2); }
      return lines;
    }

    // Working for turning a bit pattern into values
    function readBitsWorking(b, w) {
      const out = [];
      const u = unsignedOf(b);
      const terms = [];
      b.forEach((x, i) => { if (x) terms.push(pow2(w - 1 - i)); });
      out.push({ text: `Unsigned: add the place values that hold a 1.`, lines: [terms.length ? terms.join(' + ') + ' = ' + u : 'No 1s, so the value is 0'] });
      if (!b[0]) {
        out.push({ text: `Two’s complement: the left-hand (sign) bit is 0, so the number is positive and equals the unsigned value: ${u}.` });
      } else {
        const inv = invert(toBin(u, w));
        const mag = pad((parseInt(inv, 2) + 1).toString(2), w);
        out.push({ text: 'Two’s complement: the sign bit is 1, so the number is negative. Invert the bits, add 1, and put a minus sign in front.',
          lines: [`invert  ${group4(toBin(u, w))}  →  ${group4(inv)}`, `add 1   ${group4(inv)}  →  ${group4(mag.slice(-w))}  = ${parseInt(inv, 2) + 1}`, `so the value is ${MINUS}${parseInt(inv, 2) + 1}`] });
        out.push({ text: `Check with a signed place value: the sign bit is worth ${MINUS}${pow2(w - 1)}. ${MINUS}${pow2(w - 1)} + ${u - pow2(w - 1)} = ${neg(u - pow2(w))}.` });
      }
      return out;
    }

    function working() {
      const out = [];
      const u = unsignedOf(bits);
      if (source.kind === 'dec') {
        const v = source.value;
        if (v >= 0) {
          out.push({ text: `Divide ${v} by 2 repeatedly and record each remainder.`, lines: divisionLines(v) });
          const bin = v.toString(2);
          out.push({ text: `Read the remainders from the bottom up: ${bin}. Pad with 0s on the left to fill ${n} bits: ${group4(toBin(u, n))}.` });
          if (v >= pow2(n - 1)) out.push({ text: `The left-hand bit is 1, so read as two’s complement this pattern means ${neg(signedOf(bits, n))}. To keep ${v} positive you need more than ${n} bits.` });
        } else {
          const m = -v;
          out.push({ text: `Write the positive number ${m} in ${n} bits.`, lines: divisionLines(m).concat([`${m} = ${group4(toBin(m, n))}`]) });
          out.push({ text: 'Invert every bit (0 becomes 1, 1 becomes 0).', lines: [`${group4(toBin(m, n))}  →  ${group4(invert(toBin(m, n)))}`] });
          out.push({ text: 'Add 1.', lines: [`${group4(invert(toBin(m, n)))} + 1 = ${group4(toBin(u, n))}`] });
          out.push({ text: `So ${MINUS}${m} is ${group4(toBin(u, n))} in ${n}-bit two’s complement. The sign bit is 1, as it must be for a negative number.` });
          if (m === pow2(n - 1)) out.push({ text: `${MINUS}${m} is the most negative value. It has no positive partner: +${m} would need ${n + 1} bits.` });
        }
      } else if (source.kind === 'hex') {
        const digits = source.digits.split('');
        out.push({ text: 'Each hexadecimal digit stands for exactly four bits.', lines: digits.map(d => `${d} = ${pad(parseInt(d, 16).toString(2), 4)}`).concat([`Joined: ${group4(pad(digits.map(d => pad(parseInt(d, 16).toString(2), 4)).join(''), n))}`]) });
        readBitsWorking(bits, n).forEach(s => out.push(s));
      } else if (source.kind === 'bin') {
        if (source.raw.length < n) out.push({ text: `Pad on the left with 0s to fill ${n} bits: ${group4(toBin(u, n))}.` });
        readBitsWorking(bits, n).forEach(s => out.push(s));
        out.push({ text: 'To get hexadecimal, split the bits into groups of four and convert each group.', lines: toBin(u, n).match(/.{4}/g).map(g => `${g} = ${HEX[parseInt(g, 2)]}`) });
      } else {
        readBitsWorking(bits, n).forEach(s => out.push(s));
        if (source.kind === 'step' && source.overflow) out.push({ text: source.overflow });
      }
      return out;
    }

    /* ── Rendering ────────────────────────────────────────── */
    function syncBase() {
      Object.keys(baseBtns).forEach(k => baseBtns[k].setAttribute('aria-pressed', String(k === base)));
      input.placeholder = base === 'dec' ? `e.g. ${MINUS}5 or 200` : base === 'bin' ? 'e.g. 11111011' : 'e.g. FB';
    }

    function renderBits() {
      bitsBox.replaceChildren();
      for (let start = 0; start < n; start += 8) {
        const row = el('div', 'nl-bitrow');
        bits.slice(start, start + 8).forEach((b, j) => {
          const i = start + j;
          const cell = el('div', 'nl-bitcell');
          const w = pow2(n - 1 - i);
          cell.appendChild(el('span', 'nl-place' + (i === 0 ? ' is-sign' : ''), i === 0 ? MINUS + w : String(w)));
          const btn = el('button', 'nl-bit' + (b ? ' is-on' : '') + (i === 0 ? ' is-sign' : ''), String(b));
          btn.type = 'button';
          btn.setAttribute('aria-pressed', String(!!b));
          btn.setAttribute('aria-label', `Bit ${n - 1 - i}, place value ${i === 0 ? MINUS : ''}${w}, currently ${b}. Press to flip.`);
          btn.addEventListener('click', () => {
            bits[i] = bits[i] ? 0 : 1;
            source = { kind: 'toggle' };
            note = '';
            input.value = '';
            render();
            const again = bitsBox.querySelectorAll('.nl-bit')[i];
            if (again) again.focus();
          });
          cell.appendChild(btn);
          row.appendChild(cell);
        });
        bitsBox.appendChild(row);
      }
    }

    function render() {
      const u = unsignedOf(bits);
      const s = signedOf(bits, n);
      renderBits();
      tiles.bin.textContent = group4(toBin(u, n));
      tiles.hex.textContent = '0x' + pad(u.toString(16).toUpperCase(), n / 4);
      tiles.uns.textContent = String(u);
      tiles.sig.textContent = neg(s);
      steps.replaceChildren();
      working().forEach(st => {
        const li = el('li');
        li.appendChild(el('span', null, st.text));
        if (st.lines) li.appendChild(el('pre', 'nl-lines', st.lines.join('\n')));
        steps.appendChild(li);
      });
      msg.textContent = note;
      msg.className = 'nl-msg' + (note ? ' is-on' : '');
    }

    /* ── Input handling ───────────────────────────────────── */
    function apply() {
      const raw = input.value.trim();
      note = '';
      if (!raw) { return; }
      if (base === 'dec') {
        const t = raw.replace(/−/g, '-');
        if (!/^[+-]?\d+$/.test(t)) { note = 'Type a whole number, such as 25 or ' + MINUS + '5.'; render(); return; }
        const v = parseInt(t, 10);
        if (v < -pow2(n - 1) || v > pow2(n) - 1) { note = `${neg(v)} does not fit: ${range()}.`; render(); return; }
        setFrom(v);
        source = { kind: 'dec', value: v };
      } else if (base === 'bin') {
        const t = raw.replace(/[\s_]/g, '');
        if (!/^[01]+$/.test(t)) { note = 'Binary uses only the digits 0 and 1.'; render(); return; }
        if (t.length > n) { note = `${t.length} bits will not fit in ${n} bits. Choose a wider size or shorten the number.`; render(); return; }
        setFrom(parseInt(t, 2));
        source = { kind: 'bin', raw: t };
      } else {
        const t = raw.replace(/^0x/i, '').replace(/[\s_]/g, '').toUpperCase();
        if (!/^[0-9A-F]+$/.test(t)) { note = 'Hexadecimal uses the digits 0 to 9 and the letters A to F.'; render(); return; }
        if (t.length > n / 4) { note = `${t.length} hex digits need ${t.length * 4} bits, which will not fit in ${n} bits.`; render(); return; }
        setFrom(parseInt(t, 16));
        source = { kind: 'hex', digits: pad(t, n / 4) };
      }
      render();
    }

    input.addEventListener('input', apply);
    wSel.addEventListener('change', () => {
      const keep = signedOf(bits, n);
      n = parseInt(wSel.value, 10);
      if (keep >= -pow2(n - 1) && keep <= pow2(n - 1) - 1) setFrom(keep); else bits = new Array(n).fill(0);
      source = { kind: 'toggle' };
      note = '';
      if (input.value.trim()) { apply(); return; }
      render();
    });

    function nudgeBy(d) {
      const before = signedOf(bits, n);
      const max = pow2(n - 1) - 1, min = -pow2(n - 1);
      setFrom(unsignedOf(bits) + d);
      source = { kind: 'step' };
      input.value = '';
      note = '';
      if (d > 0 && before === max) {
        source.overflow = `Overflow: the largest ${n}-bit value (${max}) plus 1 carries into the sign bit and wraps round to ${neg(min)}.`;
        note = 'Overflow: the value wrapped from the top of the range to the bottom.';
      } else if (d < 0 && before === min) {
        source.overflow = `Overflow: the smallest ${n}-bit value (${neg(min)}) minus 1 wraps round to ${max}.`;
        note = 'Overflow: the value wrapped from the bottom of the range to the top.';
      }
      render();
    }
    plus.addEventListener('click', () => nudgeBy(1));
    minus.addEventListener('click', () => nudgeBy(-1));
    zero.addEventListener('click', () => { bits = new Array(n).fill(0); source = { kind: 'toggle' }; input.value = ''; note = ''; render(); });

    /* ── Self-check (always 8 bits) ───────────────────────── */
    let q = null;
    const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    function newQ() {
      chkFb.replaceChildren();
      chkIn.value = '';
      if (Math.random() < 0.5) {
        const m = ri(3, 127);
        q = { kind: 'toBits', m };
        chkQ.textContent = `Write ${MINUS}${m} as an 8-bit two’s complement number (eight 0s and 1s).`;
        chkIn.placeholder = '8 bits';
      } else {
        const v = -ri(1, 128);
        q = { kind: 'toDec', v };
        chkQ.textContent = `What decimal number is ${group4(toBin(v + 256, 8))} in 8-bit two’s complement?`;
        chkIn.placeholder = 'e.g. ' + MINUS + '19';
      }
    }
    function checkQ() {
      if (!q) newQ();
      const t = chkIn.value.trim().replace(/−/g, '-').replace(/[\s_]/g, '');
      let ok, b;
      if (q.kind === 'toBits') {
        const want = toBin(256 - q.m, 8);
        ok = t === want;
        b = readBitsWorking(want.split('').map(Number), 8);
        chkFb.replaceChildren(el('p', ok ? 'nl-ok' : 'nl-no', ok ? 'Correct.' : 'Not quite. ' + (/^[01]{8}$/.test(t) ? '' : 'Give exactly eight 0s and 1s. ') + `The answer is ${group4(want)}.`));
        const ol = el('ol', 'nl-steps');
        [{ text: `Write ${q.m} in 8 bits: ${group4(toBin(q.m, 8))}.` }, { text: `Invert: ${group4(invert(toBin(q.m, 8)))}.` }, { text: `Add 1: ${group4(want)}.` }].forEach(st => { const li = el('li'); li.appendChild(el('span', null, st.text)); ol.appendChild(li); });
        chkFb.appendChild(ol);
      } else {
        ok = t === String(q.v);
        b = readBitsWorking(toBin(q.v + 256, 8).split('').map(Number), 8);
        chkFb.replaceChildren(el('p', ok ? 'nl-ok' : 'nl-no', ok ? 'Correct.' : `Not quite. The answer is ${neg(q.v)}.`));
        const ol = el('ol', 'nl-steps');
        b.slice(1).forEach(st => { const li = el('li'); li.appendChild(el('span', null, st.text)); if (st.lines) li.appendChild(el('pre', 'nl-lines', st.lines.join('\n'))); ol.appendChild(li); });
        chkFb.appendChild(ol);
      }
    }
    chkGo.addEventListener('click', checkQ);
    chkIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkQ(); } });
    chkNew.addEventListener('click', newQ);
    chk.addEventListener('toggle', () => { if (chk.open && !q) newQ(); });

    // Start with a worked example so the page is never empty
    base = 'dec';
    input.value = MINUS + '5';
    syncBase();
    apply();
  }

  document.querySelectorAll('[data-pf-numlab]').forEach(build);
})();

/* Programming Fundamentals: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Floating point explorer: the 32 bits of a single precision number, and why 0.1 is not stored exactly.
   2. Data structure playground: a stack, a hash table and a binary search tree.
   3. Debugger: breakpoints, stepping and watches on a small buggy program.
   4. Practice sets: syntax, logic or runtime error, and which programming paradigm. */
(() => {
  'use strict';
  const el = Labs.el;
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };
  const code = text => () => { const p = el('pre', 'lab-code pf-snip', text); return p; };

  /* ---------- 1. Floating point explorer ---------- */
  function buildFloat(host) {
    Labs.shell(host, 'pf-float', 'Single precision floating point explorer', 'A single precision float uses 32 bits: 1 for the sign, 8 for the exponent and 23 for the fraction. Type a decimal number and see the bits that are stored, and the value that the computer really keeps.');
    const f = el('div', 'lab-field'), l = el('label', null, 'A decimal number'), inp = el('input'); l.htmlFor = inp.id = 'pf-fl-in'; inp.type = 'text'; inp.value = '0.1'; inp.inputMode = 'decimal'; inp.autocomplete = 'off'; f.append(l, inp);
    const chips = el('div', 'lab-chips');
    [['0.1', '0.1'], ['0.5', '0.5'], ['−2.5', '-2.5'], ['3.14159', '3.14159'], ['16 777 217', '16777217'], ['1 000 000 000', '1000000000'], ['0.3', '0.3']].forEach(p => { const b = el('button', 'lab-chip', p[0]); b.type = 'button'; b.addEventListener('click', () => { inp.value = p[1]; update(); }); chips.append(b); });
    const row = el('div', 'lab-row'); row.append(f); host.append(row, chips);
    const bits = el('div', 'pf-fl-bits'); bits.setAttribute('role', 'img');
    const stats = el('div', 'lab-stats');
    const out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    host.append(bits, stats, out);
    host.append(el('p', 'lab-note', 'Python\'s own float is double precision (64 bits), so on its own it needs about twice as many digits to show the same effect. The idea is the same: most decimal fractions cannot be written exactly in binary, just as one third cannot be written exactly in decimal.'));
    const buf = new ArrayBuffer(4), fv = new Float32Array(buf), uv = new Uint32Array(buf);
    function update() {
      const text = inp.value.trim().replace('−', '-');
      bits.replaceChildren(); stats.replaceChildren();
      const x = Number(text);
      if (text === '' || !isFinite(x)) { out.className = 'lab-readout is-bad'; out.textContent = 'Type a number such as 0.1 or -2.5.'; bits.setAttribute('aria-label', 'No valid number.'); return; }
      fv[0] = x; const u = uv[0], s = u >>> 31, e = (u >>> 23) & 255, m = u & 0x7FFFFF;
      const str = u.toString(2).padStart(32, '0');
      const groups = [['Sign', str.slice(0, 1), 'is-sign'], ['Exponent', str.slice(1, 9), 'is-exp'], ['Fraction', str.slice(9), 'is-frac']];
      groups.forEach(g => { const box = el('div', 'pf-fl-group ' + g[2]); box.append(el('span', 'pf-fl-name', g[0] + ' (' + g[1].length + ' bit' + (g[1].length > 1 ? 's' : '') + ')')); const b = el('div', 'pf-fl-b'); g[1].split('').forEach(c => b.append(el('span', null, c))); box.append(b); bits.append(box); });
      bits.setAttribute('aria-label', 'The stored bits: sign ' + str.slice(0, 1) + ', exponent ' + str.slice(1, 9) + ', fraction ' + str.slice(9) + '.');
      const stored = fv[0];
      const stat = (a, b) => { const c = el('div', 'lab-stat'); c.append(el('span', null, a), el('b', null, b)); stats.append(c); };
      stat('You typed', text); stat('The computer stores', stored.toPrecision(17).replace(/0+$/, '').replace(/\.$/, '')); stat('Error', stored === x ? 'none' : Math.abs(stored - x).toExponential(2));
      if (e === 255) { out.className = 'lab-readout is-warn'; out.textContent = m ? 'Not a number (NaN).' : 'Too large for a single precision float: this is stored as infinity.'; return; }
      const exp = e === 0 ? -126 : e - 127, mant = e === 0 ? m / 8388608 : 1 + m / 8388608, gap = Math.pow(2, exp - 23);
      out.className = 'lab-readout ' + (stored === x ? 'is-good' : 'is-warn');
      out.replaceChildren(el('p', null, 'Value = (−1)^' + s + ' × ' + mant.toFixed(7) + ' × 2^' + exp + (e === 0 ? ' (a tiny "subnormal" number)' : ', because the stored exponent ' + e + ' minus the bias 127 is ' + exp) + '.'));
      out.append(el('p', null, stored === x ? 'This number can be stored exactly, because it is a sum of powers of two (halves, quarters, eighths and so on) that fits in 24 significant bits.' : 'This number cannot be stored exactly. The nearest floats are about ' + gap.toExponential(2) + ' apart here, so the computer keeps the closest one. That is why a single precision float is reliable to only about 7 significant digits, and why money is better stored as whole cents.'));
    }
    inp.addEventListener('input', update);
    update();
  }

  /* ---------- 2. Data structure playground ---------- */
  function buildStructures(host) {
    Labs.shell(host, 'pf-ds', 'Data structure playground', 'Try three structures from the course: a stack (last in, first out), a hash table (a key goes to a slot chosen by a hash function) and a binary search tree. Each shows what happens to the data as you use it.');
    const tabs = el('div', 'lab-seg'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Data structure');
    const panes = {}, tb = {};
    const stage = el('div', 'pf-ds-stage');
    [['stack', 'Stack'], ['hash', 'Hash table'], ['tree', 'Binary search tree']].forEach(k => { const b = el('button', null, k[1]); b.type = 'button'; b.addEventListener('click', () => show(k[0])); tabs.append(b); tb[k[0]] = b; panes[k[0]] = el('div', 'lab-stack'); stage.append(panes[k[0]]); });
    const tabRow = el('div', 'lab-row'); tabRow.append(tabs); host.append(tabRow, stage);
    function show(k) { Object.keys(panes).forEach(n => { panes[n].hidden = n !== k; tb[n].setAttribute('aria-pressed', String(n === k)); }); }

    /* Stack */
    (() => {
      const pane = panes.stack, items = [];
      const row = el('div', 'lab-row'); const f = el('div', 'lab-field'), l = el('label', null, 'Value to push'), inp = el('input'); l.htmlFor = inp.id = 'pf-st-in'; inp.type = 'text'; inp.maxLength = 12; inp.value = 'type "Hi"'; f.append(l, inp);
      const bPush = el('button', 'lab-btn lab-btn--primary', 'Push'), bPop = el('button', 'lab-btn', 'Pop'), bPeek = el('button', 'lab-btn', 'Peek'), bClr = el('button', 'lab-btn lab-btn--quiet', 'Clear');
      [bPush, bPop, bPeek, bClr].forEach(b => b.type = 'button'); row.append(f, bPush, bPop, bPeek, bClr);
      const view = el('div', 'pf-stack'); const msg = el('div', 'lab-feedback is-info'); msg.setAttribute('role', 'status');
      pane.append(row, view, msg);
      const say = (t, k) => { msg.className = 'lab-feedback ' + (k || 'is-info'); msg.textContent = t; };
      function draw() {
        view.replaceChildren();
        if (!items.length) view.append(el('div', 'pf-stack-empty', 'The stack is empty'));
        items.slice().reverse().forEach((v, i) => { const c = el('div', 'pf-stack-item' + (i === 0 ? ' is-top' : ''), v); if (i === 0) c.append(el('small', null, 'top')); view.append(c); });
        bPop.disabled = bPeek.disabled = !items.length;
      }
      bPush.addEventListener('click', () => { const v = inp.value.trim(); if (!v) return say('Type a value to push.', 'is-warn'); if (items.length >= 8) return say('Stack overflow: this stack holds at most 8 items.', 'is-bad'); items.push(v); say('push("' + v + '") puts it on top. The stack has ' + items.length + ' item' + (items.length > 1 ? 's' : '') + '.'); draw(); });
      bPop.addEventListener('click', () => { const v = items.pop(); say('pop() removes and returns "' + v + '", the item pushed most recently: last in, first out.'); draw(); });
      bPeek.addEventListener('click', () => say('peek() returns "' + items[items.length - 1] + '" but leaves it on the stack.'));
      bClr.addEventListener('click', () => { items.length = 0; say('The stack is empty. Popping an empty stack is an error called stack underflow.'); draw(); });
      ['Open file', 'Type text', 'Paste', 'Bold'].forEach(v => items.push(v)); say('A word processor\'s undo history is a stack: each action is pushed, and Undo pops the most recent one. Push a few more actions, then pop them.'); draw();
    })();

    /* Hash table */
    (() => {
      const pane = panes.hash, SIZE = 7, table = Array.from({ length: SIZE }, () => []);
      const hash = k => k.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % SIZE;
      const row = el('div', 'lab-row'); const f = el('div', 'lab-field'), l = el('label', null, 'Key (a username)'), inp = el('input'); l.htmlFor = inp.id = 'pf-ht-in'; inp.type = 'text'; inp.maxLength = 12; inp.value = 'alice'; f.append(l, inp);
      const bIns = el('button', 'lab-btn lab-btn--primary', 'Insert'), bGet = el('button', 'lab-btn', 'Look up'), bClr = el('button', 'lab-btn lab-btn--quiet', 'Clear');
      [bIns, bGet, bClr].forEach(b => b.type = 'button'); row.append(f, bIns, bGet, bClr);
      const chips = el('div', 'lab-chips'); ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'grace'].forEach(k => { const b = el('button', 'lab-chip', k); b.type = 'button'; b.addEventListener('click', () => { inp.value = k; }); chips.append(b); });
      const grid = el('div', 'pf-ht'); const msg = el('div', 'lab-feedback is-info'); msg.setAttribute('role', 'status');
      pane.append(row, chips, grid, msg);
      const say = (t, k) => { msg.className = 'lab-feedback ' + (k || 'is-info'); msg.textContent = t; };
      function draw(hl) {
        grid.replaceChildren();
        table.forEach((chain, i) => { const r = el('div', 'pf-ht-row' + (i === hl ? ' is-hl' : '')); r.append(el('span', 'pf-ht-idx', String(i))); const c = el('div', 'pf-ht-chain'); chain.forEach(k => c.append(el('span', 'pf-ht-key', k))); r.append(c); grid.append(r); });
      }
      bIns.addEventListener('click', () => {
        const k = inp.value.trim().toLowerCase(); if (!k) return say('Type a key.', 'is-warn');
        const h = hash(k); if (table[h].includes(k)) { draw(h); return say('"' + k + '" is already in slot ' + h + '. A key is stored once.', 'is-warn'); }
        table[h].push(k); draw(h);
        say('hash("' + k + '") = (' + k.split('').map(c => c.charCodeAt(0)).join(' + ') + ') mod ' + SIZE + ' = ' + h + '. The key goes in slot ' + h + (table[h].length > 1 ? '. That slot already held another key, which is a collision. This table handles it by chaining: both keys share the slot.' : '.'), table[h].length > 1 ? 'is-warn' : 'is-info');
      });
      bGet.addEventListener('click', () => {
        const k = inp.value.trim().toLowerCase(); if (!k) return say('Type a key.', 'is-warn');
        const h = hash(k), n = table[h].indexOf(k); draw(h);
        const all = table.reduce((a, c) => a.concat(c), []), scan = all.indexOf(k) + 1;
        say(n >= 0 ? 'hash("' + k + '") = ' + h + ', so look in slot ' + h + ' only. Found after ' + (n + 1) + ' comparison' + (n ? 's' : '') + (all.length > 1 ? ', where scanning the whole list in order would take ' + scan + '.' : '.') : 'hash("' + k + '") = ' + h + '. Slot ' + h + ' does not hold "' + k + '", so it is not in the table. Only one slot was checked.', n >= 0 ? 'is-good' : 'is-warn');
      });
      bClr.addEventListener('click', () => { table.forEach(c => c.length = 0); draw(-1); say('The table is empty. Insert some keys: the hash function turns each key into a slot number from 0 to 6.'); });
      ['alice', 'bob', 'carol'].forEach(k => table[hash(k)].push(k));
      draw(-1); say('A hash table finds a key without searching: the hash function turns it into a slot number. Insert dave, erin, frank and grace and watch for a collision (two keys, one slot).');
    })();

    /* Binary search tree */
    (() => {
      const pane = panes.tree; let root = null;
      const ins = (n, v) => { if (!n) return { v, l: null, r: null }; if (v < n.v) n.l = ins(n.l, v); else if (v > n.v) n.r = ins(n.r, v); return n; };
      const row = el('div', 'lab-row'); const f = el('div', 'lab-field'), l = el('label', null, 'Whole number'), inp = el('input'); l.htmlFor = inp.id = 'pf-tr-in'; inp.type = 'number'; inp.min = 0; inp.max = 99; inp.value = 45; f.append(l, inp);
      const bIns = el('button', 'lab-btn lab-btn--primary', 'Insert'), bFind = el('button', 'lab-btn', 'Search'), bOrd = el('button', 'lab-btn', 'Read in order'), bClr = el('button', 'lab-btn lab-btn--quiet', 'Reset');
      [bIns, bFind, bOrd, bClr].forEach(b => b.type = 'button'); row.append(f, bIns, bFind, bOrd, bClr);
      const box = el('div', 'lab-stage'); const svg = sv('svg', { role: 'img', 'aria-label': 'A binary search tree' }, box); const msg = el('div', 'lab-feedback is-info'); msg.setAttribute('role', 'status');
      pane.append(row, box, msg);
      const say = (t, k) => { msg.className = 'lab-feedback ' + (k || 'is-info'); msg.textContent = t; };
      function layout() { const pts = []; let idx = 0; (function walk(n, d) { if (!n) return; walk(n.l, d + 1); pts.push({ n, x: idx++, d }); walk(n.r, d + 1); })(root, 0); return pts; }
      function draw(path) {
        svg.replaceChildren(); const pts = layout(); if (!pts.length) { svg.setAttribute('viewBox', '0 0 300 50'); const t = sv('text', { x: 150, y: 30, 'text-anchor': 'middle', class: 'pf-tr-txt' }, svg); t.textContent = 'The tree is empty'; return; }
        const gx = 40, gy = 52, W = Math.max(300, pts.length * gx + 30), D = Math.max.apply(null, pts.map(p => p.d)), H = (D + 1) * gy + 20; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
        const at = new Map(); pts.forEach(p => at.set(p.n, { x: 25 + p.x * gx, y: 26 + p.d * gy }));
        pts.forEach(p => { [p.n.l, p.n.r].forEach(c => { if (c) sv('line', { x1: at.get(p.n).x, y1: at.get(p.n).y, x2: at.get(c).x, y2: at.get(c).y, class: 'pf-tr-edge' }, svg); }); });
        pts.forEach(p => { const o = at.get(p.n); const g = sv('g', { class: 'pf-tr-node' + (path && path.includes(p.n.v) ? ' is-path' : '') + (path && path[path.length - 1] === p.n.v ? ' is-end' : '') }, svg); sv('circle', { cx: o.x, cy: o.y, r: 16 }, g); const t = sv('text', { x: o.x, y: o.y + 5, 'text-anchor': 'middle' }, g); t.textContent = p.n.v; });
      }
      const count = n => n ? 1 + count(n.l) + count(n.r) : 0;
      bIns.addEventListener('click', () => { const v = parseInt(inp.value, 10); if (!(v >= 0 && v <= 99)) return say('Type a whole number from 0 to 99.', 'is-warn'); if (count(root) >= 14) return say('This playground holds up to 14 numbers.', 'is-warn'); const had = (function f(n) { return n ? n.v === v || f(v < n.v ? n.l : n.r) : false; })(root); root = ins(root, v); draw([v]); say(had ? v + ' is already in the tree. A binary search tree does not store duplicates here.' : 'Inserted ' + v + '. Starting at the root, go left if the new value is smaller and right if it is larger, until there is an empty place.', had ? 'is-warn' : 'is-info'); });
      bFind.addEventListener('click', () => { const v = parseInt(inp.value, 10); const path = []; let n = root; while (n) { path.push(n.v); if (v === n.v) break; n = v < n.v ? n.l : n.r; } draw(path); const found = path.length && path[path.length - 1] === v; say((found ? 'Found ' + v : v + ' is not in the tree') + ' after visiting ' + path.length + ' node' + (path.length === 1 ? '' : 's') + ': ' + path.join(' → ') + '. Each step discards a whole branch, so searching a balanced tree of 1,000 values takes about 10 steps.', found ? 'is-good' : 'is-warn'); });
      bOrd.addEventListener('click', () => { const out = []; (function w(n) { if (!n) return; w(n.l); out.push(n.v); w(n.r); })(root); draw(null); say('In-order traversal (left, node, right) reads the values in sorted order: ' + (out.join(', ') || 'nothing yet') + '.'); });
      bClr.addEventListener('click', () => { root = null; [50, 30, 70, 20, 40, 60, 80].forEach(v => { root = ins(root, v); }); draw(null); say('Reset to the tree built from 50, 30, 70, 20, 40, 60 and 80.'); });
      [50, 30, 70, 20, 40, 60, 80].forEach(v => { root = ins(root, v); }); draw(null); say('Insert numbers and search for them. Try 45, 65 and 10, then use Read in order. If you insert 1, 2, 3, 4, 5 in that order the tree becomes a long chain and searching slows down.');
    })();
    show('stack');
  }

  /* ---------- 3. Debugger ---------- */
  // Each entry is the state when the program is paused ON that line, before the line runs. line 0 means the program has finished.
  const PROGRAMS = [
    { id: 'avg', title: 'Average of four marks',
      lines: ['marks = [72, 85, 90, 64]', 'total = 0', 'for i in range(1, len(marks)):', '    total = total + marks[i]', 'average = total / len(marks)', 'print("Average:", average)'],
      expect: 'Average: 77.75', bug: 'The loop starts at index 1, so the first mark (72) is never added.',
      choices: ['The loop starts at index 1, so the first mark (72) is never added.', 'The total should be divided by 3, not len(marks).', 'total should start at 1.'],
      run() {
        const t = [], marks = '[72, 85, 90, 64]', M = [72, 85, 90, 64], push = (line, vars, out) => t.push({ line, vars, out });
        push(1, {}); push(2, { marks }); let total = 0;
        for (let i = 1; i < 4; i++) { push(3, { marks, total, ...(i > 1 ? { i: i - 1 } : {}) }); push(4, { marks, total, i }); total += M[i]; }
        push(3, { marks, total, i: 3 }); push(5, { marks, total, i: 3 }); const average = total / 4;
        push(6, { marks, total, i: 3, average }); push(0, { marks, total, i: 3, average }, 'Average: ' + average); return t;
      } },
    { id: 'pass', title: 'Pass or fail',
      lines: ['mark = 50', 'if mark > 50:', '    result = "Pass"', 'else:', '    result = "Fail"', 'print("Result:", result)'],
      expect: 'Result: Pass', bug: 'The test uses > instead of >=, so a mark of exactly 50 fails.',
      choices: ['The test uses > instead of >=, so a mark of exactly 50 fails.', 'The else branch runs first.', 'result should be assigned before the if.'],
      run() { const t = [], push = (line, vars, out) => t.push({ line, vars, out }); push(1, {}); push(2, { mark: 50 }); push(5, { mark: 50 }); push(6, { mark: 50, result: 'Fail' }); push(0, { mark: 50, result: 'Fail' }, 'Result: Fail'); return t; } }
  ];
  function buildDebug(host) {
    Labs.shell(host, 'pf-debug', 'Debugger: find the bug', 'This program runs without any error message, but it gives the wrong answer. Click a line number to set a breakpoint, then Run to the breakpoint, Step one line at a time and read the watched variables until you can say what is wrong.');
    const row = el('div', 'lab-row'); const pick = el('div', 'lab-seg'); pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'Program');
    const pBtn = PROGRAMS.map((p, i) => { const b = el('button', null, p.title); b.type = 'button'; b.addEventListener('click', () => load(i)); pick.append(b); return b; });
    row.append(pick); host.append(row);
    const split = el('div', 'lab-split lab-split--wide-left'); host.append(split);
    const codeBox = el('div', 'pf-dbg-code'); codeBox.setAttribute('role', 'group'); codeBox.setAttribute('aria-label', 'Program lines. Press a line number to set a breakpoint.');
    const side = el('div', 'lab-stack'); const watch = el('div', 'lab-panel'); watch.append(el('h5', null, 'Watch: variables')); const wt = el('div', 'pf-dbg-vars'); watch.append(wt);
    const con = el('div', 'lab-panel'); con.append(el('h5', null, 'Output')); const ot = el('pre', 'pf-dbg-out'); con.append(ot);
    side.append(watch, con); split.append(codeBox, side);
    const actions = el('div', 'lab-actions');
    const bStep = el('button', 'lab-btn lab-btn--primary', 'Step (one line)'), bRun = el('button', 'lab-btn', 'Run to the next breakpoint'), bRst = el('button', 'lab-btn lab-btn--quiet', 'Start again');
    [bStep, bRun, bRst].forEach(b => { b.type = 'button'; actions.append(b); }); host.append(actions);
    const msg = el('div', 'lab-feedback is-info'); msg.setAttribute('role', 'status'); host.append(msg);
    const quiz = el('div', 'lab-panel'); quiz.hidden = true; host.append(quiz);
    host.append(el('p', 'lab-note', 'A real debugger in an IDE does the same: the program is paused at a breakpoint, you step with one key and the watch window shows variables as they change. This tool replays a fixed run of each program, it does not run your own code. Debugging output statements (print calls) are the simplest alternative, and the notes above compare them.'));
    let cur = 0, trace = [], at = -1, bps = new Set();
    function load(i) { cur = i; trace = PROGRAMS[i].run(); at = -1; bps = new Set(); quiz.hidden = true; msg.className = 'lab-feedback is-info'; msg.textContent = 'Expected output: ' + PROGRAMS[i].expect + '. Press Step to begin, or set a breakpoint on the line you want to inspect and press Run.'; pBtn.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); draw(); }
    function draw() {
      const p = PROGRAMS[cur]; codeBox.replaceChildren();
      p.lines.forEach((t, i) => { const ln = i + 1, r = el('div', 'pf-dbg-line' + (at >= 0 && trace[at].line === ln ? ' is-now' : '')); const n = el('button', 'pf-dbg-no' + (bps.has(ln) ? ' is-bp' : ''), String(ln)); n.type = 'button'; n.setAttribute('aria-pressed', String(bps.has(ln))); n.setAttribute('aria-label', 'Line ' + ln + ', breakpoint ' + (bps.has(ln) ? 'set' : 'not set')); n.addEventListener('click', () => { if (bps.has(ln)) bps.delete(ln); else bps.add(ln); draw(); }); r.append(n, el('code', null, t)); codeBox.append(r); });
      wt.replaceChildren(); ot.textContent = '';
      if (at >= 0) { const s = trace[at], prev = at > 0 ? trace[at - 1].vars : {}; if (!Object.keys(s.vars).length) wt.append(el('p', 'lab-note', 'No variables exist yet: this line has not run.')); Object.keys(s.vars).forEach(k => { const rw = el('div', 'pf-dbg-var' + (String(prev[k]) !== String(s.vars[k]) ? ' is-changed' : '')); rw.append(el('span', null, k), el('b', null, String(s.vars[k]))); wt.append(rw); }); ot.textContent = trace.slice(0, at + 1).filter(x => x.out).map(x => x.out).join('\n'); }
      else wt.append(el('p', 'lab-note', 'No variables yet: the program has not started.'));
      bStep.disabled = bRun.disabled = at >= trace.length - 1;
    }
    function finished() {
      const p = PROGRAMS[cur], got = trace[trace.length - 1].out;
      msg.className = 'lab-feedback ' + (got === p.expect ? 'is-good' : 'is-bad'); msg.textContent = 'The program finished and printed "' + got + '". It should have printed "' + p.expect + '".';
      quiz.hidden = false; quiz.replaceChildren(el('h5', null, 'What is the bug?'));
      const g = el('div', 'lab-stack'); const fb = el('div', 'lab-feedback is-info'); fb.hidden = true; fb.setAttribute('role', 'status');
      p.choices.forEach(c => { const b = el('button', 'lab-btn', c); b.type = 'button'; b.addEventListener('click', () => { fb.hidden = false; fb.className = 'lab-feedback ' + (c === p.bug ? 'is-good' : 'is-warn'); fb.textContent = c === p.bug ? 'Yes. ' + p.bug + ' This is a logic error: the program ran, but the logic was wrong.' : 'Not that one. Look again at the watch window: which value is not what you expected?'; }); g.append(b); }); quiz.append(g, fb);
    }
    bStep.addEventListener('click', () => { at++; draw(); const s = trace[at]; if (s.line === 0) { finished(); return; } msg.className = 'lab-feedback is-info'; msg.textContent = 'Paused on line ' + s.line + ', before it runs. The watch shows the variables as they are now.'; if (at >= trace.length - 1) finished(); });
    bRun.addEventListener('click', () => { do { at++; } while (at < trace.length - 1 && !bps.has(trace[at].line)); draw(); const s = trace[at]; if (s.line === 0) finished(); else { msg.className = 'lab-feedback is-info'; msg.textContent = 'Stopped at the breakpoint on line ' + s.line + ', before it runs. Look at the watch window, then Step or Run again.'; } });
    bRst.addEventListener('click', () => load(cur));
    load(0);
  }

  /* ---------- 4. Practice sets ---------- */
  function buildErrors(host) {
    Labs.sorter(host, {
      cls: 'pf-errsort', keepCase: true, title: 'Syntax, logic or runtime error?',
      lead: 'Each program has one fault. Decide when and how it shows itself: a syntax error stops the program before it starts, a runtime error stops it part way, and a logic error never stops it but gives wrong results.',
      noun: 'program', groupLabel: 'Type of error',
      choices: [{ key: 'Syntax error', label: 'Syntax error' }, { key: 'Logic error', label: 'Logic error' }, { key: 'Runtime error', label: 'Runtime error' }],
      items: [
        { text: 'A student runs this program.', visual: code('age = 17\nif age >= 18\n    print("Adult")'), ans: 'Syntax error', why: 'The if line has no colon. Python reports a SyntaxError before running a single line.' },
        { text: 'The prices are 2, 3 and 4, and the program prints 10.', visual: code('total = 1\nfor price in prices:\n    total = total + price\nprint(total)'), ans: 'Logic error', why: 'The program runs without complaint, but total starts at 1 instead of 0, so every answer is one too high.' },
        { text: 'The list holds three names.', visual: code('names = ["Ava", "Ben", "Cara"]\nprint(names[len(names)])'), ans: 'Runtime error', why: 'The last index is len(names) - 1. Asking for index 3 stops the program part way with an IndexError.' },
        { text: 'A mark of exactly 50 should pass, but it prints Fail.', visual: code('if mark > 50:\n    print("Pass")\nelse:\n    print("Fail")'), ans: 'Logic error', why: 'The comparison should be >=. Nothing crashes, so only testing with boundary data (50) reveals it.' },
        { text: 'The user types 4 when asked for their age.', visual: code('age = input("Age: ")\nprint(age + 1)'), ans: 'Runtime error', why: 'input() returns a string, and a string cannot be added to a number. Python stops with a TypeError. Convert with int().' },
        { text: 'A student runs this program.', visual: code('print("Total: " total)'), ans: 'Syntax error', why: 'There is no + or comma between the string and the variable, so Python cannot read the line at all.' },
        { text: 'The program is run with count equal to 0.', visual: code('count = 0\naverage = 100 / count'), ans: 'Runtime error', why: 'Dividing by zero is impossible. Python stops with a ZeroDivisionError, but only when the line is reached with that value.' }
      ],
      closing: 'In an exam, name the type, point to the line and say why it happens. Logic errors are the hardest to find because nothing tells you they exist.'
    });
  }
  function buildParadigms(host) {
    Labs.sorter(host, {
      cls: 'pf-parasort', keepCase: true, title: 'Which programming paradigm?',
      lead: 'Look at each piece of code or description and choose the paradigm it belongs to. Think about whether the program is a list of steps, objects, facts and rules, or functions.',
      noun: 'example', groupLabel: 'Paradigm',
      choices: [{ key: 'Object-oriented', label: 'Object-oriented' }, { key: 'Imperative', label: 'Imperative' }, { key: 'Logic', label: 'Logic' }, { key: 'Functional', label: 'Functional' }],
      items: [
        { text: 'A program for a game.', visual: code('class Car:\n    def __init__(self, colour):\n        self.colour = colour\n        self.speed = 0\n    def accelerate(self):\n        self.speed += 10'), ans: 'Object-oriented', why: 'Data (colour, speed) and the methods that change it are bundled in a class, and objects are created from it.' },
        { text: 'A program that adds up a list.', visual: code('total = 0\nfor n in numbers:\n    total = total + n\nprint(total)'), ans: 'Imperative', why: 'A sequence of commands that change a variable step by step. It says how to get the answer.' },
        { text: 'A knowledge base for family relationships.', visual: code('parent(john, mary).\nparent(mary, bob).\ngrandparent(X, Z) :-\n    parent(X, Y), parent(Y, Z).'), ans: 'Logic', why: 'The programmer states facts and a rule. The language works out the answers by inference, without a loop.' },
        { text: 'A program that doubles every number.', visual: code('doubled = list(map(lambda n: n * 2, numbers))'), ans: 'Functional', why: 'A pure function is applied to every item, and no variable is changed along the way.' },
        { text: 'A description of a language.', visual: code('Programs state what is true and what is wanted.\nThe system searches for ways to make it true.'), ans: 'Logic', why: 'Logic programming describes the problem as facts and rules and lets the engine find solutions. Prolog is the usual example.' },
        { text: 'A shapes program.', visual: code('class Shape:\n    def area(self): ...\nclass Circle(Shape):\n    def area(self):\n        return 3.14 * self.r ** 2'), ans: 'Object-oriented', why: 'Circle inherits from Shape and overrides area(). Inheritance and polymorphism belong to the object-oriented paradigm.' }
      ],
      closing: 'Most real languages mix paradigms. Python, for example, supports imperative, object-oriented and functional styles in one program.'
    });
  }

  function init() {
    document.querySelectorAll('[data-pflab="float"]').forEach(buildFloat);
    document.querySelectorAll('[data-pflab="structures"]').forEach(buildStructures);
    document.querySelectorAll('[data-pflab="debug"]').forEach(buildDebug);
    document.querySelectorAll('[data-pflab="errors"]').forEach(buildErrors);
    document.querySelectorAll('[data-pflab="paradigms"]').forEach(buildParadigms);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
