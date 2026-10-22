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
  'conti-dfd-level0': {
    type: 'dfd',
    size: [820, 420],
    alt: 'Level 0 data flow diagram of the HSE IT systems as one process. The Conti attack group sends a phishing email with a malicious attachment. HSE staff send logins and requests and receive system responses. The system sends incident reports to the NCSC and the Department of Health, which send back advice and alerts.',
    nodes: {
      attacker: { type: 'entity', x: 110, y: 90, label: 'Conti attack\ngroup' },
      sys: { type: 'process', x: 410, y: 210, r: 80, label: 'HSE IT\nsystems' },
      staff: { type: 'entity', x: 710, y: 90, label: 'HSE staff' },
      agencies: { type: 'entity', x: 410, y: 370, label: 'NCSC and\nDepartment\nof Health' },
    },
    flows: [
      { from: 'attacker', to: 'sys', label: 'Phishing email\nwith attachment', bend: 30 },
      { from: 'staff', to: 'sys', label: 'Logins and\nrequests', bend: 30 },
      { from: 'sys', to: 'staff', label: 'System\nresponses', bend: 30 },
      { from: 'sys', to: 'agencies', label: 'Incident reports', bend: 20 },
      { from: 'agencies', to: 'sys', label: 'Advice and alerts', bend: 20 },
    ],
  },

  'conti-dfd-level1': {
    type: 'dfd',
    size: [980, 520],
    alt: 'Level 1 data flow diagram of the compromised path. The attacker sends a phishing email with an Excel file to an HSE staff member. The staff member opens the attachment in process 1, which passes a remote access tool to process 2, Move across network. Process 2 reads account details from D1 Active Directory and runs commands that pass to process 3, Encrypt files, which writes encrypted files to D2 Files and records. Process 4, Recover systems, takes clean copies from D3 Offsite backups and writes restored files to D2.',
    nodes: {
      attacker: { type: 'entity', x: 90, y: 110, label: 'Attacker' },
      staff: { type: 'entity', x: 330, y: 110, label: 'HSE staff\nmember' },
      p1: { type: 'process', x: 570, y: 110, label: '1\nOpen\nattachment' },
      p2: { type: 'process', x: 800, y: 110, label: '2\nMove across\nnetwork' },
      d1: { type: 'store', x: 800, y: 290, label: 'D1  Active\nDirectory' },
      p3: { type: 'process', x: 570, y: 290, label: '3\nEncrypt\nfiles' },
      d2: { type: 'store', x: 330, y: 290, label: 'D2  Files and\nrecords' },
      d3: { type: 'store', x: 570, y: 440, label: 'D3  Offsite\nbackups' },
      p4: { type: 'process', x: 330, y: 440, label: '4\nRecover\nsystems' },
    },
    flows: [
      { from: 'attacker', to: 'staff', label: 'Phishing email\nwith Excel file', bend: 0 },
      { from: 'staff', to: 'p1', label: 'Opens attachment', bend: 0 },
      { from: 'p1', to: 'p2', label: 'Remote access tool', bend: 0 },
      { from: 'd1', to: 'p2', label: 'Account details', bend: 0 },
      { from: 'p2', to: 'p3', label: 'Commands run\non endpoints', bend: 0 },
      { from: 'p3', to: 'd2', label: 'Encrypted files', bend: 0 },
      { from: 'd3', to: 'p4', label: 'Clean backup copies', bend: 0 },
      { from: 'p4', to: 'd2', label: 'Restored files', bend: 0 },
    ],
  },

  'conti-structure': {
    type: 'structure',
    alt: 'Structure chart of a containment and recovery response to a ransomware incident, repeating until systems are clean. It calls Detect and confirm, Contain the incident and Recover systems. Contain the incident calls Isolate domain controllers and, optionally, Shut down wider systems. Recover systems calls Rebuild in a clean VLAN and Restore from offsite backups. A ransomware confirmed flag comes back from Detect and confirm, and a backups clean flag comes back from Restore from offsite backups.',
    root: 'respond',
    modules: {
      respond: { label: 'Respond to\nransomware\nincident', children: ['detect', 'contain', 'recover'], repeat: 'until systems\nare clean' },
      detect: { label: 'Detect and\nconfirm' },
      contain: { label: 'Contain the\nincident', children: ['isolate', 'shutdown'], decision: true },
      isolate: { label: 'Isolate domain\ncontrollers' },
      shutdown: { label: 'Shut down\nwider systems' },
      recover: { label: 'Recover\nsystems', children: ['rebuild', 'restore'] },
      rebuild: { label: 'Rebuild in a\nclean VLAN' },
      restore: { label: 'Restore from\noffsite backups' },
    },
    couples: [
      { from: 'respond', to: 'detect', kind: 'data', label: 'Alert details', dir: 'down', side: 'left' },
      { from: 'respond', to: 'detect', kind: 'flag', label: 'Ransomware\nconfirmed', dir: 'up', side: 'right', at: 0.62 },
      { from: 'recover', to: 'restore', kind: 'flag', label: 'Backups\nclean', dir: 'up', side: 'right', at: 0.62 },
    ],
  },
};
