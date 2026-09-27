/* Still diagram (concept): procedural and object-oriented code, and what they share.
   The Object-Oriented Paradigm › Comparing paradigms. */
HSCAnim.define('oop-vs-proc', {
  still: true,
  title: 'Concept diagram: procedural and object-oriented code',
  alt: 'Procedural code: functions operate on separate, global data; top-down design focused on how; for example C, Pascal and procedural Python. Object-oriented code: classes bundle data with methods; built on encapsulation, inheritance, polymorphism and abstraction; for example Java, Python, C++ and C#. Both aim for modularity and reuse, maintainability, and testability.',
  layouts: { wide: { size: [780, 400] }, tall: { size: [400, 980] } },
  setup(s) {
    const c = s.compact;
    const cols = [
      { t: 'Procedural', tone: 'teal-t', items: ['Functions act on\nseparate, global data', 'Top-down design:\nfocus on how', 'C · Pascal ·\nprocedural Python'] },
      { t: 'Shared goals', tone: 'plum-t', items: ['Modularity\nand reuse', 'Maintainability', 'Testing and\ndebugging'] },
      { t: 'Object-oriented', tone: 'sage-t', items: ['Classes bundle\ndata + methods', 'Encapsulation · inheritance\npolymorphism · abstraction', 'Java · Python ·\nC++ · C#'] }
    ];
    cols.forEach((col, i) => {
      const [x, y, w, h] = c ? [12, 10 + i * 324, 376, 300] : [10 + i * 260, 10, 240, 380];
      s.el('rect', { x, y, width: w, height: h, rx: 14, class: 'f-' + col.tone + ' pa-card-edge' }, s.back).setAttribute('filter', 'url(#pa-cut)');
      s.text(s.root, col.t, { x: x + w / 2, y: y + 30, cls: 'pa-title' });
      col.items.forEach((t, j) => s.node(s.root, { x: x + w / 2, y: y + (c ? 90 : 100) + j * (c ? 72 : 96), w: w - 40, h: 60, shape: 'card', tone: 'paper', text: t, size: 13.5 }));
    });
    if (!c) [250, 510].forEach(x => s.chip(s.root, '↔', x, 200));
  }
});
