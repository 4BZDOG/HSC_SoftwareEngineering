/* Software Automation: two hands-on explorers.
   1. "linefit": drag a line through eight data points and watch the mean squared error (MSE);
      snap to the least-squares line, or train by gradient descent one step at a time.
   2. "perceptron": step a single artificial neurone through the training cycle for AND, OR,
      NAND or XOR, with the weighted sum, error and weight updates shown for every example.
   The arithmetic is the same as the Python programs on the page (learning rate 0.5 for the
   perceptron, which keeps every number exact in binary floating point).
   Vanilla JS; every value shown is written with textContent. A static description stays in the
   page if this file does not run. */
(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const svg = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const MINUS = '−';
  const num = (v, dp = 2) => {
    const r = +v.toFixed(dp);
    return (r < 0 ? MINUS : '') + String(Math.abs(r));
  };
  let uidCounter = 0;
  const uid = p => 'auto-' + p + '-' + (++uidCounter);

  const button = (label, onClick, cls) => {
    const b = el('button', 'auto-btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  };

  /* ══════════ 1. Line-fit explorer ══════════ */

  const HOURS = [1, 2, 3, 4, 5, 6, 7, 8];
  const MARKS = [45, 52, 58, 61, 68, 74, 77, 85];

  function leastSquares(xs, ys) {
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0;
    xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); });
    const slope = sxy / sxx;
    return { slope, intercept: my - slope * mx };
  }
  const mse = (xs, ys, m, c) => xs.reduce((a, x, i) => a + Math.pow(m * x + c - ys[i], 2), 0) / xs.length;

  function buildLineFit(root) {
    const best = leastSquares(HOURS, MARKS);
    const bestMse = mse(HOURS, MARKS, best.slope, best.intercept);
    const START = { slope: 2, intercept: 30 };
    let slope = START.slope, intercept = START.intercept, steps = 0;
    const RATE = 0.01;

    root.replaceChildren();
    root.appendChild(el('h4', null, 'Line-fit explorer: minimise the mean squared error'));
    root.appendChild(el('p', 'auto-lead', 'Each point is a student: hours studied against the mark. Move the two sliders to place a line, or let the computer train it. The dashed segments are the errors; the MSE is the average of their squares.'));

    const grid = el('div', 'auto-grid');
    const plotBox = el('div', 'auto-plotbox');
    const side = el('div', 'auto-side');
    grid.append(plotBox, side);
    root.appendChild(grid);

    /* Plot */
    const W = 420, H = 280, L = 44, R = 12, T = 12, B = 38;
    const X0 = 0, X1 = 9, Y0 = 0, Y1 = 100;
    const px = x => L + (x - X0) / (X1 - X0) * (W - L - R);
    const py = y => H - B - (y - Y0) / (Y1 - Y0) * (H - T - B);
    const plot = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'auto-plot', role: 'img',
      'aria-label': 'Scatter plot of hours studied against mark with the current line and its errors' });
    plotBox.appendChild(plot);
    const clipId = uid('clip');
    const defs = svg('defs', {}, plot);
    svg('rect', { x: L, y: T, width: W - L - R, height: H - T - B }, svg('clipPath', { id: clipId }, defs));
    for (let y = 0; y <= 100; y += 20) {
      svg('line', { x1: L, x2: W - R, y1: py(y), y2: py(y), class: 'auto-grid-line' }, plot);
      svg('text', { x: L - 6, y: py(y) + 4, class: 'auto-tick', 'text-anchor': 'end' }, plot).textContent = String(y);
    }
    for (let x = 0; x <= 9; x += 1) {
      svg('text', { x: px(x), y: H - B + 16, class: 'auto-tick', 'text-anchor': 'middle' }, plot).textContent = String(x);
    }
    svg('text', { x: (L + W - R) / 2, y: H - 6, class: 'auto-axis', 'text-anchor': 'middle' }, plot).textContent = 'Hours studied';
    svg('text', { x: 12, y: (T + H - B) / 2, class: 'auto-axis', 'text-anchor': 'middle', transform: `rotate(-90 12 ${(T + H - B) / 2})` }, plot).textContent = 'Mark';
    const errLayer = svg('g', { 'clip-path': `url(#${clipId})` }, plot);
    const lineEl = svg('line', { class: 'auto-fitline', 'clip-path': `url(#${clipId})` }, plot);
    HOURS.forEach((x, i) => svg('circle', { cx: px(x), cy: py(MARKS[i]), r: 5, class: 'auto-point' }, plot));

    /* Controls */
    const fields = el('div', 'auto-fields');
    const mkSlider = (label, min, max, step, get, set) => {
      const id = uid('r');
      const row = el('div', 'auto-field');
      const lab = el('label', null, label);
      lab.htmlFor = id;
      const out = el('output', 'auto-val');
      out.htmlFor = id;
      const input = el('input');
      input.type = 'range'; input.id = id; input.min = min; input.max = max; input.step = step;
      input.addEventListener('input', () => { set(parseFloat(input.value)); steps = 0; draw(); });
      row.append(lab, input, out);
      fields.appendChild(row);
      return { input, out, get };
    };
    const sliders = [
      mkSlider('Slope m (marks per hour)', 0, 10, 0.05, () => slope, v => { slope = v; }),
      mkSlider('Intercept c (mark at 0 hours)', 0, 60, 0.05, () => intercept, v => { intercept = v; })
    ];
    side.appendChild(fields);

    const stats = el('div', 'auto-stats');
    const statMse = el('p', 'auto-stat');
    const statBest = el('p', 'auto-stat auto-muted');
    const statEq = el('p', 'auto-stat auto-muted');
    stats.append(statEq, statMse, statBest);
    side.appendChild(stats);

    const verdict = el('p', 'auto-verdict');
    verdict.setAttribute('role', 'status');
    side.appendChild(verdict);

    const gd = () => {
      let gm = 0, gc = 0;
      HOURS.forEach((x, i) => {
        const e = slope * x + intercept - MARKS[i];
        gm += 2 * e * x; gc += 2 * e;
      });
      slope -= RATE * gm / HOURS.length;
      intercept -= RATE * gc / HOURS.length;
      steps++;
    };
    const clamp = () => {
      slope = Math.min(10, Math.max(0, slope));
      intercept = Math.min(60, Math.max(0, intercept));
    };
    const bar = el('div', 'auto-btnrow');
    bar.append(
      button('Gradient step', () => { gd(); clamp(); draw(); }),
      button('100 steps', () => { for (let i = 0; i < 100; i++) gd(); clamp(); draw(); }),
      button('Snap to least squares', () => { slope = best.slope; intercept = best.intercept; steps = 0; draw(); }, 'auto-btn-primary'),
      button('Reset', () => { slope = START.slope; intercept = START.intercept; steps = 0; draw(); })
    );
    side.appendChild(bar);

    function draw() {
      errLayer.replaceChildren();
      HOURS.forEach((x, i) => {
        const yhat = slope * x + intercept;
        svg('line', { x1: px(x), x2: px(x), y1: py(MARKS[i]), y2: py(yhat), class: 'auto-resid' }, errLayer);
      });
      lineEl.setAttribute('x1', px(X0)); lineEl.setAttribute('y1', py(slope * X0 + intercept));
      lineEl.setAttribute('x2', px(X1)); lineEl.setAttribute('y2', py(slope * X1 + intercept));
      sliders.forEach(s => { s.input.value = s.get(); s.out.textContent = num(s.get(), 2); });
      const cur = mse(HOURS, MARKS, slope, intercept);
      statEq.textContent = `Line: mark = ${num(slope, 3)} × hours + ${num(intercept, 3)}`;
      statMse.textContent = `Your MSE: ${num(cur, 3)}` + (steps ? `  (after ${steps} gradient step${steps === 1 ? '' : 's'})` : '');
      statBest.textContent = `Least-squares MSE: ${num(bestMse, 3)} at m = ${num(best.slope, 3)}, c = ${num(best.intercept, 3)}`;
      if (cur <= bestMse + 0.05) verdict.textContent = 'That is the least-squares line: no other straight line has a smaller MSE.';
      else if (cur <= 5) verdict.textContent = 'Very close. Training stops improving when the steps stop shrinking the MSE.';
      else if (cur <= 30) verdict.textContent = 'Getting there. Adjust the slope and intercept together: they interact.';
      else verdict.textContent = 'A poor fit: the squared errors are large. Try the gradient steps and watch the MSE fall.';
    }
    draw();
  }

  /* ══════════ 2. Perceptron stepper ══════════ */

  const GATES = {
    AND:  [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
    OR:   [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
    NAND: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
    XOR:  [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]]
  };
  const RATE_P = 0.5, MAX_EPOCHS = 20;

  function buildPerceptron(root) {
    let gate = 'AND';
    let w, theta, idx, epoch, mistakes, done, log, last;

    const reset = () => {
      w = [0, 0]; theta = 0; idx = 0; epoch = 1; mistakes = 0; done = null; log = []; last = null;
    };
    reset();
    const predict = (x1, x2) => (w[0] * x1 + w[1] * x2 >= theta ? 1 : 0);

    function step() {
      if (done) return;
      const [x1, x2, target] = GATES[gate][idx];
      const sum = w[0] * x1 + w[1] * x2;
      const out = sum >= theta ? 1 : 0;
      const err = target - out;
      const before = { w: w.slice(), theta };
      w[0] += RATE_P * err * x1;
      w[1] += RATE_P * err * x2;
      theta -= RATE_P * err;
      if (err !== 0) mistakes++;
      last = { x1, x2, target, sum, out, err, before, after: { w: w.slice(), theta }, epoch, idx };
      idx++;
      if (idx === 4) {
        log.push(`Epoch ${epoch}: ${mistakes} mistake${mistakes === 1 ? '' : 's'}, weights ${num(w[0])}, ${num(w[1])}, threshold ${num(theta)}`);
        last.epochEnd = { epoch, mistakes };
        if (mistakes === 0) done = 'learned';
        else if (epoch >= MAX_EPOCHS) done = 'gaveup';
        else { epoch++; idx = 0; mistakes = 0; }
      }
    }
    const finishEpoch = () => {
      if (done) return;
      const start = epoch;
      while (!done && epoch === start) step();
    };
    const runAll = () => { while (!done) step(); };

    root.replaceChildren();
    root.appendChild(el('h4', null, 'Perceptron stepper: one neurone, one example at a time'));
    root.appendChild(el('p', 'auto-lead', 'The neurone fires (outputs 1) when its weighted sum reaches the threshold. After each example it adds learning rate × error × input to each weight and subtracts learning rate × error from the threshold. The learning rate is 0.5.'));

    const tabs = el('div', 'auto-tabs');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Choose the function to learn');
    const tabBtns = {};
    Object.keys(GATES).forEach(name => {
      const b = el('button', 'auto-tab', name);
      b.type = 'button';
      b.setAttribute('aria-pressed', name === gate ? 'true' : 'false');
      b.addEventListener('click', () => { gate = name; reset(); draw(); });
      tabs.appendChild(b);
      tabBtns[name] = b;
    });
    root.appendChild(tabs);

    const grid = el('div', 'auto-grid');
    const left = el('div', 'auto-side');
    const right = el('div', 'auto-plotbox auto-plotbox-sq');
    grid.append(left, right);
    root.appendChild(grid);

    /* Table of the four examples */
    const wrap = el('div', 'auto-tablewrap');
    const table = el('table', 'auto-table');
    const cap = el('caption', 'auto-sr', 'Training examples and the neurone’s current answers');
    table.appendChild(cap);
    const thead = el('thead');
    const hr = el('tr');
    ['Input 1', 'Input 2', 'Target', 'Says', ''].forEach(h => hr.appendChild(el('th', null, h)));
    thead.appendChild(hr);
    const tbody = el('tbody');
    table.append(thead, tbody);
    wrap.appendChild(table);
    left.appendChild(wrap);

    const state = el('p', 'auto-stat');
    left.appendChild(state);
    const detail = el('div', 'auto-detail');
    detail.setAttribute('role', 'status');
    detail.setAttribute('aria-live', 'polite');
    left.appendChild(detail);

    const bar = el('div', 'auto-btnrow');
    bar.append(
      button('Step (one example)', () => { step(); draw(); }, 'auto-btn-primary'),
      button('Finish epoch', () => { finishEpoch(); draw(); }),
      button('Run to the end', () => { runAll(); draw(); }),
      button('Reset', () => { reset(); draw(); })
    );
    left.appendChild(bar);

    const historyBox = el('details', 'auto-history');
    historyBox.appendChild(el('summary', null, 'Epoch log'));
    const historyList = el('ol', 'auto-loglist');
    historyBox.appendChild(historyList);
    left.appendChild(historyBox);

    /* Decision plot */
    const S = 260, M = 34, LO = -0.3, HI = 1.3;
    const gx = v => M + (v - LO) / (HI - LO) * (S - 2 * M) + 0;
    const gy = v => S - M - (v - LO) / (HI - LO) * (S - 2 * M);
    const plot = svg('svg', { viewBox: `0 0 ${S} ${S}`, class: 'auto-plot', role: 'img',
      'aria-label': 'The four input pairs with the neurone’s current dividing line' });
    right.appendChild(plot);
    const clipId = uid('clip');
    svg('rect', { x: M, y: M, width: S - 2 * M, height: S - 2 * M }, svg('clipPath', { id: clipId }, svg('defs', {}, plot)));
    svg('rect', { x: M, y: M, width: S - 2 * M, height: S - 2 * M, class: 'auto-box' }, plot);
    svg('text', { x: S / 2, y: S - 6, class: 'auto-axis', 'text-anchor': 'middle' }, plot).textContent = 'Input 1';
    svg('text', { x: 10, y: S / 2, class: 'auto-axis', 'text-anchor': 'middle', transform: `rotate(-90 10 ${S / 2})` }, plot).textContent = 'Input 2';
    [0, 1].forEach(v => {
      svg('text', { x: gx(v), y: S - M + 14, class: 'auto-tick', 'text-anchor': 'middle' }, plot).textContent = String(v);
      svg('text', { x: M - 6, y: gy(v) + 4, class: 'auto-tick', 'text-anchor': 'end' }, plot).textContent = String(v);
    });
    const boundary = svg('line', { class: 'auto-fitline', 'clip-path': `url(#${clipId})` }, plot);
    const pointLayer = svg('g', {}, plot);
    const plotNote = el('p', 'auto-muted auto-plotnote');
    right.appendChild(plotNote);

    function fmtSum(x1, x2) {
      return `${num(w[0])}×${x1} + ${num(w[1])}×${x2}`;
    }

    function draw() {
      Object.keys(tabBtns).forEach(n => tabBtns[n].setAttribute('aria-pressed', n === gate ? 'true' : 'false'));
      tbody.replaceChildren();
      GATES[gate].forEach(([x1, x2, t], i) => {
        const tr = el('tr');
        const say = predict(x1, x2);
        const cells = [String(x1), String(x2), String(t), String(say), say === t ? '✓' : '✗'];
        cells.forEach((c, k) => {
          const td = el('td', k === 4 ? (say === t ? 'auto-ok' : 'auto-bad') : null, c);
          if (k === 4) td.setAttribute('aria-label', say === t ? 'correct' : 'wrong');
          tr.appendChild(td);
        });
        if (!done && i === idx) { tr.className = 'auto-next'; tr.setAttribute('aria-label', 'next example'); }
        tbody.appendChild(tr);
      });

      state.textContent = `Epoch ${epoch}  ·  weights (${num(w[0])}, ${num(w[1])})  ·  threshold ${num(theta)}`;

      detail.replaceChildren();
      if (!last) {
        detail.appendChild(el('p', null, 'Press Step. The neurone starts with both weights at 0 and a threshold of 0, so it says 1 to everything until it is corrected.'));
      } else {
        const l = last;
        const lines = [
          `Example (${l.x1}, ${l.x2}), target ${l.target}.`,
          `Weighted sum: ${num(l.before.w[0])}×${l.x1} + ${num(l.before.w[1])}×${l.x2} = ${num(l.sum)}. Threshold ${num(l.before.theta)}, so ${num(l.sum)} ${l.sum >= l.before.theta ? '≥' : '<'} ${num(l.before.theta)} and the output is ${l.out}.`,
          l.err === 0 ? 'Error = target − output = 0, so nothing changes.'
            : `Error = ${l.target} − ${l.out} = ${num(l.err)}. Weights become ${num(l.after.w[0])} and ${num(l.after.w[1])}; threshold becomes ${num(l.after.theta)}.`
        ];
        lines.forEach(t => detail.appendChild(el('p', null, t)));
      }
      if (done === 'learned') {
        detail.appendChild(el('p', 'auto-verdict auto-good', `Learned ${gate} in ${epoch} epochs: a whole pass with zero mistakes.`));
      } else if (done === 'gaveup') {
        detail.appendChild(el('p', 'auto-verdict auto-badmsg', `Still wrong after ${MAX_EPOCHS} epochs, and it never will be. One neurone can only draw a single straight line, and no straight line separates the 1s from the 0s in XOR. A hidden layer fixes this.`));
      }

      historyList.replaceChildren();
      log.forEach(t => historyList.appendChild(el('li', null, t)));
      historyBox.hidden = log.length === 0;

      /* plot */
      pointLayer.replaceChildren();
      GATES[gate].forEach(([x1, x2, t]) => {
        const cx = gx(x1), cy = gy(x2);
        if (t === 1) svg('circle', { cx, cy, r: 9, class: 'auto-pt-one' }, pointLayer);
        else svg('circle', { cx, cy, r: 9, class: 'auto-pt-zero' }, pointLayer);
        svg('text', { x: cx, y: cy + 4, class: 'auto-pt-label', 'text-anchor': 'middle' }, pointLayer).textContent = String(t);
      });
      let ok = true;
      if (w[1] !== 0) {
        boundary.setAttribute('x1', gx(LO)); boundary.setAttribute('y1', gy((theta - w[0] * LO) / w[1]));
        boundary.setAttribute('x2', gx(HI)); boundary.setAttribute('y2', gy((theta - w[0] * HI) / w[1]));
      } else if (w[0] !== 0) {
        boundary.setAttribute('x1', gx(theta / w[0])); boundary.setAttribute('y1', gy(LO));
        boundary.setAttribute('x2', gx(theta / w[0])); boundary.setAttribute('y2', gy(HI));
      } else ok = false;
      boundary.style.display = ok ? '' : 'none';
      plotNote.textContent = ok
        ? 'Filled points have target 1 and outlined points target 0. The line is where the weighted sum equals the threshold: the neurone says 1 on one side of it and 0 on the other.'
        : 'With both weights at 0 there is no dividing line yet.';
    }
    draw();
  }

  /* ══════════ Mount ══════════ */

  function mount() {
    document.querySelectorAll('[data-auto-lab]').forEach(root => {
      const kind = root.getAttribute('data-auto-lab');
      try {
        if (kind === 'linefit') buildLineFit(root);
        else if (kind === 'perceptron') buildPerceptron(root);
      } catch (e) { /* leave the static description in place */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
