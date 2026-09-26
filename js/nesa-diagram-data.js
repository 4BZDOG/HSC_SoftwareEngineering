/* ============================================================
   Structure charts and DFDs drawn by js/nesa-diagrams.js.
   Structure chart: modules{ id: { label, children[], decision, repeat } },
     couples[{ from, to, kind: 'data'|'flag', label, dir: 'down'|'up', side, at }].
   DFD: nodes{ id: { type: 'process'|'entity'|'store', x, y, label } },
     flows[{ from, to, label, bend, dx, dy }], size [w, h].
   ============================================================ */
window.HSC_NESA_DIAGRAMS = {
  'atm-structure': {
    type: 'structure',
    alt: 'Structure chart of an ATM system. The main module repeats until the card is removed and calls Authenticate user, Choose transaction and Process transaction. Process transaction calls Withdraw, Deposit or Check balance, one of them chosen by a decision. Card number is passed down to Authenticate user and a PIN valid flag comes back.',
    root: 'atm',
    modules: {
      atm: { label: 'ATM system', children: ['auth', 'choose', 'process'], repeat: 'until card\nremoved' },
      auth: { label: 'Authenticate\nuser', children: ['readcard', 'checkpin'] },
      readcard: { label: 'Read card' },
      checkpin: { label: 'Check PIN' },
      choose: { label: 'Choose\ntransaction' },
      process: { label: 'Process\ntransaction', children: ['withdraw', 'deposit', 'balance'], decision: true },
      withdraw: { label: 'Withdraw' },
      deposit: { label: 'Deposit' },
      balance: { label: 'Check balance' },
    },
    couples: [
      { from: 'atm', to: 'auth', kind: 'data', label: 'Card number', dir: 'down', side: 'right', at: 0.42 },
      { from: 'atm', to: 'auth', kind: 'flag', label: 'PIN valid', dir: 'up', side: 'left', at: 0.72 },
      { from: 'process', to: 'withdraw', kind: 'data', label: 'Amount', dir: 'down', side: 'left' },
      { from: 'process', to: 'withdraw', kind: 'flag', label: 'Funds OK', dir: 'up', side: 'right', at: 0.6 },
    ],
  },

  'student-structure': {
    type: 'structure',
    alt: 'Structure chart of a student management system. The main module calls Enrol student, Record attendance or Produce report, chosen by a decision. Enrol student calls Validate details and Save student, passing student details and a valid flag.',
    root: 'main',
    modules: {
      main: { label: 'Student\nmanagement', children: ['enrol', 'attend', 'report'], decision: true },
      enrol: { label: 'Enrol student', children: ['validate', 'save'] },
      validate: { label: 'Validate\ndetails' },
      save: { label: 'Save student' },
      attend: { label: 'Record\nattendance', children: ['mark'] },
      mark: { label: 'Mark each\nstudent' },
      report: { label: 'Produce report' },
    },
    couples: [
      { from: 'enrol', to: 'validate', kind: 'data', label: 'Details', dir: 'down', side: 'left' },
      { from: 'enrol', to: 'validate', kind: 'flag', label: 'Valid', dir: 'up', side: 'right', at: 0.62 },
      { from: 'enrol', to: 'save', kind: 'data', label: 'Student', dir: 'down', side: 'right' },
      { from: 'main', to: 'report', kind: 'data', label: 'Class code', dir: 'down', side: 'right' },
    ],
  },

  'library-structure': {
    type: 'structure',
    alt: 'Structure chart of a school library system, repeating until the library closes. It calls Borrowing and Returning. Borrowing calls Validate student and Process books, repeating until no more books. Returning calls Check book and Update files; an overdue flag is passed back from Check book.',
    root: 'lib',
    modules: {
      lib: { label: 'School library\nsystem', children: ['borrow', 'return'], repeat: 'until library\ncloses' },
      borrow: { label: 'Borrowing', children: ['validate', 'books'] },
      validate: { label: 'Validate\nstudent' },
      books: { label: 'Process books', repeat: 'until no\nmore books', children: ['info', 'update'] },
      info: { label: 'Book\ninformation' },
      update: { label: 'Update book and\nstudent files' },
      return: { label: 'Returning', children: ['check', 'files'] },
      check: { label: 'Check book' },
      files: { label: 'Update files' },
    },
    couples: [
      { from: 'borrow', to: 'validate', kind: 'data', label: 'Student ID', dir: 'down', side: 'left' },
      { from: 'borrow', to: 'validate', kind: 'flag', label: 'Valid student', dir: 'up', side: 'right', at: 0.62 },
      { from: 'books', to: 'info', kind: 'flag', label: 'Book available', dir: 'up', side: 'left' },
      { from: 'return', to: 'check', kind: 'data', label: 'Book details', dir: 'down', side: 'left' },
      { from: 'return', to: 'check', kind: 'flag', label: 'Overdue', dir: 'up', side: 'right', at: 0.62 },
    ],
  },

  'canteen-dfd': {
    type: 'dfd',
    size: [780, 400],
    alt: 'Level 1 data flow diagram of a canteen ordering system. The Student sends order details to process 1 Place order, which returns a receipt and stores the order in the Orders data store. Process 2 Prepare order reads orders from the store and sends an order list to Canteen staff, who send back a ready notice.',
    nodes: {
      student: { type: 'entity', x: 90, y: 100, label: 'Student' },
      place: { type: 'process', x: 320, y: 100, label: '1\nPlace order' },
      orders: { type: 'store', x: 320, y: 320, label: 'D1  Orders' },
      prepare: { type: 'process', x: 560, y: 260, label: '2\nPrepare order' },
      staff: { type: 'entity', x: 690, y: 90, label: 'Canteen staff' },
    },
    flows: [
      { from: 'student', to: 'place', label: 'Order details', bend: 34 },
      { from: 'place', to: 'student', label: 'Receipt', bend: 34 },
      { from: 'place', to: 'orders', label: 'New order', bend: 30 },
      { from: 'orders', to: 'prepare', label: 'Order to make', bend: 30 },
      { from: 'prepare', to: 'staff', label: 'Order list', bend: 30 },
      { from: 'staff', to: 'prepare', label: 'Ready notice', bend: 30 },
    ],
  },

  'library-dfd-level0': {
    type: 'dfd',
    size: [760, 380],
    alt: 'Level 0 data flow diagram of a library system: one process, the library system, exchanging data with three external entities. Students send loan requests and receive loan receipts; Librarians send new book details and receive overdue reports; the School admin system sends student enrolments.',
    nodes: {
      sys: { type: 'process', x: 380, y: 190, r: 70, label: 'Library\nsystem' },
      student: { type: 'entity', x: 100, y: 90, label: 'Student' },
      librarian: { type: 'entity', x: 660, y: 90, label: 'Librarian' },
      admin: { type: 'entity', x: 380, y: 340, label: 'School admin\nsystem' },
    },
    flows: [
      { from: 'student', to: 'sys', label: 'Loan request', bend: 30 },
      { from: 'sys', to: 'student', label: 'Loan receipt', bend: 30 },
      { from: 'librarian', to: 'sys', label: 'New book details', bend: 30 },
      { from: 'sys', to: 'librarian', label: 'Overdue report', bend: 30 },
      { from: 'admin', to: 'sys', label: 'Student enrolments', bend: 20 },
    ],
  },

  'web-dfd': {
    type: 'dfd',
    size: [780, 420],
    alt: 'Data flow diagram of a web application. The User sends form data to process 1 Handle request on the web server. It sends a query to process 2 Query database, which reads and writes the Products data store and returns results. Process 1 passes page data to process 3 Build page, which sends an HTML page back to the user.',
    nodes: {
      user: { type: 'entity', x: 90, y: 200, label: 'User\n(browser)' },
      handle: { type: 'process', x: 300, y: 100, label: '1\nHandle\nrequest' },
      query: { type: 'process', x: 540, y: 100, label: '2\nQuery\ndatabase' },
      build: { type: 'process', x: 420, y: 320, label: '3\nBuild page' },
      products: { type: 'store', x: 670, y: 290, label: 'D1  Products' },
    },
    flows: [
      { from: 'user', to: 'handle', label: 'Form data', bend: 24, dx: -30, dy: -10 },
      { from: 'handle', to: 'query', label: 'Search terms', bend: 24 },
      { from: 'query', to: 'products', label: 'SQL query', bend: 24 },
      { from: 'products', to: 'query', label: 'Rows', bend: 24 },
      { from: 'query', to: 'build', label: 'Results', bend: 24 },
      { from: 'build', to: 'user', label: 'HTML page', bend: 30 },
    ],
  },
};
