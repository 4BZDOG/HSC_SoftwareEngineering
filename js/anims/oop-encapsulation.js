/* Still diagram (concept): encapsulation, what outside code can reach.
   The Object-Oriented Paradigm › Encapsulation. */
HSCAnim.define('oop-encapsulation', {
  still: true,
  title: 'Concept diagram: encapsulation',
  alt: 'Outside code can call the public methods deposit(), withdraw() and get_balance() of a BankAccount object. It cannot reach the private data __balance and __pin directly. The methods validate each request, then update the private data.',
  layout: { size: [760, 360], minWidth: 600 },
  setup(s) {
    s.el('rect', { x: 250, y: 20, width: 496, height: 320, rx: 18, class: 'f-sheet pa-card-edge' }, s.back).setAttribute('filter', 'url(#pa-cut)');
    const L = s.g(s.back);
    s.folk(s.root, { at: { x: 90, y: 300 }, tone: 'teal', name: 'outside code' });
    s.text(s.root, 'BankAccount object', { x: 498, y: 50, cls: 'pa-title' });
    const methods = ['deposit()', 'withdraw()', 'get_balance()'].map((t, i) => s.node(s.root, { x: 340, y: 110 + i * 70, w: 150, h: 44, shape: 'card', tone: 'sage-t', text: t, cls: 'pa-mono', size: 14 }));
    s.text(s.root, 'public methods', { x: 340, y: 330, cls: 'pa-name', size: 13 });
    const vault = s.node(s.root, { x: 620, y: 180, w: 170, h: 96, shape: 'card', tone: 'mustard-t', text: '__balance\n__pin', cls: 'pa-mono', size: 15 });
    s.padlock(s.root, { at: { x: 620, y: 120, s: 1.4 }, tone: 'mustard' });
    s.text(s.root, 'private data', { x: 620, y: 250, cls: 'pa-name', size: 13 });
    methods.forEach((m, i) => {
      s.link(L, [118, 262 - (2 - i) * 4], m, { from: 'right', to: 'left', via: [[190, 262 - (2 - i) * 4], [190, m.box.y]] });
      s.link(L, m, vault, { from: 'right', to: 'left', toOff: (i - 1) * 22 });
    });
    s.chip(s.root, 'calls', 190, 180);
    s.chip(s.root, 'validates, then updates', 485, 290);
    s.link(L, [118, 300], [248, 300], { from: 'right', to: 'left', dashed: true, head: false, cls: 'is-bad' });
    s.mark(s.root, false, { at: { x: 250, y: 300 }, r: 12 });
    s.text(s.root, 'cannot reach\nprivate data', { x: 184, y: 270, cls: 'pa-t-xs is-bad pa-strong', lh: 1.2 });
  }
});
