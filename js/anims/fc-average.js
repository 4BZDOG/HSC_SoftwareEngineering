/* Still diagram (NESA flowchart). Programming Fundamentals › Control structures. */
(() => {
  const T = (s, x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const P = (s, x, y, text, w = 220, h = 44) => s.node(s.root, { x, y, w, h, text });
  const IO = (s, x, y, text, w = 200) => s.node(s.root, { x, y, w, h: 44, shape: 'io', text });
  const D = (s, x, y, text, w = 180) => s.node(s.root, { x, y, w, h: 72, shape: 'decision', text });
  const chain = (s, L, nodes) => nodes.slice(1).forEach((n, i) => s.link(L, nodes[i], n));

  HSCAnim.define('fc-average', {
    still: true,
    title: 'Flowchart: storing data, average of numbers until −1',
    alt: "Flowchart. BEGIN. total = 0, count = 0. INPUT number. Is number ≠ −1? True: total = total + number, count = count + 1, INPUT number, then test again. False: is count > 0? Yes: OUTPUT total ÷ count. No: OUTPUT 'No data'. END.",
    layout: { size: [630, 680] },
    setup(s) {
      const X = 190, L = s.g(s.back);
      const b = T(s, X, 32, 'BEGIN'), a = P(s, X, 106, 'total = 0\ncount = 0', 170, 54), i = IO(s, X, 186, 'INPUT number', 180);
      const d = D(s, X, 280, 'number ≠ −1?', 200);
      const body = P(s, 470, 280, 'total = total + number\ncount = count + 1', 240, 56);
      const i2 = IO(s, 470, 370, 'INPUT number', 180);
      const c = D(s, X, 420, 'count > 0?');
      const o = IO(s, X, 530, 'OUTPUT total ÷ count', 230), o2 = IO(s, 470, 530, "OUTPUT 'No data'", 200), e = T(s, X, 636, 'END');
      chain(s, L, [b, a, i, d]);
      s.link(L, d, body, { from: 'right', to: 'left', label: 'True', labelAt: [X + 132, 264] });
      s.link(L, body, i2);
      s.link(L, i2, [X, 234], { from: 'right', via: [[606, 370], [606, 234]] });
      s.link(L, d, c, { label: 'False', labelAt: [X + 44, 342] });
      s.link(L, c, o, { label: 'Yes', labelAt: [X + 40, 476] });
      s.link(L, c, o2, { from: 'right', to: 'top', label: 'No', labelAt: [X + 112, 406] });
      s.link(L, o, e);
      s.link(L, o2, s.port(e, 'right'), { from: 'bottom', via: [[470, 636]] });
    }
  });
})();
