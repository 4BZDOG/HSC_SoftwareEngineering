/* Still diagram (cycle): the three stages of MLOps from the Course Specifications.
   Software Automation › How machine learning supports automation. */
HSCAnim.define('auto-mlops', {
  still: true,
  title: 'Cycle diagram: the three stages of MLOps',
  alt: 'Three linked stages in a loop. Design: defining the business problem to be solved, refactoring the business problem into a machine learning problem, defining success metrics, researching available data. Model development: data wrangling, feature engineering, model training, model testing and validation. Operations: model deployment, supporting operations and use, monitoring model performance. A dashed arrow leads from Operations back to the start, because monitoring can show the model has drifted and the loop begins again.',
  layouts: { wide: { size: [780, 350] }, tall: { size: [340, 700] } },
  setup(s) {
    const c = s.compact;
    const stages = [
      { tone: 'teal-t', title: '1  Design', items: [
        'defining the business\nproblem to be solved', 'refactoring the business\nproblem into a machine\nlearning problem',
        'defining success metrics', 'researching available data'] },
      { tone: 'sage-t', title: '2  Model development', items: [
        'data wrangling', 'feature engineering', 'model training', 'model testing and\nvalidation'] },
      { tone: 'plum-t', title: '3  Operations', items: [
        'model deployment', 'supporting operations/use', 'monitoring model\nperformance'] }
    ];
    const lineH = 17, gap = 9;
    const heightOf = st => 62 + st.items.reduce((n, t) => n + t.split('\n').length * lineH + gap, 0);
    const cardW = c ? 300 : 226;
    const boxes = [];
    let cursorY = 16;
    stages.forEach((st, i) => {
      const h = c ? heightOf(st) : 236;
      const x = c ? 8 : 12 + i * (cardW + 33);
      const y = c ? cursorY : 16;
      boxes.push({ x, y, w: cardW, h });
      cursorY += h + 36;
      s.el('rect', { x, y, width: cardW, height: h, rx: 16, class: 'f-' + st.tone + ' pa-card-edge' }, s.root).setAttribute('filter', 'url(#pa-cut)');
      s.text(s.root, st.title, { x: x + 18, y: y + 32, anchor: 'start', cls: 'pa-title', size: c ? 17 : 16 });
      let ty = y + 66;
      st.items.forEach(item => {
        s.el('circle', { cx: x + 22, cy: ty - 4, r: 3, class: 'pa-soft' }, s.root);
        s.text(s.root, item, { x: x + 34, y: ty, anchor: 'start', cls: 'pa-t', size: 13.5, lh: 17 / 13.5 });
        ty += item.split('\n').length * lineH + gap;
      });
    });
    // forward arrows between the stages
    for (let i = 0; i < 2; i++) {
      const a = boxes[i], b = boxes[i + 1];
      if (c) s.link(s.root, [a.x + a.w / 2, a.y + a.h], [b.x + b.w / 2, b.y], {});
      else s.link(s.root, [a.x + a.w, a.y + a.h / 2], [b.x, b.y + b.h / 2], {});
    }
    // the loop back: monitoring can send the team round again
    const first = boxes[0], last = boxes[2];
    if (c) {
      const rx = last.x + last.w + 16;
      s.link(s.root, [last.x + last.w, last.y + last.h / 2], [first.x + first.w, first.y + first.h / 2], {
        via: [[rx, last.y + last.h / 2], [rx, first.y + first.h / 2]], dashed: true, cls: 'is-bad'
      });
      s.text(s.root, 'Dashed arrow: monitoring finds drift,\nso the team goes round again.', { x: 170, y: last.y + last.h + 34, cls: 'pa-t pa-strong', size: 14, lh: 1.3 });
    } else {
      const by = last.y + last.h + 44;
      s.link(s.root, [last.x + last.w / 2, last.y + last.h], [first.x + first.w / 2, first.y + first.h], {
        via: [[last.x + last.w / 2, by], [first.x + first.w / 2, by]], dashed: true, cls: 'is-bad'
      });
      s.chip(s.root, 'monitoring finds drift: go round again', 390, by, { cls: 'pa-strong', size: 13 });
    }
  }
});
