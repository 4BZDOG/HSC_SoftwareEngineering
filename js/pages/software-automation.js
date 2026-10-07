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

/* ══════════ Labs built on the shared kit (css/labs.css, js/labs.js) ══════════
   Training-model practice, k-means, a reinforcement-learning corridor, a logistic-regression
   threshold explorer, a bias simulation and two sorting sets. Everything shown is written with textContent. */
(() => {
  'use strict';
  if (!window.Labs) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = Labs.el;
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const seg = (host, label, options, onPick) => {
    const g = el('div', 'lab-seg'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', label);
    const bs = options.map(o => { const b = el('button', null, o[1]); b.type = 'button'; b.addEventListener('click', () => { onPick(o[0]); mark(o[0]); }); g.append(b); return [o[0], b]; });
    const mark = v => bs.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === v)));
    host.append(g); return mark;
  };
  const stat = (box, a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); box.append(s); };
  /* A chart svg whose viewBox matches its width in pixels, so text and markers keep one size on every screen; redraws when the width changes. */
  const pixelChart = (svg, draw) => {
    const c = { W: 420, H: 300, last: 0, size() { const w = Math.round(svg.getBoundingClientRect().width) || 420; c.last = w; c.W = Math.max(280, w); c.H = Math.round(c.W * (c.W < 520 ? .82 : .56)); svg.setAttribute('viewBox', '0 0 ' + c.W + ' ' + c.H); } };
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (Math.round(svg.getBoundingClientRect().width) !== c.last) draw(); }).observe(svg);
    return c;
  };
  const btn = (text, cls, fn) => { const b = el('button', 'lab-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); return b; };

  /* ---------- 1. Which training model? ---------- */
  function buildTraining(host) {
    Labs.sorter(host, {
      cls: 'auto-train', title: 'Which training model?',
      lead: 'Read each situation and decide whether the data is labelled, unlabelled or mixed, and whether the system learns from rewards.',
      noun: 'scenario', groupLabel: 'Training model',
      choices: [{ key: 'S', label: 'Supervised' }, { key: 'U', label: 'Unsupervised' }, { key: 'SS', label: 'Semi-supervised' }, { key: 'R', label: 'Reinforcement' }],
      items: [
        { text: 'A bank has 50,000 past transactions, each marked "fraud" or "genuine", and trains a model to flag new ones.', ans: 'S', why: 'Every example comes with its correct answer (a label), and the model learns to predict that label.' },
        { text: 'A streaming service groups its viewers by viewing habits without being told what the groups should be.', ans: 'U', why: 'There are no labels. The algorithm finds the groups (clusters) itself, and people then decide what each group means.' },
        { text: 'A hospital has 300 scans labelled by a specialist and 40,000 unlabelled scans, and trains a model using both.', ans: 'SS', why: 'A small labelled set is combined with a large unlabelled set, which saves the cost of labelling everything.' },
        { text: 'A warehouse robot tries different routes, earning points for fast deliveries and losing points for collisions.', ans: 'R', why: 'An agent acts in an environment and learns from rewards and penalties, not from labelled examples.' },
        { text: 'A model predicts house prices from 10,000 past sales, each with its known sale price.', ans: 'S', why: 'The sale price is the label. Predicting a number from labelled examples is supervised regression.' },
        { text: 'A security team gives a model network logs with no labels and asks it to find unusual activity.', ans: 'U', why: 'Finding unusual cases in unlabelled data (anomaly detection) is a typical unsupervised task.' },
        { text: 'A teacher labels 50 essays by topic, then lets the model sort 5,000 unlabelled essays and learn from its own most confident predictions.', ans: 'SS', why: 'A few labels start the learning and the unlabelled essays extend it, which is semi-supervised learning.' },
        { text: 'A program learns a board game by playing itself thousands of times, rewarded for winning and penalised for losing.', ans: 'R', why: 'The only feedback is a reward after actions, so this is reinforcement learning.' }
      ],
      closing: 'Ask two questions: are there labels, and is there a reward? Labels for every example mean supervised, none mean unsupervised, a few mean semi-supervised, and rewards from acting mean reinforcement.'
    });
  }

  /* ---------- 2. K-means ---------- */
  function buildKmeans(host) {
    Labs.shell(host, 'auto-km', 'K-means: letting the computer find the groups', 'Each shape is a customer, placed by visits a month and average spend. Nobody has labelled them. K-means picks k centres, joins every customer to the nearest centre, then moves each centre to the middle of its group, and repeats until nothing changes.');
    const r = rng(7), gauss = () => { const u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const pts = [];
    [[2.2, 2.4], [7.4, 3.2], [4.6, 7.6]].forEach(c => { for (let i = 0; i < 10; i++) pts.push({ x: clamp(c[0] + gauss() * .9, .3, 9.7), y: clamp(c[1] + gauss() * .9, .3, 9.7) }); });
    const st = { k: 3, start: 1, cents: [], asg: [], phase: 'assign', round: 0, moved: null, done: false };
    const row = el('div', 'lab-row'); host.append(row);
    seg(row, 'Number of groups, k', [[2, 'k = 2'], [3, 'k = 3'], [4, 'k = 4']], k => { st.k = k; reset(); })(3);
    const stage = el('div', 'lab-stage'); host.append(stage);
    const L = 58, R = 12, T = 12, B = 46;
    const svg = sv('svg', { role: 'img' }, stage), ch = pixelChart(svg, () => draw());
    const px = x => L + x / 10 * (ch.W - L - R), py = y => ch.H - B - y / 10 * (ch.H - T - B);
    const stats = el('div', 'lab-stats'), out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    const actions = el('div', 'lab-actions');
    const bStep = btn('', 'lab-btn--primary', () => step()), bRun = btn('Run to the end', '', () => { let n = 0; while (!st.done && n++ < 60) step(true); draw(); }), bNew = btn('New starting centres', '', () => { st.start++; reset(); }), bReset = btn('Start again', '', () => reset());
    actions.append(bStep, bRun, bNew, bReset);
    host.append(stats, out, actions);
    host.append(el('p', 'lab-note', 'The shapes and the numbers are invented. K-means needs k chosen in advance, and it only finds groups, it does not name them: a person decides that one group means "frequent big spenders". With k = 4, press New starting centres a few times: the starting points can change the groups it settles on.'));
    function reset() {
      const rr = rng(st.start * 101 + 3), idx = [];
      while (idx.length < st.k) { const i = Math.floor(rr() * pts.length); if (!idx.includes(i)) idx.push(i); }
      st.cents = idx.map(i => ({ x: pts[i].x, y: pts[i].y })); st.asg = pts.map(() => -1); st.phase = 'assign'; st.round = 0; st.moved = null; st.done = false;
      draw();
    }
    function step(quiet) {
      if (st.done) return;
      if (st.phase === 'assign') {
        let moved = 0;
        pts.forEach((p, i) => { let b = 0, bd = Infinity; st.cents.forEach((c, j) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; b = j; } }); if (st.asg[i] !== b) moved++; st.asg[i] = b; });
        st.moved = moved; st.round++;
        if (moved === 0) st.done = true; else st.phase = 'update';
      } else {
        st.cents = st.cents.map((c, j) => { const m = pts.filter((_, i) => st.asg[i] === j); return m.length ? { x: m.reduce((a, p) => a + p.x, 0) / m.length, y: m.reduce((a, p) => a + p.y, 0) / m.length } : c; });
        st.phase = 'assign';
      }
      if (!quiet) draw();
    }
    const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
    function marker(kind, x, y, s, attrs, parent) {
      if (kind === 'circle') return sv('circle', Object.assign({ cx: x, cy: y, r: s }, attrs), parent);
      if (kind === 'square') return sv('rect', Object.assign({ x: x - s, y: y - s, width: 2 * s, height: 2 * s }, attrs), parent);
      if (kind === 'triangle') return sv('path', Object.assign({ d: 'M' + x + ',' + (y - s * 1.2) + ' L' + (x + s * 1.15) + ',' + (y + s * .85) + ' L' + (x - s * 1.15) + ',' + (y + s * .85) + ' Z' }, attrs), parent);
      return sv('path', Object.assign({ d: 'M' + x + ',' + (y - s * 1.3) + ' L' + (x + s * 1.3) + ',' + y + ' L' + x + ',' + (y + s * 1.3) + ' L' + (x - s * 1.3) + ',' + y + ' Z' }, attrs), parent);
    }
    function draw() {
      ch.size(); const W = ch.W, H = ch.H, big = W > 560;
      svg.replaceChildren(); stats.replaceChildren();
      [0, 5, 10].forEach(v => { sv('line', { x1: px(v), y1: py(0), x2: px(v), y2: py(10), class: 'auto-grid' }, svg); sv('line', { x1: px(0), y1: py(v), x2: px(10), y2: py(v), class: 'auto-grid' }, svg); });
      [[0, '0'], [5, '5'], [10, '10']].forEach(t => { const a = sv('text', { x: px(t[0]), y: H - B + 18, class: 'auto-txt', 'text-anchor': 'middle' }, svg); a.textContent = t[1]; });
      [[0, '$0'], [5, '$50'], [10, '$100']].forEach(t => { const a = sv('text', { x: L - 6, y: py(t[0]) + 4, class: 'auto-txt', 'text-anchor': 'end' }, svg); a.textContent = t[1]; });
      const xl = sv('text', { x: (L + W - R) / 2, y: H - 8, class: 'auto-txt', 'text-anchor': 'middle' }, svg); xl.textContent = 'Visits per month';
      const yl = sv('text', { x: 14, y: (T + H - B) / 2, class: 'auto-txt', 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (T + H - B) / 2 + ')' }, svg); yl.textContent = 'Average spend per visit';
      pts.forEach((p, i) => { const j = st.asg[i]; if (j >= 0) sv('line', { x1: px(p.x), y1: py(p.y), x2: px(st.cents[j].x), y2: py(st.cents[j].y), class: 'auto-link auto-k' + j }, svg); });
      pts.forEach((p, i) => { const j = st.asg[i]; if (j < 0) marker('circle', px(p.x), py(p.y), big ? 7 : 6, { class: 'auto-pt-none' }, svg); else marker(SHAPES[j], px(p.x), py(p.y), big ? 7.5 : 6.5, { class: 'auto-pt auto-k' + j }, svg); });
      st.cents.forEach((c, j) => {
        const x = px(c.x), y = py(c.y);
        sv('path', { d: 'M' + (x - 9) + ',' + (y - 9) + ' L' + (x + 9) + ',' + (y + 9) + ' M' + (x + 9) + ',' + (y - 9) + ' L' + (x - 9) + ',' + (y + 9), class: 'auto-cent-halo' }, svg);
        sv('path', { d: 'M' + (x - 9) + ',' + (y - 9) + ' L' + (x + 9) + ',' + (y + 9) + ' M' + (x + 9) + ',' + (y - 9) + ' L' + (x - 9) + ',' + (y + 9), class: 'auto-cent auto-k' + j }, svg);
      });
      let inertia = 0, any = st.asg[0] >= 0;
      if (any) pts.forEach((p, i) => { const c = st.cents[st.asg[i]]; inertia += (p.x - c.x) ** 2 + (p.y - c.y) ** 2; });
      stat(stats, 'Rounds completed', String(st.done ? st.round - 1 : st.round)); stat(stats, 'Customers who changed group', st.moved == null ? '–' : String(st.moved)); stat(stats, 'Spread of the groups', any ? inertia.toFixed(1) + ' (lower is tighter)' : '–');
      bStep.textContent = st.done ? 'Finished' : st.phase === 'assign' ? 'Step: join the nearest centre' : 'Step: move the centres';
      bStep.disabled = st.done; bRun.disabled = st.done;
      svg.setAttribute('aria-label', 'Scatter plot of 30 customers by visits per month and average spend, with ' + st.k + ' crosses marking the group centres. ' + (any ? 'Customers are joined to their nearest centre.' : 'No customer has joined a group yet.'));
      out.className = 'lab-readout' + (st.done ? ' is-good' : '');
      if (st.done) out.textContent = 'Finished after ' + (st.round - 1) + ' full round' + (st.round - 1 === 1 ? '' : 's') + ': no customer changed group, so the centres would not move again. The computer found ' + st.k + ' groups with no labels at all.';
      else if (!any) out.textContent = 'The ' + st.k + ' centres (crosses) start on randomly chosen customers. Press the step button: first every customer joins its nearest centre.';
      else if (st.phase === 'update') out.textContent = 'Join: every customer is now linked to its nearest centre, and ' + st.moved + ' customer' + (st.moved === 1 ? '' : 's') + ' changed group. Next, each centre moves to the average position of its group.';
      else out.textContent = 'Move: each centre has moved to the middle of its group. Some customers may now be nearer a different centre, so join them up again.';
    }
    reset();
  }

  /* ---------- 3. Reinforcement learning corridor ---------- */
  function buildRl(host) {
    Labs.shell(host, 'auto-rl', 'Reinforcement learning: an agent learns a corridor', 'An agent starts in cell 3 and can move left or right. Reaching the goal (cell 6) gives a reward of +10, falling into the pit (cell 0) gives a penalty of −10, and every move costs −1. The agent is never told the route. It improves its estimate of how good each move is after every step.');
    const N = 7, START = 3, ALPHA = .5, GAMMA = .9;
    const st = { eps: .2, q: null, rand: null, episodes: 0, steps: 0, path: [], end: '' };
    const row = el('div', 'lab-row'); host.append(row);
    seg(row, 'How often the agent tries a random move', [[0, 'Never explore (0%)'], [.2, 'Sometimes (20%)'], [1, 'Always random (100%)']], v => { st.eps = v; render(); })(.2);
    const strip = el('div', 'auto-rl-strip'); strip.setAttribute('role', 'img'); host.append(strip);
    const tab = Labs.table(['Cell', 'Value of moving left', 'Value of moving right', 'Best move'], { num: [1, 2], stack: true }); host.append(tab.wrap);
    const stats = el('div', 'lab-stats'), out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    const actions = el('div', 'lab-actions');
    actions.append(btn('Run 1 episode', 'lab-btn--primary', () => { episode(); render(); }), btn('Run 20 episodes', '', () => { for (let i = 0; i < 20; i++) episode(); render(); }), btn('Start again', '', () => reset()));
    host.append(stats, out, actions);
    host.append(el('p', 'lab-note', 'One episode is one attempt, from the start cell until the agent reaches the goal or the pit. After each move the agent updates one value: new value = old value + 0.5 × (reward + 0.9 × best value from the next cell − old value). The pit is one step from cell 1, so the agent learns to avoid it quickly; the goal is farther, so its good news has to travel back along the corridor. With 0% exploration the agent can keep repeating its first guess; with 100% it never uses what it learned.'));
    function reset() { st.q = Array.from({ length: N }, () => [0, 0]); st.rand = rng(11); st.episodes = 0; st.steps = 0; st.path = []; st.end = ''; render(); }
    function episode() {
      let s = START, steps = 0; const path = [s];
      while (s !== 0 && s !== N - 1 && steps < 40) {
        const q = st.q[s]; let a;
        if (st.rand() < st.eps) a = st.rand() < .5 ? 0 : 1; else a = q[0] === q[1] ? (st.rand() < .5 ? 0 : 1) : (q[1] > q[0] ? 1 : 0);
        const n = a ? s + 1 : s - 1, term = n === 0 || n === N - 1, rew = n === N - 1 ? 10 : n === 0 ? -10 : -1;
        q[a] += ALPHA * (rew + (term ? 0 : GAMMA * Math.max(st.q[n][0], st.q[n][1])) - q[a]);
        s = n; steps++; path.push(s);
      }
      st.episodes++; st.steps = steps; st.path = path; st.end = s === N - 1 ? 'reached the goal' : s === 0 ? 'fell into the pit' : 'ran out of moves';
    }
    function best(s) { const q = st.q[s]; return q[0] === q[1] ? 0 : q[1] > q[0] ? 1 : -1; }
    function render() {
      if (!st.q) { reset(); return; }
      strip.replaceChildren(); tab.clear(); stats.replaceChildren();
      const desc = [];
      for (let s = 0; s < N; s++) {
        const c = el('div', 'auto-rl-cell' + (s === 0 ? ' is-pit' : s === N - 1 ? ' is-goal' : ''));
        const id = el('span', 'auto-rl-id'); id.append(el('span', 'auto-rl-w', 'Cell '), document.createTextNode(String(s))); c.append(id);
        if (s === 0) { c.append(el('span', 'auto-rl-sym', 'Pit'), el('span', 'auto-rl-sub', '−10')); desc.push('cell 0 is the pit'); }
        else if (s === N - 1) { c.append(el('span', 'auto-rl-sym', 'Goal'), el('span', 'auto-rl-sub', '+10')); desc.push('cell 6 is the goal'); }
        else { const b = best(s); c.append(el('span', 'auto-rl-sym', b === 0 ? '·' : b > 0 ? '→' : '←'), el('span', 'auto-rl-sub', s === START ? 'start' : '')); desc.push('cell ' + s + (b === 0 ? ' has no preferred move yet' : ' prefers moving ' + (b > 0 ? 'right' : 'left'))); }
        strip.append(c);
        if (s > 0 && s < N - 1) { const b = best(s); tab.add(['Cell ' + s, st.q[s][0].toFixed(2), st.q[s][1].toFixed(2), b === 0 ? 'none yet' : b > 0 ? 'right' : 'left']); }
      }
      strip.setAttribute('aria-label', 'Corridor of seven cells: ' + desc.join('; ') + '.');
      stat(stats, 'Episodes run', String(st.episodes)); stat(stats, 'Moves in the last episode', st.episodes ? String(st.steps) : '–'); stat(stats, 'Last episode', st.episodes ? st.end : '–');
      if (!st.episodes) { out.className = 'lab-readout'; out.textContent = 'All values start at 0, so the agent has no idea which way to go. Run an episode and watch the values change.'; }
      else {
        const goodRoute = [1, 2, 3, 4, 5].every(s => best(s) > 0);
        out.className = 'lab-readout' + (goodRoute ? ' is-good' : '');
        out.textContent = 'Last episode: ' + st.path.join(' → ') + ' (' + st.end + '). ' + (goodRoute ? 'Every cell now prefers moving right, so the agent has learned the route from rewards alone.' : st.eps === 0 ? 'With no exploration the agent only repeats what looks best so far, so it can miss a better route.' : 'Keep running episodes: the value of the goal spreads back one cell at a time.');
      }
    }
    reset();
  }

  /* ---------- 4. Logistic regression: moving the threshold ---------- */
  function buildLogistic(host) {
    Labs.shell(host, 'auto-lg', 'Logistic regression: where do you draw the line?', 'The curve is the model trained above (weight 1.239, bias −6.068). It gives the probability of passing for each number of hours studied. The threshold turns that probability into a yes or no. Move it and watch which of the ten students the model gets right.');
    const HRS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], PASS = [0, 0, 0, 1, 0, 1, 1, 0, 1, 1], WT = 1.239, BIAS = -6.068;
    const prob = h => 1 / (1 + Math.exp(-(WT * h + BIAS)));
    const st = { t: .5 };
    const f = el('div', 'lab-field'), l = el('label'), o = el('output'), inp = el('input');
    l.htmlFor = inp.id = 'auto-lg-t'; l.append(document.createTextNode('Threshold: predict "pass" when the probability is at least '), o);
    inp.type = 'range'; inp.min = 5; inp.max = 95; inp.step = 5; inp.value = 50; inp.addEventListener('input', () => { st.t = +inp.value / 100; draw(); });
    f.append(l, inp);
    const row = el('div', 'lab-row'); row.append(f); host.append(row);
    const presets = el('div', 'lab-actions');
    [['Default (0.50)', 50], ['Miss as few passes as possible (0.20)', 20], ['Only predict pass when sure (0.80)', 80]].forEach(p => presets.append(btn(p[0], '', () => { inp.value = p[1]; st.t = p[1] / 100; draw(); })));
    host.append(presets);
    const stage = el('div', 'lab-stage'); host.append(stage);
    const L = 52, R = 14, T = 16, B = 46;
    const svg = sv('svg', { role: 'img' }, stage), ch = pixelChart(svg, () => draw());
    const px = x => L + x / 11 * (ch.W - L - R), py = y => T + (1 - y) * (ch.H - T - B);
    const legend = el('ul', 'auto-legend'); [['is-pass', 'Actually passed'], ['is-fail', 'Actually failed'], ['is-wrong', 'Model got it wrong']].forEach(a => { const li = el('li'); li.append(el('span', 'auto-sw ' + a[0]), document.createTextNode(a[1])); legend.append(li); });
    host.append(legend);
    const tab = Labs.table(['Outcome', 'Predicted pass', 'Predicted fail'], { num: [1, 2], stack: true }); host.append(tab.wrap);
    const stats = el('div', 'lab-stats'), out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(stats, out);
    host.append(el('p', 'lab-note', 'Precision asks: of the students the model said would pass, how many did? Recall asks: of the students who did pass, how many did the model find? Moving the threshold trades one for the other. A disease screening test, for example, often uses a low threshold so that it misses very few cases, and accepts more false alarms.'));
    function draw() {
      ch.size(); const W = ch.W, H = ch.H, big = W > 560;
      svg.replaceChildren(); stats.replaceChildren(); tab.clear();
      const t = st.t, xb = (Math.log(t / (1 - t)) - BIAS) / WT;
      o.textContent = t.toFixed(2);
      inp.setAttribute('aria-valuetext', t.toFixed(2));
      if (xb > 0 && xb < 11) sv('rect', { x: px(xb), y: py(1), width: px(11) - px(xb), height: py(0) - py(1), class: 'auto-zone' }, svg);
      else if (xb <= 0) sv('rect', { x: px(0), y: py(1), width: px(11) - px(0), height: py(0) - py(1), class: 'auto-zone' }, svg);
      [0, .5, 1].forEach(v => { sv('line', { x1: px(0), y1: py(v), x2: px(11), y2: py(v), class: 'auto-grid' }, svg); const a = sv('text', { x: L - 6, y: py(v) + 4, class: 'auto-txt', 'text-anchor': 'end' }, svg); a.textContent = String(v); });
      [0, 2, 4, 6, 8, 10].forEach(v => { const a = sv('text', { x: px(v), y: py(0) + 24, class: 'auto-txt', 'text-anchor': 'middle' }, svg); a.textContent = String(v); });
      const xl = sv('text', { x: (L + W - R) / 2, y: H - 8, class: 'auto-txt', 'text-anchor': 'middle' }, svg); xl.textContent = 'Hours studied';
      const yl = sv('text', { x: 14, y: (T + H - B) / 2, class: 'auto-txt', 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (T + H - B) / 2 + ')' }, svg); yl.textContent = 'Probability of passing';
      let d = ''; for (let h = 0; h <= 11.001; h += .2) d += (d ? ' L' : 'M') + px(h).toFixed(1) + ',' + py(prob(h)).toFixed(1);
      sv('path', { d, class: 'auto-curve' }, svg);
      sv('line', { x1: px(0), y1: py(t), x2: px(11), y2: py(t), class: 'auto-thr' }, svg);
      if (xb > 0 && xb < 11) sv('line', { x1: px(xb), y1: py(1), x2: px(xb), y2: py(0), class: 'auto-thr' }, svg);
      if (xb < 9) { const zl = sv('text', { x: px(11) - 6, y: py(.25), class: 'auto-txt', 'text-anchor': 'end' }, svg); zl.textContent = 'predict pass'; }
      let tp = 0, fp = 0, fn = 0, tn = 0;
      HRS.forEach((h, i) => {
        const pred = prob(h) >= t ? 1 : 0, actual = PASS[i], ok = pred === actual;
        if (pred && actual) tp++; else if (pred) fp++; else if (actual) fn++; else tn++;
        if (!ok) sv('circle', { cx: px(h), cy: py(actual), r: big ? 13 : 11, class: 'auto-wrong' }, svg);
        sv('circle', { cx: px(h), cy: py(actual), r: big ? 7.5 : 6.5, class: actual ? 'auto-dot-pass' : 'auto-dot-fail' }, svg);
      });
      tab.add(['Actually passed', tp + ' (true positive)', fn + ' (false negative)']); tab.add(['Actually failed', fp + ' (false positive)', tn + ' (true negative)']);
      const pct = v => Math.round(v * 100) + '%';
      stat(stats, 'Accuracy (right overall)', pct((tp + tn) / 10)); stat(stats, 'Precision', tp + fp ? pct(tp / (tp + fp)) : 'no passes predicted'); stat(stats, 'Recall', tp + fn ? pct(tp / (tp + fn)) : '–');
      svg.setAttribute('aria-label', 'Chart of the probability of passing against hours studied for ten students, with the threshold at ' + t.toFixed(2) + '. The model predicts pass for ' + (xb <= 0 ? 'every student' : xb >= 11 ? 'no student' : 'students who studied ' + xb.toFixed(1) + ' hours or more') + '. It gets ' + (tp + tn) + ' of 10 right.');
      out.className = 'lab-readout';
      out.textContent = 'At a threshold of ' + t.toFixed(2) + ' the model predicts pass for ' + (xb <= 0 ? 'every student' : xb >= 11 ? 'no student' : 'students who studied about ' + xb.toFixed(1) + ' hours or more') + ': ' + tp + ' true positive' + (tp === 1 ? '' : 's') + ', ' + fp + ' false positive' + (fp === 1 ? '' : 's') + ', ' + fn + ' false negative' + (fn === 1 ? '' : 's') + ' and ' + tn + ' true negative' + (tn === 1 ? '' : 's') + '. ' + (t < .45 ? 'A low threshold catches more of the students who pass (higher recall) but wrongly includes more who fail.' : t > .55 ? 'A high threshold is more cautious: fewer wrong "pass" predictions, but more students who passed are missed.' : 'Near 0.5 the model treats a wrong "pass" and a wrong "fail" as equally bad.');
    }
    draw();
  }

  /* ---------- 5. Bias: past decisions or real outcomes ---------- */
  function buildBias(host) {
    Labs.shell(host, 'auto-bias', 'Bias lab: what does the loan model learn from?', 'This is the loan example above, made adjustable. Everyone earning $50 000 or more would repay, in both groups. Choose what the model learns from, what it can see and how unfair the past was, then compare who gets a loan.');
    const N = 4000, r = rng(42), people = [];
    for (let i = 0; i < N; i++) { const grpB = r() < .5; people.push({ b: grpB, income: 20 + Math.floor(r() * 81), u: r(), v: r() }); }
    const st = { label: 'decisions', feat: 'postcode', pB: .4, leak: .9 };
    const row = el('div', 'lab-row'); host.append(row);
    const pair = (title, opts, key) => { const box = el('div', 'lab-field'); box.append(el('span', 'lab-label', title)); const m = seg(box, title, opts, v => { st[key] = v; draw(); }); m(st[key]); row.append(box); };
    pair('The model learns from', [['decisions', 'Past loan decisions'], ['repays', 'Who really repaid']], 'label');
    pair('The model can see', [['income', 'Income band only'], ['postcode', 'Income band and postcode']], 'feat');
    const row2 = el('div', 'lab-row'); host.append(row2);
    const slider = (label, id, min, max, key, fmt) => { const f = el('div', 'lab-field'), l = el('label'), o = el('output'), i = el('input'); l.htmlFor = i.id = id; l.append(document.createTextNode(label + ': '), o); i.type = 'range'; i.min = min; i.max = max; i.step = 5; i.value = Math.round(st[key] * 100); i.addEventListener('input', () => { st[key] = +i.value / 100; draw(); }); f.append(l, i); row2.append(f); return () => { o.textContent = fmt(st[key]); }; };
    const r1 = slider('Past approval rate for good applicants in group B (group A is 95%)', 'auto-bias-pb', 10, 100, 'pB', v => Math.round(v * 100) + '%');
    const r2 = slider('How strongly postcode reveals the group', 'auto-bias-leak', 50, 100, 'leak', v => Math.round(v * 100) + '%');
    const bars = el('div', 'auto-bars'); host.append(bars);
    const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(out);
    host.append(el('p', 'lab-note', 'The measure is the one used in the worked example: among applicants who would repay, what share does each group see approved? The model is a lookup table of the share of similar applicants who got a "yes", and says yes when that share is at least 50%. All data is simulated, with its own random applicants, so the figures are close to the Python program\'s output rather than identical.'));
    function model() {
      const rows = people.map(p => {
        const home = p.b ? 'south' : 'north', other = p.b ? 'north' : 'south';
        const code = p.v < st.leak ? home : other, repays = p.income >= 50;
        const past = repays && p.u < (p.b ? st.pB : .95);
        return { b: p.b, repays, past, key: (st.feat === 'postcode' ? code + ':' : '') + Math.floor(p.income / 10) };
      });
      const tab = {};
      rows.forEach(x => { const lab = st.label === 'decisions' ? x.past : x.repays; const c = tab[x.key] || (tab[x.key] = [0, 0]); c[0] += lab ? 1 : 0; c[1]++; });
      const share = (grp, f) => { const g = rows.filter(x => x.repays && x.b === grp); return g.filter(f).length / g.length; };
      return { past: [share(false, x => x.past), share(true, x => x.past)], model: [share(false, x => tab[x.key][0] / tab[x.key][1] >= .5), share(true, x => tab[x.key][0] / tab[x.key][1] >= .5)] };
    }
    function draw() {
      r1(); r2(); bars.replaceChildren();
      const m = model(), pc = v => Math.round(v * 100);
      const block = (title, v) => {
        const b = el('div', 'auto-bar-block'); b.append(el('h5', 'lab-sub', title));
        [['Group A', v[0]], ['Group B', v[1]]].forEach(g => { const line = el('div', 'auto-bar-line'); const meter = el('div', 'lab-meter'), fill = el('span'); fill.style.width = pc(g[1]) + '%'; meter.append(fill); line.append(el('span', 'auto-bar-name', g[0]), meter, el('b', null, pc(g[1]) + '%')); b.append(line); });
        const gap = Math.abs(pc(v[0]) - pc(v[1])); b.append(el('p', 'auto-bar-gap', 'Gap: ' + gap + ' percentage point' + (gap === 1 ? '' : 's'))); bars.append(b); return gap;
      };
      const g1 = block('Past human decisions', m.past), g2 = block('Your model', m.model);
      out.className = 'lab-readout ' + (g2 >= 15 ? 'is-bad' : g2 <= 5 ? 'is-good' : '');
      let msg;
      if (st.label === 'repays') msg = 'The label is whether the person really repaid, so it contains no one\'s past choices and the gap is ' + g2 + ' points. In real life repayment is only known for people who were given a loan (selection bias), so this label is harder to collect than it looks.';
      else if (st.feat === 'income') msg = 'The model sees only income, so it cannot tell the groups apart and treats them the same (gap ' + g2 + ' points). It still learned from decisions, not outcomes, so the bias in the history is blended in rather than removed. Now let it see postcode.';
      else if (g2 >= 15) msg = 'The group column was never given to the model, yet the gap is ' + g2 + ' points (the officers\' own gap was ' + g1 + '). Postcode is a proxy: it leaks the group, and the model turns the tendency in the past decisions into a rule. Removing the sensitive column was not enough.';
      else msg = 'The gap is only ' + g2 + ' points. Either the past decisions were fairly even (gap ' + g1 + ') or postcode is too weak a clue for the model to use as a rule. Raise the unfairness or the postcode clue and watch the gap return.';
      out.textContent = msg;
      bars.setAttribute('role', 'group'); bars.setAttribute('aria-label', 'Share of applicants who would repay that are approved. Past decisions: group A ' + pc(m.past[0]) + '%, group B ' + pc(m.past[1]) + '%. Your model: group A ' + pc(m.model[0]) + '%, group B ' + pc(m.model[1]) + '%.');
    }
    draw();
  }

  /* ---------- 6. AI, ML or deep learning? ---------- */
  function buildAiMl(host) {
    Labs.sorter(host, {
      cls: 'auto-aiml', title: 'AI, ML or deep learning?',
      lead: 'Each system sits in one of three nested circles. Pick the smallest circle it belongs in.',
      noun: 'system', groupLabel: 'Smallest circle', keepCase: true,
      choices: [{ key: 'AI', label: 'AI, but not ML' }, { key: 'ML', label: 'ML, but not deep learning' }, { key: 'DL', label: 'Deep learning' }],
      items: [
        { text: 'A chess program that searches ahead and scores positions with rules written by its programmers.', ans: 'AI', why: 'It behaves intelligently, but its knowledge was written by people, not learned from data.' },
        { text: 'A spam filter that learns from thousands of emails marked spam or not spam, using a decision tree.', ans: 'ML', why: 'It learns from data, so it is ML. A decision tree is not a neural network, so it is not deep learning.' },
        { text: 'Speech recognition that uses a neural network with many layers, trained on many hours of recordings.', ans: 'DL', why: 'Deep learning is ML that uses neural networks with many layers.' },
        { text: 'A help-desk chatbot that replies from a fixed script of keyword rules.', ans: 'AI', why: 'Scripted rules are AI, but nothing is learned from data, so it is not ML.' },
        { text: 'A model that predicts house prices with linear regression fitted to past sales.', ans: 'ML', why: 'It learns a line from data, which is ML. It is not a many-layered neural network.' },
        { text: 'An image generator trained on millions of pictures.', ans: 'DL', why: 'Generative AI is trained on huge datasets with many-layered neural networks, so it is deep learning.' },
        { text: 'A route planner that finds the shortest path with a search algorithm and a road map.', ans: 'AI', why: 'Search is a classic AI technique. It follows rules over a map and does not learn from training data.' },
        { text: 'A phone that unlocks by recognising your face, using a many-layered neural network trained on faces.', ans: 'DL', why: 'Face recognition is ML, and the many-layered network makes it deep learning.' }
      ],
      closing: 'The circles are nested: all deep learning is ML, and all ML is AI. The question to ask is where the behaviour came from: written rules (AI only), patterns learned from data (ML), or a many-layered neural network (deep learning).'
    });
  }

  /* ---------- 7. Which area of impact? ---------- */
  function buildImpact(host) {
    Labs.sorter(host, {
      cls: 'auto-impact', title: 'Which area of impact?',
      lead: 'Each statement is about one of the five areas in the syllabus. Choose the area it belongs to, then read how it connects to a benefit, a harm or both.',
      noun: 'statement', groupLabel: 'Area of impact',
      choices: [{ key: 'SAF', label: 'Safety of workers' }, { key: 'DIS', label: 'People with disability' }, { key: 'EMP', label: 'Employment' }, { key: 'ENV', label: 'Efficiency and environment' }, { key: 'ECO', label: 'Economy and wealth' }],
      items: [
        { text: 'Drones inspect high-voltage power lines, so a worker no longer has to climb the tower.', ans: 'SAF', why: 'Taking people out of dangerous tasks is a safety benefit. The risk is new hazards around machines, and job loss.' },
        { text: 'A phone app describes the people, money and text in front of a user who is blind or has low vision.', ans: 'DIS', why: 'Image description widens independence. The harm to watch for is systems tested only on typical users.' },
        { text: 'Data-entry and invoice-processing tasks are automated, while demand grows for maintenance and data roles.', ans: 'EMP', why: 'This is the shift in the nature and skills of work. Retraining decides who benefits.' },
        { text: 'Predictive maintenance means equipment is replaced less often, but training large models uses a lot of electricity.', ans: 'ENV', why: 'Less waste is a benefit, while the energy and cooling needed by data centres are a cost. Both belong under production efficiency, waste and the environment.' },
        { text: 'Productivity gains mostly flow to business owners and workers with high-demand skills.', ans: 'ECO', why: 'The concern is how new wealth is shared. Tax, training and wage policy can change who gains.' },
        { text: 'Speech-to-text lets a person with limited hand movement dictate documents and control a computer.', ans: 'DIS', why: 'Voice control removes a barrier to using technology, so it is an accessibility benefit.' },
        { text: 'Autonomous haul trucks carry ore in remote pits without a driver, while maintenance staff need new skills.', ans: 'SAF', why: 'Removing drivers from remote, hazardous sites is a safety gain, and it changes the work left for people (employment).', extra: 'Several statements touch two areas. In an exam, name the main area, then link the second.' }
      ],
      extraLabel: 'Note',
      closing: 'To assess an impact, say who benefits, who carries the risk, and what would reduce the harm, then give a judgement. Most real examples touch more than one area.'
    });
  }

  function init() {
    const builders = { training: buildTraining, kmeans: buildKmeans, rl: buildRl, logistic: buildLogistic, bias: buildBias, aiml: buildAiMl, impact: buildImpact };
    document.querySelectorAll('[data-autolab]').forEach(host => {
      const b = builders[host.getAttribute('data-autolab')];
      if (!b) return;
      try { b(host); } catch (e) { /* leave the static description in place */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
