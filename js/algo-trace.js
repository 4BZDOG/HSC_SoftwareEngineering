/* ============================================================
   Algorithm trace component.
   Steps a flowchart, NESA pseudocode and a data strip together.
   Everything algorithm-specific lives in a definition registered
   with HSCTrace.define(name, def) — see js/algo-traces.js.

   Markup:  <div class="algo-trace" data-trace="linearSearch"></div>
   ============================================================ */

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const DEFS = {};
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let uid = 0;

  const clone = v => JSON.parse(JSON.stringify(v));
  const lines = n => (n.line == null ? [] : [].concat(n.line));

  function svg(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  function h(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function button(label, text, cls) {
    const b = h('button', 'trace-btn' + (cls ? ' ' + cls : ''), text);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.title = label;
    return b;
  }

  class Trace {
    constructor(root, def) {
      this.root = root;
      this.def = def;
      this.id = 'tr' + (++uid);
      this.data = clone(def.data);
      this.queue = Promise.resolve();
      this.playing = false;
      this.userPaused = false;
      this.inView = false;
      this.build();
      this.restart();
      this.observe();
    }

    /* ── DOM ─────────────────────────────────────────────── */

    build() {
      const { root, def } = this;
      root.classList.add('algo-trace');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', (def.title || 'Algorithm') + ' trace');
      root.tabIndex = 0;
      root.innerHTML = '';

      const stage = h('div', 'trace-stage');
      const chart = h('div', 'trace-chart');
      this.buildChart(chart);
      this.code = h('pre', 'trace-code');
      this.buildCode();
      stage.append(chart, this.code);

      const strip = h('div', 'trace-strip');
      this.cells = h('ol', 'trace-cells');
      this.cells.setAttribute('aria-label', 'Array ' + (def.arrayKey || 'A'));
      const meta = h('div', 'trace-meta');
      this.vars = h('div', 'trace-vars');
      this.counter = h('span', 'trace-count');
      this.result = h('span', 'trace-result');
      meta.append(this.vars, this.counter, this.result);
      strip.append(this.cells, meta);

      root.append(stage, strip, this.buildControls());

      this.live = h('p', 'sr-only');
      this.live.setAttribute('aria-live', 'polite');
      root.append(this.live);

      root.addEventListener('keydown', e => this.onKey(e));
    }

    buildChart(host) {
      const { def } = this;
      const nodes = def.nodes;
      let w = 0, hgt = 0;
      for (const k in nodes) {
        const n = nodes[k];
        w = Math.max(w, n.x + n.w / 2);
        hgt = Math.max(hgt, n.y + n.h / 2);
      }
      const [vw, vh] = def.size || [w + 12, hgt + 12];
      const s = svg('svg', { viewBox: `0 0 ${vw} ${vh}`, 'aria-hidden': 'true', focusable: 'false' });
      const defs = svg('defs', {}, s);
      const m = svg('marker', {
        id: this.id + '-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
      }, defs);
      svg('path', { d: 'M0 0 L10 5 L0 10 z', class: 'tr-arrow' }, m);

      this.edgeEls = {};
      const eg = svg('g', { class: 'tr-edges' }, s);
      for (const key in def.edges) {
        this.edgeEls[key] = svg('path', {
          d: def.edges[key], class: 'tr-edge', 'marker-end': `url(#${this.id}-arrow)`
        }, eg);
      }

      const lg = svg('g', { class: 'tr-labels' }, s);
      (def.labels || []).forEach(([t, x, y]) => {
        svg('text', { x, y, class: 'tr-label' }, lg).textContent = t;
      });

      this.nodeEls = {};
      const ng = svg('g', { class: 'tr-nodes' }, s);
      for (const id in nodes) {
        const n = nodes[id];
        const g = svg('g', { class: 'tr-node tr-' + n.shape }, ng);
        const x0 = n.x - n.w / 2, y0 = n.y - n.h / 2;
        if (n.shape === 'diamond') {
          svg('polygon', {
            points: `${n.x},${y0} ${x0 + n.w},${n.y} ${n.x},${y0 + n.h} ${x0},${n.y}`
          }, g);
        } else {
          svg('rect', {
            x: x0, y: y0, width: n.w, height: n.h,
            rx: n.shape === 'stadium' ? n.h / 2 : 3
          }, g);
        }
        const rows = String(n.text).split('\n');
        const t = svg('text', { x: n.x, y: n.y - (rows.length - 1) * 7.5 }, g);
        rows.forEach((r, i) => {
          svg('tspan', { x: n.x, dy: i ? 15 : 0 }, t).textContent = r;
        });
        this.nodeEls[id] = g;
      }

      this.token = svg('circle', { r: 5, class: 'tr-token', cx: -20, cy: -20 }, s);
      host.append(s);
    }

    buildCode() {
      this.codeLines = this.def.code.map((tokens, i) => {
        const row = h('span', 'trace-line');
        row.append(h('span', 'trace-ln', String(i + 1)));
        tokens.forEach(tok => {
          const m = /^(\s*)(\S.*?)(\s*)$/.exec(tok);
          if (m && /^[A-Z]{2,}$/.test(m[2])) {
            row.append(m[1], h('span', 'trace-kw', m[2]), m[3]);
          } else {
            row.append(tok);
          }
        });
        this.code.append(row, '\n');
        return row;
      });
    }

    buildControls() {
      const bar = h('div', 'trace-controls');
      this.btnBack = button('Step back (Left arrow)', '◀ Step');
      this.btnPlay = button('Play (Space)', '▶ Play', 'trace-play');
      this.btnNext = button('Step forward (Right arrow)', 'Step ▶');
      this.btnReset = button('Reset (R)', '↺ Reset');
      this.btnBack.addEventListener('click', () => this.manual(() => this.back()));
      this.btnNext.addEventListener('click', () => this.manual(() => this.forward(true)));
      this.btnPlay.addEventListener('click', () => this.togglePlay());
      this.btnReset.addEventListener('click', () => this.manual(() => this.reset()));
      bar.append(this.btnBack, this.btnPlay, this.btnNext, this.btnReset);

      const inp = this.def.input;
      if (inp) {
        const form = h('form', 'trace-input');
        const id = this.id + '-in';
        const label = h('label', null, inp.label);
        label.htmlFor = id;
        this.field = h('input');
        this.field.id = id;
        this.field.type = 'text';
        this.field.inputMode = inp.type === 'list' ? 'text' : 'numeric';
        this.field.autocomplete = 'off';
        this.field.value = this.format(this.data[inp.key]);
        this.field.size = inp.type === 'list' ? 16 : 4;
        const go = button('Run with this ' + inp.label.toLowerCase(), 'Run');
        go.type = 'submit';
        this.error = h('span', 'trace-error');
        this.error.setAttribute('role', 'status');
        form.append(label, this.field, go);
        (inp.examples || []).forEach(ex => {
          const b = button('Try ' + inp.label.toLowerCase() + ' ' + this.format(ex.value),
            ex.text || this.format(ex.value), 'trace-chip');
          b.addEventListener('click', () => { this.field.value = this.format(ex.value); this.submit(); });
          form.append(b);
        });
        form.append(this.error);
        form.addEventListener('submit', e => { e.preventDefault(); this.submit(); });
        bar.append(form);
      }
      return bar;
    }

    format(v) { return Array.isArray(v) ? v.join(', ') : String(v); }

    submit() {
      const inp = this.def.input;
      const raw = this.field.value.trim();
      let v;
      if (inp.type === 'list') {
        v = raw.split(/[\s,]+/).filter(Boolean).map(Number);
        if (!v.length || v.some(n => !Number.isFinite(n)) || v.length > (inp.max || 10)) {
          this.error.textContent = `Enter 1–${inp.max || 10} numbers separated by commas.`;
          return;
        }
      } else {
        v = Number(raw);
        if (raw === '' || !Number.isFinite(v)) { this.error.textContent = 'Enter a number.'; return; }
      }
      this.error.textContent = '';
      this.data[inp.key] = v;
      this.manual(() => this.restart());
      if (this.inView && !reduceMQ.matches) { this.userPaused = false; this.play(); }
    }

    /* ── State ───────────────────────────────────────────── */

    restart() {
      this.gen = this.def.run(clone(this.data));
      this.history = [];
      this.pos = -1;
      this.done = false;
      this.forwardSync();
    }

    reset() {
      this.pos = -1;
      this.forwardSync();
    }

    // Returns the next history entry, pulling from the generator when needed.
    peekNext() {
      if (this.pos + 1 < this.history.length) return this.history[this.pos + 1];
      if (this.done) return null;
      const r = this.gen.next();
      if (r.done) { this.done = true; return null; }
      const prev = this.history[this.history.length - 1];
      const count = (prev ? prev.state.count : 0) + (r.value.count ? 1 : 0);
      const entry = { step: r.value, state: { count, n: this.history.length + 1 } };
      this.history.push(entry);
      return entry;
    }

    forwardSync() {
      if (!this.peekNext()) return false;
      this.pos++;
      this.apply(this.history[this.pos], null);
      return true;
    }

    async forward(animate) {
      const cur = this.history[this.pos];
      const next = this.peekNext();
      if (!next) return false;
      const edge = cur && this.edgeEls[cur.step.node + '-' + next.step.node];
      if (animate && edge && !reduceMQ.matches) await this.travel(edge);
      this.pos++;
      this.apply(next, edge);
      return true;
    }

    back() {
      if (this.pos <= 0) return;
      this.pos--;
      this.apply(this.history[this.pos], null);
    }

    atEnd() {
      const cur = this.history[this.pos];
      return !!(cur && cur.step.result != null && this.pos === this.history.length - 1);
    }

    /* ── Rendering ───────────────────────────────────────── */

    apply(entry, edge) {
      const { step, state } = entry;
      const def = this.def;
      const node = def.nodes[step.node];
      const tone = step.tone || 'on';

      for (const id in this.nodeEls) this.nodeEls[id].classList.remove('is-on', 'is-yes', 'is-no');
      if (this.nodeEls[step.node]) this.nodeEls[step.node].classList.add('is-' + tone);

      const active = new Set(node ? lines(node) : []);
      this.codeLines.forEach((row, i) => row.classList.toggle('is-on', active.has(i)));

      // Token rests at the end of the edge it arrived on, or on top of the node.
      if (edge) {
        const p = edge.getPointAtLength(edge.getTotalLength());
        this.moveToken(p.x, p.y);
      } else if (node) {
        this.moveToken(node.x, node.y - node.h / 2);
      }

      // Data strip
      const arr = step.array || this.data[def.arrayKey || 'A'] || [];
      const cells = step.cells || {};
      const ptr = {};
      for (const k in step.pointers || {}) {
        const i = step.pointers[k];
        (ptr[i] = ptr[i] || []).push(k);
      }
      this.cells.innerHTML = '';
      arr.forEach((v, i) => {
        const li = h('li', 'trace-cell' + (cells[i] ? ' is-' + cells[i] : ''));
        li.append(h('span', 'trace-val', String(v)), h('span', 'trace-idx', String(i)));
        const p = h('span', 'trace-ptr', ptr[i] ? '↑ ' + ptr[i].join(', ') : '');
        li.append(p);
        this.cells.append(li);
      });

      this.vars.innerHTML = '';
      const vars = Object.assign({}, def.showInput && def.input ? { [def.input.key]: this.data[def.input.key] } : {}, step.vars);
      for (const k in vars) {
        const chip = h('span', 'trace-var');
        chip.append(h('b', null, k), ' = ' + this.format(vars[k]));
        this.vars.append(chip);
      }

      this.counter.textContent = `${def.counter || 'Comparisons'}: ${state.count}`;
      this.result.textContent = step.result != null ? step.result : '';
      this.result.className = 'trace-result' + (step.result != null ? ' is-' + tone : '');

      this.live.textContent = step.say || (node ? node.text.replace(/\n/g, ', ') : '');
      this.btnBack.disabled = this.pos <= 0;
      this.btnNext.disabled = this.atEnd();
    }

    moveToken(x, y) {
      this.token.setAttribute('cx', x);
      this.token.setAttribute('cy', y);
    }

    travel(path) {
      const len = path.getTotalLength();
      const dur = Math.max(120, (len / 9) * 22);
      return new Promise(resolve => {
        const t0 = performance.now();
        this.finishTravel = () => { this.finishTravel = null; resolve(); };
        const tick = now => {
          if (!this.finishTravel) return;
          const k = Math.min(1, (now - t0) / dur);
          const p = path.getPointAtLength(len * k);
          this.moveToken(p.x, p.y);
          if (k < 1) requestAnimationFrame(tick);
          else this.finishTravel();
        };
        requestAnimationFrame(tick);
      });
    }

    /* ── Control flow ────────────────────────────────────── */

    // Serialise actions so the chart, code and strip never drift apart.
    enqueue(fn) {
      this.queue = this.queue.then(fn).catch(e => console.error(e));
      return this.queue;
    }

    manual(fn) {
      this.pause(true);
      if (this.finishTravel) this.finishTravel();
      return this.enqueue(fn);
    }

    togglePlay() {
      if (this.playing) this.pause(true);
      else { this.userPaused = false; this.play(); }
    }

    play() {
      if (this.playing) return;
      this.playing = true;
      this.btnPlay.textContent = '❚❚ Pause';
      this.btnPlay.setAttribute('aria-label', 'Pause (Space)');
      this.btnPlay.setAttribute('aria-pressed', 'true');
      this.schedule();
    }

    pause(byUser) {
      if (byUser) this.userPaused = true;
      if (!this.playing) return;
      this.playing = false;
      clearTimeout(this.timer);
      this.btnPlay.textContent = '▶ Play';
      this.btnPlay.setAttribute('aria-label', 'Play (Space)');
      this.btnPlay.setAttribute('aria-pressed', 'false');
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.playing) return;
      const cur = this.history[this.pos];
      const node = cur && this.def.nodes[cur.step.node];
      const delay = this.atEnd() ? 2000 : node && node.shape === 'diamond' ? 600 : 420;
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        this.enqueue(async () => {
          if (!this.playing) return;
          if (this.atEnd()) this.reset();
          else await this.forward(true);
          this.schedule();
        });
      }, delay);
    }

    onKey(e) {
      if (e.target.closest('input')) return;
      if (e.key === 'ArrowRight') this.manual(() => this.forward(true));
      else if (e.key === 'ArrowLeft') this.manual(() => this.back());
      else if (e.key === ' ' && !e.target.closest('button')) this.togglePlay();
      else if (e.key === 'r' || e.key === 'R') this.manual(() => this.reset());
      else return;
      e.preventDefault();
    }

    observe() {
      const resume = () => {
        if (this.inView && !document.hidden && !this.userPaused && !reduceMQ.matches) this.play();
        else this.pause(false);
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          this.inView = entries[0].isIntersecting;
          resume();
        }, { threshold: 0.35 }).observe(this.root);
      }
      document.addEventListener('visibilitychange', resume);
    }
  }

  function mountAll() {
    document.querySelectorAll('[data-trace]').forEach(el => {
      if (el._trace) return;
      const def = DEFS[el.dataset.trace];
      if (!def) { console.warn('Unknown trace:', el.dataset.trace); return; }
      el._trace = new Trace(el, def);
    });
  }

  window.HSCTrace = {
    define(name, def) {
      DEFS[name] = def;
      if (document.readyState !== 'loading') mountAll();
    },
    mountAll
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
