/* Still diagram (NESA flowchart): a line-following robot's control loop.
   Programming Mechatronics › Developing control algorithms. */
(() => {
  const T = (s, x, y, text, w = 190) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const IO = (s, x, y, text, w = 220) => s.node(s.root, { x, y, w, h: 44, shape: 'io', text });
  const D = (s, x, y, text, w = 240, h = 80) => s.node(s.root, { x, y, w, h, shape: 'decision', text });
  const SP = (s, x, y, text, w = 170) => s.node(s.root, { x, y, w, h: 44, shape: 'subprogram', text });

  HSCAnim.define('mech-linefollow', {
    still: true,
    title: 'Flowchart: line-following robot',
    alt: 'Flowchart. BEGIN followLine. While running: INPUT left and right sensor readings. If left is dark AND right is light, call turnLeft. Otherwise, if right is dark AND left is light, call turnRight. Otherwise call driveForward. Each action returns to the running test. When running is false, END followLine.',
    layout: { size: [720, 670] },
    setup(s) {
      const X = 230, L = s.g(s.back);
      const b = T(s, X, 32, 'BEGIN followLine', 210);
      const run = D(s, X, 122, 'running?', 200, 72);
      const end = T(s, 560, 122, 'END followLine', 200);
      const inp = IO(s, X, 222, 'INPUT left, right', 210);
      const d1 = D(s, X, 322, 'left = dark AND\nright = light?', 270, 88);
      const tl = SP(s, 560, 322, 'turnLeft', 170);
      const d2 = D(s, X, 450, 'right = dark AND\nleft = light?', 270, 88);
      const tr = SP(s, 560, 450, 'turnRight', 170);
      const df = SP(s, X, 572, 'driveForward', 190);
      s.link(L, b, run);
      s.link(L, run, end, { from: 'right', to: 'left', label: 'No', labelAt: [355, 108] });
      s.link(L, run, inp, { label: 'Yes', labelAt: [X + 30, 174] });
      s.link(L, inp, d1);
      s.link(L, d1, tl, { from: 'right', to: 'left', label: 'Yes', labelAt: [404, 308] });
      s.link(L, d1, d2, { label: 'No', labelAt: [X + 28, 382] });
      s.link(L, d2, tr, { from: 'right', to: 'left', label: 'Yes', labelAt: [404, 436] });
      s.link(L, d2, df, { label: 'No', labelAt: [X + 28, 512] });
      s.link(L, tl, [X, 634], { from: 'right', via: [[690, 322], [690, 634]] });
      s.link(L, tr, [690, 450], { from: 'right' });
      s.link(L, df, s.port(run, 'left'), { from: 'bottom', via: [[X, 634], [60, 634], [60, 122]] });
    }
  });
})();
