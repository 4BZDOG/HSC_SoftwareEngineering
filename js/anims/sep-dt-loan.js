/* Still diagram (NESA decision tree): can this loan be issued?
   Software Engineering Project › Using modelling tools. */
HSCAnim.define('sep-dt-loan', {
  still: true,
  title: 'Decision tree: can this loan be issued?',
  alt: 'Decision tree. Is the book available? No: refuse, the book is on loan. Yes: does the member have fewer than 5 active loans? No: refuse, the loan limit is reached. Yes: issue the loan, due in 14 days.',
  layout: { size: [620, 330] },
  setup(s) {
    const L = s.g(s.back);
    const q1 = s.node(s.root, { x: 220, y: 36, w: 210, h: 46, text: 'Is the book available?', tone: 'mustard-t' });
    const q2 = s.node(s.root, { x: 340, y: 160, w: 260, h: 46, text: 'Fewer than 5 active loans?', tone: 'mustard-t' });
    const no1 = s.node(s.root, { x: 100, y: 160, w: 170, h: 46, shape: 'card', tone: 'terra', text: 'Refuse: on loan', cls: 'pa-strong' });
    const no2 = s.node(s.root, { x: 210, y: 288, w: 190, h: 46, shape: 'card', tone: 'terra', text: 'Refuse: limit reached', cls: 'pa-strong' });
    const ok = s.node(s.root, { x: 480, y: 288, w: 210, h: 46, shape: 'card', tone: 'sage-t', text: 'Issue loan, due in 14 days', cls: 'pa-strong' });
    s.link(L, q1, no1, { label: 'No', mid: 98 });
    s.link(L, q1, q2, { label: 'Yes', mid: 98 });
    s.link(L, q2, no2, { label: 'No', mid: 224 });
    s.link(L, q2, ok, { label: 'Yes', mid: 224 });
  }
});
