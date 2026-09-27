/* Still diagram (architecture): traditional and headless CMS.
   Programming for the Web › Web content management systems. */
(() => {
  function panel(s, x, y, w, h, title, tone) {
    s.el('rect', { x, y, width: w, height: h, rx: 12, class: 'f-' + tone }, s.back).setAttribute('filter', 'url(#pa-cut)');
    s.text(s.root, title, { x: x + w / 2, y: y + 28, cls: 'pa-title' });
  }
  HSCAnim.define('cms-architecture', {
    still: true,
    title: 'Architecture diagram: traditional and headless CMS',
    alt: 'Traditional CMS: the admin UI, the back end (database and logic) and the front-end theme are tightly coupled in one system. Headless CMS: the admin UI feeds a back-end API, which serves content as JSON to any front end: a website, a mobile app or an IoT dashboard.',
    layouts: {
      wide: { size: [780, 470], a: [12, 12, 300, 446], b: [328, 12, 440, 446] },
      tall: { size: [400, 930], a: [10, 10, 380, 400], b: [10, 426, 380, 494] }
    },
    setup(s) {
      const [ax, ay, aw, ah] = s.L.a, [bx, by, bw, bh] = s.L.b;
      panel(s, ax, ay, aw, ah, 'Traditional CMS', 'terra-t');
      panel(s, bx, by, bw, bh, 'Headless CMS', 'sage-t');
      const cardW = Math.min(230, aw - 50);

      // Traditional: one stack, glued together
      const tx = ax + aw / 2;
      const t1 = s.node(s.root, { x: tx, y: ay + 90, w: cardW, h: 56, shape: 'card', tone: 'paper', text: 'Admin UI\nbuild, edit, publish' });
      const t2 = s.node(s.root, { x: tx, y: ay + 205, w: cardW, h: 56, shape: 'card', tone: 'mustard-t', text: 'Back end\ndatabase + logic' });
      const t3 = s.node(s.root, { x: tx, y: ay + 320, w: cardW, h: 56, shape: 'card', tone: 'blush-t', text: 'Front end\ntheme: HTML + CSS' });
      s.link(s.root, t1, t2, { label: 'tightly coupled' });
      s.link(s.root, t2, t3, { label: 'tightly coupled' });
      s.text(s.root, 'One system: content and\npresentation live together.', { x: tx, y: ay + ah - 44, cls: 'pa-name', size: 13, lh: 1.3 });

      // Headless: an API feeding any front end
      const hx = bx + bw / 2;
      const h1 = s.node(s.root, { x: hx, y: by + 90, w: 230, h: 56, shape: 'card', tone: 'paper', text: 'Admin UI\nbuild, edit, publish' });
      const h2 = s.node(s.root, { x: hx, y: by + 205, w: 230, h: 56, shape: 'card', tone: 'mustard-t', text: 'Back-end API\ndatabase + logic' });
      s.link(s.root, h1, h2, { label: 'decoupled' });
      const fronts = ['Website\nReact, Vue…', 'Mobile app\niOS, Android', 'IoT dashboard\ndevice screen'];
      const fw = s.compact ? 112 : 128, gap = (bw - 3 * fw) / 4;
      fronts.forEach((t, i) => {
        const fx = bx + gap + fw / 2 + i * (fw + gap);
        const f = s.node(s.root, { x: fx, y: by + 350, w: fw, h: 56, shape: 'card', tone: 'blush-t', text: t, size: 13 });
        s.link(s.root, h2, f, { mid: by + 280 });
      });
      s.chip(s.root, 'JSON API', hx, by + 280);
      s.text(s.root, 'Content is stored once and\nserved to any front end.', { x: hx, y: by + bh - 44, cls: 'pa-name', size: 13, lh: 1.3 });
    }
  });
})();
