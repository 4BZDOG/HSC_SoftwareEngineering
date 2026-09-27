/* Still diagram (NESA flowchart). Programming Fundamentals › Control structures. */
(() => {
  const T = (s, x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const IO = (s, x, y, text, w = 200) => s.node(s.root, { x, y, w, h: 44, shape: 'io', text });
  const D = (s, x, y, text, w = 180) => s.node(s.root, { x, y, w, h: 72, shape: 'decision', text });
  const chain = (s, L, nodes) => nodes.slice(1).forEach((n, i) => s.link(L, nodes[i], n));

  HSCAnim.define('fc-age', {
    still: true,
    title: "Flowchart: binary selection, check a user's age",
    alt: "Flowchart. BEGIN. INPUT age. Is age ≥ 18? Yes: OUTPUT 'Welcome'. No: OUTPUT 'Too young'. END.",
    layout: { size: [580, 450] },
    setup(s) {
      const X = 170, L = s.g(s.back);
      const b = T(s, X, 32, 'BEGIN'), i = IO(s, X, 104, 'INPUT age', 170), d = D(s, X, 196, 'age ≥ 18?');
      const y = IO(s, X, 300, "OUTPUT 'Welcome'"), n = IO(s, 430, 196, "OUTPUT 'Too young'", 220), e = T(s, X, 404, 'END');
      chain(s, L, [b, i, d]);
      s.link(L, d, y, { label: 'Yes', labelAt: [X + 38, 252] });
      s.link(L, d, n, { from: 'right', to: 'left', label: 'No', labelAt: [X + 122, 180] });
      s.link(L, y, e);
      s.link(L, n, s.port(e, 'right'), { from: 'bottom', via: [[430, 404]] });
    }
  });
})();
