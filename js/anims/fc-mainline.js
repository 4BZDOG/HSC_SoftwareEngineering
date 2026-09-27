/* Still diagram (NESA flowchart). Programming Fundamentals › Control structures. */
(() => {
  const T = (s, x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 42, shape: 'terminator', text });
  const SUB = (s, x, y, text, w = 200) => s.node(s.root, { x, y, w, h: 44, shape: 'subprogram', text });
  const chain = (s, L, nodes) => nodes.slice(1).forEach((n, i) => s.link(L, nodes[i], n));

  HSCAnim.define('fc-mainline', {
    still: true,
    title: 'Flowchart: a mainline that calls a subprogram',
    alt: 'Flowchart. BEGIN. Call the subprogram read(name). Call the subprogram read(address). END.',
    layout: { size: [360, 300] },
    setup(s) {
      const X = 180, L = s.g(s.back);
      chain(s, L, [T(s, X, 32, 'BEGIN'), SUB(s, X, 106, 'read(name)'), SUB(s, X, 186, 'read(address)'), T(s, X, 262, 'END')]);
    }
  });
})();
