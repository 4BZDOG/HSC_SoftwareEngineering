/* Programming Mechatronics: closed loop control simulator.
   A heated room is simulated for 240 minutes under one of three controllers
   (open loop, on/off with a hysteresis band, proportional). The room is a
   simple model: heat flows out in proportion to the difference from the outside
   temperature, and the heater adds heat in proportion to its output.
   Vanilla JS; every value shown is written with textContent. A static
   description stays in the page if this file does not run. */
(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const sv = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const signed = v => (v >= 0 ? '+' : '−') + f1(Math.abs(v));

  /* ── The model ───────────────────────────────────────────── */
  const LOSS = 0.03;        // fraction of the temperature difference lost each minute
  const HEAT = 0.9;         // degrees per minute the heater adds at full output
  const MINUTES = 240;
  const START = 15;         // starting room temperature
  const DOOR_FROM = 120, DOOR_TO = 150, DOOR_LOSS = 4;   // an open door quadruples the loss

  const random = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  function simulate(p) {
    const rand = random(p.seed);
    const temp = [], sensor = [], output = [];
    let T = START, on = false;
    for (let t = 0; t < MINUTES; t++) {
      const reading = T + (rand() * 2 - 1) * p.noise;
      let u;
      if (p.mode === 'open') {
        u = p.duty / 100;
      } else if (p.mode === 'onoff') {
        if (reading < p.sp - p.band / 2) on = true;
        else if (reading > p.sp + p.band / 2) on = false;
        u = on ? 1 : 0;
      } else {
        u = clamp(p.kp * (p.sp - reading), 0, 1);
      }
      temp.push(T); sensor.push(reading); output.push(u);
      const loss = LOSS * (p.door && t >= DOOR_FROM && t < DOOR_TO ? DOOR_LOSS : 1);
      T += -loss * (T - p.outside) + HEAT * u;
    }
    return { temp, sensor, output };
  }

  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;

  function measure(p, r) {
    const settled = mean(r.temp.slice(90, 120)) - p.sp;           // just before the door opens
    const mae = mean(r.temp.slice(60).map(v => Math.abs(v - p.sp)));
    let switches = 0;
    for (let i = 1; i < r.output.length; i++) if (r.output[i] !== r.output[i - 1]) switches++;
    const after = r.temp.slice(60, DOOR_FROM);                     // after warm-up, before the door
    const swing = Math.max(...after) - Math.min(...after);
    const doorDip = p.door ? Math.min(...r.temp.slice(DOOR_FROM, DOOR_TO + 40)) - p.sp : null;
    return { settled, mae, switches, swing, doorDip };
  }

  function describe(p, m) {
    let s;
    if (p.mode === 'open') {
      s = `Open loop: the heater runs at ${p.duty}% whatever the room does. Before the door opens the room settles ${signed(m.settled)} °C from the setpoint. Nothing measures the result, so changing the outside temperature or opening the door moves the room away from the target and nothing corrects it.`;
    } else if (p.mode === 'onoff') {
      s = `On/off control with a ${f1(p.band)} °C band: the heater switched ${m.switches} times in ${MINUTES} minutes and the temperature varied over a range of ${f1(m.swing)} °C between minutes 60 and 120. ${p.band < 0.5 && p.noise > 0.2 ? 'The band is narrower than the sensor noise, so the heater chatters. ' : 'A wider band means fewer switches but a bigger swing. '}`;
    } else {
      s = `Proportional control with Kp = ${p.kp.toFixed(2)}: the room settles ${signed(m.settled)} °C from the setpoint. The heater output shrinks as the error shrinks, so a small offset remains. A higher Kp reduces the offset; too high with a noisy sensor makes the output jumpy.`;
    }
    if (m.doorDip != null) s += ` With the door open the room dropped to ${signed(m.doorDip)} °C from the setpoint at its lowest.`;
    return s.trim();
  }

  /* ── The widget ──────────────────────────────────────────── */
  const DEFAULTS = { mode: 'open', sp: 22, outside: 10, noise: 0.3, band: 2, kp: 0.2, duty: 40, door: false, seed: 7 };

  function build(host) {
    const st = Object.assign({}, DEFAULTS);
    let cursor = 60;
    let uid = 'ms' + Math.random().toString(36).slice(2, 7);
    host.replaceChildren();

    const head = el('div', 'ms-head');
    head.append(el('h4', null, 'Closed loop control simulator'), el('p', 'ms-lead', 'A room is heated for 240 minutes. Pick a controller, change the settings and watch how well it holds the setpoint. Nothing here moves on its own, so you can study each result.'));
    host.append(head);

    // Controller choice
    const modes = [['open', 'Open loop'], ['onoff', 'On/off with band'], ['prop', 'Proportional']];
    const seg = el('div', 'ms-seg');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Controller type');
    const segBtns = modes.map(([key, name]) => {
      const b = el('button', 'ms-btn', name);
      b.type = 'button';
      b.addEventListener('click', () => { st.mode = key; update(); });
      seg.append(b);
      return [key, b];
    });
    host.append(seg);

    // Sliders
    const controls = el('div', 'ms-controls');
    const rows = {};
    const slider = (key, label, min, max, step, fmt, modesShown) => {
      const wrap = el('div', 'ms-ctl');
      const id = `${uid}-${key}`;
      const lab = el('label', null, label);
      lab.htmlFor = id;
      const out = el('output', 'ms-val');
      out.htmlFor = id;
      const input = document.createElement('input');
      input.type = 'range'; input.id = id; input.min = min; input.max = max; input.step = step; input.value = st[key];
      input.addEventListener('input', () => { st[key] = parseFloat(input.value); update(); });
      const top = el('div', 'ms-ctl-top'); top.append(lab, out);
      wrap.append(top, input);
      controls.append(wrap);
      rows[key] = { wrap, input, out, fmt, modesShown };
    };
    slider('sp', 'Setpoint', 16, 28, 0.5, v => `${f1(v)} °C`, null);
    slider('outside', 'Outside temperature', 0, 20, 1, v => `${v} °C`, null);
    slider('noise', 'Sensor noise (±)', 0, 2, 0.1, v => `${f1(v)} °C`, null);
    slider('duty', 'Heater output (open loop)', 0, 100, 5, v => `${v}%`, ['open']);
    slider('band', 'Hysteresis band', 0, 6, 0.5, v => `${f1(v)} °C`, ['onoff']);
    slider('kp', 'Proportional gain Kp', 0.05, 1.5, 0.05, v => v.toFixed(2), ['prop']);
    host.append(controls);

    const opts = el('div', 'ms-opts');
    const doorId = `${uid}-door`;
    const doorLab = el('label', 'ms-check');
    const door = document.createElement('input');
    door.type = 'checkbox'; door.id = doorId;
    door.addEventListener('change', () => { st.door = door.checked; update(); });
    doorLab.append(door, document.createTextNode(' Open the door from minute 120 to 150'));
    const reseed = el('button', 'ms-btn ms-btn-quiet', 'New noise pattern');
    reseed.type = 'button';
    reseed.addEventListener('click', () => { st.seed = Math.floor(Math.random() * 100000); update(); });
    const reset = el('button', 'ms-btn ms-btn-quiet', 'Reset');
    reset.type = 'button';
    reset.addEventListener('click', () => { Object.assign(st, DEFAULTS); door.checked = false; cursor = 60; update(); });
    opts.append(doorLab, reseed, reset);
    host.append(opts);

    // Chart and reading
    const legend = el('ul', 'ms-legend');
    const legendItem = (cls, name) => { const li = el('li'); const sw = el('span', 'ms-sw ' + cls); sw.setAttribute('aria-hidden', 'true'); li.append(sw, document.createTextNode(name)); legend.append(li); return li; };
    legendItem('is-temp', 'room temperature');
    legendItem('is-sp', 'setpoint');
    const legendSensor = legendItem('is-sensor', 'sensor reading');
    const legendBand = legendItem('is-band', 'hysteresis band');
    host.append(legend);
    const chartBox = el('div', 'ms-chart');
    host.append(chartBox);

    const cursorWrap = el('div', 'ms-ctl ms-cursor');
    const cId = `${uid}-cursor`;
    const cLab = el('label', null, 'Read a moment in time');
    cLab.htmlFor = cId;
    const cOut = el('output', 'ms-val');
    cOut.htmlFor = cId;
    const cIn = document.createElement('input');
    cIn.type = 'range'; cIn.id = cId; cIn.min = 0; cIn.max = MINUTES - 1; cIn.step = 1; cIn.value = cursor;
    cIn.addEventListener('input', () => { cursor = parseInt(cIn.value, 10); draw(); });
    const cTop = el('div', 'ms-ctl-top'); cTop.append(cLab, cOut);
    cursorWrap.append(cTop, cIn);
    host.append(cursorWrap);

    const stats = el('dl', 'ms-stats');
    const stat = (name) => { const d = el('div'); const dt = el('dt', null, name); const dd = el('dd'); d.append(dt, dd); stats.append(d); return dd; };
    const sSettled = stat('Offset from setpoint (minutes 90 to 120)');
    const sMae = stat('Average error (after minute 60)');
    const sSw = stat('Heater switches');
    host.append(stats);

    const live = el('p', 'ms-summary');
    live.setAttribute('aria-live', 'polite');
    host.append(live);

    const det = el('details', 'ms-table');
    det.append(el('summary', null, 'Show the numbers'));
    const tw = el('div', 'table-wrap');
    det.append(tw);
    host.append(det);

    host.append(el('p', 'ms-try', 'Try this: (1) In open loop, change the outside temperature from 10 to 5 and watch the room drift, with nothing to correct it. (2) In on/off mode, set the band to 0 with noise above 0.5 and count the switches. (3) In proportional mode, raise Kp from 0.2 to 1.0 and compare the offset. (4) Open the door and compare all three.'));

    let result = null, metrics = null;

    function update() {
      segBtns.forEach(([key, b]) => b.setAttribute('aria-pressed', String(key === st.mode)));
      for (const k in rows) {
        const r = rows[k];
        r.input.value = st[k];
        r.out.textContent = r.fmt(st[k]);
        r.wrap.hidden = !!(r.modesShown && !r.modesShown.includes(st.mode));
      }
      door.checked = st.door;
      legendSensor.hidden = st.noise <= 0;
      legendBand.hidden = !(st.mode === 'onoff' && st.band > 0);
      result = simulate(st);
      metrics = measure(st, result);
      sSettled.textContent = `${signed(metrics.settled)} °C`;
      sMae.textContent = `${f1(metrics.mae)} °C`;
      sSw.textContent = st.mode === 'prop' ? 'Not applicable' : String(metrics.switches);
      live.textContent = describe(st, metrics);
      tw.replaceChildren(table());
      draw();
    }

    function table() {
      const t = el('table');
      const hd = el('tr');
      ['Minute', 'Room temperature', 'Sensor reading', 'Heater output'].forEach(h => hd.append(el('th', null, h)));
      const thead = el('thead');
      thead.append(hd);
      t.append(thead);
      const body = el('tbody');
      for (let m = 0; m < MINUTES; m += 20) {
        const r = el('tr');
        [m, `${f1(result.temp[m])} °C`, `${f1(result.sensor[m])} °C`, `${Math.round(result.output[m] * 100)}%`].forEach(v => r.append(el('td', null, String(v))));
        body.append(r);
      }
      t.append(body);
      return t;
    }

    function draw() {
      if (!result) return;
      const W = Math.max(300, Math.floor(chartBox.clientWidth || 640));
      const L = 40, R = 12, T = 24, H1 = 210, GAP = 30, H2 = 64, B = 30;
      const H = T + H1 + GAP + H2 + B;
      const all = result.temp.concat(result.sensor, [st.sp]);
      let lo = Math.floor(Math.min(...all) - 1), hi = Math.ceil(Math.max(...all) + 1);
      const step = hi - lo > 24 ? 10 : hi - lo > 12 ? 5 : 2;
      lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
      const X = m => L + (m / (MINUTES - 1)) * (W - L - R);
      const Y = v => T + H1 - ((v - lo) / (hi - lo)) * H1;
      const Y2 = u => T + H1 + GAP + H2 - u * H2;

      const s = sv('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': live.textContent, class: 'ms-svg' });
      // Door period
      if (st.door) {
        sv('rect', { x: X(DOOR_FROM), y: T, width: X(DOOR_TO) - X(DOOR_FROM), height: H1 + GAP + H2, class: 'ms-door' }, s);
        sv('text', { x: X(DOOR_FROM) + 3, y: T + 11, class: 'ms-note' }, s).textContent = 'door open';
      }
      // Grid and axes
      for (let v = lo; v <= hi; v += step) {
        sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'ms-grid' }, s);
        sv('text', { x: L - 6, y: Y(v) + 4, class: 'ms-tick', 'text-anchor': 'end' }, s).textContent = v;
      }
      for (let m = 0; m <= MINUTES; m += 60) {
        const x = X(Math.min(m, MINUTES - 1));
        sv('line', { x1: x, x2: x, y1: T, y2: T + H1, class: 'ms-grid' }, s);
        sv('text', { x, y: T + H1 + GAP + H2 + 18, class: 'ms-tick', 'text-anchor': 'middle' }, s).textContent = m;
      }
      sv('text', { x: L - 6, y: 12, class: 'ms-axis', 'text-anchor': 'end' }, s).textContent = '°C';
      sv('text', { x: W - R, y: H - 2, class: 'ms-axis', 'text-anchor': 'end' }, s).textContent = 'minutes';
      // Band
      if (st.mode === 'onoff' && st.band > 0) {
        sv('rect', { x: L, y: Y(st.sp + st.band / 2), width: W - L - R, height: Math.max(1, Y(st.sp - st.band / 2) - Y(st.sp + st.band / 2)), class: 'ms-band' }, s);
      }
      // Setpoint
      sv('line', { x1: L, x2: W - R, y1: Y(st.sp), y2: Y(st.sp), class: 'ms-sp' }, s);
      // Sensor, then true temperature
      const path = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
      if (st.noise > 0) sv('path', { d: path(result.sensor), class: 'ms-sensor' }, s);
      sv('path', { d: path(result.temp), class: 'ms-temp' }, s);
      // Heater panel
      sv('text', { x: L - 6, y: Y2(1) + 4, class: 'ms-tick', 'text-anchor': 'end' }, s).textContent = '100%';
      sv('text', { x: L - 6, y: Y2(0) + 4, class: 'ms-tick', 'text-anchor': 'end' }, s).textContent = '0%';
      sv('line', { x1: L, x2: W - R, y1: Y2(0), y2: Y2(0), class: 'ms-grid' }, s);
      sv('line', { x1: L, x2: W - R, y1: Y2(1), y2: Y2(1), class: 'ms-grid' }, s);
      const area = result.output.map((u, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y2(u).toFixed(1)}`).join('');
      sv('path', { d: `${area}L${X(MINUTES - 1).toFixed(1)} ${Y2(0)}L${X(0)} ${Y2(0)}Z`, class: 'ms-heater-fill' }, s);
      sv('path', { d: area, class: 'ms-heater' }, s);
      sv('text', { x: L + 4, y: Y2(1) + 12, class: 'ms-note' }, s).textContent = 'heater output';
      // Cursor
      sv('line', { x1: X(cursor), x2: X(cursor), y1: T, y2: T + H1 + GAP + H2, class: 'ms-cursor-line' }, s);
      sv('circle', { cx: X(cursor), cy: Y(result.temp[cursor]), r: 4, class: 'ms-dot' }, s);
      chartBox.replaceChildren(s);
      cOut.textContent = `minute ${cursor}: room ${f1(result.temp[cursor])} °C, sensor ${f1(result.sensor[cursor])} °C, heater ${Math.round(result.output[cursor] * 100)}%`;
    }

    let last = 0;
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => { const w = chartBox.clientWidth; if (w && Math.abs(w - last) > 4) { last = w; draw(); } }).observe(chartBox);
    } else {
      window.addEventListener('resize', draw);
    }
    update();
  }

  function init() {
    document.querySelectorAll('[data-mech-sim]').forEach(build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
