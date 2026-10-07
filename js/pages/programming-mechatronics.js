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

/* Programming Mechatronics: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Power budget: add up the current a system draws, size the supply and estimate battery life.
   2. PWM and servo signals: duty cycle, average voltage and pulse width.
   3. ADC: how many bits turn a voltage into a number.
   4. Two-joint arm: degrees of freedom, joint limits and reach.
   5. State machine: a pedestrian crossing that senses a button.
   Part values are typical example figures; read real ones from a datasheet. */
(() => {
  'use strict';
  const el = Labs.el;
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };

  /* ---------- 1. Power budget ---------- */
  const PARTS = [
    { id: 'mcu', n: 'Microcontroller board', mA: 60, duty: 100, rail: 5, count: 1 },
    { id: 'sens', n: 'Temperature and soil sensors', mA: 10, duty: 100, rail: 5, count: 1 },
    { id: 'servo', n: 'Vent servo (worst case, under load)', mA: 500, duty: 5, rail: 5, count: 1 },
    { id: 'wifi', n: 'Wi-Fi module (while sending)', mA: 120, duty: 20, rail: 5, count: 0 },
    { id: 'motor', n: 'DC motor (at start or stall)', mA: 300, duty: 40, rail: 5, count: 0 },
    { id: 'led', n: 'Indicator LED', mA: 20, duty: 50, rail: 5, count: 0 },
    { id: 'pump', n: 'Water pump', mA: 400, duty: 10, rail: 12, count: 1 }
  ];
  const SUPPLIES = [0.5, 1, 2, 3, 5];
  function buildPower(host) {
    Labs.shell(host, 'mech-power', 'Power budget calculator', 'Choose how many of each part the system has. The tool adds up the worst-case current to size the power supply, and the average current to estimate how long a battery lasts. A servo or motor can draw many times more current when it starts than when it runs.');
    const st = { margin: 50, cap: 2000, derate: 25 };
    const parts = PARTS.map(p => Object.assign({}, p));
    const tab = Labs.table(['Part', 'Rail', 'Peak current (mA)', 'On for (% of time)', 'How many'], { num: [1, 2, 3, 4], stack: true });
    const ins = {};
    function rows() {
      tab.clear();
      parts.forEach(p => {
        const dutyIn = el('input'); dutyIn.type = 'number'; dutyIn.min = 0; dutyIn.max = 100; dutyIn.value = p.duty; dutyIn.setAttribute('aria-label', 'Percentage of time on for ' + p.n); dutyIn.className = 'mech-in';
        dutyIn.addEventListener('input', () => { const v = parseFloat(dutyIn.value); if (v >= 0 && v <= 100) { p.duty = v; calc(); } });
        const cnt = el('input'); cnt.type = 'number'; cnt.min = 0; cnt.max = 6; cnt.value = p.count; cnt.setAttribute('aria-label', 'Number of ' + p.n); cnt.className = 'mech-in';
        cnt.addEventListener('input', () => { const v = parseInt(cnt.value, 10); if (v >= 0 && v <= 6) { p.count = v; calc(); } });
        tab.add([p.n, p.rail + ' V', String(p.mA), dutyIn, cnt]);
      });
    }
    rows(); host.append(tab.wrap);
    const row = el('div', 'lab-row');
    const f1 = el('div', 'lab-field'), l1 = el('label'), o1 = el('output'), i1 = el('input'); l1.htmlFor = i1.id = 'mech-pw-margin'; l1.append(document.createTextNode('Safety margin on the supply: '), o1); i1.type = 'range'; i1.min = 0; i1.max = 100; i1.step = 5; i1.value = st.margin; f1.append(l1, i1);
    const f2 = el('div', 'lab-field'), l2 = el('label', null, 'Battery capacity (mAh)'), i2 = el('input'); l2.htmlFor = i2.id = 'mech-pw-cap'; i2.type = 'number'; i2.min = 100; i2.max = 20000; i2.step = 100; i2.value = st.cap; f2.append(l2, i2);
    const f3 = el('div', 'lab-field'), l3 = el('label'), o3 = el('output'), i3 = el('input'); l3.htmlFor = i3.id = 'mech-pw-derate'; l3.append(document.createTextNode('Capacity lost to age and cold: '), o3); i3.type = 'range'; i3.min = 0; i3.max = 50; i3.step = 5; i3.value = st.derate; f3.append(l3, i3);
    row.append(f1, f2, f3); host.append(row);
    const stats = el('div', 'lab-stats'); const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(stats, out);
    host.append(el('p', 'lab-note', 'The 5 V parts share one supply; the pump has its own 12 V supply so its large current cannot make the controller reset (a brownout). Battery life uses the average current, and the supply and wiring are sized from the peak. The percentages of time on are assumptions for the activity.'));
    function calc() {
      o1.textContent = st.margin + '%'; o3.textContent = st.derate + '%';
      const by = rail => parts.filter(p => p.rail === rail && p.count > 0);
      const peak = rail => by(rail).reduce((a, p) => a + p.mA * p.count, 0), avg = rail => by(rail).reduce((a, p) => a + p.mA * p.count * p.duty / 100, 0);
      const p5 = peak(5), a5 = avg(5), p12 = peak(12), need = p5 * (1 + st.margin / 100) / 1000, pick = SUPPLIES.find(s => s >= need), life = a5 > 0 ? st.cap * (1 - st.derate / 100) / a5 : Infinity;
      stats.replaceChildren();
      const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); stats.append(s); };
      stat('5 V rail: peak current', Math.round(p5) + ' mA'); stat('5 V rail: average current', a5.toFixed(0) + ' mA'); stat('Supply needed (peak + margin)', (need * 1000).toFixed(0) + ' mA'); stat('12 V rail: peak power', (12 * p12 / 1000).toFixed(1) + ' W');
      out.className = 'lab-readout'; out.replaceChildren();
      const terms = by(5).map(p => (p.count > 1 ? p.count + ' × ' : '') + p.mA).join(' + ') || '0';
      out.append(el('p', null, 'Peak 5 V current = ' + terms + ' = ' + p5 + ' mA. With a ' + st.margin + '% margin that is ' + (need * 1000).toFixed(0) + ' mA, so choose ' + (pick ? 'a ' + pick + ' A supply.' : 'a supply of more than 5 A, or split the load across two supplies.')));
      out.append(el('p', null, isFinite(life) ? 'Average 5 V current is ' + a5.toFixed(0) + ' mA. Battery life ≈ ' + st.cap + ' × (1 − ' + st.derate / 100 + ') ÷ ' + a5.toFixed(0) + ' = ' + life.toFixed(1) + ' hours (about ' + (life / 24).toFixed(1) + ' days).' : 'Nothing is drawing current on the 5 V rail.'));
      if (p12) out.append(el('p', null, 'The pump on its own 12 V supply needs ' + p12 + ' mA, which is P = V × I = 12 × ' + (p12 / 1000).toFixed(2) + ' = ' + (12 * p12 / 1000).toFixed(1) + ' W.'));
    }
    i1.addEventListener('input', () => { st.margin = +i1.value; calc(); }); i3.addEventListener('input', () => { st.derate = +i3.value; calc(); }); i2.addEventListener('input', () => { const v = parseFloat(i2.value); if (v >= 100) { st.cap = v; calc(); } });
    calc();
  }

  /* ---------- 2. PWM and servo signals ---------- */
  function buildPwm(host) {
    Labs.shell(host, 'mech-pwm', 'PWM explorer', 'A microcontroller pin is either on or off. By switching it on and off very quickly, the fraction of time it is on (the duty cycle) sets the average voltage a motor or LED sees. A hobby servo reads the width of a pulse instead.');
    const st = { mode: 'motor', duty: 25, hz: 1000, angle: 90 };
    const tabs = el('div', 'lab-seg'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Device');
    const tb = {}; [['motor', 'Motor or LED'], ['servo', 'Servo']].forEach(k => { const b = el('button', null, k[1]); b.type = 'button'; b.addEventListener('click', () => { st.mode = k[0]; render(); }); tabs.append(b); tb[k[0]] = b; });
    const row = el('div', 'lab-row'); row.append(tabs); host.append(row);
    const controls = el('div', 'lab-row'); host.append(controls);
    const stage = el('div', 'lab-stage'); const svg = sv('svg', { viewBox: '0 0 420 150', role: 'img', 'aria-label': 'The PWM signal over several periods, with the voltage on the vertical axis.' }, stage); Labs.fit(svg);
    const stats = el('div', 'lab-stats'); const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); const bar = el('div', 'lab-meter'); const barFill = el('span'); bar.append(barFill);
    host.append(stage, bar, stats, out);
    host.append(el('p', 'lab-note', 'The motor or LED does not need to be fast: a motor\'s inertia and your eye both average the flicker. The pin is 5 V when on and 0 V when off. A servo expects a pulse every 20 ms (50 Hz); many servos treat 0.5 ms as 0 degrees and 2.5 ms as 180 degrees, and some use 1 ms to 2 ms, so check the datasheet.'));
    function field(label, id, min, max, step, key, fmt) { const f = el('div', 'lab-field'), l = el('label'), o = el('output'), i = el('input'); l.htmlFor = i.id = id; l.append(document.createTextNode(label + ': '), o); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = st[key]; i.addEventListener('input', () => { st[key] = +i.value; draw(); }); f.append(l, i); controls.append(f); return () => { o.textContent = fmt(st[key]); }; }
    let refresh = [];
    function render() {
      Object.keys(tb).forEach(k => tb[k].setAttribute('aria-pressed', String(st.mode === k)));
      controls.replaceChildren(); refresh = [];
      if (st.mode === 'motor') { refresh.push(field('Duty cycle', 'mech-pwm-duty', 0, 100, 5, 'duty', v => v + '%')); const f = el('div', 'lab-field'), l = el('label', null, 'Frequency'), s = el('select'); l.htmlFor = s.id = 'mech-pwm-hz'; [[50, '50 Hz'], [500, '500 Hz'], [1000, '1 kHz'], [20000, '20 kHz']].forEach(o => { const op = el('option', null, o[1]); op.value = o[0]; s.append(op); }); s.value = st.hz; s.addEventListener('change', () => { st.hz = +s.value; draw(); }); f.append(l, s); controls.append(f); }
      else refresh.push(field('Servo angle', 'mech-pwm-angle', 0, 180, 5, 'angle', v => v + '°'));
      draw();
    }
    function draw() {
      refresh.forEach(r => r());
      svg.replaceChildren(); stats.replaceChildren();
      const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); stats.append(s); };
      const label = (x, y, t, anchor) => { const e = sv('text', { x, y, class: 'mech-txt', 'text-anchor': anchor || 'start' }, svg); e.textContent = t; };
      const X0 = 40, X1 = 410, YH = 30, YL = 110;
      svg.append(sv('line', { x1: X0, y1: YL, x2: X1, y2: YL, class: 'mech-axis' }));
      label(8, YH + 4, '5 V'); label(8, YL + 4, '0 V');
      let periods, duty, periodMs;
      if (st.mode === 'motor') { periods = 4; duty = st.duty / 100; periodMs = 1000 / st.hz; } else { periods = 2; periodMs = 20; duty = (0.5 + st.angle / 180 * 2) / 20; }
      let d = 'M' + X0 + ',' + YL; const W = (X1 - X0) / periods;
      for (let p = 0; p < periods; p++) { const a = X0 + p * W, hi = a + W * duty; d += ' L' + a + ',' + (duty > 0 ? YH : YL) + ' L' + hi + ',' + (duty > 0 ? YH : YL) + ' L' + hi + ',' + YL + ' L' + (a + W) + ',' + YL; }
      sv('path', { d, class: 'mech-wave', fill: 'none' }, svg);
      svg.append(sv('line', { x1: X0, y1: YL + 12, x2: X0 + W, y2: YL + 12, class: 'mech-dim' }));
      label(X0 + W / 2, YL + 28, 'one period = ' + (periodMs >= 1 ? periodMs.toFixed(periodMs % 1 ? 1 : 0) + ' ms' : (periodMs * 1000).toFixed(0) + ' µs'), 'middle');
      if (st.mode === 'motor') {
        const avgV = 5 * duty; barFill.style.width = st.duty + '%'; barFill.className = '';
        stat('Duty cycle', st.duty + '%'); stat('Average voltage', avgV.toFixed(2) + ' V'); stat('Motor speed (roughly)', st.duty === 0 ? 'stopped' : Math.round(st.duty) + '% of full'); stat('Pulse on for', (periodMs * duty).toFixed(periodMs * duty < 1 ? 2 : 1) + ' ms');
        out.className = 'lab-readout'; out.textContent = 'Average voltage = duty cycle × supply voltage = ' + duty.toFixed(2) + ' × 5 V = ' + avgV.toFixed(2) + ' V. ' + (st.hz <= 50 ? 'At 50 Hz a motor may visibly stutter and an LED will flicker. Increase the frequency.' : st.hz >= 20000 ? 'At 20 kHz the switching is above the range of hearing, so the motor does not whine.' : 'At this frequency the motor and your eye average the pulses into a steady speed or brightness.');
      } else {
        const us = 500 + st.angle / 180 * 2000; barFill.style.width = (st.angle / 180 * 100) + '%'; barFill.className = '';
        stat('Angle', st.angle + '°'); stat('Pulse width', us.toFixed(0) + ' µs'); stat('Duty cycle', (us / 20000 * 100).toFixed(1) + '%'); stat('Pulses per second', '50');
        out.className = 'lab-readout'; out.textContent = 'Pulse width = 500 + angle × 2000 ÷ 180 = 500 + ' + st.angle + ' × 2000 ÷ 180 = ' + us.toFixed(0) + ' µs, repeated every 20 ms. The duty cycle is ' + us.toFixed(0) + ' ÷ 20000 = ' + (us / 200).toFixed(1) + '%, which is small, because the information is in the width of the pulse and not in the average voltage.';
      }
    }
    render();
  }

  /* ---------- 3. ADC ---------- */
  function buildAdc(host) {
    Labs.shell(host, 'mech-adc', 'Analog-to-digital converter explorer', 'A sensor gives a voltage that varies smoothly. An ADC measures it and gives back a whole number. More bits give more steps, so smaller changes can be seen.');
    const st = { v: 1.7, bits: 10, vref: 5 };
    const row = el('div', 'lab-row');
    const f1 = el('div', 'lab-field'), l1 = el('label'), o1 = el('output'), i1 = el('input'); l1.htmlFor = i1.id = 'mech-adc-v'; l1.append(document.createTextNode('Sensor voltage: '), o1); i1.type = 'range'; i1.min = 0; i1.max = 5; i1.step = 0.01; i1.value = st.v; f1.append(l1, i1);
    const f2 = el('div', 'lab-field'), l2 = el('label', null, 'ADC resolution'), s2 = el('select'); l2.htmlFor = s2.id = 'mech-adc-bits'; [[3, '3 bits (for the picture)'], [8, '8 bits'], [10, '10 bits (typical)'], [12, '12 bits'], [16, '16 bits']].forEach(o => { const op = el('option', null, o[1]); op.value = o[0]; s2.append(op); }); s2.value = st.bits; f2.append(l2, s2);
    row.append(f1, f2); host.append(row);
    const stage = el('div', 'lab-stage'); const svg = sv('svg', { viewBox: '0 0 420 200', role: 'img', 'aria-label': 'The voltage is shown as a smooth line and the ADC output as a staircase of steps. The more bits, the finer the stairs.' }, stage); Labs.fit(svg);
    const stats = el('div', 'lab-stats'); const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(stage, stats, out);
    host.append(el('p', 'lab-note', 'Count = round(voltage ÷ reference voltage × (2^bits − 1)). The "3 bits" choice exists only to make the steps big enough to see; real boards use 8 to 16 bits. A reading is a count until you convert it back to a voltage or a temperature.'));
    function draw() {
      o1.textContent = st.v.toFixed(2) + ' V';
      const n = Math.pow(2, st.bits), max = n - 1, count = Math.round(st.v / st.vref * max), step = st.vref / n * 1000, back = count / max * st.vref;
      svg.replaceChildren();
      const X0 = 44, X1 = 410, Y0 = 14, Y1 = 170; const X = v => X0 + v / st.vref * (X1 - X0), Y = c => Y1 - c / max * (Y1 - Y0);
      sv('line', { x1: X0, y1: Y1, x2: X1, y2: Y1, class: 'mech-axis' }, svg); sv('line', { x1: X0, y1: Y0, x2: X0, y2: Y1, class: 'mech-axis' }, svg);
      [0, 2.5, 5].forEach(v => { const t = sv('text', { x: X(v), y: Y1 + 16, 'text-anchor': 'middle', class: 'mech-txt' }, svg); t.textContent = v + ' V'; });
      [0, max].forEach(c => { const t = sv('text', { x: X0 - 6, y: Y(c) + 4, 'text-anchor': 'end', class: 'mech-txt' }, svg); t.textContent = c; });
      const draws = Math.min(n, 64); let d = 'M' + X0 + ',' + Y(0);
      for (let k = 0; k < 200; k++) { const v = k / 199 * st.vref; const c = Math.round(v / st.vref * max); d += ' L' + X(v) + ',' + Y(c); }
      sv('path', { d, class: 'mech-step', fill: 'none' }, svg);
      sv('line', { x1: X0, y1: Y(0), x2: X1, y2: Y(max), class: 'mech-ideal' }, svg);
      sv('line', { x1: X(st.v), y1: Y1, x2: X(st.v), y2: Y(count), class: 'mech-mark' }, svg); sv('circle', { cx: X(st.v), cy: Y(count), r: 5, class: 'mech-dot' }, svg);
      const t = sv('text', { x: X1, y: Y(max) + 16, 'text-anchor': 'end', class: 'mech-txt' }, svg); t.textContent = 'dashed: ideal smooth reading';
      stats.replaceChildren(); const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); stats.append(s); };
      stat('Number of levels', n.toLocaleString('en-AU')); stat('Count the program reads', String(count)); stat('Step size', step >= 1 ? step.toFixed(1) + ' mV' : step.toFixed(2) + ' mV'); stat('Voltage the count stands for', back.toFixed(3) + ' V');
      out.className = 'lab-readout'; out.textContent = 'At ' + st.bits + ' bits the ADC can tell apart ' + n.toLocaleString('en-AU') + ' levels over 0 to 5 V, each ' + (step >= 1 ? step.toFixed(1) : step.toFixed(2)) + ' mV wide. Your ' + st.v.toFixed(2) + ' V becomes the count ' + count + ', which stands for ' + back.toFixed(3) + ' V: the difference is rounding (quantisation error), never more than half a step.';
    }
    i1.addEventListener('input', () => { st.v = +i1.value; draw(); }); s2.addEventListener('change', () => { st.bits = +s2.value; draw(); });
    draw();
  }

  /* ---------- 4. Two-joint arm ---------- */
  function buildArm(host) {
    Labs.shell(host, 'mech-arm', 'Two-joint arm: degrees of freedom and limits', 'This arm has two joints, so two degrees of freedom. Move each joint, or press on the picture to give the end effector a target and let the program work out the angles. Switch the joint limits on to see what software constraints do to the reach.');
    const L1 = 100, L2 = 80, SH = [10, 170], EL = [0, 135];
    const st = { sh: 60, el: 70, lim: true };
    const row = el('div', 'lab-row');
    const mk = (label, id, key, min, max) => { const f = el('div', 'lab-field'), l = el('label'), o = el('output'), i = el('input'); l.htmlFor = i.id = id; l.append(document.createTextNode(label + ': '), o); i.type = 'range'; i.min = min; i.max = max; i.value = st[key]; i.addEventListener('input', () => { st[key] = +i.value; draw(); }); f.append(l, i); row.append(f); return { o, i, key }; };
    const sSh = mk('Shoulder angle', 'mech-arm-sh', 'sh', 0, 180), sEl = mk('Elbow angle', 'mech-arm-el', 'el', 0, 180);
    const lim = el('label', 'lab-check'), cb = el('input'); cb.type = 'checkbox'; cb.checked = true; lim.append(cb, document.createTextNode('Enforce joint limits (shoulder 10° to 170°, elbow 0° to 135°)')); row.append(lim);
    host.append(row);
    const stage = el('div', 'lab-stage mech-arm-stage'); const svg = sv('svg', { viewBox: '-50 -200 380 240', role: 'img', 'aria-label': 'A two-joint arm on a base line, with dots showing every point the end effector can reach.' }, stage); Labs.fit(svg);
    const stats = el('div', 'lab-stats'); const out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(stage, stats, out);
    host.append(el('p', 'lab-note', 'The angles are measured from the flat base line to the first link, and then from the first link to the second. Giving a target uses inverse kinematics: the program turns a position into joint angles. There can be two solutions (elbow up or elbow down); this tool uses the one that keeps the elbow above the first link. A real arm needs more joints, an actuator and a sensor for each, and more code.'));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const pos = (sh, el_) => { const a = sh * Math.PI / 180, b = (sh - el_) * Math.PI / 180; const x1 = L1 * Math.cos(a), y1 = L1 * Math.sin(a); return { x1, y1, x2: x1 + L2 * Math.cos(b), y2: y1 + L2 * Math.sin(b) }; };
    function draw(msg) {
      let sh = st.sh, e = st.el, clamped = false;
      if (st.lim) { const s2 = clamp(sh, SH[0], SH[1]), e2 = clamp(e, EL[0], EL[1]); clamped = s2 !== sh || e2 !== e; sh = s2; e = e2; }
      sSh.o.textContent = st.sh + '°'; sEl.o.textContent = st.el + '°';
      svg.replaceChildren();
      const Y = y => -y;                                       // y up
      // reachable region: sample the angle ranges
      const pts = []; for (let a = (st.lim ? SH[0] : 0); a <= (st.lim ? SH[1] : 180); a += 6) for (let b = (st.lim ? EL[0] : 0); b <= (st.lim ? EL[1] : 180); b += 6) { const p = pos(a, b); pts.push(p); }
      pts.forEach(p => sv('circle', { cx: p.x2, cy: Y(p.y2), r: 2.6, class: 'mech-reach' }, svg));
      sv('line', { x1: -40, y1: 0, x2: 320, y2: 0, class: 'mech-floor' }, svg);
      const p = pos(sh, e);
      sv('line', { x1: 0, y1: 0, x2: p.x1, y2: Y(p.y1), class: 'mech-link' }, svg); sv('line', { x1: p.x1, y1: Y(p.y1), x2: p.x2, y2: Y(p.y2), class: 'mech-link' }, svg);
      sv('circle', { cx: 0, cy: 0, r: 7, class: 'mech-joint' }, svg); sv('circle', { cx: p.x1, cy: Y(p.y1), r: 7, class: 'mech-joint' }, svg); sv('circle', { cx: p.x2, cy: Y(p.y2), r: 6, class: 'mech-end' }, svg);
      const t = sv('text', { x: 0, y: 20, 'text-anchor': 'middle', class: 'mech-txt' }, svg); t.textContent = 'base';
      const t2 = sv('text', { x: p.x2 + 10, y: Y(p.y2) + 4, class: 'mech-txt' }, svg); t2.textContent = 'end effector';
      stats.replaceChildren(); const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); stats.append(s); };
      stat('Degrees of freedom', '2'); stat('Shoulder (used)', sh.toFixed(0) + '°'); stat('Elbow (used)', e.toFixed(0) + '°'); stat('End effector at', p.x2.toFixed(0) + ', ' + p.y2.toFixed(0));
      out.className = 'lab-readout ' + (clamped ? 'is-warn' : ''); out.textContent = msg || (clamped ? 'The software has clamped a joint to its limit: the slider asks for ' + st.sh + '° and ' + st.el + '°, but the arm uses ' + sh.toFixed(0) + '° and ' + e.toFixed(0) + '°. A constraint in code protects the mechanism, as safe_angles() does in the notes.' : 'The dots show every place the end effector can reach with the joints in range. A bigger range or a longer link would make the region bigger; a limit shrinks it.');
    }
    svg.addEventListener('click', ev => {
      const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      const x = vb.x + (ev.clientX - r.left) / r.width * vb.width, y = -(vb.y + (ev.clientY - r.top) / r.height * vb.height);
      const d = Math.hypot(x, y);
      if (y < 0) return draw('The target is below the base line, where this arm cannot go.');
      if (d > L1 + L2 || d < Math.abs(L1 - L2)) return draw('Out of reach: the target is ' + d.toFixed(0) + ' units from the base, but this arm reaches only from ' + Math.abs(L1 - L2) + ' to ' + (L1 + L2) + '.');
      // Inverse kinematics: the end is at distance d, so d² = L1² + L2² + 2·L1·L2·cos(elbow)
      const elbow = Math.acos(clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
      const shoulder = Math.atan2(y, x) + Math.atan2(L2 * Math.sin(elbow), L1 + L2 * Math.cos(elbow));
      st.sh = Math.round(clamp(shoulder * 180 / Math.PI, 0, 180)); st.el = Math.round(clamp(elbow * 180 / Math.PI, 0, 180)); sSh.i.value = st.sh; sEl.i.value = st.el;
      draw();
      const sh = st.lim ? clamp(st.sh, SH[0], SH[1]) : st.sh, e = st.lim ? clamp(st.el, EL[0], EL[1]) : st.el, q = pos(sh, e), miss = Math.hypot(q.x2 - x, q.y2 - y);
      out.className = 'lab-readout ' + (miss > 4 ? 'is-warn' : 'is-good');
      out.textContent = miss > 4 ? 'Target set, but with the limits on the joints cannot reach it: the arm stops ' + miss.toFixed(0) + ' units short. The program used the closest angles it was allowed.' : 'Target reached. The program turned the position (' + x.toFixed(0) + ', ' + y.toFixed(0) + ') into a shoulder angle of ' + st.sh + '° and an elbow angle of ' + st.el + '° (inverse kinematics).';
    });
    cb.addEventListener('change', () => { st.lim = cb.checked; draw(); });
    draw();
  }

  /* ---------- 5. State machine: pedestrian crossing ---------- */
  function buildFsm(host) {
    Labs.shell(host, 'mech-fsm', 'State machine: a pedestrian crossing', 'The controller is always in one state. An event (a timer tick or a button press) can move it to another state, but only if the rule for that state allows it. Press the button and tick the clock to see the controller decide.');
    const STATES = ['GREEN', 'YELLOW', 'RED'];
    const st = { s: 'GREEN', ticks: 0, req: false, log: ['Starting in GREEN. Cars may go.'] };
    const stage = el('div', 'mech-fsm-stage');
    const nodes = {}; STATES.forEach(n => { const d = el('div', 'mech-fsm-state is-' + n.toLowerCase()); d.append(el('b', null, n), el('small', null, n === 'GREEN' ? 'cars go' : n === 'YELLOW' ? 'cars stop soon' : 'pedestrians walk')); nodes[n] = d; stage.append(d); });
    host.append(stage);
    const mem = el('div', 'lab-stats'); host.append(mem);
    const actions = el('div', 'lab-actions');
    const bTick = el('button', 'lab-btn lab-btn--primary', 'Timer tick (1 second)'), bBtn = el('button', 'lab-btn', 'Pedestrian presses the button'), bAuto = el('button', 'lab-btn', 'Run on its own'), bRst = el('button', 'lab-btn lab-btn--quiet', 'Reset');
    [bTick, bBtn, bAuto, bRst].forEach(b => { b.type = 'button'; actions.append(b); }); host.append(actions);
    const log = el('ol', 'mech-fsm-log'); log.setAttribute('aria-live', 'polite'); host.append(log);
    const tab = Labs.table(['State', 'Event', 'Condition (guard)', 'Next state', 'Action'], { stack: true });
    [['GREEN', 'Button press', 'always', 'GREEN', 'remember the request'], ['GREEN', 'Timer tick', 'request remembered AND green for 3 seconds or more', 'YELLOW', 'start the yellow timer'], ['GREEN', 'Timer tick', 'otherwise', 'GREEN', 'count the second'], ['YELLOW', 'Timer tick', 'after 1 second', 'RED', 'show WALK'], ['RED', 'Timer tick', 'after 3 seconds', 'GREEN', 'clear the request']].forEach(r => tab.add(r));
    host.append(el('p', 'lab-note', 'The table is the whole design written as data. The two "Timer tick" rows for GREEN show why a guard matters: the same event leads to different results depending on a condition and on memory (the remembered request). Pressing the button while in YELLOW or RED does nothing in this design, which is a decision a designer must make deliberately.'), tab.wrap);
    let timer = null;
    const say = t => { st.log.push(t); if (st.log.length > 6) st.log.shift(); };
    function tick() {
      st.ticks++;
      if (st.s === 'GREEN') { if (st.req && st.ticks >= 3) { st.s = 'YELLOW'; st.ticks = 0; say('Tick: a request is waiting and green has lasted 3 seconds, so GREEN → YELLOW.'); } else say('Tick: GREEN for ' + st.ticks + ' second' + (st.ticks > 1 ? 's' : '') + (st.req ? ', request waiting, but the minimum green time is not over yet.' : ', no request, so stay GREEN.')); }
      else if (st.s === 'YELLOW') { if (st.ticks >= 1) { st.s = 'RED'; st.ticks = 0; say('Tick: yellow has lasted 1 second, so YELLOW → RED. Pedestrians may walk.'); } }
      else if (st.ticks >= 3) { st.s = 'GREEN'; st.ticks = 0; st.req = false; say('Tick: red has lasted 3 seconds, so RED → GREEN. The request is cleared.'); } else say('Tick: RED for ' + st.ticks + ' second' + (st.ticks > 1 ? 's' : '') + '. Pedestrians are crossing.');
      draw();
    }
    function press() { if (st.s === 'GREEN') { st.req = true; say('Button: the controller remembers the request but stays in GREEN.'); } else say('Button: ignored. The crossing is already ' + (st.s === 'RED' ? 'open' : 'changing') + '.'); draw(); }
    function draw() {
      STATES.forEach(n => { nodes[n].classList.toggle('is-now', n === st.s); nodes[n].setAttribute('aria-current', n === st.s ? 'true' : 'false'); });
      mem.replaceChildren(); const stat = (a, b) => { const s = el('div', 'lab-stat'); s.append(el('span', null, a), el('b', null, b)); mem.append(s); };
      stat('Current state', st.s); stat('Seconds in this state', String(st.ticks)); stat('Request remembered', st.req ? 'yes' : 'no');
      log.replaceChildren(); st.log.forEach(t => log.append(el('li', null, t)));
    }
    bTick.addEventListener('click', tick); bBtn.addEventListener('click', press);
    bAuto.addEventListener('click', () => { if (timer) { clearInterval(timer); timer = null; bAuto.textContent = 'Run on its own'; return; } if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { say('Automatic running is switched off because your device asks for reduced motion. Use the tick button.'); draw(); return; } bAuto.textContent = 'Stop'; timer = setInterval(tick, 900); });
    bRst.addEventListener('click', () => { if (timer) { clearInterval(timer); timer = null; bAuto.textContent = 'Run on its own'; } st.s = 'GREEN'; st.ticks = 0; st.req = false; st.log = ['Reset to GREEN.']; draw(); });
    draw();
  }

  function init() {
    document.querySelectorAll('[data-mechlab="power"]').forEach(buildPower);
    document.querySelectorAll('[data-mechlab="pwm"]').forEach(buildPwm);
    document.querySelectorAll('[data-mechlab="adc"]').forEach(buildAdc);
    document.querySelectorAll('[data-mechlab="arm"]').forEach(buildArm);
    document.querySelectorAll('[data-mechlab="fsm"]').forEach(buildFsm);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
