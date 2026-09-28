/* Smart Greenhouse Controller: the example major project.
   Runs a simulated greenhouse in real time. Each class maps to a part of the
   course; the page explains which. Everything the page shows is written with
   textContent, never innerHTML, so no reading or user input can inject markup. */
(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  // Repeatable pseudo-random numbers, so every run of the tests behaves the same
  function makeRandom(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function fmtClock(simMinutes) {
    const day = Math.floor(simMinutes / 1440) + 1;
    const m = Math.floor(simMinutes % 1440);
    return { day, text: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` };
  }
  function fmtDuration(minutes) {
    if (!isFinite(minutes) || minutes < 0) return '—';
    const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
    return h ? `${h} h ${m} min` : `${m} min`;
  }

  /* ── Mechatronics: sensors (inheritance and polymorphism) ── */
  class Sensor {
    constructor(name, unit, min, max, noise, rand) {
      this.name = name; this.unit = unit;
      this.min = min; this.max = max;       // physical range the sensor can report
      this.noise = noise; this.rand = rand || Math.random;
      this.fault = null;                    // null, or a stuck value for fault injection
      this.value = null; this.valid = false;
    }
    /** Each subclass says which part of the environment it measures. */
    measure(env) { throw new Error('measure() must be implemented by a subclass'); }
    read(env) {
      // A working sensor can only report values inside its range; a fault can report anything
      const raw = this.fault !== null ? this.fault
        : clamp(this.measure(env) + (this.rand() - 0.5) * 2 * this.noise, this.min, this.max);
      this.value = raw;
      this.valid = Sensor.inRange(raw, this.min, this.max);
      return this.value;
    }
    /** Range check: a reading outside what the hardware can produce means a fault. */
    static inRange(v, min, max) { return typeof v === 'number' && isFinite(v) && v >= min && v <= max; }
  }
  class TemperatureSensor extends Sensor {
    constructor(rand) { super('Temperature', '°C', -10, 60, 0.15, rand); }
    measure(env) { return env.temp; }
  }
  class MoistureSensor extends Sensor {
    constructor(rand) { super('Soil moisture', '%', 0, 100, 0.15, rand); }   // capacitive probe, averaged
    measure(env) { return env.moisture; }
  }
  class LightSensor extends Sensor {
    constructor(rand) { super('Light', 'lux', 0, 2000, 8, rand); }
    measure(env) { return env.light; }
  }
  class HumiditySensor extends Sensor {
    constructor(rand) { super('Humidity', '%', 0, 100, 0.6, rand); }
    measure(env) { return env.humidity; }
  }

  /* ── Mechatronics: actuators ─────────────────────────────── */
  class Actuator {
    constructor(name, watts) { this.name = name; this.watts = watts; this.on = false; this.minutesOn = 0; }
    set(on) { const changed = this.on !== on; this.on = on; return changed; }
    tick(dt) { if (this.on) this.minutesOn += dt; }
    energyWh() { return this.watts * this.minutesOn / 60; }
  }

  /* ── The simulated world the sensors measure ─────────────── */
  class Environment {
    constructor(rand) {
      this.rand = rand || Math.random;
      this.minutes = 6 * 60;               // start at 06:00 on day 1
      this.temp = 17; this.moisture = 52; this.light = 0; this.humidity = 60;
      this.tank = 120;                     // litres of irrigation water
      this.weather = 'clear';              // clear | cloudy | heatwave
    }
    hour() { return (this.minutes / 60) % 24; }
    sun() {
      const h = this.hour();
      const s = h > 6 && h < 20 ? Math.sin(Math.PI * (h - 6) / 14) : 0;
      return this.weather === 'cloudy' ? s * 0.35 : s;
    }
    /** Advance the physics by dt minutes given the actuator states. */
    step(dt, act) {
      const sun = this.sun();
      const outside = 14 + 10 * sun + (this.weather === 'heatwave' ? 9 : 0);
      const target = act.fan.on ? outside + 1 : outside + 6 * sun + 2;     // glass traps heat; the fan vents it
      this.temp += (target - this.temp) * 0.035 * dt + (this.rand() - 0.5) * 0.05;
      this.light = sun * 950 + (act.lamp.on ? 420 : 0);
      // Evaporation rises with temperature: the relationship the regression model learns
      const evap = (0.012 + 0.0042 * Math.max(0, this.temp - 8) + 0.01 * sun) * (0.9 + this.rand() * 0.2);
      this.moisture -= evap * dt;
      if (act.pump.on && this.tank > 0) {
        this.moisture += 1.1 * dt;
        this.tank = Math.max(0, this.tank - 0.6 * dt);
      }
      this.moisture = clamp(this.moisture, 0, 100);
      const hTarget = 50 + 0.35 * (this.moisture - 45) - 0.9 * (this.temp - 20) - (act.fan.on ? 12 : 0);
      this.humidity = clamp(this.humidity + (hTarget - this.humidity) * 0.05 * dt, 5, 98);
      this.minutes += dt;
      return evap;
    }
  }

  /* ── Control algorithm: closed loop with hysteresis ──────── */
  const DEFAULT_SETPOINTS = { moistureLow: 35, moistureHigh: 55, tempMax: 28 };
  class Controller {
    constructor(setpoints) {
      this.setpoints = { ...DEFAULT_SETPOINTS, ...setpoints };
      this.mode = 'auto';                  // auto | manual
    }
    /** Decide the next state of each actuator from the latest readings.
        Returns the decisions and any alerts; it never touches hardware directly. */
    decide(r, state, tank, hour) {
      const sp = this.setpoints, alerts = [];
      const out = { pump: state.pump, fan: state.fan, lamp: state.lamp };
      if (this.mode === 'manual') return { out, alerts };
      // Soil moisture: water below the low mark, stop at the high mark (hysteresis stops rapid on/off)
      if (!r.moistureValid) {
        out.pump = false;                  // fail safe: never water on a reading we can't trust
        alerts.push('Moisture sensor fault: watering paused');
      } else if (tank <= 0) {
        out.pump = false;
        alerts.push('Water tank empty: refill needed');
      } else if (r.moisture < sp.moistureLow) out.pump = true;
      else if (r.moisture >= sp.moistureHigh) out.pump = false;
      // Temperature: vent above the maximum, close again 3 °C below it
      if (r.tempValid) {
        if (r.temp > sp.tempMax) out.fan = true;
        else if (r.temp < sp.tempMax - 3) out.fan = false;
      }
      // Grow lamp: top up light during growing hours only
      const growing = hour >= 6 && hour < 20;
      if (!growing) out.lamp = false;
      else if (r.lightValid && r.light < 250) out.lamp = true;
      else if (r.lightValid && r.light > 700) out.lamp = false;
      return { out, alerts };
    }
    /** Validate new setpoints before accepting them. Returns an error message or null. */
    static validateSetpoints(input) {
      const parsed = {};
      const limits = { moistureLow: [10, 80], moistureHigh: [15, 90], tempMax: [18, 40] };
      for (const key of Object.keys(limits)) {
        const raw = String(input[key] ?? '').trim();
        if (!/^\d{1,2}(\.\d)?$/.test(raw)) return `${key}: enter a number such as 35 or 35.5`;
        const v = Number(raw), [lo, hi] = limits[key];
        if (v < lo || v > hi) return `${key}: must be between ${lo} and ${hi}`;
        parsed[key] = v;
      }
      if (parsed.moistureHigh - parsed.moistureLow < 5) return 'The high moisture mark must be at least 5 above the low mark';
      return { ok: parsed };
    }
  }

  /* ── Data: a fixed-size log with standard algorithms ─────── */
  class DataLogger {
    constructor(capacity) { this.capacity = capacity; this.records = []; }
    add(record) { this.records.push(record); if (this.records.length > this.capacity) this.records.shift(); }
    /** Binary search: records are stored in time order, so halve the range each step. */
    findByTime(minutes) {
      let lo = 0, hi = this.records.length - 1, steps = 0;
      while (lo <= hi) {
        steps++;
        const mid = (lo + hi) >> 1, t = this.records[mid].time;
        if (t === minutes) return { record: this.records[mid], steps };
        if (t < minutes) lo = mid + 1; else hi = mid - 1;
      }
      return { record: null, steps };
    }
    /** Merge sort (stable, O(n log n)) on any numeric field. */
    static mergeSort(items, key, descending) {
      if (items.length < 2) return items.slice();
      const mid = items.length >> 1;
      const a = DataLogger.mergeSort(items.slice(0, mid), key, descending);
      const b = DataLogger.mergeSort(items.slice(mid), key, descending);
      const out = [];
      let i = 0, j = 0;
      while (i < a.length && j < b.length) {
        const takeA = descending ? a[i][key] >= b[j][key] : a[i][key] <= b[j][key];
        out.push(takeA ? a[i++] : b[j++]);
      }
      return out.concat(a.slice(i), b.slice(j));
    }
    toCSV() {
      const cols = ['time', 'temp', 'moisture', 'light', 'humidity', 'pump', 'fan', 'lamp'];
      const rows = this.records.map(r => cols.map(c => {
        if (c === 'time') { const f = fmtClock(r.time); return `Day ${f.day} ${f.text}`; }
        return typeof r[c] === 'number' ? r[c].toFixed(1) : r[c];
      }).join(','));
      return [cols.join(',')].concat(rows).join('\n');
    }
  }

  /* ── Machine learning: linear regression, trained live ──── */
  class LinearRegression {
    constructor(maxSamples) { this.maxSamples = maxSamples || 400; this.xs = []; this.ys = []; this.a = 0; this.b = 0; this.r2 = 0; this.mse = 0; }
    add(x, y) {
      this.xs.push(x); this.ys.push(y);
      if (this.xs.length > this.maxSamples) { this.xs.shift(); this.ys.shift(); }
    }
    /** Least squares fit of y = a·x + b, then R² and mean squared error. */
    fit() {
      const n = this.xs.length;
      if (n < 2) return false;
      let sx = 0, sy = 0;
      for (let i = 0; i < n; i++) { sx += this.xs[i]; sy += this.ys[i]; }
      const mx = sx / n, my = sy / n;
      let sxy = 0, sxx = 0;
      for (let i = 0; i < n; i++) { sxy += (this.xs[i] - mx) * (this.ys[i] - my); sxx += (this.xs[i] - mx) ** 2; }
      if (sxx === 0) return false;
      this.a = sxy / sxx; this.b = my - this.a * mx;
      let ssRes = 0, ssTot = 0;
      for (let i = 0; i < n; i++) {
        const e = this.ys[i] - this.predict(this.xs[i]);
        ssRes += e * e; ssTot += (this.ys[i] - my) ** 2;
      }
      this.mse = ssRes / n;
      this.r2 = ssTot ? 1 - ssRes / ssTot : 1;
      return true;
    }
    predict(x) { return this.a * x + this.b; }
  }

  /* ── Security: salted hashes, lockout and roles ──────────── */
  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  class AuthService {
    constructor(now) {
      this.now = now || (() => Date.now());
      this.users = new Map();              // username -> { salt, hash, role }
      this.failures = 0; this.lockedUntil = 0;
      this.maxFailures = 3; this.lockMs = 20000;
    }
    /** Store only a salt and a hash, never the password itself. */
    async addUser(username, password, role, salt) {
      salt = salt || crypto.getRandomValues(new Uint32Array(2)).join('-');
      this.users.set(username, { salt, hash: await sha256Hex(salt + password), role });
    }
    async login(username, password) {
      const wait = this.lockedUntil - this.now();
      if (wait > 0) return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(wait / 1000)} s.` };
      const user = this.users.get(String(username).trim().toLowerCase());
      // Hash even for an unknown user so both failures take the same time
      const hash = await sha256Hex((user ? user.salt : 'x') + password);
      if (user && hash === user.hash) { this.failures = 0; return { ok: true, role: user.role }; }
      this.failures++;
      if (this.failures >= this.maxFailures) {
        this.failures = 0; this.lockedUntil = this.now() + this.lockMs;
        return { ok: false, message: 'Too many attempts. Sign-in locked for 20 s.' };
      }
      // Same message whether the username or the password was wrong
      return { ok: false, message: 'Incorrect username or password.' };
    }
  }

  /* ── The whole system, independent of the page ───────────── */
  class Greenhouse {
    constructor(seed) {
      const rand = makeRandom(seed || 7);
      this.env = new Environment(rand);
      this.sensors = { temp: new TemperatureSensor(rand), moisture: new MoistureSensor(rand),
                       light: new LightSensor(rand), humidity: new HumiditySensor(rand) };
      this.act = { pump: new Actuator('Pump', 35), fan: new Actuator('Fan', 60), lamp: new Actuator('Grow lamp', 120) };
      this.controller = new Controller();
      this.log = new DataLogger(7 * 144);  // 7 days at one record every 10 minutes
      this.model = new LinearRegression(400);
      this.alerts = new Set();
      this.events = [];                    // newest first
      this.onEvent = null;
      this.lastMoisture = null; this.evapWindow = [];
    }
    event(tag, text) {
      const e = { time: this.env.minutes, tag, text };
      this.events.unshift(e);
      if (this.events.length > 60) this.events.pop();
      if (this.onEvent) this.onEvent(e);
    }
    readings() {
      const s = this.sensors, e = this.env;
      return { temp: s.temp.read(e), tempValid: s.temp.valid, moisture: s.moisture.read(e), moistureValid: s.moisture.valid,
               light: s.light.read(e), lightValid: s.light.valid, humidity: s.humidity.read(e), humidityValid: s.humidity.valid };
    }
    /** One simulated minute: sense, decide, act, record, learn. */
    tick() {
      const r = this.readings();
      const state = { pump: this.act.pump.on, fan: this.act.fan.on, lamp: this.act.lamp.on };
      const { out, alerts } = this.controller.decide(r, state, this.env.tank, this.env.hour());
      for (const k of Object.keys(out)) {
        if (this.act[k].set(out[k])) this.event('CTRL', `${this.act[k].name} ${out[k] ? 'on' : 'off'}`);
      }
      const now = new Set(alerts);
      for (const a of now) if (!this.alerts.has(a)) this.event('ALERT', a);
      this.alerts = now;
      const evap = this.env.step(1, this.act);
      Object.values(this.act).forEach(a => a.tick(1));
      // Learn evaporation vs temperature from the sensors, only while the pump is off
      // and the soil still holds water to lose
      if (!this.act.pump.on && r.moistureValid && r.tempValid && r.moisture > 5 && this.lastMoisture !== null) {
        this.evapWindow.push({ t: r.temp, d: this.lastMoisture - r.moisture });
        if (this.evapWindow.length === 30) {        // average 30 minutes to smooth sensor noise
          const t = this.evapWindow.reduce((s, p) => s + p.t, 0) / 30;
          const d = this.evapWindow.reduce((s, p) => s + p.d, 0) / 30;
          if (d > -0.2) this.model.add(t, d);
          this.evapWindow = [];
          this.model.fit();
        }
      } else this.evapWindow = [];
      this.lastMoisture = r.moistureValid ? r.moisture : null;
      if (this.env.minutes % 10 === 0) {
        this.log.add({ time: this.env.minutes, temp: r.temp, moisture: r.moisture, light: r.light, humidity: r.humidity,
                       pump: this.act.pump.on ? 1 : 0, fan: this.act.fan.on ? 1 : 0, lamp: this.act.lamp.on ? 1 : 0 });
      }
      this.last = r; this.lastEvap = evap;
      return r;
    }
    /** Minutes until soil reaches the low mark, predicted by the model at the current temperature. */
    forecastWatering() {
      const r = this.last;
      if (!r || !r.moistureValid || this.model.xs.length < 6) return NaN;
      const rate = this.model.predict(r.temp);
      if (rate <= 0) return NaN;
      return Math.max(0, (r.moisture - this.controller.setpoints.moistureLow) / rate);
    }
  }

  /* ── Unit tests, run in the page ─────────────────────────── */
  async function runTests() {
    const results = [];
    const test = async (id, desc, dataType, expected, fn) => {
      let actual, pass;
      try { actual = await fn(); pass = String(actual) === String(expected); }
      catch (err) { actual = 'Error: ' + err.message; pass = false; }
      results.push({ id, desc, dataType, expected: String(expected), actual: String(actual), pass });
    };
    const reading = (moisture, temp) => ({ moisture, moistureValid: Sensor.inRange(moisture, 0, 100), temp, tempValid: true, light: 500, lightValid: true });
    const idle = { pump: false, fan: false, lamp: false };

    await test('T1', 'Sensor accepts a reading at the top of its range', 'Boundary', true, () => Sensor.inRange(100, 0, 100));
    await test('T2', 'Sensor rejects a reading above its range', 'Erroneous', false, () => Sensor.inRange(150, 0, 100));
    await test('T3', 'Pump starts when soil is below the low mark', 'Normal', true,
      () => new Controller().decide(reading(30, 22), idle, 50, 12).out.pump);
    await test('T4', 'Pump keeps running inside the band (hysteresis)', 'Normal', true,
      () => new Controller().decide(reading(45, 22), { ...idle, pump: true }, 50, 12).out.pump);
    await test('T5', 'Pump stops exactly at the high mark', 'Boundary', false,
      () => new Controller().decide(reading(55, 22), { ...idle, pump: true }, 50, 12).out.pump);
    await test('T6', 'Pump stays off when the moisture sensor is faulty', 'Erroneous', false,
      () => new Controller().decide(reading(-5, 22), idle, 50, 12).out.pump);
    await test('T7', 'Pump stays off when the tank is empty', 'Boundary', false,
      () => new Controller().decide(reading(20, 22), idle, 0, 12).out.pump);
    await test('T8', 'Regression recovers y = 2x + 1 exactly', 'Normal', '2.00, 1.00', () => {
      const m = new LinearRegression(); [1, 2, 3, 4].forEach(x => m.add(x, 2 * x + 1)); m.fit();
      return `${m.a.toFixed(2)}, ${m.b.toFixed(2)}`;
    });
    await test('T9', 'Binary search finds a logged time', 'Normal', 'found in 3 steps', () => {
      const log = new DataLogger(100); for (let t = 0; t < 70; t += 10) log.add({ time: t });
      const res = log.findByTime(40); return res.record ? `found in ${res.steps} steps` : 'not found';
    });
    await test('T10', 'Binary search reports a missing time', 'Erroneous', 'not found', () => {
      const log = new DataLogger(100); for (let t = 0; t < 70; t += 10) log.add({ time: t });
      return log.findByTime(45).record ? 'found' : 'not found';
    });
    await test('T11', 'Merge sort orders readings, hottest first', 'Normal', '31,27,22,18', () =>
      DataLogger.mergeSort([{ temp: 22 }, { temp: 31 }, { temp: 18 }, { temp: 27 }], 'temp', true).map(r => r.temp).join(','));
    await test('T12', 'Setpoints reject script text', 'Erroneous', 'rejected', () =>
      Controller.validateSetpoints({ moistureLow: '<script>', moistureHigh: '55', tempMax: '28' }).ok ? 'accepted' : 'rejected');
    await test('T13', 'Setpoints reject a low mark above the high mark', 'Erroneous', 'rejected', () =>
      Controller.validateSetpoints({ moistureLow: '60', moistureHigh: '40', tempMax: '28' }).ok ? 'accepted' : 'rejected');
    if (window.crypto && crypto.subtle) {
      let clock = 0;
      const auth = new AuthService(() => clock);
      await auth.addUser('tech', 'Gr0w-Safe!', 'technician', 'test-salt');
      await test('T14', 'Correct password signs in as technician', 'Normal', 'technician',
        async () => (await auth.login('tech', 'Gr0w-Safe!')).role);
      await test('T15', 'Wrong password is rejected', 'Erroneous', false,
        async () => (await auth.login('tech', 'grow-safe')).ok);
      await test('T16', 'Third wrong attempt locks sign-in', 'Boundary', true, async () => {
        await auth.login('tech', 'a'); const r = await auth.login('tech', 'b');
        return /locked/.test(r.message);
      });
      await test('T17', 'Locked out even with the right password', 'Boundary', false,
        async () => (await auth.login('tech', 'Gr0w-Safe!')).ok);
    }
    return results;
  }

  window.Greenhouse = { Greenhouse, Sensor, Controller, DataLogger, LinearRegression, AuthService, runTests, fmtClock };

  /* ════════════════════════════════════════════════════════
     Page: the dashboard
     ════════════════════════════════════════════════════════ */
  const root = document.getElementById('gh-app');
  if (!root) return;
  const $ = sel => root.querySelector(sel);
  const $$ = sel => [...root.querySelectorAll(sel)];

  const gh = new Greenhouse(Date.now() % 100000);
  const auth = new AuthService();
  let role = 'guest', user = null;
  let running = true, speed = 1, visible = true, onScreen = true;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Demo account. A real system would never show credentials on the page.
  const authReady = (window.crypto && crypto.subtle) ? auth.addUser('tech', 'Gr0w-Safe!', 'technician') : Promise.resolve();

  // Warm start: run the first simulated day quickly so the chart and model have data
  for (let i = 0; i < 28 * 60; i++) gh.tick();   // to 10:00 on day 2
  gh.events.length = 0;
  gh.event('SYS', 'Controller started in automatic mode');

  /* Event log */
  const logList = $('#gh-log');
  function renderEvent(e) {
    const li = document.createElement('li');
    li.className = 'gh-log-' + e.tag.toLowerCase();
    const t = document.createElement('span'); t.className = 'gh-log-time';
    const f = fmtClock(e.time); t.textContent = `D${f.day} ${f.text}`;
    const tag = document.createElement('span'); tag.className = 'gh-log-tag'; tag.textContent = e.tag;
    const msg = document.createElement('span'); msg.textContent = e.text;
    li.append(t, tag, msg);
    logList.prepend(li);
    while (logList.children.length > 40) logList.lastChild.remove();
  }
  gh.onEvent = renderEvent;
  gh.events.slice().reverse().forEach(renderEvent);

  /* Readouts */
  const tiles = {
    temp: { el: $('[data-sensor="temp"]'), digits: 1 },
    moisture: { el: $('[data-sensor="moisture"]'), digits: 0 },
    light: { el: $('[data-sensor="light"]'), digits: 0 },
    humidity: { el: $('[data-sensor="humidity"]'), digits: 0 },
  };
  function renderReadouts() {
    const r = gh.last, f = fmtClock(gh.env.minutes), sp = gh.controller.setpoints;
    $('#gh-clock').textContent = f.text;
    $('#gh-day').textContent = `Day ${f.day}`;
    $('#gh-phase').textContent = gh.env.sun() > 0.05 ? (gh.env.weather === 'cloudy' ? 'Overcast' : 'Daylight') : 'Night';
    for (const [k, t] of Object.entries(tiles)) {
      const s = gh.sensors[k];
      t.el.querySelector('.gh-val').textContent = s.valid ? s.value.toFixed(t.digits) : 'FAULT';
      t.el.classList.toggle('is-fault', !s.valid);
      const bar = t.el.querySelector('.gh-bar i');
      if (bar) bar.style.width = (s.valid ? clamp((s.value - s.min) / (s.max - s.min) * 100, 0, 100) : 0) + '%';
    }
    $('[data-sensor="moisture"] .gh-note').textContent = `Target ${sp.moistureLow}–${sp.moistureHigh}%`;
    $('[data-sensor="temp"] .gh-note').textContent = `Vent above ${sp.tempMax} °C`;
    for (const [k, a] of Object.entries(gh.act)) {
      const el = $(`[data-act="${k}"]`);
      el.classList.toggle('is-on', a.on);
      el.querySelector('.gh-act-state').textContent = a.on ? 'ON' : 'off';
      el.querySelector('.gh-act-energy').textContent = `${(a.energyWh() / 1000).toFixed(2)} kWh`;
      const btn = el.querySelector('button');
      btn.disabled = gh.controller.mode !== 'manual' || role !== 'technician';
      btn.setAttribute('aria-pressed', String(a.on));
    }
    $('#gh-tank').textContent = `${gh.env.tank.toFixed(0)} L`;
    $('#gh-tank-bar').style.width = clamp(gh.env.tank / 120 * 100, 0, 100) + '%';
    $('#gh-mode').textContent = gh.controller.mode === 'auto' ? 'Automatic' : 'Manual';
    const alerts = [...gh.alerts];
    const alertEl = $('#gh-alerts');
    alertEl.textContent = alerts.length ? alerts.join(' · ') : 'All systems normal';
    alertEl.classList.toggle('is-alert', alerts.length > 0);
    // Model
    const m = gh.model;
    $('#gh-ml-n').textContent = m.xs.length;
    $('#gh-ml-eq').textContent = m.xs.length > 1 ? `rate = ${m.a.toFixed(4)} × temp ${m.b >= 0 ? '+' : '−'} ${Math.abs(m.b).toFixed(4)}` : 'Collecting data…';
    $('#gh-ml-r2').textContent = m.xs.length > 1 ? m.r2.toFixed(2) : '—';
    $('#gh-ml-mse').textContent = m.xs.length > 1 ? m.mse.toExponential(1) : '—';
    $('#gh-ml-next').textContent = gh.act.pump.on ? 'Watering now' : fmtDuration(gh.forecastWatering());
  }

  /* Charts on canvas, coloured from the page's theme */
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  function setupCanvas(cv) {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }
  const trendCv = $('#gh-trend'), mlCv = $('#gh-ml-plot');
  function drawTrend() {
    const { ctx, w, h } = setupCanvas(trendCv);
    const recs = gh.log.records.slice(-144);           // last 24 hours
    const pad = { l: 34, r: 34, t: 10, b: 22 };
    const W = w - pad.l - pad.r, H = h - pad.t - pad.b;
    const ink = css('--pc-muted') || '#777', rule = css('--pc-rule') || '#ddd';
    const cTemp = css('--pc-terracotta') || '#c4553b', cMoist = css('--pc-teal') || '#2a6f73';
    ctx.font = '11px system-ui, sans-serif'; ctx.lineWidth = 1;
    // Target moisture band
    const sp = gh.controller.setpoints, yM = v => pad.t + H - v / 100 * H, yT = v => pad.t + H - (v - 5) / 40 * H;
    ctx.fillStyle = cMoist; ctx.globalAlpha = 0.1;
    ctx.fillRect(pad.l, yM(sp.moistureHigh), W, yM(sp.moistureLow) - yM(sp.moistureHigh));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = rule; ctx.fillStyle = ink;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + H * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + W, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(`${100 - i * 25}%`, pad.l - 4, y + 4);
      ctx.textAlign = 'left'; ctx.fillText(`${45 - i * 10}°`, pad.l + W + 4, y + 4);
    }
    if (recs.length < 2) return;
    const t0 = recs[0].time, span = Math.max(recs[recs.length - 1].time - t0, 10);
    const x = t => pad.l + (t - t0) / span * W;
    // Pump running shown as a strip along the bottom
    ctx.fillStyle = cMoist; ctx.globalAlpha = 0.35;
    recs.forEach(r => { if (r.pump) ctx.fillRect(x(r.time), pad.t + H - 4, W / 144 + 1, 4); });
    ctx.globalAlpha = 1;
    const line = (key, color, y) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      recs.forEach((r, i) => { const v = y(clamp(r[key], key === 'temp' ? 5 : 0, key === 'temp' ? 45 : 100)); i ? ctx.lineTo(x(r.time), v) : ctx.moveTo(x(r.time), v); });
      ctx.stroke();
    };
    line('moisture', cMoist, yM); line('temp', cTemp, yT);
    ctx.fillStyle = ink; ctx.textAlign = 'center';
    for (let t = Math.ceil(t0 / 360) * 360; t <= t0 + span; t += 360) ctx.fillText(fmtClock(t).text, x(t), h - 6);
  }
  function drawModel() {
    const { ctx, w, h } = setupCanvas(mlCv);
    const m = gh.model, pad = { l: 40, r: 24, t: 10, b: 24 };
    const W = w - pad.l - pad.r, H = h - pad.t - pad.b;
    const ink = css('--pc-muted') || '#777', rule = css('--pc-rule') || '#ddd', c = css('--pc-plum') || '#5b4bdb';
    ctx.font = '11px system-ui, sans-serif'; ctx.strokeStyle = rule; ctx.fillStyle = ink;
    const xMin = 10, xMax = 40, yMax = 0.2;
    const X = v => pad.l + (v - xMin) / (xMax - xMin) * W, Y = v => pad.t + H - clamp(v, 0, yMax) / yMax * H;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + H); ctx.lineTo(pad.l + W, pad.t + H); ctx.stroke();
    ctx.textAlign = 'center';
    for (let v = 10; v <= 40; v += 10) ctx.fillText(`${v} °C`, X(v), h - 6);
    ctx.textAlign = 'right';
    for (let v = 0; v <= yMax + 1e-9; v += 0.1) ctx.fillText(v.toFixed(1), pad.l - 5, Y(v) + 4);
    ctx.fillStyle = c; ctx.globalAlpha = 0.55;
    m.xs.forEach((xv, i) => { ctx.beginPath(); ctx.arc(X(xv), Y(m.ys[i]), 2.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    if (m.xs.length > 1) {
      ctx.strokeStyle = css('--pc-terracotta') || '#c4553b'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(X(xMin), Y(m.predict(xMin))); ctx.lineTo(X(xMax), Y(m.predict(xMax))); ctx.stroke();
    }
  }

  /* Main loop: 10 ticks a second, each tick one simulated minute times the speed */
  function frame() {
    if (running && visible) {
      for (let i = 0; i < speed; i++) gh.tick();
      renderReadouts();
      if (onScreen) { drawTrend(); drawModel(); }
    }
  }
  renderReadouts(); drawTrend(); drawModel();
  setInterval(frame, 100);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }).observe(root);
  window.addEventListener('resize', () => { drawTrend(); drawModel(); });
  new MutationObserver(() => { drawTrend(); drawModel(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* Simulation controls */
  const playBtn = $('#gh-play');
  playBtn.addEventListener('click', () => {
    running = !running;
    playBtn.textContent = running ? 'Pause' : 'Resume';
    playBtn.setAttribute('aria-pressed', String(!running));
  });
  if (reduceMotion) playBtn.click();         // start paused for people who prefer less motion
  $$('[data-speed]').forEach(b => b.addEventListener('click', () => {
    speed = Number(b.dataset.speed);
    $$('[data-speed]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  }));
  $$('[data-weather]').forEach(b => b.addEventListener('click', () => {
    gh.env.weather = b.dataset.weather;
    $$('[data-weather]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    gh.event('SIM', `Weather set to ${b.textContent.trim().toLowerCase()}`);
  }));
  const faultBtn = $('#gh-fault');
  faultBtn.addEventListener('click', () => {
    const s = gh.sensors.moisture, on = s.fault === null;
    s.fault = on ? -12 : null;
    faultBtn.setAttribute('aria-pressed', String(on));
    faultBtn.textContent = on ? 'Repair moisture sensor' : 'Break moisture sensor';
    gh.event('SIM', on ? 'Moisture sensor wire cut (reads −12%)' : 'Moisture sensor repaired');
  });

  /* Sign-in and protected actions */
  const form = $('#gh-login'), msg = $('#gh-login-msg');
  function applyRole() {
    root.dataset.role = role;
    $('#gh-who').textContent = role === 'technician' ? `Signed in: ${user} (technician)` : 'Guest: view only';
    $$('.gh-protected').forEach(el => { el.disabled = role !== 'technician'; });
    form.hidden = role === 'technician';
    $('#gh-logout').hidden = role !== 'technician';
    renderReadouts();
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    await authReady;
    if (!(window.crypto && crypto.subtle)) { msg.textContent = 'Sign-in needs a secure (https) page.'; return; }
    const u = form.username.value, p = form.password.value;
    const res = await auth.login(u, p);
    form.password.value = '';
    if (res.ok) {
      role = res.role; user = u.trim().toLowerCase();
      msg.textContent = '';
      gh.event('AUTH', `${user} signed in as ${role}`);
    } else {
      msg.textContent = res.message;
      gh.event('AUTH', 'Failed sign-in attempt');
    }
    applyRole();
  });
  $('#gh-logout').addEventListener('click', () => {
    gh.event('AUTH', `${user} signed out`);
    role = 'guest'; user = null;
    if (gh.controller.mode === 'manual') { gh.controller.mode = 'auto'; gh.event('CTRL', 'Returned to automatic mode'); }
    applyRole();
  });
  const spForm = $('#gh-setpoints'), spMsg = $('#gh-sp-msg');
  spForm.addEventListener('submit', e => {
    e.preventDefault();
    if (role !== 'technician') return;       // checked here too, not just by disabling the button
    const res = Controller.validateSetpoints({ moistureLow: spForm.moistureLow.value, moistureHigh: spForm.moistureHigh.value, tempMax: spForm.tempMax.value });
    if (!res.ok) { spMsg.textContent = res; spMsg.className = 'gh-form-msg is-error'; gh.event('AUTH', 'Rejected invalid setpoints'); return; }
    gh.controller.setpoints = res.ok;
    spMsg.textContent = 'Saved.'; spMsg.className = 'gh-form-msg is-ok';
    gh.event('CTRL', `${user} set moisture ${res.ok.moistureLow}–${res.ok.moistureHigh}%, vent above ${res.ok.tempMax} °C`);
    renderReadouts();
  });
  $('#gh-mode-btn').addEventListener('click', () => {
    if (role !== 'technician') return;
    gh.controller.mode = gh.controller.mode === 'auto' ? 'manual' : 'auto';
    gh.event('CTRL', `${user} switched to ${gh.controller.mode} mode`);
    renderReadouts();
  });
  $$('[data-act] button').forEach(btn => btn.addEventListener('click', () => {
    if (role !== 'technician' || gh.controller.mode !== 'manual') return;
    const k = btn.closest('[data-act]').dataset.act, a = gh.act[k];
    a.set(!a.on);
    gh.event('CTRL', `${user} turned ${a.name.toLowerCase()} ${a.on ? 'on' : 'off'} (manual)`);
    renderReadouts();
  }));
  $('#gh-refill').addEventListener('click', () => {
    if (role !== 'technician') return;
    gh.env.tank = 120;
    gh.event('CTRL', `${user} refilled the water tank`);
  });
  applyRole();

  /* Data tools: search, sort, export */
  const out = $('#gh-query-out');
  $('#gh-find').addEventListener('submit', e => {
    e.preventDefault();
    const raw = e.target.when.value.trim();
    const m = /^(\d{1,2}):([0-5]\d)$/.exec(raw);
    const day = Number(e.target.day.value);
    if (!m || Number(m[1]) > 23 || !(day >= 1)) { out.textContent = 'Enter a time as HH:MM, for example 14:30.'; return; }
    const mins = Math.round(((day - 1) * 1440 + Number(m[1]) * 60 + Number(m[2])) / 10) * 10;
    const res = gh.log.findByTime(mins);
    if (!res.record) { out.textContent = `No record for Day ${day} ${raw} (searched in ${res.steps} steps). The log keeps the last 7 days.`; return; }
    const r = res.record, f = fmtClock(r.time);
    out.textContent = `Day ${f.day} ${f.text}: ${r.temp.toFixed(1)} °C, soil ${r.moisture.toFixed(0)}%, ${r.light.toFixed(0)} lux, pump ${r.pump ? 'on' : 'off'}. Found by binary search in ${res.steps} steps out of ${gh.log.records.length} records.`;
  });
  $('#gh-hottest').addEventListener('click', () => {
    const top = DataLogger.mergeSort(gh.log.records, 'temp', true).slice(0, 5);
    out.textContent = 'Hottest readings (merge sort): ' + top.map(r => { const f = fmtClock(r.time); return `${r.temp.toFixed(1)} °C at Day ${f.day} ${f.text}`; }).join('; ');
  });
  $('#gh-export').addEventListener('click', () => {
    const blob = new Blob([gh.log.toCSV()], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'greenhouse-log.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    gh.event('SYS', `Exported ${gh.log.records.length} records to CSV`);
  });

  /* Test runner */
  const testBtn = document.getElementById('gh-run-tests');
  if (testBtn) testBtn.addEventListener('click', async () => {
    const body = document.getElementById('gh-test-body'), sum = document.getElementById('gh-test-summary');
    testBtn.disabled = true; sum.textContent = 'Running…';
    const results = await runTests();
    body.textContent = '';
    for (const r of results) {
      const tr = document.createElement('tr');
      [r.id, r.desc, r.dataType, r.expected, r.actual].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
      const td = document.createElement('td'); td.textContent = r.pass ? 'Pass' : 'Fail';
      td.className = r.pass ? 'gh-pass' : 'gh-fail'; tr.appendChild(td);
      body.appendChild(tr);
    }
    const passed = results.filter(r => r.pass).length;
    sum.textContent = `${passed} of ${results.length} tests passed`;
    testBtn.disabled = false; testBtn.textContent = 'Run the tests again';
  });
})();
