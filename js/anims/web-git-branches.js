/* Still diagram (concept): commits on main and a feature branch, then a merge.
   Programming for the Web › Version control. */
HSCAnim.define('web-git-branches', {
  still: true,
  title: 'Diagram: a feature branch merged into main',
  alt: 'Commit diagram. On the main branch: commit C1 "Add home page and styles", then C4 "Add about page", then merge commit M "Merge feature/search". On the feature/search branch, which starts from C1: C2 "Add search box", then C3 "Style the search box". The merge commit M has two parents, C4 and C3, so it joins the two lines of work. Time runs left to right.',
  layout: { size: [680, 360], minWidth: 560 },
  setup(s) {
    const L = s.g(s.back);
    const Y1 = 100, Y2 = 220;
    s.text(s.root, 'main', { x: 12, y: Y1, anchor: 'start', valign: 'middle', cls: 'pa-name pa-strong', size: 14 });
    s.text(s.root, 'feature/\nsearch', { x: 12, y: Y2, anchor: 'start', valign: 'middle', cls: 'pa-name pa-strong', size: 14, lh: 1.2 });
    s.el('path', { d: `M110 ${Y1} H660`, class: 'pa-lifeline' }, s.back);
    s.el('path', { d: `M110 ${Y2} H660`, class: 'pa-lifeline' }, s.back);
    const c = (id, x, y, tone) => s.node(s.root, { x, y, w: 46, h: 46, shape: 'circle', text: id, tone, size: 14 });
    const c1 = c('C1', 160, Y1, 'teal');
    const c4 = c('C4', 320, Y1, 'teal');
    const m = c('M', 540, Y1, 'sage');
    const c2 = c('C2', 300, Y2, 'plum');
    const c3 = c('C3', 430, Y2, 'plum');
    s.link(L, c1, c4, { from: 'right', to: 'left' });
    s.link(L, c4, m, { from: 'right', to: 'left' });
    s.link(L, c1, c2, { from: 'bottom', to: 'left' });
    s.link(L, c2, c3, { from: 'right', to: 'left' });
    s.link(L, c3, m, { from: 'right', to: 'bottom' });
    s.chip(s.root, 'Add home page\nand styles', 160, 42);
    s.chip(s.root, 'Add about page', 320, 48);
    s.chip(s.root, 'Merge\nfeature/search', 540, 42);
    s.chip(s.root, 'Add search box', 300, 278);
    s.chip(s.root, 'Style the\nsearch box', 430, 278);
    s.text(s.root, 'Each arrow runs from a commit to the next commit built on it.\nM has two parents, so it joins the two lines of work.', { x: 340, y: 326, lh: 1.3, cls: 'pa-name', size: 12.5 });
  }
});
