/* Still diagram (process): the software development steps, as a cycle.
   Programming Fundamentals › Software development steps. */
HSCAnim.define('pf-dev-steps', {
  still: true,
  title: 'Process diagram: the software development steps',
  alt: 'Eight steps in order: requirements definition, determining specifications, design, development, integration, testing and debugging, installation, maintenance. New needs found during maintenance lead back to requirements definition.',
  layouts: { wide: { size: [780, 330] }, tall: { size: [400, 760] } },
  setup(s) {
    const steps = ['Requirements\ndefinition', 'Determining\nspecifications', 'Design', 'Development', 'Integration', 'Testing and\ndebugging', 'Installation', 'Maintenance'];
    const L = s.g(s.back), c = s.compact;
    const pos = i => c ? [230, 44 + i * 88] : (i < 4 ? [100 + i * 190, 70] : [100 + (7 - i) * 190, 240]);
    const n = steps.map((t, i) => s.node(s.root, { x: pos(i)[0], y: pos(i)[1], w: 160, h: 56, shape: 'card', tone: i < 3 ? 'teal-t' : i < 6 ? 'sage-t' : 'mustard-t', text: t, size: 14 }));
    n.forEach((node, i) => {
      if (i === 7) return;
      if (c) s.link(L, node, n[i + 1]);
      else if (i === 3) s.link(L, node, n[4]);
      else if (i < 3) s.link(L, node, n[i + 1], { from: 'right', to: 'left' });
      else s.link(L, node, n[i + 1], { from: 'left', to: 'right' });
    });
    if (c) s.link(L, n[7], n[0], { from: 'left', to: 'left', via: [[40, pos(7)[1]], [40, pos(0)[1]]], dashed: true, label: 'new\nneeds', labelAt: [40, 380] });
    else s.link(L, n[7], n[0], { dashed: true, label: 'new needs' });
    s.numberDot && n.forEach((node, i) => s.numberDot(s.root, node.box.x - 80, node.box.y - 28, i + 1));
  }
});
