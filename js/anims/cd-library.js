/* Still diagram (class diagram): a library system.
   The Object-Oriented Paradigm › Modelling OOP solutions. */
HSCAnim.define('cd-library', {
  still: true,
  title: 'Class diagram: a library system',
  alt: 'Class diagram. A Library holds zero or more Books and zero or more Members (1 to 0..*). A Member borrows zero or more Books; each Book is borrowed by at most one Member (0..1 to 0..*). Private attributes are marked with a minus and public methods with a plus.',
  layout: { size: [780, 560], minWidth: 640 },
  setup(s) {
    const L = s.g(s.back);
    const lib = s.classBox(s.root, { x: 390, y: 110, w: 250, name: 'Library', attrs: ['- books: list', '- members: list'], methods: ['+ add_book(book): void', '+ register_member(m): void', '+ search(query): list'] });
    const book = s.classBox(s.root, { x: 150, y: 410, w: 250, name: 'Book', tone: 'sage-t', attrs: ['- isbn: String', '- title: String', '- author: String', '- available: bool'], methods: ['+ checkout(): bool', '+ return_book(): void', '+ get_details(): dict'] });
    const mem = s.classBox(s.root, { x: 630, y: 410, w: 250, name: 'Member', tone: 'mustard-t', attrs: ['- member_id: int', '- name: String', '- email: String', '- borrowed_books: list'], methods: ['+ borrow(book): bool', '+ return_book(book): void', '+ get_history(): list'] });
    s.link(L, lib, book, { from: 'left', to: 'top', label: 'holds', marker: 'pa-rel' });
    s.link(L, lib, mem, { from: 'right', to: 'top', label: 'registers', marker: 'pa-rel' });
    s.link(L, mem, book, { from: 'left', to: 'right', label: 'borrows', marker: 'pa-rel' });
    const m = (t, x, y, a) => s.text(s.root, t, { x, y, anchor: a || 'start', cls: 'pa-mult' });
    m('1', 256, 98, 'end'); m('0..*', 160, 312);
    m('1', 524, 98); m('0..*', 640, 312);
    m('0..1', 498, 398, 'end'); m('0..*', 282, 398);
    s.text(s.root, '- private   + public', { x: 770, y: 552, anchor: 'end', cls: 'pa-name', size: 12.5 });
  }
});
