/* Still diagram (NESA flowchart): a systematic debugging process.
   Software Engineering Project › Testing and evaluating. */
HSCAnim.define('fc-debugging', {
  still: true,
  title: 'Flowchart: a systematic debugging process',
  alt: 'Flowchart. BEGIN debug. Reproduce the bug with a small test case. If it does not reproduce every time, add debugging output statements and reproduce again. Then isolate the module that fails, form a hypothesis, and test it with breakpoints and watches. If the hypothesis is wrong, form a new one. If right, fix the code; if not all tests pass, form a new hypothesis. When all tests pass, END debug.',
  layout: { size: [620, 900] },
  setup(s) {
    const X = 290, L = s.g(s.back);
    const n = {
      begin: s.node(s.root, { x: X, y: 32, w: 170, h: 42, shape: 'terminator', text: 'BEGIN debug' }),
      rep: s.node(s.root, { x: X, y: 110, w: 260, h: 50, text: 'Reproduce the bug with\na small test case' }),
      every: s.node(s.root, { x: X, y: 205, w: 210, h: 76, shape: 'decision', text: 'Reproduces\nevery time?' }),
      out: s.node(s.root, { x: 78, y: 205, w: 140, h: 56, text: 'Add debugging\noutput statements' }),
      iso: s.node(s.root, { x: X, y: 305, w: 260, h: 44, text: 'Isolate the failing module' }),
      hyp: s.node(s.root, { x: X, y: 385, w: 260, h: 44, text: 'Form a hypothesis' }),
      test: s.node(s.root, { x: X, y: 465, w: 260, h: 50, text: 'Test it with breakpoints\nand watches' }),
      right: s.node(s.root, { x: X, y: 565, w: 210, h: 76, shape: 'decision', text: 'Hypothesis\ncorrect?' }),
      fix: s.node(s.root, { x: X, y: 665, w: 200, h: 44, text: 'Fix the code' }),
      pass: s.node(s.root, { x: X, y: 760, w: 210, h: 76, shape: 'decision', text: 'All tests\npass?' }),
      end: s.node(s.root, { x: X, y: 862, w: 170, h: 42, shape: 'terminator', text: 'END debug' })
    };
    s.link(L, n.begin, n.rep);
    s.link(L, n.rep, n.every);
    s.link(L, n.every, n.out, { from: 'left', to: 'right', label: 'No', labelAt: [166, 190] });
    s.link(L, n.out, n.rep, { from: 'top', to: 'left', via: [[78, 110]] });
    s.link(L, n.every, n.iso, { label: 'Yes', labelAt: [X + 40, 262] });
    s.link(L, n.iso, n.hyp);
    s.link(L, n.hyp, n.test);
    s.link(L, n.test, n.right);
    s.link(L, n.right, n.fix, { label: 'Yes', labelAt: [X + 40, 622] });
    s.link(L, n.right, n.hyp, { from: 'right', to: 'right', via: [[500, 565], [500, 385]], label: 'No', labelAt: [X + 132, 552] });
    s.link(L, n.fix, n.pass);
    s.link(L, n.pass, n.hyp, { from: 'right', to: 'right', via: [[560, 760], [560, 380]], toOff: -5, label: 'No', labelAt: [X + 132, 747] });
    s.link(L, n.pass, n.end, { label: 'Yes', labelAt: [X + 40, 817] });
  }
});
