/* Still diagram (NESA flowchart): thermostat with a hysteresis band.
   Programming Mechatronics › Open and closed control systems. */
(() => {
  const T = (s, x, y, text, w = 190) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const P = (s, x, y, text, w = 220, h = 44) => s.node(s.root, { x, y, w, h, text });
  const IO = (s, x, y, text, w = 200) => s.node(s.root, { x, y, w, h: 44, shape: 'io', text });
  const D = (s, x, y, text, w = 240) => s.node(s.root, { x, y, w, h: 76, shape: 'decision', text });

  HSCAnim.define('mech-hysteresis', {
    still: true,
    title: 'Flowchart: thermostat with a hysteresis band',
    alt: 'Flowchart. BEGIN thermostat. lowLimit = 19, highLimit = 21, heaterOn = FALSE. While running: INPUT temp. If temp is less than lowLimit, heaterOn = TRUE. Otherwise, if temp is greater than highLimit, heaterOn = FALSE. Otherwise heaterOn is left as it was. OUTPUT heaterOn to the heater, then test running again. When running is false, END thermostat.',
    layout: { size: [700, 690] },
    setup(s) {
      const X = 220, L = s.g(s.back);
      const b = T(s, X, 32, 'BEGIN thermostat', 210);
      const init = P(s, X, 106, 'lowLimit = 19\nhighLimit = 21\nheaterOn = FALSE', 230, 66);
      const run = D(s, X, 200, 'running?', 200);
      const end = T(s, 540, 200, 'END thermostat', 200);
      const inp = IO(s, X, 296, 'INPUT temp', 180);
      const d1 = D(s, X, 392, 'temp < lowLimit?', 250);
      const on = P(s, 540, 392, 'heaterOn = TRUE', 200);
      const d2 = D(s, X, 498, 'temp > highLimit?', 250);
      const off = P(s, 540, 498, 'heaterOn = FALSE', 200);
      const out = IO(s, X, 604, 'OUTPUT heaterOn\nto heater', 210);
      s.link(L, b, init); s.link(L, init, run);
      s.link(L, run, end, { from: 'right', to: 'left', label: 'No', labelAt: [345, 186] });
      s.link(L, run, inp, { label: 'Yes', labelAt: [X + 30, 254] });
      s.link(L, inp, d1);
      s.link(L, d1, on, { from: 'right', to: 'left', label: 'Yes', labelAt: [372, 378] });
      s.link(L, d1, d2, { label: 'No', labelAt: [X + 28, 446] });
      s.link(L, d2, off, { from: 'right', to: 'left', label: 'Yes', labelAt: [372, 484] });
      s.link(L, d2, out, { label: 'No', labelAt: [X + 28, 552] });
      s.link(L, on, s.port(out, 'right'), { from: 'right', via: [[665, 392], [665, 604]] });
      s.link(L, off, s.port(out, 'right'), { from: 'bottom', via: [[540, 604]] });
      s.link(L, out, s.port(run, 'left'), { from: 'left', via: [[60, 604], [60, 200]] });
    }
  });
})();
