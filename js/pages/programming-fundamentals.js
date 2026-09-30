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
