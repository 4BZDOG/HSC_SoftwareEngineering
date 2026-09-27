/* Still diagram (NESA flowchart). Programming Fundamentals › Control structures. */
(() => {
  const T = (s, x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const P = (s, x, y, text, w = 220, h = 44) => s.node(s.root, { x, y, w, h, text });
  const IO = (s, x, y, text, w = 200) => s.node(s.root, { x, y, w, h: 44, shape: 'io', text });
  const chain = (s, L, nodes) => nodes.slice(1).forEach((n, i) => s.link(L, nodes[i], n));

  HSCAnim.define('fc-sequence', {
    still: true,
    title: 'Flowchart: sequence, the area of a rectangle',
    alt: 'Flowchart. BEGIN. INPUT length, width. area = length × width. OUTPUT area. END.',
    layout: { size: [360, 380] },
    setup(s) {
      const X = 180, L = s.g(s.back);
      chain(s, L, [T(s, X, 32, 'BEGIN'), IO(s, X, 106, 'INPUT length, width', 230), P(s, X, 186, 'area = length × width'), IO(s, X, 266, 'OUTPUT area'), T(s, X, 342, 'END')]);
    }
  });
})();
