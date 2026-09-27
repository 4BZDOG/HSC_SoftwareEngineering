/* Still diagram (NESA flowchart). Programming Fundamentals › Control structures. */
(() => {
  const T = (s, x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const P = (s, x, y, text, w = 220, h = 44) => s.node(s.root, { x, y, w, h, text });
  const IO = (s, x, y, text, w = 200) => s.node(s.root, { x, y, w, h: 44, shape: 'io', text });
  const D = (s, x, y, text, w = 180) => s.node(s.root, { x, y, w, h: 72, shape: 'decision', text });
  const chain = (s, L, nodes) => nodes.slice(1).forEach((n, i) => s.link(L, nodes[i], n));

  HSCAnim.define('fc-sum-list', {
    still: true,
    title: 'Flowchart: pre-test repetition, sum a list',
    alt: 'Flowchart. BEGIN. total = 0, i = 0. Is i < LEN(list)? True: total = total + list[i], i = i + 1, then test again. False: OUTPUT total. END.',
    layout: { size: [580, 470] },
    setup(s) {
      const X = 190, L = s.g(s.back);
      const b = T(s, X, 32, 'BEGIN'), a = P(s, X, 106, 'total = 0\ni = 0', 170, 54), d = D(s, X, 206, 'i < LEN(list)?', 200);
      const body = P(s, 445, 206, 'total = total + list[i]\ni = i + 1', 230, 56);
      const o = IO(s, X, 322, 'OUTPUT total'), e = T(s, X, 424, 'END');
      chain(s, L, [b, a, d]);
      s.link(L, d, body, { from: 'right', to: 'left', label: 'True', labelAt: [X + 118, 180] });
      s.link(L, body, [X, 150], { from: 'top', via: [[445, 150]] });
      s.link(L, d, o, { label: 'False', labelAt: [X + 44, 266] });
      s.link(L, o, e);
      s.text(s.root, 'loop back and test again', { x: 445, y: 140, cls: 'pa-name', size: 12.5 });
    }
  });
})();
