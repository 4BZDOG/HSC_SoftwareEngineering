/* Still diagram (class diagram): the Riverbend Library lending system.
   The Object-Oriented Paradigm › Representing a system. NESA Course Specifications notation:
   three-part class boxes, a filled-arrowhead inheritance arrow to the parent (NESA notation), labelled
   relationship arrows, and a multiplicity at the end of each class it counts. */
HSCAnim.define('oop-loans', {
  still: true,
  title: 'Class diagram: the Riverbend Library lending system',
  alt: 'Class diagram. Book and DVD inherit from LibraryItem, and ReferenceBook inherits from Book. LibraryItem has itemId, title and onLoan, and methods loanDays(), checkOut(), checkIn() and describe(). A Library holds zero or more LibraryItems (1..1 to 0..*) and registers zero or more Members (1..1 to 0..*). A Member borrows zero to three LibraryItems (0..1 to 0..3): each item is on loan to at most one member, and a member can have up to three items.',
  layout: { size: [800, 780], minWidth: 640 },
  setup(s) {
    const L = s.g(s.back);
    const lib = s.classBox(s.root, { x: 175, y: 105, w: 250, name: 'Library', attrs: ['items: dictionary', 'members: dictionary'], methods: ['addItem(item)', 'join(member)', 'checkout(memberId, itemId)'] });
    const mem = s.classBox(s.root, { x: 625, y: 105, w: 250, name: 'Member', tone: 'mustard-t', attrs: ['memberId: string', 'name: string', 'email: string'], methods: ['borrow(item)', 'giveBack(item)'] });
    const item = s.classBox(s.root, { x: 400, y: 340, w: 250, name: 'LibraryItem', attrs: ['itemId: string', 'title: string', 'onLoan: boolean'], methods: ['loanDays()', 'checkOut()', 'checkIn()', 'describe()'] });
    const book = s.classBox(s.root, { x: 250, y: 570, w: 250, name: 'Book', tone: 'sage-t', attrs: ['author: string'], methods: ['loanDays()', 'describe()'] });
    const dvd = s.classBox(s.root, { x: 590, y: 570, w: 230, name: 'DVD', tone: 'sage-t', attrs: ['minutes: integer'], methods: ['loanDays()', 'describe()'] });
    const ref = s.classBox(s.root, { x: 250, y: 715, w: 250, name: 'ReferenceBook', tone: 'sage-t', attrs: [], methods: ['checkOut()'] });
    // inheritance: filled arrowhead at the parent (NESA notation)
    [book, dvd].forEach(k => s.link(L, k, item, { from: 'top', to: 'bottom', mid: 480, marker: 'pa-inherit' }));
    s.link(L, ref, book, { from: 'top', to: 'bottom', marker: 'pa-inherit' });
    s.text(s.root, 'inherits from', { x: 415, y: 470, anchor: 'start', cls: 'pa-name', size: 13 });
    // relationships
    s.link(L, lib, item, { from: 'bottom', to: 'left', label: 'holds', marker: 'pa-rel', dx: -40, dy: 0 });
    s.link(L, lib, mem, { from: 'right', to: 'left', label: 'registers', marker: 'pa-rel' });
    s.link(L, mem, item, { from: 'bottom', to: 'right', label: 'borrows', marker: 'pa-rel', dx: 40, dy: 0 });
    const m = (t, x, y, a) => s.text(s.root, t, { x, y, anchor: a || 'start', cls: 'pa-mult' });
    m('1..1', 185, 200);  m('0..*', 258, 322, 'end');
    m('1..1', 310, 92);   m('0..*', 490, 92, 'end');
    m('0..1', 635, 200);  m('0..3', 542, 322);
  }
});
